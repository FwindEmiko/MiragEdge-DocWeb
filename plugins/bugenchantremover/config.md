---
title: 配置参考
outline: deep
---

# 配置参考

文件位置：`plugins/BugEnchantRemover/config.yml`

## 配置文件结构

```yaml
# === 关键词匹配 ===
enchant-id-keywords:          # 附魔 ID 关键词列表
  - "nova_structures"
translation-key-keywords:     # 翻译键关键词列表
  - "enchantment.dnt"

# === 扫描行为 ===
check-interval: 21             # 检查间隔（tick）

# === 日志 ===
log-removals: true             # 记录清理日志
log-keyword-matches: true      # 记录关键词匹配详情

# === 附魔书处理策略 ===
remove-enchanted-book-when-all-bug: true   # 全异常时删除整本
remove-empty-enchanted-book: true          # 清理空书

# === 自定义物品保护 ===
protect-custom-items: true     # 保护 GUI 道具

# === UberEnchant 兼容 ===
clean-uber-enchant-glint: true # 清理 UberEnchant 发光残留

# === 消息 ===
messages:
  actionbar: "帮你清理掉找到的异常附魔书啦~"
  log-prefix: "[星玖姬]"
```

---

## 字段详解

### 关键词匹配

#### `enchant-id-keywords`

- **类型**：String 列表
- **默认值**：`["nova_structures"]`
- **说明**：附魔 ID 关键词列表，匹配规则为"包含"（不区分大小写）

匹配目标（任一命中即视为异常附魔）：

| 匹配目标 | 示例 |
|----------|------|
| 完整 ID | `uberenchant:blindness` 包含 `uberenchant:` → 命中 |
| 命名空间 | `uberenchant` 包含 `uberenchant` → 命中 |
| 键名 | `blindness` 包含 `blindness` → 命中 |

**常见用法**：

```yaml
# 清理所有 UberEnchant 药水效果附魔
enchant-id-keywords:
  - "uberenchant:"

# 清理特定数据包的附魔
enchant-id-keywords:
  - "nova_structures:"
  - "broken_datapack:"

# 多个关键词（任一命中即清理）
enchant-id-keywords:
  - "nova_structures:"
  - "uberenchant:"
  - "test_mod:bug_enchant"
```

::: warning 关键词不要过短
关键词过短可能误伤原版附魔。例如使用 `a` 作为关键词会匹配所有包含字母 `a` 的附魔。
推荐使用命名空间前缀（如 `uberenchant:`）作为关键词，保证精准命中。
:::

#### `translation-key-keywords`

- **类型**：String 列表
- **默认值**：`["enchantment.dnt"]`
- **说明**：翻译键关键词列表，匹配规则为"包含"（不区分大小写）

翻译键格式为 `enchantment.命名空间.键名`，例如：

| 附魔 | 翻译键 |
|------|--------|
| 原版锋利 | `enchantment.minecraft.sharpness` |
| 数据包附魔 | `enchantment.nova_structures.bug_enchant` |
| UberEnchant 失明 | `enchantment.uberenchant.blindness` |

**使用场景**：当附魔 ID 不便区分时，用翻译键前缀更精准：

```yaml
# 仅清理 DNT（Do Not Translate）类数据包附魔
translation-key-keywords:
  - "enchantment.dnt"
  - "enchantment.nova_structures.bug_"
```

---

### 扫描行为

#### `check-interval`

- **类型**：Long
- **默认值**：`21`
- **单位**：tick（20 tick = 1 秒）
- **最小值**：`1`（小于 1 会自动调整为 21）
- **说明**：定时扫描间隔

::: tip 推荐值
- **21 tick**（默认，约 1 秒）：实时性高，CPU 占用可接受
- **100 tick**（5 秒）：大型服务器推荐，降低 CPU 占用
- **200 tick**（10 秒）：仅作为兜底防护，配合事件监听器使用
:::

::: warning 修改后需重启
此配置项修改后需要**重启服务器**才能生效，`/bugenchantreload` 不会重启定时任务。
:::

