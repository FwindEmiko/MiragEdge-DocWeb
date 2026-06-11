# Security Policy

## 适用范围

本安全策略适用于 **[MiragEdge 文档中心](https://miragedge.top)**（锐界幻境社区文档站）及其关联的构建/部署基础设施。

## 支持的版本

本项目采用**持续部署**，仅最新部署版本接收安全更新。

| 版本 | 支持状态 |
|------|---------|
| `main` 分支（生产部署） | ✅ 活跃支持 |
| 历史标签 / Release | ❌ 不受支持 |

> 依赖更新通过 Dependabot / 手动 PR 持续滚动，不维护长期固定版本。

## 报告漏洞

如果你发现了安全漏洞，**请不要通过公开 Issue 报告**。请通过以下方式私下联系我们：

| 方式 | 详情 |
|------|------|
| GitHub Security Advisory | [在此提交](https://github.com/FwindEmiko/MiragEdge-DocWeb/security/advisories/new) |
| 邮件 | `security@miragedge.top`（到达维护者） |

**提交时请包含：**
- 漏洞类型与影响范围
- 复现步骤（如有）
- 建议的修复方案（可选）
- 你的联系方式（用于后续沟通）

### 响应时间线

| 阶段 | 预期时间 |
|------|---------|
| 确认收到 | 3 个工作日内 |
| 初步评估 | 7 个工作日内 |
| 修复完成（确认的漏洞） | 视严重程度，通常 14 天内 |
| 公开披露 | 修复部署后，经报告者同意 |

### 奖励

本项目是个人维护的开源社区项目，暂无漏洞赏金计划。但我们会在：
- 发布公告中致谢（经你同意）
- 项目的致谢列表中署名

## 安全范围

### 在范围内

- **依赖链漏洞**：npm 包中的已知 CVE / GHSA
- **构建/部署管线**：GitHub Actions 工作流中的安全隐患
- **站点 XSS / 内容注入**：通过 PR 或外部数据源注入恶意脚本
- **供应链攻击**：恶意依赖、typosquatting 包
- **基础设施配置**：部署环境的安全配置问题

### 不在范围内

- 已停止维护的依赖版本（请升级到最新）
- 第三方平台（GitHub、Cloudflare 等）自身的安全问题
- 理论上的攻击（无实际可利用路径）
- 社会工程学攻击
- `npm audit` 中标记为 `moderate` 且无实际利用路径的 `devDependencies` 问题

## 安全实践

本项目遵循以下安全实践：

- **依赖审计**：通过 Dependabot + `npm audit` 持续监控依赖漏洞
- **CI/CD 安全**：GitHub Actions 使用最小权限 token，Secrets 通过 GitHub Secrets 管理
- **内容安全**：所有文档内容来自受信任的维护者 PR，外部链接添加 `rel="noopener noreferrer"`
- **构建产物**：`vitepress build` 生成纯静态文件，无服务端运行时
- **许可证**：Apache-2.0，依赖使用与许可证兼容的包

## 依赖更新策略

| 更新类型 | 周期 | 方式 |
|---------|------|------|
| 安全补丁（Critical/High） | 发现后 7 天内 | Dependabot PR → 手动合并 |
| 常规更新（Moderate/Low） | 随开发周期 | 手动 `npm update` |
| 大版本升级 | 评估兼容性后 | 专门分支 + 测试 |

## 联系方式

- **安全相关问题**：`2011857087@qq.com`
- **一般问题**：[GitHub Issues](https://github.com/FwindEmiko/MiragEdge-DocWeb/issues)
- **维护者**：[FwindEmiko](https://github.com/FwindEmiko)
