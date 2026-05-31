@echo off
echo Starting deployment...

rmdir /s /q deploy-temp 2>nul
mkdir deploy-temp
xcopy dist deploy-temp /s /e /h /y

cd deploy-temp
git init
git config user.email "deploy@zhiying-ai.com"
git config user.name "Deploy Bot"
git add .
git commit -m "Deploy"
git remote add origin https://github.com/zhiying-ai878/zhiying-ai.git
git push --force origin master:gh-pages

cd ..
rmdir /s /q deploy-temp

echo Deployment completed!