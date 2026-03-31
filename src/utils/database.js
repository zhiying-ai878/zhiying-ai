import { Logger } from './stockData.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
const logger = Logger.getInstance();

export class Database {
    constructor() {
        Object.defineProperty(this, "db", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }

    async connect() {
        try {
            logger.info('正在连接数据库...');
            // 创建SQLite数据库连接
            this.db = await open({
                filename: './zhiying_ai.db',
                driver: sqlite3.Database
            });
            logger.info('数据库连接成功');
        }
        catch (error) {
            logger.error('数据库连接失败', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            logger.info('正在断开数据库连接...');
            if (this.db) {
                await this.db.close();
                this.db = null;
            }
            logger.info('数据库连接已断开');
        }
        catch (error) {
            logger.error('数据库断开连接失败', error);
            throw error;
        }
    }

    isConnected() {
        return this.db !== null;
    }

    // 数据库操作方法
    async executeQuery(query, params) {
        if (!this.db) {
            throw new Error('数据库未连接');
        }
        try {
            logger.info(`执行查询: ${query}`);
            const result = await this.db.all(query, params);
            return { rows: result };
        }
        catch (error) {
            logger.error('查询执行失败', error);
            throw error;
        }
    }

    // 创建数据库表
    async createTables() {
        if (!this.db) {
            throw new Error('数据库未连接');
        }
        try {
            logger.info('创建数据库表');
            
            // 创建信号表
            await this.db.run(`
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

            // 创建持仓表
            await this.db.run(`
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

            // 创建股票数据历史表
            await this.db.run(`
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

            // 创建索引
            await this.db.run('CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp);');
            await this.db.run('CREATE INDEX IF NOT EXISTS idx_signals_stock_code ON signals(stock_code);');
            await this.db.run('CREATE INDEX IF NOT EXISTS idx_stock_data_history_stock_code ON stock_data_history(stock_code);');
            await this.db.run('CREATE INDEX IF NOT EXISTS idx_stock_data_history_timestamp ON stock_data_history(timestamp);');

            logger.info('数据库表创建成功');
        }
        catch (error) {
            logger.error('创建数据库表失败', error);
            throw error;
        }
    }
}
