# dsh-token-cost-report

English | 中文

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 用的用量与花费统计插件：

- **输入框下方花费胶囊**：显示当前对话（含所有子代理会话）的累计花费，点开看 token 四个桶、子代理明细、按模型、最近每日用量。
- **左侧边栏「用量与成本」页**：累计 tokens / 累计花费 / 今日花费 / 会话数；按月的日×模型明细表；按对话（合并子代理）与按会话两张表。
- **峰谷分时计价**：支持「高峰/空闲」两档（按本地时区与高峰窗口判定，按请求完成时间落档），也支持固定单价。
- **时间范围筛选**：近 7 / 30 / 90 天 / 全部；卡片与表格都按范围重算（「今日花费」固定为今天）。
- **CSV 导出**：日×模型、按会话两张表，UTF-8 BOM，Excel 直接打开。
- **大数据量友好**：日表按月折叠、长表分页、宿主按会话增量缓存（刷新只重算变化的会话）。

## 安装

前提：DSH 版本 ≥ `0.2.2-rc.1`（Web GUI 形态；桌面版与 `dsh web` 都可用）。

### 方式 A：Plugin Manager（推荐）

1. 打开 DSH Web GUI → 左侧边栏 **插件**（或设置 → 插件）；
2. 找到「安装组合包 / Install bundle」入口，填入以下任一 spec：
   - npm 包名：`dsh-token-cost-report`（若已发布到 npm）；
   - 本地目录/压缩包绝对路径：`D:\path\to\dsh-token-cost-report-0.2.0.tgz`；
   - Git 地址：`git+https://github.com/<you>/dsh-token-cost-report.git`；
3. 安装完成后插件默认启用，刷新页面即可看到侧边栏入口与胶囊。

### 方式 B：CLI

```pwsh
# 桌面版自带 pnpm，无需另装
dsh plugin --profile desktop install dsh-token-cost-report
# 或本地包： dsh plugin --profile desktop install D:\path\to\dsh-token-cost-report-0.2.0.tgz
```

### 方式 C：本地开发（profile patch，不走安装器）

```yaml
# <profile 目录>/cordis.patch.yml
- insert:
    - id: token-usage
      name: 'D:/path/to/dsh-token-cost-report/lib/index.js'
```

> 注意：**同一个包只能有一个活动来源**。已经用 patch 挂载时不要再安装 bundle，反之亦然，否则启动时会报重复来源。

### 方式 D：通过「发现」安装（插件索引）

在 DSH 里打开 **插件 → 实验性「自定义插件索引」→ 发现 → 添加索引源**，填入：

```text
https://zhuzhubondbond.github.io/dsh-token-cost-report/index.json
```

## 第一次使用：填价格

DSH 内核只上报 token、不记录任何货币单价，所以成本由本插件按价目表估算。

- 首次加载时，插件会把包内模板复制到 **`$DSH_HOME/token-usage-prices.json`**
  （Windows 默认 `C:\Users\<你>\.dsh\token-usage-prices.json`）；
- 编辑这个文件即可，**不会**被插件升级覆盖；页面上的「未配置单价」提示会显示该路径；
- 也可以在自己的 profile patch 里用 `pricesFile` 指向任意路径。

格式（每 1,000,000 tokens，货币由 `currency` 决定）：

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

- `input` = 未缓存输入，`output` = 输出，`cacheRead` = 缓存命中读取，`cacheWrite` = 缓存写入；
  `cacheRead`/`cacheWrite` 省略时按 `input` 计；
- `input` 或 `output` 为 `null` 的条目不参与计价（显示「未定价」，不会算成 0 元）；
- 只有显式声明 `offPeak` 且配置了 `offPeakSchedule` 的模型才分时计价，其余按固定单价；
- 包内自带的 `prices.json` 是**空模板**（模型 id 齐全、单价为 null），请把单价填进用户价格文件；
  示例数值见下方「官方价参考」。

改完点胶囊或页面上的「刷新」即生效（宿主每次重算都会重读价格文件，无需重启）。

### 官方价参考

**DeepSeek 官方 API**（`provider: deepseek-account`，2026-11-11，来源
[模型 & 价格](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/)，每百万 tokens，CNY）：

| 模型 | 高峰 输入/缓存命中/输出 | 空闲 输入/缓存命中/输出 |
|---|---|---|
| `deepseek-flash`（DeepSeek-V4.1-Flash） | 2.00 / 0.04 / 8.00 | 1.00 / 0.02 / 4.00 |
| `deepseek-v4-pro`（DeepSeek-V4-Pro） | 9.00 / 0.30 / 27.00 | 4.50 / 0.15 / 13.50 |

- 高峰：北京时间**周一至周五**（不含法定节假日）`09:00–12:00`、`14:00–18:00`；其余为空闲，空闲价 = 高峰价一半，按请求完成时间判定。
- ⚠️ 插件没有节假日日历，法定节假日会按高峰计（偏保守、略偏高）。

**火山方舟**（`provider: volcengine`）示例：`deepseek-v4-1-flash-261017` 高峰 2 / 8 / 0.04，空闲 1 / 4 / 0.02；
其余模型见火山方舟官方页，按需补进 `providers.volcengine.models`。

## 数据口径

- 数据源：本机会话日志，经 DSH 公开的 `ctx.sessionQuery` 读取（`listSessions` + `readSession`），**不联网、不调用模型**。
- 每条结算取 provider 上报的 `assistant/message.data.usage`；`assistant/attempt`（失败/重试的尝试）也计入；
  同 `(turn, step)` 后采样替换前采样、`llm/retry-started` 关槽——与内核 `tokenUsage` 投影一致，重试不重复计费。
- 用量归属到它之前最近一次 `request/header` 的 `provider/model`；按浏览器时区的本地日历日分桶。
- **子代理会话**：DSH 里子代理是独立 session（`session` 头 `parentSession` 指向根会话）。内置会话统计不合并它们，
  本插件在胶囊与「按对话」表里按根会话合并，避免多 agent 对话被低估。
- 时间是推导值：峰谷判定用结算事件的完成时间。

## 已知限制

- **是估算不是账单**：没有折扣/阶梯价/发票口径；分段计费模型（如按上下文长度分档）只按单档单价计算。
- **节假日按高峰计**：官方规则里中国法定节假日全天为空闲时段，插件没有节假日日历，节假日会按高峰价计算（偏高，偏保守）。
- 图片模型（按张）与视频模型（按视频 token）无法用 token 价格表达，保持未定价。
- 花费用 `prices.json` 估算；未配置单价的模型只统计 token。
- 数据只来自本机历史，换机器/删日志后不可恢复。
- 目前只提供 Web GUI 界面（`dsh.client.platform = "web"`）。

## 命令行报告

```pwsh
node bin/report.mjs                     # Markdown 表格
node bin/report.mjs --json              # JSON
node bin/report.mjs --since 2026-11-01  # 起始日期
node bin/report.mjs --until 2026-11-30  # 结束日期
node bin/report.mjs --prices ./my.json  # 指定价目表
```

## 升级 / 卸载

- 升级：Plugin Manager 里对该组合包选择更新到新版本，或重新安装新的 tgz；价格文件在 `$DSH_HOME` 下，升级不会丢。
- 卸载：Plugin Manager 关闭/移除该组合包；或删掉 profile patch 里的 `token-usage` 行。用户价格文件可自行保留或删除。

## 开发

见 [PUBLISHING.md](PUBLISHING.md)：包结构、改包名注意点、打包与发布步骤、本地验证方法。

## License

MIT
