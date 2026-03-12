import { getStockDataSource } from './src/utils/stockData.js';

async function testTHSMainForceData() {
  try {
    console.log('测试同花顺主力资金数据...');
    const source = getStockDataSource('ths');
    const data = await source.getMainForceData(['000001', '600519']);
    console.log('同花顺主力资金数据:', data);
    console.log('测试成功！');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testTHSMainForceData();