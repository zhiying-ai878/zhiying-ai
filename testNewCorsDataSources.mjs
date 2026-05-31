
import fetch from 'node-fetch';

// 设置超时时间
const timeout = 5000;

async function testDataSource(name, url, headers = {}) {
  console.log(`\n=== 测试 ${name} ===`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      headers: {
        ...headers,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'https://example.com' // 设置Origin头来测试CORS
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // 检查CORS相关头
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers'),
      'access-control-max-age': response.headers.get('access-control-max-age')
    };
    
    console.log(`状态码: ${response.status}`);
    console.log('CORS响应头:', corsHeaders);
    
    const text = await response.text();
    console.log('响应长度:', text.length, '字符');
    console.log('响应示例:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
    
    return {
      name,
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      corsHeaders,
      responseLength: text.length
    };
  } catch (error) {
    console.error('错误:', error.message);
    return {
      name,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('开始测试新的数据源...');
  
  const tests = [
    // XTick API
    {
      name: 'XTick',
      url: 'http://api.xtick.top/doc/market?type=1&code=000001&period=1m&fq=front&startDate=2025-03-01&endDate=2025-03-25&token=test'
    },
    
    // 咕咕数据
    {
      name: '咕咕数据',
      url: 'https://api.gugudata.com/stock/cn/realtime?appkey=test&symbol=000001'
    },
    
    // Alltick
    {
      name: 'Alltick',
      url: 'https://api.alltick.io/stock-api/v5/quote?symbol=000001.SZ&api_key=test'
    },
    
    // 必盈数据
    {
      name: '必盈数据',
      url: 'https://api.biyingapi.com/hsstock/real/time/000001/biyinglicence'
    },
    
    // 聚合数据
    {
      name: '聚合数据',
      url: 'https://web.juhe.cn:8080/finance/stock/hs?gid=hs_a&key=test'
    },
    
    // 新浪备用接口
    {
      name: '新浪备用接口',
      url: 'https://hq.sinajs.cn/list=sh600519'
    },
    
    // 腾讯备用接口
    {
      name: '腾讯备用接口',
      url: 'https://qt.gtimg.cn/q=sz000001'
    },
    
    // 东方财富备用接口
    {
      name: '东方财富备用接口',
      url: 'http://push2.eastmoney.com/api/qt/stock/get?secid=0.000001&fields1=f1,f2,f3,f4,f5,f6'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testDataSource(test.name, test.url, test.headers);
    results.push(result);
  }
  
  console.log('\n=== 测试结果汇总 ===');
  console.table(results);
  
  // 分析CORS支持情况
  console.log('\n=== CORS支持分析 ===');
  const corsSupported = results.filter(r => r.corsHeaders && r.corsHeaders['access-control-allow-origin']);
  console.log(`支持CORS的数据源: ${corsSupported.map(r => r.name).join(', ') || '无'}`);
  
  return results;
}

runTests().catch(console.error);
