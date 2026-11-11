# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning follows [Semantic Versioning](https://semver.org/).

## [0.2.0] — 2026-11-10

First public release on npm (`npm i dsh-token-cost-report` / install through Plugin Manager).

### Added

- Composer spend chip: current-conversation cost including all sub-agent sessions, expandable to the four token buckets, sub-agent breakdown, per-model totals and recent daily usage.
- Sidebar page "Usage & Cost": totals, today's spend, session count, monthly day×model tables, per-conversation (sub-agents merged) and per-session tables.
- Peak / off-peak pricing by local-time schedule (bucket from the settlement completion time), plus flat unit price.
- Date ranges: last 7 / 30 / 90 days or all time; cards and tables recompute together.
- CSV export for day×model and per-session tables (UTF-8 BOM, Excel-friendly).
- Scales to large histories: monthly collapsible day tables, paginated tables, incremental host-side per-session cache.
- Price template copied to `$DSH_HOME/token-usage-prices.json` on first load; user edits are never overwritten by upgrades.
- CLI report: `node bin/report.mjs [--json] [--since] [--until] [--prices]`.

### Notes

- Cost is an estimate derived from a user-supplied price table; DSH itself reports tokens only.
- Web GUI only (`dsh.client.platform = "web"`).
- `engines.dsh: ">=0.2.2-rc.1"`.

## [Unreleased]

Planned for 0.2.1 (repository metadata polish, no behaviour change):

- Add `repository`, `homepage` and `bugs` to `package.json`.
- Ship `README.zh.md` and `CHANGELOG.md` inside the npm package (`files` whitelist).
- Align the npm-facing README with the repository's bilingual READMEs.
