import { getRealtimeQuote } from './src/utils/stockData.js';

async function testRealtimeQuote() {
  console.log('=== 测试实时行情数据 ===');
  
  try {
    // 测试指数数据
    console.log('\n1. 测试指数数据...');
    const indexResults = await getRealtimeQuote(['sh000001', 'sh000688']);
    console.log('获取到的指数数据:', JSON.stringify(indexResults, null, 2));
    
    // 测试股票数据
    console.log('\n2. 测试股票数据...');
    const stockResults = await getRealtimeQuote(['002594', '301179']);
    console.log('获取到的股票数据:', JSON.stringify(stockResults, null, 2));
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testRealtimeQuote();
