
// 简单测试脚本
import { getStockDataSource } from './src/utils/stockData.js';

async function testSimple() {
  console.log('=== 简单测试 ===');
  
  try {
    const dataSource = getStockDataSource();
    
    // 测试股票300730
    const results = await dataSource.getRealtimeQuote(['300730']);
    console.log('股票300730数据:', results);
    
    if (results.length > 0) {
      console.log('成功获取数据:', results[0]);
    } else {
      console.log('未获取到数据');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testSimple();

