<template>
  <div class="github-activity">
    <h3 class="activity-title">
      <span class="title-icon">
        <svg viewBox="0 0 16 16" fill="currentColor" width="20" height="20">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
      </span>
      GitHub 仓库活跃度
      <span class="subtitle">过去 3 个月</span>
    </h3>

    <div v-if="loading" class="loading-state">
      <div class="loading-bar"></div>
      <span>正在获取仓库活跃数据...</span>
    </div>

    <div v-else-if="!error" class="activity-content">
      <div class="summary-row">
        <div class="summary-item">
          <span class="summary-value">{{ totalCommits }}</span>
          <span class="summary-label">总提交数</span>
        </div>
        <div class="summary-item">
          <span class="summary-value">{{ avgWeekly }}</span>
          <span class="summary-label">周均提交</span>
        </div>
        <div class="summary-item">
          <span class="summary-value">{{ activeWeeks }}/{{ chartData.length }}</span>
          <span class="summary-label">活跃周数</span>
        </div>
      </div>

      <div class="chart-container">
        <div v-for="(week, idx) in chartData" :key="week.week" class="bar-column" :title="week.label" role="img" :aria-label="week.label">

          <div class="bar-wrap" :style="{ height: week.barPx + 'px' }">
            <div v-if="week.segments && week.segments.length > 0" class="bar-segments">
              <div v-for="seg in week.segments" :key="seg.login" class="bar-segment" :style="{ height: seg.barPx + 'px', backgroundColor: seg.color }" :title="seg.login + ': ' + seg.commits + ' 次提交'">
              </div>
            </div>
            <div v-else class="bar-empty"></div>
          </div>

          </div>
          <div class="bar-label">{{ week.shortLabel }}</div>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-state">
      <span>⚠ 暂时无法获取仓库活跃数据</span>
      <button class="retry-btn" @click="fetchData">重新加载</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = withDefaults(defineProps<{
  repo?: string
}>(), { repo: 'fwindemiko/MiragEdge-DocWeb' })

interface RawWeek { total: number; week: number }
interface SegmentData {
  login: string; commits: number; barPx: number; color: string
}

interface ContributorData {
  login: string; totalCommits: number; color: string
}

interface WeekData {
  week: number; total: number; label: string
  shortLabel: string; commits: number; percent: number
  barPx: number
}

const loading = ref(true)
const error = ref(false)
const rawData = ref<RawWeek[]>([])
const controller = new AbortController()


const MAX_BAR_PX = 120
const CONTRIBUTOR_COLORS = [
  "#4CAF50", "#2196F3", "#FF9800", "#9C27B0",
  "#F44336", "#00BCD4", "#FF5722", "#3F51B5",
]


const chartData = computed<WeekData[]>(() => {
  if (!rawData.value.length) return []
  const last12 = rawData.value.slice(-12)
  const maxCommits = Math.max(...last12.map(w => w.total), 1)
  return last12.map(w => {
    const d = new Date(w.week * 1000)
    const month = d.getMonth() + 1, day = d.getDate()
    return {
      week: w.week, total: w.total,
      label: month + '月' + day + '日 - ' + w.total + ' 次提交',
      shortLabel: month + '/' + day,
      commits: w.total, percent: (w.total / maxCommits) * 100,
      barPx: Math.max((w.total / maxCommits) * MAX_BAR_PX, 2)
    }
  })
})

const totalCommits = computed(() => chartData.value.reduce((s, w) => s + w.commits, 0))
const avgWeekly = computed(() => {
  const len = chartData.value.length
  return len ? Math.round(totalCommits.value / len) : 0
})
const activeWeeks = computed(() => chartData.value.filter(w => w.commits > 0).length)

let retryCount = 0
const MAX_RETRIES = 2

