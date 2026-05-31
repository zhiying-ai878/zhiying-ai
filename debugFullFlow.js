
// 全面调试脚本：检查整个数据流程
import { getStockDataSource, getRealtimeQuote } from './src/utils/stockData.js';

async function debugFullFlow() {
    console.log('=== 开始全面调试数据流程 ===');
    
    // 测试代码：带前缀的代码
    const testCodes = ['sh600519', 'sz000858'];
    console.log('测试代码:', testCodes);
    
    try {
        // 测试1：直接调用getStockDataSource().getRealtimeQuote
        console.log('\n1. 测试直接调用StockDataSource.getRealtimeQuote');
        const stockDataSource = getStockDataSource();
        const results1 = await stockDataSource.getRealtimeQuote(testCodes);
        console.log('直接调用结果:', JSON.stringify(results1, null, 2));
        
        // 测试2：调用导出的getRealtimeQuote函数
        console.log('\n2. 测试调用导出的getRealtimeQuote函数');
        const results2 = await getRealtimeQuote(testCodes);
        console.log('导出函数调用结果:', JSON.stringify(results2, null, 2));
        
        // 测试3：检查代码格式匹配逻辑
        console.log('\n3. 测试代码格式匹配逻辑');
        if (results2 && results2.length > 0) {
            const resultMap = new Map(results2.map(r => [r.code, r]));
            console.log('ResultMap内容:');
            resultMap.forEach((value, key) => {
                console.log(`  ${key}: ${JSON.stringify(value)}`);
            });
            
            // 模拟Dashboard中的匹配逻辑
            const updatedStocks = testCodes.map(code => {
                const cleanCode = code.startsWith('sh') || code.startsWith('sz') ? code.substring(2) : code;
                const result = resultMap.get(cleanCode);
                console.log(`  匹配代码: ${code} -> cleanCode: ${cleanCode}, 找到结果: ${result ? '是' : '否'}`);
                return result ? {
                    code: code,
                    name: result.name,
                    price: result.price,
                    change: result.change,
                    changePercent: result.changePercent
                } : { code, name: '未知', price: 0, change: 0, changePercent: 0 };
            });
            
            console.log('匹配后的结果:', JSON.stringify(updatedStocks, null, 2));
        }
        
    } catch (error) {
        console.error('调试过程中发生错误:', error);
        console.error('错误堆栈:', error.stack);
    }
    
    console.log('=== 调试完成 ===');
}

debugFullFlow();
