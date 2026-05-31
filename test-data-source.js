const { getStockDataSource, testDataSource } = require('./dist/index.js');

async function testDataSources() {
  console.log('开始测试数据源连接...');
  
  // 测试东方财富数据源
  console.log('\n测试东方财富数据源:');
  const eastmoneyResult = await testDataSource('eastmoney');
  console.log(`结果: ${eastmoneyResult.success ? '成功' : '失败'}`);
  console.log(`消息: ${eastmoneyResult.message}`);
  if (eastmoneyResult.responseTime) {
    console.log(`响应时间: ${eastmoneyResult.responseTime}ms`);
  }
  
  // 测试新浪数据源
  console.log('\n测试新浪数据源:');
  const sinaResult = await testDataSource('sina');
  console.log(`结果: ${sinaResult.success ? '成功' : '失败'}`);
  console.log(`消息: ${sinaResult.message}`);
  if (sinaResult.responseTime) {
    console.log(`响应时间: ${sinaResult.responseTime}ms`);
  }
  
  // 测试腾讯数据源
  console.log('\n测试腾讯数据源:');
  const tencentResult = await testDataSource('tencent');
  console.log(`结果: ${tencentResult.success ? '成功' : '失败'}`);
  console.log(`消息: ${tencentResult.message}`);
  if (tencentResult.responseTime) {
    console.log(`响应时间: ${tencentResult.responseTime}ms`);
  }
  
  // 测试雪球数据源
  console.log('\n测试雪球数据源:');
  const xueqiuResult = await testDataSource('xueqiu');
  console.log(`结果: ${xueqiuResult.success ? '成功' : '失败'}`);
  console.log(`消息: ${xueqiuResult.message}`);
  if (xueqiuResult.responseTime) {
    console.log(`响应时间: ${xueqiuResult.responseTime}ms`);
  }
  
  // 测试同花顺数据源
  console.log('\n测试同花顺数据源:');
  const thsResult = await testDataSource('ths');
  console.log(`结果: ${thsResult.success ? '成功' : '失败'}`);
  console.log(`消息: ${thsResult.message}`);
  if (thsResult.responseTime) {
    console.log(`响应时间: ${thsResult.responseTime}ms`);
  }
  
  console.log('\n数据源测试完成!');
}

testDataSources().catch(console.error);
