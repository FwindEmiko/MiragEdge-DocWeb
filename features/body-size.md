---
title: 体型装备
description: 体型装备的玩家使用说明，包含巨像胸甲放大体型并降低移速、灵影护腿缩小体型并提升移速，以及两件装备的合成材料、效果数值与叠加结果。
outline: [2, 3]
---

# 体型装备

体型装备是两件改变玩家体型与移动速度的趣味盔甲。穿上巨像胸甲变大变慢，穿上灵影护腿变小变快。

## 获取方式

两件装备都在工作台有序合成。

### 巨像胸甲

<CraftingTable
  shaped
  size="md"
  :grid="[
    [{name:'烈焰棒', texture:'/mc-textures/item/blaze_rod.png'}, {name:'重型矿镐', texture:'/mc-textures/item/hefty_pickaxe.png'}, {name:'烈焰棒', texture:'/mc-textures/item/blaze_rod.png'}],
    [{name:'烈焰棒', texture:'/mc-textures/item/blaze_rod.png'}, {name:'下界合金胸甲', texture:'/mc-textures/item/netherite_chestplate.png'}, {name:'烈焰棒', texture:'/mc-textures/item/blaze_rod.png'}],
    [{name:'下界合金锭', texture:'/mc-textures/item/netherite_ingot.png'}, {name:'死灵盾牌', texture:'/mc-textures/item/necrotic_shield.png'}, {name:'下界合金锭', texture:'/mc-textures/item/netherite_ingot.png'}]
  ]"
  :result="{name:'巨像胸甲', texture:'/mc-textures/item/giant_chestplate.png'}"
/>

材料来源：

- 烈焰棒 ×4：下界基础材料。
- 重型矿镐 ×1：烬域·废弃实验室。
- 下界合金胸甲 ×1：原版材料。
- 死灵盾牌 ×1：烬域·圣所或禁忌城堡。
- 下界合金锭 ×2：原版材料。

穿着后的外观为下界合金甲纹理。

### 灵影护腿

<CraftingTable
  shaped
  size="md"
  :grid="[
    [{name:'紫颂覆板', texture:'/mc-textures/item/chorus_plating.png'}, {name:'幻翼膜', texture:'/mc-textures/item/phantom_membrane.png'}, {name:'紫颂覆板', texture:'/mc-textures/item/chorus_plating.png'}],
    [{name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}, {name:'下界合金护腿', texture:'/mc-textures/item/netherite_leggings.png'}, {name:'末影合金碎片', texture:'/mc-textures/item/enderite_shard.png'}],
    [{name:'末影珍珠', texture:'/mc-textures/item/ender_pearl.png'}, {name:'星辉尘', texture:'/mc-textures/item/glowstone_dust.png'}, {name:'末影珍珠', texture:'/mc-textures/item/ender_pearl.png'}]
  ]"
  :result="{name:'灵影护腿', texture:'/mc-textures/item/shrink_leggings.png'}"
/>

材料来源：

- 紫颂覆板 ×2：繁星·诅咒祭坛，用铁锭与爆裂紫颂果合成。
- 幻翼膜 ×1：原版幻翼掉落。
- 末影合金碎片 ×2：繁星·末地城宝库。
- 下界合金护腿 ×1：原版材料。
- 末影珍珠 ×2：原版末影人掉落。
- 星辉尘 ×1：繁星·全境。

穿着后的外观为钻石护腿纹理。

## 效果与叠加

| 装备 | 体型 | 移动速度 |
| --- | --- | --- |
| 巨像胸甲 | 放大至 200% | 降低 30% |
| 灵影护腿 | 缩小至 50% | 提升 40% |

同时穿着两件时，体型变化为 `2.0 × 0.5 = 1.0`，恢复到正常体型。速度变化为 `-30% + 40% = +10%`，比平时更快。

两件装备分别占用胸甲槽位与护腿槽位。脱下后立即恢复原本的体型与速度。

## 相关页面

- [锻造升级](/features/forge)
- [服务器功能总览](/features/)
