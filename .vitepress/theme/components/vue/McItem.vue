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
 */
import { computed, ref } from 'vue'
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
</script>

<template>
  <div
    class="mc-item"
    :class="[`mc-item-${size || 'md'}`, { 'has-tooltip': tooltip !== false && resolved.name }]"
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

    <div v-if="tooltip !== false && resolved.name" class="mc-item-tooltip">
      {{ resolved.name }}
    </div>
  </div>
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

/* tooltip */
.mc-item-tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(16, 16, 16, 0.95);
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  padding: 4px 10px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 9999;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.mc-item.has-tooltip:hover .mc-item-tooltip {
  opacity: 1;
}

/* 悬停时提升整个 mc-item 的层叠优先级 */
.mc-item.has-tooltip:hover {
  z-index: 999;
}

/* 暗色模式微调 */
:deep(.dark) .mc-item-slot {
  background: rgba(0, 0, 0, 0.45);
  border-color: rgba(0, 0, 0, 0.6) rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.15) rgba(0, 0, 0, 0.6);
}

:deep(.dark) .mc-item:hover .mc-item-slot {
  background: rgba(0, 0, 0, 0.35);
}

/* 移动端 tooltip 不显示（hover 不可用） */
@media (hover: none) {
  .mc-item-tooltip {
    display: none;
  }
}
</style>
