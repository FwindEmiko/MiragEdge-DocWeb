<script setup>
import MapIcon from '../../.vitepress/theme/components/vue/MapIcon.vue'
import {
  Home, Gamepad2, BookOpen, Sword, Puzzle, Server, Heart,
  Sprout, Swords, MessageCircle, Shield, Gem, Sparkles, Code,
  Wrench, Globe, Moon, Star, Cat, Github, Play, FileText,
  Users, Trophy, Map, Compass, Castle, Coins, Fish, ChefHat,
  Skull, Dog, Image, Music, CheckCircle, AlertTriangle,
  Wifi, Mountain, Book, Folder, Terminal, Database, Lock,
  Settings, ExternalLink, ArrowRight, Search
} from 'lucide-vue-next'
</script>

# MiragEdge 统一图标系统

锐界幻境文档站已集成 **Lucide** 图标库（1000+ 开源图标），并通过 `MapIcon` 组件提供语义化调用方式。

---

## 快速使用

### 方式一：MapIcon 组件（推荐）

`MapIcon` 封装了语义名称到 Lucide 图标的映射，无需知道具体图标名：

```vue
<MapIcon name="home" />
<MapIcon name="gamepad" :size="28" color="#E05252" />
<MapIcon name="server" class="my-icon" />
```

**支持的属性：**

| 属性 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `name` | string | 必填 | 语义化图标名称（见下方映射表） |
| `:size` | number | 20 | 图标尺寸（像素） |
| `color` | string | currentColor | 图标颜色 |
| `stroke-width` | number | 2 | 线条粗细 |

### 方式二：直接使用 Lucide（灵活）

需要 Lucide 没有预映射的图标时，可直接导入：

```vue
<script setup>
import { Home, User, Settings } from 'lucide-vue-next'
</script>

<Home :size="24" color="blue" />
<User :size="28" class="my-icon" />
<Settings @click="handleClick" />
```

---

## 语义名称映射表

<details>
<summary>📁 导航 & 通用</summary>

| 语义名称 | 图标 | 预览 |
|---------|------|------|
| `home` | Home | <Home :size="20" /> |
| `menu` | Menu | — |
| `search` | Search | <Search :size="20" /> |
| `link` / `external` | Link / ExternalLink | <ExternalLink :size="20" /> |
| `arrow-right` / `chevron-right` | ArrowRight / ChevronRight | <ArrowRight :size="20" /> |
| `check` | Check | — |
| `close` | X | — |
| `settings` | Settings | <Settings :size="20" /> |
| `heart` | Heart | <Heart :size="20" /> |
| `star` | Star | — |
| `user` / `users` | User / Users | <Users :size="20" /> |
</details>

<details>
<summary>🗄️ 服务器 & 硬件</summary>

| 语义名称 | 图标 | 预览 |
|---------|------|------|
| `server` | Server | <Server :size="20" /> |
| `database` | Database | <Database :size="20" /> |
| `network` | Network | — |
| `shield` / `lock` | Shield / Lock | <Shield :size="20" /> |
| `terminal` | Terminal | <Terminal :size="20" /> |
| `cloud` | Cloud | — |
| `cpu` | Cpu | — |
</details>

<details>
<summary>🎮 游戏 & Minecraft</summary>

| 语义名称 | 图标 | 预览 |
|---------|------|------|
| `gamepad` | Gamepad2 | <Gamepad2 :size="20" /> |
| `sword` | Sword | <Sword :size="20" /> |
| `shield` | Shield | <Shield :size="20" /> |
| `pickaxe` | Pickaxe | — |
| `map` | Map | <Map :size="20" /> |
| `compass` | Compass | <Compass :size="20" /> |
| `castle` | Castle | <Castle :size="20" /> |
| `trophy` | Trophy | <Trophy :size="20" /> |
| `diamond` | Gem | <Gem :size="20" /> |
| `sparkles` / `enchant` | Sparkles | <Sparkles :size="20" /> |
</details>

