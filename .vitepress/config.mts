import { defineConfig } from 'vitepress'
import { MermaidPlugin, MermaidMarkdown } from "vitepress-plugin-mermaid";
import addContributorsPlugin from './theme/addContributors';
import { legacyRedirectsPlugin } from './legacy-redirects';
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function normalizeBasePath(value: string | undefined): string {
  const path = value?.trim()
  if (!path || path === '/') return '/'
  return `/${path.replace(/^\/+|\/+$/g, '')}/`
}

const BASE_PATH = normalizeBasePath(process.env.VITEPRESS_BASE)
const withBasePath = (path: string): string => `${BASE_PATH}${path.replace(/^\/+/, '')}`

// 站点常量：用于 OG / canonical / JSON-LD 等绝对地址
const SITE_HOST = 'https://miragedge.top'
const SITE_TITLE = 'MiragEdge 文档中心'
const SITE_DESCRIPTION = '锐界幻境 Minecraft 互通生存服务器官方文档中心，提供玩家入服指南、玩法教程、插件使用说明与开发技术文档。'
const SITE_OG_IMAGE = `${SITE_HOST}/title_img/xingjiu.png`

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,

  // 基础路径，如果部署在子路径下需要设置
  base: BASE_PATH,

  // 输出目录
  outDir: '.vitepress/dist',

  // 语言配置
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      description: SITE_DESCRIPTION,
    }
  },

  // 头部配置
  head: [
    ['link', { rel: 'icon', href: withBasePath('/title_img/favicon-32x32.png'), sizes: '32x32' }],
    ['link', { rel: 'icon', href: withBasePath('/title_img/favicon-16x16.png'), sizes: '16x16' }],
    ['link', { rel: 'apple-touch-icon', href: withBasePath('/title_img/apple-touch-icon.png'), sizes: '180x180' }],
    ['link', { rel: 'manifest', href: withBasePath('/site.webmanifest') }],
    // 预连接关键第三方域名，加速 OG 图片与字体加载
    ['link', { rel: 'preconnect', href: 'https://oss.miragedge.top' }],
    ['meta', { name: 'theme-color', content: '#3c8772' }],
    // 构建版本标识：注入到每个 HTML 的 <head>，供前端版本检测对比 /version.json
    // 值与 vite define 中的 __BUILD_ID__ / __BUILD_SHA__ 保持一致（构建时求值）
    // 用于 ESA 边缘缓存场景下检测旧 HTML 并触发自动刷新
    ['meta', { name: 'x-build-id', content: process.env.GITHUB_RUN_NUMBER || 'dev' }],
    ['meta', { name: 'x-build-sha', content: process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : '' }],
    // 移除 maximum-scale/user-scalable=no（违反 WCAG 1.4.4，阻止视力不佳用户缩放）
    // 启用 viewport-fit=cover 让安全区 env(safe-area-inset-*) 生效（iPhone 刘海/Home Indicator）
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }],
    // 全局关键词：覆盖品牌词、品类词、玩法词、技术词，提升长尾检索命中率
    ['meta', { name: 'keywords', content: 'MiragEdge, 锐界幻境, Minecraft, 我的世界, 我的世界服务器, 生存服务器, 互通服务器, Java版, 基岩版, 1.21, 文档, 玩家手册, 入服教程, 附魔, 更多附魔, 钓鱼, 季节系统, 食物, 经济系统, 领地, PVP, 插件, 狐风轩汐, FwindEmi, F.windEmiko, Aiyatsbus, EvenMoreFish, CustomCrops' }],
    ['meta', { name: 'author', content: 'F.windEmiko (狐风轩汐)' }],
    ['meta', { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' }],
    ['meta', { name: 'language', content: 'zh-CN' }],
    ['meta', { name: 'referrer', content: 'strict-origin-when-cross-origin' }],
    // Open Graph：使用绝对地址，确保社交平台/搜索引擎正确抓取卡片
    ['meta', { property: 'og:site_name', content: SITE_TITLE }],
    ['meta', { property: 'og:title', content: SITE_TITLE }],
    ['meta', { property: 'og:description', content: SITE_DESCRIPTION }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: SITE_OG_IMAGE }],
    ['meta', { property: 'og:image:alt', content: '锐界幻境 MiragEdge 文档中心' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:url', content: SITE_HOST }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: SITE_OG_IMAGE }],
    ['meta', { name: 'twitter:image:alt', content: '锐界幻境 MiragEdge 文档中心' }],
    ['meta', { name: 'twitter:creator', content: '@MiragEdge' }],
    ['meta', { name: 'twitter:site', content: '@MiragEdge' }],
    // JSON-LD 结构化数据：WebSite schema，帮助搜索引擎理解站点结构并启用站内搜索框 (Sitelinks Search Box)
    ['script', { type: 'application/ld+json' }, JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': SITE_TITLE,
      'alternateName': '锐界幻境文档',
      'url': SITE_HOST,
      'description': SITE_DESCRIPTION,
      'inLanguage': 'zh-CN',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${SITE_HOST}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    })],
    // 页面特效开关：在 Vue 水合前同步读取 localStorage 并设置 effects-disabled 类
    // 避免刷新后开关显示与实际状态不一致的问题
    ['script', {}, `(
      function() {
        try {
          var stored = localStorage.getItem('miragedge-effects-enabled');
          var isMobile = window.innerWidth <= 767;
          var enabled = stored === null ? !isMobile : stored === 'true';
          if (!enabled) document.documentElement.classList.add('effects-disabled');
        } catch(e) {}
      }
    )()`],
    // 百度站点验证（如果需要）
    // ['meta', { name: 'baidu-site-verification', content: 'code-xxxxxxxx' }],
    // 360站点验证（如果需要）
    // ['meta', { name: '360-site-verification', content: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }],
  ],

  // 自动注入每页 SEO：canonical / og:url / og:title / og:description / description / article meta
  // 通过 transformHead 钩子基于 pageData 动态生成，避免在每个 md frontmatter 重复配置
  transformHead(context) {
    const page = context.pageData
    // 规范化相对路径：去掉 .md / index 结尾，得到干净的 URL 路径
    // pageData.relativePath 在 VitePress 1.x 中始终可用
    const rawRel = (page.relativePath || '').replace(/\\/g, '/')
    let relPath = rawRel
      .replace(/\.md$/, '')
      .replace(/(^|\/)index$/, '$1')
    const canonicalUrl = relPath ? `${SITE_HOST}/${relPath}` : `${SITE_HOST}/`

    // 页面标题：优先用 frontmatter title，其次 frontmatter 中无则用页内第一个 H1
    const pageTitle = page.frontmatter.title
      ? `${page.frontmatter.title} | ${SITE_TITLE}`
      : page.title
        ? `${page.title} | ${SITE_TITLE}`
        : SITE_TITLE

    // 页面描述：优先 frontmatter.description，否则留空（由 transformPageData 自动补全）
    const pageDescription = page.frontmatter.description || page.description || SITE_DESCRIPTION

    // 文章类型页面使用 article OG，列表/首页使用 website
    const isArticle = !page.frontmatter.layout
      && rawRel !== 'index.md'
      && rawRel !== ''

    const tags: any[] = [
      // canonical：避免重复内容惩罚，统一权重到规范 URL
      ['link', { rel: 'canonical', href: canonicalUrl }],
      // 每页覆盖 og 标签，确保社交分享卡片准确
      ['meta', { property: 'og:url', content: canonicalUrl }],
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
    ]

    if (isArticle) {
      tags.push(['meta', { property: 'og:type', content: 'article' }])
      tags.push(['meta', { property: 'article:author', content: 'F.windEmiko (狐风轩汐)' }])
      tags.push(['meta', { property: 'article:section', content: '锐界幻境文档' }])
      if (page.frontmatter.lastUpdated) {
        tags.push(['meta', { property: 'article:modified_time', content: new Date(page.frontmatter.lastUpdated).toISOString() }])
      }
    } else {
      tags.push(['meta', { property: 'og:type', content: 'website' }])
    }

    // 面包屑 JSON-LD：为非首页注入 BreadcrumbList，提升搜索结果展示层级
    if (relPath) {
      const segments = relPath.split('/').filter(Boolean)
      const itemList: any[] = [{
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: SITE_HOST
      }]
      let acc = ''
      segments.forEach((seg, idx) => {
        acc += '/' + seg
        const name = page.frontmatter.title || decodeURIComponent(seg)
        itemList.push({
          '@type': 'ListItem',
          position: idx + 2,
          name,
          item: `${SITE_HOST}${acc}`
        })
      })
      tags.push(['script', { type: 'application/ld+json' }, JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: itemList
      })])
    }

    return tags
  },

  // 自动补全页面描述：当 md 未声明 description 时，从源文件正文首段提取摘要作为 meta description
  // 提取规则：跳过 frontmatter / 代码块 / Vue 组件标签 / 引用块，取第一段纯文本，截断到约 150 字
  transformPageData(pageData, ctx) {
    if (pageData.frontmatter.description) {
      // 已显式声明，保留原值并同步到 description 字段（VitePress 会读取该字段生成 meta）
      pageData.description = pageData.frontmatter.description
      return
    }
    // pageData 没有 content 字段，需从磁盘读取源 markdown 文件
    const rel = (pageData.relativePath || '').replace(/\\/g, '/')
    if (!rel) return
    const srcDir = ctx?.siteConfig?.srcDir || process.cwd()
    const fullPath = path.resolve(srcDir, rel)
    let raw = ''
    try {
      raw = fs.readFileSync(fullPath, 'utf-8')
    } catch {
      return
    }
    // 去掉 YAML frontmatter（--- 包裹块）
    raw = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    const lines = raw.split(/\r?\n/)
    let desc = ''
    let inCodeFence = false
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.startsWith('```')) { inCodeFence = !inCodeFence; continue }
      if (inCodeFence) continue
      // 跳过标题、引用、Vue 组件、HTML 标签、列表符号、容器提示
      if (!trimmed) continue
      if (trimmed.startsWith('#')) continue
      if (trimmed.startsWith('>')) continue
      if (trimmed.startsWith('<')) continue
      if (trimmed.startsWith(':::')) continue
      if (/^[-*+\d]/.test(trimmed)) continue
      // 去除行内 Markdown 语法，保留纯文本
      const text = trimmed
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        .trim()
      if (text.length >= 8) {
        desc = text
        break
      }
    }
    if (desc) {
      // 截断到 150 字符，避免搜索结果摘要过长被截断
      pageData.description = desc.length > 150 ? desc.slice(0, 150) + '…' : desc
      pageData.frontmatter.description = pageData.description
    }
  },

  // Markdown 配置
  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark'
    },
    lineNumbers: true, // 显示代码行号
    config(md) {
      md.use(MermaidMarkdown);
      // 给所有 markdown 图片自动加 loading="lazy",减少非首屏图片并发请求
      const defaultImage = md.renderer.rules.image
       md.renderer.rules.image = (tokens, idx, options, env, self) => {
         const token = tokens[idx]
         if (token.attrIndex('loading') < 0) token.attrPush(['loading', 'lazy'])
         return defaultImage(tokens, idx, options, env, self)
       }
       // 正文的跨页引用始终新开标签，避免读者在长教程间跳转后失去当前位置。
       const defaultLinkOpen = md.renderer.rules.link_open ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
       md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
         const token = tokens[idx]
         const href = token.attrGet('href') ?? ''
         if (href && !href.startsWith('#') && !/^(mailto:|tel:|javascript:)/i.test(href)) {
           token.attrSet('target', '_blank')
           token.attrSet('rel', 'noopener noreferrer')
         }
         return defaultLinkOpen(tokens, idx, options, env, self)
       }
      // mcfunction 不是 Shiki 内置语言，映射到 bash 语法高亮（注释/命令风格接近）
      const fence = md.renderer.rules.fence!
      md.renderer.rules.fence = (...args) => {
        const [tokens, idx] = args
        const token = tokens[idx]
        const info = token.info.trim()
        if (!info.startsWith('mcfunction')) return fence(...args)
        token.info = info.replace('mcfunction', 'bash')
        let html = fence(...args)
        token.info = info
        html = html.replace(/class="language-bash"/g, 'class="language-mcfunction"')
        html = html.replace(/>bash</g, '>mcfunction<')
        return html
      }
    },
  },

  // Vite 配置
  vite: {
    define: {
      __BUILD_ID__: JSON.stringify(process.env.GITHUB_RUN_NUMBER || 'dev'),
      __BUILD_SHA__: JSON.stringify(process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : ''),
    },
    plugins: [
      MermaidPlugin() as any,
      addContributorsPlugin() as any,
      legacyRedirectsPlugin(),
    ],
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBarExtra\.vue$/,
          replacement: path.resolve(__dirname, './theme/components/vue/CustomNavBarExtra.vue')
        }
      ]
    },
    optimizeDeps: {
      include: ['mermaid', 'vue']
    },
    ssr: {
      noExternal: ['mermaid', /^vitepress/]
    },
    // 构建优化
    build: {
      chunkSizeWarningLimit: 2000, // 提高 chunk 大小警告限制
      sourcemap: false, // 生产环境关闭 sourcemap
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            // mermaid 及其生态依赖单独分包，利用 Rollup 自动解析依赖关系避免循环 chunk
            'vendor-mermaid': ['mermaid'],
          }
        }
      }
    },
    server: {
      fs: {
        allow: ['..', '.'] // 允许访问父目录和当前目录
      },
      hmr: {
        overlay: true // 显示错误覆盖层
      }
    }
  },
  
  // 主题配置
  themeConfig: {
    // 搜索配置
    search: {
      provider: 'local',// algolia
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭',
                }
              }
            }
          }
        },
        detailedView: true,
        miniSearch: {
          searchOptions: {
            // 模糊匹配 + 前缀匹配，兼顾拼写容错与关键词前缀命中
            fuzzy: 0.2,
            prefix: true,
            combineWith: 'AND',
            // 权重分配：标题命中权重最高（优先展示标题匹配的页面），
            // 内容命中作为补充，提升关键词检索的精准度与排序质量
            boost: { title: 6, content: 1, heading: 3 }
          }
        }
      }
    },
    
    // 品牌标题本身返回首页；顶栏保留玩家常用入口和始终可达的开发入口。
    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '🧭 开始游戏', link: '/start/', activeMatch: '^/start/' },
      { text: '⚒️ 生存玩法', link: '/play/', activeMatch: '^/play/' },
      { text: '✨ 特色功能', link: '/plugins/', activeMatch: '^/plugins/' },
      { text: '🛠️ 开发者文档', link: '/developer/', activeMatch: '^/developer/' },
      {
        text: '更多',
        items: [
          { text: '原创插件文档', link: '/plugin-guides/', activeMatch: '^/plugin-guides/' },
          { text: '历史活动记录', link: '/archive/' },
          { text: '网站源码仓库', link: 'https://github.com/fwindemiko/MiragEdge-DocWeb', target: '_blank', rel: 'noopener noreferrer' },
        ]
      },
    ],

    // 只给一级分区加 emoji；二级及页面名称保持纯文字，便于扫描和搜索。
    sidebar: {
      '/start/': [
        { text: '🧭 开始游戏', link: '/start/' },
        {
          text: '🚪 第一次入服',
          collapsed: false,
          items: [
            { text: '新玩家须知', link: '/start/welcome' },
            { text: '客户端安装', link: '/start/install' },
            { text: '连接服务器', link: '/start/join' },
            { text: '账号绑定', link: '/start/account' },
          ]
        },
        {
          text: '💬 社区与支持',
          collapsed: false,
          items: [
            { text: '支持总览', link: '/start/community/' },
            { text: '玩家交流群组', link: '/start/community/groups' },
            { text: '官方语音频道', link: '/start/community/voice' },
            { text: '群服互通机器人', link: '/start/community/qqbot' },
            { text: '常见问题', link: '/start/community/faq' },
          ]
        },
        {
          text: '🎮 客户端与规则',
          collapsed: false,
          items: [
            { text: '基岩版兼容', link: '/start/bedrock' },
            { text: '客户端扩展', link: '/start/compatibility' },
            { text: '玩家守则', link: '/start/rules' },
          ]
        },
        {
          text: '🏘️ 长期游玩',
          collapsed: false,
          items: [
            { text: '玩家工会', link: '/start/guild' },
            { text: '生电与特性', link: '/start/redstone' },
            { text: '世界观设定', link: '/start/worldview' },
          ]
        },
      ],

      '/play/': [
        { text: '⚒️ 生存玩法', link: '/play/' },
        {
          text: '🏠 安居与协作',
          collapsed: false,
          items: [
            { text: '基础系统总览', link: '/play/systems/' },
            { text: '经济系统', link: '/play/systems/economy' },
            { text: '幻域领地', link: '/play/systems/dom' },
          ]
        },
        {
          text: '🧭 探索与成长',
          collapsed: false,
          items: [
            { text: '冒险总览', link: '/play/adventure/' },
            { text: '战利品与探索区域', link: '/play/adventure/loot' },
            {
              text: '世界与结构',
              link: '/play/adventure/worlds/',
              collapsed: false,
              items: [
                { text: '世界生成', link: '/play/adventure/worlds/worldgen/overview' },
                { text: '野外探索', link: '/play/adventure/worlds/exploration/structures' },
                { text: '结构改造', link: '/play/adventure/worlds/dungeons-and-taverns/structures' },
                { text: '稀有建筑群', link: '/play/adventure/worlds/rare-structures/overview' },
                { text: '沧墟破门', link: '/play/adventure/worlds/hoppo-ruins/structures' },
                { text: '筑物塔楼', link: '/play/adventure/worlds/structory/structures' },
                { text: '趣味内容', link: '/play/adventure/worlds/fun-packs/overview' },
                {
                  text: '烬域',
                  collapsed: true,
                  items: [
                    { text: '群系与结构', link: '/play/adventure/worlds/incendium/biomes' },
                    { text: '生物与 Boss', link: '/play/adventure/worlds/incendium/mobs' },
                    { text: '物品与装备', link: '/play/adventure/worlds/incendium/items' },
                    { text: '原版成就', link: '/play/adventure/worlds/incendium/advancements' },
                  ]
                },
                {
                  text: '繁星',
                  collapsed: true,
                  items: [
                    { text: '群系与结构', link: '/play/adventure/worlds/stellarity/biomes' },
                    { text: '生物与 Boss', link: '/play/adventure/worlds/stellarity/mobs' },
                    { text: '物品与装备', link: '/play/adventure/worlds/stellarity/items' },
                    { text: '原版成就', link: '/play/adventure/worlds/stellarity/advancements' },
                  ]
                },
                { text: '终焉 Boss', link: '/play/adventure/worlds/true-ending/boss' },
              ]
            },
            {
              text: '装备与附魔',
              collapsed: false,
              items: [
                {
                  text: '附魔系统',
                  collapsed: false,
                  items: [
                    { text: '入门说明', link: '/play/adventure/enchantments/info' },
                    { text: '品质等级', link: '/play/adventure/enchantments/rarity' },
                    { text: '附魔大全', link: '/play/adventure/enchantments/list' },
                    { text: '分类搭配', link: '/play/adventure/enchantments/group' },
                    { text: '祛魔系统', link: '/play/adventure/enchantments/separator' },
                    { text: '附魔管理', link: '/play/adventure/enchantments/system' },
                  ]
                },
              ]
            },
          ]
        },
        {
          text: '🌿 建造与生活',
          collapsed: false,
          items: [
            { text: '田园生活总览', link: '/play/life/' },
            {
              text: '钓鱼系统',
              collapsed: false,
              items: [
                { text: '入门说明', link: '/play/life/fishing/info' },
                { text: '鱼竿进阶', link: '/play/life/fishing/rods' },
                { text: '鱼饵系统', link: '/play/life/fishing/baits' },
                { text: '鱼类图鉴', link: '/play/life/fishing/fish' },
                { text: '维度钓鱼', link: '/play/life/fishing/dimensions' },
                { text: '钓鱼比赛', link: '/play/life/fishing/competitions' },
              ]
            },
            {
              text: '食物系统',
              collapsed: false,
              items: [
                { text: '入门说明', link: '/play/life/food/info' },
                { text: '食物速查表', link: '/play/life/food/reference' },
                { text: '早餐简餐', link: '/play/life/food/breakfast' },
                { text: '主菜肉食', link: '/play/life/food/mains' },
                { text: '沙拉凉菜', link: '/play/life/food/salads' },
                { text: '烘焙糕点', link: '/play/life/food/bakery' },
                { text: '甜品', link: '/play/life/food/desserts' },
                { text: '饮品', link: '/play/life/food/drinks' },
                { text: '煎蛋系列', link: '/play/life/food/eggs' },
                { text: '糖果零食', link: '/play/life/food/snacks' },
                { text: '特色食物', link: '/play/life/food/special' },
              ]
            },
            {
              text: '真实季节(暂弃)',
              collapsed: true,
              items: [
                { text: '季节总览', link: '/play/life/seasons/info' },
                { text: '温度系统', link: '/play/life/seasons/temperature' },
                { text: '春季', link: '/play/life/seasons/spring' },
                { text: '夏季', link: '/play/life/seasons/summer' },
                { text: '秋季', link: '/play/life/seasons/fall' },
                { text: '冬季', link: '/play/life/seasons/winter' },
              ]
            },
          ]
        },
      ],

      '/plugins/': [
        { text: '✨ 特色功能', link: '/plugins/' },
        {
          text: '🧰 移动与日常',
          collapsed: false,
          items: [
            { text: '日常便利', link: '/plugins/daily-tools' },
            { text: '星辉锚点', link: '/plugins/custom/miragedge-home' },
            { text: '死亡回程', link: '/plugins/custom/death-return' },
            { text: '幻空翼', link: '/plugins/custom/sky-elytra' },
          ]
        },
        {
          text: '🏗️ 建造与装备',
          collapsed: false,
          items: [
            { text: '建筑大师', link: '/plugins/building-tools' },
            { text: '锻造升级', link: '/plugins/forge' },
            { text: '契约之翼', link: '/plugins/elytra-bind' },
          ]
        },
        {
          text: '💬 交易与互动',
          collapsed: false,
          items: [
            { text: '全服市场', link: '/plugins/custom/global-market' },
            { text: '等价交换商店', link: '/plugins/custom/emc-shop' },
            { text: '知识问答', link: '/plugins/custom/quiz' },
            { text: '月卡与通行权益', link: '/plugins/custom/monthly-pass' },
            { text: '称号与入服消息', link: '/plugins/custom/miragedge-title' },
          ]
        },
        {
          text: '🛡️ 自动规则',
          collapsed: false,
          items: [
            { text: '飞行武器限制', link: '/plugins/custom/flight-guard' },
          ]
        },
      ],

      '/plugin-guides/': [
        { text: '🧩 原创插件文档', link: '/plugin-guides/' },
        {
          text: '📦 已发布插件',
          collapsed: false,
          items: [
            {
              text: 'BugEnchantRemover',
              link: '/plugin-guides/bug-enchant-remover/',
              collapsed: false,
              items: [
                { text: '使用场景', link: '/plugin-guides/bug-enchant-remover/scenarios' },
                { text: '处理命令', link: '/plugin-guides/bug-enchant-remover/commands' },
                { text: '配置说明', link: '/plugin-guides/bug-enchant-remover/config' },
                { text: 'UberEnchant 兼容', link: '/plugin-guides/bug-enchant-remover/uber_enchant' },
              ]
            },
            { text: 'DragonMiao', link: '/plugin-guides/dragonmiao/' },
          ]
        },
      ],

      '/developer/': [
        { text: '🛠️ 开发者文档', link: '/developer/' },
        {
          text: '🔧 开发工作流',
          collapsed: false,
          items: [
            {
              text: '数据包工作流',
              link: '/developer/workflows/datapack/',
              collapsed: true,
              items: [
                { text: '前置与环境', link: '/developer/workflows/datapack/prerequisites' },
                { text: '模块实现', link: '/developer/workflows/datapack/modules' },
                { text: '参考规则', link: '/developer/workflows/datapack/reference' },
                { text: '排错与适配', link: '/developer/workflows/datapack/troubleshooting' },
              ]
            },
            {
              text: 'CraftEngine 工作流',
              link: '/developer/workflows/craftengine/',
              collapsed: true,
              items: [
                { text: '配置参考', link: '/developer/workflows/craftengine/reference' },
                { text: '自定义盔甲模型', link: '/developer/workflows/craftengine/armor' },
              ]
            },
            {
              text: '附魔配置工作流',
              link: '/developer/workflows/enchanting/',
              collapsed: true,
              items: [
                { text: '前置与环境', link: '/developer/workflows/enchanting/prerequisites' },
                { text: '模块实现', link: '/developer/workflows/enchanting/modules' },
                { text: 'Fluxon 参考', link: '/developer/workflows/enchanting/reference' },
                { text: '数据包边界', link: '/developer/workflows/enchanting/datapack-boundaries' },
                { text: '验证与验收', link: '/developer/workflows/enchanting/validation' },
                { text: '排错', link: '/developer/workflows/enchanting/troubleshooting' },
              ]
            },
            { text: '自定义作物工作流', link: '/developer/workflows/custom-crops' },
            {
              text: '钓鱼系统工作流',
              link: '/developer/workflows/fishing/',
              collapsed: true,
              items: [
                { text: '前置与环境', link: '/developer/workflows/fishing/prerequisites' },
                { text: '模块实现', link: '/developer/workflows/fishing/modules' },
                { text: '参考规则', link: '/developer/workflows/fishing/reference' },
                { text: '排错与适配', link: '/developer/workflows/fishing/troubleshooting' },
              ]
            },
          ]
        },
        {
          text: '📚 配置与实现参考',
          collapsed: false,
          items: [
            { text: '服务器模块职责', link: '/developer/reference/server-modules' },
            { text: '附魔 ID 对照表', link: '/developer/reference/enchantment_ids' },
            { text: '附魔配置参考', link: '/developer/reference/enchanting' },
            { text: '钓鱼配置参考', link: '/developer/reference/fishing' },
            { text: '自定义作物参考', link: '/developer/reference/customcrops' },
            { text: '贴图字符码速查表', link: '/developer/reference/sticker' },
          ]
        },
        {
          text: '🌐 站点与协作',
          collapsed: false,
          items: [
            { text: '贡献者介绍', link: '/developer/team' },
            { text: '插件开发规范', link: '/developer/process/plugin-lifecycle' },
            { text: '图片自动化模块', link: '/developer/website/autoimage' },
            { text: '配方可视化组件', link: '/developer/website/mcrecipe' },
            { text: '统一图标系统', link: '/developer/website/vectoricons' },
          ]
        },
        {
          text: '📋 运维资料',
          collapsed: false,
          items: [
            { text: '更新日志', link: '/developer/ops/changelog' },
            { text: '服务器状态', link: '/developer/ops/server-status' },
            { text: '待办事项', link: '/developer/ops/todo' },
            { text: '计算服务', link: '/developer/ops/compute' },
          ]
        },
        {
          text: '🗃️ 历史与待核对',
          collapsed: true,
          items: [
            { text: '旧更新记录', link: '/developer/archive/changelog-old' },
            { text: '宣传推广记录', link: '/developer/archive/promotion' },
            { text: '种植系统设计占位', link: '/developer/archive/design/farming' },
            { text: '赛季设计记录', link: '/developer/design/liveops_260107' },
            {
              text: '弃案设计',
              collapsed: true,
              items: [
                { text: '等级怪物系统', link: '/developer/archive/design/levelledmobs' },
                { text: '装备升级', link: '/developer/archive/design/equipment-upgrade' },
              ]
            },
            {
              text: '插件开发归档',
              link: '/developer/archive/plugins/',
              collapsed: true,
              items: [
                { text: 'FE_Fly', link: '/developer/archive/plugins/fe-fly' },
                { text: '物品功能核心', link: '/developer/archive/plugins/items-core' },
                { text: '任务系统', link: '/developer/archive/plugins/quests' },
                { text: '幻空翼历史草稿', link: '/developer/archive/plugins/sky-elytra' },
                {
                  text: 'PVP 竞技场',
                  link: '/developer/archive/plugins/pvp/',
                  collapsed: true,
                  items: [
                    { text: '竞技场管理', link: '/developer/archive/plugins/pvp/arena' },
                    { text: '配置参考', link: '/developer/archive/plugins/pvp/config' },
                    { text: '玩家指南', link: '/developer/archive/plugins/pvp/guide' },
                    { text: '装备组合管理', link: '/developer/archive/plugins/pvp/kit' },
                    { text: '权限节点', link: '/developer/archive/plugins/pvp/permissions' },
                    { text: '命令参考', link: '/developer/archive/plugins/pvp/commands' },
                    { text: '数据存储', link: '/developer/archive/plugins/pvp/storage' },
                  ]
                },
              ]
            },
          ]
        },
      ],

      '/archive/': [
        { text: '🗃️ 历史归档', link: '/archive/' },
        {
          text: '📅 历史事件',
          collapsed: false,
          items: [
            { text: '2026 元旦合照纪念活动', link: '/archive/events/20260101' },
            { text: '新服数据丢失事件', link: '/archive/events/20251225' },
            { text: '存档数据重置', link: '/archive/events/20251017' },
          ]
        },
      ],
    },
    // 大纲配置
    outline: {
      level: [1, 4],
      label: '本页目录'
    },
    returnToTopLabel: '返回顶部',
    
    // 社交链接
    // socialLinks: [
    //   { 
    //     icon: 'bilibili', 
    //     link: 'https://space.bilibili.com/359174372',
    //     ariaLabel: '📺 哔哩哔哩 - 狐风轩汐'
    //   },
    //   { 
    //     icon: 'github', 
    //     link: 'https://github.com/fwindemiko/MiragEdge-DocWeb',
    //     ariaLabel: '📦 GitHub - 锐界幻境文档'
    //   },
    // ],
    
    // 最后更新时间
    lastUpdated: {
      text: "最后更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short",
      },
    },

    // 编辑链接 - 动态跳转到当前页的GitHub编辑页
    editLink: {
      pattern: 'https://github.com/fwindemiko/MiragEdge-DocWeb/edit/main/:path',
      text: '在 GitHub 上编辑此页'
    },
    
    // 深色模式切换
    darkModeSwitchLabel: '外观',
    
    // 侧边栏菜单文本
    sidebarMenuLabel: '菜单',
    
    // 文档页脚配置
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    
    // 返回顶部按钮（VitePress 默认启用）
    
    // 外部链接图标
    externalLinkIcon: true,
  },
  
  // 排除 docs/ 目录（方案书与工作文件，不向玩家公开）
  // 排除 public/**/*.md（LLMs.txt 标准生成的清洗版 Markdown，是静态产物不应作为页面构建）
  srcExclude: ['docs/**/*.md', 'public/**/*.md'],

  // 缓存配置
  cacheDir: './.vitepress/cache',
  
  
  // 清理死链警告
  ignoreDeadLinks: [
    // 预留页面：文件尚未创建但在 nav/sidebar 中引用时在此忽略
  ],
  
  // 自定义 Sitemap(搜索映射表) 生成
  sitemap: {
    hostname: 'https://miragedge.top'
  }
})
