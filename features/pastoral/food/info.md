# <MapIcon name="cooking" :size="24" /> 更多食物拓展

<MapIcon name="sparkles" :size="16" /> **基于 CustomCrops 作物系统全面重制**

锐界幻境的田园生活产出了丰富的农作物，这些新鲜的食材可以加工成 **57种特色食物**。每道食物都有独特的合成配方和食用效果。

::: tip 🌾 食材来源
所有农作物的种子都可以在游戏内获取，种植系统详见「[更多种植](/features/pastoral/croups/info)」页面。
:::

---

## 食物品质分级

| 等级 | 标识 | 特点 | 代表食物 |
|------|------|------|----------|
| ⭐ 普通 | 白色名称 | 基础饱食，无特殊效果 | 煎蛋、吐司 |
| ⭐⭐ 精良 | 绿色名称 | 有实用 buff 效果 | 草莓甜筒、热狗 |
| ⭐⭐⭐ 稀有 | 蓝色名称 | 强力战斗 buff | 大火腿、牛肉炖 |
| ⭐⭐⭐⭐ 传说 | 金色名称 | 终极增益，材料稀有 | 七彩蛋羹、煎龙蛋 |

---

## 🥐 早餐简餐

### 培根

<CraftingTable
  :ingredients="[
    {id:'cooked_porkchop'},
    {name:'杀猪刀', texture:'/mc-textures/item/iron_sword.png'}
  ]"
  :result="{id:'bacon', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 5 | 7.2 | ⭐ 普通 |

**效果**: 无特殊效果，纯粹的美味

> 「treetree的炸培根，焦香酥脆，是冒险前的最佳能量补给」

---

### 煎蛋

<Furnace
  :input="{id:'egg'}"
  :result="{id:'fried_egg'}"
  :fuel="{id:'coal'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 4 | 3.0 | ⭐ 普通 |

**效果**: 无特殊效果

> 「早餐的灵魂伴侣」

---

### 吐司

<Furnace
  :input="{id:'bread'}"
  :result="{id:'toast'}"
  :fuel="{id:'coal'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 7 | 8.0 | ⭐ 普通 |

**效果**: 食用后获得 10秒 生命恢复

> 「锐界幻境早餐风味，搭配培根煎蛋食用更佳」

---

### 雷霆大面包

<CraftingTable
  :ingredients="[
    {id:'bread'}, {id:'bread'}, {id:'bread'},
    {name:'锻造锤', texture:'/mc-textures/item/iron_ingot.png'}
  ]"
  :result="{id:'double_bread'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 10 | 12.0 | ⭐⭐ 精良 |

**效果**: 食用后获得 5秒 饱和

> 「三层面包锻造而成，雷霆之力蕴藏其中」

---

### 奶酪

<CraftingTable
  :ingredients="[
    {id:'milk_bucket'},
    {id:'sugar'}
  ]"
  :result="{id:'cheese'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 4 | 5.0 | ⭐ 普通 |

**效果**: 无特殊效果

> 「没错，杰瑞最喜欢这个了」

---

### 烤南瓜

<Furnace
  :input="{name:'南瓜', texture:'/mc-textures/item/pumpkin_pie.png'}"
  :result="{id:'roasted_pumpkin'}"
  :fuel="{id:'coal'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 10 | 6.0 | ⭐ 普通 |

**效果**: 食用后获得 20秒 生命恢复

> 「锐界幻境烧烤风味，自然的香甜」

---

## 🍬 糖果零食

### 棉花糖

<CraftingTable
  shaped
  :grid="[
    [{id:'sugar'}, {id:'string'}, {id:'sugar'}],
    [{id:'sugar'}, {id:'stick'}, {id:'sugar'}],
    [{id:'sugar'}, {id:'string'}, {id:'sugar'}]
  ]"
  :result="{id:'candy_floss'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 6 | 4.0 | ⭐⭐ 精良 |

**🕊️ 效果**: 食用后获得 45秒 缓降

> 「锐界幻境的云是它组成的？吃下后会变得身轻如燕」

---

### 棒棒糖

<CraftingTable
  shaped
  :grid="[
    [{id:'sugar'}, {id:'strawberry'}, {id:'sugar'}],
    [{id:'sugar'}, {id:'stick'}, {id:'sugar'}],
    [{id:'sugar'}, {id:'sugar'}, {id:'sugar'}]
  ]"
  :result="{id:'lollipop'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 8 | 5.0 | ⭐⭐ 精良 |

**🛡️ 效果**: 食用后获得 45秒 抗性提升 I

