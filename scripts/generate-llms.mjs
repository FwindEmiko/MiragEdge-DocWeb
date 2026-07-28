/**
 * LLMs.txt 标准生成器 —— 锐界幻境文档站
 * ====================================================================
 *
 * 实现 https://llmstxt.org/ 提出的新兴网站标准，为大语言模型（LLM）提供
 * 机器可读、简洁准确的内容索引与全文快照，提升 AI 对文档站的解析效率。
 *
 * 本脚本在 dev / build 流程中自动执行，扫描源 markdown 文件并产出：
 *
 *   1. /llms.txt              —— 站点根索引（H1 + 摘要 + 分区文件清单）
 *   2. /llms-full.txt         —— 全站清洗后 Markdown 拼接而成的全文快照
 *   3. /{section}/llms.txt    —— 各主分区索引（features / manual / develop / plugins）
 *   4. /{path}/page.md        —— 每个 HTML 页面对应的清洗版 Markdown（同 URL + .md）
 *
 * 清洗规则：
 *   - 剥离 YAML frontmatter
 *   - 剥离 Vue <script setup> / <style> 块
 *   - 剥离 HTML 注释
 *   - 剥离 VitePress 容器标记 ::: tip / warning / info / details / :::
 *   - 提取 Vue 组件内的文本内容（如 <FeatureCard>...</FeatureCard>）
 *   - 自闭合 Vue 组件（<EnchantmentList />）替换为占位说明
 *   - 相对链接 / 图片路径转换为 https://miragedge.top 绝对地址
 *   - 折叠多余空行，保留代码块原貌
 *
 * 输出目录：public/ —— 这样 VitePress 在 dev 与 build 时都会原样分发，
 * 无需侵入构建管道；生成的文件已在 .gitignore 中排除。
 *
 * 用法：
 *   node scripts/generate-llms.mjs            # 生成全部产物
 *   node scripts/generate-llms.mjs --check     # 仅校验源文件可读，不写文件
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync, rmSync } from 'fs';
import { join, dirname, relative, basename, extname, posix, sep, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const SRC_ROOT = ROOT; // markdown 源根目录即项目根

const SITE_HOST = 'https://miragedge.top';
const SITE_TITLE = '锐界幻境 MiragEdge 文档中心';

// 不参与 LLMs 索引的目录（构建产物 / 依赖 / 工具 / 静态资源 / 设计文档）
const EXCLUDE_DIRS = new Set([
  '.vitepress',
  'node_modules',
  'docs',
  'public',
  'scripts',
  '.github',
  '.DockerCompose',
  '.git',
  'build',
  'test_tool',
  'coverage',
]);

// 主分区定义：与 .vitepress/config.mts 的 nav / sidebar 结构保持一致
// order 决定在 llms.txt 与 llms-full.txt 中的展示顺序
const SECTIONS = [
  {
    name: 'manual',
    title: '玩家手册',
    description: '入服指南、玩家守则、客户端安装、附属功能教程与社区交流说明',
  },
  {
    name: 'features',
    title: '玩法介绍',
    description: '基础系统、田园生活（钓鱼/种植/食物/季节）、冒险战斗（附魔/装备/数据包）',
  },
  {
    name: 'plugins',
    title: '原创插件',
    description: '锐界幻境自研 Bukkit 插件文档：PVP 竞技场、异常附魔清理、星辉锚点、称号系统',
  },
  {
    name: 'develop',
    title: '开发文档',
    description: '开发团队、工作流（CE / 数据包 / 附魔 / 钓鱼 / 作物）、网建组件、节点状态与更新日志',
  },
];

// ============================================================
// 工具函数
// ============================================================

/** 将 windows 反斜杠路径规范化为 posix 风格 */
function toPosix(p) {
  return p.split(sep).join('/');
}

/** URL 拼接，避免重复斜杠 */
function joinUrl(...parts) {
  return parts.join('/').replace(/([^:])\/{2,}/g, '$1/');
}

