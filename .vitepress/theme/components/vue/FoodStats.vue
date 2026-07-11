<script setup lang="ts">
/**
 * FoodStats — MC 食物属性可视化组件
 *
 * 以 MC 原版风格展示食物的饥饿值和饱和度。
 * 饥饿值用鸡腿图标 + 数字，饱和度用金色护盾图标 + 数字。
 */
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  /** 饥饿值（0-20） */
  hunger?: number
  /** 饱和度（0-20） */
  saturation?: number
  /** 显示尺寸 */
  size?: 'sm' | 'md'
}>(), {
  hunger: 0,
  saturation: 0,
  size: 'md',
})

/** 饥饿值鸡腿图标数量（每个图标=2点，最多10个） */
const hungerIcons = computed(() => {
  const count = Math.ceil(props.hunger / 2)
  return Math.min(count, 10)
})

/** 半个鸡腿（奇数饥饿值时最后一个显示半截） */
const hasHalfDrumstick = computed(() => props.hunger % 2 !== 0)

/** 饱和度条宽度百分比 */
const saturationPercent = computed(() => {
  return Math.min((props.saturation / 20) * 100, 100)
})
</script>

<template>
  <div class="food-stats" :class="`fs-${size}`">
    <!-- 饥饿值 -->
    <div class="fs-hunger" :title="`饥饿值: ${hunger}`">
      <span class="fs-label">饥饿值</span>
      <div class="fs-drumsticks">
        <svg
          v-for="i in hungerIcons - (hasHalfDrumstick ? 1 : 0)"
          :key="`full-${i}`"
          class="fs-drumstick full"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path d="M3.5 12.5c-.8.8-.8 2 0 2.8s2 .8 2.8 0c.5-.5.8-1.2.8-1.8l3.2-3.2c.6.2 1.3.1 1.8-.4l1.4-1.4c1.6-1.6 1.6-4.1 0-5.7s-4.1-1.6-5.7 0L6.4 4.2c-.5.5-.6 1.2-.4 1.8L2.8 9.2c-.6 0-1.3.3-1.8.8z" fill="#8B5E3C" stroke="#5C3A1E" stroke-width="0.5"/>
          <path d="M3.5 12.5c-.8.8-.8 2 0 2.8.4.4.9.6 1.4.6.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4l.8-.8-2.8-2.8-.8.8c-.2 0-.4.1-.6.3z" fill="#D4A574" opacity="0.6"/>
        </svg>
        <svg
          v-if="hasHalfDrumstick"
          class="fs-drumstick half"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <defs>
            <clipPath id="half-clip">
              <rect x="0" y="0" width="8" height="16"/>
            </clipPath>
          </defs>
          <path d="M3.5 12.5c-.8.8-.8 2 0 2.8s2 .8 2.8 0c.5-.5.8-1.2.8-1.8l3.2-3.2c.6.2 1.3.1 1.8-.4l1.4-1.4c1.6-1.6 1.6-4.1 0-5.7s-4.1-1.6-5.7 0L6.4 4.2c-.5.5-.6 1.2-.4 1.8L2.8 9.2c-.6 0-1.3.3-1.8.8z" fill="#8B5E3C" stroke="#5C3A1E" stroke-width="0.5" clip-path="url(#half-clip)"/>
          <path d="M0 0 L16 0 L16 16 Z" fill="rgba(0,0,0,0.35)"/>
        </svg>
      </div>
      <span class="fs-value">{{ hunger }}</span>
    </div>

    <!-- 饱和度 -->
    <div class="fs-saturation" :title="`饱和度: ${saturation}`">
      <span class="fs-label">饱和度</span>
      <div class="fs-sat-bar">
        <div class="fs-sat-fill" :style="{ width: saturationPercent + '%' }"></div>
        <div class="fs-sat-ticks">
          <span v-for="i in 10" :key="i" class="fs-sat-tick"></span>
        </div>
      </div>
      <span class="fs-value">{{ saturation.toFixed(1) }}</span>
    </div>
  </div>
</template>

<style scoped>
.food-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  align-items: center;
}

.fs-hunger,
.fs-saturation {
  display: flex;
  align-items: center;
  gap: 6px;
}

.fs-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2, rgba(255,255,255,0.6));
  white-space: nowrap;
}

/* ===== 鸡腿图标 ===== */
.fs-drumsticks {
  display: flex;
  gap: 1px;
}

.fs-drumstick {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  filter: drop-shadow(1px 1px 0 rgba(0,0,0,0.4));
}

.fs-sm .fs-drumstick {
  width: 11px;
  height: 11px;
}

.fs-drumstick.half {
  opacity: 0.85;
}

/* ===== 饱和度条 ===== */
.fs-sat-bar {
  position: relative;
  width: 80px;
  height: 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid;
  border-color: rgba(0, 0, 0, 0.4) rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.15) rgba(0, 0, 0, 0.4);
  border-radius: 2px;
  overflow: hidden;
  box-shadow: inset 1px 1px 2px rgba(0, 0, 0, 0.4);
}

.fs-sm .fs-sat-bar {
  width: 60px;
  height: 10px;
}

.fs-sat-fill {
  height: 100%;
  background: linear-gradient(to bottom, #FFD700 0%, #FFA500 40%, #D4880A 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: width 0.3s ease;
}

.fs-sat-ticks {
  position: absolute;
  inset: 0;
  display: flex;
  pointer-events: none;
}

.fs-sat-tick {
  flex: 1;
  border-right: 1px solid rgba(0, 0, 0, 0.2);
}

.fs-sat-tick:last-child {
  border-right: none;
}

/* ===== 数值 ===== */
.fs-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1, #fff);
  font-variant-numeric: tabular-nums;
  min-width: 24px;
}

.fs-sm .fs-value {
  font-size: 12px;
  min-width: 20px;
}

/* ===== 移动端 ===== */
@media (max-width: 480px) {
  .food-stats {
    gap: 8px 12px;
  }

  .fs-sm .fs-sat-bar {
    width: 50px;
  }
}
</style>
