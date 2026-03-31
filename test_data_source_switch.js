import { getRealtimeQuote } from './src/utils/stockData.js';

async function testDataSourceSwitch() {
  console.log('=== 测试数据源切换逻辑 ===');
  
  const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
  
  try {
    console.log('请求指数数据:', indexCodes);
    
    const results = await getRealtimeQuote(indexCodes);
    
    console.log('\n获取到的数据:');
    results.forEach(result => {
      console.log(`${result.code} (${result.name}): 价格=${result.price}, 涨跌=${result.change}, 涨跌幅=${result.changePercent}%`);
    });
    
    console.log(`\n成功获取 ${results.length}/${indexCodes.length} 条数据`);
    
  } catch (error) {
    console.error('获取数据失败:', error);
  }
  
  console.log('\n=== 测试完成 ===');
}

testDataSourceSwitch();
