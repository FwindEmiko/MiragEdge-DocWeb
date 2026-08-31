---
title: 数据存储
outline: deep
---

# 08 — 数据存储

## 文件列表

| 文件 | 格式 | 说明 |
|------|------|------|
| `fepvp.db` | SQLite | 玩家数据、比赛记录、押注数据（默认） |
| `arenas.yml` | YAML | 竞技场配置 |
| `kits.yml` | YAML | 装备组合数据 |
| `config.yml` | YAML | 主配置 |
| `lang.yml` | YAML | 语言文件 |
| `pending-restore/*.yml` | YAML | 方块恢复数据 + 玩家背包备份（临时，正常自动清理；崩溃恢复用） |
| `daily-rewards.yml` | YAML | 每日奖励领取量（按 UUID + 日期持久化，跨重启保留） |
| `data-loss-backup.yml` | YAML | MySQL 不可达时玩家数据兜底备份（人工导入） |

> 注意：方块恢复文件与背包备份文件共用 `pending-restore/` 目录。崩溃恢复只删除方块恢复文件，**永不删除**背包备份（防物品丢失）。

## 数据库

### 支持的数据库

| 类型 | 文件位置 | 适用场景 |
|------|----------|----------|
| SQLite | `plugins/FE_PVP/fepvp.db` | 单服、轻量部署（默认，已内嵌驱动） |
| MySQL | 远程/本地 MySQL 服务器 | 多服共享、生产环境（需在 `plugins/FE_PVP/lib/` 放入 mysql-connector-j） |

### 切换数据库

修改 `config.yml` 中 `database.type` 为 `mysql`，填写连接信息后重启。

> **注意**：SQLite 和 MySQL 的数据不互通。切换前需手动迁移。

## 表结构

### fepvp_players — 玩家数据

```sql
CREATE TABLE fepvp_players (
    uuid         VARCHAR(36)  PRIMARY KEY,
    player_name  VARCHAR(16)  NOT NULL,
    wins         INT          DEFAULT 0,
    losses       INT          DEFAULT 0,
    draws        INT          DEFAULT 0,
    kills        INT          DEFAULT 0,
    deaths       INT          DEFAULT 0,
    elo          INT          DEFAULT 0,
    highest_elo  INT          DEFAULT 0,
    games_played INT          DEFAULT 0,
    last_played  BIGINT       DEFAULT 0,
    first_played BIGINT       DEFAULT 0,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);
```

| 字段 | 说明 |
|------|------|
| `uuid` | 玩家 UUID（主键） |
| `player_name` | 最新玩家名 |
| `wins` / `losses` / `draws` | 胜/负/平场次 |
| `kills` / `deaths` | 总击杀/死亡数 |
| `elo` | 当前 ELO 积分（新玩家初始值由 `initial-elo` 决定，默认 100） |
| `highest_elo` | 历史最高 ELO |
| `games_played` | 总比赛场次 |
| `last_played` | 上次比赛时间戳 |
| `first_played` | 首次游玩时间戳 |

### bet_sessions — 押注托管会话（崩溃恢复核心）

```sql
CREATE TABLE bet_sessions (
    game_id      VARCHAR(40) PRIMARY KEY,
    room_id      VARCHAR(40),
    currency     VARCHAR(16)  NOT NULL,   -- VAULT / PLAYER_POINTS
    stake        BIGINT       NOT NULL,   -- 单方押金
    player1_uuid VARCHAR(40),
    player1_name VARCHAR(36),
    player2_uuid VARCHAR(40),
    player2_name VARCHAR(36),
    status       VARCHAR(16)  NOT NULL,   -- LOCKED / WIN_SETTLED / REFUNDED / VOID
    started_at   BIGINT,
    settled_at   BIGINT
);
```

开赛锁定时写入 `LOCKED`；结算后更新状态。服务器崩溃重启时扫描 `LOCKED` 且无对应 Game 的记录，按 `bet.crash-refund` 自动退押。

### bet_records — 押注流水（审计/对账）

