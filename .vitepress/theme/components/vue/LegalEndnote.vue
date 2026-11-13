<script setup lang="ts">
import { withBase } from 'vitepress'
import { formatLegalDate } from '../../data/legal'

/**
 * 条款页尾注：版本、更新日期与两个固定出口。
 * 用 <aside> 而不是 <footer>，避免与 VitePress 的页面级 footer 语义重叠。
 */
withDefaults(
  defineProps<{
    version?: string
    updated?: string
  }>(),
  {
    version: 'v1.0',
    updated: '2026-11-12',
  },
)
</script>

<template>
  <aside class="legal-endnote" aria-label="文档版本信息">
    <p class="legal-endnote__meta">
      <span>文档版本 <strong>{{ version }}</strong></span>
      <span class="legal-endnote__sep" aria-hidden="true">·</span>
      <span>最后更新 <time :datetime="updated">{{ formatLegalDate(updated) }}</time></span>
    </p>
    <p class="legal-endnote__links">
      <a :href="withBase('/legal/contact')">对条款有疑问？联系我们</a>
      <span class="legal-endnote__sep" aria-hidden="true">·</span>
      <a :href="withBase('/legal/')">返回条款中心</a>
    </p>
  </aside>
</template>

<style scoped>
.legal-endnote {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 20px;
  margin: 32px 0 0;
  padding: 16px 2px 0;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 12.5px;
  line-height: 1.6;
}

.legal-endnote__meta,
.legal-endnote__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.legal-endnote strong {
  color: var(--vp-c-text-2);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.legal-endnote time {
  font-variant-numeric: tabular-nums;
}

.legal-endnote__sep {
  opacity: 0.5;
}

.legal-endnote__links a {
  color: var(--vp-c-text-2);
  text-decoration-line: underline;
  text-decoration-color: color-mix(in srgb, var(--vp-c-text-2) 40%, transparent);
  text-underline-offset: 3px;
  transition: color 160ms ease, text-decoration-color 160ms ease;
}

.legal-endnote__links a:hover {
  color: var(--legal-accent-strong, var(--vp-c-brand-darker));
  text-decoration-color: color-mix(in srgb, var(--legal-accent-strong, var(--vp-c-brand-darker)) 70%, transparent);
}

.legal-endnote__links a:focus-visible {
  outline: 2px solid var(--legal-accent, var(--vp-c-brand-1));
  outline-offset: 2px;
  border-radius: 2px;
}

@media (max-width: 767px) {
  .legal-endnote {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 24px;
    padding-top: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .legal-endnote__links a {
    transition: none;
  }
}
</style>
