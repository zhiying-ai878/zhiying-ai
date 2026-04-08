// 测试集成的数据源功能
import { getStockDataSource } from './src/utils/stockData.js';

console.log('=== 测试集成数据源功能 ===');

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testIntegratedDataSources() {
  try {
    const dataSource = getStockDataSource();
    
    console.log('\n1. 测试数据源健康状态...');
    const healthStatus = dataSource.getHealthStatus();
    console.log('数据源健康状态:', healthStatus);
    
    console.log('\n2. 测试实时行情数据获取...');
    const testCodes = ['600519', '000001', '002594'];
    
    // 测试各个数据源
    const sources = ['tencent', 'sina', 'eastmoney', 'xueqiu'];
    
    for (const source of sources) {
      console.log(`\n测试 ${source} 数据源...`);
      try {
        // 设置当前数据源
        dataSource.setSourceType(source);
        
        // 获取实时行情数据
        const quotes = await dataSource.getRealtimeQuote(testCodes);
        console.log(`  ✓ 成功获取 ${quotes.length} 条数据`);
        
        if (quotes.length > 0) {
          console.log(`  示例数据: ${quotes[0].name} - ${quotes[0].price}元`);
        }
        
      } catch (error) {
        console.log(`  ✗ 失败 - ${error.message}`);
      }
    }
    
    console.log('\n3. 测试主力资金数据获取...');
    try {
      const mainForceData = await dataSource.getMainForceData(testCodes);
      console.log(`✓ 成功获取 ${mainForceData.length} 条主力资金数据`);
      
      if (mainForceData.length > 0) {
        console.log(`示例数据: ${mainForceData[0].stockName} - 主力净流入: ${mainForceData[0].mainForceNetFlow}`);
      }
    } catch (error) {
      console.log(`✗ 主力资金数据获取失败 - ${error.message}`);
    }
    
    console.log('\n4. 测试数据源自动切换功能...');
    try {
      // 测试自动切换
      const quotes = await dataSource.getRealtimeQuoteParallel(testCodes);
      console.log(`✓ 自动切换功能正常，获取 ${quotes.length} 条数据`);
    } catch (error) {
      console.log(`✗ 自动切换功能失败 - ${error.message}`);
    }
    
    console.log('\n=== 所有测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error);
  }
}

testIntegratedDataSources();
