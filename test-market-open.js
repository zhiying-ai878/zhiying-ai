// 测试isMarketOpen方法的逻辑
function isMarketOpen() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  console.log('当前时间:', now.toLocaleString('zh-CN'));
  console.log('星期:', dayOfWeek);
  console.log('小时:', hours);
  console.log('分钟:', minutes);
  
  // 周一到周五
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    // 上午：9:30-11:30
    const morningOpen = (hours === 9 && minutes >= 30) || (hours > 9 && hours < 11) || (hours === 11 && minutes < 30);
    // 下午：13:00-15:00
    const afternoonOpen = (hours === 13 && minutes >= 0) || (hours > 13 && hours < 15) || (hours === 15 && minutes === 0);
    
    console.log('上午交易时间:', morningOpen);
    console.log('下午交易时间:', afternoonOpen);
    
    return morningOpen || afternoonOpen;
  }
  
  return false;
}

console.log('市场是否开盘:', isMarketOpen());
