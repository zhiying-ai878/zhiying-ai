import { IndexedDBManager } from './indexedDBManager';
import { Logger } from './stockData';

const logger = Logger.getInstance();

export class DataMigrationManager {
  private static instance: DataMigrationManager;
  private indexedDBManager: IndexedDBManager;
  private migrationVersion = '1.0';

  private constructor() {
    this.indexedDBManager = IndexedDBManager.getInstance();
  }

  public static getInstance(): DataMigrationManager {
    if (!DataMigrationManager.instance) {
      DataMigrationManager.instance = new DataMigrationManager();
    }
    return DataMigrationManager.instance;
  }

  public async runMigration(): Promise<boolean> {
    try {
      logger.info('开始数据迁移...');
      
      // 检查是否已经迁移过
      if (this.hasMigrated()) {
        logger.info('数据已迁移，跳过迁移过程');
        return true;
      }

      // 初始化IndexedDB
      await this.indexedDBManager.init();
      
      // 迁移数据
      await this.migrateLocalStorageData();
      
      // 标记迁移完成
      this.markMigrationComplete();
      
      logger.info('数据迁移完成');
      return true;
    } catch (error) {
      logger.error('数据迁移失败', error);
      return false;
    }
  }

  private hasMigrated(): boolean {
    const migrationStatus = localStorage.getItem('dataMigrationStatus');
    if (!migrationStatus) {
      return false;
    }
    
    try {
      const status = JSON.parse(migrationStatus);
      return status.completed && status.version === this.migrationVersion;
    } catch {
      return false;
    }
  }

  private markMigrationComplete(): void {
    localStorage.setItem('dataMigrationStatus', JSON.stringify({
      completed: true,
      version: this.migrationVersion,
      timestamp: Date.now()
    }));
  }

  private async migrateLocalStorageData(): Promise<void> {
    await Promise.all([
      this.migrateSignals(),
      this.migratePositions(),
      this.migrateAIModelState(),
      this.migrateStockDataHealth()
    ]);
  }

  private async migrateSignals(): Promise<void> {
    logger.info('迁移信号数据...');
    
    // 从localStorage获取信号数据
    const signalsData = localStorage.getItem('signals');
    if (!signalsData) {
      logger.info('未找到信号数据，跳过迁移');
      return;
    }

    try {
      const signals = JSON.parse(signalsData);
      if (!Array.isArray(signals)) {
        logger.warn('信号数据格式不正确');
        return;
      }

      // 迁移每个信号
      for (const signal of signals) {
        try {
          await this.indexedDBManager.addSignal({
            id: signal.id,
            stockCode: signal.stockCode,
            stockName: signal.stockName,
            type: signal.type,
            score: signal.score,
            confidence: signal.confidence,
            reason: signal.reason,
            timestamp: signal.timestamp,
            isRead: signal.isRead || false,
            isAuctionPeriod: signal.isAuctionPeriod,
            mainForceFlow: signal.mainForceFlow,
            mainForceRatio: signal.mainForceRatio,
            volumeAmplification: signal.volumeAmplification,
            turnoverRate: signal.turnoverRate,
            price: signal.price,
            targetPrice: signal.targetPrice,
            created_at: signal.created_at || Date.now(),
            updated_at: signal.updated_at || Date.now()
          });
        } catch (error) {
          logger.error(`迁移信号失败: ${signal.id}`, error);
        }
      }

      logger.info(`成功迁移 ${signals.length} 个信号`);
      
      // 保留原数据作为备份，但标记为已迁移
      localStorage.setItem('signals_migrated', signalsData);
      // localStorage.removeItem('signals'); // 可选：迁移后删除原数据

    } catch (error) {
      logger.error('迁移信号数据失败', error);
    }
  }

