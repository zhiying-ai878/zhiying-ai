
// 调试f170字段处理问题
// 验证东方财富API返回的f170字段处理逻辑

import axios from 'axios';

async function debugF170Issue() {
  console.log('=== 调试f170字段处理问题 ===');
  
  // 测试上证指数
  const indexCode = 'sh000001';
  const stockCode = 'sz301179';
  
  console.log('\n测试上证指数数据...');
  await testEastMoneyAPI(indexCode);
  
  console.log('\n测试泽宇智能数据...');
  await testEastMoneyAPI(stockCode);
}

async function testEastMoneyAPI(code) {
  try {
    // 构建东方财富API请求
    const secid = code.startsWith('sh') ? `1.${code.slice(2)}` : `0.${code.slice(2)}`;
    
    const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
      params: {
        secid,
        fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
        _: Date.now().toString()
      },
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 5000
    });
    
    if (response.data && response.data.data) {
      const data = response.data.data;
      console.log(`股票代码: ${code}`);
      console.log(`原始f170值: ${data.f170}`);
      console.log(`当前价格(f43): ${data.f43 / 100}`);
      console.log(`昨日收盘价(f60): ${data.f60 / 100}`);
      console.log(`涨跌额(f169): ${data.f169 / 100}`);
      
      // 计算涨跌幅
      const price = data.f43 / 100;
      const close = data.f60 / 100;
      const changePercent1 = data.f170 / 100; // 修复后的计算
      const changePercent2 = ((price - close) / close) * 100; // 备用计算
      
      console.log(`修复后的涨跌幅(f170/100): ${changePercent1.toFixed(2)}%`);
      console.log(`备用计算涨跌幅: ${changePercent2.toFixed(2)}%`);
    } else {
      console.log(`获取数据失败: ${response.data?.msg || '未知错误'}`);
    }
    
  } catch (error) {
    console.error(`请求失败: ${error.message}`);
  }
}

// 运行调试
debugF170Issue().catch(console.error);
