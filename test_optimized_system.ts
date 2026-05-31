import { superDataSourceManager } from './src/utils/superDataSourceManager.ts';
import { superSignalGenerator } from './src/utils/superSignalGenerator.ts';
import { realtimeOptimizer } from './src/utils/realtimeOptimizer.ts';
import { systemMonitor } from './src/utils/systemMonitor.ts';
import { stockNameManager } from './src/utils/stockNameManager.ts';
import { advancedTechnicalAnalyzer } from './src/utils/advancedTechnicalAnalyzer.ts';

// 测试股票列表
const testStocks = [
  'sh600519', // 贵州茅台
  'sz000858', // 五粮液
  'sz300750', // 宁德时代
  'sz300900', // 广联航空
  'sz301408', // 某大涨股票
  'sz301178', // 天亿马
  'sz300857', // 协创数据
  'sz300583', // 赛托生物
  'sz300466', // 赛摩智能
  'sz301195'  // 北路智控
];

// 性能测试结果
interface PerformanceTestResult {
  testName: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  details?: any;
}

// 综合测试
class SystemTest {
  private testResults: PerformanceTestResult[] = [];

  // 运行所有测试
  async runAllTests() {
    console.log('=== 开始测试优化后的系统 ===\n');

    // 测试数据源连接
    await this.testDataSourceConnection();

    // 测试股票名称获取
    await this.testStockNameRetrieval();

    // 测试信号生成
    await this.testSignalGeneration();

    // 测试实时优化
    await this.testRealtimeOptimization();

    // 测试技术指标分析
    await this.testTechnicalAnalysis();

    // 测试系统监控
    await this.testSystemMonitoring();

    // 测试信号去重
    await this.testSignalDeduplication();

    // 输出测试结果
    this.printTestResults();

    // 输出系统状态
    this.printSystemStatus();

    console.log('=== 测试完成 ===');
  }

  // 测试数据源连接
  private async testDataSourceConnection() {
    const testName = '数据源连接测试';
    const startTime = Date.now();

    try {
      const quotes = await superDataSourceManager.getRealtimeQuote(testStocks);
      const endTime = Date.now();

      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: true,
        details: {
          stocksTested: testStocks.length,
          quotesReceived: quotes.length,
          successRate: (quotes.length / testStocks.length) * 100
        }
      });

