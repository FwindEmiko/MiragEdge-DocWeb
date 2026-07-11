# <MapIcon name="cooking" :size="24" /> 特色食物

节日与特色食材，充满幻境风味的限定料理。这些食物或承载着节日的记忆，或是最基础的新鲜食材。

::: tip 分类说明
本页收录 2 种特色食物，包括端午节限定的粽子和作为多种甜品基础原料的草莓。
:::

---

## 粽子

<FoodEntry
  name="粽子"
  quality="common"
  :hunger="6"
  :saturation="4.0"
  effect="5秒跳跃提升 II + 8秒生命恢复"
  quote="锐界幻境黏糊糊端午风味，感觉像吃下了一整个端午"
>
  <CraftingTable
    shaped
    :grid="[
      [null, {id:'string'}, null],
      [{id:'wheat'}, {id:'sweet_berries'}, {id:'wheat'}],
      [null, {id:'seagrass'}, null]
    ]"
    :result="{id:'zongzi', count:2}"
  />
</FoodEntry>

---

## 草莓

<FoodEntry
  name="草莓"
  quality="common"
  :hunger="3"
  :saturation="1.0"
  effect="无特殊效果，但很好吃。作物种植获取，是制作多种甜品的基础原料"
  quote="新鲜采摘的草莓，酸甜可口。也是制作多种甜品的基础原料"
>
  <div class="strawberry-display">
    <McItem id="strawberry" size="lg" />
    <div class="strawberry-info">
      <span class="info-label">获取方式</span>
      <span class="info-value">作物种植（详见「更多种植」页面）</span>
    </div>
  </div>
</FoodEntry>

<style>
.strawberry-display {
  display: flex;
  align-items: center;
  gap: 12px;
}
.strawberry-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-text-2, rgba(255,255,255,0.5));
  background: rgba(255, 255, 255, 0.06);
  padding: 1px 6px;
  border-radius: 3px;
  align-self: flex-start;
}
.info-value {
  font-size: 13px;
  color: var(--vp-c-text-1, rgba(255,255,255,0.9));
}
</style>

---

## 页面导航

<div class="food-nav">
  <a href="/features/pastoral/food/eggs" class="nav-card nav-prev">
    <span class="nav-label">← 上一分类</span>
    <span class="nav-title">煎蛋系列</span>
  </a>
  <a href="/features/pastoral/food/reference" class="nav-card nav-next">
    <span class="nav-label">下一分类 →</span>
    <span class="nav-title">食物速查表</span>
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

*本页为特色食物分类 · 设计与数值可能随游戏版本调整*
