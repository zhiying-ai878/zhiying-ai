import { getStockDataSource } from './stockData';
import { getOptimizedSignalManager } from './optimizedSignalManager';

interface Stock {
  code: string;
  name: string;
  industry?: string;
  market?: string;
  type?: string;
}

interface MarketMonitorConfig {
  enabled?: boolean;
  scanInterval?: number;
  batchSize?: number;
  maxConcurrent?: number;
  priorityStocks?: string[];
  stockList?: Stock[];
  lastScanTime?: Date | null;
  isScanning?: boolean;
  scanHistory?: ScanHistoryItem[];
}

interface ScanHistoryItem {
  timestamp: Date;
  marketStatus: string;
  processed: number;
  queueLength: number;
}

interface MarketStatus {
  enabled: boolean;
  marketStatus: string;
  stockCount: number;
  lastScanTime: Date | null;
  isScanning: boolean;
  activeScans: number;
  scanHistory: ScanHistoryItem[];
  priorityStocks: string[];
}

interface MarketEvent {
  type: string;
  data: any;
}

class MarketMonitor {
  private config: MarketMonitorConfig;
  private stockDataSource: any;
  private signalManager: any;
  private scanQueue: Stock[];
  private activeScans: Set<string>;
  private scanTimer: NodeJS.Timeout | null;
  private listeners: ((event: MarketEvent) => void)[];
  private marketStatus: string;

  constructor(config: MarketMonitorConfig = {}) {
    this.config = {
      enabled: true,
      scanInterval: 3000, // 优化扫描间隔为3秒
      batchSize: 50, // 减小批次大小以提高实时性
      maxConcurrent: 10, // 增加并发处理能力
      priorityStocks: [],
      stockList: [],
      lastScanTime: null,
      isScanning: false,
      scanHistory: [],
      ...config
    };
    this.stockDataSource = getStockDataSource();
    this.signalManager = getOptimizedSignalManager();
    this.scanQueue = [];
    this.activeScans = new Set();
    this.scanTimer = null;
    this.listeners = [];
    this.marketStatus = 'closed';
  }

  // 初始化A股股票列表
  async initializeStockList(): Promise<void> {
    try {
      // console.log('开始初始化A股股票列表...');
      
      const stockList = await this.stockDataSource.getStockList();
      
      if (stockList && stockList.length > 0) {
        this.config.stockList = stockList;
        // console.log(`成功获取${stockList.length}只A股股票`);
        this.notifyListeners({
          type: 'stockListInitialized',
          data: {
            count: stockList.length,
            stocks: stockList.slice(0, 10)
          }
        });
      } else {
        console.warn('获取A股股票列表失败');
        this.config.stockList = [];
      }
    } catch (error) {
      console.error('初始化A股股票列表失败:', error);
      this.config.stockList = [];
    }
  }

  // 生成模拟股票列表方法已删除

  // 检查市场状态
  checkMarketStatus(): string {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    if ((hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute <= 30) || 
        (hour === 13) || (hour === 14) || (hour === 15 && minute === 0)) {
      this.marketStatus = 'open';
    } else if (hour === 9 && minute >= 15 && minute <= 25) {
      this.marketStatus = 'auction';
    } else {
      this.marketStatus = 'closed';
    }
    
    return this.marketStatus;
  }

  // 开始全市场监控
  startMonitoring(): void {
    if (!this.config.enabled) {
      // console.warn('市场监控已禁用');
      return;
    }
    
    // console.log('启动全A股市场监控...');
    
    this.initializeStockList();
    this.startScanTimer();
    
    this.notifyListeners({
      type: 'monitoringStarted',
      data: {
        timestamp: new Date(),
        marketStatus: this.checkMarketStatus()
      }
    });
  }

  // 停止市场监控
  stopMonitoring(): void {
    // console.log('停止全A股市场监控...');
    
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }
    
    this.scanQueue.length = 0;
    this.activeScans.clear();
    
