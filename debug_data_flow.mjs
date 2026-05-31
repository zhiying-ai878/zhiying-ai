import axios from 'axios';

// 模拟股票数据源类的简化版本
class StockDataSource {
    constructor() {
        this.sourceType = 'eastmoney';
        this.logger = {
            info: console.log,
            warn: console.warn,
            error: console.error,
            debug: console.log
        };
    }

    // 简化版的数据验证方法
    isValidStockQuote(quote) {
        if (!quote || typeof quote !== 'object') return false;
        
        // 验证核心必需字段
        const coreFields = ['code', 'name', 'price'];
        for (const field of coreFields) {
            if (!(field in quote)) {
                this.logger.warn(`数据验证失败: 缺少核心字段 ${field}`);
                return false;
            }
        }
        
        // 验证价格字段的有效性（允许0值）
        const priceFields = ['price', 'open', 'high', 'low', 'close'];
        for (const field of priceFields) {
            if (quote[field] !== undefined) {
                const value = quote[field];
                if (typeof value !== 'number' || isNaN(value) || value < 0) {
                    this.logger.warn(`数据验证失败: ${field} 不是有效数字: ${value}`);
                    return false;
                }
            }
        }
        
        return true;
    }

    validateDataQuality(data) {
        if (!data || data.length === 0) return [];
        const validData = [];
        for (const item of data) {
            if (this.isValidStockQuote(item)) {
                validData.push(item);
            } else {
                this.logger.warn(`数据验证失败: ${item.code || 'unknown'} - 数据不完整或无效`);
            }
        }
        return validData;
    }

    // 腾讯数据源
    async getTencentRealtimeQuote(codes) {
        console.log('=== 获取腾讯数据源 ===');
        const results = [];
        try {
            const tencentCodes = codes.join(',');
            const response = await axios.get(`https://qt.gtimg.cn/q=${tencentCodes}`, {
                headers: {
                    'Referer': 'https://finance.qq.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 3000
            });

            const lines = response.data.split('\n');
            for (const line of lines) {
                if (!line) continue;
                const match = line.match(/v_(\w+)="([^"]+)"/);
                if (match) {
                    const tencentCode = match[1];
                    const values = match[2].split('~');
                    if (values.length >= 30) {
                        // 找到对应的原始代码
                        let code = tencentCode;
                        if (tencentCode.startsWith('sh')) {
                            code = tencentCode.substring(2);
                        } else if (tencentCode.startsWith('sz')) {
                            code = tencentCode.substring(2);
                        }
                        
                        let name = values[1];
                        name = name.replace(/锟斤拷/g, '').replace(/æ/g, '').replace(/€/g, '').replace(/�/g, '').replace(/Ã/g, '').replace(/©/g, '').replace(/Â/g, '').trim();
                        
                        const quote = {
                            code,
                            name: name || `股票${code}`,
                            price: parseFloat(values[3]),
                            change: parseFloat(values[3]) - parseFloat(values[4]),
                            changePercent: ((parseFloat(values[3]) - parseFloat(values[4])) / parseFloat(values[4])) * 100,
                            open: parseFloat(values[5]),
                            high: parseFloat(values[33]),
                            low: parseFloat(values[34]),
                            close: parseFloat(values[4]),
                            volume: parseInt(values[6]),
                            amount: 0
                        };
                        
                        console.log(`腾讯数据源返回:`, quote);
                        results.push(quote);
                    }
                }
            }
            
            console.log(`腾讯数据源成功获取 ${results.length}/${codes.length} 条数据`);
            return results;
        } catch (error) {
            console.error('腾讯数据源失败:', error.message);
            return [];
        }
    }

    // 新浪数据源
    async getSinaRealtimeQuote(codes) {
        console.log('=== 获取新浪数据源 ===');
        const results = [];
        try {
            const sinaCodes = codes.join(',');
            const response = await axios.get(`https://hq.sinajs.cn/list=${sinaCodes}`, {
                headers: {
                    'Referer': 'https://finance.sina.com.cn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 3000
            });

            const lines = response.data.split('\n');
            for (const line of lines) {
                if (!line) continue;
                const codeMatch = line.match(/hq_str_([^\s]+)=/);
                if (codeMatch) {
                    const sinaCode = codeMatch[1];
                    const match = line.match(/"([^"]+)"/);
                    if (match) {
                        const values = match[1].split(',');
                        if (values.length >= 32) {
                            // 找到对应的原始代码
                            let code = sinaCode;
                            if (sinaCode.startsWith('sh')) {
                                code = sinaCode.substring(2);
                            } else if (sinaCode.startsWith('sz')) {
                                code = sinaCode.substring(2);
                            }
                            
                            let name = values[0];
                            name = name.replace(/锟斤拷/g, '').replace(/æ/g, '').replace(/€/g, '').replace(/�/g, '').replace(/Ã/g, '').replace(/©/g, '').replace(/Â/g, '').trim();
                            
                            const quote = {
                                code,
                                name: name || `股票${code}`,
                                price: parseFloat(values[1]),
                                change: parseFloat(values[1]) - parseFloat(values[2]),
                                changePercent: ((parseFloat(values[1]) - parseFloat(values[2])) / parseFloat(values[2])) * 100,
                                open: parseFloat(values[2]),
                                high: parseFloat(values[4]),
                                low: parseFloat(values[5]),
                                close: parseFloat(values[3]),
                                volume: parseInt(values[8]),
                                amount: parseFloat(values[9])
                            };
                            
                            console.log(`新浪数据源返回:`, quote);
                            results.push(quote);
                        }
                    }
                }
            }
            
            console.log(`新浪数据源成功获取 ${results.length}/${codes.length} 条数据`);
            return results;
        } catch (error) {
            console.error('新浪数据源失败:', error.message);
            return [];
        }
    }

