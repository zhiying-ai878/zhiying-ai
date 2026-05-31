# GitHub Pages 部署图文指南

本指南将详细教您如何将智盈AI部署到GitHub Pages，实现免费托管和全球访问！

---

## 📋 目录
1. [准备工作](#准备工作)
2. [步骤1：注册GitHub账号](#步骤1注册github账号)
3. [步骤2：创建新仓库](#步骤2创建新仓库)
4. [步骤3：上传dist文件](#步骤3上传dist文件)
5. [步骤4：启用GitHub Pages](#步骤4启用github-pages)
6. [步骤5：访问您的网站](#步骤5访问您的网站)
7. [常见问题](#常见问题)

---

## 准备工作

在开始之前，请确保：
- ✅ 您已经构建了项目（`npm run build`）
- ✅ `dist` 文件夹已经生成
- ✅ 可以正常访问互联网

---

## 步骤1：注册GitHub账号

### 1.1 访问GitHub官网
打开浏览器，访问：**https://github.com**

### 1.2 注册账号（如果没有）
1. 点击右上角的 **Sign up** 按钮
2. 输入您的邮箱地址
3. 创建密码
4. 输入用户名（这个将出现在您的网址中）
5. 完成验证
6. 点击 **Create account**

### 1.3 登录账号
如果已有账号，点击右上角 **Sign in** 登录

---

## 步骤2：创建新仓库

### 2.1 进入创建页面
登录后，点击右上角的 **+** 号，选择 **New repository**

### 2.2 填写仓库信息
按下图填写：

```
┌─────────────────────────────────────────┐
│ Repository name (仓库名称)               │
│ 输入：zhiying-ai  ← 建议用这个         │
│                                         │
│ Description (描述，可选)                 │
│ 智盈AI - 智能投资决策平台                │
│                                         │
│ ☑ Public  /  ○ Private                 │
│  (公开，任何人都可以访问，推荐)          │
│                                         │
│ 不要勾选任何选项！直接创建               │
│                                         │
│ [ Create repository ]  ← 点击这个按钮  │
└─────────────────────────────────────────┘
```

### 2.3 创建成功
创建成功后，您会看到一个空的仓库页面，类似：
```
Quick setup — if you've done this kind of thing before
...
```

---

## 步骤3：上传dist文件

### 方式A：网页上传（最简单，推荐）

#### 3.1 点击上传链接
在仓库页面，找到并点击 **uploading an existing file** 链接

#### 3.2 准备文件
打开您电脑上的项目文件夹：
```
d:\U盘文件\我的资料\APP资料\AI投资软件\dist\
```

#### 3.3 选择文件
**重要提醒**：
- ❌ 不要上传整个 `dist` 文件夹
- ✅ 打开 `dist` 文件夹，选择里面的**所有文件和文件夹**

您会看到以下文件：
- `index.html`
- `assets/` 文件夹
- 其他文件

#### 3.4 拖拽上传
1. 将dist文件夹内的所有文件拖拽到网页的上传区域
2. 或者点击 **choose your files** 选择文件

#### 3.5 提交更改
在页面底部：
- Commit changes: 可以保持默认或输入 "Initial deploy"
- 点击 **Commit changes** 按钮

#### 3.6 等待上传完成
文件较大时可能需要几分钟，请耐心等待

---

### 方式B：使用Git命令（适合开发者）

如果您熟悉Git，可以使用命令行：

```bash
# 进入dist文件夹
cd dist

# 初始化Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "Deploy to GitHub Pages"

# 重命名分支为main
git branch -M main

# 添加远程仓库（替换为您的用户名和仓库名）
git remote add origin https://github.com/您的用户名/zhiying-ai.git

# 推送到GitHub
git push -u origin main
```

---

## 步骤4：启用GitHub Pages

### 4.1 进入设置
在仓库页面，点击顶部的 **Settings**（设置）标签

```
┌─────────────────────────────────────────────┐
│  Code  Issues  Pull requests  Actions  Wiki │
│  [Settings]  ← 点击这个！                   │
│  Security  Insights                          │
└─────────────────────────────────────────────┘
```

### 4.2 找到Pages设置
在左侧菜单中，向下滚动找到 **Pages**（在"Code and automation"分类下）

```
左侧菜单：
  ...
  ▼ Code and automation
      Environments
      GitHub Pages  ← 点击这个！
      ...
```

### 4.3 配置GitHub Pages
在 **Build and deployment** 区域：

```
Source:
  ┌───────────────────────┐
  │ Deploy from a branch  │ ← 选择这个
  └───────────────────────┘

Branch:
  ┌─────────┬────────┐
  │ main    │ /root  │ ← 选择main分支，文件夹选/root
  └─────────┴────────┘

然后点击 [Save] 按钮！
```

### 4.4 保存并等待
点击 **Save** 按钮后，页面会显示：
```
Your site is ready to be published
```

**等待1-2分钟**，让GitHub构建您的网站。期间可以刷新页面查看状态。

---

## 步骤5：访问您的网站

### 5.1 获取网址
刷新 Settings → Pages 页面，顶部会显示：

```
✅ Your site is live at
https://您的用户名.github.io/zhiying-ai/
```

### 5.2 访问网站
点击这个链接，或者复制到浏览器打开！

### 5.3 保存网址
建议将这个网址添加到浏览器书签，方便以后访问！

---

## 常见问题

### Q1: 上传后网站显示404怎么办？
**A:** 
- 确认您上传的是dist文件夹**里面**的文件，不是dist文件夹本身
- 检查GitHub Pages设置中Branch是否选择了main和/root
- 等待5-10分钟，有时候需要更长时间

### Q2: 网站可以访问，但数据不显示？
**A:**
- 这是正常的，因为API请求是在浏览器中发起的
- 确保您的设备可以访问新浪财经等数据源
- 在国内访问可能需要等待一会儿

### Q3: 如何更新网站？
**A:**
1. 在本地修改代码
2. 重新运行 `npm run build`
3. 再次上传dist文件夹中的文件到GitHub
4. GitHub Pages会自动更新（可能需要几分钟）

### Q4: 可以自定义域名吗？
**A:** 可以！
- 在Settings → Pages中找到"Custom domain"
- 输入您的域名
- 在域名DNS设置中添加CNAME记录指向 `您的用户名.github.io`

### Q5: 国内访问太慢怎么办？
**A:**
- 可以使用CDN加速服务（如jsDelivr、Cloudflare）
- 或者考虑使用Gitee Pages（国内版GitHub）

---

## 🎉 完成！

恭喜您！现在您可以在任何设备上通过浏览器访问您的智盈AI了！

**访问地址：** `https://您的用户名.github.io/zhiying-ai/`

---

## 快速参考命令

```bash
# 重新构建项目
npm run build

# 查看dist文件夹
dir dist

# 简洁的部署流程：
# 1. npm run build
# 2. 上传dist内的文件到GitHub
# 3. 等待GitHub Pages自动更新
```

---

**祝您使用愉快！投资顺利！** 🚀
