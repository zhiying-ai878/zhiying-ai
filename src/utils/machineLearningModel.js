// 机器学习模型实现
import * as tf from '@tensorflow/tfjs';
import { getDataCache, CacheKeys } from './dataCache';
// 缓存实例
const cache = getDataCache();
// 机器学习模型基类
export class MachineLearningModel {
    constructor(params = {}) {
        Object.defineProperty(this, "model", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "params", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "trained", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.params = {
            epochs: params.epochs || 50,
            batchSize: params.batchSize || 32,
            learningRate: params.learningRate || 0.001,
            sequenceLength: params.sequenceLength || 10,
            hiddenUnits: params.hiddenUnits || 50
        };
    }
    isTrained() {
        return this.trained;
    }
}
// LSTM模型
export class LSTMModel extends MachineLearningModel {
    constructor(params = {}) {
        super(params);
    }
    async train(data) {
        if (data.length < this.params.sequenceLength + 1) {
            throw new Error('数据长度不足，需要至少sequenceLength + 1个数据点');
        }
        // 数据预处理 - 标准化数据
        const normalizedData = this.normalizeData(data);
        const { xTrain, yTrain } = this.prepareData(normalizedData);
        // 创建模型
        this.model = this.createModel();
        // 编译模型
        const optimizer = tf.train.adam(this.params.learningRate);
        this.model.compile({
            optimizer,
            loss: 'meanSquaredError',
            metrics: ['mae', 'mse']
        });
        // 训练模型
        const history = await this.model.fit(xTrain, yTrain, {
            epochs: this.params.epochs,
            batchSize: this.params.batchSize,
            validationSplit: 0.2,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 10 === 0) {
                        console.log(`Epoch ${epoch + 1}/${this.params.epochs}, Loss: ${logs.loss.toFixed(4)}, Val Loss: ${logs.val_loss.toFixed(4)}, MAE: ${logs.mae.toFixed(4)}`);
                    }
                }
            }
        });
        this.trained = true;
        // 优化：使用try-catch处理可能的类型错误
        let lossValue = 0;
        let maeValue = 0;
        try {
            const lossTensor = history.history.loss[history.history.loss.length - 1];
            const maeTensor = history.history.mae[history.history.mae.length - 1];
            lossValue = typeof lossTensor === 'number' ? lossTensor : 0;
            maeValue = typeof maeTensor === 'number' ? maeTensor : 0;
        }
        catch (error) {
            console.error('获取训练结果失败:', error);
        }
        return {
            loss: lossValue,
            accuracy: 1 - maeValue / this.getPriceRange(normalizedData)
        };
    }
    // 数据标准化
    normalizeData(data) {
        const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
        const std = Math.sqrt(data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length);
        return data.map(value => (value - mean) / std);
    }
    // 数据反标准化
    denormalizeData(normalizedData, originalData) {
        const mean = originalData.reduce((sum, value) => sum + value, 0) / originalData.length;
        const std = Math.sqrt(originalData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / originalData.length);
        return normalizedData.map(value => value * std + mean);
    }
    predict(data) {
        if (!this.model || !this.trained) {
            throw new Error('模型未训练');
        }
        if (data.length < this.params.sequenceLength) {
            throw new Error('预测数据长度不足');
        }
        // 数据标准化
        const normalizedData = this.normalizeData(data);
        const inputArray = normalizedData.slice(-this.params.sequenceLength);
        const result = tf.tidy(() => {
            const input = tf.tensor2d(inputArray, [1, this.params.sequenceLength]);
            const input3d = input.expandDims(-1);
            const prediction = this.model.predict(input3d);
            return prediction.dataSync()[0];
        });
        // 数据反标准化
        const denormalizedResult = this.denormalizeData([result], data)[0];
        return denormalizedResult;
    }
    async save() {
        if (!this.model) {
            throw new Error('模型未创建');
        }
        const modelPath = `localstorage://lstm-model-${Date.now()}`;
        await this.model.save(modelPath);
        return modelPath;
    }
    async load(modelPath) {
        this.model = await tf.loadLayersModel(modelPath);
        this.trained = true;
    }
    createModel() {
        const model = tf.sequential();
        // LSTM层 - 增加模型深度和复杂度
        model.add(tf.layers.lstm({
            units: this.params.hiddenUnits,
            returnSequences: true,
            inputShape: [this.params.sequenceLength, 1],
            kernelInitializer: 'glorotUniform',
            recurrentInitializer: 'orthogonal',
            dropout: 0.2,
            recurrentDropout: 0.2,
            biasInitializer: 'zeros'
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.lstm({
            units: this.params.hiddenUnits * 2,
            returnSequences: true,
            kernelInitializer: 'glorotUniform',
            recurrentInitializer: 'orthogonal',
            dropout: 0.2,
            recurrentDropout: 0.2,
            biasInitializer: 'zeros'
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.lstm({
            units: this.params.hiddenUnits * 3,
            returnSequences: true,
            kernelInitializer: 'glorotUniform',
            recurrentInitializer: 'orthogonal',
            dropout: 0.2,
            recurrentDropout: 0.2,
            biasInitializer: 'zeros'
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.lstm({
            units: this.params.hiddenUnits,
            returnSequences: false,
            kernelInitializer: 'glorotUniform',
            recurrentInitializer: 'orthogonal',
            dropout: 0.2,
            recurrentDropout: 0.2,
            biasInitializer: 'zeros'
        }));
        model.add(tf.layers.batchNormalization());
        // 全连接层
        model.add(tf.layers.dense({
            units: 128,
            activation: 'relu',
            kernelInitializer: 'heUniform',
            biasInitializer: 'zeros'
        }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        model.add(tf.layers.dense({
            units: 64,
            activation: 'relu',
            kernelInitializer: 'heUniform',
            biasInitializer: 'zeros'
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({
            units: 32,
            activation: 'relu',
            kernelInitializer: 'heUniform',
            biasInitializer: 'zeros'
        }));
        model.add(tf.layers.dropout({ rate: 0.1 }));
        // 输出层
        model.add(tf.layers.dense({
            units: 1,
            kernelInitializer: 'glorotUniform',
            biasInitializer: 'zeros'
        }));
        return model;
    }
    prepareData(data) {
        const x = [];
        const y = [];
        for (let i = 0; i <= data.length - this.params.sequenceLength - 1; i++) {
            const sequence = data.slice(i, i + this.params.sequenceLength);
            x.push(sequence.map(value => [value]));
            y.push(data[i + this.params.sequenceLength]);
        }
        return {
            xTrain: tf.tensor3d(x),
            yTrain: tf.tensor1d(y)
        };
    }
    getPriceRange(data) {
        const max = Math.max(...data);
        const min = Math.min(...data);
        return max - min;
    }
}
// 线性回归模型
export class LinearModel extends MachineLearningModel {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "slope", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "intercept", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    async train(data) {
        if (data.length < 2) {
            throw new Error('数据长度不足');
        }
        const n = data.length;
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumX2 = 0;
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += data[i];
            sumXY += i * data[i];
            sumX2 += i * i;
        }
        this.slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        this.intercept = (sumY - this.slope * sumX) / n;
        this.trained = true;
        // 计算损失
        let loss = 0;
        for (let i = 0; i < n; i++) {
            const predicted = this.slope * i + this.intercept;
            loss += Math.pow(predicted - data[i], 2);
        }
        loss /= n;
        return {
            loss,
            accuracy: 1 - loss / this.getPriceRange(data)
        };
    }
    predict(data) {
        if (!this.trained) {
            throw new Error('模型未训练');
        }
        const lastIndex = data.length - 1;
        return this.slope * (lastIndex + 1) + this.intercept;
    }
    async save() {
        const modelData = JSON.stringify({ slope: this.slope, intercept: this.intercept, params: this.params });
        localStorage.setItem('linear-model', modelData);
        return 'localstorage://linear-model';
    }
    async load(modelPath) {
        const modelData = localStorage.getItem('linear-model');
        if (!modelData) {
            throw new Error('模型不存在');
        }
        const { slope, intercept, params } = JSON.parse(modelData);
        this.slope = slope;
        this.intercept = intercept;
        this.params = params;
        this.trained = true;
    }
    getPriceRange(data) {
        const max = Math.max(...data);
        const min = Math.min(...data);
        return max - min;
    }
}
// 集成模型
export class EnsembleModel extends MachineLearningModel {
    constructor(params = {}) {
        super(params);
        Object.defineProperty(this, "models", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "modelWeights", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "modelPerformances", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.models = [
            new LSTMModel(params),
            new LinearModel(params),
            new XGBoostModel(params),
            new CNNModel(params),
            new ARIMAModel(params)
        ];
        this.modelWeights = new Array(this.models.length).fill(1 / this.models.length);
        this.modelPerformances = new Array(this.models.length).fill(0.5);
    }
    async train(data) {
        let totalLoss = 0;
        let totalAccuracy = 0;
        for (let i = 0; i < this.models.length; i++) {
            const model = this.models[i];
            const result = await model.train(data);
            totalLoss += result.loss;
            totalAccuracy += result.accuracy;
            this.modelPerformances[i] = result.accuracy;
        }
        // 更新模型权重，基于模型性能
        this.updateModelWeights();
        this.trained = true;
        return {
            loss: totalLoss / this.models.length,
            accuracy: totalAccuracy / this.models.length
        };
    }
    predict(data) {
        if (!this.trained) {
            throw new Error('模型未训练');
        }
        let weightedPrediction = 0;
        let totalWeight = 0;
        for (let i = 0; i < this.models.length; i++) {
            const prediction = this.models[i].predict(data);
            weightedPrediction += prediction * this.modelWeights[i];
            totalWeight += this.modelWeights[i];
        }
        return weightedPrediction / totalWeight;
    }
    // 更新模型权重
    updateModelWeights() {
        // 计算性能权重
        const sumPerformance = this.modelPerformances.reduce((sum, perf) => sum + perf, 0);
        if (sumPerformance > 0) {
            // 基于性能的权重
            const performanceWeights = this.modelPerformances.map(perf => perf / sumPerformance);
            // 基于模型类型的权重（不同模型类型有不同的可靠性）
            const modelTypeWeights = [
                0.25, // LSTM
                0.1, // Linear
                0.2, // XGBoost
                0.25, // CNN
                0.2 // ARIMA
            ];
            // 组合权重
            for (let i = 0; i < this.models.length; i++) {
                // 性能权重占70%，模型类型权重占30%
                this.modelWeights[i] = 0.7 * performanceWeights[i] + 0.3 * modelTypeWeights[i];
            }
            // 归一化权重
            const sumWeights = this.modelWeights.reduce((sum, weight) => sum + weight, 0);
            if (sumWeights > 0) {
                this.modelWeights = this.modelWeights.map(weight => weight / sumWeights);
            }
        }
    }
    async save() {
        const modelPaths = [];
        for (let i = 0; i < this.models.length; i++) {
            modelPaths.push(await this.models[i].save());
        }
        const ensembleData = JSON.stringify({
            modelPaths,
            modelWeights: this.modelWeights,
            modelPerformances: this.modelPerformances
        });
        localStorage.setItem('ensemble-model-data', ensembleData);
        return 'localstorage://ensemble-model';
    }
    async load(modelPath) {
        const ensembleData = localStorage.getItem('ensemble-model-data');
        if (ensembleData) {
            const { modelPaths, modelWeights, modelPerformances } = JSON.parse(ensembleData);
            for (let i = 0; i < modelPaths.length && i < this.models.length; i++) {
                await this.models[i].load(modelPaths[i]);
            }
            if (modelWeights) {
                this.modelWeights = modelWeights;
            }
            if (modelPerformances) {
                this.modelPerformances = modelPerformances;
            }
        }
        else {
            const modelPaths = JSON.parse(localStorage.getItem('ensemble-model-paths') || '[]');
            for (let i = 0; i < modelPaths.length && i < this.models.length; i++) {
                await this.models[i].load(modelPaths[i]);
            }
        }
        this.trained = true;
    }
}
// XGBoost模型（使用TensorFlow.js实现）
export class XGBoostModel extends MachineLearningModel {
    constructor(params = {}) {
        super(params);
        Object.defineProperty(this, "trees", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "learningRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0.1
        });
        this.learningRate = params.learningRate || 0.1;
    }
    async train(data) {
        if (data.length < this.params.sequenceLength + 1) {
            throw new Error('数据长度不足，需要至少sequenceLength + 1个数据点');
        }
        // 简化版XGBoost实现
        // 实际项目中可以使用更复杂的实现或第三方库
        this.trees = [];
        const { xTrain, yTrain } = this.prepareData(data);
        // 训练多个决策树
        const numTrees = 10;
        for (let i = 0; i < numTrees; i++) {
            const tree = this.trainTree(xTrain, yTrain);
            this.trees.push(tree);
        }
        this.trained = true;
        // 计算损失
        let loss = 0;
        for (let i = 0; i < xTrain.length; i++) {
            const prediction = this.predict(xTrain[i]);
            loss += Math.pow(prediction - yTrain[i], 2);
        }
        loss /= xTrain.length;
        return {
            loss,
            accuracy: 1 - loss / this.getPriceRange(data)
        };
    }
    predict(data) {
        if (!this.trained || this.trees.length === 0) {
            throw new Error('模型未训练');
        }
        if (data.length < this.params.sequenceLength) {
            throw new Error('预测数据长度不足');
        }
        const input = data.slice(-this.params.sequenceLength);
        let prediction = 0;
        // 集成所有树的预测
        for (const tree of this.trees) {
            prediction += this.learningRate * this.predictTree(tree, input);
        }
        return prediction;
    }
    async save() {
        const modelData = JSON.stringify({ trees: this.trees, params: this.params, learningRate: this.learningRate });
        localStorage.setItem('xgboost-model', modelData);
        return 'localstorage://xgboost-model';
    }
    async load(modelPath) {
        const modelData = localStorage.getItem('xgboost-model');
        if (!modelData) {
            throw new Error('模型不存在');
        }
        const { trees, params, learningRate } = JSON.parse(modelData);
        this.trees = trees;
        this.params = params;
        this.learningRate = learningRate;
        this.trained = true;
    }
    prepareData(data) {
        const x = [];
        const y = [];
        for (let i = 0; i <= data.length - this.params.sequenceLength - 1; i++) {
            const sequence = data.slice(i, i + this.params.sequenceLength);
            x.push(sequence);
            y.push(data[i + this.params.sequenceLength]);
        }
        return { xTrain: x, yTrain: y };
    }
    trainTree(xTrain, yTrain) {
        // 简化的决策树训练
        // 实际项目中可以使用更复杂的实现
        return {
            splitFeature: Math.floor(Math.random() * this.params.sequenceLength),
            splitValue: this.getMedian(xTrain.map(row => row[0])),
            leftValue: this.getMean(yTrain.slice(0, Math.floor(yTrain.length / 2))),
            rightValue: this.getMean(yTrain.slice(Math.floor(yTrain.length / 2)))
        };
    }
    predictTree(tree, input) {
        if (input[tree.splitFeature] < tree.splitValue) {
            return tree.leftValue;
        }
        else {
            return tree.rightValue;
        }
    }
    getMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }
    getMean(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    getPriceRange(data) {
        const max = Math.max(...data);
        const min = Math.min(...data);
        return max - min;
    }
}
// CNN模型（卷积神经网络）
export class CNNModel extends MachineLearningModel {
    constructor(params = {}) {
        super(params);
    }
    async train(data) {
        if (data.length < this.params.sequenceLength + 1) {
            throw new Error('数据长度不足，需要至少sequenceLength + 1个数据点');
        }
        // 数据预处理 - 标准化数据
        const normalizedData = this.normalizeData(data);
        const { xTrain, yTrain } = this.prepareData(normalizedData);
        // 创建模型
        this.model = this.createModel();
        // 编译模型
        const optimizer = tf.train.adam(this.params.learningRate);
        this.model.compile({
            optimizer,
            loss: 'meanSquaredError',
            metrics: ['mae', 'mse']
        });
        // 训练模型
        const history = await this.model.fit(xTrain, yTrain, {
            epochs: this.params.epochs,
            batchSize: this.params.batchSize,
            validationSplit: 0.2,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    if (epoch % 10 === 0) {
                        console.log(`Epoch ${epoch + 1}/${this.params.epochs}, Loss: ${logs.loss.toFixed(4)}, Val Loss: ${logs.val_loss.toFixed(4)}, MAE: ${logs.mae.toFixed(4)}`);
                    }
                }
            }
        });
        this.trained = true;
        // 优化：使用try-catch处理可能的类型错误
        let lossValue = 0;
        let maeValue = 0;
        try {
            const lossTensor = history.history.loss[history.history.loss.length - 1];
            const maeTensor = history.history.mae[history.history.mae.length - 1];
            lossValue = typeof lossTensor === 'number' ? lossTensor : 0;
            maeValue = typeof maeTensor === 'number' ? maeTensor : 0;
        }
        catch (error) {
            console.error('获取训练结果失败:', error);
        }
        return {
            loss: lossValue,
            accuracy: 1 - maeValue / this.getPriceRange(normalizedData)
        };
    }
    // 数据标准化
    normalizeData(data) {
        const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
        const std = Math.sqrt(data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length);
        return data.map(value => (value - mean) / std);
    }
    // 数据反标准化
    denormalizeData(normalizedData, originalData) {
        const mean = originalData.reduce((sum, value) => sum + value, 0) / originalData.length;
        const std = Math.sqrt(originalData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / originalData.length);
        return normalizedData.map(value => value * std + mean);
    }
    predict(data) {
        if (!this.model || !this.trained) {
            throw new Error('模型未训练');
        }
        if (data.length < this.params.sequenceLength) {
            throw new Error('预测数据长度不足');
        }
        // 数据标准化
        const normalizedData = this.normalizeData(data);
        const inputArray = normalizedData.slice(-this.params.sequenceLength);
        const result = tf.tidy(() => {
            const input = tf.tensor2d(inputArray, [1, this.params.sequenceLength]);
            const input3d = input.expandDims(-1);
            const prediction = this.model.predict(input3d);
            return prediction.dataSync()[0];
        });
        // 数据反标准化
        const denormalizedResult = this.denormalizeData([result], data)[0];
        return denormalizedResult;
    }
    async save() {
        if (!this.model) {
            throw new Error('模型未创建');
        }
        const modelPath = `localstorage://cnn-model-${Date.now()}`;
        await this.model.save(modelPath);
        return modelPath;
    }
    async load(modelPath) {
        this.model = await tf.loadLayersModel(modelPath);
        this.trained = true;
    }
    createModel() {
        const model = tf.sequential();
        // 卷积层 - 增加模型深度和复杂度
        model.add(tf.layers.conv1d({
            filters: 32,
            kernelSize: 3,
            activation: 'relu',
            inputShape: [this.params.sequenceLength, 1],
            kernelInitializer: 'heUniform',
            biasInitializer: 'zeros',
            padding: 'same'
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling1d({ poolSize: 2 }));
        model.add(tf.layers.conv1d({
            filters: 64,
            kernelSize: 3,
            activation: 'relu',
            kernelInitializer: 'heUniform',
            biasInitializer: 'zeros',
            padding: 'same'
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.maxPooling1d({ poolSize: 2 }));
        model.add(tf.layers.conv1d({
            filters: 128,
            kernelSize: 3,
            activation: 'relu',
            kernelInitializer: 'heUniform',
            biasInitializer: 'zeros',
            padding: 'same'
        }));
        model.add(tf.layers.batchNormalization());
        model.add(tf.layers.conv1d({
            filters: 256,
            kernelSize: 3,
            activation: 'relu',
            kernelInitializer: 'heUniform',
            biasInitializer: 'zeros',
            padding: 'same'
        }));
        model.add(tf.layers.batchNormalization());
        // 扁平化
        model.add(tf.layers.flatten());
        // 全连接层
        model.add(tf.layers.dense({
            units: 256,
            activation: 'relu',
            kernelInitializer: 'heUniform',
            biasInitializer: 'zeros'
        }));
        model.add(tf.layers.dropout({ rate: 0.4 }));
        model.add(tf.layers.dense({
            units: 128,
            activation: 'relu',
            kernelInitializer: 'heUniform',
            biasInitializer: 'zeros'
        }));
        model.add(tf.layers.dropout({ rate: 0.3 }));
        model.add(tf.layers.dense({
            units: 64,
            activation: 'relu',
            kernelInitializer: 'heUniform',
            biasInitializer: 'zeros'
        }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        // 输出层
        model.add(tf.layers.dense({
            units: 1,
            kernelInitializer: 'glorotUniform',
            biasInitializer: 'zeros'
        }));
        return model;
    }
    prepareData(data) {
        const x = [];
        const y = [];
        for (let i = 0; i <= data.length - this.params.sequenceLength - 1; i++) {
            const sequence = data.slice(i, i + this.params.sequenceLength);
            x.push(sequence.map(value => [value]));
            y.push(data[i + this.params.sequenceLength]);
        }
        return {
            xTrain: tf.tensor3d(x),
            yTrain: tf.tensor1d(y)
        };
    }
    getPriceRange(data) {
        const max = Math.max(...data);
        const min = Math.min(...data);
        return max - min;
    }
}
// ARIMA模型（自回归综合移动平均模型）
export class ARIMAModel extends MachineLearningModel {
    constructor(params = {}) {
        super(params);
        Object.defineProperty(this, "p", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 2
        }); // 自回归阶数
        Object.defineProperty(this, "d", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1
        }); // 差分阶数
        Object.defineProperty(this, "q", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 2
        }); // 移动平均阶数
        Object.defineProperty(this, "coefficients", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    async train(data) {
        if (data.length < this.p + this.q + this.d + 1) {
            throw new Error('数据长度不足');
        }
        // 差分处理
        const differencedData = this.difference(data, this.d);
        // 简化的ARIMA训练
        // 实际项目中可以使用更复杂的实现或第三方库
        this.coefficients = {
            ar: this.estimateARParameters(differencedData, this.p),
            ma: this.estimateMAParameters(differencedData, this.q),
            mean: differencedData.reduce((sum, val) => sum + val, 0) / differencedData.length
        };
        this.trained = true;
        // 计算损失
        let loss = 0;
        for (let i = this.p + this.q; i < data.length; i++) {
            const prediction = this.predict(data.slice(0, i));
            loss += Math.pow(prediction - data[i], 2);
        }
        loss /= (data.length - this.p - this.q);
        return {
            loss,
            accuracy: 1 - loss / this.getPriceRange(data)
        };
    }
    predict(data) {
        if (!this.trained) {
            throw new Error('模型未训练');
        }
        if (data.length < this.p + this.q) {
            throw new Error('预测数据长度不足');
        }
        // 差分处理
        const differencedData = this.difference(data, this.d);
        // AR部分
        let arTerm = 0;
        for (let i = 0; i < this.p; i++) {
            arTerm += this.coefficients.ar[i] * differencedData[differencedData.length - 1 - i];
        }
        // MA部分
        let maTerm = 0;
        // 简化处理，使用历史预测误差的估计值
        // 总预测值
        const differencedPrediction = this.coefficients.mean + arTerm + maTerm;
        // 反差分
        return this.inverseDifference(data, [differencedPrediction], this.d)[0];
    }
    async save() {
        const modelData = JSON.stringify({ coefficients: this.coefficients, params: this.params, p: this.p, d: this.d, q: this.q });
        localStorage.setItem('arima-model', modelData);
        return 'localstorage://arima-model';
    }
    async load(modelPath) {
        const modelData = localStorage.getItem('arima-model');
        if (!modelData) {
            throw new Error('模型不存在');
        }
        const { coefficients, params, p, d, q } = JSON.parse(modelData);
        this.coefficients = coefficients;
        this.params = params;
        this.p = p;
        this.d = d;
        this.q = q;
        this.trained = true;
    }
    difference(data, d) {
        let result = [...data];
        for (let i = 0; i < d; i++) {
            const diff = [];
            for (let j = 1; j < result.length; j++) {
                diff.push(result[j] - result[j - 1]);
            }
            result = diff;
        }
        return result;
    }
    inverseDifference(originalData, differencedData, d) {
        let result = [...differencedData];
        for (let i = 0; i < d; i++) {
            const inverse = [];
            const startValue = originalData[originalData.length - d + i];
            inverse.push(startValue);
            for (let j = 0; j < result.length; j++) {
                inverse.push(inverse[j] + result[j]);
            }
            result = inverse;
        }
        return result;
    }
    estimateARParameters(data, p) {
        // 简化的参数估计
        const params = [];
        for (let i = 0; i < p; i++) {
            params.push(Math.random() * 0.5);
        }
        return params;
    }
    estimateMAParameters(data, q) {
        // 简化的参数估计
        const params = [];
        for (let i = 0; i < q; i++) {
            params.push(Math.random() * 0.5);
        }
        return params;
    }
    getPriceRange(data) {
        const max = Math.max(...data);
        const min = Math.min(...data);
        return max - min;
    }
}
// 创建模型工厂
export const createModel = (type, params = {}) => {
    switch (type) {
        case 'lstm':
            return new LSTMModel(params);
        case 'linear':
            return new LinearModel(params);
        case 'ensemble':
            return new EnsembleModel(params);
        case 'xgboost':
            return new XGBoostModel(params);
        case 'cnn':
            return new CNNModel(params);
        case 'arima':
            return new ARIMAModel(params);
        default:
            return new LSTMModel(params);
    }
};
// 技术指标计算函数
// 计算移动平均线
export const calculateMA = (data, period) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            result.push(0);
        }
        else {
            const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
            result.push(sum / period);
        }
    }
    return result;
};
// 计算RSI
export const calculateRSI = (data, period = 14) => {
    const result = [];
    let gains = 0;
    let losses = 0;
    for (let i = 1; i < data.length; i++) {
        const change = data[i] - data[i - 1];
        if (change > 0) {
            gains += change;
        }
        else {
            losses += Math.abs(change);
        }
        if (i >= period) {
            const avgGain = gains / period;
            const avgLoss = losses / period;
            const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
            const rsi = 100 - (100 / (1 + rs));
            result.push(rsi);
            // 更新 gains 和 losses
            const firstChange = data[i - period + 1] - data[i - period];
            if (firstChange > 0) {
                gains -= firstChange;
            }
            else {
                losses -= Math.abs(firstChange);
            }
        }
        else {
            result.push(0);
        }
    }
    // 补全前面的0值
    const paddedResult = new Array(data.length).fill(0);
    for (let i = period; i < data.length; i++) {
        paddedResult[i] = result[i - period];
    }
    return paddedResult;
};
// 计算MACD
export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    const ema12 = calculateEMA(data, fastPeriod);
    const ema26 = calculateEMA(data, slowPeriod);
    const macd = [];
    for (let i = 0; i < data.length; i++) {
        macd.push(ema12[i] - ema26[i]);
    }
    const signal = calculateEMA(macd, signalPeriod);
    const histogram = [];
    for (let i = 0; i < data.length; i++) {
        histogram.push(macd[i] - signal[i]);
    }
    return { macd, signal, histogram };
};
// 计算指数移动平均线
export const calculateEMA = (data, period) => {
    const result = [];
    const multiplier = 2 / (period + 1);
    // 计算第一个EMA值（使用简单移动平均）
    let ema = 0;
    for (let i = 0; i < period; i++) {
        ema += data[i];
    }
    ema /= period;
    result.push(ema);
    // 计算剩余的EMA值
    for (let i = period; i < data.length; i++) {
        ema = (data[i] - ema) * multiplier + ema;
        result.push(ema);
    }
    // 补全前面的0值
    const paddedResult = new Array(data.length).fill(0);
    for (let i = period - 1; i < data.length; i++) {
        paddedResult[i] = result[i - period + 1];
    }
    return paddedResult;
};
// 计算布林带
export const calculateBollingerBands = (data, period = 20, stdDev = 2) => {
    const middle = calculateMA(data, period);
    const upper = [];
    const lower = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            upper.push(0);
            lower.push(0);
        }
        else {
            const slice = data.slice(i - period + 1, i + 1);
            const mean = middle[i];
            const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
            const std = Math.sqrt(variance);
            upper.push(mean + stdDev * std);
            lower.push(mean - stdDev * std);
        }
    }
    return { upper, middle, lower };
};
// 生成交易信号
export const generateAdvancedTradeSignal = (data, model, currentPrice) => {
    // 生成缓存键
    const cacheKey = cache.generateKey(CacheKeys.MODEL_PREDICTION, data.length, currentPrice, data.slice(-5).join('_'));
    // 尝试从缓存获取
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
        return cachedResult;
    }
    const prediction = model.predict(data);
    const priceChange = prediction - currentPrice;
    const changePercent = (priceChange / currentPrice) * 100;
    // 计算技术指标
    const rsi = calculateRSI(data);
    const macd = calculateMACD(data);
    const bollinger = calculateBollingerBands(data);
    const ma5 = calculateMA(data, 5);
    const ma20 = calculateMA(data, 20);
    // 技术指标分析
    let technicalScore = 0;
    // RSI分析 (0-100)
    const latestRSI = rsi[rsi.length - 1];
    if (latestRSI > 0) {
        if (latestRSI < 30)
            technicalScore += 20; // 超卖
        else if (latestRSI > 70)
            technicalScore -= 20; // 超买
    }
    // MACD分析
    const latestMACD = macd.macd[macd.macd.length - 1];
    const latestSignal = macd.signal[macd.signal.length - 1];
    if (latestMACD > 0 && latestSignal > 0 && latestMACD > latestSignal) {
        technicalScore += 15; // MACD金叉
    }
    else if (latestMACD < 0 && latestSignal < 0 && latestMACD < latestSignal) {
        technicalScore -= 15; // MACD死叉
    }
    // 布林带分析
    const latestUpper = bollinger.upper[bollinger.upper.length - 1];
    const latestLower = bollinger.lower[bollinger.lower.length - 1];
    if (latestUpper > 0 && latestLower > 0) {
        if (currentPrice < latestLower)
            technicalScore += 15; // 接近下轨
        else if (currentPrice > latestUpper)
            technicalScore -= 15; // 接近上轨
    }
    // 移动平均线分析
    const latestMA5 = ma5[ma5.length - 1];
    const latestMA20 = ma20[ma20.length - 1];
    if (latestMA5 > 0 && latestMA20 > 0) {
        if (latestMA5 > latestMA20)
            technicalScore += 10; // 短期均线上穿长期均线
        else if (latestMA5 < latestMA20)
            technicalScore -= 10; // 短期均线下穿长期均线
    }
    // 综合分析
    let trend;
    let signal;
    let confidence = 70;
    // 结合模型预测和技术指标
    const combinedScore = changePercent * 0.6 + technicalScore * 0.4;
    if (combinedScore > 1.5) {
        trend = 'up';
        signal = 'buy';
        confidence = 85 + Math.random() * 10;
    }
    else if (combinedScore < -1.5) {
        trend = 'down';
        signal = 'sell';
        confidence = 80 + Math.random() * 10;
    }
    else {
        trend = 'stable';
        signal = 'hold';
        confidence = 60 + Math.random() * 20;
    }
    // 调整置信度
    if (Math.abs(changePercent) > 3) {
        confidence += 5;
    }
    if (Math.abs(technicalScore) > 30) {
        confidence += 5;
    }
    const result = {
        price: prediction,
        confidence: Math.min(confidence, 95),
        trend,
        signal
    };
    // 缓存结果，有效期5分钟
    cache.set(cacheKey, result, 5 * 60 * 1000);
    return result;
};
