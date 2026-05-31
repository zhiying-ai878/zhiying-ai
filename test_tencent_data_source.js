// 测试腾讯数据源
import { getStockDataSource } from './src/utils/stockData.js';

console.log('=== 测试腾讯数据源 ===');

async function testTencentDataSource() {
  try {
    const stockDataSource = getStockDataSource();
    
    // 测试单个股票
    console.log('\n1. 测试单个股票数据获取...');
    const quotes = await stockDataSource.getRealtimeQuote(['600519']);
    console.log('获取到的数据:', quotes);
    
    if (quotes.length > 0) {
      console.log('✅ 腾讯数据源工作正常！');
      console.log('股票名称:', quotes[0].name);
      console.log('当前价格:', quotes[0].price);
      console.log('涨跌幅:', quotes[0].changePercent);
    } else {
      console.log('❌ 未获取到数据');
    }
    
    // 测试多个股票
    console.log('\n2. 测试多个股票数据获取...');
    const multipleQuotes = await stockDataSource.getRealtimeQuote(['600519', '000001', '002594']);
    console.log('获取到的股票数量:', multipleQuotes.length);
    
    if (multipleQuotes.length > 0) {
      console.log('✅ 批量获取成功！');
      multipleQuotes.forEach(quote => {
        console.log(`${quote.name}(${quote.code}): ${quote.price}元, 涨跌幅: ${quote.changePercent}%`);
      });
    }
    
    // 测试主力资金数据
    console.log('\n3. 测试主力资金数据获取...');
    const mainForceData = await stockDataSource.getMainForceData(['600519']);
    console.log('主力资金数据:', mainForceData);
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testTencentDataSource();
