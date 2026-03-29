
// 测试代码格式匹配问题
import { getStockDataSource } from './src/utils/stockData.js';

async function debugMatching() {
    console.log('=== 测试代码格式匹配问题 ===');
    
    const stockDataSource = getStockDataSource();
    
    // 模拟新浪API返回的数据格式
    const mockResults = [
        {
            code: '600519',  // 不带前缀
            name: '贵州茅台',
            price: 1400.00,
            change: -1.18,
            changePercent: -0.08
        },
        {
            code: '000858',  // 不带前缀
            name: '五粮液',
            price: 100.50,
            change: -0.78,
            changePercent: -0.77
        }
    ];
    
    console.log('数据源返回的数据:', JSON.stringify(mockResults, null, 2));
    
    // Dashboard中的股票代码（带前缀）
    const dashboardStocks = [
        { code: 'sh600519', name: '贵州茅台', price: 0, change: 0, changePercent: 0 },
        { code: 'sz000858', name: '五粮液', price: 0, change: 0, changePercent: 0 }
    ];
    
    console.log('Dashboard中的股票代码:', JSON.stringify(dashboardStocks, null, 2));
    
    // 创建代码映射
    const resultMap = new Map(mockResults.map(r => [r.code, r]));
    console.log('ResultMap内容:');
    resultMap.forEach((value, key) => {
        console.log(`  ${key}: ${JSON.stringify(value)}`);
    });
    
    // 模拟Dashboard中的匹配逻辑
    const updatedStocks = dashboardStocks.map(stock => {
        // 移除stock.code的sh/sz前缀进行匹配
        const cleanCode = stock.code.startsWith('sh') || stock.code.startsWith('sz') ? stock.code.substring(2) : stock.code;
        const result = resultMap.get(cleanCode);
        console.log(`  匹配: ${stock.code} -> cleanCode: ${cleanCode}, 找到结果: ${result ? '是' : '否'}`);
        
        return result ? {
            code: stock.code, // 保持原始代码格式（带前缀）
            name: result.name,
            price: result.price,
            change: result.change,
            changePercent: result.changePercent
        } : stock;
    });
    
    console.log('匹配后的结果:', JSON.stringify(updatedStocks, null, 2));
    
    // 测试实际的API调用
    console.log('\n=== 测试实际API调用 ===');
    try {
        const testCodes = ['sh600519', 'sz000858'];
        const results = await stockDataSource.getRealtimeQuote(testCodes);
        console.log('实际API返回:', JSON.stringify(results, null, 2));
        
        if (results.length > 0) {
            const actualResultMap = new Map(results.map(r => [r.code, r]));
            console.log('实际ResultMap内容:');
            actualResultMap.forEach((value, key) => {
                console.log(`  ${key}: ${JSON.stringify(value)}`);
            });
            
            const actualUpdatedStocks = dashboardStocks.map(stock => {
                const cleanCode = stock.code.startsWith('sh') || stock.code.startsWith('sz') ? stock.code.substring(2) : stock.code;
                const result = actualResultMap.get(cleanCode);
                console.log(`  实际匹配: ${stock.code} -> cleanCode: ${cleanCode}, 找到结果: ${result ? '是' : '否'}`);
                
                return result ? {
                    code: stock.code,
                    name: result.name,
                    price: result.price,
                    change: result.change,
                    changePercent: result.changePercent
                } : stock;
            });
            
            console.log('实际匹配后的结果:', JSON.stringify(actualUpdatedStocks, null, 2));
        }
    } catch (error) {
        console.error('API调用失败:', error.message);
    }
}

debugMatching();
