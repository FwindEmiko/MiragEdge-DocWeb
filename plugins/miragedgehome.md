# MiragEdgeHome

> 锐界幻境自研的家园与传送系统，替换旧版米饭 PlayerWarp。基于 Paper API 1.21.1 开发，采用 Java 25 + Maven 构建。

## 项目状态

- 版本：1.0.0
- 作者：F.windEmiko（狐风轩汐）
- 仓库：*待上传*
- 许可：MIT

---

## 前置依赖

| 插件 | 类型 | 说明 |
|------|------|------|
| Vault | 软依赖 | 经济系统（灵叶扣费/转账/递增费用），未装则不启用经济功能 |
| PlaceholderAPI | 软依赖 | 占位符变量，未装则 PAPI 变量不可用 |
| Floodgate | 软依赖 | 基岩版表单支持，未装则基岩版玩家走 Java 版消息样式 |

## 存储模式

- **SQLite**（单服，零配置开箱即用）
- **MySQL**（跨服共享，需在 config.yml 配置连接信息），通过 HikariCP 连接池管理
- 跨服网络基于 **Redis**（推荐）或 Plugin Messaging，通过 `network/` 包实现玩家在线状态追踪、差异检测和实时推送

---

## 核心系统

### 星辉锚点（Home）

玩家通过 `/sethome <名称>` 设置个人锚点。

**数量管理采用数据驱动模式**（非权限组模式）：

- 默认可设置 **1 个**锚点（由 `homes.default-limit` 控制）
- 管理员通过 `/megadmin number <玩家> set|add|remove homes <数量>` 单独调整每个玩家的锚点上限
- `player_data.homes_limit` 为绝对上限，`-1` 回退到 config 默认值
- 旧版权限节点 `miragedgehome.homes.*` 已废弃，不再参与上限计算
- 同名家园补全检测 + DB 唯一约束双重保障

**并发安全**：同玩家的连续 `/sethome` 操作通过 CompletableFuture 链串行化（S3-fix），杜绝 count→insert 之间的竞态问题。30 分钟自动清理已完成链尾。

### 公共锚点（Warp）

| 类型 | 创建方式 | 说明 |
|------|---------|------|
| 管理员公共锚点 | `/setwarp <名称>` | 面向全服玩家，用于主城、交通枢纽等 |
| 玩家公开锚点 | `/publish <家园名> [显示名] [费用]` | 玩家公开私人锚点，可设置访问费用 |

- 访问费用（灵叶）自动转入主人账户
- 公开数量同样为数据驱动：默认 **0**（需管理员手动授权），通过 `/megadmin number` 指令设置
- 跨服模式下可通过 `warp-list-scope` 控制列表范围（本服/全群组）

### 星辉信使（TPA）

全内存管理，请求 60 秒超时自动清理。接收方连续拒绝同一玩家 **3 次**后，自动开启 **5 分钟**星能屏障。

- 跨服 TPA 支持（需启用 Redis 后端），可开关
- 每次成功传送消耗 **100 灵叶**（可配置，需 Vault）
- 提供独立 UI：`/tpaui` 命令打开专用传送请求管理界面（Java 版 GUI + 基岩版 Form）

### 传送引擎

完整的传送生命周期：

```
冷却检查 → 星轨校准（warmup，可被移动/受伤打断）
→ 星辉扫描（安全检测：虚空/岩浆/窒息，默认关闭）
→ 药水效果（缓慢2秒+失明3秒，防传送后迷惑定位）
→ 成功传送 → 粒子+音效 | 不安全则警告，10秒内可强行跃迁
```

**传送后药水效果**：成功传送后自动施加缓慢和失明效果（时长和等级可配置），防止传送后立即被攻击或定位迷惑——类似死亡轮回中 `/back` 的负面效果机制。

### 跨服网络

跨服功能基于以下架构实现：

| 组件 | 作用 |
|------|------|
| `RedisBackend` | 通过 Redis Pub/Sub 实现实时推送和玩家数据差异检测 |
| `ProxyConnector` | 与 Velocity/BungeeCord 代理通信，获取玩家在线状态和所在子服信息 |
| `NetworkPlayerTracker` | 维护在线玩家缓存（TTL 30秒）+ 心跳检测 |
| `HeadTextureCache` | 玩家头颅纹理缓存，减少 Redis 写入频次 |
| `CrossServerBackend` | 统一接口，抽象 Redis 和 Plugin Messaging 两种实现 |

关键配置项目：

