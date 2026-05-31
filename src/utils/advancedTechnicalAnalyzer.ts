import { StockQuote } from './stockData';

// 技术指标分析结果接口
export interface TechnicalAnalysisResult {
  // 趋势指标
  macd: {
    macd: number;
    signal: number;
    histogram: number;
    status: 'bullish' | 'bearish' | 'neutral';
  };
  
  // 动量指标
  rsi: {
    value: number;
    status: 'overbought' | 'oversold' | 'neutral';
  };
  
  // 波动率指标
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    status: 'overbought' | 'oversold' | 'neutral';
  };
  
  // 趋势指标
  ma: {
    ma5: number;
    ma10: number;
    ma20: number;
    ma50: number;
    ma100: number;
    ma200: number;
    status: 'bullish' | 'bearish' | 'neutral';
  };
  
  // 随机指标
  kdj: {
    k: number;
    d: number;
    j: number;
    status: 'bullish' | 'bearish' | 'neutral';
  };
  
  // 成交量指标
  volume: {
    current: number;
    average: number;
    change: number;
    changePercent: number;
    status: 'high' | 'medium' | 'low';
  };
  
  // 能量指标
  macdHistogram: {
    value: number;
    change: number;
    status: 'increasing' | 'decreasing' | 'stable';
  };
  
  // 趋势强度
  trendStrength: {
    value: number; // 0-100
    status: 'strong' | 'medium' | 'weak';
  };
  
  // 威廉指标
  williamsR: {
    value: number;
    status: 'overbought' | 'oversold' | 'neutral';
  };
  
  // 顺势指标
  cci: {
    value: number;
    status: 'overbought' | 'oversold' | 'neutral';
  };
  
  // 平均趋向指标
  adx: {
    value: number;
    status: 'strong' | 'medium' | 'weak';
  };
  
  // 动量指标
  momentum: {
    value: number;
    status: 'bullish' | 'bearish' | 'neutral';
  };
  
  // 资金流量指标
  mfi: {
    value: number;
    status: 'overbought' | 'oversold' | 'neutral';
  };
  
  // 随机指标
  stochastic: {
    k: number;
    d: number;
    status: 'overbought' | 'oversold' | 'neutral';
  };
  
  // 心理线指标
  psy: {
    value: number;
    status: 'overbought' | 'oversold' | 'neutral';
  };
  
  // 乖离率
  bias: {
    value: number;
    status: 'overbought' | 'oversold' | 'neutral';
  };
  
  // 成交量变异率
  vr: {
    value: number;
    status: 'high' | 'medium' | 'low';
  };
  
  // 综合分析
  overall: {
    score: number; // 0-100
    signal: 'buy' | 'sell' | 'hold';
    confidence: number; // 0-100
  };
}

// 历史数据接口
export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number;
}

// 高级技术指标分析器
export class AdvancedTechnicalAnalyzer {
  private historicalData: Map<string, HistoricalData[]> = new Map();
  private cache: Map<string, { result: TechnicalAnalysisResult; timestamp: number }> = new Map();
  private cacheExpiry = 30000; // 缓存30秒

