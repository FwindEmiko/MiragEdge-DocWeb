---
title: 附魔配置工作流 · 参考资料
description: 面向锐界幻境自定义附魔维护的工作流，拆分为前置环境、模块实现、参考资料和排错。
---

# 附魔配置工作流 · 参考资料

## 附录 A：fluxon 脚本参考

### 语言简介

附魔的 `mechanisms.listeners.handle` 和 `tickers.handle` 等字段使用 **fluxon** 脚本语言编写逻辑。

::: warning 关于 Kether
服务器**已完全切换到 fluxon 脚本语言，不再使用 Kether**。旧版文档中基于 Kether 的示例（`add-potion-effect`、`set ... to`、`&event[block.world]`、`tell "..."` 等语法）均已**失效**，请勿参考。本页所有示例均为 fluxon 语法。
:::

fluxon 是 Aiyatsbus 自研的脚本语言，语法风格类似 Kotlin 与 JavaScript 的混合体：

- **变量声明**：`名称 = 值`（无需关键字）
- **方法调用**：用 `::` 访问对象方法（上下文调用运算符），如 `&player::setVelocity(...)`。**注意**：`::` 右侧必须是已注册的属性或扩展函数，否则抛出 `FunctionNotFoundException`。详见[附录 C](./reference#附录-c-fluxon-函数调用机制与属性访问规则)
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

**最佳实践**：使用属性前先查阅 [附录 D：可用属性全集](./reference#附录-d-可用属性全集) 或服务器源码 `PropertyXxx.kt` 文件，确认属性 key 名已注册。

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

- [附魔 ID 对照表](/developer/reference/enchantment_ids) — 237 个附魔的完整 ID/名称/品质/等级

> **文档维护**：本文档由 F.windEmiko（狐风轩汐）编写，服务于 MiragEdge 锐界幻境服务器。版本随 Aiyatsbus 插件版本和 MC 版本更新。如有疑问或建议，请联系开发团队。
