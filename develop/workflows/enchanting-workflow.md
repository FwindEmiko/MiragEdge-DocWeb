---
title: "✨ 附魔配置工作流 · AI Skills 文档"
description: "面向 AI 编码助手的 Aiyatsbus 自定义附魔完整开发指南，覆盖基础创建、限制规则、变量系统、事件监听、周期任务、原版覆盖 6 大模块的五步闭环工作流。"
outline: deep
head:
  - - meta
    - name: author
      content: "F.windEmiko（狐风轩汐）"
  - - meta
    - name: keywords
      content: "Minecraft, 附魔, Aiyatsbus, fluxon, 自定义附魔, AI Skills, 附魔配置, 附魔脚本"
---

# ✨ 附魔配置工作流 · AI Skills 文档

## 一、概述

### 文档定位

本文档是一份**面向 AI 编码助手**（如 Claude Code、Trae、WorkBuddy、GitHub Copilot 等）的 Aiyatsbus 自定义附魔开发技能指南。其目的是将隐性的开发经验固化为可移植、可复用的显性知识文档。

> 当然，给人类用于学习研究与参考也是可以的啦

任何不熟悉 Aiyatsbus 的 AI 在阅读本文档后，应能**独立完成以下任务**：

- 创建基础附魔并注册到服务器
- 配置冲突/依赖/权限等限制规则
- 使用三种变量系统（leveled / ordinary / modifiable）
- 编写事件监听和周期任务脚本（fluxon）
- 覆盖原版附魔行为

### 技术栈总览

| 层级 | 技术 | 用途 |
|:----|:-----|:-----|
| 服务端 | Leaf（Paper 分支）26.1.2 | Minecraft 服务端核心 |
| 插件 | Aiyatsbus（最新版） | 自定义附魔系统 |
| 脚本引擎 | TabooLib fluxon | 附魔逻辑脚本语言 |
| 数据包 | MC Data Pack | 附魔占位符注册（提供给 loot table 解析器） |
| 在线工具 | TabooLib 脚本动作大全 | 295+ 脚本动作参考 |

### 服务器环境约束

本文档所有内容基于以下真实服务器环境：

| 项目 | 值 |
|:----|:----|
| 服务端 | Leaf（Paper 分支） |
| MC 版本 | 26.1.2（Java Edition） |
| 附魔配置目录 | `plugins/Aiyatsbus/enchants/{附魔包名}/`（按附魔包分类，如 `Packet-Default/`、`Stellarity/`、`Funpack/`） |
| 原版覆盖目录 | `plugins/Aiyatsbus/enchants/Packet-Vanilla/` |
| 核心配置 | `display.yml`、`rarity.yml`、`target.yml`、`group.yml`、`skill.yml`、`artifact.yml` |
| 附魔数量 | 237 个（含 3 个禁用），见附魔 ID 对照表 |
| 脚本语言 | **fluxon**（已完全替代 Kether，旧版 Kether 语法全部失效） |
| 品质体系 | 8 品质：普通 / 优良 / 稀有 / 史诗 / 传说 / 至宝 / 诅咒 / 幻化 |

### 与附魔 ID 对照表的关系

附魔 ID 对照表（`server_configs/enchantment_ids.md`）使用 Vue 组件 `<EnchantmentIdTable />` 动态渲染**全部 237 个附魔**的 ID / 名称 / 品质 / 等级。工作流文档**不重复**此表，在需要查询 ID 时引用该页面。

::: tip 官方文档
- **Aiyatsbus Wiki 主页**：<https://wiki.polarastrum.cc/plugin/aiyatsbus/>
- **附魔结构总览**：<https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/main>
- **基本元数据**：<https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/basic/>
- **可选元数据（alternative）**：<https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/basic/alternative>
- **限制配置（limitations）**：<https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/basic/limitations>
- **变量配置**：<https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/variables/main>
- **触发器配置**：<https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/trigger/main>
- **内建触发器（Java/Kotlin）**：<https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/trigger/builtin>
- **Q&A**：<https://wiki.polarastrum.cc/plugin/aiyatsbus/qa>

本页内容以服务器实际使用的源码与配置为准，官方 wiki 可作补充参考。
:::

## 二、前置知识

### Aiyatsbus 架构总览

```
附魔 yml（Packet-Default/xxx.yml）
  ├── basic → ID、名称、最大等级
  ├── rarity → 品质（控制颜色和权重）
  ├── targets → 适用装备（剑、斧、靴子等）
  ├── limitations → 冲突/依赖规则
  ├── display → 显示格式和描述
  ├── variables → 3 种变量（等级变量/常量/持久变量）
  ├── mechanisms → 行为逻辑（事件监听 + 周期任务）
  └── alternative → 原版附魔覆盖（可选）
```

### 目录结构

```
Aiyatsbus
└── enchants ······················· 附魔根目录
    ├── Packet-Default/ ············ 自定义附魔包（按附魔一个 yml）
    │   ├── wings.yml
    │   ├── aiming.yml
    │   └── ...
    ├── Packet-Vanilla/ ············ 原版附魔包（覆盖原版行为）
    │   ├── sharpness.yml
    │   └── ...
    ├── Stellarity/ ················ Stellarity 扩展附魔包
    ├── Funpack/ ··················· Funpack 整蛊附魔包
    ├── display.yml ················ 显示与排版（lore、合并、等级贴图）
    ├── rarity.yml ················· 品质定义（颜色、权重、头颅）
    ├── target.yml ················· 装备类型定义（物品白名单、槽位）
    ├── group.yml ·················· 附魔分组（用于冲突/依赖）
    ├── skill.yml ·················· 技能型附魔全局配置（冷却、触发器）
    └── artifact.yml ··············· 幻化粒子附魔配置
```

- 每个附魔是一个独立的 yml 文件，放在 `Packet-Default/` 或 `Packet-Vanilla/` 下。
- `Packet-Vanilla/` 下的附魔会覆盖原版同名附魔的行为，需在 `alternative.is-vanilla: true`。
- 5 个根配置文件控制全局行为，一般不需要改动。
- 可以创建任意名称的附魔包目录（如 `Stellarity/`、`Funpack/`），用于按来源分类管理附魔。Aiyatsbus 会递归加载 `enchants/` 下所有子目录中的 yml 文件。

### 核心配置文件简述

#### rarity.yml · 品质

定义所有品质及其展示属性。每个品质包含 `name`（中文名）、`color`（显示颜色，使用 MiniMessage 格式 `[{text}](c=#hex)`）、`weight`（战利品/附魔台权重，越大越常见）、`skull`（GUI 头颅纹理 Base64）。

```yaml
common:
  name: 普通
  color: '[{text}](c=#f8f4ed)'
  weight: 1000
  skull: eyJ0ZXh0dXJl...
uncommon:
  name: 优良
  color: '[{text}](c=#66c18c)'
  weight: 500
# ... 稀有 / 史诗 / 传说 / 至宝 / 诅咒 / 幻化
```

服务器实际品质：`common` 普通 · `uncommon` 优良 · `rare` 稀有 · `epic` 史诗 · `legendary` 传说 · `splendid` 至宝 · `curse` 诅咒 · `artifact` 幻化。附魔 yml 中 `rarity` 字段填**中文名**（如 `传说`）。

#### target.yml · 装备类型

定义附魔可应用的装备分类。每类包含 `max`（该类物品最大附魔词条数）、`name`（中文名）、`active-slots`（生效槽位，如 `HAND` / `OFF_HAND` / `HEAD` / `CHEST` / `LEGS` / `FEET`）、`types`（允许的 Bukkit Material 列表）。部分类别带 `dependencies.supports` 表示最低 Minecraft 版本。

```yaml
swords:
  max: 12
  name: 剑
  active-slots:
    - HAND
  types:
    - DIAMOND_SWORD
    - NETHERITE_SWORD
    # ...
```

附魔 yml 中 `targets` 字段填**中文名**（如 `剑`、`靴子`）。可用类别：剑 / 斧 / 矛 / 重锤 / 刷子 / 镐 / 铲 / 锄 / 弓 / 弩 / 三叉戟 / 头盔 / 胸甲 / 护腿 / 靴子 / 鞘翅 / 剪刀 / 盾牌 / 钓鱼竿 / 打火石 / 萝卜钓竿 / 头饰 / 可损坏物品 / 所有物品。

#### group.yml · 附魔分组

用于 `limitations` 中的 `CONFLICT_GROUP` / `DEPENDENCE_GROUP`。每个分组通过 `enchants`（附魔中文名列表）或 `rarities`（品质中文名列表）定义成员。

```yaml
原版增伤类附魔:
  enchants:
    - 锋利
    - 致密
    - 穿刺
    - 破甲
    - 亡灵杀手
    - 节肢杀手
可交易附魔:
  enchants: [ ... ]
  rarities:
    - 普通
    - 优良
    - 稀有
```

