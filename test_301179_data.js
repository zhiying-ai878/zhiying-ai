// 测试301179股票的数据处理逻辑
// 验证涨跌百分比计算是否正确

import axios from 'axios';

async function test301179Data() {
    console.log('=== 测试301179泽宇智能数据 ===\n');
    
    const code = '301179';
    const sinaCode = `sz${code}`;
    const tencentCode = `sz${code}`;
    
    try {
        // 测试东方财富API
        console.log('测试东方财富API...');
        const secid = `0.${code}`;
        const eastmoneyResponse = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
            params: {
                secid,
                fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
                _: Date.now().toString()
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });
        
        if (eastmoneyResponse.data && eastmoneyResponse.data.data) {
            const data = eastmoneyResponse.data.data;
            console.log('东方财富数据:');
            console.log(`  名称: ${data.f58}`);
            console.log(`  当前价格: ${(data.f43 / 100).toFixed(2)}`);
            console.log(`  昨日收盘: ${(data.f60 / 100).toFixed(2)}`);
            console.log(`  价格变动: ${(data.f169 / 100).toFixed(2)}`);
            console.log(`  原始f170值: ${data.f170}`);
            
            // 判断是否为指数
            const isIndex = code.startsWith('000') || code.startsWith('399');
            console.log(`  是否指数: ${isIndex}`);
            
            // 计算涨跌幅
            const changePercentValue = data.f170 !== undefined ? (isIndex ? data.f170 / 100 : data.f170) : ((data.f43 / 100 - data.f60 / 100) / (data.f60 / 100)) * 100;
            console.log(`  处理后的涨跌幅: ${changePercentValue >= 0 ? '+' : ''}${changePercentValue.toFixed(2)}%`);
            
            // 手动计算验证
            const manualCalculation = ((data.f43 / 100 - data.f60 / 100) / (data.f60 / 100)) * 100;
            console.log(`  手动计算涨跌幅: ${manualCalculation >= 0 ? '+' : ''}${manualCalculation.toFixed(2)}%`);
        }
        
        console.log('\n' + '-' .repeat(50) + '\n');
        
        // 测试新浪API
        console.log('测试新浪API...');
        const sinaResponse = await axios.get(`https://hq.sinajs.cn/list=${sinaCode}`, {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });
        
        if (sinaResponse.data && sinaResponse.data.includes('hq_str_')) {
            const lines = sinaResponse.data.split('\n');
            for (const line of lines) {
                if (!line) continue;
                
                const codeMatch = line.match(/hq_str_([^\s]+)=/);
                if (!codeMatch) continue;
                
                const match = line.match(/"([^"]+)"/);
                if (match) {
                    const values = match[1].split(',');
                    if (values.length >= 32) {
                        const price = parseFloat(values[1]);
                        const close = parseFloat(values[2]);
                        const change = price - close;
                        const changePercent = (change / close) * 100;
                        
                        console.log('新浪数据:');
                        console.log(`  名称: ${values[0]}`);
                        console.log(`  当前价格: ${price.toFixed(2)}`);
                        console.log(`  昨日收盘: ${close.toFixed(2)}`);
                        console.log(`  价格变动: ${change.toFixed(2)}`);
                        console.log(`  涨跌幅: ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`);
                    }
                }
            }
        }
        
        console.log('\n' + '-' .repeat(50) + '\n');
        
        // 测试腾讯API
        console.log('测试腾讯API...');
        const tencentResponse = await axios.get(`https://qt.gtimg.cn/q=${tencentCode}`, {
            headers: {
                'Referer': 'https://finance.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });
        
        if (tencentResponse.data && tencentResponse.data.includes('v_')) {
            const lines = tencentResponse.data.split('\n');
            for (const line of lines) {
                if (!line) continue;
                
                const match = line.match(/v_(\w+)="([^"]+)"/);
                if (match) {
                    const values = match[2].split('~');
                    if (values.length >= 30) {
                        const price = parseFloat(values[3]);
                        const close = parseFloat(values[4]);
                        const change = price - close;
                        const changePercent = (change / close) * 100;
                        
                        console.log('腾讯数据:');
                        console.log(`  名称: ${values[1]}`);
                        console.log(`  当前价格: ${price.toFixed(2)}`);
                        console.log(`  昨日收盘: ${close.toFixed(2)}`);
                        console.log(`  价格变动: ${change.toFixed(2)}`);
                        console.log(`  涨跌幅: ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`);
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
test301179Data().catch(error => {
    console.error('测试失败:', error);
});
