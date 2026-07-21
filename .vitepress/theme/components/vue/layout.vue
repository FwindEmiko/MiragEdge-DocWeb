<!-- 自定义布局组件，包含路由过渡动画和浮动按钮 -->

<script setup>
import { useRouter, useData, withBase } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { ref, watch, nextTick, provide, computed, defineAsyncComponent, onMounted, onUnmounted } from "vue";
import Contributors from './Contributors.vue';
import NotFound from './NotFound.vue';
import Live2D from './Live2D.vue';
import EffectsToggle from './EffectsToggle.vue';
import ImageLightbox from './ImageLightbox.vue';
import { effectsEnabled, initEffectsToggleState } from '../../composables/useEffectsToggle';
import { useTocAutoScroll } from '../../composables/useTocAutoScroll';

// 右侧「本页目录」长目录自动滚动跟随 active 项
useTocAutoScroll();

// Corner 装饰组件改为异步加载，减少主 bundle 体积
const CornerStars = defineAsyncComponent(() => import('./CornerStars.vue'));
const CornerQuotes = defineAsyncComponent(() => import('./CornerQuotes.vue'));
const CornerBubbles = defineAsyncComponent(() => import('./CornerBubbles.vue'));
const CornerSakura = defineAsyncComponent(() => import('./CornerSakura.vue'));
const CornerNotes = defineAsyncComponent(() => import('./CornerNotes.vue'));
const CornerLeaves = defineAsyncComponent(() => import('./CornerLeaves.vue'));
const CornerSurprise = defineAsyncComponent(() => import('./CornerSurprise.vue'));
const CornerFireflies = defineAsyncComponent(() => import('./CornerFireflies.vue'));
const CornerClickEffect = defineAsyncComponent(() => import('./CornerClickEffect.vue'));

const { Layout } = DefaultTheme;
const { route } = useRouter();
const { isDark, page } = useData();

const buildId = __BUILD_ID__
const buildSha = __BUILD_SHA__
const soulUrl = withBase('/soul')

// 检测是否为 404 页面
const is404 = computed(() => page.value.isNotFound);

// 检测是否为首页
const isHome = computed(() => route.path === '/' || route.path === '/index.html');

// 悬浮按钮显示条件：所有文档内容路径（含长文档需要返回顶部），排除首页与 404
// 覆盖原本仅 /docs/ 的窄范围，扩展到 features/manual/develop/plugins 等实际文档区
const showFloatButtons = computed(() => {
  if (is404.value || isHome.value) return false
  return /^\/(features|manual|develop|plugins|docs)\//.test(route.path)
});

// 随机角落装饰 - 每次路由变化时重新计算
const randomCorner = ref(null)
const prefersReducedMotion = ref(false)
const effectsActive = computed(() => effectsEnabled.value && !prefersReducedMotion.value)

// 搜索弹窗动画的 MutationObserver 引用（onUnmounted 时断开）
let searchAnimObserver = null
let motionMediaQuery = null
let motionPreferenceHandler = null
const searchBoxCleanups = new Map()

/**
 * 搜索弹窗开关动画
 * VitePress 的 VPLocalSearchBox 用 v-if 直接挂载/销毁，无 leave 过渡阶段，
 * 关闭时瞬间消失。这里用 MutationObserver 监听弹窗挂载，通过 .search-open
 * class 控制 transition 实现开启动画；并拦截关闭触发点（backdrop 点击、
 * 返回按钮点击、Escape 键），先播放关闭 transition 再放行真正的关闭。
 *
 * 拦截机制：capture 阶段 stopImmediatePropagation 阻止 VitePress 的事件处理，
 * 动画结束后用 approved flag 放行并重新触发原事件。
 */
