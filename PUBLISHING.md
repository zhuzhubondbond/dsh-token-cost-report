# 发布与分发说明（维护者）

本包是 DSH 的**组合包（bundle）+ 客户端插件**，一个包同时提供宿主半与浏览器半，无需单独构建 Web 前端。

## 包结构

```
dsh-token-cost-report/
  package.json          # dsh.bundle.patch / dsh.client.platform / exports["./client"]
  cordis.patch.yml      # bundle 层：插入一行 { id: token-usage, name: 'dsh-token-cost-report' }
  lib/index.js          # 宿主：/api/token-usage/daily（connection.fetch 精确路由）、聚合、增量缓存
  lib/aggregate.mjs     # 纯 fold：事件 → 日×模型/会话/对话 + 峰谷计价
  lib/entry.js          # 可选 shim：本地开发时用来触发条目重载（分发时无副作用）
  lib/client.js         # 浏览器 bundle：window.__ModuleLoader__.load({ id, factory }) 普通脚本
  prices.json           # 打包的样例价目表（首次运行复制到 $DSH_HOME）
  bin/report.mjs        # 命令行报告
  README.md / PUBLISHING.md / LICENSE
```

## 改包名时的硬性约束

`lib/client.js` 第一行的 `id` **必须等于 package.json 的 `name`**（client-modules 按包名把 bundle 挂到启动图上）。
如果改成 scoped 包名（如 `@you/your-name`），要同步修改：

1. `lib/client.js` 的 `window.__ModuleLoader__.load({ id: "@you/your-name", ... })`；
2. `cordis.patch.yml` 里的 `name:`；
3. `package.json` 的 `name`。

## 本地验证（发布前必做）

```pwsh
cd D:\Harness\plugins\dsh-token-cost-report

# 1) 语法与模块自检
node --check lib/client.js
node -e "import('./lib/entry.js').then(m => console.log(m.inject))"

# 2) 打 tarball，检查内容清单
npm pack --dry-run
npm pack --pack-destination D:\Harness\dist

# 3) 模拟安装：解到临时目录后按包名解析（相当于 profile 的 node_modules）
$tmp = Join-Path $env:TEMP 'dsh-token-cost-report-check'
Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force $tmp | Out-Null
npm install --prefix $tmp (Get-ChildItem D:\Harness\dist\dsh-token-cost-report-*.tgz | Select-Object -Last 1).FullName
node --input-type=module -e "import('file:///' + str_replace([char]92,'/',[string](Join-Path $env:TEMP 'dsh-token-cost-report-check\node_modules\dsh-token-cost-report\lib\entry.js'))).then(m => console.log('ok', m.inject))"
```

再看一眼：解包目录里 `package.json` 有 `dsh.bundle.patch`、`exports["./client"]`，且 `lib/client.js` 的 `id` 与包名一致。

## 发布到 npm

```pwsh
cd D:\Harness\plugins\dsh-token-cost-report
npm login                      # 或配置 .npmrc token
# 先改 package.json 的 name / version（首次发布建议 scoped 名，避免重名）
npm publish --access public
```

发布后他人可直接在 Plugin Manager 里填 `dsh-token-cost-report`（或你的 scoped 名）安装。
注意 npm 的 `files` 白名单已包含运行所需文件；`private` 字段**必须不存在**（当前已移除）。

## 其它分发方式

| 方式 | 对方怎么装 | 备注 |
|---|---|---|
| tarball | 把 `dist\dsh-token-cost-report-<ver>.tgz` 发给对方，Plugin Manager 填绝对路径 | 最省事，不需要 npm 账号 |
| Git | `git+https://github.com/<you>/dsh-token-cost-report.git` | 对方需能访问仓库；安装走 pnpm 的 git 解析 |
| 源码目录 | 对方把目录放到本机，Plugin Manager 填绝对目录路径 | 等价于 `link:`，改代码后需重载条目 |

## 升级与兼容性

- `package.json` 里 `engines.dsh: ">=0.2.2-rc.1"` 是 DSH 版本门槛；插件管理器在安装/更新时会校验，
  不满足会拒绝安装（DSH 支持「版本豁免」机制，谨慎使用）。
- 依赖的宿主服务：`connection`（/api 精确路由）、`sessionQuery`（读会话）；
  `sessionPersistence` 通过 `ctx.get()` 可选使用（拿不到就退化为全量重算）。
- 客户端只 `require` 启动图 seed 里的模块（`react`、`react-dom`），没有额外 external 依赖。

## 价格文件的发布策略

- 包内 `prices.json` 是**样例/模板**：当前填的是火山方舟 2026-11-09 官方价，首次运行会复制到
  `$DSH_HOME/token-usage-prices.json`，之后用户编辑用户文件，升级不会覆盖。
- 如果你不想把样例价发出去，把包内 `prices.json` 里各模型改成 `null` 即可（界面会显示「未定价」并要求填表）。
- 不要把任何账号、密钥、私有计费信息写进 `prices.json`。

## 本地开发时的重载

宿主代码（`lib/index.js` / `lib/aggregate.mjs`）改动不会随页面刷新生效：profile patch 的入口在
`lib/index.js` ⇄ `lib/entry.js` 之间切换一次可触发条目重启（这是 `entry.js` 唯一用途）；
页面标题下的 `build=...` 与「诊断」行会显示当前实际运行的宿主版本。
