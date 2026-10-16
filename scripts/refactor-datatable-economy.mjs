// 把 plugin-economy-matrix.md 的 §1-4（产出源/消耗端）合并为一张可筛选的 <DataTable>，
// §5-10 保持原样。提取后逐表核对行数与原文一致，不一致就中止。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const F = path.join(ROOT, 'developer/reference/economy-audit/plugin-economy-matrix.md')
const src = fs.readFileSync(F, 'utf8')
const lines = src.split('\n')

// 定位各小节的行范围
const heads = []
lines.forEach((l, i) => { const m = /^## (\d+)\.\s*(.+)$/.exec(l); if (m) heads.push({ n: +m[1], title: m[2].trim(), i }) })
heads.push({ n: 999, title: '(EOF)', i: lines.length })

function sectionTable(n) {
  const h = heads.find((x) => x.n === n)
  if (!h) return null
  const next = heads.find((x) => x.i > h.i)
  const body = lines.slice(h.i, next.i)
  // 表头行
  const hi = body.findIndex((l) => l.trim().startsWith('|'))
  if (hi === -1) return null
  const header = body[hi].split('|').slice(1, -1).map((c) => c.trim())
  const rows = []
  for (let j = hi + 2; j < body.length; j++) {
    const l = body[j]
    if (!l.trim().startsWith('|')) break
    rows.push(l.split('|').slice(1, -1).map((c) => c.trim()))
  }
  return { header, rows, startLine: h.i, endLine: next.i }
}

const s1 = sectionTable(1), s2 = sectionTable(2), s3 = sectionTable(3), s4 = sectionTable(4)
console.log('原始表结构核对：')
for (const [n, s] of [[1, s1], [2, s2], [3, s3], [4, s4]]) {
  if (!s) { console.log(`  §${n} 未找到`); continue }
  console.log(`  §${n} 表头 [${s.header.join(' | ')}]  数据行 ${s.rows.length}`)
}
const origCount = s1.rows.length + s2.rows.length + s3.rows.length + s4.rows.length
console.log(`  §1-4 原始数据行合计 = ${origCount}`)

// 统一 schema：插件 | 功能 | 数值 | 频率 | 上限 | 备注，group = 货币 · 方向
function norm(s, currency, dir) {
  const out = []
  const hasCap = s.header.includes('日上限')
  for (const r of s.rows) {
    if (r.length < 3) continue
    out.push({
      plugin: r[0], feature: r[1],
      amount: r[2] ?? '',
      freq: r[3] ?? '',
      cap: hasCap ? (r[4] ?? '') : '',
      note: hasCap ? (r[5] ?? '') : (r[4] ?? ''),
      group: `${currency} · ${dir}`,
    })
  }
  return out
}
const all = [...norm(s1, '灵叶', '产出'), ...norm(s2, '星痕石', '产出'), ...norm(s3, '灵叶', '消耗'), ...norm(s4, '星痕石', '消耗')]
console.log(`  统一后行数 = ${all.length}（应等于 ${origCount}）`)
if (all.length !== origCount) { console.error('行数不一致，中止'); process.exit(1) }

const esc = (v) => String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const rowsLiteral = all.map((r) =>
  `  { plugin: '${esc(r.plugin)}', feature: '${esc(r.feature)}', amount: '${esc(r.amount)}', freq: '${esc(r.freq)}', cap: '${esc(r.cap)}', note: '${esc(r.note)}', group: '${esc(r.group)}' },`
).join('\n')

const script = `<script setup>
// §1-4 的产出源与消耗端合并为一张可筛选表：按「货币 · 方向」筛选，或直接搜插件名。
// 数据源即原文 §1-4 的表格内容，逐行搬运未做改动。
const ecoColumns = [
  { key: 'plugin', label: '插件' },
  { key: 'feature', label: '功能' },
  { key: 'amount', label: '数值', align: 'right' },
  { key: 'freq', label: '频率' },
  { key: 'cap', label: '上限' },
  { key: 'note', label: '备注' },
]

const ecoRows = [
${rowsLiteral}
]
</script>

`

const block = `## 1. 产出源与消耗端总表

审查改动时先在这里定位：按「货币 · 方向」筛选，或直接搜插件名，可以一次看清某个插件动了哪些经济环节。

<DataTable
  :columns="ecoColumns"
  :rows="ecoRows"
  group-key="group"
  :page-size="0"
  search-placeholder="输入插件名或功能筛选"
  note="共 ${all.length} 条，覆盖灵叶与星痕石的产出源和消耗端；数据截止 2026-09-02。"
/>

`

// 用新块替换 §1-§4 的整段
const startLine = s1.startLine
const endLine = s4.endLine
const before = lines.slice(0, startLine)
const after = lines.slice(endLine)
let out = [...before, ...block.split('\n'), ...after].join('\n')

// 后续小节编号顺延（§5→§2 … §10→§7）
for (let n = 5; n <= 10; n++) {
  out = out.replace(new RegExp(`^## ${n}\\. `, 'm'), `## ${n - 4}. `)
}

// 插入 script setup
const fmEnd = out.indexOf('\n---', 3) + 4
out = out.slice(0, fmEnd) + '\n' + script + out.slice(fmEnd)

fs.writeFileSync(F, out, 'utf8')
console.log('\n已改写 plugin-economy-matrix.md')
console.log('剩余 markdown 表格行:', (out.match(/^\|/gm) || []).length)
console.log('小节标题：')
for (const m of out.matchAll(/^## .+$/gm)) console.log('  ' + m[0])
