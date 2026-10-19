<template>
  <div class="ts">
    <div class="ts-bar">
      <input
        v-model="q"
        class="ts-input"
        type="search"
        placeholder="搜物品：末影合金、铁胸甲、附魔书…"
        aria-label="搜索交易物品"
      />
      <span class="ts-count">{{ rows.length }} 条</span>
    </div>

    <div class="ts-group" role="group" aria-label="按职业筛选">
      <button
        v-for="p in allProfessions"
        :key="p"
        class="ts-chip"
        :class="{ on: profs.has(p) }"
        :aria-pressed="profs.has(p)"
        @click="toggleProf(p)"
      >{{ p }}</button>
      <button v-if="profs.size || levels.size" class="ts-chip ts-reset" @click="reset">清除筛选</button>
    </div>

    <div class="ts-group" role="group" aria-label="按等级筛选">
      <button
        v-for="l in [1, 2, 3, 4, 5]"
        :key="l"
        class="ts-chip"
        :class="{ on: levels.has(l) }"
        :aria-pressed="levels.has(l)"
        @click="toggleLevel(l)"
      >{{ l }} 级</button>
    </div>

    <p v-if="error" class="ts-hint">交易数据加载失败：{{ error }}</p>
    <p v-else-if="!rows.length" class="ts-hint">没有匹配的交易，换个词试试。</p>

    <table v-if="rows.length" class="ts-table">
      <thead>
        <tr>
          <th>职业</th><th>等级</th><th>你付出</th><th>你获得</th>
          <th class="ts-col-uses">次数</th><th class="ts-col-note">补充说明</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in rows" :key="i">
          <td class="ts-prof">{{ r.profession }}</td>
          <td class="ts-lv">{{ r.level }}</td>
          <td>{{ r.pay }}</td>
          <td class="ts-get">{{ r.get }}</td>
          <td class="ts-col-uses">{{ r.uses }}</td>
          <td class="ts-col-note ts-note">{{ r.note }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps({
  src: { type: String, default: '/data/stellarity-trades.json' },
})

const data = ref([])
const error = ref('')
const q = ref('')
const profs = ref(new Set())
const levels = ref(new Set())

onMounted(async () => {
  try {
    const res = await fetch(withBase(props.src))
    if (!res.ok) throw new Error('HTTP ' + res.status)
    data.value = await res.json()
  } catch (e) {
    error.value = e.message || String(e)
  }
})

const allProfessions = computed(() => {
  const set = new Set(data.value.map((r) => r.profession))
  return [...set]
})

function toggleProf(p) {
  const s = new Set(profs.value)
  s.has(p) ? s.delete(p) : s.add(p)
  profs.value = s
}
function toggleLevel(l) {
  const s = new Set(levels.value)
  s.has(l) ? s.delete(l) : s.add(l)
  levels.value = s
}
function reset() {
  profs.value = new Set()
  levels.value = new Set()
  q.value = ''
}

const rows = computed(() => {
  const kw = q.value.trim().toLowerCase()
  return data.value.filter((r) => {
    if (profs.value.size && !profs.value.has(r.profession)) return false
    if (levels.value.size && !levels.value.has(Number(r.level))) return false
    if (!kw) return true
    return (r.pay + ' ' + r.get + ' ' + r.note + ' ' + r.profession).toLowerCase().includes(kw)
  })
})
</script>

<style scoped>
.ts { margin: 1.25rem 0 2rem; }
.ts-bar { display: flex; gap: .6rem; align-items: center; }
.ts-input {
  flex: 1; padding: .55rem .8rem; font-size: 14px; color: var(--vp-c-text-1);
  background: var(--vp-c-bg-alt); border: 1px solid var(--vp-c-divider);
  border-radius: 8px; outline: none; transition: border-color .15s;
}
.ts-input:focus-visible { border-color: var(--vp-c-brand-1); }
.ts-count { font-size: 12.5px; color: var(--vp-c-text-3); white-space: nowrap; }
.ts-group { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .6rem; }
.ts-chip {
  font-size: 12.5px; padding: .28rem .6rem; border-radius: 999px; cursor: pointer;
  color: var(--vp-c-text-2); background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider); transition: all .12s;
}
.ts-chip:hover { color: var(--vp-c-text-1); border-color: var(--vp-c-brand-1); }
.ts-chip.on {
  color: #fff; background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1);
}
.ts-chip:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 1px; }
.ts-reset { border-style: dashed; }
.ts-hint { font-size: 13px; color: var(--vp-c-text-3); margin: .9rem 0; }
.ts-table { width: 100%; margin-top: 1rem; border-collapse: collapse; font-size: 13.5px; }
.ts-table th {
  text-align: left; font-weight: 600; font-size: 12.5px; color: var(--vp-c-text-2);
  padding: .5rem .55rem; border-bottom: 1px solid var(--vp-c-divider); white-space: nowrap;
}
.ts-table td { padding: .5rem .55rem; border-bottom: 1px solid var(--vp-c-divider); vertical-align: top; }
.ts-table tbody tr:hover { background: var(--vp-c-bg-alt); }
.ts-prof { white-space: nowrap; font-weight: 500; }
.ts-lv { color: var(--vp-c-text-3); text-align: center; }
.ts-get { font-weight: 500; }
.ts-note { color: var(--vp-c-text-2); font-size: 12.5px; line-height: 1.5; }
@media (max-width: 700px) {
  .ts-col-note { display: none; }
  .ts-table { font-size: 13px; }
  .ts-table th, .ts-table td { padding: .45rem .35rem; }
}
@media (max-width: 480px) {
  .ts-col-uses { display: none; }
}
</style>
