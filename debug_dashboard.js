
import axios from 'axios';

async function testDashboardDataFlow() {
  console.log('=== Dashboard数据流程测试 ===');
  
  try {
    // 模拟Dashboard组件的数据流
    console.log('1. 初始化自选股列表...');
    const defaultStocks = [
      { code: 'sh600519', name: '贵州茅台', price: 0, change: 0, changePercent: 0 },
      { code: 'sz000858', name: '五粮液', price: 0, change: 0, changePercent: 0 },
      { code: 'sz300750', name: '宁德时代', price: 0, change: 0, changePercent: 0 },
      { code: 'sh601318', name: '中国平安', price: 0, change: 0, changePercent: 0 },
      { code: 'sh600276', name: '恒瑞医药', price: 0, change: 0, changePercent: 0 }
    ];
    
    console.log('自选股列表:', defaultStocks.map(s => `${s.code}(${s.name})`));
    
    // 模拟调用getRealtimeQuote函数
    console.log('\n2. 调用getRealtimeQuote获取数据...');
    const codes = defaultStocks.map(stock => stock.code);
    console.log('请求的股票代码:', codes);
    
    // 测试新浪API获取数据
    console.log('\n3. 测试新浪API获取实时数据...');
    const sinaResponse = await axios.get(`https://hq.sinajs.cn/list=${codes.join(',')}`, {
      headers: {
        'Referer': 'https://finance.sina.com.cn/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 5000
    });
    
    console.log('新浪API响应成功');
    
    // 解析新浪API返回的数据
    const lines = sinaResponse.data.split('\n');
    const results = [];
    
    for (const line of lines) {
      if (!line) continue;
      
      const codeMatch = line.match(/hq_str_([^\s]+)=/);
      if (!codeMatch) continue;
      
      const sinaCode = codeMatch[1];
      const match = line.match(/"([^"]+)"/);
      if (match) {
        const values = match[1].split(',');
        if (values.length >= 32) {
          let code = sinaCode;
          if (sinaCode.startsWith('sh')) {
            code = sinaCode.substring(2);
          } else if (sinaCode.startsWith('sz')) {
            code = sinaCode.substring(2);
          }
          
          let name = values[0];
          name = name.replace(/锟斤拷/g, '').replace(/æ/g, '').replace(/€/g, '').replace(/�/g, '').replace(/Ã/g, '').replace(/©/g, '').replace(/Â/g, '').trim();
          
          results.push({
            code,
            name,
            price: parseFloat(values[1]),
            change: parseFloat(values[1]) - parseFloat(values[2]),
            changePercent: ((parseFloat(values[1]) - parseFloat(values[2])) / parseFloat(values[2])) * 100,
            open: parseFloat(values[2]),
            high: parseFloat(values[4]),
            low: parseFloat(values[5]),
            close: parseFloat(values[3]),
            volume: parseInt(values[8]),
            amount: parseFloat(values[9])
          });
        }
      }
    }
    
    console.log(`成功获取 ${results.length} 条数据:`);
    results.forEach(stock => {
      console.log(`${stock.code} ${stock.name}: ${stock.price.toFixed(2)} 元 (${stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}, ${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`);
    });
    
    // 验证数据格式
    console.log('\n4. 数据格式验证...');
    const requiredFields = ['code', 'name', 'price', 'change', 'changePercent'];
    const hasAllFields = results.every(result => 
      requiredFields.every(field => result[field] !== undefined)
    );
    
    console.log(`所有数据字段完整性检查: ${hasAllFields ? '✅ 通过' : '❌ 失败'}`);
    
    if (hasAllFields) {
      console.log('数据源工作正常，数据格式符合前端组件要求');
      console.log('前端显示问题可能在于：');
      console.log('1. 用户未登录系统');
      console.log('2. Dashboard组件渲染逻辑问题');
      console.log('3. React状态更新问题');
    } else {
      console.log('数据源返回的数据格式不符合要求');
    }
    
  } catch (error) {
    console.error('测试失败:', error.message);
  }
}

testDashboardDataFlow();
