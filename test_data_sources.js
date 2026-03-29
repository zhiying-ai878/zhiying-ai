// 统计数据源数量和连接状态
import axios from 'axios';

// 定义所有数据源
const allDataSources = [
    'sina', 'tencent', 'eastmoney', 'xueqiu', 'ths', 'huatai', 'gtja', 'haitong', 
    'wind', 'choice', 'tushare', 'akshare', 'baostock', 'gugudata', 'stockapi', 
    'mairui', 'alltick', 'sanhulianghua', 'qveris', 'finnhub', 'netease', 
    'sina_backup', 'tencent_backup', 'eastmoney_backup', 'ths_backup', 'xueqiu_backup', 
    'eastmoney_mini', 'eastmoney_pro', 'futunn', 'tiger', 'eastmoney_mobile', 
    'sina_mobile', 'tencent_mobile', 'jrj', 'hexun', 'stcn', 'yicai', 'cnstock', 
    'financialnews', 'zqrb', 'cnstocknews', 'jrj_mobile', 'hexun_mobile', 
    'stcn_mobile', 'yicai_mobile'
];

console.log(`智盈AI系统总共有 ${allDataSources.length} 个数据源`);
console.log('数据源列表:', allDataSources);

// 测试主要数据源的连接状态
const mainDataSources = ['sina', 'tencent', 'eastmoney', 'xueqiu', 'ths'];

async function testDataSourceConnection() {
    console.log('\n=== 测试主要数据源连接状态 ===');
    
    const results = [];
    
    for (const source of mainDataSources) {
        try {
            let url;
            let headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            };
            
            switch (source) {
                case 'sina':
                    url = 'https://hq.sinajs.cn/list=sh600519';
                    headers['Referer'] = 'https://finance.sina.com.cn/';
                    break;
                case 'tencent':
                    url = 'https://qt.gtimg.cn/q=sh600519';
                    break;
                case 'eastmoney':
                    url = 'https://push2.eastmoney.com/api/qt/stock/get?secid=1.600519&fields=f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170';
                    break;
                case 'xueqiu':
                    url = 'https://xueqiu.com/service/v5/stock/screener/quote/list?symbol=SH600519&count=1&order_by=percent&order=desc';
                    break;
                case 'ths':
                    url = 'https://api.10jqka.com.cn/v1/quote/newest?codes=sh600519';
                    break;
                default:
                    continue;
            }
            
            const startTime = Date.now();
            const response = await axios.get(url, { headers, timeout: 5000 });
            const endTime = Date.now();
            
            results.push({
                name: source,
                status: '成功',
                statusCode: response.status,
                responseTime: endTime - startTime,
                dataLength: response.data ? response.data.length : 0
            });
            
            console.log(`✅ ${source}: 连接成功 (${response.status}) - 响应时间: ${endTime - startTime}ms`);
            
        } catch (error) {
            results.push({
                name: source,
                status: '失败',
                error: error.message || String(error)
            });
            
            console.log(`❌ ${source}: 连接失败 - ${error.message || String(error)}`);
        }
    }
    
    const successfulCount = results.filter(r => r.status === '成功').length;
    console.log(`\n可顺利连接的数据源: ${successfulCount}/${mainDataSources.length}`);
    
    return results;
}

testDataSourceConnection();
