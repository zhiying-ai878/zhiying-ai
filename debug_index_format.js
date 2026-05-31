import { getRealtimeQuote } from './src/utils/stockData.js';

async function debugIndexFormat() {
  console.log('=== 调试指数数据格式 ===');
  
  try {
    const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    console.log('请求指数代码:', indexCodes);
    
    const results = await getRealtimeQuote(indexCodes);
    console.log('获取到的指数数据:', JSON.stringify(results, null, 2));
    
    console.log('\n数据格式分析:');
    results.forEach(result => {
      console.log(`代码: ${result.code}, 名称: ${result.name}, 价格: ${result.price}, 涨跌: ${result.change}, 涨跌幅: ${result.changePercent}%`);
    });
    
    // 创建映射测试
    const indexMap = new Map(results.map(r => [r.code, r]));
    console.log('\n映射测试:');
    console.log('sh000001:', indexMap.get('sh000001'));
    console.log('000001:', indexMap.get('000001'));
    
  } catch (error) {
    console.error('获取指数数据失败:', error);
  }
  
  console.log('\n=== 调试完成 ===');
}

debugIndexFormat();
