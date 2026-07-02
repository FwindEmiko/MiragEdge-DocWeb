<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <a :href="link" class="feature-card">
    <div class="card-icon">{{ icon }}</div>
    <div class="card-content">
      <div class="card-title">{{ title }}</div>
      <div class="card-text">
        <slot></slot>
      </div>
      <div class="card-link">查看详情 →</div>
    </div>
  </a>
</template>

<style scoped>
.feature-card {
  display: block;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  margin-bottom: 16px;
}

.feature-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.card-text {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.card-link {
  margin-top: 12px;
  font-size: 14px;
  color: var(--vp-c-brand);
  font-weight: 500;
}
</style>
