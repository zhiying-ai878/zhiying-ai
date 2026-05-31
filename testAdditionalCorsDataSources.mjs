
import axios from 'axios';

async function testAdditionalCorsDataSources() {
    console.log('开始测试更多数据源的CORS支持...');
    
    const dataSources = [
        {
            name: '雪球',
            url: 'https://xueqiu.com/service/v5/stock/screener/quote/list',
            params: {
                symbol: 'SH600519',
                count: 1,
                order_by: 'percent',
                order: 'desc'
            },
            headers: {
                'Referer': 'https://xueqiu.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            }
        },
        {
            name: '同花顺',
            url: 'https://api.10jqka.com.cn/v1/quote/newest',
            params: {
                codes: 'sh600519'
            },
            headers: {
                'Referer': 'https://www.10jqka.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            }
        },
        {
            name: '金融界',
            url: 'https://api.jrj.com.cn/quote/stockdetail',
            params: {
                stockcode: '600519'
            },
            headers: {
                'Referer': 'https://stock.jrj.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            }
        },
        {
            name: '和讯',
            url: 'https://stockdata.stock.hexun.com/zrb/ggdx/',
            params: {
                stockid: '600519'
            },
            headers: {
                'Referer': 'https://stockdata.stock.hexun.com/',
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

testAdditionalCorsDataSources();
