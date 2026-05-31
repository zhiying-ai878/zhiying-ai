
import { getStockDataSource } from './src/utils/stockData.js';

async function testIndexData() {
  console.log('=== 测试指数数据获取 ===');
  
  const dataSource = getStockDataSource();
  
  // 测试的指数代码
  const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
  
  console.log('测试数据源列表:', dataSource.getEnhancedDataSourceList().map(s => s.name));
  
  // 测试各个数据源
  const sourcesToTest = ['eastmoney_pro', 'eastmoney_mini', 'eastmoney', 'sina', 'tencent'];
  
  for (const source of sourcesToTest) {
    console.log(`\n=== 测试数据源: ${source} ===`);
    try {
      let results;
      
      switch (source) {
        case 'eastmoney_pro':
          results = await dataSource.getEastMoneyProRealtimeQuote(indexCodes);
          break;
        case 'eastmoney_mini':
          results = await dataSource.getEastMoneyMiniRealtimeQuote(indexCodes);
          break;
        case 'eastmoney':
          results = await dataSource.getEastMoneyRealtimeQuote(indexCodes);
          break;
        case 'sina':
          results = await dataSource.getSinaRealtimeQuote(indexCodes);
          break;
        case 'tencent':
          results = await dataSource.getTencentRealtimeQuote(indexCodes);
          break;
      }
      
      console.log(`数据源 ${source} 返回 ${results.length} 条数据:`);
      results.forEach(quote => {
        console.log(`${quote.code} ${quote.name}: ${quote.price} (${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}, ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`);
      });
      
    } catch (error) {
      console.error(`数据源 ${source} 测试失败:`, error);
    }
  }
  
  // 测试主函数
  console.log('\n=== 测试主函数 getRealtimeQuote ===');
  try {
    const results = await dataSource.getRealtimeQuote(indexCodes);
    console.log(`主函数返回 ${results.length} 条数据:`);
    results.forEach(quote => {
      console.log(`${quote.code} ${quote.name}: ${quote.price} (${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)}, ${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)`);
    });
  } catch (error) {
    console.error('主函数测试失败:', error);
  }
}

testIndexData().catch(console.error);