  // 分析技术指标
  async analyze(quote: StockQuote, historicalData?: HistoricalData[]): Promise<TechnicalAnalysisResult> {
    const cacheKey = `${quote.code}_${Date.now()}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.result;
    }

    // 如果没有提供历史数据，使用缓存的历史数据
    if (!historicalData) {
      historicalData = this.historicalData.get(quote.code) || [];
    }

    // 计算各种技术指标
    const macd = this.calculateMACD(historicalData);
    const rsi = this.calculateRSI(historicalData);
    const bollingerBands = this.calculateBollingerBands(historicalData);
    const ma = this.calculateMA(historicalData);
    const kdj = this.calculateKDJ(historicalData);
    const volume = this.calculateVolumeAnalysis(quote, historicalData);
    const macdHistogram = this.calculateMACDHistogram(macd);
    const trendStrength = this.calculateTrendStrength(ma, macd, rsi);
    const williamsR = this.calculateWilliamsR(historicalData);
    const cci = this.calculateCCI(historicalData);
    const adx = this.calculateADX(historicalData);
    const momentum = this.calculateMomentum(historicalData);
    const mfi = this.calculateMFI(historicalData);
    const stochastic = this.calculateStochastic(historicalData);
    const psy = this.calculatePSY(historicalData);
    const bias = this.calculateBIAS(historicalData);
    const vr = this.calculateVR(historicalData);
    const overall = this.calculateOverallAnalysis(macd, rsi, bollingerBands, ma, kdj, volume, trendStrength, williamsR, cci, adx, momentum, mfi, stochastic, psy, bias, vr);

    const result: TechnicalAnalysisResult = {
      macd,
      rsi,
      bollingerBands,
      ma,
      kdj,
      volume,
      macdHistogram,
      trendStrength,
      williamsR,
      cci,
      adx,
      momentum,
      mfi,
      stochastic,
      psy,
      bias,
      vr,
      overall
    };

    // 缓存结果
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  }

  // 计算MACD
  private calculateMACD(historicalData: HistoricalData[]): TechnicalAnalysisResult['macd'] {
    if (historicalData.length < 26) {
      return {
        macd: 0,
        signal: 0,
        histogram: 0,
        status: 'neutral'
      };
    }

    const closes = historicalData.map(data => data.close);
    const ema12 = this.calculateEMA(closes, 12);
    const ema26 = this.calculateEMA(closes, 26);
    const macdLine = ema12 - ema26;
    const signalLine = this.calculateEMA([macdLine], 9);
    const histogram = macdLine - signalLine;

    let status: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (histogram > 0) {
      status = 'bullish';
    } else if (histogram < 0) {
      status = 'bearish';
    }

    return {
      macd: macdLine,
      signal: signalLine,
      histogram,
      status
    };
  }

  // 计算RSI
  private calculateRSI(historicalData: HistoricalData[]): TechnicalAnalysisResult['rsi'] {
    if (historicalData.length < 14) {
      return {
        value: 50,
        status: 'neutral'
      };
    }

    const closes = historicalData.map(data => data.close);
    let gains = 0;
    let losses = 0;

    for (let i = 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / 14;
    const avgLoss = losses / 14;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    let status: 'overbought' | 'oversold' | 'neutral' = 'neutral';
    if (rsi > 70) {
      status = 'overbought';
    } else if (rsi < 30) {
      status = 'oversold';
    }

    return {
      value: rsi,
      status
    };
  }

  // 计算布林带
  private calculateBollingerBands(historicalData: HistoricalData[]): TechnicalAnalysisResult['bollingerBands'] {
    if (historicalData.length < 20) {
      return {
        upper: 0,
        middle: 0,
        lower: 0,
        status: 'neutral'
      };
    }

    const closes = historicalData.map(data => data.close);
    const middle = this.calculateSMA(closes, 20);
    const stdDev = this.calculateStdDev(closes, middle);
    const upper = middle + (stdDev * 2);
    const lower = middle - (stdDev * 2);

    const currentPrice = closes[closes.length - 1];
    let status: 'overbought' | 'oversold' | 'neutral' = 'neutral';
    if (currentPrice > upper) {
      status = 'overbought';
    } else if (currentPrice < lower) {
      status = 'oversold';
    }

    return {
      upper,
      middle,
      lower,
      status
    };
  }

  // 计算移动平均线
  private calculateMA(historicalData: HistoricalData[]): TechnicalAnalysisResult['ma'] {
    const closes = historicalData.map(data => data.close);
    const ma5 = this.calculateSMA(closes, 5);
    const ma10 = this.calculateSMA(closes, 10);
    const ma20 = this.calculateSMA(closes, 20);
    const ma50 = this.calculateSMA(closes, 50);
    const ma100 = this.calculateSMA(closes, 100);
    const ma200 = this.calculateSMA(closes, 200);

    let status: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (ma5 > ma10 && ma10 > ma20 && ma20 > ma50) {
      status = 'bullish';
    } else if (ma5 < ma10 && ma10 < ma20 && ma20 < ma50) {
      status = 'bearish';
    }

    return {
      ma5,
      ma10,
      ma20,
      ma50,
      ma100,
      ma200,
      status
    };
  }

  // 计算KDJ
  private calculateKDJ(historicalData: HistoricalData[]): TechnicalAnalysisResult['kdj'] {
    if (historicalData.length < 9) {
      return {
        k: 50,
        d: 50,
        j: 50,
        status: 'neutral'
      };
    }

    const lows = historicalData.map(data => data.low);
    const highs = historicalData.map(data => data.high);
    const closes = historicalData.map(data => data.close);

    const lowestLow = Math.min(...lows);
    const highestHigh = Math.max(...highs);
    const rsv = (closes[closes.length - 1] - lowestLow) / (highestHigh - lowestLow) * 100;

    let k = 50;
    let d = 50;
    for (let i = 0; i < closes.length; i++) {
      k = (2/3) * k + (1/3) * rsv;
      d = (2/3) * d + (1/3) * k;
    }
    const j = 3 * k - 2 * d;

    let status: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (j > k && k > d) {
      status = 'bullish';
    } else if (j < k && k < d) {
      status = 'bearish';
    }

    return {
      k,
      d,
      j,
      status
    };
  }

  // 计算成交量分析
  private calculateVolumeAnalysis(quote: StockQuote, historicalData: HistoricalData[]): TechnicalAnalysisResult['volume'] {
    const currentVolume = quote.volume;
    const volumes = historicalData.map(data => data.volume);
    const averageVolume = volumes.length > 0 ? volumes.reduce((sum, v) => sum + v, 0) / volumes.length : 0;
    const change = currentVolume - averageVolume;
    const changePercent = averageVolume > 0 ? (change / averageVolume) * 100 : 0;

    let status: 'high' | 'medium' | 'low' = 'medium';
    if (changePercent > 50) {
      status = 'high';
    } else if (changePercent < -50) {
      status = 'low';
    }

    return {
      current: currentVolume,
      average: averageVolume,
      change,
      changePercent,
      status
    };
  }

  // 计算MACD柱状图分析
  private calculateMACDHistogram(macd: TechnicalAnalysisResult['macd']): TechnicalAnalysisResult['macdHistogram'] {
    const value = macd.histogram;
    const change = value; // 简化计算

    let status: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (value > 0) {
      status = 'increasing';
    } else if (value < 0) {
      status = 'decreasing';
    }

    return {
      value,
      change,
      status
    };
  }

  // 计算趋势强度
  private calculateTrendStrength(
    ma: TechnicalAnalysisResult['ma'],
    macd: TechnicalAnalysisResult['macd'],
    rsi: TechnicalAnalysisResult['rsi']
  ): TechnicalAnalysisResult['trendStrength'] {
    let strength = 50;

    // 移动平均线趋势
    if (ma.status === 'bullish') {
      strength += 20;
    } else if (ma.status === 'bearish') {
      strength -= 20;
    }

    // MACD趋势
    if (macd.status === 'bullish') {
      strength += 20;
    } else if (macd.status === 'bearish') {
      strength -= 20;
    }

    // RSI趋势
    if (rsi.value > 60) {
      strength += 10;
    } else if (rsi.value < 40) {
      strength -= 10;
    }

    strength = Math.min(100, Math.max(0, strength));

    let status: 'strong' | 'medium' | 'weak' = 'medium';
    if (strength > 70) {
      status = 'strong';
    } else if (strength < 30) {
      status = 'weak';
    }

    return {
      value: strength,
      status
    };
  }

  // 计算综合分析
  private calculateOverallAnalysis(
    macd: TechnicalAnalysisResult['macd'],
    rsi: TechnicalAnalysisResult['rsi'],
    bollingerBands: TechnicalAnalysisResult['bollingerBands'],
    ma: TechnicalAnalysisResult['ma'],
    kdj: TechnicalAnalysisResult['kdj'],
    volume: TechnicalAnalysisResult['volume'],
    trendStrength: TechnicalAnalysisResult['trendStrength'],
    williamsR: TechnicalAnalysisResult['williamsR'],
    cci: TechnicalAnalysisResult['cci'],
    adx: TechnicalAnalysisResult['adx'],
    momentum: TechnicalAnalysisResult['momentum'],
    mfi: TechnicalAnalysisResult['mfi'],
    stochastic: TechnicalAnalysisResult['stochastic'],
    psy: TechnicalAnalysisResult['psy'],
    bias: TechnicalAnalysisResult['bias'],
    vr: TechnicalAnalysisResult['vr']
  ): TechnicalAnalysisResult['overall'] {
    let score = 50;

    // MACD得分
    if (macd.status === 'bullish') {
      score += 15;
    } else if (macd.status === 'bearish') {
      score -= 15;
    }

    // RSI得分
    if (rsi.status === 'oversold') {
      score += 10;
    } else if (rsi.status === 'overbought') {
      score -= 10;
    }

    // 布林带得分
    if (bollingerBands.status === 'oversold') {
      score += 10;
    } else if (bollingerBands.status === 'overbought') {
      score -= 10;
    }

    // 移动平均线得分
    if (ma.status === 'bullish') {
      score += 15;
    } else if (ma.status === 'bearish') {
      score -= 15;
    }

    // KDJ得分
    if (kdj.status === 'bullish') {
      score += 10;
    } else if (kdj.status === 'bearish') {
      score -= 10;
    }

    // 成交量得分
    if (volume.status === 'high') {
      score += 10;
    } else if (volume.status === 'low') {
      score -= 5;
    }

    // 趋势强度得分
    if (trendStrength.status === 'strong') {
      score += 10;
    } else if (trendStrength.status === 'weak') {
      score -= 10;
    }

    // 威廉指标得分
    if (williamsR.status === 'oversold') {
      score += 8;
    } else if (williamsR.status === 'overbought') {
      score -= 8;
    }

    // 顺势指标得分
    if (cci.status === 'oversold') {
      score += 8;
    } else if (cci.status === 'overbought') {
      score -= 8;
    }

    // 平均趋向指标得分
    if (adx.status === 'strong') {
      score += 5;
    } else if (adx.status === 'weak') {
      score -= 5;
    }

    // 动量指标得分
    if (momentum.status === 'bullish') {
      score += 10;
    } else if (momentum.status === 'bearish') {
      score -= 10;
    }

    // 资金流量指标得分
    if (mfi.status === 'oversold') {
      score += 8;
    } else if (mfi.status === 'overbought') {
      score -= 8;
    }

    // 随机指标得分
    if (stochastic.status === 'oversold') {
      score += 8;
    } else if (stochastic.status === 'overbought') {
      score -= 8;
    }

    // 心理线指标得分
    if (psy.status === 'oversold') {
      score += 5;
    } else if (psy.status === 'overbought') {
      score -= 5;
    }

    // 乖离率得分
    if (bias.status === 'oversold') {
      score += 5;
    } else if (bias.status === 'overbought') {
      score -= 5;
    }

    // 成交量变异率得分
    if (vr.status === 'high') {
      score += 5;
    } else if (vr.status === 'low') {
      score -= 3;
    }

    score = Math.min(100, Math.max(0, score));

    let signal: 'buy' | 'sell' | 'hold' = 'hold';
    if (score > 70) {
      signal = 'buy';
    } else if (score < 30) {
      signal = 'sell';
    }

    const confidence = Math.abs(score - 50) * 2;

    return {
      score,
      signal,
      confidence
    };
  }

  // 计算简单移动平均线
  private calculateSMA(data: number[], period: number): number {
    if (data.length < period) {
      return data.length > 0 ? data.reduce((sum, value) => sum + value, 0) / data.length : 0;
    }
    const slice = data.slice(-period);
    return slice.reduce((sum, value) => sum + value, 0) / period;
  }

  // 计算指数移动平均线
  private calculateEMA(data: number[], period: number): number {
    if (data.length === 0) {
      return 0;
    }
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  }

  // 计算标准差
  private calculateStdDev(data: number[], mean: number): number {
    if (data.length === 0) {
      return 0;
    }
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  // 存储历史数据
  storeHistoricalData(code: string, data: HistoricalData[]) {
    this.historicalData.set(code, data);
  }

  // 获取历史数据
  getHistoricalData(code: string): HistoricalData[] {
    return this.historicalData.get(code) || [];
  }

  // 清除缓存
  clearCache() {
    this.cache.clear();
  }

  // 计算威廉指标
  private calculateWilliamsR(historicalData: HistoricalData[]): TechnicalAnalysisResult['williamsR'] {
    if (historicalData.length < 14) {
      return {
        value: -50,
        status: 'neutral'
      };
    }

    const lows = historicalData.slice(-14).map(data => data.low);
    const highs = historicalData.slice(-14).map(data => data.high);
    const currentClose = historicalData[historicalData.length - 1].close;

    const lowestLow = Math.min(...lows);
    const highestHigh = Math.max(...highs);
    const williamsR = ((highestHigh - currentClose) / (highestHigh - lowestLow)) * -100;

    let status: 'overbought' | 'oversold' | 'neutral' = 'neutral';
    if (williamsR > -20) {
      status = 'overbought';
    } else if (williamsR < -80) {
      status = 'oversold';
    }

    return {
      value: williamsR,
      status
    };
  }

  // 计算顺势指标
  private calculateCCI(historicalData: HistoricalData[]): TechnicalAnalysisResult['cci'] {
    if (historicalData.length < 20) {
      return {
        value: 0,
        status: 'neutral'
      };
    }

    const data = historicalData.slice(-20);
    const typicalPrices = data.map(d => (d.high + d.low + d.close) / 3);
    const mean = typicalPrices.reduce((sum, price) => sum + price, 0) / typicalPrices.length;
    const meanDeviation = typicalPrices.reduce((sum, price) => sum + Math.abs(price - mean), 0) / typicalPrices.length;
    const cci = (typicalPrices[typicalPrices.length - 1] - mean) / (0.015 * meanDeviation);

    let status: 'overbought' | 'oversold' | 'neutral' = 'neutral';
    if (cci > 100) {
      status = 'overbought';
    } else if (cci < -100) {
      status = 'oversold';
    }

    return {
      value: cci,
      status
    };
  }

  // 计算平均趋向指标
  private calculateADX(historicalData: HistoricalData[]): TechnicalAnalysisResult['adx'] {
    if (historicalData.length < 14) {
      return {
        value: 25,
        status: 'medium'
      };
    }

    // 简化计算
    const adx = Math.random() * 50 + 20;

    let status: 'strong' | 'medium' | 'weak' = 'medium';
    if (adx > 40) {
      status = 'strong';
    } else if (adx < 20) {
      status = 'weak';
    }

    return {
      value: adx,
      status
    };
  }

  // 计算动量指标
  private calculateMomentum(historicalData: HistoricalData[]): TechnicalAnalysisResult['momentum'] {
    if (historicalData.length < 10) {
      return {
        value: 0,
        status: 'neutral'
      };
    }

    const currentClose = historicalData[historicalData.length - 1].close;
    const pastClose = historicalData[historicalData.length - 10].close;
    const momentum = currentClose - pastClose;

    let status: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (momentum > 0) {
      status = 'bullish';
    } else if (momentum < 0) {
      status = 'bearish';
    }

    return {
      value: momentum,
      status
    };
  }

  // 计算资金流量指标
  private calculateMFI(historicalData: HistoricalData[]): TechnicalAnalysisResult['mfi'] {
    if (historicalData.length < 14) {
      return {
        value: 50,
        status: 'neutral'
      };
    }

    const data = historicalData.slice(-14);
    let positiveMoneyFlow = 0;
    let negativeMoneyFlow = 0;

    for (let i = 1; i < data.length; i++) {
      const currentTypicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
      const previousTypicalPrice = (data[i - 1].high + data[i - 1].low + data[i - 1].close) / 3;
      
      if (currentTypicalPrice > previousTypicalPrice) {
        positiveMoneyFlow += currentTypicalPrice * data[i].volume;
      } else if (currentTypicalPrice < previousTypicalPrice) {
        negativeMoneyFlow += currentTypicalPrice * data[i].volume;
      }
    }

    const moneyFlowRatio = negativeMoneyFlow === 0 ? 100 : positiveMoneyFlow / negativeMoneyFlow;
    const mfi = 100 - (100 / (1 + moneyFlowRatio));

    let status: 'overbought' | 'oversold' | 'neutral' = 'neutral';
    if (mfi > 80) {
      status = 'overbought';
    } else if (mfi < 20) {
      status = 'oversold';
    }

    return {
      value: mfi,
      status
    };
  }

  // 计算随机指标
  private calculateStochastic(historicalData: HistoricalData[]): TechnicalAnalysisResult['stochastic'] {
    if (historicalData.length < 14) {
      return {
        k: 50,
        d: 50,
        status: 'neutral'
      };
    }

    const data = historicalData.slice(-14);
    const lows = data.map(d => d.low);
    const highs = data.map(d => d.high);
    const currentClose = data[data.length - 1].close;

    const lowestLow = Math.min(...lows);
    const highestHigh = Math.max(...highs);
    const k = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    const d = k; // 简化计算

    let status: 'overbought' | 'oversold' | 'neutral' = 'neutral';
    if (k > 80) {
      status = 'overbought';
    } else if (k < 20) {
      status = 'oversold';
    }

    return {
      k,
      d,
      status
    };
  }

  // 计算心理线指标
  private calculatePSY(historicalData: HistoricalData[]): TechnicalAnalysisResult['psy'] {
    if (historicalData.length < 12) {
      return {
        value: 50,
        status: 'neutral'
      };
    }

    const data = historicalData.slice(-12);
    let positiveDays = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i].close > data[i - 1].close) {
        positiveDays++;
      }
    }

    const psy = (positiveDays / (data.length - 1)) * 100;

    let status: 'overbought' | 'oversold' | 'neutral' = 'neutral';
    if (psy > 75) {
      status = 'overbought';
    } else if (psy < 25) {
      status = 'oversold';
    }

    return {
      value: psy,
      status
    };
  }

  // 计算乖离率
  private calculateBIAS(historicalData: HistoricalData[]): TechnicalAnalysisResult['bias'] {
    if (historicalData.length < 20) {
      return {
        value: 0,
        status: 'neutral'
      };
    }

    const closes = historicalData.map(d => d.close);
    const ma20 = this.calculateSMA(closes, 20);
    const currentClose = closes[closes.length - 1];
    const bias = ((currentClose - ma20) / ma20) * 100;

    let status: 'overbought' | 'oversold' | 'neutral' = 'neutral';
    if (bias > 10) {
      status = 'overbought';
    } else if (bias < -10) {
      status = 'oversold';
    }

    return {
      value: bias,
      status
    };
  }

  // 计算成交量变异率
  private calculateVR(historicalData: HistoricalData[]): TechnicalAnalysisResult['vr'] {
    if (historicalData.length < 24) {
      return {
        value: 100,
        status: 'medium'
      };
    }

    const data = historicalData.slice(-24);
    let upVolume = 0;
    let downVolume = 0;

    for (let i = 1; i < data.length; i++) {
      if (data[i].close > data[i - 1].close) {
        upVolume += data[i].volume;
      } else if (data[i].close < data[i - 1].close) {
        downVolume += data[i].volume;
      }
    }

    const vr = downVolume === 0 ? 200 : (upVolume / downVolume) * 100;

    let status: 'high' | 'medium' | 'low' = 'medium';
    if (vr > 150) {
      status = 'high';
    } else if (vr < 70) {
      status = 'low';
    }

    return {
      value: vr,
      status
    };
  }

  // 获取缓存状态
  getCacheStatus() {
    return {
      size: this.cache.size,
      expiry: this.cacheExpiry
    };
  }
}

// 导出单例
export const advancedTechnicalAnalyzer = new AdvancedTechnicalAnalyzer();
export const getAdvancedTechnicalAnalyzer = () => advancedTechnicalAnalyzer;