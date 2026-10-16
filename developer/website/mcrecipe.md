---
title: Minecraft 配方可视化组件
description: 文档站的 Minecraft 配方可视化组件套件说明——McItem、CraftingTable、Furnace 三个组件的 props 与用法示例，以及自定义材质接入方式和扩展注册表的方法。
outline: [2, 3]
---

# Minecraft 配方可视化组件

用 `McItem`、`CraftingTable`、`Furnace` 三个组件，可在文档里以原版 GUI 风格展示配方。支持有序合成、无序合成与熔炉烧炼三种模式，内置 581 个原版物品材质（MC Java 1.21.11），也支持自定义物品材质。

已注册物品的 id 与中文名见 [已注册物品速查](/developer/website/mc-textures)。

## 组件总览

| 组件 | 用途 | 全局注册名 |
| :--- | :--- | :--- |
| `<McItem>` | 单个物品槽（材质、数量、tooltip） | `McItem` |
| `<CraftingTable>` | 3×3 工作台合成表 | `CraftingTable` |
| `<Furnace>` | 熔炉烧炼界面 | `Furnace` |

三个组件已在主题中全局注册，Markdown 里直接写标签即可，不需要手动 import。

## 原版材质

从 Minecraft Java 1.21.11 官方客户端提取 792 个物品材质 PNG，放在 `public/mc-textures/item/` 目录。过滤掉动画帧与渲染覆盖层等无用文件后，注册表保留 581 个可用物品，每个物品带官方 `zh_cn.json` 的中文名称。

材质路径约定：

```text
public/mc-textures/item/{id}.png
```

组件里只传 `id`，即可自动匹配材质和中文名称。

## 自定义物品材质

### 方式一：放入公共目录

把自定义材质 PNG 放进 `public/mc-textures/item/`，再通过 `id` 或 `texture` 引用：

```text
public/mc-textures/item/my_custom_food.png
```

```html
<!-- 直接传 texture 路径 -->
<McItem name="培根" texture="/mc-textures/item/my_custom_food.png" />

<!-- 放在任意 public 子目录 -->
<McItem name="草莓蛋糕" texture="/images/food/strawberry_cake.png" />
```

### 方式二：注册到映射表

在 [mc-textures.ts](https://github.com/fwindemiko/MiragEdge-DocWeb/blob/main/.vitepress/theme/data/mc-textures.ts) 中添加自定义物品：

```ts
export const mcTextures: Record<string, McItemData> = {
  // ... 原版物品 ...

  bacon: {
    name: '培根',
    texture: '/mc-textures/item/bacon.png',
  },
  strawberry_cake: {
    name: '草莓蛋糕',
    texture: '/images/food/strawberry_cake.png',
  },
}
```

添加后即可通过 `id` 引用：

```html
<McItem id="bacon" />
<McItem id="strawberry_cake" :count="3" />
```

::: tip 材质规格
- 尺寸 16×16（原版标准），或 32×32、64×64（高清材质）
- 格式 PNG，支持透明通道
- 背景必须是透明，不要用纯色背景
- 组件以 `image-rendering: pixelated` 像素化渲染，放大不模糊
:::

## McItem：物品槽组件

### 属性

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `id` | `String` | 无 | 注册表物品 id（如 `"wheat"`），自动匹配材质和中文名 |
| `name` | `String` | 无 | 物品名称，显示在 hover tooltip，覆盖注册表 |
| `texture` | `String` | 无 | 材质图片路径，覆盖注册表 |
| `count` | `Number`/`String` | `0` | 堆叠数量，大于 1 时显示右下角角标 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 槽位尺寸：32px / 48px / 64px |
| `tooltip` | `Boolean` | `true` | 是否显示 hover tooltip |

### 渲染优先级

```text
texture（图片材质） → name 首字（文字回退）
```

材质加载失败时自动回退到物品名首字符，不会出现裂图。

### 通过 id 引用原版物品

<McItem id="wheat" />

```html
<McItem id="wheat" />
```

### 自定义材质物品

<McItem name="培根" texture="/mc-textures/item/cooked_porkchop.png" />

```html
<McItem name="培根" texture="/mc-textures/item/cooked_porkchop.png" />
```

### 带数量

<McItem id="bread" :count="3" />

```html
<McItem id="bread" :count="3" />
```

### 三种尺寸

<McItem id="diamond" size="sm" />
<McItem id="diamond" size="md" />
<McItem id="diamond" size="lg" />

```html
<McItem id="diamond" size="sm" />
<McItem id="diamond" size="md" />
<McItem id="diamond" size="lg" />
```

## CraftingTable：工作台合成表

### 属性

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `shaped` | `Boolean` | `false` | 是否为有序合成 |
| `grid` | `Array` | `[]` | 有序模式：3×3 二维数组，元素为物品对象或 `null` |
| `ingredients` | `Array` | `[]` | 无序模式：材料列表，按顺序填入 3×3 网格 |
| `result` | `Object` | `null` | 合成结果物品对象 |
| `showShapelessBadge` | `Boolean` | `true` | 无序模式是否显示「无序」徽标 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 槽位尺寸 |

### 物品对象格式

每个格子可以传以下字段的任意组合：

```js
{
  id: 'wheat',        // 可选 — 查注册表，自动获取材质与中文名
  name: '小麦',        // 可选 — 覆盖注册表名称
  texture: '/xx.png', // 可选 — 覆盖注册表材质
  count: 3            // 可选 — 堆叠数量
}
```

### 有序合成：面包

<CraftingTable
  shaped
  :grid="[
    [{id:'wheat'}, {id:'wheat'}, {id:'wheat'}],
    [null, null, null],
    [null, null, null]
  ]"
  :result="{id:'bread'}"
