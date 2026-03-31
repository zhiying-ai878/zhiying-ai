// 测试新浪财经API
import axios from 'axios';

async function testSinaAPI() {
    console.log('=== 测试新浪财经API ===');
    
    try {
        const sinaCode = 'sh600519'; // 贵州茅台
        const url = 'https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getStockTick';
        const params = {
            symbol: sinaCode
        };
        
        const headers = {
            'Referer': 'https://finance.sina.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            'Connection': 'keep-alive'
        };
        
        console.log('正在请求新浪API...');
        const startTime = Date.now();
        const response = await axios.get(url, { params, headers, timeout: 10000 });
        const endTime = Date.now();
        
        console.log('请求耗时:', endTime - startTime, 'ms');
        console.log('响应状态:', response.status);
        console.log('响应数据:', response.data);
        
        if (response.data && Array.isArray(response.data)) {
            console.log('成功获取数据，数量:', response.data.length);
            if (response.data.length > 0) {
                console.log('第一条数据:', response.data[0]);
            }
        } else {
            console.log('获取的数据格式不正确');
        }
        
    } catch (error) {
        console.error('请求失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        } else if (error.request) {
            console.error('请求发送但没有收到响应');
        } else {
            console.error('请求配置错误:', error.config);
        }
    }
}

// 运行测试
testSinaAPI().catch(console.error);
