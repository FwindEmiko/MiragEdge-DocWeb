---
title: 钓鱼系统配置
description: 锐界幻境服务器钓鱼系统配置教程：基于 EvenMoreFish 插件实现自定义钓鱼体系，涵盖新增鱼类、钓竿、鱼饵、比赛的完整配置方法。
head:
  - - meta
    - name: keywords
      content: 锐界幻境钓鱼配置, EvenMoreFish 配置, 钓鱼插件, 鱼类配置, 钓竿配置, 鱼饵配置
---

# 钓鱼系统配置

服务器使用 **EvenMoreFish** 插件实现自定义钓鱼体系。本页涵盖新增鱼类、钓竿、鱼饵、比赛的完整配置方法。

::: tip 官方文档
- **EvenMoreFish Wiki**：<https://evenmorefish.github.io/EvenMoreFish/docs/intro>
- **物品配置**：<https://evenmorefish.github.io/EvenMoreFish/docs/configuration/items>
- **比赛类型**：<https://evenmorefish.github.io/EvenMoreFish/docs/features/competitions/types>
- **奖励类型**：<https://evenmorefish.github.io/EvenMoreFish/docs/configuration/reward-types>
- **条件要求**：<https://evenmorefish.github.io/EvenMoreFish/docs/features/requirements>
:::

## 目录结构

```
EvenMoreFish/
├── config.yml ················ 主配置
├── messages.yml ·············· 多语言消息
├── guis.yml ·················· 界面配置
├── gui-fillers.yml ··········· 界面填充物
├── rarities/ ················· 稀有度 + 鱼种定义
│   ├── common.yml
│   ├── rare.yml
│   ├── epic.yml
│   ├── legendary.yml
│   └── junk.yml
├── rods/ ····················· 自定义鱼竿
│   └── *.yml
├── baits/ ···················· 鱼饵配置
│   └── *.yml
└── competitions/ ············· 比赛定义
    └── *.yml
```

> 每个文件夹内都有 `_example.yml` 提供完整字段参考，插件重载时会自动重置为最新格式。

## 新增鱼类

鱼类绑定在稀有度文件内。所有鱼都必须归属于某个稀有度。

### 基础格式

```yaml
# rarities/common.yml 内
fish:
  Cod: []                          # 最简单的鱼，使用默认材质(生鳕鱼)
  MyFish:                          # 带自定义物品的鱼
    item:
      material: SALMON             # 或 head-64 / head-uuid / materials 列表
      displayname: <gold>自定义名称
      glowing: true
      lore:
        - '<gray>一条描述'
```

### 带条件的鱼

```yaml
fish:
  Atlantic_Cod:
    requirements:
      biome:                       # 限定生物群系
        - COLD_OCEAN
        - OCEAN
      weather: DOWNFALL            # 下雨/下雪时
      ingame-time: 6000-18000      # 限定游戏时间(tick)
      world: world_nether          # 限定世界
      fishing-type: Lava           # 限定钓鱼类型(需DimensionFishing)
      permission: emf.fish.vip     # 需要权限
    effect: POISON:1:2             # 钓到时给效果(名称:等级:秒)
    message: <yellow>*特殊消息*
    health: -1                     # 钓到时扣血
    size:
      minSize: 10                  # 覆盖稀有度尺寸范围
      maxSize: 50
```

### 物品类型

| 字段 | 说明 | 示例 |
|:----|:-----|:-----|
| `material` | 单个原版物品 | `SALMON` |
| `materials` | 随机多选一 | `[TUBE_CORAL, BRAIN_CORAL]` |
| `head-64` | Base64 编码的玩家头颅 | 完整 180+ 字符 |
| `head-uuid` | 玩家 UUID 头颅 | `916b1144-...` |
| `multiple-head-64` | 多头颅随机 | 列表 |
| 不写 | 默认生鳕鱼 | — |

### 重载生效

```bash
/emf admin reload
```

## 新增钓竿

钓竿控制玩家能钓到哪些稀有度/鱼种的权限。

```yaml
# rods/my_rod.yml
id: my_rod                       # 唯一ID(英文)
disabled: false
allowed-rarities:                # 允许的稀有度
  - Common
  - Rare
# allowed-fish:                  # 可选：进一步限定具体鱼种
#   Common:
#     - Cod                       # 只允许Common里的Cod
item:
  material: FISHING_ROD           # 必须是FISHING_ROD
  custom-model-data: 206          # 自定义模型数据(可选)
  displayname: <gold>我的钓竿
  glowing: true
  lore:
    - '<gray>可钓：普通 / 稀有'
recipe:                           # 合成配方(可选,不用则删除整段)
  type: shaped                    # shaped=固定排列 / shapeless=无序
  shape:
    - 'aaa'
    - 'dfd'
    - 'aaa'
  ingredients:
    a: air
    d: diamond
    f: fishing_rod
```

### 维度钓鱼检测

钓竿的 `custom-model-data` 被 DimensionFishing 用于检测钓鱼权限：

