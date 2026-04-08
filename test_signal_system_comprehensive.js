
// 全面测试买卖提示信号系统的各个环节
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 测试配置
const testConfig = {
  testStockList: true,
  testRealTimeData: true,
  testAIAnalysis: true,
  testSignalGeneration: true,
  testSignalDisplay: true
};

// 模拟股票数据
const testStocks = [
  { code: '600000', name: '浦发银行' },
  { code: '000001', name: '平安银行' },
  { code: '300632', name: '光莆股份' },
  { code: '300166', name: '东方国信' },
  { code: '300730', name: '科创信息' }
];

// 测试结果
const testResults = {
  passed: 0,
  failed: 0,
  details: []
};

function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
}

function test(name, testFn) {
  log(`开始测试: ${name}`);
  try {
    const result = testFn();
    if (result) {
      log(`✓ 测试通过: ${name}`, 'success');
      testResults.passed++;
      testResults.details.push({ name, status: 'passed', message: '测试通过' });
    } else {
      log(`✗ 测试失败: ${name}`, 'error');
      testResults.failed++;
      testResults.details.push({ name, status: 'failed', message: '测试失败' });
    }
  } catch (error) {
    log(`✗ 测试异常: ${name} - ${error.message}`, 'error');
    testResults.failed++;
    testResults.details.push({ name, status: 'error', message: error.message });
  }
}

// 测试1: 检查股票列表文件
function testStockListFile() {
  const stockListPath = path.join(__dirname, 'src', 'utils', 'stockList.json');
  if (fs.existsSync(stockListPath)) {
    const data = fs.readFileSync(stockListPath, 'utf8');
    const stockList = JSON.parse(data);
    log(`股票列表文件存在，包含 ${stockList.length} 只股票`);
    return stockList.length > 0;
  } else {
    log('股票列表文件不存在', 'error');
    return false;
  }
}

// 测试2: 检查核心文件是否存在
function testCoreFiles() {
  const files = [
    'src/utils/stockData.ts',
    'src/utils/marketMonitorManager.ts',
    'src/utils/optimizedSignalManager.ts',
    'src/pages/Signal/Signal.tsx',
    'src/utils/timeSeriesPredictor.ts'
  ];
  
  let allExist = true;
  files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) {
      log(`核心文件不存在: ${file}`, 'error');
      allExist = false;
    }
  });
  
  return allExist;
}

// 测试3: 检查信号生成逻辑
function testSignalGenerationLogic() {
  const signalManagerPath = path.join(__dirname, 'src', 'utils', 'optimizedSignalManager.ts');
  if (fs.existsSync(signalManagerPath)) {
    const content = fs.readFileSync(signalManagerPath, 'utf8');
    
    // 检查是否包含关键的信号生成条件
    const hasExpectedIncrease = content.includes('calculateExpectedIncrease');
    const hasActiveCheck = content.includes('checkStockActivity');
    const hasFundFlow = content.includes('getMainFundFlow');
    const hasTechnicalAnalysis = content.includes('calculateTechnicalIndicators');
    
    log(`信号生成逻辑检查:`);
    log(`- 预期涨幅检查: ${hasExpectedIncrease ? '✓' : '✗'}`);
    log(`- 股票活跃度检查: ${hasActiveCheck ? '✓' : '✗'}`);
    log(`- 主力资金检查: ${hasFundFlow ? '✓' : '✗'}`);
    log(`- 技术指标分析: ${hasTechnicalAnalysis ? '✓' : '✗'}`);
    
    return hasExpectedIncrease && hasActiveCheck && hasFundFlow && hasTechnicalAnalysis;
  }
  return false;
}

// 测试4: 检查预测模型配置
function testPredictionModels() {
  const predictorPath = path.join(__dirname, 'src', 'utils', 'timeSeriesPredictor.ts');
  if (fs.existsSync(predictorPath)) {
    const content = fs.readFileSync(predictorPath, 'utf8');
    
    // 检查是否包含集成模型
    const models = [
      'LSTM', 'GRU', 'ARIMA', 'SVM', 
      'RandomForest', 'XGBoost', 'LightGBM', 'Prophet'
    ];
    
    let allModelsFound = true;
    models.forEach(model => {
      const found = content.includes(model);
      log(`- ${model}模型: ${found ? '✓' : '✗'}`);
      if (!found) allModelsFound = false;
    });
    
    // 检查趋势范围限制
    const hasTrendLimit = content.includes('limitedTrendStrength');
    const hasPriceLimit = content.includes('finalPredictedClose');
    
    log(`- 趋势范围限制: ${hasTrendLimit ? '✓' : '✗'}`);
    log(`- 价格范围限制: ${hasPriceLimit ? '✓' : '✗'}`);
    
    return allModelsFound && hasTrendLimit && hasPriceLimit;
  }
  return false;
}

// 测试5: 检查市场监控管理器
function testMarketMonitor() {
  const monitorPath = path.join(__dirname, 'src', 'utils', 'marketMonitorManager.ts');
  if (fs.existsSync(monitorPath)) {
    const content = fs.readFileSync(monitorPath, 'utf8');
    
    // 检查关键功能
    const hasScanLogic = content.includes('scanAllStocks');
    const hasDataFetch = content.includes('getStockList');
    const hasSignalGeneration = content.includes('generateTradingSignal');
    const hasMarketStatus = content.includes('checkMarketStatus');
    
    log(`市场监控管理器检查:`);
    log(`- 全市场扫描: ${hasScanLogic ? '✓' : '✗'}`);
    log(`- 数据获取: ${hasDataFetch ? '✓' : '✗'}`);
    log(`- 信号生成: ${hasSignalGeneration ? '✓' : '✗'}`);
    log(`- 市场状态检查: ${hasMarketStatus ? '✓' : '✗'}`);
    
    return hasScanLogic && hasDataFetch && hasSignalGeneration && hasMarketStatus;
  }
  return false;
}

