// 策略自动执行引擎
import { getRealtimeQuote, getKLineData } from './stockData';
import { generateAdvancedTradeSignal, getStopLossTakeProfitManager, loadModel } from './advancedAIAnalysis';
import { calculateMA, calculateMACD, calculateRSI, calculateBollingerBands, calculateKDJ, calculateCCI } from './aiAnalysis';
// 策略执行引擎类
class StrategyExecutionEngine {
    constructor(config = {}) {
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'idle'
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "strategies", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "executionHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "intervalId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "activeTrades", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "sltpManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: getStopLossTakeProfitManager()
        });
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = {
            interval: config.interval || 5000,
            maxConcurrentStrategies: config.maxConcurrentStrategies || 10,
            retryCount: config.retryCount || 3,
            retryDelay: config.retryDelay || 1000,
            enableNotifications: config.enableNotifications || true,
            enableLogging: config.enableLogging || true
        };
        this.model = loadModel();
    }
    // 启动引擎
    start() {
        if (this.status === 'running') {
            this.log('引擎已经在运行中');
            return;
        }
        this.status = 'running';
        this.log('策略执行引擎启动');
        // 开始定期执行策略
        this.intervalId = setInterval(() => {
            this.executeStrategies();
        }, this.config.interval);
    }
    // 停止引擎
    stop() {
        if (this.status !== 'running') {
            this.log('引擎已经停止');
            return;
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.status = 'idle';
        this.log('策略执行引擎停止');
    }
    // 暂停引擎
    pause() {
        if (this.status !== 'running') {
            this.log('引擎未在运行');
            return;
        }
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.status = 'paused';
        this.log('策略执行引擎暂停');
    }
    // 恢复引擎
    resume() {
        if (this.status !== 'paused') {
            this.log('引擎未暂停');
            return;
        }
        this.status = 'running';
        this.log('策略执行引擎恢复');
        // 重新开始定期执行策略
        this.intervalId = setInterval(() => {
            this.executeStrategies();
        }, this.config.interval);
    }
    // 添加策略
    addStrategy(strategy) {
        this.strategies.set(strategy.id, strategy);
        this.log(`添加策略: ${strategy.name} (${strategy.id})`);
    }
    // 移除策略
    removeStrategy(strategyId) {
        this.strategies.delete(strategyId);
        this.log(`移除策略: ${strategyId}`);
    }
    // 获取所有策略
    getStrategies() {
        return Array.from(this.strategies.values());
    }
    // 获取引擎状态
    getStatus() {
        return this.status;
    }
    // 获取执行历史
    getExecutionHistory() {
        return this.executionHistory;
    }
    // 获取活跃交易
    getActiveTrades() {
        return Array.from(this.activeTrades.values());
    }
    // 执行所有策略
    async executeStrategies() {
        if (this.status !== 'running')
            return;
        const strategies = Array.from(this.strategies.values());
        if (strategies.length === 0) {
            this.log('没有策略需要执行');
            return;
        }
        this.log(`开始执行 ${strategies.length} 个策略`);
        // 限制并发执行的策略数量
        const batches = this.chunkArray(strategies, this.config.maxConcurrentStrategies);
        for (const batch of batches) {
            await Promise.all(batch.map(strategy => this.executeStrategy(strategy)));
        }
        this.log('策略执行完成');
    }
    // 执行单个策略
    async executeStrategy(strategy) {
        try {
            // 假设策略关联了特定股票，这里简化处理
            const stockCodes = this.getStockCodesFromStrategy(strategy);
            for (const stockCode of stockCodes) {
                // 获取实时行情数据
                const quotes = await getRealtimeQuote([stockCode]);
                if (!quotes || quotes.length === 0) {
                    this.log(`获取 ${stockCode} 实时数据失败`);
                    continue;
                }
                const quote = quotes[0];
                // 获取K线数据用于技术指标计算
                const kLineData = await getKLineData(stockCode, 'day', 60);
                if (!kLineData || kLineData.length < 20) {
                    this.log(`获取 ${stockCode} K线数据失败`);
                    continue;
                }
                // 计算技术指标
                const prices = kLineData.map(item => item.close);
                const volumes = kLineData.map(item => item.volume);
                const ma5 = calculateMA(prices, 5);
                const ma10 = calculateMA(prices, 10);
                const rsi = calculateRSI(prices, 14);
                const macd = calculateMACD(prices);
                const { upper, middle, lower } = calculateBollingerBands(prices, 20, 2);
                const kdj = calculateKDJ(prices);
                const cci = calculateCCI(prices, 14);
                // 准备分析数据
                const analysisData = {
                    price: prices,
                    volume: volumes,
                    ma5,
                    ma10,
                    rsi,
                    macd,
                    upperBand: upper,
                    lowerBand: lower,
                    kdj,
                    cci,
                    stockCode
                };
                // 生成交易信号
                const signal = generateAdvancedTradeSignal(analysisData, this.model, strategy);
                // 记录执行历史
                const history = {
                    id: Date.now().toString(),
                    strategyId: strategy.id,
                    stockCode,
                    signal,
                    price: quote.price,
                    timestamp: Date.now(),
                    status: 'success'
                };
                this.executionHistory.push(history);
                // 执行交易
                if (signal === 'buy' || signal === 'sell') {
                    await this.executeTrade(stockCode, signal, quote.price, strategy);
                }
                // 检查止损止盈条件
                await this.checkStopLossTakeProfit(stockCode, quote.price);
                this.log(`策略 ${strategy.name} 执行完成，信号: ${signal}，价格: ${quote.price}`);
            }
        }
        catch (error) {
            this.log(`执行策略 ${strategy.name} 失败: ${error.message}`);
            // 记录失败历史
            const history = {
                id: Date.now().toString(),
                strategyId: strategy.id,
                stockCode: 'unknown',
                signal: 'hold',
                price: 0,
                timestamp: Date.now(),
                status: 'failure',
                error: error.message
            };
            this.executionHistory.push(history);
        }
    }
    // 执行交易
    async executeTrade(stockCode, type, price, strategy) {
        // 模拟交易执行
        const tradeRecord = {
            id: Date.now().toString(),
            stockCode,
            type,
            price,
            volume: 100, // 固定交易量
            timestamp: Date.now(),
            status: 'executed',
            strategyId: strategy.id,
            stopLossTakeProfitId: null
        };
        // 如果是买入，生成止损止盈策略
        if (type === 'buy') {
            const sltp = this.sltpManager.generateSmartStopLossTakeProfit(stockCode, price, strategy.riskLevel);
            this.sltpManager.addStrategy(sltp);
            tradeRecord.stopLossTakeProfitId = sltp.id;
        }
        this.activeTrades.set(tradeRecord.id, tradeRecord);
        this.log(`执行交易: ${type} ${stockCode} ${price} x 100`);
        // 发送通知
        if (this.config.enableNotifications) {
            this.sendNotification(`交易执行: ${type === 'buy' ? '买入' : '卖出'} ${stockCode}，价格: ${price}`);
        }
    }
    // 检查止损止盈条件
    async checkStopLossTakeProfit(stockCode, currentPrice) {
        const triggeredTrades = this.sltpManager.checkStopLossTakeProfit(stockCode, currentPrice);
        for (const trade of triggeredTrades) {
            this.activeTrades.set(trade.id, trade);
            this.log(`止损止盈触发: 卖出 ${stockCode} ${currentPrice}`);
            // 发送通知
            if (this.config.enableNotifications) {
                this.sendNotification(`止损止盈触发: 卖出 ${stockCode}，价格: ${currentPrice}`);
            }
        }
    }
    // 从策略中获取股票代码
    getStockCodesFromStrategy(strategy) {
        // 这里简化处理，实际应用中应该从策略配置中获取
        // 或者根据策略规则自动选择股票
        return ['002594', '300750', '600519', '000001', '601318'];
    }
    // 分块数组
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
    // 发送通知
    sendNotification(message) {
        // 实际应用中可以集成推送通知服务
        this.log(`通知: ${message}`);
    }
    // 日志记录
    log(message) {
        if (this.config.enableLogging) {
            console.log(`[策略执行引擎] ${new Date().toLocaleString()} - ${message}`);
        }
    }
}
// 导出策略执行引擎单例
let strategyEngine = null;
export const getStrategyExecutionEngine = (config) => {
    if (!strategyEngine) {
        strategyEngine = new StrategyExecutionEngine(config);
    }
    return strategyEngine;
};
// 导出默认配置
export const defaultStrategyExecutionConfig = {
    interval: 5000,
    maxConcurrentStrategies: 10,
    retryCount: 3,
    retryDelay: 1000,
    enableNotifications: true,
    enableLogging: true
};
// 启动策略执行引擎
export const startStrategyEngine = (config) => {
    const engine = getStrategyExecutionEngine(config);
    engine.start();
    return engine;
};
// 停止策略执行引擎
export const stopStrategyEngine = () => {
    const engine = getStrategyExecutionEngine();
    engine.stop();
};
// 添加策略到引擎
export const addStrategyToEngine = (strategy) => {
    const engine = getStrategyExecutionEngine();
    engine.addStrategy(strategy);
};
// 从引擎移除策略
export const removeStrategyFromEngine = (strategyId) => {
    const engine = getStrategyExecutionEngine();
    engine.removeStrategy(strategyId);
};
// 获取引擎状态
export const getEngineStatus = () => {
    const engine = getStrategyExecutionEngine();
    return engine.getStatus();
};
// 获取执行历史
export const getEngineExecutionHistory = () => {
    const engine = getStrategyExecutionEngine();
    return engine.getExecutionHistory();
};
// 获取活跃交易
export const getEngineActiveTrades = () => {
    const engine = getStrategyExecutionEngine();
    return engine.getActiveTrades();
};
