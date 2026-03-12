import React, { useState, useEffect, useRef } from 'react';
import { Card, Tabs, List, Tag, Button, Space, Statistic, Row, Col, Progress, Switch, Form, Select, InputNumber, message, Alert, Badge, Modal } from 'antd';
import { NotificationOutlined, BellOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, SettingOutlined, FilterOutlined, ReloadOutlined, DeleteOutlined } from '@ant-design/icons';
import * as SignalManager from '../../utils/optimizedSignalManager';
import { getMainForceTracker, type MainForceData } from '../../utils/mainForceTracker';

const { getOptimizedSignalManager } = SignalManager;
type OptimizedSignal = SignalManager.OptimizedSignal;

const { Option } = Select;

interface SignalItem {
  id: string;
  time: string;
  code: string;
  name: string;
  type: 'buy' | 'sell' | 'hold';
  price: number;
  change: number;
  confidence: number;
  reason: string;
}

const Signal = () => {
  const [signals, setSignals] = useState<OptimizedSignal[]>([]);
  const [signalConfig, setSignalConfig] = useState({ buyEnabled: true, sellEnabled: true, holdEnabled: false, minConfidence: 60, scanInterval: 5 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  const signalManager = getOptimizedSignalManager();
  const signalTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadSignals();
    startSignalGeneration();
    
    return () => {
      if (signalTimerRef.current) {
        clearInterval(signalTimerRef.current);
      }
    };
  }, []);

  const loadSignals = () => {
    const history = signalManager.getSignalHistory();
    // 按时间戳降序排序，最新的信号排在前面
    const sortedHistory = history.sort((a, b) => b.timestamp - a.timestamp);
    setSignals(sortedHistory);
    const unread = sortedHistory.filter((s: OptimizedSignal) => !s.isRead).length;
    setUnreadCount(unread);
  };

  const startSignalGeneration = () => {
    generateMockSignals();
    signalTimerRef.current = setInterval(() => {
      generateMockSignals();
    }, 20000);
  };

  const generateMockSignals = () => {
    const stocks = [
      { code: '002594', name: '比亚迪', price: 185.6 },
      { code: '300750', name: '宁德时代', price: 210.8 },
      { code: '600519', name: '贵州茅台', price: 1856.0 },
      { code: '300402', name: '宝色股份', price: 24.76 },
      { code: '000001', name: '平安银行', price: 12.35 }
    ];

    const randomStock = stocks[Math.floor(Math.random() * stocks.length)];
    
    const mockMainForceData: MainForceData = {
      stockCode: randomStock.code,
      stockName: randomStock.name,
      currentPrice: randomStock.price,
      mainForceNetFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 500000000 + 50000000),
      totalNetFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 800000000 + 100000000),
      superLargeOrder: {
        netFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 300000000 + 20000000),
        volume: Math.random() * 500000000 + 100000000,
        amount: Math.random() * 500000000 + 100000000
      },
      largeOrder: {
        netFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 200000000 + 10000000),
        volume: Math.random() * 300000000 + 50000000,
        amount: Math.random() * 300000000 + 50000000
      },
      mediumOrder: {
        netFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 100000000 + 5000000),
        volume: Math.random() * 200000000 + 30000000,
        amount: Math.random() * 200000000 + 30000000
      },
      smallOrder: {
        netFlow: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 50000000 + 2000000),
        volume: Math.random() * 100000000 + 20000000,
        amount: Math.random() * 100000000 + 20000000
      },
      volumeAmplification: Math.random() * 4 + 0.5,
      turnoverRate: Math.random() * 15 + 1,
      timestamp: Date.now()
    };

    signalManager.processMainForceData(mockMainForceData);
    
    if (Math.random() > 0.6) {
      signalManager.processPredictionData(
        randomStock.code,
        randomStock.name,
        randomStock.price
      );
    }

    loadSignals();
  };

  const handleSignalAction = (signal: OptimizedSignal, action: 'execute' | 'ignore') => {
    signalManager.markSignalAsRead(signal.id);
    if (action === 'execute') {
      message.success(`已执行${signal.type === 'buy' ? '买入' : '卖出'}操作：${signal.stockName}`);
    } else {
      message.info('已忽略该信号');
    }
    setUnreadCount(prev => Math.max(0, prev - 1));
    loadSignals();
  };

  const getSignalTag = (type: string) => {
    const tagMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      buy: { color: 'green', text: '买入', icon: <CheckCircleOutlined /> },
      sell: { color: 'red', text: '卖出', icon: <CloseCircleOutlined /> },
      hold: { color: 'gold', text: '持有', icon: <ExclamationCircleOutlined /> }
    };
    return tagMap[type] || tagMap.hold;
  };

  // 添加删除历史信号的方法
  const handleClearHistory = () => {
    setModalVisible(true);
  };

  const confirmClearHistory = () => {
    signalManager.clearSignalHistory();
    setModalVisible(false);
    loadSignals();
    message.success('历史信号已清空');
  };

  const realtimeSignalsTab = {
    key: '1',
    label: <span><Badge count={unreadCount}><NotificationOutlined />实时信号</Badge></span>,
    children: (
      <div>
        <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="买入信号" value={signals.filter(s => s.type === 'buy').length} valueStyle={{ color: '#3f8600' }} prefix={<CheckCircleOutlined />} /></Card></Col>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="卖出信号" value={signals.filter(s => s.type === 'sell').length} valueStyle={{ color: '#cf1322' }} prefix={<CloseCircleOutlined />} /></Card></Col>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="未读信号" value={unreadCount} valueStyle={{ color: '#1890ff' }} prefix={<BellOutlined />} /></Card></Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ margin: '2px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={() => { setLoading(true); generateMockSignals(); setLoading(false); }}
                  loading={loading}
                  block
                >
                  刷新信号
                </Button>
                <Button 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={handleClearHistory}
                  block
                >
                  清空历史
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {signals.length === 0 ? (
          <Alert
            message="正在监控市场..."
            description="AI正在实时监控市场，一旦发现交易机会将立即发出信号。请稍候..."
            type="info"
            showIcon
          />
        ) : (
          <List 
            dataSource={signals} 
            renderItem={(item) => {
              const tagInfo = getSignalTag(item.type);
              return (
                <List.Item>
                  <Card size="small" style={{ width: '100%', margin: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.stockName}</span>
                          <span style={{ color: '#666' }}>{item.stockCode}</span>
                          <Tag color={tagInfo.color} icon={tagInfo.icon}>{tagInfo.text}</Tag>
                          {!item.isRead && <Tag color="blue">新</Tag>}
                          {item.isPredictiveSignal && <Tag color="purple">预测</Tag>}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          {item.price && <span>价格：<strong>{item.price.toFixed(2)}</strong></span>}
                          {item.targetPrice && <span>目标：<strong>{item.targetPrice.toFixed(2)}</strong></span>}
                          <span>置信度：</span><Progress percent={item.confidence} size="small" style={{ width: '80px' }} />
                          <span>评分：<strong>{item.score}</strong></span>
                          {item.mainForceFlow && (
                            <span>主力资金：<strong style={{ color: item.mainForceFlow >= 0 ? '#3f8600' : '#cf1322' }}>
                              {(item.mainForceFlow / 100000000).toFixed(2)}亿
                            </strong></span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          {item.reason}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          <ClockCircleOutlined /> {new Date(item.timestamp).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      {!item.isRead && (
                        <Space direction="vertical">
                          <Button 
                            type="primary" 
                            size="small"
                            onClick={() => handleSignalAction(item, 'execute')}
                          >
                            执行
                          </Button>
                          <Button 
                            size="small"
                            onClick={() => handleSignalAction(item, 'ignore')}
                          >
                            忽略
                          </Button>
                        </Space>
                      )}
                    </div>
                  </Card>
                </List.Item>
              );
            }} 
          />
        )}
      </div>
    )
  };

  const signalHistoryTab = {
    key: '2',
    label: <span><ClockCircleOutlined />信号历史</span>,
    children: (
      <Card style={{ margin: '2px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={handleClearHistory}
          >
            清空历史
          </Button>
        </div>
        {signals.length === 0 ? (
          <Alert
            message="暂无历史信号"
            description="信号历史将在收到新信号后自动记录。"
            type="info"
            showIcon
          />
        ) : (
          <List 
            dataSource={signals} 
            renderItem={(item) => {
              const tagInfo = getSignalTag(item.type);
              return (
                <List.Item>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <Space>
                        <Tag color={tagInfo.color}>{tagInfo.text}</Tag>
                        <span style={{ fontWeight: 'bold' }}>{item.stockName}</span>
                        <span style={{ color: '#666' }}>{item.stockCode}</span>
                        {item.isRead && <Tag color="default">已读</Tag>}
                        {item.isPredictiveSignal && <Tag color="purple">预测</Tag>}
                      </Space>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        <ClockCircleOutlined /> {new Date(item.timestamp).toLocaleString('zh-CN')} | {item.reason}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                        置信度: {item.confidence}% | 评分: {item.score}
                        {item.price && ` | 价格: ${item.price.toFixed(2)}`}
                        {item.targetPrice && ` | 目标: ${item.targetPrice.toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                </List.Item>
              );
            }} 
          />
        )}
      </Card>
    )
  };

  const signalConfigTab = {
    key: '3',
    label: <span><SettingOutlined />信号配置</span>,
    children: (
      <Card title="信号提醒设置" style={{ margin: '2px' }}>
        <Form layout="vertical" size="small">
          <Row gutter={[2, 2]}>
            <Col xs={24} sm={8}><Form.Item label="买入信号"><Switch checked={signalConfig.buyEnabled} checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked) => setSignalConfig(prev => ({ ...prev, buyEnabled: checked }))} /></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item label="卖出信号"><Switch checked={signalConfig.sellEnabled} checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked) => setSignalConfig(prev => ({ ...prev, sellEnabled: checked }))} /></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item label="持有信号"><Switch checked={signalConfig.holdEnabled} checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked) => setSignalConfig(prev => ({ ...prev, holdEnabled: checked }))} /></Form.Item></Col>
          </Row>
          <Row gutter={[2, 2]}>
            <Col xs={24} sm={12}><Form.Item label="最低置信度"><InputNumber min={50} max={95} value={signalConfig.minConfidence} addonAfter="%" style={{ width: '100%' }} onChange={(value) => setSignalConfig(prev => ({ ...prev, minConfidence: value || 60 }))} /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label="扫描间隔"><Select value={signalConfig.scanInterval} style={{ width: '100%' }} onChange={(value) => setSignalConfig(prev => ({ ...prev, scanInterval: value as number }))}><Option value={1}>1秒</Option><Option value={5}>5秒</Option><Option value={10}>10秒</Option><Option value={30}>30秒</Option><Option value={60}>1分钟</Option></Select></Form.Item></Col>
          </Row>
          <Form.Item><Space><Button type="primary" icon={<FilterOutlined />} onClick={() => message.success('配置已保存')}>应用配置</Button><Button onClick={() => setSignalConfig({ buyEnabled: true, sellEnabled: true, holdEnabled: false, minConfidence: 60, scanInterval: 5 })}>重置默认</Button></Space></Form.Item>
        </Form>
      </Card>
    )
  };

  return (
    <div className="signal-page">
      <Tabs defaultActiveKey="1" size="small" items={[realtimeSignalsTab, signalHistoryTab, signalConfigTab]} />
      <Modal
        title="确认清空历史"
        open={modalVisible}
        onOk={confirmClearHistory}
        onCancel={() => setModalVisible(false)}
      >
        <p>确定要清空所有历史信号吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
};

export default Signal;
