
// 测试前端数据集成
import { getStockDataSource } from './src/utils/stockData.js';

async function testFrontendIntegration() {
  console.log('=== 测试前端数据集成 ===');
  
  try {
    // 获取数据源实例
    const dataSource = getStockDataSource();
    
    // 测试获取股票300730的数据
    const stockCode = '300730';
    console.log(`测试股票: ${stockCode}`);
    
    // 获取实时数据
    const results = await dataSource.getRealtimeQuote([stockCode]);
    console.log('获取到的实时数据:', JSON.stringify(results, null, 2));
    
    if (results.length > 0) {
      console.log('✓ 成功获取实时数据');
      const stock = results[0];
      console.log(`${stock.name}(${stock.code}): ${stock.price}元, 涨${stock.change} (${stock.changePercent.toFixed(2)}%)`);
    } else {
      console.log('✗ 未获取到实时数据');
    }
    
    // 测试代码格式化逻辑
    const fullCode = stockCode.startsWith('6') ? `sh${stockCode}` : `sz${stockCode}`;
    console.log(`代码格式化: ${stockCode} -> ${fullCode}`);
    
  } catch (error) {
    console.error('测试失败:', error);
    console.error('错误详情:', error.message);
  }
}

testFrontendIntegration();