function initSearchAnimations() {
  const scan = () => {
    for (const [box, cleanup] of searchBoxCleanups) {
      if (!box.isConnected) {
        cleanup()
      }
    }

    document.querySelectorAll('.VPLocalSearchBox').forEach((box) => {
      if (!box.__searchAnimInit) {
        box.__searchAnimInit = true
        hookupSearchBox(box)
      }
    })
  }

  const mo = new MutationObserver(scan)
  mo.observe(document.body, { childList: true, subtree: true })
  scan()

  function hookupSearchBox(box) {
    const shell = box.querySelector('.shell')
    const backdrop = box.querySelector('.backdrop')
    const backBtn = box.querySelector('.back-button')
    let approved = false
    let closeTimer = null
    let firstFrame = null
    let secondFrame = null
    let cleaned = false

    const cleanup = () => {
      if (cleaned) return
      cleaned = true
      if (firstFrame !== null) cancelAnimationFrame(firstFrame)
      if (secondFrame !== null) cancelAnimationFrame(secondFrame)
      if (closeTimer !== null) clearTimeout(closeTimer)
      backdrop?.removeEventListener('click', backdropHandler, true)
      backBtn?.removeEventListener('click', backHandler, true)
      document.removeEventListener('keydown', escHandler, true)
      searchBoxCleanups.delete(box)
    }

    const animateClose = (retrigger) => {
      if (approved || cleaned) return
      approved = true
      shell?.classList.remove('search-open')
      backdrop?.classList.remove('search-open')
      const closeMs = prefersReducedMotion.value ? 0 : 240
      closeTimer = window.setTimeout(() => {
        cleanup()
        retrigger()
      }, closeMs)
    }

    // 开启动画：双 rAF 确保初始隐藏态已渲染，再添加 .search-open 触发 transition
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        shell?.classList.add('search-open')
        backdrop?.classList.add('search-open')
      })
    })

    // 拦截 backdrop 点击（点遮罩关闭）
    const backdropHandler = (e) => {
      if (approved) return
      e.stopPropagation()
      e.stopImmediatePropagation()
      animateClose(() => backdrop.click())
    }

    // 拦截返回按钮点击
    const backHandler = (e) => {
      if (approved) return
      e.stopPropagation()
      e.stopImmediatePropagation()
      animateClose(() => backBtn.click())
    }

    // 拦截 Escape 键（capture 阶段先于 VitePress 的 window keydown 监听）
    const escHandler = (e) => {
      if (e.key !== 'Escape' || approved) return
      e.stopPropagation()
      e.stopImmediatePropagation()
      animateClose(() => {
        window.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })
        )
      })
    }

    backdrop?.addEventListener('click', backdropHandler, true)
    backBtn?.addEventListener('click', backHandler, true)
    document.addEventListener('keydown', escHandler, true)
    searchBoxCleanups.set(box, cleanup)
  }

  return mo
}

function cleanupSearchAnimations() {
  for (const cleanup of [...searchBoxCleanups.values()]) {
    cleanup()
  }
}

// 随机数生成函数，SSR 和客户端分别使用固定值和随机值避免 hydration mismatch
function pickRandomCorner() {
  // 30% 概率显示装饰
  if (Math.random() <= 0.3) {
    const components = ['stars', 'quotes', 'bubbles', 'sakura', 'notes', 'leaves', 'fireflies'];
    return components[Math.floor(Math.random() * components.length)];
  }
  return null;
}

onMounted(() => {
  initEffectsToggleState()
  motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionPreferenceHandler = (event) => {
    prefersReducedMotion.value = event.matches
  }
  prefersReducedMotion.value = motionMediaQuery.matches
  motionMediaQuery.addEventListener?.('change', motionPreferenceHandler)
  randomCorner.value = pickRandomCorner()
  // 返回顶部按钮：注册滚动监听并做初始计算（passive 避免阻塞滚动）
  window.addEventListener('scroll', updateScrollProgress, { passive: true })
  updateScrollProgress()
  // 搜索弹窗开关动画：VitePress 用 v-if 直接销毁组件无 leave 阶段，
  // 需 JS 拦截关闭动作，先播放关闭 transition 再放行真正关闭
  searchAnimObserver = initSearchAnimations()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollProgress)
  searchAnimObserver?.disconnect()
  cleanupSearchAnimations()
  motionMediaQuery?.removeEventListener?.('change', motionPreferenceHandler)
  motionMediaQuery = null
  motionPreferenceHandler = null
})

watch(() => route.path, () => {
  randomCorner.value = pickRandomCorner()
  // 路由切换后重置返回顶部按钮状态（VitePress 默认会滚动到顶部）
  showBackToTop.value = false
  scrollProgress.value = 0
})

/**
 * 滚动到页面顶部
 */
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion.value ? 'auto' : 'smooth'
  });
};

