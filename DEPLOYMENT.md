# 智盈AI部署说明

## 构建最新版本

项目已经成功构建，构建产物在 `dist` 目录中。

## 部署到GitHub Pages

### 方法1：使用gh-pages npm包（推荐）

1. 确保已安装依赖：
   ```bash
   npm install
   ```

2. 运行部署脚本：
   ```bash
   node deploy-gh-pages.js
   ```

### 方法2：手动部署

1. 进入dist目录：
   ```bash
   cd dist
   ```

2. 初始化git仓库（如果还没有）：
   ```bash
   git init
   ```

3. 添加所有文件：
   ```bash
   git add .
   ```

4. 提交更改：
   ```bash
   git commit -m "Deploy to GitHub Pages"
   ```

5. 添加远程仓库：
   ```bash
   git remote add origin https://github.com/zhiying-ai878/zhiying-ai.git
   ```

6. 推送到gh-pages分支：
   ```bash
   git push --force origin master:gh-pages
   ```

## 访问部署后的网站

部署成功后，访问以下地址：
https://zhiying-ai878.github.io/zhiying-ai

## 注意事项

1. 确保vite.config.ts中的base配置为'/zhiying-ai/'
2. 首次部署可能需要几分钟才能生效
3. 如果遇到网络问题，请尝试使用GitHub Desktop或其他Git客户端

## 本次更新内容

1. ✅ 修复了股票代码与名字不匹配的问题
2. ✅ 确保所有数据分析使用60天以上的历史数据
3. ✅ 优化了买入信号逻辑，只在起涨或调整到位时发出
4. ✅ 优化了特殊信号逻辑，严格遵循低价买入原则
5. ✅ 优化了卖出信号逻辑，只在风险大时发出
6. ✅ 禁用了所有动画效果，避免用户看不清、闪眼睛
7. ✅ 修复了监控股票数量显示问题，现在显示正确的5501只A股全市场股票
