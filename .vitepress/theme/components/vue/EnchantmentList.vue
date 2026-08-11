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
      <span v-if="searchQuery" class="ench-search-clear" @click="searchQuery = ''" @keydown.enter="searchQuery = ''" tabindex="0" role="button" aria-label="清除搜索">✕</span>
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

    <!-- 来源筛选栏 -->
    <div class="ench-source-tabs">
      <button
        v-for="s in sourceFilters"
        :key="s.key"
        class="ench-source-tab"
        :class="{ active: activeSource === s.key }"
        @click="selectSource(s.key)"
      >
        {{ s.label }}
        <span class="ench-source-tab-count">{{ countBySource[s.key] }}</span>
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
          <th class="col-source">来源</th>
          <th class="col-conflict">冲突</th>
          <th class="col-effect">效果</th>
          <th class="col-expand" title="点击行展开详情"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="ench in visibleItems" :key="ench.id">
          <tr
            class="ench-row"
            @click="toggleExpand(ench.id)"
            :class="{ expanded: expandedId === ench.id }"
            :title="'点击查看详情'"
          >
            <td class="col-name">
              <span class="ench-name-dot" :style="{ background: rarityColor(ench.rarity) }"></span>
              <span class="ench-name-text" :style="{ color: rarityColor(ench.rarity) }">{{ ench.name }}</span>
            </td>
            <td class="col-level">{{ ench.maxLevel }}</td>
            <td class="col-equip">{{ ench.equipment }}</td>
            <td class="col-source">
              <span class="ench-source-badge">{{ sourceLabel(ench.source) }}</span>
            </td>
            <td class="col-conflict">
              <span v-if="ench.conflicts.length > 0" class="ench-conflict-icon" :title="conflictNames(ench.conflicts)">⚡</span>
              <span v-else class="ench-conflict-none">—</span>
            </td>
            <td class="col-effect">{{ ench.effect }}</td>
            <td class="col-expand">{{ expandedId === ench.id ? '▼' : '▶' }}</td>
          </tr>
          <!-- 详情展开行 -->
          <tr v-if="expandedId === ench.id" class="ench-detail-row">
            <td colspan="7">
              <div class="ench-detail-inner">
                <div class="ench-detail-section">
                  <span class="ench-detail-label">名称</span>
                  <span class="ench-detail-name" :style="{ color: rarityColor(ench.rarity) }">{{ ench.name }}</span>
                  <span class="ench-detail-rarity" :style="{ background: rarityColor(ench.rarity) }">{{ rarityLabel(ench.rarity) }}</span>
                </div>
                <div class="ench-detail-section">
                  <span class="ench-detail-label">来源详情</span>
                  <span class="ench-detail-value">{{ ench.sourceDetail }}</span>
                </div>
                <div class="ench-detail-section" v-if="ench.conflicts.length > 0">
                  <span class="ench-detail-label">冲突附魔</span>
                  <span class="ench-detail-value">{{ conflictNames(ench.conflicts) }}</span>
                </div>
                <div class="ench-detail-section">
                  <span class="ench-detail-label">归属包</span>
                  <span class="ench-detail-pack">{{ packLabel(ench.pack) }}</span>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <!-- 移动端卡片 -->
    <div class="ench-cards" v-if="filteredItems.length > 0">
      <div
        v-for="ench in visibleItems"
        :key="ench.id"
        class="ench-card"
        :style="{ borderLeftColor: rarityColor(ench.rarity) }"
        @click="toggleExpand(ench.id)"
      >
        <div class="ench-card-head">
          <span class="ench-card-name" :style="{ color: rarityColor(ench.rarity) }">{{ ench.name }}</span>
          <span class="ench-card-level">最大等级 {{ ench.maxLevel }}</span>
        </div>
        <div class="ench-card-meta">
          <span class="ench-source-badge">{{ sourceLabel(ench.source) }}</span>
          <span v-if="ench.conflicts.length > 0" class="ench-conflict-icon" :title="conflictNames(ench.conflicts)">⚡</span>
        </div>
        <div class="ench-card-equip">{{ ench.equipment }}</div>
        <div class="ench-card-effect">{{ ench.effect }}</div>
        <!-- 卡片详情展开 -->
        <div v-if="expandedId === ench.id" class="ench-card-detail">
          <div class="ench-detail-section">
            <span class="ench-detail-label">来源详情</span>
            <span class="ench-detail-value">{{ ench.sourceDetail }}</span>
          </div>
          <div class="ench-detail-section" v-if="ench.conflicts.length > 0">
            <span class="ench-detail-label">冲突附魔</span>
            <span class="ench-detail-value">{{ conflictNames(ench.conflicts) }}</span>
          </div>
          <div class="ench-detail-section">
            <span class="ench-detail-label">归属包</span>
            <span class="ench-detail-pack">{{ packLabel(ench.pack) }}</span>
          </div>
        </div>
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
const activeSource = ref('')
const expandedId = ref(null)
const visibleCount = ref(pageSize)
const sentinelRef = ref(null)
let observer = null

const total = enchantments.length

// 来源筛选按钮定义
const sourceFilters = [
  { key: '', label: '全部' },
  { key: 'enchanting_table', label: '附魔台' },
  { key: 'random_loot', label: '随机战利品' },
  { key: 'structure', label: '结构宝箱' },
  { key: 'stellarity_vault', label: '末地城宝库' },
  { key: 'curse_random', label: '诅咒' },
  { key: 'funpack', label: '整蛊' },
]

