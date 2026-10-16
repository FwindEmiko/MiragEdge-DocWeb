<script setup lang="ts">
/**
 * DataTable — 可筛选的数据表格
 *
 * 用于「拆页解决不了」的大表：单一维度、行数多（数百行）、读者需要按关键词或分类筛选的场景。
 * 例如全插件经济速查表、协议字段对照表、581 个已注册物品表、鱼类图鉴。
 *
 * 用法（md 里直接写）：
 *   <DataTable :columns="[{key:'name',label:'物品'},{key:'value',label:'价值'}]" :rows="rows" />
 * rows 的元素是普通对象，单元格取 row[column.key]，非字符串会 String() 化。
 *
 * 特性：客户端筛选 + 可选分类切换 + 分页。不引入任何新依赖。
 * 主题：颜色全部走 VitePress CSS 变量，暗色模式自动跟随。
 */
import { computed, ref, useId } from 'vue'

interface Column {
  /** 行对象的取值键 */
  key: string
  /** 表头文案 */
  label: string
  /** 单元格对齐，默认左对齐 */
  align?: 'left' | 'center' | 'right'
  /** 是否允许参与关键词筛选项（默认 true；数值列建议设 false） */
  searchable?: boolean
}

const props = withDefaults(defineProps<{
  columns: Column[]
  rows: Array<Record<string, unknown>>
  /** 可选的分类筛选项，取行对象上该键的值作为分类名 */
  groupKey?: string
  /** 每页行数；设为 0 表示不分页 */
  pageSize?: number
  /** 搜索框占位文案 */
  searchPlaceholder?: string
  /** 表格下方的说明文字，可写数据口径与来源 */
  note?: string
}>(), {
  groupKey: '',
  pageSize: 50,
  searchPlaceholder: '输入关键词筛选',
  note: '',
})

const query = ref('')
const activeGroup = ref('')
const page = ref(1)
const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '')

const searchableKeys = computed(() =>
  props.columns.filter((c) => c.searchable !== false).map((c) => c.key)
)

const groups = computed(() => {
  if (!props.groupKey) return []
  const set = new Set<string>()
  for (const r of props.rows) {
    const v = r[props.groupKey]
    if (v !== undefined && v !== null && v !== '') set.add(String(v))
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let out = props.rows
  if (props.groupKey && activeGroup.value) {
    out = out.filter((r) => String(r[props.groupKey] ?? '') === activeGroup.value)
  }
  if (q) {
    out = out.filter((r) =>
      searchableKeys.value.some((k) => String(r[k] ?? '').toLowerCase().includes(q))
    )
  }
  return out
})

const pageCount = computed(() =>
  props.pageSize > 0 ? Math.max(1, Math.ceil(filtered.value.length / props.pageSize)) : 1
)

const visible = computed(() => {
  if (props.pageSize <= 0) return filtered.value
  const start = (page.value - 1) * props.pageSize
  return filtered.value.slice(start, start + props.pageSize)
})

function setQuery(v: string) {
  query.value = v
  page.value = 1
}
function setGroup(g: string) {
  activeGroup.value = activeGroup.value === g ? '' : g
  page.value = 1
}
</script>

<template>
  <div class="data-table">
    <div v-if="searchPlaceholder || groups.length" class="dt-toolbar">
      <input
        v-if="searchPlaceholder"
        class="dt-search"
        type="search"
        :placeholder="searchPlaceholder"
        :value="query"
        :aria-label="searchPlaceholder"
        @input="setQuery(($event.target as HTMLInputElement).value)"
      >
      <div v-if="groups.length" class="dt-groups" role="group">
        <button
          v-for="g in groups"
          :key="g"
          class="dt-group"
          :class="{ active: activeGroup === g }"
          type="button"
          @click="setGroup(g)"
        >
          {{ g }}
        </button>
      </div>
      <span class="dt-count">{{ filtered.length }} 行</span>
    </div>

    <div class="dt-scroll">
      <table>
        <thead>
          <tr>
            <th
              v-for="c in columns"
              :key="c.key"
              :style="{ textAlign: c.align ?? 'left' }"
            >
              {{ c.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(r, i) in visible" :key="`${instanceId}-${page}-${i}`">
            <td
              v-for="c in columns"
              :key="c.key"
              :style="{ textAlign: c.align ?? 'left' }"
            >
              <slot :name="c.key" :row="r" :value="r[c.key]">{{ r[c.key] ?? '—' }}</slot>
            </td>
          </tr>
          <tr v-if="!visible.length">
            <td :colspan="columns.length" class="dt-empty">没有匹配的行</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="pageCount > 1" class="dt-pager">
      <button type="button" :disabled="page <= 1" @click="page--">上一页</button>
      <span>第 {{ page }} / {{ pageCount }} 页</span>
      <button type="button" :disabled="page >= pageCount" @click="page++">下一页</button>
    </div>

    <p v-if="note" class="dt-note">{{ note }}</p>
  </div>
</template>

<style scoped>
.data-table {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
}

.dt-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.dt-search {
  flex: 1 1 200px;
  min-width: 160px;
  padding: 6px 10px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  outline: none;
}

.dt-search:focus {
  border-color: var(--vp-c-brand-1);
}

.dt-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.dt-group {
  padding: 4px 10px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  cursor: pointer;
}

.dt-group:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

.dt-group.active {
  color: var(--vp-c-white, #fff);
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.dt-count {
  font-size: 12px;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

.dt-scroll {
  overflow-x: auto;
}

.data-table table {
  width: 100%;
  margin: 0;
  border-collapse: collapse;
  font-size: 14px;
  display: table;
}

.data-table th,
.data-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  vertical-align: top;
}

.data-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 600;
  white-space: nowrap;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-alt);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-table tbody tr:hover td {
  background: var(--vp-c-default-soft, var(--vp-c-bg-alt));
}

.dt-empty {
  text-align: center;
  color: var(--vp-c-text-3);
  padding: 24px 12px;
}

.dt-pager {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  padding: 10px 12px;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.dt-pager button {
  padding: 4px 12px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
}

.dt-pager button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.dt-note {
  margin: 0;
  padding: 8px 12px;
  font-size: 12px;
  color: var(--vp-c-text-3);
  border-top: 1px solid var(--vp-c-divider);
}

@media (max-width: 640px) {
  .data-table th,
  .data-table td {
    padding: 6px 8px;
    font-size: 13px;
  }

  .dt-search {
    flex-basis: 100%;
  }
}
</style>
