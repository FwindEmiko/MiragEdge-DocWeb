---
title: 数据包工作流 · 函数
description: mcfunction 函数的写法与调度。涵盖 load/tick 标签注册、函数目录组织、物品组件测试语法、赋值与测试的格式差异，以及验证和部署命令。
outline: [2, 3]
---

# 数据包工作流 · 函数

函数承载数据包的全部逻辑：状态检测、条件分支、定时任务。

## 调度机制

函数有三种触发方式：

| 触发方式 | 时机 | 用途 |
| --- | --- | --- |
| `#minecraft:load` | 数据包加载或重载时执行一次 | 初始化记分板、设置默认值 |
| `#minecraft:tick` | 每游戏 tick 执行一次，1 tick 为 1/20 秒 | 持续运行的逻辑 |
| `/function` | 由命令方块、其他函数或玩家触发 | 按需执行的逻辑 |

函数目录按用途分类：

```text
function/
├── load.mcfunction         # 注册到 #minecraft:load
├── tick.mcfunction         # 注册到 #minecraft:tick
├── core/                   # 核心逻辑
├── items/                  # 物品相关
├── mobs/                   # 生物相关
└── test/                   # 测试函数
```

## 编写

### 1. 创建 load 函数

```mcfunction
# data/miragedge/function/load.mcfunction
# 触发时机：数据包加载/重载时自动执行

# 初始化记分板
scoreboard objectives add miragedge_var dummy "MiragEdge Variables"
scoreboard objectives add miragedge_kills dummy "MiragEdge Kills"

# 设置默认游戏规则
gamerule keepInventory true
gamerule doFireTick false

# 广播加载完成
tellraw @a ["",{"text":"[MiragEdge] ","color":"gold"},{"text":"数据包已加载！","color":"green"}]
```

### 2. 创建 tick 函数

```mcfunction
# data/miragedge/function/tick.mcfunction
# 触发时机：每 tick 执行

execute as @a run function miragedge:core/player_check
```

### 3. 注册到函数标签

标签文件决定哪些函数在 load/tick 时自动执行。

```json
// data/minecraft/tags/function/load.json
{
  "replace": false,
  "values": [
    "miragedge:load"
  ]
}
```

```json
// data/minecraft/tags/function/tick.json
{
  "replace": false,
  "values": [
    "miragedge:tick"
  ]
}
```

::: tip 显式声明 replace: false
`replace` 的默认值就是 `false`，即合并模式。多个数据包同时注册 `#minecraft:tick` 时，显式声明可以防止误覆盖。详见[排错页的 tick.json 说明](../troubleshooting#tickjson-的-replace-字段)。
:::

### 4. 条件分支与 CE 物品交互

```mcfunction
# data/miragedge/function/items/check_sword.mcfunction
# 检查玩家手持物品并给予效果

# 通过 custom_data 组件匹配 CE 物品
execute as @a if items entity @s weapon.mainhand *[custom_data~{craftengine:{id:"miragedge:flame_sword"}}] run effect give @s minecraft:fire_resistance 5 0 true

# 匹配物品的自定义名称
execute as @a if items entity @s weapon.mainhand *[minecraft:custom_name='{"text":"龙焰之刃","color":"gold","italic":false}'] run function miragedge:items/sword_ability
```

### 5. 物品组件测试语法

`execute if items ... *[组件~值]` 中 `~` 后面的值必须严格匹配组件的数据结构。

| 组件 | 测试值格式 | 示例 |
| --- | --- | --- |
| `minecraft:enchantments` | 列表 `[{<附魔 ID>: <最低等级>}]` | `*[minecraft:enchantments~[{silk_touch:1}]]` |
| `minecraft:custom_data` | 对象 `{...}` | `*[custom_data~{craftengine:{id:"miragedge:flame_sword"}}]` |
| `minecraft:custom_name` | JSON 字符串 | `*[minecraft:custom_name='{"text":"剑","color":"gold"}']` |
| `minecraft:damage` | 整数 | `*[minecraft:damage~10]` |
| `minecraft:max_damage` | 整数 | `*[minecraft:max_damage~100]` |

::: danger 附魔测试值必须是列表
把附魔测试值写成对象会报 `Malformed 'minecraft:enchantments' predicate: 'Not a list'`。

错误写法：

```mcfunction
# 这是 give 命令的赋值语法，不是测试语法
execute as @a if items entity @s weapon.mainhand *[minecraft:enchantments~{levels:{"minecraft:silk_touch":1}}] run say has silk touch
```

正确写法：

```mcfunction
execute as @a if items entity @s weapon.mainhand *[minecraft:enchantments~[{silk_touch:1}]] run say has silk touch

# 多附魔同时检测
execute as @a if items entity @s weapon.mainhand *[minecraft:enchantments~[{sharpness:3},{unbreaking:1}]] run say enchanted
```
:::

赋值与测试是两套格式。`/give` 中的 `{levels:{"minecraft:silk_touch":1}}` 是赋值，`execute if items` 中 `~` 后面的是测试。

## 校验

```bash
/reload
/function miragedge:load
/datapack list
/datapack list available miragedge
/scoreboard objectives list
```

手持测试物品执行 `/ce item get miragedge:flame_sword`，观察效果是否生效。

## 部署

1. 把完整数据包文件夹复制到世界的 `datapacks/` 目录。
2. 执行 `/reload`，或重启服务器。
3. 执行 `/datapack list` 确认包已启用。
4. 检查服务端日志无报错。

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 函数不随 load 执行 | 标签文件未注册 | 检查 `data/minecraft/tags/function/load.json` 的 `values` |
| 函数不随 tick 执行 | 其他包用 `replace: true` 覆盖 | 本包显式声明 `replace: false`，并排查同标签的其他包 |
| 附魔检测报 `Not a list` | 测试值写成了对象 | 改为 `*[minecraft:enchantments~[{silk_touch:1}]]` |
| CE 物品检测恒为假 | `custom_data` 层级或命名空间写错 | 用 `/data get entity @s SelectedItem` 核对实际组件结构 |
