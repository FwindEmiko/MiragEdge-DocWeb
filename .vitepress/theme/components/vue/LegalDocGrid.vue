<script setup lang="ts">
import { withBase } from 'vitepress'
import LegalIcon from './LegalIcon.vue'
import { getRelatedLegalDocs } from '../../data/legal'

const docs = getRelatedLegalDocs()
</script>

<template>
  <nav class="legal-doc-grid" aria-label="条款文档">
    <a v-for="doc in docs" :key="doc.key" :href="withBase(doc.href)" class="legal-doc-card">
      <LegalIcon :name="doc.icon" :size="22" />
      <span class="legal-doc-card__body">
        <span class="legal-doc-card__title">{{ doc.title }}</span>
        <span class="legal-doc-card__summary">{{ doc.summary }}</span>
        <span class="legal-doc-card__meta">{{ doc.reading }}</span>
      </span>
      <LegalIcon name="arrow" :size="18" />
    </a>
  </nav>
</template>
