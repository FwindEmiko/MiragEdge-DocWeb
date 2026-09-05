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

## 踩坑记录

<!-- 遇到过的问题与解决办法（按时间倒序） -->
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
