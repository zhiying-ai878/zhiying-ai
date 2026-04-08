// 直接测试信号生成逻辑
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';

console.log('=== 直接测试信号生成逻辑 ===');

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testSignalGenerationLogic() {
  try {
    const marketMonitor = getMarketMonitor();
    
    console.log('\n1. 测试买入信号生成...');
    
    // 模拟上涨股票数据
    const buyData = {
      stockCode: '600519',
      stockName: '贵州茅台',
      mainForceData: {
        volumeAmplification: 2.5,
        turnoverRate: 3.0,
        mainForceNetFlow: 100000,
        mainForceType: 'institution',
        flowStrength: 'strong',
        continuousFlowPeriods: 2,
        industryRank: 10,
        conceptRank: 15,
        volume: 1000000
      },
      technicalData: {
        rsi: 65,
        macd: { diff: 0.5, dea: 0.2, macd: 0.6 },
        kdj: { k: 70, d: 60, j: 80 },
        ma: { ma5: 1800, ma10: 1750, ma20: 1700, ma30: 1650 },
        boll: { upper: 1850, middle: 1800, lower: 1750 },
        volume: { ma5: 900000, ma10: 800000, ma20: 700000 },
        sar: 1780,
        cci: 120,
        adx: 30,
        williamsR: -30,
        bias: 5
      },
      currentPrice: 1800,
      changePercent: 3.5
    };
    
    const buySignal = marketMonitor.generateBuySignal(buyData, 85);
    console.log('买入信号:', buySignal);
    
    if (buySignal) {
      console.log('✅ 成功生成买入信号！');
    } else {
      console.log('❌ 未生成买入信号');
    }
    
    console.log('\n2. 测试卖出信号生成...');
    
    // 模拟下跌股票数据
    const sellData = {
      stockCode: '000001',
      stockName: '平安银行',
      mainForceData: {
        volumeAmplification: 1.5,
        turnoverRate: 2.0,
        mainForceNetFlow: -80000,
        mainForceType: 'institution',
        flowStrength: 'weak',
        continuousFlowPeriods: 1,
        industryRank: 40,
        conceptRank: 45,
        volume: 500000
      },
      technicalData: {
        rsi: 35,
        macd: { diff: -0.3, dea: -0.1, macd: -0.4 },
        kdj: { k: 30, d: 40, j: 20 },
        ma: { ma5: 15, ma10: 16, ma20: 17, ma30: 18 },
        boll: { upper: 16, middle: 15, lower: 14 },
        volume: { ma5: 600000, ma10: 700000, ma20: 800000 },
        sar: 15.5,
        cci: -100,
        adx: 25,
        williamsR: -70,
        bias: -3
      },
      currentPrice: 14.5,
      changePercent: -2.5
    };
    
    const sellSignal = marketMonitor.generateSellSignal(sellData);
    console.log('卖出信号:', sellSignal);
    
    if (sellSignal) {
      console.log('✅ 成功生成卖出信号！');
    } else {
      console.log('❌ 未生成卖出信号');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testSignalGenerationLogic();
