---
title: 实战场景
outline: deep
---

# 实战场景

本文档列举常见数据包/插件的异常附魔清理配置示例，可直接复制使用。

## 场景一：数据包残留附魔书

### 问题描述

服务器安装了 `nova_structures` 数据包，后因平衡性问题移除了其中的自定义附魔定义，但已生成的附魔书仍残留在玩家背包中。这些附魔书：

- 附魔 ID 形如 `nova_structures:old_enchant`
- 翻译键为 `enchantment.nova_structures.old_enchant`，但因附魔定义已删除，游戏内显示为空
- 部分附魔书变成了"无附魔的空书"

### 配置方案

```yaml
enchant-id-keywords:
  - "nova_structures:"
translation-key-keywords:
  - "enchantment.nova_structures."

remove-enchanted-book-when-all-bug: true   # 全异常时直接删整本
remove-empty-enchanted-book: true          # 清理空书
protect-custom-items: true                 # 保护 GUI 道具
clean-uber-enchant-glint: false            # 不涉及 UberEnchant
```

### 验证流程

1. 手持残留附魔书执行 `/bugenchanttest`，确认：
   - "异常附魔数" > 0
   - "预测处理结果" 为 `删除整本书（全为异常附魔）` 或 `移除异常附魔（保留正常附魔）`
2. `/bugenchantreload` 重载配置
3. `/bugenchantscan` 手动扫描，观察输出统计
4. 如有 GUI 道具被误判，检查"识别为自定义物品"字段是否为"是"

## 场景二：清理所有 UberEnchant 药水效果附魔

### 问题描述

服务器安装了 UberEnchant 8.12.10+，但管理员认为 37 个药水效果附魔（失明、中毒、凋零等）过于破坏平衡，希望全部清理。

### 配置方案

```yaml
enchant-id-keywords:
  - "uberenchant:"              # 通配所有 UberEnchant 附魔
translation-key-keywords: []

remove-enchanted-book-when-all-bug: true
remove-empty-enchanted-book: true
protect-custom-items: true
clean-uber-enchant-glint: true  # 清理 UberEnchant 添加的发光
```

### 验证流程

1. 用 UberEnchant 命令 `/ue give <player> blindness 3` 给自己一个带附魔的物品
2. 手持该物品执行 `/bugenchanttest`，确认：
   - "UberEnchant PDC 附魔" 部分显示 `uberenchant:blindness`
   - "检测为Bug" 为 `是`
   - "预测处理结果" 为 `移除异常附魔`
3. `/bugenchantscan` 清理后，再次执行 `/bugenchanttest`：
   - "附魔总数" 应为 0
   - 物品不再发光（如服务端为 1.20.5+）

::: warning GUI 道具保护
如果服务器有使用 UberEnchant PDC 存储"特殊效果"的自定义 GUI 道具（如付费 VIP 专属附魔），使用 `uberenchant:` 通配会误伤这些道具。

解决方案：
1. 启用 `protect-custom-items: true`，这些道具通常有 CustomModelData 或 displayName
2. 或改用精准匹配（见场景三）
:::

## 场景三：仅清理部分 UberEnchant 附魔

### 问题描述

希望保留 UberEnchant 的有益附魔（如 `speed`、`jump`），但清理破坏平衡的附魔（如 `blindness`、`poison`、`wither`）。

### 配置方案

```yaml
enchant-id-keywords:
  - "uberenchant:blindness"
  - "uberenchant:poison"
  - "uberenchant:wither"
  - "uberenchant:hunger"
  - "uberenchant:weakness"
translation-key-keywords: []

clean-uber-enchant-glint: true
```

### 完整 UberEnchant 附魔 ID 列表