/**
 * 返回顶部按钮的显示控制与阅读进度
 * - 仅在移动端文档页显示（桌面端由 CSS display:none 强制隐藏）
 * - 阅读进度达到 1/3 后才出现（progress = scrollY / maxScroll >= 1/3）
 * - scrollProgress（0~1）实时驱动按钮外圈进度环
 */
const showBackToTop = ref(false)
const scrollProgress = ref(0)

const updateScrollProgress = () => {
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  if (scrollHeight <= 0) {
    scrollProgress.value = 0
    showBackToTop.value = false
    return
  }
  const progress = Math.min(window.scrollY / scrollHeight, 1)
  scrollProgress.value = progress
  showBackToTop.value = progress >= 1 / 3
}

/**
 * 监听路由变化，为内容区域触发进入动画（CSS animation，不依赖 :key 重建组件）
 * 这样 VPSidebar 不会被销毁重建，侧边栏滚动位置得以保持
 *
 * 闪烁修复：VitePress 异步路由加载可能导致 nextTick 跨微任务执行，
 * 新内容在 nextTick 回调前已以 opacity:1 被浏览器绘制一帧。
 * 在 nextTick 中先预设 inline opacity:0 堵住这个窗口，再重启动画，
 * 确保浏览器绘制的始终是 opacity:0 → 1 的淡入过程，而非 1 → 0 → 1 的闪烁。
 *
 * 侧边栏动画优化：watch 默认 flush:'pre'（DOM 更新前执行回调），此时可拿到
 * 旧侧边栏的链接结构指纹。nextTick 中（DOM 更新后）取新指纹比较，
 * 仅当侧边栏结构变化（如跨分组切换）时才播放淡入动画。
 * 同一分组内切换页面时侧边栏结构不变，跳过动画避免「抽搐」感。
 */

// 提取侧边栏链接结构指纹：所有链接的 href 列表拼接，结构相同则指纹相同。
// 遍历量通常 10-50 个链接，性能可忽略。
function getSidebarFingerprint() {
  const nav = document.querySelector('.VPSidebar .nav')
  if (!nav) return ''
  const links = nav.querySelectorAll('a[href]')
  return Array.from(links, a => a.getAttribute('href')).join('\n')
}

watch(
  () => route.path,
  () => {
    // flush:pre，DOM 还是旧的 —— 记录旧侧边栏结构指纹
    const oldSidebarFingerprint = window.matchMedia('(min-width: 960px)').matches
      ? getSidebarFingerprint()
      : ''

    nextTick(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // 页面进入动画
      const target = document.querySelector('.vp-doc') || document.querySelector('#VPContent')
      if (target && !reduceMotion) {
        target.classList.remove('page-enter')
        // 预设 opacity:0，堵住「新内容先以 opacity:1 渲染一帧」的闪烁窗口。
        // 若 nextTick 与 DOM 更新同微任务则浏览器本就不会中间绘制，此处无害；
        // 若跨微任务（异步路由加载）则此处 opacity 已为 0，避免先显示再消失。
        target.style.opacity = '0'
        // 触发重排，确保 opacity:0 已应用于渲染管线
        void target.offsetWidth
        // 添加动画类，0% 关键帧 opacity:0 与 inline 一致，无缝衔接
        target.classList.add('page-enter')
        // 清除 inline opacity，让 animation 接管（结束后恢复默认 opacity:1）
        target.style.opacity = ''
      }

      // 侧边栏淡入动画：仅当侧边栏结构变化时才播放（如跨分组切换）。
      // 同一分组内切换页面时侧边栏链接列表不变，跳过动画避免「抽搐」感。
      // 仅桌面端执行：移动端侧边栏为抽屉式，关闭时不可见，执行动画纯属浪费。
      if (!reduceMotion && window.matchMedia('(min-width: 960px)').matches) {
        const newSidebarFingerprint = getSidebarFingerprint()
        if (newSidebarFingerprint !== oldSidebarFingerprint) {
          const sidebar = document.querySelector('.VPSidebar .nav')
          if (sidebar) {
            sidebar.classList.remove('sidebar-fade-enter')
            void sidebar.offsetWidth
            sidebar.classList.add('sidebar-fade-enter')
          }
        }
      }

      // 搜索框 FLIP 动画已移至 index.ts 的 router.onBeforeRouteChanged/onAfterRouteChanged，
      // 那里能可靠地在路由变化前后分别拿到旧/新 DOM 位置

      // 侧边栏滚动追踪：若当前活动项不在可视区域内，平滑滚动到它
      // 用 requestIdleCallback 延迟到空闲时段执行，避免在移动端低性能机型上
      // 与页面进入动画、DOM 重建抢占主线程导致掉帧。
      // 移动端抽屉关闭时侧边栏不可见，跳过滚动追踪减少 getBoundingClientRect 调用
      if (window.matchMedia('(min-width: 960px)').matches) {
        const scrollSidebarActive = () => {
          const sidebar = document.querySelector('.VPSidebar')
          const activeItem = sidebar?.querySelector('.VPSidebarItem.is-active')
          if (sidebar && activeItem) {
            const sRect = sidebar.getBoundingClientRect()
            const iRect = activeItem.getBoundingClientRect()
            if (iRect.top < sRect.top || iRect.bottom > sRect.bottom) {
              activeItem.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
            }
          }
        }
        if ('requestIdleCallback' in window) {
          requestIdleCallback(scrollSidebarActive, { timeout: 200 })
        } else {
          scrollSidebarActive()
        }
      }
    })
  }
)

