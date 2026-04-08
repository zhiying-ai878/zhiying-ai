Write-Host "Starting deployment to GitHub Pages..." -ForegroundColor Green

# Create temporary directory
$tempDir = Join-Path $PWD "deploy-temp"
if (Test-Path $tempDir) {
    Write-Host "Removing existing temporary directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}

Write-Host "Creating temporary directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy dist directory contents to temporary directory
$distDir = Join-Path $PWD "dist"
Write-Host "Copying dist directory contents to temporary directory..." -ForegroundColor Yellow
Copy-Item -Path (Join-Path $distDir "*") -Destination $tempDir -Recurse

# Initialize git repository
Write-Host "Initializing git repository..." -ForegroundColor Yellow
Set-Location $tempDir
git init
git add .

# Commit changes
git commit -m "Deploy to GitHub Pages" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    git commit --allow-empty -m "Deploy to GitHub Pages"
}

# Add or update remote repository
git remote add origin https://github.com/Zhiying-ai878/zhiying-ai.git 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    git remote set-url origin https://github.com/Zhiying-ai878/zhiying-ai.git
}

# Force push to gh-pages branch
Write-Host "Pushing to GitHub Pages..." -ForegroundColor Yellow
git push --force origin master:gh-pages

# Return to original directory
Set-Location $PWD

# Clean up temporary directory
Write-Host "Cleaning up temporary directory..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue

Write-Host "Deployment successful!" -ForegroundColor Green
