# SEO 全面优化报告

> 优化时间：2026-07-14
> 目标：全面优化页面搜索引擎检索，提升关键词检索优先级

---

## 一、优化概览

本次 SEO 优化覆盖全局配置、自动化标签注入、结构化数据、站点地图、关键词权重、页面级元数据等 6 大维度，共修改/新增 **47 个文件**，构建验证通过。

### 核心改进

| 维度 | 优化前 | 优化后 |
|------|--------|--------|
| canonical 链接 | 无 | 每页自动注入规范 URL |
| meta description | 仅 2 页有 | 34 页显式声明 + 其余页面自动从正文提取 |
| Open Graph | 全局静态、相对路径图片 | 每页动态注入、绝对路径、含 article 元数据 |
| JSON-LD 结构化数据 | 无 | WebSite schema + 每页 BreadcrumbList |
| robots.txt | 不存在 | 创建，含多搜索引擎放行 + sitemap 引用 |
| 搜索权重 | title:2 content:1 | title:6 heading:3 content:1 |
| 关键词 | 10 个基础词 | 29 个长尾关键词 |
| 页面 title | 部分 H1 含 Vue 组件 | 12 页显式 title 修正 |

---

## 二、修改文件清单

### 1. 全局配置（1 文件）

**`.vitepress/config.mts`** — 核心改动：
- 新增站点常量（`SITE_HOST` / `SITE_TITLE` / `SITE_DESCRIPTION` / `SITE_OG_IMAGE`），统一绝对地址
- 扩充全局关键词至 29 个，覆盖品牌词、品类词、玩法词、技术词
- 新增 `robots` meta：`index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`
- 新增 `language`、`referrer` meta
- Open Graph 改用绝对路径图片，补充 `og:site_name`、`og:image:alt`、`og:image:width/height`、`og:locale`
- Twitter Card 补充 `twitter:site`、`twitter:image:alt`
- 新增 JSON-LD WebSite schema（含 SearchAction 站内搜索框）
- 新增 `preconnect` 预连接 `oss.miragedge.top`
- **新增 `transformHead` 钩子**：每页自动注入 canonical、og:url、og:title、og:description、twitter:title/description、article:author/section/modified_time、BreadcrumbList JSON-LD
- **新增 `transformPageData` 钩子**：未声明 description 时自动从源 markdown 首段提取摘要（跳过标题/引用/组件/代码块/列表），截断到 150 字
- 搜索权重提升：title boost 2→6，新增 heading boost 3，fuzzy true→0.2，新增 combineWith AND

### 2. 站点级文件（2 文件）

**`public/robots.txt`**（新建）：
- 允许所有搜索引擎抓取全站
- 禁止抓取 `.vitepress/`、sourcemap、搜索查询页
- 单独放行 Googlebot / Bingbot / Baiduspider / Sogou / 360 / Bytespider
- 声明 sitemap 地址

**`public/site.webmanifest`**：
- 补充完整 description
- 新增 `scope`、`orientation`、`lang`、`dir`、`categories` 字段
- 修正 icons 配置（区分 purpose: any / maskable）

### 3. 页面级 frontmatter（44 文件）

#### 显式 title + description + keywords（34 页）

| 文件 | title |
|------|-------|
| `index.md` | MiragEdge 文档中心 |
| `features/index.md` | 功能玩法指南 |
| `manual/review.md` | 新朋友 欢迎来到锐界幻境 |
| `develop/team.md` | 开发文档中心 |
| `plugins/index.md` | 插件内容开发协作流程 |
| `features/base/economy.md` | 经济系统 |
| `features/base/dom.md` | 幻域领地使用指南 |
| `features/pastoral/seasons/info.md` | 真实季节系统 |
| `features/pastoral/fishing/info.md` | 更多钓鱼 |
| `features/adventure/levelledmobs.md` | 等级怪物系统 |
| `features/adventure/deathreincarnation.md` | 死亡轮回 |
| `features/adventure/miragedgehome.md` | 星辉锚点 |
| `features/adventure/enchantments/info.md` | 附魔速览 |
| `features/adventure/enchantments/list.md` | 附魔大全 |
| `features/adventure/mmo/info.md` | 装备升级 |
| `manual/eula.md` | 玩家行为守则 |
| `manual/faq.md` | 常见问题 FAQ |
| `manual/tutorial/serverjoin.md` | 入服指南 |
| `manual/tutorial/bedrock.md` | 基岩版玩家指南 |
| `manual/tutorial/clientinstall.md` | 客户端安装指南 |
| `manual/qq_group.md` | 玩家交流群组汇总 |
| `manual/other/worldview.md` | 世界观设定 |
| `manual/function/qqbot.md` | 群服互通机器人 |
| `manual/function/mod.md` | 服内模组支持 |
| `manual/redstone_mechanism.md` | 生电与特性 |
| `develop/server_configs/enchanting.md` | 附魔配置教程 |
| `develop/server_configs/enchantment_ids.md` | 附魔ID对照表 |
| `develop/server_configs/fishing.md` | 钓鱼系统配置 |
| `develop/server_configs/customcrops.md` | 自定义作物 |
| `develop/server_configs/sticker.md` | 贴图字符码速查表 |
| `plugins/miragedgehome.md` | MiragEdgeHome 星辉锚点插件 |
| `plugins/miragedgetitle.md` | MiragEdgeTitle 称号与入服消息插件 |
| `plugins/SkyElytra.md` | SkyElytra 幻空翼飞行系统插件 |
| `plugins/emcshop.md` | EMCShop 等价交换商店插件 |
| `plugins/list.md` | 狐风轩汐原创插件列表 |

