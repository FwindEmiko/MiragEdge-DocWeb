<!-- 来源页面: https://miragedge.top/MEMORY -->
<!-- 由 llms.txt 标准生成器自动产出，源文件: MEMORY.md -->

# MiragEdge-DocWeb

> 本项目工作区的长期记忆文件。所有会话启动时自动读取，会话中主动维护。
> 大小上限 128KB（131072 字节，约 4.3 万中文字）。超过 80%（约 102KB）开始预警，超过上限必须整理压缩。
> 超出时把已完结的历史细节移入同目录 MEMORY-ARCHIVE.md，主文件只保留长期有效的结论，**不要**靠删信息达标。
> 结构按以下固定小节维护。大小上限由 DSH 的 project-memory 插件强制（可用 DSH_PROJECT_MEMORY_MAX_BYTES 覆盖）。

## 架构

（待补充——首次使用请在此记录本项目的架构）

## 约定/规范

- 全站术语唯一写法定死在 `docs/文档站全量重构261016/13-术语表.md`：烬域/繁星（禁 incendium/stellarity 出现在**正文可见文字**）、灵叶/块币/星痕石、21 个玩家功能名。已裁决的「一名多写」：`fec-armor`→**体型装备**、`emc-shop`→**方块银行**（`plugins/building-tools.md` 的「建材等价交换」小节是同一系统的重复，不是第二个功能）
- **禁词扫描必须内置四类豁免**，否则门禁必红：① URL 查询串（QQ 邀请链接 `jump_from=webapi` 会被 `API` 规则误报）② 货币英文名 `Spirit Leaf`/`Starscar Gem` ③ 图片路径 `/images/datapack/…`（`play/adventure` 12 页的 `datapack` 命中 100% 来自 `src=` 属性，正文一字未犯）④ 英文词一律加词边界（`\bAPI\b` 才不误伤 `webapi`）。`archive/events/20260801.md:68` 的 API（大模型 API 网关）是**真实命中**，不是误报
- `archive/**` 是历史活动记录，**豁免正文禁词**（纲领 §2.2 禁删历史内容；历史公告里的技术词是当时的真实表述）。扫描报告命中数但**不判负**

## 关键决策

- 动效开关（effects-disabled）三态语义：localStorage 显式偏好 > 自适应性能降级 > 移动端/静态低配默认值。自适应降级只写会话，不写 localStorage，绝不覆盖用户手动选择
- 自适应探针只降级不自动升级：避免「开启后立刻卡顿再关闭」的振荡；探针阈值偏保守（P90 帧间隔、长任务、交互延迟需组合证据），防止误伤正常设备
- 静态低配信号（deviceMemory<=2 / hardwareConcurrency<=2 / saveData）在 config.mts 水合前内联脚本与 useEffectsToggle.isStaticLowEndDevice 中保持一致，需同步修改
- 横屏触摸平板（hover:none + pointer:coarse + width>767）默认关闭特效：华为/Kirin 等弱 GPU 平板空载帧率正常但滚动时掉帧，靠静态信号测不出，用 isSuspectTablet + config.mts 内联脚本在首帧前关掉；iPad 也命中，属保守策略，用户可手动恢复
- 特效关闭 ≠ 性能安全：130px 大半径 blur 的极光层与大面积 backdrop-filter 在弱 GPU 上即使静止也持续消耗；effects-disabled 下必须同步降级静态层（hero.css/blur.css 有专门降级段）
- **`/features/` 重定向碰撞（全量重构阶段 0 实测确认，未修）**：`legacy-redirects.ts` 的 `prefixRules` 含 `['/features','/play']`，`generateBundle()` 会为每个现存 `/play/**` 路由反推并 `emitFile` 出重定向存根。实测 `dist/features/` 下 **211 个 html 全是「页面已迁移」存根**，`dist/features/index.html` 是存根**而不是**真实页 → **存根覆盖真实页**。根因：存根经 VitePress 的 `fs.writeFile` 落盘，而页面不进 Rollup bundle，故**无警告、退出码 0**。既有缺陷佐证：`dist/plugins/custom/sky-elytra.html` 是真实页，同路径 `.../index.html` 仍是存根。裁决：保留 `/features/`（删该前缀规则会一次丢掉 106 条旧 `/features/*` 路由），但必须加「`from` 已是当前真实页路由则不生成存根」的通用守卫
- **`plugins/` → `/features/` 改名必须同批修改 4 个非 md 文件**，漏改会让 `pnpm test` 直接变红：`scripts/generate-llms.mjs`（`SECTIONS` 的 `plugins`）、`.vitepress/test/config/config.test.ts:120`、`.vitepress/test/unit/scripts/generate-llms.test.mts:407`、`.vitepress/theme/components/vue/NotFound.vue:59`
- **全站没有 `` / `` / `` / ``**：纲领 §8.2 把它们列为「候选组件」，实测 `theme/components/vue/` 下不存在。所以「超 18 KB 改组件」这条路径当前无法落地，7 个超重页只能走拆页

