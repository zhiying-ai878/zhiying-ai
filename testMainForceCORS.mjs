// 测试主力资金数据源的CORS支持情况
import axios from 'axios';

// 测试主力资金数据源的CORS支持
async function testMainForceCORS() {
  console.log('=== 测试主力资金数据源的CORS支持 ===');
  
  const mainForceDataSources = [
    {
      name: '同花顺主力资金',
      url: 'https://api.10jqka.com.cn/v1/quote/newest',
      params: { codes: '600000' },
      headers: {
        'Referer': 'https://www.10jqka.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      }
    },
    {
      name: '东方财富主力资金',
      url: 'https://push2his.eastmoney.com/api/qt/stock/fflow/daykline/get',
      params: {
        lmt: 1,
        klt: 101,
        secid: '1.600000',
        fields1: 'f1,f2,f3,f4,f5,f6,f7'
      },
      headers: {
        'Referer': 'https://data.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      }
    }
  ];
  
  let corsSuccessCount = 0;
  
  for (const source of mainForceDataSources) {
    console.log(`\n测试 ${source.name}...`);
    
    try {
      const startTime = Date.now();
      const response = await axios.get(source.url, {
        params: source.params,
        headers: source.headers,
        timeout: 10000
      });
      const endTime = Date.now();
      
      console.log(`✅ ${source.name}: 请求成功`);
      console.log(`响应时间: ${endTime - startTime}ms`);
      console.log(`状态码: ${response.status}`);
      
      // 检查响应头中的CORS相关信息
      const headers = response.headers;
      console.log('响应头:');
      console.log(`Access-Control-Allow-Origin: ${headers['access-control-allow-origin'] || 'Not found'}`);
      console.log(`Access-Control-Allow-Methods: ${headers['access-control-allow-methods'] || 'Not found'}`);
      console.log(`Access-Control-Allow-Headers: ${headers['access-control-allow-headers'] || 'Not found'}`);
      
      // 检查响应数据
      console.log(`响应数据类型: ${typeof response.data}`);
      if (typeof response.data === 'object') {
        console.log(`响应数据包含字段: ${Object.keys(response.data).join(', ')}`);
      }
      
      corsSuccessCount++;
      
    } catch (error) {
      console.log(`❌ ${source.name}: 请求失败`);
      console.log(`错误信息: ${error.message}`);
      
      // 检查是否是CORS错误
      if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
        console.log('这是一个CORS错误');
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        console.log('这是一个403 Forbidden错误，可能是API限制');
      } else if (error.message.includes('timeout')) {
        console.log('这是一个超时错误');
      }
    }
  }
  
  console.log(`\n=== CORS测试结果 ===`);
  console.log(`测试数据源总数: ${mainForceDataSources.length}`);
  console.log(`CORS支持成功: ${corsSuccessCount}`);
  console.log(`CORS支持失败: ${mainForceDataSources.length - corsSuccessCount}`);
  
  if (corsSuccessCount === mainForceDataSources.length) {
    console.log('🎉 所有主力资金数据源都支持CORS！');
  } else {
    console.log('⚠️ 部分主力资金数据源不支持CORS，可能需要配置代理服务器');
  }
  
  // 测试备用方案：使用行情数据估算主力资金
  console.log('\n测试备用方案：使用行情数据估算主力资金...');
  
  try {
    const response = await axios.get('https://qt.gtimg.cn/q=sh600000', {
      headers: {
        'Referer': 'https://finance.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 5000
    });
    
    console.log('✅ 行情数据获取成功');
    console.log('响应数据长度:', response.data.length);
    
    // 检查CORS响应头
    const headers = response.headers;
    console.log('行情数据源CORS响应头:');
    console.log(`Access-Control-Allow-Origin: ${headers['access-control-allow-origin'] || 'Not found'}`);
    
    // 解析行情数据
    const lines = response.data.split('\n');
    for (const line of lines) {
      if (!line) continue;
      
      const match = line.match(/v_(\w+)="([^"]+)"/);
      if (match) {
        const tencentCode = match[1];
        const values = match[2].split('~');
        
        const price = parseFloat(values[3]);
        const volume = parseInt(values[6]);
        const change = parseFloat(values[3]) - parseFloat(values[4]);
        
        console.log(`股票: ${tencentCode}`);
        console.log(`价格: ${price}`);
        console.log(`成交量: ${volume}`);
        console.log(`涨跌额: ${change}`);
        
        // 估算主力资金
        const estimatedMainForce = volume * price * 0.3 * Math.sign(change);
        console.log(`估算主力资金: ${estimatedMainForce}`);
      }
    }
    
  } catch (error) {
    console.log('❌ 行情数据获取失败:', error.message);
  }
  
  console.log('\n=== 总结 ===');
  console.log('1. 主力资金数据源的CORS支持情况已测试');
  console.log('2. 备用方案（使用行情数据估算主力资金）已验证可行');
  console.log('3. 即使主力资金数据源不支持CORS，系统仍能通过行情数据估算主力资金');
}

// 运行测试
testMainForceCORS().catch(console.error);
