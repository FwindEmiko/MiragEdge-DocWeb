<template>
  <component :is="iconComponent" v-bind="attrs" v-on="$listeners" />
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

/**
 * MiragEdge 统一图标组件 (MapIcon)
 * 
 * 用法:
 *   <MapIcon name="home" />
 *   <MapIcon name="game" :size="32" color="#E05252" />
 * 
 * 支持所有 Lucide 图标属性: size, color, stroke-width, fill, class
 */

const props = defineProps({
  /** 语义化图标名称（见 Lucide 图标库或本页下方映射表） */
  name: {
    type: String,
    required: true
  },
  /** 图标大小（像素），默认 20 */
  size: {
    type: [Number, String],
    default: 20
  },
  /** 图标颜色，默认继承文字颜色 */
  color: {
    type: String,
    default: 'currentColor'
  },
  /** 线条粗细，默认 2 */
  'stroke-width': {
    type: [Number, String],
    default: 2
  }
})

const attrs = useAttrs()

/**
 * 语义名称 → Lucide 图标组件映射
 * 
 * 命名规则:
 * - 全小写英文 + 连字符 (kebab-case)
 * - 按功能/场景归类
 * - 见下方 addonMap 为扩展映射
 */
const iconMap = {
  // 导航 & 通用
  home: 'Home',
  menu: 'Menu',
  search: 'Search',
  link: 'Link',
  external: 'ExternalLink',
  arrow: 'ArrowRight',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'arrow-up': 'ArrowUp',
  'arrow-down': 'ArrowDown',
  chevron: 'ChevronRight',
  'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight',
  'chevron-up': 'ChevronUp',
  'chevron-down': 'ChevronDown',
  close: 'X',
  check: 'Check',
  alert: 'AlertTriangle',
  info: 'Info',
  question: 'HelpCircle',
  settings: 'Settings',
  edit: 'Pencil',
  copy: 'Copy',
  download: 'Download',
  upload: 'Upload',
  share: 'Share2',
  heart: 'Heart',
  star: 'Star',
  clock: 'Clock',
  calendar: 'Calendar',
  user: 'User',
  users: 'Users',
  
  // 服务器 & 硬件
  server: 'Server',
  cpu: 'Cpu',
  database: 'Database',
  network: 'Network',
  harddrive: 'HardDrive',
  terminal: 'Terminal',
  cloud: 'Cloud',
  shield: 'Shield',
  lock: 'Lock',
  
  // 游戏 & MC
  gamepad: 'Gamepad2',
  sword: 'Sword',
  shield: 'Shield',
  'pickaxe': 'Pickaxe',
  'treasure': 'TreasureChest',
  map: 'Map',
  compass: 'Compass',
  castle: 'Castle',
  trophy: 'Trophy',
  diamond: 'Gem',
  'sparkles': 'Sparkles',
  'magic': 'Wand',
  
  // 社区 & 社交
  chat: 'MessageCircle',
  'chat-text': 'MessageSquareText',
  group: 'Users',
  forum: 'MessageSquare',
  qq: 'MessageCircle',
  bilibili: 'Play',
  github: 'Github',
  
  // 文档 & 内容
  book: 'Book',
  'book-open': 'BookOpen',
  file: 'File',
  'file-text': 'FileText',
  folder: 'Folder',
  'folder-open': 'FolderOpen',
  document: 'FileText',
  wiki: 'BookOpen',
  code: 'Code',
  terminal: 'Terminal',
  
  // 开发 & 工具
  plugin: 'Puzzle',
  tool: 'Wrench',
  code: 'Code',
  git: 'GitBranch',
  'git-merge': 'GitMerge',
  'git-pull': 'GitPullRequest',
  package: 'Package',
  api: 'Plug',
  
  // 玩法 & 特色
  adventure: 'Swords',
  farming: 'Sprout',
  building: 'Building2',
  economy: 'Coins',
  fishing: 'Fish',
  cooking: 'ChefHat',
  enchant: 'Sparkles',
  combat: 'Swords',
  boss: 'Skull',
  pet: 'Dog',
  
  // 社交/媒体
  image: 'Image',
  video: 'Video',
  music: 'Music',
  podcast: 'Headphones',
  
  // 状态指示
  success: 'CheckCircle',
  warning: 'AlertTriangle',
  error: 'XCircle',
  loading: 'Loader',
  online: 'Wifi',
  offline: 'WifiOff',
  
  // 锐界幻境特色命名
  'miragedge': 'Globe',
  'edge': 'Mountain',
  'dream': 'Moon',
  'star': 'Star',
  'fox': 'Cat',        // 没有狐狸图标，用猫代替
  'soul': 'Heart',
}

// 额外映射，可根据需要扩展
const addonMap = {
  // 以下为预留扩展位
}

function resolveIcon(name) {
  const iconName = iconMap[name] || addonMap[name]
  if (!iconName) return null
  // Lucide 导出使用 PascalCase
  const component = LucideIcons[iconName]
  return component || null
}

const iconComponent = computed(() => {
  const comp = resolveIcon(props.name)
  if (comp) return comp
  // 回退：如果直接传入了 Lucide 组件名也尝试
  return LucideIcons[props.name] || null
})
</script>
