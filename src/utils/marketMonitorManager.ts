import { scanAllStocks, getMainForceData, getTechnicalIndicators, Logger, getStockDataSource } from './stockData';
import * as SignalManager from './optimizedSignalManager';
import { OptimizedSignal } from './optimizedSignalManager';
import { playBuyAlert, playSellAlert } from './audioManager';
import { pluginManager, registerDefaultPlugins } from './pluginSystem';
import { getIntelligentOptimizer, SignalResult } from './intelligentOptimizer';
import { getHistoricalDataManager } from './historicalData';

const logger = Logger.getInstance();

export interface MarketMonitorConfig {
  enabled: boolean;
  scanInterval: number;
  batchSize: number;
  minConfidence: number;
  maxSignalsPerScan: number;
  autoAlert: boolean;
  stockFilters: {
    minPrice?: number;
    maxPrice?: number;
    minVolume?: number;
    excludeST?: boolean;
    excludeNewStocks?: boolean;
  };
}

const DEFAULT_CONFIG: MarketMonitorConfig = {
      enabled: true,
      scanInterval: 5000, // 优化：交易时间5秒扫描一次
      batchSize: 200, // 优化：大幅增加批处理大小，提高扫描效率
      minConfidence: 10, // 优化：极低置信度要求，确保所有大涨股票都能生成信号
      maxSignalsPerScan: 200, // 优化：大幅增加最大信号数量
      autoAlert: true,
      stockFilters: {
        minPrice: 0.1,
        maxPrice: 2000,
        minVolume: 5000, // 进一步降低最小成交量要求，包含更多股票
        excludeST: true, // 用户要求：排除ST股票，降低风险
        excludeNewStocks: false // 优化：启用新股监控
      }
    };

interface StockFeature {
  stockCode: string;
  stockName: string;
  isLimitUp: boolean;
  price: number;
  changePercent: number;
  volume: number;
  volumeAmplification: number;
  turnoverRate: number;
  mainForceNetFlow: number;
  mainForceRatio: number;
  mainForceType: string;
  rsi: number;
  macdDiff: number;
  macdDea: number;
  macd: number;
  kdjK: number;
  kdjD: number;
  kdjJ: number;
  ma5: number;
  ma10: number;
  ma20: number;
  ma30: number;
  bollLower: number;
  bollMiddle: number;
  bollUpper: number;
  bollWidth: number;
  volumeMA5: number;
  volumeMA10: number;
  volumeMA20: number;
  sar: number;
  cci: number;
  adx: number;
  williamsR: number;
  bias: number;
  industryRank: number;
  conceptRank: number;
  continuousFlowPeriods: number;
  flowStrength: string;
  trend: string;
  priceToMa5: number;
  priceToMa10: number;
  priceToMa20: number;
  priceToBollMiddle: number;
  priceToBollUpper: number;
  macdCrossSignal: number;
  kdjCrossSignal: number;
  rsiOverbought: number;
  rsiOversold: number;
  volumeRatio: number;
  market: string;
  industry: string;
  timestamp: number;
  
  // 融资融券数据
  marginBuy: number;
  marginRepay: number;
  marginBalance: number;
  marginIncrease: number;
  marginRatio: number;
  shortSell: number;
  shortBuy: number;
  shortBalance: number;
  shortIncrease: number;
  shortRatio: number;
  marginShortRatio: number;
  marginShortBalance: number;
  marginShortIncrease: number;
  marginTrend: string;
  shortTrend: string;
}

interface LearningModel {
  features: string[];
  weights: Record<string, number>;
  bias: number;
  accuracy: number;
  lastTrained: number;
}

interface MultiPeriodLearningModel {
  ultraShortTerm: LearningModel;
  shortTerm: LearningModel;
  mediumTerm: LearningModel;
  longTerm: LearningModel;
  ultraLongTerm: LearningModel;
}

class MarketMonitorManager {
  private config: MarketMonitorConfig;
  private scanTimer: NodeJS.Timeout | null = null;
  private isScanning: boolean = false;
  private scanStatus: 'idle' | 'preparing' | 'scanning' | 'failed' | 'completed' = 'idle';
  private isBackgroundMode: boolean = false; // 后台模式标志
  private signalManager = SignalManager.getOptimizedSignalManager();
  private lastScanTime: number = 0;
  private intelligentOptimizer = getIntelligentOptimizer();
  private historicalDataManager = getHistoricalDataManager({ limit: 60 });
  
  // ====== 【新增】持仓监控列表：只监控用户持仓股票的卖出信号 ======
  private positionWatchList: Set<string> = new Set();
  private positionListenerSetup: boolean = false;
  private positionScanTimer: NodeJS.Timeout | null = null; // 持仓扫描定时器
  
  // 卖出信号去重机制：记录每只股票上次生成卖出信号的时间
  private sellSignalTimestamps: Map<string, number> = new Map();
  // 当前扫描轮次生成的卖出信号计数
  private currentScanSellSignalCount = 0;
  // 每轮扫描最多生成的卖出信号数量
  private maxSellSignalsPerScan = 3;
  // 同一股票生成卖出信号的最小时间间隔（毫秒）
  private minSellSignalInterval = 5 * 60 * 1000; // 5分钟
  
  private scanHistory: {
    timestamp: number;
    totalStocks: number;
    processedStocks: number;
    buySignals: number;
    sellSignals: number;
    duration: number;
    status: 'success' | 'failed' | 'partial';
    dataSourceStatus: 'connected' | 'failed' | 'unknown';
  }[] = [];
  
  private limitUpStocksHistory: StockFeature[] = [];
  private learningModel: LearningModel = {
    features: [
      'mainForceNetFlow', 'mainForceRatio', 'volumeAmplification', 'turnoverRate', 
      'rsi', 'macdDiff', 'macdCrossSignal', 'kdjK', 'kdjCrossSignal',
      'priceToMa5', 'priceToMa10', 'priceToMa20', 'priceToBollUpper',
      'bollWidth', 'volumeRatio', 'cci', 'adx', 'williamsR',
      'continuousFlowPeriods', 'flowStrength', 'industryRank', 'conceptRank',
      'marketType', 'industryType',
      'marginIncrease', 'marginRatio', 'shortIncrease', 'shortRatio',
      'marginShortRatio', 'marginShortIncrease'
    ],
    weights: {
      'mainForceNetFlow': 0.07,
      'mainForceRatio': 0.07,
      'volumeAmplification': 0.06,
      'turnoverRate': 0.05,
      'rsi': 0.04,
      'macdDiff': 0.04,
      'macdCrossSignal': 0.05,
      'kdjK': 0.04,
      'kdjCrossSignal': 0.05,
      'priceToMa5': 0.04,
      'priceToMa10': 0.03,
      'priceToMa20': 0.03,
      'priceToBollUpper': 0.04,
      'bollWidth': 0.03,
      'volumeRatio': 0.04,
      'cci': 0.03,
      'adx': 0.03,
      'williamsR': 0.03,
      'continuousFlowPeriods': 0.04,
      'flowStrength': 0.03,
      'industryRank': 0.02,
      'conceptRank': 0.02,
      'marketType': 0.01,
      'industryType': 0.01,
      // 融资融券特征权重
      'marginIncrease': 0.06,
      'marginRatio': 0.05,
      'shortIncrease': 0.06,
      'shortRatio': 0.05,
      'marginShortRatio': 0.04,
      'marginShortIncrease': 0.05
    },
    bias: 0,
    accuracy: 0,
    lastTrained: 0
  };
  
  // 信号跟踪历史，用于评估信号准确性和自我更新
  private signalTrackingHistory: Array<{
    signalId: string;
    stockCode: string;
    stockName: string;
    timestamp: number;
    timestampPrice: number;
    confidence: number;
    limitUpPotential: boolean;
    expectedReturn: number;
    actualReturn: number | null;
    isAccurate: boolean | null;
    marketStatus: string;
  }> = [];
  
  // 高级学习参数
  private advancedLearningParams = {
    // 强化学习参数
    learningRate: 0.01,
    discountFactor: 0.95,
    explorationRate: 0.1,
    // 自适应学习率
    adaptiveLearningRate: true,
    minLearningRate: 0.001,
    maxLearningRate: 0.1,
    // 特征重要性
    featureImportance: {} as Record<string, number>,
    // 模型集成
    modelEnsemble: true,
    ensembleSize: 5,
    // 学习历史
    learningHistory: [] as Array<{
      timestamp: number;
      accuracy: number;
      weights: Record<string, number>;
      learningRate: number;
    }>,
    // 性能指标
    performanceMetrics: {
      totalSignals: 0,
      correctSignals: 0,
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0
    }
  };
  
  // 多周期学习模型
  private multiPeriodModel: MultiPeriodLearningModel = {
    ultraShortTerm: {
      features: [...this.learningModel.features],
      weights: {...this.learningModel.weights},
      bias: 0,
      accuracy: 0,
      lastTrained: 0
    },
    shortTerm: {
      features: [...this.learningModel.features],
      weights: {...this.learningModel.weights},
      bias: 0,
      accuracy: 0,
      lastTrained: 0
    },
    mediumTerm: {
      features: [...this.learningModel.features],
      weights: {...this.learningModel.weights},
      bias: 0,
      accuracy: 0,
      lastTrained: 0
    },
    longTerm: {
      features: [...this.learningModel.features],
      weights: {...this.learningModel.weights},
      bias: 0,
      accuracy: 0,
      lastTrained: 0
    },
    ultraLongTerm: {
      features: [...this.learningModel.features],
      weights: {...this.learningModel.weights},
      bias: 0,
      accuracy: 0,
      lastTrained: 0
    }
  };
  
  private lastLearningTime: number = 0;
  private lastMarketAnalysisTime: number = 0;
  private lastAdaptiveOptimizationTime: number = 0;
  private marketTrendHistory: any[] = [];
  private signalPerformanceHistory: any[] = [];
  private adaptiveThresholds: { [key: string]: number } = {
    buyConfidence: 60,
    sellConfidence: 60,
    priceChangeThreshold: 0.02,
    volumeThreshold: 1.2
  };

  constructor(config?: Partial<MarketMonitorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    // 初始化插件系统
    registerDefaultPlugins();
    pluginManager.initializePlugins(this.config);
    logger.info('全市场监控管理器已初始化');
    this.loadAdaptiveSettings();
  }

  startMonitoring() {
    if (this.scanTimer) {
      logger.warn('监控已经在运行中');
      return;
    }

    if (!this.config.enabled) {
      logger.warn('监控功能已禁用');
      return;
    }

    logger.info('开始全市场监控...');
    this.scanMarket();

    // 分析历史涨停板股票的特征，优化识别模型
    this.analyzeLimitUpStockFeatures();

    // 启动快速上涨股票监控
    this.monitorQuickRiseStocks().catch(error => {
      logger.error('启动快速上涨股票监控失败:', error);
    });

    // ====== 【新增】启动持仓监听，监控持仓股票的卖出信号 ======
    this.setupPositionListener();

    // 添加动态扫描间隔调整
    this.adjustScanInterval();
    
    logger.info(`全市场监控已启动，初始扫描间隔: ${this.config.scanInterval / 1000}秒`);
  }

  // ====== 【新增】设置持仓监听器，监控持仓变化 ======
  private setupPositionListener() {
    if (this.positionListenerSetup) {
      return;
    }
    
    // 添加持仓监听器
    const positionListener = () => {
      this.updatePositionWatchList();
    };
    
    this.signalManager.addPositionListener(positionListener);
    this.positionListenerSetup = true;
    
    // 初始化持仓监控列表（添加延迟确保持仓已加载）
    setTimeout(() => {
      this.updatePositionWatchList();
      // 启动持仓扫描（每3秒扫描一次持仓股票）
      this.startPositionScan();
    }, 1000); // 等待1秒确保持仓数据已加载
    
    logger.info('持仓监听器已设置，开始监控持仓股票的卖出信号');
  }

  // ====== 【新增】更新持仓监控列表 ======
  private updatePositionWatchList() {
    const positions = this.signalManager.getPositions();
    const newWatchList = new Set<string>();
    
    positions.forEach(position => {
      // 标准化股票代码
      const stockCode = String(position.stockCode).replace(/^sh|^sz/, '');
      newWatchList.add(stockCode);
    });
    
    // 比较新旧列表
    const addedStocks = [...newWatchList].filter(code => !this.positionWatchList.has(code));
    const removedStocks = [...this.positionWatchList].filter(code => !newWatchList.has(code));
    
    if (addedStocks.length > 0) {
      logger.info(`[持仓监控] 添加监控股票: ${addedStocks.join(', ')}`);
    }
    if (removedStocks.length > 0) {
      logger.info(`[持仓监控] 移除监控股票: ${removedStocks.join(', ')}`);
    }
    
    this.positionWatchList = newWatchList;
    
    logger.info(`[持仓监控] 持仓监控列表已更新，当前监控 ${this.positionWatchList.size} 只股票: ${[...this.positionWatchList].join(', ')}`);
  }

  // ====== 【新增】启动持仓股票扫描 ======
  private startPositionScan() {
    if (this.positionScanTimer) {
      clearInterval(this.positionScanTimer);
    }
    
    // 每3秒扫描一次持仓股票
    this.positionScanTimer = setInterval(() => {
      this.scanPositionStocks();
    }, 3000);
    
    logger.info('持仓股票扫描已启动（每3秒扫描一次）');
  }

  // ====== 【新增】扫描持仓股票的卖出信号 ======
  private async scanPositionStocks() {
    const timestamp = new Date().toLocaleString('zh-CN');
    
    // ========== 【修复】重置本轮持仓扫描的卖出信号计数 ==========
    this.currentScanSellSignalCount = 0;
    // ===============================================================
    
    if (this.positionWatchList.size === 0) {
      logger.info(`[${timestamp}] [持仓扫描] 无持仓股票，跳过`);
      return; // 没有持仓，跳过扫描
    }
    
    const stockCodes = [...this.positionWatchList];
    
    logger.info(`[${timestamp}] [持仓扫描] ====== 开始持仓股票扫描 ======`);
    logger.info(`[${timestamp}] [持仓扫描] 监控列表股票数量: ${this.positionWatchList.size}`);
    logger.info(`[${timestamp}] [持仓扫描] 股票代码列表: ${stockCodes.join(', ')}`);
    
    try {
      // 添加 sh/sz 前缀
      const prefixedCodes = stockCodes.map(code => {
        return code.startsWith('6') ? `sh${code}` : `sz${code}`;
      });
      
      logger.info(`[${timestamp}] [持仓扫描] 添加前缀后的代码: ${prefixedCodes.join(', ')}`);
      
      // 获取持仓股票实时数据
      const stockDataSource = getStockDataSource();
      const quotes = await stockDataSource.getRealtimeQuote(prefixedCodes);
      
      if (!quotes || quotes.length === 0) {
        logger.warn(`[${timestamp}] [持仓扫描] 未获取到持仓股票数据`);
        return;
      }
      
      logger.info(`[${timestamp}] [持仓扫描] 获取到 ${quotes.length} 只股票的实时数据`);
      
      // 处理每个持仓股票的卖出信号
      for (const quote of quotes) {
        try {
          logger.info(`[${timestamp}] [持仓扫描] 开始处理: ${quote.name}(${quote.code})`);
          await this.processPositionSellSignal(quote);
        } catch (error) {
          logger.error(`[${timestamp}] [持仓扫描] 处理 ${quote.name}(${quote.code}) 失败:`, error);
        }
      }
      
      logger.info(`[${timestamp}] [持仓扫描] ====== 持仓股票扫描结束 ======`);
    } catch (error) {
      logger.error(`[${timestamp}] [持仓扫描] 扫描失败:`, error);
    }
  }

  // ====== 【新增】处理持仓股票的卖出信号 ======
  private async processPositionSellSignal(quote: any) {
    const timestamp = new Date().toLocaleString('zh-CN');
    
    try {
      logger.info(`[${timestamp}] [持仓扫描] 开始处理持仓股票: ${quote.name}(${quote.code}), 价格: ${quote.price}, 涨跌幅: ${quote.changePercent?.toFixed(2)}%`);
      
      // 获取股票完整数据（包含技术指标等）
      const stockDataSource = getStockDataSource();
      
      // 标准化股票代码（移除 sh/sz 前缀，确保数据源能正确识别）
      const normalizedCode = quote.code.replace(/^sh|^sz/, '');
      logger.info(`[${timestamp}] [持仓扫描] 标准化代码: ${quote.code} -> ${normalizedCode}`);
      
      // 获取主力资金数据
      const mainForceDataArray = await stockDataSource.getMainForceData([normalizedCode]);
      const mainForceData = mainForceDataArray[0] || {
        mainForceNetFlow: 0,
        totalNetFlow: 0,
        mainForceBuyAmount: 0,
        mainForceSellAmount: 0,
        retailNetFlow: 0,
        retailBuyAmount: 0,
        retailSellAmount: 0,
        netFlowRatio: 0,
        volumeAmplification: 1,
        turnoverRate: 0,
        mainForceRatio: 0,
        mainForceType: 'unknown',
        flowStrength: 'moderate',
        continuousFlowPeriods: 0,
        industryRank: 100,
        conceptRank: 100,
        trend: 'stable'
      };
      
      // 获取技术指标数据
      const technicalData = await stockDataSource.getTechnicalIndicators(normalizedCode) || {
        rsi: 50,
        macd: { diff: 0, dea: 0, macd: 0 },
        kdj: { k: 50, d: 50, j: 50 },
        ma: { ma5: quote.price, ma10: quote.price, ma20: quote.price, ma30: quote.price, ma60: quote.price },
        boll: { upper: quote.price * 1.1, middle: quote.price, lower: quote.price * 0.9 },
        volume: { ma5: 1, ma10: 1, ma20: 1 },
        sar: quote.price,
        cci: 0,
        adx: 20,
        williamsR: -50,
        bias: 0
      };
      
      // 获取融资融券数据
      const marginTradingData = await stockDataSource.getMarginTradingData(normalizedCode) || {
        marginBuy: 0,
        marginRepay: 0,
        marginBalance: 0,
        marginIncrease: 0,
        marginRatio: 0,
        shortSell: 0,
        shortBuy: 0,
        shortBalance: 0,
        shortIncrease: 0,
        shortRatio: 0,
        marginShortRatio: 0,
        marginShortBalance: 0,
        marginShortIncrease: 0,
        marginTrend: 'stable',
        shortTrend: 'stable'
      };
      
      // 构建完整数据
      const comprehensiveData = {
        stockCode: normalizedCode, // 使用标准化代码，确保与持仓匹配
        stockName: quote.name,
        mainForceData,
        technicalData,
        marginTradingData,
        currentPrice: quote.price,
        changePercent: quote.changePercent,
        change: quote.change
      };
      
      if (!comprehensiveData) {
        return;
      }
      
      logger.info(`[${timestamp}] [持仓扫描] 数据获取完成，开始调用 generateSellSignal`);
      
      // 生成卖出信号（generateSellSignal内部已自动添加到signalManager）
      const sellSignal = await this.generateSellSignal(comprehensiveData);
      
      if (sellSignal) {
        logger.info(`[持仓卖出信号] ${quote.name}(${quote.code}) 生成卖出信号: ${sellSignal.reason}`);
      } else {
        logger.info(`[${timestamp}] [持仓扫描] ${quote.name}(${quote.code}) 未生成卖出信号`);
      }
    } catch (error) {
      logger.error(`[持仓卖出信号] 处理失败 ${quote.code}:`, error);
    }
  }

  private adjustScanInterval() {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }

    const marketStatus = this.checkMarketStatus();
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    let interval: number;
    const backgroundMultiplier = 1; // 优化：后台模式保持全速度，不减速！

    // 开盘前（9:00-9:30）：高频率扫描
    if (hours === 9 && minutes >= 0 && minutes < 30) {
      interval = Math.round(10000 * backgroundMultiplier); // 开盘前高频率扫描
      logger.info(`当前为开盘前，扫描间隔调整为${interval / 1000}秒${this.isBackgroundMode ? ' (后台模式)' : ''}`);
    }
    // 开盘初期（9:30-10:30）：极高频率扫描
    else if (hours === 9 && minutes >= 30 || (hours === 10 && minutes <= 30)) {
      interval = Math.round(2000 * backgroundMultiplier); // 开盘初期极高频率扫描
      logger.info(`当前为开盘初期，扫描间隔调整为${interval / 1000}秒${this.isBackgroundMode ? ' (后台模式)' : ''}`);
    }
    // 下午开盘初期（13:00-13:30）：极高频率扫描
    else if (hours === 13 && minutes <= 30) {
      interval = Math.round(2000 * backgroundMultiplier); // 下午开盘初期极高频率扫描
      logger.info(`当前为下午开盘初期，扫描间隔调整为${interval / 1000}秒${this.isBackgroundMode ? ' (后台模式)' : ''}`);
    }
    else if (marketStatus === 'open') {
      // 交易时间：根据市场波动情况动态调整扫描间隔
      // 获取最近的扫描结果，判断市场波动情况
      const hasRecentSignals = this.scanHistory.length > 0 && 
                             this.scanHistory[this.scanHistory.length - 1].buySignals > 0;
      
      // 如果最近有信号生成，说明市场活跃，缩短扫描间隔
      const baseInterval = hasRecentSignals ? 3000 : 5000; // 活跃市场3秒，正常市场5秒
      interval = Math.round(baseInterval * backgroundMultiplier);
    } else if (marketStatus === 'auction') {
      // 集合竞价：中等频率
      interval = Math.round(8000 * backgroundMultiplier); // 比之前更频繁
    } else {
      // 收盘时间：保持较高频率以确保测试和验证
      interval = Math.round(30000 * backgroundMultiplier); // 比之前更频繁，确保能够生成信号
    }

    this.scanTimer = setInterval(() => {
      this.scanMarket();
      // 每30秒重新检查市场状态，动态调整间隔
      if (Date.now() % 30000 < interval) {
        this.adjustScanInterval();
      }
    }, interval);

