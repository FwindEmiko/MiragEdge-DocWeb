---
title: UberEnchant 兼容
outline: deep
---

# UberEnchant 兼容（v1.3 新特性）

## 背景

### UberEnchant 的演进

**UberEnchant**（`coltonj96/UberEnchant`，GPL-3.0）是一个老牌自定义附魔插件，提供 37 个药水效果附魔（失明、中毒、凋零等）。

从 1.20.4 起，UberEnchant 改变了附魔存储方式：

| 版本 | 存储方式 | 兼容性 |
|------|----------|--------|
| < 1.20.4 | `Enchantment.registerEnchantment()` 注册到 Bukkit | 传统 `meta.getEnchants()` 可读 |
| ≥ 1.20.4 | PDC（PersistentDataContainer）存储 | 传统 API **完全读不到** |

### BugEnchantRemover-v1.3 解决方案

v1.3 直接读取 UberEnchant 的 PDC 数据结构，无需将 UberEnchant 作为依赖：

- 完全通过 Bukkit 标准 PDC API 操作
- 兼容 UberEnchant 的两种 PDC 数据结构
- 跨版本兼容（1.18.2 ~ 1.21+）

## UberEnchant PDC 数据结构

### 核心常量

来源：[UberUtils.java](https://github.com/coltonj96/UberEnchant/blob/master/src/me/sciguymjm/uberenchant/api/utils/UberUtils.java)

```java
public static final NamespacedKey uberEnchantment = 
    new NamespacedKey("uberenchant", "uberenchantment");        // 普通物品
public static final NamespacedKey storedUberEnchantment = 
    new NamespacedKey("uberenchant", "storeduberenchantment");  // 附魔书
public static final NamespacedKey LEVEL_KEY = 
    new NamespacedKey("uberenchant", "level");                  // 等级子键
```

### 普通物品（武器/防具/工具）

```
物品的 PersistentDataContainer
  └─ key: uberenchant:uberenchantment
       └─ type: TAG_CONTAINER
            └─ key: uberenchant:<ENCH_KEY>  ← 如 uberenchant:blindness
                 └─ type: TAG_CONTAINER 或 INTEGER
                      └─ key: uberenchant:level (仅嵌套结构)
                           └─ type: INTEGER
                           └─ value: 附魔等级
```

### 附魔书

```
物品的 PersistentDataContainer
  └─ key: uberenchant:storeduberenchantment
       └─ 结构同上
```

### 两种数据结构

::: warning 重要
UberEnchant 同时支持两种 PDC 数据结构，BugEnchantRemover v1.3 会**自动检测**并兼容这两种结构。
:::

#### 结构 A：直接 INTEGER（简化版）

```
uberenchant:uberenchantment (TAG_CONTAINER)
  └─ uberenchant:blindness (INTEGER) = 3   ← 直接存储等级
```

#### 结构 B：嵌套 TAG_CONTAINER（完整版，含其他元数据）

```
uberenchant:uberenchantment (TAG_CONTAINER)
  └─ uberenchant:blindness (TAG_CONTAINER)
       └─ uberenchant:level (INTEGER) = 3
       └─ uberenchant:duration (INTEGER) = 100
       └─ uberenchant:on_held (BOOLEAN) = true
       └─ ... 其他元数据
```

结构来源验证：[UberUtils.getCustomMap](https://github.com/coltonj96/UberEnchant/blob/master/src/me/sciguymjm/uberenchant/api/utils/UberUtils.java) 同时尝试两种结构。

## 附魔清单

UberEnchant 8.12.10+ 的 37 个药水效果附魔完整列表：

| PDC Key | 完整 ID | 说明 |
|---------|---------|------|
| `SPEED` | `uberenchant:speed` | 速度 |
| `SLOW` | `uberenchant:slow` | 缓慢 |
| `FAST_DIGGING` | `uberenchant:fast_digging` | 急迫 |
| `SLOW_DIGGING` | `uberenchant:slow_digging` | 挖掘疲劳 |
| `INCREASE_DAMAGE` | `uberenchant:increase_damage` | 力量 |
| `HEAL` | `uberenchant:heal` | 瞬间治疗 |
| `HARM` | `uberenchant:harm` | 瞬间伤害 |
| `JUMP` | `uberenchant:jump` | 跳跃提升 |
| `CONFUSION` | `uberenchant:confusion` | 反胃 |
| `REGENERATION` | `uberenchant:regeneration` | 生命恢复 |
| `DAMAGE_RESISTANCE` | `uberenchant:damage_resistance` | 抗性提升 |
| `FIRE_RESISTANCE` | `uberenchant:fire_resistance` | 火焰抗性 |
| `WATER_BREATHING` | `uberenchant:water_breathing` | 水下呼吸 |
| `INVISIBILITY` | `uberenchant:invisibility` | 隐身 |
| `BLINDNESS` | `uberenchant:blindness` | 失明 |
| `NIGHT_VISION` | `uberenchant:night_vision` | 夜视 |
| `HUNGER` | `uberenchant:hunger` | 饥饿 |
| `WEAKNESS` | `uberenchant:weakness` | 虚弱 |
| `POISON` | `uberenchant:poison` | 中毒 |
| `WITHER` | `uberenchant:wither` | 凋零 |
| `HEALTH_BOOST` | `uberenchant:health_boost` | 生命提升 |
| `ABSORPTION` | `uberenchant:absorption` | 伤害吸收 |
| `SATURATION` | `uberenchant:saturation` | 饱和 |
| `GLOWING` | `uberenchant:glowing` | 发光 |
| `LEVITATION` | `uberenchant:levitation` | 飘浮 |
| `LUCK` | `uberenchant:luck` | 幸运 |
| `UNLUCK` | `uberenchant:unluck` | 霉运 |
| `SLOW_FALLING` | `uberenchant:slow_falling` | 缓降 |
| `CONDUIT_POWER` | `uberenchant:conduit_power` | 潮涌能量 |
| `DOLPHINS_GRACE` | `uberenchant:dolphins_grace` | 海豚的恩惠 |
| `BAD_OMEN` | `uberenchant:bad_omen` | 不祥之兆 |
| `HERO_OF_THE_VILLAGE` | `uberenchant:hero_of_the_village` | 村庄英雄 |
| `DARKNESS` | `uberenchant:darkness` | 黑暗（1.19+） |
| `TRIAL_OMEN` | `uberenchant:trial_omen` | 试炼之兆（1.20.5+） |
| `RAID_OMEN` | `uberenchant:raid_omen` | 袭击之兆（1.20.5+） |
| `WIND_CHARGED` | `uberenchant:wind_charged` | 风充能（1.20.5+） |
| `WEAVING` | `uberenchant:weaving` | 结网（1.20.5+） |
| `OOZING` | `uberenchant:oozing` | 渗浆（1.20.5+） |
| `INFESTED` | `uberenchant:infested` | 寄生（1.20.5+） |
| `BREATH_OF_THE_NAUTILUS` | `uberenchant:breath_of_the_nautilus` | 鹦鹉螺的呼吸（1.21.11+） |

::: tip PDC Key 大小写
UberEnchant 内部用大写字符串（如 `"BLINDNESS"`）构造 `NamespacedKey`，但 Bukkit 的 `NamespacedKey` 会自动转为小写。

因此从 PDC 读取时 key 为小写（如 `uberenchant:blindness`），关键词匹配时使用小写即可。
:::

## 配置示例

### 1. 清理所有 UberEnchant 药水效果附魔

```yaml
enchant-id-keywords:
  - "uberenchant:"
clean-uber-enchant-glint: true
```

### 2. 仅清理负面效果附魔

```yaml
enchant-id-keywords:
  - "uberenchant:blindness"
  - "uberenchant:poison"
  - "uberenchant:wither"
  - "uberenchant:hunger"
  - "uberenchant:weakness"
  - "uberenchant:slow"
  - "uberenchant:slow_digging"
  - "uberenchant:confusion"
  - "uberenchant:darkness"
  - "uberenchant:unluck"
  - "uberenchant:bad_omen"
  - "uberenchant:levitation"
clean-uber-enchant-glint: true
```

### 3. 保留有益附魔，清理破坏平衡的附魔

```yaml
enchant-id-keywords:
  # 仅清理高破坏性附魔
  - "uberenchant:blindness"
  - "uberenchant:poison"
  - "uberenchant:wither"
  - "uberenchant:harm"           # 瞬间伤害
  - "uberenchant:infested"       # 1.20.5+ 寄生
  - "uberenchant:wind_charged"   # 1.20.5+ 风充能
clean-uber-enchant-glint: true
```

## 技术细节

### v1.3 的兼容性实现

#### 1. PDC 双结构兼容

```java
private Integer readUberEnchantLevel(PersistentDataContainer ueData, NamespacedKey enchantKey) {
    // 结构 A：直接 INTEGER
    if (ueData.has(enchantKey, PersistentDataType.INTEGER)) {
        return ueData.get(enchantKey, PersistentDataType.INTEGER);
    }
    // 结构 B：嵌套 TAG_CONTAINER，内部 level 子键
    if (ueData.has(enchantKey, PersistentDataType.TAG_CONTAINER)) {
        PersistentDataContainer enchData = ueData.get(enchantKey, PersistentDataType.TAG_CONTAINER);
        if (enchData != null && enchData.has(UE_LEVEL_KEY, PersistentDataType.INTEGER)) {
            return enchData.get(UE_LEVEL_KEY, PersistentDataType.INTEGER);
        }
    }
    return null;
}
```

#### 2. setEnchantmentGlintOverride 跨版本兼容

`ItemMeta.setEnchantmentGlintOverride()` 是 Paper 1.20.5+ 新增 API，paper-api 1.18.2 jar 中不存在。直接调用会导致编译失败。

v1.3 通过反射 + 双重检查锁缓存实现兼容：

```java
private void setEnchantmentGlintSafe(ItemMeta meta, Boolean value) {
    if (!glintOverrideChecked) {
        synchronized (this) {
            if (!glintOverrideChecked) {
                try {
                    glintOverrideMethod = ItemMeta.class.getMethod(
                        "setEnchantmentGlintOverride", Boolean.class);
                } catch (NoSuchMethodException ignored) {
                    glintOverrideMethod = null;  // 旧版本静默跳过
                }
                glintOverrideChecked = true;
            }
        }
    }
    if (glintOverrideMethod == null) return;
    try {
        glintOverrideMethod.invoke(meta, value);
    } catch (Exception ignored) {}
}
```

#### 3. isCustomItem 的 UberEnchant 排除

UberEnchant 在添加 PDC 附魔时会自动维护：

- Lore（附魔名 + 罗马数字等级）
- ItemFlags（HIDE_ENCHANTS）
- 发光效果（setEnchantmentGlintOverride(true)）

如果直接用 v1.2 的 `isCustomItem` 判定，纯 UberEnchant 物品会因为 `meta.hasLore()` 返回 true 而被误判为 GUI 道具，从而无法清理。

v1.3 改进：检测 PDC 是否**仅含** UberEnchant 数据，若是则跳过 Lore/ItemFlags 检查：

```java
boolean onlyUberEnchantPdc = false;
if (!pdc.isEmpty()) {
    onlyUberEnchantPdc = true;
    for (NamespacedKey key : pdc.getKeys()) {
        if (!UE_TOP_KEYS.contains(key)) {
            onlyUberEnchantPdc = false;
            break;
        }
    }
}

if (meta.hasDisplayName()) return true;
if (!onlyUberEnchantPdc) {
    if (meta.hasLore()) return true;
    if (!meta.getItemFlags().isEmpty()) return true;
}
```

## 验证测试

### 测试步骤

1. **安装 UberEnchant**：将 UberEnchant 8.12.10+ jar 放入 `plugins/`

2. **生成测试物品**：
   ```
   /ue give <player> blindness 3
   ```
   或：
   ```
   /ue givebook <player> blindness 3
   ```

3. **检测物品**：
   ```
   /bugenchanttest
   ```
   应看到：
   ```
   --- UberEnchant PDC 附魔 ---
   附魔ID: uberenchant:blindness
     命名空间: uberenchant | 键名: blindness
     翻译键: enchantment.uberenchant.blindness | 等级: 3
     检测为Bug: 是
   ```

4. **配置关键词**：
   ```yaml
   enchant-id-keywords:
     - "uberenchant:"
   ```

5. **重载并清理**：
   ```
   /bugenchantreload
   /bugenchantscan
   ```

6. **验证清理结果**：
   - 再次 `/bugenchanttest`，应显示"附魔总数: 0"
   - 物品不再发光（如服务端为 1.20.5+）

### 期望行为对照表

| 物品类型 | UberEnchant 附魔 | 配置 | 期望结果 |
|----------|------------------|------|----------|
| 剑 + blindness | 1 个 | `uberenchant:` | 移除附魔，清理发光 |
| 剑 + blindness + 原版锋利 | 1 个 UberEnchant + 1 个原版 | `uberenchant:` | 移除 blindness，保留锋利 |
| 附魔书 + blindness | 1 个 | `uberenchant:` | 删除整本书（全异常） |
| 附魔书 + blindness + 原版锋利 | 1 个 UberEnchant + 1 个原版 | `uberenchant:` | 移除 blindness，保留锋利 |
| 自定义 GUI 道具 + UberEnchant | 1 个 | `uberenchant:` + `protect-custom-items: true` | **不修改**，保护自定义物品 |

## 常见问题

### Q1：清理后物品仍发光

**原因**：

1. 服务端为 Paper 1.18.2 ~ 1.20.4，`setEnchantmentGlintOverride` API 不存在
2. UberEnchant 容器未完全清空（仍有其他附魔）

**解决方案**：

- 升级服务端至 Paper 1.20.5+
- 或检查 `/bugenchanttest` 是否还有残留 UberEnchant 附魔

### Q2：UberEnchant 物品被识别为自定义物品，未被清理

**原因**：可能物品 PDC 中除 UberEnchant 数据外还有其他自定义数据。

**排查**：

1. 用 `/bugenchanttest` 查看"识别为自定义物品(GUI道具)"字段
2. 检查 PDC 是否有非 UberEnchant 的 key（如其他插件写入的数据）

**解决方案**：

- 如确实是 GUI 道具，保持保护开启
- 如需强制清理，临时设置 `protect-custom-items: false`

### Q3：清理 UberEnchant 附魔后，附魔书的 Lore 仍残留

**已知限制**：v1.3 仅清理 PDC 数据，不主动移除 UberEnchant 添加的 Lore（附魔名+罗马数字）。

**规避方案**：

- 手动用铁砧+附魔书移除 Lore
- 或等待后续版本支持 Lore 清理（P2 优先级）

### Q4：是否需要将 UberEnchant 作为依赖？

**不需要**。v1.3 完全通过 Bukkit 标准 PDC API 操作，无需导入 UberEnchant 的任何类。

只要安装了 UberEnchant 并添加了附魔到物品上，BugEnchantRemover 即可直接读取/移除其 PDC 数据。

### Q5：清理 PDC 后，UberEnchant 还能识别这个物品吗？

UberEnchant 自身通过 PDC 识别附魔物品。当 `uberenchant:uberenchantment` 容器被完全清空后，UberEnchant 会认为该物品没有附魔，不再触发药水效果。

这是预期的清理结果，无需担心副作用。
