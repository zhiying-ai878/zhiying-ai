
// 模拟实际运行环境的信号测试
import { getStockDataSource } from './src/utils/stockData.js';
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';
import { getOptimizedSignalManager } from './src/utils/optimizedSignalManager.js';

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testRealSignalGeneration() {
  console.log('=== 模拟实际运行环境的信号测试 ===');
  
  try {
    // 获取组件实例
    const stockDataSource = getStockDataSource();
    const marketMonitor = getMarketMonitor();
    const signalManager = getOptimizedSignalManager();
    
    // 清空信号历史
    signalManager.clearSignalHistory();
    
    // 1. 测试股票列表获取
    console.log('\n1. 测试股票列表获取...');
    const stockList = await stockDataSource.getStockList();
    console.log(`获取到 ${stockList.length} 只股票`);
    
    if (stockList.length === 0) {
      console.error('❌ 股票列表获取失败');
      return;
    }
    
    // 2. 测试实时行情数据获取（使用真实数据）
    console.log('\n2. 测试实时行情数据获取...');
    const testStocks = stockList.slice(0, 10); // 测试前10只股票
    console.log(`测试股票代码: ${testStocks.map(s => s.code).join(', ')}`);
    
    const quotes = await stockDataSource.getRealtimeQuote(testStocks.map(s => s.code));
    console.log(`获取到 ${quotes.length} 条行情数据`);
    
    if (quotes.length === 0) {
      console.error('❌ 行情数据获取失败');
      return;
    }
    
    console.log('行情数据示例:', quotes[0]);
    
    // 检查行情数据的changePercent字段
    const stocksWithChange = quotes.filter(q => q.changePercent !== undefined && q.changePercent !== null);
    console.log(`有涨幅数据的股票: ${stocksWithChange.length} 只`);
    
    const risingStocks = quotes.filter(q => q.changePercent > 0);
    const fallingStocks = quotes.filter(q => q.changePercent< 0);
    console.log(`上涨股票: ${risingStocks.length} 只, 下跌股票: ${fallingStocks.length} 只`);
    
    if (risingStocks.length >0) {
      console.log('上涨股票示例:', risingStocks[0]);
    }
    
    // 3. 测试主力资金数据获取
    console.log('\n3. 测试主力资金数据获取...');
    const mainForceData = await stockDataSource.getMainForceData(testStocks.map(s => s.code));
    console.log(`获取到 ${mainForceData.length} 条主力资金数据`);
    
    // 4. 测试技术指标获取
    console.log('\n4. 测试技术指标获取...');
    const technicalData = await stockDataSource.getTechnicalIndicators(testStocks[0].code);
    console.log('技术指标数据:', technicalData);
    
    // 5. 测试市场监控器扫描
    console.log('\n5. 测试市场监控器扫描...');
    
    // 启动监控
    marketMonitor.startMonitoring();
    
    // 获取状态
    const status = await marketMonitor.getStatus();
    console.log('市场监控状态:', status);
    
    // 执行一次扫描
    console.log('执行扫描...');
    await marketMonitor.performScan();
    
    // 检查信号
    const signals = signalManager.getSignalHistory();
    console.log(`扫描后信号数量: ${signals.length}`);
    
    if (signals.length > 0) {
      console.log('✅ 成功生成信号！');
      console.log('生成的信号:', signals);
    } else {
      console.log('❌ 未生成信号');
      
      // 分析原因
      console.log('\n分析未生成信号的原因:');
      
      if (quotes.length === 0) {
        console.log('• 行情数据获取失败');
      } else if (stocksWithChange.length === 0) {
        console.log('• 行情数据中没有涨幅数据');
      } else if (risingStocks.length === 0 && fallingStocks.length === 0) {
        console.log('• 没有上涨或下跌的股票');
      } else {
        console.log('• 信号生成条件可能太严格');
        
        // 手动测试信号生成
        console.log('\n手动测试信号生成...');
        if (risingStocks.length > 0) {
          const risingStock = risingStocks[0];
          console.log(`测试上涨股票: ${risingStock.name}(${risingStock.code})，涨幅: ${risingStock.changePercent}%`);
          
          const buySignal = marketMonitor.generateBuySignal({
            stockCode: risingStock.code,
            stockName: risingStock.name,
            mainForceData: {
              volumeAmplification: 1.5,
              turnoverRate: 2.0,
              mainForceNetFlow: 50000,
              mainForceType: 'institution',
              flowStrength: 'strong',
              continuousFlowPeriods: 1,
              industryRank: 30,
              conceptRank: 40,
              volume: risingStock.volume
            },
            technicalData: {
              rsi: 60,
              macd: { diff: 0.2, dea: 0.1, macd: 0.2 },
              kdj: { k: 65, d: 55, j: 75 },
              ma: { ma5: risingStock.price * 0.99, ma10: risingStock.price * 0.98, ma20: risingStock.price * 0.97, ma30: risingStock.price * 0.96 },
              boll: { upper: risingStock.price * 1.02, middle: risingStock.price, lower: risingStock.price * 0.98 },
              volume: { ma5: risingStock.volume * 0.9, ma10: risingStock.volume * 0.85, ma20: risingStock.volume * 0.8 },
              sar: risingStock.price * 0.99,
              cci: 100,
              adx: 25,
              williamsR: -40,
              bias: 3
            },
            currentPrice: risingStock.price,
            changePercent: risingStock.changePercent
          }, 70);
          
          if (buySignal) {
            console.log('✅ 手动测试成功生成买入信号:', buySignal);
          } else {
            console.log('❌ 手动测试也未生成信号');
          }
        }
      }
    }
    
  } catch (error) {
    console.error('测试错误:', error);
  }
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
testRealSignalGeneration();
