# <MapIcon name="cooking" :size="24" /> 主菜肉食

硬核的战斗补给，高饱食、强力 buff。从大火腿到牛肉炖，每一道都是冒险者的能量源泉。

::: tip 分类说明
本页收录 11 种主菜肉食，以稀有和精良品质为主，提供力量、饱和、抗火、暴击等核心战斗 buff。
:::

## 大火腿

<FoodEntry
  name="大火腿"
  quality="rare"
  :hunger="10"
  :saturation="15.0"
  effect="30秒力量 II + 40秒暴击伤害 +100%"
  quote="看起来好像一把棒槌...打人很痛的样子，吃下去战斗力爆表"
>
  <CraftingTable
    shaped
    :grid="[
      [{id:'cooked_porkchop'}, {id:'cooked_porkchop'}, {id:'cooked_porkchop'}],
      [{id:'cooked_porkchop'}, {id:'bone_meal'}, {id:'cooked_porkchop'}],
      [{id:'cooked_porkchop'}, {id:'cooked_porkchop'}, {id:'cooked_porkchop'}]
    ]"
    :result="{id:'big_ham'}"
  />
</FoodEntry>

## 肉夹馍

<FoodEntry
  name="肉夹馍"
  quality="rare"
  :hunger="8"
  :saturation="4.0"
  effect="60秒速度 I + 60秒急迫 I + 30秒生命恢复"
  quote="超好吃的肉夹馍!!! 吃完整个锐界幻境都能变得超级好吃"
>
  <CraftingTable
    :ingredients="[
      {id:'bread'},
      {id:'cooked_porkchop'},
      {id:'lettuce'},
      {id:'pepper'}
    ]"
    :result="{id:'sauerkraut_meat_film'}"
  />
</FoodEntry>

## 热狗

<FoodEntry
  name="热狗"
  quality="fine"
  :hunger="9"
  :saturation="8.0"
  effect="20秒速度 I + 5秒急迫 I"
  quote="经典风味，简单直接的美味"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'bread'}, null],
      [{id:'cooked_porkchop'}, {id:'tomato'}, {id:'cooked_porkchop'}],
      [null, {id:'bread'}, null]
    ]"
    :result="{id:'hotdog'}"
  />
</FoodEntry>

## 汉堡

<FoodEntry
  name="汉堡"
  quality="rare"
  :hunger="16"
  :saturation="18.0"
  effect="5秒饱和 + 45秒生命恢复 + 30秒抗性提升 I"
  quote="锐界幻境星期四风味，比肯德基更健康！满配汉堡的力量"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'bread'}, null],
      [{id:'lettuce'}, {id:'cooked_beef'}, {id:'tomato'}],
      [null, {id:'cheese'}, null]
    ]"
    :result="{id:'hamburger'}"
  />
</FoodEntry>

## 披萨

<FoodEntry
  name="披萨"
  quality="fine"
  :hunger="12"
  :saturation="10.0"
  effect="食用后获得 15秒 速度 II（狐狸的灵动！）"
  quote="锐界幻境田园风味披萨，长得像狐狸耳朵，吃了会不会变成狐狸？"
>
  <CraftingTable
    shaped
    :grid="[
      [{id:'wheat'}, {id:'tomato'}, {id:'wheat'}],
      [{id:'cooked_porkchop'}, {id:'cheese'}, {id:'cooked_porkchop'}],
      [null, {id:'wheat'}, null]
    ]"
    :result="{id:'pizza'}"
  />
</FoodEntry>

## 墨西哥塔可

<FoodEntry
  name="墨西哥塔可"
  quality="fine"
  :hunger="8"
  :saturation="7.0"
  effect="食用后在周围生成 2只 僵尸！"
  quote="歪比歪比，歪比叭卜！吃完感觉周围有什么不对劲..."
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'corn'}, null],
      [{id:'lettuce'}, {id:'cooked_beef'}, {id:'tomato'}],
      [null, {id:'pepper'}, null]
    ]"
    :result="{id:'tacos'}"
  />
</FoodEntry>

## 寿司

<FoodEntry
  name="寿司"
  quality="fine"
  :hunger="8"
  :saturation="5.0"
  effect="食用后获得 20秒 海豚恩惠"
  quote="锐界幻境和风风味，大海被包裹在米饭里"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'cooked_salmon'}, null],
      [{id:'wheat'}, {id:'seagrass'}, {id:'wheat'}],
      [null, {id:'cooked_salmon'}, null]
    ]"
    :result="{id:'sushi', count:2}"
  />
</FoodEntry>

## 叫花鸡

<FoodEntry
  name="叫花鸡"
  quality="fine"
  :hunger="8"
  :saturation="8.0"
  effect="周围被动生物获得 30秒 生命恢复（香气四溢！）"
  quote="一只鲜嫩的鸡被散发清香的荷叶包裹，奇香无比"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {name:'泥土', texture:'/mc-textures/item/dirt.png'}, null],
      [{name:'荷叶', texture:'/mc-textures/item/lily_pad.png'}, {id:'cooked_chicken'}, {name:'荷叶', texture:'/mc-textures/item/lily_pad.png'}],
      [null, {name:'泥土', texture:'/mc-textures/item/dirt.png'}, null]
    ]"
    :result="{id:'beggars_style_chicken'}"
  />
</FoodEntry>

## 熔岩烤鸡

<FoodEntry
  name="熔岩烤鸡"
  quality="rare"
  :hunger="9"
  :saturation="14.0"
  effect="45秒抗火 + 30秒自发光 + 30秒熔岩行走"
  quote="火热的岩浆 美味的鸡肉 史蒂夫的熔岩烤鸡"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'blaze_powder'}, null],
      [{id:'magma_cream'}, {id:'cooked_chicken'}, {id:'magma_cream'}],
      [null, {id:'blaze_powder'}, null]
    ]"
    :result="{id:'lava_chicken'}"
  />
</FoodEntry>

## 炖鱼汤

<FoodEntry
  name="炖鱼汤"
  quality="fine"
  :hunger="10"
  :saturation="12.0"
  effect="食用后获得 60秒 海豚恩惠 + 10秒 生命恢复"
  quote="美味的鱼肉 健康的萝卜 狐狸的美味鱼汤"
>
  <CraftingTable
    :ingredients="[
      {id:'cooked_cod'},
      {id:'carrot'},
      {id:'potato'},
      {id:'bowl'}
    ]"
    :result="{id:'fish_soup'}"
  />
</FoodEntry>

## 牛肉炖

<FoodEntry
  name="牛肉炖"
  quality="rare"
  :hunger="12"
  :saturation="14.0"
  effect="3分钟温暖效果 + 45秒生命恢复 + 5秒饱和"
  quote="荤素搭配，健康美味。一碗下肚，雪山也不怕冷"
>
  <CraftingTable
    :ingredients="[
      {id:'cooked_beef'},
      {id:'carrot'},
      {id:'potato'},
      {id:'onion'},
      {id:'bowl'}
    ]"
    :result="{id:'beef_stew'}"
  />
</FoodEntry>


*本页为主菜肉食分类 · 设计与数值可能随游戏版本调整*
