
// 测试前端实际使用的getRealtimeQuote函数
import { getRealtimeQuote } from './src/utils/stockData.js';

async function testFrontendFunction() {
    console.log('=== 测试前端实际使用的getRealtimeQuote函数 ===\n');
    
    const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    
    try {
        console.log('调用getRealtimeQuote函数...');
        const results = await getRealtimeQuote(indexCodes);
        console.log('getRealtimeQuote返回结果:', JSON.stringify(results, null, 2));
        
        // 检查每个结果
        console.log('\n=== 检查每个结果 ===');
        results.forEach(item => {
            console.log(`${item.code} (${item.name}): ${item.price} (${item.change}, ${item.changePercent}%)`);
        });
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
testFrontendFunction().catch(console.error);
