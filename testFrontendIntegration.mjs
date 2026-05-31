// 模拟前端数据获取流程测试
import axios from 'axios';

// 模拟前端获取指数数据的过程
async function testFrontendIntegration() {
  console.log('=== 前端集成测试 ===');
  
  // 模拟前端调用getRealtimeQuote函数
  async function getRealtimeQuote(codes) {
    console.log(`前端调用getRealtimeQuote，代码: ${codes.join(',')}`);
    
    const tencentCodes = codes.map(code => {
      if (code.startsWith('sh') || code.startsWith('sz')) {
        return code;
      }
      return code.startsWith('6') ? `sh${code}` : `sz${code}`;
    }).join(',');
    
    try {
      const response = await axios.get(`https://qt.gtimg.cn/q=${tencentCodes}`, {
        headers: {
          'Referer': 'https://finance.qq.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Connection': 'keep-alive'
        },
        timeout: 5000
      });
      
      console.log('✅ 数据源连接成功');
      console.log('响应数据长度:', response.data.length);
      
      const results = [];
      const lines = response.data.split('\n');
      
      for (const line of lines) {
        if (!line) continue;
        
        const match = line.match(/v_(\w+)="([^"]+)"/);
        if (match) {
          const tencentCode = match[1];
          const values = match[2].split('~');
          
          if (values.length >= 35) {
            let code = tencentCode;
            if (tencentCode.startsWith('sh')) {
              code = tencentCode.substring(2);
            } else if (tencentCode.startsWith('sz')) {
              code = tencentCode.substring(2);
            }
            
            // 解析价格数据
            const priceValue = parseFloat(values[3]);
            const closeValue = parseFloat(values[4]);
            const openValue = parseFloat(values[5]);
            const highValue = parseFloat(values[33]);
            const lowValue = parseFloat(values[34]);
            
            // 解析成交额
            let amount = 0;
            if (values[35] && values[35].includes('/')) {
              const amountParts = values[35].split('/');
              if (amountParts.length >= 3) {
                amount = parseFloat(amountParts[2]);
              }
            }
            
            const result = {
              code,
              name: values[1],
              price: priceValue,
              change: priceValue - closeValue,
              changePercent: ((priceValue - closeValue) / closeValue) * 100,
              open: openValue,
              high: highValue,
              low: lowValue,
              close: closeValue,
              volume: parseInt(values[6]),
              amount: amount
            };
            
            results.push(result);
            console.log(`\n返回数据:`);
            console.log(`股票代码: ${result.code}`);
            console.log(`股票名称: ${result.name}`);
            console.log(`价格: ${result.price}`);
            console.log(`涨跌幅: ${result.changePercent.toFixed(2)}%`);
            
            // 检查价格是否为0
            if (result.price === 0 || isNaN(result.price)) {
              console.log('❌ 价格为0或无效');
            } else {
              console.log('✅ 价格数据正常');
            }
          }
        }
      }
      
      return results;
    } catch (error) {
      console.log('❌ 数据源连接失败:', error.message);
      return [];
    }
  }
  
  // 测试指数数据获取
  console.log('\n1. 测试指数数据获取...');
  const indexCodes = ['000001', '399001', '399006', '000688'];
  const indexData = await getRealtimeQuote(indexCodes);
  
  console.log(`\n指数数据获取结果:`);
  console.log(`请求代码: ${indexCodes.join(',')}`);
  console.log(`返回数据数量: ${indexData.length}`);
  
  let zeroPriceCount = 0;
  indexData.forEach(item => {
    if (item.price === 0 || isNaN(item.price)) {
      zeroPriceCount++;
    }
  });
  
  console.log(`价格为0的数据: ${zeroPriceCount}/${indexData.length}`);
  
  // 测试股票数据获取
  console.log('\n2. 测试股票数据获取...');
  const stockCodes = ['600000', '300730', '300370'];
  const stockData = await getRealtimeQuote(stockCodes);
  
  console.log(`\n股票数据获取结果:`);
  console.log(`请求代码: ${stockCodes.join(',')}`);
  console.log(`返回数据数量: ${stockData.length}`);
  
  zeroPriceCount = 0;
  stockData.forEach(item => {
    if (item.price === 0 || isNaN(item.price)) {
      zeroPriceCount++;
    }
  });
  
  console.log(`价格为0的数据: ${zeroPriceCount}/${stockData.length}`);
  
  // 模拟前端显示
  console.log('\n3. 模拟前端显示数据...');
  console.log('上证指数:', indexData.find(item => item.code === '000001')?.price || 0);
  console.log('深证成指:', indexData.find(item => item.code === '399001')?.price || 0);
  console.log('创业板指:', indexData.find(item => item.code === '399006')?.price || 0);
  console.log('科创50:', indexData.find(item => item.code === '000688')?.price || 0);
  
  stockData.forEach(stock => {
    console.log(`${stock.name}(${stock.code}): ${stock.price}`);
  });
}

// 运行测试
testFrontendIntegration().catch(console.error);
