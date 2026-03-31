
import { smartDataRequest } from './smart_data_source_manager.js';

async function testCodeMapping() {
    console.log('=== 测试代码映射问题 ===');
    
    // 模拟前端存储的代码（没有前缀）
    const storedCodes = ['300389', '300480'];
    console.log('存储的代码:', storedCodes);
    
    // 模拟前端调用getRealtimeQuote
    const results = await smartDataRequest(storedCodes, 'realtime');
    console.log('获取到的数据:', JSON.stringify(results, null, 2));
    
    // 检查数据映射
    console.log('\n数据映射检查:');
    storedCodes.forEach(storedCode => {
        const matchedData = results.find(r => {
            // 检查是否匹配（带前缀的代码）
            return r.code === `sz${storedCode}` || r.code === `sh${storedCode}`;
        });
        
        if (matchedData) {
            console.log(`代码 ${storedCode} 匹配到数据: ${matchedData.name}(${matchedData.code}) - ${matchedData.price}元`);
        } else {
            console.log(`代码 ${storedCode} 未找到匹配数据`);
        }
    });
    
    // 测试Dashboard中的映射逻辑
    console.log('\n模拟Dashboard映射逻辑:');
    const resultMap = new Map(results.map(r => [r.code, r]));
    console.log('Result map keys:', Array.from(resultMap.keys()));
    
    const updatedStocks = storedCodes.map(storedCode => {
        const fullCode = storedCode.startsWith('6') ? `sh${storedCode}` : `sz${storedCode}`;
        const result = resultMap.get(fullCode);
        return result ? {
            code: result.code,
            name: result.name,
            price: result.price,
            change: result.change,
            changePercent: result.changePercent
        } : {
            code: storedCode,
            name: '未知',
            price: 0,
            change: 0,
            changePercent: 0
        };
    });
    
    console.log('更新后的股票数据:', JSON.stringify(updatedStocks, null, 2));
}

testCodeMapping();