async function fetchData() {
  try {
    loading.value = true
    error.value = false
    const repo = props.repo

    const res = await fetch('https://api.github.com/repos/' + repo + '/stats/contributors', {

      signal: controller.signal
    })

    // 处理 HTTP 202 — GitHub 还在计算中
    if (res.status === 202) {
      if (retryCount < MAX_RETRIES) {
        retryCount++
        await new Promise(r => setTimeout(r, 3000))
        return fetchData()
      }
      throw new Error('GitHub stats temporarily unavailable (timed out)')
    }

    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) throw new Error('No data')
    rawData.value = data
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return
    console.error('GitHub Activity fetch failed:', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

onUnmounted(() => controller.abort())
onMounted(fetchData)
</script>

<style scoped>
.github-activity { margin: 3rem 0; padding: 2rem; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); border-radius: 12px; }
.activity-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1.15rem; font-weight: 600; color: var(--vp-c-text-1); margin: 0 0 1.5rem 0; }
.title-icon { color: var(--vp-c-brand); display: flex; flex-shrink: 0; }
.subtitle { font-size: 0.85rem; font-weight: 400; color: var(--vp-c-text-2); margin-left: auto; }
.loading-state { display: flex; flex-direction: column; align-items: center; gap: 1rem; padding: 2rem; color: var(--vp-c-text-2); font-size: 0.9rem; }
.loading-bar { width: 200px; height: 4px; background: var(--vp-c-divider); border-radius: 2px; overflow: hidden; position: relative; }
.loading-bar::after { content: ""; position: absolute; width: 40%; height: 100%; background: var(--vp-c-brand); border-radius: 2px; animation: loadingSlide 1.2s ease-in-out infinite; }
@keyframes loadingSlide { 0% { left: -40%; } 100% { left: 100%; } }
.summary-row { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--vp-c-divider); }
.summary-item { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.summary-value { font-size: 1.4rem; font-weight: 700; color: var(--vp-c-brand); line-height: 1; }
.summary-label { font-size: 0.78rem; color: var(--vp-c-text-2); }
.chart-container { display: flex; align-items: flex-end; gap: 4px; height: 140px; padding: 0 4px; }
.bar-column { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 0; cursor: default; }
.bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; position: relative; }
.bar-segments { position: absolute; bottom: 0; left: 0; right: 0; height: 100%; display: flex; flex-direction: column-reverse; }
.bar-segment { width: 70%; margin: 0 auto; min-height: 2px; border-radius: 3px 3px 1px 1px; transition: all 0.3s ease; flex-shrink: 0; }
.bar-column:hover .bar-segment { opacity: 1 !important; filter: brightness(1.15); }
.bar-empty { width: 70%; height: 100%; background: linear-gradient(180deg, var(--vp-c-brand-2, #7c5cfc), var(--vp-c-brand)); border-radius: 3px 3px 1px 1px; min-height: 2px; }
.contributors-legend { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--vp-c-divider); }
.legend-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--vp-c-text-2); }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.legend-name { font-weight: 600; color: var(--vp-c-text-1); }
.legend-commits { color: var(--vp-c-text-3); }
.bar { width: 70%; min-height: 2px; max-height: 100%; background: linear-gradient(180deg, var(--vp-c-brand-2, #7c5cfc), var(--vp-c-brand)); border-radius: 3px 3px 1px 1px; transition: height 0.3s ease, opacity 0.3s ease; }

.bar-label { font-size: 0.65rem; color: var(--vp-c-text-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; text-align: center; }
.error-state { display: flex; justify-content: center; align-items: center; padding: 2rem; color: var(--vp-c-text-2); font-size: 0.9rem; gap: 0.5rem; }
.retry-btn { padding: 4px 12px; font-size: 0.8rem; color: var(--vp-c-brand); background: transparent; border: 1px solid var(--vp-c-brand); border-radius: 6px; cursor: pointer; transition: all 0.2s; }
.retry-btn:hover { background: var(--vp-c-brand); color: white; }

.dark .bar-empty { background: linear-gradient(180deg, var(--vp-c-brand-2), var(--vp-c-brand)); }

@media (max-width: 640px) { .github-activity { padding: 1.25rem; margin: 2rem 0; } .chart-container { height: 100px; gap: 2px; } .bar { width: 80%; } .summary-row { gap: 1rem; } .summary-value { font-size: 1.2rem; } }
</style>
