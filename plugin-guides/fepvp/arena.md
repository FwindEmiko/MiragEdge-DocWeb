---
title: 竞技场管理
outline: deep
---

# 02 — 竞技场管理

## 概述

竞技场是比赛发生的场所。每个竞技场有独立的世界、出生点、类型（单挑/团队/饥饿游戏/通用）以及独立的方块保护设置。

## 竞技场类型

| 类型 | 说明 | 默认人数 |
|------|------|----------|
| `DUEL` | 单挑（1v1，固定 2 人） | 2 |
| `TEAM` | 团队（2v2/3v3/4v4，按每队人数算） | 4/队 |
| `FFA` | 饥饿游戏（单人求生） | 8 |
| `BOTH` | 通用（单挑/团队均可用） | 4/队 |

类型可在创建时指定，或用 ```/fepvp arena settype``` 修改。

## 创建流程

```
/create → setworld → setspawn 1 → setspawn 2 → [setspawn spectator] → [setspawn lobby]
```

### 详细步骤

#### 1. 创建竞技场

```
/fepvp arena create 森林竞技场 duel
/fepvp arena create 沙漠战场 team
/fepvp arena create 饥饿岛 ffa
/fepvp arena create 通用场 both
```

- 名称：`森林竞技场`（唯一标识，不可重复，不含点号）
- 类型：`duel`（单挑）、`team`（团队）、`ffa`（饥饿游戏）或 `both`（通用）
- 可选**方块保护参数**（见下文"场地级方块保护"）：
  - `allowbreak` / `nobreak`（也接受 `break` / `denybreak`）
  - `allowplace` / `noplace`（也接受 `place` / `denyplace`）
  - 不填则跟随全局 ```protection.block-break / block-place```

示例：创建一个"只能战斗、不能破坏/放置"的单挑场地：

```
/fepvp arena create 冰面竞技场 duel nobreak noplace
```

#### 2. 设置世界

前往目标世界，执行：

```
/fepvp arena setworld 森林竞技场
```

自动将当前世界设为该竞技场的世界。

#### 3. 设置出生点

站在红队/玩家1 出生位置：

```
/fepvp arena setspawn 森林竞技场 1
```

站在蓝队/玩家2 出生位置：

```
/fepvp arena setspawn 森林竞技场 2
```

可选 — 观战者出生点：

```
/fepvp arena setspawn 森林竞技场 spectator
```

可选 — 大厅传送点（比赛结束传送回去）：

```
/fepvp arena setspawn 森林竞技场 lobby
```

#### 4. 验证

```
/fepvp arena info 森林竞技场
```

输出示例：

```
=== 竞技场: 森林竞技场 ===
类型: 团队
模式: 击杀数制
目标击杀数: 15
世界: pvp_forest
方块破坏: 跟随全局
方块放置: 跟随全局
状态: 启用
出生点1: 已设置
出生点2: 已设置
准备就绪: 是
```

`准备就绪: 是` 表示该竞技场可投入使用。

## 其他操作

### 列出所有竞技场

```
/fepvp arena list
```

### 修改类型

```
/fepvp arena settype 森林竞技场 team
/fepvp arena settype 森林竞技场 ffa    # 转饥饿游戏
```

### 修改每队最大人数（单挑不可用，固定 2 人）

```
/fepvp arena setmaxplayers 森林竞技场 4
```

### 修改团队模式

```
/fepvp arena setmode 森林竞技场 elimination    # 淘汰制（默认）
/fepvp arena setmode 森林竞技场 killcount     # 击杀数制
```

- **淘汰制**：队员全部阵亡即淘汰
- **击杀数制**：死亡后 5 秒复活（保留装备 + 短暂无敌），先达到目标击杀数的队伍获胜

> 单挑/饥饿游戏场地不支持设置模式（单挑固定淘汰制）。

### 设置目标击杀数（击杀数制专用）

```
/fepvp arena setkillcount 森林竞技场 15
```

### 场地级方块保护（创建时选择，不必全局写死）

