<script setup lang="ts">
/**
 * VillagerTradeNav — 末地村庄交易大全 的「职业快速跳转 + 交易格筛选」导航
 *
 * 为什么不用数据驱动：
 *   页面正文里的 173 行交易表是权威内容（1:1 来自数据包核对稿）。若组件再维护一份
 *   交易数据，两处会各自漂移。这里改为在挂载后读取**本页已渲染的标题**来生成导航，
 *   页面加/删职业或等级时导航自动跟着变，永不与正文脱节。
 *
 * 结构约定（与页面一致）：
 *   h3 = 职业名（每个职业下必有若干 h4 等级标题）
 *   h4 = 「N 级 · 名称（职业，共 X 个交易格）」
 * 只把「后面跟着 h4 的 h3」当作职业，因此不会误收页面里其它无关的 h3。
 *
 * SSR：首屏服务端渲染为空列表，onMounted 后填充；不会产生 hydration 不一致。
 */
import { onMounted, ref, computed, nextTick } from 'vue'
import { inBrowser } from 'vitepress'

interface LevelEntry {
  /** 等级序号，用于排序与徽标 */
  level: string
  /** 等级中文名（新手/学徒/…） */
  stage: string
  /** 这一级有几个交易格 */
  slots: number
  /** 标题锚点 id */
  id: string
  /** 展示用完整标题 */
  label: string
}

interface ProfessionEntry {
  name: string
  id: string
  levels: LevelEntry[]
}

const professions = ref<ProfessionEntry[]>([])
const query = ref('')
const activeProfession = ref('')
const ready = ref(false)

/** 从「N 级 · 新手（盔甲匠，共 2 个交易格）」解析出结构化信息 */
function parseLevelHeading(text: string): { level: string; stage: string; slots: number } | null {
  const m = text.match(/^\s*(\d)\s*级\s*[·・]\s*([^（(]+)[（(][^）)]*?共\s*(\d+)\s*个交易格/)
  if (!m) return null
  return { level: m[1], stage: m[2].trim(), slots: Number(m[3]) }
}

/** 读取 .vp-doc 内的 h3/h4 结构（只在当前页面容器内） */
function collect(): ProfessionEntry[] {
  const root = document.querySelector('.vp-doc')
  if (!root) return []
  const headings = Array.from(root.querySelectorAll('h3, h4'))
  const result: ProfessionEntry[] = []
  let current: ProfessionEntry | null = null

  for (const el of headings) {
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim()
    const id = el.id || ''
    if (el.tagName === 'H3') {
      // 职业标题：先记下，等确认后面有 h4 等级标题再收（过滤无关 h3）
      current = { name: text, id, levels: [] }
      result.push(current)
      continue
    }
    // h4：只有挂在某个职业下面、且能解析出等级信息时才收
    if (!current) continue
    const parsed = parseLevelHeading(text)
    if (!parsed) continue
    current.levels.push({
      level: parsed.level,
      stage: parsed.stage,
      slots: parsed.slots,
      id,
      label: text,
    })
  }
  // 丢掉没有等级标题的 h3（例如同页其它小节）
  return result.filter((p) => p.levels.length > 0)
}

/** 当前筛选条件下要显示的职业（含逐级过滤） */
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  let list = professions.value
  if (activeProfession.value) {
    list = list.filter((p) => p.name === activeProfession.value)
  }
  if (!q) return list
  // 命中职业名 → 保留该职业全部等级；否则只在等级标题里找
  return list
    .map((p) => {
      if (p.name.toLowerCase().includes(q)) return p
      const levels = p.levels.filter((l) => l.label.toLowerCase().includes(q))
      return levels.length ? { ...p, levels } : null
    })
    .filter((p): p is ProfessionEntry => p !== null)
})

const totalSlots = computed(() =>
  professions.value.reduce((sum, p) => sum + p.levels.reduce((s, l) => s + l.slots, 0), 0),
)

const matchCount = computed(() => filtered.value.length)

