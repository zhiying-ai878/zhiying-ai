
// 简单测试优化后的K线数据获取功能
import axios from 'axios';

async function testOptimizedKLine() {
    console.log('=== 测试优化后的K线数据获取 ===');
    
    const stockCode = '300730';
    
    // 测试优化后的东方财富API
    console.log(`\n测试股票${stockCode}的K线数据获取...`);
    
    try {
        const secid = stockCode.startsWith('6') ? `1.${stockCode}` : `0.${stockCode}`;
        
        const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
            params: {
                secid,
                klt: 101,
                fqt: 0,
                lmt: 100,
                fields1: 'f1,f2,f3,f4,f5,f6',
                fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
                _: Date.now()
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });
        
        console.log('东方财富API响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data && response.data.data.klines) {
            console.log(`✓ 成功获取${response.data.data.klines.length}条K线数据`);
            
            // 显示前3条数据
            console.log('\n前3条K线数据:');
            response.data.data.klines.slice(0, 3).forEach((kline, index) => {
                const values = kline.split(',');
                if (values.length >= 6) {
                    console.log(`${index + 1}. 日期: ${values[0]}, 开盘: ${(parseFloat(values[1]) / 100).toFixed(2)}, 最高: ${(parseFloat(values[2]) / 100).toFixed(2)}, 最低: ${(parseFloat(values[3]) / 100).toFixed(2)}, 收盘: ${(parseFloat(values[4]) / 100).toFixed(2)}`);
                }
            });
            
        } else {
            console.log('✗ 未获取到K线数据');
        }
        
    } catch (error) {
        console.error('获取K线数据失败:', error.message);
    }
    
    console.log('\n=== 测试完成 ===');
}

testOptimizedKLine();
