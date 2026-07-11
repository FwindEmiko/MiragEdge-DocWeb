# MiragEdge-DocWeb 代码审查报告

> 审查日期：2026-07-11
> 审查范围：`.vitepress/` 下的全部配置、脚本、组件、样式与数据文件
> 审查重点：功能逻辑问题 + 性能优化（加载速度）

---

## 一、审查的文件清单

| 类别 | 文件 | 说明 |
|------|------|------|
| 配置 | `.vitepress/config.mts` | VitePress 站点配置 |
| 配置 | `package.json` | 依赖与构建脚本 |
| 主题入口 | `.vitepress/theme/index.ts` | 组件注册与全局初始化 |
| 插件 | `.vitepress/theme/addContributors.ts` | 贡献者数据 Vite 插件 |
| JS 脚本 | `components/js/nav-icons.js` | 导航栏 emoji 增强 |
| JS 脚本 | `components/js/feature.js` | 3D 倾斜效果 |
| JS 脚本 | `components/js/notice.js` | 通知与控制台 logo |
| JS 脚本 | `components/js/contributors.js` | 贡献者脚本启动器 |
| Vue 组件 | 24 个 `.vue` 文件 | 含 layout、SmartImage、McItem、Furnace 等 |
| CSS 样式 | 11 个 `.css` 文件 | 含 hero、feature、blur、animation 等 |
| 数据文件 | `data/mc-textures.ts`、`data/enchantments.ts` | 结构化数据 |

---

## 二、问题汇总（按优先级）

### P0 — 严重问题（功能失效 / 内存泄漏）

#### 1. `:deep(.dark)` 误用导致暗色模式样式完全失效
**文件**：`Furnace.vue`（L276/L282-284/L289）、`CraftingTable.vue`（L251/L257-258/L263/L268）、`McItem.vue`（L195/L200）、`SmartImage.vue`（L355/L360/L365/L369/L373）

**问题**：在 Vue scoped 样式中使用 `:deep(.dark) .xxx` 写法。编译后变为 `[data-v-xxx] .dark .xxx`，要求 `.dark` 是组件根元素（带 `data-v` 属性）的**后代**。但 VitePress 中 `.dark` 类挂在 `<html>` 标签上，是组件根的**祖先**，并非后代，因此该选择器**永远不会匹配**。

**影响**：Furnace 和 CraftingTable 的暗色模式样式（背景、边框、箭头颜色等）全部失效；McItem 和 SmartImage 的暗色模式适配也不生效。

**修复方向**：移除 `:deep()`，直接写 `.dark .xxx`（编译为 `.dark .xxx[data-v-xxx]`，`.dark` 为祖先即可匹配）。同目录下 `Contributors.vue`（L264）的 `.dark .contributor-card` 即为正确范例。

---

#### 2. `CornerQuotes.vue` — setInterval 未清理（内存泄漏）
**文件**：`CornerQuotes.vue`（L40-46）

**问题**：`onMounted` 中创建了 `setInterval(..., 30000)` 和内部嵌套的 `setTimeout(..., 300)`，但没有 `onUnmounted`/`onBeforeUnmount` 清理。组件卸载后定时器仍在运行，持续向已卸载组件的 ref 写入，造成内存泄漏和 Vue 警告。

**影响**：该组件被 `layout.vue`（随机角落装饰）和 `NotFound.vue`（L6）使用，触发频率较高。每次路由切换若随机命中该组件，旧定时器不会被清除。

---

#### 3. `CornerClickEffect.vue` — click 事件监听器泄漏
**文件**：`CornerClickEffect.vue`（L74-87）

**问题**：`onMounted` 中先 `setTimeout(500ms)` 再 `document.addEventListener('click', handleClick)`，而 `onUnmounted` 中 `removeEventListener`。若组件在 500ms 内卸载：`removeEventListener` 时监听器尚未添加（无操作），500ms 后监听器被添加到 `document` 上但**永远不会被移除**。此后每次点击页面都会触发 `handleClick`，向已卸载组件的 `particles` ref push 数据。

**影响**：该组件在 `layout.vue` 中**无条件渲染**（L139），全局存在。配合 `layout.vue` 不随路由销毁的特性，实际泄漏概率较低，但逻辑缺陷存在。

