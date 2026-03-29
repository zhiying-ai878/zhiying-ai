import axios from 'axios';

async function testHistoricalData() {
  console.log('=== 测试历史数据获取 ===');
  
  const stockCodes = ['002594', '600519', 'sz002594', 'sh600519'];
  
  for (const stockCode of stockCodes) {
    console.log(`\n测试股票代码: ${stockCode}`);
    
    try {
      // 处理股票代码格式
      let cleanCode = stockCode;
      if (stockCode.startsWith('sh')) {
        cleanCode = stockCode.substring(2);
      } else if (stockCode.startsWith('sz')) {
        cleanCode = stockCode.substring(2);
      }
      const marketCode = cleanCode.startsWith('6') ? '1' : '0';
      const secid = `${marketCode}.${cleanCode}`;
      
      console.log(`处理后代码: ${cleanCode}, 市场代码: ${marketCode}, secid: ${secid}`);
      
      const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
        params: {
          secid,
          klt: 101, // 日线
          fqt: 1, // 前复权
          end: Date.now(),
          lmt: 50
        },
        headers: {
          'Referer': 'https://quote.eastmoney.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Connection': 'keep-alive'
        },
        timeout: 10000
      });
      
      console.log('API响应状态:', response.status);
      
      if (response.data && response.data.data && response.data.data.kline) {
        const klines = response.data.data.kline;
        console.log(`成功获取 ${klines.length} 条历史数据`);
        console.log('最新5条数据:');
        klines.slice(-5).forEach((kline, index) => {
          console.log(`${index + 1}. ${kline[0]}: 开=${kline[1]/100}, 收=${kline[2]/100}, 高=${kline[3]/100}, 低=${kline[4]/100}`);
        });
      } else {
        console.log('未获取到数据:', response.data);
      }
      
    } catch (error) {
      console.error(`获取历史数据失败:`, error.message);
      console.error('错误详情:', error);
    }
  }
  
  console.log('\n=== 测试完成 ===');
}

testHistoricalData();
