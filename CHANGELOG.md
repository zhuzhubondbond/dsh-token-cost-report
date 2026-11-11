# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versioning follows [Semantic Versioning](https://semver.org/).

## [0.2.2] — 2026-11-11

Documentation and price-template release; no behaviour change.

### Added

- README: a "official price reference" section with DeepSeek API prices (deepseek-flash peak 2 / 0.04 / 8, off-peak 1 / 0.02 / 4; deepseek-v4-pro peak 9 / 0.3 / 27, off-peak 4.5 / 0.15 / 13.5, CNY per 1M tokens), the peak window rule (Beijing time, Mon–Fri, 09:00–12:00 and 14:00–18:00) and the caveat that statutory holidays are priced as peak because the plugin has no holiday calendar.
- `prices.json`: two more model entries in the blank template — `deepseek-account/deepseek-flash` and `deepseek-account/deepseek-v4-pro` (all unit prices `null`; model count 53 → 55).
- The npm package now ships `README.zh.md` and `CHANGELOG.md`.

### Changed

- `package.json`: added `repository`, `homepage` and `bugs`, so the npm page links back to the source.

## [0.2.1] — 2026-11-11

Published on npm. Keeps the composer chip in sync with a running, streaming turn.

### Fixed

- The spend chip could show a stale figure while a step was still streaming: the host's cached per-session row predates the live token projection. The chip now compares its cached token buckets with the live `usage` sample and forces a rebuild when they differ.
- Forced rebuilds are throttled (at most one every 2 s, at most 6 per mount) so a stale report cannot trigger one rebuild per rendered step.
- Added a timed-out state and a disabled style for the chip button while a forced rebuild is pending, so repeated clicks during a slow rebuild do nothing instead of queueing.

### Added

- Hover and disabled styles for the composer chip button.

## [0.2.0] — 2026-11-10

First public release on npm.

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
