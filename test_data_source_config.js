// 测试数据源配置
import axios from 'axios';

console.log('=== 测试数据源配置 ===');

// 测试腾讯数据源
async function testTencent() {
  console.log('\n测试腾讯数据源...');
  try {
    const response = await axios.get('https://web.ifzq.gtimg.cn/appstock/app/kline/kline?param=sh600519,day,2024-01-01,2024-01-31', {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      }
    });
    console.log('✅ 腾讯数据源访问成功');
    console.log('响应数据:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 腾讯数据源访问失败:', error.message);
    return false;
  }
}

// 测试新浪数据源
async function testSina() {
  console.log('\n测试新浪数据源...');
  try {
    const response = await axios.get('https://hq.sinajs.cn/list=sh600519', {
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript, */*; q=0.01',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      }
    });
    console.log('✅ 新浪数据源访问成功');
    console.log('响应数据:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 新浪数据源访问失败:', error.message);
    return false;
  }
}

// 测试东方财富数据源
async function testEastMoney() {
  console.log('\n测试东方财富数据源...');
  try {
    const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
      params: {
        secid: '1.600519',
        fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
        _: Date.now()
      },
      timeout: 8000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      }
    });
    console.log('✅ 东方财富数据源访问成功');
    console.log('响应数据:', response.data);
    return true;
  } catch (error) {
    console.error('❌ 东方财富数据源访问失败:', error.message);
    return false;
  }
}

// 运行测试
async function runTests() {
  const results = [];
  
  results.push(await testTencent());
  results.push(await testSina());
  results.push(await testEastMoney());
  
  const successCount = results.filter(r => r).length;
  console.log(`\n=== 测试结果 ===`);
  console.log(`成功: ${successCount}/3`);
  
  if (successCount > 0) {
    console.log('✅ 至少有一个数据源可用');
  } else {
    console.log('❌ 所有数据源都不可用');
  }
}

runTests();