> 「小时候总会含在嘴里慢慢融化细细品味，仿佛整个世界都是甜的」

---

### 爆米花

<Furnace
  :input="{name:'玉米', texture:'/mc-textures/item/melon_seeds.png'}"
  :result="{id:'popcorn', count:3}"
  :fuel="{id:'coal'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 7 | 14.0 | ⭐ 普通 |

**效果**: 无特殊效果

> 「金灿灿的像金子一样！闻起来像，吃起来也像！」

---

### 胡萝卜糖果

<CraftingTable
  :ingredients="[
    {id:'carrot'},
    {id:'sugar'}
  ]"
  :result="{id:'carrot_candy', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 4 | 1.5 | ⭐ 普通 |

**🐰 效果**: 食用后获得 5秒 速度 I

> 「兔兔最爱的糖果！咬一口嘎嘣脆胡萝卜味」

---

### 马铃薯糖果

<CraftingTable
  :ingredients="[
    {id:'potato'},
    {id:'sugar'}
  ]"
  :result="{id:'potato_candy', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 3 | 1.0 | ⭐ 普通 |

**效果**: 无特殊效果

> 「马铃薯味的糖果...好吧其实挺特别的」

---

### 青草糖果

<CraftingTable
  :ingredients="[
    {id:'wheat'},
    {id:'sugar'}
  ]"
  :result="{id:'grass_candy', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 3 | 1.5 | ⭐ 普通 |

**🐄 效果**: 附近被动生物获得 10秒 生命恢复

> 「干草糖，清新自然风」

---

### 绯红糖果

<CraftingTable
  :ingredients="[
    {name:'绯红菌', texture:'/mc-textures/item/nether_wart.png'},
    {id:'sugar'}
  ]"
  :result="{id:'crimson_candy', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 3 | 1.5 | ⭐ 普通 |

**🔥 效果**: 食用后获得 15秒 抗火

> 「下界风味糖果，吃下去全身暖洋洋的」

---

### 诡异糖果

<CraftingTable
  :ingredients="[
    {name:'诡异菌', texture:'/mc-textures/item/warped_fungus_on_a_stick.png'},
    {id:'sugar'}
  ]"
  :result="{id:'warped_candy', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 3 | 1.5 | ⭐ 普通 |

**👹 效果**: 附近疣猪兽获得 30秒 虚弱 II

> 「不！好！吃！但疣猪兽更不喜欢这个味道」

---

### 紫颂果糖果

<CraftingTable
  :ingredients="[
    {id:'chorus_fruit'},
    {id:'sugar'}
  ]"
  :result="{id:'chorus_candy', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 5 | 1.0 | ⭐ 普通 |

**🌀 效果**: 食用后随机传送（保留了紫颂果的本性）

> 「保留了一部分原有的味道，是故意的」

---

### 苦力怕夹心饼干

<CraftingTable
  shaped
  :grid="[
    [{id:'wheat'}, {id:'gunpowder'}, {id:'wheat'}],
    [{id:'wheat'}, {id:'sugar'}, {id:'wheat'}],
    [{id:'wheat'}, {id:'gunpowder'}, {id:'wheat'}]
  ]"
  :result="{id:'creeper_cookie'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 8 | 3.0 | ⭐⭐ 精良 |

**💥 效果**: 食用后触发小型爆炸（不破坏方块！仅视觉效果 + 少量伤害）

> 「浓浓的火药味...等等这真的能吃吗？！」

---

## 🥗 沙拉凉菜

### 蒲公英沙拉

<CraftingTable
  :ingredients="[
    {name:'蒲公英', texture:'/mc-textures/item/dandelion.png'},
    {name:'生菜', texture:'/mc-textures/item/beetroot_seeds.png'},
    {name:'番茄', texture:'/mc-textures/item/apple.png'},
    {id:'bowl'}
  ]"
  :result="{id:'dandelion_salad'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 6 | 7.0 | ⭐⭐ 精良 |

**💊 效果**: 5秒反胃 → 5秒生命恢复 II → 40秒抗性提升 I（先苦后甜）

> 「虽然入口苦涩，但蒲公英确实能治愈一些疾病...先苦后甜」

---

### 浆果沙拉

<CraftingTable
  :ingredients="[
    {id:'sweet_berries'}, {id:'sweet_berries'},
    {id:'glow_berries'},
    {id:'bowl'}
  ]"
  :result="{id:'berry_salad'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 7 | 8.0 | ⭐⭐ 精良 |

**🦊 效果**: 30秒生命恢复 + 30秒内背刺伤害 +50%

