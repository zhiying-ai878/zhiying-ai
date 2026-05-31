// 性能优化工具模块
// 数据缓存管理器
class DataCache {
    constructor() {
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.cache = new Map();
        // 定期清理过期缓存
        setInterval(() => this.cleanExpired(), 60000); // 每分钟清理一次
    }
    // 设置缓存
    set(key, data, expiry = 300000) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiry
        });
    }
    // 获取缓存
    get(key) {
        const item = this.cache.get(key);
        if (!item)
            return null;
        if (Date.now() - item.timestamp > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        return item.data;
    }
    // 删除缓存
    delete(key) {
        this.cache.delete(key);
    }
    // 清空缓存
    clear() {
        this.cache.clear();
    }
    // 清理过期缓存
    cleanExpired() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.expiry) {
                this.cache.delete(key);
            }
        }
    }
}
// 导出单例实例
export const dataCache = new DataCache();
// 防抖函数
export const debounce = (func, wait) => {
    let timeout = null;
    return (...args) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};
// 节流函数
export const throttle = (func, limit) => {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};
// 虚拟滚动数据处理
export const processVirtualScrollData = (data, pageSize, currentPage) => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return data.slice(start, end);
};
// 批量处理数据
export const batchProcess = (data, processor, batchSize = 100) => {
    const result = [];
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const batchResults = batch.map(processor);
        result.push(...batchResults);
    }
    return result;
};
// 计算密集型任务的Web Worker包装
export const runInWorker = (fn, data) => {
    return new Promise((resolve, reject) => {
        // 创建Worker
        const workerCode = `
      self.onmessage = function(e) {
        const { fn, data } = e.data;
        try {
          const result = eval(fn)(data);
          self.postMessage({ success: true, result });
        } catch (error) {
          self.postMessage({ success: false, error: error.message });
        }
      };
    `;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);
        worker.onmessage = (e) => {
            const { success, result, error } = e.data;
            if (success) {
                resolve(result);
            }
            else {
                reject(new Error(error));
            }
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        };
        worker.onerror = (error) => {
            reject(error);
            worker.terminate();
            URL.revokeObjectURL(workerUrl);
        };
        // 发送数据到Worker
        worker.postMessage({
            fn: fn.toString(),
            data
        });
    });
};
// 图表数据优化
export const optimizeChartData = (data, maxPoints = 1000) => {
    if (data.length <= maxPoints)
        return data;
    const step = Math.ceil(data.length / maxPoints);
    const optimizedData = [];
    for (let i = 0; i < data.length; i += step) {
        // 取区间内的平均值
        const end = Math.min(i + step, data.length);
        const chunk = data.slice(i, end);
        const average = chunk.reduce((sum, val) => sum + val, 0) / chunk.length;
        optimizedData.push(average);
    }
    return optimizedData;
};
// 内存使用监控
export const monitorMemoryUsage = () => {
    if (typeof performance !== 'undefined' && performance.memory) {
        const memory = performance.memory;
        console.log('Memory usage:', {
            used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
            total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
            limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + ' MB'
        });
    }
};
// 组件渲染性能监控
export const monitorRenderPerformance = (componentName, callback) => {
    const start = performance.now();
    callback();
    const end = performance.now();
    console.log(`${componentName} render time: ${(end - start).toFixed(2)}ms`);
};
// 数据预加载
export const preloadData = async (keys, fetchFn) => {
    const promises = keys.map(async (key) => {
        if (!dataCache.get(key)) {
            const data = await fetchFn(key);
            dataCache.set(key, data);
        }
    });
    await Promise.all(promises);
};
// 图片懒加载
export const lazyLoadImage = (img, src) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                img.src = src;
                observer.unobserve(img);
            }
        });
    });
    observer.observe(img);
};
// 增量学习优化
class IncrementalLearningOptimizer {
    constructor(batchSize = 100, updateThreshold = 0.05) {
        Object.defineProperty(this, "modelCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "batchSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "updateThreshold", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.modelCache = new Map();
        this.batchSize = batchSize;
        this.updateThreshold = updateThreshold;
    }
    // 缓存模型
    cacheModel(modelId, model, dataSize) {
        this.modelCache.set(modelId, {
            model,
            timestamp: Date.now(),
            dataSize
        });
    }
    // 获取缓存的模型
    getCachedModel(modelId) {
        return this.modelCache.get(modelId)?.model || null;
    }
    // 增量更新模型
    async incrementalUpdate(modelId, newData, updateFn) {
        const cached = this.modelCache.get(modelId);
        let model = cached?.model;
        // 分批处理新数据
        const batches = this.batchData(newData, this.batchSize);
        for (const batch of batches) {
            if (model) {
                // 更新现有模型
                model = updateFn(model, batch);
            }
            else {
                // 首次训练模型
                // 这里应该调用完整的训练函数
                break;
            }
        }
        // 更新缓存
        if (model) {
            this.cacheModel(modelId, model, (cached?.dataSize || 0) + newData.length);
        }
        return model;
    }
    // 数据分批
    batchData(data, batchSize) {
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }
        return batches;
    }
    // 清理过期模型
    cleanupExpiredModels(maxAge = 3600000) {
        const now = Date.now();
        for (const [modelId, info] of this.modelCache.entries()) {
            if (now - info.timestamp > maxAge) {
                this.modelCache.delete(modelId);
            }
        }
    }
    // 获取模型统计信息
    getModelStats() {
        const now = Date.now();
        return Array.from(this.modelCache.entries()).map(([modelId, info]) => ({
            modelId,
            dataSize: info.dataSize,
            age: now - info.timestamp
        }));
    }
}
// 导出增量学习优化器单例
export const incrementalLearningOptimizer = new IncrementalLearningOptimizer();
// 并行处理任务
export const parallelProcess = async (tasks, processor, concurrency = 4) => {
    const results = [];
    const executing = [];
    for (const task of tasks) {
        const executeTask = async () => {
            const result = await processor(task);
            results.push(result);
        };
        const promise = executeTask();
        executing.push(promise);
        if (executing.length >= concurrency) {
            await Promise.race(executing);
            // 过滤掉已完成的任务
            executing.filter(p => !p.isFulfilled());
        }
    }
    // 等待所有任务完成
    await Promise.all(executing);
    return results;
};
Promise.prototype.isFulfilled = function () {
    let isFulfilled = false;
    this.then(() => {
        isFulfilled = true;
    }).catch(() => {
        isFulfilled = true;
    });
    return isFulfilled;
};
