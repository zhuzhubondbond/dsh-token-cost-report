#!/usr/bin/env node
/**
 * CLI wrapper: print the per-day × per-model token/cost report as Markdown.
 *
 * Usage:
 *   node bin/report.mjs [--prices <file>] [--since YYYY-MM-DD] [--until YYYY-MM-DD] [--json] [--out <file>]
 *
 * Prices resolve like the plugin does: --prices, then
 * $DSH_HOME/token-usage-prices.json, then the packaged ./prices.json.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { aggregate } from '../lib/aggregate.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const pkgRoot = resolve(here, '..')

/** Minimal argv parsing for the documented flags. */
function parseArgs(argv) {
  const args = { json: false }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--json') args.json = true
    else if (arg === '--prices') args.prices = argv[++i]
    else if (arg === '--since') args.since = argv[++i]
    else if (arg === '--until') args.until = argv[++i]
    else if (arg === '--out') args.out = argv[++i]
    else if (arg === '--help' || arg === '-h') args.help = true
    else throw new Error(`unknown argument: ${arg}`)
  }
  return args
}

const num = n => new Intl.NumberFormat('en-US').format(n)
const money = (value, currency) => `${value.toFixed(4)} ${currency}`

/** Render the Markdown table. */
function toMarkdown(report) {
  const lines = []
  lines.push(`# DSH Token 用量与成本报告`)
  lines.push('')
  lines.push(`生成时间：${new Date(report.generatedAt).toLocaleString('zh-CN', { timeZone: report.timeZone })}  `)
  lines.push(`时区：${report.timeZone}  ·  会话数：${report.sessionCount}  ·  计价货币：${report.currency}  `)
  lines.push('')
  lines.push('| 日期 | 模型 | 未缓存输入 | 输出 | 缓存读取 | 缓存写入 | 合计 tokens | 成本 |')
  lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |')
  for (const day of report.days) {
    for (const row of day.models) {
      const total = row.tokens.input + row.tokens.output + row.tokens.cacheRead + row.tokens.cacheWrite
      lines.push(`| ${day.day} | ${row.provider}/${row.model} | ${num(row.tokens.input)} | ${num(row.tokens.output)} | ${num(row.tokens.cacheRead)} | ${num(row.tokens.cacheWrite)} | ${num(total)} | ${row.priced ? money(row.cost, row.currency) : '未配置单价'} |`)
    }
    lines.push(`| **${day.day} 合计** | — | ${num(day.tokens.input)} | ${num(day.tokens.output)} | ${num(day.tokens.cacheRead)} | ${num(day.tokens.cacheWrite)} | ${num(day.tokens.input + day.tokens.output + day.tokens.cacheRead + day.tokens.cacheWrite)} | ${day.priced ? money(day.cost, day.currency ?? report.currency) : '部分未配置'} |`)
  }
  lines.push('')
  lines.push(`**总计**：${num(report.totals.totalTokens)} tokens，${money(report.totals.totalCost, report.currency)}`)
  if (report.unpricedModels.length) {
    lines.push('')
    lines.push(`> 未配置单价的模型：${report.unpricedModels.join('、')}（成本按 0 计，请在 prices.json 中补全）`)
  }
  return lines.join('\n')
}

const args = parseArgs(process.argv.slice(2))
if (args.help) {
  console.log('node bin/report.mjs [--prices <file>] [--since YYYY-MM-DD] [--until YYYY-MM-DD] [--json] [--out <file>]')
  process.exit(0)
}

const homeDir = process.env.DSH_HOME ?? join(homedir(), '.dsh')
const userPriceFile = join(homeDir, 'token-usage-prices.json')
const priceFile = args.prices
  ? resolve(args.prices)
  : existsSync(userPriceFile) ? userPriceFile : join(pkgRoot, 'prices.json')
const prices = existsSync(priceFile) ? JSON.parse(readFileSync(priceFile, 'utf8')) : { currency: 'CNY', providers: {} }
const report = aggregate({ homeDir, prices, since: args.since, until: args.until })

if (args.json) {
  const text = JSON.stringify(report, null, 2)
  if (args.out) writeFileSync(args.out, text)
  else console.log(text)
} else {
  const markdown = toMarkdown(report)
  if (args.out) { writeFileSync(args.out, markdown); console.log(`written: ${args.out}`) }
  else console.log(markdown)
}
