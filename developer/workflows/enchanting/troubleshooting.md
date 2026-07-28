---
title: 附魔配置工作流 · 排错与交付
description: 面向锐界幻境自定义附魔维护的工作流，拆分为前置环境、模块实现、参考资料和排错。
---

# 附魔配置工作流 · 排错与交付

## 七、常见陷阱提醒

| # | 陷阱 | 说明 |
|:-|:-----|:-----|
| 1 | ❌ 使用 Kether 语法 | 服务器已完全切换到 fluxon，所有 Kether 示例（`add-potion-effect`、`set ... to` 等）均已失效 |
| 2 | ❌ 附魔 yml 中 `rarity` 写英文 | 必须写品质中文名（如 `传说`，不是 `legendary`） |
| 3 | ❌ `targets` 写英文装备类 | 必须写中文名（如 `剑`，不是 `swords`） |
| 4 | ❌ 在文档中重复附魔 ID 对照表 | 引用 `enchantment_ids.md` 的 Vue 组件即可 |
| 5 | ❌ 删除 `alternative` 节 | 即使只做自定义附魔，alternative 字段（如 `is-treasure`）控制获取渠道，不可省略 |
| 6 | ❌ 忘记在脚本中加 `&` 前缀 | fluxon 变量全部用 `&` 前缀，如 `&player`、`&冷却` |
| 7 | ❌ tickers 中忘记 post-handle | 卸下附魔时不清理状态会导致飞行/无敌等效果残留 |
| 8 | ❌ leveled 变量缺少 `:` 分隔符 | 即使单位为空也要写 `:` 前缀（如 `":0.064"`），否则 `IndexOutOfBoundsException at Variables.kt:100` |
| 9 | ❌ 使用 `getXxx()` 形式调用属性 | fluxon 属性 key 名是去掉 `get` 前缀的名称（如 `cause()` 而非 `getCause()`，`action()` 而非 `getAction()`），使用 `getXxx()` 会抛 `FunctionNotFoundException` |
| 10 | ❌ 使用 `math::random()` | fluxon 没有 `math` 命名空间，应使用 `random(最小, 最大)` |
| 11 | ❌ 使用未注册的 Java 方法 | `&player::getGravity()`/`setGravity()`/`walkSpeed()` 等方法未注册，使用前必须确认属性已注册（见附录 D/E） |
| 12 | ❌ 误用 `.` 成员访问 | Aiyatsbus 未启用 `allowReflectionAccess`，`.` 运算符无效，必须使用 `::` 上下文调用 |
| 13 | ❌ 使用 `&event::getFrom()` / `getTo()` | player-move 事件无 PropertyPlayerMoveEvent 注册，应使用 `&event::player::getLocation()` 或 ticker 方案 |

## 八、未覆盖问题的处理策略

当遇到本文档未覆盖的问题时，AI 应：

1. **查阅官方文档**：优先访问 [Aiyatsbus Wiki](https://wiki.polarastrum.cc/plugin/aiyatsbus/) 和 [TabooLib 脚本动作大全](https://taboolib.hhhhhy.kim/kether-list)
2. **参考现有附魔**：`enchants/` 下所有附魔包（`Packet-Default/`、`Packet-Vanilla/`、`Stellarity/` 等）中的现有附魔是最佳参考。遇到不确定的属性或函数时，用 `grep` 搜索服务器上已工作的 yml 文件，确认正确的语法和属性 key 名
3. **增量验证**：每完成一个模块配置后即用 `/aiyatsbus reload` 验证，不要等全部写完再测试
4. **保守提示**：对于文档未明确覆盖的功能，向用户说明不确定性，并给出最佳实践建议

---