> 「幻境森林中的特产，狐狸好像挺喜欢吃的嘛？」

---

### 海草沙拉

<CraftingTable
  :ingredients="[
    {id:'seagrass'}, {id:'seagrass'},
    {name:'生菜', texture:'/mc-textures/item/beetroot_seeds.png'},
    {id:'bowl'}
  ]"
  :result="{id:'seagrass_salad'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 6 | 7.0 | ⭐ 普通 |

**🌊 效果**: 食用后获得 30秒 海豚恩惠

> 「好吧，看起来只是一堆草...但是意外地清爽可口」

---

### 洞穴杂拌

<CraftingTable
  :ingredients="[
    {id:'glow_berries'},
    {name:'棕色蘑菇', texture:'/mc-textures/item/brown_mushroom.png'},
    {name:'红色蘑菇', texture:'/mc-textures/item/red_mushroom.png'},
    {id:'bowl'}
  ]"
  :result="{id:'cave_medley'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 6 | 7.0 | ⭐⭐ 精良 |

**🔦 效果**: 食用后获得 60秒 夜视 + 45秒 急迫 I

> 「幻境洞穴风味，吃下去仿佛黑暗中的明灯」

---

### 海洋杂拌

<CraftingTable
  :ingredients="[
    {id:'seagrass'},
    {id:'cod'},
    {id:'prismarine_shard'},
    {id:'bowl'}
  ]"
  :result="{id:'ocean_medley'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 6 | 7.0 | ⭐⭐ 精良 |

**🌊 效果**: 60秒潮涌能量 + 45秒海豚恩惠

> 「看起来很健康，其实...真的很健康！海洋的精华尽在其中」

---

### 幽寂杂拌

<CraftingTable
  :ingredients="[
    {name:'回响碎片', texture:'/mc-textures/item/echo_shard.png'},
    {name:'幽匿催生体', texture:'/mc-textures/item/sculk_catalyst.png'},
    {id:'bowl'}
  ]"
  :result="{id:'sculk_medley'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 14 | 18.0 | ⭐⭐⭐ 稀有 |

**🖤 效果**: 15秒饱和 + 8秒反胃 + 30秒夜视

> 「锐界幻境幽匿风味，虽然不好吃但就是忍不住想尝...」

---

### 豆腐

<CraftingTable
  :ingredients="[
    {name:'绿豆', texture:'/mc-textures/item/melon_seeds.png'},
    {name:'绿豆', texture:'/mc-textures/item/melon_seeds.png'},
    {name:'绿豆', texture:'/mc-textures/item/melon_seeds.png'},
    {id:'bowl'}
  ]"
  :result="{id:'tofu', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 3 | 2.0 | ⭐ 普通 |

**效果**: 无特殊效果

> 「锐界幻境的豆腐...白白嫩嫩的」

---

### 臭豆腐

<CraftingTable
  :ingredients="[
    {id:'tofu'},
    {id:'fermented_spider_eye'}
  ]"
  :result="{id:'stinky_tofu'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 6 | 4.0 | ⭐⭐ 精良 |

**💨 效果**: 周围实体获得 10秒虚弱 + 10秒缓慢 + 5秒反胃

> 「好臭！！虽然吃着香，但请不要在公共场合食用！」

---

### 草莓酱

<CraftingTable
  :ingredients="[
    {id:'strawberry'}, {id:'strawberry'},
    {id:'sugar'},
    {id:'glass_bottle'}
  ]"
  :result="{id:'strawberry_jam'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 6 | 3.0 | ⭐ 普通 |

**🍓 效果**: 食用后获得 10秒 速度 I

> 「新鲜的锐界幻境草莓熬制，甜到心里去」

---

### 仙人掌切块

<CraftingTable
  :ingredients="[
    {name:'仙人掌', texture:'/mc-textures/item/cactus.png'},
    {name:'杀猪刀', texture:'/mc-textures/item/iron_sword.png'}
  ]"
  :result="{id:'cut_cactus', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 5 | 3.0 | ⭐ 普通 |

**🐪 效果**: 5秒反胃 + 周围骆驼获得 20秒生命恢复

> 「锐界幻境沙漠风味，对人类来说有点扎嘴...但骆驼很爱」

---

## 🥧 烘焙糕点

### 派

<CraftingTable
  shaped
  :grid="[
    [{id:'wheat'}, {id:'egg'}, {id:'wheat'}],
    [{id:'sugar'}, {id:'sweet_berries'}, {id:'sugar'}],
    [null, {id:'wheat'}, null]
  ]"
  :result="{id:'pie'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 9 | 6.0 | ⭐ 普通 |