/** 将源文件相对路径规范化为 posix 风格 */
function sourceRelPosix(rel) {
  return rel.replace(/\\/g, '/');
}

/** 将页面相对路径转换为站点绝对 URL */
function pageUrl(relPosixPath) {
  // index.md → 目录根；其余去掉 .md 后缀
  let urlPath = relPosixPath.replace(/\\/g, '/').replace(/\.md$/, '');
  urlPath = urlPath.replace(/(^|\/)index$/, '$1');
  // 去掉结尾斜杠后拼到站点根
  urlPath = urlPath.replace(/\/$/, '');
  return urlPath ? `${SITE_HOST}/${urlPath}` : `${SITE_HOST}/`;
}

/** 将清洗后 markdown 中的相对链接 / 图片转换为绝对地址 */
function absolutizeLinks(md, sourceRelPath) {
  const sourceDir = posix.dirname(sourceRelPosix(sourceRelPath));
  // [text](./path)  [text](/path)  [text](path)
  const linkRe = /(!?)\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  return md.replace(linkRe, (full, bang, text, href) => {
    // 跳过外部 URL / 锚点 / 邮件 / 电话
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) return full;
    // 跳过带 {{ }} 的模板变量
    if (href.includes('{{')) return full;
    let abs;
    if (href.startsWith('/')) {
      abs = `${SITE_HOST}${href}`;
    } else {
      // 相对路径基于源文件目录解析
      const resolved = posix.normalize(posix.join(sourceDir, href));
      abs = `${SITE_HOST}/${resolved}`;
    }
    return `${bang}[${text}](${abs})`;
  });
}

/** 折叠 3 个及以上换行为 2 个，去除行尾空白 */
function collapseBlankLines(md) {
  return md
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '\n');
}

// ============================================================
// Markdown 清洗
// ============================================================

/**
 * 清洗单页 markdown：剥离 frontmatter / 脚本 / 样式 / 组件标记，
 * 保留可读性最强的语义内容；相对链接转绝对。
 *
 * 特殊处理：当 frontmatter 声明 `layout: home` 时，VitePress 会将 hero
 * 与 features 字段渲染为首页主视觉，源文件 body 通常只有 Vue 特效脚本。
 * 为避免清洗后只剩空壳，这里把 hero/features 重新展开为 Markdown。
 *
 * @param {string} raw 原始 markdown 文本
 * @param {string} relPosix 源文件相对路径（posix 风格）
 * @returns {{ title: string, description: string, body: string, frontmatter: object }}
 */
export function cleanMarkdown(raw, relPosix) {
  let src = raw;
  const frontmatter = parseFrontmatter(raw);

  // 1. 剥离 YAML frontmatter
  src = src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');

  // 1b. 首页（layout: home）：把 hero / features 字段展开为 Markdown，
  //     避免清洗后只剩 Vue 特效脚本注释
  if (frontmatter.layout === 'home') {
    const expanded = renderHomeFrontmatter(raw);
    if (expanded) src = `${expanded}\n\n${src}`.trim() + '\n';
  }

  // 2. 剥离 <script setup> / <script> 块（含内容）
  src = src.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

  // 3. 剥离 <style> 块（含内容）
  src = src.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

  // 4. 剥离 HTML 注释
  src = src.replace(/<!--[\s\S]*?-->/g, '');

  // 5. 处理 Vue 组件
  src = processVueComponents(src);

  // 6. 剥离 VitePress 容器标记 ::: tip / ::: warning / ::: info / ::: details / :::
  //    保留容器内部内容
  //    注意：闭合的 ::: 必须用 m 标志让 $ 匹配行末，否则只匹配字符串末尾，
  //    导致文档中间的闭合容器标记残留（bug 修复）
  src = src.replace(/(^|\n):::\s*(\w+)(?:[^\n]*)?/g, (m, lead) => lead);
  src = src.replace(/(^|\n):::\s*$/gm, '$1');

  // 7. 相对链接 / 图片绝对化
  src = absolutizeLinks(src, relPosix);

  // 8. 折叠多余空行
  src = collapseBlankLines(src);

  // 9. 提取标题与描述
  const title = frontmatter.title || extractH1(src) || basenameNoExt(relPosix);
  const description = frontmatter.description || extractFirstParagraph(src);

  return { title, description, body: src, frontmatter };
}

