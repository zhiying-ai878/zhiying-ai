
import { getStockDataSource } from './src/utils/stockData.js';

async function debugRealtimeQuote() {
    console.log('=== 开始调试实时行情数据获取 ===');
    
    const stockDataSource = getStockDataSource();
    
    // 测试数据：带前缀和不带前缀的代码
    const testCodes = ['sh600519', 'sz000858', '600519', '000858'];
    
    console.log('测试代码:', testCodes);
    
    try {
        // 测试获取实时数据
        console.log('\n1. 测试getRealtimeQuote函数');
        const results = await stockDataSource.getRealtimeQuote(testCodes);
        console.log('获取到的数据:', JSON.stringify(results, null, 2));
        
        // 测试各个数据源
        console.log('\n2. 测试各个数据源');
        
        // 测试新浪数据源
        console.log('\n测试新浪数据源:');
        const sinaResults = await stockDataSource.getSinaRealtimeQuote(testCodes);
        console.log('新浪数据源结果:', JSON.stringify(sinaResults, null, 2));
        
        // 测试腾讯数据源
        console.log('\n测试腾讯数据源:');
        const tencentResults = await stockDataSource.getTencentRealtimeQuote(testCodes);
        console.log('腾讯数据源结果:', JSON.stringify(tencentResults, null, 2));
        
        // 测试东方财富数据源
        console.log('\n测试东方财富数据源:');
        const eastmoneyResults = await stockDataSource.getEastMoneyRealtimeQuote(testCodes);
        console.log('东方财富数据源结果:', JSON.stringify(eastmoneyResults, null, 2));
        
    } catch (error) {
        console.error('调试过程中发生错误:', error);
    }
    
    console.log('=== 调试完成 ===');
}

debugRealtimeQuote();