/>

```html
<CraftingTable
  shaped
  :grid="[
    [{id:'wheat'}, {id:'wheat'}, {id:'wheat'}],
    [null, null, null],
    [null, null, null]
  ]"
  :result="{id:'bread'}"
/>
```

### 有序合成：蛋糕

<CraftingTable
  shaped
  :grid="[
    [{id:'milk_bucket'}, {id:'milk_bucket'}, {id:'milk_bucket'}],
    [{id:'sugar'}, {id:'egg'}, {id:'sugar'}],
    [{id:'wheat'}, {id:'wheat'}, {id:'wheat'}]
  ]"
  :result="{id:'cake'}"
/>

```html
<CraftingTable
  shaped
  :grid="[
    [{id:'milk_bucket'}, {id:'milk_bucket'}, {id:'milk_bucket'}],
    [{id:'sugar'}, {id:'egg'}, {id:'sugar'}],
    [{id:'wheat'}, {id:'wheat'}, {id:'wheat'}]
  ]"
  :result="{id:'cake'}"
/>
```

### 无序合成：蘑菇煲

<CraftingTable
  :ingredients="[
    {id:'brown_mushroom'},
    {id:'red_mushroom'},
    {id:'bowl'}
  ]"
  :result="{id:'mushroom_stew'}"
/>

```html
<CraftingTable
  :ingredients="[
    {id:'brown_mushroom'},
    {id:'red_mushroom'},
    {id:'bowl'}
  ]"
  :result="{id:'mushroom_stew'}"
/>
```

### 混合使用原版与自定义物品

<CraftingTable
  shaped
  :grid="[
    [{id:'cooked_porkchop'}, null, {id:'cooked_porkchop'}],
    [{id:'cooked_porkchop'}, {id:'sugar'}, {id:'cooked_porkchop'}],
    [{id:'cooked_porkchop'}, null, {id:'cooked_porkchop'}]
  ]"
  :result="{name:'蜜汁火腿', texture:'/mc-textures/item/cooked_porkchop.png'}"
/>

```html
<CraftingTable
  shaped
  :grid="[
    [{id:'cooked_porkchop'}, null, {id:'cooked_porkchop'}],
    [{id:'cooked_porkchop'}, {id:'sugar'}, {id:'cooked_porkchop'}],
    [{id:'cooked_porkchop'}, null, {id:'cooked_porkchop'}]
  ]"
  :result="{name:'蜜汁火腿', texture:'/mc-textures/item/cooked_porkchop.png'}"
/>
```

### 大尺寸

<CraftingTable
  shaped
  size="lg"
  :grid="[
    [{id:'gold_ingot'}, {id:'gold_ingot'}, {id:'gold_ingot'}],
    [{id:'gold_ingot'}, {id:'apple'}, {id:'gold_ingot'}],
    [{id:'gold_ingot'}, {id:'gold_ingot'}, {id:'gold_ingot'}]
  ]"
  :result="{id:'golden_apple'}"
/>

```html
<CraftingTable
  shaped
  size="lg"
  :grid="[
    [{id:'gold_ingot'}, {id:'gold_ingot'}, {id:'gold_ingot'}],
    [{id:'gold_ingot'}, {id:'apple'}, {id:'gold_ingot'}],
    [{id:'gold_ingot'}, {id:'gold_ingot'}, {id:'gold_ingot'}]
  ]"
  :result="{id:'golden_apple'}"
/>
```

### 小尺寸

<CraftingTable
  shaped
  size="sm"
  :grid="[
    [{id:'wheat'}, {id:'wheat'}],
    [null, null]
  ]"
  :result="{id:'bread', name:'面包'}"
/>

```html
<CraftingTable
  shaped
  size="sm"
  :grid="[
    [{id:'wheat'}, {id:'wheat'}],
    [null, null]
  ]"
  :result="{id:'bread'}"
/>
```

## Furnace：熔炉烧炼组件

### 属性

