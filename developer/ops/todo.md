---
title: 待办事项
description: 开发待办与近期计划
aside: false
---

# 待办事项

数据驱动视图，列出近期待完成与最近 15 天内的已完成条目；超过 15 天滚动归档到 [更新日志](/developer/ops/changelog)。

<TodoList />

## 使用约定

### 一句话交给 AI

待办只维护 [`public/data/todo.json`](https://github.com/fwindemiko/MiragEdge-DocWeb/edit/main/public/data/todo.json)。把下面任一句话直接交给 AI agent 即可；它应先读取 JSON、精确找到条目，再做最小修改。

- `在服务器文档站待办中新增：<待办内容>`
- `把待办“<现有标题或 ID>”调整为：<新内容>`
- `把待办“<现有标题或 ID>”标记完成`
- `归档超过 15 天的已完成待办`

对应动作固定如下：新增时追加到最合适的 `groups[].items[]`；调整时按标题或 `id` 精确更新；完成时移到 `completed[].items[]` 并填写真实 `date`；归档时将超过 15 天的已完成记录整理到[更新日志](/developer/ops/changelog)。标题重复或需求不完整时，先停下来确认，不能猜测要改哪一条。

弱模型也必须遵守这几条：沿用已有分组、字段和中文枚举；新 ID 使用 `w-YYYY-MM-DD-短英文标识`；不臆造截止日期、范围、玩法事实或完成日期；不修改 `TodoList` 组件、侧栏或生成文件。待办的分组优先级由现有 JSON 定义，不能仅因一条新任务擅自重排全部内容。

### 添加新待办

直接编辑 `public/data/todo.json` 里的 `groups[].items[]` 数组，按现有结构追加一条：

```json
{
  "id": "w-2026-07-20-emcshop-bank",
  "due": "2026-07-20",
  "title": "实现 EMCShop 物品银行",
  "scope": "服务端 · 经济系统",
  "category": "添加",
  "status": "待开始",
  "note": "需要先重构 Vault 桥接"
}
```

### 标记完成

1. 把条目从 `groups[].items[]` 剪切到 `completed[].items[]`；
2. `date` 填实际完成日期；
3. 15 天前的已完成项滚动归档到 [更新日志](/developer/ops/changelog)。

修改后至少验证 JSON 可解析；只改待办数据时不需要新增侧栏、重定向，也不应手工改写 `public/` 中生成的页面副本。

### 5 个工作性质类别（必填 `category`）

- `添加` — 新内容 / 新功能 / 新物品
- `调整` — 既有内容的微调 / 数值 / 行为
- `修复` — Bug 解决
- `升级` — 主要依赖 / 引擎 / 底层系统的更换
- `兼容` — 跨平台 / 跨版本 / 跨客户端的适配

### 5 种状态（必填 `status`）

- `待开始` 还没动手
- `进行中` 正在做
- `等待验收` 做完了在测 / 待别人测
- `卡住` 遇到了阻塞，需要讨论
- `构思中` 还没定具体方案

### 维护节奏

- 每周日 —— 把本周完成的条目整理到 [更新日志](/developer/ops/changelog)
- 超过 15 天 —— 从本页面滚动到 [更新日志](/developer/ops/changelog)
- 每月底 —— 回顾本月未完成的长期规划条目，决定是否调整优先级

---

直接在 GitHub 上点 [todo.json](https://github.com/fwindemiko/MiragEdge-DocWeb/edit/main/public/data/todo.json) 就能改，最快。

本页面的 GitHub 路径：`developer/ops/todo.md` → [在 GitHub 编辑](https://github.com/fwindemiko/MiragEdge-DocWeb/edit/main/developer/ops/todo.md)
