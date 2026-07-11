<script setup lang="ts">
/**
 * FoodEntry — 食物卡片组件
 *
 * 将食物名称、品质徽标、配方、属性、效果、描述整合为统一卡片布局。
 * 默认插槽用于放置 CraftingTable / Furnace 配方组件。
 *
 * 品质系统（彩色徽标，不使用 ⭐）：
 *   common    → 普通（灰色）
 *   fine      → 精良（绿色）
 *   rare      → 稀有（蓝色）
 *   legendary → 传说（金色）
 */
import { computed } from 'vue'
import FoodStats from './FoodStats.vue'

const props = withDefaults(defineProps<{
  /** 食物名称 */
  name: string
  /** 品质: common | fine | rare | legendary */
  quality?: 'common' | 'fine' | 'rare' | 'legendary'
  /** 饥饿值 */
  hunger?: number
  /** 饱和度 */
  saturation?: number
  /** 食用效果描述 */
  effect?: string
  /** 风味描述/引言 */
  quote?: string
  /** 警告文本（如饮酒警告） */
  warning?: string
}>(), {
  quality: 'common',
  hunger: 0,
  saturation: 0,
  effect: '',
  quote: '',
  warning: '',
})

const qualityConfig: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  common:    { label: '普通', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.12)', border: 'rgba(156, 163, 175, 0.3)', glow: 'rgba(156, 163, 175, 0.08)' },
  fine:      { label: '精良', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)',  border: 'rgba(34, 197, 94, 0.3)',  glow: 'rgba(34, 197, 94, 0.08)' },
  rare:      { label: '稀有', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)', glow: 'rgba(59, 130, 246, 0.1)' },
  legendary: { label: '传说', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', glow: 'rgba(245, 158, 11, 0.12)' },
}

const qConfig = computed(() => qualityConfig[props.quality] || qualityConfig.common)
const cardStyle = computed(() => ({
  '--qe-color': qConfig.value.color,
  '--qe-bg': qConfig.value.bg,
  '--qe-border': qConfig.value.border,
  '--qe-glow': qConfig.value.glow,
}))
</script>

<template>
  <div class="food-entry" :style="cardStyle" :data-quality="quality">
    <!-- 卡片头部：名称 + 品质徽标 -->
    <div class="fe-header">
      <h4 class="fe-name" :style="{ color: qConfig.color }">{{ name }}</h4>
      <span class="fe-badge" :style="{ color: qConfig.color, background: qConfig.bg, borderColor: qConfig.border }">
        {{ qConfig.label }}
      </span>
    </div>

    <!-- 卡片主体 -->
    <div class="fe-body">
      <!-- 配方（插槽） -->
      <div class="fe-recipe">
        <slot />
      </div>

      <!-- 属性 + 效果 -->
      <div class="fe-info">
        <FoodStats :hunger="hunger" :saturation="saturation" size="sm" />

        <div v-if="effect" class="fe-effect">
          <span class="fe-effect-label">效果</span>
          <span class="fe-effect-text">{{ effect }}</span>
        </div>

        <div v-if="warning" class="fe-warning">
          {{ warning }}
        </div>
      </div>
    </div>

    <!-- 风味描述 -->
    <div v-if="quote" class="fe-quote">
      {{ quote }}
    </div>
  </div>
</template>

<style scoped>
.food-entry {
  margin: 16px 0;
  border-radius: 10px;
  border: 1px solid var(--qe-border, rgba(255,255,255,0.1));
  background: linear-gradient(135deg, var(--qe-glow, transparent), transparent 60%);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.food-entry:hover {
  border-color: var(--qe-color, rgba(255,255,255,0.2));
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 0 0 1px var(--qe-glow, transparent);
}

/* ===== 头部 ===== */
.fe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--qe-border, rgba(255,255,255,0.06));
  background: var(--qe-bg, transparent);
}

.fe-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  flex: 1;
}

.fe-badge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 20px;
  border: 1px solid;
  letter-spacing: 1px;
  white-space: nowrap;
}

/* ===== 主体 ===== */
.fe-body {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 14px;
  align-items: flex-start;
}

.fe-recipe {
  flex: 0 0 auto;
}

.fe-info {
  flex: 1 1 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.fe-effect {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  font-size: 13px;
  line-height: 1.6;
}

.fe-effect-label {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-text-2, rgba(255,255,255,0.5));
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 6px;
  border-radius: 3px;
  margin-top: 1px;
}

.fe-effect-text {
  color: var(--vp-c-text-1, rgba(255,255,255,0.9));
}

.fe-warning {
  font-size: 12px;
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 4px;
  padding: 4px 8px;
  line-height: 1.5;
}

/* ===== 引言 ===== */
.fe-quote {
  padding: 8px 14px 12px;
  font-size: 13px;
  color: var(--vp-c-text-2, rgba(255,255,255,0.5));
  font-style: italic;
  line-height: 1.6;
  border-top: 1px dashed rgba(255, 255, 255, 0.06);
}

.fe-quote::before {
  content: '"';
  margin-right: 2px;
  opacity: 0.5;
}

.fe-quote::after {
  content: '"';
  margin-left: 2px;
  opacity: 0.5;
}

/* ===== 传说品质特殊光效 ===== */
.food-entry[data-quality="legendary"] {
  position: relative;
}

.food-entry[data-quality="legendary"]::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, transparent 40%, rgba(245, 158, 11, 0.04) 50%, transparent 60%);
  pointer-events: none;
  animation: fe-shimmer 4s ease-in-out infinite;
}

@keyframes fe-shimmer {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

/* ===== 移动端 ===== */
@media (max-width: 640px) {
  .fe-body {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }

  .fe-recipe {
    width: 100%;
  }

  .fe-info {
    flex: 1 1 100%;
    width: 100%;
  }

  .fe-header {
    padding: 8px 12px;
  }

  .fe-name {
    font-size: 15px;
  }

  .fe-quote {
    padding: 6px 12px 10px;
    font-size: 12px;
  }
}

/* 尊重减少动效 */
@media (prefers-reduced-motion: reduce) {
  .food-entry[data-quality="legendary"]::before {
    animation: none;
    opacity: 0.5;
  }
  .food-entry {
    transition: none;
  }
}
</style>
