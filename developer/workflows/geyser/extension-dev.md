---
title: Geyser 扩展开发
description: 用 Geyser Extension API 注册非原版方块。涵盖 Gradle 工程结构、extension.yml、注册事件代码、JavaBlockState 必填字段与崩溃原因。
outline: [2, 3]
---

# Geyser 扩展开发

非原版方块不能用 JSON 映射。这页给出扩展工程的搭建、注册代码与部署方式。

## 项目结构

```text
CustomCrops-Geyser/
├── build.gradle.kts
├── settings.gradle.kts
├── src/main/resources/
│   ├── extension.yml
│   └── geometry/
│       ├── block_1.geo.json
│       └── block_2.geo.json
└── src/main/java/.../
    ├── MyExtension.java
    └── BlockDefinitions.java
```

## extension.yml

```yaml
name: CustomCrops
id: customcrops
main: top.miragedge.geyser.customcrops.CustomCropsExtension
api: 2.11.0
version: 1.0.0
```

## build.gradle.kts

```kotlin
plugins { id("java") }
group = "top.miragedge"
version = "1.0.0"

repositories {
    mavenCentral()
    maven("https://repo.opencollab.dev/main/")
    maven("https://jitpack.io")
}

dependencies {
    compileOnly("org.geysermc.geyser:api:2.11.0-SNAPSHOT")
}

tasks.jar { archiveBaseName.set("CustomCrops-Geyser") }
```

## 注册代码

```java
package top.miragedge.geyser.customcrops;

import org.geysermc.geyser.api.extension.Extension;
import org.geysermc.geyser.api.event.lifecycle.GeyserDefineCustomBlocksEvent;
import org.geysermc.geyser.api.block.custom.NonVanillaCustomBlockData;
import org.geysermc.geyser.api.block.custom.CustomBlockState;
import org.geysermc.geyser.api.block.custom.component.CustomBlockComponents;
import org.geysermc.geyser.api.block.custom.component.BoxComponent;
import org.geysermc.geyser.api.block.custom.component.GeometryComponent;
import org.geysermc.geyser.api.block.custom.component.MaterialInstance;
import org.geysermc.geyser.api.block.custom.nonvanilla.JavaBlockState;
import org.geysermc.geyser.api.block.custom.nonvanilla.JavaBoundingBox;
import org.geysermc.event.subscribe.Subscribe;

public class CustomCropsExtension implements Extension {

    @Subscribe
    public void onDefineCustomBlocks(GeyserDefineCustomBlocksEvent event) {
        int idCounter = 0;

        for (BlockDefinitions.BlockDef def : BlockDefinitions.BLOCKS) {
            CustomBlockComponents components = CustomBlockComponents.builder()
                .geometry(GeometryComponent.builder()
                    .identifier("geometry.customcrops." + def.modelName())
                    .build())
                .materialInstance("*", MaterialInstance.builder()
                    .texture("customcrops_" + def.modelName())
                    .renderMethod("alpha_test")
                    .faceDimming(true)
                    .ambientOcclusion(true)
                    .build())
                .collisionBox(BoxComponent.emptyBox())
                .selectionBox(new BoxComponent(-8, 0, -8, 16, 16, 16))
                .build();

            NonVanillaCustomBlockData data = NonVanillaCustomBlockData.builder()
                .namespace("customcrops")
                .name("customcrops_" + def.modelName())
                .components(components)
                .includedInCreativeInventory(false)
                .build();

            event.register(data);

            int baseId = 32367 + (idCounter * 2);
            idCounter++;

            CustomBlockState state = data.blockStateBuilder().build();
            JavaBlockState javaBlockState = JavaBlockState.builder()
                .identifier("craftengine:" + def.blockId())
                .javaId(baseId)
                .stateGroupId(baseId + 1)
                .blockHardness(1.0f)
                .waterlogged(false)
                .collision(new JavaBoundingBox[0])
                .canBreakWithHand(true)
                .pistonBehavior("NORMAL")
                .build();
            event.registerOverride(javaBlockState, state);
        }
    }
}
```

注册非原版方块必须使用 `NonVanillaCustomBlockData`，再用 `JavaBlockState` 建立 Java 状态与非原版方块的映射。

## JavaBlockState 必填字段

| 字段 | 值 | 注意事项 |
| --- | --- | --- |
| `identifier` | `"craftengine:custom_44"` | 填 CraftEngine 方块 ID |
| `javaId` | 不小于 32367 | 必须在最后一个原版方块状态之后 |
| `stateGroupId` | `javaId + 1` | 状态组 ID |
| `blockHardness` | `1.0f` | 方块硬度 |
| `waterlogged` | `false` | 是否含水 |
| `collision` | `new JavaBoundingBox[0]` | 必须非 null，否则空指针 |
| `canBreakWithHand` | `true` | 是否徒手破坏 |
| `pistonBehavior` | `"NORMAL"` | 必须非 null，否则空指针 |

::: danger 三个必现崩溃
- `collision` 为 null 时报 `NullPointerException: Cannot read array length`。
- `pistonBehavior` 为 null 时报同样的空指针。
- `javaId` 小于 32367 时报 `RuntimeException: runtime ID must start after last vanilla block state`。
:::

## 构建与部署

```bash
# 构建
cmd.exe /c "F:\env\gradle\8.12\bin\gradle.bat build --no-daemon"

# 部署到代理端扩展目录
scp build/libs/CustomCrops-Geyser-1.0.0.jar \
    root@server:/mnt/miragedge/vc/plugins/Geyser-Velocity/extensions/
```

::: warning 扩展与资源包必须成对更新
扩展只负责注册方块定义，geometry 与纹理仍由基岩版资源包提供。只换 JAR 不换资源包会导致方块显示为缺失模型。
:::

## 排错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 启动时空指针 | `collision` 或 `pistonBehavior` 为 null | 补齐这两个字段 |
| 日志报 runtime ID 错误 | `javaId` 小于 32367 | 从 32367 起递增分配 |
| 方块注册成功但不显示 | 资源包缺少对应 geometry 或纹理 | 核对 `geometry.<namespace>.<name>` 与纹理键 |
| 扩展未被加载 | `extension.yml` 的 `main` 类名或 `api` 版本不符 | 核对类全名与 Geyser API 版本 |
