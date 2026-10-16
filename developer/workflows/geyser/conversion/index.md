---
title: 转换与发布
description: Geyser 转换主路径的入口与版本冻结。说明转换结果的版本依赖、release.json 字段、Java 输入包的选择依据，以及进入采集前的只读核对步骤。
outline: [2, 3]
---

# 转换与发布

这页是「从最终 Java 视觉输入到 Geyser 发布物」主路径的入口。它不处理 CE YAML 的设计细节，也不承诺复杂实体可自动转换。

相关内容见 [CraftEngine 与合并资源包](../craftengine/)与[复杂数据包实体与展示](../entities)。

<SmartImage src="/images/developer/workflows/geyser/conversion-flow.svg" caption="图 1：Geyser 转换链路——冻结版本 → 选输入包 → Java 客户端采集 → 审查映射 → 受控部署" width="880" />

## 四个阶段

| 阶段 | 页面 | 内容 |
| --- | --- | --- |
| 1. 冻结与输入 | [输入锁定](./input-lock) | 版本冻结、release.json、选择唯一 Java 输入包、输入包结构审计 |
| 2. 采集与审查 | [Rainbow 采集与映射审查](./rainbow) | 内容清单、Java 采集客户端、Rainbow 闭环、映射审查、Bedrock 包内容 |
| 3. 打包与部署 | [受控部署与回滚](./deploy) | 前置配置、投放位置、custom-skulls 幂等合并、原子发布、回滚 |

## 为什么必须先冻结版本

转换结果与以下七项强绑定：

1. Java 服务端。
2. Geyser build。
3. 基岩版协议。
4. Java 测试客户端。
5. Fabric 与 Fabric API。
6. Rainbow build。
7. CE 生成的 Java 包。

任何一项改变，都应视为新的转换候选版本。

在 `release.json` 中补齐版本字段。Bridge 的 `reports/audit.json` 会自动记录四项：Java ZIP、CE merge 输入、SHA 和目录差异。

采集前至少确认下列字段：

```yaml
schema: 1
release: 2026-07-31-r01
generated_at: "2026-07-31T00:00:00+08:00"
java_server: "填写实际服务端与构建号"
java_test_client: "填写实际客户端版本"
bedrock_target: "填写测试客户端版本"
geyser: "填写 Geyser build"
rainbow: "填写 Rainbow build"
craftengine:
  config: "F:/FCelestial/CraftEngine/config.yml"
  source_pack: "F:/FCelestial/CraftEngine/generated/resource_pack_unprotected.zip"
  source_sha256: "生成后填写"
  protected_pack_sha256: "生成后填写"
inputs:
  - kind: ce-final-merge
    path: "F:/FCelestial/CraftEngine/generated/resource_pack_unprotected.zip"
    required: true
```

::: warning 不要从旧教程复制版本约束
Rainbow 的 README 与官网指南在版本文字上可能短暂不同步。不要复制「必须使用某个固定 Minecraft 版本」。

应以以下四个来源共同确认。

它们分别是当前 Rainbow 发布页、mod 元数据、游戏启动日志和服务器目标版本。
:::

## 唯一 Java 视觉输入

CE 当前配置会输出三个包：

```text
F:\FCelestial\CraftEngine\generated\resource_pack.zip
F:\FCelestial\CraftEngine\generated\resource_pack_map.zip       # map-plugin 与 BlueMap 专用，排除
F:\FCelestial\CraftEngine\generated\resource_pack_unprotected.zip
```

转换时优先选择同一 CE 生成批次的 `resource_pack_unprotected.zip`，理由如下：

- 它已经包含 CE 配置资源与 `merge-external-folders`、`merge-external-zip-files` 的最终覆盖结果。
- 它使用标准 Java ZIP，适合基岩版资源包转换器解析。
- 主 `resource_pack.zip` 启用了保护和混淆，可能增加转换器解析失败或报告失真的概率。
- 不能把「从某个外部 ZIP 提取到的模型」与「最终合并包里的模型」混为同一个输入。

需要开启保护和未保护副本双输出的配置见 [CraftEngine 与合并资源包](../craftengine/)。

## 参考来源

- [Rainbow 文档](https://geysermc.org/wiki/other/rainbow/)
- [Geyser Using Resource Packs](https://geysermc.org/wiki/geyser/packs)
- [验收与排错](../validation)
- [协议与产物参考](../reference)
