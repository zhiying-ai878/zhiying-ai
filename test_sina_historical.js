
// 测试新浪历史数据API
import axios from 'axios';

async function testSinaHistoricalData() {
    console.log('=== 测试新浪历史数据API ===');
    
    const stockCodes = ['002594', '600519'];
    
    for (const stockCode of stockCodes) {
        console.log(`\n测试股票代码: ${stockCode}`);
        
        try {
            const sinaCode = stockCode.startsWith('6') ? `sh${stockCode}` : `sz${stockCode}`;
            
            const response = await axios.get(`https://quotes.sina.cn/cn/api/jsonp_v2.php/QuotesService.getKLineData`, {
                params: {
                    symbol: sinaCode,
                    scale: 240, // 日线
                    ma: '5,10,20,30,60',
                    dkline: 1,
                    end: new Date().toISOString().split('T')[0]
                },
                headers: {
                    'Referer': 'https://finance.sina.com.cn/',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': '*/*',
                    'Accept-Language': 'zh-CN,zh;q=0.9',
                    'Connection': 'keep-alive'
                },
                timeout: 10000
            });
            
            console.log('API响应状态:', response.status);
            
            // 解析新浪的JSONP响应
            const jsonpMatch = response.data.match(/\((.*)\)/);
            if (jsonpMatch) {
                const data = JSON.parse(jsonpMatch[1]);
                if (data && data.result && data.result.data) {
                    const klineData = data.result.data;
                    console.log(`成功获取 ${klineData.length} 条历史数据`);
                    console.log('最新5条数据:');
                    klineData.slice(-5).forEach((item, index) => {
                        console.log(`${index + 1}. ${item.day}: 开=${item.open}, 收=${item.close}, 高=${item.high}, 低=${item.low}`);
                    });
                } else {
                    console.log('未获取到数据:', data);
                }
            } else {
                console.log('无法解析JSONP响应');
            }
            
        } catch (error) {
            console.error(`获取历史数据失败:`, error.message);
            console.error('错误详情:', error);
        }
    }
    
    console.log('\n=== 测试完成 ===');
}

testSinaHistoricalData();
