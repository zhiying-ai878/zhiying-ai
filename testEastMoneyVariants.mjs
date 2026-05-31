
import axios from 'axios';

async function testEastMoneyVariants() {
    console.log('开始测试东方财富各种变体数据源...');
    
    const dataSources = [
        {
            name: '东方财富mini',
            url: 'https://push2.eastmoney.com/api/qt/stock/get',
            params: {
                secid: '1.600519',
                fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
                fields2: 'f51,f52,f53,f54,f55,f56,f57,f58'
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            }
        },
        {
            name: '东方财富pro',
            url: 'https://push2.eastmoney.com/api/qt/stock/get',
            params: {
                secid: '1.600519',
                fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13,f14',
                fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61'
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            }
        },
        {
            name: '东方财富mobile',
            url: 'https://push2.eastmoney.com/api/qt/stock/get',
            params: {
                secid: '1.600519',
                fields1: 'f1,f2,f3,f4,f5,f6',
                fields2: 'f51,f52,f53,f54,f55,f56'
            },
            headers: {
                'Referer': 'https://m.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            }
        }
    ];
    
    for (const source of dataSources) {
        console.log(`\n测试 ${source.name} 数据源...`);
        try {
            const response = await axios.get(source.url, {
                params: source.params,
                headers: source.headers,
                timeout: 5000
            });
            
            console.log(`${source.name} 数据源连接成功!`);
            console.log('响应状态:', response.status);
            console.log('响应数据:', JSON.stringify(response.data, null, 2));
            
        } catch (error) {
            console.error(`${source.name} 数据源连接失败:`, error.message);
            if (error.response) {
                console.error('响应状态:', error.response.status);
                console.error('响应数据:', error.response.data);
            }
        }
    }
}

testEastMoneyVariants();
