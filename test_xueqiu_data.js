import axios from 'axios';

async function testXueQiuData() {
    console.log('测试雪球数据源数据...');
    
    try {
        // 测试雪球API
        const response = await axios.get('https://xueqiu.com/statuses/search.json', {
            params: {
                q: '贵州茅台',
                count: 3,
                page: 1,
                _: Date.now()
            },
            headers: {
                'Referer': 'https://xueqiu.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        console.log('雪球响应状态:', response.status);
        console.log('雪球响应数据:', JSON.stringify(response.data, null, 2));
        
    } catch (error) {
        console.error('雪球API失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testXueQiuData();