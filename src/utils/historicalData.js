import { Logger } from './stockData.ts';
import { getStockDataSource } from './stockData.ts';
const logger = Logger.getInstance();
// 默认配置
const DEFAULT_CONFIG = {
    dataSource: 'eastmoney',
    timeRange: 'day',
    limit: 100,
    autoUpdate: true,
    updateInterval: 3600000 // 1小时
};
export class HistoricalDataManager {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dataCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "updateTimers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    // 获取股票历史数据
    async getHistoricalData(stockCode) {
        try {
            // 检查缓存
            const cachedData = this.dataCache.get(stockCode);
            if (cachedData) {
                return cachedData;
            }
            // 从数据源获取数据
            const data = await this.fetchHistoricalData(stockCode);
            // 如果获取的数据为空，抛出错误
            if (data.length === 0) {
                throw new Error(`股票${stockCode}历史数据获取失败`);
            }
            // 缓存数据
            this.dataCache.set(stockCode, data);
            // 设置自动更新
            if (this.config.autoUpdate) {
                this.setupAutoUpdate(stockCode);
            }
            return data;
        }
        catch (error) {
            logger.error(`获取股票${stockCode}历史数据失败:`, error);
            throw error;
        }
    }
    // 使用现有的K线数据获取功能
    async fetchHistoricalData(stockCode) {
        try {
            // 处理股票代码格式，去掉sh/sz前缀
            let cleanCode = stockCode;
            if (stockCode.startsWith('sh')) {
                cleanCode = stockCode.substring(2);
            }
            else if (stockCode.startsWith('sz')) {
                cleanCode = stockCode.substring(2);
            }
            logger.info(`使用K线数据获取股票${stockCode}历史数据...`);
            // 使用现有的stockDataSource获取K线数据
            const stockDataSource = getStockDataSource();
            const klineData = await stockDataSource.getKLineData(cleanCode, this.config.timeRange, this.config.limit);
            if (klineData && klineData.length > 0) {
                logger.info(`成功获取股票${stockCode}历史数据，共${klineData.length}条`);
                return klineData;
            }
            else {
                logger.error(`获取股票${stockCode}历史数据失败: 返回数据为空`);
                throw new Error(`股票${stockCode}历史数据获取失败`);
            }
        }
        catch (error) {
            logger.error(`获取历史数据失败:`, error);
            throw new Error(`股票${stockCode}历史数据获取失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    // 获取时间间隔
    getTimeInterval() {
        switch (this.config.timeRange) {
            case 'day': return 101; // 日线
            case 'week': return 102; // 周线
            case 'month': return 103; // 月线
            default: return 101;
        }
    }
    // 设置自动更新
    setupAutoUpdate(stockCode) {
        if (this.updateTimers.has(stockCode)) {
            clearTimeout(this.updateTimers.get(stockCode));
        }
        const timer = setTimeout(async () => {
            try {
                const newData = await this.fetchHistoricalData(stockCode);
                this.dataCache.set(stockCode, newData);
                logger.info(`自动更新股票${stockCode}历史数据成功`);
            }
            catch (error) {
                logger.error(`自动更新股票${stockCode}历史数据失败:`, error);
            }
            finally {
                // 继续设置下一次更新
                this.setupAutoUpdate(stockCode);
            }
        }, this.config.updateInterval);
        this.updateTimers.set(stockCode, timer);
    }
    // 手动更新数据
    async updateData(stockCode) {
        const data = await this.fetchHistoricalData(stockCode);
        this.dataCache.set(stockCode, data);
        return data;
    }
    // 批量获取历史数据
    async getBatchHistoricalData(stockCodes) {
        const results = new Map();
        const promises = stockCodes.map(async (code) => {
            try {
                const data = await this.getHistoricalData(code);
                results.set(code, data);
            }
            catch (error) {
                logger.error(`获取股票${code}历史数据失败:`, error);
                results.set(code, []);
            }
        });
        await Promise.all(promises);
        return results;
    }
    // 清理缓存
    clearCache(stockCode) {
        if (stockCode) {
            this.dataCache.delete(stockCode);
            if (this.updateTimers.has(stockCode)) {
                clearTimeout(this.updateTimers.get(stockCode));
                this.updateTimers.delete(stockCode);
            }
        }
        else {
            this.dataCache.clear();
            this.updateTimers.forEach(timer => clearTimeout(timer));
            this.updateTimers.clear();
        }
    }
    // 获取缓存状态
    getCacheStatus() {
        let totalDataPoints = 0;
        this.dataCache.forEach(data => {
            totalDataPoints += data.length;
        });
        return {
            cachedStocks: this.dataCache.size,
            totalDataPoints
        };
    }
}
// 全局实例
let historicalDataManagerInstance = null;
export function getHistoricalDataManager(config) {
    if (!historicalDataManagerInstance) {
        historicalDataManagerInstance = new HistoricalDataManager(config);
    }
    return historicalDataManagerInstance;
}
