// 阶段 1 门禁：验证 /features/ 存根不再覆盖真实页 + 统计存根/真实页数量
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const DIST = path.join(ROOT, '.vitepress', 'dist')

if (!fs.existsSync(DIST)) { console.log('dist 不存在，先跑构建'); process.exit(1) }

const MARK = '页面已迁移'
const isStub = (f) => fs.readFileSync(f, 'utf8').includes(MARK)

let stub = 0, real = 0
const stubs = []
;(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk(p)
    else if (e.name.endsWith('.html')) {
      if (isStub(p)) { stub++; stubs.push(path.relative(DIST, p).split(path.sep).join('/')) }
      else real++
    }
  }
})(DIST)

console.log(`dist 内：真实页 ${real} 个，重定向存根 ${stub} 个`)

// ① /features/ 根：必须是真实页
const featRoot = path.join(DIST, 'features', 'index.html')
const featHtml = path.join(DIST, 'features.html')
console.log('\n① /features/ 碰撞检查')
for (const f of [featRoot, featHtml]) {
  if (!fs.existsSync(f)) { console.log(`   ${path.relative(DIST, f)} —— 不存在`); continue }
  console.log(`   ${path.relative(DIST, f)} —— ${isStub(f) ? '❌ 仍是存根（碰撞未修）' : '✅ 真实页'}`)
}

// ② 是否还有 plugins/ 存根残留（plugins 目录应只作为旧 URL 存根存在）
const pluginsStubs = stubs.filter((s) => s.startsWith('plugins/') || s === 'plugins.html')
console.log(`\n② /plugins/* 旧 URL 存根：${pluginsStubs.length} 个（应存在，用于旧链接跳转）`)
pluginsStubs.slice(0, 6).forEach((s) => console.log('   ' + s))

// ③ sky-elytra 的孤儿存根是否已被守卫修掉
const skyA = path.join(DIST, 'features', 'sky-elytra.html')
const skyB = path.join(DIST, 'features', 'sky-elytra', 'index.html')
console.log('\n③ sky-elytra 双变体')
for (const f of [skyA, skyB]) {
  if (!fs.existsSync(f)) console.log(`   ${path.relative(DIST, f)} —— 不存在`)
  else console.log(`   ${path.relative(DIST, f)} —— ${isStub(f) ? '存根' : '真实页'}`)
}

// ④ 存根与真实页同路径冲突（同一路由两个文件一真一假）
const realSet = new Set()
;(function walk2(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name)
    if (e.isDirectory()) walk2(p)
    else if (e.name.endsWith('.html') && !isStub(p)) {
      const rel = path.relative(DIST, p).split(path.sep).join('/')
      realSet.add(rel.replace(/\/index\.html$/, '').replace(/\.html$/, ''))
    }
  }
})(DIST)
const conflicts = stubs.filter((s) => realSet.has(s.replace(/\/index\.html$/, '').replace(/\.html$/, '')))
console.log(`\n④ 存根与真实页同路由冲突：${conflicts.length}`)
conflicts.slice(0, 10).forEach((c) => console.log('   ! ' + c))

console.log(`\n===== ${stub > 0 && conflicts.length === 0 && !isStubIfExists(featRoot) ? 'PASS' : '需检查'} =====`)

function isStubIfExists(f) { return fs.existsSync(f) ? isStub(f) : true }
