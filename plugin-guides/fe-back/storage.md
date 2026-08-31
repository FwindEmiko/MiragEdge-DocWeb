---
title: 数据存储
outline: deep
---

# 05 — 数据存储

## 文件列表

| 文件 | 格式 | 说明 |
|------|------|------|
| `plugins/FE_Back/config.yml` | YAML | 主配置 |
| `plugins/FE_Back/messages.yml` | YAML | 消息模板 |
| `plugins/FE_Back/data/database.db` | SQLite | 全部业务数据（WAL 模式） |

## 数据库

- 类型：SQLite（当前仅实现 sqlite），驱动与连接池由 Paper 启动时自动下载（sqlite-jdbc + HikariCP）
- 连接串：`jdbc:sqlite:...?journal_mode=WAL&synchronous=NORMAL&busy_timeout=5000&foreign_keys=true`
- 连接池默认：max=8 / minIdle=2 / connTimeout=30s / idleTimeout=10min / maxLifetime=30min

备份只需复制 `data/database.db`（停机时复制最稳妥；WAL 模式下在线复制建议使用 SQLite 备份工具）。

## 表结构

### fe_death_record — 死亡点记录

| 列 | 类型 | 说明 |
|----|------|------|
| `player_uuid` | TEXT PK | 玩家 UUID（每玩家一行） |
| `player_name` | TEXT | 玩家名 |
| `world` | TEXT | 世界 bukkit 名（存档 key；显示名由 Multiverse alias 解析） |
| `x` / `y` / `z` | REAL | 死亡坐标 |
| `yaw` / `pitch` | REAL | 朝向 |
| `death_time` | INTEGER | 死亡时间（epoch ms） |
| `updated_at` | INTEGER | 更新时间 |

### fe_penalty_state — 每日惩罚状态

| 列 | 类型 | 说明 |
|----|------|------|
| `player_uuid` | TEXT PK | 玩家 UUID |
| `player_name` | TEXT | 玩家名 |
| `death_day` | TEXT | 死亡日期 `yyyy-MM-dd`（服务器本地时区） |
| `death_count` | INTEGER | 今日累计死亡次数 |
| `last_tier` | INTEGER | 最近命中的惩罚阶梯 |
| `updated_at` | INTEGER | 更新时间 |

索引：`idx_fe_penalty_day (death_day)` — 每日清理与查询使用。

### fe_currency_entity — 金粒实体追踪

| 列 | 类型 | 说明 |
|----|------|------|
| `entity_uuid` | TEXT PK | 掉落物实体 UUID |
| `world` | TEXT | 所在世界 |
| `owner_uuid` | TEXT | 持有人（死亡者）UUID |
| `amount` | INTEGER | 金粒代表额度 |
| `drop_time` | INTEGER | 掉落时间（epoch ms） |

索引：`idx_fe_currency_drop (drop_time)` — 超期清理使用。

### fe_player_prefs — 玩家偏好

| 列 | 类型 | 说明 |
|----|------|------|
| `player_uuid` | TEXT PK | 玩家 UUID |
| `show_return_form` | INTEGER | 1=显示基岩版返回表单，0=不显示（`/febtoggle` 写入） |
| `updated_at` | INTEGER | 更新时间 |

## 数据生命周期

- **每日重置**：每天 00:00~00:05（服务器本地时区）删除所有 `death_day` 非今天的惩罚记录，并清空内存缓存（死亡次数归零）
- **金粒清理**：每颗金粒在 `lifespan-seconds`（默认 360 秒）后由调度任务移除；`GoldNuggetCleanupTask` 每 5 分钟兜底清理一次（含启动时清理），包括：
  - 按 DB 记录查找超期实体（O(1) 实体查找，避免全地图扫描卡顿）
  - 扫描已加载世界的「孤儿金粒」（记录丢失或调度失效的）
  - 实体在未加载区块时保留记录重试，超过 4 倍寿命才删除记录，防止地面垃圾与 DB 无限膨胀
- **背包补丁**：玩家上线时扫描主背包 + 副手，清除历史版本遗留的异常灵叶金粒（只删除物品，不补发 / 不扣减货币）
