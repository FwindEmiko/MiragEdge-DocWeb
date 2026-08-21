---
title: Aiyatsbus 附魔配置工作流 · 模块结构
description: 按职责拆分 Aiyatsbus YAML：定义、显示、变量、机制与可选元数据。
---

# 模块结构

> 本文档基于 Aiyatsbus 官方技能包 v0.0.2，以当前服务器源码和配置为准。

一份附魔配置应按职责组织，而不是把数值、显示和脚本混在同一段里。当前上游默认包的基本结构如下：

```yaml
basic:
  enable: true
  disable_worlds: []
  id: example_enchant
  name: "示例附魔"
  max_level: 3

rarity: 稀有
targets:
  - 剑
limitations:
  - "CONFLICT_GROUP:示例冲突组"

display:
  description:
    general: "效果总说明"
    specific: "等级参数：&a{伤害增加}"

variables:
  leveled:
    伤害增加: "%:5*{level}"

mechanisms:
  listeners:
    on-damage:
      listen: entity-damage-other
      handle: |-
        damage = &event::damage()
        &event::setDamage(&damage * (1.0 + &伤害增加 / 100.0))
```

## 定义层

| 节点 | 负责内容 | 修改原则 |
| --- | --- | --- |
| `basic` | ID、名称、等级、启用状态、禁用世界 | ID 一旦投入使用尽量不改 |
| `rarity` | 获取权重所属的稀有度 | 使用当前服务器已有稀有度名称 |
| `targets` | 能附着的装备类别 | 先用现有可加载配置中的目标名验证 |
| `limitations` | 冲突限制 | 同类互斥优先复用已有冲突组 |
| `alternative` | 原版替代和获取元数据 | 普通自定义附魔可省略 |

不要把 `enable: false` 当成数据包或原版附魔的替代开关。它只控制当前 Aiyatsbus 配置；其他实现仍可能继续生效。

## 显示层

`display` 只负责向玩家展示效果，不应成为机制真值来源。

```yaml
display:
  format:
    previous: "{default_previous} &7({当前累计}/{击杀累计})"
  description:
    general: "累计击杀后强化下一次攻击"
    specific: "每击杀 &a{击杀累计} &7个生物，伤害提高 &a{伤害增加}"
```

- `general` 描述机制总览。
- `specific` 可引用变量，数值必须与脚本使用的变量一致。
- 任何影响玩家理解的冷却、上限、触发条件和例外，都应明确写入展示文本。

修改数值后，同步检查描述和实际脚本。显示正确不表示变量公式或事件逻辑正确。

## 变量层

### `ordinary`

固定常量。适合不随等级和物品状态变化的配置值。

```yaml
variables:
  ordinary:
    最大目标数: 3
```

### `leveled`

随附魔等级计算的值。`{level}` 由当前附魔等级替换。

```yaml
variables:
  leveled:
    伤害增加: "%:5*{level}"
    冷却: "秒:6-{level}"
```

单位前缀的含义来自 Aiyatsbus 变量系统和现有配置；复刻时保持同类文件的写法，避免把显示单位和计算值混在一起。

### `modifiable`

物品状态变量。它可随物品保存，例如连击层数、充能状态或剩余次数。

```yaml
variables:
  modifiable:
    当前累计: current_total=0
```

脚本中统一通过函数读写：

```text
total = int(variables::modifiable(&enchant, &item, "当前累计"))
variables::setModifiable(&enchant, &item, "当前累计", &total + 1)
```

不要写 `&当前累计 = ...`。事件或 ticker 执行前会把当前值放入脚本上下文供读取，但给上下文变量赋值不会写回物品。

## 机制层

`mechanisms` 当前主要包含 `listeners`、`tickers` 和技能类触发器。每个子节点的键名用于区分触发器，真正的事件由 `listen` 指定。

### 事件监听器

```yaml
mechanisms:
  listeners:
    on-damage:
      listen: entity-damage-other
      handle: |-
        damage = &event::damage()
        &event::setDamage(&damage * 1.1)
```

- `listen` 是 Aiyatsbus 监听的事件标识。
- `handle` 是对应脚本，只有该监听器执行时才有 `&event`。
- 事件对象的可用方法取决于事件类型，不能从另一个事件复制 `&event::...` 调用。

### Ticker

```yaml
mechanisms:
  tickers:
    active-check:
      interval: 20
      handle: |-
        # 每 20 tick 执行一次
```

Ticker 默认间隔为 20 tick。它可以使用 `pre-handle`、`handle`、`post-handle`，分别在启动前、周期执行和停止后运行。

Ticker 的成本与装备玩家数量和执行频率相乘。先用 20 tick 或更低频率实现，确认确实需要高频状态更新后再缩短间隔。不要把 `pre-handle`/`post-handle` 当成全局属性保存和恢复的通用方案：这会与其他装备、插件、原版和数据包 modifier 相互覆盖。

## `alternative` 与获取元数据

`alternative` 允许设置 `weight`、`is-treasure`、`is-cursed`、`is-tradeable`、`is-discoverable`、各渠道最高等级和 `inaccessible` 等元数据。当前源码在省略该节点时会使用默认值。

仅在设计明确要求时添加它。尤其是 `is-vanilla: true` 只用于原版附魔替代场景，必须与原版 ID、获取方式和实际机制一起测试；不要把它作为“让自定义附魔兼容数据包”的开关。

## 建议的改动粒度

1. 先只改定义和显示，重载后确认注册、ID、书本和目标槽位。
2. 再添加一个监听器，先让它做无副作用或固定数值的最小行为。
3. 最后添加持久变量、冷却、ticker 或跨事件状态。
4. 每一步都走一遍 [验证与实服验收](./validation)，避免把加载错误、触发错误和数值错误混成一个问题。
