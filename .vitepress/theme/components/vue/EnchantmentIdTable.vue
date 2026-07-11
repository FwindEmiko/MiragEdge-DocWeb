<template>
  <div class="ench-id-table">
    <!-- 搜索过滤 -->
    <div class="ench-id-search-wrap">
      <input
        v-model="query"
        class="ench-id-search"
        type="text"
        placeholder="按名称或 ID 过滤…"
        aria-label="过滤附魔 ID"
      />
      <span v-if="query" class="ench-id-search-clear" @click="query = ''">✕</span>
    </div>

    <p class="ench-id-hint" v-if="!query">
      共 {{ total }} 个附魔。可直接在页面内搜索，或按品质分组浏览。
    </p>
    <p class="ench-id-hint" v-else>
      匹配到 <strong>{{ filtered.length }}</strong> 个结果
    </p>

    <!-- 搜索模式：扁平表 -->
    <table class="ench-id-flat" v-if="query">
      <thead>
        <tr><th>名称</th><th>ID</th><th>品质</th><th>最大等级</th></tr>
      </thead>
      <tbody>
        <tr v-for="e in filtered" :key="e.id + e.name + e.maxLevel">
          <td class="id-name" :style="{ color: rarityColor(e.rarity) }">{{ e.name }}</td>
          <td><code>{{ e.id }}</code></td>
          <td>{{ rarityLabel(e.rarity) }}</td>
          <td>{{ e.maxLevel }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 分组模式：按品质分块 -->
    <div v-else>
      <div v-for="r in rarities" :key="r.key" class="ench-id-group">
        <h4 class="ench-id-group-title">
          <span class="ench-id-dot" :style="{ background: r.color }"></span>
          {{ r.label }}品质
          <span class="ench-id-group-count">({{ grouped[r.key].length }})</span>
        </h4>
        <table>
          <thead>
            <tr><th>名称</th><th>ID</th><th>最大等级</th></tr>
          </thead>
          <tbody>
            <tr v-for="e in grouped[r.key]" :key="e.id + e.name + e.maxLevel">
              <td class="id-name" :style="{ color: r.color }">{{ e.name }}</td>
              <td><code>{{ e.id }}</code></td>
              <td>{{ e.maxLevel }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { enchantments, rarities } from '../../data/enchantments'

const query = ref('')
const total = enchantments.length

const grouped = computed(() => {
  const map = {}
  for (const r of rarities) {
    map[r.key] = enchantments.filter(e => e.rarity === r.key)
  }
  return map
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return enchantments.filter(e =>
    e.name.toLowerCase().includes(q) ||
    e.id.toLowerCase().includes(q)
  )
})

function rarityColor(key) {
  const r = rarities.find(r => r.key === key)
  return r ? r.color : '#999'
}

function rarityLabel(key) {
  const r = rarities.find(r => r.key === key)
  return r ? r.label : key
}
</script>

<style scoped>
.ench-id-table {
  margin: 16px 0;
}

.ench-id-search-wrap {
  position: relative;
  max-width: 420px;
  margin: 0 0 12px;
}

.ench-id-search {
  width: 100%;
  padding: 8px 32px 8px 12px;
  font-size: 13px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  outline: none;
  box-sizing: border-box;
}

.ench-id-search:focus {
  border-color: var(--vp-c-brand-1);
}

.ench-id-search-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.ench-id-hint {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin: 0 0 16px;
}

.ench-id-group {
  margin-bottom: 24px;
}

.ench-id-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  margin: 0 0 8px;
}

.ench-id-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.ench-id-group-count {
  font-size: 13px;
  font-weight: 400;
  color: var(--vp-c-text-2);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88em;
}

th, td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
}

th {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
}

tbody tr:hover td {
  background: var(--vp-c-bg-soft);
}

.id-name {
  font-weight: 600;
  white-space: nowrap;
}

code {
  font-size: 0.85em;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}

@media (max-width: 768px) {
  th, td {
    padding: 6px 8px;
  }
}
</style>
