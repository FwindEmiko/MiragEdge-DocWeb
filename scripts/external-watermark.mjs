/**
 * 外部图片水印映射生成器 v2.0
 *
 * 构建时扫描所有 .md 文件，提取外部图片 URL（http/https），
 * 生成 URL 映射表供 markdown-it 插件、SmartImage 组件和 Service Worker 使用。
 *
 * 本脚本不下载图片——实际下载和加水印由浏览器端 Service Worker 按需完成，
 * 处理结果缓存在浏览器的 Cache API 中。
 *
 * 输出：public/external-wm-map.json
 *   { "https://oss.miragedge.top/...": "/external-wm/{hash}.{ext}" }
 *
 * 支持格式：.png .jpg .jpeg .webp（.gif 等跳过，保留原始外链）
 */

import { createHash } from "crypto";
import { readdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join, extname, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MAP_FILE = join(ROOT, "public", "external-wm-map.json");

// 支持水印的图片格式
const SUPPORTED_EXTS = [".png", ".jpg", ".jpeg", ".webp"];

// 扫描时跳过的目录
const SKIP_DIRS = new Set([
  "node_modules",
  ".vitepress",
  "public",
  "scripts",
  "build",
  "docs",
  ".git",
]);

// 匹配 Markdown 中外部图片 URL 的正则：
//   ![alt](https://...)  或  src="https://..."  或  src='https://...'
const EXTERNAL_URL_RE = /(?:!\[[^\]]*\]\(|src=["'])(https?:\/\/[^"')\s]+)/g;

// =============== 工具函数 ===============

function hashUrl(url) {
  return createHash("sha1").update(url).digest("hex").slice(0, 16);
}

function getExtFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    return extname(pathname).toLowerCase();
  } catch {
    return "";
  }
}

// =============== 扫描 .md 文件提取外部 URL ===============

function scanMarkdownFiles(dir) {
  const files = [];
  (function walk(d) {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) {
        if (!SKIP_DIRS.has(e.name)) walk(join(d, e.name));
      } else if (e.isFile() && e.name.endsWith(".md")) {
        files.push(join(d, e.name));
      }
    }
  })(dir);
  return files;
}

function extractExternalUrls(mdFiles) {
  const urls = new Set();
  for (const file of mdFiles) {
    const content = readFileSync(file, "utf-8");
    let match;
    EXTERNAL_URL_RE.lastIndex = 0;
    while ((match = EXTERNAL_URL_RE.exec(content)) !== null) {
      urls.add(match[1]);
    }
  }
  return [...urls];
}

// =============== 入口 ===============

function main() {
  console.log("\nF 星玖外部图片水印映射生成 v2.0\n");

  // 扫描所有 .md 文件
  const mdFiles = scanMarkdownFiles(ROOT);
  console.log(`  扫描到 ${mdFiles.length} 个 Markdown 文件`);

  // 提取外部图片 URL
  const urls = extractExternalUrls(mdFiles);
  console.log(`  发现 ${urls.length} 个唯一外部图片 URL\n`);

  // 生成映射表
  const map = {};
  let included = 0, skipped = 0;

  for (const url of urls) {
    const ext = getExtFromUrl(url);
    if (!SUPPORTED_EXTS.includes(ext)) {
      skipped++;
      continue;
    }
    const hash = hashUrl(url);
    map[url] = `/external-wm/${hash}${ext}`;
    included++;
  }

  if (skipped > 0) {
    console.log(`  跳过 ${skipped} 个不支持格式的 URL（.gif 等）`);
  }

  // 写入映射表
  writeFileSync(MAP_FILE, JSON.stringify(map, null, 2));

  console.log(`\n  完成: ${included} 个外部图片已建立映射`);
  console.log(`  映射文件: ${MAP_FILE}`);
  console.log(`\n  注意: 实际下载和加水印由浏览器端 Service Worker 按需完成。`);
  console.log(`  请确保 OSS 已配置 CORS 允许 miragedge.top 访问。\n`);
}

main();
