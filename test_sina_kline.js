
import axios from 'axios';

async function testSinaKLineData() {
    console.log('测试新浪K线数据获取...');
    
    const stockCode = '300730';
    const sinaCode = `sz${stockCode}`;
    
    console.log(`股票代码: ${stockCode}, 新浪代码: ${sinaCode}`);
    
    try {
        const response = await axios.get(`https://quotes.sina.cn/cn/api/jsonp_v2.php/QuotesService.getKLineData`, {
            params: {
                symbol: sinaCode,
                scale: 240, // 日线
                data: 'day',
                dnt: '1633041600'
            },
            headers: {
                'Referer': 'https://finance.sina.com.cn/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 5000
        });
        
        console.log('API响应状态:', response.status);
        console.log('响应数据:', response.data);
        
        // 解析JSONP响应
        const jsonpMatch = response.data.match(/\((.*)\)/);
        if (jsonpMatch) {
            try {
                const data = JSON.parse(jsonpMatch[1]);
                console.log('解析后的数据:', JSON.stringify(data, null, 2));
                
                if (data && data.result && data.result.data) {
                    console.log(`成功获取到${data.result.data.length}条K线数据`);
                } else {
                    console.error('未获取到K线数据');
                }
            } catch (parseError) {
                console.error('JSON解析失败:', parseError.message);
            }
        } else {
            console.error('无法解析JSONP响应');
        }
        
    } catch (error) {
        console.error('获取新浪K线数据失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

testSinaKLineData();
