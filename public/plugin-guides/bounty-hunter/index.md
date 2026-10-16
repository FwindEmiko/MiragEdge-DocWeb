<!-- 来源页面: https://miragedge.top/plugin-guides/bounty-hunter -->
<!-- 由 llms.txt 标准生成器自动产出，源文件: plugin-guides/bounty-hunter/index.md -->

# 赏金猎人管理

这页给出赏金猎人的命令、权限与运行机制，供服主配置和排查。

玩家侧的怪物清单与单价见[赏金猎人（玩家版）](https://miragedge.top/features/bounty-hunter)。

## 命令

| 命令 | 作用 | 权限 | 默认 |
| :--- | :--- | :--- | :--- |
| `/bh remaining` | 查看今日剩余赏金次数 | `bountyhunter.use` | 关闭 |
| `/bh reload` | 重载配置 | `bountyhunter.command.reload` | op |
| `/bh list` | 查看所有赏金条目 | `bountyhunter.command.list` | op |
| `/bh info` | 查看插件状态 | `bountyhunter.command.info` | op |

## 权限

| 节点 | 作用 |
| :--- | :--- |
| `bountyhunter.receive` | 击杀怪物获得灵叶，必须解锁才生效 |
| `bountyhunter.use` | 使用 `/bh remaining` |
| `bountyhunter.command.reload` | 使用 `/bh reload` |
| `bountyhunter.command.list` | 使用 `/bh list` |
| `bountyhunter.command.info` | 使用 `/bh info` |

## 运行机制

- 击杀指定怪物后赏金直接以灵叶到账，不掉落物品，玩家无需捡取。
- 每个条目有每日次数上限，跨日自动重置。
- 击杀瞬间在快捷栏上方提示本次金额。
- 系统每 30 分钟把这段时间的收益汇总一次并发送到聊天栏。
- 覆盖 57 种怪物、6 层定价，涵盖烬域、繁星、终焉与常见怪物。

## 经济定位

| 刷怪强度 | 每小时收入 | 占日收入比例 |
| :--- | :--- | :--- |
| 全力狩猎高阶怪物 | 3,500~5,000 灵叶 | 16~22% |
| 顺带猎杀常见怪物 | 约 3,275 灵叶/天 | 约 15% |

怪物赏金是战斗风险收入，需要装备和战斗技巧。产出与消耗端的全表见[全插件经济速查表](https://miragedge.top/developer/reference/economy-audit/plugin-economy-matrix)。
