// 数据库初始化脚本
import { Database } from './src/utils/database.js';

async function initializeDatabase() {
    console.log('=== 开始初始化数据库 ===');
    
    try {
        // 获取数据库实例
        const db = Database.getInstance();
        
        // 连接数据库
        await db.connect();
        console.log('数据库连接成功');
        
        // 创建数据库表
        await db.createTables();
        console.log('数据库表创建成功');
        
        // 断开连接
        await db.disconnect();
        console.log('数据库断开连接');
        
        console.log('=== 数据库初始化完成 ===');
        
    } catch (error) {
        console.error('数据库初始化失败:', error.message);
        process.exit(1);
    }
}

// 执行初始化
initializeDatabase().catch(console.error);
