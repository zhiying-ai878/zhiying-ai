import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, message } from 'antd';
import { getHistoricalDataManager } from '../../utils/historicalData';
import { getTimeSeriesPredictor } from '../../utils/timeSeriesPredictor';
import { getRealtimeQuote } from '../../utils/stockData';

const { Text } = Typography;

interface PredictionVisualizationProps {
  stockCode: string;
  stockName: string;
}

export const PredictionVisualization: React.FC<PredictionVisualizationProps> = ({ stockCode, stockName }) => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    loadPredictionData();
  }, [stockCode]);

  const loadPredictionData = async () => {
    console.log(`开始加载股票 ${stockCode} 的预测数据`);
    setLoading(true);
    try {
      // 先获取实时价格，确保使用最新的实时数据进行预测
      console.log(`正在获取股票 ${stockCode} 的实时价格`);
      let realtimeData;
      let retryCount = 0;
      const maxRetries = 10; // 大幅增加重试次数
      const retryDelay = 500; // 增加重试间隔
      
      // 尝试多次获取实时数据，确保能获取到最新价格
      while (retryCount< maxRetries) {
        try {
          realtimeData = await getRealtimeQuote([stockCode]);
          console.log(`第 ${retryCount + 1} 次尝试获取实时数据:`, realtimeData);
          
          if (realtimeData && realtimeData.length >0 && realtimeData[0].price > 0) {
            console.log(`成功获取实时数据，跳出重试循环`);
            break;
          } else {
            console.log(`获取实时数据失败，返回数据不完整或价格为0`);
          }
        } catch (error) {
          console.error(`获取实时数据时发生错误:`, error);
        }
        
        retryCount++;
        console.log(`获取实时数据失败，第 ${retryCount} 次重试...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
      
      console.log(`最终实时数据:`, realtimeData);
      
      let realtimePrice = null;
      if (realtimeData && realtimeData.length > 0 && realtimeData[0].price > 0) {
        realtimePrice = realtimeData[0].price;
        setCurrentPrice(realtimePrice);
        console.log(`股票 ${stockCode} 当前实时价格: ${realtimePrice}`);
      } else {
        console.error(`无法获取股票 ${stockCode} 的实时价格，使用历史数据的最后价格`);
        message.warning('无法获取实时价格，使用历史数据的最后价格进行预测');
      }

      const historicalManager = getHistoricalDataManager();
      console.log(`正在获取股票 ${stockCode} 的历史数据`);
      const data = await historicalManager.getHistoricalData(stockCode);
      console.log(`获取到历史数据: ${data.length} 条`);

      if (data.length === 0) {
        console.error(`股票 ${stockCode} 历史数据为空`);
        message.warning('没有可用的历史数据');
        setLoading(false);
        return;
      }

      console.log(`历史数据样本:`, data.slice(0, 5));

      const predictor = getTimeSeriesPredictor();
      console.log(`正在对股票 ${stockCode} 进行预测`);
      const predictionResults = await predictor.predict(stockCode, data, realtimePrice || undefined);
      console.log(`预测结果: ${predictionResults.length} 条`, predictionResults);
      
      setPredictions(predictionResults);

      const hasBuySignal = predictionResults.some(p => p.buySignal);
      if (hasBuySignal) {
        message.success(`${stockName}(${stockCode}) 检测到买入信号！`);
      }
    } catch (error) {
      console.error('加载预测数据失败:', error);
      message.error(`加载预测数据失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title={`${stockName}(${stockCode}) AI预测`}
      extra={<Button type="primary" onClick={loadPredictionData} loading={loading}>刷新</Button>}
    >{loading ? (<Text>加载预测中...</Text>) : predictions.length === 0 ? (<Text>暂无预测数据</Text>) : (<div>{predictions.map((prediction, index) => (<div key={index} style={{ marginBottom: 16 }}><Text strong>{prediction.date}</Text><div>预测价格: {prediction.predictedClose.toFixed(2)}元</div><div>上涨空间: +{prediction.upsidePotential.toFixed(2)}%</div><div>目标价格: {prediction.targetPrice.toFixed(2)}元</div><div>止损价格: {prediction.stopLoss.toFixed(2)}元</div>{prediction.buySignal && (<Text type="success">买入信号</Text>)}
              {prediction.sellSignal && (<Text type="danger">卖出信号</Text>)}</div>))}</div>)}</Card>);
};