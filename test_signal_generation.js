// 简单的信号生成测试脚本
import { getStockDataSource } from './src/utils/stockData.js';
import { MarketMonitorManager } from './src/utils/marketMonitorManager.js';

async function testSignalGeneration() {
    console.log('=== 测试信号生成流程 ===\n');
    
    try {
        // 1. 测试数据源连接
        console.log('1. 测试数据源连接...');
        const dataSource = getStockDataSource();
        console.log(`当前数据源: ${dataSource.getSourceType()}`);
        
        // 2. 测试股票列表获取
        console.log('\n2. 测试股票列表获取...');
        const stockList = await dataSource.getStockList();
        console.log(`获取到 ${stockList.length} 只股票`);
        
        if (stockList.length === 0) {
            console.error('✗ 未获取到股票列表');
            return;
        }
        
        // 3. 测试实时行情获取
        console.log('\n3. 测试实时行情获取...');
        const sampleCodes = stockList.slice(0, 5).map(stock => stock.code);
        console.log(`测试股票: ${sampleCodes.join(', ')}`);
        
        const quotes = await dataSource.getRealtimeQuote(sampleCodes);
        console.log(`获取到 ${quotes.length} 条行情数据`);
        
        if (quotes.length === 0) {
            console.error('✗ 未获取到行情数据');
            return;
        }
        
        console.log('行情数据示例:', quotes[0]);
        
        // 4. 测试信号生成
        console.log('\n4. 测试信号生成...');
        const monitor = new MarketMonitorManager();
        
        // 运行扫描
        await monitor.performScan();
        
        // 获取扫描状态
        const status = await monitor.getStatus();
        console.log(`扫描状态: ${status.scanStatus}`);
        console.log(`处理股票数: ${status.processedStocks}`);
        console.log(`生成买入信号: ${status.scanHistory[status.scanHistory.length - 1]?.buySignals || 0}`);
        console.log(`生成卖出信号: ${status.scanHistory[status.scanHistory.length - 1]?.sellSignals || 0}`);
        
        // 获取信号管理器
        const signalManager = monitor['signalManager'];
        const signals = signalManager.getSignals();
        console.log(`当前信号总数: ${signals.length}`);
        
        if (signals.length > 0) {
            console.log('\n生成的信号:');
            signals.forEach(signal => {
                console.log(`${signal.stockName}(${signal.stockCode}) - ${signal.type === 'buy' ? '买入' : '卖出'} - 置信度: ${signal.confidence}%`);
            });
        } else {
            console.log('✗ 未生成任何信号');
            
            // 检查是否有错误日志
            console.log('\n检查最近的扫描历史:');
            if (status.scanHistory.length > 0) {
                const lastScan = status.scanHistory[status.scanHistory.length - 1];
                console.log(`扫描状态: ${lastScan.status}`);
                console.log(`数据源状态: ${lastScan.dataSourceStatus}`);
                console.log(`处理股票数: ${lastScan.processedStocks}`);
            }
        }
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

testSignalGeneration();
