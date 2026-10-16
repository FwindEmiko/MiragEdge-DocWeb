---
title: 世界与实体
description: Aiyatsbus 宿主函数的世界与实体命名空间参考：block 掉落与矿脉查找、弓蓄力事件扩展、entity 装备伤害药水、guard 保护查询和 world 昼夜粒子。
outline: [2, 3]
---

# 世界与实体

这张表用来查 `block`、`world`、`entity` 和 `guard` 四个命名空间的宿主函数签名、参数含义和返回值。API 优先级与调用规则见 [宿主函数总览](./)，`cooldown`、`variables` 等其余命名空间见 [变量与运行时组合](./variables-combos)。

## `block`

### `getDrops`

```fluxon
block::getDrops(block, item?, entity?) -> Collection<ItemStack>
```

- `block`：要计算掉落物的 `Block`，允许为 `null`。
- `item`：用于计算掉落的工具，可省略。
- `entity`：参与掉落计算的实体，可省略。
- 方块为 `null` 时返回空集合。
- 返回掉落物，但不会破坏方块，也不会把物品加入背包或掉落到世界。

```fluxon
drops = block::getDrops(&brokenBlock)
dropsWithTool = block::getDrops(&brokenBlock, &tool, &player)
dropsWithEntity = block::getDrops(&brokenBlock, null, &player)
```

### `getVein`

```fluxon
block::getVein(block, amount?) -> List<Location>
```

- 查找与起始方块相连且材质相同的方块。
- `amount` 是最多返回的位置数量，省略时不限制。
- 返回值不包含起始方块本身。
- 搜索轴向相邻和二维对角相邻方块，不包含三轴同时偏移的角点。
- 对大型连续区域应主动设置 `amount`，避免一次搜索过多方块。

```fluxon
nearbyOre = block::getVein(&origin, 16)
allConnected = block::getVein(&origin)
```

## 弓蓄力事件扩展

这些函数直接调用在事件对象或 `ChargeInfo` 对象上。可用的监听器 ID 包括：

```yaml
aiyatsbus-bow-charge-prepare
aiyatsbus-bow-charge-released
aiyatsbus-bow-charge-break
```

### `Prepare`

准备事件用于决定是否允许玩家开始自定义蓄力。

| 调用 | 返回值 | 用途 |
| --- | --- | --- |
| `&event::player()` | `Player` | 获取蓄力玩家 |
| `&event::itemStack()` | `ItemStack` | 获取开始蓄力时使用的物品 |
| `&event::hand()` | `EquipmentSlot` | 获取使用的手 |
| `&event::isAllowed()` | `Boolean` | 查询是否允许开始蓄力 |
| `&event::setAllowed(allowed)` | `void` | 设置是否允许开始蓄力 |
| `&event::fire()` | `Prepare` | 再次分发该事件并返回事件自身 |
| `&event::release()` | `void` | 立即触发释放并结束当前蓄力 |
| `&event::interrupt()` | `void` | 以 `DAMAGED` 原因中断当前蓄力 |

`isAllowed` 初始为 `false`。允许本次蓄力时必须显式设置：

```fluxon
player = &event::player()
item = &event::itemStack()
&event::setAllowed(true)
```

不要在 `Prepare` 事件的监听脚本中直接调用 `fire()`。这会再次分发同一个事件，可能造成递归或重复执行。

### `Released`

| 调用 | 返回值 | 用途 |
| --- | --- | --- |
| `&event::player()` | `Player` | 获取玩家 |
| `&event::itemStack()` | `ItemStack` | 获取蓄力物品 |
| `&event::hand()` | `EquipmentSlot` | 获取使用的手 |
| `&event::chargeInfo()` | `ChargeInfo` | 获取完整蓄力信息 |
| `&event::startTime()` | `Long` | 获取开始时间戳，单位为毫秒 |
| `&event::chargeTime()` | `Long` | 获取本次蓄力时长，单位为毫秒 |

```fluxon
player = &event::player()
chargeMillis = &event::chargeTime()
if &chargeMillis >= 1000L {
    // 至少蓄力 1 秒
}
```

### `Break`

| 调用 | 返回值 | 用途 |
| --- | --- | --- |
| `&event::player()` | `Player` | 获取玩家 |
| `&event::chargeInfo()` | `ChargeInfo` | 获取完整蓄力信息 |
| `&event::reason()` | `Break.Reason` | 获取中断原因 |
| `&event::source()` | `Event?` | 获取导致中断的 Bukkit 事件，可能为 `null` |
| `&event::startTime()` | `Long` | 获取开始时间戳，单位为毫秒 |
| `&event::chargeTime()` | `Long` | 获取中断前的蓄力时长，单位为毫秒 |

