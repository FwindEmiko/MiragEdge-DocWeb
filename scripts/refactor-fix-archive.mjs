// 收尾修复 archive/：补 4 页 frontmatter、移除越区链接、清正文 emoji
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const A = path.join(ROOT, 'archive')

// ① 越区链接：archive/index.md 末段
{
  const f = path.join(A, 'index.md')
  let t = fs.readFileSync(f, 'utf8')
  const before = t
  // 删掉整句「继续阅读 / 开发文档归档」类指路
  t = t.replace(/\n[^\n]*请前往\[开发文档\]\(\/developer\/\)[^\n]*\n/g, '\n')
  t = t.replace(/\n[^\n]*\[开发文档\]\(\/developer\/\)[^\n]*\n/g, '\n')
  if (t !== before) { fs.writeFileSync(f, t, 'utf8'); console.log('✓ archive/index.md 移除越区链接') }
  else console.log('· archive/index.md 无变化（可能链接形态不同）')
}

// ② 补 frontmatter（title 取现有 H1 或首个加粗标题，description 简述）
const FM = {
  '20251017.md': {
    title: '互通服停运与接管征集',
    description: '2025 年 10 月 17 日的互通服停运公告：停运原因、接管代理征集与后续规划，以及同年 12 月 5 日的重启消息。',
  },
  '20251225.md': {
    title: '新服数据丢失事件',
    description: '2025 年 12 月 25 日数据丢失事故的说明：受损与保留的数据、影响范围、恢复进度，以及后续的备份改进承诺。',
  },
  '20260101.md': {
    title: '2026 元旦合照纪念活动',
    description: '2026 年元旦合照纪念活动的记录：活动安排与时间、参与方式、人数管控、旧存档开放安排与活动总结。',
  },
  '20260801.md': {
    title: '新服开放：梦始之空重启',
    description: '2026 年 8 月 1 日新服正式开放的记录：单世界架构、区域划分、烬域与繁星、主城共建、经济改动与技术升级。',
  },
}
for (const [file, fm] of Object.entries(FM)) {
  const f = path.join(A, 'events', file)
  if (!fs.existsSync(f)) { console.log(`· 跳过 ${file}（不存在）`); continue }
  let t = fs.readFileSync(f, 'utf8').replace(/^\uFEFF/, '')
  if (/^---\r?\n/.test(t)) { console.log(`· ${file} 已有 frontmatter`); continue }
  const block = `---\ntitle: ${fm.title}\ndescription: ${fm.description}\n---\n\n`
  fs.writeFileSync(f, block + t, 'utf8')
  console.log(`✓ ${file} 补 frontmatter`)
}

// ③ 清正文 emoji
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{2728}\u{1F4C5}\u{1F4A1}\u{1F91D}\u{270D}]/gu
let emojiFixed = 0
for (const f of fs.readdirSync(path.join(A, 'events')).filter((x) => x.endsWith('.md'))) {
  const p = path.join(A, 'events', f)
  let t = fs.readFileSync(p, 'utf8')
  const before = t
  t = t.replace(/^([\p{Emoji_Presentation}\uFE0F]+\s*)/gmu, '')       // 行首 emoji
  t = t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu, '')
  if (t !== before) {
    t = t.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n')
    fs.writeFileSync(p, t, 'utf8')
    emojiFixed++
    console.log(`✓ ${f} 清除 emoji`)
  }
}
console.log(`\n共清 emoji 文件 ${emojiFixed} 个`)
