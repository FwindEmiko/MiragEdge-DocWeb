// 阶段 1：改写全站站内链接与 frontmatter keywords，使其指向迁移后的新路径。
// 覆盖三种形态：① 绝对式 [x](/a/b) 与 href="/a/b"（含 .md 后缀）② 相对式 [x](./a)、[x](../a/b)
// ③ frontmatter keywords / 正文里的裸路径 /images/... 不动（图片未迁移）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const dry = process.argv.includes('--dry')
const DIR = path.join(ROOT, 'docs', '文档站全量重构261016')

// 旧路由 -> 新路由（不含 .md）。由 10-信息架构方案.md 的映射表 + 4.8 补充映射构成。
const ROUTE_MAP = new Map(Object.entries({
  // plugins -> features
  '/plugins': '/features',
  '/plugins/daily-tools': '/features/daily-tools',
  '/plugins/building-tools': '/features/building-tools',
  '/plugins/elytra-bind': '/features/elytra-bind',
  '/plugins/fec-armor': '/features/body-size',
  '/plugins/forge': '/features/forge',
  '/plugins/custom': '/features',
  '/plugins/custom/miragedge-home': '/features/anchor',
  '/plugins/custom/death-return': '/features/death-return',
  '/plugins/custom/sky-elytra': '/features/sky-elytra',
  '/plugins/custom/slime-boots': '/features/slime-boots',
  '/plugins/custom/chest-shop': '/features/chest-shop',
  '/plugins/custom/global-market': '/features/global-market',
  '/plugins/custom/emc-shop': '/features/block-bank',
  '/plugins/custom/bounty-hunter': '/features/bounty-hunter',
  '/plugins/custom/mob-capture': '/features/mob-capture',
  '/plugins/custom/quiz': '/features/quiz',
  '/plugins/custom/miragedge-title': '/features/title',
  '/plugins/custom/monthly-pass': '/features/monthly-pass',
  '/plugins/custom/flight-guard': '/features/flight-guard',
  '/plugins/custom/nophantom': '/features/nophantom',
  '/plugins/custom/piglin-talisman': '/features/piglin-talisman',
  // start/community -> community
  '/start/community': '/community',
  '/start/community/groups': '/community/groups',
  '/start/community/voice': '/community/voice',
  '/start/community/faq': '/community/faq',
  '/start/community/promotion': '/community/promotion',
  '/start/community/qqbot': '/community/qqbot',
  // 跨区归位
  '/start/guild': '/play/systems/guild',
  '/archive/start/main-city': '/start/main-city',
  '/archive/start/new-server': '/start/new-server',
  // play/life 重排
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
  // developer 归位
  '/developer/design/liveops_260107': '/developer/archive/design/liveops_260107',
}))

// 当前全部真实路由（迁移后）
const CONTENT_DIRS = ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']
function walkRoutes(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkRoutes(p, acc)
    else if (e.name.endsWith('.md')) {
      const rel = path.relative(ROOT, p).split(path.sep).join('/')
      acc.push('/' + rel.replace(/\.md$/, '').replace(/\/index$/, ''))
    }
  }
  return acc
}
const ROUTES = new Set(['/'])
for (const d of CONTENT_DIRS) { const a = path.join(ROOT, d); if (fs.existsSync(a)) walkRoutes(a).forEach((r) => ROUTES.add(r)) }
if (fs.existsSync(path.join(ROOT, 'index.md'))) ROUTES.add('/')

const files = []
for (const d of CONTENT_DIRS) {
  const a = path.join(ROOT, d)
  if (!fs.existsSync(a)) continue
  const stack = [a]
  while (stack.length) {
    const cur = stack.pop()
    for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
      const p = path.join(cur, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.name.endsWith('.md')) files.push(p)
    }
  }
}

function mapRoute(route) {
  // 精确匹配优先；否则按最长前缀映射（子路径继承）
  if (ROUTE_MAP.has(route)) return ROUTE_MAP.get(route)
  for (const [oldP, newP] of [...ROUTE_MAP.entries()].sort((a, b) => b[0].length - a[0].length)) {
    if (route.startsWith(oldP + '/')) return newP + route.slice(oldP.length)
  }
  return null
}

let changedFiles = 0
const report = []
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/')
  const orig = fs.readFileSync(file, 'utf8')
  let text = orig
  const hits = []

  // ① 绝对式链接（markdown 与 href）：/old(/|#|$|.md)
  text = text.replace(/(\]\(|href=["'])(\/[^)\s"'#]*)/g, (m, pre, route) => {
    const clean = route.replace(/\.md$/, '')
    const mapped = mapRoute(clean)
    if (mapped && mapped !== clean) {
      hits.push(`${route} -> ${mapped}${route.endsWith('.md') ? '.md' : ''}`)
      return pre + mapped + (route.endsWith('.md') ? '.md' : '')
    }
    return m
  })

  // ② 相对式链接：](.) 或 ](..)/ 开头
  const dir = path.posix.dirname(rel)
  text = text.replace(/\]\((\.{1,2}\/[^)\s#]*)/g, (m, relLink) => {
    const [p, hash = ''] = relLink.split(/(?=#)/)
    if (/\.(png|jpg|jpeg|webp|svg|gif)$/i.test(p)) return m
    const abs = path.posix.normalize(path.posix.join(dir, p))
    const clean = abs.replace(/\.md$/, '')
    const mapped = mapRoute('/' + clean.replace(/^\//, ''))
    if (mapped) {
      // 换算回相对当前文件的路径：两者必须同基准（都去掉前导 /），否则 relative() 会按 cwd 解析
      const back = path.posix.relative(dir, mapped.replace(/^\//, '')) || '.'
      const rel2 = (back.startsWith('.') ? back : './' + back) + hash
      if (rel2 !== relLink) { hits.push(`${relLink} -> ${rel2}`); return `](${rel2}` }
    }
    return m
  })

  if (text !== orig) {
    changedFiles++
    report.push({ file: rel, n: hits.length, hits: hits.slice(0, 8) })
    if (!dry) fs.writeFileSync(file, text, 'utf8')
  }
}

console.log(`${dry ? '[dry] ' : ''}改写文件数: ${changedFiles} / 扫描 ${files.length}`)
for (const r of report) {
  console.log(`\n${r.file}  (${r.n} 处)`)
  r.hits.forEach((h) => console.log(`   ${h}`))
}
fs.writeFileSync(path.join(DIR, '_linkmap-report.json'), JSON.stringify(report, null, 2), 'utf8')