**效果**: 无特殊效果

> 「蛋糕的青春版，一个人也能享受的完美甜点」

---

### 草莓甜甜圈

<CraftingTable
  shaped
  :grid="[
    [null, {id:'wheat'}, null],
    [{id:'sugar'}, {id:'egg'}, {id:'sugar'}],
    [null, {id:'strawberry'}, null]
  ]"
  :result="{id:'strawberry_donuts', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 6 | 5.0 | ⭐⭐ 精良 |

**💕 效果**: 8秒生命恢复 + 5秒反胃（太甜了！）

> 「香香软软的，但是一口吃掉好像太腻了...」

---

### 奶油纸杯蛋糕

<CraftingTable
  shaped
  :grid="[
    [null, {id:'wheat'}, null],
    [{id:'sugar'}, {id:'egg'}, {id:'sugar'}],
    [null, {id:'milk_bucket'}, null]
  ]"
  :result="{id:'cream_cupcakes', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 9 | 10.0 | ⭐⭐ 精良 |

**🍰 效果**: 20秒饱和 + 45秒抗性提升 I + 60秒移动速度 +15%

> 「小时候挺爱吃的...长大后好像只能在锐界幻境吃到了，一口回到童年」

---

### 甜浆果纸杯蛋糕

<CraftingTable
  shaped
  :grid="[
    [null, {id:'wheat'}, null],
    [{id:'sugar'}, {id:'egg'}, {id:'sugar'}],
    [null, {id:'sweet_berries'}, null]
  ]"
  :result="{id:'sweet_berries_cupcake', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 5 | 5.0 | ⭐ 普通 |

**🛡️ 效果**: 食用后获得 8秒 抗性提升 I

> 「锐界幻境童年风味，小小的纸杯里装着大大的幸福」

---

### 发光浆果纸杯蛋糕

<CraftingTable
  shaped
  :grid="[
    [null, {id:'wheat'}, null],
    [{id:'sugar'}, {id:'egg'}, {id:'sugar'}],
    [null, {id:'glow_berries'}, null]
  ]"
  :result="{id:'glow_berries_cupcake', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 5 | 5.0 | ⭐ 普通 |

**✨ 效果**: 8秒抗性提升 I + 15秒自发光

> 「发光的纸杯蛋糕！晚上都不用带火把了（虽然只有一会儿）」

---

## 🍖 主菜肉食

### 大火腿

<CraftingTable
  shaped
  :grid="[
    [{id:'cooked_porkchop'}, {id:'cooked_porkchop'}, {id:'cooked_porkchop'}],
    [{id:'cooked_porkchop'}, {id:'bone_meal'}, {id:'cooked_porkchop'}],
    [{id:'cooked_porkchop'}, {id:'cooked_porkchop'}, {id:'cooked_porkchop'}]
  ]"
  :result="{id:'big_ham'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 10 | 15.0 | ⭐⭐⭐ 稀有 |

**⚔️ 效果**: 25秒力量 II + 20秒生命恢复 + 40秒暴击伤害 +100%

> 「看起来好像一把棒槌...打人很痛的样子，吃下去战斗力爆表」

---

### 肉夹馍

<CraftingTable
  :ingredients="[
    {id:'bread'},
    {id:'cooked_porkchop'},
    {name:'生菜', texture:'/mc-textures/item/beetroot_seeds.png'},
    {name:'辣椒', texture:'/mc-textures/item/red_dye.png'}
  ]"
  :result="{id:'sauerkraut_meat_film'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 8 | 4.0 | ⭐⭐⭐ 稀有 |

**🏃 效果**: 60秒速度 I + 60秒急迫 I + 30秒生命恢复

> 「超好吃的肉夹馍!!! 吃完整个锐界幻境都能变得超级好吃」

---

### 热狗

<CraftingTable
  shaped
  :grid="[
    [null, {id:'bread'}, null],
    [{id:'cooked_porkchop'}, {name:'番茄', texture:'/mc-textures/item/apple.png'}, {id:'cooked_porkchop'}],
    [null, {id:'bread'}, null]
  ]"
  :result="{id:'hotdog'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 9 | 14.0 | ⭐⭐ 精良 |

**🌭 效果**: 15秒速度 I + 10秒生命恢复

> 「经典风味，简单直接的美味」

---

### 汉堡

