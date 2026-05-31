
// 股票数据测试脚本
// 测试指数数据、自选股数据、预测价格和买卖信号

import axios from 'axios';

// 测试东方财富指数数据获取
async function testIndexData() {
    console.log('=== 测试指数数据获取 ===');
    
    const indexCodes = ['sh000001', 'sz399001']; // 上证指数、深证成指
    
    for (const code of indexCodes) {
        try {
            // 处理指数代码
            let cleanCode = code;
            let secid;
            
            if (code.startsWith('sh')) {
                cleanCode = code.substring(2);
                secid = `1.${cleanCode}`;
            } else if (code.startsWith('sz')) {
                cleanCode = code.substring(2);
                secid = `0.${cleanCode}`;
            }
            
            console.log(`获取指数: ${code}, secid: ${secid}`);
            
            const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
                params: {
                    secid,
                    fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
                    _: Date.now().toString()
                },
                headers: {
                    'Referer': 'https://quote.eastmoney.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
                },
                timeout: 3000
            });
            
            if (response.data && response.data.data) {
                const data = response.data.data;
                console.log(`指数代码: ${code}`);
                console.log(`指数名称: ${data.f58}`);
                console.log(`当前价格: ${(data.f43 / 100).toFixed(2)}`);
                console.log(`开盘价: ${(data.f46 / 100).toFixed(2)}`);
                console.log(`最高价: ${(data.f44 / 100).toFixed(2)}`);
                console.log(`最低价: ${(data.f45 / 100).toFixed(2)}`);
                console.log(`收盘价: ${(data.f60 / 100).toFixed(2)}`);
                console.log(`涨跌幅: ${data.f170 ? data.f170.toFixed(2) + '%' : 'N/A'}`);
                console.log('---');
            } else {
                console.log(`获取${code}数据失败: 数据为空`);
            }
            
        } catch (error) {
            console.error(`获取${code}数据失败:`, error.message);
        }
    }
}

// 测试自选股数据获取
async function testWatchlistData() {
    console.log('\n=== 测试自选股数据获取 ===');
    
    const stockCodes = ['600519', '002594', '000001', '601318']; // 贵州茅台、比亚迪、平安银行、中国平安
    
    for (const code of stockCodes) {
        try {
            const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
            
            console.log(`获取股票: ${code}, secid: ${secid}`);
            
            const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
                params: {
                    secid,
                    fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
                    _: Date.now().toString()
                },
                headers: {
                    'Referer': 'https://quote.eastmoney.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
                },
                timeout: 3000
            });
            
            if (response.data && response.data.data) {
                const data = response.data.data;
                console.log(`股票代码: ${code}`);
                console.log(`股票名称: ${data.f58}`);
                console.log(`当前价格: ${(data.f43 / 100).toFixed(2)}`);
                console.log(`涨跌幅: ${data.f170 ? data.f170.toFixed(2) + '%' : 'N/A'}`);
                console.log('---');
            } else {
                console.log(`获取${code}数据失败: 数据为空`);
            }
            
        } catch (error) {
            console.error(`获取${code}数据失败:`, error.message);
        }
    }
}

// 测试K线数据获取（用于预测）
async function testKLineData(stockCode) {
    console.log(`\n=== 测试${stockCode}的K线数据获取 ===`);
    
    try {
        const secid = stockCode.startsWith('6') ? `1.${stockCode}` : `0.${stockCode}`;
        
        console.log(`请求K线数据: ${stockCode}, secid: ${secid}`);
        
        const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
            params: {
                secid,
                klt: 101, // 日线
                fqt: 1,
                lmt: 60,
                fields1: 'f1,f2,f3,f4,f5,f6',
                fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
                _: Date.now().toString()
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Connection': 'keep-alive'
            },
            timeout: 10000
        });
        
        console.log('K线数据响应:', response.data);
        
        if (response.data && response.data.data && response.data.data.klines) {
            const klines = response.data.data.klines;
            console.log(`获取到 ${klines.length} 条K线数据`);
            
            // 显示最近5条数据
            const recentKlines = klines.slice(-5);
            recentKlines.forEach((kline, index) => {
                const values = kline.split(',');
                console.log(`日期: ${values[0]}, 开盘: ${(values[1]/100).toFixed(2)}, 收盘: ${(values[4]/100).toFixed(2)}`);
            });
            
            return klines.map(kline => {
                const values = kline.split(',');
                return {
                    date: values[0],
                    open: parseFloat(values[1]) / 100,
                    high: parseFloat(values[2]) / 100,
                    low: parseFloat(values[3]) / 100,
                    close: parseFloat(values[4]) / 100,
                    volume: parseInt(values[5]),
                    amount: parseFloat(values[6])
                };
            });
        } else {
            console.log(`获取${stockCode}K线数据失败: 数据为空`, response.data);
            return [];
        }
        
    } catch (error) {
        console.error(`获取${stockCode}K线数据失败:`, error.message);
        console.error('错误详情:', error);
        return [];
    }
}

