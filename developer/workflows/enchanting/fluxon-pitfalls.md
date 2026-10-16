---
title: Fluxon 避坑
description: Fluxon 脚本最常见的失败原因是对着 Java 方法名猜函数名。这页给出旧写法到当前写法的对照表、各事件可用的调用名，以及从 JAR 反查函数的顺序。
outline: [2, 3]
---

# Fluxon 避坑

这页用来排除 `FunctionNotFoundException` 一类“函数名写了但不存在”的错误。Fluxon 的 `::` 调用名不等于 Bukkit Java 方法名，因此旧 Kether 示例、论坛片段和按照 getter 名字直译的写法都会失败。

已核实的语法、标准库和调用语义见 [Fluxon 语言参考](./fluxon-language)、[内置函数与扩展函数](./fluxon-stdlib) 和 [Bukkit/Java 调用语义](./fluxon-bukkit-java-semantics)。本页只收录哪些写法已经不能再用了。

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

判断规则集中在两处：无参数 getter 去掉 `get` 前缀，有参数 getter 保留 `get`；`clickedBlock` 一类名称是函数，必须写括号。完整规则见 [Bukkit/Java 调用语义](./fluxon-bukkit-java-semantics)。

## 已核实的事件调用名

| 事件类别 | 可用调用 | 说明 |
| --- | --- | --- |
| 伤害 | `&event::damage()`、`&event::setDamage(...)`、`&event::cause()` | 当前伤害总值使用 `damage()`；`getDamage` 只存在带 DamageModifier 参数的重载 |
| 交互 | `&event::action()`、`&event::isRightClick()`、`&event::isClickBlock()`、`&event::clickedBlock()`、`&event::hand()` | `clickedBlock` 是函数，需要括号 |
| 移动 | `&event::from()`、`&event::to()`、`&event::setFrom(...)`、`&event::setTo(...)` | 当前 Fluxon Bukkit 扩展已注册 PlayerMoveEvent 的这些方法 |
| 投射物命中 | `&event::entity()`、`&event::hitBlock()`、`&event::hitBlockFace()`、`&event::hitEntity()` | 使用前先处理空目标或命中类型 |

`event` 变量只在 Listener 的 `handle` 中存在。`&event` 不能用在 ticker 中，事件型脚本也不要复制进 ticker 后继续调用 `&event::...`。

## 继续查证的顺序

1. 查看本机正在部署的 Aiyatsbus JAR 版本。
2. 查看当前 Aiyatsbus 的 `script-fluxon` 模块和它携带的 Fluxon 扩展源码。
3. 在独立测试配置中只调用一个新函数，reload 后看完整堆栈。
4. 通过后再合入正式附魔，并按 [验证与实服验收](./validation) 做游戏内测试。

出现 `FunctionNotFoundException` 时，优先从实际 Fluxon 扩展源码核对函数名、参数数和事件类型，不要根据 Bukkit Java 方法名猜测 `::` 右侧名称，也不要把旧 Kether 示例改一个分隔符后直接使用。
