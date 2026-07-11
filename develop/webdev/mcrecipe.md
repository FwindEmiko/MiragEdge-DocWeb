# Minecraft 配方可视化组件

<MapIcon name="sparkles" :size="16" /> **工作台 · 熔炉 · 物品槽** — 复刻原版 GUI 风格的配方展示组件套件

本组件套件用于在文档中以可视化的方式展示 Minecraft 配方，支持 **有序合成**、**无序合成** 和 **熔炉烧炼** 三种模式，内置 **581 个原版物品材质**（MC Java 1.21.11），并支持自定义物品材质。

## 组件总览

| 组件 | 用途 | 全局注册名 |
|------|------|-----------|
| `<McItem>` | 单个物品槽（材质 + 数量 + tooltip） | `McItem` |
| `<CraftingTable>` | 3×3 工作台合成表 | `CraftingTable` |
| `<Furnace>` | 熔炉烧炼界面 | `Furnace` |

组件已在主题中全局注册，无需在 Markdown 中手动 import，直接使用标签即可。

## 原版材质

已从 Minecraft Java 1.21.11 官方客户端提取 **792 个物品材质 PNG**，放入 `public/mc-textures/item/` 目录。经过过滤（去除动画帧、渲染覆盖层等无用文件）后，注册表中保留 **581 个可用物品**，每个物品都带有官方 `zh_cn.json` 的中文名称。

材质路径约定：

```
public/mc-textures/item/{id}.png
```

在组件中只需传入 `id`，即可自动匹配材质和中文名称，无需额外配置。

## 自定义物品材质

对于模组/自定义物品，有两种方式使用自定义材质：

### 方式一：放入公共目录（推荐）

将自定义材质 PNG 放入 `public/mc-textures/item/` 目录，然后通过 `id` 或 `texture` 引用：

```
public/mc-textures/item/my_custom_food.png
```

```html
<!-- 方式 A: 直接传 texture 路径 -->
<McItem name="培根" texture="/mc-textures/item/my_custom_food.png" />

<!-- 方式 B: 放在任意 public 子目录 -->
<McItem name="草莓蛋糕" texture="/images/food/strawberry_cake.png" />
```

### 方式二：注册到映射表