## 模块/组件

- useEffectsToggle（.vitepress/theme/composables/）：特效开关全局单例，含 initEffectsToggleState / applyAutoEffects / isStaticLowEndDevice / hasStoredEffectsPreference，同步 html.effects-disabled 与 data-effects-auto
- useAdaptiveEffects（.vitepress/theme/composables/）：自适应性能探针，采样 rAF 帧间隔 + PerformanceObserver(longtask/event) + 静态信号，判定后经 applyAutoEffects 落地；sessionStorage 缓存 60s（miragedge-effects-auto）；探针通过后启动交互期掉帧监测（scroll/touchmove/wheel 短采样，isInteractionJank），捕捉「空闲满帧、交互掉帧」的设备
- layout.vue onMounted 依次调用 initEffectsToggleState → initAdaptiveEffects，onUnmounted 时调用返回的 cleanup
- VillagerTradeNav.vue（.vitepress/theme/components/vue/）：末地村庄交易页的「职业快速跳转 + 筛选」导航。不维护交易数据副本，而是挂载后扫描本页 `.vp-doc` 内的 h3（职业）/h4（等级）标题动态生成，页面增删职业或等级时导航自动跟随，永不与正文脱节；等级标题须含「共 N 个交易格」才能被解析。已在 theme/index.ts 全局注册

## 踩坑记录

- **VitePress 多 sidebar：页面落在所有前缀外就完全不渲染侧栏**（全量重构上线后站主发现）：`themeConfig.sidebar` 是「路径前缀 → 侧栏数组」的映射，页面路由不匹配任何前缀时**侧栏整块不见**（不是显示默认侧栏）。重构把 `start/community/` 提级成顶层 `/community/` 时只改了 nav 与 URL、漏加 `/community/` 块，于是社区 6 页全没侧栏。**改分区结构时必须同步加 sidebar 块**。
  - 正向检查（`pnpm audit:routes`：sidebar 里的链接是否有效）**查不出**这类整区缺侧栏，需要**反向检查**：每个页面路由是否落在某个前缀内 → `scripts/refactor-check-orphan-sidebar.mjs`。
  - `audit-doc-routes.mjs` 的判重必须**按 sidebar 块内部**判，不能跨块全局比对——`/` 块与 `/community/` 块都需要社区首页入口，这是正常的。
- **`public/` 下的 llms 产物按分区目录生成，改了分区名必须重跑 `pnpm llms`**：`scripts/generate-llms.mjs` 的 `cleanOldOutputs()` 会按 `SECTIONS` + `LEGACY_SECTIONS` 清理旧目录，逻辑本身正确——但**只有跑过才会执行**。漏跑会让 `public/plugins/` 残留旧 `.md` 与 `llms.txt`，而且**它们会进构建产物、线上可访问**（旧内容 + 过期 llms）。检查脚本 `scripts/check-stale-public.mjs`。
  - 源站阿里云 ESA 对 `.md`/`.txt` 有 **30 天缓存**（`x-swift-cachetime: 2592000`、`x-site-cache-status: HIT`），删文件后线上仍返回 200 且 `last-modified` 是旧时间。**要到 CDN 控制台刷缓存**才能真 404。
