import axios from 'axios';

// 测试数据源连接问题
async function testDataSourceConnection() {
  console.log('=== 数据源连接问题诊断 ===');
  
  // 测试腾讯数据源
  console.log('\n1. 测试腾讯数据源...');
  try {
    const tencentCodes = 'sh600000,sz000001,sh000001,sz399001,sz399006';
    const response = await axios.get(`https://qt.gtimg.cn/q=${tencentCodes}`, {
      headers: {
        'Referer': 'https://finance.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 5000
    });
    
    console.log('✅ 腾讯数据源连接成功');
    console.log('响应数据长度:', response.data.length);
    
    const lines = response.data.split('\n');
    console.log('返回的股票数量:', lines.length);
    
    // 分析每条数据
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i];
      if (!line) continue;
      
      const match = line.match(/v_(\w+)="([^"]+)"/);
      if (match) {
        const tencentCode = match[1];
        const values = match[2].split('~');
        console.log(`\n股票代码: ${tencentCode}`);
        console.log('数据字段数量:', values.length);
        console.log('价格字段(index 3):', values[3]);
        console.log('收盘价字段(index 4):', values[4]);
        console.log('开盘价字段(index 5):', values[5]);
        console.log('最高价字段(index 33):', values[33]);
        console.log('最低价字段(index 34):', values[34]);
        
        // 测试数据解析
        const priceValue = parseFloat(values[3]);
        const closeValue = parseFloat(values[4]);
        const openValue = parseFloat(values[5]);
        const highValue = parseFloat(values[33]);
        const lowValue = parseFloat(values[34]);
        
        console.log('解析后的值:');
        console.log(`价格: ${priceValue}`);
        console.log(`收盘价: ${closeValue}`);
        console.log(`开盘价: ${openValue}`);
        console.log(`最高价: ${highValue}`);
        console.log(`最低价: ${lowValue}`);
        
        // 检查是否为0
        if (priceValue === 0 || isNaN(priceValue)) {
          console.log('❌ 价格数据为0或无效');
        } else {
          console.log('✅ 价格数据正常');
        }
      }
    }
    
  } catch (error) {
    console.log('❌ 腾讯数据源连接失败:', error.message);
  }
  
  // 测试东方财富数据源
  console.log('\n2. 测试东方财富数据源...');
  try {
    const secid = '1.600000';
    const response = await axios.get('http://push2his.eastmoney.com/api/qt/stock/kline/get', {
      params: {
        secid: secid,
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        klt: '101',
        fqt: '0',
        beg: '20240101',
        end: '20241231'
      },
      timeout: 5000
    });
    
    console.log('✅ 东方财富数据源连接成功');
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ 东方财富数据源连接失败:', error.message);
  }
  
  // 测试同花顺数据源
  console.log('\n3. 测试同花顺数据源...');
  try {
    const response = await axios.get('http://qt.gtimg.cn/q', {
      params: {
        qs: 'sh600000'
      },
      timeout: 5000
    });
    
    console.log('✅ 同花顺数据源连接成功');
    console.log('响应数据:', response.data);
    
  } catch (error) {
    console.log('❌ 同花顺数据源连接失败:', error.message);
  }
}

// 运行测试
testDataSourceConnection().catch(console.error);