/**
 * 检查是否支持视图过渡动画
 * @returns {boolean} 是否支持视图过渡动画
 */
const enableTransitions = () =>
  'startViewTransition' in document &&
  window.matchMedia('(prefers-reduced-motion: no-preference)').matches

/**
 * 提供暗黑模式切换功能
 */
provide('toggle-appearance', async ({ clientX: x, clientY: y }) => {
  // 主题切换期间挂 theme-transitioning class：
  // 1) 禁用所有 CSS transition，避免 VT 结束后元素仍在过渡
  // 2) 为 backdrop-filter 元素提供不透明 fallback（VT 快照无法捕获 backdrop-filter）
  document.documentElement.classList.add('theme-transitioning')

  if (!enableTransitions()) {
    // 不支持 View Transition 时，禁用 transition 后直接切换，避免闪烁
    isDark.value = !isDark.value
    await nextTick()
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('theme-transitioning')
    })
    return
  }

  // 使用 View Transition 默认的 cross-fade 过渡，不使用 clipPath 圆形扩散动画。
  // 原因：clipPath 方案需要 `animation: none` + `opacity:1` 关闭默认动画并手动驱动，
  // 但 `transition.ready` resolve 后到 `element.animate()` 真正应用 clipPath 之间存在
  // 渲染帧间隙，期间 new 伪元素 opacity:1 且无 clipPath 约束会瞬间完全覆盖屏幕，
  // dark→light 时整个界面闪白。cross-fade 的 new 伪元素默认 opacity:0 淡入，无此问题。
  const transition = document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  })

  await transition.finished
  document.documentElement.classList.remove('theme-transitioning')
})
</script>