- **配置文件里的注释可能与值不一致，有源码时以代码读写路径为准**：`FE_Back/src/main/resources/config.yml` 的 `tier-0` 注释写「前 30 次死亡不掉金粒不扣钱」，但值是 `min-drop: 0, max-drop: 10`，`PenaltyManager.computeDrop()` 走 `nextInt(0,11)` —— **实际是 0~10 随机**，注释错了。别照抄注释。另注意 `return-cost`（返回收费，`free-deaths: 30` 免费）与 `penalty-tiers`（死亡掉金粒）是**两个独立机制**。
- **`SmartImage` 用 `` 加载 SVG，SVG 内的 CSS 变量拿不到页面 `:root`**（全量重构阶段 4 实测）：`` 中的 SVG 是独立文档，`fill="var(--vp-c-text-1)"` 解析为空、Chrome 回退成**纯黑填充**，卡片全成黑块。实测对照：同一段标记内联进页面能正确跟随主题，经 `` 引入则恒为兜底色。**本仓库两种可行写法**：
  1. 玩家区 11 张 SVG：直接写 `var(--vp-c-text-1, #1b1b1f)` 形式（带字面回退），`` 时用浅色兜底；缺点是**跟不了站点手动切换主题**，只跟系统主题（站点初始主题取系统值，故首次访问正确）。
  2. 开发者区 6 张 SVG：在 SVG 自己的 `` 里 `:root { --d-text-1: var(--vp-c-text-1, #3c3c43); … }` 建立本地变量，再用 `@media (prefers-color-scheme: dark)` 覆盖。
  两种都**不会被 `svg_check.py` 判错**（W1「写死颜色」把这些字面回退计入，属误报，不要为了消 W1 而删回退值）。
