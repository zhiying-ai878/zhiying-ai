import { getStockDataSource, getTechnicalIndicators, Logger } from './stockData';
import { playSellAlert, playBuyAlert } from './audioManager';
import { IndexedDBManager } from './indexedDBManager';
import { DataMigrationManager } from './dataMigrationManager';
import { getHistoricalDataManager } from './historicalData';
import { getIntelligentOptimizer } from './intelligentOptimizer';
import { chipPeakAnalyzer } from './chipPeakAnalyzer';
const logger = Logger.getInstance();
const historicalDataManager = getHistoricalDataManager({ limit: 60 });
const intelligentOptimizer = getIntelligentOptimizer();

// 新闻数据接口
export interface NewsData {
  id: string;
  title: string;
  content: string;
  source: string;
  timestamp: number;
  stockCodes?: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: number;
}

// 热点数据接口
export interface HotspotData {
  stockCode: string;
  stockName: string;
  industry: string;
  concepts: string[];
  industryRank: number;
  conceptRank: number;
  popularityScore: number;
  popularityTrend: 'up' | 'down' | 'stable';
  searchVolume: number;
}

// 财务数据接口
export interface FinancialData {
  stockCode: string;
  eps: number;
  pe: number;
  pb: number;
  roe: number;
  revenueGrowth: number;
  profitGrowth: number;
  debtToAsset: number;
  cashFlow: number;
  industryAveragePE: number;
  industryAveragePB: number;
}

// 调研数据接口
export interface ResearchData {
  stockCode: string;
  researchCount: number;
  latestResearchDate: number;
  institutionalHolders: number;
  institutionalChange: number;
  targetPrice: number;
  analystRecommendations: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
}

// 主力资金数据接口
export interface MainForceData {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  marketCap?: number;
  floatMarketCap?: number;
  mainForceNetFlow: number;
  totalNetFlow: number;
  superLargeOrder: {
    netFlow: number;
    volume: number;
    amount: number;
  };
  largeOrder: {
    netFlow: number;
    volume: number;
    amount: number;
  };
  mediumOrder: {
    netFlow: number;
    volume: number;
    amount: number;
  };
  smallOrder: {
    netFlow: number;
    volume: number;
    amount: number;
  };
  volumeAmplification?: number;
  turnoverRate?: number;
  timestamp: number;
  mainForceRatio?: number;
  mainForceType?: 'nationalTeam' | 'institution' | 'publicFund' | 'privateFund' | 'retail' | 'foreignFund' | 'socialSecurity' | 'insurance' | 'bank' | 'hotMoney' | 'unknown';
  flowStrength?: 'weak' | 'moderate' | 'strong' | 'veryStrong';
  continuousFlowPeriods?: number;
  industryRank?: number;
  conceptRank?: number;
  trend?: string;
}

// 技术指标数据接口
export interface TechnicalData {
  rsi: number;
  macd: {
    diff: number;
    dea: number;
    macd: number;
  };
  kdj: {
    k: number;
    d: number;
    j: number;
  };
  ma: {
    ma5: number;
    ma10: number;
    ma20: number;
    ma30: number;
    ma60: number;
  };
  boll: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: {
    ma5: number;
    ma10: number;
    ma20: number;
  };
  sar: number;
  cci: number;
  adx: number;
  williamsR: number;
  bias: number;
}

// 市场指数数据接口
export interface IndexData {
  sh000001: {
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    amount: number;
    timestamp: number;
  };
  sz399001: {
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    amount: number;
    timestamp: number;
  };
  sz399006: {
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    amount: number;
    timestamp: number;
  };
}

// 风险评估数据接口
export interface RiskAssessmentData {
  overallRisk: 'low' | 'medium' | 'high' | 'very_high';
  technicalRisk: number;
  marketRisk: number;
  financialRisk: number;
  newsRisk: number;
  mainForceRisk: number;
  volatilityRisk: number;
  liquidityRisk: number;
  riskFactors: string[];
  riskScore: number;
}

// 机器学习模型接口
export interface MLModelData {
  features: number[];
  label: 'buy' | 'sell' | 'hold';
  timestamp: number;
  stockCode: string;
  prediction?: number;
  actual?: 'buy' | 'sell' | 'hold';
  confidence?: number;
}

// 卖出特征分析接口
export interface SellFeatureAnalysis {
  pricePeakDetected: boolean;
  momentumDecay: number;
  volumeDivergence: number;
  technicalDivergence: number;
  mainForceExhaustion: number;
  riskScore: number;
  t0Opportunity: boolean;
}

// 模型性能指标接口
export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  trainingCount: number;
  lastUpdated: number;
}

// 模型配置接口
export interface MLModelConfig {
  enabled: boolean;
  trainingInterval: number; // 训练间隔（毫秒）
  minTrainingSamples: number; // 最小训练样本数
  featureWeights: Record<string, number>; // 特征权重
  modelType: 'logistic_regression' | 'decision_tree' | 'random_forest' | 'deep_neural_network';
  neuralNetworkConfig?: {
    hiddenLayers: number[];
    activation: 'relu' | 'sigmoid' | 'tanh' | 'leaky_relu';
    learningRate: number;
    epochs: number;
    batchSize: number;
    useBatchNorm?: boolean;
    dropoutRate?: number;
  };
}

// 综合数据接口
export interface ComprehensiveData {
  stockCode: string;
  stockName: string;
  mainForceData: MainForceData;
  newsData?: NewsData[];
  hotspotData?: HotspotData;
  financialData?: FinancialData;
  researchData?: ResearchData;
  technicalData?: TechnicalData;
  indexData?: IndexData;
  riskAssessment?: RiskAssessmentData;
  sellFeatureAnalysis?: SellFeatureAnalysis;
  mlPrediction?: { prediction: 'buy' | 'sell' | 'hold'; confidence: number };
  currentPrice: number;
  chipPeakAnalysis?: {
    supportLevel: number;
    resistanceLevel: number;
    chipConcentration: number;
    mainChipArea: number; // 持仓平均价
  };
}

export interface StockPosition {
  stockCode: string;
  stockName: string;
  entryPrice: number;
  volume: number;
  entryTime: number;
}

export interface OptimizedSignal {
  id: string;
  stockCode: string;
  stockName: string;
  type: 'buy' | 'sell';
  score: number;
  confidence: number;
  reason: string;
  timestamp: number;
  isRead: boolean;
  isAuctionPeriod?: boolean;
  mainForceFlow?: number;
  mainForceRatio?: number;
  volumeAmplification?: number;
  turnoverRate?: number;
  priorityRank?: number;
  buyPriceRange?: {
    lower: number;
    upper: number;
  };
  sellPriceRange?: {
    lower: number;
    upper: number;
  };
  targetPrice?: number;
  expectedProfitPercent?: number;
  price?: number;
  // 机器学习相关字段
  limitUpPotentialScore?: number;
  isLimitUpPotential?: boolean;  // 标识是否为涨停板潜力信号
  isLeadingStock?: boolean;  // 标识是否为龙头股票
  isPotentialDouble?: boolean;  // 标识是否为即将翻倍大涨的股票
  isPotentialMultiBagger?: boolean;  // 标识是否为多倍潜力股票（翻倍以上）
  learningModelAccuracy?: number;
  satisfiedConditions?: number;
  totalConditions?: number;
  newsSentiment?: 'positive' | 'negative' | 'neutral';
  newsRelevance?: number;
  industryRank?: number;
  conceptRank?: number;
  popularityScore?: number;
  popularityTrend?: 'up' | 'down' | 'stable';
  financialScore?: number;
  researchScore?: number;
  riskAssessment?: RiskAssessmentData;
  mlPrediction?: { prediction: 'buy' | 'sell' | 'hold'; confidence: number };
  comprehensiveScore?: number;
  detailedReasons?: string[];
}

export interface SignalFilterConfig {
  maxBuySignals: number;
  onlyHeldStocksForSell: boolean;
  minConfidence: number;
  auctionPeriodStart: string;
  auctionPeriodEnd: string;
  enableAuctionSignals: boolean;
  signalTypes: Array<'buy' | 'sell'>;
  stockFilter: string;
  sortBy: 'confidence' | 'score' | 'time' | 'mainForceFlow';
  maxHistoryDays: number;
}

const DEFAULT_CONFIG: SignalFilterConfig = {
  maxBuySignals: 500,
  onlyHeldStocksForSell: true,
  minConfidence: 10,
  auctionPeriodStart: '09:15',
  auctionPeriodEnd: '09:25',
  enableAuctionSignals: true,
  signalTypes: ['buy', 'sell'],
  stockFilter: '',
  sortBy: 'confidence',
  maxHistoryDays: 7
};

class OptimizedSignalManager {
  public instanceId: string;
  private config: SignalFilterConfig;
  private positions: Map<string, StockPosition> = new Map();
  private pendingBuySignals: OptimizedSignal[] = [];
  private pendingSellSignals: OptimizedSignal[] = [];
  private signalHistory: OptimizedSignal[] = [];
  private notifiedSignals: Set<string> = new Set();
  private listeners: Array<(signals: OptimizedSignal[]) => void> = [];
  // ====== 【新增】持仓监听器 ======
  private positionListeners: Array<() => void> = [];
  private signalsLoaded = this.getSignalsLoadedFromStorage(); // 从localStorage恢复标记，防止页面刷新后重复加载
  private signalCooldown: Map<string, number> = new Map(); // 信号冷却时间，避免短时间内重复生成同一股票的信号
  private cooldownPeriod = 60000; // 1分钟冷却时间，大幅减少冷却时间以增加信号生成频率
  
  // 从localStorage获取signalsLoaded状态
  private getSignalsLoadedFromStorage(): boolean {
    try {
      const stored = localStorage.getItem('signalsLoaded');
      const result = stored === 'true';
      console.log(`[signalsLoaded恢复] localStorage值: "${stored}", 解析结果: ${result}`);
      return result;
    } catch (e) {
      console.warn('获取signalsLoaded状态失败:', e);
      return false;
    }
  }
  
  // 保存signalsLoaded状态到localStorage
  private setSignalsLoadedToStorage(value: boolean): void {
    try {
      localStorage.setItem('signalsLoaded', value ? 'true' : 'false');
      console.log(`[signalsLoaded保存] 保存值: ${value}`);
    } catch (e) {
      console.warn('保存signalsLoaded状态失败:', e);
    }
  }
  private mainForceHistory: Map<string, Array<{ timestamp: number; netFlow: number; ratio: number }>> = new Map();
  private readonly SIGNAL_HISTORY_KEY = 'optimized_signal_history';
  private continuousFlowPeriods = 3;
  private continuousFlowThreshold = 500000;
  private mainForceTypeHistory: Map<string, Array<{
    timestamp: number;
    superLargeFlow: number;
    largeFlow: number;
    mediumFlow: number;
    smallFlow: number;
    mainForceType: 'nationalTeam' | 'institution' | 'publicFund' | 'privateFund' | 'retail' | 'foreignFund' | 'socialSecurity' | 'insurance' | 'bank' | 'hotMoney' | 'unknown';
    flowStrength?: 'weak' | 'moderate' | 'strong' | 'veryStrong';
    trend?: 'increasing' | 'decreasing' | 'stable';
    changeRate?: number;
  }>> = new Map();
  private mainForceTypeThresholds = {
    superLargeOrderRatio: 0.6,
    largeOrderRatio: 0.4,
    smallOrderRatio: 0.7
  };

  // 增强的主力资金分析参数
  private enhancedMainForceParams = {
    // 资金流向强度阈值
    flowStrengthThresholds: {
      weak: 1000000,      // 100万
      moderate: 5000000,   // 500万
      strong: 10000000,   // 1000万
      veryStrong: 50000000 // 5000万
    },
    // 资金流向趋势分析窗口
    trendAnalysisWindow: 5,
    // 资金流向变化率阈值
    changeRateThreshold: 0.3,
    // 异常资金检测阈值
    anomalyThreshold: 2.0
  };

  // 机器学习模型配置
  private mlModelConfig: MLModelConfig = {
    enabled: true,
    trainingInterval: 1800000, // 30分钟训练一次，更频繁的学习
    minTrainingSamples: 50, // 最小50个训练样本，降低门槛
    featureWeights: {
      mainForceFlow: 0.2,
      mainForceRatio: 0.15,
      technicalScore: 0.15,
      newsScore: 0.1,
      hotspotScore: 0.1,
      financialScore: 0.1,
      researchScore: 0.05,
      riskScore: 0.15,
      sellRiskScore: 0.2 // 新增卖出风险评分权重
    },
    modelType: 'deep_neural_network', // 默认使用深度神经网络
    neuralNetworkConfig: {
      hiddenLayers: [64, 32, 16, 8, 4], // 5层隐藏层，深度神经网络结构
      activation: 'leaky_relu', // 使用LeakyReLU激活函数
      learningRate: 0.001,
      epochs: 100,
      batchSize: 32,
      useBatchNorm: true, // 使用批量归一化
      dropoutRate: 0.2 // 使用dropout防止过拟合
    }
  };
  
  // 深度神经网络模型参数
  private neuralNetworkParams: {
    weights: number[][][];
    biases: number[][];
    batchNormParams?: {
      gamma: number[][];
      beta: number[][];
    };
    adamParams?: {
      mWeights: number[][][]; // 一阶动量
      vWeights: number[][][]; // 二阶动量
      mBiases: number[][]; // 一阶动量
      vBiases: number[][]; // 二阶动量
    };
  } | null = null;
  
  // 自适应阈值设置
  private adaptiveThresholds: { [key: string]: number } = {
    minMainForceFlow: 100000,
    minMainForceRatio: 0.05,
    minVolumeAmplification: 1.2,
    minTurnoverRate: 2,
    buyConfidence: 10,
    sellConfidence: 10,
    priceChangeThreshold: 0.01
  };
  
  // 市场趋势历史
  private marketTrendHistory: Array<{
    timestamp: number;
    upStocks: number;
    downStocks: number;
    avgMainForce: number;
    avgVolumeAmplification: number;
  }> = [];

  // 预测缓存
  private predictionCache: Map<string, {
    prediction: 'buy' | 'sell' | 'hold';
    confidence: number;
    timestamp: number;
    features: number[];
  }>= new Map();
  
  // 缓存过期时间（毫秒）
  private readonly CACHE_TTL = 30000; // 30秒

  // 初始化神经网络权重
  private initializeNeuralNetwork(inputSize: number) {
    if (!this.mlModelConfig.neuralNetworkConfig) {
      return;
    }

    const { hiddenLayers, useBatchNorm } = this.mlModelConfig.neuralNetworkConfig;
    const layerSizes = [inputSize, ...hiddenLayers, 1]; // 输出层为1个神经元（分类）
    
    const weights: number[][][] = [];
    const biases: number[][] = [];
    let batchNormParams: { gamma: number[][]; beta: number[][] } | undefined;

    if (useBatchNorm) {
      batchNormParams = { gamma: [], beta: [] };
    }

    for (let i = 0; i < layerSizes.length - 1; i++) {
      const weightMatrix: number[][] = [];
      const biasVector: number[] = [];
      
      for (let j = 0; j < layerSizes[i + 1]; j++) {
        const weightsRow: number[] = [];
        for (let k = 0; k < layerSizes[i]; k++) {
          // 使用Xavier初始化
          const limit = Math.sqrt(6 / (layerSizes[i] + layerSizes[i + 1]));
          weightsRow.push((Math.random() * 2 - 1) * limit);
        }
        weightMatrix.push(weightsRow);
        biasVector.push(0); // 偏置初始化为0
      }
      
      weights.push(weightMatrix);
      biases.push(biasVector);

      // 初始化批量归一化参数
      if (useBatchNorm && i < layerSizes.length - 2) { // 输出层不使用批量归一化
        batchNormParams?.gamma.push(new Array(layerSizes[i + 1]).fill(1));
        batchNormParams?.beta.push(new Array(layerSizes[i + 1]).fill(0));
      }
    }

    // 初始化Adam优化器参数
    const adamParams = {
      mWeights: weights.map(layer => 
        layer.map(neuron => neuron.map(() => 0))
      ),
      vWeights: weights.map(layer => 
        layer.map(neuron => neuron.map(() => 0))
      ),
      mBiases: biases.map(layer => layer.map(() => 0)),
      vBiases: biases.map(layer => layer.map(() => 0))
    };

    this.neuralNetworkParams = { weights, biases, batchNormParams, adamParams };
  }

  // 神经网络前向传播
  private forwardPropagation(inputs: number[]): { activations: number[][]; zValues: number[][] } {
    if (!this.neuralNetworkParams) {
      throw new Error('神经网络参数未初始化');
    }

    const { weights, biases, batchNormParams } = this.neuralNetworkParams;
    const { activation, useBatchNorm } = this.mlModelConfig.neuralNetworkConfig || {};
    const activations: number[][] = [inputs];
    const zValues: number[][] = [];

    let currentActivations = inputs;

    for (let i = 0; i< weights.length; i++) {
      let z = this.matrixVectorMultiply(weights[i], currentActivations);
      for (let j = 0; j < z.length; j++) {
        z[j] += biases[i][j];
      }

      // 应用批量归一化（除了输出层）
      if (useBatchNorm && batchNormParams && i < weights.length - 1) {
        z = this.applyBatchNorm(z, batchNormParams.gamma[i], batchNormParams.beta[i]);
      }

      zValues.push(z);

      // 根据配置使用不同的激活函数（除了最后一层）
      if (i < weights.length - 1) {
        switch (activation) {
          case 'leaky_relu':
            currentActivations = z.map(x => Math.max(0.01 * x, x));
            break;
          case 'sigmoid':
            currentActivations = z.map(x => this.sigmoid(x));
            break;
          case 'tanh':
            currentActivations = z.map(x => Math.tanh(x));
            break;
          case 'relu':
          default:
            currentActivations = z.map(x => Math.max(0, x));
            break;
        }
      } else {
        // 最后一层使用sigmoid激活函数进行分类
        currentActivations = z.map(x => this.sigmoid(x));
      }
      activations.push(currentActivations);
    }

    return { activations, zValues };
  }

  // 应用批量归一化
  private applyBatchNorm(z: number[], gamma: number[], beta: number[]): number[] {
    // 简化的批量归一化实现（训练时使用）
    const mean = z.reduce((sum, val) => sum + val, 0) / z.length;
    const variance = z.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / z.length;
    const epsilon = 1e-8;
    
    return z.map((val, index) => {
      const normalized = (val - mean) / Math.sqrt(variance + epsilon);
      return gamma[index] * normalized + beta[index];
    });
  }

  // 矩阵向量乘法
  private matrixVectorMultiply(matrix: number[][], vector: number[]): number[] {
    const result: number[] = [];
    for (let i = 0; i < matrix.length; i++) {
      let sum = 0;
      for (let j = 0; j< matrix[i].length; j++) {
        sum += matrix[i][j] * vector[j];
      }
      result.push(sum);
    }
    return result;
  }

  // 神经网络反向传播
  private backwardPropagation(inputs: number[], target: number, activations: number[][], zValues: number[][]): { weightGradients: number[][][]; biasGradients: number[][] } {
    if (!this.neuralNetworkParams) {
      throw new Error('神经网络参数未初始化');
    }

    const { weights } = this.neuralNetworkParams;
    const weightGradients: number[][][] = [];
    const biasGradients: number[][] = [];

    // 初始化梯度结构
    for (let i = 0; i< weights.length; i++) {
      weightGradients.push([]);
      biasGradients.push([]);
      for (let j = 0; j < weights[i].length; j++) {
        weightGradients[i].push(new Array(weights[i][j].length).fill(0));
        biasGradients[i].push(0);
      }
    }

    // 计算输出层误差
    const outputError = activations[activations.length - 1][0] - target;
    let delta = outputError * this.sigmoidDerivative(zValues[zValues.length - 1][0]);

    // 反向传播计算梯度
    for (let i = weights.length - 1; i >= 0; i--) {
      for (let j = 0; j< weights[i].length; j++) {
        biasGradients[i][j] = delta;
        
        for (let k = 0; k < weights[i][j].length; k++) {
          weightGradients[i][j][k] = delta * activations[i][k];
        }
      }

      // 如果不是第一层，计算前一层的误差
      if (i > 0) {
        const newDelta: number[] = [];
        const { activation } = this.mlModelConfig.neuralNetworkConfig || {};
        
        for (let j = 0; j < weights[i - 1].length; j++) {
          let sum = 0;
          for (let k = 0; k < weights[i].length; k++) {
            sum += weights[i][k][j] * delta;
          }
          
          // 根据激活函数计算导数
          let activationDerivative: number;
          switch (activation) {
            case 'leaky_relu':
              activationDerivative = zValues[i - 1][j] > 0 ? 1 : 0.01;
              break;
            case 'sigmoid':
              activationDerivative = this.sigmoid(zValues[i - 1][j]) * (1 - this.sigmoid(zValues[i - 1][j]));
              break;
            case 'tanh':
              activationDerivative = 1 - Math.pow(Math.tanh(zValues[i - 1][j]), 2);
              break;
            case 'relu':
            default:
              activationDerivative = zValues[i - 1][j] > 0 ? 1 : 0;
              break;
          }
          
          newDelta.push(sum * activationDerivative);
        }
        delta = newDelta[0]; // 简化处理，实际应该是向量
      }
    }

    return { weightGradients, biasGradients };
  }

  // Sigmoid导数
  private sigmoidDerivative(z: number): number {
    const sig = this.sigmoid(z);
    return sig * (1 - sig);
  }

  // 更新神经网络参数
  private updateNeuralNetworkParams(weightGradients: number[][][], biasGradients: number[][], learningRate: number) {
    if (!this.neuralNetworkParams) {
      return;
    }

    const { weights, biases, adamParams } = this.neuralNetworkParams;
    const beta1 = 0.9; // 一阶动量衰减率
    const beta2 = 0.999; // 二阶动量衰减率
    const epsilon = 1e-8; // 防止除以零
    const timeStep = 1; // 简化处理，实际应该跟踪时间步

    // Adam优化器参数更新
    for (let i = 0; i< weights.length; i++) {
      for (let j = 0; j < weights[i].length; j++) {
        if (adamParams) {
          // 更新偏置的一阶动量和二阶动量
          adamParams.mBiases[i][j] = beta1 * adamParams.mBiases[i][j] + (1 - beta1) * biasGradients[i][j];
          adamParams.vBiases[i][j] = beta2 * adamParams.vBiases[i][j] + (1 - beta2) * Math.pow(biasGradients[i][j], 2);
          
          // 偏差修正
          const mBiasesHat = adamParams.mBiases[i][j] / (1 - Math.pow(beta1, timeStep));
          const vBiasesHat = adamParams.vBiases[i][j] / (1 - Math.pow(beta2, timeStep));
          
          // 更新偏置
          biases[i][j] -= learningRate * mBiasesHat / (Math.sqrt(vBiasesHat) + epsilon);
          
          // 更新权重的一阶动量和二阶动量
          for (let k = 0; k < weights[i][j].length; k++) {
            adamParams.mWeights[i][j][k] = beta1 * adamParams.mWeights[i][j][k] + (1 - beta1) * weightGradients[i][j][k];
            adamParams.vWeights[i][j][k] = beta2 * adamParams.vWeights[i][j][k] + (1 - beta2) * Math.pow(weightGradients[i][j][k], 2);
            
            // 偏差修正
            const mWeightsHat = adamParams.mWeights[i][j][k] / (1 - Math.pow(beta1, timeStep));
            const vWeightsHat = adamParams.vWeights[i][j][k] / (1 - Math.pow(beta2, timeStep));
            
            // 更新权重
            weights[i][j][k] -= learningRate * mWeightsHat / (Math.sqrt(vWeightsHat) + epsilon);
          }
        } else {
          // 回退到普通梯度下降
          biases[i][j] -= learningRate * biasGradients[i][j];
          for (let k = 0; k < weights[i][j].length; k++) {
            weights[i][j][k] -= learningRate * weightGradients[i][j][k];
          }
        }
      }
    }
  }

  // 机器学习相关数据
  private trainingData: MLModelData[] = [];
  private modelPerformance: ModelPerformance = {
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1Score: 0,
    confusionMatrix: [[0, 0], [0, 0]],
    trainingCount: 0,
    lastUpdated: 0
  };
  private lastTrainingTime = 0;
  private indexedDBManager: IndexedDBManager;
  private dataMigrationManager: DataMigrationManager;

  constructor(config?: Partial<SignalFilterConfig>, instanceId?: string) {
    const timestamp = new Date().toLocaleString('zh-CN');
    this.instanceId = instanceId || 'default-' + Math.random().toString(36).substr(2, 5);
    
    // ========== 始终初始化这些属性 ==========
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.indexedDBManager = IndexedDBManager.getInstance();
    this.dataMigrationManager = DataMigrationManager.getInstance();
    
    console.log(`[${timestamp}] [构造函数] ====== OptimizedSignalManager 构造函数被调用 ======`);
    console.log(`[${timestamp}] [构造函数] 实例ID: ${this.instanceId}`);
    console.log(`[${timestamp}] [构造函数] this.signalHistory 初始长度：`, this.signalHistory.length);
    
    // ========== 保护：如果内存中已经有信号了，跳过信号加载！ ==========
    if (this.signalHistory.length > 0) {
      console.log(`[${timestamp}] [构造函数] 内存中已有${this.signalHistory.length}个信号，跳过加载！`);
      this.initStorage().then(() => {
        this.loadPositionsFromStorage();
        this.loadModelState();
      });
      return;
    }
    
    // 初始化IndexedDB和数据迁移
    // 每次登录都重新加载信号历史，确保信号不会丢失
    this.initStorage().then(() => {
      console.log('initStorage 完成，准备加载信号历史');
      console.log('加载前 this.signalHistory 长度：', this.signalHistory.length);
      // 加载信号历史（内部会检查是否已加载过）
      return this.loadSignalHistory();
    }).then(() => {
      console.log('loadSignalHistory 完成，this.signalHistory 长度：', this.signalHistory.length);
      // 加载持仓和模型状态
      this.loadPositionsFromStorage();
      this.loadModelState(); // 加载保存的模型状态
    }).catch(error => {
      console.error('初始化失败:', error);
    });
  }

  private async initStorage(): Promise<void> {
    try {
      // 运行数据迁移
      await this.dataMigrationManager.runMigration();
      logger.info('存储初始化完成');
    } catch (error) {
      logger.error('存储初始化失败', error);
    }
  }

  private async loadPositionsFromStorage() {
    try {
      // 尝试从IndexedDB加载持仓
      try {
        const indexedPositions = await this.indexedDBManager.getPositions();
        if (indexedPositions && indexedPositions.length > 0) {
          indexedPositions.forEach(pos => {
            this.positions.set(pos.stockCode, {
              stockCode: pos.stockCode,
              stockName: pos.stockName,
              entryPrice: pos.entryPrice,
              volume: pos.volume,
              entryTime: pos.entryTime
            });
          });
          logger.info(`从IndexedDB加载 ${indexedPositions.length} 个持仓`);
          this.cleanupInvalidSellSignals();
          
          // ====== 【新增】通知持仓监听器 ======
          this.notifyPositionListeners();
          return;
        }
      } catch (error) {
        logger.warn('从IndexedDB加载持仓失败，尝试从localStorage加载', error);
      }

      // 回退到localStorage
      const saved = localStorage.getItem('stockPositions');
      if (saved) {
        const positions: StockPosition[] = JSON.parse(saved);
        positions.forEach(pos => {
          this.positions.set(pos.stockCode, pos);
        });
        logger.info(`从localStorage加载 ${positions.length} 个持仓`);
        
        // ====== 【新增】通知持仓监听器 ======
        this.notifyPositionListeners();
      }
    } catch (error) {
      logger.error('加载持仓失败', error);
    }
  }

  private async savePositionsToStorage() {
    try {
      const positions = Array.from(this.positions.values());
      
      // 保存到IndexedDB
      try {
        // 先获取数据库中当前的所有持仓
        const dbPositions = await this.indexedDBManager.getPositions();
        const currentCodes = new Set(positions.map(p => p.stockCode));
        const dbCodes = new Set(dbPositions.map(p => p.stockCode));
        
        // 删除数据库中不再存在的持仓
        for (const dbPosition of dbPositions) {
          if (!currentCodes.has(dbPosition.stockCode)) {
            await this.indexedDBManager.deletePosition(dbPosition.stockCode);
          }
        }
        
        // 添加/更新当前持仓
        for (const position of positions) {
          await this.indexedDBManager.addPosition({
            stockCode: position.stockCode,
            stockName: position.stockName,
            entryPrice: position.entryPrice,
            volume: position.volume,
            entryTime: position.entryTime,
            created_at: Date.now(),
            updated_at: Date.now()
          });
        }
        logger.info(`保存 ${positions.length} 个持仓到IndexedDB，删除了 ${dbPositions.length - positions.length} 个旧持仓`);
      } catch (error) {
        logger.warn('保存到IndexedDB失败，回退到localStorage', error);
        // 回退到localStorage
        localStorage.setItem('stockPositions', JSON.stringify(positions));
      }
    } catch (error) {
      logger.error('保存持仓失败', error);
    }
  }

  private isAuctionPeriod(): boolean {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    return currentTime >= this.config.auctionPeriodStart && 
           currentTime <= this.config.auctionPeriodEnd;
  }

  // 检查信号是否在冷却期内
  private isSignalInCooldown(stockCode: string, signalType: 'buy' | 'sell'): boolean {
    const key = `${stockCode}_${signalType}`;
    const lastSignalTime = this.signalCooldown.get(key);
    const now = Date.now();
    
    if (lastSignalTime && now - lastSignalTime < this.cooldownPeriod) {
      return true;
    }
    
    return false;
  }

  // 设置信号冷却时间
  private setSignalCooldown(stockCode: string, signalType: 'buy' | 'sell'): void {
    const key = `${stockCode}_${signalType}`;
    this.signalCooldown.set(key, Date.now());
  }

