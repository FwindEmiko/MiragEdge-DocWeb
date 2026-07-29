---
title: Aiyatsbus 附魔配置工作流 · Fluxon 参考
description: 基于当前 Aiyatsbus 与 Fluxon 源码核实的最小 Fluxon API 参考。
---

# Fluxon 参考

这里不是“全部 API 列表”。Fluxon 扩展会随依赖版本变化，维护文档只保留本轮能从当前源码或上游默认配置确认的调用。需要更多能力时，先检查实际 JAR 所携带的 Fluxon 版本和对应源码，再写入配置。

## 调用规则

Fluxon 使用 `::` 调用已经注册的扩展函数：

```text
location = &player::location()
damage = &event::damage()
&event::setDamage(&damage * 1.1)
```

这不是 Java 反射调用。不要根据 Bukkit Java 方法名猜测 `::` 右侧名称，也不要把旧 Kether 示例直接改一个分隔符后使用。出现 `FunctionNotFoundException` 时，优先从实际 Fluxon 扩展源码核对函数名、参数数和事件类型。

## 脚本上下文

| 变量 | 可用位置 | 含义 |
| --- | --- | --- |
| `&player` | listeners、tickers | 触发附魔的实体或玩家上下文 |
| `&item` | listeners、tickers | 当前带有附魔的物品 |
| `&level` | listeners、tickers | 当前附魔等级 |
| `&enchant` | listeners、tickers | 当前附魔对象 |
| `&event` | listener 的 `handle` | 当前 Bukkit 事件 |
| `&triggerSlot` | 触发器上下文 | 触发槽位 |

`&event` 不存在于 ticker 中。事件型脚本不要复制进 ticker 后继续调用 `&event::...`。

## 持久变量

`modifiable` 的读取和写入必须走 Aiyatsbus 的变量函数：

```text
total = int(variables::modifiable(&enchant, &item, "当前累计"))
next = min(&total + 1, &击杀累计)
variables::setModifiable(&enchant, &item, "当前累计", &next)
```

当前 `FnVariables` 的签名是：

```text
variables::modifiable(enchant, item, name)
variables::setModifiable(enchant, item, name, value)
```

不要给 `modifiable()` 传第四个默认值，也不要写 `&当前累计 = ...` 期待它保存到物品。前者参数数量不匹配，后者只修改当次脚本上下文。

## 已核实的事件 API

| 事件类别 | 可用调用 | 说明 |
| --- | --- | --- |
| 伤害 | `&event::damage()`、`&event::setDamage(...)`、`&event::cause()` | 当前伤害总值使用 `damage()`；`getDamage` 只存在带 DamageModifier 参数的重载 |
| 交互 | `&event::action()`、`&event::isRightClick()`、`&event::isClickBlock()`、`&event::clickedBlock()`、`&event::hand()` | `clickedBlock` 是函数，需要括号 |
| 移动 | `&event::from()`、`&event::to()`、`&event::setFrom(...)`、`&event::setTo(...)` | 当前 Fluxon Bukkit 扩展已注册 PlayerMoveEvent 的这些方法 |
| 投射物命中 | `&event::entity()`、`&event::hitBlock()`、`&event::hitBlockFace()`、`&event::hitEntity()` | 使用前先处理空目标或命中类型 |

### 伤害样例

```text
damage = &event::damage()
&event::setDamage(&damage * (1.0 + &伤害增加 / 100.0))
```

### 交互样例

```text
if &event::isRightClick() && &event::isClickBlock() then {
    block = &event::clickedBlock()
    # 在这里处理 block
}
```

### 坐标与方块样例

```text
block = &player::location()::subtract(0, 1, 0)::block()
&block::setType("AIR")
```

这是会改变方块的示例，只能在专门的测试区域使用；真实效果还要检查领地、区域保护、日志记录和回滚插件的处理结果。

## 当前可用的常用扩展

| 目标 | 调用 |
| --- | --- |
| 玩家位置 | `&player::location()` |
| 玩家行走速度 | `&player::walkSpeed()`、`&player::setWalkSpeed(...)` |
| 实体位置 | `&entity::location()` |
| 坐标世界与方块 | `&location::world()`、`&location::block()` |
| 方块材质 | `&block::setType("AIR")` |
| 加入短效药水 | `entity::addPotionEffect(&entity, "SLOWNESS", 40, 0)` |

药水、速度、属性、飞行和其他可能被多个系统同时改变的状态，必须设置明确的持续时间或所有权边界。不要把玩家的全局 base attribute 或 metadata 恢复逻辑当成“数据包属性 modifier 的等价实现”。

## 不应继续使用的旧写法

| 旧写法或说法 | 当前处理方式 |
| --- | --- |
| `&player::getLocation()` | `&player::location()` |
| `&event::clickedBlock` | `&event::clickedBlock()` |
| 无参 `&event::getDamage()` | `&event::damage()` |
| 无参 `&event::getEntity()` | 使用对应事件已注册的 `&event::entity()` |
| “PlayerMoveEvent 没有 from/to” | 当前可使用 `&event::from()` 与 `&event::to()` |
| `AiyatsbusProperty` / `PropertyXxx.kt` 属性表 | 当前 Fluxon 通过 `registerExtension` 注册扩展，应按实际版本核对 |
| Kether Explorer 是 Fluxon 的 API 真值 | 它可作为旧资料线索，但不能证明 Fluxon 函数可用 |

## 继续查证的顺序

1. 查看本机正在部署的 Aiyatsbus JAR 版本。
2. 查看当前 Aiyatsbus 的 `script-fluxon` 模块和它携带的 Fluxon 扩展源码。
3. 在独立测试配置中只调用一个新函数，reload 后看完整堆栈。
4. 通过后再合入正式附魔，并按 [验证与实服验收](./validation) 做游戏内测试。
