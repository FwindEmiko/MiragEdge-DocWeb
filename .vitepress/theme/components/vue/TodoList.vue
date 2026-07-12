<script setup lang="ts">
/**
 * TodoList — 待办事项卡片视图
 *
 * 数据源：/public/data/todo.json（vite build 时通过 fetch 加载）
 *
 * 视觉对齐：
 * - 继承 FoodEntry 卡片风格（圆角 + 边框 + 头部信息条）
 * - 状态徽章（5 tone：neutral / active / warn / danger / think / done）
 * - 类标签 chip（添加/调整/修复/升级/兼容 5 种颜色）
 * - 顶部筛选栏（按类 toggle，0 个选中 = 显示全部）
 * - 备注默认折叠（>120 字才出现展开按钮）
 * - 移动端自动堆叠 + 文字省略
 *
 * 不使用的元素：emoji / 表情符号 / 表格行 / 任何装饰字符
 */
import { ref, computed, onMounted } from 'vue'

interface TodoItem {
  id: string
  due?: string
  date?: string
  title: string
  scope?: string
  scope_legacy?: string
  category?: string
  status?: string
  note?: string
}

interface TodoGroup {
  key: string
  title: string
  subtitle?: string
  items: TodoItem[]
}

interface TodoData {
  version: string
  subtitle?: string
  categories: Record<string, { label: string; color: string }>
  statuses:   Record<string, { label: string; tone: string; icon: string }>
  groups:      TodoGroup[]
  completed:   TodoGroup[]
}

const data = ref<TodoData | null>(null)
const loadError = ref<string>('')
const activeFilters = ref<Set<string>>(new Set())
const expandedNotes = ref<Set<string>>(new Set())