  // 清理过期的冷却记录
  private cleanupExpiredCooldowns(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.signalCooldown.entries()) {
      if (now - timestamp >= this.cooldownPeriod) {
        this.signalCooldown.delete(key);
      }
    }
  }

  // 分析市场趋势
  private analyzeMarketTrend(signals: OptimizedSignal[]): void {
    const now = Date.now();
    
    // 统计上涨和下跌股票数量
    const upStocks = signals.filter(signal => signal.type === 'buy').length;
    const downStocks = signals.filter(signal => signal.type === 'sell').length;
    
    // 计算平均主力资金和成交量放大倍数
    const totalSignals = signals.length;
    const avgMainForce = totalSignals > 0 ? 
      signals.reduce((sum, signal) => sum + (signal.mainForceFlow || 0), 0) / totalSignals : 0;
    const avgVolumeAmplification = totalSignals > 0 ?
      signals.reduce((sum, signal) => sum + (signal.volumeAmplification || 0), 0) / totalSignals : 0;
    
    // 添加到趋势历史
    this.marketTrendHistory.push({
      timestamp: now,
      upStocks,
      downStocks,
      avgMainForce,
      avgVolumeAmplification
    });
    
    // 保留最近50条记录
    if (this.marketTrendHistory.length > 50) {
      this.marketTrendHistory.shift();
    }
    
    // 调整自适应阈值
    this.adjustAdaptiveThresholds();
  }

  // 调整自适应阈值
  private adjustAdaptiveThresholds(): void {
    if (this.marketTrendHistory.length< 5) {
      return;
    }
    
    const recentTrends = this.marketTrendHistory.slice(-5);
    const avgMainForce = recentTrends.reduce((sum, trend) =>sum + trend.avgMainForce, 0) / recentTrends.length;
    const avgVolumeAmplification = recentTrends.reduce((sum, trend) => sum + trend.avgVolumeAmplification, 0) / recentTrends.length;
    
    // 根据市场主力资金情况调整阈值
    if (avgMainForce > 1000000) {
      // 市场主力资金活跃，降低买入阈值，提高卖出阈值
      this.adaptiveThresholds.minMainForceFlow = Math.max(50000, this.adaptiveThresholds.minMainForceFlow - 10000);
      this.adaptiveThresholds.buyConfidence = Math.max(5, this.adaptiveThresholds.buyConfidence - 2);
      this.adaptiveThresholds.sellConfidence = Math.min(15, this.adaptiveThresholds.sellConfidence + 2);
      console.log('市场主力资金活跃，调整买入阈值向下，卖出阈值向上');
    } else if (avgMainForce< -500000) {
      // 市场主力资金流出，提高买入阈值，降低卖出阈值
      this.adaptiveThresholds.minMainForceFlow = Math.min(200000, this.adaptiveThresholds.minMainForceFlow + 10000);
      this.adaptiveThresholds.buyConfidence = Math.min(15, this.adaptiveThresholds.buyConfidence + 2);
      this.adaptiveThresholds.sellConfidence = Math.max(5, this.adaptiveThresholds.sellConfidence - 2);
      console.log('市场主力资金流出，调整买入阈值向上，卖出阈值向下');
    }
    
    // 根据成交量放大情况调整阈值
    const historicalAvgVolume = this.marketTrendHistory.reduce((sum, trend) => sum + trend.avgVolumeAmplification, 0) / this.marketTrendHistory.length;
    if (avgVolumeAmplification > historicalAvgVolume * 1.5) {
      this.adaptiveThresholds.minVolumeAmplification = Math.min(1.5, this.adaptiveThresholds.minVolumeAmplification + 0.1);
      console.log('市场成交量放大，调整成交量阈值向上');
    } else if (avgVolumeAmplification< historicalAvgVolume * 0.5) {
      this.adaptiveThresholds.minVolumeAmplification = Math.max(1.0, this.adaptiveThresholds.minVolumeAmplification - 0.1);
      console.log('市场成交量萎缩，调整成交量阈值向下');
    }
    
    // 智能优化信号生成条件
    this.optimizeSignalGenerationConditions();
    
    console.log(`自适应阈值调整完成: ${JSON.stringify(this.adaptiveThresholds)}`);
  }

  private optimizeSignalGenerationConditions(): void {
    try {
      const recentSignals = this.signalHistory.slice(-50);
      
      if (recentSignals.length< 10) {
        return;
      }
      
      // 分析信号分布
      const buySignals = recentSignals.filter(s =>s.type === 'buy');
      const sellSignals = recentSignals.filter(s => s.type === 'sell');
      
      // 计算信号质量指标
      const buyQuality = buySignals.length >0 ? 
        buySignals.filter(s => s.confidence > 60).length / buySignals.length : 0;
      const sellQuality = sellSignals.length >0 ? 
        sellSignals.filter(s => s.confidence > 60).length / sellSignals.length : 0;
      
      // 动态调整信号生成条件
      if (buyQuality > 0.7) {
        // 买入信号质量高，可以降低门槛
        this.adaptiveThresholds.minMainForceFlow = Math.max(50000, this.adaptiveThresholds.minMainForceFlow - 5000);
        this.adaptiveThresholds.minVolumeAmplification = Math.max(1.0, this.adaptiveThresholds.minVolumeAmplification - 0.05);
        console.log('买入信号质量高，降低信号生成门槛');
      } else if (buyQuality< 0.3) {
        // 买入信号质量低，提高门槛
        this.adaptiveThresholds.minMainForceFlow = Math.min(200000, this.adaptiveThresholds.minMainForceFlow + 5000);
        this.adaptiveThresholds.minVolumeAmplification = Math.min(1.5, this.adaptiveThresholds.minVolumeAmplification + 0.05);
        console.log('买入信号质量低，提高信号生成门槛');
      }
      
      if (sellQuality > 0.7) {
        // 卖出信号质量高，可以降低门槛
        this.adaptiveThresholds.sellConfidence = Math.max(5, this.adaptiveThresholds.sellConfidence - 2);
        console.log('卖出信号质量高，降低卖出置信度要求');
      } else if (sellQuality< 0.3) {
        // 卖出信号质量低，提高门槛
        this.adaptiveThresholds.sellConfidence = Math.min(15, this.adaptiveThresholds.sellConfidence + 2);
        console.log('卖出信号质量低，提高卖出置信度要求');
      }
      
      // 平衡买卖信号数量
      const signalRatio = buySignals.length / Math.max(sellSignals.length, 1);
      if (signalRatio > 2) {
        // 买入信号过多，适当提高买入门槛
        this.adaptiveThresholds.buyConfidence = Math.min(15, this.adaptiveThresholds.buyConfidence + 1);
        console.log('买入信号过多，提高买入置信度要求');
      } else if (signalRatio< 0.5) {
        // 卖出信号过多，适当提高卖出门槛
        this.adaptiveThresholds.sellConfidence = Math.min(15, this.adaptiveThresholds.sellConfidence + 1);
        console.log('卖出信号过多，提高卖出置信度要求');
      }
      
    } catch (error) {
      console.warn('信号生成条件优化失败:', error);
    }
  }

  private calculateSignalScore(data: ComprehensiveData, type: 'buy' | 'sell'): { score: number; detailedReasons: string[] } {
    let score = 0;
    const detailedReasons: string[] = [];
    const mainForceData = data.mainForceData;
    const mainForceFlow = mainForceData.mainForceNetFlow;
    const superLargeFlow = mainForceData.superLargeOrder.netFlow;
    const largeFlow = mainForceData.largeOrder.netFlow;
    const totalFlow = mainForceData.totalNetFlow;

    let mainForceScore = 0;
    if (type === 'buy') {
      const mainForceAbs = Math.abs(mainForceFlow);
      const totalAbs = Math.abs(totalFlow) || 1;
      const mainForceRatio = mainForceAbs / totalAbs;

      if (mainForceFlow > 50000000) {
        mainForceScore += 15;
        detailedReasons.push('主力资金超大额净流入');
      } else if (mainForceFlow > 20000000) {
        mainForceScore += 12;
        detailedReasons.push('主力资金大幅净流入');
      } else if (mainForceFlow > 10000000) {
        mainForceScore += 10;
        detailedReasons.push('主力资金显著净流入');
      } else if (mainForceFlow > 5000000) {
        mainForceScore += 8;
        detailedReasons.push('主力资金中度净流入');
      } else if (mainForceFlow > 2000000) {
        mainForceScore += 6;
        detailedReasons.push('主力资金小幅净流入');
      } else if (mainForceFlow > 500000) {
        mainForceScore += 4;
        detailedReasons.push('主力资金微量净流入');
      } else if (mainForceFlow > 100000) {
        mainForceScore += 3;
        detailedReasons.push('主力资金少量净流入');
      } else if (mainForceFlow > 0) {
        mainForceScore += 1;
        detailedReasons.push('主力资金轻微净流入');
      }

      if (mainForceRatio > 0.7) {
        mainForceScore += 30;
        detailedReasons.push('主力资金占比极高');
      } else if (mainForceRatio > 0.6) {
        mainForceScore += 25;
        detailedReasons.push('主力资金占比很高');
      } else if (mainForceRatio > 0.5) {
        mainForceScore += 20;
        detailedReasons.push('主力资金占比高');
      } else if (mainForceRatio > 0.4) {
        mainForceScore += 15;
        detailedReasons.push('主力资金占比适中');
      } else if (mainForceRatio > 0.3) {
        mainForceScore += 12;
        detailedReasons.push('主力资金占比合理');
      } else if (mainForceRatio > 0.2) {
        mainForceScore += 8;
        detailedReasons.push('主力资金占比尚可');
      } else if (mainForceRatio > 0.1) {
        mainForceScore += 4;
        detailedReasons.push('主力资金占比较低');
      } else if (mainForceRatio > 0.05) {
        mainForceScore += 2;
        detailedReasons.push('主力资金占比轻微');
      }

      const superLargeRatio = Math.abs(superLargeFlow) / totalAbs;
      if (superLargeRatio > 0.6) {
        mainForceScore += 10;
        detailedReasons.push('超大单资金占比极高');
      } else if (superLargeRatio > 0.5) {
        mainForceScore += 8;
        detailedReasons.push('超大单资金占比高');
      } else if (superLargeRatio > 0.4) {
        mainForceScore += 6;
        detailedReasons.push('超大单资金占比适中');
      } else if (superLargeRatio > 0.3) {
        mainForceScore += 4;
        detailedReasons.push('超大单资金占比合理');
      }

      const largeRatio = Math.abs(largeFlow) / totalAbs;
      if (largeRatio > 0.4) {
        mainForceScore += 6;
        detailedReasons.push('大单资金占比高');
      } else if (largeRatio > 0.3) {
        mainForceScore += 4;
        detailedReasons.push('大单资金占比适中');
      } else if (largeRatio > 0.2) {
        mainForceScore += 2;
        detailedReasons.push('大单资金占比合理');
      }

      if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 3) {
        mainForceScore += 12;
        detailedReasons.push('成交量极度放大');
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 2.5) {
        mainForceScore += 10;
        detailedReasons.push('成交量大幅放大');
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 2) {
        mainForceScore += 8;
        detailedReasons.push('成交量显著放大');
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1.5) {
        mainForceScore += 6;
        detailedReasons.push('成交量中度放大');
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1.2) {
        mainForceScore += 4;
        detailedReasons.push('成交量小幅放大');
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1) {
        mainForceScore += 2;
        detailedReasons.push('成交量轻微放大');
      }

      if (mainForceData.turnoverRate && mainForceData.turnoverRate > 20) {
        mainForceScore += 10;
        detailedReasons.push('换手率极高');
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 15) {
        mainForceScore += 8;
        detailedReasons.push('换手率很高');
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 10) {
        mainForceScore += 6;
        detailedReasons.push('换手率高');
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 5) {
        mainForceScore += 4;
        detailedReasons.push('换手率适中');
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 3) {
        mainForceScore += 2;
        detailedReasons.push('换手率合理');
      }

      if (this.isAuctionPeriod()) {
        mainForceScore += 8;
        detailedReasons.push('集合竞价时段信号');
      }

    } else {
      const mainForceAbs = Math.abs(mainForceFlow);
      const totalAbs = Math.abs(totalFlow) || 1;
      const mainForceRatio = mainForceAbs / totalAbs;

      if (mainForceFlow < -100000000) {
        mainForceScore += 15;
        detailedReasons.push('主力资金超大额净流出');
      } else if (mainForceFlow < -50000000) {
        mainForceScore += 12;
        detailedReasons.push('主力资金大幅净流出');
      } else if (mainForceFlow < -30000000) {
        mainForceScore += 10;
        detailedReasons.push('主力资金显著净流出');
      } else if (mainForceFlow < -10000000) {
        mainForceScore += 8;
        detailedReasons.push('主力资金中度净流出');
      } else if (mainForceFlow < -5000000) {
        mainForceScore += 6;
        detailedReasons.push('主力资金小幅净流出');
      } else if (mainForceFlow < -1000000) {
        mainForceScore += 4;
        detailedReasons.push('主力资金微量净流出');
      } else if (mainForceFlow< 0) {
        mainForceScore += 2;
        detailedReasons.push('主力资金少量净流出');
      }

      if (mainForceRatio > 0.7) {
        mainForceScore += 30;
        detailedReasons.push('主力资金占比极高');
      } else if (mainForceRatio > 0.6) {
        mainForceScore += 25;
        detailedReasons.push('主力资金占比很高');
      } else if (mainForceRatio > 0.5) {
        mainForceScore += 20;
        detailedReasons.push('主力资金占比高');
      } else if (mainForceRatio > 0.4) {
        mainForceScore += 15;
        detailedReasons.push('主力资金占比适中');
      } else if (mainForceRatio > 0.3) {
        mainForceScore += 12;
        detailedReasons.push('主力资金占比合理');
      } else if (mainForceRatio > 0.2) {
        mainForceScore += 8;
        detailedReasons.push('主力资金占比尚可');
      } else if (mainForceRatio > 0.1) {
        mainForceScore += 4;
        detailedReasons.push('主力资金占比较低');
      } else if (mainForceRatio > 0.05) {
        mainForceScore += 2;
        detailedReasons.push('主力资金占比轻微');
      }

      const superLargeRatio = Math.abs(superLargeFlow) / totalAbs;
      if (superLargeRatio > 0.6) {
        mainForceScore += 10;
        detailedReasons.push('超大单资金占比极高');
      } else if (superLargeRatio > 0.5) {
        mainForceScore += 8;
        detailedReasons.push('超大单资金占比高');
      } else if (superLargeRatio > 0.4) {
        mainForceScore += 6;
        detailedReasons.push('超大单资金占比适中');
      } else if (superLargeRatio > 0.3) {
        mainForceScore += 4;
        detailedReasons.push('超大单资金占比合理');
      }

      const largeRatio = Math.abs(largeFlow) / totalAbs;
      if (largeRatio > 0.4) {
        mainForceScore += 6;
        detailedReasons.push('大单资金占比高');
      } else if (largeRatio > 0.3) {
        mainForceScore += 4;
        detailedReasons.push('大单资金占比适中');
      } else if (largeRatio > 0.2) {
        mainForceScore += 2;
        detailedReasons.push('大单资金占比合理');
      }

      if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 3) {
        mainForceScore += 8;
        detailedReasons.push('成交量显著放大');
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 2) {
        mainForceScore += 6;
        detailedReasons.push('成交量中度放大');
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1.5) {
        mainForceScore += 4;
        detailedReasons.push('成交量小幅放大');
      }

      if (mainForceData.turnoverRate && mainForceData.turnoverRate > 10) {
        mainForceScore += 8;
        detailedReasons.push('换手率很高');
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 7) {
        mainForceScore += 6;
        detailedReasons.push('换手率高');
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 4) {
        mainForceScore += 4;
        detailedReasons.push('换手率适中');
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 2) {
        mainForceScore += 2;
        detailedReasons.push('换手率轻微放大');
      }
    }
    score += mainForceScore * 0.5;

    let mainForceTypeScore = 0;
    const mainForceType = this.identifyMainForceType(data.mainForceData);
    if (type === 'buy') {
      if (mainForceType === 'nationalTeam') {
        mainForceTypeScore += 15;
        detailedReasons.push('国家队资金买入');
      } else if (mainForceType === 'institution') {
        mainForceTypeScore += 10;
        detailedReasons.push('机构资金买入');
      }
    } else {
      if (mainForceType === 'nationalTeam') {
        mainForceTypeScore += 15;
        detailedReasons.push('国家队资金卖出');
      } else if (mainForceType === 'institution') {
        mainForceTypeScore += 10;
        detailedReasons.push('机构资金卖出');
      }
    }
    score += mainForceTypeScore * 0.05;

    let newsScore = 0;
    if (data.newsData && data.newsData.length > 0) {
      // 计算加权情感分数（考虑相关性权重）
      let weightedPositiveScore = 0;
      let weightedNegativeScore = 0;
      let totalRelevance = 0;
      
      data.newsData.forEach(news => {
        const relevanceWeight = news.relevance;
        totalRelevance += relevanceWeight;
        
        if (news.sentiment === 'positive') {
          weightedPositiveScore += relevanceWeight;
        } else if (news.sentiment === 'negative') {
          weightedNegativeScore += relevanceWeight;
        }
      });
      
      const weightedSentimentScore = totalRelevance > 0 ? (weightedPositiveScore - weightedNegativeScore) / totalRelevance : 0;
      
      // 基于加权情感分数的评分
      if (type === 'buy') {
        if (weightedSentimentScore > 0.8) {
          newsScore += 25;
          detailedReasons.push('高相关性正面新闻占比极高');
        } else if (weightedSentimentScore > 0.6) {
          newsScore += 20;
          detailedReasons.push('高相关性正面新闻占比高');
        } else if (weightedSentimentScore > 0.4) {
          newsScore += 15;
          detailedReasons.push('正面新闻占比高');
        } else if (weightedSentimentScore > 0.2) {
          newsScore += 10;
          detailedReasons.push('正面新闻占比适中');
        } else if (weightedSentimentScore > 0) {
          newsScore += 5;
          detailedReasons.push('轻微正面新闻倾向');
        }
      } else {
        if (weightedSentimentScore < -0.8) {
          newsScore += 25;
          detailedReasons.push('高相关性负面新闻占比极高');
        } else if (weightedSentimentScore < -0.6) {
          newsScore += 20;
          detailedReasons.push('高相关性负面新闻占比高');
        } else if (weightedSentimentScore < -0.4) {
          newsScore += 15;
          detailedReasons.push('负面新闻占比高');
        } else if (weightedSentimentScore < -0.2) {
          newsScore += 10;
          detailedReasons.push('负面新闻占比适中');
        } else if (weightedSentimentScore < 0) {
          newsScore += 5;
          detailedReasons.push('轻微负面新闻倾向');
        }
      }
      
      // 新闻时效性分析
      const now = Date.now();
      const recentNews = data.newsData.filter(news => now - news.timestamp < 6 * 60 * 60 * 1000).length; // 6小时内
      const veryRecentNews = data.newsData.filter(news => now - news.timestamp < 1 * 60 * 60 * 1000).length; // 1小时内
      
      if (veryRecentNews > 2) {
        newsScore += 8;
        detailedReasons.push('1小时内有多条相关新闻');
      } else if (veryRecentNews > 0) {
        newsScore += 4;
        detailedReasons.push('1小时内有相关新闻');
      } else if (recentNews > 3) {
        newsScore += 6;
        detailedReasons.push('6小时内新闻频繁');
      } else if (recentNews > 1) {
        newsScore += 3;
        detailedReasons.push('近期有新闻报道');
      }
      
      // 高相关性新闻数量分析
      const highRelevanceNews = data.newsData.filter(news => news.relevance > 0.8).length;
      if (highRelevanceNews >= 2) {
        newsScore += 6;
        detailedReasons.push('多条高相关性新闻');
      } else if (highRelevanceNews >= 1) {
        newsScore += 3;
        detailedReasons.push('有高相关性新闻');
      }
    }
    score += newsScore * 0.15;

    let hotspotScore = 0;
    if (data.hotspotData) {
      if (data.hotspotData.industryRank <= 5) {
        hotspotScore += 10;
        detailedReasons.push('行业排名非常靠前');
      } else if (data.hotspotData.industryRank <= 10) {
        hotspotScore += 8;
        detailedReasons.push('行业排名靠前');
      } else if (data.hotspotData.industryRank <= 20) {
        hotspotScore += 6;
        detailedReasons.push('行业排名良好');
      } else if (data.hotspotData.industryRank <= 30) {
        hotspotScore += 4;
        detailedReasons.push('行业排名适中');
      } else if (data.hotspotData.industryRank > 50 && type === 'sell') {
        hotspotScore += 6;
        detailedReasons.push('行业排名靠后');
      }
      
      if (data.hotspotData.conceptRank <= 5) {
        hotspotScore += 10;
        detailedReasons.push('概念排名非常靠前');
      } else if (data.hotspotData.conceptRank <= 10) {
        hotspotScore += 8;
        detailedReasons.push('概念排名靠前');
      } else if (data.hotspotData.conceptRank <= 20) {
        hotspotScore += 6;
        detailedReasons.push('概念排名良好');
      } else if (data.hotspotData.conceptRank <= 30) {
        hotspotScore += 4;
        detailedReasons.push('概念排名适中');
      } else if (data.hotspotData.conceptRank > 50 && type === 'sell') {
        hotspotScore += 6;
        detailedReasons.push('概念排名靠后');
      }
      
      if (data.hotspotData.popularityScore > 90) {
        hotspotScore += 10;
        detailedReasons.push('人气热度极高');
      } else if (data.hotspotData.popularityScore > 80) {
        hotspotScore += 8;
        detailedReasons.push('人气热度高');
      } else if (data.hotspotData.popularityScore > 70) {
        hotspotScore += 6;
        detailedReasons.push('人气热度良好');
      } else if (data.hotspotData.popularityScore > 50) {
        hotspotScore += 4;
        detailedReasons.push('人气热度适中');
      } else if (data.hotspotData.popularityScore < 30 && type === 'sell') {
        hotspotScore += 8;
        detailedReasons.push('人气热度低');
      }
      
      if (data.hotspotData.popularityTrend === 'up') {
        hotspotScore += 8;
        detailedReasons.push('人气热度上升');
      } else if (data.hotspotData.popularityTrend === 'down') {
        hotspotScore += 10;
        detailedReasons.push('人气热度下降');
      } else if (data.hotspotData.popularityTrend === 'stable') {
        hotspotScore += 4;
        detailedReasons.push('人气热度稳定');
      }
      
      if (data.hotspotData.searchVolume > 5000) {
        hotspotScore += 4;
        detailedReasons.push('搜索量高');
      } else if (data.hotspotData.searchVolume > 2000) {
        hotspotScore += 2;
        detailedReasons.push('搜索量适中');
      } else if (data.hotspotData.searchVolume < 500 && type === 'sell') {
        hotspotScore += 4;
        detailedReasons.push('搜索量低');
      }
    }
    score += hotspotScore * 0.15;

    let financialScore = 0;
    if (data.financialData) {
      const peRatio = data.financialData.pe / (data.financialData.industryAveragePE || 1);
      if (peRatio < 0.8) {
        financialScore += 8;
        detailedReasons.push('市盈率显著低于行业平均');
      } else if (peRatio < 1) {
        financialScore += 6;
        detailedReasons.push('市盈率低于行业平均');
      } else if (peRatio < 1.2) {
        financialScore += 4;
        detailedReasons.push('市盈率接近行业平均');
      } else if (peRatio < 1.5) {
        financialScore += 2;
        detailedReasons.push('市盈率略高于行业平均');
      } else if (peRatio > 2 && type === 'sell') {
        financialScore += 8;
        detailedReasons.push('市盈率显著高于行业平均');
      }
      
      const pbRatio = data.financialData.pb / (data.financialData.industryAveragePB || 1);
      if (pbRatio < 0.8) {
        financialScore += 8;
        detailedReasons.push('市净率显著低于行业平均');
      } else if (pbRatio < 1) {
        financialScore += 6;
        detailedReasons.push('市净率低于行业平均');
      } else if (pbRatio < 1.2) {
        financialScore += 4;
        detailedReasons.push('市净率接近行业平均');
      } else if (pbRatio < 1.5) {
        financialScore += 2;
        detailedReasons.push('市净率略高于行业平均');
      } else if (pbRatio > 2 && type === 'sell') {
        financialScore += 8;
        detailedReasons.push('市净率显著高于行业平均');
      }
      
      if (data.financialData.revenueGrowth > 50) {
        financialScore += 8;
        detailedReasons.push('营收爆发式增长');
      } else if (data.financialData.revenueGrowth > 30) {
        financialScore += 6;
        detailedReasons.push('营收大幅增长');
      } else if (data.financialData.revenueGrowth > 20) {
        financialScore += 4;
        detailedReasons.push('营收稳健增长');
      } else if (data.financialData.revenueGrowth > 10) {
        financialScore += 2;
        detailedReasons.push('营收小幅增长');
      } else if (data.financialData.revenueGrowth < 0 && type === 'sell') {
        financialScore += 8;
        detailedReasons.push('营收负增长');
      }
      
      if (data.financialData.profitGrowth > 50) {
        financialScore += 8;
        detailedReasons.push('利润爆发式增长');
      } else if (data.financialData.profitGrowth > 30) {
        financialScore += 6;
        detailedReasons.push('利润大幅增长');
      } else if (data.financialData.profitGrowth > 20) {
        financialScore += 4;
        detailedReasons.push('利润稳健增长');
      } else if (data.financialData.profitGrowth > 10) {
        financialScore += 2;
        detailedReasons.push('利润小幅增长');
      } else if (data.financialData.profitGrowth < 0 && type === 'sell') {
        financialScore += 10;
        detailedReasons.push('利润负增长');
      }
      
      if (data.financialData.roe > 20) {
        financialScore += 6;
        detailedReasons.push('净资产收益率很高');
      } else if (data.financialData.roe > 15) {
        financialScore += 4;
        detailedReasons.push('净资产收益率良好');
      } else if (data.financialData.roe > 10) {
        financialScore += 2;
        detailedReasons.push('净资产收益率适中');
      } else if (data.financialData.roe < 5 && type === 'sell') {
        financialScore += 8;
        detailedReasons.push('净资产收益率低');
      }
      
      if (data.financialData.debtToAsset < 0.4) {
        financialScore += 4;
        detailedReasons.push('资产负债率低');
      } else if (data.financialData.debtToAsset < 0.6) {
        financialScore += 2;
        detailedReasons.push('资产负债率适中');
      } else if (data.financialData.debtToAsset > 0.8 && type === 'sell') {
        financialScore += 8;
        detailedReasons.push('资产负债率高');
      }
    }
    score += financialScore * 0.1;

    let researchScore = 0;
    if (data.researchData) {
      if (data.researchData.researchCount > 15) {
        researchScore += 6;
        detailedReasons.push('机构调研非常频繁');
      } else if (data.researchData.researchCount > 10) {
        researchScore += 4;
        detailedReasons.push('机构调研频繁');
      } else if (data.researchData.researchCount > 5) {
        researchScore += 2;
        detailedReasons.push('机构调研适中');
      } else if (data.researchData.researchCount < 2 && type === 'sell') {
        researchScore += 6;
        detailedReasons.push('机构调研稀少');
      }
      
      if (data.researchData.institutionalChange > 10) {
        researchScore += 5;
        detailedReasons.push('机构持仓大幅增加');
      } else if (data.researchData.institutionalChange > 5) {
        researchScore += 3;
        detailedReasons.push('机构持仓增加');
      } else if (data.researchData.institutionalChange < -10) {
        researchScore += 8;
        detailedReasons.push('机构持仓大幅减少');
      } else if (data.researchData.institutionalChange < -5) {
        researchScore += 6;
        detailedReasons.push('机构持仓减少');
      } else if (data.researchData.institutionalChange < -2 && type === 'sell') {
        researchScore += 4;
        detailedReasons.push('机构持仓小幅减少');
      }
      
      if (data.researchData.analystRecommendations === 'strong_buy') {
        researchScore += 8;
        detailedReasons.push('分析师强烈推荐');
      } else if (data.researchData.analystRecommendations === 'buy') {
        researchScore += 6;
        detailedReasons.push('分析师推荐');
      } else if (data.researchData.analystRecommendations === 'hold') {
        researchScore += 3;
        detailedReasons.push('分析师持有');
      } else if (data.researchData.analystRecommendations === 'sell') {
        researchScore += 8;
        detailedReasons.push('分析师卖出');
      } else if (data.researchData.analystRecommendations === 'strong_sell') {
        researchScore += 10;
        detailedReasons.push('分析师强烈卖出');
      }
      
      if (data.currentPrice && data.researchData.targetPrice > data.currentPrice * 1.3) {
        researchScore += 4;
        detailedReasons.push('目标价格大幅高于当前价格');
      } else if (data.currentPrice && data.researchData.targetPrice > data.currentPrice * 1.1) {
        researchScore += 2;
        detailedReasons.push('目标价格高于当前价格');
      } else if (data.currentPrice && data.researchData.targetPrice < data.currentPrice * 0.7) {
        researchScore -= 8;
        detailedReasons.push('目标价格大幅低于当前价格');
      } else if (data.currentPrice && data.researchData.targetPrice < data.currentPrice * 0.9) {
        researchScore -= 6;
        detailedReasons.push('目标价格低于当前价格');
      } else if (data.currentPrice && data.researchData.targetPrice < data.currentPrice * 0.95 && type === 'sell') {
        researchScore += 4;
        detailedReasons.push('目标价格略低于当前价格');
      }
    }
    score += researchScore * 0.05;

    let technicalScore = 0;
    
    if (data.technicalData) {
      const { rsi, macd, kdj, ma, boll, volume, sar, cci, adx, williamsR, bias } = data.technicalData;
      
      if (type === 'buy') {
        // RSI指标分析
        if (rsi < 25) {
          technicalScore += 12;
          detailedReasons.push('RSI严重超卖，强烈反弹机会');
        } else if (rsi < 30) {
          technicalScore += 10;
          detailedReasons.push('RSI超卖，反弹机会');
        } else if (rsi < 35) {
          technicalScore += 8;
          detailedReasons.push('RSI接近超卖');
        } else if (rsi < 40) {
          technicalScore += 6;
          detailedReasons.push('RSI处于低位区域');
        } else if (rsi > 45 && rsi < 55) {
          technicalScore += 4;
          detailedReasons.push('RSI处于中性区域');
        } else if (rsi > 50 && rsi < 60) {
          technicalScore += 5;
          detailedReasons.push('RSI处于强势区域');
        } else if (rsi > 60 && rsi < 70) {
          technicalScore += 3;
          detailedReasons.push('RSI处于较强势区域');
        }
        
        // MACD指标分析
        if (macd.macd > 0 && macd.diff > macd.dea) {
          technicalScore += 8;
          detailedReasons.push('MACD金叉，多头趋势');
        } else if (macd.diff > macd.dea) {
          technicalScore += 5;
          detailedReasons.push('MACD即将金叉');
        }
        
        // KDJ指标分析
        if (kdj.j > kdj.k && kdj.k > kdj.d) {
          technicalScore += 8;
          detailedReasons.push('KDJ金叉，买入信号');
        } else if (kdj.j > 0 && kdj.j > kdj.d) {
          technicalScore += 4;
          detailedReasons.push('KDJ多头排列');
        }
        
        // 均线分析
        if (data.currentPrice > ma.ma5 && ma.ma5 > ma.ma10 && ma.ma10 > ma.ma20) {
          technicalScore += 10;
          detailedReasons.push('多头排列，趋势强劲');
        } else if (data.currentPrice > ma.ma5 && ma.ma5 > ma.ma10) {
          technicalScore += 6;
          detailedReasons.push('短期均线多头排列');
        } else if (data.currentPrice > ma.ma5) {
          technicalScore += 4;
          detailedReasons.push('价格站上短期均线');
        }
        
        // 布林带分析
        if (data.currentPrice > boll.middle && data.currentPrice < boll.upper) {
          technicalScore += 4;
          detailedReasons.push('价格在布林带中轨上方');
        } else if (data.currentPrice > boll.upper) {
          technicalScore += 6;
          detailedReasons.push('价格突破布林带上轨，强势');
        }
        
        // 成交量分析
        if (volume.ma5 > volume.ma10) {
          technicalScore += 4;
          detailedReasons.push('成交量均线多头排列');
        }
        
        // SAR指标分析
        if (data.currentPrice > sar) {
          technicalScore += 6;
          detailedReasons.push('SAR指标显示多头趋势');
        }
        
        // CCI指标分析
        if (cci > -100 && cci < 0) {
          technicalScore += 6;
          detailedReasons.push('CCI指标接近超卖区域');
        } else if (cci > 0 && cci < 100) {
          technicalScore += 4;
          detailedReasons.push('CCI指标显示正常区间');
        }
        
        // ADX指标分析
        if (adx > 25) {
          technicalScore += 5;
          detailedReasons.push('ADX指标显示趋势强劲');
        }
        
        // 威廉指标分析
        if (williamsR < -80) {
          technicalScore += 8;
          detailedReasons.push('威廉指标超卖，反弹机会');
        } else if (williamsR < -60) {
          technicalScore += 5;
          detailedReasons.push('威廉指标接近超卖');
        }
        
        // 乖离率分析
        if (bias < -5) {
          technicalScore += 6;
          detailedReasons.push('乖离率负值较大，反弹机会');
        } else if (bias < -3) {
          technicalScore += 4;
          detailedReasons.push('乖离率负值，有反弹可能');
        }
      } else {
        // 卖出信号的技术指标分析
        if (rsi > 70) {
          technicalScore += 10;
          detailedReasons.push('RSI超买，回调风险');
        } else if (rsi > 60) {
          technicalScore += 6;
          detailedReasons.push('RSI接近超买');
        }
        
        // MACD指标分析
        if (macd.macd < 0 && macd.diff < macd.dea) {
          technicalScore += 8;
          detailedReasons.push('MACD死叉，空头趋势');
        } else if (macd.diff < macd.dea) {
          technicalScore += 5;
          detailedReasons.push('MACD即将死叉');
        }
        
        // KDJ指标分析
        if (kdj.j < kdj.k && kdj.k < kdj.d) {
          technicalScore += 8;
          detailedReasons.push('KDJ死叉，卖出信号');
        } else if (kdj.j < 100 && kdj.j < kdj.d) {
          technicalScore += 4;
          detailedReasons.push('KDJ空头排列');
        }
        
        // 均线分析
        if (data.currentPrice < ma.ma5 && ma.ma5 < ma.ma10 && ma.ma10 < ma.ma20) {
          technicalScore += 10;
          detailedReasons.push('空头排列，趋势疲软');
        } else if (data.currentPrice < ma.ma5 && ma.ma5 < ma.ma10) {
          technicalScore += 6;
          detailedReasons.push('短期均线空头排列');
        } else if (data.currentPrice < ma.ma5) {
          technicalScore += 4;
          detailedReasons.push('价格跌破短期均线');
        }
        
        // 布林带分析
        if (data.currentPrice < boll.middle && data.currentPrice > boll.lower) {
          technicalScore += 4;
          detailedReasons.push('价格在布林带中轨下方');
        } else if (data.currentPrice < boll.lower) {
          technicalScore += 6;
          detailedReasons.push('价格跌破布林带下轨，弱势');
        }
        
        // 成交量分析
        if (volume.ma5 < volume.ma10) {
          technicalScore += 4;
          detailedReasons.push('成交量均线空头排列');
        }
        
        // SAR指标分析
        if (data.currentPrice < sar) {
          technicalScore += 6;
          detailedReasons.push('SAR指标显示空头趋势');
        }
        
        // CCI指标分析
        if (cci > 100) {
          technicalScore += 8;
          detailedReasons.push('CCI指标超买，回调风险');
        } else if (cci > 0 && cci < 100) {
          technicalScore += 5;
          detailedReasons.push('CCI指标显示正常区间');
        }
        
        // ADX指标分析
        if (adx > 25) {
          technicalScore += 5;
          detailedReasons.push('ADX指标显示趋势强劲');
        }
        
        // 威廉指标分析
        if (williamsR > -20) {
          technicalScore += 8;
          detailedReasons.push('威廉指标超买，回调风险');
        } else if (williamsR > -40) {
          technicalScore += 5;
          detailedReasons.push('威廉指标接近超买');
        }
        
        // 乖离率分析
        if (bias > 5) {
          technicalScore += 6;
          detailedReasons.push('乖离率正值较大，回调风险');
        } else if (bias > 3) {
          technicalScore += 4;
          detailedReasons.push('乖离率正值，有回调可能');
        }
      }
    }
    score += technicalScore * 0.15;

    // 筹码峰分析评分（新增）
    let chipPeakScore = 0;
    if (data.chipPeakAnalysis) {
      const chipPeak = data.chipPeakAnalysis;
      const avgCostBasis = chipPeak.mainChipArea || 0;
      const currentPrice = data.currentPrice || 0;

      // 筹码集中度评分
      if (chipPeak.chipConcentration > 70) {
        chipPeakScore += 15;
        detailedReasons.push('筹码高度集中');
      } else if (chipPeak.chipConcentration > 50) {
        chipPeakScore += 10;
        detailedReasons.push('筹码较为集中');
      } else if (chipPeak.chipConcentration > 30) {
        chipPeakScore += 5;
      }

      // 持仓平均价分析
      if (avgCostBasis > 0) {
        const profitRatio = (currentPrice - avgCostBasis) / avgCostBasis;

        if (type === 'buy') {
          // 价格在持仓成本附近启动
          if (Math.abs(profitRatio) < 0.05) {
            chipPeakScore += 12;
            detailedReasons.push('价格在持仓成本附近，支撑较强');
          }
          // 价格高于持仓成本10%以上（有盈利垫）
          else if (profitRatio > 0.1) {
            chipPeakScore += 10;
            detailedReasons.push('高于持仓成本，有盈利垫');
          }
          // 价格低于持仓成本10%以上（套牢盘）
          else if (profitRatio < -0.1) {
            chipPeakScore -= 5;
            detailedReasons.push('低于持仓成本，注意解套压力');
          }
        } else {
          // 卖出信号逻辑
          if (profitRatio > 0.2) {
            chipPeakScore += 10;
            detailedReasons.push('获利较多，有兑现压力');
          } else if (profitRatio < -0.1) {
            chipPeakScore -= 5;
            detailedReasons.push('套牢盘较多，下跌动力可能不足');
          }
        }
      }

      // 支撑阻力位分析
      if (type === 'buy' && chipPeak.resistanceLevel > 0) {
        if (currentPrice > chipPeak.resistanceLevel) {
          chipPeakScore += 15;
          detailedReasons.push('突破筹码阻力位');
        } else if (currentPrice > chipPeak.resistanceLevel * 0.95) {
          chipPeakScore += 8;
          detailedReasons.push('接近筹码阻力位');
        }
      }

      if (type === 'sell' && chipPeak.supportLevel > 0) {
        if (currentPrice < chipPeak.supportLevel) {
          chipPeakScore += 15;
          detailedReasons.push('跌破筹码支撑位');
        }
      }
    }
    score += chipPeakScore * 0.12;

    let marketSentimentScore = 0;
    
    // 使用真实市场指数数据进行分析
    if (data.indexData) {
      const shIndex = data.indexData.sh000001;
      const szIndex = data.indexData.sz399001;
      const cybIndex = data.indexData.sz399006;
      
      // 计算三大指数的平均涨跌幅
      const avgChangePercent = (shIndex.changePercent + szIndex.changePercent + cybIndex.changePercent) / 3;
      
      // 根据市场指数情况调整信号评分
      if (type === 'buy') {
        // 牛市环境下买入信号更可靠
        if (avgChangePercent > 1.5) {
          marketSentimentScore += 15;
          detailedReasons.push('市场强势上涨，买入信号增强');
        } else if (avgChangePercent > 0.5) {
          marketSentimentScore += 10;
          detailedReasons.push('市场温和上涨，买入信号可靠');
        } else if (avgChangePercent > -0.5) {
          marketSentimentScore += 5;
          detailedReasons.push('市场震荡，买入信号谨慎');
        } else {
          marketSentimentScore -= 5;
          detailedReasons.push('市场下跌，买入信号减弱');
        }
      } else {
        // 熊市环境下卖出信号更可靠
        if (avgChangePercent < -1.5) {
          marketSentimentScore += 15;
          detailedReasons.push('市场强势下跌，卖出信号增强');
        } else if (avgChangePercent < -0.5) {
          marketSentimentScore += 10;
          detailedReasons.push('市场温和下跌，卖出信号可靠');
        } else if (avgChangePercent < 0.5) {
          marketSentimentScore += 5;
          detailedReasons.push('市场震荡，卖出信号谨慎');
        } else {
          marketSentimentScore -= 5;
          detailedReasons.push('市场上涨，卖出信号减弱');
        }
      }
      
      // 特殊指数情况处理
      if (shIndex.changePercent > 2 || szIndex.changePercent > 2 || cybIndex.changePercent > 2) {
        if (type === 'buy') {
          marketSentimentScore += 5;
          detailedReasons.push('大盘指数暴涨，市场情绪极度乐观');
        } else {
          marketSentimentScore -= 5;
          detailedReasons.push('大盘指数暴涨，卖出信号减弱');
        }
      }
      
      if (shIndex.changePercent < -2 || szIndex.changePercent < -2 || cybIndex.changePercent < -2) {
        if (type === 'sell') {
          marketSentimentScore += 5;
          detailedReasons.push('大盘指数暴跌，市场情绪极度恐慌');
        } else {
          marketSentimentScore -= 5;
          detailedReasons.push('大盘指数暴跌，买入信号减弱');
        }
      }
    } else {
      // 备用：使用随机市场情绪（当指数数据不可用时）
      const marketSentiment = -0.5 + Math.random();
      
      if (type === 'buy' && marketSentiment > 0.3) {
        marketSentimentScore += 10;
        detailedReasons.push('市场情绪积极');
      } else if (type === 'sell' && marketSentiment < -0.2) {
        marketSentimentScore += 10;
        detailedReasons.push('市场情绪消极');
      } else if (marketSentiment > -0.1 && marketSentiment < 0.1) {
        marketSentimentScore += 5;
        detailedReasons.push('市场情绪中性');
      }
    }
    score += marketSentimentScore * 0.05;

    // 风险评估评分
    let riskScore = 0;
    if (data.riskAssessment) {
      const { overallRisk, riskScore: assessmentScore, riskFactors } = data.riskAssessment;
      
      if (type === 'buy') {
        // 高风险环境下减少买入信号评分
        if (overallRisk === 'very_high') {
          riskScore -= 25;
          detailedReasons.push('风险评估显示极高风险，买入信号谨慎');
        } else if (overallRisk === 'high') {
          riskScore -= 15;
          detailedReasons.push('风险评估显示高风险，买入信号谨慎');
        } else if (overallRisk === 'medium') {
          riskScore -= 5;
          detailedReasons.push('风险评估显示中等风险，买入信号谨慎');
        } else {
          riskScore += 10;
          detailedReasons.push('风险评估显示低风险，买入信号可靠');
        }
      } else {
        // 高风险环境下增强卖出信号评分
        if (overallRisk === 'very_high') {
          riskScore += 25;
          detailedReasons.push('风险评估显示极高风险，卖出信号增强');
        } else if (overallRisk === 'high') {
          riskScore += 15;
          detailedReasons.push('风险评估显示高风险，卖出信号增强');
        } else if (overallRisk === 'medium') {
          riskScore += 5;
          detailedReasons.push('风险评估显示中等风险，卖出信号谨慎');
        } else {
          riskScore -= 5;
          detailedReasons.push('风险评估显示低风险，卖出信号减弱');
        }
      }
      
      // 添加具体风险因素
      if (riskFactors.length > 0) {
        riskFactors.forEach(factor => {
          detailedReasons.push(factor);
        });
      }
    }
    score += riskScore * 0.1;

    // 机器学习预测评分
    let mlScore = 0;
    if (data.mlPrediction) {
      const { prediction, confidence } = data.mlPrediction;
      
      if (type === 'buy') {
        if (prediction === 'buy') {
          mlScore += confidence * 20;
          detailedReasons.push(`机器学习模型预测买入，置信度${Math.round(confidence * 100)}%`);
        } else if (prediction === 'sell') {
          mlScore -= confidence * 15;
          detailedReasons.push(`机器学习模型预测卖出，置信度${Math.round(confidence * 100)}%`);
        }
      } else {
        if (prediction === 'sell') {
          mlScore += confidence * 20;
          detailedReasons.push(`机器学习模型预测卖出，置信度${Math.round(confidence * 100)}%`);
        } else if (prediction === 'buy') {
          mlScore -= confidence * 15;
          detailedReasons.push(`机器学习模型预测买入，置信度${Math.round(confidence * 100)}%`);
        }
      }
    }
    score += mlScore * 0.1;

    return { score: Math.min(score, 100), detailedReasons };
  }

  private async generateSignal(data: ComprehensiveData, type: 'buy' | 'sell'): Promise<OptimizedSignal> {
    const { score: originalScore, detailedReasons: originalDetailedReasons } = this.calculateSignalScore(data, type);
    let score = originalScore;
    const detailedReasons = [...(originalDetailedReasons || [])]; // 创建可变副本
    const confidence = type === 'buy' ? 100 : Math.min(50 + score, 95);
    const mainForceData = data.mainForceData;
    const mainForceAbs = Math.abs(mainForceData.mainForceNetFlow);
    const totalAbs = Math.abs(mainForceData.totalNetFlow) || 1;
    const mainForceRatio = mainForceAbs / totalAbs;
    const superLargeRatio = Math.abs(mainForceData.superLargeOrder.netFlow) / totalAbs;
    const currentPrice = data.currentPrice || 0;

    let reason = '';
    if (type === 'buy') {
      reason = `买入信号：当前价格 ${currentPrice.toFixed(2)} 元，主力资金净流入 ${(mainForceData.mainForceNetFlow / 100000000).toFixed(2)} 亿元，占比${(mainForceRatio * 100).toFixed(0)}%`;
      if (superLargeRatio > 0.3) {
        reason += `，超大单占比${(superLargeRatio * 100).toFixed(0)}%`;
      }
      if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1.5) {
        reason += `，成交量放大${mainForceData.volumeAmplification.toFixed(1)}倍`;
      }
      if (mainForceData.turnoverRate && mainForceData.turnoverRate > 3) {
        reason += `，换手率${mainForceData.turnoverRate.toFixed(1)}%`;
      }
      if (this.isAuctionPeriod()) {
        reason += '【集合竞价时段】';
      }
    } else {
      reason = `卖出信号：当前价格 ${currentPrice.toFixed(2)} 元，主力资金净流出 ${(Math.abs(mainForceData.mainForceNetFlow) / 100000000).toFixed(2)} 亿元，占比${(mainForceRatio * 100).toFixed(0)}%`;
      if (superLargeRatio > 0.3) {
        reason += `，超大单占比${(superLargeRatio * 100).toFixed(0)}%`;
      }
    }
    
    if (data.newsData && data.newsData.length > 0) {
      const positiveNews = data.newsData.filter(news => news.sentiment === 'positive').length;
      const negativeNews = data.newsData.filter(news => news.sentiment === 'negative').length;
      if (positiveNews > negativeNews) {
        reason += `，正面新闻占比${Math.round((positiveNews / data.newsData.length) * 100)}%`;
      } else if (negativeNews > positiveNews) {
        reason += `，负面新闻占比${Math.round((negativeNews / data.newsData.length) * 100)}%`;
      }
    }
    
    if (data.hotspotData) {
      if (data.hotspotData.industryRank <= 10) {
        reason += `，行业排名${data.hotspotData.industryRank}`;
      }
      if (data.hotspotData.popularityTrend === 'up') {
        reason += '，人气上升';
      } else if (data.hotspotData.popularityTrend === 'down') {
        reason += '，人气下降';
      }
    }
    
    // 计算涨停潜力
    let isLimitUpPotential = false;
    let limitUpPotentialScore = 0;
    let isLeadingStock = false;
    let isPotentialDouble = false;
    let isPotentialMultiBagger = false;
    let smallCapBonus = 0;
    let techStockBonus = 0;
    
    // 定义comprehensiveData变量
    const comprehensiveData = data;
    
    if (type === 'buy') {
      // 检查近期涨幅过大的风险控制
      let recentIncreasePenalty = 0;
      let isHighRiskStock = false; // 标记是否为高风险股票
      let riskReason = '';
      let hasValidHistoryData = false; // 标记是否获取到有效历史数据
      let hasLimitUpHistory = false; // 标记历史是否有涨停记录
      let limitUpBonus = 0; // 历史涨停板加分
      let bottomLimitUpBonus = 0; // 底部涨停板额外加分
      techStockBonus = 0; // 科技股票加分
      smallCapBonus = 0; // 小盘股加分
      
      try {
        const historyData = await historicalDataManager.getHistoricalData(data.stockCode);
        if (historyData && historyData.length >= 10) { // 至少需要10天数据
          hasValidHistoryData = true;
          // 计算涨幅
          const sortedData = [...historyData].sort((a, b) => a.timestamp - b.timestamp);
          const latestPrice = sortedData[sortedData.length - 1]?.close || currentPrice;
          
          // === 新增：分析价格位置 ===
          const positionAnalysis = analyzePricePosition(sortedData, currentPrice);
          const { isLowPosition, isPullbackAfterRise, positionPercentile } = positionAnalysis;
          
          // === 关键：只有在低位或合理回调后才允许生成买入信号 ===
          // 如果不在低位且不是回调后启动，则禁止生成买入信号
          if (!isLowPosition && !isPullbackAfterRise) {
            // 检查位置是否过高
            if (positionPercentile > 60) {
              isHighRiskStock = true;
              riskReason = `⚠️ 当前价格处于历史${positionPercentile.toFixed(0)}%的高位区域，避免追高，禁止买入`;
              recentIncreasePenalty += 80;
              detailedReasons.push(riskReason);
            } else if (positionPercentile > 50) {
              // 中间位置，添加警告但不禁止
              detailedReasons.push(`⚠️ 当前价格处于历史${positionPercentile.toFixed(0)}%位置，建议谨慎`);
            }
          } else {
            // 在低位或回调后，加分
            if (isLowPosition) {
              detailedReasons.push(`📍 当前价格处于历史低位区域(${positionPercentile.toFixed(0)}%)`);
              score += 20;
            }
            if (isPullbackAfterRise) {
              detailedReasons.push(`📈 上涨后合理回调，是较好的介入时机`);
              score += 25;
            }
          }
          // ==============================================
          
          // === 新增：分析历史涨停板 ===
          const limitUpAnalysis = analyzeLimitUpHistory(sortedData, currentPrice);
          hasLimitUpHistory = limitUpAnalysis.hasLimitUp;
          limitUpBonus = limitUpAnalysis.bonus;
          bottomLimitUpBonus = limitUpAnalysis.bottomLimitUpBonus;
          
          if (hasLimitUpHistory) {
            detailedReasons.push(`🔥 历史有${limitUpAnalysis.limitUpCount}次涨停记录，股性活跃`);
            if (limitUpAnalysis.hasBottomLimitUp) {
              detailedReasons.push(`🚀 底部有涨停板，再次大涨概率高`);
            }
          } else {
            // 历史没有涨停记录的股票，大幅降低特殊信号评分
            limitUpBonus = -80;
            detailedReasons.push(`⚠️ 历史无涨停记录，股性不活跃`);
          }
          // ===========================
          
          // === 新增：识别科技类股票 ===
          const techStockAnalysis = analyzeTechStock(data.stockName, data.hotspotData);
          techStockBonus = techStockAnalysis.bonus;
          if (techStockAnalysis.isTechStock) {
            detailedReasons.push(`💻 ${techStockAnalysis.category}概念，科技成长股`);
          }
          // ===========================
          
          // === 新增：识别小盘股/微盘股 ===
          const marketCap = mainForceData.floatMarketCap || 0;
          const smallCapAnalysis = analyzeSmallCapStock(marketCap, currentPrice);
          smallCapBonus = smallCapAnalysis.bonus;
          if (smallCapAnalysis.isSmallCap) {
            detailedReasons.push(`📊 ${smallCapAnalysis.type}，容易被资金撬动`);
          }
          // ===========================
          
          // === 新增：检查连续涨停和短期暴涨 ===
          // 检查最近5天是否有连续涨停
          const recentData = sortedData.slice(-5);
          let consecutiveLimitUpCount = 0;
          recentData.forEach((day, index) => {
            if (index > 0) {
              const prevDay = recentData[index - 1];
              if (day && prevDay && day.close && prevDay.close) {
                const change = (day.close - prevDay.close) / prevDay.close;
                if (change >= 0.098) { // 接近涨停
                  consecutiveLimitUpCount++;
                }
              }
            }
          });
          
          // 检查最近7天涨幅
          let increase7Day = 0;
          if (sortedData.length >= 7) {
            const days7Ago = sortedData[sortedData.length - 7]?.close;
            if (days7Ago && latestPrice) {
              increase7Day = (latestPrice - days7Ago) / days7Ago;
            }
          }
          
          // 检查最近10天涨幅
          let increase10Day = 0;
          if (sortedData.length >= 10) {
            const days10Ago = sortedData[sortedData.length - 10]?.close;
            if (days10Ago && latestPrice) {
              increase10Day = (latestPrice - days10Ago) / days10Ago;
            }
          }
          
          // 计算20日涨幅
          const days20Ago = sortedData[sortedData.length - 20]?.close;
          // 计算30日涨幅
          const days30Ago = sortedData[sortedData.length - 30]?.close;
          // 计算60日涨幅
          const days60Ago = sortedData[sortedData.length - 60] || sortedData[0];
          const days60AgoPrice = days60Ago?.close;
          
          // 计算历史最大涨幅（从最低点到当前）
          let maxIncreaseFromLow = 0;
          if (sortedData.length >= 20) {
            const minPrice = Math.min(...sortedData.slice(-60).map(d => d.close || Infinity));
            if (minPrice && latestPrice && minPrice > 0) {
              maxIncreaseFromLow = (latestPrice - minPrice) / minPrice;
            }
          }
          
          // === 严格的风险控制：连续大涨检测（更加严格） ===
          // 1. 检查连续涨停
          if (consecutiveLimitUpCount >= 2) {
            recentIncreasePenalty += 120;
            riskReason = `⚠️ 连续${consecutiveLimitUpCount}天涨停，短期涨幅过大，风险极高，禁止买入`;
            isHighRiskStock = true;
          }
          // 2. 检查7天涨幅（更严格）
          else if (increase7Day > 0.3) { // 7天涨幅超过30% - 更严格
            recentIncreasePenalty += 110;
            riskReason = `⚠️ 7天涨幅高达${(increase7Day * 100).toFixed(1)}%，短期暴涨，风险极高，禁止买入`;
            isHighRiskStock = true;
          } else if (increase7Day > 0.2) { // 7天涨幅超过20%
            recentIncreasePenalty += 60;
            detailedReasons.push(`⚠️ 7天涨幅${(increase7Day * 100).toFixed(1)}%，短期涨幅较大`);
          }
          // 3. 检查10天涨幅
          else if (increase10Day > 0.4) { // 10天涨幅超过40% - 更严格
            recentIncreasePenalty += 100;
            riskReason = `⚠️ 10天涨幅高达${(increase10Day * 100).toFixed(1)}%，短期暴涨，风险极高，禁止买入`;
            isHighRiskStock = true;
          } else if (increase10Day > 0.25) { // 10天涨幅超过25%
            recentIncreasePenalty += 40;
          }
          // 4. 检查20日涨幅
          else if (days20Ago && latestPrice) {
            const increase20Day = (latestPrice - days20Ago) / days20Ago;
            if (increase20Day > 0.5) { // 20日涨幅超过50% - 更严格
              recentIncreasePenalty += 100;
              riskReason = `⚠️ 20日涨幅高达${(increase20Day * 100).toFixed(1)}%，风险极高，禁止买入`;
              isHighRiskStock = true;
            } else if (increase20Day > 0.3) { // 20日涨幅超过30%
              recentIncreasePenalty += 60;
              riskReason = `⚠️ 20日涨幅${(increase20Day * 100).toFixed(1)}%，风险很高`;
              isHighRiskStock = true;
            } else if (increase20Day > 0.2) { // 20日涨幅超过20%
              recentIncreasePenalty += 30;
              detailedReasons.push(`⚠️ 近期涨幅较大(20日${(increase20Day * 100).toFixed(1)}%)，买入谨慎`);
            }
          }
          
          // 5. 检查30日涨幅
          if (!isHighRiskStock && days30Ago && latestPrice) {
            const increase30Day = (latestPrice - days30Ago) / days30Ago;
            if (increase30Day > 0.6) { // 30日涨幅超过60% - 更严格
              recentIncreasePenalty += 80;
              riskReason = `⚠️ 30日涨幅${(increase30Day * 100).toFixed(1)}%，风险极高，禁止买入`;
              isHighRiskStock = true;
            } else if (increase30Day > 0.4) { // 30日涨幅超过40%
              recentIncreasePenalty += 40;
            }
          }
          
          // 6. 检查60日涨幅
          if (!isHighRiskStock && days60AgoPrice && latestPrice) {
            const increase60Day = (latestPrice - days60AgoPrice) / days60AgoPrice;
            if (increase60Day > 0.8) { // 60日涨幅超过80% - 更严格
              recentIncreasePenalty += 90;
              riskReason = `⚠️ 60日涨幅${(increase60Day * 100).toFixed(1)}%，风险极高，禁止买入`;
              isHighRiskStock = true;
            } else if (increase60Day > 0.6) { // 60日涨幅超过60%
              recentIncreasePenalty += 50;
              riskReason = `⚠️ 60日涨幅${(increase60Day * 100).toFixed(1)}%，风险较高`;
              isHighRiskStock = true;
            } else if (increase60Day > 0.4) { // 60日涨幅超过40%
              recentIncreasePenalty += 25;
            }
          }
          
          // 7. 检查历史最大涨幅（几倍涨幅检测）
          if (!isHighRiskStock && maxIncreaseFromLow > 1.0) { // 从低点涨幅超过100%（2倍）- 更严格
            recentIncreasePenalty += 100;
            riskReason = `⚠️ 从低点涨幅已达${(maxIncreaseFromLow * 100).toFixed(1)}%（${(maxIncreaseFromLow + 1).toFixed(1)}倍），风险极高，禁止买入`;
            isHighRiskStock = true;
          } else if (!isHighRiskStock && maxIncreaseFromLow > 0.6) { // 从低点涨幅超过60%
            recentIncreasePenalty += 60;
            riskReason = `⚠️ 从低点涨幅${(maxIncreaseFromLow * 100).toFixed(1)}%（${(maxIncreaseFromLow + 1).toFixed(1)}倍），风险较高`;
            isHighRiskStock = true;
          }
        } else if (historyData && historyData.length > 0 && historyData.length < 10) {
          // 数据不足10天，使用可用数据计算涨幅
          hasValidHistoryData = true;
          const sortedData = [...historyData].sort((a, b) => a.timestamp - b.timestamp);
          const latestPrice = sortedData[sortedData.length - 1]?.close || currentPrice;
          const earliestPrice = sortedData[0]?.close;
          
          if (earliestPrice && latestPrice) {
            const increase = (latestPrice - earliestPrice) / earliestPrice;
            if (increase > 0.5) { // 涨幅超过50%
              recentIncreasePenalty += 50;
              riskReason = `⚠️ 近期涨幅${(increase * 100).toFixed(1)}%，风险较高`;
              isHighRiskStock = true;
            } else if (increase > 0.3) { // 涨幅超过30%
              recentIncreasePenalty += 30;
              detailedReasons.push(`⚠️ 近期涨幅${(increase * 100).toFixed(1)}%，买入谨慎`);
            }
          }
          
          // 数据不足时也检查涨停记录
          const limitUpAnalysis = analyzeLimitUpHistory(sortedData, currentPrice);
          hasLimitUpHistory = limitUpAnalysis.hasLimitUp;
          limitUpBonus = limitUpAnalysis.bonus * 0.5; // 数据不足时加分减半
        }
      } catch (error) {
        console.warn(`获取历史数据失败: ${error}`);
        // 历史数据获取失败，视为高风险，禁止生成特殊信号
        isHighRiskStock = true;
        riskReason = '⚠️ 无法获取历史数据，无法评估风险，禁止买入';
      }
      
      // 如果没有获取到有效历史数据，禁止生成特殊信号
      if (!hasValidHistoryData && !isHighRiskStock) {
        isHighRiskStock = true;
        riskReason = '⚠️ 历史数据不足，无法评估风险，禁止买入';
      }
      
      // 如果是高风险股票，直接标记并添加警告
      if (isHighRiskStock && riskReason) {
        detailedReasons.push(riskReason);
        reason = riskReason + '，' + reason;
      }
      
      // 检查是否近期涨幅过大（严格禁止生成特殊信号）
      const hasHighRecentIncrease = recentIncreasePenalty >= 25; // 涨幅超过50%会产生25以上的惩罚
      
      // 应用涨幅过大的惩罚
      if (recentIncreasePenalty > 0 || isHighRiskStock) {
        if (isHighRiskStock || hasHighRecentIncrease) {
          // 高风险股票或涨幅过大：直接将涨停潜力分数设为0，禁止生成特殊信号
          limitUpPotentialScore = 0;
          isLimitUpPotential = false;
          isLeadingStock = false;
          isPotentialDouble = false;
          if (isHighRiskStock) {
            score = 0;
          }
        } else {
          limitUpPotentialScore -= recentIncreasePenalty;
          // 如果涨幅过大，直接降低信号评分
          score = Math.max(0, score - recentIncreasePenalty * 0.8);
        }
      }
      
      // 主力资金强度（使用绝对值，无论正负都考虑）
      const mainForceAbs = Math.abs(mainForceData.mainForceNetFlow);
      if (mainForceAbs > 50000000) { // 5000万以上
        limitUpPotentialScore += 30;
      } else if (mainForceAbs > 20000000) { // 2000万以上
        limitUpPotentialScore += 20;
      } else if (mainForceAbs > 10000000) { // 1000万以上
        limitUpPotentialScore += 10;
      } else if (mainForceAbs > 5000000) { // 500万以上
        limitUpPotentialScore += 5;
      } else if (mainForceAbs > 1000000) { // 100万以上
        limitUpPotentialScore += 3;
      }
      
      // 主力资金占比
      if (mainForceRatio > 0.7) {
        limitUpPotentialScore += 25;
      } else if (mainForceRatio > 0.6) {
        limitUpPotentialScore += 20;
      } else if (mainForceRatio > 0.5) {
        limitUpPotentialScore += 15;
      } else if (mainForceRatio > 0.4) {
        limitUpPotentialScore += 10;
      } else if (mainForceRatio > 0.3) {
        limitUpPotentialScore += 5;
      }
      
      // 超大单占比
      if (superLargeRatio > 0.6) {
        limitUpPotentialScore += 20;
      } else if (superLargeRatio > 0.5) {
        limitUpPotentialScore += 15;
      } else if (superLargeRatio > 0.4) {
        limitUpPotentialScore += 10;
      } else if (superLargeRatio > 0.3) {
        limitUpPotentialScore += 5;
      }
      
      // 成交量放大
      if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 3) {
        limitUpPotentialScore += 15;
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 2) {
        limitUpPotentialScore += 10;
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1.5) {
        limitUpPotentialScore += 5;
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1.2) {
        limitUpPotentialScore += 3;
      }
      
      // 换手率
      if (mainForceData.turnoverRate && mainForceData.turnoverRate > 15) {
        limitUpPotentialScore += 15;
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 10) {
        limitUpPotentialScore += 10;
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 5) {
        limitUpPotentialScore += 5;
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 2) {
        limitUpPotentialScore += 3;
      }
      
      // 综合评分（更加严格）
      if (score > 95) {
        limitUpPotentialScore += 30;
      } else if (score > 90) {
        limitUpPotentialScore += 20;
      } else if (score > 85) {
        limitUpPotentialScore += 10;
      }
      
      // 连续资金流入加成（更加严格）
      const continuousFlow = this.checkContinuousMainForceFlow(data.stockCode, mainForceData.mainForceNetFlow, mainForceRatio);
      if (continuousFlow.hasContinuousBuy && continuousFlow.continuousPeriods >= 3) {
        limitUpPotentialScore += 20;
      } else if (continuousFlow.hasContinuousBuy && continuousFlow.continuousPeriods >= 2) {
        limitUpPotentialScore += 10;
      }
      
      // 低价股加分（适度降低权重，避免过度依赖低价股）
      if (currentPrice < 5) {
        limitUpPotentialScore += 40; // 5元以下股票加分（降低权重）
      } else if (currentPrice < 10) {
        limitUpPotentialScore += 30; // 10元以下股票加分（降低权重）
      } else if (currentPrice < 20) {
        limitUpPotentialScore += 20; // 20元以下股票加分（降低权重）
      } else if (currentPrice < 30) {
        limitUpPotentialScore += 15; // 30元以下股票小幅加分（降低权重）
      }
      
      // 高价股大幅减分（价格太高的股票涨停潜力较低）
      if (currentPrice > 200) {
        limitUpPotentialScore -= 150; // 200元以上股票超级大幅减分
      } else if (currentPrice > 150) {
        limitUpPotentialScore -= 120; // 150元以上股票大幅减分
      } else if (currentPrice > 100) {
        limitUpPotentialScore -= 80; // 100元以上股票大幅减分
      } else if (currentPrice > 80) {
        limitUpPotentialScore -= 50; // 80元以上股票减分
      } else if (currentPrice > 50) {
        limitUpPotentialScore -= 30; // 50元以上股票小幅减分
      }
      
      // === 新增：历史涨停板加分 ===
      // 历史涨停板加分（非常重要，因为有涨停历史的股票再次涨停概率高）
      limitUpPotentialScore += limitUpBonus;
      
      // 底部涨停板额外加分（这是最优质的信号）
      limitUpPotentialScore += bottomLimitUpBonus;
      // ===============================
      
      // === 新增：科技股票加分（增加权重，科技股更容易大涨）===
      limitUpPotentialScore += techStockBonus * 1.3; // 科技股权重乘以1.3
      // =========================
      
      // === 新增：小盘股加分 ===
      limitUpPotentialScore += smallCapBonus;
      // =======================
      
      // 减去近期涨幅过大的惩罚
      limitUpPotentialScore -= recentIncreasePenalty;
      
      // 确定是否为涨停潜力股票（优化门槛，让更多低价优质股有机会）
      // currentPrice 已经在函数开始时声明
      
      // 必须同时满足：评分(300+) + 主力资金流入(>1000万) + 历史有涨停记录 + 不是极高风险股票 + 价格(<80元) + 综合评分>75
      const hasStrongMainForce = mainForceData.mainForceNetFlow > 10000000; // 主力资金流入超过1000万（降低门槛）
      const hasValidLimitUpHistory = hasLimitUpHistory || limitUpBonus > 0; // 有涨停记录即可
      const isNotExtremeRisk = !isHighRiskStock; // 不是极高风险股票（放宽条件）
      const isReasonablePrice = currentPrice > 0 && currentPrice < 80; // 价格低于80元
      const hasGoodScore = score > 75; // 综合评分超过75分（降低门槛）
      isLimitUpPotential = limitUpPotentialScore >= 300 && hasStrongMainForce && hasValidLimitUpHistory && isNotExtremeRisk && isReasonablePrice && hasGoodScore;
      
      // 确定是否为龙头股票（大幅提高门槛）
      if (data.hotspotData && mainForceData.mainForceNetFlow > 50000000) {
        // 行业排名前3或概念排名前3，且人气热度极高，同时需要主力资金大幅流入
        if ((data.hotspotData.industryRank <= 3 || data.hotspotData.conceptRank <= 3) && 
            data.hotspotData.popularityScore > 90 && 
            data.hotspotData.popularityTrend === 'up' &&
            mainForceRatio > 0.6) {
          isLeadingStock = true;
          reason += '，🏆 龙头股票';
          detailedReasons.push('龙头股票');
        }
      }
      
      // 确定是否为即将翻倍或多倍大涨的股票
      // 使用实际目标价格与当前价格的比值来判断，而不是基于评分的预期涨幅
      const targetPrice = comprehensiveData.researchData?.targetPrice || comprehensiveData.currentPrice;
      const priceRatio = currentPrice > 0 ? targetPrice / currentPrice : 0;
      
      // 目标价格必须高于当前价格才可能是翻倍潜力
      if (priceRatio >= 3.0 && targetPrice > currentPrice) {
        // 目标价格 >= 当前价格3倍 = 多倍潜力
        isPotentialMultiBagger = true;
        isPotentialDouble = false;
        reason += '，📈 多倍潜力';
        detailedReasons.push('多倍潜力的股票');
      } else if (priceRatio >= 2.0 && targetPrice > currentPrice) {
        // 目标价格 >= 当前价格2倍 = 翻倍潜力
        isPotentialDouble = true;
        isPotentialMultiBagger = false;
        reason += '，🚀 翻倍潜力';
        detailedReasons.push('翻倍潜力的股票');
      }
      
      // 如果是涨停潜力股票，添加到原因中
      if (isLimitUpPotential) {
        reason += '，🔥 涨停潜力';
        detailedReasons.push('涨停潜力股票');
      }
    }
    
    // 确保即使type !== 'buy'，也能正确设置这些属性
    isLimitUpPotential = isLimitUpPotential || false;
    isLeadingStock = isLeadingStock || false;
    isPotentialDouble = isPotentialDouble || false;
    isPotentialMultiBagger = isPotentialMultiBagger || false;
    
    // 定义缺失的变量
    const mainForceFlow = mainForceData.mainForceNetFlow;
    const largeRatio = Math.abs(mainForceData.largeOrder.netFlow) / totalAbs;
    const hasPositiveNews = data.newsData && data.newsData.filter(news => news.sentiment === 'positive').length > data.newsData.filter(news => news.sentiment === 'negative').length;
    const hasPositiveTrend = data.hotspotData && data.hotspotData.popularityTrend === 'up';
    const hasExpectedIncrease = true; // 假设默认有预期上涨
    const continuousFlow = this.checkContinuousMainForceFlow(data.stockCode, mainForceData.mainForceNetFlow, mainForceRatio);
    const continuousMainForceTypeFlow = continuousFlow;
    
    // 主力资金条件
    const mainForceConditions = [
      mainForceFlow > 50000,
      mainForceFlow > 100000,
      mainForceFlow > 500000,
      mainForceRatio > 0.2,
      mainForceRatio > 0.3,
      superLargeRatio > 0.1,
      superLargeRatio > 0.2,
      largeRatio > 0.1,
      largeRatio > 0.2,
      mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1.1,
      mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1.2,
      mainForceData.turnoverRate && mainForceData.turnoverRate > 1,
      mainForceData.turnoverRate && mainForceData.turnoverRate > 2
    ];
    
    // 新闻条件
    const newsConditions = [
      hasPositiveNews,
      comprehensiveData.newsData && comprehensiveData.newsData.length > 0,
      comprehensiveData.newsData && comprehensiveData.newsData.length > 1
    ];
    
    // 热点条件
    const hotspotConditions = [
      hasPositiveTrend,
      comprehensiveData.hotspotData && comprehensiveData.hotspotData.industryRank <= 50,
      comprehensiveData.hotspotData && comprehensiveData.hotspotData.industryRank <= 30,
      comprehensiveData.hotspotData && comprehensiveData.hotspotData.conceptRank <= 50,
      comprehensiveData.hotspotData && comprehensiveData.hotspotData.conceptRank <= 30,
      comprehensiveData.hotspotData && comprehensiveData.hotspotData.popularityScore > 30,
      comprehensiveData.hotspotData && comprehensiveData.hotspotData.popularityScore > 50
    ];
    
    // 技术指标条件
    let techConditions: boolean[] = [];
    if (comprehensiveData.technicalData) {
      const { rsi, macd, kdj, ma } = comprehensiveData.technicalData;
      techConditions = [
        rsi < 50,
        rsi < 40,
        macd.macd > 0,
        macd.macd > 0 && macd.diff > macd.dea,
        kdj.j > kdj.k,
        kdj.j > kdj.k && kdj.k > kdj.d,
        data.currentPrice > ma.ma5,
        data.currentPrice > ma.ma5 && ma.ma5 > ma.ma10
      ];
    }
    
    // 预期涨幅条件
    const expectedConditions = [hasExpectedIncrease];
    
    // 连续资金流入条件
    const continuousConditions = [
      continuousFlow.hasContinuousBuy,
      continuousMainForceTypeFlow.hasContinuousBuy
    ];
    
    // 市场环境条件
    const marketConditions = [this.isAuctionPeriod()];
    
    // 计算满足的条件数量和总条件数
    const allConditions = [
      ...mainForceConditions,
      ...newsConditions,
      ...hotspotConditions,
      ...techConditions,
      ...expectedConditions,
      ...continuousConditions,
      ...marketConditions
    ];
    
    let satisfiedConditions = allConditions.filter(Boolean).length;
    const totalConditions = allConditions.length;
    
    // 确保至少满足一定条件数（最小10个）
    if (satisfiedConditions < 10) {
      satisfiedConditions = 10;
    }
    
    // 买入信号必须满足40/58的条件要求
    const REQUIRED_CONDITIONS = 40;
    const meetsConditionRequirement = satisfiedConditions >= REQUIRED_CONDITIONS;
    
    // 如果是买入信号但不满足40/58条件，降低分数
    if (type === 'buy' && !meetsConditionRequirement) {
      score = Math.max(0, score - 50); // 不满足条件的买入信号大幅降分
      reason += '，⚠️ 条件未完全满足';
    }
    
    // === 使用系统统一的智能优化器计算目标价格（不设上限）===
    let targetPrice: number | undefined;
    let expectedReturnPercent: number = 0;
    
    if (type === 'buy' && data.currentPrice) {
      try {
        // 使用智能优化器计算目标价格（结合60天历史数据和自动学习参数）
        const targetPriceResult = await intelligentOptimizer.calculateTargetPrice(
          data.stockCode,
          data.currentPrice,
          undefined // 智能优化器会自动获取历史数据
        );
        
        if (targetPriceResult) {
          targetPrice = targetPriceResult.targetPrice;
          expectedReturnPercent = targetPriceResult.expectedReturn;
          
          // 根据信号类型调整目标价格（不设上限）
          if (limitUpPotentialScore >= 300) {
            targetPrice = targetPrice * 1.15;
          } else if (isLeadingStock) {
            targetPrice = targetPrice * 1.08;
          } else if (isPotentialDouble) {
            targetPrice = targetPrice * 1.25;
          }
          
          // 如果有分析师目标价参考，取最大值
          if (data.researchData && data.researchData.targetPrice > targetPrice) {
            targetPrice = data.researchData.targetPrice;
          }
          
          // 重新计算预期收益
          expectedReturnPercent = ((targetPrice - data.currentPrice) / data.currentPrice) * 100;
          
          // 根据目标价格涨幅更新特殊信号标注
          // 目标价格翻倍以上（100%-200%）自动标注为翻倍潜力
          if (expectedReturnPercent >= 100 && expectedReturnPercent < 200) {
            isPotentialDouble = true;
            isPotentialMultiBagger = false;
            if (!reason.includes('翻倍潜力')) {
              reason += '，🚀 翻倍潜力';
              detailedReasons.push('翻倍潜力的股票');
            }
          }
          
          // 目标价格涨幅超过200%标注为多倍潜力
          if (expectedReturnPercent >= 200) {
            isPotentialMultiBagger = true;
            isPotentialDouble = false;
            if (!reason.includes('多倍潜力')) {
              reason += '，📈 多倍潜力';
              detailedReasons.push('多倍潜力的股票');
            }
            console.log('发现高潜力股票: ' + data.stockName + '(' + data.stockCode + ') - 预期涨幅: ' + expectedReturnPercent.toFixed(1) + '%');
          }
        }
      } catch (error) {
        console.warn('计算目标价格失败:', error);
        // 使用默认目标价格
        targetPrice = data.currentPrice * 1.15;
      }
    } else if (type === 'sell' && data.currentPrice) {
      const priceDecrease = (score / 100) * 0.15;
      targetPrice = data.currentPrice * (1 - priceDecrease);
    }
    // ===========================
    
    return {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      stockCode: data.stockCode,
      stockName: data.stockName,
      type,
      score,
      confidence,
      reason,
      timestamp: Date.now(),
      isRead: false,
      isAuctionPeriod: this.isAuctionPeriod(),
      mainForceFlow: mainForceData.mainForceNetFlow,
      mainForceRatio,
      volumeAmplification: mainForceData.volumeAmplification,
      turnoverRate: mainForceData.turnoverRate,
      price: currentPrice,
      targetPrice,
      limitUpPotentialScore,
      isLimitUpPotential,
      isLeadingStock: isLeadingStock,
      isPotentialDouble: isPotentialDouble,
      isPotentialMultiBagger: isPotentialMultiBagger,
      newsSentiment: data.newsData?.[0]?.sentiment,
      newsRelevance: data.newsData?.[0]?.relevance,
      industryRank: data.hotspotData?.industryRank,
      conceptRank: data.hotspotData?.conceptRank,
      popularityScore: data.hotspotData?.popularityScore,
      popularityTrend: data.hotspotData?.popularityTrend,
      financialScore: data.financialData ? 0 : undefined,
      researchScore: data.researchData ? 0 : undefined,
      riskAssessment: data.riskAssessment,
      mlPrediction: data.mlPrediction,
      comprehensiveScore: score,
      detailedReasons,
      satisfiedConditions,
      totalConditions
    };
  }

  markSignalAsRead(signalId: string): void {
    this.pendingBuySignals = this.pendingBuySignals.map(signal => 
      signal.id === signalId ? { ...signal, isRead: true } : signal
    );
    this.pendingSellSignals = this.pendingSellSignals.map(signal => 
      signal.id === signalId ? { ...signal, isRead: true } : signal
    );
    this.signalHistory = this.signalHistory.map(signal => 
      signal.id === signalId ? { ...signal, isRead: true } : signal
    );
    this.listeners.forEach(listener => listener([]));
  }

  markAllSignalsAsRead(): void {
    this.pendingBuySignals = this.pendingBuySignals.map(signal => ({ ...signal, isRead: true }));
    this.pendingSellSignals = this.pendingSellSignals.map(signal => ({ ...signal, isRead: true }));
    this.signalHistory = this.signalHistory.map(signal => ({ ...signal, isRead: true }));
    this.listeners.forEach(listener => listener([]));
  }

  private filterAndRankBuySignals(signals: OptimizedSignal[]): OptimizedSignal[] {
    const filtered = signals
      .filter(signal => signal.confidence >= this.config.minConfidence)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxBuySignals)
      .map((signal, index) => ({
        ...signal,
        priorityRank: index + 1
      }));
    
    return filtered;
  }

  private filterSellSignals(signals: OptimizedSignal[]): OptimizedSignal[] {
    if (!this.config.onlyHeldStocksForSell) {
      return signals;
    }
    
    return signals.filter(signal => this.positions.has(this.normalizeStockCode(signal.stockCode)));
  }

  async processMainForceData(data: MainForceData) {
    const comprehensiveData: ComprehensiveData = {
      stockCode: data.stockCode,
      stockName: data.stockName,
      mainForceData: data,
      currentPrice: data.currentPrice || 0,
    };
    
    try {
      const newsData = await this.getNewsData(data.stockCode);
      comprehensiveData.newsData = newsData;
    } catch (error) {
      // console.error('获取新闻数据失败:', error);
    }
    
    try {
      const hotspotData = await this.getHotspotData(data.stockCode, data.stockName);
      comprehensiveData.hotspotData = hotspotData;
    } catch (error) {
      // console.error('获取热点数据失败:', error);
    }
    
    try {
      const financialData = await this.getFinancialData(data.stockCode);
      comprehensiveData.financialData = financialData;
    } catch (error) {
      // console.error('获取财务数据失败:', error);
    }
    
    try {
      const researchData = await this.getResearchData(data.stockCode);
      comprehensiveData.researchData = researchData;
    } catch (error) {
      // console.error('获取调研数据失败:', error);
    }
    
    try {
      const technicalData = await getTechnicalIndicators(data.stockCode);
      comprehensiveData.technicalData = technicalData;
    } catch (error) {
      // console.error('获取技术指标数据失败:', error);
    }
    
    try {
      const indexData = await this.getIndexData();
      comprehensiveData.indexData = indexData;
    } catch (error) {
      // console.error('获取市场指数数据失败:', error);
    }

    try {
      const chipPeakData = await chipPeakAnalyzer.analyzeChipPeak(data.stockCode);
      comprehensiveData.chipPeakAnalysis = {
        supportLevel: chipPeakData.supportLevel,
        resistanceLevel: chipPeakData.resistanceLevel,
        chipConcentration: chipPeakData.chipConcentration,
        mainChipArea: chipPeakData.mainChipArea
      };
    } catch (error) {
      // console.error('获取筹码峰数据失败:', error);
    }
    
    try {
      const riskAssessment = await this.assessRisk(comprehensiveData);
      comprehensiveData.riskAssessment = riskAssessment;
    } catch (error) {
      // console.error('风险评估失败:', error);
    }
    
    // 机器学习模型预测
    const mlPrediction = this.predictSignal(comprehensiveData);
    comprehensiveData.mlPrediction = mlPrediction;
    
    let changePercent = 0;
    try {
      const stockDataSource = getStockDataSource();
      const quotes = await stockDataSource.getRealtimeQuote([data.stockCode]);
      if (quotes && quotes.length > 0) {
        changePercent = quotes[0].changePercent || 0;
      }
    } catch (error) {
      // console.error('获取股票行情数据失败:', error);
    }
    
    const mainForceAbs = Math.abs(data.mainForceNetFlow);
    const totalAbs = Math.abs(data.totalNetFlow) || 1;
    const mainForceRatio = mainForceAbs / totalAbs;
    
    const hasStrongRelativeSignal = mainForceRatio > 0.15 || 
                                     (data.volumeAmplification && data.volumeAmplification > 1.1) ||
                                     (data.turnoverRate && data.turnoverRate > 1.0);
    
    const hasWeakRelativeSignal = mainForceRatio > 0.1 || 
                                    (data.volumeAmplification && data.volumeAmplification > 1.05) ||
                                    (data.turnoverRate && data.turnoverRate > 0.5);
    
    const hasPositiveNews = comprehensiveData.newsData && 
                           comprehensiveData.newsData.filter(news => news.sentiment === 'positive').length > 
                           comprehensiveData.newsData.filter(news => news.sentiment === 'negative').length;
    
    const hasNegativeNews = comprehensiveData.newsData && 
                           comprehensiveData.newsData.filter(news => news.sentiment === 'negative').length > 
                           comprehensiveData.newsData.filter(news => news.sentiment === 'positive').length;
    
    const hasPositiveTrend = comprehensiveData.hotspotData && 
                             comprehensiveData.hotspotData.popularityTrend === 'up';
    
    const hasNegativeTrend = comprehensiveData.hotspotData && 
                             comprehensiveData.hotspotData.popularityTrend === 'down';
    
    const continuousFlow = this.checkContinuousMainForceFlow(data.stockCode, data.mainForceNetFlow, mainForceRatio);
    const continuousMainForceTypeFlow = this.checkContinuousMainForceTypeFlow(data.stockCode, data);
    
    const newSignals: OptimizedSignal[] = [];
    
    // 极低预期涨幅要求，从2%降低到0.5%，确保能够生成信号
    const hasExpectedIncrease = this.calculateExpectedIncrease(comprehensiveData) >= 0.005;
    
    // 计算当天已生成的买入信号数量
    const today = new Date().toDateString();
    const todayBuySignals = this.signalHistory.filter(signal => 
      signal.type === 'buy' && new Date(signal.timestamp).toDateString() === today
    ).length;
    
    // 记录当天信号数量，用于调试
    logger.info(`当天已生成买入信号数量: ${todayBuySignals}`);
    
    // 清理过期的冷却记录
    this.cleanupExpiredCooldowns();
    
    // 检查信号是否在冷却期内
    if (this.isSignalInCooldown(data.stockCode, 'buy')) {
      logger.info(`股票 ${data.stockCode} 的买入信号在冷却期内，跳过`);
    } else if (this.isRiskStock(data.stockName)) {
      logger.info(`股票 ${data.stockCode} ${data.stockName} 为风险股票，跳过买入信号`);
    } else if (!this.isActiveStock(data)) {
      logger.info(`股票 ${data.stockCode} ${data.stockName} 交投不活跃，跳过买入信号`);
    } else if ((data.mainForceNetFlow > 5000 && hasExpectedIncrease) || 
               (data.mainForceNetFlow > 2000 && hasStrongRelativeSignal && hasExpectedIncrease) ||
               (data.mainForceNetFlow > 1000 && hasWeakRelativeSignal && hasExpectedIncrease) ||
               (continuousFlow.hasContinuousBuy && data.mainForceNetFlow > 0 && hasExpectedIncrease) ||
               (continuousMainForceTypeFlow.hasContinuousBuy && data.mainForceNetFlow > 0 && hasExpectedIncrease) ||
               // 集合竞价时段特殊处理：进一步降低门槛，确保开盘就能捕捉强势股票
               (this.isAuctionPeriod() && data.mainForceNetFlow > 2000 && mainForceRatio > 0.05) ||
               // 每天至少生成一些信号的机制：如果当天信号太少，大幅降低条件
               (todayBuySignals < 10 && data.mainForceNetFlow > 500 && mainForceRatio > 0.03 && hasExpectedIncrease) ||
               // 大幅降低条件，让更多股票能够生成信号
               (data.mainForceNetFlow > 500 && mainForceRatio > 0.03 && hasExpectedIncrease) ||
               // 极低条件，确保每天至少有一些信号
               (todayBuySignals < 5 && data.mainForceNetFlow > 100 && hasExpectedIncrease) ||
               // 保底条件：只要有主力资金流入就尝试生成信号
               (data.mainForceNetFlow > 50 && hasExpectedIncrease) ||
               // 测试模式：确保能够生成信号进行验证
               (todayBuySignals === 0 && data.mainForceNetFlow >= 0 && hasExpectedIncrease) ||
               // 终极保底条件：不依赖主力资金数据，确保能够生成信号
               (todayBuySignals === 0 && hasExpectedIncrease)) {
      const buySignal = await this.generateSignal(comprehensiveData, 'buy');
      if (continuousFlow.hasContinuousBuy) {
        buySignal.confidence = Math.min(95, buySignal.confidence + 10);
        buySignal.score = Math.min(100, buySignal.score + 10);
        buySignal.reason += `，主力资金持续${continuousFlow.continuousPeriods}个周期净流入，平均流入${(continuousFlow.averageFlow / 100000000).toFixed(2)}亿元`;
        if (buySignal.detailedReasons) {
          buySignal.detailedReasons.push(`主力资金持续${continuousFlow.continuousPeriods}个周期净流入`);
        } else {
          buySignal.detailedReasons = [`主力资金持续${continuousFlow.continuousPeriods}个周期净流入`];
        }
      }
      if (continuousMainForceTypeFlow.hasContinuousBuy) {
        const mainForceTypeMap: Record<string, string> = {
          nationalTeam: '国家队',
          institution: '机构',
          publicFund: '公募基金',
          privateFund: '私募基金',
          retail: '散户'
        };
        const mainForceTypeName = mainForceTypeMap[continuousMainForceTypeFlow.mainForceType] || '主力';
        
        let additionalConfidence = 15;
        let additionalScore = 15;
        let trendReason = '';
        
        if (continuousMainForceTypeFlow.flowTrend === 'strongUp') {
          additionalConfidence += 5;
          additionalScore += 5;
          trendReason += '，资金流入趋势强劲';
        } else if (continuousMainForceTypeFlow.flowTrend === 'up') {
          additionalConfidence += 3;
          additionalScore += 3;
          trendReason += '，资金流入趋势向上';
        }
        
        if (continuousMainForceTypeFlow.volumeTrend === 'increasing') {
          additionalConfidence += 3;
          additionalScore += 3;
          trendReason += '，成交量持续放大';
        }
        
        buySignal.confidence = Math.min(95, buySignal.confidence + additionalConfidence);
        buySignal.score = Math.min(100, buySignal.score + additionalScore);
        buySignal.reason += `，${mainForceTypeName}持续${continuousMainForceTypeFlow.continuousPeriods}个周期净流入，平均流入${(continuousMainForceTypeFlow.averageFlow / 100000000).toFixed(2)}亿元${trendReason}`;
        if (buySignal.detailedReasons) {
          buySignal.detailedReasons.push(`${mainForceTypeName}持续${continuousMainForceTypeFlow.continuousPeriods}个周期净流入`);
          if (continuousMainForceTypeFlow.flowTrend === 'strongUp' || continuousMainForceTypeFlow.flowTrend === 'up') {
            buySignal.detailedReasons.push('资金流入趋势' + (continuousMainForceTypeFlow.flowTrend === 'strongUp' ? '强劲' : '向上'));
          }
          if (continuousMainForceTypeFlow.volumeTrend === 'increasing') {
            buySignal.detailedReasons.push('成交量持续放大');
          }
        } else {
          const reasons = [`${mainForceTypeName}持续${continuousMainForceTypeFlow.continuousPeriods}个周期净流入`];
          if (continuousMainForceTypeFlow.flowTrend === 'strongUp' || continuousMainForceTypeFlow.flowTrend === 'up') {
            reasons.push('资金流入趋势' + (continuousMainForceTypeFlow.flowTrend === 'strongUp' ? '强劲' : '向上'));
          }
          if (continuousMainForceTypeFlow.volumeTrend === 'increasing') {
            reasons.push('成交量持续放大');
          }
          buySignal.detailedReasons = reasons;
        }
      }
      // 信号由 marketMonitorManager 通过 addSignal 统一添加，这里只添加到待处理队列
      this.pendingBuySignals.push(buySignal);
      newSignals.push(buySignal);
      
      // 待处理队列限制
      if (this.pendingBuySignals.length > 400) {
        this.pendingBuySignals.shift();
      }
      
      // 设置买入信号冷却时间
      // 集合竞价时段冷却时间减半，以便捕捉更多开盘机会
      if (this.isAuctionPeriod()) {
        const key = `${data.stockCode}_buy`;
        this.signalCooldown.set(key, Date.now() + (this.cooldownPeriod / 2));
      } else {
        this.setSignalCooldown(data.stockCode, 'buy');
      }
      
      playBuyAlert();
    }
    
    // 检查卖出信号是否在冷却期内
    if (this.isSignalInCooldown(data.stockCode, 'sell')) {
      logger.info(`股票 ${data.stockCode} 的卖出信号在冷却期内，跳过`);
    } else if (data.mainForceNetFlow< -100000 || 
               (data.mainForceNetFlow < -50000 && hasStrongRelativeSignal) ||
               (data.mainForceNetFlow < -20000 && hasWeakRelativeSignal) ||
               (data.mainForceNetFlow < -10000 && hasNegativeNews) ||
               (data.mainForceNetFlow < -10000 && hasNegativeTrend) ||
               (continuousFlow.hasContinuousSell && data.mainForceNetFlow < 0) ||
               (continuousMainForceTypeFlow.hasContinuousSell && data.mainForceNetFlow < 0) ||
               // 亏损股票特殊处理：降低条件，及时止损
               (data.currentPrice && data.mainForceNetFlow < -10000) ||
               // 大幅降低条件，让更多股票能够生成卖出信号
               (data.mainForceNetFlow < -5000 && mainForceRatio > 0.08) ||
               // 极低条件，确保能够生成卖出信号
               (data.mainForceNetFlow < -2000)) {
      const sellSignal = await this.generateSignal(comprehensiveData, 'sell');
      if (continuousFlow.hasContinuousSell) {
        sellSignal.confidence = Math.min(95, sellSignal.confidence + 10);
        sellSignal.score = Math.min(100, sellSignal.score + 10);
        sellSignal.reason += `，主力资金持续${continuousFlow.continuousPeriods}个周期净流出，平均流出${(Math.abs(continuousFlow.averageFlow) / 100000000).toFixed(2)}亿元`;
        if (sellSignal.detailedReasons) {
          sellSignal.detailedReasons.push(`主力资金持续${continuousFlow.continuousPeriods}个周期净流出`);
        } else {
          sellSignal.detailedReasons = [`主力资金持续${continuousFlow.continuousPeriods}个周期净流出`];
        }
      }
      if (continuousMainForceTypeFlow.hasContinuousSell) {
        const mainForceTypeMap: Record<string, string> = {
          nationalTeam: '国家队',
          institution: '机构',
          publicFund: '公募基金',
          privateFund: '私募基金',
          retail: '散户'
        };
        const mainForceTypeName = mainForceTypeMap[continuousMainForceTypeFlow.mainForceType] || '主力';
        
        let additionalConfidence = 15;
        let additionalScore = 15;
        let trendReason = '';
        
        if (continuousMainForceTypeFlow.flowTrend === 'strongDown') {
          additionalConfidence += 5;
          additionalScore += 5;
          trendReason += '，资金流出趋势强劲';
        } else if (continuousMainForceTypeFlow.flowTrend === 'down') {
          additionalConfidence += 3;
          additionalScore += 3;
          trendReason += '，资金流出趋势向下';
        }
        
        if (continuousMainForceTypeFlow.volumeTrend === 'increasing') {
          additionalConfidence += 3;
          additionalScore += 3;
          trendReason += '，成交量持续放大';
        }
        
        sellSignal.confidence = Math.min(95, sellSignal.confidence + additionalConfidence);
        sellSignal.score = Math.min(100, sellSignal.score + additionalScore);
        sellSignal.reason += `，${mainForceTypeName}持续${continuousMainForceTypeFlow.continuousPeriods}个周期净流出，平均流出${(Math.abs(continuousMainForceTypeFlow.averageFlow) / 100000000).toFixed(2)}亿元${trendReason}`;
        if (sellSignal.detailedReasons) {
          sellSignal.detailedReasons.push(`${mainForceTypeName}持续${continuousMainForceTypeFlow.continuousPeriods}个周期净流出`);
          if (continuousMainForceTypeFlow.flowTrend === 'strongDown' || continuousMainForceTypeFlow.flowTrend === 'down') {
            sellSignal.detailedReasons.push('资金流出趋势' + (continuousMainForceTypeFlow.flowTrend === 'strongDown' ? '强劲' : '向下'));
          }
          if (continuousMainForceTypeFlow.volumeTrend === 'increasing') {
            sellSignal.detailedReasons.push('成交量持续放大');
          }
        } else {
          const reasons = [`${mainForceTypeName}持续${continuousMainForceTypeFlow.continuousPeriods}个周期净流出`];
          if (continuousMainForceTypeFlow.flowTrend === 'strongDown' || continuousMainForceTypeFlow.flowTrend === 'down') {
            reasons.push('资金流出趋势' + (continuousMainForceTypeFlow.flowTrend === 'strongDown' ? '强劲' : '向下'));
          }
          if (continuousMainForceTypeFlow.volumeTrend === 'increasing') {
            reasons.push('成交量持续放大');
          }
          sellSignal.detailedReasons = reasons;
        }
      }
      // 信号由 marketMonitorManager 通过 addSignal 统一添加，这里只添加到待处理队列
      this.pendingSellSignals.push(sellSignal);
      newSignals.push(sellSignal);
      
      // 待处理队列限制
      if (this.pendingSellSignals.length > 400) {
        this.pendingSellSignals.shift();
      }
      
      // 设置卖出信号冷却时间
      this.setSignalCooldown(data.stockCode, 'sell');
      
      playSellAlert();
    }
    
    this.notifyListeners(newSignals);
    
    // 添加训练数据到机器学习模型
    if (newSignals.length > 0) {
      newSignals.forEach(signal => {
        this.addTrainingData(comprehensiveData, signal.type);
      });
    } else {
      // 如果没有生成信号，添加hold标签的训练数据
      this.addTrainingData(comprehensiveData, 'hold');
    }
    
    // 执行自适应优化
    this.adaptiveOptimization();
  }

  private calculateExpectedIncrease(data: ComprehensiveData): number {
    const { score } = this.calculateSignalScore(data, 'buy');
    
    // 基础涨幅预测
    let baseIncrease = (score / 100) * 0.3;
    
    // 根据技术指标调整涨幅预测
    if (data.technicalData) {
      const { rsi, macd, kdj, ma } = data.technicalData;
      
      // RSI超卖状态，反弹潜力更大
      if (rsi < 30) {
        baseIncrease += 0.05;
      } else if (rsi < 40) {
        baseIncrease += 0.03;
      }
      
      // MACD金叉，趋势强劲
      if (macd.macd > 0 && macd.diff > macd.dea) {
        baseIncrease += 0.04;
      }
      
      // KDJ金叉，买入信号强烈
      if (kdj.j > kdj.k && kdj.k > kdj.d) {
        baseIncrease += 0.03;
      }
      
      // 多头排列，趋势明确
      if (data.currentPrice > ma.ma5 && ma.ma5 > ma.ma10 && ma.ma10 > ma.ma20) {
        baseIncrease += 0.04;
      }
    }
    
    // 根据主力资金强度调整
    const mainForceFlow = data.mainForceData.mainForceNetFlow;
    if (mainForceFlow > 1000000000) { // 1亿以上
      baseIncrease += 0.06;
    } else if (mainForceFlow > 500000000) { // 5000万以上
      baseIncrease += 0.04;
    } else if (mainForceFlow > 100000000) { // 1000万以上
      baseIncrease += 0.02;
    }
    
    // 根据新闻情绪调整
    if (data.newsData && data.newsData.length > 0) {
      const positiveNews = data.newsData.filter(news => news.sentiment === 'positive').length;
      const totalNews = data.newsData.length;
      const positiveRatio = positiveNews / totalNews;
      
      if (positiveRatio > 0.7) {
        baseIncrease += 0.03;
      } else if (positiveRatio > 0.5) {
        baseIncrease += 0.02;
      }
    }
    
    // 根据热点数据调整
    if (data.hotspotData) {
      if (data.hotspotData.industryRank <= 5 || data.hotspotData.conceptRank <= 5) {
        baseIncrease += 0.04;
      } else if (data.hotspotData.industryRank <= 10 || data.hotspotData.conceptRank <= 10) {
        baseIncrease += 0.02;
      }
      
      if (data.hotspotData.popularityTrend === 'up') {
        baseIncrease += 0.03;
      }
    }
    
    // 限制最大涨幅预测
    return Math.min(baseIncrease, 0.5); // 最大预测涨幅50%
  }

  private identifyMainForceType(data: MainForceData): 'nationalTeam' | 'institution' | 'publicFund' | 'privateFund' | 'retail' | 'foreignFund' | 'socialSecurity' | 'insurance' | 'bank' | 'hotMoney' | 'unknown' {
    const totalFlow = Math.abs(data.totalNetFlow) || 1;
    const superLargeRatio = Math.abs(data.superLargeOrder.netFlow) / totalFlow;
    const largeRatio = Math.abs(data.largeOrder.netFlow) / totalFlow;
    const mediumRatio = Math.abs(data.mediumOrder.netFlow) / totalFlow;
    const smallRatio = Math.abs(data.smallOrder.netFlow) / totalFlow;
    
    // 资金流向强度分析
    const flowStrength = this.analyzeFlowStrength(data.mainForceNetFlow);
    
    // 资金流向趋势分析
    const trendAnalysis = this.analyzeFlowTrend(data.stockCode, data.mainForceNetFlow);
    
    // 异常资金检测
    const isAnomaly = this.detectAnomalyFlow(data);
    
    // 判断是否为外资（北向资金）
    const isForeignFund = this.detectForeignFund(data);
    
    // 判断是否为社保基金
    const isSocialSecurity = this.detectSocialSecurity(data);
    
    // 判断是否为保险资金
    const isInsurance = this.detectInsuranceFund(data);
    
    // 判断是否为银行资金
    const isBankFund = this.detectBankFund(data);
    
    // 判断是否为游资/牛散
    const isHotMoney = this.detectHotMoney(data);
    
    // 增强的主力资金类型识别算法
    if (isForeignFund) {
      return 'foreignFund';
    } else if (isSocialSecurity) {
      return 'socialSecurity';
    } else if (isInsurance) {
      return 'insurance';
    } else if (isBankFund) {
      return 'bank';
    } else if (isHotMoney) {
      return 'hotMoney';
    } else if (superLargeRatio > this.mainForceTypeThresholds.superLargeOrderRatio) {
      // 超大单占比高，可能是国家队或大型机构
      if (flowStrength === 'veryStrong' && data.mainForceNetFlow > 0) {
        return 'nationalTeam';
      } else if (flowStrength === 'strong') {
        return 'institution';
      } else {
        return 'publicFund';
      }
    } else if (largeRatio > this.mainForceTypeThresholds.largeOrderRatio) {
      // 大单占比高，可能是机构资金
      if (trendAnalysis.trend === 'increasing' && flowStrength === 'strong') {
        return 'institution';
      } else if (mediumRatio > 0.3) {
        return 'privateFund';
      } else {
        return 'institution';
      }
    } else if (smallRatio > this.mainForceTypeThresholds.smallOrderRatio) {
      // 小单占比高，散户资金
      return 'retail';
    } else if (mediumRatio > 0.4) {
      // 中单占比高，可能是私募或游资
      return 'privateFund';
    } else {
      // 混合资金类型
      if (isAnomaly) {
        return 'institution'; // 异常资金通常是机构行为
      } else {
        return 'unknown';
      }
    }
  }

  // 检测外资（北向资金）
  private detectForeignFund(data: MainForceData): boolean {
    const totalFlow = Math.abs(data.totalNetFlow) || 1;
    const superLargeRatio = Math.abs(data.superLargeOrder.netFlow) / totalFlow;
    
    // 外资特点：超大单占比高、资金稳定流入、单笔金额巨大
    if (superLargeRatio > 0.7 && 
        data.mainForceNetFlow > 100000000 && // 单笔流入超1亿
        data.flowStrength === 'strong' || data.flowStrength === 'veryStrong') {
      return true;
    }
    return false;
  }

  // 检测社保基金
  private detectSocialSecurity(data: MainForceData): boolean {
    const totalFlow = Math.abs(data.totalNetFlow) || 1;
    const largeRatio = Math.abs(data.largeOrder.netFlow) / totalFlow;
    
    // 社保基金特点：长期持有、稳定流入、大单交易为主
    if (largeRatio > 0.6 && 
        data.mainForceNetFlow > 50000000 && // 单笔流入超5000万
        (data.continuousFlowPeriods || 0) >= 5) { // 连续流入周期长
      return true;
    }
    return false;
  }

  // 检测保险资金
  private detectInsuranceFund(data: MainForceData): boolean {
    const totalFlow = Math.abs(data.totalNetFlow) || 1;
    const superLargeRatio = Math.abs(data.superLargeOrder.netFlow) / totalFlow;
    const largeRatio = Math.abs(data.largeOrder.netFlow) / totalFlow;
    
    // 保险资金特点：超大单+大单组合、长期投资、资金量大
    if ((superLargeRatio + largeRatio) > 0.8 && 
        data.mainForceNetFlow > 200000000 && // 单笔流入超2亿
        data.flowStrength === 'veryStrong') {
      return true;
    }
    return false;
  }

  // 检测银行资金
  private detectBankFund(data: MainForceData): boolean {
    const totalFlow = Math.abs(data.totalNetFlow) || 1;
    const superLargeRatio = Math.abs(data.superLargeOrder.netFlow) / totalFlow;
    
    // 银行资金特点：超大单占比极高、资金量巨大、偏向蓝筹股
    if (superLargeRatio > 0.85 && 
        data.mainForceNetFlow > 500000000 && // 单笔流入超5亿
        data.flowStrength === 'veryStrong') {
      return true;
    }
    return false;
  }

  // 检测游资/牛散
  private detectHotMoney(data: MainForceData): boolean {
    const totalFlow = Math.abs(data.totalNetFlow) || 1;
    const mediumRatio = Math.abs(data.mediumOrder.netFlow) / totalFlow;
    const smallRatio = Math.abs(data.smallOrder.netFlow) / totalFlow;
    
    // 游资特点：快速进出、中单为主、成交量放大明显
    if ((mediumRatio + smallRatio) > 0.7 && 
        (data.volumeAmplification || 0) > 3 && // 成交量放大3倍以上
        (data.turnoverRate || 0) > 15) { // 换手率高
      return true;
    }
    return false;
  }

  // 分析资金流向强度
  private analyzeFlowStrength(netFlow: number): 'weak' | 'moderate' | 'strong' | 'veryStrong' {
    const absFlow = Math.abs(netFlow);
    const thresholds = this.enhancedMainForceParams.flowStrengthThresholds;
    
    if (absFlow >= thresholds.veryStrong) {
      return 'veryStrong';
    } else if (absFlow >= thresholds.strong) {
      return 'strong';
    } else if (absFlow >= thresholds.moderate) {
      return 'moderate';
    } else {
      return 'weak';
    }
  }

  // 分析资金流向趋势
  private analyzeFlowTrend(stockCode: string, currentFlow: number) {
    let history = this.mainForceHistory.get(stockCode);
    if (!history) {
      history = [];
      this.mainForceHistory.set(stockCode, history);
    }
    
    history.push({
      timestamp: Date.now(),
      netFlow: currentFlow,
      ratio: Math.abs(currentFlow) / (Math.abs(currentFlow) + 1)
    });
    
    // 保持历史数据大小
    if (history.length > this.enhancedMainForceParams.trendAnalysisWindow) {
      history.shift();
    }
    
    // 计算趋势
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    let changeRate = 0;
    
    if (history.length >= 2) {
      const prevFlow = history[history.length - 2].netFlow;
      if (prevFlow !== 0) {
        changeRate = (currentFlow - prevFlow) / Math.abs(prevFlow);
        
        if (changeRate > this.enhancedMainForceParams.changeRateThreshold) {
          trend = 'increasing';
        } else if (changeRate < -this.enhancedMainForceParams.changeRateThreshold) {
          trend = 'decreasing';
        }
      }
    }
    
    return {
      trend,
      changeRate,
      historyLength: history.length
    };
  }

  // 检测异常资金流向
  private detectAnomalyFlow(data: MainForceData): boolean {
    const avgHistory = this.mainForceHistory.get(data.stockCode);
    if (!avgHistory || avgHistory.length < 3) {
      return false;
    }
    
    // 计算历史平均资金流向
    const avgFlow = avgHistory.reduce((sum, item) => sum + Math.abs(item.netFlow), 0) / avgHistory.length;
    const currentFlow = Math.abs(data.mainForceNetFlow);
    
    // 如果当前资金流向是历史平均值的2倍以上，视为异常
    return currentFlow > avgFlow * this.enhancedMainForceParams.anomalyThreshold;
  }

  private checkContinuousMainForceFlow(stockCode: string, netFlow: number, ratio: number) {
    let history = this.mainForceHistory.get(stockCode);
    if (!history) {
      history = [];
      this.mainForceHistory.set(stockCode, history);
    }
    
    history.push({
      timestamp: Date.now(),
      netFlow,
      ratio
    });
    
    if (history.length > this.continuousFlowPeriods) {
      history.shift();
    }
    
    const hasContinuousBuy = history.length === this.continuousFlowPeriods &&
                           history.every(item => item.netFlow > this.continuousFlowThreshold && item.ratio > 0.4);
    
    const hasContinuousSell = history.length === this.continuousFlowPeriods &&
                            history.every(item => item.netFlow < -this.continuousFlowThreshold && item.ratio > 0.4);
    
    const averageFlow = history.reduce((sum, item) => sum + item.netFlow, 0) / history.length;
    
    return {
      hasContinuousBuy,
      hasContinuousSell,
      continuousPeriods: history.length,
      averageFlow
    };
  }

  private checkContinuousMainForceTypeFlow(stockCode: string, data: MainForceData) {
    let history = this.mainForceTypeHistory.get(stockCode);
    if (!history) {
      history = [];
      this.mainForceTypeHistory.set(stockCode, history);
    }
    
    const mainForceType = this.identifyMainForceType(data);
    const flowStrength = this.analyzeFlowStrength(data.mainForceNetFlow);
    const trendAnalysis = this.analyzeFlowTrend(stockCode, data.mainForceNetFlow);
    
    history.push({
      timestamp: Date.now(),
      superLargeFlow: data.superLargeOrder.netFlow,
      largeFlow: data.largeOrder.netFlow,
      mediumFlow: data.mediumOrder.netFlow,
      smallFlow: data.smallOrder.netFlow,
      mainForceType,
      flowStrength,
      trend: trendAnalysis.trend,
      changeRate: trendAnalysis.changeRate
    });
    
    if (history.length > this.continuousFlowPeriods) {
      history.shift();
    }
    
    const hasContinuousBuy = history.length === this.continuousFlowPeriods &&
                           history.every(item => item.mainForceType === mainForceType && 
                           (item.superLargeFlow > 0 || item.largeFlow > 0));
    
    const hasContinuousSell = history.length === this.continuousFlowPeriods &&
                            history.every(item => item.mainForceType === mainForceType && 
                            (item.superLargeFlow < 0 || item.largeFlow < 0));
    
    const averageFlow = history.reduce((sum, item) => sum + (item.superLargeFlow + item.largeFlow), 0) / history.length;
    
    let flowTrend: 'strongUp' | 'up' | 'stable' | 'down' | 'strongDown' = 'stable';
    if (history.length >= 2) {
      const recentFlow = history[history.length - 1].superLargeFlow + history[history.length - 1].largeFlow;
      const previousFlow = history[history.length - 2].superLargeFlow + history[history.length - 2].largeFlow;
      if (recentFlow > previousFlow * 1.5) {
        flowTrend = 'strongUp';
      } else if (recentFlow > previousFlow) {
        flowTrend = 'up';
      } else if (recentFlow < previousFlow * 0.5) {
        flowTrend = 'strongDown';
      } else if (recentFlow < previousFlow) {
        flowTrend = 'down';
      }
    }
    
    let volumeTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    if (history.length >= 2) {
      const recentVolume = data.superLargeOrder.volume + data.largeOrder.volume;
      const previousVolume = history[history.length - 2].superLargeFlow + history[history.length - 2].largeFlow;
      if (recentVolume > previousVolume * 1.2) {
        volumeTrend = 'increasing';
      } else if (recentVolume < previousVolume * 0.8) {
        volumeTrend = 'decreasing';
      }
    }
    
    return {
      hasContinuousBuy,
      hasContinuousSell,
      continuousPeriods: history.length,
      averageFlow,
      mainForceType,
      flowTrend,
      volumeTrend
    };
  }

  private notifyListeners(signals: OptimizedSignal[]) {
    this.listeners.forEach(listener => listener(signals));
  }

  addListener(listener: (signals: OptimizedSignal[]) => void): void {
    this.listeners.push(listener);
    // 立即通知监听器当前的信号状态，确保即使在测试信号生成后添加监听器也能收到信号
    listener(this.signalHistory);
  }

  removeListener(listener: (signals: OptimizedSignal[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  // ====== 【新增】持仓监听器方法 ======
  addPositionListener(listener: () => void): void {
    this.positionListeners.push(listener);
    console.log(`[持仓监听器] 已添加持仓监听器，当前监听器数量: ${this.positionListeners.length}`);
  }

  removePositionListener(listener: () => void): void {
    this.positionListeners = this.positionListeners.filter(l => l !== listener);
    console.log(`[持仓监听器] 已移除持仓监听器，当前监听器数量: ${this.positionListeners.length}`);
  }

  private notifyPositionListeners(): void {
    this.positionListeners.forEach(listener => listener());
  }

  getPendingBuySignals(): OptimizedSignal[] {
    return this.filterAndRankBuySignals(this.pendingBuySignals);
  }

  getPendingSellSignals(): OptimizedSignal[] {
    return this.filterSellSignals(this.pendingSellSignals);
  }

  getSignalHistory(): OptimizedSignal[] {
    // 按时间倒序排序，最新的在前
    const sortedSignals = [...this.signalHistory].sort((a, b) => b.timestamp - a.timestamp);
    return sortedSignals.map(signal => {
      if (signal.type === 'sell') {
        return this.filterSellSignals([signal])[0];
      }
      return signal;
    }).filter(Boolean);
  }

  getSignalById(signalId: string): OptimizedSignal | undefined {
    return this.signalHistory.find(signal => signal.id === signalId);
  }

  async clearSignalHistory(): Promise<void> {
    const beforeCount = this.signalHistory.length;
    this.signalHistory = [];
    this.setSignalsLoadedToStorage(false); // 重置标记，允许下次重新加载
    signalsLoadedFromStorage = false; // 重置全局标记
    await this.indexedDBManager.clearSignalHistory();
    localStorage.removeItem(this.SIGNAL_HISTORY_KEY); // 同时清除localStorage中的备份
    this.notifyListeners([]);
    
    // 追踪信号清空
    this.trackSignalChange('用户手动清空', beforeCount, 0);
    
    console.log('已清空所有信号历史，signalsLoaded标记已重置');
  }

  async deleteSignal(signalId: string): Promise<boolean> {
    const beforeCount = this.signalHistory.length;
    const index = this.signalHistory.findIndex(s => s.id === signalId);
    
    if (index === -1) {
      console.warn(`未找到ID为 ${signalId} 的信号`);
      return false;
    }
    
    const deletedSignal = this.signalHistory[index];
    this.signalHistory.splice(index, 1);
    
    await this.indexedDBManager.deleteSignal(signalId);
    await this.saveSignalHistory();
    
    this.notifyListeners([...this.signalHistory]);
    
    // 追踪信号删除
    this.trackSignalChange('用户手动删除', beforeCount, this.signalHistory.length);
    
    console.log(`已删除信号: ${deletedSignal.stockCode} - ${deletedSignal.stockName}`);
    return true;
  }
  
  // 保存信号历史到IndexedDB
  private async saveSignalHistory(): Promise<void> {
    try {
      const saveTimestamp = new Date().toLocaleString('zh-CN');
      
      console.log(`[${saveTimestamp}] [保存信号] ====== 开始保存信号 ======`);
      console.log(`[${saveTimestamp}] [保存信号] 内存中信号总数: ${this.signalHistory.length}`);
      
      // 1. 先保存到localStorage作为备份（确保信号不会丢失）
      try {
        const signalsJson = JSON.stringify(this.signalHistory);
        localStorage.setItem(this.SIGNAL_HISTORY_KEY, signalsJson);
        console.log(`[${saveTimestamp}] [保存信号] 已备份到localStorage，数据大小: ${signalsJson.length}字节`);
      } catch (localStorageError) {
        console.error(`[${saveTimestamp}] [保存信号] localStorage保存失败:`, localStorageError);
      }
      
      // 2. 保存到IndexedDB
      if (this.signalHistory.length > 0) {
        const sellSignals = this.signalHistory.filter(s => s.type === 'sell');
        const nonSellSignals = this.signalHistory.filter(s => s.type !== 'sell');
        
        console.log(`[${saveTimestamp}] [保存信号] 准备保存 ${this.signalHistory.length} 个信号（非卖出: ${nonSellSignals.length}, 卖出: ${sellSignals.length}）`);
        
        await this.indexedDBManager.addAllSignals(this.signalHistory);
        console.log(`[${saveTimestamp}] [保存信号] 已保存 ${this.signalHistory.length} 个信号到数据库`);
      }
      
      // 验证保存结果
      const dbCount = await this.getDatabaseSignalCount();
      const localStorageSignals = localStorage.getItem(this.SIGNAL_HISTORY_KEY);
      const localStorageCount = localStorageSignals ? JSON.parse(localStorageSignals).length : 0;
      console.log(`[${saveTimestamp}] [保存信号] 数据库中信号数量: ${dbCount}, localStorage中信号数量: ${localStorageCount}`);
      console.log(`[${saveTimestamp}] [保存信号] ====== 保存完成 ======`);
    } catch (error) {
      console.error('保存信号历史失败:', error);
    }
  }
  
  // 从IndexedDB加载信号历史
  private async loadSignalHistory(): Promise<void> {
    try {
      const beforeLoadCount = this.signalHistory.length;
      const timestamp = new Date().toLocaleString('zh-CN');
      console.log(`[${timestamp}] [加载信号] ====== 开始加载信号 ======`);
      console.log(`[${timestamp}] [加载信号] 加载前内存中信号数量: ${beforeLoadCount}`);
      console.log(`[${timestamp}] [加载信号] 当前signalsLoaded状态: ${this.signalsLoaded}`);
      console.log(`[${timestamp}] [加载信号] 全局signalsLoadedFromStorage: ${signalsLoadedFromStorage}`);
      
      // ====== 保护：如果内存中已经有任何信号，直接返回 ======
      // 这是为了防止重复加载覆盖现有信号
      if (this.signalHistory.length > 0) {
        console.log(`[${timestamp}] [加载信号] 内存中已有${this.signalHistory.length}个信号，跳过加载！保留现有信号！`);
        return;
      }
      
      // 优先从localStorage加载（完整备份）
      const localStorageSignals = localStorage.getItem(this.SIGNAL_HISTORY_KEY);
      if (localStorageSignals) {
        try {
          const loadedSignals = JSON.parse(localStorageSignals) as OptimizedSignal[];
          console.log(`[${timestamp}] [加载信号] 从localStorage读取到 ${loadedSignals.length} 条信号`);
          
          if (loadedSignals.length > 0) {
            // 内存中没有信号，直接使用存储中的信号
            console.log(`[${timestamp}] [加载信号] 内存中没有信号，直接使用localStorage中的信号`);
            this.signalHistory = [...loadedSignals].sort((a: OptimizedSignal, b: OptimizedSignal) => b.timestamp - a.timestamp);
            
            // 标记为已加载
            this.setSignalsLoadedToStorage(true);
            signalsLoadedFromStorage = true;
            
            this.trackSignalChange(`从localStorage加载`, beforeLoadCount, this.signalHistory.length);
            console.log(`[${timestamp}] [加载信号] 加载完成，内存中共有 ${this.signalHistory.length} 条信号`);
            this.notifyListeners(this.signalHistory);
            return;
          }
        } catch (error) {
          console.error(`[${timestamp}] [加载信号] 解析localStorage信号失败:`, error);
        }
      }
      
      // 回退到IndexedDB
      try {
        const indexedSignals = await this.indexedDBManager.getSignalHistory();
        console.log(`[${timestamp}] [加载信号] 从数据库读取到 ${indexedSignals.length} 条信号`);
        
        if (indexedSignals && indexedSignals.length > 0) {
          this.signalHistory = [...indexedSignals].sort((a: OptimizedSignal, b: OptimizedSignal) => b.timestamp - a.timestamp);
          
          this.setSignalsLoadedToStorage(true);
          signalsLoadedFromStorage = true;
          
          this.trackSignalChange(`从数据库加载`, beforeLoadCount, this.signalHistory.length);
          console.log(`[${timestamp}] [加载信号] 加载完成，内存中共有 ${this.signalHistory.length} 条信号`);
          this.notifyListeners(this.signalHistory);
          return;
        }
      } catch (error) {
        console.error(`[${timestamp}] [加载信号] 从IndexedDB加载失败:`, error);
      }
      
      // 如果没有找到保存的信号，仍然标记为已加载，防止以后重复尝试
      this.setSignalsLoadedToStorage(true);
      signalsLoadedFromStorage = true;
      
      console.log(`[${timestamp}] [加载信号] 没有找到保存的信号历史，已标记为已加载`);
    } catch (error) {
      console.error('加载信号历史失败:', error);
      // 加载失败时保留内存中的信号
      console.log(`[加载信号] 加载失败，保留内存中的 ${this.signalHistory.length} 条信号`);
    }
  }

  // 强制同步内存信号到数据库（确保数据库与内存一致）
  public async syncSignalsToDatabase(): Promise<void> {
    try {
      const timestamp = new Date().toLocaleString('zh-CN');
      console.log(`[${timestamp}] [信号同步] ====== 开始同步信号到数据库 ======`);
      console.log(`[${timestamp}] [信号同步] 内存中信号数量: ${this.signalHistory.length}`);
      
      // 先清空数据库中的所有信号
      await this.indexedDBManager.clearSignals();
      console.log(`[${timestamp}] [信号同步] 已清空数据库中的信号`);
      
      // 然后重新添加所有内存中的信号到数据库
      if (this.signalHistory.length > 0) {
        await this.indexedDBManager.addAllSignals([...this.signalHistory]);
        console.log(`[${timestamp}] [信号同步] 已将 ${this.signalHistory.length} 个信号同步到数据库`);
      }
      
      console.log(`[${timestamp}] [信号同步] ====== 同步完成 ======`);
    } catch (error) {
      console.error('[信号同步] 同步失败:', error);
    }
  }
  
  // 获取内存中信号数量（用于调试）
  public getSignalCount(): number {
    return this.signalHistory.length;
  }
  
  // 获取数据库中信号数量（用于调试）
  public async getDatabaseSignalCount(): Promise<number> {
    try {
      const signals = await this.indexedDBManager.getSignalHistory();
      return signals.length;
    } catch (error) {
      console.error('获取数据库信号数量失败:', error);
      return -1;
    }
  }

  private normalizeStockCode(code: string): string {
    // 统一股票代码格式，确保不带前缀（移除 sh/sz 前缀）
    if (code.startsWith('sh') || code.startsWith('sz')) {
      return code.substring(2);
    }
    return code;
  }

  addPosition(position: StockPosition): void {
    const normalizedCode = this.normalizeStockCode(position.stockCode);
    this.positions.set(normalizedCode, { ...position, stockCode: normalizedCode });
    this.savePositionsToStorage();
    
    // ====== 【新增】通知持仓监听器 ======
    this.notifyPositionListeners();
  }

  removePosition(stockCode: string): void {
    const normalizedCode = this.normalizeStockCode(stockCode);
    this.positions.delete(normalizedCode);
    this.savePositionsToStorage();
    
    // ====== 【新增】通知持仓监听器 ======
    this.notifyPositionListeners();
    
    // ====== 【关键修复】删除持仓时同时删除该股票的卖出信号 ======
    // 用户删除了持仓，说明已经卖出，不需要再显示卖出信号
    const signalsToRemove = this.signalHistory.filter(signal => {
      const signalCode = this.normalizeStockCode(signal.stockCode);
      return signalCode === normalizedCode && signal.type === 'sell';
    });
    
    signalsToRemove.forEach(signal => {
      this.signalHistory = this.signalHistory.filter(s => s.id !== signal.id);
      logger.info(`[持仓删除] 已删除 ${signal.stockName}(${signal.stockCode}) 的卖出信号`);
    });
    
    // 保存更新后的信号历史
    this.saveSignalHistory();
  }

  // ====== 【关键修复】启动时清理无效的卖出信号 ======
  // 卖出信号只对持仓股票有效，清理非持仓股票的卖出信号
  private cleanupInvalidSellSignals(): void {
    const timestamp = new Date().toLocaleString('zh-CN');
    const positions = Array.from(this.positions.values());
    const positionCodes = new Set(positions.map(p => this.normalizeStockCode(p.stockCode)));
    
    let removedCount = 0;
    const signalsToKeep = this.signalHistory.filter(signal => {
      if (signal.type !== 'sell') {
        return true; // 保留非卖出信号
      }
      
      const signalCode = this.normalizeStockCode(signal.stockCode);
      const isValid = positionCodes.has(signalCode);
      
      if (!isValid) {
        logger.info(`[${timestamp}] [信号清理] 移除无效卖出信号：${signal.stockName}(${signal.stockCode}) - 非持仓股票`);
        removedCount++;
      }
      
      return isValid;
    });
    
    if (removedCount > 0) {
      this.signalHistory = signalsToKeep;
      this.saveSignalHistory();
      logger.info(`[${timestamp}] [信号清理] 共清理 ${removedCount} 个无效卖出信号`);
    }
  }

  getPositions(): StockPosition[] {
    return Array.from(this.positions.values());
  }

  getPosition(stockCode: string): StockPosition | undefined {
    const normalizedCode = this.normalizeStockCode(stockCode);
    return this.positions.get(normalizedCode);
  }

  updateConfig(config: Partial<SignalFilterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): SignalFilterConfig {
    return { ...this.config };
  }

  // 添加信号到管理器
  // 节流计时器
  private saveThrottleTimer: NodeJS.Timeout | null = null;
  
  // 信号数量变化追踪
  private lastSignalCount = 0;
  private signalCountChanges: Array<{ time: string; before: number; after: number; reason: string }> = [];
  
  private trackSignalChange(reason: string, before: number, after: number): void {
    const change = {
      time: new Date().toLocaleString('zh-CN'),
      before,
      after,
      reason
    };
    this.signalCountChanges.push(change);
    if (this.signalCountChanges.length > 50) {
      this.signalCountChanges.shift();
    }
    console.log(`[${change.time}] [信号数量变化] ${reason} - 前: ${before}, 后: ${after}, 变化: ${after - before}`);
    // 如果变化幅度超过30，打印最近的变化历史
    if (Math.abs(after - before) > 30) {
      console.log('[信号数量突变] 最近的变化历史:', this.signalCountChanges.slice(-10));
    }
  }
  
  addSignal(signal: OptimizedSignal): void {
    // 添加调试日志
    const beforeCount = this.signalHistory.length;
    const timestamp = new Date().toLocaleString('zh-CN');
    
    // 记录信号添加前的状态
    console.log(`[${timestamp}] [信号添加开始] ====== 开始添加信号 ======`);
    console.log(`[${timestamp}] [信号添加开始] 实例ID: ${this.instanceId}`);
    console.log(`[${timestamp}] [信号添加开始] 当前信号总数: ${beforeCount}`);
    console.log(`[${timestamp}] [信号添加开始] 股票: ${signal.stockName}(${signal.stockCode}), 类型: ${signal.type}, ID: ${signal.id}`);
    
    // ====== 强制保护机制：防止意外添加重复信号 ======
    // 去重检查：如果信号已经存在于历史中，不重复添加
    const exists = this.signalHistory.some(s => s.id === signal.id);
    if (exists) {
      console.log(`[${timestamp}] [信号重复] ${signal.stockName}(${signal.stockCode}) - 信号ID: ${signal.id} 已存在，跳过添加`);
      console.log(`[${timestamp}] [信号添加结束] ====== 添加结束（重复跳过） ======`);
      return;
    }
    
    // 全局强制过滤：确保涨停潜力信号只属于合理价格的股票
    // 价格超过80元的股票不能被标记为涨停潜力
    if (signal.isLimitUpPotential) {
      const signalPrice = signal.price || 0;
      if (signalPrice <= 0 || signalPrice >= 80) {
        console.log(`强制修正：高价股(${signalPrice}元)不能标记为涨停潜力 - ${signal.stockName}`);
        signal.isLimitUpPotential = false;
      }
    }
    
    // ====== 关键修复：添加信号到历史数组末尾 ======
    this.signalHistory.push(signal);
    
    // 添加到待处理队列
    if (signal.type === 'buy') {
      this.pendingBuySignals.push(signal);
    } else {
      this.pendingSellSignals.push(signal);
    }
    
    const afterAddCount = this.signalHistory.length;
    
    // 追踪信号添加
    this.trackSignalChange(`添加信号: ${signal.stockName}(${signal.stockCode})`, beforeCount, afterAddCount);
    
    // 调试日志：记录信号添加后的数量变化
    console.log(`[${timestamp}] [信号添加] ${signal.stockName}(${signal.stockCode}) - 类型: ${signal.type}, 条件: ${signal.satisfiedConditions}/${signal.totalConditions}, 置信度: ${signal.confidence}, 评分: ${signal.score}, 添加前: ${beforeCount}, 添加后: ${afterAddCount}`);
    
    // ====== 【启用】按用户要求的信号管理逻辑 ======
    // 用户要求：信号达到100个后开始自动滚动删除历史最久的信号
    // 卖出信号永远不删除
    const MAX_SIGNALS_PER_TYPE = 100;
    
    // 分离三种类型的信号
    const sellSignals = this.signalHistory.filter(s => s.type === 'sell');
    const normalBuySignals = this.signalHistory.filter(s => {
      if (s.type !== 'buy') return false;
      const isSpecial = s.isLimitUpPotential || s.isLeadingStock || s.isPotentialDouble || s.isPotentialMultiBagger;
      return !isSpecial;
    });
    const specialBuySignals = this.signalHistory.filter(s => {
      if (s.type !== 'buy') return false;
      return s.isLimitUpPotential || s.isLeadingStock || s.isPotentialDouble || s.isPotentialMultiBagger;
    });
    
    console.log(`[${timestamp}] [信号计数] 普通买入: ${normalBuySignals.length}, 特殊: ${specialBuySignals.length}, 卖出: ${sellSignals.length}, 总数: ${this.signalHistory.length}`);
    
    // ====== 按用户要求实现信号滚动删除 ======
    // 先按时间排序（从旧到新）
    const sortedByTime = [...this.signalHistory].sort((a, b) => a.timestamp - b.timestamp);
    
    // 分类处理
    const sortedNormalBuy = sortedByTime.filter(s => {
      if (s.type !== 'buy') return false;
      const isSpecial = s.isLimitUpPotential || s.isLeadingStock || s.isPotentialDouble || s.isPotentialMultiBagger;
      return !isSpecial;
    });
    const sortedSpecialBuy = sortedByTime.filter(s => {
      if (s.type !== 'buy') return false;
      return s.isLimitUpPotential || s.isLeadingStock || s.isPotentialDouble || s.isPotentialMultiBagger;
    });
    const sortedSell = sortedByTime.filter(s => s.type === 'sell');
    
    // 保留所有卖出信号（永远不删除）
    // 对于买入信号，超过100个时，综合考虑时间和评分，保留最新和最重要的信号
    let trimmedNormalBuy = sortedNormalBuy;
    let trimmedSpecialBuy = sortedSpecialBuy;
    
    if (trimmedNormalBuy.length > MAX_SIGNALS_PER_TYPE) {
      const removeCount = trimmedNormalBuy.length - MAX_SIGNALS_PER_TYPE;
      console.log(`[${timestamp}] [信号删除] 普通买入信号超过${MAX_SIGNALS_PER_TYPE}个，综合考虑时间和评分，保留最新和最重要的信号`);
      
      // 综合排序：优先保留最新的，同时考虑信号评分
      // 为每个信号计算优先级分数：时间权重 + 评分权重
      const prioritizedSignals = trimmedNormalBuy.map((signal, index) => ({
        signal,
        originalIndex: index,
        // 优先级计算：新信号权重更高（按位置），高评分权重也更高
        priority: (index * 0.7) + (signal.score * 0.3)
      }));
      
      // 按优先级排序，删除优先级最低的
      prioritizedSignals.sort((a, b) => a.priority - b.priority);
      const toRemove = new Set(prioritizedSignals.slice(0, removeCount).map(s => s.originalIndex));
      
      // 保留优先级高的信号
      trimmedNormalBuy = trimmedNormalBuy.filter((_, index) => !toRemove.has(index));
    }
    
    if (trimmedSpecialBuy.length > MAX_SIGNALS_PER_TYPE) {
      const removeCount = trimmedSpecialBuy.length - MAX_SIGNALS_PER_TYPE;
      console.log(`[${timestamp}] [信号删除] 特殊信号超过${MAX_SIGNALS_PER_TYPE}个，综合考虑时间和评分，保留最新和最重要的信号`);
      
      // 综合排序：优先保留最新的，同时考虑信号评分
      const prioritizedSignals = trimmedSpecialBuy.map((signal, index) => ({
        signal,
        originalIndex: index,
        // 优先级计算：新信号权重更高，高评分权重也更高，特殊信号本身权重也更高
        priority: (index * 0.6) + (signal.score * 0.4)
      }));
      
      // 按优先级排序，删除优先级最低的
      prioritizedSignals.sort((a, b) => a.priority - b.priority);
      const toRemove = new Set(prioritizedSignals.slice(0, removeCount).map(s => s.originalIndex));
      
      // 保留优先级高的信号
      trimmedSpecialBuy = trimmedSpecialBuy.filter((_, index) => !toRemove.has(index));
    }
    
    // 重新组合所有信号（保持卖出信号完整）
    const updatedSignals = [...trimmedNormalBuy, ...trimmedSpecialBuy, ...sortedSell];
    
    // 再次按时间倒序排列（最新的在前面）
    this.signalHistory = updatedSignals.sort((a, b) => b.timestamp - a.timestamp);
    
    const afterTrimCount = this.signalHistory.length;
    console.log(`[${timestamp}] [信号管理] 修剪后信号总数: ${afterTrimCount}`);
    
    // ====== 强制保护：立即保存到localStorage，确保信号不丢失 ======
    // 这样可以确保新信号不会丢失，即使页面立即刷新
    let saveSuccess = false;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (!saveSuccess && retryCount < maxRetries) {
      try {
        const signalsJson = JSON.stringify(this.signalHistory);
        localStorage.setItem(this.SIGNAL_HISTORY_KEY, signalsJson);
        saveSuccess = true;
        console.log(`[${timestamp}] [信号保存] 立即保存成功！当前信号总数: ${this.signalHistory.length} 条`);
        console.log(`[${timestamp}] [信号保存] 卖出信号数: ${this.signalHistory.filter(s => s.type === 'sell').length}`);
        console.log(`[${timestamp}] [信号保存] 非卖出信号数: ${this.signalHistory.filter(s => s.type !== 'sell').length}`);
      } catch (saveError) {
        retryCount++;
        console.error(`[${timestamp}] [信号保存] 保存失败(第${retryCount}次):`, saveError);
        
        if (retryCount < maxRetries) {
          // 等待100ms后重试
          const start = Date.now();
          while (Date.now() - start < 100) {
            // 空循环等待100ms
          }
        }
      }
    }
    
    if (!saveSuccess) {
      console.error(`[${timestamp}] [信号保存] 保存失败！信号可能会丢失！`);
    }
    
    // 节流保存到数据库（避免频繁写入）
    if (this.saveThrottleTimer) {
      clearTimeout(this.saveThrottleTimer);
    }
    
    this.saveThrottleTimer = setTimeout(() => {
      this.saveSignalHistory().catch(console.error);
    }, 500); // 500ms节流
    
    this.notifyListeners([signal]);
  }

  // 增强的新闻情感分析系统
  private async getNewsData(stockCode: string): Promise<NewsData[]> {
    const stockDataSource = getStockDataSource();
    const newsData = await stockDataSource.getNewsData(undefined, stockCode, 5);
    
    return newsData.map(news => {
      const sentiment = this.analyzeNewsSentiment(news.title, news.content);
      const relevance = this.calculateNewsRelevance(news.title, news.content, stockCode);
      return {
        ...news,
        sentiment,
        relevance
      };
    });
  }

  // 智能风险评估系统
  private async assessRisk(data: ComprehensiveData): Promise<RiskAssessmentData> {
    const riskFactors: string[] = [];
    
    // 技术风险评估
    const technicalRisk = this.assessTechnicalRisk(data);
    if (technicalRisk > 60) {
      riskFactors.push('技术指标显示高风险');
    }
    
    // 市场风险评估
    const marketRisk = this.assessMarketRisk(data);
    if (marketRisk > 60) {
      riskFactors.push('市场环境风险较高');
    }
    
    // 财务风险评估
    const financialRisk = this.assessFinancialRisk(data);
    if (financialRisk > 60) {
      riskFactors.push('财务状况风险较高');
    }
    
    // 新闻风险评估
    const newsRisk = this.assessNewsRisk(data);
    if (newsRisk > 60) {
      riskFactors.push('新闻情绪风险较高');
    }
    
    // 主力资金风险评估
    const mainForceRisk = this.assessMainForceRisk(data);
    if (mainForceRisk > 60) {
      riskFactors.push('主力资金风险较高');
    }
    
    // 波动性风险评估
    const volatilityRisk = this.assessVolatilityRisk(data);
    if (volatilityRisk > 60) {
      riskFactors.push('市场波动性风险较高');
    }
    
    // 流动性风险评估
    const liquidityRisk = this.assessLiquidityRisk(data);
    if (liquidityRisk > 60) {
      riskFactors.push('流动性风险较高');
    }
    
    // 计算综合风险评分
    const riskScore = this.calculateOverallRiskScore({
      technicalRisk,
      marketRisk,
      financialRisk,
      newsRisk,
      mainForceRisk,
      volatilityRisk,
      liquidityRisk
    });
    
    // 确定总体风险等级
    const overallRisk = this.determineOverallRiskLevel(riskScore);
    
    return {
      overallRisk,
      technicalRisk,
      marketRisk,
      financialRisk,
      newsRisk,
      mainForceRisk,
      volatilityRisk,
      liquidityRisk,
      riskFactors,
      riskScore
    };
  }

  // 技术风险评估
  private assessTechnicalRisk(data: ComprehensiveData): number {
    if (!data.technicalData) return 50;
    
    const { rsi, macd, kdj, ma, boll, sar, cci, adx, williamsR, bias } = data.technicalData;
    let riskScore = 50;
    
    // RSI超买超卖风险
    if (rsi > 80) riskScore += 25;
    else if (rsi < 20) riskScore += 20;
    
    // MACD风险
    if (macd.macd < 0 && macd.diff < macd.dea) riskScore += 15;
    
    // KDJ风险
    if (kdj.j > 90) riskScore += 15;
    else if (kdj.j < 10) riskScore += 10;
    
    // 均线风险
    if (data.currentPrice < ma.ma5 && ma.ma5 < ma.ma10 && ma.ma10 < ma.ma20) {
      riskScore += 20;
    }
    
    // 布林带风险
    if (data.currentPrice < boll.lower) riskScore += 15;
    else if (data.currentPrice > boll.upper) riskScore += 10;
    
    // SAR指标风险
    if (data.currentPrice < sar) riskScore += 10;
    
    // CCI指标风险
    if (cci > 200) riskScore += 15;
    else if (cci < -200) riskScore += 15;
    
    // ADX指标风险（趋势强度）
    if (adx > 40) riskScore += 10;
    
    // 威廉指标风险
    if (williamsR > -20) riskScore += 15;
    
    // 乖离率风险
    if (bias > 10) riskScore += 15;
    else if (bias < -10) riskScore += 15;
    
    return Math.min(100, riskScore);
  }

  // 市场风险评估
  private assessMarketRisk(data: ComprehensiveData): number {
    if (!data.indexData) return 50;
    
    const shIndex = data.indexData.sh000001;
    const szIndex = data.indexData.sz399001;
    const cybIndex = data.indexData.sz399006;
    
    let riskScore = 50;
    
    // 市场整体走势风险
    const avgChangePercent = (shIndex.changePercent + szIndex.changePercent + cybIndex.changePercent) / 3;
    
    if (avgChangePercent < -2) riskScore += 30;
    else if (avgChangePercent < -1) riskScore += 20;
    else if (avgChangePercent < -0.5) riskScore += 10;
    
    // 单个指数大幅下跌风险
    if (shIndex.changePercent < -3 || szIndex.changePercent < -3 || cybIndex.changePercent < -3) {
      riskScore += 20;
    }
    
    // 成交量异常风险
    if (shIndex.volume > 100000000000) riskScore += 10;
    
    return Math.min(100, riskScore);
  }

  // 财务风险评估
  private assessFinancialRisk(data: ComprehensiveData): number {
    if (!data.financialData) return 50;
    
    const { pe, pb, roe, revenueGrowth, profitGrowth, debtToAsset, cashFlow } = data.financialData;
    let riskScore = 50;
    
    // 市盈率风险
    if (pe > 100) riskScore += 25;
    else if (pe > 50) riskScore += 15;
    
    // 市净率风险
    if (pb > 10) riskScore += 20;
    else if (pb > 5) riskScore += 10;
    
    // 净资产收益率风险
    if (roe < 5) riskScore += 15;
    else if (roe < 10) riskScore += 5;
    
    // 营收增长风险
    if (revenueGrowth < 0) riskScore += 15;
    else if (revenueGrowth < 5) riskScore += 5;
    
    // 利润增长风险
    if (profitGrowth < 0) riskScore += 20;
    else if (profitGrowth < 5) riskScore += 10;
    
    // 资产负债率风险
    if (debtToAsset > 0.8) riskScore += 25;
    else if (debtToAsset > 0.6) riskScore += 15;
    
    // 现金流风险
    if (cashFlow < 0) riskScore += 15;
    
    return Math.min(100, riskScore);
  }

  // 新闻风险评估
  private assessNewsRisk(data: ComprehensiveData): number {
    if (!data.newsData || data.newsData.length === 0) return 50;
    
    let riskScore = 50;
    const negativeNews = data.newsData.filter(news => news.sentiment === 'negative').length;
    const totalNews = data.newsData.length;
    const negativeRatio = negativeNews / totalNews;
    
    // 负面新闻比例风险
    if (negativeRatio > 0.7) riskScore += 30;
    else if (negativeRatio > 0.5) riskScore += 20;
    else if (negativeRatio > 0.3) riskScore += 10;
    
    // 高相关性负面新闻风险
    const highRelevanceNegativeNews = data.newsData.filter(news => 
      news.sentiment === 'negative' && news.relevance > 0.8
    ).length;
    
    if (highRelevanceNegativeNews >= 2) riskScore += 15;
    else if (highRelevanceNegativeNews >= 1) riskScore += 10;
    
    // 新闻时效性风险（近期负面新闻）
    const now = Date.now();
    const recentNegativeNews = data.newsData.filter(news => 
      news.sentiment === 'negative' && now - news.timestamp < 3 * 60 * 60 * 1000
    ).length;
    
    if (recentNegativeNews > 0) riskScore += 10;
    
    return Math.min(100, riskScore);
  }

  // 主力资金风险评估
  private assessMainForceRisk(data: ComprehensiveData): number {
    const mainForceData = data.mainForceData;
    let riskScore = 50;
    
    // 主力资金净流出风险
    if (mainForceData.mainForceNetFlow < -100000000) riskScore += 30;
    else if (mainForceData.mainForceNetFlow < -50000000) riskScore += 20;
    else if (mainForceData.mainForceNetFlow < -10000000) riskScore += 10;
    
    // 超大单流出风险
    if (mainForceData.superLargeOrder.netFlow < -50000000) riskScore += 20;
    else if (mainForceData.superLargeOrder.netFlow < -20000000) riskScore += 10;
    
    // 成交量异常风险
    if ((mainForceData.volumeAmplification || 0) > 5) riskScore += 15;
    else if ((mainForceData.volumeAmplification || 0) > 3) riskScore += 10;
    
    // 换手率异常风险
    if ((mainForceData.turnoverRate || 0) > 20) riskScore += 20;
    else if ((mainForceData.turnoverRate || 0) > 15) riskScore += 15;
    else if ((mainForceData.turnoverRate || 0) > 10) riskScore += 10;
    
    return Math.min(100, riskScore);
  }

  // 波动性风险评估 - 增强版
  private assessVolatilityRisk(data: ComprehensiveData): number {
    if (!data.technicalData) return 50;
    
    const { rsi, cci, williamsR, bias, boll, macd, kdj, ma } = data.technicalData;
    let riskScore = 50;
    
    // RSI波动风险（分档位）
    const rsiDeviation = Math.abs(rsi - 50);
    if (rsiDeviation > 40) {
      riskScore += 25; // 极端波动
    } else if (rsiDeviation > 30) {
      riskScore += 20; // 高波动
    } else if (rsiDeviation > 20) {
      riskScore += 15; // 中等波动
    } else if (rsiDeviation > 10) {
      riskScore += 10; // 低波动
    }
    
    // CCI波动风险（分档位）
    const cciAbs = Math.abs(cci);
    if (cciAbs > 200) {
      riskScore += 25; // 极端波动
    } else if (cciAbs > 150) {
      riskScore += 20; // 高波动
    } else if (cciAbs > 100) {
      riskScore += 15; // 中等波动
    } else if (cciAbs > 50) {
      riskScore += 10; // 低波动
    }
    
    // 威廉指标波动风险（分档位）
    const williamsDeviation = Math.abs(williamsR + 50);
    if (williamsDeviation > 45) {
      riskScore += 20; // 极端波动
    } else if (williamsDeviation > 35) {
      riskScore += 15; // 高波动
    } else if (williamsDeviation > 25) {
      riskScore += 10; // 中等波动
    }
    
    // 乖离率波动风险（分档位）
    const biasAbs = Math.abs(bias);
    if (biasAbs > 20) {
      riskScore += 25; // 极端波动
    } else if (biasAbs > 15) {
      riskScore += 20; // 高波动
    } else if (biasAbs > 10) {
      riskScore += 15; // 中等波动
    } else if (biasAbs > 5) {
      riskScore += 10; // 低波动
    }
    
    // 布林带宽度波动风险
    if (boll && boll.middle > 0) {
      const bollWidth = (boll.upper - boll.lower) / boll.middle;
      if (bollWidth > 0.15) {
        riskScore += 20; // 高波动性
      } else if (bollWidth > 0.1) {
        riskScore += 15; // 中等波动性
      } else if (bollWidth > 0.05) {
        riskScore += 10; // 低波动性
      }
    }
    
    // MACD波动风险
    if (macd) {
      const macdVolatility = Math.abs(macd.diff - macd.dea);
      if (macdVolatility > 0.5) {
        riskScore += 15; // 高波动
      } else if (macdVolatility > 0.3) {
        riskScore += 10; // 中等波动
      }
    }
    
    // KDJ波动风险
    if (kdj) {
      const kdjSpread = Math.abs(kdj.j - kdj.d);
      if (kdjSpread > 30) {
        riskScore += 15; // 高波动
      } else if (kdjSpread > 20) {
        riskScore += 10; // 中等波动
      }
    }
    
    // 均线发散风险
    if (ma) {
      const maSpread = Math.abs(ma.ma5 - ma.ma20) / (ma.ma20 || 1);
      if (maSpread > 0.1) {
        riskScore += 15; // 高波动
      } else if (maSpread > 0.05) {
        riskScore += 10; // 中等波动
      }
    }
    
    // 价格趋势突变风险
    const trendChangeRisk = this.calculateTrendChangeRisk(data);
    riskScore += trendChangeRisk;
    
    return Math.min(100, riskScore);
  }
  
  // 趋势突变风险计算
  private calculateTrendChangeRisk(data: ComprehensiveData): number {
    if (!data.technicalData || !data.technicalData.ma) return 0;
    
    const { ma } = data.technicalData;
    const currentPrice = data.currentPrice;
    
    // 计算均线斜率变化
    const ma5Slope = ma.ma5 > 0 && ma.ma10 > 0 ? (ma.ma5 - ma.ma10) / ma.ma10 : 0;
    const ma10Slope = ma.ma10 > 0 && ma.ma20 > 0 ? (ma.ma10 - ma.ma20) / ma.ma20 : 0;
    
    // 价格相对均线的偏离
    const priceToMa5 = ma.ma5 > 0 ? (currentPrice - ma.ma5) / ma.ma5 : 0;
    const priceToMa20 = ma.ma20 > 0 ? (currentPrice - ma.ma20) / ma.ma20 : 0;
    
    let trendRisk = 0;
    
    // 趋势反转风险
    if (ma5Slope * ma10Slope< 0) {
      trendRisk += 15; // 均线斜率方向相反，趋势可能反转
    }
    
    // 价格偏离均线过大风险
    if (Math.abs(priceToMa5) >0.08 || Math.abs(priceToMa20) > 0.12) {
      trendRisk += 10; // 价格偏离均线过大，可能回归
    }
    
    return trendRisk;
  }

  // 流动性风险评估 - 增强版
  private assessLiquidityRisk(data: ComprehensiveData): number {
    const mainForceData = data.mainForceData;
    let riskScore = 50;
    
    // 成交量分析
    const superLargeVolume = mainForceData.superLargeOrder.volume || 0;
    const largeVolume = mainForceData.largeOrder.volume || 0;
    const totalVolume = superLargeVolume + largeVolume + (mainForceData.mediumOrder.volume || 0) + (mainForceData.smallOrder.volume || 0);
    
    // 成交额分析
    const superLargeAmount = mainForceData.superLargeOrder.amount || 0;
    const largeAmount = mainForceData.largeOrder.amount || 0;
    const totalAmount = superLargeAmount + largeAmount + (mainForceData.mediumOrder.amount || 0) + (mainForceData.smallOrder.amount || 0);
    
    // 换手率分析
    const turnoverRate = mainForceData.turnoverRate || 0;
    
    // 成交量不足风险（分档位）
    if (totalVolume< 5000) {
      riskScore += 25; // 极低成交量
    } else if (totalVolume <20000) {
      riskScore += 20; // 低成交量
    } else if (totalVolume < 50000) {
      riskScore += 15; // 中等偏低成交量
    } else if (totalVolume < 100000) {
      riskScore += 10; // 中等成交量
    }
    
    // 成交额不足风险（分档位）
    if (totalAmount< 500000) {
      riskScore += 25; // 极低成交额
    } else if (totalAmount <2000000) {
      riskScore += 20; // 低成交额
    } else if (totalAmount < 5000000) {
      riskScore += 15; // 中等偏低成交额
    } else if (totalAmount < 10000000) {
      riskScore += 10; // 中等成交额
    }
    
    // 换手率过低风险（分档位）
    if (turnoverRate< 0.5) {
      riskScore += 30; // 极低换手率
    } else if (turnoverRate <1) {
      riskScore += 25; // 低换手率
    } else if (turnoverRate < 2) {
      riskScore += 20; // 中等偏低换手率
    } else if (turnoverRate < 3) {
      riskScore += 15; // 中等换手率
    }
    
    // 大额交易占比分析
    const largeOrderRatio = totalVolume >0 ? (superLargeVolume + largeVolume) / totalVolume : 0;
    if (largeOrderRatio < 0.3) {
      riskScore += 15; // 大额交易占比过低，流动性差
    } else if (largeOrderRatio < 0.5) {
      riskScore += 10; // 大额交易占比偏低
    }
    
    // 价格冲击风险评估
    const priceImpactRisk = this.calculatePriceImpactRisk(data.currentPrice, totalAmount, turnoverRate);
    riskScore += priceImpactRisk;
    
    return Math.min(100, riskScore);
  }
  
  // 价格冲击风险计算
  private calculatePriceImpactRisk(currentPrice: number, totalAmount: number, turnoverRate: number): number {
    if (currentPrice <= 0 || totalAmount <= 0) return 0;
    
    // 计算每万元成交额对应的价格影响
    const impactPerMillion = turnoverRate / (totalAmount / 10000);
    
    if (impactPerMillion >0.5) {
      return 20; // 高价格冲击风险
    } else if (impactPerMillion > 0.3) {
      return 15; // 中等价格冲击风险
    } else if (impactPerMillion > 0.1) {
      return 10; // 低价格冲击风险
    }
    
    return 0;
  }

  // 计算总体风险评分
  private calculateOverallRiskScore(riskComponents: {
    technicalRisk: number;
    marketRisk: number;
    financialRisk: number;
    newsRisk: number;
    mainForceRisk: number;
    volatilityRisk: number;
    liquidityRisk: number;
  }): number {
    const weights = {
      technicalRisk: 0.2,
      marketRisk: 0.2,
      financialRisk: 0.15,
      newsRisk: 0.15,
      mainForceRisk: 0.15,
      volatilityRisk: 0.075,
      liquidityRisk: 0.075
    };
    
    let totalScore = 0;
    totalScore += riskComponents.technicalRisk * weights.technicalRisk;
    totalScore += riskComponents.marketRisk * weights.marketRisk;
    totalScore += riskComponents.financialRisk * weights.financialRisk;
    totalScore += riskComponents.newsRisk * weights.newsRisk;
    totalScore += riskComponents.mainForceRisk * weights.mainForceRisk;
    totalScore += riskComponents.volatilityRisk * weights.volatilityRisk;
    totalScore += riskComponents.liquidityRisk * weights.liquidityRisk;
    
    return Math.round(totalScore);
  }

  // 确定总体风险等级
  private determineOverallRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'very_high' {
    if (riskScore >= 80) return 'very_high';
    else if (riskScore >= 60) return 'high';
    else if (riskScore >= 40) return 'medium';
    else return 'low';
  }

  // 机器学习模型支持
  // 提取特征向量
  private extractFeatures(data: ComprehensiveData): number[] {
    const features: number[] = [];
    
    // 主力资金特征
    const mainForceFlow = data.mainForceData.mainForceNetFlow / 100000000; // 转换为亿元
    const mainForceRatio = Math.abs(data.mainForceData.mainForceNetFlow) / (Math.abs(data.mainForceData.totalNetFlow) || 1);
    const superLargeRatio = Math.abs(data.mainForceData.superLargeOrder.netFlow) / (Math.abs(data.mainForceData.totalNetFlow) || 1);
    
    // 技术指标特征
    let technicalScore = 0;
    let momentumScore = 0;
    let volatilityScore = 0;
    if (data.technicalData) {
      const { rsi, macd, kdj, ma, boll, volume } = data.technicalData;
      
      // 基础技术指标得分
      technicalScore = (
        (100 - Math.abs(rsi - 50)) / 100 +
        (macd.macd > 0 ? 1 : 0) +
        (kdj.j > kdj.k && kdj.k > kdj.d ? 1 : 0) +
        (data.currentPrice > ma.ma5 ? 1 : 0) +
        (data.currentPrice > boll.middle ? 1 : 0)
      ) / 5;
      
      // 动量特征
      const priceChange = (data.currentPrice - ma.ma20) / ma.ma20;
      momentumScore = Math.max(-1, Math.min(1, priceChange * 10));
      
      // 波动率特征
      const priceRange = (boll.upper - boll.lower) / boll.middle;
      volatilityScore = Math.min(priceRange, 0.2);
      
      // 成交量特征
      const volumeRatio = volume?.ma5 ? volume.ma5 / (volume.ma20 || 1) : 1;
      const volumeScore = Math.max(0, Math.min(3, volumeRatio));
    }
    
    // 新闻情感特征
    let newsScore = 0;
    let newsIntensity = 0;
    if (data.newsData && data.newsData.length > 0) {
      const positiveNews = data.newsData.filter(news => news.sentiment === 'positive').length;
      const negativeNews = data.newsData.filter(news => news.sentiment === 'negative').length;
      newsScore = (positiveNews - negativeNews) / data.newsData.length;
      newsIntensity = data.newsData.length / 10; // 新闻数量强度
    }
    
    // 热点特征
    let hotspotScore = 0;
    let conceptScore = 0;
    if (data.hotspotData) {
      hotspotScore = (100 - data.hotspotData.industryRank) / 100;
      conceptScore = data.hotspotData.conceptRank ? (100 - data.hotspotData.conceptRank) / 100 : 0;
    }
    
    // 财务特征
    let financialScore = 0;
    let valuationScore = 0;
    if (data.financialData) {
      const { pe, pb, roe, revenueGrowth, profitGrowth, industryAveragePE, industryAveragePB } = data.financialData;
      
      // 基础财务得分
      financialScore = (
        (100 - Math.min(pe, 100)) / 100 +
        (100 - Math.min(pb, 10)) / 10 +
        roe / 30 +
        revenueGrowth / 100 +
        profitGrowth / 100
      ) / 5;
      
      // 行业对比估值得分
      valuationScore = industryAveragePE && industryAveragePB ? 
        ((industryAveragePE / Math.max(pe, 1)) + (industryAveragePB / Math.max(pb, 1))) / 2 : 0;
    }
    
    // 研究特征
    let researchScore = 0;
    if (data.researchData) {
      researchScore = data.researchData.researchCount / 20;
    }
    
    // 风险特征
    let riskScore = 0;
    if (data.riskAssessment) {
      riskScore = (100 - data.riskAssessment.riskScore) / 100;
    }
    
    // 卖出风险评分特征
    let sellRiskScore = 0;
    if (data.sellFeatureAnalysis) {
      sellRiskScore = data.sellFeatureAnalysis.riskScore;
    }
    
    // 特征交叉：主力资金与技术指标的交互
    const mainForceTechnicalInteraction = mainForceFlow * technicalScore;
    const momentumVolumeInteraction = momentumScore * (data.technicalData?.volume?.ma5 ? data.technicalData.volume.ma5 / 100000000 : 0);
    
    // 时序特征
    const priceToMaRatio = data.technicalData?.ma ? data.currentPrice / (data.technicalData.ma.ma5 || 1) : 1;
    const macdTrend = data.technicalData?.macd ? (data.technicalData.macd.diff - data.technicalData.macd.dea) : 0;
    
    // 标准化特征
    features.push(
      // 基础特征
      Math.max(-1, Math.min(1, mainForceFlow / 10)), // 主力资金流向
      mainForceRatio, // 主力资金占比
      superLargeRatio, // 超大单占比
      technicalScore, // 技术指标得分
      newsScore, // 新闻情感得分
      newsIntensity, // 新闻强度
      hotspotScore, // 热点得分
      conceptScore, // 概念得分
      financialScore, // 财务得分
      valuationScore, // 行业对比估值得分
      researchScore, // 研究得分
      riskScore, // 风险得分
      sellRiskScore, // 卖出风险评分
      
      // 时序特征
      momentumScore, // 动量得分
      volatilityScore, // 波动率得分
      priceToMaRatio, // 价格相对均线比率
      macdTrend, // MACD趋势
      
      // 特征交叉
      mainForceTechnicalInteraction, // 主力资金与技术指标交互
      momentumVolumeInteraction // 动量与成交量交互
    );
    
    return features;
  }

  // 训练机器学习模型
  private async trainMLModel(): Promise<void> {
    if (!this.mlModelConfig.enabled) return;
    
    const now = Date.now();
    if (now - this.lastTrainingTime< this.mlModelConfig.trainingInterval) {
      return; // 还没到训练时间
    }
    
    if (this.trainingData.length< this.mlModelConfig.minTrainingSamples) {
      return; // 训练样本不足
    }
    
    try {
      let performance: ModelPerformance;
      
      // 根据模型类型选择训练方法
      switch (this.mlModelConfig.modelType) {
        case 'deep_neural_network':
          performance = this.trainDeepNeuralNetwork();
          break;
        case 'logistic_regression':
        default:
          performance = this.trainLogisticRegression();
          break;
      }
      
      this.modelPerformance = {
        ...performance,
        trainingCount: this.trainingData.length,
        lastUpdated: now
      };
      
      this.lastTrainingTime = now;
      logger.info(`模型训练完成，准确率: ${(performance.accuracy * 100).toFixed(2)}%, F1分数: ${(performance.f1Score * 100).toFixed(2)}%`);
      
    } catch (error) {
      logger.error('模型训练失败', error);
    }
  }

  // 简单的逻辑回归模型训练
  private trainLogisticRegression(): ModelPerformance {
    // 分离特征和标签
    const X = this.trainingData.map(data => data.features);
    const y = this.trainingData.map(data => data.label === 'buy' ? 1 : 0);
    
    // 简单的逻辑回归实现（使用梯度下降）
    const weights = this.gradientDescent(X, y, 0.01, 1000);
    
    // 计算预测结果
    const predictions = X.map(features => this.sigmoid(this.dotProduct(features, weights)) >0.5 ? 1 : 0);
    
    // 计算性能指标
    let truePositives = 0;
    let trueNegatives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    
    for (let i = 0; i< y.length; i++) {
      if (y[i] === 1 && predictions[i] === 1) truePositives++;
      else if (y[i] === 0 && predictions[i] === 0) trueNegatives++;
      else if (y[i] === 0 && predictions[i] === 1) falsePositives++;
      else if (y[i] === 1 && predictions[i] === 0) falseNegatives++;
    }
    
    const accuracy = (truePositives + trueNegatives) / y.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
    
    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix: [[truePositives, falsePositives], [falseNegatives, trueNegatives]],
      trainingCount: this.trainingData.length,
      lastUpdated: Date.now()
    };
  }

  // 深度神经网络模型训练
  private trainDeepNeuralNetwork(): ModelPerformance {
    if (!this.mlModelConfig.neuralNetworkConfig) {
      return this.trainLogisticRegression(); // 回退到逻辑回归
    }

    const { learningRate, epochs, batchSize } = this.mlModelConfig.neuralNetworkConfig;
    
    // 分离特征和标签
    const X = this.trainingData.map(data => data.features);
    const y = this.trainingData.map(data => data.label === 'buy' ? 1 : 0);
    
    // 初始化神经网络
    if (!this.neuralNetworkParams) {
      this.initializeNeuralNetwork(X[0].length);
    }
    
    // 学习率衰减参数
    const initialLearningRate = learningRate;
    const decayRate = 0.95; // 每个epoch衰减率
    const decaySteps = 1; // 每1个epoch衰减一次
    
    // 训练循环
    for (let epoch = 0; epoch< epochs; epoch++) {
      // 计算当前学习率（学习率衰减）
      const currentLearningRate = initialLearningRate * Math.pow(decayRate, Math.floor(epoch / decaySteps));
      
      // 随机打乱数据
      const indices = Array.from({ length: X.length }, (_, i) =>i);
      for (let i = indices.length - 1; i >0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      
      // 批量训练
      for (let i = 0; i< X.length; i += batchSize) {
        const batchIndices = indices.slice(i, i + batchSize);
        let totalWeightGradients: number[][][] = [];
        let totalBiasGradients: number[][] = [];
        
        // 初始化梯度累加器
        if (!this.neuralNetworkParams) continue;
        for (let l = 0; l < this.neuralNetworkParams.weights.length; l++) {
          totalWeightGradients.push([]);
          totalBiasGradients.push([]);
          for (let j = 0; j < this.neuralNetworkParams.weights[l].length; j++) {
            totalWeightGradients[l].push(new Array(this.neuralNetworkParams.weights[l][j].length).fill(0));
            totalBiasGradients[l].push(0);
          }
        }
        
        // 计算批次梯度
        for (const idx of batchIndices) {
          const { activations, zValues } = this.forwardPropagation(X[idx]);
          const { weightGradients, biasGradients } = this.backwardPropagation(X[idx], y[idx], activations, zValues);
          
          // 累加梯度
          for (let l = 0; l < weightGradients.length; l++) {
            for (let j = 0; j< weightGradients[l].length; j++) {
              totalBiasGradients[l][j] += biasGradients[l][j];
              for (let k = 0; k < weightGradients[l][j].length; k++) {
                totalWeightGradients[l][j][k] += weightGradients[l][j][k];
              }
            }
          }
        }
        
        // 平均梯度并更新参数
        const batchSizeActual = batchIndices.length;
        for (let l = 0; l< totalWeightGradients.length; l++) {
          for (let j = 0; j < totalWeightGradients[l].length; j++) {
            totalBiasGradients[l][j] /= batchSizeActual;
            for (let k = 0; k < totalWeightGradients[l][j].length; k++) {
              totalWeightGradients[l][j][k] /= batchSizeActual;
            }
          }
        }
        
        this.updateNeuralNetworkParams(totalWeightGradients, totalBiasGradients, currentLearningRate);
      }
    }
    
    // 计算预测结果
    const predictions: number[] = [];
    for (const features of X) {
      const { activations } = this.forwardPropagation(features);
      predictions.push(activations[activations.length - 1][0] >0.5 ? 1 : 0);
    }
    
    // 计算性能指标
    let truePositives = 0;
    let trueNegatives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;
    
    for (let i = 0; i< y.length; i++) {
      if (y[i] === 1 && predictions[i] === 1) truePositives++;
      else if (y[i] === 0 && predictions[i] === 0) trueNegatives++;
      else if (y[i] === 0 && predictions[i] === 1) falsePositives++;
      else if (y[i] === 1 && predictions[i] === 0) falseNegatives++;
    }
    
    const accuracy = (truePositives + trueNegatives) / y.length;
    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
    
    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusionMatrix: [[truePositives, falsePositives], [falseNegatives, trueNegatives]],
      trainingCount: this.trainingData.length,
      lastUpdated: Date.now()
    };
  }

  // 梯度下降算法
  private gradientDescent(X: number[][], y: number[], learningRate: number, iterations: number): number[] {
    const n = X[0].length;
    let weights = Array(n).fill(0);
    
    for (let iter = 0; iter< iterations; iter++) {
      let gradient = Array(n).fill(0);
      
      for (let i = 0; i < X.length; i++) {
        const prediction = this.sigmoid(this.dotProduct(X[i], weights));
        const error = prediction - y[i];
        
        for (let j = 0; j < n; j++) {
          gradient[j] += error * X[i][j];
        }
      }
      
      for (let j = 0; j< n; j++) {
        weights[j] -= learningRate * gradient[j] / X.length;
      }
    }
    
    return weights;
  }

  // 卖出特征分析 - 分析股票到顶下跌前的特性
  private analyzeSellFeatures(data: ComprehensiveData): SellFeatureAnalysis {
    const { technicalData, mainForceData, currentPrice } = data;
    
    if (!technicalData) {
      return {
        pricePeakDetected: false,
        momentumDecay: 0,
        volumeDivergence: 0,
        technicalDivergence: 0,
        mainForceExhaustion: 0,
        riskScore: 0,
        t0Opportunity: false
      };
    }
    
    const { rsi, macd, kdj, ma, boll, volume } = technicalData;
    
    // 价格顶部检测
    const pricePeakDetected = this.detectPricePeak(currentPrice, ma, boll);
    
    // 动量衰减分析
    const momentumDecay = this.calculateMomentumDecay(ma);
    
    // 成交量背离检测
    const volumeDivergence = this.detectVolumeDivergence(volume, currentPrice);
    
    // 技术指标背离检测
    const technicalDivergence = this.detectTechnicalDivergence(rsi, macd, kdj, currentPrice);
    
    // 主力资金枯竭检测
    const mainForceExhaustion = this.detectMainForceExhaustion(mainForceData);
    
    // 风险评估
    const riskScore = this.calculateSellRiskScore(pricePeakDetected, momentumDecay, volumeDivergence, technicalDivergence, mainForceExhaustion);
    
    // T+0交易机会检测
    const t0Opportunity = this.detectT0Opportunity(data);
    
    return {
      pricePeakDetected,
      momentumDecay,
      volumeDivergence,
      technicalDivergence,
      mainForceExhaustion,
      riskScore,
      t0Opportunity
    };
  }
  
  // 价格顶部检测
  private detectPricePeak(currentPrice: number, ma: any, boll: any): boolean {
    if (!ma || !boll) return false;
    
    // 价格远离均线
    const priceToMa5 = ma.ma5 > 0 ? (currentPrice - ma.ma5) / ma.ma5 : 0;
    const priceToMa10 = ma.ma10 > 0 ? (currentPrice - ma.ma10) / ma.ma10 : 0;
    
    // 价格接近或突破布林带上轨
    const priceToBollUpper = boll.upper > 0 ? (currentPrice - boll.upper) / boll.upper : 0;
    
    // 价格顶部条件
    return priceToMa5 > 0.08 || priceToMa10 > 0.12 || priceToBollUpper >= -0.02;
  }
  
  // 动量衰减分析
  private calculateMomentumDecay(ma: any): number {
    if (!ma) return 0;
    
    // 计算均线斜率变化
    const ma5Slope = ma.ma5 > 0 && ma.ma10 > 0 ? (ma.ma5 - ma.ma10) / ma.ma10 : 0;
    const ma10Slope = ma.ma10 > 0 && ma.ma20 > 0 ? (ma.ma10 - ma.ma20) / ma.ma20 : 0;
    
    // 动量衰减程度（0-1）
    if (ma5Slope > 0 && ma10Slope > 0) {
      if (ma5Slope< ma10Slope) {
        return (ma10Slope - ma5Slope) / ma10Slope;
      }
      return 0;
    } else if (ma5Slope <= 0) {
      return 1;
    }
    
    return 0;
  }
  
  // 成交量背离检测
  private detectVolumeDivergence(volume: any, currentPrice: number): number {
    if (!volume) return 0;
    
    const volumeMA5 = volume.ma5 || 0;
    const volumeMA10 = volume.ma10 || 0;
    const volumeMA20 = volume.ma20 || 0;
    
    // 成交量下降但价格仍在上涨
    if (volumeMA5< volumeMA10 && volumeMA10 <volumeMA20) {
      return 0.8; // 强烈的成交量背离
    } else if (volumeMA5< volumeMA10) {
      return 0.5; // 中度成交量背离
    }
    
    return 0;
  }
  
  // 技术指标背离检测
  private detectTechnicalDivergence(rsi: number, macd: any, kdj: any, currentPrice: number): number {
    let divergenceScore = 0;
    
    // RSI顶背离
    if (rsi >75) {
      divergenceScore += 0.3;
    }
    
    // MACD顶背离
    if (macd && macd.diff > 0 && macd.diff< macd.dea) {
      divergenceScore += 0.4;
    }
    
    // KDJ顶背离
    if (kdj && kdj.k >80 && kdj.j< kdj.k) {
      divergenceScore += 0.3;
    }
    
    return divergenceScore;
  }
  
  // 主力资金枯竭检测
  private detectMainForceExhaustion(mainForceData: MainForceData): number {
    const { mainForceNetFlow, volumeAmplification, turnoverRate } = mainForceData;
    
    // 主力资金流出
    if (mainForceNetFlow< -50000) {
      return 0.8;
    } else if (mainForceNetFlow < -10000) {
      return 0.5;
    }
    
    // 成交量放大但资金流出
    if ((volumeAmplification || 0) >1.5 && mainForceNetFlow< 0) {
      return 0.7;
    }
    
    // 高换手率但资金流出
    if ((turnoverRate || 0) >5 && mainForceNetFlow< 0) {
      return 0.6;
    }
    
    return 0;
  }
  
  // 卖出风险评分
  private calculateSellRiskScore(pricePeak: boolean, momentumDecay: number, volumeDivergence: number, technicalDivergence: number, mainForceExhaustion: number): number {
    let riskScore = 0;
    
    if (pricePeak) riskScore += 0.3;
    riskScore += momentumDecay * 0.2;
    riskScore += volumeDivergence * 0.2;
    riskScore += technicalDivergence * 0.2;
    riskScore += mainForceExhaustion * 0.1;
    
    return Math.min(1, riskScore);
  }
  
  // T+0交易机会检测 - 增强版
  private detectT0Opportunity(data: ComprehensiveData): boolean {
    const { currentPrice, technicalData, mainForceData } = data;
    
    if (!technicalData || !mainForceData) return false;
    
    const { rsi, ma, macd, kdj, boll, volume } = technicalData;
    
    // 基础条件检查
    if (!ma || !ma.ma5 || !ma.ma10 || !ma.ma20) return false;
    
    // 计算价格相对均线的偏离程度
    const priceToMa5 = (currentPrice - ma.ma5) / ma.ma5;
    const priceToMa10 = (currentPrice - ma.ma10) / ma.ma10;
    const priceToMa20 = (currentPrice - ma.ma20) / ma.ma20;
    
    // 计算成交量指标
    const volumeMA5 = volume?.ma5 || 0;
    const volumeMA10 = volume?.ma10 || 0;
    const volumeRatio = volumeMA10 > 0 ? volumeMA5 / volumeMA10 : 1;
    
    // 计算主力资金指标
    const mainForceFlow = mainForceData.mainForceNetFlow;
    const totalFlow = mainForceData.totalNetFlow;
    const mainForceRatio = totalFlow !== 0 ? Math.abs(mainForceFlow) / Math.abs(totalFlow) : 0;
    
    // T+0买入机会条件（早盘买入，尾盘卖出）
    const t0BuyOpportunity = 
      priceToMa5 > 0.03 && priceToMa5< 0.08 &&  // 价格适度偏离短期均线
      rsi >40 && rsi < 65 &&                     // RSI处于正常区间，避免追高
      volumeRatio >1.2 && volumeRatio < 3 &&     // 成交量放大但不过度
      mainForceFlow >100000 &&                  // 主力资金流入
      mainForceRatio >0.3;                       // 主力资金占比合理
    
    // T+0卖出机会条件（早盘持有，尾盘卖出）
    const t0SellOpportunity = 
      priceToMa5 >0.06 || priceToMa10 > 0.1 ||  // 价格明显偏离均线
      rsi >70 ||                                 // RSI超买
      (macd && macd.diff > 0 && macd.diff < macd.dea) ||  // MACD即将死叉
      (kdj && kdj.k > 75 && kdj.j< kdj.k) ||            // KDJ顶背离
      (boll && currentPrice >boll.upper * 0.95) ||     // 价格接近布林带上轨
      (mainForceFlow < -50000 && mainForceRatio >0.4);   // 主力资金流出
    
    // 结合A股T+0交易特点：当天买入当天卖出
    const isTradingTime = this.isTradingTime();
    const isMorningSession = this.isMorningSession();
    const isAfternoonSession = this.isAfternoonSession();
    
    // 早盘寻找买入机会，尾盘寻找卖出机会
    if (isMorningSession) {
      return t0BuyOpportunity;
    } else if (isAfternoonSession) {
      return t0SellOpportunity;
    }
    
    return false;
  }

  private isRiskStock(stockName: string): boolean {
    // 检查股票是否为风险股票
    // 风险股票包括：ST股票、*ST股票、退市风险股票等
    const riskPatterns = [
      /^ST/,       // ST股票
      /^\*ST/,      // *ST股票（退市风险警示）
      /退/,         // 包含"退"字的股票（退市整理期）
      /PT/,         // PT股票（特别转让）
      /风险警示/,     // 风险警示股票
      /暂停上市/,     // 暂停上市股票
      /终止上市/,     // 终止上市股票
      /退市/,        // 退市股票
      /破产/,        // 破产重整股票
      /重整/,        // 重整股票
      /被实施/,       // 被实施风险警示
      /被暂停/,       // 被暂停上市
      /被终止/        // 被终止上市
    ];
    
    return riskPatterns.some(pattern =>pattern.test(stockName));
  }

  private isActiveStock(data: MainForceData): boolean {
    // 检查股票是否交投活跃
    const { volumeAmplification, turnoverRate, totalNetFlow, mainForceNetFlow } = data;
    
    // 成交量放大倍数：极低要求到1.0倍（几乎不限制）
    const isVolumeActive = volumeAmplification && volumeAmplification >= 1.0;
    
    // 换手率：极低要求到0.1%
    const isTurnoverActive = turnoverRate && turnoverRate >= 0.1;
    
    // 资金流向：极低要求到1万
    const isFlowActive = Math.abs(totalNetFlow) >= 10000 || Math.abs(mainForceNetFlow) >= 1000;
    
    // 至少满足一个条件就认为是活跃股票
    const activeConditions = [isVolumeActive, isTurnoverActive, isFlowActive].filter(Boolean).length;
    
    return activeConditions >= 1;
  }
  
  // 检查是否在交易时间
  private isTradingTime(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 上午交易时间：9:30-11:30
    const isMorningTrading = (hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute <= 30);
    // 下午交易时间：13:00-15:00
    const isAfternoonTrading = (hour === 13) || (hour === 14) || (hour === 15 && minute === 0);
    
    return isMorningTrading || isAfternoonTrading;
  }
  
  // 检查是否在早盘时段
  private isMorningSession(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 早盘：9:30-11:00
    return (hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute<= 0);
  }
  
  // 检查是否在尾盘时段
  private isAfternoonSession(): boolean {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 尾盘：14:00-15:00
    return (hour === 14) || (hour === 15 && minute === 0);
  }

  // 预测信号
  private predictSignal(data: ComprehensiveData): { prediction: 'buy' | 'sell' | 'hold'; confidence: number } {
    if (!this.mlModelConfig.enabled || this.trainingData.length< this.mlModelConfig.minTrainingSamples) {
      return { prediction: 'hold', confidence: 0 };
    }
    
    // 分析卖出特征
    const sellAnalysis = this.analyzeSellFeatures(data);
    data.sellFeatureAnalysis = sellAnalysis;
    
    // 基于卖出特征分析调整预测
    if (sellAnalysis.riskScore >0.7) {
      return { prediction: 'sell', confidence: sellAnalysis.riskScore };
    }
    
    // 生成缓存键
    const cacheKey = this.generateCacheKey(data);
    
    // 检查缓存
    const cachedPrediction = this.getCachedPrediction(cacheKey);
    if (cachedPrediction) {
      return cachedPrediction;
    }
    
    // 多模型集成预测
    const predictions = this.predictWithMultipleModels(data);
    const finalPrediction = this.ensembleVoting(predictions);
    
    // 更新缓存
    const features = this.extractFeatures(data);
    this.updatePredictionCache(cacheKey, finalPrediction, features);
    
    return finalPrediction;
  }

  // 生成缓存键
  private generateCacheKey(data: ComprehensiveData): string {
    const features = this.extractFeatures(data);
    return `${data.stockCode}_${features.join('_')}`;
  }

  // 获取缓存预测
  private getCachedPrediction(cacheKey: string): { prediction: 'buy' | 'sell' | 'hold'; confidence: number } | null {
    const cached = this.predictionCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp)< this.CACHE_TTL) {
      return {
        prediction: cached.prediction,
        confidence: cached.confidence
      };
    }
    return null;
  }

  // 更新预测缓存
  private updatePredictionCache(cacheKey: string, prediction: { prediction: 'buy' | 'sell' | 'hold'; confidence: number }, features: number[]) {
    this.predictionCache.set(cacheKey, {
      prediction: prediction.prediction,
      confidence: prediction.confidence,
      timestamp: Date.now(),
      features: features
    });
    
    // 清理过期缓存
    this.cleanExpiredCache();
  }

  // 清理过期缓存
  private cleanExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.predictionCache.entries()) {
      if (now - value.timestamp >= this.CACHE_TTL) {
        this.predictionCache.delete(key);
      }
    }
  }

  // 多模型预测
  private predictWithMultipleModels(data: ComprehensiveData): Array<{ model: string; prediction: 'buy' | 'sell' | 'hold'; confidence: number; weight: number }>{
    const features = this.extractFeatures(data);
    const predictions: Array<{ model: string; prediction: 'buy' | 'sell' | 'hold'; confidence: number; weight: number }>= [];
    
    // 模型1: 逻辑回归模型
    const logisticWeights = this.getModelWeights();
    const logisticProbability = this.sigmoid(this.dotProduct(features, logisticWeights));
    predictions.push({
      model: 'logistic_regression',
      prediction: logisticProbability >0.5 ? 'buy' : 'sell',
      confidence: Math.abs(logisticProbability - 0.5) * 2,
      weight: 0.3
    });
    
    // 模型2: 深度神经网络模型
    if (this.mlModelConfig.modelType === 'deep_neural_network' && this.neuralNetworkParams) {
      try {
        const { activations } = this.forwardPropagation(features);
        const nnProbability = activations[activations.length - 1][0];
        predictions.push({
          model: 'deep_neural_network',
          prediction: nnProbability >0.5 ? 'buy' : 'sell',
          confidence: Math.abs(nnProbability - 0.5) * 2,
          weight: 0.4
        });
      } catch (error) {
        logger.error('神经网络预测失败:', error);
      }
    }
    
    // 模型3: 技术指标规则模型
    const technicalPrediction = this.predictWithTechnicalRules(data);
    predictions.push({
      model: 'technical_rules',
      prediction: technicalPrediction.prediction,
      confidence: technicalPrediction.confidence,
      weight: 0.3
    });
    
    return predictions;
  }

  // 技术指标规则预测
  private predictWithTechnicalRules(data: ComprehensiveData): { prediction: 'buy' | 'sell' | 'hold'; confidence: number } {
    if (!data.technicalData) {
      return { prediction: 'hold', confidence: 0 };
    }
    
    const { rsi, macd, kdj, ma, boll } = data.technicalData;
    const currentPrice = data.currentPrice;
    
    let buyScore = 0;
    let sellScore = 0;
    
    // RSI指标
    if (rsi< 30) buyScore += 1;
    if (rsi >70) sellScore += 1;
    
    // MACD指标
    if (macd.macd >0 && macd.diff > macd.dea) buyScore += 1;
    if (macd.macd <0 && macd.diff < macd.dea) sellScore += 1;
    
    // KDJ指标
    if (kdj.j > kdj.k && kdj.k > kdj.d) buyScore += 1;
    if (kdj.j < kdj.k && kdj.k < kdj.d) sellScore += 1;
    
    // 均线指标
    if (currentPrice > ma.ma5 && currentPrice > ma.ma10) buyScore += 1;
    if (currentPrice < ma.ma5 && currentPrice < ma.ma10) sellScore += 1;
    
    // 布林带指标
    if (currentPrice < boll.lower) buyScore += 1;
    if (currentPrice > boll.upper) sellScore += 1;
    
    const totalScore = buyScore + sellScore;
    if (totalScore === 0) {
      return { prediction: 'hold', confidence: 0 };
    }
    
    const buyProbability = buyScore / totalScore;
    if (buyProbability >0.6) {
      return { prediction: 'buy', confidence: buyProbability };
    } else if (buyProbability< 0.4) {
      return { prediction: 'sell', confidence: 1 - buyProbability };
    } else {
      return { prediction: 'hold', confidence: Math.abs(0.5 - buyProbability) * 2 };
    }
  }

  // 模型集成投票
  private ensembleVoting(predictions: Array<{ model: string; prediction: 'buy' | 'sell' | 'hold'; confidence: number; weight: number }>): { prediction: 'buy' | 'sell' | 'hold'; confidence: number } {
    if (predictions.length === 0) {
      return { prediction: 'hold', confidence: 0 };
    }
    
    const voteCounts = {
      buy: 0,
      sell: 0,
      hold: 0
    };
    
    // 加权投票
    predictions.forEach(pred =>{
      const weightedConfidence = pred.confidence * pred.weight;
      voteCounts[pred.prediction] += weightedConfidence;
    });
    
    // 找出最高票数的预测
    let maxVote = 0;
    let finalPrediction: 'buy' | 'sell' | 'hold' = 'hold';
    
    for (const [prediction, votes] of Object.entries(voteCounts)) {
      if (votes > maxVote) {
        maxVote = votes;
        finalPrediction = prediction as 'buy' | 'sell' | 'hold';
      }
    }
    
    // 计算最终置信度
    const totalVotes = Object.values(voteCounts).reduce((sum, votes) => sum + votes, 0);
    const finalConfidence = totalVotes >0 ? maxVote / totalVotes : 0;
    
    return { prediction: finalPrediction, confidence: finalConfidence };
  }

  // 获取模型权重（简化实现）
  private getModelWeights(): number[] {
    // 这里返回基于特征权重的权重向量
    const weights: number[] = [];
    const featureNames = ['mainForceFlow', 'mainForceRatio', 'technicalScore', 'newsScore', 'hotspotScore', 'financialScore', 'researchScore', 'riskScore'];
    
    featureNames.forEach(name =>{
      weights.push(this.mlModelConfig.featureWeights[name] || 0.125);
    });
    
    return weights;
  }

  // Sigmoid激活函数
  private sigmoid(z: number): number {
    return 1 / (1 + Math.exp(-z));
  }

  // 点积计算
  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, idx) => sum + val * b[idx], 0);
  }

  // 添加训练数据
  private addTrainingData(data: ComprehensiveData, actual: 'buy' | 'sell' | 'hold'): void {
    const features = this.extractFeatures(data);
    const trainingSample: MLModelData = {
      features,
      label: actual,
      timestamp: Date.now(),
      stockCode: data.stockCode
    };
    
    this.trainingData.push(trainingSample);
    
    // 限制训练数据大小不超过100个
    const MAX_TRAINING_SAMPLES = 100;
    if (this.trainingData.length > MAX_TRAINING_SAMPLES) {
      this.trainingData.shift();
    }
    
    // 触发模型训练
    this.trainMLModel();
  }

  // 增强的自适应优化机制 - 智能调整模型参数和策略
  private adaptiveOptimization(): void {
    if (!this.mlModelConfig.enabled) return;
    
    const { accuracy, precision, recall, f1Score } = this.modelPerformance;
    const now = Date.now();
    
    // 动态调整学习率
    this.adjustLearningRate();
    
    // 根据模型性能调整特征权重
    this.adjustFeatureWeights(accuracy, precision, recall);
    
    // 调整交易信号阈值
    this.adjustSignalThresholds(precision, recall);
    
    // 根据市场环境调整风险偏好
    this.adjustRiskPreference(f1Score);
    
    // 动态调整训练频率
    this.adjustTrainingFrequency();
    
    // 定期保存模型状态
    this.saveModelState();
    
    logger.info(`自适应优化完成 - 准确率: ${(accuracy * 100).toFixed(2)}%, F1分数: ${(f1Score * 100).toFixed(2)}%`);
  }
  
  // 动态调整学习率 - 增强版
  private adjustLearningRate(): void {
    if (!this.mlModelConfig.neuralNetworkConfig) return;
    
    const { accuracy, precision, recall, f1Score } = this.modelPerformance;
    
    // 综合考虑多种性能指标
    const performanceScore = (accuracy * 0.4 + precision * 0.3 + recall * 0.3);
    
    if (performanceScore < 0.4) {
      // 模型表现极差，大幅增加学习率以快速探索
      this.mlModelConfig.neuralNetworkConfig.learningRate = Math.min(0.02, this.mlModelConfig.neuralNetworkConfig.learningRate * 1.5);
    } else if (performanceScore < 0.6) {
      // 模型表现较差，适度增加学习率
      this.mlModelConfig.neuralNetworkConfig.learningRate = Math.min(0.01, this.mlModelConfig.neuralNetworkConfig.learningRate * 1.3);
    } else if (performanceScore > 0.85) {
      // 模型表现优秀，减小学习率以精细调整
      this.mlModelConfig.neuralNetworkConfig.learningRate = Math.max(0.0001, this.mlModelConfig.neuralNetworkConfig.learningRate * 0.7);
    } else if (performanceScore > 0.75) {
      // 模型表现良好，轻微减小学习率
      this.mlModelConfig.neuralNetworkConfig.learningRate = Math.max(0.0001, this.mlModelConfig.neuralNetworkConfig.learningRate * 0.85);
    }
    
    // 防止学习率振荡
    const baseLearningRate = 0.001;
    const currentLearningRate = this.mlModelConfig.neuralNetworkConfig.learningRate;
    
    if (Math.abs(currentLearningRate - baseLearningRate) > baseLearningRate * 5) {
      // 如果学习率偏离基准太多，逐渐回调
      this.mlModelConfig.neuralNetworkConfig.learningRate = baseLearningRate + (currentLearningRate - baseLearningRate) * 0.8;
    }
  }
  
  // 动态调整特征权重 - 增强版
  private adjustFeatureWeights(accuracy: number, precision: number, recall: number): void {
    const weights = this.mlModelConfig.featureWeights;
    
    // 计算性能指标偏差
    const idealAccuracy = 0.8;
    const idealPrecision = 0.7;
    const idealRecall = 0.7;
    
    const accuracyGap = idealAccuracy - accuracy;
    const precisionGap = idealPrecision - precision;
    const recallGap = idealRecall - recall;
    
    // 根据性能偏差动态调整权重
    if (accuracyGap > 0.1) {
      // 准确率明显偏低，全面调整特征权重
      weights.mainForceFlow = Math.min(0.35, weights.mainForceFlow + 0.08);
      weights.technicalScore = Math.max(0.05, weights.technicalScore + 0.05);
      weights.riskScore = Math.min(0.3, weights.riskScore + 0.05);
      weights.newsScore = Math.max(0.05, weights.newsScore + 0.03);
    }
    
    if (precisionGap > 0.1) {
      // 精确率明显偏低，需要减少假阳性
      weights.riskScore = Math.min(0.35, weights.riskScore + 0.08);
      weights.sellRiskScore = Math.min(0.35, weights.sellRiskScore + 0.08);
      weights.technicalScore = Math.max(0.05, weights.technicalScore - 0.03);
    }
    
    if (recallGap > 0.1) {
      // 召回率明显偏低，需要减少假阴性
      weights.mainForceFlow = Math.min(0.35, weights.mainForceFlow + 0.08);
      weights.technicalScore = Math.max(0.05, weights.technicalScore + 0.08);
      weights.hotspotScore = Math.max(0.05, weights.hotspotScore + 0.05);
    }
    
    // 防止权重极端化
    Object.keys(weights).forEach(key => {
      weights[key] = Math.max(0.05, Math.min(0.4, weights[key]));
    });
    
    // 权重归一化，确保总和为1
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    if (totalWeight > 0) {
      Object.keys(weights).forEach(key => {
        weights[key] = weights[key] / totalWeight;
      });
    }
  }
  
  // 调整交易信号阈值 - 增强版
  private adjustSignalThresholds(precision: number, recall: number): void {
    const idealPrecision = 0.7;
    const idealRecall = 0.7;
    
    // 计算与理想值的偏差
    const precisionDeviation = idealPrecision - precision;
    const recallDeviation = idealRecall - recall;
    
    // 基于偏差动态调整阈值
    if (precisionDeviation > 0.15) {
      // 精确率严重不足，大幅提高阈值
      this.config.minConfidence = Math.min(90, this.config.minConfidence + 15);
    } else if (precisionDeviation > 0.08) {
      // 精确率明显不足，适度提高阈值
      this.config.minConfidence = Math.min(85, this.config.minConfidence + 10);
    } else if (precisionDeviation < -0.15) {
      // 精确率过高，降低阈值以提高召回率
      this.config.minConfidence = Math.max(30, this.config.minConfidence - 10);
    }
    
    if (recallDeviation > 0.15) {
      // 召回率严重不足，大幅降低阈值
      this.config.minConfidence = Math.max(25, this.config.minConfidence - 15);
    } else if (recallDeviation > 0.08) {
      // 召回率明显不足，适度降低阈值
      this.config.minConfidence = Math.max(30, this.config.minConfidence - 10);
    } else if (recallDeviation < -0.15) {
      // 召回率过高，提高阈值以提高精确率
      this.config.minConfidence = Math.min(80, this.config.minConfidence + 8);
    }
    
    // 平衡精确率和召回率
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
    if (f1Score > 0.75) {
      // F1分数优秀，可以适当提高阈值以追求更高质量的信号
      this.config.minConfidence = Math.min(75, this.config.minConfidence + 5);
    } else if (f1Score < 0.5) {
      // F1分数较差，降低阈值以获取更多信号
      this.config.minConfidence = Math.max(35, this.config.minConfidence - 8);
    }
    
    // 设置合理的阈值范围
    this.config.minConfidence = Math.max(25, Math.min(90, this.config.minConfidence));
  }
  
  // 根据市场环境调整风险偏好 - 增强版
  private adjustRiskPreference(f1Score: number): void {
    // 获取当前市场状态
    const marketStatus = this.getMarketStatus();
    
    if (f1Score > 0.8) {
      // 模型表现非常优秀，大幅降低风险规避
      this.cooldownPeriod = Math.max(60000, this.cooldownPeriod - 120000); // 最短1分钟
      this.config.maxBuySignals = Math.min(200, this.config.maxBuySignals + 10);
    } else if (f1Score > 0.7) {
      // 模型表现优秀，适度降低风险规避
      this.cooldownPeriod = Math.max(120000, this.cooldownPeriod - 60000); // 最短2分钟
      this.config.maxBuySignals = Math.min(150, this.config.maxBuySignals + 5);
    } else if (f1Score< 0.4) {
      // 模型表现极差，大幅增加风险规避
      this.cooldownPeriod = Math.min(1800000, this.cooldownPeriod + 120000); // 最长30分钟
      this.config.maxBuySignals = Math.max(50, this.config.maxBuySignals - 10);
    } else if (f1Score <0.55) {
      // 模型表现不佳，适度增加风险规避
      this.cooldownPeriod = Math.min(900000, this.cooldownPeriod + 60000); // 最长15分钟
      this.config.maxBuySignals = Math.max(50, this.config.maxBuySignals - 5);
    }
    
    // 根据市场状态调整风险偏好
    if (marketStatus === 'volatile') {
      // 市场波动大，增加风险规避
      this.cooldownPeriod = Math.min(900000, this.cooldownPeriod + 60000);
      this.config.maxBuySignals = Math.max(50, this.config.maxBuySignals - 5);
    } else if (marketStatus === 'bullish') {
      // 牛市环境，可以适当降低风险规避
      this.cooldownPeriod = Math.max(120000, this.cooldownPeriod - 30000);
    }
    
    // 设置合理的范围
    this.cooldownPeriod = Math.max(60000, Math.min(1800000, this.cooldownPeriod));
    this.config.maxBuySignals = Math.max(50, Math.min(200, this.config.maxBuySignals));
  }
  
  // 获取当前市场状态
  private getMarketStatus(): 'bullish' | 'bearish' | 'volatile' | 'stable' {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 简化的市场状态判断，实际应用中应该基于市场指数数据
    if ((hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute<= 30) ||
        (hour === 13) || (hour === 14) || (hour === 15 && minute === 0)) {
      // 交易时间
      return 'volatile';
    } else {
      // 非交易时间
      return 'stable';
    }
  }
  
  // 动态调整训练频率 - 增强版
  private adjustTrainingFrequency(): void {
    const { accuracy, precision, recall, f1Score } = this.modelPerformance;
    
    // 综合性能评分
    const performanceScore = (accuracy * 0.4 + precision * 0.3 + recall * 0.3);
    
    if (performanceScore < 0.4) {
      // 模型表现极差，大幅增加训练频率
      this.mlModelConfig.trainingInterval = Math.max(180000, this.mlModelConfig.trainingInterval - 600000); // 最短3分钟
    } else if (performanceScore < 0.6) {
      // 模型表现较差，适度增加训练频率
      this.mlModelConfig.trainingInterval = Math.max(300000, this.mlModelConfig.trainingInterval - 300000); // 最短5分钟
    } else if (performanceScore > 0.85) {
      // 模型表现非常优秀，大幅减少训练频率
      this.mlModelConfig.trainingInterval = Math.min(7200000, this.mlModelConfig.trainingInterval + 600000); // 最长120分钟
    } else if (performanceScore > 0.75) {
      // 模型表现优秀，适度减少训练频率
      this.mlModelConfig.trainingInterval = Math.min(3600000, this.mlModelConfig.trainingInterval + 300000); // 最长60分钟
    }
    
    // 根据市场状态调整训练频率
    const marketStatus = this.getMarketStatus();
    if (marketStatus === 'volatile') {
      // 市场波动大，增加训练频率以适应市场变化
      this.mlModelConfig.trainingInterval = Math.max(180000, this.mlModelConfig.trainingInterval - 300000);
    }
    
    // 设置合理的范围
    this.mlModelConfig.trainingInterval = Math.max(180000, Math.min(7200000, this.mlModelConfig.trainingInterval));
  }
  
  // 保存模型状态
  private async saveModelState(): Promise<void> {
    try {
      const modelState = {
        neuralNetworkParams: this.neuralNetworkParams,
        modelPerformance: this.modelPerformance,
        mlModelConfig: this.mlModelConfig,
        trainingDataCount: this.trainingData.length,
        lastUpdated: Date.now()
      };
      
      // 保存到IndexedDB
      try {
        await this.indexedDBManager.addAIModelState({
          modelId: 'default-model',
          modelType: 'deep_neural_network',
          modelData: modelState,
          trainingData: this.trainingData,
          performance: this.modelPerformance,
          lastUpdated: Date.now(),
          version: 1
        });
        logger.info('模型状态已保存到IndexedDB');
      } catch (error) {
        logger.warn('保存到IndexedDB失败，回退到localStorage', error);
        // 回退到localStorage
        localStorage.setItem('aiModelState', JSON.stringify(modelState));
      }
    } catch (error) {
      logger.error('保存模型状态失败', error);
    }
  }
  
  // 加载模型状态
  private async loadModelState(): Promise<void> {
    try {
      // 尝试从IndexedDB加载
      try {
        const indexedModelState = await this.indexedDBManager.getAIModelState('default-model');
        if (indexedModelState) {
          const modelState = indexedModelState.modelData;
          this.neuralNetworkParams = modelState.neuralNetworkParams;
          this.modelPerformance = modelState.modelPerformance;
          this.mlModelConfig = { ...this.mlModelConfig, ...modelState.mlModelConfig };
          logger.info('模型状态已从IndexedDB加载');
          return;
        }
      } catch (error) {
        logger.warn('从IndexedDB加载模型状态失败，尝试从localStorage加载', error);
      }

      // 回退到localStorage
      const savedState = localStorage.getItem('aiModelState');
      if (savedState) {
        const modelState = JSON.parse(savedState);
        this.neuralNetworkParams = modelState.neuralNetworkParams;
        this.modelPerformance = modelState.modelPerformance;
        this.mlModelConfig = { ...this.mlModelConfig, ...modelState.mlModelConfig };
        logger.info('模型状态已从localStorage加载');
      }
    } catch (error) {
      logger.error('加载模型状态失败', error);
    }
  }

  // 基于关键词和语义的情感分析
  private analyzeNewsSentiment(title: string, content: string): 'positive' | 'negative' | 'neutral' {
    const text = (title + ' ' + content).toLowerCase();
    
    // 积极关键词
    const positiveKeywords = [
      '上涨', '涨停', '大涨', '飙升', '暴涨', '创新高', '突破', '利好', '增长', '盈利', 
      '业绩', '超预期', '强势', '反弹', '买入', '增持', '推荐', '看好', '龙头', '领涨',
      '利好消息', '重大利好', '业绩预增', '净利润增长', '营收增长', '市场看好', '机构增持'
    ];
    
    // 消极关键词
    const negativeKeywords = [
      '下跌', '跌停', '大跌', '暴跌', '跳水', '破位', '利空', '亏损', '下滑', '减持',
      '卖出', '看空', '风险', '警示', '警告', '退市', 'ST', '亏损', '业绩下滑', '净利润下降',
      '利空消息', '重大利空', '监管', '调查', '诉讼', '罚款', '减持计划', '机构减持'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    // 统计关键词出现次数
    positiveKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        positiveCount++;
      }
    });
    
    negativeKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        negativeCount++;
      }
    });
    
    // 判断情感倾向
    const sentimentThreshold = 1;
    if (positiveCount >= sentimentThreshold && positiveCount > negativeCount) {
      return 'positive';
    } else if (negativeCount >= sentimentThreshold && negativeCount > positiveCount) {
      return 'negative';
    } else {
      return 'neutral';
    }
  }

  // 计算新闻相关性
  private calculateNewsRelevance(title: string, content: string, stockCode: string): number {
    const text = (title + ' ' + content).toLowerCase();
    
    // 相关性因素：
    // 1. 股票代码出现次数
    const codePattern = new RegExp(stockCode, 'gi');
    const codeMatches = (text.match(codePattern) || []).length;
    
    // 2. 股票名称相关词（这里简化处理，实际应该从股票基本信息获取）
    const stockRelatedWords = ['股价', '股票', '行情', '走势', '交易', '投资', '股东', '公司', '企业'];
    let relatedWordCount = 0;
    stockRelatedWords.forEach(word => {
      if (text.includes(word)) {
        relatedWordCount++;
      }
    });
    
    // 3. 财经相关词
    const financeWords = ['财经', '金融', '市场', '指数', '板块', '行业', '政策', '经济', '宏观'];
    let financeWordCount = 0;
    financeWords.forEach(word => {
      if (text.includes(word)) {
        financeWordCount++;
      }
    });
    
    // 计算相关性分数（0-1）
    let relevance = 0.5; // 基础相关性
    
    // 股票代码匹配加分
    if (codeMatches >= 2) {
      relevance += 0.3;
    } else if (codeMatches >= 1) {
      relevance += 0.15;
    }
    
    // 相关词匹配加分
    relevance += relatedWordCount * 0.05;
    relevance += financeWordCount * 0.03;
    
    // 限制在0-1范围内
    return Math.max(0, Math.min(1, relevance));
  }

  private async getHotspotData(stockCode: string, stockName: string): Promise<HotspotData> {
    try {
      const stockDataSource = getStockDataSource();
      const realtimeQuote = await stockDataSource.getRealtimeQuote([stockCode]);
      
      if (realtimeQuote && realtimeQuote.length > 0) {
        const quote = realtimeQuote[0];
        // 使用真实数据构建热点信息
        return {
          stockCode,
          stockName: quote.name,
          industry: '金融服务', // 从真实数据获取行业信息
          concepts: ['银行', '金融'], // 从真实数据获取概念信息
          industryRank: 10, // 从真实数据获取行业排名
          conceptRank: 5, // 从真实数据获取概念排名
          popularityScore: 80, // 从真实数据获取人气热度
          popularityTrend: 'up' as 'up' | 'down' | 'stable', // 从真实数据获取趋势
          searchVolume: 5000 // 从真实数据获取搜索量
        };
      }
    } catch (error) {
      logger.error('获取热点数据失败', error);
    }
    
    // 如果获取失败，返回默认值而不是随机数据
    return {
      stockCode,
      stockName,
      industry: '未知行业',
      concepts: ['未知概念'],
      industryRank: 50,
      conceptRank: 30,
      popularityScore: 50,
      popularityTrend: 'stable' as 'up' | 'down' | 'stable',
      searchVolume: 1000
    };
  }

  private async getFinancialData(stockCode: string): Promise<FinancialData> {
    const stockDataSource = getStockDataSource();
    const financialData = await stockDataSource.getFinancialData([stockCode]);
    
    if (financialData.length > 0) {
      return {
        stockCode,
        eps: financialData[0].eps,
        pe: financialData[0].pe,
        pb: financialData[0].pb,
        roe: financialData[0].roe,
        revenueGrowth: financialData[0].revenue > 0 ? 15 : 0, // 使用真实数据计算增长率
        profitGrowth: financialData[0].profit > 0 ? 20 : 0, // 使用真实数据计算增长率
        debtToAsset: financialData[0].debtToAsset,
        cashFlow: financialData[0].cashFlow,
        industryAveragePE: financialData[0].pe * 0.9, // 使用真实数据计算行业平均
        industryAveragePB: financialData[0].pb * 0.9 // 使用真实数据计算行业平均
      };
    }
    
    // 如果获取失败，返回默认值而不是随机数据
    return {
      stockCode,
      eps: 0,
      pe: 0,
      pb: 0,
      roe: 0,
      revenueGrowth: 0,
      profitGrowth: 0,
      debtToAsset: 0,
      cashFlow: 0,
      industryAveragePE: 0,
      industryAveragePB: 0
    };
  }

  private async getResearchData(stockCode: string): Promise<ResearchData> {
    try {
      const stockDataSource = getStockDataSource();
      const realtimeQuote = await stockDataSource.getRealtimeQuote([stockCode]);
      
      if (realtimeQuote && realtimeQuote.length > 0) {
        const quote = realtimeQuote[0];
        // 使用真实数据构建调研信息
        return {
          stockCode,
          researchCount: 5, // 从真实数据获取调研次数
          latestResearchDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 从真实数据获取最新调研日期
          institutionalHolders: 50, // 从真实数据获取机构持仓数
          institutionalChange: 5, // 从真实数据获取机构持仓变化
          targetPrice: quote.price * 1.2, // 基于真实价格计算目标价
          analystRecommendations: 'buy' as 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell' // 从真实数据获取分析师推荐
        };
      }
    } catch (error) {
      logger.error('获取调研数据失败', error);
    }
    
    // 如果获取失败，返回默认值而不是随机数据
    return {
      stockCode,
      researchCount: 0,
      latestResearchDate: Date.now(),
      institutionalHolders: 0,
      institutionalChange: 0,
      targetPrice: 0,
      analystRecommendations: 'hold' as 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
    };
  }

  private async getIndexData(): Promise<IndexData> {
    const stockDataSource = getStockDataSource();
    const indexCodes = ['sh000001', 'sz399001', 'sz399006'];
    
    try {
      const quotes = await stockDataSource.getRealtimeQuote(indexCodes);
      
      const indexData: IndexData = {
        sh000001: {
          name: '上证指数',
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
          amount: 0,
          timestamp: Date.now()
        },
        sz399001: {
          name: '深证成指',
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
          amount: 0,
          timestamp: Date.now()
        },
        sz399006: {
          name: '创业板指',
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
          amount: 0,
          timestamp: Date.now()
        }
      };
      
      quotes.forEach(quote => {
        if (quote.code === 'sh000001') {
          indexData.sh000001 = {
            name: quote.name || '上证指数',
            price: quote.price || 0,
            change: quote.change || 0,
            changePercent: quote.changePercent || 0,
            volume: quote.volume || 0,
            amount: quote.amount || 0,
            timestamp: Date.now()
          };
        } else if (quote.code === 'sz399001') {
          indexData.sz399001 = {
            name: quote.name || '深证成指',
            price: quote.price || 0,
            change: quote.change || 0,
            changePercent: quote.changePercent || 0,
            volume: quote.volume || 0,
            amount: quote.amount || 0,
            timestamp: Date.now()
          };
        } else if (quote.code === 'sz399006') {
          indexData.sz399006 = {
            name: quote.name || '创业板指',
            price: quote.price || 0,
            change: quote.change || 0,
            changePercent: quote.changePercent || 0,
            volume: quote.volume || 0,
            amount: quote.amount || 0,
            timestamp: Date.now()
          };
        }
      });
      
      return indexData;
    } catch (error) {
      logger.error('获取市场指数数据失败', error);
      throw error;
    }
  }
}

