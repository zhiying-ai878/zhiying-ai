// 测试股票数据获取功能
const { StockDataSource } = require('./src/utils/stockData.ts');

async function testStockData() {
  console.log('开始测试股票数据获取...');
  
  // 创建数据源实例
  const dataSource = new StockDataSource('sina');
  
  // 测试股票代码
  const testCodes = ['600519', '000001', '002594'];
  
  try {
    // 测试新浪数据源
    console.log('\n测试新浪数据源:');
    const sinaData = await dataSource.getRealtimeQuote(testCodes);
    console.log('新浪数据获取成功:', sinaData);
    
    // 测试腾讯数据源
    console.log('\n测试腾讯数据源:');
    dataSource.setSourceType('tencent');
    const tencentData = await dataSource.getRealtimeQuote(testCodes);
    console.log('腾讯数据获取成功:', tencentData);
    
    // 测试东方财富数据源
    console.log('\n测试东方财富数据源:');
    dataSource.setSourceType('eastmoney');
    const eastmoneyData = await dataSource.getRealtimeQuote(testCodes);
    console.log('东方财富数据获取成功:', eastmoneyData);
    
    // 测试雪球数据源
    console.log('\n测试雪球数据源:');
    dataSource.setSourceType('xueqiu');
    const xueqiuData = await dataSource.getRealtimeQuote(testCodes);
    console.log('雪球数据获取成功:', xueqiuData);
    
    // 测试同花顺数据源
    console.log('\n测试同花顺数据源:');
    dataSource.setSourceType('ths');
    const thsData = await dataSource.getRealtimeQuote(testCodes);
    console.log('同花顺数据获取成功:', thsData);
    
    console.log('\n所有数据源测试完成！');
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testStockData();
