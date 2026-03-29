
import { smartDataRequest } from './smart_data_source_manager.js';

// 模拟Dashboard中的数据更新逻辑
async function testDashboardUpdate() {
    console.log('=== 测试Dashboard数据更新逻辑 ===');
    
    // 模拟前端存储的自选股数据（没有前缀）
    let stocks = [
        { code: '300389', name: '艾比森', price: 0, change: 0, changePercent: 0 },
        { code: '300480', name: '光力科技', price: 0, change: 0, changePercent: 0 }
    ];
    
    console.log('初始自选股数据:', JSON.stringify(stocks, null, 2));
    
    // 模拟updateRealtimeData函数
    const codes = stocks.map(stock => stock.code);
    console.log('自选股代码:', codes);
    
    // 调用getRealtimeQuote
    const results = await smartDataRequest(codes, 'realtime');
    console.log('获取到的数据:', JSON.stringify(results, null, 2));
    
    if (results && results.length > 0) {
        console.log('成功获取到', results.length, '个自选股数据');
        
        // 创建代码到数据的映射
        const resultMap = new Map(results.map(r => [r.code, r]));
        console.log('Result map keys:', Array.from(resultMap.keys()));
        
        // 更新自选股数据
        const updatedStocks = stocks.map(stock => {
            // 格式化代码（添加sh/sz前缀）
            const fullCode = stock.code.startsWith('6') ? `sh${stock.code}` : `sz${stock.code}`;
            const result = resultMap.get(fullCode);
            
            console.log(`匹配代码: ${stock.code} -> ${fullCode}, 找到数据: ${!!result}`);
            
            return result ? {
                code: result.code,  // 使用带前缀的代码
                name: result.name,
                price: result.price,
                change: result.change,
                changePercent: result.changePercent
            } : stock;
        });
        
        console.log('更新后的自选股数据:', JSON.stringify(updatedStocks, null, 2));
        
        // 检查更新是否成功
        const hasZeroPrice = updatedStocks.some(stock => stock.price === 0);
        console.log('是否还有价格为0的股票:', hasZeroPrice);
        
        if (!hasZeroPrice) {
            console.log('✅ 所有股票数据都已成功更新！');
        } else {
            console.log('❌ 部分股票数据更新失败！');
        }
        
    } else {
        console.warn('未获取到自选股数据');
    }
}

testDashboardUpdate();
