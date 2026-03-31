import { getStockDataSource } from './stockData';
import { getOptimizedSignalManager } from './optimizedSignalManager';
class MarketMonitor {
    constructor(config = {}) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stockDataSource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "signalManager", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "scanQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "activeScans", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "scanTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "marketStatus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = {
            enabled: true,
            scanInterval: 3000, // 优化扫描间隔为3秒
            batchSize: 50, // 减小批次大小以提高实时性
            maxConcurrent: 10, // 增加并发处理能力
            priorityStocks: [],
            stockList: [],
            lastScanTime: null,
            isScanning: false,
            scanHistory: [],
            ...config
        };
        this.stockDataSource = getStockDataSource();
        this.signalManager = getOptimizedSignalManager();
        this.scanQueue = [];
        this.activeScans = new Set();
        this.scanTimer = null;
        this.listeners = [];
        this.marketStatus = 'closed';
    }
    // 初始化A股股票列表
    async initializeStockList() {
        try {
            // console.log('开始初始化A股股票列表...');
            const stockList = await this.stockDataSource.getStockList();
            if (stockList && stockList.length > 0) {
                this.config.stockList = stockList;
                // console.log(`成功获取${stockList.length}只A股股票`);
                this.notifyListeners({
                    type: 'stockListInitialized',
                    data: {
                        count: stockList.length,
                        stocks: stockList.slice(0, 10)
                    }
                });
            }
            else {
                console.warn('获取A股股票列表失败');
                this.config.stockList = [];
            }
        }
        catch (error) {
            console.error('初始化A股股票列表失败:', error);
            this.config.stockList = [];
        }
    }
    // 生成模拟股票列表方法已删除
    // 检查市场状态
    checkMarketStatus() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        if ((hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute <= 30) ||
            (hour === 13) || (hour === 14) || (hour === 15 && minute === 0)) {
            this.marketStatus = 'open';
        }
        else if (hour === 9 && minute >= 15 && minute <= 25) {
            this.marketStatus = 'auction';
        }
        else {
            this.marketStatus = 'closed';
        }
        return this.marketStatus;
    }
    // 开始全市场监控
    startMonitoring() {
        if (!this.config.enabled) {
            // console.warn('市场监控已禁用');
            return;
        }
        // console.log('启动全A股市场监控...');
        this.initializeStockList();
        this.startScanTimer();
        this.notifyListeners({
            type: 'monitoringStarted',
            data: {
                timestamp: new Date(),
                marketStatus: this.checkMarketStatus()
            }
        });
    }
    // 停止市场监控
    stopMonitoring() {
        // console.log('停止全A股市场监控...');
        if (this.scanTimer) {
            clearInterval(this.scanTimer);
            this.scanTimer = null;
        }
        this.scanQueue.length = 0;
        this.activeScans.clear();
        this.notifyListeners({
            type: 'monitoringStopped',
            data: {
                timestamp: new Date()
            }
        });
    }
    // 启动扫描定时器
    startScanTimer() {
        if (this.scanTimer) {
            clearInterval(this.scanTimer);
        }
        this.scanTimer = setInterval(() => {
            this.performScan();
        }, this.config.scanInterval);
        // console.log(`市场扫描定时器已启动，扫描间隔：${this.config.scanInterval}ms`);
    }
    // 执行市场扫描
    async performScan() {
        if ((this.config.isScanning || false)) {
            return;
        }
        // 如果股票列表为空，尝试初始化
        if ((this.config.stockList?.length || 0) === 0) {
            await this.initializeStockList();
            if ((this.config.stockList?.length || 0) === 0) {
                return;
            }
        }
        const marketStatus = this.checkMarketStatus();
        if (marketStatus === 'closed') {
            return;
        }
        try {
            this.config.isScanning = true;
            this.config.lastScanTime = new Date();
            // console.log(`开始市场扫描，市场状态：${marketStatus}`);
            this.buildScanQueue();
            await this.processScanQueue();
            if (!this.config.scanHistory) {
                this.config.scanHistory = [];
            }
            this.config.scanHistory.unshift({
                timestamp: new Date(),
                marketStatus,
                processed: this.activeScans.size,
                queueLength: this.scanQueue.length
            });
            if (this.config.scanHistory.length > 100) {
                this.config.scanHistory = this.config.scanHistory.slice(0, 100);
            }
            // console.log(`市场扫描完成，处理了${this.activeScans.size}只股票`);
            this.notifyListeners({
                type: 'scanCompleted',
                data: {
                    timestamp: new Date(),
                    marketStatus,
                    processed: this.activeScans.size,
                    queueLength: this.scanQueue.length
                }
            });
        }
        catch (error) {
            console.error('市场扫描失败:', error);
            this.notifyListeners({
                type: 'scanFailed',
                data: {
                    error: error instanceof Error ? error.message : String(error)
                }
            });
        }
        finally {
            this.config.isScanning = false;
            this.activeScans.clear();
        }
    }
    // 构建扫描队列
    buildScanQueue() {
        this.scanQueue.length = 0;
        if (!this.config.stockList || this.config.stockList.length === 0) {
            return;
        }
        const priorityStocks = (this.config.priorityStocks || []).map(code => this.config.stockList.find(stock => stock.code === code)).filter((stock) => stock !== undefined);
        const remainingStocks = this.config.stockList.filter(stock => !(this.config.priorityStocks || []).includes(stock.code));
        for (let i = remainingStocks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingStocks[i], remainingStocks[j]] = [remainingStocks[j], remainingStocks[i]];
        }
        this.scanQueue = [...priorityStocks, ...remainingStocks];
    }
    // 处理扫描队列
    async processScanQueue() {
        const batches = [];
        for (let i = 0; i < this.scanQueue.length; i += this.config.batchSize) {
            const batch = this.scanQueue.slice(i, i + this.config.batchSize);
            batches.push(batch);
        }
        for (const batch of batches) {
            await this.processBatch(batch);
        }
    }
    // 处理股票批次
    async processBatch(stocks) {
        if (stocks.length === 0)
            return;
        const codes = stocks.map(stock => stock.code);
        try {
            const quotes = await this.stockDataSource.getRealtimeQuote(codes);
            if (!quotes || quotes.length === 0) {
                // console.warn(`获取批次股票行情失败，代码：${codes.join(', ')}`);
                return;
            }
            for (const quote of quotes) {
                if (this.activeScans.size >= (this.config.maxConcurrent || 5)) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                this.activeScans.add(quote.code);
                await this.processSingleStock(quote);
                this.activeScans.delete(quote.code);
            }
        }
        catch (error) {
            console.error('处理股票批次失败:', error);
        }
    }
    // 处理单只股票
    async processSingleStock(stockData) {
        try {
            // 获取真实的主力资金数据
            const mainForceData = await this.stockDataSource.getMainForceData([stockData.code]);
            let analysisData;
            if (mainForceData && mainForceData.length > 0) {
                // 使用真实的主力资金数据
                const forceData = mainForceData[0];
                analysisData = {
                    stockCode: stockData.code,
                    stockName: stockData.name,
                    currentPrice: stockData.price,
                    change: stockData.change,
                    changePercent: stockData.changePercent,
                    volume: stockData.volume,
                    amount: stockData.amount,
                    timestamp: Date.now(),
                    mainForceNetFlow: forceData.mainForceNetFlow,
                    totalNetFlow: forceData.totalNetFlow,
                    volumeAmplification: forceData.volumeAmplification || 1,
                    turnoverRate: forceData.turnoverRate || 0,
                    superLargeOrder: {
                        netFlow: forceData.superLargeOrder?.netFlow || 0
                    },
                    largeOrder: {
                        netFlow: forceData.largeOrder?.netFlow || 0
                    },
                    mediumOrder: {
                        netFlow: forceData.mediumOrder?.netFlow || 0
                    },
                    smallOrder: {
                        netFlow: forceData.smallOrder?.netFlow || 0
                    }
                };
            }
            else {
                // 没有获取到主力资金数据，不使用模拟数据
                console.warn(`未获取到${stockData.code}的主力资金数据`);
                return;
            }
            await this.signalManager.processMainForceData(analysisData);
        }
        catch (error) {
            console.error(`处理股票${stockData.code}失败:`, error);
        }
    }
    // 模拟数据生成方法已删除
    // 获取监控状态
    getStatus() {
        return {
            enabled: this.config.enabled || false,
            marketStatus: this.checkMarketStatus(),
            stockCount: this.config.stockList?.length || 0,
            lastScanTime: this.config.lastScanTime || null,
            isScanning: this.config.isScanning || false,
            activeScans: this.activeScans.size,
            scanHistory: (this.config.scanHistory || []).slice(0, 10),
            priorityStocks: this.config.priorityStocks || []
        };
    }
    // 添加优先监控的股票
    addPriorityStock(code) {
        if (!this.config.priorityStocks) {
            this.config.priorityStocks = [];
        }
        if (!this.config.priorityStocks.includes(code)) {
            this.config.priorityStocks.push(code);
            console.log(`添加优先监控股票：${code}`);
        }
    }
    // 移除优先监控的股票
    removePriorityStock(code) {
        if (this.config.priorityStocks) {
            this.config.priorityStocks = this.config.priorityStocks.filter(c => c !== code);
            console.log(`移除优先监控股票：${code}`);
        }
    }
    // 添加监听器
    addListener(listener) {
        this.listeners.push(listener);
    }
    // 移除监听器
    removeListener(listener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }
    // 通知监听器
    notifyListeners(event) {
        this.listeners.forEach(listener => {
            try {
                listener(event);
            }
            catch (error) {
                console.error('通知监听器失败:', error);
            }
        });
    }
}
let marketMonitor = null;
export const getMarketMonitor = (config) => {
    if (!marketMonitor) {
        marketMonitor = new MarketMonitor(config);
    }
    return marketMonitor;
};
export const startMarketMonitoring = () => {
    getMarketMonitor().startMonitoring();
};
export const stopMarketMonitoring = () => {
    getMarketMonitor().stopMonitoring();
};
export const getMarketStatus = () => {
    return getMarketMonitor().getStatus();
};
export const addPriorityStock = (code) => {
    getMarketMonitor().addPriorityStock(code);
};
export const removePriorityStock = (code) => {
    getMarketMonitor().removePriorityStock(code);
};