---

#### 4. `CornerSurprise.vue` — 外层 setTimeout 未清理
**文件**：`CornerSurprise.vue`（L41-50/L53-55）

**问题**：`onMounted` 中 `setTimeout(5000)` 启动调度链，但该外层 timeout 的 id 未被保存，`onUnmounted` 只清理了内部递归调度的最新 timeout。若组件在 5 秒内卸载，5 秒后 `scheduleNext` 仍会执行。此外 `createSurprise` 内部的 `setTimeout(3000)` 用于移除元素，也未清理。

**影响**：该组件在 `layout.vue` 中**无条件渲染**（L138），全局存在。

---

#### 5. `nav-icons.js` — MutationObserver 累积泄漏
**文件**：`nav-icons.js`（L88-113）、`index.ts`（L84-87/L103）

**问题**：
1. `initNavIcons()` 每次被调用都会创建一个**新的** `MutationObserver` 并 `observe(document.body)`，旧的 observer 不会被断开。
2. `index.ts` 中 `router.onAfterRouteChanged` 每次路由切换都调用 `initNavIcons()`，`setup()` 的 `onMounted` 也调用一次。
3. 路由切换 N 次后，有 N+1 个 MutationObserver 同时监听 DOM 变化。
4. `enhanceAll()` 修改 DOM（设置 `innerHTML`）会触发 MutationObserver，形成"修改→触发→防抖→再修改"的循环（虽有 150ms 防抖缓解）。

**影响**：随使用时间增长，观察者数量线性上升，DOM 变化回调被重复触发，页面逐渐变卡。

---

#### 6. `addContributors.ts` — git.log 调用逻辑错误，贡献者数据永远为空
**文件**：`addContributors.ts`（L36-37/L155-159）

**问题**：
- `getRepoContributors()`（L36）：`git.log(['--format=%ae %H'])` 后取 `logOutput.latest?.hash`。`simple-git` 的 `log()` 返回的 `latest.hash` 是**最新一条提交的 SHA1**，不是所有提交的格式化输出。`hash.split('\n')` 只会得到一个单元素数组（那个 hash），无法解析出 email。
- `getEmailList()`（L155-159）：同样的问题，`logOutput.latest?.hash.split('\n')` 只得到最新提交 hash，不是该文件的所有提交 email 列表。

**影响**：`getAllContributors()` 返回的 `fullContributorData` 永远为空数组，所有页面的 `contributors` frontmatter 字段不会被注入。Contributors 组件实际上拿不到任何贡献者数据。

---

#### 7. `contributors.js` — 路径拼接错误
**文件**：`contributors.js`（L13）

**问题**：`path.join(__dirname, './.vitepress/theme/addContributors.ts')`。`__dirname` 是 `.vitepress/theme/components/js/`，拼接后得到 `.vitepress/theme/components/js/.vitepress/theme/addContributors.ts`，路径不存在。

**修复方向**：应为 `path.join(__dirname, '../../addContributors.ts')`。

---

#### 8. `notice.js` — 通知已过期，永远不会显示
**文件**：`notice.js`（L24）

**问题**：`EXPIRY_DATE_STRING = '2026-6-20'`，今天（2026-07-11）已过期。`showAestheticNotice()` 在过期检查后直接 `return`，通知永远不会显示。

**说明**：如果这是有意让通知过期，则无需处理；如果希望通知继续显示，需更新日期。

---

### P1 — 中等问题（性能 / 边界 / SSR）

#### 9. `EnchantmentList.vue` — 哨兵 IntersectionObserver 不会重新观察新节点
**文件**：`EnchantmentList.vue`（L88-89/L180-193）

**问题**：哨兵节点带 `v-if="hasMore && filteredItems.length > 0"`。当用户切换品质（`selectRarity`）或搜索（`searchQuery` 变化）时，`visibleCount` 重置为 `pageSize`，`hasMore` 在 true/false 间切换，哨兵 DOM 被销毁并重建。但 observer 只在 `onMounted` 的 `nextTick` 中观察了一次，新哨兵节点从未被 observe。

**影响**：切换品质标签或搜索后，滚动自动加载失效，只剩"加载更多"按钮可用。

