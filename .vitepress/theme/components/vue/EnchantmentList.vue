<template>
  <div class="ench-list">
    <!-- 搜索框 -->
    <div class="ench-search-wrap">
      <input
        v-model="searchQuery"
        class="ench-search"
        type="text"
        placeholder="搜索附魔名称 / 效果 / 适用装备…"
        aria-label="搜索附魔"
      />
      <span v-if="searchQuery" class="ench-search-clear" @click="searchQuery = ''">✕</span>
    </div>

    <!-- 品质标签栏 -->
    <div class="ench-tabs" v-if="!searchQuery">
      <button
        v-for="r in rarities"
        :key="r.key"
        class="ench-tab"
        :class="{ active: activeRarity === r.key }"
        :style="activeRarity === r.key ? { borderColor: r.color, color: r.color } : {}"
        @click="selectRarity(r.key)"
      >
        <span class="ench-tab-dot" :style="{ background: r.color }"></span>
        {{ r.label }}
        <span class="ench-tab-count">{{ countByRarity[r.key] }}</span>
      </button>
    </div>

    <!-- 搜索结果提示 -->
    <div class="ench-search-info" v-if="searchQuery">
      <span>搜索到 <strong>{{ filteredItems.length }}</strong> 个匹配的附魔</span>
      <button class="ench-search-reset" @click="searchQuery = ''">清除搜索</button>
    </div>

    <!-- 当前品质描述 -->
    <blockquote class="ench-rarity-desc" v-if="!searchQuery && activeRarityMeta">
      {{ activeRarityMeta.desc }}
    </blockquote>

    <!-- 桌面端表格 -->
    <table class="ench-table" v-if="filteredItems.length > 0">
      <thead>
        <tr>
          <th class="col-name">名称</th>
          <th class="col-level">最大等级</th>
          <th class="col-equip">适用装备</th>
          <th class="col-effect">效果</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="ench in visibleItems"
          :key="ench.id + ench.name + ench.maxLevel"
          class="ench-row"
        >
          <td class="col-name">
            <span class="ench-name-dot" :style="{ background: rarityColor(ench.rarity) }"></span>
            <span class="ench-name-text" :style="{ color: rarityColor(ench.rarity) }">{{ ench.name }}</span>
          </td>
          <td class="col-level">{{ ench.maxLevel }}</td>
          <td class="col-equip">{{ ench.equipment }}</td>
          <td class="col-effect">{{ ench.effect }}</td>
        </tr>
      </tbody>
    </table>

    <!-- 移动端卡片 -->
    <div class="ench-cards" v-if="filteredItems.length > 0">
      <div
        v-for="ench in visibleItems"
        :key="ench.id + ench.name + ench.maxLevel"
        class="ench-card"
        :style="{ borderLeftColor: rarityColor(ench.rarity) }"
      >
        <div class="ench-card-head">
          <span class="ench-card-name" :style="{ color: rarityColor(ench.rarity) }">{{ ench.name }}</span>
          <span class="ench-card-level">最大等级 {{ ench.maxLevel }}</span>
        </div>
        <div class="ench-card-equip">{{ ench.equipment }}</div>
        <div class="ench-card-effect">{{ ench.effect }}</div>
      </div>
    </div>

    <!-- 加载更多（哨兵 + 按钮） -->
    <div
      v-if="hasMore && filteredItems.length > 0"
      ref="sentinelRef"
      class="ench-load-more-wrap"
    >
      <button class="ench-load-more-btn" @click="loadMore">
        加载更多（剩余 {{ remaining }} 个）
      </button>
    </div>

    <!-- 全部加载完 -->
    <div class="ench-loaded-all" v-if="!hasMore && filteredItems.length > 0 && filteredItems.length > pageSize">
      已显示全部 {{ filteredItems.length }} 个
    </div>

    <!-- 无结果 -->
    <div class="ench-no-results" v-if="filteredItems.length === 0">
      没有找到匹配的附魔
    </div>

    <!-- 底部统计 -->
    <div class="ench-footer-stats" v-if="!searchQuery">
      当前显示 {{ visibleItems.length }} / {{ filteredItems.length }} 个 · 全部共 {{ total }} 个附魔
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { enchantments, rarities } from '../../data/enchantments'

const pageSize = 20

const searchQuery = ref('')
const activeRarity = ref('curse')
const visibleCount = ref(pageSize)
const sentinelRef = ref(null)
let observer = null

const total = enchantments.length

const countByRarity = computed(() => {
  const map = {}
  for (const r of rarities) {
    map[r.key] = enchantments.filter(e => e.rarity === r.key).length
  }
  return map
})

const activeRarityMeta = computed(() =>
  rarities.find(r => r.key === activeRarity.value)
)

// 过滤后的列表：搜索时跨所有品质，否则按当前品质
const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    return enchantments.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.effect.toLowerCase().includes(q) ||
      e.equipment.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q)
    )
  }
  return enchantments.filter(e => e.rarity === activeRarity.value)
})

