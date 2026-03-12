// 测试股票数据获取功能
import { getRealtimeQuote } from './src/utils/stockData.ts';

async function testDataFetch() {
  console.log('开始测试股票数据获取...');
  
  // 测试股票代码
  const testCodes = ['600519', '000001', '002594'];
  
  try {
    // 测试获取实时行情
    console.log('测试获取实时行情数据...');
    const results = await getRealtimeQuote(testCodes);
    console.log('获取数据成功:', results);
    
    // 检查数据质量
    results.forEach(stock => {
      console.log(`${stock.name} (${stock.code}): ${stock.price} (${stock.change >= 0 ? '+' : ''}${stock.change}) ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%`);
      console.log(`  成交量: ${stock.volume}, 成交额: ${stock.amount}`);
      console.log(`  开盘: ${stock.open}, 最高: ${stock.high}, 最低: ${stock.low}, 收盘: ${stock.close}`);
    });
    
    console.log('\n测试完成！');
  } catch (error) {
    console.error('测试过程中出现错误:', error);
  }
}

testDataFetch();
