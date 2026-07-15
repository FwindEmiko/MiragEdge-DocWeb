# 移动端界面体验优化报告

> 生成时间：2026-07-15
> 范围：侧边菜单栏、页面目录、界面布局设计、性能
> 评估维度：实用性、美学、性能、可访问性

## 修复概览

本次共修复 **15 项** 移动端体验问题，按优先级分四类完成，每类改完后均通过 `pnpm build` 验证（exit code 0，0 构建错误）。

| 类别 | 数量 | 状态 |
|------|------|------|
| P0 可访问性硬伤 | 3 | ✅ 全部修复 |
| P1 侧边栏与目录交互 | 4 | ✅ 全部修复 |
| P2 界面布局与组件适配 | 4 | ✅ 全部修复 |
| P3 性能与细节打磨 | 4 | ✅ 全部修复 |

---

## P0 · 可访问性硬伤

### P0-1 viewport meta 修复
- **文件**：`.vitepress/config.mts`
- **问题**：原设置 `maximum-scale=1.0, user-scalable=no` 违反 WCAG 1.4.4，阻止视力不佳用户双指缩放
- **修复**：改为 `width=device-width, initial-scale=1.0, viewport-fit=cover`，同时启用安全区支持

### P0-2 全站安全区适配
- **文件**：`.vitepress/theme/css/layout/blur.css`、`.vitepress/theme/components/vue/layout.vue`
- **问题**：iPhone 刘海/Home Indicator 已普及，但全站无任何 `env(safe-area-inset-*)` 使用
- **修复**：
  - `.VPLocalNav` 顶部加 `padding-top: env(safe-area-inset-top)`，避免状态栏遮挡「菜单/本页」按钮
  - `.VPNavScreen` 顶部加安全区 padding + `-webkit-overflow-scrolling: touch`
  - `.float-buttons` 底部用 `calc(100px + env(safe-area-inset-bottom))` 避开 Home Indicator
  - `.doc-footer` 底部加 `calc(36px + env(safe-area-inset-bottom))`

### P0-3 100vh → 100dvh
- **文件**：`.vitepress/theme/css/layout/hero.css`、`.vitepress/theme/components/vue/ChristmasTree.vue`
- **问题**：移动端浏览器地址栏收起/展开时 100vh 会跳变，导致首屏抖动
- **修复**：改用 `100dvh`（动态视口高度），保留 `100vh` 作为旧浏览器 fallback

---

## P1 · 侧边栏与目录交互

### P1-4 移动端目录下拉浮层优化
- **文件**：`.vitepress/theme/css/base/overrides.css`
- **问题**：`.VPLocalNavOutlineDropdown .items` 无 max-height 限制，长目录撑出屏幕；目录项触摸热区约 28px 低于 44px 推荐值
- **修复**（`@media (max-width: 959px)`）：
  - 浮层 `max-height: 60dvh` + `overflow-y: auto` + `-webkit-overflow-scrolling: touch`
  - 目录链接 `min-height: 40px`、`line-height: 40px`，触摸热区放大

### P1-5 特效开关移到汉堡菜单顶部
- **文件**：`.vitepress/theme/components/vue/layout.vue`
- **问题**：原用 `#nav-screen-content-after` 插槽，特效开关在汉堡菜单最末尾，需滚到底部才能看到
- **修复**：改用 `#nav-screen-content-before` 插槽，置于菜单顶部作为「外观设置」区；对应样式 `margin-top: 16px` 改为 `margin-bottom: 16px`

### P1-6 侧边栏抽屉滚动优化
- **文件**：`.vitepress/theme/css/layout/blur.css`、`.vitepress/theme/css/base/overrides.css`
- **修复**：`.VPNavScreen` 加 `-webkit-overflow-scrolling: touch` 启用旧 iOS 惯性滚动

### P1-7 侧边栏激活项胶囊移动端微调
- **文件**：`.vitepress/theme/css/base/overrides.css`
- **问题**：多级嵌套 + 胶囊 padding 累加在窄屏可能挤压文字
- **修复**（`@media (max-width: 959px)`）：
  - 激活项胶囊 `padding-left/right: 8px`（桌面端 12px）
  - 侧边栏项 `min-height: 40px`、`line-height: 40px`，触摸热区放大

---

## P2 · 界面布局与组件适配

### P2-8 浮动按钮覆盖范围扩大 + 移动端位置调整
- **文件**：`.vitepress/theme/components/vue/layout.vue`
- **问题**：原 `v-if="route.path.includes('/docs/')"` 仅匹配 `/docs/`，但实际文档在 `/features/`、`/manual/`、`/develop/`、`/plugins/`；移动端 `bottom: 100px` 与底部导航条重叠
- **修复**：
  - 新增 `showFloatButtons` 计算属性，用正则 `^\/(features|manual|develop|plugins|docs)\/` 覆盖所有文档路径，排除首页与 404
  - 移动端（`<959px`）`right: 16px`、`bottom: calc(80px + env(safe-area-inset-bottom))`、`gap: 10px`

### P2-9 通用 Markdown 表格横向滚动
- **文件**：`.vitepress/theme/css/custom.css`
- **问题**：宽表格在移动端会撑破容器导致整页横向滚动
- **修复**（`@media (max-width: 767px)`）：
  - `table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }`
  - `thead/tbody/tr { display: table; width: max-content; max-width: 100%; }` 保持表格布局

