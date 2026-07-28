<script setup lang="ts">
defineProps<{
  command: string
  description: string
}>()
</script>

<template>
  <div class="command-entry">
    <code>{{ command }}</code>
    <span>{{ description }}</span>
  </div>
</template>

<style scoped>
.command-entry {
  display: grid;
  gap: 6px;
  min-height: 74px;
  padding: 13px 14px;
  align-content: center;
}

code {
  width: fit-content;
  color: var(--vp-c-brand-1);
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}

span {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  line-height: 1.55;
}
</style>
