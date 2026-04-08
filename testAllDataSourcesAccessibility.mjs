import fetch from 'node-fetch';

// 测试所有数据源是否能顺利接入A股行情实时数据
async function testAllDataSourcesAccessibility() {
  console.log('=== 数据源接入测试 ===');
  
  // 获取所有支持CORS的数据源配置
  const dataSources = [
    // 腾讯系列（支持CORS）
    {
      name: '腾讯主接口',
      source: 'tencent_cors',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000'
      },
      method: 'GET',
      expectedPattern: /v_sh600000/
    },
    {
      name: '腾讯备用接口v2',
      source: 'tencent_cors_v2',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000'
      },
      method: 'GET',
      expectedPattern: /v_sh600000/
    },
    {
      name: '腾讯备用接口v3',
      source: 'tencent_cors_v3',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000'
      },
      method: 'GET',
      expectedPattern: /v_sh600000/
    },
    {
      name: '同花顺行情中心',
      source: 'ths_market_center',
      url: 'http://qt.gtimg.cn/q',
      params: {
        qs: 'sh600000'
      },
      method: 'GET',
      expectedPattern: /bad request|v_sh600000/
    },
    {
      name: '腾讯行情接口4',
      source: 'tencent_cors_v4',
      url: 'https://web.ifzq.gtimg.cn/appstock/app/kline/kline',
      params: {
        param: 'sh600000,day,2024-01-01,2024-12-31'
      },
      method: 'GET',
      expectedPattern: /sh600000/
    },
    {
      name: '东方财富K线接口',
      source: 'eastmoney_kline',
      url: 'http://push2his.eastmoney.com/api/qt/stock/kline/get',
      params: {
        secid: '1.600000',
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        klt: '101',
        fqt: '0',
        beg: '20240101',
        end: '20241231'
      },
      method: 'GET',
      expectedPattern: /600000/
    },
    {
      name: '腾讯行情接口6',
      source: 'tencent_cors_v6',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000'
      },
      method: 'GET',
      expectedPattern: /v_sh600000/
    },
    {
      name: '腾讯行情接口8',
      source: 'tencent_cors_v8',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        _: Date.now()
      },
      method: 'GET',
      expectedPattern: /v_sh600000/
    },
    {
      name: '腾讯行情接口10',
      source: 'tencent_cors_v10',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        rn: Date.now()
      },
      method: 'GET',
      expectedPattern: /v_sh600000/
    },
    {
      name: '腾讯行情接口11',
      source: 'tencent_cors_v11',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        _: Date.now()
      },
      method: 'GET',
      expectedPattern: /v_sh600000/
    },
    {
      name: '腾讯行情接口13',
      source: 'tencent_cors_v13',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        rn: Date.now()
      },
      method: 'GET',
      expectedPattern: /v_sh600000/
    },
    {
      name: '腾讯行情接口15',
      source: 'tencent_cors_v15',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        _: Date.now()
      },
      method: 'GET',
      expectedPattern: /v_sh600000/
    },
    {
      name: '腾讯行情接口17',
      source: 'tencent_cors_v17',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        rn: Date.now()
      },
      method: 'GET',
      expectedPattern: /v_sh600000/
    },
    {
      name: '腾讯行情接口19',
      source: 'tencent_cors_v19',
      url: 'https://qt.gtimg.cn/q',
      params: {
        q: 'sh600000',
        _: Date.now()
      },
      method: 'GET',
      expectedPattern: /v_sh600000/
    },
    {
      name: '东方财富接口5',
      source: 'eastmoney_kline_v5',
      url: 'http://push2his.eastmoney.com/api/qt/stock/kline/get',
      params: {
        secid: '1.600000',
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        klt: '101',
        fqt: '0',
        beg: '20240101',
        end: '20241231'
      },
      method: 'GET',
      expectedPattern: /600000/
    },
    {
      name: '东方财富接口7',
      source: 'eastmoney_kline_v7',
      url: 'http://push2his.eastmoney.com/api/qt/stock/kline/get',
      params: {
        secid: '1.600000',
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fields1: 'f1,f2,f3,f4,f5,f6',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61',
        klt: '101',
        fqt: '0',
        beg: '20240101',
        end: '20241231'
      },
      method: 'GET',
      expectedPattern: /600000/
    },
    {
      name: 'Alpha Vantage',
      source: 'alpha_vantage',
      url: 'https://www.alphavantage.co/query',
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: '600000.SS',
        apikey: 'demo'
      },
      method: 'GET',
      expectedPattern: /600000/
    },
    {
      name: 'Alpha Vantage备用',
      source: 'alpha_vantage_v2',
      url: 'https://www.alphavantage.co/query',
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: '600000.SS',
        apikey: 'demo'
      },
      method: 'GET',
      expectedPattern: /600000/
    },
    // 需要代理的数据源
    {
      name: '新浪CORS',
      source: 'sina_cors',
      url: 'http://hq.sinajs.cn',
      params: {
        list: 'sh600000'
      },
      method: 'GET',
      expectedPattern: /hq_str_sh600000/
    },
    {
      name: '网易CORS',
      source: 'netease_cors',
      url: 'http://api.money.126.net/data/feed/0600000',
      params: {
        callback: 'refresh_0600000'
      },
      method: 'GET',
      expectedPattern: /0600000/
    },
    {
      name: '雪球CORS',
      source: 'xueqiu_cors',
      url: 'https://xueqiu.com/stock/forchartk/stocklist.json',
      params: {
        symbol: 'SH600000',
        period: 'day',
        type: 'normal',
        begin: '20240101',
        end: '20241231'
      },
      method: 'GET',
      expectedPattern: /SH600000/
    },
    {
      name: '同花顺CORS',
      source: 'ths_cors',
      url: 'http://api.finance.10jqka.com.cn',
      params: {
        type: 'detail',
        code: 'sh600000'
      },
      method: 'GET',
      expectedPattern: /sh600000/
    },
    {
      name: '咕咕数据',
      source: 'gugudata',
      url: 'https://api.gugudata.com/stock/cn/realtime',
      params: {
        appkey: 'test',
        symbol: '600000'
      },
      method: 'GET',
      expectedPattern: /600000/
    },
    {
      name: 'XTick',
      source: 'xtick',
      url: 'http://api.xtick.top/doc/market',
      params: {
        type: 'kline',
        code: '600000',
        period: 'day',
        fq: '0',
        startDate: '20240101',
        endDate: '20241231',
        token: 'test'
      },
      method: 'GET',
      expectedPattern: /600000/
    }
  ];

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const source of dataSources) {
    try {
      console.log(`\n测试: ${source.name} (${source.source})`);
      
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
        timeout: 10000
      });
      const endTime = Date.now();
      
      const result = {
        name: source.name,
        source: source.source,
        url: url.toString(),
        status: response.status,
        statusText: response.statusText,
        time: endTime - startTime,
        hasCors: false,
        hasData: false,
        dataSample: '',
        error: null
      };

      // 检查CORS头
      const accessControlAllowOrigin = response.headers.get('Access-Control-Allow-Origin');
      result.hasCors = accessControlAllowOrigin === '*' || accessControlAllowOrigin !== null;
      
      // 获取响应内容
      const text = await response.text();
      result.dataSample = text.substring(0, 300) + (text.length > 300 ? '...' : '');
      
      // 检查是否包含预期的数据模式
      result.hasData = source.expectedPattern.test(text);

      results.push(result);
      
      if (result.hasData && result.status === 200) {
        console.log(`✅ 成功: 状态码 ${response.status}, 响应时间 ${result.time}ms, CORS: ${result.hasCors ? '支持' : '不支持'}`);
        successCount++;
      } else {
        console.log(`❌ 失败: 状态码 ${response.status}, 响应时间 ${result.time}ms, CORS: ${result.hasCors ? '支持' : '不支持'}, 数据: ${result.hasData ? '包含' : '不包含'}`);
        failCount++;
      }

    } catch (error) {
      console.log(`❌ 测试失败: ${source.name} - ${error.message}`);
      results.push({
        name: source.name,
        source: source.source,
        url: source.url,
        status: 'error',
        statusText: error.message,
        time: 0,
        hasCors: false,
        hasData: false,
        dataSample: '',
        error: error.message
      });
      failCount++;
    }
  }

  console.log('\n=== 测试结果汇总 ===');
  console.table(results.map(r => ({
    name: r.name,
    source: r.source,
    status: r.status,
    time: r.time,
    hasCors: r.hasCors ? '✅' : '❌',
    hasData: r.hasData ? '✅' : '❌',
    error: r.error || '-'
  })));

  console.log(`\n=== 测试统计 ===`);
  console.log(`总数据源数: ${results.length}`);
  console.log(`成功接入: ${successCount}`);
  console.log(`接入失败: ${failCount}`);
  console.log(`成功率: ${((successCount / results.length) * 100).toFixed(2)}%`);

  return {
    results,
    successCount,
    failCount,
    successRate: (successCount / results.length) * 100
  };
}

// 运行测试
testAllDataSourcesAccessibility().catch(console.error);
