import ghpages from 'gh-pages';
import path from 'path';

console.log('正在部署到GitHub Pages...');

ghpages.publish(
  path.join(process.cwd(), 'dist'),
  {
    branch: 'gh-pages',
    repo: 'https://github.com/zhiying-ai878/zhiying-ai.git',
    message: 'Deploy to GitHub Pages',
    user: {
      name: 'GitHub Actions',
      email: 'actions@github.com'
    }
  },
  (err) => {
    if (err) {
      console.error('部署失败:', err);
      process.exit(1);
    } else {
      console.log('部署成功！');
      console.log('访问地址: https://zhiying-ai878.github.io/zhiying-ai');
    }
  }
);