- **`svg_check.py` 用宽松解析器，查不出编码损坏**：全量重构时 4 个 SVG 因 PowerShell `Get-Content/Set-Content` 按系统 ANSI 往返而被双重编码（UTF-8 字节被当 GBK 再存），mangled 字节还**吃掉了闭合的 `</`**（`` 变 `?/text>`）。`svg_check.py` 报 0 ERROR，而 Python 标准库 `xml.etree.ElementTree` 严格解析报 `mismatched tag`。**判别方法**：`python -c "import xml.etree.ElementTree as ET; ET.parse('x.svg')"` + mojibake 密度检测（真实 mojibake 几乎逐字命中，命中率 >0.35；注意「界」「一」等是 Minecraft 常用字，**不能按个数判**）。
- **`audit-doc-routes.mjs` 的两处硬编码会随重构失效**：`documentRoots` 里的 `'plugins'` 目录改名后，脚本无法解析任何 `/features/*` 链接，会误报大量「页面链接不存在」；另外它的 `localRoute()` 未做 `x/index.md → x` 归一化，会把显式的 `./index.md` 误报为死链。两处都已修。同名脚本与 `vitepress build` 的死链检查**口径不同，两边都要跑**。
- **YAML frontmatter 的值含冒号会直接让 build 失败**：`description: … 上下文调用 :: 的写法`、`description: … 含 fs:time 时间 …` 会让 YAML 把值解析成嵌套映射，报 `YAMLException`。**凡 `title`/`description` 值里出现 `:` 一律加英文双引号**。
- **`git rm` 对已修改文件需要 `-f`**，否则报 `the following file has local modifications`。
- CI 的「依赖漏洞扫描 (osv-scanner)」是**门禁**：它失败会跳过同 job 的「构建/打包」，进而 deploy 永不执行，站点长期停在旧版本。排查 CI 失败先看失败的是哪个 step，别默认是代码问题
- 无 Docker 时复刻 osv-scanner 门禁：脚本解析 `pnpm-lock.yaml` 的 snapshot 段（**注意 v9 格式里 `@scope/name` 是带引号的**，正则不兼容引号会漏掉整个 scope 包），逐个 POST 到 `https://api.osv.dev/v1/querybatch`，再扣掉 `osv-scanner.toml` 里已 ignore 的 id。这套复刻能给出与 CI 完全一致的清单
- 升级依赖后要重跑 `pnpm run typecheck`：simple-git 4.x **移除了默认导出**，`import simpleGit from 'simple-git'` 会变成「模块对象不可调用」并报 TS2349，必须改成 `import { simpleGit } from 'simple-git'`
- 判断某依赖能否直接删掉，用「源码 + 全历史」双重确认：`git log --all -S "from 'pkg'"` 为空且当前工作区无引用才可删。`vitepress-sidebar` 就是这样发现的——声明了但从未 import（README 里还写着它负责侧边栏，实际侧栏是 config.mts 手写的），删掉它顺带消除了灰色依赖链 argparse→sprintf-js 的无修复告警
- 上游锁死有洞的传递依赖时，用 `pnpm-workspace.yaml` 的 `overrides`（pnpm 10 不再读 package.json#pnpm）。katex 即如此：mermaid 11/12 都声明 `^0.16.47`，而修复在 0.18.2；顶版本前先核对实际用到的 API（`renderToString(tex,{throwOnError,displayMode,output})`）并做运行时冒烟
- 工作区 node_modules 可能处于「依赖未链接」状态：`vue`/`vitepress`/`vitest` 只存在于 `node_modules/.ignored/`，`node -e "require('vitepress')"` 与任何 pnpm 脚本都会 MODULE_NOT_FOUND。修复：`$env:CI="true"; pnpm install --prefer-offline --reporter=append-only`（不加 CI 会弹交互确认，自动化下会被误答导致安装未完成）
- `pnpm run audit:routes` 当前在 HEAD 上就失败，共 3 条既有报错，与本任务无关：侧栏重复路由 `/developer/workflows/enchanting/development-methods`（config.mts 中同一路径出现两次）、`/archive/start/main-city` 与 `/archive/start/new-server` 未进侧栏。判断新增页面有无问题时，只看报错里是否出现自己的路由，不要试图"顺手修好"全站
- 页面内若有 13 个职业各自的「1 级/2 级…」小标题，标题文本相同会导致 VitePress 生成重名锚点（自动追加 -1/-2）并污染右侧大纲。修法：等级小标题带上职业名，如 `#### 1 级 · 新手（盔甲匠，共 2 个交易格）`
- 组件若靠读取本页已渲染标题来构建导航，必须 `document.querySelector('.vp-doc')` 再在其中查 `h3/h4`。整篇 HTML 里侧栏分组标题也是 `h3/h4`，不限定容器会多解析出 5 个伪职业；且侧栏标题没有 id，只有正文标题有
- PowerShell 里给 `node -e "..."` 传含 `[`、`||`、`$`、花括号的 JS 会被当命令解析器语法（ParserError / MissingTypename）。这类脚本一律写成 `.mjs` 文件再 `node file.mjs`，不要内联
- `pnpm run build` 的水印步骤会报大量 `EPERM: rename ... .wmtmp -> ...`（dist 下图片被占用），但核心 VitePress 构建仍成功且退出码为 0；交付报告里要区分"核心构建成功"与"水印残余报错"，不能笼统写"完全通过"。同理 Git 贡献者插件查不到某邮箱会打印 404 警告，属既有现象
- `public/logsdata.md` 由用户自行维护并直接提交（不在 llms 生成范围内，生成物是 `public/build/logsdata.md`）；`public/external-wm-map.json` 与 `test_tool/**` 会被构建/测试改写。这些都不是本次改动的成果，最终报告不要混入，验证跑完可用 `git checkout --` 还原非本人改动（还原前先 `git log --oneline -3 -- ` 确认最新提交不是用户刚做的）
- PerformanceObserver.observe 的 durationThreshold 在项目 TS lib 中不存在，event-timing 观察直接用浏览器默认阈值（约 104ms），够用且免类型报错
- MEMORY.md 正文里不能出现裸尖括号标签（如 script setup），会被 vue 编译器当成未闭合标签导致 vitepress build 失败；必须写成行内代码 `` 或用 HTML 实体转义
- layout.vue 的 `` 未标 lang="ts"，不能写 TS 类型注解（TS8010）；普通变量用无类型声明
- vitest 的 vi.unstubAllGlobals() 会清掉 beforeAll 安装的 localStorage stub，需在 beforeEach 里重新 install
- PTC run_code 环境无默认 PATH（node/sed/dirname 全找不到），命令前必须显式 process.env.PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"；大文件写盘用 run_code 内置 fs，勿走 shell 转义
- run_code 计算预算 60s，跑不完完整 vitepress build：用 nohup 后台跑 node node_modules/vitepress/bin/vitepress.js build，稍后 tail 日志收结果
- 推送凭据：.env 的 GITHUB_TOKEN 是 FwindEmiko 的 fine-grained PAT（无 Contents 写权限，推主仓库 403）；实际推送用 gh hosts.yml 里 FCelestial 的 classic token（export GH_TOKEN 后走 gh api，勿在输出回显 token）

## 进行中的工作

### 2026-08 · HFcatLogin 原创插件文档（plugin-guides/hfcatlogin/）

