import { Logger, getStockList } from './stockData';
import { HistoricalData, HistoricalDataManager, getHistoricalDataManager } from './historicalData';
import { IndexedDBManager } from './indexedDBManager';
import { chipPeakAnalyzer } from './chipPeakAnalyzer';

const logger = Logger.getInstance();

// 优化参数接口
export interface OptimizationParams {
  buySignalThreshold: number;
  sellSignalThreshold: number;
  specialSignalThreshold: number;
  targetPriceMultiplier: number;
  predictionConfidence: number;
  rsiWeight: number;
  macdWeight: number;
  kdjWeight: number;
  volumeWeight: number;
  priceChangeWeight: number;
  extremeDropThreshold: number; // 极端跌幅阈值（可自动学习优化）
}

// 信号结果记录
export interface SignalResult {
  signalId: string;
  stockCode: string;
  signalType: 'buy' | 'sell' | 'special';
  signalPrice: number;
  signalTime: number;
  confidence: number;
  futurePrice1d: number | null;
  futurePrice3d: number | null;
  futurePrice5d: number | null;
  futurePrice10d: number | null;
  profit1d: number | null;
  profit3d: number | null;
  profit5d: number | null;
  profit10d: number | null;
  success: boolean;
}

// 市场特征
export interface MarketFeatures {
  volatility: number;
  trendStrength: number;
  volumeActivity: number;
  marketDirection: 'bull' | 'bear' | 'neutral';
  seasonalityFactor: number;
}

export class IntelligentOptimizer {
  private params: OptimizationParams;
  private signalResults: SignalResult[] = [];
  private historicalDataManager: HistoricalDataManager;
  private learningInterval: number = 60 * 60 * 1000; // 默认1小时
  private learningTimer: NodeJS.Timeout | null = null;
  private lastOptimizationTime: number = 0;
  private db: IndexedDBManager;

  // 默认优化参数
  private readonly DEFAULT_PARAMS: OptimizationParams = {
    buySignalThreshold: 50,
    sellSignalThreshold: 30,
    specialSignalThreshold: 75,
    targetPriceMultiplier: 1.15,
    predictionConfidence: 0.8,
    rsiWeight: 1.0,
    macdWeight: 1.2,
    kdjWeight: 0.8,
    volumeWeight: 1.1,
    priceChangeWeight: 1.3,
    extremeDropThreshold: -7 // 默认极端跌幅阈值为-7%（7%跌幅）
  };

  constructor() {
    this.params = { ...this.DEFAULT_PARAMS };
    this.historicalDataManager = getHistoricalDataManager({ limit: 60 });
    this.db = IndexedDBManager.getInstance();
    this.loadSavedParams();
    this.startAutoLearning();
  }

  // 加载保存的参数
  private async loadSavedParams() {
    try {
      const savedParams = await this.db.getOptimizationParams('current');
      if (savedParams) {
        this.params = { ...this.params, ...savedParams };
        logger.info('已加载保存的优化参数');
      }
    } catch (error) {
      logger.info('使用默认优化参数');
    }
  }

  // 保存当前参数
  private async saveParams() {
    try {
      await this.db.putOptimizationParams({
        id: 'current',
        ...this.params,
        savedAt: Date.now()
      });
      logger.info('优化参数已保存');
    } catch (error) {
      logger.error('保存优化参数失败:', error);
    }
  }

  // 启动自动学习
  private startAutoLearning() {
    // 每小时学习一次
    this.learningTimer = setInterval(() => {
      this.autoLearn();
    }, 60 * 60 * 1000);

    // 立即学习一次
    setTimeout(() => this.autoLearn(), 10000);
  }

  // 自动学习（增强版）
  private async autoLearn() {
    try {
      logger.info('开始自动学习和参数优化...');

      // 1. 分析历史信号结果（更详细的分析）
      const performance = await this.analyzeSignalPerformance();

      // 2. 分析当前市场特征（增强版）
      const marketFeatures = await this.analyzeMarketFeatures();

      // 3. 分析参数漂移（检测参数是否需要调整）
      const parameterDrift = await this.analyzeParameterDrift();

      // 4. 分析信号质量趋势
      const qualityTrend = await this.analyzeSignalQualityTrend();

      // 5. 根据分析结果优化参数（增强版）
      await this.optimizeParameters(performance, marketFeatures, parameterDrift, qualityTrend);

      // 6. 保存优化后的参数
      await this.saveParams();

      // 7. 更新模型信心度
      await this.updateModelConfidence(performance);

      // 8. 自适应调整学习频率
      this.adjustLearningFrequency(performance, parameterDrift);

      logger.info('自动学习完成 - 成功率: 买入=' + (performance.buySuccessRate * 100).toFixed(1) + '%, 卖出=' + (performance.sellSuccessRate * 100).toFixed(1) + '%, 特殊=' + (performance.specialSuccessRate * 100).toFixed(1) + '%, 平均收益=' + performance.averageProfit.toFixed(2) + '%');
    } catch (error) {
      logger.error('自动学习失败:', error);
    }
  }

  // 分析信号质量趋势
  private async analyzeSignalQualityTrend(): Promise<{
    improving: boolean;
    stability: number;
    consistency: number;
  }> {
    const results = await this.db.getAllSignalResults();
    if (!results || results.length < 20) {
      return { improving: true, stability: 0.5, consistency: 0.5 };
    }

    const recentResults = results.slice(-20);
    const earlierResults = results.slice(-40, -20);

    const recentAvgConfidence = recentResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / recentResults.length;
    const earlierAvgConfidence = earlierResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / earlierResults.length;

    const recentSuccessRate = recentResults.filter(r => r.success).length / recentResults.length;
    const earlierSuccessRate = earlierResults.filter(r => r.success).length / earlierResults.length;

    const stability = 1 - Math.abs(recentSuccessRate - earlierSuccessRate);
    const consistency = recentResults.filter(r => Math.abs((r.confidence || 0) - recentAvgConfidence) < 15).length / recentResults.length;

    return {
      improving: recentSuccessRate > earlierSuccessRate || recentAvgConfidence > earlierAvgConfidence,
      stability,
      consistency
    };
  }

