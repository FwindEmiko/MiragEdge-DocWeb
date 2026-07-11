# <MapIcon name="cooking" :size="24" /> 煎蛋系列

从普通鸡蛋到传说中的龙蛋，煎制后的蛋类料理品质跨度极大。越是稀有的蛋，煎出来的效果越强大。

::: tip 分类说明
本页收录 3 种煎蛋料理，品质从普通到传说，全部通过熔炉煎制而成。
:::

---

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

---

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

---

## 煎龙蛋

<FoodEntry
  name="煎龙蛋"
  quality="legendary"
  :hunger="2"
  :saturation="20.0"
  effect="近乎无敌：30分钟抗性提升 II + 30分钟生命恢复 I + 30分钟伤害吸收 V"
  quote="奢侈中的奢侈，真的可以吃得起吗...吃下去就是半个创造模式"
>
  <Furnace
    :input="{name:'龙蛋', texture:'/mc-textures/item/dragon_egg.png'}"
    :result="{id:'fried_dragon_egg'}"
    :fuel="{id:'coal'}"
  />
</FoodEntry>

---

## 页面导航

<div class="food-nav">
  <a href="/features/pastoral/food/desserts" class="nav-card nav-prev">
    <span class="nav-label">← 上一分类</span>
    <span class="nav-title">甜品</span>
  </a>
  <a href="/features/pastoral/food/special" class="nav-card nav-next">
    <span class="nav-label">下一分类 →</span>
    <span class="nav-title">特色食物</span>
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

*本页为煎蛋系列分类 · 设计与数值可能随游戏版本调整*
