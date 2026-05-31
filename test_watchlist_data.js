
import { smartDataRequest } from './smart_data_source_manager.js';

async function testWatchlistData() {
  console.log('=== 测试自选股数据获取 ===');
  
  // 测试用户自选股代码
  const watchlistCodes = ['300389', '300480'];
  
  console.log('测试自选股代码:', watchlistCodes);
  
  try {
    // 测试原始代码（没有市场前缀）
    console.log('\n1. 测试原始代码（没有市场前缀）:');
    const results1 = await smartDataRequest(watchlistCodes, 'realtime');
    console.log('结果:', JSON.stringify(results1, null, 2));
    
    // 测试添加市场前缀的代码
    console.log('\n2. 测试添加市场前缀的代码:');
    const formattedCodes = watchlistCodes.map(code => {
      return code.startsWith('6') ? `sh${code}` : `sz${code}`;
    });
    console.log('格式化后的代码:', formattedCodes);
    
    const results2 = await smartDataRequest(formattedCodes, 'realtime');
    console.log('结果:', JSON.stringify(results2, null, 2));
    
    // 测试单个股票
    console.log('\n3. 测试单个股票:');
    for (const code of watchlistCodes) {
      const formattedCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
      console.log(`测试股票: ${code} -> ${formattedCode}`);
      const result = await smartDataRequest([formattedCode], 'realtime');
      console.log('结果:', JSON.stringify(result, null, 2));
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
  
  console.log('\n=== 测试完成 ===');
}

testWatchlistData();
