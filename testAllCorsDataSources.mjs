
import axios from 'axios';

async function testCorsDataSources() {
    console.log('开始测试所有CORS数据源...');
    
    const dataSources = [
        {
            name: '新浪CORS',
            url: 'https://hq.sinajs.cn/list=sh600519,sz002594',
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            }
        },
        {
            name: '腾讯CORS',
            url: 'https://web.ifzq.gtimg.cn/appstock/app/kline/kline?param=sh600519,day,2024-01-01,2024-12-31,640',
            headers: {
                'Referer': 'https://finance.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            }
        },
        {
            name: '网易CORS',
            url: 'https://api.money.126.net/data/feed/0600519,13002594',
            headers: {
                'Referer': 'https://quotes.money.163.com/',
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
                headers: source.headers,
                timeout: 5000
            });
            
            console.log(`${source.name} 数据源连接成功!`);
            console.log('响应状态:', response.status);
            console.log('响应数据:', response.data.substring(0, 200) + '...');
            
        } catch (error) {
            console.error(`${source.name} 数据源连接失败:`, error.message);
            if (error.response) {
                console.error('响应状态:', error.response.status);
                console.error('响应数据:', error.response.data);
            }
        }
    }
}

testCorsDataSources();
