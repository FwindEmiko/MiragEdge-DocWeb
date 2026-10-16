// 最终门禁：用「重构前」的真实路由清单（分支起点 82dbea6 之前的 main）核对每个旧 URL
// 是否仍可达或已有重定向规则。这是比 refactor-verify-redirects.mjs 更准的口径。
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

// 1) 重构前的路由（main 分支 = 分支起点）
const BASE = process.env.BASE_REF || 'main'
const out = execFileSync('git', ['ls-tree', '-r', '--name-only', BASE], { cwd: ROOT, encoding: 'utf8' })
const contentRe = /^(start|play|plugins|plugin-guides|developer|archive)\//
const oldRoutes = new Set(['/'])
for (const f of out.split('\n').map((s) => s.trim()).filter((x) => x.endsWith('.md'))) {
  if (!contentRe.test(f)) continue
  const r = '/' + f.replace(/\.md$/, '').replace(/\/index$/, '')
  oldRoutes.add(r === '/' ? '/' : r)
}

// 2) 当前真实路由
const live = new Set(['/'])
const dirs = ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']
const walk = (d, acc) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p, acc)
    else if (e.name.endsWith('.md')) {
      const rel = path.relative(ROOT, p).split(path.sep).join('/')
      acc.add('/' + rel.replace(/\.md$/, '').replace(/\/index$/, ''))
    }
  }
  return acc
}
for (const d of dirs) { const a = path.join(ROOT, d); if (fs.existsSync(a)) walk(a, live) }

// 3) 当前重定向规则的 from 集合
const mod = await import(new URL('../.vitepress/legacy-redirects.ts', import.meta.url).href)
const rules = mod.buildRedirectRules(ROOT)
const redirectFrom = new Set(rules.map((r) => r.from))

// 4) 每个旧路由：活 or 有重定向？
const broken = []
for (const r of oldRoutes) {
  if (r === '/') continue
  if (live.has(r)) continue
  if (redirectFrom.has(r)) continue
  broken.push(r)
}

console.log(`基线分支: ${BASE}`)
console.log(`重构前路由 ${oldRoutes.size} 条 · 当前路由 ${live.size} 条 · 重定向规则 ${rules.length} 条`)
console.log(`\n既不可达、也无重定向的旧 URL = ${broken.length}`)
broken.sort().forEach((b) => console.log('  ✗ ' + b))
if (!broken.length) console.log('  （全部有归宿）')
