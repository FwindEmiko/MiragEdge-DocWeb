<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import { LEGAL_VERSION, LEGAL_EFFECTIVE, LEGAL_UPDATED, formatLegalDate, getLegalDoc } from '../../data/legal'

const { frontmatter } = useData()
const doc = computed(() => getLegalDoc(frontmatter.value.legalDoc ?? 'hub'))
</script>

<template>
  <header v-if="doc" class="legal-heading">
    <p class="legal-heading__eyebrow">锐界幻境 · 条款与隐私</p>
    <h1 id="legal-title" tabindex="-1">{{ doc.title }}</h1>
    <p class="legal-heading__summary">{{ doc.summary }}</p>
    <dl class="legal-heading__meta">
      <div><dt>版本</dt><dd>{{ LEGAL_VERSION }}</dd></div>
      <div><dt>生效日期</dt><dd><time :datetime="LEGAL_EFFECTIVE">{{ formatLegalDate(LEGAL_EFFECTIVE) }}</time></dd></div>
      <div><dt>更新日期</dt><dd><time :datetime="LEGAL_UPDATED">{{ formatLegalDate(LEGAL_UPDATED) }}</time></dd></div>
      <div><dt>预计阅读</dt><dd>{{ doc.reading }}</dd></div>
    </dl>
  </header>
</template>