<CraftingTable
  shaped
  :grid="[
    [null, {id:'bread'}, null],
    [{name:'生菜', texture:'/mc-textures/item/beetroot_seeds.png'}, {id:'cooked_beef'}, {name:'番茄', texture:'/mc-textures/item/apple.png'}],
    [null, {id:'cheese'}, null]
  ]"
  :result="{id:'hamburger'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 16 | 18.0 | ⭐⭐⭐ 稀有 |

**🍔 效果**: 20秒饱和 + 45秒生命恢复 + 30秒抗性提升 I

> 「锐界幻境星期四风味，比肯德基更健康！满配汉堡的力量」

---

### 披萨

<CraftingTable
  shaped
  :grid="[
    [{id:'wheat'}, {name:'番茄', texture:'/mc-textures/item/apple.png'}, {id:'wheat'}],
    [{id:'cooked_porkchop'}, {id:'cheese'}, {id:'cooked_porkchop'}],
    [null, {id:'wheat'}, null]
  ]"
  :result="{id:'pizza'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 12 | 14.0 | ⭐⭐ 精良 |

**🦊 效果**: 食用后获得 45秒 生命恢复

> 「锐界幻境田园风味披萨，长得像狐狸耳朵，吃了会不会变成狐狸？」

---

### 墨西哥塔可

<CraftingTable
  shaped
  :grid="[
    [null, {name:'玉米', texture:'/mc-textures/item/melon_seeds.png'}, null],
    [{name:'生菜', texture:'/mc-textures/item/beetroot_seeds.png'}, {id:'cooked_beef'}, {name:'番茄', texture:'/mc-textures/item/apple.png'}],
    [null, {name:'辣椒', texture:'/mc-textures/item/red_dye.png'}, null]
  ]"
  :result="{id:'tacos'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 8 | 7.0 | ⭐⭐ 精良 |

**🧟 效果**: 食用后在周围生成 2只 僵尸！

> 「歪比歪比，歪比叭卜！吃完感觉周围有什么不对劲...」

---

### 寿司

<CraftingTable
  shaped
  :grid="[
    [null, {id:'cooked_salmon'}, null],
    [{id:'wheat'}, {id:'seagrass'}, {id:'wheat'}],
    [null, {id:'cooked_salmon'}, null]
  ]"
  :result="{id:'sushi', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 8 | 5.0 | ⭐⭐ 精良 |

**🍣 效果**: 食用后获得 20秒 海豚恩惠

> 「锐界幻境和风风味，大海被包裹在米饭里」

---

### 叫花鸡

<CraftingTable
  shaped
  :grid="[
    [null, {name:'泥土', texture:'/mc-textures/item/dirt.png'}, null],
    [{name:'荷叶', texture:'/mc-textures/item/lily_pad.png'}, {id:'cooked_chicken'}, {name:'荷叶', texture:'/mc-textures/item/lily_pad.png'}],
    [null, {name:'泥土', texture:'/mc-textures/item/dirt.png'}, null]
  ]"
  :result="{id:'beggars_style_chicken'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 8 | 14.0 | ⭐⭐ 精良 |

**🐔 效果**: 周围被动生物获得 30秒 生命恢复（香气四溢！）

> 「一只鲜嫩的鸡被散发清香的荷叶包裹，奇香无比」

---

### 熔岩烤鸡

<CraftingTable
  shaped
  :grid="[
    [null, {id:'blaze_powder'}, null],
    [{id:'magma_cream'}, {id:'cooked_chicken'}, {id:'magma_cream'}],
    [null, {id:'blaze_powder'}, null]
  ]"
  :result="{id:'lava_chicken'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 9 | 14.0 | ⭐⭐⭐ 稀有 |

**🔥 效果**: 45秒抗火 + 30秒自发光 + 30秒熔岩行走

> 「火热的岩浆🔥美味的鸡肉🤤史蒂夫的熔岩烤鸡😍」

---

### 炖鱼汤

<CraftingTable
  :ingredients="[
    {id:'cooked_cod'},
    {id:'carrot'},
    {id:'potato'},
    {id:'bowl'}
  ]"
  :result="{id:'fish_soup'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 10 | 12.0 | ⭐⭐ 精良 |

**🍲 效果**: 食用后获得 45秒 生命恢复

> 「美味的鱼肉❤️健康的萝卜😍狐狸的美味鱼汤🤤」

---

### 牛肉炖

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

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 14 | 24.0 | ⭐⭐⭐ 稀有 |

**🔥 效果**: 3分钟温暖效果 + 45秒生命恢复 + 30秒饱和

> 「荤素搭配，健康美味。一碗下肚，雪山也不怕冷」

---

## 🥤 饮品