#### display.yml · 显示系统

控制附魔在物品 lore 上的展示方式。关键配置：

- `format.default_previous` / `default_subsequent`：全局默认的前部（名称+等级）与后部（描述）格式。
- `combine`：当物品附魔数量超过 `min` 时合并显示，`separate_special` 控制特殊显示的附魔是否独立成行。
- `sort.level` / `sort.rarity`：按等级或品质排序。
- `display-tags`：等级贴图，支持按品质或全局配置 1~10 的中文数字贴图。

等级显示有三种类型，通过 `default_previous` 中的占位符判定：

- `{enchant_display_roman}` — 罗马数字（默认）
- `{enchant_display_number}` — 阿拉伯数字
- `{enchant_display_tag}` — 自定义贴图

#### skill.yml · 技能型附魔

技能型附魔（如右击触发的主动技能）的全局配置：

```yaml
cooldown:
  enable: true
  name: "冷却"           # 附魔 variables 里定义的冷却变量名

trigger:
  action: RIGHT_CLICK    # RIGHT_CLICK / LEFT_CLICK / SWAP
  shift-needed: false    # 是否需要下蹲才能触发
  shift-ignored: true    # 下蹲时是否不触发

privilege:               # 冷却减免权限
  - "aiyatsbus.privilege.skill.cdrate.90:{cooldown}*0.9"
  - "aiyatsbus.privilege.skill.cdrate.80:{cooldown}*0.8"
```

#### artifact.yml · 幻化粒子

定义"幻化"品质附魔的粒子效果形态。支持 `CIRCLE`（环形）、`RNA`（双螺旋）、`SIMPLE`（简单）三种粒子形状，按装备槽位独立配置，并定义在破坏特定矿物时触发粒子。

## 三、开发环境搭建

### 配置目录结构

Aiyatsbus 附魔配置在 `plugins/Aiyatsbus/enchants/` 下。每个附魔一个独立 yml 文件。

```
plugins/Aiyatsbus/
└── enchants/
    └── Packet-Default/
        ├── wings.yml        # 反重力附魔
        ├── propulsion.yml   # 弹射附魔
        └── ...              # 一个附魔一个文件
```

### 控制台命令速查

```bash
# 重载附魔配置
/aiyatsbus reload

# 为玩家给予附魔书：/aiyatsbus give <玩家> <附魔ID> [等级]
/aiyatsbus give @p propulsion 1

# 为物品添加附魔（手持物品）
/aiyatsbus enchant propulsion 1

# 列出所有已加载附魔
/aiyatsbus list

# 调试模式
/aiyatsbus debug
```

### 验证与调试方法

1. **配置验证**：重载无红字报错即为基本 OK。常见错误：
   - `IndexOutOfBoundsException at Variables.kt:100` → leveled 变量缺少 `:` 分隔符
   - `FunctionNotFoundException: 函数名` → 使用了未注册的属性或函数（检查是否用了 `getXxx()` 形式或 `math::xxx` 命名空间）
2. **行为验证**：`/aiyatsbus give` 获取附魔书 → 在铁砧/附魔台测试
3. **脚本调试**：在脚本中加调试消息（暂不支持 fluxon 断点，建议用 `&event::setCancelled(false)` 隔离测试）
4. **日志查看**：`/plugins/Aiyatsbus/logs/` 或服务端 `logs/latest.log`
5. **属性验证**：遇到 `FunctionNotFoundException` 时，优先用 `grep` 搜索服务器上已工作的 yml 文件，确认正确的属性 key 名和函数语法

## 四、核心工作流

> **核心方法论**：每个功能模块均遵循「**概念 → 设计 → 编写 → 验证 → 部署**」五步闭环。AI 应按此流程逐模块推进。

### 模块 1：基础附魔创建

#### 概念

每个附魔由一个 yml 文件定义，包含基础元数据（ID、名称、等级、品质、适用装备）。附魔 yml 的完整顶层结构如下：

```yaml
basic:        # 基础信息
  enable: true
  disable_worlds: []
  id: my_enchant
  name: 我的附魔
  max_level: 3

rarity: 史诗            # 品质中文名

targets:                # 适用装备中文名列表
  - 剑
  - 斧

limitations:            # 限制规则
  - "CONFLICT_ENCHANT:锋利"
  - "CONFLICT_GROUP:原版增伤类附魔"

display:                # 显示
  format:
    previous: "{default_previous}"
    subsequent: "{default_subsequent}"
  description:
    general: "通用描述"
    specific: "&7详细描述，可用 &a{变量}"

variables:              # 变量
  leveled:
    伤害: "点:0.5*{level}+0.5"
  ordinary:
    黑名单: [ ZOMBIE, SKELETON ]
  modifiable:
    当前层数: current_stacks=0

mechanisms:             # 机制
  listeners:
    on-attack:
      listen: entity-damage-other
      handle: |-
        // fluxon 脚本
  tickers:
    on-tick:
      interval: 40
      handle: |-
        // 周期执行的脚本

alternative:            # 原版附魔替代（可选）
  is-vanilla: true
  is-cursed: false
  is-treasure: false
  grindstoneable: true
```

#### 设计

确定：

- 附魔 ID（英文蛇形，如 `flame_aspect`）
- 显示名称（中文）
- 最大等级
- 品质（从 8 品质中选择：普通 / 优良 / 稀有 / 史诗 / 传说 / 至宝 / 诅咒 / 幻化）
- 适用装备类型（从 `target.yml` 的中文名中选择）

#### 编写

##### basic · 基础信息

| 字段 | 类型 | 说明 |
|---|---|---|
| `enable` | bool | 是否启用该附魔 |
| `disable_worlds` | list | 禁用该附魔的世界名列表 |
| `id` | string | 附魔 ID（英文蛇形，用于命令/脚本引用） |
| `name` | string | 附魔中文名（玩家可见） |
| `max_level` | int | 最大等级（`max-level` 与 `max_level` 两种写法均可） |

##### rarity · 品质

填 `rarity.yml` 中定义的品质**中文名**，如 `普通` / `优良` / `稀有` / `史诗` / `传说` / `至宝` / `诅咒` / `幻化`。

##### targets · 适用装备

填 `target.yml` 中定义的装备类型**中文名**列表。一个附魔可适用于多种装备。

可用类别：剑 / 斧 / 矛 / 重锤 / 刷子 / 镐 / 铲 / 锄 / 弓 / 弩 / 三叉戟 / 头盔 / 胸甲 / 护腿 / 靴子 / 鞘翅 / 剪刀 / 盾牌 / 钓鱼竿 / 打火石 / 萝卜钓竿 / 头饰 / 可损坏物品 / 所有物品。

##### alternative · 可选覆盖（基础）

用于控制附魔的获取渠道。基础字段：

| 字段 | 默认值 | 说明 |
|---|---|---|
| `is-vanilla` | false | 是否为原版附魔（覆盖原版行为） |
| `is-cursed` | false | 是否为诅咒附魔 |
| `is-treasure` | false | 是否为宝藏附魔（仅宝箱/钓鱼获取，非附魔台） |
| `inaccessible` | false | 是否不可获得（true 时玩家无法通过任何渠道获取） |

