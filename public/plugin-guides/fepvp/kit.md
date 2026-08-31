<!-- 来源页面: https://miragedge.top/plugin-guides/fepvp/kit -->
<!-- 由 llms.txt 标准生成器自动产出，源文件: plugin-guides/fepvp/kit.md -->

# 03 — 装备组合管理

## 概述

装备组合（Kit）是管理员预设的 PvP 装备包。玩家在比赛开始前通过 GUI 选择要使用的组合。

> 所有装备组合管理命令均需管理员权限 `fepvp.admin`，且**不需要** admin 前缀，直接使用 `/fepvp kit ...`。

## 创建装备组合

### 从当前背包创建

1. 穿好你想要的装备，放好背包物品
2. 执行：

```
/fepvp kit create 经典PvP
```

自动将当前背包（36 格）、盔甲（4 格）、副手保存为装备组合（默认适用类型 `BOTH`）。

### 编辑装备组合

```
/fepvp kit edit 经典PvP
```

打开 GUI 编辑器，直接拖放物品修改：

- 槽位 0-35：背包内容
- 槽位 36-39：盔甲（靴子/护腿/胸甲/头盔）
- 槽位 40：副手

关闭 GUI 时自动保存。

### 设置适用模式

```
/fepvp kit settype 经典PvP duel     # duel | team | both
```

### 设置显示图标

```
/fepvp kit seticon 经典PvP DIAMOND_SWORD
```

### 列出所有装备组合

```
/fepvp kit list
```

### 删除装备组合

```
/fepvp kit remove 经典PvP
```

## kits.yml 存储格式

文件位置：```plugins/FE_PVP/kits.yml```

```yaml
kits:
  经典PvP:
    display-name: "§f经典PvP"
    icon: DIAMOND_SWORD
    description:
      - "§7经典 PvP 装备"
      - "§7钻石剑 + 铁甲"
    type: DUEL           # DUEL | TEAM | BOTH
    contents:
      0:
        ==: org.bukkit.inventory.ItemStack
        v: 3837
        type: DIAMOND_SWORD
        meta:
          ==: ItemMeta
          meta-type: UNSPECIFIC
      1:
        ==: org.bukkit.inventory.ItemStack
        v: 3837
        type: GOLDEN_APPLE
        amount: 8
      5:
        ==: org.bukkit.inventory.ItemStack
        v: 3837
        type: ENDER_PEARL
        amount: 16
    armor:
      0:   # 靴子
        ==: org.bukkit.inventory.ItemStack
        type: IRON_BOOTS
      1:   # 护腿
        ==: org.bukkit.inventory.ItemStack
        type: IRON_LEGGINGS
      2:   # 胸甲
        ==: org.bukkit.inventory.ItemStack
        type: IRON_CHESTPLATE
      3:   # 头盔
        ==: org.bukkit.inventory.ItemStack
        type: IRON_HELMET
    offhand:
      ==: org.bukkit.inventory.ItemStack
      type: SHIELD
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `display-name` | String | 显示名称（支持 `§` 颜色代码） |
| `icon` | Material | GUI 中的图标材质 |
| `description` | List\ | GUI Lore 描述 |
| `type` | String | `DUEL` / `TEAM` / `BOTH` — 适用的竞技场类型 |
| `contents` | Map\ | 背包内容（键 = 槽位编号） |
| `armor` | Map\ | 盔甲（0=靴 1=腿 2=胸 3=头） |
| `offhand` | ItemStack | 副手物品 |

## 装备选择流程

比赛开始时（单挑/团队）：

1. 系统打开「选择装备组合」GUI
2. 显示所有适用当前竞技场类型的装备组合
3. 如果 ```config.yml``` 中 ```kit.allow-own-gear: true```，额外显示「使用自己的装备」选项
4. 玩家点击选择，5 秒后自动进入倒计时
5. 未选择的玩家使用默认装备

> **饥饿游戏（FFA）跳过装备选择**：开局直接使用补给箱装备，玩家清空自带装备（可配置 `start-empty: false` 保留）。

## 类型过滤规则

| 装备类型 | 单挑竞技场 | 团队竞技场 | 饥饿游戏 |
|----------|-----------|-----------|----------|
| `DUEL` | ✅ 显示 | ❌ 不显示 | 不使用 |
| `TEAM` | ❌ 不显示 | ✅ 显示 | 不使用 |
| `BOTH` | ✅ 显示 | ✅ 显示 | 不使用 |
