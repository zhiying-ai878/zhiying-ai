
import axios from 'axios';

async function testTencentRealtime() {
    console.log('开始测试腾讯实时行情API...');
    
    try {
        const tencentCodes = 'sh600519,sz002594';
        const response = await axios.get(`https://qt.gtimg.cn/q=${tencentCodes}`, {
            headers: {
                'Referer': 'https://finance.qq.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 5000
        });
        
        console.log('腾讯实时行情API连接成功!');
        console.log('响应状态:', response.status);
        console.log('响应数据:', response.data);
        
    } catch (error) {
        console.error('腾讯实时行情API连接失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testTencentRealtime();
