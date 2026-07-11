#!/usr/bin/env node

// 简单的启动脚本，避免 ts-node 依赖问题
const { spawn } = require('child_process');
const path = require('path');

// 使用 node 直接运行 TypeScript（需要安装 ts-node）
try {
  // 动态加载 ts-node/register
  require('ts-node/register');
  
  // 运行主脚本（__dirname 是 .vitepress/theme/components/js/，需向上回到 theme/）
  const scriptPath = path.join(__dirname, '../../addContributors.ts');
  require(scriptPath);
} catch (error) {
  console.error('启动失败:', error.message);
  console.log('\n请安装必要的依赖:');
  console.log('npm install -D typescript ts-node @types/node');
  process.exit(1);
}