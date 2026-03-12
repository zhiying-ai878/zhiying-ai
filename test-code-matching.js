// 测试股票代码匹配逻辑

function testCodeMatching() {
  const apiCodes = ['sh002594', 'sz300750', 'sh600519', 'sz000001', 'sh601318'];
  const inputCodes = ['002594', '300750', '600519', '000001', '601318'];
  
  console.log('测试股票代码匹配逻辑...');
  console.log('API返回的代码:', apiCodes);
  console.log('输入的代码:', inputCodes);
  
  const results = [];
  
  for (const apiCode of apiCodes) {
    // 尝试匹配回原始输入的代码格式
    const originalCode = inputCodes.find(c => c === apiCode || (c.length === 6 && apiCode.endsWith(c)));
    if (originalCode) {
      results.push({
        apiCode,
        matchedCode: originalCode,
        success: true
      });
    } else {
      results.push({
        apiCode,
        matchedCode: null,
        success: false
      });
    }
  }
  
  console.log('\n匹配结果:');
  results.forEach(result => {
    console.log(`${result.apiCode} -> ${result.matchedCode} (${result.success ? '成功' : '失败'})`);
  });
  
  const allSuccessful = results.every(result => result.success);
  console.log(`\n所有匹配 ${allSuccessful ? '成功' : '失败'}`);
}

testCodeMatching();