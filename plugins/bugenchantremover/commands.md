---
title: 命令参考
outline: deep
---

# 命令参考

本插件共提供 3 条命令，均需 OP 权限（默认 `op` 即可执行）。

## 命令总览

| 命令 | 权限节点 | 默认权限 | 用途 |
|------|----------|----------|------|
| `/bugenchantreload` | `bugenchantremover.reload` | OP | 重载配置文件 |
| `/bugenchantscan` | `bugenchantremover.scan` | OP | 手动扫描背包 |
| `/bugenchanttest` | `bugenchantremover.test` | OP | 检测手持物品 |

---

## `/bugenchantreload` — 重载配置

### 用法

```
/bugenchantreload
```

无参数。重载 `config.yml` 并刷新内存中的关键词缓存、检查间隔、各项开关。

### 输出示例

成功时：

```
[BugEnchantRemover] 配置已重载
  关键词: 2 个ID / 1 个翻译键
  间隔: 21 tick
  选项: 删全异常书=开启 删空书=开启 保护自定义=开启 清发光=开启
```

失败时（如 YAML 语法错误）：

```
[BugEnchantRemover] 重载失败: Unable to read config.yml
```

控制台会输出完整堆栈，便于排查。

### 使用场景

- 修改 `config.yml` 后无需重启服务器
- 调整关键词列表后立即生效
- 临时关闭某个开关（如 `protect-custom-items: false`）进行测试

::: warning 注意
重载不会重启定时任务。如修改了 `check-interval`，需要重启服务器才能让新间隔生效。
:::

---

## `/bugenchantscan` — 手动扫描背包

### 用法

```
/bugenchantscan
```

无参数。仅限玩家执行。立即扫描执行者本人的背包（主背包 36 格 + 副手 1 格），自动清理匹配的异常附魔。

### 输出示例

发现异常时：

```
[BugEnchantRemover] 扫描完成
  扫描槽位: 37 个
  修改物品: 3 个
  删除物品: 1 个
```

未发现异常时：

```
[BugEnchantRemover] 扫描完成
  扫描槽位: 37 个
  修改物品: 0 个
  删除物品: 0 个
  未发现异常附魔
```

### 与定时扫描的区别

| 特性 | `/bugenchantscan` | 定时扫描 |
|------|-------------------|----------|
| 触发方式 | 手动 | 每 21 tick 自动 |
| 扫描范围 | 仅玩家本人背包 + 副手 | 所有在线玩家 + 容器 |
| 是否扫描打开的容器 | 否 | 是 |
| 反馈形式 | 详细统计 | 仅 actionbar 提示 |
| 适用场景 | 验证配置、即时清理 | 日常防护 |

::: tip 配合 `/bugenchantreload` 使用
典型工作流：
1. 修改 `config.yml`
2. `/bugenchantreload`
3. `/bugenchantscan` 验证清理效果
4. 如有遗漏，重复步骤 1-3
:::

---

## `/bugenchanttest` — 检测手持物品

### 用法

```
/bugenchanttest
```

无参数。仅限玩家执行。检测主手物品的附魔详情，**不会修改物品**，仅显示信息。

### 支持的物品类型

- **附魔书**（ENCHANTED_BOOK）— 显示存储附魔
- **普通物品**（武器/防具/工具）— 显示应用附魔
- **任意物品** — 显示 UberEnchant PDC 附魔（如有）
- **空手** — 提示"请手持一个物品"

### 输出示例

```
=== 物品信息 ===
类型: ENCHANTED_BOOK (附魔书)
附魔总数: 3（标准 2 + UberEnchant PDC 1）
异常附魔数: 2（标准 1 + UberEnchant 1）
识别为自定义物品(GUI道具): 否

--- 标准附魔 ---
附魔ID: minecraft:sharpness
  命名空间: minecraft | 键名: sharpness
  翻译键: enchantment.minecraft.sharpness | 等级: 5
  检测为Bug: 否

附魔ID: nova_structures:bug_enchant
  命名空间: nova_structures | 键名: bug_enchant
  翻译键: enchantment.nova_structures.bug_enchant | 等级: 1
  检测为Bug: 是

--- UberEnchant PDC 附魔 ---
附魔ID: uberenchant:blindness
  命名空间: uberenchant | 键名: blindness
  翻译键: enchantment.uberenchant.blindness | 等级: 3
  检测为Bug: 是

预测处理结果: 移除异常附魔（保留正常附魔）
```

### 输出字段说明

| 字段 | 含义 |
|------|------|
| **附魔总数** | 标准附魔数 + UberEnchant PDC 附魔数 |
| **异常附魔数** | 命中关键词的附魔总数 |
| **识别为自定义物品** | 是否触发 GUI 道具保护（详见 [配置参考](./config)） |
| **附魔ID** | 完整 NamespacedKey，格式 `命名空间:键名` |
| **命名空间 / 键名** | 分别用于关键词匹配（任一命中即视为异常） |
| **翻译键** | 格式 `enchantment.命名空间.键名`，用于翻译键关键词匹配 |
| **检测为Bug** | 是否命中任意关键词 |
| **预测处理结果** | 模拟 `/bugenchantscan` 会如何处理这个物品 |

### 预测结果的可能取值

| 物品类型 | 预测结果 | 触发条件 |
|----------|----------|----------|
| 附魔书 | `删除整本书（空附魔书）` | 无附魔 + `remove-empty-enchanted-book=true` + 非自定义 |
| 附魔书 | `删除整本书（全为异常附魔）` | 全部附魔均为异常 + `remove-enchanted-book-when-all-bug=true` + 非自定义 |
| 附魔书 | `移除异常附魔（会产生空附魔书）` | 全部异常 + 上述开关为 false |
| 附魔书 | `移除异常附魔（保留正常附魔）` | 部分异常 |
| 附魔书 | `保护自定义物品（不修改）` | 识别为自定义物品 |
| 附魔书 | `不处理` | 无异常附魔 |
| 普通物品 | `移除异常附魔` | 有异常附魔 + 非自定义 |
| 普通物品 | `保护自定义物品（不修改）` | 识别为自定义物品 |
| 普通物品 | `不处理` | 无异常附魔 |

::: tip 排查配置问题
如果预测结果与预期不符，可以：
1. 检查关键词列表是否正确（`/bugenchantreload` 后查看摘要）
2. 检查物品是否被误判为自定义（查看"识别为自定义物品"字段）
3. 启用 `log-keyword-matches: true` 查看控制台匹配日志
:::