  // 自适应调整学习频率
  private adjustLearningFrequency(performance: { buySuccessRate: number }, drift: { requiresAdjustment: boolean }) {
    let interval = 60 * 60 * 1000; // 默认1小时

    if (drift.requiresAdjustment) {
      interval = 30 * 60 * 1000; // 参数需要调整，缩短学习间隔
    } else if (performance.buySuccessRate > 0.7) {
      interval = 2 * 60 * 60 * 1000; // 表现良好，延长学习间隔
    } else if (performance.buySuccessRate < 0.4) {
      interval = 15 * 60 * 1000; // 表现较差，增加学习频率
    }

    if (this.learningInterval !== interval) {
      logger.info(`调整学习频率: ${this.learningInterval / 60000}分钟 -> ${interval / 60000}分钟`);
      
      // 清除旧定时器并创建新定时器
      if (this.learningTimer) {
        clearInterval(this.learningTimer);
      }
      
      this.learningInterval = interval;
      this.learningTimer = setInterval(() => {
        this.autoLearn();
      }, interval);
    }
  }

  // 分析参数漂移（检测模型是否需要调整）
  private async analyzeParameterDrift(): Promise<{
    buyThresholdDrift: number;
    sellThresholdDrift: number;
    confidenceDrift: number;
    requiresAdjustment: boolean;
  }> {
    const results = await this.db.getAllSignalResults();
    if (!results || results.length < 50) {
      return {
        buyThresholdDrift: 0,
        sellThresholdDrift: 0,
        confidenceDrift: 0,
        requiresAdjustment: false
      };
    }

    // 分析最近30天和之前30天的表现差异
    const recentResults = results.slice(-30);
    const earlierResults = results.slice(-60, -30);

    const recentBuySuccess = recentResults.filter(r => r.signalType === 'buy' && r.success).length;
    const recentBuyTotal = recentResults.filter(r => r.signalType === 'buy').length;
    const earlierBuySuccess = earlierResults.filter(r => r.signalType === 'buy' && r.success).length;
    const earlierBuyTotal = earlierResults.filter(r => r.signalType === 'buy').length;

    const recentBuyRate = recentBuyTotal > 0 ? recentBuySuccess / recentBuyTotal : 0.5;
    const earlierBuyRate = earlierBuyTotal > 0 ? earlierBuySuccess / earlierBuyTotal : 0.5;

    const buyThresholdDrift = earlierBuyRate - recentBuyRate;

    // 计算置信度漂移
    const recentConfidenceAvg = recentResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / recentResults.length;
    const expectedSuccessRate = recentResults.filter(r => r.signalType === 'buy' || r.signalType === 'special').reduce((sum, r) => sum + (r.confidence || 0), 0) / 
                                recentResults.filter(r => r.signalType === 'buy' || r.signalType === 'special').length;
    
    const confidenceDrift = expectedSuccessRate - (recentResults.filter(r => r.success).length / recentResults.length);

    return {
      buyThresholdDrift,
      sellThresholdDrift: 0,
      confidenceDrift,
      requiresAdjustment: Math.abs(buyThresholdDrift) > 0.15 || Math.abs(confidenceDrift) > 0.1
    };
  }

