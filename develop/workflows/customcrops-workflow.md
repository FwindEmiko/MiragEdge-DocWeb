---
title: "自定义作物工作流 · AI Skills"
description: "基于服务器实际 customcrops CraftEngine pack 的作物、阶段模型、收获物和资源包协同流程。"
icon: 🌾
outline: deep
---

# 自定义作物工作流 · AI Skills

> 本页只记录当前资源快照中能核对到的结构。CustomCrops 的作物逻辑和 CraftEngine 的物品/模型注册是两个层次；先看 [CE 开发工作流](/develop/workflows/ce-workflow)，再修改作物配置。

## 当前实际结构

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

实际配置使用 `customcrops:*` ID。例如 `chinese_cabbage.yml` 中同时注册种子、作物本体、星级变体和阶段物品；阶段物品通常使用 `model: customcrops:block/...`，不是抽象的 `stage.texture`。

## 数据流

```text
种子 item（CE texture）
  ↓ CustomCrops 识别作物
作物阶段（CE item + block_item behavior + block model）
  ↓ 生长/收获
收获物（CE item texture） + 作物插件的掉落/重置逻辑
```

CustomCrops 的生长条件、阶段切换和收获规则必须以当前插件配置为准；CE 只负责被引用的物品、模型和资源包，不要把两者的字段混成一个 YAML schema。

## 阶段配置的实际模式

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

不要默认添加 `register-only: true`。如果要使用某个 CE 版本的注册-only 能力，先在官方文档、当前版本日志和现有服务器配置中确认字段。

## 新增作物流程

1. 复制一个结构最接近的 `configuration/crops/<crop>.yml`，只改作物 ID、显示文本、阶段数量和资源路径。
2. 在同一文件中列出种子、作物、银星/金星变体、巨大作物和阶段物品的依赖关系。
3. 为每个阶段创建模型 JSON 和实际 PNG；模型中的纹理引用必须与 `assets/customcrops/textures` 对应。
4. 检查种子、肥料、收获物是否确实是 CE 物品 ID，不要写成不存在的原版 recipe ID。
5. 先执行 `/ce reload`，再按当前 CustomCrops 文档执行其重载方式；若命令不确定，查看插件帮助和日志，不要照搬旧页面命令。
6. 在创造测试世界中验证：种植、每阶段外观、成熟收获、掉落数量、重置阶段、破坏未成熟作物的掉落。

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

`texture: customcrops:item/...` 对应 `assets/customcrops/textures/item/...png`；作物阶段的 `model: customcrops:block/...` 对应 `assets/customcrops/models/block/...json`。资源引用规则详见 [CE 配置参考](/develop/workflows/ce-reference#资源定位规则)。

## 验收清单

- [ ] `pack.yml` 的 namespace 与所有 `customcrops:*` ID 一致。
- [ ] 每个阶段的 model JSON、纹理 PNG、引用路径和大小写都存在。
- [ ] 种子/收获物用 `texture`，阶段用 `model`，没有把两种写法互换。
- [ ] 未成熟作物不会错误掉落额外种子；成熟收获的数量和品质符合设计。
- [ ] CE 重载后无 YAML/model 错误，客户端重新获得资源包后才进行最终判断。
- [ ] 涉及自定义食物或工具时，跳转到 [CE 开发工作流的普通物品模式](/develop/workflows/ce-workflow#普通物品)。

## 参考

- [CE 开发工作流](/develop/workflows/ce-workflow)
- [CE 配置参考与实际目录](/develop/workflows/ce-reference)
- [CraftEngine 官方文档](https://ce-pre.gtemc.cn/)
- [CraftEngine 源码](https://github.com/Xiao-MoMi/craft-engine)