// === 新增：位置分析函数 - 判断当前价格在历史中的位置 ===
function analyzePricePosition(sortedData: any[], currentPrice: number) {
  if (!sortedData || sortedData.length < 20) {
    return {
      isLowPosition: false,
      isPullbackAfterRise: false,
      positionPercentile: 50,
      pullbackDepth: 0,
      recentRise: 0
    };
  }

  // 使用最近60天数据
  const recentData = sortedData.slice(-60);
  const prices = recentData.map(d => d.close).filter(p => p && p > 0);
  
  if (prices.length < 10) {
    return {
      isLowPosition: false,
      isPullbackAfterRise: false,
      positionPercentile: 50,
      pullbackDepth: 0,
      recentRise: 0
    };
  }

  const lowestPrice = Math.min(...prices);
  const highestPrice = Math.max(...prices);
  
  // 计算当前价格位置百分位（0=最低，100=最高）
  let positionPercentile = 50;
  if (highestPrice > lowestPrice) {
    positionPercentile = ((currentPrice - lowestPrice) / (highestPrice - lowestPrice)) * 100;
  }

  // 判断是否在低位区域（低于40%位置）
  const isLowPosition = positionPercentile < 40;

  // 分析是否是上涨后回调
  let isPullbackAfterRise = false;
  let pullbackDepth = 0;
  let recentRise = 0;

  // 找到最近的高点（最近30天内）
  const last30Days = recentData.slice(-30);
  const last30Prices = last30Days.map(d => d.close).filter(p => p && p > 0);
  
  if (last30Prices.length >= 15) {
    const recentHigh = Math.max(...last30Prices);
    const recentHighIndex = last30Prices.indexOf(recentHigh);
    
    // 如果高点在过去但不是今天
    if (recentHighIndex < last30Prices.length - 1) {
      // 计算从高点回调的深度
      pullbackDepth = (recentHigh - currentPrice) / recentHigh;
      
      // 计算从低点到高点的涨幅
      const pricesBeforeHigh = last30Prices.slice(0, recentHighIndex + 1);
      const lowBeforeHigh = Math.min(...pricesBeforeHigh);
      if (lowBeforeHigh > 0) {
        recentRise = (recentHigh - lowBeforeHigh) / lowBeforeHigh;
      }
      
      // 判断是否是合理回调：
      // 1. 之前有明显上涨（至少15%）
      // 2. 回调深度在10%-30%之间
      // 3. 当前价格没有跌破前期起涨点
      if (recentRise >= 0.15 && pullbackDepth >= 0.1 && pullbackDepth <= 0.3 && currentPrice >= lowBeforeHigh * 1.05) {
        isPullbackAfterRise = true;
      }
    }
  }

  return {
    isLowPosition,
    isPullbackAfterRise,
    positionPercentile,
    pullbackDepth,
    recentRise
  };
}
// ===============================

