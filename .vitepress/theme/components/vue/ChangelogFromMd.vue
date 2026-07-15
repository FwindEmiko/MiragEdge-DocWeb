<template>
  <div class="changelog-container">
    <!-- 加载状态 -->
    <div v-if="loading && !rawMarkdown" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载更新日志...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadMarkdown" class="retry-btn">重试</button>
    </div>

    <!-- 年份分组 -->
    <div v-for="yearGroup in groupedLogs" :key="yearGroup.year" class="year-group">
      <h2 class="year-title">
        <span class="year-icon">📅</span>
        {{ yearGroup.year }}年
      </h2>

      <!-- 月份分组 -->
      <div v-for="monthGroup in yearGroup.months" :key="monthGroup.month" class="month-group">
        <h3 class="month-title">{{ monthGroup.month }}月</h3>

        <!-- 日志条目 -->
        <div
          v-for="item in monthGroup.items"
          :key="item.date"
          class="log-card"
          :class="{ expanded: expandedItems.has(item.date) }"
        >
          <div class="log-header" @click="toggleItem(item.date)">
            <div class="log-date-version">
              <span class="log-date">{{ item.date }}</span>
              <span v-if="item.version" class="log-version">v{{ item.version }}</span>
            </div>
            <div class="log-summary">{{ item.summary || '暂无摘要' }}</div>
            <div class="log-meta">
              <span class="log-count">{{ item.details.length }}条更新</span>
              <span class="expand-icon">
                <span v-if="expandedItems.has(item.date)">−</span>
                <span v-else>+</span>
              </span>
            </div>
          </div>

          <div v-if="expandedItems.has(item.date)" class="log-content">
            <!-- 统计栏 -->
            <div class="stats-bar">
              <span v-for="(count, type) in getTypeCounts(item.details)" :key="type" class="stat-item" :class="'stat-' + type">
                {{ type }} {{ count }}
              </span>
            </div>

            <!-- 详情列表 -->
            <div class="details-list">
              <div
                v-for="(detail, idx) in item.details"
                :key="idx"
                class="detail-item"
                :class="getDetailClass(detail.type)"
              >
                <span class="detail-badge">{{ detail.type }}</span>
                <span class="detail-text" v-html="formatContent(detail.content)"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载更多 -->
    <div v-if="hasMore" class="load-more">
      <button @click="loadMore" :disabled="loading" class="load-more-btn">
        <span v-if="loading" class="spinner"></span>
        {{ loading ? '加载中...' : '加载更多更新' }}
      </button>
    </div>

    <div v-else-if="displayedCount > 0" class="no-more">
      <span class="end-icon">✨</span>
      已加载全部内容
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface LogDetail {
  type: string
  content: string
}

interface LogItem {
  date: string
  version?: string
  summary: string
  details: LogDetail[]
}

interface MonthGroup {
  month: number
  items: LogItem[]
}

interface YearGroup {
  year: number
  months: MonthGroup[]
}

const props = withDefaults(defineProps<{
  markdownUrl?: string
  initialCount?: number
  loadMoreCount?: number
}>(), {
  markdownUrl: '/logsdata.md',
  initialCount: 50,
  loadMoreCount: 20
})

const expandedItems = ref<Set<string>>(new Set())
const displayedCount = ref(props.initialCount)
const loading = ref(false)
const error = ref<string>('')
const rawMarkdown = ref<string>('')

// 解析 Markdown
const parseMarkdown = (content: string): LogItem[] => {
  const items: LogItem[] = []
  const lines = content.split('\n')
  let currentItem: LogItem | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // 跳过空行
    if (!line) {
      continue
    }

    // 跳过分隔线
    if (line === '---') {
      if (currentItem && currentItem.details.length > 0) {
        items.push(currentItem)
        currentItem = null
      }
      continue
    }

    // 跳过顶级的 # 标题（页面标题），但保留 ## 日期
    if (line.startsWith('#') && !line.startsWith('##')) {
      if (currentItem && currentItem.details.length > 0) {
        items.push(currentItem)
        currentItem = null
      }
      continue
    }

    // 匹配日期标题 ## 2026.3.19 或 ### 2026.3.8
    const dateMatch = line.match(/^#{2,3}\s+(\d{4})\.(\d+)(?:\.(\d+))?$/)
    if (dateMatch) {
      if (currentItem) items.push(currentItem)
      // 存储完整的年月日期，包含日期部分
      const fullDate = dateMatch[3]
        ? `${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]}`
        : `${dateMatch[1]}.${dateMatch[2]}`
      currentItem = {
        date: fullDate,
        summary: '',
        details: []
      }
      continue
    }

    // 匹配详情 [类型] 内容
    const detailMatch = line.match(/^\[([^\]]+)\]\s*(.+)$/)
    if (detailMatch && currentItem) {
      const type = detailMatch[1].trim()
      const detailContent = detailMatch[2].trim()
      currentItem.details.push({ type, content: detailContent })
      if (!currentItem.summary) {
        currentItem.summary = detailContent.substring(0, 50) + (detailContent.length > 50 ? '...' : '')
      }
    }
  }

  if (currentItem) items.push(currentItem)
  return items
}

