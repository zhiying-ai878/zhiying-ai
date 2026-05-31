import { superDataSourceManager } from './src/utils/superDataSourceManager.ts';

async function testDataSource() {
  console.log('=== 测试数据源 ===');
  
  try {
    // 测试获取贵州茅台和五粮液的数据
    const codes = ['600519', '000858'];
    console.log('正在获取股票数据:', codes);
    
    const quotes = await superDataSourceManager.getRealtimeQuote(codes);
    console.log('获取到的数据:', quotes);
    
    if (quotes.length > 0) {
      console.log('✅ 数据源测试成功！');
    } else {
      console.log('❌ 数据源测试失败，未获取到数据');
    }
  } catch (error) {
    console.error('❌ 数据源测试出错:', error);
  }
}

testDataSource();