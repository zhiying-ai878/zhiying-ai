// 运行优化测试的脚本

const { runAllTests } = require('./src/utils/optimizationTests');

async function main() {
  console.log('开始运行优化测试...');
  
  try {
    const allPassed = await runAllTests();
    
    if (allPassed) {
      console.log('\n🎉 所有测试通过！优化成功！');
    } else {
      console.log('\n⚠️  部分测试失败，需要进一步调整。');
    }
  } catch (error) {
    console.error('测试运行出错:', error);
  }
}

main();