#### 仅显式 title（Vue 组件 H1 修正，12 页）

这些页面的 H1 标题包含 `<MapIcon .../>` Vue 组件，会导致 SEO title 污染，通过 frontmatter title 修正：

| 文件 | title |
|------|-------|
| `features/pastoral/food/info.md` | 更多食物拓展 |
| `features/pastoral/food/bakery.md` | 烘焙糕点 |
| `features/pastoral/food/breakfast.md` | 早餐简餐 |
| `features/pastoral/food/desserts.md` | 甜品 |
| `features/pastoral/food/drinks.md` | 饮品 |
| `features/pastoral/food/eggs.md` | 煎蛋系列 |
| `features/pastoral/food/mains.md` | 主菜肉食 |
| `features/pastoral/food/salads.md` | 沙拉凉菜 |
| `features/pastoral/food/snacks.md` | 糖果零食 |
| `features/pastoral/food/special.md` | 特色食物 |
| `features/pastoral/food/reference.md` | 食物速查表 |
| `develop/logs.md` | 锐界幻境更新日志 |

---

## 三、技术实现细节

### 3.1 transformHead 自动注入逻辑

每页构建时自动生成以下标签，无需在每页 frontmatter 重复配置：

```
<link rel="canonical" href="{页面规范URL}">
<meta property="og:url" content="{页面规范URL}">
<meta property="og:title" content="{页面标题} | MiragEdge 文档中心">
<meta property="og:description" content="{页面描述}">
<meta name="twitter:title" content="{页面标题} | MiragEdge 文档中心">
<meta name="twitter:description" content="{页面描述}">
<meta property="og:type" content="article|website">
<meta property="article:author" content="F.windEmiko (狐风轩汐)">  <!-- 文章页 -->
<meta property="article:section" content="锐界幻境文档">  <!-- 文章页 -->
<script type="application/ld+json">BreadcrumbList...</script>  <!-- 非首页 -->
```

### 3.2 transformPageData 自动描述提取

当页面未声明 `description` 时，从源 markdown 文件自动提取：
- 读取源文件 → 去除 YAML frontmatter → 逐行扫描
- 跳过：标题(`#`)、引用(`>`)、Vue组件(`<`)、容器(`:::`)、列表(`-/*/数字`)、代码块(````)
- 清理行内 Markdown 语法（粗体/斜体/链接/图片）
- 取首段 ≥8 字符纯文本，截断到 150 字

### 3.3 搜索权重优化

```js
miniSearch: {
  searchOptions: {
    fuzzy: 0.2,           // 模糊匹配容错（原 true）
    prefix: true,          // 前缀匹配
    combineWith: 'AND',   // 逻辑与（原默认 OR）
    boost: { title: 6, content: 1, heading: 3 }  // 标题权重 2→6
  },
  options: { boost: { title: 6 } }  // 索引阶段标题加权
}
```

---

## 四、构建验证

```
✓ building client + server bundles...
✓ rendering pages...
✓ generating sitemap...
build complete in 41.15s.
```

### 验证结果

| 检查项 | 结果 |
|--------|------|
| 构建成功 | ✅ 无错误 |
| sitemap.xml 生成 | ✅ 12KB，含全部页面 URL + lastmod |
| robots.txt 部署 | ✅ 603B，含 sitemap 引用 |
| canonical URL 正确 | ✅ 如 `https://miragedge.top/features/base/economy` |
| og:title 干净 | ✅ 如 `更多食物拓展 | MiragEdge 文档中心`（无 Vue 组件污染） |
| meta description 自动提取 | ✅ 如 `锐界幻境的田园生活产出了丰富的农作物...` |
| BreadcrumbList JSON-LD | ✅ 非首页均注入 |
| WebSite schema | ✅ 全局注入 |

---

## 五、SEO 效果预期

1. **关键词检索优先级提升**：标题权重从 2 提升至 6，标题匹配的页面在搜索结果中排序更靠前
2. **收录覆盖面扩大**：sitemap.xml + robots.txt 帮助搜索引擎发现全部页面
3. **搜索结果展示优化**：每页有独立 description，搜索摘要更精准，点击率提升
4. **社交分享卡片完整**：OG 标签绝对路径，社交平台分享时展示完整卡片
5. **结构化数据增强**：WebSite schema 可启用 Google 站内搜索框，BreadcrumbList 可展示面包屑导航
6. **避免重复内容惩罚**：canonical 链接统一权重到规范 URL
7. **长尾关键词覆盖**：29 个全局关键词 + 每页独立关键词，覆盖更多搜索意图
