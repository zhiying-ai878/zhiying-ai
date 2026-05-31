// 智盈AI智能数据源管理器
// 实现智能数据源切换策略、健康检查和故障转移机制

import axios from 'axios';
import { comprehensiveDataSources } from './comprehensive_data_source_optimization.js';

class SmartDataSourceManager {
    constructor() {
        this.dataSources = comprehensiveDataSources;
        this.healthStatus = new Map();
        this.performanceStats = new Map();
        this.retryAttempts = new Map();
        this.requestTimestamps = new Map();
        this.failedSources = new Set();
        this.sourceLock = new Map();
        this.logger = console;
        
        // 初始化健康状态
        this.initializeHealthStatus();
        
        // 启动健康检查
        this.startHealthMonitoring();
        
        // 启动自动恢复机制
        this.startAutoRecovery();
    }
    
    // 初始化健康状态
    initializeHealthStatus() {
        Object.keys(this.dataSources).forEach(source => {
            this.healthStatus.set(source, {
                status: 'unknown',
                lastCheck: Date.now(),
                responseTime: 0,
                successCount: 0,
                failureCount: 0,
                consecutiveFailures: 0,
                lastFailureTime: 0
            });
            this.retryAttempts.set(source, 0);
            this.requestTimestamps.set(source, []);
        });
    }
    
    // 获取优先级排序的数据源列表
    getPrioritySortedSources() {
        return Object.entries(this.dataSources)
            .filter(([_, config]) => config.enabled)
            .sort(([_, a], [__, b]) => b.priority - a.priority)
            .map(([name]) => name);
    }
    
    // 检查是否为开盘时间段
    isTradingHours() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const day = now.getDay();
        
