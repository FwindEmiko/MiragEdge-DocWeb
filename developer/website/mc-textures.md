---
title: 已注册物品速查
description: McItem 组件可用的物品 id 与中文名速查——材质路径约定、19 个分类的数量统计，以及食物、食材原料、原材料与矿物三类的完整 id 对照表。
outline: [2, 3]
---
<script setup>
// 物品 id 对照表数据源。改动此表即改动页面筛选结果，不要再另外维护一份 markdown 表。
const itemColumns = [
  { key: 'id', label: 'id' },
  { key: 'name', label: '名称' },
]

const itemRows = [
  // 食物（37）
    { id: 'apple', name: '苹果', group: '食物' },
    { id: 'beef', name: '生牛肉', group: '食物' },
    { id: 'beetroot_soup', name: '甜菜汤', group: '食物' },
    { id: 'bread', name: '面包', group: '食物' },
    { id: 'cake', name: '蛋糕', group: '食物' },
    { id: 'chicken', name: '生鸡肉', group: '食物' },
    { id: 'chorus_fruit', name: '紫颂果', group: '食物' },
    { id: 'cod', name: '生鳕鱼', group: '食物' },
    { id: 'cooked_beef', name: '牛排', group: '食物' },
    { id: 'cooked_chicken', name: '熟鸡肉', group: '食物' },
    { id: 'cooked_cod', name: '熟鳕鱼', group: '食物' },
    { id: 'cooked_mutton', name: '熟羊肉', group: '食物' },
    { id: 'cooked_porkchop', name: '熟猪排', group: '食物' },
    { id: 'cooked_rabbit', name: '熟兔肉', group: '食物' },
    { id: 'cooked_salmon', name: '熟鲑鱼', group: '食物' },
    { id: 'cookie', name: '曲奇', group: '食物' },
    { id: 'fermented_spider_eye', name: '发酵蛛眼', group: '食物' },
    { id: 'glistering_melon_slice', name: '闪烁的西瓜片', group: '食物' },
    { id: 'golden_apple', name: '金苹果', group: '食物' },
    { id: 'golden_carrot', name: '金胡萝卜', group: '食物' },
    { id: 'melon_slice', name: '西瓜片', group: '食物' },
    { id: 'mushroom_stew', name: '蘑菇煲', group: '食物' },
    { id: 'mutton', name: '生羊肉', group: '食物' },
    { id: 'poisonous_potato', name: '毒马铃薯', group: '食物' },
    { id: 'popped_chorus_fruit', name: '爆裂紫颂果', group: '食物' },
    { id: 'porkchop', name: '生猪排', group: '食物' },
    { id: 'pufferfish', name: '河豚', group: '食物' },
    { id: 'pumpkin_pie', name: '南瓜派', group: '食物' },
    { id: 'rabbit_stew', name: '兔肉煲', group: '食物' },
    { id: 'rotten_flesh', name: '腐肉', group: '食物' },
    { id: 'salmon', name: '生鲑鱼', group: '食物' },
    { id: 'spider_eye', name: '蜘蛛眼', group: '食物' },
    { id: 'suspicious_stew', name: '谜之炖菜', group: '食物' },
    { id: 'tropical_fish', name: '热带鱼', group: '食物' },
    { id: 'sweet_berries', name: '甜浆果', group: '食物' },
    { id: 'glow_berries', name: '发光浆果', group: '食物' },
    { id: 'honey_bottle', name: '蜂蜜瓶', group: '食物' },
  // 食材原料（45）
    { id: 'wheat', name: '小麦', group: '食材原料' },
    { id: 'wheat_seeds', name: '小麦种子', group: '食材原料' },
    { id: 'sugar', name: '糖', group: '食材原料' },
    { id: 'egg', name: '鸡蛋', group: '食材原料' },
    { id: 'bowl', name: '碗', group: '食材原料' },
    { id: 'carrot', name: '胡萝卜', group: '食材原料' },
    { id: 'potato', name: '马铃薯', group: '食材原料' },
    { id: 'beetroot', name: '甜菜根', group: '食材原料' },
    { id: 'beetroot_seeds', name: '甜菜种子', group: '食材原料' },
    { id: 'melon_seeds', name: '西瓜种子', group: '食材原料' },
    { id: 'pumpkin_seeds', name: '南瓜种子', group: '食材原料' },
    { id: 'torchflower_seeds', name: '火把花种子', group: '食材原料' },
    { id: 'pitcher_pod', name: '投掷器豆荚', group: '食材原料' },
    { id: 'kelp', name: '海带', group: '食材原料' },
    { id: 'dried_kelp', name: '干海带', group: '食材原料' },
    { id: 'seagrass', name: '海草', group: '食材原料' },
    { id: 'sea_pickle', name: '海泡菜', group: '食材原料' },
    { id: 'cocoa_beans', name: '可可豆', group: '食材原料' },
    { id: 'nether_wart', name: '下界疣', group: '食材原料' },
    { id: 'nether_sprouts', name: '下界苗', group: '食材原料' },
    { id: 'bamboo', name: '竹子', group: '食材原料' },
    { id: 'sugar_cane', name: '甘蔗', group: '食材原料' },
    { id: 'paper', name: '纸', group: '食材原料' },
    { id: 'leather', name: '皮革', group: '食材原料' },
    { id: 'feather', name: '羽毛', group: '食材原料' },
    { id: 'flint', name: '燧石', group: '食材原料' },
    { id: 'clay_ball', name: '黏土球', group: '食材原料' },
    { id: 'brick', name: '红砖', group: '食材原料' },
    { id: 'nether_brick', name: '下界砖', group: '食材原料' },
    { id: 'resin_brick', name: '树脂砖', group: '食材原料' },
    { id: 'resin_clump', name: '树脂团', group: '食材原料' },
    { id: 'quartz', name: '下界石英', group: '食材原料' },
    { id: 'amethyst_shard', name: '紫水晶碎片', group: '食材原料' },
    { id: 'blaze_powder', name: '烈焰粉', group: '食材原料' },
    { id: 'blaze_rod', name: '烈焰棒', group: '食材原料' },
    { id: 'breeze_rod', name: '涡流杆', group: '食材原料' },
    { id: 'magma_cream', name: '岩浆膏', group: '食材原料' },
    { id: 'ghast_tear', name: '恶魂之泪', group: '食材原料' },
    { id: 'fermented_spider_eye', name: '发酵蛛眼', group: '食材原料' },
    { id: 'popped_chorus_fruit', name: '爆裂紫颂果', group: '食材原料' },
    { id: 'honeycomb', name: '蜜脾', group: '食材原料' },
    { id: 'ink_sac', name: '墨囊', group: '食材原料' },
    { id: 'glow_ink_sac', name: '荧光墨囊', group: '食材原料' },
    { id: 'cactus', name: '仙人掌', group: '食材原料' },
    { id: 'leaf_litter', name: '落叶', group: '食材原料' },
  // 原材料与矿物（38）
    { id: 'coal', name: '煤炭', group: '原材料与矿物' },
    { id: 'charcoal', name: '木炭', group: '原材料与矿物' },
    { id: 'iron_ingot', name: '铁锭', group: '原材料与矿物' },
    { id: 'iron_nugget', name: '铁粒', group: '原材料与矿物' },
    { id: 'gold_ingot', name: '金锭', group: '原材料与矿物' },
    { id: 'gold_nugget', name: '金粒', group: '原材料与矿物' },
    { id: 'copper_ingot', name: '铜锭', group: '原材料与矿物' },
    { id: 'copper_nugget', name: '铜粒', group: '原材料与矿物' },
    { id: 'diamond', name: '钻石', group: '原材料与矿物' },
    { id: 'emerald', name: '绿宝石', group: '原材料与矿物' },
    { id: 'lapis_lazuli', name: '青金石', group: '原材料与矿物' },
    { id: 'redstone', name: '红石粉', group: '原材料与矿物' },
    { id: 'glowstone_dust', name: '荧石粉', group: '原材料与矿物' },
    { id: 'netherite_ingot', name: '下界合金锭', group: '原材料与矿物' },
    { id: 'netherite_scrap', name: '下界合金碎片', group: '原材料与矿物' },
    { id: 'raw_iron', name: '粗铁', group: '原材料与矿物' },
    { id: 'raw_gold', name: '粗金', group: '原材料与矿物' },
    { id: 'raw_copper', name: '粗铜', group: '原材料与矿物' },
    { id: 'nether_star', name: '下界之星', group: '原材料与矿物' },
    { id: 'ender_pearl', name: '末影珍珠', group: '原材料与矿物' },
    { id: 'ender_eye', name: '末影之眼', group: '原材料与矿物' },
    { id: 'dragon_breath', name: '龙息', group: '原材料与矿物' },
    { id: 'shulker_shell', name: '潜影壳', group: '原材料与矿物' },
    { id: 'nautilus_shell', name: '鹦鹉螺壳', group: '原材料与矿物' },
    { id: 'phantom_membrane', name: '幻翼膜', group: '原材料与矿物' },
    { id: 'prismarine_shard', name: '海晶碎片', group: '原材料与矿物' },
    { id: 'prismarine_crystals', name: '海晶砂粒', group: '原材料与矿物' },
    { id: 'echo_shard', name: '回响碎片', group: '原材料与矿物' },
    { id: 'disc_fragment_5', name: '唱片碎片 5', group: '原材料与矿物' },
    { id: 'heart_of_the_sea', name: '海洋之心', group: '原材料与矿物' },
    { id: 'turtle_scute', name: '海龟鳞甲', group: '原材料与矿物' },
    { id: 'armadillo_scute', name: '犰狳鳞甲', group: '原材料与矿物' },
    { id: 'wind_charge', name: '风弹', group: '原材料与矿物' },
    { id: 'fire_charge', name: '火焰弹', group: '原材料与矿物' },
    { id: 'gunpowder', name: '火药', group: '原材料与矿物' },
    { id: 'string', name: '线', group: '原材料与矿物' },
    { id: 'bone', name: '骨头', group: '原材料与矿物' },
    { id: 'bone_meal', name: '骨粉', group: '原材料与矿物' },
]
</script>