<template>
  <div class="router-wrapper">
    <!-- 随机角落装饰元素（受特效开关控制） -->
    <CornerStars v-if="effectsActive && randomCorner === 'stars'" />
    <CornerQuotes v-if="effectsActive && randomCorner === 'quotes'" />
    <CornerBubbles v-if="effectsActive && randomCorner === 'bubbles'" />
    <CornerSakura v-if="effectsActive && randomCorner === 'sakura'" />
    <CornerNotes v-if="effectsActive && randomCorner === 'notes'" />
    <CornerLeaves v-if="effectsActive && randomCorner === 'leaves'" />
    <CornerFireflies v-if="effectsActive && randomCorner === 'fireflies'" />
    <CornerSurprise v-if="effectsActive" />
    <CornerClickEffect v-if="effectsActive" />
    <!-- Live2D 看板娘 - 只在首页显示 -->
    <Live2D v-if="isHome" />

    <!-- 404 页面 / 正常页面 -->
    <!-- Layout 常驻挂载，不随路由变化销毁重建，以保持侧边栏滚动位置 -->
    <NotFound v-if="is404" />
    <Layout v-else>
      <!-- 移动端汉堡菜单中的特效开关：置于菜单顶部，作为「外观设置」区，避免被长导航/侧边栏挤到底部 -->
      <template #nav-screen-content-before>
        <div class="VPNavScreenEffects">
          <p class="text">页面特效</p>
          <EffectsToggle />
        </div>
      </template>
    </Layout>

    <!-- 贡献者组件 -->
    <div class="centerdss">
      <div class="content-wrapper">
        <div class="vp-doc">
          <!-- 这里是Markdown内容 -->
        </div>
        <!-- 在内容之后、页脚之前插入贡献者 -->
        <Contributors />
      </div>
    </div>

    <!-- 文档页脚 -->
    <div class="doc-footer">
      <div class="container">
        <div class="doc-footer-content">
          <a href="https://space.bilibili.com/359174372" target="_blank" class="doc-footer-link">© 2020-2026 锐界幻境与贡献者</a>
          <span style="color: var(--vp-c-text-3); margin: 0 6px;">|</span>
          <a :href="soulUrl" class="doc-footer-link" style="color: var(--vp-c-brand); font-weight: 600;" title="狐魇星玖 · 灵魂文档">SOUL</a>
        </div>
        <div class="doc-footer-content">
          <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" style="color: var(--vp-c-text-2); text-decoration: none;">
            苏ICP备2024133820号-1
          </a>
        </div>
        <div class="doc-footer-content" v-if="buildId !== 'dev'" style="margin-top: 4px; font-size: 12px; color: var(--vp-c-text-3);">
          Build #{{ buildId }}
          <template v-if="buildSha"> · {{ buildSha }}</template>
        </div>
      </div>
    </div>

    <!-- 返回顶部按钮：仅移动端文档页显示，阅读进度达 1/3 后出现，外圈进度环实时反映阅读进度 -->
    <button
      v-if="showFloatButtons"
      class="back-to-top"
      :class="{ visible: showBackToTop }"
      :style="{ '--progress': scrollProgress }"
      @click="scrollToTop"
      title="返回顶部"
      aria-label="返回顶部"
    >
      <svg class="btt-arrow" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5l-7 7h4v7h6v-7h4l-7-7z" fill="currentColor"/>
      </svg>
    </button>

    <!-- 图片查看器（全局单例，Teleport 到 body） -->
    <ImageLightbox />
  </div>
</template>

<style>
/* 暗黑模式切换：使用 View Transition 默认 cross-fade，不覆盖伪元素默认动画。
   之前用 animation:none + opacity:1 关闭默认动画再手动 clipPath 驱动，但
   transition.ready resolve 后到 element.animate() 应用 clipPath 之间存在渲染帧间隙，
   期间 new 伪元素 opacity:1 且无 clipPath 会瞬间全屏覆盖，dark→light 时整个界面闪白。 */
/* 主题切换期间禁用所有 CSS transition，防止 View Transition 结束后元素仍在过渡导致闪烁 */
.theme-transitioning *,
.theme-transitioning *::before,
.theme-transitioning *::after {
  transition: none !important;
}

/*
 * View Transition 快照无法捕获 backdrop-filter（它依赖实时背景渲染），
 * 导致导航栏等毛玻璃元素在快照中变成透明，切换到白色主题时透出白色背景造成闪烁。
 * 在 VT 期间用不透明背景色替代 backdrop-filter。
 */
