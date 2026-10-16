---
title: Geyser 基岩版内容转化
description: Java 版自定义内容到基岩版的转换入口。说明 Geyser 不自动转换 Java 资源包的原因、三类输入来源、当前服务器组件版本，以及各类内容应进入哪个页面。
outline: [2, 3]
---

# Geyser 基岩版内容转化

Geyser 只桥接连接，不转换资源。所有自定义内容必须手工创建映射文件和基岩版资源包。

## 为什么需要单独转换

Geyser 是桥接代理，让基岩版玩家连上 Java 版服务器。它不会自动转化 Java 资源包，Java ZIP 不能直接放进 `packs/` 目录。每个自定义物品、方块和实体都需要显式的映射文件或扩展。

## 当前环境

| 组件 | 版本 | 位置 |
| --- | --- | --- |
| Geyser | 2.11.x（b1209） | Velocity 代理端 `/mnt/miragedge/vc/plugins/Geyser-Velocity/` |
| CraftEngine | 后端子服 | `/mnt/miragedge/MainServer/plugins/CraftEngine/` |
| Velocity | 4.1.0-SNAPSHOT | 代理端 |
| 服务端核心 | Leaf 26.2（Paper 分支） | 后端 |

::: warning 架构决定了方块必须走扩展
Geyser 在代理端，CraftEngine 在后端子服。CE 方块是运行时动态注册的，Geyser 启动时看不到它们。因此非原版方块不能用 JSON 映射，必须用 Extension API。
:::

## 三类输入

| 来源 | 内容 | 处理页面 |
| --- | --- | --- |
| CraftEngine | CE 自建物品与服务器端方块 | [CraftEngine 与合并资源包](./craftengine/) |
| 数据包伴随资源包 | Stellarity、Incendium、True-Ending 等数据包携带的物品、方块和模型 | [Stellarity 转换批次](./stellarity) |
| 外部合并包 | CustomNameplates、BetterModel、Sparkles 等独立 ZIP | [CraftEngine 与合并资源包](./craftengine/) |

## 内容类型与路线

| 内容类型 | 页面 |
| --- | --- |
| 基岩版资源包结构，含 manifest、纹理图集、几何体、attachable | [基岩版资源包结构](./bedrock-pack) |
| 自定义物品映射（V2 格式），含谓词、组件、硬限制 | [自定义物品映射](./item-mapping) |
| 自定义方块映射，含 JSON 覆盖与方块组件 | [自定义方块映射](./block-mapping) |
| 非原版方块的 Extension 开发，含 Gradle 工程与部署 | [Geyser 扩展开发](./extension-dev) |
| 从最终 Java 包到基岩版发布物的完整转换链路 | [转换与发布](./conversion/) |
| 复杂生物、Display Entity、家具的实体路线 | [复杂数据包实体与展示](./entities) |
| 四层验收模型、覆盖记录与故障定位 | [验收与排错](./validation) |
| Custom Item、Block、Skull、Entity 的字段边界速查 | [协议与产物参考](./reference) |
| Stellarity 5.5.3 末地批次的实际操作单 | [Stellarity 5.5.3 末地转换批次](./stellarity) |

## 发布校验

部署前逐项检查：

- `format_version` 正确，物品为 2，方块为 1。
- 所有 `bedrock_identifier` 唯一，且不使用 `minecraft:` 命名空间。
- 弓、弩、三叉戟、钓竿、鞘翅、盾的映射已删除。
- 武器与工具有 `display_handheld: true`。
- 盔甲有 `components.minecraft:equippable` 并指定 slot。
- 所有 `bedrock_options.icon` 与 `item_texture.json` 的键匹配。
- base item 从战利品表验证，不是猜测。
- 资源包有 `manifest.json`，其中两个 UUID 不同。
- 纹理路径不超过 80 字符。
- `terrain_texture.json` 与 `item_texture.json` 覆盖全部纹理键。
- 几何体文件的 `identifier` 以 `geometry.` 开头。
- Extension 的 `JavaBlockState` 中 `collision` 与 `pistonBehavior` 非 null。
- Extension 的 `javaId` 不小于 32367。
- 部署前已备份。
- Geyser 重启后日志无 ERROR。

## 部署位置

```text
Geyser-Velocity/
├── custom_mappings/        # 映射 JSON 文件
│   ├── miragedge-managed.json
│   └── incendium_mappings.json
├── packs/                  # 基岩版资源包
│   ├── stellarity-pack.mcpack
│   └── incendium-pack.mcpack
├── extensions/             # Geyser 扩展 JAR
│   └── CustomCrops-Geyser-1.0.0.jar
└── config.yml
```

部署步骤：

1. 备份现有映射，命名为 `miragedge-managed.json.bak-<日期>`。
2. 上传映射到 `custom_mappings/`。
3. 上传资源包到 `packs/`。
4. 上传扩展到 `extensions/`。
5. 确认 `config.yml` 中 `enable-custom-content: true`。
6. 重启 Geyser。
7. 查看启动日志。

启动成功的日志形如：

```text
[geyser]: Registered 496 custom items
[geyser]: Registered 103 non-vanilla block overrides.
[geyser]: Registered 199 custom block overrides.
[geyser]: Registered 1574 custom blocks.
```

常见错误：

| 日志 | 原因 |
| --- | --- |
| `key is required but was not present` | 缺少 `bedrock_identifier` |
| `Unknown Java block` | JSON 映射引用了不存在的方块 ID |
| `namespace cannot be minecraft` | `bedrock_identifier` 用了 `minecraft:` 前缀 |

## 参考来源

- [Geyser Custom Items (v2)](https://geysermc.org/wiki/geyser/custom-items)
- [Geyser Custom Items (v1)](https://geysermc.org/wiki/geyser/custom-items-old)
- [Geyser Custom Blocks](https://geysermc.org/wiki/geyser/custom-blocks)
- [Geyser Using Resource Packs](https://geysermc.org/wiki/geyser/packs)
- [Geyser Custom Entities](https://geysermc.org/wiki/geyser/custom-entities)
- [Rainbow](https://geysermc.org/wiki/other/rainbow/)
- [Geyser 主仓库](https://github.com/GeyserMC/Geyser)
- [CustomItemRegistryPopulator.java](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/registry/populator/CustomItemRegistryPopulator.java)
- [CustomBlockRegistryPopulator.java](https://github.com/GeyserMC/Geyser/blob/master/core/src/main/java/org/geysermc/geyser/registry/populator/CustomBlockRegistryPopulator.java)
- [Rainbow 源码](https://github.com/GeyserMC/Rainbow)
- [Minecraft Wiki: Resource Pack](https://minecraft.wiki/w/Resource_pack)
- [Mojang bedrock-schemas](https://github.com/Mojang/bedrock-schemas)
- [manifest.json 模板](https://convertmcpack.net/pages/manifest_template.html)
- [GeyserExtensionists/GeyserDisplayEntity](https://github.com/GeyserExtensionists/GeyserDisplayEntity)
- [Kas-tle/java2bedrock.sh](https://github.com/Kas-tle/java2bedrock.sh)
- [markeev/java2bedrock-furniture](https://github.com/markeev/java2bedrock-furniture)

本机资源：

- 映射文件：`F:\FCelestial\Geyser-Velocity\custom_mappings\managed\miragedge-managed.json`
- 转换器：`F:\FCelestial\Geyser-Velocity\bridge\java2bedrock_converter.py`
- CustomCrops 扩展：`F:\FCelestial\CustomCrops-Geyser\`
- CE 资源包：`F:\FCelestial\CraftEngine\generated\resource_pack_unprotected.zip`
