import fetch from 'node-fetch';

// 终极数据源测试 - 搜索所有可能的数据源
async function testUltimateDataSources() {
  console.log('=== 终极数据源测试 ===');
  
  const dataSources = [
    // 腾讯系列接口
    {
      name: '腾讯行情接口13',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        rn: Date.now()
      },
      method: 'GET'
    },
    {
      name: '腾讯行情接口14',
      url: 'https://qt.gtimg.cn/q',
      params: {
        qs: 'sh600000',
        rn: Date.now()
      },
      method: 'GET'
    },
    {
      name: '腾讯行情接口15',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    // 东方财富系列接口
    {
      name: '东方财富接口5',
      url: 'http://push2his.eastmoney.com/api/qt/stock/kline/get',
      params: {
        secid: '1.600000',
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        klt: '101',
        fqt: '0',
        beg: '20240101',
        end: '20241231',
        _: Date.now()
      },
      method: 'GET'
    },
    
    // 新浪系列接口
    {
      name: '新浪财经接口5',
      url: 'http://hq.sinajs.cn',
      params: {
        list: 'sh600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    // 网易系列接口
    {
      name: '网易财经接口5',
      url: 'http://api.money.126.net/data/feed/0600000',
      params: {
        callback: 'refresh_0600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    // 雪球系列接口
    {
      name: '雪球接口5',
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
    
    // 同花顺系列接口
    {
      name: '同花顺接口5',
      url: 'http://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    // 金融界系列接口
    {
      name: '金融界接口4',
      url: 'http://api.jrj.com.cn/json/tonghuashun/stock',
      params: {
        code: '600000',
        t: Date.now()
      },
      method: 'GET'
    },
    
    // 和讯网系列接口
    {
      name: '和讯网接口4',
      url: 'http://stockdata.stock.hexun.com/zrb/StockSearch.aspx',
      params: {
        keyword: '600000',
        issearch: 1,
        isinner: 0,
        _: Date.now()
      },
      method: 'GET'
    },
    
    // 上海证券交易所系列接口
    {
      name: '上海证券交易所接口3',
      url: 'http://query.sse.com.cn/security/stock/queryCompanyInfo.do',
      params: {
        jsonCallBack: 'jsonpCallback',
        isPagination: 'false',
        stockCode: '600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    // 深圳证券交易所系列接口
    {
      name: '深圳证券交易所接口3',
      url: 'http://www.szse.cn/api/report/ShowReport',
      params: {
        SHOWTYPE: 'JSON',
        CATALOGID: '1110',
        TABKEY: 'tab1',
        stockcode: '000001',
        random: Math.random(),
        _: Date.now()
      },
      method: 'GET'
    },
    
    // 国际数据源
    {
      name: 'Alpha Vantage接口',
      url: 'https://www.alphavantage.co/query',
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: '600000.SS',
        apikey: 'demo'
      },
      method: 'GET'
    },
    
    {
      name: 'Finnhub接口',
      url: 'https://finnhub.io/api/v1/quote',
      params: {
        symbol: '600000.SS',
        token: 'demo'
      },
      method: 'GET'
    },
    
    // 其他可能的数据源
    {
      name: '腾讯行情接口16',
      url: 'https://web.ifzq.gtimg.cn/appstock/app/kline/kline',
      params: {
        param: 'sh600000,day,2024-01-01,2024-12-31',
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '腾讯行情接口17',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        rn: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '腾讯行情接口18',
      url: 'https://qt.gtimg.cn/q',
      params: {
        qs: 'sh600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '东方财富接口6',
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
      name: '新浪财经接口6',
      url: 'https://stock.finance.sina.com.cn/stock',
      params: {
        code: 'sh600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '网易财经接口6',
      url: 'http://quotes.money.163.com/service/chddata.html',
      params: {
        code: '0600000',
        start: '20240101',
        end: '20241231',
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '雪球接口6',
      url: 'https://xueqiu.com/v4/stock/quote.json',
      params: {
        code: 'SH600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '同花顺接口6',
      url: 'http://api.finance.10jqka.com.cn',
      params: {
        type: 'detail',
        code: 'sh600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '金融界接口5',
      url: 'http://api.jrj.com.cn/json/tonghuashun/stock',
      params: {
        code: '600000',
        t: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '和讯网接口5',
      url: 'http://stockdata.stock.hexun.com/zrb/StockSearch.aspx',
      params: {
        keyword: '600000',
        issearch: 1,
        isinner: 0,
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '腾讯行情接口19',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '腾讯行情接口20',
      url: 'https://qt.gtimg.cn/q',
      params: {
        qs: 'sh600000',
        rn: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '东方财富接口7',
      url: 'http://push2his.eastmoney.com/api/qt/stock/kline/get',
      params: {
        secid: '1.600000',
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        klt: '101',
        fqt: '0',
        beg: '20240101',
        end: '20241231',
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '新浪财经接口7',
      url: 'http://hq.sinajs.cn',
      params: {
        list: 'sh600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '网易财经接口7',
      url: 'http://api.money.126.net/data/feed/0600000',
      params: {
        callback: 'refresh_0600000',
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '雪球接口7',
      url: 'https://xueqiu.com/stock/screener/screen',
      params: {
        count: 30,
        index: 0,
        order: 'desc',
        sortName: 'percent',
        page: 'true',
        _: Date.now()
      },
      method: 'GET'
    },
    
    {
      name: '同花顺接口7',
      url: 'http://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
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
testUltimateDataSources().catch(console.error);
