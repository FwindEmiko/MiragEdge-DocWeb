/**
 * 生成 /version.json —— 前端版本探测目标文件
 *
 * 与 .vitepress/config.mts 中 <meta name="x-build-id"> 使用完全相同的构建标识。
 * 前端（useVersionCheck）会以 no-store 拉取此文件，与当前 HTML 的 meta 对比：
 *   不一致 → 自动 reload，修复 ESA 边缘缓存旧 HTML + 源站新 assets 导致的样式/chunk 404。
 *
 * 注意：此文件输出到 dist 根目录，nginx 必须对其禁用缓存（见 ESA 方案书）。
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", ".vitepress", "dist");

// 与 config.mts / vite define 保持一致的环境变量读取方式
const buildId = process.env.GITHUB_RUN_NUMBER || "dev";
const buildSha = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : "";
const builtAt = new Date().toISOString();

const payload = JSON.stringify({ buildId, buildSha, builtAt });

mkdirSync(DIST, { recursive: true });
writeFileSync(join(DIST, "version.json"), payload, "utf8");

console.log(
  `[generate-version] /version.json -> buildId="${buildId}" sha="${buildSha || "-"}" at="${builtAt}"`
);
