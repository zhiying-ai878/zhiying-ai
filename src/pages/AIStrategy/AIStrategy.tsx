import React, { useState, useCallback } from 'react';
import { Card, Tabs, Row, Col, Statistic, Button, List, Tag, Space, Progress, Select, Switch, Form, InputNumber, message, Modal, Alert, Table, Tooltip, Slider, Badge, Divider, Typography } from 'antd';
import { RiseOutlined, RobotOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, BarChartOutlined, HistoryOutlined, SettingOutlined, BankOutlined, WarningOutlined, DingdingOutlined, TagOutlined, AlertOutlined, RocketOutlined, ApiOutlined } from '@ant-design/icons';

const { Text } = Typography;

const { Option } = Select;

interface Strategy {
  id: string;
  name: string;
  type: 'trend' | 'mean' | 'momentum' | 'value' | 'ai_adaptive';
  status: 'running' | 'stopped' | 'testing' | 'optimizing';
  winRate: number;
  totalReturn: number;
  maxDrawdown: number;
  trades: number;
  description: string;
  aiScore: number;
  lastOptimized?: Date;
  riskLevel: 'low' | 'medium' | 'high';
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  alpha: number;
  beta: number;
  volatility: number;
  drawdownDuration: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  winLossRatio: number;
  recentPerformance: number[];
  marketCorrelation: number;
}

