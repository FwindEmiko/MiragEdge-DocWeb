---
title: Stellarity 技术附魔说明
description: Stellarity 数据包 _technical/* 技术附魔标记说明——它们不是玩家可独立获取的高级附魔，仅用于让 Aiyatsbus 识别数据包物品上的内部附魔标记。
head:
  - - meta
    - name: keywords
      content: Stellarity 技术附魔, _technical, Aiyatsbus, daybroken, draconic, infernal_infusion, mighty_wind, prismatic_pearl_return, soul_harvest, void_pendant
---

# Stellarity 技术附魔说明

> 适用包：`Stellarity-5.5.4.zip`（命名空间 `stellarity`）  \
> 面向：开发者 / 维护者

以下 ID 仅用于让 Aiyatsbus 识别数据包物品上的内部附魔标记，**不是玩家可独立获取的高级附魔**。它们不应出现在「高级附魔获取列表」中，也不应宣传为可通过村民、附魔台或奖励箱独立获得。

## 技术附魔清单

| ID | 显示名 | 作用 |
| --- | --- | --- |
| `_technical/daybroken` | 破晓 | 万花筒攻击检测标记 |
| `_technical/draconic` | 龙魂灌注 | 龙之刃攻击检测及特殊目标伤害标记 |
| `_technical/infernal_infusion` | 地狱灌注 | 棱彩武器的棱彩炼狱标记 |
| `_technical/mighty_wind` | 狂风 | 沙尘暴三叉戟投掷检测和内置忠诚标记 |
| `_technical/prismatic_pearl_return` | 棱彩珍珠回收标记 | 棱彩珍珠回收标记 |
| `_technical/soul_harvest` | 灵魂收割者 | 收割机攻击检测标记 |
| `_technical/void_pendant/*` | 虚空吊坠 | 虚空吊坠九种材质属性标记，对应夜视、电弧、攻击速度、幸运、挖掘、减伤、经验、伤害和移动属性 |

## 边界

- 高级附魔获取方式以服务器当前 Aiyatsbus 获取池和奖励箱配置为最终准则；数据包原始战利品池只作为来源说明。
- 玩家侧「高级附魔」列表见 [繁星 · 高级附魔](/play/adventure/worlds/stellarity/enchantments)，仅包含 8 个主附魔，不含技术标记。
- 若在调试或 Geyser 转换中看到这些 ID，它们属于数据包内部机制，不是需要向玩家开放的附魔条目。
