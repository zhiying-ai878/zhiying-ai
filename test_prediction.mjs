// 测试AI预测功能
import { getHistoricalDataManager } from './src/utils/historicalData.js';
import { getTimeSeriesPredictor } from './src/utils/timeSeriesPredictor.js';

async function testPrediction() {
  console.log('开始测试AI预测功能...');
  
  try {
    // 获取历史数据管理器
    const historicalManager = getHistoricalDataManager();
    
    // 测试股票代码
    const stockCode = 'sh600519'; // 贵州茅台
    
    console.log(`正在获取股票 ${stockCode} 的历史数据...`);
    const historicalData = await historicalManager.getHistoricalData(stockCode);
    console.log(`获取到历史数据: ${historicalData.length} 条`);
    
    if (historicalData.length === 0) {
      console.error('历史数据为空，无法进行预测');
      return;
    }
    
    console.log('历史数据样本:', historicalData.slice(0, 5));
    
    // 获取预测器
    const predictor = getTimeSeriesPredictor();
    
    console.log(`开始预测股票 ${stockCode} 的未来走势...`);
    const predictions = await predictor.predict(stockCode, historicalData);
    console.log(`预测结果: ${predictions.length} 条`);
    
    if (predictions.length === 0) {
      console.error('预测结果为空');
      return;
    }
    
    console.log('预测结果详情:', predictions);
    
    console.log('AI预测功能测试成功！');
    
  } catch (error) {
    console.error('AI预测功能测试失败:', error);
    console.error('错误详情:', error.stack);
  }
}

// 运行测试
testPrediction();