**修复方向**：在 `watch([searchQuery, activeRarity], ...)` 中 `nextTick` 后重新 `observer.observe(sentinelRef.value)`，或用 `watch(() => sentinelRef.value, ...)` 监听哨兵节点变化。

---

#### 10. `MapIcon.vue` — 整包导入 lucide 图标库，破坏 tree-shaking
**文件**：`MapIcon.vue`（L9）

**问题**：`import * as LucideIcons from 'lucide-vue-next'` 配合 `LucideIcons[iconName]` 动态属性访问，会把整个 lucide-vue-next 图标库（数千个图标）全部打包进 bundle，tree-shaking 失效。

**影响**：显著增加首屏 JS 体积，拖慢加载速度。

**修复方向**：按需显式 import 用到的图标，或用动态 `import()` 懒加载。

---

#### 11. `feature.css` — 首页卡片 backdrop-filter + 3D 合成层爆炸
**文件**：`feature.css`（L13/L20-21/L25/L51/L94/L98-119）

**问题**：
- 每张 Feature 卡片都有独立的 `backdrop-filter: blur(20px) saturate(120%)`（L20-21），首页 6-9 张卡片意味着 6-9 次背景采样+模糊。
- `will-change: transform`（L25）永久常驻，每张卡片占一个合成层。
- `transform-style: preserve-3d`（L13）+ `.VPFeature > * { transform: translateZ(20px); }`（L94），每个子元素都进入 3D 合成，合成层数量 = 卡片数 × 子元素数。
- `mix-blend-mode: overlay`（L51）光泽层与上述叠加。
- `iconBreathe` 无限动画（L98-119）作用于每张卡片图标，6-9 个并发无限动画，无 `prefers-reduced-motion` 守护。
- 浅色模式背景 `rgba(255,255,255,0.6)`（L63）几乎不透明，模糊效果肉眼难辨，成本收益极低。

**影响**：首页是最大性能瓶颈，移动端尤其明显。

---

#### 12. `hero.css` — 全屏 130px blur 极光层 + :root 彩虹动画
**文件**：`hero.css`（L32-43/L135-147/L620-622）

**问题**：
- `.VPHomeHero::before/::after` 是两个 `100vw×100vh` 的 `position: fixed` 全屏元素，`filter: blur(130px) saturate(150%)` + `will-change: transform, opacity` + 无限 transform 动画。130px 模糊半径 + 全屏尺寸是极高开销组合。
- `:root { animation: rainbow 8s linear infinite; }`（L620-622）在 `<html>` 上动画 CSS 自定义属性。由于自定义属性被所有后代继承，每次关键帧变化（80 步/8s = 10 次/秒）触发**整文档样式重算**。未声明 `@property`，属性不做颜色插值而是 80 次离散跳变。
- L146 `animation: rainbow 4s` 被 L621 `animation: rainbow 8s` 覆盖，4s 是死代码。
- L141-147 `:root` 上的 `-webkit-background-clip: text` 对 `<html>` 无效（无直接文本可裁剪）。

---

#### 13. `blur.css` — 导航栏常驻 blur(20px) saturate(180%)
**文件**：`blur.css`（L38-39/L93-94）

**问题**：`.VPNavBar`/`.VPLocalNav` 使用 `backdrop-filter: blur(20px) saturate(180%)`。`saturate(180%)` 非常昂贵，且导航栏是常驻可见的大面积元素。滚动时每帧需重新采样+模糊+饱和度处理。

---

#### 14. `layout.vue` — 角落组件未懒加载 + SSR 随机数 hydration mismatch
**文件**：`layout.vue`（L7-18/L36-44）

**问题**：
- 所有 12 个 Corner/装饰组件都是静态 `import`（L7-18），即使每次只有一个被 `v-if` 渲染，全部都进入主 bundle。
- `watch(() => route.path, ..., { immediate: true })`（L36-44）在 `immediate` 时（SSR 首次执行）调用 `Math.random()`，SSR 与客户端结果不同导致 hydration mismatch。

---

#### 15. `NodeStatus.vue` — 高频轮询 + 无请求取消
**文件**：`NodeStatus.vue`（L128/L105-122）

