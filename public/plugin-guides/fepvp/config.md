<!-- 来源页面: https://miragedge.top/plugin-guides/fepvp/config -->
<!-- 由 llms.txt 标准生成器自动产出，源文件: plugin-guides/fepvp/config.md -->

# 05 — 配置参考

文件位置：```plugins/FE_PVP/config.yml```

## 完整字段表

### 基础

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `debug` | Boolean | `true` | 调试日志 |
| `broadcast.room-creation` | Boolean | `true` | 创建房间是否广播 |
| `initial-elo` | Int | `100` | 新玩家初始 ELO |

### database

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `database.type` | String | `sqlite` | 数据库类型：`sqlite` / `mysql` |
| `database.mysql.host` | String | `localhost` | MySQL 主机地址 |
| `database.mysql.port` | Int | `3306` | MySQL 端口 |
| `database.mysql.database` | String | `fepvp` | 数据库名 |
| `database.mysql.user` | String | `root` | 用户名 |
| `database.mysql.password` | String | `""` | 密码 |

### reward（每日奖励）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `reward.enabled` | Boolean | `true` | 是否启用奖励 |
| `reward.playerpoints-base` | Int | `1` | 星痕石基准值（× 段位权重 × 以弱胜强加成） |
| `reward.vault-base` | Double | `200` | 灵叶基准值（× 段位权重 × 以弱胜强加成） |
| `reward.daily-playerpoints-limit` | Int | `50` | 每人每日星痕石上限（0 = 不限，凌晨 0 点刷新） |
| `reward.daily-vault-limit` | Double | `10000` | 每人每日灵叶上限（0 = 不限，凌晨 0 点刷新） |

### game

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `game.max-duration` | Int | `800` | 最长比赛时长（秒），超时平局 |
| `game.countdown` | Int | `12` | 赛前倒计时（秒） |
| `game.allow-spectators` | Boolean | `true` | 允许观战 |
| `game.max-spectators` | Int | `-1` | 观战者上限（-1 = 不限，0 = 禁用） |
| `game.teleport-delay` | Int | `8` | 比赛结束传送延迟（秒） |
| `game.allowed-commands` | List | `[ /msg, /tell, /r, /pvpp leave, /fepvp leave ]` | 比赛中允许执行的命令白名单 |

### room

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `room.timeout` | Int | `3600` | 房间超时自动关闭（秒） |

### hunger-games（饥饿游戏）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `hunger-games.min-players` | Int | `3` | 最少玩家数，少于该人数无法开局 |
| `hunger-games.start-empty` | Boolean | `true` | 开局清空自带装备（两手空空去抢补给箱） |
| `hunger-games.loot-distribute` | Boolean | `true` | 开局扫描补给箱并把物品均匀分散（随机位置） |
| `hunger-games.gui-refresh-ticks` | Int | `20` | FFA 房间 GUI 刷新间隔（tick） |

### kit

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `kit.allow-own-gear` | Boolean | `true` | 允许玩家使用自己的装备 |
| `kit.allow-kit-switch` | Boolean | `true` | 允许等待阶段换装备 |

### protection（方块保护 + 复原）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `protection.block-break` | Boolean | `false` | 全局默认禁止破坏；需要破坏的场地创建时 `allowbreak` 显式开启 |
| `protection.block-place` | Boolean | `false` | 全局默认禁止放置；需要放置的场地创建时 `allowplace` 显式开启 |
| `protection.auto-restore` | Boolean | `true` | 比赛结束后自动复原方块 |
| `protection.restore-region-radius` | Int | `96` | 场地恢复区域外扩半径（两出生点包围盒外扩，Y 取全高度） |
| `protection.restore-per-tick` | Int | `500` | 每 tick 最多恢复方块数（防卡服） |
| `protection.restore-tile-entities` | Boolean | `true` | 保存/恢复 tile 方块实体（容器/告示牌/旗帜/刷怪笼） |
| `protection.clean-drops` | Boolean | `true` | 恢复完成后清理掉落物/箭矢/经验球 |
| `protection.interact` | Boolean | `false` | 允许竞技场中交互（箱子、门等） |
| `protection.hunger-loss` | Boolean | `false` | 允许竞技场中饥饿 |
| `protection.natural-regeneration` | Boolean | `false` | 允许自然生命恢复 |

