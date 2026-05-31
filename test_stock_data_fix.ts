// 测试股票代码与名称匹配修复
import { getRealtimeQuote, getMainForceData } from './src/utils/stockData';

async function testStockDataFix() {
  console.log('=== 测试股票代码与名称匹配修复 ===');
  
  // 测试用户报告的三个股票
  const testStocks = [
    { code: '688510', expectedName: '航亚科技' },
    { code: '300480', expectedName: '光力科技' },
    { code: '603730', expectedName: '岱美股份' }
  ];
  
  console.log('\n1. 测试实时行情数据获取...');
  try {
    const quotes = await getRealtimeQuote(testStocks.map(s => s.code));
    console.log(`获取到 ${quotes.length} 条行情数据`);
    
    quotes.forEach(quote => {
      const expected = testStocks.find(s => s.code === quote.code);
      if (expected) {
        console.log(`${quote.code} - ${quote.name} (预期: ${expected.expectedName})`);
        if (quote.name.includes(expected.expectedName)) {
          console.log(`  ✓ 名称匹配正确`);
        } else {
          console.log(`  ✗ 名称不匹配`);
        }
      }
    });
  } catch (error) {
    console.error('获取实时行情失败:', error);
  }
  
  console.log('\n2. 测试主力资金数据获取...');
  try {
    const mainForceData = await getMainForceData(testStocks.map(s => s.code));
    console.log(`获取到 ${mainForceData.length} 条主力资金数据`);
    
    mainForceData.forEach(data => {
      const expected = testStocks.find(s => s.code === data.stockCode);
      if (expected) {
        console.log(`${data.stockCode} - ${data.stockName} (预期: ${expected.expectedName})`);
        if (data.stockName.includes(expected.expectedName)) {
          console.log(`  ✓ 名称匹配正确`);
        } else {
          console.log(`  ✗ 名称不匹配`);
        }
      }
    });
  } catch (error) {
    console.error('获取主力资金数据失败:', error);
  }
  
  console.log('\n=== 测试完成 ===');
}

testStockDataFix().catch(console.error);
