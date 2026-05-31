
// 直接测试信号生成功能
import { getOptimizedSignalManager } from './src/utils/optimizedSignalManager';
import { getStockDataSource } from './src/utils/stockData';

console.log('=== 直接测试信号生成 ===');

// 模拟localStorage
global.localStorage = {
  getItem: (key: string): string | null => null,
  setItem: (key: string, value: string): void => {},
  removeItem: (key: string): void => {},
  clear: (): void => {}
} as Storage;

async function testDirectSignalGeneration() {
  try {
    console.log('1. 初始化信号管理器...');
    const signalManager = getOptimizedSignalManager();
    
    console.log('2. 获取股票数据...');
    const dataSource = getStockDataSource();
    
    // 获取一些热门股票数据
    const stockCodes = ['000001', '600519', '601318', '002594', '600036'];
    console.log(`获取股票数据: ${stockCodes.join(', ')}`);
    
    // 模拟一些股票数据来生成信号
    const mockStocks = stockCodes.map(code => ({
      stockCode: code,
      stockName: `测试股票${code}`,
      currentPrice: 10 + Math.random() * 50,
      changePercent: (Math.random() - 0.5) * 10,
      volume: 1000000 + Math.random() * 9000000,
      technicalData: {
        rsi: 40 + Math.random() * 40,
        macd: { diff: (Math.random() - 0.5) * 2, dea: (Math.random() - 0.5) * 2, macd: 0 },
        kdj: { k: 40 + Math.random() * 40, d: 40 + Math.random() * 40, j: 40 + Math.random() * 40 },
        ma: { ma5: 10 + Math.random() * 50, ma10: 10 + Math.random() * 50, ma20: 10 + Math.random() * 50, ma30: 10 + Math.random() * 50 },
        boll: { upper: 10 + Math.random() * 50, middle: 10 + Math.random() * 50, lower: 10 + Math.random() * 50 },
        volume: { ma5: 1000000 + Math.random() * 9000000, ma10: 1000000 + Math.random() * 9000000, ma20: 1000000 + Math.random() * 9000000 }
      },
      mainForceData: {
        mainForceNetFlow: (Math.random() - 0.5) * 1000000,
        volumeAmplification: 1 + Math.random() * 3,
        turnoverRate: Math.random() * 10,
        mainForceRatio: Math.random(),
        industryRank: Math.floor(Math.random() * 100),
        conceptRank: Math.floor(Math.random() * 100)
      }
    }));
    
    console.log('3. 创建测试信号...');
    let generatedSignals = 0;
    
    for (const stock of mockStocks) {
      // 创建测试信号对象
      const signal = {
        id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        stockCode: stock.stockCode,
        stockName: stock.stockName,
        type: Math.random() > 0.5 ? 'buy' : 'sell' as 'buy' | 'sell',
        score: Math.random() * 100,
        confidence: Math.random() * 100,
        reason: '测试信号',
        timestamp: Date.now(),
        isRead: false
      };
      
      console.log(`   ${signal.type.toUpperCase()} - ${signal.stockName}(${signal.stockCode}) - 置信度: ${signal.confidence}%`);
      signalManager.addSignal(signal);
      generatedSignals++;
    }
    
    console.log(`4. 生成的信号总数: ${generatedSignals}`);
    
    // 获取所有信号
    const allSignals = signalManager.getSignalHistory();
    console.log(`5. 信号管理器中的信号总数: ${allSignals.length}`);
    
    if (allSignals.length > 0) {
      console.log('生成的信号列表:');
      allSignals.forEach((signal, index) => {
        console.log(`   ${index + 1}. ${signal.type.toUpperCase()} - ${signal.stockName}(${signal.stockCode}) - 置信度: ${signal.confidence}%`);
      });
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testDirectSignalGeneration();

