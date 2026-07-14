---
title: 煎蛋系列
---

# <MapIcon name="cooking" :size="24" /> 煎蛋系列

从普通鸡蛋到传说中的龙蛋，煎制后的蛋类料理品质跨度极大。越是稀有的蛋，煎出来的效果越强大。

::: tip 分类说明
本页收录 3 种煎蛋料理，品质从普通到传说，全部通过熔炉煎制而成。
:::

## 煎海龟蛋

<FoodEntry
  name="煎海龟蛋"
  quality="common"
  :hunger="3"
  :saturation="2.0"
  effect="食用后获得 10秒 缓慢"
  quote="好吃但是不建议吃，这...毕竟是一颗未来的小海龟"
>
  <Furnace
    :input="{id:'turtle_egg'}"
    :result="{id:'fried_turtle_egg'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>

## 煎嗅探兽蛋

<FoodEntry
  name="煎嗅探兽蛋"
  quality="rare"
  :hunger="7"
  :saturation="4.0"
  effect="45秒生命恢复 + 2分钟抗性提升 I"
  quote="来自远古的味道...唇齿留香，蕴含远古生命之力"
>
  <Furnace
    :input="{id:'sniffer_egg'}"
    :result="{id:'fried_sniffer_egg'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>

## 煎龙蛋

<FoodEntry
  name="煎龙蛋"
  quality="legendary"
  :hunger="2"
  :saturation="20.0"
  effect="30分钟免疫坠落、火焰、弹射物伤害 + 抗性 II + 生命恢复 I + 伤害吸收 V。近战攻击附带龙息粒子。食用时解锁永久称号「龙之胃」及专属进出服消息。30分钟冷却。"
  quote="奢侈中的奢侈，真的可以吃得起吗...吃下去就是半个创造模式"
>
  <Furnace
    :input="{name:'龙蛋', texture:'/mc-textures/item/dragon_egg.png'}"
    :result="{id:'fried_dragon_egg'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>


*本页为煎蛋系列分类 · 设计与数值可能随游戏版本调整*
