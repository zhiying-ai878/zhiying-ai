import { getMainForceTracker } from './mainForceTracker';
import { getPricePredictionManager } from './pricePredictionManager';
import { playSellAlert, playBuyAlert } from './audioManager';
const DEFAULT_CONFIG = {
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
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "positions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "pendingBuySignals", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "pendingSellSignals", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "signalHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "notifiedSignals", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "predictionManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: getPricePredictionManager()
        });
        // 主力资金历史数据，用于监控持续流向
        Object.defineProperty(this, "mainForceHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        // 持续流向的周期数
        Object.defineProperty(this, "continuousFlowPeriods", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3
        });
        // 持续流向的阈值（每个周期的最小净流入/流出）
        Object.defineProperty(this, "continuousFlowThreshold", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 500000
        });
        // 主力类型历史数据，用于监控同一账户/主力的持续流向
        Object.defineProperty(this, "mainForceTypeHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        // 主力类型识别阈值
        Object.defineProperty(this, "mainForceTypeThresholds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                superLargeOrderRatio: 0.6, // 超大单占比阈值
                largeOrderRatio: 0.4, // 大单占比阈值
                smallOrderRatio: 0.7 // 小单占比阈值（散户）
            }
        });
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.loadPositionsFromStorage();
    }
    loadPositionsFromStorage() {
        try {
            const saved = localStorage.getItem('stockPositions');
            if (saved) {
                const positions = JSON.parse(saved);
                positions.forEach(pos => {
                    this.positions.set(pos.stockCode, pos);
                });
            }
        }
        catch (error) {
            console.error('加载持仓失败:', error);
        }
    }
    savePositionsToStorage() {
        try {
            const positions = Array.from(this.positions.values());
            localStorage.setItem('stockPositions', JSON.stringify(positions));
        }
        catch (error) {
            console.error('保存持仓失败:', error);
        }
    }
    isAuctionPeriod() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${hours}:${minutes}`;
        return currentTime >= this.config.auctionPeriodStart &&
            currentTime <= this.config.auctionPeriodEnd;
    }
    calculateSignalScore(data, type) {
        let score = 0;
        const detailedReasons = [];
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
            }
            else if (mainForceFlow > 500000000) {
                mainForceScore += 12;
                detailedReasons.push('主力资金大幅净流入');
            }
            else if (mainForceFlow > 300000000) {
                mainForceScore += 10;
                detailedReasons.push('主力资金显著净流入');
            }
            else if (mainForceFlow > 100000000) {
                mainForceScore += 8;
                detailedReasons.push('主力资金中度净流入');
            }
            else if (mainForceFlow > 50000000) {
                mainForceScore += 5;
                detailedReasons.push('主力资金小幅净流入');
            }
            else if (mainForceFlow > 1000000) {
                mainForceScore += 3;
                detailedReasons.push('主力资金微量净流入');
            }
            // 主力资金占比 - 强化权重
            if (mainForceRatio > 0.9) {
                mainForceScore += 30;
                detailedReasons.push('主力资金占比极高');
            }
            else if (mainForceRatio > 0.8) {
                mainForceScore += 25;
                detailedReasons.push('主力资金占比很高');
            }
            else if (mainForceRatio > 0.7) {
                mainForceScore += 20;
                detailedReasons.push('主力资金占比高');
            }
            else if (mainForceRatio > 0.6) {
                mainForceScore += 15;
                detailedReasons.push('主力资金占比适中');
            }
            else if (mainForceRatio > 0.5) {
                mainForceScore += 10;
                detailedReasons.push('主力资金占比合理');
            }
            // 超大单占比
            const superLargeRatio = Math.abs(superLargeFlow) / totalAbs;
            if (superLargeRatio > 0.6) {
                mainForceScore += 10;
                detailedReasons.push('超大单资金占比极高');
            }
            else if (superLargeRatio > 0.5) {
                mainForceScore += 8;
                detailedReasons.push('超大单资金占比高');
            }
            else if (superLargeRatio > 0.4) {
                mainForceScore += 6;
                detailedReasons.push('超大单资金占比适中');
            }
            else if (superLargeRatio > 0.3) {
                mainForceScore += 4;
                detailedReasons.push('超大单资金占比合理');
            }
            // 大单占比
            const largeRatio = Math.abs(largeFlow) / totalAbs;
            if (largeRatio > 0.4) {
                mainForceScore += 6;
                detailedReasons.push('大单资金占比高');
            }
            else if (largeRatio > 0.3) {
                mainForceScore += 4;
                detailedReasons.push('大单资金占比适中');
            }
            else if (largeRatio > 0.2) {
                mainForceScore += 2;
                detailedReasons.push('大单资金占比合理');
            }
            // 成交量放大倍数
            if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 5) {
                mainForceScore += 12;
                detailedReasons.push('成交量极度放大');
            }
            else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 4) {
                mainForceScore += 10;
                detailedReasons.push('成交量大幅放大');
            }
            else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 3) {
                mainForceScore += 8;
                detailedReasons.push('成交量显著放大');
            }
            else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 2) {
                mainForceScore += 6;
                detailedReasons.push('成交量中度放大');
            }
            else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1.5) {
                mainForceScore += 4;
                detailedReasons.push('成交量小幅放大');
            }
            // 换手率
            if (mainForceData.turnoverRate && mainForceData.turnoverRate > 20) {
                mainForceScore += 10;
                detailedReasons.push('换手率极高');
            }
            else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 15) {
                mainForceScore += 8;
                detailedReasons.push('换手率很高');
            }
            else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 10) {
                mainForceScore += 6;
                detailedReasons.push('换手率高');
            }
            else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 5) {
                mainForceScore += 4;
                detailedReasons.push('换手率适中');
            }
            else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 3) {
                mainForceScore += 2;
                detailedReasons.push('换手率合理');
            }
            // 集合竞价时段
            if (this.isAuctionPeriod()) {
                mainForceScore += 8;
                detailedReasons.push('集合竞价时段信号');
            }
        }
        else {
            const mainForceAbs = Math.abs(mainForceFlow);
            const totalAbs = Math.abs(totalFlow) || 1;
            const mainForceRatio = mainForceAbs / totalAbs;
            // 主力资金净流出规模 - 降低阈值，更早捕捉卖出信号
            if (mainForceFlow < -800000000) {
                mainForceScore += 15;
                detailedReasons.push('主力资金超大额净流出');
            }
            else if (mainForceFlow < -500000000) {
                mainForceScore += 12;
                detailedReasons.push('主力资金大幅净流出');
            }
            else if (mainForceFlow < -300000000) {
                mainForceScore += 10;
                detailedReasons.push('主力资金显著净流出');
            }
            else if (mainForceFlow < -100000000) {
                mainForceScore += 8;
                detailedReasons.push('主力资金中度净流出');
            }
            else if (mainForceFlow < -50000000) {
                mainForceScore += 5;
                detailedReasons.push('主力资金小幅净流出');
            }
            else if (mainForceFlow < -3000000) {
                mainForceScore += 3;
                detailedReasons.push('主力资金微量净流出');
            }
            // 主力资金占比 - 强化权重
            if (mainForceRatio > 0.9) {
                mainForceScore += 30;
                detailedReasons.push('主力资金占比极高');
            }
            else if (mainForceRatio > 0.8) {
                mainForceScore += 25;
                detailedReasons.push('主力资金占比很高');
            }
            else if (mainForceRatio > 0.7) {
                mainForceScore += 20;
                detailedReasons.push('主力资金占比高');
            }
            else if (mainForceRatio > 0.6) {
                mainForceScore += 15;
                detailedReasons.push('主力资金占比适中');
            }
            else if (mainForceRatio > 0.5) {
                mainForceScore += 10;
                detailedReasons.push('主力资金占比合理');
            }
            else if (mainForceRatio > 0.4) {
                mainForceScore += 4;
                detailedReasons.push('主力资金占比尚可');
            }
            // 超大单占比
            const superLargeRatio = Math.abs(superLargeFlow) / totalAbs;
            if (superLargeRatio > 0.6) {
                mainForceScore += 10;
                detailedReasons.push('超大单资金占比极高');
            }
            else if (superLargeRatio > 0.5) {
                mainForceScore += 8;
                detailedReasons.push('超大单资金占比高');
            }
            else if (superLargeRatio > 0.4) {
                mainForceScore += 6;
                detailedReasons.push('超大单资金占比适中');
            }
            else if (superLargeRatio > 0.3) {
                mainForceScore += 4;
                detailedReasons.push('超大单资金占比合理');
            }
            // 大单占比
            const largeRatio = Math.abs(largeFlow) / totalAbs;
            if (largeRatio > 0.4) {
                mainForceScore += 6;
                detailedReasons.push('大单资金占比高');
            }
            else if (largeRatio > 0.3) {
                mainForceScore += 4;
                detailedReasons.push('大单资金占比适中');
            }
            else if (largeRatio > 0.2) {
                mainForceScore += 2;
                detailedReasons.push('大单资金占比合理');
            }
            // 成交量放大倍数 - 卖出信号时更敏感
            if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 3) {
                mainForceScore += 8;
                detailedReasons.push('成交量显著放大');
            }
            else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 2) {
                mainForceScore += 6;
                detailedReasons.push('成交量中度放大');
            }
            else if (mainForceData.volumeAmplification && mainForceData.volumeAmplification > 1.5) {
                mainForceScore += 4;
                detailedReasons.push('成交量小幅放大');
            }
            // 换手率 - 卖出信号时更敏感
            if (mainForceData.turnoverRate && mainForceData.turnoverRate > 15) {
                mainForceScore += 8;
                detailedReasons.push('换手率很高');
            }
            else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 10) {
                mainForceScore += 6;
                detailedReasons.push('换手率高');
            }
            else if (mainForceData.turnoverRate && mainForceData.turnoverRate > 5) {
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
            }
            else if (mainForceType === 'institution') {
                mainForceTypeScore += 10;
                detailedReasons.push('机构资金买入');
            }
        }
        else {
            // 国家队和机构卖出信号更可靠
            if (mainForceType === 'nationalTeam') {
                mainForceTypeScore += 15;
                detailedReasons.push('国家队资金卖出');
            }
            else if (mainForceType === 'institution') {
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
            }
            else if (type === 'sell' && sentimentScore < -0.5) {
                newsScore += 20;
                detailedReasons.push('负面新闻占比极高');
            }
            else if (type === 'buy' && sentimentScore > 0.5) {
                newsScore += 15;
                detailedReasons.push('正面新闻占比高');
            }
            else if (type === 'sell' && sentimentScore < -0.3) {
                newsScore += 15;
                detailedReasons.push('负面新闻占比高');
            }
            else if (type === 'buy' && sentimentScore > 0.3) {
                newsScore += 10;
                detailedReasons.push('正面新闻占比适中');
            }
            else if (type === 'sell' && sentimentScore < -0.1) {
                newsScore += 10;
                detailedReasons.push('负面新闻占比适中');
            }
            // 新闻相关性
            const avgRelevance = data.newsData.reduce((sum, news) => sum + news.relevance, 0) / totalNews;
            if (avgRelevance > 0.8) {
                newsScore += 5;
                detailedReasons.push('新闻相关性高');
            }
            else if (avgRelevance > 0.6) {
                newsScore += 3;
                detailedReasons.push('新闻相关性适中');
            }
            // 新闻时效性
            const now = Date.now();
            const recentNews = data.newsData.filter(news => now - news.timestamp < 24 * 60 * 60 * 1000).length;
            if (recentNews > 3) {
                newsScore += 5;
                detailedReasons.push('近期新闻频繁');
            }
            else if (recentNews > 1) {
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
            }
            else if (data.hotspotData.industryRank <= 10) {
                hotspotScore += 8;
                detailedReasons.push('行业排名靠前');
            }
            else if (data.hotspotData.industryRank <= 20) {
                hotspotScore += 6;
                detailedReasons.push('行业排名良好');
            }
            else if (data.hotspotData.industryRank <= 30) {
                hotspotScore += 4;
                detailedReasons.push('行业排名适中');
            }
            else if (data.hotspotData.industryRank > 50 && type === 'sell') {
                hotspotScore += 6;
                detailedReasons.push('行业排名靠后');
            }
            // 概念排名
            if (data.hotspotData.conceptRank <= 5) {
                hotspotScore += 10;
                detailedReasons.push('概念排名非常靠前');
            }
            else if (data.hotspotData.conceptRank <= 10) {
                hotspotScore += 8;
                detailedReasons.push('概念排名靠前');
            }
            else if (data.hotspotData.conceptRank <= 20) {
                hotspotScore += 6;
                detailedReasons.push('概念排名良好');
            }
            else if (data.hotspotData.conceptRank <= 30) {
                hotspotScore += 4;
                detailedReasons.push('概念排名适中');
            }
            else if (data.hotspotData.conceptRank > 50 && type === 'sell') {
                hotspotScore += 6;
                detailedReasons.push('概念排名靠后');
            }
            // 人气热度
            if (data.hotspotData.popularityScore > 90) {
                hotspotScore += 10;
                detailedReasons.push('人气热度极高');
            }
            else if (data.hotspotData.popularityScore > 80) {
                hotspotScore += 8;
                detailedReasons.push('人气热度高');
            }
            else if (data.hotspotData.popularityScore > 70) {
                hotspotScore += 6;
                detailedReasons.push('人气热度良好');
            }
            else if (data.hotspotData.popularityScore > 50) {
                hotspotScore += 4;
                detailedReasons.push('人气热度适中');
            }
            else if (data.hotspotData.popularityScore < 30 && type === 'sell') {
                hotspotScore += 8;
                detailedReasons.push('人气热度低');
            }
            // 人气趋势 - 卖出信号时更敏感
            if (data.hotspotData.popularityTrend === 'up') {
                hotspotScore += 8;
                detailedReasons.push('人气热度上升');
            }
            else if (data.hotspotData.popularityTrend === 'down') {
                hotspotScore += 10;
                detailedReasons.push('人气热度下降');
            }
            else if (data.hotspotData.popularityTrend === 'stable') {
                hotspotScore += 4;
                detailedReasons.push('人气热度稳定');
            }
            // 搜索量和社交提及
            if (data.hotspotData.searchVolume > 5000) {
                hotspotScore += 4;
                detailedReasons.push('搜索量高');
            }
            else if (data.hotspotData.searchVolume > 2000) {
                hotspotScore += 2;
                detailedReasons.push('搜索量适中');
            }
            else if (data.hotspotData.searchVolume < 500 && type === 'sell') {
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
            }
            else if (peRatio < 1) {
                financialScore += 6;
                detailedReasons.push('市盈率低于行业平均');
            }
            else if (peRatio < 1.2) {
                financialScore += 4;
                detailedReasons.push('市盈率接近行业平均');
            }
            else if (peRatio < 1.5) {
                financialScore += 2;
                detailedReasons.push('市盈率略高于行业平均');
            }
            else if (peRatio > 2 && type === 'sell') {
                financialScore += 8;
                detailedReasons.push('市盈率显著高于行业平均');
            }
            // 市净率对比行业平均
            const pbRatio = data.financialData.pb / (data.financialData.industryAveragePB || 1);
            if (pbRatio < 0.8) {
                financialScore += 8;
                detailedReasons.push('市净率显著低于行业平均');
            }
            else if (pbRatio < 1) {
                financialScore += 6;
                detailedReasons.push('市净率低于行业平均');
            }
            else if (pbRatio < 1.2) {
                financialScore += 4;
                detailedReasons.push('市净率接近行业平均');
            }
            else if (pbRatio < 1.5) {
                financialScore += 2;
                detailedReasons.push('市净率略高于行业平均');
            }
            else if (pbRatio > 2 && type === 'sell') {
                financialScore += 8;
                detailedReasons.push('市净率显著高于行业平均');
            }
            // 营收增长
            if (data.financialData.revenueGrowth > 50) {
                financialScore += 8;
                detailedReasons.push('营收爆发式增长');
            }
            else if (data.financialData.revenueGrowth > 30) {
                financialScore += 6;
                detailedReasons.push('营收大幅增长');
            }
            else if (data.financialData.revenueGrowth > 20) {
                financialScore += 4;
                detailedReasons.push('营收稳健增长');
            }
            else if (data.financialData.revenueGrowth > 10) {
                financialScore += 2;
                detailedReasons.push('营收小幅增长');
            }
            else if (data.financialData.revenueGrowth < 0 && type === 'sell') {
                financialScore += 8;
                detailedReasons.push('营收负增长');
            }
            // 利润增长
            if (data.financialData.profitGrowth > 50) {
                financialScore += 8;
                detailedReasons.push('利润爆发式增长');
            }
            else if (data.financialData.profitGrowth > 30) {
                financialScore += 6;
                detailedReasons.push('利润大幅增长');
            }
            else if (data.financialData.profitGrowth > 20) {
                financialScore += 4;
                detailedReasons.push('利润稳健增长');
            }
            else if (data.financialData.profitGrowth > 10) {
                financialScore += 2;
                detailedReasons.push('利润小幅增长');
            }
            else if (data.financialData.profitGrowth < 0 && type === 'sell') {
                financialScore += 10;
                detailedReasons.push('利润负增长');
            }
            // 净资产收益率
            if (data.financialData.roe > 20) {
                financialScore += 6;
                detailedReasons.push('净资产收益率很高');
            }
            else if (data.financialData.roe > 15) {
                financialScore += 4;
                detailedReasons.push('净资产收益率良好');
            }
            else if (data.financialData.roe > 10) {
                financialScore += 2;
                detailedReasons.push('净资产收益率适中');
            }
            else if (data.financialData.roe < 5 && type === 'sell') {
                financialScore += 8;
                detailedReasons.push('净资产收益率低');
            }
            // 资产负债率
            if (data.financialData.debtToAsset < 0.4) {
                financialScore += 4;
                detailedReasons.push('资产负债率低');
            }
            else if (data.financialData.debtToAsset < 0.6) {
                financialScore += 2;
                detailedReasons.push('资产负债率适中');
            }
            else if (data.financialData.debtToAsset > 0.8 && type === 'sell') {
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
            }
            else if (data.researchData.researchCount > 10) {
                researchScore += 4;
                detailedReasons.push('机构调研频繁');
            }
            else if (data.researchData.researchCount > 5) {
                researchScore += 2;
                detailedReasons.push('机构调研适中');
            }
            else if (data.researchData.researchCount < 2 && type === 'sell') {
                researchScore += 6;
                detailedReasons.push('机构调研稀少');
            }
            // 机构持仓变化
            if (data.researchData.institutionalChange > 10) {
                researchScore += 5;
                detailedReasons.push('机构持仓大幅增加');
            }
            else if (data.researchData.institutionalChange > 5) {
                researchScore += 3;
                detailedReasons.push('机构持仓增加');
            }
            else if (data.researchData.institutionalChange < -10) {
                researchScore += 8;
                detailedReasons.push('机构持仓大幅减少');
            }
            else if (data.researchData.institutionalChange < -5) {
                researchScore += 6;
                detailedReasons.push('机构持仓减少');
            }
            else if (data.researchData.institutionalChange < -2 && type === 'sell') {
                researchScore += 4;
                detailedReasons.push('机构持仓小幅减少');
            }
            // 分析师推荐
            if (data.researchData.analystRecommendations === 'strong_buy') {
                researchScore += 8;
                detailedReasons.push('分析师强烈推荐');
            }
            else if (data.researchData.analystRecommendations === 'buy') {
                researchScore += 6;
                detailedReasons.push('分析师推荐');
            }
            else if (data.researchData.analystRecommendations === 'hold') {
                researchScore += 3;
                detailedReasons.push('分析师持有');
            }
            else if (data.researchData.analystRecommendations === 'sell') {
                researchScore += 8;
                detailedReasons.push('分析师卖出');
            }
            else if (data.researchData.analystRecommendations === 'strong_sell') {
                researchScore += 10;
                detailedReasons.push('分析师强烈卖出');
            }
            // 目标价格
            if (data.currentPrice && data.researchData.targetPrice > data.currentPrice * 1.3) {
                researchScore += 4;
                detailedReasons.push('目标价格大幅高于当前价格');
            }
            else if (data.currentPrice && data.researchData.targetPrice > data.currentPrice * 1.1) {
                researchScore += 2;
                detailedReasons.push('目标价格高于当前价格');
            }
            else if (data.currentPrice && data.researchData.targetPrice < data.currentPrice * 0.7) {
                researchScore += 8;
                detailedReasons.push('目标价格大幅低于当前价格');
            }
            else if (data.currentPrice && data.researchData.targetPrice < data.currentPrice * 0.9) {
                researchScore += 6;
                detailedReasons.push('目标价格低于当前价格');
            }
            else if (data.currentPrice && data.researchData.targetPrice < data.currentPrice * 0.95 && type === 'sell') {
                researchScore += 4;
                detailedReasons.push('目标价格略低于当前价格');
            }
        }
        score += researchScore * 0.05;
        // 7. 技术指标分析 (权重: 10%)
        let technicalScore = 0;
        // 这里可以添加技术指标分析，如MACD、KDJ、RSI等
        // 暂时使用模拟数据
        const rsi = 30 + Math.random() * 40; // 模拟RSI值
        const macd = -0.5 + Math.random(); // 模拟MACD值
        const kdjK = 20 + Math.random() * 60; // 模拟KDJ K值
        const kdjD = 20 + Math.random() * 60; // 模拟KDJ D值
        const ma5 = data.currentPrice * (0.95 + Math.random() * 0.1); // 模拟5日均线
        const ma20 = data.currentPrice * (0.9 + Math.random() * 0.2); // 模拟20日均线
        if (type === 'buy') {
            if (rsi < 30) {
                technicalScore += 8;
                detailedReasons.push('RSI超卖');
            }
            else if (rsi < 40) {
                technicalScore += 4;
                detailedReasons.push('RSI接近超卖');
            }
            if (macd > 0) {
                technicalScore += 6;
                detailedReasons.push('MACD金叉');
            }
            if (kdjK > kdjD) {
                technicalScore += 4;
                detailedReasons.push('KDJ金叉');
            }
            if (data.currentPrice > ma5 && ma5 > ma20) {
                technicalScore += 8;
                detailedReasons.push('价格站上均线');
            }
            else if (data.currentPrice > ma5) {
                technicalScore += 4;
                detailedReasons.push('价格站上短期均线');
            }
        }
        else {
            // 卖出信号时技术指标更敏感
            if (rsi > 65) {
                technicalScore += 8;
                detailedReasons.push('RSI超买');
            }
            else if (rsi > 55) {
                technicalScore += 4;
                detailedReasons.push('RSI接近超买');
            }
            if (macd < -0.1) {
                technicalScore += 6;
                detailedReasons.push('MACD死叉');
            }
            if (kdjK < kdjD) {
                technicalScore += 4;
                detailedReasons.push('KDJ死叉');
            }
            if (data.currentPrice < ma5 && ma5 < ma20) {
                technicalScore += 8;
                detailedReasons.push('价格跌破均线');
            }
            else if (data.currentPrice < ma5) {
                technicalScore += 4;
                detailedReasons.push('价格跌破短期均线');
            }
        }
        score += technicalScore * 0.05;
        // 8. 市场情绪分析 (权重: 5%)
        let marketSentimentScore = 0;
        // 模拟市场情绪数据
        const marketSentiment = -0.5 + Math.random(); // -1到1之间的市场情绪值
        if (type === 'buy' && marketSentiment > 0.3) {
            marketSentimentScore += 10;
            detailedReasons.push('市场情绪积极');
        }
        else if (type === 'sell' && marketSentiment < -0.2) {
            marketSentimentScore += 10;
            detailedReasons.push('市场情绪消极');
        }
        else if (marketSentiment > -0.1 && marketSentiment < 0.1) {
            marketSentimentScore += 5;
            detailedReasons.push('市场情绪中性');
        }
        score += marketSentimentScore * 0.05;
        return { score: Math.min(score, 100), detailedReasons };
    }
    generateSignal(data, type) {
        const { score, detailedReasons } = this.calculateSignalScore(data, type);
        const confidence = Math.min(50 + score, 95);
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
        }
        else {
            reason = `卖出信号：当前价格 ${currentPrice.toFixed(2)} 元，主力资金净流出 ${(Math.abs(mainForceData.mainForceNetFlow) / 100000000).toFixed(2)} 亿元，占比${(mainForceRatio * 100).toFixed(0)}%`;
            if (superLargeRatio > 0.3) {
                reason += `，超大单占比${(superLargeRatio * 100).toFixed(0)}%`;
            }
        }
        // 添加综合分析理由
        if (data.newsData && data.newsData.length > 0) {
            const positiveNews = data.newsData.filter(news => news.sentiment === 'positive').length;
            const negativeNews = data.newsData.filter(news => news.sentiment === 'negative').length;
            if (positiveNews > negativeNews) {
                reason += `，正面新闻占比${Math.round((positiveNews / data.newsData.length) * 100)}%`;
            }
            else if (negativeNews > positiveNews) {
                reason += `，负面新闻占比${Math.round((negativeNews / data.newsData.length) * 100)}%`;
            }
        }
        if (data.hotspotData) {
            if (data.hotspotData.industryRank <= 10) {
                reason += `，行业排名${data.hotspotData.industryRank}`;
            }
            if (data.hotspotData.popularityTrend === 'up') {
                reason += '，人气上升';
            }
            else if (data.hotspotData.popularityTrend === 'down') {
                reason += '，人气下降';
            }
        }
        // 计算目标价格
        let targetPrice;
        if (type === 'buy' && data.currentPrice) {
            // 买入信号的目标价格：基于当前价格和得分计算
            const priceIncrease = (score / 100) * 0.2; // 最高20%的涨幅预期
            targetPrice = data.currentPrice * (1 + priceIncrease);
        }
        else if (type === 'sell' && data.currentPrice) {
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
    markSignalAsRead(signalId) {
        this.pendingBuySignals = this.pendingBuySignals.map(signal => signal.id === signalId ? { ...signal, isRead: true } : signal);
        this.pendingSellSignals = this.pendingSellSignals.map(signal => signal.id === signalId ? { ...signal, isRead: true } : signal);
        this.listeners.forEach(listener => listener([]));
    }
    markAllSignalsAsRead() {
        this.pendingBuySignals = this.pendingBuySignals.map(signal => ({ ...signal, isRead: true }));
        this.pendingSellSignals = this.pendingSellSignals.map(signal => ({ ...signal, isRead: true }));
        this.listeners.forEach(listener => listener([]));
    }
    filterAndRankBuySignals(signals) {
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
    filterSellSignals(signals) {
        if (!this.config.onlyHeldStocksForSell) {
            return signals;
        }
        return signals.filter(signal => this.positions.has(signal.stockCode));
    }
    async processMainForceData(data) {
        const tracker = getMainForceTracker();
        tracker.updateMainForceData(data);
        // 构建综合数据
        const comprehensiveData = {
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
        }
        catch (error) {
            console.error('获取新闻数据失败:', error);
        }
        // 获取热点数据
        try {
            const hotspotData = await this.getHotspotData(data.stockCode, data.stockName);
            comprehensiveData.hotspotData = hotspotData;
        }
        catch (error) {
            console.error('获取热点数据失败:', error);
        }
        // 获取财务数据
        try {
            const financialData = await this.getFinancialData(data.stockCode);
            comprehensiveData.financialData = financialData;
        }
        catch (error) {
            console.error('获取财务数据失败:', error);
        }
        // 获取调研数据
        try {
            const researchData = await this.getResearchData(data.stockCode);
            comprehensiveData.researchData = researchData;
        }
        catch (error) {
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
        const continuousFlow = this.checkContinuousMainForceFlow(data.stockCode, data.mainForceNetFlow, mainForceRatio);
        // 检查同一主力类型的持续流向
        const continuousMainForceTypeFlow = this.checkContinuousMainForceTypeFlow(data.stockCode, data);
        const newSignals = [];
        // 调整买入信号的触发条件，使其更容易触发，确保应用启动时能监控到买入信号
        // 增加持续买入的条件
        if (data.mainForceNetFlow > 1000000 ||
            (data.mainForceNetFlow > 500000 && hasStrongRelativeSignal) ||
            (continuousFlow.hasContinuousBuy && data.mainForceNetFlow > 0) ||
            (continuousMainForceTypeFlow.hasContinuousBuy && data.mainForceNetFlow > 0)) {
            const buySignal = this.generateSignal(comprehensiveData, 'buy');
            // 如果是持续买入，增加置信度和分数
            if (continuousFlow.hasContinuousBuy) {
                buySignal.confidence = Math.min(95, buySignal.confidence + 10);
                buySignal.score = Math.min(100, buySignal.score + 10);
                buySignal.reason += `，主力资金持续${continuousFlow.continuousPeriods}个周期净流入，平均流入${(continuousFlow.averageFlow / 100000000).toFixed(2)}亿元`;
                if (buySignal.detailedReasons) {
                    buySignal.detailedReasons.push(`主力资金持续${continuousFlow.continuousPeriods}个周期净流入`);
                }
                else {
                    buySignal.detailedReasons = [`主力资金持续${continuousFlow.continuousPeriods}个周期净流入`];
                }
            }
            // 如果是同一主力类型持续买入，进一步增加置信度和分数
            if (continuousMainForceTypeFlow.hasContinuousBuy) {
                const mainForceTypeMap = {
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
                }
                else if (continuousMainForceTypeFlow.flowTrend === 'up') {
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
                }
                else {
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
            this.pendingBuySignals.push(buySignal);
            this.signalHistory.unshift(buySignal);
            newSignals.push(buySignal);
            // 播放买入信号提醒
            playBuyAlert();
        }
        // 强化卖出信号的触发条件，确保在行情下跌前能够及时监控到
        // 增加持续卖出的条件
        if (data.mainForceNetFlow < -3000000 ||
            (data.mainForceNetFlow < -1500000 && hasStrongRelativeSignal) ||
            (data.mainForceNetFlow < -1000000 && hasWeakRelativeSignal) ||
            (data.mainForceNetFlow < -500000 && hasNegativeNews) ||
            (data.mainForceNetFlow < -500000 && hasNegativeTrend) ||
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
                }
                else {
                    sellSignal.detailedReasons = [`主力资金持续${continuousFlow.continuousPeriods}个周期净流出`];
                }
            }
            // 如果是同一主力类型持续卖出，进一步增加置信度和分数
            if (continuousMainForceTypeFlow.hasContinuousSell) {
                const mainForceTypeMap = {
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
                }
                else if (continuousMainForceTypeFlow.flowTrend === 'down') {
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
                }
                else {
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
    async getNewsData(stockCode) {
        // 模拟新闻数据
        const sentimentOptions = ['positive', 'negative', 'neutral'];
        const newsData = [];
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
    async getHotspotData(stockCode, stockName) {
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
            popularityTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)],
            searchVolume: Math.floor(Math.random() * 10000) + 1000
        };
    }
    // 获取财务数据
    async getFinancialData(stockCode) {
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
    async getResearchData(stockCode) {
        // 模拟调研数据
        const recommendations = ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'];
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
    cleanupOldSignals() {
        const cutoffTime = Date.now() - (this.config.maxHistoryDays * 24 * 60 * 60 * 1000);
        this.signalHistory = this.signalHistory.filter(signal => signal.timestamp >= cutoffTime);
        // 清理主力资金历史数据，只保留最近1小时的数据
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        this.mainForceHistory.forEach((history, stockCode) => {
            const filteredHistory = history.filter(item => item.timestamp >= oneHourAgo);
            if (filteredHistory.length === 0) {
                this.mainForceHistory.delete(stockCode);
            }
            else {
                this.mainForceHistory.set(stockCode, filteredHistory);
            }
        });
        // 清理主力类型历史数据，只保留最近1小时的数据
        this.mainForceTypeHistory.forEach((history, stockCode) => {
            const filteredHistory = history.filter(item => item.timestamp >= oneHourAgo);
            if (filteredHistory.length === 0) {
                this.mainForceTypeHistory.delete(stockCode);
            }
            else {
                this.mainForceTypeHistory.set(stockCode, filteredHistory);
            }
        });
    }
    // 识别主力类型
    identifyMainForceType(data) {
        const totalFlow = Math.abs(data.totalNetFlow) || 1;
        const superLargeRatio = Math.abs(data.superLargeOrder.netFlow) / totalFlow;
        const largeRatio = Math.abs(data.largeOrder.netFlow) / totalFlow;
        const smallRatio = Math.abs(data.smallOrder.netFlow) / totalFlow;
        // 国家队：超大单占比极高
        if (superLargeRatio > this.mainForceTypeThresholds.superLargeOrderRatio) {
            return 'nationalTeam';
        }
        // 机构：大单占比高
        else if (largeRatio > this.mainForceTypeThresholds.largeOrderRatio) {
            return 'institution';
        }
        // 散户：小单占比高
        else if (smallRatio > this.mainForceTypeThresholds.smallOrderRatio) {
            return 'retail';
        }
        // 未知类型
        else {
            return 'unknown';
        }
    }
    // 检查同一主力类型的持续流向
    checkContinuousMainForceTypeFlow(stockCode, data) {
        const mainForceType = this.identifyMainForceType(data);
        if (!this.mainForceTypeHistory.has(stockCode)) {
            this.mainForceTypeHistory.set(stockCode, []);
        }
        const history = this.mainForceTypeHistory.get(stockCode);
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
        let flowTrend = 'stable';
        let volumeTrend = 'stable';
        // 计算资金流向趋势
        if (history.length >= 3) {
            const recentFlow = history.slice(-3).reduce((sum, item) => sum + (item.superLargeFlow + item.largeFlow), 0) / 3;
            const previousFlow = history.slice(-6, -3).reduce((sum, item) => sum + (item.superLargeFlow + item.largeFlow), 0) / 3;
            if (recentFlow > previousFlow * 1.5) {
                flowTrend = 'strongUp';
            }
            else if (recentFlow > previousFlow * 1.1) {
                flowTrend = 'up';
            }
            else if (recentFlow < previousFlow * 0.5) {
                flowTrend = 'strongDown';
            }
            else if (recentFlow < previousFlow * 0.9) {
                flowTrend = 'down';
            }
            // 计算成交量趋势
            const recentVolume = history.slice(-3).reduce((sum, item) => sum + (Math.abs(item.superLargeFlow) + Math.abs(item.largeFlow)), 0) / 3;
            const previousVolume = history.slice(-6, -3).reduce((sum, item) => sum + (Math.abs(item.superLargeFlow) + Math.abs(item.largeFlow)), 0) / 3;
            if (recentVolume > previousVolume * 1.3) {
                volumeTrend = 'increasing';
            }
            else if (recentVolume < previousVolume * 0.7) {
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
                }
                else if (netFlow < -this.continuousFlowThreshold) {
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
    checkContinuousMainForceFlow(stockCode, currentNetFlow, mainForceRatio) {
        if (!this.mainForceHistory.has(stockCode)) {
            this.mainForceHistory.set(stockCode, []);
        }
        const history = this.mainForceHistory.get(stockCode);
        history.push({ timestamp: Date.now(), netFlow: currentNetFlow, ratio: mainForceRatio });
        // 只保留最近的10个数据点
        if (history.length > 10) {
            history.shift();
        }
        // 检查持续买入
        let continuousBuyCount = 0;
        let continuousSellCount = 0;
        let totalFlow = 0;
        for (const item of history) {
            if (item.netFlow > this.continuousFlowThreshold) {
                continuousBuyCount++;
                totalFlow += item.netFlow;
            }
            else if (item.netFlow < -this.continuousFlowThreshold) {
                continuousSellCount++;
                totalFlow += item.netFlow;
            }
        }
        return {
            hasContinuousBuy: continuousBuyCount >= this.continuousFlowPeriods,
            hasContinuousSell: continuousSellCount >= this.continuousFlowPeriods,
            continuousPeriods: Math.max(continuousBuyCount, continuousSellCount),
            averageFlow: totalFlow / history.length
        };
    }
    getSignalHistory() {
        return this.applyFilters(this.signalHistory);
    }
    applyFilters(signals) {
        let filtered = [...signals];
        if (this.config.stockFilter) {
            const filter = this.config.stockFilter.toLowerCase();
            filtered = filtered.filter(signal => signal.stockCode.toLowerCase().includes(filter) ||
                signal.stockName.toLowerCase().includes(filter));
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
    processPredictionData(stockCode, stockName, currentPrice) {
        const prediction = this.predictionManager.generatePrediction(stockCode, stockName);
        if (prediction && prediction.predictionType !== 'hold' && prediction.confidence >= this.config.minConfidence) {
            const predictiveSignal = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
                stockCode: prediction.stockCode,
                stockName: prediction.stockName,
                type: prediction.predictionType,
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
            }
            else {
                this.pendingSellSignals.push(predictiveSignal);
            }
            this.listeners.forEach(listener => listener([predictiveSignal]));
        }
        return prediction;
    }
    initializeHistoricalData(stockCode, days = 60) {
        const mockData = this.predictionManager.generateMockHistoricalData(stockCode, days);
        this.predictionManager.addHistoricalData(stockCode, mockData);
    }
    getOptimizedBuySignals() {
        return this.filterAndRankBuySignals(this.pendingBuySignals);
    }
    getOptimizedSellSignals() {
        return this.filterSellSignals(this.pendingSellSignals);
    }
    addPosition(position) {
        this.positions.set(position.stockCode, position);
        this.savePositionsToStorage();
    }
    removePosition(stockCode) {
        this.positions.delete(stockCode);
        this.savePositionsToStorage();
    }
    getPositions() {
        return Array.from(this.positions.values());
    }
    getPosition(stockCode) {
        return this.positions.get(stockCode);
    }
    markSignalAsNotified(signalId) {
        this.notifiedSignals.add(signalId);
    }
    // 清空历史提示信号数据
    clearSignalHistory() {
        this.signalHistory = [];
        this.pendingBuySignals = [];
        this.pendingSellSignals = [];
        this.listeners.forEach(listener => listener([]));
    }
    shouldNotifySignal(signal) {
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
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }
    clearPendingSignals() {
        this.pendingBuySignals = [];
        this.pendingSellSignals = [];
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    getConfig() {
        return { ...this.config };
    }
}
let signalManagerInstance = null;
export const getOptimizedSignalManager = () => {
    if (!signalManagerInstance) {
        signalManagerInstance = new OptimizedSignalManager();
    }
    return signalManagerInstance;
};
