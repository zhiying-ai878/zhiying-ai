import { StockDataSource } from './src/utils/stockData.js';
import { getTimeSeriesPredictor } from './src/utils/timeSeriesPredictor.js';

async function testIndexData() {
  console.log('=== 测试指数数据 ===');
  const dataSource = new StockDataSource('eastmoney');
  
  try {
    // 测试上证指数
    const shIndex = await dataSource.getRealtimeQuote(['sh000001']);
    console.log('上证指数:', shIndex);
    
    // 测试科创综指
    const sciIndex = await dataSource.getRealtimeQuote(['sh000688']);
    console.log('科创综指:', sciIndex);
    
  } catch (error) {
    console.error('获取指数数据失败:', error);
  }
}

async function testStockPrediction() {
  console.log('\n=== 测试股票预测 ===');
  
  // 测试比亚迪
  const dataSource = new StockDataSource('eastmoney');
  const predictor = getTimeSeriesPredictor();
  
  try {
    // 获取比亚迪实时行情
    const bydQuote = await dataSource.getRealtimeQuote(['002594']);
    console.log('比亚迪实时行情:', bydQuote);
    
    // 获取比亚迪K线数据
    const bydKline = await dataSource.getKLineData('002594', 'day', 60);
    console.log('比亚迪K线数据条数:', bydKline.length);
    if (bydKline.length > 0) {
      console.log('比亚迪最近K线数据:', bydKline[bydKline.length - 1]);
    }
    
    // 测试预测
    if (bydKline.length > 0) {
      const historicalData = bydKline.map(k => ({
        date: k.date,
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
        volume: k.volume,
        amount: k.amount
      }));
      
      const predictions = await predictor.predict('002594', historicalData);
      console.log('比亚迪预测结果:', predictions);
    }
    
    // 测试泽宇智能
    console.log('\n=== 测试泽宇智能 ===');
    const zeyuQuote = await dataSource.getRealtimeQuote(['301179']);
    console.log('泽宇智能实时行情:', zeyuQuote);
    
    const zeyuKline = await dataSource.getKLineData('301179', 'day', 60);
    console.log('泽宇智能K线数据条数:', zeyuKline.length);
    if (zeyuKline.length > 0) {
      console.log('泽宇智能最近K线数据:', zeyuKline[zeyuKline.length - 1]);
      
      const historicalData = zeyuKline.map(k => ({
        date: k.date,
        open: k.open,
        high: k.high,
        low: k.low,
        close: k.close,
        volume: k.volume,
        amount: k.amount
      }));
      
      const predictions = await predictor.predict('301179', historicalData);
      console.log('泽宇智能预测结果:', predictions);
    }
    
  } catch (error) {
    console.error('预测测试失败:', error);
  }
}

// 运行测试
async function runTests() {
  await testIndexData();
  await testStockPrediction();
}

runTests();
