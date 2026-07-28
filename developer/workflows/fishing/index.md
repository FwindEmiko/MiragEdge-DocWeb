---
title: "🎣 自定义钓鱼工作流 · AI Skills 文档"
description: "面向 AI 编码助手的 EvenMoreFish 自定义钓鱼体系完整开发指南，涵盖鱼类、钓竿、鱼饵、比赛、维度钓鱼联动 5 大模块的五步闭环工作流。"
outline: deep
head:
  - - meta
    - name: author
      content: "F.windEmiko（狐风轩汐）"
  - - meta
    - name: keywords
      content: "Minecraft, EvenMoreFish, 钓鱼系统, 自定义鱼类, 钓竿配置, 鱼饵配置, 钓鱼比赛, DimensionFishing, AI Skills"
---

# 🎣 自定义钓鱼工作流 · AI Skills 文档

## 概述

### 文档定位

本文档是一份**面向 AI 编码助手**（如 Claude Code、Trae、WorkBuddy、GitHub Copilot 等）的 EvenMoreFish 自定义钓鱼体系开发技能指南。其目的是将显性的配置经验固化为可移植、可复用的知识文档。

> 当然，给人类用于学习研究与参考也是可以的啦

任何不熟悉 EvenMoreFish 的 AI 在阅读本文档后，应能**独立完成以下任务**：

- 创建新的鱼种并按稀有度归类
- 配置自定义钓竿（含合成配方）
- 配置鱼饵及其稀有度权重修改
- 创建钓鱼比赛（含排名奖励系统）
- 联动 DimensionFishing 实现维度特定钓鱼

### 适用场景

- 为 EvenMoreFish 插件新增鱼种、稀有度、钓竿、鱼饵、比赛
- 通过 DimensionFishing（自研插件）实现跨维度钓鱼联动
- 将服务器的钓鱼内容开发流程标准化、文档化
- 对既有钓鱼配置进行增删改查

### 技术栈总览

| 层级 | 技术 | 用途 |
|:----|:-----|:-----|
| 服务端 | Leaf（Paper 分支） | Minecraft 服务端核心 |
| 插件 | EvenMoreFish（最新版） | 自定义钓鱼体系 |
| 插件 | DimensionFishing（自研，GitHub `FCelestial/DimensionFishing`） | 维度钓鱼检测（虚空/岩浆） |
| 插件 | Geyser-Spigot + custom-skulls.yml | 基岩版头颅兼容 |
| 数据包 | MC Data Pack | 可选：钓鱼战利品表联动 |

### 服务器环境约束

| 项目 | 值 |
|:----|:----|
| 配置目录 | `plugins/EvenMoreFish/` |
| 稀有度目录 | `plugins/EvenMoreFish/rarities/` |
| 钓竿目录 | `plugins/EvenMoreFish/rods/` |
| 鱼饵目录 | `plugins/EvenMoreFish/baits/` |
| 比赛目录 | `plugins/EvenMoreFish/competitions/` |
| 维度钓鱼检测 | DimensionFishing 插件通过 custom-model-data 识别 |
| 基岩版兼容 | Geyser-Spigot custom-skulls.yml 映射头颅 |

### 参考链接

> 以下为 EvenMoreFish 官方文档入口，编写配置时随时查阅：

