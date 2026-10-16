---
title: Rainbow 采集与映射审查
description: 用 Rainbow 在 Java 客户端采集内容并审查输出的映射。涵盖采集客户端的准备、方块与物品与声音的采集命令、report.txt 审计、映射结构审查，以及基岩版包应包含的文件。
outline: [2, 3]
---

# Rainbow 采集与映射审查

这页完成从 Java 客户端采集到映射审查的全过程。采集命令不可跳过，审查报告不可只看有没有 error。

## 准备 Java 采集客户端

Rainbow 是客户端 Fabric mod。它不运行在 Paper、CE 或 Geyser 服务器上。准备一个隔离的 Java 测试 profile：

```text
Java 测试客户端
├── 与服务端兼容的 Minecraft 版本
├── Fabric Loader
├── Fabric API
├── 当前 Rainbow
├── 不会改变服务端数据的管理员测试账号
└── 已接受并实际加载 CE 最终 Java 资源包
```

开始映射前在 Java 客户端人工确认：

1. 资源包已成功下载并应用，没有缺失纹理。
2. CE 代表物品、数据包物品、外部模型与声音、方块都呈现为预期状态。
3. 需要采集的管理员菜单、展示箱、配方、战利品入口都可访问。
4. 当前客户端不是只加载了缓存中的旧包。建议在启动器资料夹中记录所加载包的 SHA-256。

::: danger Java 端有显示错误时不要先跑 Rainbow
Rainbow 会把错误输入稳定地转成错误输出，让后续排错更困难。
:::

## Rainbow 采集闭环

### 1. 初始化

每个发布批次使用新的 Rainbow 输出目录。`/rainbow create` 的目标目录可能被覆盖。

```text
/rainbow create miragedge-2026-07-31-r01
```

输出通常位于 Java 客户端的：

```text
.minecraft/rainbow/miragedge-2026-07-31-r01/
├── custom_mappings/
├── pack.zip
├── lang/
├── custom-skulls.yml
└── report.txt
```

在执行任何映射前，把以下三项写进外部发布记录：

1. release ID。
2. Java 包 SHA。
3. 客户端版本。不要把 Rainbow 的临时目录直接当部署目录。

### 2. 方块与声音

```text
/rainbow auto blocks
/rainbow auto sounds
```

`/rainbow auto blocks` 会遍历已加载包中的方块状态覆盖，可能短暂冻结客户端。它覆盖的是受支持的资源包模式，不等于 CE 的所有服务器端真实方块都已映射。自动扫描后逐个在世界中放置清单里的重点方块，漏项使用：

```text
/rainbow map block <目标坐标>
```

声音可按全包自动扫描，也可在需要隔离来源时指定命名空间：

```text
/rainbow map sound <namespace>
```

### 3. 物品、头颅与容器

先把代表物品放到测试背包：

```text
/rainbow mapinventory
```

再启动长时间采集：

```text
/rainbow auto inventory
```

此时依次打开以下来源，每打开一个就在清单里标记已扫：

1. CE 管理菜单。
2. 物品图鉴。
3. 收集箱。
4. 任务奖励预览。
5. 数据包商店。
6. 战利品测试容器。采集结束后：

```text
/rainbow auto stop
```

对 Rainbow 未自动识别的物品，手持后逐个执行。特别是覆盖原版 item model 定义的物品：

```text
/rainbow map item
```

::: danger 这一步不能省略
Rainbow 官方明确提示：`mapinventory`、`auto inventory` 和 `auto recipes` 都可能漏掉「覆盖原版 item model definition」的物品。
:::

### 4. 配方输出与隐藏物品

对由数据包配方、CE 配方或进度奖励产生的物品，先让测试账号获得可见配方。

然后执行：

```text
/recipe give @s *
/rainbow auto recipes
```

它只能采集已知配方的结果。不能被配方、菜单、收集箱或 `/ce item get` 获得的物品，必须由管理员用其实际生成路径拿到后手动 `map item`。

对数据包掉落物，优先使用测试战利品表、专用 function 或受控刷怪环境。不要在生产世界盲测。

### 5. 完成导出

```text
/rainbow finish
```

完成后立即复制整个 Rainbow 输出目录到发布工作区，而不是只复制 `pack.zip`。`report.txt` 和导出的 mappings 是质量证据。单独留下 ZIP 无法解释漏项。

## 审计 Rainbow 输出

### report.txt 是阻塞器

逐条处理或归档以下类型的信息：

- 未解析的模型、纹理、父模型、动画或材质。
- 不支持的 Java item model 定义、predicate、CEM、OptiFine、EMF 内容。
- 被跳过的方块、物品、声音、头颅或重复的 Bedrock identifier。
- 为 3D 模型降级出的 GUI 图标、attachable 或动画警告。
- 资源路径的大小写、父模型、覆盖层和多纹理问题。

::: warning 报告中没有 error 不等于覆盖完成
必须把 `custom_mappings`、`.mcpack` 和 `coverage.json` 交叉比较，确认每个计划条目都有可解释的状态。
:::

### 静态检查模板

以下 PowerShell 片段只检查发布物，不会修改 Geyser：

