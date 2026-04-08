
// 测试信号生成功能
import { getMarketMonitor } from './src/utils/marketMonitorManager';
import { getOptimizedSignalManager } from './src/utils/optimizedSignalManager';

console.log('=== 测试信号生成功能 ===');

// 模拟localStorage
global.localStorage = {
  getItem: (key: string): string | null => null,
  setItem: (key: string, value: string): void => {},
  removeItem: (key: string): void => {},
  clear: (): void => {}
} as Storage;

async function testSignalGeneration() {
  try {
    console.log('1. 初始化市场监控管理器...');
    const marketMonitor = getMarketMonitor();
    
    console.log('2. 执行扫描生成信号...');
    await marketMonitor.scanMarket();
    
    console.log('3. 获取生成的信号...');
    const signalManager = getOptimizedSignalManager();
    const signals = signalManager.getSignalHistory();
    
    console.log(`4. 生成的信号数量: ${signals.length}`);
    if (signals.length > 0) {
      console.log('生成的信号:');
      signals.forEach((signal, index) => {
        console.log(`  ${index + 1}. ${signal.type.toUpperCase()} - ${signal.stockName}(${signal.stockCode}) - 置信度: ${signal.confidence}%`);
      });
    } else {
      console.log('没有生成信号');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testSignalGeneration();

