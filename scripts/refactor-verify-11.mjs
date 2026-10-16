// 校验最终的 11-内容分域清单.md：每个分域小节的数据行数是否等于该区页数
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const file = path.join(ROOT, 'docs', '文档站全量重构261016', '11-内容分域清单.md')
const text = fs.readFileSync(file, 'utf8')
const lines = text.split(/\r?\n/)

// 期望：小节标题 -> 页数
const EXPECT = [
  ['## 1. 根页面', 2],
  ['## 2. `start/` + `archive/`', 25],
  ['## 3. `play/adventure/`', 23],
  ['## 4. `play/systems/` + `play/life/`', 28],
  ['## 5. `plugins/`', 21],
  ['## 6. `plugin-guides/`', 27],
  ['## 7. `developer/`', 76],
]

// 找出每个小节的起始行
const marks = []
for (const [title, expect] of EXPECT) {
  const idx = lines.findIndex((l) => l.startsWith(title))
  if (idx === -1) { console.log(`MISSING SECTION: ${title}`); continue }
  marks.push({ title, expect, idx })
}
marks.sort((a, b) => a.idx - b.idx)

let sum = 0
for (let i = 0; i < marks.length; i++) {
  const start = marks[i].idx
  const end = i + 1 < marks.length ? marks[i + 1].idx : lines.length
  // 数该区间内、形如 | `path` | 的数据行
  let n = 0
  const paths = []
  for (let j = start; j < end; j++) {
    const l = lines[j].trim()
    if (!l.startsWith('|')) continue
    if (l.includes('文件（现状路径）')) continue
    if (/^\|\s*:?-{2,}/.test(l)) continue
    const cells = l.split('|').slice(1, -1)
    if (cells.length < 6) continue
    const p = cells[0].trim().replace(/^`|`$/g, '')
    if (!p.endsWith('.md')) continue
    n++; paths.push(p)
  }
  const ok = n === marks[i].expect ? 'OK ' : 'BAD'
  console.log(`${ok} ${marks[i].title.padEnd(42)} 行=${String(n).padStart(3)} 期望=${marks[i].expect}`)
  if (n !== marks[i].expect) {
    console.log(`    实际路径: ${paths.length ? paths.join(', ') : '(无)'}`)
  }
  sum += n
}
console.log(`\n分域表合计 = ${sum}（期望 202）`)

// 重复检查
const all = []
for (let i = 0; i < lines.length; i++) {
  const l = lines[i].trim()
  if (!l.startsWith('|') || l.includes('文件（现状路径）') || /^\|\s*:?-{2,}/.test(l)) continue
  const cells = l.split('|').slice(1, -1)
  if (cells.length < 6) continue
  const p = cells[0].trim().replace(/^`|`$/g, '')
  if (p.endsWith('.md')) all.push(p)
}
const dup = all.filter((v, i) => all.indexOf(v) !== i)
console.log(`唯一路径 ${new Set(all).size} / 出现 ${all.length}`)
console.log(dup.length ? `重复: ${[...new Set(dup)].join(', ')}` : '重复: 无')

// 与 inventory 比对
const inv = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', '文档站全量重构261016', '_inventory.json'), 'utf8'))
const invSet = new Set(inv.pages.map((p) => p.path))
const missing = [...invSet].filter((p) => !all.includes(p))
const extra = [...new Set(all)].filter((p) => !invSet.has(p))
console.log(`\n未被清单覆盖 (${missing.length}): ${missing.join(', ') || '无'}`)
console.log(`清单中不存在于 inventory (${extra.length}): ${extra.join(', ') || '无'}`)