**问题**：
- 每 5 秒 `fetch` 一次并整体替换 `servers.value`，触发全列表重渲染。
- `fetch` 无 `AbortController`，组件卸载时若有 in-flight 请求，完成后仍会写入已卸载组件的 ref。
- 5 秒间隔对状态页偏激进。
- `.status-online` 用浅色背景（L201），暗色模式下视觉不佳（未适配 dark）。
- `formatMemory`（L88-93）除以两次 1024 得 GB；`formatDisk`（L96-102）只除一次 1024，单位换算不一致。

---

#### 16. `ChristmasTree.vue` — 硬编码天数 + hydration mismatch
**文件**：`ChristmasTree.vue`（L147/L150/L187-233）

**问题**：
- `loveDays = ref(1032)` 是硬编码值，未根据 `startDate` 实时计算，时间越久越不准。
- `currentYear = new Date().getFullYear()` 在 setup 顶层执行，SSR 构建时与客户端 hydrate 时若跨年会产生 hydration mismatch。
- `initTreeDecorations` 在 `onMounted` 调用，SSR 时不执行，客户端 hydrate 后突然出现约 101 个带无限动画的 DOM 元素（30 彩灯 + 15 球 + 6 礼物 + 50 雪花），存在 hydration mismatch 与视觉闪烁。
- 彩灯带 `box-shadow` 光晕（L576-581），低端设备性能压力大。

---

#### 17. `ChangelogFromMd.vue` — v-html XSS 风险 + 方法未缓存
**文件**：`ChangelogFromMd.vue`（L65/L255-257/L234/L134/L279）

**问题**：
- `formatContent`（L65）通过正则把 `[text](url)` 替换为 `<a href="url">text</a>`，URL 和文本均未做 HTML 转义，配合 `v-html` 存在 XSS 风险（内容来自自有文件，风险较低但值得警惕）。
- `formatContent` 和 `getTypeCounts`（L234）作为方法在模板中调用，每次重渲染都对每个 detail 重新计算，未用 computed 缓存。
- L134 `lineNum` 变量自增但从未使用（死代码）。
- L279 `loadMore` 中 `await new Promise(r => setTimeout(r, 300))` 人为加 300ms 延迟。

---

#### 18. `animation.css` — 永久 will-change + prefers-reduced-motion 覆盖不全
**文件**：`animation.css`（L24-26/L39-41）

**问题**：
- `.VPContent { will-change: transform, opacity; transform: translateZ(0); }`（L24-26）永久 will-change 反模式，整页常驻合成层，浪费 GPU 内存。
- `@media (prefers-reduced-motion: reduce)`（L44-47）只禁用了 `.VPContent` 动画，未覆盖 hero.css 极光动画、彩虹动画、feature.css iconBreathe、3D 倾斜等所有动效。

---

#### 19. `custom.css` — 代码块圆点定位 bug + width 过渡性能问题
**文件**：`custom.css`（L65/L131/L70-104）

**问题**：
- L70-104：代码块 macOS 圆点 `::after` 使用 `position: absolute`，但父级 `div[class*='language-']` 未设置 `position: relative`，圆点定位回退到最近的已定位祖先，位置不可靠。
- L65：`.scroll-progress { transition: width 0.05s linear; }` 对 `width` 做过渡，每次滚动触发布局重排。应改用 `transform: scaleX()`。
- L131：链接下划线 hover 动画使用 `width` 过渡，同样触发布局。应改用 `transform: scaleX()`。

---

#### 20. `hero.css` — 全局隐藏滚动条 + z-index 极光层可能被遮挡
**文件**：`hero.css`（L11-29/L36）

**问题**：
- `html`/`body` 全局隐藏滚动条（`scrollbar-width: none`、`::-webkit-scrollbar { display: none }`），放在 hero.css（首页布局文件）中却全局生效，影响所有页面。损害可用性/可访问性。
- L36 `z-index: -999`：VitePress 默认在 `body` 上设不透明 `background-color`，极光层在 body 背景之下可能被完全遮挡。

---

#### 21. 跨文件 CSS 变量重复定义 + 6 组样式冲突
**文件**：`colors.css`/`hero.css`/`overrides.css`/`button.css`/`blur.css`/`search.css`

