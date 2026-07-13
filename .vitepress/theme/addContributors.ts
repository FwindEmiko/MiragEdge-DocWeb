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
type EmailWithSha1 = { email: string; sha1: string };
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

// 初始化
const git = simpleGit();
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * 获取仓库所有贡献者的Email和对应的一个SHA1
 */
async function getRepoContributors(): Promise<EmailWithSha1[]> {
  try {
    // 使用 git.raw 获取原始输出，避免 simple-git log() 对自定义 format 的解析问题
    const rawOutput = await git.raw(['log', '--format=%ae %H']);
    const logLines = rawOutput.split('\n').filter(line => line.trim());

    if (logLines.length === 0) {
      console.warn('No commits found in repository');
      return [];
    }

    const contributors = new Map<string, string>();

    // 去重，只保留每个Email的第一个commit（reverse 后最早提交优先）
    logLines.reverse().forEach((commit) => {
      const [email, sha1] = commit.split(' ');
      if (email && sha1 && !contributors.has(email)) {
        contributors.set(email, sha1);
      }
    });

    return Array.from(contributors).map(([email, sha1]) => ({
      email: email.trim(),
      sha1
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
  } catch (error) {
    console.error(`Error querying username for ${email}:`, error);
    return null;
  }
}

/**
 * 查询完整用户信息
 */
async function queryFullDataList(
  emailTuples: EmailWithUsername[],
  octokit: Octokit
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
        try {
          const userData = await octokit.rest.users.getByUsername({ username });
          return {
            username,
            nickname: userData.data.name || username,
            avatar: userData.data.avatar_url,
            emails,
          };
        } catch (error) {
          console.error(`Error getting user data for ${username}:`, error);
          // 返回基础信息
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
      console.log(`No contributors found for file: ${filePath}`);
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
  console.log('Starting to fetch contributor information...');
  
  // 1. 获取所有贡献者的Email和SHA1
  const emailSha1List = await getRepoContributors();
  console.log(`Found ${emailSha1List.length} unique contributor emails`);
  
  if (emailSha1List.length === 0) {
    return [];
  }
  
  // 2. 查询GitHub用户名
  console.log('Querying GitHub usernames...');
  const usernamePromises = emailSha1List.map(item => 
    queryUsername(item, octokit)
  );
  const usernameResults = await Promise.all(usernamePromises);
  const validUsernameResults = usernameResults.filter(
    (result): result is EmailWithUsername => result !== null
  );
  console.log(`Resolved ${validUsernameResults.length} GitHub usernames`);
  
  // 3. 查询完整用户信息
  console.log('Fetching full user data...');
  const fullContributorData = await queryFullDataList(
    validUsernameResults,
    octokit
  );
  
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
async function fetchAndSaveActivityData(): Promise<void> {
  const outputPath = path.resolve(process.cwd(), "public", "data", "contributors-activity.json");
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  try {
    // Get token from env or fallback to gh CLI (local dev)
    let token = process.env.GITHUB_TOKEN;
    if (!token) {
      try {
        token = execSync('gh auth token', { encoding: 'utf-8' }).trim();
      } catch { /* gh not available, will try unauthenticated */ }
    }
    const localApi = token
      ? new Octokit({ auth: token })
      : octokit;
    // GitHub stats endpoint returns 202 while generating cache — retry up to 5x
    let data: any = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const resp = await localApi.request("GET /repos/{owner}/{repo}/stats/contributors", { owner, repo });
      if (resp.status === 200 && Array.isArray(resp.data)) {
        data = resp.data;
        break;
      }
      console.log("[activity] Attempt " + (attempt + 1) + " got " + resp.status + ", retrying in 3s...");
      await new Promise(r => setTimeout(r, 3000));
    }
    if (data) {
      const simplified = data.map((contrib: any) => ({
        author: { login: contrib.author.login },
        total: contrib.total,
        weeks: contrib.weeks.map((w: any) => ({ w: w.w, c: w.c })),
      }));
      fs.writeFileSync(outputPath, JSON.stringify(simplified), "utf-8");
      console.log("[activity] Saved " + simplified.length + " contributors");
    } else {
      console.warn("[activity] All 5 attempts failed, writing empty data");
      fs.writeFileSync(outputPath, JSON.stringify([]), "utf-8");
    }
  } catch (error) {
    console.warn("[activity] Failed:", (error as Error).message);
    fs.writeFileSync(outputPath, JSON.stringify([]), "utf-8");
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
        await fetchAndSaveActivityData();
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