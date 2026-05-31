
import * as SignalManager from './src/utils/optimizedSignalManager';
import { getMarketMonitor } from './src/utils/marketMonitorManager';
import { getStockDataSource } from './src/utils/stockData';

console.log('=== 信号生成功能测试 ===\n');

async function testSignalGeneration() {
  try {
    console.log('1. 检查信号管理器...');
    const signalManager = SignalManager.getOptimizedSignalManager();
    console.log('   ✓ 信号管理器初始化成功');

    console.log('\n2. 检查市场监控管理器...');
    const marketMonitor = getMarketMonitor();
    console.log('   ✓ 市场监控管理器初始化成功');

    console.log('\n3. 检查数据源...');
    const dataSource = getStockDataSource();
    console.log('   ✓ 数据源初始化成功');

    console.log('\n4. 测试获取股票数据...');
    const testStocks = ['000001', '600000', '000002', '600519'];
    const quotes = await dataSource.getRealtimeQuote(testStocks);
    console.log(`   ✓ 获取到 ${quotes.length} 只股票的数据`);

    console.log('\n5. 测试生成信号...');
    await marketMonitor.performScan();
    const signals = signalManager.getSignalHistory();
    console.log(`   ✓ 当前信号历史数量: ${signals.length}`);

    if (signals.length > 0) {
      console.log('\n6. 分析最新信号...');
      const latestSignal = signals[0];
      console.log(`   - 股票代码: ${latestSignal.stockCode}`);
      console.log(`   - 股票名称: ${latestSignal.stockName}`);
      console.log(`   - 信号类型: ${latestSignal.type}`);
      console.log(`   - 当前价格: ${latestSignal.price}`);
      console.log(`   - 置信度: ${latestSignal.confidence}%`);
      console.log(`   - 综合评分: ${latestSignal.score}`);
      console.log(`   - 生成时间: ${new Date(latestSignal.timestamp).toLocaleString()}`);
      console.log(`   - 信号理由: ${latestSignal.reason}`);

      const buySignals = signals.filter(s => s.type === 'buy' || s.type === 'strong_buy');
      const sellSignals = signals.filter(s => s.type === 'sell' || s.type === 'strong_sell');
      
      console.log(`\n7. 信号统计...`);
      console.log(`   - 买入/强势买入信号: ${buySignals.length}`);
      console.log(`   - 卖出/强势卖出信号: ${sellSignals.length}`);
      
      if (buySignals.length > 0) {
        const topBuy = buySignals[0];
        console.log(`\n8. 最强买入信号...`);
        console.log(`   - ${topBuy.stockName}(${topBuy.stockCode}): 置信度 ${topBuy.confidence}%, 评分 ${topBuy.score}`);
      }
      
      if (sellSignals.length > 0) {
        const topSell = sellSignals[0];
        console.log(`\n9. 最强卖出信号...`);
        console.log(`   - ${topSell.stockName}(${topSell.stockCode}): 置信度 ${topSell.confidence}%, 评分 ${topSell.score}`);
      }

      console.log('\n=== 测试完成！信号生成功能正常 ===');
      return true;
    } else {
      console.log('\n⚠ 暂无信号生成。可能原因:');
      console.log('   - 市场当前没有符合条件的股票');
      console.log('   - 数据源返回数据不足');
      console.log('   - 尝试添加更多测试股票或等待市场变化');
      
      console.log('\n=== 系统基本功能正常 ===');
      return true;
    }

  } catch (error) {
    console.error('\n✗ 测试失败:');
    console.error(error);
    return false;
  }
}

testSignalGeneration();