const allLogs = computed(() => parseMarkdown(rawMarkdown.value))

// 分组
const groupedLogs = computed(() => {
  const logsToShow = allLogs.value.slice(0, displayedCount.value)
  const groups: YearGroup[] = []

  logsToShow.forEach(log => {
    const dateMatch = log.date.match(/^(\d{4})\.(\d+)/)
    if (!dateMatch) return
    const year = parseInt(dateMatch[1])
    const month = parseInt(dateMatch[2])

    let yearGroup = groups.find(g => g.year === year)
    if (!yearGroup) { yearGroup = { year, months: [] }; groups.push(yearGroup) }

    let monthGroup = yearGroup.months.find(m => m.month === month)
    if (!monthGroup) { monthGroup = { month, items: [] }; yearGroup.months.push(monthGroup) }

    monthGroup.items.push(log)
  })

  groups.sort((a, b) => b.year - a.year)
  groups.forEach(g => g.months.sort((a, b) => b.month - a.month))
  return groups
})

const hasMore = computed(() => displayedCount.value < allLogs.value.length)

const toggleItem = (date: string) => {
  if (expandedItems.value.has(date)) {
    expandedItems.value.delete(date)
  } else {
    expandedItems.value.add(date)
  }
}

// 统计每种类型的数量
const getTypeCounts = (details: LogDetail[]): Record<string, number> => {
  const counts: Record<string, number> = {}
  details.forEach(d => {
    const type = d.type.replace('新增', '添加').replace('优化', '调整')
    counts[type] = (counts[type] || 0) + 1
  })
  return counts
}

const getDetailClass = (type: string): string => {
  const map: Record<string, string> = {
    '添加': 'type-add', '新增': 'type-add',
    '修复': 'type-fix',
    '调整': 'type-adjust', '优化': 'type-adjust',
    '删除': 'type-delete',
    '兼容': 'type-compat',
    '网站': 'type-web', 'Website': 'type-web'
  }
  return map[type] || 'type-default'
}

const formatContent = (content: string): string => {
  return content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
}

const loadMarkdown = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(props.markdownUrl)
    if (!res.ok) throw new Error(`加载失败: ${res.status}`)
    rawMarkdown.value = await res.text()
    const parsed = parseMarkdown(rawMarkdown.value)
    // 默认展开前3个条目
    parsed.slice(0, 3).forEach(item => expandedItems.value.add(item.date))
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载数据失败'
    console.error('加载日志失败:', e)
  } finally {
    loading.value = false
  }
}

const loadMore = () => {
  displayedCount.value += props.loadMoreCount
}

defineExpose({ expandAll: () => allLogs.value.forEach(l => expandedItems.value.add(l.date)), collapseAll: () => expandedItems.value.clear() })

onMounted(() => loadMarkdown())
</script>

<style scoped>
.changelog-container {
  --card-bg: var(--vp-c-bg-soft);
  --card-border: var(--vp-c-divider);
  --brand: var(--vp-c-brand);
  --brand-light: var(--vp-c-brand-light);
  --brand-dark: var(--vp-c-brand-dark);
  margin: 1.5rem 0;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: var(--vp-c-text-2);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid var(--vp-c-divider);
  border-top-color: var(--brand);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 2rem;
  background: rgba(245, 108, 108, 0.1);
  border-radius: 8px;
  color: #f56c6c;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: var(--brand);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
}

.year-group {
  margin-bottom: 2.5rem;
}

