// 阶段 1：按 10-信息架构方案.md 执行目录/文件迁移（git mv 保留历史）。
// 只做文件移动，不改内容；内容与链接改写由后续步骤单独处理。
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const dry = process.argv.includes('--dry')

// [旧路径, 新路径]（相对项目根，含 .md）
const MOVES = [
  // ── plugins/ → features/（顶层改名 + slug 规范化）──────────────
  ['plugins/index.md', 'features/index.md'],
  ['plugins/daily-tools.md', 'features/daily-tools.md'],
  ['plugins/building-tools.md', 'features/building-tools.md'],
  ['plugins/elytra-bind.md', 'features/elytra-bind.md'],
  ['plugins/fec-armor.md', 'features/body-size.md'],
  ['plugins/forge.md', 'features/forge.md'],
  ['plugins/custom/miragedge-home.md', 'features/anchor.md'],
  ['plugins/custom/death-return.md', 'features/death-return.md'],
  ['plugins/custom/sky-elytra.md', 'features/sky-elytra.md'],
  ['plugins/custom/slime-boots.md', 'features/slime-boots.md'],
  ['plugins/custom/chest-shop.md', 'features/chest-shop.md'],
  ['plugins/custom/global-market.md', 'features/global-market.md'],
  ['plugins/custom/emc-shop.md', 'features/block-bank.md'],
  ['plugins/custom/bounty-hunter.md', 'features/bounty-hunter.md'],
  ['plugins/custom/mob-capture.md', 'features/mob-capture.md'],
  ['plugins/custom/quiz.md', 'features/quiz.md'],
  ['plugins/custom/miragedge-title.md', 'features/title.md'],
  ['plugins/custom/monthly-pass.md', 'features/monthly-pass.md'],
  ['plugins/custom/flight-guard.md', 'features/flight-guard.md'],
  ['plugins/custom/nophantom.md', 'features/nophantom.md'],
  ['plugins/custom/piglin-talisman.md', 'features/piglin-talisman.md'],

  // ── start/community/ → community/（提为一等分区）───────────────
  ['start/community/index.md', 'community/index.md'],
  ['start/community/groups.md', 'community/groups.md'],
  ['start/community/voice.md', 'community/voice.md'],
  ['start/community/faq.md', 'community/faq.md'],
  ['start/community/promotion.md', 'community/promotion.md'],
  ['start/community/qqbot.md', 'community/qqbot.md'],

  // ── 跨区归位 ───────────────────────────────────────────────
  ['start/guild.md', 'play/systems/guild.md'],
  ['archive/start/main-city.md', 'start/main-city.md'],
  ['archive/start/new-server.md', 'start/new-server.md'],

  // ── play/life 重排（合并类先就位，正文合并在阶段 2）────────────
  ['play/life/food/info.md', 'play/life/food/index.md'],
  ['play/life/food/bakery.md', 'play/life/food/desserts-and-bakes.md'],
  ['play/life/food/eggs.md', 'play/life/food/eggs-and-specialties.md'],
  ['play/life/fishing/info.md', 'play/life/fishing/index.md'],
  ['play/life/fishing/rods.md', 'play/life/fishing/guide.md'],
  ['play/life/seasons/info.md', 'play/life/seasons/index.md'],
  ['play/life/seasons/temperature.md', 'play/life/seasons/mechanisms.md'],
  ['play/life/seasons/spring.md', 'play/life/seasons/spring-summer.md'],
  ['play/life/seasons/fall.md', 'play/life/seasons/autumn-winter.md'],

  // ── developer/ 归位 ─────────────────────────────────────────
  ['developer/design/liveops_260107.md', 'developer/archive/design/liveops_260107.md'],
]

// 合并类：源页内容将被并入目标页，故源页需先移到「待并入」位置再删。
// 这里显式列出，避免脚本静默漏掉。
const MERGE_SOURCES = [
  'play/life/food/desserts.md',      // 并入 desserts-and-bakes
  'play/life/food/special.md',       // 并入 eggs-and-specialties
  'play/life/seasons/summer.md',     // 并入 spring-summer
  'play/life/seasons/winter.md',     // 并入 autumn-winter
  'play/life/fishing/baits.md',      // 并入 fishing/guide
  'play/life/fishing/dimensions.md', // 并入 fishing/guide
]

function run(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

const errors = []
let moved = 0
for (const [from, to] of MOVES) {
  const absFrom = path.join(ROOT, from)
  const absTo = path.join(ROOT, to)
  if (!fs.existsSync(absFrom)) { errors.push(`源不存在: ${from}`); continue }
  if (fs.existsSync(absTo)) { errors.push(`目标已存在: ${to}`); continue }
  if (dry) { console.log(`[dry] ${from} -> ${to}`); continue }
  fs.mkdirSync(path.dirname(absTo), { recursive: true })
  try {
    run(['mv', from, to])
    moved++
  } catch (e) {
    errors.push(`git mv 失败 ${from} -> ${to}: ${e.message.split('\n')[0]}`)
  }
}

console.log(`\n移动 ${moved}/${MOVES.length} 个文件`)
if (errors.length) { console.log(`\n错误 ${errors.length}:`); errors.forEach((e) => console.log('  !', e)) }

// 校验：合并源文件仍在原位（阶段 2 处理）
console.log('\n待阶段 2 合并的源页（仍在原位）：')
for (const s of MERGE_SOURCES) {
  console.log(`  ${fs.existsSync(path.join(ROOT, s)) ? '在' : '已不在'}  ${s}`)
}