        // 周一到周五的交易时间
        if (day >= 1 && day<= 5) {
            // 上午交易时间: 9:30 - 11:30
            if ((hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute< 30)) {
                return true;
            }
            // 下午交易时间: 13:00 - 15:00
            if ((hour === 13 || hour === 14) || (hour === 15 && minute === 0)) {
                return true;
            }
        }
        return false;
    }
    
    // 获取开盘时间段的特殊配置
    getTradingHoursConfig() {
        return {
            healthCheckInterval: 10000, // 开盘时健康检查间隔缩短到10秒
            retryDelay: 500, // 开盘时重试延迟缩短到500ms
            maxConcurrentRequests: 5, // 开盘时最大并发请求数
            rateLimitMultiplier: 2 // 开盘时请求频率限制倍数
        };
    }
    
    // 智能选择最佳数据源 - 开盘时间段优化版
    async selectBestDataSource() {
        const sortedSources = this.getPrioritySortedSources();
        const isTrading = this.isTradingHours();
        const tradingConfig = this.getTradingHoursConfig();
        
        // 检查健康状态和性能统计
        for (const source of sortedSources) {
            // 跳过锁定的数据源
            if (this.sourceLock.has(source) && Date.now() - this.sourceLock.get(source)< (isTrading ? 10000 : 30000)) {
                continue;
            }
            
            const health = this.healthStatus.get(source);
            
            // 如果数据源未知状态，先尝试
            if (health.status === 'unknown') {
                return source;
            }
            
            // 如果数据源健康且没有连续失败
            if (health.status === 'healthy' && health.consecutiveFailures === 0) {
                return source;
            }
            
            // 如果数据源已恢复（冷却时间已过）
            const coolDownTime = isTrading ? 30000 : 60000; // 开盘时冷却时间缩短到30秒
            if (health.status === 'unhealthy' && 
                Date.now() - health.lastFailureTime > coolDownTime) {
                return source;
            }
        }
        
        // 如果所有数据源都不健康，尝试第一个数据源
        return sortedSources[0] || null;
    }
    
    // 执行智能数据请求 - 开盘时间段优化版
    async smartRequest(codes, requestType = 'realtime') {
        const sources = this.getPrioritySortedSources();
        const isTrading = this.isTradingHours();
        const tradingConfig = this.getTradingHoursConfig();
        
        for (const source of sources) {
            try {
                // 检查请求频率限制 - 开盘时更严格的限制
                if (!await this.checkRateLimit(source, isTrading ? tradingConfig.rateLimitMultiplier : 1)) {
                    continue;
                }
                
                // 检查健康状态 - 开盘时更宽松的检查
                const health = this.healthStatus.get(source);
                const lockTime = isTrading ? 10000 : 30000;
                if (health.status === 'unhealthy' && 
                    Date.now() - health.lastFailureTime< lockTime) {
                    continue;
                }
                
                this.logger.info(`尝试使用数据源: ${source}`);
                
                const startTime = Date.now();
                const result = await this.executeRequest(source, codes, requestType);
                const responseTime = Date.now() - startTime;
                
                // 更新健康状态
                this.updateHealthStatus(source, true, responseTime);
                
                // 更新性能统计
                this.updatePerformanceStats(source, responseTime);
                
                return result;
                
            } catch (error) {
                this.logger.error(`数据源 ${source} 请求失败:`, error);
                
                // 更新健康状态
                this.updateHealthStatus(source, false, 0);
                
                // 如果连续失败超过阈值，锁定数据源 - 开盘时阈值更低
                const health = this.healthStatus.get(source);
                const failureThreshold = isTrading ? 2 : 3;
                const lockDuration = isTrading ? 10000 : 30000;
                
                if (health.consecutiveFailures >= failureThreshold) {
                    this.sourceLock.set(source, Date.now());
                    this.failedSources.add(source);
                    this.logger.warn(`数据源 ${source} 连续失败，已锁定${lockDuration/1000}秒`);
                }
                
                // 开盘时添加更短的延迟避免频繁请求
                if (isTrading) {
                    await new Promise(resolve =>setTimeout(resolve, tradingConfig.retryDelay));
                }
                
                // 继续尝试下一个数据源
                continue;
            }
        }
        
        throw new Error('所有数据源都无法获取数据');
    }
    
    // 执行具体请求
    async executeRequest(source, codes, requestType) {
        const config = this.dataSources[source];
        const axiosConfig = {
            timeout: config.timeout,
            headers: config.headers,
            ...(config.sslConfig && {
                httpsAgent: new (await import('https')).Agent({
                    rejectUnauthorized: config.sslConfig.rejectUnauthorized,
                    secureOptions: config.sslConfig.secureOptions || 0
                })
            })
        };
        
        // 根据请求类型选择不同的API
        switch (requestType) {
            case 'realtime':
                return await this.getRealtimeData(source, codes, axiosConfig);
            case 'historical':
                return await this.getHistoricalData(source, codes, axiosConfig);
            case 'financial':
                return await this.getFinancialData(source, codes, axiosConfig);
            case 'news':
                return await this.getNewsData(source, codes, axiosConfig);
            default:
                throw new Error(`不支持的请求类型: ${requestType}`);
        }
    }
    
    // 获取历史数据
    async getHistoricalData(source, codes, axiosConfig) {
        const config = this.dataSources[source];
        
        switch (source) {
            case 'sina':
                return await this.getSinaHistoricalData(codes, axiosConfig);
            case 'tencent':
                return await this.getTencentHistoricalData(codes, axiosConfig);
            case 'eastmoney':
                return await this.getEastmoneyHistoricalData(codes, axiosConfig);
            // 其他数据源的实现...
            default:
                // 对于其他数据源，使用通用请求
                const response = await axios.get(config.url, axiosConfig);
                return response.data;
        }
    }
    
    // 获取实时数据
    async getRealtimeData(source, codes, axiosConfig) {
        const config = this.dataSources[source];
        
        switch (source) {
            case 'sina':
                return await this.getSinaRealtimeData(codes, axiosConfig);
            case 'tencent':
                return await this.getTencentRealtimeData(codes, axiosConfig);
            case 'eastmoney':
                return await this.getEastmoneyRealtimeData(codes, axiosConfig);
            // 其他数据源的实现...
            default:
                // 对于其他数据源，使用通用请求
                const response = await axios.get(config.url, axiosConfig);
                return response.data;
        }
    }
    
    // 新浪实时数据
    async getSinaRealtimeData(codes, axiosConfig) {
    const sinaCodes = codes.map(code => {
        // 如果代码已经以sh或sz开头，直接使用
        if (code.startsWith('sh') || code.startsWith('sz')) {
            return code;
        }
        // 否则，根据代码开头数字添加前缀
        const prefix = code.startsWith('6') ? 'sh' : 'sz';
        return `${prefix}${code}`;
    }).join(',');
    
    const url = `https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getStockTick`;
    const params = {
        symbol: sinaCodes
    };
    
    const response = await axios.get(url, { ...axiosConfig, params });
    
    // 检查API返回错误
    if (response.data && response.data.__ERROR) {
        throw new Error(`新浪API错误: ${response.data.__ERRORMSG || '未知错误'}`);
    }
    
    const result = this.parseSinaData(response.data);
    if (result.length === 0) {
        throw new Error('新浪数据源返回空数据');
    }
    
    return result;
}
    
    // 腾讯实时数据
    async getTencentRealtimeData(codes, axiosConfig) {
        const tencentCodes = codes.map(code => {
            // 如果代码已经以sh或sz开头，提取数字部分
            if (code.startsWith('sh')) {
                return `1.${code.substring(2)}`;
            } else if (code.startsWith('sz')) {
                return `0.${code.substring(2)}`;
            }
            // 否则，根据代码开头数字添加前缀
            const prefix = code.startsWith('6') ? '1' : '0';
            return `${prefix}.${code}`;
        }).join(',');
        
        const url = `https://web.ifzq.gtimg.cn/appstock/app/kline/kline`;
        const params = {
            param: `${tencentCodes},day,1,1000`
        };
        
        const response = await axios.get(url, { ...axiosConfig, params });
        
        const result = this.parseTencentData(response.data);
        if (result.length === 0) {
            throw new Error('腾讯数据源返回空数据');
        }
        
        return result;
    }
    
    // 东方财富实时数据
    async getEastmoneyRealtimeData(codes, axiosConfig) {
        const results = [];
        
        for (const code of codes) {
            let secid;
            // 如果代码已经以sh或sz开头，提取数字部分
            if (code.startsWith('sh')) {
                secid = `1.${code.substring(2)}`;
            } else if (code.startsWith('sz')) {
                secid = `0.${code.substring(2)}`;
            } else {
                secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
            }
            
            const url = `https://push2.eastmoney.com/api/qt/stock/get`;
            const params = {
                secid,
                fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f26,f27,f28,f30,f31,f32,f33,f34,f35,f36,f37,f38,f39,f40,f41,f42,f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65,f66,f67,f68,f69,f70,f71,f72,f73,f74,f75,f76,f77,f78,f79,f80,f81,f82,f83,f84,f85,f86,f87,f88,f89,f90'
            };
            
            try {
                const response = await axios.get(url, { ...axiosConfig, params });
                if (response.data && response.data.data) {
                    results.push(this.parseEastmoneyData(response.data.data));
                }
            } catch (error) {
                this.logger.error(`东方财富获取${code}数据失败:`, error);
            }
        }
        
        return results;
    }
    
    // 解析新浪数据
    parseSinaData(data) {
        if (!data || !Array.isArray(data)) {
            return [];
        }
        
        return data.map(item => ({
            code: item.symbol.replace(/^sh|^sz/, ''),
            name: item.name,
            price: parseFloat(item.price),
            open: parseFloat(item.open),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            close: parseFloat(item.close),
            volume: parseInt(item.volume),
            amount: parseFloat(item.amount),
            change: parseFloat(item.change),
            changePercent: parseFloat(item.changepercent),
            timestamp: Date.now()
        }));
    }
    
    // 解析腾讯数据
    parseTencentData(data) {
        const results = [];
        const dataObj = typeof data === 'string' ? JSON.parse(data) : data;
        
        Object.keys(dataObj).forEach(key => {
            if (key.startsWith('1.') || key.startsWith('0.')) {
                const code = key.split('.')[1];
                const stockData = dataObj[key];
                
                if (stockData && stockData.data && stockData.data.day) {
                    const latest = stockData.data.day[stockData.data.day.length - 1];
                    results.push({
                        code,
                        name: stockData.name || `股票${code}`,
                        price: parseFloat(latest[3]),
                        open: parseFloat(latest[1]),
                        high: parseFloat(latest[4]),
                        low: parseFloat(latest[5]),
                        close: parseFloat(latest[2]),
                        volume: parseInt(latest[6]),
                        amount: parseFloat(latest[7]),
                        change: parseFloat(latest[3]) - parseFloat(latest[2]),
                        changePercent: parseFloat(((latest[3] - latest[2]) / latest[2] * 100).toFixed(2)),
                        timestamp: Date.now()
                    });
                }
            }
        });
        
        return results;
    }
    
    // 解析东方财富数据
    parseEastmoneyData(data) {
        const code = data.f57 || data.f12;
        let fullCode;
        
        // 指数代码的特殊处理
        if (code === '000001') {
            fullCode = 'sh000001';
        } else if (code === '399001') {
            fullCode = 'sz399001';
        } else if (code === '399006') {
            fullCode = 'sz399006';
        } else if (code === '000688') {
            fullCode = 'sh000688';
        } else {
            // 股票代码的处理
            const market = data.f13 || (code && code.toString().startsWith('6') ? 1 : 0);
            fullCode = market === 1 ? `sh${code}` : `sz${code}`;
        }
        
        const price = parseFloat(data.f60 || data.f2) / 100;
        const close = parseFloat(data.f46 || data.f20) / 100;
        let change = parseFloat(data.f4) / 100;
        let changePercent = parseFloat(data.f3) / 100;
        
        // 如果没有涨跌幅数据（指数数据），则计算涨跌幅
        if (change === null || isNaN(change)) {
            change = price - close;
        }
        if (changePercent === null || isNaN(changePercent)) {
            changePercent = close > 0 ? ((price - close) / close * 100) : 0;
        }
        
        return {
            code: fullCode,
            name: data.f58 || data.f14,
            price: price,
            open: (parseFloat(data.f17) || parseFloat(data.f71)) / 100,
            high: (parseFloat(data.f15) || parseFloat(data.f44)) / 100,
            low: (parseFloat(data.f16) || parseFloat(data.f45)) / 100,
            close: close,
            volume: parseInt(data.f5 || data.f49),
            amount: parseFloat(data.f6 || data.f48) / 10000,
            change: change,
            changePercent: changePercent,
            timestamp: Date.now()
        };
    }
    
    // 新浪历史数据
    async getSinaHistoricalData(codes, axiosConfig) {
        const results = {};
        
        for (const code of codes) {
            const sinaCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
            const url = `https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData`;
            const params = {
                symbol: sinaCode,
                scale: 240, // 日线
                ma: '5,10,20',
                datalen: 100
            };
            
            try {
                const response = await axios.get(url, { ...axiosConfig, params });
                const klines = response.data || [];
                
                results[code] = klines.map(item => ({
                    date: item.day,
                    open: parseFloat(item.open),
                    close: parseFloat(item.close),
                    high: parseFloat(item.high),
                    low: parseFloat(item.low),
                    volume: parseInt(item.volume),
                    amount: parseFloat(item.amount),
                    change: parseFloat(item.change),
                    changePercent: parseFloat(item.changepercent)
                }));
            } catch (error) {
                this.logger.error(`新浪获取${code}历史数据失败:`, error);
                results[code] = [];
            }
        }
        
        return results;
    }
    
    // 腾讯历史数据
    async getTencentHistoricalData(codes, axiosConfig) {
        const results = {};
        
        for (const code of codes) {
            const marketCode = code.startsWith('6') ? '1' : '0';
            const tencentCode = `${marketCode}.${code}`;
            const url = `https://web.ifzq.gtimg.cn/appstock/app/kline/kline`;
            const params = {
                param: `${tencentCode},day,1,1000`
            };
            
            try {
                const response = await axios.get(url, { ...axiosConfig, params });
                const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                
                if (data && data[tencentCode] && data[tencentCode].data && data[tencentCode].data.day) {
                    const klines = data[tencentCode].data.day;
                    
                    results[code] = klines.map(item => ({
                        date: item[0],
                        open: parseFloat(item[1]),
                        close: parseFloat(item[2]),
                        high: parseFloat(item[3]),
                        low: parseFloat(item[4]),
                        volume: parseInt(item[5]),
                        amount: parseFloat(item[6]),
                        change: parseFloat(item[7]),
                        changePercent: parseFloat(item[8])
                    }));
                } else {
                    results[code] = [];
                }
            } catch (error) {
                this.logger.error(`腾讯获取${code}历史数据失败:`, error);
                results[code] = [];
            }
        }
        
        return results;
    }
    
    // 东方财富历史数据
    async getEastmoneyHistoricalData(codes, axiosConfig) {
        const results = {};
        
        for (const code of codes) {
            let cleanCode = code;
            if (code.startsWith('sh')) {
                cleanCode = code.substring(2);
            } else if (code.startsWith('sz')) {
                cleanCode = code.substring(2);
            }
            const marketCode = cleanCode.startsWith('6') ? '1' : '0';
            const secid = `${marketCode}.${cleanCode}`;
            
            // 尝试使用备用API端点
            const url = `https://push2his.eastmoney.com/api/qt/stock/kline/get`;
            const params = {
                secid,
                klt: 101, // 日线
                fqt: 1, // 前复权
                end: Date.now(),
                lmt: 100
            };
            
            try {
                const response = await axios.get(url, { 
                    ...axiosConfig,
                    params
                });
                
                if (response.data && response.data.data && response.data.data.kline) {
                    const klines = response.data.data.kline;
                    
                    results[code] = klines.map(kline => {
                        const values = kline.split(',');
                        if (values.length >= 9) {
                            return {
                                date: values[0],
                                open: parseFloat(values[1]) / 100,
                                close: parseFloat(values[2]) / 100,
                                high: parseFloat(values[3]) / 100,
                                low: parseFloat(values[4]) / 100,
                                volume: parseInt(values[5]),
                                amount: parseFloat(values[6]),
                                change: parseFloat(values[7]) / 100,
                                changePercent: parseFloat(values[8])
                            };
                        }
                        return null;
                    }).filter(item => item !== null);
                } else {
                    // 如果第一个API失败，尝试备用API
                    try {
                        const alternativeUrl = `https://web.ifzq.gtimg.cn/appstock/app/kline/kline`;
                        const alternativeParams = {
                            param: `${marketCode}.${cleanCode},day,1,1000`
                        };
                        
                        const altResponse = await axios.get(alternativeUrl, {
                            ...axiosConfig,
                            params: alternativeParams
                        });
                        
                        const dataObj = typeof altResponse.data === 'string' ? JSON.parse(altResponse.data) : altResponse.data;
                        const key = `${marketCode}.${cleanCode}`;
                        
                        if (dataObj[key] && dataObj[key].data && dataObj[key].data.day) {
                            const klines = dataObj[key].data.day;
                            results[code] = klines.map(kline => {
                                return {
                                    date: kline[0],
                                    open: parseFloat(kline[1]),
                                    close: parseFloat(kline[2]),
                                    high: parseFloat(kline[4]),
                                    low: parseFloat(kline[5]),
                                    volume: parseInt(kline[6]),
                                    amount: parseFloat(kline[7]),
                                    change: parseFloat(kline[3]) - parseFloat(kline[2]),
                                    changePercent: parseFloat(((kline[3] - kline[2]) / kline[2] * 100).toFixed(2))
                                };
                            });
                        } else {
                            results[code] = [];
                        }
                    } catch (altError) {
                        this.logger.error(`备用API获取${code}历史数据失败:`, altError);
                        results[code] = [];
                    }
                }
            } catch (error) {
                this.logger.error(`东方财富获取${code}历史数据失败:`, error);
                results[code] = [];
            }
        }
        
        return results;
    }
    
    // 检查请求频率限制 - 开盘时间段优化版
    async checkRateLimit(source, rateMultiplier = 1) {
        const config = this.dataSources[source];
        const timestamps = this.requestTimestamps.get(source);
        const now = Date.now();
        
        // 清理过期的时间戳
        const recentTimestamps = timestamps.filter(ts => now - ts< 60000);
        this.requestTimestamps.set(source, recentTimestamps);
        
        // 检查请求频率 - 开盘时应用倍数限制
        const maxRequests = Math.floor(config.rateLimit.maxRequests * rateMultiplier);
        
        if (recentTimestamps.length >= maxRequests) {
            // 等待直到有请求过期
            const waitTime = Math.max(0, recentTimestamps[0] + 60000 - now);
            if (waitTime >0) {
                this.logger.warn(`数据源 ${source} 请求频率超限，等待 ${waitTime}ms`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
        
        // 添加当前请求时间戳
        this.requestTimestamps.get(source).push(now);
        return true;
    }
    
    // 更新健康状态
    updateHealthStatus(source, success, responseTime) {
        const health = this.healthStatus.get(source);
        
        if (success) {
            health.status = 'healthy';
            health.successCount++;
            health.consecutiveFailures = 0;
            health.responseTime = responseTime;
            health.lastCheck = Date.now();
            
            // 如果之前失败过，从失败列表中移除
            this.failedSources.delete(source);
            
        } else {
            health.status = 'unhealthy';
            health.failureCount++;
            health.consecutiveFailures++;
            health.lastFailureTime = Date.now();
            health.lastCheck = Date.now();
        }
    }
    
    // 更新性能统计
    updatePerformanceStats(source, responseTime) {
        const stats = this.performanceStats.get(source) || {
            totalRequests: 0,
            totalResponseTime: 0,
            avgResponseTime: 0,
            minResponseTime: Infinity,
            maxResponseTime: 0
        };
        
        stats.totalRequests++;
        stats.totalResponseTime += responseTime;
        stats.avgResponseTime = stats.totalResponseTime / stats.totalRequests;
        stats.minResponseTime = Math.min(stats.minResponseTime, responseTime);
        stats.maxResponseTime = Math.max(stats.maxResponseTime, responseTime);
        
        this.performanceStats.set(source, stats);
    }
    
    // 启动健康监控 - 开盘时间段优化版
    startHealthMonitoring() {
        const healthCheckInterval = () => {
            const isTrading = this.isTradingHours();
            const interval = isTrading ? 10000 : 30000; // 开盘时每10秒检查一次，非开盘时每30秒检查一次
            
            setTimeout(async () => {
                await this.performHealthChecks();
                healthCheckInterval(); // 递归调用
            }, interval);
        };
        
        healthCheckInterval(); // 开始健康检查
    }
    
    // 执行健康检查
    async performHealthChecks() {
        const testCode = '600519'; // 贵州茅台作为测试股票
        
        // 优先检查未知状态的数据源
        const unknownSources = Array.from(this.healthStatus.keys())
            .filter(source =>this.healthStatus.get(source).status === 'unknown');
        
        // 然后检查其他数据源
        const otherSources = this.getPrioritySortedSources()
            .filter(source => this.healthStatus.get(source).status !== 'unknown');
        
        // 合并检查列表
        const sourcesToCheck = [...unknownSources, ...otherSources];
        
        for (const source of sourcesToCheck) {
            const health = this.healthStatus.get(source);
            
            // 对于未知状态的数据源，立即检查
            if (health.status === 'unknown') {
                try {
                    await this.executeRequest(source, [testCode], 'realtime');
                    this.updateHealthStatus(source, true, 0);
                    this.logger.info(`数据源 ${source} 健康检查成功，状态更新为健康`);
                } catch (error) {
                    this.updateHealthStatus(source, false, 0);
                    this.logger.warn(`数据源 ${source} 健康检查失败，状态更新为不健康:`, error.message);
                }
            } else {
                // 对于其他状态的数据源，跳过最近检查过的
                if (Date.now() - health.lastCheck< 30000) {
                    continue;
                }
                
                try {
                    await this.executeRequest(source, [testCode], 'realtime');
                    this.updateHealthStatus(source, true, 0);
                } catch (error) {
                    this.updateHealthStatus(source, false, 0);
                }
            }
            
            // 添加小延迟，避免并发请求过多
            await new Promise(resolve =>setTimeout(resolve, 100));
        }
    }
    
    // 启动自动恢复机制
    startAutoRecovery() {
        setInterval(() => {
            this.attemptRecovery();
        }, 60000); // 每分钟尝试恢复一次
    }
    
    // 尝试恢复失败的数据源
    async attemptRecovery() {
        for (const source of this.failedSources) {
            const health = this.healthStatus.get(source);
            
            // 检查冷却时间
            if (Date.now() - health.lastFailureTime < 60000) {
                continue;
            }
            
            try {
                this.logger.info(`尝试恢复数据源: ${source}`);
                await this.executeRequest(source, ['600519'], 'realtime');
                this.updateHealthStatus(source, true, 0);
                this.sourceLock.delete(source);
                this.failedSources.delete(source);
                this.logger.info(`数据源 ${source} 恢复成功！`);
            } catch (error) {
                this.logger.warn(`数据源 ${source} 恢复失败:`, error);
            }
        }
    }
    
    // 获取数据源状态报告
    getStatusReport() {
        const report = {
            timestamp: Date.now(),
            totalSources: Object.keys(this.dataSources).length,
            healthySources: Array.from(this.healthStatus.entries())
                .filter(([_, health]) => health.status === 'healthy').length,
            unhealthySources: Array.from(this.healthStatus.entries())
                .filter(([_, health]) => health.status === 'unhealthy').length,
            unknownSources: Array.from(this.healthStatus.entries())
                .filter(([_, health]) => health.status === 'unknown').length,
            failedSources: Array.from(this.failedSources),
            performanceStats: {},
            healthStatus: {}
        };
        
        // 添加性能统计
        this.performanceStats.forEach((stats, source) => {
            report.performanceStats[source] = stats;
        });
        
        // 添加健康状态
        this.healthStatus.forEach((health, source) => {
            report.healthStatus[source] = health;
        });
        
        return report;
    }
    
    // 获取最佳数据源建议
    getBestSourceRecommendation() {
        const healthySources = Array.from(this.healthStatus.entries())
            .filter(([_, health]) => health.status === 'healthy')
            .sort(([_, a], [__, b]) => {
                // 优先选择响应时间短的
                if (a.responseTime !== b.responseTime) {
                    return a.responseTime - b.responseTime;
                }
                // 其次选择成功率高的
                const aSuccessRate = a.successCount / (a.successCount + a.failureCount) || 0;
                const bSuccessRate = b.successCount / (b.successCount + b.failureCount) || 0;
                return bSuccessRate - aSuccessRate;
            });
        
        return healthySources.map(([source]) => source);
    }
}

// 导出单例实例
let instance = null;

export function getSmartDataSourceManager() {
    if (!instance) {
        instance = new SmartDataSourceManager();
    }
    return instance;
}

// 导出智能请求函数
export async function smartDataRequest(codes, requestType = 'realtime') {
    const manager = getSmartDataSourceManager();
    return await manager.smartRequest(codes, requestType);
}

// 导出状态报告函数
export function getDataSourceStatus() {
    const manager = getSmartDataSourceManager();
    return manager.getStatusReport();
}

// 导出最佳数据源建议函数
export function getBestDataSourceRecommendation() {
    const manager = getSmartDataSourceManager();
    return manager.getBestSourceRecommendation();
}