
import { getStockDataSource } from './src/utils/stockData.js';

// 创建数据源实例
const dataSource = getStockDataSource('eastmoney');

// 测试股票代码
const testCodes = ['600519', '000001', '002594', '300059'];

async function testAllDataSources() {
    console.log('=== 开始测试所有数据源 ===');
    
    // 获取所有数据源列表
    const allSources = Array.from(dataSource.healthStatus.keys());
    console.log(`发现 ${allSources.length} 个数据源:`);
    console.log(allSources);
    
    // 测试每个数据源
    const results = [];
    
    for (const source of allSources) {
        console.log(`\n--- 测试数据源: ${source} ---`);
        try {
            // 设置当前数据源
            dataSource.setSourceType(source);
            
            // 测试数据源连接
            const testResult = await dataSource.testDataSource(source);
            console.log(`测试结果: ${testResult.success ? '✓ 成功' : '✗ 失败'} - ${testResult.message}`);
            
            results.push({
                source,
                success: testResult.success,
                message: testResult.message,
                responseTime: testResult.responseTime
            });
            
        } catch (error) {
            console.log(`测试失败: ${error.message}`);
            results.push({
                source,
                success: false,
                message: error.message
            });
        }
    }
    
    // 统计测试结果
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    console.log(`\n=== 测试结果统计 ===`);
    console.log(`总数据源数: ${totalCount}`);
    console.log(`成功: ${successCount}`);
    console.log(`失败: ${totalCount - successCount}`);
    console.log(`成功率: ${((successCount / totalCount) * 100).toFixed(2)}%`);
    
    // 输出详细结果
    console.log(`\n=== 详细测试结果 ===`);
    results.forEach((result, index) => {
        console.log(`${index + 1}. ${result.source}: ${result.success ? '✓' : '✗'} ${result.message} ${result.responseTime ? `(响应时间: ${result.responseTime}ms)` : ''}`);
    });
    
    return results;
}

// 执行测试
testAllDataSources().catch(error => {
    console.error('测试过程中发生错误:', error);
});
