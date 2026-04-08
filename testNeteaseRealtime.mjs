
import axios from 'axios';

async function testNeteaseRealtime() {
    console.log('开始测试网易实时行情API...');
    
    try {
        const neteaseCodes = '0600519,13002594';
        const response = await axios.get(`https://api.money.126.net/data/feed/${neteaseCodes}`, {
            headers: {
                'Referer': 'https://quotes.money.163.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'zh-CN,zh;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 10000 // 增加超时时间
        });
        
        console.log('网易实时行情API连接成功!');
        console.log('响应状态:', response.status);
        console.log('响应数据:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('网易实时行情API连接失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testNeteaseRealtime();
