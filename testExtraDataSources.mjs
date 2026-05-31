
import fetch from 'node-fetch';

// 设置超时时间
const timeout = 8000;

async function testDataSource(name, url, headers = {}) {
  console.log(`\n=== 测试 ${name} ===`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      headers: {
        ...headers,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
    console.log('响应示例:', text.substring(0, 300) + (text.length > 300 ? '...' : ''));
    
    return {
      name,
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      corsHeaders,
      responseLength: text.length,
      responseSample: text.substring(0, 150)
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
  console.log('开始测试额外的数据源...');
  
  const tests = [
    // 咕咕数据
    {
      name: '咕咕数据-A股实时行情',
      url: 'https://api.gugudata.com/stock/cn/realtime?appkey=test&symbol=000001',
      headers: {
        'Referer': 'https://www.gugudata.com/'
      }
    },
    
    // XTick
    {
      name: 'XTick-实时行情',
      url: 'http://api.xtick.top/doc/market?type=1&code=000001&period=1m&fq=front&startDate=2025-03-01&endDate=2025-03-25&token=test',
      headers: {
        'Referer': 'http://api.xtick.top/'
      }
    },
    
    // 必盈数据
    {
      name: '必盈数据-实时行情',
      url: 'https://api.biyingapi.com/hsstock/real/time/000001/biyinglicence',
      headers: {
        'Referer': 'https://api.biyingapi.com/'
      }
    },
    
    // 必盈数据-实时交易
    {
      name: '必盈数据-实时交易',
      url: 'https://api.biyingapi.com/hsrl/ssjy/000001/biyinglicence',
      headers: {
        'Referer': 'https://api.biyingapi.com/'
      }
    },
    
    // 必盈数据-股票列表
    {
      name: '必盈数据-股票列表',
      url: 'https://api.biyingapi.com/hslt/list/biyinglicence',
      headers: {
        'Referer': 'https://api.biyingapi.com/'
      }
    },
    
    // 聚合数据
    {
      name: '聚合数据-A股行情',
      url: 'https://web.juhe.cn:8080/finance/stock/hs?gid=hs_a&key=test',
      headers: {
        'Referer': 'https://www.juhe.cn/'
      }
    },
    
    // 腾讯备用接口3
    {
      name: '腾讯备用接口3',
      url: 'https://qt.gtimg.cn/q=sh000001',
      headers: {
        'Referer': 'https://qt.gtimg.cn/'
      }
    },
    
    // 新浪备用接口2
    {
      name: '新浪备用接口2',
      url: 'http://hq.sinajs.cn/list=sz000001',
      headers: {
        'Referer': 'https://finance.sina.com.cn/'
      }
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testDataSource(test.name, test.url, test.headers);
    results.push(result);
  }
  
  console.log('\n=== 测试结果汇总 ===');
  console.table(results);
  
  // 分析成功的数据源
  console.log('\n=== 成功的数据源分析 ===');
  const successful = results.filter(r => r.success);
  console.log(`成功的数据源: ${successful.map(r => r.name).join(', ') || '无'}`);
  
  // 分析CORS支持情况
  console.log('\n=== CORS支持分析 ===');
  const corsSupported = results.filter(r => r.corsHeaders && r.corsHeaders['access-control-allow-origin']);
  console.log(`支持CORS的数据源: ${corsSupported.map(r => r.name).join(', ') || '无'}`);
  
  return results;
}

runTests().catch(console.error);
