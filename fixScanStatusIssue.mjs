// 修复扫描状态一直显示"空闲"的问题
import axios from 'axios';

// 分析和修复扫描状态问题
async function fixScanStatusIssue() {
  console.log('=== 扫描状态问题诊断 ===');
  
  // 问题分析：扫描状态一直显示"空闲"，说明扫描没有真正开始
  // 从代码分析可以看到：
  // 1. 在scanMarket函数中，只有获取到行情数据后才设置isScanning = true
  // 2. 如果数据源连接失败或行情数据获取失败，isScanning就不会被设置为true
  // 3. 这样就导致扫描状态一直显示"空闲"
  
  console.log('\n问题诊断：');
  console.log('1. 扫描状态一直显示"空闲"');
  console.log('2. 点击刷新信号后仍然显示"空闲"');
  console.log('3. 说明扫描没有真正开始或isScanning状态没有正确设置');
  
  // 测试数据源连接
  console.log('\n测试数据源连接...');
  
  const testCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688', 'sh600000'];
  
  for (const code of testCodes) {
    try {
      const response = await axios.get(`https://qt.gtimg.cn/q=${code}`, {
        headers: {
          'Referer': 'https://finance.qq.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Connection': 'keep-alive'
        },
        timeout: 5000
      });
      
      console.log(`✅ ${code}: 数据源连接成功`);
      
      const lines = response.data.split('\n');
      for (const line of lines) {
        if (!line) continue;
        
        const match = line.match(/v_(\w+)="([^"]+)"/);
        if (match) {
          const tencentCode = match[1];
          const values = match[2].split('~');
          
          const priceValue = parseFloat(values[3]);
          
          if (priceValue > 0 && !isNaN(priceValue)) {
            console.log(`✅ ${tencentCode}: 价格数据正常: ${priceValue}`);
          } else {
            console.log(`❌ ${tencentCode}: 价格数据异常: ${priceValue}`);
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ ${code}: 数据源连接失败`, error.message);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n修复建议：');
  console.log('1. 修改scanMarket函数，在开始扫描时就设置isScanning = true');
  console.log('2. 确保即使数据源连接失败，扫描状态也能正确更新');
  console.log('3. 添加扫描状态的日志记录，便于调试');
  
  // 模拟修复方案
  console.log('\n模拟修复方案：');
  console.log(`
// 修改marketMonitorManager.js中的scanMarket函数

async scanMarket() {
  if (this.isScanning || this.scanStatus === 'scanning') {
    logger.warn('扫描已在进行中，跳过本次扫描');
    return;
  }
  
  // 在扫描开始时就设置状态为扫描中
  this.isScanning = true;
  this.scanStatus = 'scanning';
  
  const marketStatus = this.checkMarketStatus();
  const startTime = Date.now();
  const scanId = \`scan_\${Date.now()}_\${Math.random().toString(36).substring(2, 9)}\`;
  
  try {
    logger.info(\`=== 开始全市场扫描 [\${scanId}] ===\`);
    logger.info(\`当前市场状态: \${marketStatus}, 扫描间隔: \${this.config.scanInterval / 1000}秒\`);
    
    // 获取股票列表
    const stockDataSource = getStockDataSource();
    const stockList = await stockDataSource.getStockList();
    const totalStocks = stockList.length;
    
    logger.info(\`获取到 \${totalStocks} 只A股股票列表\`);
    
    // 获取行情数据
    const allQuotes = await scanAllStocks(this.config.batchSize);
    
    if (Array.isArray(allQuotes) && allQuotes.length > 0) {
      logger.info(\`获取到 \${allQuotes.length} 只股票的实时行情\`);
      
      // 处理股票数据
      const filteredQuotes = this.filterStocks(allQuotes);
      logger.info(\`过滤后剩余 \${filteredQuotes.length} 只股票\`);
      
      // 生成信号
      const signals = await this.generateSignals(filteredQuotes, mainForceDataMap);
      logger.info(\`信号生成完成，买入信号: \${signals.filter(s => s.type === 'buy').length}个\`);
      
    } else {
      logger.warn('未获取到股票行情数据');
    }
    
  } catch (error) {
    logger.error(\`全市场扫描失败: \${error.message}\`);
  } finally {
    // 确保扫描状态被重置
    this.isScanning = false;
    this.scanStatus = 'completed';
    this.lastScanTime = Date.now();
    
    logger.info(\`全市场扫描完成，耗时: \${Date.now() - startTime}ms\`);
  }
}
  `);
  
  console.log('\n修复效果：');
  console.log('1. 扫描开始时立即设置isScanning = true，确保前端显示"扫描中"');
  console.log('2. 即使数据源连接失败，扫描状态也会在finally块中正确重置');
  console.log('3. 添加了详细的日志记录，便于调试和监控');
  
  console.log('\n建议修复步骤：');
  console.log('1. 修改marketMonitorManager.js文件');
  console.log('2. 在scanMarket函数开始时设置isScanning = true');
  console.log('3. 在finally块中确保扫描状态被正确重置');
  console.log('4. 重新构建项目');
}

// 运行修复测试
fixScanStatusIssue().catch(console.error);
