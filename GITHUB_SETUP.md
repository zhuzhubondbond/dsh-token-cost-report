# 发布到 GitHub 与插件索引（操作清单）

> 这个目录已经是**可以直接推送到 GitHub 的仓库根**：插件源码 + 双语 README + CHANGELOG + 演示脚本 + 插件索引。
> 下面命令默认 GitHub 用户名 `zhuzhubond`（与你的 npm 账号同名，已确认该账号存在）；**若不是你的账号，全局替换**。

## 0. 先确认身份

```pwsh
cd D:\Harness\repo\dsh-token-cost-report
git config user.name
git config user.email
# 若未配置：
# git config --global user.name "zhuzhubond"
# git config --global user.email "你的邮箱"
```

## 1. 初始化并提交

```pwsh
cd D:\Harness\repo\dsh-token-cost-report
git init -b main
git add -A
git commit -m "chore: dsh-token-cost-report 0.2.0 — token usage & cost report for DeepSeek Harness"
```

## 2. 创建 GitHub 仓库并推送

**方式 A：网页创建（无需安装 gh）**

1. <https://github.com/new> → Repository name 填 `dsh-token-cost-report`；
2. 选 **Public**，**不要**勾选 "Add a README"（本地已有）；
3. 创建后按页面提示执行：

```pwsh
git remote add origin https://github.com/zhuzhubond/dsh-token-cost-report.git
git push -u origin main
```

**方式 B：gh CLI（若已安装）**

```pwsh
gh repo create zhuzhubond/dsh-token-cost-report --public --source . --remote origin --push
```

## 3. 加 `dsh-plugin` topic（官方点名的发现方式）

网页：仓库首页右侧 **About** → 齿轮 → Topics 填 `dsh-plugin`、`deepseek-harness`、`dsh`，保存。

或 API（需 token）：

```pwsh
curl -X PUT -H "Authorization: Bearer <你的 GitHub token>" `
  -H "Accept: application/vnd.github+json" `
  https://api.github.com/repos/zhuzhubond/dsh-token-cost-report/topics `
  -d '{"names":["dsh-plugin","deepseek-harness","dsh"]}'
```

## 4. 建 Release，附上 tgz

```pwsh
gh release create v0.2.0 D:\Harness\dist\dsh-token-cost-report-0.2.0.tgz `
  --title "v0.2.0 — first public release" `
  --notes-file CHANGELOG.md
```

> 没有 `gh` 就在网页 Release 里手动上传 `D:\Harness\dist\dsh-token-cost-report-0.2.0.tgz`。
> 用户也可以用 Git 安装：`dsh plugin --profile desktop install git+https://github.com/zhuzhubond/dsh-token-cost-report.git`。

## 5. 修正插件索引里的发布时间

`marketplace/index.json` 里 `publishTimestamp: 0` 是占位。发布到 npm 后执行：

```pwsh
cd D:\Harness\repo\dsh-token-cost-report
node -e "const fs=require('fs');const cp=require('child_process');const t=JSON.parse(cp.execSync('npm view dsh-token-cost-report time --json',{encoding:'utf8'}));const sec=Math.floor(new Date(t['0.2.0']).getTime()/1000);const p='marketplace/index.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));j.plugins[0].versions[0].publishTimestamp=sec;fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n');console.log('publishTimestamp =',sec)"
```

## 6. 发布索引，让插件在「发现」里可安装

DSH **不内置任何索引源**：索引是任意静态主机上的 `index.json`（+ `icons/`）。任选一种托管：

- GitHub Pages：把 `marketplace/` 设为 Pages 目录，索引地址形如 `https://zhuzhubond.github.io/dsh-token-cost-report/index.json`；
- 对象存储 / 任意 https 静态站：上传 `index.json` 与 `icons/`，保持两者同级引用关系。

之后在 DSH：**插件 → 实验性 → 自定义插件索引（开关）→ 发现 → 添加索引源**，填入上面的 URL。

## 7. 下一步：0.2.1（仓库元数据）

当前 `package.json` 还没有 `repository` / `homepage` / `bugs`，npm 页面不会显示源码链接。建议 0.2.1 补上（改动小、独立于功能）：

```jsonc
"repository": { "type": "git", "url": "git+https://github.com/zhuzhubond/dsh-token-cost-report.git" },
"homepage": "https://github.com/zhuzhubond/dsh-token-cost-report#readme",
"bugs": { "url": "https://github.com/zhuzhubond/dsh-token-cost-report/issues" },
"files": ["lib/index.js","lib/entry.js","lib/client.js","lib/aggregate.mjs","bin/report.mjs",
          "cordis.patch.yml","prices.json","README.md","README.zh.md","CHANGELOG.md","LICENSE"]
```

然后：

```pwsh
cd D:\Harness\plugins\dsh-token-cost-report
npm version patch --no-git-tag-version   # 0.2.0 -> 0.2.1
node D:\Harness\tools\verify-package.mjs
npm publish --access public --otp=<当前验证码>   # 或先配好 bypass-2FA token
```

> 注意：`lib/client.js` 里的客户端 bundle id 必须与包名一致；本包已是 `dsh-token-cost-report`，改元数据不影响。

## 8. 官方市场开放后

官方计划中的市场尚未随客户端发布（当前 0.2.2-rc.1 只有实验性自定义索引）。届时：

1. 确认 README / 插件详情页图文完整（官方市场会展示长描述与图标）；
2. 按官方公布的提交入口提交包名 `dsh-token-cost-report` 与版本；
3. 同步更新 `marketplace/index.json` 以便社区索引也能装到新版本。
