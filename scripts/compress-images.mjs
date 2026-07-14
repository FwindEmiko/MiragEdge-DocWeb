/**
 * 图片压缩脚本 — 基于 sharp
 *
 * 用法:
 *   node scripts/compress-images.mjs hero     # P0: 首页 hero 贴图(转 WebP)
 *   node scripts/compress-images.mjs images    # P1: avatars/images 下大图(原地压缩,保留格式)
 *   node scripts/compress-images.mjs all       # 全部
 *
 * 策略:
 *   - hero 立绘:缩到 640px 宽 + WebP q82(显示区 ~300px,640px 满足 2x retina)
 *   - OG/截图:等比缩 + 原格式压缩(PNG 调色板量化, JPG mozjpeg)
 *   - 原地压缩时输出临时文件再 rename 覆盖,避免 sharp 读写下冲突
 *   - 转 WebP 时生成 .webp 新文件,原 .png 保留以便后续改引用后删除
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = path.resolve(import.meta.dirname, '..')
const fmtKB = b => (b / 1024).toFixed(1) + ' KB'

// 任务定义:相对根目录路径, 最大宽度(超出才缩), 输出格式(undefined=保留), 质量
const heroTasks = [
  { src: 'public/title_img/icon-1.png', width: 640, format: 'webp', quality: 82 },
  { src: 'public/title_img/icon-2.png', width: 640, format: 'webp', quality: 82 },
  { src: 'public/title_img/icon-3.png', width: 640, format: 'webp', quality: 82 },
  { src: 'public/title_img/icon-dis.png', width: 640, format: 'webp', quality: 82 },
  // OG 分享图保留 PNG(社交平台兼容性),缩小到 1024 宽并压缩
  { src: 'public/title_img/xingjiu.png', width: 1024, quality: 82 },
]

const imageTasks = [
  // 头像(原图分辨率较高,缩到 640 保留观感,避免糊化)
  { src: 'public/avatars/MiragEdge.png', width: 640, quality: 85 },
  { src: 'public/avatars/QQ的星玖.png', width: 640, quality: 85 },
  { src: 'public/avatars/星玖躺在床上.jpg', width: 640, quality: 85 },
  // 成员照片(列表头像,缩到 400)
  ...listDir('public/images/member', 400, 80),
  // 功能截图(内容页展示,缩到 1600)
  ...listDir('public/images/features', 1600, 80),
  // msreg 截图
  ...listDir('public/images/msreg', 1600, 80),
  // 活动图
  ...listDir('public/images/active', 1600, 80),
]

function listDir(dirRel, width, quality) {
  const dir = path.join(root, dirRel)
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => /\.(png|jpe?g)$/i.test(f))
    .map(f => ({ src: `${dirRel}/${f}`, width, quality }))
}

async function compressOne(task) {
  const abs = path.join(root, task.src)
  if (!fs.existsSync(abs)) {
    console.warn(`  ⚠ 跳过(不存在): ${task.src}`)
    return null
  }
  const meta = await sharp(abs).metadata()
  const before = fs.statSync(abs).size
  // 跳过已压缩过的(宽度达标且文件已小),避免二次质量损失
  if (!task.format && meta.width <= task.width && before < 50 * 1024) {
    console.log(`  ${task.src} [${meta.width}x${meta.height}] ${fmtKB(before)} (已达标,跳过)`)
    return null
  }
  const toWebp = task.format === 'webp'
  const outPath = toWebp ? abs.replace(/\.(png|jpe?g)$/i, '.webp') : abs

  let img = sharp(abs).rotate() // 按 EXIF 自动旋转
  if (task.width && meta.width > task.width) {
    img = img.resize({ width: task.width, withoutEnlargement: true })
  }

  if (toWebp) {
    img = img.webp({ quality: task.quality ?? 82, effort: 4 })
  } else if (/jpe?g$/i.test(task.src) || meta.format === 'jpeg') {
    img = img.jpeg({ quality: task.quality ?? 80, mozjpeg: true, progressive: true })
  } else {
    img = img.png({ compressionLevel: 9, palette: true, quality: task.quality ?? 80 })
  }

  const tmp = outPath + '.compress.tmp'
  await img.toFile(tmp)
  const tmpSize = fs.statSync(tmp).size
  // 压缩后反而变大则放弃,保留原文件(部分已优化 PNG 调色板量化会变大)
  if (tmpSize >= before) {
    try { fs.unlinkSync(tmp) } catch {}
    console.log(`  ${task.src} [${meta.width}x${meta.height}] ${fmtKB(before)} (压缩无收益,保留原文件)`)
    return { before, after: before }
  }
  // Windows 下可能因文件锁/杀毒占用导致 rename 失败,重试几次
  let renamed = false
  for (let i = 0; i < 6; i++) {
    try { fs.renameSync(tmp, outPath); renamed = true; break } catch { await new Promise(r => setTimeout(r, 300)) }
  }
  if (!renamed) {
    try { fs.unlinkSync(tmp) } catch {}
    console.warn(`  ⚠ 跳过(文件锁): ${task.src}`)
    return null
  }
  const after = fs.statSync(outPath).size
  const saved = ((1 - after / before) * 100).toFixed(0)
  const outRel = path.relative(root, outPath)
  console.log(`  ${task.src} [${meta.width}x${meta.height}] ${fmtKB(before)} → ${outRel} [${task.width && meta.width > task.width ? task.width : meta.width}w] ${fmtKB(after)} (-${saved}%)`)
  return { before, after }
}

async function run(tasks, label) {
  console.log(`\n=== ${label} (${tasks.length} 张) ===`)
  let totalBefore = 0, totalAfter = 0
  for (const t of tasks) {
    const r = await compressOne(t)
    if (r) { totalBefore += r.before; totalAfter += r.after }
  }
  console.log(`  小计: ${fmtKB(totalBefore)} → ${fmtKB(totalAfter)} (节省 ${fmtKB(totalBefore - totalAfter)}, -${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`)
}

async function main() {
  const mode = process.argv[2] || 'all'
  if (mode === 'hero' || mode === 'all') await run(heroTasks, 'P0 hero 贴图')
  if (mode === 'images' || mode === 'all') await run(imageTasks, 'P1 avatars/images 大图')
  console.log('\n完成。')
}

main().catch(e => { console.error(e); process.exit(1) })
