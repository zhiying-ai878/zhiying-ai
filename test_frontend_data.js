
// 测试前端数据更新逻辑
import { getStockDataSource } from './src/utils/stockData.js';

async function testFrontendData() {
  console.log('=== 测试前端数据更新逻辑 ===');
  
  try {
    const dataSource = getStockDataSource();
    
    // 模拟前端的股票数据结构
    const mockStocks = [
      { code: '300730', name: '科创信息', price: 0, change: 0, changePercent: 0 },
      { code: '600519', name: '贵州茅台', price: 0, change: 0, changePercent: 0 }
    ];
    
    console.log('模拟前端股票数据:', mockStocks);
    
    // 获取代码列表
    const codes = mockStocks.map(stock => stock.code);
    console.log('获取代码列表:', codes);
    
    // 获取实时数据
    const results = await dataSource.getRealtimeQuote(codes);
    console.log('获取到的实时数据:', JSON.stringify(results, null, 2));
    
    if (results && results.length > 0) {
      console.log(`✓ 成功获取到 ${results.length} 个自选股数据`);
      
      // 创建代码到数据的映射
      const resultMap = new Map(results.map(r => [r.code, r]));
      console.log('创建的映射:', Array.from(resultMap.entries()));
      
      // 更新股票数据
      const updatedStocks = mockStocks.map(stock => {
        // 格式化代码（添加sh/sz前缀）
        const fullCode = stock.code.startsWith('6') ? `sh${stock.code}` : `sz${stock.code}`;
        const result = resultMap.get(fullCode);
        console.log(`匹配代码: ${stock.code} -> ${fullCode}, 找到数据: ${!!result}`);
        return result ? {
          code: result.code,
          name: result.name,
          price: result.price,
          change: result.change,
          changePercent: result.changePercent
        } : stock;
      });
      
      console.log('更新后的股票数据:', JSON.stringify(updatedStocks, null, 2));
      
    } else {
      console.log('✗ 未获取到自选股数据');
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testFrontendData();

