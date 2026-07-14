<!-- 合并的外观控制组：主题切换 + 页面特效开关 -->
<!-- 响应式：>=1280px 内联；768-1279px 折叠为「...」悬浮菜单；<768px 进入移动端菜单 -->
<!-- 接管 VitePress 默认的 VPNavBarAppearance / VPNavBarExtra / VPNavScreenAppearance -->
<script setup>
import { inject, computed } from 'vue'
import { useData } from 'vitepress'
import EffectsToggle from './EffectsToggle.vue'

defineProps({
  // 'bar' = 桌面导航栏插槽；'screen' = 移动端菜单插槽
  variant: { type: String, default: 'bar' }
})

const { isDark, theme } = useData()
// 复用 layout.vue 提供的 toggle-appearance（含 View Transition 动画）
const toggleAppearance = inject('toggle-appearance', () => {
  isDark.value = !isDark.value
})

const themeTitle = computed(() =>
  isDark.value
    ? theme.value.lightModeSwitchTitle || 'Switch to light theme'
    : theme.value.darkModeSwitchTitle || 'Switch to dark theme'
)
const themeLabel = computed(() => theme.value.darkModeSwitchLabel || '外观')
</script>

<template>
  <!-- ===== 桌面导航栏 ===== -->
  <div v-if="variant === 'bar'" class="ag-bar">
    <!-- >=1280px：内联合并控件 -->
    <div class="ag-inline">
      <button
        type="button"
        class="ag-theme-btn"
        :title="themeTitle"
        :aria-label="themeTitle"
        @click="toggleAppearance"
      >
        <span class="vpi-sun"></span>
        <span class="vpi-moon"></span>
      </button>
      <span class="ag-divider" aria-hidden="true"></span>
      <EffectsToggle />
    </div>

    <!-- 768-1279px：折叠为「...」悬浮菜单 -->
    <div class="ag-overflow">
      <button
        type="button"
        class="ag-more-btn"
        aria-label="外观与特效"
        title="外观与特效"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      </button>
      <div class="ag-popover">
        <div class="ag-row">
          <span class="ag-row-label">{{ themeLabel }}</span>
          <button
            type="button"
            class="ag-theme-btn"
            :title="themeTitle"
            :aria-label="themeTitle"
            @click="toggleAppearance"
          >
            <span class="vpi-sun"></span>
            <span class="vpi-moon"></span>
          </button>
        </div>
        <div class="ag-row">
          <span class="ag-row-label">页面特效</span>
          <EffectsToggle />
        </div>
      </div>
    </div>
  </div>

  <!-- ===== 移动端菜单（<768px）===== -->
  <div v-else class="ag-screen">
    <div class="ag-screen-row">
      <span class="ag-screen-label">{{ themeLabel }}</span>
      <button
        type="button"
        class="ag-theme-btn"
        :title="themeTitle"
        :aria-label="themeTitle"
        @click="toggleAppearance"
      >
        <span class="vpi-sun"></span>
        <span class="vpi-moon"></span>
      </button>
    </div>
    <div class="ag-screen-row">
      <span class="ag-screen-label">页面特效</span>
      <EffectsToggle />
    </div>
  </div>
</template>

<style scoped>
.ag-bar,
.ag-inline,
.ag-overflow,
.ag-theme-btn,
.ag-row,
.ag-screen-row {
  box-sizing: border-box;
}

/* ===== 主题按钮：玻璃磨砂 + 日月交叉淡入 ===== */
.ag-theme-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 9px;
  border: 1px solid var(--vp-c-divider);
  background: var(--et-tbtn-bg, rgba(0, 0, 0, 0.04));
  color: var(--vp-c-text-2);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.25s ease, border-color 0.25s ease,
    box-shadow 0.25s ease, color 0.25s ease;
}

:global(.dark) .ag-theme-btn {
  background: rgba(255, 255, 255, 0.06);
}

.ag-theme-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.12);
}

.ag-theme-btn:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.ag-theme-btn .vpi-sun,
.ag-theme-btn .vpi-moon {
  position: absolute;
  font-size: 16px;
  line-height: 1;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.ag-theme-btn .vpi-sun {
  opacity: 1;
  transform: rotate(0deg);
}

.ag-theme-btn .vpi-moon {
  opacity: 0;
  transform: rotate(-90deg);
}

:global(.dark) .ag-theme-btn .vpi-sun {
  opacity: 0;
  transform: rotate(90deg);
}

:global(.dark) .ag-theme-btn .vpi-moon {
  opacity: 1;
  transform: rotate(0deg);
}

/* ===== 桌面栏布局 ===== */
.ag-bar {
  display: flex;
  align-items: center;
  margin: 0 6px;
}

.ag-inline {
  display: none;
  align-items: center;
  gap: 2px;
}

.ag-overflow {
  display: none;
  position: relative;
}

.ag-divider {
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: var(--vp-c-divider);
  opacity: 0.7;
}

/* >=1280px：内联 */
@media (min-width: 1280px) {
  .ag-inline {
    display: flex;
  }
}

/* 768-1279px：折叠为「...」 */
@media (min-width: 768px) and (max-width: 1279px) {
  .ag-overflow {
    display: flex;
    align-items: center;
  }
}

/* <768px：整个桌面栏组隐藏，改由移动端菜单显示 */
@media (max-width: 767px) {
  .ag-bar {
    display: none;
  }
}

/* =====「...」按钮 ===== */
.ag-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border-radius: 9px;
  border: 1px solid var(--vp-c-divider);
  background: rgba(0, 0, 0, 0.04);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease;
}

:global(.dark) .ag-more-btn {
  background: rgba(255, 255, 255, 0.06);
}

.ag-more-btn:hover,
.ag-overflow:hover .ag-more-btn,
.ag-overflow:focus-within .ag-more-btn {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* ===== 悬浮弹出层 ===== */
.ag-popover {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  min-width: 210px;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.14);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px) scale(0.98);
  transform-origin: top right;
  transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s ease;
  z-index: 60;
}

:global(.dark) .ag-popover {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.5);
}

.ag-overflow:hover .ag-popover,
.ag-overflow:focus-within .ag-popover {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.ag-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 10px;
  border-radius: 8px;
}

.ag-row:hover {
  background: var(--vp-c-bg-soft);
}

.ag-row-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}

/* ===== 移动端菜单行 ===== */
.ag-screen {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}

.ag-screen-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-radius: 8px;
  padding: 12px 14px 12px 16px;
  background-color: var(--vp-c-bg-soft);
}

.ag-screen-label {
  line-height: 24px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
</style>
