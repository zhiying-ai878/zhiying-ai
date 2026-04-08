
// 简单测试信号生成逻辑
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';
import { getOptimizedSignalManager } from './src/utils/optimizedSignalManager.js';

async function testSimpleSignal() {
  console.log('=== 简单信号生成测试 ===');
  
  try {
    // 创建模拟的股票数据
    const mockStock = {
      code: '600000',
      name: '浦发银行',
      price: 10.5,
      changePercent: 2.5, // 上涨2.5%
      volume: 1000000,
      open: 10.2,
      high: 10.6,
      low: 10.1,
      close: 10.3
    };
    
    console.log('测试股票数据:', mockStock);
    
    // 获取信号管理器和市场监控器
    const signalManager = getOptimizedSignalManager();
    const marketMonitor = getMarketMonitor();
    
    // 手动生成信号
    console.log('\n手动生成信号...');
    const signals = await marketMonitor.generateSignals([mockStock], new Map());
    console.log('生成的信号:', signals);
    
    // 检查信号历史
    const history = signalManager.getSignalHistory();
    console.log('\n信号历史数量:', history.length);
    
    if (signals.length > 0) {
      console.log('✅ 成功生成信号！');
    } else {
      console.log('❌ 未生成信号');
    }
    
    // 测试另一个下跌的股票
    const mockStock2 = {
      code: '600001',
      name: '邯郸钢铁',
      price: 5.2,
      changePercent: -1.8, // 下跌1.8%
      volume: 500000,
      open: 5.3,
      high: 5.4,
      low: 5.1,
      close: 5.3
    };
    
    console.log('\n测试下跌股票:', mockStock2);
    const signals2 = await marketMonitor.generateSignals([mockStock2], new Map());
    console.log('下跌股票生成的信号:', signals2);
    
  } catch (error) {
    console.error('测试错误:', error);
  }
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
testSimpleSignal();
