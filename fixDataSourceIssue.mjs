// 修复数据源连接问题，数据全是0的问题
import axios from 'axios';

// 测试修复方案
async function fixDataSourceIssue() {
  console.log('=== 修复数据源连接问题 ===');
  
  // 问题分析：从测试结果可以看到，数据源本身是正常的，能够返回正确的数据
  // 但是前端显示的数据都是0，说明问题可能在于数据解析或处理
  
  // 测试1: 验证数据源返回的数据格式
  console.log('\n1. 验证数据源返回的数据格式...');
  
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
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 测试2: 验证批量请求
  console.log('\n2. 验证批量请求...');
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
  
  // 测试3: 验证数据解析逻辑
  console.log('\n3. 验证数据解析逻辑...');
  
  // 模拟前端解析逻辑
  function parseTencentData(data) {
    const results = [];
    const lines = data.split('\n');
    
    for (const line of lines) {
      if (!line) continue;
      
      const match = line.match(/v_(\w+)="([^"]+)"/);
      if (match) {
        const tencentCode = match[1];
        const values = match[2].split('~');
        
        if (values.length >= 35) {
          let code = tencentCode;
          if (tencentCode.startsWith('sh')) {
            code = tencentCode.substring(2);
          } else if (tencentCode.startsWith('sz')) {
            code = tencentCode.substring(2);
          }
          
          // 解析价格数据
          const priceValue = parseFloat(values[3]);
          const closeValue = parseFloat(values[4]);
          const openValue = parseFloat(values[5]);
          const highValue = parseFloat(values[33]);
          const lowValue = parseFloat(values[34]);
          
          // 解析成交额
          let amount = 0;
          if (values[35] && values[35].includes('/')) {
            const amountParts = values[35].split('/');
            if (amountParts.length >= 3) {
              amount = parseFloat(amountParts[2]);
            }
          }
          
          const result = {
            code,
            name: values[1],
            price: priceValue,
            change: priceValue - closeValue,
            changePercent: ((priceValue - closeValue) / closeValue) * 100,
            open: openValue,
            high: highValue,
            low: lowValue,
            close: closeValue,
            volume: parseInt(values[6]),
            amount: amount
          };
          
          results.push(result);
        }
      }
    }
    
    return results;
  }
  
  // 测试解析逻辑
  try {
    const tencentCodes = 'sh000001,sz399001';
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
    
    const parsedData = parseTencentData(response.data);
    console.log('解析结果:', parsedData);
    
    // 检查解析结果
    parsedData.forEach(item => {
      console.log(`${item.name}: ${item.price}`);
      if (item.price === 0 || isNaN(item.price)) {
        console.log('❌ 解析失败');
      } else {
        console.log('✅ 解析成功');
      }
    });
    
  } catch (error) {
    console.log('❌ 解析测试失败', error.message);
  }
  
  console.log('\n=== 修复建议 ===');
  console.log('1. 数据源本身是正常的，能够返回正确的数据');
  console.log('2. 数据解析逻辑也是正确的');
  console.log('3. 问题可能在于前端组件没有正确调用数据获取函数');
  console.log('4. 或者数据获取函数返回的数据没有正确更新到状态');
  console.log('5. 建议检查前端组件的useEffect和数据更新逻辑');
}

// 运行修复测试
fixDataSourceIssue().catch(console.error);
