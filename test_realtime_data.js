
// 测试实时数据获取
const { StockDataSource } = require('./src/utils/stockData.ts');

async function testRealtimeData() {
  console.log('=== 开始测试实时数据获取 ===');
  
  try {
    // 创建数据源实例
    const dataSource = new StockDataSource('eastmoney');
    
    // 测试股票300730
    const codes = ['300730'];
    console.log(`测试股票代码: ${codes}`);
    
    // 获取实时数据
    const results = await dataSource.getRealtimeQuote(codes);
    console.log('获取到的实时数据:', JSON.stringify(results, null, 2));
    
    if (results.length > 0) {
      console.log(`✓ 成功获取到 ${results.length} 条数据`);
      results.forEach(result => {
        console.log(`${result.name}(${result.code}): ${result.price}元, 涨${result.change} (${result.changePercent.toFixed(2)}%)`);
      });
    } else {
      console.log('✗ 未获取到任何数据');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testRealtimeData();