  // 更新模型信心度
  private async updateModelConfidence(performance: {
    buySuccessRate: number;
    sellSuccessRate: number;
    specialSuccessRate: number;
    averageProfit: number;
  }) {
    try {
      const overallConfidence = (performance.buySuccessRate * 0.4 + 
                                performance.sellSuccessRate * 0.3 + 
                                performance.specialSuccessRate * 0.3);
      
      await this.db.putOptimizationParams({
        id: 'confidence_history',
        buySuccessRate: performance.buySuccessRate,
        sellSuccessRate: performance.sellSuccessRate,
        specialSuccessRate: performance.specialSuccessRate,
        averageProfit: performance.averageProfit,
        overallConfidence,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error('更新模型信心度失败:', error);
    }
  }

  // 分析信号表现
  private async analyzeSignalPerformance(): Promise<{
    buySuccessRate: number;
    sellSuccessRate: number;
    specialSuccessRate: number;
    averageProfit: number;
  }> {
    // 从数据库获取历史信号结果
    const results = await this.db.getAllSignalResults();
    this.signalResults = results || [];

    // 统计分析
    let buySuccess = 0;
    let buyTotal = 0;
    let sellSuccess = 0;
    let sellTotal = 0;
    let specialSuccess = 0;
    let specialTotal = 0;
    let totalProfit = 0;
    let profitCount = 0;

    for (const result of this.signalResults) {
      if (result.signalType === 'buy') {
        buyTotal++;
        if (result.success) buySuccess++;
        if (result.profit5d !== null) {
          totalProfit += result.profit5d;
          profitCount++;
        }
      } else if (result.signalType === 'sell') {
        sellTotal++;
        if (result.success) sellSuccess++;
        if (result.profit5d !== null) {
          totalProfit += result.profit5d;
          profitCount++;
        }
      } else if (result.signalType === 'special') {
        specialTotal++;
        if (result.success) specialSuccess++;
        if (result.profit5d !== null) {
          totalProfit += result.profit5d;
          profitCount++;
        }
      }
    }

    return {
      buySuccessRate: buyTotal > 0 ? buySuccess / buyTotal : 0.5,
      sellSuccessRate: sellTotal > 0 ? sellSuccess / sellTotal : 0.5,
      specialSuccessRate: specialTotal > 0 ? specialSuccess / specialTotal : 0.5,
      averageProfit: profitCount > 0 ? totalProfit / profitCount : 0
    };
  }

  // 分析市场特征
  private async analyzeMarketFeatures(): Promise<MarketFeatures> {
    try {
      // 获取上证指数最近60天数据
      const shData = await this.historicalDataManager.getHistoricalData('sh000001');

      if (shData.length < 30) {
        return {
          volatility: 1.0,
          trendStrength: 0.5,
          volumeActivity: 1.0,
          marketDirection: 'neutral',
          seasonalityFactor: 1.0
        };
      }

      // 计算波动率
      const returns = shData.slice(-30).map(d => (d.close - d.open) / d.open * 100);
      const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length);

      // 计算趋势强度
      const recentPrices = shData.slice(-20).map(d => d.close);
      const trendStrength = this.calculateTrendStrength(recentPrices);

      // 计算成交量活跃度
      const volumes = shData.slice(-20).map(d => d.volume);
      const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;
      const volumeActivity = volumes[volumes.length - 1] / avgVolume;

      // 判断市场方向
      const priceChange = (shData[shData.length - 1].close - shData[shData.length - 20].close) / shData[shData.length - 20].close * 100;
      let marketDirection: 'bull' | 'bear' | 'neutral' = 'neutral';
      if (priceChange > 5) marketDirection = 'bull';
      else if (priceChange < -5) marketDirection = 'bear';

      // 计算季节因子（简化版）
      const month = new Date().getMonth() + 1;
      let seasonalityFactor = 1.0;
      if (month >= 1 && month <= 3) seasonalityFactor = 1.1; // 一季度
      else if (month >= 4 && month <= 6) seasonalityFactor = 1.0; // 二季度
      else if (month >= 7 && month <= 9) seasonalityFactor = 0.9; // 三季度
      else seasonalityFactor = 1.05; // 四季度

      return {
        volatility: Math.min(5, volatility),
        trendStrength,
        volumeActivity: Math.min(2, volumeActivity),
        marketDirection,
        seasonalityFactor
      };
    } catch (error) {
      logger.error('分析市场特征失败:', error);
      return {
        volatility: 1.0,
        trendStrength: 0.5,
        volumeActivity: 1.0,
        marketDirection: 'neutral',
        seasonalityFactor: 1.0
      };
    }
  }

  // 计算趋势强度
  private calculateTrendStrength(prices: number[]): number {
    if (prices.length < 2) return 0.5;

    // 使用线性回归计算趋势
    const n = prices.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += prices[i];
      sumXY += i * prices[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgChange = slope / prices[0];

    return Math.min(1, Math.max(0, 0.5 + avgChange * 10));
  }

  // 优化参数（增强版 - 关键：固定条件不改变）
  private async optimizeParameters(
    performance: { buySuccessRate: number; sellSuccessRate: number; specialSuccessRate: number; averageProfit: number },
    marketFeatures: MarketFeatures,
    parameterDrift?: {
      buyThresholdDrift: number;
      sellThresholdDrift: number;
      confidenceDrift: number;
      requiresAdjustment: boolean;
    },
    qualityTrend?: {
      improving: boolean;
      stability: number;
      consistency: number;
    }
  ) {
    const newParams = { ...this.params };
    const drift = parameterDrift || { buyThresholdDrift: 0, sellThresholdDrift: 0, confidenceDrift: 0, requiresAdjustment: false };
    const quality = qualityTrend || { improving: true, stability: 0.5, consistency: 0.5 };

    // 【关键】固定参数保持不变：买入阈值35、特殊阈值61、置信度100分
    // 这些参数由clampParams强制固定，不在优化范围内

    // 1. 只调整卖出信号阈值（卖出信号不限制条件，可以优化）
    const sellDiff = performance.sellSuccessRate - 0.55;
    const adjustmentStep = drift.requiresAdjustment ? 8 : 4;

    if (sellDiff < -0.1) {
      newParams.sellSignalThreshold = Math.min(70, this.params.sellSignalThreshold + adjustmentStep);
    } else if (sellDiff > 0.15) {
      newParams.sellSignalThreshold = Math.max(15, this.params.sellSignalThreshold - adjustmentStep * 0.7);
    }

    // 2. 根据市场特征调整权重（这些参数可以优化）
    if (marketFeatures.marketDirection === 'bull') {
      newParams.priceChangeWeight = this.params.priceChangeWeight * 1.25;
      newParams.volumeWeight = this.params.volumeWeight * 1.2;
      newParams.targetPriceMultiplier = this.params.targetPriceMultiplier * 1.12;
      newParams.macdWeight = this.params.macdWeight * 1.1;
    } else if (marketFeatures.marketDirection === 'bear') {
      newParams.rsiWeight = this.params.rsiWeight * 1.3;
      newParams.macdWeight = this.params.macdWeight * 1.3;
      newParams.targetPriceMultiplier = this.params.targetPriceMultiplier * 0.88;
    }

    // 3. 根据波动率调整目标价格乘数（更保守的调整）
    if (marketFeatures.volatility > 3.5) {
      newParams.targetPriceMultiplier = this.params.targetPriceMultiplier * 0.95;
    } else if (marketFeatures.volatility < 1.0) {
      newParams.targetPriceMultiplier = this.params.targetPriceMultiplier * 1.02;
    }

    // 4. 根据趋势强度调整权重
    if (marketFeatures.trendStrength > 0.75) {
      newParams.macdWeight = this.params.macdWeight * 1.2;
      newParams.kdjWeight = this.params.kdjWeight * 1.15;
      newParams.priceChangeWeight = this.params.priceChangeWeight * 1.1;
    } else if (marketFeatures.trendStrength < 0.3) {
      newParams.rsiWeight = this.params.rsiWeight * 1.15;
    }

    // 5. 应用季节因子到目标价格
    newParams.targetPriceMultiplier *= marketFeatures.seasonalityFactor;

    // 5.5 根据市场波动率调整极端跌幅阈值（可自动学习优化）
    // 高波动市场：放宽跌幅阈值（更容易触发紧急卖出）
    // 低波动市场：收紧跌幅阈值（更难触发紧急卖出）
    if (marketFeatures.volatility > 3.0) {
      // 高波动市场，跌幅阈值更敏感（更容易触发）
      newParams.extremeDropThreshold = Math.max(-15, this.params.extremeDropThreshold - 1);
    } else if (marketFeatures.volatility < 1.0) {
      // 低波动市场，跌幅阈值更不敏感（更难触发）
      newParams.extremeDropThreshold = Math.min(-3, this.params.extremeDropThreshold + 1);
    }

    // 5.6 根据卖出信号成功率调整跌幅阈值
    if (performance.sellSuccessRate < 0.4) {
      // 卖出信号成功率低，可能是跌幅阈值太敏感，需要收紧
      newParams.extremeDropThreshold = Math.min(-3, this.params.extremeDropThreshold + 0.5);
    } else if (performance.sellSuccessRate > 0.7) {
      // 卖出信号成功率高，可以适当放宽跌幅阈值
      newParams.extremeDropThreshold = Math.max(-15, this.params.extremeDropThreshold - 0.5);
    }

    // 6. 根据平均收益调整目标价格（更精细）
    if (performance.averageProfit > 8) {
      newParams.targetPriceMultiplier *= 1.08;
    } else if (performance.averageProfit > 4) {
      newParams.targetPriceMultiplier *= 1.03;
    } else if (performance.averageProfit < 1) {
      newParams.targetPriceMultiplier *= 0.92;
    } else if (performance.averageProfit < 2.5) {
      newParams.targetPriceMultiplier *= 0.97;
    }

    // 7. 成交量活跃度调整权重
    if (marketFeatures.volumeActivity > 1.5) {
      newParams.volumeWeight = this.params.volumeWeight * 1.15;
    } else if (marketFeatures.volumeActivity < 0.6) {
      newParams.volumeWeight = this.params.volumeWeight * 0.9;
    }

    // 确保参数在合理范围内
    this.params = this.clampParams(newParams);

    logger.info('参数优化完成: 买入阈值=' + this.params.buySignalThreshold.toFixed(1) + '(固定35), 卖出阈值=' + this.params.sellSignalThreshold.toFixed(1) + 
                ', 特殊阈值=' + this.params.specialSignalThreshold.toFixed(1) + '(固定61), 目标乘数=' + this.params.targetPriceMultiplier.toFixed(3) + 
                ', 置信度=' + this.params.predictionConfidence.toFixed(2) + '(固定1.0)');
  }

  // 限制参数范围（关键：固定条件不可改变）
  private clampParams(params: OptimizationParams): OptimizationParams {
    return {
      // 【关键修复】买入信号阈值固定为35，不受优化器影响
      buySignalThreshold: 35,
      sellSignalThreshold: Math.min(70, Math.max(15, params.sellSignalThreshold)),
      // 【关键修复】特殊信号阈值固定为61，不受优化器影响
      specialSignalThreshold: 61,
      // 【关键修复】普通买入信号目标乘数范围：8%-25%
      targetPriceMultiplier: Math.min(1.25, Math.max(1.08, params.targetPriceMultiplier)),
      // 【关键修复】预测置信度固定为1.0（100分），不受优化器影响
      predictionConfidence: 1.0,
      rsiWeight: Math.min(2.0, Math.max(0.5, params.rsiWeight)),
      macdWeight: Math.min(2.0, Math.max(0.5, params.macdWeight)),
      kdjWeight: Math.min(2.0, Math.max(0.5, params.kdjWeight)),
      volumeWeight: Math.min(2.0, Math.max(0.5, params.volumeWeight)),
      priceChangeWeight: Math.min(2.0, Math.max(0.5, params.priceChangeWeight)),
      // 极端跌幅阈值：范围 -20% 到 -3%（可以自动学习优化）
      extremeDropThreshold: Math.max(-20, Math.min(-3, params.extremeDropThreshold || -7))
    };
  }

  // 记录信号结果
  async recordSignalResult(result: SignalResult) {
    try {
      this.signalResults.push(result);
      await this.db.putSignalResult({
        ...result,
        id: result.signalId // IndexedDBSignalResult 需要 id 字段
      });

      // 保持历史记录在合理数量
      if (this.signalResults.length > 1000) {
        this.signalResults = this.signalResults.slice(-1000);
      }
    } catch (error) {
      logger.error('记录信号结果失败:', error);
    }
  }

  // 计算目标价格（优化版 - 更稳健、更切合实际）
  async calculateTargetPrice(
    stockCode: string,
    currentPrice: number,
    historicalData?: HistoricalData[]
  ): Promise<{
    targetPrice: number;
    stopLossPrice: number;
    expectedReturn: number;
    confidence: number;
  }> {
    try {
      const data = historicalData || await this.historicalDataManager.getHistoricalData(stockCode);

      if (data.length < 20) {
        return {
          targetPrice: currentPrice * this.params.targetPriceMultiplier,
          stopLossPrice: currentPrice * 0.94,
          expectedReturn: (this.params.targetPriceMultiplier - 1) * 100,
          confidence: this.params.predictionConfidence
        };
      }

      const recentData = data.slice(-60);
      const recentPrices = recentData.map(d => d.close);
      
      // 计算历史波动率（更精确的计算方式）
      const returns = recentData.map(d => (d.close - d.open) / d.open * 100);
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + (r - avgReturn) * (r - avgReturn), 0) / returns.length;
      const volatility = Math.sqrt(variance);

      // 计算支撑位和阻力位（使用多个时间周期）
      const recentHigh20 = Math.max(...recentPrices.slice(-20));
      const recentLow20 = Math.min(...recentPrices.slice(-20));
      const recentHigh60 = Math.max(...recentPrices);
      const recentLow60 = Math.min(...recentPrices);
      
      // 计算历史最高价和最低价（用于限制目标价格上限）
      const allPrices = data.map(d => d.close);
      const historicalHigh = Math.max(...allPrices);
      const historicalLow = Math.min(...allPrices);

      // 计算移动平均线
      const ma5 = this.calculateMA(recentData, 5);
      const ma20 = this.calculateMA(recentData, 20);
      const ma60 = this.calculateMA(recentData, 60);

      // 趋势判断（更严格的条件）
      const isUpwardTrend = ma5 > ma20 && ma20 > ma60 && currentPrice > ma5 && (currentPrice - ma20) / ma20 > 0.02;
      const isSidewaysTrend = Math.abs(ma5 - ma20) / ma20 < 0.03 && Math.abs(ma20 - ma60) / ma60 < 0.05;

      // 获取筹码峰分析
      let chipPeakAdjustment = 1.0;
      let chipSupport = recentLow20;
      let chipResistance = recentHigh20;
      let avgCostBasis = 0;
      let chipConfidence = 0.5;
      
      try {
        const chipPeakAnalysis = await chipPeakAnalyzer.analyzeChipPeak(stockCode);
        chipSupport = chipPeakAnalysis.supportLevel || recentLow20;
        chipResistance = chipPeakAnalysis.resistanceLevel || recentHigh20;
        avgCostBasis = chipPeakAnalysis.mainChipArea || 0;
        chipConfidence = chipPeakAnalysis.chipConcentration > 30 ? 0.7 : 0.4;
        
        // 根据筹码集中度调整目标价格（更保守）
        if (chipPeakAnalysis.chipConcentration > 60) {
          chipPeakAdjustment = 1.05;
        } else if (chipPeakAnalysis.chipConcentration > 40) {
          chipPeakAdjustment = 1.03;
        } else if (chipPeakAnalysis.chipConcentration < 20) {
          chipPeakAdjustment = 0.95;
        }
        
        // 如果价格突破筹码阻力位，谨慎提高目标价格
        if (currentPrice > chipResistance * 1.02) {
          chipPeakAdjustment *= 1.04;
        }
        
        // 利用持仓平均价分析（更保守的调整）
        if (avgCostBasis > 0) {
          const profitRatio = (currentPrice - avgCostBasis) / avgCostBasis;
          
          if (Math.abs(profitRatio) < 0.05) {
            chipPeakAdjustment *= 1.02;
            chipSupport = Math.max(chipSupport, avgCostBasis * 0.98);
          } else if (profitRatio < -0.1) {
            chipPeakAdjustment *= 0.93;
            chipResistance = Math.min(chipResistance, avgCostBasis * 1.02);
          } else if (profitRatio > 0.2) {
            chipPeakAdjustment *= 0.97;
          }
        }
      } catch (chipError) {
        logger.warn('获取' + stockCode + '筹码峰失败，使用默认值:', chipError);
      }

      // 趋势调整因子（更保守）
      let trendAdjustment = 1.0;
      if (isUpwardTrend) {
        trendAdjustment = 1.08;
      } else if (isSidewaysTrend) {
        trendAdjustment = 0.98;
      } else {
        trendAdjustment = 0.94;
      }

      // 波动率调整因子（更高的波动导致更保守的目标价格）
      let volatilityAdjustment = 1.0;
      if (volatility < 1.2) {
        volatilityAdjustment = 1.05;
      } else if (volatility > 3.5) {
        volatilityAdjustment = 0.88;
      } else if (volatility > 2.5) {
        volatilityAdjustment = 0.94;
      }

      // 综合计算目标价格（使用优化后的乘数）
      const baseTarget = currentPrice * this.params.targetPriceMultiplier;
      
      let targetPrice = baseTarget * chipPeakAdjustment * trendAdjustment * volatilityAdjustment;

      // 【关键优化】设置目标价格的合理范围限制（智能区分普通信号和特殊信号）
      // 1. 最小目标价格：至少比当前价格高8%（确保有一定收益空间）
      targetPrice = Math.max(targetPrice, currentPrice * 1.08);
      
      // 2. 根据60日历史数据和市场特征动态调整最大目标价格
      // 检查是否有足够的历史数据支持更高的目标价
      const hasEnoughHistory = data.length >= 60;
      const recentHighIn60Days = recentPrices.length >= 60 ? Math.max(...recentPrices.slice(-60)) : recentHigh20;
      const priceNear60DayHigh = currentPrice >= recentHighIn60Days * 0.80; // 价格在60日高点的80%以上
      
      // 强势启动特征：有60日数据 + 价格接近60日高点 + 趋势向上
      const isStrongStart = hasEnoughHistory && priceNear60DayHigh && isUpwardTrend;
      
      let maxTargetMultiplier = 1.20; // 默认最大20%涨幅
      
      if (isStrongStart) {
        // 强势启动：有60日历史数据支持，可以设置更高目标
        if (volatility < 2.0 && mainForceNetFlow > 150000) {
          // 低波动 + 主力大资金流入，可以设置50%-100%的目标（翻倍潜力）
          maxTargetMultiplier = 2.0;
        } else if (volatility < 3.0 && mainForceNetFlow > 80000) {
          // 中低波动 + 主力资金流入，可以设置30%-50%的目标
          maxTargetMultiplier = 1.50;
        } else if (volatility < 4.0) {
          // 中等波动，可以设置25%-40%的目标
          maxTargetMultiplier = 1.40;
        }
      } else if (hasEnoughHistory && priceNear60DayHigh) {
        // 有历史数据但趋势不强，设置25%-40%的目标
        maxTargetMultiplier = 1.35;
      }
      
      // 3. 设置最大目标价格的硬性上限（防止过分离谱）
      const maxTargetFromResistance = recentHigh20 * 1.25;
      const maxTargetFromHistorical = historicalHigh * 1.20;
      const maxTargetFromDynamic = currentPrice * maxTargetMultiplier;
      const maxTargetOverall = Math.min(maxTargetFromResistance, maxTargetFromHistorical, maxTargetFromDynamic);
      targetPrice = Math.min(targetPrice, maxTargetOverall);

      // 3. 回归均值调整：如果目标价格偏离均线太远，进行修正
      const avgPriceLevel = (ma20 + ma60) / 2;
      const priceDeviation = Math.abs(targetPrice - avgPriceLevel) / avgPriceLevel;
      if (priceDeviation > 0.25) {
        // 如果目标价格偏离均线超过25%，向均线回归
        const reversionFactor = 0.3;
        targetPrice = targetPrice * (1 - reversionFactor) + avgPriceLevel * reversionFactor;
      }

      // 4. 考虑成交量因素：成交量不足时降低目标价格
      const recentVolumes = recentData.slice(-10).map(d => d.volume);
      const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
      const volumeRatio = recentVolumes[recentVolumes.length - 1] / avgVolume;
      if (volumeRatio < 0.5) {
        targetPrice *= 0.94;
      }

      // 计算止损价 - 综合考虑多个支撑位（更保守）
      const stopLossPrice = Math.max(
        currentPrice * 0.92,
        Math.min(recentLow20, chipSupport) * 0.98,
        ma20 * 0.96,
        recentLow60 * 0.97
      );

      // 计算预期收益
      const expectedReturn = ((targetPrice - currentPrice) / currentPrice) * 100;

      // 计算置信度（综合多个因素，更谨慎）
      let confidence = this.params.predictionConfidence * 0.85;
      if (volatility < 1.5) confidence += 0.1;
      else if (volatility > 3.5) confidence -= 0.12;
      
      if (isUpwardTrend) confidence += 0.06;
      else if (!isSidewaysTrend) confidence -= 0.06;
      
      confidence += (chipConfidence - 0.5) * 0.2;
      
      // 数据质量评分
      const dataQuality = Math.min(1, data.length / 120);
      confidence *= (0.75 + dataQuality * 0.25);
      
      // 成交量活跃度影响置信度
      if (volumeRatio < 0.4) confidence -= 0.08;
      else if (volumeRatio > 1.5) confidence += 0.05;

      confidence = Math.min(0.95, Math.max(0.4, confidence));

      return {
        targetPrice: Math.round(targetPrice * 100) / 100,
        stopLossPrice: Math.round(stopLossPrice * 100) / 100,
        expectedReturn: Math.round(expectedReturn * 100) / 100,
        confidence
      };
    } catch (error) {
      logger.error('计算' + stockCode + '目标价格失败:', error);
      return {
        targetPrice: Math.round(currentPrice * this.params.targetPriceMultiplier * 100) / 100,
        stopLossPrice: Math.round(currentPrice * 0.94 * 100) / 100,
        expectedReturn: (this.params.targetPriceMultiplier - 1) * 100,
        confidence: this.params.predictionConfidence
      };
    }
  }

  // 计算移动平均线
  private calculateMA(data: HistoricalData[], period: number): number {
    if (data.length < period) return 0;
    const recent = data.slice(-period);
    return recent.reduce((sum, d) => sum + d.close, 0) / period;
  }

  // 计算ATR（平均真实波幅）
  private calculateATR(data: HistoricalData[], period: number): number {
    if (data.length < period + 1) return 0;

    const trueRanges: number[] = [];
    for (let i = 1; i <= period; i++) {
      const current = data[data.length - i];
      const previous = data[data.length - i - 1];

      const tr = Math.max(
        current.high - current.low,
        Math.abs(current.high - previous.close),
        Math.abs(current.low - previous.close)
      );
      trueRanges.push(tr);
    }

    return trueRanges.reduce((sum, tr) => sum + tr, 0) / period;
  }

  // 预测未来价格
  async predictPrice(
    stockCode: string,
    currentPrice: number,
    historicalData?: HistoricalData[]
  ): Promise<{
    prediction1d: number;
    prediction3d: number;
    prediction5d: number;
    prediction10d: number;
    confidence1d: number;
    confidence3d: number;
    confidence5d: number;
    confidence10d: number;
  }> {
    try {
      const data = historicalData || await this.historicalDataManager.getHistoricalData(stockCode);

      if (data.length < 30) {
        // 数据不足，使用简单趋势预测
        return {
          prediction1d: Math.round(currentPrice * 1.01 * 100) / 100,
          prediction3d: Math.round(currentPrice * 1.02 * 100) / 100,
          prediction5d: Math.round(currentPrice * 1.03 * 100) / 100,
          prediction10d: Math.round(currentPrice * 1.05 * 100) / 100,
          confidence1d: this.params.predictionConfidence,
          confidence3d: this.params.predictionConfidence * 0.8,
          confidence5d: this.params.predictionConfidence * 0.6,
          confidence10d: this.params.predictionConfidence * 0.4
        };
      }

      // 使用历史数据进行预测
      const recentData = data.slice(-60);

      // 获取筹码峰分析
      let chipConfidenceBoost = 0;
      let avgCostBasis = 0;
      try {
        const chipPeakAnalysis = await chipPeakAnalyzer.analyzeChipPeak(stockCode);
        avgCostBasis = chipPeakAnalysis.mainChipArea || 0;
        // 根据筹码集中度调整预测置信度
        if (chipPeakAnalysis.chipConcentration > 60) {
          chipConfidenceBoost = 0.08; // 高度集中，提高预测置信度
        } else if (chipPeakAnalysis.chipConcentration > 40) {
          chipConfidenceBoost = 0.04; // 中等集中，小幅提高
        }
        
        // 利用持仓平均价调整预测置信度
        if (avgCostBasis > 0) {
          const profitRatio = (currentPrice - avgCostBasis) / avgCostBasis;
          
          // 价格在持仓成本附近，预测更可靠
          if (Math.abs(profitRatio) < 0.05) {
            chipConfidenceBoost += 0.05;
          }
          // 深度套牢时，需谨慎预测
          else if (profitRatio < -0.15) {
            chipConfidenceBoost -= 0.03;
          }
        }
      } catch (chipError) {
        logger.warn(`获取${stockCode}筹码峰用于价格预测失败:`, chipError);
      }

      // 计算动量
      const momentum5d = (recentData[recentData.length - 1].close - recentData[recentData.length - 6].close) / recentData[recentData.length - 6].close;
      const momentum10d = (recentData[recentData.length - 1].close - recentData[recentData.length - 11].close) / recentData[recentData.length - 11].close;

      // 计算移动平均
      const ma5 = recentData.slice(-5).reduce((sum, d) => sum + d.close, 0) / 5;
      const ma10 = recentData.slice(-10).reduce((sum, d) => sum + d.close, 0) / 10;
      const ma20 = recentData.slice(-20).reduce((sum, d) => sum + d.close, 0) / 20;

      // 计算波动率
      const returns = recentData.slice(-20).map(d => (d.close - d.open) / d.open);
      const volatility = Math.sqrt(returns.reduce((sum, r) => sum + r * r, 0) / returns.length);

      // 计算趋势方向
      const trend5d = currentPrice > ma5 ? 1 : -1;
      const trend10d = currentPrice > ma10 ? 1 : -1;

      // 综合预测
      const avgMomentum = (momentum5d + momentum10d) / 2;
      const trendStrength = (trend5d + trend10d) / 2;

      // 衰减因子，越远的预测越保守
      const decay1d = 0.8;
      const decay3d = 0.6;
      const decay5d = 0.45;
      const decay10d = 0.3;

      const baseTrend = avgMomentum * trendStrength;

      let prediction1d = currentPrice * (1 + baseTrend * decay1d);
      let prediction3d = currentPrice * (1 + baseTrend * decay3d * 1.5);
      let prediction5d = currentPrice * (1 + baseTrend * decay5d * 2);
      let prediction10d = currentPrice * (1 + baseTrend * decay10d * 3);

      // 应用回归均值的调整
      const meanReversionFactor = 0.1;
      const avgPrice = ma20;

      prediction1d = prediction1d * (1 - meanReversionFactor) + avgPrice * meanReversionFactor;
      prediction3d = prediction3d * (1 - meanReversionFactor * 1.5) + avgPrice * meanReversionFactor * 1.5;
      prediction5d = prediction5d * (1 - meanReversionFactor * 2) + avgPrice * meanReversionFactor * 2;
      prediction10d = prediction10d * (1 - meanReversionFactor * 2.5) + avgPrice * meanReversionFactor * 2.5;

      // 计算置信度
      let confidence1d = this.params.predictionConfidence * decay1d + chipConfidenceBoost;
      let confidence3d = this.params.predictionConfidence * decay3d + chipConfidenceBoost * 0.8;
      let confidence5d = this.params.predictionConfidence * decay5d + chipConfidenceBoost * 0.6;
      let confidence10d = this.params.predictionConfidence * decay10d + chipConfidenceBoost * 0.4;

      // 根据波动率调整置信度
      if (volatility < 0.015) {
        confidence1d += 0.1;
        confidence3d += 0.08;
        confidence5d += 0.06;
        confidence10d += 0.04;
      } else if (volatility > 0.03) {
        confidence1d -= 0.08;
        confidence3d -= 0.1;
        confidence5d -= 0.12;
        confidence10d -= 0.15;
      }

      // 限制置信度范围
      confidence1d = Math.min(0.9, Math.max(0.4, confidence1d));
      confidence3d = Math.min(0.8, Math.max(0.35, confidence3d));
      confidence5d = Math.min(0.7, Math.max(0.3, confidence5d));
      confidence10d = Math.min(0.6, Math.max(0.2, confidence10d));

      return {
        prediction1d: Math.round(prediction1d * 100) / 100,
        prediction3d: Math.round(prediction3d * 100) / 100,
        prediction5d: Math.round(prediction5d * 100) / 100,
        prediction10d: Math.round(prediction10d * 100) / 100,
        confidence1d,
        confidence3d,
        confidence5d,
        confidence10d
      };
    } catch (error) {
      logger.error(`预测${stockCode}价格失败:`, error);
      return {
        prediction1d: Math.round(currentPrice * 1.01 * 100) / 100,
        prediction3d: Math.round(currentPrice * 1.02 * 100) / 100,
        prediction5d: Math.round(currentPrice * 1.03 * 100) / 100,
        prediction10d: Math.round(currentPrice * 1.05 * 100) / 100,
        confidence1d: 0.5,
        confidence3d: 0.4,
        confidence5d: 0.3,
        confidence10d: 0.2
      };
    }
  }

  // 学习今天涨停板股票特性
  async learnLimitUpFeatures(): Promise<void> {
    try {
      logger.info('开始学习今天涨停板股票特性...');

      // 获取今天涨停的股票列表
      const limitUpStocks = await this.getTodayLimitUpStocks();

      if (limitUpStocks.length === 0) {
        logger.info('今日无涨停股票，跳过学习');
        return;
      }

      // 分析涨停板股票特性
      const features = await this.analyzeLimitUpFeatures(limitUpStocks);

      // 根据特性调整参数
      await this.adjustParamsBasedOnLimitUp(features);

      // 保存调整后的参数
      await this.saveParams();

      logger.info('涨停板股票特性学习完成:', features);
    } catch (error) {
      logger.error('学习涨停板股票特性失败:', error);
    }
  }

  // 获取今天涨停的股票列表
  private async getTodayLimitUpStocks(): Promise<{ stockCode: string; stockName: string; changePercent: number; volume: number; mainForceRatio?: number; mainForceNetFlow?: number }[]> {
    try {
      // 这里应该从数据源获取今日涨停股票
      // 由于数据源限制，我们从历史数据中模拟获取
      const limitUpStocks: { stockCode: string; stockName: string; changePercent: number; volume: number; mainForceRatio?: number; mainForceNetFlow?: number }[] = [];
      
      // 模拟获取涨停股票（实际应用中应该从实时数据源获取）
      const stockList = await getStockList();
      if (stockList && stockList.length > 0) {
        for (const stock of stockList.slice(0, 200)) { // 检查前200只股票
          try {
            const historyData = await this.historicalDataManager.getHistoricalData(stock.stockCode);
            if (historyData && historyData.length > 0) {
              const latestData = historyData[historyData.length - 1];
              const changePercent = ((latestData.close - latestData.open) / latestData.open) * 100;
              
              // 判断是否涨停（A股涨停通常为10%或20%）
              if (changePercent >= 9.5) {
                limitUpStocks.push({
                  stockCode: stock.stockCode,
                  stockName: stock.stockName || '未知',
                  changePercent,
                  volume: latestData.volume,
                  mainForceRatio: 0.6 + Math.random() * 0.3, // 模拟主力资金占比
                  mainForceNetFlow: 10000000 + Math.random() * 90000000 // 模拟主力资金净流入
                });
              }
            }
          } catch (error) {
            continue;
          }
        }
      }

      return limitUpStocks;
    } catch (error) {
      logger.error('获取涨停股票列表失败:', error);
      return [];
    }
  }

  // 分析涨停板股票特性
  private async analyzeLimitUpFeatures(stocks: { stockCode: string; stockName: string; changePercent: number; volume: number; mainForceRatio?: number; mainForceNetFlow?: number }[]): Promise<LimitUpFeatures> {
    const features: LimitUpFeatures = {
      avgVolumeRatio: 0,
      avgPriceChange: 0,
      avgPreChange: 0,
      avgRsi: 0,
      avgMacd: 0,
      avgKdj: 0,
      avgMainForceRatio: 0,
      avgMainForceNetFlow: 0,
      industryDistribution: {},
      conceptDistribution: {},
      timeDistribution: {}
    };

    if (stocks.length === 0) return features;

    let totalVolumeRatio = 0;
    let totalPriceChange = 0;
    let totalPreChange = 0;
    let totalRsi = 0;
    let totalMacd = 0;
    let totalKdj = 0;
    let totalMainForceRatio = 0;
    let totalMainForceNetFlow = 0;
    let validCount = 0;

    for (const stock of stocks) {
      try {
        const historyData = await this.historicalDataManager.getHistoricalData(stock.stockCode);
        
        if (historyData && historyData.length >= 10) {
          validCount++;
          
          // 计算成交量放大倍数（对比5日均量）
          const recentVolumes = historyData.slice(-6).map(d => d.volume);
          const avgVolume = recentVolumes.slice(0, 5).reduce((sum, v) => sum + v, 0) / 5;
          const volumeRatio = stock.volume / avgVolume;
          totalVolumeRatio += volumeRatio;

          // 涨幅
          totalPriceChange += stock.changePercent;

          // 涨停前一天涨幅
          if (historyData.length >= 2) {
            const preData = historyData[historyData.length - 2];
            totalPreChange += ((preData.close - preData.open) / preData.open) * 100;
          }

          // RSI
          const rsi = this.calculateRSI(historyData.slice(-14));
          totalRsi += rsi;

          // MACD
          const macd = this.calculateMACD(historyData);
          totalMacd += macd;

          // KDJ
          const kdj = this.calculateKDJ(historyData);
          totalKdj += kdj;

          // 主力资金
          if (stock.mainForceRatio !== undefined) {
            totalMainForceRatio += stock.mainForceRatio;
          }
          if (stock.mainForceNetFlow !== undefined) {
            totalMainForceNetFlow += stock.mainForceNetFlow;
          }
        }
      } catch (error) {
        continue;
      }
    }

    if (validCount > 0) {
      features.avgVolumeRatio = totalVolumeRatio / validCount;
      features.avgPriceChange = totalPriceChange / validCount;
      features.avgPreChange = totalPreChange / validCount;
      features.avgRsi = totalRsi / validCount;
      features.avgMacd = totalMacd / validCount;
      features.avgKdj = totalKdj / validCount;
      features.avgMainForceRatio = totalMainForceRatio / validCount;
      features.avgMainForceNetFlow = totalMainForceNetFlow / validCount;
    }

    // 简单的行业/概念分布（模拟）
    features.industryDistribution = {
      '科技': Math.round(stocks.length * 0.3),
      '医药': Math.round(stocks.length * 0.2),
      '新能源': Math.round(stocks.length * 0.25),
      '消费': Math.round(stocks.length * 0.15),
      '其他': Math.round(stocks.length * 0.1)
    };

    features.conceptDistribution = {
      'AI': Math.round(stocks.length * 0.2),
      '半导体': Math.round(stocks.length * 0.15),
      '光伏': Math.round(stocks.length * 0.15),
      '锂电池': Math.round(stocks.length * 0.1),
      '其他': Math.round(stocks.length * 0.4)
    };

    return features;
  }

  // 根据涨停板特性调整参数
  private async adjustParamsBasedOnLimitUp(features: LimitUpFeatures): Promise<void> {
    const newParams = { ...this.params };

    // 根据涨停板股票特性调整参数
    if (features.avgVolumeRatio > 3) {
      // 涨停股票平均成交量放大超过3倍，说明成交量是重要指标
      newParams.volumeWeight = Math.min(2.0, this.params.volumeWeight * 1.15);
      logger.info(`调整成交量权重: ${this.params.volumeWeight} -> ${newParams.volumeWeight}`);
    }

    if (features.avgMainForceRatio > 0.65) {
      // 涨停股票主力资金占比超过65%，说明主力资金是重要指标
      // 通过调整其他权重间接影响主力资金评分
      newParams.priceChangeWeight = Math.min(2.0, this.params.priceChangeWeight * 1.1);
      logger.info(`调整价格变化权重: ${this.params.priceChangeWeight} -> ${newParams.priceChangeWeight}`);
    }

    if (features.avgRsi > 65 && features.avgRsi < 85) {
      // 涨停股票RSI在65-85之间，说明这个区间的股票更容易涨停
      newParams.rsiWeight = Math.min(2.0, this.params.rsiWeight * 1.08);
      logger.info(`调整RSI权重: ${this.params.rsiWeight} -> ${newParams.rsiWeight}`);
    }

    if (features.avgMacd > 0) {
      // 涨停股票MACD为正，说明MACD正值时更容易涨停
      newParams.macdWeight = Math.min(2.0, this.params.macdWeight * 1.12);
      logger.info(`调整MACD权重: ${this.params.macdWeight} -> ${newParams.macdWeight}`);
    }

    if (features.avgKdj > 50) {
      // 涨停股票KDJ在50以上，说明KDJ高位时更容易涨停
      newParams.kdjWeight = Math.min(2.0, this.params.kdjWeight * 1.1);
      logger.info(`调整KDJ权重: ${this.params.kdjWeight} -> ${newParams.kdjWeight}`);
    }

    // 根据涨停股票数量调整特殊信号阈值
    const limitUpCount = Object.values(features.industryDistribution).reduce((sum, v) => sum + v, 0);
    if (limitUpCount > 30) {
      // 当天涨停股票较多，可以适当提高特殊信号阈值
      newParams.specialSignalThreshold = Math.min(95, this.params.specialSignalThreshold + 3);
      logger.info(`涨停股票较多(${limitUpCount}只)，提高特殊信号阈值: ${this.params.specialSignalThreshold} -> ${newParams.specialSignalThreshold}`);
    } else if (limitUpCount < 10) {
      // 当天涨停股票较少，可以适当降低特殊信号阈值
      newParams.specialSignalThreshold = Math.max(60, this.params.specialSignalThreshold - 3);
      logger.info(`涨停股票较少(${limitUpCount}只)，降低特殊信号阈值: ${this.params.specialSignalThreshold} -> ${newParams.specialSignalThreshold}`);
    }

    // 应用参数调整
    this.params = this.clampParams(newParams);
    logger.info('基于涨停板特性的参数调整完成:', this.params);
  }

  // 计算RSI
  private calculateRSI(data: HistoricalData[]): number {
    if (data.length < 14) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) gains += change;
      else losses += Math.abs(change);
    }

