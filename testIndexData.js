
import { getStockDataSource } from './src/utils/stockData.js';

async function testIndexData() {
    console.log('=== 测试指数数据获取 ===');
    
    // 创建数据源实例，禁用预加载和数据持久化
    const dataSource = getStockDataSource('eastmoney', {
        preloadEnabled: false,
        persistenceEnabled: false
    });
    
    // 测试上证指数和深证成指
    const indexCodes = ['sh000001', 'sz399001'];
    
    console.log(`正在获取指数数据: ${indexCodes.join(',')}`);
    
    try {
        const data = await dataSource.getRealtimeQuote(indexCodes);
        console.log('获取到的数据:', JSON.stringify(data, null, 2));
        
        if (data.length > 0) {
            data.forEach(item => {
                console.log(`指数: ${item.name}(${item.code})`);
                console.log(`价格: ${item.price}`);
                console.log(`涨跌额: ${item.change}`);
                console.log(`涨跌幅: ${item.changePercent}%`);
                console.log('---');
            });
        } else {
            console.log('未获取到数据');
        }
    } catch (error) {
        console.error('获取指数数据失败:', error);
    }
}

testIndexData();