// 模拟预测功能
function simulatePrediction(historicalData, stockCode) {
    console.log(`\n=== 测试${stockCode}的预测功能 ===`);
    
    if (historicalData.length === 0) {
        console.log('没有历史数据，无法进行预测');
        return;
    }
    
    const prices = historicalData.map(data => data.close);
    const lastPrice = prices[prices.length - 1];
    
    // 计算近期趋势
    const recentPrices = prices.slice(-10);
    const firstPrice = recentPrices[0];
    const trend = (lastPrice - firstPrice) / firstPrice;
    
    // 计算波动率
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance);
    
    // 生成预测结果
    const predictedPrice = lastPrice * (1 + trend * 0.03);
    const confidence = Math.max(0.6, Math.min(0.95, 0.7 + Math.abs(trend) * 0.3));
    
    console.log(`当前价格: ${lastPrice.toFixed(2)}`);
    console.log(`预测价格: ${predictedPrice.toFixed(2)}`);
    console.log(`预测置信度: ${(confidence * 100).toFixed(1)}%`);
    console.log(`趋势: ${trend > 0 ? '上涨' : trend < 0 ? '下跌' : '稳定'} (${(trend * 100).toFixed(2)}%)`);
    
    // 生成买卖信号
    const buySignal = trend > 0.02 && confidence > 0.8;
    const sellSignal = trend < -0.02 && confidence > 0.8;
    
    console.log(`买入信号: ${buySignal ? '是' : '否'}`);
    console.log(`卖出信号: ${sellSignal ? '是' : '否'}`);
    
    if (buySignal) {
        const targetPrice = lastPrice * 1.15; // 15%目标盈利
        const stopLoss = lastPrice * 0.95; // 5%止损
        console.log(`建议买入价格: ${lastPrice.toFixed(2)}`);
        console.log(`目标价格: ${targetPrice.toFixed(2)}`);
        console.log(`止损价格: ${stopLoss.toFixed(2)}`);
    }
    
    if (sellSignal) {
        console.log(`建议卖出价格: ${lastPrice.toFixed(2)}`);
    }
}

// 测试技术指标信号生成
function testTechnicalSignals(historicalData, stockCode) {
    console.log(`\n=== 测试${stockCode}的技术指标信号 ===`);
    
    if (historicalData.length < 20) {
        console.log('数据不足，无法计算技术指标');
        return;
    }
    
    const closes = historicalData.map(data => data.close);
    const highs = historicalData.map(data => data.high);
    const lows = historicalData.map(data => data.low);
    
    // 计算RSI
    function calculateRSI(prices, period) {
        if (prices.length < period + 1) return 50;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = prices.length - period; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) {
                gains += change;
            } else {
                losses += Math.abs(change);
            }
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        
        if (avgLoss === 0) return 100;
        
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }
    
    // 计算MACD
    function calculateEMA(prices, period) {
        if (prices.length === 0) return 0;
        
        const k = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = prices[i] * k + ema * (1 - k);
        }
        
        return ema;
    }
    
    const rsi = calculateRSI(closes, 14);
    const ema12 = calculateEMA(closes, 12);
    const ema26 = calculateEMA(closes, 26);
    const diff = ema12 - ema26;
    const dea = calculateEMA([diff], 9);
    
    console.log(`RSI(14): ${rsi.toFixed(1)}`);
    console.log(`MACD Diff: ${diff.toFixed(4)}`);
    console.log(`MACD DEA: ${dea.toFixed(4)}`);
    
    // 生成技术指标信号
    const buyConditions = [
        rsi < 30, // RSI超卖
        diff > dea // MACD金叉
    ];
    
    const sellConditions = [
        rsi > 70, // RSI超买
        diff < dea // MACD死叉
    ];
    
    const buySignal = buyConditions.filter(Boolean).length >= 1;
    const sellSignal = sellConditions.filter(Boolean).length >= 1;
    
    console.log(`技术指标买入信号: ${buySignal ? '是' : '否'}`);
    console.log(`技术指标卖出信号: ${sellSignal ? '是' : '否'}`);
    
    if (buySignal) {
        const currentPrice = closes[closes.length - 1];
        console.log(`基于技术指标的买入建议: ${currentPrice.toFixed(2)}`);
    }
    
    if (sellSignal) {
        const currentPrice = closes[closes.length - 1];
        console.log(`基于技术指标的卖出建议: ${currentPrice.toFixed(2)}`);
    }
}

// 主测试函数
async function runTests() {
    console.log('开始股票数据测试...');
    
    // 测试指数数据
    await testIndexData();
    
    // 测试自选股数据
    await testWatchlistData();
    
    // 测试预测功能（以贵州茅台为例）
    const klineData = await testKLineData('600519');
    if (klineData.length > 0) {
        simulatePrediction(klineData, '600519');
        testTechnicalSignals(klineData, '600519');
    }
    
    console.log('\n测试完成！');
}

// 运行测试
runTests().catch(error => {
    console.error('测试过程中发生错误:', error);
});
