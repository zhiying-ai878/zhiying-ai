// 测试修复后的信号生成系统
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';
import { getStockDataSource } from './src/utils/stockData.js';

console.log('=== 测试修复后的信号生成系统 ===');

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testFixedSignals() {
  try {
    const marketMonitor = getMarketMonitor();
    const stockDataSource = getStockDataSource();
    
    console.log('\n1. 检查数据源状态...');
    const healthStatus = stockDataSource.getHealthStatus();
    console.log('数据源健康状态:', healthStatus);
    
    console.log('\n2. 手动触发一次扫描...');
    
    // 执行扫描
    await marketMonitor.performScan();
    
    console.log('\n3. 获取扫描结果...');
    const scanHistory = marketMonitor.getScanHistory();
    if (scanHistory.length > 0) {
      const lastScan = scanHistory[scanHistory.length - 1];
      console.log('最新扫描结果:', {
        totalStocks: lastScan.totalStocks,
        buySignals: lastScan.buySignals,
        sellSignals: lastScan.sellSignals,
        scanStatus: lastScan.scanStatus
      });
    }
    
    console.log('\n4. 获取信号历史...');
    const signalHistory = marketMonitor.getSignalHistory();
    console.log('信号数量:', signalHistory.length);
    
    if (signalHistory.length > 0) {
      console.log('生成的信号:', signalHistory);
    } else {
      console.log('未生成信号 - 可能是因为条件仍然太严格');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testFixedSignals();
