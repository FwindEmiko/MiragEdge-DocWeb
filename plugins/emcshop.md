# EMCShop（等价交换商店）

## 项目概述

EMCShop 是一个为 Minecraft Paper 服务器设计的经济插件，提供物品转换、购买和预览功能。该插件允许玩家将基础物品转换为更有价值的物品，或直接购买解锁的物品。

- 作者：狐风轩汐 & F.windEmiko
- 项目地址：https://github.com/fwindemiko/EMCShop

## 技术栈

- **Java**: 21
- **Minecraft API**: Paper 1.21.4
- **数据库**: MySQL / SQLite (可选)
- **连接池**: HikariCP
- **经济系统**: Vault API / 独立 EMC 系统
- **构建工具**: Maven

## 项目结构

```
EMCShop/
├── src/main/java/top/MiragEdge/emc/
│   ├── EMCShop.java              # 主插件类
│   ├── Commands/                 # 命令处理
│   │   ├── MainCommand.java      # 主命令
│   │   ├── PurchaseCommand.java  # 购买命令
│   │   ├── ViewCommand.java      # 查看命令
│   │   ├── ConvertCommand.java   # 转换命令
│   │   ├── ItemCommand.java      # 物品命令
│   │   └── ReloadCommand.java    # 重载命令
│   ├── Data/                     # 数据模型
│   │   └── PlayerData.java       # 玩家数据
│   ├── Database/                 # 数据库层
│   │   ├── DatabaseConnector.java # 数据库连接器
│   │   └── DatabaseManager.java  # 数据库管理器
│   ├── Gui/                      # GUI 菜单
│   │   ├── ConvertMenu.java      # 转换菜单
│   │   ├── PreviewMenu.java      # 预览菜单
│   │   └── PurchaseMenu.java     # 购买菜单
│   ├── Manager/                  # 业务逻辑管理
│   │   └── EMCManager.java       # EMC 管理器
│   └── Utils/                    # 工具类
│       ├── LocalizationUtil.java # 本地化工具
│       └── MessageUtil.java      # 消息工具
└── src/main/resources/
    ├── plugin.yml                # 插件配置
    ├── config.yml                # 主配置文件
    ├── message.yml               # 消息配置
    └── items.yml                 # 物品配置
```

## 核心功能

### 1. 数据库管理

#### DatabaseManager (DatabaseManager.java:1)
负责管理数据库操作，包括：
- 异步数据保存和加载
- 动态批处理优化
- 死锁重试机制
- 定期清理过期数据
- 内存泄漏防护

关键特性：
- 使用 TransferQueue 实现高效的任务队列
- 支持 MySQL 和 SQLite 两种数据库
- 动态调整批处理大小以优化性能
- 弱引用缓存防止内存泄漏

### 2. EMC 管理

#### EMCManager (EMCManager.java:1)
管理 EMC 经济系统和玩家数据：
- 支持 Vault 和独立 EMC 两种经济模式
- 玩家解锁物品管理
- 经济交易操作（存取款）
- 玩家数据缓存和持久化

### 3. GUI 菜单系统

#### ConvertMenu (ConvertMenu.java:1)
物品转换界面，提供：
- 批量转换功能
- 实时价值计算
- 转换进度显示
- 异常恢复机制

### 4. 命令系统

#### MainCommand (MainCommand.java:1)
主命令入口，支持以下子命令：
- `/emcshop purchase` - 打开购买菜单
- `/emcshop view` - 打开预览菜单
- `/emcshop convert` - 打开转换菜单
- `/emcshop item` - 查看手持物品价值
- `/emcshop reload` - 重载配置

## 配置文件

### config.yml
主配置文件，包含：
- 经济系统设置
- 数据库配置（MySQL/SQLite）
- 重构损耗率
- 数据库连接池参数

### items.yml
物品价值配置，定义每个物品的基础 EMC 价值：
```yaml
EMC_VALUES:
  BASE:
    GRASS_BLOCK: 2
    STONE: 1
    # ... 更多物品
```

### message.yml
消息配置，支持 MiniMessage 格式：
- 转换菜单消息
- 预览菜单消息
- 购买菜单消息
- 通用系统消息

## 数据库设计

### MySQL 表结构
```sql
-- 玩家解锁物品表
CREATE TABLE player_unlocks (
  player_uuid VARCHAR(36) NOT NULL,
  item_id VARCHAR(64) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (player_uuid, item_id)
);

-- 玩家 EMC 余额表
CREATE TABLE player_emc_balance (
  player_uuid VARCHAR(36) NOT NULL,
  balance DECIMAL(15,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (player_uuid)
);
```

### SQLite 表结构
```sql
-- 玩家解锁物品表
CREATE TABLE player_unlocks (
  player_uuid TEXT NOT NULL,
  item_id TEXT NOT NULL,
  unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (player_uuid, item_id)
);

-- 玩家 EMC 余额表
CREATE TABLE player_emc_balance (
  player_uuid TEXT NOT NULL,
  balance REAL DEFAULT 0.0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (player_uuid)
);
```

## 开发指南

### 1. 添加新物品价值

1. 编辑 `src/main/resources/items.yml`
2. 在 `EMC_VALUES.BASE` 部分添加新物品：
   ```yaml
   NEW_ITEM: 10  # 物品ID: 价值
   ```
3. 重启服务器使配置生效

### 2. 添加新命令

1. 在 `Commands/` 目录创建新的命令类
2. 实现 `CommandExecutor` 或 `TabExecutor` 接口
3. 在 `MainCommand.java` 中注册新命令

### 3. 添加新菜单

1. 在 `Gui/` 目录创建菜单类
2. 继承或实现相应的菜单接口
3. 在 `EMCShop.java` 中初始化

### 4. 修改消息

1. 编辑 `src/main/resources/message.yml`
2. 添加或修改消息键值对
3. 重启服务器或使用 `/emcshop reload` 命令重载

## 性能优化

### 数据库优化
- 使用批量操作减少数据库连接
- 动态调整批处理大小
- 死锁重试机制
- 定期清理过期数据

### 内存管理
- 使用 WeakReference 防止内存泄漏
- 异步数据处理
- 玩家数据缓存机制

### 线程安全
- 使用 ConcurrentHashMap 保护共享数据
- 异步数据库操作
- 玩家数据锁机制

## 部署指南

### 1. 构建插件
```bash
mvn clean package
```

### 2. 部署插件
1. 将生成的 JAR 文件复制到 Paper 服务器的 plugins 目录
2. 配置 `config.yml` 中的数据库设置
3. 重启服务器

### 3. 配置数据库
根据需要配置 MySQL 或 SQLite：
```yaml
database:
  type: "mysql"  # 或 "sqlite"
  # MySQL 配置...
  # SQLite 配置...
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 MySQL 连接配置
   - 确认数据库服务正在运行
   - 验证用户名和密码

2. **性能问题**
   - 检查数据库连接池配置
   - 监控 CPU 和内存使用
   - 调整批处理大小

3. **数据丢失**
   - 确保正确保存数据
   - 检查磁盘空间
   - 验证数据库备份

### 日志分析
插件日志包含详细的调试信息，可以帮助诊断问题：
- 数据库操作日志
- 玩家数据加载/保存日志
- 经济交易日志
- 错误和警告信息

## 版本历史

- **v3.14** - 修复性能问题，优化数据库连接
- **v3.0** - 重大重构，支持多种数据库
- **v2.0** - 添加独立 EMC 经济系统
- **v1.0** - 初始版本，基础功能

## 贡献指南

1. Fork 项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。
