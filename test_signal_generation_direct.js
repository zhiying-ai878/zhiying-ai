// 直接测试信号生成逻辑
import { getOptimizedSignalManager } from './src/utils/optimizedSignalManager.js';

console.log('=== 直接测试信号生成逻辑 ===');

// 模拟localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

async function testSignalGeneration() {
  try {
    console.log('1. 初始化信号管理器...');
    const signalManager = getOptimizedSignalManager();
    
    console.log('✓ 信号管理器初始化成功');
    
    // 创建模拟的股票数据（正确的嵌套结构）
    const mockStockData = {
      code: '600519',
      name: '贵州茅台',
      currentPrice: 1780.00,
      changePercent: 2.5,
      volume: 12345678,
      amount: 22000000000,
      
      // 技术指标（嵌套结构）
      technicalData: {
        rsi: 65,
        macd: { macd: 15.5, diff: 20, dea: 12 },
        kdj: { k: 70, d: 65, j: 80 },
        ma: { ma5: 1750, ma10: 1730, ma20: 1700, ma30: 1680, ma60: 1650 },
        boll: { upper: 1820, middle: 1780, lower: 1740 },
        volume: { ma5: 10000000, ma10: 8000000, ma20: 6000000 }
      },
      
      // 主力资金数据（嵌套结构）
      mainForceData: {
        mainForceNetFlow: 50000000,
        superLargeOrder: { netFlow: 30000000 },
        largeOrder: { netFlow: 20000000 },
        mediumOrder: { netFlow: 5000000 },
        smallOrder: { netFlow: -10000000 },
        totalNetFlow: 45000000,
        volumeAmplification: 1.8,
        turnoverRate: 2.5
      },
      
      // 价格预测数据
      predictedPrice: 1820.00,
      targetPrice: 1900.00,
      stopLossPrice: 1700.00,
      expectedIncrease: 0.022
    };
    
    console.log('\n2. 测试买入信号生成...');
    const buySignal = signalManager.generateSignal(mockStockData, 'buy');
    console.log(`买入信号: ${buySignal ? '✓ 生成买入信号' : '✗ 未生成买入信号'}`);
    
    if (buySignal) {
      console.log('买入信号详情:', buySignal);
    }
    
    console.log('\n3. 测试卖出信号生成...');
    const sellSignal = signalManager.generateSignal(mockStockData, 'sell');
    console.log(`卖出信号: ${sellSignal ? '✓ 生成卖出信号' : '✗ 未生成卖出信号'}`);
    
    if (sellSignal) {
      console.log('卖出信号详情:', sellSignal);
    }
    
    // 测试另一个股票数据
    console.log('\n4. 测试下跌股票的信号生成...');
    const mockStockData2 = {
      ...mockStockData,
      code: '601318',
      name: '中国平安',
      currentPrice: 45.20,
      changePercent: -3.2,
      mainForceData: {
        ...mockStockData.mainForceData,
        mainForceNetFlow: -20000000,
        superLargeOrder: { netFlow: -15000000 },
        largeOrder: { netFlow: -5000000 },
        totalNetFlow: -25000000
      },
      technicalData: {
        ...mockStockData.technicalData,
        rsi: 30,
        macd: { macd: -8.5, diff: -10, dea: -5 }
      },
      expectedIncrease: -0.015
    };
    
    const buySignal2 = signalManager.generateSignal(mockStockData2, 'buy');
    const sellSignal2 = signalManager.generateSignal(mockStockData2, 'sell');
    
    console.log(`下跌股票买入信号: ${buySignal2 ? '✓' : '✗'}`);
    console.log(`下跌股票卖出信号: ${sellSignal2 ? '✓' : '✗'}`);
    
    console.log('\n=== 信号生成测试完成 ===');
    
  } catch (error) {
    console.error('信号生成测试过程中发生错误:', error);
  }
}

testSignalGeneration();
