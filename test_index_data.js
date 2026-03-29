
import axios from 'axios';

async function testIndexData() {
    console.log('=== 测试指数数据获取 ===');
    
    const indexCodes = ['000001', '399001', '399006', '000688'];
    const indexNames = ['上证指数', '深证成指', '创业板指', '科创综指'];
    
    for (let i = 0; i < indexCodes.length; i++) {
        const code = indexCodes[i];
        const name = indexNames[i];
        const secid = code.startsWith('000') ? `1.${code}` : `0.${code}`;
        
        console.log(`\n测试${name}(${code})...`);
        
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
            
            console.log(`API响应状态: ${response.status}`);
            
            if (response.data && response.data.data) {
                const data = response.data.data;
                console.log(`${name}原始数据:`);
                console.log(`f43(当前价格): ${data.f43}`);
                console.log(`f46(开盘价): ${data.f46}`);
                console.log(`f44(最高价): ${data.f44}`);
                console.log(`f45(最低价): ${data.f45}`);
                console.log(`f60(收盘价): ${data.f60}`);
                console.log(`f169(涨跌额): ${data.f169}`);
                console.log(`f170(涨跌幅): ${data.f170}`);
                
                // 计算处理后的值
                const price = data.f43 / 100;
                const open = data.f46 / 100;
                const high = data.f44 / 100;
                const low = data.f45 / 100;
                const close = data.f60 / 100;
                const change = data.f169 ? data.f169 / 100 : price - close;
                const changePercent = data.f170 !== undefined ? data.f170 / 100 : ((price - close) / close) * 100;
                
                console.log(`\n处理后的数据:`);
                console.log(`价格: ${price.toFixed(2)}`);
                console.log(`开盘: ${open.toFixed(2)}`);
                console.log(`最高: ${high.toFixed(2)}`);
                console.log(`最低: ${low.toFixed(2)}`);
                console.log(`收盘: ${close.toFixed(2)}`);
                console.log(`涨跌额: ${change.toFixed(2)}`);
                console.log(`涨跌幅: ${changePercent.toFixed(2)}%`);
                
            } else {
                console.log(`未获取到${name}数据`);
            }
            
        } catch (error) {
            console.error(`获取${name}数据失败:`, error.message);
        }
    }
    
    console.log('\n=== 测试完成 ===');
}

testIndexData();