    if (losses === 0) return 100;
    if (gains === 0) return 0;

    const avgGain = gains / (data.length - 1);
    const avgLoss = losses / (data.length - 1);

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // 计算MACD
  private calculateMACD(data: HistoricalData[]): number {
    if (data.length < 26) return 0;

    const ema12 = this.calculateEMA(data, 12);
    const ema26 = this.calculateEMA(data, 26);
    
    return ema12 - ema26;
  }

  // 计算EMA
  private calculateEMA(data: HistoricalData[], period: number): number {
    if (data.length < period) return data[data.length - 1]?.close || 0;

    const k = 2 / (period + 1);
    let ema = data[data.length - period].close;

    for (let i = data.length - period + 1; i < data.length; i++) {
      ema = (data[i].close * k) + (ema * (1 - k));
    }

    return ema;
  }

  // 计算KDJ（简化版，只返回K值）
  private calculateKDJ(data: HistoricalData[]): number {
    if (data.length < 9) return 50;

    const recentData = data.slice(-9);
    const low = Math.min(...recentData.map(d => d.low));
    const high = Math.max(...recentData.map(d => d.high));
    const close = data[data.length - 1].close;

    if (high === low) return 50;

    const rsv = ((close - low) / (high - low)) * 100;
    return rsv;
  }

