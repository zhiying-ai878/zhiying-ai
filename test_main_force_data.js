// 测试主力资金数据获取
import { getStockDataSource } from './src/utils/stockData.js';

console.log('=== 测试主力资金数据获取 ===');

async function testMainForceData() {
  try {
    const stockDataSource = getStockDataSource();
    
    // 测试单个股票
    console.log('\n1. 测试单个股票主力资金数据获取...');
    const mainForceData = await stockDataSource.getMainForceData(['600519']);
    console.log('主力资金数据:', mainForceData);
    
    if (mainForceData.length > 0) {
      console.log('✅ 主力资金数据获取成功！');
      console.log('股票代码:', mainForceData[0].stockCode);
      console.log('股票名称:', mainForceData[0].stockName);
      console.log('主力资金净流入:', mainForceData[0].mainForceNetFlow);
      console.log('成交量放大倍数:', mainForceData[0].volumeAmplification);
      console.log('换手率:', mainForceData[0].turnoverRate);
    } else {
      console.log('❌ 未获取到主力资金数据');
    }
    
    // 测试多个股票
    console.log('\n2. 测试多个股票主力资金数据获取...');
    const multipleMainForceData = await stockDataSource.getMainForceData(['600519', '000001', '002594']);
    console.log('获取到的主力资金数据数量:', multipleMainForceData.length);
    
    if (multipleMainForceData.length > 0) {
      console.log('✅ 批量获取主力资金数据成功！');
      multipleMainForceData.forEach(data => {
        console.log(`${data.stockName}(${data.stockCode}): 主力资金净流入: ${data.mainForceNetFlow}, 成交量放大: ${data.volumeAmplification}, 换手率: ${data.turnoverRate}`);
      });
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testMainForceData();
