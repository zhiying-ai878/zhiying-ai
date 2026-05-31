// 简化的系统检查测试
import { getStockDataSource } from './src/utils/stockData.js';
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';
import { getOptimizedSignalManager } from './src/utils/optimizedSignalManager.js';

console.log('=== 简化系统检查 ===');

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testSignalSystem() {
  try {
    console.log('1. 初始化系统组件...');
    const dataSource = getStockDataSource();
    const marketMonitor = getMarketMonitor();
    const signalManager = getOptimizedSignalManager();
    
    console.log('✓ 系统组件初始化成功');
    
    // 测试股票代码
    const testCode = '600519'; // 贵州茅台
    
    console.log('\n2. 测试实时行情数据获取...');
    const quotes = await dataSource.getRealtimeQuote([testCode]);
    console.log(`✓ 获取到 ${quotes.length} 条实时行情数据`);
    
    if (quotes.length === 0) {
      console.error('❌ 无法获取实时行情数据');
      return;
    }
    
    const quote = quotes[0];
    console.log(`  股票: ${quote.name} - ${quote.price}元`);
    
    console.log('\n3. 测试技术指标计算...');
    const technicalData = await dataSource.getTechnicalIndicators(testCode);
    console.log('✓ 技术指标计算成功');
    console.log(`  RSI: ${technicalData.rsi}, MACD: ${technicalData.macd}`);
    
    console.log('\n4. 测试主力资金数据获取...');
    const mainForceData = await dataSource.getMainForceData([testCode]);
    console.log(`✓ 获取到 ${mainForceData.length} 条主力资金数据`);
    
    if (mainForceData.length === 0) {
      console.error('❌ 无法获取主力资金数据');
      return;
    }
    
    const mainForce = mainForceData[0];
    console.log(`  主力净流入: ${mainForce.mainForceNetFlow}`);
    
    console.log('\n5. 测试价格预测...');
    const prediction = await dataSource.predictPrice(testCode);
    console.log('✓ 价格预测成功');
    console.log(`  预测价格: ${prediction.predictedPrice}`);
    console.log(`  目标价格: ${prediction.targetPrice}`);
    console.log(`  预期涨幅: ${(prediction.expectedIncrease * 100).toFixed(2)}%`);
    
    console.log('\n6. 测试信号生成...');
    const comprehensiveData = {
      ...quote,
      ...technicalData,
      ...mainForce,
      ...prediction
    };
    
    const buySignal = signalManager.generateBuySignal(comprehensiveData);
    const sellSignal = signalManager.generateSellSignal(comprehensiveData);
    
    console.log(`  买入信号: ${buySignal ? '✓' : '✗'}`);
    console.log(`  卖出信号: ${sellSignal ? '✓' : '✗'}`);
    
    console.log('\n7. 测试市场扫描...');
    await marketMonitor.performScan();
    
    const scanHistory = marketMonitor.getScanHistory();
    if (scanHistory.length > 0) {
      const lastScan = scanHistory[scanHistory.length - 1];
      console.log(`✓ 扫描完成`);
      console.log(`  扫描股票数: ${lastScan.totalStocks}`);
      console.log(`  买入信号: ${lastScan.buySignals}`);
      console.log(`  卖出信号: ${lastScan.sellSignals}`);
    }
    
    const signalHistory = marketMonitor.getSignalHistory();
    console.log(`  生成的信号总数: ${signalHistory.length}`);
    
    if (signalHistory.length > 0) {
      console.log('✓ 成功生成信号');
      console.log('  信号列表:', signalHistory);
    } else {
      console.error('❌ 没有生成任何信号');
    }
    
    console.log('\n=== 系统检查完成 ===');
    
  } catch (error) {
    console.error('系统检查过程中发生错误:', error);
  }
}

testSignalSystem();
