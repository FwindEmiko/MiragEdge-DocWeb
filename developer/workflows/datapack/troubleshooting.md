---
title: 数据包工作流 · 排错与适配
description: 数据包加载失败的排查与第三方包适配。涵盖 pack_format 对照表、/reload 的生效边界、加载顺序与标签合并、第三方包的元数据与语法适配清单、UTF-8 BOM 检测。
outline: [2, 3]
---

# 数据包工作流 · 排错与适配

这页处理两类问题。

1. 数据包加载失败与热重载不生效。
2. 把第三方数据包适配到 Leaf 26.1.2。

## pack_format 对照表

| MC 版本 | 数据包 pack_format | 资源包格式 | 备注 |
| --- | --- | --- | --- |
| 1.21 | 48 | 34 | Bundles of Bravery |
| 1.21.1 | 48 | 34 | — |
| 1.21.2 - 1.21.3 | 57 | 42 | 试炼刷怪笼更新 |
| 1.21.4 | 61 | 46 | 冬季小更新 |
| 1.21.5 | 71 | 55 | Spring to Life |
| 1.21.6 | 80 | 63 | 对话框系统 |
| 1.21.7 - 1.21.8 | 81 | 64 | — |
| 1.21.9 - 1.21.10 | 88.0 | 69 | 引入 min_format 与 max_format |
| 1.21.11 | 94.1 | 75 | 物品组件扩展 |
| 26.1 - 26.1.2 | 101.1 | 84 | Tiny Takeover，本服版本 |
| 26.2 | 107.1 | — | 截至 2026.07 |

::: tip pack_format 的小数点
自 MC 26.1 开发周期起，Mojang 引入 `X.Y` 小数格式，如 `101.1`、`94.1`、`107.1`。

- 整数部分是主版本号，破坏性变更时递增。26.1 从 1.21.11 的 94 跳到 101。
- 小数部分是次版本号，同一主版本内非破坏性微调时递增。26.1-pre-2 的 `101.0` 到 26.1-pre-3 的 `101.1`。

`pack.mcmeta` 中两种格式都可以：

```json
{
  "pack": {
    "pack_format": 101,
    "min_format": 82,
    "max_format": 107,
    "description": "MiragEdge Data Pack"
  }
}
```

```json
{
  "pack": {
    "pack_format": [101, 1],
    "min_format": [82, 0],
    "max_format": [107, 0],
    "description": "MiragEdge Data Pack"
  }
}
```