/**
 * 将 layout: home 的 frontmatter 中的 hero 与 features 字段渲染为 Markdown。
 * 直接从原始 YAML 块中以缩进块解析，避免引入完整 YAML 依赖。
 */
function renderHomeFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return '';
  const yaml = m[1];
  // 解析 hero 块
  const hero = parseYamlBlock(yaml, 'hero');
  // 解析 features 列表块
  const features = parseYamlListBlock(yaml, 'features');
  if (!hero && !features.length) return '';

  const lines = [];
  if (hero?.name || hero?.text) {
    lines.push(`# ${[hero.name, hero.text].filter(Boolean).join(' · ')}`);
    lines.push('');
  }
  if (hero?.tagline) {
    lines.push(`> ${hero.tagline}`);
    lines.push('');
  }
  if (Array.isArray(hero?.actions) && hero.actions.length) {
    lines.push('快速入口：');
    for (const a of hero.actions) {
      const label = a.text || '入口';
      const link = absolutizeSingleHref(a.link || '', '/');
      lines.push(`- [${label}](${link})`);
    }
    lines.push('');
  }
  if (features.length) {
    lines.push('## 核心特性');
    lines.push('');
    for (const f of features) {
      const title = f.title || '';
      const details = f.details || '';
      if (title) lines.push(`### ${title}`);
      if (details) lines.push('');
      if (details) lines.push(details);
      lines.push('');
    }
  }
  return lines.join('\n').trim();
}

