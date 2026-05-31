import { superDataSourceManager } from './src/utils/superDataSourceManager';
import { superSignalGenerator } from './src/utils/superSignalGenerator';

console.log('='.repeat(60));
console.log('数据源和信号生成优化测试');
console.log('='.repeat(60));
console.log('');

const testStocks = ['600519', '000001', '002594', '601318'];

async function testDataSource() {
  console.log('1. 测试数据源连接...');
  console.log('测试股票:', testStocks);
  console.log('');
  
  const startTime = Date.now();
  
  try {
    const quotes = await superDataSourceManager.getRealtimeQuote(testStocks);
    const duration = Date.now() - startTime;
    
    console.log('✓ 数据获取成功! 耗时:', duration + 'ms');
    console.log('');
    console.log('获取到的股票数据:');
    console.log('─'.repeat(60));
    
    quotes.forEach(quote => {
      console.log(`代码: ${quote.code}`);
      console.log(`名称: ${quote.name}`);
      console.log(`价格: ${quote.price}`);
      console.log(`涨跌幅: ${quote.changePercent.toFixed(2)}%`);
      console.log(`成交量: ${quote.volume}`);
      console.log('─'.repeat(60));
    });
    
    return quotes;
  } catch (error) {
    console.error('✗ 数据获取失败:', error);
    return [];
  }
}

async function testSignalGeneration(quotes: any[]) {
  console.log('');
  console.log('2. 测试信号生成...');
  console.log('');
  
  if (quotes.length === 0) {
    console.log('跳过信号生成测试（无数据）');
    return;
  }
  
  const startTime = Date.now();
  
  try {
    const signals = await superSignalGenerator.generateSignals(testStocks);
    const duration = Date.now() - startTime;
    
    console.log('✓ 信号生成完成! 耗时:', duration + 'ms');
    console.log('');
    
    if (signals.length > 0) {
      console.log('生成的信号:');
      console.log('─'.repeat(60));
      
      signals.forEach(signal => {
        const typeIcon = signal.type.includes('buy') ? '📈' : '📉';
        console.log(`${typeIcon} ${signal.stockCode} - ${signal.stockName}`);
        console.log(`类型: ${signal.type}`);
        console.log(`价格: ${signal.price}`);
        console.log(`置信度: ${signal.confidence.toFixed(2)}`);
        console.log(`理由: ${signal.reason}`);
        if (signal.limitUpProbability !== undefined) {
          console.log(`涨停概率: ${(signal.limitUpProbability * 100).toFixed(2)}%`);
        }
        console.log('─'.repeat(60));
      });
    } else {
      console.log('当前没有符合条件的信号');
    }
  } catch (error) {
    console.error('✗ 信号生成失败:', error);
  }
}

async function testDataSourceHealth() {
  console.log('');
  console.log('3. 数据源健康状态...');
  console.log('');
  
  try {
    const healthStatus = superDataSourceManager.getDataSourceStatus();
    console.log('数据源健康状态:');
    console.log('─'.repeat(60));
    
    healthStatus.forEach((status, source) => {
      const statusIcon = status.status === 'healthy' ? '🟢' : 
                        status.status === 'degraded' ? '🟡' : '🔴';
      console.log(`${statusIcon} ${source}`);
      console.log(`状态: ${status.status}`);
      console.log(`成功率: ${(status.successRate * 100).toFixed(2)}%`);
      console.log(`响应时间: ${status.responseTime}ms`);
      console.log(`连续失败: ${status.consecutiveFailures}次`);
      console.log('─'.repeat(60));
    });
  } catch (error) {
    console.error('获取数据源健康状态失败:', error);
  }
}

async function runTests() {
  console.log('开始测试...');
  console.log('');
  
  // 测试数据源
  const quotes = await testDataSource();
  
  // 测试信号生成
  await testSignalGeneration(quotes);
  
  // 测试数据源健康状态
  await testDataSourceHealth();
  
  console.log('');
  console.log('='.repeat(60));
  console.log('测试完成!');
  console.log('='.repeat(60));
}

// 运行测试
runTests().catch(console.error);