onMounted(async () => {
  try {
    const res = await fetch('/data/todo.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json() as TodoData
    data.value = json
  } catch (e: any) {
    loadError.value = `无法加载待办数据：${e?.message ?? e}`
  }
})

/** 切换筛选类；同色点击 = 取消 */
const toggleFilter = (cat: string) => {
  const next = new Set(activeFilters.value)
  if (next.has(cat)) next.delete(cat)
  else next.add(cat)
  activeFilters.value = next
}

/** 单选过滤；如未选 = 全部显示 */
const matchesFilter = (item: TodoItem): boolean => {
  if (activeFilters.value.size === 0) return true
  if (!item.category) return false
  return activeFilters.value.has(item.category)
}

/** 备注折叠展开 */
const toggleNote = (id: string) => {
  const next = new Set(expandedNotes.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedNotes.value = next
}

/** 状态 tone → 颜色 token */
const statusColors: Record<string, { color: string; bg: string; border: string }> = {
  neutral: { color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.12)', border: 'rgba(156, 163, 175, 0.3)' },
  active:  { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.14)',  border: 'rgba(59, 130, 246, 0.35)' },
  warn:    { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)',  border: 'rgba(245, 158, 11, 0.3)' },
  danger:  { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.14)',   border: 'rgba(239, 68, 68, 0.35)' },
  think:   { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)',  border: 'rgba(168, 85, 247, 0.3)' },
  done:    { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.14)',   border: 'rgba(34, 197, 94, 0.3)' },
}

const getStatusStyle = (status?: string) => {
  const cfg = data.value?.statuses?.[status ?? '']
  const tone = cfg?.tone ?? 'neutral'
  return { cfg, ...(statusColors[tone] ?? statusColors.neutral) }
}

const getCategoryColor = (cat?: string): string => {
  return data.value?.categories?.[cat ?? '']?.color ?? '#9ca3af'
}

/** 备注重要路径：长才截断 */
const NOTE_PREVIEW_LEN = 90
const shouldCollapse = (note?: string) => !!note && note.length > NOTE_PREVIEW_LEN
const notePreview = (note?: string) => {
  if (!note) return ''
  return note.length > NOTE_PREVIEW_LEN ? note.slice(0, NOTE_PREVIEW_LEN) + '…' : note
}

/** 已完成项目：旧字段 scope 兼容新版 */
const getScope = (item: TodoItem): string => item.scope ?? item.scope_legacy ?? ''

/** 过滤后的分组计算 */
const filteredGroups = computed(() => {
  if (!data.value) return [] as TodoGroup[]
  return data.value.groups
    .map((g) => ({ ...g, items: g.items.filter(matchesFilter) }))
    .filter((g) => g.items.length > 0)
})

const filteredCompleted = computed(() => {
  if (!data.value) return [] as TodoGroup[]
  return data.value.completed
    .map((g) => ({ ...g, items: g.items.filter(matchesFilter) }))
    .filter((g) => g.items.length > 0)
})
</script>

<template>
  <div class="todo-list-root">
    <div v-if="loadError" class="todo-error">{{ loadError }}</div>
    <div v-else-if="!data" class="todo-loading">加载待办…</div>

    <template v-else>
      <p v-if="data.subtitle" class="todo-subtitle">{{ data.subtitle }}</p>

      <!-- 顶部筛选栏 -->
      <div class="todo-filter" role="group" aria-label="按类别筛选">
        <span class="todo-filter-label">类别筛选</span>
        <button
          v-for="(cfg, key) in data.categories"
          :key="key"
          type="button"
          class="todo-chip"
          :class="{ 'is-active': activeFilters.has(key as string) }"
          :style="{
            color: activeFilters.has(key as string) ? '#fff' : cfg.color,
            background: activeFilters.has(key as string) ? cfg.color : `${cfg.color}1f`,
            borderColor: cfg.color,
          }"
          @click="toggleFilter(key as string)"
        >
          {{ cfg.label }}
        </button>
        <button
          v-if="activeFilters.size > 0"
          type="button"
          class="todo-chip todo-chip-clear"
          @click="activeFilters = new Set()"
        >
          清除筛选
        </button>
      </div>

      <!-- 待完成 -->
      <section v-for="group in filteredGroups" :key="`p-${group.key}`" class="todo-section">
        <header class="todo-section-head">
          <h3 class="todo-section-title">{{ group.title }}</h3>
          <span v-if="group.subtitle" class="todo-section-sub">{{ group.subtitle }}</span>
        </header>
        <div class="todo-cards">
          <article
            v-for="item in group.items"
            :key="item.id"
            class="todo-card"
            :style="{ '--accent': getCategoryColor(item.category) }"
          >
            <div class="todo-card-head">
              <h4 class="todo-card-title">
                <span v-if="item.due" class="todo-due">{{ item.due }}</span>
                <span class="todo-title-text">{{ item.title }}</span>
              </h4>
              <span
                v-if="item.status"
                class="todo-status"
                :style="{
                  color: getStatusStyle(item.status).color,
                  background: getStatusStyle(item.status).bg,
                  borderColor: getStatusStyle(item.status).border,
                }"
              >
                <span class="todo-status-icon">{{ getStatusStyle(item.status).cfg?.icon }}</span>
                {{ getStatusStyle(item.status).cfg?.label }}
              </span>
            </div>

            <div class="todo-meta">
              <span v-if="item.scope" class="todo-scope">{{ getScope(item) }}</span>
              <span
                v-if="item.category"
                class="todo-cat"
                :style="{ color: getCategoryColor(item.category), borderColor: getCategoryColor(item.category) }"
              >[{{ data.categories[item.category]?.label ?? item.category }}]</span>
            </div>

            <div v-if="item.note" class="todo-note">
              <template v-if="!shouldCollapse(item.note) || expandedNotes.has(item.id)">
                <span class="todo-note-text">{{ item.note }}</span>
                <button
                  v-if="shouldCollapse(item.note)"
                  type="button"
                  class="todo-note-toggle"
                  @click="toggleNote(item.id)"
                >
                  收起
                </button>
              </template>
              <template v-else>
                <span class="todo-note-text">{{ notePreview(item.note) }}</span>
                <button
                  type="button"
                  class="todo-note-toggle"
                  @click="toggleNote(item.id)"
                >
                  展开
                </button>
              </template>
            </div>
          </article>
        </div>
      </section>

      <!-- 已完成 -->
      <section v-for="group in filteredCompleted" :key="`d-${group.key}`" class="todo-section todo-section-done">
        <header class="todo-section-head">
          <h3 class="todo-section-title">{{ group.title }}</h3>
        </header>
        <div class="todo-cards">
          <article
            v-for="item in group.items"
            :key="item.id"
            class="todo-card todo-card-done"
          >
            <div class="todo-card-head">
              <h4 class="todo-card-title">
                <span v-if="item.date" class="todo-due">{{ item.date }}</span>
                <span class="todo-title-text">{{ item.title }}</span>
              </h4>
              <span
                class="todo-status"
                :style="{
                  color: getStatusStyle('已完成').color,
                  background: getStatusStyle('已完成').bg,
                  borderColor: getStatusStyle('已完成').border,
                }"
              >
                <span class="todo-status-icon">{{ getStatusStyle('已完成').cfg?.icon }}</span>
                已完成
              </span>
            </div>

            <div class="todo-meta">
              <span v-if="item.scope" class="todo-scope">{{ getScope(item) }}</span>
              <span
                v-if="item.category"
                class="todo-cat"
                :style="{ color: getCategoryColor(item.category), borderColor: getCategoryColor(item.category) }"
              >[{{ data.categories[item.category]?.label ?? item.category }}]</span>
            </div>

            <div v-if="item.note" class="todo-note">
              <span class="todo-note-text">{{ item.note }}</span>
            </div>
          </article>
        </div>
      </section>

      <p class="todo-footer-hint">
        超过 15 天的完成条目滚动归档至 <a href="/develop/logs">更新日志</a>。
        本列表数据通过 <a href="https://github.com/fwindemiko/MiragEdge-DocWeb/edit/main/public/data/todo.json">todo.json</a> 维护。
      </p>
    </template>
  </div>
