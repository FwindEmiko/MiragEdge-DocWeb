---
title: 沙拉凉菜
---

#  沙拉凉菜

健康清淡的田园风味，用新鲜的蔬菜与浆果拌成的凉菜。部分杂拌料理蕴含意想不到的强力效果。

::: tip 分类说明
本页收录 10 种沙拉凉菜，从普通到稀有品质，涵盖生命恢复、夜视、海豚恩惠等多种实用效果。
:::

## 蒲公英沙拉

<FoodEntry
  name="蒲公英沙拉"
  quality="fine"
  :hunger="6"
  :saturation="7.0"
  effect="5秒反胃，随后 5秒生命恢复 II，随后 15秒抗性提升 I。"
  quote="虽然入口苦涩，但蒲公英确实能治愈一些疾病...先苦后甜"
>
  <CraftingTable
    :ingredients="[
      {name:'蒲公英', texture:'/mc-textures/item/dandelion.png'},
      {id:'lettuce'},
      {id:'tomato'},
      {id:'bowl'}
    ]"
    :result="{id:'dandelion_salad'}"
  />
</FoodEntry>

## 浆果沙拉

<FoodEntry
  name="浆果沙拉"
  quality="fine"
  :hunger="7"
  :saturation="8.0"
  effect="5秒生命恢复 + 20秒内背刺伤害 +50%。35秒冷却。"
  quote="幻境森林中的特产，狐狸好像挺喜欢吃的嘛？"
>
  <CraftingTable
    :ingredients="[
      {id:'sweet_berries'}, {id:'sweet_berries'},
      {id:'glow_berries'},
      {id:'bowl'}
    ]"
    :result="{id:'berry_salad'}"
  />
</FoodEntry>

## 海草沙拉

<FoodEntry
  name="海草沙拉"
  quality="common"
  :hunger="6"
  :saturation="7.0"
  effect="食用后获得 30秒 海豚恩惠"
  quote="好吧，看起来只是一堆草...但是意外地清爽可口"
>
  <CraftingTable
    :ingredients="[
      {id:'seagrass'}, {id:'seagrass'},
      {id:'lettuce'},
      {id:'bowl'}
    ]"
    :result="{id:'seagrass_salad'}"
  />
</FoodEntry>

## 洞穴杂拌

<FoodEntry
  name="洞穴杂拌"
  quality="fine"
  :hunger="6"
  :saturation="7.0"
  effect="60秒夜视 + 45秒急迫 III。"
  quote="幻境洞穴风味，吃下去仿佛黑暗中的明灯"
>
  <CraftingTable
    :ingredients="[
      {id:'glow_berries'},
      {name:'棕色蘑菇', texture:'/mc-textures/item/brown_mushroom.png'},
      {name:'红色蘑菇', texture:'/mc-textures/item/red_mushroom.png'},
      {id:'bowl'}
    ]"
    :result="{id:'cave_medley'}"
  />
</FoodEntry>

## 海洋杂拌

<FoodEntry
  name="海洋杂拌"
  quality="fine"
  :hunger="6"
  :saturation="7.0"
  effect="30秒水下呼吸 + 夜视 + 游泳速度提升 + 水下攻击力 +20%。"
  quote="看起来很健康，其实...真的很健康！海洋的精华尽在其中"
>
  <CraftingTable
    :ingredients="[
      {id:'seagrass'},
      {id:'cod'},
      {id:'prismarine_shard'},
      {id:'bowl'}
    ]"
    :result="{id:'ocean_medley'}"
  />
</FoodEntry>

## 幽寂杂拌

<FoodEntry
  name="幽寂杂拌"
  quality="rare"
  :hunger="10"
  :saturation="12.0"
  effect="5秒饱和 + 4秒反胃 + 8分钟夜视"
  quote="锐界幻境幽匿风味，虽然不好吃但就是忍不住想尝..."
>
  <CraftingTable
    :ingredients="[
      {name:'回响碎片', texture:'/mc-textures/item/echo_shard.png'},
      {name:'幽匿催生体', texture:'/mc-textures/item/sculk_catalyst.png'},
      {id:'bowl'}
    ]"
    :result="{id:'sculk_medley'}"
  />
</FoodEntry>

## 豆腐

<FoodEntry
  name="豆腐"
  quality="common"
  :hunger="3"
  :saturation="2.0"
  effect="无特殊效果"
  quote="锐界幻境的豆腐...白白嫩嫩的"
>
  <CraftingTable
    :ingredients="[
      {id:'green_bean'},
      {id:'green_bean'},
      {id:'green_bean'},
      {id:'bowl'}
    ]"
    :result="{id:'tofu', count:2}"
  />
</FoodEntry>

## 臭豆腐

<FoodEntry
  name="臭豆腐"
  quality="fine"
  :hunger="6"
  :saturation="4.0"
  effect="周围生物获得 8秒虚弱、缓慢、反胃，自身获得 15秒力量 I。"
  quote="好臭！！虽然吃着香，但请不要在公共场合食用！"
>
  <CraftingTable
    :ingredients="[
      {id:'tofu'},
      {id:'fermented_spider_eye'}
    ]"
    :result="{id:'stinky_tofu'}"
  />
</FoodEntry>

## 草莓酱

<FoodEntry
  name="草莓酱"
  quality="common"
  :hunger="6"
  :saturation="3.0"
  effect="食用后获得 10秒 速度 I"
  quote="新鲜的锐界幻境草莓熬制，甜到心里去"
>
  <CraftingTable
    :ingredients="[
      {id:'strawberry'}, {id:'strawberry'},
      {id:'sugar'},
      {id:'glass_bottle'}
    ]"
    :result="{id:'strawberry_jam'}"
  />
</FoodEntry>

## 仙人掌切块

<FoodEntry
  name="仙人掌切块"
  quality="common"
  :hunger="5"
  :saturation="3.0"
  effect="5秒反胃 + 周围骆驼获得 20秒生命恢复"
  quote="锐界幻境沙漠风味，对人类来说有点扎嘴...但骆驼很爱"
>
  <CraftingTable
    :ingredients="[
      {name:'仙人掌', texture:'/mc-textures/item/cactus.png'},
      {id:'pig_slayer'}
    ]"
    :result="{id:'cut_cactus', count:2}"
  />
</FoodEntry>


*本页为沙拉凉菜分类 · 设计与数值可能随游戏版本调整*
