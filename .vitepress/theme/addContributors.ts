import type { Plugin } from 'vite';
import simpleGit from 'simple-git';
import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { execSync } from "child_process";

// 加载环境变量
dotenv.config();

// 类型定义
type EmailWithSha1 = { email: string; sha1: string; authorName: string };
type EmailWithUsername = { email: string; username: string };
type FullContributorData = {
  username: string;
  nickname: string;
  avatar: string;
  emails: string[];
};

// 配置
const owner = 'fwindemiko'; // 你的GitHub用户名
const repo = 'MiragEdge-DocWeb'; // 你的仓库名
const knownEmailUsers: Record<string, string> = {
  '2011857087@qq.com': 'FwindEmiko',
  '1525301523@qq.com': 'FCelestial',
};

// 初始化
const git = simpleGit();
const ghToken = process.env.GITHUB_TOKEN?.trim();
const octokit = ghToken
  ? new Octokit({
      auth: ghToken,
      request: { timeout: 5000 },
    })
  : null;

function inferUsername(email: string, authorName: string): string {
  if (knownEmailUsers[email]) return knownEmailUsers[email];
  const noReplyMatch = email.match(/^(?:\d+\+)?([^@]+)@users\.noreply\.github\.com$/i);
  if (noReplyMatch) return noReplyMatch[1];
  const emailLocalPart = email.split('@')[0];
  if (/^[a-z0-9._-]+$/i.test(emailLocalPart) && !/^\d+$/.test(emailLocalPart)) {
    return emailLocalPart;
  }
  return authorName.trim() || email.split('@')[0];
}

function toLocalContributor({ email, authorName }: EmailWithSha1): EmailWithUsername {
  return { email, username: inferUsername(email, authorName) };
}

/**
 * 获取仓库所有贡献者的Email和对应的一个SHA1
 */
async function getRepoContributors(): Promise<EmailWithSha1[]> {
  try {
    // 使用 git.raw 获取原始输出，避免 simple-git log() 对自定义 format 的解析问题
    const rawOutput = await git.raw(['log', '--format=%ae%x09%H%x09%aN']);
    const logLines = rawOutput.split('\n').filter(line => line.trim());

    if (logLines.length === 0) {
      console.warn('No commits found in repository');
      return [];
    }

    const contributors = new Map<string, { sha1: string; authorName: string }>();

    // 去重，只保留每个Email的第一个commit（reverse 后最早提交优先）
    logLines.reverse().forEach((commit) => {
      const [email, sha1, authorName] = commit.split('\t');
      if (email && sha1 && !contributors.has(email)) {
        contributors.set(email, { sha1, authorName: authorName || email.split('@')[0] });
      }
    });

    return Array.from(contributors).map(([email, contributor]) => ({
      email: email.trim(),
      sha1: contributor.sha1,
      authorName: contributor.authorName,
    }));
  } catch (error) {
    console.error('Error getting repo contributors:', error);
    return [];
  }
}

/**
 * 通过SHA1查询GitHub用户名
 */
