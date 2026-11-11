window.__ModuleLoader__.load({
	id: "dsh-token-cost-report",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");

		//#region styles
		const CSS = [
			".tuc-anchor{min-width:0;display:inline-flex;position:relative}",
			".tuc-pill{min-width:0;height:calc(28px + var(--dsh-content-font-delta,0px));border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);font-variant-numeric:tabular-nums;line-height:calc(24px + var(--dsh-content-font-delta,0px));white-space:nowrap;cursor:pointer;background:0 0;border:none;align-items:center;gap:4px;padding:6px 8px;display:inline-flex}",
			".tuc-pill:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
			".tuc-pill[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}",
			".tuc-pill svg{width:calc(15px + var(--dsh-content-font-delta,0px));height:calc(15px + var(--dsh-content-font-delta,0px));flex:none}",
			".tuc-pill[data-unpriced=true]{color:var(--dsw-alias-state-warn-primary)}",
			".tuc-label{text-overflow:ellipsis;min-width:0;overflow:hidden}",
			".tuc-panel{z-index:1100;box-sizing:border-box;width:max-content;min-width:min(320px,calc(100vw - 24px));max-width:min(460px,calc(100vw - 24px));border-radius:var(--dsw-radius-lg);background:var(--dsw-specific-menu);backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);cursor:default;max-height:min(62vh,560px);border:0;padding:16px;font-size:12px;line-height:18px;position:fixed;overflow:hidden auto}",
			".tuc-title{color:var(--dsw-alias-label-primary);justify-content:space-between;gap:16px;margin-bottom:8px;font-weight:500;display:flex}",
			".tuc-titleLabel{align-items:center;gap:6px;min-width:0;display:inline-flex}",
			".tuc-titleLabel svg{flex:none;width:14px;height:14px}",
			".tuc-titleValue{font-variant-numeric:tabular-nums}",
			".tuc-rule{border-top:.5px solid var(--dsw-alias-border-l2);margin:10px 0}",
			".tuc-section{color:var(--dsw-alias-label-tertiary);margin:0 0 6px;font-weight:500}",
			".tuc-rows{color:var(--dsw-alias-label-tertiary);grid-template-columns:minmax(76px,auto) minmax(0,1fr);gap:6px 16px;margin:0;display:grid}",
			".tuc-rows dt,.tuc-rows dd{min-width:0;margin:0}",
			".tuc-rows dd{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;text-align:right;overflow-wrap:anywhere}",
			".tuc-model{color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere;font-size:11.5px}",
			".tuc-day{color:var(--dsw-alias-label-primary);margin:8px 0 4px;font-weight:500}",
			".tuc-warn{color:var(--dsw-alias-state-warn-primary);margin:8px 0 0;overflow-wrap:anywhere}",
			".tuc-foot{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:12px}",
			".tuc-action{font:inherit;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;padding:2px 6px;border-radius:var(--dsw-radius-sm)}",
			".tuc-action:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}",
			".tuc-hint{color:var(--dsw-alias-label-tertiary);font-size:11px;margin:6px 0 0}",
			".tup-page{box-sizing:border-box;height:100%;overflow:hidden auto;padding:24px clamp(16px,4vw,48px) 48px;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px}",
			".tup-inner{width:100%;max-width:1080px;margin:0 auto}",
			".tup-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;max-width:1080px;margin:0 auto 20px}",
			".tup-title{color:var(--dsw-alias-label-primary);margin:0;font-size:20px;font-weight:500;line-height:28px}",
			".tup-sub{color:var(--dsw-alias-label-tertiary);margin:4px 0 0;font-size:12px;line-height:18px}",
			".tup-button{border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);height:32px;cursor:pointer;padding:0 14px;font:inherit;font-size:13px;white-space:nowrap}",
			".tup-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}",
			".tup-button:disabled{opacity:.6;cursor:default}",
			".tup-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;max-width:1080px;margin:0 auto 20px}",
			".tup-card{border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg);background:var(--dsw-alias-bg-layer-1);padding:14px 16px;display:flex;flex-direction:column;gap:6px}",
			".tup-cardLabel{color:var(--dsw-alias-label-tertiary);font-size:12px}",
			".tup-cardValue{color:var(--dsw-alias-label-primary);font-size:18px;font-weight:500;font-variant-numeric:tabular-nums}",
			".tup-tableWrap{max-width:1080px;margin:0 auto;border:.5px solid var(--dsw-alias-border-l3);border-radius:var(--dsw-radius-lg);overflow:hidden auto}",
			".tup-table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums;font-size:12.5px}",
			".tup-table th{position:sticky;top:0;z-index:1;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-tertiary);text-align:right;font-weight:500;white-space:nowrap;border-bottom:.5px solid var(--dsw-alias-border-l3);padding:10px 12px}",
			".tup-table th:nth-child(1),.tup-table th:nth-child(2){text-align:left}",
			".tup-table td{color:var(--dsw-alias-label-secondary);text-align:right;white-space:nowrap;border-bottom:.5px solid var(--dsw-alias-border-l2);padding:8px 12px}",
			".tup-table td:nth-child(1),.tup-table td:nth-child(2){text-align:left}",
			".tup-table tbody tr:hover td{background:var(--dsw-alias-interactive-bg-hover)}",
			".tup-day{color:var(--dsw-alias-label-tertiary)}",
			".tup-model{color:var(--dsw-alias-label-primary);overflow-wrap:anywhere}",
			".tup-total-row td{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);font-weight:500}",
			".tup-unpriced{color:var(--dsw-alias-state-warn-primary)}",
			".tup-warn{max-width:1080px;margin:0 auto 12px;color:var(--dsw-alias-state-warn-primary);font-size:12px;overflow-wrap:anywhere}",
			".tup-error{max-width:1080px;margin:12px auto;color:var(--dsw-alias-state-error-primary)}",
			".tup-foot{max-width:1080px;margin:14px auto 0;color:var(--dsw-alias-label-tertiary);font-size:11px}",
			".tup-sectionHead{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:28px auto 8px;max-width:1080px}",
			".tup-range{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}",
			".tup-headActions{display:flex;align-items:center;gap:8px}",
			".tup-buttonActive,.tup-buttonActive:hover:not(:disabled){background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-foreground);border-color:transparent}",
			".tup-toolbar{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 2px}",
			".tup-buttonSmall{height:28px;padding:0 10px;font-size:12px}",
			".tup-month-row>td{padding:0;background:var(--dsw-alias-bg-layer-1);border-bottom:.5px solid var(--dsw-alias-border-l3)}",
			".tup-month{box-sizing:border-box;width:100%;text-align:left;font:inherit;font-size:12.5px;font-weight:500;color:var(--dsw-alias-label-primary);background:0 0;border:0;cursor:pointer;padding:8px 12px}",
			".tup-month:hover{background:var(--dsw-alias-interactive-bg-hover)}",
			".tup-more{display:block;margin:10px auto 0;height:30px;padding:0 14px;font:inherit;font-size:12px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);border:.5px solid var(--dsw-alias-border-l4);border-radius:var(--dsw-radius-md);cursor:pointer}",
			".tup-more:hover{background:var(--dsw-alias-interactive-bg-hover)}",
		].join("");
		const tagId = "dsh-token-usage/CostPill.css";
		if (typeof document !== "undefined" && document.querySelector('style[data-plugin-css=' + JSON.stringify(tagId) + ']') === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-token-usage";
			tag.dataset.pluginCss = tagId;
			tag.textContent = CSS;
			document.head.appendChild(tag);
		}
		//#endregion

		const ROUTE = "api/token-usage/daily";
		const h = react.createElement;

		/** Selectable range presets; `days: null` is the whole history. */
		const RANGES = [
			{ id: "7", days: 7 },
			{ id: "30", days: 30 },
			{ id: "90", days: 90 },
			{ id: "all", days: null },
		];

		/** Local calendar date (YYYY-MM-DD) of an instant. */
		function localDate(date = new Date()) {
			const y = date.getFullYear();
			const m = String(date.getMonth() + 1).padStart(2, "0");
			const d = String(date.getDate()).padStart(2, "0");
			return y + "-" + m + "-" + d;
		}

		/** Inclusive `since` bound of a preset, in local days. */
		function sinceOf(rangeId) {
			const preset = RANGES.find((entry) => entry.id === rangeId);
			if (preset === undefined || preset.days === null) return undefined;
			const start = new Date();
			start.setDate(start.getDate() - (preset.days - 1));
			return localDate(start);
		}

		/** Module-level report cache, one slot per range, shared by every view. */
		const caches = new Map();

		/** Fetch the host report for a range, sharing one in-flight request and a TTL. */
		function fetchReport(force, rangeId = "all") {
			let cache = caches.get(rangeId);
			if (cache === undefined) {
				cache = { at: 0, report: undefined, inflight: undefined };
				caches.set(rangeId, cache);
			}
			if (!force && cache.report !== undefined && Date.now() - cache.at < 60000) {
				return Promise.resolve(cache.report);
			}
			if (cache.inflight !== undefined) return cache.inflight;
			const url = new URL(ROUTE, document.baseURI);
			url.searchParams.set("tz", Intl.DateTimeFormat().resolvedOptions().timeZone);
			const since = sinceOf(rangeId);
			if (since !== undefined) url.searchParams.set("since", since);
			if (force) url.searchParams.set("refresh", "1");
			cache.inflight = fetch(url, { headers: { accept: "application/json" } })
				.then((response) => {
					if (!response.ok) throw new Error("HTTP " + response.status);
					return response.json();
				})
				.then((report) => {
					cache.at = Date.now();
					cache.report = report;
					return report;
				})
				.finally(() => { cache.inflight = undefined; });
			return cache.inflight;
		}

		/** One CSV cell, quoted only when it needs to be. */
		function csvCell(value) {
			const text = value === undefined || value === null ? "" : String(value);
			return /[",\r\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
		}

		/** Rows (array of arrays) to CRLF CSV text. */
		function toCsv(rows) {
			return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
		}

		/** Download text as a UTF-8 CSV file (BOM so Excel reads Chinese). */
		function downloadCsv(filename, text) {
			const blob = new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = filename;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			setTimeout(() => URL.revokeObjectURL(url), 1000);
		}

		const BUCKETS = [
			["input", "uncachedInput"],
			["cacheRead", "cacheRead"],
			["cacheWrite", "cacheWrite"],
			["output", "output"],
		];

		function bucketTotal(tokens) {
			return (tokens?.input ?? 0) + (tokens?.cacheRead ?? 0) + (tokens?.cacheWrite ?? 0) + (tokens?.output ?? 0);
		}

		/** Match one session row by id, else by its exact token buckets. */
		function findSession(report, sessionId, usage) {
			if (report === undefined) return undefined;
			if (sessionId !== undefined) {
				const byId = (report.sessions ?? []).find((row) => row.id === sessionId);
				if (byId !== undefined) return byId;
			}
			if (usage === undefined) return undefined;
			const want = [
				usage.uncachedInputTokens ?? 0,
				usage.cacheReadTokens ?? 0,
				usage.cacheWriteTokens ?? 0,
				usage.outputTokens ?? 0,
			];
			return (report.sessions ?? []).find((row) => row.tokens !== undefined
				&& row.tokens.input === want[0] && row.tokens.cacheRead === want[1]
				&& row.tokens.cacheWrite === want[2] && row.tokens.output === want[3]);
		}

		function priceText(value, currency) {
			const symbol = currency === "CNY" ? "¥" : currency === "USD" ? "$" : "";
			const amount = value >= 100 ? value.toFixed(1)
				: value >= 1 ? value.toFixed(2)
					: value >= 0.01 ? value.toFixed(3)
						: value > 0 ? value.toFixed(4)
							: "0";
			return symbol + amount;
		}

		function tokenText(value) {
			if (!Number.isFinite(value)) return "—";
			if (value >= 1000000) return (value / 1000000).toFixed(value >= 10000000 ? 0 : 1) + "M";
			if (value >= 1000) return (value / 1000).toFixed(value >= 100000 ? 0 : 1) + "K";
			return String(value);
		}

		function exact(value) {
			return Number(value ?? 0).toLocaleString("en-US");
		}

		const ICON = h("svg", {
			viewBox: "0 0 16 16",
			"aria-hidden": true,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: 1.3,
		}, [
			h("circle", { key: "c", cx: 8, cy: 8, r: 6.2 }),
			h("path", {
				key: "p",
				d: "M8 4.4v7.2M10.2 6c-.5-.5-1.3-.8-2.1-.8-1.1 0-1.9.6-1.9 1.5 0 1 .9 1.3 2 1.6 1.2.3 2 .7 2 1.6 0 .9-.9 1.5-2.1 1.5-.9 0-1.7-.3-2.3-.9",
			}),
		]);

		/** Bucket rows shared by the session and per-model sections. */
		function bucketRows(tokens) {
			const nodes = [];
			for (const [bucket, key] of BUCKETS) {
				const value = tokens?.[bucket] ?? 0;
				if (value === 0) continue;
				nodes.push(h("dt", { key: "dt-" + bucket }, key), h("dd", { key: "dd-" + bucket }, exact(value) + " tok"));
			}
			return nodes;
		}

		/** Root session id of a session row, following `parentSession` upward. */
		function rootSessionOf(report, session) {
			if (report === undefined || session === undefined) return undefined;
			const byId = new Map((report.sessions ?? []).map((row) => [row.id, row]));
			let current = byId.get(session.id) ?? session;
			for (let guard = 0; guard < 64; guard += 1) {
				const parent = current.parentSession === undefined ? undefined : byId.get(current.parentSession);
				if (parent === undefined) return current.id;
				current = parent;
			}
			return current.id;
		}

		const ZERO_TOKENS = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

		/** Human label of a session: its title, else a short id. */
		function sessionLabel(row) {
			const title = typeof row?.title === "string" && row.title.trim() !== "" ? row.title.trim() : undefined;
			return title ?? String(row?.id ?? "").slice(0, 20);
		}

		/** Label for a subagent row: titles are often the same prompt, so pin the id. */
		function sessionOptionLabel(row) {
			const label = sessionLabel(row);
			return (row?.delegationDepth ?? 0) > 0 ? label + " · " + String(row.id).slice(0, 6) : label;
		}

		/** Sum two token bucket records. */
		function plusTokens(a, b) {
			return {
				input: (a?.input ?? 0) + (b?.input ?? 0),
				output: (a?.output ?? 0) + (b?.output ?? 0),
				cacheRead: (a?.cacheRead ?? 0) + (b?.cacheRead ?? 0),
				cacheWrite: (a?.cacheWrite ?? 0) + (b?.cacheWrite ?? 0),
			};
		}

		/**
		 * The conversation a session belongs to: its root session, the subagent
		 * sessions under that root, and the models merged across all of them.
		 * The built-in per-session token usage never merges subagents, so the chip
		 * and dialog use this scope instead.
		 */
		function conversationScope(report, session) {
			if (report === undefined || session === undefined) return undefined;
			const rootId = rootSessionOf(report, session);
			const conversation = (report.conversations ?? []).find((row) => row.id === rootId);
			const members = new Map();
			for (const row of report.sessions ?? []) {
				if (row.id === rootId || rootSessionOf(report, row) === rootId) members.set(row.id, row);
			}
			members.set(session.id, { ...session, ...(members.get(session.id) ?? {}) });
			const children = [...members.values()].filter((row) => row.id !== rootId);
			const models = new Map();
			for (const row of members.values()) {
				for (const entry of row.models ?? []) {
					const key = entry.provider + "\u0000" + entry.model;
					const previous = models.get(key);
					if (previous === undefined) {
						models.set(key, {
							provider: entry.provider,
							model: entry.model,
							tokens: { ...ZERO_TOKENS, ...entry.tokens },
							cost: entry.cost ?? 0,
							priced: entry.priced !== false,
							steps: entry.steps ?? 0,
						});
					} else {
						previous.tokens = plusTokens(previous.tokens, entry.tokens);
						previous.cost += entry.cost ?? 0;
						previous.priced = previous.priced && entry.priced !== false;
						previous.steps += entry.steps ?? 0;
					}
				}
			}
			return {
				rootId,
				conversation,
				children,
				models: [...models.values()].sort((a, b) => bucketTotal(b.tokens) - bucketTotal(a.tokens)),
				cost: conversation?.cost ?? session.cost ?? 0,
				tokens: conversation?.tokens ?? session.tokens ?? ZERO_TOKENS,
				currency: conversation?.currency ?? session.currency,
			};
		}

		/** The report dialog: this conversation, its subagents, its models, recent days. */
		function CostDialog({ report, session, scope, currency, t, onRefresh, style }) {
			const models = scope?.models ?? session?.models ?? [];
			const unpricedModels = models.filter((row) => row.priced === false);
			const children = scope?.children ?? [];
			const days = (report?.days ?? []).slice(0, 7);
			return h("div", { className: "tuc-panel", role: "dialog", "aria-label": t("title"), style },
				h("div", { className: "tuc-title" },
					h("span", { className: "tuc-titleLabel" }, ICON, t("title")),
					h("span", { className: "tuc-titleValue" }, priceText(scope?.cost ?? session?.cost ?? 0, currency)),
				),
				h("div", { className: "tuc-rule", "aria-hidden": true }),
				session !== undefined && h("p", { className: "tuc-day", title: session.id }, sessionLabel(session)),
				session === undefined
					? h("div", { className: "tuc-hint" }, t("loading"))
					: h("dl", { className: "tuc-rows" }, bucketRows(scope?.tokens ?? session.tokens)),
				h("div", null,
					h("div", { className: "tuc-rule", "aria-hidden": true }),
					h("dl", { className: "tuc-rows" },
						h("dt", null, t("sessionScope")),
						h("dd", null, priceText(session?.cost ?? 0, currency) + " · " + tokenText(bucketTotal(session?.tokens))),
						children.length > 0 && h("dt", null, t("subagents", { count: children.length })),
						children.length > 0 && h("dd", null,
							priceText(children.reduce((sum, row) => sum + (row.cost ?? 0), 0), currency) + " · "
							+ tokenText(children.reduce((sum, row) => sum + bucketTotal(row.tokens), 0))),
					),
					children.length > 0 && h("div", { className: "tuc-rule", "aria-hidden": true }),
					children.length > 0 && h("p", { className: "tuc-section" }, t("subagentList")),
					children.length > 0 && h("dl", { className: "tuc-rows" }, children.flatMap((row) => [
						h("dt", { key: "c-" + row.id, className: "tuc-model", title: row.id }, sessionOptionLabel(row)),
						h("dd", { key: "cv-" + row.id },
							tokenText(bucketTotal(row.tokens)) + " · " + priceText(row.cost ?? 0, row.currency ?? currency)),
					])),
				),
				models.length > 0 && h("div", null,
					h("div", { className: "tuc-rule", "aria-hidden": true }),
					h("p", { className: "tuc-section" }, t("byModel")),
					h("dl", { className: "tuc-rows" }, models.flatMap((row) => [
						h("dt", { key: "m-" + row.provider + "/" + row.model, className: "tuc-model" },
							row.model + (row.priced === false ? " · " + t("unpriced") : "")),
						h("dd", { key: "v-" + row.provider + "/" + row.model },
							tokenText(bucketTotal(row.tokens)) + " · " + (row.priced === false ? "?" : priceText(row.cost, currency))),
					])),
				),
				unpricedModels.length > 0 && h("p", { className: "tuc-warn" }, t("unpricedHint"),
					report.pricesFile !== undefined && h("span", { className: "tuc-hint" }, " " + report.pricesFile)),
				days.length > 0 && h("div", null,
					h("div", { className: "tuc-rule", "aria-hidden": true }),
					h("p", { className: "tuc-section" }, t("daily")),
					days.map((day) => h("div", { key: day.day },
						h("p", { className: "tuc-day" }, day.day + " · " + priceText(day.cost, day.currency ?? currency)),
						h("dl", { className: "tuc-rows" }, (day.models ?? []).flatMap((row) => [
							h("dt", { key: "d-" + day.day + row.provider + "/" + row.model, className: "tuc-model" },
								row.model + (row.priced === false ? " · " + t("unpriced") : "")),
							h("dd", { key: "dv-" + day.day + row.provider + "/" + row.model },
								exact(bucketTotal(row.tokens)) + " tok · " + (row.priced === false ? "?" : priceText(row.cost, row.currency ?? currency))),
						])),
					)),
				),
				h("p", { className: "tuc-hint" }, t("estimateHint")),
				h("div", { className: "tuc-foot" },
					h("button", { type: "button", className: "tuc-action", onClick: onRefresh }, t("refresh")),
				),
			);
		}

		/** The composer-dock spend chip, mirroring the built-in stat pills. */
		function CostPill(props) {
			const { t, useProjection, sessionId } = props;
			const usage = typeof useProjection === "function" ? useProjection("tokenUsage") : undefined;
			const [report, setReport] = react.useState(undefined);
			const [open, setOpen] = react.useState(false);
			const [pos, setPos] = react.useState(undefined);
			const root = react.useRef(null);

			const refresh = react.useCallback(() => {
				fetchReport(true).then((next) => setReport(next)).catch(() => {});
			}, []);

			react.useEffect(() => {
				let live = true;
				fetchReport(false).then((next) => { if (live) setReport(next) }).catch(() => {});
				return () => { live = false };
			}, [usage?.outputTokens, usage?.cacheReadTokens, usage?.uncachedInputTokens, usage?.cacheWriteTokens]);

			react.useEffect(() => {
				if (!open) return undefined;
				const onPointer = (event) => {
					const target = event.target;
					if (root.current !== null && target instanceof Node && root.current.contains(target)) return;
					if (target instanceof Node && target.closest !== undefined && target.closest(".tuc-panel") !== null) return;
					setOpen(false);
				};
				const onKey = (event) => { if (event.key === "Escape") setOpen(false) };
				document.addEventListener("pointerdown", onPointer, true);
				document.addEventListener("keydown", onKey);
				return () => {
					document.removeEventListener("pointerdown", onPointer, true);
					document.removeEventListener("keydown", onKey);
				};
			}, [open]);

			const toggle = () => {
				const next = !open;
				if (next && root.current !== null) {
					const rect = root.current.getBoundingClientRect();
					const width = Math.min(460, window.innerWidth - 24);
					const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
					// The panel is `position: fixed`; without explicit coordinates it would
					// resolve against its static position (page bottom) and stay off-screen.
					setPos({
						position: "fixed",
						left,
						bottom: Math.max(12, window.innerHeight - rect.top + 8),
						maxHeight: Math.max(200, Math.min(window.innerHeight * 0.62, rect.top - 24)),
					});
				}
				setOpen(next);
			};

			if (report === undefined || usage === undefined) return null;
			const session = findSession(report, sessionId, usage);
			if (session === undefined || bucketTotal(session.tokens) === 0) return null;
			const scope = conversationScope(report, session);
			const currency = scope?.currency ?? session.currency ?? report.currency ?? "CNY";
			const models = scope?.models ?? session.models ?? [];
			const unpricedCount = models.filter((row) => row.priced === false).length;
			const pricedCount = models.length - unpricedCount;
			const unpriced = unpricedCount > 0;
			const cost = scope?.cost ?? session.cost ?? 0;
			const tokens = bucketTotal(scope?.tokens ?? session.tokens);
			const price = priceText(cost, currency);
			// Nothing priced yet: the chip is the affordance that says "configure me".
			const label = pricedCount === 0 ? t("setPrice") : (unpriced ? "≈" + price : price);
			const subagents = scope?.children?.length ?? 0;
			const text = pricedCount === 0
				? t("setPriceHint")
				: t("summary", { price, tokens: exact(tokens), subagents: String(subagents) });

			return h("span", { className: "tuc-anchor", ref: root },
				h("button", {
					type: "button",
					className: "tuc-pill",
					"aria-haspopup": "dialog",
					"aria-expanded": open,
					"aria-label": text,
					"data-unpriced": unpriced ? "true" : undefined,
					"data-composer-stat": "token-cost",
					title: text,
					onClick: toggle,
				}, ICON, h("span", { className: "tuc-label" }, label)),
				open && react_dom.createPortal(
					h(CostDialog, {
						report,
						session,
						scope,
						currency,
						t,
						onRefresh: refresh,
						style: pos === undefined ? { position: "fixed", left: -9999, top: -9999 } : pos,
					}),
					document.body,
				),
			);
		}

		//#region full page
		/** The sidebar page: every day's per-model token buckets and spend. */
		function UsagePage({ t }) {
			const [state, setState] = react.useState({ status: "loading", report: undefined });
			const [busy, setBusy] = react.useState(false);
			// Collapsed months: null means "expand only the newest month".
			const [openMonths, setOpenMonths] = react.useState(null);
			// Visible rows for the two long tables.
			const [limits, setLimits] = react.useState({ conversations: 20, sessions: 20 });
			// Selected history range; "all" is the whole corpus.
			const [range, setRange] = react.useState("all");

			const load = react.useCallback((force, rangeId) => {
				setBusy(true);
				fetchReport(force, rangeId)
					.then((report) => setState({ status: "ready", report }))
					.catch((error) => setState({ status: "error", error: String(error?.message ?? error) }))
					.finally(() => setBusy(false));
			}, []);

			react.useEffect(() => { load(false, range) }, [load, range]);

			const report = state.report;
			const currency = report?.currency ?? "CNY";
			const rangeButtons = RANGES.map((entry) => h("button", {
				key: entry.id,
				type: "button",
				className: "tup-button tup-buttonSmall" + (range === entry.id ? " tup-buttonActive" : ""),
				disabled: busy,
				onClick: () => {
					if (entry.id !== range) setRange(entry.id);
				},
			}, entry.days === null ? t("rangeAll") : t("rangeDays", { days: entry.days })));
			const head = h("div", { className: "tup-head" },
				h("div", null,
					h("h1", { className: "tup-title" }, t("pageTitle")),
					h("p", { className: "tup-sub" }, report === undefined ? t("loading")
						: t("pageSub", {
							sessions: report.sessionCount ?? 0,
							timeZone: report.timeZone ?? "",
							at: new Date(report.generatedAt).toLocaleString(),
						}) + " · " + (report.build ?? t("hostStale"))),
					h("div", { className: "tup-range" }, rangeButtons),
				),
				h("div", { className: "tup-headActions" },
					h("button", { type: "button", className: "tup-button", disabled: busy, onClick: () => load(true, range) },
						busy ? t("refreshing") : t("refresh")),
				),
			);

			if (state.status === "error") {
				return h("div", { className: "tup-page" }, h("div", { className: "tup-inner" },
					head, h("p", { className: "tup-error" }, state.error)));
			}
			if (report === undefined) {
				return h("div", { className: "tup-page" }, h("div", { className: "tup-inner" },
					head, h("p", { className: "tup-sub" }, t("loading"))));
			}

			const totals = report.totals ?? { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0 };
			const today = localDate();
			const todayRow = (report.days ?? []).find((day) => day.day === today);
			const cards = [
				[t("cardTokens"), exact(totals.totalTokens ?? bucketTotal(totals))],
				[t("cardCost"), priceText(totals.cost ?? 0, currency)],
				[t("cardToday"), todayRow === undefined ? "—" : priceText(todayRow.cost ?? 0, currency)],
				[t("cardSessions"), String(report.sessionCount ?? 0)],
			];

			// Daily table: one collapsible block per calendar month, newest first.
			// Long histories stay readable without rendering every day up front.
			const monthGroups = new Map();
			for (const day of report.days ?? []) {
				const month = day.day.slice(0, 7);
				let group = monthGroups.get(month);
				if (group === undefined) {
					group = { month, days: [], tokens: { ...ZERO_TOKENS }, cost: 0, currency: day.currency ?? currency, priced: true };
					monthGroups.set(month, group);
				}
				group.days.push(day);
				group.tokens = plusTokens(group.tokens, day.tokens);
				group.cost += day.cost ?? 0;
				group.priced = group.priced && day.priced !== false;
			}
			const months = [...monthGroups.values()];
			const latestMonth = months[0]?.month;
			const openSet = openMonths ?? (latestMonth === undefined ? new Set() : new Set([latestMonth]));
			const toggleMonth = (month) => {
				const next = new Set(openSet);
				if (next.has(month)) next.delete(month);
				else next.add(month);
				setOpenMonths(next);
			};
			const allOpen = months.length > 0 && months.every((group) => openSet.has(group.month));

			const modelRow = (day, model) => h("tr", { key: day.day + ":" + model.provider + "/" + model.model },
				h("td", { className: "tup-day" }, day.day),
				h("td", { className: "tup-model" }, model.model),
				h("td", null, exact(model.tokens.input)),
				h("td", null, exact(model.tokens.output)),
				h("td", null, exact(model.tokens.cacheRead)),
				h("td", null, exact(model.tokens.cacheWrite)),
				h("td", null, exact(bucketTotal(model.tokens))),
				h("td", { className: model.priced === false ? "tup-unpriced" : undefined },
					model.priced === false ? t("unpriced") : priceText(model.cost ?? 0, model.currency ?? currency)),
			);
			const totalRow = (day) => h("tr", { key: day.day + ":total", className: "tup-total-row" },
				h("td", { className: "tup-day" }, day.day),
				h("td", null, t("rowTotal")),
				h("td", null, exact(day.tokens.input)),
				h("td", null, exact(day.tokens.output)),
				h("td", null, exact(day.tokens.cacheRead)),
				h("td", null, exact(day.tokens.cacheWrite)),
				h("td", null, exact(bucketTotal(day.tokens))),
				h("td", null, day.priced === false ? t("partial") : priceText(day.cost ?? 0, currency)),
			);

			const table = h("table", { className: "tup-table" },
				h("thead", null, h("tr", null, [
					t("colDate"), t("colModel"), t("colInput"), t("colOutput"), t("colCacheRead"), t("colCacheWrite"), t("colTotal"), t("colCost"),
				].map((label) => h("th", { key: label }, label)))),
				h("tbody", null, months.flatMap((group) => {
					const open = openSet.has(group.month);
					const header = h("tr", { key: "month:" + group.month, className: "tup-month-row" },
						h("td", { colSpan: 8 },
							h("button", {
								type: "button",
								className: "tup-month",
								"aria-expanded": open,
								onClick: () => toggleMonth(group.month),
							}, (open ? "▾ " : "▸ ") + group.month + "　" + t("monthSummary", {
								tokens: exact(bucketTotal(group.tokens)),
								price: group.priced === false ? t("partial") : priceText(group.cost, group.currency),
							}))));
					if (!open) return [header];
					return [header, ...group.days.flatMap((day) => [
						...(day.models ?? []).map((model) => modelRow(day, model)),
						totalRow(day),
					])];
				})),
			);

			const unpriced = report.unpricedModels ?? [];
			const stale = report.build === undefined;
			const peakTokens = totals.peakTokens ?? 0;
			const offPeakTokens = totals.offPeakTokens ?? 0;
			const sessionRows = (report.sessions ?? [])
				.filter((row) => row.tokens !== undefined && bucketTotal(row.tokens) > 0)
				.sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0));
			const conversationRows = (report.conversations ?? [])
				.filter((row) => bucketTotal(row.tokens) > 0);
			const visibleConversations = conversationRows.slice(0, limits.conversations);
			const visibleSessions = sessionRows.slice(0, limits.sessions);

			/** CSV: one row per day × model, plus a day-total row. */
			const exportDaily = () => {
				const rows = [[
					t("colDate"), t("colModel"), t("colInput"), t("colOutput"), t("colCacheRead"),
					t("colCacheWrite"), t("colTotal"), t("csvPeak"), t("csvOff"), t("colCost"),
					t("csvCurrency"), t("csvPriced"),
				]];
				for (const day of report.days ?? []) {
					for (const model of day.models ?? []) {
						rows.push([
							day.day, model.model, model.tokens.input, model.tokens.output,
							model.tokens.cacheRead, model.tokens.cacheWrite, bucketTotal(model.tokens),
							model.peakTokens ?? 0, model.offPeakTokens ?? 0,
							(model.cost ?? 0).toFixed(4), model.currency ?? currency,
							model.priced === false ? t("csvNo") : t("csvYes"),
						]);
					}
					rows.push([
						day.day, t("csvDayTotal"), day.tokens.input, day.tokens.output,
						day.tokens.cacheRead, day.tokens.cacheWrite, bucketTotal(day.tokens),
						day.peakTokens ?? 0, day.offPeakTokens ?? 0,
						(day.cost ?? 0).toFixed(4), day.currency ?? currency,
						day.priced === false ? t("csvNo") : t("csvYes"),
					]);
				}
				downloadCsv(`dsh-token-usage-daily-${range}-${today}.csv`, toCsv(rows));
			};

			/** CSV: one row per session, with its conversation root. */
			const exportSessions = () => {
				const rows = [[
					t("csvSessionTitle"), t("csvSessionId"), t("colKind"), t("colStart"),
					t("colInput"), t("colOutput"), t("colCacheRead"), t("colCacheWrite"), t("colTotal"),
					t("colCost"), t("csvCurrency"), t("csvPriced"),
					t("csvRootTitle"), t("csvRootId"),
				]];
				for (const row of sessionRows) {
					const rootId = rootSessionOf(report, row);
					const root = (report.sessions ?? []).find((entry) => entry.id === rootId);
					rows.push([
						sessionLabel(row), row.id,
						(row.delegationDepth ?? 0) > 0 ? t("subagent") : t("mainSession"),
						row.createdAt === undefined ? "" : new Date(row.createdAt).toISOString(),
						row.tokens.input, row.tokens.output, row.tokens.cacheRead, row.tokens.cacheWrite,
						bucketTotal(row.tokens), (row.cost ?? 0).toFixed(4), row.currency ?? currency,
						row.priced === false ? t("csvNo") : t("csvYes"),
						root === undefined ? "" : sessionLabel(root), rootId,
					]);
				}
				downloadCsv(`dsh-token-usage-sessions-${range}-${today}.csv`, toCsv(rows));
			};
			return h("div", { className: "tup-page" },
				h("div", { className: "tup-inner" },
				head,
				stale && h("p", { className: "tup-warn" }, t("hostStaleHint")),
				h("div", { className: "tup-cards" }, cards.map(([label, value]) => h("div", { key: label, className: "tup-card" },
					h("span", { className: "tup-cardLabel" }, label),
					h("span", { className: "tup-cardValue" }, value),
				))),
				(peakTokens + offPeakTokens) > 0 && h("p", { className: "tup-sub" }, t("tierSplit", {
					peak: exact(peakTokens),
					off: exact(offPeakTokens),
				})),
				unpriced.length > 0 && h("p", { className: "tup-warn" }, t("unpricedModels", { models: unpriced.join("、") })),
				unpriced.length > 0 && report.pricesFile !== undefined && h("p", { className: "tup-sub" }, t("pricesFile", { file: report.pricesFile })),
				h("div", { className: "tup-toolbar" },
					h("button", { type: "button", className: "tup-button tup-buttonSmall", onClick: exportDaily }, t("exportDaily")),
					h("button", { type: "button", className: "tup-button tup-buttonSmall", onClick: exportSessions }, t("exportSessions")),
				),
				h("div", { className: "tup-sectionHead" },
					h("h2", { className: "tup-title", style: { fontSize: 14 } }, t("dailyTitle", { months: months.length })),
					months.length > 1 && h("button", {
						type: "button",
						className: "tup-button tup-buttonSmall",
						onClick: () => setOpenMonths(allOpen ? new Set() : new Set(months.map((group) => group.month))),
					}, allOpen ? t("collapseAll") : t("expandAll")),
				),
				report.days === undefined || report.days.length === 0
					? h("p", { className: "tup-sub" }, t("empty"))
					: h("div", { className: "tup-tableWrap" }, table),
				sessionRows.length > 0 && h("div", null,
					h("h2", { className: "tup-title", style: { fontSize: 14, margin: "28px auto 8px", maxWidth: 1080 } }, t("conversationsTitle")),
					h("p", { className: "tup-sub", style: { maxWidth: 1080, margin: "0 auto 8px" } }, t("conversationsHint")),
					h("div", { className: "tup-tableWrap" }, h("table", { className: "tup-table" },
						h("thead", null, h("tr", null, [
							t("colConversation"), t("colSubagents"), t("colTotal"), t("colCost"),
						].map((label) => h("th", { key: label }, label)))),
						h("tbody", null, visibleConversations.map((row) => h("tr", { key: row.id },
							h("td", { className: "tup-model", title: row.id }, sessionLabel(row)),
							h("td", { className: "tup-day" }, row.subagents > 0 ? t("subagentCount", { count: row.subagents }) : "—"),
							h("td", null, exact(bucketTotal(row.tokens))),
							h("td", { className: row.priced === false ? "tup-unpriced" : undefined },
								row.priced === false ? t("unpriced") : priceText(row.cost ?? 0, row.currency ?? currency)),
						))),
					)),
					conversationRows.length > visibleConversations.length && h("button", {
						type: "button",
						className: "tup-more",
						onClick: () => setLimits((prev) => ({ ...prev, conversations: prev.conversations + 50 })),
					}, t("showMore", { shown: visibleConversations.length, total: conversationRows.length })),
				),
				sessionRows.length > 0 && h("div", null,
					h("h2", { className: "tup-title", style: { fontSize: 14, margin: "28px auto 8px", maxWidth: 1080 } }, t("sessionsTitle")),
					h("p", { className: "tup-sub", style: { maxWidth: 1080, margin: "0 auto 8px" } }, t("sessionsHint")),
					h("div", { className: "tup-tableWrap" }, h("table", { className: "tup-table" },
						h("thead", null, h("tr", null, [
							t("colSession"), t("colStart"), t("colKind"), t("colTotal"), t("colCost"),
						].map((label) => h("th", { key: label }, label)))),
						h("tbody", null, visibleSessions.map((row) => h("tr", { key: row.id },
							h("td", { className: "tup-model", title: row.id }, sessionOptionLabel(row)),
							h("td", { className: "tup-day" }, row.createdAt === undefined ? "—" : new Date(row.createdAt).toLocaleString()),
							h("td", { className: "tup-day" }, (row.delegationDepth ?? 0) > 0 ? t("subagent") : t("mainSession")),
							h("td", null, exact(bucketTotal(row.tokens))),
							h("td", { className: row.priced === false ? "tup-unpriced" : undefined },
								row.priced === false ? t("unpriced") : priceText(row.cost ?? 0, row.currency ?? currency)),
						))),
					)),
					sessionRows.length > visibleSessions.length && h("button", {
						type: "button",
						className: "tup-more",
						onClick: () => setLimits((prev) => ({ ...prev, sessions: prev.sessions + 50 })),
					}, t("showMore", { shown: visibleSessions.length, total: sessionRows.length })),
				),
				h("p", { className: "tup-foot" }, t("estimateHint")),
				h("p", { className: "tup-foot" }, t("diag", {
					build: report.build ?? "none",
					cached: report.cached === true ? "cached" : "fresh",
					at: new Date(report.generatedAt ?? Date.now()).toLocaleTimeString(),
					priced: String((report.days ?? []).flatMap(d => d.models ?? []).filter(m => m.priced !== false).length),
					unpriced: String(unpriced.length),
					reused: String(report.cacheStats?.reused ?? 0),
					sessions: String(report.cacheStats?.sessions ?? report.sessionCount ?? 0),
				})),
				),
			);
		}

		/** The compact sidebar row icon. */
		function UsageIcon({ size = 18 }) {
			return h("svg", {
				viewBox: "0 0 16 16",
				width: size,
				height: size,
				"aria-hidden": true,
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.3,
			}, [
				h("circle", { key: "c", cx: 8, cy: 8, r: 6.2 }),
				h("path", {
					key: "p",
					d: "M8 4.4v7.2M10.2 6c-.5-.5-1.3-.8-2.1-.8-1.1 0-1.9.6-1.9 1.5 0 1 .9 1.3 2 1.6 1.2.3 2 .7 2 1.6 0 .9-.9 1.5-2.1 1.5-.9 0-1.7-.3-2.3-.9",
				}),
			]);
		}
		//#endregion

		//#region dictionaries
		const NS = "tokenCost";
		const zh = {
			title: "本对话花费（含子代理）",
			byModel: "按模型（本对话）",
			daily: "最近每日用量（全部会话）",
			sessionScope: "本会话",
			subagentList: "子代理会话明细",
			uncachedInput: "未缓存输入",
			cacheRead: "缓存读取",
			cacheWrite: "缓存写入",
			output: "输出",
			unpriced: "未定价",
			partial: "部分未定价",
			unpricedHint: "有模型未配置单价，金额只统计已定价模型。请编辑插件目录下的 prices.json 后点刷新。",
			estimateHint: "按 provider/model 单价估算（Flash 系列按北京时间高峰/空闲分时计价），非账单金额。",
			loading: "正在统计…",
			refreshing: "统计中…",
			refresh: "刷新",
			summary: "本对话花费 {price}（{tokens} tokens，含 {subagents} 个子代理）",
			setPrice: "定价",
			setPriceHint: "还没有配置模型单价：编辑插件目录下的 prices.json 填写每 1M tokens 的价格即可显示花费。",
			pageTitle: "Token 用量与成本",
			pageSub: "共 {sessions} 个会话 · 时区 {timeZone} · 统计于 {at}",
			cardTokens: "累计 tokens",
			cardCost: "累计花费",
			cardToday: "今日花费",
			cardSessions: "会话数",
			colDate: "日期",
			colModel: "模型",
			colInput: "未缓存输入",
			colOutput: "输出",
			colCacheRead: "缓存读取",
			colCacheWrite: "缓存写入",
			colTotal: "合计 tokens",
			colCost: "成本",
			rowTotal: "当日合计",
			unpricedModels: "未配置单价的模型：{models}（这些模型的用量不计入金额）",
			pricesFile: "单价文件：{file}",
			hostStale: "宿主旧版",
			hostStaleHint: "页面拿到的是旧版宿主数据（没有 build 标记），金额不会更新：请关闭并重新打开 DSH 桌面应用，或重载该插件条目后再刷新。",
			diag: "诊断：build={build} · {cached} · 生成于 {at} · 已定价行 {priced} · 未定价行 {unpriced} · 会话缓存复用 {reused}/{sessions}",
			dailyTitle: "每日用量（按月折叠，共 {months} 个月）",
			rangeAll: "全部",
			rangeDays: "近 {days} 天",
			exportDaily: "导出日×模型 CSV",
			exportSessions: "导出会话 CSV",
			csvPeak: "高峰 tokens",
			csvOff: "空闲 tokens",
			csvCurrency: "货币",
			csvPriced: "是否定价",
			csvYes: "是",
			csvNo: "否",
			csvDayTotal: "（当日合计）",
			csvSessionTitle: "会话标题",
			csvSessionId: "会话 ID",
			csvRootTitle: "所属对话",
			csvRootId: "所属对话 ID",
			monthSummary: "{tokens} tokens · {price}",
			expandAll: "展开全部",
			collapseAll: "收起全部",
			showMore: "显示更多（已显示 {shown} / 共 {total}）",
			tierSplit: "其中高峰 {peak} tok、空闲 {off} tok（空闲档单价减半）",
			sessionsTitle: "按会话（含子代理）",
			sessionsHint: "胶囊只统计当前会话；这里的合计才等于上面的「累计 tokens / 累计花费」。",
			conversationsTitle: "按对话（合并子代理）",
			conversationsHint: "DSH 里子代理是独立 session，内置的会话 token 统计不会合并它们；这里把同一对话的子代理用量并到根会话。",
			colConversation: "对话（根会话）",
			colSubagents: "子代理",
			subagentCount: "{count} 个",
			conversationTotal: "本对话合计（含子代理）",
			subagents: "子代理会话 {count} 个",
			colSession: "会话",
			colStart: "开始时间",
			colKind: "类型",
			subagent: "子代理",
			mainSession: "主会话",
			empty: "还没有可统计的用量。",
			panel: "用量与成本",
		};
		const en = {
			title: "Conversation spend (with subagents)",
			byModel: "By model (conversation)",
			daily: "Recent daily usage (all sessions)",
			sessionScope: "This session",
			subagentList: "Subagent sessions",
			uncachedInput: "Uncached input",
			cacheRead: "Cache read",
			cacheWrite: "Cache write",
			output: "Output",
			unpriced: "no price",
			partial: "partly unpriced",
			unpricedHint: "Some models have no price configured; only priced models are counted. Edit prices.json in the plugin directory and refresh.",
			estimateHint: "Estimated from provider/model rates (Flash tiers by Beijing peak/off-peak), not a bill.",
			loading: "Calculating…",
			refreshing: "Calculating…",
			refresh: "Refresh",
			summary: "Conversation spend {price} ({tokens} tokens, {subagents} subagents)",
			setPrice: "Set price",
			setPriceHint: "No model price configured yet. Edit prices.json in the plugin directory (per 1M tokens) to show spend.",
			pageTitle: "Token usage and spend",
			pageSub: "{sessions} sessions · time zone {timeZone} · generated {at}",
			cardTokens: "Total tokens",
			cardCost: "Total spend",
			cardToday: "Today",
			cardSessions: "Sessions",
			colDate: "Date",
			colModel: "Model",
			colInput: "Uncached input",
			colOutput: "Output",
			colCacheRead: "Cache read",
			colCacheWrite: "Cache write",
			colTotal: "Total tokens",
			colCost: "Cost",
			rowTotal: "Day total",
			unpricedModels: "Models without a price: {models} (their usage is not costed)",
			pricesFile: "Price file: {file}",
			hostStale: "stale host",
			hostStaleHint: "The page got a report from an older host build (no build marker), so the amount cannot update. Close and reopen DSH, or reload the plugin entry, then refresh.",
			diag: "Diagnostics: build={build} · {cached} · generated {at} · priced rows {priced} · unpriced rows {unpriced} · session cache reused {reused}/{sessions}",
			dailyTitle: "Daily usage ({months} months)",
			rangeAll: "All",
			rangeDays: "Last {days} days",
			exportDaily: "Export daily CSV",
			exportSessions: "Export sessions CSV",
			csvPeak: "Peak tokens",
			csvOff: "Off-peak tokens",
			csvCurrency: "Currency",
			csvPriced: "Priced",
			csvYes: "yes",
			csvNo: "no",
			csvDayTotal: "(day total)",
			csvSessionTitle: "Session title",
			csvSessionId: "Session id",
			csvRootTitle: "Conversation",
			csvRootId: "Conversation id",
			monthSummary: "{tokens} tokens · {price}",
			expandAll: "Expand all",
			collapseAll: "Collapse all",
			showMore: "Show more ({shown} of {total})",
			tierSplit: "Peak {peak} tok, off-peak {off} tok (off-peak is half price)",
			sessionsTitle: "By session (subagents included)",
			sessionsHint: "The chip counts the open session only; this table adds up to the totals above.",
			conversationsTitle: "By conversation (subagents merged)",
			conversationsHint: "Subagents run as their own sessions, so the built-in per-session token usage never merges them; this table folds each conversation's subagents into its root session.",
			colConversation: "Conversation (root session)",
			colSubagents: "Subagents",
			subagentCount: "{count}",
			conversationTotal: "Conversation total (with subagents)",
			subagents: "{count} subagent sessions",
			colSession: "Session",
			colStart: "Started",
			colKind: "Kind",
			subagent: "subagent",
			mainSession: "main",
			empty: "No usage recorded yet.",
			panel: "Usage & spend",
		};
		//#endregion

		const inject = ["slots", "locale"];

		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "token-usage: dictionaries");
			ctx.slots.inject("conversation.composer.dock", function* () {
				yield ctx.slots.register({
					name: "conversation.composer.dock",
					id: "token-cost",
					order: 2,
					locale: NS,
				}, CostPill);
			});
			ctx.slots.inject("main", function* () {
				yield ctx.slots.register({
					name: "main",
					key: "token-usage",
					locale: NS,
				}, UsagePage);
			});
			ctx.slots.inject("sidebar.panellist", function* () {
				yield ctx.slots.register({
					name: "sidebar.panellist",
					id: "token-usage",
					order: 20,
					label: () => ctx.locale.bind(NS)("panel"),
					locale: NS,
				}, UsageIcon);
			});
		}

		exports.NS = NS;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