.theme-transitioning .VPNavBar,
.theme-transitioning .VPNavBarSearch,
.theme-transitioning .VPLocalNav,
.theme-transitioning .DocSearch-Button {
  background-color: var(--vp-c-bg) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.theme-transitioning.dark .VPNavBar,
.theme-transitioning.dark .VPNavBarSearch,
.theme-transitioning.dark .VPLocalNav,
.theme-transitioning.dark .DocSearch-Button {
  background-color: var(--vp-c-bg) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}

/* 容器定位 */
.router-wrapper {
  position: relative;
  min-height: 100vh;
}

/* 页面进入动画（通过 .page-enter 类触发，不依赖 :key 重建组件）
   优化：移除 scale 避免缩放渲染导致文字亚像素模糊；纯 opacity 淡入更干净。
   引用全局动画 token --duration-normal / --ease-out-expo，与首屏 appleFadeInUp 视觉节奏一致。
   不使用 forwards —— 结束帧 opacity:1 即默认态，避免残留 fill 状态影响后代 fixed 定位。 */
@keyframes scaleIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.page-enter {
  animation: scaleIn var(--duration-normal) var(--ease-out-expo);
}

/* 侧边栏淡入动画：路由切换时侧边栏内容更新，轻柔淡入 + 微左滑
   translateX(-6px) 减小位移避免水平抖动；起始 opacity 0.5 减小跳变 */
@keyframes sidebarFadeIn {
  from {
    opacity: 0.5;
    transform: translateX(-6px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.sidebar-fade-enter {
  animation: sidebarFadeIn var(--duration-slow) var(--ease-out-expo);
}

/* 文档页脚样式 - 带流光分割线与散落星点装饰 */
.doc-footer {
  position: relative;
  padding: 28px 0 36px;
  /* 底部留出 iPhone Home Indicator 安全区，桌面端 env() 返回 0 不影响 */
  padding-bottom: calc(36px + env(safe-area-inset-bottom));
  margin-top: 10px;
  text-align: center;
  overflow: hidden;
  /* 桌面端有侧边栏时，让页脚顺滑地偏移到文档内容区 */
  transition: padding-left 0.3s ease, padding-right 0.3s ease;
}

/* 顶部装饰线：底层静态渐变分隔 + 上层品牌色光斑来回扫描 */
/* left/right 对齐 content-box（避开 padding 区域），防止延伸到本页目录下方 */
.doc-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: var(--footer-pl, 0px);
  right: var(--footer-pr, 0px);
  height: 1px;
  background:
    /* 上层：30% 宽的流光光斑 */
    linear-gradient(90deg, transparent, var(--vp-c-brand-1), transparent) no-repeat,
    /* 下层：静态渐变分隔线（两端淡出） */
    linear-gradient(90deg, transparent, var(--vp-c-divider) 15%, var(--vp-c-divider) 85%, transparent);
  background-size: 30% 100%, 100% 100%;
  animation: footer-scan 5s ease-in-out infinite;
  transition: left 0.3s ease, right 0.3s ease;
}

@keyframes footer-scan {
  0%   { background-position: -30% 0, 0 0; }
  50%  { background-position: 130% 0, 0 0; }
  100% { background-position: -30% 0, 0 0; }
}

/* 散落星点：用多重 box-shadow 在内容两侧对称分布，整体闪烁 */
.doc-footer::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: transparent;
  /* 星点相对于页脚中心左右散布，避免遮挡居中文字 */
  box-shadow:
    -190px -10px 0 0 var(--vp-c-brand-1),
    -135px   8px 0 0 var(--vp-c-brand-soft),
    -75px   -6px 0 0 var(--vp-c-brand-1),
     85px    9px 0 0 var(--vp-c-brand-soft),
    145px   -7px 0 0 var(--vp-c-brand-1),
    205px    5px 0 0 var(--vp-c-brand-soft);
  animation: footer-twinkle 3.2s ease-in-out infinite;
  pointer-events: none;
  /* 让星点中心跟随侧边栏偏移顺滑滑动（与 .doc-footer 的 padding 过渡同步） */
  transition: left 0.3s ease;
}

@keyframes footer-twinkle {
  0%, 100% { opacity: 0.35; transform: scale(0.85); }
  50%      { opacity: 1;    transform: scale(1.1); }
}

/* 尊重用户的减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .page-enter,
  .sidebar-fade-enter {
    animation: none;
  }

  .doc-footer::before,
  .doc-footer::after {
    animation: none;
  }
}

/* 移动端：页脚星点用固定 px 偏移（-190px ~ 205px），窄屏全部落在视口外属无效渲染
   隐藏 ::after 星点层，保留 ::before 流光线（流光线是 100% 宽的渐变，窄屏仍可见） */
@media (max-width: 767px) {
  .doc-footer::after {
    display: none;
  }
}

.doc-footer-content {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.doc-footer-link {
  margin: 0 8px;
  color: var(--vp-c-brand);
  transition: color 0.25s;
}

.doc-footer-link:hover {
  color: var(--vp-c-brand-dark);
}

/* 返回顶部按钮：玻璃磨砂 + conic-gradient 进度环 + 弹性淡入
   仅移动端文档页显示，桌面端 display:none 强制隐藏 */
.back-to-top {
  position: fixed;
  right: 16px;
  bottom: calc(80px + env(safe-area-inset-bottom));
  width: 48px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  z-index: 100;
  /* 外圈进度环：conic-gradient 由 --progress(0~1) 驱动，已读部分品牌色，未读灰色 */
  background: conic-gradient(
    var(--vp-c-brand-1) calc(var(--progress, 0) * 360deg),
    rgba(128, 128, 128, 0.18) 0
  );
  /* 默认隐藏：opacity + pointer-events，由 .visible 类触发淡入 */
  opacity: 0;
  pointer-events: none;
  transform: translateY(12px) scale(0.8);
  /* opacity 用主缓动，transform 用弹性缓动让出现更生动，box-shadow 用快速缓动 */
  transition:
    opacity var(--duration-slow) var(--ease-out-expo),
    transform 0.4s var(--ease-spring),
    box-shadow var(--duration-slow) var(--ease-out-expo);
  -webkit-tap-highlight-color: transparent;
}

/* 阅读进度达 1/3 后触发可见态 */
.back-to-top.visible {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0) scale(1);
}

/* 内圈：玻璃磨砂背景，挖空进度环中心，承载箭头图标 */
.back-to-top::before {
  content: '';
  position: absolute;
  inset: 3px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

/* 深色模式内圈：半透明深灰玻璃 */
.dark .back-to-top::before {
  background: rgba(28, 28, 30, 0.72);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* 向上箭头图标：品牌色，居中覆盖于内圈之上 */
.back-to-top .btt-arrow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  color: var(--vp-c-brand-1);
  transform: translate(-50%, -50%);
  z-index: 1;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.08));
}

/* 悬浮/点按微交互：光晕扩散 + 箭头上移 */
.back-to-top:hover {
  transform: translateY(-3px) scale(1.06);
  box-shadow: 0 8px 24px rgba(224, 82, 82, 0.35);
}

.back-to-top:hover .btt-arrow {
  transform: translate(-50%, -60%);
}

.back-to-top:active {
  transform: translateY(0) scale(0.94);
  transition-duration: 0.12s;
}

/* 尊重减少动效偏好：关闭弹性动画与位移 */
@media (prefers-reduced-motion: reduce) {
  .back-to-top,
  .back-to-top .btt-arrow {
    transition: opacity 0.2s ease;
  }
  .back-to-top:hover {
    transform: none;
  }
}

/* 桌面端（>=960px）不显示返回顶部按钮 */
@media (min-width: 960px) {
  .back-to-top {
    display: none !important;
  }
}

/* 确保内容区域有正确的边距 */
.content-wrapper {
  max-width: 100%;
}

.vp-doc {
  padding-bottom: 0.2rem;
}
/* 关键修正：让贡献者组件内部内容水平居中 */

.centerdss {
  display: flex;          /* 用Flex布局控制内部元素 */
  flex-direction: column; /* 内部元素垂直排列（标题+用户信息） */
  align-items: center;    /* 核心：让内部所有元素水平居中 */
  width: 100%;            /* 占满父容器宽度（确保是居中的容器） */
  margin: 0 auto;         /* 本身在父容器中水平居中 */
  margin-top: 0;          /* 清除默认上边距 */
  /* 桌面端有侧边栏时，让贡献者顺滑地偏移到文档内容区 */
  transition: padding-left 0.3s ease, padding-right 0.3s ease;
}

/* 贡献者组件的间距控制（覆盖组件内部样式） */
.centerdss .contributors-container {
  margin-top: 8px !important;    /* 缩小与「上一篇/下一篇」之间的间距 */
  margin-bottom: 0 !important;  /* 强制清除组件自带的底部边距 */
  padding-bottom: 0;
}

/*
 * 缩小 VitePress 默认的文档底部留白，避免「上一篇/下一篇」与本页面贡献者之间
 * 出现约 176px 的大空白（默认 .content padding-bottom 128px + 贡献者 margin-top 48px）。
 * 由于下方有 .centerdss（贡献者）和 .doc-footer 接住，不再需要这么大留白。
 * - < 960px: .VPDoc 的 padding-bottom 由 96~128px 缩为 24px
 * - >= 960px: .content 的 padding-bottom 由 128px 缩为 24px
 * 用 !important 覆盖 VitePress scoped 样式（scoped 选择器带属性选择器优先级更高）。
 */
@media (max-width: 959px) {
  .VPDoc {
    padding-bottom: 24px !important;
  }
}

@media (min-width: 960px) {
  .VPDoc .content {
    padding-bottom: 24px !important;
  }
}

/* 移动端菜单中的特效开关项（置于菜单顶部，下方留间距与导航项分隔） */
.VPNavScreenEffects {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  padding: 12px 14px 12px 16px;
  background-color: var(--vp-c-bg-soft);
  margin-bottom: 16px;
}
.VPNavScreenEffects .text {
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}

/*
 * 桌面端存在侧边栏时，让底部贡献者与页脚自动顺滑地偏移到
 * 「侧边栏右侧、且本页目录左侧」的实际文档内容区居中显示。
 *
 * 对齐 VitePress 布局：
 *   sidebar 宽度 = --vp-sidebar-width (272px)
 *   aside（本页目录）宽度 = 256px（VitePress 硬编码 max-width，border-box）
 *   布局最大宽度 = --vp-layout-max-width (1440px)
 *
 * 采用「基础规则 + 叠加覆盖」策略，避免 960-1280px 区间误判
 * （该区间 aside 即使有 has-aside 类也被 display:none 隐藏，不占位）：
 *   ≥960  有 sidebar           → PL=272,      PR=0,    offset=+136
 *   ≥1280 有 sidebar + aside    →             PR=256,  offset=+8   （覆盖 PR/offset）
 *   ≥1440 有 sidebar           → PL=居中+272, PR=居中, offset=+136 （覆盖全部）
 *   ≥1440 有 sidebar + aside    →             PR=居中+256, offset=+8
 *
 * offset = (PL - PR) / 2，把星点中心从「整页 50%」修正到「content-box 50%」。
 * 移动端侧边栏为抽屉式覆盖，不占布局空间，无需偏移。
 * 首页无 .has-sidebar 类，:has() 不匹配，保持全宽居中。
 */

/* 默认：无 sidebar 时无偏移 */
.router-wrapper .doc-footer,
.router-wrapper .centerdss {
  --footer-pl: 0px;
  --footer-pr: 0px;
  --footer-offset: 0px;
}

/* ≥960 有 sidebar：基础偏移（此时 aside 不论是否有类都不占位） */
@media (min-width: 960px) {
  .router-wrapper:has(.VPContent.has-sidebar) .doc-footer,
  .router-wrapper:has(.VPContent.has-sidebar) .centerdss {
    --footer-pl: var(--vp-sidebar-width);
    --footer-pr: 0px;
    --footer-offset: calc(var(--vp-sidebar-width) / 2);
    padding-left: var(--footer-pl);
    padding-right: var(--footer-pr);
  }

  .router-wrapper:has(.VPContent.has-sidebar) .doc-footer::after {
    left: calc(50% + var(--footer-offset));
  }
}

/* ≥1280 有 sidebar + aside：aside 占位，右侧补偿 256px，offset 重算 */
@media (min-width: 1280px) {
  .router-wrapper:has(.VPContent.has-sidebar):has(.VPDoc.has-aside) .doc-footer,
  .router-wrapper:has(.VPContent.has-sidebar):has(.VPDoc.has-aside) .centerdss {
    --footer-pr: 256px;
    --footer-offset: calc((var(--vp-sidebar-width) - 256px) / 2);
  }
}

/* ≥1440 有 sidebar：超宽屏整体居中（覆盖 PL/PR/offset） */
@media (min-width: 1440px) {
  .router-wrapper:has(.VPContent.has-sidebar) .doc-footer,
  .router-wrapper:has(.VPContent.has-sidebar) .centerdss {
    --footer-pl: calc((100vw - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width));
    --footer-pr: calc((100vw - var(--vp-layout-max-width)) / 2);
    --footer-offset: calc(var(--vp-sidebar-width) / 2);
  }

  /* ≥1440 有 aside：PR 在居中基础上再加 256，offset 重算 */
  .router-wrapper:has(.VPContent.has-sidebar):has(.VPDoc.has-aside) .doc-footer,
  .router-wrapper:has(.VPContent.has-sidebar):has(.VPDoc.has-aside) .centerdss {
    --footer-pr: calc((100vw - var(--vp-layout-max-width)) / 2 + 256px);
    --footer-offset: calc((var(--vp-sidebar-width) - 256px) / 2);
  }
}

</style>
