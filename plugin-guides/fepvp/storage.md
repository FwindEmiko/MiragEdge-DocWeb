---
title: 数据存储
outline: deep
---

# 08 — 数据存储

## 文件列表

| 文件 | 格式 | 说明 |
|------|------|------|
| `fepvp.db` | SQLite | 玩家数据、比赛记录（默认） |
| `arenas.yml` | YAML | 竞技场配置 |
| `kits.yml` | YAML | 装备组合数据 |
| `config.yml` | YAML | 主配置 |
| `lang.yml` | YAML | 语言文件 |
| `pending-restore/*.yml` | YAML | 比赛方块恢复数据（临时，赛后自动清理） |
| `inventory-backup/*.yml` | YAML | 玩家背包备份（临时，恢复后自动清理） |

## 数据库

### 支持的数据库

| 类型 | 文件位置 | 适用场景 |
|------|----------|----------|
| SQLite | `plugins/FE_PVP/fepvp.db` | 单服、轻量部署 |
| MySQL | 远程/本地 MySQL 服务器 | 多服共享、生产环境 |

### 切换数据库

修改 `config.yml` 中 `database.type` 为 `mysql`，填写连接信息后重启。

> **注意**：SQLite 和 MySQL 的数据不互通。切换前需手动迁移。

### 表结构

#### fepvp_players — 玩家数据

```sql
CREATE TABLE fepvp_players (
    uuid         VARCHAR(36)  PRIMARY KEY,
    player_name  VARCHAR(16)  NOT NULL,
    wins         INT          DEFAULT 0,
    losses       INT          DEFAULT 0,
    draws        INT          DEFAULT 0,
    kills        INT          DEFAULT 0,
    deaths       INT          DEFAULT 0,
    elo          INT          DEFAULT 1000,
    highest_elo  INT          DEFAULT 1000,
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
| `elo` | 当前 ELO 积分（初始 1000） |
| `highest_elo` | 历史最高 ELO |
| `games_played` | 总比赛场次 |
| `last_played` | 上次比赛时间戳 |
| `first_played` | 首次游玩时间戳 |

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

| 占位符 | 返回值 | 说明 |
|--------|--------|------|
| `%fepvp_wins%` | Int | 玩家总胜场 |
| `%fepvp_losses%` | Int | 玩家总负场 |
| `%fepvp_draws%` | Int | 平局数 |
| `%fepvp_kills%` | Int | 总击杀 |
| `%fepvp_deaths%` | Int | 总死亡 |
| `%fepvp_kd%` | Double | K/D 比率 |
| `%fepvp_elo%` | Int | ELO 积分 |
| `%fepvp_games_played%` | Int | 总场次 |
| `%fepvp_win_rate%` | Double | 胜率（%） |
| `%fepvp_rank%` | String | 段位名称（王者/宗师/大师/精英/老手/熟手/新手） |
| `%fepvp_state%` | String | 当前状态（空闲/房间中/准备中/倒计时/战斗中/观战中/离线） |
| `%fepvp_top_{n}_name%` | String | 排行榜第 n 名玩家名 |
| `%fepvp_top_{n}_wins%` | Int | 排行榜第 n 名胜场 |
| `%fepvp_top_{n}_elo%` | Int | 排行榜第 n 名 ELO |
