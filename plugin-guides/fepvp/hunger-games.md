---
title: 饥饿游戏模式
description: FE_PVP 饥饿游戏模式的配置与建场参考——最少开局人数、开局补给箱扫描与洗牌、赛后复原等配置项，以及场地创建命令、补给箱预览与结算规则。
outline: [2, 3]
---

# 饥饿游戏模式

饥饿游戏是 FE_PVP 的单人求生（FFA）模式，所有玩家各自为战，靠场地补给箱活到最后。

## 模式机制

1. 开局条件：房间至少 `hunger-games.min-players` 人（默认 3）才能开局；满员自动开，房主也可执行 `/fepvp room start`。
2. 饥饿游戏不经过装备组合选择，直接建房。
3. 开局流程：
   - 自动扫描场地区域内所有补给箱（箱子、陷阱箱、木桶，双箱去重）。
   - 把场内全部物品收集进池子，随机洗牌后均匀分散回所有箱子，每局位置随机。
   - 玩家清空背包，`start-empty: false` 可保留自带装备。
   - 环形出生在 spawn1 周围，出生点冻结并倒计时。
4. 战斗：死亡自动转观战，BossBar 实时显示存活人数。
5. 结束：活到最后 1 人获胜；超时按击杀数最高者获胜，无击杀则平局。
6. 赛后：场地方块分批复原（tile 实体保真）；补给箱内容恢复为开局前的种子状态，下一局重新随机分散；掉落物、箭矢与经验球按 `protection.clean-drops` 清理。

房间需要选择 `FFA` 类型的地图。管理员可用 `/fepvp arena settype <名称> ffa` 把已有场地转换为 FFA 类型。

## 配置

```yaml
hunger-games:
  min-players: 3        # 最少玩家数，少于该人数无法开局
  start-empty: true     # 开局清空自带装备（靠补给箱获取）
  loot-distribute: true # 开局自动把场内箱子物品均匀分散到所有箱子
```

## 建场与管理命令

```text
/fepvp arena create 饥饿岛 ffa nobreak noplace
/fepvp arena setworld 饥饿岛
/fepvp arena setspawn 饥饿岛 1
/fepvp arena setspawn 饥饿岛 2
/fepvp arena scanloot 饥饿岛
```

::: tip 场地级方块保护
不想让玩家破坏或放置场地（防拆箱、挖地）时，创建时加 `nobreak` 与 `noplace`。场地设置优先于全局 `block-break` 与 `block-place`，开箱不受影响。
:::

`/fepvp arena scanloot` 显示箱子数量、物品总数与坐标，用于确认补给箱摆放正确。

### 补给箱摆放

- 补给箱放在场地区域内，即两出生点包围盒加 `protection.restore-region-radius` 外扩。
- 建议把箱子放在场地中心供争夺。
- 无补给箱时开局仍可进行，全员空手互搏。

## 统计与结算

- ELO 与胜负：胜者按对手平均分计算增益，被淘汰者记失败。
- 中途退赛按失败单独结算，避免重复扣分。
- 比赛队列与竞技场占用和单挑、团队共用 `arenaGames` 机制，同一竞技场同时只允许一种模式。
