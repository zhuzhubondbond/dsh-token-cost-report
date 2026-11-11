/**
 * Aggregates DSH session logs into per-day × per-model token usage and cost.
 *
 * Data source: <DSH_HOME>/sessions/<workspace>/<session-id>/session.v4.jsonl.zstd
 * A log file is the concatenation of independent zstd frames; the first frame
 * decodes to the `session` header record and every later frame appends a batch
 * of JSONL events. Decoding frame by frame (split at the zstd magic number)
 * gives the full event stream.
 *
 * Attribution rules mirror the harness' own tokenUsage projection:
 *  - a settlement is `assistant/message` (final) or `assistant/attempt`
 *    (an attempt that produced no final message, e.g. a failed retry);
 *  - samples are keyed by (turn, step) and replace each other, so a retry that
 *    settles adds a further charge;
 *  - `llm/retry-started` closes the replacement slot of its (turn, step);
 *  - the model is the one named by the newest `request/header` (falling back to
 *    `model/selection`) before the settlement.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename, dirname } from 'node:path'
import { zstdDecompressSync } from 'node:zlib'

const ZSTD_MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd])

/** Every token bucket this report keeps. Input is uncached input only. */
export const EMPTY_TOKENS = Object.freeze({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 })

/**
 * Decode a DSH session log (multi-frame zstd) into its event records.
 * @param {string} file absolute path of session.v4.jsonl.zstd
 * @returns {Array<Record<string, any>>} parsed events, header record included
 */
export function readSessionEvents(file) {
  const buf = readFileSync(file)
  const cuts = []
  for (let i = buf.indexOf(ZSTD_MAGIC, 0); i !== -1; i = buf.indexOf(ZSTD_MAGIC, i + 1)) cuts.push(i)
  cuts.push(buf.length)
  const chunks = []
  for (let f = 0; f + 1 < cuts.length; f += 1) {
    if (cuts[f + 1] <= cuts[f]) continue
    chunks.push(zstdDecompressSync(buf.subarray(cuts[f], cuts[f + 1])).toString('utf8'))
  }
  const events = []
  for (const line of chunks.join('').split('\n')) {
    if (!line.trim()) continue
    try { events.push(JSON.parse(line)) } catch { /* corrupt tail line, skip */ }
  }
  return events
}

/**
 * Token buckets reported by one settlement event, or undefined when absent.
 * @param {Record<string, any>} event
 */
function usageOf(event) {
  const sample = event.type === 'assistant/message'
    ? event.data?.usage
    : lastUsageChunk(event.data?.stream)
  if (!sample) return undefined
  return {
    input: sample.inputTokens ?? 0,
    output: sample.outputTokens ?? 0,
    cacheRead: sample.cacheReadTokens ?? 0,
    cacheWrite: sample.cacheWriteTokens ?? 0,
  }
}

/**
 * Provider usage carried by the last usage chunk of a streamed attempt.
 * @param {Array<Record<string, any>> | undefined} stream
 */
function lastUsageChunk(stream) {
  if (!Array.isArray(stream)) return undefined
  for (let i = stream.length - 1; i >= 0; i -= 1) {
    const chunk = stream[i]?.chunk
    if (chunk?.type === 'usage' && chunk.usage) return chunk.usage
  }
  return undefined
}

const same = (a, b) => a.input === b.input && a.output === b.output
  && a.cacheRead === b.cacheRead && a.cacheWrite === b.cacheWrite

const add = (a, b) => ({
  input: a.input + b.input,
  output: a.output + b.output,
  cacheRead: a.cacheRead + b.cacheRead,
  cacheWrite: a.cacheWrite + b.cacheWrite,
})

/**
 * Attribute one session's usage to (day, model) buckets.
 * @param {Array<Record<string, any>>} events
 * @param {{ timeZone?: string }} options
 */
