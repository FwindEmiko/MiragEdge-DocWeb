<!-- 页面特殊效果开关：玻璃磨砂 + 极光星辉，置于导航栏右侧 -->
<script setup>
import { ref } from 'vue'
import { useEffectsToggle } from '../../composables/useEffectsToggle'

const { effectsEnabled, toggleEffects } = useEffectsToggle()

// 切换瞬间的星火迸发动画
const bursting = ref(false)
let burstTimer = null
const onClick = () => {
  toggleEffects()
  bursting.value = false
  // 触发重排以重启动画
  requestAnimationFrame(() => {
    bursting.value = true
    clearTimeout(burstTimer)
    burstTimer = setTimeout(() => {
      bursting.value = false
    }, 650)
  })
}
</script>

<template>
  <button
    type="button"
    class="effects-toggle"
    :class="{ 'is-on': effectsEnabled, bursting }"
    role="switch"
    :aria-checked="effectsEnabled ? 'true' : 'false'"
    aria-label="页面特殊效果开关"
    title="页面特殊效果"
    @click="onClick"
  >
    <span class="et-track">
      <span class="et-thumb">
        <svg class="et-spark" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 2c.4 3.6 1.8 5 5.4 5.4-3.6.4-5 1.8-5.4 5.4-.4-3.6-1.8-5-5.4-5.4C10.2 7 11.6 5.6 12 2z"
          />
        </svg>
      </span>
      <span class="et-burst" aria-hidden="true"></span>
    </span>
  </button>
</template>

<!-- 主题相关 CSS 变量（非 scoped，便于根据 .dark 切换） -->
<style>
.effects-toggle {
  --et-track-bg: rgba(0, 0, 0, 0.06);
  --et-track-border: rgba(0, 0, 0, 0.12);
  --et-thumb-bg: radial-gradient(circle at 30% 30%, #ffffff, #d4d4d8 70%, #a1a1aa);
  --et-thumb-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  --et-spark-color: #71717a;
}
.dark .effects-toggle {
  --et-track-bg: rgba(255, 255, 255, 0.06);
  --et-track-border: rgba(255, 255, 255, 0.12);
  --et-thumb-bg: radial-gradient(circle at 30% 30%, #ffffff, #d4d4d8 70%, #71717a);
  --et-thumb-shadow: 0 1px 3px rgba(0, 0, 0, 0.45);
  --et-spark-color: #a1a1aa;
}

/* 防闪烁：SSR 首帧按钮带 is-on（默认 true），但 head 脚本已为关闭/手机端
   设置 html.effects-disabled。此时强制呈现 OFF 外观，待 onMounted 修正 class。
   这样关闭态用户刷新后不会看到按钮先亮后灭。 */
html.effects-disabled .effects-toggle.is-on .et-track {
  background: var(--et-track-bg);
  border-color: var(--et-track-border);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.18);
}

html.effects-disabled .effects-toggle.is-on .et-thumb {
  transform: translateX(0);
  background: var(--et-thumb-bg);
  box-shadow: var(--et-thumb-shadow);
}

html.effects-disabled .effects-toggle.is-on .et-spark {
  fill: var(--et-spark-color);
  animation: none;
}
</style>

<style scoped>
.effects-toggle,
.et-track,
.et-thumb {
  box-sizing: border-box;
}

.effects-toggle {
  display: inline-flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  border-radius: 12px;
  outline: none;
}

.effects-toggle:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
}

.et-track {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 46px;
  height: 22px;
  border-radius: 11px;
  background: var(--et-track-bg);
  border: 1px solid var(--et-track-border);
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.18);
  transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
  overflow: visible;
}

.et-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--et-thumb-bg);
  box-shadow: var(--et-thumb-shadow);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateX(0);
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.35s ease, box-shadow 0.35s ease;
}

.et-spark {
  width: 10px;
  height: 10px;
  fill: var(--et-spark-color);
  transition: fill 0.35s ease;
}

/* ===== 开启态：极光玻璃 + 金色星辉 ===== */
.effects-toggle.is-on .et-track {
  background: linear-gradient(
    120deg,
    rgba(168, 85, 247, 0.42),
    rgba(34, 211, 238, 0.38) 55%,
    rgba(236, 72, 153, 0.42)
  );
  border-color: rgba(168, 85, 247, 0.45);
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.22),
    0 0 10px rgba(168, 85, 247, 0.35), 0 0 18px rgba(34, 211, 238, 0.22);
}

.effects-toggle.is-on .et-thumb {
  transform: translateX(24px);
  background: radial-gradient(circle at 30% 30%, #fff7ed, #fde68a 55%, #f59e0b);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3), 0 0 8px rgba(251, 191, 36, 0.85),
    0 0 14px rgba(168, 85, 247, 0.55);
}

.effects-toggle.is-on .et-spark {
  fill: #b45309;
  animation: et-sparkle-pulse 2.4s ease-in-out infinite;
}

@keyframes et-sparkle-pulse {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 0.95;
  }
  50% {
    transform: scale(1.18) rotate(90deg);
    opacity: 1;
  }
}

/* ===== 悬停增强 ===== */
.effects-toggle:hover .et-track {
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.18), 0 0 8px rgba(168, 85, 247, 0.2);
}
.effects-toggle.is-on:hover .et-track {
  box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.25),
    0 0 14px rgba(168, 85, 247, 0.45), 0 0 24px rgba(34, 211, 238, 0.3);
}
.effects-toggle:active .et-thumb {
  transform: translateX(0) scale(0.92);
}
.effects-toggle.is-on:active .et-thumb {
  transform: translateX(24px) scale(0.92);
}

/* ===== 切换瞬间的星火迸发 ===== */
.et-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(251, 191, 36, 0.9),
    rgba(168, 85, 247, 0.5) 50%,
    transparent 70%
  );
  opacity: 0;
  pointer-events: none;
}

.effects-toggle.bursting .et-burst {
  animation: et-burst 0.65s ease-out;
}

@keyframes et-burst {
  0% {
    opacity: 0;
    transform: scale(0.4);
  }
  35% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
    transform: scale(3.2);
  }
}

/* 减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .et-spark {
    animation: none !important;
  }
  .et-thumb,
  .et-track {
    transition-duration: 0.01s !important;
  }
  .effects-toggle.bursting .et-burst {
    animation: none !important;
  }
}
</style>
