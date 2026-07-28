---
title: 数据包工作流 · 模块工作流
description: 面向锐界幻境开发维护的数据包工作流，按前置环境、模块实现、参考规则和排错拆分。
---

# 数据包工作流 · 模块工作流

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

##### 5. 物品组件测试语法（附魔 / custom_data 等）

`execute if items ... *[component~value]` 中 `value` 的格式因组件而异，**必须严格匹配组件的数据结构**：

| 组件 | 测试值格式 | 示例 |
|------|------------|------|
| `minecraft:enchantments` | **列表** `[{<enchant_id>: <min_level>}]` | `*[minecraft:enchantments~[{silk_touch:1}]]` |
| `minecraft:custom_data` | 对象 `{...}` | `*[custom_data~{craftengine:{id:"miragedge:flame_sword"}}]` |
| `minecraft:custom_name` | JSON 字符串 | `*[minecraft:custom_name='{"text":"剑","color":"gold"}']` |
| `minecraft:damage` | 整数 | `*[minecraft:damage~10]` |
| `minecraft:max_damage` | 整数 | `*[minecraft:max_damage~100]` |

::: danger minecraft:enchantments 测试值必须是列表
最常见的错误是把附魔测试值写成对象 `{levels:{"minecraft:silk_touch":1}}`（这是 `/give` 的赋值语法），导致 `Malformed 'minecraft:enchantments' predicate: 'Not a list'` 错误。

**错误**（这是 give 命令的赋值语法，不是测试语法）：
```mcfunction
# ❌ 会报 "Not a list" 错误
execute as @a if items entity @s weapon.mainhand *[minecraft:enchantments~{levels:{"minecraft:silk_touch":1}}] run say has silk touch
```

**正确**（列表格式，每个元素是 `{<enchantment_id>: <min_level>}`）：
```mcfunction
# ✅ 正确的附魔检测语法
execute as @a if items entity @s weapon.mainhand *[minecraft:enchantments~[{silk_touch:1}]] run say has silk touch

# 多个附魔同时检测
execute as @a if items entity @s weapon.mainhand *[minecraft:enchantments~[{sharpness:3},{unbreaking:1}]] run say enchanted
```
:::

> **赋值 vs 测试**：`/give` 命令中使用 `{levels:{"minecraft:silk_touch":1}}` 是**赋值**（设置组件值）；`execute if items` 中的 `~` 后面是**测试**（匹配组件值），二者格式不同。

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

> 本章只说明数据包与 CE 的边界。CE 物品、方块和资源包的实际结构见 [CE 开发工作流](/developer/workflows/craftengine/) 与 [CE 配置参考](/developer/workflows/craftengine/reference)。本章示例中的 namespace 只是示例，当前资源快照主要使用 `miragedge_items`、`miragedge_icon`、`miragedge_menu` 和 `customcrops`。

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
