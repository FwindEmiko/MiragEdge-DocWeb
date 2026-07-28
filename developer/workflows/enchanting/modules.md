---
title: 附魔配置工作流 · 模块工作流
description: 面向锐界幻境自定义附魔维护的工作流，拆分为前置环境、模块实现、参考资料和排错。
---

# 附魔配置工作流 · 模块工作流

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
