---
title: 命令参考
outline: deep
---

# 07 — 命令参考

## 主命令

```/fepvp``` — 支持别名：```/pvpp```、```/arena```、```/duel```。

所有子命令通过 Tab 自动补全。

> **重要**：竞技场与装备组合管理是**顶层子命令**，直接使用 ```/fepvp arena ...``` 与 ```/fepvp kit ...```，**不要**加 `admin` 前缀。`/fepvp admin` 只用于 reload / setlobby / forcestart / forcestop / bet。

## 玩家命令

| 命令 | 权限 | 说明 |
|------|------|------|
| ```/fepvp``` | `fepvp.use` | 打开大厅 GUI |
| ```/fepvp room``` | `fepvp.use` | 查看当前房间 / 打开房间列表 |
| ```/fepvp room leave``` | `fepvp.use` | 离开当前房间 |
| ```/fepvp room start``` | `fepvp.use` | （房主）开始比赛 |
| ```/fepvp room team``` | `fepvp.use` | 打开团队房间列表 |
| ```/fepvp leave``` | `fepvp.use` | 离开比赛 / 退出观战 |
| ```/fepvp stats [玩家]``` | `fepvp.use`（看他人需 `fepvp.stats.others`） | 查看统计数据 |
| ```/fepvp spectate <竞技场>``` | `fepvp.spectate` | 观战比赛 |
| ```/fepvp team join <red/blue>``` | `fepvp.use` | 团队比赛选择队伍 |
| ```/fepvp team leave``` | `fepvp.use` | 离开团队比赛 |
| ```/fepvp team info``` | `fepvp.use` | 查看团队比赛信息 |
| ```/fepvp lobby``` | `fepvp.use` | 传送到竞技大厅 |
| ```/fepvp bet [金额]``` | `fepvp.bet`（自定义金额需 `fepvp.bet.custom`） | 创建押注局 / 设置自定义押金 |

## 管理员命令

| 命令 | 权限 | 说明 |
|------|------|------|
| ```/fepvp admin reload``` | `fepvp.admin` | 重载配置和语言文件 |
| ```/fepvp admin setlobby``` | `fepvp.admin` | 将当前位置设为大厅 |
| ```/fepvp admin forcestart <竞技场>``` | `fepvp.admin` | 强制开始比赛 |
| ```/fepvp admin forcestop <竞技场>``` | `fepvp.admin` | 强制结束比赛 |
| ```/fepvp admin bet stats``` | `fepvp.bet.admin` | 押注流水统计（今日对账） |
| ```/fepvp admin bet pending``` | `fepvp.bet.admin` | 查看未结算（锁定）押注会话 |
| ```/fepvp admin bet refund <玩家> <金额>``` | `fepvp.bet.admin` | 人工退款（异常兜底） |

### 竞技场管理（顶层子命令）

| 命令 | 权限 | 说明 |
|------|------|------|
| ```/fepvp arena create <名称> <duel/team/ffa/both> [nobreak\|allowbreak] [noplace\|allowplace]``` | `fepvp.admin` | 创建竞技场（可选方块保护参数） |
| ```/fepvp arena remove <名称>``` | `fepvp.admin` | 删除竞技场 |
| ```/fepvp arena setworld <名称>``` | `fepvp.admin` | 将当前世界设为竞技场世界 |
| ```/fepvp arena setspawn <名称> <1/2/spectator/lobby>``` | `fepvp.admin` | 设置出生点 |
| ```/fepvp arena settype <名称> <duel/team/ffa/both>``` | `fepvp.admin` | 修改竞技场类型 |
| ```/fepvp arena setmaxplayers <名称> <人数>``` | `fepvp.admin` | 设置每队最大人数（单挑不可用） |
| ```/fepvp arena setmode <名称> <elimination/killcount>``` | `fepvp.admin` | 设置团队模式 |
| ```/fepvp arena setkillcount <名称> <数量>``` | `fepvp.admin` | 设置击杀数制目标 |
| ```/fepvp arena setbreak <名称> <allow/deny>``` | `fepvp.admin` | 场地级允许/禁止破坏 |
| ```/fepvp arena setplace <名称> <allow/deny>``` | `fepvp.admin` | 场地级允许/禁止放置 |
| ```/fepvp arena seticon <名称> <材质>``` | `fepvp.admin` | 设置选图显示图标 |
| ```/fepvp arena scanloot <名称>``` | `fepvp.admin` | 扫描 FFA 场地补给箱 |
| ```/fepvp arena list``` | `fepvp.admin` | 列出所有竞技场 |
| ```/fepvp arena info <名称>``` | `fepvp.admin` | 查看竞技场详情 |

### 装备管理（顶层子命令）

| 命令 | 权限 | 说明 |
|------|------|------|
| ```/fepvp kit create <名称>``` | `fepvp.admin` | 从当前背包创建装备组合 |
| ```/fepvp kit remove <名称>``` | `fepvp.admin` | 删除装备组合 |
| ```/fepvp kit edit <名称>``` | `fepvp.admin` | 打开 GUI 编辑器 |
| ```/fepvp kit settype <名称> <duel/team/both>``` | `fepvp.admin` | 设置装备适用模式 |
| ```/fepvp kit seticon <名称> <材质>``` | `fepvp.admin` | 设置装备显示图标 |
| ```/fepvp kit list``` | `fepvp.admin` | 列出所有装备组合 |

## 命令流程示例

### 房间对战

```
大厅 GUI → ⚔ 单挑 → 房间列表
  → 点击已有房间加入
  → 或点击"创建房间" → 选图 → 选装备 → 房间创建完成
  → 等待对手加入（满员自动开赛）或房主 /fepvp room start
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
/fepvp arena create 沙漠战场 team
/fepvp arena setworld 沙漠战场
/fepvp arena setspawn 沙漠战场 1
/fepvp arena setspawn 沙漠战场 2
/fepvp arena setmode 沙漠战场 killcount
/fepvp arena setkillcount 沙漠战场 15
```

### 创建饥饿游戏场地

```
/fepvp arena create 饥饿岛 ffa nobreak noplace
/fepvp arena setworld 饥饿岛
/fepvp arena setspawn 饥饿岛 1
/fepvp arena setspawn 饥饿岛 2
/fepvp arena scanloot 饥饿岛    # 确认补给箱分布
```

### 创建押注局

```
/fepvp bet 2000              # 直接以 2000 灵叶创建押注房（跳过 GUI）
/fepvp bet                   # 打开押注创建 GUI 选择货币/金额
```