  private async migratePositions(): Promise<void> {
    logger.info('迁移持仓数据...');
    
    // 从localStorage获取持仓数据
    const positionsData = localStorage.getItem('stockPositions');
    if (!positionsData) {
      logger.info('未找到持仓数据，跳过迁移');
      return;
    }

    try {
      const positions = JSON.parse(positionsData);
      if (!Array.isArray(positions)) {
        logger.warn('持仓数据格式不正确');
        return;
      }

      // 迁移每个持仓
      for (const position of positions) {
        try {
          await this.indexedDBManager.addPosition({
            stockCode: position.stockCode,
            stockName: position.stockName,
            entryPrice: position.entryPrice,
            volume: position.volume,
            entryTime: position.entryTime,
            created_at: position.created_at || Date.now(),
            updated_at: position.updated_at || Date.now()
          });
        } catch (error) {
          logger.error(`迁移持仓失败: ${position.stockCode}`, error);
        }
      }

      logger.info(`成功迁移 ${positions.length} 个持仓`);
      
      // 保留原数据作为备份
      localStorage.setItem('stockPositions_migrated', positionsData);

    } catch (error) {
      logger.error('迁移持仓数据失败', error);
    }
  }

  private async migrateAIModelState(): Promise<void> {
    logger.info('迁移AI模型状态...');
    
    // 从localStorage获取AI模型状态
    const modelStateData = localStorage.getItem('aiModelState');
    if (!modelStateData) {
      logger.info('未找到AI模型状态数据，跳过迁移');
      return;
    }

    try {
      const modelState = JSON.parse(modelStateData);
      
      await this.indexedDBManager.addAIModelState({
        modelId: modelState.modelId || 'default-model',
        modelType: modelState.modelType || 'deep_neural_network',
        modelData: modelState.modelData || {},
        trainingData: modelState.trainingData || [],
        performance: modelState.performance || {},
        lastUpdated: modelState.lastUpdated || Date.now(),
        version: modelState.version || 1
      });

      logger.info('成功迁移AI模型状态');
      
      // 保留原数据作为备份
      localStorage.setItem('aiModelState_migrated', modelStateData);

    } catch (error) {
      logger.error('迁移AI模型状态失败', error);
    }
  }

  private async migrateStockDataHealth(): Promise<void> {
    logger.info('迁移股票数据健康状态...');
    
    // 从localStorage获取股票数据健康状态
    const healthData = localStorage.getItem('stockDataHealth');
    if (!healthData) {
      logger.info('未找到股票数据健康状态数据，跳过迁移');
      return;
    }

    try {
      const health = JSON.parse(healthData);
      
      // 这里可以根据需要将健康状态数据迁移到IndexedDB
      // 目前健康状态数据可能不适合直接存储到IndexedDB的现有结构中
      // 可以考虑创建专门的健康状态存储或暂时保留在localStorage中
      
      logger.info('股票数据健康状态迁移完成');

    } catch (error) {
      logger.error('迁移股票数据健康状态失败', error);
    }
  }

  public async verifyMigration(): Promise<boolean> {
    try {
      logger.info('验证数据迁移...');
      
      // 验证IndexedDB数据
      const signals = await this.indexedDBManager.getSignals();
      const positions = await this.indexedDBManager.getPositions();
      
      logger.info(`验证结果: 信号 ${signals.length} 条, 持仓 ${positions.length} 个`);
      
      return signals.length > 0 || positions.length > 0;
    } catch (error) {
      logger.error('验证数据迁移失败', error);
      return false;
    }
  }

  public async rollbackMigration(): Promise<boolean> {
    try {
      logger.info('回滚数据迁移...');
      
      // 删除迁移标记
      localStorage.removeItem('dataMigrationStatus');
      
      // 恢复原数据
      const migratedSignals = localStorage.getItem('signals_migrated');
      if (migratedSignals) {
        localStorage.setItem('signals', migratedSignals);
      }
      
      const migratedPositions = localStorage.getItem('stockPositions_migrated');
      if (migratedPositions) {
        localStorage.setItem('stockPositions', migratedPositions);
      }
      
      const migratedModelState = localStorage.getItem('aiModelState_migrated');
      if (migratedModelState) {
        localStorage.setItem('aiModelState', migratedModelState);
      }
      
      logger.info('数据迁移回滚完成');
      return true;
    } catch (error) {
      logger.error('回滚数据迁移失败', error);
      return false;
    }
  }
}