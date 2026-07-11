# <MapIcon name="cooking" :size="24" /> 糖果零食

甜蜜小巧的零食，各有奇效。从简单的糖果到危险的火药饼干，总有一款适合你。

::: tip 分类说明
本页收录 10 种糖果零食，以普通品质为主，部分带有实用的探索或战斗 buff。
:::

---

## 棉花糖

<FoodEntry
  name="棉花糖"
  quality="fine"
  :hunger="6"
  :saturation="4.0"
  effect="食用后获得 45秒 缓降"
  quote="锐界幻境的云是它组成的？吃下后会变得身轻如燕"
>
  <CraftingTable
    shaped
    :grid="[
      [{id:'sugar'}, {id:'string'}, {id:'sugar'}],
      [{id:'sugar'}, {id:'stick'}, {id:'sugar'}],
      [{id:'sugar'}, {id:'string'}, {id:'sugar'}]
    ]"
    :result="{id:'candy_floss'}"
  />
</FoodEntry>

---

## 棒棒糖

<FoodEntry
  name="棒棒糖"
  quality="fine"
  :hunger="8"
  :saturation="5.0"
  effect="食用后获得 45秒 抗性提升 I"
  quote="小时候总会含在嘴里慢慢融化细细品味，仿佛整个世界都是甜的"
>
  <CraftingTable
    shaped
    :grid="[
      [{id:'sugar'}, {id:'strawberry'}, {id:'sugar'}],
      [{id:'sugar'}, {id:'stick'}, {id:'sugar'}],
      [{id:'sugar'}, {id:'sugar'}, {id:'sugar'}]
    ]"
    :result="{id:'lollipop'}"
  />
</FoodEntry>

---

## 爆米花

<FoodEntry
  name="爆米花"
  quality="common"
  :hunger="7"
  :saturation="14.0"
  effect="无特殊效果"
  quote="金灿灿的像金子一样！闻起来像，吃起来也像！"
>
  <Furnace
    :input="{name:'玉米', texture:'/mc-textures/item/melon_seeds.png'}"
    :result="{id:'popcorn', count:3}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>

---

## 胡萝卜糖果

<FoodEntry
  name="胡萝卜糖果"
  quality="common"
  :hunger="4"
  :saturation="1.5"
  effect="食用后获得 5秒 速度 I"
  quote="兔兔最爱的糖果！咬一口嘎嘣脆胡萝卜味"
>
  <CraftingTable
    :ingredients="[
      {id:'carrot'},
      {id:'sugar'}
    ]"
    :result="{id:'carrot_candy', count:2}"
  />
</FoodEntry>

---

## 马铃薯糖果

<FoodEntry
  name="马铃薯糖果"
  quality="common"
  :hunger="3"
  :saturation="1.0"
  effect="无特殊效果"
  quote="马铃薯味的糖果...好吧其实挺特别的"
>
  <CraftingTable
    :ingredients="[
      {id:'potato'},
      {id:'sugar'}
    ]"
    :result="{id:'potato_candy', count:2}"
  />
</FoodEntry>

---

## 青草糖果

<FoodEntry
  name="青草糖果"
  quality="common"
  :hunger="3"
  :saturation="1.5"
  effect="附近被动生物获得 10秒 生命恢复"
  quote="干草糖，清新自然风"
>
  <CraftingTable
    :ingredients="[
      {id:'wheat'},
      {id:'sugar'}
    ]"
    :result="{id:'grass_candy', count:2}"
  />
</FoodEntry>

---

## 绯红糖果

<FoodEntry
  name="绯红糖果"
  quality="common"
  :hunger="3"
  :saturation="1.5"
  effect="食用后获得 15秒 抗火"
  quote="下界风味糖果，吃下去全身暖洋洋的"
>
  <CraftingTable
    :ingredients="[
      {name:'绯红菌', texture:'/mc-textures/item/nether_wart.png'},
      {id:'sugar'}
    ]"
    :result="{id:'crimson_candy', count:2}"
  />
</FoodEntry>

---

## 诡异糖果

<FoodEntry
  name="诡异糖果"
  quality="common"
  :hunger="3"
  :saturation="1.5"
  effect="附近疣猪兽获得 30秒 虚弱 II"
  quote="不！好！吃！但疣猪兽更不喜欢这个味道"
>
  <CraftingTable
    :ingredients="[
      {name:'诡异菌', texture:'/mc-textures/item/warped_fungus_on_a_stick.png'},
      {id:'sugar'}
    ]"
    :result="{id:'warped_candy', count:2}"
  />
</FoodEntry>

---

## 紫颂果糖果

<FoodEntry
  name="紫颂果糖果"
  quality="common"
  :hunger="5"
  :saturation="1.0"
  effect="食用后随机传送（保留了紫颂果的本性）"
  quote="保留了一部分原有的味道，是故意的"
>
  <CraftingTable
    :ingredients="[
      {id:'chorus_fruit'},
      {id:'sugar'}
    ]"
    :result="{id:'chorus_candy', count:2}"
  />
</FoodEntry>

---

## 苦力怕夹心饼干

<FoodEntry
  name="苦力怕夹心饼干"
  quality="fine"
  :hunger="8"
  :saturation="3.0"
  effect="食用后触发小型爆炸（不破坏方块！仅视觉效果 + 少量伤害）"
  quote="浓浓的火药味...等等这真的能吃吗？！"
>
  <CraftingTable
    shaped
    :grid="[
      [{id:'wheat'}, {id:'gunpowder'}, {id:'wheat'}],
      [{id:'wheat'}, {id:'sugar'}, {id:'wheat'}],
      [{id:'wheat'}, {id:'gunpowder'}, {id:'wheat'}]
    ]"
    :result="{id:'creeper_cookie'}"
  />
</FoodEntry>

---

## 页面导航

<div class="food-nav">
  <a href="/features/pastoral/food/breakfast" class="nav-card nav-prev">
    <span class="nav-label">← 上一分类</span>
    <span class="nav-title">早餐简餐</span>
  </a>
  <a href="/features/pastoral/food/salads" class="nav-card nav-next">
    <span class="nav-label">下一分类 →</span>
    <span class="nav-title">沙拉凉菜</span>
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

*本页为糖果零食分类 · 设计与数值可能随游戏版本调整*
