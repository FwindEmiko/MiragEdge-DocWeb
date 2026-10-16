// 把 mc-textures.md 的三个 markdown 表改造成 <DataTable>（客户端筛选）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const F = path.join(ROOT, 'developer/website/mc-textures.md')
const t = fs.readFileSync(F, 'utf8')

// 解析「**分类名** (N)」+ 紧跟的 markdown 表
const blocks = []
const re = /\*\*(.+?)\*\*\s*\((\d+)\)\s*\n\n\| id \| 名称 \|\n\| :--- \| :--- \|\n((?:\|.*\n)+)/g
let m
while ((m = re.exec(t)) !== null) {
  const cat = m[1].trim()
  const rows = []
  for (const line of m[3].trim().split('\n')) {
    const cells = line.split('|').slice(1, -1).map((c) => c.trim())
    if (cells.length < 2) continue
    rows.push({ id: cells[0].replace(/`/g, ''), name: cells[1] })
  }
  blocks.push({ cat, declared: Number(m[2]), rows })
}

console.log('解析到的分类：')
let total = 0
for (const b of blocks) {
  total += b.rows.length
  const ok = b.rows.length === b.declared ? 'OK' : `MISMATCH(声明 ${b.declared})`
  console.log(`  ${b.cat}: ${b.rows.length} 行  ${ok}`)
}
console.log(`合计 ${total} 行`)

if (total !== 120) {
  console.error(`\n预期 120 行，实得 ${total}，中止以免丢数据`)
  process.exit(1)
}

// 生成 rows 数组字面量
const dataLines = blocks.map((b) => {
  const items = b.rows.map((r) => `    { id: '${r.id}', name: '${r.name}', group: '${b.cat}' },`).join('\n')
  return `  // ${b.cat}（${b.rows.length}）\n${items}`
}).join('\n')

const newScript = `<script setup>
// 物品 id 对照表数据源。改动此表即改动页面筛选结果，不要再另外维护一份 markdown 表。
const itemColumns = [
  { key: 'id', label: 'id' },
  { key: 'name', label: '名称' },
]

const itemRows = [
${dataLines}
]
</script>

`

// 用 DataTable 替换 <details> 整块
const start = t.indexOf('<details>')
const end = t.indexOf('</details>') + '</details>'.length
if (start === -1 || end === -1) { console.error('未找到 <details> 块'); process.exit(1) }

const tablePart = `## 物品 id 对照表

以下列出食物、食材原料、原材料与矿物三类的完整 id。其余分类的 id 见源文件注册表。

<DataTable
  :columns="itemColumns"
  :rows="itemRows"
  group-key="group"
  :page-size="0"
  search-placeholder="输入 id 或中文名筛选"
  note="共 120 个物品，覆盖食物、食材原料、原材料与矿物三类；全量 581 个物品见源文件注册表。"
/>

`

let out = t.slice(0, start) + t.slice(end)
// 插入 script setup（在 frontmatter 之后、H1 之前）
const fmEnd = out.indexOf('\n---', 3) + 4
out = out.slice(0, fmEnd) + '\n' + newScript + out.slice(fmEnd)
// 去掉现在重复的「## 物品 id 对照表」小节标题（原在 details 之前）
out = out.replace(/\n## 物品 id 对照表\n\n以下列出食物、食材原料、原材料与矿物三类的完整 id。其余分类的 id 见源文件注册表。\n\n\n/, '\n')

fs.writeFileSync(F, out, 'utf8')
console.log('\n已改写 mc-textures.md')
console.log('剩余 markdown 表格行:', (out.match(/^\|/gm) || []).length)