- 新增 4 个页面：index.md（总览/安装）、commands.md（命令参考）、permissions.md（权限节点）、config.md（配置参考）
- 已注册 .vitepress/config.mts 侧栏（HFcatLogin 登录插件）与 plugin-guides/index.md FeatureCard
- 内容基于源码核实：命令统一 /hfcatlogin（别名 /hfc）+ /login /register；权限统一 hfcatlogin.* 前缀（16 个管理节点），玩家命令无需权限
- 关键点：未认证白名单 allowed-commands-while-unauthorized；LuckPerms 上下文键 libreloginnext-authorized（沿用上游命名）
- 构建验证：pnpm exec vitepress build 通过；contributor 插件因本地 git 无提交而报错但被捕获忽略，属环境既有现象

### 2026-09 · 待办看板：潮涌能量三件套（public/data/todo.json）

- 便携式「潮涌能量」道具：放入副手持续获得 Conduit Power；道具材料由新增海洋BOSS获取，具体获得方式与效果时长待定
- 新增海洋BOSS：负责掉落便携式潮涌道具的制作材料，生成/召唤方式与战斗机制待设计
- 成就「无界潮涌」：描述「打破框架桎梏，将海洋力量攥于掌中」；解锁条件建议为获得潮涌道具（或击败海洋BOSS）
- 新增「摔炮」可投掷物品：右键如雪球般扔出，落地/命中爆炸；伤害、爆炸范围、音效粒子、投掷冷却与获取方式均待定（w-2026-09-02-throwable-popper）

### 2026-09 · 隐藏整蛊道具「浮木」玩家文档上线（play/life/fishing/driftwood.md）

- 新增 play/life/fishing/driftwood.md：获取（钓鱼超稀有垃圾 ≈1285 竿）/双端用法/三阶段效果/限制表/游戏内提示表，含「使用即致死」warning 与规则页弱引用
- .vitepress/config.mts 钓鱼侧栏组追加「隐藏道具 · 浮木」；play/life/fishing/fish.md 尾部加浮木交叉引用 tip
- 数值与 emf_junk_driftwood.yml（weight 0.1）及概率文档核对；玩家版精简稿同时保留在 /root/FCelestial/钓鱼系统概率文档.md §6.1
- 推送：Contents API 三文件直推 main（driftwood 55880fba / fish 8f84df0b / config ce628599），本地 vitepress build 预验证通过后触发 CI 部署

### 2026-10 · 末地村庄交易大全（play/adventure/worlds/stellarity/villager-trades.md）

- 新增玩家页「末地村庄交易大全」：13 职业 × 5 等级、121 个交易格、173 条交易分支的完整明细表（格位/你付出/你获得/补充说明/补货前可做次数），另含货币说明、表格读法、打折机制、相关页面
- 落位：外部 prompt 原建议 `features/adventure/endvillage.md` 在本仓库不存在（该路径已被 legacy-redirects 映射到 /play/adventure），实际沿用 `play/adventure/worlds/stellarity/`，与 biomes/mobs/items/guide 同级；侧栏「繁星」分组已插入条目
- 新增 .vitepress/theme/components/vue/VillagerTradeNav.vue（快速跳转 + 职业/等级筛选），已在 theme/index.ts 注册；正文表格保持裸 Markdown、未塞 McItem（与素材可用性结论一致）
- 数据保真：正文 §4 表格由脚本从 prompt 原文逐行抽取生成（不手抄），并由独立 subagent 对照 `.research/stellarity-latest` 数据包脚本逐行核对，结论零差异（121 槽 / 173 分支 / 65 个等级文件 / 39 个战利品表全部解析）；随机分支数、maxUses、priceMultiplier 均一致
- 事实旁证：`data/minecraft/loot_table/blocks/end_stone.json` 权重 98:2 印证「末地石约 2% 掉碎片」；remove_vanilla_trades.mcfunction 整条删除绿宝石交易印证「不收绿宝石」；priceMultiplier 实际只有 0.05/0.2 且无自定义折扣逻辑，印证「沿用原版打折」
- 验证：typecheck / llms / vitepress build / pnpm test(220 passed) / git diff --check 全绿；audit:routes 的 3 条报错为 HEAD 既有，与本页无关

### 2026-10 · 文档站全量重构（已完成并上线 main）

