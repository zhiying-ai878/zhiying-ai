// 测试涨停板潜力检测功能
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';
import { getOptimizedSignalManager } from './src/utils/optimizedSignalManager.js';

async function testLimitUpPotential() {
  console.log('=== 测试涨停板潜力检测功能 ===');
  
  try {
    const marketMonitor = getMarketMonitor();
    
    // 测试1: 检查市场监控状态
    console.log('\n测试1: 检查市场监控状态');
    const status = await marketMonitor.getStatus();
    console.log('市场监控状态:', {
      enabled: status.enabled,
      marketStatus: status.marketStatus,
      stockCount: status.stockCount,
      isScanning: status.isScanning,
      scanStatus: status.scanStatus,
      limitUpStocksCount: status.limitUpStocksCount
    });
    
    // 测试2: 执行一次市场扫描，生成信号
    console.log('\n测试2: 执行市场扫描');
    console.log('开始扫描市场...');
    await marketMonitor.performScan();
    console.log('扫描完成');
    
    // 测试3: 检查扫描历史
    console.log('\n测试3: 检查扫描历史');
    const scanHistory = (await marketMonitor.getStatus()).scanHistory;
    if (scanHistory && scanHistory.length > 0) {
      const lastScan = scanHistory[scanHistory.length - 1];
      console.log('最近一次扫描结果:', {
        timestamp: new Date(lastScan.timestamp).toLocaleString(),
        totalStocks: lastScan.totalStocks,
        processedStocks: lastScan.processedStocks,
        buySignals: lastScan.buySignals,
        sellSignals: lastScan.sellSignals,
        duration: lastScan.duration,
        status: lastScan.status,
        dataSourceStatus: lastScan.dataSourceStatus
      });
    } else {
      console.log('暂无扫描历史');
    }
    
    // 测试4: 检查信号管理器中的信号
    console.log('\n测试4: 检查生成的信号');
    const signalManager = getOptimizedSignalManager();
    const signals = signalManager.getSignalHistory();
    
    console.log(`共生成 ${signals.length} 个信号`);
    
    // 过滤出涨停潜力信号
    const limitUpSignals = signals.filter(signal => signal.isLimitUpPotential);
    console.log(`其中涨停潜力信号: ${limitUpSignals.length} 个`);
    
    // 显示涨停潜力信号详情
    if (limitUpSignals.length > 0) {
      console.log('\n涨停潜力信号详情:');
      limitUpSignals.forEach((signal, index) => {
        console.log(`${index + 1}. ${signal.stockName} (${signal.stockCode})`);
        console.log(`   置信度: ${signal.confidence}%`);
        console.log(`   涨停潜力分数: ${signal.limitUpPotentialScore}%`);
        console.log(`   原因: ${signal.reason}`);
        console.log(`   时间: ${new Date(signal.timestamp).toLocaleString()}`);
        console.log('');
      });
    } else {
      console.log('暂无涨停潜力信号');
    }
    
    // 测试5: 检查学习模型状态
    console.log('\n测试5: 检查学习模型状态');
    const modelStatus = (await marketMonitor.getStatus()).learningModel;
    console.log('学习模型状态:', {
      accuracy: (modelStatus.accuracy * 100).toFixed(2) + '%',
      lastTrained: modelStatus.lastTrained ? new Date(modelStatus.lastTrained).toLocaleString() : '未训练',
      featuresCount: modelStatus.featuresCount
    });
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中出错:', error);
  }
}

// 运行测试
testLimitUpPotential();