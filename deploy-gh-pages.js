import ghpages from 'gh-pages';

console.log('Starting deployment to GitHub Pages...');
console.log('This may take a few minutes, please wait...');

// 设置更长的超时时间
const MAX_RETRIES = 3;
let retryCount = 0;

function deploy() {
  ghpages.publish(
    'dist',
    {
      branch: 'gh-pages',
      repo: 'https://github.com/zhiying-ai878/zhiying-ai.git',
      message: 'Deploy to GitHub Pages',
      dotfiles: true,
      silent: false
    },
    function(err) {
      if (err) {
        console.error('Deployment failed:', err.message);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying... (${retryCount}/${MAX_RETRIES})`);
          setTimeout(deploy, 5000); // 等待5秒后重试
        } else {
          console.error('Deployment failed after multiple retries');
          process.exit(1);
        }
      } else {
        console.log('Deployment successful!');
        console.log('Visit: https://zhiying-ai878.github.io/zhiying-ai');
        process.exit(0);
      }
    }
  );
}

deploy();
