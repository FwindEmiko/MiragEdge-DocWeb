<script setup lang="ts">
import { BookOpen, FileText, ShieldCheck, TriangleAlert, Copyright, HeartHandshake, Mail, ArrowRight, Check } from 'lucide-vue-next'
import type { LegalIconName } from '../../data/legal'

withDefaults(defineProps<{ name?: LegalIconName; size?: number }>(), { name: 'hub', size: 20 })
const icons = {
  hub: BookOpen, terms: FileText, privacy: ShieldCheck, disclaimer: TriangleAlert,
  copyright: Copyright, minors: HeartHandshake, contact: Mail, arrow: ArrowRight, check: Check,
}
</script>

<template>
  <component :is="icons[name]" class="legal-icon" :size="size" :stroke-width="1.6" aria-hidden="true" />
</template>
