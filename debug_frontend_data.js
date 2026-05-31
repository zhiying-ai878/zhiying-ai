
import axios from 'axios';

async function testFrontendDataProcessing() {
  console.log('=== 测试前端数据处理 ===');
  
  // 测试指数数据
  console.log('\n1. 测试指数数据处理:');
  const indexCodes = ['sh000001', 'sh000688'];
  
  for (const code of indexCodes) {
    try {
      const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
        params: {
          secid: code.startsWith('sh') ? `1.${code.substring(2)}` : `0.${code.substring(2)}`,
          fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
          _: Date.now().toString()
        },
        headers: {
          'Referer': 'https://quote.eastmoney.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        },
        timeout: 5000
      });
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        console.log(`\n${code} 原始数据:`);
        console.log(`f43(当前价格): ${data.f43}`);
        console.log(`f46(开盘价): ${data.f46}`);
        console.log(`f44(最高价): ${data.f44}`);
        console.log(`f45(最低价): ${data.f45}`);
        console.log(`f60(收盘价): ${data.f60}`);
        console.log(`f169(涨跌额): ${data.f169}`);
        console.log(`f170(涨跌幅): ${data.f170}`);
        
        // 正确的处理方式
        const price = data.f43 / 100;
        const open = data.f46 / 100;
        const high = data.f44 / 100;
        const low = data.f45 / 100;
        const close = data.f60 / 100;
        const change = data.f169 ? data.f169 / 100 : price - close;
        const changePercent = data.f170 !== undefined ? data.f170 / 100 : ((price - close) / close) * 100;
        
        console.log(`\n正确处理后的数据:`);
        console.log(`价格: ${price.toFixed(2)}`);
        console.log(`开盘: ${open.toFixed(2)}`);
        console.log(`最高: ${high.toFixed(2)}`);
        console.log(`最低: ${low.toFixed(2)}`);
        console.log(`收盘: ${close.toFixed(2)}`);
        console.log(`涨跌额: ${change.toFixed(2)}`);
        console.log(`涨跌幅: ${changePercent.toFixed(2)}%`);
        
        // 错误的处理方式（模拟前端可能的错误）
        console.log(`\n错误处理模拟:`);
        console.log(`错误1 - 没有除以100: ${data.f43}`);
        console.log(`错误2 - 除以10000: ${(data.f43 / 10000).toFixed(2)}`);
        console.log(`错误3 - 除以3500: ${(data.f43 / 3500).toFixed(2)}`);
        console.log(`错误4 - 除以3064: ${(data.f43 / 3064).toFixed(2)}`);
        
      }
    } catch (error) {
      console.error(`获取${code}数据失败:`, error.message);
    }
  }
  
  // 测试股票数据
  console.log('\n\n2. 测试股票数据处理:');
  const stockCodes = ['002594', '301179'];
  
  for (const code of stockCodes) {
    try {
      const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
        params: {
          secid: code.startsWith('6') ? `1.${code}` : `0.${code}`,
          fields: 'f43,f44,f45,f46,f47,f48,f49,f50,f51,f52,f57,f58,f60,f169,f170',
          _: Date.now().toString()
        },
        headers: {
          'Referer': 'https://quote.eastmoney.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
        },
        timeout: 5000
      });
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        const currentPrice = data.f43 / 100;
        console.log(`\n${code} 当前价格: ${currentPrice.toFixed(2)}元`);
        
        // 获取K线数据用于预测
        const klineResponse = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
          params: {
            secid: code.startsWith('6') ? `1.${code}` : `0.${code}`,
            klt: 101,
            fqt: 1,
            lmt: 60,
            fields1: 'f1,f2,f3,f4,f5,f6',
            fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61'
          },
          headers: {
            'Referer': 'https://quote.eastmoney.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
          },
          timeout: 5000
        });
        
        if (klineResponse.data && klineResponse.data.data && klineResponse.data.data.klines) {
          const klines = klineResponse.data.data.klines;
          console.log(`获取到${klines.length}条K线数据`);
          
          if (klines.length > 0) {
            const lastKline = klines[klines.length - 1].split(',');
            const lastClose = parseFloat(lastKline[4]) / 100;
            console.log(`最近收盘价: ${lastClose.toFixed(2)}元`);
            
            // 模拟预测计算
            console.log(`\n预测计算:`);
            console.log(`当前价格: ${currentPrice.toFixed(2)}元`);
            console.log(`最近收盘价: ${lastClose.toFixed(2)}元`);
            
            // 正常预测（基于最近收盘价）
            const predictedPrice1 = lastClose * 1.05; // 上涨5%
            const upsidePotential1 = ((predictedPrice1 - currentPrice) / currentPrice) * 100;
            console.log(`正常预测价格: ${predictedPrice1.toFixed(2)}元, 上涨空间: ${upsidePotential1.toFixed(2)}%`);
            
            // 错误预测（使用了错误的基数）
            const wrongBase = lastClose / 4; // 错误地除以4
            const predictedPrice2 = wrongBase * 1.05;
            const upsidePotential2 = ((predictedPrice2 - currentPrice) / currentPrice) * 100;
            console.log(`错误预测价格: ${predictedPrice2.toFixed(2)}元, 上涨空间: ${upsidePotential2.toFixed(2)}%`);
            
            // 另一种错误预测
            const wrongBase2 = lastClose * 2.5; // 错误地乘以2.5
            const predictedPrice3 = wrongBase2 * 1.05;
            const upsidePotential3 = ((predictedPrice3 - currentPrice) / currentPrice) * 100;
            console.log(`另一种错误预测: ${predictedPrice3.toFixed(2)}元, 上涨空间: ${upsidePotential3.toFixed(2)}%`);
          }
        }
      }
    } catch (error) {
      console.error(`获取${code}数据失败:`, error.message);
    }
  }
}

testFrontendDataProcessing();
