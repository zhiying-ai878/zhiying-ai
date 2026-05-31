
// 验证f170字段修复是否生效
// 测试修复后的代码是否正确处理涨跌幅数据

import { getStockDataSource } from './src/utils/stockData.js';

async function testFixVerification() {
  console.log('=== 验证f170字段修复效果 ===');
  
  try {
    // 创建数据源实例
    const dataSource = getStockDataSource('eastmoney');
    
    // 测试数据
    const testCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688', 'sz301179'];
    const codeNames = ['上证指数', '深证成指', '创业板指', '科创综指', '泽宇智能'];
    
    console.log('\n测试代码列表:', testCodes);
    
    // 获取实时数据
    const results = await dataSource.getRealtimeQuote(testCodes);
    
    console.log('\n获取到的数据:');
    results.forEach((result, index) => {
      console.log(`${codeNames[index]} (${testCodes[index]}):`);
      console.log(`  价格: ${result.price}`);
      console.log(`  涨跌额: ${result.change}`);
      console.log(`  涨跌幅: ${result.changePercent.toFixed(2)}%`);
      console.log('');
    });
    
    // 验证数据是否正确
    console.log('=== 验证结果 ===');
    let allCorrect = true;
    
    results.forEach((result, index) => {
      const expectedRange = result.changePercent >= -10 && result.changePercent <= 10;
      const isCorrect = expectedRange;
      allCorrect = allCorrect && isCorrect;
      
      console.log(`${codeNames[index]}: ${isCorrect ? '✅ 正确' : '❌ 错误'} (涨跌幅: ${result.changePercent.toFixed(2)}%)`);
    });
    
    console.log(`\n总体验证结果: ${allCorrect ? '✅ 所有数据正确' : '❌ 存在错误数据'}`);
    
    return { success: allCorrect, results };
    
  } catch (error) {
    console.error('测试过程中出现错误:', error);
    return { success: false, error: error.message };
  }
}

// 运行测试
testFixVerification().then(result => {
  console.log('\n=== 测试完成 ===');
  console.log(`测试结果: ${result.success ? '成功' : '失败'}`);
}).catch(console.error);
