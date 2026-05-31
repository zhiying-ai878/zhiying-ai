
// 测试前端数据更新修复
import { smartDataRequest } from './smart_data_source_manager.js';

// 模拟前端数据更新逻辑（修复后的版本）
async function testFrontendUpdate() {
  console.log('=== 测试前端数据更新修复 ===');
  
  // 模拟前端的股票数据
  const stocks = [
    { code: 'sh600519', name: '贵州茅台', price: 0, change: 0, changePercent: 0 },
    { code: 'sz000858', name: '五粮液', price: 0, change: 0, changePercent: 0 },
    { code: 'sz300750', name: '宁德时代', price: 0, change: 0, changePercent: 0 },
    { code: 'sh601318', name: '中国平安', price: 0, change: 0, changePercent: 0 },
    { code: 'sh600276', name: '恒瑞医药', price: 0, change: 0, changePercent: 0 },
    { code: 'sz300730', name: '科创信息', price: 0, change: 0, changePercent: 0 }
  ];
  
  console.log('初始股票数据:', stocks);
  
  // 获取实时数据
  const codes = stocks.map(stock => stock.code);
  console.log('要查询的股票代码:', codes);
  
  try {
    // 调用智能数据源管理器
    const results = await smartDataRequest(codes, 'realtime');
    
    console.log('获取到的实时数据:', JSON.stringify(results, null, 2));
    
    // 创建代码到数据的映射（修复后的逻辑）
    const resultMap = new Map();
    results.forEach(item => {
      resultMap.set(item.code, item);
    });
    
    console.log('创建的数据映射键:', Array.from(resultMap.keys()));
    
    // 更新股票数据（修复后的逻辑）
    const updatedStocks = stocks.map(stock => {
      console.log(`处理股票: ${stock.code}, 名称: ${stock.name}`);
      
      // 修复后的逻辑：检查是否已经带前缀
      let fullCode = stock.code;
      if (!fullCode.startsWith('sh') && !fullCode.startsWith('sz')) {
        fullCode = stock.code.startsWith('6') ? `sh${stock.code}` : `sz${stock.code}`;
      }
      
      console.log(`格式化代码: ${stock.code} -> ${fullCode}`);
      
      const result = resultMap.get(fullCode);
      console.log(`找到匹配数据: ${!!result}`);
      
      return result ? {
        code: result.code,
        name: result.name,
        price: result.price,
        change: result.change,
        changePercent: result.changePercent
      } : stock;
    });
    
    console.log('更新后的股票数据:', updatedStocks);
    
    // 检查是否所有股票都更新成功
    const successCount = updatedStocks.filter(stock => stock.price > 0).length;
    console.log(`成功更新: ${successCount}/${updatedStocks.length} 个股票`);
    
    return updatedStocks;
    
  } catch (error) {
    console.error('获取实时数据失败:', error);
    return stocks;
  }
}

// 运行测试
testFrontendUpdate();