function scrollToAnchor(id: string) {
  if (!id) return
  const target = document.getElementById(id)
  if (!target) return
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  // 与 VitePress 自身锚点行为保持一致：写回原始 id，交给浏览器做百分号编码
  history.replaceState(null, '', `#${id}`)
}

function toggleProfession(name: string) {
  activeProfession.value = activeProfession.value === name ? '' : name
}

function reset() {
  query.value = ''
  activeProfession.value = ''
}

onMounted(async () => {
  if (!inBrowser) return
  // VitePress 在路由渲染完成后写入标题锚点，等一帧确保 id 就绪
  await nextTick()
  professions.value = collect()
  ready.value = true
})
</script>

<template>
  <div class="vtn" :class="{ 'vtn-ready': ready }">
    <div class="vtn-bar">
      <input
        v-model="query"
        class="vtn-search"
        type="search"
        placeholder="筛选职业或等级，例如「渔夫」「5 级」「专家」…"
        aria-label="筛选职业或等级"
      />
      <button v-if="query || activeProfession" class="vtn-reset" type="button" @click="reset">
        重置
      </button>
    </div>

    <p v-if="ready" class="vtn-hint">
      共 <strong>{{ professions.length }}</strong> 种职业、<strong>{{ totalSlots }}</strong> 个交易格。
      点职业名跳到对应小节。
      <template v-if="query || activeProfession">
        当前匹配 <strong>{{ matchCount }}</strong> 种职业。
      </template>
    </p>

    <p v-if="ready && matchCount === 0" class="vtn-empty">
      没有匹配的职业或等级，试试「盔甲匠」「制箭师」「大师」这类关键词。
    </p>

    <div v-if="matchCount > 0" class="vtn-list">
      <div v-for="p in filtered" :key="p.name" class="vtn-group">
        <button
          class="vtn-prof"
          type="button"
          :class="{ active: activeProfession === p.name }"
          @click="toggleProfession(p.name)"
        >
          <span class="vtn-prof-name">{{ p.name }}</span>
          <span class="vtn-prof-meta">{{ p.levels.reduce((s, l) => s + l.slots, 0) }} 格</span>
        </button>
        <div class="vtn-levels">
          <button
            v-for="l in p.levels"
            :key="l.id"
            class="vtn-level"
            type="button"
            :title="l.label"
            @click="scrollToAnchor(l.id)"
          >
            <span class="vtn-level-num">{{ l.level }}</span>
            <span class="vtn-level-stage">{{ l.stage }}</span>
            <span class="vtn-level-slots">{{ l.slots }} 格</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vtn {
  margin: 16px 0 24px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}

.vtn-bar {
  display: flex;
  gap: 8px;
  align-items: center;
}

.vtn-search {
  flex: 1 1 auto;
  min-width: 0;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s ease;
}

.vtn-search:focus {
  border-color: var(--vp-c-brand);
}

.vtn-reset {
  flex: 0 0 auto;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
}

.vtn-reset:hover {
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

.vtn-hint {
  margin: 12px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.vtn-empty {
  margin: 12px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.vtn-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.vtn-group {
  padding-top: 10px;
  border-top: 1px solid var(--vp-c-divider);
}

.vtn-group:first-child {
  padding-top: 0;
  border-top: none;
}

.vtn-prof {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  padding: 2px 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  background: none;
  border: none;
  cursor: pointer;
}

.vtn-prof:hover,
.vtn-prof.active {
  color: var(--vp-c-brand);
}

.vtn-prof-meta {
  font-size: 12px;
  font-weight: 400;
  color: var(--vp-c-text-3, var(--vp-c-text-2));
}

.vtn-levels {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.vtn-level {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 10px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.vtn-level:hover {
  color: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
}

.vtn-level-num {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.vtn-level:hover .vtn-level-num {
  color: var(--vp-c-brand);
}

.vtn-level-slots {
  font-size: 12px;
  color: var(--vp-c-text-3, var(--vp-c-text-2));
}

@media (max-width: 767px) {
  .vtn {
    padding: 12px;
  }

  .vtn-level {
    padding: 4px 8px;
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vtn-search,
  .vtn-level {
    transition: none;
  }
}
</style>
