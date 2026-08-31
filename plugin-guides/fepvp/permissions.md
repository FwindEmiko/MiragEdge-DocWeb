---
title: 权限节点
outline: deep
---

# 06 — 权限节点

## 权限树

| 权限 | 默认值 | 说明 |
|------|--------|------|
| `fepvp.use` | `true` | 基础命令使用权（所有玩家） |
| `fepvp.admin` | `op` | 管理员命令（竞技场/装备管理/强停等） |
| `fepvp.spectate` | `true` | 可观战比赛 |
| `fepvp.owngear` | `true` | 比赛中使用自己的装备 |
| `fepvp.stats.others` | `op` | 查看其他玩家的统计数据 |
| `fepvp.bypass.worldguard` | `op` | 绕过竞技场世界保护（非竞技状态也能进入） |
| `fepvp.bet` | `true` | 可创建/加入押注局 |
| `fepvp.bet.create` | `true` | 可创建押注房间 |
| `fepvp.bet.custom` | `true` | 可用 `/fepvp bet <金额>` 自定义押金 |
| `fepvp.bet.admin` | `op` | 押注管理（`admin bet stats/refund/pending`） |

## 权限详情

### fepvp.use

所有玩家默认拥有。允许使用以下功能：

- ```/fepvp``` — 打开大厅 GUI
- ```/fepvp room``` — 查看/加入/创建房间、```/fepvp room leave```、```/fepvp room start```
- ```/fepvp leave``` — 离开比赛
- ```/fepvp stats``` — 查看自己的统计
- ```/fepvp team join/leave/info``` — 团队比赛选队等
- ```/fepvp lobby``` — 传送到竞技大厅

### fepvp.admin

仅 OP 默认拥有。允许使用：

- ```/fepvp arena ...``` — 竞技场管理（创建/删除/设置/扫描补给箱）
- ```/fepvp kit ...``` — 装备组合管理（创建/删除/编辑）
- ```/fepvp admin reload``` — 重载配置
- ```/fepvp admin setlobby``` — 设置大厅位置
- ```/fepvp admin forcestart / forcestop``` — 强制开始/结束比赛

### fepvp.bet 系列

押注局相关权限，默认对所有玩家开放（`fepvp.bet.admin` 除外）：

- `fepvp.bet` — 使用押注功能
- `fepvp.bet.create` — 创建押注房间
- `fepvp.bet.custom` — 自定义押注金额
- `fepvp.bet.admin` — 押注对账与人工退款

## 权限继承配置

### LuckPerms 示例

```bash
# 所有玩家（默认已有）
# lp group default permission set fepvp.use true

# 禁止某玩家观战
/lp user BadPlayer permission set fepvp.spectate false

# 给予管理员完整权限
/lp group admin permission set fepvp.admin true

# 允许某个组使用押注功能（默认已 true，无需额外设置）
# lp group vip permission set fepvp.bet true
```

### PermissionsEx 示例

```yaml
groups:
  default:
    permissions:
      - fepvp.use
      - fepvp.spectate
      - fepvp.owngear
      - fepvp.bet
      - fepvp.bet.create
      - fepvp.bet.custom
  admin:
    permissions:
      - fepvp.admin
      - fepvp.stats.others
      - fepvp.bypass.worldguard
      - fepvp.bet.admin
    inheritance:
      - default
```