```powershell
$release = 'F:\FCelestial\Geyser-Velocity\bridge\releases\2026-07-31-r01'
$mappings = Join-Path $release 'custom_mappings'
$pack = Join-Path $release 'packs\miragedge-bridge-2026-07-31-r01.mcpack'

Get-ChildItem $mappings -Filter *.json | ForEach-Object {
  try {
    Get-Content $_.FullName -Raw -Encoding utf8 | ConvertFrom-Json | Out-Null
    "OK JSON  $($_.Name)"
  } catch {
    "BAD JSON $($_.Name): $($_.Exception.Message)"
  }
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($pack)
try {
  $names = $archive.Entries.FullName
  foreach ($required in 'manifest.json') {
    if ($names -notcontains $required) { "MISSING $required" } else { "OK $required" }
  }
  $hasItemMapping = Get-ChildItem $mappings -Filter *.json | Select-String -Pattern '"items"\s*:'
  if ($null -ne $hasItemMapping) {
    if ($names -notcontains 'textures/item_texture.json') { 'MISSING textures/item_texture.json (item mappings exist)' }
    else { 'OK textures/item_texture.json' }
  } else {
    'SKIP textures/item_texture.json (no item mappings in this release)'
  }
} finally {
  $archive.Dispose()
}

Get-FileHash $pack -Algorithm SHA256
```

这个检查不会证明基岩版能加载或渲染。它只阻止破损 JSON、空 ZIP 和缺少最小资源包骨架的发布物进入服务器。

## 审查映射

### v2 item_model 示例

以下是最小结构样例，不可直接复制到 MiragEdge。`minecraft:fishing_rod` 和 `miragedge_items:star_rod` 必须替换为从真实物品栈或 Rainbow 输出得到的值。

```json
{
  "format_version": 2,
  "items": {
    "minecraft:fishing_rod": [
      {
        "type": "definition",
        "model": "miragedge_items:star_rod",
        "bedrock_identifier": "miragedge:star_rod",
        "display_name": "星辉钓鱼竿",
        "bedrock_options": {
          "icon": "miragedge.star_rod",
          "display_handheld": true,
          "tags": ["miragedge:rod"]
        }
      }
    ]
  }
}
```

约束：

- `bedrock_identifier` 不能映射到两个不同的 Bedrock-facing 定义，也不能使用 `minecraft` 命名空间。
- 相同图标与组件的菜单占位符可以跨不同 Java 基础物品复用同一个 identifier，但必须在 release 中显式记录，不能靠加载顺序碰巧生效。
- `icon` 是 `textures/item_texture.json` 的 shorthand，不是 PNG 文件名。建议显式填写，避免 `:` 转 `.`、`/` 转 `_` 的默认转换歧义。
- 武器、工具、钓竿通常需要 `display_handheld: true`，普通 2D 消耗品不要继承这个选项。
- 基岩版物品行为由预注册的静态 components 决定。会随单个物品实例变化的 Java 组件不要写成唯一映射。

### legacy CMD 示例

实际物品仍靠 legacy CMD 匹配时，Geyser v2 文件仍使用 `format_version: 2`，定义类型为 `legacy`：

```json
{
  "format_version": 2,
  "items": {
    "minecraft:fishing_rod": [
      {
        "type": "legacy",
        "custom_model_data": 203,
        "bedrock_identifier": "miragedge:star_rod_legacy",
        "bedrock_options": {
          "icon": "miragedge.star_rod",
          "display_handheld": true
        }
      }
    ]
  }
}
```

当前 CE 同时下发现代模型与 CMD。这是兼容资产，不是要求同一物品重复注册两个无条件映射。

以 Rainbow 输出和实际目标 Geyser 版本的选择结果为准。避免两条定义竞争同一条目。

### 状态型物品

同一 Java 物品模型在多种状态下需要不同基岩版外观时，使用 `group` 与受支持的谓词。状态包括默认、损坏、抛竿、数量和维度。

```json
{
  "type": "group",
  "model": "miragedge_items:star_rod",
  "definitions": [
    {
      "bedrock_identifier": "miragedge:star_rod_cast",
      "predicate": {
        "type": "condition",
        "property": "fishing_rod_cast"
      },
      "bedrock_options": {
        "icon": "miragedge.star_rod_cast",
        "display_handheld": true
      }
    },
    {
      "bedrock_identifier": "miragedge:star_rod",
      "bedrock_options": {
        "icon": "miragedge.star_rod",
        "display_handheld": true
      }
    }
  ]
}
```

Geyser 会排序常见谓词，但复杂的多范围条件组合仍可能需要 `priority`。

不要用名称或 Lore 伪造谓词。它们不在 Geyser 官方支持的常规映射条件里。

## 基岩版包应包含什么

Rainbow 生成的 `pack.zip` 应被视为基岩版资源包，而不是 Java 资源包的镜像。典型内容包括：

```text
manifest.json
textures/item_texture.json
textures/items/
textures/blocks/
models/entity/
attachables/
entity/
animations/
animation_controllers/
sounds/
texts/
```

实际文件集合取决于被采集内容。

- 对 2D 物品，`item_texture.json` 中 `texture_data` 的 shorthand 必须与映射的 `bedrock_options.icon` 一致，PNG 路径通常不写扩展名。
- 对 3D 物品，Rainbow 可能输出 attachable、基岩版 geometry、动画与 GUI 图标。

不要为了看起来完整而手工塞入 Java 的 `assets/`、`pack.mcmeta`、OptiFine 文件和基岩版行为包文件。

`manifest.json` 的 header 与 module UUID、version 必须有效且可追踪。

重新生成后 UUID 是否改变由输出工具决定。若改变，应在 release manifest 中记录。

否则基岩版客户端会拿旧缓存误判为新包。

## 下一步

审查通过后，进入 [受控部署与回滚](./deploy)。
