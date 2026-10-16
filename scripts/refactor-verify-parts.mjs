// 校验 _parts/*.md 是否覆盖 inventory 的全部页面，且每行列数一致。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const DIR = path.join(ROOT, 'docs', '文档站全量重构261016')
const inv = JSON.parse(fs.readFileSync(path.join(DIR, '_inventory.json'), 'utf8'))

const invPaths = new Set(inv.pages.map((p) => p.path))
const partsDir = path.join(DIR, '_parts')
const files = fs.readdirSync(partsDir).filter((f) => f.endsWith('.md')).sort()

const seen = new Map()   // path -> partFile
const problems = []
let totalRows = 0

for (const f of files) {
  const text = fs.readFileSync(path.join(partsDir, f), 'utf8')
  const lines = text.split(/\r?\n/)
  let rows = 0
  for (const line of lines) {
    if (!line.trim().startsWith('|')) continue
    const cells = line.split('|').slice(1, -1)
    if (cells.length !== 6) { problems.push(`${f}: 列数 ${cells.length} != 6 :: ${line.slice(0, 80)}`); continue }
    const first = cells[0].trim().replace(/^`|`$/g, '')
    // 跳过表头行与分隔行（六个单元格全是 --- / :---:）
    if (first === '文件（现状路径）') continue
    if (cells.every((c) => /^:?-{2,}:?$/.test(c.trim()))) continue
    rows++
    totalRows++
    const clean = first.replace(/^`|`$/g, '')
    if (!invPaths.has(clean)) problems.push(`${f}: 路径不在 inventory -> ${clean}`)
    if (seen.has(clean)) problems.push(`${f}: 重复出现（已在 ${seen.get(clean)}）-> ${clean}`)
    else seen.set(clean, f)
  }
  console.log(`${f.padEnd(34)} 数据行 ${rows}`)
}

console.log(`\n数据行合计 = ${totalRows}，唯一路径 = ${seen.size}，inventory = ${invPaths.size}`)

// 覆盖核验：哪些 inventory 页没出现在任何 part
const missing = [...invPaths].filter((p) => !seen.has(p)).sort()
console.log(`\n未覆盖 ${missing.length} 页：`)
for (const m of missing) console.log('  -', m)

// _report 文件本身不应被当成内容页
const spurious = [...seen.keys()].filter((p) => p.includes('_report'))
if (spurious.length) console.log(`\n误纳入报告文件：${spurious.join(', ')}`)

console.log(`\n问题 ${problems.length} 条：`)
for (const p of problems.slice(0, 40)) console.log('  !', p)
