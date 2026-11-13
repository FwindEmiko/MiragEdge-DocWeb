<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import LegalIcon from './LegalIcon.vue'
import { formatLegalDate, getRelatedLegalDocs } from '../../data/legal'

/**
 * 条款卡片网格。
 *
 * 同一组件服务两个场景：
 * - 条款中心：展示全部六份文档，作为主入口；
 * - 文档页尾：排除当前页，展示三份相关文档。
 * 卡片本身是链接，整块可点；标题、摘要、版本信息都保留为文本，
 * 不使用绝对定位覆盖可读内容。
 */
const props = withDefaults(
  defineProps<{
    /** 排除的文档 key（通常是当前页） */
    exclude?: string
    /** 最多展示几张；0 表示全部 */
    limit?: number
    /** 紧凑模式，用于页尾 */
    compact?: boolean
    /** 无障碍标签 */
    label?: string
  }>(),
  {
    exclude: '',
    limit: 0,
    compact: false,
    label: '条款文档',
  },
)

const items = computed(() => {
  const list = getRelatedLegalDocs(props.exclude)
  return props.limit > 0 ? list.slice(0, props.limit) : list
})
</script>

<template>
  <section
    v-if="items.length"
    class="legal-doc-grid"
    :class="{ 'is-compact': compact }"
    :aria-label="label"
  >
    <div class="legal-doc-grid__items">
      <a
        v-for="doc in items"
        :key="doc.key"
        :href="withBase(doc.href)"
        class="legal-doc-card"
      >
        <span class="legal-doc-card__top">
          <span class="legal-doc-card__index" aria-hidden="true">{{ doc.index }}</span>
          <span class="legal-doc-card__icon" aria-hidden="true">
            <LegalIcon :name="doc.icon" :size="18" />
          </span>
        </span>

        <span class="legal-doc-card__title">{{ doc.title }}</span>
        <span class="legal-doc-card__summary">{{ doc.summary }}</span>

        <span class="legal-doc-card__meta">
          <span>{{ doc.reading }}</span>
          <span aria-hidden="true">·</span>
          <span>更新于 {{ formatLegalDate(doc.updated) }}</span>
        </span>

        <span class="legal-doc-card__arrow" aria-hidden="true">
          <LegalIcon name="arrow" :size="16" />
        </span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.legal-doc-grid {
  margin: 20px 0 8px;
}

.legal-doc-grid__items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

.legal-doc-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 184px;
  padding: 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  background:
    linear-gradient(160deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg) 100%);
  color: inherit;
  text-decoration: none;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.legal-doc-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--legal-accent, var(--vp-c-brand-1)) 55%, var(--vp-c-divider));
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.04),
    0 12px 28px rgba(0, 0, 0, 0.07);
}

.dark .legal-doc-card:hover {
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 14px 32px rgba(0, 0, 0, 0.26);
}

.legal-doc-card:focus-visible {
  outline: 2px solid var(--legal-accent, var(--vp-c-brand-1));
  outline-offset: 3px;
}

.legal-doc-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.legal-doc-card__index {
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
}

.legal-doc-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid color-mix(in srgb, var(--legal-accent, var(--vp-c-brand-1)) 20%, var(--vp-c-divider));
  border-radius: 10px;
  background: var(--legal-accent-soft, rgba(224, 82, 82, 0.12));
  color: var(--legal-accent, var(--vp-c-brand-1));
}

.legal-doc-card__title {
  color: var(--vp-c-text-1);
  font-size: 15.5px;
  font-weight: 650;
  line-height: 1.45;
  letter-spacing: -0.01em;
}

.legal-doc-card__summary {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.65;
}

.legal-doc-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  margin-top: auto;
  padding-right: 22px;
  color: var(--vp-c-text-3);
  font-size: 11.5px;
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
}

.legal-doc-card__arrow {
  position: absolute;
  right: 16px;
  bottom: 16px;
  color: var(--vp-c-text-3);
  transition: color 180ms ease, transform 180ms ease;
}

.legal-doc-card:hover .legal-doc-card__arrow {
  color: var(--legal-accent-strong, var(--vp-c-brand-darker));
  transform: translateX(2px);
}

/* 页尾紧凑模式：高度更小，摘要与元信息更紧凑 */
.legal-doc-grid.is-compact .legal-doc-card {
  min-height: 150px;
  padding: 14px 15px;
  gap: 6px;
}

/* 页尾三份相关文档尽量排成一行，避免 2 + 1 的孤行 */
.legal-doc-grid.is-compact .legal-doc-grid__items {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.legal-doc-grid.is-compact .legal-doc-card__icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
}

.legal-doc-grid.is-compact .legal-doc-card__title {
  font-size: 14.5px;
}

.legal-doc-grid.is-compact .legal-doc-card__summary {
  font-size: 12.5px;
}

.legal-doc-grid.is-compact .legal-doc-card__arrow {
  right: 13px;
  bottom: 13px;
}

@media (max-width: 767px) {
  .legal-doc-grid {
    margin-top: 16px;
  }

  .legal-doc-grid__items {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .legal-doc-card {
    min-height: 0;
    padding: 16px;
  }

  .legal-doc-grid.is-compact .legal-doc-card {
    min-height: 0;
    padding: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .legal-doc-card,
  .legal-doc-card__arrow {
    transition: none;
  }

  .legal-doc-card:hover {
    transform: none;
  }
}
</style>
