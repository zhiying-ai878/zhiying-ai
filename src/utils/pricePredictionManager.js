const DEFAULT_CONFIG = {
    timeHorizon: 'short',
    minConfidence: 60,
    useHistoricalAnalysis: true,
    useTechnicalIndicators: true,
    usePriceVolume: true,
    useML: true
};
class PricePredictionManager {
    constructor() {
        Object.defineProperty(this, "historicalData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "predictions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: DEFAULT_CONFIG
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    static getInstance() {
        if (!PricePredictionManager.instance) {
            PricePredictionManager.instance = new PricePredictionManager();
        }
        return PricePredictionManager.instance;
    }
    addHistoricalData(stockCode, data) {
        this.historicalData.set(stockCode, data);
    }
    getHistoricalData(stockCode) {
        return this.historicalData.get(stockCode) || [];
    }
    generatePrediction(stockCode, stockName) {
        const prices = this.getHistoricalData(stockCode);
        if (prices.length < 30)
            return null;
        // 1. 历史数据分析
        const historicalAnalysis = this.analyzeHistoricalData(prices);
        // 2. 技术指标分析
        const technicalIndicators = this.calculateTechnicalIndicators(prices);
        // 3. 量价关系分析
        const priceVolumeAnalysis = this.analyzePriceVolume(prices);
        // 4. 机器学习预测
        const mlPrediction = this.performMLPrediction(prices, historicalAnalysis, technicalIndicators);
        // 5. 综合分析生成预测
        const { predictionType, confidence, reasons, predictedChange } = this.generateFinalPrediction(historicalAnalysis, technicalIndicators, priceVolumeAnalysis, mlPrediction);
        const prediction = {
            id: stockCode + '-' + Date.now(),
            stockCode,
            stockName,
            timestamp: Date.now(),
            predictionType,
            confidence,
            timeHorizon: 'short',
            predictedChange,
            reasons,
            historicalAnalysis,
            technicalIndicators,
            priceVolumeAnalysis,
            mlPrediction
        };
        const existing = this.predictions.get(stockCode) || [];
        existing.push(prediction);
        this.predictions.set(stockCode, existing);
        this.listeners.forEach(listener => listener([prediction]));
        return prediction;
    }
    analyzeHistoricalData(prices) {
        const recentPrices = prices.slice(-20);
        const closePrices = recentPrices.map(p => p.close);
        // 趋势分析
        let trendDirection = 'sideways';
        let trendStrength = 0;
        const startPrice = closePrices[0];
        const endPrice = closePrices[closePrices.length - 1];
        const priceChange = (endPrice - startPrice) / startPrice * 100;
        if (priceChange > 5) {
            trendDirection = 'up';
            trendStrength = Math.min(Math.abs(priceChange) / 10, 1);
        }
        else if (priceChange < -5) {
            trendDirection = 'down';
            trendStrength = Math.min(Math.abs(priceChange) / 10, 1);
        }
        // 支撑阻力位
        const supportLevels = [];
        const resistanceLevels = [];
        // 简单支撑阻力位计算
        const allPrices = prices.map(p => p.low);
        const sortedPrices = [...allPrices].sort((a, b) => a - b);
        const support = sortedPrices.slice(0, 5).reduce((sum, p) => sum + p, 0) / 5;
        supportLevels.push(support);
        allPrices.sort((a, b) => b - a);
        const resistance = allPrices.slice(0, 5).reduce((sum, p) => sum + p, 0) / 5;
        resistanceLevels.push(resistance);
        // 近期模式
        const recentPatterns = [];
        if (trendDirection === 'up') {
            recentPatterns.push('上升趋势');
        }
        else if (trendDirection === 'down') {
            recentPatterns.push('下降趋势');
        }
        else {
            recentPatterns.push('横盘整理');
        }
        return {
            trendDirection,
            trendStrength,
            supportLevels,
            resistanceLevels,
            recentPatterns
        };
    }
    calculateTechnicalIndicators(prices) {
        const closePrices = prices.map(p => p.close);
        // 计算RSI
        const rsi = this.calculateRSI(closePrices, 14);
        const rsiSignal = rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral';
        // 计算MACD
        const macd = this.calculateMACD(closePrices);
        const macdSignal = macd.histogram[macd.histogram.length - 1] > 0 ? 'bullish' : 'bearish';
        // 计算KDJ
        const kdj = this.calculateKDJ(prices, 9);
        const kdjSignal = kdj.k[kdj.k.length - 1] > kdj.d[kdj.d.length - 1] ? 'goldenCross' : 'deathCross';
        // 计算布林带
        const bollinger = this.calculateBollingerBands(closePrices, 20, 2);
        const lastPrice = closePrices[closePrices.length - 1];
        const bollingerSignal = lastPrice > bollinger.upper[bollinger.upper.length - 1] ? 'breakout' :
            lastPrice < bollinger.lower[bollinger.lower.length - 1] ? 'breakdown' : 'neutral';
        // 计算移动平均线
        const ma5 = this.calculateMA(closePrices, 5);
        const ma20 = this.calculateMA(closePrices, 20);
        const maSignal = ma5[ma5.length - 1] > ma20[ma20.length - 1] ? 'bullish' : 'bearish';
        return {
            macdSignal,
            rsiSignal,
            kdjSignal,
            bollingerSignal,
            maSignal
        };
    }
    analyzePriceVolume(prices) {
        const closePrices = prices.map(p => p.close);
        const volumes = prices.map(p => p.volume);
        // 量价相关性
        const priceVolumeCorrelation = this.calculateCorrelation(closePrices, volumes);
        // 量价背离
        let volumePriceDivergence = 'neutral';
        if (priceVolumeCorrelation < -0.3) {
            volumePriceDivergence = 'bearish';
        }
        else if (priceVolumeCorrelation > 0.3) {
            volumePriceDivergence = 'bullish';
        }
        // 累积分布
        let accumulationDistribution = 0;
        for (let i = 1; i < prices.length; i++) {
            const current = prices[i];
            const previous = prices[i - 1];
            const moneyFlowMultiplier = ((current.close - current.low) - (current.high - current.close)) / (current.high - current.low);
            const moneyFlowVolume = moneyFlowMultiplier * current.volume;
            accumulationDistribution += moneyFlowVolume;
        }
        // 能量潮
        const onBalanceVolume = [];
        let obv = 0;
        for (let i = 1; i < prices.length; i++) {
            if (prices[i].close > prices[i - 1].close) {
                obv += prices[i].volume;
            }
            else if (prices[i].close < prices[i - 1].close) {
                obv -= prices[i].volume;
            }
            onBalanceVolume.push(obv);
        }
        // 成交量确认
        const volumeConfirmation = priceVolumeCorrelation > 0.5;
        // 累积信号
        let accumulationSignal = 'neutral';
        if (accumulationDistribution > 0) {
            accumulationSignal = 'accumulating';
        }
        else if (accumulationDistribution < 0) {
            accumulationSignal = 'distributing';
        }
        return {
            volumeConfirmation,
            divergenceSignal: volumePriceDivergence,
            accumulationSignal
        };
    }
    performMLPrediction(prices, historicalAnalysis, technicalIndicators) {
        // 模拟机器学习预测
        const lastPrice = prices[prices.length - 1].close;
        // 基于历史趋势和技术指标生成预测
        let probabilityUp = 0.5;
        let probabilityDown = 0.5;
        if (historicalAnalysis.trendDirection === 'up') {
            probabilityUp += 0.2;
            probabilityDown -= 0.2;
        }
        else if (historicalAnalysis.trendDirection === 'down') {
            probabilityUp -= 0.2;
            probabilityDown += 0.2;
        }
        if (technicalIndicators.macdSignal === 'bullish') {
            probabilityUp += 0.1;
            probabilityDown -= 0.1;
        }
        else if (technicalIndicators.macdSignal === 'bearish') {
            probabilityUp -= 0.1;
            probabilityDown += 0.1;
        }
        if (technicalIndicators.rsiSignal === 'oversold') {
            probabilityUp += 0.15;
            probabilityDown -= 0.15;
        }
        else if (technicalIndicators.rsiSignal === 'overbought') {
            probabilityUp -= 0.15;
            probabilityDown += 0.15;
        }
        // 确保概率在合理范围内
        probabilityUp = Math.max(0, Math.min(1, probabilityUp));
        probabilityDown = Math.max(0, Math.min(1, probabilityDown));
        // 预测价格
        const priceChange = (probabilityUp - probabilityDown) * 0.05; // 最大5%变化
        const predictedPrice = lastPrice * (1 + priceChange);
        // 特征重要性
        const featureImportance = {
            '历史趋势': 0.3,
            'MACD指标': 0.2,
            'RSI指标': 0.2,
            'KDJ指标': 0.15,
            '布林带': 0.15
        };
        return {
            modelType: 'ensemble',
            predictedPrice,
            probabilityUp,
            probabilityDown,
            featureImportance
        };
    }
    generateFinalPrediction(historicalAnalysis, technicalIndicators, priceVolumeAnalysis, mlPrediction) {
        const reasons = [];
        let score = 0;
        // 历史趋势评分
        if (historicalAnalysis.trendDirection === 'up') {
            score += 20;
            reasons.push('历史趋势向上');
        }
        else if (historicalAnalysis.trendDirection === 'down') {
            score -= 20;
            reasons.push('历史趋势向下');
        }
        // 技术指标评分
        if (technicalIndicators.macdSignal === 'bullish') {
            score += 15;
            reasons.push('MACD金叉');
        }
        else if (technicalIndicators.macdSignal === 'bearish') {
            score -= 15;
            reasons.push('MACD死叉');
        }
        if (technicalIndicators.rsiSignal === 'oversold') {
            score += 10;
            reasons.push('RSI超卖');
        }
        else if (technicalIndicators.rsiSignal === 'overbought') {
            score -= 10;
            reasons.push('RSI超买');
        }
        if (technicalIndicators.kdjSignal === 'goldenCross') {
            score += 10;
            reasons.push('KDJ金叉');
        }
        else if (technicalIndicators.kdjSignal === 'deathCross') {
            score -= 10;
            reasons.push('KDJ死叉');
        }
        if (technicalIndicators.bollingerSignal === 'breakout') {
            score += 10;
            reasons.push('布林带突破');
        }
        else if (technicalIndicators.bollingerSignal === 'breakdown') {
            score -= 10;
            reasons.push('布林带跌破');
        }
        if (technicalIndicators.maSignal === 'bullish') {
            score += 10;
            reasons.push('均线多头');
        }
        else if (technicalIndicators.maSignal === 'bearish') {
            score -= 10;
            reasons.push('均线空头');
        }
        // 量价分析评分
        if (priceVolumeAnalysis.volumeConfirmation) {
            score += 10;
            reasons.push('成交量确认');
        }
        if (priceVolumeAnalysis.divergenceSignal === 'bullish') {
            score += 10;
            reasons.push('量价配合良好');
        }
        else if (priceVolumeAnalysis.divergenceSignal === 'bearish') {
            score -= 10;
            reasons.push('量价背离');
        }
        if (priceVolumeAnalysis.accumulationSignal === 'accumulating') {
            score += 10;
            reasons.push('资金持续流入');
        }
        else if (priceVolumeAnalysis.accumulationSignal === 'distributing') {
            score -= 10;
            reasons.push('资金持续流出');
        }
        // 机器学习预测评分
        if (mlPrediction.probabilityUp > 0.6) {
            score += 20;
            reasons.push('AI预测上涨');
        }
        else if (mlPrediction.probabilityDown > 0.6) {
            score -= 20;
            reasons.push('AI预测下跌');
        }
        // 确定预测类型
        let predictionType = 'hold';
        if (score > 30) {
            predictionType = 'buy';
        }
        else if (score < -30) {
            predictionType = 'sell';
        }
        // 计算置信度
        const confidence = Math.min(95, 50 + Math.abs(score));
        // 计算预测变化
        const predictedChange = (mlPrediction.probabilityUp - mlPrediction.probabilityDown) * 5;
        return {
            predictionType,
            confidence,
            reasons,
            predictedChange
        };
    }
    calculateRSI(prices, period) {
        let gains = 0;
        let losses = 0;
        for (let i = 1; i <= period; i++) {
            const change = prices[prices.length - i] - prices[prices.length - i - 1];
            if (change > 0) {
                gains += change;
            }
            else {
                losses += Math.abs(change);
            }
        }
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));
        return rsi;
    }
    calculateMACD(prices) {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        const macdLine = ema12.map((e12, i) => e12 - ema26[i]);
        const signalLine = this.calculateEMA(macdLine, 9);
        const histogram = macdLine.map((ml, i) => ml - signalLine[i]);
        return { macdLine, signalLine, histogram };
    }
    calculateKDJ(prices, period) {
        const k = [];
        const d = [];
        const j = [];
        for (let i = period - 1; i < prices.length; i++) {
            const periodPrices = prices.slice(i - period + 1, i + 1);
            const high = Math.max(...periodPrices.map(p => p.high));
            const low = Math.min(...periodPrices.map(p => p.low));
            const close = prices[i].close;
            const rsv = (close - low) / (high - low) * 100;
            const currentK = k.length === 0 ? 50 : (2 / 3) * k[k.length - 1] + (1 / 3) * rsv;
            const currentD = d.length === 0 ? 50 : (2 / 3) * d[d.length - 1] + (1 / 3) * currentK;
            const currentJ = 3 * currentK - 2 * currentD;
            k.push(currentK);
            d.push(currentD);
            j.push(currentJ);
        }
        return { k, d, j };
    }
    calculateBollingerBands(prices, period, multiplier) {
        const upper = [];
        const middle = [];
        const lower = [];
        for (let i = period - 1; i < prices.length; i++) {
            const periodPrices = prices.slice(i - period + 1, i + 1);
            const sma = periodPrices.reduce((sum, p) => sum + p, 0) / period;
            const stdDev = Math.sqrt(periodPrices.reduce((sum, p) => sum + Math.pow(p - sma, 2), 0) / period);
            middle.push(sma);
            upper.push(sma + multiplier * stdDev);
            lower.push(sma - multiplier * stdDev);
        }
        return { upper, middle, lower };
    }
    calculateMA(prices, period) {
        const ma = [];
        for (let i = period - 1; i < prices.length; i++) {
            const periodPrices = prices.slice(i - period + 1, i + 1);
            const avg = periodPrices.reduce((sum, p) => sum + p, 0) / period;
            ma.push(avg);
        }
        return ma;
    }
    calculateEMA(prices, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);
        // 初始EMA为简单平均值
        const initialSma = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period;
        ema.push(initialSma);
        for (let i = period; i < prices.length; i++) {
            const currentEma = (prices[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1];
            ema.push(currentEma);
        }
        return ema;
    }
    calculateCorrelation(x, y) {
        const n = Math.min(x.length, y.length);
        const sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0);
        const sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0);
        const sumXY = x.slice(0, n).reduce((sum, val, i) => sum + val * y[i], 0);
        const sumX2 = x.slice(0, n).reduce((sum, val) => sum + val * val, 0);
        const sumY2 = y.slice(0, n).reduce((sum, val) => sum + val * val, 0);
        const correlation = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
        return isNaN(correlation) ? 0 : correlation;
    }
    getPredictions(stockCode) {
        if (stockCode) {
            return this.predictions.get(stockCode) || [];
        }
        return Array.from(this.predictions.values()).flat();
    }
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    generateMockHistoricalData(stockCode, days = 60) {
        const data = [];
        let basePrice = 10 + Math.random() * 90;
        const now = Date.now();
        for (let i = days; i >= 0; i--) {
            const volatility = 0.02;
            const change = (Math.random() - 0.5) * volatility * basePrice;
            const open = basePrice;
            const close = basePrice + change;
            const high = Math.max(open, close) * (1 + Math.random() * 0.01);
            const low = Math.min(open, close) * (1 - Math.random() * 0.01);
            const volume = Math.floor(1000000 + Math.random() * 5000000);
            data.push({
                timestamp: now - i * 24 * 60 * 60 * 1000,
                open,
                high,
                low,
                close,
                volume
            });
            basePrice = close;
        }
        return data;
    }
}
export function getPricePredictionManager() {
    return PricePredictionManager.getInstance();
}
