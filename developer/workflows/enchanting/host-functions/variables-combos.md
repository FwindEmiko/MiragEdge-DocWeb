---
title: 变量与运行时组合
description: Aiyatsbus 宿主函数的冷却、背包、物品、玩家与变量命名空间参考，附加调试输出和冷却技能、安全伤害、模拟放置三类常见脚本组合。
outline: [2, 3]
---

# 变量与运行时组合

这张表用来查 `cooldown`、`inventory`、`item`、`player`、`variables` 和 `common` 的宿主函数签名，并在末尾给出可直接改写的组合示例。API 优先级与调用规则见 [宿主函数总览](./)，`block`、`entity` 等命名空间见 [世界与实体](./world-entity)。

## `cooldown`

### `isReady`

```fluxon
cooldown::isReady(player, enchant, seconds, broadcast?, broadcastInActionBar?) -> Boolean
```

- `player`：检查冷却的玩家。
- `enchant`：当前附魔对象；冷却以附魔 ID 为键。
- `seconds`：冷却长度，单位为秒。
- `broadcast`：冷却未结束时是否提示玩家，默认 `true`。
- `broadcastInActionBar`：是否使用 Action Bar 提示；省略时读取全局配置。
- 该函数只检查冷却，不会自动开始冷却。

```fluxon
if !cooldown::isReady(&player, &enchant, 5.0) {
    return
}

cooldown::addCooldown(&player, &enchant)
// 执行技能效果
```

静默检查：

```fluxon
if !cooldown::isReady(&player, &enchant, 5.0, false) {
    return
}
```

同一玩家、同一附魔的所有脚本分支共享同一个冷却键。当前 API 不支持传入自定义字符串冷却键。

### `addCooldown`

```fluxon
cooldown::addCooldown(player, enchant) -> void
```

以当前时间开始或重置指定玩家、指定附魔的冷却。

```fluxon
cooldown::addCooldown(&player, &enchant)
```

### `removeCooldown`

```fluxon
cooldown::removeCooldown(player, enchant) -> void
```

删除指定玩家、指定附魔的冷却记录。

```fluxon
cooldown::removeCooldown(&player, &enchant)
```

### `clearCooldown`

```fluxon
cooldown::clearCooldown(player) -> void
```

清除该玩家的全部 Aiyatsbus 冷却记录，不限于当前附魔。只重置当前附魔时应使用 `removeCooldown`。

```fluxon
cooldown::clearCooldown(&player)
```

Skill 触发器已经自动检查并添加冷却。Skill 的 `handle` 中不要再调用 `addCooldown`，否则只会把冷却起点重置为稍后的时间，详见 [Skill 触发器](../skill-trigger)。

## `inventory`

### `hasItem`

```fluxon
inventory::hasItem(player, amount, predicate) -> Boolean
```

检查玩家背包中是否有足够数量满足 Lambda 条件的物品。Lambda 的隐式参数 `&it` 是当前候选 `ItemStack`，必须返回布尔值。

```fluxon
materialType = &seedItem::type()
hasSeed = inventory::hasItem(&player, 1, || &it::type() == &materialType)
```

### `takeItem`

```fluxon
inventory::takeItem(player, amount, predicate) -> Boolean
```

从玩家背包扣除指定数量、满足条件的物品，并返回是否成功。该函数会直接修改背包，应检查返回值。

```fluxon
materialType = &seedItem::type()
if !inventory::takeItem(&player, 1, || &it::type() == &materialType) {
    return
}
```

## `item`

### `belongingTargetsId`

```fluxon
item::belongingTargetsId(type: Material) -> List<String>
item::belongingTargetsId(item: ItemStack) -> List<String>
```

返回材质或物品所属的全部 Aiyatsbus 附魔目标 ID。同一物品可能属于多个目标。

```fluxon
idsFromItem = item::belongingTargetsId(&itemStack)
idsFromType = item::belongingTargetsId(&itemStack::type())
```

返回的是配置使用的目标 ID，不是本地化显示名称。不要传入 `null`。

### `isUnbreakable`

```fluxon
item::isUnbreakable(item) -> Boolean
```

判断物品是否具有不可破坏属性。

```fluxon
if item::isUnbreakable(&itemStack) {
    return
}
```

## `player`

### `placeBlock`

