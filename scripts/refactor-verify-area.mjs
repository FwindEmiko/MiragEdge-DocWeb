// 逐区复核：越区链接 / frontmatter / emoji / 禁词（含四类豁免）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const TARGET_DIRS = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const dirs = TARGET_DIRS.length ? TARGET_DIRS : ['start', 'community']

const BANNED_CN = ['数据包', '资源包', '插件']
const BANNED_EN = ['datapack', 'resource pack', 'JAR', 'Spigot', 'Paper', 'Leaf', 'CraftEngine', 'Aiyatsbus', 'NereusOpus', 'Geyser', 'Velocity', 'ViaVersion', 'config\\.yml', 'plugin\\.yml', 'PDC', 'NBT', 'API', 'Fluxon', 'Maven', 'Gradle', 'JVM']

function stripNoise(l) {
  let s = l
  s = s.replace(/https?:\/\/\S+/gi, ' ').replace(/\/\/\S*/g, ' ')
  s = s.replace(/\bsrc\s*=\s*["'][^"']*["']/gi, ' ').replace(/\btexture\s*=\s*["'][^"']*["']/gi, ' ')
  return s.replace(/Spirit\s*Leaf/gi, ' ').replace(/Starscar\s*Gem/gi, ' ')
}

const files = []
for (const d of dirs) {
  const abs = path.join(ROOT, d)
  if (!fs.existsSync(abs)) continue
  const stack = [abs]
  while (stack.length) {
    const c = stack.pop()
    for (const e of fs.readdirSync(c, { withFileTypes: true })) {
      const p = path.join(c, e.name)
      if (e.isDirectory()) stack.push(p)
      else if (e.name.endsWith('.md')) files.push(p)
    }
  }
}
files.sort()
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/')

const devLinks = [], noFm = [], emoji = [], banned = [], mdImg = []
for (const f of files) {
  const r = rel(f)
  const raw = fs.readFileSync(f, 'utf8')
  const body = raw.replace(/```[\s\S]*?```/g, '')
  const lines = body.split(/\r?\n/)

  if (!/^---\r?\n/.test(raw) || !/^title\s*:/m.test(raw) || !/^description\s*:/m.test(raw)) noFm.push(r)

  for (let i = 0; i < lines.length; i++) {
    const L = lines[i]
    if (/\]\(\/?(developer|plugin-guides)|href=["']\/?(developer|plugin-guides)/.test(L)) devLinks.push(`${r}:${i + 1}  ${L.trim().slice(0, 80)}`)
    if (/!\[[^\]]*\]\(/.test(L)) mdImg.push(`${r}:${i + 1}`)
    const s = stripNoise(L)
    for (const w of BANNED_CN) if (s.includes(w)) banned.push(`${r}:${i + 1} [${w}] ${L.trim().slice(0, 70)}`)
    for (const w of BANNED_EN) if (new RegExp(`\\b${w}\\b`, 'i').test(s)) banned.push(`${r}:${i + 1} [${w.replace(/\\/g, '')}] ${L.trim().slice(0, 70)}`)
    if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u.test(L)) emoji.push(`${r}:${i + 1}  ${L.trim().slice(0, 60)}`)
  }
}

const show = (name, arr) => {
  console.log(`\n${arr.length === 0 ? 'PASS' : 'FAIL'}  ${name}: ${arr.length}`)
  arr.slice(0, 20).forEach((a) => console.log('   ' + a))
  if (arr.length > 20) console.log(`   … 另有 ${arr.length - 20}`)
}
console.log(`扫描 ${dirs.join(', ')} —— ${files.length} 个文件`)
show('越区链接 (/developer|/plugin-guides)', devLinks)
show('frontmatter 缺失 (title/description)', noFm)
show('裸 markdown 图片', mdImg)
show('正文 emoji', emoji)
show('禁词命中（含四类豁免）', banned)
