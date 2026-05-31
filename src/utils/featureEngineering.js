import { Logger } from './stockData';
const logger = Logger.getInstance();
// 默认配置
const DEFAULT_CONFIG = {
    includeTechnicalIndicators: true,
    includeVolumeFeatures: true,
    includeVolatilityFeatures: true,
    includeTrendFeatures: true,
    includeSentimentFeatures: true,
    lookBackPeriods: {
        ma: [5, 10, 20, 30, 60],
        rsi: 14,
        macd: { fast: 12, slow: 26, signal: 9 },
        kdj: { n: 9, m1: 3, m2: 3 },
        bollinger: 20,
        volatility: 20,
        atr: 14
    }
};
export class FeatureEngineer {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    // 提取股票特征
    extractFeatures(historicalData) {
        if (historicalData.length === 0) {
            logger.warn('历史数据为空，无法提取特征');
            return [];
        }
        const features = [];
        // 确保数据按日期排序
        const sortedData = [...historicalData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        // 计算各种特征
        for (let i = 0; i < sortedData.length; i++) {
            const data = sortedData[i];
            const feature = {
                price: data.close,
                volume: data.volume,
                amount: data.amount,
                ma5: 0,
                ma10: 0,
                ma20: 0,
                ma30: 0,
                ma60: 0,
                rsi: 0,
                macd: { macd: 0, signal: 0, histogram: 0 },
                kdj: { k: 0, d: 0, j: 0 },
                bollinger: { upper: 0, middle: 0, lower: 0, bandwidth: 0 },
                volatility: 0,
                atr: 0,
                volumeRatio: 0,
                priceVolumeCorrelation: 0,
                trendStrength: 0,
                trendDirection: 'sideways',
                momentum: 0,
                changeRate: data.changePercent || 0,
                changeAmount: data.change || 0,
                sentimentScore: 0
            };
            // 计算移动平均线
            if (this.config.includeTechnicalIndicators) {
                this.calculateMovingAverages(sortedData, i, feature);
                // 计算RSI
                if (i >= this.config.lookBackPeriods.rsi) {
                    feature.rsi = this.calculateRSI(sortedData.slice(i - this.config.lookBackPeriods.rsi, i + 1));
                }
                // 计算MACD
                if (i >= Math.max(this.config.lookBackPeriods.macd.fast, this.config.lookBackPeriods.macd.slow)) {
                    const macdValues = this.calculateMACD(sortedData.slice(0, i + 1));
                    feature.macd = macdValues[i];
                }
                // 计算KDJ
                if (i >= this.config.lookBackPeriods.kdj.n) {
                    const kdjValues = this.calculateKDJ(sortedData.slice(0, i + 1));
                    feature.kdj = kdjValues[i];
                }
                // 计算布林带
                if (i >= this.config.lookBackPeriods.bollinger) {
                    const bollingerValues = this.calculateBollingerBands(sortedData.slice(i - this.config.lookBackPeriods.bollinger, i + 1));
                    feature.bollinger = bollingerValues[bollingerValues.length - 1];
                }
            }
            // 计算波动率特征
            if (this.config.includeVolatilityFeatures) {
                if (i >= this.config.lookBackPeriods.volatility) {
                    feature.volatility = this.calculateVolatility(sortedData.slice(i - this.config.lookBackPeriods.volatility, i + 1));
                }
                if (i >= this.config.lookBackPeriods.atr) {
                    feature.atr = this.calculateATR(sortedData.slice(i - this.config.lookBackPeriods.atr, i + 1));
                }
            }
            // 计算成交量特征
            if (this.config.includeVolumeFeatures) {
                if (i >= 5) {
                    const recentVolumes = sortedData.slice(i - 4, i + 1).map(d => d.volume);
                    const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length;
                    feature.volumeRatio = data.volume / avgVolume;
                    // 计算量价相关性
                    if (i >= 10) {
                        const prices = sortedData.slice(i - 9, i + 1).map(d => d.close);
                        const volumes = sortedData.slice(i - 9, i + 1).map(d => d.volume);
                        feature.priceVolumeCorrelation = this.calculateCorrelation(prices, volumes);
                    }
                }
            }
            // 计算趋势特征
            if (this.config.includeTrendFeatures) {
                if (i >= 20) {
                    const trendData = sortedData.slice(i - 19, i + 1);
                    const trendResult = this.calculateTrend(trendData);
                    feature.trendStrength = trendResult.strength;
                    feature.trendDirection = trendResult.direction;
                }
                // 计算动量
                if (i >= 10) {
                    feature.momentum = data.close - sortedData[i - 10].close;
                }
            }
            // 计算市场情绪
            if (this.config.includeSentimentFeatures) {
                feature.sentimentScore = this.calculateSentiment(feature);
            }
            features.push(feature);
        }
        logger.info(`成功提取${features.length}条特征数据`);
        return features;
    }
    // 计算移动平均线
    calculateMovingAverages(data, index, feature) {
        const prices = data.slice(0, index + 1).map(d => d.close);
        this.config.lookBackPeriods.ma.forEach(period => {
            if (index >= period - 1) {
                const recentPrices = prices.slice(prices.length - period);
                const ma = recentPrices.reduce((sum, p) => sum + p, 0) / period;
                switch (period) {
                    case 5:
                        feature.ma5 = parseFloat(ma.toFixed(2));
                        break;
                    case 10:
                        feature.ma10 = parseFloat(ma.toFixed(2));
                        break;
                    case 20:
                        feature.ma20 = parseFloat(ma.toFixed(2));
                        break;
                    case 30:
                        feature.ma30 = parseFloat(ma.toFixed(2));
                        break;
                    case 60:
                        feature.ma60 = parseFloat(ma.toFixed(2));
                        break;
                }
            }
        });
    }
    // 计算RSI
    calculateRSI(data) {
        const gains = [];
        const losses = [];
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            if (change > 0) {
                gains.push(change);
                losses.push(0);
            }
            else {
                gains.push(0);
                losses.push(Math.abs(change));
            }
        }
        const avgGain = gains.reduce((sum, g) => sum + g, 0) / gains.length;
        const avgLoss = losses.reduce((sum, l) => sum + l, 0) / losses.length;
        if (avgLoss === 0)
            return 100;
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        return parseFloat(rsi.toFixed(2));
    }
    // 计算MACD
    calculateMACD(data) {
        const prices = data.map(d => d.close);
        const results = [];
        const { fast, slow, signal } = this.config.lookBackPeriods.macd;
        const fastEMA = this.calculateEMA(prices, fast);
        const slowEMA = this.calculateEMA(prices, slow);
        const macdLine = fastEMA.map((value, index) => value - slowEMA[index]);
        const signalLine = this.calculateEMA(macdLine, signal);
        for (let i = 0; i < prices.length; i++) {
            const macd = i >= slow - 1 ? macdLine[i] : 0;
            const signalVal = i >= slow + signal - 1 ? signalLine[i] : 0;
            const histogram = macd - signalVal;
            results.push({
                macd: parseFloat(macd.toFixed(4)),
                signal: parseFloat(signalVal.toFixed(4)),
                histogram: parseFloat(histogram.toFixed(4))
            });
        }
        return results;
    }
    // 计算KDJ
    calculateKDJ(data) {
        const results = [];
        const { n, m1, m2 } = this.config.lookBackPeriods.kdj;
        let prevK = 50;
        let prevD = 50;
        for (let i = 0; i < data.length; i++) {
            if (i >= n - 1) {
                const recentData = data.slice(i - n + 1, i + 1);
                const high = Math.max(...recentData.map(d => d.high));
                const low = Math.min(...recentData.map(d => d.low));
                const close = data[i].close;
                const rsv = ((close - low) / (high - low)) * 100;
                const k = (2 / 3) * prevK + (1 / 3) * rsv;
                const d = (2 / 3) * prevD + (1 / 3) * k;
                const j = 3 * k - 2 * d;
                results.push({
                    k: parseFloat(k.toFixed(2)),
                    d: parseFloat(d.toFixed(2)),
                    j: parseFloat(j.toFixed(2))
                });
                prevK = k;
                prevD = d;
            }
            else {
                results.push({ k: 50, d: 50, j: 50 });
            }
        }
        return results;
    }
    // 计算布林带
    calculateBollingerBands(data) {
        const results = [];
        const prices = data.map(d => d.close);
        for (let i = 0; i < prices.length; i++) {
            if (i >= this.config.lookBackPeriods.bollinger - 1) {
                const recentPrices = prices.slice(i - this.config.lookBackPeriods.bollinger + 1, i + 1);
                const middle = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
                const variance = recentPrices.reduce((sum, p) => sum + Math.pow(p - middle, 2), 0) / recentPrices.length;
                const stdDev = Math.sqrt(variance);
                const upper = middle + 2 * stdDev;
                const lower = middle - 2 * stdDev;
                const bandwidth = (upper - lower) / middle * 100;
                results.push({
                    upper: parseFloat(upper.toFixed(2)),
                    middle: parseFloat(middle.toFixed(2)),
                    lower: parseFloat(lower.toFixed(2)),
                    bandwidth: parseFloat(bandwidth.toFixed(2))
                });
            }
            else {
                results.push({ upper: 0, middle: 0, lower: 0, bandwidth: 0 });
            }
        }
        return results;
    }
    // 计算波动率
    calculateVolatility(data) {
        const prices = data.map(d => d.close);
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance) * Math.sqrt(252); // 年化波动率
        return parseFloat(volatility.toFixed(4));
    }
    // 计算ATR
    calculateATR(data) {
        const ranges = [];
        for (let i = 1; i < data.length; i++) {
            const tr1 = data[i].high - data[i].low;
            const tr2 = Math.abs(data[i].high - data[i - 1].close);
            const tr3 = Math.abs(data[i].low - data[i - 1].close);
            ranges.push(Math.max(tr1, tr2, tr3));
        }
        const avgRange = ranges.reduce((sum, r) => sum + r, 0) / ranges.length;
        return parseFloat(avgRange.toFixed(2));
    }
    // 计算相关性
    calculateCorrelation(x, y) {
        if (x.length !== y.length || x.length < 2)
            return 0;
        const n = x.length;
        const sumX = x.reduce((sum, val) => sum + val, 0);
        const sumY = y.reduce((sum, val) => sum + val, 0);
        const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
        const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
        const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        if (denominator === 0)
            return 0;
        return parseFloat((numerator / denominator).toFixed(4));
    }
    // 计算趋势
    calculateTrend(data) {
        const prices = data.map(d => d.close);
        // 使用线性回归计算趋势
        const n = prices.length;
        const sumX = n * (n - 1) / 2;
        const sumY = prices.reduce((sum, p) => sum + p, 0);
        const sumXY = prices.reduce((sum, p, i) => sum + i * p, 0);
        const sumX2 = n * (n - 1) * (2 * n - 1) / 6;
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        // 计算趋势强度（基于斜率的标准化值）
        const avgPrice = sumY / n;
        const strength = Math.abs(slope) / avgPrice * 100;
        let direction = 'sideways';
        if (slope > 0.001)
            direction = 'up';
        else if (slope < -0.001)
            direction = 'down';
        return {
            strength: parseFloat(strength.toFixed(4)),
            direction
        };
    }
    // 计算市场情绪
    calculateSentiment(feature) {
        let score = 50; // 中性情绪
        // RSI影响
        if (feature.rsi > 70)
            score += (feature.rsi - 70) * 0.5;
        else if (feature.rsi < 30)
            score -= (30 - feature.rsi) * 0.5;
        // MACD影响
        if (feature.macd.macd > feature.macd.signal)
            score += 5;
        else
            score -= 5;
        // 趋势影响
        if (feature.trendDirection === 'up')
            score += feature.trendStrength * 2;
        else if (feature.trendDirection === 'down')
            score -= feature.trendStrength * 2;
        // 量价关系影响
        if (feature.priceVolumeCorrelation > 0.5)
            score += 10;
        else if (feature.priceVolumeCorrelation < -0.5)
            score -= 10;
        // 限制在0-100范围内
        score = Math.max(0, Math.min(100, score));
        return parseFloat(score.toFixed(2));
    }
    // 计算EMA
    calculateEMA(prices, period) {
        const ema = [];
        const k = 2 / (period + 1);
        ema.push(prices[0]);
        for (let i = 1; i < prices.length; i++) {
            ema.push(prices[i] * k + ema[i - 1] * (1 - k));
        }
        return ema;
    }
    // 批量提取特征
    extractBatchFeatures(historicalDataMap) {
        const results = new Map();
        historicalDataMap.forEach((data, stockCode) => {
            try {
                const features = this.extractFeatures(data);
                results.set(stockCode, features);
            }
            catch (error) {
                logger.error(`提取股票${stockCode}特征失败:`, error);
                results.set(stockCode, []);
            }
        });
        logger.info(`批量提取${results.size}只股票的特征完成`);
        return results;
    }
    // 获取特征统计信息
    getFeatureStatistics(features) {
        if (features.length === 0)
            return {};
        const stats = {
            price: { avg: 0, min: Infinity, max: -Infinity },
            rsi: { avg: 0, min: Infinity, max: -Infinity },
            sentiment: { avg: 0, min: Infinity, max: -Infinity },
            trend: { up: 0, down: 0, sideways: 0 }
        };
        features.forEach(feature => {
            stats.price.avg += feature.price;
            stats.price.min = Math.min(stats.price.min, feature.price);
            stats.price.max = Math.max(stats.price.max, feature.price);
            stats.rsi.avg += feature.rsi;
            stats.rsi.min = Math.min(stats.rsi.min, feature.rsi);
            stats.rsi.max = Math.max(stats.rsi.max, feature.rsi);
            stats.sentiment.avg += feature.sentimentScore;
            stats.sentiment.min = Math.min(stats.sentiment.min, feature.sentimentScore);
            stats.sentiment.max = Math.max(stats.sentiment.max, feature.sentimentScore);
            stats.trend[feature.trendDirection]++;
        });
        const count = features.length;
        stats.price.avg = parseFloat((stats.price.avg / count).toFixed(2));
        stats.rsi.avg = parseFloat((stats.rsi.avg / count).toFixed(2));
        stats.sentiment.avg = parseFloat((stats.sentiment.avg / count).toFixed(2));
        return stats;
    }
}
// 全局实例
let featureEngineerInstance = null;
export function getFeatureEngineer(config) {
    if (!featureEngineerInstance) {
        featureEngineerInstance = new FeatureEngineer(config);
    }
    return featureEngineerInstance;
}
