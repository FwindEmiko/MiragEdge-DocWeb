<script setup lang="ts">
/**
 * McItem — 单个 MC 物品槽组件
 *
 * 渲染优先级：
 *   1. texture → 直接加载图片材质（pixelated 渲染）
 *   2. name 首字 → 材质缺失时显示物品名首字符
 *
 * 通过 id 可引用 mc-textures 注册表中的原版物品（581 个，含官方中文名）。
 * 自定义物品直接传入 { name, texture } 即可。
 *
 * tooltip 使用 Teleport 传送到 body，避免被父容器的 backdrop-filter
 * 层叠上下文裁剪或遮挡。
 */
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { resolveMcItem, resolveNameByTexture } from '../../data/mc-textures'

const props = defineProps<{
  /** 物品 id（用于查注册表，如 "wheat"） */
  id?: string
  /** 物品名称（tooltip 显示） */
  name?: string
  /** 材质图片路径 */
  texture?: string
  /** 堆叠数量（>1 时显示角标） */
  count?: number | string
  /** 槽位尺寸: sm | md | lg */
  size?: 'sm' | 'md' | 'lg'
  /** 是否显示 hover tooltip */
  tooltip?: boolean
}>()

const imgError = ref(false)

// 合并注册表数据与显式 props（显式 props 优先）
// 查找优先级：显式 name > id 注册表 > texture 反查注册表
const resolved = computed(() => {
  const regData = props.id ? resolveMcItem(props.id) : null
  const texturePath = props.texture ?? regData?.texture ?? ''
  // 如果没有显式 name，尝试通过 texture 反查注册表中的中文名
  const reverseName = texturePath ? resolveNameByTexture(texturePath) : null
  return {
    name: props.name ?? regData?.name ?? reverseName ?? '',
    texture: texturePath,
  }
})

const showImg = computed(() => resolved.value.texture && !imgError.value)

const showCount = computed(() => {
  const n = Number(props.count)
  return !isNaN(n) && n > 1
})

const fallbackChar = computed(() => {
  const n = resolved.value.name
  return n ? n.charAt(0) : '?'
})

function onImgError() {
  imgError.value = true
}

// ===== Tooltip 位置管理（Teleport 到 body） =====
const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const elRef = ref<HTMLElement | null>(null)

function onMouseEnter() {
  if (!elRef.value || !resolved.value.name) return
  if (props.tooltip === false) return
  const rect = elRef.value.getBoundingClientRect()
  tooltipX.value = rect.left + rect.width / 2
  tooltipY.value = rect.top
  tooltipVisible.value = true
}

function onMouseLeave() {
  tooltipVisible.value = false
}

// 滚动时隐藏 tooltip（避免位置错位）
function onScroll() {
  tooltipVisible.value = false
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true, capture: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll, { capture: true })
  tooltipVisible.value = false
})
</script>

<template>
  <div
    ref="elRef"
    class="mc-item"
    :class="[`mc-item-${size || 'md'}`, { 'has-tooltip': tooltip !== false && resolved.name }]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="mc-item-slot">
      <img
        v-if="showImg"
        :src="resolved.texture"
        :alt="resolved.name"
        class="mc-item-texture"
        loading="lazy"
        draggable="false"
        @error="onImgError"
      />
      <span v-else class="mc-item-fallback">{{ fallbackChar }}</span>

      <span v-if="showCount" class="mc-item-count">{{ count }}</span>
    </div>
  </div>

  <!-- tooltip 通过 Teleport 传送到 body，避免层叠上下文问题 -->
  <ClientOnly>
    <Teleport to="body">
      <div
        v-if="tooltipVisible && resolved.name"
        class="mc-item-tooltip-portal"
        :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
      >
        {{ resolved.name }}
      </div>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.mc-item {
  position: relative;
  display: inline-flex;
  --mc-item-size: 48px;
}

.mc-item-sm { --mc-item-size: 32px; }
.mc-item-md { --mc-item-size: 48px; }
.mc-item-lg { --mc-item-size: 64px; }

.mc-item-slot {
  width: var(--mc-item-size);
  height: var(--mc-item-size);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  /* MC 风格内凹槽 */
  background: rgba(0, 0, 0, 0.25);
  border: 2px solid;
  border-color: rgba(0, 0, 0, 0.5) rgba(255, 255, 255, 0.25) rgba(255, 255, 255, 0.25) rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  transition: background 0.2s ease;
}

.mc-item:hover .mc-item-slot {
  background: rgba(0, 0, 0, 0.15);
}

.mc-item-texture {
  width: 78%;
  height: 78%;
  object-fit: contain;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  -ms-interpolation-mode: nearest-neighbor;
  pointer-events: none;
  user-select: none;
}

.mc-item-fallback {
  font-size: calc(var(--mc-item-size) * 0.4);
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
  user-select: none;
}

.mc-item-count {
  position: absolute;
  right: 2px;
  bottom: 0px;
  font-size: calc(var(--mc-item-size) * 0.32);
  font-weight: 700;
  color: #fff;
  text-shadow: 2px 2px 0 #3f3f3f, -1px -1px 0 #3f3f3f, 1px -1px 0 #3f3f3f, -1px 1px 0 #3f3f3f;
  line-height: 1;
  pointer-events: none;
  user-select: none;
}

/* 暗色模式微调 */
:deep(.dark) .mc-item-slot {
  background: rgba(0, 0, 0, 0.45);
  border-color: rgba(0, 0, 0, 0.6) rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.15) rgba(0, 0, 0, 0.6);
}

:deep(.dark) .mc-item:hover .mc-item-slot {
  background: rgba(0, 0, 0, 0.35);
}
</style>

<!-- tooltip portal 样式（全局，非 scoped，因为被 Teleport 到 body） -->
<style>
.mc-item-tooltip-portal {
  position: fixed;
  transform: translate(-50%, calc(-100% - 8px));
  background: rgba(16, 16, 16, 0.95);
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  padding: 5px 12px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 99999;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* 移动端不显示（hover 不可用） */
@media (hover: none) {
  .mc-item-tooltip-portal {
    display: none;
  }
}
</style>