| CMD 值 | 虚空钓鱼 | 岩浆钓鱼 |
|:------|:--------|:--------|
| 203 | ✅ | ❌ |
| 204 | ❌ | ✅ |
| 205 | ✅ | ✅ |
| 其他 | ❌ | ❌ |

## 新增鱼饵

鱼饵可以修改鱼类的出现权重。支持四种运算：`+N` `-N` `*N` `/N`。

```yaml
# baits/my_bait.yml
id: my_bait                       # 唯一ID(英文)
disabled: false
item:
  material: NAUTILUS_SHELL        # 材质
  displayname: <gold>我的鱼饵
  glowing: true
  lore:
    - '<gray>提升史诗鱼的出现率'

rarity-modifiers:                 # 修改整稀有度权重
  Epic: "+50"                     # 史诗鱼权重+50
  Legendary: "*2"                 # 传说鱼翻倍

# fish-modifiers:                 # 或只修改特定鱼
#   Common:
#     Carp: "*2"
#     Bluefish: "*2"

catch-weight: 50                  # 钓到该鱼饵的概率
application-weight: 100           # 多饵时被消耗的概率
max-baits: 64                     # 一根竿最多附多少个此饵
infinite: false                   # 无限使用(极其稀有)

purchase:                         # 商店出售(删除整段则不可购买)
  price: 500
  quantity: 8
  economy-types:
    - Vault
```

### 权重运算说明

| 运算 | 效果 | 示例 |
|:----|:-----|:-----|
| `*2` | 权重翻倍 | 史诗鱼出现率翻倍 |
| `+50` | 权重加50 | 传说鱼明显更容易出 |
| `*1.5` | 提升 50% | 适中加成 |
| `/2` | 减半 | 压低某种鱼的概率 |

## 新增比赛

比赛按配置的时间表自动触发，支持多种类型。

```yaml
# competitions/my_comp.yml
id: my_competition                # 唯一ID(英文)
disabled: false
type: LARGEST_FISH                # 比赛类型
duration: 15                      # 持续时间(分钟)
minimum-players: 3                # 最少在线人数

# 时间方案A：每天固定时间
times:
  - 08:00
  - 20:00
# 时间方案B：指定星期几的时间(与times二选一)
# days:
#   Saturday:
#     - 09:00
#     - 15:00
# blacklisted-days:               # 排除的日期(与days二选一)
#   - Sunday

bossbar-colour: GREEN             # BossBar颜色
bossbar-prefix: '<bold>钓鱼大赛:'

alerts:                           # 剩余时间提醒
  - 10:00                         # 10分钟前
  - 5:00                          # 5分钟前
  - 1:00                          # 1分钟前

rewards:
  '1':                            # 第一名
    - MONEY:5000
    - EXP:5000
    - ITEM:DIAMOND,3
    - MESSAGE:<green>恭喜第一名！
  '2':                            # 第二名
    - MONEY:2500
    - EXP:2500
  '3':                            # 第三名
    - MONEY:1000
  '4':                            # 支持任意多名
    - MONEY:500
  participation:                  # 参与奖
    - MONEY:50
```

### 比赛类型

| 类型 | 说明 |
|:----|:-----|
| `LARGEST_FISH` | 比最大单条鱼 |
| `MOST_FISH` | 比钓鱼数量 |
| `LARGEST_TOTAL` | 比累计尺寸 |
| `SHORTEST_FISH` | 比最短单条鱼 |
| `SHORTEST_TOTAL` | 比累计最短 |
| `SPECIFIC_FISH` | 随机指定一种鱼 |
| `SPECIFIC_RARITY` | 随机指定一种稀有度 |
| `RANDOM` | 从 random-selection 中随机选 |

### 奖励类型速查

| 奖励 | 格式 | 示例 |
|:----|:-----|:-----|
| 金钱 | `MONEY:数量` | `MONEY:5000` |
| 经验 | `EXP:数量` | `EXP:5000` |
| 物品 | `ITEM:材质,数量` | `ITEM:DIAMOND,3` |
| 效果 | `EFFECT:名称,等级,秒` | `EFFECT:SPEED,2,30` |
| 消息 | `MESSAGE:<颜色>文本` | `MESSAGE:<green>恭喜！` |
| 音效 | `SOUND:名称,音量,音高` | `SOUND:ENTITY_FIREWORK_ROCKET_BLAST,1,1` |
| 血量 | `HEALTH:数值` | `HEALTH:10` |

### 价格公式

鱼价 = 鱼的长度 × 稀有度 worth-multiplier

| 稀有度 | 倍率 | 尺寸范围 | 均价 |
|:-----|:----:|:--------|:----:|
| 垃圾 | 0 | — | $0 |
| 普通 | 2.0 | 1~50cm | ~$51 |
| 稀有 | 1.5 | 20~100cm | ~$90 |
| 史诗 | 2.0 | 100~300cm | ~$400 |
| 传说 | 2.5 | 500~1500cm | ~$2,500 |
