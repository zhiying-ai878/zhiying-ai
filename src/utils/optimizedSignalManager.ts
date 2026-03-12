import { getMainForceTracker, type MainForceData } from './mainForceTracker';
import { getPricePredictionManager, type PredictionResult } from './pricePredictionManager';
import { getStockDataSource } from './stockData';
import { playSellAlert, playBuyAlert } from './audioManager';
import { getRiskManager } from './riskManagement';

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

// 综合数据接口
export interface ComprehensiveData {
  stockCode: string;
  stockName: string;
  mainForceData: MainForceData;
  newsData?: NewsData[];
  hotspotData?: HotspotData;
  financialData?: FinancialData;
  researchData?: ResearchData;
  currentPrice: number;
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
  prediction?: PredictionResult;
  isPredictiveSignal?: boolean;
  price?: number;
  targetPrice?: number; // 目标价格
  // 综合数据字段
  newsSentiment?: 'positive' | 'negative' | 'neutral';
  newsRelevance?: number;
  industryRank?: number;
  conceptRank?: number;
  popularityScore?: number;
  popularityTrend?: 'up' | 'down' | 'stable';
  financialScore?: number;
  researchScore?: number;
  comprehensiveScore?: number;
  // 详细分析理由
  detailedReasons?: string[];
}

export interface SignalFilterConfig {
  maxBuySignals: number;
  onlyHeldStocksForSell: boolean;
  minConfidence: number;
  auctionPeriodStart: string;
  auctionPeriodEnd: string;
  enableAuctionSignals: boolean;
  enablePredictiveSignals: boolean;
  signalTypes: Array<'buy' | 'sell'>;
  stockFilter: string;
  sortBy: 'confidence' | 'score' | 'time' | 'mainForceFlow';
  maxHistoryDays: number;
}

const DEFAULT_CONFIG: SignalFilterConfig = {
  maxBuySignals: 1,
  onlyHeldStocksForSell: true,
  minConfidence: 60,
  auctionPeriodStart: '09:15',
  auctionPeriodEnd: '09:25',
  enableAuctionSignals: true,
  enablePredictiveSignals: true,
  signalTypes: ['buy', 'sell'],
  stockFilter: '',
  sortBy: 'confidence',
  maxHistoryDays: 7
};

class OptimizedSignalManager {
  private config: SignalFilterConfig;
  private positions: Map<string, StockPosition> = new Map();
  private pendingBuySignals: OptimizedSignal[] = [];
  private pendingSellSignals: OptimizedSignal[] = [];
  private signalHistory: OptimizedSignal[] = [];
  private notifiedSignals: Set<string> = new Set();
  private listeners: Array<(signals: OptimizedSignal[]) => void> = [];
  private predictionManager = getPricePredictionManager();
  private riskManager = getRiskManager();
  // 主力资金历史数据，用于监控持续流向
  private mainForceHistory: Map<string, Array<{ timestamp: number; netFlow: number; ratio: number; price: number }>> = new Map();
  // 持续流向的周期数
  private continuousFlowPeriods = 3;
  // 市场环境分析
  private marketEnvironment: 'trend' | '震荡' = '震荡';
  // 持续流向的阈值（每个周期的最小净流入/流出）
  private continuousFlowThreshold = 500000;
  // 价格历史数据，用于分析价格趋势和背离
  private priceHistory: Map<string, Array<{ timestamp: number; price: number }>> = new Map();
  // 成交量历史数据，用于分析成交量趋势
  private volumeHistory: Map<string, Array<{ timestamp: number; volume: number; volumeAmplification: number }>> = new Map();
  // 主力行为模式
  private mainForceBehavior: Map<string, 'accumulation' | 'washing' | 'pulling' | 'distribution' | 'unknown'> = new Map();
  // 主力类型历史数据，用于监控同一账户/主力的持续流向
  private mainForceTypeHistory: Map<string, Array<{
    timestamp: number;
    superLargeFlow: number;
    largeFlow: number;
    mediumFlow: number;
    smallFlow: number;
    // 主力类型分析
    mainForceType: 'nationalTeam' | 'institution' | 'publicFund' | 'privateFund' | 'retail' | 'unknown';
  }>> = new Map();
  // 主力类型识别阈值
  private mainForceTypeThresholds = {
    superLargeOrderRatio: 0.6,  // 超大单占比阈值
    largeOrderRatio: 0.4,       // 大单占比阈值
    smallOrderRatio: 0.7        // 小单占比阈值（散户）
  };

  constructor(config?: Partial<SignalFilterConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.loadPositionsFromStorage();
  }

  private loadPositionsFromStorage() {
    try {
      const saved = localStorage.getItem('stockPositions');
      if (saved) {
        const positions: StockPosition[] = JSON.parse(saved);
        positions.forEach(pos => {
          this.positions.set(pos.stockCode, pos);
        });
      }
    } catch (error) {
      console.error('加载持仓失败:', error);
    }
  }

  private savePositionsToStorage() {
    try {
      const positions = Array.from(this.positions.values());
      localStorage.setItem('stockPositions', JSON.stringify(positions));
    } catch (error) {
      console.error('保存持仓失败:', error);
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

  private calculateSignalScore(data: ComprehensiveData, type: 'buy' | 'sell'): { score: number; detailedReasons: string[] } {
    let score = 0;
    const detailedReasons: string[] = [];
    const mainForceData = data.mainForceData;
    const mainForceFlow = mainForceData.mainForceNetFlow;
    const superLargeFlow = mainForceData.superLargeOrder.netFlow;
    const largeFlow = mainForceData.largeOrder.netFlow;
    const totalFlow = mainForceData.totalNetFlow;

    // 1. 主力资金分析 (权重: 40%)
    let mainForceScore = 0;
    if (type === 'buy') {
      const mainForceAbs = Math.abs(mainForceFlow);
      const totalAbs = Math.abs(totalFlow) || 1;
      const mainForceRatio = mainForceAbs / totalAbs;

      // 主力资金净流入规模
      if (mainForceFlow > 800000000) {
        mainForceScore += 15;
        detailedReasons.push('主力资金超大额净流入');
      } else if (mainForceFlow > 500000000) {
        mainForceScore += 12;
        detailedReasons.push('主力资金大幅净流入');
      } else if (mainForceFlow > 300000000) {
        mainForceScore += 10;
        detailedReasons.push('主力资金显著净流入');
      } else if (mainForceFlow > 100000000) {
        mainForceScore += 8;
        detailedReasons.push('主力资金中度净流入');
      } else if (mainForceFlow > 50000000) {
        mainForceScore += 5;
        detailedReasons.push('主力资金小幅净流入');
      } else if (mainForceFlow > 1000000) {
        mainForceScore += 3;
        detailedReasons.push('主力资金微量净流入');
      }

      // 分析价格与资金背离
      const priceDivergence = this.analyzePriceFundFlowDivergence(data.stockCode, data.currentPrice || 0, mainForceFlow);
      
      // 主力资金占比 - 强化权重，根据价格趋势调整阈值
      if (priceDivergence.divergenceType === 'bullish') {
        // 价格下跌但资金净流入，降低主力资金占比阈值
        if (mainForceRatio > 0.7) {
          mainForceScore += 30;
          detailedReasons.push('主力资金占比高（吸筹阶段）');
        } else if (mainForceRatio > 0.5) {
          mainForceScore += 25;
          detailedReasons.push('主力资金占比适中（吸筹阶段）');
        } else if (mainForceRatio > 0.3) {
          mainForceScore += 20;
          detailedReasons.push('主力资金占比合理（吸筹阶段）');
        }
      } else {
        // 正常情况下的主力资金占比权重
        if (mainForceRatio > 0.9) {
          mainForceScore += 30;
          detailedReasons.push('主力资金占比极高');
        } else if (mainForceRatio > 0.8) {
          mainForceScore += 25;
          detailedReasons.push('主力资金占比很高');
        } else if (mainForceRatio > 0.7) {
          mainForceScore += 20;
          detailedReasons.push('主力资金占比高');
        } else if (mainForceRatio > 0.6) {
          mainForceScore += 15;
          detailedReasons.push('主力资金占比适中');
        } else if (mainForceRatio > 0.5) {
          mainForceScore += 10;
          detailedReasons.push('主力资金占比合理');
        }
      }
      
      // 增加对连续小幅资金流入的重视
      if (mainForceFlow > 100000 && mainForceFlow <= 1000000) {
        mainForceScore += 5;
        detailedReasons.push('主力资金持续小幅净流入');
      }

      // 超大单占比
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

      // 大单占比
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

      // 成交量放大倍数
      if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 5) {
        mainForceScore += 12;
        detailedReasons.push('成交量极度放大');
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 4) {
        mainForceScore += 10;
        detailedReasons.push('成交量大幅放大');
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 3) {
        mainForceScore += 8;
        detailedReasons.push('成交量显著放大');
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 2) {
        mainForceScore += 6;
        detailedReasons.push('成交量中度放大');
      } else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1.5) {
        mainForceScore += 4;
        detailedReasons.push('成交量小幅放大');
      }

      // 换手率
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

      // 集合竞价时段
      if (this.isAuctionPeriod()) {
        mainForceScore += 8;
        detailedReasons.push('集合竞价时段信号');
      }

    } else {
      const mainForceAbs = Math.abs(mainForceFlow);
      const totalAbs = Math.abs(totalFlow) || 1;
      const mainForceRatio = mainForceAbs / totalAbs;

      // 主力资金净流出规模 - 降低阈值，更早捕捉卖出信号
      if (mainForceFlow < -800000000) {
        mainForceScore += 15;
        detailedReasons.push('主力资金超大额净流出');
      } else if (mainForceFlow < -500000000) {
        mainForceScore += 12;
        detailedReasons.push('主力资金大幅净流出');
      } else if (mainForceFlow < -300000000) {
        mainForceScore += 10;
        detailedReasons.push('主力资金显著净流出');
      } else if (mainForceFlow < -100000000) {
        mainForceScore += 8;
        detailedReasons.push('主力资金中度净流出');
      } else if (mainForceFlow < -50000000) {
        mainForceScore += 5;
        detailedReasons.push('主力资金小幅净流出');
      } else if (mainForceFlow < -3000000) {
        mainForceScore += 3;
        detailedReasons.push('主力资金微量净流出');
      }

      // 主力资金占比 - 强化权重
      if (mainForceRatio > 0.9) {
        mainForceScore += 30;
        detailedReasons.push('主力资金占比极高');
      } else if (mainForceRatio > 0.8) {
        mainForceScore += 25;
        detailedReasons.push('主力资金占比很高');
      } else if (mainForceRatio > 0.7) {
        mainForceScore += 20;
        detailedReasons.push('主力资金占比高');
      } else if (mainForceRatio > 0.6) {
        mainForceScore += 15;
        detailedReasons.push('主力资金占比适中');
      } else if (mainForceRatio > 0.5) {
        mainForceScore += 10;
        detailedReasons.push('主力资金占比合理');
      } else if (mainForceRatio > 0.4) {
        mainForceScore += 4;
        detailedReasons.push('主力资金占比尚可');
      }

      // 超大单占比
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

      // 大单占比
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

      // 成交量放大倍数 - 卖出信号时更敏感
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

      // 换手率 - 卖出信号时更敏感
      if (mainForceData.turnoverRate && mainForceData.turnoverRate > 15) {
        mainForceScore += 8;
        detailedReasons.push('换手率很高');
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 10) {
        mainForceScore += 6;
        detailedReasons.push('换手率高');
      } else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 5) {
        mainForceScore += 4;
        detailedReasons.push('换手率适中');
      }
    }
    score += mainForceScore * 0.5;

