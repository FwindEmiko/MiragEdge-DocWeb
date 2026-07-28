---
title: 竞技场管理
outline: deep
---

# 02 — 竞技场管理

## 概述

竞技场是比赛发生的场所。每个竞技场有独立的世界、出生点、类型（单挑/团队/通用）。

## 创建流程

```
/create → setworld → setspawn 1 → setspawn 2 → [setspawn spectator] → [setspawn lobby]
```

### 详细步骤

#### 1. 创建竞技场

```
/fepvp admin arena create 森林竞技场 duel
```

- 名称：`森林竞技场`（唯一标识，不可重复）
- 类型：`duel`（单挑）、`team`（团队）或 `both`（通用）

#### 2. 设置世界

前往目标世界，执行：

```
/fepvp admin arena setworld 森林竞技场
```

自动将当前世界设为该竞技场的世界。

#### 3. 设置出生点

站在红队出生位置：

```
/fepvp admin arena setspawn 森林竞技场 1
```

站在蓝队出生位置：

```
/fepvp admin arena setspawn 森林竞技场 2
```

可选 — 观战者出生点：

```
/fepvp admin arena setspawn 森林竞技场 spectator
```

可选 — 大厅传送点（比赛结束传送回去）：

```
/fepvp admin arena setspawn 森林竞技场 lobby
```

#### 4. 验证

```
/fepvp admin arena info 森林竞技场
```

输出示例：

```
=== 竞技场: 森林竞技场 ===
类型: 团队
模式: 击杀数制
目标击杀数: 15
世界: pvp_forest
状态: 启用
每队人数: 4
出生点1: 已设置
出生点2: 已设置
准备就绪: 是
```

`准备就绪: 是` 表示该竞技场可投入使用。

## 其他操作

### 列出所有竞技场

```
/fepvp admin arena list
```

### 修改类型

```
/fepvp admin arena settype 森林竞技场 team
```

### 修改每队最大人数

```
/fepvp admin arena setmaxplayers 森林竞技场 4
```

### 修改团队模式

```
/fepvp admin arena setmode 森林竞技场 elimination    # 淘汰制（默认）
/fepvp admin arena setmode 森林竞技场 killcount     # 击杀数制
```

- **淘汰制**：队员全部阵亡即淘汰
- **击杀数制**：死亡后 2 秒复活（保留装备 + 短暂无敌），先达到目标击杀数的队伍获胜

### 设置目标击杀数（击杀数制专用）

```
/fepvp admin arena setkillcount 森林竞技场 15
```

### 删除竞技场

```
/fepvp admin arena remove 森林竞技场
```

## arenas.yml 存储格式

文件位置：`plugins/FE_PVP/arenas.yml`

```yaml
arenas:
  森林竞技场:
    type: DUEL
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
    enabled: true
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `type` | String | `DUEL` / `TEAM` / `BOTH` |
| `world` | String | Multiverse 世界名 |
| `spawn1` | Location | 红队/玩家1 出生点 |
| `spawn2` | Location | 蓝队/玩家2 出生点 |
| `spectator-spawn` | Location | 观战者出生点（可选） |
| `lobby-spawn` | Location | 大厅传送点（可选） |
| `max-players-per-team` | Int | 每队最大人数 |
| `mode` | String | `ELIMINATION`（淘汰制） / `KILL_COUNT`（击杀数制） |
| `kill-count-target` | Int | 击杀数制目标击杀数 |
| `enabled` | Boolean | 是否启用 |

## 竞技场类型过滤

| 类型 | 在大厅 GUI 中显示为 | 可用于 |
|------|---------------------|--------|
| `DUEL` | 单挑地图 | `/fepvp duel` 选图、队列匹配 |
| `TEAM` | 团队地图 | 团队竞技选图 |
| `BOTH` | 同时出现在两个列表 | 单挑和团队均可使用 |
