// 简单的数据库初始化脚本
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function initializeDatabase() {
    console.log('=== 开始初始化数据库 ===');
    
    try {
        // 创建SQLite数据库连接
        const db = await open({
            filename: './zhiying_ai.db',
            driver: sqlite3.Database
        });
        console.log('数据库连接成功');
        
        // 创建信号表
        await db.run(`
            CREATE TABLE IF NOT EXISTS signals (
                id TEXT PRIMARY KEY,
                stock_code TEXT NOT NULL,
                stock_name TEXT NOT NULL,
                type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
                score REAL NOT NULL,
                confidence REAL NOT NULL,
                reason TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                is_read INTEGER DEFAULT 0,
                is_auction_period INTEGER DEFAULT 0,
                main_force_flow INTEGER,
                main_force_ratio REAL,
                volume_amplification REAL,
                turnover_rate REAL,
                price REAL,
                target_price REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('信号表创建成功');

        // 创建持仓表
        await db.run(`
            CREATE TABLE IF NOT EXISTS positions (
                stock_code TEXT PRIMARY KEY,
                stock_name TEXT NOT NULL,
                entry_price REAL NOT NULL,
                volume INTEGER NOT NULL,
                entry_time INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('持仓表创建成功');

        // 创建股票数据历史表
        await db.run(`
            CREATE TABLE IF NOT EXISTS stock_data_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stock_code TEXT NOT NULL,
                stock_name TEXT NOT NULL,
                current_price REAL NOT NULL,
                main_force_net_flow INTEGER,
                total_net_flow INTEGER,
                super_large_order_flow INTEGER,
                large_order_flow INTEGER,
                medium_order_flow INTEGER,
                small_order_flow INTEGER,
                volume_amplification REAL,
                turnover_rate REAL,
                timestamp INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('股票数据历史表创建成功');

        // 创建索引
        await db.run('CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp);');
        await db.run('CREATE INDEX IF NOT EXISTS idx_signals_stock_code ON signals(stock_code);');
        await db.run('CREATE INDEX IF NOT EXISTS idx_stock_data_history_stock_code ON stock_data_history(stock_code);');
        await db.run('CREATE INDEX IF NOT EXISTS idx_stock_data_history_timestamp ON stock_data_history(timestamp);');
        console.log('索引创建成功');

        // 关闭连接
        await db.close();
        console.log('数据库断开连接');
        
        console.log('=== 数据库初始化完成 ===');
        
    } catch (error) {
        console.error('数据库初始化失败:', error.message);
        process.exit(1);
    }
}

// 执行初始化
initializeDatabase().catch(console.error);