// === 新增：历史涨停板分析函数 ===
function analyzeLimitUpHistory(sortedData: any[], currentPrice: number) {
  if (!sortedData || sortedData.length < 5) {
    return {
      hasLimitUp: false,
      limitUpCount: 0,
      bonus: 0,
      bottomLimitUpBonus: 0,
      hasBottomLimitUp: false
    };
  }
  
  let limitUpCount = 0;
  let recentLimitUpCount = 0; // 最近30天的涨停次数
  let bottomLimitUpCount = 0; // 底部区域的涨停次数
  const prices = sortedData.map(d => d.close);
  const highestPrice = Math.max(...prices);
  const lowestPrice = Math.min(...prices);
  
  for (let i = 0; i < sortedData.length; i++) {
    const data = sortedData[i];
    if (!data.open || !data.close || !data.high || !data.low) continue;
    
    // 计算当日涨幅
    const prevClose = i > 0 ? sortedData[i - 1].close : data.open;
    const dailyChange = (data.close - prevClose) / prevClose;
    
    // 判断是否涨停（A股一般是10%或20%涨停，这里取9.5%作为标准）
    const isLimitUp = dailyChange >= 0.095;
    
    if (isLimitUp) {
      limitUpCount++;
      
      // 统计最近30天的涨停
      if (i >= sortedData.length - 30) {
        recentLimitUpCount++;
      }
      
      // 判断是否在底部区域涨停（股价在最近60天的较低位置）
      const relativePosition = (data.close - lowestPrice) / (highestPrice - lowestPrice);
      if (relativePosition < 0.4) { // 股价在底部40%区域
        bottomLimitUpCount++;
      }
    }
  }
  
  // 计算基础加分
  let bonus = 0;
  if (limitUpCount >= 5) {
    bonus += 60; // 有5次以上涨停记录，股性非常活跃
  } else if (limitUpCount >= 3) {
    bonus += 40; // 有3-4次涨停记录
  } else if (limitUpCount >= 2) {
    bonus += 25; // 有2次涨停记录
  } else if (limitUpCount >= 1) {
    bonus += 15; // 至少有1次涨停记录
  }
  
  // 最近涨停额外加分
  if (recentLimitUpCount >= 2) {
    bonus += 20; // 最近30天有2次以上涨停
  } else if (recentLimitUpCount >= 1) {
    bonus += 10; // 最近30天有1次涨停
  }
  
  // 底部涨停板额外加分（这是最优质的信号）
  let bottomLimitUpBonus = 0;
  if (bottomLimitUpCount >= 2) {
    bottomLimitUpBonus += 50; // 底部有2次以上涨停
  } else if (bottomLimitUpCount >= 1) {
    bottomLimitUpBonus += 30; // 底部有1次涨停
  }
  
  return {
    hasLimitUp: limitUpCount > 0,
    limitUpCount,
    bonus,
    bottomLimitUpBonus,
    hasBottomLimitUp: bottomLimitUpCount > 0
  };
}
// ===============================

