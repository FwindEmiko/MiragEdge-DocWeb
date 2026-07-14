<script lang="ts" setup>
/**
 * 自定义 VPNavBarExtra - 在原版基础上添加特效开关
 * 基于 VitePress 默认主题 VPNavBarExtra.vue 复制修改
 * 注意：后续 VitePress 更新时需检查原版是否有变更
 */
import { computed } from 'vue'
// @ts-ignore VitePress 内部组件无类型声明
import VPFlyout from 'vitepress/dist/client/theme-default/components/VPFlyout.vue'
// @ts-ignore VitePress 内部组件无类型声明
import VPMenuLink from 'vitepress/dist/client/theme-default/components/VPMenuLink.vue'
// @ts-ignore VitePress 内部组件无类型声明
import VPSwitchAppearance from 'vitepress/dist/client/theme-default/components/VPSwitchAppearance.vue'
// @ts-ignore VitePress 内部组件无类型声明
import VPSocialLinks from 'vitepress/dist/client/theme-default/components/VPSocialLinks.vue'
import { useData } from 'vitepress'
// @ts-ignore VitePress 内部 composable 无类型声明
import { useLangs } from 'vitepress/dist/client/theme-default/composables/langs'
import EffectsToggle from './EffectsToggle.vue'

const { site, theme } = useData()
const { localeLinks, currentLang } = useLangs({ correspondingLink: true })

const hasExtraContent = computed(
  () =>
    (localeLinks.value.length && currentLang.value.label) ||
    site.value.appearance ||
    theme.value.socialLinks
)
</script>

<template>
  <VPFlyout
    v-if="hasExtraContent"
    class="VPNavBarExtra"
    label="extra navigation"
  >
    <div
      v-if="localeLinks.length && currentLang.label"
      class="group translations"
    >
      <p class="trans-title">{{ currentLang.label }}</p>
      <template v-for="locale in localeLinks" :key="locale.link">
        <VPMenuLink :item="locale" />
      </template>
    </div>

    <div
      v-if="
        site.appearance &&
        site.appearance !== 'force-dark' &&
        site.appearance !== 'force-auto'
      "
      class="group"
    >
      <div class="item appearance">
        <p class="label">
          {{ theme.darkModeSwitchLabel || '外观' }}
        </p>
        <div class="appearance-action">
          <VPSwitchAppearance />
        </div>
      </div>
    </div>

    <!-- [自定义] 添加特效开关 -->
    <div class="group">
      <div class="item effects">
        <p class="label">页面特效</p>
        <div class="effects-action">
          <EffectsToggle />
        </div>
      </div>
    </div>

    <div v-if="theme.socialLinks" class="group social-group">
      <div class="item social-links">
        <VPSocialLinks class="social-links-list" :links="theme.socialLinks" />
      </div>
    </div>
  </VPFlyout>
</template>

<style scoped>
.VPNavBarExtra {
  display: none;
  margin-right: -12px;
}

/* 在 >=768px 时显示 */
@media (min-width: 768px) {
  .VPNavBarExtra {
    display: block;
  }
}

/* [自定义] 移除原版 >=1280px 时的隐藏规则，使其在所有桌面端都显示 */
/* 这样 >=1280px 时主题切换和特效切换都会收进此下拉菜单 */

.trans-title {
  padding: 0 24px 0 12px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.item.appearance,
.item.effects,
.item.social-links {
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.item.appearance {
  min-width: 176px;
}

.item.effects {
  min-width: 176px;
}

.appearance-action {
  margin-right: -2px;
}

.effects-action {
  margin-right: -2px;
}

.social-links-list {
  margin: -4px -8px;
}

/* [自定义] >=1280px 时隐藏社交链接，避免与 VPNavBarSocialLinks 重复显示 */
@media (min-width: 1280px) {
  .social-group {
    display: none;
  }
}
</style>