export function attributeSession(events, options = {}) {
  const tz = options.timeZone
  let provider = 'unknown'
  let model = 'unknown'
  /** @type {Map<string, { input: number, output: number, cacheRead: number, cacheWrite: number }>} */
  const slots = new Map()
  const out = []

  const current = () => ({ provider, model })
  const push = (event) => {
    const usage = usageOf(event)
    if (!usage) return
    if (usage.input === 0 && usage.output === 0 && usage.cacheRead === 0 && usage.cacheWrite === 0) return
    const turn = event.data?.turn ?? 0
    const step = event.data?.step ?? 0
    const key = `${turn}:${step}`
    const previous = slots.get(key)
    if (previous && same(previous, usage)) return
    slots.set(key, usage)
    const day = dayOf(event.time, tz)
    const route = current()
    out.push({ day, provider: route.provider, model: route.model, tokens: usage, time: event.time })
  }

  for (const event of events) {
    if (event.type === 'request/header') {
      const config = event.data?.header?.config
      if (config?.provider) provider = config.provider
      if (config?.model) model = config.model
      continue
    }
    if (event.type === 'model/selection') {
      const selection = event.data?.lastUsed ?? event.data?.selection ?? event.data
      if (selection?.provider) provider = selection.provider
      if (selection?.model) model = selection.model
      continue
    }
    if (event.type === 'llm/retry-started') {
      slots.delete(`${event.data?.turn ?? 0}:${event.data?.step ?? 0}`)
      continue
    }
    if (event.type === 'assistant/message' || event.type === 'assistant/attempt') push(event)
  }
  return out
}

/**
 * Local calendar day (YYYY-MM-DD) of an epoch-millisecond instant.
 * @param {number} epochMs
 * @param {string | undefined} timeZone IANA zone; system zone when omitted
 */
export function dayOf(epochMs, timeZone) {
  const date = new Date(epochMs ?? Date.now())
  if (!timeZone) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const value = Object.fromEntries(parts.map(p => [p.type, p.value]))
  return `${value.year}-${value.month}-${value.day}`
}

/**
 * Enumerate every session log below a DSH home directory.
 * @param {string} homeDir e.g. C:\\Users\\x\\.dsh
 */
export function listSessionLogs(homeDir) {
  const root = join(homeDir, 'sessions')
  const files = []
  for (const workspace of safeReaddir(root)) {
    const workspaceDir = join(root, workspace)
    for (const session of safeReaddir(workspaceDir)) {
      const log = join(workspaceDir, session, 'session.v4.jsonl.zstd')
      try { if (statSync(log).isFile()) files.push(log) } catch { /* not a session */ }
    }
  }
  return files
}

function safeReaddir(dir) {
  try { return readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name) } catch { return [] }
}

/**
 * Price table lookup. Prices are quoted per 1,000,000 tokens in `currency`.
 * A model entry may omit `cacheRead`/`cacheWrite` to inherit the input rate.
 * @param {Record<string, any>} prices
 * @param {string} provider
 * @param {string} model
 */
export function priceOf(prices, provider, model) {
  const routes = prices?.providers ?? {}
  const route = routes[provider]
  const entry = route?.models?.[model] ?? prices?.fallback
  if (!entry) return undefined
  // A template entry that still has null rates is "not configured", not free.
  if (entry.input === null || entry.input === undefined || entry.output === null || entry.output === undefined) return undefined
  const input = Number(entry.input)
  if (!Number.isFinite(input)) return undefined
  const output = Number(entry.output)
  const rate = {
    input,
    output: Number.isFinite(output) ? output : input,
    cacheRead: Number(entry.cacheRead ?? input),
    cacheWrite: Number(entry.cacheWrite ?? input),
    currency: entry.currency ?? route?.currency ?? prices?.currency ?? 'CNY',
  }
  // Optional off-peak tier; the schedule lives next to the currency at the top
  // level or on the provider. Tiering only applies when both are declared.
  const off = entry.offPeak
  if (off !== undefined && off !== null && Number.isFinite(Number(off.input)) && Number.isFinite(Number(off.output))) {
    rate.offPeak = {
      input: Number(off.input),
      output: Number(off.output),
      cacheRead: Number(off.cacheRead ?? off.input),
      cacheWrite: Number(off.cacheWrite ?? off.input),
    }
  }
  return rate
}

