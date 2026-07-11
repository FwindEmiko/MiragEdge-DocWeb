# <MapIcon name="cooking" :size="24" /> 主菜肉食

硬核的战斗补给，高饱食、强力 buff。从大火腿到牛肉炖，每一道都是冒险者的能量源泉。

::: tip 分类说明
本页收录 11 种主菜肉食，以稀有和精良品质为主，提供力量、饱和、抗火、暴击等核心战斗 buff。
:::

---

## 大火腿

<FoodEntry
  name="大火腿"
  quality="rare"
  :hunger="10"
  :saturation="15.0"
  effect="25秒力量 II + 20秒生命恢复 + 40秒暴击伤害 +100%"
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

---

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
      {name:'生菜', texture:'/mc-textures/item/beetroot_seeds.png'},
      {name:'辣椒', texture:'/mc-textures/item/red_dye.png'}
    ]"
    :result="{id:'sauerkraut_meat_film'}"
  />
</FoodEntry>

---

## 热狗

<FoodEntry
  name="热狗"
  quality="fine"
  :hunger="9"
  :saturation="14.0"
  effect="15秒速度 I + 10秒生命恢复"
  quote="经典风味，简单直接的美味"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'bread'}, null],
      [{id:'cooked_porkchop'}, {name:'番茄', texture:'/mc-textures/item/apple.png'}, {id:'cooked_porkchop'}],
      [null, {id:'bread'}, null]
    ]"
    :result="{id:'hotdog'}"
  />
</FoodEntry>

---

## 汉堡

<FoodEntry
  name="汉堡"
  quality="rare"
  :hunger="16"
  :saturation="18.0"
  effect="20秒饱和 + 45秒生命恢复 + 30秒抗性提升 I"
  quote="锐界幻境星期四风味，比肯德基更健康！满配汉堡的力量"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'bread'}, null],
      [{name:'生菜', texture:'/mc-textures/item/beetroot_seeds.png'}, {id:'cooked_beef'}, {name:'番茄', texture:'/mc-textures/item/apple.png'}],
      [null, {id:'cheese'}, null]
    ]"
    :result="{id:'hamburger'}"
  />
</FoodEntry>

---

## 披萨

<FoodEntry
  name="披萨"
  quality="fine"
  :hunger="12"
  :saturation="14.0"
  effect="食用后获得 45秒 生命恢复"
  quote="锐界幻境田园风味披萨，长得像狐狸耳朵，吃了会不会变成狐狸？"
>
  <CraftingTable
    shaped
    :grid="[
      [{id:'wheat'}, {name:'番茄', texture:'/mc-textures/item/apple.png'}, {id:'wheat'}],
      [{id:'cooked_porkchop'}, {id:'cheese'}, {id:'cooked_porkchop'}],
      [null, {id:'wheat'}, null]
    ]"
    :result="{id:'pizza'}"
  />
</FoodEntry>

---

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
      [null, {name:'玉米', texture:'/mc-textures/item/melon_seeds.png'}, null],
      [{name:'生菜', texture:'/mc-textures/item/beetroot_seeds.png'}, {id:'cooked_beef'}, {name:'番茄', texture:'/mc-textures/item/apple.png'}],
      [null, {name:'辣椒', texture:'/mc-textures/item/red_dye.png'}, null]
    ]"
    :result="{id:'tacos'}"
  />
</FoodEntry>

---

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

---

## 叫花鸡

<FoodEntry
  name="叫花鸡"
  quality="fine"
  :hunger="8"
  :saturation="14.0"
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

---

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

---

## 炖鱼汤

<FoodEntry
  name="炖鱼汤"
  quality="fine"
  :hunger="10"
  :saturation="12.0"
  effect="食用后获得 45秒 生命恢复"
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

---

## 牛肉炖

<FoodEntry
  name="牛肉炖"
  quality="rare"
  :hunger="14"
  :saturation="24.0"
  effect="3分钟温暖效果 + 45秒生命恢复 + 30秒饱和"
  quote="荤素搭配，健康美味。一碗下肚，雪山也不怕冷"
>
  <CraftingTable
    :ingredients="[
      {id:'cooked_beef'},
      {id:'carrot'},
      {id:'potato'},
      {name:'洋葱', texture:'/mc-textures/item/beetroot.png'},
      {id:'bowl'}
    ]"
    :result="{id:'beef_stew'}"
  />
</FoodEntry>

---

## 页面导航

<div class="food-nav">
  <a href="/features/pastoral/food/bakery" class="nav-card nav-prev">
    <span class="nav-label">← 上一分类</span>
    <span class="nav-title">烘焙糕点</span>
  </a>
  <a href="/features/pastoral/food/drinks" class="nav-card nav-next">
    <span class="nav-label">下一分类 →</span>
    <span class="nav-title">饮品</span>
  </a>
</div>

<style>
.food-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 24px 0;
}
.nav-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.03);
  text-decoration: none;
  transition: all 0.2s ease;
}
.nav-card:hover {
  border-color: rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.06);
  transform: translateY(-1px);
}
.nav-next { text-align: right; }
.nav-label {
  font-size: 12px;
  color: var(--vp-c-text-2, rgba(255,255,255,0.5));
}
.nav-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1, rgba(255,255,255,0.9));
}
@media (max-width: 640px) {
  .food-nav { grid-template-columns: 1fr; }
}
</style>

---

*本页为主菜肉食分类 · 设计与数值可能随游戏版本调整*
