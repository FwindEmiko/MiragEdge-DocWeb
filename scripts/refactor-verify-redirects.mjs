// 阶段 1 门禁：枚举**迁移前**存在的全部路由（取自 git HEAD），逐条检查改写后的
// buildRedirectRules() 是否覆盖，并给出缺失的 exact 规则候选。
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

// 1) 迁移前的全部 .md 路径（git HEAD = 分支起点，即迁移前状态）
const out = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD'], { cwd: ROOT, encoding: 'utf8' })
const oldFiles = out.split('\n').map((s) => s.trim()).filter((f) => f.endsWith('.md'))

const CONTENT_RE = /^(start|play|plugins|plugin-guides|developer|archive)\//
const oldRoutes = new Set(['/'])
for (const f of oldFiles) {
  if (!CONTENT_RE.test(f)) continue
  oldRoutes.add('/' + f.replace(/\.md$/, '').replace(/\/index$/, ''))
  oldRoutes.add('/' + f.replace(/\.md$/, ''))
}

// 2) 当前真实路由（迁移后）
function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, acc)
    else if (e.name.endsWith('.md')) {
      const rel = path.relative(ROOT, p).split(path.sep).join('/')
      acc.push('/' + rel.replace(/\.md$/, ''))
      acc.push('/' + rel.replace(/\.md$/, '').replace(/\/index$/, ''))
    }
  }
  return acc
}
const live = new Set(['/'])
{
  const acc = []
  for (const d of ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']) {
    const a = path.join(ROOT, d)
    if (fs.existsSync(a)) walk(a, acc)
  }
  for (const r of acc) live.add(r)
}

// 3) 旧路由 -> 新路由（与新 IA 一致）
const PREFIX = [
  ['/plugins/custom/', '/features/'],
  ['/plugins/', '/features/'],
  ['/start/community/', '/community/'],
  ['/archive/start/', '/start/'],
]
const EXACT = {
  '/plugins': '/features',
  '/start/community': '/community',
  '/start/guild': '/play/systems/guild',
  '/start/redstone': '/play/systems/redstone',
  '/plugins/custom': '/features',
}
// slug 改名（插件打平后的重命名）
const SLUG = {
  '/features/miragedge-home': '/features/anchor',
  '/features/death-return': '/features/death-return',
  '/features/sky-elytra': '/features/sky-elytra',
  '/features/slime-boots': '/features/slime-boots',
  '/features/chest-shop': '/features/chest-shop',
  '/features/global-market': '/features/global-market',
  '/features/emc-shop': '/features/block-bank',
  '/features/bounty-hunter': '/features/bounty-hunter',
  '/features/mob-capture': '/features/mob-capture',
  '/features/quiz': '/features/quiz',
  '/features/miragedge-title': '/features/title',
  '/features/monthly-pass': '/features/monthly-pass',
  '/features/flight-guard': '/features/flight-guard',
  '/features/nophantom': '/features/nophantom',
  '/features/piglin-talisman': '/features/piglin-talisman',
  '/features/fec-armor': '/features/body-size',
  '/features/index': '/features',
  '/play/life/food/info': '/play/life/food',
  '/play/life/food/bakery': '/play/life/food/desserts-and-bakes',
  '/play/life/food/desserts': '/play/life/food/desserts-and-bakes',
  '/play/life/food/eggs': '/play/life/food/eggs-and-specialties',
  '/play/life/food/special': '/play/life/food/eggs-and-specialties',
  '/play/life/fishing/info': '/play/life/fishing',
  '/play/life/fishing/rods': '/play/life/fishing/guide',
  '/play/life/fishing/baits': '/play/life/fishing/guide',
  '/play/life/fishing/dimensions': '/play/life/fishing/guide',
  '/play/life/seasons/info': '/play/life/seasons',
  '/play/life/seasons/temperature': '/play/life/seasons/mechanisms',
  '/play/life/seasons/spring': '/play/life/seasons/spring-summer',
  '/play/life/seasons/summer': '/play/life/seasons/spring-summer',
  '/play/life/seasons/fall': '/play/life/seasons/autumn-winter',
  '/play/life/seasons/winter': '/play/life/seasons/autumn-winter',
  '/developer/design/liveops_260107': '/developer/archive/design/liveops_260107',
}

function target(oldRoute) {
  if (EXACT[oldRoute]) return EXACT[oldRoute]
  let r = oldRoute
  for (const [p, n] of PREFIX) {
    if (r === p.slice(0, -1)) { r = n.slice(0, -1); break }
    if (r.startsWith(p)) { r = n + r.slice(p.length); break }
  }
  if (SLUG[r]) r = SLUG[r]
  return r
}

// 4) 收集会失效的旧路由（指向的新位置 != 旧位置）
const norm = (r) => (r.replace(/\/index$/, '') || '/')
const stale = []
for (const o of oldRoutes) {
  const on = norm(o)
  if (on === '/') continue
  const t = target(on)
  const tn = norm(t)
  // 只关心「规范化后的路由真的变了」的；/x/index -> /x 由 VitePress 自身等价处理，不算变更
  if (tn === on) continue
  stale.push({ from: on, to: tn, live: live.has(tn) || live.has(tn + '/') })
}

// 5) 载入当前规则，算缺口
const mod = await import(new URL('../.vitepress/legacy-redirects.ts', import.meta.url).href)
const rules = mod.buildRedirectRules(ROOT)
const ruleFrom = new Set(rules.map((r) => r.from))

const missing = stale.filter((s) => !ruleFrom.has(s.from))
console.log(`迁移前路由 ${oldRoutes.size} 条；会失效的 ${stale.length} 条`)
console.log(`其中新位置真实存在: ${stale.filter((s) => s.live).length}；新位置不存在(注意): ${stale.filter((s) => !s.live).length}`)
console.log(`\n未被重定向规则覆盖 = ${missing.length}`)
for (const m of missing) console.log(`  { from: '${m.from}', to: '${m.to}' },${m.live ? '' : '   // ⚠ 目标不存在'}`)

// 也报「目标不存在」的
const badTarget = stale.filter((s) => !s.live)
if (badTarget.length) {
  console.log(`\n⚠ 新位置不存在的映射（需人工确认）：`)
  for (const b of badTarget) console.log(`  ${b.from} -> ${b.to}`)
}
