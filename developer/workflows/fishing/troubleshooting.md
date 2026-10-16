---
title: 钓鱼系统工作流 · 排错与交付
description: 钓鱼配置遇到未覆盖问题时的处理顺序。涵盖查阅官方 Wiki、参考 _example.yml、检视服内实际配置、增量验证与保守提示的组织方式，以及交付输出要求。
---

# 钓鱼系统工作流 · 排错与交付

这页规定遇到文档未覆盖的问题时按什么顺序排查。

## 未覆盖问题的处理顺序

1. 查阅 [EvenMoreFish Wiki](https://evenmorefish.github.io/EvenMoreFish/docs/intro)，它涵盖物品、条件、奖励的完整参考。
2. 参考 `_example.yml`，每个文件夹内都有它提供完整字段参考和说明注释。
3. 检视 `plugins/EvenMoreFish/` 下的实际 yml，这是最可靠的参考。
4. 每完成一项配置后立即执行 `/emf admin reload` 测试，不要全部写完再验证。
5. 对确实无法确认的功能，例如钓鱼售卖系统、数据库存储，明确说明不确定，不要编造字段。

## 交付输出

输出格式的通用要求见[通用交付标准](../_shared/ai-delivery)。钓鱼场景下还需额外满足：

- 每个 yml 代码块可直接复制使用，占位符用尖括号标出。
- 每个文件块带路径注释，例如 `# rods/my_rod.yml`。
- 每个模块附带对应的 `/emf admin` 验证命令。
- 说明文件之间的依赖关系，例如钓竿 CMD 与 DimensionFishing 的联动。
- 标注哪些鱼用原版物品材质，哪些用头颅，例如 `head-64`、`head-uuid`。
