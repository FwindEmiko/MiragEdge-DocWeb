<!-- 来源页面: https://miragedge.top/plugin-guides/fepvp/kit -->
<!-- 由 llms.txt 标准生成器自动产出，源文件: plugin-guides/fepvp/kit.md -->

# 装备组合管理

装备组合（Kit）是管理员预设的 PvP 装备包，玩家在比赛开始前通过 GUI 选择要使用的组合。

装备组合的管理命令都需要权限 `fepvp.admin`，且不需要 admin 前缀，直接使用 `/fepvp kit ...`。

## 创建装备组合

### 从当前背包创建

1. 穿好装备，放好背包物品。
2. 执行 `/fepvp kit create 经典PvP`。

插件自动把当前背包（36 格）、盔甲（4 格）与副手保存为装备组合，默认适用类型 `BOTH`。

### 编辑装备组合

执行 `/fepvp kit edit 经典PvP` 打开 GUI 编辑器，直接拖放物品修改：

- 槽位 0-35：背包内容
- 槽位 36-39：盔甲（靴子、护腿、胸甲、头盔）
- 槽位 40：副手

关闭 GUI 时自动保存。

### 其余管理命令

| 命令 | 作用 |
| :--- | :--- |
| `/fepvp kit settype 经典PvP duel` | 设置适用模式，可选 `duel`、`team`、`both` |
| `/fepvp kit seticon 经典PvP DIAMOND_SWORD` | 设置 GUI 显示图标 |
| `/fepvp kit list` | 列出所有装备组合 |
| `/fepvp kit remove 经典PvP` | 删除装备组合 |

## kits.yml 存储格式

文件位置：`plugins/FE_PVP/kits.yml`

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
| :--- | :--- | :--- |
| `display-name` | String | 显示名称，支持 `§` 颜色代码 |
| `icon` | Material | GUI 中的图标材质 |
| `description` | List\ | GUI Lore 描述 |
| `type` | String | `DUEL`、`TEAM`、`BOTH`，适用的竞技场类型 |
| `contents` | Map\ | 背包内容，键为槽位编号 |
| `armor` | Map\ | 盔甲，0 为靴、1 为腿、2 为胸、3 为头 |
| `offhand` | ItemStack | 副手物品 |

## 类型过滤规则

| 装备类型 | 单挑竞技场 | 团队竞技场 | 饥饿游戏 |
| :--- | :--- | :--- | :--- |
| `DUEL` | 显示 | 不显示 | 不使用 |
| `TEAM` | 不显示 | 显示 | 不使用 |
| `BOTH` | 显示 | 显示 | 不使用 |

饥饿游戏开局直接使用补给箱装备，不经过装备组合选择，并清空玩家自带装备；`start-empty: false` 可保留自带装备。
