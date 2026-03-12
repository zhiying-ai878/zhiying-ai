import { getRealtimeQuote } from './src/utils/stockData.js';

async function testRealtimeData() {
  try {
    console.log('测试获取实时行情数据...');
    
    // 测试市场指数数据
    const marketCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    console.log('请求市场指数数据:', marketCodes);
    
    const marketResults = await getRealtimeQuote(marketCodes);
    console.log('市场指数数据结果:', marketResults);
    
    // 测试个股数据
    const stockCodes = ['002594', '300750', '600519', '000001', '601318'];
    console.log('\n请求个股数据:', stockCodes);
    
    const stockResults = await getRealtimeQuote(stockCodes);
    console.log('个股数据结果:', stockResults);
    
    // 检查结果是否有效
    console.log('\n检查结果有效性:');
    console.log(`市场指数数据数量: ${marketResults.length}`);
    console.log(`个股数据数量: ${stockResults.length}`);
    
    // 检查上证指数数据
    const sh000001 = marketResults.find(r => r.code === 'sh000001');
    if (sh000001) {
      console.log(`\n上证指数数据:`, sh000001);
      console.log(`价格: ${sh000001.price}, 涨跌幅: ${sh000001.changePercent.toFixed(2)}%`);
    } else {
      console.log('\n未获取到上证指数数据');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testRealtimeData();