---

### 日志

#### `log-removals`

- **类型**：Boolean
- **默认值**：`true`
- **说明**：在控制台记录每次清理操作

输出格式：
```
[星玖姬] 清除异常附魔 - 位置: 玩家1的背包, 槽位 12
[星玖姬] 删除物品 - 位置: 玩家1的副手, 副手
```

#### `log-keyword-matches`

- **类型**：Boolean
- **默认值**：`true`
- **说明**：在控制台记录每次关键词匹配的详情

输出格式：
```
[星玖姬] 匹配附魔ID关键词: uberenchant: -> uberenchant:blindness
[星玖姬] 匹配翻译键关键词: enchantment.dnt -> enchantment.dnt.test
```

::: tip 排查问题时开启
当不确定某个附魔为何被清理（或未被清理）时，开启此项可看到详细匹配过程。
生产环境可关闭以减少日志量。
:::

---

### 附魔书处理策略

#### `remove-enchanted-book-when-all-bug`

- **类型**：Boolean
- **默认值**：`true`
- **说明**：当附魔书的**所有附魔都是异常附魔**时，直接删除整本书

**行为对比**：

| 配置 | 附魔书有 1 个异常附魔（无正常附魔） | 结果 |
|------|-------------------------------------|------|
| `true` | 直接 `setAmount(0)` 删除 | 不会产生空附魔书 |
| `false` | 仅移除该异常附魔 | 产生一本"空附魔书"（由下一项决定是否清理） |

::: details 兼容旧配置
旧版本配置键 `remove-enchanted-book-on-single-bug` 仍可使用，但已废弃。
新版本优先读取 `remove-enchanted-book-when-all-bug`，缺失时回退到旧键。
:::

#### `remove-empty-enchanted-book`

- **类型**：Boolean
- **默认值**：`true`
- **说明**：清理"真正没有任何存储附魔"的空附魔书

**使用场景**：某些数据包在删除附魔定义后无法彻底关闭生成逻辑，会持续产生空附魔书。此项用于清理这些残留。

**判定条件**：

1. 物品类型为 `ENCHANTED_BOOK`
2. `meta.getStoredEnchants()` 为空
3. UberEnchant PDC 也为空（无 `uberenchant:storeduberenchantment` 数据）
4. 未被识别为自定义物品（见下文）

---

### 自定义物品保护

#### `protect-custom-items`

- **类型**：Boolean
- **默认值**：`true`
- **说明**：保护 GUI 道具不被误删/误改

**识别为自定义物品的依据**（命中任意一项即视为自定义物品）：

| 依据 | 说明 |
|------|------|
| 自定义显示名称 | `meta.hasDisplayName()` |
| Lore 描述 | `meta.hasLore()`（仅当 PDC 不只是 UberEnchant 数据时） |
| CustomModelData | `meta.hasCustomModelData()` |
| 修复成本 | `Repairable.hasRepairCost()` |
| 不可破坏标记 | `meta.isUnbreakable()` |
| ItemFlags | `!meta.getItemFlags().isEmpty()`（仅当 PDC 不只是 UberEnchant 数据时） |
| 自定义属性修饰符 | `meta.hasAttributeModifiers()` |
| PDC 自定义数据 | PDC 中存在非 UberEnchant 的 key |

::: tip UberEnchant 物品优化
当物品 PDC 中**只有** UberEnchant 数据时（`uberenchant:uberenchantment` 或 `uberenchant:storeduberenchantment`），插件会自动跳过 Lore 和 ItemFlags 检查。

原因：UberEnchant 在添加附魔时会自动维护 Lore（附魔名+罗马数字）和 ItemFlags（HIDE_ENCHANTS），这些不代表物品本身是 GUI 道具。

如果跳过这两项检查，纯 UberEnchant 物品不会被误判为自定义物品，从而允许正常清理其 PDC 附魔。
:::

**保护行为**：

| 物品类型 | 触发保护时的行为 |
|----------|------------------|
| 附魔书 | **完全不修改 meta**，不删除、不移除附魔 |
| 普通物品 | **完全不修改 meta**，不移除附魔 |

