---
title: 已注册物品速查
description: McItem 组件可用的物品 id 与中文名速查——材质路径约定、19 个分类的数量统计，以及食物、食材原料、原材料与矿物三类的完整 id 对照表。
outline: [2, 3]
---

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

<details>
<summary>点击查看完整物品列表</summary>

<!-- ITEMS_LIST_START -->

**食物** (37)

| id | 名称 |
| :--- | :--- |
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
| :--- | :--- |
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

**原材料与矿物** (38)

| id | 名称 |
| :--- | :--- |
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

完整注册表见源文件 [mc-textures.ts](https://github.com/fwindemiko/MiragEdge-DocWeb/blob/main/.vitepress/theme/data/mc-textures.ts)。