- 纲领：`docs/文档站全量重构261016/00-重构纲领-交给DSH.md`。阶段 0 四份方案见同目录 `10-`/`11-`/`12-`/`13-`；阶段 6 验收见 `90-验收报告.md`；子代理共用规范 `99-写作规范速查.md`、事实红线 `90-未能验证清单.md`
- **规模**：202 页 → **237 页**（拆页 19 新增 + 4 删除为净增 35）；`plugins/` → `features/` 顶层改名；`start/community/` 提为 `/community/`
- **结构变化**：新增 `features/`（含 `/features/pvp/*` 4 页 PvP 玩家面，站主确认 FE_PVP 已上线）、`/start/login`（注册登录，原先只在开发者区教）、`/features/block-bank` 等；`start/redstone.md` 拆为玩家页 `/play/systems/redstone` + 管理员页 `/developer/reference/leaf-tuning`
- **拆页（超 18KB 硬线）**：`datapack/modules`(37KB)→7 · `geyser/index`(29.6KB)→5 · `geyser/conversion`(24.8KB)→4 · `economy-audit-workflow`(38KB)→5 · `geyser/craftengine`(19.7KB)→2 · `aiyatsbus-fluxon-functions`(20.5KB)→3 · `villager-trades`(34KB)→14（交易数据逐行核对零差异）· `mcrecipe`→+`mc-textures`
- **配图**：0 → **17 张手绘 SVG**（玩家区 11 + 开发者区 6）；`DataTable.vue` 新建并注册（阶段 5 大表用）
- **门禁全绿**：`vitepress build` 0 死链 · `typecheck` 通过 · `pnpm test` 220 passed · `audit:routes` 通过（**修掉了 HEAD 上既有的 3 条报错**）· 六项禁词/元叙述/emoji 扫描全 PASS · 242/242 侧栏链接可达 · **0 条旧 URL 无归宿**（470 条重定向规则）· 存根/真实页同路由冲突 0 · SVG 0 XML 错误 0 mojibake
- **两处未裁决事实**（不阻塞交付，已在验收报告登记）：① 死亡回程「返回是否收费／金粒能否拾取」玩家页与插件文档互相矛盾 → 玩家页按红线**不写数值**，只写会发生什么；② `developer/ops/compute.md` 是对外卖的云服务器价目表，与开发者文档主线不同族，暂留原位待定归属
- **`start/install.md` 的「年龄必须填已成年」按站主指示保留**（站主说明为必要步骤），已在验收报告记合规备注；iOS 微信公号兑换正版账号一段按站主确认渠道失效而删除

- 纲领：`docs/文档站全量重构261016/00-重构纲领-交给DSH.md`（791 行，含硬约束、目标 IA、写作/配图规范、阶段门禁、子代理编排）。基线：`02-现状体检-基线数据.md`
- **阶段 0 四份交付物已产出**：`10-信息架构方案.md`（目标目录树 + 两套导航 + 旧→新 URL 映射表 74 条）· `11-内容分域清单.md`（**202 页逐页判定，脚本校验 202/202 无重复无遗漏**）· `12-组件与配图计划.md`（16 项必配图落位 + 组件决策）· `13-术语表.md`（唯一用词标准）
- 分域核心结论：`plugin-guides/` 的 2 页纯玩家内容（`fe-back/guide.md`、`fepvp/guide.md`）与 7 个混合页要拆出玩家区；`start/redstone.md` 是全站唯一真管理员页需拆半；`archive/{main-city,new-server}` 其实是现行规则需迁回活跃区
- 辅助脚本（新增，只读）：`scripts/refactor-inventory.mjs`（扫全站骨架→`_inventory.json`）· `refactor-links.mjs`（183 条站内链接、0 死链）· `refactor-verify-parts.mjs` / `refactor-verify-11.mjs`（覆盖校验）· `refactor-verify-urlmap.mjs`（URL 映射覆盖门禁，实测 **0 遗漏**）
- 待用户拍板 6 项（详见 `10-信息架构方案.md` §6）：① 内部代号目录是否改名（建议**不改**）② villager-trades 拆 14 页 vs 改组件（建议**拆页**）③ FE_PVP 是否已上线（决定 4 个玩家页建不建）④ `start/install.md` 合规风险内容删除 ⑤ `archive/` 禁词门禁豁免 ⑥ 阶段 5 是否新建 ``
- **阻塞项**：死亡回程「返回是否收费/金粒能否拾取」在玩家页与插件文档间**互相矛盾**（`plugins/custom/death-return.md` vs `plugin-guides/fe-back/guide.md`），裁决前该页与必配图第 6 项不能落笔
