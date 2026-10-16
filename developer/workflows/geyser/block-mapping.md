---
title: 自定义方块映射
description: Geyser 自定义方块映射的 JSON 格式与限制。涵盖方块状态覆盖、geometry 与 material_instances 写法、方块组件清单，以及非原版方块必须改用扩展的原因。
outline: [2, 3]
---

# 自定义方块映射

这页给出方块映射的字段、适用范围和必须改用 Extension API 的场景。

## JSON 映射

映射文件用 `format_version: 1`，顶层 `blocks` 的键是实际 Java 方块状态。

```json
{
  "format_version": 1,
  "blocks": {
    "minecraft:granite_wall": {
      "name": "my_block",
      "display_name": "自定义花岗岩墙",
      "geometry": "geometry.blocks.my_block_geo",
      "material_instances": {
        "*": {
          "texture": "some_texture",
          "render_method": "alpha_test",
          "face_dimming": true,
          "ambient_occlusion": true
        }
      },
      "tags": ["stone", "wall"],
      "state_overrides": {
        "east=none,north=none,south=none,up=true,waterlogged=true,west=none": {
          "geometry": "geometry.blocks.my_other_block_geo",
          "destructible_by_mining": 10
        }
      }
    }
  }
}
```

## 方块组件

| 组件 | 说明 |
| --- | --- |
| `geometry` | 几何体标识符或对象 |
| `material_instances` | 材质实例，含纹理与渲染方法 |
| `collision_box` | 碰撞箱 |
| `selection_box` | 选择箱 |
| `light_emission` | 发光等级 0-15 |
| `light_dampening` | 遮光等级 0-15 |
| `friction` | 摩擦力 0.0-1.0 |
| `tags` | 方块标签 |
| `transformation` | 缩放、平移、旋转 |
| `placement_filter` | 放置规则 |
| `unit_cube` | 是否为标准立方体 |
| `state_overrides` | 按方块状态覆盖属性 |

## 适用范围

::: danger JSON 映射只能覆盖已知的原版方块状态
对 CraftEngine 等插件运行时动态注册的非原版方块，例如 `craftengine:custom_44`，JSON 映射会报错：

```text
InvalidCustomMappingsFileException: Unknown Java block: craftengine:custom_44
```

这类方块必须使用 Extension API 注册。见 [Geyser 扩展开发](./extension-dev)。
:::

原因是 CE 方块在后端子服运行时动态注册。Geyser 在代理端启动时还看不到它们。

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 日志报 `Unknown Java block` | 映射引用了 CE 动态注册的方块 | 改用 Extension API |
| 方块纹理为紫黑 | `material_instances.*.texture` 与 `terrain_texture.json` 键不匹配 | 核对纹理键前缀与拼写 |
| 碰撞体异常 | 缺少 `collision_box` 或用整方块盒代替实际碰撞 | 按实际模型配置碰撞盒 |
| 状态切换后外观不变 | `state_overrides` 的键不是实际 Java 方块状态 | 从真实放置的方块读取状态字符串 |
