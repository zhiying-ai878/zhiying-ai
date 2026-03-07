// 数据缓存模块
class DataCache {
    constructor() {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "defaultExpiry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5 * 60 * 1000
        }); // 默认5分钟过期
        Object.defineProperty(this, "maxSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1000
        }); // 最大缓存项数
        Object.defineProperty(this, "maxMemoryBytes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 50 * 1024 * 1024
        }); // 最大内存使用量 (50MB)
        Object.defineProperty(this, "currentMemoryUsage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    // 计算数据大小（粗略估计）
    calculateSize(data) {
        if (data === null || data === undefined)
            return 0;
        if (typeof data === 'string')
            return data.length * 2;
        if (typeof data === 'number')
            return 8;
        if (typeof data === 'boolean')
            return 1;
        if (Array.isArray(data)) {
            return data.reduce((acc, item) => acc + this.calculateSize(item), 0);
        }
        if (typeof data === 'object') {
            return Object.values(data).reduce((acc, value) => acc + this.calculateSize(value), 0);
        }
        return 0;
    }
    // 清理过期缓存
    cleanupExpired() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.expiry) {
                this.currentMemoryUsage -= this.calculateSize(item.data);
                this.cache.delete(key);
            }
        }
    }
    // LRU清理
    cleanupLRU() {
        if (this.cache.size <= this.maxSize && this.currentMemoryUsage <= this.maxMemoryBytes) {
            return;
        }
        // 按最后访问时间排序
        const items = Array.from(this.cache.entries())
            .sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        // 清理直到达到限制
        while (this.cache.size > this.maxSize || this.currentMemoryUsage > this.maxMemoryBytes) {
            if (items.length === 0)
                break;
            const [key, item] = items.shift();
            this.currentMemoryUsage -= this.calculateSize(item.data);
            this.cache.delete(key);
        }
    }
    // 设置缓存
    set(key, data, expiry = this.defaultExpiry) {
        // 清理过期缓存
        this.cleanupExpired();
        // 计算新数据大小
        const dataSize = this.calculateSize(data);
        // 如果已存在，先减去旧数据大小
        if (this.cache.has(key)) {
            const oldItem = this.cache.get(key);
            this.currentMemoryUsage -= this.calculateSize(oldItem.data);
        }
        // 设置新缓存
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiry,
            lastAccessed: Date.now()
        });
        // 更新内存使用
        this.currentMemoryUsage += dataSize;
        // 执行LRU清理
        this.cleanupLRU();
    }
    // 获取缓存
    get(key) {
        const item = this.cache.get(key);
        if (!item) {
            return null;
        }
        // 检查是否过期
        if (Date.now() - item.timestamp > item.expiry) {
            this.currentMemoryUsage -= this.calculateSize(item.data);
            this.cache.delete(key);
            return null;
        }
        // 更新最后访问时间
        item.lastAccessed = Date.now();
        this.cache.set(key, item);
        return item.data;
    }
    // 删除缓存
    delete(key) {
        const item = this.cache.get(key);
        if (item) {
            this.currentMemoryUsage -= this.calculateSize(item.data);
        }
        this.cache.delete(key);
    }
    // 清空缓存
    clear() {
        this.cache.clear();
        this.currentMemoryUsage = 0;
    }
    // 获取缓存大小
    size() {
        return this.cache.size;
    }
    // 获取内存使用量
    getMemoryUsage() {
        return this.currentMemoryUsage;
    }
    // 检查缓存是否存在
    has(key) {
        return this.cache.has(key);
    }
    // 缓存键生成器
    generateKey(prefix, ...params) {
        const paramString = params.map(param => {
            if (typeof param === 'object') {
                return JSON.stringify(param);
            }
            return String(param);
        }).join('_');
        return `${prefix}_${paramString}`;
    }
    // 批量设置缓存
    setBatch(items) {
        items.forEach(item => {
            this.set(item.key, item.data, item.expiry);
        });
    }
    // 批量获取缓存
    getBatch(keys) {
        const result = new Map();
        keys.forEach(key => {
            const data = this.get(key);
            if (data !== null) {
                result.set(key, data);
            }
        });
        return result;
    }
    // 按前缀删除缓存
    deleteByPrefix(prefix) {
        for (const key of this.cache.keys()) {
            if (key.startsWith(prefix)) {
                this.delete(key);
            }
        }
    }
    // 获取缓存统计信息
    getStats() {
        return {
            size: this.cache.size,
            memoryUsage: this.currentMemoryUsage,
            maxMemory: this.maxMemoryBytes,
            maxSize: this.maxSize
        };
    }
}
// 导出单例实例
let dataCacheInstance = null;
export const getDataCache = () => {
    if (!dataCacheInstance) {
        dataCacheInstance = new DataCache();
    }
    return dataCacheInstance;
};
// 缓存键前缀
export const CacheKeys = {
    STOCK_DATA: 'stock_data',
    TECHNICAL_INDICATORS: 'technical_indicators',
    MODEL_PREDICTION: 'model_prediction',
    LLM_RESPONSE: 'llm_response',
    RECOMMENDATIONS: 'recommendations',
    MARKET_DATA: 'market_data'
};
