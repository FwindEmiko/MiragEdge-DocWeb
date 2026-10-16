---
title: 押注局（Bet Duel）
description: FE_PVP 押注局的实现与风控参考——双方押金流向、资金托管原理、配置项、管理员对账命令与权限节点，并说明防赖账、防负余额与崩溃退押的设计。
outline: [2, 3]
---

# 押注局（Bet Duel）

押注局是 FE_PVP 单挑（1v1）专属的可选玩法：建房时选择免费局或押注局，双方押相同金额，胜者通吃押金池。

团队竞技与饥饿游戏不开放押注，押注局仅限单挑。

## 模式与货币

| 项目 | 取值 | 说明 |
| :--- | :--- | :--- |
| 免费局 | `FREE` | 无金钱往来，与普通单挑一致 |
| 押注局 | `BET` | 双方对押，输家给钱 |
| 灵叶 | Vault | 推荐主货币 |
| 星痕石 | PlayerPoints | 可选副货币 |

## 资金流向

单方押金记为 X：

| 局终结果 | 玩家 1 | 玩家 2 | 说明 |
| :--- | :--- | :--- | :--- |
| 玩家 1 胜 | +2X | -X | 赢家拿回自己的 X 加对方的 X |
| 玩家 2 胜 | -X | +2X | 同上，镜像 |
| 平局（超时或同归于尽） | +X | +X | 全额退还 |
| 开局前取消（退出、解散、强停） | +X | +X | 未开赛，无输赢 |
| 开局后退出或掉线（弃权） | -X（充公） | +X | 弃权方押金扣除，未弃权方退回 |
| 服务器崩溃，比赛未完成 | +X | +X | 重启后自动退押，可配置 |

## 资金托管

赛前锁定押金而不是赛后由输家转账，原因有三条：

- 防弃权赖账：赛前双方押金已进托管池，弃权即判负并扣款，无需追讨。
- 防负余额：余额不足时无法开赛。
- 防崩溃丢账：托管记录写入 `bet_sessions` 表，重启后可恢复。

## 命令

```text
/fepvp bet 2000                     # 以 2000 灵叶创建押注房，跳过 GUI
/fepvp bet                          # 打开押注创建 GUI
/fepvp admin bet stats              # 今日押注流水：笔数、押金总额、胜利、弃权、净变动
/fepvp admin bet pending            # 查看未结算（锁定）的押注会话
/fepvp admin bet refund <玩家> <金额> # 人工退款，异常处理兜底
```

`admin bet` 系列命令需要权限 `fepvp.bet.admin`，默认 OP。

## 配置

```yaml
bet:
  enabled: true                # 总开关（经济插件未装时自动禁用）
  currency: vault              # vault(灵叶) | playerpoints(星痕石)
  min-stake: 500               # 单方押金下限
  max-stake: 100000            # 单方押金上限
  default-stakes: [500, 1000, 2000, 5000, 10000, 20000]  # 预设档位
  allow-custom-amount: true    # 允许 /fepvp bet <金额>
  apply-daily-rewards: false   # 押注局是否仍发每日低保
  count-elo: true              # 押注局是否计入 ELO 与战绩
  forfeit-on-quit: true        # 开局后退出即弃权判负
  refund-on-cancel: true       # 开局前取消或强停即退押
  cooldown-seconds: 0          # 个人押注冷却，0 为关闭
  crash-refund: true           # 崩溃未完成局自动退押，false 转人工
```

押注局默认计入 ELO 与战绩、不发放每日低保，两项分别由 `count-elo` 与 `apply-daily-rewards` 控制。

## 风控机制

1. 三处余额校验：创建、加入、锁定；锁定失败自动解散且不扣款。
2. 结算幂等：内存集合加数据库 `status` 双保险，杜绝重复发钱。
3. 押注局默认不发每日低保，防押金与低保双收；`cooldown-seconds` 防脚本连刷。
4. `min-stake` 与 `max-stake` 限额防洗钱与通胀。
5. 全程数据库留痕：`bet_sessions` 与 `bet_records` 表，管理员可对账。
6. 崩溃恢复默认自动退押，宁退不错。

## 权限

| 节点 | 默认 | 说明 |
| :--- | :--- | :--- |
| `fepvp.bet` | `true` | 可创建或加入押注局 |
| `fepvp.bet.create` | `true` | 可创建押注房 |
| `fepvp.bet.custom` | `true` | 可用 `/fepvp bet <金额>` 自定义押金 |
| `fepvp.bet.admin` | `op` | `admin bet` 管理命令 |