> **方块保护优先级**：场地显式设置（`create ... allowbreak/nobreak` 或 `setbreak/setplace`）> 全局 `block-break / block-place`。
> **注意**：全局 `block-place: false` 时，非 FFA 场地的箱子默认也无法右键打开（interact 默认 `false`）；需要开箱的场地请显式 `allowplace` 或开启 `protection.interact`。

### world-guard（竞技场世界保护）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `world-guard.enabled` | Boolean | `true` | 启用竞技场世界保护 |
| `world-guard.use-arena-worlds` | Boolean | `true` | 使用 ArenaManager 已注册的竞技场世界作为受保护世界 |
| `world-guard.worlds` | List | `[pvp]` | 手动指定受保护世界（`use-arena-worlds: false` 时生效） |

非竞技状态（未开局/已结束）下，未授权玩家无法进入竞技场世界；OP 或持有 `fepvp.bypass.worldguard` 的玩家可随时进入。

### bet（押注局）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `bet.enabled` | Boolean | `true` | 总开关（对应货币经济插件未装时自动禁用） |
| `bet.currency` | String | `vault` | `vault`(灵叶) / `playerpoints`(星痕石) |
| `bet.min-stake` | Long | `500` | 单方押金下限 |
| `bet.max-stake` | Long | `100000` | 单方押金上限 |
| `bet.default-stakes` | List | `[500,1000,2000,5000,10000,20000]` | 预设金额档位 |
| `bet.allow-custom-amount` | Boolean | `true` | 允许 `/fepvp bet <金额>` 自定义金额 |
| `bet.apply-daily-rewards` | Boolean | `false` | 押注局是否仍发每日低保（默认不发放防双收） |
| `bet.count-elo` | Boolean | `true` | 押注局是否计入 ELO/战绩 |
| `bet.forfeit-on-quit` | Boolean | `true` | 开局后退出 = 弃权判负（弃权方扣钱） |
| `bet.refund-on-cancel` | Boolean | `true` | 开局前取消/强停 = 双方退押 |
| `bet.cooldown-seconds` | Int | `0` | 个人押注局冷却（防脚本刷钱，0 = 关闭） |
| `bet.crash-refund` | Boolean | `true` | 崩溃未完成局自动退押（false = 转人工） |

## 方块复原说明

`protection.auto-restore` 对"允许破坏/放置"的场地生效。工作原理：

1. 比赛中被破坏/放置/爆炸/火焰/活塞/重力方块等产生的变化，原始状态被记录（含 tile 数据）
2. 记录按 5 秒节流写盘（崩溃保护）
3. 比赛结束按 tick 分批复原（`restore-per-tick`），避免卡服；完成后释放竞技场
4. 服务端崩溃重启时自动扫描残留文件补恢复；未加载 chunk 的方块保留待下次启动

## 示例配置

```yaml
database:
  type: sqlite

initial-elo: 100

reward:
  enabled: true
  playerpoints-base: 1
  vault-base: 200
  daily-playerpoints-limit: 50
  daily-vault-limit: 10000

game:
  max-duration: 300       # 5 分钟
  countdown: 5            # 5 秒倒计时
  allow-spectators: true
  max-spectators: 4       # 最多 4 人观战
  teleport-delay: 3
  allowed-commands:
    - /msg
    - /fepvp leave

room:
  timeout: 3600

hunger-games:
  min-players: 3
  start-empty: true
  loot-distribute: true

kit:
  allow-own-gear: false   # 禁用自带装备
  allow-kit-switch: true

protection:
  block-break: false      # 全局默认禁止破坏（场地可显式 allowbreak）
  block-place: false      # 全局默认禁止放置（场地可显式 allowplace）
  auto-restore: true
  restore-region-radius: 96
  restore-per-tick: 500
  restore-tile-entities: true
  clean-drops: true
  interact: false
  hunger-loss: false
  natural-regeneration: false

world-guard:
  enabled: true
  use-arena-worlds: true
  worlds:
    - pvp

bet:
  enabled: true
  currency: vault
  min-stake: 500
  max-stake: 100000
  default-stakes: [500, 1000, 2000, 5000, 10000, 20000]
  allow-custom-amount: true
  apply-daily-rewards: false
  count-elo: true
  forfeit-on-quit: true
  refund-on-cancel: true
  cooldown-seconds: 0
  crash-refund: true
```
