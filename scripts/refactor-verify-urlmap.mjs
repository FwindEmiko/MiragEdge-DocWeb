// 阶段 0 门禁校验：10-信息架构方案.md 的「旧→新 URL 映射表」是否覆盖了所有会失效的 URL。
// 做法：从映射表抽出 claim 的 旧->新 对；再独立推算所有会失效的 URL；比对差集。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const DIR = path.join(ROOT, 'docs', '文档站全量重构261016')

const ia = fs.readFileSync(path.join(DIR, '10-信息架构方案.md'), 'utf8')

// 1) 抽出映射表里所有 `旧` | `新` 对（形如 | `/a/b` | `/c/d` | ... | ）
const claimed = new Map()
for (const line of ia.split(/\r?\n/)) {
  if (!line.trim().startsWith('|')) continue
  const cells = line.split('|').slice(1, -1).map((c) => c.trim())
  if (cells.length < 3) continue
  const from = cells[0].replace(/^`|`$/g, '')
  const to = cells[1].replace(/^`|`$/g, '')
  if (!from.startsWith('/')) continue
  if (!to.startsWith('/')) continue
  claimed.set(from, to)
}

// 2) 独立推算会失效的 URL：
//    a. 顶层改名 plugins/* -> features/*
//    b. IA 文档中「目标新路径」列里与「文件（现状路径）」不同的（来自 11-内容分域清单）
const inv = JSON.parse(fs.readFileSync(path.join(DIR, '_inventory.json'), 'utf8'))
const invPaths = new Set(inv.pages.map((p) => p.path))
const routeOf = (p) => {
  const s = p.replace(/\.md$/, '')
  return '/' + s.replace(/\/index$/, '')
}

// 从 11 清单抽 现状路径 -> 目标新路径（取第一个路径；拆页取第一个作代表）
const cl = fs.readFileSync(path.join(DIR, '11-内容分域清单.md'), 'utf8')
const changes = []
for (const line of cl.split(/\r?\n/)) {
  if (!line.trim().startsWith('|')) continue
  const cells = line.split('|').slice(1, -1).map((c) => c.trim())
  if (cells.length < 6) continue
  const cur = cells[0].replace(/^`|`$/g, '')
  if (!cur.endsWith('.md') || !invPaths.has(cur)) continue
  const action = cells[2]
  let target = cells[3].replace(/`/g, '')
  if (!/^(保留|重写|拆页|合并|迁移|删除)$/.test(action)) continue
  if (action === '保留') continue
  // 取目标里第一个 / 开头的路径
  const m = /(\/[A-Za-z0-9_\-/.]+)/.exec(target)
  if (!m) continue
  // 目标的写法可能是 /play 也可能是 /play/index（显式指向 index.md）——两者对路由而言等价
  let newRoute = m[1].replace(/\.md$/, '').replace(/[\/]+$/, '')
  newRoute = newRoute.replace(/\/index$/, '')
  const oldRoute = routeOf(cur)
  if (newRoute !== oldRoute) changes.push({ path: cur, action, oldRoute, newRoute, raw: target })
}

// 3) 差集：会变但映射表没claim的
const uncovered = changes.filter((c) => !claimed.has(c.oldRoute))

console.log(`映射表 claim 的 旧->新 对: ${claimed.size}`)
console.log(`清单里 会改路径的页: ${changes.length}`)
console.log(`\n映射表未覆盖的变更 (${uncovered.length}):`)
for (const u of uncovered) {
  console.log(`  [${u.action}] ${u.oldRoute}  ->  ${u.newRoute}   (${u.path})`)
}
