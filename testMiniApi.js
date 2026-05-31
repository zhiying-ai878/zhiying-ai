
import axios from 'axios';

async function testMiniApi() {
  console.log('=== 测试东方财富迷你版API原始数据 ===');
  
  const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
  
  const secids = indexCodes.map(code => {
    let cleanCode = code;
    if (code.startsWith('sh')) {
      cleanCode = code.substring(2);
    } else if (code.startsWith('sz')) {
      cleanCode = code.substring(2);
    }
    return cleanCode.startsWith('6') ? `1.${cleanCode}` : `0.${cleanCode}`;
  }).join(',');
  
  try {
    const response = await axios.get('https://push2.eastmoney.com/api/qt/ulist.np/get', {
      params: {
        secids,
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
      console.log('\n=== 解析每个项目的字段 ===');
      response.data.data.diff.forEach((item, index) => {
        console.log(`\n项目 ${index + 1}:`);
        console.log('f12:', item.f12); // 代码
        console.log('f14:', item.f14); // 名称
        console.log('f2:', item.f2); // 当前价
        console.log('f3:', item.f3); // 涨跌额
        console.log('f4:', item.f4); // 涨跌幅
        console.log('f15:', item.f15); // 开盘价
        console.log('f17:', item.f17); // 最高价
        console.log('f18:', item.f18); // 最低价
        console.log('f20:', item.f20); // 昨收价
      });
    }
  } catch (error) {
    console.error('东方财富迷你版API测试失败:', error.message);
  }
}

testMiniApi().catch(console.error);
