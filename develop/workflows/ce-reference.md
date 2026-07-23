---
title: "CE 配置参考与实际目录"
description: "MiragEdge CraftEngine resources 的可检索目录、配置模式、资源路径和审查清单。"
icon: 📦
outline: deep
---

# CE 配置参考与实际目录

本页记录从 `F:\CraftEngine\resources` 拷贝中核对出的结构。它是服务器快照，不承诺与未来 CE 版本完全相同；新增配置前仍应先查看当前服务器文件和日志。

## Pack 清单

| Pack 目录 | `pack.yml` namespace | 主要用途 |
| --- | --- | --- |
| `miragedge_items` | `miragedge_items` | 物品、方块、模板、配方 |
| `miragedge_icon` | `miragedge_icon` | `images:` 字体图标 |
| `miragedge_menu` | `miragedge_menu` | 菜单物品模型和菜单图片 |
| `miragedge_rank` | `miragedge_rank` | 身份牌/等级图标 |
| `miragedge_other` | `miragedge_other` | 其他服务器资源 |
| `customcrops` | `customcrops` | 作物、阶段物品和模型 |

## 资源定位规则

| CE 引用 | 文件位置 |
| --- | --- |
| `minecraft:item/food/toast` | `resourcepack/assets/minecraft/textures/item/food/toast.png` |
| `minecraft:block/custom/topaz_ore` | `resourcepack/assets/minecraft/models/block/custom/topaz_ore.json` |
| `minecraft:font/image/money.png` | `resourcepack/assets/minecraft/textures/font/image/money.png` |
| `customcrops:block/customcrops/crop/cabbage/stage_1` | `customcrops/resourcepack/assets/customcrops/models/block/customcrops/crop/cabbage/stage_1.json` |

映射规律是 `assets/<namespace>/<类型>/<路径>`；具体类型由 `texture`、`model`、`file` 的语义决定。不要把模型引用当 PNG 路径，也不要手动添加 `.png` 到 CE ID。

## 真实配置片段

### 普通物品

```yaml
items:
  miragedge_items:bacon:
    material: cooked_porkchop
    data:
      item-name: "<!i><gradient:#FFD8A8:#FF8C69><b>培根</b></gradient>"
      max-damage: 1
    texture: minecraft:item/food/bacon
```

来源：`miragedge_items/configuration/food.yml`。

### 作物 pack 的阶段模型

```yaml
items:
  customcrops:chinese_cabbage_stage_1:
    material: sugar
    data:
      item-name: <!i><white>白菜阶段 1
    model: customcrops:block/customcrops/crop/chinese_cabbage/stage_1
    behavior:
      type: block_item
```

来源：`customcrops/configuration/crops/chinese_cabbage.yml`。作物阶段是 CE 物品 + block model 的组合，不应写成不存在的 `stage.texture` 或 `register-only: true`，除非当前版本官方文档和实际配置明确支持。

### 模板

```yaml
templates:
  miragedge_items:winter_armor:
    material: diamond_${part}
    data:
      item-name: "<!i><#A0D6FF>冬日保暖${part_display}"
    model:
      template: miragedge_items:winter_armor_1
      arguments:
        texture: minecraft:item/winter/winter_${part}
```

模板参数 `${part}`、`${slot}` 等由实例的 `arguments:` 提供。修改模板时必须检查所有引用它的物品。

## AI 审查表

- [ ] 目标 pack 和 `pack.yml` namespace 已确认。
- [ ] 注册表类型正确：`items` / `blocks` / `images` / `templates` / `equipments`。
- [ ] ID 使用完整 `namespace:id`，没有把资源路径误当注册 ID。
- [ ] `texture`、`model`、`file` 的资源类型和实际文件完全匹配。
- [ ] 资源路径大小写、扩展名和 `assets/<namespace>` 层级正确。
- [ ] 字体 `chars` 已查重，且调用方使用了同一个 `font`。
- [ ] 版本条件（尤其装备 component/trim）没有被删除。
- [ ] 修改后执行 `/ce reload`，并在客户端重新获取资源包后验收。
- [ ] 变更涉及原版数据包时，额外验证 `/reload` 和数据包日志。

## 外部参考

- [CE 官方文档](https://ce-pre.gtemc.cn/)
- [CraftEngine GitHub](https://github.com/Xiao-MoMi/craft-engine)
- [CraftEngine DeepWiki](https://deepwiki.com/Xiao-MoMi/craft-engine)
- [Minecraft Wiki：Resource pack](https://minecraft.wiki/w/Resource_pack)
