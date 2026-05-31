// 测试所有数据源的可用性
import axios from 'axios';

console.log('=== 测试所有数据源可用性 ===');

// 测试股票代码
const testCodes = ['600519', '000001', '002594'];

// 数据源配置
const dataSources = [
  {
    name: '腾讯',
    url: 'https://qt.gtimg.cn/q=',
    codeFormatter: (code) => code.startsWith('6') ? `sh${code}` : `sz${code}`,
    test: async (codes) => {
      const formattedCodes = codes.map(code => code.startsWith('6') ? `sh${code}` : `sz${code}`).join(',');
      const url = `https://qt.gtimg.cn/q=${formattedCodes}`;
      try {
        const response = await axios.get(url, {
          headers: {
            'Referer': 'https://finance.qq.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 8000
        });
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },
  {
    name: '新浪',
    url: 'https://hq.sinajs.cn/list=',
    codeFormatter: (code) => code.startsWith('6') ? `sh${code}` : `sz${code}`,
    test: async (codes) => {
      const formattedCodes = codes.map(code => code.startsWith('6') ? `sh${code}` : `sz${code}`).join(',');
      const url = `https://hq.sinajs.cn/list=${formattedCodes}`;
      try {
        const response = await axios.get(url, {
          headers: {
            'Referer': 'https://finance.sina.com.cn/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          timeout: 8000
        });
        return { success: true, data: response.data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    }
  },
  {
    name: '东方财富',
    url: 'https://api.eastmoney.com/data/feed',
    codeFormatter: (code) => code.startsWith('6') ? `1.${code}` : `0.${code}`,
    test: async (codes) => {
      const results = [];
      for (const code of codes) {
        const secid = code.startsWith('6') ? `1.${code}` : `0.${code}`;
        const url = 'https://api.eastmoney.com/data/feed';
        try {
          const response = await axios.get(url, {
            params: {
              secids: secid,
              fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60',
              _: Date.now().toString()
            },
            headers: {
              'Referer': 'https://quote.eastmoney.com/',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 8000
          });
          results.push({ code, success: true, data: response.data });
        } catch (error) {
          results.push({ code, success: false, error: error.message });
        }
      }
      return results;
    }
  },
  {
    name: '雪球',
    url: 'https://xueqiu.com/service/v5/stock/screener/quote/list',
    test: async (codes) => {
      const results = [];
      for (const code of codes) {
        const symbol = code.startsWith('6') ? `SH${code}` : `SZ${code}`;
        const url = 'https://xueqiu.com/service/v5/stock/screener/quote/list';
        try {
          const response = await axios.get(url, {
            params: {
              symbol: symbol,
              count: 1,
              order_by: 'percent',
              order: 'desc'
            },
            headers: {
              'Referer': 'https://xueqiu.com/',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 8000
          });
          results.push({ code, success: true, data: response.data });
        } catch (error) {
          results.push({ code, success: false, error: error.message });
        }
      }
      return results;
    }
  }
];

async function testAllDataSources() {
  for (const source of dataSources) {
    console.log(`\n测试 ${source.name} 数据源...`);
    try {
      const result = await source.test(testCodes);
      if (Array.isArray(result)) {
        result.forEach(item => {
          if (item.success) {
            console.log(`  ✓ ${item.code}: 成功`);
          } else {
            console.log(`  ✗ ${item.code}: 失败 - ${item.error}`);
          }
        });
      } else {
        if (result.success) {
          console.log(`  ✓ 成功`);
          console.log(`  响应长度: ${result.data.length} 字符`);
        } else {
          console.log(`  ✗ 失败 - ${result.error}`);
        }
      }
    } catch (error) {
      console.log(`  ✗ 异常 - ${error.message}`);
    }
  }
}

testAllDataSources();