// 测试6: 检查数据源配置
function testDataSources() {
  const stockDataPath = path.join(__dirname, 'src', 'utils', 'stockData.ts');
  if (fs.existsSync(stockDataPath)) {
    const content = fs.readFileSync(stockDataPath, 'utf8');
    
    // 检查数据源
    const sources = [
      '新浪', '腾讯', '东方财富', '同花顺', '雪球', 'Finnhub', 'AkShare'
    ];
    
    let allSourcesFound = true;
    sources.forEach(source => {
      const found = content.includes(source);
      log(`- ${source}数据源: ${found ? '✓' : '✗'}`);
      if (!found) allSourcesFound = false;
    });
    
    // 检查故障转移机制
    const hasFailover = content.includes('getRealTimeDataFromMultipleSources');
    
    log(`- 故障转移机制: ${hasFailover ? '✓' : '✗'}`);
    
    return allSourcesFound && hasFailover;
  }
  return false;
}

// 测试7: 检查信号页面组件
function testSignalPage() {
  const signalPagePath = path.join(__dirname, 'src', 'pages', 'Signal', 'Signal.tsx');
  if (fs.existsSync(signalPagePath)) {
    const content = fs.readFileSync(signalPagePath, 'utf8');
    
    // 检查关键功能
    const hasLoadSignals = content.includes('loadSignals');
    const hasStartGeneration = content.includes('startSignalGeneration');
    const hasMarketMonitor = content.includes('startMarketStatusMonitor');
    const hasSignalDisplay = content.includes('buySignals') && content.includes('sellSignals');
    
    log(`信号页面检查:`);
    log(`- 加载信号: ${hasLoadSignals ? '✓' : '✗'}`);
    log(`- 启动信号生成: ${hasStartGeneration ? '✓' : '✗'}`);
    log(`- 市场监控: ${hasMarketMonitor ? '✓' : '✗'}`);
    log(`- 信号显示: ${hasSignalDisplay ? '✓' : '✗'}`);
    
    return hasLoadSignals && hasStartGeneration && hasMarketMonitor && hasSignalDisplay;
  }
  return false;
}

// 测试8: 检查信号生成条件配置
function testSignalConditions() {
  const signalManagerPath = path.join(__dirname, 'src', 'utils', 'optimizedSignalManager.ts');
  if (fs.existsSync(signalManagerPath)) {
    const content = fs.readFileSync(signalManagerPath, 'utf8');
    
    // 检查信号生成条件的阈值
    const expectedIncreaseThreshold = content.includes('>= 0.02'); // 2%
    const fundFlowThreshold = content.includes('>= 100') || content.includes('>= 20000');
    const activityCheck = content.includes('volumeIncrease') || content.includes('turnoverRate');
    
    log(`信号生成条件检查:`);
    log(`- 预期涨幅阈值(2%): ${expectedIncreaseThreshold ? '✓' : '✗'}`);
    log(`- 资金流入阈值(低门槛): ${fundFlowThreshold ? '✓' : '✗'}`);
    log(`- 活跃度检查: ${activityCheck ? '✓' : '✗'}`);
    
    return expectedIncreaseThreshold && fundFlowThreshold && activityCheck;
  }
  return false;
}

// 运行所有测试
function runAllTests() {
  log('开始全面测试买卖提示信号系统...');
  
  test('股票列表文件', testStockListFile);
  test('核心文件存在性', testCoreFiles);
  test('信号生成逻辑', testSignalGenerationLogic);
  test('预测模型配置', testPredictionModels);
  test('市场监控管理器', testMarketMonitor);
  test('数据源配置', testDataSources);
  test('信号页面组件', testSignalPage);
  test('信号生成条件', testSignalConditions);
  
  // 输出测试结果
  log('\n=== 测试结果汇总 ===');
  log(`通过: ${testResults.passed}`);
  log(`失败: ${testResults.failed}`);
  log(`总计: ${testResults.passed + testResults.failed}`);
  
  if (testResults.failed > 0) {
    log('\n失败详情:');
    testResults.details.forEach(detail => {
      if (detail.status !== 'passed') {
        log(`- ${detail.name}: ${detail.message}`);
      }
    });
  }
  
  log('\n=== 系统状态评估 ===');
  const successRate = (testResults.passed / (testResults.passed + testResults.failed) * 100).toFixed(1);
  log(`系统完整性评分: ${successRate}%`);
  
  if (successRate >= 90) {
    log('系统状态: 优秀 - 核心功能完整');
  } else if (successRate >= 70) {
    log('系统状态: 良好 - 大部分功能正常');
  } else if (successRate >= 50) {
    log('系统状态: 一般 - 部分功能存在问题');
  } else {
    log('系统状态: 较差 - 需要重点修复');
  }
  
  return testResults.failed === 0;
}

// 运行测试
runAllTests();

export {
  runAllTests,
  testResults
};

