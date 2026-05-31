
// 调试前端数据更新逻辑
const axios = require('axios');

// 模拟前端数据更新逻辑
async function debugFrontendUpdate() {
  console.log('=== 调试前端数据更新逻辑 ===');
  
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
    const { smartDataRequest } = require('./smart_data_source_manager.js');
    const results = await smartDataRequest(codes, 'realtime');
    
    console.log('获取到的实时数据:', JSON.stringify(results, null, 2));
    
    // 创建代码到数据的映射
    const resultMap = new Map();
    Object.keys(results).forEach(code => {
      const data = results[code];
      if (data) {
        // 确保code格式正确
        const fullCode = code.startsWith('6') ? `sh${code}` : `sz${code}`;
        resultMap.set(fullCode, {
          code: fullCode,
          name: data.name,
          price: data.price,
          change: data.change,
          changePercent: data.changePercent
        });
      }
    });
    
    console.log('创建的数据映射:', Array.from(resultMap.entries()));
    
    // 更新股票数据
    const updatedStocks = stocks.map(stock => {
      console.log(`处理股票: ${stock.code}, 名称: ${stock.name}`);
      
      // 这里是问题所在！如果stock.code已经带前缀，这里会重复添加
      // const fullCode = stock.code.startsWith('6') ? `sh${stock.code}` : `sz${stock.code}`;
      
      // 正确的做法是检查是否已经带前缀
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
    
    return updatedStocks;
    
  } catch (error) {
    console.error('获取实时数据失败:', error);
    return stocks;
  }
}

// 运行调试
debugFrontendUpdate();