**问题**：
- `--vp-c-brand-1/2/3/soft` 在 `:root` 中由 colors.css、hero.css、overrides.css 三个文件重复定义（浅色模式值相同纯冗余）；`.dark` 中三者值不同，最终生效取决于加载顺序。暗色模式 `--vp-c-brand-3` 在 overrides.css 中缺失，回退到 hero.css 的值。
- `overrides.css` L17-19：`--vp-c-brand-light` 指向 `--vp-c-brand-soft`（半透明色），语义错乱。
- 6 组跨文件样式冲突：`.VPButton`、`.VPNavBar` 玻璃、`.DocSearch-Button:hover`、`.VPLocalSearchBox`、侧边栏激活态、`.float-button`。
- `!important` 滥用 80+ 处（overrides.css 18 处、search.css 16 处、blur.css 13 处、hero.css 20+ 处、feature.css 9 处）。

---

### P2 — 轻微问题（清理缺失 / 小逻辑）

#### 22. 多个 Corner 组件 — setTimeout 未清理
**文件**：`CornerStars.vue`（L16-20）、`CornerSakura.vue`（L20-22）、`CornerBubbles.vue`（L10-12）、`CornerNotes.vue`（L9-11）、`CornerFireflies.vue`（L9-11）、`CornerLeaves.vue`（L9-11）、`Live2D.vue`（L9-12/L16-18）

**问题**：`onMounted` 中用 `setTimeout(500)` 设置 `isVisible`，未在卸载时清理。若组件在 500ms 内卸载，回调仍会触发并写入已卸载组件的 ref（Vue 3 静默处理，影响小但非最佳）。

---

#### 23. `CornerSakura.vue` — 花瓣永不移除 + id 碰撞
**文件**：`CornerSakura.vue`（L10/L30-34）

**问题**：
- `setInterval` 每 3 秒检查 `petals.value.length < 15` 才补充，但花瓣动画是 `infinite` 永远不会从数组中移除，初始 15 个后长度恒为 15，`< 15` 永远为 false，interval 空转（死代码）。
- `id: Math.random()`（L10）有碰撞风险，应用递增计数器。

---

#### 24. `MapIcon.vue` — $listeners 死代码 + 重复键 + 空 addonMap
**文件**：`MapIcon.vue`（L4/L100/L106/L98/L136/L135/L141/L84/L185/L86/L195/L188/L196/L77/L187/L258-260）

**问题**：
- L4：`v-on="$listeners"` 在 Vue 3 中 `$listeners` 已移除（合并进 `$attrs`），是死代码。
- iconMap 对象中存在大量重复键（shield/terminal/code/globe/star/fox/edit 等），后者覆盖前者。
- addonMap（L258-260）为空对象，是死代码。

---

#### 25. `Contributors.vue` — 头像 eager 加载 + error 处理潜在循环
**文件**：`Contributors.vue`（L20/L53-56/L100）

**问题**：
- 头像显式 `loading="eager"`，但贡献者列表通常在页脚（视口外），应使用 `lazy` 懒加载。
- `handleAvatarError` 把 `target.src` 设为 fallback URL，若 fallback 也加载失败，`@error` 会再次触发，可能形成请求循环。
- L100 无逗号分支用 `nickname` 作为 GitHub 用户名拼 avatar URL，若昵称不是合法 GitHub 用户名会 404。

---

#### 26. `FoodStats.vue` — SVG clipPath id 冲突
**文件**：`FoodStats.vue`（L61/L45）

**问题**：半鸡腿 SVG 内 `<clipPath id="half-clip">` 使用固定 id。若页面同时存在多个 `FoodStats` 实例（多个食物卡片），会出现多个相同 id 的 `clipPath`，`url(#half-clip)` 引用可能指向错误实例。

---

#### 27. `layout.vue` — 死 CSS 选择器 + 无意义条件
**文件**：`layout.vue`（L316/L160）

**问题**：
- L316：`.centerdss .Contributors` 选择器中，Contributors 组件根元素实际 class 为 `contributors-container`，不存在 class=`Contributors` 的元素，该选择器永不匹配（死 CSS）。
- L160：`v-if="route.path.includes('/')"` 几乎总是 true（所有路径都包含 `/`），条件无意义。

---

#### 28. `feature.js` — 模块顶层 setTimeout 重复执行
**文件**：`feature.js`（L39-40）