- **EvenMoreFish Wiki**：[https://evenmorefish.github.io/EvenMoreFish/docs/intro](https://evenmorefish.github.io/EvenMoreFish/docs/intro)
- **物品配置**：[https://evenmorefish.github.io/EvenMoreFish/docs/configuration/items](https://evenmorefish.github.io/EvenMoreFish/docs/configuration/items)
- **比赛类型**：[https://evenmorefish.github.io/EvenMoreFish/docs/features/competitions/types](https://evenmorefish.github.io/EvenMoreFish/docs/features/competitions/types)
- **奖励类型**：[https://evenmorefish.github.io/EvenMoreFish/docs/configuration/reward-types](https://evenmorefish.github.io/EvenMoreFish/docs/configuration/reward-types)
- **条件要求**：[https://evenmorefish.github.io/EvenMoreFish/docs/features/requirements](https://evenmorefish.github.io/EvenMoreFish/docs/features/requirements)

## 前置知识

### EvenMoreFish 数据模型

```
稀有度（Rarity）
  ├── 是一个容器，包含多个鱼种
  ├── 定义基础尺寸范围、基础权重、价格倍率
  └── 每个稀有度一个 yml 文件
鱼类（Fish）
  ├── 必须归属于某个稀有度
  ├── 可以带条件（生物群系、天气、时间、世界）
  └── 可自定义物品显示（材质、名称、描述、发光、头颅）
钓竿（Rod）
  ├── 限制玩家能钓到的稀有度/鱼种
  ├── 可配置合成配方
  └── CMD 值被 DimensionFishing 用于检测钓鱼类型
鱼饵（Bait）
  ├── 修改特定稀有度/鱼种的权重
  ├── 支持 +N, -N, *N, /N 四种运算
  └── 可设置购买价格
比赛（Competition）
  ├── 按配置的时间表自动触发
  ├── 支持 8 种比赛类型
  └── 排名奖励（支持金钱、经验、物品、效果、消息、音效）
```

### 目录结构

```
EvenMoreFish/
├── config.yml               # 主配置
├── messages.yml             # 多语言消息
├── guis.yml                 # 界面配置
├── gui-fillers.yml          # 界面填充物
├── rarities/                # 稀有度 + 鱼种
│   ├── common.yml
│   ├── rare.yml
│   ├── epic.yml
│   ├── legendary.yml
│   └── junk.yml
├── rods/                    # 自定义鱼竿
│   └── *.yml
├── baits/                   # 鱼饵配置
│   └── *.yml
└── competitions/            # 比赛定义
    └── *.yml
```

> 每个文件夹内都有 `_example.yml` 提供完整字段参考，插件重载时会自动重置为最新格式。

### 维度钓鱼 CMD 对照

钓竿的 `custom-model-data` 被 DimensionFishing 用于检测钓鱼权限：

| CMD 值 | 虚空钓鱼 | 岩浆钓鱼 |
|:------|:--------|:--------|
| 203 | ✅ | ❌ |
| 204 | ❌ | ✅ |
| 205 | ✅ | ✅ |
| 其他 | ❌ | ❌ |

## 开发环境搭建

### 推荐工具

- **VSCode + Red Hat YAML**：语法验证和自动补全
- **EvenMoreFish Wiki**：配置字段速查 [https://evenmorefish.github.io/EvenMoreFish/docs/intro](https://evenmorefish.github.io/EvenMoreFish/docs/intro)

### 控制台命令速查

```bash
# 重载配置
/emf admin reload

# 列出所有鱼
/emf admin fish

# 列出所有稀有度
/emf admin rarity

# 测试给予钓竿
/emf admin rod give <player> <rod_id>

# 测试给予鱼饵
/emf admin bait give <player> <bait_id>

# 手动触发比赛
/emf admin competition start <comp_id>

# 强制结束比赛
/emf admin competition end
```

### 测试世界配置

- 创建超平坦创造世界
- 获得所有稀有度的测试鱼竿
- 站在水边测试钓鱼

## 核心工作流

> **核心方法论**：每个功能模块均遵循「**概念 → 设计 → 编写 → 验证 → 部署**」五步闭环。AI 应按此流程逐模块推进。

---

### 模块 1：鱼类配置

#### 概念

鱼是钓鱼的核心产出。每条鱼属于一个稀有度，可带环境条件。鱼类绑定在稀有度文件内，所有鱼都必须归属于某个稀有度。

#### 设计

确定以下要素：

- 鱼的 ID（英文字母 + 下划线）
- 归属稀有度
- 环境条件（生物群系、天气、时间、世界等）
- 自定义材质（原版物品、玩家头颅、自定义模型）
- 尺寸范围

#### 编写

##### 基础格式

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

##### 带条件的鱼（进阶格式）

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

##### 物品类型速查

| 字段 | 说明 | 示例 |
|:----|:-----|:-----|
| `material` | 单个原版物品 | `SALMON` |
| `materials` | 随机多选一 | `[TUBE_CORAL, BRAIN_CORAL]` |
| `head-64` | Base64 编码的玩家头颅 | 完整 180+ 字符 |
| `head-uuid` | 玩家 UUID 头颅 | `916b1144-...` |
| `multiple-head-64` | 多头颅随机 | 列表 |
| 不写 | 默认生鳕鱼 | — |

#### 验证

```bash
# 重载配置
/emf admin reload

# 使用对应钓竿测试钓鱼
# 检查是否钓到新增的鱼
```

#### 部署

yml 放入 `rarities/` → 执行 `/emf admin reload`

---

### 模块 2：钓竿配置

#### 概念

钓竿控制玩家能钓到哪些稀有度/鱼种的权限。钓竿的 `custom-model-data` 同时被 DimensionFishing 用于检测维度钓鱼类型。

#### 设计

确定以下要素：

- 钓竿 ID（英文蛇形）
- 允许的稀有度列表（权限控制）
- 合成配方（可选）
- CMD 值（如需维度钓鱼联动，参考前置知识中的 CMD 对照表）
- 物品外观（材质、名称、描述、发光）

#### 编写

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

##### 维度钓鱼检测 CMD 表

钓竿的 `custom-model-data` 被 DimensionFishing 用于检测钓鱼权限：

| CMD 值 | 虚空钓鱼 | 岩浆钓鱼 |
|:------|:--------|:--------|
| 203 | ✅ | ❌ |
| 204 | ❌ | ✅ |
| 205 | ✅ | ✅ |
| 其他 | ❌ | ❌ |

#### 验证

```bash
# 给予测试钓竿
/emf admin rod give @p my_rod

# 手持钓竿测试钓鱼，观察是否能钓到对应稀有度的鱼
```

#### 部署

yml 放入 `rods/` → 执行 `/emf admin reload`

---

### 模块 3：鱼饵配置

#### 概念

鱼饵可以修改鱼类的出现权重。附加到钓竿后，影响特定稀有度/鱼种的上钩概率。

#### 设计

确定以下要素：

- 鱼饵 ID
- 目标稀有度/鱼种
- 权重运算类型（`+N` / `-N` / `*N` / `/N`）
- 是否可购买（价格、数量、经济插件）
- 附加限制（最大数量、无限使用）

#### 编写

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

##### 权重运算说明

| 运算 | 效果 | 示例 |
|:----|:-----|:-----|
| `*2` | 权重翻倍 | 史诗鱼出现率翻倍 |
| `+50` | 权重加 50 | 传说鱼明显更容易出 |
| `*1.5` | 提升 50% | 适中加成 |
| `/2` | 减半 | 压低某种鱼的概率 |

#### 验证

```bash
# 给予测试鱼饵
/emf admin bait give @p my_bait

# 使用带鱼饵的钓竿测试，观察鱼种分布变化
```

#### 部署

yml 放入 `baits/` → 执行 `/emf admin reload`

---

### 模块 4：比赛配置

#### 概念

比赛按配置的时间表自动触发，支持多种类型和排名奖励。

#### 设计

确定以下要素：

- 比赛类型（8 种之一）
- 时间方案（每天固定时间 / 指定星期几）
- 最少在线人数
- 排名奖励（金钱、经验、物品、效果、消息、音效、血量）
- BossBar 显示

##### 价格公式

鱼价 = 鱼的长度 × 稀有度 worth-multiplier

| 稀有度 | 倍率 | 尺寸范围 | 均价 |
|:-----|:----:|:--------|:----:|
| 垃圾 | 0 | — | $0 |
| 普通 | 2.0 | 1~50cm | ~$51 |
| 稀有 | 1.5 | 20~100cm | ~$90 |
| 史诗 | 2.0 | 100~300cm | ~$400 |
| 传说 | 2.5 | 500~1500cm | ~$2,500 |

##### 比赛类型

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

#### 编写

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

##### 奖励类型速查

| 奖励 | 格式 | 示例 |
|:----|:-----|:-----|
| 金钱 | `MONEY:数量` | `MONEY:5000` |
| 经验 | `EXP:数量` | `EXP:5000` |
| 物品 | `ITEM:材质,数量` | `ITEM:DIAMOND,3` |
| 效果 | `EFFECT:名称,等级,秒` | `EFFECT:SPEED,2,30` |
| 消息 | `MESSAGE:<颜色>文本` | `MESSAGE:<green>恭喜！` |
| 音效 | `SOUND:名称,音量,音高` | `SOUND:ENTITY_FIREWORK_ROCKET_BLAST,1,1` |
| 血量 | `HEALTH:数值` | `HEALTH:10` |

#### 验证

```bash
# 手动触发比赛
/emf admin competition start my_competition

# 参与钓鱼，观察比赛排行榜和奖励发放
```

#### 部署

yml 放入 `competitions/` → 执行 `/emf admin reload`

---

### 模块 5：维度钓鱼联动

#### 概念

通过 DimensionFishing 插件（自研，GitHub `FCelestial/DimensionFishing`），EvenMoreFish 可支持虚空钓鱼（末地）和岩浆钓鱼（下界）。由钓竿的 `custom-model-data` 值决定钓鱼权限类型。

DimensionFishing 是独立插件，运行在服务端上，通过检测玩家手持钓竿的 CMD 值来判断该玩家在特定维度是否有权限进行特殊钓鱼（虚空/岩浆）。钓鱼权限由 CMD 值决定：

| CMD 值 | 虚空钓鱼 | 岩浆钓鱼 |
|:------|:--------|:--------|
| 203 | ✅ | ❌ |
| 204 | ❌ | ✅ |
| 205 | ✅ | ✅ |
| 其他 | ❌ | ❌ |

#### 设计

确定以下要素：

- 每个世界需要什么钓鱼类型（主世界 → 普通、下界 → 岩浆、末地 → 虚空）
- 分配对应钓竿的 CMD 值
- 维度与钓鱼类型的映射关系

#### 编写

##### 维度映射配置

```yaml
# DimensionFishing 插件配置（实际位于 DimensionFishing 插件目录下）
dimensions:
  world: NORMAL                    # 主世界：普通钓鱼
  world_nether: LAVA               # 下界：岩浆钓鱼
  world_the_end: VOID              # 末地：虚空钓鱼

# 钓竿 CMD 值决定权限（在模块 2 钓竿配置中定义）
# CMD 203 → 仅虚空
# CMD 204 → 仅岩浆
# CMD 205 → 虚空 + 岩浆
```

##### EvenMoreFish 钓竿端配置（联动）

在钓竿 yml 中分配对应的 CMD 值：

```yaml
# rods/void_rod.yml — 虚空钓鱼竿
id: void_rod
allowed-rarities:
  - Epic
  - Legendary
item:
  material: FISHING_ROD
  custom-model-data: 203          # ← DimensionFishing 识别为虚空钓鱼
  displayname: <dark_purple>虚空钓竿

# rods/lava_rod.yml — 岩浆钓鱼竿
id: lava_rod
allowed-rarities:
  - Epic
  - Legendary
item:
  material: FISHING_ROD
  custom-model-data: 204          # ← DimensionFishing 识别为岩浆钓鱼
  displayname: <red>熔岩钓竿

# rods/omni_rod.yml — 全维度钓竿
id: omni_rod
allowed-rarities:
  - Common
  - Rare
  - Epic
  - Legendary
item:
  material: FISHING_ROD
  custom-model-data: 205          # ← 虚空 + 岩浆通用
  displayname: <gold>万象钓竿
```

#### 验证

```bash
# 1. 确保 DimensionFishing 插件已加载
/plugins

# 2. 给予测试钓竿
/emf admin rod give @p void_rod
/emf admin rod give @p lava_rod
/emf admin rod give @p omni_rod

# 3. 维度验证
# 末地：手持 void_rod (CMD 203) → 可虚空钓鱼
# 下界：手持 lava_rod (CMD 204) → 可岩浆钓鱼
# 任意维度：手持 omni_rod (CMD 205) → 两种都可
# 主世界：任何钓竿 → 仅普通钓鱼

# 4. 确认岩浆钓鱼只在下界工作
# 5. 确认虚空钓鱼只在末地工作
```

#### 部署

1. DimensionFishing jar 放入 `plugins/` 目录 → 重启服务器
2. 钓竿 yml 放入 `plugins/EvenMoreFish/rods/` → 执行 `/emf admin reload`
3. 确认两个插件均正常加载，无报错

> ⚠️ DimensionFishing 是独立插件（GitHub `FCelestial/DimensionFishing`），与 EvenMoreFish 无直接依赖关系，仅通过 CMD 值进行联动识别。

## 使用流程

当 AI 处理钓鱼开发请求时，按以下流程执行：

```
第 1 步：阅读概述与前置知识
  → 确认 EMF 数据模型、目录结构、CMD 值

第 2 步：定位需求类型
  → 新增鱼 → 模块 1
  → 新增钓竿 → 模块 2
  → 新增鱼饵 → 模块 3
  → 新增比赛 → 模块 4
  → 新增维度钓鱼 → 模块 5

第 3 步：五步闭环执行
  → 概念理解 → 设计方案 → 编写代码 → 验证命令 → 部署说明

第 4 步：交付输出
  → 提供可直接复制的 yml 文件内容
  → 附带完整验证命令
  → 标注文件路径（如 # rods/my_rod.yml）
```

## 命名/路径/命令规范

| 项目 | 规范 | 示例 |
|:----|:-----|:-----|
| 稀有度 yml | 全小写 | `common.yml`, `epic.yml` |
| 鱼类 ID | 英文蛇形 | `atlantic_cod`, `lava_eel` |
| 钓竿 ID | 英文蛇形 | `beginner_rod`, `lava_rod` |
| 鱼饵 ID | 英文蛇形 | `spicy_bait`, `magic_bait` |
| 比赛 ID | 英文蛇形 | `daily_fishing`, `weekend_special` |
| fish 子键 | 首字母大写 | `Cod`, `Atlantic_Cod` |
| 重载命令 | `/emf admin reload` | — |
| 配置文件路径 | `plugins/EvenMoreFish/<type>/<id>.yml` | `plugins/EvenMoreFish/rods/my_rod.yml` |

## 未覆盖问题的处理策略

当遇到本文档未覆盖的问题时，AI 应：

1. **查阅官方 Wiki**：优先访问 [EvenMoreFish Wiki](https://evenmorefish.github.io/EvenMoreFish/docs/intro)，涵盖物品、条件、奖励等完整参考
2. **参考 `_example.yml`**：每个文件夹内都有 `_example.yml` 提供完整字段参考和说明注释
3. **检视服内配置**：`plugins/EvenMoreFish/` 下的实际 yml 是最可靠的参考
4. **增量验证**：每完成一个配置后立即 `/emf admin reload` 测试，不要等全部写完再验证
5. **保守提示**：对文档未明确覆盖的功能（如钓鱼售卖系统、数据库存储等），向用户说明不确定性并给出最佳实践建议

## 输出格式与交付标准

AI 的输出应满足：

1. **可操作**：每个 yml 代码块可直接复制使用，占位符需明确标注
2. **完整**：包含文件路径注释（如 `# rods/my_rod.yml`）
3. **可验证**：每个模块附带验证命令（`/emf admin` 系列）
4. **有上下文**：说明文件之间的依赖关系（如钓竿 CMD 与 DimensionFishing 的联动）
5. **区分原始/CMD**：标注哪些鱼用原版物品材质，哪些用头颅（`head-64` / `head-uuid`）

## 参考资源

### 官方文档

- [EvenMoreFish Wiki](https://evenmorefish.github.io/EvenMoreFish/docs/intro) — 官方完整文档
- [物品配置参考](https://evenmorefish.github.io/EvenMoreFish/docs/configuration/items)
- [比赛类型参考](https://evenmorefish.github.io/EvenMoreFish/docs/features/competitions/types)
- [奖励类型参考](https://evenmorefish.github.io/EvenMoreFish/docs/configuration/reward-types)
- [条件要求参考](https://evenmorefish.github.io/EvenMoreFish/docs/features/requirements)

### 代码仓库

- [EvenMoreFish GitHub](https://github.com/EvenMoreFish/EvenMoreFish) — 插件源码
- [DimensionFishing（自研）](https://github.com/FCelestial/DimensionFishing) — 维度钓鱼检测插件

### 服内参考

- `plugins/EvenMoreFish/` 下所有 yml — 生产环境实际配置
- `plugins/EvenMoreFish/*/_example.yml` — 完整字段参考模板

> **文档维护**：本文档由 F.windEmiko（狐风轩汐）编写，服务于 MiragEdge 锐界幻境服务器。版本随 EvenMoreFish 和 DimensionFishing 插件版本更新。如有疑问或建议，请联系开发团队。