.year-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 1.2rem;
  padding-bottom: 0.6rem;
  border-bottom: 2px solid var(--vp-c-brand);
}

.year-icon {
  font-size: 1.4rem;
}

.month-group {
  margin-bottom: 1.5rem;
  margin-left: 0.5rem;
}

.month-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 0.8rem;
  padding-left: 0.5rem;
  border-left: 3px solid var(--vp-c-brand-light);
}

.log-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  margin-bottom: 0.8rem;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.log-card:hover {
  border-color: var(--brand-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
}

.log-card.expanded {
  border-color: var(--brand);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
}

.log-header {
  display: flex;
  align-items: center;
  padding: 1rem 1.2rem;
  cursor: pointer;
  transition: background 0.2s;
}

.log-header:hover {
  background: var(--vp-c-bg-mute);
}

.log-date-version {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 110px;
  gap: 4px;
}

.log-date {
  font-weight: 700;
  color: var(--brand);
  font-size: 1.05rem;
}

.log-version {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg);
  padding: 2px 8px;
  border-radius: 10px;
}

.log-summary {
  flex: 1;
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
  padding: 0 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.log-count {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg);
  padding: 4px 10px;
  border-radius: 12px;
}

.expand-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border-radius: 50%;
  transition: all 0.2s;
}

.log-card.expanded .expand-icon {
  background: var(--brand);
  color: white;
}

.log-content {
  padding: 0 1.2rem 1.2rem;
  background: var(--vp-c-bg);
  border-top: 1px solid var(--card-border);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.stats-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.8rem 0;
  border-bottom: 1px dashed var(--card-border);
  margin-bottom: 0.8rem;
}

.stat-item {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.stat-添加, .stat-add { background: #e0f5e9; color: #42b983; }
.stat-新增 { background: #e8f5e9; color: #43a047; }
.stat-修复, .stat-fix { background: #ffebee; color: #e53935; }
.stat-调整, .stat-adjust { background: #fff8e1; color: #ff8f00; }
.stat-优化 { background: #e3f2fd; color: #1e88e5; }
.stat-删除, .stat-delete { background: #f5f5f5; color: #757575; }
.stat-兼容, .stat-compat { background: #f3e5f5; color: #8e24aa; }
.stat-网站, .stat-web, .stat-Website { background: #e0f7fa; color: #00acc1; }

.details-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  font-size: 0.9rem;
  line-height: 1.5;
  padding: 0.4rem 0;
}

.detail-badge {
  flex-shrink: 0;
  font-weight: 600;
  min-width: 48px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  text-align: center;
}

.type-add .detail-badge, .type-add .detail-text { color: #42b983; }
.type-add .detail-badge { background: #e8f5e9; }
.type-fix .detail-badge, .type-fix .detail-text { color: #e53935; }
.type-fix .detail-badge { background: #ffebee; }
.type-adjust .detail-badge, .type-adjust .detail-text { color: #ff8f00; }
.type-adjust .detail-badge { background: #fff8e1; }
.type-delete .detail-badge, .type-delete .detail-text { color: #757575; }
.type-delete .detail-badge { background: #f5f5f5; }
.type-compat .detail-badge, .type-compat .detail-text { color: #8e24aa; }
.type-compat .detail-badge { background: #f3e5f5; }
.type-web .detail-badge, .type-web .detail-text { color: #00acc1; }
.type-web .detail-badge { background: #e0f7fa; }
.type-default .detail-badge { background: var(--vp-c-bg-soft); color: var(--vp-c-text-2); }

.detail-text {
  color: var(--vp-c-text-1);
  word-break: break-word;
}

.detail-text :deep(a) {
  color: var(--brand);
  text-decoration: none;
}

.detail-text :deep(a:hover) {
  text-decoration: underline;
}

.load-more {
  text-align: center;
  margin-top: 2rem;
}

.load-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 2rem;
  font-size: 0.95rem;
  font-weight: 500;
  background: linear-gradient(135deg, var(--brand), var(--brand-dark));
  color: white;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.load-more-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05);
}

.load-more-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.no-more {
  text-align: center;
  margin-top: 2rem;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
}

.end-icon {
  display: inline-block;
  margin-right: 0.3rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 响应式 */
@media (max-width: 640px) {
  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .log-summary {
    padding: 0;
    white-space: normal;
  }
  .log-meta {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