    this.notifyListeners({
      type: 'monitoringStopped',
      data: {
        timestamp: new Date()
      }
    });
  }

  // 启动扫描定时器
  private startScanTimer(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
    }
    
    this.scanTimer = setInterval(() => {
      this.performScan();
    }, this.config.scanInterval);
    
    // console.log(`市场扫描定时器已启动，扫描间隔：${this.config.scanInterval}ms`);
  }

  // 执行市场扫描
  public async performScan(): Promise<void> {
    if ((this.config.isScanning || false)) {
      return;
    }
    
    // 如果股票列表为空，尝试初始化
    if ((this.config.stockList?.length || 0) === 0) {
      await this.initializeStockList();
      if ((this.config.stockList?.length || 0) === 0) {
        return;
      }
    }
    
    const marketStatus = this.checkMarketStatus();
    if (marketStatus === 'closed') {
      return;
    }
    
    try {
        this.config.isScanning = true;
        this.config.lastScanTime = new Date();
        
        // console.log(`开始市场扫描，市场状态：${marketStatus}`);
        
        this.buildScanQueue();
        await this.processScanQueue();
        
        if (!this.config.scanHistory) {
          this.config.scanHistory = [];
        }
        
        this.config.scanHistory.unshift({
          timestamp: new Date(),
          marketStatus,
          processed: this.activeScans.size,
          queueLength: this.scanQueue.length
        });
        
        if (this.config.scanHistory.length > 100) {
          this.config.scanHistory = this.config.scanHistory.slice(0, 100);
        }
        
        // console.log(`市场扫描完成，处理了${this.activeScans.size}只股票`);
        
        this.notifyListeners({
          type: 'scanCompleted',
          data: {
            timestamp: new Date(),
            marketStatus,
            processed: this.activeScans.size,
            queueLength: this.scanQueue.length
          }
        });
        
      } catch (error) {
        console.error('市场扫描失败:', error);
        this.notifyListeners({
          type: 'scanFailed',
          data: {
            error: error instanceof Error ? error.message : String(error)
          }
        });
      } finally {
        this.config.isScanning = false;
        this.activeScans.clear();
      }
  }

  // 构建扫描队列
  private buildScanQueue(): void {
    this.scanQueue.length = 0;
    
    if (!this.config.stockList || this.config.stockList.length === 0) {
      return;
    }
    
    const priorityStocks = (this.config.priorityStocks || []).map(code => 
      this.config.stockList!.find(stock => stock.code === code)
    ).filter((stock): stock is Stock => stock !== undefined);
    
    const remainingStocks = this.config.stockList.filter(stock => 
      !(this.config.priorityStocks || []).includes(stock.code)
    );
    
    for (let i = remainingStocks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remainingStocks[i], remainingStocks[j]] = [remainingStocks[j], remainingStocks[i]];
    }
    
    this.scanQueue = [...priorityStocks, ...remainingStocks];
  }

  // 处理扫描队列
  private async processScanQueue(): Promise<void> {
    const batches: Stock[][] = [];
    
    for (let i = 0; i < this.scanQueue.length; i += this.config.batchSize!) {
      const batch = this.scanQueue.slice(i, i + this.config.batchSize!);
      batches.push(batch);
    }
    
    for (const batch of batches) {
      await this.processBatch(batch);
    }
  }

  // 处理股票批次
  private async processBatch(stocks: Stock[]): Promise<void> {
    if (stocks.length === 0) return;
    
    const codes = stocks.map(stock => stock.code);
    
    try {
      const quotes = await this.stockDataSource.getRealtimeQuote(codes);
      
      if (!quotes || quotes.length === 0) {
        // console.warn(`获取批次股票行情失败，代码：${codes.join(', ')}`);
        return;
      }
      
      for (const quote of quotes) {
        if (this.activeScans.size >= (this.config.maxConcurrent || 5)) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.activeScans.add(quote.code);
        await this.processSingleStock(quote);
        this.activeScans.delete(quote.code);
      }
      
    } catch (error) {
      console.error('处理股票批次失败:', error);
    }
  }

  // 处理单只股票
  private async processSingleStock(stockData: any): Promise<void> {
    try {
      // 获取真实的主力资金数据
      const mainForceData = await this.stockDataSource.getMainForceData([stockData.code]);
      
      let analysisData;
      
      if (mainForceData && mainForceData.length > 0) {
        // 使用真实的主力资金数据
        const forceData = mainForceData[0];
        analysisData = {
          stockCode: stockData.code,
          stockName: stockData.name,
          currentPrice: stockData.price,
          change: stockData.change,
          changePercent: stockData.changePercent,
          volume: stockData.volume,
          amount: stockData.amount,
          timestamp: Date.now(),
          
          mainForceNetFlow: forceData.mainForceNetFlow,
          totalNetFlow: forceData.totalNetFlow,
          volumeAmplification: forceData.volumeAmplification || 1,
          turnoverRate: forceData.turnoverRate || 0,
          
          superLargeOrder: {
            netFlow: forceData.superLargeOrder?.netFlow || 0
          },
          largeOrder: {
            netFlow: forceData.largeOrder?.netFlow || 0
          },
          mediumOrder: {
            netFlow: forceData.mediumOrder?.netFlow || 0
          },
          smallOrder: {
            netFlow: forceData.smallOrder?.netFlow || 0
          }
        };
      } else {
        // 没有获取到主力资金数据，不使用模拟数据
        console.warn(`未获取到${stockData.code}的主力资金数据`);
        return;
      }
      
      await this.signalManager.processMainForceData(analysisData);
      
    } catch (error) {
      console.error(`处理股票${stockData.code}失败:`, error);
    }
  }

  // 模拟数据生成方法已删除

  // 获取监控状态
  getStatus(): MarketStatus {
    return {
      enabled: this.config.enabled || false,
      marketStatus: this.checkMarketStatus(),
      stockCount: this.config.stockList?.length || 0,
      lastScanTime: this.config.lastScanTime || null,
      isScanning: this.config.isScanning || false,
      activeScans: this.activeScans.size,
      scanHistory: (this.config.scanHistory || []).slice(0, 10),
      priorityStocks: this.config.priorityStocks || []
    };
  }

  // 添加优先监控的股票
  addPriorityStock(code: string): void {
    if (!this.config.priorityStocks) {
      this.config.priorityStocks = [];
    }
    if (!this.config.priorityStocks.includes(code)) {
      this.config.priorityStocks.push(code);
      console.log(`添加优先监控股票：${code}`);
    }
  }

  // 移除优先监控的股票
  removePriorityStock(code: string): void {
    if (this.config.priorityStocks) {
      this.config.priorityStocks = this.config.priorityStocks.filter(c => c !== code);
      console.log(`移除优先监控股票：${code}`);
    }
  }

  // 添加监听器
  addListener(listener: (event: MarketEvent) => void): void {
    this.listeners.push(listener);
  }

  // 移除监听器
  removeListener(listener: (event: MarketEvent) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // 通知监听器
  private notifyListeners(event: MarketEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('通知监听器失败:', error);
      }
    });
  }
}

let marketMonitor: MarketMonitor | null = null;

export const getMarketMonitor = (config?: MarketMonitorConfig): MarketMonitor => {
  if (!marketMonitor) {
    marketMonitor = new MarketMonitor(config);
  }
  return marketMonitor;
};

export const startMarketMonitoring = (): void => {
  getMarketMonitor().startMonitoring();
};

export const stopMarketMonitoring = (): void => {
  getMarketMonitor().stopMonitoring();
};

export const getMarketStatus = (): MarketStatus => {
  return getMarketMonitor().getStatus();
};

export const addPriorityStock = (code: string): void => {
  getMarketMonitor().addPriorityStock(code);
};

export const removePriorityStock = (code: string): void => {
  getMarketMonitor().removePriorityStock(code);
};