Write-Host "=== 部署到 GitHub Pages ==="

Set-Location dist

Write-Host "初始化 git 仓库..."
git init

Write-Host "添加所有文件..."
git add -A

Write-Host "提交更改..."
git commit -m "Deploy to GitHub Pages"

Write-Host "添加远程仓库..."
git remote add origin https://github.com/zhiying-ai878/zhiying-ai.git

Write-Host "推送到 gh-pages 分支..."
git push -f origin HEAD:gh-pages

Write-Host "返回项目目录..."
Set-Location ..

Write-Host "=== 部署完成 ==="