// 测试信号生成功能
import { superSignalGenerator } from './src/utils/superSignalGenerator.js';

async function testSignalGeneration() {
  console.log('=== 测试信号生成功能 ===');
  
  try {
    // 待分析股票代码
    const stockCodes = ['sh600519', 'sz300750', 'sz300033', 'sz002594', 'sh601318', 'sz301265', 'sz301408', 'sz301189'];
    console.log(`📋 待分析股票代码:`, stockCodes);
    
    // 生成信号
    console.log('🚀 开始生成信号...');
    const generatedSignals = await superSignalGenerator.generateSignals(stockCodes);
    
    console.log(`✅ 成功生成${generatedSignals.length}个信号`);
    
    // 输出信号详情
    generatedSignals.forEach(signal => {
      console.log(`📊 信号详情: ${signal.stockName} - ${signal.type} (${signal.confidence}%)`);
      console.log(`   特殊信号标签:`, {
        isLimitUpPotential: signal.isLimitUpPotential,
        isLeadingStock: signal.isLeadingStock,
        isPotentialDouble: signal.isPotentialDouble,
        isPotentialMultiBagger: signal.isPotentialMultiBagger
      });
      console.log(`   得分: ${signal.score}, 是否已读: ${signal.isRead}`);
      console.log(`   理由: ${signal.reason}`);
      console.log('---');
    });
    
    // 统计特殊信号
    const specialSignals = generatedSignals.filter(signal => {
      return signal.isLimitUpPotential || signal.isLeadingStock || signal.isPotentialDouble || signal.isPotentialMultiBagger;
    });
    
    console.log(`🎯 特殊信号统计:`, {
      total: specialSignals.length,
      stocks: specialSignals.map(s => s.stockName)
    });
    
  } catch (error) {
    console.error('❌ 生成信号失败:', error);
    console.error('❌ 错误详情:', error?.stack);
  }
}

testSignalGeneration();
