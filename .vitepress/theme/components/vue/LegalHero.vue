<script setup lang="ts">
import { withBase } from 'vitepress'
import LegalIcon from './LegalIcon.vue'
import {
  LEGAL_DOCS,
  formatLegalDate,
  type LegalIconName,
} from '../../data/legal'

/**
 * 条款页统一页头。
 *
 * 视觉上沿用站点「暖色品牌 + 纸面文档」的气质：浅色渐变底、细网格、
 * 低对比大编号；信息层级固定为：栏目 → 标题 → 摘要 → 版本信息 → 文档切换。
 * 所有交互控件都是原生 <a>，保证键盘、读屏与中键新开标签页都可用。
 */
withDefaults(
  defineProps<{
    /** 两位编号，例如 01 */
    index: string
    /** 页面标题 */
    title: string
    /** 一句话摘要 */
    summary: string
    /** 版本号 */
    version?: string
    /** 生效日期（ISO） */
    effective?: string
    /** 更新日期（ISO） */
    updated?: string
    /** 阅读时长文案 */
    reading?: string
    /** 适用范围文案 */
    scope?: string
    /** 图标 */
    icon?: LegalIconName
    /** 当前文档 key，用于高亮胶囊按钮 */
    current?: string
    /** 是否显示文档切换胶囊 */
    showNav?: boolean
  }>(),
  {
    version: 'v1.0',
    effective: '2026-11-12',
    updated: '2026-11-12',
    reading: '',
    scope: '本站与游戏服务',
    icon: 'hub',
    current: '',
    showNav: true,
  },
)
</script>

<template>
  <header class="legal-hero" aria-labelledby="legal-hero-title">
    <div class="legal-hero__pattern" aria-hidden="true"></div>
    <div class="legal-hero__seal" aria-hidden="true">{{ index }}</div>

    <div class="legal-hero__content">
      <p class="legal-hero__eyebrow">
        <span class="legal-hero__dot" aria-hidden="true"></span>
        <span>LEGAL · {{ index }}</span>
        <span class="legal-hero__slash" aria-hidden="true">/</span>
        <span>{{ scope }}</span>
      </p>

      <div class="legal-hero__title-row">
        <span class="legal-hero__icon" aria-hidden="true">
          <LegalIcon :name="icon" :size="24" />
        </span>
        <h1 id="legal-hero-title" class="legal-hero__title">{{ title }}</h1>
      </div>

      <p class="legal-hero__summary">{{ summary }}</p>

      <ul class="legal-hero__meta" aria-label="文档信息">
        <li>
          <span class="legal-hero__label">版本</span>
          <strong>{{ version }}</strong>
        </li>
        <li>
          <span class="legal-hero__label">生效</span>
          <time :datetime="effective">{{ formatLegalDate(effective) }}</time>
        </li>
        <li>
          <span class="legal-hero__label">更新</span>
          <time :datetime="updated">{{ formatLegalDate(updated) }}</time>
        </li>
        <li v-if="reading">
          <span class="legal-hero__label">阅读</span>
          <strong>{{ reading }}</strong>
        </li>
      </ul>
    </div>
  </header>

  <nav v-if="showNav" class="legal-pills" aria-label="条款文档导航">
    <a
      v-for="doc in LEGAL_DOCS"
      :key="doc.key"
      :href="withBase(doc.href)"
      class="legal-pill"
      :class="{ 'is-current': doc.key === current }"
      :aria-current="doc.key === current ? 'page' : undefined"
    >
      <LegalIcon :name="doc.icon" :size="16" />
      <span>{{ doc.short }}</span>
    </a>
  </nav>
</template>

<style scoped>
.legal-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  margin: 8px 0 4px;
  padding: clamp(22px, 4vw, 38px);
  border: 1px solid var(--vp-c-divider);
  border-radius: 22px;
  background:
    radial-gradient(120% 120% at 100% 0%, var(--legal-accent-soft, rgba(224, 82, 82, 0.1)) 0%, transparent 58%),
    linear-gradient(135deg, var(--vp-c-bg-soft) 0%, var(--vp-c-bg) 58%, var(--vp-c-bg-soft) 100%);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.03),
    0 12px 32px rgba(0, 0, 0, 0.04);
}

.dark .legal-hero {
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.18),
    0 16px 40px rgba(0, 0, 0, 0.22);
}

