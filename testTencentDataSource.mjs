
import axios from 'axios';

async function testTencentDataSource() {
    console.log('开始测试腾讯数据源...');
    
    try {
        const response = await axios.get('https://web.ifzq.gtimg.cn/appstock/app/kline/kline?param=sh600519,day,2024-01-01,2024-12-31,640', {
            headers: {
                'Referer': 'https://finance.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });
        
        console.log('腾讯数据源连接成功!');
        console.log('响应状态:', response.status);
        console.log('响应数据类型:', typeof response.data);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('腾讯数据源连接失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testTencentDataSource();