::: warning v1.3 行为变更
v1.2 仅在"删除整本书"场景下保护自定义物品，允许"移除异常附魔"（会修改 meta，可能破坏 GUI 道具数据）。

v1.3 扩展为：**自定义物品无论哪种情况都不修改 meta**，避免破坏 GUI 道具数据。
:::

---

### UberEnchant 兼容

#### `clean-uber-enchant-glint`

- **类型**：Boolean
- **默认值**：`true`
- **说明**：清理 UberEnchant 添加的发光效果残留

**背景**：UberEnchant 在添加 PDC 附魔时会调用 `setEnchantmentGlintOverride(true)` 让物品发光。当所有 PDC 附魔被清空后，需要还原发光设置（设为 `null`）。

**版本兼容性**：

| 服务端版本 | 行为 |
|------------|------|
| Paper 1.20.5+ | 反射调用 `setEnchantmentGlintOverride(null)`，正常清理发光 |
| Paper 1.18.2 ~ 1.20.4 | 反射查找方法失败，静默跳过（不影响 PDC 数据清理） |
| Folia | 同 Paper，支持 1.20.5+ |

::: info 仅在 PDC 完全清空时触发
此选项只在 UberEnchant 容器（`uberenchant:uberenchantment` 或 `uberenchant:storeduberenchantment`）内所有附魔都被移除时才会触发。
部分移除不会清理发光（保留 UberEnchant 自身管理逻辑）。
:::

---

### 消息

#### `messages.actionbar`

- **类型**：String
- **默认值**：`"已自动清除异常附魔"`
- **说明**：清理后发送给玩家的 actionbar 消息

支持 MiniMessage 格式（由 Paper 内置）：

```yaml
messages:
  actionbar: "<red>已清理你背包中的异常附魔！</red>"
```

#### `messages.log-prefix`

- **类型**：String
- **默认值**：`"[BugEnchantRemover]"`
- **说明**：控制台日志前缀，用于 `log-removals` 和 `log-keyword-matches` 的输出

---

## 完整配置示例

### 最小配置（仅清理数据包附魔）

```yaml
enchant-id-keywords:
  - "nova_structures:"
translation-key-keywords:
  - "enchantment.dnt"

check-interval: 21
log-removals: true
log-keyword-matches: false

remove-enchanted-book-when-all-bug: true
remove-empty-enchanted-book: true
protect-custom-items: true
clean-uber-enchant-glint: false  # 不使用 UberEnchant，关闭以省反射开销

messages:
  actionbar: "已清理异常附魔"
  log-prefix: "[BugEnchantRemover]"
```

### 完整配置（含 UberEnchant 兼容）

```yaml
enchant-id-keywords:
  - "nova_structures:"
  - "uberenchant:"           # 清理所有 UberEnchant 药水效果附魔
translation-key-keywords:
  - "enchantment.dnt"

check-interval: 21
log-removals: true
log-keyword-matches: true    # 排查问题时开启

remove-enchanted-book-when-all-bug: true
remove-empty-enchanted-book: true
protect-custom-items: true
clean-uber-enchant-glint: true

messages:
  actionbar: "帮你清理掉找到的异常附魔书啦~"
  log-prefix: "[星玖姬]"
```

### 仅清理特定 UberEnchant 附魔

```yaml
enchant-id-keywords:
  - "uberenchant:blindness"     # 仅清理失明
  - "uberenchant:poison"        # 仅清理中毒
  - "uberenchant:wither"        # 仅清理凋零
translation-key-keywords: []

clean-uber-enchant-glint: true
```

::: tip 精准控制
通过精确指定附魔 ID（`uberenchant:blindness` 而非 `uberenchant:`），可以只清理特定的 UberEnchant 附魔，保留其他有益附魔（如 `uberenchant:speed`）。
完整的 UberEnchant 附魔 ID 列表见 [UberEnchant 兼容](./uber_enchant)。
:::
