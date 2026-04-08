import axios from 'axios';

// 测试前端数据获取问题
async function testFrontendDataFetch() {
  console.log('=== 前端数据获取问题诊断 ===');
  
  // 测试腾讯数据源（前端使用的URL）
  console.log('\n1. 测试腾讯数据源（前端使用）...');
  
  const testCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688', 'sh600000'];
  
  for (const code of testCodes) {
    try {
      const response = await axios.get(`https://qt.gtimg.cn/q=${code}`, {
        headers: {
          'Referer': 'https://finance.qq.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'zh-CN,zh;q=0.9',
          'Connection': 'keep-alive'
        },
        timeout: 5000
      });
      
      console.log(`✅ ${code}: 连接成功`);
      console.log('响应数据:', response.data);
      
      // 解析数据
      const lines = response.data.split('\n');
      for (const line of lines) {
        if (!line) continue;
        
        const match = line.match(/v_(\w+)="([^"]+)"/);
        if (match) {
          const tencentCode = match[1];
          const values = match[2].split('~');
          
          console.log(`\n解析结果:`);
          console.log(`股票代码: ${tencentCode}`);
          console.log(`股票名称: ${values[1]}`);
          console.log(`价格(index 3): ${values[3]}`);
          console.log(`收盘价(index 4): ${values[4]}`);
          console.log(`开盘价(index 5): ${values[5]}`);
          console.log(`最高价(index 33): ${values[33]}`);
          console.log(`最低价(index 34): ${values[34]}`);
          
          // 测试数据解析
          const priceValue = parseFloat(values[3]);
          const closeValue = parseFloat(values[4]);
          const openValue = parseFloat(values[5]);
          const highValue = parseFloat(values[33]);
          const lowValue = parseFloat(values[34]);
          
          console.log('解析后的值:');
          console.log(`价格: ${priceValue}`);
          console.log(`收盘价: ${closeValue}`);
          console.log(`开盘价: ${openValue}`);
          console.log(`最高价: ${highValue}`);
          console.log(`最低价: ${lowValue}`);
          
          // 检查是否为0
          if (priceValue === 0 || isNaN(priceValue)) {
            console.log('❌ 价格数据为0或无效');
          } else {
            console.log('✅ 价格数据正常');
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ ${code}: 连接失败`, error.message);
    }
    
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 测试多股票批量请求
  console.log('\n2. 测试多股票批量请求...');
  try {
    const tencentCodes = testCodes.join(',');
    const response = await axios.get(`https://qt.gtimg.cn/q=${tencentCodes}`, {
      headers: {
        'Referer': 'https://finance.qq.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Connection': 'keep-alive'
      },
      timeout: 5000
    });
    
    console.log('✅ 批量请求成功');
    console.log('响应数据长度:', response.data.length);
    
    const lines = response.data.split('\n');
    console.log('返回的股票数量:', lines.length);
    
    let successCount = 0;
    let zeroCount = 0;
    
    for (const line of lines) {
      if (!line) continue;
      
      const match = line.match(/v_(\w+)="([^"]+)"/);
      if (match) {
        const tencentCode = match[1];
        const values = match[2].split('~');
        
        const priceValue = parseFloat(values[3]);
        
        if (priceValue > 0 && !isNaN(priceValue)) {
          successCount++;
        } else {
          zeroCount++;
          console.log(`❌ ${tencentCode}: 价格为0或无效: ${priceValue}`);
        }
      }
    }
    
    console.log(`\n批量请求结果:`);
    console.log(`成功解析: ${successCount}/${lines.length}`);
    console.log(`价格为0: ${zeroCount}/${lines.length}`);
    
  } catch (error) {
    console.log('❌ 批量请求失败', error.message);
  }
  
  // 测试数据解析逻辑
  console.log('\n3. 测试数据解析逻辑...');
  
  // 模拟腾讯返回的数据格式
  const mockTencentData = `v_sh000001="1~上证指数~3500.12~3500.12~3480.56~3510.25~125000000~12500000000~0.12~0.0034~3500.12~3480.56~3510.25~3480.56~125000000~12500000000~0.12~0.0034~0~0~0~0~0~0~0~0~0~0~3500.12~3480.56~3510.25~3480.56~125000000/12500000000/0.0034"`;
  
  const match = mockTencentData.match(/v_(\w+)="([^"]+)"/);
  if (match) {
    const tencentCode = match[1];
    const values = match[2].split('~');
    
    console.log('模拟数据解析结果:');
    console.log(`股票代码: ${tencentCode}`);
    console.log(`股票名称: ${values[1]}`);
    console.log(`价格(index 3): ${values[3]}`);
    console.log(`解析价格: ${parseFloat(values[3])}`);
    
    if (parseFloat(values[3]) > 0) {
      console.log('✅ 解析成功');
    } else {
      console.log('❌ 解析失败');
    }
  }
}

// 运行测试
testFrontendDataFetch().catch(console.error);