    // 东方财富数据源
    async getEastMoneyRealtimeQuote(codes) {
        console.log('=== 获取东方财富数据源 ===');
        const results = [];
        try {
            for (const code of codes) {
                let secid;
                if (code.startsWith('sh')) {
                    secid = `1.${code.substring(2)}`;
                } else if (code.startsWith('sz')) {
                    secid = `0.${code.substring(2)}`;
                }
                
                const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
                    params: {
                        secid,
                        fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f107,f116,f117,f127',
                        _: Date.now().toString()
                    },
                    headers: {
                        'Referer': 'https://quote.eastmoney.com/',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    timeout: 3000
                });
                
                if (response.data && response.data.data) {
                    const data = response.data.data;
                    const quote = {
                        code: code.replace('sh', '').replace('sz', ''),
                        name: data.f58,
                        price: parseFloat(data.f43),
                        change: parseFloat(data.f44),
                        changePercent: parseFloat(data.f44),
                        open: parseFloat(data.f45),
                        high: parseFloat(data.f46),
                        low: parseFloat(data.f47),
                        close: parseFloat(data.f48),
                        volume: parseInt(data.f51),
                        amount: parseFloat(data.f52)
                    };
                    
                    console.log(`东方财富数据源返回:`, quote);
                    results.push(quote);
                }
            }
            
            console.log(`东方财富数据源成功获取 ${results.length}/${codes.length} 条数据`);
            return results;
        } catch (error) {
            console.error('东方财富数据源失败:', error.message);
            return [];
        }
    }

    // 模拟getRealtimeQuote方法
    async getRealtimeQuote(codes) {
        console.log(`=== 开始获取实时行情数据 ===`);
        console.log(`请求代码: ${codes.join(',')}`);
        
        // 数据源优先级列表
        const rankedSources = [
            { name: 'eastmoney', method: this.getEastMoneyRealtimeQuote.bind(this) },
            { name: 'sina', method: this.getSinaRealtimeQuote.bind(this) },
            { name: 'tencent', method: this.getTencentRealtimeQuote.bind(this) }
        ];
        
        const resultsMap = new Map();
        let remainingCodes = [...codes];
        let failedSources = [];
        
        for (const source of rankedSources) {
            if (remainingCodes.length === 0) break;
            
            if (failedSources.includes(source.name)) {
                console.log(`跳过已失败的数据源: ${source.name}`);
                continue;
            }
            
            console.log(`\n尝试数据源: ${source.name}`);
            try {
                const sourceResults = await source.method(remainingCodes);
                console.log(`${source.name}数据源返回结果:`, sourceResults);
                
                if (sourceResults && sourceResults.length > 0) {
                    const successRate = (sourceResults.length / remainingCodes.length) * 100;
                    console.log(`${source.name}数据源成功获取 ${sourceResults.length}/${remainingCodes.length} 条数据，成功率: ${successRate.toFixed(2)}%`);
                    
                    // 验证数据质量
                    const validResults = this.validateDataQuality(sourceResults);
                    console.log(`验证后的数据:`, validResults);
                    
                    if (validResults.length > 0) {
                        validResults.forEach((quote) => {
                            resultsMap.set(quote.code, quote);
                        });
                        
                        remainingCodes = remainingCodes.filter(code => !resultsMap.has(code));
                        console.log(`剩余需要获取的数据: ${remainingCodes.length}条`);
                    } else {
                        console.warn(`${source.name}数据源返回的数据质量不符合要求`);
                        failedSources.push(source.name);
                    }
                } else {
                    console.warn(`${source.name}数据源未返回数据`);
                    failedSources.push(source.name);
                }
            } catch (error) {
                console.error(`${source.name}数据源失败:`, error.message);
                failedSources.push(source.name);
            }
        }
        
        const finalResults = Array.from(resultsMap.values());
        console.log(`\n=== 获取完成 ===`);
        console.log(`成功获取: ${finalResults.length}/${codes.length} 条数据`);
        console.log(`最终结果:`, finalResults);
        
        return finalResults;
    }
}

// 运行测试
async function test() {
    const dataSource = new StockDataSource();
    
    // 测试指数数据获取
    const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    console.log('测试指数数据获取...');
    
    const results = await dataSource.getRealtimeQuote(indexCodes);
    
    // 模拟Dashboard中的数据处理
    console.log('\n=== 模拟Dashboard数据处理 ===');
    const indexMap = new Map(results.map(r => [r.code, r]));
    
    const updatedMarketData = [
        { name: '上证指数', value: indexMap.get('000001')?.price || 0, change: indexMap.get('000001')?.change || 0, changePercent: indexMap.get('000001')?.changePercent || 0 },
        { name: '深证成指', value: indexMap.get('399001')?.price || 0, change: indexMap.get('399001')?.change || 0, changePercent: indexMap.get('399001')?.changePercent || 0 },
        { name: '创业板指', value: indexMap.get('399006')?.price || 0, change: indexMap.get('399006')?.change || 0, changePercent: indexMap.get('399006')?.changePercent || 0 },
        { name: '科创综指', value: indexMap.get('000688')?.price || 0, change: indexMap.get('000688')?.change || 0, changePercent: indexMap.get('000688')?.changePercent || 0 },
    ];
    
    console.log('最终市场数据:', updatedMarketData);
}

test().catch(console.error);
