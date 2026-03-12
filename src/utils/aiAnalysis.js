// AI分析工具函数
// 计算移动平均线
export const calculateMA = (data, period) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push(null);
        }
        else {
            const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
            result.push(sum / period);
        }
    }
    return result;
};
// 计算MACD指标
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    const ema12 = calculateEMA(data, fastPeriod);
    const ema26 = calculateEMA(data, slowPeriod);
    const diff = ema12.map((val, i) => val - ema26[i]);
    const dea = calculateEMA(diff, signalPeriod);
    const macd = diff.map((val, i) => (val - dea[i]) * 2);
    return { diff, dea, macd };
};
// 计算指数移动平均线
const calculateEMA = (data, period) => {
    const result = [];
    const multiplier = 2 / (period + 1);
    for (let i = 0; i < data.length; i++) {
        if (i === 0) {
            result.push(data[i]);
        }
        else {
            const ema = (data[i] - result[i - 1]) * multiplier + result[i - 1];
            result.push(ema);
        }
    }
    return result;
};
// 计算RSI指标
export const calculateRSI = (data, period = 14) => {
    const result = [];
    let gains = 0;
    let losses = 0;
    for (let i = 1; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        if (change > 0) {
            gains += change;
        }
        else {
            losses -= change;
        }
        if (i >= period) {
            const avgGain = gains / period;
            const avgLoss = losses / period;
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            result.push(rsi);
            // 移动平均
            const prevChange = data[i - period + 1] - data[i - period];
            if (prevChange > 0) {
                gains -= prevChange;
            }
            else {
                losses += prevChange;
            }
        }
        else {
            result.push(null);
        }
    }
    return result;
};
// 计算布林带
export const calculateBollingerBands = (data, period = 20, multiplier = 2) => {
    const middle = calculateMA(data, period);
    const upper = [];
    const lower = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            upper.push(null);
            lower.push(null);
        }
        else {
            const prices = data.slice(i - period + 1, i + 1);
            const avg = middle[i];
            const stdDev = Math.sqrt(prices.reduce((sum, price) => sum + Math.pow(price - avg, 2), 0) / period);
            upper.push(avg + multiplier * stdDev);
            lower.push(avg - multiplier * stdDev);
        }
    }
    return { upper, middle, lower };
};
// 主力资金流向分析
export const analyzeMainForceFlow = (data) => {
    return data.map(item => {
        const strength = (item.netFlow > 100000000 ? 'strong' : (item.netFlow > 50000000 ? 'medium' : 'weak'));
        const direction = item.netFlow > 0 ? 'inflow' : 'outflow';
        return { ...item, strength, direction };
    });
};
// 热点事件分析
export const analyzeHotEvents = (events) => {
    // 简单的事件分类和情感分析
    const sectorMapping = {
        '央行': '金融',
        '科技': '科技',
        '新能源': '新能源',
        '半导体': '半导体',
        '消费': '消费'
    };
    return events.map(event => {
        let sector = '综合';
        let sentiment = 'neutral';
        // 确定相关行业
        for (const [keyword, sec] of Object.entries(sectorMapping)) {
            if (event.title.includes(keyword)) {
                sector = sec;
                break;
            }
        }
        // 简单的情感分析
        if (event.title.includes('上涨') || event.title.includes('利好') || event.title.includes('创新高')) {
            sentiment = 'positive';
        }
        else if (event.title.includes('下跌') || event.title.includes('利空') || event.title.includes('新低')) {
            sentiment = 'negative';
        }
        return { ...event, sector, sentiment };
    });
};
// 热门行业和概念分析
export const analyzeHotSectors = (sectors) => {
    // 按涨跌幅排序
    const sortedSectors = [...sectors].sort((a, b) => b.change - a.change);
    return sortedSectors.map((sector, index) => ({
        ...sector,
        rank: index + 1,
        trend: (sector.change > 2 ? 'up' : (sector.change < -2 ? 'down' : 'stable'))
    }));
};
// 生成交易信号
export const generateTradeSignal = (data) => {
    const { price, ma5, ma10, rsi, macd, upperBand, lowerBand, mainForceFlow, sectorPerformance } = data;
    const lastIndex = price.length - 1;
    // 趋势判断
    const isUptrend = ma5[lastIndex] > ma10[lastIndex] && ma5[lastIndex] > ma5[lastIndex - 1];
    const isDowntrend = ma5[lastIndex] < ma10[lastIndex] && ma5[lastIndex] < ma5[lastIndex - 1];
    // RSI超买超卖
    const isOverbought = rsi[lastIndex] > 70;
    const isOversold = rsi[lastIndex] < 30;
    // MACD信号
    const isMacdBuy = macd[lastIndex] > 0 && macd[lastIndex] > macd[lastIndex - 1];
    const isMacdSell = macd[lastIndex] < 0 && macd[lastIndex] < macd[lastIndex - 1];
    // 布林带信号
    const isBollingerBuy = price[lastIndex] < lowerBand[lastIndex];
    const isBollingerSell = price[lastIndex] > upperBand[lastIndex];
    // 主力资金流向信号
    const isMainForceInflow = mainForceFlow && mainForceFlow > 50000000;
    const isMainForceOutflow = mainForceFlow && mainForceFlow < -50000000;
    // 行业表现信号
    const isSectorStrong = sectorPerformance && sectorPerformance > 1.5;
    const isSectorWeak = sectorPerformance && sectorPerformance < -1.5;
    // 综合判断
    let buyScore = 0;
    let sellScore = 0;
    if (isUptrend)
        buyScore += 2;
    if (isDowntrend)
        sellScore += 2;
    if (isMacdBuy)
        buyScore += 2;
    if (isMacdSell)
        sellScore += 2;
    if (isOversold)
        buyScore += 1;
    if (isOverbought)
        sellScore += 1;
    if (isBollingerBuy)
        buyScore += 1;
    if (isBollingerSell)
        sellScore += 1;
    if (isMainForceInflow)
        buyScore += 3;
    if (isMainForceOutflow)
        sellScore += 3;
    if (isSectorStrong)
        buyScore += 2;
    if (isSectorWeak)
        sellScore += 2;
    if (buyScore > sellScore + 2) {
        return 'buy';
    }
    else if (sellScore > buyScore + 2) {
        return 'sell';
    }
    else {
        return 'hold';
    }
};
// 计算策略收益率
export const calculateStrategyReturn = (trades) => {
    let totalCost = 0;
    let totalValue = 0;
    let position = 0;
    for (const trade of trades) {
        if (trade.type === 'buy') {
            totalCost += trade.price * trade.volume;
            position += trade.volume;
        }
        else if (trade.type === 'sell') {
            totalValue += trade.price * trade.volume;
            position -= trade.volume;
        }
    }
    // 计算收益率
    if (totalCost === 0)
        return 0;
    return ((totalValue - totalCost) / totalCost) * 100;
};
// 风险评估
export const assessRisk = (data) => {
    const { volatility, maxDrawdown, sharpeRatio, sectorConcentration, marketCap } = data;
    let riskScore = 0;
    // 波动率评分 (越高风险越大)
    if (volatility > 0.3)
        riskScore += 3;
    else if (volatility > 0.2)
        riskScore += 2;
    else if (volatility > 0.1)
        riskScore += 1;
    // 最大回撤评分 (越大风险越大)
    if (maxDrawdown > 0.3)
        riskScore += 3;
    else if (maxDrawdown > 0.2)
        riskScore += 2;
    else if (maxDrawdown > 0.1)
        riskScore += 1;
    // Sharpe比率评分 (越高风险越小)
    if (sharpeRatio > 1.5)
        riskScore -= 3;
    else if (sharpeRatio > 1)
        riskScore -= 2;
    else if (sharpeRatio > 0.5)
        riskScore -= 1;
    // 行业集中度评分 (越高风险越大)
    if (sectorConcentration > 0.7)
        riskScore += 3;
    else if (sectorConcentration > 0.5)
        riskScore += 2;
    else if (sectorConcentration > 0.3)
        riskScore += 1;
    // 市值评分 (越小风险越大)
    if (marketCap < 5000000000)
        riskScore += 3;
    else if (marketCap < 20000000000)
        riskScore += 2;
    else if (marketCap < 100000000000)
        riskScore += 1;
    if (riskScore >= 4)
        return 'high';
    else if (riskScore >= 1)
        return 'medium';
    else
        return 'low';
};
// AI预测价格
export const predictPrice = (historicalData) => {
    // 简单的线性回归预测
    const n = historicalData.length;
    if (n < 2)
        return historicalData[n - 1];
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += historicalData[i];
        sumXY += i * historicalData[i];
        sumX2 += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    return slope * n + intercept;
};
// 计算KDJ指标
export const calculateKDJ = (data, period = 9, kPeriod = 3, dPeriod = 3) => {
    const k = [];
    const d = [];
    const j = [];
    // 计算RSV
    const rsv = [];
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const high = Math.max(...slice);
        const low = Math.min(...slice);
        const close = data[i];
        const rsvValue = (close - low) / (high - low) * 100;
        rsv.push(rsvValue);
    }
    // 计算K、D、J
    for (let i = 0; i < rsv.length; i++) {
        if (i === 0) {
            k.push(50);
            d.push(50);
        }
        else {
            k.push((2 / 3) * k[i - 1] + (1 / 3) * rsv[i]);
            d.push((2 / 3) * d[i - 1] + (1 / 3) * k[i]);
        }
        j.push(3 * k[i] - 2 * d[i]);
    }
    // 填充前面的空值
    const emptyArray = Array(period - 1).fill(null);
    return {
        k: [...emptyArray, ...k],
        d: [...emptyArray, ...d],
        j: [...emptyArray, ...j]
    };
};
// 计算CCI指标
export const calculateCCI = (data, period = 14) => {
    const cci = [];
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const typicalPrice = data[i];
        const smaTypical = slice.reduce((sum, price) => sum + price, 0) / period;
        const meanDeviation = slice.reduce((sum, price) => sum + Math.abs(price - smaTypical), 0) / period;
        const cciValue = (meanDeviation > 0 ? (typicalPrice - smaTypical) / (0.015 * meanDeviation) : 0);
        cci.push(cciValue);
    }
    // 填充前面的空值
    const emptyArray = Array(period - 1).fill(null);
    return [...emptyArray, ...cci];
};
// 计算OBV（能量潮指标）
export const calculateOBV = (prices, volumes) => {
    const obv = [];
    let currentObv = 0;
    for (let i = 0; i < prices.length; i++) {
        if (i === 0) {
            currentObv = volumes[i] || 0;
        }
        else {
            if (prices[i] > prices[i - 1]) {
                currentObv += volumes[i] || 0;
            }
            else if (prices[i] < prices[i - 1]) {
                currentObv -= volumes[i] || 0;
            }
        }
        obv.push(currentObv);
    }
    return obv;
};
// 计算威廉指标WR
export const calculateWR = (data, period = 14) => {
    const wr = [];
    for (let i = period - 1; i < data.length; i++) {
        const slice = data.slice(i - period + 1, i + 1);
        const high = Math.max(...slice);
        const low = Math.min(...slice);
        const close = data[i];
        const wrValue = (high !== low ? ((high - close) / (high - low)) * -100 : 0);
        wr.push(wrValue);
    }
    const emptyArray = Array(period - 1).fill(null);
    return [...emptyArray, ...wr];
};
// 计算ROC（变动率指标）
export const calculateROC = (data, period = 12) => {
    const roc = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period) {
            roc.push(null);
        }
        else {
            const rocValue = (data[i - period] !== 0 ? ((data[i] - data[i - period]) / data[i - period]) * 100 : 0);
            roc.push(rocValue);
        }
    }
    return roc;
};
// 计算MFI（资金流量指标）
export const calculateMFI = (prices, highs, lows, volumes, period = 14) => {
    const mfi = [];
    const typicalPrices = [];
    const rawMoneyFlows = [];
    for (let i = 0; i < prices.length; i++) {
        const typicalPrice = (highs[i] + lows[i] + prices[i]) / 3;
        typicalPrices.push(typicalPrice);
        rawMoneyFlows.push(typicalPrice * (volumes[i] || 0));
    }
    for (let i = period - 1; i < prices.length; i++) {
        let positiveFlow = 0;
        let negativeFlow = 0;
        for (let j = i - period + 2; j <= i; j++) {
            if (typicalPrices[j] > typicalPrices[j - 1]) {
                positiveFlow += rawMoneyFlows[j];
            }
            else if (typicalPrices[j] < typicalPrices[j - 1]) {
                negativeFlow += rawMoneyFlows[j];
            }
        }
        const moneyFlowRatio = (negativeFlow > 0 ? positiveFlow / negativeFlow : (positiveFlow > 0 ? 100 : 50));
        const mfiValue = 100 - (100 / (1 + moneyFlowRatio));
        mfi.push(mfiValue);
    }
    const emptyArray = Array(period - 1).fill(null);
    return [...emptyArray, ...mfi];
};
// 计算TRIX（三重指数平滑平均）
export const calculateTRIX = (data, period = 14, signalPeriod = 9) => {
    const ema1 = calculateEMA(data, period);
    const ema2 = calculateEMA(ema1, period);
    const ema3 = calculateEMA(ema2, period);
    const trix = [];
    for (let i = 0; i < ema3.length; i++) {
        if (i < 1) {
            trix.push(0);
        }
        else {
            trix.push((ema3[i - 1] !== 0 ? ((ema3[i] - ema3[i - 1]) / ema3[i - 1]) * 100 : 0));
        }
    }
    const signal = calculateEMA(trix, signalPeriod);
    return { trix, signal };
};
// 计算DMI（趋向指标）
export const calculateDMI = (highs, lows, closes, period = 14) => {
    const plusDM = [];
    const minusDM = [];
    const tr = [];
    for (let i = 1; i < highs.length; i++) {
        const upMove = highs[i] - highs[i - 1];
        const downMove = lows[i - 1] - lows[i];
        plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
        minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
        const trueRange = Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i - 1]), Math.abs(lows[i] - closes[i - 1]));
        tr.push(trueRange);
    }
    const smoothedPlusDM = calculateSmoothMA(plusDM, period);
    const smoothedMinusDM = calculateSmoothMA(minusDM, period);
    const smoothedTR = calculateSmoothMA(tr, period);
    const plusDI = [];
    const minusDI = [];
    const adx = [];
    for (let i = 0; i < smoothedTR.length; i++) {
        if (smoothedTR[i] > 0) {
            plusDI.push((smoothedPlusDM[i] / smoothedTR[i]) * 100);
            minusDI.push((smoothedMinusDM[i] / smoothedTR[i]) * 100);
        }
        else {
            plusDI.push(0);
            minusDI.push(0);
        }
        const dx = ((plusDI[i] + minusDI[i]) > 0
            ? (Math.abs(plusDI[i] - minusDI[i]) / (plusDI[i] + minusDI[i])) * 100
            : 0);
        adx.push(dx);
    }
    const smoothedADX = calculateSmoothMA(adx, period);
    const emptyArray = Array(period).fill(null);
    return {
        plusDI: [...emptyArray, ...plusDI],
        minusDI: [...emptyArray, ...minusDI],
        adx: [...emptyArray, ...smoothedADX]
    };
};
const calculateSmoothMA = (data, period) => {
    const result = [];
    if (data.length < period)
        return result;
    let sum = data.slice(0, period).reduce((a, b) => a + b, 0);
    result.push(sum / period);
    for (let i = period; i < data.length; i++) {
        sum = sum - result[result.length - 1] + data[i];
        result.push(sum / period);
    }
    return result;
};
// 市场情绪分析
export const analyzeMarketSentiment = (data) => {
    const { priceChanges, volumeChanges, newsSentiment } = data;
    // 计算价格趋势
    const priceTrend = priceChanges.reduce((sum, change) => sum + change, 0) / priceChanges.length;
    // 计算成交量趋势
    const volumeTrend = volumeChanges.reduce((sum, change) => sum + change, 0) / volumeChanges.length;
    // 计算新闻情绪
    const newsSentimentScore = newsSentiment.reduce((sum, sentiment) => sum + sentiment, 0) / newsSentiment.length;
    // 综合判断
    let sentimentScore = 0;
    if (priceTrend > 0.5)
        sentimentScore += 3;
    else if (priceTrend > 0)
        sentimentScore += 1;
    else if (priceTrend < -0.5)
        sentimentScore -= 3;
    else if (priceTrend < 0)
        sentimentScore -= 1;
    if (volumeTrend > 1)
        sentimentScore += 2;
    else if (volumeTrend < -1)
        sentimentScore -= 2;
    if (newsSentimentScore > 0.5)
        sentimentScore += 3;
    else if (newsSentimentScore > 0)
        sentimentScore += 1;
    else if (newsSentimentScore < -0.5)
        sentimentScore -= 3;
    else if (newsSentimentScore < 0)
        sentimentScore -= 1;
    if (sentimentScore > 3)
        return 'bullish';
    else if (sentimentScore < -3)
        return 'bearish';
    else
        return 'neutral';
};
// 生成AI交易建议
export const generateAISuggestion = (data) => {
    // 这里可以集成更复杂的AI模型
    // 现在使用简单的规则-based系统
    const signal = generateTradeSignal(data);
    let confidence = 50;
    let reason = '';
    // 分析市场情绪
    const marketSentiment = analyzeMarketSentiment({
        priceChanges: data.price.slice(-10).map((price, index, array) => {
            return index > 0 ? price - array[index - 1] : 0;
        }),
        volumeChanges: Array(10).fill(0), // 模拟成交量变化
        newsSentiment: Array(10).fill(0.5) // 模拟新闻情绪
    });
    switch (signal) {
        case 'buy':
            confidence = 75 + Math.random() * 20;
            reason = '基于技术指标分析，当前市场趋势向上，主力资金流入，行业表现强势，建议买入';
            break;
        case 'sell':
            confidence = 70 + Math.random() * 25;
            reason = '基于技术指标分析，当前市场趋势向下，主力资金流出，行业表现疲软，建议卖出';
            break;
        case 'hold':
            confidence = 60 + Math.random() * 20;
            reason = '基于技术指标分析，当前市场趋势不明，主力资金流动平稳，建议持有';
            break;
    }
    return {
        signal,
        confidence: Math.min(confidence, 95),
        reason,
        sentiment: marketSentiment
    };
};
