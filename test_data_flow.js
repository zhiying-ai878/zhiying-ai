import { StockDataSource } from './src/utils/stockData.js';

async function testDataFlow() {
  console.log('=== 测试数据完整流程 ===');
  const dataSource = new StockDataSource('eastmoney');
  
  try {
    // 测试指数数据获取
    console.log('\n1. 获取指数数据...');
    const indexResults = await dataSource.getRealtimeQuote(['sh000001', 'sh000688']);
    console.log('获取到的指数数据:', JSON.stringify(indexResults, null, 2));
    
    // 测试股票数据获取
    console.log('\n2. 获取股票数据...');
    const stockResults = await dataSource.getRealtimeQuote(['002594', '301179']);
    console.log('获取到的股票数据:', JSON.stringify(stockResults, null, 2));
    
    // 测试K线数据获取
    console.log('\n3. 获取K线数据...');
    const bydKline = await dataSource.getKLineData('002594', 'day', 60);
    console.log('比亚迪K线数据条数:', bydKline.length);
    if (bydKline.length > 0) {
      console.log('比亚迪最近K线数据:', bydKline[bydKline.length - 1]);
    }
    
    const zeyuKline = await dataSource.getKLineData('301179', 'day', 60);
    console.log('泽宇智能K线数据条数:', zeyuKline.length);
    if (zeyuKline.length > 0) {
      console.log('泽宇智能最近K线数据:', zeyuKline[zeyuKline.length - 1]);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testDataFlow();
