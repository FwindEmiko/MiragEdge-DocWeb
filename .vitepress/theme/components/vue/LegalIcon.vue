<script setup lang="ts">
import type { LegalIconName } from '../../data/legal'

/**
 * 条款中心内联图标。
 * 只用 stroke 路径，随 currentColor 与主题变化；不依赖外部图标字体。
 */
const props = withDefaults(
  defineProps<{
    name?: LegalIconName
    size?: number
  }>(),
  {
    name: 'hub',
    size: 20,
  },
)

const paths: Record<LegalIconName, string[]> = {
  hub: [
    'M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5z',
    'M4 18.5A2.5 2.5 0 0 1 6.5 16H20',
    'M8 7h8',
  ],
  terms: [
    'M6 3.5h8l4 4v13H6z',
    'M14 3.5v4h4',
    'M9 12h6',
    'M9 15.5h4',
  ],
  privacy: [
    'M12 3l7 3v5.5c0 4.4-2.9 8.3-7 9.5-4.1-1.2-7-5.1-7-9.5V6z',
    'M12 10.2a1.5 1.5 0 0 1 .8 2.8V15h-1.6v-2a1.5 1.5 0 0 1 .8-2.8z',
  ],
  disclaimer: [
    'M12 4l8.5 15h-17z',
    'M12 9v4.5',
    'M12 16.4h.01',
  ],
  copyright: [
    'M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17z',
    'M14.6 9.4a4 4 0 1 0 0 5.2',
  ],
  minors: [
    'M12 3l7 3v5.5c0 4.4-2.9 8.3-7 9.5-4.1-1.2-7-5.1-7-9.5V6z',
    'M12 15.5s-3-1.9-3-3.7a1.7 1.7 0 0 1 3-1 1.7 1.7 0 0 1 3 1c0 1.8-3 3.7-3 3.7z',
  ],
  contact: [
    'M4 6.5h16v11H4z',
    'M4.5 7l7.5 6 7.5-6',
  ],
  arrow: [
    'M5 12h14',
    'M13 6l6 6-6 6',
  ],
  check: [
    'M5 12.5l4.5 4.5L19 7.5',
  ],
}
</script>

<template>
  <svg
    class="legal-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path v-for="(d, index) in paths[props.name] || paths.hub" :key="index" :d="d" />
  </svg>
</template>

<style scoped>
.legal-icon {
  display: block;
  flex: none;
}
</style>