| 参数 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `input` | `Object` | `null` | 输入物品 |
| `result` | `Object` | `null` | 烧炼结果 |
| `fuel` | `Object` | `null` | 燃料物品 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 槽位尺寸 |
| `animated` | `Boolean` | `true` | 是否启用火焰动画 |

### 基础烧炼

<Furnace :input="{id:'beef'}" :result="{id:'cooked_beef'}" />

```html
<Furnace :input="{id:'beef'}" :result="{id:'cooked_beef'}" />
```

### 带燃料显示

<Furnace
  :input="{id:'cod'}"
  :result="{id:'cooked_cod'}"
  :fuel="{id:'coal'}"
/>

```html
<Furnace
  :input="{id:'cod'}"
  :result="{id:'cooked_cod'}"
  :fuel="{id:'coal'}"
/>
```

### 烤马铃薯

<Furnace :input="{id:'potato'}" :result="{id:'baked_potato'}" :fuel="{id:'charcoal'}" />

```html
<Furnace :input="{id:'potato'}" :result="{id:'baked_potato'}" :fuel="{id:'charcoal'}" />
```

### 关闭火焰动画

<Furnace
  :input="{id:'sand', name:'沙子'}"
  :result="{id:'glass_bottle', name:'玻璃'}"
  :animated="false"
/>

```html
<Furnace
  :input="{id:'sand', name:'沙子'}"
  :result="{id:'glass_bottle', name:'玻璃'}"
  :animated="false"
/>
```

## 在 Markdown 中使用

组件已全局注册，在任意 `.md` 文件中直接写标签即可：

```markdown
### 培根

<CraftingTable
  :ingredients="[
    {id:'cooked_porkchop'},
    {name:'菜刀', texture:'/mc-textures/item/iron_sword.png'}
  ]"
  :result="{name:'培根', texture:'/mc-textures/item/cooked_porkchop.png'}"
/>
```

::: tip 写法建议
- 传入数组或对象时必须用 `:prop="value"` 绑定，这是 Vue 动态 prop。
- 字符串值可以不用冒号：`size="lg"` 等价于 `:size="'lg'"`。
- `null` 表示空格子，即有序合成中留空的位置。
- 自定义物品只需传 `name` 和 `texture`，不必注册。
:::

## 扩展注册表

添加新的原版物品或自定义物品到注册表，编辑 [mc-textures.ts](https://github.com/fwindemiko/MiragEdge-DocWeb/blob/main/.vitepress/theme/data/mc-textures.ts)：

```ts
export const mcTextures: Record<string, McItemData> = {
  // ... 已有物品 ...

  bacon: {
    name: '培根',
    texture: '/mc-textures/item/bacon.png',
  },
}
```

添加后即可在任意组件中通过 `id="bacon"` 引用。

## 设计特性

### 视觉风格

- MC 原版槽位：内凹斜面边框加深色底板，复刻石头质感。
- 玻璃磨砂面板：`backdrop-filter: blur()` 与半透明背景融合深色主题。
- 像素化渲染：`image-rendering: pixelated` 确保材质放大后不模糊。
- 暗色模式适配：通过 `:deep(.dark)` 选择器自动调整配色。

### 动画效果

- 箭头脉冲：合成与烧炼箭头的呼吸式流光，用 `opacity` 过渡。
- 火焰跳动：熔炉火焰用 `transform: scaleY/scaleX` 模拟燃烧，GPU 加速。
- 火星粒子：两个黄色小圆点上升消散。
- 所有动画尊重 `prefers-reduced-motion` 偏好。

### 移动端兼容

- 屏幕宽度小于 480px 时自动缩小间距和箭头尺寸。
- 触摸设备（`hover: none`）隐藏 tooltip，避免误触。
- `inline-flex` 布局确保窄屏不溢出。
- 槽位尺寸通过 CSS 变量 `--mc-item-size` 统一控制。

### 性能优化

- 图片使用 `loading="lazy"` 原生懒加载。
- 动画只用 `transform` 与 `opacity`，不触发 layout 与 paint。
- 用 `will-change` 标记动画元素。
- 图片加载失败时回退到文字，不产生额外网络请求。
- 样式 `scoped`，无全局 CSS 污染。

## 文件位置

| 文件 | 说明 |
| :--- | :--- |
| `.vitepress/theme/components/vue/McItem.vue` | 物品槽组件 |
| `.vitepress/theme/components/vue/CraftingTable.vue` | 工作台组件 |
| `.vitepress/theme/components/vue/Furnace.vue` | 熔炉组件 |
| `.vitepress/theme/data/mc-textures.ts` | 物品材质注册表（581 个物品） |
| `public/mc-textures/item/` | 原版物品材质 PNG 文件（792 个） |
| `.vitepress/theme/index.ts` | 组件全局注册 |

套件按可扩展架构设计。要支持高炉、烟熏炉、切石机等配方类型，参照 `Furnace.vue` 新增同类组件即可。
