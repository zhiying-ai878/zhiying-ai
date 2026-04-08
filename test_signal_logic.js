
// 直接测试信号生成逻辑
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';
import { getOptimizedSignalManager } from './src/utils/optimizedSignalManager.js';

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testSignalLogic() {
  console.log('=== 测试信号生成逻辑 ===');
  
  try {
    // 创建明确上涨的股票数据
    const mockStock = {
      code: '600000',
      name: '浦发银行',
      price: 10.5,
      changePercent: 5.5, // 明确上涨5.5%
      volume: 1000000,
      open: 10.0,
      high: 10.6,
      low: 9.9,
      close: 10.0
    };
    
    console.log('测试股票数据:', mockStock);
    
    // 获取市场监控器和信号管理器
    const marketMonitor = getMarketMonitor();
    const signalManager = getOptimizedSignalManager();
    
    // 查看当前信号历史
    const initialHistory = signalManager.getSignalHistory();
    console.log('初始信号历史数量:', initialHistory.length);
    
    // 测试买入信号生成逻辑
    console.log('\n测试买入信号生成...');
    
    // 直接调用generateBuySignal方法
    const buySignal = marketMonitor.generateBuySignal({
      stockCode: mockStock.code,
      stockName: mockStock.name,
      mainForceData: {
        volumeAmplification: 1.5,
        turnoverRate: 2.0,
        mainForceNetFlow: 100000,
        mainForceType: 'institution',
        flowStrength: 'strong',
        continuousFlowPeriods: 2,
        industryRank: 20,
        conceptRank: 30,
        volume: mockStock.volume
      },
      technicalData: {
        rsi: 65,
        macd: { diff: 0.5, dea: 0.3, macd: 0.4 },
        kdj: { k: 70, d: 60, j: 80 },
        ma: { ma5: 10.3, ma10: 10.1, ma20: 9.9, ma30: 9.7 },
        boll: { upper: 10.8, middle: 10.5, lower: 10.2 },
        volume: { ma5: 900000, ma10: 850000, ma20: 800000 },
        sar: 10.2,
        cci: 120,
        adx: 25,
        williamsR: -30,
        bias: 5
      },
      currentPrice: mockStock.price,
      changePercent: mockStock.changePercent
    }, 85);
    
    console.log('生成的买入信号:', buySignal);
    
    if (buySignal) {
      console.log('✅ 成功生成买入信号！');
      // 添加信号到管理器
      signalManager.addSignal(buySignal);
      const newHistory = signalManager.getSignalHistory();
      console.log('添加信号后历史数量:', newHistory.length);
    } else {
      console.log('❌ 未生成买入信号');
    }
    
    // 测试卖出信号生成
    const mockStock2 = {
      code: '600001',
      name: '邯郸钢铁',
      price: 5.2,
      changePercent: -3.8, // 明确下跌3.8%
      volume: 500000,
      open: 5.4,
      high: 5.4,
      low: 5.1,
      close: 5.4
    };
    
    console.log('\n测试卖出信号生成...');
    console.log('测试下跌股票:', mockStock2);
    
    const sellSignal = marketMonitor.generateSellSignal({
      stockCode: mockStock2.code,
      stockName: mockStock2.name,
      mainForceData: {
        volumeAmplification: 1.2,
        turnoverRate: 1.5,
        mainForceNetFlow: -200000,
        mainForceType: 'institution',
        flowStrength: 'strong',
        continuousFlowPeriods: 3,
        industryRank: 80,
        conceptRank: 70,
        volume: mockStock2.volume
      },
      technicalData: {
        rsi: 30,
        macd: { diff: -0.3, dea: -0.1, macd: -0.4 },
        kdj: { k: 25, d: 35, j: 15 },
        ma: { ma5: 5.4, ma10: 5.6, ma20: 5.8, ma30: 6.0 },
        boll: { upper: 5.5, middle: 5.2, lower: 4.9 },
        volume: { ma5: 600000, ma10: 650000, ma20: 700000 },
        sar: 5.5,
        cci: -150,
        adx: 30,
        williamsR: -75,
        bias: -8
      },
      currentPrice: mockStock2.price,
      changePercent: mockStock2.changePercent
    });
    
    console.log('生成的卖出信号:', sellSignal);
    
    if (sellSignal) {
      console.log('✅ 成功生成卖出信号！');
      signalManager.addSignal(sellSignal);
      const finalHistory = signalManager.getSignalHistory();
      console.log('最终信号历史数量:', finalHistory.length);
    } else {
      console.log('❌ 未生成卖出信号');
    }
    
  } catch (error) {
    console.error('测试错误:', error);
  }
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
testSignalLogic();
