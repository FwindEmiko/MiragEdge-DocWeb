# 附魔配置教程

服务器使用 **Aiyatsbus** 插件实现自定义附魔体系。本页基于插件源码与实际示例配置整理，涵盖完整的配置字段、事件、变量、脚本机制。

> 附魔 ID 对照表见 [附魔ID对照表](/develop/server_configs/enchantment_ids)。

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

## 目录结构

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

## 核心配置文件

### rarity.yml · 品质

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

### target.yml · 装备类型

定义附魔可应用的装备分类。每类包含 `max`（该类物品最大附魔词条数）、`name`（中文名）、`active-slots`（生效槽位，如 `HAND`/`OFF_HAND`/`HEAD`/`CHEST`/`LEGS`/`FEET`）、`types`（允许的 Bukkit Material 列表）。部分类别带 `dependencies.supports` 表示最低 Minecraft 版本。

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

### group.yml · 附魔分组

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

### display.yml · 显示系统

控制附魔在物品 lore 上的展示方式。关键配置：

- `format.default_previous` / `default_subsequent`：全局默认的前部（名称+等级）与后部（描述）格式。
- `combine`：当物品附魔数量超过 `min` 时合并显示，`separate_special` 控制特殊显示的附魔是否独立成行。
- `sort.level` / `sort.rarity`：按等级或品质排序。
- `display-tags`：等级贴图，支持按品质或全局配置 1~10 的中文数字贴图。

等级显示有三种类型，通过 `default_previous` 中的占位符判定：
- `{enchant_display_roman}` — 罗马数字（默认）
- `{enchant_display_number}` — 阿拉伯数字
- `{enchant_display_tag}` — 自定义贴图

### skill.yml · 技能型附魔

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

### artifact.yml · 幻化粒子

定义"幻化"品质附魔的粒子效果形态。支持 `CIRCLE`（环形）、`RNA`（双螺旋）、`SIMPLE`（简单）三种粒子形状，按装备槽位独立配置，并定义在破坏特定矿物时触发粒子。

## 附魔配置字段

每个附魔 yml 的完整结构：

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

### basic · 基础信息

| 字段 | 类型 | 说明 |
|---|---|---|
| `enable` | bool | 是否启用该附魔 |
| `disable_worlds` | list | 禁用该附魔的世界名列表 |
| `id` | string | 附魔 ID（英文蛇形，用于命令/脚本引用） |
| `name` | string | 附魔中文名（玩家可见） |
| `max_level` | int | 最大等级（`max-level` 与 `max_level` 两种写法均可） |

### rarity · 品质

填 `rarity.yml` 中定义的品质**中文名**，如 `普通` / `优良` / `稀有` / `史诗` / `传说` / `至宝` / `诅咒` / `幻化`。

### targets · 适用装备

填 `target.yml` 中定义的装备类型**中文名**列表。一个附魔可适用于多种装备。

### limitations · 限制规则

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

### display · 显示

控制附魔在物品 lore 上的展示。

- `format.previous` / `format.subsequent`：自定义前部/后部格式。留空或保持 `{default_previous}` / `{default_subsequent}` 则使用 `display.yml` 中的全局默认。
- `description.general`：通用描述（无变量时使用）。
- `description.specific`：详细描述（支持变量占位符 `{变量名}` 和颜色代码 `&a` 等）。若配置了 `specific`，则显示 `specific`，否则回退到 `general`。

可用的显示占位符：`{default_previous}`、`{default_subsequent}`、`{enchant_display_roman}`、`{enchant_display_number}`、`{enchant_display_tag}`、`{description}`、`{id}`、`{name}`、`{level}`、`{max_level}`、`{rarity}`、`{rarity_display}`，以及所有自定义 `variables`。

### variables · 变量

变量可在 `display.description.specific` 和脚本中引用。共三种类型：

#### leveled · 等级变量

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

#### ordinary · 常量

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

#### modifiable · 可修改变量

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

### mechanisms · 机制

机制分为两类：**listeners**（事件监听）和 **tickers**（周期任务）。

#### listeners · 事件监听

当指定事件发生时执行脚本。每个 listener 包含：
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

**支持的事件列表（16 个）：**

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

#### tickers · 周期任务

按固定间隔（tick）周期执行脚本，适用于需要持续检查状态的附魔（如飞行、耐久消耗、光环效果）。每个 ticker 包含：
- `type`：脚本类型，固定为 `fluxon`（可省略）。
- `interval`：执行间隔（tick），默认 20（1 秒）。
- `pre-handle`：**预处理**脚本，在该玩家首次满足触发条件（装备了带此附魔的物品）时执行一次。
- `handle`：**主处理**脚本，每个 `interval` 周期执行。
- `post-handle`：**后处理**脚本，在该玩家不再持有任何带此附魔的物品时执行一次。

ticker 脚本中可用变量：`player`、`item`、`level`、`triggerSlot` 等。

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

### alternative · 原版附魔替代（可选）

用于原版附魔覆盖或控制获取渠道。所有字段均可选：

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

## 脚本语言

附魔的 `mechanisms.listeners.handle` 和 `tickers.handle` 等字段使用 **fluxon** 脚本语言编写逻辑。

::: warning 关于 Kether
服务器**已完全切换到 fluxon 脚本语言，不再使用 Kether**。旧版文档中基于 Kether 的示例（`add-potion-effect`、`set ... to`、`&event[block.world]`、`tell "..."` 等语法）均已**失效**，请勿参考。本页所有示例均为 fluxon 语法。
:::

### fluxon 简介

fluxon 是 Aiyatsbus 自研的脚本语言，语法风格类似 Kotlin 与 JavaScript 的混合体：

- **变量声明**：`名称 = 值`（无需关键字）
- **方法调用**：用 `::` 访问对象方法，如 `&player::setVelocity(...)`
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
variables::setModifiable(&enchant, &item, "当前累计", 0)  // 读写 modifiable 变量
```

### 常用 API

```text
// 事件操作（listeners 中）
&event::damage()                      // 获取伤害值
&event::setDamage(新伤害)              // 修改伤害值
&event::setCancelled(true)            // 取消事件
&event::cause()                       // 获取伤害原因（FALL/FIRE 等）
&event::entity()                      // 获取受害实体
&event::projectile()                  // 获取抛射物（射箭事件）

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

// 数学
min(a, b) / max(a, b) / pow(a, b) / random(最小, 最大) / abs(值)

// 向量
vector(x, y, z)                      // 创建向量
&vec::normalize() / &vec::multiply(n) / &vec::add(vec) / &vec::length()

// 守卫检查（伤害前合法性校验）
guard::canDamage(&player, &entity)   // 是否可以伤害目标
guard::canBreak(&player, &location)  // 是否可以破坏方块
```

### 脚本参考资源

- **TabooLib 脚本动作大全**：<https://taboolib.hhhhhy.kim/kether-list>  
  （含 Aiyatsbus 提供的 295 个动作，按类别分类：世界与坐标、实体控制、物品管理、药水效果、视觉特效等）

::: tip 关于脚本动作大全
该站点虽名为 "Kether Explorer"，但实际收录了 Aiyatsbus 在 TabooLib 框架上注册的所有脚本动作，可按"提供者 = Aiyatsbus"筛选查看。fluxon 复用这些动作的底层实现。
:::

## 完整示例

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
