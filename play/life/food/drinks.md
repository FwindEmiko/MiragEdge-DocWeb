---
title: 饮品
description: 锐界幻境饮品图鉴：啤酒、珍珠奶茶，以及可口可乐、百事可乐、雪碧、芬达四款汽水的配方、饥饿值、饱和度与饮用效果，合计 6 种。
outline: [2, 3]
---

# 饮品

这页收录 6 种饮品。啤酒和珍珠奶茶靠自己合成，四款汽水只能靠活动与任务获取。

## 啤酒

<FoodEntry
  name="啤酒"
  quality="fine"
  :hunger="2"
  :saturation="4.0"
  effect="10秒饱和 + 5秒力量 II + 失明与反胃。60秒内连饮 3瓶或更多触发物品栏随机打乱，并获得 10秒力量 III。"
  warning="60秒内饮用超过3次 → 物品栏随机打乱！"
  quote="小麦果汁！有很强的饱腹感，但喝多会醉...注意适量！"
>
  <CraftingTable
    :ingredients="[
      {id:'hop'},
      {id:'hop'},
      {id:'wheat'},
      {id:'glass_bottle'}
    ]"
    :result="{id:'beer'}"
  />
</FoodEntry>

## 珍珠奶茶

<FoodEntry
  name="珍珠奶茶"
  quality="fine"
  :hunger="2"
  :saturation="4.0"
  effect="饮用时附带一次小范围随机传送并向周围弹射伤害粒子（1点伤害+击退）。"
  quote="这珍珠...怪怪的？喝起来有种不真实的感觉..."
>
  <CraftingTable
    :ingredients="[
      {id:'milk_bucket'},
      {id:'sugar'},
      {id:'sweet_potato'},
      {id:'ender_pearl'}
    ]"
    :result="{id:'bubble_tea'}"
  />
</FoodEntry>

## 汽水系列

四款汽水来自活动与任务，商店不售卖。属性相同，效果各不相同。

### 可口可乐

<FoodEntry
  name="可口可乐"
  quality="common"
  :hunger="5"
  :saturation="4.0"
  effect="饮用后周期性嗝气，并获得 15 秒速度 I。"
  quote="锐界幻境特供汽水系列，活动与任务获取"
>
  <McItem id="coca_cola" size="lg" />
</FoodEntry>

### 百事可乐

<FoodEntry
  name="百事可乐"
  quality="common"
  :hunger="5"
  :saturation="4.0"
  effect="饮用后获得 15 秒跳跃提升 I。"
  quote="锐界幻境特供汽水系列，活动与任务获取"
>
  <McItem id="pepsi_cola" size="lg" />
</FoodEntry>

### 雪碧

<FoodEntry
  name="雪碧"
  quality="common"
  :hunger="5"
  :saturation="4.0"
  effect="饮用后获得 15 秒缓降。"
  quote="锐界幻境特供汽水系列，活动与任务获取"
>
  <McItem id="sprite" size="lg" />
</FoodEntry>

### 芬达

<FoodEntry
  name="芬达"
  quality="common"
  :hunger="5"
  :saturation="4.0"
  effect="饮用后获得 15 秒抗火。"
  quote="锐界幻境特供汽水系列，活动与任务获取"
>
  <McItem id="fanta" size="lg" />
</FoodEntry>

::: tip 容器返还
啤酒喝完返还空瓶，珍珠奶茶喝完返还空桶。
:::
