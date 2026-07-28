---
title: 配置参考
outline: deep
---

# 05 — 配置参考

文件位置：`plugins/FE_PVP/config.yml`

## 完整字段表

### database

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `database.type` | String | `sqlite` | 数据库类型：`sqlite` / `mysql` |
| `database.mysql.host` | String | `localhost` | MySQL 主机地址 |
| `database.mysql.port` | Int | `3306` | MySQL 端口 |
| `database.mysql.database` | String | `fepvp` | 数据库名 |
| `database.mysql.user` | String | `root` | 用户名 |
| `database.mysql.password` | String | `""` | 密码 |

### game

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `game.max-duration` | Int | `600` | 最长比赛时长（秒），超时平局 |
| `game.countdown` | Int | `10` | 赛前倒计时（秒） |
| `game.allow-spectators` | Boolean | `true` | 允许观战 |
| `game.max-spectators` | Int | `-1` | 观战者上限（-1 = 不限） |
| `game.teleport-delay` | Int | `5` | 比赛结束传送延迟（秒） |

### kit

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `kit.allow-own-gear` | Boolean | `true` | 允许玩家使用自己的装备 |
| `kit.allow-kit-switch` | Boolean | `true` | 允许等待阶段换装备 |

### protection

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `protection.block-break` | Boolean | `true` | 允许竞技场中破坏方块 |
| `protection.block-place` | Boolean | `true` | 允许竞技场中放置方块 |
| `protection.auto-restore` | Boolean | `true` | 比赛结束后自动复原方块 |
| `protection.interact` | Boolean | `false` | 允许竞技场中交互 |
| `protection.hunger-loss` | Boolean | `false` | 允许竞技场中饥饿 |
| `protection.natural-regeneration` | Boolean | `false` | 允许自然生命恢复 |

## 方块复原说明

`auto-restore` 需要 `block-break` 和 `block-place` 同时为 `true` 才生效。

工作原理：

1. 比赛中被破坏/放置的方块原始状态被记录
2. 每 10 个变化增量写盘（崩溃保护）
3. 比赛结束遍历恢复所有方块
4. 服务端崩溃重启时自动扫描残留文件补恢复

## 示例配置

```yaml
database:
  type: sqlite

game:
  max-duration: 300       # 5 分钟
  countdown: 5            # 5 秒倒计时
  allow-spectators: true
  max-spectators: 4       # 最多 4 人观战
  teleport-delay: 3

kit:
  allow-own-gear: false   # 禁用自带装备
  allow-kit-switch: true

protection:
  block-break: true
  block-place: true
  auto-restore: true      # 赛后自动复原方块
  interact: false
  hunger-loss: false
  natural-regeneration: false
```
