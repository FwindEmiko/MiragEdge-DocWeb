---
title: 数据包工作流 · 结构
description: 结构的制作与注册。涵盖用结构方块导出 .nbt 模板、配置结构池与结构集、在 worldgen 中引用 CraftEngine 方块的 provider 类型，以及 /place 与 /locate 校验方式。
outline: [2, 3]
---

# 数据包工作流 · 结构

结构是预定义的方块与实体组合，用 `.nbt` 文件存储，可用于手动放置或世界生成。

## 三种使用方式

| 方式 | 触发 | 说明 |
| --- | --- | --- |
| 结构方块 | `/place template` 手动放置 | 调试与一次性布置 |
| 世界生成 | structure set 与 template pool | 生成新区块时自动放置 |
| 拼图结构 | Jigsaw | 多个子结构拼接成大型建筑 |

## 制作流程

```text
1. 在测试世界中建造结构
       ↓
2. 用结构方块保存为 .nbt 模板
       ↓
3. 从世界目录复制到数据包 structure/ 目录
       ↓
4. 配置 structure / structure_set / template_pool 注册
       ↓
5. 验证生成结果
```

::: warning 含 CE 方块的模板有环境依赖
CE 自定义方块能正常保存和加载，但使用内部 ID，如 `craftengine:custom_0`。跨环境迁移时必须保证 CE 配置完全一致。放置前先执行 `/ce reload`。
:::

## 编写

### 1. 用结构方块保存 .nbt 模板

```mcfunction
# 取结构方块
/give @s minecraft:structure_block
```

1. 在结构左下角放置结构方块，设为「保存模式」，名称填 `miragedge:ruby_shrine`。
2. 在右上角放置第二个结构方块，设为「角落模式」，名称与第一个相同。
3. 点击第一个结构方块的「探测」按钮确认选区。
4. 点击「保存」。

文件保存到 `<world>/generated/miragedge/structures/ruby_shrine.nbt`。

### 2. 复制到数据包

```text
源：<world>/generated/miragedge/structures/ruby_shrine.nbt
目标：data/miragedge/structure/ruby_shrine.nbt
```

### 3. 配置结构池

```json
// data/miragedge/worldgen/template_pool/ruby_shrine.json
{
  "fallback": "minecraft:empty",
  "elements": [
    {
      "weight": 1,
      "element": {
        "element_type": "minecraft:single_pool_element",
        "location": "miragedge:ruby_shrine",
        "projection": "rigid",
        "processors": "minecraft:empty"
      }
    }
  ]
}
```

### 4. 配置结构定义

```json
// data/miragedge/worldgen/structure/ruby_shrine.json
{
  "type": "minecraft:jigsaw",
  "biomes": "#minecraft:has_structure/ruby_shrine",
  "step": "surface_structures",
  "spawn_overrides": {},
  "terrain_adaptation": "beard_thin",
  "start_pool": "miragedge:ruby_shrine",
  "size": 1,
  "start_height": {
    "absolute": 0
  },
  "project_start_to_heightmap": "WORLD_SURFACE_WG",
  "max_distance_from_center": 80,
  "use_expansion_hack": false
}
```

### 5. 配置结构集

```json
// data/miragedge/worldgen/structure_set/ruby_shrines.json
{
  "structures": [
    {
      "structure": "miragedge:ruby_shrine",
      "weight": 1
    }
  ],
  "placement": {
    "type": "minecraft:random_spread",
    "spacing": 34,
    "separation": 16,
    "salt": 427590123
  }
}
```

### 6. 在世界生成中引用 CE 方块

```json
// data/miragedge/worldgen/configured_feature/ruby_tree.json
{
  "type": "minecraft:tree",
  "config": {
    "trunk_provider": {
      "type": "craftengine:simple_state_provider",
      "state": {
        "Name": "miragedge:ruby_log",
        "Properties": { "axis": "y" }
      }
    },
    "foliage_provider": {
      "type": "craftengine:simple_state_provider",
      "state": {
        "Name": "miragedge:ruby_leaves",
        "Properties": {
          "distance": "7",
          "persistent": "false",
          "waterlogged": "false"
        }
      }
    }
  }
}
```

::: danger provider 类型必须换成 CE 版本
在 worldgen JSON 中使用 CE 方块时，provider 的 `type` 必须写 `craftengine:simple_state_provider`，不能写 `minecraft:simple_state_provider`。其余字段格式完全一致。
:::

CE 支持的 block state provider 类型：

```text
craftengine:simple_state_provider
craftengine:weighted_state_provider
craftengine:rotated_block_provider
craftengine:randomized_int_state_provider
```

## 校验

```bash
/reload

# 直接放置结构
/place template miragedge:ruby_shrine ~ ~ ~

# 查找最近的结构
/locate structure miragedge:ruby_shrine

# 查看 CE 方块内部 ID
/ce block info
```

1. 放置后确认 CE 方块没有变成空气或错误方块。
2. 若 CE 方块异常，先执行 `/ce reload`，再核对方块 ID 是否匹配。
3. 飞往未生成的远处区块，确认结构自然生成。

## 部署

1. `.nbt` 模板放入 `data/miragedge/structure/`。
2. 结构配置放入 `data/miragedge/worldgen/structure/`。
3. 结构池放入 `data/miragedge/worldgen/template_pool/`。
4. 结构集放入 `data/miragedge/worldgen/structure_set/`。
5. 涉及 CE 方块时先执行 `/ce reload`。
6. 世界生成改动必须重启服务器或重新进入世界，`/reload` 不生效。

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `/place template` 报找不到结构 | 文件未放在 `structure/` 目录 | 核对 `.nbt` 相对路径与命名空间 |
| 结构放置后 CE 方块变空气 | CE 未重载或方块 ID 不匹配 | 先 `/ce reload`，再核对 ID |
| 世界生成中 CE 方块消失 | provider 类型写了 `minecraft:` | 改为 `craftengine:simple_state_provider` |
| 结构不生成 | 结构集未注册或生物群系标签为空 | 核对 `structure_set` 与 `biomes` 标签 |
| 改动后结构仍是旧的 | worldgen 不随 `/reload` 生效 | 重启服务器 |
