
import axios from 'axios';

async function testFixedData() {
  console.log('=== 测试修复后的指数数据 ===');
  
  const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
  
  // 测试东方财富数据源（修复后）
  console.log('\n=== 测试东方财富数据源（修复后） ===');
  for (const code of indexCodes) {
    try {
      let secid;
      if (code.startsWith('sh')) {
        secid = `1.${code.substring(2)}`;
      } else if (code.startsWith('sz')) {
        secid = `0.${code.substring(2)}`;
      } else {
        continue;
      }
      
      const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
        params: {
          secid,
          fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
          _: Date.now().toString()
        },
        headers: {
          'Referer': 'https://quote.eastmoney.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 5000
      });
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        const price = data.f43 / 100;
        const close = data.f60 / 100;
        const change = data.f169 ? data.f169 / 100 : price - close;
        // 修复后的涨跌幅计算
        const changePercent = data.f170 ? data.f170 / 100 : ((price - close) / close) * 100;
        
        console.log(`${code} ${data.f58}: ${price} (${change >= 0 ? '+' : ''}${change.toFixed(2)}, ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
      }
    } catch (error) {
      console.error(`东方财富数据源获取${code}失败:`, error.message);
    }
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 测试东方财富迷你版数据源（修复后）
  console.log('\n=== 测试东方财富迷你版数据源（修复后） ===');
  try {
    const secids = indexCodes.map(code => {
      let cleanCode = code;
      if (code.startsWith('sh')) {
        cleanCode = code.substring(2);
      } else if (code.startsWith('sz')) {
        cleanCode = code.substring(2);
      }
      // 对于指数代码，使用特殊的secid格式
      const indexPatterns = [/^000\d{3}$/, /^399\d{3}$/, /^000001$/, /^399001$/, /^399006$/, /^000688$/];
      if (indexPatterns.some(pattern => pattern.test(cleanCode))) {
        // 指数代码：上证指数系列用1.，深证指数系列用0.
        return cleanCode.startsWith('000') ? `1.${cleanCode}` : `0.${cleanCode}`;
      } else {
        // 普通股票代码
        return cleanCode.startsWith('6') ? `1.${cleanCode}` : `0.${cleanCode}`;
      }
    }).join(',');
    
    const response = await axios.get('https://push2.eastmoney.com/api/qt/ulist.np/get', {
      params: {
        secids,
        fields: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f12,f13,f14,f15,f16,f17,f18,f20,f21,f23,f24,f25,f22,f11,f62,f128,f136,f115,f152,f135',
        _: Date.now().toString()
      },
      headers: {
        'Referer': 'https://quote.eastmoney.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });
    
    if (response.data && response.data.data && response.data.data.diff) {
      for (const item of response.data.data.diff) {
        const code = item.f12;
        // 处理指数代码，确保正确的市场前缀
        let fullCode = code;
        // 检查是否为指数代码模式
        const indexPatterns = [/^000\d{3}$/, /^399\d{3}$/, /^000001$/, /^399001$/, /^399006$/, /^000688$/];
        if (indexPatterns.some(pattern => pattern.test(code))) {
          // 根据指数代码确定市场
          if (code.startsWith('000')) {
            fullCode = `sh${code}`;
          } else if (code.startsWith('399')) {
            fullCode = `sz${code}`;
          }
        } else {
          // 普通股票代码
          fullCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
        }
        
        // 修复后的字段映射
        const price = item.f2 / 100;
        const change = item.f4 / 100;
        const changePercent = item.f3 / 100;
        
        console.log(`${fullCode} ${item.f14}: ${price} (${change >= 0 ? '+' : ''}${change.toFixed(2)}, ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`);
      }
    }
  } catch (error) {
    console.error('东方财富迷你版数据源测试失败:', error.message);
  }
  
  console.log('\n=== 测试完成 ===');
}

testFixedData().catch(console.error);
