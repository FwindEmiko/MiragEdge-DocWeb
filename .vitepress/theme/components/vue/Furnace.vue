<script setup lang="ts">
/**
 * Furnace — MC 熔炉烧炼可视化组件
 *
 * 布局复刻原版熔炉 GUI：
 *   ┌─────────┐
 *   │ 输入槽   │ →  输出槽
 *   │ 🔥 火焰  │
 *   └─────────┘
 *
 * 火焰使用 CSS 动画模拟燃烧跳动（GPU 加速 transform）。
 */
import McItem from './McItem.vue'

type ItemData = {
  id?: string
  name?: string
  texture?: string
  count?: number | string
} | null

const props = withDefaults(defineProps<{
  /** 输入物品 */
  input?: ItemData
  /** 烧炼结果 */
  result?: ItemData
  /** 燃料物品（默认煤炭） */
  fuel?: ItemData
  /** 槽位尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否启用火焰动画 */
  animated?: boolean
}>(), {
  input: () => null,
  result: () => null,
  fuel: () => null,
  size: 'md',
  animated: true,
})
</script>

<template>
  <div class="furnace" :class="`fn-${size}`">
    <!-- 左侧：输入 + 火焰 -->
    <div class="fn-left">
      <div class="fn-input">
        <McItem v-if="input" v-bind="input" :size="size" />
      </div>

      <div class="fn-flame-area" :class="{ animated }">
        <!-- 火焰外层（裁剪容器） -->
        <div class="fn-flame-clip">
          <div class="fn-flame">
            <div class="fn-flame-core"></div>
            <div class="fn-flame-inner"></div>
            <div class="fn-flame-spark fn-flame-spark-1"></div>
            <div class="fn-flame-spark fn-flame-spark-2"></div>
          </div>
        </div>
        <!-- 燃料槽覆盖在火焰上方 -->
        <div class="fn-fuel">
          <McItem v-if="fuel" v-bind="fuel" :size="size" />
        </div>
      </div>
    </div>

    <!-- 中间箭头 -->
    <div class="fn-arrow" aria-hidden="true">
      <svg viewBox="0 0 32 24" class="fn-arrow-svg">
        <path
          d="M2 12 H26 M20 5 L27 12 L20 19"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- 右侧：输出槽 -->
    <div class="fn-result">
      <McItem v-if="result" v-bind="result" :size="size" />
    </div>
  </div>
</template>

<style scoped>
.furnace {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  /* 玻璃磨砂面板 — 偏暖石质感 */
  background: linear-gradient(135deg, rgba(100, 80, 70, 0.18), rgba(60, 50, 50, 0.15));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* ===== 左侧区域 ===== */
.fn-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.fn-input,
.fn-result {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: rgba(0, 0, 0, 0.18);
  border: 2px solid;
  border-color: rgba(0, 0, 0, 0.45) rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.45);
  border-radius: 6px;
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.3);
}

/* ===== 火焰区域 ===== */
.fn-flame-area {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 12px;
}

.fn-flame-clip {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 24px;
  overflow: hidden;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.fn-flame-area.animated .fn-flame-clip {
  opacity: 1;
}

.fn-flame {
  position: relative;
  width: 100%;
  height: 100%;
  animation: fn-flicker 1.6s ease-in-out infinite;
  transform-origin: bottom center;
}

.fn-flame-core {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: 14px;
  height: 18px;
  background: radial-gradient(ellipse at bottom, #ff8800 0%, #ff5500 50%, transparent 90%);
  border-radius: 50% 50% 40% 40%;
  filter: blur(1px);
}

.fn-flame-inner {
  position: absolute;
  left: 50%;
  bottom: 2px;
  transform: translateX(-50%);
  width: 8px;
  height: 12px;
  background: radial-gradient(ellipse at bottom, #ffdd00 0%, #ff9900 60%, transparent 100%);
  border-radius: 50% 50% 40% 40%;
}

.fn-flame-spark {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #ffcc00;
  border-radius: 50%;
  opacity: 0;
}

.fn-flame-spark-1 {
  left: 30%;
  bottom: 14px;
  animation: fn-spark 1.8s ease-out infinite;
  animation-delay: 0.2s;
}

.fn-flame-spark-2 {
  right: 30%;
  bottom: 14px;
  animation: fn-spark 1.8s ease-out infinite;
  animation-delay: 0.9s;
}

@keyframes fn-flicker {
  0%, 100% { transform: scaleY(1) scaleX(1); }
  25%      { transform: scaleY(1.08) scaleX(0.94); }
  50%      { transform: scaleY(0.95) scaleX(1.05); }
  75%      { transform: scaleY(1.04) scaleX(0.97); }
}

@keyframes fn-spark {
  0%   { opacity: 0; transform: translateY(0) scale(1); }
  30%  { opacity: 1; }
  100% { opacity: 0; transform: translateY(-12px) scale(0.3); }
}

/* 燃料槽 */
.fn-fuel {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  background: rgba(0, 0, 0, 0.18);
  border: 2px solid;
  border-color: rgba(0, 0, 0, 0.45) rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.45);
  border-radius: 6px;
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.3);
}

/* ===== 箭头 ===== */
.fn-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.55);
}

.fn-arrow-svg {
  width: 28px;
  height: 22px;
}

.fn-sm .fn-arrow-svg { width: 20px; height: 16px; }
.fn-md .fn-arrow-svg { width: 28px; height: 22px; }
.fn-lg .fn-arrow-svg { width: 36px; height: 28px; }

@keyframes fn-arrow-pulse {
  0%, 100% { opacity: 0.45; }
  50%      { opacity: 0.85; }
}

.fn-arrow-svg {
  animation: fn-arrow-pulse 2.4s ease-in-out infinite;
  will-change: opacity;
}

/* ===== 输出槽 ===== */
.fn-result {
  position: relative;
}

.fn-result::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 200, 100, 0.08), transparent);
  pointer-events: none;
}

/* ===== 暗色模式 ===== */
.dark .furnace {
  background: linear-gradient(135deg, rgba(80, 60, 55, 0.14), rgba(40, 35, 35, 0.12));
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .fn-input,
.dark .fn-fuel,
.dark .fn-result {
  background: rgba(0, 0, 0, 0.35);
  border-color: rgba(0, 0, 0, 0.6) rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.1) rgba(0, 0, 0, 0.6);
}

.dark .fn-arrow {
  color: rgba(255, 255, 255, 0.4);
}

/* ===== 移动端 ===== */
@media (max-width: 480px) {
  .furnace {
    gap: 8px;
    padding: 10px 12px;
  }

  .fn-sm .fn-arrow-svg,
  .fn-md .fn-arrow-svg,
  .fn-lg .fn-arrow-svg {
    width: 18px;
    height: 14px;
  }
}

/* 尊重减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .fn-flame,
  .fn-arrow-svg,
  .fn-flame-spark-1,
  .fn-flame-spark-2 {
    animation: none;
  }

  .fn-flame-area.animated .fn-flame-clip {
    opacity: 0.6;
  }
}
</style>
