
import { smartDataRequest } from './smart_data_source_manager.js';

async function testRealtime300730() {
    console.log('=== 测试股票300730实时数据获取 ===');
    
    const stockCode = '300730';
    
    try {
        // 测试带前缀的代码
        const formattedCode = stockCode.startsWith('6') ? `sh${stockCode}` : `sz${stockCode}`;
        console.log(`测试代码: ${stockCode} -> ${formattedCode}`);
        
        const results = await smartDataRequest([formattedCode], 'realtime');
        console.log('获取到的实时数据:', JSON.stringify(results, null, 2));
        
        if (results && results.length > 0) {
            console.log('成功获取到实时数据');
            results.forEach(stock => {
                console.log(`${stock.name}(${stock.code}): ${stock.price}元, 涨${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`);
            });
        } else {
            console.log('未获取到实时数据');
            
            // 测试不带前缀的代码
            console.log('\n测试不带前缀的代码...');
            const results2 = await smartDataRequest([stockCode], 'realtime');
            console.log('获取到的实时数据:', JSON.stringify(results2, null, 2));
            
            if (results2 && results2.length > 0) {
                console.log('成功获取到实时数据');
                results2.forEach(stock => {
                    console.log(`${stock.name}(${stock.code}): ${stock.price}元, 涨${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)} (${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`);
                });
            } else {
                console.log('未获取到实时数据');
            }
        }
        
    } catch (error) {
        console.error('获取实时数据失败:', error);
    }
    
    console.log('\n=== 测试完成 ===');
}

testRealtime300730();