  // 获取当前优化参数
  getParams(): OptimizationParams {
    return { ...this.params };
  }

  // 手动触发优化
  async triggerOptimization() {
    await this.autoLearn();
  }

  // 获取优化历史记录
  async getOptimizationHistory(): Promise<any[]> {
    return await this.db.getOptimizationHistory() || [];
  }

  // 清理资源
  destroy() {
    if (this.learningTimer) {
      clearInterval(this.learningTimer);
      this.learningTimer = null;
    }
  }
}

// 单例
let optimizerInstance: IntelligentOptimizer | null = null;

export function getIntelligentOptimizer(): IntelligentOptimizer {
  if (!optimizerInstance) {
    optimizerInstance = new IntelligentOptimizer();
  }
  return optimizerInstance;
}

export function destroyIntelligentOptimizer() {
  if (optimizerInstance) {
    optimizerInstance.destroy();
    optimizerInstance = null;
  }
}

// 涨停板股票特性
export interface LimitUpFeatures {
  avgVolumeRatio: number; // 平均成交量放大倍数
  avgPriceChange: number; // 平均涨幅
  avgPreChange: number; // 涨停前一天平均涨幅
  avgRsi: number; // 平均RSI
  avgMacd: number; // 平均MACD
  avgKdj: number; // 平均KDJ
  avgMainForceRatio: number; // 平均主力资金占比
  avgMainForceNetFlow: number; // 平均主力资金净流入
  industryDistribution: Record<string, number>; // 行业分布
  conceptDistribution: Record<string, number>; // 概念分布
  timeDistribution: Record<string, number>; // 涨停时间分布
}
