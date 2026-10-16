---
title: 官方技能包文件浏览
description: 直接浏览 Aiyatsbus 官方技能包的技能主文件、全部参考文档和真实服务器配置示例，并给出原始文件的访问路径与目录含义。
---

# 官方技能包文件浏览

这页提供 Aiyatsbus 官方技能包的完整文件浏览入口，可以直接打开技能主文件、全部参考文档和真实服务器配置示例。

<SkillBrowser skill-id="aiyatsbus-create-enchant-skill" />

## 技能包内容

- `SKILL.md`：技能主文件
- `references/`：全部官方参考文档，覆盖开发方式、触发器、Fluxon 语言等
- `reference-configs/`：服务器真实配置示例，含 YAML 配置、附魔示例和 NereusOpus 资源包

## 原始文件访问

所有文件都可通过以下 URL 直接访问：

```text
/ai-skills/aiyatsbus-create-enchant-skill/SKILL.md
/ai-skills/aiyatsbus-create-enchant-skill/references/<文件名>.md
/ai-skills/aiyatsbus-create-enchant-skill/reference-configs/<路径>
```

也可以下载完整技能包：

- [下载技能包 ZIP](https://miragedge.top/ai-skills/aiyatsbus-create-enchant-skill.zip)（若已发布）

## 目录约定

| 目录 | 含义 |
| --- | --- |
| `references/` | 官方参考文档，与本栏目各页面内容对应 |
| `reference-configs/aiyatsbus-core/` | Aiyatsbus 核心配置（含机制、UI、语言文件） |
| `reference-configs/aiyatsbus-enchants/` | 服务器附魔 YAML 示例（Packet/Vanilla/Funpack/Stellarity） |
| `reference-configs/nereus-enchantments/` | NereusOpus 附属附魔配置示例 |