每个竞技场可以单独设置"是否允许破坏/放置方块"，优先级高于全局配置 ```protection.block-break / block-place```：

- 创建时指定：`allowbreak` / `nobreak`、`allowplace` / `noplace`
- 创建后随时调整：

```
/fepvp arena setbreak 冰面竞技场 allow    # allow | deny
/fepvp arena setplace 冰面竞技场 deny
```

- 查看当前设置：```/fepvp arena info 冰面竞技场```
- `arenas.yml` 中对应字段为 `block-break` / `block-place`（**仅显式设置时存在**）
- 未显式设置的竞技场显示"跟随全局"，由 config.yml 的全局开关决定

> 全局默认 ```block-break: false / block-place: false```。需要破坏/放置的场地（或 FFA 开箱）请显式开启，或把 ```protection.interact``` 设为 `true`。

### 设置显示图标

```
/fepvp arena seticon 森林竞技场 DIAMOND_SWORD
```

设置竞技场在大厅选图列表中的显示物品。

### 饥饿游戏补给箱扫描

```
/fepvp arena scanloot 饥饿岛
```

显示 FFA 场地恢复区域内检测到的补给箱数量、物品总数与坐标，用于确认补给箱摆放正确。

### 删除竞技场

```
/fepvp arena remove 森林竞技场
```

## arenas.yml 存储格式

文件位置：```plugins/FE_PVP/arenas.yml```

```yaml
arenas:
  森林竞技场:
    type: DUEL            # DUEL | TEAM | FFA | BOTH
    world: pvp_forest
    spawn1:
      world: pvp_forest
      x: 100.5
      y: 64.0
      z: 200.5
      yaw: 90.0
      pitch: 0.0
    spawn2:
      world: pvp_forest
      x: 120.5
      y: 64.0
      z: 200.5
      yaw: -90.0
      pitch: 0.0
    spectator-spawn:
      world: pvp_forest
      x: 110.5
      y: 80.0
      z: 200.5
      yaw: 0.0
      pitch: 30.0
    lobby-spawn:
      world: world
      x: 0.5
      y: 64.0
      z: 0.5
      yaw: 0.0
      pitch: 0.0
    max-players-per-team: 4
    mode: KILL_COUNT        # ELIMINATION | KILL_COUNT
    kill-count-target: 15   # 仅击杀数制生效
    icon: GRASS_BLOCK       # 选图列表显示物品
    block-break: true       # 场地级（可选，仅显式设置时存在）
    block-place: false      # 场地级（可选，仅显式设置时存在）
    enabled: true
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | String | `DUEL` / `TEAM` / `FFA` / `BOTH` |
| `world` | String | 竞技场所在世界 |
| `spawn1` / `spawn2` | Location | 红队/玩家1、蓝队/玩家2 出生点 |
| `spectator-spawn` | Location | 观战者出生点（可选） |
| `lobby-spawn` | Location | 大厅传送点（可选） |
| `max-players-per-team` | Int | 每队最大人数（单挑固定 2；FFA 为该值） |
| `mode` | String | `ELIMINATION`（淘汰制）/ `KILL_COUNT`（击杀数制） |
| `kill-count-target` | Int | 击杀数制目标击杀数 |
| `icon` | Material | 选图列表显示物品（默认 GRASS_BLOCK） |
| `block-break` | Boolean | 场地级允许破坏（可选；缺省=跟随全局） |
| `block-place` | Boolean | 场地级允许放置（可选；缺省=跟随全局） |
| `enabled` | Boolean | 是否启用 |

## 竞技场类型过滤

| 类型 | 在大厅 GUI 中显示为 | 可用于 |
|------|---------------------|--------|
| `DUEL` | 单挑地图 | 单挑选图（⚔ 单挑）、快速匹配 |
| `TEAM` | 团队地图 | 团队竞技选图 |
| `FFA` | 饥饿游戏地图 | 大厅 🥣 饥饿游戏（单人求生） |
| `BOTH` | 通用地图 | 单挑和团队均可使用（也出现在饥饿游戏列表） |
