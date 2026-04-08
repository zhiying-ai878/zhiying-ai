
import axios from 'axios';

async function testAlternativeDataSources() {
    console.log('开始测试备选数据源...');
    
    const dataSources = [
        {
            name: 'StockAPI',
            url: 'https://api.stockapi.com/v1/quote',
            params: {
                symbols: '600519.SS'
            },
            headers: {
                'Referer': 'https://stockapi.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            }
        },
        {
            name: '迈瑞数据',
            url: 'https://api.mairui.club/v1/quote',
            params: {
                symbols: '600519'
            },
            headers: {
                'Referer': 'https://www.mairui.club/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            }
        },
        {
            name: '腾讯行情接口2',
            url: 'https://web.ifzq.gtimg.cn/appstock/app/kline/kline',
            params: {
                param: 'sh600519,day,2024-01-01,2024-12-31,640'
            },
            headers: {
                'Referer': 'https://finance.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
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
            console.log('响应数据类型:', typeof response.data);
            if (typeof response.data === 'object') {
                console.log('响应数据:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
            } else {
                console.log('响应数据:', response.data.substring(0, 500) + '...');
            }
            
        } catch (error) {
            console.error(`${source.name} 数据源连接失败:`, error.message);
            if (error.response) {
                console.error('响应状态:', error.response.status);
                console.error('响应数据:', error.response.data);
            }
        }
    }
}

testAlternativeDataSources();
