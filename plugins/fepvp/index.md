---
title: 安装配置
outline: deep
---

# 01 — 安装配置

## 环境要求

| 项目 | 要求 |
|------|------|
| 服务端 | Paper 1.21.11+ |
| Java | JDK 21+（推荐 Zulu 25） |
| 内存 | 无额外要求，插件本身 < 50MB |

### 可选依赖

| 插件 | 用途 | 必需？ |
|------|------|--------|
| PlaceholderAPI | 占位符支持 | 否 |
| Multiverse-Core | 多世界竞技场管理 | 否 |

## 安装步骤

1. 下载 `FE_PVP-1.0.0.jar`
2. 放入服务器 `plugins/` 目录
3. 启动服务器，插件自动生成配置文件
4. 按需编辑 `plugins/FE_PVP/config.yml`
5. 执行 `/fepvp admin reload` 或重启服务器

## 目录结构

```
plugins/
└── FE_PVP/
    ├── config.yml        # 主配置
    ├── lang.yml          # 语言文件
    ├── arenas.yml        # 竞技场数据（自动生成）
    ├── kits.yml          # 装备组合数据（自动生成）
    ├── fepvp.db          # SQLite 数据库（默认）
    └── logs/             # （如启用调试）
```

## 首次启动检查

启动后控制台应看到：

```
[FE_PVP] SQLite database initialized.
[FE_PVP] Loaded 0 arena(s).
[FE_PVP] Loaded 0 kit(s).
[FE_PVP] FE_PVP has been enabled!
```

如果看到 PlaceholderAPI expansion 注册成功则说明 PAPI 已对接。

## 数据库选择

默认使用 SQLite（零配置）。如需 MySQL，编辑 `config.yml`：

```yaml
database:
  type: mysql
  mysql:
    host: localhost
    port: 3306
    database: fepvp
    user: root
    password: "your_password"
```

重启后自动使用 MySQL。
