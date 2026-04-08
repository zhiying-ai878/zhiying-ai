// 测试东方财富数据源的不同API端点
import axios from 'axios';

console.log('=== 测试东方财富不同API端点 ===');

const testCodes = ['600519', '000001', '002594'];

// 不同的东方财富API端点
const eastmoneyEndpoints = [
  {
    name: 'push2.eastmoney.com',
    url: 'https://push2.eastmoney.com/api/qt/stock/get',
    params: (code) => {
      const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
      return {
        secid: secid,
        fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f107,f116,f117,f127'
      };
    }
  },
  {
    name: 'web.eastmoney.com',
    url: 'https://web.eastmoney.com/newquote',
    params: (code) => {
      return {
        code: code,
        type: code.startsWith('6') ? '1' : '0'
      };
    }
  },
  {
    name: 'push2his.eastmoney.com',
    url: 'https://push2his.eastmoney.com/api/qt/stock/kline/get',
    params: (code) => {
      const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
      return {
        secid: secid,
        klt: '101',
        fqt: '0',
        beg: '20240101',
        end: '20241231'
      };
    }
  },
  {
    name: 'api.eastmoney.com',
    url: 'https://api.eastmoney.com/data/feed',
    params: (code) => {
      const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
      return {
        secids: secid,
        fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60'
      };
    }
  }
];

async function testEastmoneyEndpoints() {
  for (const endpoint of eastmoneyEndpoints) {
    console.log(`\n测试 ${endpoint.name}...`);
    
    for (const code of testCodes) {
      try {
        const response = await axios.get(endpoint.url, {
          params: {
            ...endpoint.params(code),
            _: Date.now().toString()
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
        
        console.log(`  ✓ ${code}: 成功 - 响应长度: ${JSON.stringify(response.data).length} 字符`);
        
      } catch (error) {
        console.log(`  ✗ ${code}: 失败 - ${error.message}`);
      }
    }
  }
}

testEastmoneyEndpoints();
