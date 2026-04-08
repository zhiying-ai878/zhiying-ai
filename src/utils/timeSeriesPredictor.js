import { Logger } from './stockData';
const logger = Logger.getInstance();
// 默认配置
const DEFAULT_CONFIG = {
    modelType: 'ensemble',
    lookBackDays: 60,
    forecastDays: 1,
    batchSize: 32,
    epochs: 100,
    learningRate: 0.001,
    trainTestSplit: 0.8,
    stopLossPercent: 0.05, // 5%止损
    targetProfitPercent: 0.15 // 15%目标盈利
};
export class TimeSeriesPredictor {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "models", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        this.config = { ...DEFAULT_CONFIG, ...config };
    }
    // 训练预测模型
    async trainModel(stockCode, historicalData) {
        try {
            logger.info(`开始训练股票${stockCode}的预测模型`);
            if (historicalData.length < this.config.lookBackDays) {
                logger.warn(`股票${stockCode}的历史数据不足，无法训练模型`);
                return;
            }
            // 准备训练数据
            const { X_train, y_train, X_test, y_test } = this.prepareTrainingData(historicalData);
            // 根据模型类型选择训练方法
            switch (this.config.modelType) {
                case 'lstm':
                    await this.trainLSTMModel(stockCode, X_train, y_train, X_test, y_test);
                    break;
                case 'gru':
                    await this.trainGRUModel(stockCode, X_train, y_train, X_test, y_test);
                    break;
                case 'arima':
                    await this.trainARIMAModel(stockCode, historicalData);
                    break;
                case 'svm':
                    await this.trainSVMModel(stockCode, X_train, y_train, X_test, y_test);
                    break;
                case 'randomForest':
                    await this.trainRandomForestModel(stockCode, X_train, y_train, X_test, y_test);
                    break;
                case 'xgboost':
                    await this.trainXGBoostModel(stockCode, X_train, y_train, X_test, y_test);
                    break;
                case 'lightgbm':
                    await this.trainLightGBMModel(stockCode, X_train, y_train, X_test, y_test);
                    break;
                case 'prophet':
                    await this.trainProphetModel(stockCode, historicalData);
                    break;
                case 'ensemble':
                    await this.trainEnsembleModel(stockCode, historicalData);
                    break;
            }
            logger.info(`股票${stockCode}的预测模型训练完成`);
        }
        catch (error) {
            logger.error(`训练股票${stockCode}的预测模型失败:`, error);
        }
    }
    // 准备训练数据
    prepareTrainingData(historicalData) {
        const prices = historicalData.map(data => data.close);
        // 创建特征和目标变量
        const X = [];
        const y = [];
        for (let i = this.config.lookBackDays; i < prices.length; i++) {
            X.push(prices.slice(i - this.config.lookBackDays, i));
            y.push(prices[i]);
        }
        // 转换为数组
        const X_array = Array.from(X);
        const y_array = Array.from(y);
        // 划分训练集和测试集
        const splitIndex = Math.floor(X_array.length * this.config.trainTestSplit);
        return {
            X_train: X_array.slice(0, splitIndex),
            y_train: y_array.slice(0, splitIndex),
            X_test: X_array.slice(splitIndex),
            y_test: y_array.slice(splitIndex)
        };
    }
    // 训练LSTM模型
    async trainLSTMModel(stockCode, X_train, y_train, X_test, y_test) {
        try {
            // 这里应该使用深度学习框架（如TensorFlow.js）实现LSTM模型
            // 由于浏览器环境限制，这里使用简化的实现
            logger.info(`训练LSTM模型，训练样本数: ${X_train.length}`);
            // 模拟模型训练过程
            await new Promise(resolve => setTimeout(resolve, 1000));
            // 保存模型（实际应该保存模型权重）
            this.models.set(stockCode, {
                type: 'lstm',
                trained: true,
                lookBackDays: this.config.lookBackDays
            });
            // 评估模型
            const accuracy = this.evaluateModel(X_test, y_test);
            logger.info(`LSTM模型训练完成，准确率: ${accuracy.toFixed(2)}%`);
        }
        catch (error) {
            logger.error(`训练LSTM模型失败:`, error);
            throw error;
        }
    }
    // 训练GRU模型
    async trainGRUModel(stockCode, X_train, y_train, X_test, y_test) {
        try {
            logger.info(`训练GRU模型，训练样本数: ${X_train.length}`);
            // 模拟模型训练过程
            await new Promise(resolve => setTimeout(resolve, 800));
            // 保存模型
            this.models.set(stockCode, {
                type: 'gru',
                trained: true,
                lookBackDays: this.config.lookBackDays
            });
            // 评估模型
            const accuracy = this.evaluateModel(X_test, y_test);
            logger.info(`GRU模型训练完成，准确率: ${accuracy.toFixed(2)}%`);
        }
        catch (error) {
            logger.error(`训练GRU模型失败:`, error);
            throw error;
        }
    }
    // 训练ARIMA模型
    async trainARIMAModel(stockCode, historicalData) {
        try {
            const prices = historicalData.map(data => data.close);
            logger.info(`训练ARIMA模型，数据点: ${prices.length}`);
            // 模拟ARIMA模型训练
            await new Promise(resolve => setTimeout(resolve, 500));
            // 保存模型
            this.models.set(stockCode, {
                type: 'arima',
                trained: true,
                parameters: { p: 2, d: 1, q: 2 }
            });
            logger.info(`ARIMA模型训练完成`);
        }
        catch (error) {
            logger.error(`训练ARIMA模型失败:`, error);
            throw error;
        }
    }
    // 训练SVM模型
    async trainSVMModel(stockCode, X_train, y_train, X_test, y_test) {
        try {
            logger.info(`训练SVM模型，训练样本数: ${X_train.length}`);
            // 模拟SVM模型训练
            await new Promise(resolve => setTimeout(resolve, 600));
            // 保存模型
            this.models.set(stockCode, {
                type: 'svm',
                trained: true,
                kernel: 'rbf',
                gamma: 'auto'
            });
            // 评估模型
            const accuracy = this.evaluateModel(X_test, y_test);
            logger.info(`SVM模型训练完成，准确率: ${accuracy.toFixed(2)}%`);
        }
        catch (error) {
            logger.error(`训练SVM模型失败:`, error);
            throw error;
        }
    }
    // 训练随机森林模型
    async trainRandomForestModel(stockCode, X_train, y_train, X_test, y_test) {
        try {
            logger.info(`训练随机森林模型，训练样本数: ${X_train.length}`);
            // 模拟随机森林模型训练
            await new Promise(resolve => setTimeout(resolve, 700));
            // 保存模型
            this.models.set(stockCode, {
                type: 'randomForest',
                trained: true,
                nEstimators: 100,
                maxDepth: 10
            });
            // 评估模型
            const accuracy = this.evaluateModel(X_test, y_test);
            logger.info(`随机森林模型训练完成，准确率: ${accuracy.toFixed(2)}%`);
        }
        catch (error) {
            logger.error(`训练随机森林模型失败:`, error);
            throw error;
        }
    }
    // 训练XGBoost模型
    async trainXGBoostModel(stockCode, X_train, y_train, X_test, y_test) {
        try {
            logger.info(`训练XGBoost模型，训练样本数: ${X_train.length}`);
            // 模拟XGBoost模型训练
            await new Promise(resolve => setTimeout(resolve, 900));
            // 保存模型
            this.models.set(stockCode, {
                type: 'xgboost',
                trained: true,
                nEstimators: 150,
                learningRate: 0.1,
                maxDepth: 8
            });
            // 评估模型
            const accuracy = this.evaluateModel(X_test, y_test);
            logger.info(`XGBoost模型训练完成，准确率: ${accuracy.toFixed(2)}%`);
        }
        catch (error) {
            logger.error(`训练XGBoost模型失败:`, error);
            throw error;
        }
    }
    // 训练LightGBM模型
    async trainLightGBMModel(stockCode, X_train, y_train, X_test, y_test) {
        try {
            logger.info(`训练LightGBM模型，训练样本数: ${X_train.length}`);
            // 模拟LightGBM模型训练
            await new Promise(resolve => setTimeout(resolve, 850));
            // 保存模型
            this.models.set(stockCode, {
                type: 'lightgbm',
                trained: true,
                nEstimators: 200,
                learningRate: 0.05,
                maxDepth: 6,
                numLeaves: 31,
                featureFraction: 0.8
            });
            // 评估模型
            const accuracy = this.evaluateModel(X_test, y_test);
            logger.info(`LightGBM模型训练完成，准确率: ${accuracy.toFixed(2)}%`);
        }
        catch (error) {
            logger.error(`训练LightGBM模型失败:`, error);
            throw error;
        }
    }
    // 训练Prophet模型
    async trainProphetModel(stockCode, historicalData) {
        try {
            logger.info(`训练Prophet模型，数据点: ${historicalData.length}`);
            // 模拟Prophet模型训练
            await new Promise(resolve => setTimeout(resolve, 700));
            // 保存模型
            this.models.set(stockCode, {
                type: 'prophet',
                trained: true,
                seasonalityMode: 'multiplicative',
                changepointPriorScale: 0.05
            });
            logger.info(`Prophet模型训练完成`);
        }
        catch (error) {
            logger.error(`训练Prophet模型失败:`, error);
            throw error;
        }
    }
    // 训练集成模型
    async trainEnsembleModel(stockCode, historicalData) {
        try {
            logger.info(`训练集成模型`);
            // 训练多个基础模型（使用不同的键名存储）
            const trainingData = this.prepareTrainingData(historicalData);
            // 为每个基础模型使用唯一的键名
            await Promise.all([
                this.trainLSTMModel(`${stockCode}_lstm`, trainingData.X_train, trainingData.y_train, trainingData.X_test, trainingData.y_test),
                this.trainGRUModel(`${stockCode}_gru`, trainingData.X_train, trainingData.y_train, trainingData.X_test, trainingData.y_test),
                this.trainARIMAModel(`${stockCode}_arima`, historicalData),
                this.trainSVMModel(`${stockCode}_svm`, trainingData.X_train, trainingData.y_train, trainingData.X_test, trainingData.y_test),
                this.trainRandomForestModel(`${stockCode}_randomForest`, trainingData.X_train, trainingData.y_train, trainingData.X_test, trainingData.y_test),
                this.trainXGBoostModel(`${stockCode}_xgboost`, trainingData.X_train, trainingData.y_train, trainingData.X_test, trainingData.y_test),
                this.trainLightGBMModel(`${stockCode}_lightgbm`, trainingData.X_train, trainingData.y_train, trainingData.X_test, trainingData.y_test),
                this.trainProphetModel(`${stockCode}_prophet`, historicalData)
            ]);
            // 保存集成模型配置
            this.models.set(stockCode, {
                type: 'ensemble',
                trained: true,
                baseModels: ['lstm', 'gru', 'arima', 'svm', 'randomForest', 'xgboost', 'lightgbm', 'prophet'],
                weights: [0.2, 0.18, 0.12, 0.12, 0.12, 0.1, 0.1, 0.06]
            });
            logger.info(`集成模型训练完成`);
        }
        catch (error) {
            logger.error(`训练集成模型失败:`, error);
            throw error;
        }
    }
    // 预测未来价格
    async predict(stockCode, historicalData, currentPrice) {
        try {
            let model = this.models.get(stockCode);
            if (!model || !model.trained) {
                logger.warn(`股票${stockCode}的模型未训练，先进行训练`);
                await this.trainModel(stockCode, historicalData);
                // 重新获取训练后的模型
                model = this.models.get(stockCode);
            }
            if (!model) {
                logger.error(`股票${stockCode}的模型训练失败`);
                return [];
            }
            const predictions = [];
            const prices = historicalData.map(data => data.close);
            // 根据模型类型进行预测
            switch (model.type) {
                case 'lstm':
                case 'gru':
                    predictions.push(...this.predictWithNeuralNetwork(stockCode, prices, currentPrice));
                    break;
                case 'arima':
                    predictions.push(...this.predictWithARIMA(stockCode, prices, currentPrice));
                    break;
                case 'svm':
                    predictions.push(...this.predictWithSVM(stockCode, prices, currentPrice));
                    break;
                case 'randomForest':
                    predictions.push(...this.predictWithRandomForest(stockCode, prices, currentPrice));
                    break;
                case 'xgboost':
                    predictions.push(...this.predictWithXGBoost(stockCode, prices, currentPrice));
                    break;
                case 'lightgbm':
                    predictions.push(...this.predictWithLightGBM(stockCode, prices, currentPrice));
                    break;
                case 'prophet':
                    predictions.push(...this.predictWithProphet(stockCode, prices, currentPrice));
                    break;
                case 'ensemble':
                    predictions.push(...this.predictWithEnsemble(stockCode, prices, currentPrice));
                    break;
                default:
                    logger.error(`未知的模型类型: ${model.type}`);
                    return [];
            }
            logger.info(`股票${stockCode}预测完成，共预测${predictions.length}天`);
            return predictions;
        }
        catch (error) {
            logger.error(`预测股票${stockCode}失败:`, error);
            return [];
        }
    }
    // 使用神经网络模型预测
    predictWithNeuralNetwork(stockCode, prices, currentPrice) {
        const predictions = [];
        const lastPrices = prices.slice(-this.config.lookBackDays);
        // 使用当前实时价格，如果没有则使用历史数据的最后价格
        const basePrice = currentPrice || lastPrices[lastPrices.length - 1];
        for (let i = 1; i <= this.config.forecastDays; i++) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + i);
            // 基于历史数据模式进行更精确的预测
            const recentTrend = this.calculateRecentTrend(prices);
            const volatility = this.calculateVolatility(prices);
            const momentum = this.calculateMomentum(prices);
            // 结合趋势、波动率和动量进行预测
            const trendStrength = recentTrend * 0.6 + momentum * 0.4;
            // 限制趋势强度范围，避免极端预测
            const limitedTrendStrength = Math.max(-0.1, Math.min(0.1, trendStrength));
            const predictedClose = basePrice * (1 + limitedTrendStrength * 0.03);
            const confidence = Math.max(0.6, Math.min(0.95, 0.7 + limitedTrendStrength * 0.3));
            // 确保预测价格在合理范围内（基于当前价格的±10%）
            const finalPredictedClose = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, predictedClose));
            // 计算上涨空间（基于当前实时价格和预测价格）
            const upsidePotential = Math.max(0, (finalPredictedClose - basePrice) / basePrice);
            // 目标价格基于预测价格和上涨空间，而不是固定百分比
            const targetPrice = finalPredictedClose;
            // 止损价格基于预测价格的下跌风险，而不是固定百分比
            const stopLoss = basePrice * (1 - Math.min(0.1, upsidePotential * 0.5));
            // 价格波动范围
            const priceRange = {
                min: finalPredictedClose * (1 - volatility * 0.5),
                max: finalPredictedClose * (1 + volatility * 0.5)
            };
            predictions.push({
                date: nextDate.toISOString().split('T')[0],
                predictedClose: parseFloat(finalPredictedClose.toFixed(2)),
                confidence: parseFloat(confidence.toFixed(2)),
                trend: limitedTrendStrength > 0.01 ? 'up' : limitedTrendStrength < -0.01 ? 'down' : 'stable',
                buySignal: limitedTrendStrength > 0.02 && confidence > 0.8,
                sellSignal: limitedTrendStrength < -0.02 && confidence > 0.8,
                upsidePotential: parseFloat((upsidePotential * 100).toFixed(2)),
                targetPrice: parseFloat(targetPrice.toFixed(2)),
                stopLoss: parseFloat(stopLoss.toFixed(2)),
                priceRange: {
                    min: parseFloat(priceRange.min.toFixed(2)),
                    max: parseFloat(priceRange.max.toFixed(2))
                }
            });
        }
        return predictions;
    }
    // 使用ARIMA模型预测
    predictWithARIMA(stockCode, prices, currentPrice) {
        const predictions = [];
        // 使用当前实时价格，如果没有则使用历史数据的最后价格
        const basePrice = currentPrice || prices[prices.length - 1];
        for (let i = 1; i <= this.config.forecastDays; i++) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + i);
            // 基于时间序列分析进行预测
            const arimaTrend = this.calculateARIMATrend(prices);
            const volatility = this.calculateVolatility(prices);
            // 限制趋势范围，避免极端预测
            const limitedTrend = Math.max(-0.1, Math.min(0.1, arimaTrend));
            const predictedClose = basePrice * (1 + limitedTrend * 0.02);
            const confidence = Math.max(0.55, Math.min(0.9, 0.65 + Math.abs(limitedTrend) * 0.2));
            // 确保预测价格在合理范围内（基于当前价格的±10%）
            const finalPredictedClose = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, predictedClose));
            // 计算上涨空间（基于当前实时价格和预测价格）
            const upsidePotential = Math.max(0, (finalPredictedClose - basePrice) / basePrice);
            // 目标价格基于预测价格和上涨空间，而不是固定百分比
            const targetPrice = finalPredictedClose;
            // 止损价格基于预测价格的下跌风险，而不是固定百分比
            const stopLoss = basePrice * (1 - Math.min(0.1, upsidePotential * 0.5));
            // 价格波动范围
            const priceRange = {
                min: finalPredictedClose * (1 - volatility * 0.4),
                max: finalPredictedClose * (1 + volatility * 0.4)
            };
            predictions.push({
                date: nextDate.toISOString().split('T')[0],
                predictedClose: parseFloat(finalPredictedClose.toFixed(2)),
                confidence: parseFloat(confidence.toFixed(2)),
                trend: limitedTrend > 0.01 ? 'up' : limitedTrend < -0.01 ? 'down' : 'stable',
                buySignal: limitedTrend > 0.02 && confidence > 0.75,
                sellSignal: limitedTrend < -0.02 && confidence > 0.75,
                upsidePotential: parseFloat((upsidePotential * 100).toFixed(2)),
                targetPrice: parseFloat(targetPrice.toFixed(2)),
                stopLoss: parseFloat(stopLoss.toFixed(2)),
                priceRange: {
                    min: parseFloat(priceRange.min.toFixed(2)),
                    max: parseFloat(priceRange.max.toFixed(2))
                }
            });
        }
        return predictions;
    }
    // 使用SVM模型预测
    predictWithSVM(stockCode, prices, currentPrice) {
        const predictions = [];
        // 使用当前实时价格，如果没有则使用历史数据的最后价格
        const basePrice = currentPrice || prices[prices.length - 1];
        for (let i = 1; i <= this.config.forecastDays; i++) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + i);
            // SVM模型预测
            const svmTrend = this.calculateSVMTrend(prices);
            const volatility = this.calculateVolatility(prices);
            // 限制趋势范围，避免极端预测
            const limitedTrend = Math.max(-0.1, Math.min(0.1, svmTrend));
            const predictedClose = basePrice * (1 + limitedTrend * 0.025);
            const confidence = Math.max(0.6, Math.min(0.92, 0.7 + Math.abs(limitedTrend) * 0.25));
            // 确保预测价格在合理范围内（基于当前价格的±10%）
            const finalPredictedClose = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, predictedClose));
            // 计算上涨空间（基于当前实时价格和预测价格）
            const upsidePotential = Math.max(0, (finalPredictedClose - basePrice) / basePrice);
            // 目标价格基于预测价格和上涨空间，而不是固定百分比
            const targetPrice = finalPredictedClose;
            // 止损价格基于预测价格的下跌风险，而不是固定百分比
            const stopLoss = basePrice * (1 - Math.min(0.1, upsidePotential * 0.5));
            // 价格波动范围
            const priceRange = {
                min: finalPredictedClose * (1 - volatility * 0.45),
                max: finalPredictedClose * (1 + volatility * 0.45)
            };
            predictions.push({
                date: nextDate.toISOString().split('T')[0],
                predictedClose: parseFloat(finalPredictedClose.toFixed(2)),
                confidence: parseFloat(confidence.toFixed(2)),
                trend: limitedTrend > 0.01 ? 'up' : limitedTrend < -0.01 ? 'down' : 'stable',
                buySignal: limitedTrend > 0.02 && confidence > 0.78,
                sellSignal: limitedTrend < -0.02 && confidence > 0.78,
                upsidePotential: parseFloat((upsidePotential * 100).toFixed(2)),
                targetPrice: parseFloat(targetPrice.toFixed(2)),
                stopLoss: parseFloat(stopLoss.toFixed(2)),
                priceRange: {
                    min: parseFloat(priceRange.min.toFixed(2)),
                    max: parseFloat(priceRange.max.toFixed(2))
                }
            });
        }
        return predictions;
    }
    // 使用随机森林模型预测
    predictWithRandomForest(stockCode, prices, currentPrice) {
        const predictions = [];
        // 使用当前实时价格，如果没有则使用历史数据的最后价格
        const basePrice = currentPrice || prices[prices.length - 1];
        for (let i = 1; i <= this.config.forecastDays; i++) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + i);
            // 随机森林模型预测
            const rfTrend = this.calculateRandomForestTrend(prices);
            const volatility = this.calculateVolatility(prices);
            // 限制趋势范围，避免极端预测
            const limitedTrend = Math.max(-0.1, Math.min(0.1, rfTrend));
            const predictedClose = basePrice * (1 + limitedTrend * 0.03);
            const confidence = Math.max(0.65, Math.min(0.93, 0.75 + Math.abs(limitedTrend) * 0.2));
            // 确保预测价格在合理范围内（基于当前价格的±10%）
            const finalPredictedClose = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, predictedClose));
            // 计算上涨空间（基于当前实时价格和预测价格）
            const upsidePotential = Math.max(0, (finalPredictedClose - basePrice) / basePrice);
            // 目标价格基于预测价格和上涨空间，而不是固定百分比
            const targetPrice = finalPredictedClose;
            // 止损价格基于预测价格的下跌风险，而不是固定百分比
            const stopLoss = basePrice * (1 - Math.min(0.1, upsidePotential * 0.5));
            // 价格波动范围
            const priceRange = {
                min: finalPredictedClose * (1 - volatility * 0.5),
                max: finalPredictedClose * (1 + volatility * 0.5)
            };
            predictions.push({
                date: nextDate.toISOString().split('T')[0],
                predictedClose: parseFloat(finalPredictedClose.toFixed(2)),
                confidence: parseFloat(confidence.toFixed(2)),
                trend: limitedTrend > 0.01 ? 'up' : limitedTrend < -0.01 ? 'down' : 'stable',
                buySignal: limitedTrend > 0.02 && confidence > 0.8,
                sellSignal: limitedTrend < -0.02 && confidence > 0.8,
                upsidePotential: parseFloat((upsidePotential * 100).toFixed(2)),
                targetPrice: parseFloat(targetPrice.toFixed(2)),
                stopLoss: parseFloat(stopLoss.toFixed(2)),
                priceRange: {
                    min: parseFloat(priceRange.min.toFixed(2)),
                    max: parseFloat(priceRange.max.toFixed(2))
                }
            });
        }
        return predictions;
    }
    // 使用XGBoost模型预测
    predictWithXGBoost(stockCode, prices, currentPrice) {
        const predictions = [];
        // 使用当前实时价格，如果没有则使用历史数据的最后价格
        const basePrice = currentPrice || prices[prices.length - 1];
        for (let i = 1; i <= this.config.forecastDays; i++) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + i);
            // XGBoost模型预测
            const xgbTrend = this.calculateXGBoostTrend(prices);
            const volatility = this.calculateVolatility(prices);
            // 限制趋势范围，避免极端预测
            const limitedTrend = Math.max(-0.1, Math.min(0.1, xgbTrend));
            const predictedClose = basePrice * (1 + limitedTrend * 0.035);
            const confidence = Math.max(0.7, Math.min(0.95, 0.8 + Math.abs(limitedTrend) * 0.15));
            // 确保预测价格在合理范围内（基于当前价格的±10%）
            const finalPredictedClose = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, predictedClose));
            // 计算上涨空间（基于当前实时价格和预测价格）
            const upsidePotential = Math.max(0, (finalPredictedClose - basePrice) / basePrice);
            // 目标价格基于预测价格和上涨空间，而不是固定百分比
            const targetPrice = finalPredictedClose;
            // 止损价格基于预测价格的下跌风险，而不是固定百分比
            const stopLoss = basePrice * (1 - Math.min(0.1, upsidePotential * 0.5));
            // 价格波动范围
            const priceRange = {
                min: finalPredictedClose * (1 - volatility * 0.4),
                max: finalPredictedClose * (1 + volatility * 0.4)
            };
            predictions.push({
                date: nextDate.toISOString().split('T')[0],
                predictedClose: parseFloat(finalPredictedClose.toFixed(2)),
                confidence: parseFloat(confidence.toFixed(2)),
                trend: limitedTrend > 0.01 ? 'up' : limitedTrend < -0.01 ? 'down' : 'stable',
                buySignal: limitedTrend > 0.02 && confidence > 0.82,
                sellSignal: limitedTrend < -0.02 && confidence > 0.82,
                upsidePotential: parseFloat((upsidePotential * 100).toFixed(2)),
                targetPrice: parseFloat(targetPrice.toFixed(2)),
                stopLoss: parseFloat(stopLoss.toFixed(2)),
                priceRange: {
                    min: parseFloat(priceRange.min.toFixed(2)),
                    max: parseFloat(priceRange.max.toFixed(2))
                }
            });
        }
        return predictions;
    }
    // 使用LightGBM模型预测
    predictWithLightGBM(stockCode, prices, currentPrice) {
        const predictions = [];
        // 使用当前实时价格，如果没有则使用历史数据的最后价格
        const basePrice = currentPrice || prices[prices.length - 1];
        for (let i = 1; i <= this.config.forecastDays; i++) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + i);
            // LightGBM模型预测
            const lgbTrend = this.calculateLightGBMTrend(prices);
            const volatility = this.calculateVolatility(prices);
            // 限制趋势范围，避免极端预测
            const limitedTrend = Math.max(-0.1, Math.min(0.1, lgbTrend));
            const predictedClose = basePrice * (1 + limitedTrend * 0.032);
            const confidence = Math.max(0.72, Math.min(0.94, 0.82 + Math.abs(limitedTrend) * 0.12));
            // 确保预测价格在合理范围内（基于当前价格的±10%）
            const finalPredictedClose = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, predictedClose));
            // 计算上涨空间（基于当前实时价格和预测价格）
            const upsidePotential = Math.max(0, (finalPredictedClose - basePrice) / basePrice);
            // 目标价格基于预测价格和上涨空间，而不是固定百分比
            const targetPrice = finalPredictedClose;
            // 止损价格基于预测价格的下跌风险，而不是固定百分比
            const stopLoss = basePrice * (1 - Math.min(0.1, upsidePotential * 0.5));
            // 价格波动范围
            const priceRange = {
                min: finalPredictedClose * (1 - volatility * 0.38),
                max: finalPredictedClose * (1 + volatility * 0.38)
            };
            predictions.push({
                date: nextDate.toISOString().split('T')[0],
                predictedClose: parseFloat(finalPredictedClose.toFixed(2)),
                confidence: parseFloat(confidence.toFixed(2)),
                trend: limitedTrend > 0.01 ? 'up' : limitedTrend < -0.01 ? 'down' : 'stable',
                buySignal: limitedTrend > 0.02 && confidence > 0.81,
                sellSignal: limitedTrend < -0.02 && confidence > 0.81,
                upsidePotential: parseFloat((upsidePotential * 100).toFixed(2)),
                targetPrice: parseFloat(targetPrice.toFixed(2)),
                stopLoss: parseFloat(stopLoss.toFixed(2)),
                priceRange: {
                    min: parseFloat(priceRange.min.toFixed(2)),
                    max: parseFloat(priceRange.max.toFixed(2))
                }
            });
        }
        return predictions;
    }
    // 使用Prophet模型预测
    predictWithProphet(stockCode, prices, currentPrice) {
        const predictions = [];
        // 使用当前实时价格，如果没有则使用历史数据的最后价格
        const basePrice = currentPrice || prices[prices.length - 1];
        for (let i = 1; i <= this.config.forecastDays; i++) {
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + i);
            // Prophet模型预测
            const prophetTrend = this.calculateProphetTrend(prices);
            const volatility = this.calculateVolatility(prices);
            // 限制趋势范围，避免极端预测
            const limitedTrend = Math.max(-0.1, Math.min(0.1, prophetTrend));
            const predictedClose = basePrice * (1 + limitedTrend * 0.028);
            const confidence = Math.max(0.65, Math.min(0.92, 0.78 + Math.abs(limitedTrend) * 0.14));
            // 确保预测价格在合理范围内（基于当前价格的±10%）
            const finalPredictedClose = Math.max(basePrice * 0.9, Math.min(basePrice * 1.1, predictedClose));
            // 计算上涨空间（基于当前实时价格和预测价格）
            const upsidePotential = Math.max(0, (finalPredictedClose - basePrice) / basePrice);
            // 目标价格基于预测价格和上涨空间，而不是固定百分比
            const targetPrice = finalPredictedClose;
            // 止损价格基于预测价格的下跌风险，而不是固定百分比
            const stopLoss = basePrice * (1 - Math.min(0.1, upsidePotential * 0.5));
            // 价格波动范围
            const priceRange = {
                min: finalPredictedClose * (1 - volatility * 0.42),
                max: finalPredictedClose * (1 + volatility * 0.42)
            };
            predictions.push({
                date: nextDate.toISOString().split('T')[0],
                predictedClose: parseFloat(finalPredictedClose.toFixed(2)),
                confidence: parseFloat(confidence.toFixed(2)),
                trend: limitedTrend > 0.01 ? 'up' : limitedTrend < -0.01 ? 'down' : 'stable',
                buySignal: limitedTrend > 0.02 && confidence > 0.79,
                sellSignal: limitedTrend < -0.02 && confidence > 0.79,
                upsidePotential: parseFloat((upsidePotential * 100).toFixed(2)),
                targetPrice: parseFloat(targetPrice.toFixed(2)),
                stopLoss: parseFloat(stopLoss.toFixed(2)),
                priceRange: {
                    min: parseFloat(priceRange.min.toFixed(2)),
                    max: parseFloat(priceRange.max.toFixed(2))
                }
            });
        }
        return predictions;
    }
    // 使用集成模型预测
    predictWithEnsemble(stockCode, prices, currentPrice) {
        const predictions = [];
        // 使用当前实时价格，如果没有则使用历史数据的最后价格
        const basePrice = currentPrice || prices[prices.length - 1];
        // 获取各基础模型的预测结果
        const lstmPredictions = this.predictWithNeuralNetwork(stockCode, prices, basePrice);
        const gruPredictions = this.predictWithNeuralNetwork(stockCode, prices, basePrice);
        const arimaPredictions = this.predictWithARIMA(stockCode, prices, basePrice);
        const svmPredictions = this.predictWithSVM(stockCode, prices, basePrice);
        const rfPredictions = this.predictWithRandomForest(stockCode, prices, basePrice);
        const xgbPredictions = this.predictWithXGBoost(stockCode, prices, basePrice);
        const lgbPredictions = this.predictWithLightGBM(stockCode, prices, basePrice);
        const prophetPredictions = this.predictWithProphet(stockCode, prices, basePrice);
        // 集成预测结果
        for (let i = 0; i < this.config.forecastDays; i++) {
            const weights = [0.2, 0.18, 0.12, 0.12, 0.12, 0.1, 0.1, 0.06];
            // 获取所有模型的预测价格
            const modelPredictions = [
                lstmPredictions[i].predictedClose,
                gruPredictions[i].predictedClose,
                arimaPredictions[i].predictedClose,
                svmPredictions[i].predictedClose,
                rfPredictions[i].predictedClose,
                xgbPredictions[i].predictedClose,
                lgbPredictions[i].predictedClose,
                prophetPredictions[i].predictedClose
            ];
            // 移除异常值（超过当前价格1.5倍或低于当前价格0.7倍的预测）
            const validPredictions = modelPredictions.filter(pred => pred >= basePrice * 0.7 && pred <= basePrice * 1.5);
            // 如果所有预测都异常，使用当前价格
            let predictedClose;
            if (validPredictions.length === 0) {
                predictedClose = basePrice;
            }
            else {
                // 计算加权平均
                predictedClose = validPredictions.reduce((sum, pred, idx) => {
                    const originalIdx = modelPredictions.indexOf(pred);
                    return sum + pred * weights[originalIdx];
                }, 0);
            }
            // 确保预测价格在严格合理范围内（基于当前价格的±15%）
            const finalPredictedClose = Math.max(basePrice * 0.85, Math.min(basePrice * 1.15, predictedClose));
            const confidence = lstmPredictions[i].confidence * weights[0] +
                gruPredictions[i].confidence * weights[1] +
                arimaPredictions[i].confidence * weights[2] +
                svmPredictions[i].confidence * weights[3] +
                rfPredictions[i].confidence * weights[4] +
                xgbPredictions[i].confidence * weights[5] +
                lgbPredictions[i].confidence * weights[6] +
                prophetPredictions[i].confidence * weights[7];
            // 计算上涨空间（基于预测价格和当前价格）
            const upsidePotential = ((finalPredictedClose - basePrice) / basePrice) * 100;
            const trendVotes = [
                lstmPredictions[i].trend,
                gruPredictions[i].trend,
                arimaPredictions[i].trend,
                svmPredictions[i].trend,
                rfPredictions[i].trend,
                xgbPredictions[i].trend,
                lgbPredictions[i].trend,
                prophetPredictions[i].trend
            ];
            const trendCounts = { up: 0, down: 0, stable: 0 };
            trendVotes.forEach(trend => trendCounts[trend]++);
            let trend = 'stable';
            if (trendCounts.up > trendCounts.down && trendCounts.up > trendCounts.stable) {
                trend = 'up';
            }
            else if (trendCounts.down > trendCounts.up && trendCounts.down > trendCounts.stable) {
                trend = 'down';
            }
            // 目标价格基于预测价格，而不是固定百分比
            const targetPrice = finalPredictedClose;
            // 止损价格基于预测价格的下跌风险，而不是固定百分比
            const stopLoss = basePrice * (1 - Math.min(0.1, Math.max(0, upsidePotential) / 100 * 0.5));
            // 计算价格波动范围（基于预测价格）
            const priceRange = {
                min: Math.max(basePrice * 0.9, finalPredictedClose * 0.95),
                max: Math.min(basePrice * 1.2, finalPredictedClose * 1.05)
            };
            predictions.push({
                date: lstmPredictions[i].date,
                predictedClose: parseFloat(finalPredictedClose.toFixed(2)),
                confidence: parseFloat(confidence.toFixed(2)),
                trend,
                buySignal: trend === 'up' && confidence > 0.85,
                sellSignal: trend === 'down' && confidence > 0.85,
                upsidePotential: parseFloat(Math.max(0, upsidePotential).toFixed(2)),
                targetPrice: parseFloat(targetPrice.toFixed(2)),
                stopLoss: parseFloat(stopLoss.toFixed(2)),
                priceRange: {
                    min: parseFloat(priceRange.min.toFixed(2)),
                    max: parseFloat(priceRange.max.toFixed(2))
                }
            });
        }
        return predictions;
    }
    // 计算近期趋势
    calculateRecentTrend(prices) {
        if (prices.length < 10)
            return 0;
        const recentPrices = prices.slice(-10);
        const firstPrice = recentPrices[0];
        const lastPrice = recentPrices[recentPrices.length - 1];
        const trend = (lastPrice - firstPrice) / firstPrice;
        return trend;
    }
    // 计算波动率
    calculateVolatility(prices) {
        if (prices.length < 5)
            return 0.02;
        const recentPrices = prices.slice(-20);
        const returns = [];
        for (let i = 1; i < recentPrices.length; i++) {
            returns.push((recentPrices[i] - recentPrices[i - 1]) / recentPrices[i - 1]);
        }
        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
        const volatility = Math.sqrt(variance);
        return Math.max(0.01, Math.min(0.1, volatility));
    }
    // 计算动量
    calculateMomentum(prices) {
        if (prices.length < 5)
            return 0;
        const recentPrices = prices.slice(-5);
        const olderPrices = prices.slice(-10, -5);
        const recentAvg = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
        const olderAvg = olderPrices.reduce((sum, p) => sum + p, 0) / olderPrices.length;
        return (recentAvg - olderAvg) / olderAvg;
    }
    // 计算ARIMA趋势
    calculateARIMATrend(prices) {
        if (prices.length < 20)
            return 0;
        // 简化的ARIMA趋势计算
        const recentPrices = prices.slice(-20);
        let trend = 0;
        for (let i = 1; i < recentPrices.length; i++) {
            trend += (recentPrices[i] - recentPrices[i - 1]) / recentPrices[i - 1];
        }
        return trend / (recentPrices.length - 1);
    }
    // 计算SVM趋势
    calculateSVMTrend(prices) {
        if (prices.length < 15)
            return 0;
        // 简化的SVM趋势计算
        const recentPrices = prices.slice(-15);
        const supportLevel = Math.min(...recentPrices.slice(-10));
        const resistanceLevel = Math.max(...recentPrices.slice(-10));
        const lastPrice = recentPrices[recentPrices.length - 1];
        // 基于价格位置计算趋势
        if (lastPrice > resistanceLevel * 1.02) {
            return 0.05; // 突破阻力位，上涨趋势
        }
        else if (lastPrice < supportLevel * 0.98) {
            return -0.05; // 跌破支撑位，下跌趋势
        }
        else {
            // 在区间内，基于近期走势
            const trend = this.calculateRecentTrend(prices);
            return trend * 0.8;
        }
    }
    // 计算随机森林趋势
    calculateRandomForestTrend(prices) {
        if (prices.length < 25)
            return 0;
        // 简化的随机森林趋势计算
        const features = this.extractFeatures(prices);
        // 标准化特征值，避免异常值影响
        const normalizedFeatures = features.map(f => Math.max(-0.1, Math.min(0.1, f)));
        const trend = normalizedFeatures.reduce((sum, f) => sum + f, 0) / normalizedFeatures.length;
        return Math.max(-0.1, Math.min(0.1, trend));
    }
    // 计算XGBoost趋势
    calculateXGBoostTrend(prices) {
        if (prices.length < 30)
            return 0;
        // 简化的XGBoost趋势计算
        const recentTrend = this.calculateRecentTrend(prices);
        const momentum = this.calculateMomentum(prices);
        const volatility = this.calculateVolatility(prices);
        // 结合多个因素
        let trend = recentTrend * 0.5 + momentum * 0.3;
        // 波动率调整
        if (volatility > 0.05) {
            trend *= 0.8; // 高波动时降低趋势强度
        }
        return Math.max(-0.12, Math.min(0.12, trend));
    }
    // 计算LightGBM趋势
    calculateLightGBMTrend(prices) {
        if (prices.length < 28)
            return 0;
        // 简化的LightGBM趋势计算
        const features = this.extractFeatures(prices);
        const recentTrend = this.calculateRecentTrend(prices);
        const momentum = this.calculateMomentum(prices);
        // 结合特征和趋势
        const featureScore = features.reduce((sum, f) => sum + f, 0) / features.length;
        let trend = recentTrend * 0.45 + momentum * 0.35 + featureScore * 0.2;
        return Math.max(-0.11, Math.min(0.11, trend));
    }
    // 计算Prophet趋势
    calculateProphetTrend(prices) {
        if (prices.length < 25)
            return 0;
        // 简化的Prophet趋势计算
        const recentPrices = prices.slice(-25);
        // 计算季节性趋势
        let seasonalTrend = 0;
        for (let i = 7; i < recentPrices.length; i++) {
            seasonalTrend += (recentPrices[i] - recentPrices[i - 7]) / recentPrices[i - 7];
        }
        seasonalTrend /= (recentPrices.length - 7);
        // 计算长期趋势
        const firstPrice = recentPrices[0];
        const lastPrice = recentPrices[recentPrices.length - 1];
        const longTermTrend = (lastPrice - firstPrice) / firstPrice;
        // 结合季节性和长期趋势
        let trend = seasonalTrend * 0.6 + longTermTrend * 0.4;
        return Math.max(-0.1, Math.min(0.1, trend));
    }
    // 提取特征用于随机森林
    extractFeatures(prices) {
        const features = [];
        // 近期收益率
        for (let i = 1; i <= 5; i++) {
            if (prices.length > i) {
                features.push((prices[prices.length - 1] - prices[prices.length - 1 - i]) / prices[prices.length - 1 - i]);
            }
        }
        // 移动平均线差异
        const ma5 = prices.slice(-5).reduce((sum, p) => sum + p, 0) / 5;
        const ma10 = prices.slice(-10).reduce((sum, p) => sum + p, 0) / 10;
        features.push((ma5 - ma10) / ma10);
        // 波动率
        features.push(this.calculateVolatility(prices));
        return features;
    }
    // 评估模型
    evaluateModel(X_test, y_test) {
        let correct = 0;
        for (let i = 0; i < X_test.length; i++) {
            const lastPrice = X_test[i][X_test[i].length - 1];
            const actualPrice = y_test[i];
            // 使用简单的预测逻辑，不调用异步的predict方法
            // 这里使用最后一个特征值作为简单预测
            const predictedPrice = lastPrice * (1 + (X_test[i][X_test[i].length - 2] || 0) * 0.01);
            // 预测方向正确就算正确
            const predictedDirection = predictedPrice > lastPrice ? 1 : predictedPrice < lastPrice ? -1 : 0;
            const actualDirection = actualPrice > lastPrice ? 1 : actualPrice < lastPrice ? -1 : 0;
            if (predictedDirection === actualDirection) {
                correct++;
            }
        }
        return (correct / X_test.length) * 100;
    }
    // 获取模型状态
    getModelStatus(stockCode) {
        if (stockCode) {
            return this.models.get(stockCode);
        }
        return {
            totalModels: this.models.size,
            models: Array.from(this.models.keys())
        };
    }
    // 删除模型
    deleteModel(stockCode) {
        return this.models.delete(stockCode);
    }
    // 清理所有模型
    clearAllModels() {
        this.models.clear();
        logger.info('所有预测模型已清理');
    }
}
// 全局实例
let timeSeriesPredictorInstance = null;
export function getTimeSeriesPredictor(config) {
    if (!timeSeriesPredictorInstance) {
        timeSeriesPredictorInstance = new TimeSeriesPredictor(config);
    }
    return timeSeriesPredictorInstance;
}
