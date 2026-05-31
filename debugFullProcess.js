
// 测试完整的数据获取流程，包括数据源优先级和数据验证
import axios from 'axios';

// 模拟数据质量验证
function isValidStockQuote(quote) {
    if (!quote || typeof quote !== 'object')
        return false;
    
    // 验证核心必需字段
    const coreFields = ['code', 'name', 'price'];
    for (const field of coreFields) {
        if (!(field in quote)) {
            console.log(`数据验证失败: 缺少核心字段 ${field}`);
            return false;
        }
    }
    
    // 验证价格字段的有效性
    const priceFields = ['price', 'open', 'high', 'low', 'close'];
    for (const field of priceFields) {
        if (quote[field] !== undefined) {
            const value = quote[field];
            if (typeof value !== 'number' || isNaN(value) || value < 0) {
                console.log(`数据验证失败: ${field} 不是有效数字: ${value}`);
                return false;
            }
        }
    }
    
    // 验证价格范围合理性
    if (quote.price > 100000 || quote.price < 0) {
        console.log(`数据验证失败: ${quote.code} 价格超出合理范围: ${quote.price}`);
        return false;
    }
    
    // 验证涨跌幅合理性
    if (quote.changePercent !== undefined) {
        if (Math.abs(quote.changePercent) > 100) {
            console.log(`数据验证失败: ${quote.code} 涨跌幅(${quote.changePercent}%)异常`);
            return false;
        }
    }
    
    return true;
}

// 模拟东方财富数据源
async function getEastMoneyRealtimeQuote(codes) {
    console.log('\n东方财富数据源开始请求...');
    const results = [];
    
    for (const code of codes) {
        let secid;
        if (code.startsWith('sh')) {
            secid = `1.${code.substring(2)}`;
        } else if (code.startsWith('sz')) {
            secid = `0.${code.substring(2)}`;
        } else {
            continue;
        }
        
        try {
            const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
                params: {
                    secid,
                    fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
                    _: Date.now().toString()
                },
                headers: {
                    'Referer': 'https://quote.eastmoney.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
                },
                timeout: 5000
            });
            
            if (response.data && response.data.data) {
                const data = response.data.data;
                const price = data.f43 / 100;
                const open = data.f46 / 100;
                const high = data.f44 / 100;
                const low = data.f45 / 100;
                const close = data.f60 / 100;
                const change = data.f169 ? data.f169 / 100 : price - close;
                const changePercent = (data.f170 ? data.f170 / 100 : ((price - close) / close) * 100);
                
                const result = {
                    code,
                    name: data.f58 || `指数${code}`,
                    price: price,
                    change: change,
                    changePercent: changePercent,
                    open: open,
                    high: high,
                    low: low,
                    close: close,
                    volume: data.f47 || 0,
                    amount: data.f48 || 0
                };
                
                results.push(result);
            }
        } catch (error) {
            console.log(`东方财富获取${code}失败: ${error.message}`);
        }
    }
    
    console.log(`东方财富数据源返回 ${results.length} 条数据`);
    return results;
}

// 模拟新浪数据源
async function getSinaRealtimeQuote(codes) {
    console.log('\n新浪数据源开始请求...');
    const results = [];
    
    try {
        const sinaCodes = codes.join(',');
        const response = await axios.get(`https://hq.sinajs.cn/list=${sinaCodes}`, {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });
        
        const lines = response.data.split('\n');
        for (const line of lines) {
            if (!line) continue;
            
            const match = line.match(/"([^"]+)"/);
            if (match) {
                const values = match[1].split(',');
                if (values.length >= 32) {
                    const codeMatch = line.match(/hq_str_([^\s]+)=/);
                    if (codeMatch) {
                        const code = codeMatch[1];
                        const result = {
                            code,
                            name: values[0],
                            price: parseFloat(values[3]),
                            change: parseFloat(values[3]) - parseFloat(values[2]),
                            changePercent: ((parseFloat(values[3]) - parseFloat(values[2])) / parseFloat(values[2])) * 100,
                            open: parseFloat(values[1]),
                            high: parseFloat(values[4]),
                            low: parseFloat(values[5]),
                            close: parseFloat(values[2]),
                            volume: parseInt(values[8]),
                            amount: parseFloat(values[9])
                        };
                        
                        results.push(result);
                    }
                }
            }
        }
    } catch (error) {
        console.log(`新浪数据源失败: ${error.message}`);
    }
    
    console.log(`新浪数据源返回 ${results.length} 条数据`);
    return results;
}

