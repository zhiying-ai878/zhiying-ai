// 优化测试文件

import { encryptData, decryptData, checkPermission, saveUserInfo, getUserInfo } from './storage';
import { pluginManager, BasicAnalysisPlugin, IndustryAnalysisPlugin } from './pluginSystem';
import MarketMonitorManager from './marketMonitorManager';

// 性能测试
const performanceTests = {
  // 测试并行处理性能
  testParallelProcessing: async () => {
    console.log('=== 性能测试：并行处理 ===');
    
    const monitor = new MarketMonitorManager();
    
    // 模拟大量股票数据
    const mockQuotes = Array.from({ length: 1000 }, (_, i) => ({
      code: `60000${i % 10}`,
      name: `测试股票${i}`,
      price: 10 + Math.random() * 90,
      volume: 10000 + Math.random() * 990000,
      changePercent: (Math.random() * 10 - 5)
    }));
    
    const mockMainForceDataMap = new Map();
    mockQuotes.forEach(quote => {
      mockMainForceDataMap.set(quote.code, {
        stockCode: quote.code,
        stockName: quote.name,
        currentPrice: quote.price,
        mainForceNetFlow: Math.random() * 1000000 - 500000,
        volumeAmplification: 1 + Math.random() * 3,
        turnoverRate: 1 + Math.random() * 9
      });
    });
    
    // 测试信号生成性能
    const startTime = Date.now();
    const signals = await monitor['generateSignals'](mockQuotes, mockMainForceDataMap);
    const duration = Date.now() - startTime;
    
    console.log(`生成 ${signals.length} 个信号，耗时: ${duration}ms`);
    console.log(`平均处理每只股票耗时: ${(duration / mockQuotes.length).toFixed(2)}ms`);
    
    return duration < 5000; // 1000只股票处理时间应小于5秒
  }
};

// 安全性测试
const securityTests = {
  // 测试数据加密
  testEncryption: () => {
    console.log('=== 安全性测试：数据加密 ===');
    
    const testData = '这是测试数据，包含敏感信息';
    const encrypted = encryptData(testData);
    const decrypted = decryptData(encrypted);
    
    console.log('原始数据:', testData);
    console.log('加密后:', encrypted);
    console.log('解密后:', decrypted);
    
    const result = decrypted === testData;
    console.log('加密/解密测试:', result ? '通过' : '失败');
    return result;
  },
  
  // 测试权限控制
  testPermissionControl: () => {
    console.log('=== 安全性测试：权限控制 ===');
    
    // 测试无权限用户
    saveUserInfo({
      username: 'testuser',
      token: 'testtoken',
      expiresAt: Date.now() + 3600000,
      permissions: ['read']
    });
    
    const hasTradePermission = checkPermission('trade');
    const hasAdminPermission = checkPermission('admin');
    
    console.log('无交易权限测试:', !hasTradePermission ? '通过' : '失败');
    console.log('无管理员权限测试:', !hasAdminPermission ? '通过' : '失败');
    
    // 测试有权限用户
    saveUserInfo({
      username: 'adminuser',
      token: 'admintoken',
      expiresAt: Date.now() + 3600000,
      permissions: ['read', 'trade', 'strategy', 'admin']
    });
    
    const hasTradePermission2 = checkPermission('trade');
    const hasAdminPermission2 = checkPermission('admin');
    
    console.log('有交易权限测试:', hasTradePermission2 ? '通过' : '失败');
    console.log('有管理员权限测试:', hasAdminPermission2 ? '通过' : '失败');
    
    return !hasTradePermission && !hasAdminPermission && hasTradePermission2 && hasAdminPermission2;
  }
};

// 可扩展性测试
const scalabilityTests = {
  // 测试插件系统
  testPluginSystem: async () => {
    console.log('=== 可扩展性测试：插件系统 ===');
    
    // 测试插件注册
    const basicPlugin = new BasicAnalysisPlugin();
    const industryPlugin = new IndustryAnalysisPlugin();
    
    const registerResult1 = pluginManager.registerPlugin(basicPlugin);
    const registerResult2 = pluginManager.registerPlugin(industryPlugin);
    
    console.log('基础插件注册:', registerResult1 ? '成功' : '失败');
    console.log('行业插件注册:', registerResult2 ? '成功' : '失败');
    
    // 测试插件初始化
    const initResult = await pluginManager.initializePlugins({});
    console.log('插件初始化:', initResult ? '成功' : '失败');
    
    // 测试插件执行
    const mockSignals = [{
      id: 'test1',
      stockCode: '600000',
      stockName: '测试股票',
      type: 'buy' as const,
      score: 80,
      price: 10,
      confidence: 80,
      expectedProfitPercent: 15
    }];
    
    const processedSignals = await pluginManager.executeAfterSignalGeneration('test-scan', mockSignals);
    console.log('插件处理信号数量:', processedSignals.length);
    console.log('信号是否包含分析数据:', processedSignals[0].analysis ? '是' : '否');
    console.log('信号是否包含行业分析:', processedSignals[0].industryAnalysis ? '是' : '否');
    
    return registerResult1 && registerResult2 && initResult && processedSignals.length > 0;
  }
};

// 运行所有测试
export const runAllTests = async () => {
  console.log('开始运行优化测试...\n');
  
  const tests = [
    { name: '性能测试', test: performanceTests.testParallelProcessing },
    { name: '加密测试', test: securityTests.testEncryption },
    { name: '权限控制测试', test: securityTests.testPermissionControl },
    { name: '插件系统测试', test: scalabilityTests.testPluginSystem }
  ];
  
  let passedTests = 0;
  
  for (const { name, test } of tests) {
    try {
      console.log(`\n运行 ${name}...`);
      const result = await test();
      console.log(`${name}: ${result ? '通过' : '失败'}`);
      if (result) passedTests++;
    } catch (error) {
      console.log(`${name}: 出错 - ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log(`\n=== 测试结果 ===`);
  console.log(`总测试数: ${tests.length}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`测试通过率: ${((passedTests / tests.length) * 100).toFixed(1)}%`);
  
  return passedTests === tests.length;
};

// 导出测试函数
export { performanceTests, securityTests, scalabilityTests };