---
title: "MC 数据包客制化工作流 · AI Skills 文档"
description: "面向 AI 编码助手的 Minecraft 数据包 + CraftEngine 协同开发完整指南，覆盖 Functions、Loot Tables、Recipes、生物掉落、自定义装备、结构关联 6 大模块的五步闭环工作流。"
outline: deep
head:
  - - meta
    - name: author
      content: "F.windEmiko（狐风轩汐）"
  - - meta
    - name: keywords
      content: "Minecraft, 数据包, datapack, CraftEngine, AI Skills, mcfunction, loot table, recipe"
---

# MC 数据包客制化工作流 · AI Skills 文档

## 概述

### 文档定位

本文档是一份**面向 AI 编码助手**（如 Claude Code、Trae、WorkBuddy、GitHub Copilot 等）的 Minecraft（我的世界）数据包（Data Pack） + CraftEngine 协同开发技能指南。其目的是将隐性的开发经验固化为可移植、可复用的显性知识文档。

> 当然，给人类用于学习研究与参考也是可以的啦  

任何不熟悉 MC 数据包的 AI 在阅读本文档后，应能**独立完成以下任务**：

- 创建符合规范的数据包项目结构
- 编写 mcfunction 函数文件
- 配置战利品表（Loot Table）并绑定到生物/方块
- 编写原版配方（Recipe）与 CraftEngine 自定义配方
- 通过 CraftEngine 定义自定义物品/方块并关联资源包
- 导出结构模板（.nbt）并注册到世界生成

### 适用场景

- 为 Minecraft 服务器（Paper/Leaf 及其分支）开发定制数据包
- 通过 CraftEngine 插件（社区版）创建自定义物品、方块、配方
- 数据包与 CraftEngine 混合架构下的协同开发
- 将服务器内容开发流程标准化、文档化

### 技术栈总览

| 层级 | 技术 | 用途 |
|------|------|------|
| 服务端 | Leaf（Paper 分支） | Minecraft 服务端核心 |
| 插件 | CraftEngine v26.7（社区版） | 自定义物品/方块/配方/家具 |
| 数据包 | MC Data Pack（pack_format 101） | Function/Loot Table/Recipe/Structure/Tag |
| 世界生成 | 数据包 worldgen + Iris/Terra | 维度/生物群系/地形 |
| 开发工具 | VSCode + Spyglass (DHP) | IDE 智能提示与验证 |
| 在线工具 | Misode / MCStacker | 可视化生成器 |

### 服务器环境约束

本文档所有内容基于以下真实服务器环境：

| 项目 | 值 |
|------|-----|
| 服务端 | Leaf（Paper 分支） |
| MC 版本 | 26.1.2（Java Edition） |
| pack_format | **101**（数据包）/ **84**（资源包） |
| CraftEngine | 社区版 v26.7 |
| 命名空间 | `miragedge` |
| 数据包目录 | `world/datapacks/` |
| CE 配置目录 | `plugins/CraftEngine/resources/` |

