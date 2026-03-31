import axios from 'axios';

async function testDataSource() {
  console.log('=== 测试数据源连接 ===');
  
  // 测试新浪数据源
  try {
    console.log('测试新浪API...');
    const sinaResponse = await axios.get('http://hq.sinajs.cn/list=sh600519', {
      timeout: 3000
    });
    console.log('新浪API响应:', sinaResponse.data);
    
    // 解析新浪数据
    const match = sinaResponse.data.match(/hq_str_sh600519="([^"]+)"/);
    if (match) {
      const data = match[1].split(',');
      console.log('新浪数据解析结果:');
      console.log('股票名称:', data[0]);
      console.log('最新价格:', data[3]);
      console.log('涨跌幅:', data[32]);
    }
  } catch (error) {
    console.error('新浪API失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试腾讯数据源
  try {
    console.log('测试腾讯API...');
    const tencentResponse = await axios.get('https://qt.gtimg.cn/q=sh600519', {
      timeout: 3000
    });
    console.log('腾讯API响应:', tencentResponse.data);
  } catch (error) {
    console.error('腾讯API失败:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 测试东方财富数据源
  try {
    console.log('测试东方财富API...');
    const eastmoneyResponse = await axios.get('https://push2.eastmoney.com/api/qt/stock/get?secid=1.600519', {
      timeout: 3000
    });
    console.log('东方财富API响应:', JSON.stringify(eastmoneyResponse.data, null, 2));
  } catch (error) {
    console.error('东方财富API失败:', error.message);
  }
  
  console.log('\n=== 测试完成 ===');
}

testDataSource();
