// 详细测试新浪API获取A股实时数据
import axios from 'axios';

async function testSinaAPI() {
  console.log('开始测试新浪API...');
  
  // 测试市场指数
  const marketCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
  // 测试个股
  const stockCodes = ['sh600519', 'sz000001', 'sz002594', 'sz300750', 'sh601318'];
  
  const allCodes = [...marketCodes, ...stockCodes];
  const sinaCodes = allCodes.join(',');
  
  console.log('测试代码:', allCodes);
  
  try {
    const url = `https://hq.sinajs.cn/list=${sinaCodes}`;
    console.log('请求URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Referer': 'https://finance.sina.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 10000,
      responseType: 'text'
    });
    
    console.log('\nAPI响应长度:', response.data.length, '字符');
    console.log('\nAPI响应内容:');
    console.log(response.data);
    
    // 解析响应
    const lines = response.data.split('\n');
    console.log('\n响应行数:', lines.length);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      console.log(`\n处理第${i+1}行:`);
      console.log('原始行:', line.substring(0, 100) + (line.length > 100 ? '...' : ''));
      
      // 提取股票代码
      const codeMatch = line.match(/hq_str_([a-z0-9]+)="/);
      if (!codeMatch) {
        console.log('无法提取股票代码');
        continue;
      }
      
      const code = codeMatch[1];
      console.log('提取的代码:', code);
      
      // 提取数据
      const match = line.match(/"([^"]+)"/);
      if (match) {
        const values = match[1].split(',');
        console.log('数据字段数:', values.length);
        
        if (values.length >= 10) {
          const name = values[0];
          const price = parseFloat(values[1]);
          const open = parseFloat(values[2]);
          const close = parseFloat(values[3]);
          const high = parseFloat(values[4]);
          const low = parseFloat(values[5]);
          const volume = parseInt(values[8]);
          const amount = parseFloat(values[9]);
          const change = price - close;
          const changePercent = (change / close) * 100;
          
          console.log('股票名称:', name);
          console.log('价格:', price);
          console.log('开盘:', open);
          console.log('收盘:', close);
          console.log('最高:', high);
          console.log('最低:', low);
          console.log('成交量:', volume);
          console.log('成交额:', amount);
          console.log('涨跌:', change);
          console.log('涨跌幅:', changePercent.toFixed(2) + '%');
          
          // 检查数据是否有效
          if (!isNaN(price) && price > 0) {
            console.log('✓ 数据有效');
          } else {
            console.log('✗ 数据无效');
          }
        } else {
          console.log('✗ 数据格式不正确');
        }
      } else {
        console.log('✗ 无法匹配数据');
      }
    }
    
  } catch (error) {
    console.error('API请求失败:', error.message);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    } else if (error.request) {
      console.error('请求已发送但没有收到响应');
    }
  }
}

testSinaAPI();