在 [mc-textures.ts](https://github.com/fwindemiko/MiragEdge-DocWeb/blob/main/.vitepress/theme/data/mc-textures.ts) 中添加自定义物品：

```ts
export const mcTextures: Record<string, McItemData> = {
  // ... 原版物品 ...

  // 添加自定义物品：
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

::: tip 材质规格建议
- **尺寸**：16×16（原版标准）或 32×32 / 64×64（高清材质）
- **格式**：PNG（支持透明通道）
- **背景**：透明（不要用纯色背景）
- 组件会自动以 `image-rendering: pixelated` 像素化渲染，确保放大不模糊
:::

## McItem — 物品槽组件

### 属性

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `String` | — | 注册表物品 id（如 `"wheat"`），自动匹配材质和中文名 |
| `name` | `String` | — | 物品名称，显示在 hover tooltip（覆盖注册表） |
| `texture` | `String` | — | 材质图片路径（覆盖注册表） |
| `count` | `Number/String` | `0` | 堆叠数量，>1 时显示右下角角标 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 槽位尺寸：32px / 48px / 64px |
| `tooltip` | `Boolean` | `true` | 是否显示 hover tooltip |

### 渲染优先级

```
texture（图片材质） → name 首字（文字回退）
```

材质加载失败时自动回退到物品名首字符显示，不会出现裂图。

### 基础用法 — 通过 id 引用原版物品

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

### 不同尺寸

<McItem id="diamond" size="sm" />
<McItem id="diamond" size="md" />
<McItem id="diamond" size="lg" />

```html
<McItem id="diamond" size="sm" />
<McItem id="diamond" size="md" />
<McItem id="diamond" size="lg" />
```

## CraftingTable — 工作台合成表

### 属性

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
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
  id: 'wheat',        // 可选 — 查注册表，自动获取材质+中文名
  name: '小麦',        // 可选 — 覆盖注册表名称
  texture: '/xx.png', // 可选 — 覆盖注册表材质
  count: 3            // 可选 — 堆叠数量
}
```

### 有序合成示例 — 面包

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

### 有序合成 — 蛋糕

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

### 无序合成 — 蘑菇煲

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

### 混合使用 — 原版 + 自定义物品

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

### 大尺寸合成（适合突出展示）

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

### 小尺寸（紧凑排版）

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

## Furnace — 熔炉烧炼组件

### 属性

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `input` | `Object` | `null` | 输入物品 |
| `result` | `Object` | `null` | 烧炼结果 |
| `fuel` | `Object` | `null` | 燃料物品 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 槽位尺寸 |
| `animated` | `Boolean` | `true` | 是否启用火焰动画 |

### 基础烧炼 — 熟肉

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
- 传入数组/对象时必须用 `:prop="value"` 绑定（Vue 动态 prop）
- 字符串值可以不用冒号：`size="lg"` 等价于 `:size="'lg'"`
- `null` 表示空格子（有序合成中留空的位置）
- 自定义物品只需传 `name` + `texture`，无需注册
:::

## 扩展注册表

如需添加新的原版物品或自定义物品到注册表，编辑 [.vitepress/theme/data/mc-textures.ts](https://github.com/fwindemiko/MiragEdge-DocWeb/blob/main/.vitepress/theme/data/mc-textures.ts)：

```ts
export const mcTextures: Record<string, McItemData> = {
  // ... 已有物品 ...

  // 添加自定义物品：
  bacon: {
    name: '培根',
    texture: '/mc-textures/item/bacon.png',
  },
}
```

添加后即可在任意组件中通过 `id="bacon"` 引用。

## 设计特性

### 视觉风格

- **MC 原版槽位**：内凹斜面边框 + 深色底板，复刻石头质感
- **玻璃磨砂面板**：`backdrop-filter: blur()` 与半透明背景融合深色主题
- **像素化渲染**：`image-rendering: pixelated` 确保材质放大后不模糊
- **暗色模式适配**：通过 `:deep(.dark)` 选择器自动调整配色

### 动画效果

- **箭头脉冲**：合成/烧炼箭头呼吸式流光（`opacity` 过渡）
- **火焰跳动**：熔炉火焰 `transform: scaleY/scaleX` 模拟燃烧（GPU 加速）
- **火星粒子**：两个黄色小圆点上升消散动画
- 所有动画均尊重 `prefers-reduced-motion` 偏好，无障碍友好

### 移动端兼容

- `<480px` 屏幕自动缩小间距和箭头尺寸
- 触摸设备（`hover: none`）隐藏 tooltip，避免误触
- `inline-flex` 布局确保窄屏不溢出
- 槽位尺寸通过 CSS 变量 `--mc-item-size` 统一控制

### 性能优化

- 图片使用 `loading="lazy"` 原生懒加载
- 动画仅使用 `transform` / `opacity`（不触发 layout/paint）
- `will-change` 标记动画元素，提示浏览器优化
- 图片加载失败时自动回退到文字，无额外网络请求
- 组件 `scoped` 样式，无全局 CSS 污染

## 已注册物品速查

注册表共包含 **581 个物品**，按以下分类组织：

| 分类 | 数量 | 示例 id |
|------|------|---------|
| 食物 | 37 | `bread`, `apple`, `cooked_beef`, `cake`, `cookie` |
| 食材原料 | 45 | `wheat`, `sugar`, `egg`, `carrot`, `leather` |
| 工具 | 25 | `iron_pickaxe`, `shears`, `brush`, `fishing_rod` |
| 武器 | 21 | `diamond_sword`, `bow`, `trident`, `mace` |
| 防具 | 42 | `netherite_helmet`, `elytra`, `diamond_chestplate` |
| 原材料/矿物 | 38 | `iron_ingot`, `diamond`, `coal`, `emerald`, `netherite_scrap` |
| 染料 | 48 | `red_dye`, `blue_dye`, `white_candle`, `black_harness` |
| 刷怪蛋 | 87 | `zombie_spawn_egg`, `creeper_spawn_egg` |
| 药水/饮品 | 6 | `potion`, `splash_potion`, `lingering_potion` |
| 音乐唱片 | 21 | `music_disc_13`, `music_disc_cat`, `music_disc_pigstep` |
| 陶罐碎片 | 23 | `archer_pottery_sherd`, `heart_pottery_sherd` |
| 锻造模板 | 19 | `netherite_upgrade_smithing_template`, `bolt_armor_trim_smithing_template` |
| 旗帜图案 | 10 | `creeper_banner_pattern`, `globe_banner_pattern` |
| 船只/交通工具 | 26 | `oak_boat`, `oak_chest_boat`, `minecart` |
| 门/招牌 | 41 | `oak_door`, `oak_sign`, `oak_hanging_sign` |
| 桶/容器 | 10 | `water_bucket`, `lava_bucket`, `milk_bucket` |
| 红石/机械 | 3 | `repeater`, `comparator`, `hopper` |
| 装饰/杂项 | 26 | `bundle`, `painting`, `lantern`, `campfire` |
| 其他 | 53 | `book`, `map`, `paper`, `name_tag`, `lead` |

<details>
<summary>点击查看完整物品列表</summary>

<!-- ITEMS_LIST_START -->

**食物** (37)

| id | 名称 |
|----|------|
| `apple` | 苹果 |
| `beef` | 生牛肉 |
| `beetroot_soup` | 甜菜汤 |
| `bread` | 面包 |
| `cake` | 蛋糕 |
| `chicken` | 生鸡肉 |
| `chorus_fruit` | 紫颂果 |
| `cod` | 生鳕鱼 |
| `cooked_beef` | 牛排 |
| `cooked_chicken` | 熟鸡肉 |
| `cooked_cod` | 熟鳕鱼 |
| `cooked_mutton` | 熟羊肉 |
| `cooked_porkchop` | 熟猪排 |
| `cooked_rabbit` | 熟兔肉 |
| `cooked_salmon` | 熟鲑鱼 |
| `cookie` | 曲奇 |
| `fermented_spider_eye` | 发酵蛛眼 |
| `glistering_melon_slice` | 闪烁的西瓜片 |
| `golden_apple` | 金苹果 |
| `golden_carrot` | 金胡萝卜 |
| `melon_slice` | 西瓜片 |
| `mushroom_stew` | 蘑菇煲 |
| `mutton` | 生羊肉 |
| `poisonous_potato` | 毒马铃薯 |
| `popped_chorus_fruit` | 爆裂紫颂果 |
| `porkchop` | 生猪排 |
| `pufferfish` | 河豚 |
| `pumpkin_pie` | 南瓜派 |
| `rabbit_stew` | 兔肉煲 |
| `rotten_flesh` | 腐肉 |
| `salmon` | 生鲑鱼 |
| `spider_eye` | 蜘蛛眼 |
| `suspicious_stew` | 谜之炖菜 |
| `tropical_fish` | 热带鱼 |
| `sweet_berries` | 甜浆果 |
| `glow_berries` | 发光浆果 |
| `honey_bottle` | 蜂蜜瓶 |

**食材原料** (45)

| id | 名称 |
|----|------|
| `wheat` | 小麦 |
| `wheat_seeds` | 小麦种子 |
| `sugar` | 糖 |
| `egg` | 鸡蛋 |
| `bowl` | 碗 |
| `carrot` | 胡萝卜 |
| `potato` | 马铃薯 |
| `beetroot` | 甜菜根 |
| `beetroot_seeds` | 甜菜种子 |
| `melon_seeds` | 西瓜种子 |
| `pumpkin_seeds` | 南瓜种子 |
| `torchflower_seeds` | 火把花种子 |
| `pitcher_pod` | 投掷器豆荚 |
| `kelp` | 海带 |
| `dried_kelp` | 干海带 |
| `seagrass` | 海草 |
| `sea_pickle` | 海泡菜 |
| `cocoa_beans` | 可可豆 |
| `nether_wart` | 下界疣 |
| `nether_sprouts` | 下界苗 |
| `bamboo` | 竹子 |
| `sugar_cane` | 甘蔗 |
| `paper` | 纸 |
| `leather` | 皮革 |
| `feather` | 羽毛 |
| `flint` | 燧石 |
| `clay_ball` | 黏土球 |
| `brick` | 红砖 |
| `nether_brick` | 下界砖 |
| `resin_brick` | 树脂砖 |
| `resin_clump` | 树脂团 |
| `quartz` | 下界石英 |
| `amethyst_shard` | 紫水晶碎片 |
| `blaze_powder` | 烈焰粉 |
| `blaze_rod` | 烈焰棒 |
| `breeze_rod` | 涡流杆 |
| `magma_cream` | 岩浆膏 |
| `ghast_tear` | 恶魂之泪 |
| `fermented_spider_eye` | 发酵蛛眼 |
| `popped_chorus_fruit` | 爆裂紫颂果 |
| `honeycomb` | 蜜脾 |
| `ink_sac` | 墨囊 |
| `glow_ink_sac` | 荧光墨囊 |
| `cactus` | 仙人掌 |
| `leaf_litter` | 落叶 |

**原材料/矿物** (38)

| id | 名称 |
|----|------|
| `coal` | 煤炭 |
| `charcoal` | 木炭 |
| `iron_ingot` | 铁锭 |
| `iron_nugget` | 铁粒 |
| `gold_ingot` | 金锭 |
| `gold_nugget` | 金粒 |
| `copper_ingot` | 铜锭 |
| `copper_nugget` | 铜粒 |
| `diamond` | 钻石 |
| `emerald` | 绿宝石 |
| `lapis_lazuli` | 青金石 |
| `redstone` | 红石粉 |
| `glowstone_dust` | 荧石粉 |
| `netherite_ingot` | 下界合金锭 |
| `netherite_scrap` | 下界合金碎片 |
| `raw_iron` | 粗铁 |
| `raw_gold` | 粗金 |
| `raw_copper` | 粗铜 |
| `nether_star` | 下界之星 |
| `ender_pearl` | 末影珍珠 |
| `ender_eye` | 末影之眼 |
| `dragon_breath` | 龙息 |
| `shulker_shell` | 潜影壳 |
| `nautilus_shell` | 鹦鹉螺壳 |
| `phantom_membrane` | 幻翼膜 |
| `prismarine_shard` | 海晶碎片 |
| `prismarine_crystals` | 海晶砂粒 |
| `echo_shard` | 回响碎片 |
| `disc_fragment_5` | 唱片碎片 5 |
| `heart_of_the_sea` | 海洋之心 |
| `turtle_scute` | 海龟鳞甲 |
| `armadillo_scute` | 犰狳鳞甲 |
| `wind_charge` | 风弹 |
| `fire_charge` | 火焰弹 |
| `gunpowder` | 火药 |
| `string` | 线 |
| `bone` | 骨头 |
| `bone_meal` | 骨粉 |

<!-- ITEMS_LIST_END -->

</details>

> 完整注册表请查看源文件：[mc-textures.ts](https://github.com/fwindemiko/MiragEdge-DocWeb/blob/main/.vitepress/theme/data/mc-textures.ts)

## 文件位置

| 文件 | 说明 |
|------|------|
| `.vitepress/theme/components/vue/McItem.vue` | 物品槽组件 |
| `.vitepress/theme/components/vue/CraftingTable.vue` | 工作台组件 |
| `.vitepress/theme/components/vue/Furnace.vue` | 熔炉组件 |
| `.vitepress/theme/data/mc-textures.ts` | 物品材质注册表（581 个物品） |
| `public/mc-textures/item/` | 原版物品材质 PNG 文件（792 个） |
| `.vitepress/theme/index.ts` | 组件全局注册 |

*本组件套件设计为可扩展架构 — 后续如需支持高炉、烟熏炉、切石机等配方类型，只需参照 Furnace 组件新增同类组件即可。*
