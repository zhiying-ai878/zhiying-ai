Write-Host "Starting deployment..."

$tempDir = "deploy-temp"
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}

New-Item -ItemType Directory -Path $tempDir
Copy-Item -Path "dist\*" -Destination $tempDir -Recurse

Set-Location $tempDir

git init
git add .
git commit -m "Deploy"
git remote add origin https://github.com/zhiying-ai878/zhiying-ai.git
git push --force origin master:gh-pages

Set-Location ..
Remove-Item -Recurse -Force $tempDir

Write-Host "Deployment successful!"