::: warning pack_format 以实际为准
pack_format 随游戏版本变化。本文编写时 MC 26.1.2 对应 **pack_format 101**（数据包版本）。
若服务器版本不同，请查阅 [pack_format 对照表](#pack_format-对照表) 或访问 [misode.github.io/versions](https://misode.github.io/versions) 获取最新值。
:::

## 前置知识

### 命名空间（Namespace）

命名空间是数据包中隔离内容的核心机制。所有数据包内容（物品、方块、函数、战利品表等）都由 `命名空间:路径` 格式的 ID 唯一标识。

```
miragedge:my_sword     # miragedge 命名空间下的 my_sword
minecraft:stick        # 原版命名空间下的 stick
```

**关键规则**：

- 命名空间仅允许小写字母、数字、下划线和连字符（`a-z`、`0-9`、`_`、`-`）
- 不同数据包可以定义相同命名空间；加载顺序决定优先级（先加载的包优先级低）
- 本项目的命名空间统一使用 **`miragedge`**
- CraftEngine 物品 ID 格式为 `namespace:id`，如 `miragedge:ruby_sword`

### pack_format

`pack_format` 是 `pack.mcmeta` 中的版本号，告知 Minecraft 该数据包兼容的游戏版本。**版本不匹配将导致警告，但不阻止加载**。

在 MC 1.21.9+ 版本中，`pack_format` 已被弃用，改用 `min_format` / `max_format` 范围格式。本文档目标版本为 26.1.2，推荐同时支持新旧格式。

```json
{
  "pack": {
    "description": "MiragEdge Custom Data Pack",
    "pack_format": 101,
    "min_format": 101,
    "max_format": [101, 1]
  }
}
```

> 速查链接：[Pack version - Minecraft Wiki](https://minecraft.wiki/w/Pack_version)

### JSON 基础

数据包中绝大多数配置文件使用 JSON 格式。AI 辅助开发时需注意：

- **严格语法**：不支持尾逗号（trailing comma）、不支持注释（`//` 或 `/* */`）
- **键名区分大小写**：`Name` 与 `name` 是不同的键
- **嵌套结构**：深度嵌套常见，建议使用 Misode 生成器减少手写错误

### mcfunction 语法

mcfunction 文件是 `.mcfunction` 扩展名的纯文本文件，每行一条 Minecraft 命令，以 `#` 开头表示注释。

```mcfunction
# 这是一个注释
say Hello, World!
give @a minecraft:diamond 1
execute as @a run say I am a player!
```

**关键语法元素**：

| 元素 | 说明 | 示例 |
|------|------|------|
| `@p` | 最近玩家 | `give @p diamond 1` |
| `@a` | 所有玩家 | `say @a Hello` |
| `@s` | 当前执行实体 | `execute as @p run say @s` |
| `@e` | 所有实体 | `kill @e[type=creeper]` |
| `@r` | 随机玩家 | `give @r emerald 1` |

> 速查链接：[Minecraft 命令参考](https://minecraft.wiki/w/Commands)

## 开发环境搭建

### 1. VSCode 扩展

推荐使用 **Spyglass**（前身为 Datapack Helper Plus，简称 DHP），这是目前最成熟的 MC 数据包开发扩展。

**安装方式**：

- 在 VSCode 扩展市场搜索 `SPGoding.datapack-language-server`
- 或按 `Ctrl+P` 输入 `ext install SPGoding.datapack-language-server`

**核心功能**：

- JSON 文件（进度/配方/战利品表/谓词/标签）的实时验证与自动补全
- mcfunction 文件（.mcfunction）的语法高亮、命令补全
- 跨文件的命名空间 ID 跳转（Ctrl+Click）
- 引用查找（Shift+F12）

**工作区配置**：将数据包根文件夹（包含 `pack.mcmeta` 和 `data/` 的目录）作为 VSCode 工作区根目录以获得最佳体验。

**版本覆盖**：如果需要为目标版本与实际不同的数据包提供智能提示，在工作区根目录创建 `spyglass.json`：

```json
{
  "env": {
    "gameVersion": "26.1.2"
  }
}
```

### 2. 在线工具

#### Misode Data Pack Generators

网址：[https://misode.github.io](https://misode.github.io)

Misode 是功能最全面的数据包在线生成器，支持：

- **战利品表**（Loot Table）：可视化编辑 pools/entries/functions/conditions
- **进度**（Advancement）
- **配方**（Recipe）
- **世界生成**（Worldgen）：生物群系/维度/结构/噪声设置
- **谓词**（Predicate）
- **物品修饰器**（Item Modifier）
- **标签**（Tag）
- **文本组件**（Text Component）

**核心优势**：提供结构化的表单编辑界面，实时预览，支持导出为完整数据包项目。推荐优先使用 Misode 生成初始 JSON，再手动调整细节。

#### MCStacker

网址：[https://mcstacker.net](https://mcstacker.net)

MCStacker 是命令生成器，特别适合生成复杂的 `/give`、`/summon`、`/loot` 等命令。支持 Minecraft 26.1+ 最新版本。

**典型用途**：

- 生成带 NBT 组件的 `/give` 命令测试 CE 物品
- 生成 `/loot` 命令测试战利品表
- 将旧版 1.20.4 命令转换为新格式

### 3. 测试世界配置

建议创建一个独立的**超平坦创造模式世界**用于开发测试：

```bash
# 在服务器控制台创建测试世界（若有 Multiverse 等插件）
# 或在单人客户端创建后上传至服务器 datapacks/ 目录
```

**测试世界要求**：

- 游戏模式：创造（Creative）
- 世界类型：超平坦（Superflat）
- 开启作弊（Cheats enabled）
- 将开发中的数据包放入该世界的 `datapacks/` 目录

## 项目结构规范

### 推荐目录树

```
miragedge-datapack/
├── pack.mcmeta                  # 数据包元数据（必需）
├── pack.png                     # 数据包图标（可选，256×256）
└── data/
    └── miragedge/               # 命名空间目录
        ├── function/            # mcfunction 函数文件
        │   ├── load.mcfunction  # 加载时执行
        │   ├── tick.mcfunction  # 每 tick 执行
        │   ├── test_<module>.mcfunction  # 测试函数
        │   └── <category>/      # 按功能分类的子目录
        ├── loot_table/          # 战利品表
        │   ├── blocks/          # 方块掉落
        │   ├── entities/        # 生物掉落
        │   └── chests/          # 箱子战利品
        ├── recipe/              # 原版合成配方
        ├── advancement/         # 进度
        ├── predicate/           # 谓词（条件判断）
        ├── item_modifier/       # 物品修饰器
        ├── tag/                 # 标签（合并机制）
        │   ├── item/            # 物品标签
        │   ├── block/           # 方块标签
        │   ├── entity_type/     # 实体类型标签
        │   ├── function/        # 函数标签（用于 tick/load 调度）
        │   └── damage_type/     # 伤害类型标签
        └── structure/           # 结构 NBT 模板
            └── *.nbt
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 文件/目录名 | 小写字母 + 下划线 | `loot_table/blocks/ruby_ore.json` |
| 函数名 | `namespace:path/to/function` | `miragedge:test_weapon_give` |
| 战利品表路径 | 反映来源类型 | `entities/zombie_king.json` |
| 标签路径 | 与原版对应 | `tag/item/weapons.json` |
| CE 物品 ID | `namespace:snake_case_name` | `miragedge:flame_sword` |

### pack.mcmeta 模板

::: code-group

```json [MC 26.1.2（推荐：新旧兼容）]
{
  "pack": {
    "description": "MiragEdge Custom Data Pack",
    "pack_format": 101,
    "min_format": 101,
    "max_format": [101, 1]
  }
}
```

```json [MC 1.21.1 - 1.21.8（仅旧格式）]
{
  "pack": {
    "description": "MiragEdge Custom Data Pack",
    "pack_format": 34
  }
}
```

:::

## 核心工作流

> **核心方法论**：每个功能模块均遵循「**概念 → 设计 → 编写 → 验证 → 部署**」五步闭环。AI 应按此流程逐模块推进。

### 模块 1：Functions（函数）

#### 概念

mcfunction 是数据包的核心逻辑载体。每个 `.mcfunction` 文件包含一份命令列表，游戏会按顺序逐行执行。函数可通过 `/function` 命令手动调用，也可通过 **tick/load 标签** 自动调度。

#### 设计

**调度机制**：

- **`#minecraft:load`**：数据包加载/重载时执行一次（适合初始化记分板、设置默认值等）
- **`#minecraft:tick`**：每游戏 tick（1/20 秒）执行一次（适合需要持续运行的逻辑）
- **主动调用**：通过 `/function namespace:path` 由命令方块、其他函数或玩家手动触发

**函数组织结构建议**：

```
function/
├── load.mcfunction         # 注册到 #minecraft:load
├── tick.mcfunction          # 注册到 #minecraft:tick
├── core/                    # 核心逻辑
├── items/                   # 物品相关
├── mobs/                    # 生物相关
└── test/                    # 测试函数
```

#### 编写

##### 1. 创建 load 函数

```mcfunction
# data/miragedge/function/load.mcfunction
# ==========================================
# MiragEdge 数据包 - 初始化函数
# 触发时机：数据包加载/重载时自动执行
# ==========================================

# 初始化记分板
scoreboard objectives add miragedge_var dummy "MiragEdge Variables"
scoreboard objectives add miragedge_kills dummy "MiragEdge Kills"

# 设置默认游戏规则
gamerule keepInventory true
gamerule doFireTick false

# 广播加载完成
tellraw @a ["",{"text":"[MiragEdge] ","color":"gold"},{"text":"数据包已加载！","color":"green"}]
```

##### 2. 创建 tick 函数

```mcfunction
# data/miragedge/function/tick.mcfunction
# ==========================================
# MiragEdge 数据包 - 主时钟函数
# 触发时机：每 tick 执行
# ==========================================

# 执行持续检测逻辑
execute as @a run function miragedge:core/player_check
```

##### 3. 注册到函数标签

标签文件决定哪些函数在 load/tick 时自动执行：

```json
// data/minecraft/tags/function/load.json
{
  "values": [
    "miragedge:load"
  ]
}
```

```json
// data/minecraft/tags/function/tick.json
{
  "values": [
    "miragedge:tick"
  ]
}
```

##### 4. 条件分支与 CE 物品交互

```mcfunction
# data/miragedge/function/items/check_sword.mcfunction
# 检查玩家手持物品并给予效果

# 检测主手是否持有特定 CE 物品（通过 custom_data 组件匹配）
execute as @a if items entity @s weapon.mainhand *[custom_data~{craftengine:{id:"miragedge:flame_sword"}}] run effect give @s minecraft:fire_resistance 5 0 true

# 检查物品的 NBT 标签
execute as @a if items entity @s weapon.mainhand *[minecraft:custom_name='{"text":"龙焰之刃","color":"gold","italic":false}'] run function miragedge:items/sword_ability
```

#### 验证

```bash
# 1. 重载数据包
/reload

# 2. 手动触发函数
/function miragedge:load

# 3. 测试 CE 物品检测
/ce item get miragedge:flame_sword
# 手持该物品，观察效果是否生效

# 4. 检查记分板
/scoreboard objectives list

# 5. 查看数据包状态
/datapack list

# 6. 查看函数标签
/datapack list available miragedge
```

#### 部署

1. 将完整数据包文件夹复制到世界的 `datapacks/` 目录
2. 执行 `/reload` 或重启服务器
3. 用 `/datapack list` 确认已启用
4. 检查服务端日志无报错

### 模块 2：Loot Tables（战利品表）

#### 概念

战利品表（Loot Table）是 Minecraft 中控制物品/经验/方块掉落的核心系统。它定义了什么在什么条件下掉落什么。可以绑定到：

- **方块**：方块被破坏时的掉落物
- **生物**：生物死亡时的掉落物
- **箱子/容器**：自然生成的箱子内容物
- **钓鱼**：钓鱼战利品
- **礼物**：猫/村民赠送的礼物

**JSON 结构层次**：

```
Loot Table
  └── Pool (1+)
       ├── rolls: 掷取次数
       ├── conditions: 池生效条件
       ├── entries: 物品条目
       │    ├── type: item / alternatives / sequence / group / tag / loot_table / empty
       │    ├── name: 物品 ID
       │    ├── weight: 权重
       │    ├── functions: 物品级别的后处理
       │    └── conditions: 条目生效条件
       └── functions: 池级别的后处理
```

#### 设计

**CE 物品在战利品表中的引用方式**：

在数据包 JSON 战利品表中引用 CraftEngine 自定义物品时，使用 **`craftengine:item`** 入口类型（而非原版的 `minecraft:item`）：

```json
{
  "type": "craftengine:item",
  "name": "miragedge:ruby"
}
```

这是与标准原版战利品表的关键区别：CE 物品不是 `minecraft:item` 类型，原版的 `minecraft:item` 入口无法识别 CE 自定义 ID。

#### 编写

##### 1. 方块掉落战利品表

```json
// data/miragedge/loot_table/blocks/ruby_ore.json
// 绑定到 CE 自定义方块 miragedge:ruby_ore 的破坏掉落
{
  "type": "minecraft:block",
  "pools": [
    {
      "rolls": 1,
      "bonus_rolls": 0,
      "entries": [
        {
          "type": "alternatives",
          "children": [
            {
              "type": "craftengine:item",
              "name": "miragedge:ruby_ore",
              "conditions": [
                {
                  "condition": "minecraft:match_tool",
                  "predicate": {
                    "predicates": {
                      "minecraft:enchantments": [
                        {
                          "enchantments": "minecraft:silk_touch",
                          "levels": { "min": 1 }
                        }
                      ]
                    }
                  }
                }
              ]
            },
            {
              "type": "craftengine:item",
              "name": "miragedge:ruby",
              "functions": [
                {
                  "function": "minecraft:apply_bonus",
                  "enchantment": "minecraft:fortune",
                  "formula": "minecraft:ore_drops"
                },
                {
                  "function": "minecraft:explosion_decay"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "minecraft:experience_bottle",
          "weight": 1
        }
      ],
      "conditions": [
        {
          "condition": "minecraft:survives_explosion"
        }
      ]
    }
  ]
}
```

##### 2. 生物掉落战利品表

```json
// data/miragedge/loot_table/entities/ruby_golem.json
// 自定义生物 miragedge:ruby_golem 的死亡掉落
{
  "type": "minecraft:entity",
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "craftengine:item",
          "name": "miragedge:ruby_shard",
          "weight": 1,
          "functions": [
            {
              "function": "minecraft:set_count",
              "count": { "type": "minecraft:uniform", "min": 2, "max": 5 }
            },
            {
              "function": "minecraft:looting_enchant",
              "count": { "type": "minecraft:uniform", "min": 0, "max": 2 }
            }
          ]
        }
      ]
    },
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "minecraft:iron_ingot",
          "weight": 3
        },
        {
          "type": "craftengine:item",
          "name": "miragedge:ruby_core",
          "weight": 1
        }
      ]
    }
  ]
}
```

##### 3. CE 方块战利品表绑定（YAML）

在 CraftEngine 方块配置 YAML 中绑定战利品表：

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/blocks.yml
blocks:
  miragedge:ruby_ore:
    settings:
      hardness: 5.0
      blast_resistance: 6.0
      requires_tool: true
    loot:
      pools:
        - rolls: 1
          entries:
            - type: alternatives
              children:
                - type: item
                  item: "miragedge:ruby_ore"
                  conditions:
                    - type: match_tool
                      predicate:
                        enchantments:
                          - enchantment: minecraft:silk_touch>=1
                - type: item
                  item: "miragedge:ruby"
                  functions:
                    - type: apply_bonus
                      enchantment: minecraft:fortune
                      formula: ore_drops
                    - type: explosion_decay
    states:
      default:
        model:
          path: "minecraft:block/emerald_ore"
```

> **两种绑定方式选择**：
>
> - **JSON 数据包方式**（`loot_table/`）：适合原版方块、标准生物掉落覆盖，可热重载（`/reload`）
> - **CE YAML 配置方式**（`loot:` 段）：适合 CE 自定义方块，绑定在方块定义中，需 `/ce reload`

#### 验证

```bash
# 1. 重载数据包
/reload

# 2. 使用 /loot 命令测试战利品表
/loot give @s loot miragedge:blocks/ruby_ore

# 3. 设置方块并手动破坏测试
/setblock ~ ~ ~ miragedge:ruby_ore
# 切换到生存模式，用工具破坏方块

# 4. 测试生物掉落（生成生物后击杀）
/summon zombie ~ ~ ~ {DeathLootTable:"miragedge:entities/ruby_golem"}
/kill @e[type=zombie,limit=1,sort=nearest]

# 5. 检查掉落物是否符合预期
```

#### 部署

1. 将 JSON 战利品表放入 `data/miragedge/loot_table/` 对应子目录
2. 若使用 CE YAML 方式，配置方块定义中的 `loot:` 段
3. 执行 `/reload`（JSON 方式）或 `/ce reload`（YAML 方式）

### 模块 3：Recipes（合成配方）

#### 概念

Minecraft 有两种配方系统：

1. **原版 JSON 配方**（`data/<namespace>/recipe/`）：通过数据包定义，适用于纯原版物品，支持 `minecraft:crafting_shaped`、`minecraft:crafting_shapeless`、`minecraft:smelting` 等类型
2. **CraftEngine YAML 配方**（`recipes/` 目录）：通过 CE 插件定义，支持原版和 CE 自定义物品作为原料/产物，功能更丰富

#### 设计：原版 vs CE 配方选择

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| 纯原版物品合成 | 原版 JSON | 简单直接，无需插件依赖 |
| 原料或产物含 CE 物品 | CE YAML | 原版无法识别 CE 物品 ID |
| 需要复杂条件/权限控制 | CE YAML | CE 支持 condition 系统 |
| 需要合成后附魔/NBT | CE YAML | CE 支持 result post-processor |
| 需要与数据包标签联动 | CE YAML | CE 物品可添加原版标签（tags） |
| Stonecutter 配方 | CE YAML（慎用） | CE 自定义物品做原料可能引起客户端视觉问题 |

#### 编写

##### 1. 原版 JSON 配方

```json
// data/miragedge/recipe/ruby_block_from_rubies.json
// 用 9 个红宝石合成红宝石块（纯原版物品）
{
  "type": "minecraft:crafting_shaped",
  "category": "building",
  "pattern": [
    "RRR",
    "RRR",
    "RRR"
  ],
  "key": {
    "R": {
      "item": "minecraft:emerald"
    }
  },
  "result": {
    "id": "minecraft:diamond_block",
    "count": 1
  }
}
```

```json
// data/miragedge/recipe/ruby_sword.json
// 红宝石剑 - 有序合成
{
  "type": "minecraft:crafting_shaped",
  "category": "equipment",
  "pattern": [
    " R ",
    " R ",
    " S "
  ],
  "key": {
    "R": {
      "item": "minecraft:emerald"
    },
    "S": {
      "item": "minecraft:stick"
    }
  },
  "result": {
    "id": "minecraft:iron_sword",
    "count": 1,
    "components": {
      "minecraft:custom_name": "{\"text\":\"红宝石剑\",\"color\":\"red\",\"italic\":false}",
      "minecraft:enchantments": {
        "levels": {
          "minecraft:sharpness": 2
        }
      }
    }
  }
}
```

##### 2. CraftEngine YAML 配方

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/recipes.yml
recipes:
  # 有序合成 - CE 物品作为原料和产物
  miragedge:flame_sword_recipe:
    type: shaped
    category: equipment
    group: miragedge_weapons
    pattern:
      - " R "
      - " R "
      - " S "
    ingredients:
      R: "miragedge:flame_ruby"     # CE 自定义物品作为原料
      S: "minecraft:stick"           # 原版物品
    result:
      id: miragedge:flame_sword      # CE 自定义物品作为产物
      count: 1

  # 无序合成
  miragedge:ruby_block:
    type: shapeless
    category: building
    group: miragedge_blocks
    ingredients:
      - "miragedge:ruby"             # 需要 9 个散装红宝石
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
      - "miragedge:ruby"
    result:
      id: miragedge:ruby_block
      count: 1

  # 烧炼配方
  miragedge:ruby_smelt:
    type: smelting
    category: misc
    ingredient: "miragedge:ruby_ore"
    time: 200                      # 200 ticks = 10 秒
    experience: 1.0
    result:
      id: miragedge:ruby
      count: 1

  # 带附魔结果的配方
  miragedge:enchanted_ruby_sword:
    type: shaped
    category: equipment
    pattern:
      - " R "
      - " R "
      - " S "
    ingredients:
      R: "miragedge:enchanted_ruby"
      S: "minecraft:stick"
    result:
      id: miragedge:ruby_sword
      count: 1
      post-processors:
        - type: apply_data
          data:
            enchantment:
              minecraft:sharpness: 5
              minecraft:fire_aspect: 2
            lore:
              - "<!i><gray>传说中红龙之息淬炼而成"
              - "<!i><red>锋利 V 火焰附加 II"
```

#### 验证

```bash
# CE 配方重载
/ce reload recipe

# 检查配方是否正确注册（观察是否有错误日志）

# 游戏中测试
# 1. 获取原料物品
/ce item get miragedge:flame_ruby 64
/give @s minecraft:stick 64

# 2. 打开工作台，检查配方是否出现在配方书中
# 3. 手动摆放物品，确认合成结果

# 4. 测试烧炼配方
/give @s miragedge:ruby_ore 64
# 放入熔炉测试

# 5. 查看所有已注册的 CE 配方
# （检查控制台日志）
```

#### 部署

1. 原版 JSON 配方放入 `data/miragedge/recipe/`，执行 `/reload`
2. CE YAML 配方放入 `resources/<pack>/configuration/`，执行 `/ce reload recipe`
3. **注意**：同时使用两种配方系统时，优先通过 CE 管理涉及自定义物品的配方，避免原版配方无法识别 CE ID

### 模块 4：生物掉落/生成修改

#### 概念

修改生物掉落和生成有几种方式：

1. **战利品表覆盖**（Loot Table Override）：用自定义 JSON 替换原版生物的战利品表
2. **谓词条件控制**（Predicate）：通过 predicates 定义复杂掉落条件
3. **CE 物品掉落**：在战利品表中引用 CE 自定义物品

#### 设计

**生物战利品表注入方式**：

- **直接覆盖**：创建与生物 ID 同名的战利品表文件，完全替换原版掉落
- **实体数据绑定**：通过召唤实体时指定 `DeathLootTable` NBT 标签
- **CE YAML**：在 CE 的 entity 配置中直接定义掉落

#### 编写

##### 1. 覆盖原版生物战利品表

```json
// data/miragedge/loot_table/entities/zombie.json
// 完全覆盖原版僵尸的掉落表
{
  "type": "minecraft:entity",
  "pools": [
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "minecraft:rotten_flesh",
          "weight": 1,
          "functions": [
            {
              "function": "minecraft:set_count",
              "count": { "type": "minecraft:uniform", "min": 0, "max": 2 }
            },
            {
              "function": "minecraft:looting_enchant",
              "count": { "type": "minecraft:uniform", "min": 0, "max": 1 }
            }
          ]
        }
      ]
    },
    {
      "rolls": 1,
      "entries": [
        {
          "type": "craftengine:item",
          "name": "miragedge:corrupted_soul",
          "weight": 10
        },
        {
          "type": "minecraft:item",
          "name": "minecraft:iron_ingot",
          "weight": 1,
          "conditions": [
            {
              "condition": "minecraft:entity_properties",
              "entity": "killer",
              "predicate": {
                "type_specific": {
                  "type": "minecraft:player",
                  "advancements": {
                    "miragedge:defeated_wither": true
                  }
                }
              }
            }
          ]
        }
      ],
      "conditions": [
        {
          "condition": "minecraft:killed_by_player"
        }
      ]
    },
    {
      "rolls": 1,
      "entries": [
        {
          "type": "minecraft:item",
          "name": "minecraft:zombie_head"
        }
      ],
      "conditions": [
        {
          "condition": "minecraft:killed_by_player"
        },
        {
          "condition": "minecraft:random_chance_with_enchanted_bonus",
          "enchanted": "minecraft:looting",
          "unenchanted_chance": 0.025,
          "enchanted_chance": {
            "type": "minecraft:linear",
            "base": 0.03,
            "per_level_above_first": 0.01
          }
        }
      ]
    }
  ]
}
```

##### 2. 使用谓词（Predicate）控制掉落条件

```json
// data/miragedge/predicate/entities/is_boss_killer.json
// 谓词：检查击杀者是否击败过凋灵
{
  "condition": "minecraft:entity_properties",
  "entity": "killer",
  "predicate": {
    "type_specific": {
      "type": "minecraft:player",
      "advancements": {
        "miragedge:defeated_wither": true
      }
    }
  }
}
```

##### 3. CE YAML 方式定义生物掉落

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/entities.yml
entities:
  miragedge:ruby_golem:
    type: iron_golem
    health: 100
    damage: 12
    loot:
      pools:
        - rolls: 1
          entries:
            - type: item
              item: "miragedge:ruby_shard"
              weight: 1
              functions:
                - type: set_count
                  count:
                    type: uniform
                    min: 2
                    max: 5
            - type: item
              item: "minecraft:poppy"
              weight: 5
        - rolls: 1
          entries:
            - type: item
              item: "miragedge:ruby_core"
              weight: 1
          conditions:
            - type: killed_by_player
```

#### 验证

```bash
# 1. 重载数据包
/reload

# 2. 生成测试生物并击杀
/summon zombie ~ ~ ~
/kill @e[type=zombie,limit=1,sort=nearest]

# 3. 使用战利品表模拟
/loot give @s loot miragedge:entities/zombie

# 4. 测试 CE 生物
/ce mob spawn miragedge:ruby_golem ~ ~ ~
# 击杀后检查掉落

# 5. 检查谓词条件
/execute if predicate miragedge:entities/is_boss_killer run say Predicate passed!
```

#### 部署

1. 覆盖型战利品表放入 `data/miragedge/loot_table/entities/<entity_id>.json`
2. CE YAML 实体掉落配置放入 `resources/<pack>/configuration/entities.yml`
3. 重载对应配置（`/reload` 或 `/ce reload`）

### 模块 5：自定义装备与物品（CraftEngine）

#### 概念

CraftEngine 通过 YAML 配置定义自定义物品，然后自动生成对应的资源包（Resource Pack）以实现视觉呈现。这是 CE 的核心能力，也是与数据包协同的枢纽。

#### 设计

CE 物品配置包含以下几层：

```
物品 ID (miragedge:ruby_sword)
  ├── material: 基础材质（决定底层行为）
  ├── data: 硬编码数据组件（跨版本兼容）
  │    ├── item-name: 物品名称
  │    ├── lore: 物品描述
  │    ├── enchantment: 附魔
  │    ├── attribute_modifiers: 属性修改
  │    ├── unbreakable: 不可损坏
  │    ├── max-damage: 最大耐久
  │    └── dyed-color: 染色
  ├── settings: 物品设置
  │    ├── fuel-time: 燃料时间
  │    ├── food: 食物属性
  │    └── equipment: 装备槽位
  ├── model: 模型定义（关联资源包贴图）
  └── tags: 添加原版标签
```

#### 编写

##### 1. 基础物品定义

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/items/ruby_items.yml
items:
  # 基础材料
  miragedge:ruby:
    material: emerald
    data:
      item-name: "<!i><red>红宝石"
      lore:
        - "<!i><gray>一颗闪耀着红光的宝石"
        - "<!i><dark_gray>稀有材料"
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "minecraft:item/custom/ruby"

  miragedge:enchanted_ruby:
    material: emerald
    data:
      item-name: "<!i><light_purple>附魔红宝石"
      enchantment:
        minecraft:sharpness: 1
      hide-tooltip:
        - enchantments
      custom-model-data: 1001
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "minecraft:item/custom/enchanted_ruby"
```

##### 2. 装备物品定义

```yaml
# plugins/CraftEngine/resources/miragedge/configuration/items/equipment.yml
items:
  # 红宝石剑
  miragedge:ruby_sword:
    material: iron_sword
    data:
      item-name: "<!i><red>红宝石剑"
      lore:
        - "<!i><gray>镶嵌红宝石的利剑"
        - "<!i><gold>+7 攻击伤害"
        - ""
        - "<!i><dark_gray>稀有武器"
      enchantment:
        minecraft:sharpness: 3
      attribute_modifiers:
        - type: attack_damage
          amount: 7
          operation: add_value
          slot: mainhand
        - type: attack_speed
          amount: -2.4
          operation: add_value
          slot: mainhand
      max-damage: 1561
      rarity: rare
    settings:
      tags:
        - "minecraft:swords"
        - "minecraft:enchantable/weapon"
    model:
      template: "default:model/handheld"
      arguments:
        path: "minecraft:item/custom/ruby_sword"

  # 红宝石头盔
  miragedge:ruby_helmet:
    material: iron_helmet
    data:
      item-name: "<!i><red>红宝石头盔"
      attribute_modifiers:
        - type: armor
          amount: 3
          operation: add_value
          slot: head
        - type: armor_toughness
          amount: 2
          operation: add_value
          slot: head
      max-damage: 275
      rarity: rare
    settings:
      equipment:
        slot: head
      tags:
        - "minecraft:head_armor"
        - "minecraft:enchantable/armor"
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "minecraft:item/custom/ruby_helmet"

  # 食物物品
  miragedge:magic_apple:
    material: golden_apple
    data:
      item-name: "<!i><gold>魔法苹果"
      lore:
        - "<!i><gray>散发着神秘的力量"
    settings:
      food:
        nutrition: 4
        saturation: 9.6
        can-always-eat: true
        effects:
          - type: minecraft:regeneration
            duration: 100
            amplifier: 1
            probability: 1.0
          - type: minecraft:absorption
            duration: 2400
            amplifier: 1
            probability: 1.0
    model:
      template: "default:model/simplified_generated"
      arguments:
        path: "minecraft:item/custom/magic_apple"
```

##### 3. 数据组件速查表

| YAML 键 | 用途 | 示例值 |
|---------|------|--------|
| `item-name` | 物品默认名称 | `"<!i><red>物品名"` |
| `custom-name` | 自定义名称（类似铁砧改名） | `"<!i><blue>名称"` |
| `lore` | 物品描述列表 | `["<gray>描述行1", "<gray>描述行2"]` |
| `enchantment` | 附魔 | `minecraft:sharpness: 5` |
| `attribute_modifiers` | 属性修改 | 见上方示例 |
| `unbreakable` | 不可损坏 | `true` |
| `max-damage` | 最大耐久值 | `1561` |
| `hide-tooltip` | 隐藏提示 | `[enchantments, attributes]` |
| `dyed-color` | 皮革染色 | `"255,100,50"` |
| `custom-model-data` | CMD 值（用于材质映射） | `1001` |
| `rarity` | 稀有度颜色 | `uncommon / rare / epic` |
| `fire-resistant` | 防火物品 | `true` |
| `max-stack-size` | 最大堆叠数 | `16` |

##### 4. 资源包关联

CraftEngine 自动生成资源包时需要以下目录结构：

```
plugins/CraftEngine/resources/miragedge/resourcepack/assets/
└── minecraft/
    ├── models/item/custom/
    │   ├── ruby.json          # 模型 JSON
    │   ├── ruby_sword.json
    │   └── ruby_helmet.json
    └── textures/item/custom/
        ├── ruby.png           # 贴图 PNG（需自行提供）
        ├── ruby_sword.png
        └── ruby_helmet.png
```

> CE 模板 `default:model/simplified_generated` 会自动生成标准 `minecraft:item/generated` 模型，指向 `textures/item/custom/<filename>.png`。

#### 验证

```bash
# 1. 重载 CE 配置（自动重新生成资源包）
/ce reload

# 2. 获取物品
/ce item get miragedge:ruby_sword
/ce item get miragedge:ruby_helmet
/ce item get miragedge:magic_apple 16

# 3. 检查物品属性
# 手持物品，查看 tooltip 是否正确显示名称/Lore/附魔
# 穿戴装备，按 F3+H 查看耐久度
# 食用食物，检查效果是否触发

# 4. 检查标签是否正确注册
/data get entity @s Inventory[{components:{"minecraft:custom_data":{craftengine:{id:"miragedge:ruby_sword"}}}}]

# 5. 验证不可损坏
/ce item get miragedge:ruby_sword
# 攻击生物多次，检查耐久度是否降低
```

#### 部署

1. YAML 配置文件放入 `resources/<pack>/configuration/`
2. 贴图 PNG 文件放入 `resources/<pack>/resourcepack/assets/minecraft/textures/item/custom/`
3. 执行 `/ce reload`（自动重新生成资源包并分发）
4. 客户端可能需要重新加入服务器以更新资源包

### 模块 6：结构关联（Structures）

#### 概念

结构（Structure）是预定义的方块和实体组合，通过 .nbt 文件存储，可用于：

- **结构方块**：用 `/place template` 命令手动放置
- **世界生成**：通过 structure set / template pool 系统在生成新区块时自动放置
- **拼图结构**（Jigsaw）：多个子结构拼接成大型建筑（如原版村庄、堡垒遗迹）

#### 设计

**结构开发流程**：

```
1. 在测试世界中建造结构
       ↓
2. 用结构方块保存为 .nbt 模板
       ↓
3. 从世界目录复制到数据包 structure/ 目录
       ↓
4. 配置 structure / structure_set / template_pool 注册
       ↓
5. 验证生成结果
```

**含 CE 方块的 .nbt 导出注意事项**：

- CE 自定义方块在结构方块中能正确保存和加载
- 但 CE 方块使用内部 ID（如 `craftengine:custom_0`），跨环境迁移时需确保 CE 配置一致
- 使用 `/place template` 测试时，若 CE 方块无法正确放置，检查 CE 是否已重载

#### 编写

##### 1. 用结构方块保存 .nbt 模板

在测试世界中：

```bash
# 1. 获取结构方块
/give @s minecraft:structure_block

# 2. 在结构的左下角（面朝东）放置结构方块，设置为 "保存模式"
# 结构名称填写：miragedge:ruby_shrine

# 3. 在结构的右上角放置第二个结构方块，设置为 "角落模式"
# 结构名称必须与第一个相同

# 4. 点击第一个结构方块的 "探测" 按钮确认选区
# 5. 点击 "保存" 按钮
# 文件将保存至：generated/miragedge/structures/ruby_shrine.nbt
```

##### 2. 复制到数据包

```bash
# 将 .nbt 文件从生成目录复制到数据包
# 源：<world>/generated/miragedge/structures/ruby_shrine.nbt
# 目标：data/miragedge/structure/ruby_shrine.nbt
```

##### 3. 配置结构池（Template Pool）

```json
// data/miragedge/worldgen/template_pool/ruby_shrine.json
{
  "fallback": "minecraft:empty",
  "elements": [
    {
      "weight": 1,
      "element": {
        "element_type": "minecraft:single_pool_element",
        "location": "miragedge:ruby_shrine",
        "projection": "rigid",
        "processors": "minecraft:empty"
      }
    }
  ]
}
```

##### 4. 配置结构定义

```json
// data/miragedge/worldgen/structure/ruby_shrine.json
{
  "type": "minecraft:jigsaw",
  "biomes": "#minecraft:has_structure/ruby_shrine",
  "step": "surface_structures",
  "spawn_overrides": {},
  "terrain_adaptation": "beard_thin",
  "start_pool": "miragedge:ruby_shrine",
  "size": 1,
  "start_height": {
    "absolute": 0
  },
  "project_start_to_heightmap": "WORLD_SURFACE_WG",
  "max_distance_from_center": 80,
  "use_expansion_hack": false
}
```

##### 5. 配置结构集（Structure Set）

```json
// data/miragedge/worldgen/structure_set/ruby_shrines.json
{
  "structures": [
    {
      "structure": "miragedge:ruby_shrine",
      "weight": 1
    }
  ],
  "placement": {
    "type": "minecraft:random_spread",
    "spacing": 34,
    "separation": 16,
    "salt": 427590123
  }
}
```

##### 6. CE 方块在世界生成中的引用

当结构 .nbt 中包含 CE 自定义方块，且需要在世界生成（如树木/矿脉）中使用时：

```json
// data/miragedge/worldgen/configured_feature/ruby_tree.json
{
  "type": "minecraft:tree",
  "config": {
    "trunk_provider": {
      "type": "craftengine:simple_state_provider",
      "state": {
        "Name": "miragedge:ruby_log",
        "Properties": { "axis": "y" }
      }
    },
    "foliage_provider": {
      "type": "craftengine:simple_state_provider",
      "state": {
        "Name": "miragedge:ruby_leaves",
        "Properties": {
          "distance": "7",
          "persistent": "false",
          "waterlogged": "false"
        }
      }
    }
  }
}
```

> **关键点**：在 worldgen JSON 中使用 CE 方块时，provider type 必须改为 `craftengine:simple_state_provider`（而非 `minecraft:simple_state_provider`），其他格式完全一致。

CE 支持的 block state provider 类型：`craftengine:simple_state_provider`、`craftengine:weighted_state_provider`、`craftengine:rotated_block_provider`、`craftengine:randomized_int_state_provider`。

#### 验证

```bash
# 1. 重载数据包
/reload

# 2. 用 /place 命令直接放置结构
/place template miragedge:ruby_shrine ~ ~ ~

# 3. 检查 CE 方块是否正确放置
# 如果 CE 方块显示为空气或错误方块：
# - 确认 /ce reload 已执行
# - 检查 CE 方块 ID 是否匹配

# 4. 检查结构注册
/locate structure miragedge:ruby_shrine

# 5. 测试世界生成（需要未生成的新区块）
# 飞行到远处未加载的区域查看结构是否自然生成

# 6. 获取 CE 方块的内部 ID（用于调试）
# 查阅 CE 命令：/ce block info
```

#### 部署

1. .nbt 模板放入 `data/miragedge/structure/`
2. 结构配置 JSON 放入 `data/miragedge/worldgen/structure/`
3. 结构池 JSON 放入 `data/miragedge/worldgen/template_pool/`
4. 结构集 JSON 放入 `data/miragedge/worldgen/structure_set/`
5. 执行 `/reload`（注意：worldgen 变更需重新进入世界或重启服务器才能完全生效）
6. 若涉及 CE 方块，确保先 `/ce reload` 使方块注册生效

## CraftEngine 集成指南

### 配置对接总览

```
┌──────────────────────────────────────────────────────┐
│                    CraftEngine                        │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ items/      │  │ blocks/  │  │ recipes/       │  │
│  │ (物品配置)  │  │ (方块配置)│  │ (配方配置)     │  │
│  └──────┬──────┘  └────┬─────┘  └───────┬────────┘  │
│         │              │                │            │
│  ┌──────┴──────────────┴────────────────┴────────┐   │
│  │            混合架构                          │   │
│  │  CE 管：物品 / NBT / 材质 / 方块注册          │   │
│  │  数据包管：function / loot_table / tag /       │   │
│  │           structure / advancement              │   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### 物品 ID 引用规则

| 场景 | 引用方式 | 示例 |
|------|----------|------|
| CE YAML 内部引用 | `namespace:id` | `miragedge:ruby_sword` |
| 数据包 loot_table | `craftengine:item` + `name` | `{"type":"craftengine:item","name":"miragedge:ruby"}` |
| mcfunction 命令 | `/ce item get namespace:id` | `/ce item get miragedge:ruby 64` |
| 原版 JSON recipe | ❌ 不支持 | 原版无法识别 CE 物品 ID |
| CE YAML recipe | `namespace:id` | `id: miragedge:ruby_sword` |
| 外部插件引用 | `插件名小写:物品名小写` | `mythicmobs:kingscrown` |

### 方块注册与战利品表绑定

CE 方块通过 YAML 配置注册为**真实服务端方块**（非音符盒替代），这意味着：

- 方块具有独立的物理属性（硬度、爆炸抗性、亮度）
- 可被活塞推动、可含水、可传导红石信号（取决于配置）
- 使用 `craftengine:simple_state_provider` 在 worldgen 中引用

```yaml
blocks:
  miragedge:ruby_block:
    settings:
      hardness: 5.0
      blast_resistance: 10.0
      luminance: 3
    loot:
      pools:
        - rolls: 1
          entries:
            - type: item
              item: "miragedge:ruby_block"
    states:
      default:
        model:
          path: "minecraft:block/emerald_block"
```

### CE 命令速查

```bash
# 获取 CE 物品
/ce item get <namespace:id> [amount] [player]

# 重载全部配置（会重新生成资源包）
/ce reload

# 仅重载配方
/ce reload recipe

# 仅重载物品配置
/ce reload item

# 获取方块内部 ID（用于调试）
/ce block info <x> <y> <z>

# 查看 CE 版本
/ce version
```

## 工具链速查

### 在线工具

| 工具 | 网址 | 用途 |
|------|------|------|
| **Misode** | [misode.github.io](https://misode.github.io) | 全功能数据包生成器（战利品表/进度/配方/世界生成/标签） |
| **MCStacker** | [mcstacker.net](https://mcstacker.net) | 命令生成器（/give /summon /loot /bossbar 等） |
| **Minecraft Wiki** | [minecraft.wiki](https://minecraft.wiki) | 官方社区 Wiki，数据包格式权威参考 |
| **Pack Version** | [minecraft.wiki/w/Pack_version](https://minecraft.wiki/w/Pack_version) | pack_format 对照表 |
| **CE 官方文档** | [xiao-momi.github.io/craft-engine-wiki](https://xiao-momi.github.io/craft-engine-wiki) | CraftEngine 完整配置参考 |
| **CE Datapack 集成** | [xiao-momi.github.io/craft-engine-wiki/compatibility/datapack](https://xiao-momi.github.io/craft-engine-wiki/compatibility/datapack) | CE 与数据包互操作文档 |

### VSCode 扩展

| 扩展 | ID | 功能 |
|------|-----|------|
| Spyglass（DHP） | `SPGoding.datapack-language-server` | JSON/mcfunction 验证/补全/跳转 |
| language-mcfunction | `arcensoth.language-mcfunction` | mcfunction 语法高亮 |
| YAML | `redhat.vscode-yaml` | YAML 语法支持（CE 配置编辑） |

### 调试命令

```bash
# 数据包管理
/datapack list                          # 列出所有数据包及加载顺序
/datapack list available <namespace>   # 列出某命名空间下的可用内容
/datapack disable <name>               # 禁用一个数据包（会自动重载）
/datapack enable <name>                # 启用一个数据包（会自动重载）

# 重载
/reload                                 # 重载数据包（functions/loot_tables/recipes/advancements/predicates/tags 等）
/ce reload                              # 重载 CraftEngine 全部配置
/ce reload recipe                       # 仅重载 CE 配方

# 函数测试
/function <namespace:path>              # 手动执行一个函数
/schedule function <namespace:path> <time>  # 延迟执行函数

# 战利品表测试
/loot give @s loot <namespace:path>     # 模拟战利品表给予物品
/loot spawn ~ ~ ~ loot <namespace:path> # 在地面生成战利品

# 结构测试
/place template <namespace:path> [pos]  # 放置结构模板
/locate structure <namespace:path>      # 查找最近的结构

# 标签调试
/data get storage <namespace:path>      # 读取 NBT 存储

# 日志查看
# 检查服务端 latest.log 中的错误信息
```

## 常见问题与踩坑

### pack_format 对照表

| MC 版本 | pack_format（数据包） | 资源包格式 | 备注 |
|---------|----------------------|------------|------|
| 1.21 | 48 | 34 | Bundles of Bravery |
| 1.21.1 | 48 | 34 | — |
| 1.21.2 - 1.21.3 | 57 | 42 | 试炼刷怪笼更新 |
| 1.21.4 | 61 | 46 | 冬季小更新 |
| 1.21.5 | 71 | 55 | Spring to Life |
| 1.21.6 | 80 | 63 | 对话框系统 |
| 1.21.7 - 1.21.8 | 81 | 64 | — |
| 1.21.9 - 1.21.10 | 88.0 | 69 | min/max_format 引入 |
| 1.21.11 | 94.1 | 75 | 物品组件扩展 |
| **26.1 - 26.1.2** | **101.1** | **84** | **Tiny Takeover（本服版本）** |
| 26.2 | 107.1 | — | 最新版（截至 2026.07） |

::: info pack_format 的小数点是怎么回事？
自 MC 26.1 开发周期起，Mojang 引入了 **`X.Y` 小数格式** 的 pack_format（如 `101.1`、`94.1`、`107.1`）。

- **整数部分（`X`）**：主版本号，破坏性变更时递增（如 26.1 从 1.21.11 的 94 跳到 101）
- **小数部分（`Y`）**：次版本号，同一主版本内非破坏性微调时递增（如 26.1-pre-2 的 `101.0` → 26.1-pre-3 的 `101.1`）

在 `pack.mcmeta` 中，旧版 `pack_format` 整数字段已弃用；新版使用数组格式的 `min_format` / `max_format` 字段：
```json
{
  "pack": {
    "min_format": [101, 1],
    "max_format": [101, 1],
    "description": "MiragEdge Data Pack"
  }
}
```
其中 `[101, 1]` 对应 `pack_format: 101.1`。兼容旧版时，四个字段需同时出现。
:::

> 更新到新版本时务必修改 `pack.mcmeta` 中的 `pack_format` / `min_format` 值！

### /reload 的生效边界

`/reload` **可以**热重载的内容：

- Functions（.mcfunction）
- Loot Tables（战利品表）
- Recipes（原版 JSON 配方）
- Advancements（进度）
- Predicates（谓词）
- Item Modifiers（物品修饰器）
- Tags（标签）
- Structure Templates（结构模板）

`/reload` **不能**热重载的内容（需重新进入世界或重启服务器）：

- Worldgen（世界生成配置：biome/dimension/structure_set/noise_settings 等）
- Enchantments（附魔定义）
- 盔甲纹饰（Trim Materials / Trim Patterns）
- 唱片机曲目（Jukebox Songs）
- 伤害类型（Damage Types）
- 维度（Dimensions）

> **经验法则**：修改 `data/<namespace>/worldgen/` 下的内容后，必须退出并重新进入世界，或重启服务器。

### 数据包加载顺序与 tag 合并机制

**加载顺序**：

- 数据包的加载顺序由 `/datapack list` 显示（或在创建世界界面中调整）
- 先加载的优先级**低**，后加载的优先级**高**
- 高优先级数据包的同名文件会**完全覆盖**低优先级的文件

**Tag 合并机制**：

- 标签（Tag）文件默认**合并**：多个数据包定义同名标签时，内容会被合并
- 如果希望完全覆盖（而非合并），在标签 JSON 中设置 `"replace": true`：

```json
{
  "replace": true,
  "values": [
    "miragedge:ruby_sword",
    "miragedge:flame_sword"
  ]
}
```

### CE 配方重载注意事项

- CE 配方重载命令：`/ce reload recipe`
- **Folia 服务端**：仅支持 `/ce reload recipe`，不支持 `/ce reload all`
- **配方重载有风险**：Folia 上配方管理器非线程安全，运行时重载可能导致崩溃。在 Paper/Leaf 上通常安全。
- CE 配方重载后，同时需要 `/reload` 数据包中原版配方，防止引用失效

### 其他常见坑

1. **JSON 语法错误导致静默失败**：JSON 文件有语法错误时，该文件不会加载，但游戏不会崩溃。始终使用 Misode 或 Spyglass 验证 JSON 格式。
2. **命名空间冲突**：不同数据包中同名文件会被高优先级包覆盖，注意命名空间隔离。
3. **CE 物品在结构 .nbt 中**：保存 .nbt 时确保 CE 已重载并方块状态正确。跨环境迁移时需 CE 配置完全一致。
4. **资源包未更新**：修改 CE 物品配置或贴图后，客户端可能需要重新加入服务器才能看到变化。
5. **原版 recipe 引用 CE 物品 ID**：不可行。原版 `minecraft:item` 入口只能识别 `minecraft:` 命名空间下的物品 ID。
6. **Stonecutter 配方使用 CE 物品做原料**：CE 官方不建议，可能导致客户端视觉问题。

## AI 使用指南

### 本文档覆盖范围声明

本文档覆盖以下能力边界内的任务：

| 能力 | 覆盖 | 不覆盖 |
|------|------|--------|
| 数据包项目搭建 | ✅ 完整结构 | — |
| mcfunction 编写 | ✅ 通用逻辑、CE 物品检测 | 复杂红石/命令方块逻辑 |
| 原版配方 | ✅ 所有类型 | — |
| CE 配方 | ✅ 基础/烧炼/附魔结果 | 高级 post-processor、自定义 event |
| 战利品表 | ✅ 方块/生物/箱子 | 高级 predicate 条件组合 |
| CE 物品 | ✅ 属性/附魔/食物/装备 | 高级 behavior、家具、client-bound-data |
| CE 方块 | ✅ 基础方块/战利品表 | 多状态复杂方块、方块 behavior |
| 结构 | ✅ 单模板结构 | 拼图结构（Jigsaw）大型拼接 |
| 世界生成 | ✅ CE 方块 provider | 复杂的自定义维度/噪声 |

### 使用流程

当用户提出 MC 数据包或 CraftEngine 开发请求时，AI 应按以下流程执行：

```
第 1 步：阅读概述与前知知识
  → 确认命名空间、版本、环境约束

第 2 步：匹配功能模块
  → 从 6 大模块中定位相关章节

第 3 步：五步闭环执行
  → 概念理解 → 设计方案 → 编写代码 → 验证命令 → 部署说明

第 4 步：交付输出
  → 提供可直接复制的代码文件
  → 附带验证命令
  → 标注需要手动操作的步骤
```

### 命名/路径/命令规范

AI 生成的所有代码必须遵循以下规范：

- **命名空间**：`miragedge`（除非用户另有指定）
- **pack_format**：`101`（MC 26.1.2，以实际环境为准）
- **文件路径**：使用 `data/miragedge/<type>/<path>.json` 格式
- **CE 物品 ID**：`miragedge:<snake_case_name>`
- **函数路径**：`miragedge:<category>/<function_name>`
- **命令中的 ID**：始终使用完整命名空间（不要省略 `miragedge:`）

### 未覆盖问题的处理策略

当遇到本文档未覆盖的问题时，AI 应：

1. **查阅官方文档**：优先访问 [Minecraft Wiki](https://minecraft.wiki) 或 [CE 官方文档](https://xiao-momi.github.io/craft-engine-wiki)
2. **参考原版数据包**：Minecraft 内置原版数据包是最佳参考，路径：`<server.jar>/data/minecraft/`
3. **使用 Misode 辅助**：不确定 JSON 格式时，用 Misode 生成器可视化编辑，然后导出
4. **增量验证**：每完成一个模块配置后即用验证命令测试，不要等全部写完再测试
5. **保守提示**：对于文档未明确覆盖的功能，向用户说明不确定性，并给出最佳实践建议

### 输出格式与交付标准

AI 的输出应满足：

1. **可操作**：每个代码块可直接复制使用，占位符需明确标注
2. **完整**：包含文件路径注释（如 `// data/miragedge/loot_table/blocks/xxx.json`）
3. **可验证**：每个模块附带验证命令
4. **有上下文**：说明文件之间的依赖关系
5. **区分 CE/原版**：明确标注使用 CE YAML 还是数据包 JSON

## 参考资源

### 官方文档与 Wiki

- [Minecraft Wiki - 数据包](https://minecraft.wiki/w/Data_pack)
- [Minecraft Wiki - Pack Version（pack_format 对照表）](https://minecraft.wiki/w/Pack_version)
- [Minecraft Wiki - 教程：创建数据包](https://minecraft.wiki/w/Tutorials/Creating_a_data_pack)
- [Minecraft Wiki - 教程：自定义结构生成](https://minecraft.wiki/w/Tutorials/Custom_structures)
- [Minecraft Wiki - 命令参考](https://minecraft.wiki/w/Commands)
- [Minecraft Wiki - 战利品表](https://minecraft.wiki/w/Loot_table)

### CraftEngine

- [CraftEngine 官方文档](https://xiao-momi.github.io/craft-engine-wiki) - 完整配置参考
- [CraftEngine Datapack 集成](https://xiao-momi.github.io/craft-engine-wiki/compatibility/datapack) - CE 与数据包互操作
- [CraftEngine Recipe 配置](https://xiao-momi.github.io/craft-engine-wiki/configuration/recipe) - CE 配方系统
- [CraftEngine Loot Table 配置](https://xiao-momi.github.io/craft-engine-wiki/reference/loot_table) - CE 战利品表
- [CraftEngine GitHub](https://github.com/Xiao-MoMi/craft-engine) - 项目仓库
- [CraftEngine DeepWiki](https://deepwiki.com/jhqwqmc/craft-engine-wiki) - 社区维护详细文档

### 在线工具

- [Misode Data Pack Generators](https://misode.github.io) - 数据包可视化生成器
- [Misode Version Explorer](https://misode.github.io/versions) - 版本/pack_format 查询
- [MCStacker](https://mcstacker.net) - 命令生成器

### VSCode 扩展

- [Spyglass（Datapack Helper Plus）](https://marketplace.visualstudio.com/items?itemName=SPGoding.datapack-language-server) - MC 数据包开发扩展
- [language-mcfunction](https://marketplace.visualstudio.com/items?itemName=arcensoth.language-mcfunction) - mcfunction 语法高亮

### 原版数据包参考

- Minecraft 内置原版数据包位于 `<server.jar>/data/minecraft/`，可用解压工具提取作为参考
- [misode/mcmeta](https://github.com/misode/mcmeta) - Minecraft 数据生成 JSON 元数据

> **文档维护**：本文档由 F.windEmiko（狐风轩汐）编写，服务于 MiragEdge 锐界幻境服务器。版本随 MC 版本和 CraftEngine 版本更新。如有疑问或建议，请联系开发团队。
