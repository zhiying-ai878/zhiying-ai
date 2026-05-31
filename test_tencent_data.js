import axios from 'axios';

async function testTencentData() {
    console.log('测试腾讯数据源数据...');
    
    try {
        // 测试腾讯实时行情API
        const response = await axios.get('https://web.ifzq.gtimg.cn/appstock/app/kline/kline?param=sh000001,day,1,1&param=sz399001,day,1,1&param=sz399006,day,1,1&param=sh600519,day,1,1&param=sz002594,day,1,1', {
            headers: {
                'Referer': 'https://stock.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        console.log('腾讯响应状态:', response.status);
        console.log('腾讯响应数据:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('腾讯API失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testTencentData();