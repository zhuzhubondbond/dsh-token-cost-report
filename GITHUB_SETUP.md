# 发布到 GitHub 与插件索引（操作清单）

> 这个目录已经是**可以直接推送到 GitHub 的仓库根**：插件源码 + 双语 README + CHANGELOG + 演示脚本 + 插件索引。
> 下面命令默认 GitHub 用户名 `zhuzhubondbond`（你的 GitHub 账号，已确认存在；npm 用户名是 zhuzhubond，两者不同）；**若不是你的账号，全局替换**。

## 发布记录（npm）

| 版本 | 时间（UTC） | 状态 |
|---|---|---|
| 0.2.0 | 2026-11-10T07:15:50Z（staging 占位）→ 实际首发见 `npm view` | 已被 0.2.1 取代 |
| 0.2.1 | 2026-11-11T07:17:28Z | **live**，`latest` 指向 0.2.1 |

> 注意：首次发布时用了一个 **stage-only** token，registry 里会保留一条 `0.0.0-stage` 占位版本（`npm view dsh-token-cost-report versions` 可见）。
> `latest` 已指向 0.2.1，按包名安装拿到的就是 0.2.1；占位版本无实际内容，可忽略（如需清理：npmjs.com → Settings → Staged Packages → Reject，需 2FA）。

## 0. 先确认身份

```pwsh
cd D:\Harness\repo\dsh-token-cost-report
git config user.name
git config user.email
# 若未配置：
# git config --global user.name "zhuzhubondbond"
# git config --global user.email "你的邮箱"
```

## 1. 初始化并提交

```pwsh
cd D:\Harness\repo\dsh-token-cost-report
git init -b main
git add -A
git commit -m "chore: dsh-token-cost-report 0.2.1 - token usage & cost report for DeepSeek Harness"
```

## 2. 创建 GitHub 仓库并推送

**方式 A：网页创建（无需安装 gh）**

1. <https://github.com/new> → Repository name 填 `dsh-token-cost-report`；
2. 选 **Public**，**不要**勾选 "Add a README"（本地已有）；
3. 创建后按页面提示执行：

```pwsh
git remote add origin https://github.com/zhuzhubondbond/dsh-token-cost-report.git
git push -u origin main
```

**方式 B：gh CLI（若已安装）**

```pwsh
gh repo create zhuzhubondbond/dsh-token-cost-report --public --source . --remote origin --push
```

## 3. 加 `dsh-plugin` topic（官方点名的发现方式）

网页：仓库首页右侧 **About** → 齿轮 → Topics 填 `dsh-plugin`、`deepseek-harness`、`dsh`，保存。

或 API（需 token）：

```pwsh
curl -X PUT -H "Authorization: Bearer <你的 GitHub token>" `
  -H "Accept: application/vnd.github+json" `
  https://api.github.com/repos/zhuzhubondbond/dsh-token-cost-report/topics `
  -d '{"names":["dsh-plugin","deepseek-harness","dsh"]}'
```

## 4. 建 Release，附上 tgz（已完成）

> 已完成：
> - `v0.2.1`，附件 `dsh-token-cost-report-0.2.1.tgz`（SHA1 `f8b1b402…`）
> - `v0.2.2`，附件 `dsh-token-cost-report-0.2.2.tgz`（SHA1 `6042d41c…`）
> 两个版本的 Release 附件 SHA1 均与 npm `dist.shasum` 一致。
> 以后发版请按下方命令，tag 与附件版本必须一致。

```pwsh
gh release create v0.2.1 D:\Harness\dist\dsh-token-cost-report-0.2.1.tgz `
  --title "v0.2.1 - chip stays live while a turn streams" `
  --notes-file CHANGELOG.md
```

> 没有 `gh` 就在网页 Release 里手动上传 `D:\Harness\dist\dsh-token-cost-report-0.2.1.tgz`。
> 用户也可以用 Git 安装：`dsh plugin --profile desktop install git+https://github.com/zhuzhubondbond/dsh-token-cost-report.git`。

## 5. 回填插件索引里的发布时间

`marketplace/index.json` 里 `publishTimestamp` 必须和 registry 的真实发布时间一致。一条命令完成（同时会把 npm 包里的改动同步到本仓库并刷新中文 README）：

```pwsh
node D:\Harness\tools\sync-publish.mjs
```

它读取 `package.json` 的版本、从 registry 取该版本的发布时间、更新 `marketplace/index.json`，然后可用官方校验器复验：

```pwsh
cd D:\Harness\.verify-market
node check.mjs
```

## 6. 发布索引，让插件在「发现」里可安装

DSH **不内置任何索引源**：索引是任意静态主机上的 `index.json`（+ `icons/`）。任选一种托管：

- GitHub Pages：把 `marketplace/` 设为 Pages 目录，索引地址形如 `https://zhuzhubondbond.github.io/dsh-token-cost-report/index.json`；
- 对象存储 / 任意 https 静态站：上传 `index.json` 与 `icons/`，保持两者同级引用关系。

之后在 DSH：**插件 → 实验性 → 自定义插件索引（开关）→ 发现 → 添加索引源**，填入上面的 URL。

## 7. 下一步：0.2.2（仓库元数据）

0.2.1 已发布，但 `package.json` 还没有 `repository` / `homepage` / `bugs`，npm 页面不会显示源码链接。0.2.2 补上（改动小、独立于功能）：

```jsonc
"repository": { "type": "git", "url": "git+https://github.com/zhuzhubondbond/dsh-token-cost-report.git" },
"homepage": "https://github.com/zhuzhubondbond/dsh-token-cost-report#readme",
"bugs": { "url": "https://github.com/zhuzhubondbond/dsh-token-cost-report/issues" },
"files": ["lib/index.js","lib/entry.js","lib/client.js","lib/aggregate.mjs","bin/report.mjs",
          "cordis.patch.yml","prices.json","README.md","README.zh.md","CHANGELOG.md","LICENSE"]
```

然后：

```pwsh
cd D:\Harness\plugins\dsh-token-cost-report
npm version patch --no-git-tag-version   # 0.2.1 -> 0.2.2
node D:\Harness\tools\verify-package.mjs
npm publish --access public               # 用带 Read and write 的 token；无需 OTP
```

> 注意：`lib/client.js` 里的客户端 bundle id 必须与包名一致；本包已是 `dsh-token-cost-report`，改元数据不影响。

## 8. token 与发布方式（重要）

- 首次发布用了一个 **Read and write (stage only)** 的 granular token，发布走的是 staging（registry 出现 `0.0.0-stage` 占位），之后才转为 0.2.1 live。
- 以后直接发布，建议新建 granular token：权限选 **Read and write**（**不要**选 stage only），勾选 **Bypass 2FA**，包范围 **All packages**；写进 `.npmrc` 后 `npm publish` 不再需要 OTP。
- 2027 年 1 月 npm 会移除 bypass-2FA token 的直发能力，届时改用 **GitHub Actions + OIDC trusted publishing**（可另外配置）。

## 9. 官方市场开放后

官方计划中的市场尚未随客户端发布（当前 0.2.2-rc.1 只有实验性自定义索引）。届时：

1. 确认 README / 插件详情页图文完整（官方市场会展示长描述与图标）；
2. 按官方公布的提交入口提交包名 `dsh-token-cost-report` 与版本；
3. 同步更新 `marketplace/index.json` 以便社区索引也能装到新版本。
