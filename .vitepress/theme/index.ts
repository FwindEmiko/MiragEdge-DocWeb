// .vitepress/theme/index.ts
// 自定义主题入口文件

import { h, onMounted } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import NotFound from './components/vue/NotFound.vue'
import SmartImage from './components/vue/SmartImage.vue'
import ChristmasTree from './components/vue/ChristmasTree.vue'
import NodeStatus from './components/vue/NodeStatus.vue'
import FeatureCard from './components/vue/FeatureCard.vue'
import CornerStars from './components/vue/CornerStars.vue'
import CornerQuotes from './components/vue/CornerQuotes.vue'
import CornerSakura from './components/vue/CornerSakura.vue'
import CornerBubbles from './components/vue/CornerBubbles.vue'
import ChangelogFromMd from './components/vue/ChangelogFromMd.vue'
import MapIcon from './components/vue/MapIcon.vue'
import './css/custom.css'

// 导入所有样式文件
import './css/base/colors.css'
import './css/layout/hero.css'
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

// 导入自定义通知脚本
import { showAestheticNotice, showConsoleLogo } from './components/js/notice.js'

export default {
  extends: DefaultTheme,

  Layout: () => {
    return h(LayoutComponent)
  },

  enhanceApp({ app, router, siteData }) {
    // 注册全局组件
    app.component("LayoutComponent", LayoutComponent)
    app.component('Contributors', Contributors)
    app.component('SmartImage', SmartImage)
    app.component('ChristmasTree', ChristmasTree)
    app.component('NodeStatus', NodeStatus)
    app.component('FeatureCard', FeatureCard)
    app.component('CornerStars', CornerStars)
    app.component('CornerQuotes', CornerQuotes)
    app.component('CornerSakura', CornerSakura)
    app.component('CornerBubbles', CornerBubbles)
    app.component('ChangelogFromMd', ChangelogFromMd)
    app.component('MapIcon', MapIcon)

    // 仅在浏览器环境下执行
    if (inBrowser) {
      router.onAfterRouteChanged = () => {
        // 不蒜子统计已移除
      }
    }
  },
  
  setup() {
    onMounted(() => {
      if (inBrowser) {
        // 在页面挂载后调用通知函数
        showAestheticNotice();
        
        // 初始化3D倾斜效果
        init3DTiltEffect();
        
        // 在控制台输出 F.windEmiko 文字图像
        showConsoleLogo();
      }
    });
  }
} as Theme