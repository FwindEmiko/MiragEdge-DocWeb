<!-- 自定义布局组件，包含路由过渡动画和浮动按钮 -->

<script setup>
import { useRouter, useData } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { ref, watch, nextTick, provide, computed } from "vue";
import Contributors from './Contributors.vue';
import NotFound from './NotFound.vue';
import CornerStars from './CornerStars.vue';
import CornerQuotes from './CornerQuotes.vue';
import CornerBubbles from './CornerBubbles.vue';
import CornerSakura from './CornerSakura.vue';
import CornerNotes from './CornerNotes.vue';
import CornerLeaves from './CornerLeaves.vue';
import CornerSurprise from './CornerSurprise.vue';
import CornerFireflies from './CornerFireflies.vue';
import CornerClickEffect from './CornerClickEffect.vue';
import Live2D from './Live2D.vue';

const { Layout } = DefaultTheme;
const { route } = useRouter();
const { isDark, page } = useData();
const transitionName = ref('scale-in');

// 检测是否为 404 页面
const is404 = computed(() => page.value.isNotFound);

// 检测是否为首页
const isHome = computed(() => route.path === '/' || route.path === '/index.html');

// 随机角落装饰 - 每次路由变化时重新计算
const randomCorner = ref(null)

watch(() => route.path, () => {
  // 30% 概率显示装饰
  if (Math.random() <= 0.3) {
    const components = ['stars', 'quotes', 'bubbles', 'sakura', 'notes', 'leaves', 'fireflies'];
    randomCorner.value = components[Math.floor(Math.random() * components.length)];
  } else {
    randomCorner.value = null;
  }
}, { immediate: true })

/**
 * 滚动到页面顶部
 */
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

/**
 * 监听路由变化，设置过渡动画名称
 */
watch(
  route,
  (newRoute, oldRoute) => {
    const newIndex = newRoute.path.split('/').length
    const oldIndex = oldRoute.path.split('/').length
    transitionName.value = newIndex > oldIndex ? 'scale-in' : 'scale-out'
  }
);

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
  if (!enableTransitions()) {
    isDark.value = !isDark.value
    return
  }

  const clipPath = [
    `circle(0px at ${x}px ${y}px)`,
    `circle(${Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    )}px at ${x}px ${y}px)`
  ]

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).ready

  document.documentElement.animate(
    { clipPath: isDark.value ? clipPath.reverse() : clipPath },
    {
      duration: 300,
      easing: 'ease-in',
      pseudoElement: `::view-transition-${isDark.value ? 'old' : 'new'}(root)`
    }
  )
})
</script>

<template>
  <div class="router-wrapper">
    <!-- 随机角落装饰元素 -->
    <CornerStars v-if="randomCorner === 'stars'" />
    <CornerQuotes v-if="randomCorner === 'quotes'" />
    <CornerBubbles v-if="randomCorner === 'bubbles'" />
    <CornerSakura v-if="randomCorner === 'sakura'" />
    <CornerNotes v-if="randomCorner === 'notes'" />
    <CornerLeaves v-if="randomCorner === 'leaves'" />
    <CornerFireflies v-if="randomCorner === 'fireflies'" />
    <CornerSurprise />
    <CornerClickEffect />
    <!-- Live2D 看板娘 - 只在首页显示 -->
    <Live2D v-if="isHome" />

    <!-- 页面过渡动画 -->
    <transition
      :name="transitionName"
      mode="out-in"
    >
      <div :key="route.path">
        <!-- 404 页面 -->
        <NotFound v-if="is404" />
        <!-- 正常页面 -->
        <Layout v-else />

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
        <div class="doc-footer" v-if="route.path.includes('/')">
          <div class="container">
            <div class="doc-footer-content">
              <a href="https://space.bilibili.com/359174372" target="_blank" class="doc-footer-link">© 2020-2026 锐界幻境与贡献者</a>
            </div>  
            <div class="doc-footer-content">
              <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" style="color: var(--vp-c-text-2); text-decoration: none;">
                苏ICP备2024133820号-1
              </a>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 悬浮按钮区域 -->
    <div class="float-buttons" v-if="route.path.includes('/docs/')">
      <button class="float-button" @click="scrollToTop" title="返回顶部">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-up"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
      </button>
      <a class="float-button" href="https://github.com/fwindemiko/MiragEdge-DocWeb/issues/new?template=issue_template.yml" target="_blank" title="反馈问题">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-message-circle"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      </a>
    </div>
  </div>
</template>

<style>
/* 暗黑模式切换相关样式 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}

::view-transition-old(root),
.dark::view-transition-new(root) {
  z-index: 1;
}

::view-transition-new(root),
.dark::view-transition-old(root) {
  z-index: 2;
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

/* 页面进入动画 */
@keyframes scaleIn {
  0% {
    transform: scale(0.98);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 页面离开动画 */
@keyframes fadeOut {
  0% { opacity: 1; }
  100% { opacity: 0; }
}

/* 文档页脚样式 */
.doc-footer {
  padding: 24px 0;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 10px;
  text-align: center;
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

/* 悬浮按钮样式 */
.float-buttons {
  position: fixed;
  right: 20px;
  bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 100;
}

.float-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 44px;
  height: 44px;
  background-color: var(--vp-c-brand);
  color: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  outline: none;
  padding: 0;
}

.float-button:hover {
  background-color: var(--vp-c-brand-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
}

/* 清除贡献者组件的底部间距（覆盖组件内部样式） */
.centerdss .Contributors {
  margin-bottom: 0 !important; /* 强制清除组件自带的底部边距 */
  padding-bottom: 0;
}

</style>