中断原因可能为 `DAMAGED`、`SKILL` 或 `PLUGIN`。

```fluxon
reason = &event::reason()::toString()
if &reason == "DAMAGED" {
    player = &event::player()
}
```

### `ChargeInfo`

| 调用 | 返回值 | 用途 |
| --- | --- | --- |
| `&info::player()` | `Player` | 获取玩家 |
| `&info::itemStack()` | `ItemStack` | 获取开始蓄力时保存的物品 |
| `&info::hand()` | `EquipmentSlot` | 获取使用的手 |
| `&info::startTime()` | `Long` | 获取开始时间戳，单位为毫秒 |
| `&info::chargeTime()` | `Long` | 获取蓄力时长，单位为毫秒 |
| `&info::stopTime()` | `Long` | 获取停止时间；未停止时为 `-1L` |
| `&info::setStopTime(time)` | `void` | 设置停止时间戳 |

```fluxon
info = &event::chargeInfo()
elapsed = &info::chargeTime()
```

蓄力尚未停止时，`chargeTime()` 会随当前时间增长。`setStopTime(...)` 只修改时间字段，不会触发释放或中断事件，也不会清理玩家的蓄力状态。

## `entity`

### `equippedItems`

```fluxon
entity::equippedItems(entity) -> Map<EquipmentSlot, ItemStack>
```

返回生物各装备槽位对应的物品。空槽使用 `AIR` 物品表示，不是 `null`。

```fluxon
equipment = entity::equippedItems(&target)
```

### `realDamage`

```fluxon
entity::realDamage(entity, damage, by?) -> void
```

- `entity`：受到伤害的 `LivingEntity`。
- `damage`：伤害数值。
- `by`：伤害来源实体，可省略。
- 该伤害通过直接扣减生命值并补发一次 Bukkit 伤害流程实现。
- 只应传入正数伤害。

```fluxon
entity::realDamage(&target, 6.0, &player)
```

### `entityName`

```fluxon
entity::entityName(entity, player?) -> String
```

玩家返回账号名；其他实体优先返回自定义名称，否则返回本地化实体名称。可选的 `player` 用作本地化观察者。

```fluxon
name = entity::entityName(&target, &player)
```

### `addSafetyVelocity`

```fluxon
entity::addSafetyVelocity(entity, vector, checkKnockback?) -> void
```

- 设置经过安全处理的速度向量。
- `checkKnockback` 默认 `false`；设为 `true` 时考虑实体抗击退属性。
- 函数名中的 `add` 不表示与原速度相加，最终会设置实体速度。
- 开启抗击退检查时，传入的 `Vector` 可能被缩放。之后仍需使用原值时应先克隆。

```fluxon
velocity = new org.bukkit.util.Vector(0.0, 1.0, 0.0)
entity::addSafetyVelocity(&target, &velocity, true)
```

### `isBehind`

```fluxon
entity::isBehind(entity1, entity2) -> Boolean
```

判断 `entity1` 是否位于 `entity2` 身后。计算忽略 Y 轴；两个实体不在同一世界时返回 `false`。

```fluxon
if entity::isBehind(&attacker, &victim) {
    entity::realDamage(&victim, 4.0, &attacker)
}
```

参数顺序不能互换：第一个参数是被判断位置的实体，第二个参数是朝向基准实体。

### `addPotionEffect`

```fluxon
entity::addPotionEffect(entity, type, duration, amplifier, ambient?, particles?, icon?) -> void
```

- `type`：药水效果名称，例如 `"SLOWNESS"`、`"GLOWING"`。
- `duration`：持续 tick；`20` tick 约为 1 秒。
- `amplifier`：从 0 开始，`0` 表示效果 I，`1` 表示效果 II。
- `ambient`、`particles`、`icon` 均默认 `true`。
- 无法识别的药水效果名称会抛出错误。

```fluxon
entity::addPotionEffect(&target, "SLOWNESS", 60, 1)
entity::addPotionEffect(&target, "GLOWING", 40, 0, false, true, true)
```

### `getActivePotionEffect`

```fluxon
entity::getActivePotionEffect(entity, type) -> PotionEffect?
```

返回指定类型的活动药水效果，不存在时返回 `null`。

```fluxon
effect = entity::getActivePotionEffect(&target, "SLOWNESS")
if &effect != null {
    duration = &effect::duration()
}
```

### `hasPotionEffect`

