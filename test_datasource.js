
import axios from 'axios';

async function testSinaAPI() {
  console.log('=== 测试新浪API ===');
  try {
    const response = await axios.get('https://hq.sinajs.cn/list=sh600519,sz000001', {
      headers: {
        'Referer': 'https://finance.sina.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 5000
    });
    
    console.log('新浪API调用成功!');
    console.log('响应数据:', response.data);
    return true;
  } catch (error) {
    console.error('新浪API调用失败:', error.message);
    return false;
  }
}

async function testEastMoneyAPI() {
  console.log('\n=== 测试东方财富API ===');
  try {
    const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
      params: {
        secid: '1.600519',
        fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
        _: Date.now().toString()
      },
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      },
      timeout: 5000
    });
    
    console.log('东方财富API调用成功!');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('东方财富API调用失败:', error.message);
    return false;
  }
}

async function testTencentAPI() {
  console.log('\n=== 测试腾讯API ===');
  try {
    const response = await axios.get('https://qt.gtimg.cn/q=sh600519,sz000001', {
      headers: {
        'Referer': 'https://finance.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 5000
    });
    
    console.log('腾讯API调用成功!');
    console.log('响应数据:', response.data);
    return true;
  } catch (error) {
    console.error('腾讯API调用失败:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('开始测试数据源连接...');
  
  const sinaResult = await testSinaAPI();
  const eastmoneyResult = await testEastMoneyAPI();
  const tencentResult = await testTencentAPI();
  
  console.log('\n=== 测试结果汇总 ===');
  console.log('新浪API:', sinaResult ? '✅ 成功' : '❌ 失败');
  console.log('东方财富API:', eastmoneyResult ? '✅ 成功' : '❌ 失败');
  console.log('腾讯API:', tencentResult ? '✅ 成功' : '❌ 失败');
  
  const totalSuccess = [sinaResult, eastmoneyResult, tencentResult].filter(Boolean).length;
  console.log(`总成功率: ${totalSuccess}/3 (${((totalSuccess/3)*100).toFixed(1)}%)`);
}

runAllTests().catch(console.error);
