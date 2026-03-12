import React, { useState, useEffect } from 'react';
import { Card, Tabs, Row, Col, Statistic, Progress, Button, List, Tag, Space, Input, Select, message, Alert, Spin } from 'antd';
import { RiseOutlined, FallOutlined, SearchOutlined, HistoryOutlined, BarChartOutlined, FundOutlined, ThunderboltOutlined, LoadingOutlined } from '@ant-design/icons';
import { createModel, generatePrediction, ModelType, TrainingParams, calculateMA, calculateRSI, calculateMACD, calculateBollingerBands } from '../../utils/machineLearningModel';
import { getKLineData } from '../../utils/stockData';

const { Option } = Select;

const Prediction = () => {
  const [searchCode, setSearchCode] = useState('002594');
  const [searchName, setSearchName] = useState('比亚迪');
  const [predictionResult, setPredictionResult] = useState({
    price: 185.6,
    confidence: 78,
    trend: 'up' as 'up' | 'down' | 'stable',
    signal: 'buy' as 'buy' | 'sell' | 'hold',
    targetPrice: 192.5,
    supportPrice: 180.0,
    resistancePrice: 188.0,
    timeFrame: '3天'
  });
  const [loading, setLoading] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelTrained, setModelTrained] = useState(false);
  const [technicalIndicators, setTechnicalIndicators] = useState({
    ma5: 0,
    ma10: 0,
    ma20: 0,
    rsi: 0,
    macd: 0,
    macdSignal: 0,
    macdHistogram: 0,
    bollingerUpper: 0,
    bollingerMiddle: 0,
    bollingerLower: 0
  });
  const [historyPredictions, setHistoryPredictions] = useState([
    { id: '1', code: '002594', name: '比亚迪', date: '2025-02-27', prediction: 'up', actual: 'up', accuracy: true },
    { id: '2', code: '300750', name: '宁德时代', date: '2025-02-26', prediction: 'down', actual: 'down', accuracy: true },
    { id: '3', code: '600519', name: '贵州茅台', date: '2025-02-25', prediction: 'up', actual: 'down', accuracy: false }
  ]);

  // 训练模型
  const trainModel = async (prices: number[]) => {
    setModelLoading(true);
    try {
      const modelParams: TrainingParams = {
        epochs: 50,
        batchSize: 32,
        learningRate: 0.001,
        sequenceLength: 10,
        hiddenUnits: 50
      };
      
      const model = createModel('lstm', modelParams);
      const result = await model.train(prices);
      console.log('模型训练完成:', result);
      setModelTrained(true);
      return model;
    } catch (error) {
      console.error('模型训练失败:', error);
      message.error('模型训练失败');
      return null;
    } finally {
      setModelLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    message.loading({ content: 'AI正在分析中...', key: 'predict' });
    
    try {
      // 获取历史K线数据
      const klineData = await getKLineData(searchCode, 'day', 60);
      const prices = klineData.map(item => item.close);
      
      // 计算技术指标
      const ma5 = calculateMA(prices, 5);
      const ma10 = calculateMA(prices, 10);
      const ma20 = calculateMA(prices, 20);
      const rsi = calculateRSI(prices, 14);
      const macd = calculateMACD(prices);
      const bollinger = calculateBollingerBands(prices);
      
      // 训练模型
      const model = await trainModel(prices);
      if (!model) {
        throw new Error('模型训练失败');
      }
      
      // 生成预测
      const currentPrice = prices[prices.length - 1];
      const prediction = await generatePrediction(prices, model, currentPrice);
      
      // 计算支撑位和压力位
      const supportPrice = currentPrice * 0.95;
      const resistancePrice = currentPrice * 1.05;
      
      setPredictionResult({
        ...prediction,
        targetPrice: prediction.price,
        supportPrice,
        resistancePrice,
        timeFrame: '3天'
      });
      
      // 保存技术指标数据用于展示
      setTechnicalIndicators({
        ma5: ma5[ma5.length - 1],
        ma10: ma10[ma10.length - 1],
        ma20: ma20[ma20.length - 1],
        rsi: rsi[rsi.length - 1],
        macd: macd.macd[macd.macd.length - 1],
        macdSignal: macd.signal[macd.signal.length - 1],
        macdHistogram: macd.histogram[macd.histogram.length - 1],
        bollingerUpper: bollinger.upper[bollinger.upper.length - 1],
        bollingerMiddle: bollinger.middle[bollinger.middle.length - 1],
        bollingerLower: bollinger.lower[bollinger.lower.length - 1]
      });
      
      message.success({ content: '预测完成！', key: 'predict' });
    } catch (error) {
      console.error('预测失败:', error);
      message.error('预测失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const predictionTab = {
    key: '1',
    label: <span><BarChartOutlined />涨跌预测</span>,
    children: (
      <div>
        <Card size="small" style={{ margin: '2px' }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input placeholder="输入股票代码" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} prefix={<SearchOutlined />} />
            <Input placeholder="股票名称" value={searchName} onChange={(e) => setSearchName(e.target.value)} />
            <Select defaultValue="3days" style={{ width: 120 }}><Option value="1day">1天</Option><Option value="3days">3天</Option><Option value="1week">1周</Option></Select>
            <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleSearch}>AI预测</Button>
          </Space.Compact>
        </Card>

        <Row gutter={[2, 2]}>
          <Col xs={24} sm={12}>
            <Card size="small" style={{ margin: '2px' }}>
              <Statistic title="当前股票" value={searchName} prefix={<FundOutlined />} valueStyle={{ fontSize: '20px' }} />
              <div style={{ marginTop: '8px', color: '#666' }}>代码：{searchCode}</div>
              {modelLoading && (
                <div style={{ marginTop: '8px' }}>
                  <Spin size="small" tip="模型训练中..." />
                </div>
              )}
              {modelTrained && (
                <div style={{ marginTop: '8px', color: '#52c41a' }}>
                  ✅ 模型训练完成
                </div>
              )}
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card size="small" style={{ margin: '2px' }}>
              <Statistic title="预测方向" value={predictionResult.trend === 'up' ? '上涨' : predictionResult.trend === 'down' ? '下跌' : '稳定'} prefix={predictionResult.trend === 'up' ? <RiseOutlined /> : predictionResult.trend === 'down' ? <FallOutlined /> : <FundOutlined />} valueStyle={{ color: predictionResult.trend === 'up' ? '#3f8600' : predictionResult.trend === 'down' ? '#cf1322' : '#1890ff', fontSize: '20px' }} />
              <div style={{ marginTop: '8px' }}><span>置信度：</span><Progress percent={predictionResult.confidence} size="small" style={{ width: '120px', display: 'inline-block', verticalAlign: 'middle' }} strokeColor={predictionResult.trend === 'up' ? '#52c41a' : predictionResult.trend === 'down' ? '#ff4d4f' : '#1890ff'} /></div>
              <div style={{ marginTop: '8px' }}><span>交易信号：</span><Tag color={predictionResult.signal === 'buy' ? 'green' : predictionResult.signal === 'sell' ? 'red' : 'blue'}>{predictionResult.signal === 'buy' ? '买入' : predictionResult.signal === 'sell' ? '卖出' : '持有'}</Tag></div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[2, 2]} style={{ marginTop: '2px' }}>
          <Col xs={24} sm={8}><Card size="small" style={{ margin: '2px' }}><Statistic title="目标价格" value={predictionResult.targetPrice} precision={2} prefix={<RiseOutlined />} valueStyle={{ color: '#3f8600' }} /></Card></Col>
          <Col xs={24} sm={8}><Card size="small" style={{ margin: '2px' }}><Statistic title="支撑位" value={predictionResult.supportPrice} precision={2} valueStyle={{ color: '#1890ff' }} /></Card></Col>
          <Col xs={24} sm={8}><Card size="small" style={{ margin: '2px' }}><Statistic title="压力位" value={predictionResult.resistancePrice} precision={2} valueStyle={{ color: '#faad14' }} /></Card></Col>
        </Row>

        <Card size="small" style={{ margin: '2px' }} title="AI分析报告">
          <Alert message="预测时间周期" description={`未来 ${predictionResult.timeFrame} 的价格走势预测`} type="info" showIcon style={{ marginBottom: '12px' }} />
          <div><h4 style={{ marginBottom: '8px' }}>📊 技术指标分析：</h4>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>MA5：{technicalIndicators.ma5.toFixed(2)}元 {technicalIndicators.ma5 > technicalIndicators.ma10 ? '(向上趋势)' : '(向下趋势)'}</li>
              <li>MA10：{technicalIndicators.ma10.toFixed(2)}元</li>
              <li>MA20：{technicalIndicators.ma20.toFixed(2)}元</li>
              <li>RSI：{technicalIndicators.rsi.toFixed(1)} {technicalIndicators.rsi > 70 ? '(超买)' : technicalIndicators.rsi < 30 ? '(超卖)' : '(中性)'}</li>
              <li>MACD：{technicalIndicators.macd.toFixed(4)} {technicalIndicators.macd > technicalIndicators.macdSignal ? '(金叉)' : '(死叉)'}</li>
              <li>MACD柱状图：{technicalIndicators.macdHistogram > 0 ? '红柱' : '绿柱'}</li>
              <li>布林带上轨：{technicalIndicators.bollingerUpper.toFixed(2)}元</li>
              <li>布林带中轨：{technicalIndicators.bollingerMiddle.toFixed(2)}元</li>
              <li>布林带下轨：{technicalIndicators.bollingerLower.toFixed(2)}元</li>
            </ul>
          </div>
          <div style={{ marginTop: '12px' }}><h4 style={{ marginBottom: '8px' }}>💡 操作建议：</h4><Tag color={predictionResult.trend === 'up' ? 'green' : 'red'}>{predictionResult.trend === 'up' ? '建议买入/持有' : '建议卖出/观望'}</Tag><p style={{ marginTop: '8px', color: '#666', fontSize: '13px' }}>⚠️ 免责声明：以上预测仅供参考，不构成投资建议。股市有风险，投资需谨慎！</p></div>
        </Card>
      </div>
    )
  };

  const historyTab = {
    key: '2',
    label: <span><HistoryOutlined />历史预测</span>,
    children: (
      <div>
        <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="总预测次数" value={historyPredictions.length} prefix={<HistoryOutlined />} /></Card></Col>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="预测准确" value={historyPredictions.filter(p => p.accuracy).length} valueStyle={{ color: '#3f8600' }} /></Card></Col>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="预测错误" value={historyPredictions.filter(p => !p.accuracy).length} valueStyle={{ color: '#cf1322' }} /></Card></Col>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="准确率" value={(historyPredictions.filter(p => p.accuracy).length / historyPredictions.length * 100).toFixed(1)} suffix="%" valueStyle={{ color: '#1890ff' }} /></Card></Col>
        </Row>
        <List dataSource={historyPredictions} renderItem={(item) => (
          <List.Item>
            <Card size="small" style={{ width: '100%', margin: '2px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><Space><span style={{ fontWeight: 'bold' }}>{item.name}</span><span style={{ color: '#666' }}>{item.code}</span><Tag color="blue">{item.date}</Tag><Tag color={item.prediction === 'up' ? 'green' : 'red'}>{item.prediction === 'up' ? <RiseOutlined /> : <FallOutlined />}{item.prediction === 'up' ? '预测上涨' : '预测下跌'}</Tag><Tag color={item.actual === 'up' ? 'green' : 'red'}>{item.actual === 'up' ? <RiseOutlined /> : <FallOutlined />}{item.actual === 'up' ? '实际上涨' : '实际下跌'}</Tag></Space></div>
                <Tag color={item.accuracy ? 'green' : 'red'}>{item.accuracy ? '✓ 准确' : '✗ 错误'}</Tag>
              </div>
            </Card>
          </List.Item>
        )} />
      </div>
    )
  };

  return <div className="prediction-page"><Tabs defaultActiveKey="1" size="small" items={[predictionTab, historyTab]} /></div>;
};

export default Prediction;
