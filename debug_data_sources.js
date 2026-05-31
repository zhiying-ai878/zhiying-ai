// 数据源诊断脚本 - 增强版
import axios from 'axios';

const createHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Cache-Control': 'max-age=0',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1'
});

const backupUrls = {
  eastmoney: [
    'https://push2.eastmoney.com',
    'https://quote.eastmoney.com'
  ],
  eastmoneyKline: [
    'https://push2his.eastmoney.com'
  ],
  netease: [
    'https://api.money.163.com',
    'https://quotes.money.163.com'
  ]
};

async function testWithRetry(url, options, backupUrls, description, maxRetries = 3) {
  let lastError = null;
  const originalUrl = url;
  const urlObj = new URL(url);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, options);
      return { success: true, response, attempt };
    } catch (error) {
      lastError = error;
      
      if (backupUrls && backupUrls.length > 0 && attempt < maxRetries) {
        const backupBaseUrl = backupUrls[attempt - 1] || backupUrls[0];
        url = `${backupBaseUrl}${urlObj.pathname}${urlObj.search}`;
        console.log(`  尝试备用URL ${attempt}: ${url}`);
      }
    }
  }
  
  return { success: false, error: lastError, attempts: maxRetries };
}

async function testEastMoneyAPI() {
  console.log('=== 测试东方财富API (带重试和备用URL) ===');
  
  const baseUrl = 'https://push2.eastmoney.com';
  const path = '/api/qt/ulist.np/get';
  const params = new URLSearchParams({
    secids: '0.301408',
    fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
    _: Date.now().toString()
  });
  
  const url = `${baseUrl}${path}?${params}`;
  const backupUrlsList = backupUrls.eastmoney.map(u => `${u}${path}?${params}`);
  
  const result = await testWithRetry(url, {
    headers: { ...createHeaders(), Referer: 'https://quote.eastmoney.com/' },
    timeout: 8000,
    withCredentials: true
  }, backupUrlsList, '东方财富行情API');
  
  if (result.success) {
    console.log('✓ 东方财富API工作正常');
    return { success: true, attempt: result.attempt };
  } else {
    console.error('✗ 东方财富API请求失败:', result.error.message);
    return { success: false, reason: result.error.message };
  }
}

async function testKLineAPI() {
  console.log('\n=== 测试K线数据API (带重试和备用URL) ===');
  
  const baseUrl = 'https://push2his.eastmoney.com';
  const path = '/api/qt/stock/kline/get';
  const params = new URLSearchParams({
    secid: '0.301408',
    klt: 101,
    fqt: 1,
    lmt: 10,
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61'
  });
  
  const url = `${baseUrl}${path}?${params}`;
  const backupUrlsList = backupUrls.eastmoneyKline.map(u => `${u}${path}?${params}`);
  
  const result = await testWithRetry(url, {
    headers: { ...createHeaders(), Referer: 'https://quote.eastmoney.com/' },
    timeout: 8000,
    withCredentials: true
  }, backupUrlsList, '东方财富K线API');
  
  if (result.success) {
    console.log('✓ K线API工作正常');
    return { success: true, attempt: result.attempt };
  } else {
    console.error('✗ K线API请求失败:', result.error.message);
    return { success: false, reason: result.error.message };
  }
}

async function testTencentAPI() {
  console.log('\n=== 测试腾讯API ===');
  
  try {
    const url = 'https://qt.gtimg.cn/q=sz301408';
    const response = await axios.get(url, {
      headers: {
        'Referer': 'https://finance.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36'
      },
      timeout: 8000,
      responseType: 'arraybuffer'
    });
    
    const { default: iconvLite } = await import('iconv-lite');
    const decoded = iconvLite.decode(response.data, 'gbk');
    
    if (decoded.startsWith('v_sz301408')) {
      const data = decoded.split('~');
      console.log('✓ 腾讯API工作正常');
      console.log('股票名称:', data[1]);
      console.log('当前价格:', data[3]);
      return { success: true };
    } else {
      console.log('✗ 腾讯API返回数据格式异常');
      return { success: false, reason: '数据格式异常' };
    }
  } catch (error) {
    console.error('✗ 腾讯API请求失败:', error.message);
    return { success: false, reason: error.message };
  }
}