```yaml
cross-server:
  enabled: false
  server-id: ""           # 自动检测或手动填写
  backend: redis          # redis 或 messaging
  home-list-scope: all    # current=仅本服 / all=全群组
  warp-list-scope: all
  teleport-join-delay: 40 # 跨服切换后等待世界加载的 tick
  tpa-cross-server: true  # 跨服 TPA

  redis:
    host: localhost
    port: 6379
    password: ""
    database: 0
```

### 双端 UI

- **Java 版**：MiniMessage 渐变色背包 GUI + 创建确认/公开确认界面
- **基岩版**：Floodgate SimpleForm/ModalForm/CustomForm，功能对等

### 外部 API

提供 `MiragEdgeHomeAPI.getInstance()` 单例：

- `getPlayerHomes(UUID)` / `getPublicWarps()`
- `forceTeleportToHome(Player, String)`
- `getHomeLimit(UUID)` — 查询锚点上限（数据驱动）
- `isTpaBlacklisted(UUID, UUID)`

三个可取消事件：`HomeTeleportEvent`、`TpaRequestEvent`、`PublicWarpVisitEvent`。

---

## 命令一览

| 命令 | 说明 | 权限 |
|------|------|------|
| `/sethome <名称>` | 设置星辉锚点 | 全玩家 |
| `/home [名称]` | 传送到锚点（无参→打开列表） | 全玩家 |
| `/delhome <名称>` | 删除锚点 | 全玩家 |
| `/homes` | 列出全部锚点 | 全玩家 |
| `/publish <家园名> [显示名] [费用]` | 公开私人锚点 | 全玩家 |
| `/unpublish <家园名>` | 取消公开 | 全玩家 |
| `/warp [ID\|名称]` | 传送到公共锚点 | 全玩家 |
| `/setwarp <名称>` | 创建公共锚点（管理员） | `miragedgehome.admin` |
| `/delwarp <名称>` | 删除公共锚点（管理员） | `miragedgehome.admin` |
| `/warps` | 浏览所有公共锚点 | 全玩家 |
| `/tpa <玩家>` | 请求传送到玩家 | 全玩家 |
| `/tpahere <玩家>` | 请求玩家过来 | 全玩家 |
| `/tpaccept [玩家]` | 接受请求（无参=最新） | 全玩家 |
| `/tpdeny [玩家]` | 拒绝请求（无参=最新） | 全玩家 |
| `/tpaui` | 打开传送管理界面 | 全玩家 |
| `/megadmin number <玩家> <set\|add\|remove> <homes\|public> <数量>` | 调整玩家锚点上限（数据驱动） | `miragedgehome.admin` |
| `/megadmin info <玩家>` | 查看玩家星辉档案 | `miragedgehome.admin` |
| `/megadmin reload` | 重载配置 | `miragedgehome.admin` |

## 权限节点

| 节点 | 默认 | 说明 |
|------|------|------|
| `miragedgehome.admin` | op | 管理员权限 |

> 家园数量和公开数量不再通过权限组控制，改为数据驱动模式。

## 配置参考

```yaml
# config.yml 关键配置项

database:
  type: sqlite

cross-server:
  enabled: false
  backend: redis
  home-list-scope: all
  tpa-cross-server: true

homes:
  default-limit: 1
  world-blacklist:
    - pvp

teleport:
  cooldown: 5
  warmup: 3
  safety-check: false
  post-teleport-effects:
    enabled: true
    slowness-seconds: 2
    blindness-seconds: 3
    amplifier: 0

public-warps:
  default-limit: 0

economy:
  enabled: true
  home-create:
    base-cost: 350
    per-home-cost: 300
  public-create:
    base-cost: 900
    per-warp-cost: 1200
  home-delete:
    refund-percent: 60

tpa:
  request-timeout: 60
  blacklist-streak: 3
  blacklist-duration: 300
  cost:
    enabled: true
    amount: 100
```

## PlaceholderAPI 变量

| 变量 | 返回 | 说明 |
|------|------|------|
| `%miragedgehome_homes_count%` | 数字 | 当前锚点数量 |
| `%miragedgehome_homes_limit%` | 数字 | 锚点上限（数据驱动） |
| `%miragedgehome_public_count%` | 数字 | 已公开锚点数 |
| `%miragedgehome_public_limit%` | 数字 | 公开锚点上限 |

## 已知限制

- TPA 黑名单为接收方全局冷却，冷却期间任何人无法向目标发送请求（简化方案）
- 冷却不持久化，服务器重启后重置
- 跨服 TPA 依赖 Redis 后端，Plugin Messaging 模式下受限