/**
 * The tier schedule: which local weekdays and clock windows count as peak.
 * Defaults keep every time peak, so an entry without `offPeak` is unaffected.
 * @param {Record<string, any>} prices
 * @param {string} provider
 */
export function scheduleOf(prices, provider) {
  const schedule = prices?.providers?.[provider]?.offPeakSchedule ?? prices?.offPeakSchedule
  if (schedule === undefined || schedule === null) return undefined
  return {
    timeZone: schedule.timeZone ?? 'Asia/Shanghai',
    peakDays: Array.isArray(schedule.peakDays) ? schedule.peakDays : [1, 2, 3, 4, 5],
    peakWindows: Array.isArray(schedule.peakWindows) && schedule.peakWindows.length > 0
      ? schedule.peakWindows
      : [['09:00', '12:00'], ['14:00', '18:00']],
  }
}

/**
 * Local weekday and minute-of-day of an instant in a schedule's time zone.
 * @param {number} epochMs
 * @param {string} timeZone
 */
function localClock(epochMs, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(epochMs ?? Date.now()))
  const value = Object.fromEntries(parts.map(p => [p.type, p.value]))
  const weekday = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[value.weekday] ?? 0
  return { weekday, minutes: Number(value.hour) * 60 + Number(value.minute) }
}

/** Whether an instant falls in the schedule's peak windows. */
export function isPeak(epochMs, schedule) {
  if (schedule === undefined) return true
  const { weekday, minutes } = localClock(epochMs, schedule.timeZone)
  if (!schedule.peakDays.includes(weekday)) return false
  for (const [start, end] of schedule.peakWindows) {
    const from = clockMinutes(start)
    const to = clockMinutes(end)
    if (from === undefined || to === undefined) continue
    if (from <= to) {
      if (minutes >= from && minutes < to) return true
    } else if (minutes >= from || minutes < to) {
      return true
    }
  }
  return false
}

/** "HH:MM" as minutes since local midnight. */
function clockMinutes(value) {
  const match = /^(\d{1,2}):(\d{2})$/.exec(String(value))
  if (match === null) return undefined
  return Number(match[1]) * 60 + Number(match[2])
}

/**
 * The rate that applies at one settlement instant: its off-peak tier when the
 * model declares one and the local clock is outside the peak windows.
 * @param {{ offPeak?: Record<string, number> } | undefined} price
 * @param {number} epochMs
 * @param {ReturnType<typeof scheduleOf>} schedule
 */
export function rateAt(price, epochMs, schedule) {
  if (price === undefined) return undefined
  if (price.offPeak === undefined) return price
  if (isPeak(epochMs, schedule)) return price
  return { ...price, ...price.offPeak }
}

/**
 * Cost of one token bucket record under a price entry.
 * @param {{ input: number, output: number, cacheRead: number, cacheWrite: number }} tokens
 * @param {{ input: number, output: number, cacheRead: number, cacheWrite: number }} price
 */
export function costOf(tokens, price) {
  const unit = 1_000_000
  return (tokens.input * price.input + tokens.output * price.output
    + tokens.cacheRead * price.cacheRead + tokens.cacheWrite * price.cacheWrite) / unit
}

/**
 * Fold already-decoded sessions into the per-day × per-model report.
 * Shared by the file-based CLI and the host plugin (which gets events from
 * `ctx.sessionQuery`).
 *
 * `since`/`until` are inclusive local day bounds (YYYY-MM-DD). They filter at
 * the settlement level, so a session that spans the boundary contributes only
 * the usage inside the range — never its whole lifetime.
 * @param {Array<{ id: string, header?: Record<string, any>, title?: string, settlements?: Array<Record<string, any>>, events?: Array<Record<string, any>>, error?: string }>} sessions
 * @param {{ prices?: Record<string, any>, timeZone?: string, since?: string, until?: string }} options
 */
