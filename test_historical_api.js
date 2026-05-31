import axios from 'axios';

async function testHistoricalAPI() {
  console.log('=== 测试历史数据API ===');
  
  // 测试不同的API参数
  const testCases = [
    {
      name: '基本参数',
      params: {
        secid: '0.002594',
        klt: 101,
        fqt: 1,
        end: Date.now(),
        lmt: 50
      }
    },
    {
      name: '不带end参数',
      params: {
        secid: '0.002594',
        klt: 101,
        fqt: 1,
        lmt: 50
      }
    },
    {
      name: '使用日期字符串',
      params: {
        secid: '0.002594',
        klt: 101,
        fqt: 1,
        end: '2026-03-28',
        lmt: 50
      }
    },
    {
      name: '使用不同的时间周期',
      params: {
        secid: '0.002594',
        klt: 102, // 周线
        fqt: 1,
        lmt: 20
      }
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n测试: ${testCase.name}`);
    console.log('参数:', testCase.params);
    
    try {
      const response = await axios.get('https://push2his.eastmoney.com/api/qt/stock/kline/get', {
        params: testCase.params,
        headers: {
          'Referer': 'https://quote.eastmoney.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000
      });
      
      console.log('响应状态:', response.status);
      console.log('响应数据:', JSON.stringify(response.data, null, 2));
      
      if (response.data && response.data.data && response.data.data.kline) {
        console.log(`✓ 成功获取 ${response.data.data.kline.length} 条数据`);
      } else {
        console.log('✗ 未获取到数据');
      }
      
    } catch (error) {
      console.error('请求失败:', error.message);
    }
  }
  
  console.log('\n=== 测试完成 ===');
}

testHistoricalAPI();