</template>

<style scoped>
/* ============ root ============ */
.todo-list-root {
  margin: 12px 0 24px;
}

.todo-error {
  padding: 16px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  font-size: 14px;
}

.todo-loading {
  padding: 24px;
  text-align: center;
  color: var(--vp-c-text-2, rgba(255,255,255,0.5));
  font-size: 13px;
}

.todo-subtitle {
  margin: 0 0 16px;
  padding: 12px 14px;
  border-left: 3px solid var(--vp-c-brand, #E05252);
  background: var(--vp-c-brand-soft, rgba(224, 82, 82, 0.08));
  border-radius: 4px;
  color: var(--vp-c-text-2, rgba(255,255,255,0.65));
  font-size: 13px;
  line-height: 1.7;
}

/* ============ 筛选栏 ============ */
.todo-filter {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, rgba(0,0,0,0.03));
  border: 1px solid var(--vp-c-divider, rgba(0,0,0,0.08));
}

.dark .todo-filter {
  background: rgba(255,255,255,0.03);
  border-color: rgba(255,255,255,0.08);
}

.todo-filter-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2, rgba(255,255,255,0.5));
  margin-right: 4px;
}

.todo-chip {
  display: inline-flex;
  align-items: center;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 14px;
  border-width: 1px;
  border-style: solid;
  cursor: pointer;
  transition: transform 0.1s ease, filter 0.15s ease;
  white-space: nowrap;
  user-select: none;
}

.todo-chip:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.todo-chip:active {
  transform: translateY(0);
}

.todo-chip-clear {
  color: var(--vp-c-text-2, rgba(255,255,255,0.5)) !important;
  background: transparent !important;
  border-color: var(--vp-c-divider, rgba(0,0,0,0.2)) !important;
  margin-left: auto;
}

/* ============ 分组 ============ */
.todo-section {
  margin-bottom: 32px;
}

.todo-section-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--vp-c-divider, rgba(0,0,0,0.1));
}

.todo-section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  letter-spacing: 0.5px;
}

.todo-section-sub {
  font-size: 12px;
  color: var(--vp-c-text-2, rgba(255,255,255,0.5));
}

.todo-section-done .todo-section-title {
  color: #22c55e;
}

/* ============ 卡片容器 ============ */
.todo-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 12px;
}

