
// 测试预测数据和历史数据
import axios from 'axios';

async function testHistoricalData() {
    console.log('=== 测试历史数据获取 ===\n');
    
    const stockCodes = ['002594', '301197', '000858', '300750'];
    
    for (const code of stockCodes) {
        try {
            console.log(`\n测试股票: ${code}`);
            
            // 获取历史数据
            const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
            const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
                params: {
                    secid,
                    klt: 101, // 日线
                    fqt: 1,   // 前复权
                    lmt: 10,  // 10条数据
                    fields1: 'f1,f2,f3,f4,f5,f6',
                    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61'
                },
                headers: {
                    'Referer': 'https://quote.eastmoney.com/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 5000
            });
            
            if (response.data && response.data.data && response.data.data.klines) {
                const klines = response.data.data.klines;
                console.log(`获取到 ${klines.length} 条历史数据`);
                
                // 显示最新3条数据
                const recentKlines = klines.slice(-3);
                recentKlines.forEach((kline, index) => {
                    const values = kline.split(',');
                    if (values.length >= 6) {
                        console.log(`${index + 1}. 日期: ${values[0]}, 开盘: ${(values[1]/100).toFixed(2)}, 收盘: ${(values[4]/100).toFixed(2)}`);
                    }
                });
                
                // 提取收盘价用于预测
                const prices = klines.map(kline => {
                    const values = kline.split(',');
                    return parseFloat(values[4]) / 100;
                });
                
                console.log('收盘价数据:', prices.slice(-5));
                
                // 简单的预测模拟
                const lastPrice = prices[prices.length - 1];
                const averageChange = prices.slice(-5).reduce((acc, price, i) => {
                    if (i > 0) {
                        return acc + (price - prices[i - 1]);
                    }
                    return acc;
                }, 0) / 4;
                
                const predictedPrice = lastPrice + averageChange;
                console.log(`简单预测价格: ${predictedPrice.toFixed(2)}`);
                
            } else {
                console.error('未获取到K线数据');
            }
            
        } catch (error) {
            console.error(`获取${code}历史数据失败:`, error.message);
        }
    }
    
    console.log('\n=== 测试完成 ===');
}

testHistoricalData().catch(console.error);
