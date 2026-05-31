
import { getHistoricalDataManager } from './src/utils/historicalData.js';
import { getTimeSeriesPredictor } from './src/utils/timeSeriesPredictor.js';

async function testOptimizedPrediction() {
    console.log('=== 测试优化后的预测功能 ===');
    
    try {
        const stockCode = '300730'; // 股票300730
        
        console.log(`\n1. 获取股票${stockCode}的历史数据...`);
        const historicalManager = getHistoricalDataManager();
        
        try {
            const historyData = await historicalManager.getHistoricalData(stockCode);
            console.log(`✓ 成功获取${historyData.length}条历史数据`);
            
            if (historyData.length === 0) {
                console.error('✗ 未获取到历史数据');
                return;
            }
            
            // 显示前5条数据
            console.log('前5条历史数据:');
            historyData.slice(0, 5).forEach((data, index) => {
                console.log(`${index + 1}. ${data.date} - 开盘: ${data.open}, 收盘: ${data.close}, 成交量: ${data.volume}`);
            });
            
        } catch (error) {
            console.error(`✗ 获取历史数据失败:`, error.message);
            return;
        }
        
        console.log(`\n2. 测试预测功能...`);
        const predictor = getTimeSeriesPredictor();
        
        try {
            const predictions = await predictor.predict(stockCode, historyData);
            console.log(`✓ 成功生成${predictions.length}条预测结果`);
            
            if (predictions.length > 0) {
                console.log('\n预测结果详情:');
                predictions.forEach((pred, index) => {
                    console.log(`\n第${index + 1}天预测:`);
                    console.log(`日期: ${pred.date}`);
                    console.log(`预测价格: ${pred.predictedClose.toFixed(2)} 元`);
                    console.log(`上涨空间: +${pred.upsidePotential.toFixed(2)}%`);
                    console.log(`目标价格: ${pred.targetPrice.toFixed(2)} 元`);
                    console.log(`止损价格: ${pred.stopLoss.toFixed(2)} 元`);
                    console.log(`趋势: ${pred.trend}`);
                    console.log(`买入信号: ${pred.buySignal ? '是' : '否'}`);
                    console.log(`卖出信号: ${pred.sellSignal ? '是' : '否'}`);
                    console.log(`置信度: ${(pred.confidence * 100).toFixed(1)}%`);
                    console.log(`价格范围: ${pred.priceRange.min.toFixed(2)} - ${pred.priceRange.max.toFixed(2)}`);
                });
            }
            
        } catch (error) {
            console.error(`✗ 预测失败:`, error.message);
            return;
        }
        
        console.log('\n=== 测试完成 ===');
        console.log('优化后的预测功能工作正常！');
        
    } catch (error) {
        console.error('测试过程中发生错误:', error.message);
    }
}

testOptimizedPrediction();
