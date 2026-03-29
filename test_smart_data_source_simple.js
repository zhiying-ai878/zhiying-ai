// 智能数据源管理器简单测试
import { smartDataRequest, getDataSourceStatus, getBestDataSourceRecommendation } from './smart_data_source_manager.js';

console.log('=== 智能数据源管理器测试 ===');

async function testSmartDataSource() {
    console.log('\n1. 获取数据源状态');
    const status = getDataSourceStatus();
    console.log('总数据源数量:', status.totalSources);
    console.log('健康数据源:', status.healthySources);
    console.log('不健康数据源:', status.unhealthySources);
    console.log('未知状态数据源:', status.unknownSources);
    
    console.log('\n2. 获取最佳数据源推荐');
    const recommendations = getBestDataSourceRecommendation();
    console.log('推荐的最佳数据源:', recommendations.slice(0, 5));
    
    console.log('\n3. 测试实时数据获取');
    const testCodes = ['600519']; // 贵州茅台
    
    try {
        console.log('\n正在尝试获取数据...');
        const startTime = Date.now();
        const results = await smartDataRequest(testCodes, 'realtime');
        const endTime = Date.now();
        
        console.log('获取结果:', results);
        console.log('成功获取数据数量:', results.length);
        console.log('耗时:', endTime - startTime, 'ms');
        
        if (results.length > 0) {
            console.log('获取的数据:', JSON.stringify(results[0], null, 2));
        }
        
    } catch (error) {
        console.error('获取数据失败:', error.message);
        console.error('错误详情:', error);
    }
}

// 运行测试
testSmartDataSource().catch(console.error);
