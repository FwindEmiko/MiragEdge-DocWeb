---
title: 基岩版资源包结构
description: 基岩版资源包的目录与文件格式。涵盖 manifest.json、item_texture.json、terrain_texture.json 的写法、纹理键前缀规则、80 字符路径限制、几何体文件与 attachable 定义。
outline: [2, 3]
---

# 基岩版资源包结构

这页给出基岩版资源包的最小文件集合与各文件的字段规则。

## 目录结构

```text
my-pack.mcpack 或 my-pack.zip
├── manifest.json
├── textures/
│   ├── item_texture.json       # 物品纹理图集
│   ├── terrain_texture.json    # 方块纹理图集
│   ├── items/                  # 物品 PNG
│   │   └── my_item.png
│   ├── blocks/                 # 方块 PNG
│   │   └── my_block.png
│   └── models/
│       └── armor/              # 盔甲纹理
│           ├── my_armor_1.png  # 胸甲
│           └── my_armor_2.png  # 护腿
├── models/
│   └── blocks/
│       └── my_block.geo.json   # 方块几何体
└── attachables/
    └── my_armor.json           # 可穿戴物品定义
```

## manifest.json

```json
{
  "format_version": 2,
  "header": {
    "description": "My Resource Pack",
    "name": "My Pack",
    "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "version": [1, 0, 0],
    "min_engine_version": [1, 16, 0]
  },
  "modules": [
    {
      "description": "My Resource Pack",
      "type": "resources",
      "uuid": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
      "version": [1, 0, 0]
    }
  ]
}
```

- 两个 UUID 必须不同且唯一。
- `type` 必须是 `"resources"`。
- `min_engine_version` 设为 `[1, 16, 0]` 可跨版本兼容。

## item_texture.json

```json
{
  "resource_pack_name": "my_pack",
  "texture_name": "atlas.items",
  "texture_data": {
    "my_ns:my_item": {
      "textures": "textures/items/my_item"
    }
  }
}
```

- 键名是纹理标识符，供映射文件的 `bedrock_options.icon` 引用。
- 不设 `icon` 时，默认从 `bedrock_identifier` 推导，`:` 换成 `.`，`/` 换成 `_`。
- 路径不带 `.png` 后缀。

## terrain_texture.json

```json
{
  "resource_pack_name": "my_pack",
  "texture_name": "atlas.terrain",
  "padding": 8,
  "num_mip_levels": 4,
  "texture_data": {
    "blocks_crop_cucumber_1": {
      "textures": "blocks/crop/cucumber/cucumber_1"
    }
  }
}
```

- 键名格式为 `blocks_` 加路径，路径中的分隔符用 `_` 连接。
- 该键对应方块映射中的 `material_instances.*.texture`。

## 纹理键前缀

::: danger block_ 与 item_ 前缀决定渲染方式
- `block_` 前缀的纹理键按 3D 方块展开图渲染，显示为方块拆解图。
- `item_` 前缀的纹理键按平面物品图标渲染。

同一个 PNG 文件只需在 `item_texture.json` 和 `terrain_texture.json` 中分别用不同前缀注册。
:::

## 80 字符路径限制

基岩版资源包内的文件路径，从包根开始计算，不能超过 80 字符。超长路径会导致 Geyser 启动警告，基岩客户端可能无法加载。

修复方式是缩短目录名，例如把 `crimson_bracket_fungus` 改为 `cbf`。

## 几何体文件

```json
{
  "format_version": "1.12.0",
  "minecraft:geometry": [
    {
      "description": {
        "identifier": "geometry.my_namespace.my_model",
        "texture_width": 16,
        "texture_height": 16,
        "visible_bounds_width": 3,
        "visible_bounds_height": 3,
        "visible_bounds_offset": [0, 0.5, 0]
      },
      "bones": [
        {
          "name": "root",
          "pivot": [0, 0, 0],
          "cubes": [
            {
              "origin": [-8, 0, -8],
              "size": [16, 16, 16],
              "uv": [0, 0],
              "uv_size": [16, 16]
            }
          ]
        }
      ]
    }
  ]
}
```

- `identifier` 必须以 `geometry.` 开头。
- `origin` 是中心原点制，范围 -8 到 8，不是 Java 的左下原点 0 到 16。
- `uv_size` 指定 UV 贴图尺寸。

## attachable 定义

```json
{
  "minecraft:attachable": {
    "description": {
      "identifier": "my_ns:my_chestplate",
      "item": {
        "my_ns:my_chestplate": "my_chestplate"
      }
    },
    "scripts": {
      "parent_setup": "variable.chest_layer_visible = 0.0;"
    },
    "geometry": {
      "default": "geometry.player_armor"
    },
    "textures": {
      "default": "textures/models/armor/my_armor_1"
    },
    "render_controllers": ["controller.render_armor"]
  }
}
```

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 物品图标为紫黑 | `icon` 键在 `item_texture.json` 中不存在 | 核对键名拼写与 `bedrock_options.icon` 是否一致 |
| 方块显示为拆解图 | 纹理键用了 `block_` 前缀 | 改用 `item_` 前缀 |
| 客户端不加载资源包 | `manifest.json` 两个 UUID 相同 | 重新生成独立的 header 与 module UUID |
| Geyser 启动警告路径过长 | 包内路径超过 80 字符 | 缩短目录名 |
| 几何体不显示 | `identifier` 未以 `geometry.` 开头 | 补齐前缀并核对映射中的引用 |
