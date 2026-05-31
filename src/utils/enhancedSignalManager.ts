import { StockQuote } from './stockData';
import { enhancedDataSourceManager } from './enhancedDataSourceManager';

// 筹码峰数据接口
interface ChipPeakData {
  code: string;
  price: number;
  volume: number;
  percentage: number;
}

// 增强的信号接口
export interface EnhancedSignal {
  id: string;
  stockCode: string;
  stockName: string;
  type: 'buy' | 'sell';
  price: number;
  confidence: number;
  reason: string;
  timestamp: number;
  chipPeakAnalysis?: {
    supportLevel: number;
    resistanceLevel: number;
    chipConcentration: number;
    mainChipArea: number;
  };
  technicalAnalysis?: {
    macd: 'bullish' | 'bearish' | 'neutral';
    kdj: 'bullish' | 'bearish' | 'neutral';
    rsi: number;
  };
}

// 增强的信号管理器
export class EnhancedSignalManager {
  private signals: EnhancedSignal[] = [];
  private signalHistory: EnhancedSignal[] = [];
  private maxSignals = 100;
  private maxHistory = 1000;

  constructor() {
    // 初始化信号管理器
  }

  // 生成买卖信号
  async generateSignals(codes: string[]): Promise<EnhancedSignal[]> {
    try {
      // 获取实时行情数据
      const quotes = await enhancedDataSourceManager.getRealtimeQuote(codes);
      
      // 过滤掉数据不完整的股票
      const validQuotes = quotes.filter(quote => 
        quote.price > 0 && 
        quote.volume > 0 &&
        quote.name && quote.name !== `股票${quote.code}`
      );

      // 生成信号
      const newSignals: EnhancedSignal[] = [];
      
      for (const quote of validQuotes) {
        const signal = await this.generateSignal(quote);
        if (signal) {
          newSignals.push(signal);
        }
      }

      // 更新信号列表
      this.signals = [...newSignals, ...this.signals].slice(0, this.maxSignals);
      this.signalHistory = [...newSignals, ...this.signalHistory].slice(0, this.maxHistory);

      return newSignals;
    } catch (error) {
      console.error('生成信号失败:', error);
      return [];
    }
  }

  // 生成单个股票的信号
  private async generateSignal(quote: StockQuote): Promise<EnhancedSignal | null> {
    try {
      // 计算技术指标
      const technicalAnalysis = this.calculateTechnicalAnalysis(quote);
      
      // 分析筹码峰
      const chipPeakAnalysis = await this.analyzeChipPeak(quote.code);
      
      // 计算综合得分
      const score = this.calculateSignalScore(quote, technicalAnalysis, chipPeakAnalysis);
      
      // 生成信号
      if (score > 70) {
        return {
          id: `signal_${Date.now()}_${quote.code}`,
          stockCode: quote.code,
          stockName: quote.name,
          type: 'buy',
          price: quote.price,
          confidence: score,
          reason: this.generateBuyReason(quote, technicalAnalysis, chipPeakAnalysis),
          timestamp: Date.now(),
          chipPeakAnalysis,
          technicalAnalysis
        };
      } else if (score < 30) {
        return {
          id: `signal_${Date.now()}_${quote.code}`,
          stockCode: quote.code,
          stockName: quote.name,
          type: 'sell',
          price: quote.price,
          confidence: 100 - score,
          reason: this.generateSellReason(quote, technicalAnalysis, chipPeakAnalysis),
          timestamp: Date.now(),
          chipPeakAnalysis,
          technicalAnalysis
        };
      }

      return null;
    } catch (error) {
      console.warn(`生成${quote.code}信号失败:`, error);
      return null;
    }
  }

  // 计算技术指标
  private calculateTechnicalAnalysis(quote: StockQuote) {
    // 简化的技术指标计算
    const changePercent = quote.changePercent || 0;
    
    // 计算RSI（简化版）
    const rsi = Math.min(100, Math.max(0, 50 + (changePercent / 2)));
    
    // 简化的MACD和KDJ判断
    const macd: "neutral" | "bullish" | "bearish" = changePercent > 2 ? 'bullish' : changePercent < -2 ? 'bearish' : 'neutral';
    const kdj: "neutral" | "bullish" | "bearish" = rsi > 70 ? 'bearish' : rsi < 30 ? 'bullish' : 'neutral';

    return {
      macd,
      kdj,
      rsi
    };
  }

