import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const P = path.join(ROOT, '.gitignore')
const lines = fs.readFileSync(P, 'utf8').split('\n')

// 定位「临时文件」段，只保留最后一份
const start = lines.findIndex((l) => l.includes('临时文件') && l.includes('提交信息'))
// 往上找该段的注释行（可能因乱码不含关键词）——改为从 public/review/*.md 之后整段重建
const anchor = lines.findIndex((l) => l.trim() === 'public/review/*.md')
if (anchor === -1) { console.error('未找到锚点'); process.exit(1) }

const head = lines.slice(0, anchor + 1)
const tail = [
  '',
  '# 临时文件（提交信息 / 暂存）',
  '.commitmsg.tmp',
  'COMMIT_MSG_TMP.txt',
  '*.tmp',
  '',
]
fs.writeFileSync(P, head.join('\n') + '\n' + tail.join('\n'), 'utf8')
console.log('✓ 已重建 .gitignore 尾部')
console.log('--- 结果 ---')
console.log(fs.readFileSync(P, 'utf8').split('\n').slice(-10).join('\n'))
