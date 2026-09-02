# MiragEdge-DocWeb

> 本项目工作区的长期记忆文件。所有会话启动时自动读取，会话中主动维护。
> 大小限制 1.5MB，超过时必须整理压缩。结构按以下固定小节维护。

## 架构

<!-- 本项目整体结构：架构、组件、技术栈、目录职责 -->
（待补充——首次使用请在此记录本项目的架构）

## 约定/规范

<!-- 项目约定：命名、风格、版本、操作习惯 -->
（待补充）

## 关键决策

<!-- 为什么这样定：技术选型、踩坑结论、用户拍板的事项 -->
（待补充）

## 模块/组件

<!-- 主要模块及其职责 -->
（待补充）

## 踩坑记录

<!-- 遇到过的问题与解决办法（按时间倒序） -->
（待补充）

## 进行中的工作

## 进行中的工作

### 2026-08 · HFcatLogin 原创插件文档（plugin-guides/hfcatlogin/）

- 新增 4 个页面：index.md（总览/安装）、commands.md（命令参考）、permissions.md（权限节点）、config.md（配置参考）
- 已注册 .vitepress/config.mts 侧栏（HFcatLogin 登录插件）与 plugin-guides/index.md FeatureCard
- 内容基于源码核实：命令统一 /hfcatlogin（别名 /hfc）+ /login /register；权限统一 hfcatlogin.* 前缀（16 个管理节点），玩家命令无需权限
- 关键点：未认证白名单 allowed-commands-while-unauthorized；LuckPerms 上下文键 libreloginnext-authorized（沿用上游命名）
- 构建验证：pnpm exec vitepress build 通过；contributor 插件因本地 git 无提交而报错但被捕获忽略，属环境既有现象

### 2026-09 · 待办看板：潮涌能量三件套（public/data/todo.json）

- 便携式「潮涌能量」道具：放入副手持续获得 Conduit Power；道具材料由新增海洋BOSS获取，具体获得方式与效果时长待定
- 新增海洋BOSS：负责掉落便携式潮涌道具的制作材料，生成/召唤方式与战斗机制待设计
- 成就「无界潮涌」：描述「打破框架桎梏，将海洋力量攥于掌中」；解锁条件建议为获得潮涌道具（或击败海洋BOSS）