async function queryUsername(
  { email, sha1 }: EmailWithSha1,
  octokit: Octokit
): Promise<EmailWithUsername | null> {
  try {
    const commitData = await octokit.rest.repos.getCommit({
      owner,
      repo,
      ref: sha1,
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
  } catch {
    console.warn(`GitHub username lookup failed for ${email}; using local metadata.`);
    return null;
  }
}

/**
 * 查询完整用户信息
 */
async function queryFullDataList(
  emailTuples: EmailWithUsername[],
  octokit: Octokit | null
): Promise<FullContributorData[]> {
  try {
    const user2emails = new Map<string, string[]>();
    
    // 归并同一个用户的多个Email
    emailTuples.forEach(({ email, username }) => {
      if (user2emails.has(username)) {
        user2emails.get(username)!.push(email);
      } else {
        user2emails.set(username, [email]);
      }
    });
    
    // 查询每个用户的详细信息
    const fullDataPromises = Array.from(user2emails.entries()).map(
      async ([username, emails]) => {
        if (!octokit) {
          return {
            username,
            nickname: username,
            avatar: `https://github.com/${username}.png`,
            emails,
          };
        }
        try {
          const userData = await octokit.rest.users.getByUsername({ username });
          return {
            username,
            nickname: userData.data.name || username,
            avatar: userData.data.avatar_url,
            emails,
          };
        } catch {
          console.warn(`GitHub profile lookup failed for ${username}; using local metadata.`);
          return {
            username,
            nickname: username,
            avatar: `https://github.com/${username}.png`,
            emails,
          };
        }
      }
    );
    
    return await Promise.all(fullDataPromises);
  } catch (error) {
    console.error('Error querying full data list:', error);
    return [];
  }
}

/**
 * 获取指定文件的所有贡献者Email
 */
async function getEmailList(filePath: string): Promise<string[]> {
  try {
    // 使用 git.raw 获取原始输出
    const rawOutput = await git.raw(['log', '--format=%ae', '--follow', '--no-merges', filePath]);
    const logLines = rawOutput
      .split('\n')
      .filter(email => email && email.trim() !== '');

    if (logLines.length === 0) {
      return [];
    }

    // 去重
    return Array.from(new Set(logLines.map(email => email.trim())));
  } catch (error) {
    console.error(`Error getting email list for ${filePath}:`, error);
    return [];
  }
}

/**
 * 主函数：获取所有贡献者信息
 */
async function getAllContributors(): Promise<FullContributorData[]> {
  console.log('Loading contributor information from local Git history...');
  
  // 1. 获取所有贡献者的Email和SHA1
  const emailSha1List = await getRepoContributors();
  console.log(`Found ${emailSha1List.length} unique contributor emails`);
  
  if (emailSha1List.length === 0) {
    return [];
  }
  
  const localResults = emailSha1List.map(toLocalContributor);
  if (!octokit) {
    console.log('GITHUB_TOKEN is not set; using local contributor metadata.');
    return queryFullDataList(localResults, null);
  }

  const usernameResults = await Promise.all(
    emailSha1List.map(async (item, index) =>
      (await queryUsername(item, octokit)) ?? localResults[index]
    )
  );
  const fullContributorData = await queryFullDataList(usernameResults, octokit);
  
  console.log(`Successfully fetched data for ${fullContributorData.length} contributors`);
  
  return fullContributorData;
}

/**
 * 检查是否是首页文件
 */
function isHomePage(code: string, id: string): boolean {
  // 方法1：检查文件名
  //const fileName = path.basename(id).toLowerCase();
  //if (fileName === 'index.md' || fileName === 'readme.md') {
  //  return true;
  //}
  
  // 方法2：检查文件路径
  //const filePath = id.replace(process.cwd(), '').replace(/^\//, '').toLowerCase();
  //if (filePath === 'index.md' || filePath === 'readme.md') {
  //  return true;
  //}
  
  // 方法3：检查内容是否有 layout: home（最可靠的判断）
  if (code.includes('layout: home')) {
    return true;
  }
  
  return false;
}

/**
 * 获取仓库提交活跃数据并保存为静态JSON
 */
async function fetchAndSaveActivityData(emailMap: Record<string, string>): Promise<void> {
  const outputPath = path.resolve(process.cwd(), "public", "data", "contributors-activity.json");
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  try {
    // Use local git log instead of GitHub API (/stats/contributors often stuck at 202)
    // Format: %ae = author email, %at = author timestamp (unix)
    const rawLog = execSync('git log --format="%ae %at" --since="3 months ago" --no-merges', { encoding: 'utf-8' });
    const lines = rawLog.trim().split('\n').filter(Boolean);

    // Group commits by author email, then by week
    const emailCommits: Record<string, { w: number; c: number }[]> = {};
    const emailTotals: Record<string, number> = {};

    for (const line of lines) {
      const [email, ts] = line.split(' ');
      const t = parseInt(ts, 10);
      if (!email || isNaN(t)) continue;
      // Align to Monday of the week (GitHub uses Monday-based weeks)
      const d = new Date(t * 1000);
      const day = d.getDay();
      const monOffset = day === 0 ? 6 : day - 1; // Sunday=0 -> Monday=0 offset
      const monday = new Date(d);
      monday.setDate(d.getDate() - monOffset);
      monday.setHours(0, 0, 0, 0);
      const weekTs = Math.floor(monday.getTime() / 1000);

      if (!emailCommits[email]) {
        emailCommits[email] = [];
        emailTotals[email] = 0;
      }
      emailTotals[email]++;

      const existing = emailCommits[email].find(w => w.w === weekTs);
      if (existing) {
        existing.c++;
      } else {
        emailCommits[email].push({ w: weekTs, c: 1 });
      }
    }

    // Sort weeks for each email
    for (const email of Object.keys(emailCommits)) {
      emailCommits[email].sort((a, b) => a.w - b.w);
    }

    // Map emails to GitHub usernames and merge duplicates
    const merged = new Map();
    for (const [email, weeks] of Object.entries(emailCommits)) {
      const username = emailMap[email] || email.split('@')[0];
      if (!merged.has(username)) {
        merged.set(username, { login: username, total: 0, weeks: new Map() });
      }
      const entry = merged.get(username);
      entry.total += emailTotals[email];
      for (const w of weeks) {
        entry.weeks.set(w.w, (entry.weeks.get(w.w) || 0) + w.c);
      }
    }

    // Convert merged map to result format
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
        weeks: weeksArr,
      });
    }

    // Sort by total commits descending
    result.sort((a, b) => b.total - a.total);

    fs.writeFileSync(outputPath, JSON.stringify(result), "utf-8");
    console.log("[activity] Saved " + result.length + " contributors (" + lines.length + " commits) from git log");
  } catch (error) {
    console.warn("[activity] Failed:", (error as Error).message);
    if (!fs.existsSync(outputPath)) {
      try { fs.writeFileSync(outputPath, JSON.stringify([]), "utf-8"); } catch {}
    }
  }
}

