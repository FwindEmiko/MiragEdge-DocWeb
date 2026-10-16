// 删除已拆页的源页 start/redstone.md（内容已拆入 play/systems/redstone.md 与 developer/reference/leaf-tuning.md）
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const has = (p) => fs.existsSync(path.join(ROOT, p))

console.log('玩家半页 play/systems/redstone.md        :', has('play/systems/redstone.md'))
console.log('管理员半页 developer/reference/leaf-tuning.md:', has('developer/reference/leaf-tuning.md'))
console.log('原页 start/redstone.md                  :', has('start/redstone.md'))

if (!has('play/systems/redstone.md') || !has('developer/reference/leaf-tuning.md')) {
  console.error('两半未齐，中止删除')
  process.exit(1)
}

// 残留引用扫描
const dirs = ['start', 'play', 'features', 'community', 'developer', 'plugin-guides', 'archive']
const hits = []
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.md')) {
      const t = fs.readFileSync(p, 'utf8')
      t.split(/\r?\n/).forEach((l, i) => {
        if (l.includes('/start/redstone')) hits.push(`${path.relative(ROOT, p).split(path.sep).join('/')}:${i + 1}  ${l.trim().slice(0, 80)}`)
      })
    }
  }
}
for (const d of dirs) { const a = path.join(ROOT, d); if (fs.existsSync(a)) walk(a) }
console.log(`\n残留 /start/redstone 引用：${hits.length}`)
hits.forEach((h) => console.log('   ' + h))

try {
  execFileSync('git', ['rm', '--quiet', 'start/redstone.md'], { cwd: ROOT, encoding: 'utf8' })
  console.log('\n已 git rm start/redstone.md')
} catch (e) {
  console.error('\ngit rm 失败：', e.message.split('\n')[0])
  process.exit(1)
}
