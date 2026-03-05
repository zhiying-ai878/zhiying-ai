import React, { useState } from 'react';
import { Card, Tabs, Row, Col, Statistic, Button, List, Tag, Space, Progress, Select, Switch, Form, InputNumber, message, Modal, Alert, Table } from 'antd';
import { RiseOutlined, RobotOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, BarChartOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons';

const { Option } = Select;

interface Strategy {
  id: string;
  name: string;
  type: 'trend' | 'mean' | 'momentum' | 'value';
  status: 'running' | 'stopped' | 'testing';
  winRate: number;
  totalReturn: number;
  maxDrawdown: number;
  trades: number;
  description: string;
}

const AIStrategy = () => {
  const [strategies] = useState<Strategy[]>([
    { id: '1', name: '趋势跟踪策略', type: 'trend', status: 'running', winRate: 68, totalReturn: 32.5, maxDrawdown: 12.3, trades: 156, description: '基于均线突破和MACD金叉的趋势跟踪策略，适合强势市场' },
    { id: '2', name: '均值回归策略', type: 'mean', status: 'stopped', winRate: 62, totalReturn: 18.2, maxDrawdown: 8.5, trades: 203, description: '基于布林带和RSI超买超卖的均值回归策略，适合震荡市场' },
    { id: '3', name: '动量策略', type: 'momentum', status: 'testing', winRate: 55, totalReturn: 25.8, maxDrawdown: 18.6, trades: 89, description: '基于价格动量和成交量放大的动量策略，捕捉短期爆发机会' }
  ]);

  const getTypeTag = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      trend: { color: 'blue', text: '趋势跟踪' },
      mean: { color: 'purple', text: '均值回归' },
      momentum: { color: 'orange', text: '动量策略' },
      value: { color: 'green', text: '价值投资' }
    };
    return typeMap[type] || typeMap.trend;
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      running: { color: 'green', text: '运行中', icon: <PlayCircleOutlined /> },
      stopped: { color: 'default', text: '已停止', icon: <PauseCircleOutlined /> },
      testing: { color: 'gold', text: '回测中', icon: <ReloadOutlined /> }
    };
    return statusMap[status] || statusMap.stopped;
  };

  const toggleStrategyStatus = (id: string) => {
    message.success('策略状态已更新');
  };

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
          return (
            <List.Item>
              <Card size="small" style={{ width: '100%', margin: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><span style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.name}</span><Tag color={typeTag.color}>{typeTag.text}</Tag><Tag color={statusTag.color} icon={statusTag.icon}>{statusTag.text}</Tag></div>
                    <Row gutter={[16, 8]} style={{ marginBottom: '8px' }}>
                      <Col xs={12} sm={6}><div><span style={{ color: '#666' }}>胜率：</span><Progress percent={item.winRate} size="small" style={{ width: '80px', display: 'inline-block', verticalAlign: 'middle' }} /></div></Col>
                      <Col xs={12} sm={6}><div><span style={{ color: '#666' }}>收益率：</span><span style={{ color: item.totalReturn >= 0 ? '#3f8600' : '#cf1322', fontWeight: 'bold' }}>{item.totalReturn >= 0 ? '+' : ''}{item.totalReturn}%</span></div></Col>
                      <Col xs={12} sm={6}><div><span style={{ color: '#666' }}>最大回撤：</span><span style={{ color: '#cf1322', fontWeight: 'bold' }}>-{item.maxDrawdown}%</span></div></Col>
                      <Col xs={12} sm={6}><div><span style={{ color: '#666' }}>交易次数：</span><span style={{ fontWeight: 'bold' }}>{item.trades}</span></div></Col>
                    </Row>
                    <div style={{ fontSize: '12px', color: '#666' }}>{item.description}</div>
                  </div>
                  <Space direction="vertical" style={{ marginLeft: '16px' }}><Button type={item.status === 'running' ? 'default' : 'primary'} size="small" icon={item.status === 'running' ? <PauseCircleOutlined /> : <PlayCircleOutlined />} onClick={() => toggleStrategyStatus(item.id)}>{item.status === 'running' ? '停止' : '启动'}</Button><Button size="small" icon={<BarChartOutlined />}>回测</Button></Space>
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
            <Col xs={24} sm={12}><Form.Item label="默认策略"><Select defaultValue="trend" style={{ width: '100%' }}><Option value="trend">趋势跟踪策略</Option><Option value="mean">均值回归策略</Option><Option value="momentum">动量策略</Option><Option value="value">价值投资策略</Option></Select></Form.Item></Col>
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
            <Col xs={24} sm={8}><Form.Item label="回测周期"><Select defaultValue="90" style={{ width: '100%' }}><Option value="30">最近30天</Option><Option value="90">最近90天</Option><Option value="180">最近180天</Option><Option value="365">最近1年</Option></Select></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item label="初始资金"><InputNumber min={10000} defaultValue={100000} addonAfter="元" style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item><Space><Button type="primary" icon={<PlayCircleOutlined />}>开始回测</Button><Button icon={<ReloadOutlined />}>重置参数</Button></Space></Form.Item>
        </Form>
      </Card>
    )
  };

  return <div className="ai-strategy-page"><Tabs defaultActiveKey="1" size="small" items={[strategyListTab, strategyConfigTab, backtestTab]} /></div>;
};

export default AIStrategy;
