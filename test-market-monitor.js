// 测试市场监控功能
import { getMarketMonitor } from './src/utils/marketMonitorManager.ts';

async function testMarketMonitor() {
  console.log('开始测试市场监控...');
  
  const marketMonitor = getMarketMonitor();
  
  // 获取初始状态
  const initialStatus = marketMonitor.getStatus();
  console.log('初始状态:', {
    stockCount: initialStatus.stockCount,
    isScanning: initialStatus.isScanning,
    marketStatus: initialStatus.marketStatus
  });
  
  // 执行一次扫描
  console.log('执行全市场扫描...');
  await marketMonitor.performScan();
  
  // 获取扫描后的状态
  const afterScanStatus = marketMonitor.getStatus();
  console.log('扫描后状态:', {
    stockCount: afterScanStatus.stockCount,
    isScanning: afterScanStatus.isScanning,
    marketStatus: afterScanStatus.marketStatus,
    scanHistory: afterScanStatus.scanHistory.length
  });
  
  console.log('测试完成！');
}

testMarketMonitor().catch(console.error);