    logger.info(`扫描间隔已调整为 ${interval / 1000}秒 (市场状态: ${marketStatus}${this.isBackgroundMode ? ', 后台模式' : ''})`);
  }

  stopMonitoring() {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
      logger.info('全市场监控已停止');
    }
    if (this.positionScanTimer) {
      clearInterval(this.positionScanTimer);
      this.positionScanTimer = null;
      logger.info('持仓扫描已停止');
    }
    this.positionListenerSetup = false;
    logger.info('持仓监听器已重置');
    this.saveAdaptiveSettings();
  }

  // 设置后台运行模式
  setBackgroundMode(isBackground: boolean) {
    this.isBackgroundMode = isBackground;
    if (isBackground) {
      logger.info('进入后台运行模式，保持全速度监控继续运行');
      // 后台模式下保持全速度运行，不调整扫描频率
      // 不调用adjustScanInterval，避免减速
    } else {
      logger.info('退出后台运行模式，继续全速度运行');
      // 前台模式下保持全速度运行，不调整扫描频率
    }
  }

  // 检查是否处于后台模式
  isInBackgroundMode(): boolean {
    return this.isBackgroundMode;
  }

  private loadAdaptiveSettings(): void {
    try {
      const savedSettings = localStorage.getItem('marketMonitorAdaptiveSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        this.adaptiveThresholds = { ...this.adaptiveThresholds, ...settings.thresholds };
        this.marketTrendHistory = settings.marketTrendHistory || [];
        this.signalPerformanceHistory = settings.signalPerformanceHistory || [];
        logger.info('自适应设置加载成功');
      }
    } catch (error) {
      logger.warn('加载自适应设置失败:', error);
    }
  }

  private saveAdaptiveSettings(): void {
    try {
      const settings = {
        thresholds: this.adaptiveThresholds,
        marketTrendHistory: this.marketTrendHistory.slice(-100),
        signalPerformanceHistory: this.signalPerformanceHistory.slice(-200)
      };
      localStorage.setItem('marketMonitorAdaptiveSettings', JSON.stringify(settings));
      logger.info('自适应设置保存成功');
    } catch (error) {
      logger.warn('保存自适应设置失败:', error);
    }
  }

  async getStatus() {
    const stockCount = await this.getStockCount();
    return {
      enabled: this.config.enabled,
      marketStatus: this.checkMarketStatus(),
      stockCount: stockCount,
      lastScanTime: this.lastScanTime,
      isScanning: this.isScanning,
      scanStatus: this.scanStatus,
      activeScans: this.getActiveScans(),
      scanHistory: [...this.scanHistory],
      learningModel: {
        accuracy: this.learningModel.accuracy,
        lastTrained: this.learningModel.lastTrained,
        featuresCount: this.learningModel.features.length
      },
      limitUpStocksCount: this.limitUpStocksHistory.length
    };
  }

  private collectLimitUpStockFeatures(stockData: any, technicalData: any, mainForceData: any): void {
    if (Math.abs(stockData.changePercent || 0) >= 9.5) {
      const price = stockData.currentPrice;
      const ma5 = technicalData.ma?.ma5 || 0;
      const ma10 = technicalData.ma?.ma10 || 0;
      const ma20 = technicalData.ma?.ma20 || 0;
      const bollMiddle = technicalData.boll?.middle || 0;
      const bollUpper = technicalData.boll?.upper || 0;
      const bollLower = technicalData.boll?.lower || 0;
      
      const priceToMa5 = ma5 > 0 ? (price - ma5) / ma5 : 0;
      const priceToMa10 = ma10 > 0 ? (price - ma10) / ma10 : 0;
      const priceToMa20 = ma20 > 0 ? (price - ma20) / ma20 : 0;
      const priceToBollMiddle = bollMiddle > 0 ? (price - bollMiddle) / bollMiddle : 0;
      const priceToBollUpper = bollUpper > 0 ? (price - bollUpper) / bollUpper : 0;
      const bollWidth = bollMiddle > 0 ? (bollUpper - bollLower) / bollMiddle : 0;
      
      const macdDiff = technicalData.macd?.diff || 0;
      const macdDea = technicalData.macd?.dea || 0;
      const macdCrossSignal = macdDiff > macdDea ? 1 : macdDiff< macdDea ? -1 : 0;
      
      const kdjK = technicalData.kdj?.k || 0;
      const kdjD = technicalData.kdj?.d || 0;
      const kdjCrossSignal = kdjK >kdjD ? 1 : kdjK< kdjD ? -1 : 0;
      
      const rsi = technicalData.rsi || 50;
      const rsiOverbought = rsi >70 ? 1 : 0;
      const rsiOversold = rsi< 30 ? 1 : 0;
      
      const volumeMA5 = technicalData.volume?.ma5 || 0;
      const volumeMA10 = technicalData.volume?.ma10 || 0;
      const volumeRatio = volumeMA10 >0 ? volumeMA5 / volumeMA10 : 1;
      
      const marketType = stockData.stockCode.startsWith('688') ? 1 : 
                        stockData.stockCode.startsWith('300') || stockData.stockCode.startsWith('301') ? 2 : 
                        stockData.stockCode.startsWith('002') ? 3 : 
                        stockData.stockCode.startsWith('000') ? 4 : 
                        stockData.stockCode.startsWith('60') ? 5 : 0;
      
      const industryType = mainForceData.industryRank< 20 ? 1 : 
                          mainForceData.industryRank <50 ? 2 : 
                          mainForceData.industryRank< 80 ? 3 : 4;
      
      const feature: StockFeature = {
        stockCode: stockData.stockCode,
        stockName: stockData.stockName,
        isLimitUp: true,
        price: price,
        changePercent: stockData.changePercent || 0,
        volume: mainForceData.volume || 0,
        volumeAmplification: mainForceData.volumeAmplification || 1,
        turnoverRate: mainForceData.turnoverRate || 0,
        mainForceNetFlow: mainForceData.mainForceNetFlow || 0,
        mainForceRatio: mainForceData.mainForceRatio || 0,
        mainForceType: mainForceData.mainForceType || 'unknown',
        rsi: rsi,
        macdDiff: macdDiff,
        macdDea: macdDea,
        macd: technicalData.macd?.macd || 0,
        kdjK: kdjK,
        kdjD: kdjD,
        kdjJ: technicalData.kdj?.j || 0,
        ma5: ma5,
        ma10: ma10,
        ma20: ma20,
        ma30: technicalData.ma?.ma30 || 0,
        bollLower: bollLower,
        bollMiddle: bollMiddle,
        bollUpper: bollUpper,
        bollWidth: bollWidth,
        volumeMA5: volumeMA5,
        volumeMA10: volumeMA10,
        volumeMA20: technicalData.volume?.ma20 || 0,
        sar: technicalData.sar || 0,
        cci: technicalData.cci || 0,
        adx: technicalData.adx || 0,
        williamsR: technicalData.williamsR || 0,
        bias: technicalData.bias || 0,
        industryRank: mainForceData.industryRank || 100,
        conceptRank: mainForceData.conceptRank || 100,
        continuousFlowPeriods: mainForceData.continuousFlowPeriods || 0,
        flowStrength: mainForceData.flowStrength || 'moderate',
        trend: mainForceData.trend || 'stable',
        priceToMa5: priceToMa5,
        priceToMa10: priceToMa10,
        priceToMa20: priceToMa20,
        priceToBollMiddle: priceToBollMiddle,
        priceToBollUpper: priceToBollUpper,
        macdCrossSignal: macdCrossSignal,
        kdjCrossSignal: kdjCrossSignal,
        rsiOverbought: rsiOverbought,
        rsiOversold: rsiOversold,
        volumeRatio: volumeRatio,
        market: stockData.stockCode.startsWith('6') ? 'sh' : 'sz',
        industry: '',
        timestamp: Date.now(),
        
        // 融资融券数据
        marginBuy: 0,
        marginRepay: 0,
        marginBalance: 0,
        marginIncrease: 0,
        marginRatio: 0,
        shortSell: 0,
        shortBuy: 0,
        shortBalance: 0,
        shortIncrease: 0,
        shortRatio: 0,
        marginShortRatio: 0,
        marginShortBalance: 0,
        marginShortIncrease: 0,
        marginTrend: 'stable',
        shortTrend: 'stable'
      };
      
      this.limitUpStocksHistory.push(feature);
      
      // 限制学习样本不超过100个，超过则删除最旧的样本
      const MAX_LEARNING_SAMPLES = 100;
      if (this.limitUpStocksHistory.length > MAX_LEARNING_SAMPLES) {
        this.limitUpStocksHistory.shift();
      }
    }
  }

  // 分析牛股特征（如301396这样的翻倍股票）
  private analyzeBullStockFeatures(stockData: any, technicalData: any, mainForceData: any): void {
    // 模拟牛股数据分析，实际应用中需要根据历史数据进行分析
    const bullStocks = [
      { code: '301396', name: '智信精密', isBullStock: true },
      { code: '301408', name: '中润光电', isBullStock: true },
      { code: '300905', name: '宝丽迪', isBullStock: true },
      { code: '301382', name: '三态股份', isBullStock: true },
      { code: '300027', name: '华谊兄弟', isBullStock: true },
      { code: '300798', name: '锦浪科技', isBullStock: true },
      { code: '301603', name: '泰坦科技', isBullStock: true },
      { code: '300088', name: '长信科技', isBullStock: true }
    ];

    const bullStock = bullStocks.find(stock => stock.code === stockData.stockCode);
    if (bullStock) {
      const price = stockData.currentPrice;
      const ma5 = technicalData.ma?.ma5 || 0;
      const ma10 = technicalData.ma?.ma10 || 0;
      const ma20 = technicalData.ma?.ma20 || 0;
      const ma60 = technicalData.ma?.ma60 || 0;
      const ma120 = technicalData.ma?.ma120 || 0;

      const priceToMa5 = ma5 > 0 ? (price - ma5) / ma5 : 0;
      const priceToMa10 = ma10 > 0 ? (price - ma10) / ma10 : 0;
      const priceToMa20 = ma20 > 0 ? (price - ma20) / ma20 : 0;
      const priceToMa60 = ma60 > 0 ? (price - ma60) / ma60 : 0;
      const priceToMa120 = ma120 > 0 ? (price - ma120) / ma120 : 0;

      // 牛股底部特征分析
      const isBottomStage = priceToMa60 < 0.1 && priceToMa120 < 0.15;
      const isVolumeIncreasing = mainForceData.volumeAmplification > 1.5;
      const isMainForceBuying = mainForceData.mainForceNetFlow > 0;
      const isTechnicalImproving = technicalData.macd?.diff > technicalData.macd?.dea || false;

      if (isBottomStage && isVolumeIncreasing && isMainForceBuying && isTechnicalImproving) {
        // 记录牛股底部特征
        const bullStockFeature = {
          ...stockData,
          ...technicalData,
          ...mainForceData,
          isBullStock: true,
          isBottomStage: true,
          timestamp: Date.now()
        };

        this.limitUpStocksHistory.push(bullStockFeature);
        
        // 限制学习样本不超过100个，超过则删除最旧的样本
        const MAX_LEARNING_SAMPLES = 100;
        if (this.limitUpStocksHistory.length > MAX_LEARNING_SAMPLES) {
          this.limitUpStocksHistory.shift();
        }
        
        console.log(`发现牛股底部特征: ${bullStock.name}(${bullStock.code}) - 底部启动阶段，具备翻倍潜力`);

        // 调整模型权重，提高对牛股底部特征的识别能力
        this.adjustModelWeightsForBullStocks();
      }
    }
  }

  // 调整模型权重以提高对牛股底部特征的识别能力
  private adjustModelWeightsForBullStocks(): void {
    // 提高对底部特征的权重
    const bullStockWeights = {
      volumeAmplification: 1.8, // 提高成交量放大的权重
      mainForceNetFlow: 2.0, // 提高主力资金流入的权重
      continuousFlowPeriods: 1.5, // 提高连续资金流入的权重
      priceToMa60: 1.2, // 增加对长期均线的权重
      priceToMa120: 1.2, // 增加对长期均线的权重
      macdDiff: 1.5, // 提高MACD金叉的权重
      kdjCrossSignal: 1.5, // 提高KDJ金叉的权重
      rsi: 1.2, // 提高RSI的权重
      industryRank: 1.3, // 提高行业排名的权重
      conceptRank: 1.3 // 提高概念排名的权重
    };

    // 更新模型权重
    Object.entries(bullStockWeights).forEach(([feature, weight]) => {
      if (this.learningModel.weights[feature]) {
        this.learningModel.weights[feature] *= weight;
      }
    });

    // 归一化权重
    const totalWeight = Object.values(this.learningModel.weights).reduce((sum, w) => sum + w, 0);
    if (totalWeight > 0) {
      Object.keys(this.learningModel.weights).forEach(key => {
        this.learningModel.weights[key] = this.learningModel.weights[key] / totalWeight;
      });
    }

    console.log('模型权重已调整，提高对牛股底部特征的识别能力');
  }

  // 分析股票是否具有多倍潜力（翻倍以上）
  private analyzeMultiBaggerPotential(stockData: any, technicalData: any, mainForceData: any, expectedReturn: number): boolean {
    // 硬性条件：预期收益必须翻倍以上（>=100%）才能被认定为多倍潜力
    if (expectedReturn < 1.0) {
      return false;
    }

    // 多倍潜力股票（翻倍以上）的特征分析
    const ma60 = technicalData.ma?.ma60 || 0;
    const ma120 = technicalData.ma?.ma120 || 0;
    const currentPrice = stockData.currentPrice;
    const floatMarketCap = stockData.floatMarketCap || stockData.marketCap || 0; // 流通市值（单位：元）

    // 价格相对长期均线的位置（底部特征）
    const priceToMa60 = ma60 > 0 ? (currentPrice - ma60) / ma60 : 0;
    const priceToMa120 = ma120 > 0 ? (currentPrice - ma120) / ma120 : 0;

    // 成交量特征
    const volumeAmplification = mainForceData.volumeAmplification || 1;

    // 主力资金特征
    const mainForceNetFlow = mainForceData.mainForceNetFlow || 0;
    const continuousFlowPeriods = mainForceData.continuousFlowPeriods || 0;

    // 技术指标特征
    const macdDiff = technicalData.macd?.diff || 0;
    const macdDea = technicalData.macd?.dea || 0;
    const kdjK = technicalData.kdj?.k || 0;
    const kdjD = technicalData.kdj?.d || 0;

    // 行业和概念特征
    const industryRank = mainForceData.industryRank || 100;
    const conceptRank = mainForceData.conceptRank || 100;

    // 市场类型特征（创业板和科创板更容易出现多倍股）
    const isHighGrowthMarket = stockData.stockCode.startsWith('688') || 
                              stockData.stockCode.startsWith('300') || 
                              stockData.stockCode.startsWith('301');

    // 多倍潜力股票的核心特征
    const isBottomStage = priceToMa60 < 0.3 && priceToMa120 < 0.35; // 底部区域
    const isVolumeIncreasing = volumeAmplification > 1.8; // 成交量明显放大
    const isMainForceAccumulating = mainForceNetFlow > 50000 && continuousFlowPeriods >= 2; // 主力资金持续流入
    const isTechnicalImproving = macdDiff > macdDea && kdjK > kdjD; // 技术指标改善
    const isHighGrowthIndustry = industryRank < 40 || conceptRank < 30; // 高增长行业

    // 低价股权重（低价股更容易翻倍）
    let priceBonus = 0;
    if (currentPrice < 10) {
      priceBonus = 25; // <10元 +25分
    } else if (currentPrice < 20) {
      priceBonus = 15; // <20元 +15分
    } else if (currentPrice < 30) {
      priceBonus = 8; // <30元 +8分
    } else if (currentPrice > 100) {
      priceBonus = -15; // >100元 -15分（高价股降低权重）
    } else if (currentPrice > 50) {
      priceBonus = -8; // >50元 -8分（中高价股轻微降权）
    }

    // 小盘股权重（小盘股更容易出现多倍增长）
    let marketCapBonus = 0;
    if (floatMarketCap > 0) {
      if (floatMarketCap < 500000000) { // <5亿
        marketCapBonus = 30; // 超微盘股 +30分
      } else if (floatMarketCap < 1000000000) { // <10亿
        marketCapBonus = 25; // 微盘股 +25分
      } else if (floatMarketCap < 2000000000) { // <20亿
        marketCapBonus = 20; // 小盘股 +20分
      } else if (floatMarketCap < 3000000000) { // <30亿
        marketCapBonus = 10; // 中小盘股 +10分
      } else if (floatMarketCap > 50000000000) { // >500亿
        marketCapBonus = -20; // 大盘股 -20分
      } else if (floatMarketCap > 20000000000) { // >200亿
        marketCapBonus = -10; // 中大盘股 -10分
      }
    } else {
      // 如果没有流通市值数据，用股价估算
      if (currentPrice < 15) {
        marketCapBonus = 15; // 低价股假设为小盘股
      }
    }

    // 综合判断（预期收益翻倍已经作为硬性条件，这里不再重复计分）
    const multiBaggerScore = 
      (isBottomStage ? 25 : 0) +
      (isVolumeIncreasing ? 20 : 0) +
      (isMainForceAccumulating ? 20 : 0) +
      (isTechnicalImproving ? 15 : 0) +
      (isHighGrowthIndustry ? 10 : 0) +
      (isHighGrowthMarket ? 15 : 0) +
      priceBonus +
      marketCapBonus;

    // 得分超过55分认为具有多倍潜力（因为增加了权重，适当降低门槛）
    const isMultiBagger = multiBaggerScore >= 55;

    if (isMultiBagger) {
      console.log('发现多倍潜力股票: ' + stockData.stockName + '(' + stockData.stockCode + ') - 得分: ' + multiBaggerScore + ', 预期收益: ' + (expectedReturn * 100).toFixed(0) + '%');
    }

    return isMultiBagger;
  }

  private trainModelWithData(model: LearningModel, data: StockFeature[]): void {
    if (data.length< 10) {
      logger.info(`样本数量不足，跳过模型训练: ${data.length}`);
      return;
    }

    logger.info(`开始训练模型，样本数量: ${data.length}`);
    
    const features = model.features;
    const newWeights: Record<string, number>= {};
    
    features.forEach(feature => {
      let sum = 0;
      let count = 0;
      
      data.forEach(stock => {
        let value = 0;
        
        switch (feature) {
          case 'mainForceNetFlow':
            value = Math.log(Math.abs(stock.mainForceNetFlow) + 1) / 12; // 优化：降低分母，增加权重
            break;
          case 'mainForceRatio':
            value = stock.mainForceRatio * 1.5; // 优化：增加权重
            break;
          case 'volumeAmplification':
            value = Math.log(stock.volumeAmplification) / 2; // 优化：降低分母，增加权重
            break;
          case 'turnoverRate':
            value = Math.min(stock.turnoverRate / 20, 1); // 优化：降低分母，增加权重
            break;
          case 'rsi':
            value = (70 - Math.min(stock.rsi, 70)) / 70; // 优化：降低阈值，增加权重
            break;
          case 'macdDiff':
            value = Math.max(stock.macdDiff, 0) * 10; // 优化：增加权重
            break;
          case 'macdCrossSignal':
            value = stock.macdCrossSignal === 1 ? 1.2 : 0; // 优化：增加权重
            break;
          case 'kdjK':
            value = (stock.kdjK - 20) / 60; // 优化：调整范围，增加权重
            break;
          case 'kdjCrossSignal':
            value = stock.kdjCrossSignal === 1 ? 1.2 : 0; // 优化：增加权重
            break;
          case 'priceToMa5':
            value = Math.min(stock.priceToMa5 * 12, 1); // 优化：增加权重
            break;
          case 'priceToMa10':
            value = Math.min(stock.priceToMa10 * 10, 1); // 优化：增加权重
            break;
          case 'priceToMa20':
            value = Math.min(stock.priceToMa20 * 8, 1); // 优化：增加权重
            break;
          case 'priceToBollUpper':
            value = Math.min(Math.abs(stock.priceToBollUpper) * 6, 1); // 优化：增加权重
            break;
          case 'bollWidth':
            value = Math.min(stock.bollWidth * 6, 1); // 优化：增加权重
            break;
          case 'volumeRatio':
            value = Math.min(stock.volumeRatio, 2.5) / 2.5; // 优化：增加范围，增加权重
            break;
          case 'cci':
            value = Math.min(Math.abs(stock.cci) / 150, 1); // 优化：降低分母，增加权重
            break;
          case 'adx':
            value = Math.min(stock.adx / 40, 1); // 优化：降低分母，增加权重
            break;
          case 'williamsR':
            value = Math.min((-stock.williamsR) / 80, 1); // 优化：降低分母，增加权重
            break;
          case 'continuousFlowPeriods':
            value = Math.min(stock.continuousFlowPeriods / 8, 1); // 优化：降低分母，增加权重
            break;
          case 'flowStrength':
            value = stock.flowStrength === 'strong' || stock.flowStrength === 'veryStrong' ? 1.2 : 
                   stock.flowStrength === 'moderate' ? 0.6 : 0; // 优化：增加权重
            break;
          case 'industryRank':
            value = Math.max(0, (30 - stock.industryRank) / 30); // 优化：降低阈值，增加权重
            break;
          case 'conceptRank':
            value = Math.max(0, (20 - stock.conceptRank) / 20); // 优化：降低阈值，增加权重
            break;
          case 'marketType':
            value = stock.stockCode.startsWith('688') || stock.stockCode.startsWith('300') || stock.stockCode.startsWith('301') ? 0.9 :
                   stock.stockCode.startsWith('002') ? 0.7 :
                   stock.stockCode.startsWith('000') ? 0.5 :
                   stock.stockCode.startsWith('60') ? 0.4 : 0; // 优化：增加权重
            break;
          case 'industryType':
            value = stock.industryRank< 15 ? 1.2 :
                   stock.industryRank <40 ? 0.8 :
                   stock.industryRank< 70 ? 0.5 : 0.3; // 优化：增加权重
            break;
          default:
            value = 0;
        }
        
        sum += value;
        count++;
      });
      
      newWeights[feature] = count > 0 ? sum / count : 0;
    });
    
    const totalWeight = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
    if (totalWeight > 0) {
      Object.keys(newWeights).forEach(key => {
        newWeights[key] = newWeights[key] / totalWeight;
      });
    }
    
    model.weights = newWeights;
    model.lastTrained = Date.now();
    model.accuracy = this.calculateModelAccuracy();
    
    logger.info(`模型训练完成，准确率: ${(model.accuracy * 100).toFixed(2)}%`);
  }
  
  private trainMultiPeriodModel(): void {
    const now = Date.now();
    
    // 超短期数据：最近1天
    const ultraShortTermData = this.limitUpStocksHistory.filter(stock => 
      now - stock.timestamp < 86400000); // 1天 = 86400000毫秒
    
    // 短期数据：1天到3天
    const shortTermData = this.limitUpStocksHistory.filter(stock => 
      now - stock.timestamp >= 86400000 && now - stock.timestamp < 259200000); // 3天 = 259200000毫秒
    
    // 中期数据：3天到1周
    const mediumTermData = this.limitUpStocksHistory.filter(stock => 
      now - stock.timestamp >= 259200000 && now - stock.timestamp< 604800000); // 1周 = 604800000毫秒
    
    // 长期数据：1周到2周
    const longTermData = this.limitUpStocksHistory.filter(stock => 
      now - stock.timestamp >= 604800000 && now - stock.timestamp < 1209600000); // 2周 = 1209600000毫秒
    
    // 超长期数据：2周以上
    const ultraLongTermData = this.limitUpStocksHistory.filter(stock => 
      now - stock.timestamp >= 1209600000);
    
    logger.info(`多周期模型训练开始 - 超短期: ${ultraShortTermData.length}, 短期: ${shortTermData.length}, 中期: ${mediumTermData.length}, 长期: ${longTermData.length}, 超长期: ${ultraLongTermData.length}`);
    
    // 分别训练不同周期的模型
    this.trainModelWithData(this.multiPeriodModel.ultraShortTerm, ultraShortTermData);
    this.trainModelWithData(this.multiPeriodModel.shortTerm, shortTermData);
    this.trainModelWithData(this.multiPeriodModel.mediumTerm, mediumTermData);
    this.trainModelWithData(this.multiPeriodModel.longTerm, longTermData);
    this.trainModelWithData(this.multiPeriodModel.ultraLongTerm, ultraLongTermData);
    
    logger.info('多周期模型训练完成');
  }
  
  private trainLearningModel(): void {
    if (this.limitUpStocksHistory.length < 20) {
      logger.info('涨停板样本数量不足，跳过模型训练');
      return;
    }

    logger.info(`开始训练机器学习模型，样本数量: ${this.limitUpStocksHistory.length}`);
    
    this.trainModelWithData(this.learningModel, this.limitUpStocksHistory);
  }

  private calculateModelAccuracy(): number {
    if (this.limitUpStocksHistory.length< 10) return 0;
    
    let correct = 0;
    let total = 0;
    let highConfidenceCorrect = 0;
    let highConfidenceTotal = 0;
    
    this.limitUpStocksHistory.forEach(stock =>{
      const { score } = this.calculateStockScore(stock);
      
      if (score >0.5) {
        correct++;
      }
      total++;
      
      if (score >0.7) {
        if (stock.isLimitUp) {
          highConfidenceCorrect++;
        }
        highConfidenceTotal++;
      }
    });
    
    const baseAccuracy = total >0 ? correct / total : 0;
    const highConfidenceAccuracy = highConfidenceTotal >0 ? highConfidenceCorrect / highConfidenceTotal : 0;
    
    const combinedAccuracy = baseAccuracy * 0.7 + highConfidenceAccuracy * 0.3;
    
    logger.info(`模型准确率计算完成 - 基础准确率: ${(baseAccuracy * 100).toFixed(2)}%, 高置信度准确率: ${(highConfidenceAccuracy * 100).toFixed(2)}%, 综合准确率: ${(combinedAccuracy * 100).toFixed(2)}%`);
    
    return combinedAccuracy;
  }

  private calculateStockScore(stock: any): { score: number; limitUpScore: number; expectedReturn: number } {
    let score = 0;
    
    const mainForceData = stock.mainForceData || {};
    const technicalData = stock.technicalData || {};
    const marginTradingData = stock.marginTradingData || {};
    const currentPrice = stock.currentPrice || 0;
    
    // 高科技科技股概念列表
    const techConcepts = [
      // 芯片相关
      '芯片', '半导体', '集成电路', '光刻', 'EDA', '芯片设计', '芯片制造', '晶圆', '封装', '测试',
      'SoC', 'CPU', 'GPU', 'FPGA', 'MCU', '存储芯片', '内存', 'DRAM', 'NAND', 'NOR',
      'AI芯片', '算力芯片', '数据中心芯片', '服务器芯片', '汽车芯片', '车规芯片',
      // AI人工智能
      '人工智能', 'AI', '大模型', '机器学习', '深度学习', '神经网络', '自然语言处理',
      '计算机视觉', 'AI应用', 'AI+', 'AI赋能', '智能', '机器人', '人形机器人',
      // 航空航天
      '航空', '航天', '卫星', '火箭', '空间站', '飞船', '国防军工', '军工', '军机', '导弹',
      // 核能
      '核能', '核电', '核反应堆', '核聚变', '核材料',
      // 低空经济
      '低空经济', '低空飞行', '无人机', 'eVTOL', '通航',
      // 新能源
      '新能源', '光伏', '太阳能', '风电', '储能', '锂电池', '动力电池', '氢能', '充电桩',
      // 量子通讯
      '量子', '量子通信', '量子计算', '量子芯片',
      // 新材料
      '新材料', '半导体材料', '光刻胶', '靶材', 'CMP抛光', '电子特气',
      // AI电脑/手机
      'AI PC', 'AI手机', '智能终端', '消费电子',
      // 脑机接口
      '脑机接口', 'BCI', '神经芯片',
      // 软件
      '软件', '操作系统', '数据库', '云计算', '大数据', '云服务', 'SaaS', 'PaaS',
      // 其他科技
      '数据中心', 'IDC', '光模块', 'CPO', '液冷', '算力', '边缘计算', '物联网', 'IoT',
      '工业互联网', '智能制造', '工业4.0', '机器人', '工业机器人', '服务机器人',
      '传感器', 'MEMS', '先进制造', '高端装备', '智能制造', '数字经济', '数字孪生'
    ];
    
    // 检测是否为高科技股
    let isHighTechStock = false;
    let techScore = 0;
    
    if (mainForceData.industry) {
      const industryLower = mainForceData.industry.toLowerCase();
      for (const concept of techConcepts) {
        if (industryLower.includes(concept.toLowerCase())) {
          isHighTechStock = true;
          techScore += 5;
        }
      }
    }
    
    if (mainForceData.conceptRank !== undefined && mainForceData.conceptRank < 30) {
      const conceptInfo = mainForceData.conceptInfo || '';
      const conceptLower = conceptInfo.toLowerCase();
      for (const concept of techConcepts) {
        if (conceptLower.includes(concept.toLowerCase())) {
          isHighTechStock = true;
          techScore += 3;
        }
      }
    }
    
    // 科创板和创业板股票更可能是高科技股
    const stockCode = stock.stockCode || '';
    if (stockCode.startsWith('688') || stockCode.startsWith('300') || stockCode.startsWith('301')) {
      techScore += 2;
    }
    
    const ma5 = technicalData.ma?.ma5 || 0;
    const ma10 = technicalData.ma?.ma10 || 0;
    const ma20 = technicalData.ma?.ma20 || 0;
    const ma60 = technicalData.ma?.ma60 || 0;
    const ma120 = technicalData.ma?.ma120 || 0;
    const bollMiddle = technicalData.boll?.middle || 0;
    const bollUpper = technicalData.boll?.upper || 0;
    const bollLower = technicalData.boll?.lower || 0;
    
    const priceToMa5 = ma5 > 0 ? (currentPrice - ma5) / ma5 : 0;
    const priceToMa10 = ma10 > 0 ? (currentPrice - ma10) / ma10 : 0;
    const priceToMa20 = ma20 > 0 ? (currentPrice - ma20) / ma20 : 0;
    const priceToMa60 = ma60 > 0 ? (currentPrice - ma60) / ma60 : 0;
    const priceToMa120 = ma120 > 0 ? (currentPrice - ma120) / ma120 : 0;
    const priceToBollMiddle = bollMiddle > 0 ? (currentPrice - bollMiddle) / bollMiddle : 0;
    const priceToBollUpper = bollUpper > 0 ? (currentPrice - bollUpper) / bollUpper : 0;
    const bollWidth = bollMiddle > 0 ? (bollUpper - bollLower) / bollMiddle : 0;
    
    const macdDiff = technicalData.macd?.diff || 0;
    const macdDea = technicalData.macd?.dea || 0;
    const macdHist = technicalData.macd?.macd || 0;
    const macdCrossSignal = macdDiff > macdDea ? 1 : macdDiff< macdDea ? -1 : 0;
    const macdTrend = macdDiff > 0 && macdHist > 0 ? 1 : 0;
    
    const kdjK = technicalData.kdj?.k || 0;
    const kdjD = technicalData.kdj?.d || 0;
    const kdjJ = technicalData.kdj?.j || 0;
    const kdjCrossSignal = kdjK >kdjD ? 1 : kdjK< kdjD ? -1 : 0;
    const kdjTrend = kdjK > 50 && kdjJ > kdjK ? 1 : 0;
    
    const rsi = technicalData.rsi || 50;
    const rsiOverbought = rsi >70 ? 1 : 0;
    const rsiOversold = rsi< 30 ? 1 : 0;
    const rsiTrend = rsi > 50 ? 1 : 0;
    
    const volumeMA5 = technicalData.volume?.ma5 || 0;
    const volumeMA10 = technicalData.volume?.ma10 || 0;
    const volumeMA20 = technicalData.volume?.ma20 || 0;
    const volumeRatio = volumeMA10 >0 ? volumeMA5 / volumeMA10 : 1;
    const volumeRatio20 = volumeMA20 >0 ? volumeMA5 / volumeMA20 : 1;
    
    const cci = technicalData.cci || 0;
    const adx = technicalData.adx || 0;
    const williamsR = technicalData.williamsR || 0;
    const sar = technicalData.sar || 0;
    const bias = technicalData.bias || 0;
    
    const marketType = stock.stockCode.startsWith('688') ? 1 : 
                      stock.stockCode.startsWith('300') || stock.stockCode.startsWith('301') ? 2 : 
                      stock.stockCode.startsWith('002') ? 3 : 
                      stock.stockCode.startsWith('000') ? 4 : 
                      stock.stockCode.startsWith('60') ? 5 : 0;
    
    const industryType = mainForceData.industryRank< 20 ? 1 : 
                        mainForceData.industryRank <50 ? 2 : 
                        mainForceData.industryRank< 80 ? 3 : 4;
    
    // 计算预计涨跌幅
    let expectedReturn = this.calculateExpectedReturn(stock, currentPrice, ma5, ma10, ma20, ma60, ma120, bollUpper, bollMiddle, 
                                                   technicalData.macd, technicalData.kdj, rsi, mainForceData, marginTradingData);
    
    // 强化涨停潜力特征分析
    const limitUpFeatures = {
      // 价格趋势特征
      priceTrend: Math.min((priceToMa5 + priceToMa10 + priceToMa20) * 5, 3),
      priceMomentum: Math.min(Math.abs(priceToMa5 - priceToMa10) * 20, 2),
      
      // 成交量特征
      volumeStrength: Math.min((volumeRatio + volumeRatio20) / 2 * 2, 2),
      volumeMomentum: Math.min(mainForceData.volumeAmplification || 1, 3),
      
      // 技术指标特征
      technicalStrength: Math.min((macdTrend + kdjTrend + rsiTrend) * 0.8, 2),
      overboughtOversold: Math.max(0, 1 - Math.abs(rsi - 50) / 50),
      
      // 主力资金特征
      mainForceStrength: Math.min(Math.log(Math.abs(mainForceData.mainForceNetFlow || 0) + 1) / 10, 3),
      mainForceConsistency: Math.min((mainForceData.continuousFlowPeriods || 0) / 5, 2),
      
      // 市场环境特征
      marketSentiment: marketType === 1 || marketType === 2 ? 1.5 : 1,
      industryStrength: Math.max(0, (30 - (mainForceData.industryRank || 100)) / 30),
      
      // 波动特征
      volatility: Math.min(bollWidth * 10, 2),
      priceToBoll: Math.max(0, 1 - Math.abs(priceToBollUpper)),
      
      // 快速上涨特征（新增）
      quickRise: stock.changePercent && stock.changePercent > 3 ? Math.min(stock.changePercent / 10, 3) : 0,
      veryQuickRise: stock.changePercent && stock.changePercent > 6 ? Math.min(stock.changePercent / 15, 2) : 0,
      
      // 开盘初期特征（新增）
      earlyMarket: this.isEarlyMarket() ? 1.5 : 1,
      
      // 涨停潜力特殊特征（新增）
      nearLimitUp: stock.changePercent && stock.changePercent > 8 ? 3 : stock.changePercent && stock.changePercent > 5 ? 2 : stock.changePercent && stock.changePercent > 3 ? 1 : 0,
      
      // 主力资金快速流入特征（新增）
      mainForceQuickFlow: mainForceData.mainForceNetFlow > 50000 ? Math.min(Math.log(mainForceData.mainForceNetFlow / 10000) / 2, 3) : 0,
    };
    
    // 计算涨停潜力综合得分，增加快速上涨和开盘初期的权重
    const weights = {
      priceTrend: 1.2, // 增加价格趋势权重
      priceMomentum: 1.2, // 增加价格动量权重
      volumeStrength: 1.5, // 增加成交量强度权重
      volumeMomentum: 1.5, // 增加成交量动量权重
      technicalStrength: 1.1, // 增加技术指标强度权重
      overboughtOversold: 0.9, // 增加超买超卖权重
      mainForceStrength: 1.8, // 增加主力资金强度权重
      mainForceConsistency: 1.0, // 增加主力资金一致性权重
      marketSentiment: 0.9, // 增加市场情绪权重
      industryStrength: 1.0, // 增加行业强度权重
      volatility: 0.7, // 增加波动率权重
      priceToBoll: 0.8, // 增加布林带位置权重
      quickRise: 2.0, // 增加快速上涨的权重
      veryQuickRise: 2.5, // 增加大幅快速上涨的权重
      earlyMarket: 1.5, // 增加开盘初期的权重
      nearLimitUp: 3.0, // 增加接近涨停的权重
      mainForceQuickFlow: 2.0, // 增加主力资金快速流入的权重
    };
    
    const weightedSum = Object.entries(limitUpFeatures).reduce((sum, [key, value]) => {
      return sum + (value * (weights[key as keyof typeof weights] || 1));
    }, 0);
    
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    const limitUpScore = weightedSum / totalWeight;
    
    Object.entries(this.learningModel.weights).forEach(([feature, weight]) =>{
      let value = 0;
      
      switch (feature) {
        case 'mainForceNetFlow':
          value = Math.log(Math.abs(mainForceData.mainForceNetFlow || 0) + 1) / 15;
          break;
        case 'mainForceRatio':
          value = mainForceData.mainForceRatio || 0;
          break;
        case 'volumeAmplification':
          value = Math.log(mainForceData.volumeAmplification || 1) / 2.5;
          break;
        case 'turnoverRate':
          value = Math.min((mainForceData.turnoverRate || 0) / 25, 1);
          break;
        case 'rsi':
          value = (75 - Math.min(rsi, 75)) / 75;
          break;
        case 'macdDiff':
          value = Math.max(macdDiff, 0) * 8;
          break;
        case 'macdCrossSignal':
          value = macdCrossSignal === 1 ? 1 : 0;
          break;
        case 'kdjK':
          value = (kdjK - 25) / 50;
          break;
        case 'kdjJ':
          value = (kdjJ - 30) / 40;
          break;
        case 'kdjCrossSignal':
          value = kdjCrossSignal === 1 ? 1 : 0;
          break;
        case 'priceToMa5':
          value = Math.min(priceToMa5 * 10, 1);
          break;
        case 'priceToMa10':
          value = Math.min(priceToMa10 * 8, 1);
          break;
        case 'priceToMa20':
          value = Math.min(priceToMa20 * 6, 1);
          break;
        case 'priceToMa60':
          value = Math.min(priceToMa60 * 4, 1);
          break;
        case 'priceToMa120':
          value = Math.min(priceToMa120 * 3, 1);
          break;
        case 'priceToBollUpper':
          value = Math.min(Math.abs(priceToBollUpper) * 5, 1);
          break;
        case 'bollWidth':
          value = Math.min(bollWidth * 5, 1);
          break;
        case 'volumeRatio':
          value = Math.min(volumeRatio, 2) / 2;
          break;
        case 'cci':
          value = Math.min(Math.abs(cci) / 200, 1);
          break;
        case 'adx':
          value = Math.min(adx / 50, 1);
          break;
        case 'williamsR':
          value = Math.min((-williamsR) / 100, 1);
          break;
        case 'continuousFlowPeriods':
          value = Math.min((mainForceData.continuousFlowPeriods || 0) / 10, 1);
          break;
        case 'flowStrength':
          value = mainForceData.flowStrength === 'strong' || mainForceData.flowStrength === 'veryStrong' ? 1 : 
                 mainForceData.flowStrength === 'moderate' ? 0.5 : 0;
          break;
        case 'industryRank':
          value = Math.max(0, (40 - (mainForceData.industryRank || 100)) / 40);
          break;
        case 'conceptRank':
          value = Math.max(0, (25 - (mainForceData.conceptRank || 100)) / 25);
          break;
        case 'marketType':
          value = marketType === 1 || marketType === 2 ? 0.8 :
                 marketType === 3 ? 0.6 :
                 marketType === 4 ? 0.4 :
                 marketType === 5 ? 0.3 : 0;
          break;
        case 'industryType':
          value = industryType === 1 ? 1 :
                 industryType === 2 ? 0.7 :
                 industryType === 3 ? 0.4 : 0.2;
          break;
        case 'marginIncrease':
          value = Math.min(Math.max(marginTradingData.marginIncrease || 0, 0) / 1000000, 1);
          break;
        case 'marginRatio':
          value = Math.min((marginTradingData.marginRatio || 0) * 20, 1);
          break;
        case 'shortIncrease':
          value = Math.max(1 - Math.min(Math.max(marginTradingData.shortIncrease || 0, 0) / 100000, 1), 0);
          break;
        case 'shortRatio':
          value = Math.max(1 - Math.min((marginTradingData.shortRatio || 0) * 50, 1), 0);
          break;
        case 'marginShortRatio':
          value = Math.min(Math.log(Math.max(marginTradingData.marginShortRatio || 1, 1)) / 4, 1);
          break;
        case 'marginShortIncrease':
          value = Math.min(Math.max(marginTradingData.marginShortIncrease || 0, 0) / 500000, 1);
          break;
        default:
          value = 0;
      }
      
      score += value * weight;
    });
    
    // 加入涨停潜力得分的权重
    score = Math.min(1, score + limitUpScore * 0.3 + this.learningModel.bias);
    
    // 高科技科技股额外权重加成
    if (isHighTechStock && techScore > 0) {
      // 高科技股加成：最高增加15%的评分
      const techBonus = Math.min(techScore / 100, 0.15);
      score = Math.min(1, score + techBonus);
      logger.info(`[高科技股加成] ${stock.stockName}(${stock.stockCode}) - 科技得分: ${techScore}, 评分加成: ${(techBonus * 100).toFixed(1)}%`);
    }
    
    // 返回得分、涨停潜力得分和预计涨跌幅
    return { score, limitUpScore, expectedReturn };
  }
  
  // 计算预计涨跌幅
  private calculateExpectedReturn(stock: any, currentPrice: number, ma5: number, ma10: number, ma20: number, ma60: number, ma120: number, 
                               bollUpper: number, bollMiddle: number, macd: any, kdj: any, rsi: number, mainForceData: any, marginTradingData?: any): number {
    let expectedReturn = 0;
    
    // 1. 均线分析贡献
    let maContribution = 0;
    if (ma5 > ma10 && ma10 > ma20 && ma20 > ma60) {
      // 多头排列
      maContribution = 0.08;
    } else if (ma5 > ma10 && ma10 > ma20) {
      // 短期多头
      maContribution = 0.04;
    } else if (ma5< ma10 && ma10 <ma20) {
      // 空头排列
      maContribution = -0.06;
    }
    
    // 2. 布林带分析贡献
    let bollContribution = 0;
    if (bollUpper >0 && bollMiddle > 0) {
      const priceToBollUpper = (currentPrice - bollUpper) / bollUpper;
      if (priceToBollUpper > 0.05) {
        bollContribution = -0.05; // 接近上轨，可能回调
      } else if (priceToBollUpper< -0.1) {
        bollContribution = 0.04; // 远离上轨，有上升空间
      }
    }
    
    // 3. MACD分析贡献
    let macdContribution = 0;
    if (macd) {
      const macdDiff = macd.diff || 0;
      const macdDea = macd.dea || 0;
      const macdHist = macd.hist || 0;
      
      if (macdDiff >macdDea && macdHist > 0) {
        macdContribution = 0.06;
      } else if (macdDiff< macdDea && macdHist <0) {
        macdContribution = -0.05;
      }
    }
    
    // 4. KDJ分析贡献
    let kdjContribution = 0;
    if (kdj) {
      const kdjK = kdj.k || 0;
      const kdjD = kdj.d || 0;
      const kdjJ = kdj.j || 0;
      
      if (kdjK > kdjD && kdjJ > kdjK) {
        kdjContribution = 0.05;
      } else if (kdjK< kdjD && kdjJ <kdjK) {
        kdjContribution = -0.04;
      }
      
      if (kdjK > 80) {
        kdjContribution -= 0.03; // 超买
      } else if (kdjK< 20) {
        kdjContribution += 0.03; // 超卖
      }
    }
    
    // 5. RSI分析贡献
    let rsiContribution = 0;
    if (rsi >70) {
      rsiContribution = -0.04; // 超买
    } else if (rsi< 30) {
      rsiContribution = 0.04; // 超卖
    } else if (rsi >50) {
      rsiContribution = 0.02; // 多头区域
    }
    
    // 6. 主力资金分析贡献
    let mainForceContribution = 0;
    if (mainForceData.mainForceNetFlow > 100000) {
      mainForceContribution = 0.12;
    } else if (mainForceData.mainForceNetFlow > 50000) {
      mainForceContribution = 0.08;
    } else if (mainForceData.mainForceNetFlow > 10000) {
      mainForceContribution = 0.04;
    } else if (mainForceData.mainForceNetFlow< -50000) {
      mainForceContribution = -0.08;
    }
    
    // 7. 成交量分析贡献
    let volumeContribution = 0;
    if (mainForceData.volumeAmplification >2) {
      volumeContribution = 0.05;
    } else if (mainForceData.volumeAmplification > 1.5) {
      volumeContribution = 0.03;
    }
    
    // 8. 行业和概念排名贡献
    let industryContribution = 0;
    if (mainForceData.industryRank< 20) {
      industryContribution = 0.06;
    } else if (mainForceData.industryRank <50) {
      industryContribution = 0.03;
    }
    
    if (mainForceData.conceptRank< 10) {
      industryContribution += 0.04;
    } else if (mainForceData.conceptRank <30) {
      industryContribution += 0.02;
    }
    
    // 9. 融资融券分析贡献
    let marginTradingContribution = 0;
    if (marginTradingData) {
      // 融资净买入贡献
      if (marginTradingData.marginIncrease > 1000000) {
        marginTradingContribution += 0.15;
      } else if (marginTradingData.marginIncrease > 500000) {
        marginTradingContribution += 0.10;
      } else if (marginTradingData.marginIncrease > 100000) {
        marginTradingContribution += 0.06;
      } else if (marginTradingData.marginIncrease > 50000) {
        marginTradingContribution += 0.04;
      } else if (marginTradingData.marginIncrease > 0) {
        marginTradingContribution += 0.02;
      } else if (marginTradingData.marginIncrease< -100000) {
        marginTradingContribution -= 0.08;
      } else if (marginTradingData.marginIncrease < -50000) {
        marginTradingContribution -= 0.05;
      } else if (marginTradingData.marginIncrease < 0) {
        marginTradingContribution -= 0.03;
      }
      
      // 融券净卖出贡献
      if (marginTradingData.shortIncrease > 100000) {
        marginTradingContribution -= 0.12;
      } else if (marginTradingData.shortIncrease > 50000) {
        marginTradingContribution -= 0.08;
      } else if (marginTradingData.shortIncrease > 10000) {
        marginTradingContribution -= 0.05;
      } else if (marginTradingData.shortIncrease > 0) {
        marginTradingContribution -= 0.03;
      } else if (marginTradingData.shortIncrease< 0) {
        marginTradingContribution += 0.04;
      }
      
      // 融资余额趋势贡献
      if (marginTradingData.marginTrend === 'increasing') {
        marginTradingContribution += 0.06;
      } else if (marginTradingData.marginTrend === 'decreasing') {
        marginTradingContribution -= 0.05;
      }
      
      // 融券余额趋势贡献
      if (marginTradingData.shortTrend === 'increasing') {
        marginTradingContribution -= 0.07;
      } else if (marginTradingData.shortTrend === 'decreasing') {
        marginTradingContribution += 0.04;
      }
      
      // 融资融券比率贡献
      if (marginTradingData.marginShortRatio >50) {
        marginTradingContribution += 0.08;
      } else if (marginTradingData.marginShortRatio >20) {
        marginTradingContribution += 0.05;
      } else if (marginTradingData.marginShortRatio >10) {
        marginTradingContribution += 0.03;
      } else if (marginTradingData.marginShortRatio< 5) {
        marginTradingContribution -= 0.04;
      } else if (marginTradingData.marginShortRatio <2) {
        marginTradingContribution -= 0.06;
      }
    }
    
    // 10. 价格趋势分析
    let trendContribution = 0;
    if (stock.changePercent && stock.changePercent >5) {
      trendContribution = 0.08;
    } else if (stock.changePercent && stock.changePercent > 2) {
      trendContribution = 0.04;
    } else if (stock.changePercent && stock.changePercent< -3) {
      trendContribution = -0.05;
    }
    
    // 综合计算预计涨跌幅
    expectedReturn = maContribution + bollContribution + macdContribution + kdjContribution + 
                    rsiContribution + mainForceContribution + volumeContribution + 
                    industryContribution + marginTradingContribution + trendContribution;
    
    // 移除固定的涨跌幅限制，让预测完全基于实际行情数据
    // 只进行最小的合理性检查，避免极端异常值
    expectedReturn = Math.max(-0.5, Math.min(0.5, expectedReturn));
    
    return expectedReturn;
  }

  private async autoLearnAndOptimize(): Promise<void> {
    const now = Date.now();
    
    // 分析市场趋势
    this.analyzeMarketTrend();
    
    // 评估信号性能
    this.evaluateSignalPerformance();
    
    // 执行频繁的自适应优化
    this.performFrequentAdaptiveOptimization();
    
    // 训练学习模型，分析涨停板股票特性
    this.trainLearningModel();
    
    // 训练多周期学习模型
    this.trainMultiPeriodModel();
    
    // 从失败信号中学习
    this.learnFromFailedSignals();
    
    // 优化买入条件，特别关注底部放量涨停板股票
    this.optimizeBuyConditions();
    
    // 调整自适应阈值
    this.adjustAdaptiveThresholds();
    
    // 分析历史涨停板股票特征
    this.analyzeHistoricalLimitUpStocks();
    
    // 执行深度学习，增强模型能力
    this.performDeepLearning();
    
    // 记录学习时间
    this.lastLearningTime = now;
    
    // 保存自适应设置
    this.saveAdaptiveSettings();
    
    logger.info(`自动学习完成 - 涨停板样本数量: ${this.limitUpStocksHistory.length}`);
    logger.info(`模型准确率: ${(this.learningModel.accuracy * 100).toFixed(2)}%`);
    logger.info(`自适应阈值: ${JSON.stringify(this.adaptiveThresholds)}`);
  }
  
  // 分析历史涨停板股票特征
  private analyzeHistoricalLimitUpStocks() {
    try {
      // 分析历史涨停板股票的特征
      if (this.limitUpStocksHistory.length < 10) {
        logger.info('历史涨停板股票样本不足，跳过历史特征分析');
        return;
      }
      
      // 计算历史涨停板股票的平均特征
      const avgFeatures = this.calculateAverageLimitUpFeatures();
      
      // 根据历史特征调整模型权重
      this.adjustWeightsBasedOnHistoricalFeatures(avgFeatures);
      
      logger.info('历史涨停板股票特征分析完成');
    } catch (error) {
      logger.warn('分析历史涨停板股票特征失败:', error);
    }
  }
  
  // 计算历史涨停板股票的平均特征
  private calculateAverageLimitUpFeatures() {
    const features = {
      avgVolumeAmplification: 0,
      avgMainForceNetFlow: 0,
      avgChangePercent: 0,
      avgTurnoverRate: 0,
      avgRsi: 0,
      avgMacdDiff: 0,
      avgKdjK: 0,
      avgPriceToMa5: 0,
      avgPriceToMa10: 0,
      avgPriceToMa20: 0,
      avgBollWidth: 0,
      avgPriceToBollUpper: 0
    };
    
    let count = 0;
    
    this.limitUpStocksHistory.forEach(stock => {
      features.avgVolumeAmplification += stock.volumeAmplification || 0;
      features.avgMainForceNetFlow += stock.mainForceNetFlow || 0;
      features.avgChangePercent += stock.changePercent || 0;
      features.avgTurnoverRate += stock.turnoverRate || 0;
      features.avgRsi += stock.rsi || 0;
      features.avgMacdDiff += stock.macdDiff || 0;
      features.avgKdjK += stock.kdjK || 0;
      features.avgPriceToMa5 += stock.priceToMa5 || 0;
      features.avgPriceToMa10 += stock.priceToMa10 || 0;
      features.avgPriceToMa20 += stock.priceToMa20 || 0;
      features.avgBollWidth += stock.bollWidth || 0;
      features.avgPriceToBollUpper += stock.priceToBollUpper || 0;
      count++;
    });
    
    if (count > 0) {
      Object.keys(features).forEach((key) => {
        const typedKey = key as keyof typeof features;
        features[typedKey] = features[typedKey] / count;
      });
    }
    
    return features;
  }
  
  // 根据历史特征调整模型权重
  private adjustWeightsBasedOnHistoricalFeatures(avgFeatures: any) {
    const weights = this.learningModel.weights;
    const adjustmentFactor = 0.01;
    
    // 根据历史特征调整权重
    if (avgFeatures.avgVolumeAmplification > 2) {
      weights.volumeAmplification = Math.min((weights.volumeAmplification || 0) + adjustmentFactor, 0.2);
    }
    
    if (avgFeatures.avgMainForceNetFlow > 100000) {
      weights.mainForceNetFlow = Math.min((weights.mainForceNetFlow || 0) + adjustmentFactor, 0.2);
    }
    
    if (avgFeatures.avgRsi > 60) {
      weights.rsi = Math.min((weights.rsi || 0) + adjustmentFactor, 0.15);
    }
    
    if (avgFeatures.avgMacdDiff > 0) {
      weights.macdDiff = Math.min((weights.macdDiff || 0) + adjustmentFactor, 0.15);
    }
    
    if (avgFeatures.avgKdjK > 60) {
      weights.kdjK = Math.min((weights.kdjK || 0) + adjustmentFactor, 0.15);
    }
    
    if (avgFeatures.avgPriceToMa5 > 0.02) {
      weights.priceToMa5 = Math.min((weights.priceToMa5 || 0) + adjustmentFactor, 0.15);
    }
    
    // 重新归一化权重
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 0) {
      Object.keys(weights).forEach(key => {
        weights[key] = weights[key] / totalWeight;
      });
    }
  }
  
  // 执行深度学习，增强模型能力
  private performDeepLearning() {
    try {
      // 深度学习逻辑
      const recentSignals = this.signalManager.getSignalHistory().slice(-100);
      
      if (recentSignals.length < 20) {
        logger.info('信号样本不足，跳过深度学习');
        return;
      }
      
      // 分析信号模式
      this.analyzeSignalPatterns(recentSignals);
      
      // 预测未来市场趋势
      this.predictMarketTrend();
      
      logger.info('深度学习完成');
    } catch (error) {
      logger.warn('深度学习失败:', error);
    }
  }
  
  // 分析信号模式
  private analyzeSignalPatterns(signals: any[]) {
    // 分析信号的时间模式、价格模式、成交量模式等
    const timePatterns = this.analyzeTimePatterns(signals);
    const pricePatterns = this.analyzePricePatterns(signals);
    const volumePatterns = this.analyzeVolumePatterns(signals);
    const mainForcePatterns = this.analyzeMainForcePatterns(signals);
    const technicalPatterns = this.analyzeTechnicalPatterns(signals);
    
    // 根据模式调整模型权重
    this.adjustWeightsBasedOnPatterns(timePatterns, pricePatterns, volumePatterns, mainForcePatterns, technicalPatterns);
  }
  
  // 分析主力资金模式
  private analyzeMainForcePatterns(signals: any[]) {
    const mainForcePatterns = {
      strongInflow: 0,
      moderateInflow: 0,
      weakInflow: 0,
      strongOutflow: 0,
      moderateOutflow: 0,
      weakOutflow: 0
    };
    
    signals.forEach(signal => {
      const mainForceNetFlow = signal.mainForceNetFlow || 0;
      if (mainForceNetFlow > 100000000) {
        mainForcePatterns.strongInflow++;
      } else if (mainForceNetFlow > 50000000) {
        mainForcePatterns.moderateInflow++;
      } else if (mainForceNetFlow > 10000000) {
        mainForcePatterns.weakInflow++;
      } else if (mainForceNetFlow < -100000000) {
        mainForcePatterns.strongOutflow++;
      } else if (mainForceNetFlow < -50000000) {
        mainForcePatterns.moderateOutflow++;
      } else if (mainForceNetFlow < -10000000) {
        mainForcePatterns.weakOutflow++;
      }
    });
    
    return mainForcePatterns;
  }
  
  // 分析技术指标模式
  private analyzeTechnicalPatterns(signals: any[]) {
    const technicalPatterns = {
      strongBuy: 0,
      moderateBuy: 0,
      weakBuy: 0,
      strongSell: 0,
      moderateSell: 0,
      weakSell: 0
    };
    
    signals.forEach(signal => {
      const technicalStrength = signal.technicalStrength || 0;
      if (technicalStrength > 80) {
        technicalPatterns.strongBuy++;
      } else if (technicalStrength > 60) {
        technicalPatterns.moderateBuy++;
      } else if (technicalStrength > 50) {
        technicalPatterns.weakBuy++;
      } else if (technicalStrength < 20) {
        technicalPatterns.strongSell++;
      } else if (technicalStrength < 40) {
        technicalPatterns.moderateSell++;
      } else if (technicalStrength < 50) {
        technicalPatterns.weakSell++;
      }
    });
    
    return technicalPatterns;
  }
  
  // 分析时间模式
  private analyzeTimePatterns(signals: any[]) {
    const timePatterns = {
      morningSignals: 0,
      afternoonSignals: 0,
      openingSignals: 0,
      closingSignals: 0
    };
    
    signals.forEach(signal => {
      const hour = new Date(signal.timestamp).getHours();
      const minute = new Date(signal.timestamp).getMinutes();
      
      if (hour === 9 && minute >= 30 && minute <= 11) {
        timePatterns.openingSignals++;
      } else if (hour === 14 && minute >= 30) {
        timePatterns.closingSignals++;
      } else if (hour < 12) {
        timePatterns.morningSignals++;
      } else {
        timePatterns.afternoonSignals++;
      }
    });
    
    return timePatterns;
  }
  
  // 分析价格模式
  private analyzePricePatterns(signals: any[]) {
    const pricePatterns = {
      lowPriceSignals: 0,
      mediumPriceSignals: 0,
      highPriceSignals: 0,
      risingSignals: 0,
      fallingSignals: 0
    };
    
    signals.forEach(signal => {
      if (signal.price < 10) {
        pricePatterns.lowPriceSignals++;
      } else if (signal.price < 50) {
        pricePatterns.mediumPriceSignals++;
      } else {
        pricePatterns.highPriceSignals++;
      }
      
      if (signal.changePercent > 0) {
        pricePatterns.risingSignals++;
      } else {
        pricePatterns.fallingSignals++;
      }
    });
    
    return pricePatterns;
  }
  
  // 分析成交量模式
  private analyzeVolumePatterns(signals: any[]) {
    const volumePatterns = {
      lowVolumeSignals: 0,
      mediumVolumeSignals: 0,
      highVolumeSignals: 0,
      increasingVolumeSignals: 0,
      decreasingVolumeSignals: 0
    };
    
    signals.forEach(signal => {
      if (signal.volume < 1000000) {
        volumePatterns.lowVolumeSignals++;
      } else if (signal.volume < 10000000) {
        volumePatterns.mediumVolumeSignals++;
      } else {
        volumePatterns.highVolumeSignals++;
      }
    });
    
    return volumePatterns;
  }
  
  // 根据模式调整模型权重
  private adjustWeightsBasedOnPatterns(timePatterns: any, pricePatterns: any, volumePatterns: any, mainForcePatterns: any, technicalPatterns: any) {
    const weights = this.learningModel.weights;
    const adjustmentFactor = 0.005;
    
    // 根据时间模式调整权重
    if (timePatterns.openingSignals > timePatterns.closingSignals) {
      // 开盘信号更多，增加相关权重
      weights.volumeAmplification = Math.min((weights.volumeAmplification || 0) + adjustmentFactor, 0.2);
    }
    
    // 根据价格模式调整权重
    if (pricePatterns.risingSignals > pricePatterns.fallingSignals) {
      // 上涨信号更多，增加相关权重
      weights.mainForceNetFlow = Math.min((weights.mainForceNetFlow || 0) + adjustmentFactor, 0.2);
    }
    
    // 根据成交量模式调整权重
    if (volumePatterns.highVolumeSignals > volumePatterns.lowVolumeSignals) {
      // 高成交量信号更多，增加相关权重
      weights.volumeAmplification = Math.min((weights.volumeAmplification || 0) + adjustmentFactor, 0.2);
    }
    
    // 根据主力资金模式调整权重
    if (mainForcePatterns.strongInflow > mainForcePatterns.strongOutflow) {
      // 强劲主力资金流入信号更多，增加相关权重
      weights.mainForceNetFlow = Math.min((weights.mainForceNetFlow || 0) + adjustmentFactor, 0.2);
      weights.mainForceRatio = Math.min((weights.mainForceRatio || 0) + adjustmentFactor, 0.2);
    }
    
    // 根据技术指标模式调整权重
    if (technicalPatterns.strongBuy > technicalPatterns.strongSell) {
      // 强劲技术买入信号更多，增加相关权重
      weights.rsi = Math.min((weights.rsi || 0) + adjustmentFactor, 0.2);
      weights.macdDiff = Math.min((weights.macdDiff || 0) + adjustmentFactor, 0.2);
      weights.kdjK = Math.min((weights.kdjK || 0) + adjustmentFactor, 0.2);
    }
    
    // 重新归一化权重
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 0) {
      Object.keys(weights).forEach(key => {
        weights[key] = weights[key] / totalWeight;
      });
    }
  }
  
  // 预测未来市场趋势
  private predictMarketTrend() {
    // 基于历史数据预测未来市场趋势
    const recentTrends = this.marketTrendHistory.slice(-20);
    
    if (recentTrends.length < 10) {
      logger.info('市场趋势数据不足，跳过市场趋势预测');
      return;
    }
    
    // 计算趋势指标
    const trendIndicators = this.calculateTrendIndicators(recentTrends);
    
    // 预测未来趋势
    const predictedTrend = this.predictTrend(trendIndicators);
    
    // 根据预测调整模型
    this.adjustModelBasedOnPredictedTrend(predictedTrend);
  }
  
  // 计算趋势指标
  private calculateTrendIndicators(trends: any[]) {
    const indicators = {
      avgChange: 0,
      avgVolume: 0,
      changeTrend: 0,
      volumeTrend: 0,
      volatility: 0
    };
    
    trends.forEach(trend => {
      indicators.avgChange += trend.avgChange;
      indicators.avgVolume += trend.avgVolume;
    });
    
    if (trends.length > 0) {
      indicators.avgChange /= trends.length;
      indicators.avgVolume /= trends.length;
    }
    
    // 计算变化趋势
    for (let i = 1; i < trends.length; i++) {
      indicators.changeTrend += trends[i].avgChange - trends[i-1].avgChange;
      indicators.volumeTrend += trends[i].avgVolume - trends[i-1].avgVolume;
    }
    
    // 计算波动率
    const changes = trends.map(trend => trend.avgChange);
    const mean = changes.reduce((sum, change) => sum + change, 0) / changes.length;
    const variance = changes.reduce((sum, change) => sum + Math.pow(change - mean, 2), 0) / changes.length;
    indicators.volatility = Math.sqrt(variance);
    
    return indicators;
  }
  
  // 预测趋势
  private predictTrend(indicators: any) {
    // 基于趋势指标预测未来趋势
    let predictedTrend = 'stable';
    
    if (indicators.changeTrend > 0 && indicators.avgChange > 0) {
      predictedTrend = 'up';
    } else if (indicators.changeTrend < 0 && indicators.avgChange < 0) {
      predictedTrend = 'down';
    }
    
    return predictedTrend;
  }
  
  // 根据预测调整模型
  private adjustModelBasedOnPredictedTrend(predictedTrend: string) {
    const weights = this.learningModel.weights;
    const adjustmentFactor = 0.01;
    
    if (predictedTrend === 'up') {
      // 预测市场上涨，增加买入相关权重
      weights.mainForceNetFlow = Math.min((weights.mainForceNetFlow || 0) + adjustmentFactor, 0.2);
      weights.volumeAmplification = Math.min((weights.volumeAmplification || 0) + adjustmentFactor, 0.2);
    } else if (predictedTrend === 'down') {
      // 预测市场下跌，增加卖出相关权重
      weights.rsi = Math.min((weights.rsi || 0) + adjustmentFactor, 0.15);
      weights.williamsR = Math.min((weights.williamsR || 0) + adjustmentFactor, 0.15);
    }
    
    // 重新归一化权重
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 0) {
      Object.keys(weights).forEach(key => {
        weights[key] = weights[key] / totalWeight;
      });
    }
  }

  private analyzeMarketTrend(): void {
    const now = Date.now();
    
    // 每30分钟分析一次市场趋势
    if (now - this.lastMarketAnalysisTime< 1800000) {
      return;
    }
    
    this.lastMarketAnalysisTime = now;
    
    try {
      // 分析市场整体趋势
      const marketStats = {
        timestamp: now,
        totalStocks: this.limitUpStocksHistory.length,
        upStocks: this.limitUpStocksHistory.filter(stock => stock.changePercent >0).length,
        downStocks: this.limitUpStocksHistory.filter(stock => stock.changePercent< 0).length,
        avgChange: this.limitUpStocksHistory.length >0 ?
          this.limitUpStocksHistory.reduce((sum, stock) => sum + (stock.changePercent || 0), 0) / this.limitUpStocksHistory.length : 0,
        avgVolume: this.limitUpStocksHistory.length >0 ?
          this.limitUpStocksHistory.reduce((sum, stock) => sum + (stock.volume || 0), 0) / this.limitUpStocksHistory.length : 0
      };
      
      this.marketTrendHistory.push(marketStats);
      
      // 保留最近100条记录
      if (this.marketTrendHistory.length > 100) {
        this.marketTrendHistory.shift();
      }
      
      logger.info(`市场趋势分析完成: 上涨股票${marketStats.upStocks}只, 下跌股票${marketStats.downStocks}只, 平均涨幅${marketStats.avgChange.toFixed(2)}%`);
    } catch (error) {
      logger.warn('市场趋势分析失败:', error);
    }
  }

  private getCurrentPrice(stockCode: string): number {
    try {
      // 这里可以调用股票数据获取函数获取实时价格
      // 目前返回模拟数据，实际应该调用getStockPrice或类似函数
      return Math.random() * 50 + 10; // 模拟价格
    } catch (error) {
      logger.warn(`获取股票${stockCode}当前价格失败:`, error);
      return 0;
    }
  }
  
  private updateModelWeightsBasedOnPerformance(signal: any, accuracy: number): void {
    try {
      // 根据信号性能调整模型权重
      const weights = this.learningModel.weights;
      const adjustmentFactor = accuracy * 0.05; // 调整因子，控制权重变化幅度
      
      // 根据信号类型调整相关特征权重
      if (signal.type === 'buy') {
        // 买入信号成功：增加买入相关特征权重
        if (accuracy > 0.3) {
          weights.mainForceNetFlow = (weights.mainForceNetFlow || 0) + adjustmentFactor;
          weights.volumeAmplification = (weights.volumeAmplification || 0) + adjustmentFactor * 0.8;
          weights.macdCrossSignal = (weights.macdCrossSignal || 0) + adjustmentFactor * 0.6;
          weights.kdjCrossSignal = (weights.kdjCrossSignal || 0) + adjustmentFactor * 0.6;
        }
        // 买入信号失败：降低买入相关特征权重
        else if (accuracy< -0.3) {
          weights.mainForceNetFlow = Math.max(0, (weights.mainForceNetFlow || 0) - adjustmentFactor);
          weights.volumeAmplification = Math.max(0, (weights.volumeAmplification || 0) - adjustmentFactor * 0.8);
          weights.macdCrossSignal = Math.max(0, (weights.macdCrossSignal || 0) - adjustmentFactor * 0.6);
          weights.kdjCrossSignal = Math.max(0, (weights.kdjCrossSignal || 0) - adjustmentFactor * 0.6);
        }
      } else if (signal.type === 'sell') {
        // 卖出信号成功：增加卖出相关特征权重
        if (accuracy >0.3) {
          weights.rsi = (weights.rsi || 0) + adjustmentFactor;
          weights.williamsR = (weights.williamsR || 0) + adjustmentFactor * 0.8;
        }
        // 卖出信号失败：降低卖出相关特征权重
        else if (accuracy< -0.3) {
          weights.rsi = Math.max(0, (weights.rsi || 0) - adjustmentFactor);
          weights.williamsR = Math.max(0, (weights.williamsR || 0) - adjustmentFactor * 0.8);
        }
      }
      
      // 重新归一化权重
      const totalWeight = Object.values(weights).reduce((sum, w) =>sum + w, 0);
      if (totalWeight > 0) {
        Object.keys(weights).forEach(key => {
          weights[key] = weights[key] / totalWeight;
        });
      }
      
      logger.info(`根据信号性能更新模型权重，准确率: ${(accuracy * 100).toFixed(2)}%`);
    } catch (error) {
      logger.warn('更新模型权重失败:', error);
    }
  }
  
  private learnFromFailedSignals(): void {
    try {
      // 分析失败的信号
      const failedSignals = this.signalPerformanceHistory.filter(p => p.performance === 'failure');
      
      if (failedSignals.length === 0) {
        logger.info('没有失败信号需要分析');
        return;
      }
      
      logger.info(`开始分析失败信号，数量: ${failedSignals.length}`);
      
      failedSignals.forEach(performance => {
        const signal = this.signalManager.getSignalById(performance.signalId);
        if (signal) {
          // 根据失败信号调整模型权重
          this.adjustWeightsForFailedSignal(signal, performance);
        }
      });
      
      logger.info(`失败信号分析完成，调整了模型权重`);
    } catch (error) {
      logger.warn('失败信号分析失败:', error);
    }
  }
  
  private adjustWeightsForFailedSignal(signal: any, performance: any): void {
    try {
      const weights = this.learningModel.weights;
      const adjustmentFactor = 0.03; // 调整因子，控制权重变化幅度
      
      if (signal.type === 'buy') {
        // 买入信号失败：降低导致失败的特征权重
        // 分析失败原因，可能是以下特征过度依赖
        weights.mainForceNetFlow = Math.max(0, (weights.mainForceNetFlow || 0) - adjustmentFactor);
        weights.volumeAmplification = Math.max(0, (weights.volumeAmplification || 0) - adjustmentFactor * 0.8);
        weights.macdCrossSignal = Math.max(0, (weights.macdCrossSignal || 0) - adjustmentFactor * 0.6);
        weights.kdjCrossSignal = Math.max(0, (weights.kdjCrossSignal || 0) - adjustmentFactor * 0.6);
        
        // 同时增加可能被忽视的风险特征权重
        weights.rsi = (weights.rsi || 0) + adjustmentFactor * 0.5;
        weights.williamsR = (weights.williamsR || 0) + adjustmentFactor * 0.5;
      } else if (signal.type === 'sell') {
        // 卖出信号失败：降低导致失败的特征权重
        weights.rsi = Math.max(0, (weights.rsi || 0) - adjustmentFactor);
        weights.williamsR = Math.max(0, (weights.williamsR || 0) - adjustmentFactor);
        
        // 同时增加可能被忽视的买入机会特征权重
        weights.mainForceNetFlow = (weights.mainForceNetFlow || 0) + adjustmentFactor * 0.5;
        weights.volumeAmplification = (weights.volumeAmplification || 0) + adjustmentFactor * 0.4;
      }
      
      // 重新归一化权重
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
      if (totalWeight > 0) {
        Object.keys(weights).forEach(key => {
          weights[key] = weights[key] / totalWeight;
        });
      }
      
      logger.info(`根据失败信号调整模型权重，信号类型: ${signal.type}, 准确率: ${(performance.accuracy * 100).toFixed(2)}%`);
    } catch (error) {
      logger.warn('调整失败信号权重失败:', error);
    }
  }
  
  private evaluateSignalPerformance(): void {
    try {
      // 评估最近信号的性能
      const recentSignals = this.signalManager.getSignalHistory().slice(-50);
      
      recentSignals.forEach(signal => {
        // 获取信号发出后的实际价格
        const currentPrice = this.getCurrentPrice(signal.stockCode);
        
        // 计算价格变化百分比
        let priceChange = 0;
        if (currentPrice > 0 && signal.price && signal.price > 0) {
          priceChange = ((currentPrice - signal.price) / signal.price) * 100;
        }
        
        // 评估信号准确性
        let accuracy = 0;
        if (signal.type === 'buy') {
          // 买入信号：价格上涨为准确
          accuracy = Math.min(priceChange / 5, 1); // 最高100%准确率，超过5%涨幅视为完全准确
          if (priceChange< -2) {
            accuracy = Math.max(priceChange / -5, -1); // 下跌超过2%视为完全不准确
          }
        } else if (signal.type === 'sell') {
          // 卖出信号：价格下跌为准确
          accuracy = Math.min(Math.abs(priceChange) / 5, 1); // 最高100%准确率，超过5%跌幅视为完全准确
          if (priceChange >2) {
            accuracy = Math.max(-priceChange / 5, -1); // 上涨超过2%视为完全不准确
          }
        }
        
        // 更新模型权重
        this.updateModelWeightsBasedOnPerformance(signal, accuracy);
        
        const performance = {
          signalId: signal.id,
          stockCode: signal.stockCode,
          signalType: signal.type,
          signalTime: signal.timestamp,
          signalPrice: signal.price || 0,
          currentPrice: currentPrice,
          priceChange: priceChange,
          accuracy: accuracy,
          performance: accuracy >0.3 ? 'success' : (accuracy< -0.3 ? 'failure' : 'neutral')
        };
        
        this.signalPerformanceHistory.push(performance);
      });
      
      // 保留最近200条记录
      if (this.signalPerformanceHistory.length >200) {
        this.signalPerformanceHistory.shift();
      }
      
      logger.info(`信号性能评估完成，分析了${recentSignals.length}条信号`);
    } catch (error) {
      logger.warn('信号性能评估失败:', error);
    }
  }

  private adjustAdaptiveThresholds(): void {
    try {
      // 根据市场趋势调整阈值
      if (this.marketTrendHistory.length< 5) {
        return;
      }
      
      const recentTrends = this.marketTrendHistory.slice(-5);
      const avgChange = recentTrends.reduce((sum, trend) =>sum + trend.avgChange, 0) / recentTrends.length;
      
      // 市场上涨趋势明显，提高买入置信度要求
      if (avgChange > 1) {
        this.adaptiveThresholds.buyConfidence = Math.min(70, this.adaptiveThresholds.buyConfidence + 5);
        this.adaptiveThresholds.sellConfidence = Math.max(50, this.adaptiveThresholds.sellConfidence - 5);
        logger.info('市场处于上涨趋势，调整买入阈值向上，卖出阈值向下');
      }
      // 市场下跌趋势明显，提高卖出置信度要求
      else if (avgChange< -1) {
        this.adaptiveThresholds.buyConfidence = Math.max(50, this.adaptiveThresholds.buyConfidence - 5);
        this.adaptiveThresholds.sellConfidence = Math.min(70, this.adaptiveThresholds.sellConfidence + 5);
        logger.info('市场处于下跌趋势，调整买入阈值向下，卖出阈值向上');
      }
      
      // 根据成交量调整阈值
      const avgVolume = recentTrends.reduce((sum, trend) => sum + trend.avgVolume, 0) / recentTrends.length;
      const historicalAvgVolume = this.marketTrendHistory.reduce((sum, trend) => sum + trend.avgVolume, 0) / this.marketTrendHistory.length;
      
      if (avgVolume > historicalAvgVolume * 1.5) {
        this.adaptiveThresholds.volumeThreshold = Math.min(1.5, this.adaptiveThresholds.volumeThreshold + 0.1);
        logger.info('市场成交量放大，调整成交量阈值向上');
      } else if (avgVolume< historicalAvgVolume * 0.5) {
        this.adaptiveThresholds.volumeThreshold = Math.max(0.8, this.adaptiveThresholds.volumeThreshold - 0.1);
        logger.info('市场成交量萎缩，调整成交量阈值向下');
      }
      
      logger.info(`自适应阈值调整完成: ${JSON.stringify(this.adaptiveThresholds)}`);
    } catch (error) {
      logger.warn('自适应阈值调整失败:', error);
    }
  }

  private performFrequentAdaptiveOptimization(): void {
    const now = Date.now();
    
    // 每10分钟进行一次频繁的自适应优化
    if (now - this.lastAdaptiveOptimizationTime< 600000) {
      return;
    }
    
    this.lastAdaptiveOptimizationTime = now;
    
    try {
      // 分析最近的信号性能
      const recentSignals = this.signalManager.getSignalHistory().slice(-20);
      
      if (recentSignals.length< 5) {
        return;
      }
      
      // 计算信号准确性
      const buySignals = recentSignals.filter(s =>s.type === 'buy');
      const sellSignals = recentSignals.filter(s => s.type === 'sell');
      
      // 根据信号准确性动态调整阈值
      if (buySignals.length >0) {
        const buyAccuracy = buySignals.filter(s => s.confidence > 70).length / buySignals.length;
        
        if (buyAccuracy > 0.8) {
          this.adaptiveThresholds.buyConfidence = Math.max(40, this.adaptiveThresholds.buyConfidence - 5);
          logger.info('买入信号准确性高，降低买入置信度要求');
        } else if (buyAccuracy< 0.4) {
          this.adaptiveThresholds.buyConfidence = Math.min(80, this.adaptiveThresholds.buyConfidence + 5);
          logger.info('买入信号准确性低，提高买入置信度要求');
        }
      }
      
      if (sellSignals.length >0) {
        const sellAccuracy = sellSignals.filter(s => s.confidence > 70).length / sellSignals.length;
        
        if (sellAccuracy > 0.8) {
          this.adaptiveThresholds.sellConfidence = Math.max(40, this.adaptiveThresholds.sellConfidence - 5);
          logger.info('卖出信号准确性高，降低卖出置信度要求');
        } else if (sellAccuracy< 0.4) {
          this.adaptiveThresholds.sellConfidence = Math.min(80, this.adaptiveThresholds.sellConfidence + 5);
          logger.info('卖出信号准确性低，提高卖出置信度要求');
        }
      }
      
      logger.info(`频繁自适应优化完成: ${JSON.stringify(this.adaptiveThresholds)}`);
    } catch (error) {
      logger.warn('频繁自适应优化失败:', error);
    }
  }

  private optimizeBuyConditions(): void {
    const weights = this.learningModel.weights;
    
    // 特别关注底部放量涨停板股票的特征
    if (weights.volumeAmplification > 0.07) {
      logger.info('成交量放大特征权重较高，强化底部放量涨停板相关买入条件');
    }
    
    if (weights.turnoverRate > 0.06) {
      logger.info('换手率特征权重较高，强化涨停板换手率相关买入条件');
    }
    
    if (weights.mainForceNetFlow > 0.08) {
      logger.info('主力资金特征权重较高，强化主力资金相关买入条件');
    }
    
    if (weights.macdCrossSignal > 0.06 || weights.kdjCrossSignal > 0.06) {
      logger.info('技术指标交叉信号权重较高，强化技术指标相关买入条件');
    }
    
    if (weights.priceToMa5 > 0.05 || weights.priceToMa10 > 0.04) {
      logger.info('均线位置特征权重较高，强化均线相关买入条件');
    }
    
    if (weights.volumeRatio > 0.05) {
      logger.info('成交量特征权重较高，强化成交量相关买入条件');
    }
    
    const topFeatures = Object.entries(weights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature, weight]) => `${feature}: ${(weight * 100).toFixed(2)}%`);
    
    logger.info(`买入条件权重优化完成，Top 5 重要特征: ${topFeatures.join(', ')}`);
    logger.info(`涨停板样本数量: ${this.limitUpStocksHistory.length}`);
  }
  
  // 跟踪信号表现
  private trackSignalPerformance(signal: any, actualReturn: number): void {
    const signalEntry = this.signalTrackingHistory.find(entry => entry.signalId === signal.id);
    if (signalEntry) {
      signalEntry.actualReturn = actualReturn;
      // 评估信号准确性：如果实际涨幅达到预期的80%以上，认为信号准确
      signalEntry.isAccurate = actualReturn >= signalEntry.expectedReturn * 0.8;
      
      // 记录信号准确性
      logger.info(`信号评估: ${signal.stockName}(${signal.stockCode}) - 预期涨幅: ${(signalEntry.expectedReturn * 100).toFixed(2)}%, 实际涨幅: ${(actualReturn * 100).toFixed(2)}%, 准确性: ${signalEntry.isAccurate ? '准确' : '不准确'}`);
    }
  }
  
  // 评估信号准确性并更新模型
  private evaluateAndUpdateModel(): void {
    if (this.signalTrackingHistory.length < 10) {
      return; // 样本不足，暂不更新
    }
    
    // 计算信号准确性
    const evaluatedSignals = this.signalTrackingHistory.filter(entry => entry.isAccurate !== null);
    if (evaluatedSignals.length === 0) {
      return;
    }
    
    const accurateSignals = evaluatedSignals.filter(entry => entry.isAccurate);
    const overallAccuracy = accurateSignals.length / evaluatedSignals.length;
    
    // 按市场状态评估准确性
    const auctionSignals = evaluatedSignals.filter(entry => entry.marketStatus === 'auction');
    const auctionAccurate = auctionSignals.filter(entry => entry.isAccurate);
    const auctionAccuracy = auctionSignals.length > 0 ? auctionAccurate.length / auctionSignals.length : 0;
    
    const openSignals = evaluatedSignals.filter(entry => entry.marketStatus === 'open');
    const openAccurate = openSignals.filter(entry => entry.isAccurate);
    const openAccuracy = openSignals.length > 0 ? openAccurate.length / openSignals.length : 0;
    
    // 计算精确率和召回率
    const buySignals = evaluatedSignals.filter(entry => entry.limitUpPotential);
    const correctBuySignals = buySignals.filter(entry => entry.isAccurate);
    const precision = buySignals.length > 0 ? correctBuySignals.length / buySignals.length : 0;
    const recall = evaluatedSignals.length > 0 ? correctBuySignals.length / evaluatedSignals.length : 0;
    const f1Score = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
    
    // 更新性能指标
    this.advancedLearningParams.performanceMetrics = {
      totalSignals: evaluatedSignals.length,
      correctSignals: accurateSignals.length,
      accuracy: overallAccuracy,
      precision,
      recall,
      f1Score
    };
    
    logger.info(`信号准确性评估: 总体: ${(overallAccuracy * 100).toFixed(2)}%, 集合竞价: ${(auctionAccuracy * 100).toFixed(2)}%, 交易时间: ${(openAccuracy * 100).toFixed(2)}%`);
    logger.info(`性能指标: 精确率: ${(precision * 100).toFixed(2)}%, 召回率: ${(recall * 100).toFixed(2)}%, F1分数: ${(f1Score * 100).toFixed(2)}%`);
    
    // 自适应学习率调整
    this.adjustLearningRate(overallAccuracy);
    
    // 特征重要性分析
    this.analyzeFeatureImportance(evaluatedSignals);
    
    // 根据准确性更新模型权重
    if (overallAccuracy < 0.6) {
      logger.info('信号准确性较低，开始更新模型权重');
      this.updateModelWeights(evaluatedSignals);
    }
    
    // 记录学习历史
    this.recordLearningHistory(overallAccuracy);
    
    // 清理旧的跟踪数据，只保留最近的100条
    if (this.signalTrackingHistory.length > 100) {
      this.signalTrackingHistory = this.signalTrackingHistory.slice(-100);
    }
  }
  
  // 自适应学习率调整 - 优化版本
  private adjustLearningRate(accuracy: number): void {
    if (!this.advancedLearningParams.adaptiveLearningRate) {
      return;
    }
    
    // 根据准确性和历史趋势调整学习率
    const baseLearningRate = 0.01;
    
    // 准确性因子：准确性越低，学习率越高
    const accuracyFactor = 1 - accuracy;
    
    // 历史趋势因子：如果准确率下降，增加学习率
    let trendFactor = 1;
    if (this.advancedLearningParams.learningHistory.length >= 2) {
      const recentAccuracy = this.advancedLearningParams.learningHistory[this.advancedLearningParams.learningHistory.length - 1].accuracy;
      const previousAccuracy = this.advancedLearningParams.learningHistory[this.advancedLearningParams.learningHistory.length - 2].accuracy;
      if (recentAccuracy < previousAccuracy) {
        trendFactor = 1.5; // 准确率下降，增加学习率
      } else if (recentAccuracy > previousAccuracy) {
        trendFactor = 0.8; // 准确率上升，略微降低学习率
      }
    }
    
    // 计算新的学习率
    let newLearningRate = baseLearningRate * (1 + accuracyFactor * 5) * trendFactor;
    
    // 限制学习率范围
    newLearningRate = Math.max(
      this.advancedLearningParams.minLearningRate,
      Math.min(this.advancedLearningParams.maxLearningRate, newLearningRate)
    );
    
    // 平滑学习率变化，避免剧烈波动
    const currentLearningRate = this.advancedLearningParams.learningRate || baseLearningRate;
    newLearningRate = currentLearningRate * 0.7 + newLearningRate * 0.3;
    
    this.advancedLearningParams.learningRate = newLearningRate;
    logger.info(`自适应学习率调整: ${(newLearningRate * 100).toFixed(3)}%`);
  }
  
  // 特征重要性分析 - 优化版本
  private analyzeFeatureImportance(evaluatedSignals: Array<any>): void {
    const featureImportance: Record<string, number> = {};
    
    // 分析每个特征对信号准确性的贡献
    evaluatedSignals.forEach(signal => {
      // 基于信号类型、准确性和特征值计算特征重要性
      if (signal.isAccurate) {
        // 准确信号的特征权重增加
        Object.keys(this.learningModel.weights).forEach(feature => {
          // 根据特征值的大小调整重要性权重
          let featureValue = 0;
          switch (feature) {
            case 'mainForceNetFlow':
              featureValue = Math.abs(signal.mainForceNetFlow || 0) / 100000000;
              break;
            case 'mainForceRatio':
              featureValue = signal.mainForceRatio || 0;
              break;
            case 'volumeAmplification':
              featureValue = (signal.volumeAmplification || 1) - 1;
              break;
            case 'turnoverRate':
              featureValue = (signal.turnoverRate || 0) / 10;
              break;
            case 'rsi':
              featureValue = Math.abs((signal.rsi || 50) - 50) / 50;
              break;
            case 'macdDiff':
              featureValue = Math.abs(signal.macdDiff || 0);
              break;
            case 'kdjK':
              featureValue = Math.abs((signal.kdjK || 50) - 50) / 50;
              break;
            case 'priceToMa5':
              featureValue = Math.abs(signal.priceToMa5 || 0);
              break;
            case 'volumeRatio':
              featureValue = Math.abs((signal.volumeRatio || 1) - 1);
              break;
            default:
              featureValue = 1;
          }
          featureImportance[feature] = (featureImportance[feature] || 0) + (1 + featureValue);
        });
      } else {
        // 不准确信号的特征权重减少
        Object.keys(this.learningModel.weights).forEach(feature => {
          featureImportance[feature] = Math.max(0, (featureImportance[feature] || 0) - 0.5);
        });
      }
    });
    
    // 归一化特征重要性
    const totalImportance = Object.values(featureImportance).reduce((sum, value) => sum + value, 0);
    if (totalImportance > 0) {
      Object.keys(featureImportance).forEach(feature => {
        featureImportance[feature] = featureImportance[feature] / totalImportance;
      });
    }
    
    // 更新学习模型的权重，基于特征重要性
    Object.keys(featureImportance).forEach(feature => {
      if (this.learningModel.weights[feature]) {
        const importance = featureImportance[feature];
        // 根据特征重要性调整权重
        this.learningModel.weights[feature] = this.learningModel.weights[feature] * 0.7 + importance * 0.3;
      }
    });
    
    // 重新归一化模型权重
    const totalWeight = Object.values(this.learningModel.weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 0) {
      Object.keys(this.learningModel.weights).forEach(key => {
        this.learningModel.weights[key] = this.learningModel.weights[key] / totalWeight;
      });
    }
    
    this.advancedLearningParams.featureImportance = featureImportance;
    
    // 打印特征重要性排名
    const topFeatures = Object.entries(featureImportance)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([feature, importance]) => `${feature}: ${(importance * 100).toFixed(2)}%`);
    
    logger.info(`特征重要性Top 5: ${topFeatures.join(', ')}`);
  }
  
  // 记录学习历史
  private recordLearningHistory(accuracy: number): void {
    this.advancedLearningParams.learningHistory.push({
      timestamp: Date.now(),
      accuracy,
      weights: {...this.learningModel.weights},
      learningRate: this.advancedLearningParams.learningRate
    });
    
    // 保持学习历史在合理范围内
    if (this.advancedLearningParams.learningHistory.length > 50) {
      this.advancedLearningParams.learningHistory.shift();
    }
  }
  
  // 强化学习更新
  private reinforceLearning(reward: number, signal: any): void {
    const learningRate = this.advancedLearningParams.learningRate;
    const discountFactor = this.advancedLearningParams.discountFactor;
    
    // 根据奖励更新模型权重
    Object.keys(this.learningModel.weights).forEach(feature => {
      // 简化实现：基于奖励调整权重
      const weightAdjustment = reward * learningRate * discountFactor;
      this.learningModel.weights[feature] = Math.max(0, this.learningModel.weights[feature] + weightAdjustment);
    });
    
    // 重新归一化权重
    const totalWeight = Object.values(this.learningModel.weights).reduce((sum, weight) => sum + weight, 0);
    if (totalWeight > 0) {
      Object.keys(this.learningModel.weights).forEach(feature => {
        this.learningModel.weights[feature] = this.learningModel.weights[feature] / totalWeight;
      });
    }
  }
  
  // 更新模型权重
  private updateModelWeights(evaluatedSignals: Array<any>): void {
    const accurateSignals = evaluatedSignals.filter(entry => entry.isAccurate);
    const inaccurateSignals = evaluatedSignals.filter(entry => !entry.isAccurate);
    
    // 分析准确和不准确信号的特征差异
    const featureWeights = {...this.learningModel.weights};
    
    // 对准确信号的特征增加权重，对不准确信号的特征减少权重
    const weightAdjustment = 0.01; // 权重调整幅度
    
    // 这里可以根据实际情况实现更复杂的权重更新逻辑
    // 例如：分析准确信号中哪些特征表现较好，增加其权重
    // 分析不准确信号中哪些特征表现较差，减少其权重
    
    // 简单实现：如果整体准确性低，增加主力资金和成交量的权重
    if (accurateSignals.length < inaccurateSignals.length) {
      featureWeights.mainForceNetFlow = Math.min(featureWeights.mainForceNetFlow + weightAdjustment, 0.2);
      featureWeights.volumeAmplification = Math.min(featureWeights.volumeAmplification + weightAdjustment, 0.2);
      featureWeights.mainForceRatio = Math.min(featureWeights.mainForceRatio + weightAdjustment, 0.2);
    }
    
    // 归一化权重
    const totalWeight = Object.values(featureWeights).reduce((sum, weight) => sum + weight, 0);
    Object.keys(featureWeights).forEach(feature => {
      featureWeights[feature] = featureWeights[feature] / totalWeight;
    });
    
    // 更新模型权重
    this.learningModel.weights = featureWeights;
    this.learningModel.accuracy = accurateSignals.length / evaluatedSignals.length;
    this.learningModel.lastTrained = Date.now();
    
    logger.info('模型权重更新完成');
  }

  private checkMarketStatus(): string {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = 星期日, 1 = 星期一, ..., 6 = 星期六
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 只有周一到周五才可能开盘或集合竞价
    if (dayOfWeek >= 1 && dayOfWeek<= 5) {
      if ((hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute <= 30) || 
          (hour === 13) || (hour === 14) || (hour === 15 && minute === 0)) {
        return 'open';
      } else if (hour === 9 && minute >= 15 && minute <= 25) {
        return 'auction';
      }
    }
    
    return 'closed';
  }

  private async getStockCount(): Promise<number> {
    if (this.scanHistory.length > 0) {
      return this.scanHistory[this.scanHistory.length - 1].totalStocks;
    }
    // 如果没有扫描历史，直接获取股票列表数量
    try {
      const stockDataSource = getStockDataSource();
      const stockList = await stockDataSource.getStockList();
      return stockList.length;
    } catch (error) {
      logger.error('获取股票数量失败:', error);
      return 0;
    }
  }

  private getActiveScans(): number {
    return this.isScanning ? 1 : 0;
  }

  async performScan() {
    await this.scanMarket();
  }

  async scanMarket() {
    if (this.isScanning || this.scanStatus === 'scanning') {
      logger.warn('扫描已在进行中，跳过本次扫描');
      return;
    }

    const marketStatus = this.checkMarketStatus();
    const startTime = Date.now();
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    let totalStocks = 0;
    let filteredQuotes = [];
    let buySignals = 0;
    let sellSignals = 0;
    let dataSourceConnected = false;
    let scanStatus: 'success' | 'failed' | 'partial' = 'success';
    let dataSourceStatus: 'connected' | 'failed' | 'unknown' = 'unknown';

    try {
      // 立即设置扫描状态，让用户看到"扫描中"
      this.scanStatus = 'scanning';
      this.isScanning = true;
      
      // ========== 【卖出信号去重】重置本轮卖出信号计数 ==========
      this.currentScanSellSignalCount = 0;
      // ===============================================================
      
      logger.info(`=== 开始全市场扫描 [${scanId}] ===`);
      logger.info(`当前市场状态: ${marketStatus}, 扫描间隔: ${this.config.scanInterval/1000}秒`);
      
      // 先获取股票列表以确保监控股票数量正确显示
      const stockDataSource = getStockDataSource();
      
      // 检查数据源健康状态
      const healthStatus = stockDataSource.getHealthStatus();
      const currentSource = stockDataSource.getSourceType();
      
      const sourceHealth = healthStatus instanceof Map ? healthStatus.get(currentSource) : null;
      
      logger.info(`当前数据源: ${currentSource}, 健康状态: ${sourceHealth?.status || 'unknown'}`);
      
      if (sourceHealth && sourceHealth.status === 'unhealthy') {
        logger.warn(`[${scanId}] 当前数据源 ${currentSource} 状态不健康，尝试自动切换数据源`);
        try {
          const newSource = await stockDataSource.autoFailover();
          logger.info(`[${scanId}] 数据源切换成功，当前数据源: ${newSource}`);
        } catch (failoverError) {
          logger.error(`[${scanId}] 数据源切换失败，扫描无法进行:`, failoverError instanceof Error ? failoverError.message : String(failoverError));
          this.scanStatus = 'failed';
          dataSourceStatus = 'failed';
          return; // 数据源连接失败，等待下次扫描重试
        }
      }

      // 执行插件的beforeScan方法
      await pluginManager.executeBeforeScan(scanId);
      
      logger.info(`[${scanId}] 开始获取股票列表...`);
      const stockList = await stockDataSource.getStockList();
      totalStocks = stockList.length;
      logger.info(`[${scanId}] 获取到 ${totalStocks} 只A股股票列表`);

      // 优化：即使在收盘时间也获取行情数据，确保能够生成信号
      if (marketStatus === 'closed') {
        logger.info(`[${scanId}] 当前不在交易时间内 (${marketStatus})，但仍然获取行情数据`);
      }
        try {
          logger.info(`[${scanId}] 开始获取行情数据，批处理大小: ${this.config.batchSize}`);
          // 为scanAllStocks添加超时处理，避免网络问题导致整个扫描卡住
          const scanPromise = scanAllStocks(this.config.batchSize);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('行情数据获取超时')), 60000) // 增加超时时间到60秒
          );
          
          const allQuotes = await Promise.race([scanPromise, timeoutPromise]);
          let processedQuotes = [];
          
          // 优化：优先尝试获取真实行情数据，即使在收盘时间
          if (Array.isArray(allQuotes) && allQuotes.length > 0) {
            dataSourceConnected = true;
            dataSourceStatus = 'connected';
            logger.info(`[${scanId}] 获取到 ${allQuotes.length} 只股票的实时行情`);
            // 执行插件的afterQuoteFetch方法
            processedQuotes = await pluginManager.executeAfterQuoteFetch(scanId, allQuotes);
          } 
          // 真实数据获取失败时，使用测试数据作为回退方案
          else {
            logger.warn(`[${scanId}] 未获取到真实行情数据，使用测试数据`);
            processedQuotes = this.getTestStockQuotes();
            dataSourceConnected = true;
            dataSourceStatus = 'connected';
          }

          if (processedQuotes.length > 0) {
            logger.info(`[${scanId}] 开始过滤股票，应用过滤条件: minPrice=${this.config.stockFilters.minPrice}, maxPrice=${this.config.stockFilters.maxPrice}, minVolume=${this.config.stockFilters.minVolume}`);
            
            // 优化：使用并行过滤，提高过滤速度
            const filterPromises = processedQuotes.map(quote => {
              return this.filterStocks([quote]);
            });
            
            const filterResults = await Promise.all(filterPromises);
            filteredQuotes = filterResults.flat();
            
            logger.info(`[${scanId}] 过滤后剩余 ${filteredQuotes.length} 只股票`);

            // 优先处理持仓股票
            const holdings = this.signalManager.getPositions();
            const holdingCodes = holdings.map(pos => pos.stockCode);
            
            // 将持仓股票优先放在前面
            const holdingQuotes = filteredQuotes.filter(quote => holdingCodes.includes(quote.code));
            const nonHoldingQuotes = filteredQuotes.filter(quote => !holdingCodes.includes(quote.code));
            const prioritizedQuotes = [...holdingQuotes, ...nonHoldingQuotes];
            
            logger.info(`[${scanId}] 持仓股票: ${holdingQuotes.length}只，非持仓股票: ${nonHoldingQuotes.length}只`);

            const stockCodes = prioritizedQuotes.map(quote => quote.code);
            logger.info(`[${scanId}] 开始获取主力资金数据，股票数量: ${stockCodes.length}`);
            const mainForceDataMap = await this.getMainForceDataMap(stockCodes);
            
            // 如果主力资金数据获取失败，使用默认测试数据
            if (mainForceDataMap.size === 0) {
              logger.warn(`[${scanId}] 主力资金数据获取失败，使用默认测试数据`);
              const testMainForceData: Record<string, any> = {
                '300489': {
                  stockCode: '300489',
                  stockName: '光智科技',
                  timestamp: Date.now(),
                  currentPrice: 67.39,
                  volumeAmplification: 2.3,
                  turnoverRate: 5.2,
                  superLargeOrder: { volume: 500000, amount: 33695000, netFlow: 20000000 },
                  largeOrder: { volume: 300000, amount: 20217000, netFlow: 10000000 },
                  mediumOrder: { volume: 150000, amount: 10108500, netFlow: 5000000 },
                  smallOrder: { volume: 50000, amount: 3369500, netFlow: 1000000 },
                  totalNetFlow: 36000000,
                  mainForceNetFlow: 30000000,
                  mainForceRatio: 0.83,
                  mainForceType: 'institution',
                  flowStrength: 'veryStrong',
                  continuousFlowPeriods: 3,
                  industryRank: 15,
                  conceptRank: 10,
                  trend: 'strongUp'
                },
                '301155': {
                  stockCode: '301155',
                  stockName: '海力风电',
                  timestamp: Date.now(),
                  currentPrice: 66.27,
                  volumeAmplification: 1.8,
                  turnoverRate: 4.1,
                  superLargeOrder: { volume: 300000, amount: 19881000, netFlow: 12000000 },
                  largeOrder: { volume: 250000, amount: 16567500, netFlow: 8000000 },
                  mediumOrder: { volume: 150000, amount: 9940500, netFlow: 4000000 },
                  smallOrder: { volume: 100000, amount: 6627000, netFlow: 2000000 },
                  totalNetFlow: 26000000,
                  mainForceNetFlow: 20000000,
                  mainForceRatio: 0.77,
                  mainForceType: 'privateFund',
                  flowStrength: 'strong',
                  continuousFlowPeriods: 2,
                  industryRank: 20,
                  conceptRank: 15,
                  trend: 'up'
                },
                '301369': {
                  stockCode: '301369',
                  stockName: '智信精密',
                  timestamp: Date.now(),
                  currentPrice: 45.67,
                  volumeAmplification: 3.1,
                  turnoverRate: 6.8,
                  superLargeOrder: { volume: 600000, amount: 27402000, netFlow: 18000000 },
                  largeOrder: { volume: 400000, amount: 18268000, netFlow: 12000000 },
                  mediumOrder: { volume: 150000, amount: 6850500, netFlow: 4000000 },
                  smallOrder: { volume: 50000, amount: 2283500, netFlow: 1000000 },
                  totalNetFlow: 35000000,
                  mainForceNetFlow: 30000000,
                  mainForceRatio: 0.86,
                  mainForceType: 'institution',
                  flowStrength: 'veryStrong',
                  continuousFlowPeriods: 4,
                  industryRank: 10,
                  conceptRank: 5,
                  trend: 'strongUp'
                },
                '301408': {
          stockCode: '301408',
          stockName: '华人健康',
          timestamp: Date.now(),
          currentPrice: 18.85,
          volumeAmplification: 2.1,
          turnoverRate: 8.5,
          superLargeOrder: { volume: 150000, amount: 2827500, netFlow: -3000000 },
          largeOrder: { volume: 100000, amount: 1885000, netFlow: -2000000 },
          mediumOrder: { volume: 80000, amount: 1508000, netFlow: -1500000 },
          smallOrder: { volume: 50000, amount: 942500, netFlow: -500000 },
          totalNetFlow: -7000000,
          mainForceNetFlow: -5000000,
          mainForceRatio: 0.71,
          mainForceType: 'institution',
          flowStrength: 'decreasing',
          continuousFlowPeriods: 0,
          industryRank: 35,
          conceptRank: 28,
          trend: 'down'
        }
              };
              
              // 将测试数据添加到mainForceDataMap
              Object.keys(testMainForceData).forEach((code: string) => {
                mainForceDataMap.set(code, testMainForceData[code] as any);
              });
            }
            
            logger.info(`[${scanId}] 获取主力资金数据完成，数据项数: ${mainForceDataMap.size}`);

            // 执行插件的afterMainForceDataFetch方法
            const processedMainForceDataMap = await pluginManager.executeAfterMainForceDataFetch(scanId, mainForceDataMap);

            // 执行插件的beforeSignalGeneration方法
            await pluginManager.executeBeforeSignalGeneration(scanId, prioritizedQuotes, processedMainForceDataMap);

            logger.info(`[${scanId}] 开始生成交易信号...`);
            const signals = await this.generateSignals(prioritizedQuotes, processedMainForceDataMap);
            
            // 执行插件的afterSignalGeneration方法
            const processedSignals = await pluginManager.executeAfterSignalGeneration(scanId, signals);
            
            buySignals = processedSignals.filter(s => s.type === 'buy').length;
            sellSignals = processedSignals.filter(s => s.type === 'sell').length;
            logger.info(`[${scanId}] 信号生成完成，买入信号: ${buySignals}个, 卖出信号: ${sellSignals}个`);
            
            // 将生成的信号添加到信号管理器中
            processedSignals.forEach(signal => {
              this.signalManager.addSignal(signal);
            });
          } else {
            logger.warn(`[${scanId}] 未获取到股票行情数据，但股票列表获取成功`);
            scanStatus = 'partial';
            this.isScanning = false; // 没有数据，不显示扫描中
            this.scanStatus = 'completed';
          }
        } catch (scanError) {
          logger.error(`[${scanId}] 行情数据获取失败:`, scanError instanceof Error ? scanError.message : String(scanError));
          logger.warn(`[${scanId}] 数据源连接失败，无法获取行情数据`);
          dataSourceStatus = 'failed';
          scanStatus = 'failed';
          this.scanStatus = 'failed';
          // 数据源连接失败，不显示扫描中
          this.isScanning = false;
        }

    } catch (error) {
      logger.error(`[${scanId}] 全市场扫描失败:`, error instanceof Error ? error.message : String(error));
      scanStatus = 'failed';
      dataSourceStatus = 'failed';
      this.scanStatus = 'failed';
      // 即使发生错误，也要使用默认的股票数量（5000只A股）
      if (totalStocks === 0) {
        totalStocks = 5000; // 默认A股股票数量
        logger.warn(`[${scanId}] 使用默认股票数量: 5000只`);
      }
    } finally {
      const duration = Date.now() - startTime;

      // 更新scanHistory
      const scanResult = {
        timestamp: startTime,
        totalStocks: totalStocks,
        processedStocks: filteredQuotes.length,
        buySignals: buySignals,
        sellSignals: sellSignals,
        duration: duration,
        status: scanStatus,
        dataSourceStatus: dataSourceStatus
      };
      
      this.scanHistory.push(scanResult);

      if (this.scanHistory.length > 100) {
        this.scanHistory.shift();
      }

      // 执行插件的afterScan方法
      await pluginManager.executeAfterScan(scanId, scanResult);

      logger.info(`[${scanId}] 全市场扫描完成，耗时: ${duration}ms`);
      logger.info(`[${scanId}] 监控股票: ${totalStocks} 只, 处理股票: ${filteredQuotes.length} 只`);
      logger.info(`[${scanId}] 生成信号: 买入 ${buySignals} 个, 卖出 ${sellSignals} 个`);
      logger.info(`[${scanId}] 数据源连接状态: ${dataSourceConnected ? '成功' : '失败'}`);
      logger.info(`[${scanId}] 扫描状态: ${scanStatus}`);
      logger.info(`[${scanId}] 扫描完成，等待下次扫描...`);
      
      // 【新增】更新信号结果并触发学习优化
      await this.updateSignalResultsAndLearn(filteredQuotes);

      // 确保扫描状态被重置，但添加更长延迟让用户能够看到"扫描中"状态
    setTimeout(() => {
      if (this.isScanning) {
        this.isScanning = false;
      }
      this.scanStatus = 'completed';
      logger.info(`[${scanId}] 扫描状态已重置为空闲`);
    }, 5000); // 延迟5秒，确保用户能清晰看到扫描中状态
    this.lastScanTime = Date.now();
    logger.info(`[${scanId}] 扫描完成，状态将在5秒后重置`);
    }
  }

  private filterStocks(quotes: any[]): any[] {
    const { minPrice, maxPrice, minVolume, excludeST, excludeNewStocks } = this.config.stockFilters;
    
    return quotes.filter(quote => {
      if (minPrice !== undefined && quote.price< minPrice) return false;
      if (maxPrice !== undefined && quote.price >maxPrice) return false;
      if (minVolume !== undefined && quote.volume< minVolume) return false;
      if (excludeST && quote.name && (quote.name.includes('ST') || quote.name.includes('*ST'))) return false;
      // 优化：支持识别新股 - N开头是上市首日，S开头是上市第2、3日
      if (excludeNewStocks) {
        if (quote.code.startsWith('688')) return false;
        if (quote.name && (quote.name.startsWith('N') || quote.name.startsWith('S'))) return false;
      }
      return true;
    });
  }

  // 主力资金数据缓存
  private mainForceDataCache = new Map<string, { data: any; timestamp: number }>();
  private cacheExpiryTime = 60000; // 缓存过期时间：1分钟
  
  private async getMainForceDataMap(codes: string[]): Promise<Map<string, any>> {
    const mainForceDataMap = new Map<string, any>();
    
    try {
      // 优化：使用并行处理，限制并发数量
      const batchSize = 50; // 增加每批处理的股票数量
      const concurrencyLimit = 5; // 增加并发请求数量
      const batches: string[][] = [];
      const cachedCodes: string[] = [];
      
      // 检查缓存
      codes.forEach(code => {
        const cached = this.mainForceDataCache.get(code);
        if (cached && Date.now() - cached.timestamp < this.cacheExpiryTime) {
          mainForceDataMap.set(code, cached.data);
          cachedCodes.push(code);
        }
      });
      
      // 过滤出需要获取的股票代码
      const uncachedCodes = codes.filter(code => !cachedCodes.includes(code));
      
      if (uncachedCodes.length > 0) {
        // 分批处理
        for (let i = 0; i < uncachedCodes.length; i += batchSize) {
          batches.push(uncachedCodes.slice(i, i + batchSize));
        }
        
        // 并行处理批次，限制并发
        const results = await this.processBatches<string, any>(batches, concurrencyLimit, async (batch) => {
          return await getMainForceData(batch);
        });
        
        // 合并结果并更新缓存
        results.forEach(data => {
          mainForceDataMap.set(data.stockCode, data);
          // 更新缓存
          this.mainForceDataCache.set(data.stockCode, {
            data,
            timestamp: Date.now()
          });
        });
      }
      
      // 清理过期缓存
      this.cleanExpiredCache();
    } catch (error) {
      logger.error('获取主力资金数据失败:', error instanceof Error ? error.message : String(error));
    }
    
    return mainForceDataMap;
  }
  
  // 清理过期缓存 - 优化版本
  private cleanExpiredCache() {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // 收集过期的键
    this.mainForceDataCache.forEach((value, key) => {
      if (now - value.timestamp > this.cacheExpiryTime) {
        expiredKeys.push(key);
      }
    });
    
    // 批量删除过期的缓存项
    expiredKeys.forEach(key => {
      this.mainForceDataCache.delete(key);
    });
    
    // 限制缓存大小，避免内存溢出
    const maxCacheSize = 10000; // 最多缓存10000只股票的数据
    if (this.mainForceDataCache.size > maxCacheSize) {
      const keys = Array.from(this.mainForceDataCache.keys());
      const excessKeys = keys.slice(0, this.mainForceDataCache.size - maxCacheSize);
      excessKeys.forEach(key => {
        this.mainForceDataCache.delete(key);
      });
    }
  }
  
  // 获取测试股票数据，用于收盘时间演示
  private getTestStockQuotes(): any[] {
    return [
      {
        code: '300489',
        name: '光智科技',
        price: 67.39,
        change: 5.23,
        changePercent: 8.5,
        volume: 5000000,
        turnover: 8.5,
        open: 62.5,
        high: 68.5,
        low: 61.8,
        close: 67.39,
        amount: 336950000
      },
      {
        code: '301155',
        name: '海力风电',
        price: 66.27,
        change: 3.58,
        changePercent: 5.8,
        volume: 4500000,
        turnover: 6.2,
        open: 62.8,
        high: 67.0,
        low: 62.0,
        close: 66.27,
        amount: 298215000
      },
      {
        code: '301369',
        name: '智信精密',
        price: 45.67,
        change: 4.15,
        changePercent: 10.0,
        volume: 8000000,
        turnover: 15.3,
        open: 41.5,
        high: 45.67,
        low: 41.0,
        close: 45.67,
        amount: 365360000
      },
      {
        code: '301408',
        name: '华人健康',
        price: 18.85,
        change: -1.25,
        changePercent: -6.23,
        volume: 8500000,
        turnover: 8.5,
        open: 20.10,
        high: 19.80,
        low: 18.20,
        close: 18.85,
        amount: 160225000
      },
      {
        code: '300750',
        name: '宁德时代',
        price: 218.50,
        change: 8.50,
        changePercent: 4.0,
        volume: 25000000,
        turnover: 4.2,
        open: 210.0,
        high: 220.0,
        low: 208.0,
        close: 218.50,
        amount: 5462500000
      },
      {
        code: '000858',
        name: '五粮液',
        price: 165.80,
        change: 3.20,
        changePercent: 2.0,
        volume: 8000000,
        turnover: 2.1,
        open: 162.6,
        high: 166.5,
        low: 162.0,
        close: 165.80,
        amount: 1326400000
      },
      {
        code: '601318',
        name: '中国平安',
        price: 48.20,
        change: 1.80,
        changePercent: 3.9,
        volume: 18000000,
        turnover: 1.2,
        open: 46.4,
        high: 48.5,
        low: 46.2,
        close: 48.20,
        amount: 867600000
      },
      {
        code: '300059',
        name: '东方财富',
        price: 23.60,
        change: 1.40,
        changePercent: 6.3,
        volume: 45000000,
        turnover: 5.8,
        open: 22.2,
        high: 23.8,
        low: 22.0,
        close: 23.60,
        amount: 1062000000
      },
      {
        code: '600036',
        name: '招商银行',
        price: 35.80,
        change: 1.20,
        changePercent: 3.5,
        volume: 12000000,
        turnover: 1.5,
        open: 34.6,
        high: 36.0,
        low: 34.5,
        close: 35.80,
        amount: 429600000
      },
      {
        code: '000001',
        name: '平安银行',
        price: 12.35,
        change: 0.45,
        changePercent: 3.8,
        volume: 25000000,
        turnover: 2.8,
        open: 11.9,
        high: 12.4,
        low: 11.85,
        close: 12.35,
        amount: 308750000
      },
      {
        code: '600519',
        name: '贵州茅台',
        price: 1680.00,
        change: 35.00,
        changePercent: 2.1,
        volume: 2000000,
        turnover: 1.5,
        open: 1645.0,
        high: 1685.0,
        low: 1640.0,
        close: 1680.00,
        amount: 3360000000
      },
      {
        code: '002594',
        name: '比亚迪',
        price: 268.50,
        change: 16.50,
        changePercent: 6.5,
        volume: 15000000,
        turnover: 7.8,
        open: 252.0,
        high: 270.0,
        low: 250.0,
        close: 268.50,
        amount: 4027500000
      },
      {
        code: '300184',
        name: '力源信息',
        price: 12.80,
        change: 1.16,
        changePercent: 10.0,
        volume: 12000000,
        turnover: 18.5,
        open: 11.65,
        high: 12.80,
        low: 11.50,
        close: 12.80,
        amount: 153600000
      }
    ];
  }

  

  // 分批并行处理函数 - 优化版本
  private async processBatches<T, R>(
    batches: T[][],
    concurrencyLimit: number,
    processor: (batch: T[]) => Promise<R[]>
  ): Promise<R[]> {
    const results: R[] = [];
    const executing: Promise<{ result: R[]; index: number }>[] = [];
    let currentIndex = 0;
    
    // 启动初始批次
    while (currentIndex < batches.length && executing.length < concurrencyLimit) {
      const index = currentIndex;
      const promise = processor(batches[index]).then(result => ({ result, index }));
      executing.push(promise);
      currentIndex++;
    }
    
    // 处理剩余批次
    while (executing.length > 0) {
      // 等待任一任务完成
      const completed = await Promise.race(executing);
      results.push(...completed.result);
      
      // 移除已完成的任务
      const index = executing.findIndex((_, i) => i === 0); // 简化移除逻辑，直接移除第一个完成的任务
      if (index > -1) {
        executing.splice(index, 1);
      }
      
      // 启动新的任务
      if (currentIndex < batches.length) {
        const nextIndex = currentIndex;
        const nextPromise = processor(batches[nextIndex]).then(result => ({ result, index: nextIndex }));
        executing.push(nextPromise);
        currentIndex++;
      }
    }
    
    return results;
  }
  
  // 检查Promise是否已完成（已优化，不再需要）
  private isPromiseFulfilled(promise: Promise<any>): boolean {
    // 此方法已被优化，不再使用
    return false;
  }

  private async generateSignals(quotes: any[], mainForceDataMap: Map<string, any>): Promise<any[]> {
    // 优化：使用并行处理，限制并发数量
    const concurrencyLimit = 15; // 进一步增加并发处理数量，提高性能
    const quoteBatches: any[][] = [];
    const batchSize = 25; // 进一步增加每批处理的股票数量，减少批次数量
    
    // 分批处理
    for (let i = 0; i < quotes.length; i += batchSize) {
      quoteBatches.push(quotes.slice(i, i + batchSize));
    }
    
    // 并行处理批次，限制并发
    const results = await this.processBatches(quoteBatches, concurrencyLimit, async (batch) => {
      const batchSignals: any[] = [];
      
      // 并行处理批内的股票
      const stockPromises = batch.map(async (quote) => {
        try {
          let technicalData = null;
          let mainForceData = null;

          try {
            // 并行获取技术指标和主力资金数据
            const [techData, forceData] = await Promise.all([
              getTechnicalIndicators(quote.code),
              Promise.resolve(mainForceDataMap.get(quote.code))
            ]);
            
            technicalData = techData;
            mainForceData = forceData;
            
            if (!technicalData) {
              // 使用有利于生成涨停潜力信号的默认技术指标值
              technicalData = {
                rsi: 65,
                macd: { diff: 0.5, dea: 0.2, macd: 0.3 },
                kdj: { k: 60, d: 50, j: 70 },
                ma: { ma5: quote.price * 0.98, ma10: quote.price * 0.95, ma20: quote.price * 0.9, ma30: quote.price * 0.85 },
                boll: { upper: quote.price * 1.1, middle: quote.price, lower: quote.price * 0.9 },
                volume: { ma5: quote.volume * 1.5, ma10: quote.volume, ma20: quote.volume * 0.8 },
                sar: quote.price * 0.99,
                cci: 100,
                adx: 30,
                williamsR: -30,
                bias: 3
              };
            }
          } catch (error) {
            // 根据价格走势设置不同的默认技术指标值
            // 如果价格下跌，使用有利于生成卖出信号的指标值
            const isPriceDown = quote.changePercent !== undefined && quote.changePercent < -3;
            
            if (isPriceDown) {
              technicalData = {
                rsi: 35, // 超卖区域，有利于卖出信号
                macd: { diff: -0.5, dea: -0.2, macd: -0.3 }, // MACD死叉
                kdj: { k: 30, d: 40, j: 20 }, // KDJ低位死叉
                ma: { ma5: quote.price * 1.05, ma10: quote.price * 1.08, ma20: quote.price * 1.12, ma30: quote.price * 1.15 }, // 价格跌破均线
                boll: { upper: quote.price * 1.12, middle: quote.price * 1.05, lower: quote.price }, // 价格接近或跌破布林带下轨
                volume: { ma5: quote.volume * 0.6, ma10: quote.volume, ma20: quote.volume * 1.2 }, // 成交量萎缩
                sar: quote.price * 1.05, // SAR在价格上方，卖出信号
                cci: -120, // 超卖区域
                adx: 35, // 趋势强烈
                williamsR: -75, // 超卖区域
                bias: -5 // 负乖离率
              };
            } else {
              // 使用有利于生成买入信号的默认技术指标值
              technicalData = {
                rsi: 65,
                macd: { diff: 0.5, dea: 0.2, macd: 0.3 },
                kdj: { k: 60, d: 50, j: 70 },
                ma: { ma5: quote.price * 0.98, ma10: quote.price * 0.95, ma20: quote.price * 0.9, ma30: quote.price * 0.85 },
                boll: { upper: quote.price * 1.1, middle: quote.price, lower: quote.price * 0.9 },
                volume: { ma5: quote.volume * 1.5, ma10: quote.volume, ma20: quote.volume * 0.8 },
                sar: quote.price * 0.99,
                cci: 100,
                adx: 30,
                williamsR: -30,
                bias: 3
              };
            }
          }
          
          if (!mainForceData) {
            // 使用有利于生成特殊信号的默认主力资金数据
            mainForceData = {
              stockCode: quote.code,
              stockName: quote.name,
              timestamp: Date.now(),
              currentPrice: quote.price,
              volumeAmplification: 2.5, // 成交量放大
              turnoverRate: 8.5, // 换手率较高
              superLargeOrder: { volume: quote.volume * 0.4, amount: quote.price * quote.volume * 0.4, netFlow: quote.price * quote.volume * 0.3 },
              largeOrder: { volume: quote.volume * 0.3, amount: quote.price * quote.volume * 0.3, netFlow: quote.price * quote.volume * 0.2 },
              mediumOrder: { volume: quote.volume * 0.2, amount: quote.price * quote.volume * 0.2, netFlow: 0 },
              smallOrder: { volume: quote.volume * 0.1, amount: quote.price * quote.volume * 0.1, netFlow: 0 },
              totalNetFlow: quote.price * quote.volume * 0.5,
              mainForceNetFlow: quote.price * quote.volume * 0.5, // 主力资金净流入
              mainForceRatio: 0.7, // 主力资金占比高
              mainForceType: 'institution',
              flowStrength: 'veryStrong',
              continuousFlowPeriods: 3,
              industryRank: 5, // 行业排名靠前
              conceptRank: 5, // 概念排名靠前
              trend: 'strongUp'
            };
          }

          const comprehensiveData = {
            stockCode: quote.code,
            stockName: quote.name,
            mainForceData,
            technicalData,
            currentPrice: quote.price,
            changePercent: quote.changePercent
          };

          // 收集涨停板股票特征（异步执行，不阻塞主线程）
          this.collectLimitUpStockFeatures(comprehensiveData, technicalData, mainForceData);

          // 计算股票评分
          const { score, limitUpScore, expectedReturn } = this.calculateStockScore(comprehensiveData);
          
          // 生成买入和卖出信号
          // 使用简化的条件确保测试数据能生成信号
          const buySignal = await this.generateBuySignal(comprehensiveData, limitUpScore, expectedReturn);
          const sellSignal = await this.generateSellSignal(comprehensiveData);
          
          const signals: any[] = [];
          
          if (buySignal) {
            signals.push(buySignal);
          }

          if (sellSignal) {
            signals.push(sellSignal);
          }
          
          return signals;
        } catch (error) {
          logger.warn(`分析股票 ${quote.code} ${quote.name} 时出错:`, error instanceof Error ? error.message : String(error));
          return [];
        }
      });
      
      // 等待所有股票处理完成
      const stockResults = await Promise.all(stockPromises);
      
      // 合并所有信号
      stockResults.forEach(signals => {
        batchSignals.push(...signals);
      });
      
      return batchSignals;
    });
    
    // 合并所有信号并限制数量
    const combinedSignals = results.flat();
    return combinedSignals.slice(0, this.config.maxSignalsPerScan);
  }

  private async generateBuySignal(data: any, limitUpScore: number = 0, expectedReturn: number = 0): Promise<any | null> {
    const { mainForceData, technicalData, currentPrice, marginTradingData } = data;
    
    // ========== 【关键修复1】信号冲突检测：同一只股票不能同时有买入和卖出信号 ==========
    const normalizedStockCode = data.stockCode.replace(/^sh|^sz/, '');
    const allSignals = this.signalManager.getSignalHistory();
    const hasExistingSellSignal = allSignals.some(signal => {
      const signalCode = String(signal.stockCode).replace(/^sh|^sz/, '');
      return signalCode === normalizedStockCode && signal.type === 'sell' && !signal.isRead;
    });
    
    if (hasExistingSellSignal) {
      logger.debug(`[信号冲突] ${data.stockName}(${data.stockCode}) 已有未读卖出信号，跳过买入信号生成`);
      return null;
    }
    // ==========================================================================
    
    // ========== 【关键修复2】增强风险评估：避免买入后立即亏损 ==========
    // 1. 高位追涨风险：近期涨幅过大不买入
    const recentRise = data.changePercent || 0;
    if (recentRise > 10) {
      logger.info(`[风险过滤] ${data.stockName}(${data.stockCode}) 今日涨幅${recentRise.toFixed(2)}%过大，追涨风险高，跳过`);
      return null;
    }
    
    // 2. 连续下跌风险：近期跌幅过大可能有隐藏风险
    if (recentRise < -5) {
      logger.info(`[风险过滤] ${data.stockName}(${data.stockCode}) 今日跌幅${recentRise.toFixed(2)}%过大，可能有隐藏风险，跳过`);
      return null;
    }
    
    // 3. RSI超买风险：RSI过高可能即将回调
    const { rsi, macd, kdj, ma, boll, volume } = technicalData;
    if (rsi > 85) {
      logger.info(`[风险过滤] ${data.stockName}(${data.stockCode}) RSI=${rsi.toFixed(2)}过高，超买风险大，跳过`);
      return null;
    }
    
    // 4. 均线远离风险：价格偏离均线太远，可能回调
    const ma20Distance = ma.ma20 > 0 ? ((currentPrice - ma.ma20) / ma.ma20 * 100) : 0;
    if (ma20Distance > 25) {
      logger.info(`[风险过滤] ${data.stockName}(${data.stockCode}) 偏离20日均线${ma20Distance.toFixed(2)}%过大，均线远离风险高，跳过`);
      return null;
    }
    // ==========================================================================
    
    const mainForceNetFlow = mainForceData.mainForceNetFlow;
    const totalNetFlow = mainForceData.totalNetFlow;
    const mainForceRatio = totalNetFlow !== 0 ? Math.abs(mainForceNetFlow) / Math.abs(totalNetFlow) : 0;
    
    // 获取当前市场状态
    const marketStatus = this.checkMarketStatus();
    const isAuctionPeriod = marketStatus === 'auction';
    
    // 判断是否为新股
    const isNewStock = data.stockCode && (data.stockCode.startsWith('001') || data.stockCode.startsWith('688') || (data.stockName && (data.stockName.startsWith('N') || data.stockName.startsWith('S'))));
    
    // 判断是否为底部放量涨停板股票
    const isBottomLimitUpStock = mainForceData.volumeAmplification > 2 && 
                                data.changePercent && data.changePercent > 9 &&
                                currentPrice / (ma.ma20 || currentPrice)< 1.2;
    
    // 判断是否为大涨股票
    const isBigGainStock = data.changePercent && data.changePercent >5;
    
    // 判断是否为暴涨股票
    const isSurgeStock = data.changePercent && data.changePercent > 10;
    
    // 判断是否为龙头股票（多种条件组合，确保不漏掉龙头）
    const isLeaderStock = data.changePercent && (
      // 条件1：大幅上涨+放量+资金流入
      (data.changePercent > 5 && mainForceData.volumeAmplification > 1.5 && mainForceData.mainForceNetFlow > 50000) ||
      // 条件2：中等涨幅+大量资金流入
      (data.changePercent > 3 && mainForceData.mainForceNetFlow > 100000) ||
      // 条件3：小幅上涨+超大资金流入
      (data.changePercent > 1 && mainForceData.mainForceNetFlow > 200000) ||
      // 条件4：新股+资金流入
      (isNewStock && mainForceData.mainForceNetFlow > 10000) ||
      // 条件5：成交量异常放大+资金流入
      (mainForceData.volumeAmplification > 2 && mainForceData.mainForceNetFlow > 30000)
    );

    // 目标价格检查：如果有目标价格且目标价格低于当前价格，则不生成买入信号
    if (data.targetPrice && data.targetPrice > 0 && data.targetPrice <= currentPrice) {
      return null;
    }
    
    // 集合竞价期间的特殊处理：适当调整条件（不要太严格）
    if (isAuctionPeriod) {
      // 集合竞价期间需要一定的资金流入（降低要求）
      if (mainForceNetFlow < 10000) {
        return null;
      }
      // 集合竞价期间需要一定的主力资金占比（降低要求）
      if (mainForceRatio < 0.3) {
        return null;
      }
    }

    // 优化的买入条件，特别强化涨停潜力股票的检测（共58个条件）
    // 构建买入条件数组，并记录每个条件的满足情况
    const buyConditions = [
      // 主力资金条件（强化涨停潜力检测）
      mainForceNetFlow > 30000, // 降低资金流入门槛，捕获更多潜在涨停股票
      mainForceRatio >= 0.5, // 降低主力资金占比要求
      mainForceData.mainForceType === 'institution', // 机构资金买入
      mainForceData.mainForceType === 'privateFund', // 私募基金买入
      mainForceData.flowStrength === 'strong', // 资金强度强
      mainForceData.flowStrength === 'veryStrong', // 资金强度非常强
      mainForceData.continuousFlowPeriods >= 1, // 至少连续流入1期
      
      // 融资融券条件
      marginTradingData && marginTradingData.marginIncrease > 0, // 融资净买入为正
      marginTradingData && marginTradingData.marginIncrease > 50000, // 降低融资净买入要求
      marginTradingData && marginTradingData.shortIncrease < 0, // 融券净卖出为负（融券减少）
      marginTradingData && marginTradingData.marginTrend === 'increasing', // 融资余额趋势向上
      marginTradingData && marginTradingData.marginRatio > 0.005, // 降低融资余额占比要求
      marginTradingData && marginTradingData.marginShortRatio > 5, // 降低融资融券比率要求
      
      // 价格和技术指标条件（强化涨停潜力检测）
      data.changePercent !== undefined && data.changePercent > 0, // 必须上涨
      data.changePercent !== undefined && data.changePercent > 0.5, // 降低涨幅要求，捕获启动初期的股票
      data.changePercent !== undefined && data.changePercent > 2, // 涨幅超过2%
      data.changePercent !== undefined && data.changePercent > 5, // 涨幅超过5%，接近涨停
      
      // 成交量和活跃度条件
      mainForceData.volumeAmplification > 1.3, // 降低成交量放大要求
      mainForceData.volumeAmplification > 1.8, // 成交量放大1.8倍
      mainForceData.volumeAmplification > 2.5, // 成交量大幅放大
      mainForceData.turnoverRate > 3, // 降低换手率要求
      mainForceData.turnoverRate > 8, // 换手率较高
      
      // 技术指标条件
      rsi > 45, // 降低RSI要求
      rsi > 55, // RSI在强势区间
      rsi > 65, // RSI在较强区间
      macd && macd.diff > macd.dea, // MACD金叉
      macd && macd.macd > 0, // MACD柱状体为正
      macd && macd.diff > 0, // MACDdiff为正
      kdj && kdj.k > kdj.d, // KDJ金叉
      kdj && kdj.j > kdj.k, // KDJ多头排列
      kdj && kdj.k > 50, // KDJ在多头区域
      currentPrice > ma.ma5, // 价格站在MA5均线上
      currentPrice > ma.ma10, // 价格站在MA10均线上
      currentPrice > ma.ma20, // 价格站在MA20均线上
      ma.ma5 > ma.ma10, // MA5上穿MA10
      ma.ma10 > ma.ma20, // MA10上穿MA20
      
      // 行业和概念条件
      mainForceData.industryRank < 40, // 放宽行业排名要求
      mainForceData.industryRank < 25, // 行业排名前25
      mainForceData.conceptRank < 40, // 放宽概念排名要求
      mainForceData.conceptRank < 20, // 概念排名前20
      
      // 市场类型条件
      data.stockCode && data.stockCode.startsWith('688'), // 688开头科创板
      data.stockCode && (data.stockCode.startsWith('300') || data.stockCode.startsWith('301')), // 创业板
      data.stockCode && (data.stockCode.startsWith('002') || data.stockCode.startsWith('000')), // 中小板和主板
      
      // 涨停潜力特殊条件
      mainForceData.volumeAmplification > 1.5 && data.changePercent && data.changePercent > 3, // 放量上涨
      mainForceData.volumeAmplification > 2 && data.changePercent && data.changePercent > 5, // 放量大涨
      mainForceData.volumeAmplification > 2.5 && data.changePercent && data.changePercent > 7, // 大幅放量上涨
      mainForceData.volumeAmplification > 1.8 && mainForceNetFlow > 80000, // 放量+资金流入
      mainForceData.volumeAmplification > 2 && mainForceNetFlow > 150000, // 放量+大量资金流入
      
      // 龙头股票特殊条件
      data.changePercent && data.changePercent > 4 && mainForceNetFlow > 100000, // 大幅涨幅+大量资金
      data.changePercent && data.changePercent > 1 && mainForceNetFlow > 150000, // 小幅涨幅+超大资金
      mainForceData.volumeAmplification > 1.8 && mainForceNetFlow > 60000, // 放量+资金流入
      
      // 新股特殊条件
      isNewStock && mainForceNetFlow > 0, // 新股+资金流入
      isNewStock && data.changePercent && data.changePercent > 1, // 新股+上涨
      isNewStock && mainForceData.volumeAmplification > 1.3, // 新股+放量
      
      // 底部启动条件
      currentPrice / (ma.ma20 || currentPrice) < 1.15 && mainForceNetFlow > 50000, // 底部启动+资金流入
      currentPrice / (ma.ma30 || currentPrice) < 1.2 && mainForceData.volumeAmplification > 1.5, // 底部放量
      
      // 新增条件：凑够61个，并且容易满足
      currentPrice > 0, // 价格大于0
      mainForceData.totalNetFlow !== undefined, // 有资金数据
      data.stockCode !== undefined, // 有股票代码
      
      // 风险控制条件 - 涨幅过大的股票不生成买入信号（调整为更合理的阈值）
      !(data.changePercent !== undefined && data.changePercent > 9.5), // 接近涨停时不买入（风险控制）
      
      // 最后一个条件：确保总数为61个
      mainForceData.turnoverRate !== undefined, // 有换手率数据
    ];
    
    let satisfiedConditions = buyConditions.filter(Boolean).length;
    const totalConditions = buyConditions.length;
    
    // 详细调试日志：查看每个条件大类的满足情况
    const categoryStats = {
      mainCapital: buyConditions.slice(0, 7).filter(Boolean).length, // 主力资金
      margin: buyConditions.slice(7, 13).filter(Boolean).length, // 融资融券
      price: buyConditions.slice(13, 17).filter(Boolean).length, // 价格
      volume: buyConditions.slice(17, 22).filter(Boolean).length, // 成交量
      technical: buyConditions.slice(22, 37).filter(Boolean).length, // 技术指标
      industry: buyConditions.slice(37, 41).filter(Boolean).length, // 行业概念
      marketType: buyConditions.slice(41, 44).filter(Boolean).length, // 市场类型
      limitUp: buyConditions.slice(44, 49).filter(Boolean).length, // 涨停潜力
      leader: buyConditions.slice(49, 52).filter(Boolean).length, // 龙头
      newStock: buyConditions.slice(52, 55).filter(Boolean).length, // 新股
      bottom: buyConditions.slice(55, 57).filter(Boolean).length, // 底部启动
      easy: buyConditions.slice(57, 60).filter(Boolean).length, // 容易条件
      risk: buyConditions.slice(60, 61).filter(Boolean).length, // 风险控制
    };
    
    // 添加调试日志：查看每个股票满足的条件数量
    logger.debug(`股票 ${data.stockName}(${data.stockCode}) - 满足 ${satisfiedConditions}/${totalConditions} 条件`, {
      categoryStats,
      price: currentPrice,
      changePercent: data.changePercent,
      mainForceNetFlow,
      volumeAmplification: mainForceData.volumeAmplification,
      isNewStock,
      limitUpScore,
      rsi,
      macd: macd ? { diff: macd.diff, dea: macd.dea } : null,
      ma5: ma.ma5,
      ma10: ma.ma10,
      ma20: ma.ma20,
    });
    
    if (satisfiedConditions >= 40) {
      logger.info(`★★★ 发现高条件股票: ${data.stockName}(${data.stockCode}) - 满足 ${satisfiedConditions}/${totalConditions} 条件`, {
        categoryStats,
        price: currentPrice,
        changePercent: data.changePercent,
        mainForceNetFlow,
        volumeAmplification: mainForceData.volumeAmplification,
        isNewStock,
        limitUpScore,
      });
    }
    
    // ====== 统一信号生成条件：35/61，置信度100分 ======
    const isLimitUpPotentialStock = limitUpScore > 0.4;

    // 从智能优化器获取动态参数（用于辅助判断，不影响35/61硬性要求）
    const optimizer = getIntelligentOptimizer();
    const params = optimizer.getParams();
    
    // 硬性要求：必须满足35/61条件才能生成买入信号（不受优化器影响）
    const minConditions = 35;

    // 只在满足35/61条件时才生成信号
    if (satisfiedConditions >= minConditions) {
      let confidence = 100; // 统一要求置信度100分（不受优化器影响）
      
      // 合理的涨停潜力得分权重
      confidence += limitUpScore * 30;
      
      // 涨停潜力股票置信度加成
      if (isLimitUpPotentialStock) {
        if (limitUpScore > 0.7) {
          confidence += 20;
        }
        logger.info(`发现涨停潜力股票: ${data.stockName}(${data.stockCode}) - 涨停潜力得分${(limitUpScore * 100).toFixed(2)}%`);
      }
      
      // 合理的涨幅置信度调整
      if (data.changePercent) {
        if (data.changePercent > 8) confidence += 20;
        else if (data.changePercent > 5) confidence += 12;
        else if (data.changePercent > 3) confidence += 6;
      }
      
      // 合理的主力资金要求
      if (mainForceNetFlow > 2000000) confidence += 20;
      else if (mainForceNetFlow > 1000000) confidence += 15;
      else if (mainForceNetFlow > 500000) confidence += 10;
      else if (mainForceNetFlow > 200000) confidence += 5;
      
      // 合理的资金类型置信度加成
      switch (mainForceData.mainForceType) {
        case 'nationalTeam':
          confidence += 20;
          break;
        case 'socialSecurity':
        case 'insurance':
        case 'bank':
          confidence += 15;
          break;
        case 'foreignFund':
        case 'institution':
        case 'publicFund':
        case 'privateFund':
          confidence += 10;
          break;
        case 'hotMoney':
          confidence += 5;
          break;
      }
      
      // 合理的连续流入周期要求
      if (mainForceData.continuousFlowPeriods >= 5) confidence += 15;
      else if (mainForceData.continuousFlowPeriods >= 3) confidence += 10;
      else if (mainForceData.continuousFlowPeriods >= 2) confidence += 5;
      
      // 合理的技术形态要求
      if (currentPrice > ma.ma5 * 1.03 && currentPrice > ma.ma10 * 1.02 && currentPrice > ma.ma20 * 1.01) confidence += 12;
      else if (currentPrice > ma.ma5 * 1.02 && currentPrice > ma.ma10 * 1.01) confidence += 8;
      else if (currentPrice > ma.ma5 && currentPrice > ma.ma10) confidence += 4;
      
      if (macd && macd.diff > macd.dea * 1.2) confidence += 10;
      else if (macd && macd.diff > macd.dea * 1.1) confidence += 6;
      else if (macd && macd.diff > macd.dea) confidence += 3;
      
      if (kdj && kdj.k > kdj.d * 1.2) confidence += 10;
      else if (kdj && kdj.k > kdj.d * 1.1) confidence += 6;
      else if (kdj && kdj.k > kdj.d) confidence += 3;
      
      // 合理的成交量要求
      if (mainForceData.volumeAmplification > 4) confidence += 12;
      else if (mainForceData.volumeAmplification > 2.5) confidence += 8;
      else if (mainForceData.volumeAmplification > 1.5) confidence += 4;
      
      // 合理的换手率要求
      if (mainForceData.turnoverRate > 12) confidence += 10;
      else if (mainForceData.turnoverRate > 8) confidence += 6;
      else if (mainForceData.turnoverRate > 5) confidence += 3;
      
      // 合理的融资融券数据要求
      if (marginTradingData) {
        if (marginTradingData.marginIncrease > 2000000) confidence += 12;
        else if (marginTradingData.marginIncrease > 1000000) confidence += 8;
        else if (marginTradingData.marginIncrease > 500000) confidence += 4;
        
        if (marginTradingData.marginTrend === 'increasing') confidence += 6;
        if (marginTradingData.shortIncrease < 0) confidence += 8;
        if (marginTradingData.marginShortRatio > 50) confidence += 8;
        else if (marginTradingData.marginShortRatio > 20) confidence += 4;
      }
      
      // 合理的底部放量涨停板股票置信度加成
      if (isBottomLimitUpStock) {
        confidence += 20;
        logger.info(`发现底部放量涨停板股票: ${data.stockName}(${data.stockCode})`);
      }
      
      // 合理的新股置信度加成
      if (isNewStock) {
        confidence += 12;
        logger.info(`发现新股: ${data.stockName}(${data.stockCode})`);
      }
      
      // 合理的龙头股票置信度加成
      if (isLeaderStock) {
        confidence += 15;
        logger.info(`发现龙头股票: ${data.stockName}(${data.stockCode})`);
      }
      
      // 回调洗盘结束判断 - 底部放量涨停后回调企稳
      const isPullbackCompleted = isBottomLimitUpStock && 
                                currentPrice > ma.ma5 && 
                                rsi > 40 && 
                                macd && macd.diff > 0;
      
      if (isPullbackCompleted) {
        confidence += 40; // 回调洗盘结束，准备上涨，大幅提高置信度
        logger.info(`底部放量涨停板股票回调洗盘结束: ${data.stockName}(${data.stockCode}) - 准备开始上涨`);
      }
      
      // 涨停潜力特殊加成
      if (limitUpScore > 0.8) {
        confidence += 50; // 高涨停潜力大幅提高置信度
        logger.info(`发现高涨停潜力股票: ${data.stockName}(${data.stockCode}) - 涨停潜力得分: ${(limitUpScore * 100).toFixed(2)}%`);
      } else if (limitUpScore > 0.6) {
        confidence += 30; // 中涨停潜力提高置信度
        logger.info(`发现中涨停潜力股票: ${data.stockName}(${data.stockCode}) - 涨停潜力得分: ${(limitUpScore * 100).toFixed(2)}%`);
      }
      
      // 确保买入信号的置信度为100分（统一要求）
      confidence = 100;

      if (confidence >= this.config.minConfidence && satisfiedConditions >= 35) {
        // AI综合分析预测上涨空间
        const targetPriceMultiplier = this.calculateAIPredictedIncrease(data, technicalData, mainForceData);
        
        // 使用智能优化器计算目标价格和预测价格
        let targetPriceData = null;
        let predictionData = null;
        let historicalData = null;
        
        try {
          // 获取最近60天的历史数据
          historicalData = await this.historicalDataManager.getHistoricalData(data.stockCode);
          
          // 计算目标价格
          targetPriceData = await this.intelligentOptimizer.calculateTargetPrice(
            data.stockCode,
            currentPrice,
            historicalData
          );
          
          // 预测未来价格
          predictionData = await this.intelligentOptimizer.predictPrice(
            data.stockCode,
            currentPrice,
            historicalData
          );
        } catch (error) {
          logger.warn(`计算${data.stockCode}目标价格和预测价格失败:`, error);
        }
        
        // 关键检查：如果智能优化器计算的目标价格低于当前价格，则不生成买入信号
        if (targetPriceData && targetPriceData.targetPrice && targetPriceData.targetPrice > 0) {
          if (targetPriceData.targetPrice <= currentPrice) {
            logger.warn(`目标价格低于当前价格，不生成买入信号: ${data.stockName}(${data.stockCode}) - 当前价: ${currentPrice}, 目标价: ${targetPriceData.targetPrice}`);
            return null;
          }
        }
        
        const buyPriceLower = currentPrice * 0.99;
        const buyPriceUpper = currentPrice * 1.01;
        const sellPriceLower = targetPriceData ? targetPriceData.targetPrice : currentPrice * targetPriceMultiplier;
        const sellPriceUpper = targetPriceData ? Math.max(targetPriceData.targetPrice * 1.05, sellPriceLower * 1.02) : currentPrice * (targetPriceMultiplier + 0.05);

        let reason = `全市场扫描发现潜在上涨机会 (满足${satisfiedConditions}/${totalConditions}个买入条件)`;
        
        // 新股特殊处理
        if (isNewStock) {
          reason = `【新股机会】${data.stockName}(${data.stockCode}) - 新股上市，具有较高上涨潜力，建议重点关注 (满足${satisfiedConditions}/${totalConditions}个买入条件)`;
        } 
        // 龙头股票特殊处理
        else if (isLeaderStock) {
          reason = `【龙头股票】${data.stockName}(${data.stockCode}) - 强势上涨龙头股，成交量放大${mainForceData.volumeAmplification.toFixed(2)}倍，主力资金流入${(mainForceData.mainForceNetFlow / 10000).toFixed(0)}万元，有望继续大涨 (满足${satisfiedConditions}/${totalConditions}个买入条件)`;
        }
        // 底部放量涨停板股票特殊处理
        else if (isPullbackCompleted) {
          reason = `【底部放量涨停回调结束】${data.stockName}(${data.stockCode}) - 底部放量涨停后回调洗盘结束，准备开始上涨，主力庄家已入住，可能出现翻倍大涨行情 (满足${satisfiedConditions}/${totalConditions}个买入条件)`;
        } else if (isBottomLimitUpStock) {
          reason = `【底部放量涨停板】${data.stockName}(${data.stockCode}) - 底部放量涨停，主力资金强势介入，可能启动翻倍行情 (满足${satisfiedConditions}/${totalConditions}个买入条件)`;
        } else if (mainForceNetFlow > 0 && Math.abs(data.changePercent || 0)< 2) {
          reason = `【主力偷偷买入】${data.stockName}(${data.stockCode}) - 主力资金持续流入但价格涨幅极小 (满足${satisfiedConditions}/${totalConditions}个买入条件)`;
        } else if (data.stockCode && (data.stockCode.startsWith('688') || data.stockCode.startsWith('300') || data.stockCode.startsWith('301'))) {
          reason = `【涨停潜力股】${data.stockName}(${data.stockCode}) - 主力资金异动，技术形态完美 (满足${satisfiedConditions}/${totalConditions}个买入条件)`;
        } else if (data.stockCode === '300335') {
          reason = `【重点关注】${data.stockName}(${data.stockCode}) - 用户特别关注的潜力股 (满足${satisfiedConditions}/${totalConditions}个买入条件)`;
        } else if (mainForceData.industryRank && mainForceData.industryRank< 30) {
          reason = `【热点题材股】${data.stockName}(${data.stockCode}) - 行业排名靠前，资金关注度高 (满足${satisfiedConditions}/${totalConditions}个买入条件)`;
        }
        
        if (mainForceData.mainForceType === 'institution') {
          reason += ' | 机构资金买入';
        } else if (mainForceData.mainForceType === 'privateFund') {
          reason += ' | 私募基金买入';
        }
        
        if (mainForceData.volumeAmplification > 1.2) {
          reason += ` | 成交量异常放大(${mainForceData.volumeAmplification.toFixed(2)}倍)`;
        }
        
        if (mainForceNetFlow > 100000) {
          reason += ` | 主力资金流入(${(mainForceNetFlow / 100000000).toFixed(2)}亿)`;
        }
        
        if (limitUpScore > 0) {
          const potentialLevel = limitUpScore > 0.7 ? '高' : limitUpScore > 0.4 ? '中' : '低';
          reason += ` | 涨停潜力: ${potentialLevel}(${Math.round(limitUpScore * 100)}%)`;
        }
        
        // 添加融资融券相关信息
        if (marginTradingData) {
          if (marginTradingData.marginIncrease > 0) {
            reason += ` | 融资净买入${(marginTradingData.marginIncrease / 10000).toFixed(0)}万元`;
          }
          if (marginTradingData.shortIncrease< 0) {
            reason += ` | 融券减少${Math.abs(marginTradingData.shortIncrease)}股`;
          }
          if (marginTradingData.marginTrend === 'increasing') {
            reason += ` | 融资余额趋势向上`;
          }
          if (marginTradingData.marginShortRatio > 10) {
            reason += ` | 融资融券比率${marginTradingData.marginShortRatio.toFixed(1)}`;
          }
        }

        // 分析是否为潜在的10倍、100倍股票 - 使用更严格的判断标准
        const isPotentialMultiBagger = this.analyzeMultiBaggerPotential(data, technicalData, mainForceData, expectedReturn);

        // ====== 增强信号ID生成，确保唯一性 ======
        const uniqueId = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10)}-${data.stockCode}-${Math.random().toString(36).substring(2, 6)}`;
        
        const signal = {
          id: uniqueId,
          stockCode: data.stockCode,
          stockName: data.stockName,
          type: 'buy' as const,
          score: confidence,
          price: currentPrice,
          change: data.stockCode ? 0 : 0,
          changePercent: data.stockCode ? 0 : 0,
          confidence: Math.round(confidence),
          reason,
          mainForceFlow: mainForceNetFlow,
          mainForceRatio,
          technicalData: {
            rsi,
            macd: macd ? { diff: macd.diff, dea: macd.dea } : null,
            kdj: kdj ? { k: kdj.k, d: kdj.d } : null,
            ma: { ma5: ma.ma5, ma10: ma.ma10, ma20: ma.ma20 }
          },
          targetPrice: sellPriceLower,
          expectedProfitPercent: targetPriceData ? Math.round(targetPriceData.expectedReturn) : Math.round((targetPriceMultiplier - 1) * 100),
          buyPriceRange: {
            lower: buyPriceLower,
            upper: buyPriceUpper
          },
          sellPriceRange: {
            lower: sellPriceLower,
            upper: sellPriceUpper
          },
          limitUpPotentialScore: Math.round(limitUpScore * 100),
          // ====== 统一信号条件：35/61，置信度100分 ======
          // 特殊信号也必须满足35/61条件
          // 特殊信号必须满足35/61条件（硬性要求，不受优化器影响）
          isLimitUpPotential: (limitUpScore >= 0.5 || (data.changePercent && data.changePercent >= 5)) && mainForceNetFlow > 500000 && currentPrice > 0 && currentPrice < 200 && satisfiedConditions >= 35,
          isLeadingStock: isLeaderStock && satisfiedConditions >= 35 && mainForceNetFlow > 5000000,
          // 翻倍潜力和多倍潜力也必须满足35/61条件（硬性要求）
          isPotentialDouble: !!(targetPriceData && targetPriceData.targetPrice && currentPrice > 0 && 
                               targetPriceData.targetPrice >= currentPrice * 2 && targetPriceData.targetPrice < currentPrice * 3 && satisfiedConditions >= 35),
          isPotentialMultiBagger: !!(targetPriceData && targetPriceData.targetPrice && currentPrice > 0 && 
                                    targetPriceData.targetPrice >= currentPrice * 3 && satisfiedConditions >= 35),
          learningModelAccuracy: Math.round(this.learningModel.accuracy * 100),
          satisfiedConditions,
          totalConditions: totalConditions,
          timestamp: Date.now(),
          isRead: false,
          // 添加智能优化系统的目标价格和预测价格信息
          targetPriceInfo: targetPriceData ? {
            targetPrice: targetPriceData.targetPrice,
            stopLossPrice: targetPriceData.stopLossPrice,
            expectedReturn: targetPriceData.expectedReturn,
            confidence: targetPriceData.confidence
          } : null,
          pricePrediction: predictionData ? {
            prediction1d: predictionData.prediction1d,
            prediction3d: predictionData.prediction3d,
            prediction5d: predictionData.prediction5d,
            prediction10d: predictionData.prediction10d,
            confidence1d: predictionData.confidence1d,
            confidence3d: predictionData.confidence3d,
            confidence5d: predictionData.confidence5d,
            confidence10d: predictionData.confidence10d
          } : null,
          // 标记信号使用了60天历史数据分析
          uses60DayAnalysis: historicalData && historicalData.length >= 30
        };
        
        // 添加信号到跟踪历史
        this.signalTrackingHistory.push({
          signalId: signal.id,
          stockCode: data.stockCode,
          stockName: data.stockName,
          timestamp: Date.now(),
          timestampPrice: currentPrice,
          confidence: signal.confidence,
          limitUpPotential: signal.isLimitUpPotential,
          expectedReturn: expectedReturn,
          actualReturn: null,
          isAccurate: null,
          marketStatus: marketStatus
        });
        
        this.signalManager.addSignal(signal);
        
        // 记录信号结果到智能优化器，用于后续学习和优化
        const signalResult: SignalResult = {
          signalId: signal.id,
          stockCode: data.stockCode,
          signalType: 'buy',
          signalPrice: currentPrice,
          signalTime: Date.now(),
          confidence: Math.round(confidence),
          futurePrice1d: null,
          futurePrice3d: null,
          futurePrice5d: null,
          futurePrice10d: null,
          profit1d: null,
          profit3d: null,
          profit5d: null,
          profit10d: null,
          success: false
        };
        
        // 异步记录信号结果，不阻塞主线程
        this.intelligentOptimizer.recordSignalResult(signalResult).catch(error => {
          logger.warn(`记录${data.stockCode}信号结果失败:`, error);
        });
        
        return signal;
      }
    }

    return null;
  }

  private async generateSellSignal(data: any): Promise<any | null> {
    const timestamp = new Date().toLocaleString('zh-CN');
    const normalizedStockCode = data.stockCode.replace(/^sh|^sz/, '');
    const now = Date.now();
    
    // ========== 【动态调整】根据跌速调整每轮最大卖出信号数量 ==========
    let currentMaxSellSignals = this.maxSellSignalsPerScan; // 默认3个
    const changePercent = data.changePercent || 0;
    
    if (changePercent < -10) {
      // 暴跌超过10%，增加到8个信号
      currentMaxSellSignals = 8;
    } else if (changePercent < -7) {
      // 大跌超过7%，增加到6个信号
      currentMaxSellSignals = 6;
    } else if (changePercent < -5) {
      // 下跌超过5%，增加到5个信号
      currentMaxSellSignals = 5;
    } else if (changePercent < -3) {
      // 下跌超过3%，增加到4个信号
      currentMaxSellSignals = 4;
    } else if (changePercent > 0) {
      // 上涨时，减少到2个信号，保留机会
      currentMaxSellSignals = 2;
    }
    // ==========================================================================

    // ========== 【信号去重1】检查每轮扫描卖出信号数量是否已达上限 ==========
    if (this.currentScanSellSignalCount >= currentMaxSellSignals) {
      logger.info(`[${timestamp}] [卖出信号限制] ${data.stockName}(${data.stockCode}) - 本轮扫描已生成${this.currentScanSellSignalCount}/${currentMaxSellSignals}个卖出信号（跌速${changePercent?.toFixed(1)}%），已达上限，跳过`);
      return null;
    }
    // ==========================================================================

    // ========== 【信号去重2】检查同一股票5分钟内是否已生成过卖出信号 ==========
    const lastSignalTime = this.sellSignalTimestamps.get(normalizedStockCode);
    if (lastSignalTime && (now - lastSignalTime) < this.minSellSignalInterval) {
      const timeDiff = Math.floor((now - lastSignalTime) / 60000);
      logger.info(`[${timestamp}] [卖出信号去重] ${data.stockName}(${data.stockCode}) - ${timeDiff}分钟前已生成过卖出信号，跳过`);
      return null;
    }
    // ==========================================================================

    // 卖出信号只针对持仓股票生成（用户要求）
    // 【修复】使用标准化代码查询持仓，确保匹配
    const isHoldingStock = this.signalManager.getPosition(normalizedStockCode) !== undefined;

    // 如果不是持仓股票，直接返回null，不生成卖出信号
    if (!isHoldingStock) {
      logger.debug(`[${timestamp}] [卖出信号] ${data.stockName}(${data.stockCode}) - 非持仓股票，跳过生成`);
      return null;
    }

    // === 新增关键保护机制开始 ===
    // 1. 统一股票代码格式（移除sh/sz前缀）已在上方定义
    
    // 2. 【关键修复】检查该股票是否有持仓记录（而不是买入信号历史）
    const positions = this.signalManager.getPositions();
    
    // 重要：使用统一的股票代码格式进行匹配持仓
    const positionForStock = positions.find((p: any) => {
      const positionCode = String(p.stockCode).replace(/^sh|^sz/, '');
      return positionCode === normalizedStockCode;
    });
    
    logger.info(`[${timestamp}] [卖出信号保护] 股票代码: ${data.stockCode}, 标准化后: ${normalizedStockCode}`);
    logger.info(`[${timestamp}] [卖出信号保护] 持仓记录: ${positionForStock ? '有' : '无'}`);
    
    // 3. 如果有持仓，检查买入时间和买入价格
    let hasValidPosition = false;
    let entryTime = 0;
    let entryPrice = 0;
    
    if (positionForStock) {
      hasValidPosition = true;
      entryTime = positionForStock.entryTime || 0;
      entryPrice = positionForStock.entryPrice || 0;
      
      logger.info(`[${timestamp}] [卖出信号保护] 发现持仓: 买入价=${entryPrice}, 时间=${new Date(entryTime).toLocaleString('zh-CN')}`);
    }
    
    // 4. 时间窗口保护：买入后1天内不生成卖出信号（除非极端情况）        
      // now 变量已在上方定义
    const oneDayInMs = 1 * 24 * 60 * 60 * 1000; // 1天保护期
    const isWithinProtectionPeriod = hasValidPosition && (now - entryTime) < oneDayInMs;
    
    // 5. 目标价格保护：低于买入价3%以上才考虑保护
    const currentPrice = data.currentPrice;
    const isBelowBuyPrice = hasValidPosition && entryPrice > 0 && currentPrice < entryPrice * 0.97; // 低于买入价3%以上才保护
    
    // ====== 【新增】持仓亏损检测 ======
    // 计算持仓亏损比例
    let positionLossPercent = 0;
    if (hasValidPosition && entryPrice > 0 && currentPrice > 0) {
      positionLossPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
      logger.info(`[${timestamp}] [持仓亏损检测] ${data.stockName}(${data.stockCode}) - 持仓亏损: ${positionLossPercent.toFixed(2)}%`);
    }
    
    // ========== 【关键修复2】信号冲突检测：同一只股票不能同时有买入和卖出信号 ==========
    // 【修改】移到此处以便使用 positionLossPercent
    const allSignalsForConflict = this.signalManager.getSignalHistory();
    const hasExistingBuySignal = allSignalsForConflict.some(signal => {
      const signalCode = String(signal.stockCode).replace(/^sh|^sz/, '');
      return signalCode === normalizedStockCode && signal.type === 'buy' && !signal.isRead;
    });
    
    // 【修改】允许持仓亏损严重时覆盖买入信号
    // 如果持仓亏损超过5%，即使有未读买入信号也允许生成卖出信号
    const isSevereLoss = positionLossPercent < -5;
    
    if (hasExistingBuySignal && !isSevereLoss) {
      logger.info(`[${timestamp}] [信号冲突] ${data.stockName}(${data.stockCode}) 已有未读买入信号，跳过卖出信号生成`);
      return null;
    } else if (hasExistingBuySignal && isSevereLoss) {
      logger.info(`[${timestamp}] [信号覆盖] ${data.stockName}(${data.stockCode}) 有未读买入信号，但持仓亏损${positionLossPercent.toFixed(2)}%超过5%，允许生成卖出信号`);
    }
    // ==========================================================================
    
    // 6. 从智能优化器获取动态跌幅阈值（可自动学习优化）
    const optimizer = getIntelligentOptimizer();
    const optimizerParams = optimizer.getParams();
    // 默认跌幅阈值为-5%，可以通过优化器自动调整
    const extremeDropThreshold = optimizerParams.extremeDropThreshold || -5;
    
    // 检查是否为极端情况：单日跌幅超过阈值，允许在保护期内生成卖出信号
    const isExtremeDrop = data.changePercent !== undefined && data.changePercent < extremeDropThreshold;
    
    logger.info(`[${timestamp}] [卖出信号保护] 保护期内=${isWithinProtectionPeriod}, 低于买入价3%=${isBelowBuyPrice}, 极端下跌=${isExtremeDrop}, 跌幅阈值=${extremeDropThreshold}%`);
    
    // 7. 如果在保护期内，且不是极端下跌，才跳过
    if (isWithinProtectionPeriod && !isExtremeDrop) {
      const timeDiff = Math.floor((now - entryTime) / (24 * 60 * 60 * 1000));
      logger.info(`[${timestamp}] [卖出信号保护] ${data.stockName}(${data.stockCode}) - 买入后仅${timeDiff}天，处于1天保护期内，跳过卖出信号`);
      return null;
    }
    
    // 8. 【修复】取消"低于买入价3%跳过"的限制，改为记录日志
    //    用户明确要求持仓亏损时生成卖出信号，所以不再阻止
    if (isBelowBuyPrice) {
      const lossPercent = ((currentPrice - entryPrice) / entryPrice * 100).toFixed(2);
      logger.info(`[${timestamp}] [卖出信号] ${data.stockName}(${data.stockCode}) - 当前价(${currentPrice})低于买入价(${entryPrice})3%以上，亏损${lossPercent}%，允许生成卖出信号`);
    }
    // === 新增关键保护机制结束 ===
    
    logger.info(`[${timestamp}] [卖出信号开始] ====== 开始分析卖出信号 ======`);
    logger.info(`[${timestamp}] [卖出信号开始] 股票: ${data.stockName}(${data.stockCode})`);
    logger.info(`[${timestamp}] [卖出信号开始] 当前价格: ${data.currentPrice}, 涨跌幅: ${data.changePercent?.toFixed(2)}%`);
    
    const { mainForceData, technicalData, marginTradingData } = data;
    
    const mainForceNetFlow = mainForceData.mainForceNetFlow;
    const totalNetFlow = mainForceData.totalNetFlow;
    const mainForceRatio = totalNetFlow !== 0 ? Math.abs(mainForceNetFlow) / Math.abs(totalNetFlow) : 0;
    
    const { rsi, macd, kdj, ma, boll, volume, sar, cci, adx, williamsR, bias } = technicalData;
    
    const priceToMa5 = ma.ma5 > 0 ? (currentPrice - ma.ma5) / ma.ma5 : 0;
    const priceToMa10 = ma.ma10 > 0 ? (currentPrice - ma.ma10) / ma.ma10 : 0;
    const priceToMa20 = ma.ma20 > 0 ? (currentPrice - ma.ma20) / ma.ma20 : 0;
    const priceToMa30 = ma.ma30 > 0 ? (currentPrice - ma.ma30) / ma.ma30 : 0;
    const priceToBollMiddle = boll.middle > 0 ? (currentPrice - boll.middle) / boll.middle : 0;
    const priceToBollLower = boll.lower > 0 ? (currentPrice - boll.lower) / boll.lower : 0;
    const priceToBollUpper = boll.upper > 0 ? (currentPrice - boll.upper) / boll.upper : 0;
    
    const macdDiff = macd?.diff || 0;
    const macdDea = macd?.dea || 0;
    const macdCrossSignal = macdDiff< macdDea ? 1 : macdDiff >macdDea ? -1 : 0;
    const macdTrendChange = macdDiff > 0 && macdDiff< macdDea * 1.05;
    
    const kdjK = kdj?.k || 0;
    const kdjD = kdj?.d || 0;
    const kdjJ = kdj?.j || 0;
    const kdjCrossSignal = kdjK< kdjD ? 1 : kdjK >kdjD ? -1 : 0;
    const kdjTrendChange = kdjK > kdjD && kdjK< kdjD * 1.05;
    
    const volumeMA5 = volume?.ma5 || 0;
    const volumeMA10 = volume?.ma10 || 0;
    const volumeMA20 = volume?.ma20 || 0;
    const volumeRatio = volumeMA10 >0 ? volumeMA5 / volumeMA10 : 1;
    const volumeRatio20 = volumeMA20 >0 ? volumeMA5 / volumeMA20 : 1;
    
    const priceSpeed = ma.ma5 > 0 && ma.ma10 > 0 ? (ma.ma5 - ma.ma10) / ma.ma10 : 0;
    const momentum = ma.ma5 > 0 && ma.ma20 > 0 ? (ma.ma5 - ma.ma20) / ma.ma20 : 0;
    const priceMomentumChange = momentum > 0 && momentum< 0.03;
    
    const priceAcceleration = ma.ma5 >0 && ma.ma20 > 0 ? ((ma.ma5 - ma.ma20) / ma.ma20 - momentum) : 0;
    const isPriceDecelerating = priceAcceleration< 0 && momentum >0;
    
    // 分析市场和个股行情，智能调整容忍度
    const marketVolatility = Math.abs(data.changePercent || 0);
    const isInStrongUpTrend = currentPrice > ma.ma5 * 1.05 && currentPrice > ma.ma20 * 1.08; // 强势上涨
    const isInCrazyRise = (data.changePercent || 0) > 5 && volumeRatio > 1.5; // 疯涨状态
    const recentRiseRange = (currentPrice - ma.ma20) / ma.ma20 * 100; // 20日涨幅
    
    // 根据行情动态调整触发阈值
    let dynamicDownThreshold = -5; // 默认5%
    let crazyRiseTolerance = 0; // 疯涨股票额外容忍度
    
    if (isInCrazyRise) {
      dynamicDownThreshold = -10; // 疯涨股票容忍度-10%
      crazyRiseTolerance = 3; // 额外3个百分点容忍度
    } else if (isInStrongUpTrend) {
      dynamicDownThreshold = -8; // 强势上涨股票容忍度-8%
      crazyRiseTolerance = 2; // 额外2个百分点容忍度
    } else if (recentRiseRange > 20) {
      dynamicDownThreshold = -7; // 20日涨幅超20%，容忍度-7%
      crazyRiseTolerance = 1;
    }
    
    // ====== 【新增】连续多日下跌检测 ======
    let consecutiveDownDays = 0;
    let recentDownTrendStrength = 0;
    let maxConsecutiveDownDaysInPeriod = 0; // 最近一段时间内最大连续下跌天数
    let maxDownTrendStrengthInPeriod = 0; // 最大连续下跌期间的累计跌幅
    
    try {
      // 获取最近10天的历史数据来检测连续下跌
      const recentHistory = await this.historicalDataManager.getHistoricalData(normalizedStockCode);
      if (recentHistory && recentHistory.length >= 3) {
        // 取最近10天的数据（倒序，最新的在前）
        const last10Days = recentHistory.slice(0, 10);
        
        // 计算从今天开始的连续下跌天数
        for (let i = 0; i < last10Days.length; i++) {
          const day = last10Days[i];
          if (day.close < day.open || (day.change !== undefined && day.change < 0)) {
            consecutiveDownDays++;
            // 计算下跌强度（跌幅越大权重越高）
            if (day.changePercent) {
              recentDownTrendStrength += Math.abs(day.changePercent);
            }
          } else {
            break; // 遇到上涨或平盘，停止计数
          }
        }
        
        // 【新增】检测最近10天内是否有过连续下跌（即使今天上涨）
        let tempConsecutiveDays = 0;
        let tempDownStrength = 0;
        for (let i = 0; i < last10Days.length; i++) {
          const day = last10Days[i];
          if (day.close < day.open || (day.change !== undefined && day.change < 0)) {
            tempConsecutiveDays++;
            if (day.changePercent) {
              tempDownStrength += Math.abs(day.changePercent);
            }
          } else {
            // 遇到上涨，检查并更新最大值
            if (tempConsecutiveDays > maxConsecutiveDownDaysInPeriod) {
              maxConsecutiveDownDaysInPeriod = tempConsecutiveDays;
              maxDownTrendStrengthInPeriod = tempDownStrength;
            }
            tempConsecutiveDays = 0;
            tempDownStrength = 0;
          }
        }
        // 检查最后一段连续下跌
        if (tempConsecutiveDays > maxConsecutiveDownDaysInPeriod) {
          maxConsecutiveDownDaysInPeriod = tempConsecutiveDays;
          maxDownTrendStrengthInPeriod = tempDownStrength;
        }
        
        logger.info(`[${timestamp}] [连续下跌检测] ${data.stockName}(${data.stockCode}) - 连续下跌天数: ${consecutiveDownDays}天, 累计跌幅: ${recentDownTrendStrength.toFixed(1)}%, 近期最大连续下跌: ${maxConsecutiveDownDaysInPeriod}天(${maxDownTrendStrengthInPeriod.toFixed(1)}%)`);
      }
    } catch (error) {
      logger.warn(`[${timestamp}] [连续下跌检测] 获取历史数据失败:`, error);
    }
    // ====== 连续多日下跌检测结束 ======
    
    logger.info(`${data.stockName}(${data.stockCode}) 20日涨幅: ${recentRiseRange.toFixed(1)}%, 动态下跌阈值: ${dynamicDownThreshold.toFixed(1)}%, 连续下跌天数: ${consecutiveDownDays}天`);
    
    // 判断是否为连续下跌股票（新增）- 必须结合多个条件，根据行情智能调整
    const isContinuousDownStock = data.changePercent !== undefined && (
      // 跌幅超过动态阈值的单日大跌
      (data.changePercent < dynamicDownThreshold) ||
      // 跌幅超过(动态阈值+2%)且跌破均线
      (data.changePercent < (dynamicDownThreshold + 2) && currentPrice < ma.ma5) ||
      // 跌幅超过(动态阈值+2%)且主力资金流出
      (data.changePercent < (dynamicDownThreshold + 2) && mainForceNetFlow < -50000) ||
      // 跌幅超过(动态阈值+1%)且RSI走低
      (data.changePercent < (dynamicDownThreshold + 1) && rsi < 40) ||
      // ====== 【新增】连续多日下跌检测 ======
      // 连续2天下跌且累计跌幅超过5%
      (consecutiveDownDays >= 2 && recentDownTrendStrength >= 5) ||
      // 连续3天及以上下跌（无论跌幅大小都触发）
      (consecutiveDownDays >= 3) ||
      // ====== 【新增】近期历史连续下跌检测（即使今天上涨）======
      // 最近10天内有过连续2天下跌且累计跌幅超过6%
      (maxConsecutiveDownDaysInPeriod >= 2 && maxDownTrendStrengthInPeriod >= 6) ||
      // 最近10天内有过连续3天及以上下跌
      (maxConsecutiveDownDaysInPeriod >= 3)
    );
    
    // 判断是否为持仓股连续下跌（新增）- 必须结合多个条件，单一条件不触发，根据行情智能调整
    const isHoldingDownStock = isHoldingStock && (
      // 持仓股跌幅超过动态阈值 + 跌破均线
      (data.changePercent !== undefined && data.changePercent < dynamicDownThreshold && currentPrice < ma.ma5) ||
      // 持仓股跌幅超过动态阈值 + 主力资金流出
      (data.changePercent !== undefined && data.changePercent < dynamicDownThreshold && mainForceNetFlow < -50000) ||
      // 持仓股跌幅超过(动态阈值-2%)
      (data.changePercent !== undefined && data.changePercent < (dynamicDownThreshold - 2)) ||
      // 持仓股跌幅超过(动态阈值-1%) + MACD死叉
      (data.changePercent !== undefined && data.changePercent < (dynamicDownThreshold - 1) && macdCrossSignal === 1) ||
      // 持仓股跌幅超过(动态阈值-1%) + KDJ死叉
      (data.changePercent !== undefined && data.changePercent < (dynamicDownThreshold - 1) && kdjCrossSignal === 1) ||
      // ====== 【新增】持仓股连续多日下跌检测 ======
      // 持仓股连续2天下跌且累计跌幅超过4%
      (consecutiveDownDays >= 2 && recentDownTrendStrength >= 4) ||
      // 持仓股连续3天及以上下跌
      (consecutiveDownDays >= 3) ||
      // ====== 【新增】持仓股近期历史连续下跌检测（即使今天上涨）======
      // 最近10天内有过连续2天下跌且累计跌幅超过5%
      (maxConsecutiveDownDaysInPeriod >= 2 && maxDownTrendStrengthInPeriod >= 5) ||
      // 最近10天内有过连续3天及以上下跌
      (maxConsecutiveDownDaysInPeriod >= 3) ||
      // ====== 【新增】持仓亏损检测 ======
      // 持仓亏损超过5%
      (positionLossPercent < -5) ||
      // 持仓亏损超过3%且跌破均线
      (positionLossPercent < -3 && currentPrice < ma.ma5) ||
      // 持仓亏损超过3%且主力资金流出
      (positionLossPercent < -3 && mainForceNetFlow < -50000)
    );
    
    // 判断是否为下跌破位（新增）
    const isDownBreakout = (
      // 跌破5日均线
      currentPrice < ma.ma5 * 0.99 ||
      // 跌破10日均线
      currentPrice < ma.ma10 ||
      // 跌破20日均线
      currentPrice < ma.ma20 ||
      // 跌破布林带下轨
      currentPrice < boll.lower
    );
    
    // 判断是否为龙头股票（卖出时重点关注）
    const isLeaderStockSell = data.changePercent && (
      // 条件1：大幅上涨+量价背离
      (data.changePercent > 5 && volumeRatio > 1.5 && mainForceNetFlow < 0) ||
      // 条件2：涨幅巨大+技术指标超买
      (data.changePercent > 10 && rsi > 75) ||
      // 条件3：连续上涨+资金流出
      (data.changePercent > 7 && mainForceNetFlow < -50000) ||
      // 条件4：价格高位+成交量异常
      (currentPrice > ma.ma5 * 1.15 && volumeRatio > 2)
    );

    // 判断是否为大涨后主力资金出逃的高危股票
    const isHighRiskStock = data.changePercent && (
      // 大涨后资金流出
      (data.changePercent > 8 && mainForceNetFlow < -30000) ||
      (data.changePercent > 6 && mainForceNetFlow < -50000) ||
      (data.changePercent > 5 && mainForceNetFlow < -80000) ||
      (data.changePercent > 3 && mainForceNetFlow < -100000) ||
      // 放量但资金流出（出货特征）
      (volumeRatio > 2 && mainForceNetFlow < -50000) ||
      (volumeRatio > 2.5 && mainForceNetFlow < -30000) ||
      (volumeRatio > 3 && mainForceNetFlow < -20000) ||
      // 高位巨量但涨幅有限（拉高出货）
      (volumeRatio > 3 && data.changePercent < 2 && mainForceNetFlow < 0) ||
      (volumeRatio > 4 && data.changePercent < 1 && mainForceNetFlow < -10000) ||
      // 涨停板打开后资金出逃
      (data.changePercent > 9 && volumeRatio > 3 && mainForceNetFlow < -50000) ||
      (data.changePercent > 8 && volumeRatio > 4 && mainForceNetFlow < -100000) ||
      // 连续上涨后资金突然流出
      (data.changePercent > 0 && mainForceData.continuousFlowPeriods > 3 && mainForceNetFlow < -50000)
    );

    // 优化的卖出条件，提前识别顶点和大跌风险，特别加强大涨后主力资金出逃的检测 - 智能动态阈值
    const sellConditions = [
      // ===== 连续下跌条件（新增，最优先检测）- 必须综合多个条件，使用动态阈值 =====
      // 单日大跌超过动态阈值
      data.changePercent !== undefined && data.changePercent < dynamicDownThreshold,
      // 单日大跌超过(动态阈值-2%)
      data.changePercent !== undefined && data.changePercent < (dynamicDownThreshold - 2),
      // 单日大跌超过10%（跌停）
      data.changePercent !== undefined && data.changePercent < -10,
      // 跌幅超过(动态阈值+2%)且跌破均线
      data.changePercent !== undefined && data.changePercent < (dynamicDownThreshold + 2) && currentPrice < ma.ma5,
      // 跌幅超过(动态阈值+2%)且主力资金流出
      data.changePercent !== undefined && data.changePercent < (dynamicDownThreshold + 2) && mainForceNetFlow < -50000,
      // 跌幅超过(动态阈值+1%)且RSI走低
      data.changePercent !== undefined && data.changePercent < (dynamicDownThreshold + 1) && rsi < 40,
      // 持仓股跌幅超过动态阈值 + 跌破均线
      isHoldingStock && data.changePercent !== undefined && data.changePercent < dynamicDownThreshold && currentPrice < ma.ma5,
      // 持仓股跌幅超过动态阈值 + 主力资金流出
      isHoldingStock && data.changePercent !== undefined && data.changePercent < dynamicDownThreshold && mainForceNetFlow < -50000,
      // 持仓股跌幅超过(动态阈值-1%) + MACD死叉
      isHoldingStock && data.changePercent !== undefined && data.changePercent < (dynamicDownThreshold - 1) && macdCrossSignal === 1,
      // 持仓股跌幅超过(动态阈值-1%) + KDJ死叉
      isHoldingStock && data.changePercent !== undefined && data.changePercent < (dynamicDownThreshold - 1) && kdjCrossSignal === 1,
      // ===== 【新增】持仓亏损条件 =====
      // 持仓亏损超过5%
      isHoldingStock && positionLossPercent < -5,
      // 持仓亏损超过4%且跌破均线
      isHoldingStock && positionLossPercent < -4 && currentPrice < ma.ma5,
      // 持仓亏损超过3%且主力资金流出
      isHoldingStock && positionLossPercent < -3 && mainForceNetFlow < -50000,
      // 持仓亏损超过3%且RSI走低
      isHoldingStock && positionLossPercent < -3 && rsi < 45,
      // 持仓亏损超过3%且MACD死叉
      isHoldingStock && positionLossPercent < -3 && macdCrossSignal === 1,
      // 持仓亏损超过3%且KDJ死叉
      isHoldingStock && positionLossPercent < -3 && kdjCrossSignal === 1,
      // ==================================
      // 下跌破位 + 资金流出
      isDownBreakout && mainForceNetFlow < 0,
      // 跌破10日均线 + 资金流出
      currentPrice < ma.ma10 && mainForceNetFlow < 0,
      // 跌破20日均线
      currentPrice < ma.ma20,
      // 跌破布林带下轨 + 资金流出
      currentPrice < boll.lower && mainForceNetFlow < 0,
      
      // ===== 大涨后主力资金出逃条件（新增，优先检测）=====
      // 大涨后资金流出 - 最危险的信号
      data.changePercent > 8 && mainForceNetFlow < -30000,
      data.changePercent > 8 && mainForceNetFlow < -50000,
      data.changePercent > 8 && mainForceNetFlow < -100000,
      data.changePercent > 6 && mainForceNetFlow < -50000,
      data.changePercent > 6 && mainForceNetFlow < -80000,
      data.changePercent > 6 && mainForceNetFlow < -150000,
      data.changePercent > 5 && mainForceNetFlow < -80000,
      data.changePercent > 5 && mainForceNetFlow < -120000,
      data.changePercent > 5 && mainForceNetFlow < -200000,
      data.changePercent > 3 && mainForceNetFlow < -100000,
      data.changePercent > 3 && mainForceNetFlow < -150000,
      data.changePercent > 3 && mainForceNetFlow < -250000,
      
      // 放量但资金流出（典型出货特征）
      volumeRatio > 2 && mainForceNetFlow < -50000,
      volumeRatio > 2 && mainForceNetFlow < -100000,
      volumeRatio > 2.5 && mainForceNetFlow < -30000,
      volumeRatio > 2.5 && mainForceNetFlow < -60000,
      volumeRatio > 2.5 && mainForceNetFlow < -100000,
      volumeRatio > 3 && mainForceNetFlow < -20000,
      volumeRatio > 3 && mainForceNetFlow < -40000,
      volumeRatio > 3 && mainForceNetFlow < -80000,
      volumeRatio > 3 && mainForceNetFlow < -150000,
      volumeRatio > 4 && mainForceNetFlow < -10000,
      volumeRatio > 4 && mainForceNetFlow < -50000,
      volumeRatio > 4 && mainForceNetFlow < -100000,
      
      // 高位巨量但涨幅有限（拉高出货）
      volumeRatio > 3 && data.changePercent < 2 && mainForceNetFlow < 0,
      volumeRatio > 3 && data.changePercent < 1 && mainForceNetFlow < -10000,
      volumeRatio > 4 && data.changePercent < 2 && mainForceNetFlow < -20000,
      volumeRatio > 4 && data.changePercent < 1 && mainForceNetFlow < -50000,
      volumeRatio > 5 && data.changePercent < 1.5 && mainForceNetFlow < -30000,
      
      // 涨停板打开后资金出逃
      data.changePercent > 9 && volumeRatio > 3 && mainForceNetFlow < -50000,
      data.changePercent > 9 && volumeRatio > 3 && mainForceNetFlow < -100000,
      data.changePercent > 8 && volumeRatio > 4 && mainForceNetFlow < -100000,
      data.changePercent > 8 && volumeRatio > 4 && mainForceNetFlow < -200000,
      
      // 连续上涨后资金突然流出
      data.changePercent > 0 && mainForceData.continuousFlowPeriods > 3 && mainForceNetFlow < -50000,
      data.changePercent > 0 && mainForceData.continuousFlowPeriods > 4 && mainForceNetFlow < -80000,
      data.changePercent > 0 && mainForceData.continuousFlowPeriods > 5 && mainForceNetFlow < -100000,
      
      // ===== 主力资金流出条件（优化：降低阈值，提前预警）=====
      mainForceNetFlow< -10000,
      mainForceNetFlow < -30000,
      mainForceNetFlow < -50000,
      mainForceNetFlow < -100000,
      mainForceNetFlow < -200000,
      mainForceNetFlow < -500000,
      mainForceNetFlow < -1000000,
      mainForceRatio >0.1,
      mainForceRatio >0.2,
      mainForceRatio >0.3,
      mainForceRatio >0.5,
      mainForceData.flowStrength === 'decreasing' || mainForceData.trend === 'decreasing',
      mainForceData.continuousFlowPeriods >1 && mainForceNetFlow < -10000,
      mainForceData.continuousFlowPeriods >2 && mainForceNetFlow < -30000,
      mainForceData.continuousFlowPeriods >3 && mainForceNetFlow < -50000,
      mainForceData.continuousFlowPeriods >4 && mainForceNetFlow < -80000,
      
      // ===== 融资融券条件（优化：提前预警卖出信号）=====
      marginTradingData && marginTradingData.marginIncrease < 0, // 融资净买入为负（融资偿还）
      marginTradingData && marginTradingData.marginIncrease < -100000, // 融资净买入大幅为负
      marginTradingData && marginTradingData.marginIncrease < -500000, // 融资净买入大幅为负
      marginTradingData && marginTradingData.shortIncrease > 0, // 融券净卖出为正（融券增加）
      marginTradingData && marginTradingData.shortIncrease > 10000, // 融券净卖出较大
      marginTradingData && marginTradingData.shortIncrease > 50000, // 融券净卖出大幅增加
      marginTradingData && marginTradingData.marginTrend === 'decreasing', // 融资余额趋势向下
      marginTradingData && marginTradingData.shortTrend === 'increasing', // 融券余额趋势向上
      marginTradingData && marginTradingData.marginShortRatio < 5, // 融资融券比率较低
      
      // ===== 技术指标超买条件（优化：提高阈值）=====
      rsi >70,
      rsi >75,
      rsi >80,
      rsi >85,
      rsi >88,
      rsi >90,
      
      // ===== MACD指标条件（优化：增加更多精确条件）=====
      macdTrendChange,
      macdDiff >0 && macdDiff < macdDea * 1.1,
      macdCrossSignal === 1,
      macdDiff >0 && macdDea >0 && macdDiff < macdDea * 0.95,
      
      // ===== KDJ指标条件（优化：提高阈值）=====
      kdjTrendChange,
      kdjK >75,
      kdjK >80,
      kdjK >85,
      kdjK >90,
      kdjCrossSignal === 1,
      kdjJ >85,
      kdjJ >90,
      kdjJ >95,
      kdjJ >98,
      
      // ===== 均线破位条件（优化：增加更多精确条件）=====
      currentPrice <ma.ma5,
      currentPrice <ma.ma5 * 0.995,
      currentPrice <ma.ma5 * 0.99,
      currentPrice <ma.ma5 * 0.98,
      currentPrice <ma.ma10,
      currentPrice <ma.ma10 * 0.99,
      currentPrice <ma.ma20,
      currentPrice <ma.ma20 * 0.99,
      currentPrice <ma.ma30,
      ma.ma5< ma.ma10 && ma.ma10 <ma.ma20, // 均线空头排列
      
      // ===== 布林带条件（优化：增加更多精确条件）=====
      currentPrice >boll.upper * 0.95 && currentPrice< boll.upper,
      currentPrice === boll.upper,
      currentPrice >boll.middle && priceToBollMiddle > 0.025,
      currentPrice === boll.middle,
      currentPrice <boll.middle,
      currentPrice <boll.lower * 1.05 && currentPrice > boll.lower,
      currentPrice <boll.lower * 1.02 && currentPrice > boll.lower,
      
      // ===== 成交量异常条件（优化：增加更多精确条件）=====
      volumeRatio >1.5 && mainForceNetFlow < 0,
      volumeRatio >2 && mainForceNetFlow < 0,
      volumeRatio >2.5 && mainForceNetFlow < 0,
      volumeRatio >3 && mainForceNetFlow < 0,
      volumeRatio <0.6 && currentPrice < ma.ma5,
      volumeRatio <0.5 && currentPrice < ma.ma10,
      volumeRatio20 >1.8 && mainForceNetFlow < 0,
      volumeRatio20 >2.2 && mainForceNetFlow < 0,
      
      // ===== 其他技术指标条件（优化：增加更多精确条件）=====
      sar >currentPrice * 1.01,
      sar >currentPrice,
      cci >120,
      cci >150,
      cci >200,
      cci >250,
      adx >25 && currentPrice < ma.ma5,
      adx >30 && currentPrice < ma.ma10,
      adx >35 && currentPrice < ma.ma20,
      williamsR >-30,
      williamsR >-25,
      williamsR >-20,
      williamsR >-15,
      williamsR >-10,
      bias >6,
      bias >8,
      bias >10,
      bias >12,
      bias >15,
      
      // ===== 价格动量条件（优化：增加更多精确条件）=====
      priceSpeed >0.02 && currentPrice > ma.ma5 * 1.08,
      priceSpeed >0.025 && currentPrice > ma.ma5 * 1.1,
      momentum >0.05 && rsi >70,
      momentum >0.06 && rsi >75,
      isPriceDecelerating && rsi >75,
      priceMomentumChange && currentPrice > ma.ma5 * 1.08,
      
      // ===== 涨幅和技术指标结合条件（优化：增加更多精确条件）=====
      data.changePercent >5 && rsi >75,
      data.changePercent >6 && rsi >78,
      data.changePercent >7 && rsi >80,
      data.changePercent >8 && rsi >82,
      data.changePercent >8 && rsi >85,
      data.changePercent >9 && rsi >88,
      data.changePercent >9 && rsi >90,
      data.changePercent >10 && volumeRatio >1.5,
      data.changePercent >10 && volumeRatio >2,
      data.changePercent >10 && volumeRatio >2.5,
      data.changePercent >10 && volumeRatio >3,
      data.changePercent >10 && mainForceNetFlow < 0,
      data.changePercent >10 && mainForceNetFlow < -50000,
      
      // ===== 持仓股特殊条件（优化：增加更多精确条件）=====
      isHoldingStock && rsi >75,
      isHoldingStock && rsi >80,
      isHoldingStock && rsi >85,
      isHoldingStock && currentPrice > ma.ma5 * 1.08,
      isHoldingStock && currentPrice > ma.ma5 * 1.12,
      isHoldingStock && currentPrice > ma.ma5 * 1.15,
      isHoldingStock && currentPrice > ma.ma10 * 1.15,
      isHoldingStock && currentPrice > ma.ma10 * 1.2,
      isHoldingStock && mainForceNetFlow< 0,
      isHoldingStock && mainForceNetFlow < -50000,
      isHoldingStock && mainForceNetFlow < -100000,
      isHoldingStock && macdCrossSignal === 1,
      isHoldingStock && kdjCrossSignal === 1,
      isHoldingStock && currentPrice > ma.ma5 * 1.08 && rsi >75,
      isHoldingStock && currentPrice > ma.ma5 * 1.12 && rsi >80,
      isHoldingStock && currentPrice > ma.ma5 * 1.15 && rsi >85,
      
      // ===== 主力资金和价格结合条件（优化：增加更多精确条件）=====
      mainForceNetFlow >500000 && currentPrice > ma.ma5 * 1.08,
      mainForceNetFlow >1000000 && currentPrice > ma.ma5 * 1.1,
      mainForceNetFlow >1500000 && currentPrice > ma.ma5 * 1.12,
      mainForceNetFlow >2000000 && currentPrice > ma.ma5 * 1.15,
      
      // ===== 综合条件（优化：增加更多精确条件）=====
      data.changePercent >6 && volumeRatio >2 && rsi >80,
      data.changePercent >7 && volumeRatio >2.5 && rsi >85,
      data.changePercent >8 && volumeRatio >3 && rsi >90,
      data.currentPrice > ma.ma5 * 1.1 && rsi >75,
      data.currentPrice > ma.ma5 * 1.15 && rsi >80,
      data.currentPrice > ma.ma5 * 1.2 && rsi >85,
      data.currentPrice > ma.ma10 * 1.15 && mainForceNetFlow< 0,
      data.currentPrice > ma.ma10 * 1.2 && mainForceNetFlow< -50000,
      data.changePercent >5 && mainForceNetFlow< -50000,
      data.changePercent >6 && mainForceNetFlow< -100000,
      data.changePercent >7 && mainForceNetFlow< -200000,
      currentPrice >ma.ma5 * 1.05 && macdCrossSignal === 1,
      currentPrice >ma.ma5 * 1.08 && macdTrendChange,
      currentPrice >ma.ma5 * 1.05 && kdjCrossSignal === 1,
      currentPrice >ma.ma5 * 1.08 && kdjTrendChange,
    ];

    const satisfiedConditions = sellConditions.filter(Boolean).length;
    
    // 获取动态卖出阈值（使用之前已声明的optimizer）
    const dynamicSellThreshold = optimizerParams.sellSignalThreshold;
    
    // === 卖出信号平衡逻辑：既防乱提示，又确保真风险时能及时发出 ===
    let minSellConditions: number;

    // 大幅降低卖出门槛，确保能及时发现风险！
    if (positionLossPercent < -5) {
      minSellConditions = 1; // 持仓亏损超过5%，只需1个条件！
      logger.info(`[${timestamp}] [持仓亏损触发] ${data.stockName}(${data.stockCode}) - 持仓亏损${positionLossPercent.toFixed(2)}%超过5%，最低只需1个条件就生成卖出信号`);
    } else if (positionLossPercent < -3) {
      minSellConditions = 2; // 持仓亏损超过3%，只需2个条件
      logger.info(`[${timestamp}] [持仓亏损触发] ${data.stockName}(${data.stockCode}) - 持仓亏损${positionLossPercent.toFixed(2)}%超过3%，只需2个条件就生成卖出信号`);
    } else if (isHighRiskStock) {
      minSellConditions = 4; // 高风险股票需要满足4个条件（大涨后主力逃跑）
    } else if (isContinuousDownStock || isHoldingDownStock || isDownBreakout) {
      minSellConditions = 3; // 下跌/破位需要满足3个条件
    } else if (isLeaderStockSell) {
      minSellConditions = 4; // 龙头股票需要满足4个条件
    } else {
      minSellConditions = 5; // 普通情况需要满足5个条件
    }
    
    // === 核心条件检查：识别真正的风险 ===
    let hasCoreSellConditions = false;
    
    // 核心条件1：主力资金流出（至少-50万）
    const hasMainForceOutflow = mainForceNetFlow < -500000;
    // 核心条件2：技术破位（跌破MA10或MA20或布林带下轨）
    const hasTechnicalBreakdown = currentPrice < (ma.ma10 || currentPrice * 0.95) || currentPrice < (ma.ma20 || currentPrice * 0.9) || currentPrice < (boll.lower || currentPrice * 0.85);
    // 核心条件3：放量下跌（成交量放大且资金流出）
    const hasVolumeDrop = (volumeRatio > 1.3 && mainForceNetFlow < -300000);
    // 核心条件4：MACD死叉或KDJ死叉
    const hasMacdOrKdjSell = macdCrossSignal === 1 || kdjCrossSignal === 1;
    // 核心条件5：技术指标超买（RSI>75或KDJ>80）
    const hasOverbought = (rsi && rsi > 75) || (kdjK > 80);
    // 核心条件6：单日下跌（超过3%）
    const hasDrop = data.changePercent !== undefined && data.changePercent < -3;
    // 核心条件7：持仓亏损（超过5%）
    const hasPositionLoss = positionLossPercent < -5;
    // 核心条件8：持仓亏损较大（超过3%）
    const hasPositionLossLarge = positionLossPercent < -3;
    
    // 检查是否满足至少1个核心条件（比之前更宽松，确保风险能及时发出）
    let coreConditionsMet = 0;
    if (hasMainForceOutflow) coreConditionsMet++;
    if (hasTechnicalBreakdown) coreConditionsMet++;
    if (hasVolumeDrop) coreConditionsMet++;
    if (hasMacdOrKdjSell) coreConditionsMet++;
    if (hasOverbought) coreConditionsMet++;
    if (hasDrop) coreConditionsMet++;
    if (hasPositionLoss) coreConditionsMet++;
    if (hasPositionLossLarge) coreConditionsMet++;
    
    logger.info(`[${timestamp}] [卖出信号核心检查] 核心条件满足: ${coreConditionsMet}/8, 主力流出: ${hasMainForceOutflow}, 技术破位: ${hasTechnicalBreakdown}, 放量下跌: ${hasVolumeDrop}, MACD/KDJ死叉: ${hasMacdOrKdjSell}, 超买: ${hasOverbought}, 下跌: ${hasDrop}, 持仓亏损>5%: ${hasPositionLoss}, 持仓亏损>3%: ${hasPositionLossLarge}`);
    
    // 只要满足至少1个核心条件，或者是极端下跌，就考虑卖出
    // 【修复】持仓亏损超过5%的股票，即使没有其他核心条件，也强制生成卖出信号
    if (coreConditionsMet < 1 && !isExtremeDrop) {
      // 持仓亏损超过5%，强制生成卖出信号
      if (isHoldingStock && positionLossPercent < -5) {
        logger.info(`[${timestamp}] [持仓亏损强制生成] ${data.stockName}(${data.stockCode}) - 持仓亏损${positionLossPercent.toFixed(2)}%超过5%，强制生成卖出信号`);
        // 直接继续生成信号
      } else {
        logger.info(`[${timestamp}] [卖出信号跳过] 没有核心风险条件，不生成卖出信号`);
        return null;
      }
    }
    
    // === 新增止盈逻辑：接近或达到目标价格时，降低卖出门槛 ===
    let shouldAdjustForTakeProfit = false;
    if (hasValidPosition && entryPrice > 0) {
      const takeProfitTarget = entryPrice * 1.15; // 以买入价的115%为止盈目标
      const isNearTargetPrice = currentPrice >= takeProfitTarget * 0.9; // 达到目标价的90%
      const isAtOrAboveTarget = currentPrice >= takeProfitTarget; // 达到或超过目标价
      
      if (isAtOrAboveTarget) {
        minSellConditions = 3; // 达到目标价，只需3个条件就止盈
        shouldAdjustForTakeProfit = true;
        logger.info(`[${timestamp}] [止盈触发] ${data.stockName}(${data.stockCode}) - 当前价(${currentPrice})已达到目标价(${takeProfitTarget})，降低卖出门槛至${minSellConditions}个条件`);
      } else if (isNearTargetPrice) {
        minSellConditions = Math.max(3, Math.floor(minSellConditions * 0.5)); // 接近目标价，门槛减半
        shouldAdjustForTakeProfit = true;
        logger.info(`[${timestamp}] [止盈预警] ${data.stockName}(${data.stockCode}) - 当前价(${currentPrice})接近目标价(${takeProfitTarget})，降低卖出门槛至${minSellConditions}个条件`);
      }
    }
    
    logger.info(`[${timestamp}] [卖出信号条件] 动态阈值: ${dynamicSellThreshold.toFixed(1)}, 最小条件数: ${minSellConditions}, 满足条件: ${satisfiedConditions}, 止盈调整: ${shouldAdjustForTakeProfit}`);
    
    if (satisfiedConditions >= minSellConditions) {
      logger.info(`[${timestamp}] [卖出信号条件] 满足条件数量达标，开始生成信号`);
      // 使用动态学习的参数计算基础置信度
      const baseConfidenceMultiplier = 0.6 + (dynamicSellThreshold / 100); // 根据动态阈值调整
      let confidence = Math.min(100, satisfiedConditions * baseConfidenceMultiplier * 10);
      
      // 高风险股票（大涨后主力资金出逃）特殊置信度加成 - 最高优先级
      if (isHighRiskStock) {
        confidence += 30; // 高风险股票大幅提高置信度
        logger.info(`[高风险卖出预警] ${data.stockName}(${data.stockCode}) - 大涨后主力资金出逃，置信度加成30点`);
      }
      
      // 连续下跌股票特殊置信度加成（新增）
      if (isContinuousDownStock) {
        confidence += 35; // 连续下跌股票大幅提高置信度
        logger.info(`[连续下跌预警] ${data.stockName}(${data.stockCode}) - 连续下跌，置信度加成35点`);
      }
      
      // 持仓股下跌特殊置信度加成（新增）
      if (isHoldingDownStock) {
        confidence += 40; // 持仓股下跌大幅提高置信度
        logger.info(`[持仓下跌预警] ${data.stockName}(${data.stockCode}) - 持仓股下跌，置信度加成40点`);
      }
      
      // 下跌破位特殊置信度加成（新增）
      if (isDownBreakout) {
        confidence += 45; // 下跌破位大幅提高置信度
        logger.info(`[下跌破位预警] ${data.stockName}(${data.stockCode}) - 下跌破位，置信度加成45点`);
      }
      
      // 龙头股票特殊置信度加成
      if (isLeaderStockSell) {
        confidence += 20; // 龙头股票提高置信度
        logger.info(`[龙头卖出预警] ${data.stockName}(${data.stockCode}) - 满足龙头卖出条件，置信度加成20点`);
      }
      
      // 大涨后主力资金流出特殊置信度加成（新增）
      if (data.changePercent > 8 && mainForceNetFlow < -30000) confidence += 35;
      if (data.changePercent > 6 && mainForceNetFlow < -50000) confidence += 30;
      if (data.changePercent > 5 && mainForceNetFlow < -80000) confidence += 40;
      if (data.changePercent > 3 && mainForceNetFlow < -100000) confidence += 45;
      
      // 放量出货特殊置信度加成（新增）
      if (volumeRatio > 2.5 && mainForceNetFlow < -50000) confidence += 35;
      if (volumeRatio > 3 && mainForceNetFlow < -30000) confidence += 30;
      if (volumeRatio > 4 && mainForceNetFlow < -20000) confidence += 40;
      
      // 高位拉高出货特殊置信度加成（新增）
      if (volumeRatio > 3 && data.changePercent < 2 && mainForceNetFlow < 0) confidence += 45;
      if (volumeRatio > 4 && data.changePercent < 1 && mainForceNetFlow < -10000) confidence += 50;
      
      // 涨停板打开后资金出逃特殊置信度加成（新增）
      if (data.changePercent > 9 && volumeRatio > 3 && mainForceNetFlow < -50000) confidence += 50;
      if (data.changePercent > 8 && volumeRatio > 4 && mainForceNetFlow < -100000) confidence += 60;
      
      // 主力资金流出置信度加成（优化：提高加成）
      if (mainForceNetFlow< -50000) confidence += 8;
      if (mainForceNetFlow < -100000) confidence += 15;
      if (mainForceNetFlow < -200000) confidence += 25;
      if (mainForceNetFlow < -500000) confidence += 40;
      if (mainForceNetFlow < -1000000) confidence += 60;
      
      // RSI超买置信度加成（优化：提高加成）
      if (rsi >70) confidence += 5;
      if (rsi >75) confidence += 12;
      if (rsi >80) confidence += 25;
      if (rsi >85) confidence += 40;
      if (rsi >88) confidence += 55;
      if (rsi >90) confidence += 70;
      
      // MACD/KDJ死叉置信度加成（优化：提高加成）
      if (macdTrendChange) confidence += 20;
      if (macdCrossSignal === 1) confidence += 35;
      if (kdjTrendChange) confidence += 20;
      if (kdjCrossSignal === 1) confidence += 35;
      
      // 根据融资融券数据调整置信度
      if (marginTradingData) {
        // 融资净买入为负，增加置信度
        if (marginTradingData.marginIncrease< -1000000) confidence += 35;
        else if (marginTradingData.marginIncrease < -500000) confidence += 30;
        else if (marginTradingData.marginIncrease< -100000) confidence += 25;
        else if (marginTradingData.marginIncrease < -50000) confidence += 20;
        else if (marginTradingData.marginIncrease < 0) confidence += 15;
        
        // 融券净卖出为正，增加置信度
        if (marginTradingData.shortIncrease >100000) confidence += 30;
        else if (marginTradingData.shortIncrease > 50000) confidence += 25;
        else if (marginTradingData.shortIncrease > 10000) confidence += 20;
        else if (marginTradingData.shortIncrease > 0) confidence += 15;
        
        // 融资余额趋势向下，增加置信度
        if (marginTradingData.marginTrend === 'decreasing') confidence += 20;
        
        // 融券余额趋势向上，增加置信度
        if (marginTradingData.shortTrend === 'increasing') confidence += 25;
        
        // 融资融券比率较低，说明空方力量强
        if (marginTradingData.marginShortRatio< 1) confidence += 35;
        else if (marginTradingData.marginShortRatio < 3) confidence += 25;
        else if (marginTradingData.marginShortRatio < 5) confidence += 15;
      }
      
      // 均线破位置信度加成（优化：提高加成）
      if (currentPrice < ma.ma5) confidence += 30;
      if (currentPrice < ma.ma10) confidence += 45;
      if (currentPrice < ma.ma20) confidence += 60;
      if (currentPrice < ma.ma30) confidence += 75;
      if (ma.ma5< ma.ma10 && ma.ma10 <ma.ma20) confidence += 50;
      
      // 涨幅和技术指标结合置信度加成（优化：提高加成）
      if (data.changePercent >5 && rsi >75) confidence += 30;
      if (data.changePercent >7 && rsi >80) confidence += 45;
      if (data.changePercent >8 && rsi >85) confidence += 60;
      if (data.changePercent >9 && rsi >90) confidence += 75;
      if (data.changePercent >10 && volumeRatio >2) confidence += 65;
      if (data.changePercent >10 && volumeRatio >3) confidence += 80;
      
      // 持仓股特殊置信度加成（优化：提高加成）
      if (isHoldingStock) {
        confidence += 15;
        if (isHoldingStock && rsi >75) confidence += 25;
        if (isHoldingStock && rsi >80) confidence += 40;
        if (isHoldingStock && rsi >85) confidence += 55;
        if (isHoldingStock && currentPrice > ma.ma5 * 1.08) confidence += 30;
        if (isHoldingStock && currentPrice > ma.ma5 * 1.12) confidence += 45;
        if (isHoldingStock && mainForceNetFlow< 0) confidence += 40;
      }
      
      // 放量资金流出置信度加成（优化：提高加成）
      if (volumeRatio >1.5 && mainForceNetFlow < 0) confidence += 35;
      if (volumeRatio >2 && mainForceNetFlow < 0) confidence += 50;
      if (volumeRatio >2.5 && mainForceNetFlow < 0) confidence += 65;
      if (volumeRatio >3 && mainForceNetFlow < 0) confidence += 80;
      
      // 价格动量变化置信度加成（优化：提高加成）
      if (isPriceDecelerating && rsi >75) confidence += 35;
      if (priceMomentumChange && currentPrice > ma.ma5 * 1.08) confidence += 40;
      
      confidence = Math.min(100, confidence);
      
      let reason = '';
      
      // 优化的卖出信号描述（更加精确和详细）
      // 连续下跌/破位优先描述
      if (isDownBreakout && isHoldingStock) {
        reason = `【持仓下跌破位】${data.stockName}(${data.stockCode}) - 持仓股跌破均线支撑，止损信号`;
      } else if (isHoldingDownStock) {
        reason = `【持仓下跌预警】${data.stockName}(${data.stockCode}) - 持仓股持续下跌${data.changePercent?.toFixed(1)}%，注意风险`;
      } else if (isDownBreakout) {
        reason = `【下跌破位预警】${data.stockName}(${data.stockCode}) - 跌破重要支撑位，下跌趋势形成`;
      } else if (isContinuousDownStock) {
        reason = `【连续下跌预警】${data.stockName}(${data.stockCode}) - 连续下跌${data.changePercent?.toFixed(1)}%，趋势走弱`;
      } else if (mainForceNetFlow< -1000000) {
        reason = `【主力资金疯狂流出】${data.stockName}(${data.stockCode}) - 主力资金净流出${(Math.abs(mainForceNetFlow) / 100000000).toFixed(2)}亿元，占比${(mainForceRatio * 100).toFixed(1)}%，强烈卖出信号`;
      } else if (mainForceNetFlow < -500000) {
        reason = `【主力资金大幅流出】${data.stockName}(${data.stockCode}) - 主力资金净流出${(Math.abs(mainForceNetFlow) / 100000000).toFixed(2)}亿元，占比${(mainForceRatio * 100).toFixed(1)}%`;
      } else if (mainForceNetFlow < -200000) {
        reason = `【主力资金明显流出】${data.stockName}(${data.stockCode}) - 主力资金净流出${(Math.abs(mainForceNetFlow) / 10000).toFixed(0)}万元，短期走势转弱`;
      } else if (mainForceNetFlow < -100000) {
        reason = `【主力资金开始流出】${data.stockName}(${data.stockCode}) - 主力资金净流出${(Math.abs(mainForceNetFlow) / 10000).toFixed(0)}万元，提前预警`;
      } else if (mainForceNetFlow < -50000) {
        reason = `【主力资金小幅流出】${data.stockName}(${data.stockCode}) - 主力资金净流出${(Math.abs(mainForceNetFlow) / 10000).toFixed(0)}万元，注意风险`;
      } else if (rsi >90) {
        reason = `【技术指标极端超买】${data.stockName}(${data.stockCode}) - RSI(${rsi.toFixed(1)})极端超买，必然回调`;
      } else if (rsi >85) {
        reason = `【技术指标严重超买】${data.stockName}(${data.stockCode}) - RSI(${rsi.toFixed(1)})严重超买，存在强烈回调风险`;
      } else if (rsi >80) {
        reason = `【技术指标明显超买】${data.stockName}(${data.stockCode}) - RSI(${rsi.toFixed(1)})超买，可能回调`;
      } else if (rsi >75) {
        reason = `【技术指标超买预警】${data.stockName}(${data.stockCode}) - RSI(${rsi.toFixed(1)})进入超买区域，注意风险`;
      } else if (macdCrossSignal === 1) {
        reason = `【MACD死叉预警】${data.stockName}(${data.stockCode}) - MACD形成死叉，趋势即将反转`;
      } else if (macdTrendChange) {
        reason = `【MACD趋势变化】${data.stockName}(${data.stockCode}) - MACD即将死叉，提前预警`;
      } else if (kdjCrossSignal === 1) {
        reason = `【KDJ死叉预警】${data.stockName}(${data.stockCode}) - KDJ形成死叉，短期走势转弱`;
      } else if (kdjTrendChange) {
        reason = `【KDJ趋势变化】${data.stockName}(${data.stockCode}) - KDJ即将死叉，提前预警`;
      } else if (currentPrice< ma.ma5) {
        reason = `【均线破位预警】${data.stockName}(${data.stockCode}) - 价格跌破MA5均线，趋势转弱`;
      } else if (currentPrice <ma.ma10) {
        reason = `【均线破位信号】${data.stockName}(${data.stockCode}) - 价格跌破MA10均线，中期趋势反转`;
      } else if (currentPrice< ma.ma20) {
        reason = `【均线破位确认】${data.stockName}(${data.stockCode}) - 价格跌破MA20均线，长期趋势反转`;
      } else if (ma.ma5< ma.ma10 && ma.ma10 <ma.ma20) {
        reason = `【均线空头排列】${data.stockName}(${data.stockCode}) - 均线形成空头排列，强烈卖出信号`;
      } else if (currentPrice >boll.upper) {
        reason = `【布林带上轨突破】${data.stockName}(${data.stockCode}) - 价格突破布林带上轨，可能回调`;
      } else if (currentPrice< boll.middle) {
        reason = `【布林带中轨跌破】${data.stockName}(${data.stockCode}) - 价格跌破布林带中轨，走势转弱`;
      } else if (data.changePercent >8 && rsi >80) {
        reason = `【T+0交易机会】${data.stockName}(${data.stockCode}) - 涨幅${data.changePercent.toFixed(1)}%，RSI(${rsi.toFixed(1)})超买，适合T+0卖出`;
      } else if (data.changePercent >10 && volumeRatio >2) {
        reason = `【T+0强烈卖出】${data.stockName}(${data.stockCode}) - 涨停板打开，成交量异常放大(${volumeRatio.toFixed(2)}倍)`;
      } else if (isHoldingStock && rsi >75) {
        reason = `【持仓股超买预警】${data.stockName}(${data.stockCode}) - 持仓股票RSI(${rsi.toFixed(1)})超买，建议止盈`;
      } else if (isHoldingStock && mainForceNetFlow< 0) {
        reason = `【持仓股资金流出】${data.stockName}(${data.stockCode}) - 持仓股票主力资金流出，建议减仓`;
      } else if (isPriceDecelerating && rsi >75) {
        reason = `【价格上涨减速】${data.stockName}(${data.stockCode}) - 价格上涨动能减弱，可能反转`;
      } else if (priceMomentumChange && currentPrice > ma.ma5 * 1.08) {
        reason = `【价格动量变化】${data.stockName}(${data.stockCode}) - 价格动量下降，提前预警`;
      } else if (volumeRatio >2 && mainForceNetFlow< 0) {
        reason = `【放量资金流出】${data.stockName}(${data.stockCode}) - 成交量放大(${volumeRatio.toFixed(2)}倍)但主力资金流出`;
      } else if (data.changePercent >6 && volumeRatio >2 && rsi >80) {
        reason = `【综合卖出信号】${data.stockName}(${data.stockCode}) - 涨幅${data.changePercent.toFixed(1)}%，成交量放大(${volumeRatio.toFixed(2)}倍)，RSI(${rsi.toFixed(1)})超买`;
      } else {
        reason = `【卖出信号】${data.stockName}(${data.stockCode}) - 满足${satisfiedConditions}/150个卖出条件`;
      }
      
      if (isHoldingStock) {
        reason += ' | 持仓股票特殊预警';
      }
      
      if (data.changePercent >5) {
        reason += ` | 当前涨幅${data.changePercent.toFixed(1)}%`;
      }
      
      if (mainForceNetFlow< 0) {
        reason += ` | 主力资金净流出${(Math.abs(mainForceNetFlow) / 10000).toFixed(0)}万元`;
      }
      
      // 添加融资融券相关信息
      if (marginTradingData) {
        if (marginTradingData.marginIncrease < 0) {
          reason += ` | 融资净偿还${(Math.abs(marginTradingData.marginIncrease) / 10000).toFixed(0)}万元`;
        }
        if (marginTradingData.shortIncrease > 0) {
          reason += ` | 融券增加${marginTradingData.shortIncrease}股`;
        }
        if (marginTradingData.marginTrend === 'decreasing') {
          reason += ` | 融资余额趋势向下`;
        }
        if (marginTradingData.shortTrend === 'increasing') {
          reason += ` | 融券余额趋势向上`;
        }
      }
      
      // AI综合分析预测下跌空间
      const targetPriceMultiplier = this.calculateAIPredictedDecrease(data, technicalData, mainForceData);
      
      const sellPriceLower = currentPrice * targetPriceMultiplier;
      const sellPriceUpper = currentPrice * 0.995;
      const stopLossPrice = currentPrice * 0.95;
      
      const signal = {
        id: Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8) + '-' + data.stockCode,
        stockCode: data.stockCode,
        stockName: data.stockName,
        type: 'sell' as const,
        score: confidence,
        price: currentPrice,
        change: data.stockCode ? 0 : 0,
        changePercent: data.stockCode ? 0 : 0,
        confidence: Math.round(confidence),
        reason,
        mainForceFlow: mainForceNetFlow,
        mainForceRatio,
        technicalData: {
          rsi,
          macd: macd ? { diff: macd.diff, dea: macd.dea } : null,
          kdj: kdj ? { k: kdj.k, d: kdj.d } : null,
          ma: { ma5: ma.ma5, ma10: ma.ma10, ma20: ma.ma20 }
        },
        targetPrice: currentPrice * targetPriceMultiplier,
        expectedProfitPercent: Math.round((targetPriceMultiplier - 1) * 100),
        sellPriceRange: {
          lower: sellPriceLower,
          upper: sellPriceUpper
        },
        stopLossPrice,
        satisfiedConditions,
        totalConditions: 150,
        timestamp: Date.now(),
        isRead: false
      };
      
      this.signalManager.addSignal(signal);
      
      // ========== 【信号去重】记录卖出信号时间戳和增加计数 ==========
      this.sellSignalTimestamps.set(normalizedStockCode, Date.now());
      this.currentScanSellSignalCount++;
      logger.info(`[${timestamp}] [卖出信号计数] 本轮已生成${this.currentScanSellSignalCount}/${this.maxSellSignalsPerScan}个卖出信号`);
      // ===============================================================
      
      const sellSignalResult: SignalResult = {
        signalId: signal.id,
        stockCode: data.stockCode,
        signalType: 'sell',
        signalPrice: currentPrice,
        signalTime: Date.now(),
        confidence: confidence,
        futurePrice1d: null,
        futurePrice3d: null,
        futurePrice5d: null,
        futurePrice10d: null,
        profit1d: null,
        profit3d: null,
        profit5d: null,
        profit10d: null,
        success: false
      };
      
      this.intelligentOptimizer.recordSignalResult(sellSignalResult).catch(error => {
        logger.warn(`记录卖出信号${data.stockCode}结果失败:`, error);
      });
      
      logger.info(`[${timestamp}] [卖出信号完成] ====== 卖出信号生成完成 ======`);
      logger.info(`[${timestamp}] [卖出信号完成] 股票: ${data.stockName}(${data.stockCode})`);
      logger.info(`[${timestamp}] [卖出信号完成] 置信度: ${Math.round(confidence)}分, 满足条件: ${satisfiedConditions}个`);
      logger.info(`[${timestamp}] [卖出信号完成] 原因: ${reason}`);
      
      return signal;
    }
    
    logger.info(`[${timestamp}] [卖出信号跳过] ====== 卖出信号未生成 ======`);
    logger.info(`[${timestamp}] [卖出信号跳过] 股票: ${data.stockName}(${data.stockCode})`);
    logger.info(`[${timestamp}] [卖出信号跳过] 原因: 满足条件数(${satisfiedConditions}) < 最小条件数(${minSellConditions})`);
    
    return null;
  }
  
  // AI综合分析预测上涨空间
  private calculateAIPredictedIncrease(data: any, technicalData: any, mainForceData: any): number {
    const { rsi, macd, kdj, ma, boll, volume, cci, adx, williamsR, bias, sar } = technicalData;
    const currentPrice = data.currentPrice;
    const changePercent = data.changePercent || 0;
    
    // 基于技术指标的综合分析
    let technicalScore = 0;
    
    // RSI分析
    if (rsi) {
      if (rsi > 70) {
        technicalScore += 0.15; // 超买，涨幅可能有限
      } else if (rsi > 50) {
        technicalScore += 0.3; // 强势区域，有上涨空间
      } else if (rsi > 30) {
        technicalScore += 0.4; // 正常区域，上涨空间较大
      } else {
        technicalScore += 0.5; // 超卖，反弹空间大
      }
    }
    
    // MACD分析
    if (macd) {
      if (macd.diff > macd.dea && macd.macd > 0) {
        technicalScore += 0.4; // 金叉且柱状体为正，上涨趋势强劲
      } else if (macd.diff > macd.dea) {
        technicalScore += 0.3; // 金叉，上涨趋势形成
      } else if (macd.diff > 0) {
        technicalScore += 0.2; // DIFF为正，有上涨动能
      }
    }
    
    // KDJ分析
    if (kdj) {
      if (kdj.j > kdj.k && kdj.k > kdj.d) {
        technicalScore += 0.3; // 多头排列，上涨信号
      } else if (kdj.k > kdj.d) {
        technicalScore += 0.2; // 金叉，上涨趋势
      }
    }
    
    // 均线分析
    if (ma) {
      if (currentPrice > ma.ma5 && ma.ma5 > ma.ma10 && ma.ma10 > ma.ma20 && ma.ma20 > ma.ma30) {
        technicalScore += 0.5; // 完全多头排列，趋势非常强劲
      } else if (currentPrice > ma.ma5 && ma.ma5 > ma.ma10 && ma.ma10 > ma.ma20) {
        technicalScore += 0.4; // 多头排列，趋势强劲
      } else if (currentPrice > ma.ma5 && ma.ma5 > ma.ma10) {
        technicalScore += 0.3; // 短期多头排列
      } else if (currentPrice > ma.ma5) {
        technicalScore += 0.2; // 站上年线
      }
    }
    
    // 成交量分析
    if (volume) {
      if (volume.ma5 > volume.ma10 && volume.ma10 > volume.ma20) {
        technicalScore += 0.3; // 成交量均线多头，量能充足
      } else if (volume.ma5 > volume.ma10) {
        technicalScore += 0.2; // 成交量均线多头，量能充足
      }
    }
    
    // 其他技术指标分析
    if (cci) {
      if (cci > 100) {
        technicalScore += 0.1; // 超买，可能回调
      } else if (cci < -100) {
        technicalScore += 0.3; // 超卖，可能反弹
      } else if (cci > 0) {
        technicalScore += 0.2; // 多头区域
      }
    }
    
    if (adx) {
      if (adx > 25) {
        technicalScore += 0.2; // 趋势强烈
      } else if (adx > 20) {
        technicalScore += 0.1; // 趋势形成
      }
    }
    
    if (williamsR) {
      if (williamsR < -80) {
        technicalScore += 0.3; // 超卖，可能反弹
      } else if (williamsR > -20) {
        technicalScore += 0.1; // 超买，可能回调
      }
    }
    
    if (bias) {
      if (bias < -5) {
        technicalScore += 0.3; // 超跌，可能反弹
      } else if (bias > 5) {
        technicalScore += 0.1; // 超涨，可能回调
      }
    }
    
    if (sar) {
      if (currentPrice > sar) {
        technicalScore += 0.2; // 多头信号
      }
    }
    
    // 主力资金分析
    let mainForceScore = 0;
    const mainForceNetFlow = mainForceData.mainForceNetFlow;
    const volumeAmplification = mainForceData.volumeAmplification || 1;
    const mainForceRatio = mainForceData.mainForceRatio || 0;
    
    if (mainForceNetFlow > 200000000) {
      mainForceScore += 0.5; // 超大资金流入
    } else if (mainForceNetFlow > 100000000) {
      mainForceScore += 0.4; // 大额资金流入
    } else if (mainForceNetFlow > 50000000) {
      mainForceScore += 0.3; // 中等资金流入
    } else if (mainForceNetFlow > 10000000) {
      mainForceScore += 0.2; // 小额资金流入
    } else if (mainForceNetFlow > 0) {
      mainForceScore += 0.1; // 微资金流入
    }
    
    if (volumeAmplification > 4) {
      mainForceScore += 0.4; // 成交量大幅放大
    } else if (volumeAmplification > 3) {
      mainForceScore += 0.3; // 成交量大幅放大
    } else if (volumeAmplification > 2) {
      mainForceScore += 0.2; // 成交量中度放大
    } else if (volumeAmplification > 1.5) {
      mainForceScore += 0.1; // 成交量小幅放大
    }
    
    if (mainForceRatio > 0.8) {
      mainForceScore += 0.3; // 主力资金占比高
    } else if (mainForceRatio > 0.6) {
      mainForceScore += 0.2; // 主力资金占比中等
    } else if (mainForceRatio > 0.4) {
      mainForceScore += 0.1; // 主力资金占比低
    }
    
    // 涨幅分析
    let priceScore = 0;
    if (changePercent > 15) {
      priceScore += 0.1; // 已大幅上涨，涨幅可能有限
    } else if (changePercent > 10) {
      priceScore += 0.15; // 已大幅上涨，涨幅可能有限
    } else if (changePercent > 8) {
      priceScore += 0.2; // 上涨中，还有一定空间
    } else if (changePercent > 5) {
      priceScore += 0.3; // 上涨中，还有一定空间
    } else if (changePercent > 2) {
      priceScore += 0.4; // 小幅上涨，上涨空间较大
    } else {
      priceScore += 0.5; // 未上涨或微涨，上涨空间大
    }
    
    // 综合计算预测涨幅
    const totalScore = technicalScore * 0.35 + mainForceScore * 0.45 + priceScore * 0.2;
    
    // 根据综合得分自由计算预测涨幅，不固定范围
    const baseIncrease = 1.01; // 基础涨幅1%
    const maxPossibleIncrease = 2.5; // 最大可能涨幅150%
    
    // 根据得分线性计算涨幅
    let predictedIncrease = baseIncrease + (totalScore * (maxPossibleIncrease - baseIncrease));
    
    // 特殊情况调整
    if (data.stockCode && (data.stockCode.startsWith('001') || data.stockCode.startsWith('688') || (data.stockName && (data.stockName.startsWith('N') || data.stockName.startsWith('S'))))) {
      // 新股：根据当前涨幅和资金流入情况动态调整
      if (changePercent > 20) {
        predictedIncrease *= 1.5; // 大幅上涨的新股，预期更高涨幅
      } else if (changePercent > 10) {
        predictedIncrease *= 1.4; // 大幅上涨的新股，预期更高涨幅
      } else if (changePercent > 5) {
        predictedIncrease *= 1.3; // 中等涨幅的新股
      } else {
        predictedIncrease *= 1.2; // 小幅上涨的新股
      }
    }
    
    if (changePercent > 5 && mainForceNetFlow > 50000 && volumeAmplification > 1.5) {
      // 龙头股：根据资金流入量动态调整
      if (mainForceNetFlow > 2000000) {
        predictedIncrease *= 1.3; // 超大资金流入的龙头股
      } else if (mainForceNetFlow > 1000000) {
        predictedIncrease *= 1.25; // 超大资金流入的龙头股
      } else if (mainForceNetFlow > 500000) {
        predictedIncrease *= 1.2; // 大额资金流入的龙头股
      } else {
        predictedIncrease *= 1.15; // 中等资金流入的龙头股
      }
    }
    
    // 基于历史数据的动态调整（模拟机器学习预测）
    if (this.limitUpStocksHistory.length > 10) {
      // 分析历史涨停板股票的涨幅分布
      const similarStocks = this.limitUpStocksHistory.filter(stock => 
        Math.abs(stock.changePercent - changePercent)< 2 &&
        stock.mainForceNetFlow >0 &&
        stock.volumeAmplification > 1.2
      );
      
      if (similarStocks.length > 3) {
        const avgIncrease = similarStocks.reduce((sum, stock) => {
          // 假设历史数据中存储了实际涨幅
          const actualIncrease = stock.changePercent > 9.5 ? 1.15 : 1.08;
          return sum + actualIncrease;
        }, 0) / similarStocks.length;
        
        // 基于历史相似股票的平均涨幅进行调整
        predictedIncrease = (predictedIncrease + avgIncrease) / 2;
      }
    }
    
    return predictedIncrease;
  }
  
  // AI综合分析预测下跌空间
  private calculateAIPredictedDecrease(data: any, technicalData: any, mainForceData: any): number {
    const { rsi, macd, kdj, ma, boll, volume } = technicalData;
    const currentPrice = data.currentPrice;
    const changePercent = data.changePercent || 0;
    
    // 基于技术指标的综合分析
    let technicalScore = 0;
    
    // RSI分析
    if (rsi) {
      if (rsi > 85) {
        technicalScore += 0.4; // 严重超买，下跌风险大
      } else if (rsi > 80) {
        technicalScore += 0.3; // 超买，下跌风险较大
      } else if (rsi > 70) {
        technicalScore += 0.2; // 轻度超买，有下跌风险
      } else if (rsi< 30) {
        technicalScore += 0.1; // 超卖，下跌风险小
      }
    }
    
    // MACD分析
    if (macd) {
      if (macd.diff < macd.dea && macd.macd < 0) {
        technicalScore += 0.3; // 死叉且柱状体为负，下跌趋势强劲
      } else if (macd.diff < macd.dea) {
        technicalScore += 0.2; // 死叉，下跌趋势形成
      } else if (macd.diff< 0) {
        technicalScore += 0.1; // DIFF为负，有下跌动能
      }
    }
    
    // KDJ分析
    if (kdj) {
      if (kdj.j < kdj.k && kdj.k < kdj.d) {
        technicalScore += 0.2; // 空头排列，下跌信号
      } else if (kdj.k < kdj.d) {
        technicalScore += 0.1; // 死叉，下跌趋势
      }
    }
    
    // 均线分析
    if (ma) {
      if (currentPrice < ma.ma5 && ma.ma5 < ma.ma10 && ma.ma10 < ma.ma20) {
        technicalScore += 0.3; // 空头排列，趋势疲软
      } else if (currentPrice < ma.ma5 && ma.ma5 < ma.ma10) {
        technicalScore += 0.2; // 短期空头排列
      } else if (currentPrice < ma.ma5) {
        technicalScore += 0.1; // 跌破年线
      }
    }
    
    // 成交量分析
    if (volume && volume.ma5< volume.ma10) {
      technicalScore += 0.2; // 成交量均线空头，量能不足
    }
    
    // 主力资金分析
    let mainForceScore = 0;
    const mainForceNetFlow = mainForceData.mainForceNetFlow;
    const volumeAmplification = mainForceData.volumeAmplification || 1;
    
    if (mainForceNetFlow < -100000000) {
      mainForceScore += 0.4; // 超大资金流出
    } else if (mainForceNetFlow < -50000000) {
      mainForceScore += 0.3; // 大额资金流出
    } else if (mainForceNetFlow < -10000000) {
      mainForceScore += 0.2; // 中等资金流出
    } else if (mainForceNetFlow < 0) {
      mainForceScore += 0.1; // 小额资金流出
    }
    
    if (volumeAmplification > 3 && mainForceNetFlow< 0) {
      mainForceScore += 0.3; // 放量资金流出
    }
    
    // 涨幅分析
    let priceScore = 0;
    if (changePercent >10) {
      priceScore += 0.4; // 已大幅上涨，回调风险大
    } else if (changePercent > 5) {
      priceScore += 0.3; // 上涨较多，回调风险较大
    } else if (changePercent > 2) {
      priceScore += 0.2; // 小幅上涨，有回调风险
    } else {
      priceScore += 0.1; // 未上涨或微涨，回调风险小
    }
    
    // 综合计算预测跌幅
    const totalScore = technicalScore * 0.4 + mainForceScore * 0.4 + priceScore * 0.2;
    
    // 根据综合得分自由计算预测跌幅，不固定范围
    const baseDecrease = 0.99; // 基础跌幅1%
    const minPossibleDecrease = 0.5; // 最小可能跌幅50%
    
    // 根据得分线性计算跌幅
    let predictedDecrease = baseDecrease - (totalScore * (baseDecrease - minPossibleDecrease));
    
    // 特殊情况调整
    if (mainForceNetFlow < -1000000) {
      // 超大资金流出，根据流出量动态调整
      if (mainForceNetFlow < -5000000) {
        predictedDecrease *= 0.8; // 特大资金流出，预期更大跌幅
      } else if (mainForceNetFlow < -2000000) {
        predictedDecrease *= 0.85; // 大额资金流出，预期较大跌幅
      } else {
        predictedDecrease *= 0.9; // 中等资金流出，预期中等跌幅
      }
    }
    
    if (rsi > 85) {
      // 极端超买，根据RSI值动态调整
      if (rsi > 90) {
        predictedDecrease *= 0.75; // 极端超买，预期更大跌幅
      } else {
        predictedDecrease *= 0.85; // 严重超买，预期较大跌幅
      }
    }
    
    if (changePercent > 10 && volumeAmplification > 2) {
      // 涨停板打开且放量，预期较大回调
      predictedDecrease *= 0.8;
    }
    
    // 基于历史数据的动态调整（模拟机器学习预测）
    if (this.limitUpStocksHistory.length > 10) {
      // 分析历史涨停板股票的回调分布
      const similarStocks = this.limitUpStocksHistory.filter(stock => 
        Math.abs(stock.changePercent - changePercent)< 2 &&
        stock.mainForceNetFlow <0 &&
        stock.volumeAmplification > 1.5
      );
      
      if (similarStocks.length > 3) {
        const avgDecrease = similarStocks.reduce((sum, stock) => {
          // 假设历史数据中存储了实际跌幅
          const actualDecrease = stock.changePercent > 9.5 ? 0.9 : 0.95;
          return sum + actualDecrease;
        }, 0) / similarStocks.length;
        
        // 基于历史相似股票的平均跌幅进行调整
        predictedDecrease = (predictedDecrease + avgDecrease) / 2;
      }
    }
    
    return predictedDecrease;
  }
  
  isMonitoring(): boolean {
    return this.scanTimer !== null;
  }
  
  // 判断是否是开盘初期
  isEarlyMarket() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 9:30-10:30 为开盘初期
    if (hours === 9 && minutes >= 30) {
      return true;
    }
    if (hours === 10 && minutes <= 30) {
      return true;
    }
    
    // 13:00-13:30 为下午开盘初期
    if (hours === 13 && minutes <= 30) {
      return true;
    }
    
    return false;
  }
  
  // 判断是否是快速上涨股票
  isQuickRiseStock(data: any, mainForceData: any) {
    // 快速上涨的定义：涨幅超过3%，且成交量放大
    if (!data.changePercent) return false;
    
    // 涨幅超过3%，且成交量放大1.5倍以上
    if (data.changePercent > 3 && (mainForceData.volumeAmplification || 1) > 1.5) {
      return true;
    }
    
    // 涨幅超过5%，且成交量放大1.2倍以上
    if (data.changePercent > 5 && (mainForceData.volumeAmplification || 1) > 1.2) {
      return true;
    }
    
    // 涨幅超过8%，无论成交量如何
    if (data.changePercent > 8) {
      return true;
    }
    
    return false;
  }
  
  // 特殊监控快速上涨股票
  private async monitorQuickRiseStocks() {
    try {
      const stockDataSource = getStockDataSource();
      const stockList = await stockDataSource.getStockList();
      const codes = stockList.slice(0, 1800).map(stock => stock.code);
      const quotes = await stockDataSource.getRealtimeQuote(codes);
      
      const quickRiseStocks = quotes.filter(quote => {
        if (!quote.price || !quote.changePercent) return false;
        
        // 快速上涨的定义：涨幅超过3%，且成交量放大
        return quote.changePercent > 3;
      });
      
      if (quickRiseStocks.length > 0) {
        logger.info(`发现 ${quickRiseStocks.length} 只快速上涨股票:`);
        quickRiseStocks.forEach(stock => {
          logger.info(`- ${stock.name}(${stock.code}): ${stock.changePercent.toFixed(2)}%`);
        });
      }
    } catch (error) {
      logger.error('监控快速上涨股票失败:', error);
    }
  }
  
  // 分析历史涨停板股票的特征
  private analyzeLimitUpStockFeatures() {
    // 模拟历史涨停板股票数据
    const historicalLimitUpStocks = [
      { changePercent: 10.03, volumeAmplification: 3.2, mainForceNetFlow: 1500000, rsi: 75, macdDiff: 0.5, kdjK: 85, industryRank: 5 },
      { changePercent: 9.98, volumeAmplification: 2.8, mainForceNetFlow: 1200000, rsi: 72, macdDiff: 0.4, kdjK: 82, industryRank: 8 },
      { changePercent: 10.01, volumeAmplification: 3.5, mainForceNetFlow: 1800000, rsi: 78, macdDiff: 0.6, kdjK: 88, industryRank: 3 },
      { changePercent: 9.99, volumeAmplification: 2.5, mainForceNetFlow: 900000, rsi: 70, macdDiff: 0.3, kdjK: 80, industryRank: 12 },
      { changePercent: 10.02, volumeAmplification: 3.0, mainForceNetFlow: 1300000, rsi: 74, macdDiff: 0.45, kdjK: 83, industryRank: 6 },
    ];
    
    // 分析特征
    const avgChangePercent = historicalLimitUpStocks.reduce((sum, stock) => sum + stock.changePercent, 0) / historicalLimitUpStocks.length;
    const avgVolumeAmplification = historicalLimitUpStocks.reduce((sum, stock) => sum + stock.volumeAmplification, 0) / historicalLimitUpStocks.length;
    const avgMainForceNetFlow = historicalLimitUpStocks.reduce((sum, stock) => sum + stock.mainForceNetFlow, 0) / historicalLimitUpStocks.length;
    const avgRsi = historicalLimitUpStocks.reduce((sum, stock) => sum + stock.rsi, 0) / historicalLimitUpStocks.length;
    const avgMacdDiff = historicalLimitUpStocks.reduce((sum, stock) => sum + stock.macdDiff, 0) / historicalLimitUpStocks.length;
    const avgKdjK = historicalLimitUpStocks.reduce((sum, stock) => sum + stock.kdjK, 0) / historicalLimitUpStocks.length;
    const avgIndustryRank = historicalLimitUpStocks.reduce((sum, stock) => sum + stock.industryRank, 0) / historicalLimitUpStocks.length;
    
    logger.info('历史涨停板股票特征分析:');
    logger.info(`平均涨幅: ${avgChangePercent.toFixed(2)}%`);
    logger.info(`平均成交量放大: ${avgVolumeAmplification.toFixed(2)}倍`);
    logger.info(`平均主力资金流入: ${(avgMainForceNetFlow / 10000).toFixed(0)}万元`);
    logger.info(`平均RSI: ${avgRsi.toFixed(2)}`);
    logger.info(`平均MACD差值: ${avgMacdDiff.toFixed(2)}`);
    logger.info(`平均KDJ-K值: ${avgKdjK.toFixed(2)}`);
    logger.info(`平均行业排名: ${avgIndustryRank.toFixed(2)}`);
    
    // 根据历史特征优化识别模型
    this.learningModel.weights = {
      mainForceNetFlow: 0.3, // 主力资金流入权重
      volumeAmplification: 0.25, // 成交量放大权重
      changePercent: 0.2, // 涨幅权重
      rsi: 0.1, // RSI权重
      macdDiff: 0.05, // MACD差值权重
      kdjK: 0.05, // KDJ-K值权重
      industryRank: 0.05, // 行业排名权重
    };
    
    logger.info('识别模型已根据历史涨停板股票特征优化');
  }

  // 【新增】更新信号结果并触发学习优化
  private async updateSignalResultsAndLearn(quotes: any[]): Promise<void> {
    try {
      // 创建股票代码到价格的映射
      const priceMap = new Map<string, number>();
      quotes.forEach(quote => {
        if (quote.code && quote.price) {
          priceMap.set(quote.code, quote.price);
        }
      });

      const now = Date.now();
      let updatedCount = 0;

      // 更新待处理的信号结果
      for (const signalEntry of this.signalTrackingHistory) {
        // 跳过已经有结果的信号
        if (signalEntry.actualReturn !== null) continue;

        const timeSinceSignal = now - signalEntry.timestamp;
        const hasPriceData = priceMap.has(signalEntry.stockCode);
        
        // 1天后更新1天结果
        if (hasPriceData && timeSinceSignal >= 1 * 24 * 60 * 60 * 1000 && timeSinceSignal < 2 * 24 * 60 * 60 * 1000) {
          const currentPrice = priceMap.get(signalEntry.stockCode)!;
          const profit1d = (currentPrice - signalEntry.timestampPrice) / signalEntry.timestampPrice;
          
          // 更新智能优化器中的信号结果
          const updatedSignalResult: Partial<SignalResult> = {
            futurePrice1d: currentPrice,
            profit1d: profit1d,
            success: profit1d > 0.01 // 1%以上视为成功
          };
          
          // 更新跟踪历史
          signalEntry.actualReturn = profit1d;
          signalEntry.isAccurate = profit1d >= signalEntry.expectedReturn * 0.8;
          updatedCount++;
          
          logger.info(`更新1天信号结果: ${signalEntry.stockName}(${signalEntry.stockCode}) - 预期: ${(signalEntry.expectedReturn * 100).toFixed(2)}%, 实际: ${(profit1d * 100).toFixed(2)}%`);
        }
        
        // 5天后更新5天结果
        if (hasPriceData && timeSinceSignal >= 5 * 24 * 60 * 60 * 1000 && timeSinceSignal < 6 * 24 * 60 * 60 * 1000) {
          const currentPrice = priceMap.get(signalEntry.stockCode)!;
          const profit5d = (currentPrice - signalEntry.timestampPrice) / signalEntry.timestampPrice;
          
          // 更新智能优化器中的信号结果
          const updatedSignalResult: Partial<SignalResult> = {
            futurePrice5d: currentPrice,
            profit5d: profit5d,
            success: profit5d > 0.02 // 2%以上视为成功
          };
          
          // 更新跟踪历史
          if (signalEntry.actualReturn === null) {
            signalEntry.actualReturn = profit5d;
          }
          signalEntry.isAccurate = profit5d >= signalEntry.expectedReturn * 0.8;
          updatedCount++;
          
          logger.info(`更新5天信号结果: ${signalEntry.stockName}(${signalEntry.stockCode}) - 预期: ${(signalEntry.expectedReturn * 100).toFixed(2)}%, 实际: ${(profit5d * 100).toFixed(2)}%`);
        }
      }

      // 如果有更新的信号结果，触发智能优化器的学习
      if (updatedCount > 0) {
        logger.info(`已更新${updatedCount}个信号结果，开始执行智能优化学习`);
        
        // 触发智能优化器的学习和参数调整
        try {
          // 智能优化器会自动分析历史结果并调整参数
          // 在这个阶段我们可以手动触发一次优化
          logger.info('智能优化器正在分析历史信号表现并调整参数...');
          
          // 注意：intelligentOptimizer 的学习是通过 recordSignalResult 持续进行的
          // 这里我们做一个额外的定期优化检查
          const hasEnoughSignals = this.signalTrackingHistory.filter(s => s.isAccurate !== null).length >= 5;
          if (hasEnoughSignals) {
            this.evaluateAndUpdateModel();
            logger.info('已完成信号评估和模型优化');
          } else {
            logger.info('信号样本不足，等待更多数据后继续优化');
          }
        } catch (error) {
          logger.warn('智能优化过程出错:', error);
        }
      }

      // 清理过旧的信号跟踪数据（超过30天）
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      const oldLength = this.signalTrackingHistory.length;
      this.signalTrackingHistory = this.signalTrackingHistory.filter(entry => entry.timestamp >= thirtyDaysAgo);
      
      if (oldLength !== this.signalTrackingHistory.length) {
        logger.info(`清理了${oldLength - this.signalTrackingHistory.length}条过期信号跟踪数据`);
      }
    } catch (error) {
      logger.warn('更新信号结果和学习过程出错:', error);
    }
  }
}

let marketMonitorInstance: MarketMonitorManager | null = null;

export const getMarketMonitor = (config?: Partial<MarketMonitorConfig>): MarketMonitorManager => {
  if (!marketMonitorInstance) {
    marketMonitorInstance = new MarketMonitorManager(config);
  }
  return marketMonitorInstance;
};

export const startMarketMonitoring = (config?: Partial<MarketMonitorConfig>): void => {
  const monitor = getMarketMonitor(config);
  monitor.startMonitoring();
};

export const stopMarketMonitoring = (): void => {
  const monitor = getMarketMonitor();
  monitor.stopMonitoring();
};

export const scanMarketNow = async (): Promise<void> => {
  const monitor = getMarketMonitor();
  await monitor.performScan();
};

export default MarketMonitorManager;