```fluxon
entity::hasPotionEffect(entity, type) -> Boolean
```

```fluxon
if entity::hasPotionEffect(&target, "POISON") {
    // 目标正处于中毒状态
}
```

### `removePotionEffect`

```fluxon
entity::removePotionEffect(entity, type) -> void
```

移除指定类型的活动药水效果。

```fluxon
entity::removePotionEffect(&player, "SLOWNESS")
```

### `isNPC`

```fluxon
entity::isNPC(entity) -> Boolean
```

根据当前启用的 NPC 兼容实现判断实体是否为 NPC。传入 `null` 时返回 `false`。

```fluxon
if entity::isNPC(&target) {
    return
}
```

### `isLivingEntity`

```fluxon
entity::isLivingEntity(entity) -> Boolean
```

判断对象是否为 Bukkit `LivingEntity`。传入 `null` 时返回 `false`。

```fluxon
if !entity::isLivingEntity(&target) {
    return
}
```

### `isPlayer`

```fluxon
entity::isPlayer(entity) -> Boolean
```

判断对象是否为 Bukkit `Player`。传入 `null` 时返回 `false`。

该函数不是 Listener 的默认前置检查。执行者可以是任意 `LivingEntity` 且效果能正常运行时不要调用它。只有效果明确要求玩家，或后续必须使用 Player 专属 API 时才判断。

```fluxon
if entity::isPlayer(&target) {
    targetPlayer = &target
}
```

## `guard`

保护检查只判断操作是否允许，不会执行破坏、伤害或拾取。

### `canBreak`

```fluxon
guard::canBreak(player, location) -> Boolean
```

询问当前启用的领地或反破坏兼容插件，玩家是否可以破坏指定位置。

```fluxon
if !guard::canBreak(&player, &location) {
    return
}
```

### `canDamage`

```fluxon
guard::canDamage(player, entity) -> Boolean
```

询问当前保护兼容插件，玩家是否可以伤害指定实体。

```fluxon
if guard::canDamage(&player, &target) {
    entity::realDamage(&target, 4.0, &player)
}
```

### `isGuardItem`

```fluxon
guard::isGuardItem(item, player?) -> Boolean
```

- `item` 必须是世界中的掉落物实体 `org.bukkit.entity.Item`，不是 `ItemStack`。
- 返回该掉落物是否应被保护、不能由当前操作拾取。
- 传入 `player` 时会同步触发 Bukkit 拾取事件进行检查，因此该函数不是纯查询。

```fluxon
if guard::isGuardItem(&droppedItem, &player) {
    return
}
```

## `world`

### `isDay`

```fluxon
world::isDay(world) -> Boolean
```

判断世界当前是否为白天。

```fluxon
currentWorld = &player::world()
if world::isDay(&currentWorld) {
    // 白天效果
}
```

### `isNight`

```fluxon
world::isNight(world) -> Boolean
```

判断世界当前是否为夜晚。

```fluxon
currentWorld = &player::world()
if world::isNight(&currentWorld) {
    // 夜晚效果
}
```

在时间边界 `12300` 和 `23850` 上，`isDay` 与 `isNight` 都返回 `false`。不要假设二者始终互为相反值。

### `spawnCircleParticles`

```fluxon
world::spawnCircleParticles(particle, location, amount, option, range, factor?) -> void
```

- `particle`：Bukkit `Particle`。
- `location`：圆心位置。
- `amount`：每个采样点生成的粒子数。
- `option`：粒子的额外数据，必须匹配该粒子的 Bukkit 数据类型。
- `range`：圆半径。
- `factor`：圆周采样点数量，默认 `10`，应为正数。
- 总粒子量约为 `amount * factor`。

```fluxon
world::spawnCircleParticles(
    &particle,
    &location,
    1,
    &option,
    2.0,
    20
)
```

### `spawnRNAParticles`

```fluxon
world::spawnRNAParticles(particle, location, amount, option, height, range, factor?, circle?) -> void
```

- 生成从 `-height` 到 `+height` 的螺旋粒子。
- `height`：中心上下各自延伸的高度。
- `range`：螺旋半径。
- `factor`：每圈采样数，默认 `10`，必须大于 `0`。
- `circle`：圈数，默认 `1`，必须大于 `0`。
- 通常生成 `factor * circle + 1` 个采样点。
- `option` 必须匹配粒子的 Bukkit 数据类型。

```fluxon
world::spawnRNAParticles(
    &particle,
    &location,
    1,
    &option,
    2.0,
    1.5,
    20,
    2
)
```
