# MiragEdge-DocWeb

> 本项目工作区的长期记忆文件。所有会话启动时自动读取，会话中主动维护。
> 大小限制 1.5MB，超过时必须整理压缩。结构按以下固定小节维护。

## 架构

<!-- 本项目整体结构：架构、组件、技术栈、目录职责 -->
（待补充——首次使用请在此记录本项目的架构）

## 约定/规范

<!-- 项目约定：命名、风格、版本、操作习惯 -->
（待补充）

## 关键决策

<!-- 为什么这样定：技术选型、踩坑结论、用户拍板的事项 -->
- 动效开关（effects-disabled）三态语义：localStorage 显式偏好 > 自适应性能降级 > 移动端/静态低配默认值。自适应降级只写会话，不写 localStorage，绝不覆盖用户手动选择
- 自适应探针只降级不自动升级：避免「开启后立刻卡顿再关闭」的振荡；探针阈值偏保守（P90 帧间隔、长任务、交互延迟需组合证据），防止误伤正常设备
- 静态低配信号（deviceMemory<=2 / hardwareConcurrency<=2 / saveData）在 config.mts 水合前内联脚本与 useEffectsToggle.isStaticLowEndDevice 中保持一致，需同步修改
- 横屏触摸平板（hover:none + pointer:coarse + width>767）默认关闭特效：华为/Kirin 等弱 GPU 平板空载帧率正常但滚动时掉帧，靠静态信号测不出，用 isSuspectTablet + config.mts 内联脚本在首帧前关掉；iPad 也命中，属保守策略，用户可手动恢复
- 特效关闭 ≠ 性能安全：130px 大半径 blur 的极光层与大面积 backdrop-filter 在弱 GPU 上即使静止也持续消耗；effects-disabled 下必须同步降级静态层（hero.css/blur.css 有专门降级段）

## 模块/组件

<!-- 主要模块及其职责 -->
- useEffectsToggle（.vitepress/theme/composables/）：特效开关全局单例，含 initEffectsToggleState / applyAutoEffects / isStaticLowEndDevice / hasStoredEffectsPreference，同步 html.effects-disabled 与 data-effects-auto
- useAdaptiveEffects（.vitepress/theme/composables/）：自适应性能探针，采样 rAF 帧间隔 + PerformanceObserver(longtask/event) + 静态信号，判定后经 applyAutoEffects 落地；sessionStorage 缓存 60s（miragedge-effects-auto）；探针通过后启动交互期掉帧监测（scroll/touchmove/wheel 短采样，isInteractionJank），捕捉「空闲满帧、交互掉帧」的设备
- layout.vue onMounted 依次调用 initEffectsToggleState → initAdaptiveEffects，onUnmounted 时调用返回的 cleanup
- VillagerTradeNav.vue（.vitepress/theme/components/vue/）：末地村庄交易页的「职业快速跳转 + 筛选」导航。不维护交易数据副本，而是挂载后扫描本页 `.vp-doc` 内的 h3（职业）/h4（等级）标题动态生成，页面增删职业或等级时导航自动跟随，永不与正文脱节；等级标题须含「共 N 个交易格」才能被解析。已在 theme/index.ts 全局注册

## 踩坑记录

<!-- 遇到过的问题与解决办法（按时间倒序） -->
- 工作区 node_modules 可能处于「依赖未链接」状态：`vue`/`vitepress`/`vitest` 只存在于 `node_modules/.ignored/`，`node -e "require('vitepress')"` 与任何 pnpm 脚本都会 MODULE_NOT_FOUND。修复：`$env:CI="true"; pnpm install --prefer-offline --reporter=append-only`（不加 CI 会弹交互确认，自动化下会被误答导致安装未完成）
- `pnpm run audit:routes` 当前在 HEAD 上就失败，共 3 条既有报错，与本任务无关：侧栏重复路由 `/developer/workflows/enchanting/development-methods`（config.mts 中同一路径出现两次）、`/archive/start/main-city` 与 `/archive/start/new-server` 未进侧栏。判断新增页面有无问题时，只看报错里是否出现自己的路由，不要试图"顺手修好"全站
- 页面内若有 13 个职业各自的「1 级/2 级…」小标题，标题文本相同会导致 VitePress 生成重名锚点（自动追加 -1/-2）并污染右侧大纲。修法：等级小标题带上职业名，如 `#### 1 级 · 新手（盔甲匠，共 2 个交易格）`
- 组件若靠读取本页已渲染标题来构建导航，必须 `document.querySelector('.vp-doc')` 再在其中查 `h3/h4`。整篇 HTML 里侧栏分组标题也是 `h3/h4`，不限定容器会多解析出 5 个伪职业；且侧栏标题没有 id，只有正文标题有
- PowerShell 里给 `node -e "..."` 传含 `[`、`||`、`$`、花括号的 JS 会被当命令解析器语法（ParserError / MissingTypename）。这类脚本一律写成 `.mjs` 文件再 `node file.mjs`，不要内联
- `pnpm run build` 的水印步骤会报大量 `EPERM: rename ... .wmtmp -> ...`（dist 下图片被占用），但核心 VitePress 构建仍成功且退出码为 0；交付报告里要区分"核心构建成功"与"水印残余报错"，不能笼统写"完全通过"。同理 Git 贡献者插件查不到某邮箱会打印 404 警告，属既有现象
- `public/logsdata.md` 由用户自行维护并直接提交（不在 llms 生成范围内，生成物是 `public/build/logsdata.md`）；`public/external-wm-map.json` 与 `test_tool/**` 会被构建/测试改写。这些都不是本次改动的成果，最终报告不要混入，验证跑完可用 `git checkout --` 还原非本人改动（还原前先 `git log --oneline -3 -- <file>` 确认最新提交不是用户刚做的）
- PerformanceObserver.observe 的 durationThreshold 在项目 TS lib 中不存在，event-timing 观察直接用浏览器默认阈值（约 104ms），够用且免类型报错
- MEMORY.md 正文里不能出现裸尖括号标签（如 script setup），会被 vue 编译器当成未闭合标签导致 vitepress build 失败；必须写成行内代码 `<script setup>` 或用 HTML 实体转义
- layout.vue 的 `<script setup>` 未标 lang="ts"，不能写 TS 类型注解（TS8010）；普通变量用无类型声明
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
