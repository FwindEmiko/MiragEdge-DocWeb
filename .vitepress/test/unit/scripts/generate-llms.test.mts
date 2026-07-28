import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  cleanMarkdown,
  parseFrontmatter,
  extractH1,
  extractFirstParagraph,
  processVueComponents,
  scanMarkdownFiles,
  generateLlms,
} from '../../../../scripts/generate-llms.mjs'

// ============================================================
// parseFrontmatter
// ============================================================
describe('parseFrontmatter', () => {
  it('无 frontmatter 时返回空对象', () => {
    expect(parseFrontmatter('# 仅标题\n\n正文')).toEqual({})
  })

  it('解析简单 title / description 标量字段', () => {
    const raw = `---
title: 附魔大全
description: 服务器的附魔系统说明
---

# 正文`
    expect(parseFrontmatter(raw)).toEqual({
      title: '附魔大全',
      description: '服务器的附魔系统说明',
    })
  })

  it('剥离单双引号包裹的值', () => {
    const raw = `---
title: "带引号标题"
description: '单引号描述'
layout: home
---

正文`
    expect(parseFrontmatter(raw)).toEqual({
      title: '带引号标题',
      description: '单引号描述',
      layout: 'home',
    })
  })

  it('识别 layout / outline / lastUpdated 字段', () => {
    const raw = `---
layout: doc
outline: deep
lastUpdated: 2026-07-28
title: 测试页
---

正文`
    const fm = parseFrontmatter(raw)
    expect(fm.layout).toBe('doc')
    expect(fm.outline).toBe('deep')
    expect(fm.lastUpdated).toBe('2026-07-28')
    expect(fm.title).toBe('测试页')
  })

  it('跳过块级字段（hero / features 等缩进块）', () => {
    const raw = `---
title: 首页
layout: home
hero:
  name: 锐界幻境
  tagline: 口号
features:
  - title: 特性一
    details: 详情
---

正文`
    const fm = parseFrontmatter(raw)
    // 仅保留顶层标量，块字段不应出现
    expect(fm).toEqual({ title: '首页', layout: 'home' })
    expect(fm).not.toHaveProperty('hero')
    expect(fm).not.toHaveProperty('features')
  })
})

// ============================================================
// extractH1
// ============================================================
describe('extractH1', () => {
  it('返回首个 H1 文本', () => {
    expect(extractH1('# 附魔大全\n\n正文')).toBe('附魔大全')
  })

  it('跳过 H2 / H3，仅匹配 H1', () => {
    expect(extractH1('## 二级\n### 三级\n# 一级\n')).toBe('一级')
  })

  it('无 H1 时返回空字符串', () => {
    expect(extractH1('只有正文\n## 二级标题')).toBe('')
  })

  it('容忍标题尾随空白', () => {
    expect(extractH1('# 标题   \n')).toBe('标题')
  })
})

// ============================================================
// extractFirstParagraph
// ============================================================
describe('extractFirstParagraph', () => {
  it('跳过标题与引用，返回第一段正文', () => {
    const md = '# 标题\n\n> 引用说明\n\n这是第一段正文内容足够长。'
    expect(extractFirstParagraph(md)).toBe('这是第一段正文内容足够长。')
  })

  it('剥离行内 markdown 语法（粗体 / 行内代码 / 链接）', () => {
    const md = '# 标题\n\n这是 **粗体** 和 `代码` 与 [链接文字](/path) 的混合段落。'
    expect(extractFirstParagraph(md)).toBe('这是 粗体 和 代码 与 链接文字 的混合段落。')
  })

  it('跳过列表项与表格行', () => {
    const md = '# 标题\n\n- 列表项\n\n| 表头 |\n| --- |\n\n这是真正的段落内容。'
    expect(extractFirstParagraph(md)).toBe('这是真正的段落内容。')
  })

  it('跳过 HTML 标签起始行', () => {
    const md = '# 标题\n\n<div>html</div>\n\n真正的纯文本段落内容。'
    expect(extractFirstParagraph(md)).toBe('真正的纯文本段落内容。')
  })

  it('超长段落截断并加省略号', () => {
    const long = '字'.repeat(300)
    const result = extractFirstParagraph(`# 标题\n\n${long}`)
    expect(result.length).toBe(201)
    expect(result.endsWith('…')).toBe(true)
  })

  it('无可用段落时返回空字符串', () => {
    expect(extractFirstParagraph('# 只有标题\n## 二级')).toBe('')
  })
})

