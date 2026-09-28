<div align="center">

<img src="https://cdn.jsdelivr.net/gh/FwindEmiko/MiragEdge-DocWeb@main/.github/assets/hero.png" alt="MiragEdge 文档站" width="100%">

# MiragEdge 文档站

**锐界幻境 Minecraft Java / 基岩互通服务器 · 官方文档**

<a href="https://github.com/FwindEmiko/MiragEdge-DocWeb/stargazers"><img src="https://img.shields.io/github/stars/FwindEmiko/MiragEdge-DocWeb?style=flat-square&color=C8382F&labelColor=161B22&logo=github" alt="stars"></a>
<a href="LICENSE"><img src="https://img.shields.io/github/license/FwindEmiko/MiragEdge-DocWeb?style=flat-square&color=4FD1C5&labelColor=161B22" alt="license"></a>
<a href="https://github.com/FwindEmiko/MiragEdge-DocWeb/commits/main"><img src="https://img.shields.io/github/last-commit/FwindEmiko/MiragEdge-DocWeb?style=flat-square&color=8A93A3&labelColor=161B22&logo=git" alt="last commit"></a>
<a href="https://github.com/FwindEmiko/MiragEdge-DocWeb/graphs/contributors"><img src="https://img.shields.io/github/contributors/FwindEmiko/MiragEdge-DocWeb?style=flat-square&color=8A93A3&labelColor=161B22" alt="contributors"></a>
<img src="https://img.shields.io/badge/VitePress-1.6-4FD1C5?style=flat-square&labelColor=161B22&logo=vite&logoColor=white" alt="vitepress">
<img src="https://img.shields.io/badge/Node-22.x-3C873A?style=flat-square&labelColor=161B22&logo=nodedotjs&logoColor=white" alt="node">

