import axios from 'axios';

async function debugFullFlow() {
  console.log('=== 调试完整数据流程 ===');
  
  const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
  
  console.log('请求的指数代码:', indexCodes);
  
  // 测试所有数据源
  const dataSources = [
    { name: '腾讯', url: 'https://qt.gtimg.cn/q=' },
    { name: '东方财富专业版', url: 'https://push2.eastmoney.com/api/qt/stock/get' },
    { name: '东方财富迷你版', url: 'https://push2.eastmoney.com/api/qt/ulist.np/get' }
  ];
  
  for (const source of dataSources) {
    console.log(`\n=== 测试${source.name}数据源 ===`);
    
    try {
      if (source.name === '腾讯') {
        const tencentCodes = indexCodes.join(',');
        const response = await axios.get(`${source.url}${tencentCodes}`, {
          headers: {
            'Referer': 'https://finance.qq.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 3000
        });
        
        const lines = response.data.split('\n');
        console.log(`${source.name}返回的原始数据:`);
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
              
              console.log(`${tencentCode}: 价格=${price}, 涨跌=${change}, 涨跌幅=${changePercent}%`);
            }
          }
        }
      } 
      else if (source.name === '东方财富专业版') {
        for (const code of indexCodes) {
          let cleanCode = code;
          if (code.startsWith('sh')) {
            cleanCode = code.substring(2);
          } else if (code.startsWith('sz')) {
            cleanCode = code.substring(2);
          }
          const secid = cleanCode.startsWith('6') || cleanCode.startsWith('000') ? `1.${cleanCode}` : `0.${cleanCode}`;
          
          const response = await axios.get(source.url, {
            params: {
              secid,
              fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
              _: Date.now().toString()
            },
            headers: {
              'Referer': 'https://quote.eastmoney.com/',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 3000
          });
          
          if (response.data && response.data.data) {
            const data = response.data.data;
            const price = data.f43 / 100;
            const change = data.f169 ? data.f169 / 100 : price - (data.f60 / 100);
            const changePercent = data.f170 ? data.f170 / 100 : ((price - (data.f60 / 100)) / (data.f60 / 100)) * 100;
            
            console.log(`${code}: 价格=${price}, 涨跌=${change}, 涨跌幅=${changePercent}%`);
          } else {
            console.log(`${code}: 未获取到数据`);
          }
        }
      }
      else if (source.name === '东方财富迷你版') {
        const secids = indexCodes.map(code => {
          let cleanCode = code;
          if (code.startsWith('sh')) {
            cleanCode = code.substring(2);
          } else if (code.startsWith('sz')) {
            cleanCode = code.substring(2);
          }
          return cleanCode.startsWith('6') || cleanCode.startsWith('000') ? `1.${cleanCode}` : `0.${cleanCode}`;
        }).join(',');
        
        const response = await axios.get(source.url, {
          params: {
            secids,
            fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
            _: Date.now().toString()
          },
          headers: {
            'Referer': 'https://quote.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 3000
        });
        
        if (response.data && response.data.data && response.data.data.diff) {
          console.log('东方财富迷你版返回的数据:');
          console.log(JSON.stringify(response.data.data.diff, null, 2));
          
          console.log('\n解析后的数据:');
          for (const item of response.data.data.diff) {
            const code = item.f12;
            const price = item.f2 / 100;
            const change = item.f3 / 100;
            const changePercent = item.f4 / 100;
            
            console.log(`${code}: 价格=${price}, 涨跌=${change}, 涨跌幅=${changePercent}%`);
          }
        } else {
          console.log('未获取到数据');
        }
      }
      
    } catch (error) {
      console.error(`${source.name}数据源测试失败:`, error.message);
    }
  }
  
  console.log('\n=== 调试完成 ===');
}

debugFullFlow();
