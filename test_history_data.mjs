import axios from 'axios';

// 测试历史数据获取
async function testHistoricalData() {
    console.log('=== 测试历史数据获取 ===');
    
    // 测试股票代码
    const stockCode = '300480'; // 自选股中显示的股票
    const cleanCode = stockCode; // 去掉前缀
    const marketCode = cleanCode.startsWith('6') ? '1' : '0';
    const secid = `${marketCode}.${cleanCode}`;
    
    try {
        console.log(`获取股票 ${stockCode} 的历史数据...`);
        console.log(`处理后的代码: ${secid}`);
        
        const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
            params: {
                secid,
                klt: 101, // 日线
                fqt: 1, // 前复权
                end: Date.now(),
                lmt: 100
            },
            headers: {
                'Referer': 'https://quote.eastmoney.com/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        console.log('API响应状态:', response.status);
        console.log('API响应数据:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data && response.data.data.kline) {
            const klines = response.data.data.kline;
            console.log(`成功获取 ${klines.length} 条历史数据`);
            console.log('前5条数据:', klines.slice(0, 5));
        } else {
            console.error('未获取到历史数据');
        }
        
    } catch (error) {
        console.error('获取历史数据失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应数据:', error.response.data);
        }
    }
}

// 测试自选股存储
function testWatchlistStorage() {
    console.log('\n=== 测试自选股存储 ===');
    
    // 模拟存储操作
    const testStocks = [
        { code: '300480', name: '溢多利', price: 14.24, change: 1.36, changePercent: 10.56 },
        { code: '300730', name: '科创信息', price: 14.16, change: 1.28, changePercent: 9.94 }
    ];
    
    console.log('测试股票列表:', testStocks);
    
    // 模拟删除操作
    const codeToRemove = '300480';
    const filtered = testStocks.filter(item => item.code !== codeToRemove);
    console.log(`删除 ${codeToRemove} 后:`, filtered);
    
    // 验证本地存储
    try {
        const watchlist = localStorage.getItem('watchlist');
        console.log('本地存储中的自选股:', watchlist ? JSON.parse(atob(watchlist)) : '无数据');
    } catch (error) {
        console.error('读取本地存储失败:', error.message);
    }
}

// 运行测试
async function runTests() {
    await testHistoricalData();
    testWatchlistStorage();
}

runTests().catch(console.error);