# 已注册物品速查

写 `<McItem>` 时用这页查物品 `id` 与中文名。

组件用法见 [Minecraft 配方可视化组件](/developer/website/mcrecipe)。

## 材质路径约定

```text
public/mc-textures/item/{id}.png
```

从 Minecraft Java 1.21.11 官方客户端提取 792 个物品材质 PNG，过滤掉动画帧与渲染覆盖层等无用文件后，注册表保留 581 个可用物品。

## 分类统计

注册表共 581 个物品，按以下分类组织：

| 分类 | 数量 | 示例 id |
| :--- | :--- | :--- |
| 食物 | 37 | `bread`, `apple`, `cooked_beef`, `cake`, `cookie` |
| 食材原料 | 45 | `wheat`, `sugar`, `egg`, `carrot`, `leather` |
| 工具 | 25 | `iron_pickaxe`, `shears`, `brush`, `fishing_rod` |
| 武器 | 21 | `diamond_sword`, `bow`, `trident`, `mace` |
| 防具 | 42 | `netherite_helmet`, `elytra`, `diamond_chestplate` |
| 原材料与矿物 | 38 | `iron_ingot`, `diamond`, `coal`, `emerald`, `netherite_scrap` |
| 染料 | 48 | `red_dye`, `blue_dye`, `white_candle`, `black_harness` |
| 刷怪蛋 | 87 | `zombie_spawn_egg`, `creeper_spawn_egg` |
| 药水与饮品 | 6 | `potion`, `splash_potion`, `lingering_potion` |
| 音乐唱片 | 21 | `music_disc_13`, `music_disc_cat`, `music_disc_pigstep` |
| 陶罐碎片 | 23 | `archer_pottery_sherd`, `heart_pottery_sherd` |
| 锻造模板 | 19 | `netherite_upgrade_smithing_template`, `bolt_armor_trim_smithing_template` |
| 旗帜图案 | 10 | `creeper_banner_pattern`, `globe_banner_pattern` |
| 船只与交通工具 | 26 | `oak_boat`, `oak_chest_boat`, `minecart` |
| 门与招牌 | 41 | `oak_door`, `oak_sign`, `oak_hanging_sign` |
| 桶与容器 | 10 | `water_bucket`, `lava_bucket`, `milk_bucket` |
| 红石与机械 | 3 | `repeater`, `comparator`, `hopper` |
| 装饰与杂项 | 26 | `bundle`, `painting`, `lantern`, `campfire` |
| 其他 | 53 | `book`, `map`, `paper`, `name_tag`, `lead` |

## 物品 id 对照表

以下列出食物、食材原料、原材料与矿物三类的完整 id。其余分类的 id 见源文件注册表。

<DataTable
  :columns="itemColumns"
  :rows="itemRows"
  group-key="group"
  :page-size="0"
  search-placeholder="输入 id 或中文名筛选"
  note="共 120 个物品，覆盖食物、食材原料、原材料与矿物三类；全量 581 个物品见源文件注册表。"
/>

完整注册表见源文件 [mc-textures.ts](https://github.com/fwindemiko/MiragEdge-DocWeb/blob/main/.vitepress/theme/data/mc-textures.ts)。