/** 解析 YAML 中某个顶层 key 下的缩进块为对象（仅取字符串字段） */
function parseYamlBlock(yaml, key) {
  // 注意：不能用 m flag，否则 $ 会匹配行尾导致 lookahead 在首个换行就触发
  const re = new RegExp(`(?:^|\\n)${key}:\\s*\\n([\\s\\S]*?)(?=\\n[^\\s\\n]|$)`);
  const m = yaml.match(re);
  if (!m) return null;
  const block = m[1];
  const out = {};
  let inList = null;
  for (const line of block.split('\n')) {
    if (!line.trim()) continue;
    // 列表项（- text: ...）
    const listM = line.match(/^\s+-\s+([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
    if (listM) {
      if (!inList) inList = [];
      const [, k, v] = listM;
      const parsed = parseYamlValue(v);
      // 同一 key 在上一项已存在 → 视为新一项的开端
      if (!inList.length || typeof inList[inList.length - 1][k] !== 'undefined') {
        inList.push({});
      }
      inList[inList.length - 1][k] = parsed;
      continue;
    }
    // 同对象续行（  text: ...）
    const kvM = line.match(/^\s+([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
    if (kvM) {
      const [, k, v] = kvM;
      if (inList && inList.length) {
        inList[inList.length - 1][k] = parseYamlValue(v);
      } else {
        out[k] = parseYamlValue(v);
      }
    }
  }
  if (inList) out.actions = inList;
  return out;
}

/** 解析 YAML 中某个顶层 key 下的列表块（每项为一个对象） */
function parseYamlListBlock(yaml, key) {
  const re = new RegExp(`(?:^|\\n)${key}:\\s*\\n([\\s\\S]*?)(?=\\n[^\\s\\n]|$)`);
  const m = yaml.match(re);
  if (!m) return [];
  const block = m[1];
  const items = [];
  let cur = null;
  for (const line of block.split('\n')) {
    if (!line.trim()) continue;
    const listM = line.match(/^\s+-\s+([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
    if (listM) {
      cur = {};
      items.push(cur);
      const [, k, v] = listM;
      cur[k] = parseYamlValue(v);
      continue;
    }
    const kvM = line.match(/^\s+([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
    if (kvM && cur) {
      const [, k, v] = kvM;
      cur[k] = parseYamlValue(v);
    }
  }
  return items;
}

/** 简单解析 YAML 标量值：去引号、识别布尔与数字 */
function parseYamlValue(v) {
  let s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  if (/^-?\d+$/.test(s)) return Number(s);
  return s;
}

/** 单个链接绝对化（用于 hero.actions.link 等） */
function absolutizeSingleHref(href, fallback) {
  if (!href) return fallback;
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;
  if (href.startsWith('/')) return `${SITE_HOST}${href}`;
  return `${SITE_HOST}/${href.replace(/^\.?\//, '')}`;
}

/** 解析 YAML frontmatter 为简单对象（仅取 title / description / layout 等顶层标量，不做完整 YAML 解析） */
export function parseFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const block = m[1];
  const out = {};
  for (const line of block.split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
    if (!kv) continue;
    const [, k, v] = kv;
    // 去引号
    let val = v.trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // 仅保留顶层标量字段，跳过块字段（hero: / features: 等由专用解析器处理）
    if (['title', 'description', 'layout', 'outline', 'lastUpdated'].includes(k)) {
      out[k] = val;
    }
  }
  return out;
}

/** 提取第一个 H1 文本 */
export function extractH1(md) {
  const m = md.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : '';
}

/** 提取第一段纯文本作为描述（去掉 markdown 标记） */
export function extractFirstParagraph(md) {
  const lines = md.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('#')) continue;
    if (t.startsWith('>')) continue;
    if (t.startsWith('|')) continue;
    if (t.startsWith('```')) continue;
    if (/^[-*+]/.test(t)) continue;
    if (/^</.test(t)) continue;
    // 去掉行内 markdown 语法
    const text = t
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      .trim();
    if (text.length >= 8) {
      return text.length > 200 ? text.slice(0, 200) + '…' : text;
    }
  }
  return '';
}

function basenameNoExt(p) {
  const base = posix.basename(p);
  return base.replace(/\.\w+$/, '');
}

/**
 * 处理 Vue 组件：
 *  - 自闭合组件（<Foo />）→ 替换为 [组件占位说明]
 *  - 容器型组件（<Foo>...</Foo>）→ 提取内部文本 + 在前补注释
 * 保留代码块（```）内的 Vue 标签原样不动
 */
export function processVueComponents(md) {
  // 暂时把代码块占位，避免误伤
  const placeholders = [];
  md = md.replace(/```[\s\S]*?```/g, (m) => {
    placeholders.push(m);
    return `\u0000CODEBLOCK${placeholders.length - 1}\u0000`;
  });

  // 容器型组件：<Tag ...>内容</Tag>
  md = md.replace(/<([A-Z][\w-]*)([^>]*)>([\s\S]*?)<\/\1>/g, (_, tag, attrs, inner) => {
    const text = inner
      .replace(/<[^>]+>/g, '')
      .replace(/\n{2,}/g, '\n\n')
      .trim();
    const attrStr = extractComponentAttrs(attrs);
    const header = `> [Vue 组件: ${tag}${attrStr}]`;
    return text ? `${header}\n\n${text}` : header;
  });

  // 自闭合组件：<Tag ... />
  md = md.replace(/<([A-Z][\w-]*)([^/>]*)\/>/g, (_, tag, attrs) => {
    const attrStr = extractComponentAttrs(attrs);
    return `> [Vue 组件: ${tag}${attrStr} —— 内容由前端动态渲染，请访问 HTML 页面查看]`;
  });

  // 剥离剩余的 HTML 行内标签（如 <ClientOnly>），保留内容
  md = md.replace(/<[a-zA-Z][^>]*>([\s\S]*?)<\/[a-zA-Z][^>]*>/g, '$1');
  md = md.replace(/<[a-zA-Z][^/>]*\/>/g, '');

  // 还原代码块
  md = md.replace(/\u0000CODEBLOCK(\d+)\u0000/g, (_, i) => placeholders[Number(i)]);

  return md;
}

/** 提取 Vue 组件属性中的 title / link / icon 等关键字段用于占位 */
function extractComponentAttrs(attrs) {
  const out = [];
  const titleM = attrs.match(/\btitle\s*=\s*"([^"]*)"/);
  if (titleM) out.push(`title="${titleM[1]}"`);
  const linkM = attrs.match(/\blink\s*=\s*"([^"]*)"/);
  if (linkM) out.push(`link="${linkM[1]}"`);
  const iconM = attrs.match(/\bicon\s*=\s*"([^"]*)"/);
  if (iconM) out.push(`icon="${iconM[1]}"`);
  return out.length ? ` ${out.join(' ')}` : '';
}

// ============================================================
// 文件扫描
// ============================================================

/** 递归扫描目录下的 .md 文件，返回相对 ROOT 的 posix 路径列表 */
export function scanMarkdownFiles(rootDir, excludeDirs = EXCLUDE_DIRS) {
  const results = [];
  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      // 跳过隐藏文件 / 目录与排除目录
      if (excludeDirs.has(name)) continue;
      if (name.startsWith('.') && !excludeDirs.has(name)) {
        // 其他隐藏文件（如 .gitignore）也跳过
        continue;
      }
      const full = join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        walk(full);
      } else if (st.isFile() && extname(name).toLowerCase() === '.md') {
        const rel = relative(rootDir, full);
        results.push(sourceRelPosix(rel));
      }
    }
  }
  walk(rootDir);
  return results.sort();
}

/** 按分区分组 markdown 文件 */
function groupBySection(files) {
  const groups = { root: [] };
  for (const sec of SECTIONS) groups[sec.name] = [];
  for (const f of files) {
    const top = f.split('/')[0];
    if (groups[top]) groups[top].push(f);
    else groups.root.push(f);
  }
  return groups;
}

// ============================================================
// 索引生成
// ============================================================

/** 构建每个页面的索引条目（链接 + 描述） */
function buildIndexEntries(sectionFiles, cleanedCache) {
  return sectionFiles
    .map((rel) => {
      const c = cleanedCache.get(rel);
      if (!c) return null;
      const url = pageUrl(rel);
      const mdUrl = `${url}${url.endsWith('/') ? 'index.md' : '.md'}`;
      const desc = c.description || c.title;
      return {
        rel,
        url,
        mdUrl,
        title: c.title,
        description: desc,
      };
    })
    .filter(Boolean);
}

/** 生成主 llms.txt 内容 */
function buildRootLlmsTxt(sectionEntries, rootEntries, buildMeta) {
  const lines = [];

  // H1 —— 站点名（必填）
  lines.push(`# ${SITE_TITLE}`);
  lines.push('');

  // Blockquote —— 站点摘要
  lines.push(`> 锐界幻境（MiragEdge）是一个基于 Minecraft Java 26.2 高版本的 Java/基岩互通公益生存服务器。`);
  lines.push(`> 本文档中心（${SITE_HOST}）由 F.windEmiko（狐风轩汐）维护，提供玩家入服指南、玩法系统介绍（经济 / 领地 / 钓鱼 / 季节 / 食物 / 附魔 / 装备锻造 / 数据包玩法）、原创 Bukkit 插件文档与服务器开发协作规范，使用简体中文撰写。`);
  lines.push(`> 内容面向 LLM 推理场景，可通过本文件下方的链接访问清洗后的 Markdown 版本，亦可通过 /llms-full.txt 获取全站内容拼接快照。`);
  lines.push('');

  // 详细信息段落
  lines.push(`站点语言：简体中文（zh-CN）`);
  lines.push(`站点地址：${SITE_HOST}`);
  lines.push(`维护者：F.windEmiko（狐风轩汐）`);
  lines.push(`构建版本：${buildMeta.buildId} / ${buildMeta.buildSha || '-'}`);
  lines.push(`生成时间：${buildMeta.builtAt}`);
  lines.push('');

  lines.push(`文档分区结构：`);
  for (const s of SECTIONS) {
    lines.push(`- ${s.title}（/${s.name}/）：${s.description}`);
  }
  lines.push('');

  lines.push(`阅读指引：`);
  lines.push(`- 每个分区根目录下均有该分区的 llms.txt，仅列出该分区页面`);
  lines.push(`- 每个 HTML 页面同 URL 后追加 .md 即可获取该页清洗后的 Markdown 版本`);
  lines.push(`- /llms-full.txt 为全站页面 Markdown 拼接，适合一次性载入大上下文窗口`);
  lines.push(`- 路径中 index.md 对应 HTML 索引页（如 /manual/ 对应 /manual/index.md）`);
  lines.push('');

  // 各分区 H2 + 文件清单
  for (const sec of SECTIONS) {
    const entries = sectionEntries[sec.name] || [];
    if (!entries.length) continue;
    lines.push(`## ${sec.title}`);
    lines.push('');
    for (const e of entries) {
      lines.push(`- [${e.title}](${e.mdUrl}): ${e.description}`);
    }
    lines.push('');
  }

  // 根目录零散页面（如有）
  if (rootEntries.length) {
    lines.push(`## 其他`);
    lines.push('');
    for (const e of rootEntries) {
      lines.push(`- [${e.title}](${e.mdUrl}): ${e.description}`);
    }
    lines.push('');
  }

  // Optional —— 次要信息，LLM 在短上下文场景下可跳过
  lines.push(`## Optional`);
  lines.push('');
  lines.push(`- [全站内容拼接快照](${SITE_HOST}/llms-full.txt): 所有页面清洗后 Markdown 拼接，文件较大，仅在需要一次性载入全站内容时访问`);
  lines.push(`- [GitHub 仓库](https://github.com/fwindemiko/MiragEdge-DocWeb): 源码与历史版本`);
  lines.push(`- [狐风轩汐の小窝 Blog](https://f.windemiko.top): 服主个人博客`);
  lines.push(`- [哔哩哔哩 - 狐风轩汐](https://space.bilibili.com/359174372): 官方视频内容`);
  lines.push('');

  return lines.join('\n');
}

/** 生成分区 llms.txt 内容 */
function buildSectionLlmsTxt(section, entries, buildMeta) {
  const lines = [];
  lines.push(`# ${SITE_TITLE} · ${section.title}`);
  lines.push('');
  lines.push(`> ${section.description}。`);
  lines.push(`> 本文件仅列出 /${section.name}/ 分区下的页面；全站索引见 ${SITE_HOST}/llms.txt。`);
  lines.push('');
  lines.push(`分区路径：/${section.name}/`);
  lines.push(`页面数量：${entries.length}`);
  lines.push(`生成时间：${buildMeta.builtAt}`);
  lines.push('');

  lines.push(`## ${section.title}`);
  lines.push('');
  for (const e of entries) {
    lines.push(`- [${e.title}](${e.mdUrl}): ${e.description}`);
  }
  lines.push('');

  lines.push(`## Optional`);
  lines.push('');
  lines.push(`- [全站索引](${SITE_HOST}/llms.txt): 全站所有分区的页面索引`);
  lines.push(`- [全站全文](${SITE_HOST}/llms-full.txt): 全站内容拼接快照`);
  lines.push('');

  return lines.join('\n');
}

/** 生成 llms-full.txt 全文内容 */
function buildFullLlmsTxt(allPagesInOrder) {
  const lines = [];
  lines.push(`# ${SITE_TITLE} 全站内容快照`);
  lines.push('');
  lines.push(`> 本文件由 /llms.txt 索引展开而来，按分区顺序拼接所有页面的清洗后 Markdown，`);
  lines.push(`> 用于一次性载入 LLM 大上下文窗口。每个页面以 H1 + 来源 URL 注释起始。`);
  lines.push(`> 站点地址：${SITE_HOST}`);
  lines.push('');
  lines.push(`---`);
  lines.push('');

  for (const page of allPagesInOrder) {
    lines.push(`<!-- 来源: ${page.url} -->`);
    lines.push(`<!-- 清洗版: ${page.mdUrl} -->`);
    lines.push('');
    lines.push(`# ${page.title}`);
    lines.push('');
    if (page.description && page.description !== page.title) {
      lines.push(`> ${page.description}`);
      lines.push('');
    }
    lines.push(page.body.trim());
    lines.push('');
    lines.push(`---`);
    lines.push('');
  }

  return lines.join('\n');
}

/** 生成单个页面的清洗版 .md 内容 */
function buildPageMarkdown(page) {
  const lines = [];
  lines.push(`<!-- 来源页面: ${page.url} -->`);
  lines.push(`<!-- 由 llms.txt 标准生成器自动产出，源文件: ${page.rel} -->`);
  lines.push('');
  lines.push(page.body.trim());
  lines.push('');
  return lines.join('\n');
}

// ============================================================
// 文件写入
// ============================================================

function safeWrite(filePath, content) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
}

/** 在 public/ 下删除旧的 llms 产物，避免残留 */
function cleanOldOutputs() {
  // 顶层
  for (const f of ['llms.txt', 'llms-full.txt']) {
    const p = join(PUBLIC, f);
    if (existsSync(p)) rmSync(p, { force: true });
  }
  // 各分区 llms.txt 与每页 .md
  for (const sec of SECTIONS) {
    const secDir = join(PUBLIC, sec.name);
    if (existsSync(secDir)) {
      // 仅删除 llms.txt 与递归 .md（保留其他静态资源如图片）
      removeGeneratedFiles(secDir);
    }
  }
  // 根 index.md（首页清洗版）
  const rootIndexMd = join(PUBLIC, 'index.md');
  if (existsSync(rootIndexMd)) rmSync(rootIndexMd, { force: true });
}

function removeGeneratedFiles(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      removeGeneratedFiles(full);
    } else if (name === 'llms.txt' || (name.endsWith('.md') && isGeneratedMd(full))) {
      rmSync(full, { force: true });
    }
  }
}