const AIStrategy = () => {
  const [strategies] = useState<Strategy[]>([
    {
      id: '1', 
      name: '趋势跟踪策略', 
      type: 'trend', 
      status: 'running', 
      winRate: 68, 
      totalReturn: 32.5, 
      maxDrawdown: 12.3, 
      trades: 156, 
      description: '基于均线突破和MACD金叉的趋势跟踪策略，适合强势市场', 
      aiScore: 75, 
      riskLevel: 'medium',
      sharpeRatio: 1.2, 
      sortinoRatio: 1.5, 
      calmarRatio: 2.6, 
      alpha: 0.08, 
      beta: 1.1, 
      volatility: 18.5, 
      drawdownDuration: 45, 
      avgWin: 4.2, 
      avgLoss: 2.1, 
      profitFactor: 1.8, 
      winLossRatio: 2.0, 
      recentPerformance: [2.5, 1.8, -0.5, 3.2, 1.5], 
      marketCorrelation: 0.75
    },
    {
      id: '2', 
      name: '均值回归策略', 
      type: 'mean', 
      status: 'stopped', 
      winRate: 62, 
      totalReturn: 18.2, 
      maxDrawdown: 8.5, 
      trades: 203, 
      description: '基于布林带和RSI超买超卖的均值回归策略，适合震荡市场', 
      aiScore: 70, 
      riskLevel: 'low',
      sharpeRatio: 1.0, 
      sortinoRatio: 1.2, 
      calmarRatio: 2.1, 
      alpha: 0.05, 
      beta: 0.8, 
      volatility: 12.3, 
      drawdownDuration: 30, 
      avgWin: 2.8, 
      avgLoss: 1.9, 
      profitFactor: 1.5, 
      winLossRatio: 1.5, 
      recentPerformance: [1.2, -0.8, 1.5, 0.9, 1.1], 
      marketCorrelation: 0.6
    },
    {
      id: '3', 
      name: '动量策略', 
      type: 'momentum', 
      status: 'testing', 
      winRate: 55, 
      totalReturn: 25.8, 
      maxDrawdown: 18.6, 
      trades: 89, 
      description: '基于价格动量和成交量放大的动量策略，捕捉短期爆发机会', 
      aiScore: 65, 
      riskLevel: 'high',
      sharpeRatio: 0.9, 
      sortinoRatio: 1.1, 
      calmarRatio: 1.4, 
      alpha: 0.1, 
      beta: 1.3, 
      volatility: 25.6, 
      drawdownDuration: 60, 
      avgWin: 6.5, 
      avgLoss: 3.2, 
      profitFactor: 1.3, 
      winLossRatio: 2.0, 
      recentPerformance: [4.2, -2.1, 3.5, -1.8, 5.2], 
      marketCorrelation: 0.85
    },
    {
      id: '4', 
      name: 'AI自适应策略', 
      type: 'ai_adaptive', 
      status: 'running', 
      winRate: 72, 
      totalReturn: 41.2, 
      maxDrawdown: 10.8, 
      trades: 124, 
      description: '基于机器学习的自适应策略，自动调整参数以适应市场变化', 
      aiScore: 90, 
      lastOptimized: new Date(), 
      riskLevel: 'medium',
      sharpeRatio: 1.5, 
      sortinoRatio: 1.8, 
      calmarRatio: 3.8, 
      alpha: 0.12, 
      beta: 0.9, 
      volatility: 15.2, 
      drawdownDuration: 35, 
      avgWin: 4.8, 
      avgLoss: 2.0, 
      profitFactor: 2.1, 
      winLossRatio: 2.4, 
      recentPerformance: [3.1, 2.5, 1.8, 2.9, 3.5], 
      marketCorrelation: 0.7
    }
  ]);
  
  const [optimizingId, setOptimizingId] = useState<string | null>(null);
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      trend: { color: 'blue', text: '趋势跟踪', icon: <WarningOutlined /> },
      mean: { color: 'purple', text: '均值回归', icon: <DingdingOutlined /> },
      momentum: { color: 'orange', text: '动量策略', icon: <RocketOutlined /> },
      value: { color: 'green', text: '价值投资', icon: <TagOutlined /> },
      ai_adaptive: { color: 'cyan', text: 'AI自适应', icon: <BankOutlined /> }
    };
    return typeMap[type] || typeMap.trend;
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      running: { color: 'green', text: '运行中', icon: <PlayCircleOutlined /> },
      stopped: { color: 'default', text: '已停止', icon: <PauseCircleOutlined /> },
      testing: { color: 'gold', text: '回测中', icon: <ReloadOutlined /> },
      optimizing: { color: 'blue', text: '优化中', icon: <ApiOutlined /> }
    };
    return statusMap[status] || statusMap.stopped;
  };

  const getRiskTag = (riskLevel: string) => {
    const riskMap: Record<string, { color: string; text: string }> = {
      low: { color: 'green', text: '低风险' },
      medium: { color: 'orange', text: '中风险' },
      high: { color: 'red', text: '高风险' }
    };
    return riskMap[riskLevel] || riskMap.medium;
  };

  const toggleStrategyStatus = (id: string) => {
    message.success('策略状态已更新');
  };

  const handleOptimizeStrategy = useCallback((strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setOptimizingId(strategy.id);
    setShowOptimizationModal(true);
    
    // 模拟优化过程
    setTimeout(() => {
      setOptimizingId(null);
      message.success(`策略 ${strategy.name} 优化完成！`);
    }, 3000);
  }, []);

  const strategyListTab = {
    key: '1',
    label: <span><RobotOutlined />策略列表</span>,
    children: (
      <div>
        <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="运行中策略" value={strategies.filter(s => s.status === 'running').length} valueStyle={{ color: '#3f8600' }} prefix={<PlayCircleOutlined />} /></Card></Col>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="总策略数" value={strategies.length} prefix={<RobotOutlined />} /></Card></Col>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="平均胜率" value={(strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length).toFixed(1)} suffix="%" valueStyle={{ color: '#1890ff' }} /></Card></Col>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="总收益率" value={strategies.reduce((sum, s) => sum + s.totalReturn, 0).toFixed(1)} suffix="%" valueStyle={{ color: '#faad14' }} /></Card></Col>
        </Row>
        <List dataSource={strategies} renderItem={(item) => {
          const typeTag = getTypeTag(item.type);
          const statusTag = getStatusTag(item.status);
          const riskTag = getRiskTag(item.riskLevel);
          return (
            <List.Item>
              <Card size="small" style={{ width: '100%', margin: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.name}</span>
                      <Tag color={typeTag.color} icon={typeTag.icon}>{typeTag.text}</Tag>
                      <Tag color={statusTag.color} icon={statusTag.icon}>{statusTag.text}</Tag>
                      <Tag color={riskTag.color}>{riskTag.text}</Tag>
                      <Badge count={item.aiScore} showZero color={item.aiScore >= 80 ? 'green' : item.aiScore >= 60 ? 'blue' : 'orange'}>
                        <Tooltip title="AI评分">
                          <span style={{ cursor: 'pointer' }}><BankOutlined /></span>
                        </Tooltip>
                      </Badge>
                    </div>
                    <Row gutter={[16, 8]} style={{ marginBottom: '8px' }}>
                      <Col xs={12} sm={6}><div><span style={{ color: '#666' }}>胜率：</span><Progress percent={item.winRate} size="small" style={{ width: '80px', display: 'inline-block', verticalAlign: 'middle' }} /></div></Col>
                      <Col xs={12} sm={6}><div><span style={{ color: '#666' }}>收益率：</span><span style={{ color: item.totalReturn >= 0 ? '#3f8600' : '#cf1322', fontWeight: 'bold' }}>{item.totalReturn >= 0 ? '+' : ''}{item.totalReturn}%</span></div></Col>
                      <Col xs={12} sm={6}><div><span style={{ color: '#666' }}>最大回撤：</span><span style={{ color: '#cf1322', fontWeight: 'bold' }}>-{item.maxDrawdown}%</span></div></Col>
                      <Col xs={12} sm={6}><div><span style={{ color: '#666' }}>交易次数：</span><span style={{ fontWeight: 'bold' }}>{item.trades}</span></div></Col>
                    </Row>
                    <Row gutter={[16, 8]} style={{ marginBottom: '8px' }}>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>夏普比率：</span><span style={{ fontWeight: 'bold' }}>{item.sharpeRatio.toFixed(2)}</span></div></Col>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>索提诺比率：</span><span style={{ fontWeight: 'bold' }}>{item.sortinoRatio.toFixed(2)}</span></div></Col>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>卡玛比率：</span><span style={{ fontWeight: 'bold' }}>{item.calmarRatio.toFixed(2)}</span></div></Col>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>阿尔法：</span><span style={{ fontWeight: 'bold' }}>{(item.alpha * 100).toFixed(2)}%</span></div></Col>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>贝塔：</span><span style={{ fontWeight: 'bold' }}>{item.beta.toFixed(2)}</span></div></Col>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>波动率：</span><span style={{ fontWeight: 'bold' }}>{item.volatility.toFixed(2)}%</span></div></Col>
                    </Row>
                    <Row gutter={[16, 8]} style={{ marginBottom: '8px' }}>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>平均盈利：</span><span style={{ color: '#3f8600', fontWeight: 'bold' }}>+{item.avgWin.toFixed(2)}%</span></div></Col>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>平均亏损：</span><span style={{ color: '#cf1322', fontWeight: 'bold' }}>-{item.avgLoss.toFixed(2)}%</span></div></Col>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>盈利因子：</span><span style={{ fontWeight: 'bold' }}>{item.profitFactor.toFixed(2)}</span></div></Col>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>盈亏比：</span><span style={{ fontWeight: 'bold' }}>{item.winLossRatio.toFixed(2)}</span></div></Col>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>回撤时长：</span><span style={{ fontWeight: 'bold' }}>{item.drawdownDuration}天</span></div></Col>
                      <Col xs={12} sm={4}><div><span style={{ color: '#666' }}>市场相关性：</span><span style={{ fontWeight: 'bold' }}>{(item.marketCorrelation * 100).toFixed(0)}%</span></div></Col>
                    </Row>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{item.description}</div>
                    <div style={{ marginBottom: '8px' }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>近期表现：</Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        {item.recentPerformance.map((value, index) => (
                          <div key={index} style={{ width: '20px', height: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', fontWeight: 'bold', color: value >= 0 ? '#3f8600' : '#cf1322', backgroundColor: value >= 0 ? '#f6ffed' : '#fff1f0', borderRadius: '2px' }}>
                            {value >= 0 ? '+' : ''}{value.toFixed(1)}
                          </div>
                        ))}
                      </div>
                    </div>
                    {item.lastOptimized && (
                      <div style={{ fontSize: '11px', color: '#999' }}>最近优化：{item.lastOptimized.toLocaleString()}</div>
                    )}
                  </div>
                  <Space direction="vertical" style={{ marginLeft: '16px' }}>
                    <Button type={item.status === 'running' ? 'default' : 'primary'} size="small" icon={item.status === 'running' ? <PauseCircleOutlined /> : <PlayCircleOutlined />} onClick={() => toggleStrategyStatus(item.id)}>{item.status === 'running' ? '停止' : '启动'}</Button>
                    <Button size="small" icon={<BarChartOutlined />}>回测</Button>
                    <Button size="small" icon={<ApiOutlined />} onClick={() => handleOptimizeStrategy(item)} loading={optimizingId === item.id}>{optimizingId === item.id ? '优化中' : 'AI优化'}</Button>
                  </Space>
                </div>
              </Card>
            </List.Item>
          );
        }} />
      </div>
    )
  };

  const strategyConfigTab = {
    key: '2',
    label: <span><SettingOutlined />策略配置</span>,
    children: (
      <Card title="AI策略配置" style={{ margin: '2px' }}>
        <Form layout="vertical" size="small">
          <Row gutter={[2, 2]}>
            <Col xs={24} sm={12}><Form.Item label="默认策略"><Select defaultValue="trend" style={{ width: '100%' }}><Option value="trend">趋势跟踪策略</Option><Option value="mean">均值回归策略</Option><Option value="momentum">动量策略</Option><Option value="value">价值投资策略</Option><Option value="ai_adaptive">AI自适应策略</Option></Select></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label="风险等级"><Select defaultValue="medium" style={{ width: '100%' }}><Option value="low">低风险</Option><Option value="medium">中风险</Option><Option value="high">高风险</Option></Select></Form.Item></Col>
          </Row>
          <Row gutter={[2, 2]}>
            <Col xs={24} sm={12}><Form.Item label="单股最大仓位"><InputNumber min={5} max={50} defaultValue={20} addonAfter="%" style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label="止损比例"><InputNumber min={1} max={20} defaultValue={8} addonAfter="%" style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={[2, 2]}>
            <Col xs={24} sm={12}><Form.Item label="自动调仓" valuePropName="checked"><Switch checkedChildren="开启" unCheckedChildren="关闭" /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label="AI优化" valuePropName="checked"><Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked /></Form.Item></Col>
          </Row>
          <Divider style={{ margin: '16px 0' }} />
          <h4 style={{ margin: '0 0 12px 0' }}>AI策略参数</h4>
          <Row gutter={[2, 2]}>
            <Col xs={24}><Form.Item label="AI学习频率"><Select defaultValue="daily" style={{ width: '100%' }}><Option value="hourly">每小时</Option><Option value="daily">每天</Option><Option value="weekly">每周</Option></Select></Form.Item></Col>
          </Row>
          <Row gutter={[2, 2]}>
            <Col xs={24}><Form.Item label="模型复杂度"><Slider min={1} max={10} defaultValue={5} marks={{ 1: '简单', 5: '中等', 10: '复杂' }} /></Form.Item></Col>
          </Row>
          <Row gutter={[2, 2]}>
            <Col xs={24}><Form.Item label="预测周期"><Select defaultValue="short" style={{ width: '100%' }}><Option value="short">短期 (1-3天)</Option><Option value="medium">中期 (1-2周)</Option><Option value="long">长期 (1-3月)</Option></Select></Form.Item></Col>
          </Row>
          <Form.Item><Space><Button type="primary">保存配置</Button><Button>重置默认</Button></Space></Form.Item>
        </Form>
      </Card>
    )
  };

  const backtestTab = {
    key: '3',
    label: <span><HistoryOutlined />策略回测</span>,
    children: (
      <Card title="策略回测" style={{ margin: '2px' }}>
        <Alert message="回测说明" description="选择回测周期和参数，系统将基于历史数据模拟策略表现。回测结果仅供参考，不代表未来收益。" type="info" showIcon style={{ marginBottom: '2px' }} />
        <Form layout="vertical" size="small">
          <Row gutter={[2, 2]}>
            <Col xs={24} sm={8}><Form.Item label="选择策略"><Select placeholder="请选择策略" style={{ width: '100%' }}>{strategies.map(s => (<Option key={s.id} value={s.id}>{s.name}</Option>))}</Select></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item label="回测周期"><Select defaultValue="90" style={{ width: '100%' }}><Option value="30">最近30天</Option><Option value="90">最近90天</Option><Option value="180">最近180天</Option><Option value="365">最近1年</Option><Option value="730">最近2年</Option></Select></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item label="初始资金"><InputNumber min={10000} defaultValue={100000} addonAfter="元" style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={[2, 2]}>
            <Col xs={24} sm={8}><Form.Item label="回测类型"><Select defaultValue="normal" style={{ width: '100%' }}><Option value="normal">普通回测</Option><Option value="monte_carlo">蒙特卡洛模拟</Option><Option value="walk_forward">滚动回测</Option></Select></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item label="交易成本"><InputNumber min={0} max={1} defaultValue={0.001} addonAfter="%" style={{ width: '100%' }} /></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item label="AI优化回测" valuePropName="checked"><Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked /></Form.Item></Col>
          </Row>
          <Form.Item><Space><Button type="primary" icon={<PlayCircleOutlined />}>开始回测</Button><Button icon={<ReloadOutlined />}>重置参数</Button></Space></Form.Item>
        </Form>
      </Card>
    )
  };

  // 策略优化模态框
  const optimizationModal = (
    <Modal
      title="AI策略优化"
      open={showOptimizationModal}
      onCancel={() => setShowOptimizationModal(false)}
      footer={[
        <Button key="cancel" onClick={() => setShowOptimizationModal(false)}>取消</Button>,
        <Button key="confirm" type="primary" onClick={() => setShowOptimizationModal(false)}>确定</Button>
      ]}
    >
      {selectedStrategy && (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3>{selectedStrategy.name}</h3>
            <p style={{ color: '#666' }}>{selectedStrategy.description}</p>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <h4>优化参数</h4>
            <Form layout="vertical" size="small">
              <Row gutter={[2, 2]}>
                <Col xs={24}><Form.Item label="优化目标"><Select defaultValue="return" style={{ width: '100%' }}><Option value="return">最大化收益率</Option><Option value="sharpe">最大化夏普比率</Option><Option value="win_rate">最大化胜率</Option><Option value="drawdown">最小化最大回撤</Option></Select></Form.Item></Col>
              </Row>
              <Row gutter={[2, 2]}>
                <Col xs={24}><Form.Item label="优化算法"><Select defaultValue="genetic" style={{ width: '100%' }}><Option value="genetic">遗传算法</Option><Option value="grid">网格搜索</Option><Option value="bayesian">贝叶斯优化</Option></Select></Form.Item></Col>
              </Row>
              <Row gutter={[2, 2]}>
                <Col xs={24}><Form.Item label="优化迭代次数"><InputNumber min={10} max={1000} defaultValue={100} style={{ width: '100%' }} /></Form.Item></Col>
              </Row>
            </Form>
          </div>
          {optimizingId === selectedStrategy.id && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Alert message="AI正在优化策略参数..." type="info" showIcon />
              <div style={{ marginTop: '20px' }}>
                <Progress percent={65} status="active" />
                <p style={{ marginTop: '8px', color: '#666' }}>预计完成时间：30秒</p>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );

  return (
    <div className="ai-strategy-page">
      <Tabs defaultActiveKey="1" size="small" items={[strategyListTab, strategyConfigTab, backtestTab]} />
      {optimizationModal}
    </div>
  );
};

export default AIStrategy;