::: warning 三个字段的格式必须一致
`pack_format`、`min_format`、`max_format` 必须同时用整数或同时用数组。混用会导致 Leaf 26.1.2 报错。详见[参考规则的 Leaf pack.mcmeta 严格校验规则](./reference#leaf-26-1-2-pack-mcmeta-严格校验规则)。
:::
:::

升级版本时同步修改 `pack.mcmeta` 中的 `pack_format` 与 `min_format`。

## /reload 的生效边界

`/reload` 可以热重载的内容：

- 函数（`.mcfunction`）
- 战利品表
- 原版 JSON 配方
- 进度
- 谓词
- 物品修饰器
- 标签
- 结构模板

`/reload` 不能热重载的内容，必须重新进入世界或重启服务器：

- 世界生成配置，包括 biome、dimension、structure_set、noise_settings
- 附魔定义
- 盔甲纹饰的材料与图案
- 唱片机曲目
- 伤害类型
- 维度

修改 `data/<namespace>/worldgen/` 下的内容后，必须退出并重新进入世界，或重启服务器。

## 加载顺序与标签合并

加载顺序：

- `/datapack list` 显示当前加载顺序，也可在创建世界界面调整。
- 先加载的包优先级低，后加载的优先级高。
- 高优先级包的同名文件会完全覆盖低优先级的同名文件。

标签合并：

- 标签文件默认合并。多个数据包定义同名标签时，内容会合并。
- 需要完全覆盖而非合并时，在标签 JSON 中设置 `"replace": true`。

```json
{
  "replace": true,
  "values": [
    "miragedge:ruby_sword",
    "miragedge:flame_sword"
  ]
}
```

## CE 配方重载注意事项

- CE 配方重载命令是 `/ce reload recipe`。
- Folia 服务端只支持 `/ce reload recipe`，不支持 `/ce reload all`。
- Folia 上配方管理器非线程安全，运行时重载可能导致崩溃。Paper 与 Leaf 上通常安全。
- CE 配方重载后必须再执行一次 `/reload`，防止数据包中的原版配方引用失效。

## 其他常见坑

1. JSON 语法错误导致静默失败。文件不会加载，但游戏不崩溃。始终用 Misode 或 Spyglass 验证 JSON 格式。
2. 命名空间冲突。不同数据包中的同名文件会被高优先级包覆盖，注意命名空间隔离。
3. CE 物品在结构 `.nbt` 中。保存 `.nbt` 时确保 CE 已重载且方块状态正确。跨环境迁移时需 CE 配置完全一致。
4. 资源包未更新。修改 CE 物品配置或贴图后，客户端可能需要重新加入服务器才能看到变化。
5. 原版 recipe 引用 CE 物品 ID 不可行。原版 `minecraft:item` 入口只识别 `minecraft:` 命名空间。
6. Stonecutter 配方用 CE 物品做原料。CE 官方不建议，可能导致客户端视觉问题。

## 下载与适配第三方数据包

从 Modrinth、CurseForge、PlanetMinecraft 等平台下载的数据包，通常只针对某个 MC 版本编写。

部署到 Leaf 26.1.2 前必须做兼容性适配。

### 适配工作流

```text
1. 下载原始 zip
       ↓
2. 备份原始 zip 到 _original/ 子目录
       ↓
3. 解压到工作目录
       ↓
4. 检查并修复 pack.mcmeta
       ↓
5. 检查 mcfunction 语法，特别是组件测试
       ↓
6. 重新打包 zip，UTF-8 无 BOM
       ↓
7. 复制到 download-fixed/ 并部署到 world/datapacks/
       ↓
8. 重启服务器，检查 latest.log 无 ERROR 与 WARN
```

### pack.mcmeta 适配清单

| 检查项 | 旧包常见问题 | 适配方法 |
| --- | --- | --- |
| UTF-8 BOM | Windows 编辑器保存的 JSON 带 BOM | 用 `utf-8` 编码重写，不用 `utf-8-sig` |
| `pack_format` | 旧版本号，如 48、71、81 | 改为 `101` |
| `min_format` / `max_format` | 旧包通常没有 | 新增 `min_format: 82`、`max_format: 107` |
| `supported_formats` | 旧包可能包含 | 移除，Leaf 26.1.2 已弃用 |
| `min_format` 值 | 常被误设为 81 | 必须不小于 82，否则触发 legacy 死循环 |
| 字段格式一致性 | min 与 max 混用整数和数组 | 三个字段统一用整数或统一用数组 |

### mcfunction 语法检查清单

| 问题 | 现象 | 解决方案 |
| --- | --- | --- |
| 旧版 `/give` NBT 语法 | `give @s diamond{display:{Name:...}}` | 转换为 1.20.5 以上的组件格式 |
| 旧版附魔检测 | `execute if data entity @s Items[0].tag.Enchantments...` | 改用 `execute if items ... *[minecraft:enchantments~[...]]` |
| 旧版选择器参数 | `@e[type=minecraft:pig,nbt={...}]` | 改用 `execute if data` 或谓词 |
| 组件测试语法错误 | `*[minecraft:enchantments~{levels:...}]` 写成对象 | 改为列表 `*[minecraft:enchantments~[{...}]]` |

::: warning 不要凭直觉改写 mcfunction 语法
原作者的语法看起来奇怪但能正常加载时，不要改。例如 `*[minecraft:enchantments~[{silk_touch:1}]]` 看似缺 `minecraft:` 前缀，实际是合法简写。

修改前先在测试世界验证，或查阅 [Minecraft Wiki - Item predicate](https://minecraft.wiki/w/Item_predicate) 确认语法。错误修改会导致 `Malformed predicate` 错误。
:::

### loot table 适配

| 问题 | 现象 | 解决方案 |
| --- | --- | --- |
| `alternatives` 的子条目全部带 weight 且无 condition | 出现 `Unreachable entry!` 警告 | 改为 `minecraft:group` |
| 入口放在 `functions` 数组而不是 `pools` | `set_loot_table` 解析失败 | 把入口移回 `pools` 数组 |
| 旧版 `entry` 字段名 | 1.20 以上已改名为 `entries` | 批量替换 |

### 部署验证清单

部署后检查 `latest.log`：

- 无 `Error reading pack metadata, attempting fallback type` 警告。
- 无 `Failed to load function` 错误。
- 无 `Couldn't load tag` 错误。
- 无 `Unreachable entry!` 警告。
- 数据包出现在 `/datapack list` 输出中。
- 服务器正常启动，无 ERROR。

## 常见问题扩展

### UTF-8 BOM 检测

Windows 编辑器保存的 JSON 可能带 UTF-8 BOM，即 `EF BB BF`。Leaf 服务端会拒绝加载。用 `od` 检测：

```bash
# 检查 pack.mcmeta 是否带 BOM
unzip -p pack.zip pack.mcmeta | od -A x -t x1z -v | head -1
```

首字节为 `7b` 表示无 BOM，首三字节为 `ef bb bf` 表示带 BOM。

修复时用 Python 重新保存为无 BOM 的 UTF-8：

```python
with open("pack.mcmeta", "r", encoding="utf-8-sig") as f:
    content = f.read()
with open("pack.mcmeta", "w", encoding="utf-8", newline="\n") as f:
    f.write(content)
```

### CRLF 换行符

第三方数据包可能使用 Windows 换行符 `\r\n`。Leaf 通常能处理，但跨平台部署时应统一为 LF。

```bash
# 把目录下所有 .json 和 .mcfunction 的 CRLF 转为 LF
find . -name "*.json" -o -name "*.mcfunction" | xargs sed -i 's/\r$//'
```

### tick.json 的 replace 字段

多个数据包同时注册 `#minecraft:tick` 时，标签文件默认合并，即 `replace: false`。

某个数据包的 tick.json 设置 `replace: true` 时，会覆盖其他数据包的 tick 注册。

始终显式声明 `"replace": false`：

```json
{
  "replace": false,
  "values": ["my_namespace:main"]
}
```

::: tip replace 的默认值
`replace` 字段完全缺失时，Minecraft 默认按 `false` 处理，即合并模式。显式声明更安全。
:::

### 26.2 的 pack_format 变化

自 MC 26.2 起，`pack.mcmeta` 不再要求 `pack_format` 字段，改用 `min_format` 与 `max_format` 指定版本范围：

```json
{
  "pack": {
    "description": "...",
    "min_format": 107,
    "max_format": 107
  }
}
```

官方 Minecraft 26.2 的数据包也使用此格式。整数格式和数组格式可以混用，但统一用整数格式更清晰。

### 推荐目录结构

```text
F:\FCelestial\datapacks\
├── new-fun\                          # 新下载包的工作目录
│   ├── <Pack>.zip                    # 适配后的 zip
│   ├── _original\                    # 原始 zip 备份
│   └── _extracted\                   # 解压后的工作副本
└── download-fixed\                   # 适配完成、待部署的 zip
    ├── <Pack>.zip
    └── ...
```

::: warning 必须备份原始 zip
Leaf 的报错往往一项触发一项，适配需要多轮迭代。保留原始 zip 可以从干净的起点重新开始，避免在已修改的版本上叠加错误。
:::
