---
title: 待办事项
description: F.windEmiko 的开发待办与近期计划
aside: false
---

# 待办事项

数据驱动视图，列出近期待完成与最近 15 天内的已完成条目；超过 15 天滚动归档到 [更新日志](/develop/logs)。

<TodoList />

## 使用约定

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
3. 15 天前的已完成项滚动归档到 [更新日志](/develop/logs)。

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

- 每周日 —— 把本周完成的条目整理到 [更新日志](/develop/logs)
- 超过 15 天 —— 从本页面滚动到 [更新日志](/develop/logs)
- 每月底 —— 回顾本月未完成的长期规划条目，决定是否调整优先级

---

直接在 GitHub 上点 [todo.json](https://github.com/fwindemiko/MiragEdge-DocWeb/edit/main/public/data/todo.json) 就能改，最快。

本页面的 GitHub 路径：`develop/todo.md` → [在 GitHub 编辑](https://github.com/fwindemiko/MiragEdge-DocWeb/edit/main/develop/todo.md)
