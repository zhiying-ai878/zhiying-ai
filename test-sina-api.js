import axios from 'axios';

async function testSinaAPI() {
  try {
    console.log('测试新浪API获取A股行情数据...');
    
    // 测试上证指数、深证成指、创业板指、科创板指
    const codes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
    const sinaCodes = codes.join(',');
    
    const url = `https://hq.sinajs.cn/list=${sinaCodes}`;
    console.log(`请求URL: ${url}`);
    
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
    
    console.log('\nAPI响应:');
    console.log(response.data);
    
    // 解析响应数据
    console.log('\n解析数据:');
    const lines = response.data.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      // 从响应中提取股票代码，格式为 var hq_str_sh000001="..."
      const codeMatch = line.match(/hq_str_([a-z0-9]+)="/);
      if (!codeMatch) {
        console.warn(`无法提取股票代码 for line ${i}: ${line.substring(0, 50)}...`);
        continue;
      }
      
      let code = codeMatch[1];
      const match = line.match(/"([^"]+)"/);
      if (match) {
        const values = match[1].split(',');
        if (values.length >= 10) {
          const price = parseFloat(values[1]);
          const open = parseFloat(values[2]);
          const close = parseFloat(values[3]);
          const high = parseFloat(values[4]);
          const low = parseFloat(values[5]);
          const volume = parseInt(values[8]);
          const amount = parseFloat(values[9]);
          const change = price - close;
          const changePercent = (change / close) * 100;
          
          // 处理股票名称
          let stockName = values[0];
          if (code === 'sh000001') stockName = '上证指数';
          else if (code === 'sz399001') stockName = '深证成指';
          else if (code === 'sz399006') stockName = '创业板指';
          else if (code === 'sh000688') stockName = '科创板指';
          
          console.log(`\n${stockName} (${code}):`);
          console.log(`  价格: ${price}`);
          console.log(`  开盘: ${open}`);
          console.log(`  收盘: ${close}`);
          console.log(`  最高: ${high}`);
          console.log(`  最低: ${low}`);
          console.log(`  涨跌幅: ${change.toFixed(2)} (${changePercent.toFixed(2)}%)`);
          console.log(`  成交量: ${volume}`);
          console.log(`  成交额: ${amount}`);
        } else {
          console.warn(`数据格式不正确 for line ${i}: ${line.substring(0, 50)}...`);
        }
      } else {
        console.warn(`无法匹配数据 for line ${i}: ${line.substring(0, 50)}...`);
      }
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testSinaAPI();