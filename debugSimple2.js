
// 最简单的测试脚本
import { getRealtimeQuote } from './src/utils/stockData.js';

async function testSimple() {
    console.log('=== 测试getRealtimeQuote函数 ===');
    
    try {
        const testCodes = ['sh600519', 'sz000858'];
        console.log('请求代码:', testCodes);
        
        const results = await getRealtimeQuote(testCodes);
        console.log('返回结果数量:', results.length);
        console.log('返回的数据:', JSON.stringify(results, null, 2));
        
        if (results.length > 0) {
            console.log('\n第一个股票数据:');
            console.log('代码:', results[0].code);
            console.log('名称:', results[0].name);
            console.log('价格:', results[0].price);
            console.log('涨跌幅:', results[0].changePercent);
        }
        
    } catch (error) {
        console.error('测试失败:', error.message);
    }
}

testSimple();