> 完整 alternative 字段表见[模块 6：原版附魔覆盖](#模块-6原版附魔覆盖)。

#### 验证

```bash
/aiyatsbus reload
/aiyatsbus list                  # 确认附魔已加载
/aiyatsbus give @p sharpness 5   # 测试获取
```

#### 部署

yml 放入 `Packet-Default/`（自定义）或 `Packet-Vanilla/`（原版覆盖） → `/aiyatsbus reload`

---

### 模块 2：限制规则与显示

#### 概念

限制规则控制附魔的获取和使用条件；显示系统控制 lore 样式。两者共同决定附魔在实际游戏中的行为边界与玩家感知。

#### 设计

确定：

- 冲突规则（与其他附魔/分组互斥）
- 依赖规则（必须先有某些附魔）
- 权限要求
- PAPI 条件表达式
- 显示格式（前部/后部、描述）

#### 编写

##### limitations · 限制规则

限制规则在附魔获取（战利品/附魔台/村民交易/铁砧）或使用时检查。格式为 `TYPE:VALUE`，支持以下 10 种类型：

| 类型 | 值格式 | 检查场景 | 说明 |
|---|---|---|---|
| `CONFLICT_ENCHANT` | 附魔中文名 | 获取 | 与指定附魔冲突，无法共存 |
| `CONFLICT_GROUP` | 分组名 | 获取 | 与分组内所有附魔冲突 |
| `DEPENDENCE_ENCHANT` | 附魔中文名 | 获取 | 必须先有指定附魔才能获取 |
| `DEPENDENCE_GROUP` | 分组名 | 获取 | 必须先有分组内任一附魔 |
| `TARGET` | （自动） | 获取 | 目标装备限制（自动从 `targets` 推导） |
| `MAX_CAPABILITY` | （自动） | 获取 | 物品最大附魔数限制（自动） |
| `DISABLE_WORLD` | （自动） | 使用 | 禁用世界（自动从 `disable_worlds` 推导） |
| `SLOT` | （自动） | 使用 | 槽位限制（自动从 `targets.active-slots` 推导） |
| `PERMISSION` | 权限节点 | 使用 | 使用时需要指定权限 |
| `PAPI_EXPRESSION` | PAPI 表达式 | 使用 | 使用时需满足 PlaceholderAPI 表达式，如 `%player_level%>=30` |

::: tip 冲突的特殊值
`CONFLICT_ENCHANT:*` 表示与所有附魔冲突（独占附魔）。
:::

常用示例：

```yaml
limitations:
  - "CONFLICT_ENCHANT:经验修补"          # 与经验修补冲突
  - "CONFLICT_ENCHANT:自生"
  - "CONFLICT_GROUP:原版增伤类附魔"        # 与增伤类互斥
  - "DEPENDENCE_ENCHANT:无限"            # 必须先有无限附魔
```

##### display · 显示

控制附魔在物品 lore 上的展示。

- `format.previous` / `format.subsequent`：自定义前部/后部格式。留空或保持 `{default_previous}` / `{default_subsequent}` 则使用 `display.yml` 中的全局默认。
- `description.general`：通用描述（无变量时使用）。
- `description.specific`：详细描述（支持变量占位符 `{变量名}` 和颜色代码 `&a` 等）。若配置了 `specific`，则显示 `specific`，否则回退到 `general`。

可用的显示占位符：`{default_previous}`、`{default_subsequent}`、`{enchant_display_roman}`、`{enchant_display_number}`、`{enchant_display_tag}`、`{description}`、`{id}`、`{name}`、`{level}`、`{max_level}`、`{rarity}`、`{rarity_display}`，以及所有自定义 `variables`。

#### 验证

```bash
# 冲突测试：尝试给同一物品添加冲突附魔
/aiyatsbus enchant sharpness 5
/aiyatsbus enchant smite 5       # 应报冲突
```

---

### 模块 3：变量系统

#### 概念

三种变量：`leveled`（随等级变化）、`ordinary`（固定常量）、`modifiable`（持久存储）。变量可在 `display.description.specific` 和脚本中引用。

#### 设计

确定：

- 哪些数值随附魔等级变化 → `leveled`
- 哪些固定配置 → `ordinary`
- 哪些需要持久记录 → `modifiable`

#### 编写

##### leveled · 等级变量

随附魔等级变化的变量。两种写法：

**简写**（所有等级用同一公式，公式中 `{level}` 代表当前等级）：

```yaml
variables:
  leveled:
    伤害提高: "点:0.5*{level}+0.5"
    冷却: "秒:6"
    击杀累计: "只:4-{level}"
```

格式为 `变量名: "单位:公式"`：

- **单位**：自由文本，仅用于显示时拼接后缀（如 `点`、`秒`、`只`、`格`、`次`、`倍`、`%`），也可为空。
- **公式**：数学表达式，支持 `{level}` 占位符和 `{{其他变量名}}` 嵌套引用。

::: warning `:` 分隔符必填
leveled 变量值**必须**包含 `:` 分隔符，即使单位为空也要写 `:` 前缀。缺少 `:` 会导致 `IndexOutOfBoundsException at Variables.kt:100`，附魔加载失败。

```yaml
variables:
  leveled:
    # ✅ 正确写法
    重力减少: ":0.064"              # 单位为空，但仍需写 ":"
    暴击倍率: ":2.0"                # 单位为空
    速度等级: ":{level}-1"          # 单位为空，带公式
    冷却: "秒:6"                    # 有单位
    伤害提高: "点:0.5*{level}+0.5"  # 有单位 + 公式

    # ❌ 错误写法（会抛出 IndexOutOfBoundsException）
    # 重力减少: "0.064"
    # 暴击倍率: "2.0"
    # 速度等级: "{level}-1"
```
:::

**分级写法**（不同等级区间用不同值，取 ≤ 当前等级的最大配置）：

```yaml
variables:
  leveled:
    最大高度:
      1: 16
      2: 48
      3: 256
      unit: 格
```

##### ordinary · 常量

不参与计算的固定配置项，常用于脚本中引用的列表、开关、映射等。

```yaml
variables:
  ordinary:
    黑名单:
      - ALLAY
      - VILLAGER
      - WOLF
    作物:
      WHEAT_SEEDS: WHEAT
      CARROT: CARROTS
```

##### modifiable · 可修改变量

与物品绑定的持久化数据，存储在物品 PDC（或 NBT）中，可在脚本中读写。格式为 `变量名: 存储键=初始值`。

```yaml
variables:
  modifiable:
    当前累计: test_current_total=0
    是否充能完毕: can_discharge=充能中
```

::: tip 存储键
存储键以 `(NBT)` 开头时走 NBT 路径，否则走 PDC（PersistentDataContainer）。一般用 PDC 即可。
:::

#### 验证

```bash
/aiyatsbus give @p accumulating 2   # 获取用变量的附魔
# 实战测试：击杀怪物，观察累计值变化
```

---

### 模块 4：事件监听（listeners）

#### 概念

当指定事件发生时执行 fluxon 脚本。适用于攻击增伤、击杀计数、防御触发等。

#### 设计

确定：

- 触发事件（从 16 个事件中选择）
- 脚本逻辑（增伤、给予效果、调用冷却等）

#### 编写

##### listener 结构

每个 listener 包含：

- `listen`：事件标识符（见下方事件列表）。
- `handle`：执行的 fluxon 脚本。

```yaml
mechanisms:
  listeners:
    on-attack:
      listen: entity-damage-other
      handle: |-
        damage = &event::damage()
        &event::setDamage(&damage * 1.5)
```

##### 16 个事件标识完整表

| 事件标识 | 对应 Bukkit 事件 | 触发时机 |
|---|---|---|
| `block-break` | BlockBreakEvent | 方块被破坏 |
| `block-damage` | BlockDamageEvent | 玩家开始破坏方块 |
| `player-interact` | PlayerInteractEvent | 玩家交互（右键/左键方块/空气） |
| `player-toggle-sneak` | PlayerToggleSneakEvent | 玩家切换下蹲状态 |
| `player-move` | PlayerMoveEvent | 玩家移动 |
| `player-item-damage` | PlayerItemDamageEvent | 物品耐久减少 |
| `entity-damage` | EntityDamageEvent | 实体受到伤害 |
| `entity-damage-other` | EntityDamageByEntityEvent | 实体被其他实体伤害（攻击者视角） |
| `entity-damaged-by-other` | EntityDamageByEntityEvent | 实体被其他实体伤害（受害者视角） |
| `entity-death` | EntityDeathEvent | 实体死亡 |
| `entity-shoot-bow` | EntityShootBowEvent | 射箭 |
| `entity-target-living-entity` | EntityTargetLivingEntityEvent | 实体选择目标 |
| `projectile-hit` | ProjectileHitEvent | 抛射物命中 |
| `aiyatsbus-bow-charge-prepare` | AiyatsbusBowChargeEvent.Prepare | 弓开始蓄力 |
| `aiyatsbus-bow-charge-released` | AiyatsbusBowChargeEvent.Released | 弓蓄力释放 |
| `aiyatsbus-bow-charge-break` | AiyatsbusBowChargeEvent.Break | 弓蓄力中断 |

::: tip 攻击者 vs 受害者
`entity-damage-other` 在**攻击者**持有附魔物品时触发；`entity-damaged-by-other` 在**受害者**穿着附甲时触发。两者对应同一 Bukkit 事件，区别在视角。
:::

##### 冷却系统

在 fluxon 脚本中使用冷却：

```text
cooldown::isReady(&player, &enchant, &冷却)   // 冷却是否就绪
cooldown::addCooldown(&player, &enchant)      // 添加冷却（时长取 &冷却 变量值）
```

> 冷却时长需要在 `variables.leveled` 中定义一个变量（如 `冷却: 秒:6`），然后 `addCooldown` 会自动读取该变量的值。

#### 验证

- 装备附魔 → 触发事件（攻击/击杀/交互等） → 观察效果
- 测试冷却是否正常

---

### 模块 5：周期任务（tickers）

#### 概念

按固定间隔（tick）周期执行脚本，适用于需要持续检查状态的附魔（如飞行、耐久消耗、光环效果）。

#### 设计

确定：

- 执行间隔
- 三阶段处理逻辑（装备时 / 持续中 / 卸下时）

#### 编写

每个 ticker 包含：

- `type`：脚本类型，固定为 `fluxon`（可省略）。
- `interval`：执行间隔（tick），默认 20（1 秒）。
- `pre-handle`：**预处理**脚本，在该玩家首次满足触发条件（装备了带此附魔的物品）时执行一次。常用于**保存原值**（如原 baseMovementSpeed）到 player metadata。
- `handle`：**主处理**脚本，每个 `interval` 周期执行。常用于**持续应用效果**（如持续设置目标属性值、刷新药水效果）。
- `post-handle`：**后处理**脚本，在该玩家不再持有任何带此附魔的物品时执行一次。常用于**恢复原值**（如从 metadata 读取并恢复原属性值）。

::: warning ticker 状态管理
ticker 修改的属性**不会自动恢复**。必须在 `pre-handle` 中保存原值，在 `post-handle` 中恢复，否则会导致属性残留：

```text
pre-handle: |-
  // 保存原值
  original = &player::baseMovementSpeed()
  &player::setMeta("ench_original", string(&original))
handle: |-
  // 持续应用目标值
  &player::setBaseMovementSpeed(目标值)
post-handle: |-
  // 恢复原值
  original = double(&player::getMeta("ench_original") ?: "0.1")
  &player::setBaseMovementSpeed(&original)
  &player::removeMeta("ench_original")
```

**玩家退出游戏时 `post-handle` 不会被调用**，但 Player 对象会被销毁，属性重置为默认值，无持久性问题。重新登录时 `pre-handle` 会重新执行。
:::

ticker 脚本中可用变量：`&player`、`&item`、`&level`、`&triggerSlot` 等。

```yaml
mechanisms:
  tickers:
    flight:
      type: fluxon
      interval: 40
      pre-handle: |-
        // 玩家装备时执行一次
        &player::setAllowFlight(true)
      handle: |-
        // 每 2 秒执行
        if &player::isFlying() then {
            &item::setDurability(&item::durability() + 1)
        }
      post-handle: |-
        // 玩家卸下时执行一次
        &player::setAllowFlight(false)
```

#### 验证

- 装备附魔 → 效果立即生效（`pre-handle`）
- 保持装备，每间隔观察效果持续（`handle`）
- 卸下附魔 → 效果终止（`post-handle`）

---

### 模块 6：原版附魔覆盖

#### 概念

通过 `alternative.is-vanilla: true` 覆盖 Minecraft 原版附魔的行为，控制其获取渠道。

#### 设计

选中要覆盖的原版附魔（ID 需与原版一致，如 `sharpness`），通过 alternative 字段精细控制获取途径。

#### 编写

##### alternative 全部字段

| 字段 | 默认值 | 说明 |
|---|---|---|
| `is-vanilla` | false | 是否为原版附魔（覆盖原版行为） |
| `is-cursed` | false | 是否为诅咒附魔 |
| `is-treasure` | false | 是否为宝藏附魔（仅宝箱/钓鱼获取，非附魔台） |
| `grindstoneable` | true | 是否可通过砂轮移除 |
| `is-tradeable` | true | 是否可通过村民交易获得 |
| `is-discoverable` | true | 是否可通过附魔台发现 |
| `weight` | 100 | 附魔权重，影响获取概率 |
| `trade-max-level` | -1 | 交易最大等级限制（-1 无限制） |
| `enchant-max-level` | -1 | 附魔台最大等级限制 |
| `loot-max-level` | -1 | 战利品最大等级限制 |
| `inaccessible` | false | 是否不可获得（true 时玩家无法通过任何渠道获取） |

原版附魔覆盖示例：

```yaml
basic:
  id: sharpness
  name: 锋利
  max-level: 5
alternative:
  is-vanilla: true
rarity: 优良
```

#### 验证

```bash
/aiyatsbus reload
/aiyatsbus give @p sharpness 5    # 获取附魔书测试
/aiyatsbus list                   # 确认附魔已加载
```

---

## 五、使用流程

### AI 使用流程

当用户提出附魔开发请求时，AI 应按以下流程执行：

```
第 1 步：阅读概述与前置知识
  → 确认命名空间、版本、环境约束
  → 了解 Aiyatsbus 架构与目录结构

第 2 步：匹配功能模块
  → 基础附魔创建 → 模块 1
  → 冲突/依赖规则 → 模块 2
  → 变量系统 → 模块 3
  → 事件触发脚本 → 模块 4
  → 持续状态检查 → 模块 5
  → 原版附魔覆盖 → 模块 6

第 3 步：五步闭环执行
  → 概念理解 → 设计方案 → 编写代码 → 验证命令 → 部署说明

第 4 步：交付输出
  → 提供可直接复制的 yml 文件
  → 附带验证命令
  → 标注需要手动操作的步骤
```

### 本文档覆盖范围声明

| 能力 | 覆盖 | 不覆盖 |
|------|------|--------|
| 基础附魔创建 | ✅ 完整 yml 结构 | — |
| 限制规则 | ✅ 全部 10 种类型 | — |
| 变量系统 | ✅ leveled / ordinary / modifiable | — |
| 事件监听 | ✅ 全部 16 个事件 + fluxon 脚本 | Java/Kotlin 内建触发器 |
| 周期任务 | ✅ tickers 三阶段处理 | — |
| 原版覆盖 | ✅ alternative 全部字段 | — |
| fluxon 脚本 | ✅ 常用 API + 上下文变量 | 高级异步/协程 |
| 品质/装备配置 | ✅ 8 品质 + 全部装备类型 | — |

### 输出格式与交付标准

AI 的输出应满足：

1. **可操作**：每个 yml 代码块可直接复制使用，占位符需明确标注
2. **完整**：包含文件名注释（如 `# plugins/Aiyatsbus/enchants/Packet-Default/my_enchant.yml`）
3. **可验证**：每个模块附带验证命令
4. **有上下文**：说明字段之间的依赖关系
5. **代码格式**：YAML 代码块标注 `yaml`，fluxon 代码块标注 `text`

## 六、命名/路径/命令规范

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 附魔 ID | 英文蛇形（snake_case） | `flame_aspect`、`jelly_legs` |
| 附魔名称 | 中文（玩家可见） | 锋利、弹射、缓震 |
| 附魔文件名 | `{id}.yml` | `sharpness.yml`、`propulsion.yml` |
| 品质值 | 中文名 | `传说`（不是 `legendary`） |
| 装备类型 | 中文名 | `剑`（不是 `swords`） |
| 变量名 | 中文（脚本中用 `&变量名` 引用） | `伤害提高`、`冷却` |

### 路径规范

| 场景 | 路径 |
|------|------|
| 自定义附魔 | `plugins/Aiyatsbus/enchants/Packet-Default/{id}.yml` |
| 原版覆盖 | `plugins/Aiyatsbus/enchants/Packet-Vanilla/{id}.yml` |
| 核心配置 | `plugins/Aiyatsbus/enchants/` 根目录下的 yml |

### 命令规范

| 操作 | 命令 |
|------|------|
| 重载配置 | `/aiyatsbus reload` |
| 给予附魔书 | `/aiyatsbus give <玩家> <附魔ID> [等级]` |
| 手持物品附魔 | `/aiyatsbus enchant <附魔ID> <等级>` |
| 列出附魔 | `/aiyatsbus list` |
| 调试模式 | `/aiyatsbus debug` |

## 七、常见陷阱提醒

| # | 陷阱 | 说明 |
|:-|:-----|:-----|
| 1 | ❌ 使用 Kether 语法 | 服务器已完全切换到 fluxon，所有 Kether 示例（`add-potion-effect`、`set ... to` 等）均已失效 |
| 2 | ❌ 附魔 yml 中 `rarity` 写英文 | 必须写品质中文名（如 `传说`，不是 `legendary`） |
| 3 | ❌ `targets` 写英文装备类 | 必须写中文名（如 `剑`，不是 `swords`） |
| 4 | ❌ 在文档中重复附魔 ID 对照表 | 引用 `enchantment_ids.md` 的 Vue 组件即可 |
| 5 | ❌ 删除 `alternative` 节 | 即使只做自定义附魔，alternative 字段（如 `is-treasure`）控制获取渠道，不可省略 |
| 6 | ❌ 忘记在脚本中加 `&` 前缀 | fluxon 变量全部用 `&` 前缀，如 `&player`、`&冷却` |
| 7 | ❌ tickers 中忘记 post-handle | 卸下附魔时不清理状态会导致飞行/无敌等效果残留 |
| 8 | ❌ leveled 变量缺少 `:` 分隔符 | 即使单位为空也要写 `:` 前缀（如 `":0.064"`），否则 `IndexOutOfBoundsException at Variables.kt:100` |
| 9 | ❌ 使用 `getXxx()` 形式调用属性 | fluxon 属性 key 名是去掉 `get` 前缀的名称（如 `cause()` 而非 `getCause()`，`action()` 而非 `getAction()`），使用 `getXxx()` 会抛 `FunctionNotFoundException` |
| 10 | ❌ 使用 `math::random()` | fluxon 没有 `math` 命名空间，应使用 `random(最小, 最大)` |
| 11 | ❌ 使用未注册的 Java 方法 | `&player::getGravity()`/`setGravity()`/`walkSpeed()` 等方法未注册，使用前必须确认属性已注册（见附录 D/E） |
| 12 | ❌ 误用 `.` 成员访问 | Aiyatsbus 未启用 `allowReflectionAccess`，`.` 运算符无效，必须使用 `::` 上下文调用 |
| 13 | ❌ 使用 `&event::getFrom()` / `getTo()` | player-move 事件无 PropertyPlayerMoveEvent 注册，应使用 `&event::player::getLocation()` 或 ticker 方案 |

## 八、未覆盖问题的处理策略

当遇到本文档未覆盖的问题时，AI 应：

1. **查阅官方文档**：优先访问 [Aiyatsbus Wiki](https://wiki.polarastrum.cc/plugin/aiyatsbus/) 和 [TabooLib 脚本动作大全](https://taboolib.hhhhhy.kim/kether-list)
2. **参考现有附魔**：`enchants/` 下所有附魔包（`Packet-Default/`、`Packet-Vanilla/`、`Stellarity/` 等）中的现有附魔是最佳参考。遇到不确定的属性或函数时，用 `grep` 搜索服务器上已工作的 yml 文件，确认正确的语法和属性 key 名
3. **增量验证**：每完成一个模块配置后即用 `/aiyatsbus reload` 验证，不要等全部写完再测试
4. **保守提示**：对于文档未明确覆盖的功能，向用户说明不确定性，并给出最佳实践建议

---

## 附录 A：fluxon 脚本参考

### 语言简介

附魔的 `mechanisms.listeners.handle` 和 `tickers.handle` 等字段使用 **fluxon** 脚本语言编写逻辑。

::: warning 关于 Kether
服务器**已完全切换到 fluxon 脚本语言，不再使用 Kether**。旧版文档中基于 Kether 的示例（`add-potion-effect`、`set ... to`、`&event[block.world]`、`tell "..."` 等语法）均已**失效**，请勿参考。本页所有示例均为 fluxon 语法。
:::

fluxon 是 Aiyatsbus 自研的脚本语言，语法风格类似 Kotlin 与 JavaScript 的混合体：

- **变量声明**：`名称 = 值`（无需关键字）
- **方法调用**：用 `::` 访问对象方法（上下文调用运算符），如 `&player::setVelocity(...)`。**注意**：`::` 右侧必须是已注册的属性或扩展函数，否则抛出 `FunctionNotFoundException`。详见[附录 C](#附录-c-fluxon-函数调用机制与属性访问规则)
- **变量引用**：用 `&` 前缀引用上下文变量和自定义变量，如 `&level`、`&冷却`
- **控制流**：`if ... then { ... }`、`for x in ... then { ... }`
- **闭包**：`|| { ... }`（用于 `submit()::run(...)` 等异步任务）
- **内置函数**：`int()`、`double()`、`string()`、`min()`、`max()`、`random()`、`vector()` 等

### 内置上下文变量

脚本中可直接使用的上下文变量（用 `&` 前缀引用）：

| 变量 | 含义 | 适用场景 |
|---|---|---|
| `&player` | 触发附魔的玩家 | listeners / tickers |
| `&item` | 带有该附魔的物品 | listeners / tickers |
| `&level` | 当前附魔等级 | listeners / tickers |
| `&enchant` | 附魔对象本身 | listeners / tickers |
| `&event` | 当前事件对象 | 仅 listeners |
| `&triggerSlot` | 触发槽位（HAND/OFF_HAND 等） | listeners / tickers |
| `&maxLevel` | 附魔最大等级 | listeners / tickers |

::: tip ticker 中的 modifiable 变量引用
在 ticker 脚本中，`modifiable` 变量可以像 `leveled` 变量一样直接用 `&变量名` 引用，无需调用 `variables::modifiable()` 函数：

```yaml
variables:
  modifiable:
    上次X: last_x=0
    上次Y: last_y=0
mechanisms:
  tickers:
    check:
      handle: |-
        // ✅ 直接引用
        curX = &player::getLocation()::blockX()
        lastX = int(&上次X)
        &上次X = string(&curX)    // 直接写入
```

但**在 listeners 中**，由于 `&item` 上下文变量可能与触发物品不同，建议使用 `variables::modifiable()` 函数形式以确保正确读写。
:::

### 自定义变量引用

在 `variables` 中定义的变量，在脚本中用 `&变量名` 引用：

```yaml
variables:
  leveled:
    冷却: 秒:6
    伤害提高: 点:0.5*{level}+0.5
  modifiable:
    当前累计: test_current_total=0
```

```text
// 脚本中引用
if &total >= &击杀累计 then { ... }      // 引用 leveled 变量
variables::modifiable(&enchant, &item, "当前累计", 0)  // 读写 modifiable 变量
```

### 常用 API

```text
// 事件操作（listeners 中）
// ⚠️ 注意：属性 key 名是去掉 get 前缀的形式
//   ✅ cause() / action() / entity() / damage()
//   ❌ getCause() / getAction() / getEntity() / getDamage() → FunctionNotFoundException
&event::damage()                      // 获取伤害值
&event::setDamage(新伤害)              // 修改伤害值
&event::setCancelled(true)            // 取消事件
&event::cause()                       // 获取伤害原因（FALL/FIRE 等）
&event::entity()                      // 获取受害实体
&event::projectile()                  // 获取抛射物（射箭事件）
&event::action()                      // 获取交互动作（RIGHT_CLICK_BLOCK 等）
&event::clickedBlock                  // 获取点击的方块（属性访问，不带括号）

// 玩家操作
&player::setVelocity(vector(0, 1, 0)) // 设置速度
&player::setAllowFlight(true)         // 允许飞行
&player::isOnGround()                 // 是否在地面
&player::isSneaking()                 // 是否下蹲
&player::gameMode()                   // 游戏模式
&player::location()                   // 位置
&player::getNearbyEntities(x, y, z)   // 附近实体
&player::setMeta("key", "value")      // 设置临时元数据
&player::hasMeta("key")               // 检查元数据
&player::removeMeta("key")            // 移除元数据
&player::addPotionEffect(...)         // 添加药水效果

// 物品操作
&item::durability()                   // 当前耐久
&item::setDurability(值)               // 设置耐久
&item::isUnbreakable()                // 是否不可破坏
&item::type()                         // 物品类型

// 实体操作
&entity::setVelocity(...)
&entity::damage(伤害, 攻击者)
&entity::addPotionEffect(实体, "SLOWNESS", 持续时间, 等级)
&entity::removePotionEffect(实体, "SLOWNESS")
&entity::isDead()

// 冷却系统
cooldown::isReady(&player, &enchant, &冷却)   // 冷却是否就绪
cooldown::addCooldown(&player, &enchant)      // 添加冷却（时长取 &冷却 变量值）

// 可修改变量读写
variables::modifiable(&enchant, &item, "变量名")              // 读取
variables::setModifiable(&enchant, &item, "变量名", 新值)      // 写入

// 异步周期任务
submit()::delay(延迟tick)::run(|| { ... })                      // 延迟执行
submit()::period(间隔tick)::on(对象)::run(|| { ... })           // 周期执行
// 在闭包内可用 &it::cancel() 取消任务

// 类型转换
int(值)      // 转整数
double(值)   // 转小数
string(值)   // 转字符串
float(值)    // 转单精度

// 数学（⚠️ fluxon 无 math 命名空间，不要使用 math::xxx）
min(a, b) / max(a, b) / pow(a, b) / random(最小, 最大) / abs(值)
// ✅ random(0.0, 100.0)  → 返回 [0.0, 100.0) 的随机浮点数
// ❌ math::random(0.0, 100.0)  → FunctionNotFoundException: math

// 向量
vector(x, y, z)                      // 创建向量
&vec::normalize() / &vec::multiply(n) / &vec::add(vec) / &vec::length()

// 守卫检查（伤害前合法性校验）
guard::canDamage(&player, &entity)   // 是否可以伤害目标
guard::canBreak(&player, &location)  // 是否可以破坏方块
```

### TabooLib 脚本动作大全

- **TabooLib 脚本动作大全**：<https://taboolib.hhhhhy.kim/kether-list>
  （含 Aiyatsbus 提供的 295 个动作，按类别分类：世界与坐标、实体控制、物品管理、药水效果、视觉特效等）

::: tip 关于脚本动作大全
该站点虽名为 "Kether Explorer"，但实际收录了 Aiyatsbus 在 TabooLib 框架上注册的所有脚本动作，可按"提供者 = Aiyatsbus"筛选查看。fluxon 复用这些动作的底层实现。
:::

---

## 附录 C：fluxon 函数调用机制与属性访问规则

### `::` 上下文调用运算符

fluxon 中 `::` 是**上下文调用运算符**，用于调用注册在属性系统中的扩展函数。其工作机制：

1. 将 `::` 左侧的表达式设为 `Environment.target`
2. 在 `::` 右侧查找与 target 类型匹配的扩展函数
3. **若找不到匹配的扩展函数，抛出 `FunctionNotFoundError`**

```text
// ✅ player 是 Player 类型，PropertyPlayer 注册了 location 扩展函数
&player::location()

// ✅ event 是 EntityDamageEvent，PropertyEntityDamageEvent 注册了 cause 扩展函数
&event::cause()

// ❌ PropertyPlayer 未注册 getGravity 扩展函数 → FunctionNotFoundError
&player::getGravity()
```

### `.` 成员访问运算符（已禁用）

fluxon 中 `.` 是**反射式成员访问运算符**，可以直接访问 Java 方法。但 Aiyatsbus 未启用 `allowReflectionAccess` 配置，因此 `.` 运算符**完全无效**。

```text
// ❌ 以下写法在 Aiyatsbus 中均无效
&player.getLocation()
&event.getCause()
&item.getType()
```

### 属性 key 名规则

fluxon 属性系统通过 `AiyatsbusProperty` 注解注册扩展函数。属性 key 名**通常不是** Java getter 方法名：

| Java 方法 | 属性 key 名 | 说明 |
|----------|------------|------|
| `getCause()` | `cause` | 去掉 `get` 前缀，首字母小写 |
| `getAction()` | `action` | 去掉 `get` 前缀，首字母小写 |
| `getEntity()` | `entity` | 去掉 `get` 前缀，首字母小写 |
| `getDamage()` | `damage` | 去掉 `get` 前缀，首字母小写 |
| `hasGravity()` | `gravity` | boolean 属性，去掉 `has` 前缀 |
| `isSneaking()` | `isSneaking` / `sneaking` | 保留 `is` 前缀或去掉 |
| `getLocation()` | `location` / `loc` | 别名 |

**最佳实践**：使用属性前先查阅 [附录 D：可用属性全集](#附录-d-可用属性全集) 或服务器源码 `PropertyXxx.kt` 文件，确认属性 key 名已注册。

### 编译期 vs 运行时错误

- **FunctionNotFoundException**（编译期）：`Parser.resolvePendingCalls` 阶段抛出，附魔加载失败，日志显示完整堆栈
- **FunctionNotFoundError**（运行时）：脚本执行时抛出，附魔已加载但运行时报错

两者都表示函数未注册，修复方式相同：改用已注册的属性 key 名或扩展函数。

### 命名空间函数

fluxon 内置函数无命名空间前缀（如 `random()`、`int()`、`max()`）。**不要**使用 `math::xxx`、`util::xxx` 等命名空间形式，除非该命名空间确实注册（如 `cooldown::`、`variables::`、`guard::` 是 Aiyatsbus 注册的函数库）。

```text
// ✅ 正确
random(0.0, 100.0)
int(&变量)
cooldown::isReady(&player, &enchant, &冷却)

// ❌ 错误
math::random(0.0, 100.0)    // FunctionNotFoundException: math
math::floor(1.5)            // FunctionNotFoundException: math
```

---

## 附录 D：可用属性全集

> 以下属性均通过 `AiyatsbusProperty` 注解注册，可用 `::` 上下文调用运算符访问。

### Player 属性（PropertyPlayer + 继承）

| 属性 key | 类型 | 读写 | 说明 |
|---------|------|------|------|
| `name` | String | 读 | 玩家名 |
| `level` | int | 读 | 等级 |
| `exp` | float | 读 | 经验 |
| `gameMode` / `game-mode` | GameMode | 读+写 | 游戏模式 |
| `flySpeed` / `fly-speed` | float | 读+写 | 飞行速度 |
| `walkSpeed` / `walk-speed` | float | 读+写 | 行走速度 |
| `allowFlight` / `allow-flight` | boolean | 读+写 | 是否允许飞行 |
| `isFlying` / `flying` | boolean | 读+写 | 是否在飞行 |
| `isSneaking` / `sneaking` | boolean | 读 | 是否下蹲 |
| `isSprinting` / `sprinting` | boolean | 读 | 是否冲刺 |
| `isGliding` / `gliding` | boolean | 读 | 是否滑翔 |
| `isOnline` / `online` | boolean | 读 | 是否在线 |
| `isOp` / `op` | boolean | 读 | 是否是 OP |
| `bedSpawnLocation` | Location | 读 | 床的出生点 |
| `eyeLocation` | Location | 读 | 眼睛位置 |
| `compassTarget` | Location | 读+写 | 指南针目标 |

### LivingEntity 属性（PropertyLivingEntity + 继承）

| 属性 key | 类型 | 读写 | 说明 |
|---------|------|------|------|
| `health` | double | 读+写 | 当前生命值 |
| `maxHealth` / `max-health` | double | 读+写 | 最大生命值 |
| `lastDamage` / `last-damage` | double | 读 | 上次受伤伤害值 |
| `noDamageTicks` / `no-damage-ticks` | int | 读+写 | 无敌帧 tick |
| `killer` | Player | 读 | 击杀者 |
| `equipment` | EntityEquipment | 读 | 装备 |
| `boots` / `chestplate` / `helmet` / `leggings` | ItemStack | 读+写 | 各槽位装备 |

### Entity 属性（PropertyEntity + 继承）

| 属性 key | 类型 | 读写 | 说明 |
|---------|------|------|------|
| `location` / `loc` | Location | 读 | 位置 |
| `velocity` | Vector | 读+写 | 速度向量 |
| `world` | World | 读 | 所在世界 |
| `fallDistance` / `fall-distance` | float | 读+写 | 摔落距离 |
| `fireTicks` / `fire-ticks` | int | 读+写 | 燃烧 tick |
| `freezeTicks` / `freeze-ticks` | int | 读+写 | 冰冻 tick |
| `isOnGround` / `on-ground` | boolean | 读 | 是否在地面 |
| `isInWater` / `in-water` | boolean | 读 | 是否在水中 |
| `isDead` / `dead` | boolean | 读 | 是否已死亡 |
| `gravity` | boolean | 读+写 | **注意：是 hasGravity 的 boolean 开关，不是重力数值** |
| `passengers` | List | 读 | 乘客 |
| `vehicle` | Entity | 读 | 载具 |
| `ticksLived` / `ticks-lived` | int | 读+写 | 存活 tick |
| `uniqueId` / `uuid` | String | 读 | UUID |

::: warning gravity 属性陷阱
`&player::gravity()` 返回的是 **boolean**（`hasGravity()`），不是重力数值。`&player::setGravity(true/false)` 设置的是是否受重力影响，**不是设置重力数值**。MC 1.20.x 无 `GENERIC_GRAVITY` 属性（1.21+ 才有），因此**无法通过 fluxon 直接修改重力数值**。
:::

### Attributable 属性（PropertyAttributable，玩家/生物实体均可用）

> 以下属性直接对应 Bukkit Attribute，通过修改 baseValue 实现属性增减。

| 属性 key | 对应 Attribute | 类型 | 读写 | 说明 |
|---------|----------------|------|------|------|
| `baseArmor` / `base-armor` | GENERIC_ARMOR | double | 读+写 | 基础护甲值 |
| `baseArmorToughness` / `base-armor-toughness` | GENERIC_ARMOR_TOUGHNESS | double | 读+写 | 基础护甲韧性 |
| `baseMovementSpeed` / `base-movement-speed` / `base-speed` | GENERIC_MOVEMENT_SPEED | double | 读+写 | 基础移动速度 |
| `baseFlyingSpeed` / `base-flying-speed` | GENERIC_FLYING_SPEED | double | 读+写 | 基础飞行速度（鞘翅） |
| `baseAttackDamage` / `base-attack-damage` | GENERIC_ATTACK_DAMAGE | double | 读+写 | 基础攻击伤害 |
| `baseAttackSpeed` / `base-attack-speed` | GENERIC_ATTACK_SPEED | double | 读+写 | 基础攻击速度 |
| `baseMaxHealth` / `base-max-health` | GENERIC_MAX_HEALTH | double | 读+写 | 基础最大生命值 |
| `baseKnockbackResistance` / `base-knockback-resistance` | GENERIC_KNOCKBACK_RESISTANCE | double | 读+写 | 基础击退抗性 |
| `baseLuck` / `base-luck` | GENERIC_LUCK | double | 读+写 | 基础幸运 |
| `armor` | GENERIC_ARMOR | double | 只读 | 最终护甲值（含修饰符） |
| `movementSpeed` / `speed` | GENERIC_MOVEMENT_SPEED | double | 只读 | 最终移动速度 |
| `flyingSpeed` | GENERIC_FLYING_SPEED | double | 只读 | 最终飞行速度 |

::: tip 属性修改最佳实践
使用 `pre-handle` 保存原值到 player metadata，`handle` 持续设置目标值，`post-handle` 恢复原值：

```text
pre-handle: |-
  original = &player::baseMovementSpeed()
  &player::setMeta("ench_original_speed", string(&original))
handle: |-
  &player::setBaseMovementSpeed(0.1 + 0.03 * &level)
post-handle: |-
  original = double(&player::getMeta("ench_original_speed") ?: "0.1")
  &player::setBaseMovementSpeed(&original)
  &player::removeMeta("ench_original_speed")
```

**不要**使用 `&player::getAttribute(GENERIC_ARMOR)` 或 `&player::walkSpeed()` 等 Java 方法调用形式，fluxon 未注册这些方法。应使用 `baseArmor` / `walkSpeed` 等属性 key 名。
:::

### ItemStack 属性（PropertyItemStack）

| 属性 key | 类型 | 读写 | 说明 |
|---------|------|------|------|
| `type` / `material` / `mat` | Material | 读+写 | 物品类型 |
| `amount` | int | 读+写 | 数量 |
| `durability` | int | 读+写 | 耐久度 |
| `maxDurability` / `max-durability` | int | 读 | 最大耐久度 |
| `unbreakable` | boolean | 读+写 | 是否不可破坏 |
| `itemMeta` / `item-meta` | ItemMeta | 读+写 | 物品元数据 |
| `enchantments` | Map | 读 | 附魔列表 |

### Block 属性（PropertyBlock）

| 属性 key | 类型 | 读写 | 说明 |
|---------|------|------|------|
| `type` / `material` / `mat` | Material | 读+写 | 方块类型（写时接受 Material 名字符串） |
| `location` / `loc` | Location | 读 | 位置 |
| `world` | World | 读 | 所在世界 |
| `x` / `y` / `z` | int | 读 | 坐标 |
| `blockData` / `block-data` | BlockData | 读+写 | 方块数据 |
| `isLiquid` / `liquid` | boolean | 读 | 是否液体 |
| `isEmpty` / `empty` | boolean | 读 | 是否空气 |

::: tip 方块类型修改
`type` 属性写入时接受 Material 名字符串：

```text
block = &player::getLocation()::subtract(0, 1, 0)::getBlock()
&block::type("AIR")       // 设为空气
&block::type("WATER")     // 设为水源
&block::type("STONE")     // 设为石头
```
:::

### Location 属性（PropertyLocation）

| 属性 key | 类型 | 读写 | 说明 |
|---------|------|------|------|
| `x` / `y` / `z` | double | 读+写 | 坐标 |
| `blockX` / `blockY` / `blockZ` | int | 读 | 方块坐标 |
| `yaw` / `pitch` | float | 读+写 | 朝向 |
| `world` | World | 读 | 所在世界 |
| `block` | Block | 读 | 对应方块 |
| `clone` | Location | 读 | 副本 |
| `direction` | Vector | 读 | 方向向量 |

### World 属性（PropertyWorld）

| 属性 key | 类型 | 读写 | 说明 |
|---------|------|------|------|
| `name` | String | 读 | 世界名 |
| `time` | long | 读+写 | 时间 |
| `fullTime` / `full-time` | long | 读 | 完整时间 |
| `isDay` / `day` | boolean | 读 | 是否白天 |
| `isNight` / `night` | boolean | 读 | 是否夜晚 |
| `weather` | String | 读+写 | 天气 |
| `difficulty` | String | 读+写 | 难度 |

### 常用事件属性

#### EntityDamageEvent

| 属性 key | 类型 | 读写 | 说明 |
|---------|------|------|------|
| `damage` | double | 读+写 | 伤害值 |
| `finalDamage` / `final-damage` | double | 读 | 最终伤害 |
| `cause` | String | 读 | 伤害原因（FALL/FIRE/LAVA 等） |
| `entity` | Entity | 读 | 受害实体 |

#### PlayerInteractEvent

| 属性 key | 类型 | 读写 | 说明 |
|---------|------|------|------|
| `action` | String | 读 | 动作（RIGHT_CLICK_BLOCK/LEFT_CLICK_AIR 等） |
| `item` | ItemStack | 读 | 手持物品 |
| `block` / `clickedBlock` | Block | 读 | 点击的方块 |
| `hand` | String | 读 | 手（MAIN_HAND/OFF_HAND） |

#### PlayerItemDamageEvent

| 属性 key | 类型 | 读写 | 说明 |
|---------|------|------|------|
| `damage` | int | 读+写 | 耐久消耗值 |
| `item` | ItemStack | 读 | 物品 |
| `player` | Player | 读 | 玩家 |

::: warning PlayerMoveEvent 陷阱
fluxon **未注册** PropertyPlayerMoveEvent，因此以下属性不可用：
- `&event::getFrom()` / `&event::from()` ❌
- `&event::getTo()` / `&event::to()` ❌

**替代方案**：使用 `&event::player` 获取玩家，再用 `&player::getLocation()` 获取当前位置；或改用 ticker 周期检查玩家坐标变化（用 modifiable 变量记录上次坐标）。
:::

---

## 附录 E：不可用 Java 方法黑名单与替代方案

> 以下 Java 方法在 fluxon 中**不可用**（未注册为属性或扩展函数），使用会抛出 `FunctionNotFoundException`。

### 重力与移动相关

| ❌ 不可用 | ✅ 替代方案 | 说明 |
|---------|-----------|------|
| `&player::getGravity()` | 无直接替代 | PropertyEntity 的 `gravity` 是 boolean（hasGravity），非重力数值 |
| `&player::setGravity(double)` | 无直接替代 | 同上，只能设置是否受重力影响的 boolean |
| `&player::walkSpeed()` | `&player::walkSpeed` / `&player::baseMovementSpeed()` | 后者更精确 |
| `&player::setWalkSpeed(double)` | `&player::setWalkSpeed()` / `&player::setBaseMovementSpeed()` | 后者更精确 |

::: tip 重力修改替代方案
MC 1.20.x 无法直接修改重力数值，可用以下方式模拟：

| 需求 | 替代方案 |
|------|---------|
| 降低重力（月球漫步） | `SLOW_FALLING` 药水效果（下落变慢 + 免疫摔伤） |
| 增加重力（沉重） | `SLOWNESS` 药水效果（行动变慢，下落不变） |
| 提高飞行速度（翱翔） | `&player::setBaseFlyingSpeed(值)`（提高 baseFlyingSpeed） |
| 降低飞行速度（装甲飞行） | `&player::setBaseFlyingSpeed(值)`（降低 baseFlyingSpeed） |
:::

### 事件属性相关

| ❌ 不可用 | ✅ 替代方案 | 说明 |
|---------|-----------|------|
| `&event::getCause()` | `&event::cause()` | 属性 key 名去掉 get 前缀 |
| `&event::getAction()` | `&event::action()` | 属性 key 名去掉 get 前缀 |
| `&event::getEntity()` | `&event::entity()` / `&event::getEntity()` | 两者均可，getEntity 已注册 |
| `&event::getDamage()` | `&event::damage()` / `&event::getDamage()` | 两者均可 |
| `&event::getFrom()` | `&event::player::getLocation()` | PlayerMoveEvent 无属性注册 |
| `&event::getTo()` | `&event::player::getLocation()` | 同上 |

::: warning getXxx() vs xxx() 规则
fluxon 属性系统注册的 key 名**通常不是** Java getter 方法名：

- **已注册的 getXxx() 方法**：`getEntity()` / `getDamage()` / `getDurability()` 等少数方法可直接调用
- **仅注册属性 key**：`cause` / `action` / `block` / `hand` 等，必须用 `cause()` / `action()` 形式
- **最佳实践**：统一使用属性 key 名形式（`cause()` / `action()` / `entity()`），避免混用 getXxx() 形式
:::

### 物品相关

| ❌ 不可用 | ✅ 替代方案 | 说明 |
|---------|-----------|------|
| `&item::getType()` | `&item::type()` / `&item::getType()` | 两者均可 |
| `&item::getDurability()` | `&item::durability()` / `&item::getDurability()` | 两者均可 |
| `&item::setData(int)` | 无替代 | 已废弃方法 |

### 命名空间函数

| ❌ 不可用 | ✅ 替代方案 | 说明 |
|---------|-----------|------|
| `math::random(a, b)` | `random(a, b)` | fluxon 无 math 命名空间 |
| `math::floor(x)` | `floor(x)` | 内置函数无命名空间 |
| `math::ceil(x)` | `ceil(x)` | 内置函数无命名空间 |
| `math::round(x)` | `round(x)` | 内置函数无命名空间 |
| `util::xxx()` | 无 | 无 util 命名空间 |

### 成员访问运算符

| ❌ 不可用 | ✅ 替代方案 | 说明 |
|---------|-----------|------|
| `&player.getLocation()` | `&player::location()` | `.` 反射访问未启用 |
| `&event.getCause()` | `&event::cause()` | `.` 反射访问未启用 |
| `&item.getType()` | `&item::type()` | `.` 反射访问未启用 |

::: warning `.` vs `::` 区别
- `::` 是**上下文调用运算符**：将左侧设为 target，查找右侧的扩展函数。Aiyatsbus **已启用**。
- `.` 是**反射式成员访问运算符**：直接调用 Java 方法。Aiyatsbus **未启用** `allowReflectionAccess`，因此 `.` 完全无效。

所有对象方法调用**必须**使用 `::` 形式。
:::

---

## 附录 B：完整示例

### 示例 1：原版附魔覆盖（锋利）

最简配置，仅覆盖原版锋利的描述与冲突规则：

```yaml
basic:
  id: sharpness
  name: 锋利
  max-level: 5
alternative:
  is-vanilla: true
rarity: 优良
targets:
  - 剑
  - 斧
  - 矛
limitations:
  - "CONFLICT_GROUP:原版增伤类附魔"
  - "CONFLICT_ENCHANT:致密"
  - "CONFLICT_ENCHANT:穿刺"
display:
  description:
    general: 提高近战攻击伤害
    specific: '&7近战攻击伤害提高&a{伤害提高}'
variables:
  leveled:
    伤害提高: 点:0.5*{level}+0.5
```

### 示例 2：简单事件监听（弹射）

右击触发二段跳，带冷却。演示 `listeners` + `cooldown` + `leveled` 变量：

```yaml
basic:
  enable: true
  disable_worlds: []
  id: propulsion
  name: 弹射
  max_level: 1
rarity: 史诗
targets:
  - 靴子
limitations:
  - "CONFLICT_ENCHANT:弹跳鞋"
display:
  description:
    general: 在空中下蹲可触发二段跳 (冷却:&a{冷却}&7)
variables:
  leveled:
    冷却: 秒:6
mechanisms:
  listeners:
    on-sneak:
      listen: player-toggle-sneak
      handle: |-
        if !&player::isOnGround() && &player::isSneaking() then {
            if cooldown::isReady(&player, &enchant, &冷却) then {
                velocity = &event::player::eyeLocation::direction::normalize() :: {
                    setY(0.5)
                }
                &player::setVelocity(&velocity)
                cooldown::addCooldown(&player, &enchant)
            }
        }
```

### 示例 3：可修改变量（蓄能）

击杀累计计数，满层后下一次攻击增伤。演示 `modifiable` 变量的读写：

```yaml
basic:
  enable: true
  disable_worlds: []
  id: accumulating
  name: "蓄能"
  max_level: 2
rarity: 史诗
targets:
  - 剑
  - 斧
limitations: []
display:
  format:
    previous: "{default_previous}  &7{是否充能完毕}(&e{当前累计}&7/&a{击杀累计}&7)"
  description:
    general: "每击杀若干只怪物后，下一次攻击伤害增加"
    specific: "&7每击杀&a{击杀累计}&7生物后，下一次攻击伤害增加&a{伤害增加百分比}"
variables:
  leveled:
    击杀累计: "只:4-{level}"
    伤害增加百分比: "%:15.0*{level}"
  modifiable:
    当前累计: test_current_total=0
    是否充能完毕: can_discharge=充能中
mechanisms:
  listeners:
    on-damage:
      listen: "entity-damage-other"
      handle: |-
        total = int(variables::modifiable(&enchant, &item, "当前累计"))
        damage = &event::damage()
        if &total >= &击杀累计 then {
            variables::setModifiable(&enchant, &item, "当前累计", 0)
            variables::setModifiable(&enchant, &item, "是否充能完毕", "充能中")
            &event::setDamage(&damage * (1.0 + &伤害增加百分比 / 100.0))
        }
    on-kill:
      listen: "entity-death"
      handle: |-
        total = int(variables::modifiable(&enchant, &item, "当前累计"))
        variables::setModifiable(&enchant, &item, "当前累计", min(&total + 1, &击杀累计))
        total = int(variables::modifiable(&enchant, &item, "当前累计"))
        if &total >= &击杀累计 then {
            variables::setModifiable(&enchant, &item, "是否充能完毕", "充能完毕")
        }
```

### 示例 4：周期任务（反重力飞行）

演示 `tickers` 的 `pre-handle` / `handle` / `post-handle` 三阶段：

```yaml
basic:
  enable: true
  disable_worlds: []
  id: wings
  name: 反重力
  max-level: 3
rarity: 传说
targets:
  - 靴子
limitations:
  - "CONFLICT_ENCHANT:经验修补"
  - "CONFLICT_ENCHANT:自生"
display:
  description:
    general: 可进入飞行状态，飞行时持续消耗装备耐久
    specific: '&7可进入飞行状态，飞行时每&a2秒&7消耗装备&a{消耗耐久}&7耐久'
variables:
  leveled:
    消耗耐久: 点:2-0.5*{level}
mechanisms:
  listeners:
    on-fall:
      listen: entity-damage
      handle: |-
        if &event::cause() == FALL && &player::hasMeta("fall-protect") then {
            &player::removeMeta("fall-protect")
            &event::setCancelled(true)
        }
  tickers:
    durability:
      interval: 40
      pre-handle: |-
        // 装备时：允许飞行
        &player::setAllowFlight(true)
      handle: |-
        // 每 2 秒：检查耐久并消耗
        if &player::isFlying() then {
            &item::setDurability(&item::durability() + &消耗耐久)
        }
      post-handle: |-
        // 卸下时：取消飞行
        &player::setFlying(false)
        &player::setAllowFlight(false)
```

### 示例 5：分级变量（缓震）

演示 `leveled` 的分级写法（不同等级不同值）：

```yaml
basic:
  enable: true
  disable_worlds: []
  id: jelly_legs
  name: 缓震
  max_level: 3
rarity: 稀有
targets:
  - 靴子
limitations: []
display:
  description:
    general: 摔伤时可减少伤害并弹起
    specific: '&7受到不超过&a{最大高度}&7的摔伤时减少&a{减少伤害}&7并弹起'
variables:
  leveled:
    最大高度:           # 分级写法
      1: 16
      2: 48
      3: 256
      unit: 格
    减少伤害: 点:3*{level}   # 简写
mechanisms:
  listeners:
    on-entity-damage:
      listen: entity-damage
      handle: |-
        fallDistance = &event::entity::fallDistance()
        if string(&event::cause()) == FALL then {
            if &fallDistance <= &最大高度 then {
                &event::entity::setVelocity(vector(0, 1, 0))
                if &event::damage() - &减少伤害 <= 0.0 then {
                    &event::setCancelled(true)
                } else {
                    &event::setDamage(&event::damage() - &减少伤害)
                }
            }
        }
```

---

## 九、参考资源

### 官方文档与 Wiki

- [Aiyatsbus Wiki 主页](https://wiki.polarastrum.cc/plugin/aiyatsbus/)
- [附魔结构总览](https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/main)
- [基本元数据](https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/basic/)
- [可选元数据（alternative）](https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/basic/alternative)
- [限制配置（limitations）](https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/basic/limitations)
- [变量配置](https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/variables/main)
- [触发器配置](https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/trigger/main)
- [内建触发器（Java/Kotlin）](https://wiki.polarastrum.cc/plugin/aiyatsbus/start/ench/trigger/builtin)
- [Q&A](https://wiki.polarastrum.cc/plugin/aiyatsbus/qa)

### 脚本工具

- [TabooLib 脚本动作大全](https://taboolib.hhhhhy.kim/kether-list) — 含 Aiyatsbus 提供的 295 个动作，按"提供者 = Aiyatsbus"筛选

### 项目仓库

- [Aiyatsbus GitHub](https://github.com/PolarisTabooLib/Aiyatsbus)

### 服务器内部参考

- [附魔 ID 对照表](/develop/server_configs/enchantment_ids) — 237 个附魔的完整 ID/名称/品质/等级

> **文档维护**：本文档由 F.windEmiko（狐风轩汐）编写，服务于 MiragEdge 锐界幻境服务器。版本随 Aiyatsbus 插件版本和 MC 版本更新。如有疑问或建议，请联系开发团队。
