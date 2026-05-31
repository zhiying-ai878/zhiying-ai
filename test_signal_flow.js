import { getStockList, scanAllStocks, getMainForceData, getTechnicalIndicators } from './src/utils/stockData.js';
import { MarketMonitorManager } from './src/utils/marketMonitorManager.ts';

async function testSignalFlow() {
    console.log('=== 开始测试买卖提示信号系统 ===\n');
    
    try {
        // 1. 测试股票列表获取
        console.log('1. 测试股票列表获取...');
        const stockList = await getStockList();
        console.log(`✓ 获取到 ${stockList.length} 只股票`);
        
        if (stockList.length === 0) {
            console.error('✗ 未获取到股票列表，系统无法运行');
            return;
        }
        
        // 2. 测试实时行情数据获取
        console.log('\n2. 测试实时行情数据获取...');
        const sampleCodes = stockList.slice(0, 10).map(stock => stock.code);
        const quotes = await scanAllStocks(5);
        console.log(`✓ 获取到 ${quotes.length} 只股票的实时行情`);
        
        if (quotes.length === 0) {
            console.error('✗ 未获取到行情数据，系统无法生成信号');
            return;
        }
        
        // 3. 测试主力资金数据获取
        console.log('\n3. 测试主力资金数据获取...');
        const mainForceData = await getMainForceData(sampleCodes);
        console.log(`✓ 获取到 ${mainForceData.length} 条主力资金数据`);
        
        // 4. 测试技术指标获取
        console.log('\n4. 测试技术指标获取...');
        const technicalData = await getTechnicalIndicators(sampleCodes[0]);
        console.log(`✓ 获取到股票 ${sampleCodes[0]} 的技术指标:`, technicalData ? '成功' : '失败');
        
        // 5. 测试信号生成
        console.log('\n5. 测试信号生成...');
        const monitor = new MarketMonitorManager();
        
        // 运行一次扫描
        await monitor.performScan();
        
        // 获取扫描状态
        const status = await monitor.getStatus();
        console.log(`扫描状态: ${status.scanStatus}`);
        console.log(`监控股票数: ${status.stockCount}`);
        console.log(`上次扫描时间: ${new Date(status.lastScanTime).toLocaleString()}`);
        
        // 获取生成的信号
        const signalManager = monitor['signalManager'];
        const signals = signalManager.getSignals();
        console.log(`生成的买入信号: ${signals.filter(s => s.type === 'buy').length}`);
        console.log(`生成的卖出信号: ${signals.filter(s => s.type === 'sell').length}`);
        
        if (signals.length > 0) {
            console.log('\n生成的信号详情:');
            signals.forEach((signal, index) => {
                console.log(`${index + 1}. ${signal.stockName}(${signal.stockCode}) - ${signal.type === 'buy' ? '买入' : '卖出'} - 置信度: ${signal.confidence}%`);
                console.log(`   价格: ${signal.price} - 目标价格: ${signal.targetPrice}`);
                console.log(`   原因: ${signal.reason}`);
                console.log('---');
            });
        } else {
            console.log('✗ 未生成任何信号');
        }
        
        console.log('\n=== 测试完成 ===');
        
    } catch (error) {
        console.error('测试过程中发生错误:', error);
    }
}

testSignalFlow();
