import { defineConfig } from 'vitepress'
import { MermaidPlugin, MermaidMarkdown } from "vitepress-plugin-mermaid";
import addContributorsPlugin from './theme/addContributors';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "MiragEdge 文档中心",
  description: "锐界幻境 全方位的指南",
  
  // 基础路径，如果部署在子路径下需要设置
  base: '/',

  // 输出目录
  outDir: '.vitepress/dist',

  // 语言配置
  locales: {
    root: {
      label: '中文',
      lang: 'zh-CN',
      description: '锐界幻境 全方位的指南',
    }
  },

  // 头部配置
  head: [
    ['link', { rel: 'icon', href: '/title_img/favicon-32x32.png', sizes: '32x32' }],
    ['link', { rel: 'icon', href: '/title_img/favicon-16x16.png', sizes: '16x16' }],
    ['link', { rel: 'apple-touch-icon', href: '/title_img/apple-touch-icon.png', sizes: '180x180' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { name: 'theme-color', content: '#3c8772' }],
    // 构建版本标识：注入到每个 HTML 的 <head>，供前端版本检测对比 /version.json
    // 值与 vite define 中的 __BUILD_ID__ / __BUILD_SHA__ 保持一致（构建时求值）
    // 用于 ESA 边缘缓存场景下检测旧 HTML 并触发自动刷新
    ['meta', { name: 'x-build-id', content: process.env.GITHUB_RUN_NUMBER || 'dev' }],
    ['meta', { name: 'x-build-sha', content: process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : '' }],
    // 页面特效开关：在 Vue 水合前同步读取偏好并设置 <html>.effects-disabled
    // 避免首帧闪烁，且对 ESA 边端缓存/bfcache 场景稳健（不依赖 JS 模块重新执行时机）
    // 未存过偏好时：手机（<768px）默认关闭，桌面默认开启
    ['script', {}, "(function(){try{var k='miragedge-effects-enabled';var s=localStorage.getItem(k);var m=window.matchMedia('(max-width: 767px)').matches;var e=s===null?!m:s==='true';document.documentElement.classList.toggle('effects-disabled',!e);}catch(e){}})();"],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' }],
    ['meta', { name: 'keywords', content: 'MiragEdge, 锐界幻境, Minecraft, 我的世界, 服务器, 文档, 玩家手册, 狐风轩汐, FwindEmi, F.windEmiko' }],
    ['meta', { name: 'author', content: 'F.windEmiko' }],
    ['meta', { property: 'og:title', content: 'MiragEdge 文档中心' }],
    ['meta', { property: 'og:description', content: '锐界幻境 全方位的指南' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: '/title_img/xingjiu.png' }],
    ['meta', { property: 'og:url', content: 'https://miragedge.top' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: '/title_img/xingjiu.png' }],
    ['meta', { name: 'twitter:creator', content: '@MiragEdge' }],
    // 百度站点验证（如果需要）
    // ['meta', { name: 'baidu-site-verification', content: 'code-xxxxxxxx' }],
    // 360站点验证（如果需要）
    // ['meta', { name: '360-site-verification', content: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }],
  ],

  // Markdown 配置
  markdown: {
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark'
    },
    lineNumbers: true, // 显示代码行号
    config(md) {
      md.use(MermaidMarkdown);
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
            fuzzy: true,
            prefix: true,
            boost: { title: 2, content: 1 }
          },
        }
      }
    },
    
    // 导航栏
    nav: [
      { text: '🏠 首页', link: '/' },
      { 
        text: '🎮 玩法介绍',
        link: '/features/',
        activeMatch: '^/features/'
      },
      { 
        text: '📚 玩家手册', 
        link: '/manual/review',
        activeMatch: '^/manual/'
      },
      { 
        text: '💻 开发文档', 
        link: '/develop/team',
        activeMatch: '^/develop/'
      },
      { 
        text: '📊 原创插件', 
        link: '/plugins/' 
      },
      {
       text: '🔗 相关链接', 
       items: [
         { 
           text: '🦊 狐风轩汐の小窝-Blog', 
           link: 'https://f.windemiko.top',
           target: '_blank',
           rel: 'noopener noreferrer'
         },
         { 
           text: '☁️ 资源分享下载', 
           link: 'https://share.fnnas.net/s/a32874a8ab394948b4',
           target: '_blank',
           rel: 'noopener noreferrer'
         },
         { 
           text: '📺 哔哩哔哩 - 狐风轩汐', 
           link: 'https://space.bilibili.com/359174372',
           target: '_blank',
           rel: 'noopener noreferrer'
         },
         { 
           text: '📦 GitHub - 锐界幻境文档', 
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
            { text: '💰 经济系统', link: '/features/base/economy' },
            { text: '🏠 玩家工会', link: '/features/base/playerguild' },
            { text: '🎡 幻域领地', link: '/features/base/dom' },
            { text: '🦄 独特功能', link: '/features/base/function' },
          ]
        },
        {
          text: '🌾 田园生活',
          collapsed: false,
          items: [
            { text: '🧑‍🌾 建筑大师', link: '/features/pastoral/builder' },
            {
              text: '🌼 真实季节',
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
              text: '🎣 更多钓鱼',
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
              text: '🌱 更多种植',
              collapsed: true,
              items: [
                { text: '介绍', link: '/features/pastoral/croups/info' },
              ]
            },
            {
              text: '🍲 更多食物',
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
              text: '🧟 等级怪物',
              link: '/features/adventure/levelledmobs',
            },
            {
              text: '💀 死亡轮回',
              link: '/features/adventure/deathreincarnation',
            },
            {
              text: '🌟 星辉锚点',
              link: '/features/adventure/miragedgehome',
            },
            {
              text: '🪶 鞘翅绑定',
              link: '/features/adventure/elytrabind',
            },
            {
              text: '🏷️ 称号与登场',
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
            { text: '✅ 欢迎朋友', link: '/manual/review' },
            { text: '⚖️ 玩家守则', link: '/manual/eula' },
            { text: '🔗 入服方法', link: '/manual/tutorial/serverjoin' },
            { text: '📱 手机必看', link: '/manual/tutorial/bedrock' },
            { text: '⚡️ 生电与特性', link: '/manual/redstone_mechanism' },
            { text: '🔌 客户端安装', link: '/manual/tutorial/clientinstall' },
            { text: '❓ 常见问题', link: '/manual/faq' },
          ]
        },
        {
          text: '🔧 附属功能教程',
          collapsed: false,
          items: [
            { text: '💾 白名单系统', link: '/manual/tutorial/whitelist' },
            { text: '🎮 语音频道', link: '/manual/function/voicechannel' },
            { text: '🐧 群服互通机器人', link: '/manual/function/qqbot' },
            { text: '🐶 MOD拓展功能支持', link: '/manual/function/mod' },
          ]
        },
        {
          text: '👥 社区交流',
          collapsed: false,
          items: [
            { text: '💬 QQ 群组', link: '/manual/qq_group' },
            { text: '🌏 世界观故事', link: '/manual/other/worldview' },
            { text: '📺 宣传推广', link: '/manual/promotion' },
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
            { text: '贴图字符码', link: '/develop/server_configs/sticker' },
            { text: '自定义作物', link: '/develop/server_configs/customcrops' },
            { text: '钓鱼系统', link: '/develop/server_configs/fishing' },
            {
              text: '✨ 更多附魔',
              collapsed: false,
              items: [
                { text: '附魔配置教程', link: '/develop/server_configs/enchanting' },
                { text: '附魔ID对照表', link: '/develop/server_configs/enchantment_ids' },
              ]
            },
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
            { text: '📅 更新日志', link: '/develop/logs' },
            { text: '🐚 节点状态', link: '/develop/serverstatus' },
            { text: '💰 计算服务', link: '/develop/ccs_price_list' },
          ]
        },
      ],

      '/plugins/': [
        { text: '📋 项目开发说明', link: '/plugins/index' },
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
    '/docs/develop/intro',
    '/docs/ServerRule',
    '/develop/mc_plugins/emcshop',
    '/develop/mc_plugins/fe_fly'
  ],
  
  // 自定义 Sitemap(搜索映射表) 生成
  sitemap: {
    hostname: 'https://miragedge.top'
  }
})