```sql
CREATE TABLE bet_records (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id     VARCHAR(40),
    player_uuid VARCHAR(40),
    player_name VARCHAR(36),
    currency    VARCHAR(16),
    stake       BIGINT,
    result      VARCHAR(16),   -- WIN / LOSE / DRAW / REFUND / FORFEIT
    change      BIGINT,        -- +2000 / -1000 / 0
    settled_at  BIGINT
);
```

锁定时写 session，结算时写两条 record（赢家 +、输家 -）；「退还」也写 record，保证钱去向可查。

## arenas.yml 格式

详见 [竞技场管理 — arenas.yml 存储格式](./arena.md#arenasyml-存储格式)。

## kits.yml 格式

详见 [装备组合管理 — kits.yml 存储格式](./kit.md#kitsyml-存储格式)。

## 数据备份

### SQLite 备份

直接复制 `fepvp.db` 文件即可。建议在服务器关闭时操作。

或在运行时执行 SQL：

```sql
-- SQLite 在线备份
sqlite3 fepvp.db ".backup fepvp_backup.db"
```

### MySQL 备份

```bash
mysqldump -u root -p fepvp > fepvp_backup.sql
```

## PlaceholderAPI 占位符

> 需安装 PlaceholderAPI，使用 `%fepvp_xxx%` 格式。

### 统计类（离线玩家也可用）

| 占位符 | 返回值 | 说明 |
|--------|--------|------|
| `%fepvp_wins%` | Int | 玩家总胜场 |
| `%fepvp_losses%` | Int | 玩家总负场 |
| `%fepvp_draws%` | Int | 平局数 |
| `%fepvp_kills%` | Int | 总击杀 |
| `%fepvp_deaths%` | Int | 总死亡 |
| `%fepvp_kd%` | Double | K/D 比率（2 位小数） |
| `%fepvp_elo%` | Int | ELO 积分 |
| `%fepvp_games_played%` | Int | 总场次 |
| `%fepvp_win_rate%` | Double | 胜率（%） |
| `%fepvp_rank%` | String | 段位名称（传奇/宗师/大师/钻石/白金/黄金/白银/青铜） |
| `%fepvp_rank_emoji%` | String | 段位图标 |

### 实时状态类（需在线）

| 占位符 | 返回值 | 说明 |
|--------|--------|------|
| `%fepvp_state%` | String | 空闲/房间中/准备中/倒计时/战斗中/观战中/比赛中 |
| `%fepvp_arena%` | String | 当前比赛地图名 |
| `%fepvp_game_type%` | String | 比赛类型（单挑/团队） |
| `%fepvp_game_time%` | String | 已进行时间（mm:ss） |
| `%fepvp_game_time_left%` | String | 剩余时间（mm:ss） |
| `%fepvp_game_mode%` | String | 比赛模式（淘汰制/击杀数制） |
| `%fepvp_opponent%` | String | 单挑对手名 |
| `%fepvp_team%` | String | 团队名 |
| `%fepvp_team_color%` | String | 队伍颜色（RED/BLUE） |
| `%fepvp_team_kills%` | Int | 本队击杀数 |
| `%fepvp_enemy_kills%` | Int | 对方击杀数 |
| `%fepvp_kill_target%` | Int | 击杀数制目标 |
| `%fepvp_team_alive%` | Int | 本队存活人数 |
| `%fepvp_enemy_alive%` | Int | 对方存活人数 |
| `%fepvp_countdown%` | Int | 赛前倒计时剩余秒数 |

### 房间类（需在线）

| 占位符 | 返回值 | 说明 |
|--------|--------|------|
| `%fepvp_room_host%` | String | 房间房主 |
| `%fepvp_room_arena%` | String | 房间地图名 |
| `%fepvp_room_players%` | String | 房间人数（当前/上限） |
| `%fepvp_room_countdown%` | Int | 团队房间开赛倒计时剩余秒数 |

### 排行榜类

| 占位符 | 返回值 | 说明 |
|--------|--------|------|
| `%fepvp_top_{n}_name%` | String | 排行榜第 n 名玩家名 |
| `%fepvp_top_{n}_wins%` | Int | 排行榜第 n 名胜场 |
| `%fepvp_top_{n}_elo%` | Int | 排行榜第 n 名 ELO |

排行榜数据按 ELO 排序（30 秒缓存）。
