Write-Host "Starting deployment..." -ForegroundColor Green

$tempDir = "deploy-temp"
if (Test-Path $tempDir) {
    Write-Host "Removing temp dir..."
    Remove-Item -Recurse -Force $tempDir
}

Write-Host "Creating temp dir..."
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "Copying files..."
Copy-Item -Path "dist\*" -Destination $tempDir -Recurse

Write-Host "Initializing git..."
Set-Location $tempDir
git init
git add .
git commit -m "Deploy"
git remote add origin https://github.com/zhiying-ai878/zhiying-ai.git
git push --force origin master:gh-pages

Write-Host "Cleaning up..."
Set-Location ..
Remove-Item -Recurse -Force $tempDir

Write-Host "Deployment successful!" -ForegroundColor Green