**问题**：模块顶层 `if (typeof window !== 'undefined') { setTimeout(init3DTiltEffect, 500); }` 会在模块被 import 时自动执行。但 `index.ts` 的 `setup()` 中已经手动调用了 `init3DTiltEffect()`（L101），导致首页 Feature 卡片被绑定两次 mousemove 监听器。

---

#### 29. `dark.css` — .dark img 选择器过宽
**文件**：`dark.css`（L12）

**问题**：`.dark img { filter: brightness(0.8); }` 影响所有 `<img>`（含 logo、图标、hero 图、SmartImage 组件等）。部分图片可能已为暗色适配，再降亮度会过暗。`filter` 还会为每张图创建新堆叠上下文。

---

#### 30. `EnchantmentList/EnchantmentIdTable` — 每行 find 未缓存
**文件**：`EnchantmentList.vue`（L160-163）、`EnchantmentIdTable.vue`（L86-94）

**问题**：在 `v-for` 的每行中调用 `rarityColor(ench.rarity)`，内部对 `rarities` 数组做 `find`。行数多时每渲染一次就做 N 次 find。可预先把 `rarities` 转成 `Record<key, {color,label}>` 的 map 缓存。

---

## 三、性能优化建议汇总

### 加载速度

| 优化项 | 文件 | 预期收益 |
|--------|------|----------|
| MapIcon 改按需 import 图标 | `MapIcon.vue` L9 | 大幅减少 JS 体积（lucide 全包约数百 KB） |
| Corner 组件改 defineAsyncComponent | `layout.vue` L7-18 | 减少主 bundle 体积，按需加载装饰组件 |
| Contributors 头像改 lazy | `Contributors.vue` L20 | 减少首屏图片请求数 |
| McItem 图片已用 lazy（良好） | `McItem.vue` L120 | ✓ 保持 |
| SmartImage 默认 lazy=false | `SmartImage.vue` L98 | 建议视场景改为 true，减少首屏图片请求 |

### 运行时性能

| 优化项 | 文件 | 预期收益 |
|--------|------|----------|
| feature.css 去掉逐卡片 backdrop-filter | `feature.css` L20-21 | 首页最大瓶颈，移除后合成层大幅减少 |
| hero.css 降低极光层 blur 半径或改静态 | `hero.css` L32-43 | 消除全屏每帧重绘 |
| hero.css 移除 :root 彩虹动画或用 @property | `hero.css` L620-622 | 消除整文档 10 次/秒样式重算 |
| blur.css 降低导航栏 saturate 或去 blur | `blur.css` L38-39 | 消除滚动时常驻 GPU 开销 |
| animation.css 移除永久 will-change | `animation.css` L24 | 释放整页合成层内存 |
| custom.css 进度条改 transform: scaleX | `custom.css` L65 | 消除滚动时布局重排 |
| nav-icons MutationObserver 单例化 | `nav-icons.js` L100 | 避免观察者累积泄漏 |
| NodeStatus 降低轮询频率 + AbortController | `NodeStatus.vue` L128 | 降低网络与渲染频率 |
| ChangelogFromMd 方法改 computed | `ChangelogFromMd.vue` L65/L234 | 避免每次重渲染重复计算 |
| EnchantmentList rarityColor 改 map 缓存 | `EnchantmentList.vue` L160 | 减少 N 次 find |

### 可访问性

| 优化项 | 文件 |
|--------|------|
| 恢复滚动条可见性 | `hero.css` L11-29 |
| 补全 prefers-reduced-motion 覆盖 | `animation.css`/`feature.css`/`hero.css` |
| SmartImage 图片默认 opacity 非 0 | `SmartImage.vue` L274 |

---

## 四、建议修复顺序

1. **P0 功能修复**：`:deep(.dark)` 暗色模式失效（Furnace/CraftingTable/McItem/SmartImage）→ 定时器/监听器泄漏（CornerQuotes/CornerClickEffect/CornerSurprise/nav-icons）→ addContributors git.log 逻辑错误
2. **P1 性能优化**：feature.css backdrop-filter → hero.css 极光层+彩虹动画 → MapIcon 按需 import → EnchantmentList 哨兵重新观察
3. **P2 代码清理**：Corner 组件 setTimeout 清理 → 死代码移除 → CSS 变量统一 → !important 精简