export function reportFromSessions(sessions, options = {}) {
  const { prices = {}, timeZone, since, until } = options
  const days = new Map()
  const unpriced = new Map()
  const dailyByModel = new Map()
  const rows = []
  const errors = []
  const currency = prices?.currency ?? 'CNY'
  const ranged = since !== undefined || until !== undefined
  const inRange = (day) => (since === undefined || day >= since) && (until === undefined || day <= until)

  for (const session of sessions) {
    if (session.error !== undefined) {
      errors.push({ sessionId: session.id, code: 'read-failed', message: session.error })
      continue
    }
    // A host that caches per-session folds passes `settlements` and `title`;
    // the file-based CLI passes raw `events`.
    const allSettlements = session.settlements ?? attributeSession(session.events ?? [], { timeZone })
    const settlements = ranged ? allSettlements.filter(record => inRange(record.day)) : allSettlements
    if (ranged && settlements.length === 0) continue
    const title = session.title !== undefined
      ? session.title
      : [...(session.events ?? [])].reverse().find(event => event.type === 'session/title')?.data?.title
    const sessionRow = {
      id: session.id ?? session.header?.id,
      title,
      cwd: session.header?.cwd,
      parentSession: session.header?.parentSession,
      createdAt: session.header?.createdAt,
      delegationDepth: session.header?.delegationDepth ?? 0,
      settlements: settlements.length,
      tokens: { ...EMPTY_TOKENS },
      peakTokens: 0,
      offPeakTokens: 0,
      cost: 0,
      currency,
      priced: true,
      models: new Map(),
    }
    rows.push(sessionRow)
    for (const record of settlements) {
      const price = priceOf(prices, record.provider, record.model)
      const schedule = scheduleOf(prices, record.provider)
      // Peak/off-peak is decided per settlement by its local completion time.
      const rate = rateAt(price, record.time, schedule)
      const cost = rate === undefined ? 0 : costOf(record.tokens, rate)
      const recordTokens = bucketTotal(record.tokens)
      const peak = isPeak(record.time, schedule)

      // Per-session rollup: the composer pill shows one session's spend.
      const modelKey = `${record.provider}\u0000${record.model}`
      let sessionModel = sessionRow.models.get(modelKey)
      if (sessionModel === undefined) {
        sessionModel = {
          provider: record.provider, model: record.model, tokens: { ...EMPTY_TOKENS },
          peakTokens: 0, offPeakTokens: 0, tiered: price?.offPeak !== undefined,
          cost: 0, priced: price !== undefined, steps: 0,
        }
        sessionRow.models.set(modelKey, sessionModel)
      }
      sessionModel.tokens = add(sessionModel.tokens, record.tokens)
      sessionModel.steps += 1
      sessionModel.cost += cost
      if (price?.offPeak !== undefined) {
        if (peak) sessionModel.peakTokens += recordTokens
        else sessionModel.offPeakTokens += recordTokens
      }
      sessionRow.tokens = add(sessionRow.tokens, record.tokens)
      sessionRow.cost += cost
      if (price?.offPeak !== undefined) {
        if (peak) sessionRow.peakTokens += recordTokens
        else sessionRow.offPeakTokens += recordTokens
      }
      if (price === undefined) {
        sessionRow.priced = false
        unpriced.set(`${record.provider}/${record.model}`, true)
      }

      const key = `${record.day}\u0000${record.provider}\u0000${record.model}`
      let row = dailyByModel.get(key)
      if (!row) {
        row = {
          day: record.day, provider: record.provider, model: record.model,
          tokens: { ...EMPTY_TOKENS }, peakTokens: 0, offPeakTokens: 0,
          tiered: price?.offPeak !== undefined,
          cost: 0, currency: price?.currency ?? currency,
          priced: price !== undefined, steps: 0,
        }
        dailyByModel.set(key, row)
      }
      row.tokens = add(row.tokens, record.tokens)
      row.steps += 1
      row.cost += cost
      if (price?.offPeak !== undefined) {
        if (peak) row.peakTokens += recordTokens
        else row.offPeakTokens += recordTokens
      }
    }
    sessionRow.models = [...sessionRow.models.values()]
      .sort((a, b) => bucketTotal(b.tokens) - bucketTotal(a.tokens))
  }

  for (const row of dailyByModel.values()) {
    if (!days.has(row.day)) days.set(row.day, { day: row.day, models: [], tokens: { ...EMPTY_TOKENS }, peakTokens: 0, offPeakTokens: 0, cost: 0, currency, priced: true })
    const day = days.get(row.day)
    day.models.push(row)
    day.tokens = add(day.tokens, row.tokens)
    day.peakTokens += row.peakTokens ?? 0
    day.offPeakTokens += row.offPeakTokens ?? 0
    day.cost += row.cost
    day.priced = day.priced && row.priced
  }

  const reportDays = [...days.values()]
    .map(day => ({ ...day, models: day.models.sort((a, b) => bucketTotal(b.tokens) - bucketTotal(a.tokens)) }))
    .sort((a, b) => (a.day < b.day ? 1 : -1))

  // Conversations: a root session plus every subagent session that names it as
  // its parent. The built-in per-session token usage never merges these, which is
  // why a multi-agent turn looks "cheaper" than the work it actually caused.
  const byId = new Map(rows.map(row => [row.id, row]))
  const rootOf = (row) => {
    let current = row
    for (let guard = 0; guard < 64; guard += 1) {
      const parent = current.parentSession === undefined ? undefined : byId.get(current.parentSession)
      if (parent === undefined) return current
      current = parent
    }
    return current
  }
  const conversationById = new Map()
  for (const row of rows) {
    const root = rootOf(row)
    let conversation = conversationById.get(root.id)
    if (conversation === undefined) {
      conversation = {
        id: root.id,
        title: root.title,
        cwd: root.cwd,
        createdAt: root.createdAt,
        tokens: { ...EMPTY_TOKENS },
        peakTokens: 0,
        offPeakTokens: 0,
        cost: 0,
        currency: root.currency ?? currency,
        priced: true,
        sessions: 0,
        subagents: 0,
      }
      conversationById.set(root.id, conversation)
    }
    conversation.tokens = add(conversation.tokens, row.tokens)
    conversation.peakTokens += row.peakTokens ?? 0
    conversation.offPeakTokens += row.offPeakTokens ?? 0
    conversation.cost += row.cost
    conversation.priced = conversation.priced && row.priced
    conversation.sessions += 1
    if (row.id !== root.id) conversation.subagents += 1
  }
  const conversations = [...conversationById.values()].sort((a, b) => b.cost - a.cost)

  const totals = { ...EMPTY_TOKENS, peakTokens: 0, offPeakTokens: 0, cost: 0 }
  for (const day of reportDays) {
    totals.input += day.tokens.input
    totals.output += day.tokens.output
    totals.cacheRead += day.tokens.cacheRead
    totals.cacheWrite += day.tokens.cacheWrite
    totals.peakTokens += day.peakTokens
    totals.offPeakTokens += day.offPeakTokens
    totals.cost += day.cost
  }
  totals.totalTokens = bucketTotal(totals)
  totals.totalCost = totals.cost

  return {
    generatedAt: Date.now(),
    timeZone: timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
    range: { since: since ?? null, until: until ?? null },
    currency,
    days: reportDays,
    totals,
    conversations,
    sessions: rows.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)),
    unpricedModels: [...unpriced.keys()].sort(),
    sessionCount: rows.length,
    errors,
  }
}

/** Sum of every bucket of one token record. */
export function bucketTotal(tokens) {
  return tokens.input + tokens.output + tokens.cacheRead + tokens.cacheWrite
}

/**
 * File-based report over a whole DSH home directory (see `reportFromSessions`).
 * @param {{ homeDir: string, prices?: Record<string, any>, timeZone?: string, since?: string, until?: string }} options
 */
export function aggregate(options) {
  const { homeDir, timeZone, since, until, prices } = options
  const sessions = listSessionLogs(homeDir).map((file) => {
    try {
      const events = readSessionEvents(file)
      return { id: events.find(e => e.type === 'session')?.id ?? basename(dirname(file)), header: events.find(e => e.type === 'session'), events }
    } catch (error) {
      return { id: basename(dirname(file)), events: [], error: String(error?.message ?? error) }
    }
  })
  return reportFromSessions(sessions, { prices, timeZone, since, until })
}