/* ============ 卡片 ============ */
.todo-card {
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider, rgba(0,0,0,0.1));
  border-left: 3px solid var(--accent, var(--vp-c-brand, #E05252));
  background: var(--vp-c-bg-soft, rgba(0,0,0,0.02));
  padding: 0;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  overflow: hidden;
}

.dark .todo-card {
  background: rgba(255,255,255,0.03);
}

.todo-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border-color: var(--accent, var(--vp-c-brand));
}

/* 头部 */
.todo-card-head {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(0,0,0,0.02);
  border-bottom: 1px solid var(--vp-c-divider, rgba(0,0,0,0.06));
}

.dark .todo-card-head {
  background: rgba(255,255,255,0.02);
}

.todo-card-title {
  flex: 1;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
}

.todo-due {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-text-2, rgba(255,255,255,0.5));
  background: rgba(0,0,0,0.06);
  padding: 2px 6px;
  border-radius: 3px;
  letter-spacing: 0;
  white-space: nowrap;
}

.dark .todo-due {
  background: rgba(255,255,255,0.08);
}

.todo-title-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  word-break: break-word;
}

/* 状态徽章 */
.todo-status {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  border-width: 1px;
  border-style: solid;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.todo-status-icon {
  font-weight: 900;
  font-size: 10px;
}

/* meta */
.todo-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 14px;
}

.todo-scope {
  font-size: 11px;
  color: var(--vp-c-text-2, rgba(255,255,255,0.55));
  font-weight: 500;
}

.todo-cat {
  font-size: 11px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 3px;
  border-width: 1px;
  border-style: solid;
  letter-spacing: 0.5px;
}

/* 备注 */
.todo-note {
  padding: 8px 14px 12px;
  font-size: 12px;
  color: var(--vp-c-text-2, rgba(255,255,255,0.7));
  line-height: 1.7;
  border-top: 1px dashed var(--vp-c-divider, rgba(0,0,0,0.05));
}

.todo-note-text {
  word-break: break-word;
}

.todo-note-toggle {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 8px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-brand, #E05252);
  background: var(--vp-c-brand-soft, rgba(224, 82, 82, 0.1));
  border: 1px solid var(--vp-c-brand, rgba(224, 82, 82, 0.3));
  border-radius: 3px;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.todo-note-toggle:hover {
  filter: brightness(1.1);
}

/* 已完成卡片视觉弱化 */
.todo-card-done {
  opacity: 0.78;
  border-left-color: #22c55e !important;
}

.todo-card-done .todo-card-head {
  background: rgba(34, 197, 94, 0.06);
}

.todo-card-done .todo-title-text {
  text-decoration: line-through;
  text-decoration-color: rgba(34, 197, 94, 0.6);
  text-decoration-thickness: 1.5px;
  text-decoration-skip-ink: none;
}

/* 页脚 */
.todo-footer-hint {
  margin: 24px 0 0;
  padding: 12px 14px;
  border-radius: 6px;
  font-size: 12px;
  color: var(--vp-c-text-2, rgba(255,255,255,0.5));
  background: rgba(0,0,0,0.03);
}

.dark .todo-footer-hint {
  background: rgba(255,255,255,0.03);
}

.todo-footer-hint a {
  color: var(--vp-c-brand, #E05252);
  text-decoration: none;
  border-bottom: 1px dashed currentColor;
}

.todo-footer-hint a:hover {
  border-bottom-style: solid;
}

/* ============ 移动端 ============ */
@media (max-width: 640px) {
  .todo-cards {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .todo-card-head {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    padding: 10px 12px;
  }

  .todo-card-title {
    font-size: 13.5px;
  }

  .todo-status {
    align-self: flex-start;
  }

  .todo-meta {
    padding: 6px 12px;
  }

  .todo-note {
    padding: 6px 12px 10px;
  }

  .todo-filter {
    padding: 10px 12px;
    gap: 6px;
  }

  .todo-chip-clear {
    margin-left: 0;
  }

  .todo-section-title {
    font-size: 16px;
  }
}

/* 减少动效 */
@media (prefers-reduced-motion: reduce) {
  .todo-chip,
  .todo-card,
  .todo-note-toggle {
    transition: none;
  }
}
</style>
