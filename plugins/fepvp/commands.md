---
title: 命令参考
outline: deep
---

# 07 — 命令参考

## 主命令

`/fepvp` — 支持别名：`/pvpp`、`/arena`、`/duel`

所有子命令通过 Tab 自动补全。

## 玩家命令

| 命令 | 权限 | 说明 |
|------|------|------|
| `/fepvp` | `fepvp.use` | 打开大厅 GUI |
| `/fepvp room` | `fepvp.use` | 查看当前房间 / 打开房间列表 |
| `/fepvp room leave` | `fepvp.use` | 离开当前房间 |
| `/fepvp leave` | `fepvp.use` | 离开当前比赛 |
| `/fepvp kit` | `fepvp.use` | 打开装备选择 GUI |
| `/fepvp stats [玩家]` | `fepvp.use` | 查看统计数据 |
| `/fepvp spectate` | `fepvp.spectate` | 观战比赛 |

## 管理员命令

| 命令 | 权限 | 说明 |
|------|------|------|
| `/fepvp admin reload` | `fepvp.admin` | 重载配置和语言文件 |
| `/fepvp admin setlobby` | `fepvp.admin` | 将当前位置设为大厅 |
| `/fepvp admin forcestart <竞技场>` | `fepvp.admin` | 强制开始比赛 |
| `/fepvp admin forcestop <竞技场>` | `fepvp.admin` | 强制结束比赛 |

### 竞技场管理

| 命令 | 权限 | 说明 |
|------|------|------|
| `/fepvp admin arena create <名称> <duel/team>` | `fepvp.admin` | 创建竞技场 |
| `/fepvp admin arena remove <名称>` | `fepvp.admin` | 删除竞技场 |
| `/fepvp admin arena setworld <名称>` | `fepvp.admin` | 将当前世界设为竞技场世界 |
| `/fepvp admin arena setspawn <名称> <1/2/spectator/lobby>` | `fepvp.admin` | 设置出生点 |
| `/fepvp admin arena settype <名称> <duel/team/both>` | `fepvp.admin` | 修改竞技场类型 |
| `/fepvp admin arena setmaxplayers <名称> <人数>` | `fepvp.admin` | 设置每队最大人数 |
| `/fepvp admin arena setmode <名称> <elimination/killcount>` | `fepvp.admin` | 设置团队模式 |
| `/fepvp admin arena setkillcount <名称> <数量>` | `fepvp.admin` | 设置击杀数制目标 |
| `/fepvp admin arena list` | `fepvp.admin` | 列出所有竞技场 |
| `/fepvp admin arena info <名称>` | `fepvp.admin` | 查看竞技场详情 |

### 装备管理

| 命令 | 权限 | 说明 |
|------|------|------|
| `/fepvp admin kit create <名称>` | `fepvp.admin` | 从当前背包创建装备组合 |
| `/fepvp admin kit remove <名称>` | `fepvp.admin` | 删除装备组合 |
| `/fepvp admin kit edit <名称>` | `fepvp.admin` | 打开 GUI 编辑器 |
| `/fepvp admin kit list` | `fepvp.admin` | 列出所有装备组合 |

## 命令流程示例

### 房间对战

```
大厅 GUI → ⚔ 单挑 → 房间列表
  → 点击已有房间加入
  → 或点击"创建房间" → 选图 → 选装备 → 房间创建完成
  → 等待对手加入（满员自动开赛）或房主点"开始比赛"
```

### 快速匹配

```
大厅 GUI → 🎲 快速匹配
  → 自动创建随机地图房间
  → 等待对手加入
  → 满员自动开赛
```

### 创建团队竞技场

```
/fepvp admin arena create 沙漠战场 team
/fepvp admin arena setworld 沙漠战场
/fepvp admin arena setspawn 沙漠战场 1
/fepvp admin arena setspawn 沙漠战场 2
/fepvp admin arena setmode 沙漠战场 killcount
/fepvp admin arena setkillcount 沙漠战场 15
```
