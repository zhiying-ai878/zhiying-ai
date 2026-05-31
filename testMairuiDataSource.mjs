
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
      responseLength: text.length,
      responseSample: text.substring(0, 200)
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
  console.log('开始测试迈瑞数据等新数据源...');
  
  const tests = [
    // 迈瑞数据 - 实时行情
    {
      name: '迈瑞数据-实时行情',
      url: 'https://api.mairui.club/hsrl/ssjy/000001/b997d4403688d5e66a'
    },
    
    // 迈瑞数据 - 股票列表
    {
      name: '迈瑞数据-股票列表',
      url: 'https://api.mairui.club/hslt/list/b997d4403688d5e66a'
    },
    
    // 迈瑞数据 - 买卖五档
    {
      name: '迈瑞数据-买卖五档',
      url: 'https://api.mairui.club/hsrl/mmwp/000001/b997d4403688d5e66a'
    },
    
    // 必盈数据 - 实时行情（使用官方测试证书）
    {
      name: '必盈数据-实时行情',
      url: 'https://api.biyingapi.com/hsstock/real/time/000001/biyinglicence'
    },
    
    // Yahoo Finance - A股数据
    {
      name: 'Yahoo Finance-A股',
      url: 'https://query1.finance.yahoo.com/v7/finance/quote?symbols=000001.SZ'
    },
    
    // Alpha Vantage - 测试（需要API密钥）
    {
      name: 'Alpha Vantage-测试',
      url: 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo'
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
