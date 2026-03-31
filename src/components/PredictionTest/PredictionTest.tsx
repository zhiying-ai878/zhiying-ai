import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, message } from 'antd';
import { getHistoricalDataManager } from '../../utils/historicalData';
import { getTimeSeriesPredictor } from '../../utils/timeSeriesPredictor';
import { getFeatureEngineer } from '../../utils/featureEngineering';

const { Text, Paragraph } = Typography;

export const PredictionTest: React.FC = () => {
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      
    } catch (err) {
      console.error('测试失败:', err);
      setError(err instanceof Error ? err.message : String(err));
      message.error('预测功能测试失败');
    } finally {
      setLoading(false);
    }
  };

  return (<Card title="预测功能测试" style={{ margin: 20 }}><div style={{ marginBottom: 20 }}><Button type="primary" onClick={runTest} loading={loading}>运行预测测试</Button></div>{error && (<div style={{ padding: 16, backgroundColor: '#fff1f0', border: '1px solid #ffccc7', borderRadius: 4, marginBottom: 20 }}><Text type="danger">错误: {error}</Text></div>)}
      
      {testData && (<><Card title="测试结果" size="small" style={{ marginBottom: 16 }}><Paragraph>历史数据: {testData.historyData.length} 条</Paragraph><Paragraph>特征数据: {testData.features.length} 条</Paragraph><Paragraph>预测结果: {testData.predictions.length} 条</Paragraph></Card><Card title="预测详情" size="small">{testData.predictions.map((pred: any, index: number) => (<div key={index} style={{ marginBottom: 12, padding: 12, border: '1px solid #f0f0f0', borderRadius: 4 }}><div style={{ fontWeight: 'bold', marginBottom: 8 }}>{pred.date}</div><div>预测价格: {pred.predictedClose.toFixed(2)} 元</div><div>上涨空间: +{pred.upsidePotential.toFixed(2)}%</div><div>目标价格: {pred.targetPrice.toFixed(2)} 元</div><div>止损价格: {pred.stopLoss.toFixed(2)} 元</div></div>))}</Card></>)}</Card>);
};