      console.log(`✅ ${testName}: 成功获取 ${quotes.length}/${testStocks.length} 个股票数据`);
    } catch (error) {
      const endTime = Date.now();
      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.error(`❌ ${testName}: 失败 - ${error}`);
    }
  }

  // 测试股票名称获取
  private async testStockNameRetrieval() {
    const testName = '股票名称获取测试';
    const startTime = Date.now();

    try {
      const stockNames = await stockNameManager.getStockNames(testStocks);
      const endTime = Date.now();

      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: true,
        details: {
          stocksTested: testStocks.length,
          namesRetrieved: Object.keys(stockNames).length
        }
      });

      console.log(`✅ ${testName}: 成功获取 ${Object.keys(stockNames).length}/${testStocks.length} 个股票名称`);
    } catch (error) {
      const endTime = Date.now();
      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.error(`❌ ${testName}: 失败 - ${error}`);
    }
  }

  // 测试信号生成
  private async testSignalGeneration() {
    const testName = '信号生成测试';
    const startTime = Date.now();

    try {
      const signals = await superSignalGenerator.generateSignals(testStocks);
      const endTime = Date.now();

      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: true,
        details: {
          stocksTested: testStocks.length,
          signalsGenerated: signals.length,
          strongBuySignals: signals.filter(s => s.type === 'strong_buy').length,
          buySignals: signals.filter(s => s.type === 'buy').length,
          sellSignals: signals.filter(s => s.type === 'sell').length,
          strongSellSignals: signals.filter(s => s.type === 'strong_sell').length
        }
      });

      console.log(`✅ ${testName}: 生成了 ${signals.length} 个信号`);
      if (signals.length > 0) {
        signals.forEach(signal => {
          console.log(`  ${signal.type.toUpperCase()}: ${signal.stockName} (${signal.stockCode}) - 置信度: ${signal.confidence.toFixed(2)}%`);
        });
      }
    } catch (error) {
      const endTime = Date.now();
      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.error(`❌ ${testName}: 失败 - ${error}`);
    }
  }

  // 测试实时优化
  private async testRealtimeOptimization() {
    const testName = '实时优化测试';
    const startTime = Date.now();

    try {
      realtimeOptimizer.setStockList(testStocks);
      realtimeOptimizer.optimizeBatchProcessing(20, 3);
      realtimeOptimizer.optimizeIntervals(1000, 500);
      
      // 启动实时优化
      realtimeOptimizer.start();
      
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const processingStatus = realtimeOptimizer.getProcessingStatus();
      const endTime = Date.now();

      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: true,
        details: processingStatus
      });

      console.log(`✅ ${testName}: 实时优化运行正常`);
      console.log(`  处理状态: ${processingStatus.isProcessing ? '运行中' : '已停止'}`);
      console.log(`  批处理大小: ${processingStatus.batchSize}`);
      console.log(`  最大并行请求: ${processingStatus.maxParallelRequests}`);
    } catch (error) {
      const endTime = Date.now();
      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.error(`❌ ${testName}: 失败 - ${error}`);
    } finally {
      // 停止实时优化
      realtimeOptimizer.stop();
    }
  }

  // 测试技术指标分析
  private async testTechnicalAnalysis() {
    const testName = '技术指标分析测试';
    const startTime = Date.now();

    try {
      // 获取股票数据
      const quotes = await superDataSourceManager.getRealtimeQuote(testStocks.slice(0, 3));
      
      // 分析技术指标
      const analysisResults = [];
      for (const quote of quotes) {
        const analysis = await advancedTechnicalAnalyzer.analyze(quote);
        analysisResults.push(analysis);
      }
      
      const endTime = Date.now();

      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: true,
        details: {
          stocksAnalyzed: analysisResults.length,
          averageScore: analysisResults.reduce((sum, result) => sum + result.overall.score, 0) / analysisResults.length
        }
      });

      console.log(`✅ ${testName}: 成功分析 ${analysisResults.length} 个股票的技术指标`);
    } catch (error) {
      const endTime = Date.now();
      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.error(`❌ ${testName}: 失败 - ${error}`);
    }
  }

  // 测试系统监控
  private async testSystemMonitoring() {
    const testName = '系统监控测试';
    const startTime = Date.now();

    try {
      const systemStatus = systemMonitor.getSystemStatus();
      const systemSummary = systemMonitor.getSystemSummary();
      const endTime = Date.now();

      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: true,
        details: systemSummary
      });

      console.log(`✅ ${testName}: 系统监控运行正常`);
      console.log(`  系统状态: ${systemSummary.overall}`);
      console.log(`  数据源状态: ${systemSummary.dataSourceHealth}`);
      console.log(`  信号数量: ${systemSummary.signalCount}`);
      console.log(`  活跃告警: ${systemSummary.activeAlerts}`);
    } catch (error) {
      const endTime = Date.now();
      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.error(`❌ ${testName}: 失败 - ${error}`);
    }
  }

  // 测试信号去重
  private async testSignalDeduplication() {
    const testName = '信号去重测试';
    const startTime = Date.now();

    try {
      // 连续生成两次信号
      const signals1 = await superSignalGenerator.generateSignals(testStocks);
      const signals2 = await superSignalGenerator.generateSignals(testStocks);
      
      // 检查是否有重复信号
      const stockCodes1 = signals1.map(s => s.stockCode);
      const stockCodes2 = signals2.map(s => s.stockCode);
      const duplicateCodes = stockCodes1.filter(code => stockCodes2.includes(code));
      
      const endTime = Date.now();

      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: duplicateCodes.length === 0,
        details: {
          firstSignalCount: signals1.length,
          secondSignalCount: signals2.length,
          duplicateCount: duplicateCodes.length,
          duplicateCodes
        }
      });

      if (duplicateCodes.length === 0) {
        console.log(`✅ ${testName}: 信号去重正常，无重复信号`);
      } else {
        console.log(`⚠️ ${testName}: 发现 ${duplicateCodes.length} 个重复信号`);
      }
    } catch (error) {
      const endTime = Date.now();
      this.testResults.push({
        testName,
        startTime,
        endTime,
        duration: endTime - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
      console.error(`❌ ${testName}: 失败 - ${error}`);
    }
  }

  // 输出测试结果
  private printTestResults() {
    console.log('\n=== 测试结果汇总 ===');
    
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(result => result.success).length;
    const failedTests = totalTests - successfulTests;
    
    console.log(`总测试数: ${totalTests}`);
    console.log(`成功: ${successfulTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`成功率: ${((successfulTests / totalTests) * 100).toFixed(2)}%`);
    
    console.log('\n详细结果:');
    this.testResults.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.testName}: ${result.duration}ms`);
      if (!result.success) {
        console.log(`  错误: ${result.error}`);
      }
    });
  }

  // 输出系统状态
  private printSystemStatus() {
    console.log('\n=== 系统状态 ===');
    const summary = systemMonitor.getSystemSummary();
    
    console.log(`系统状态: ${summary.overall}`);
    console.log(`数据源状态: ${summary.dataSourceHealth}`);
    console.log(`信号数量: ${summary.signalCount}`);
    console.log(`活跃告警: ${summary.activeAlerts}`);
    console.log(`响应时间: ${summary.responseTime.toFixed(2)}ms`);
    console.log(`内存使用: ${summary.memoryUsage.toFixed(2)}MB`);
    console.log(`最后更新: ${new Date(summary.lastUpdated).toLocaleString()}`);
  }
}

// 运行测试
const test = new SystemTest();
test.runAllTests().catch(error => {
  console.error('测试过程中出现错误:', error);
});