import { superDataSourceManager } from './superDataSourceManager';
import { superSignalGenerator } from './superSignalGenerator';

// 实时优化管理器
export class RealtimeOptimizer {
  private batchSize = 50; // 批量处理大小
  private maxParallelRequests = 5; // 最大并行请求数
  private signalGenerationInterval = 1000; // 信号生成间隔（毫秒）
  private dataRefreshInterval = 500; // 数据刷新间隔（毫秒）
  private cacheExpiry = 2000; // 缓存过期时间（毫秒）
  private stockBatches: string[][] = [];
  private isProcessing = false;
  private signalGenerationTimer: NodeJS.Timeout | null = null;
  private dataRefreshTimer: NodeJS.Timeout | null = null;
  private processedStocks: Set<string> = new Set();

  constructor() {
    // 初始化实时优化管理器
  }

  // 启动实时优化
  start() {
    // 开始数据刷新
    this.startDataRefresh();
    
    // 开始信号生成
    this.startSignalGeneration();
  }

  // 停止实时优化
  stop() {
    if (this.signalGenerationTimer) {
      clearInterval(this.signalGenerationTimer);
      this.signalGenerationTimer = null;
    }
    
    if (this.dataRefreshTimer) {
      clearInterval(this.dataRefreshTimer);
      this.dataRefreshTimer = null;
    }
  }

  // 开始数据刷新
  private startDataRefresh() {
    this.dataRefreshTimer = setInterval(() => {
      this.refreshData();
    }, this.dataRefreshInterval);
  }

  // 开始信号生成
  private startSignalGeneration() {
    this.signalGenerationTimer = setInterval(() => {
      this.generateSignals();
    }, this.signalGenerationInterval);
  }

  // 设置股票列表
  setStockList(stocks: string[]) {
    // 分批处理股票
    this.stockBatches = [];
    for (let i = 0; i < stocks.length; i += this.batchSize) {
      this.stockBatches.push(stocks.slice(i, i + this.batchSize));
    }
  }

  // 刷新数据
  private async refreshData() {
    if (this.isProcessing || this.stockBatches.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // 并行处理多个批次
      const batchesToProcess = this.stockBatches.slice(0, this.maxParallelRequests);
      const promises = batchesToProcess.map(batch => {
        return superDataSourceManager.getRealtimeQuote(batch);
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('刷新数据失败:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // 生成信号
  private async generateSignals() {
    if (this.isProcessing || this.stockBatches.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // 选择未处理的股票批次
      const batch = this.stockBatches.shift();
      if (!batch) {
        // 所有批次处理完成，重新开始
        this.stockBatches = this.stockBatches.concat(this.stockBatches);
        this.isProcessing = false;
        return;
      }

      // 生成信号
      const signals = await superSignalGenerator.generateSignals(batch);
      
      // 标记股票为已处理
      batch.forEach(stock => this.processedStocks.add(stock));
    } catch (error) {
      console.error('生成信号失败:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // 优化批量处理
  optimizeBatchProcessing(batchSize: number, maxParallelRequests: number) {
    this.batchSize = batchSize;
    this.maxParallelRequests = maxParallelRequests;
  }

  // 优化时间间隔
  optimizeIntervals(signalGenerationInterval: number, dataRefreshInterval: number) {
    this.signalGenerationInterval = signalGenerationInterval;
    this.dataRefreshInterval = dataRefreshInterval;
    
    // 重新启动定时器
    this.stop();
    this.start();
  }

  // 优化缓存
  optimizeCache(cacheExpiry: number) {
    this.cacheExpiry = cacheExpiry;
  }

  // 获取处理状态
  getProcessingStatus() {
    return {
      isProcessing: this.isProcessing,
      totalBatches: this.stockBatches.length,
      processedStocks: this.processedStocks.size,
      batchSize: this.batchSize,
      maxParallelRequests: this.maxParallelRequests,
      signalGenerationInterval: this.signalGenerationInterval,
      dataRefreshInterval: this.dataRefreshInterval
    };
  }

  // 清除处理状态
  clearProcessingStatus() {
    this.processedStocks.clear();
  }

  // 紧急处理特定股票
  async processStockImmediately(stockCode: string) {
    try {
      // 立即获取数据
      const quotes = await superDataSourceManager.getRealtimeQuote([stockCode]);
      
      // 立即生成信号
      if (quotes.length > 0) {
        const signals = await superSignalGenerator.generateSignals([stockCode]);
        return signals;
      }
    } catch (error) {
      console.error(`紧急处理${stockCode}失败:`, error);
    }
    return [];
  }

  // 批量紧急处理股票
  async processStocksImmediately(stockCodes: string[]) {
    try {
      // 分批处理
      const signals = [];
      for (let i = 0; i < stockCodes.length; i += this.batchSize) {
        const batch = stockCodes.slice(i, i + this.batchSize);
        const batchSignals = await superSignalGenerator.generateSignals(batch);
        signals.push(...batchSignals);
      }
      return signals;
    } catch (error) {
      console.error('批量紧急处理失败:', error);
      return [];
    }
  }
}

// 导出单例
export const realtimeOptimizer = new RealtimeOptimizer();
export const getRealtimeOptimizer = () => realtimeOptimizer;