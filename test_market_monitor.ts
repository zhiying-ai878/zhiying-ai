
// 测试市场监控管理器的信号生成功能
import { getMarketMonitor } from './src/utils/marketMonitorManager';

console.log('=== 测试市场监控管理器 ===');

// 模拟localStorage
global.localStorage = {
  getItem: (key: string): string | null => null,
  setItem: (key: string, value: string): void => {},
  removeItem: (key: string): void => {},
  clear: (): void => {}
} as Storage;

async function testMarketMonitor() {
  try {
    console.log('1. 初始化市场监控管理器...');
    const marketMonitor = getMarketMonitor();
    
    console.log('2. 启动市场监控...');
    marketMonitor.startMonitoring();
    
    console.log('3. 执行一次扫描...');
    await marketMonitor.performScan();
    
    console.log('4. 获取市场监控状态...');
    const status = await marketMonitor.getStatus();
    console.log('市场监控状态:', status);
    
    console.log('5. 获取信号历史...');
    const signalManager = marketMonitor['signalManager'];
    const signals = signalManager.getSignalHistory();
    console.log(`生成的信号总数: ${signals.length}`);
    
    if (signals.length > 0) {
      console.log('生成的信号列表:');
      signals.forEach((signal, index) => {
        console.log(`   ${index + 1}. ${signal.type.toUpperCase()} - ${signal.stockName}(${signal.stockCode}) - 置信度: ${signal.confidence}%`);
      });
    } else {
      console.log('警告: 没有生成任何信号');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testMarketMonitor();