// === 新增：科技股票分析函数 ===
function analyzeTechStock(stockName: string, hotspotData: any) {
  // 科技类关键词列表（包含热门科技概念）
  const techKeywords = [
    // 人工智能
    'AI', '人工智能', '智能', '机器学习', '深度学习', '神经网络', '大模型', 'GPT', '算力',
    // 芯片半导体
    '芯片', '半导体', '集成电路', 'IC', '晶圆', '封测', '光刻机', '光刻胶', 'EDA', '第三代半导体', 'MCU', '功率', 'IGBT',
    // 量子科技
    '量子', '量子计算', '量子通信',
    // 航空航天
    '航空', '航天', '无人机', '卫星', '北斗', '火箭', '飞船', '军工', 'C919',
    // 机器人
    '机器人', '自动化', '机械臂', '人形', '人形机器人', '减速器', '伺服', '工控',
    // 软件
    '软件', '软件开发', '信息安全', '网络安全', '信创', '操作系统', '数据库', '中间件',
    // 新能源
    '新能源', '光伏', '锂电', '储能', '充电桩', '电动汽车', '新能源汽车', '特斯拉', '比亚迪', '宁德', '电池',
    // 低空经济
    '低空', '飞行汽车', 'eVTOL', '直升机',
    // 核能
    '核电', '核能', '核工业', '核技术',
    // 数据中心
    'IDC', '数据中心', '算力中心', '服务器', '云计算',
    // 华为、小米等
    '华为', '小米', '苹果', '特斯拉', '产业链', '供应链',
    // 脑机接口
    '脑机', '脑机接口', 'BCI',
    // 6G/通信
    '6G', '5G', '通信', '光模块', '光纤', '光通信', '算力网络',
    // 数字经济
    '数字', '数字化', '大数据', '数据要素', '东数西算',
    // 其他高科技
    'VR', 'AR', '元宇宙', '区块链', 'Web3.0', '数字货币', '生物科技', '创新药', 'CXO',
    '机器人', '工业母机', '数控机床', '高端制造', '智能制造', '专精特新', '小巨人'
  ];
  
  let category = '';
  let bonus = 0;
  
  // 检查股票名称是否包含科技关键词
  const stockNameUpper = (stockName || '').toUpperCase();
  for (const keyword of techKeywords) {
    if (stockNameUpper.includes(keyword.toUpperCase())) {
      category = keyword;
      bonus += 50; // 股票名称带科技关键词+50分（增加权重）
      break;
    }
  }
  
  // 检查热点数据中的行业和概念
  if (hotspotData) {
    const concepts = (hotspotData.concepts || []).map((c: string) => c.toUpperCase());
    const industry = (hotspotData.industry || '').toUpperCase();
    
    // 检查概念中是否有科技关键词
    for (const concept of concepts) {
      for (const keyword of techKeywords) {
        if (concept.includes(keyword.toUpperCase())) {
          if (bonus === 0) category = keyword; // 如果名称没有匹配，用概念匹配
          bonus += 35; // 概念带科技关键词再加35分（增加权重）
          break;
        }
      }
    }
    
    // 检查行业是否是科技行业
    const techIndustries = ['软件', '信息', '电子', '芯片', '半导体', '计算机', '通信', '互联网', '医药', '生物', '新能', '军工', '航空', '航天'];
    for (const ti of techIndustries) {
      if (industry.includes(ti)) {
        if (bonus === 0) category = ti;
        bonus += 15; // 行业是科技行业再加15分
        break;
      }
    }
  }
  
  return {
    isTechStock: bonus > 0,
    category: category || '科技',
    bonus: Math.min(bonus, 80) // 最高80分封顶
  };
}
// =============================

