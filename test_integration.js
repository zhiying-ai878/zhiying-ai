
// 集成测试：验证完整的数据获取流程
import { getRealtimeQuote } from './src/utils/stockData.js';

async function testIntegration() {
  console.log('=== 集成测试：验证完整数据获取流程 ===');
  
  try {
    // 测试getRealtimeQuote函数
    console.log('\n1. 测试getRealtimeQuote函数:');
    const testCodes = ['sh600519', 'sz000858', 'sh000001', 'sz399001'];
    console.log('测试股票代码:', testCodes);
    
    const results = await getRealtimeQuote(testCodes);
    console.log('获取到的数据:', JSON.stringify(results, null, 2));
    
    if (results && results.length > 0) {
      console.log(`✓ 成功获取到 ${results.length} 个股票数据`);
      
      // 验证数据格式
      results.forEach((quote, index) => {
        console.log(`\n股票 ${index + 1}: ${quote.name} (${quote.code})`);
        console.log(`  价格: ${quote.price}`);
        console.log(`  涨跌幅: ${quote.changePercent.toFixed(2)}%`);
        console.log(`  成交量: ${quote.volume}`);
      });
      
    } else {
      console.log('✗ 未获取到任何数据');
    }
    
  } catch (error) {
    console.error('集成测试失败:', error.message);
    console.error('错误详情:', error);
  }
  
  console.log('\n=== 集成测试完成 ===');
}

testIntegration();
