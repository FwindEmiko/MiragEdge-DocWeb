import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.resolve(__dirname, '../../config.mts')

/**
 * 配置文件结构自动化验证
 *
 * 设计目标：免维护——直接读取真实 config.mts 源码做静态分析，
 * 无需执行 vitepress 构建即可验证配置完整性。当 config.mts 结构
 * 发生破坏性变更（如缺失必要字段）时自动失败，提前在 CI 暴露问题。
 */
describe('VitePress 配置文件验证', () => {
  const configSource = fs.readFileSync(configPath, 'utf-8')

  describe('文件存在性', () => {
    it('config.mts 文件应存在', () => {
      expect(fs.existsSync(configPath)).toBe(true)
    })

    it('应使用 defineConfig 导出配置', () => {
      expect(configSource).toMatch(/export\s+default\s+defineConfig\s*\(/)
    })
  })

  describe('顶层必要字段', () => {
    it('应配置 title（字符串字面量或常量引用）', () => {
      // 允许字符串字面量或常量引用（如 SITE_TITLE）
      const hasLiteral = /title:\s*['"`][^'"`]+['"`]/.test(configSource)
      const hasConstRef = /title:\s*[A-Z_][A-Z0-9_]*/.test(configSource)
      expect(hasLiteral || hasConstRef).toBe(true)
    })

    it('应配置 description（字符串字面量或常量引用）', () => {
      // 允许字符串字面量或常量引用（如 SITE_DESCRIPTION）
      const hasLiteral = /description:\s*['"`][^'"`]+['"`]/.test(configSource)
      const hasConstRef = /description:\s*[A-Z_][A-Z0-9_]*/.test(configSource)
      expect(hasLiteral || hasConstRef).toBe(true)
    })

    it('应配置 base 路径', () => {
      expect(configSource).toMatch(/base:\s*['"`][^'"`]+['"`]/)
    })

    it('应配置 outDir 输出目录', () => {
      expect(configSource).toMatch(/outDir:\s*['"`][^'"`]+['"`]/)
    })
  })

  describe('locales 与 head 配置', () => {
    it('应配置 locales 多语言', () => {
      expect(configSource).toMatch(/locales:\s*\{/)
    })

    it('应配置中文根 locale', () => {
      expect(configSource).toMatch(/lang:\s*['"`]zh-CN['"`]/)
    })

    it('应配置 head 数组（SEO/OG 标签）', () => {
      expect(configSource).toMatch(/head:\s*\[/)
    })

    it('head 应包含 Open Graph 元数据', () => {
      expect(configSource).toMatch(/og:title/)
      expect(configSource).toMatch(/og:description/)
      expect(configSource).toMatch(/og:image/)
    })

    it('head 应包含 canonical 或 JSON-LD 结构化数据', () => {
      const hasCanonical = /rel:\s*['"`]canonical['"`]/.test(configSource)
      const hasJsonLd = /application\/ld\+json/.test(configSource)
      expect(hasCanonical || hasJsonLd).toBe(true)
    })
  })

  describe('themeConfig 配置', () => {
    it('应配置 themeConfig 对象', () => {
      expect(configSource).toMatch(/themeConfig:\s*\{/)
    })

    it('应配置本地搜索', () => {
      expect(configSource).toMatch(/search:\s*\{/)
      expect(configSource).toMatch(/provider:\s*['"`]local['"`]/)
    })

    it('应配置 nav 导航栏数组', () => {
      expect(configSource).toMatch(/nav:\s*\[/)
    })

    it('应配置 sidebar 侧边栏', () => {
      expect(configSource).toMatch(/sidebar/)
    })

    it('应配置 outline 本页目录', () => {
      expect(configSource).toMatch(/outline:\s*\{/)
      expect(configSource).toMatch(/label:\s*['"`]本页目录['"`]/)
    })
  })

  describe('Markdown 与 Vite 配置', () => {
    it('应配置 markdown 主题', () => {
      expect(configSource).toMatch(/markdown:\s*\{/)
    })

    it('应启用代码行号', () => {
      expect(configSource).toMatch(/lineNumbers:\s*true/)
    })

    it('应配置 vite 插件（mermaid 等）', () => {
      expect(configSource).toMatch(/plugins:\s*\[/)
    })
  })

  describe('SEO 与构建版本', () => {
    it('应注入构建版本标识 meta（x-build-id）', () => {
      expect(configSource).toMatch(/x-build-id/)
    })

    it('应配置 transformHead 钩子（自动注入每页 SEO）', () => {
      expect(configSource).toMatch(/transformHead\s*\(/)
    })

    it('应配置 transformPageData 钩子（自动补全描述）', () => {
      expect(configSource).toMatch(/transformPageData\s*\(/)
    })
  })
})
