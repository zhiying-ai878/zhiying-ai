// 测试优化后的系统
import { enhancedDataSourceManager } from './src/utils/enhancedDataSourceManager.js';
import { enhancedSignalManager } from './src/utils/enhancedSignalManager.js';
import { stockNameManager } from './src/utils/stockNameManager.js';
import { dataSourceMonitor } from './src/utils/dataSourceMonitor.js';

// 测试股票列表
const testStocks = [
  'sh600519', // 贵州茅台
  'sz000858', // 五粮液
  'sz300750', // 宁德时代
  'sz300900', // 广联航空
  'sz301178', // 天亿马
  'sz300857', // 协创数据
  'sz300583', // 赛托生物
  'sz300466', // 赛摩智能
  'sz301195'  // 北路智控
];

// 测试函数
async function testSystem() {
  console.log('=== 开始测试优化后的系统 ===\n');

  // 1. 测试数据源连接
  console.log('1. 测试数据源连接...');
  try {
    const quotes = await enhancedDataSourceManager.getRealtimeQuote(testStocks);
    console.log(`成功获取 ${quotes.length} 个股票的实时数据`);
    console.log('数据源连接测试通过！\n');
  } catch (error) {
    console.error('数据源连接测试失败:', error);
    return;
  }

  // 2. 测试股票名称获取
  console.log('2. 测试股票名称获取...');
  try {
    const stockNames = await stockNameManager.getStockNames(testStocks);
    console.log('股票名称获取结果:');
    Object.entries(stockNames).forEach(([code, name]) => {
      console.log(`  ${code}: ${name}`);
    });
    console.log('股票名称获取测试通过！\n');
  } catch (error) {
    console.error('股票名称获取测试失败:', error);
  }

  // 3. 测试信号生成
  console.log('3. 测试信号生成...');
  try {
    const signals = await enhancedSignalManager.generateSignals(testStocks);
    console.log(`生成了 ${signals.length} 个信号`);
    
    if (signals.length > 0) {
      console.log('信号详情:');
      signals.forEach(signal => {
        console.log(`  ${signal.type.toUpperCase()}: ${signal.stockName} (${signal.stockCode}) - 置信度: ${signal.confidence.toFixed(2)}%`);
        console.log(`    价格: ${signal.price.toFixed(2)}`);
        console.log(`    原因: ${signal.reason}`);
        if (signal.chipPeakAnalysis) {
          console.log(`    筹码集中度: ${signal.chipPeakAnalysis.chipConcentration.toFixed(2)}%`);
        }
        console.log('');
      });
    }
    console.log('信号生成测试通过！\n');
  } catch (error) {
    console.error('信号生成测试失败:', error);
  }

  // 4. 测试数据源监控
  console.log('4. 测试数据源监控...');
  try {
    const statuses = dataSourceMonitor.getDataSourceStatus();
    console.log('数据源状态:');
    statuses.forEach(status => {
      console.log(`  ${status.source}: ${status.status} - 成功率: ${(status.successRate * 100).toFixed(2)}% - 响应时间: ${status.responseTime}ms`);
    });
    
    const summary = dataSourceMonitor.getMonitoringSummary();
    console.log('监控摘要:');
    console.log(`  总数据源数: ${summary.totalSources}`);
    console.log(`  健康数据源: ${summary.healthyCount}`);
    console.log(`  降级数据源: ${summary.degradedCount}`);
    console.log(`  不健康数据源: ${summary.unhealthyCount}`);
    console.log(`  平均成功率: ${(summary.averageSuccessRate * 100).toFixed(2)}%`);
    console.log(`  平均响应时间: ${summary.averageResponseTime.toFixed(2)}ms`);
    console.log('数据源监控测试通过！\n');
  } catch (error) {
    console.error('数据源监控测试失败:', error);
  }

  console.log('=== 测试完成 ===');
}

// 运行测试
testSystem().catch(error => {
  console.error('测试过程中出现错误:', error);
});