// ============================================================
// processVueComponents
// ============================================================
describe('processVueComponents', () => {
  it('自闭合组件替换为占位说明', () => {
    const out = processVueComponents('<EnchantmentList />')
    expect(out).toContain('[Vue 组件: EnchantmentList')
    expect(out).toContain('内容由前端动态渲染')
  })

  it('提取自闭合组件的 title / link / icon 属性', () => {
    const out = processVueComponents('<FeatureCard title="基础内容" link="/features/base" icon="💰" />')
    expect(out).toContain('title="基础内容"')
    expect(out).toContain('link="/features/base"')
    expect(out).toContain('icon="💰"')
  })

  it('容器型组件保留内部文本并加组件头注释', () => {
    const out = processVueComponents('<ClientOnly>\n  加载中的内容\n</ClientOnly>')
    expect(out).toContain('[Vue 组件: ClientOnly]')
    expect(out).toContain('加载中的内容')
  })

  it('保留代码块内的 Vue 标签原样不动', () => {
    const md = '```vue\n<FeatureCard title="x" />\n```\n\n正文段落。'
    const out = processVueComponents(md)
    expect(out).toContain('```vue\n<FeatureCard title="x" />\n```')
    // 代码块外的内容不应被误伤
    expect(out).toContain('正文段落。')
  })

  it('剥离行内 HTML 标签但保留内容', () => {
    const out = processVueComponents('<span>行内文本</span>')
    expect(out).toBe('行内文本')
  })
})

// ============================================================
// cleanMarkdown
// ============================================================
describe('cleanMarkdown', () => {
  it('剥离 YAML frontmatter、脚本、样式、HTML 注释', () => {
    const raw = `---
title: 测试页
description: 描述
---

# 测试页

<!-- 一段注释 -->

<script setup>
import { ref } from 'vue'
const x = ref(1)
</script>

<style>
.foo { color: red; }
</style>

正文段落。`
    const { body, title, description, frontmatter } = cleanMarkdown(raw, 'test/page.md')
    expect(title).toBe('测试页')
    expect(description).toBe('描述')
    expect(frontmatter.title).toBe('测试页')
    expect(body).not.toContain('---')
    expect(body).not.toContain('<script')
    expect(body).not.toContain('<style')
    expect(body).not.toContain('一段注释')
    expect(body).toContain('# 测试页')
    expect(body).toContain('正文段落。')
  })

  it('剥离 VitePress 容器标记 ::: 但保留内部内容', () => {
    const raw = `# 页面

::: tip 提示
这是提示内容。
:::

后续段落。`
    const { body } = cleanMarkdown(raw, 'page.md')
    expect(body).not.toContain(':::')
    expect(body).toContain('这是提示内容。')
    expect(body).toContain('后续段落。')
  })

  it('相对链接转换为站点绝对地址', () => {
    const raw = `# 页面

[同级链接](./other.md) [根链接](/manual/faq) ![图片](./img/a.png)`
    const { body } = cleanMarkdown(raw, 'manual/page.md')
    expect(body).toContain('https://miragedge.top/manual/other.md')
    expect(body).toContain('https://miragedge.top/manual/faq')
    expect(body).toContain('https://miragedge.top/manual/img/a.png')
  })

  it('保留外部链接与锚点不动', () => {
    const raw = `# 页面

[外链](https://example.com) [锚点](#section) [邮件](mailto:a@b.com)`
    const { body } = cleanMarkdown(raw, 'page.md')
    expect(body).toContain('https://example.com')
    expect(body).toContain('#section')
    expect(body).toContain('mailto:a@b.com')
  })

  it('折叠 3 个及以上换行为 2 个', () => {
    const raw = `# 标题



正文。`
    const { body } = cleanMarkdown(raw, 'page.md')
    expect(body).not.toMatch(/\n{3,}/)
  })

  it('layout: home 页面把 hero / features 展开为 Markdown', () => {
    const raw = `---
layout: home
hero:
  name: 锐界幻境
  text: 文档中心
  tagline: 远离困扰之地
  actions:
    - text: 玩家指南
      link: /manual/review
features:
  - title: 创新玩法
    details: 独家轻 RPG 体系
  - title: 高性能
    details: TPS 稳定 20
---

<script setup>
// 特效脚本
</script>`
    const { body, title, frontmatter } = cleanMarkdown(raw, 'index.md')
    expect(frontmatter.layout).toBe('home')
    // hero 展开为 H1
    expect(body).toContain('# 锐界幻境 · 文档中心')
    expect(body).toContain('> 远离困扰之地')
    // features 展开为 H3
    expect(body).toContain('### 创新玩法')
    expect(body).toContain('独家轻 RPG 体系')
    expect(body).toContain('### 高性能')
    expect(body).toContain('TPS 稳定 20')
    // 快速入口
    expect(body).toContain('快速入口：')
    expect(body).toContain('[玩家指南](https://miragedge.top/manual/review)')
    // 特效脚本应被剥离
    expect(body).not.toContain('特效脚本')
  })

  it('frontmatter 缺失 title 时回退到 H1', () => {
    const raw = `---
description: 有描述无标题
---

# 从 H1 提取的标题

正文。`
    const { title } = cleanMarkdown(raw, 'page.md')
    expect(title).toBe('从 H1 提取的标题')
  })

  it('frontmatter 与 H1 均无标题时回退到文件名', () => {
    const raw = `---
description: 描述
---

只有正文没有标题。`
    const { title } = cleanMarkdown(raw, 'features/some-page.md')
    expect(title).toBe('some-page')
  })
})

