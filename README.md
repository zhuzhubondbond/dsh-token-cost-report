# dsh-token-cost-report

English | [中文](README.zh.md)

[![npm version](https://img.shields.io/npm/v/dsh-token-cost-report)](https://www.npmjs.com/package/dsh-token-cost-report)
[![license](https://img.shields.io/npm/l/dsh-token-cost-report)](LICENSE)

Per-day, per-model token usage and spend for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness):

- **Composer spend chip** — accumulated cost of the current conversation (including all sub-agent sessions); expand it to see the four token buckets, sub-agent breakdown, per-model totals and the latest daily usage. While a turn is still streaming the chip re-checks the live token projection and refreshes itself instead of showing a stale figure.
- **Sidebar page "Usage & Cost"** — total tokens / total spend / today's spend / session count; monthly day×model tables; per-conversation (sub-agents merged) and per-session tables.
- **Peak / off-peak pricing** — two tiers driven by a local-time schedule (bucket decided by the completion time of each settlement), or a flat unit price.
- **Date ranges** — last 7 / 30 / 90 days or all time; cards and tables recompute for the selected range ("today" stays today).
- **CSV export** — day×model and per-session tables, UTF-8 BOM, opens directly in Excel.
- **Scales to large histories** — monthly collapsible day tables, paginated long tables, and an incremental host-side cache (a refresh only recomputes sessions that changed).

## Install

Requires DSH ≥ `0.2.2-rc.1` (Web GUI; both the desktop app and `dsh web` work).

### Option A — Plugin Manager (recommended)

1. Open the DSH Web GUI → sidebar **Plugins** (or Settings → Plugins).
2. In the "install bundle" box, enter any of:
   - npm package name: `dsh-token-cost-report`;
   - absolute path to the local directory or a `.tgz` bundle (for example `D:\path\to\dsh-token-cost-report-0.2.1.tgz`);
   - a Git address such as `git+https://github.com/zhuzhubondbond/dsh-token-cost-report.git`.
3. The plugin is enabled by default after installation; refresh the page to see the sidebar entry and the chip.

### Option B — CLI

```pwsh
# pnpm is bundled with the desktop app
dsh plugin --profile desktop install dsh-token-cost-report
# local tarball: dsh plugin --profile desktop install D:\path\to\dsh-token-cost-report-0.2.1.tgz
```

### Option C — local development (profile patch, bypasses the installer)

```yaml
# <profile dir>/cordis.patch.yml
- insert:
    - id: token-usage
      name: 'D:/path/to/dsh-token-cost-report/lib/index.js'
```

> Note: a package may have only **one active source**. Do not mount it through a patch and also install the bundle — DSH refuses duplicate loader sources at startup.

## First run: fill in prices

The DSH kernel reports tokens but no monetary price, so this plugin estimates cost from a price table.

- On first load the bundled template is copied to **`$DSH_HOME/token-usage-prices.json`**
  (on Windows usually `C:\Users\<you>\.dsh\token-usage-prices.json`);
- Edit that file; it is **never** overwritten by plugin upgrades. The in-app "prices not configured" hint prints the path;
- You can also point `pricesFile` at any path from your own profile patch.

Format (per 1,000,000 tokens; currency is given by `currency`):

```json
{
  "currency": "CNY",
  "offPeakSchedule": {
    "timeZone": "Asia/Shanghai",
    "peakDays": [1, 2, 3, 4, 5],
    "peakWindows": [["09:00", "12:00"], ["14:00", "18:00"]]
  },
  "providers": {
    "volcengine": {
      "models": {
        "deepseek-v4-1-flash-261017": {
          "input": 2.0, "output": 8.0, "cacheRead": 0.04,
          "offPeak": { "input": 1.0, "output": 4.0, "cacheRead": 0.02 }
        }
      }
    }
  }
}
```

- `input` = uncached input, `output` = output, `cacheRead` = cache hits, `cacheWrite` = cache writes;
  omitted `cacheRead` / `cacheWrite` fall back to `input`;
- models with `input` or `output` set to `null` are skipped for pricing ("unpriced", never counted as 0);
- time-of-day pricing applies only to models that declare `offPeak` **and** when `offPeakSchedule` is configured;
- the bundled `prices.json` is a **sample** (Volcengine Ark prices as of 2026-11-09) — verify against your own account and copy it into the user file.

Values take effect on the next refresh (the host re-reads the price file on every recompute, no restart needed).

## Data semantics

- Source: on-disk session logs, read through DSH's public `ctx.sessionQuery` (`listSessions` + `readSession`); **no network, no model calls**.
- Each settlement uses the provider-reported `assistant/message.data.usage`; `assistant/attempt` (failed/retried attempts) is counted too. Later samples for the same `(turn, step)` replace earlier ones and `llm/retry-started` closes the slot — consistent with the kernel `tokenUsage` projection, so retries are not double-billed.
- Usage is attributed to the most recent preceding `request/header` provider/model, bucketed by local calendar day in the browser timezone.
- **Sub-agent sessions**: in DSH a sub-agent is a separate session whose `parentSession` points at the root. Built-in statistics do not merge them; this plugin merges them in the chip and in the per-conversation table so multi-agent conversations are not undercounted.
- Time is derived: peak/off-peak uses the completion time of the settlement event.

## Known limitations

- **Estimate, not an invoice** — no discounts, tiering or invoices; tiered pricing (e.g. by context length) is priced at a single tier.
- Image models (per image) and video models (per video token) cannot be expressed as token prices and stay unpriced.
- Cost is estimated from `prices.json`; models without a configured price only count tokens.
- Data comes from this machine's history only; changing machines or deleting logs is irreversible.
- Web GUI only for now (`dsh.client.platform = "web"`).

## Command-line report

```pwsh
node bin/report.mjs                     # Markdown table
node bin/report.mjs --json              # JSON
node bin/report.mjs --since 2026-11-01  # start date
node bin/report.mjs --until 2026-11-30  # end date
node bin/report.mjs --prices ./my.json  # explicit price table
```

## Upgrade / uninstall

- Upgrade: use "update" for the bundle in Plugin Manager, or install a newer `.tgz`; the price file lives under `$DSH_HOME` and survives upgrades.
- Uninstall: disable/remove the bundle in Plugin Manager, or drop the `token-usage` row from the profile patch. Keep or delete the user price file as you like.

## Development

See [PUBLISHING.md](PUBLISHING.md) for package layout, renaming constraints, packaging/publishing steps and local verification, and [GITHUB_SETUP.md](GITHUB_SETUP.md) for the repository, `dsh-plugin` topic, release and market-index steps.

## License

MIT
