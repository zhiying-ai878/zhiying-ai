
import axios from 'axios';

async function analyzeMiniApi() {
  console.log('=== 分析东方财富迷你版API字段含义 ===');
  
  // 测试单个指数
  const testCode = 'sh000001'; // 上证指数
  
  let secid;
  if (testCode.startsWith('sh')) {
    secid = `1.${testCode.substring(2)}`;
  } else if (testCode.startsWith('sz')) {
    secid = `0.${testCode.substring(2)}`;
  }
  
  try {
    const response = await axios.get('https://push2.eastmoney.com/api/qt/ulist.np/get', {
      params: {
        secids: secid,
        fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
        _: Date.now().toString()
      },
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });
    
    console.log('API响应:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data && response.data.data.diff) {
      const item = response.data.data.diff[0];
      console.log('\n=== 字段分析 ===');
      console.log(`代码: ${item.f12}`);
      console.log(`名称: ${item.f14}`);
      console.log(`f2 (当前价): ${item.f2}`);
      console.log(`f3: ${item.f3}`);
      console.log(`f4: ${item.f4}`);
      console.log(`f15 (开盘价): ${item.f15}`);
      console.log(`f17 (最高价): ${item.f17}`);
      console.log(`f18 (最低价): ${item.f18}`);
      console.log(`f20 (昨收价): ${item.f20}`);
      
      // 计算各种可能的组合
      const price = item.f2 / 100;
      const open = item.f15 / 100;
      const high = item.f17 / 100;
      const low = item.f18 / 100;
      const close = item.f20 / 100;
      
      console.log('\n=== 计算结果 ===');
      console.log(`当前价: ${price}`);
      console.log(`开盘价: ${open}`);
      console.log(`最高价: ${high}`);
      console.log(`最低价: ${low}`);
      console.log(`昨收价: ${close}`);
      
      // 测试不同的涨跌幅计算方式
      console.log('\n=== 涨跌幅计算测试 ===');
      console.log(`f3/100: ${item.f3 / 100}`);
      console.log(`f3/10000: ${item.f3 / 10000}`);
      console.log(`f4/100: ${item.f4 / 100}`);
      console.log(`f4/10000: ${item.f4 / 10000}`);
      console.log(`(price - close): ${price - close}`);
      console.log(`((price - close) / close) * 100: ${((price - close) / close) * 100}`);
    }
  } catch (error) {
    console.error('API请求失败:', error.message);
  }
}

analyzeMiniApi().catch(console.error);
