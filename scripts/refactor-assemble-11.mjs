// 把 _parts/11-header.md + 六个分域表 + 11-footer.md 合并成 11-内容分域清单.md
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const DIR = path.join(ROOT, 'docs', '文档站全量重构261016')
const P = (f) => path.join(DIR, '_parts', f)

function body(file) {
  let t = fs.readFileSync(P(file), 'utf8').trim()
  t = t.replace(/^<!--[\s\S]*?-->\s*/, '')   // 去掉 part 的注释标记
  const lines = t.split(/\r?\n/)
  const start = lines.findIndex((l) => l.trim().startsWith('|') && l.includes('文件（现状路径）'))
  // 从「表头下一行」开始，且剔除分隔行（六个 --- 单元格）
  return lines
    .slice(start + 1)
    .filter((l) => !/^\|\s*(:?-{2,}:?\s*\|\s*)+$/.test(l.trim()))
    .join('\n')
}

const TABLE_HEADER = `| 文件（现状路径） | 内容实质（≤30字） | 动作 | 目标新路径 | 归属区 | 理由（≤40字） |\n| --- | --- | --- | --- | --- | --- |\n`

const sections = [
  { file: '11-part-start-archive.md',   title: '## 2. `start/` + `archive/`（25 页）' },
  { file: '11-part-play-adventure.md',  title: '## 3. `play/adventure/`（23 页）' },
  { file: '11-part-play-life.md',       title: '## 4. `play/systems/` + `play/life/`（28 页）' },
  { file: '11-part-features.md',        title: '## 5. `plugins/` → `/features/`（21 页）' },
  { file: '11-part-plugin-guides.md',   title: '## 6. `plugin-guides/`（27 页）' },
  { file: '11-part-developer.md',       title: '## 7. `developer/`（76 页）' },
]

// header 文件已自带 §1 与 §2 的标题，避免重复：§2 标题由 header 输出，这里跳过
let out = fs.readFileSync(P('11-header.md'), 'utf8').trimEnd() + '\n'
let first = true
for (const s of sections) {
  let rows = body(s.file).split(/\r?\n/).filter((l) => l.trim().startsWith('|')).join('\n')
  // header 末尾已经写了 §2 的标题，这里只补表格
  if (first) {
    out += `\n${TABLE_HEADER}${rows}\n`
    first = false
    continue
  }
  out += `\n---\n\n${s.title}\n\n${TABLE_HEADER}${rows}\n`
}
out += '\n' + fs.readFileSync(P('11-footer.md'), 'utf8').trimStart()

const outFile = path.join(DIR, '11-内容分域清单.md')
fs.writeFileSync(outFile, out, 'utf8')

// 自检：数出数据行
const dataRows = out.split(/\r?\n/).filter((l) => l.trim().startsWith('|') && !l.includes('文件（现状路径）') && !/^\|\s*:?-{2,}/.test(l.trim())).length
console.log(`written: ${path.relative(ROOT, outFile)}`)
console.log(`lines=${out.split('\n').length} bytes=${Buffer.byteLength(out, 'utf8')}`)
console.log(`表格数据行(含口径/汇总/冲突表)=${dataRows}`)
