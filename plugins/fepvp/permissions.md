---
title: 权限节点
outline: deep
---

# 06 — 权限节点

## 权限树

| 权限 | 默认值 | 说明 |
|------|--------|------|
| `fepvp.use` | `true` | 基础命令使用权（所有玩家） |
| `fepvp.admin` | `op` | 管理员命令（竞技场/装备管理） |
| `fepvp.spectate` | `true` | 可观战比赛 |
| `fepvp.owngear` | `true` | 比赛中使用自己的装备 |
| `fepvp.stats.others` | `op` | 查看其他玩家的统计数据 |

## 权限详情

### fepvp.use

所有玩家默认拥有。允许使用以下功能：

- `/fepvp` — 打开大厅 GUI
- `/fepvp room` — 查看/加入/创建房间
- `/fepvp room leave` — 离开房间
- `/fepvp leave` — 离开比赛
- `/fepvp stats` — 查看自己的统计
- `/fepvp kit` — 打开装备选择 GUI

### fepvp.admin

仅 OP 默认拥有。允许使用：

- `/fepvp admin arena` — 创建/删除/设置竞技场
- `/fepvp admin kit` — 创建/删除/编辑装备组合
- `/fepvp admin reload` — 重载配置
- `/fepvp admin setlobby` — 设置大厅位置
- `/fepvp admin forcestart` — 强制开始比赛
- `/fepvp admin forcestop` — 强制结束比赛

## 权限继承配置

### LuckPerms 示例

```bash
# 所有玩家（默认已有）
# lp group default permission set fepvp.use true

# 禁止某玩家观战
/lp user BadPlayer permission set fepvp.spectate false

# 给予管理员完整权限
/lp group admin permission set fepvp.admin true
```

### PermissionsEx 示例

```yaml
groups:
  default:
    permissions:
      - fepvp.use
      - fepvp.spectate
      - fepvp.owngear
  admin:
    permissions:
      - fepvp.admin
      - fepvp.stats.others
    inheritance:
      - default
```
