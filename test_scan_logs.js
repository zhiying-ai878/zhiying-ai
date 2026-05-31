// 测试扫描日志和信号生成
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';
import { getStockDataSource } from './src/utils/stockData.js';

console.log('=== 测试扫描日志和信号生成 ===');

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testScanLogs() {
  try {
    const marketMonitor = getMarketMonitor();
    const stockDataSource = getStockDataSource();
    
    console.log('\n1. 检查数据源状态...');
    const healthStatus = stockDataSource.getHealthStatus();
    console.log('数据源健康状态:', healthStatus);
    
    console.log('\n2. 执行一次扫描...');
    
    // 执行扫描
    await marketMonitor.performScan();
    
    console.log('\n3. 获取扫描历史...');
    const scanHistory = marketMonitor.getScanHistory();
    console.log('扫描历史:', scanHistory);
    
    console.log('\n4. 获取信号历史...');
    const signalHistory = marketMonitor.getSignalHistory();
    console.log('信号数量:', signalHistory.length);
    
    if (signalHistory.length > 0) {
      console.log('生成的信号:', signalHistory);
    } else {
      console.log('未生成信号');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testScanLogs();