### P2-10 Live2D 移动端隐藏
- **文件**：`.vitepress/theme/components/vue/Live2D.vue`
- **问题**：首页看板娘 `right: 5px` 在移动端会遮挡首页右下角内容/按钮
- **修复**（`@media (max-width: 767px)`）：`.fox-wrapper { display: none; }`，优先保证首页内容可读性与可点击性

### P2-11 页脚星点装饰移动端隐藏
- **文件**：`.vitepress/theme/components/vue/layout.vue`
- **问题**：页脚星点用固定 px 偏移（-190px ~ 205px），窄屏全部落在视口外属无效渲染
- **修复**（`@media (max-width: 767px)`）：隐藏 `::after` 星点层，保留 `::before` 流光线（100% 宽渐变，窄屏仍可见）

---

## P3 · 性能与细节打磨

### P3-12 点击粒子特效移动端降级
- **文件**：`.vitepress/theme/components/vue/CornerClickEffect.vue`
- **问题**：`CornerClickEffect` 监听全局 click 事件，移动端触摸事件路径长，与触摸滚动易冲突
- **修复**：`onMounted` 中检测 `window.matchMedia('(max-width: 767px)').matches`，移动端直接 return 不绑定事件监听器

### P3-13 路由切换侧边栏滚动追踪延迟
- **文件**：`.vitepress/theme/components/vue/layout.vue`
- **问题**：路由切换时 `scrollIntoView` + `getBoundingClientRect` 在移动端低性能机型上与页面进入动画抢占主线程
- **修复**：用 `requestIdleCallback`（带 `timeout: 200` 兜底）延迟执行，不支持时直接调用

### P3-14 代码块 macOS 圆点装饰移动端缩减
- **文件**：`.vitepress/theme/css/custom.css`
- **问题**：所有代码块加了 32px 高圆点装饰条，移动端纵向空间宝贵
- **修复**（`@media (max-width: 767px)`）：圆点条高度 `32px → 24px`，圆点等比缩小并左移

### P3-15 搜索按钮 backdrop-filter 移动端降级
- **文件**：`.vitepress/theme/css/layout/blur.css`
- **问题**：`.DocSearch-Button` 的 `backdrop-filter: blur(10px)` 与父级 `.VPLocalNav` 的 blur 叠加，移动端低端机滚动时易掉帧
- **修复**（`@media (max-width: 767px)`）：搜索按钮 `backdrop-filter: none`，视觉差异极小

---

## 修改文件清单

共修改 **9 个文件**：

| 文件 | 修改项 |
|------|--------|
| `.vitepress/config.mts` | P0-1 viewport meta |
| `.vitepress/theme/css/layout/blur.css` | P0-2 安全区、P1-6 抽屉滚动、P3-15 搜索按钮降级 |
| `.vitepress/theme/components/vue/layout.vue` | P0-2 浮动按钮/页脚安全区、P1-5 特效开关位置、P2-8 浮动按钮覆盖、P2-11 页脚星点、P3-13 路由滚动延迟 |
| `.vitepress/theme/css/layout/hero.css` | P0-3 100dvh |
| `.vitepress/theme/components/vue/ChristmasTree.vue` | P0-3 100dvh |
| `.vitepress/theme/css/base/overrides.css` | P1-4 目录下拉、P1-6 抽屉滚动、P1-7 侧边栏胶囊 |
| `.vitepress/theme/css/custom.css` | P2-9 表格滚动、P3-14 代码块圆点 |
| `.vitepress/theme/components/vue/Live2D.vue` | P2-10 移动端隐藏 |
| `.vitepress/theme/components/vue/CornerClickEffect.vue` | P3-12 移动端不绑定事件 |

---

## 验证结果

每类修复后均运行 `pnpm build` 验证：

| 阶段 | exit code | 构建错误 | 水印 fail |
|------|-----------|----------|-----------|
| P0 后 | 0 | 0 | 0 |
| P1 后 | 0 | 0 | 1（与本次改动无关的图片处理问题） |
| P2 后 | 0 | 0 | 0 |
| P3 后 | 0 | 0 | 0 |

---

## 设计原则

本次修复遵循以下原则，确保不破坏已有的桌面端体验：

1. **渐进增强**：所有移动端适配用 `@media (max-width: Npx)` 隔离，桌面端样式零影响
2. **安全区通用**：`env(safe-area-inset-*)` 在非刘海设备返回 0，桌面端与旧设备不受影响
3. **SSR 一致性**：所有 JS 层改动（matchMedia 检测）仅在 `onMounted` 执行，不影响 SSR 首帧
4. **性能分层**：移动端特效默认关闭 + 主动开启时进一步降级（CornerClickEffect 不绑定事件、搜索按钮去 blur）
5. **保留桌面端设计语言**：玻璃拟态、胶囊高亮、星点页脚等美学元素在桌面端完整保留，仅移动端按需降级

---

## 后续建议（未在本次修复范围内）

以下为审查中发现但本次未处理的事项，供后续规划：

1. **VPSidebar 桌面端滚动条**：当前已美化（5px 宽），但移动端抽屉内滚动条样式未单独优化
2. **404 页面**：NotFound.vue 已有 480px 断点适配，但未做安全区适配
3. **ReviewForm.vue**：review 目录下的表单组件有 640px 适配，但未做安全区适配
4. **Mermaid 图表**：config.mts 配置了 Mermaid 插件，生成的 SVG 在移动端可能溢出，建议后续验证
