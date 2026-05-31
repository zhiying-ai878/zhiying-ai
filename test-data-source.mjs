// 直接测试东方财富API连接
import axios from 'axios';

async function testEastMoneyAPI() {
  console.log('开始测试东方财富API连接...');
  
  try {
    // 测试股票代码：平安银行(000001)
    const secid = '0.000001';
    const startTime = Date.now();
    
    const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
      params: {
        secid,
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
    
    const responseTime = Date.now() - startTime;
    
    if (response.data && response.data.data) {
      const data = response.data.data;
      // 东方财富API返回的价格数据是整数，需要除以100
      const price = data.f43 / 100;
      const open = data.f46 / 100;
      const high = data.f44 / 100;
      const low = data.f45 / 100;
      const close = data.f60 / 100;
      const change = data.f169 ? data.f169 / 100 : price - close;
      const changePercent = data.f170 || ((price - close) / close) * 100;
      
      console.log('测试成功！');
      console.log(`响应时间: ${responseTime}ms`);
      console.log(`股票名称: ${data.f58}`);
      console.log(`当前价格: ${price.toFixed(2)}`);
      console.log(`涨跌幅: ${changePercent.toFixed(2)}%`);
      console.log(`开盘价: ${open.toFixed(2)}`);
      console.log(`最高价: ${high.toFixed(2)}`);
      console.log(`最低价: ${low.toFixed(2)}`);
      console.log(`成交量: ${data.f47}`);
      console.log(`成交额: ${data.f48}`);
    } else {
      console.log('测试失败：未获取到数据');
      console.log('响应数据:', response.data);
    }
  } catch (error) {
    console.log('测试失败：', error.message);
    console.log('错误详情:', error);
  }
}

async function testSinaAPI() {
  console.log('\n开始测试新浪API连接...');
  
  try {
    // 测试股票代码：平安银行(000001)
    const sinaCode = 'sz000001';
    const startTime = Date.now();
    
    const response = await axios.get(`https://hq.sinajs.cn/list=${sinaCode}`, {
      headers: {
        'Referer': 'https://finance.sina.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });
    
    const responseTime = Date.now() - startTime;
    
    const match = response.data.match(/"([^"]+)"/);
    if (match) {
      const values = match[1].split(',');
      if (values.length >= 32) {
        console.log('测试成功！');
        console.log(`响应时间: ${responseTime}ms`);
        console.log(`股票名称: ${values[0]}`);
        console.log(`当前价格: ${values[1]}`);
        console.log(`涨跌幅: ${((parseFloat(values[1]) - parseFloat(values[2])) / parseFloat(values[2])) * 100}%`);
        console.log(`开盘价: ${values[2]}`);
        console.log(`最高价: ${values[4]}`);
        console.log(`最低价: ${values[5]}`);
        console.log(`成交量: ${values[8]}`);
        console.log(`成交额: ${values[9]}`);
      } else {
        console.log('测试失败：数据格式不正确');
        console.log('响应数据:', response.data);
      }
    } else {
      console.log('测试失败：未获取到数据');
      console.log('响应数据:', response.data);
    }
  } catch (error) {
    console.log('测试失败：', error.message);
    console.log('错误详情:', error);
  }
}

// 运行测试
testEastMoneyAPI().then(testSinaAPI).catch(console.error);
