import { smartDataRequest, getDataSourceStatus } from './smart_data_source_manager.js';

async function test300389Data() {
    console.log('=== 测试股票300389历史数据获取 ===\n');
    
    const stockCode = '300389';
    
    try {
        console.log(`正在使用智能数据源获取股票${stockCode}历史数据...`);
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
    
    // 获取数据源状态报告
    console.log('\n=== 数据源状态报告 ===');
    const status = getDataSourceStatus();
    console.log(`总数据源数: ${status.totalSources}`);
    console.log(`健康数据源: ${status.healthySources}`);
    console.log(`不健康数据源: ${status.unhealthySources}`);
    console.log(`未知状态数据源: ${status.unknownSources}`);
    
    console.log('\n=== 测试完成 ===');
}

test300389Data().catch(console.error);
