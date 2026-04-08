#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// 简单的部署脚本，避免路径过长问题

console.log('开始部署到 GitHub Pages...');

try {
  // 创建临时目录用于部署
  const tempDir = path.join(process.cwd(), 'deploy-temp');
  
  // 删除已存在的临时目录
  if (fs.existsSync(tempDir)) {
    console.log('删除已存在的临时目录...');
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  
  // 创建临时目录
  console.log('创建临时目录...');
  fs.mkdirSync(tempDir);
  
  // 复制dist目录内容到临时目录
  const distDir = path.join(process.cwd(), 'dist');
  copyDirectory(distDir, tempDir);
  
  console.log('已复制dist目录内容到临时目录');
  
  // 初始化git仓库
  execSync('git init', { cwd: tempDir, stdio: 'inherit' });
  execSync('git add .', { cwd: tempDir, stdio: 'inherit' });
  
  // 提交更改，如果没有更改则使用--allow-empty
  try {
    execSync('git commit -m "Deploy to GitHub Pages"', { cwd: tempDir, stdio: 'inherit' });
  } catch (error) {
    // 如果没有更改，使用--allow-empty参数
    execSync('git commit --allow-empty -m "Deploy to GitHub Pages"', { cwd: tempDir, stdio: 'inherit' });
  }
  
  // 添加或更新远程仓库
  try {
    execSync('git remote add origin https://github.com/Zhiying-ai878/zhiying-ai.git', { cwd: tempDir, stdio: 'inherit' });
  } catch (error) {
    // 如果远程仓库已存在，更新URL
    execSync('git remote set-url origin https://github.com/Zhiying-ai878/zhiying-ai.git', { cwd: tempDir, stdio: 'inherit' });
  }
  
  // 强制推送到gh-pages分支
  console.log('推送到GitHub Pages...');
  execSync('git push --force origin master:gh-pages', { cwd: tempDir, stdio: 'inherit' });
  
  console.log('部署成功！');
  
  // 清理临时目录
  fs.rmSync(tempDir, { recursive: true, force: true });
  
} catch (error) {
  console.error('部署失败:', error.message);
  process.exit(1);
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
