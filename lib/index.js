/**
 * Host half of the token-usage plugin.
 *
 * Serves one read-only JSON report of token usage and cost per local day and
 * per model, aggregated from the harness' own persisted sessions.
 *
 * - Data source: the public `sessionQuery` service (live-first, format-migrating,
 *   replay-validated). The fold lives in ./aggregate.mjs and mirrors the
 *   harness' `tokenUsage` projection replacement rules, so retried attempts are
 *   not double-charged.
 * - Transport: an exact `/api` Fetch route owned by `connection`, which already
 *   enforces the Host/Origin fence, the browser session cookie and the owner
 *   principal. The browser calls it same-origin, so no token handling is needed.
 * - Money: the harness records no currency pricing anywhere, so prices come from
 *   ./prices.json (per 1,000,000 tokens). Models without an entry are reported
 *   as unpriced instead of being silently costed at zero.
 *
 * @module dsh-token-usage
 */
import { copyFileSync, existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { attributeSession, reportFromSessions } from './aggregate.mjs'

export const name = 'token-usage'

/**
 * Services this plugin reads. `sessionPersistence` is looked up through
 * `ctx.get()` (optional) as the cheap change detector for the per-session
 * cache; Cordis only normalizes array/map `inject` declarations, so it is not
 * listed here.
 */
export const inject = ['connection', 'sessionQuery']

/** Route path; `/api` exact routes are the first-party extension point. */
const ROUTE = '/api/token-usage/daily'

/**
 * Build marker echoed in every response. The page shows it, so a stale host
 * entry (code on disk newer than the running module) is visible instead of
 * being mistaken for a pricing bug.
 */
const BUILD = 'token-usage-10-prices'

/** Whole-report cache window; a manual refresh bypasses it. */
const CACHE_TTL_MS = 60_000

const CURRENCY_FALLBACK = 'CNY'

/** JSON response with the cache headers this endpoint promises. */
function json(value, status = 200) {
  return Response.json(value, {
    status,
    headers: { 'cache-control': 'no-store' },
  })
}

/** Absolute path of the DSH home that owns the user-editable files. */
function dshHome() {
  return process.env.DSH_HOME !== undefined && process.env.DSH_HOME !== '' ? process.env.DSH_HOME : join(homedir(), '.dsh')
}

/** The packaged sample price table. */
function packagedPricesPath() {
  return fileURLToPath(new URL('../prices.json', import.meta.url))
}

/**
 * Load the price table, in priority order:
 *   1. `config.pricesFile` (explicit profile configuration),
 *   2. `$DSH_HOME/token-usage-prices.json` — user-owned, survives plugin updates,
 *   3. the packaged `prices.json` (seeded into the user path on first run).
 */
function loadPrices(file) {
  if (file !== undefined) return { prices: JSON.parse(readFileSync(file, 'utf8')), file }
  const packaged = packagedPricesPath()
  const user = join(dshHome(), 'token-usage-prices.json')
  if (existsSync(user)) return { prices: JSON.parse(readFileSync(user, 'utf8')), file: user }
  // Seed once so the table is editable without touching node_modules and is not
  // overwritten by a plugin update; a failed seed just falls back to the package copy.
  let seeded = false
  try {
    copyFileSync(packaged, user)
    seeded = true
  } catch {
    seeded = false
  }
  return { prices: JSON.parse(readFileSync(packaged, 'utf8')), file: seeded ? user : packaged }
}
/**
 * Mount the report route.
 * @param {import('@deepseek-ai/cordis').Context} ctx host plugin context
 * @param {{ pricesFile?: string, timeZone?: string, cacheTtlMs?: number }} [config]
 */
export function apply(ctx, config = {}) {
  const ttl = config.cacheTtlMs ?? CACHE_TTL_MS
  let cache = { at: 0, report: undefined }
  let inflight
  // The file the last build actually read; reported to the UI so users know
  // which price table is in effect.
  let pricesFile = config.pricesFile ?? join(dshHome(), 'token-usage-prices.json')
  /**
   * Per-session fold cache: settlements are the expensive part (decode plus
   * replay validation of the persisted log), so a session whose byte size has
   * not changed is reused instead of re-read. The time zone is part of the key
   * because settlements already carry their local day.
   */
  const sessionCache = new Map()

  /** Byte size of a persisted session, or undefined when stat is unavailable. */
  const sizeOf = async (id, signal) => {
    let persistence
    try {
      persistence = ctx.get('sessionPersistence')
    } catch {
      persistence = undefined
    }
    if (persistence === undefined || persistence === null) return undefined
    try {
      const stat = await persistence.stat(id, { signal })
      return stat?.sizeBytes
    } catch {
      return undefined
    }
  }

  /**
   * Rebuild the whole report from the persisted session corpus.
   * `range` carries inclusive local day bounds; it filters settlements, so a
   * long session only contributes the usage that happened inside the range.
   */
  const build = async (timeZone, signal, range = {}) => {
    // Read the price file per build so editing prices takes effect on the next
    // refresh without restarting the plugin entry.
    const loaded = loadPrices(config.pricesFile)
    const { prices } = loaded
    pricesFile = loaded.file
    const records = await ctx.sessionQuery.listSessions(signal)
    const sessions = []
    const liveKeys = new Set()
    let reused = 0
    for (const record of records) {
      signal?.throwIfAborted()
      const id = record.header?.id
      try {
        const size = await sizeOf(id, signal)
        const key = `${timeZone}\u0000${id}\u0000${size ?? 'unknown'}`
        if (size !== undefined) liveKeys.add(key)
        const cached = size === undefined ? undefined : sessionCache.get(key)
        if (cached !== undefined) {
          reused += 1
          sessions.push(cached)
          continue
        }
        const { events } = await ctx.sessionQuery.readSession(id)
        const titleEvent = [...events].reverse().find(event => event.type === 'session/title')
        const entry = {
          id,
          title: titleEvent?.data?.title,
          header: record.header,
          settlements: attributeSession(events, { timeZone }),
        }
        if (size !== undefined) sessionCache.set(key, entry)
        sessions.push(entry)
      } catch (error) {
        // A corrupt or mid-migration log must not take the whole report down.
        ctx.logger?.warn?.(`token-usage: cannot read ${String(id)}: ${String(error?.message ?? error)}`)
        sessions.push({ id, header: record.header, events: [], error: String(error?.code ?? error?.message ?? error) })
      }
    }
    // Drop entries for sessions that no longer exist at their recorded size.
    for (const key of [...sessionCache.keys()]) {
      if (!liveKeys.has(key)) sessionCache.delete(key)
    }
    const report = reportFromSessions(sessions, { prices, timeZone, since: range.since, until: range.until })
    report.cacheStats = { sessions: sessions.length, reused, folded: sessions.length - reused, cachedSessions: sessionCache.size }
    return report
  }

  ctx.effect(() => ctx.connection.fetch.register({
    path: ROUTE,
    methods: ['GET'],
    requestBody: 'buffered',
    fetch: async (request) => {
      const url = new URL(request.url)
      const timeZone = url.searchParams.get('tz') ?? config.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
      const refresh = url.searchParams.get('refresh') === '1'
      const day = (name) => {
        const value = url.searchParams.get(name)
        if (value === null) return undefined
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError(`invalid ${name}: ${value}`)
        return value
      }
      try {
        const since = day('since')
        const until = day('until')
        const ranged = since !== undefined || until !== undefined
        // A ranged report is cheap (per-session folds are cached) and must not
        // reuse the whole-corpus response, so it never touches the report cache.
        if (!ranged && !refresh && cache.report !== undefined && Date.now() - cache.at < ttl) {
          return json({ ...cache.report, pricesFile, build: BUILD, cached: true })
        }
        if (ranged) {
          const report = await build(timeZone, request.signal, { since, until })
          return json({ ...report, currency: report.currency ?? CURRENCY_FALLBACK, pricesFile, build: BUILD, cached: false })
        }
        inflight ??= build(timeZone, request.signal).finally(() => { inflight = undefined })
        const report = await inflight
        cache = { at: Date.now(), report }
        return json({ ...report, currency: report.currency ?? CURRENCY_FALLBACK, pricesFile, build: BUILD, cached: false })
      } catch (error) {
        request.signal?.throwIfAborted?.()
        if (error instanceof RangeError) {
          return json({ error: { code: 'token-usage/invalid-range', message: error.message } }, 400)
        }
        ctx.logger?.warn?.(`token-usage: report failed: ${String(error?.stack ?? error)}`)
        return json({ error: { code: 'token-usage/aggregate-failed', message: String(error?.message ?? error) } }, 500)
      }
    },
  }), 'token-usage: report route')
}