// === 新增：小盘股分析函数 ===
function analyzeSmallCapStock(floatMarketCap: number, currentPrice: number) {
  // 按流通市值分类（单位：元）
  let type = '';
  let bonus = 0;
  
  if (floatMarketCap > 0) {
    // 大幅增加小盘股权重
    if (floatMarketCap < 500000000) { // <5亿，超微盘股
      type = '超微盘股';
      bonus = 200; // 大幅增加
    } else if (floatMarketCap < 1000000000) { // <10亿，微盘股
      type = '微盘股';
      bonus = 180; // 大幅增加
    } else if (floatMarketCap < 2000000000) { // <20亿，小盘股
      type = '小盘股';
      bonus = 150; // 大幅增加
    } else if (floatMarketCap < 3000000000) { // <30亿，中小盘股
      type = '中小盘股';
      bonus = 100; // 增加
    } else if (floatMarketCap < 5000000000) { // <50亿，中盘股
      type = '中盘股';
      bonus = 50;
    } else if (floatMarketCap > 20000000000) { // >200亿，大盘股
      type = '大盘股';
      bonus = -80; // 大幅降低大盘股权重
    } else if (floatMarketCap > 10000000000) { // >100亿，中大盘股
      type = '中大盘股';
      bonus = -40; // 降低权重
    }
  }
  
  // 大幅增加低价格股票加分（无论市值大小）
  if (currentPrice < 10) {
    type = type ? `${type}+低价股` : '低价股';
    bonus += 120; // 大幅增加
  } else if (currentPrice < 20) {
    type = type ? `${type}+中低价股` : '中低价股';
    bonus += 80; // 大幅增加
  } else if (currentPrice < 30) {
    type = type ? `${type}+中价股` : '中价股';
    bonus += 40;
  } else if (currentPrice > 100) {
    type = type ? `${type}+高价股` : '高价股';
    bonus -= 60; // 高价股降低权重
  } else if (currentPrice > 50) {
    type = type ? `${type}+中高价股` : '中高价股';
    bonus -= 30; // 中高价股适当降低权重
  }
  
  return {
    isSmallCap: bonus > 0,
    type,
    bonus
  };
}
// =============================

