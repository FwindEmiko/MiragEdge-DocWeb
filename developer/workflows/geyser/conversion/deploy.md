---
title: 受控部署与回滚
description: 把 Geyser 发布物安全投放到服务器并支持回滚。涵盖 custom content 开关、投放目录、custom-skulls 的幂等合并、原子发布六步原则、远程资源包的响应头要求与回滚步骤。
outline: [2, 3]
---

# 受控部署与回滚

这页把审查通过的发布物投放到 Geyser，并保证任何一层失败都能回滚。

## 前置配置

确认 Geyser 配置中自定义内容已启用：

```yaml
gameplay:
  enable-custom-content: true
```

该开关关闭时，自定义 item、block 和 skull mapping 都会被禁用。修改它需要重启 Geyser。

::: danger 不要把「热重载没有报错」当成已注册
开关是启动期读取的。只看热重载结果会误判。
:::

## 投放位置

Geyser 的目录随平台变化，但逻辑固定：

```text
<Geyser data folder>/
├── custom_mappings/       # 本项目拥有的 JSON 映射文件
├── packs/                 # 基岩版 ZIP 或 MCPACK
├── locales/overrides/     # Rainbow 导出的语言覆盖
├── custom-skulls.yml      # 结构化合并后的活动文件，不整体覆盖
└── extensions/            # 仅复杂实体或 Display 路线需要
```

Paper 与 Spigot 平台通常在 `plugins/Geyser-<platform>/` 下。

Standalone 平台则位于 Geyser 根目录。以实际服务器安装路径为准，不要在开发机的同名目录部署。

推荐使用固定且可归属的文件名：

```text
custom_mappings/managed/miragedge-managed.json
packs/miragedge-bridge-<release-id>.mcpack
locales/overrides/zh_cn.json
```

不要让 Rainbow 输出覆盖不带项目归属的 `mappings.json`。

否则很难判断一个旧映射来自本项目、其他插件还是人工修补。

## custom-skulls 的幂等合并

Rainbow 若输出 `custom-skulls.yml`，先原样放入 release 的 `rainbow/input/`。不要改名后直接投放。

发布脚本必须用 YAML 解析器读取两个输入。一个是当前活动文件，另一个是 Rainbow 原始输入。逐 section 处理以下四个字段：

`player-usernames`、`player-uuids`、`player-profiles`、`skin-hashes`。

1. 缺失的 section 按 Geyser 当前 schema 初始化，保留原有值的类型与结构。
2. 每个 section 都是字符串 list。按完整字符串去重，相同值跳过，保证重复执行不增长文件。
3. 新条目追加到内存结构。不要把 list 当成可按 key 更新的 map，也不要静默删除现有头颅。
4. 输出本次新增的 `custom-skulls.patch.yml`，再输出全量 `merged/custom-skulls.yml`。只有后者可以原子替换 Geyser 活动文件。
5. 对合并结果重新解析 YAML，统计四个 section 的条目数并记录 SHA。只有这个最终文件进入部署清单。

::: warning 这是 patch 到活动文件的转换，不是字符串拼接
不要用正则替换 YAML，也不要把 `custom-skulls.patch.yml` 当成 Geyser 会自动读取的文件。
:::

## 原子发布原则

1. 先把 release 目录完整生成并通过静态检查。
2. 记录 Geyser 当前拥有的本项目文件 SHA 与名称。
3. 只替换本项目命名空间拥有的映射、资源包和语言文件，不动其他插件或服务器已存在的文件。
4. 对历史文件先归档到 release archive，再在确认活动清单后移除精确文件名。绝不清空整个 `packs/` 或 `custom_mappings/`。
5. 重启 Geyser 或服务器，采集启动日志。
6. 使用干净或已清资源包缓存的基岩版客户端重新连接进行验收。

## 远程资源包限制

不使用本地 `packs/`、改用 Geyser API 发送远程资源包时，基岩版客户端要求：

- 最终链接可直接下载。
- `Content-Length` 精确。
- `Content-Type: application/zip`。

重定向可以存在，但最终响应仍必须满足这些条件。部署前验证响应头：

```shell
curl -I -L https://example.invalid/miragedge-bedrock-r01.zip
```

以下四类响应会让基岩版下载失败：

1. 网页预览链接。
2. 鉴权 HTML。
3. 未知长度的流式下载。
4. 错误的 Content-Type。

## 回滚

回滚不是重新跑 Rainbow。保留上一个已通过实机测试的 release，按以下步骤操作：

1. 记录故障 release ID、Geyser build、基岩版客户端版本和首条错误日志。
2. 精确恢复前一 release 拥有的 mappings、资源包、locale 与头颅合并结果。
3. 重启 Geyser 并让基岩版客户端重新连接。
4. 验证前一 release 的 SHA 与上线记录一致。
5. 故障 release 保留在 archive，连同 `report.txt` 与差异。不要删除证据后再试图复现。

ZIP、JSON 和启动日志都只是逐层通过，不是玩家视角的最终结论。实际渲染是否正确仍要按[验收与排错](../validation)完成。