<details>
<summary>🌾 玩法特色</summary>

| 语义名称 | 图标 | 预览 |
|---------|------|------|
| `adventure` / `combat` | Swords | <Swords :size="20" /> |
| `farming` | Sprout | <Sprout :size="20" /> |
| `fishing` | Fish | <Fish :size="20" /> |
| `cooking` | ChefHat | <ChefHat :size="20" /> |
| `economy` | Coins | <Coins :size="20" /> |
| `building` | Building2 | — |
| `boss` | Skull | <Skull :size="20" /> |
| `pet` | Dog | <Dog :size="20" /> |
</details>

<details>
<summary>💬 社区 & 社交</summary>

| 语义名称 | 图标 | 预览 |
|---------|------|------|
| `chat` | MessageCircle | <MessageCircle :size="20" /> |
| `group` | Users | <Users :size="20" /> |
| `github` | Github | <Github :size="20" /> |
| `bilibili` | Play | <Play :size="20" /> |
</details>

<details>
<summary>📄 文档 & 开发</summary>

| 语义名称 | 图标 | 预览 |
|---------|------|------|
| `book` / `book-open` | Book / BookOpen | <BookOpen :size="20" /> |
| `file` / `file-text` | File / FileText | <FileText :size="20" /> |
| `folder` / `folder-open` | Folder / FolderOpen | <Folder :size="20" /> |
| `code` | Code | <Code :size="20" /> |
| `plugin` | Puzzle | <Puzzle :size="20" /> |
| `tool` | Wrench | <Wrench :size="20" /> |
| `package` | Package | — |
| `api` | Plug | — |
</details>

<details>
<summary>🦊 锐界幻境特色</summary>

| 语义名称 | 图标 | 预览 |
|---------|------|------|
| `miragedge` | Globe | <Globe :size="20" /> |
| `edge` | Mountain | <Mountain :size="20" /> |
| `dream` | Moon | <Moon :size="20" /> |
| `star` | Star | — |
| `fox` | Cat | <Cat :size="20" /> |
| `soul` | Heart | <Heart :size="20" /> |
</details>

---

## 在首页 Feature 卡片中使用

`index.md` 的 feature 卡片 emoji 字段支持直接填写 `<MapIcon name="xxx" />`：

```yaml
features:
  - icon: <MapIcon name="gamepad" :size="28" />
    title: 创新玩法
    details: ...
```

如果你的页面中有自定义 HTML 区域，也可以直接写：

```html
<MapIcon name="sword" :size="32" color="#E05252" />
<span>PVP 竞技场</span>
```

---

## 添加新图标映射

如果需要添加新的语义名称映射，编辑 `.vitepress/theme/components/vue/MapIcon.vue` 中的 `iconMap` 对象：

```javascript
const iconMap = {
  // 添加你的映射
  '新名称': 'LucideIconName',  // LucideIconName 需从 lucide-vue-next 中导出
}
```

所有 Lucide 可用图标请参考 [Lucide 图标库官网](https://lucide.dev/icons/)。

---

## 命名规范

- 语义名称使用 **全小写英文 + 连字符**（kebab-case）
- 按功能/场景归类，例如游戏类以 `game-` 开头、文档类以 `doc-` 开头
- 名称应直观表达含义，无需查阅文档即可理解

---

## 最佳实践

1. **优先使用 `MapIcon`** — 语义化名称更清晰，且未来切换图标库只需改映射
2. **统一尺寸** — 内文图标用 `20px`，标题图标用 `24-28px`，导航图标用 `18-20px`
3. **颜色继承** — 不传 `color` 时自动继承文字颜色，深色/浅色模式自动适配
4. **标题属性** — 图标承载重要信息时添加 `:title="说明文字"` 提升可访问性
5. **性能注意** — `MapIcon` 使用 Vue 动态组件按需加载，不会打包未使用的图标