    // 2. 主力类型分析 (权重: 5%)
    let mainForceTypeScore = 0;
    const mainForceType = this.identifyMainForceType(data.mainForceData);
    if (type === 'buy') {
      // 国家队和机构买入信号更可靠
      if (mainForceType === 'nationalTeam') {
        mainForceTypeScore += 15;
        detailedReasons.push('国家队资金买入');
      } else if (mainForceType === 'institution') {
        mainForceTypeScore += 10;
        detailedReasons.push('机构资金买入');
      }
    } else {
      // 国家队和机构卖出信号更可靠
      if (mainForceType === 'nationalTeam') {
        mainForceTypeScore += 15;
        detailedReasons.push('国家队资金卖出');
      } else if (mainForceType === 'institution') {
        mainForceTypeScore += 10;
        detailedReasons.push('机构资金卖出');
      }
    }
    score += mainForceTypeScore * 0.05;

    // 3. 新闻数据分析 (权重: 15%)
    let newsScore = 0;
    if (data.newsData && data.newsData.length > 0) {
      const positiveNews = data.newsData.filter(news => news.sentiment === 'positive').length;
      const negativeNews = data.newsData.filter(news => news.sentiment === 'negative').length;
      const totalNews = data.newsData.length;
      const sentimentScore = (positiveNews - negativeNews) / totalNews;
      
      // 新闻情感分析
      if (type === 'buy' && sentimentScore > 0.7) {
        newsScore += 20;
        detailedReasons.push('正面新闻占比极高');
      } else if (type === 'sell' && sentimentScore < -0.5) {
        newsScore += 20;
        detailedReasons.push('负面新闻占比极高');
      } else if (type === 'buy' && sentimentScore > 0.5) {
        newsScore += 15;
        detailedReasons.push('正面新闻占比高');
      } else if (type === 'sell' && sentimentScore < -0.3) {
        newsScore += 15;
        detailedReasons.push('负面新闻占比高');
      } else if (type === 'buy' && sentimentScore > 0.3) {
        newsScore += 10;
        detailedReasons.push('正面新闻占比适中');
      } else if (type === 'sell' && sentimentScore < -0.1) {
        newsScore += 10;
        detailedReasons.push('负面新闻占比适中');
      }
      
      // 新闻相关性
      const avgRelevance = data.newsData.reduce((sum, news) => sum + news.relevance, 0) / totalNews;
      if (avgRelevance > 0.8) {
        newsScore += 5;
        detailedReasons.push('新闻相关性高');
      } else if (avgRelevance > 0.6) {
        newsScore += 3;
        detailedReasons.push('新闻相关性适中');
      }

      // 新闻时效性
      const now = Date.now();
      const recentNews = data.newsData.filter(news => now - news.timestamp < 24 * 60 * 60 * 1000).length;
      if (recentNews > 3) {
        newsScore += 5;
        detailedReasons.push('近期新闻频繁');
      } else if (recentNews > 1) {
        newsScore += 3;
        detailedReasons.push('近期有新闻报道');
      }
    }
    score += newsScore * 0.15;

