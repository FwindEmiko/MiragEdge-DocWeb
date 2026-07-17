// .vitepress/config.mts
import { defineConfig } from "file:///F:/MiragEdge-DocWeb/node_modules/.pnpm/vitepress@1.6.4_@algolia+cl_dd639399dea7f91bfa5f38b2a56cf067/node_modules/vitepress/dist/node/index.js";
import { MermaidPlugin, MermaidMarkdown } from "file:///F:/MiragEdge-DocWeb/node_modules/.pnpm/vitepress-plugin-mermaid@2._2f3cda3c6530bb3a768e7b79ecb13042/node_modules/vitepress-plugin-mermaid/dist/vitepress-plugin-mermaid.es.mjs";

// .vitepress/theme/addContributors.ts
import simpleGit from "file:///F:/MiragEdge-DocWeb/node_modules/.pnpm/simple-git@3.36.0/node_modules/simple-git/dist/esm/index.js";
import { Octokit } from "file:///F:/MiragEdge-DocWeb/node_modules/.pnpm/@octokit+rest@22.0.1/node_modules/@octokit/rest/dist-src/index.js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "file:///F:/MiragEdge-DocWeb/node_modules/.pnpm/dotenv@17.4.2/node_modules/dotenv/lib/main.js";
import { execSync } from "child_process";
dotenv.config();
var owner = "fwindemiko";
var repo = "MiragEdge-DocWeb";
var git = simpleGit();
var ghToken = process.env.GITHUB_TOKEN;
if (!ghToken) {
  try {
    ghToken = execSync("gh auth token", { encoding: "utf-8" }).trim();
  } catch {
  }
}
var octokit = new Octokit({
  auth: ghToken
});
async function getRepoContributors() {
  try {
    const rawOutput = await git.raw(["log", "--format=%ae %H"]);
    const logLines = rawOutput.split("\n").filter((line) => line.trim());
    if (logLines.length === 0) {
      console.warn("No commits found in repository");
      return [];
    }
    const contributors = /* @__PURE__ */ new Map();
    logLines.reverse().forEach((commit) => {
      const [email, sha1] = commit.split(" ");
      if (email && sha1 && !contributors.has(email)) {
        contributors.set(email, sha1);
      }
    });
    return Array.from(contributors).map(([email, sha1]) => ({
      email: email.trim(),
      sha1
    }));
  } catch (error) {
    console.error("Error getting repo contributors:", error);
    return [];
  }
}
async function queryUsername({ email, sha1 }, octokit2) {
  try {
    const commitData = await octokit2.rest.repos.getCommit({
      owner,
      repo,
      ref: sha1
    });
    const author = commitData.data?.author;
    if (!author || !author.login) {
      console.warn(`No GitHub author found for email: ${email}, sha1: ${sha1}`);
      return null;
    }
    return {
      email: email.trim(),
      username: author.login
    };
  } catch (error) {
    console.error(`Error querying username for ${email}:`, error);
    return null;
  }
}
async function queryFullDataList(emailTuples, octokit2) {
  try {
    const user2emails = /* @__PURE__ */ new Map();
    emailTuples.forEach(({ email, username }) => {
      if (user2emails.has(username)) {
        user2emails.get(username).push(email);
      } else {
        user2emails.set(username, [email]);
      }
    });
    const fullDataPromises = Array.from(user2emails.entries()).map(
      async ([username, emails]) => {
        try {
          const userData = await octokit2.rest.users.getByUsername({ username });
          return {
            username,
            nickname: userData.data.name || username,
            avatar: userData.data.avatar_url,
            emails
          };
        } catch (error) {
          console.error(`Error getting user data for ${username}:`, error);
          return {
            username,
            nickname: username,
            avatar: `https://github.com/${username}.png`,
            emails
          };
        }
      }
    );
    return await Promise.all(fullDataPromises);
  } catch (error) {
    console.error("Error querying full data list:", error);
    return [];
  }
}
async function getEmailList(filePath) {
  try {
    const rawOutput = await git.raw(["log", "--format=%ae", "--follow", "--no-merges", filePath]);
    const logLines = rawOutput.split("\n").filter((email) => email && email.trim() !== "");
    if (logLines.length === 0) {
      console.log(`No contributors found for file: ${filePath}`);
      return [];
    }
    return Array.from(new Set(logLines.map((email) => email.trim())));
  } catch (error) {
    console.error(`Error getting email list for ${filePath}:`, error);
    return [];
  }
}
async function getAllContributors() {
  console.log("Starting to fetch contributor information...");
  const emailSha1List = await getRepoContributors();
  console.log(`Found ${emailSha1List.length} unique contributor emails`);
  if (emailSha1List.length === 0) {
    return [];
  }
  console.log("Querying GitHub usernames...");
  const usernamePromises = emailSha1List.map(
    (item) => queryUsername(item, octokit)
  );
  const usernameResults = await Promise.all(usernamePromises);
  const validUsernameResults = usernameResults.filter(
    (result) => result !== null
  );
  console.log(`Resolved ${validUsernameResults.length} GitHub usernames`);
  console.log("Fetching full user data...");
  const fullContributorData = await queryFullDataList(
    validUsernameResults,
    octokit
  );
  console.log(`Successfully fetched data for ${fullContributorData.length} contributors`);
  return fullContributorData;
}
function isHomePage(code, id) {
  if (code.includes("layout: home")) {
    return true;
  }
  return false;
}
async function fetchAndSaveActivityData(emailMap) {
  const outputPath = path.resolve(process.cwd(), "public", "data", "contributors-activity.json");
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  try {
    const rawLog = execSync('git log --format="%ae %at" --since="3 months ago" --no-merges', { encoding: "utf-8" });
    const lines = rawLog.trim().split("\n").filter(Boolean);
    const emailCommits = {};
    const emailTotals = {};
    for (const line of lines) {
      const [email, ts] = line.split(" ");
      const t = parseInt(ts, 10);
      if (!email || isNaN(t)) continue;
      const d = new Date(t * 1e3);
      const day = d.getDay();
      const monOffset = day === 0 ? 6 : day - 1;
      const monday = new Date(d);
      monday.setDate(d.getDate() - monOffset);
      monday.setHours(0, 0, 0, 0);
      const weekTs = Math.floor(monday.getTime() / 1e3);
      if (!emailCommits[email]) {
        emailCommits[email] = [];
        emailTotals[email] = 0;
      }
      emailTotals[email]++;
      const existing = emailCommits[email].find((w) => w.w === weekTs);
      if (existing) {
        existing.c++;
      } else {
        emailCommits[email].push({ w: weekTs, c: 1 });
      }
    }
    for (const email of Object.keys(emailCommits)) {
      emailCommits[email].sort((a, b) => a.w - b.w);
    }
    const merged = /* @__PURE__ */ new Map();
    for (const [email, weeks] of Object.entries(emailCommits)) {
      const username = emailMap[email] || email.split("@")[0];
      if (!merged.has(username)) {
        merged.set(username, { login: username, total: 0, weeks: /* @__PURE__ */ new Map() });
      }
      const entry = merged.get(username);
      entry.total += emailTotals[email];
      for (const w of weeks) {
        entry.weeks.set(w.w, (entry.weeks.get(w.w) || 0) + w.c);
      }
    }
    const result = [];
    for (const entry of merged.values()) {
      const weeksArr = [];
      for (const [w, c] of entry.weeks) {
        weeksArr.push({ w, c });
      }
      weeksArr.sort((a, b) => a.w - b.w);
      result.push({
        author: { login: entry.login },
        total: entry.total,
        weeks: weeksArr
      });
    }
    result.sort((a, b) => b.total - a.total);
    fs.writeFileSync(outputPath, JSON.stringify(result), "utf-8");
    console.log("[activity] Saved " + result.length + " contributors (" + lines.length + " commits) from git log");
  } catch (error) {
    console.warn("[activity] Failed:", error.message);
    try {
      fs.writeFileSync(outputPath, JSON.stringify([]), "utf-8");
    } catch {
    }
  }
}
function addContributorsPlugin() {
  let fullContributorData = [];
  let dataLoaded = false;
  return {
    name: "vite-plugin-contributors",
    enforce: "pre",
    async buildStart() {
      if (!dataLoaded) {
        console.log("Loading contributor data...");
        fullContributorData = await getAllContributors();
        const emailMap = {};
        for (const c of fullContributorData) {
          for (const email of c.emails) {
            emailMap[email] = c.username;
          }
        }
        await fetchAndSaveActivityData(emailMap);
        dataLoaded = true;
      }
    },
    async transform(code, id) {
      if (!id.endsWith(".md")) {
        return null;
      }
      if (isHomePage(code, id)) {
        console.log(`\u63D2\u4EF6: \u8DF3\u8FC7\u9996\u9875\u6587\u4EF6 ${id}`);
        return code;
      }
      try {
        const filePath = id.replace(process.cwd(), "").replace(/^\//, "");
        const emailList = await getEmailList(filePath);
        if (emailList.length === 0) {
          return code;
        }
        const fileContributors = emailList.map(
          (email) => fullContributorData.find(
            (contributor) => contributor.emails.includes(email)
          )
        ).filter(
          (contributor) => contributor !== void 0
        ).filter(
          (contributor, index, array) => array.findIndex((c) => c.username === contributor.username) === index
        );
        if (fileContributors.length === 0) {
          return code;
        }
        const contributorList = fileContributors.map((contributor) => `${contributor.nickname},${contributor.username}`).join(";");
        const hasFrontmatter = code.trim().startsWith("---");
        if (hasFrontmatter) {
          const frontmatterEnd = code.indexOf("---", 3);
          if (frontmatterEnd !== -1) {
            const frontmatter = code.slice(0, frontmatterEnd + 3);
            const content = code.slice(frontmatterEnd + 3);
            if (frontmatter.includes("contributors:")) {
              return code;
            }
            const lastDashIndex = frontmatter.lastIndexOf("---");
            if (lastDashIndex !== -1) {
              const beforeDash = frontmatter.slice(0, lastDashIndex);
              const afterDash = frontmatter.slice(lastDashIndex);
              return `${beforeDash.trim()}
contributors: ${contributorList}
${afterDash}${content}`;
            }
          }
        }
        return `---
contributors: ${contributorList}
---

${code}`;
      } catch (error) {
        console.error(`Error processing file ${id}:`, error);
        return code;
      }
    }
  };
}

// .vitepress/config.mts
import path2 from "node:path";
import fs2 from "node:fs";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///F:/MiragEdge-DocWeb/.vitepress/config.mts";
var __dirname = path2.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var SITE_HOST = "https://miragedge.top";
var SITE_TITLE = "MiragEdge \u6587\u6863\u4E2D\u5FC3";
var SITE_DESCRIPTION = "\u9510\u754C\u5E7B\u5883 Minecraft \u4E92\u901A\u751F\u5B58\u670D\u52A1\u5668\u5B98\u65B9\u6587\u6863\u4E2D\u5FC3\uFF0C\u63D0\u4F9B\u73A9\u5BB6\u6307\u5357\u3001\u73A9\u6CD5\u4ECB\u7ECD\u3001\u9644\u9B54\u56FE\u9274\u3001\u9493\u9C7C/\u5B63\u8282/\u98DF\u7269\u7CFB\u7EDF\u3001\u5F00\u53D1\u6559\u7A0B\u4E0E\u539F\u521B\u63D2\u4EF6\u6587\u6863\u3002";
var SITE_OG_IMAGE = `${SITE_HOST}/title_img/xingjiu.png`;
var config_default = defineConfig({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // 基础路径，如果部署在子路径下需要设置
  base: "/",
  // 输出目录
  outDir: ".vitepress/dist",
  // 语言配置
  locales: {
    root: {
      label: "\u4E2D\u6587",
      lang: "zh-CN",
      description: SITE_DESCRIPTION
    }
  },
  // 头部配置
  head: [
    ["link", { rel: "icon", href: "/title_img/favicon-32x32.png", sizes: "32x32" }],
    ["link", { rel: "icon", href: "/title_img/favicon-16x16.png", sizes: "16x16" }],
    ["link", { rel: "apple-touch-icon", href: "/title_img/apple-touch-icon.png", sizes: "180x180" }],
    ["link", { rel: "manifest", href: "/site.webmanifest" }],
    // 预连接关键第三方域名，加速 OG 图片与字体加载
    ["link", { rel: "preconnect", href: "https://oss.miragedge.top" }],
    ["meta", { name: "theme-color", content: "#3c8772" }],
    // 构建版本标识：注入到每个 HTML 的 <head>，供前端版本检测对比 /version.json
    // 值与 vite define 中的 __BUILD_ID__ / __BUILD_SHA__ 保持一致（构建时求值）
    // 用于 ESA 边缘缓存场景下检测旧 HTML 并触发自动刷新
    ["meta", { name: "x-build-id", content: process.env.GITHUB_RUN_NUMBER || "dev" }],
    ["meta", { name: "x-build-sha", content: process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : "" }],
    // 移除 maximum-scale/user-scalable=no（违反 WCAG 1.4.4，阻止视力不佳用户缩放）
    // 启用 viewport-fit=cover 让安全区 env(safe-area-inset-*) 生效（iPhone 刘海/Home Indicator）
    ["meta", { name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=cover" }],
    // 全局关键词：覆盖品牌词、品类词、玩法词、技术词，提升长尾检索命中率
    ["meta", { name: "keywords", content: "MiragEdge, \u9510\u754C\u5E7B\u5883, Minecraft, \u6211\u7684\u4E16\u754C, \u6211\u7684\u4E16\u754C\u670D\u52A1\u5668, \u751F\u5B58\u670D\u52A1\u5668, \u4E92\u901A\u670D\u52A1\u5668, Java\u7248, \u57FA\u5CA9\u7248, 1.21, \u6587\u6863, \u73A9\u5BB6\u624B\u518C, \u5165\u670D\u6559\u7A0B, \u9644\u9B54, \u66F4\u591A\u9644\u9B54, \u9493\u9C7C, \u5B63\u8282\u7CFB\u7EDF, \u98DF\u7269, \u7ECF\u6D4E\u7CFB\u7EDF, \u9886\u5730, PVP, \u63D2\u4EF6, \u72D0\u98CE\u8F69\u6C50, FwindEmi, F.windEmiko, Aiyatsbus, EvenMoreFish, CustomCrops" }],
    ["meta", { name: "author", content: "F.windEmiko (\u72D0\u98CE\u8F69\u6C50)" }],
    ["meta", { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" }],
    ["meta", { name: "language", content: "zh-CN" }],
    ["meta", { name: "referrer", content: "strict-origin-when-cross-origin" }],
    // Open Graph：使用绝对地址，确保社交平台/搜索引擎正确抓取卡片
    ["meta", { property: "og:site_name", content: SITE_TITLE }],
    ["meta", { property: "og:title", content: SITE_TITLE }],
    ["meta", { property: "og:description", content: SITE_DESCRIPTION }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:image", content: SITE_OG_IMAGE }],
    ["meta", { property: "og:image:alt", content: "\u9510\u754C\u5E7B\u5883 MiragEdge \u6587\u6863\u4E2D\u5FC3" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { property: "og:url", content: SITE_HOST }],
    ["meta", { property: "og:locale", content: "zh_CN" }],
    // Twitter Card
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: SITE_OG_IMAGE }],
    ["meta", { name: "twitter:image:alt", content: "\u9510\u754C\u5E7B\u5883 MiragEdge \u6587\u6863\u4E2D\u5FC3" }],
    ["meta", { name: "twitter:creator", content: "@MiragEdge" }],
    ["meta", { name: "twitter:site", content: "@MiragEdge" }],
    // JSON-LD 结构化数据：WebSite schema，帮助搜索引擎理解站点结构并启用站内搜索框 (Sitelinks Search Box)
    ["script", { type: "application/ld+json" }, JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": SITE_TITLE,
      "alternateName": "\u9510\u754C\u5E7B\u5883\u6587\u6863",
      "url": SITE_HOST,
      "description": SITE_DESCRIPTION,
      "inLanguage": "zh-CN",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${SITE_HOST}/?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    })],
    // 页面特效开关：在 Vue 水合前同步读取 localStorage 并设置 effects-disabled 类
    // 避免刷新后开关显示与实际状态不一致的问题
    ["script", {}, `(
      function() {
        try {
          var stored = localStorage.getItem('miragedge-effects-enabled');
          var isMobile = window.innerWidth <= 767;
          var enabled = stored === null ? !isMobile : stored === 'true';
          if (!enabled) document.documentElement.classList.add('effects-disabled');
        } catch(e) {}
      }
    )()`]
    // 百度站点验证（如果需要）
    // ['meta', { name: 'baidu-site-verification', content: 'code-xxxxxxxx' }],
    // 360站点验证（如果需要）
    // ['meta', { name: '360-site-verification', content: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }],
  ],
  // 自动注入每页 SEO：canonical / og:url / og:title / og:description / description / article meta
  // 通过 transformHead 钩子基于 pageData 动态生成，避免在每个 md frontmatter 重复配置
  transformHead(context) {
    const page = context.pageData;
    const rawRel = (page.relativePath || "").replace(/\\/g, "/");
    let relPath = rawRel.replace(/\.md$/, "").replace(/(^|\/)index$/, "$1");
    const canonicalUrl = relPath ? `${SITE_HOST}/${relPath}` : `${SITE_HOST}/`;
    const pageTitle = page.frontmatter.title ? `${page.frontmatter.title} | ${SITE_TITLE}` : page.title ? `${page.title} | ${SITE_TITLE}` : SITE_TITLE;
    const pageDescription = page.frontmatter.description || page.description || SITE_DESCRIPTION;
    const isArticle = !page.frontmatter.layout && rawRel !== "index.md" && rawRel !== "";
    const tags = [
      // canonical：避免重复内容惩罚，统一权重到规范 URL
      ["link", { rel: "canonical", href: canonicalUrl }],
      // 每页覆盖 og 标签，确保社交分享卡片准确
      ["meta", { property: "og:url", content: canonicalUrl }],
      ["meta", { property: "og:title", content: pageTitle }],
      ["meta", { property: "og:description", content: pageDescription }],
      ["meta", { name: "twitter:title", content: pageTitle }],
      ["meta", { name: "twitter:description", content: pageDescription }]
    ];
    if (isArticle) {
      tags.push(["meta", { property: "og:type", content: "article" }]);
      tags.push(["meta", { property: "article:author", content: "F.windEmiko (\u72D0\u98CE\u8F69\u6C50)" }]);
      tags.push(["meta", { property: "article:section", content: "\u9510\u754C\u5E7B\u5883\u6587\u6863" }]);
      if (page.frontmatter.lastUpdated) {
        tags.push(["meta", { property: "article:modified_time", content: new Date(page.frontmatter.lastUpdated).toISOString() }]);
      }
    } else {
      tags.push(["meta", { property: "og:type", content: "website" }]);
    }
    if (relPath) {
      const segments = relPath.split("/").filter(Boolean);
      const itemList = [{
        "@type": "ListItem",
        position: 1,
        name: "\u9996\u9875",
        item: SITE_HOST
      }];
      let acc = "";
      segments.forEach((seg, idx) => {
        acc += "/" + seg;
        const name = page.frontmatter.title || decodeURIComponent(seg);
        itemList.push({
          "@type": "ListItem",
          position: idx + 2,
          name,
          item: `${SITE_HOST}${acc}`
        });
      });
      tags.push(["script", { type: "application/ld+json" }, JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: itemList
      })]);
    }
    return tags;
  },
  // 自动补全页面描述：当 md 未声明 description 时，从源文件正文首段提取摘要作为 meta description
  // 提取规则：跳过 frontmatter / 代码块 / Vue 组件标签 / 引用块，取第一段纯文本，截断到约 150 字
  transformPageData(pageData, ctx) {
    if (pageData.frontmatter.description) {
      pageData.description = pageData.frontmatter.description;
      return;
    }
    const rel = (pageData.relativePath || "").replace(/\\/g, "/");
    if (!rel) return;
    const srcDir = ctx?.siteConfig?.srcDir || process.cwd();
    const fullPath = path2.resolve(srcDir, rel);
    let raw = "";
    try {
      raw = fs2.readFileSync(fullPath, "utf-8");
    } catch {
      return;
    }
    raw = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
    const lines = raw.split(/\r?\n/);
    let desc = "";
    let inCodeFence = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("```")) {
        inCodeFence = !inCodeFence;
        continue;
      }
      if (inCodeFence) continue;
      if (!trimmed) continue;
      if (trimmed.startsWith("#")) continue;
      if (trimmed.startsWith(">")) continue;
      if (trimmed.startsWith("<")) continue;
      if (trimmed.startsWith(":::")) continue;
      if (/^[-*+\d]/.test(trimmed)) continue;
      const text = trimmed.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/!\[[^\]]*\]\([^)]+\)/g, "").trim();
      if (text.length >= 8) {
        desc = text;
        break;
      }
    }
    if (desc) {
      pageData.description = desc.length > 150 ? desc.slice(0, 150) + "\u2026" : desc;
      pageData.frontmatter.description = pageData.description;
    }
  },
  // Markdown 配置
  markdown: {
    theme: {
      light: "vitesse-light",
      dark: "vitesse-dark"
    },
    lineNumbers: true,
    // 显示代码行号
    config(md) {
      md.use(MermaidMarkdown);
      const defaultImage = md.renderer.rules.image;
      md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (token.attrIndex("loading") < 0) token.attrPush(["loading", "lazy"]);
        return defaultImage(tokens, idx, options, env, self);
      };
      const fence = md.renderer.rules.fence;
      md.renderer.rules.fence = (...args) => {
        const [tokens, idx] = args;
        const token = tokens[idx];
        const info = token.info.trim();
        if (!info.startsWith("mcfunction")) return fence(...args);
        token.info = info.replace("mcfunction", "bash");
        let html = fence(...args);
        token.info = info;
        html = html.replace(/class="language-bash"/g, 'class="language-mcfunction"');
        html = html.replace(/>bash</g, ">mcfunction<");
        return html;
      };
    }
  },
  // Vite 配置
  vite: {
    define: {
      __BUILD_ID__: JSON.stringify(process.env.GITHUB_RUN_NUMBER || "dev"),
      __BUILD_SHA__: JSON.stringify(process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : "")
    },
    plugins: [
      MermaidPlugin(),
      addContributorsPlugin()
    ],
    resolve: {
      alias: [
        {
          find: /^.*\/VPNavBarExtra\.vue$/,
          replacement: path2.resolve(__dirname, "./theme/components/vue/CustomNavBarExtra.vue")
        }
      ]
    },
    optimizeDeps: {
      include: ["mermaid", "vue"]
    },
    ssr: {
      noExternal: ["mermaid", /^vitepress/]
    },
    // 构建优化
    build: {
      chunkSizeWarningLimit: 2e3,
      // 提高 chunk 大小警告限制
      sourcemap: false,
      // 生产环境关闭 sourcemap
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks: {
            // mermaid 及其生态依赖单独分包，利用 Rollup 自动解析依赖关系避免循环 chunk
            "vendor-mermaid": ["mermaid"]
          }
        }
      }
    },
    server: {
      fs: {
        allow: ["..", "."]
        // 允许访问父目录和当前目录
      },
      hmr: {
        overlay: true
        // 显示错误覆盖层
      }
    }
  },
  // 主题配置
  themeConfig: {
    // 搜索配置
    search: {
      provider: "local",
      // algolia
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: "\u641C\u7D22\u6587\u6863",
                buttonAriaLabel: "\u641C\u7D22\u6587\u6863"
              },
              modal: {
                noResultsText: "\u65E0\u6CD5\u627E\u5230\u76F8\u5173\u7ED3\u679C",
                resetButtonTitle: "\u6E05\u9664\u67E5\u8BE2\u6761\u4EF6",
                footer: {
                  selectText: "\u9009\u62E9",
                  navigateText: "\u5207\u6362",
                  closeText: "\u5173\u95ED"
                }
              }
            }
          }
        },
        detailedView: true,
        miniSearch: {
          searchOptions: {
            // 模糊匹配 + 前缀匹配，兼顾拼写容错与关键词前缀命中
            fuzzy: 0.2,
            prefix: true,
            combineWith: "AND",
            // 权重分配：标题命中权重最高（优先展示标题匹配的页面），
            // 内容命中作为补充，提升关键词检索的精准度与排序质量
            boost: { title: 6, content: 1, heading: 3 }
          }
        }
      }
    },
    // 导航栏
    nav: [
      { text: "\u9996\u9875", link: "/" },
      {
        text: "\u73A9\u6CD5\u4ECB\u7ECD",
        link: "/features/",
        activeMatch: "^/features/"
      },
      {
        text: "\u73A9\u5BB6\u624B\u518C",
        link: "/manual/review",
        activeMatch: "^/manual/"
      },
      {
        text: "\u5F00\u53D1\u6587\u6863",
        link: "/develop/team",
        activeMatch: "^/develop/"
      },
      {
        text: "\u539F\u521B\u63D2\u4EF6",
        link: "/plugins/info",
        activeMatch: "^/plugins/"
      },
      {
        text: "\u76F8\u5173\u94FE\u63A5",
        items: [
          {
            text: "\u72D0\u98CE\u8F69\u6C50\u306E\u5C0F\u7A9D-Blog",
            link: "https://f.windemiko.top",
            target: "_blank",
            rel: "noopener noreferrer"
          },
          {
            text: "\u8D44\u6E90\u5206\u4EAB\u4E0B\u8F7D",
            link: "https://share.fnnas.net/s/a32874a8ab394948b4",
            target: "_blank",
            rel: "noopener noreferrer"
          },
          {
            text: "\u54D4\u54E9\u54D4\u54E9 - \u72D0\u98CE\u8F69\u6C50",
            link: "https://space.bilibili.com/359174372",
            target: "_blank",
            rel: "noopener noreferrer"
          },
          {
            text: "GitHub - \u9510\u754C\u5E7B\u5883\u6587\u6863",
            link: "https://github.com/fwindemiko/MiragEdge-DocWeb",
            target: "_blank",
            rel: "noopener noreferrer"
          }
        ]
      }
    ],
    // 侧边栏配置
    sidebar: {
      "/features/": [
        { text: "\u{1F4D6} \u73A9\u6CD5\u603B\u89C8", link: "/features/" },
        {
          text: "\u{1F3E0} \u57FA\u7840\u7CFB\u7EDF",
          collapsed: false,
          items: [
            { text: "\u7ECF\u6D4E\u7CFB\u7EDF", link: "/features/base/economy" },
            { text: "\u73A9\u5BB6\u5DE5\u4F1A", link: "/features/base/playerguild" },
            { text: "\u5E7B\u57DF\u9886\u5730", link: "/features/base/dom" },
            { text: "\u72EC\u7279\u529F\u80FD", link: "/features/base/function" }
          ]
        },
        {
          text: "\u{1F33E} \u7530\u56ED\u751F\u6D3B",
          collapsed: false,
          items: [
            { text: "\u5EFA\u7B51\u5927\u5E08", link: "/features/pastoral/builder" },
            {
              text: "\u771F\u5B9E\u5B63\u8282",
              collapsed: true,
              items: [
                { text: "\u4ECB\u7ECD", link: "/features/pastoral/seasons/info" },
                { text: "\u6E29\u5EA6\u7CFB\u7EDF", link: "/features/pastoral/seasons/temperature" },
                { text: "\u6625\u5B63", link: "/features/pastoral/seasons/spring" },
                { text: "\u590F\u5B63", link: "/features/pastoral/seasons/summer" },
                { text: "\u79CB\u5B63", link: "/features/pastoral/seasons/fall" },
                { text: "\u51AC\u5B63", link: "/features/pastoral/seasons/winter" }
              ]
            },
            {
              text: "\u66F4\u591A\u9493\u9C7C",
              collapsed: true,
              items: [
                { text: "\u4ECB\u7ECD", link: "/features/pastoral/fishing/info" },
                { text: "\u9C7C\u7AFF\u8FDB\u9636", link: "/features/pastoral/fishing/rods" },
                { text: "\u9C7C\u7C7B\u56FE\u9274", link: "/features/pastoral/fishing/fish" },
                { text: "\u9493\u9C7C\u6BD4\u8D5B", link: "/features/pastoral/fishing/competitions" },
                { text: "\u9C7C\u9975\u7CFB\u7EDF", link: "/features/pastoral/fishing/baits" },
                { text: "\u7EF4\u5EA6\u9493\u9C7C", link: "/features/pastoral/fishing/dimensions" }
              ]
            },
            {
              text: "\u66F4\u591A\u79CD\u690D",
              collapsed: true,
              items: [
                { text: "\u4ECB\u7ECD", link: "/features/pastoral/croups/info" }
              ]
            },
            {
              text: "\u66F4\u591A\u98DF\u7269",
              collapsed: true,
              items: [
                { text: "\u98DF\u7269\u603B\u89C8", link: "/features/pastoral/food/info" },
                { text: "\u65E9\u9910\u7B80\u9910", link: "/features/pastoral/food/breakfast" },
                { text: "\u7CD6\u679C\u96F6\u98DF", link: "/features/pastoral/food/snacks" },
                { text: "\u6C99\u62C9\u51C9\u83DC", link: "/features/pastoral/food/salads" },
                { text: "\u70D8\u7119\u7CD5\u70B9", link: "/features/pastoral/food/bakery" },
                { text: "\u4E3B\u83DC\u8089\u98DF", link: "/features/pastoral/food/mains" },
                { text: "\u996E\u54C1", link: "/features/pastoral/food/drinks" },
                { text: "\u751C\u54C1", link: "/features/pastoral/food/desserts" },
                { text: "\u714E\u86CB\u7CFB\u5217", link: "/features/pastoral/food/eggs" },
                { text: "\u7279\u8272\u98DF\u7269", link: "/features/pastoral/food/special" },
                { text: "\u98DF\u7269\u901F\u67E5\u8868", link: "/features/pastoral/food/reference" }
              ]
            }
          ]
        },
        {
          text: "\u2694\uFE0F \u5192\u9669\u6218\u6597",
          collapsed: false,
          items: [
            {
              text: "\u7B49\u7EA7\u602A\u7269",
              link: "/features/adventure/levelledmobs"
            },
            {
              text: "\u6B7B\u4EA1\u8F6E\u56DE",
              link: "/features/adventure/deathreincarnation"
            },
            {
              text: "\u661F\u8F89\u951A\u70B9",
              link: "/features/adventure/miragedgehome"
            },
            {
              text: "\u9798\u7FC5\u7ED1\u5B9A",
              link: "/features/adventure/elytrabind"
            },
            {
              text: "\u79F0\u53F7\u4E0E\u767B\u573A",
              link: "/features/adventure/identity"
            },
            {
              text: "\u2728 \u66F4\u591A\u9644\u9B54",
              collapsed: true,
              items: [
                { text: "\u4ECB\u7ECD", link: "/features/adventure/enchantments/info" },
                { text: "\u54C1\u8D28\u7B49\u7EA7", link: "/features/adventure/enchantments/rarity" },
                { text: "\u9644\u9B54\u5217\u8868", link: "/features/adventure/enchantments/list" },
                { text: "\u5206\u7C7B\u642D\u914D", link: "/features/adventure/enchantments/group" },
                { text: "\u9644\u9B54\u7BA1\u7406", link: "/features/adventure/enchantments/system" }
              ]
            },
            {
              text: "\u2694\uFE0F \u88C5\u5907\u5347\u7EA7",
              collapsed: false,
              items: [
                { text: "\u4ECB\u7ECD", link: "/features/adventure/mmo/info" },
                { text: "\u953B\u9020\u5347\u7EA7", link: "/features/adventure/mmo/forge" }
              ]
            }
          ]
        }
      ],
      "/manual/": [
        {
          text: "\u{1F4CC} \u5FC5\u770B\u6307\u5357",
          collapsed: false,
          items: [
            { text: "\u6B22\u8FCE\u670B\u53CB", link: "/manual/review" },
            { text: "\u73A9\u5BB6\u5B88\u5219", link: "/manual/eula" },
            { text: "\u5165\u670D\u65B9\u6CD5", link: "/manual/tutorial/serverjoin" },
            { text: "\u624B\u673A\u5FC5\u770B", link: "/manual/tutorial/bedrock" },
            { text: "\u751F\u7535\u4E0E\u7279\u6027", link: "/manual/redstone_mechanism" },
            { text: "\u5BA2\u6237\u7AEF\u5B89\u88C5", link: "/manual/tutorial/clientinstall" },
            { text: "\u5E38\u89C1\u95EE\u9898", link: "/manual/faq" }
          ]
        },
        {
          text: "\u{1F527} \u9644\u5C5E\u529F\u80FD\u6559\u7A0B",
          collapsed: false,
          items: [
            { text: "\u767D\u540D\u5355\u7CFB\u7EDF", link: "/manual/tutorial/whitelist" },
            { text: "\u8BED\u97F3\u9891\u9053", link: "/manual/function/voicechannel" },
            { text: "\u7FA4\u670D\u4E92\u901A\u673A\u5668\u4EBA", link: "/manual/function/qqbot" },
            { text: "MOD\u62D3\u5C55\u529F\u80FD\u652F\u6301", link: "/manual/function/mod" }
          ]
        },
        {
          text: "\u{1F465} \u793E\u533A\u4EA4\u6D41",
          collapsed: false,
          items: [
            { text: "QQ \u7FA4\u7EC4", link: "/manual/qq_group" },
            { text: "\u4E16\u754C\u89C2\u6545\u4E8B", link: "/manual/other/worldview" },
            { text: "\u5BA3\u4F20\u63A8\u5E7F", link: "/manual/promotion" }
          ]
        },
        {
          text: "\u{1F6A9} \u5386\u53F2\u4E8B\u4EF6\u8BB0\u5F55",
          collapsed: true,
          items: [
            { text: "2026\u5143\u65E6\u5408\u7167\u7EAA\u5FF5\u6D3B\u52A8", link: "/manual/active/20260101" },
            { text: "\u65B0\u670D\u6570\u636E\u4E22\u5931\u4E8B\u4EF6", link: "/manual/active/20251225" },
            { text: "\u5B58\u6863\u6570\u636E\u91CD\u7F6E", link: "/manual/active/20251017" }
          ]
        }
      ],
      "/develop/": [
        { text: "\u{1F465} \u5F00\u53D1\u56E2\u961F", link: "/develop/team" },
        { text: "\u{1F4CC} \u5F85\u529E\u4E8B\u9879", link: "/develop/todo" },
        /* {
          text: '🎮 插件开发',
          collapsed: false,
          items: [
            { text: '📋 项目开发说明', link: '/develop/mc_plugins/index' },
            {
              text: '📊 原创插件列表',
              collapsed: false,
              items: [
                { text: '🦊 狐风轩汐', link: '/develop/mc_plugins/fwindemiko' },
              ]
            },
          ]
         },*/
        {
          text: "\u2699\uFE0F \u63D2\u4EF6\u914D\u7F6E",
          collapsed: false,
          items: [
            { text: "\u8D34\u56FE\u5B57\u7B26\u7801", link: "/develop/server_configs/sticker" },
            { text: "\u81EA\u5B9A\u4E49\u4F5C\u7269", link: "/develop/server_configs/customcrops" },
            { text: "\u9493\u9C7C\u7CFB\u7EDF", link: "/develop/server_configs/fishing" },
            {
              text: "\u2728 \u66F4\u591A\u9644\u9B54",
              collapsed: false,
              items: [
                { text: "\u9644\u9B54\u914D\u7F6E\u6559\u7A0B", link: "/develop/server_configs/enchanting" },
                { text: "\u9644\u9B54ID\u5BF9\u7167\u8868", link: "/develop/server_configs/enchantment_ids" }
              ]
            }
          ]
        },
        {
          text: "\u{1F9E9} \u5F00\u53D1\u5DE5\u4F5C\u6D41",
          collapsed: false,
          items: [
            { text: "\u6570\u636E\u5305\u5BA2\u5236\u5316(AI Skills)", link: "/develop/workflows/datapack-workflow" }
          ]
        },
        {
          text: "\u{1F3AF} \u73A9\u6CD5\u8BBE\u8BA1",
          collapsed: false,
          items: [
            { text: "\u8D5B\u5B63\u73A9\u6CD5\u8BBE\u8BA1\u65B9\u6848", link: "/develop/gameplay/liveops_260107" }
          ]
        },
        {
          text: "\u{1F310} \u7F51\u7AD9\u5F00\u53D1",
          collapsed: false,
          items: [
            { text: "\u81EA\u52A8\u56FE\u50CF\u7EC4\u4EF6", link: "/develop/webdev/autoimage" },
            { text: "\u77E2\u91CF\u56FE\u6807\u5E93", link: "/develop/webdev/vectoricons" },
            { text: "MC\u914D\u65B9\u7EC4\u4EF6", link: "/develop/webdev/mcrecipe" }
          ]
        },
        {
          text: "\u{1F4CB} \u9644\u5F55",
          collapsed: false,
          items: [
            { text: "\u66F4\u65B0\u65E5\u5FD7", link: "/develop/logs" },
            { text: "\u8282\u70B9\u72B6\u6001", link: "/develop/serverstatus" },
            { text: "\u8BA1\u7B97\u670D\u52A1", link: "/develop/ccs_price_list" }
          ]
        }
      ],
      "/plugins/": [
        { text: "\u{1F4CB} \u9879\u76EE\u5F00\u53D1\u8BF4\u660E", link: "/plugins/info" },
        { text: "\u{1F4CA} \u539F\u521B\u63D2\u4EF6\u5217\u8868", link: "/plugins/list" },
        {
          text: "\u2694\uFE0F PVP\u7ADE\u6280\u573A\u7CFB\u7EDF",
          collapsed: false,
          items: [
            { text: "\u5B89\u88C5\u914D\u7F6E", link: "/plugins/fepvp/" },
            { text: "\u7ADE\u6280\u573A\u7BA1\u7406", link: "/plugins/fepvp/arena" },
            { text: "\u88C5\u5907\u7EC4\u5408\u7BA1\u7406", link: "/plugins/fepvp/kit" },
            { text: "\u73A9\u5BB6\u6307\u5357", link: "/plugins/fepvp/guide" },
            { text: "\u914D\u7F6E\u53C2\u8003", link: "/plugins/fepvp/config" },
            { text: "\u6743\u9650\u8282\u70B9", link: "/plugins/fepvp/permissions" },
            { text: "\u547D\u4EE4\u53C2\u8003", link: "/plugins/fepvp/commands" },
            { text: "\u6570\u636E\u5B58\u50A8", link: "/plugins/fepvp/storage" }
          ]
        },
        { text: "\u{1F31F} \u661F\u8F89\u951A\u70B9", link: "/plugins/miragedgehome" },
        { text: "\u{1F3F7}\uFE0F \u79F0\u53F7\u4E0E\u5165\u670D\u6D88\u606F", link: "/plugins/miragedgetitle" }
      ]
    },
    // 大纲配置
    outline: {
      level: [1, 4],
      label: "\u672C\u9875\u76EE\u5F55"
    },
    returnToTopLabel: "\u8FD4\u56DE\u9876\u90E8",
    // 社交链接
    // socialLinks: [
    //   { 
    //     icon: 'bilibili', 
    //     link: 'https://space.bilibili.com/359174372',
    //     ariaLabel: '📺 哔哩哔哩 - 狐风轩汐'
    //   },
    //   { 
    //     icon: 'github', 
    //     link: 'https://github.com/fwindemiko/MiragEdge-DocWeb',
    //     ariaLabel: '📦 GitHub - 锐界幻境文档'
    //   },
    // ],
    // 最后更新时间
    lastUpdated: {
      text: "\u6700\u540E\u66F4\u65B0",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short"
      }
    },
    // 编辑链接 - 动态跳转到当前页的GitHub编辑页
    editLink: {
      pattern: "https://github.com/fwindemiko/MiragEdge-DocWeb/edit/main/:path",
      text: "\u5728 GitHub \u4E0A\u7F16\u8F91\u6B64\u9875"
    },
    // 深色模式切换
    darkModeSwitchLabel: "\u5916\u89C2",
    // 侧边栏菜单文本
    sidebarMenuLabel: "\u83DC\u5355",
    // 文档页脚配置
    docFooter: {
      prev: "\u4E0A\u4E00\u7BC7",
      next: "\u4E0B\u4E00\u7BC7"
    },
    // 返回顶部按钮（VitePress 默认启用）
    // 外部链接图标
    externalLinkIcon: true
  },
  // 缓存配置
  cacheDir: "./.vitepress/cache",
  // 清理死链警告
  ignoreDeadLinks: [
    // 预留页面：文件尚未创建但在 nav/sidebar 中引用时在此忽略
  ],
  // 自定义 Sitemap(搜索映射表) 生成
  sitemap: {
    hostname: "https://miragedge.top"
  }
});
export {
  config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLnZpdGVwcmVzcy9jb25maWcubXRzIiwgIi52aXRlcHJlc3MvdGhlbWUvYWRkQ29udHJpYnV0b3JzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcTWlyYWdFZGdlLURvY1dlYlxcXFwudml0ZXByZXNzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJGOlxcXFxNaXJhZ0VkZ2UtRG9jV2ViXFxcXC52aXRlcHJlc3NcXFxcY29uZmlnLm10c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRjovTWlyYWdFZGdlLURvY1dlYi8udml0ZXByZXNzL2NvbmZpZy5tdHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlcHJlc3MnXG5pbXBvcnQgeyBNZXJtYWlkUGx1Z2luLCBNZXJtYWlkTWFya2Rvd24gfSBmcm9tIFwidml0ZXByZXNzLXBsdWdpbi1tZXJtYWlkXCI7XG5pbXBvcnQgYWRkQ29udHJpYnV0b3JzUGx1Z2luIGZyb20gJy4vdGhlbWUvYWRkQ29udHJpYnV0b3JzJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCdcbmltcG9ydCBmcyBmcm9tICdub2RlOmZzJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJ1xuXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKVxuXG4vLyBcdTdBRDlcdTcwQjlcdTVFMzhcdTkxQ0ZcdUZGMUFcdTc1MjhcdTRFOEUgT0cgLyBjYW5vbmljYWwgLyBKU09OLUxEIFx1N0I0OVx1N0VERFx1NUJGOVx1NTczMFx1NTc0MFxuY29uc3QgU0lURV9IT1NUID0gJ2h0dHBzOi8vbWlyYWdlZGdlLnRvcCdcbmNvbnN0IFNJVEVfVElUTEUgPSAnTWlyYWdFZGdlIFx1NjU4N1x1Njg2M1x1NEUyRFx1NUZDMydcbmNvbnN0IFNJVEVfREVTQ1JJUFRJT04gPSAnXHU5NTEwXHU3NTRDXHU1RTdCXHU1ODgzIE1pbmVjcmFmdCBcdTRFOTJcdTkwMUFcdTc1MUZcdTVCNThcdTY3MERcdTUyQTFcdTU2NjhcdTVCOThcdTY1QjlcdTY1ODdcdTY4NjNcdTRFMkRcdTVGQzNcdUZGMENcdTYzRDBcdTRGOUJcdTczQTlcdTVCQjZcdTYzMDdcdTUzNTdcdTMwMDFcdTczQTlcdTZDRDVcdTRFQ0JcdTdFQ0RcdTMwMDFcdTk2NDRcdTlCNTRcdTU2RkVcdTkyNzRcdTMwMDFcdTk0OTNcdTlDN0MvXHU1QjYzXHU4MjgyL1x1OThERlx1NzI2OVx1N0NGQlx1N0VERlx1MzAwMVx1NUYwMFx1NTNEMVx1NjU1OVx1N0EwQlx1NEUwRVx1NTM5Rlx1NTIxQlx1NjNEMlx1NEVGNlx1NjU4N1x1Njg2M1x1MzAwMidcbmNvbnN0IFNJVEVfT0dfSU1BR0UgPSBgJHtTSVRFX0hPU1R9L3RpdGxlX2ltZy94aW5naml1LnBuZ2BcblxuLy8gaHR0cHM6Ly92aXRlcHJlc3MuZGV2L3JlZmVyZW5jZS9zaXRlLWNvbmZpZ1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgdGl0bGU6IFNJVEVfVElUTEUsXG4gIGRlc2NyaXB0aW9uOiBTSVRFX0RFU0NSSVBUSU9OLFxuXG4gIC8vIFx1NTdGQVx1Nzg0MFx1OERFRlx1NUY4NFx1RkYwQ1x1NTk4Mlx1Njc5Q1x1OTBFOFx1N0Y3Mlx1NTcyOFx1NUI1MFx1OERFRlx1NUY4NFx1NEUwQlx1OTcwMFx1ODk4MVx1OEJCRVx1N0Y2RVxuICBiYXNlOiAnLycsXG5cbiAgLy8gXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XG4gIG91dERpcjogJy52aXRlcHJlc3MvZGlzdCcsXG5cbiAgLy8gXHU4QkVEXHU4QTAwXHU5MTREXHU3RjZFXG4gIGxvY2FsZXM6IHtcbiAgICByb290OiB7XG4gICAgICBsYWJlbDogJ1x1NEUyRFx1NjU4NycsXG4gICAgICBsYW5nOiAnemgtQ04nLFxuICAgICAgZGVzY3JpcHRpb246IFNJVEVfREVTQ1JJUFRJT04sXG4gICAgfVxuICB9LFxuXG4gIC8vIFx1NTkzNFx1OTBFOFx1OTE0RFx1N0Y2RVxuICBoZWFkOiBbXG4gICAgWydsaW5rJywgeyByZWw6ICdpY29uJywgaHJlZjogJy90aXRsZV9pbWcvZmF2aWNvbi0zMngzMi5wbmcnLCBzaXplczogJzMyeDMyJyB9XSxcbiAgICBbJ2xpbmsnLCB7IHJlbDogJ2ljb24nLCBocmVmOiAnL3RpdGxlX2ltZy9mYXZpY29uLTE2eDE2LnBuZycsIHNpemVzOiAnMTZ4MTYnIH1dLFxuICAgIFsnbGluaycsIHsgcmVsOiAnYXBwbGUtdG91Y2gtaWNvbicsIGhyZWY6ICcvdGl0bGVfaW1nL2FwcGxlLXRvdWNoLWljb24ucG5nJywgc2l6ZXM6ICcxODB4MTgwJyB9XSxcbiAgICBbJ2xpbmsnLCB7IHJlbDogJ21hbmlmZXN0JywgaHJlZjogJy9zaXRlLndlYm1hbmlmZXN0JyB9XSxcbiAgICAvLyBcdTk4ODRcdThGREVcdTYzQTVcdTUxNzNcdTk1MkVcdTdCMkNcdTRFMDlcdTY1QjlcdTU3REZcdTU0MERcdUZGMENcdTUyQTBcdTkwMUYgT0cgXHU1NkZFXHU3MjQ3XHU0RTBFXHU1QjU3XHU0RjUzXHU1MkEwXHU4RjdEXG4gICAgWydsaW5rJywgeyByZWw6ICdwcmVjb25uZWN0JywgaHJlZjogJ2h0dHBzOi8vb3NzLm1pcmFnZWRnZS50b3AnIH1dLFxuICAgIFsnbWV0YScsIHsgbmFtZTogJ3RoZW1lLWNvbG9yJywgY29udGVudDogJyMzYzg3NzInIH1dLFxuICAgIC8vIFx1Njc4NFx1NUVGQVx1NzI0OFx1NjcyQ1x1NjgwN1x1OEJDNlx1RkYxQVx1NkNFOFx1NTE2NVx1NTIzMFx1NkJDRlx1NEUyQSBIVE1MIFx1NzY4NCA8aGVhZD5cdUZGMENcdTRGOUJcdTUyNERcdTdBRUZcdTcyNDhcdTY3MkNcdTY4QzBcdTZENEJcdTVCRjlcdTZCRDQgL3ZlcnNpb24uanNvblxuICAgIC8vIFx1NTAzQ1x1NEUwRSB2aXRlIGRlZmluZSBcdTRFMkRcdTc2ODQgX19CVUlMRF9JRF9fIC8gX19CVUlMRF9TSEFfXyBcdTRGRERcdTYzMDFcdTRFMDBcdTgxRjRcdUZGMDhcdTY3ODRcdTVFRkFcdTY1RjZcdTZDNDJcdTUwM0NcdUZGMDlcbiAgICAvLyBcdTc1MjhcdTRFOEUgRVNBIFx1OEZCOVx1N0YxOFx1N0YxM1x1NUI1OFx1NTczQVx1NjY2Rlx1NEUwQlx1NjhDMFx1NkQ0Qlx1NjVFNyBIVE1MIFx1NUU3Nlx1ODlFNlx1NTNEMVx1ODFFQVx1NTJBOFx1NTIzN1x1NjVCMFxuICAgIFsnbWV0YScsIHsgbmFtZTogJ3gtYnVpbGQtaWQnLCBjb250ZW50OiBwcm9jZXNzLmVudi5HSVRIVUJfUlVOX05VTUJFUiB8fCAnZGV2JyB9XSxcbiAgICBbJ21ldGEnLCB7IG5hbWU6ICd4LWJ1aWxkLXNoYScsIGNvbnRlbnQ6IHByb2Nlc3MuZW52LkdJVEhVQl9TSEEgPyBwcm9jZXNzLmVudi5HSVRIVUJfU0hBLnN1YnN0cmluZygwLCA3KSA6ICcnIH1dLFxuICAgIC8vIFx1NzlGQlx1OTY2NCBtYXhpbXVtLXNjYWxlL3VzZXItc2NhbGFibGU9bm9cdUZGMDhcdThGRERcdTUzQ0QgV0NBRyAxLjQuNFx1RkYwQ1x1OTYzQlx1NkI2Mlx1ODlDNlx1NTI5Qlx1NEUwRFx1NEY3M1x1NzUyOFx1NjIzN1x1N0YyOVx1NjUzRVx1RkYwOVxuICAgIC8vIFx1NTQyRlx1NzUyOCB2aWV3cG9ydC1maXQ9Y292ZXIgXHU4QkE5XHU1Qjg5XHU1MTY4XHU1MzNBIGVudihzYWZlLWFyZWEtaW5zZXQtKikgXHU3NTFGXHU2NTQ4XHVGRjA4aVBob25lIFx1NTIxOFx1NkQ3Ny9Ib21lIEluZGljYXRvclx1RkYwOVxuICAgIFsnbWV0YScsIHsgbmFtZTogJ3ZpZXdwb3J0JywgY29udGVudDogJ3dpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLjAsIHZpZXdwb3J0LWZpdD1jb3ZlcicgfV0sXG4gICAgLy8gXHU1MTY4XHU1QzQwXHU1MTczXHU5NTJFXHU4QkNEXHVGRjFBXHU4OTg2XHU3NkQ2XHU1NEMxXHU3MjRDXHU4QkNEXHUzMDAxXHU1NEMxXHU3QzdCXHU4QkNEXHUzMDAxXHU3M0E5XHU2Q0Q1XHU4QkNEXHUzMDAxXHU2MjgwXHU2NzJGXHU4QkNEXHVGRjBDXHU2M0QwXHU1MzQ3XHU5NTdGXHU1QzNFXHU2OEMwXHU3RDIyXHU1NDdEXHU0RTJEXHU3Mzg3XG4gICAgWydtZXRhJywgeyBuYW1lOiAna2V5d29yZHMnLCBjb250ZW50OiAnTWlyYWdFZGdlLCBcdTk1MTBcdTc1NENcdTVFN0JcdTU4ODMsIE1pbmVjcmFmdCwgXHU2MjExXHU3Njg0XHU0RTE2XHU3NTRDLCBcdTYyMTFcdTc2ODRcdTRFMTZcdTc1NENcdTY3MERcdTUyQTFcdTU2NjgsIFx1NzUxRlx1NUI1OFx1NjcwRFx1NTJBMVx1NTY2OCwgXHU0RTkyXHU5MDFBXHU2NzBEXHU1MkExXHU1NjY4LCBKYXZhXHU3MjQ4LCBcdTU3RkFcdTVDQTlcdTcyNDgsIDEuMjEsIFx1NjU4N1x1Njg2MywgXHU3M0E5XHU1QkI2XHU2MjRCXHU1MThDLCBcdTUxNjVcdTY3MERcdTY1NTlcdTdBMEIsIFx1OTY0NFx1OUI1NCwgXHU2NkY0XHU1OTFBXHU5NjQ0XHU5QjU0LCBcdTk0OTNcdTlDN0MsIFx1NUI2M1x1ODI4Mlx1N0NGQlx1N0VERiwgXHU5OERGXHU3MjY5LCBcdTdFQ0ZcdTZENEVcdTdDRkJcdTdFREYsIFx1OTg4Nlx1NTczMCwgUFZQLCBcdTYzRDJcdTRFRjYsIFx1NzJEMFx1OThDRVx1OEY2OVx1NkM1MCwgRndpbmRFbWksIEYud2luZEVtaWtvLCBBaXlhdHNidXMsIEV2ZW5Nb3JlRmlzaCwgQ3VzdG9tQ3JvcHMnIH1dLFxuICAgIFsnbWV0YScsIHsgbmFtZTogJ2F1dGhvcicsIGNvbnRlbnQ6ICdGLndpbmRFbWlrbyAoXHU3MkQwXHU5OENFXHU4RjY5XHU2QzUwKScgfV0sXG4gICAgWydtZXRhJywgeyBuYW1lOiAncm9ib3RzJywgY29udGVudDogJ2luZGV4LCBmb2xsb3csIG1heC1pbWFnZS1wcmV2aWV3OmxhcmdlLCBtYXgtc25pcHBldDotMSwgbWF4LXZpZGVvLXByZXZpZXc6LTEnIH1dLFxuICAgIFsnbWV0YScsIHsgbmFtZTogJ2xhbmd1YWdlJywgY29udGVudDogJ3poLUNOJyB9XSxcbiAgICBbJ21ldGEnLCB7IG5hbWU6ICdyZWZlcnJlcicsIGNvbnRlbnQ6ICdzdHJpY3Qtb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luJyB9XSxcbiAgICAvLyBPcGVuIEdyYXBoXHVGRjFBXHU0RjdGXHU3NTI4XHU3RUREXHU1QkY5XHU1NzMwXHU1NzQwXHVGRjBDXHU3ODZFXHU0RkREXHU3OTNFXHU0RUE0XHU1RTczXHU1M0YwL1x1NjQxQ1x1N0QyMlx1NUYxNVx1NjRDRVx1NkI2M1x1Nzg2RVx1NjI5M1x1NTNENlx1NTM2MVx1NzI0N1xuICAgIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzpzaXRlX25hbWUnLCBjb250ZW50OiBTSVRFX1RJVExFIH1dLFxuICAgIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzp0aXRsZScsIGNvbnRlbnQ6IFNJVEVfVElUTEUgfV0sXG4gICAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOmRlc2NyaXB0aW9uJywgY29udGVudDogU0lURV9ERVNDUklQVElPTiB9XSxcbiAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6dHlwZScsIGNvbnRlbnQ6ICd3ZWJzaXRlJyB9XSxcbiAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6aW1hZ2UnLCBjb250ZW50OiBTSVRFX09HX0lNQUdFIH1dLFxuICAgIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzppbWFnZTphbHQnLCBjb250ZW50OiAnXHU5NTEwXHU3NTRDXHU1RTdCXHU1ODgzIE1pcmFnRWRnZSBcdTY1ODdcdTY4NjNcdTRFMkRcdTVGQzMnIH1dLFxuICAgIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzppbWFnZTp3aWR0aCcsIGNvbnRlbnQ6ICcxMjAwJyB9XSxcbiAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6aW1hZ2U6aGVpZ2h0JywgY29udGVudDogJzYzMCcgfV0sXG4gICAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOnVybCcsIGNvbnRlbnQ6IFNJVEVfSE9TVCB9XSxcbiAgICBbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6bG9jYWxlJywgY29udGVudDogJ3poX0NOJyB9XSxcbiAgICAvLyBUd2l0dGVyIENhcmRcbiAgICBbJ21ldGEnLCB7IG5hbWU6ICd0d2l0dGVyOmNhcmQnLCBjb250ZW50OiAnc3VtbWFyeV9sYXJnZV9pbWFnZScgfV0sXG4gICAgWydtZXRhJywgeyBuYW1lOiAndHdpdHRlcjppbWFnZScsIGNvbnRlbnQ6IFNJVEVfT0dfSU1BR0UgfV0sXG4gICAgWydtZXRhJywgeyBuYW1lOiAndHdpdHRlcjppbWFnZTphbHQnLCBjb250ZW50OiAnXHU5NTEwXHU3NTRDXHU1RTdCXHU1ODgzIE1pcmFnRWRnZSBcdTY1ODdcdTY4NjNcdTRFMkRcdTVGQzMnIH1dLFxuICAgIFsnbWV0YScsIHsgbmFtZTogJ3R3aXR0ZXI6Y3JlYXRvcicsIGNvbnRlbnQ6ICdATWlyYWdFZGdlJyB9XSxcbiAgICBbJ21ldGEnLCB7IG5hbWU6ICd0d2l0dGVyOnNpdGUnLCBjb250ZW50OiAnQE1pcmFnRWRnZScgfV0sXG4gICAgLy8gSlNPTi1MRCBcdTdFRDNcdTY3ODRcdTUzMTZcdTY1NzBcdTYzNkVcdUZGMUFXZWJTaXRlIHNjaGVtYVx1RkYwQ1x1NUUyRVx1NTJBOVx1NjQxQ1x1N0QyMlx1NUYxNVx1NjRDRVx1NzQwNlx1ODlFM1x1N0FEOVx1NzBCOVx1N0VEM1x1Njc4NFx1NUU3Nlx1NTQyRlx1NzUyOFx1N0FEOVx1NTE4NVx1NjQxQ1x1N0QyMlx1Njg0NiAoU2l0ZWxpbmtzIFNlYXJjaCBCb3gpXG4gICAgWydzY3JpcHQnLCB7IHR5cGU6ICdhcHBsaWNhdGlvbi9sZCtqc29uJyB9LCBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAnQGNvbnRleHQnOiAnaHR0cHM6Ly9zY2hlbWEub3JnJyxcbiAgICAgICdAdHlwZSc6ICdXZWJTaXRlJyxcbiAgICAgICduYW1lJzogU0lURV9USVRMRSxcbiAgICAgICdhbHRlcm5hdGVOYW1lJzogJ1x1OTUxMFx1NzU0Q1x1NUU3Qlx1NTg4M1x1NjU4N1x1Njg2MycsXG4gICAgICAndXJsJzogU0lURV9IT1NULFxuICAgICAgJ2Rlc2NyaXB0aW9uJzogU0lURV9ERVNDUklQVElPTixcbiAgICAgICdpbkxhbmd1YWdlJzogJ3poLUNOJyxcbiAgICAgICdwb3RlbnRpYWxBY3Rpb24nOiB7XG4gICAgICAgICdAdHlwZSc6ICdTZWFyY2hBY3Rpb24nLFxuICAgICAgICAndGFyZ2V0JzogYCR7U0lURV9IT1NUfS8/cT17c2VhcmNoX3Rlcm1fc3RyaW5nfWAsXG4gICAgICAgICdxdWVyeS1pbnB1dCc6ICdyZXF1aXJlZCBuYW1lPXNlYXJjaF90ZXJtX3N0cmluZydcbiAgICAgIH1cbiAgICB9KV0sXG4gICAgLy8gXHU5ODc1XHU5NzYyXHU3Mjc5XHU2NTQ4XHU1RjAwXHU1MTczXHVGRjFBXHU1NzI4IFZ1ZSBcdTZDMzRcdTU0MDhcdTUyNERcdTU0MENcdTZCNjVcdThCRkJcdTUzRDYgbG9jYWxTdG9yYWdlIFx1NUU3Nlx1OEJCRVx1N0Y2RSBlZmZlY3RzLWRpc2FibGVkIFx1N0M3QlxuICAgIC8vIFx1OTA3Rlx1NTE0RFx1NTIzN1x1NjVCMFx1NTQwRVx1NUYwMFx1NTE3M1x1NjYzRVx1NzkzQVx1NEUwRVx1NUI5RVx1OTY0NVx1NzJCNlx1NjAwMVx1NEUwRFx1NEUwMFx1ODFGNFx1NzY4NFx1OTVFRVx1OTg5OFxuICAgIFsnc2NyaXB0Jywge30sIGAoXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2YXIgc3RvcmVkID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ21pcmFnZWRnZS1lZmZlY3RzLWVuYWJsZWQnKTtcbiAgICAgICAgICB2YXIgaXNNb2JpbGUgPSB3aW5kb3cuaW5uZXJXaWR0aCA8PSA3Njc7XG4gICAgICAgICAgdmFyIGVuYWJsZWQgPSBzdG9yZWQgPT09IG51bGwgPyAhaXNNb2JpbGUgOiBzdG9yZWQgPT09ICd0cnVlJztcbiAgICAgICAgICBpZiAoIWVuYWJsZWQpIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdlZmZlY3RzLWRpc2FibGVkJyk7XG4gICAgICAgIH0gY2F0Y2goZSkge31cbiAgICAgIH1cbiAgICApKClgXSxcbiAgICAvLyBcdTc2N0VcdTVFQTZcdTdBRDlcdTcwQjlcdTlBOENcdThCQzFcdUZGMDhcdTU5ODJcdTY3OUNcdTk3MDBcdTg5ODFcdUZGMDlcbiAgICAvLyBbJ21ldGEnLCB7IG5hbWU6ICdiYWlkdS1zaXRlLXZlcmlmaWNhdGlvbicsIGNvbnRlbnQ6ICdjb2RlLXh4eHh4eHh4JyB9XSxcbiAgICAvLyAzNjBcdTdBRDlcdTcwQjlcdTlBOENcdThCQzFcdUZGMDhcdTU5ODJcdTY3OUNcdTk3MDBcdTg5ODFcdUZGMDlcbiAgICAvLyBbJ21ldGEnLCB7IG5hbWU6ICczNjAtc2l0ZS12ZXJpZmljYXRpb24nLCBjb250ZW50OiAneHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHgnIH1dLFxuICBdLFxuXG4gIC8vIFx1ODFFQVx1NTJBOFx1NkNFOFx1NTE2NVx1NkJDRlx1OTg3NSBTRU9cdUZGMUFjYW5vbmljYWwgLyBvZzp1cmwgLyBvZzp0aXRsZSAvIG9nOmRlc2NyaXB0aW9uIC8gZGVzY3JpcHRpb24gLyBhcnRpY2xlIG1ldGFcbiAgLy8gXHU5MDFBXHU4RkM3IHRyYW5zZm9ybUhlYWQgXHU5NEE5XHU1QjUwXHU1N0ZBXHU0RThFIHBhZ2VEYXRhIFx1NTJBOFx1NjAwMVx1NzUxRlx1NjIxMFx1RkYwQ1x1OTA3Rlx1NTE0RFx1NTcyOFx1NkJDRlx1NEUyQSBtZCBmcm9udG1hdHRlciBcdTkxQ0RcdTU5MERcdTkxNERcdTdGNkVcbiAgdHJhbnNmb3JtSGVhZChjb250ZXh0KSB7XG4gICAgY29uc3QgcGFnZSA9IGNvbnRleHQucGFnZURhdGFcbiAgICAvLyBcdTg5QzRcdTgzMDNcdTUzMTZcdTc2RjhcdTVCRjlcdThERUZcdTVGODRcdUZGMUFcdTUzQkJcdTYzODkgLm1kIC8gaW5kZXggXHU3RUQzXHU1QzNFXHVGRjBDXHU1Rjk3XHU1MjMwXHU1RTcyXHU1MUMwXHU3Njg0IFVSTCBcdThERUZcdTVGODRcbiAgICAvLyBwYWdlRGF0YS5yZWxhdGl2ZVBhdGggXHU1NzI4IFZpdGVQcmVzcyAxLnggXHU0RTJEXHU1OUNCXHU3RUM4XHU1M0VGXHU3NTI4XG4gICAgY29uc3QgcmF3UmVsID0gKHBhZ2UucmVsYXRpdmVQYXRoIHx8ICcnKS5yZXBsYWNlKC9cXFxcL2csICcvJylcbiAgICBsZXQgcmVsUGF0aCA9IHJhd1JlbFxuICAgICAgLnJlcGxhY2UoL1xcLm1kJC8sICcnKVxuICAgICAgLnJlcGxhY2UoLyhefFxcLylpbmRleCQvLCAnJDEnKVxuICAgIGNvbnN0IGNhbm9uaWNhbFVybCA9IHJlbFBhdGggPyBgJHtTSVRFX0hPU1R9LyR7cmVsUGF0aH1gIDogYCR7U0lURV9IT1NUfS9gXG5cbiAgICAvLyBcdTk4NzVcdTk3NjJcdTY4MDdcdTk4OThcdUZGMUFcdTRGMThcdTUxNDhcdTc1MjggZnJvbnRtYXR0ZXIgdGl0bGVcdUZGMENcdTUxNzZcdTZCMjEgZnJvbnRtYXR0ZXIgXHU0RTJEXHU2NUUwXHU1MjE5XHU3NTI4XHU5ODc1XHU1MTg1XHU3QjJDXHU0RTAwXHU0RTJBIEgxXG4gICAgY29uc3QgcGFnZVRpdGxlID0gcGFnZS5mcm9udG1hdHRlci50aXRsZVxuICAgICAgPyBgJHtwYWdlLmZyb250bWF0dGVyLnRpdGxlfSB8ICR7U0lURV9USVRMRX1gXG4gICAgICA6IHBhZ2UudGl0bGVcbiAgICAgICAgPyBgJHtwYWdlLnRpdGxlfSB8ICR7U0lURV9USVRMRX1gXG4gICAgICAgIDogU0lURV9USVRMRVxuXG4gICAgLy8gXHU5ODc1XHU5NzYyXHU2M0NGXHU4RkYwXHVGRjFBXHU0RjE4XHU1MTQ4IGZyb250bWF0dGVyLmRlc2NyaXB0aW9uXHVGRjBDXHU1NDI2XHU1MjE5XHU3NTU5XHU3QTdBXHVGRjA4XHU3NTMxIHRyYW5zZm9ybVBhZ2VEYXRhIFx1ODFFQVx1NTJBOFx1ODg2NVx1NTE2OFx1RkYwOVxuICAgIGNvbnN0IHBhZ2VEZXNjcmlwdGlvbiA9IHBhZ2UuZnJvbnRtYXR0ZXIuZGVzY3JpcHRpb24gfHwgcGFnZS5kZXNjcmlwdGlvbiB8fCBTSVRFX0RFU0NSSVBUSU9OXG5cbiAgICAvLyBcdTY1ODdcdTdBRTBcdTdDN0JcdTU3OEJcdTk4NzVcdTk3NjJcdTRGN0ZcdTc1MjggYXJ0aWNsZSBPR1x1RkYwQ1x1NTIxN1x1ODg2OC9cdTk5OTZcdTk4NzVcdTRGN0ZcdTc1Mjggd2Vic2l0ZVxuICAgIGNvbnN0IGlzQXJ0aWNsZSA9ICFwYWdlLmZyb250bWF0dGVyLmxheW91dFxuICAgICAgJiYgcmF3UmVsICE9PSAnaW5kZXgubWQnXG4gICAgICAmJiByYXdSZWwgIT09ICcnXG5cbiAgICBjb25zdCB0YWdzOiBhbnlbXSA9IFtcbiAgICAgIC8vIGNhbm9uaWNhbFx1RkYxQVx1OTA3Rlx1NTE0RFx1OTFDRFx1NTkwRFx1NTE4NVx1NUJCOVx1NjBFOVx1N0Y1QVx1RkYwQ1x1N0VERlx1NEUwMFx1Njc0M1x1OTFDRFx1NTIzMFx1ODlDNFx1ODMwMyBVUkxcbiAgICAgIFsnbGluaycsIHsgcmVsOiAnY2Fub25pY2FsJywgaHJlZjogY2Fub25pY2FsVXJsIH1dLFxuICAgICAgLy8gXHU2QkNGXHU5ODc1XHU4OTg2XHU3NkQ2IG9nIFx1NjgwN1x1N0I3RVx1RkYwQ1x1Nzg2RVx1NEZERFx1NzkzRVx1NEVBNFx1NTIwNlx1NEVBQlx1NTM2MVx1NzI0N1x1NTFDNlx1Nzg2RVxuICAgICAgWydtZXRhJywgeyBwcm9wZXJ0eTogJ29nOnVybCcsIGNvbnRlbnQ6IGNhbm9uaWNhbFVybCB9XSxcbiAgICAgIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzp0aXRsZScsIGNvbnRlbnQ6IHBhZ2VUaXRsZSB9XSxcbiAgICAgIFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzpkZXNjcmlwdGlvbicsIGNvbnRlbnQ6IHBhZ2VEZXNjcmlwdGlvbiB9XSxcbiAgICAgIFsnbWV0YScsIHsgbmFtZTogJ3R3aXR0ZXI6dGl0bGUnLCBjb250ZW50OiBwYWdlVGl0bGUgfV0sXG4gICAgICBbJ21ldGEnLCB7IG5hbWU6ICd0d2l0dGVyOmRlc2NyaXB0aW9uJywgY29udGVudDogcGFnZURlc2NyaXB0aW9uIH1dLFxuICAgIF1cblxuICAgIGlmIChpc0FydGljbGUpIHtcbiAgICAgIHRhZ3MucHVzaChbJ21ldGEnLCB7IHByb3BlcnR5OiAnb2c6dHlwZScsIGNvbnRlbnQ6ICdhcnRpY2xlJyB9XSlcbiAgICAgIHRhZ3MucHVzaChbJ21ldGEnLCB7IHByb3BlcnR5OiAnYXJ0aWNsZTphdXRob3InLCBjb250ZW50OiAnRi53aW5kRW1pa28gKFx1NzJEMFx1OThDRVx1OEY2OVx1NkM1MCknIH1dKVxuICAgICAgdGFncy5wdXNoKFsnbWV0YScsIHsgcHJvcGVydHk6ICdhcnRpY2xlOnNlY3Rpb24nLCBjb250ZW50OiAnXHU5NTEwXHU3NTRDXHU1RTdCXHU1ODgzXHU2NTg3XHU2ODYzJyB9XSlcbiAgICAgIGlmIChwYWdlLmZyb250bWF0dGVyLmxhc3RVcGRhdGVkKSB7XG4gICAgICAgIHRhZ3MucHVzaChbJ21ldGEnLCB7IHByb3BlcnR5OiAnYXJ0aWNsZTptb2RpZmllZF90aW1lJywgY29udGVudDogbmV3IERhdGUocGFnZS5mcm9udG1hdHRlci5sYXN0VXBkYXRlZCkudG9JU09TdHJpbmcoKSB9XSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGFncy5wdXNoKFsnbWV0YScsIHsgcHJvcGVydHk6ICdvZzp0eXBlJywgY29udGVudDogJ3dlYnNpdGUnIH1dKVxuICAgIH1cblxuICAgIC8vIFx1OTc2Mlx1NTMwNVx1NUM1MSBKU09OLUxEXHVGRjFBXHU0RTNBXHU5NzVFXHU5OTk2XHU5ODc1XHU2Q0U4XHU1MTY1IEJyZWFkY3J1bWJMaXN0XHVGRjBDXHU2M0QwXHU1MzQ3XHU2NDFDXHU3RDIyXHU3RUQzXHU2NzlDXHU1QzU1XHU3OTNBXHU1QzQyXHU3RUE3XG4gICAgaWYgKHJlbFBhdGgpIHtcbiAgICAgIGNvbnN0IHNlZ21lbnRzID0gcmVsUGF0aC5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKVxuICAgICAgY29uc3QgaXRlbUxpc3Q6IGFueVtdID0gW3tcbiAgICAgICAgJ0B0eXBlJzogJ0xpc3RJdGVtJyxcbiAgICAgICAgcG9zaXRpb246IDEsXG4gICAgICAgIG5hbWU6ICdcdTk5OTZcdTk4NzUnLFxuICAgICAgICBpdGVtOiBTSVRFX0hPU1RcbiAgICAgIH1dXG4gICAgICBsZXQgYWNjID0gJydcbiAgICAgIHNlZ21lbnRzLmZvckVhY2goKHNlZywgaWR4KSA9PiB7XG4gICAgICAgIGFjYyArPSAnLycgKyBzZWdcbiAgICAgICAgY29uc3QgbmFtZSA9IHBhZ2UuZnJvbnRtYXR0ZXIudGl0bGUgfHwgZGVjb2RlVVJJQ29tcG9uZW50KHNlZylcbiAgICAgICAgaXRlbUxpc3QucHVzaCh7XG4gICAgICAgICAgJ0B0eXBlJzogJ0xpc3RJdGVtJyxcbiAgICAgICAgICBwb3NpdGlvbjogaWR4ICsgMixcbiAgICAgICAgICBuYW1lLFxuICAgICAgICAgIGl0ZW06IGAke1NJVEVfSE9TVH0ke2FjY31gXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgdGFncy5wdXNoKFsnc2NyaXB0JywgeyB0eXBlOiAnYXBwbGljYXRpb24vbGQranNvbicgfSwgSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAnQGNvbnRleHQnOiAnaHR0cHM6Ly9zY2hlbWEub3JnJyxcbiAgICAgICAgJ0B0eXBlJzogJ0JyZWFkY3J1bWJMaXN0JyxcbiAgICAgICAgaXRlbUxpc3RFbGVtZW50OiBpdGVtTGlzdFxuICAgICAgfSldKVxuICAgIH1cblxuICAgIHJldHVybiB0YWdzXG4gIH0sXG5cbiAgLy8gXHU4MUVBXHU1MkE4XHU4ODY1XHU1MTY4XHU5ODc1XHU5NzYyXHU2M0NGXHU4RkYwXHVGRjFBXHU1RjUzIG1kIFx1NjcyQVx1NThGMFx1NjYwRSBkZXNjcmlwdGlvbiBcdTY1RjZcdUZGMENcdTRFQ0VcdTZFOTBcdTY1ODdcdTRFRjZcdTZCNjNcdTY1ODdcdTk5OTZcdTZCQjVcdTYzRDBcdTUzRDZcdTY0NThcdTg5ODFcdTRGNUNcdTRFM0EgbWV0YSBkZXNjcmlwdGlvblxuICAvLyBcdTYzRDBcdTUzRDZcdTg5QzRcdTUyMTlcdUZGMUFcdThERjNcdThGQzcgZnJvbnRtYXR0ZXIgLyBcdTRFRTNcdTc4MDFcdTU3NTcgLyBWdWUgXHU3RUM0XHU0RUY2XHU2ODA3XHU3QjdFIC8gXHU1RjE1XHU3NTI4XHU1NzU3XHVGRjBDXHU1M0Q2XHU3QjJDXHU0RTAwXHU2QkI1XHU3RUFGXHU2NTg3XHU2NzJDXHVGRjBDXHU2MjJBXHU2NUFEXHU1MjMwXHU3RUE2IDE1MCBcdTVCNTdcbiAgdHJhbnNmb3JtUGFnZURhdGEocGFnZURhdGEsIGN0eCkge1xuICAgIGlmIChwYWdlRGF0YS5mcm9udG1hdHRlci5kZXNjcmlwdGlvbikge1xuICAgICAgLy8gXHU1REYyXHU2NjNFXHU1RjBGXHU1OEYwXHU2NjBFXHVGRjBDXHU0RkREXHU3NTU5XHU1MzlGXHU1MDNDXHU1RTc2XHU1NDBDXHU2QjY1XHU1MjMwIGRlc2NyaXB0aW9uIFx1NUI1N1x1NkJCNVx1RkYwOFZpdGVQcmVzcyBcdTRGMUFcdThCRkJcdTUzRDZcdThCRTVcdTVCNTdcdTZCQjVcdTc1MUZcdTYyMTAgbWV0YVx1RkYwOVxuICAgICAgcGFnZURhdGEuZGVzY3JpcHRpb24gPSBwYWdlRGF0YS5mcm9udG1hdHRlci5kZXNjcmlwdGlvblxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIHBhZ2VEYXRhIFx1NkNBMVx1NjcwOSBjb250ZW50IFx1NUI1N1x1NkJCNVx1RkYwQ1x1OTcwMFx1NEVDRVx1NzhDMVx1NzZEOFx1OEJGQlx1NTNENlx1NkU5MCBtYXJrZG93biBcdTY1ODdcdTRFRjZcbiAgICBjb25zdCByZWwgPSAocGFnZURhdGEucmVsYXRpdmVQYXRoIHx8ICcnKS5yZXBsYWNlKC9cXFxcL2csICcvJylcbiAgICBpZiAoIXJlbCkgcmV0dXJuXG4gICAgY29uc3Qgc3JjRGlyID0gY3R4Py5zaXRlQ29uZmlnPy5zcmNEaXIgfHwgcHJvY2Vzcy5jd2QoKVxuICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5yZXNvbHZlKHNyY0RpciwgcmVsKVxuICAgIGxldCByYXcgPSAnJ1xuICAgIHRyeSB7XG4gICAgICByYXcgPSBmcy5yZWFkRmlsZVN5bmMoZnVsbFBhdGgsICd1dGYtOCcpXG4gICAgfSBjYXRjaCB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLy8gXHU1M0JCXHU2Mzg5IFlBTUwgZnJvbnRtYXR0ZXJcdUZGMDgtLS0gXHU1MzA1XHU4OEY5XHU1NzU3XHVGRjA5XG4gICAgcmF3ID0gcmF3LnJlcGxhY2UoL14tLS1cXHI/XFxuW1xcc1xcU10qP1xccj9cXG4tLS1cXHI/XFxuPy8sICcnKVxuICAgIGNvbnN0IGxpbmVzID0gcmF3LnNwbGl0KC9cXHI/XFxuLylcbiAgICBsZXQgZGVzYyA9ICcnXG4gICAgbGV0IGluQ29kZUZlbmNlID0gZmFsc2VcbiAgICBmb3IgKGNvbnN0IGxpbmUgb2YgbGluZXMpIHtcbiAgICAgIGNvbnN0IHRyaW1tZWQgPSBsaW5lLnRyaW0oKVxuICAgICAgaWYgKHRyaW1tZWQuc3RhcnRzV2l0aCgnYGBgJykpIHsgaW5Db2RlRmVuY2UgPSAhaW5Db2RlRmVuY2U7IGNvbnRpbnVlIH1cbiAgICAgIGlmIChpbkNvZGVGZW5jZSkgY29udGludWVcbiAgICAgIC8vIFx1OERGM1x1OEZDN1x1NjgwN1x1OTg5OFx1MzAwMVx1NUYxNVx1NzUyOFx1MzAwMVZ1ZSBcdTdFQzRcdTRFRjZcdTMwMDFIVE1MIFx1NjgwN1x1N0I3RVx1MzAwMVx1NTIxN1x1ODg2OFx1N0IyNlx1NTNGN1x1MzAwMVx1NUJCOVx1NTY2OFx1NjNEMFx1NzkzQVxuICAgICAgaWYgKCF0cmltbWVkKSBjb250aW51ZVxuICAgICAgaWYgKHRyaW1tZWQuc3RhcnRzV2l0aCgnIycpKSBjb250aW51ZVxuICAgICAgaWYgKHRyaW1tZWQuc3RhcnRzV2l0aCgnPicpKSBjb250aW51ZVxuICAgICAgaWYgKHRyaW1tZWQuc3RhcnRzV2l0aCgnPCcpKSBjb250aW51ZVxuICAgICAgaWYgKHRyaW1tZWQuc3RhcnRzV2l0aCgnOjo6JykpIGNvbnRpbnVlXG4gICAgICBpZiAoL15bLSorXFxkXS8udGVzdCh0cmltbWVkKSkgY29udGludWVcbiAgICAgIC8vIFx1NTNCQlx1OTY2NFx1ODg0Q1x1NTE4NSBNYXJrZG93biBcdThCRURcdTZDRDVcdUZGMENcdTRGRERcdTc1NTlcdTdFQUZcdTY1ODdcdTY3MkNcbiAgICAgIGNvbnN0IHRleHQgPSB0cmltbWVkXG4gICAgICAgIC5yZXBsYWNlKC9gKFteYF0rKWAvZywgJyQxJylcbiAgICAgICAgLnJlcGxhY2UoL1xcKlxcKihbXipdKylcXCpcXCovZywgJyQxJylcbiAgICAgICAgLnJlcGxhY2UoL1xcKihbXipdKylcXCovZywgJyQxJylcbiAgICAgICAgLnJlcGxhY2UoL1xcWyhbXlxcXV0rKVxcXVxcKFteKV0rXFwpL2csICckMScpXG4gICAgICAgIC5yZXBsYWNlKC8hXFxbW15cXF1dKlxcXVxcKFteKV0rXFwpL2csICcnKVxuICAgICAgICAudHJpbSgpXG4gICAgICBpZiAodGV4dC5sZW5ndGggPj0gOCkge1xuICAgICAgICBkZXNjID0gdGV4dFxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZGVzYykge1xuICAgICAgLy8gXHU2MjJBXHU2NUFEXHU1MjMwIDE1MCBcdTVCNTdcdTdCMjZcdUZGMENcdTkwN0ZcdTUxNERcdTY0MUNcdTdEMjJcdTdFRDNcdTY3OUNcdTY0NThcdTg5ODFcdThGQzdcdTk1N0ZcdTg4QUJcdTYyMkFcdTY1QURcbiAgICAgIHBhZ2VEYXRhLmRlc2NyaXB0aW9uID0gZGVzYy5sZW5ndGggPiAxNTAgPyBkZXNjLnNsaWNlKDAsIDE1MCkgKyAnXHUyMDI2JyA6IGRlc2NcbiAgICAgIHBhZ2VEYXRhLmZyb250bWF0dGVyLmRlc2NyaXB0aW9uID0gcGFnZURhdGEuZGVzY3JpcHRpb25cbiAgICB9XG4gIH0sXG5cbiAgLy8gTWFya2Rvd24gXHU5MTREXHU3RjZFXG4gIG1hcmtkb3duOiB7XG4gICAgdGhlbWU6IHtcbiAgICAgIGxpZ2h0OiAndml0ZXNzZS1saWdodCcsXG4gICAgICBkYXJrOiAndml0ZXNzZS1kYXJrJ1xuICAgIH0sXG4gICAgbGluZU51bWJlcnM6IHRydWUsIC8vIFx1NjYzRVx1NzkzQVx1NEVFM1x1NzgwMVx1ODg0Q1x1NTNGN1xuICAgIGNvbmZpZyhtZCkge1xuICAgICAgbWQudXNlKE1lcm1haWRNYXJrZG93bik7XG4gICAgICAvLyBcdTdFRDlcdTYyNDBcdTY3MDkgbWFya2Rvd24gXHU1NkZFXHU3MjQ3XHU4MUVBXHU1MkE4XHU1MkEwIGxvYWRpbmc9XCJsYXp5XCIsXHU1MUNGXHU1QzExXHU5NzVFXHU5OTk2XHU1QzRGXHU1NkZFXHU3MjQ3XHU1RTc2XHU1M0QxXHU4QkY3XHU2QzQyXG4gICAgICBjb25zdCBkZWZhdWx0SW1hZ2UgPSBtZC5yZW5kZXJlci5ydWxlcy5pbWFnZVxuICAgICAgbWQucmVuZGVyZXIucnVsZXMuaW1hZ2UgPSAodG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgc2VsZikgPT4ge1xuICAgICAgICBjb25zdCB0b2tlbiA9IHRva2Vuc1tpZHhdXG4gICAgICAgIGlmICh0b2tlbi5hdHRySW5kZXgoJ2xvYWRpbmcnKSA8IDApIHRva2VuLmF0dHJQdXNoKFsnbG9hZGluZycsICdsYXp5J10pXG4gICAgICAgIHJldHVybiBkZWZhdWx0SW1hZ2UodG9rZW5zLCBpZHgsIG9wdGlvbnMsIGVudiwgc2VsZilcbiAgICAgIH1cbiAgICAgIC8vIG1jZnVuY3Rpb24gXHU0RTBEXHU2NjJGIFNoaWtpIFx1NTE4NVx1N0Y2RVx1OEJFRFx1OEEwMFx1RkYwQ1x1NjYyMFx1NUMwNFx1NTIzMCBiYXNoIFx1OEJFRFx1NkNENVx1OUFEOFx1NEVBRVx1RkYwOFx1NkNFOFx1OTFDQS9cdTU0N0RcdTRFRTRcdTk4Q0VcdTY4M0NcdTYzQTVcdThGRDFcdUZGMDlcbiAgICAgIGNvbnN0IGZlbmNlID0gbWQucmVuZGVyZXIucnVsZXMuZmVuY2UhXG4gICAgICBtZC5yZW5kZXJlci5ydWxlcy5mZW5jZSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgIGNvbnN0IFt0b2tlbnMsIGlkeF0gPSBhcmdzXG4gICAgICAgIGNvbnN0IHRva2VuID0gdG9rZW5zW2lkeF1cbiAgICAgICAgY29uc3QgaW5mbyA9IHRva2VuLmluZm8udHJpbSgpXG4gICAgICAgIGlmICghaW5mby5zdGFydHNXaXRoKCdtY2Z1bmN0aW9uJykpIHJldHVybiBmZW5jZSguLi5hcmdzKVxuICAgICAgICB0b2tlbi5pbmZvID0gaW5mby5yZXBsYWNlKCdtY2Z1bmN0aW9uJywgJ2Jhc2gnKVxuICAgICAgICBsZXQgaHRtbCA9IGZlbmNlKC4uLmFyZ3MpXG4gICAgICAgIHRva2VuLmluZm8gPSBpbmZvXG4gICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoL2NsYXNzPVwibGFuZ3VhZ2UtYmFzaFwiL2csICdjbGFzcz1cImxhbmd1YWdlLW1jZnVuY3Rpb25cIicpXG4gICAgICAgIGh0bWwgPSBodG1sLnJlcGxhY2UoLz5iYXNoPC9nLCAnPm1jZnVuY3Rpb248JylcbiAgICAgICAgcmV0dXJuIGh0bWxcbiAgICAgIH1cbiAgICB9LFxuICB9LFxuXG4gIC8vIFZpdGUgXHU5MTREXHU3RjZFXG4gIHZpdGU6IHtcbiAgICBkZWZpbmU6IHtcbiAgICAgIF9fQlVJTERfSURfXzogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYuR0lUSFVCX1JVTl9OVU1CRVIgfHwgJ2RldicpLFxuICAgICAgX19CVUlMRF9TSEFfXzogSlNPTi5zdHJpbmdpZnkocHJvY2Vzcy5lbnYuR0lUSFVCX1NIQSA/IHByb2Nlc3MuZW52LkdJVEhVQl9TSEEuc3Vic3RyaW5nKDAsIDcpIDogJycpLFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgTWVybWFpZFBsdWdpbigpIGFzIGFueSxcbiAgICAgIGFkZENvbnRyaWJ1dG9yc1BsdWdpbigpIGFzIGFueSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBmaW5kOiAvXi4qXFwvVlBOYXZCYXJFeHRyYVxcLnZ1ZSQvLFxuICAgICAgICAgIHJlcGxhY2VtZW50OiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi90aGVtZS9jb21wb25lbnRzL3Z1ZS9DdXN0b21OYXZCYXJFeHRyYS52dWUnKVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFsnbWVybWFpZCcsICd2dWUnXVxuICAgIH0sXG4gICAgc3NyOiB7XG4gICAgICBub0V4dGVybmFsOiBbJ21lcm1haWQnLCAvXnZpdGVwcmVzcy9dXG4gICAgfSxcbiAgICAvLyBcdTY3ODRcdTVFRkFcdTRGMThcdTUzMTZcbiAgICBidWlsZDoge1xuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAyMDAwLCAvLyBcdTYzRDBcdTlBRDggY2h1bmsgXHU1OTI3XHU1QzBGXHU4QjY2XHU1NDRBXHU5NjUwXHU1MjM2XG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLCAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTUxNzNcdTk1RUQgc291cmNlbWFwXG4gICAgICBtaW5pZnk6ICdlc2J1aWxkJyxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICAvLyBtZXJtYWlkIFx1NTNDQVx1NTE3Nlx1NzUxRlx1NjAwMVx1NEY5RFx1OEQ1Nlx1NTM1NVx1NzJFQ1x1NTIwNlx1NTMwNVx1RkYwQ1x1NTIyOVx1NzUyOCBSb2xsdXAgXHU4MUVBXHU1MkE4XHU4OUUzXHU2NzkwXHU0RjlEXHU4RDU2XHU1MTczXHU3Q0ZCXHU5MDdGXHU1MTREXHU1RkFBXHU3M0FGIGNodW5rXG4gICAgICAgICAgICAndmVuZG9yLW1lcm1haWQnOiBbJ21lcm1haWQnXSxcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgZnM6IHtcbiAgICAgICAgYWxsb3c6IFsnLi4nLCAnLiddIC8vIFx1NTE0MVx1OEJCOFx1OEJCRlx1OTVFRVx1NzIzNlx1NzZFRVx1NUY1NVx1NTQ4Q1x1NUY1M1x1NTI0RFx1NzZFRVx1NUY1NVxuICAgICAgfSxcbiAgICAgIGhtcjoge1xuICAgICAgICBvdmVybGF5OiB0cnVlIC8vIFx1NjYzRVx1NzkzQVx1OTUxOVx1OEJFRlx1ODk4Nlx1NzZENlx1NUM0MlxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgXG4gIC8vIFx1NEUzQlx1OTg5OFx1OTE0RFx1N0Y2RVxuICB0aGVtZUNvbmZpZzoge1xuICAgIC8vIFx1NjQxQ1x1N0QyMlx1OTE0RFx1N0Y2RVxuICAgIHNlYXJjaDoge1xuICAgICAgcHJvdmlkZXI6ICdsb2NhbCcsLy8gYWxnb2xpYVxuICAgICAgb3B0aW9uczoge1xuICAgICAgICBsb2NhbGVzOiB7XG4gICAgICAgICAgcm9vdDoge1xuICAgICAgICAgICAgdHJhbnNsYXRpb25zOiB7XG4gICAgICAgICAgICAgIGJ1dHRvbjoge1xuICAgICAgICAgICAgICAgIGJ1dHRvblRleHQ6ICdcdTY0MUNcdTdEMjJcdTY1ODdcdTY4NjMnLFxuICAgICAgICAgICAgICAgIGJ1dHRvbkFyaWFMYWJlbDogJ1x1NjQxQ1x1N0QyMlx1NjU4N1x1Njg2MydcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgbW9kYWw6IHtcbiAgICAgICAgICAgICAgICBub1Jlc3VsdHNUZXh0OiAnXHU2NUUwXHU2Q0Q1XHU2MjdFXHU1MjMwXHU3NkY4XHU1MTczXHU3RUQzXHU2NzlDJyxcbiAgICAgICAgICAgICAgICByZXNldEJ1dHRvblRpdGxlOiAnXHU2RTA1XHU5NjY0XHU2N0U1XHU4QkUyXHU2NzYxXHU0RUY2JyxcbiAgICAgICAgICAgICAgICBmb290ZXI6IHtcbiAgICAgICAgICAgICAgICAgIHNlbGVjdFRleHQ6ICdcdTkwMDlcdTYyRTknLFxuICAgICAgICAgICAgICAgICAgbmF2aWdhdGVUZXh0OiAnXHU1MjA3XHU2MzYyJyxcbiAgICAgICAgICAgICAgICAgIGNsb3NlVGV4dDogJ1x1NTE3M1x1OTVFRCcsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkZXRhaWxlZFZpZXc6IHRydWUsXG4gICAgICAgIG1pbmlTZWFyY2g6IHtcbiAgICAgICAgICBzZWFyY2hPcHRpb25zOiB7XG4gICAgICAgICAgICAvLyBcdTZBMjFcdTdDQ0FcdTUzMzlcdTkxNEQgKyBcdTUyNERcdTdGMDBcdTUzMzlcdTkxNERcdUZGMENcdTUxN0NcdTk4N0VcdTYyRkNcdTUxOTlcdTVCQjlcdTk1MTlcdTRFMEVcdTUxNzNcdTk1MkVcdThCQ0RcdTUyNERcdTdGMDBcdTU0N0RcdTRFMkRcbiAgICAgICAgICAgIGZ1enp5OiAwLjIsXG4gICAgICAgICAgICBwcmVmaXg6IHRydWUsXG4gICAgICAgICAgICBjb21iaW5lV2l0aDogJ0FORCcsXG4gICAgICAgICAgICAvLyBcdTY3NDNcdTkxQ0RcdTUyMDZcdTkxNERcdUZGMUFcdTY4MDdcdTk4OThcdTU0N0RcdTRFMkRcdTY3NDNcdTkxQ0RcdTY3MDBcdTlBRDhcdUZGMDhcdTRGMThcdTUxNDhcdTVDNTVcdTc5M0FcdTY4MDdcdTk4OThcdTUzMzlcdTkxNERcdTc2ODRcdTk4NzVcdTk3NjJcdUZGMDlcdUZGMENcbiAgICAgICAgICAgIC8vIFx1NTE4NVx1NUJCOVx1NTQ3RFx1NEUyRFx1NEY1Q1x1NEUzQVx1ODg2NVx1NTE0NVx1RkYwQ1x1NjNEMFx1NTM0N1x1NTE3M1x1OTUyRVx1OEJDRFx1NjhDMFx1N0QyMlx1NzY4NFx1N0NCRVx1NTFDNlx1NUVBNlx1NEUwRVx1NjM5Mlx1NUU4Rlx1OEQyOFx1OTFDRlxuICAgICAgICAgICAgYm9vc3Q6IHsgdGl0bGU6IDYsIGNvbnRlbnQ6IDEsIGhlYWRpbmc6IDMgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAgLy8gXHU1QkZDXHU4MjJBXHU2ODBGXG4gICAgbmF2OiBbXG4gICAgICB7IHRleHQ6ICdcdTk5OTZcdTk4NzUnLCBsaW5rOiAnLycgfSxcbiAgICAgIHsgXG4gICAgICAgIHRleHQ6ICdcdTczQTlcdTZDRDVcdTRFQ0JcdTdFQ0QnLFxuICAgICAgICBsaW5rOiAnL2ZlYXR1cmVzLycsXG4gICAgICAgIGFjdGl2ZU1hdGNoOiAnXi9mZWF0dXJlcy8nXG4gICAgICB9LFxuICAgICAgeyBcbiAgICAgICAgdGV4dDogJ1x1NzNBOVx1NUJCNlx1NjI0Qlx1NTE4QycsIFxuICAgICAgICBsaW5rOiAnL21hbnVhbC9yZXZpZXcnLFxuICAgICAgICBhY3RpdmVNYXRjaDogJ14vbWFudWFsLydcbiAgICAgIH0sXG4gICAgICB7IFxuICAgICAgICB0ZXh0OiAnXHU1RjAwXHU1M0QxXHU2NTg3XHU2ODYzJywgXG4gICAgICAgIGxpbms6ICcvZGV2ZWxvcC90ZWFtJyxcbiAgICAgICAgYWN0aXZlTWF0Y2g6ICdeL2RldmVsb3AvJ1xuICAgICAgfSxcbiAgICAgIHsgXG4gICAgICAgIHRleHQ6ICdcdTUzOUZcdTUyMUJcdTYzRDJcdTRFRjYnLCBcbiAgICAgICAgbGluazogJy9wbHVnaW5zL2luZm8nLFxuICAgICAgICBhY3RpdmVNYXRjaDogJ14vcGx1Z2lucy8nXG4gICAgICB9LFxuICAgICAge1xuICAgICAgIHRleHQ6ICdcdTc2RjhcdTUxNzNcdTk0RkVcdTYzQTUnLCBcbiAgICAgICBpdGVtczogW1xuICAgICAgICAgeyBcbiAgICAgICAgICAgdGV4dDogJ1x1NzJEMFx1OThDRVx1OEY2OVx1NkM1MFx1MzA2RVx1NUMwRlx1N0E5RC1CbG9nJywgXG4gICAgICAgICAgIGxpbms6ICdodHRwczovL2Yud2luZGVtaWtvLnRvcCcsXG4gICAgICAgICAgIHRhcmdldDogJ19ibGFuaycsXG4gICAgICAgICAgIHJlbDogJ25vb3BlbmVyIG5vcmVmZXJyZXInXG4gICAgICAgICB9LFxuICAgICAgICAgeyBcbiAgICAgICAgICAgdGV4dDogJ1x1OEQ0NFx1NkU5MFx1NTIwNlx1NEVBQlx1NEUwQlx1OEY3RCcsIFxuICAgICAgICAgICBsaW5rOiAnaHR0cHM6Ly9zaGFyZS5mbm5hcy5uZXQvcy9hMzI4NzRhOGFiMzk0OTQ4YjQnLFxuICAgICAgICAgICB0YXJnZXQ6ICdfYmxhbmsnLFxuICAgICAgICAgICByZWw6ICdub29wZW5lciBub3JlZmVycmVyJ1xuICAgICAgICAgfSxcbiAgICAgICAgIHsgXG4gICAgICAgICAgIHRleHQ6ICdcdTU0RDRcdTU0RTlcdTU0RDRcdTU0RTkgLSBcdTcyRDBcdTk4Q0VcdThGNjlcdTZDNTAnLCBcbiAgICAgICAgICAgbGluazogJ2h0dHBzOi8vc3BhY2UuYmlsaWJpbGkuY29tLzM1OTE3NDM3MicsXG4gICAgICAgICAgIHRhcmdldDogJ19ibGFuaycsXG4gICAgICAgICAgIHJlbDogJ25vb3BlbmVyIG5vcmVmZXJyZXInXG4gICAgICAgICB9LFxuICAgICAgICAgeyBcbiAgICAgICAgICAgdGV4dDogJ0dpdEh1YiAtIFx1OTUxMFx1NzU0Q1x1NUU3Qlx1NTg4M1x1NjU4N1x1Njg2MycsIFxuICAgICAgICAgICBsaW5rOiAnaHR0cHM6Ly9naXRodWIuY29tL2Z3aW5kZW1pa28vTWlyYWdFZGdlLURvY1dlYicsXG4gICAgICAgICAgIHRhcmdldDogJ19ibGFuaycsXG4gICAgICAgICAgIHJlbDogJ25vb3BlbmVyIG5vcmVmZXJyZXInXG4gICAgICAgICB9LFxuICAgICAgIF1cbiAgICAgIH0sXG4gICAgXSxcblxuICAgIC8vIFx1NEZBN1x1OEZCOVx1NjgwRlx1OTE0RFx1N0Y2RVxuICAgIHNpZGViYXI6IHtcbiAgICAgICcvZmVhdHVyZXMvJzogW1xuICAgICAgICB7IHRleHQ6ICdcdUQ4M0RcdURDRDYgXHU3M0E5XHU2Q0Q1XHU2MDNCXHU4OUM4JywgbGluazogJy9mZWF0dXJlcy8nIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnXHVEODNDXHVERkUwIFx1NTdGQVx1Nzg0MFx1N0NGQlx1N0VERicsXG4gICAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgeyB0ZXh0OiAnXHU3RUNGXHU2RDRFXHU3Q0ZCXHU3RURGJywgbGluazogJy9mZWF0dXJlcy9iYXNlL2Vjb25vbXknIH0sXG4gICAgICAgICAgICB7IHRleHQ6ICdcdTczQTlcdTVCQjZcdTVERTVcdTRGMUEnLCBsaW5rOiAnL2ZlYXR1cmVzL2Jhc2UvcGxheWVyZ3VpbGQnIH0sXG4gICAgICAgICAgICB7IHRleHQ6ICdcdTVFN0JcdTU3REZcdTk4ODZcdTU3MzAnLCBsaW5rOiAnL2ZlYXR1cmVzL2Jhc2UvZG9tJyB9LFxuICAgICAgICAgICAgeyB0ZXh0OiAnXHU3MkVDXHU3Mjc5XHU1MjlGXHU4MEZEJywgbGluazogJy9mZWF0dXJlcy9iYXNlL2Z1bmN0aW9uJyB9LFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdcdUQ4M0NcdURGM0UgXHU3NTMwXHU1NkVEXHU3NTFGXHU2RDNCJyxcbiAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7IHRleHQ6ICdcdTVFRkFcdTdCNTFcdTU5MjdcdTVFMDgnLCBsaW5rOiAnL2ZlYXR1cmVzL3Bhc3RvcmFsL2J1aWxkZXInIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6ICdcdTc3MUZcdTVCOUVcdTVCNjNcdTgyODInLFxuICAgICAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU0RUNCXHU3RUNEJywgbGluazogJy9mZWF0dXJlcy9wYXN0b3JhbC9zZWFzb25zL2luZm8nIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU2RTI5XHU1RUE2XHU3Q0ZCXHU3RURGJywgbGluazogJy9mZWF0dXJlcy9wYXN0b3JhbC9zZWFzb25zL3RlbXBlcmF0dXJlJyB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NjYyNVx1NUI2MycsIGxpbms6ICcvZmVhdHVyZXMvcGFzdG9yYWwvc2Vhc29ucy9zcHJpbmcnIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1OTBGXHU1QjYzJywgbGluazogJy9mZWF0dXJlcy9wYXN0b3JhbC9zZWFzb25zL3N1bW1lcicgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTc5Q0JcdTVCNjMnLCBsaW5rOiAnL2ZlYXR1cmVzL3Bhc3RvcmFsL3NlYXNvbnMvZmFsbCcgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTUxQUNcdTVCNjMnLCBsaW5rOiAnL2ZlYXR1cmVzL3Bhc3RvcmFsL3NlYXNvbnMvd2ludGVyJyB9LFxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiAnXHU2NkY0XHU1OTFBXHU5NDkzXHU5QzdDJyxcbiAgICAgICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NEVDQlx1N0VDRCcsIGxpbms6ICcvZmVhdHVyZXMvcGFzdG9yYWwvZmlzaGluZy9pbmZvJyB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1OUM3Q1x1N0FGRlx1OEZEQlx1OTYzNicsIGxpbms6ICcvZmVhdHVyZXMvcGFzdG9yYWwvZmlzaGluZy9yb2RzJyB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1OUM3Q1x1N0M3Qlx1NTZGRVx1OTI3NCcsIGxpbms6ICcvZmVhdHVyZXMvcGFzdG9yYWwvZmlzaGluZy9maXNoJyB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1OTQ5M1x1OUM3Q1x1NkJENFx1OEQ1QicsIGxpbms6ICcvZmVhdHVyZXMvcGFzdG9yYWwvZmlzaGluZy9jb21wZXRpdGlvbnMnIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU5QzdDXHU5OTc1XHU3Q0ZCXHU3RURGJywgbGluazogJy9mZWF0dXJlcy9wYXN0b3JhbC9maXNoaW5nL2JhaXRzJyB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1N0VGNFx1NUVBNlx1OTQ5M1x1OUM3QycsIGxpbms6ICcvZmVhdHVyZXMvcGFzdG9yYWwvZmlzaGluZy9kaW1lbnNpb25zJyB9LFxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiAnXHU2NkY0XHU1OTFBXHU3OUNEXHU2OTBEJyxcbiAgICAgICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NEVDQlx1N0VDRCcsIGxpbms6ICcvZmVhdHVyZXMvcGFzdG9yYWwvY3JvdXBzL2luZm8nIH0sXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6ICdcdTY2RjRcdTU5MUFcdTk4REZcdTcyNjknLFxuICAgICAgICAgICAgICBjb2xsYXBzZWQ6IHRydWUsXG4gICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU5OERGXHU3MjY5XHU2MDNCXHU4OUM4JywgbGluazogJy9mZWF0dXJlcy9wYXN0b3JhbC9mb29kL2luZm8nIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU2NUU5XHU5OTEwXHU3QjgwXHU5OTEwJywgbGluazogJy9mZWF0dXJlcy9wYXN0b3JhbC9mb29kL2JyZWFrZmFzdCcgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTdDRDZcdTY3OUNcdTk2RjZcdTk4REYnLCBsaW5rOiAnL2ZlYXR1cmVzL3Bhc3RvcmFsL2Zvb2Qvc25hY2tzJyB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NkM5OVx1NjJDOVx1NTFDOVx1ODNEQycsIGxpbms6ICcvZmVhdHVyZXMvcGFzdG9yYWwvZm9vZC9zYWxhZHMnIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU3MEQ4XHU3MTE5XHU3Q0Q1XHU3MEI5JywgbGluazogJy9mZWF0dXJlcy9wYXN0b3JhbC9mb29kL2Jha2VyeScgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTRFM0JcdTgzRENcdTgwODlcdTk4REYnLCBsaW5rOiAnL2ZlYXR1cmVzL3Bhc3RvcmFsL2Zvb2QvbWFpbnMnIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU5OTZFXHU1NEMxJywgbGluazogJy9mZWF0dXJlcy9wYXN0b3JhbC9mb29kL2RyaW5rcycgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTc1MUNcdTU0QzEnLCBsaW5rOiAnL2ZlYXR1cmVzL3Bhc3RvcmFsL2Zvb2QvZGVzc2VydHMnIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU3MTRFXHU4NkNCXHU3Q0ZCXHU1MjE3JywgbGluazogJy9mZWF0dXJlcy9wYXN0b3JhbC9mb29kL2VnZ3MnIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU3Mjc5XHU4MjcyXHU5OERGXHU3MjY5JywgbGluazogJy9mZWF0dXJlcy9wYXN0b3JhbC9mb29kL3NwZWNpYWwnIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU5OERGXHU3MjY5XHU5MDFGXHU2N0U1XHU4ODY4JywgbGluazogJy9mZWF0dXJlcy9wYXN0b3JhbC9mb29kL3JlZmVyZW5jZScgfSxcbiAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnXHUyNjk0XHVGRTBGIFx1NTE5Mlx1OTY2OVx1NjIxOFx1NjU5NycsXG4gICAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiAnXHU3QjQ5XHU3RUE3XHU2MDJBXHU3MjY5JyxcbiAgICAgICAgICAgICAgbGluazogJy9mZWF0dXJlcy9hZHZlbnR1cmUvbGV2ZWxsZWRtb2JzJyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6ICdcdTZCN0JcdTRFQTFcdThGNkVcdTU2REUnLFxuICAgICAgICAgICAgICBsaW5rOiAnL2ZlYXR1cmVzL2FkdmVudHVyZS9kZWF0aHJlaW5jYXJuYXRpb24nLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogJ1x1NjYxRlx1OEY4OVx1OTUxQVx1NzBCOScsXG4gICAgICAgICAgICAgIGxpbms6ICcvZmVhdHVyZXMvYWR2ZW50dXJlL21pcmFnZWRnZWhvbWUnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogJ1x1OTc5OFx1N0ZDNVx1N0VEMVx1NUI5QScsXG4gICAgICAgICAgICAgIGxpbms6ICcvZmVhdHVyZXMvYWR2ZW50dXJlL2VseXRyYWJpbmQnLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogJ1x1NzlGMFx1NTNGN1x1NEUwRVx1NzY3Qlx1NTczQScsXG4gICAgICAgICAgICAgIGxpbms6ICcvZmVhdHVyZXMvYWR2ZW50dXJlL2lkZW50aXR5JyxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6ICdcdTI3MjggXHU2NkY0XHU1OTFBXHU5NjQ0XHU5QjU0JyxcbiAgICAgICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NEVDQlx1N0VDRCcsIGxpbms6ICcvZmVhdHVyZXMvYWR2ZW50dXJlL2VuY2hhbnRtZW50cy9pbmZvJyB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1NTRDMVx1OEQyOFx1N0I0OVx1N0VBNycsIGxpbms6ICcvZmVhdHVyZXMvYWR2ZW50dXJlL2VuY2hhbnRtZW50cy9yYXJpdHknIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU5NjQ0XHU5QjU0XHU1MjE3XHU4ODY4JywgbGluazogJy9mZWF0dXJlcy9hZHZlbnR1cmUvZW5jaGFudG1lbnRzL2xpc3QnIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU1MjA2XHU3QzdCXHU2NDJEXHU5MTREJywgbGluazogJy9mZWF0dXJlcy9hZHZlbnR1cmUvZW5jaGFudG1lbnRzL2dyb3VwJyB9LFxuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1OTY0NFx1OUI1NFx1N0JBMVx1NzQwNicsIGxpbms6ICcvZmVhdHVyZXMvYWR2ZW50dXJlL2VuY2hhbnRtZW50cy9zeXN0ZW0nIH0sXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHRleHQ6ICdcdTI2OTRcdUZFMEYgXHU4OEM1XHU1OTA3XHU1MzQ3XHU3RUE3JyxcbiAgICAgICAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTRFQ0JcdTdFQ0QnLCBsaW5rOiAnL2ZlYXR1cmVzL2FkdmVudHVyZS9tbW8vaW5mbycgfSxcbiAgICAgICAgICAgICAgICB7IHRleHQ6ICdcdTk1M0JcdTkwMjBcdTUzNDdcdTdFQTcnLCBsaW5rOiAnL2ZlYXR1cmVzL2FkdmVudHVyZS9tbW8vZm9yZ2UnIH0sXG4gICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgXSxcblxuICAgICAgJy9tYW51YWwvJzogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJ1x1RDgzRFx1RENDQyBcdTVGQzVcdTc3MEJcdTYzMDdcdTUzNTcnLFxuICAgICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1NkIyMlx1OEZDRVx1NjcwQlx1NTNDQicsIGxpbms6ICcvbWFudWFsL3JldmlldycgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1NzNBOVx1NUJCNlx1NUI4OFx1NTIxOScsIGxpbms6ICcvbWFudWFsL2V1bGEnIH0sXG4gICAgICAgICAgICB7IHRleHQ6ICdcdTUxNjVcdTY3MERcdTY1QjlcdTZDRDUnLCBsaW5rOiAnL21hbnVhbC90dXRvcmlhbC9zZXJ2ZXJqb2luJyB9LFxuICAgICAgICAgICAgeyB0ZXh0OiAnXHU2MjRCXHU2NzNBXHU1RkM1XHU3NzBCJywgbGluazogJy9tYW51YWwvdHV0b3JpYWwvYmVkcm9jaycgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1NzUxRlx1NzUzNVx1NEUwRVx1NzI3OVx1NjAyNycsIGxpbms6ICcvbWFudWFsL3JlZHN0b25lX21lY2hhbmlzbScgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1NUJBMlx1NjIzN1x1N0FFRlx1NUI4OVx1ODhDNScsIGxpbms6ICcvbWFudWFsL3R1dG9yaWFsL2NsaWVudGluc3RhbGwnIH0sXG4gICAgICAgICAgICB7IHRleHQ6ICdcdTVFMzhcdTg5QzFcdTk1RUVcdTk4OTgnLCBsaW5rOiAnL21hbnVhbC9mYXEnIH0sXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJ1x1RDgzRFx1REQyNyBcdTk2NDRcdTVDNUVcdTUyOUZcdTgwRkRcdTY1NTlcdTdBMEInLFxuICAgICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1NzY3RFx1NTQwRFx1NTM1NVx1N0NGQlx1N0VERicsIGxpbms6ICcvbWFudWFsL3R1dG9yaWFsL3doaXRlbGlzdCcgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1OEJFRFx1OTdGM1x1OTg5MVx1OTA1MycsIGxpbms6ICcvbWFudWFsL2Z1bmN0aW9uL3ZvaWNlY2hhbm5lbCcgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1N0ZBNFx1NjcwRFx1NEU5Mlx1OTAxQVx1NjczQVx1NTY2OFx1NEVCQScsIGxpbms6ICcvbWFudWFsL2Z1bmN0aW9uL3FxYm90JyB9LFxuICAgICAgICAgICAgeyB0ZXh0OiAnTU9EXHU2MkQzXHU1QzU1XHU1MjlGXHU4MEZEXHU2NTJGXHU2MzAxJywgbGluazogJy9tYW51YWwvZnVuY3Rpb24vbW9kJyB9LFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdcdUQ4M0RcdURDNjUgXHU3OTNFXHU1MzNBXHU0RUE0XHU2RDQxJyxcbiAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7IHRleHQ6ICdRUSBcdTdGQTRcdTdFQzQnLCBsaW5rOiAnL21hbnVhbC9xcV9ncm91cCcgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1NEUxNlx1NzU0Q1x1ODlDMlx1NjU0NVx1NEU4QicsIGxpbms6ICcvbWFudWFsL290aGVyL3dvcmxkdmlldycgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1NUJBM1x1NEYyMFx1NjNBOFx1NUU3RicsIGxpbms6ICcvbWFudWFsL3Byb21vdGlvbicgfSxcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnXHVEODNEXHVERUE5IFx1NTM4Nlx1NTNGMlx1NEU4Qlx1NEVGNlx1OEJCMFx1NUY1NScsXG4gICAgICAgICAgY29sbGFwc2VkOiB0cnVlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7IHRleHQ6ICcyMDI2XHU1MTQzXHU2NUU2XHU1NDA4XHU3MTY3XHU3RUFBXHU1RkY1XHU2RDNCXHU1MkE4JywgbGluazogJy9tYW51YWwvYWN0aXZlLzIwMjYwMTAxJyB9LFxuICAgICAgICAgICAgeyB0ZXh0OiAnXHU2NUIwXHU2NzBEXHU2NTcwXHU2MzZFXHU0RTIyXHU1OTMxXHU0RThCXHU0RUY2JywgbGluazogJy9tYW51YWwvYWN0aXZlLzIwMjUxMjI1JyB9LFxuICAgICAgICAgICAgeyB0ZXh0OiAnXHU1QjU4XHU2ODYzXHU2NTcwXHU2MzZFXHU5MUNEXHU3RjZFJywgbGluazogJy9tYW51YWwvYWN0aXZlLzIwMjUxMDE3JyB9LFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgIF0sXG5cbiAgICAgICcvZGV2ZWxvcC8nOiBbXG4gICAgICAgIHsgdGV4dDogJ1x1RDgzRFx1REM2NSBcdTVGMDBcdTUzRDFcdTU2RTJcdTk2MUYnLCBsaW5rOiAnL2RldmVsb3AvdGVhbScgfSxcbiAgICAgICAgeyB0ZXh0OiAnXHVEODNEXHVEQ0NDIFx1NUY4NVx1NTI5RVx1NEU4Qlx1OTg3OScsIGxpbms6ICcvZGV2ZWxvcC90b2RvJyB9LFxuICAgICAgICAvKiB7XG4gICAgICAgICAgdGV4dDogJ1x1RDgzQ1x1REZBRSBcdTYzRDJcdTRFRjZcdTVGMDBcdTUzRDEnLFxuICAgICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1RDgzRFx1RENDQiBcdTk4NzlcdTc2RUVcdTVGMDBcdTUzRDFcdThCRjRcdTY2MEUnLCBsaW5rOiAnL2RldmVsb3AvbWNfcGx1Z2lucy9pbmRleCcgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogJ1x1RDgzRFx1RENDQSBcdTUzOUZcdTUyMUJcdTYzRDJcdTRFRjZcdTUyMTdcdTg4NjgnLFxuICAgICAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgICAgIHsgdGV4dDogJ1x1RDgzRVx1REQ4QSBcdTcyRDBcdTk4Q0VcdThGNjlcdTZDNTAnLCBsaW5rOiAnL2RldmVsb3AvbWNfcGx1Z2lucy9md2luZGVtaWtvJyB9LFxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF1cbiAgICAgICAgIH0sKi9cbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdcdTI2OTlcdUZFMEYgXHU2M0QyXHU0RUY2XHU5MTREXHU3RjZFJyxcbiAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7IHRleHQ6ICdcdThEMzRcdTU2RkVcdTVCNTdcdTdCMjZcdTc4MDEnLCBsaW5rOiAnL2RldmVsb3Avc2VydmVyX2NvbmZpZ3Mvc3RpY2tlcicgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1ODFFQVx1NUI5QVx1NEU0OVx1NEY1Q1x1NzI2OScsIGxpbms6ICcvZGV2ZWxvcC9zZXJ2ZXJfY29uZmlncy9jdXN0b21jcm9wcycgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1OTQ5M1x1OUM3Q1x1N0NGQlx1N0VERicsIGxpbms6ICcvZGV2ZWxvcC9zZXJ2ZXJfY29uZmlncy9maXNoaW5nJyB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICB0ZXh0OiAnXHUyNzI4IFx1NjZGNFx1NTkxQVx1OTY0NFx1OUI1NCcsXG4gICAgICAgICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU5NjQ0XHU5QjU0XHU5MTREXHU3RjZFXHU2NTU5XHU3QTBCJywgbGluazogJy9kZXZlbG9wL3NlcnZlcl9jb25maWdzL2VuY2hhbnRpbmcnIH0sXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAnXHU5NjQ0XHU5QjU0SURcdTVCRjlcdTcxNjdcdTg4NjgnLCBsaW5rOiAnL2RldmVsb3Avc2VydmVyX2NvbmZpZ3MvZW5jaGFudG1lbnRfaWRzJyB9LFxuICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdcdUQ4M0VcdURERTkgXHU1RjAwXHU1M0QxXHU1REU1XHU0RjVDXHU2RDQxJyxcbiAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7IHRleHQ6ICdcdTY1NzBcdTYzNkVcdTUzMDVcdTVCQTJcdTUyMzZcdTUzMTYoQUkgU2tpbGxzKScsIGxpbms6ICcvZGV2ZWxvcC93b3JrZmxvd3MvZGF0YXBhY2std29ya2Zsb3cnIH0sXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJ1x1RDgzQ1x1REZBRiBcdTczQTlcdTZDRDVcdThCQkVcdThCQTEnLFxuICAgICAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICAgICAgaXRlbXM6IFtcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1OEQ1Qlx1NUI2M1x1NzNBOVx1NkNENVx1OEJCRVx1OEJBMVx1NjVCOVx1Njg0OCcsIGxpbms6ICcvZGV2ZWxvcC9nYW1lcGxheS9saXZlb3BzXzI2MDEwNycgfSxcbiAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnXHVEODNDXHVERjEwIFx1N0Y1MVx1N0FEOVx1NUYwMFx1NTNEMScsXG4gICAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgeyB0ZXh0OiAnXHU4MUVBXHU1MkE4XHU1NkZFXHU1MENGXHU3RUM0XHU0RUY2JywgbGluazogJy9kZXZlbG9wL3dlYmRldi9hdXRvaW1hZ2UnIH0sXG4gICAgICAgICAgICB7IHRleHQ6ICdcdTc3RTJcdTkxQ0ZcdTU2RkVcdTY4MDdcdTVFOTMnLCBsaW5rOiAnL2RldmVsb3Avd2ViZGV2L3ZlY3Rvcmljb25zJyB9LFxuICAgICAgICAgICAgeyB0ZXh0OiAnTUNcdTkxNERcdTY1QjlcdTdFQzRcdTRFRjYnLCBsaW5rOiAnL2RldmVsb3Avd2ViZGV2L21jcmVjaXBlJyB9LFxuICAgICAgICAgIF1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICdcdUQ4M0RcdURDQ0IgXHU5NjQ0XHU1RjU1JyxcbiAgICAgICAgICBjb2xsYXBzZWQ6IGZhbHNlLFxuICAgICAgICAgIGl0ZW1zOiBbXG4gICAgICAgICAgICB7IHRleHQ6ICdcdTY2RjRcdTY1QjBcdTY1RTVcdTVGRDcnLCBsaW5rOiAnL2RldmVsb3AvbG9ncycgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1ODI4Mlx1NzBCOVx1NzJCNlx1NjAwMScsIGxpbms6ICcvZGV2ZWxvcC9zZXJ2ZXJzdGF0dXMnIH0sXG4gICAgICAgICAgICB7IHRleHQ6ICdcdThCQTFcdTdCOTdcdTY3MERcdTUyQTEnLCBsaW5rOiAnL2RldmVsb3AvY2NzX3ByaWNlX2xpc3QnIH0sXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgXSxcblxuICAgICAgJy9wbHVnaW5zLyc6IFtcbiAgICAgICAgeyB0ZXh0OiAnXHVEODNEXHVEQ0NCIFx1OTg3OVx1NzZFRVx1NUYwMFx1NTNEMVx1OEJGNFx1NjYwRScsIGxpbms6ICcvcGx1Z2lucy9pbmZvJyB9LFxuICAgICAgICB7IHRleHQ6ICdcdUQ4M0RcdURDQ0EgXHU1MzlGXHU1MjFCXHU2M0QyXHU0RUY2XHU1MjE3XHU4ODY4JywgbGluazogJy9wbHVnaW5zL2xpc3QnIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnXHUyNjk0XHVGRTBGIFBWUFx1N0FERVx1NjI4MFx1NTczQVx1N0NGQlx1N0VERicsXG4gICAgICAgICAgY29sbGFwc2VkOiBmYWxzZSxcbiAgICAgICAgICBpdGVtczogW1xuICAgICAgICAgICAgeyB0ZXh0OiAnXHU1Qjg5XHU4OEM1XHU5MTREXHU3RjZFJywgbGluazogJy9wbHVnaW5zL2ZlcHZwLycgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1N0FERVx1NjI4MFx1NTczQVx1N0JBMVx1NzQwNicsIGxpbms6ICcvcGx1Z2lucy9mZXB2cC9hcmVuYScgfSxcbiAgICAgICAgICAgIHsgdGV4dDogJ1x1ODhDNVx1NTkwN1x1N0VDNFx1NTQwOFx1N0JBMVx1NzQwNicsIGxpbms6ICcvcGx1Z2lucy9mZXB2cC9raXQnIH0sXG4gICAgICAgICAgICB7IHRleHQ6ICdcdTczQTlcdTVCQjZcdTYzMDdcdTUzNTcnLCBsaW5rOiAnL3BsdWdpbnMvZmVwdnAvZ3VpZGUnIH0sXG4gICAgICAgICAgICB7IHRleHQ6ICdcdTkxNERcdTdGNkVcdTUzQzJcdTgwMDMnLCBsaW5rOiAnL3BsdWdpbnMvZmVwdnAvY29uZmlnJyB9LFxuICAgICAgICAgICAgeyB0ZXh0OiAnXHU2NzQzXHU5NjUwXHU4MjgyXHU3MEI5JywgbGluazogJy9wbHVnaW5zL2ZlcHZwL3Blcm1pc3Npb25zJyB9LFxuICAgICAgICAgICAgeyB0ZXh0OiAnXHU1NDdEXHU0RUU0XHU1M0MyXHU4MDAzJywgbGluazogJy9wbHVnaW5zL2ZlcHZwL2NvbW1hbmRzJyB9LFxuICAgICAgICAgICAgeyB0ZXh0OiAnXHU2NTcwXHU2MzZFXHU1QjU4XHU1MEE4JywgbGluazogJy9wbHVnaW5zL2ZlcHZwL3N0b3JhZ2UnIH0sXG4gICAgICAgICAgXVxuICAgICAgICB9LFxuICAgICAgICB7IHRleHQ6ICdcdUQ4M0NcdURGMUYgXHU2NjFGXHU4Rjg5XHU5NTFBXHU3MEI5JywgbGluazogJy9wbHVnaW5zL21pcmFnZWRnZWhvbWUnIH0sXG4gICAgICAgIHsgdGV4dDogJ1x1RDgzQ1x1REZGN1x1RkUwRiBcdTc5RjBcdTUzRjdcdTRFMEVcdTUxNjVcdTY3MERcdTZEODhcdTYwNkYnLCBsaW5rOiAnL3BsdWdpbnMvbWlyYWdlZGdldGl0bGUnIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAgLy8gXHU1OTI3XHU3RUIyXHU5MTREXHU3RjZFXG4gICAgb3V0bGluZToge1xuICAgICAgbGV2ZWw6IFsxLCA0XSxcbiAgICAgIGxhYmVsOiAnXHU2NzJDXHU5ODc1XHU3NkVFXHU1RjU1J1xuICAgIH0sXG4gICAgcmV0dXJuVG9Ub3BMYWJlbDogJ1x1OEZENFx1NTZERVx1OTg3Nlx1OTBFOCcsXG4gICAgXG4gICAgLy8gXHU3OTNFXHU0RUE0XHU5NEZFXHU2M0E1XG4gICAgLy8gc29jaWFsTGlua3M6IFtcbiAgICAvLyAgIHsgXG4gICAgLy8gICAgIGljb246ICdiaWxpYmlsaScsIFxuICAgIC8vICAgICBsaW5rOiAnaHR0cHM6Ly9zcGFjZS5iaWxpYmlsaS5jb20vMzU5MTc0MzcyJyxcbiAgICAvLyAgICAgYXJpYUxhYmVsOiAnXHVEODNEXHVEQ0ZBIFx1NTRENFx1NTRFOVx1NTRENFx1NTRFOSAtIFx1NzJEMFx1OThDRVx1OEY2OVx1NkM1MCdcbiAgICAvLyAgIH0sXG4gICAgLy8gICB7IFxuICAgIC8vICAgICBpY29uOiAnZ2l0aHViJywgXG4gICAgLy8gICAgIGxpbms6ICdodHRwczovL2dpdGh1Yi5jb20vZndpbmRlbWlrby9NaXJhZ0VkZ2UtRG9jV2ViJyxcbiAgICAvLyAgICAgYXJpYUxhYmVsOiAnXHVEODNEXHVEQ0U2IEdpdEh1YiAtIFx1OTUxMFx1NzU0Q1x1NUU3Qlx1NTg4M1x1NjU4N1x1Njg2MydcbiAgICAvLyAgIH0sXG4gICAgLy8gXSxcbiAgICBcbiAgICAvLyBcdTY3MDBcdTU0MEVcdTY2RjRcdTY1QjBcdTY1RjZcdTk1RjRcbiAgICBsYXN0VXBkYXRlZDoge1xuICAgICAgdGV4dDogXCJcdTY3MDBcdTU0MEVcdTY2RjRcdTY1QjBcIixcbiAgICAgIGZvcm1hdE9wdGlvbnM6IHtcbiAgICAgICAgZGF0ZVN0eWxlOiBcInNob3J0XCIsXG4gICAgICAgIHRpbWVTdHlsZTogXCJzaG9ydFwiLFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgLy8gXHU3RjE2XHU4RjkxXHU5NEZFXHU2M0E1IC0gXHU1MkE4XHU2MDAxXHU4REYzXHU4RjZDXHU1MjMwXHU1RjUzXHU1MjREXHU5ODc1XHU3Njg0R2l0SHViXHU3RjE2XHU4RjkxXHU5ODc1XG4gICAgZWRpdExpbms6IHtcbiAgICAgIHBhdHRlcm46ICdodHRwczovL2dpdGh1Yi5jb20vZndpbmRlbWlrby9NaXJhZ0VkZ2UtRG9jV2ViL2VkaXQvbWFpbi86cGF0aCcsXG4gICAgICB0ZXh0OiAnXHU1NzI4IEdpdEh1YiBcdTRFMEFcdTdGMTZcdThGOTFcdTZCNjRcdTk4NzUnXG4gICAgfSxcbiAgICBcbiAgICAvLyBcdTZERjFcdTgyNzJcdTZBMjFcdTVGMEZcdTUyMDdcdTYzNjJcbiAgICBkYXJrTW9kZVN3aXRjaExhYmVsOiAnXHU1OTE2XHU4OUMyJyxcbiAgICBcbiAgICAvLyBcdTRGQTdcdThGQjlcdTY4MEZcdTgzRENcdTUzNTVcdTY1ODdcdTY3MkNcbiAgICBzaWRlYmFyTWVudUxhYmVsOiAnXHU4M0RDXHU1MzU1JyxcbiAgICBcbiAgICAvLyBcdTY1ODdcdTY4NjNcdTk4NzVcdTgxMUFcdTkxNERcdTdGNkVcbiAgICBkb2NGb290ZXI6IHtcbiAgICAgIHByZXY6ICdcdTRFMEFcdTRFMDBcdTdCQzcnLFxuICAgICAgbmV4dDogJ1x1NEUwQlx1NEUwMFx1N0JDNydcbiAgICB9LFxuICAgIFxuICAgIC8vIFx1OEZENFx1NTZERVx1OTg3Nlx1OTBFOFx1NjMwOVx1OTRBRVx1RkYwOFZpdGVQcmVzcyBcdTlFRDhcdThCQTRcdTU0MkZcdTc1MjhcdUZGMDlcbiAgICBcbiAgICAvLyBcdTU5MTZcdTkwRThcdTk0RkVcdTYzQTVcdTU2RkVcdTY4MDdcbiAgICBleHRlcm5hbExpbmtJY29uOiB0cnVlLFxuICB9LFxuICBcbiAgLy8gXHU3RjEzXHU1QjU4XHU5MTREXHU3RjZFXG4gIGNhY2hlRGlyOiAnLi8udml0ZXByZXNzL2NhY2hlJyxcbiAgXG4gIFxuICAvLyBcdTZFMDVcdTc0MDZcdTZCN0JcdTk0RkVcdThCNjZcdTU0NEFcbiAgaWdub3JlRGVhZExpbmtzOiBbXG4gICAgLy8gXHU5ODg0XHU3NTU5XHU5ODc1XHU5NzYyXHVGRjFBXHU2NTg3XHU0RUY2XHU1QzFBXHU2NzJBXHU1MjFCXHU1RUZBXHU0RjQ2XHU1NzI4IG5hdi9zaWRlYmFyIFx1NEUyRFx1NUYxNVx1NzUyOFx1NjVGNlx1NTcyOFx1NkI2NFx1NUZGRFx1NzU2NVxuICBdLFxuICBcbiAgLy8gXHU4MUVBXHU1QjlBXHU0RTQ5IFNpdGVtYXAoXHU2NDFDXHU3RDIyXHU2NjIwXHU1QzA0XHU4ODY4KSBcdTc1MUZcdTYyMTBcbiAgc2l0ZW1hcDoge1xuICAgIGhvc3RuYW1lOiAnaHR0cHM6Ly9taXJhZ2VkZ2UudG9wJ1xuICB9XG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxNaXJhZ0VkZ2UtRG9jV2ViXFxcXC52aXRlcHJlc3NcXFxcdGhlbWVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkY6XFxcXE1pcmFnRWRnZS1Eb2NXZWJcXFxcLnZpdGVwcmVzc1xcXFx0aGVtZVxcXFxhZGRDb250cmlidXRvcnMudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Y6L01pcmFnRWRnZS1Eb2NXZWIvLnZpdGVwcmVzcy90aGVtZS9hZGRDb250cmlidXRvcnMudHNcIjtpbXBvcnQgdHlwZSB7IFBsdWdpbiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHNpbXBsZUdpdCBmcm9tICdzaW1wbGUtZ2l0JztcbmltcG9ydCB7IE9jdG9raXQgfSBmcm9tICdAb2N0b2tpdC9yZXN0JztcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgKiBhcyBkb3RlbnYgZnJvbSAnZG90ZW52JztcbmltcG9ydCB7IGV4ZWNTeW5jIH0gZnJvbSBcImNoaWxkX3Byb2Nlc3NcIjtcblxuLy8gXHU1MkEwXHU4RjdEXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXG5kb3RlbnYuY29uZmlnKCk7XG5cbi8vIFx1N0M3Qlx1NTc4Qlx1NUI5QVx1NEU0OVxudHlwZSBFbWFpbFdpdGhTaGExID0geyBlbWFpbDogc3RyaW5nOyBzaGExOiBzdHJpbmcgfTtcbnR5cGUgRW1haWxXaXRoVXNlcm5hbWUgPSB7IGVtYWlsOiBzdHJpbmc7IHVzZXJuYW1lOiBzdHJpbmcgfTtcbnR5cGUgRnVsbENvbnRyaWJ1dG9yRGF0YSA9IHtcbiAgdXNlcm5hbWU6IHN0cmluZztcbiAgbmlja25hbWU6IHN0cmluZztcbiAgYXZhdGFyOiBzdHJpbmc7XG4gIGVtYWlsczogc3RyaW5nW107XG59O1xuXG4vLyBcdTkxNERcdTdGNkVcbmNvbnN0IG93bmVyID0gJ2Z3aW5kZW1pa28nOyAvLyBcdTRGNjBcdTc2ODRHaXRIdWJcdTc1MjhcdTYyMzdcdTU0MERcbmNvbnN0IHJlcG8gPSAnTWlyYWdFZGdlLURvY1dlYic7IC8vIFx1NEY2MFx1NzY4NFx1NEVEM1x1NUU5M1x1NTQwRFxuXG4vLyBcdTUyMURcdTU5Q0JcdTUzMTZcbmNvbnN0IGdpdCA9IHNpbXBsZUdpdCgpO1xubGV0IGdoVG9rZW4gPSBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU47XG5pZiAoIWdoVG9rZW4pIHtcbiAgdHJ5IHsgZ2hUb2tlbiA9IGV4ZWNTeW5jKCdnaCBhdXRoIHRva2VuJywgeyBlbmNvZGluZzogJ3V0Zi04JyB9KS50cmltKCk7IH0gY2F0Y2gge31cbn1cbmNvbnN0IG9jdG9raXQgPSBuZXcgT2N0b2tpdCh7XG4gIGF1dGg6IGdoVG9rZW4sXG59KTtcblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTRFRDNcdTVFOTNcdTYyNDBcdTY3MDlcdThEMjFcdTczMkVcdTgwMDVcdTc2ODRFbWFpbFx1NTQ4Q1x1NUJGOVx1NUU5NFx1NzY4NFx1NEUwMFx1NEUyQVNIQTFcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0UmVwb0NvbnRyaWJ1dG9ycygpOiBQcm9taXNlPEVtYWlsV2l0aFNoYTFbXT4ge1xuICB0cnkge1xuICAgIC8vIFx1NEY3Rlx1NzUyOCBnaXQucmF3IFx1ODNCN1x1NTNENlx1NTM5Rlx1NTlDQlx1OEY5M1x1NTFGQVx1RkYwQ1x1OTA3Rlx1NTE0RCBzaW1wbGUtZ2l0IGxvZygpIFx1NUJGOVx1ODFFQVx1NUI5QVx1NEU0OSBmb3JtYXQgXHU3Njg0XHU4OUUzXHU2NzkwXHU5NUVFXHU5ODk4XG4gICAgY29uc3QgcmF3T3V0cHV0ID0gYXdhaXQgZ2l0LnJhdyhbJ2xvZycsICctLWZvcm1hdD0lYWUgJUgnXSk7XG4gICAgY29uc3QgbG9nTGluZXMgPSByYXdPdXRwdXQuc3BsaXQoJ1xcbicpLmZpbHRlcihsaW5lID0+IGxpbmUudHJpbSgpKTtcblxuICAgIGlmIChsb2dMaW5lcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnNvbGUud2FybignTm8gY29tbWl0cyBmb3VuZCBpbiByZXBvc2l0b3J5Jyk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgY29uc3QgY29udHJpYnV0b3JzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZz4oKTtcblxuICAgIC8vIFx1NTNCQlx1OTFDRFx1RkYwQ1x1NTNFQVx1NEZERFx1NzU1OVx1NkJDRlx1NEUyQUVtYWlsXHU3Njg0XHU3QjJDXHU0RTAwXHU0RTJBY29tbWl0XHVGRjA4cmV2ZXJzZSBcdTU0MEVcdTY3MDBcdTY1RTlcdTYzRDBcdTRFQTRcdTRGMThcdTUxNDhcdUZGMDlcbiAgICBsb2dMaW5lcy5yZXZlcnNlKCkuZm9yRWFjaCgoY29tbWl0KSA9PiB7XG4gICAgICBjb25zdCBbZW1haWwsIHNoYTFdID0gY29tbWl0LnNwbGl0KCcgJyk7XG4gICAgICBpZiAoZW1haWwgJiYgc2hhMSAmJiAhY29udHJpYnV0b3JzLmhhcyhlbWFpbCkpIHtcbiAgICAgICAgY29udHJpYnV0b3JzLnNldChlbWFpbCwgc2hhMSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gQXJyYXkuZnJvbShjb250cmlidXRvcnMpLm1hcCgoW2VtYWlsLCBzaGExXSkgPT4gKHtcbiAgICAgIGVtYWlsOiBlbWFpbC50cmltKCksXG4gICAgICBzaGExXG4gICAgfSkpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGdldHRpbmcgcmVwbyBjb250cmlidXRvcnM6JywgZXJyb3IpO1xuICAgIHJldHVybiBbXTtcbiAgfVxufVxuXG4vKipcbiAqIFx1OTAxQVx1OEZDN1NIQTFcdTY3RTVcdThCRTJHaXRIdWJcdTc1MjhcdTYyMzdcdTU0MERcbiAqL1xuYXN5bmMgZnVuY3Rpb24gcXVlcnlVc2VybmFtZShcbiAgeyBlbWFpbCwgc2hhMSB9OiBFbWFpbFdpdGhTaGExLFxuICBvY3Rva2l0OiBPY3Rva2l0XG4pOiBQcm9taXNlPEVtYWlsV2l0aFVzZXJuYW1lIHwgbnVsbD4ge1xuICB0cnkge1xuICAgIGNvbnN0IGNvbW1pdERhdGEgPSBhd2FpdCBvY3Rva2l0LnJlc3QucmVwb3MuZ2V0Q29tbWl0KHtcbiAgICAgIG93bmVyLFxuICAgICAgcmVwbyxcbiAgICAgIHJlZjogc2hhMSxcbiAgICB9KTtcbiAgICBcbiAgICBjb25zdCBhdXRob3IgPSBjb21taXREYXRhLmRhdGE/LmF1dGhvcjtcbiAgICBpZiAoIWF1dGhvciB8fCAhYXV0aG9yLmxvZ2luKSB7XG4gICAgICBjb25zb2xlLndhcm4oYE5vIEdpdEh1YiBhdXRob3IgZm91bmQgZm9yIGVtYWlsOiAke2VtYWlsfSwgc2hhMTogJHtzaGExfWApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiB7IFxuICAgICAgZW1haWw6IGVtYWlsLnRyaW0oKSwgXG4gICAgICB1c2VybmFtZTogYXV0aG9yLmxvZ2luIFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihgRXJyb3IgcXVlcnlpbmcgdXNlcm5hbWUgZm9yICR7ZW1haWx9OmAsIGVycm9yKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFx1NjdFNVx1OEJFMlx1NUI4Q1x1NjU3NFx1NzUyOFx1NjIzN1x1NEZFMVx1NjA2RlxuICovXG5hc3luYyBmdW5jdGlvbiBxdWVyeUZ1bGxEYXRhTGlzdChcbiAgZW1haWxUdXBsZXM6IEVtYWlsV2l0aFVzZXJuYW1lW10sXG4gIG9jdG9raXQ6IE9jdG9raXRcbik6IFByb21pc2U8RnVsbENvbnRyaWJ1dG9yRGF0YVtdPiB7XG4gIHRyeSB7XG4gICAgY29uc3QgdXNlcjJlbWFpbHMgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nW10+KCk7XG4gICAgXG4gICAgLy8gXHU1RjUyXHU1RTc2XHU1NDBDXHU0RTAwXHU0RTJBXHU3NTI4XHU2MjM3XHU3Njg0XHU1OTFBXHU0RTJBRW1haWxcbiAgICBlbWFpbFR1cGxlcy5mb3JFYWNoKCh7IGVtYWlsLCB1c2VybmFtZSB9KSA9PiB7XG4gICAgICBpZiAodXNlcjJlbWFpbHMuaGFzKHVzZXJuYW1lKSkge1xuICAgICAgICB1c2VyMmVtYWlscy5nZXQodXNlcm5hbWUpIS5wdXNoKGVtYWlsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVzZXIyZW1haWxzLnNldCh1c2VybmFtZSwgW2VtYWlsXSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgXG4gICAgLy8gXHU2N0U1XHU4QkUyXHU2QkNGXHU0RTJBXHU3NTI4XHU2MjM3XHU3Njg0XHU4QkU2XHU3RUM2XHU0RkUxXHU2MDZGXG4gICAgY29uc3QgZnVsbERhdGFQcm9taXNlcyA9IEFycmF5LmZyb20odXNlcjJlbWFpbHMuZW50cmllcygpKS5tYXAoXG4gICAgICBhc3luYyAoW3VzZXJuYW1lLCBlbWFpbHNdKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgdXNlckRhdGEgPSBhd2FpdCBvY3Rva2l0LnJlc3QudXNlcnMuZ2V0QnlVc2VybmFtZSh7IHVzZXJuYW1lIH0pO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB1c2VybmFtZSxcbiAgICAgICAgICAgIG5pY2tuYW1lOiB1c2VyRGF0YS5kYXRhLm5hbWUgfHwgdXNlcm5hbWUsXG4gICAgICAgICAgICBhdmF0YXI6IHVzZXJEYXRhLmRhdGEuYXZhdGFyX3VybCxcbiAgICAgICAgICAgIGVtYWlscyxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYEVycm9yIGdldHRpbmcgdXNlciBkYXRhIGZvciAke3VzZXJuYW1lfTpgLCBlcnJvcik7XG4gICAgICAgICAgLy8gXHU4RkQ0XHU1NkRFXHU1N0ZBXHU3ODQwXHU0RkUxXHU2MDZGXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHVzZXJuYW1lLFxuICAgICAgICAgICAgbmlja25hbWU6IHVzZXJuYW1lLFxuICAgICAgICAgICAgYXZhdGFyOiBgaHR0cHM6Ly9naXRodWIuY29tLyR7dXNlcm5hbWV9LnBuZ2AsXG4gICAgICAgICAgICBlbWFpbHMsXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gICAgXG4gICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKGZ1bGxEYXRhUHJvbWlzZXMpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHF1ZXJ5aW5nIGZ1bGwgZGF0YSBsaXN0OicsIGVycm9yKTtcbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTYzMDdcdTVCOUFcdTY1ODdcdTRFRjZcdTc2ODRcdTYyNDBcdTY3MDlcdThEMjFcdTczMkVcdTgwMDVFbWFpbFxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRFbWFpbExpc3QoZmlsZVBhdGg6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgdHJ5IHtcbiAgICAvLyBcdTRGN0ZcdTc1MjggZ2l0LnJhdyBcdTgzQjdcdTUzRDZcdTUzOUZcdTU5Q0JcdThGOTNcdTUxRkFcbiAgICBjb25zdCByYXdPdXRwdXQgPSBhd2FpdCBnaXQucmF3KFsnbG9nJywgJy0tZm9ybWF0PSVhZScsICctLWZvbGxvdycsICctLW5vLW1lcmdlcycsIGZpbGVQYXRoXSk7XG4gICAgY29uc3QgbG9nTGluZXMgPSByYXdPdXRwdXRcbiAgICAgIC5zcGxpdCgnXFxuJylcbiAgICAgIC5maWx0ZXIoZW1haWwgPT4gZW1haWwgJiYgZW1haWwudHJpbSgpICE9PSAnJyk7XG5cbiAgICBpZiAobG9nTGluZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb25zb2xlLmxvZyhgTm8gY29udHJpYnV0b3JzIGZvdW5kIGZvciBmaWxlOiAke2ZpbGVQYXRofWApO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIC8vIFx1NTNCQlx1OTFDRFxuICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQobG9nTGluZXMubWFwKGVtYWlsID0+IGVtYWlsLnRyaW0oKSkpKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKGBFcnJvciBnZXR0aW5nIGVtYWlsIGxpc3QgZm9yICR7ZmlsZVBhdGh9OmAsIGVycm9yKTtcbiAgICByZXR1cm4gW107XG4gIH1cbn1cblxuLyoqXG4gKiBcdTRFM0JcdTUxRkRcdTY1NzBcdUZGMUFcdTgzQjdcdTUzRDZcdTYyNDBcdTY3MDlcdThEMjFcdTczMkVcdTgwMDVcdTRGRTFcdTYwNkZcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZ2V0QWxsQ29udHJpYnV0b3JzKCk6IFByb21pc2U8RnVsbENvbnRyaWJ1dG9yRGF0YVtdPiB7XG4gIGNvbnNvbGUubG9nKCdTdGFydGluZyB0byBmZXRjaCBjb250cmlidXRvciBpbmZvcm1hdGlvbi4uLicpO1xuICBcbiAgLy8gMS4gXHU4M0I3XHU1M0Q2XHU2MjQwXHU2NzA5XHU4RDIxXHU3MzJFXHU4MDA1XHU3Njg0RW1haWxcdTU0OENTSEExXG4gIGNvbnN0IGVtYWlsU2hhMUxpc3QgPSBhd2FpdCBnZXRSZXBvQ29udHJpYnV0b3JzKCk7XG4gIGNvbnNvbGUubG9nKGBGb3VuZCAke2VtYWlsU2hhMUxpc3QubGVuZ3RofSB1bmlxdWUgY29udHJpYnV0b3IgZW1haWxzYCk7XG4gIFxuICBpZiAoZW1haWxTaGExTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgXG4gIC8vIDIuIFx1NjdFNVx1OEJFMkdpdEh1Ylx1NzUyOFx1NjIzN1x1NTQwRFxuICBjb25zb2xlLmxvZygnUXVlcnlpbmcgR2l0SHViIHVzZXJuYW1lcy4uLicpO1xuICBjb25zdCB1c2VybmFtZVByb21pc2VzID0gZW1haWxTaGExTGlzdC5tYXAoaXRlbSA9PiBcbiAgICBxdWVyeVVzZXJuYW1lKGl0ZW0sIG9jdG9raXQpXG4gICk7XG4gIGNvbnN0IHVzZXJuYW1lUmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKHVzZXJuYW1lUHJvbWlzZXMpO1xuICBjb25zdCB2YWxpZFVzZXJuYW1lUmVzdWx0cyA9IHVzZXJuYW1lUmVzdWx0cy5maWx0ZXIoXG4gICAgKHJlc3VsdCk6IHJlc3VsdCBpcyBFbWFpbFdpdGhVc2VybmFtZSA9PiByZXN1bHQgIT09IG51bGxcbiAgKTtcbiAgY29uc29sZS5sb2coYFJlc29sdmVkICR7dmFsaWRVc2VybmFtZVJlc3VsdHMubGVuZ3RofSBHaXRIdWIgdXNlcm5hbWVzYCk7XG4gIFxuICAvLyAzLiBcdTY3RTVcdThCRTJcdTVCOENcdTY1NzRcdTc1MjhcdTYyMzdcdTRGRTFcdTYwNkZcbiAgY29uc29sZS5sb2coJ0ZldGNoaW5nIGZ1bGwgdXNlciBkYXRhLi4uJyk7XG4gIGNvbnN0IGZ1bGxDb250cmlidXRvckRhdGEgPSBhd2FpdCBxdWVyeUZ1bGxEYXRhTGlzdChcbiAgICB2YWxpZFVzZXJuYW1lUmVzdWx0cyxcbiAgICBvY3Rva2l0XG4gICk7XG4gIFxuICBjb25zb2xlLmxvZyhgU3VjY2Vzc2Z1bGx5IGZldGNoZWQgZGF0YSBmb3IgJHtmdWxsQ29udHJpYnV0b3JEYXRhLmxlbmd0aH0gY29udHJpYnV0b3JzYCk7XG4gIFxuICByZXR1cm4gZnVsbENvbnRyaWJ1dG9yRGF0YTtcbn1cblxuLyoqXG4gKiBcdTY4QzBcdTY3RTVcdTY2MkZcdTU0MjZcdTY2MkZcdTk5OTZcdTk4NzVcdTY1ODdcdTRFRjZcbiAqL1xuZnVuY3Rpb24gaXNIb21lUGFnZShjb2RlOiBzdHJpbmcsIGlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgLy8gXHU2NUI5XHU2Q0Q1MVx1RkYxQVx1NjhDMFx1NjdFNVx1NjU4N1x1NEVGNlx1NTQwRFxuICAvL2NvbnN0IGZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShpZCkudG9Mb3dlckNhc2UoKTtcbiAgLy9pZiAoZmlsZU5hbWUgPT09ICdpbmRleC5tZCcgfHwgZmlsZU5hbWUgPT09ICdyZWFkbWUubWQnKSB7XG4gIC8vICByZXR1cm4gdHJ1ZTtcbiAgLy99XG4gIFxuICAvLyBcdTY1QjlcdTZDRDUyXHVGRjFBXHU2OEMwXHU2N0U1XHU2NTg3XHU0RUY2XHU4REVGXHU1Rjg0XG4gIC8vY29uc3QgZmlsZVBhdGggPSBpZC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKS5yZXBsYWNlKC9eXFwvLywgJycpLnRvTG93ZXJDYXNlKCk7XG4gIC8vaWYgKGZpbGVQYXRoID09PSAnaW5kZXgubWQnIHx8IGZpbGVQYXRoID09PSAncmVhZG1lLm1kJykge1xuICAvLyAgcmV0dXJuIHRydWU7XG4gIC8vfVxuICBcbiAgLy8gXHU2NUI5XHU2Q0Q1M1x1RkYxQVx1NjhDMFx1NjdFNVx1NTE4NVx1NUJCOVx1NjYyRlx1NTQyNlx1NjcwOSBsYXlvdXQ6IGhvbWVcdUZGMDhcdTY3MDBcdTUzRUZcdTk3NjBcdTc2ODRcdTUyMjRcdTY1QURcdUZGMDlcbiAgaWYgKGNvZGUuaW5jbHVkZXMoJ2xheW91dDogaG9tZScpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgXG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBcdTgzQjdcdTUzRDZcdTRFRDNcdTVFOTNcdTYzRDBcdTRFQTRcdTZEM0JcdThEQzNcdTY1NzBcdTYzNkVcdTVFNzZcdTRGRERcdTVCNThcdTRFM0FcdTk3NTlcdTYwMDFKU09OXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZldGNoQW5kU2F2ZUFjdGl2aXR5RGF0YShlbWFpbE1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCBvdXRwdXRQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIFwicHVibGljXCIsIFwiZGF0YVwiLCBcImNvbnRyaWJ1dG9ycy1hY3Rpdml0eS5qc29uXCIpO1xuICBjb25zdCBkaXIgPSBwYXRoLmRpcm5hbWUob3V0cHV0UGF0aCk7XG4gIGlmICghZnMuZXhpc3RzU3luYyhkaXIpKSB7XG4gICAgZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG4gIH1cbiAgdHJ5IHtcbiAgICAvLyBVc2UgbG9jYWwgZ2l0IGxvZyBpbnN0ZWFkIG9mIEdpdEh1YiBBUEkgKC9zdGF0cy9jb250cmlidXRvcnMgb2Z0ZW4gc3R1Y2sgYXQgMjAyKVxuICAgIC8vIEZvcm1hdDogJWFlID0gYXV0aG9yIGVtYWlsLCAlYXQgPSBhdXRob3IgdGltZXN0YW1wICh1bml4KVxuICAgIGNvbnN0IHJhd0xvZyA9IGV4ZWNTeW5jKCdnaXQgbG9nIC0tZm9ybWF0PVwiJWFlICVhdFwiIC0tc2luY2U9XCIzIG1vbnRocyBhZ29cIiAtLW5vLW1lcmdlcycsIHsgZW5jb2Rpbmc6ICd1dGYtOCcgfSk7XG4gICAgY29uc3QgbGluZXMgPSByYXdMb2cudHJpbSgpLnNwbGl0KCdcXG4nKS5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICAvLyBHcm91cCBjb21taXRzIGJ5IGF1dGhvciBlbWFpbCwgdGhlbiBieSB3ZWVrXG4gICAgY29uc3QgZW1haWxDb21taXRzOiBSZWNvcmQ8c3RyaW5nLCB7IHc6IG51bWJlcjsgYzogbnVtYmVyIH1bXT4gPSB7fTtcbiAgICBjb25zdCBlbWFpbFRvdGFsczogUmVjb3JkPHN0cmluZywgbnVtYmVyPiA9IHt9O1xuXG4gICAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgICBjb25zdCBbZW1haWwsIHRzXSA9IGxpbmUuc3BsaXQoJyAnKTtcbiAgICAgIGNvbnN0IHQgPSBwYXJzZUludCh0cywgMTApO1xuICAgICAgaWYgKCFlbWFpbCB8fCBpc05hTih0KSkgY29udGludWU7XG4gICAgICAvLyBBbGlnbiB0byBNb25kYXkgb2YgdGhlIHdlZWsgKEdpdEh1YiB1c2VzIE1vbmRheS1iYXNlZCB3ZWVrcylcbiAgICAgIGNvbnN0IGQgPSBuZXcgRGF0ZSh0ICogMTAwMCk7XG4gICAgICBjb25zdCBkYXkgPSBkLmdldERheSgpO1xuICAgICAgY29uc3QgbW9uT2Zmc2V0ID0gZGF5ID09PSAwID8gNiA6IGRheSAtIDE7IC8vIFN1bmRheT0wIC0+IE1vbmRheT0wIG9mZnNldFxuICAgICAgY29uc3QgbW9uZGF5ID0gbmV3IERhdGUoZCk7XG4gICAgICBtb25kYXkuc2V0RGF0ZShkLmdldERhdGUoKSAtIG1vbk9mZnNldCk7XG4gICAgICBtb25kYXkuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gICAgICBjb25zdCB3ZWVrVHMgPSBNYXRoLmZsb29yKG1vbmRheS5nZXRUaW1lKCkgLyAxMDAwKTtcblxuICAgICAgaWYgKCFlbWFpbENvbW1pdHNbZW1haWxdKSB7XG4gICAgICAgIGVtYWlsQ29tbWl0c1tlbWFpbF0gPSBbXTtcbiAgICAgICAgZW1haWxUb3RhbHNbZW1haWxdID0gMDtcbiAgICAgIH1cbiAgICAgIGVtYWlsVG90YWxzW2VtYWlsXSsrO1xuXG4gICAgICBjb25zdCBleGlzdGluZyA9IGVtYWlsQ29tbWl0c1tlbWFpbF0uZmluZCh3ID0+IHcudyA9PT0gd2Vla1RzKTtcbiAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICBleGlzdGluZy5jKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbWFpbENvbW1pdHNbZW1haWxdLnB1c2goeyB3OiB3ZWVrVHMsIGM6IDEgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU29ydCB3ZWVrcyBmb3IgZWFjaCBlbWFpbFxuICAgIGZvciAoY29uc3QgZW1haWwgb2YgT2JqZWN0LmtleXMoZW1haWxDb21taXRzKSkge1xuICAgICAgZW1haWxDb21taXRzW2VtYWlsXS5zb3J0KChhLCBiKSA9PiBhLncgLSBiLncpO1xuICAgIH1cblxuICAgIC8vIE1hcCBlbWFpbHMgdG8gR2l0SHViIHVzZXJuYW1lcyBhbmQgbWVyZ2UgZHVwbGljYXRlc1xuICAgIGNvbnN0IG1lcmdlZCA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IFtlbWFpbCwgd2Vla3NdIG9mIE9iamVjdC5lbnRyaWVzKGVtYWlsQ29tbWl0cykpIHtcbiAgICAgIGNvbnN0IHVzZXJuYW1lID0gZW1haWxNYXBbZW1haWxdIHx8IGVtYWlsLnNwbGl0KCdAJylbMF07XG4gICAgICBpZiAoIW1lcmdlZC5oYXModXNlcm5hbWUpKSB7XG4gICAgICAgIG1lcmdlZC5zZXQodXNlcm5hbWUsIHsgbG9naW46IHVzZXJuYW1lLCB0b3RhbDogMCwgd2Vla3M6IG5ldyBNYXAoKSB9KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVudHJ5ID0gbWVyZ2VkLmdldCh1c2VybmFtZSk7XG4gICAgICBlbnRyeS50b3RhbCArPSBlbWFpbFRvdGFsc1tlbWFpbF07XG4gICAgICBmb3IgKGNvbnN0IHcgb2Ygd2Vla3MpIHtcbiAgICAgICAgZW50cnkud2Vla3Muc2V0KHcudywgKGVudHJ5LndlZWtzLmdldCh3LncpIHx8IDApICsgdy5jKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDb252ZXJ0IG1lcmdlZCBtYXAgdG8gcmVzdWx0IGZvcm1hdFxuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGZvciAoY29uc3QgZW50cnkgb2YgbWVyZ2VkLnZhbHVlcygpKSB7XG4gICAgICBjb25zdCB3ZWVrc0FyciA9IFtdO1xuICAgICAgZm9yIChjb25zdCBbdywgY10gb2YgZW50cnkud2Vla3MpIHtcbiAgICAgICAgd2Vla3NBcnIucHVzaCh7IHcsIGMgfSk7XG4gICAgICB9XG4gICAgICB3ZWVrc0Fyci5zb3J0KChhLCBiKSA9PiBhLncgLSBiLncpO1xuICAgICAgcmVzdWx0LnB1c2goe1xuICAgICAgICBhdXRob3I6IHsgbG9naW46IGVudHJ5LmxvZ2luIH0sXG4gICAgICAgIHRvdGFsOiBlbnRyeS50b3RhbCxcbiAgICAgICAgd2Vla3M6IHdlZWtzQXJyLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gU29ydCBieSB0b3RhbCBjb21taXRzIGRlc2NlbmRpbmdcbiAgICByZXN1bHQuc29ydCgoYSwgYikgPT4gYi50b3RhbCAtIGEudG90YWwpO1xuXG4gICAgZnMud3JpdGVGaWxlU3luYyhvdXRwdXRQYXRoLCBKU09OLnN0cmluZ2lmeShyZXN1bHQpLCBcInV0Zi04XCIpO1xuICAgIGNvbnNvbGUubG9nKFwiW2FjdGl2aXR5XSBTYXZlZCBcIiArIHJlc3VsdC5sZW5ndGggKyBcIiBjb250cmlidXRvcnMgKFwiICsgbGluZXMubGVuZ3RoICsgXCIgY29tbWl0cykgZnJvbSBnaXQgbG9nXCIpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUud2FybihcIlthY3Rpdml0eV0gRmFpbGVkOlwiLCAoZXJyb3IgYXMgRXJyb3IpLm1lc3NhZ2UpO1xuICAgIHRyeSB7IGZzLndyaXRlRmlsZVN5bmMob3V0cHV0UGF0aCwgSlNPTi5zdHJpbmdpZnkoW10pLCBcInV0Zi04XCIpOyB9IGNhdGNoIHt9XG4gIH1cbn1cblxuLyoqXG4gKiBWaXRlUGx1Z2luXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZENvbnRyaWJ1dG9yc1BsdWdpbigpOiBQbHVnaW4ge1xuICBsZXQgZnVsbENvbnRyaWJ1dG9yRGF0YTogRnVsbENvbnRyaWJ1dG9yRGF0YVtdID0gW107XG4gIGxldCBkYXRhTG9hZGVkID0gZmFsc2U7XG4gIFxuICByZXR1cm4ge1xuICAgIG5hbWU6ICd2aXRlLXBsdWdpbi1jb250cmlidXRvcnMnLFxuICAgIGVuZm9yY2U6ICdwcmUnLFxuICAgIFxuICAgIGFzeW5jIGJ1aWxkU3RhcnQoKSB7XG4gICAgICAvLyBcdTUzRUFcdTU3MjhcdTY3ODRcdTVFRkFcdTY1RjZcdTgzQjdcdTUzRDZcdTRFMDBcdTZCMjFcdTY1NzBcdTYzNkVcbiAgICAgIGlmICghZGF0YUxvYWRlZCkge1xuICAgICAgICBjb25zb2xlLmxvZygnTG9hZGluZyBjb250cmlidXRvciBkYXRhLi4uJyk7XG4gICAgICAgIGZ1bGxDb250cmlidXRvckRhdGEgPSBhd2FpdCBnZXRBbGxDb250cmlidXRvcnMoKTtcbiAgICAgICAgLy8gQnVpbGQgZW1haWxcdTIxOTJ1c2VybmFtZSBtYXAgZnJvbSBjb250cmlidXRvciBkYXRhXG4gICAgICAgIGNvbnN0IGVtYWlsTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgICAgIGZvciAoY29uc3QgYyBvZiBmdWxsQ29udHJpYnV0b3JEYXRhKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBlbWFpbCBvZiBjLmVtYWlscykge1xuICAgICAgICAgICAgZW1haWxNYXBbZW1haWxdID0gYy51c2VybmFtZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgZmV0Y2hBbmRTYXZlQWN0aXZpdHlEYXRhKGVtYWlsTWFwKTtcbiAgICAgICAgZGF0YUxvYWRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgfSxcbiAgICBcbiAgICBhc3luYyB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcbiAgICAgIC8vIFx1NTNFQVx1NTkwNFx1NzQwNiAubWQgXHU2NTg3XHU0RUY2XG4gICAgICBpZiAoIWlkLmVuZHNXaXRoKCcubWQnKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gXHU2OEMwXHU2N0U1XHU2NjJGXHU1NDI2XHU2NjJGXHU5OTk2XHU5ODc1XHVGRjBDXHU1OTgyXHU2NzlDXHU2NjJGXHU1MjE5XHU4REYzXHU4RkM3XHU1OTA0XHU3NDA2XG4gICAgICBpZiAoaXNIb21lUGFnZShjb2RlLCBpZCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coYFx1NjNEMlx1NEVGNjogXHU4REYzXHU4RkM3XHU5OTk2XHU5ODc1XHU2NTg3XHU0RUY2ICR7aWR9YCk7XG4gICAgICAgIHJldHVybiBjb2RlOyAvLyBcdTc2RjRcdTYzQTVcdThGRDRcdTU2REVcdUZGMENcdTRFMERcdTUwNUFcdTRFRkJcdTRGNTVcdTRGRUVcdTY1MzlcbiAgICAgIH1cbiAgICAgIFxuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gXHU4M0I3XHU1M0Q2XHU2NTg3XHU0RUY2XHU3NkY4XHU1QkY5XHU4REVGXHU1Rjg0XG4gICAgICAgIGNvbnN0IGZpbGVQYXRoID0gaWQucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykucmVwbGFjZSgvXlxcLy8sICcnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFx1ODNCN1x1NTNENlx1OEJFNVx1NjU4N1x1NEVGNlx1NzY4NFx1OEQyMVx1NzMyRVx1ODAwNUVtYWlsXHU1MjE3XHU4ODY4XG4gICAgICAgIGNvbnN0IGVtYWlsTGlzdCA9IGF3YWl0IGdldEVtYWlsTGlzdChmaWxlUGF0aCk7XG4gICAgICAgIFxuICAgICAgICBpZiAoZW1haWxMaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBjb2RlOyAvLyBcdTZDQTFcdTY3MDlcdThEMjFcdTczMkVcdTgwMDVcdUZGMENcdTRFMERcdTRGRUVcdTY1MzlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gXHU2N0U1XHU2MjdFXHU1QkY5XHU1RTk0XHU3Njg0XHU4RDIxXHU3MzJFXHU4MDA1XHU0RkUxXHU2MDZGXG4gICAgICAgIGNvbnN0IGZpbGVDb250cmlidXRvcnMgPSBlbWFpbExpc3RcbiAgICAgICAgICAubWFwKGVtYWlsID0+IFxuICAgICAgICAgICAgZnVsbENvbnRyaWJ1dG9yRGF0YS5maW5kKGNvbnRyaWJ1dG9yID0+IFxuICAgICAgICAgICAgICBjb250cmlidXRvci5lbWFpbHMuaW5jbHVkZXMoZW1haWwpXG4gICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICAgIC5maWx0ZXIoKGNvbnRyaWJ1dG9yKTogY29udHJpYnV0b3IgaXMgRnVsbENvbnRyaWJ1dG9yRGF0YSA9PiBcbiAgICAgICAgICAgIGNvbnRyaWJ1dG9yICE9PSB1bmRlZmluZWRcbiAgICAgICAgICApXG4gICAgICAgICAgLy8gXHU1M0JCXHU5MUNEXG4gICAgICAgICAgLmZpbHRlcigoY29udHJpYnV0b3IsIGluZGV4LCBhcnJheSkgPT5cbiAgICAgICAgICAgIGFycmF5LmZpbmRJbmRleChjID0+IGMudXNlcm5hbWUgPT09IGNvbnRyaWJ1dG9yLnVzZXJuYW1lKSA9PT0gaW5kZXhcbiAgICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgaWYgKGZpbGVDb250cmlidXRvcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuIGNvZGU7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIC8vIFx1NjgzQ1x1NUYwRlx1NTMxNlx1OEQyMVx1NzMyRVx1ODAwNVx1NTIxN1x1ODg2OCAtIFx1NjYzNVx1NzlGMCxcdTc1MjhcdTYyMzdcdTU0MEQgXHU2ODNDXHU1RjBGXG4gICAgICAgIGNvbnN0IGNvbnRyaWJ1dG9yTGlzdCA9IGZpbGVDb250cmlidXRvcnNcbiAgICAgICAgICAubWFwKGNvbnRyaWJ1dG9yID0+IGAke2NvbnRyaWJ1dG9yLm5pY2tuYW1lfSwke2NvbnRyaWJ1dG9yLnVzZXJuYW1lfWApXG4gICAgICAgICAgLmpvaW4oJzsnKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NjcwOUZyb250bWF0dGVyXG4gICAgICAgIGNvbnN0IGhhc0Zyb250bWF0dGVyID0gY29kZS50cmltKCkuc3RhcnRzV2l0aCgnLS0tJyk7XG4gICAgICAgIFxuICAgICAgICBpZiAoaGFzRnJvbnRtYXR0ZXIpIHtcbiAgICAgICAgICAvLyBcdTVERjJcdTY3MDlGcm9udG1hdHRlclx1RkYwQ1x1NjNEMlx1NTE2NWNvbnRyaWJ1dG9yc1x1NUI1N1x1NkJCNVxuICAgICAgICAgIGNvbnN0IGZyb250bWF0dGVyRW5kID0gY29kZS5pbmRleE9mKCctLS0nLCAzKTtcbiAgICAgICAgICBpZiAoZnJvbnRtYXR0ZXJFbmQgIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCBmcm9udG1hdHRlciA9IGNvZGUuc2xpY2UoMCwgZnJvbnRtYXR0ZXJFbmQgKyAzKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRlbnQgPSBjb2RlLnNsaWNlKGZyb250bWF0dGVyRW5kICsgMyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFx1NjhDMFx1NjdFNVx1NjYyRlx1NTQyNlx1NURGMlx1NjcwOWNvbnRyaWJ1dG9yc1x1NUI1N1x1NkJCNVxuICAgICAgICAgICAgaWYgKGZyb250bWF0dGVyLmluY2x1ZGVzKCdjb250cmlidXRvcnM6JykpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNvZGU7IC8vIFx1NEUwRFx1ODk4Nlx1NzZENlx1NURGMlx1NjcwOVx1NzY4NFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBcdTU3Mjhmcm9udG1hdHRlclx1NjcyQlx1NUMzRVx1RkYwOFx1NEY0Nlx1ODk4MVx1NTcyOFx1NjcwMFx1NTQwRVx1NzY4NC0tLVx1NEU0Qlx1NTI0RFx1RkYwOVx1NjNEMlx1NTE2NWNvbnRyaWJ1dG9yc1x1NUI1N1x1NkJCNVxuICAgICAgICAgICAgY29uc3QgbGFzdERhc2hJbmRleCA9IGZyb250bWF0dGVyLmxhc3RJbmRleE9mKCctLS0nKTtcbiAgICAgICAgICAgIGlmIChsYXN0RGFzaEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICBjb25zdCBiZWZvcmVEYXNoID0gZnJvbnRtYXR0ZXIuc2xpY2UoMCwgbGFzdERhc2hJbmRleCk7XG4gICAgICAgICAgICAgIGNvbnN0IGFmdGVyRGFzaCA9IGZyb250bWF0dGVyLnNsaWNlKGxhc3REYXNoSW5kZXgpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gXHU3ODZFXHU0RkREXHU2ODNDXHU1RjBGXHU2QjYzXHU3ODZFXHVGRjFBXHU1NzI4LS0tXHU0RTRCXHU1MjREXHU2M0QyXHU1MTY1XHVGRjBDXHU1RTc2XHU0RkREXHU3NTU5XHU2MzYyXHU4ODRDXG4gICAgICAgICAgICAgIHJldHVybiBgJHtiZWZvcmVEYXNoLnRyaW0oKX1cXG5jb250cmlidXRvcnM6ICR7Y29udHJpYnV0b3JMaXN0fVxcbiR7YWZ0ZXJEYXNofSR7Y29udGVudH1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8gXHU2Q0ExXHU2NzA5RnJvbnRtYXR0ZXJcdUZGMENcdTZERkJcdTUyQTBcdTY1QjBcdTc2ODRcbiAgICAgICAgcmV0dXJuIGAtLS1cXG5jb250cmlidXRvcnM6ICR7Y29udHJpYnV0b3JMaXN0fVxcbi0tLVxcblxcbiR7Y29kZX1gO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihgRXJyb3IgcHJvY2Vzc2luZyBmaWxlICR7aWR9OmAsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIGNvZGU7IC8vIFx1NTFGQVx1OTUxOVx1NjVGNlx1OEZENFx1NTZERVx1NTM5Rlx1NTE4NVx1NUJCOVxuICAgICAgfVxuICAgIH0sXG4gIH07XG59Il0sCiAgIm1hcHBpbmdzIjogIjtBQUEwUSxTQUFTLG9CQUFvQjtBQUN2UyxTQUFTLGVBQWUsdUJBQXVCOzs7QUNBL0MsT0FBTyxlQUFlO0FBQ3RCLFNBQVMsZUFBZTtBQUN4QixZQUFZLFFBQVE7QUFDcEIsWUFBWSxVQUFVO0FBQ3RCLFlBQVksWUFBWTtBQUN4QixTQUFTLGdCQUFnQjtBQUdsQixjQUFPO0FBYWQsSUFBTSxRQUFRO0FBQ2Qs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
