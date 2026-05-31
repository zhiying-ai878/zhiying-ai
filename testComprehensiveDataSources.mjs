import fetch from 'node-fetch';

// 测试各种可能的数据源
async function testDataSources() {
  console.log('=== 全面数据源测试 ===');
  
  const dataSources = [
    {
      name: '东方财富实时行情',
      url: 'http://push2.eastmoney.com/api/qt/stock/get',
      params: {
        secid: '1.600000',
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fltt: '2',
        invt: '2',
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        _: Date.now()
      },
      method: 'GET'
    },
    {
      name: '金融界实时行情',
      url: 'http://api.jrj.com.cn/json/tonghuashun/stock',
      params: {
        code: '600000',
        t: Date.now()
      },
      method: 'GET'
    },
    {
      name: '和讯网实时行情',
      url: 'http://stockdata.stock.hexun.com/zrb/StockSearch.aspx',
      params: {
        keyword: '600000',
        issearch: 1,
        isinner: 0
      },
      method: 'GET'
    },
    {
      name: '新浪财经备用接口',
      url: 'http://hq.sinajs.cn',
      params: {
        list: 'sh600000'
      },
      method: 'GET'
    },
    {
      name: '网易财经备用接口',
      url: 'http://api.money.126.net/data/feed/0600000',
      params: {
        callback: 'refresh_0600000'
      },
      method: 'GET'
    },
    {
      name: '同花顺行情中心',
      url: 'http://qt.gtimg.cn/q',
      params: {
        qs: 'sh600000'
      },
      method: 'GET'
    },
    {
      name: '新浪财经API',
      url: 'https://stock.finance.sina.com.cn/stock/jsonp.php/var%20hq_str_sh600000=',
      params: {
        url: '/US_DT_AjaxService/GetUSDTList',
        exchange: 'US',
        type: 'USDT',
        page: '1',
        num: '40',
        sort: 'ChangePercent',
        order: 'desc',
        _: Date.now()
      },
      method: 'GET'
    },
    {
      name: '东方财富API',
      url: 'http://quote.eastmoney.com/stock',
      params: {
        code: 'SH600000'
      },
      method: 'GET'
    },
    {
      name: '雪球备用接口',
      url: 'https://xueqiu.com/stock/forchartk/stocklist.json',
      params: {
        symbol: 'SH600000',
        period: 'day',
        type: 'normal',
        begin: '20240101',
        end: '20241231',
        _: Date.now()
      },
      method: 'GET'
    },
    {
      name: '同花顺API',
      url: 'http://api.finance.10jqka.com.cn',
      params: {
        type: 'detail',
        code: 'sh600000',
        _: Date.now()
      },
      method: 'GET'
    },
    {
      name: '金融界API',
      url: 'http://quotes.money.163.com/service/chddata.html',
      params: {
        code: '0600000',
        start: '20240101',
        end: '20241231',
        fields1: 'TCLOSE;HIGH;LOW;TOPEN;LCLOSE;CHG;PCHG;TURNOVER;VOTURNOVER;VATURNOVER',
        fields2: 'TCLOSE;HIGH;LOW;TOPEN;LCLOSE;CHG;PCHG;TURNOVER;VOTURNOVER;VATURNOVER'
      },
      method: 'GET'
    },
    {
      name: '新浪财经行情接口',
      url: 'http://stock.finance.sina.com.cn/stock/us/US_DT_AjaxService',
      params: {
        url: '/GetUSDTList',
        exchange: 'US',
        type: 'USDT',
        page: '1',
        num: '40',
        sort: 'ChangePercent',
        order: 'desc',
        _: Date.now()
      },
      method: 'GET'
    },
    {
      name: '东方财富移动版',
      url: 'http://m.eastmoney.com/api/stock',
      params: {
        code: 'SH600000',
        t: Date.now()
      },
      method: 'GET'
    },
    {
      name: '同花顺移动版',
      url: 'http://m.10jqka.com.cn',
      params: {
        code: 'sh600000',
        t: Date.now()
      },
      method: 'GET'
    },
    {
      name: '腾讯行情接口4',
      url: 'https://web.ifzq.gtimg.cn/appstock/app/kline/kline',
      params: {
        param: 'sh600000,day,2024-01-01,2024-12-31',
        _: Date.now()
      },
      method: 'GET'
    }
  ];

  const results = [];

  for (const source of dataSources) {
    try {
      console.log(`\n测试: ${source.name}`);
      
      const url = new URL(source.url);
      if (source.params) {
        Object.keys(source.params).forEach(key => {
          url.searchParams.append(key, source.params[key]);
        });
      }

      const startTime = Date.now();
      const response = await fetch(url.toString(), {
        method: source.method || 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Referer': 'https://www.google.com/',
          'Origin': 'https://www.google.com'
        },
        timeout: 5000
      });
      const endTime = Date.now();
      
      const result = {
        name: source.name,
        url: url.toString(),
        status: response.status,
        statusText: response.statusText,
        time: endTime - startTime,
        headers: {},
        hasCors: false
      };

      // 检查CORS头
      const accessControlAllowOrigin = response.headers.get('Access-Control-Allow-Origin');
      result.hasCors = accessControlAllowOrigin === '*' || accessControlAllowOrigin !== null;
      
      // 获取响应头信息
      response.headers.forEach((value, key) => {
        result.headers[key] = value;
      });

      // 获取响应大小
      const text = await response.text();
      result.size = text.length;
      result.sample = text.substring(0, 200) + (text.length > 200 ? '...' : '');

      results.push(result);
      
      console.log(`状态码: ${response.status}`);
      console.log(`响应时间: ${result.time}ms`);
      console.log(`响应大小: ${result.size} bytes`);
      console.log(`CORS支持: ${result.hasCors ? '✅' : '❌'}`);
      console.log(`响应示例: ${result.sample}`);

    } catch (error) {
      console.log(`❌ 测试失败: ${error.message}`);
      results.push({
        name: source.name,
        url: source.url,
        error: error.message,
        status: 'error'
      });
    }
  }

  console.log('\n=== 测试结果汇总 ===');
  console.table(results.map(r => ({
    name: r.name,
    status: r.status,
    time: r.time,
    size: r.size,
    hasCors: r.hasCors ? '✅' : '❌'
  })));

  return results;
}

// 运行测试
testDataSources().catch(console.error);
