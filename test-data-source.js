import axios from 'axios';

// 测试新浪API
async function testSinaAPI() {
  console.log('测试新浪API...');
  try {
    const response = await axios.get('https://hq.sinajs.cn/list=sh000001,sz399001,sz399006,sh000688', {
      headers: {
        'Referer': 'https://finance.sina.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });
    console.log('新浪API响应长度:', response.data.length);
    console.log('新浪API响应前500字符:', response.data.substring(0, 500));
    console.log('新浪API测试成功');
  } catch (error) {
    console.error('新浪API测试失败:', error.message);
  }
}

// 测试腾讯API
async function testTencentAPI() {
  console.log('\n测试腾讯API...');
  try {
    const response = await axios.get('https://qt.gtimg.cn/q=sh000001,sz399001,sz399006,sh000688', {
      headers: {
        'Referer': 'https://finance.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });
    console.log('腾讯API响应长度:', response.data.length);
    console.log('腾讯API响应前500字符:', response.data.substring(0, 500));
    console.log('腾讯API测试成功');
  } catch (error) {
    console.error('腾讯API测试失败:', error.message);
  }
}

// 测试东方财富API
async function testEastMoneyAPI() {
  console.log('\n测试东方财富API...');
  try {
    const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
      params: {
        secid: '1.000001',
        fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f107,f116,f117,f127'
      },
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });
    console.log('东方财富API响应:', JSON.stringify(response.data, null, 2));
    console.log('东方财富API测试成功');
  } catch (error) {
    console.error('东方财富API测试失败:', error.message);
  }
}

// 测试雪球API
async function testXueQiuAPI() {
  console.log('\n测试雪球API...');
  try {
    const response = await axios.get('https://xueqiu.com/service/v5/stock/screener/quote/list', {
      params: {
        symbol: 'SH000001',
        count: 1
      },
      headers: {
        'Referer': 'https://xueqiu.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });
    console.log('雪球API响应:', JSON.stringify(response.data, null, 2));
    console.log('雪球API测试成功');
  } catch (error) {
    console.error('雪球API测试失败:', error.message);
  }
}

// 测试同花顺API
async function testTHSAPI() {
  console.log('\n测试同花顺API...');
  try {
    const response = await axios.get('https://q.10jqka.com.cn/apis/quote.php', {
      params: {
        code: '1.000001',
        fields: 'name,open,high,low,close,volume,amount,change,changepercent'
      },
      headers: {
        'Referer': 'https://www.10jqka.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });
    console.log('同花顺API响应:', JSON.stringify(response.data, null, 2));
    console.log('同花顺API测试成功');
  } catch (error) {
    console.error('同花顺API测试失败:', error.message);
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('开始测试A股行情数据源...');
  await testSinaAPI();
  await testTencentAPI();
  await testEastMoneyAPI();
  await testXueQiuAPI();
  await testTHSAPI();
  console.log('\n测试完成');
}

runAllTests();