// ============================================================
// scanMarkdownFiles（使用临时目录隔离测试）
// ============================================================
describe('scanMarkdownFiles', () => {
  let tmpRoot: string

  beforeAll(() => {
    tmpRoot = mkdtempSync(join(tmpdir(), 'llms-scan-'))
    // 构造目录结构：
    //   /a.md
    //   /manual/b.md
    //   /manual/sub/c.md
    //   /features/d.md
    //   /node_modules/ignored.md   <- 应被默认排除
    //   /public/ignored.md         <- 应被默认排除
    //   /.hidden.md                <- 应被跳过（隐藏文件）
    mkdirSync(join(tmpRoot, 'manual', 'sub'), { recursive: true })
    mkdirSync(join(tmpRoot, 'features'), { recursive: true })
    mkdirSync(join(tmpRoot, 'node_modules'), { recursive: true })
    mkdirSync(join(tmpRoot, 'public'), { recursive: true })
    writeFileSync(join(tmpRoot, 'a.md'), '# a')
    writeFileSync(join(tmpRoot, 'manual', 'b.md'), '# b')
    writeFileSync(join(tmpRoot, 'manual', 'sub', 'c.md'), '# c')
    writeFileSync(join(tmpRoot, 'features', 'd.md'), '# d')
    writeFileSync(join(tmpRoot, 'node_modules', 'ignored.md'), '# ignored')
    writeFileSync(join(tmpRoot, 'public', 'ignored.md'), '# ignored')
    writeFileSync(join(tmpRoot, '.hidden.md'), '# hidden')
  })

  afterAll(() => {
    rmSync(tmpRoot, { recursive: true, force: true })
  })

  it('递归扫描所有 .md 文件并返回 posix 路径', () => {
    const files = scanMarkdownFiles(tmpRoot)
    expect(files).toContain('a.md')
    expect(files).toContain('manual/b.md')
    expect(files).toContain('manual/sub/c.md')
    expect(files).toContain('features/d.md')
  })

  it('默认排除 node_modules / public 等目录', () => {
    const files = scanMarkdownFiles(tmpRoot)
    expect(files.some((f) => f.includes('node_modules'))).toBe(false)
    expect(files.some((f) => f.includes('public'))).toBe(false)
  })

  it('跳过隐藏文件', () => {
    const files = scanMarkdownFiles(tmpRoot)
    expect(files.some((f) => f.startsWith('.'))).toBe(false)
  })

  it('结果已排序', () => {
    const files = scanMarkdownFiles(tmpRoot)
    const sorted = [...files].sort()
    expect(files).toEqual(sorted)
  })

  it('支持自定义 excludeDirs', () => {
    // 把 features 也排除
    const files = scanMarkdownFiles(tmpRoot, new Set(['features', 'node_modules', 'public']))
    expect(files).toContain('a.md')
    expect(files).toContain('manual/b.md')
    expect(files.some((f) => f.startsWith('features/'))).toBe(false)
  })

  it('Windows 反斜杠路径被规范化为 posix 风格', () => {
    const files = scanMarkdownFiles(tmpRoot)
    // 所有路径都不应包含反斜杠
    expect(files.every((f) => !f.includes('\\'))).toBe(true)
  })
})

// ============================================================
// generateLlms（checkOnly 集成测试，不写文件）
// ============================================================
describe('generateLlms', () => {
  it('checkOnly 模式扫描真实源码并返回统计，不写文件', () => {
    const result = generateLlms({ checkOnly: true })
    expect(result.totalFiles).toBeGreaterThan(100)
    expect(result.cleanedCount).toBe(result.totalFiles)
    expect(result.failures).toEqual([])
    // 四个主分区都有页面
    expect(result.sectionCounts.manual).toBeGreaterThan(0)
    expect(result.sectionCounts.features).toBeGreaterThan(0)
    expect(result.sectionCounts.plugins).toBeGreaterThan(0)
    expect(result.sectionCounts.develop).toBeGreaterThan(0)
    expect(result.rootCount).toBeGreaterThan(0)
  })

  it('checkOnly 模式不返回写盘相关字段', () => {
    const result = generateLlms({ checkOnly: true })
    expect(result).not.toHaveProperty('pageMdCount')
    expect(result).not.toHaveProperty('fullSnapshotBytes')
  })
})