/**
 * VitePlugin
 */
export default function addContributorsPlugin(): Plugin {
  let fullContributorData: FullContributorData[] = [];
  let dataLoaded = false;
  
  return {
    name: 'vite-plugin-contributors',
    enforce: 'pre',
    
    async buildStart() {
      // 只在构建时获取一次数据
      if (!dataLoaded) {
        console.log('Loading contributor data...');
        fullContributorData = await getAllContributors();
        // Build email→username map from contributor data
        const emailMap: Record<string, string> = {};
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
      // 只处理 .md 文件
      if (!id.endsWith('.md')) {
        return null;
      }
      
      // 检查是否是首页，如果是则跳过处理
      if (isHomePage(code, id)) {
        console.log(`插件: 跳过首页文件 ${id}`);
        return code; // 直接返回，不做任何修改
      }
      
      try {
        // 获取文件相对路径
        const filePath = id.replace(process.cwd(), '').replace(/^\//, '');
        
        // 获取该文件的贡献者Email列表
        const emailList = await getEmailList(filePath);
        
        if (emailList.length === 0) {
          return code; // 没有贡献者，不修改
        }
        
        // 查找对应的贡献者信息
        const fileContributors = emailList
          .map(email => 
            fullContributorData.find(contributor => 
              contributor.emails.includes(email)
            )
          )
          .filter((contributor): contributor is FullContributorData => 
            contributor !== undefined
          )
          // 去重
          .filter((contributor, index, array) =>
            array.findIndex(c => c.username === contributor.username) === index
          );
        
        if (fileContributors.length === 0) {
          return code;
        }
        
        // 格式化贡献者列表 - 昵称,用户名 格式
        const contributorList = fileContributors
          .map(contributor => `${contributor.nickname},${contributor.username}`)
          .join(';');
        
        // 检查是否有Frontmatter
        const hasFrontmatter = code.trim().startsWith('---');
        
        if (hasFrontmatter) {
          // 已有Frontmatter，插入contributors字段
          const frontmatterEnd = code.indexOf('---', 3);
          if (frontmatterEnd !== -1) {
            const frontmatter = code.slice(0, frontmatterEnd + 3);
            const content = code.slice(frontmatterEnd + 3);
            
            // 检查是否已有contributors字段
            if (frontmatter.includes('contributors:')) {
              return code; // 不覆盖已有的
            }
            
            // 在frontmatter末尾（但要在最后的---之前）插入contributors字段
            const lastDashIndex = frontmatter.lastIndexOf('---');
            if (lastDashIndex !== -1) {
              const beforeDash = frontmatter.slice(0, lastDashIndex);
              const afterDash = frontmatter.slice(lastDashIndex);
              
              // 确保格式正确：在---之前插入，并保留换行
              return `${beforeDash.trim()}\ncontributors: ${contributorList}\n${afterDash}${content}`;
            }
          }
        }
        
        // 没有Frontmatter，添加新的
        return `---\ncontributors: ${contributorList}\n---\n\n${code}`;
      } catch (error) {
        console.error(`Error processing file ${id}:`, error);
        return code; // 出错时返回原内容
      }
    },
  };
}
