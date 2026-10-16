---
title: 权限节点
description: FE_Back 的权限节点参考，列出每个 feback 前缀节点的默认值与生效条件，涵盖返回、免费返回、跨世界与冷却绕过，以及管理命令与阶梯查看。
outline: [2, 3]
---

# 权限节点

| 权限 | 默认值 | 说明 |
|------|--------|------|
| `feback.use` | `true` | 可使用 `/back` 返回死亡点 |
| `feback.free` | `false` | 返回死亡点免费（不扣灵叶 / 星痕石） |
| `feback.bypass.world` | `false` | 跨世界返回（须配合 `require-permission-for-cross-world: true`） |
| `feback.bypass.cooldown` | `false` | 跳过 `/back` 冷却 |
| `feback.admin` | `op` | `/feb` 管理命令（reload / status / clear / setpoint / tiers） |
| `feback.toggle` | `true` | 使用 `/febtoggle` 切换基岩版返回表单 |
| `feback.suicide` | `false` | 使用 `/febsuicide`（控制台默认拥有所有权限） |
| `feback.notify` | `true` | 已在 plugin.yml 声明但**当前代码未使用**；拾取通知实际由 `settings.notify-on-pickup-others` 控制 |

注意事项：

- `feback.use` 除 plugin.yml 声明外，命令执行器里也会再次校验
- `feback.admin` 在 `/feb` 命令里直接校验
- 跨世界返回的默认行为：配置文件 `require-permission-for-cross-world: false`，即**默认任何人都能跨世界返回**；开启后才需要 `feback.bypass.world`
