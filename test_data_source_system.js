// 智盈AI数据源系统测试脚本
// 测试智能数据源管理器的功能和性能

import { smartDataRequest, getDataSourceStatus, getBestDataSourceRecommendation } from './smart_data_source_manager.js';
import { getRealtimeQuote } from './src/utils/stockData.js';

console.log('=== 智盈AI数据源系统测试 ===');

async function testSmartDataSource() {
    console.log('\n1. 测试智能数据源管理器状态');
    const status = getDataSourceStatus();
    console.log('数据源状态报告:', JSON.stringify(status, null, 2));
    
    console.log('\n2. 测试最佳数据源推荐');
    const recommendations = getBestDataSourceRecommendation();
    console.log('推荐的最佳数据源:', recommendations);
    
    console.log('\n3. 测试实时数据获取');
    const testCodes = ['600519', '000858', '300750']; // 贵州茅台、五粮液、宁德时代
    console.log('测试股票代码:', testCodes);
    
    try {
        console.log('\n使用智能数据源管理器获取数据...');
        const results1 = await smartDataRequest(testCodes, 'realtime');
        console.log('智能数据源管理器结果:', results1);
        console.log('成功获取数据数量:', results1.length);
        
        console.log('\n使用stockData.js获取数据...');
        const results2 = await getRealtimeQuote(testCodes);
        console.log('stockData.js结果:', results2);
        console.log('成功获取数据数量:', results2.length);
        
        console.log('\n4. 测试开盘时间段检测');
        const isTrading = checkTradingHours();
        console.log('当前是否为开盘时间段:', isTrading);
        
        console.log('\n=== 测试完成 ===');
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

function checkTradingHours() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const day = now.getDay();
    
    // 周一到周五的交易时间
    if (day >= 1 && day <= 5) {
        // 上午交易时间: 9:30 - 11:30
        if ((hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute < 30)) {
            return true;
        }
        // 下午交易时间: 13:00 - 15:00
        if ((hour === 13 || hour === 14) || (hour === 15 && minute === 0)) {
            return true;
        }
    }
    return false;
}

// 运行测试
testSmartDataSource().catch(console.error);