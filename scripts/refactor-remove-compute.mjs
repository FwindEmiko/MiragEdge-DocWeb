// 按站主指示：compute.md（对外云服务器价目表）从站点目录移除，源文件留档到 docs/（docs/ 已被 gitignore，不进站点）
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const SRC = path.join(ROOT, 'developer/ops/compute.md')
const BAK_DIR = path.join(ROOT, 'docs/文档站全量重构261016/源文件备份')
const BAK = path.join(BAK_DIR, 'compute-云计算价目表.md')

if (!fs.existsSync(SRC)) { console.log('· compute.md 已不存在，跳过'); process.exit(0) }

// 1) 留档
fs.mkdirSync(BAK_DIR, { recursive: true })
fs.copyFileSync(SRC, BAK)
console.log(`✓ 留档 → docs/文档站全量重构261016/源文件备份/compute-云计算价目表.md (${fs.statSync(BAK).size} B)`)

// 2) 从仓库删除
try {
  execFileSync('git', ['rm', '-f', '--quiet', 'developer/ops/compute.md'], { cwd: ROOT, encoding: 'utf8' })
  console.log('✓ git rm developer/ops/compute.md')
} catch (e) {
  console.log(`✗ git rm 失败：${e.message.split('\n')[0]}`)
}

// 3) 报告引用它的地方（待我手工清理）
const dirs = ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']
const hits = []
for (const d of dirs) {
  const abs = path.join(ROOT, d)
  if (!fs.existsSync(abs)) continue
  const stack = [abs]
  while (stack.length) {
    const c = stack.pop()
    for (const e of fs.readdirSync(c, { withFileTypes: true })) {
      const p = path.join(c, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.name.endsWith('.md')) {
        const t = fs.readFileSync(p, 'utf8')
        if (t.includes('ops/compute')) hits.push(path.relative(ROOT, p).split(path.sep).join('/'))
      }
    }
  }
}
console.log(`\n仍引用 ops/compute 的 md：${hits.length} 个`)
hits.forEach((h) => console.log('  ' + h))

// 4) 报告 config.mts 侧栏条目
const CFG = path.join(ROOT, '.vitepress/config.mts')
const cfg = fs.readFileSync(CFG, 'utf8')
const m = /[^\n]*ops\/compute[^\n]*/.exec(cfg)
console.log(`\nconfig.mts 侧栏条目：${m ? m[0].trim() : '（无）'}`)
