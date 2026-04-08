# 智盈AI部署到GitHub Pages指南

## 部署步骤

### 1. 准备工作
确保您的GitHub仓库已经创建：`https://github.com/Zhiying-ai878/zhiying-ai`

### 2. 手动部署步骤

#### 方法一：使用GitHub Desktop（推荐）
1. 打开GitHub Desktop
2. 克隆仓库：`https://github.com/Zhiying-ai878/zhiying-ai.git`
3. 将`dist`目录中的所有文件复制到仓库根目录
4. 提交更改并推送到GitHub

#### 方法二：使用命令行
```bash
# 克隆仓库
git clone https://github.com/Zhiying-ai878/zhiying-ai.git
cd zhiying-ai

# 删除旧文件（保留.git目录）
del /f /s /q *
for /d %%i in (*) do rmdir /s /q "%%i"

# 复制dist目录内容到当前目录
xcopy ..\dist\* . /e /y

# 提交更改
git add .
git commit -m "Deploy Zhiying AI v1.0"
git push origin main
```

### 3. 配置GitHub Pages
1. 访问：`https://github.com/Zhiying-ai878/zhiying-ai/settings/pages`
2. 设置Source为：`main branch`
3. 点击"Save"保存配置

### 4. 访问网站
部署完成后，您可以访问：`https://zhiying-ai878.github.io/zhiying-ai/`

## 注意事项
- 部署后可能需要等待几分钟才能生效
- 确保所有文件都已正确复制到仓库根目录
- 如果遇到404错误，请检查文件路径是否正确

## 部署文件清单
- index.html（主页）
- manifest.json（PWA配置）
- service-worker.js（PWA服务）
- assets/目录（所有JavaScript和CSS文件）