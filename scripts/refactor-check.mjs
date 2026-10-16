// 阶段门禁脚本：覆盖纲领 §12 六项检查，并内置 13-术语表.md §6.1 的四类确定性误报豁免。
// 用法：node scripts/refactor-check.mjs [--player-only] [--quiet]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const PLAYER_DIRS = ['start', 'play', 'features', 'community', 'archive']
const HISTORICAL_DIRS = ['archive']               // 历史归档：报告但不判负
const ALL_DIRS = ['start', 'play', 'features', 'community', 'plugin-guides', 'developer', 'archive']

// ── 禁词表（纲领 §3.3）──────────────────────────────────────
const BANNED_CN = ['数据包', '资源包', '插件']
const BANNED_EN = [
  'datapack', 'resource pack', 'JAR', 'Spigot', 'Paper', 'Leaf',
  'CraftEngine', 'Aiyatsbus', 'NereusOpus', 'Geyser', 'Velocity', 'ViaVersion',
  'config\\.yml', 'plugin\\.yml', 'PDC', 'NBT', 'API', 'Fluxon', 'Maven', 'Gradle', 'JVM',
]

// 四类确定性误报豁免（13-术语表.md §6.1）
function stripNoise(line) {
  let s = line
  s = s.replace(/https?:\/\/\S+/gi, ' ')                       // ① URL（含 jump_from=webapi 这类查询串）
  s = s.replace(/\/\/\S*/g, ' ')
  s = s.replace(/\bsrc\s*=\s*["'][^"']*["']/gi, ' ')           // ③ src= 属性值（图片路径）
  s = s.replace(/\btexture\s*=\s*["'][^"']*["']/gi, ' ')
  s = s.replace(/Spirit\s*Leaf/gi, ' ')                        // ② 货币英文名
  s = s.replace(/Starscar\s*Gem/gi, ' ')
  return s
}

const META_JUNK = [
  '本页只展示', '本区只展示', '内容边界', '事实边界', '内容状态',
  '以游戏内提示为准', '不重复讲', '尚未完成配置核对',
  '设计稿和待核对资料', '待实际配置和玩法目标确定后再补齐',
  '不用先读完所有规则', '如果你想了解',
]

function walkMd(dirs) {
  const out = []
  for (const d of dirs) {
    const abs = path.join(ROOT, d)
    if (!fs.existsSync(abs)) continue
    const stack = [abs]
    while (stack.length) {
      const cur = stack.pop()
      for (const e of fs.readdirSync(cur, { withFileTypes: true })) {
        const p = path.join(cur, e.name)
        if (e.isDirectory()) stack.push(p)
        else if (e.name.endsWith('.md')) out.push(p)
      }
    }
  }
  return out.sort()
}

function stripFences(text) {
  return text.replace(/```[\s\S]*?```/g, '')
}

const files = walkMd(ALL_DIRS)
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/')
const isPlayer = (p) => PLAYER_DIRS.some((d) => rel(p).startsWith(d + '/'))
const isHistorical = (p) => HISTORICAL_DIRS.some((d) => rel(p).startsWith(d + '/'))

const F = { banned: [], playerDev: [], metaJunk: [], mdImages: [], frontmatter: [], emoji: [], toc: [] }

for (const file of files) {
  const r = rel(file)
  const raw = fs.readFileSync(file, 'utf8')
  const body = stripFences(raw)
  const lines = body.split(/\r?\n/)

  // 1) 禁词（仅玩家区；archive 报告不判负）
  if (isPlayer(file)) {
    for (let i = 0; i < lines.length; i++) {
      const line = stripNoise(lines[i])
      for (const w of BANNED_CN) if (line.includes(w)) F.banned.push(`${r}:${i + 1}  [${w}]  ${lines[i].trim().slice(0, 70)}`)
      for (const w of BANNED_EN) {
        const re = new RegExp(`\\b${w}\\b`, 'gi')
        if (re.test(line)) F.banned.push(`${r}:${i + 1}  [${w.replace(/\\/g, '')}]  ${lines[i].trim().slice(0, 70)}`)
      }
    }
  }

  // 2) 玩家区指向开发者文档的链接
  if (isPlayer(file)) {
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/\]\((\/?(developer|plugin-guides)[^)]*)\)|href=["'](\/?(developer|plugin-guides)[^"']*)["']/)
      if (m) F.playerDev.push(`${r}:${i + 1}  ${lines[i].trim().slice(0, 90)}`)
    }
  }

  // 3) 元叙述残留
  if (isPlayer(file)) {
    for (const j of META_JUNK) if (body.includes(j)) F.metaJunk.push(`${r}  [${j}]`)
  }

  // 4) 裸 markdown 图片
  for (const m of body.matchAll(/!\[[^\]]*\]\([^)]+\)/g)) F.mdImages.push(`${r}  ${m[0].slice(0, 60)}`)

  // 5) frontmatter 完整性
  if (!/^---\r?\n/.test(raw)) {
    F.frontmatter.push(`${r}  (无 frontmatter)`)
  } else {
    const fm = raw.slice(0, raw.indexOf('\n---', 3))
    if (!/^title\s*:/m.test(fm)) F.frontmatter.push(`${r}  (缺 title)`)
    if (!/^description\s*:/m.test(fm)) F.frontmatter.push(`${r}  (缺 description)`)
  }

  // 6) 正文 emoji
  const emojiRe = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u
  for (let i = 0; i < lines.length; i++) {
    if (emojiRe.test(lines[i])) F.emoji.push(`${r}:${i + 1}  ${lines[i].trim().slice(0, 70)}`)
  }
}

// 输出
const P = (title, arr, fatal = true) => {
  const n = arr.length
  const mark = n === 0 ? 'PASS' : (fatal ? 'FAIL' : 'INFO')
  console.log(`\n[${mark}] ${title}: ${n}`)
  arr.slice(0, 25).forEach((a) => console.log('   ' + a))
  if (n > 25) console.log(`   … 另有 ${n - 25} 条`)
  return n
}

console.log(`扫描 ${files.length} 个 markdown 文件（玩家区 ${files.filter(isPlayer).length}）`)

// 禁词：archive 单独列出不判负
const bannedPlayer = F.banned.filter((b) => !isHistoricalToStr(b))
function isHistoricalToStr(s) { return HISTORICAL_DIRS.some((d) => s.startsWith(d + '/')) }
const bannedArchive = F.banned.filter(isHistoricalToStr)
const bannedHard = F.banned.filter((b) => !isHistoricalToStr(b))

const n1 = P('① 玩家区禁词（硬门禁）', bannedHard)
const n1b = P('①b 历史归档禁词（豁免，仅报告）', bannedArchive, false)
const n2 = P('② 玩家区指向开发者文档的链接', F.playerDev)
const n3 = P('③ 元叙述残留', F.metaJunk)
const n4 = P('④ 裸 markdown 图片', F.mdImages)
const n5 = P('⑤ frontmatter 不完整', F.frontmatter)
const n6 = P('⑥ 正文 emoji', F.emoji)

const fatal = n1 + n2 + n3 + n4 + n5 + n6
console.log(`\n===== 门禁结果：${fatal === 0 ? 'PASS' : `FAIL（${fatal} 项）`} =====`)
process.exit(fatal === 0 ? 0 : 1)
