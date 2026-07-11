<template>
  <span class="map-icon-wrapper">
    <component :is="iconComponent" v-bind="attrs" />
  </span>
</template>

<script setup>
import { computed, useAttrs } from 'vue'
import {
  Anvil, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Award, Ban, Book, BookOpen,
  BrickWall, Building2, Calendar, Castle, Cat, Check, ChefHat, ChevronDown,
  ChevronLeft, ChevronRight, ChevronUp, Clipboard, Clock, Cloud, CloudLightning,
  CloudRain, CloudSnow, Code, Coins, Compass, Copy, Cpu, Crown, Database, Dog,
  DoorOpen, Download, Droplet, Droplets, ExternalLink, File, FileText, Fish,
  Flag, Flame, FlaskConical, Folder, FolderOpen, Footprints, Gamepad2, Gem,
  Gift, GitBranch, GitMerge, GitPullRequest, Github, Globe, Handshake, HardDrive,
  Headphones, Heart, Image, Info, Leaf, Lightbulb, Link, Loader, Lock, Map,
  Megaphone, Menu, MessageCircle, MessageSquare, MessageSquareText, Monitor,
  Moon, Mountain, Music, Network, Package, Palette, PartyPopper, Pencil, Pin,
  Pickaxe, Play, Plug, Puzzle, RefreshCw, Rocket, Ruler, Satellite, Search,
  Server, Settings, Share2, Shield, Skull, Smartphone, Snowflake, Sparkles,
  Sprout, Star, Sun, Sword, Swords, Target, Terminal, Thermometer, Timer, Trash2,
  TreePine, TrendingDown, TrendingUp, Trophy, Upload, User, Users, Video,
  Volume2, Wand, Wifi, WifiOff, Wind, Wrench, X, Zap
} from 'lucide-vue-next'

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
 * Lucide 图标组件映射表（PascalCase 名称 → 组件）
 * 仅包含上方按需 import 的图标，便于动态渲染并保留 tree-shaking。
 */
const lucideIcons = {
  Anvil, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Award, Ban, Book, BookOpen,
  BrickWall, Building2, Calendar, Castle, Cat, Check, ChefHat, ChevronDown,
  ChevronLeft, ChevronRight, ChevronUp, Clipboard, Clock, Cloud, CloudLightning,
  CloudRain, CloudSnow, Code, Coins, Compass, Copy, Cpu, Crown, Database, Dog,
  DoorOpen, Download, Droplet, Droplets, ExternalLink, File, FileText, Fish,
  Flag, Flame, FlaskConical, Folder, FolderOpen, Footprints, Gamepad2, Gem,
  Gift, GitBranch, GitMerge, GitPullRequest, Github, Globe, Handshake, HardDrive,
  Headphones, Heart, Image, Info, Leaf, Lightbulb, Link, Loader, Lock, Map,
  Megaphone, Menu, MessageCircle, MessageSquare, MessageSquareText, Monitor,
  Moon, Mountain, Music, Network, Package, Palette, PartyPopper, Pencil, Pin,
  Pickaxe, Play, Plug, Puzzle, RefreshCw, Rocket, Ruler, Satellite, Search,
  Server, Settings, Share2, Shield, Skull, Smartphone, Snowflake, Sparkles,
  Sprout, Star, Sun, Sword, Swords, Target, Terminal, Thermometer, Timer, Trash2,
  TreePine, TrendingDown, TrendingUp, Trophy, Upload, User, Users, Video,
  Volume2, Wand, Wifi, WifiOff, Wind, Wrench, X, Zap
}

/**
 * 语义名称 → Lucide 图标组件映射
 * 
 * 命名规则:
 * - 全小写英文 + 连字符 (kebab-case)
 * - 按功能/场景归类
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
  refresh: 'RefreshCw',
  sync: 'RefreshCw',
  globe: 'Globe',
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
  
  // 开发 & 工具
  plugin: 'Puzzle',
  tool: 'Wrench',
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
  
  // Additional mappings
  'rocket': 'Rocket',
  'monitor': 'Monitor',
  'target': 'Target',
  'clipboard': 'Clipboard',
  'help-circle': 'HelpCircle',
  'message-circle': 'MessageCircle',
  'pin': 'Pin',
  'party-popper': 'PartyPopper',
  'refresh-cw': 'RefreshCw',
  'bar-chart': 'BarChart3',
  'fox': 'Cat',

  // 锐界幻境特色命名
  'miragedge': 'Globe',
  'edge': 'Mountain',
  'dream': 'Moon',
  'soul': 'Heart',

  // 环境与天气
  thermometer: 'Thermometer',
  sun: 'Sun',
  moon: 'Moon',
  snowflake: 'Snowflake',
  flame: 'Flame',
  wind: 'Wind',
  'cloud-rain': 'CloudRain',
  'cloud-lightning': 'CloudLightning',
  'cloud-snow': 'CloudSnow',
  droplet: 'Droplet',
  droplets: 'Droplets',
  mountain: 'Mountain',

  // 功能与工具
  trash: 'Trash2',
  flask: 'FlaskConical',
  door: 'DoorOpen',
  leaf: 'Leaf',
  zap: 'Zap',
  timer: 'Timer',
  ruler: 'Ruler',
  anvil: 'Anvil',
  lightbulb: 'Lightbulb',
  footprints: 'Footprints',
  smartphone: 'Smartphone',
  'palm-tree': 'Palmtree',
  'tree-pine': 'TreePine',
  'brick-wall': 'BrickWall',

  // 社交与标识
  gift: 'Gift',
  crown: 'Crown',
  handshake: 'Handshake',
  ban: 'Ban',
  megaphone: 'Megaphone',
  flag: 'Flag',
  award: 'Award',
  'trending-up': 'TrendingUp',
  'trending-down': 'TrendingDown',

  // 任务规范映射别名（emoji→MapIcon 统一命名）
  'bar-chart3': 'BarChart3',
  'plug': 'Plug',
  'swords': 'Swords',
  'coins': 'Coins',
  'sprout': 'Sprout',
  'volume-2': 'Volume2',
  'palette': 'Palette',
  'satellite': 'Satellite',
  'gem': 'Gem',
  'wand': 'Wand',
  'wrench': 'Wrench',
  'play': 'Play',
  'building-2': 'Building2',
}

function resolveIcon(name) {
  const iconName = iconMap[name]
  if (!iconName) return null
  // Lucide 导出使用 PascalCase
  return lucideIcons[iconName] || null
}

const iconComponent = computed(() => {
  const comp = resolveIcon(props.name)
  if (comp) return comp
  // 回退：如果直接传入了 Lucide 组件名也尝试
  return lucideIcons[props.name] || null
})
</script>
