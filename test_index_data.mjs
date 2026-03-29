import axios from 'axios';

// 测试指数数据获取
async function testIndexData() {
    console.log('=== 测试指数数据获取 ===');
    
    // 测试腾讯数据源
    try {
        console.log('\n1. 测试腾讯财经数据源:');
        const tencentCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'].join(',');
        const tencentResponse = await axios.get(`https://qt.gtimg.cn/q=${tencentCodes}`, {
            headers: {
                'Referer': 'https://finance.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 3000
        });
        
        console.log('腾讯API响应:', tencentResponse.data);
        
        const lines = tencentResponse.data.split('\n');
        for (const line of lines) {
            if (!line) continue;
            const match = line.match(/v_(\w+)="([^"]+)"/);
            if (match) {
                const tencentCode = match[1];
                const values = match[2].split('~');
                if (values.length >= 30) {
                    console.log(`\n指数 ${tencentCode}:`);
                    console.log(`名称: ${values[1]}`);
                    console.log(`当前价格: ${values[3]}`);
                    console.log(`涨跌幅: ${values[32]}`);
                    console.log(`成交量: ${values[6]}`);
                }
            }
        }
    } catch (error) {
        console.error('腾讯数据源失败:', error.message);
    }
    
    // 测试新浪数据源
    try {
        console.log('\n2. 测试新浪财经数据源:');
        const sinaCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'].join(',');
        const sinaResponse = await axios.get(`https://hq.sinajs.cn/list=${sinaCodes}`, {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 3000
        });
        
        console.log('新浪API响应:', sinaResponse.data);
        
        const lines = sinaResponse.data.split('\n');
        for (const line of lines) {
            if (!line) continue;
            const codeMatch = line.match(/hq_str_([^\s]+)=/);
            if (codeMatch) {
                const sinaCode = codeMatch[1];
                const match = line.match(/"([^"]+)"/);
                if (match) {
                    const values = match[1].split(',');
                    if (values.length >= 32) {
                        console.log(`\n指数 ${sinaCode}:`);
                        console.log(`名称: ${values[0]}`);
                        console.log(`当前价格: ${values[1]}`);
                        console.log(`涨跌幅: ${((parseFloat(values[1]) - parseFloat(values[2])) / parseFloat(values[2]) * 100).toFixed(2)}%`);
                        console.log(`成交量: ${values[8]}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('新浪数据源失败:', error.message);
    }
    
    // 测试东方财富数据源
    try {
        console.log('\n3. 测试东方财富数据源:');
        const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
        
        for (const code of indexCodes) {
            let secid;
            if (code.startsWith('sh')) {
                secid = `1.${code.substring(2)}`;
            } else if (code.startsWith('sz')) {
                secid = `0.${code.substring(2)}`;
            }
            
            try {
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
                
                console.log(`\n指数 ${code} 响应:`);
                console.log(response.data);
                
                if (response.data && response.data.data) {
                    const data = response.data.data;
                    console.log(`名称: ${data.f58}`);
                    console.log(`当前价格: ${data.f43}`);
                    console.log(`涨跌幅: ${data.f44}%`);
                    console.log(`成交量: ${data.f51}`);
                }
            } catch (err) {
                console.error(`东方财富获取${code}失败:`, err.message);
            }
        }
    } catch (error) {
        console.error('东方财富数据源失败:', error.message);
    }
}

// 运行测试
testIndexData().catch(console.error);
