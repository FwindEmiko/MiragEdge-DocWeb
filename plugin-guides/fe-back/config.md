---
title: 配置参考
outline: deep
---

# 03 — 配置参考

文件位置：`plugins/FE_Back/config.yml`，修改后执行 `/feb reload` 即可生效（无需重启）。

以下均为仓库内随插件发布的**默认值**；实际服务器可能已调整。

## settings — 基础设置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `settings.debug` | Boolean | `false` | 调试日志输出到控制台 |
| `settings.excluded-worlds` | String[] | `[pvp, zc]` | 排除世界：死亡记录、返回、惩罚全部禁用 |
| `settings.require-permission-for-cross-world` | Boolean | `false` | 跨世界返回是否要求 `feback.bypass.world` |
| `settings.require-permission-for-same-world` | Boolean | `false` | ⚠️ 已解析但**当前代码未使用**（预留字段） |
| `settings.overwrite-on-death` | Boolean | `true` | ⚠️ 已解析但**当前代码未使用**；当前行为即「新死亡覆盖旧记录」 |
| `settings.cooldown-seconds` | Long | `5` | `/back` 冷却秒数（0 = 关闭） |
| `settings.notify-on-pickup-others` | Boolean | `false` | 金粒被他人拾取时是否通知原主（当前由**本配置**控制，与权限 `feback.notify` 无关） |
| `settings.database.type` | String | `sqlite` | 数据库类型（当前仅实现 sqlite） |
| `settings.database.sqlite.file` | String | `data/database.db` | SQLite 文件路径（相对插件目录） |

> 注意：代码对 `require-permission-for-cross-world` 的兜底默认是 `true`，但随包发布的 config.yml 写的是 `false`，实际行为以配置文件为准。

## return-cost — 返回死亡点扣费

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `return-cost.enabled` | Boolean | `true` | 是否启用返程收费（false = 免费） |
| `return-cost.currency` | String | `VAULT` | 货币：`VAULT` / `POINTS` / `BOTH`（BOTH 优先扣 Vault，不足再扣 Points） |
| `return-cost.free-deaths` | Int | `30` | 今日死亡次数 ≤ 该值时免费返回（0 = 不提供免费额度） |
| `return-cost.vault.amount` | Double | `100.0` | Vault 基础费用（tiers 为空时的兜底） |
| `return-cost.points.amount` | Int | `0` | Points 基础费用 |
| `return-cost.tiers` | List | 见下表 | 阶梯费用：按今日死亡次数匹配，未命中任何区间时取最后一级（封顶） |

默认阶梯（vault 单位，points 均为 0）：

| threshold | max-deaths | vault |
|:---:|:---:|:---:|
| 31 | 40 | 100 |
| 41 | 50 | 102 |
| 51 | 60 | 120 |
| 61 | 70 | 150 |
| 71 | 80 | 158 |
| 81 | 90 | 160 |
| 91 | 100 | 165 |
| 101 | 110 | 170 |
| 111 | 120 | 175 |
| 121 | 130 | 180 |
| 131 | 140 | 185 |
| 141 | 9999 | 190 |

> `tiers` 支持 list 与 map 两种写法；留空则一律按 `vault.amount` / `points.amount` 收费。

## return-effects — 返回后的副作用

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `return-effects.hunger-cost` | Int | `2` | 饥饿值损失（0-20） |
| `return-effects.blind-ticks` | Int | `56` | 失明时长（tick，56 ≈ 2.8 秒；0 = 关闭） |
| `return-effects.slowness-ticks` | Int | `73` | 缓慢时长（≈ 3.6 秒） |
| `return-effects.slowness-amplifier` | Int | `8` | 缓慢等级 |
| `return-effects.resistance-ticks` | Int | `73` | 抗性提升时长（防围殴） |
| `return-effects.resistance-amplifier` | Int | `4` | 抗性等级 |

## penalty-tiers — 每日死亡惩罚阶梯

| 阶梯 | 死亡次数区间 | 掉落灵叶（随机） | 说明 |
|:---:|:---:|:---:|------|
| tier-0 | 1 ~ 30 | 0 ~ 10 | 近免罚档（要完全免罚把 min/max 都设为 0） |
| tier-1 | 31 ~ 40 | 50 ~ 100 | 轻度 |
| tier-2 | 41 ~ 50 | 100 ~ 150 | 中度 |
| tier-3 | 51 ~ 60 | 150 ~ 200 | 重度 |
| tier-4 | 61 ~ 70 | 200 ~ 350 | 严重 |
| tier-5 | 71 ~ 9999 | 350 ~ 900 | 最高 |

