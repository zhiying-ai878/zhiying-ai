import axios from 'axios';

async function testEastMoneyAPI() {
  try {
    console.log('测试东方财富API连接...');
    const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/get', {
      params: {
        secid: '1.600519',
        fields: 'f43,f44,f45,f46,f47,f48,f57,f58,f60'
      },
      headers: {
        'Referer': 'https://quote.eastmoney.com/'
      },
      timeout: 10000
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    } else if (error.request) {
      console.log('Request made but no response received');
    }
  }
}

testEastMoneyAPI();