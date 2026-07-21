<script setup lang="ts">
/**
 * CraftingTable — MC 3×3 工作台合成表可视化组件
 *
 * 支持两种模式：
 *   1. 有序合成 (shaped)：传入 3×3 grid，物品位置固定
 *   2. 无序合成 (shapeless)：传入 ingredients 数组，物品顺序无关
 *
 * 物品对象格式：{ id?, name?, texture?, count? }
 *   - id  传入时自动查注册表（mc-textures.ts）
 *   - 其余字段可覆盖注册表默认值
 */
import { computed } from 'vue'
import McItem from './McItem.vue'

type ItemData = {
  id?: string
  name?: string
  texture?: string
  count?: number | string
} | null

const props = withDefaults(defineProps<{
  /** 是否为有序合成 */
  shaped?: boolean
  /** 有序合成的 3×3 网格，每个元素为物品对象或 null */
  grid?: ItemData[][]
  /** 无序合成的材料列表 */
  ingredients?: ItemData[]
  /** 合成结果 { id/name/texture/count } */
  result?: ItemData
  /** 是否显示「无序」徽标 */
  showShapelessBadge?: boolean
  /** 槽位尺寸 */
  size?: 'sm' | 'md' | 'lg'
}>(), {
  shaped: false,
  grid: () => [],
  ingredients: () => [],
  result: () => null,
  showShapelessBadge: true,
  size: 'md',
})

/** 将 grid 归一化为 3×3；无序模式时把 ingredients 填入前 N 格 */
const normalizedGrid = computed<ItemData[][]>(() => {
  const g: ItemData[][] = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ]

  if (props.shaped) {
    for (let r = 0; r < 3; r++) {
      const row = props.grid[r] || []
      for (let c = 0; c < 3; c++) {
        g[r][c] = row[c] ?? null
      }
    }
  } else {
    // 无序：按顺序填入
    const list = props.ingredients || []
    let idx = 0
    outer: for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (idx >= list.length) break outer
        g[r][c] = list[idx++] ?? null
      }
    }
  }

  return g
})
</script>

<template>
  <div class="crafting-table" :class="`ct-${size}`">
    <!-- 左侧合成网格 -->
    <div class="ct-grid-wrapper">
      <span
        v-if="!shaped && showShapelessBadge"
        class="ct-badge"
        title="无序合成 — 材料摆放位置不影响结果"
      >无序</span>

      <div class="ct-grid">
        <template v-for="(row, r) in normalizedGrid" :key="r">
          <div
            v-for="(cell, c) in row"
            :key="`${r}-${c}`"
            class="ct-cell"
          >
            <McItem v-if="cell" v-bind="cell" :size="size" />
          </div>
        </template>
      </div>
    </div>

    <!-- 中间箭头 -->
    <div class="ct-arrow" aria-hidden="true">
      <svg viewBox="0 0 32 24" class="ct-arrow-svg">
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

    <!-- 右侧结果 -->
    <div class="ct-result">
      <McItem v-if="result" v-bind="result" :size="size" />
    </div>
  </div>
</template>

<style scoped>
.crafting-table {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  /* 玻璃磨砂面板 */
  background: rgba(120, 120, 130, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  --ct-gap: 4px;
}

.ct-sm { --ct-gap: 3px; --mc-item-size: 32px; }
.ct-md { --ct-gap: 4px; --mc-item-size: 48px; }
.ct-lg { --ct-gap: 6px; --mc-item-size: 64px; }

/* ===== 合成网格 ===== */
.ct-grid-wrapper {
  position: relative;
  display: flex;
}

.ct-grid {
  display: grid;
  grid-template-columns: repeat(3, auto);
  grid-template-rows: repeat(3, auto);
  gap: var(--ct-gap);
  /* 网格底板 */
  padding: 6px;
  background: rgba(0, 0, 0, 0.18);
  border: 2px solid;
  border-color: rgba(0, 0, 0, 0.45) rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.45);
  border-radius: 6px;
  box-shadow: inset 2px 2px 6px rgba(0, 0, 0, 0.3);
}

.ct-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 空槽位仍显示凹槽效果 */
.ct-cell:not(:has(.mc-item)) {
  width: var(--mc-item-size, 48px);
  height: var(--mc-item-size, 48px);
  background: rgba(0, 0, 0, 0.25);
  border: 2px solid;
  border-color: rgba(0, 0, 0, 0.5) rgba(255, 255, 255, 0.18) rgba(255, 255, 255, 0.18) rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  box-shadow: inset 1px 1px 3px rgba(0, 0, 0, 0.3);
}

/* 无序徽标 */
.ct-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--vp-c-brand, #E05252);
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 8px;
  line-height: 1.2;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

/* ===== 箭头 ===== */
.ct-arrow {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.55);
}

.ct-arrow-svg {
  width: 28px;
  height: 22px;
}

.ct-md .ct-arrow-svg { width: 28px; height: 22px; }
.ct-sm .ct-arrow-svg { width: 20px; height: 16px; }
.ct-lg .ct-arrow-svg { width: 36px; height: 28px; }

/* 箭头流光动画（轻量，GPU 加速） */
@keyframes ct-arrow-pulse {
  0%, 100% { opacity: 0.45; }
  50% { opacity: 0.85; }
}

.ct-arrow-svg {
  animation: ct-arrow-pulse 2.4s ease-in-out infinite;
  will-change: opacity;
}

/* ===== 结果槽 ===== */
.ct-result {
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

/* 结果槽高亮微光 */
.ct-result {
  position: relative;
}

.ct-result::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.06), transparent);
  pointer-events: none;
}

/* ===== 暗色模式 ===== */
.dark .crafting-table {
  background: rgba(80, 80, 90, 0.12);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.dark .ct-grid,
.dark .ct-result {
  background: rgba(0, 0, 0, 0.35);
  border-color: rgba(0, 0, 0, 0.6) rgba(255, 255, 255, 0.1) rgba(255, 255, 255, 0.1) rgba(0, 0, 0, 0.6);
}

.dark .ct-cell:not(:has(.mc-item)) {
  background: rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 0, 0, 0.6) rgba(255, 255, 255, 0.08) rgba(255, 255, 255, 0.08) rgba(0, 0, 0, 0.6);
}

.dark .ct-arrow {
  color: rgba(255, 255, 255, 0.4);
}

/* ===== 移动端响应式 ===== */
@media (max-width: 480px) {
  .crafting-table {
    gap: 8px;
    padding: 10px 12px;
    max-width: 100%;
    overflow-x: auto;
  }

  .ct-sm .ct-arrow-svg,
  .ct-md .ct-arrow-svg,
  .ct-lg .ct-arrow-svg {
    width: 18px;
    height: 14px;
  }
}

/* 尊重减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
  .ct-arrow-svg {
    animation: none;
  }
}
</style>
