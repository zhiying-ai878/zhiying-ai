import { scanAllStocks, getMainForceData, getTechnicalIndicators, Logger, getStockDataSource } from './stockData.js';
import * as SignalManager from './optimizedSignalManager.js';
import { playBuyAlert, playSellAlert } from './audioManager.js';
const logger = Logger.getInstance();
const DEFAULT_CONFIG = {
    enabled: true,
    scanInterval: 300000,
    batchSize: 100, // 优化：增加批处理大小，提高扫描效率
    minConfidence: 40, // 优化：提高最低置信度，减少噪音信号
    maxSignalsPerScan: 100, // 优化：增加最大信号数量
    autoAlert: true,
    stockFilters: {
        minPrice: 0.1,
        maxPrice: 2000,
        minVolume: 50000, // 优化：提高最小成交量，过滤流动性差的股票
        excludeST: true, // 优化：排除ST股票
        excludeNewStocks: false // 优化：启用新股监控
    }
};
class MarketMonitorManager {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "scanTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "isScanning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "scanStatus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'idle'
        });
        Object.defineProperty(this, "signalManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: SignalManager.getOptimizedSignalManager()
        });
        Object.defineProperty(this, "lastScanTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "scanHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "limitUpStocksHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "learningModel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                features: [
                    'mainForceNetFlow', 'mainForceRatio', 'volumeAmplification', 'turnoverRate',
                    'rsi', 'macdDiff', 'macdCrossSignal', 'kdjK', 'kdjCrossSignal',
                    'priceToMa5', 'priceToMa10', 'priceToMa20', 'priceToBollUpper',
                    'bollWidth', 'volumeRatio', 'cci', 'adx', 'williamsR',
                    'continuousFlowPeriods', 'flowStrength', 'industryRank', 'conceptRank',
                    'marketType', 'industryType'
                ],
                weights: {
                    'mainForceNetFlow': 0.08,
                    'mainForceRatio': 0.08,
                    'volumeAmplification': 0.07,
                    'turnoverRate': 0.06,
                    'rsi': 0.05,
                    'macdDiff': 0.05,
                    'macdCrossSignal': 0.06,
                    'kdjK': 0.05,
                    'kdjCrossSignal': 0.06,
                    'priceToMa5': 0.05,
                    'priceToMa10': 0.04,
                    'priceToMa20': 0.04,
                    'priceToBollUpper': 0.05,
                    'bollWidth': 0.04,
                    'volumeRatio': 0.05,
                    'cci': 0.04,
                    'adx': 0.04,
                    'williamsR': 0.04,
                    'continuousFlowPeriods': 0.05,
                    'flowStrength': 0.04,
                    'industryRank': 0.03,
                    'conceptRank': 0.03,
                    'marketType': 0.02,
                    'industryType': 0.02
                },
                bias: 0,
                accuracy: 0,
                lastTrained: 0
            }
        });
        Object.defineProperty(this, "lastLearningTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.config = { ...DEFAULT_CONFIG, ...config };
        logger.info('全市场监控管理器已初始化');
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
        // 添加动态扫描间隔调整
        this.adjustScanInterval();
        logger.info(`全市场监控已启动，初始扫描间隔: ${this.config.scanInterval / 1000}秒`);
    }
    adjustScanInterval() {
        if (this.scanTimer) {
            clearInterval(this.scanTimer);
            this.scanTimer = null;
        }
        const marketStatus = this.checkMarketStatus();
        let interval;
        if (marketStatus === 'open') {
            // 交易时间：根据市场波动情况动态调整扫描间隔
            // 获取最近的扫描结果，判断市场波动情况
            const hasRecentSignals = this.scanHistory.length > 0 &&
                this.scanHistory[this.scanHistory.length - 1].buySignals > 0;
            // 如果最近有信号生成，说明市场活跃，缩短扫描间隔
            interval = hasRecentSignals ? 3000 : 5000; // 活跃市场3秒，正常市场5秒
        }
        else if (marketStatus === 'auction') {
            // 集合竞价：中等频率
            interval = 8000; // 8秒，比之前更频繁
        }
        else {
            // 收盘时间：降低频率，节省资源
            interval = 300000; // 5分钟
        }
        this.scanTimer = setInterval(() => {
            this.scanMarket();
            // 每30秒重新检查市场状态，动态调整间隔
            if (Date.now() % 30000 < interval) {
                this.adjustScanInterval();
            }
        }, interval);
        logger.info(`扫描间隔已调整为 ${interval / 1000}秒 (市场状态: ${marketStatus})`);
    }
    stopMonitoring() {
        if (this.scanTimer) {
            clearInterval(this.scanTimer);
            this.scanTimer = null;
            logger.info('全市场监控已停止');
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
    collectLimitUpStockFeatures(stockData, technicalData, mainForceData) {
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
            const macdCrossSignal = macdDiff > macdDea ? 1 : macdDiff < macdDea ? -1 : 0;
            const kdjK = technicalData.kdj?.k || 0;
            const kdjD = technicalData.kdj?.d || 0;
            const kdjCrossSignal = kdjK > kdjD ? 1 : kdjK < kdjD ? -1 : 0;
            const rsi = technicalData.rsi || 50;
            const rsiOverbought = rsi > 70 ? 1 : 0;
            const rsiOversold = rsi < 30 ? 1 : 0;
            const volumeMA5 = technicalData.volume?.ma5 || 0;
            const volumeMA10 = technicalData.volume?.ma10 || 0;
            const volumeRatio = volumeMA10 > 0 ? volumeMA5 / volumeMA10 : 1;
            const marketType = stockData.stockCode.startsWith('688') ? 1 :
                stockData.stockCode.startsWith('300') || stockData.stockCode.startsWith('301') ? 2 :
                    stockData.stockCode.startsWith('002') ? 3 :
                        stockData.stockCode.startsWith('000') ? 4 :
                            stockData.stockCode.startsWith('60') ? 5 : 0;
            const industryType = mainForceData.industryRank < 20 ? 1 :
                mainForceData.industryRank < 50 ? 2 :
                    mainForceData.industryRank < 80 ? 3 : 4;
            const feature = {
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
                timestamp: Date.now()
            };
            this.limitUpStocksHistory.push(feature);
            if (this.limitUpStocksHistory.length > 2000) {
                this.limitUpStocksHistory.shift();
            }
        }
    }
    trainLearningModel() {
        if (this.limitUpStocksHistory.length < 20) {
            logger.info('涨停板样本数量不足，跳过模型训练');
            return;
        }
        logger.info(`开始训练机器学习模型，样本数量: ${this.limitUpStocksHistory.length}`);
        const features = this.learningModel.features;
        const newWeights = {};
        features.forEach(feature => {
            let sum = 0;
            let count = 0;
            this.limitUpStocksHistory.forEach(stock => {
                let value = 0;
                switch (feature) {
                    case 'mainForceNetFlow':
                        value = Math.log(Math.abs(stock.mainForceNetFlow) + 1) / 15;
                        break;
                    case 'mainForceRatio':
                        value = stock.mainForceRatio;
                        break;
                    case 'volumeAmplification':
                        value = Math.log(stock.volumeAmplification) / 2.5;
                        break;
                    case 'turnoverRate':
                        value = Math.min(stock.turnoverRate / 25, 1);
                        break;
                    case 'rsi':
                        value = (75 - Math.min(stock.rsi, 75)) / 75;
                        break;
                    case 'macdDiff':
                        value = Math.max(stock.macdDiff, 0) * 8;
                        break;
                    case 'macdCrossSignal':
                        value = stock.macdCrossSignal === 1 ? 1 : 0;
                        break;
                    case 'kdjK':
                        value = (stock.kdjK - 25) / 50;
                        break;
                    case 'kdjCrossSignal':
                        value = stock.kdjCrossSignal === 1 ? 1 : 0;
                        break;
                    case 'priceToMa5':
                        value = Math.min(stock.priceToMa5 * 10, 1);
                        break;
                    case 'priceToMa10':
                        value = Math.min(stock.priceToMa10 * 8, 1);
                        break;
                    case 'priceToMa20':
                        value = Math.min(stock.priceToMa20 * 6, 1);
                        break;
                    case 'priceToBollUpper':
                        value = Math.min(Math.abs(stock.priceToBollUpper) * 5, 1);
                        break;
                    case 'bollWidth':
                        value = Math.min(stock.bollWidth * 5, 1);
                        break;
                    case 'volumeRatio':
                        value = Math.min(stock.volumeRatio, 2) / 2;
                        break;
                    case 'cci':
                        value = Math.min(Math.abs(stock.cci) / 200, 1);
                        break;
                    case 'adx':
                        value = Math.min(stock.adx / 50, 1);
                        break;
                    case 'williamsR':
                        value = Math.min((-stock.williamsR) / 100, 1);
                        break;
                    case 'continuousFlowPeriods':
                        value = Math.min(stock.continuousFlowPeriods / 10, 1);
                        break;
                    case 'flowStrength':
                        value = stock.flowStrength === 'strong' || stock.flowStrength === 'veryStrong' ? 1 :
                            stock.flowStrength === 'moderate' ? 0.5 : 0;
                        break;
                    case 'industryRank':
                        value = Math.max(0, (40 - stock.industryRank) / 40);
                        break;
                    case 'conceptRank':
                        value = Math.max(0, (25 - stock.conceptRank) / 25);
                        break;
                    case 'marketType':
                        value = stock.stockCode.startsWith('688') || stock.stockCode.startsWith('300') || stock.stockCode.startsWith('301') ? 0.8 :
                            stock.stockCode.startsWith('002') ? 0.6 :
                                stock.stockCode.startsWith('000') ? 0.4 :
                                    stock.stockCode.startsWith('60') ? 0.3 : 0;
                        break;
                    case 'industryType':
                        value = stock.industryRank < 20 ? 1 :
                            stock.industryRank < 50 ? 0.7 :
                                stock.industryRank < 80 ? 0.4 : 0.2;
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
        this.learningModel.weights = newWeights;
        this.learningModel.lastTrained = Date.now();
        this.learningModel.accuracy = this.calculateModelAccuracy();
        logger.info(`模型训练完成，准确率: ${(this.learningModel.accuracy * 100).toFixed(2)}%`);
    }
    calculateModelAccuracy() {
        if (this.limitUpStocksHistory.length < 10)
            return 0;
        let correct = 0;
        let total = 0;
        let highConfidenceCorrect = 0;
        let highConfidenceTotal = 0;
        this.limitUpStocksHistory.forEach(stock => {
            const score = this.calculateStockScore(stock);
            if (score > 0.5) {
                correct++;
            }
            total++;
            if (score > 0.7) {
                if (stock.isLimitUp) {
                    highConfidenceCorrect++;
                }
                highConfidenceTotal++;
            }
        });
        const baseAccuracy = total > 0 ? correct / total : 0;
        const highConfidenceAccuracy = highConfidenceTotal > 0 ? highConfidenceCorrect / highConfidenceTotal : 0;
        const combinedAccuracy = baseAccuracy * 0.7 + highConfidenceAccuracy * 0.3;
        logger.info(`模型准确率计算完成 - 基础准确率: ${(baseAccuracy * 100).toFixed(2)}%, 高置信度准确率: ${(highConfidenceAccuracy * 100).toFixed(2)}%, 综合准确率: ${(combinedAccuracy * 100).toFixed(2)}%`);
        return combinedAccuracy;
    }
    calculateStockScore(stock) {
        let score = 0;
        const mainForceData = stock.mainForceData || {};
        const technicalData = stock.technicalData || {};
        const currentPrice = stock.currentPrice || 0;
        const ma5 = technicalData.ma?.ma5 || 0;
        const ma10 = technicalData.ma?.ma10 || 0;
        const ma20 = technicalData.ma?.ma20 || 0;
        const bollMiddle = technicalData.boll?.middle || 0;
        const bollUpper = technicalData.boll?.upper || 0;
        const bollLower = technicalData.boll?.lower || 0;
        const priceToMa5 = ma5 > 0 ? (currentPrice - ma5) / ma5 : 0;
        const priceToMa10 = ma10 > 0 ? (currentPrice - ma10) / ma10 : 0;
        const priceToMa20 = ma20 > 0 ? (currentPrice - ma20) / ma20 : 0;
        const priceToBollMiddle = bollMiddle > 0 ? (currentPrice - bollMiddle) / bollMiddle : 0;
        const priceToBollUpper = bollUpper > 0 ? (currentPrice - bollUpper) / bollUpper : 0;
        const bollWidth = bollMiddle > 0 ? (bollUpper - bollLower) / bollMiddle : 0;
        const macdDiff = technicalData.macd?.diff || 0;
        const macdDea = technicalData.macd?.dea || 0;
        const macdCrossSignal = macdDiff > macdDea ? 1 : macdDiff < macdDea ? -1 : 0;
        const kdjK = technicalData.kdj?.k || 0;
        const kdjD = technicalData.kdj?.d || 0;
        const kdjCrossSignal = kdjK > kdjD ? 1 : kdjK < kdjD ? -1 : 0;
        const rsi = technicalData.rsi || 50;
        const rsiOverbought = rsi > 70 ? 1 : 0;
        const rsiOversold = rsi < 30 ? 1 : 0;
        const volumeMA5 = technicalData.volume?.ma5 || 0;
        const volumeMA10 = technicalData.volume?.ma10 || 0;
        const volumeRatio = volumeMA10 > 0 ? volumeMA5 / volumeMA10 : 1;
        const marketType = stock.stockCode.startsWith('688') ? 1 :
            stock.stockCode.startsWith('300') || stock.stockCode.startsWith('301') ? 2 :
                stock.stockCode.startsWith('002') ? 3 :
                    stock.stockCode.startsWith('000') ? 4 :
                        stock.stockCode.startsWith('60') ? 5 : 0;
        const industryType = mainForceData.industryRank < 20 ? 1 :
            mainForceData.industryRank < 50 ? 2 :
                mainForceData.industryRank < 80 ? 3 : 4;
        Object.entries(this.learningModel.weights).forEach(([feature, weight]) => {
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
                    value = Math.min(Math.abs(technicalData.cci || 0) / 200, 1);
                    break;
                case 'adx':
                    value = Math.min((technicalData.adx || 0) / 50, 1);
                    break;
                case 'williamsR':
                    value = Math.min((-(technicalData.williamsR || 0)) / 100, 1);
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
                default:
                    value = 0;
            }
            score += value * weight;
        });
        return Math.min(1, score + this.learningModel.bias);
    }
    async autoLearnAndOptimize() {
        const now = Date.now();
        const nowDate = new Date();
        const lastLearningDate = new Date(this.lastLearningTime);
        const isNewTradingDay = nowDate.getDate() !== lastLearningDate.getDate() ||
            nowDate.getMonth() !== lastLearningDate.getMonth() ||
            nowDate.getFullYear() !== lastLearningDate.getFullYear();
        const marketStatus = this.checkMarketStatus();
        const isTradingTime = marketStatus === 'open' || marketStatus === 'auction';
        // 优化：每天收盘后和交易时间都进行学习，确保不断优化
        if (!isNewTradingDay && !isTradingTime) {
            return;
        }
        logger.info('开始自动学习和模型优化...');
        // 训练学习模型，分析涨停板股票特性
        this.trainLearningModel();
        // 优化买入条件，特别关注底部放量涨停板股票
        this.optimizeBuyConditions();
        // 记录学习时间
        this.lastLearningTime = now;
        logger.info(`自动学习完成 - 涨停板样本数量: ${this.limitUpStocksHistory.length}`);
        logger.info(`模型准确率: ${(this.learningModel.accuracy * 100).toFixed(2)}%`);
    }
    optimizeBuyConditions() {
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
    checkMarketStatus() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        if ((hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute <= 30) ||
            (hour === 13) || (hour === 14) || (hour === 15 && minute === 0)) {
            return 'open';
        }
        else if (hour === 9 && minute >= 15 && minute <= 25) {
            return 'auction';
        }
        else {
            return 'closed';
        }
    }
    async getStockCount() {
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
    getActiveScans() {
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
        let scanStatus = 'success';
        let dataSourceStatus = 'unknown';
        try {
            this.scanStatus = 'preparing';
            logger.info(`=== 开始全市场扫描 [${scanId}] ===`);
            logger.info(`当前市场状态: ${marketStatus}, 扫描间隔: ${this.config.scanInterval / 1000}秒`);
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
                }
                catch (failoverError) {
                    logger.error(`[${scanId}] 数据源切换失败，扫描无法进行:`, failoverError instanceof Error ? failoverError.message : String(failoverError));
                    this.scanStatus = 'failed';
                    dataSourceStatus = 'failed';
                    return; // 数据源连接失败，不显示扫描中
                }
            }
            logger.info(`[${scanId}] 开始获取股票列表...`);
            const stockList = await stockDataSource.getStockList();
            totalStocks = stockList.length;
            logger.info(`[${scanId}] 获取到 ${totalStocks} 只A股股票列表`);
            if (marketStatus === 'closed') {
                logger.info(`[${scanId}] 当前不在交易时间内 (${marketStatus})，跳过行情数据获取`);
                logger.info(`[${scanId}] 执行自动学习和优化...`);
                await this.autoLearnAndOptimize();
                logger.info(`[${scanId}] 自动学习和优化完成`);
                scanStatus = 'partial';
            }
            else {
                try {
                    logger.info(`[${scanId}] 开始获取行情数据，批处理大小: ${this.config.batchSize}`);
                    // 为scanAllStocks添加超时处理，避免网络问题导致整个扫描卡住
                    const scanPromise = scanAllStocks(this.config.batchSize);
                    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('行情数据获取超时')), 30000));
                    const allQuotes = await Promise.race([scanPromise, timeoutPromise]);
                    if (Array.isArray(allQuotes)) {
                        dataSourceConnected = true;
                        dataSourceStatus = 'connected';
                        this.scanStatus = 'scanning';
                        this.isScanning = true; // 只有获取到行情数据后才显示扫描中
                        logger.info(`[${scanId}] 获取到 ${allQuotes.length} 只股票的实时行情`);
                        if (allQuotes.length > 0) {
                            logger.info(`[${scanId}] 开始过滤股票，应用过滤条件: minPrice=${this.config.stockFilters.minPrice}, maxPrice=${this.config.stockFilters.maxPrice}, minVolume=${this.config.stockFilters.minVolume}`);
                            filteredQuotes = this.filterStocks(allQuotes);
                            logger.info(`[${scanId}] 过滤后剩余 ${filteredQuotes.length} 只股票`);
                            const stockCodes = filteredQuotes.map(quote => quote.code);
                            logger.info(`[${scanId}] 开始获取主力资金数据，股票数量: ${stockCodes.length}`);
                            const mainForceDataMap = await this.getMainForceDataMap(stockCodes);
                            logger.info(`[${scanId}] 获取主力资金数据完成，数据项数: ${mainForceDataMap.size}`);
                            logger.info(`[${scanId}] 开始生成交易信号...`);
                            const signals = await this.generateSignals(filteredQuotes, mainForceDataMap);
                            buySignals = signals.filter(s => s.type === 'buy').length;
                            sellSignals = signals.filter(s => s.type === 'sell').length;
                            logger.info(`[${scanId}] 信号生成完成，买入信号: ${buySignals}个, 卖出信号: ${sellSignals}个`);
                        }
                        else {
                            logger.warn(`[${scanId}] 未获取到股票行情数据，但股票列表获取成功`);
                            scanStatus = 'partial';
                            this.isScanning = false; // 没有数据，不显示扫描中
                            this.scanStatus = 'completed';
                        }
                    }
                }
                catch (scanError) {
                    logger.error(`[${scanId}] 行情数据获取失败:`, scanError instanceof Error ? scanError.message : String(scanError));
                    logger.warn(`[${scanId}] 数据源连接失败，无法获取行情数据`);
                    dataSourceStatus = 'failed';
                    scanStatus = 'failed';
                    this.scanStatus = 'failed';
                    // 数据源连接失败，不显示扫描中
                }
            }
        }
        catch (error) {
            logger.error(`[${scanId}] 全市场扫描失败:`, error instanceof Error ? error.message : String(error));
            scanStatus = 'failed';
            dataSourceStatus = 'failed';
            this.scanStatus = 'failed';
            // 即使发生错误，也要使用默认的股票数量（5000只A股）
            if (totalStocks === 0) {
                totalStocks = 5000; // 默认A股股票数量
                logger.warn(`[${scanId}] 使用默认股票数量: 5000只`);
            }
        }
        finally {
            const duration = Date.now() - startTime;
            // 更新scanHistory
            this.scanHistory.push({
                timestamp: startTime,
                totalStocks: totalStocks,
                processedStocks: filteredQuotes.length,
                buySignals: buySignals,
                sellSignals: sellSignals,
                duration: duration,
                status: scanStatus,
                dataSourceStatus: dataSourceStatus
            });
            if (this.scanHistory.length > 100) {
                this.scanHistory.shift();
            }
            logger.info(`[${scanId}] 全市场扫描完成，耗时: ${duration}ms`);
            logger.info(`[${scanId}] 监控股票: ${totalStocks} 只, 处理股票: ${filteredQuotes.length} 只`);
            logger.info(`[${scanId}] 生成信号: 买入 ${buySignals} 个, 卖出 ${sellSignals} 个`);
            logger.info(`[${scanId}] 数据源连接状态: ${dataSourceConnected ? '成功' : '失败'}`);
            logger.info(`[${scanId}] 扫描状态: ${scanStatus}`);
            logger.info(`[${scanId}] 扫描完成，等待下次扫描...`);
            // 确保扫描状态被重置
            if (this.isScanning) {
                this.isScanning = false;
            }
            this.scanStatus = 'completed';
            this.lastScanTime = Date.now();
        }
    }
    filterStocks(quotes) {
        const { minPrice, maxPrice, minVolume, excludeST, excludeNewStocks } = this.config.stockFilters;
        return quotes.filter(quote => {
            if (minPrice !== undefined && quote.price < minPrice)
                return false;
            if (maxPrice !== undefined && quote.price > maxPrice)
                return false;
            if (minVolume !== undefined && quote.volume < minVolume)
                return false;
            if (excludeST && quote.name && (quote.name.includes('ST') || quote.name.includes('*ST')))
                return false;
            // 优化：支持识别新股 - N开头是上市首日，S开头是上市第2、3日
            if (excludeNewStocks) {
                if (quote.code.startsWith('688'))
                    return false;
                if (quote.name && (quote.name.startsWith('N') || quote.name.startsWith('S')))
                    return false;
            }
            return true;
        });
    }
    async getMainForceDataMap(codes) {
        const mainForceDataMap = new Map();
        try {
            const batchSize = 20;
            for (let i = 0; i < codes.length; i += batchSize) {
                const batch = codes.slice(i, i + batchSize);
                const mainForceData = await getMainForceData(batch);
                mainForceData.forEach(data => {
                    mainForceDataMap.set(data.stockCode, data);
                });
                if (i + batchSize < codes.length) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        catch (error) {
            logger.error('获取主力资金数据失败:', error instanceof Error ? error.message : String(error));
        }
        return mainForceDataMap;
    }
    async generateSignals(quotes, mainForceDataMap) {
        const signals = [];
        // 使用并行处理提高性能
        const quotePromises = quotes.map(async (quote) => {
            try {
                let technicalData = null;
                let mainForceData = null;
                try {
                    technicalData = await getTechnicalIndicators(quote.code);
                }
                catch (error) {
                    logger.warn(`获取股票 ${quote.code} 技术指标失败，跳过分析:`, error instanceof Error ? error.message : String(error));
                    return [];
                }
                mainForceData = mainForceDataMap.get(quote.code);
                if (!mainForceData) {
                    logger.warn(`未获取到股票 ${quote.code} 主力资金数据，跳过分析`);
                    return [];
                }
                const comprehensiveData = {
                    stockCode: quote.code,
                    stockName: quote.name,
                    mainForceData,
                    technicalData,
                    currentPrice: quote.price,
                    changePercent: quote.changePercent
                };
                this.collectLimitUpStockFeatures(comprehensiveData, technicalData, mainForceData);
                const limitUpPotentialScore = this.calculateStockScore(comprehensiveData);
                const buySignal = this.generateBuySignal(comprehensiveData, limitUpPotentialScore);
                const sellSignal = this.generateSellSignal(comprehensiveData);
                const stockSignals = [];
                if (buySignal) {
                    stockSignals.push(buySignal);
                    if (this.config.autoAlert) {
                        playBuyAlert();
                    }
                }
                if (sellSignal) {
                    stockSignals.push(sellSignal);
                    if (this.config.autoAlert) {
                        playSellAlert();
                    }
                }
                return stockSignals;
            }
            catch (error) {
                logger.warn(`分析股票 ${quote.code} ${quote.name} 时出错:`, error instanceof Error ? error.message : String(error));
                return [];
            }
        });
        // 等待所有并行处理完成
        const allSignals = await Promise.all(quotePromises);
        // 合并所有信号并限制数量
        const combinedSignals = allSignals.flat();
        return combinedSignals.slice(0, this.config.maxSignalsPerScan);
    }
    generateBuySignal(data, limitUpPotentialScore = 0) {
        const { mainForceData, technicalData, currentPrice } = data;
        const mainForceNetFlow = mainForceData.mainForceNetFlow;
        const totalNetFlow = mainForceData.totalNetFlow;
        const mainForceRatio = totalNetFlow !== 0 ? Math.abs(mainForceNetFlow) / Math.abs(totalNetFlow) : 0;
        const { rsi, macd, kdj, ma, boll, volume } = technicalData;
        // 优化的买入条件，特别关注底部放量涨停板股票
        const buyConditions = [
            // 主力资金净流入条件（现在使用优化的备用数据）
            mainForceNetFlow > 0, // 简化条件：只要有资金流入就满足
            mainForceRatio > 0.05, // 进一步降低主力资金占比阈值
            mainForceData.mainForceType === 'institution' || mainForceData.mainForceType === 'privateFund', // 关注机构和私募基金
            mainForceData.flowStrength === 'increasing' || mainForceData.trend === 'increasing', // 关注趋势增强的情况
            mainForceData.flowStrength === 'strong' || mainForceData.flowStrength === 'moderate', // 关注强或中等资金流入
            mainForceData.continuousFlowPeriods && mainForceData.continuousFlowPeriods >= 1, // 连续流入至少1个周期
            // 价格和技术指标条件（增加更多独立条件）
            data.changePercent !== undefined && data.changePercent > 0, // 只要上涨就满足，不限制涨幅
            data.changePercent !== undefined && data.changePercent > 2, // 涨幅超过2%
            currentPrice > ma.ma5, // 价格站上5日均线
            currentPrice > ma.ma10, // 价格站上10日均线
            currentPrice > ma.ma20, // 价格站上20日均线
            rsi > 30, // 放宽RSI下限，允许超买状态
            rsi > 50, // RSI处于强势区域
            macd && macd.diff > macd.dea, // MACD金叉
            macd && macd.macd > 0, // MACD柱状体为正
            kdj && kdj.k > kdj.d, // KDJ金叉
            kdj && kdj.j > kdj.k, // KDJ多头排列
            boll && currentPrice > boll.middle, // 价格在布林带中轨上方
            boll && currentPrice > boll.lower, // 价格在布林带下轨上方
            // 成交量和活跃度条件
            mainForceData.volumeAmplification > 1.0, // 降低成交量放大阈值
            mainForceData.turnoverRate > 0.1, // 降低换手率阈值
            volume && volume.ma5 > volume.ma10, // 成交量均线多头排列
            volume && volume.ma5 > volume.ma20, // 成交量均线多头排列
            // 行业和概念条件
            mainForceData.industryRank === undefined || mainForceData.industryRank < 80, // 大幅放宽行业排名限制
            mainForceData.conceptRank === undefined || mainForceData.conceptRank < 60, // 大幅放宽概念排名限制
            // 市场类型条件
            data.stockCode && (data.stockCode.startsWith('688') || data.stockCode.startsWith('300') || data.stockCode.startsWith('301') || data.stockCode.startsWith('60') || data.stockCode.startsWith('000') || data.stockCode.startsWith('002')),
            // 底部放量涨停板股票特殊条件
            mainForceData.volumeAmplification > 1.5 && data.changePercent && data.changePercent > 5, // 底部放量，涨幅超过5%
            currentPrice / (ma.ma20 || currentPrice) < 1.3, // 相对底部位置
            mainForceData.turnoverRate > 1 && data.changePercent && data.changePercent > 5, // 换手率高且涨幅超过5%
        ];
        const satisfiedConditions = buyConditions.filter(Boolean).length;
        // 判断是否为底部放量涨停板股票
        const isBottomLimitUpStock = mainForceData.volumeAmplification > 2 &&
            data.changePercent && data.changePercent > 9 &&
            currentPrice / (ma.ma20 || currentPrice) < 1.2;
        // 优化：降低满足条件数量要求，确保涨幅较大的股票和底部放量涨停板股票也能生成信号
        const minConditions = isBottomLimitUpStock ? 4 : (data.changePercent && data.changePercent > 10 ? 5 : 6);
        if (satisfiedConditions >= minConditions) {
            let confidence = Math.min(100, satisfiedConditions * 10);
            confidence += limitUpPotentialScore * 30;
            // 根据涨幅调整置信度 - 涨幅越大，置信度越高
            if (data.changePercent) {
                if (data.changePercent > 15)
                    confidence += 40;
                else if (data.changePercent > 10)
                    confidence += 30;
                else if (data.changePercent > 5)
                    confidence += 20;
                else if (data.changePercent > 2)
                    confidence += 10;
            }
            // 根据主力资金强度调整置信度
            if (mainForceNetFlow > 500000)
                confidence += 30;
            else if (mainForceNetFlow > 200000)
                confidence += 25;
            else if (mainForceNetFlow > 100000)
                confidence += 20;
            else if (mainForceNetFlow > 50000)
                confidence += 15;
            else if (mainForceNetFlow > 10000)
                confidence += 10;
            // 根据资金类型调整置信度
            if (mainForceData.mainForceType === 'institution')
                confidence += 25;
            else if (mainForceData.mainForceType === 'privateFund')
                confidence += 20;
            // 根据连续流入周期调整置信度
            if (mainForceData.continuousFlowPeriods >= 3)
                confidence += 30;
            else if (mainForceData.continuousFlowPeriods >= 2)
                confidence += 20;
            else if (mainForceData.continuousFlowPeriods >= 1)
                confidence += 15;
            // 根据技术形态调整置信度
            if (currentPrice > ma.ma5 * 1.02 && currentPrice > ma.ma10 * 1.01)
                confidence += 15;
            if (macd && macd.diff > macd.dea * 1.1)
                confidence += 15;
            if (kdj && kdj.k > kdj.d * 1.1)
                confidence += 15;
            // 底部放量涨停板股票特殊置信度加成
            if (isBottomLimitUpStock) {
                confidence += 50; // 底部放量涨停板股票大幅提高置信度
                logger.info(`发现底部放量涨停板股票: ${data.stockName}(${data.stockCode}) - 成交量放大${mainForceData.volumeAmplification.toFixed(2)}倍，涨幅${data.changePercent.toFixed(2)}%`);
            }
            // 回调洗盘结束判断 - 底部放量涨停后回调企稳
            const isPullbackCompleted = isBottomLimitUpStock &&
                currentPrice > ma.ma5 &&
                rsi > 40 &&
                macd && macd.diff > 0;
            if (isPullbackCompleted) {
                confidence += 30; // 回调洗盘结束，准备上涨，大幅提高置信度
                logger.info(`底部放量涨停板股票回调洗盘结束: ${data.stockName}(${data.stockCode}) - 准备开始上涨`);
            }
            confidence = Math.min(100, confidence);
            if (confidence >= this.config.minConfidence) {
                const buyPriceLower = currentPrice * 0.99;
                const buyPriceUpper = currentPrice * 1.01;
                const sellPriceLower = currentPrice * 1.15;
                const sellPriceUpper = currentPrice * 2.00;
                let reason = `全市场扫描发现潜在上涨机会 (满足${satisfiedConditions}/23个买入条件)`;
                // 底部放量涨停板股票特殊处理
                if (isPullbackCompleted) {
                    reason = `【底部放量涨停回调结束】${data.stockName}(${data.stockCode}) - 底部放量涨停后回调洗盘结束，准备开始上涨，主力庄家已入住，可能出现翻倍大涨行情 (满足${satisfiedConditions}/23个买入条件)`;
                }
                else if (isBottomLimitUpStock) {
                    reason = `【底部放量涨停板】${data.stockName}(${data.stockCode}) - 底部放量涨停，主力资金强势介入，可能启动翻倍行情 (满足${satisfiedConditions}/23个买入条件)`;
                }
                else if (mainForceNetFlow > 0 && Math.abs(data.changePercent || 0) < 2) {
                    reason = `【主力偷偷买入】${data.stockName}(${data.stockCode}) - 主力资金持续流入但价格涨幅极小 (满足${satisfiedConditions}/23个买入条件)`;
                }
                else if (data.stockCode && (data.stockCode.startsWith('688') || data.stockCode.startsWith('300') || data.stockCode.startsWith('301'))) {
                    reason = `【涨停潜力股】${data.stockName}(${data.stockCode}) - 主力资金异动，技术形态完美 (满足${satisfiedConditions}/23个买入条件)`;
                }
                else if (data.stockCode === '300335') {
                    reason = `【重点关注】${data.stockName}(${data.stockCode}) - 用户特别关注的潜力股 (满足${satisfiedConditions}/23个买入条件)`;
                }
                else if (mainForceData.industryRank && mainForceData.industryRank < 30) {
                    reason = `【热点题材股】${data.stockName}(${data.stockCode}) - 行业排名靠前，资金关注度高 (满足${satisfiedConditions}/23个买入条件)`;
                }
                if (mainForceData.mainForceType === 'institution') {
                    reason += ' | 机构资金买入';
                }
                else if (mainForceData.mainForceType === 'privateFund') {
                    reason += ' | 私募基金买入';
                }
                if (mainForceData.volumeAmplification > 1.2) {
                    reason += ` | 成交量异常放大(${mainForceData.volumeAmplification.toFixed(2)}倍)`;
                }
                if (mainForceNetFlow > 100000) {
                    reason += ` | 主力资金流入(${(mainForceNetFlow / 100000000).toFixed(2)}亿)`;
                }
                if (limitUpPotentialScore > 0) {
                    const potentialLevel = limitUpPotentialScore > 0.7 ? '高' : limitUpPotentialScore > 0.4 ? '中' : '低';
                    reason += ` | 涨停潜力: ${potentialLevel}(${Math.round(limitUpPotentialScore * 100)}%)`;
                }
                const signal = {
                    id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
                    stockCode: data.stockCode,
                    stockName: data.stockName,
                    type: 'buy',
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
                    targetPrice: currentPrice * 1.15,
                    expectedProfitPercent: 15,
                    buyPriceRange: {
                        lower: buyPriceLower,
                        upper: buyPriceUpper
                    },
                    sellPriceRange: {
                        lower: sellPriceLower,
                        upper: sellPriceUpper
                    },
                    limitUpPotentialScore: Math.round(limitUpPotentialScore * 100),
                    learningModelAccuracy: Math.round(this.learningModel.accuracy * 100),
                    satisfiedConditions,
                    totalConditions: 20,
                    timestamp: Date.now(),
                    isRead: false
                };
                this.signalManager.addSignal(signal);
                return signal;
            }
        }
        return null;
    }
    generateSellSignal(data) {
        const { mainForceData, technicalData, currentPrice } = data;
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
        const macdCrossSignal = macdDiff < macdDea ? 1 : macdDiff > macdDea ? -1 : 0;
        const macdTrendChange = macdDiff > 0 && macdDiff < macdDea * 1.05;
        const kdjK = kdj?.k || 0;
        const kdjD = kdj?.d || 0;
        const kdjJ = kdj?.j || 0;
        const kdjCrossSignal = kdjK < kdjD ? 1 : kdjK > kdjD ? -1 : 0;
        const kdjTrendChange = kdjK > kdjD && kdjK < kdjD * 1.05;
        const volumeMA5 = volume?.ma5 || 0;
        const volumeMA10 = volume?.ma10 || 0;
        const volumeMA20 = volume?.ma20 || 0;
        const volumeRatio = volumeMA10 > 0 ? volumeMA5 / volumeMA10 : 1;
        const volumeRatio20 = volumeMA20 > 0 ? volumeMA5 / volumeMA20 : 1;
        const priceSpeed = ma.ma5 > 0 && ma.ma10 > 0 ? (ma.ma5 - ma.ma10) / ma.ma10 : 0;
        const momentum = ma.ma5 > 0 && ma.ma20 > 0 ? (ma.ma5 - ma.ma20) / ma.ma20 : 0;
        const priceMomentumChange = momentum > 0 && momentum < 0.03;
        const priceAcceleration = ma.ma5 > 0 && ma.ma20 > 0 ? ((ma.ma5 - ma.ma20) / ma.ma20 - momentum) : 0;
        const isPriceDecelerating = priceAcceleration < 0 && momentum > 0;
        const isHoldingStock = data.currentPrice > 0 && ma.ma5 > 0 && data.currentPrice > ma.ma5 * 0.95;
        // 优化的卖出条件，更加严格和准确
        const sellConditions = [
            // 主力资金流出条件（优化：提高阈值）
            mainForceNetFlow < -50000,
            mainForceNetFlow < -100000,
            mainForceNetFlow < -200000,
            mainForceNetFlow < -500000,
            mainForceNetFlow < -1000000,
            mainForceRatio > 0.2,
            mainForceRatio > 0.3,
            mainForceRatio > 0.5,
            mainForceData.flowStrength === 'decreasing' || mainForceData.trend === 'decreasing',
            mainForceData.continuousFlowPeriods > 1 && mainForceNetFlow < -50000,
            mainForceData.continuousFlowPeriods > 2 && mainForceNetFlow < -100000,
            // 技术指标超买条件（优化：提高阈值）
            rsi > 70,
            rsi > 75,
            rsi > 80,
            rsi > 85,
            rsi > 88,
            rsi > 90,
            // MACD指标条件（优化：增加更多精确条件）
            macdTrendChange,
            macdDiff > 0 && macdDiff < macdDea * 1.1,
            macdCrossSignal === 1,
            macdDiff > 0 && macdDea > 0 && macdDiff < macdDea * 0.95,
            // KDJ指标条件（优化：提高阈值）
            kdjTrendChange,
            kdjK > 75,
            kdjK > 80,
            kdjK > 85,
            kdjK > 90,
            kdjCrossSignal === 1,
            kdjJ > 85,
            kdjJ > 90,
            kdjJ > 95,
            kdjJ > 98,
            // 均线破位条件（优化：增加更多精确条件）
            currentPrice < ma.ma5,
            currentPrice < ma.ma5 * 0.995,
            currentPrice < ma.ma5 * 0.99,
            currentPrice < ma.ma5 * 0.98,
            currentPrice < ma.ma10,
            currentPrice < ma.ma10 * 0.99,
            currentPrice < ma.ma20,
            currentPrice < ma.ma20 * 0.99,
            currentPrice < ma.ma30,
            ma.ma5 < ma.ma10 && ma.ma10 < ma.ma20, // 均线空头排列
            // 布林带条件（优化：增加更多精确条件）
            currentPrice > boll.upper * 0.95 && currentPrice < boll.upper,
            currentPrice === boll.upper,
            currentPrice > boll.middle && priceToBollMiddle > 0.025,
            currentPrice === boll.middle,
            currentPrice < boll.middle,
            currentPrice < boll.lower * 1.05 && currentPrice > boll.lower,
            currentPrice < boll.lower * 1.02 && currentPrice > boll.lower,
            // 成交量异常条件（优化：增加更多精确条件）
            volumeRatio > 1.5 && mainForceNetFlow < 0,
            volumeRatio > 2 && mainForceNetFlow < 0,
            volumeRatio > 2.5 && mainForceNetFlow < 0,
            volumeRatio > 3 && mainForceNetFlow < 0,
            volumeRatio < 0.6 && currentPrice < ma.ma5,
            volumeRatio < 0.5 && currentPrice < ma.ma10,
            volumeRatio20 > 1.8 && mainForceNetFlow < 0,
            volumeRatio20 > 2.2 && mainForceNetFlow < 0,
            // 其他技术指标条件（优化：增加更多精确条件）
            sar > currentPrice * 1.01,
            sar > currentPrice,
            cci > 120,
            cci > 150,
            cci > 200,
            cci > 250,
            adx > 25 && currentPrice < ma.ma5,
            adx > 30 && currentPrice < ma.ma10,
            adx > 35 && currentPrice < ma.ma20,
            williamsR > -30,
            williamsR > -25,
            williamsR > -20,
            williamsR > -15,
            williamsR > -10,
            bias > 6,
            bias > 8,
            bias > 10,
            bias > 12,
            bias > 15,
            // 价格动量条件（优化：增加更多精确条件）
            priceSpeed > 0.02 && currentPrice > ma.ma5 * 1.08,
            priceSpeed > 0.025 && currentPrice > ma.ma5 * 1.1,
            momentum > 0.05 && rsi > 70,
            momentum > 0.06 && rsi > 75,
            isPriceDecelerating && rsi > 75,
            priceMomentumChange && currentPrice > ma.ma5 * 1.08,
            // 涨幅和技术指标结合条件（优化：增加更多精确条件）
            data.changePercent > 5 && rsi > 75,
            data.changePercent > 6 && rsi > 78,
            data.changePercent > 7 && rsi > 80,
            data.changePercent > 8 && rsi > 82,
            data.changePercent > 8 && rsi > 85,
            data.changePercent > 9 && rsi > 88,
            data.changePercent > 9 && rsi > 90,
            data.changePercent > 10 && volumeRatio > 1.5,
            data.changePercent > 10 && volumeRatio > 2,
            data.changePercent > 10 && volumeRatio > 2.5,
            data.changePercent > 10 && volumeRatio > 3,
            data.changePercent > 10 && mainForceNetFlow < 0,
            data.changePercent > 10 && mainForceNetFlow < -50000,
            // 持仓股特殊条件（优化：增加更多精确条件）
            isHoldingStock && rsi > 75,
            isHoldingStock && rsi > 80,
            isHoldingStock && rsi > 85,
            isHoldingStock && currentPrice > ma.ma5 * 1.08,
            isHoldingStock && currentPrice > ma.ma5 * 1.12,
            isHoldingStock && currentPrice > ma.ma5 * 1.15,
            isHoldingStock && currentPrice > ma.ma10 * 1.15,
            isHoldingStock && currentPrice > ma.ma10 * 1.2,
            isHoldingStock && mainForceNetFlow < 0,
            isHoldingStock && mainForceNetFlow < -50000,
            isHoldingStock && mainForceNetFlow < -100000,
            isHoldingStock && macdCrossSignal === 1,
            isHoldingStock && kdjCrossSignal === 1,
            isHoldingStock && currentPrice > ma.ma5 * 1.08 && rsi > 75,
            isHoldingStock && currentPrice > ma.ma5 * 1.12 && rsi > 80,
            isHoldingStock && currentPrice > ma.ma5 * 1.15 && rsi > 85,
            // 主力资金和价格结合条件（优化：增加更多精确条件）
            mainForceNetFlow > 500000 && currentPrice > ma.ma5 * 1.08,
            mainForceNetFlow > 1000000 && currentPrice > ma.ma5 * 1.1,
            mainForceNetFlow > 1500000 && currentPrice > ma.ma5 * 1.12,
            mainForceNetFlow > 2000000 && currentPrice > ma.ma5 * 1.15,
            // 综合条件（优化：增加更多精确条件）
            data.changePercent > 6 && volumeRatio > 2 && rsi > 80,
            data.changePercent > 7 && volumeRatio > 2.5 && rsi > 85,
            data.changePercent > 8 && volumeRatio > 3 && rsi > 90,
            data.currentPrice > ma.ma5 * 1.1 && rsi > 75,
            data.currentPrice > ma.ma5 * 1.15 && rsi > 80,
            data.currentPrice > ma.ma5 * 1.2 && rsi > 85,
            data.currentPrice > ma.ma10 * 1.15 && mainForceNetFlow < 0,
            data.currentPrice > ma.ma10 * 1.2 && mainForceNetFlow < -50000,
            data.changePercent > 5 && mainForceNetFlow < -50000,
            data.changePercent > 6 && mainForceNetFlow < -100000,
            data.changePercent > 7 && mainForceNetFlow < -200000,
            currentPrice > ma.ma5 * 1.05 && macdCrossSignal === 1,
            currentPrice > ma.ma5 * 1.08 && macdTrendChange,
            currentPrice > ma.ma5 * 1.05 && kdjCrossSignal === 1,
            currentPrice > ma.ma5 * 1.08 && kdjTrendChange,
        ];
        const satisfiedConditions = sellConditions.filter(Boolean).length;
        if (satisfiedConditions >= 3) { // 优化：提高满足条件数量要求
            let confidence = Math.min(100, satisfiedConditions * 8);
            // 主力资金流出置信度加成（优化：提高加成）
            if (mainForceNetFlow < -50000)
                confidence += 8;
            if (mainForceNetFlow < -100000)
                confidence += 15;
            if (mainForceNetFlow < -200000)
                confidence += 25;
            if (mainForceNetFlow < -500000)
                confidence += 40;
            if (mainForceNetFlow < -1000000)
                confidence += 60;
            // RSI超买置信度加成（优化：提高加成）
            if (rsi > 70)
                confidence += 5;
            if (rsi > 75)
                confidence += 12;
            if (rsi > 80)
                confidence += 25;
            if (rsi > 85)
                confidence += 40;
            if (rsi > 88)
                confidence += 55;
            if (rsi > 90)
                confidence += 70;
            // MACD/KDJ死叉置信度加成（优化：提高加成）
            if (macdTrendChange)
                confidence += 20;
            if (macdCrossSignal === 1)
                confidence += 35;
            if (kdjTrendChange)
                confidence += 20;
            if (kdjCrossSignal === 1)
                confidence += 35;
            // 均线破位置信度加成（优化：提高加成）
            if (currentPrice < ma.ma5)
                confidence += 30;
            if (currentPrice < ma.ma10)
                confidence += 45;
            if (currentPrice < ma.ma20)
                confidence += 60;
            if (currentPrice < ma.ma30)
                confidence += 75;
            if (ma.ma5 < ma.ma10 && ma.ma10 < ma.ma20)
                confidence += 50;
            // 涨幅和技术指标结合置信度加成（优化：提高加成）
            if (data.changePercent > 5 && rsi > 75)
                confidence += 30;
            if (data.changePercent > 7 && rsi > 80)
                confidence += 45;
            if (data.changePercent > 8 && rsi > 85)
                confidence += 60;
            if (data.changePercent > 9 && rsi > 90)
                confidence += 75;
            if (data.changePercent > 10 && volumeRatio > 2)
                confidence += 65;
            if (data.changePercent > 10 && volumeRatio > 3)
                confidence += 80;
            // 持仓股特殊置信度加成（优化：提高加成）
            if (isHoldingStock) {
                confidence += 15;
                if (isHoldingStock && rsi > 75)
                    confidence += 25;
                if (isHoldingStock && rsi > 80)
                    confidence += 40;
                if (isHoldingStock && rsi > 85)
                    confidence += 55;
                if (isHoldingStock && currentPrice > ma.ma5 * 1.08)
                    confidence += 30;
                if (isHoldingStock && currentPrice > ma.ma5 * 1.12)
                    confidence += 45;
                if (isHoldingStock && mainForceNetFlow < 0)
                    confidence += 40;
            }
            // 放量资金流出置信度加成（优化：提高加成）
            if (volumeRatio > 1.5 && mainForceNetFlow < 0)
                confidence += 35;
            if (volumeRatio > 2 && mainForceNetFlow < 0)
                confidence += 50;
            if (volumeRatio > 2.5 && mainForceNetFlow < 0)
                confidence += 65;
            if (volumeRatio > 3 && mainForceNetFlow < 0)
                confidence += 80;
            // 价格动量变化置信度加成（优化：提高加成）
            if (isPriceDecelerating && rsi > 75)
                confidence += 35;
            if (priceMomentumChange && currentPrice > ma.ma5 * 1.08)
                confidence += 40;
            confidence = Math.min(100, confidence);
            let reason = '';
            // 优化的卖出信号描述（更加精确和详细）
            if (mainForceNetFlow < -1000000) {
                reason = `【主力资金疯狂流出】${data.stockName}(${data.stockCode}) - 主力资金净流出${(Math.abs(mainForceNetFlow) / 100000000).toFixed(2)}亿元，占比${(mainForceRatio * 100).toFixed(1)}%，强烈卖出信号`;
            }
            else if (mainForceNetFlow < -500000) {
                reason = `【主力资金大幅流出】${data.stockName}(${data.stockCode}) - 主力资金净流出${(Math.abs(mainForceNetFlow) / 100000000).toFixed(2)}亿元，占比${(mainForceRatio * 100).toFixed(1)}%`;
            }
            else if (mainForceNetFlow < -200000) {
                reason = `【主力资金明显流出】${data.stockName}(${data.stockCode}) - 主力资金净流出${(Math.abs(mainForceNetFlow) / 10000).toFixed(0)}万元，短期走势转弱`;
            }
            else if (mainForceNetFlow < -100000) {
                reason = `【主力资金开始流出】${data.stockName}(${data.stockCode}) - 主力资金净流出${(Math.abs(mainForceNetFlow) / 10000).toFixed(0)}万元，提前预警`;
            }
            else if (mainForceNetFlow < -50000) {
                reason = `【主力资金小幅流出】${data.stockName}(${data.stockCode}) - 主力资金净流出${(Math.abs(mainForceNetFlow) / 10000).toFixed(0)}万元，注意风险`;
            }
            else if (rsi > 90) {
                reason = `【技术指标极端超买】${data.stockName}(${data.stockCode}) - RSI(${rsi.toFixed(1)})极端超买，必然回调`;
            }
            else if (rsi > 85) {
                reason = `【技术指标严重超买】${data.stockName}(${data.stockCode}) - RSI(${rsi.toFixed(1)})严重超买，存在强烈回调风险`;
            }
            else if (rsi > 80) {
                reason = `【技术指标明显超买】${data.stockName}(${data.stockCode}) - RSI(${rsi.toFixed(1)})超买，可能回调`;
            }
            else if (rsi > 75) {
                reason = `【技术指标超买预警】${data.stockName}(${data.stockCode}) - RSI(${rsi.toFixed(1)})进入超买区域，注意风险`;
            }
            else if (macdCrossSignal === 1) {
                reason = `【MACD死叉预警】${data.stockName}(${data.stockCode}) - MACD形成死叉，趋势即将反转`;
            }
            else if (macdTrendChange) {
                reason = `【MACD趋势变化】${data.stockName}(${data.stockCode}) - MACD即将死叉，提前预警`;
            }
            else if (kdjCrossSignal === 1) {
                reason = `【KDJ死叉预警】${data.stockName}(${data.stockCode}) - KDJ形成死叉，短期走势转弱`;
            }
            else if (kdjTrendChange) {
                reason = `【KDJ趋势变化】${data.stockName}(${data.stockCode}) - KDJ即将死叉，提前预警`;
            }
            else if (currentPrice < ma.ma5) {
                reason = `【均线破位预警】${data.stockName}(${data.stockCode}) - 价格跌破MA5均线，趋势转弱`;
            }
            else if (currentPrice < ma.ma10) {
                reason = `【均线破位信号】${data.stockName}(${data.stockCode}) - 价格跌破MA10均线，中期趋势反转`;
            }
            else if (currentPrice < ma.ma20) {
                reason = `【均线破位确认】${data.stockName}(${data.stockCode}) - 价格跌破MA20均线，长期趋势反转`;
            }
            else if (ma.ma5 < ma.ma10 && ma.ma10 < ma.ma20) {
                reason = `【均线空头排列】${data.stockName}(${data.stockCode}) - 均线形成空头排列，强烈卖出信号`;
            }
            else if (currentPrice > boll.upper) {
                reason = `【布林带上轨突破】${data.stockName}(${data.stockCode}) - 价格突破布林带上轨，可能回调`;
            }
            else if (currentPrice < boll.middle) {
                reason = `【布林带中轨跌破】${data.stockName}(${data.stockCode}) - 价格跌破布林带中轨，走势转弱`;
            }
            else if (data.changePercent > 8 && rsi > 80) {
                reason = `【T+0交易机会】${data.stockName}(${data.stockCode}) - 涨幅${data.changePercent.toFixed(1)}%，RSI(${rsi.toFixed(1)})超买，适合T+0卖出`;
            }
            else if (data.changePercent > 10 && volumeRatio > 2) {
                reason = `【T+0强烈卖出】${data.stockName}(${data.stockCode}) - 涨停板打开，成交量异常放大(${volumeRatio.toFixed(2)}倍)`;
            }
            else if (isHoldingStock && rsi > 75) {
                reason = `【持仓股超买预警】${data.stockName}(${data.stockCode}) - 持仓股票RSI(${rsi.toFixed(1)})超买，建议止盈`;
            }
            else if (isHoldingStock && mainForceNetFlow < 0) {
                reason = `【持仓股资金流出】${data.stockName}(${data.stockCode}) - 持仓股票主力资金流出，建议减仓`;
            }
            else if (isPriceDecelerating && rsi > 75) {
                reason = `【价格上涨减速】${data.stockName}(${data.stockCode}) - 价格上涨动能减弱，可能反转`;
            }
            else if (priceMomentumChange && currentPrice > ma.ma5 * 1.08) {
                reason = `【价格动量变化】${data.stockName}(${data.stockCode}) - 价格动量下降，提前预警`;
            }
            else if (volumeRatio > 2 && mainForceNetFlow < 0) {
                reason = `【放量资金流出】${data.stockName}(${data.stockCode}) - 成交量放大(${volumeRatio.toFixed(2)}倍)但主力资金流出`;
            }
            else if (data.changePercent > 6 && volumeRatio > 2 && rsi > 80) {
                reason = `【综合卖出信号】${data.stockName}(${data.stockCode}) - 涨幅${data.changePercent.toFixed(1)}%，成交量放大(${volumeRatio.toFixed(2)}倍)，RSI(${rsi.toFixed(1)})超买`;
            }
            else {
                reason = `【卖出信号】${data.stockName}(${data.stockCode}) - 满足${satisfiedConditions}/150个卖出条件`;
            }
            if (isHoldingStock) {
                reason += ' | 持仓股票特殊预警';
            }
            if (data.changePercent > 5) {
                reason += ` | 当前涨幅${data.changePercent.toFixed(1)}%`;
            }
            if (mainForceNetFlow < 0) {
                reason += ` | 主力资金净流出${(Math.abs(mainForceNetFlow) / 10000).toFixed(0)}万元`;
            }
            const sellPriceLower = currentPrice * 0.97;
            const sellPriceUpper = currentPrice * 0.995;
            const stopLossPrice = currentPrice * 0.95;
            const signal = {
                id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
                stockCode: data.stockCode,
                stockName: data.stockName,
                type: 'sell',
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
                targetPrice: currentPrice * 0.97,
                expectedProfitPercent: -3,
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
            return signal;
        }
        return null;
    }
    isMonitoring() {
        return this.scanTimer !== null;
    }
}
let marketMonitorInstance = null;
export const getMarketMonitor = (config) => {
    if (!marketMonitorInstance) {
        marketMonitorInstance = new MarketMonitorManager(config);
    }
    return marketMonitorInstance;
};
export const startMarketMonitoring = (config) => {
    const monitor = getMarketMonitor(config);
    monitor.startMonitoring();
};
export const stopMarketMonitoring = () => {
    const monitor = getMarketMonitor();
    monitor.stopMonitoring();
};
export const scanMarketNow = async () => {
    const monitor = getMarketMonitor();
    await monitor.performScan();
};
export default MarketMonitorManager;
