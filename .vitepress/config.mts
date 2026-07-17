import { defineConfig } from 'vitepress'
import { MermaidPlugin, MermaidMarkdown } from "vitepress-plugin-mermaid";
import addContributorsPlugin from './theme/addContributors';
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 站点常量：用于 OG / canonical / JSON-LD 等绝对地址
const SITE_HOST = 'https://miragedge.top'
const SITE_TITLE = 'MiragEdge 文档中心'
const SITE_DESCRIPTION = '锐界幻境 Minecraft 互通生存服务器官方文档中心，提供玩家指南、玩法介绍、附魔图鉴、钓鱼/季节/食物系统、开发教程与原创插件文档。'
const SITE_OG_IMAGE = `${SITE_HOST}/title_img/xingjiu.png`

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,

  // 基础路径，如果部署在子路径下需要设置
  base: '/',

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
    ['link', { rel: 'icon', href: '/title_img/favicon-32x32.png', sizes: '32x32' }],
    ['link', { rel: 'icon', href: '/title_img/favicon-16x16.png', sizes: '16x16' }],
    ['link', { rel: 'apple-touch-icon', href: '/title_img/apple-touch-icon.png', sizes: '180x180' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
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
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { 
        text: '玩法介绍',
        link: '/features/',
        activeMatch: '^/features/'
      },
      { 
        text: '玩家手册', 
        link: '/manual/review',
        activeMatch: '^/manual/'
      },
      { 
        text: '开发文档', 
        link: '/develop/team',
        activeMatch: '^/develop/'
      },
      { 
        text: '原创插件', 
        link: '/plugins/info',
        activeMatch: '^/plugins/'
      },
      {
       text: '相关链接', 
       items: [
         { 
           text: '狐风轩汐の小窝-Blog', 
           link: 'https://f.windemiko.top',
           target: '_blank',
           rel: 'noopener noreferrer'
         },
         { 
           text: '资源分享下载', 
           link: 'https://share.fnnas.net/s/a32874a8ab394948b4',
           target: '_blank',
           rel: 'noopener noreferrer'
         },
         { 
           text: '哔哩哔哩 - 狐风轩汐', 
           link: 'https://space.bilibili.com/359174372',
           target: '_blank',
           rel: 'noopener noreferrer'
         },
         { 
           text: 'GitHub - 锐界幻境文档', 
           link: 'https://github.com/fwindemiko/MiragEdge-DocWeb',
           target: '_blank',
           rel: 'noopener noreferrer'
         },
       ]
      },
    ],

    // 侧边栏配置
    sidebar: {
      '/features/': [
        { text: '📖 玩法总览', link: '/features/' },
        {
          text: '🏠 基础系统',
          collapsed: false,
          items: [
            { text: '经济系统', link: '/features/base/economy' },
            { text: '玩家工会', link: '/features/base/playerguild' },
            { text: '幻域领地', link: '/features/base/dom' },
            { text: '独特功能', link: '/features/base/function' },
          ]
        },
        {
          text: '🌾 田园生活',
          collapsed: false,
          items: [
            { text: '建筑大师', link: '/features/pastoral/builder' },
            {
              text: '真实季节',
              collapsed: true,
              items: [
                { text: '介绍', link: '/features/pastoral/seasons/info' },
                { text: '温度系统', link: '/features/pastoral/seasons/temperature' },
                { text: '春季', link: '/features/pastoral/seasons/spring' },
                { text: '夏季', link: '/features/pastoral/seasons/summer' },
                { text: '秋季', link: '/features/pastoral/seasons/fall' },
                { text: '冬季', link: '/features/pastoral/seasons/winter' },
              ]
            },
            {
              text: '更多钓鱼',
              collapsed: true,
              items: [
                { text: '介绍', link: '/features/pastoral/fishing/info' },
                { text: '鱼竿进阶', link: '/features/pastoral/fishing/rods' },
                { text: '鱼类图鉴', link: '/features/pastoral/fishing/fish' },
                { text: '钓鱼比赛', link: '/features/pastoral/fishing/competitions' },
                { text: '鱼饵系统', link: '/features/pastoral/fishing/baits' },
                { text: '维度钓鱼', link: '/features/pastoral/fishing/dimensions' },
              ]
            },
            {
              text: '更多种植',
              collapsed: true,
              items: [
                { text: '介绍', link: '/features/pastoral/croups/info' },
              ]
            },
            {
              text: '更多食物',
              collapsed: true,
              items: [
                { text: '食物总览', link: '/features/pastoral/food/info' },
                { text: '早餐简餐', link: '/features/pastoral/food/breakfast' },
                { text: '糖果零食', link: '/features/pastoral/food/snacks' },
                { text: '沙拉凉菜', link: '/features/pastoral/food/salads' },
                { text: '烘焙糕点', link: '/features/pastoral/food/bakery' },
                { text: '主菜肉食', link: '/features/pastoral/food/mains' },
                { text: '饮品', link: '/features/pastoral/food/drinks' },
                { text: '甜品', link: '/features/pastoral/food/desserts' },
                { text: '煎蛋系列', link: '/features/pastoral/food/eggs' },
                { text: '特色食物', link: '/features/pastoral/food/special' },
                { text: '食物速查表', link: '/features/pastoral/food/reference' },
              ]
            },
          ]
        },
        {
          text: '⚔️ 冒险战斗',
          collapsed: false,
          items: [
            {
              text: '等级怪物',
              link: '/features/adventure/levelledmobs',
            },
            {
              text: '死亡轮回',
              link: '/features/adventure/deathreincarnation',
            },
            {
              text: '星辉锚点',
              link: '/features/adventure/miragedgehome',
            },
            {
              text: '鞘翅绑定',
              link: '/features/adventure/elytrabind',
            },
            {
              text: '称号与登场',
              link: '/features/adventure/identity',
            },
            {
              text: '✨ 更多附魔',
              collapsed: true,
              items: [
                { text: '介绍', link: '/features/adventure/enchantments/info' },
                { text: '品质等级', link: '/features/adventure/enchantments/rarity' },
                { text: '附魔列表', link: '/features/adventure/enchantments/list' },
                { text: '分类搭配', link: '/features/adventure/enchantments/group' },
                { text: '附魔管理', link: '/features/adventure/enchantments/system' },
              ]
            },
            {
              text: '⚔️ 装备升级',
              collapsed: false,
              items: [
                { text: '介绍', link: '/features/adventure/mmo/info' },
                { text: '锻造升级', link: '/features/adventure/mmo/forge' },
              ]
            },
          ]
        },
      ],

      '/manual/': [
        {
          text: '📌 必看指南',
          collapsed: false,
          items: [
            { text: '欢迎朋友', link: '/manual/review' },
            { text: '玩家守则', link: '/manual/eula' },
            { text: '入服方法', link: '/manual/tutorial/serverjoin' },
            { text: '手机必看', link: '/manual/tutorial/bedrock' },
            { text: '生电与特性', link: '/manual/redstone_mechanism' },
            { text: '客户端安装', link: '/manual/tutorial/clientinstall' },
            { text: '常见问题', link: '/manual/faq' },
          ]
        },
        {
          text: '🔧 附属功能教程',
          collapsed: false,
          items: [
            { text: '白名单系统', link: '/manual/tutorial/whitelist' },
            { text: '语音频道', link: '/manual/function/voicechannel' },
            { text: '群服互通机器人', link: '/manual/function/qqbot' },
            { text: 'MOD拓展功能支持', link: '/manual/function/mod' },
          ]
        },
        {
          text: '👥 社区交流',
          collapsed: false,
          items: [
            { text: 'QQ 群组', link: '/manual/qq_group' },
            { text: '世界观故事', link: '/manual/other/worldview' },
            { text: '宣传推广', link: '/manual/promotion' },
          ]
        },
        {
          text: '🚩 历史事件记录',
          collapsed: true,
          items: [
            { text: '2026元旦合照纪念活动', link: '/manual/active/20260101' },
            { text: '新服数据丢失事件', link: '/manual/active/20251225' },
            { text: '存档数据重置', link: '/manual/active/20251017' },
          ]
        },
      ],

      '/develop/': [
        { text: '👥 开发团队', link: '/develop/team' },
        { text: '📌 待办事项', link: '/develop/todo' },
        /* {
          text: '🎮 插件开发',
          collapsed: false,
          items: [
            { text: '📋 项目开发说明', link: '/develop/mc_plugins/index' },
            {
              text: '📊 原创插件列表',
              collapsed: false,
              items: [
                { text: '🦊 狐风轩汐', link: '/develop/mc_plugins/fwindemiko' },
              ]
            },
          ]
         },*/
        {
          text: '⚙️ 插件配置',
          collapsed: false,
          items: [
            { text: '附魔ID对照表', link: '/develop/server_configs/enchantment_ids' },
          ]
        },
        {
          text: '🧩 开发工作流',
          collapsed: false,
          items: [
            { text: '数据包客制化(Skills)', link: '/develop/workflows/datapack-workflow' },
            { text: 'CE材质引擎(Skills)',    link: '/develop/workflows/texture-workflow' },
            { text: '自定义作物(Skills)',    link: '/develop/workflows/customcrops-workflow' },
            { text: '钓鱼系统(Skills)',     link: '/develop/workflows/fishing-workflow' },
            { text: '附魔配置(Skills)',     link: '/develop/workflows/enchanting-workflow' },
          ]
        },
        {
          text: '🎯 玩法设计',
          collapsed: false,
          items: [
            { text: '赛季玩法设计方案', link: '/develop/gameplay/liveops_260107' },
          ]
        },
        {
          text: '🌐 网站开发',
          collapsed: false,
          items: [
            { text: '自动图像组件', link: '/develop/webdev/autoimage' },
            { text: '矢量图标库', link: '/develop/webdev/vectoricons' },
            { text: 'MC配方组件', link: '/develop/webdev/mcrecipe' },
          ]
        },
        {
          text: '📋 附录',
          collapsed: false,
          items: [
            { text: '更新日志', link: '/develop/logs' },
            { text: '节点状态', link: '/develop/serverstatus' },
            { text: '计算服务', link: '/develop/ccs_price_list' },
          ]
        },
      ],

      '/plugins/': [
        { text: '📋 项目开发说明', link: '/plugins/info' },
        { text: '📊 原创插件列表', link: '/plugins/list' },
        {
          text: '⚔️ PVP竞技场系统',
          collapsed: false,
          items: [
            { text: '安装配置', link: '/plugins/fepvp/' },
            { text: '竞技场管理', link: '/plugins/fepvp/arena' },
            { text: '装备组合管理', link: '/plugins/fepvp/kit' },
            { text: '玩家指南', link: '/plugins/fepvp/guide' },
            { text: '配置参考', link: '/plugins/fepvp/config' },
            { text: '权限节点', link: '/plugins/fepvp/permissions' },
            { text: '命令参考', link: '/plugins/fepvp/commands' },
            { text: '数据存储', link: '/plugins/fepvp/storage' },
          ]
        },
        { text: '🌟 星辉锚点', link: '/plugins/miragedgehome' },
        { text: '🏷️ 称号与入服消息', link: '/plugins/miragedgetitle' },
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
