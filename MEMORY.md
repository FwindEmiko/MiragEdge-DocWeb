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
