// 测试完整的信号系统
import { getStockDataSource } from './src/utils/stockData.ts';
import { getMarketMonitor } from './src/utils/marketMonitorManager.ts';
import { getOptimizedSignalManager } from './src/utils/optimizedSignalManager.ts';

console.log('=== 测试完整信号系统 ===');

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testFullSystem() {
  try {
    console.log('1. 初始化系统组件...');
    const dataSource = getStockDataSource();
    const marketMonitor = getMarketMonitor();
    const signalManager = getOptimizedSignalManager();
    
    console.log('✓ 系统组件初始化成功');
    
    console.log('\n2. 启动市场监控...');
    marketMonitor.startMonitoring();
    console.log('✓ 市场监控已启动');
    
    console.log('\n3. 执行市场扫描...');
    await marketMonitor.performScan();
    
    console.log('\n4. 获取扫描结果...');
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
    
    console.log('\n5. 获取生成的信号...');
    const signalHistory = marketMonitor.getSignalHistory();
    console.log(`生成的信号数量: ${signalHistory.length}`);
    
    if (signalHistory.length > 0) {
      console.log('✓ 成功生成信号！');
      console.log('生成的信号:', signalHistory);
      
      // 显示前5个信号详情
      signalHistory.slice(0, 5).forEach((signal, index) => {
        console.log(`\n信号 ${index + 1}:`);
        console.log(`  股票: ${signal.stockName} (${signal.stockCode})`);
        console.log(`  类型: ${signal.type === 'buy' ? '买入' : '卖出'}`);
        console.log(`  价格: ${signal.price}元`);
        console.log(`  置信度: ${signal.confidence}%`);
        console.log(`  理由: ${signal.reason}`);
      });
      
    } else {
      console.error('❌ 没有生成任何信号');
      
      // 检查市场状态
      const marketStatus = await marketMonitor.getStatus();
      console.log('市场状态:', marketStatus);
      
      // 检查数据源状态
      const dataSourceStatus = dataSource.getHealthStatus();
      console.log('数据源状态:', dataSourceStatus);
      
      // 测试单个股票的数据获取
      console.log('\n测试单个股票数据获取...');
      const testCode = '600519';
      try {
        const quote = await dataSource.getRealtimeQuote([testCode]);
        console.log('实时行情数据:', quote);
        
        const mainForce = await dataSource.getMainForceData([testCode]);
        console.log('主力资金数据:', mainForce);
        
        const technical = await dataSource.getTechnicalIndicators(testCode);
        console.log('技术指标数据:', technical);
        
      } catch (error) {
        console.error('数据获取失败:', error);
      }
    }
    
    console.log('\n=== 系统测试完成 ===');
    
  } catch (error) {
    console.error('系统测试过程中发生错误:', error);
  }
}

testFullSystem();
