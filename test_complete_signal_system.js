// 全面检查整个买卖提示信号系统的各个环节
import { getStockDataSource } from './src/utils/stockData.js';
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';
import { getOptimizedSignalManager } from './src/utils/optimizedSignalManager.js';

console.log('=== 全面检查买卖提示信号系统 ===');

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testCompleteSignalSystem() {
  try {
    console.log('\n1. 数据源连接和数据获取检查...');
    
    const dataSource = getStockDataSource();
    const marketMonitor = getMarketMonitor();
    const signalManager = getOptimizedSignalManager();
    
    // 测试股票代码
    const testCodes = ['600519', '000001', '002594'];
    
    // 检查数据源健康状态
    const healthStatus = dataSource.getHealthStatus();
    console.log('数据源健康状态:', healthStatus);
    
    // 测试实时行情数据获取
    console.log('\n测试实时行情数据获取...');
    const quotes = await dataSource.getRealtimeQuote(testCodes);
    console.log(`获取到 ${quotes.length} 条实时行情数据`);
    
    if (quotes.length > 0) {
      console.log('示例行情数据:', quotes[0]);
    } else {
      console.error('❌ 无法获取实时行情数据');
      return;
    }
    
    // 测试技术指标计算
    console.log('\n测试技术指标计算...');
    for (const code of testCodes) {
      try {
        const technicalData = await dataSource.getTechnicalIndicators(code);
        console.log(`${code} 的技术指标:`, {
          rsi: technicalData.rsi,
          macd: technicalData.macd,
          kdj: technicalData.kdj,
          ma: technicalData.ma
        });
      } catch (error) {
        console.error(`${code} 技术指标计算失败:`, error.message);
      }
    }
    
    // 测试主力资金数据获取
    console.log('\n测试主力资金数据获取...');
    const mainForceData = await dataSource.getMainForceData(testCodes);
    console.log(`获取到 ${mainForceData.length} 条主力资金数据`);
    
    if (mainForceData.length > 0) {
      console.log('示例主力资金数据:', mainForceData[0]);
    } else {
      console.error('❌ 无法获取主力资金数据');
    }
    
    // 测试K线数据获取
    console.log('\n测试K线数据获取...');
    for (const code of testCodes) {
      try {
        const klineData = await dataSource.getKLineData(code, 'day', 30);
        console.log(`${code} 获取到 ${klineData.length} 条K线数据`);
      } catch (error) {
        console.error(`${code} K线数据获取失败:`, error.message);
      }
    }
    
    // 测试AI综合分析
    console.log('\n2. AI综合分析检查...');
    
    // 测试预测价格计算
    for (const quote of quotes) {
      try {
        const prediction = await dataSource.predictPrice(quote.code);
        console.log(`${quote.name} 的价格预测:`, {
          predictedPrice: prediction.predictedPrice,
          targetPrice: prediction.targetPrice,
          stopLossPrice: prediction.stopLossPrice,
          expectedIncrease: prediction.expectedIncrease
        });
      } catch (error) {
        console.error(`${quote.name} 价格预测失败:`, error.message);
      }
    }
    
    // 测试信号生成逻辑
    console.log('\n3. 信号生成逻辑检查...');
    
    // 获取综合数据进行信号生成测试
    for (const quote of quotes) {
      try {
        // 获取技术指标
        const technicalData = await dataSource.getTechnicalIndicators(quote.code);
        
        // 获取主力资金数据
        const mainForce = mainForceData.find(d => d.stockCode === quote.code);
        
        if (mainForce) {
          // 生成综合数据
          const comprehensiveData = {
            ...quote,
            ...technicalData,
            ...mainForce
          };
          
          // 测试买入信号生成
          const buySignal = signalManager.generateBuySignal(comprehensiveData);
          console.log(`${quote.name} 的买入信号:`, buySignal);
          
          // 测试卖出信号生成
          const sellSignal = signalManager.generateSellSignal(comprehensiveData);
          console.log(`${quote.name} 的卖出信号:`, sellSignal);
        }
      } catch (error) {
        console.error(`${quote.name} 信号生成失败:`, error.message);
      }
    }
    
    // 测试市场监控管理器
    console.log('\n4. 市场监控管理器检查...');
    
    // 执行一次扫描
    console.log('执行市场扫描...');
    await marketMonitor.performScan();
    
    // 获取扫描结果
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
    
    // 获取生成的信号
    const signalHistory = marketMonitor.getSignalHistory();
    console.log(`生成的信号数量: ${signalHistory.length}`);
    
    if (signalHistory.length > 0) {
      console.log('生成的信号:', signalHistory);
    } else {
      console.error('❌ 没有生成任何信号');
    }
    
    console.log('\n=== 系统检查完成 ===');
    
  } catch (error) {
    console.error('系统检查过程中发生错误:', error);
  }
}

testCompleteSignalSystem();