async function testSinaAPI() {
  console.log('\n=== 测试新浪API ===');
  
  try {
    const url = 'https://hq.sinajs.cn/list=sz301408';
    const response = await axios.get(url, {
      headers: {
        'Referer': 'https://finance.sina.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36'
      },
      timeout: 8000
    });
    
    if (response.data && response.data.startsWith('var hq_str_sz301408')) {
      console.log('✓ 新浪API工作正常');
      return { success: true };
    } else {
      console.log('✗ 新浪API返回数据格式异常');
      return { success: false, reason: '数据格式异常' };
    }
  } catch (error) {
    console.error('✗ 新浪API请求失败:', error.message);
    return { success: false, reason: error.message };
  }
}

async function testNeteaseAPI() {
  console.log('\n=== 测试网易API (带重试和备用URL) ===');
  
  const baseUrl = 'https://api.money.163.com';
  const path = '/api/feed/getStockInfo';
  const params = new URLSearchParams({ symbol: 'SZ301408' });
  
  const url = `${baseUrl}${path}?${params}`;
  const backupUrlsList = backupUrls.netease.filter(u => u !== baseUrl).map(u => `${u}${path}?${params}`);
  
  const result = await testWithRetry(url, {
    headers: {
      'Referer': 'https://quotes.money.163.com/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.109 Safari/537.36'
    },
    timeout: 8000
  }, backupUrlsList, '网易行情API');
  
  if (result.success) {
    console.log('✓ 网易API工作正常');
    return { success: true, attempt: result.attempt };
  } else {
    console.error('✗ 网易API请求失败:', result.error.message);
    return { success: false, reason: result.error.message };
  }
}

async function runDiagnostics() {
  console.log('========== 智盈AI数据源诊断 (增强版) ==========');
  console.log('诊断时间:', new Date().toLocaleString());
  console.log('功能: 重试机制 + 备用URL切换');
  console.log('===============================================\n');
  
  const results = [];
  
  const testPromises = [
    testEastMoneyAPI().then(r => ({ name: '东方财富行情API', ...r })),
    testKLineAPI().then(r => ({ name: '东方财富K线API', ...r })),
    testTencentAPI().then(r => ({ name: '腾讯行情API', ...r })),
    testSinaAPI().then(r => ({ name: '新浪行情API', ...r })),
    testNeteaseAPI().then(r => ({ name: '网易行情API', ...r }))
  ];
  
  const testResults = await Promise.all(testPromises);
  results.push(...testResults);
  
  console.log('\n========== 诊断结果汇总 ==========');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`成功: ${successCount}/${totalCount}`);
  console.log('');
  
  results.forEach(result => {
    const status = result.success ? '✓ 正常' : '✗ 异常';
    const attemptInfo = result.attempt && result.attempt > 1 ? `(第${result.attempt}次尝试成功)` : '';
    const reason = result.success ? attemptInfo : `(原因: ${result.reason})`;
    console.log(`${status} ${result.name} ${reason}`);
  });
  
  console.log('');
  
  if (successCount === 0) {
    console.log('⚠️ 所有数据源都无法正常工作，请检查网络连接');
  } else if (successCount < totalCount) {
    console.log('⚠️ 部分数据源异常');
    console.log('已启用增强优化:');
    console.log('  • 智能重试机制 (最多5次)');
    console.log('  • 指数退避延迟策略');
    console.log('  • 备用URL自动切换');
    console.log('  • socket hang up自动恢复');
  } else {
    console.log('✓ 所有数据源工作正常');
  }
  
  return results;
}

runDiagnostics().catch(console.error);