<script setup lang="ts">
/**
 * QQGroupCard — QQ 群组卡片组件
 *
 * 以卡片形式展示 QQ 群信息，包含群名称、描述、标签和加入按钮。
 * 设计风格：玻璃磨砂 + 深色基调，与 MiragEdge 文档站统一。
 * 移动端自适应：卡片从网格布局切换为纵向排列。
 */
import { computed } from 'vue'

type GroupTag = 'review' | 'main' | 'backup' | 'casual'

interface GroupInfo {
  /** 群名称 */
  name: string
  /** 群描述（1-2 句话） */
  description: string
  /** QQ 群链接 */
  url: string
  /** 标签类型 */
  tag: GroupTag
  /** 可选：群号显示 */
  qq?: string
}

const props = withDefaults(defineProps<{
  groups?: GroupInfo[]
}>(), {
  groups: () => []
})

const tagConfig: Record<GroupTag, { label: string, color: string, bg: string }> = {
  review: { label: '入服审核', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  main: { label: '主群', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  backup: { label: '备用群', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
  casual: { label: '休闲', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
}

const sortedGroups = computed(() => {
  const order: GroupTag[] = ['review', 'main', 'backup', 'casual']
  return [...props.groups].sort((a, b) =>
    order.indexOf(a.tag) - order.indexOf(b.tag))
})
</script>

<template>
  <div class="qq-group-list">
    <a
      v-for="group in sortedGroups"
      :key="group.name"
      :href="group.url"
      class="qq-group-card"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="qq-card-header">
        <span
          class="qq-tag"
          :style="{ color: tagConfig[group.tag].color, background: tagConfig[group.tag].bg }"
        >
          {{ tagConfig[group.tag].label }}
        </span>
        <span v-if="group.qq" class="qq-number">{{ group.qq }}</span>
      </div>

      <h3 class="qq-card-title">{{ group.name }}</h3>
      <p class="qq-card-desc">{{ group.description }}</p>

      <span class="qq-join-btn">
        加入群组
        <svg class="qq-join-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
    </a>
  </div>
</template>

<style scoped>
.qq-group-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.qq-group-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px 22px;
  border-radius: 12px;
  text-decoration: none;
  /* 玻璃磨砂 */
  background: rgba(120, 120, 130, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
  overflow: hidden;
}

.qq-group-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--vp-c-brand, #E05252), transparent);
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.qq-group-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.qq-group-card:hover::before {
  opacity: 1;
}

.qq-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qq-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.qq-number {
  font-size: 13px;
  color: var(--vp-c-text-2, #888);
  font-family: var(--vp-font-family-mono, monospace);
}

.qq-card-title {
  font-size: 16px;
  font-weight: 700;
  margin: 4px 0 0 0;
  color: var(--vp-c-text-1, #1a1a1a);
  line-height: 1.4;
}

.qq-card-desc {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  color: var(--vp-c-text-2, #666);
  flex: 1;
}

.qq-join-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand, #E05252);
  margin-top: 6px;
}

.qq-join-arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

.qq-group-card:hover .qq-join-arrow {
  transform: translateX(3px);
}

/* ===== 暗色模式 ===== */
.dark .qq-group-card {
  background: rgba(80, 80, 90, 0.08);
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.3);
}

.dark .qq-group-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* ===== 移动端 ===== */
@media (max-width: 640px) {
  .qq-group-list {
    grid-template-columns: 1fr;
    gap: 12px;
    margin: 16px 0;
  }

  .qq-group-card {
    padding: 16px 18px;
    gap: 6px;
  }

  .qq-card-title {
    font-size: 15px;
  }

  .qq-card-desc {
    font-size: 13px;
  }

  .qq-join-btn {
    font-size: 13px;
  }
}
</style>
