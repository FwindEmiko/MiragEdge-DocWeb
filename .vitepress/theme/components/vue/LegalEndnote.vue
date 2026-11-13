<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { ArrowLeft, ArrowRight } from 'lucide-vue-next'
import { LEGAL_DOCS, LEGAL_VERSION, LEGAL_UPDATED, formatLegalDate } from '../../data/legal'

const { frontmatter } = useData()
const currentIndex = computed(() => LEGAL_DOCS.findIndex(doc => doc.key === frontmatter.value.legalDoc))
const previous = computed(() => LEGAL_DOCS[currentIndex.value - 1])
const next = computed(() => LEGAL_DOCS[currentIndex.value + 1])
</script>

<template>
  <footer class="legal-endnote">
    <nav class="legal-pagination" aria-label="相邻条款">
      <a v-if="previous" :href="withBase(previous.href)" class="legal-pagination__link">
        <ArrowLeft :size="18" aria-hidden="true" />
        <span><small>上一份</small>{{ previous.title }}</span>
      </a>
      <a v-if="next" :href="withBase(next.href)" class="legal-pagination__link legal-pagination__next">
        <span><small>下一份</small>{{ next.title }}</span>
        <ArrowRight :size="18" aria-hidden="true" />
      </a>
    </nav>
    <div class="legal-endnote__meta">
      <span>{{ LEGAL_VERSION }} · 更新于 <time :datetime="LEGAL_UPDATED">{{ formatLegalDate(LEGAL_UPDATED) }}</time></span>
      <a :href="withBase('/legal/contact')">联系与投诉</a>
    </div>
  </footer>
</template>
