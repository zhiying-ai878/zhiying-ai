
// 测试指数显示和预测价格修复
const { getStockDataSource } = require('./src/utils/stockData');
const { getHistoricalDataManager } = require('./src/utils/historicalData');
const { getTimeSeriesPredictor } = require('./src/utils/timeSeriesPredictor');

async function testIndexData() {
  console.log('=== 测试指数数据修复 ===');
  
  const dataSource = getStockDataSource();
  
  try {
    // 测试上证指数和科创综指
    const indexCodes = ['sh000001', 'sh000688'];
    const results = await dataSource.getRealtimeQuote(indexCodes);
    
    console.log('指数数据结果:');
    results.forEach(quote => {
      console.log(`${quote.name}(${quote.code}): 价格=${quote.price}, 涨跌幅=${quote.changePercent}%`);
    });
    
    // 验证价格是否正确
    const shIndex = results.find(q => q.code === '000001' || q.code === 'sh000001');
    const科创综指 = results.find(q => q.code === '000688' || q.code === 'sh000688');
    
    if (shIndex && shIndex.price > 3000) {
      console.log('✅ 上证指数价格正确:', shIndex.price);
    } else {
      console.log('❌ 上证指数价格异常:', shIndex?.price);
    }
    
    if (科创综指 && 科创综指.price > 1000) {
      console.log('✅ 科创综指价格正确:', 科创综指.price);
    } else {
      console.log('❌ 科创综指价格异常:', 科创综指?.price);
    }
    
  } catch (error) {
    console.error('获取指数数据失败:', error);
  }
}

async function testPredictionData() {
  console.log('\n=== 测试预测价格修复 ===');
  
  const historicalManager = getHistoricalDataManager();
  const predictor = getTimeSeriesPredictor();
  
  try {
    // 测试比亚迪
    console.log('测试比亚迪(002594)...');
    const bydData = await historicalManager.getHistoricalData('002594');
    console.log(`获取到比亚迪历史数据: ${bydData.length}条`);
    console.log(`最新价格: ${bydData[bydData.length - 1].close}`);
    
    if (bydData.length > 0) {
      const bydPredictions = await predictor.predict('002594', bydData);
      console.log('比亚迪预测结果:', bydPredictions[0]);
    }
    
    // 测试泽宇智能
    console.log('\n测试泽宇智能(301179)...');
    const zeyuData = await historicalManager.getHistoricalData('301179');
    console.log(`获取到泽宇智能历史数据: ${zeyuData.length}条`);
    console.log(`最新价格: ${zeyuData[zeyuData.length - 1].close}`);
    
    if (zeyuData.length > 0) {
      const zeyuPredictions = await predictor.predict('301179', zeyuData);
      console.log('泽宇智能预测结果:', zeyuPredictions[0]);
    }
    
  } catch (error) {
    console.error('测试预测数据失败:', error);
  }
}

// 运行测试
async function runTests() {
  await testIndexData();
  await testPredictionData();
}

runTests().catch(console.error);
