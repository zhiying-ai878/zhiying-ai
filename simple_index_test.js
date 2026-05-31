import axios from 'axios';

async function testIndexData() {
  console.log('=== 测试指数数据格式 ===');
  
  // 测试腾讯API
  console.log('\n测试腾讯API...');
  const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
  
  try {
    const tencentCodes = indexCodes.join(',');
    const response = await axios.get(`https://qt.gtimg.cn/q=${tencentCodes}`, {
      headers: {
        'Referer': 'https://finance.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 3000
    });
    
    const lines = response.data.split('\n');
    console.log('腾讯API返回的原始数据:');
    console.log(response.data);
    
    console.log('\n解析后的数据:');
    for (const line of lines) {
      if (!line) continue;
      const match = line.match(/v_(\w+)="([^"]+)"/);
      if (match) {
        const tencentCode = match[1];
        const values = match[2].split('~');
        if (values.length >= 30) {
          const price = parseFloat(values[3]);
          const change = parseFloat(values[31]);
          const changePercent = parseFloat(values[32]);
          
          console.log(`原始代码: ${tencentCode}, 解析后代码: ${tencentCode}, 价格: ${price}, 涨跌: ${change}, 涨跌幅: ${changePercent}%`);
        }
      }
    }
    
    // 模拟Dashboard组件的数据处理
    const indexMap = new Map();
    for (const line of lines) {
      if (!line) continue;
      const match = line.match(/v_(\w+)="([^"]+)"/);
      if (match) {
        const tencentCode = match[1];
        const values = match[2].split('~');
        if (values.length >= 30) {
          const price = parseFloat(values[3]);
          const change = parseFloat(values[31]);
          const changePercent = parseFloat(values[32]);
          
          indexMap.set(tencentCode, {
            code: tencentCode,
            name: values[1],
            price: price,
            change: change,
            changePercent: changePercent
          });
        }
      }
    }
    
    console.log('\n数据映射测试:');
    console.log('sh000001:', indexMap.get('sh000001'));
    console.log('sz399001:', indexMap.get('sz399001'));
    console.log('sz399006:', indexMap.get('sz399006'));
    console.log('sh000688:', indexMap.get('sh000688'));
    
  } catch (error) {
    console.error('腾讯API测试失败:', error.message);
  }
  
  console.log('\n=== 测试完成 ===');
}

testIndexData();
