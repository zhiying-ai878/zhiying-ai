import axios from 'axios';

async function testSinaIndexData() {
    console.log('测试新浪指数数据API...');
    
    try {
        // 新浪指数API
        const response = await axios.get('https://hq.sinajs.cn/list=sh000001,sz399001,sz399006', {
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        console.log('新浪响应状态:', response.status);
        console.log('新浪响应数据:', response.data);
        
        // 解析新浪数据
        const lines = response.data.split('\n');
        lines.forEach(line => {
            if (line.includes('var hq_str_')) {
                const parts = line.split('=');
                const code = parts[0].replace('var hq_str_', '').trim();
                const data = parts[1].replace(/"/g, '').split(',');
                
                if (data.length >= 4) {
                    const name = data[0];
                    const price = data[3];
                    const change = data[4];
                    const changePercent = data[5];
                    
                    console.log(`新浪指数${code}: ${name} - 当前价: ${price}, 涨跌额: ${change}, 涨跌幅: ${changePercent}%`);
                }
            }
        });
        
    } catch (error) {
        console.error('新浪指数API失败:', error.message);
    }
}

async function testTencentIndexData() {
    console.log('\n测试腾讯指数数据API...');
    
    try {
        // 腾讯指数API
        const response = await axios.get('https://web.ifzq.gtimg.cn/appstock/app/kline/kline?param=sh000001,day,1,320&param=sz399001,day,1,320&param=sz399006,day,1,320', {
            headers: {
                'Referer': 'https://stock.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        console.log('腾讯响应状态:', response.status);
        console.log('腾讯响应数据:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('腾讯指数API失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

async function testTencentRealtimeIndex() {
    console.log('\n测试腾讯实时指数数据API...');
    
    try {
        // 腾讯实时行情API
        const response = await axios.get('https://web.ifzq.gtimg.cn/appstock/app/kline/kline?param=sh000001,day,1,1&param=sz399001,day,1,1&param=sz399006,day,1,1', {
            headers: {
                'Referer': 'https://stock.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        console.log('腾讯实时响应状态:', response.status);
        console.log('腾讯实时响应数据:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('腾讯实时指数API失败:', error.message);
    }
}

async function testAll() {
    await testSinaIndexData();
    await testTencentIndexData();
    await testTencentRealtimeIndex();
}

testAll();