// 当前可见的条目（渐进加载）
const visibleItems = computed(() => filteredItems.value.slice(0, visibleCount.value))

const hasMore = computed(() => visibleCount.value < filteredItems.value.length)
const remaining = computed(() => filteredItems.value.length - visibleCount.value)

function rarityColor(key) {
  const r = rarities.find(r => r.key === key)
  return r ? r.color : '#999'
}

function selectRarity(key) {
  activeRarity.value = key
  visibleCount.value = pageSize
}

function loadMore() {
  visibleCount.value += pageSize
}

// 搜索或切换品质时重置可见数量
watch([searchQuery, activeRarity], () => {
  visibleCount.value = pageSize
})

// 哨兵自动加载
onMounted(() => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting && hasMore.value) {
        loadMore()
      }
    }
  }, { rootMargin: '300px' })
  // nextTick 确保哨兵已渲染
  nextTick(() => {
    if (sentinelRef.value) observer.observe(sentinelRef.value)
  })
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.ench-list {
  margin: 16px 0;
}

/* ===== 搜索框 ===== */
.ench-search-wrap {
  position: relative;
  max-width: 480px;
  margin: 0 0 16px;
}

.ench-search {
  width: 100%;
  padding: 10px 36px 10px 14px;
  font-size: 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.ench-search:focus {
  border-color: var(--vp-c-brand-1);
}

.ench-search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--vp-c-text-2);
  font-size: 14px;
  user-select: none;
}

.ench-search-clear:hover {
  color: var(--vp-c-text-1);
}

/* ===== 品质标签栏 ===== */
.ench-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.ench-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 13px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.ench-tab:hover {
  border-color: var(--vp-c-brand-2);
}

.ench-tab.active {
  font-weight: 600;
  background: var(--vp-c-bg-soft);
}

.ench-tab-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.ench-tab-count {
  font-size: 11px;
  opacity: 0.7;
}

/* ===== 搜索信息 ===== */
.ench-search-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 8px 14px;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.ench-search-reset {
  border: none;
  background: none;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  font-size: 13px;
  padding: 2px 8px;
}

.ench-search-reset:hover {
  text-decoration: underline;
}

/* ===== 品质描述 ===== */
.ench-rarity-desc {
  margin: 0 0 16px;
  padding: 8px 14px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  border-left: 3px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
  border-radius: 0 6px 6px 0;
}

/* ===== 桌面端表格 ===== */
.ench-table {
  display: table;
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}

.ench-table th,
.ench-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid var(--vp-c-divider);
}

.ench-table th {
  background: var(--vp-c-bg-soft);
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
}

.ench-table tbody tr {
  transition: background 0.15s;
}

.ench-table tbody tr:hover td {
  background: var(--vp-c-bg-soft);
}

.ench-row .col-name {
  white-space: nowrap;
}

.ench-name-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

.ench-name-text {
  font-weight: 600;
}

.ench-row .col-level {
  text-align: center;
  white-space: nowrap;
  width: 80px;
}

.ench-row .col-equip {
  white-space: nowrap;
  color: var(--vp-c-text-2);
  font-size: 0.92em;
}

.ench-row .col-effect {
  line-height: 1.6;
}

/* ===== 移动端卡片（默认隐藏，小屏显示） ===== */
.ench-cards {
  display: none;
}

.ench-card {
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #999;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 10px;
  background: var(--vp-c-bg);
}

.ench-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}

.ench-card-name {
  font-weight: 700;
  font-size: 15px;
}

.ench-card-level {
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  flex-shrink: 0;
}

.ench-card-equip {
  font-size: 13px;
  color: var(--vp-c-text-2);
  margin-bottom: 6px;
}

.ench-card-effect {
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-1);
}

/* ===== 加载更多 ===== */
.ench-load-more-wrap {
  display: flex;
  justify-content: center;
  padding: 20px 0;
  min-height: 20px;
}

.ench-load-more-btn {
  padding: 8px 24px;
  font-size: 14px;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 20px;
  background: var(--vp-c-bg);
  color: var(--vp-c-brand-1);
  cursor: pointer;
  transition: all 0.2s;
}

.ench-load-more-btn:hover {
  background: var(--vp-c-brand-soft);
}

.ench-loaded-all {
  text-align: center;
  padding: 16px 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.ench-no-results {
  text-align: center;
  padding: 40px 0;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.ench-footer-stats {
  text-align: center;
  padding: 12px 0 4px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

/* ===== 响应式：移动端切换为卡片布局 ===== */
@media (max-width: 768px) {
  .ench-table {
    display: none;
  }

  .ench-cards {
    display: block;
  }

  .ench-tabs {
    gap: 6px;
  }

  .ench-tab {
    padding: 5px 10px;
    font-size: 12px;
  }
}
</style>
