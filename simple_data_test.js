
// 简单的数据源测试脚本
import axios from 'axios';

async function testSinaAPI() {
  console.log('测试新浪API...');
  try {
    const response = await axios.get('https://hq.sinajs.cn/list=sh600519', {
      headers: {
        'Referer': 'https://finance.sina.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });
    
    console.log('新浪API响应:', response.data);
    
    // 解析新浪API返回的数据
    const match = response.data.match(/"([^"]+)"/);
    if (match) {
      const values = match[1].split(',');
      if (values.length >= 32) {
        const stockName = values[0];
        const price = parseFloat(values[1]);
        console.log(`新浪API: ${stockName} - 价格: ${price}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('新浪API测试失败:', error.message);
    return false;
  }
}

async function testTencentAPI() {
  console.log('测试腾讯API...');
  try {
    const response = await axios.get('https://qt.gtimg.cn/q=sh600519', {
      headers: {
        'Referer': 'https://finance.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });
    
    console.log('腾讯API响应:', response.data);
    
    // 解析腾讯API返回的数据
    const match = response.data.match(/v_(\w+)="([^"]+)"/);
    if (match) {
      const values = match[2].split('~');
      if (values.length >= 30) {
        const stockName = values[1];
        const price = parseFloat(values[3]);
        console.log(`腾讯API: ${stockName} - 价格: ${price}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('腾讯API测试失败:', error.message);
    return false;
  }
}

async function testEastmoneyAPI() {
  console.log('测试东方财富API...');
  try {
    const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
      params: {
        secid: '1.600519',
        fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
        _: Date.now().toString()
      },
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });
    
    console.log('东方财富API响应:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data) {
      const data = response.data.data;
      const stockName = data.f58;
      const price = data.f43 / 100;
      console.log(`东方财富API: ${stockName} - 价格: ${price}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('东方财富API测试失败:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('=== 开始数据源测试 ===');
  
  const sinaSuccess = await testSinaAPI();
  const tencentSuccess = await testTencentAPI();
  const eastmoneySuccess = await testEastmoneyAPI();
  
  console.log('\n=== 测试结果 ===');
  console.log(`新浪API: ${sinaSuccess ? '✅ 成功' : '❌ 失败'}`);
  console.log(`腾讯API: ${tencentSuccess ? '✅ 成功' : '❌ 失败'}`);
  console.log(`东方财富API: ${eastmoneySuccess ? '✅ 成功' : '❌ 失败'}`);
  
  const totalSuccess = [sinaSuccess, tencentSuccess, eastmoneySuccess].filter(Boolean).length;
  console.log(`\n总体结果: ${totalSuccess}/3 个数据源可用`);
}

// 运行测试
runAllTests();
