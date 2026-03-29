import { smartDataRequest, getDataSourceStatus } from './smart_data_source_manager.js';

async function testSmartDataSource() {
    console.log('=== 测试智能数据源管理器历史数据获取 ===\n');
    
    const stockCodes = ['002594', '600519', '300480'];
    
    for (const stockCode of stockCodes) {
        console.log(`测试股票代码: ${stockCode}`);
        
        try {
            console.log(`正在使用智能数据源获取历史数据...`);
            const data = await smartDataRequest([stockCode], 'historical');
            
            if (data && data[stockCode] && data[stockCode].length > 0) {
                console.log(`✅ 成功获取 ${data[stockCode].length} 条历史数据`);
                console.log(`最新5条数据:`);
                data[stockCode].slice(-5).forEach((item, index) => {
                    console.log(`${index + 1}. ${item.date}: 开=${item.open}, 收=${item.close}, 高=${item.high}, 低=${item.low}`);
                });
            } else {
                console.log(`❌ 未获取到数据`);
            }
            
        } catch (error) {
            console.error(`获取历史数据失败:`, error.message);
        }
        
        console.log('');
    }
    
    // 获取数据源状态报告
    console.log('=== 数据源状态报告 ===');
    const status = getDataSourceStatus();
    console.log(`总数据源数: ${status.totalSources}`);
    console.log(`健康数据源: ${status.healthySources}`);
    console.log(`不健康数据源: ${status.unhealthySources}`);
    console.log(`未知状态数据源: ${status.unknownSources}`);
    
    if (status.failedSources.length > 0) {
        console.log(`失败的数据源: ${status.failedSources.join(', ')}`);
    }
    
    console.log('\n=== 测试完成 ===');
}

testSmartDataSource().catch(console.error);
