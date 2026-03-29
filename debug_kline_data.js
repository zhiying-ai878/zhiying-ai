
import { getStockDataSource } from './src/utils/stockData.js';

async function testKLineData() {
  console.log('=== 测试K线数据获取 ===');
  
  try {
    const dataSource = getStockDataSource('eastmoney');
    
    // 测试上证指数
    console.log('测试上证指数 sh000001');
    try {
      const shIndexData = await dataSource.getKLineData('000001', 'day', 30);
      console.log('上证指数K线数据:', shIndexData.length, '条');
      console.log('样本数据:', shIndexData.slice(0, 5));
    } catch (error) {
      console.error('获取上证指数K线数据失败:', error);
    }
    
    // 测试深证成指
    console.log('\n测试深证成指 sz399001');
    try {
      const szIndexData = await dataSource.getKLineData('399001', 'day', 30);
      console.log('深证成指K线数据:', szIndexData.length, '条');
      console.log('样本数据:', szIndexData.slice(0, 5));
    } catch (error) {
      console.error('获取深证成指K线数据失败:', error);
    }
    
    // 测试贵州茅台
    console.log('\n测试贵州茅台 600519');
    try {
      const stockData = await dataSource.getKLineData('600519', 'day', 30);
      console.log('贵州茅台K线数据:', stockData.length, '条');
      console.log('样本数据:', stockData.slice(0, 5));
    } catch (error) {
      console.error('获取贵州茅台K线数据失败:', error);
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testKLineData();