/* 细网格：模拟文档纸面的参考线，向外渐隐，不抢正文注意力 */
.legal-hero__pattern {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--vp-c-divider) 55%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--vp-c-divider) 55%, transparent) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(ellipse at 78% 0%, #000 0%, transparent 72%);
  -webkit-mask-image: radial-gradient(ellipse at 78% 0%, #000 0%, transparent 72%);
  opacity: 0.55;
  pointer-events: none;
}

.legal-hero__seal {
  position: absolute;
  top: 50%;
  right: clamp(18px, 3.5vw, 44px);
  z-index: -1;
  transform: translateY(-50%);
  font-size: clamp(72px, 12vw, 138px);
  font-weight: 800;
  line-height: 0.8;
  letter-spacing: -0.06em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--legal-accent, var(--vp-c-brand-1)) 24%, transparent);
  opacity: 0.7;
  user-select: none;
  pointer-events: none;
}

.legal-hero__content {
  position: relative;
  z-index: 1;
  max-width: 68ch;
}

.legal-hero__eyebrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin: 0 0 14px;
  color: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.legal-hero__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--legal-accent, var(--vp-c-brand-1));
  box-shadow: 0 0 0 3px var(--legal-accent-soft, rgba(224, 82, 82, 0.12));
}

.legal-hero__slash {
  color: var(--vp-c-text-3);
  opacity: 0.6;
}

.legal-hero__title-row {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.legal-hero__icon {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border: 1px solid color-mix(in srgb, var(--legal-accent, var(--vp-c-brand-1)) 24%, var(--vp-c-divider));
  border-radius: 14px;
  background: var(--legal-accent-soft, rgba(224, 82, 82, 0.12));
  color: var(--legal-accent, var(--vp-c-brand-1));
}

.legal-hero__title {
  min-width: 0;
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: clamp(26px, 4.2vw, 38px);
  font-weight: 750;
  line-height: 1.2;
  letter-spacing: -0.025em;
  text-wrap: balance;
  /* 覆盖 VitePress 默认 h1 的 margin/border */
  border-top: 0;
  padding-top: 0;
}

.legal-hero__summary {
  max-width: 62ch;
  margin: 16px 0 0;
  color: var(--vp-c-text-2);
  font-size: 15.5px;
  line-height: 1.8;
  text-wrap: pretty;
}

.legal-hero__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.legal-hero__meta li {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  min-height: 30px;
  padding: 5px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-bg) 82%, transparent);
  color: var(--vp-c-text-1);
  font-size: 12.5px;
  line-height: 1.4;
}

.legal-hero__label {
  color: var(--vp-c-text-3);
  font-size: 11.5px;
}

.legal-hero__meta strong,
.legal-hero__meta time {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* 文档切换：横向可滚动胶囊，移动端不换行、不挤压标题 */
.legal-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 14px 0 0;
  padding: 2px 2px 8px;
  overflow: visible;
}

.legal-pill {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 7px;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  transition:
    color 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;
}

.legal-pill:hover {
  border-color: var(--legal-accent, var(--vp-c-brand-1));
  background: var(--legal-accent-soft, rgba(224, 82, 82, 0.12));
  color: var(--legal-accent-strong, var(--vp-c-brand-darker));
}

.legal-pill.is-current {
  border-color: var(--legal-accent-fill, var(--vp-c-brand-darker));
  background: var(--legal-accent-fill, var(--vp-c-brand-darker));
  color: var(--legal-accent-on, #fff);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--legal-accent, var(--vp-c-brand-1)) 26%, transparent);
}

.legal-pill:focus-visible {
  outline: 2px solid var(--legal-accent, var(--vp-c-brand-1));
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .legal-hero {
    margin-top: 4px;
    padding: 20px 18px;
    border-radius: 18px;
  }

  .legal-hero__seal {
    display: none;
  }

  .legal-hero__title-row {
    gap: 10px;
    align-items: flex-start;
  }

  .legal-hero__icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
  }

  .legal-hero__title {
    font-size: clamp(23px, 7vw, 29px);
  }

  .legal-hero__summary {
    margin-top: 12px;
    font-size: 14.5px;
    line-height: 1.75;
  }

  .legal-hero__meta {
    gap: 6px;
    margin-top: 16px;
  }

  .legal-hero__meta li {
    flex: 1 1 calc(50% - 6px);
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 2px;
    min-height: 44px;
    padding: 6px 10px;
    font-size: 11.5px;
  }

  .legal-hero__label {
    font-size: 10.5px;
    white-space: nowrap;
  }

  .legal-pills {
    flex-wrap: wrap;
    margin-top: 10px;
    padding-bottom: 6px;
    overflow: visible;
  }

  .legal-pill {
    min-height: 36px;
    padding: 0 12px;
    font-size: 12.5px;
  }
}

@media (max-width: 420px) {
  .legal-hero__meta li {
    flex-basis: calc(50% - 3px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .legal-pill {
    transition: none;
  }
}
</style>
