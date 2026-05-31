
// 测试市场时间和状态
console.log('=== 测试市场时间和状态 ===');

// 获取当前时间
const now = new Date();
console.log(`当前时间: ${now.toLocaleString('zh-CN')}`);
console.log(`当前小时: ${now.getHours()}`);
console.log(`当前分钟: ${now.getMinutes()}`);

// 检查是否在交易时间内
function checkMarketStatus() {
    const hour = now.getHours();
    const minute = now.getMinutes();
    if ((hour === 9 && minute >= 30) || (hour === 10) || (hour === 11 && minute <= 30) ||
        (hour === 13) || (hour === 14) || (hour === 15 && minute === 0)) {
        return 'open';
    }
    else if (hour === 9 && minute >= 15 && minute <= 25) {
        return 'auction';
    }
    else {
        return 'closed';
    }
}

const marketStatus = checkMarketStatus();
console.log(`市场状态: ${marketStatus}`);

// 显示交易时间范围
console.log('\n交易时间范围:');
console.log('- 早盘: 9:30 - 11:30');
console.log('- 午盘: 13:00 - 15:00');
console.log('- 集合竞价: 9:15 - 9:25');
