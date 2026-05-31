
import { publish } from 'gh-pages';

console.log('开始部署到 GitHub Pages...');

publish('dist', {
  branch: 'gh-pages',
  repo: 'https://github.com/zhiying-ai878/zhiying-ai.git',
  message: 'Deploy to GitHub Pages'
}, (err) => {
  if (err) {
    console.error('部署失败:', err);
  } else {
    console.log('✅ 部署成功！');
    console.log('🌐 网站地址: https://zhiying-ai878.github.io/zhiying-ai');
  }
});

