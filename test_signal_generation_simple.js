// 简单测试信号生成系统
import { getStockDataSource } from './src/utils/stockData.js';
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';
import { getOptimizedSignalManager } from './src/utils/optimizedSignalManager.js';

console.log('=== 简单测试信号生成系统 ===');

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testSignalGeneration() {
  try {
    const stockDataSource = getStockDataSource();
    const marketMonitor = getMarketMonitor();
    const signalManager = getOptimizedSignalManager();
    
    console.log('\n1. 测试股票列表获取...');
    const stockList = await stockDataSource.getStockList();
    console.log(`获取到 ${stockList.length} 只股票`);
    
    if (stockList.length === 0) {
      console.error('❌ 股票列表获取失败');
      return;
    }
    
    // 测试前5只股票
    const testStocks = stockList.slice(0, 5);
    console.log(`测试股票: ${testStocks.map(s => s.code).join(', ')}`);
    
    console.log('\n2. 测试行情数据获取...');
    const quotes = await stockDataSource.getRealtimeQuote(testStocks.map(s => s.code));
    console.log(`获取到 ${quotes.length} 条行情数据`);
    
    if (quotes.length === 0) {
      console.error('❌ 行情数据获取失败');
      return;
    }
    
    console.log('行情数据示例:', quotes[0]);
    
    console.log('\n3. 测试主力资金数据获取...');
    const mainForceData = await stockDataSource.getMainForceData(testStocks.map(s => s.code));
    console.log(`获取到 ${mainForceData.length} 条主力资金数据`);
    
    console.log('\n4. 测试技术指标获取...');
    const technicalData = await stockDataSource.getTechnicalIndicators(testStocks[0].code);
    console.log('技术指标数据:', technicalData);
    
    console.log('\n5. 测试信号生成...');
    
    // 手动生成信号
    for (const quote of quotes) {
      console.log(`\n处理股票: ${quote.name}(${quote.code})`);
      
      // 查找对应的主力资金数据
      const mainForce = mainForceData.find(m => m.stockCode === quote.code);
      
      if (!mainForce) {
        console.log('⚠️  未找到主力资金数据，使用默认值');
      }
      
      const buySignal = marketMonitor.generateBuySignal({
        stockCode: quote.code,
        stockName: quote.name,
        mainForceData: mainForce || {
          volumeAmplification: 1.5,
          turnoverRate: 2.0,
          mainForceNetFlow: 10000,
          mainForceType: 'institution',
          flowStrength: 'strong',
          continuousFlowPeriods: 1,
          industryRank: 30,
          conceptRank: 40,
          volume: quote.volume
        },
        technicalData: technicalData,
        currentPrice: quote.price,
        changePercent: quote.changePercent
      }, 70);
      
      if (buySignal) {
        console.log('✅ 生成买入信号:', buySignal);
      } else {
        console.log('❌ 未生成买入信号');
      }
      
      const sellSignal = marketMonitor.generateSellSignal({
        stockCode: quote.code,
        stockName: quote.name,
        mainForceData: mainForce || {
          volumeAmplification: 1.5,
          turnoverRate: 2.0,
          mainForceNetFlow: -10000,
          mainForceType: 'institution',
          flowStrength: 'weak',
          continuousFlowPeriods: 1,
          industryRank: 30,
          conceptRank: 40,
          volume: quote.volume
        },
        technicalData: technicalData,
        currentPrice: quote.price,
        changePercent: quote.changePercent
      });
      
      if (sellSignal) {
        console.log('✅ 生成卖出信号:', sellSignal);
      } else {
        console.log('❌ 未生成卖出信号');
      }
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testSignalGeneration();