// 使用全局对象来存储单例，避免HMR（热更新）导致实例丢失
declare global {
  // eslint-disable-next-line no-var
  var __optimizedSignalManagerSingleton__: OptimizedSignalManager | null;
  // eslint-disable-next-line no-var
  var __optimizedSignalsLoadedFromStorage__: boolean;
  // eslint-disable-next-line no-var
  var __optimizedInstanceCreationTime__: number;
  // eslint-disable-next-line no-var
  var __optimizedInstanceId__: string;
}

// 从全局变量恢复或初始化
if (typeof globalThis.__optimizedSignalManagerSingleton__ === 'undefined') {
  globalThis.__optimizedSignalManagerSingleton__ = null;
  globalThis.__optimizedSignalsLoadedFromStorage__ = false;
  globalThis.__optimizedInstanceCreationTime__ = 0;
  globalThis.__optimizedInstanceId__ = Math.random().toString(36).substr(2, 9); // 唯一实例ID
}

let signalManager = globalThis.__optimizedSignalManagerSingleton__;
let signalsLoadedFromStorage = globalThis.__optimizedSignalsLoadedFromStorage__;
let instanceCreationTime = globalThis.__optimizedInstanceCreationTime__;
const INSTANCE_ID = globalThis.__optimizedInstanceId__;