```fluxon
player::placeBlock(player, placedBlock, itemInHand?) -> Boolean
```

- 模拟触发一次 `BlockPlaceEvent`，返回该事件是否允许放置。
- `itemInHand` 省略时使用玩家当前手持物品。
- 该函数不会真正修改方块，也不会扣除物品。
- 事件使用的装备槽固定为主手 `HAND`。

正确用法是先检查事件，再由脚本完成方块修改和物品扣除：

```fluxon
if !player::placeBlock(&player, &targetBlock, &seedItem) {
    return
}
if !inventory::takeItem(&player, 1, || &it::type() == &seedItem::type()) {
    return
}
&targetBlock::setType(&cropMaterial)
```

## `common`

### `debug`

```fluxon
common::debug(text) -> void
```

将字符串解析为聊天组件，构建颜色后输出到 Aiyatsbus 调试日志。该函数只用于调试，不向玩家发送消息，也不返回结果。

```fluxon
common::debug("附魔触发，等级: ${&level}")
common::debug("目标: ${entity::entityName(&target)}")
```

需要输出变量时，先在 Fluxon 字符串插值中使用 `&变量`；裸标识符不会读取变量。`debug` 的参数必须是字符串，数值或 Bukkit 对象应先使用 `string(...)`，或放入字符串插值中。

## `variables`

### `ordinary`

```fluxon
variables::ordinary(enchant, name) -> Any?
```

读取附魔的普通变量。变量不存在时返回 `null`。

```fluxon
value = variables::ordinary(&enchant, "最大深度")
```

### `leveled`

```fluxon
variables::leveled(enchant, name, level, withUnit) -> Any
```

- 按指定等级计算 LEVELED 变量。
- `withUnit = false` 时返回 `Int` 或 `Double`，适合参与计算。
- `withUnit = true` 时返回带单位的 `String`，适合显示。
- 四个参数都必须提供。
- 变量不存在，或当前等级没有可用配置时会抛出错误。

```fluxon
damage = variables::leveled(&enchant, "伤害", &level, false)
displayDamage = variables::leveled(&enchant, "伤害", &level, true)
```

当前触发器通常已经把当前等级的变量注入脚本。直接读取时优先使用 `&伤害`；需要动态变量名、不同等级或带单位文本时再调用 `leveled`。

### `modifiable`

```fluxon
variables::modifiable(enchant, item, name) -> Any
```

读取物品上的 MODIFIABLE 变量。变量可以存储在 PDC 或配置的 NBT 深层路径中；物品没有自定义值时返回变量默认值。

```fluxon
total = int(variables::modifiable(&enchant, &itemStack, "当前累计"))
```

PDC 存储值通常以字符串返回。参与数值运算前应使用 `int(...)` 或 `double(...)` 显式转换。变量名必须存在，物品不能为 `null`。

### `setModifiable`

```fluxon
variables::setModifiable(enchant, item, name, value) -> ItemStack
```

把 MODIFIABLE 变量写入物品，并返回修改后的物品。传入值会先转换成字符串；传入 `null` 会写入字符串 `"null"`，不会删除变量。

```fluxon
itemStack = variables::setModifiable(
    &enchant,
    &itemStack,
    "当前累计",
    &newTotal
)
```

应接收返回的 `ItemStack`，不要依赖底层是否原地修改对象。变量名必须已经在附魔配置中定义。给 `&变量名` 赋值不会写回物品。

## 常见组合

### 冷却技能

```fluxon
if !cooldown::isReady(&player, &enchant, 8.0) {
    return
}
cooldown::addCooldown(&player, &enchant)

entity::addPotionEffect(&player, "SPEED", 100, 1)
```

### 安全伤害实体

```fluxon
if !entity::isLivingEntity(&target) || entity::isNPC(&target) {
    return
}
if !guard::canDamage(&player, &target) {
    return
}

entity::realDamage(&target, &damage, &player)
```

### 消耗物品后模拟放置

```fluxon
materialType = &requiredItem::type()
if !inventory::hasItem(&player, 1, || &it::type() == &materialType) {
    return
}
if !player::placeBlock(&player, &targetBlock, &requiredItem) {
    return
}
if !inventory::takeItem(&player, 1, || &it::type() == &materialType) {
    return
}

&targetBlock::setType(&placedMaterial)
```
