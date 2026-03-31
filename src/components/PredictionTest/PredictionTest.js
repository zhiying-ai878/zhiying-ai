import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Button, Card, Typography, message } from 'antd';
import { getHistoricalDataManager } from '../../utils/historicalData';
import { getTimeSeriesPredictor } from '../../utils/timeSeriesPredictor';
import { getFeatureEngineer } from '../../utils/featureEngineering';
const { Text, Paragraph } = Typography;
export const PredictionTest = () => {
    const [testData, setTestData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const runTest = async () => {
        setLoading(true);
        setError(null);
        try {
            const stockCode = '600519'; // 贵州茅台
            console.log('开始测试预测功能...');
            // 测试历史数据获取
            const historicalManager = getHistoricalDataManager();
            const historyData = await historicalManager.getHistoricalData(stockCode);
            console.log('历史数据:', historyData.length, '条');
            if (historyData.length === 0) {
                throw new Error('未获取到历史数据');
            }
            // 测试特征提取
            const featureEngineer = getFeatureEngineer();
            const features = featureEngineer.extractFeatures(historyData);
            console.log('特征数据:', features.length, '条');
            // 测试预测
            const predictor = getTimeSeriesPredictor();
            const predictions = await predictor.predict(stockCode, historyData);
            console.log('预测结果:', predictions.length, '条');
            setTestData({
                historyData: historyData.slice(-5),
                features: features.slice(-1),
                predictions: predictions.slice(0, 3)
            });
            message.success('预测功能测试成功！');
        }
        catch (err) {
            console.error('测试失败:', err);
            setError(err instanceof Error ? err.message : String(err));
            message.error('预测功能测试失败');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Card, { title: "\u9884\u6D4B\u529F\u80FD\u6D4B\u8BD5", style: { margin: 20 }, children: [_jsx("div", { style: { marginBottom: 20 }, children: _jsx(Button, { type: "primary", onClick: runTest, loading: loading, children: "\u8FD0\u884C\u9884\u6D4B\u6D4B\u8BD5" }) }), error && (_jsx("div", { style: { padding: 16, backgroundColor: '#fff1f0', border: '1px solid #ffccc7', borderRadius: 4, marginBottom: 20 }, children: _jsxs(Text, { type: "danger", children: ["\u9519\u8BEF: ", error] }) })), testData && (_jsxs(_Fragment, { children: [_jsxs(Card, { title: "\u6D4B\u8BD5\u7ED3\u679C", size: "small", style: { marginBottom: 16 }, children: [_jsxs(Paragraph, { children: ["\u5386\u53F2\u6570\u636E: ", testData.historyData.length, " \u6761"] }), _jsxs(Paragraph, { children: ["\u7279\u5F81\u6570\u636E: ", testData.features.length, " \u6761"] }), _jsxs(Paragraph, { children: ["\u9884\u6D4B\u7ED3\u679C: ", testData.predictions.length, " \u6761"] })] }), _jsx(Card, { title: "\u9884\u6D4B\u8BE6\u60C5", size: "small", children: testData.predictions.map((pred, index) => (_jsxs("div", { style: { marginBottom: 12, padding: 12, border: '1px solid #f0f0f0', borderRadius: 4 }, children: [_jsx("div", { style: { fontWeight: 'bold', marginBottom: 8 }, children: pred.date }), _jsxs("div", { children: ["\u9884\u6D4B\u4EF7\u683C: ", pred.predictedClose.toFixed(2), " \u5143"] }), _jsxs("div", { children: ["\u4E0A\u6DA8\u7A7A\u95F4: +", pred.upsidePotential.toFixed(2), "%"] }), _jsxs("div", { children: ["\u76EE\u6807\u4EF7\u683C: ", pred.targetPrice.toFixed(2), " \u5143"] }), _jsxs("div", { children: ["\u6B62\u635F\u4EF7\u683C: ", pred.stopLoss.toFixed(2), " \u5143"] })] }, index))) })] }))] }));
};