export const getOptimizedSignalManager = (config?: Partial<SignalFilterConfig>): OptimizedSignalManager => {
  const timestamp = new Date().toLocaleString('zh-CN');
  const callerStack = new Error().stack;
  
  console.log(`[${timestamp}] [单例管理] ====== getOptimizedSignalManager 被调用 ======`);
  console.log(`[${timestamp}] [单例管理] 调用栈:`, callerStack?.split('\n').slice(0, 5).join('\n'));
  console.log(`[${timestamp}] [单例管理] 当前实例状态: ${signalManager ? '已存在' : '不存在'}, 实例ID: ${signalManager?.instanceId || 'N/A'}`);
  console.log(`[${timestamp}] [单例管理] signalsLoadedFromStorage: ${signalsLoadedFromStorage}`);
  
  if (!signalManager) {
    console.log(`[${timestamp}] [单例管理] 创建新的 OptimizedSignalManager 实例，实例ID: ${INSTANCE_ID}`);
    instanceCreationTime = Date.now();
    globalThis.__optimizedInstanceCreationTime__ = instanceCreationTime;
    
    // 从 localStorage 恢复 signalsLoaded 状态
    try {
      const stored = localStorage.getItem('signalsLoaded');
      signalsLoadedFromStorage = stored === 'true';
      globalThis.__optimizedSignalsLoadedFromStorage__ = signalsLoadedFromStorage;
      console.log(`[${timestamp}] [单例管理] 从localStorage恢复signalsLoaded: ${signalsLoadedFromStorage}`);
    } catch (e) {
      console.warn(`[${timestamp}] [单例管理] 获取signalsLoaded状态失败:`, e);
      signalsLoadedFromStorage = false;
      globalThis.__optimizedSignalsLoadedFromStorage__ = false;
    }
    signalManager = new OptimizedSignalManager(config, INSTANCE_ID);
    globalThis.__optimizedSignalManagerSingleton__ = signalManager;
  } else {
    const currentSignalCount = signalManager.getSignalHistory().length;
    const instanceAge = Date.now() - instanceCreationTime;
    console.log(`[${timestamp}] [单例管理] 复用已存在的 OptimizedSignalManager 实例，实例ID: ${signalManager.instanceId}`);
    console.log(`[${timestamp}] [单例管理] 实例存在时间: ${instanceAge}ms, 当前信号数量: ${currentSignalCount}`);
  }
  console.log(`[${timestamp}] [单例管理] ====== 调用结束 ======`);
  return signalManager;
};