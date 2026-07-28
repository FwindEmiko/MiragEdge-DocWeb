<script setup lang="ts">
defineProps<{
  title?: string
}>()
</script>

<template>
  <section class="command-panel">
    <p v-if="title" class="command-panel__title">{{ title }}</p>
    <div class="command-panel__list">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.command-panel {
  margin: 20px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 84%, transparent);
  overflow: hidden;
}

.command-panel__title {
  margin: 0;
  padding: 10px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  font-size: 0.875rem;
  font-weight: 650;
}

.command-panel__list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.command-panel__list :deep(.command-entry:nth-child(2n)) {
  border-left: 1px solid var(--vp-c-divider);
}

.command-panel__list :deep(.command-entry:nth-child(n + 3)) {
  border-top: 1px solid var(--vp-c-divider);
}

@media (max-width: 640px) {
  .command-panel__list {
    grid-template-columns: 1fr;
  }

  .command-panel__list :deep(.command-entry:nth-child(2n)) {
    border-left: 0;
  }

  .command-panel__list :deep(.command-entry:nth-child(n + 2)) {
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
