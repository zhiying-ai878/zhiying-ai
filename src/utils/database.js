import { Logger } from './stockData';
import { Pool } from 'pg';
const logger = Logger.getInstance();
export class Database {
    constructor() {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pool", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.config = {
            url: import.meta.env.NETLIFY_DATABASE_URL || import.meta.env.VITE_DATABASE_URL || '',
            poolMin: parseInt(import.meta.env.VITE_DATABASE_POOL_MIN || '2'),
            poolMax: parseInt(import.meta.env.VITE_DATABASE_POOL_MAX || '10'),
            idleTimeout: parseInt(import.meta.env.VITE_DATABASE_POOL_IDLE_TIMEOUT || '30000'),
            connectionTimeout: parseInt(import.meta.env.VITE_DATABASE_CONNECTION_TIMEOUT || '5000')
        };
        if (!this.config.url) {
            logger.error('数据库连接URL未配置');
            throw new Error('数据库连接URL未配置');
        }
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
            // 创建数据库连接池
            this.pool = new Pool({
                connectionString: this.config.url,
                min: this.config.poolMin,
                max: this.config.poolMax,
                idleTimeoutMillis: this.config.idleTimeout,
                connectionTimeoutMillis: this.config.connectionTimeout
            });
            // 测试连接
            await this.pool.query('SELECT 1');
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
            if (this.pool) {
                await this.pool.end();
                this.pool = null;
            }
            logger.info('数据库连接已断开');
        }
        catch (error) {
            logger.error('数据库断开连接失败', error);
            throw error;
        }
    }
    getConfig() {
        return { ...this.config };
    }
    isConnected() {
        return this.pool !== null;
    }
    // 数据库操作方法
    async executeQuery(query, params) {
        if (!this.pool) {
            throw new Error('数据库未连接');
        }
        try {
            logger.info(`执行查询: ${query}`);
            const result = await this.pool.query(query, params);
            return result;
        }
        catch (error) {
            logger.error('查询执行失败', error);
            throw error;
        }
    }
    async beginTransaction() {
        if (!this.pool) {
            throw new Error('数据库未连接');
        }
        try {
            logger.info('开始事务');
            const client = await this.pool.connect();
            await client.query('BEGIN');
            return client;
        }
        catch (error) {
            logger.error('事务开始失败', error);
            throw error;
        }
    }
    async commitTransaction(client) {
        try {
            logger.info('提交事务');
            await client.query('COMMIT');
            client.release();
            logger.info('事务已提交');
        }
        catch (error) {
            logger.error('事务提交失败', error);
            throw error;
        }
    }
    async rollbackTransaction(client) {
        try {
            logger.info('回滚事务');
            await client.query('ROLLBACK');
            client.release();
            logger.info('事务已回滚');
        }
        catch (error) {
            logger.error('事务回滚失败', error);
            throw error;
        }
    }
    // 创建数据库表
    async createTables() {
        if (!this.pool) {
            throw new Error('数据库未连接');
        }
        try {
            logger.info('创建数据库表');
            const createTablesQuery = `
        -- 创建信号表
        CREATE TABLE IF NOT EXISTS signals (
          id VARCHAR(255) PRIMARY KEY,
          stock_code VARCHAR(20) NOT NULL,
          stock_name VARCHAR(100) NOT NULL,
          type VARCHAR(10) NOT NULL CHECK (type IN ('buy', 'sell')),
          score DECIMAL(5,2) NOT NULL,
          confidence DECIMAL(5,2) NOT NULL,
          reason TEXT NOT NULL,
          timestamp BIGINT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          is_auction_period BOOLEAN DEFAULT FALSE,
          main_force_flow BIGINT,
          main_force_ratio DECIMAL(5,2),
          volume_amplification DECIMAL(5,2),
          turnover_rate DECIMAL(5,2),
          price DECIMAL(10,2),
          target_price DECIMAL(10,2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 创建持仓表
        CREATE TABLE IF NOT EXISTS positions (
          stock_code VARCHAR(20) PRIMARY KEY,
          stock_name VARCHAR(100) NOT NULL,
          entry_price DECIMAL(10,2) NOT NULL,
          volume INTEGER NOT NULL,
          entry_time BIGINT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 创建股票数据历史表
        CREATE TABLE IF NOT EXISTS stock_data_history (
          id SERIAL PRIMARY KEY,
          stock_code VARCHAR(20) NOT NULL,
          stock_name VARCHAR(100) NOT NULL,
          current_price DECIMAL(10,2) NOT NULL,
          main_force_net_flow BIGINT,
          total_net_flow BIGINT,
          super_large_order_flow BIGINT,
          large_order_flow BIGINT,
          medium_order_flow BIGINT,
          small_order_flow BIGINT,
          volume_amplification DECIMAL(5,2),
          turnover_rate DECIMAL(5,2),
          timestamp BIGINT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- 创建索引
        CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp);
        CREATE INDEX IF NOT EXISTS idx_signals_stock_code ON signals(stock_code);
        CREATE INDEX IF NOT EXISTS idx_stock_data_history_stock_code ON stock_data_history(stock_code);
        CREATE INDEX IF NOT EXISTS idx_stock_data_history_timestamp ON stock_data_history(timestamp);
      `;
            await this.pool.query(createTablesQuery);
            logger.info('数据库表创建成功');
        }
        catch (error) {
            logger.error('创建数据库表失败', error);
            throw error;
        }
    }
}