[文档站](https://miragedge.top) · [官网](https://f.windemiko.top) · [玩家 Q 群](https://qm.qq.com/cgi-bin/qm/qr?k=r_yUquo3bQwX3bL97RwG1aVj41WIEOI3) · [Bilibili](https://space.bilibili.com/359174372) · [问题反馈](https://github.com/FwindEmiko/MiragEdge-DocWeb/issues)

</div>

---

## 这是什么

这里是**锐界幻境（MiragEdge）官方文档站的源码仓库** —— 文档内容、站点工程、自研构建脚本都在这里，**不包含服务端本体与游戏内数据**。

锐界幻境是一个基于高版本 Minecraft 的 **Java / 基岩双端互通生存服务器**：手机和电脑在同一张地图上玩，数据完全互通。本仓库负责把这些玩法讲清楚 —— 从怎么装客户端、怎么进服，到附魔怎么算、装备怎么锻、插件怎么写。

| 你是 | 去哪 |
| :--- | :--- |
| **想进来玩** | 打开 <https://miragedge.top>，从[新手引导](https://miragedge.top/start/)开始；加群绑定账号即可进服 |
| **想改文档** | 读[参与贡献](#参与贡献)，十分钟能提第一个 PR |
| **想看插件 / 服务端** | [特色功能](https://miragedge.top/plugins/) 与 [原创插件文档](https://miragedge.top/plugin-guides/) |

> 本仓库同时是**站点工程仓库**：VitePress 配置、30 个自研 Vue 组件、水印与 LLM 文档生成脚本、CI/CD 管线都在这里维护。

---

<img src="https://cdn.jsdelivr.net/gh/FwindEmiko/MiragEdge-DocWeb@main/.github/assets/art_map.png" alt="文档地图" width="100%">

## 文档地图

站点按**使用路径**划分，而不是按文件类型堆放：

| 板块 | 内容 | 页面数 |
| :--- | :--- | :---: |
| [开始游戏](https://miragedge.top/start/) | 新玩家须知、客户端安装、连接服务器、账号绑定、基岩版兼容、皮肤、玩家守则、工会、生电、世界观 | 18 |
| [生存玩法](https://miragedge.top/play/) | 经济系统、领地、冒险、烬域、食物系统、附魔体系、装备锻造 | 51 |
| [特色功能](https://miragedge.top/plugins/) | 服务端自研功能与玩法机制说明 | 21 |
| [原创插件文档](https://miragedge.top/plugin-guides/) | 自研插件的独立使用与配置文档 | 27 |
| [开发者文档](https://miragedge.top/developer/) | 团队协作规范、内容设计流程、运维、版本日志、代码审查 | 76 |
| [历史归档](https://miragedge.top/archive/) | 往期活动记录 | 7 |

**给 AI 助手读的版本**：站点构建时会同步产出 [llms.txt](https://miragedge.top/llms.txt)（摘要索引）与 [llms-full.txt](https://miragedge.top/llms-full.txt)（全量清洗版 Markdown）。把链接丢给任意 AI 助手，它就能直接读懂整个服务器玩法。

---

<img src="https://cdn.jsdelivr.net/gh/FwindEmiko/MiragEdge-DocWeb@main/.github/assets/art_feature.png" alt="核心特色" width="100%">

## 核心特色

<img src="https://cdn.jsdelivr.net/gh/FwindEmiko/MiragEdge-DocWeb@main/.github/assets/feature_grid.png" alt="核心特色" width="100%">

**① 内容是给「做完这件事」写的，不是给「查这个 API」写的**

每个页面都按玩家的实际动作组织：想装客户端就一整条安装路径，想算附魔就一个能试算的计算器。开发者文档同理 —— 讲的是「改一个材质要走哪几步」，而不是干巴巴的目录说明。

**② 30 个自研游戏化组件，直接嵌在正文里**

文档里出现的合成台、熔炉、附魔台都是**真的 Vue 组件**，不是截图：

```text
McItem                 物品悬浮卡，鼠标移上去看属性和来源
CraftingTable          3×3 合成台，配方可视化
Furnace                熔炉烧炼展示
EnchantmentCalculator  附魔计算器，可交互试算
FoodStats / FoodEntry  食物属性表
NodeStatus             服务器在线状态
QQGroupCard            玩家群组卡片
```

配方改了只改一处数据，全站文档同步更新 —— 不会再出现「文档写的是旧配方」。

**③ 弱设备也能看：自适应特效降级**

站点用了极光层、粒子、玻璃磨砂等重效果。为了不让低配手机卡成幻灯片，加了性能探针：

- 监测 rAF 帧间隔、长任务、交互期掉帧，**组合证据**成立才降级
- 只降级、不自动升级，避免「开了又关」的振荡
- 横屏触摸平板（`hover:none` + `pointer:coarse`）默认关特效 —— 这类设备空载帧率正常，一滚动才掉帧，静态信号测不出来
- **绝不覆盖用户的手动选择**：localStorage 显式偏好 > 自适应降级 > 默认值

**④ 推送即上线**

```text
PR         → 类型检查 + 单元测试 + 构建 + 产物体积检查 → 部署 GH Pages 预览
push main  → 同样的检查 → 打包 site.tar.gz → scp 到线上服务器解包
```

所有 GitHub Actions 都**固定到 commit SHA**（不用可变的 `v5` 标签），避免上游被投毒时被动执行恶意代码。

---

## 项目规模

<img src="https://cdn.jsdelivr.net/gh/FwindEmiko/MiragEdge-DocWeb@main/.github/assets/doc_dist.png" alt="文档页面分布" width="62%">

| 指标 | 数量 |
| :--- | ---: |
| 文档页面 | 202 |
| 自研 Vue 组件 | 30 |
| 自研构建脚本 | 6 |
| 静态资源 | 1059 |
| 单元测试文件 | 8 |

> 页面数由 `find <分区> -name '*.md' | wc -l` 统计（2026-09 数据），仅含已发布文档，不含草稿与内部任务文档。

---

<img src="https://cdn.jsdelivr.net/gh/FwindEmiko/MiragEdge-DocWeb@main/.github/assets/art_start.png" alt="快速开始" width="100%">

## 快速开始

<img src="https://cdn.jsdelivr.net/gh/FwindEmiko/MiragEdge-DocWeb@main/.github/assets/quickstart.png" alt="快速开始" width="100%">

### 环境要求

- **Node.js 22.x**（CI 使用 22，本地建议对齐）
- **pnpm 10.15.0** —— 仓库通过 `packageManager` 字段锁定版本，`corepack enable` 可自动匹配
- 无需数据库、无需后端服务，纯静态站点

### 本地开发

```bash
git clone https://github.com/FwindEmiko/MiragEdge-DocWeb.git
cd MiragEdge-DocWeb
corepack enable
pnpm install

pnpm dev          # 启动开发服务器（会先生成 llms.txt）
```

### 提交前自查

```bash
pnpm typecheck        # vue-tsc 类型检查
pnpm test             # vitest 单元测试 + 配置测试
pnpm run audit:routes # 文档路由审计（查死链与游离页面）
pnpm build            # 完整构建（跑通这条基本就不会挂 CI）
```

### 常用脚本

| 命令 | 作用 |
| :--- | :--- |
| `pnpm dev` | 生成 LLM 文档 → 启动 VitePress 开发服务器 |
| `pnpm build` | 完整构建管线（见下节） |
| `pnpm preview` | 预览构建产物 |
| `pnpm test` | 运行全部测试 |
| `pnpm typecheck` | TypeScript 类型检查 |
| `pnpm run llms` | 单独生成 `llms.txt` / `llms-full.txt`（加 `--check` 只校验不写入） |
| `pnpm run audit:routes` | 文档路由审计 |
| `pnpm run watermark` | 给站内图片加水印 |
| `pnpm run contributors` | 重新生成贡献者数据 |

---

## 构建管线

<img src="https://cdn.jsdelivr.net/gh/FwindEmiko/MiragEdge-DocWeb@main/.github/assets/pipeline.png" alt="构建管线" width="100%">

`pnpm build` 是五步串联，**顺序不能调换**：

| 步骤 | 脚本 | 为什么必须在这个位置 |
| :---: | :--- | :--- |
| 1 | `external-watermark.mjs` | 先处理外链资源，避免给还没下载的图打水印 |
| 2 | `generate-llms.mjs` | 在 VitePress 构建**前**生成，产物才进得了 `dist/` |
| 3 | `vitepress build` | 主构建 |
| 4 | `watermark.mjs` | 对构建产物里的图片加水印，必须在上一步之后 |
| 5 | `generate-version.mjs` | 写入构建版本号，供前端版本检测使用 |

> 站点用 ESA 边缘缓存。页面 `<head>` 里注入了 `x-build-id` / `x-build-sha`，前端 `useVersionCheck` 会对比 `/version.json`，发现是旧页面就自动刷新 —— 避免用户看到过期文档。

---

## 目录结构

```text
MiragEdge-DocWeb/
├── start/              开始游戏（18 页）—— 入服、安装、绑定、社区、规则
├── play/               生存玩法（51 页）—— 经济、领地、食物、附魔、锻造
├── plugins/            特色功能（21 页）—— 服务端自研玩法说明
├── plugin-guides/      原创插件文档（27 页）—— 独立插件使用与配置
├── developer/          开发者文档（76 页）—— 团队协作、运维、版本日志、审查
├── archive/            历史活动归档（7 页）
├── public/             静态资源（图片、llms.txt、站点图标等）
├── scripts/            自研构建脚本（6 个）
├── .vitepress/
│   ├── config.mts      站点配置（导航、侧边栏、SEO、搜索）
│   ├── theme/          主题定制：30 个 Vue 组件 + composables
│   └── test/           Vitest 单元测试与配置测试
├── .github/workflows/  CI/CD
└── index.md            站点首页
```

⚠️ `build/`、`.vitepress/dist/`、`.vitepress/cache/` 都是构建产物，**不要手改**。`docs/` 是内部任务文档，已被 gitignore。

---

## 技术栈

<img src="https://cdn.jsdelivr.net/gh/FwindEmiko/MiragEdge-DocWeb@main/.github/assets/tech_stack.png" alt="技术栈" width="100%">

| 层次 | 选型 | 说明 |
| :--- | :--- | :--- |
| 框架 | **VitePress 1.6** + Vue 3.5 + TypeScript 5.9 | 静态站点生成，Markdown 直写 |
| 包管理 | **pnpm 10.15**（Node 22） | `packageManager` 锁版本，CI 用 corepack |
| 可视化 | Mermaid、canvas-confetti | 流程图与粒子动效 |
| 侧边栏 | vitepress-sidebar | 按目录自动生成，避免手维护上千行配置 |
| 搜索 | miniSearch（内置） | 标题权重 6 倍、模糊匹配、AND 组合 |
| 测试 | Vitest + happy-dom + @testing-library/vue | 组件、composable、构建脚本、配置四类 |
| 数据 | @octokit/rest | 拉取仓库活跃度、贡献者数据 |

**自研构建脚本**（`scripts/`）：

| 脚本 | 作用 |
| :--- | :--- |
| `generate-llms.mjs` | 生成 `llms.txt` / `llms-full.txt` 与清洗版 Markdown，让 AI 助手直接读懂文档 |
| `watermark.mjs` | 构建后为站内图片加水印 |
| `external-watermark.mjs` | 外部资源水印，带头像缓存映射 |
| `generate-version.mjs` | 生成版本标识，配合边缘缓存做旧页面刷新 |
| `audit-doc-routes.mjs` | 路由审计：查死链、孤立页面、未挂进侧边栏的文档 |
| `compress-images.mjs` | 图片压缩 |

---

<img src="https://cdn.jsdelivr.net/gh/FwindEmiko/MiragEdge-DocWeb@main/.github/assets/art_contrib.png" alt="参与贡献" width="100%">

## 参与贡献

欢迎修错别字、补截图、写新玩法文档。**改文档不需要懂前端** —— 会写 Markdown 就够了。

### 提交流程

```bash
# 1. 从 main 开分支
git checkout -b docs/fix-enchant-typo

# 2. 改内容（文档在 start/ play/ plugins/ plugin-guides/ developer/）
$EDITOR play/enchant.md

# 3. 本地自查
pnpm test && pnpm typecheck && pnpm run audit:routes

# 4. 提交
git commit -m 'docs(玩法): 修正附魔等级上限说明'
git push origin docs/fix-enchant-typo
```

然后到 GitHub 开 PR。CI 会自动跑检查并部署一个预览站点，你可以直接点进预览链接看渲染效果。

### 提交信息格式

```text
docs(<分区>): <中文描述>      # 文档内容改动，分区写 开始/玩法/插件/开发 等
feat: <中文描述>              # 新功能或新组件
fix: <中文描述>               # 修 bug
refactor: <中文描述>          # 重构
chore: <中文描述>             # 杂项
```

### 写作约定

- **中文优先**，术语保留英文原名（如 TPS、PDC），中英文之间加空格
- **面向动作写**：先说要做什么，再给步骤；不要先讲原理
- **双端差异必须标注**：基岩版做不到的功能要显式写出来，别让手机玩家白试
- **截图用真实游戏画面**，不要用示意图；新图记得走水印流程
- **不要手改侧边栏**：`.vitepress/config.mts` 的侧边栏由目录结构生成，改文件位置即可
- **改组件逻辑要补测试**：`.vitepress/test/` 下有对应目录结构

### 可以帮上忙的地方

- 文档里发现错误、过期截图、失效链接 → [开 Issue](https://github.com/FwindEmiko/MiragEdge-DocWeb/issues)
- 想补某个玩法的详细说明 → 直接提 PR
- 想帮忙做英文版 → 开 Issue 聊聊，目前还没有
- 想改进主题组件或构建脚本 → 先开 Issue 讨论方案

---

## 常见问题

<details>
<summary><b>这个仓库能下载服务端吗？</b></summary>

不能。这里只有文档源码与站点工程，服务端本体与客户端整合包请到官网或玩家群获取。

</details>

<details>
<summary><b>我只是想改一个错别字，要走完整流程吗？</b></summary>

不用跑构建，但请至少开一个分支再提 PR —— 直接改 main 会绕过 CI 检查。
GitHub 网页端编辑时选「Create a new branch for this commit」即可。

</details>

<details>
<summary><b>为什么本地 <code>pnpm dev</code> 会先跑一遍 generate-llms？</b></summary>

因为 `llms.txt` 是站点的一部分，开发时也要能访问到。这一步很快（约几百毫秒），不用在意。

</details>

<details>
<summary><b>构建提示 MEMORY.md 相关错误怎么办？</b></summary>

项目记忆文件里**不能出现裸的 HTML 标签**（比如直接写 `<script setup>`），会被 Vue 编译器当成未闭合标签导致构建失败。
写成行内代码或转义即可。

</details>

<details>
<summary><b>页面在手机上卡顿怎么办？</b></summary>

右下角有特效开关，手动关掉即可，设置会记住。如果设备很弱，站点也会自动降级。
如果手动关了还卡，欢迎开 Issue 附上机型。

</details>

<details>
<summary><b>能部署到自己的服务器吗？</b></summary>

可以，产物就是纯静态文件。`pnpm build` 后把 `.vitepress/dist/` 扔到任意静态托管即可。
子路径部署需要设环境变量 `VITEPRESS_BASE=/你的子路径/`。

</details>

---

## 愿景

> 远离困恼之地（锐界）和天堂般的境地（幻境）
> 在数字荒漠中打造一片绿洲
> 让每个玩家都能找到属于自己的幻境

技术会过时，玩法会迭代，但这句初衷一直没变。

---

## 致谢

感谢所有参与开发、测试与社区建设的朋友：

<a href="https://github.com/FwindEmiko/MiragEdge-DocWeb/graphs/contributors"><img src="https://contrib.rocks/image?repo=FwindEmiko/MiragEdge-DocWeb" alt="贡献者"></a>

文档内容由 **F.windEmiko（狐风轩汐）** 与社区共同维护；站点的守护者是 **狐魇星玖**，设定见 [soul.md](https://github.com/FwindEmiko/MiragEdge-DocWeb/blob/main/soul.md)。

---

## 许可证

本项目采用 **Apache License 2.0**，详见 [LICENSE](https://github.com/FwindEmiko/MiragEdge-DocWeb/blob/main/LICENSE)。

<div align="center">
<sub>星辰为引，梦魇为翼。</sub>
</div>

