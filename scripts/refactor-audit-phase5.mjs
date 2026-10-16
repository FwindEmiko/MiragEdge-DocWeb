// 阶段 5 核实：统计 <DataTable> 实际使用处、容器语法使用处、以及 12-组件与配图计划 §2.2 的 4 个目标页现状
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const dirs = ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']

const files = []
for (const d of dirs) {
  const abs = path.join(ROOT, d)
  if (!fs.existsSync(abs)) continue
  const stack = [abs]
  while (stack.length) {
    const c = stack.pop()
    for (const e of fs.readdirSync(c, { withFileTypes: true })) {
      const p = path.join(c, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.name.endsWith('.md')) files.push(p)
    }
  }
}

const dataTableUses = []
const containerPages = new Set()
let containerCount = 0
const targets = [
  'developer/reference/economy-audit/plugin-economy-matrix.md',
  'developer/workflows/geyser/reference.md',
  'developer/website/mc-textures.md',
  'play/life/fishing/fish.md',
]
const targetState = []

for (const f of files) {
  const rel = path.relative(ROOT, f).split(path.sep).join('/')
  const t = fs.readFileSync(f, 'utf8')
  const dt = (t.match(/<DataTable/g) || []).length
  if (dt) dataTableUses.push({ rel, n: dt })
  const cs = (t.match(/^:::\s*(tip|warning|danger|info|details|note)\b/gm) || []).length
  if (cs) { containerPages.add(rel); containerCount += cs }
  if (targets.includes(rel)) {
    const lines = t.split(/\r?\n/).length
    const bytes = Buffer.byteLength(t, 'utf8')
    // 统计 markdown 表格行数（近似「大表」规模）
    let tableRows = 0
    let inTable = false
    for (const l of t.split(/\r?\n/)) {
      if (l.trim().startsWith('|')) { inTable = true; tableRows++ }
      else if (inTable && !l.trim().startsWith('|')) inTable = false
    }
    targetState.push({ rel, lines, bytes, tableRows, hasDataTable: dt > 0 })
  }
}

console.log('=== ① <DataTable> 实际使用处 ===')
if (!dataTableUses.length) console.log('  （无任何页面使用）')
dataTableUses.forEach((u) => console.log(`  ${u.rel}  ×${u.n}`))

console.log(`\n=== ② 容器语法 (: : :) 使用 ===`)
console.log(`  使用容器语法的页面数: ${containerPages.size}`)
console.log(`  容器总数: ${containerCount}`)

console.log('\n=== ③ 12-组件与配图计划 §2.2 的 4 个目标页现状 ===')
for (const t of targets) {
  const s = targetState.find((x) => x.rel === t)
  if (!s) { console.log(`  ${t}  —— 文件不存在`); continue }
  console.log(`  ${t}`)
  console.log(`      ${s.bytes} B / ${s.lines} 行 / markdown 表格行 ${s.tableRows} / DataTable: ${s.hasDataTable ? '已用' : '未用'}`)
}