// 模拟腾讯数据源
async function getTencentRealtimeQuote(codes) {
    console.log('\n腾讯数据源开始请求...');
    const results = [];
    
    try {
        const tencentCodes = codes.join(',');
        const response = await axios.get(`https://qt.gtimg.cn/q=${tencentCodes}`, {
            headers: {
                'Referer': 'https://finance.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });
        
        const lines = response.data.split('\n');
        for (const line of lines) {
            if (!line) continue;
            
            const match = line.match(/v_(\w+)="([^"]+)"/);
            if (match) {
                const values = match[2].split('~');
                if (values.length >= 30) {
                    const code = match[1];
                    let amount = 0;
                    if (values[35] && values[35].includes('/')) {
                        const amountParts = values[35].split('/');
                        if (amountParts.length >= 3) {
                            amount = parseFloat(amountParts[2]);
                        }
                    }
                    
                    const result = {
                        code,
                        name: values[1],
                        price: parseFloat(values[3]),
                        change: parseFloat(values[3]) - parseFloat(values[4]),
                        changePercent: ((parseFloat(values[3]) - parseFloat(values[4])) / parseFloat(values[4])) * 100,
                        open: parseFloat(values[5]),
                        high: parseFloat(values[33]),
                        low: parseFloat(values[34]),
                        close: parseFloat(values[4]),
                        volume: parseInt(values[6]),
                        amount: amount
                    };
                    
                    results.push(result);
                }
            }
        }
    } catch (error) {
        console.log(`腾讯数据源失败: ${error.message}`);
    }
    
    console.log(`腾讯数据源返回 ${results.length} 条数据`);
    return results;
}

// 模拟完整的数据获取流程
async function getRealtimeQuote(codes) {
    console.log(`\n=== 开始获取实时行情数据 ===`);
    console.log(`请求代码: ${codes.join(',')}`);
    
    // 数据源优先级顺序
    const sources = [
        { name: 'eastmoney', method: getEastMoneyRealtimeQuote },
        { name: 'sina', method: getSinaRealtimeQuote },
        { name: 'tencent', method: getTencentRealtimeQuote }
    ];
    
    const resultsMap = new Map();
    let remainingCodes = [...codes];
    
    for (const source of sources) {
        if (remainingCodes.length === 0) break;
        
        console.log(`\n尝试数据源: ${source.name}`);
        
        try {
            const sourceResults = await source.method(remainingCodes);
            console.log(`${source.name}数据源返回结果:`, sourceResults);
            
            if (sourceResults && sourceResults.length > 0) {
                // 验证数据质量
                const validResults = sourceResults.filter(item => isValidStockQuote(item));
                console.log(`${source.name}数据源验证后有效数据: ${validResults.length}条`);
                
                if (validResults.length > 0) {
                    // 保存获取到的数据
                    validResults.forEach(quote => {
                        resultsMap.set(quote.code, quote);
                    });
                    
                    // 更新剩余需要获取的代码
                    remainingCodes = remainingCodes.filter(code => !resultsMap.has(code));
                    console.log(`剩余需要获取的数据: ${remainingCodes.length}条`);
                }
            }
        } catch (error) {
            console.log(`${source.name}数据源失败: ${error.message}`);
        }
        
        // 添加数据源间的延迟
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const finalResults = Array.from(resultsMap.values());
    console.log(`\n=== 获取完成 ===`);
    console.log(`成功获取: ${finalResults.length}/${codes.length} 条数据`);
    console.log(`最终结果:`, finalResults);
    
    return finalResults;
}

// 运行测试
async function runTest() {
    console.log('=== 测试完整数据获取流程 ===\n');
    
    const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    const results = await getRealtimeQuote(indexCodes);
    
    console.log('\n=== 最终显示数据 ===');
    results.forEach(item => {
        console.log(`${item.code} (${item.name}): ${item.price.toFixed(2)} (${item.change > 0 ? '+' : ''}${item.change.toFixed(2)}, ${item.changePercent > 0 ? '+' : ''}${item.changePercent.toFixed(2)}%)`);
    });
}

runTest().catch(console.error);
