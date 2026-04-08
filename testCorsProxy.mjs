
import fetch from 'node-fetch';

// 设置超时时间
const timeout = 8000;

async function testCorsProxy(proxyName, proxyUrl, targetUrl) {
  console.log(`\n=== 测试 ${proxyName} 代理 ===`);
  console.log(`目标URL: ${targetUrl}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const fullUrl = `${proxyUrl}${encodeURIComponent(targetUrl)}`;
    console.log(`代理URL: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
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
      proxyName,
      success: response.status >= 200 && response.status < 300,
      status: response.status,
      corsHeaders,
      responseLength: text.length,
      responseSample: text.substring(0, 150)
    };
  } catch (error) {
    console.error('错误:', error.message);
    return {
      proxyName,
      success: false,
      error: error.message
    };
  }
}

async function runTests() {
  console.log('开始测试CORS代理服务...');
  
  const proxies = [
    {
      name: 'CORSPROXY.IO',
      url: 'https://corsproxy.io/?url='
    },
    {
      name: 'CORS.SH',
      url: 'https://proxy.cors.sh/'
    }
  ];
  
  const targets = [
    {
      name: '新浪行情',
      url: 'http://hq.sinajs.cn/list=sh600519'
    },
    {
      name: '网易行情',
      url: 'http://quotes.money.163.com/service/chddata.html?code=0600519'
    },
    {
      name: '雪球行情',
      url: 'https://xueqiu.com/S/SH600519'
    },
    {
      name: '同花顺行情',
      url: 'http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code=000001'
    }
  ];
  
  const results = [];
  
  for (const proxy of proxies) {
    for (const target of targets) {
      const result = await testCorsProxy(`${proxy.name} -> ${target.name}`, proxy.url, target.url);
      results.push(result);
    }
  }
  
  console.log('\n=== 测试结果汇总 ===');
  console.table(results);
  
  // 分析成功的代理
  console.log('\n=== 成功的代理分析 ===');
  const successful = results.filter(r => r.success);
  console.log(`成功的代理组合: ${successful.map(r => r.proxyName).join(', ') || '无'}`);
  
  return results;
}

runTests().catch(console.error);