### 啤酒

<CraftingTable
  :ingredients="[
    {name:'啤酒花', texture:'/mc-textures/item/wheat_seeds.png'},
    {name:'啤酒花', texture:'/mc-textures/item/wheat_seeds.png'},
    {id:'wheat'},
    {id:'glass_bottle'}
  ]"
  :result="{id:'beer'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 2 | 4.0 | ⭐⭐ 精良 |

**🍺 效果**: 10秒饱和 + 5秒失明 + 5秒反胃 + 5秒力量 II

::: warning ⚠️ 饮酒警告
60秒内饮用超过3次 → 物品栏随机打乱！
:::

> 「小麦果汁！有很强的饱腹感，但喝多会醉...注意适量！」

---

### 珍珠奶茶

<CraftingTable
  :ingredients="[
    {id:'milk_bucket'},
    {id:'sugar'},
    {name:'红薯', texture:'/mc-textures/item/potato.png'},
    {id:'glass_bottle'}
  ]"
  :result="{id:'bubble_tea'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 2 | 4.0 | ⭐⭐ 精良 |

**🧋 效果**: 8秒生命恢复 + 随机小范围传送

> 「这珍珠...怪怪的？喝起来有种不真实的感觉...」

---

### 汽水四兄弟

<div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:12px 0">
  <McItem id="coca_cola" /><span>可口可乐</span>
  <McItem id="pepsi_cola" /><span>百事可乐</span>
  <McItem id="sprite" /><span>雪碧</span>
  <McItem id="fanta" /><span>芬达</span>
</div>

| 属性 | 可口可乐 | 百事可乐 | 雪碧 | 芬达 |
|------|----------|----------|------|------|
| 饥饿值 | 5 | 5 | 5 | 5 |
| 饱和度 | 4.0 | 4.0 | 4.0 | 4.0 |
| 获取方式 | 特殊渠道 | 特殊渠道 | 特殊渠道 | 特殊渠道 |
| 效果 | 15秒速度 I | 15秒跳跃 I | 15秒缓降 | 15秒抗火 |

> 「锐界幻境特供汽水系列，活动/任务获取」

---

## 🍦 甜品

### 草莓甜筒

<CraftingTable
  shaped
  :grid="[
    [null, {id:'sugar'}, null],
    [{id:'milk_bucket'}, {id:'strawberry'}, {id:'snowball'}],
    [null, {id:'sugar'}, null]
  ]"
  :result="{id:'strawberry_ice_cream'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 8 | 6.0 | ⭐⭐ 精良 |

**🔥 效果**: 食用后获得 30秒 抗火

> 「冰冰凉凉香香甜甜的冰淇淋！吃下去火热的心都降温了」

---

### 草莓巧克力冰淇淋

<CraftingTable
  shaped
  :grid="[
    [null, {id:'sugar'}, null],
    [{id:'cocoa_beans'}, {id:'strawberry'}, {id:'milk_bucket'}],
    [null, {id:'snowball'}, null]
  ]"
  :result="{id:'strawberry_chocolate_ice_cream'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 9 | 7.0 | ⭐⭐ 精良 |

**❄️ 效果**: 20秒速度 II + 对周围生物施加 15秒缓慢（寒气四溢！）

> 「香香脆脆冰冰凉凉的巧克力草莓味！！你感到周围都凉快了起来」

---

### 蜂蜜陶罐

<CraftingTable
  shaped
  :grid="[
    [{id:'honey_bottle'}, {id:'honey_bottle'}, {id:'honey_bottle'}],
    [{id:'honey_bottle'}, {id:'clay_ball'}, {id:'honey_bottle'}],
    [{id:'honey_bottle'}, {id:'honey_bottle'}, {id:'honey_bottle'}]
  ]"
  :result="{id:'honey_clay_pots'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 20 | 14.0 | ⭐⭐⭐ 稀有 |

**🍯 效果**: 45秒生命恢复 II + 2分钟急迫 I + 20秒失明（太甜了！）

> 「满满当当的蜂蜜，和腐竹一样甜美诱人，但吃多会得"糖尿病"」

---

### 七彩蛋羹

<CraftingTable
  :ingredients="[
    {name:'龙蛋', texture:'/mc-textures/item/dragon_egg.png'},
    {id:'egg'}, {id:'egg'}, {id:'egg'}, {id:'egg'},
    {id:'sugar'},
    {id:'bowl'}
  ]"
  :result="{id:'colorful_egg_custard'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 4 | 20.0 | ⭐⭐⭐⭐ 传说 |

