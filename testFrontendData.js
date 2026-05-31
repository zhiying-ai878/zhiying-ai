
// 测试前端实际获取的数据
import axios from 'axios';

// 模拟前端调用的getRealtimeQuote函数
async function testFrontendData() {
    console.log('=== 测试前端实际获取的数据 ===\n');
    
    const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    
    // 直接测试前端使用的getRealtimeQuote函数
    console.log('测试getRealtimeQuote函数...');
    
    try {
        // 导入stockData模块
        const { StockDataManager } = await import('./src/utils/stockData.js');
        const stockDataManager = new StockDataManager();
        
        const results = await stockDataManager.getRealtimeQuote(indexCodes);
        console.log('getRealtimeQuote返回结果:', JSON.stringify(results, null, 2));
        
        // 检查每个数据源的返回
        console.log('\n=== 检查各个数据源 ===');
        
        // 测试东方财富数据源
        console.log('\n1. 测试东方财富数据源:');
        const eastmoneyResults = await stockDataManager.getEastMoneyRealtimeQuote(indexCodes);
        console.log('东方财富返回:', eastmoneyResults);
        
        // 测试新浪数据源
        console.log('\n2. 测试新浪数据源:');
        const sinaResults = await stockDataManager.getSinaRealtimeQuote(indexCodes);
        console.log('新浪返回:', sinaResults);
        
        // 测试腾讯数据源
        console.log('\n3. 测试腾讯数据源:');
        const tencentResults = await stockDataManager.getTencentRealtimeQuote(indexCodes);
        console.log('腾讯返回:', tencentResults);
        
        // 测试数据质量验证
        console.log('\n=== 测试数据质量验证 ===');
        eastmoneyResults.forEach(item => {
            const isValid = stockDataManager.isValidStockQuote(item);
            console.log(`${item.code}: ${isValid ? '有效' : '无效'}`);
        });
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

// 运行测试
testFrontendData().catch(console.error);