/** 通过文件首行注释判断 .md 是否由本脚本生成 */
function isGeneratedMd(filePath) {
  try {
    const head = readFileSync(filePath, 'utf8').slice(0, 200);
    return head.includes('llms.txt 标准生成器自动产出') || head.includes('来源页面:');
  } catch {
    return false;
  }
}

// ============================================================
// 主入口
// ============================================================

export function generateLlms(options = {}) {
  const { checkOnly = false } = options;
  const buildMeta = {
    buildId: process.env.GITHUB_RUN_NUMBER || 'dev',
    buildSha: process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : '',
    builtAt: new Date().toISOString(),
  };

  // 1. 扫描所有 markdown 文件
  const allFiles = scanMarkdownFiles(SRC_ROOT);
  if (!allFiles.length) {
    throw new Error('[generate-llms] 未扫描到任何 markdown 文件，请检查 SRC_ROOT 配置');
  }

  // 2. 清洗所有文件
  const cleaned = new Map();
  const failures = [];
  for (const rel of allFiles) {
    const full = join(SRC_ROOT, rel);
    try {
      const raw = readFileSync(full, 'utf8');
      const c = cleanMarkdown(raw, rel);
      cleaned.set(rel, c);
    } catch (e) {
      failures.push({ rel, error: e.message });
    }
  }
  if (failures.length) {
    console.warn(`[generate-llms] ${failures.length} 个文件清洗失败：`);
    for (const f of failures.slice(0, 5)) console.warn(`  - ${f.rel}: ${f.error}`);
  }

  // 3. 按分区分组
  const groups = groupBySection(allFiles);
  const sectionEntries = {};
  for (const sec of SECTIONS) {
    sectionEntries[sec.name] = buildIndexEntries(groups[sec.name] || [], cleaned);
  }
  const rootEntries = buildIndexEntries(groups.root || [], cleaned);

  // 4. 收集全站页面（按 SECTIONS 顺序 + 根页面）
  const allPagesInOrder = [];
  for (const sec of SECTIONS) {
    for (const e of sectionEntries[sec.name]) {
      allPagesInOrder.push({ ...e, body: cleaned.get(e.rel).body });
    }
  }
  for (const e of rootEntries) {
    allPagesInOrder.push({ ...e, body: cleaned.get(e.rel).body });
  }

  if (checkOnly) {
    return {
      totalFiles: allFiles.length,
      cleanedCount: cleaned.size,
      failures,
      sectionCounts: Object.fromEntries(SECTIONS.map((s) => [s.name, sectionEntries[s.name].length])),
      rootCount: rootEntries.length,
    };
  }

  // 5. 清理旧产物
  cleanOldOutputs();

  // 6. 写主索引
  const rootIndex = buildRootLlmsTxt(sectionEntries, rootEntries, buildMeta);
  safeWrite(join(PUBLIC, 'llms.txt'), rootIndex);

  // 7. 写全文快照
  const fullSnapshot = buildFullLlmsTxt(allPagesInOrder);
  safeWrite(join(PUBLIC, 'llms-full.txt'), fullSnapshot);

  // 8. 写各分区索引
  for (const sec of SECTIONS) {
    const entries = sectionEntries[sec.name];
    if (!entries.length) continue;
    const content = buildSectionLlmsTxt(sec, entries, buildMeta);
    safeWrite(join(PUBLIC, sec.name, 'llms.txt'), content);
  }

  // 9. 写每页清洗版 .md
  let pageMdCount = 0;
  for (const page of allPagesInOrder) {
    // 计算 public 下的目标路径：保留源 posix 相对路径
    const targetRel = sourceRelPosix(page.rel);
    const target = join(PUBLIC, targetRel);
    safeWrite(target, buildPageMarkdown(page));
    pageMdCount++;
  }

  return {
    totalFiles: allFiles.length,
    cleanedCount: cleaned.size,
    failures,
    sectionCounts: Object.fromEntries(SECTIONS.map((s) => [s.name, sectionEntries[s.name].length])),
    rootCount: rootEntries.length,
    pageMdCount,
    fullSnapshotBytes: Buffer.byteLength(fullSnapshot, 'utf8'),
  };
}

// ============================================================
// CLI 入口
// ============================================================

function main() {
  const argv = process.argv.slice(2);
  const checkOnly = argv.includes('--check');
  console.log('[generate-llms] 开始生成 LLMs.txt 标准产物...');
  const result = generateLlms({ checkOnly });
  if (checkOnly) {
    console.log('[generate-llms] 校验完成（未写文件）：');
  } else {
    console.log('[generate-llms] 生成完成：');
  }
  console.log(`  扫描文件: ${result.totalFiles}`);
  console.log(`  清洗成功: ${result.cleanedCount}`);
  console.log(`  失败文件: ${result.failures.length}`);
  for (const [sec, n] of Object.entries(result.sectionCounts)) {
    console.log(`  /${sec}/ 分区: ${n} 页`);
  }
  console.log(`  根目录页面: ${result.rootCount}`);
  if (!checkOnly) {
    console.log(`  生成清洗版 .md: ${result.pageMdCount} 个`);
    console.log(`  llms-full.txt 体积: ${(result.fullSnapshotBytes / 1024).toFixed(1)} KB`);
    console.log(`  产物目录: ${relative(ROOT, PUBLIC)}`);
  }
}

// 仅在被直接执行时运行 main（被 import 时不运行）
const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main();
}