字段：`tier`（阶梯号）、`threshold`（进入档位的次数）、`max-deaths`（区间上限）、`min-drop` / `max-drop`（该档每次死亡随机掉落的灵叶数）。

规则与注意：

- threshold 应严格递增；匹配取「最后一个命中区间」，没命中时用最后一个阶梯封顶
- 支持 list（`- tier: 0 ...`）与 map（`tier-N: ...`）两种写法
- 掉落为 0 时不生成金粒也不扣钱
- `penalty-tiers` **不能为空**，否则插件启动失败

## currency-item — 灵叶金粒

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `currency-item.display-name` | String | `<gradient:#ffd700:#ff9a00><bold>遗失的灵叶 ×%amount%</bold></gradient>` | 金粒悬浮名（MiniMessage）；`%amount%` = 本颗金粒代表的货币量（必须保留，否则不显示额度），`%owner%` = 持有人 UUID |
| `currency-item.name-keyword` | String | `fe_back` | 名称识别关键词（PDC 为主，此字段兼容/过滤用） |
| `currency-item.enchant-glint` | Boolean | `true` | 附魔光效（发光金粒） |
| `currency-item.custom-model-data` | Int | `0` | CMD 模型（0 = 关闭） |
| `currency-item.use-virtual-packet` | Boolean | `false` | ProtocolLib 虚拟发包（当前为占位扩展；**建议保持 false**，真实金粒在 1.21+ 拾取最自然） |
| `currency-item.despawn-seconds` | Long | `360` | 金粒存在时间 / 清理边界（秒） |
| `currency-item.lifespan-seconds` | Long | `360` | 落地到消失（秒，最小 20） |
| `currency-item.prevent-merge` | Boolean | `true` | 阻止掉落物合并（每颗金粒 PDC token 唯一，原版本身不会合并） |
| `currency-item.pickable` | Boolean | `true` | ⚠️ 已废弃：拾取规则固定由监听器控制（本人走回可拾 / 他人可拾 / /back 后本人不可拾） |
| `currency-item.deposit-to` | String | `VAULT` | 金粒被拾取时入账去向：`VAULT` / `POINTS` / `BOTH` |
| `currency-item.vault-per-nugget` | Double | `1.0` | 1 单位金粒兑换多少 Vault 金额 |
| `currency-item.points-per-nugget` | Int | `1` | 1 单位金粒兑换多少 Points |
| `currency-item.reserve-amount` | Double | `400.0` | 死亡扣费保底：余额充足 → 全额扣并生成完整额度金粒；扣完全额会低于此值 → 扣到剩此值且**不生成金粒**；余额 ≤ 此值 → 不扣不掉。0 = 允许扣光。POINTS 场景取整 |

## floodgate — 基岩版表单

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `floodgate.enabled` | Boolean | `true` | 是否对基岩版玩家启用死亡表单 |
| `floodgate.form-title` | String | `<gold>死亡回程</gold>` | 表单标题（MiniMessage） |
| `floodgate.button-return` | String | `<green>返回死亡点</green>` | 返回按钮文字 |
| `floodgate.button-cancel` | String | `<red>取消</red>` | 取消按钮文字 |
| `floodgate.form-content` | String | 见 config.yml | 表单正文，支持 `%x% %y% %z%` 与 `%cost%` |
| `floodgate.form-timeout-seconds` | Int | `30` | 表单无操作自动关闭时间 |

> 表单的 `%cost%` 会按玩家今日死亡次数实时解析；免费时显示「免费」。

## messages.yml — 消息模板

文件位置：`plugins/FE_Back/messages.yml`，支持 MiniMessage 语法：`<red>`、`<bold>`、`<gradient:#ffd700:#ff9a00>`、`<click:run_command:'/back'>`、`<hover:show_text:'...'>` 等。

通用占位符：

| 占位符 | 含义 |
|--------|------|
| `%player%` | 玩家名 |
| `%world%` | 世界名（Multiverse alias 优先） |
| `%x% %y% %z%` | 坐标 |
| `%cost%` | 花费金额 |
| `%amount%` | 金粒 / 损失额度 |
| `%owner%` | 货币所属玩家 |
| `%deaths%` | 今日累计死亡数 |
| `%tier%` | 当前惩罚阶梯 |

另有一些消息专用的占位符：`%seconds%`（冷却）、`%picker%`（拾取者）、`%status%`（表单开关状态）等。

> 基岩版玩家接收到的聊天消息会自动平坦化为 § 颜色码格式发送；Java 版直接发送 Adventure 组件，保留点击 / 悬浮等交互能力。
