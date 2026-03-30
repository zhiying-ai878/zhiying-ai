// 调试市场监控管理器
import { getMarketMonitor } from './src/utils/marketMonitorManager.js';

async function debugMarketMonitor() {
    console.log('=== 开始调试市场监控管理器 ===');
    
    try {
        const marketMonitor = getMarketMonitor();
        console.log('获取市场监控管理器实例成功');
        
        console.log('开始扫描市场...');
        await marketMonitor.scanMarket();
        
        console.log('扫描完成，获取状态...');
        const status = marketMonitor.getStatus();
        console.log('市场监控状态:', status);
        
    } catch (error) {
        console.error('市场监控扫描失败:', error.message);
        console.error('错误详情:', error);
    }
}

debugMarketMonitor();
