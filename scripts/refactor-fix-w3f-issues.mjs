// 修复：① 删除阶段 2 遗漏的两个玩家指南页 ② 侧栏 economy-audit 路径 ③ 侧栏移除已删页入口
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const P = path.join(ROOT, '.vitepress', 'config.mts')

// ① 删除两个玩家指南页（内容已迁入玩家区；重定向已在 legacy-redirects.ts 配好）
for (const f of ['plugin-guides/feback-guide-placeholder', 'plugin-guides/fe-back/guide.md', 'plugin-guides/fepvp/guide.md']) {
  const abs = path.join(ROOT, f)
  if (!fs.existsSync(abs)) continue
  try {
    execFileSync('git', ['rm', '-f', '--quiet', f], { cwd: ROOT, encoding: 'utf8' })
    console.log(`✓ git rm ${f}`)
  } catch (e) {
    console.log(`✗ git rm ${f} 失败：${e.message.split('\n')[0]}`)
  }
}

// ②③ config.mts 侧栏
let t = fs.readFileSync(P, 'utf8')
const FIXES = [
  [
    "{ text: '经济自动化审查', link: '/developer/reference/economy-audit-workflow' },",
    "{ text: '经济审查流程', link: '/developer/reference/economy-audit/' },\n            { text: '审查检查清单', link: '/developer/reference/economy-audit/checklist' },\n            { text: '定价方法论', link: '/developer/reference/economy-audit/pricing-methods' },\n            { text: '审查报告模板', link: '/developer/reference/economy-audit/report-template' },\n            { text: '全插件经济速查', link: '/developer/reference/economy-audit/plugin-economy-matrix' },",
  ],
  // 移除已删除的 fepvp 玩家指南入口（玩家版在 /features/pvp/）
  ["                { text: '玩家指南', link: '/plugin-guides/fepvp/guide' },\n", ""],
  // 移除已删除的 fe-back 玩家指南入口（玩家版在 /features/death-return）
  ["                { text: '玩家指南', link: '/plugin-guides/fe-back/guide' },\n", ""],
]

let n = 0
for (const [o, nw] of FIXES) {
  if (t.includes(o)) { t = t.replace(o, nw); n++; console.log(`✓ 替换 1 处：${o.slice(0, 44)}…`) }
  else console.log(`✗ 未命中：${o.slice(0, 44)}…`)
}
fs.writeFileSync(P, t, 'utf8')
console.log(`config.mts 共替换 ${n} 处`)
