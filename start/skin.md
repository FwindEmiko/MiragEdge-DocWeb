---
title: 皮肤更换
description: 通过 SkinsRestorer 上传自用皮肤，在游戏内一键更换。
---

# 皮肤更换

> 想换皮肤？上传 PNG 文件，复制一句指令，在游戏内执行就能换。

## 上传皮肤

1. 打开 [SkinsRestorer 皮肤上传页](https://skinsrestorer.net/upload)
2. 拖入或点击上传你的 PNG 皮肤文件（仅限 PNG，最大 5MB）
3. 确认预览效果后，点击上传
4. 页面会生成一句类似 `/skin url https://...` 的指令

## 游戏内更换

把上传后生成的指令粘贴到游戏聊天框发送即可。例如：

```
/skin url https://textures.skinsrestorer.net/xxx
```

执行后皮肤会立即生效，无需重启游戏。

## 小贴士

- 支持 Java 版和基岩版（基岩版更换后可能延迟几秒显示）
- 上传的皮肤会缓存，以后可以直接用 `/skin url` 再次应用
- 想恢复默认皮肤？执行 `/skin clear`