// 来源标签映射
const sourceLabels = {
  enchanting_table: '🔮 附魔台',
  random_loot: '🎲 战利品',
  structure: '🏛️ 结构',
  stellarity_vault: '⚱️ 宝库',
  curse_random: '☠️ 诅咒',
  funpack: '🎭 整蛊',
}

// 归属包标签映射
const packLabels = {
  vanilla: '原版',
  incendium: '烬域',
  stellarity: '繁星',
  atistructures: 'ATi结构',
  dt: 'D&T',
  structory: 'Structory',
  funpack: '整蛊包',
  other: '其他',
}

// 预构建 id→name 查询表
const nameMap = computed(() => {
  const map = {}
  for (const e of enchantments) {
    map[e.id] = e.name
  }
  return map
})

// 来源计数
const countBySource = computed(() => {
  const map = { '': enchantments.length }
  for (const f of sourceFilters) {
    if (!f.key) continue
    map[f.key] = enchantments.filter(e => e.source === f.key).length
  }
  return map
})

// 稀有度计数
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

// 过滤后的列表：来源筛选 + 品质筛选 + 搜索
const filteredItems = computed(() => {
  let list = enchantments

  // 来源筛选（始终生效）
  if (activeSource.value) {
    list = list.filter(e => e.source === activeSource.value)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    // 搜索时跨所有品质
    list = list.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.effect.toLowerCase().includes(q) ||
      e.equipment.toLowerCase().includes(q) ||
      e.id.toLowerCase().includes(q)
    )
  } else {
    // 品质筛选
    list = list.filter(e => e.rarity === activeRarity.value)
  }
  return list
})

const visibleItems = computed(() => filteredItems.value.slice(0, visibleCount.value))

const hasMore = computed(() => visibleCount.value < filteredItems.value.length)
const remaining = computed(() => filteredItems.value.length - visibleCount.value)

function rarityColor(key) {
  const r = rarities.find(r => r.key === key)
  return r ? r.color : '#999'
}

function rarityLabel(key) {
  const r = rarities.find(r => r.key === key)
  return r ? r.label : ''
}

function sourceLabel(key) {
  return sourceLabels[key] || key
}

function conflictNames(ids) {
  return ids.map(id => nameMap.value[id] || id).join('、')
}

function packLabel(key) {
  return packLabels[key] || key
}

function selectRarity(key) {
  activeRarity.value = key
  visibleCount.value = pageSize
}

function selectSource(key) {
  activeSource.value = key
  visibleCount.value = pageSize
}

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function loadMore() {
  visibleCount.value += pageSize
}

// 搜索或切换品质/来源时重置可见数量，并重新观察哨兵
watch([searchQuery, activeRarity, activeSource], () => {
  visibleCount.value = pageSize
  expandedId.value = null
  nextTick(() => {
    if (observer && sentinelRef.value) {
      observer.observe(sentinelRef.value)
    }
  })
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
  margin-bottom: 12px;
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
  transition: color 0.2s, background-color 0.2s, border-color 0.2s, transform 0.2s;
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

/* ===== 来源筛选栏 ===== */
.ench-source-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.ench-source-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  font-size: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
  white-space: nowrap;
}

.ench-source-tab:hover {
  border-color: var(--vp-c-brand-2);
  color: var(--vp-c-brand-1);
}

.ench-source-tab.active {
  font-weight: 600;
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.ench-source-tab-count {
  font-size: 10px;
  opacity: 0.6;
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

.ench-table tbody tr.ench-row:hover td {
  background: var(--vp-c-bg-soft);
  cursor: pointer;
}

.ench-table tbody tr.ench-row-expanded td {
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

.ench-row .col-source {
  white-space: nowrap;
}

.ench-row .col-conflict {
  text-align: center;
  width: 60px;
}

.ench-row .col-effect {
  line-height: 1.6;
}

/* 展开提示列 */
.ench-row .col-expand {
  width: 32px;
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 12px;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.ench-row:hover .col-expand {
  color: var(--vp-c-brand-1);
}

.ench-row.expanded .col-expand {
  color: var(--vp-c-brand-1);
}

.ench-table th.col-expand {
  width: 32px;
  background: transparent;
}

/* 来源标签 */
.ench-source-badge {
  display: inline-block;
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

/* 冲突图标 */
.ench-conflict-icon {
  cursor: help;
  font-size: 16px;
  display: inline-block;
}

.ench-conflict-none {
  color: var(--vp-c-text-3);
  font-size: 13px;
}

/* ===== 详情展开行 ===== */
.ench-detail-row td {
  padding: 0;
  background: var(--vp-c-bg-soft);
  border-bottom: 2px solid var(--vp-c-divider);
}

.ench-detail-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 14px 16px;
}

.ench-detail-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.ench-detail-label {
  color: var(--vp-c-text-3);
  font-size: 12px;
  white-space: nowrap;
}

.ench-detail-name {
  font-weight: 700;
  font-size: 14px;
}

.ench-detail-rarity {
  display: inline-block;
  font-size: 11px;
  color: #fff;
  padding: 1px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

.ench-detail-value {
  color: var(--vp-c-text-1);
}

.ench-detail-pack {
  display: inline-block;
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 10px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  white-space: nowrap;
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
  cursor: pointer;
  transition: background 0.15s;
}

.ench-card:hover {
  background: var(--vp-c-bg-soft);
}

.ench-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
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

.ench-card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
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

/* 卡片详情展开 */
.ench-card-detail {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  transition: color 0.2s, background-color 0.2s, border-color 0.2s, transform 0.2s;
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

  .ench-source-tabs {
    gap: 4px;
  }

  .ench-source-tab {
    padding: 2px 8px;
    font-size: 11px;
  }
}
</style>