    // 4. 热点数据分析 (权重: 15%)
    let hotspotScore = 0;
    if (data.hotspotData) {
      // 行业排名
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
      
      // 概念排名
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
      
      // 人气热度
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
      
      // 人气趋势 - 卖出信号时更敏感
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
      
      // 搜索量和社交提及
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

    // 5. 财务数据分析 (权重: 10%)
    let financialScore = 0;
    if (data.financialData) {
      // 市盈率对比行业平均
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
      
      // 市净率对比行业平均
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
      
      // 营收增长
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
      
      // 利润增长
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
      
      // 净资产收益率
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
      
      // 资产负债率
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

    // 6. 调研数据分析 (权重: 5%)
    let researchScore = 0;
    if (data.researchData) {
      // 调研次数
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
      
      // 机构持仓变化
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
      
      // 分析师推荐
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
      
      // 目标价格
      if (data.currentPrice && data.researchData.targetPrice > data.currentPrice * 1.3) {
        researchScore += 4;
        detailedReasons.push('目标价格大幅高于当前价格');
      } else if (data.currentPrice && data.researchData.targetPrice > data.currentPrice * 1.1) {
        researchScore += 2;
        detailedReasons.push('目标价格高于当前价格');
      } else if (data.currentPrice && data.researchData.targetPrice < data.currentPrice * 0.7) {
        researchScore += 8;
        detailedReasons.push('目标价格大幅低于当前价格');
      } else if (data.currentPrice && data.researchData.targetPrice < data.currentPrice * 0.9) {
        researchScore += 6;
        detailedReasons.push('目标价格低于当前价格');
      } else if (data.currentPrice && data.researchData.targetPrice < data.currentPrice * 0.95 && type === 'sell') {
        researchScore += 4;
        detailedReasons.push('目标价格略低于当前价格');
      }
    }
    score += researchScore * 0.05;

    // 7. 技术指标分析 (权重: 10%)
    let technicalScore = 0;
    // 基于价格历史数据计算技术指标
    const priceHistory = this.priceHistory.get(data.stockCode) || [];
    
    if (priceHistory.length >= 20) {
      // 计算移动平均线
      const prices = priceHistory.map(item => item.price);
      const ma5 = this.calculateMA(prices, 5);
      const ma20 = this.calculateMA(prices, 20);
      const ma60 = this.calculateMA(prices, 60);
      
      // 计算RSI
      const rsi = this.calculateRSI(prices, 14);
      
      // 计算MACD
      const macd = this.calculateMACD(prices);
      
      // 计算KDJ
      const kdj = this.calculateKDJ(prices);
      
      // 计算布林带
      const bollinger = this.calculateBollingerBands(prices);
      
      if (type === 'buy') {
        // RSI分析
        if (rsi < 30) {
          technicalScore += 10;
          detailedReasons.push('RSI超卖，可能反弹');
        } else if (rsi < 40) {
          technicalScore += 6;
          detailedReasons.push('RSI接近超卖');
        }
        
        // MACD分析
        if (macd.macd > macd.signal) {
          technicalScore += 8;
          detailedReasons.push('MACD金叉');
        }
        
        // KDJ分析
        if (kdj.k > kdj.d && kdj.j > kdj.k) {
          technicalScore += 8;
          detailedReasons.push('KDJ金叉');
        } else if (kdj.j < 20) {
          technicalScore += 6;
          detailedReasons.push('KDJ超卖');
        }
        
        // 布林带分析
        if (data.currentPrice < bollinger.lower) {
          technicalScore += 10;
          detailedReasons.push('价格跌破布林带下轨，可能反弹');
        } else if (data.currentPrice > bollinger.middle) {
          technicalScore += 4;
          detailedReasons.push('价格站上布林带中轨');
        }
        
        // 均线分析
        if (data.currentPrice > ma5 && ma5 > ma20 && ma20 > ma60) {
          technicalScore += 12;
          detailedReasons.push('价格站上多头排列均线');
        } else if (data.currentPrice > ma5 && ma5 > ma20) {
          technicalScore += 8;
          detailedReasons.push('价格站上短期均线');
        } else if (data.currentPrice > ma5) {
          technicalScore += 4;
          detailedReasons.push('价格站上5日均线');
        }
        
        // 价格突破分析
        if (data.currentPrice > Math.max(...prices.slice(-10))) {
          technicalScore += 6;
          detailedReasons.push('价格突破近期高点');
        }
      } else {
        // 卖出信号时技术指标更敏感
        if (rsi > 70) {
          technicalScore += 10;
          detailedReasons.push('RSI超买，可能回调');
        } else if (rsi > 60) {
          technicalScore += 6;
          detailedReasons.push('RSI接近超买');
        }
        
        if (macd.macd < macd.signal) {
          technicalScore += 8;
          detailedReasons.push('MACD死叉');
        }
        
        // KDJ分析
        if (kdj.k < kdj.d && kdj.j < kdj.k) {
          technicalScore += 8;
          detailedReasons.push('KDJ死叉');
        } else if (kdj.j > 80) {
          technicalScore += 6;
          detailedReasons.push('KDJ超买');
        }
        
        // 布林带分析
        if (data.currentPrice > bollinger.upper) {
          technicalScore += 10;
          detailedReasons.push('价格突破布林带上轨，可能回调');
        } else if (data.currentPrice < bollinger.middle) {
          technicalScore += 4;
          detailedReasons.push('价格跌破布林带中轨');
        }
        
        if (data.currentPrice < ma5 && ma5 < ma20 && ma20 < ma60) {
          technicalScore += 12;
          detailedReasons.push('价格跌破空头排列均线');
        } else if (data.currentPrice < ma5 && ma5 < ma20) {
          technicalScore += 8;
          detailedReasons.push('价格跌破短期均线');
        } else if (data.currentPrice < ma5) {
          technicalScore += 4;
          detailedReasons.push('价格跌破5日均线');
        }
        
        if (data.currentPrice < Math.min(...prices.slice(-10))) {
          technicalScore += 6;
          detailedReasons.push('价格跌破近期低点');
        }
      }
    } else {
      // 数据不足时使用简化分析
      if (type === 'buy' && data.mainForceData.mainForceNetFlow > 0) {
        technicalScore += 5;
        detailedReasons.push('主力资金流入，技术面看好');
      } else if (type === 'sell' && data.mainForceData.mainForceNetFlow < 0) {
        technicalScore += 5;
        detailedReasons.push('主力资金流出，技术面看空');
      }
    }
    score += technicalScore * 0.1;

    // 8. 市场情绪分析 (权重: 5%)
    let marketSentimentScore = 0;
    // 基于实际数据计算市场情绪
    const marketSentiment = this.calculateMarketSentiment(data.mainForceData, priceHistory);
    
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
    score += marketSentimentScore * 0.05;

    return { score: Math.min(score, 100), detailedReasons };
  }

  private generateSignal(data: ComprehensiveData, type: 'buy' | 'sell'): OptimizedSignal {
    const { score, detailedReasons } = this.calculateSignalScore(data, type);
    const confidence = Math.min(50 + score, 95);
    const mainForceData = data.mainForceData;
    const mainForceAbs = Math.abs(mainForceData.mainForceNetFlow);
    const totalAbs = Math.abs(mainForceData.totalNetFlow) || 1;
    const mainForceRatio = mainForceAbs / totalAbs;
    const superLargeRatio = Math.abs(mainForceData.superLargeOrder.netFlow) / totalAbs;
    const currentPrice = data.currentPrice || 0;

    // 分析价格与资金背离
    const priceDivergence = this.analyzePriceFundFlowDivergence(data.stockCode, currentPrice, mainForceData.mainForceNetFlow);
    // 分析成交量特征
    const volumeAnalysis = this.analyzeVolumeCharacteristics(data.stockCode, 0, data.mainForceData.volumeAmplification || 1);
    // 识别主力行为模式
    const mainForceBehavior = this.identifyMainForceBehavior(data.stockCode, data.mainForceData);

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
      // 添加价格与资金背离信息
      if (priceDivergence.hasDivergence) {
        reason += `，${priceDivergence.reason}`;
      }
      // 添加主力行为模式信息
      if (mainForceBehavior === 'accumulation') {
        reason += '，主力可能在吸筹';
      } else if (mainForceBehavior === 'pulling') {
        reason += '，主力可能在拉升';
      }
    } else {
      reason = `卖出信号：当前价格 ${currentPrice.toFixed(2)} 元，主力资金净流出 ${(Math.abs(mainForceData.mainForceNetFlow) / 100000000).toFixed(2)} 亿元，占比${(mainForceRatio * 100).toFixed(0)}%`;
      if (superLargeRatio > 0.3) {
        reason += `，超大单占比${(superLargeRatio * 100).toFixed(0)}%`;
      }
      // 添加价格与资金背离信息
      if (priceDivergence.hasDivergence) {
        reason += `，${priceDivergence.reason}`;
      }
      // 添加主力行为模式信息
      if (mainForceBehavior === 'distribution') {
        reason += '，主力可能在出货';
      }
    }
    
    // 添加综合分析理由
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
    
    // 计算目标价格
    let targetPrice: number | undefined;
    if (type === 'buy' && data.currentPrice) {
      // 买入信号的目标价格：基于当前价格和得分计算
      const priceIncrease = (score / 100) * 0.2; // 最高20%的涨幅预期
      targetPrice = data.currentPrice * (1 + priceIncrease);
    } else if (type === 'sell' && data.currentPrice) {
      // 卖出信号的目标价格：基于当前价格和得分计算
      const priceDecrease = (score / 100) * 0.15; // 最高15%的跌幅预期
      targetPrice = data.currentPrice * (1 - priceDecrease);
    }
    
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
      targetPrice, // 添加目标价格
      // 综合数据字段
      newsSentiment: data.newsData?.[0]?.sentiment,
      newsRelevance: data.newsData?.[0]?.relevance,
      industryRank: data.hotspotData?.industryRank,
      conceptRank: data.hotspotData?.conceptRank,
      popularityScore: data.hotspotData?.popularityScore,
      popularityTrend: data.hotspotData?.popularityTrend,
      financialScore: data.financialData ? 0 : undefined, // 后续可以计算具体的财务评分
      researchScore: data.researchData ? 0 : undefined, // 后续可以计算具体的调研评分
      comprehensiveScore: score,
      detailedReasons
    };
  }

  markSignalAsRead(signalId: string): void {
    this.pendingBuySignals = this.pendingBuySignals.map(signal => 
      signal.id === signalId ? { ...signal, isRead: true } : signal
    );
    this.pendingSellSignals = this.pendingSellSignals.map(signal => 
      signal.id === signalId ? { ...signal, isRead: true } : signal
    );
    this.listeners.forEach(listener => listener([]));
  }

  markAllSignalsAsRead(): void {
    this.pendingBuySignals = this.pendingBuySignals.map(signal => ({ ...signal, isRead: true }));
    this.pendingSellSignals = this.pendingSellSignals.map(signal => ({ ...signal, isRead: true }));
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
    
    return signals.filter(signal => this.positions.has(signal.stockCode));
  }

  async processMainForceData(data: MainForceData) {
    const tracker = getMainForceTracker();
    tracker.updateMainForceData(data);
    
    // 构建综合数据
    const comprehensiveData: ComprehensiveData = {
      stockCode: data.stockCode,
      stockName: data.stockName,
      mainForceData: data,
      currentPrice: data.currentPrice || 0,
      // 后续会添加其他数据
    };
    
    // 获取新闻数据
    try {
      const newsData = await this.getNewsData(data.stockCode);
      comprehensiveData.newsData = newsData;
    } catch (error) {
      console.error('获取新闻数据失败:', error);
    }
    
    // 获取热点数据
    try {
      const hotspotData = await this.getHotspotData(data.stockCode, data.stockName);
      comprehensiveData.hotspotData = hotspotData;
    } catch (error) {
      console.error('获取热点数据失败:', error);
    }
    
    // 获取财务数据
    try {
      const financialData = await this.getFinancialData(data.stockCode);
      comprehensiveData.financialData = financialData;
    } catch (error) {
      console.error('获取财务数据失败:', error);
    }
    
    // 获取调研数据
    try {
      const researchData = await this.getResearchData(data.stockCode);
      comprehensiveData.researchData = researchData;
    } catch (error) {
      console.error('获取调研数据失败:', error);
    }
    
    const mainForceAbs = Math.abs(data.mainForceNetFlow);
    const totalAbs = Math.abs(data.totalNetFlow) || 1;
    const mainForceRatio = mainForceAbs / totalAbs;
    
    const hasStrongRelativeSignal = mainForceRatio > 0.4 && 
                                     (data.volumeAmplification && data.volumeAmplification > 1.2) &&
                                     (data.turnoverRate && data.turnoverRate > 2);
    
    // 增强卖出信号的触发条件
    const hasWeakRelativeSignal = mainForceRatio > 0.3 && 
                                    (data.volumeAmplification && data.volumeAmplification > 1.1) &&
                                    (data.turnoverRate && data.turnoverRate > 1.5);
    
    // 检查新闻情绪
    const hasNegativeNews = comprehensiveData.newsData && 
                           comprehensiveData.newsData.filter(news => news.sentiment === 'negative').length > 
                           comprehensiveData.newsData.filter(news => news.sentiment === 'positive').length;
    
    // 检查热点趋势
    const hasNegativeTrend = comprehensiveData.hotspotData && 
                             comprehensiveData.hotspotData.popularityTrend === 'down';
    
    // 检查主力资金持续流向
    const continuousFlow = this.checkContinuousMainForceFlow(data.stockCode, data.mainForceNetFlow, mainForceRatio, data.currentPrice || 0);
    // 检查同一主力类型的持续流向
    const continuousMainForceTypeFlow = this.checkContinuousMainForceTypeFlow(data.stockCode, data);
    
    // 分析价格与资金背离
    const priceDivergence = this.analyzePriceFundFlowDivergence(data.stockCode, data.currentPrice || 0, data.mainForceNetFlow);
    // 分析成交量特征
    const volumeAnalysis = this.analyzeVolumeCharacteristics(data.stockCode, 0, data.volumeAmplification || 1);
    // 识别主力行为模式
    const mainForceBehavior = this.identifyMainForceBehavior(data.stockCode, data);
    // 风险评估
    const riskAssessment = this.riskManager.assessStockRisk(data.stockCode, data.stockName);
    // 根据市值调整主力资金阈值
    const marketCap = data.marketCap || 0;
    const adjustedThresholds = this.getAdjustedThresholdsByMarketCap(marketCap);
    
    const newSignals: OptimizedSignal[] = [];
    
    // 调整买入信号的触发条件，使其更容易触发，确保应用启动时能监控到买入信号
    // 增加持续买入的条件
    // 增加吸筹阶段的检测
    if (data.mainForceNetFlow > adjustedThresholds.smallFlow || 
        (data.mainForceNetFlow > adjustedThresholds.smallFlow * 0.5 && hasStrongRelativeSignal) ||
        (continuousFlow.hasContinuousBuy && data.mainForceNetFlow > 0) ||
        (continuousMainForceTypeFlow.hasContinuousBuy && data.mainForceNetFlow > 0) ||
        // 吸筹阶段的特殊条件：价格下跌但资金净流入，温和放量
        (priceDivergence.divergenceType === 'bullish' && volumeAnalysis.hasAccumulationVolume && data.mainForceNetFlow > 0) ||
        // 横盘吸筹：价格稳定但资金持续流入
        (priceDivergence.divergenceType === 'none' && data.mainForceNetFlow > adjustedThresholds.mediumFlow && (data.volumeAmplification || 0) > 1.2) ||
        // 强背离吸筹：价格大幅下跌但资金大幅流入
        (priceDivergence.divergenceType === 'bullish' && priceDivergence.strength >= 2 && data.mainForceNetFlow > adjustedThresholds.smallFlow)) {
      const buySignal = this.generateSignal(comprehensiveData, 'buy');
      
      // 增强吸筹信号的置信度和分数
      if (mainForceBehavior === 'accumulation') {
        buySignal.confidence = Math.min(95, buySignal.confidence + 15);
        buySignal.score = Math.min(100, buySignal.score + 15);
        buySignal.reason += '，主力吸筹迹象明显';
        if (buySignal.detailedReasons) {
          buySignal.detailedReasons.push('主力吸筹迹象明显');
        } else {
          buySignal.detailedReasons = ['主力吸筹迹象明显'];
        }
      }
      
      // 增强背离信号的置信度和分数
      if (priceDivergence.hasDivergence && priceDivergence.strength >= 2) {
        buySignal.confidence = Math.min(95, buySignal.confidence + 10);
        buySignal.score = Math.min(100, buySignal.score + 10);
        buySignal.reason += `，${priceDivergence.reason}`;
        if (buySignal.detailedReasons) {
          buySignal.detailedReasons.push(priceDivergence.reason);
        } else {
          buySignal.detailedReasons = [priceDivergence.reason];
        }
      }
      
      // 如果是持续买入，增加置信度和分数
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
      
      // 如果是同一主力类型持续买入，进一步增加置信度和分数
      if (continuousMainForceTypeFlow.hasContinuousBuy) {
        const mainForceTypeMap: Record<string, string> = {
          nationalTeam: '国家队',
          institution: '机构',
          publicFund: '公募基金',
          privateFund: '私募基金',
          retail: '散户'
        };
        const mainForceTypeName = mainForceTypeMap[continuousMainForceTypeFlow.mainForceType] || '主力';
        
        // 根据资金流向趋势和成交量趋势调整置信度和分数
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
      
      // 增强机构资金买入信号
      if (this.identifyMainForceType(data) === 'institution' && data.mainForceNetFlow > 5000000) {
        buySignal.confidence = Math.min(95, buySignal.confidence + 5);
        buySignal.score = Math.min(100, buySignal.score + 5);
        buySignal.reason += '，机构资金大幅买入';
        if (buySignal.detailedReasons) {
          buySignal.detailedReasons.push('机构资金大幅买入');
        } else {
          buySignal.detailedReasons = ['机构资金大幅买入'];
        }
      }
      
      // 风险评估调整
      if (riskAssessment.riskLevel === 'low') {
        buySignal.confidence = Math.min(95, buySignal.confidence + 10);
        buySignal.score = Math.min(100, buySignal.score + 10);
        buySignal.reason += '，风险等级低';
        if (buySignal.detailedReasons) {
          buySignal.detailedReasons.push('风险等级低，投资安全性高');
        } else {
          buySignal.detailedReasons = ['风险等级低，投资安全性高'];
        }
      } else if (riskAssessment.riskLevel === 'medium') {
        // 风险适中，不调整
      } else if (riskAssessment.riskLevel === 'high') {
        buySignal.confidence = Math.max(60, buySignal.confidence - 10);
        buySignal.score = Math.max(50, buySignal.score - 10);
        buySignal.reason += '，风险等级高';
        if (buySignal.detailedReasons) {
          buySignal.detailedReasons.push('风险等级高，建议谨慎投资');
        } else {
          buySignal.detailedReasons = ['风险等级高，建议谨慎投资'];
        }
      } else if (riskAssessment.riskLevel === 'extreme') {
        buySignal.confidence = Math.max(50, buySignal.confidence - 20);
        buySignal.score = Math.max(40, buySignal.score - 20);
        buySignal.reason += '，风险等级极高';
        if (buySignal.detailedReasons) {
          buySignal.detailedReasons.push('风险等级极高，建议避免投资');
        } else {
          buySignal.detailedReasons = ['风险等级极高，建议避免投资'];
        }
      }
      
      // 添加风险建议
      if (riskAssessment.recommendations.length > 0) {
        buySignal.reason += '，风险建议：' + riskAssessment.recommendations[0];
        if (buySignal.detailedReasons) {
          buySignal.detailedReasons.push('风险建议：' + riskAssessment.recommendations[0]);
        } else {
          buySignal.detailedReasons = ['风险建议：' + riskAssessment.recommendations[0]];
        }
      }
      
      this.pendingBuySignals.push(buySignal);
      this.signalHistory.unshift(buySignal);
      newSignals.push(buySignal);
      
      // 播放买入信号提醒
      playBuyAlert();
    }
    
    // 强化卖出信号的触发条件，确保在行情下跌前能够及时监控到
    // 增加持续卖出的条件
    if (data.mainForceNetFlow < -adjustedThresholds.mediumFlow || 
        (data.mainForceNetFlow < -adjustedThresholds.smallFlow && hasStrongRelativeSignal) ||
        (data.mainForceNetFlow < -adjustedThresholds.smallFlow * 0.5 && hasWeakRelativeSignal) ||
        (data.mainForceNetFlow < -adjustedThresholds.smallFlow * 0.3 && hasNegativeNews) ||
        (data.mainForceNetFlow < -adjustedThresholds.smallFlow * 0.3 && hasNegativeTrend) ||
        (continuousFlow.hasContinuousSell && data.mainForceNetFlow < 0) ||
        (continuousMainForceTypeFlow.hasContinuousSell && data.mainForceNetFlow < 0)) {
      const sellSignal = this.generateSignal(comprehensiveData, 'sell');
      // 如果是持续卖出，增加置信度和分数
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
      // 如果是同一主力类型持续卖出，进一步增加置信度和分数
      if (continuousMainForceTypeFlow.hasContinuousSell) {
        const mainForceTypeMap: Record<string, string> = {
          nationalTeam: '国家队',
          institution: '机构',
          publicFund: '公募基金',
          privateFund: '私募基金',
          retail: '散户'
        };
        const mainForceTypeName = mainForceTypeMap[continuousMainForceTypeFlow.mainForceType] || '主力';
        
        // 根据资金流向趋势和成交量趋势调整置信度和分数
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
      // 主力行为模式分析
      if (mainForceBehavior === 'distribution') {
        // 主力出货（出逃）信号增强
        sellSignal.confidence = Math.min(95, sellSignal.confidence + 20);
        sellSignal.score = Math.min(100, sellSignal.score + 20);
        sellSignal.reason += '，主力资金出逃迹象明显';
        if (sellSignal.detailedReasons) {
          sellSignal.detailedReasons.push('主力资金出逃迹象明显，建议立即卖出');
        } else {
          sellSignal.detailedReasons = ['主力资金出逃迹象明显，建议立即卖出'];
        }
      } else if (mainForceBehavior === 'washing') {
        // 主力洗盘信号减弱
        sellSignal.confidence = Math.max(60, sellSignal.confidence - 10);
        sellSignal.score = Math.max(50, sellSignal.score - 10);
        sellSignal.reason += '，可能是主力洗盘，建议谨慎操作';
        if (sellSignal.detailedReasons) {
          sellSignal.detailedReasons.push('可能是主力洗盘，建议谨慎操作');
        } else {
          sellSignal.detailedReasons = ['可能是主力洗盘，建议谨慎操作'];
        }
      }
      
      // 风险评估调整
      if (riskAssessment.riskLevel === 'high' || riskAssessment.riskLevel === 'extreme') {
        sellSignal.confidence = Math.min(95, sellSignal.confidence + 15);
        sellSignal.score = Math.min(100, sellSignal.score + 15);
        sellSignal.reason += '，风险等级高，建议及时卖出';
        if (sellSignal.detailedReasons) {
          sellSignal.detailedReasons.push('风险等级高，建议及时卖出');
        } else {
          sellSignal.detailedReasons = ['风险等级高，建议及时卖出'];
        }
      } else if (riskAssessment.riskLevel === 'medium') {
        sellSignal.confidence = Math.min(95, sellSignal.confidence + 5);
        sellSignal.score = Math.min(100, sellSignal.score + 5);
      }
      
      // 添加风险建议
      if (riskAssessment.recommendations.length > 0) {
        sellSignal.reason += '，风险建议：' + riskAssessment.recommendations[0];
        if (sellSignal.detailedReasons) {
          sellSignal.detailedReasons.push('风险建议：' + riskAssessment.recommendations[0]);
        } else {
          sellSignal.detailedReasons = ['风险建议：' + riskAssessment.recommendations[0]];
        }
      }
      
      this.pendingSellSignals.push(sellSignal);
      this.signalHistory.unshift(sellSignal);
      newSignals.push(sellSignal);
      
      // 播放卖出信号提醒
      playSellAlert();
    }
    
    this.cleanupOldSignals();
    
    if (newSignals.length > 0) {
      this.listeners.forEach(listener => listener(newSignals));
    }
  }

  // 获取新闻数据
  private async getNewsData(stockCode: string): Promise<NewsData[]> {
    // 模拟新闻数据
    const sentimentOptions: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'negative', 'neutral'];
    const newsData: NewsData[] = [];
    
    for (let i = 0; i < 3; i++) {
      newsData.push({
        id: `news${Date.now() + i}`,
        title: `${stockCode}相关新闻 ${i + 1}`,
        content: `这是一条关于${stockCode}的新闻内容，包含详细的市场分析和投资建议。`,
        source: ['东方财富', '同花顺', '新浪财经', '腾讯财经', '雪球'][Math.floor(Math.random() * 5)],
        timestamp: Date.now() - i * 3600000,
        stockCodes: [stockCode],
        sentiment: sentimentOptions[Math.floor(Math.random() * sentimentOptions.length)],
        relevance: 0.7 + Math.random() * 0.3
      });
    }
    
    return newsData;
  }

  // 获取热点数据
  private async getHotspotData(stockCode: string, stockName: string): Promise<HotspotData> {
    // 模拟热点数据
    const industries = ['科技', '金融', '医药', '消费', '能源', '地产', '汽车', '通信'];
    const concepts = ['AI', '新能源', '半导体', '5G', '芯片', '云计算', '区块链', '元宇宙'];
    
    return {
      stockCode,
      stockName,
      industry: industries[Math.floor(Math.random() * industries.length)],
      concepts: [concepts[Math.floor(Math.random() * concepts.length)], concepts[Math.floor(Math.random() * concepts.length)]],
      industryRank: Math.floor(Math.random() * 50) + 1,
      conceptRank: Math.floor(Math.random() * 50) + 1,
      popularityScore: Math.floor(Math.random() * 100),
      popularityTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      searchVolume: Math.floor(Math.random() * 10000) + 1000
    };
  }

  // 获取财务数据
  private async getFinancialData(stockCode: string): Promise<FinancialData> {
    // 模拟财务数据
    return {
      stockCode,
      eps: 0.5 + Math.random() * 5,
      pe: 10 + Math.random() * 40,
      pb: 1 + Math.random() * 5,
      roe: 5 + Math.random() * 20,
      revenueGrowth: -10 + Math.random() * 50,
      profitGrowth: -15 + Math.random() * 60,
      debtToAsset: 0.3 + Math.random() * 0.4,
      cashFlow: Math.random() * 10000000000,
      industryAveragePE: 20 + Math.random() * 20,
      industryAveragePB: 2 + Math.random() * 3
    };
  }

  // 获取调研数据
  private async getResearchData(stockCode: string): Promise<ResearchData> {
    // 模拟调研数据
    const recommendations: Array<'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'> = ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'];
    
    return {
      stockCode,
      researchCount: Math.floor(Math.random() * 20) + 1,
      latestResearchDate: Date.now() - Math.floor(Math.random() * 30) * 86400000,
      institutionalHolders: Math.floor(Math.random() * 100) + 10,
      institutionalChange: -10 + Math.random() * 20,
      targetPrice: 10 + Math.random() * 100,
      analystRecommendations: recommendations[Math.floor(Math.random() * recommendations.length)]
    };
  }

  private cleanupOldSignals() {
    const cutoffTime = Date.now() - (this.config.maxHistoryDays * 24 * 60 * 60 * 1000);
    this.signalHistory = this.signalHistory.filter(signal => signal.timestamp >= cutoffTime);
    
    // 清理主力资金历史数据，只保留最近1小时的数据
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    this.mainForceHistory.forEach((history, stockCode) => {
      const filteredHistory = history.filter(item => item.timestamp >= oneHourAgo);
      if (filteredHistory.length === 0) {
        this.mainForceHistory.delete(stockCode);
      } else {
        this.mainForceHistory.set(stockCode, filteredHistory);
      }
    });
    
    // 清理主力类型历史数据，只保留最近1小时的数据
    this.mainForceTypeHistory.forEach((history, stockCode) => {
      const filteredHistory = history.filter(item => item.timestamp >= oneHourAgo);
      if (filteredHistory.length === 0) {
        this.mainForceTypeHistory.delete(stockCode);
      } else {
        this.mainForceTypeHistory.set(stockCode, filteredHistory);
      }
    });
  }

  // 识别主力类型
  private identifyMainForceType(data: MainForceData): 'nationalTeam' | 'institution' | 'publicFund' | 'privateFund' | 'retail' | 'unknown' {
    const totalFlow = Math.abs(data.totalNetFlow) || 1;
    const superLargeRatio = Math.abs(data.superLargeOrder.netFlow) / totalFlow;
    const largeRatio = Math.abs(data.largeOrder.netFlow) / totalFlow;
    const mediumRatio = Math.abs(data.mediumOrder.netFlow) / totalFlow;
    const smallRatio = Math.abs(data.smallOrder.netFlow) / totalFlow;
    
    // 计算资金流向的稳定性
    const orderImbalance = Math.abs(superLargeRatio + largeRatio - smallRatio);
    
    // 国家队：超大单占比极高，资金流向稳定
    if (superLargeRatio > this.mainForceTypeThresholds.superLargeOrderRatio && orderImbalance > 0.5) {
      return 'nationalTeam';
    }
    // 机构：大单占比高，资金流向稳定
    else if (largeRatio > this.mainForceTypeThresholds.largeOrderRatio && orderImbalance > 0.3) {
      return 'institution';
    }
    // 公募基金：中等订单占比高，资金流向相对稳定
    else if (mediumRatio > 0.4 && orderImbalance > 0.2) {
      return 'publicFund';
    }
    // 私募基金：大订单和超大订单占比均较高
    else if (superLargeRatio > 0.3 && largeRatio > 0.3 && orderImbalance > 0.4) {
      return 'privateFund';
    }
    // 散户：小单占比高，资金流向不稳定
    else if (smallRatio > this.mainForceTypeThresholds.smallOrderRatio && orderImbalance < 0.2) {
      return 'retail';
    }
    // 未知类型
    else {
      return 'unknown';
    }
  }

  // 检查同一主力类型的持续流向
  private checkContinuousMainForceTypeFlow(stockCode: string, data: MainForceData): {
    hasContinuousBuy: boolean;
    hasContinuousSell: boolean;
    continuousPeriods: number;
    averageFlow: number;
    mainForceType: 'nationalTeam' | 'institution' | 'publicFund' | 'privateFund' | 'retail' | 'unknown';
    flowTrend: 'strongUp' | 'up' | 'stable' | 'down' | 'strongDown';
    volumeTrend: 'increasing' | 'stable' | 'decreasing';
  } {
    const mainForceType = this.identifyMainForceType(data);
    
    if (!this.mainForceTypeHistory.has(stockCode)) {
      this.mainForceTypeHistory.set(stockCode, []);
    }
    
    const history = this.mainForceTypeHistory.get(stockCode)!;
    history.push({
      timestamp: Date.now(),
      superLargeFlow: data.superLargeOrder.netFlow,
      largeFlow: data.largeOrder.netFlow,
      mediumFlow: data.mediumOrder.netFlow,
      smallFlow: data.smallOrder.netFlow,
      mainForceType
    });
    
    // 只保留最近的15个数据点，增加分析的深度
    if (history.length > 15) {
      history.shift();
    }
    
    // 检查持续买入
    let continuousBuyCount = 0;
    let continuousSellCount = 0;
    let totalFlow = 0;
    let flowTrend: 'strongUp' | 'up' | 'stable' | 'down' | 'strongDown' = 'stable';
    let volumeTrend: 'increasing' | 'stable' | 'decreasing' = 'stable';
    
    // 计算资金流向趋势
    if (history.length >= 3) {
      const recentFlow = history.slice(-3).reduce((sum, item) => sum + (item.superLargeFlow + item.largeFlow), 0) / 3;
      const previousFlow = history.slice(-6, -3).reduce((sum, item) => sum + (item.superLargeFlow + item.largeFlow), 0) / 3;
      
      if (recentFlow > previousFlow * 1.5) {
        flowTrend = 'strongUp';
      } else if (recentFlow > previousFlow * 1.1) {
        flowTrend = 'up';
      } else if (recentFlow < previousFlow * 0.5) {
        flowTrend = 'strongDown';
      } else if (recentFlow < previousFlow * 0.9) {
        flowTrend = 'down';
      }
      
      // 计算成交量趋势
      const recentVolume = history.slice(-3).reduce((sum, item) => sum + (Math.abs(item.superLargeFlow) + Math.abs(item.largeFlow)), 0) / 3;
      const previousVolume = history.slice(-6, -3).reduce((sum, item) => sum + (Math.abs(item.superLargeFlow) + Math.abs(item.largeFlow)), 0) / 3;
      
      if (recentVolume > previousVolume * 1.3) {
        volumeTrend = 'increasing';
      } else if (recentVolume < previousVolume * 0.7) {
        volumeTrend = 'decreasing';
      }
    }
    
    for (const item of history) {
      // 只考虑相同主力类型的数据
      if (item.mainForceType === mainForceType) {
        const netFlow = item.superLargeFlow + item.largeFlow;
        if (netFlow > this.continuousFlowThreshold) {
          continuousBuyCount++;
          totalFlow += netFlow;
        } else if (netFlow < -this.continuousFlowThreshold) {
          continuousSellCount++;
          totalFlow += netFlow;
        }
      }
    }
    
    return {
      hasContinuousBuy: continuousBuyCount >= this.continuousFlowPeriods,
      hasContinuousSell: continuousSellCount >= this.continuousFlowPeriods,
      continuousPeriods: Math.max(continuousBuyCount, continuousSellCount),
      averageFlow: totalFlow / history.length,
      mainForceType,
      flowTrend,
      volumeTrend
    };
  }

  // 检查主力资金持续流向
  private checkContinuousMainForceFlow(stockCode: string, currentNetFlow: number, mainForceRatio: number, currentPrice: number): {
    hasContinuousBuy: boolean;
    hasContinuousSell: boolean;
    continuousPeriods: number;
    averageFlow: number;
  } {
    if (!this.mainForceHistory.has(stockCode)) {
      this.mainForceHistory.set(stockCode, []);
    }
    
    const history = this.mainForceHistory.get(stockCode)!;
    history.push({ timestamp: Date.now(), netFlow: currentNetFlow, ratio: mainForceRatio, price: currentPrice });
    
    // 只保留最近的10个数据点
    if (history.length > 10) {
      history.shift();
    }
    
    // 获取动态调整的周期数
    const dynamicPeriods = this.getDynamicContinuousFlowPeriods(stockCode);
    
    // 检查持续买入
    let continuousBuyCount = 0;
    let continuousSellCount = 0;
    let totalFlow = 0;
    
    for (const item of history) {
      if (item.netFlow > this.continuousFlowThreshold) {
        continuousBuyCount++;
        totalFlow += item.netFlow;
      } else if (item.netFlow < -this.continuousFlowThreshold) {
        continuousSellCount++;
        totalFlow += item.netFlow;
      }
    }
    
    return {
      hasContinuousBuy: continuousBuyCount >= dynamicPeriods,
      hasContinuousSell: continuousSellCount >= dynamicPeriods,
      continuousPeriods: Math.max(continuousBuyCount, continuousSellCount),
      averageFlow: totalFlow / history.length
    };
  }

  // 分析价格与资金背离
  private analyzePriceFundFlowDivergence(stockCode: string, currentPrice: number, currentNetFlow: number): {
    hasDivergence: boolean;
    divergenceType: 'bullish' | 'bearish' | 'none';
    reason: string;
    strength: number; // 背离强度
  } {
    if (!this.priceHistory.has(stockCode)) {
      this.priceHistory.set(stockCode, []);
    }
    
    const priceHistory = this.priceHistory.get(stockCode)!;
    priceHistory.push({ timestamp: Date.now(), price: currentPrice });
    
    // 只保留最近的15个数据点，增加分析深度
    if (priceHistory.length > 15) {
      priceHistory.shift();
    }
    
    if (priceHistory.length < 5) {
      return { hasDivergence: false, divergenceType: 'none', reason: '数据不足', strength: 0 };
    }
    
    // 计算价格趋势（使用更多数据点）
    const priceTrend = this.calculatePriceTrend(priceHistory);
    // 计算价格变化百分比
    const priceChangePercent = this.calculatePriceChangePercent(priceHistory);
    // 计算资金流向趋势
    const fundFlowTrend = currentNetFlow > 0 ? 'up' : 'down';
    // 计算资金流向强度
    const fundFlowStrength = Math.abs(currentNetFlow) / 1000000; // 转换为百万元
    
    // 分析背离
    if (priceTrend === 'down' && fundFlowTrend === 'up') {
      // 计算背离强度
      let strength = 0;
      if (priceChangePercent < -2 && fundFlowStrength > 10) {
        strength = 3; // 强背离
      } else if (priceChangePercent < -1 && fundFlowStrength > 5) {
        strength = 2; // 中等背离
      } else if (priceChangePercent < 0 && fundFlowStrength > 1) {
        strength = 1; // 弱背离
      }
      
      return { 
        hasDivergence: true, 
        divergenceType: 'bullish', 
        reason: `价格下跌${priceChangePercent.toFixed(1)}%但资金净流入${fundFlowStrength.toFixed(1)}百万元，可能是主力吸筹`, 
        strength
      };
    } else if (priceTrend === 'up' && fundFlowTrend === 'down') {
      // 计算背离强度
      let strength = 0;
      if (priceChangePercent > 2 && fundFlowStrength > 10) {
        strength = 3; // 强背离
      } else if (priceChangePercent > 1 && fundFlowStrength > 5) {
        strength = 2; // 中等背离
      } else if (priceChangePercent > 0 && fundFlowStrength > 1) {
        strength = 1; // 弱背离
      }
      
      return { 
        hasDivergence: true, 
        divergenceType: 'bearish', 
        reason: `价格上涨${priceChangePercent.toFixed(1)}%但资金净流出${fundFlowStrength.toFixed(1)}百万元，可能是主力出货`, 
        strength
      };
    }
    
    return { hasDivergence: false, divergenceType: 'none', reason: '无背离', strength: 0 };
  }

  // 计算价格趋势
  private calculatePriceTrend(priceHistory: Array<{ timestamp: number; price: number }>): 'up' | 'down' | 'stable' {
    if (priceHistory.length < 3) {
      return 'stable';
    }
    
    const recentPrices = priceHistory.slice(-3).map(item => item.price);
    const firstPrice = recentPrices[0];
    const lastPrice = recentPrices[2];
    const changePercent = (lastPrice - firstPrice) / firstPrice * 100;
    
    if (changePercent > 1) {
      return 'up';
    } else if (changePercent < -1) {
      return 'down';
    } else {
      return 'stable';
    }
  }

  // 计算价格变化百分比
  private calculatePriceChangePercent(priceHistory: Array<{ timestamp: number; price: number }>): number {
    if (priceHistory.length < 2) {
      return 0;
    }
    
    const firstPrice = priceHistory[0].price;
    const lastPrice = priceHistory[priceHistory.length - 1].price;
    return (lastPrice - firstPrice) / firstPrice * 100;
  }

  // 计算移动平均线
  private calculateMA(prices: number[], period: number): number {
    if (prices.length < period) {
      return 0;
    }
    const recentPrices = prices.slice(-period);
    return recentPrices.reduce((sum, price) => sum + price, 0) / period;
  }

  // 计算RSI指标
  private calculateRSI(prices: number[], period: number): number {
    if (prices.length < period + 1) {
      return 50; // 默认值
    }
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    if (losses === 0) {
      return 100;
    }
    
    const rs = gains / losses;
    return 100 - (100 / (1 + rs));
  }

  // 计算MACD指标
  private calculateMACD(prices: number[]): { macd: number; signal: number } {
    if (prices.length < 26) {
      return { macd: 0, signal: 0 };
    }
    
    // 计算12日EMA
    const ema12 = this.calculateEMA(prices, 12);
    // 计算26日EMA
    const ema26 = this.calculateEMA(prices, 26);
    // MACD线
    const macd = ema12 - ema26;
    // 计算9日信号线
    const signal = this.calculateEMA([...prices.slice(-8), macd], 9);
    
    return { macd, signal };
  }

  // 计算指数移动平均线
  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) {
      return 0;
    }
    
    const k = 2 / (period + 1);
    let ema = prices[prices.length - period];
    
    for (let i = prices.length - period + 1; i < prices.length; i++) {
      ema = (prices[i] - ema) * k + ema;
    }
    
    return ema;
  }

  // 计算KDJ指标
  private calculateKDJ(prices: number[], period: number = 9): { k: number; d: number; j: number } {
    if (prices.length < period) {
      return { k: 50, d: 50, j: 50 };
    }
    
    // 计算最高价、最低价和收盘价
    const highPrices = [];
    const lowPrices = [];
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const periodPrices = prices.slice(i - period + 1, i + 1);
      highPrices.push(Math.max(...periodPrices));
      lowPrices.push(Math.min(...periodPrices));
    }
    
    // 计算RSV
    const rsv = [];
    for (let i = 0; i < highPrices.length; i++) {
      const high = highPrices[i];
      const low = lowPrices[i];
      const close = prices[prices.length - highPrices.length + i];
      rsv.push((close - low) / (high - low) * 100);
    }
    
    // 计算K、D、J值
    let k = 50;
    let d = 50;
    for (let i = 0; i < rsv.length; i++) {
      k = (2/3) * k + (1/3) * rsv[i];
      d = (2/3) * d + (1/3) * k;
    }
    const j = 3 * k - 2 * d;
    
    return { k, d, j };
  }

  // 计算布林带
  private calculateBollingerBands(prices: number[], period: number = 20, multiplier: number = 2): { middle: number; upper: number; lower: number } {
    if (prices.length < period) {
      return { middle: 0, upper: 0, lower: 0 };
    }
    
    // 计算移动平均线
    const middle = this.calculateMA(prices, period);
    
    // 计算标准差
    const recentPrices = prices.slice(-period);
    const mean = recentPrices.reduce((sum, price) => sum + price, 0) / period;
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    // 计算上轨和下轨
    const upper = middle + multiplier * stdDev;
    const lower = middle - multiplier * stdDev;
    
    return { middle, upper, lower };
  }

  // 分析成交量特征
  private analyzeVolumeCharacteristics(stockCode: string, currentVolume: number, currentVolumeAmplification: number): {
    hasAccumulationVolume: boolean;
    volumeTrend: 'increasing' | 'decreasing' | 'stable';
    reason: string;
  } {
    if (!this.volumeHistory.has(stockCode)) {
      this.volumeHistory.set(stockCode, []);
    }
    
    const volumeHistory = this.volumeHistory.get(stockCode)!;
    volumeHistory.push({ timestamp: Date.now(), volume: currentVolume, volumeAmplification: currentVolumeAmplification || 1 });
    
    // 只保留最近的10个数据点
    if (volumeHistory.length > 10) {
      volumeHistory.shift();
    }
    
    if (volumeHistory.length < 3) {
      return { hasAccumulationVolume: false, volumeTrend: 'stable', reason: '数据不足' };
    }
    
    // 计算成交量趋势
    const volumeTrend = this.calculateVolumeTrend(volumeHistory);
    
    // 分析温和放量特征
    const hasAccumulationVolume = currentVolumeAmplification > 1.2 && currentVolumeAmplification < 3;
    
    let reason = '';
    if (hasAccumulationVolume && volumeTrend === 'increasing') {
      reason = '温和放量，可能是主力吸筹';
    } else if (currentVolumeAmplification > 3) {
      reason = '成交量大幅放大，可能是主力拉升或出货';
    } else if (volumeTrend === 'decreasing') {
      reason = '成交量萎缩，市场活跃度降低';
    } else {
      reason = '成交量稳定';
    }
    
    return { hasAccumulationVolume, volumeTrend, reason };
  }

  // 计算成交量趋势
  private calculateVolumeTrend(volumeHistory: Array<{ timestamp: number; volume: number; volumeAmplification: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (volumeHistory.length < 3) {
      return 'stable';
    }
    
    const recentVolumes = volumeHistory.slice(-3).map(item => item.volume);
    const firstVolume = recentVolumes[0];
    const lastVolume = recentVolumes[2];
    const changePercent = (lastVolume - firstVolume) / firstVolume * 100;
    
    if (changePercent > 20) {
      return 'increasing';
    } else if (changePercent < -20) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }

  // 识别主力行为模式
  private identifyMainForceBehavior(stockCode: string, data: MainForceData): 'accumulation' | 'washing' | 'pulling' | 'distribution' | 'unknown' {
    const priceDivergence = this.analyzePriceFundFlowDivergence(stockCode, data.currentPrice || 0, data.mainForceNetFlow);
    const volumeAnalysis = this.analyzeVolumeCharacteristics(stockCode, 0, data.volumeAmplification || 1);
    const mainForceRatio = Math.abs(data.mainForceNetFlow) / (Math.abs(data.totalNetFlow) || 1);
    // 计算资金流出速度
    const outflowSpeed = Math.abs(data.mainForceNetFlow) / (data.turnoverRate || 1);
    // 分析主力类型
    const mainForceType = this.identifyMainForceType(data);
    // 根据市值调整主力资金阈值
    const marketCap = data.marketCap || 0;
    const adjustedThresholds = this.getAdjustedThresholdsByMarketCap(marketCap);
    
    // 吸筹阶段：价格下跌或横盘，资金净流入，温和放量，主力资金占比高
    if (priceDivergence.divergenceType === 'bullish' && 
        (volumeAnalysis.hasAccumulationVolume || (data.volumeAmplification || 0) > 1.1) &&
        mainForceRatio > 0.4 &&
        data.mainForceNetFlow > adjustedThresholds.smallFlow) {
      // 强吸筹：价格下跌且资金大幅流入
      if (priceDivergence.strength >= 2 && data.mainForceNetFlow > adjustedThresholds.largeFlow) {
        return 'accumulation';
      }
      // 弱吸筹：价格横盘或小幅下跌，资金持续流入
      else if (priceDivergence.strength >= 1 && data.mainForceNetFlow > adjustedThresholds.smallFlow) {
        return 'accumulation';
      }
    }
    // 洗盘阶段：价格震荡，资金小幅流出或流入，成交量稳定
    else if (priceDivergence.divergenceType === 'none' && 
             Math.abs(data.mainForceNetFlow) < adjustedThresholds.smallFlow &&
             (data.volumeAmplification || 0) < 1.5 &&
             // 洗盘特征：资金流出速度慢，主力资金占比适中
             outflowSpeed < adjustedThresholds.smallFlow &&
             mainForceRatio < 0.6) {
      return 'washing';
    }
    // 拉升阶段：价格上涨，资金大幅净流入，成交量放大，主力资金占比高
    else if (priceDivergence.divergenceType === 'none' && 
             data.mainForceNetFlow > adjustedThresholds.largeFlow && 
             (data.volumeAmplification || 0) > 2 &&
             mainForceRatio > 0.6) {
      return 'pulling';
    }
    // 出货阶段：价格上涨但资金净流出，成交量放大，主力资金占比高
    else if ((priceDivergence.divergenceType === 'bearish' || data.mainForceNetFlow < -adjustedThresholds.mediumFlow) && 
             (data.volumeAmplification || 0) > 2 &&
             mainForceRatio > 0.5 &&
             // 出货特征：资金流出速度快，主力资金占比高
             outflowSpeed > adjustedThresholds.smallFlow) {
      return 'distribution';
    }
    // 额外的出货检测：资金大幅流出，成交量放大，主力资金占比高
    else if (data.mainForceNetFlow < -adjustedThresholds.largeFlow && 
             (data.volumeAmplification || 0) > 2.5 &&
             mainForceRatio > 0.7) {
      return 'distribution';
    }
    // 额外的吸筹检测：价格横盘但资金持续流入
    else if (priceDivergence.divergenceType === 'none' && 
             data.mainForceNetFlow > adjustedThresholds.mediumFlow &&
             (data.volumeAmplification || 0) > 1.2 &&
             mainForceRatio > 0.5) {
      return 'accumulation';
    }
    
    // 默认返回unknown
    return 'unknown';
  }

  // 分析市场环境
  private analyzeMarketEnvironment(stockCode: string): 'trend' | '震荡' {
    if (!this.priceHistory.has(stockCode)) {
      return '震荡';
    }
    
    const priceHistory = this.priceHistory.get(stockCode)!;
    if (priceHistory.length < 5) {
      return '震荡';
    }
    
    // 计算价格波动率
    const prices = priceHistory.map(item => item.price);
    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance) / mean * 100;
    
    // 计算价格趋势强度
    const recentPrices = priceHistory.slice(-5);
    const firstPrice = recentPrices[0].price;
    const lastPrice = recentPrices[4].price;
    const priceChange = (lastPrice - firstPrice) / firstPrice * 100;
    
    // 根据波动率和价格变化判断市场环境
    if (volatility < 3 && Math.abs(priceChange) > 5) {
      return 'trend';
    } else {
      return '震荡';
    }
  }

  // 动态调整持续买入的周期数
  private getDynamicContinuousFlowPeriods(stockCode: string): number {
    const marketEnvironment = this.analyzeMarketEnvironment(stockCode);
    
    if (marketEnvironment === 'trend') {
      // 趋势市减少周期数
      return 2;
    } else {
      // 震荡市增加周期数
      return 4;
    }
  }

  // 根据市值调整主力资金阈值
  private getAdjustedThresholdsByMarketCap(marketCap: number): {
    smallFlow: number;
    mediumFlow: number;
    largeFlow: number;
  } {
    // 市值单位：元
    // 超大型公司：> 1000亿
    if (marketCap > 100000000000) {
      return {
        smallFlow: 5000000,  // 500万
        mediumFlow: 20000000, // 2000万
        largeFlow: 50000000   // 5000万
      };
    }
    // 大型公司：100亿 - 1000亿
    else if (marketCap > 10000000000) {
      return {
        smallFlow: 2000000,  // 200万
        mediumFlow: 10000000, // 1000万
        largeFlow: 30000000   // 3000万
      };
    }
    // 中型公司：10亿 - 100亿
    else if (marketCap > 1000000000) {
      return {
        smallFlow: 1000000,  // 100万
        mediumFlow: 5000000,  // 500万
        largeFlow: 15000000   // 1500万
      };
    }
    // 小型公司：< 10亿
    else {
      return {
        smallFlow: 500000,   // 50万
        mediumFlow: 1000000,  // 100万
        largeFlow: 3000000    // 300万
      };
    }
  }

  // 计算市场情绪
  private calculateMarketSentiment(data: MainForceData, priceHistory: Array<{ timestamp: number; price: number }>): number {
    let sentiment = 0;
    
    // 1. 基于主力资金流向
    const mainForceFlow = data.mainForceNetFlow;
    const totalFlow = data.totalNetFlow;
    if (totalFlow !== 0) {
      sentiment += mainForceFlow / Math.abs(totalFlow) * 0.4;
    }
    
    // 2. 基于价格趋势
    if (priceHistory.length >= 5) {
      const prices = priceHistory.map(item => item.price);
      const recentPrices = prices.slice(-5);
      const firstPrice = recentPrices[0];
      const lastPrice = recentPrices[4];
      const priceChange = (lastPrice - firstPrice) / firstPrice;
      sentiment += priceChange * 0.3;
    }
    
    // 3. 基于成交量变化
    const volumeAmplification = data.volumeAmplification || 1;
    sentiment += (volumeAmplification - 1) * 0.15;
    
    // 4. 基于换手率
    const turnoverRate = data.turnoverRate || 0;
    sentiment += (turnoverRate - 5) / 10 * 0.15;
    
    // 归一化到 -1 到 1 之间
    return Math.max(-1, Math.min(1, sentiment));
  }

  getSignalHistory(): OptimizedSignal[] {
    return this.applyFilters(this.signalHistory);
  }

  private applyFilters(signals: OptimizedSignal[]): OptimizedSignal[] {
    let filtered = [...signals];
    
    if (this.config.stockFilter) {
      const filter = this.config.stockFilter.toLowerCase();
      filtered = filtered.filter(signal => 
        signal.stockCode.toLowerCase().includes(filter) || 
        signal.stockName.toLowerCase().includes(filter)
      );
    }
    
    filtered = filtered.filter(signal => signal.confidence >= this.config.minConfidence);
    filtered = filtered.filter(signal => this.config.signalTypes.includes(signal.type));
    
    if (!this.config.enableAuctionSignals) {
      filtered = filtered.filter(signal => !signal.isAuctionPeriod);
    }
    
    if (!this.config.enablePredictiveSignals) {
      filtered = filtered.filter(signal => !signal.isPredictiveSignal);
    }
    
    filtered.sort((a, b) => {
      switch (this.config.sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'score':
          return b.score - a.score;
        case 'time':
          return b.timestamp - a.timestamp;
        case 'mainForceFlow':
          return (b.mainForceFlow || 0) - (a.mainForceFlow || 0);
        default:
          return b.confidence - a.confidence;
      }
    });
    
    return filtered;
  }

  processPredictionData(stockCode: string, stockName: string, currentPrice?: number) {
    const prediction = this.predictionManager.generatePrediction(stockCode, stockName);
    if (prediction && prediction.predictionType !== 'hold' && prediction.confidence >= this.config.minConfidence) {
      const predictiveSignal: OptimizedSignal = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        stockCode: prediction.stockCode,
        stockName: prediction.stockName,
        type: prediction.predictionType as 'buy' | 'sell',
        score: prediction.confidence,
        confidence: prediction.confidence,
        reason: '【预测信号】' + prediction.reasons.join('；'),
        timestamp: prediction.timestamp,
        isRead: false,
        prediction,
        isPredictiveSignal: true,
        price: currentPrice
      };

      if (predictiveSignal.type === 'buy') {
        this.pendingBuySignals.push(predictiveSignal);
      } else {
        this.pendingSellSignals.push(predictiveSignal);
      }

      this.listeners.forEach(listener => listener([predictiveSignal]));
    }
    return prediction;
  }

  initializeHistoricalData(stockCode: string, days = 60) {
    const mockData = this.predictionManager.generateMockHistoricalData(stockCode, days);
    this.predictionManager.addHistoricalData(stockCode, mockData);
  }

  getOptimizedBuySignals(): OptimizedSignal[] {
    return this.filterAndRankBuySignals(this.pendingBuySignals);
  }

  getOptimizedSellSignals(): OptimizedSignal[] {
    return this.filterSellSignals(this.pendingSellSignals);
  }

  addPosition(position: StockPosition) {
    this.positions.set(position.stockCode, position);
    this.savePositionsToStorage();
  }

  removePosition(stockCode: string) {
    this.positions.delete(stockCode);
    this.savePositionsToStorage();
  }

  getPositions(): StockPosition[] {
    return Array.from(this.positions.values());
  }

  getPosition(stockCode: string): StockPosition | undefined {
    return this.positions.get(stockCode);
  }

  markSignalAsNotified(signalId: string) {
    this.notifiedSignals.add(signalId);
  }

  // 清空历史提示信号数据
  clearSignalHistory(): void {
    this.signalHistory = [];
    this.pendingBuySignals = [];
    this.pendingSellSignals = [];
    this.listeners.forEach(listener => listener([]));
  }

  shouldNotifySignal(signal: OptimizedSignal): boolean {
    if (this.notifiedSignals.has(signal.id)) {
      return false;
    }
    
    const timeThreshold = 30 * 60 * 1000;
    const recentNotified = Array.from(this.notifiedSignals).some(id => {
      const timestamp = parseInt(id.split('-')[0] || '0');
      return Date.now() - timestamp < timeThreshold && 
             id.includes(signal.stockCode) && 
             id.includes(signal.type);
    });
    
    return !recentNotified;
  }

  subscribe(listener: (signals: OptimizedSignal[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  clearPendingSignals() {
    this.pendingBuySignals = [];
    this.pendingSellSignals = [];
  }

  updateConfig(newConfig: Partial<SignalFilterConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): SignalFilterConfig {
    return { ...this.config };
  }
}

let signalManagerInstance: OptimizedSignalManager | null = null;

export const getOptimizedSignalManager = (): OptimizedSignalManager => {
  if (!signalManagerInstance) {
    signalManagerInstance = new OptimizedSignalManager();
  }
  return signalManagerInstance;
};