参见 [UberEnchant 兼容 — 附魔清单](./uber_enchant#附魔清单)。

## 场景四：清理玩家手中的"问题物品"

### 问题描述

某玩家通过漏洞获得了带有非法附魔的物品，需要即时清理。但物品可能不在背包中，而在玩家手中或装备栏。

### 操作流程

1. **识别问题物品**：
   ```
   /bugenchanttest
   ```
   让玩家手持问题物品执行，获取附魔 ID

2. **添加临时关键词**：
   编辑 `config.yml`，将异常附魔的特征加入关键词列表

3. **重载配置**：
   ```
   /bugenchantreload
   ```

4. **即时清理**：
   ```
   /bugenchantscan
   ```
   让玩家执行扫描，立即清理背包

5. **验证清理结果**：
   再次 `/bugenchanttest` 确认物品已无异常附魔

::: tip 实时清理
即使不执行 `/bugenchantscan`，定时任务也会在 21 tick（约 1 秒）内自动清理。
`/bugenchantscan` 仅用于"立即生效"的场景。
:::

## 场景五：Folia 服务端部署

### 问题描述

服务器使用 Folia（Paper 的多线程分支），需要确认插件兼容性。

### 部署流程

1. 直接安装 jar 文件，无需特殊配置
2. 启动时查看控制台：
   ```
   [BugEnchantRemover] 检测到服务端类型: Folia | 调度模式: 同步
   ```
3. 如看到此日志，说明插件已自动切换为 Folia 同步调度模式

### Folia 与 Paper 的差异

| 特性 | Paper | Folia |
|------|-------|-------|
| 调度模式 | 异步触发 + 主线程执行 | 同步执行（事件已在区域线程） |
| 性能 | 略高 | 略低（无异步优化） |
| 线程安全 | 主线程安全 | 区域线程安全 |
| 兼容性 | 完整 | 完整（自动适配） |

::: info 自动检测原理
插件通过尝试加载 `io.papermc.paper.threadedregions.ThreadedRegionizer` 类判断是否为 Folia。
该类仅存在于 Folia 服务端，不存在则视为 Paper。
:::

## 场景六：与 FE_MWSarden 配合使用

### 问题描述

`FE_MWSarden` 是锐界幻境的违禁物品检测插件（处理结构方块等），`BugEnchantRemover` 处理异常附魔。两者职责互补，可同时部署。

### 协同部署建议

| 插件 | 处理对象 | 处理方式 |
|------|----------|----------|
| FE_MWSarden | 违禁物品（结构方块等） | 物品删除 |
| BugEnchantRemover | 异常附魔 | 附魔移除/物品删除 |

两者无冲突，可放心同时使用。

## 常见问题排查

### Q1：`/bugenchanttest` 显示"识别为自定义物品: 是"，导致物品未被清理

**原因**：物品触发了 GUI 道具保护条件。

**排查步骤**：

1. 检查物品是否有 `displayName`（自定义显示名）
2. 检查物品是否有 `CustomModelData`
3. 检查物品是否有 `AttributeModifiers`
4. 检查 PDC 中是否有非 UberEnchant 的数据

**解决方案**：

- 如确实是 GUI 道具，保持保护开启，不应清理
- 如需强制清理，临时设置 `protect-custom-items: false` 后 `/bugenchantreload`

### Q2：清理后物品仍发光

**原因**：

- 服务端为 Paper 1.18.2 ~ 1.20.4，`setEnchantmentGlintOverride` API 不存在
- 或 UberEnchant 容器未完全清空（仍有其他附魔）

**解决方案**：

1. 升级服务端至 Paper 1.20.5+
2. 或手动用 `/bugenchanttest` 检查是否还有残留 UberEnchant 附魔

### Q3：定时扫描间隔修改后未生效

**原因**：`/bugenchantreload` 不会重启定时任务。

**解决方案**：重启服务器。

### Q4：日志中没有清理记录，但异常附魔仍存在

**排查步骤**：

1. 开启 `log-keyword-matches: true`，`/bugenchantreload`
2. 手持物品执行 `/bugenchanttest`，查看控制台是否输出匹配日志
3. 如无匹配日志，说明关键词配置有误（检查拼写、大小写）
4. 如有匹配日志但物品未被清理，检查是否被识别为自定义物品

### Q5：Folia 服务端容器关闭后清理延迟

**原因**：Folia 不支持 `runTaskLater`，插件改为同步执行（无延迟）。

**影响**：清理会立即执行，无 1 tick 延迟。功能正常，无副作用。