**🌈 终极战斗料理**：10分钟抗性提升 V + 5分钟速度 II + 5分钟生命恢复 II + 10分钟生命提升 V

> 「这...未免太奢侈了些？龙蛋做的蛋羹，吃下去你就是幻境最强战士」

---

## 🥚 煎蛋系列

### 煎海龟蛋

<Furnace
  :input="{id:'turtle_egg'}"
  :result="{id:'fried_turtle_egg'}"
  :fuel="{id:'coal'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 3 | 2.0 | ⭐ 普通 |

**🐢 效果**: 食用后获得 10秒 缓慢

> 「好吃但是不建议吃，这...毕竟是一颗未来的小海龟」

---

### 煎嗅探兽蛋

<Furnace
  :input="{id:'sniffer_egg'}"
  :result="{id:'fried_sniffer_egg'}"
  :fuel="{id:'coal'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 7 | 4.0 | ⭐⭐⭐ 稀有 |

**🕰️ 效果**: 45秒生命恢复 + 2分钟抗性提升 I

> 「来自远古的味道...唇齿留香，蕴含远古生命之力」

---

### 煎龙蛋

<Furnace
  :input="{name:'龙蛋', texture:'/mc-textures/item/dragon_egg.png'}"
  :result="{id:'fried_dragon_egg'}"
  :fuel="{id:'coal'}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 2 | 20.0 | ⭐⭐⭐⭐ 传说 |

**🐉 近乎无敌**：30分钟抗性提升 II + 30分钟生命恢复 I + 30分钟伤害吸收 V

> 「奢侈中的奢侈，真的可以吃得起吗...吃下去就是半个创造模式」

---

## 🎋 特色食物

### 粽子

<CraftingTable
  shaped
  :grid="[
    [null, {id:'string'}, null],
    [{id:'wheat'}, {id:'sweet_berries'}, {id:'wheat'}],
    [null, {id:'seagrass'}, null]
  ]"
  :result="{id:'zongzi', count:2}"
/>

| 饥饿值 | 饱和度 | 品质 |
|--------|--------|------|
| 6 | 4.0 | ⭐ 普通 |

**🐉 效果**: 5秒跳跃提升 II + 8秒生命恢复

> 「锐界幻境黏糊糊端午风味，感觉像吃下了一整个端午」

---

### 草莓

<McItem id="strawberry" size="lg" />

| 饥饿值 | 饱和度 | 品质 | 获取 |
|--------|--------|------|------|
| 3 | 1.0 | ⭐ 普通 | 作物种植 |

**效果**: 无特殊效果，但很好吃

> 「新鲜采摘的草莓，酸甜可口。也是制作多种甜品的基础原料」

---

## 📊 食物速查表