  // 分析筹码峰
  private async analyzeChipPeak(code: string): Promise<any> {
    try {
      // 这里应该调用筹码峰数据接口
      // 由于没有实际的API，我们使用模拟数据
      return {
        supportLevel: 0,
        resistanceLevel: 0,
        chipConcentration: 50,
        mainChipArea: 0
      };
    } catch (error) {
      console.warn(`分析${code}筹码峰失败:`, error);
      // 返回默认值
      return {
        supportLevel: 0,
        resistanceLevel: 0,
        chipConcentration: 50,
        mainChipArea: 0
      };
    }
  }

  // 计算信号得分
  private calculateSignalScore(quote: StockQuote, technicalAnalysis: any, chipPeakAnalysis: any): number {
    let score = 50;

    // 价格变化得分
    const changePercent = quote.changePercent || 0;
    if (changePercent > 5) score += 20;
    else if (changePercent > 2) score += 10;
    else if (changePercent < -5) score -= 20;
    else if (changePercent < -2) score -= 10;

    // 成交量得分
    const volumeScore = Math.min(20, Math.log10(quote.volume) * 2);
    score += volumeScore;

    // 技术指标得分
    if (technicalAnalysis.macd === 'bullish') score += 10;
    else if (technicalAnalysis.macd === 'bearish') score -= 10;

    if (technicalAnalysis.kdj === 'bullish') score += 10;
    else if (technicalAnalysis.kdj === 'bearish') score -= 10;

    // RSI得分
    if (technicalAnalysis.rsi < 30) score += 15; // 超卖
    else if (technicalAnalysis.rsi > 70) score -= 15; // 超买

    // 筹码峰得分
    if (chipPeakAnalysis.chipConcentration > 70) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  // 生成买入理由
  private generateBuyReason(quote: StockQuote, technicalAnalysis: any, chipPeakAnalysis: any): string {
    const reasons = [];

    const changePercent = quote.changePercent || 0;
    if (changePercent > 5) reasons.push(`价格大幅上涨 ${changePercent.toFixed(2)}%`);
    else if (changePercent > 2) reasons.push(`价格上涨 ${changePercent.toFixed(2)}%`);

    if (quote.volume > 10000000) reasons.push('成交量放大');

    if (technicalAnalysis.macd === 'bullish') reasons.push('MACD金叉');
    if (technicalAnalysis.kdj === 'bullish') reasons.push('KDJ金叉');
    if (technicalAnalysis.rsi < 30) reasons.push('RSI超卖');

    if (chipPeakAnalysis.chipConcentration > 70) reasons.push('筹码高度集中');

    return reasons.length > 0 ? reasons.join('，') : '综合分析看好';
  }

  // 生成卖出理由
  private generateSellReason(quote: StockQuote, technicalAnalysis: any, chipPeakAnalysis: any): string {
    const reasons = [];

    const changePercent = quote.changePercent || 0;
    if (changePercent < -5) reasons.push(`价格大幅下跌 ${Math.abs(changePercent).toFixed(2)}%`);
    else if (changePercent < -2) reasons.push(`价格下跌 ${Math.abs(changePercent).toFixed(2)}%`);

    if (technicalAnalysis.macd === 'bearish') reasons.push('MACD死叉');
    if (technicalAnalysis.kdj === 'bearish') reasons.push('KDJ死叉');
    if (technicalAnalysis.rsi > 70) reasons.push('RSI超买');

    return reasons.length > 0 ? reasons.join('，') : '综合分析看空';
  }

  // 获取信号列表
  getSignals(): EnhancedSignal[] {
    return this.signals;
  }

  // 获取信号历史
  getSignalHistory(): EnhancedSignal[] {
    return this.signalHistory;
  }

  // 清除信号
  clearSignals(): void {
    this.signals = [];
  }

  // 清除信号历史
  clearSignalHistory(): void {
    this.signalHistory = [];
  }
}

// 导出单例
export const enhancedSignalManager = new EnhancedSignalManager();
export const getEnhancedSignalManager = () => enhancedSignalManager;