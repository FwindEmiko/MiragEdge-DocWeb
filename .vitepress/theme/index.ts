// .vitepress/theme/index.ts
// 自定义主题入口文件

import { h, onMounted, onBeforeUnmount } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import NotFound from './components/vue/NotFound.vue'
import SmartImage from './components/vue/SmartImage.vue'
import ChristmasTree from './components/vue/ChristmasTree.vue'
import NodeStatus from './components/vue/NodeStatus.vue'
import FeatureCard from './components/vue/FeatureCard.vue'
import ChangelogFromMd from './components/vue/ChangelogFromMd.vue'
import MapIcon from './components/vue/MapIcon.vue'
import EnchantmentList from './components/vue/EnchantmentList.vue'
import EnchantmentIdTable from './components/vue/EnchantmentIdTable.vue'
import McItem from './components/vue/McItem.vue'
import CraftingTable from './components/vue/CraftingTable.vue'
import Furnace from './components/vue/Furnace.vue'
import FoodStats from './components/vue/FoodStats.vue'
import FoodEntry from './components/vue/FoodEntry.vue'
import TodoList from './components/vue/TodoList.vue'
import './css/custom.css'

// 导入所有样式文件
import './css/base/colors.css'
import './css/layout/hero.css'
import GithubRepoActivity from './components/vue/GithubRepoActivity.vue'
import './css/components/animation.css'
import './css/components/button.css'
import './css/components/feature.css'
import './css/components/search.css'
import './css/layout/blur.css'
import './css/base/overrides.css'
import './style/dark.css'
import './css/icons.css'

// 导入第三方库和组件
import { inBrowser } from "vitepress"
import LayoutComponent from './components/vue/layout.vue'
import Contributors from './components/vue/Contributors.vue'

// 导入3D倾斜效果
import { init3DTiltEffect } from './components/js/feature.js'

// 导入导航/侧边栏图标增强
import { initNavIcons } from './components/js/nav-icons.js'

// 导入自定义通知脚本
import { showAestheticNotice, showConsoleLogo } from './components/js/notice.js'

// ESA 边端缓存适配：版本检测自动刷新 + chunk 加载失败兜底
import { initVersionCheck, checkVersionOnRouteChange } from './composables/useVersionCheck'

export default {
  extends: DefaultTheme,

  Layout: () => {
    return h(LayoutComponent)
  },

  enhanceApp({ app, router, siteData }) {
    // 注册全局组件（Corner 装饰组件由 layout.vue 异步加载，无需全局注册）
    app.component("LayoutComponent", LayoutComponent)
    app.component('Contributors', Contributors)
    app.component('SmartImage', SmartImage)
    app.component('ChristmasTree', ChristmasTree)
    app.component('NodeStatus', NodeStatus)
    app.component('FeatureCard', FeatureCard)
    app.component('ChangelogFromMd', ChangelogFromMd)
    app.component('MapIcon', MapIcon)
    app.component('EnchantmentList', EnchantmentList)
    app.component('EnchantmentIdTable', EnchantmentIdTable)
    app.component('McItem', McItem)
    app.component('CraftingTable', CraftingTable)
    app.component('Furnace', Furnace)
    app.component('FoodStats', FoodStats)
    app.component('FoodEntry', FoodEntry)
    app.component('GithubRepoActivity', GithubRepoActivity)
    app.component('TodoList', TodoList)

    // 仅在浏览器环境下执行
    if (inBrowser) {
      router.onAfterRouteChanged = () => {
        // 路由切换后重新增强导航/侧边栏图标
        initNavIcons();
        // 路由切换后检测是否有新部署（延迟 2s，避免与路由过渡冲突）
        checkVersionOnRouteChange();
      }
    }
  },
  
  setup() {
    let scrollBar = null
    let scrollHandler = null

    onMounted(() => {
      if (inBrowser) {
        // 在页面挂载后调用通知函数
        showAestheticNotice();

        // 初始化3D倾斜效果
        init3DTiltEffect();
        // 初始化导航/侧边栏图标增强
        initNavIcons();

        // 在控制台输出 F.windEmiko 文字图像
        showConsoleLogo();

        // ESA 适配：启动版本检测（定时 + chunk 失败兜底）
        initVersionCheck();

        // 滚动进度条
        const bar = document.createElement('div')
        bar.className = 'scroll-progress'
        document.body.appendChild(bar)
        scrollBar = bar
        const update = () => {
          const scrollTop = window.scrollY
          const docHeight = document.documentElement.scrollHeight - window.innerHeight
          bar.style.width = docHeight > 0 ? `${(scrollTop / docHeight) * 100}%` : '0%'
        }
        scrollHandler = update
        window.addEventListener('scroll', update, { passive: true })
        update()
      }
    });

    onBeforeUnmount(() => {
      if (inBrowser && scrollHandler) {
        window.removeEventListener('scroll', scrollHandler)
        if (scrollBar && scrollBar.parentNode) {
          scrollBar.parentNode.removeChild(scrollBar)
        }
      }
    });
  }
} as Theme