| 食物 | 饥饿值 | 饱和度 | 品质 | 核心效果 |
|------|--------|--------|------|----------|
| 培根 | 5 | 7.2 | ⭐ | - |
| 煎蛋 | 4 | 3.0 | ⭐ | - |
| 吐司 | 7 | 8.0 | ⭐ | 10s 生命恢复 |
| 雷霆大面包 | 10 | 12.0 | ⭐⭐ | 5s 饱和 |
| 奶酪 | 4 | 5.0 | ⭐ | - |
| 烤南瓜 | 10 | 6.0 | ⭐ | 20s 生命恢复 |
| 棉花糖 | 6 | 4.0 | ⭐⭐ | 45s 缓降 |
| 棒棒糖 | 8 | 5.0 | ⭐⭐ | 45s 抗性提升 I |
| 爆米花 | 7 | 14.0 | ⭐ | - |
| 胡萝卜糖果 | 4 | 1.5 | ⭐ | 5s 速度 I |
| 马铃薯糖果 | 3 | 1.0 | ⭐ | - |
| 青草糖果 | 3 | 1.5 | ⭐ | 动物回复 |
| 绯红糖果 | 3 | 1.5 | ⭐ | 15s 抗火 |
| 诡异糖果 | 3 | 1.5 | ⭐ | 疣猪兽虚弱 II |
| 紫颂果糖果 | 5 | 1.0 | ⭐ | 随机传送 |
| 苦力怕饼干 | 8 | 3.0 | ⭐⭐ | 小型爆炸 |
| 蒲公英沙拉 | 6 | 7.0 | ⭐⭐ | 先苦后甜 |
| 浆果沙拉 | 7 | 8.0 | ⭐⭐ | 背刺 +50% |
| 海草沙拉 | 6 | 7.0 | ⭐ | 30s 海豚恩惠 |
| 洞穴杂拌 | 6 | 7.0 | ⭐⭐ | 夜视+急迫 |
| 海洋杂拌 | 6 | 7.0 | ⭐⭐ | 潮涌+海豚 |
| 幽寂杂拌 | 14 | 18.0 | ⭐⭐⭐ | 饱和+夜视 |
| 豆腐 | 3 | 2.0 | ⭐ | - |
| 臭豆腐 | 6 | 4.0 | ⭐⭐ | 范围负面 |
| 草莓酱 | 6 | 3.0 | ⭐ | 10s 速度 I |
| 仙人掌切块 | 5 | 3.0 | ⭐ | 骆驼回复 |
| 派 | 9 | 6.0 | ⭐ | - |
| 草莓甜甜圈 | 6 | 5.0 | ⭐⭐ | 回复+反胃 |
| 奶油纸杯蛋糕 | 9 | 10.0 | ⭐⭐ | 饱和+抗性+加速 |
| 甜浆果纸杯蛋糕 | 5 | 5.0 | ⭐ | 8s 抗性提升 |
| 发光浆果纸杯蛋糕 | 5 | 5.0 | ⭐ | 抗性+自发光 |
| 大火腿 | 10 | 15.0 | ⭐⭐⭐ | 力量II+暴击 |
| 肉夹馍 | 8 | 4.0 | ⭐⭐⭐ | 速度+急迫+回复 |
| 热狗 | 9 | 14.0 | ⭐⭐ | 速度+回复 |
| 汉堡 | 16 | 18.0 | ⭐⭐⭐ | 饱和+回复+抗性 |
| 披萨 | 12 | 14.0 | ⭐⭐ | 45s 生命恢复 |
| 墨西哥塔可 | 8 | 7.0 | ⭐⭐ | 生成僵尸 |
| 寿司 | 8 | 5.0 | ⭐⭐ | 20s 海豚恩惠 |
| 叫花鸡 | 8 | 14.0 | ⭐⭐ | 动物回复 |
| 熔岩烤鸡 | 9 | 14.0 | ⭐⭐⭐ | 抗火+发光+熔岩行 |
| 炖鱼汤 | 10 | 12.0 | ⭐⭐ | 45s 生命恢复 |
| 牛肉炖 | 14 | 24.0 | ⭐⭐⭐ | 温暖+回复+饱和 |
| 啤酒 | 2 | 4.0 | ⭐⭐ | 饱和+醉了⚠ |
| 珍珠奶茶 | 2 | 4.0 | ⭐⭐ | 回复+传送 |
| 可口可乐 | 5 | 4.0 | ⭐ | 15s 速度 I |
| 百事可乐 | 5 | 4.0 | ⭐ | 15s 跳跃 I |
| 雪碧 | 5 | 4.0 | ⭐ | 15s 缓降 |
| 芬达 | 5 | 4.0 | ⭐ | 15s 抗火 |
| 草莓甜筒 | 8 | 6.0 | ⭐⭐ | 30s 抗火 |
| 草莓巧克力冰淇淋 | 9 | 7.0 | ⭐⭐ | 速度II+寒气 |
| 蜂蜜陶罐 | 20 | 14.0 | ⭐⭐⭐ | 回复II+急迫+失明 |
| 七彩蛋羹 | 4 | 20.0 | ⭐⭐⭐⭐ | 全属性暴涨 |
| 煎海龟蛋 | 3 | 2.0 | ⭐ | 10s 缓慢 |
| 煎嗅探兽蛋 | 7 | 4.0 | ⭐⭐⭐ | 回复+抗性 |
| 煎龙蛋 | 2 | 20.0 | ⭐⭐⭐⭐ | 近乎无敌 |
| 粽子 | 6 | 4.0 | ⭐ | 跳跃+回复 |
| 草莓 | 3 | 1.0 | ⭐ | - |

---

## 🛠️ 技术说明

<MapIcon name="info" :size="20" /> 食物特殊效果通过 **FwindEmiCore** 物品功能核心 + **CustomCrops** 自定义词条联合实现：

- **基础属性**（饥饿值/饱和度）：由 CustomCrops 的 `food` 配置段控制
- **特殊效果**（药水效果/命令执行）：由 FwindEmiCore 监听 `consume` 事件触发
- **合成配方**：由 CustomCrops/Minecraft 配方系统共同管理
- **饮品杯具回收**：饮用后自动返还空瓶/空桶（`consume-replacement` 机制）

---

*本页面为锐界幻境食物系统完整参考 · 设计与数值可能随游戏版本调整*
