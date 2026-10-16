---
title: 自定义作物工作流
description: 自定义作物与 CraftEngine 的资源对接流程。涵盖 customcrops pack 的目录结构、种子到收获物的数据流、阶段模型配置模式、新增作物的步骤与验收清单。
outline: [2, 3]
---

# 自定义作物工作流

这页说明作物逻辑如何对接 CraftEngine 的物品与模型注册。

CustomCrops 负责生长、阶段切换和收获规则。CraftEngine 负责被引用的物品、模型和资源包。先读 [CE 开发工作流](/developer/workflows/craftengine/)，再改作物配置。

## 实际结构

```text
plugins/CraftEngine/resources/customcrops/
├── pack.yml
├── configuration/
│   ├── crops/*.yml
│   ├── fertilizers.yml
│   ├── sprinklers.yml
│   └── i18n/*.yml
└── resourcepack/assets/customcrops/
    ├── models/block/customcrops/crop/<crop>/stage_*.json
    ├── models/item/customcrops/...
    └── textures/block/customcrops/crop/<crop>/...
```

配置使用 `customcrops:*` ID。`chinese_cabbage.yml` 中同时注册种子、作物本体、星级变体和阶段物品。阶段物品通常使用 `model: customcrops:block/...`，不是抽象的 `stage.texture`。

## 数据流

```text
种子 item（CE texture）
  ↓ CustomCrops 识别作物
作物阶段（CE item + block_item behavior + block model）
  ↓ 生长与收获
收获物（CE item texture） + 作物插件的掉落与重置逻辑
```

CustomCrops 的生长条件、阶段切换和收获规则以当前插件配置为准。CE 只负责被引用的物品、模型和资源包。两套字段不要混成一个 YAML schema。

## 阶段配置模式

```yaml
items:
  customcrops:chinese_cabbage_stage_1:
    material: sugar
    data:
      item-name: <!i><white>白菜阶段 1
    model: customcrops:block/customcrops/crop/chinese_cabbage/stage_1
    behavior:
      type: block_item
      settings:
        state:
          auto-state: tripwire
          model: customcrops:block/customcrops/crop/chinese_cabbage/stage_1
```

对应模型和纹理必须真实存在：

```text
resourcepack/assets/customcrops/models/block/customcrops/crop/chinese_cabbage/stage_1.json
resourcepack/assets/customcrops/textures/block/customcrops/crop/chinese_cabbage/...
```

不要默认添加 `register-only: true`。要使用某个 CE 版本的注册-only 能力时，先在官方文档、当前版本日志和现有配置中确认该字段存在。

## 新增作物流程

1. 复制结构最接近的 `configuration/crops/<crop>.yml`，只改作物 ID、显示文本、阶段数量和资源路径。
2. 在同一文件中列出种子、作物、银星与金星变体、巨大作物和阶段物品的依赖关系。
3. 为每个阶段创建模型 JSON 和实际 PNG，模型中的纹理引用必须与 `assets/customcrops/textures` 对应。
4. 检查种子、肥料、收获物是否为真实的 CE 物品 ID，不要写成不存在的原版 recipe ID。
5. 先执行 `/ce reload`，再按当前 CustomCrops 文档执行其重载方式。命令不确定时查插件帮助和日志。
6. 在创造测试世界中验证种植、每阶段外观、成熟收获、掉落数量、阶段重置和未成熟作物的掉落。

## 与 CE 物品的对接

```yaml
items:
  customcrops:tomato_seeds:
    material: wheat_seeds
    texture: customcrops:item/customcrops/crop/tomato/tomato_seeds

  customcrops:tomato:
    material: apple
    texture: customcrops:item/customcrops/crop/tomato/tomato
```

`texture: customcrops:item/...` 对应 `assets/customcrops/textures/item/...png`。作物阶段的 `model: customcrops:block/...` 对应 `assets/customcrops/models/block/...json`。资源引用规则详见 [CE 配置参考的资源定位规则](/developer/workflows/craftengine/reference#资源定位规则)。

## 验收清单

- `pack.yml` 的 namespace 与所有 `customcrops:*` ID 一致。
- 每个阶段的模型 JSON、纹理 PNG、引用路径和大小写都存在。
- 种子与收获物用 `texture`，阶段用 `model`，两种写法没有互换。
- 未成熟作物不会错误掉落额外种子。
- 成熟收获的数量和品质符合设计。
- CE 重载后无 YAML 与 model 错误。
- 客户端重新获得资源包后再做最终判断。
- 涉及自定义食物或工具时，参考 [CE 开发工作流的普通物品模式](/developer/workflows/craftengine/#普通物品)。

## 参考

- [CE 开发工作流](/developer/workflows/craftengine/)
- [CE 配置参考与目录](/developer/workflows/craftengine/reference)
- [CraftEngine 官方文档](https://ce-pre.gtemc.cn/)
- [CraftEngine 源码](https://github.com/Xiao-MoMi/craft-engine)
