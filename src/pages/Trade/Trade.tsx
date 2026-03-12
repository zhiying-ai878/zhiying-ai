import React, { useState } from 'react'
import { Card, Form, Input, Select, Button, Table, Tabs, Switch, message, Modal, Space, Badge, Row, Col, Statistic } from 'antd'
import { ShoppingCartOutlined, ShoppingOutlined, SyncOutlined, SaveOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import './Trade.css'

const { Option } = Select

const Trade: React.FC = () => {
  const [form] = Form.useForm()
  const [tradeType, setTradeType] = useState('buy')
  const [autoTrade, setAutoTrade] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTrade, setSelectedTrade] = useState<any>(null)
  const [showTradeDetail, setShowTradeDetail] = useState(false)

  const [tradeHistory] = useState([
    { key: '1', time: '2026-02-25 14:30:25', code: '000001', name: '平安银行', type: 'buy', price: 17.50, volume: 1000, amount: 17500 },
    { key: '2', time: '2026-02-25 10:15:42', code: '600519', name: '贵州茅台', type: 'sell', price: 1850.00, volume: 10, amount: 18500 },
    { key: '3', time: '2026-02-24 15:00:00', code: '000858', name: '五粮液', type: 'buy', price: 165.20, volume: 200, amount: 33040 },
  ])

  const [aiStrategies] = useState([
    { key: '1', name: '趋势跟踪策略', status: 'running', profit: 12.5 },
    { key: '2', name: '均值回归策略', status: 'stopped', profit: -2.3 },
    { key: '3', name: '动量策略', status: 'running', profit: 8.7 },
  ])

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      message.success(`${tradeType === 'buy' ? '买入' : '卖出'}成功！`)
      form.resetFields()
    } catch (error) {
      message.error('交易失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleAutoTradeChange = (checked: boolean) => {
    setAutoTrade(checked)
    message.info(checked ? 'AI自动交易已开启' : 'AI自动交易已关闭')
  }

  const tradeColumns: any = [
    { title: '时间', dataIndex: 'time', key: 'time' },
    { title: '代码', dataIndex: 'code', key: 'code' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (type: string) => (
        <span style={{ color: type === 'buy' ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
          {type === 'buy' ? '买入' : '卖出'}
        </span>
      )
    },
    { title: '价格', dataIndex: 'price', key: 'price', render: (price: number) => price.toFixed(2) },
    { title: '数量', dataIndex: 'volume', key: 'volume' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (amount: number) => amount.toFixed(2) },
    { 
      title: '操作', 
      key: 'action',
      render: (_: any, record: any) => (
        <Button type="text" icon={<EyeOutlined />} onClick={() => { setSelectedTrade(record); setShowTradeDetail(true) }} size="small">
          详情
        </Button>
      )
    }
  ]

  const strategyColumns = [
    { title: '策略名称', dataIndex: 'name', key: 'name' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status: string) => (
        <Badge status={status === 'running' ? 'success' : 'default'} text={status === 'running' ? '运行中' : '已停止'} />
      )
    },
    { 
      title: '收益率', 
      dataIndex: 'profit', 
      key: 'profit',
      render: (profit: number) => (
        <span style={{ color: profit >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
          {profit >= 0 ? '+' : ''}{profit.toFixed(1)}%
        </span>
      )
    },
    { 
      title: '操作', 
      key: 'action',
      render: (_: any, record: any) => (
        <Button type={record.status === 'running' ? 'default' : 'primary'} size="small">
          {record.status === 'running' ? '停止' : '启动'}
        </Button>
      )
    }
  ]

  const tradeHistoryTab = {
    key: '1',
    label: '交易历史',
    children: (
      <Card size="small" style={{ margin: '2px' }}>
        <Space size="small" style={{ marginBottom: '2px' }}>
          <Input placeholder="搜索股票代码或名称" prefix={<SearchOutlined />} style={{ width: 200 }} size="small" />
          <Select defaultValue="all" style={{ width: 100 }} size="small" options={[{ value: 'all', label: '全部类型' }, { value: 'buy', label: '买入' }, { value: 'sell', label: '卖出' }]} />
          <Button type="default" icon={<SyncOutlined />} size="small" onClick={() => message.info('刷新成功')}>刷新</Button>
        </Space>
        <Table columns={tradeColumns} dataSource={tradeHistory} pagination={{ pageSize: 10, size: 'small' }} rowKey="key" size="small" />
      </Card>
    )
  }

  const aiStrategyTab = {
    key: '2',
    label: 'AI策略',
    children: (
      <Card size="small" style={{ margin: '2px' }}>
        <Table columns={strategyColumns} dataSource={aiStrategies} pagination={false} rowKey="key" size="small" />
        <div style={{ marginTop: '2px', display: 'flex', gap: '8px' }}>
          <Button type="primary" icon={<SyncOutlined />} size="small" onClick={() => message.info('策略同步成功')}>同步策略</Button>
          <Button size="small" onClick={() => message.info('添加策略功能开发中')}>添加策略</Button>
        </div>
      </Card>
    )
  }

  const tradeSettingsTab = {
    key: '3',
    label: '交易设置',
    children: (
      <Card size="small" style={{ margin: '2px' }}>
        <Form layout="vertical" size="small">
          <Row gutter={[2, 2]}>
            <Col xs={24} sm={12}><Form.Item label="每笔最大交易金额"><Input type="number" placeholder="请输入每笔最大交易金额" size="small" /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label="止损比例"><Input type="number" placeholder="请输入止损比例(%)" size="small" /></Form.Item></Col>
          </Row>
          <Row gutter={[2, 2]}>
            <Col xs={24} sm={12}><Form.Item label="止盈比例"><Input type="number" placeholder="请输入止盈比例(%)" size="small" /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label="交易频率"><Select size="small" placeholder="请选择交易频率"><Option value="high">高频交易</Option><Option value="medium">中频交易</Option><Option value="low">低频交易</Option></Select></Form.Item></Col>
          </Row>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space><Button type="primary" size="small" icon={<SaveOutlined />}>保存设置</Button><Button size="small" icon={<SyncOutlined />}>加载设置</Button></Space>
          </Form.Item>
        </Form>
      </Card>
    )
  }

  return (
    <div className="trade" style={{ padding: '0' }}>
      <div className="trade-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>交易管理</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>AI自动交易</span>
          <Switch checked={autoTrade} onChange={handleAutoTradeChange} checkedChildren="开启" unCheckedChildren="关闭" />
        </div>
      </div>

      <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
        <Col xs={24} lg={8}>
          <Card size="small" style={{ margin: '2px' }}>
            <Form form={form} onFinish={onFinish} layout="vertical">
              <div style={{ display: 'flex', gap: '8px', marginBottom: '2px' }}>
                <Button type={tradeType === 'buy' ? 'primary' : 'default'} icon={<ShoppingCartOutlined />} onClick={() => setTradeType('buy')} block>买入</Button>
                <Button type={tradeType === 'sell' ? 'primary' : 'default'} icon={<ShoppingOutlined />} onClick={() => setTradeType('sell')} block>卖出</Button>
              </div>
              <Form.Item name="stockCode" label="股票代码" rules={[{ required: true, message: '请输入股票代码' }]}><Input placeholder="请输入股票代码" size="small" /></Form.Item>
              <Form.Item name="stockName" label="股票名称"><Input placeholder="请输入股票名称" size="small" /></Form.Item>
              <Form.Item name="price" label="交易价格" rules={[{ required: true, message: '请输入交易价格' }]}><Input type="number" placeholder="请输入交易价格" size="small" /></Form.Item>
              <Form.Item name="volume" label="交易数量" rules={[{ required: true, message: '请输入交易数量' }]}><Input type="number" placeholder="请输入交易数量" size="small" /></Form.Item>
              <Form.Item style={{ marginBottom: 0 }}><Button type="primary" htmlType="submit" block size="small" loading={loading}>{tradeType === 'buy' ? '买入' : '卖出'}</Button></Form.Item>
            </Form>
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card size="small" title="交易统计" style={{ margin: '2px' }}>
            <Row gutter={[2, 2]}>
              <Col xs={12} sm={6}><Statistic title="今日交易" value={12} valueStyle={{ color: '#1890ff', fontSize: '20px' }} /></Col>
              <Col xs={12} sm={6}><Statistic title="盈利次数" value={8} valueStyle={{ color: '#ff4d4f', fontSize: '20px' }} /></Col>
              <Col xs={12} sm={6}><Statistic title="亏损次数" value={4} valueStyle={{ color: '#52c41a', fontSize: '20px' }} /></Col>
              <Col xs={12} sm={6}><Statistic title="盈亏比" value={2.5} suffix=":1" valueStyle={{ color: '#722ed1', fontSize: '20px' }} /></Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="1" size="small" items={[tradeHistoryTab, aiStrategyTab, tradeSettingsTab]} />

      <Modal title="交易详情" open={showTradeDetail} onCancel={() => setShowTradeDetail(false)} footer={[<Button key="close" onClick={() => setShowTradeDetail(false)} size="small">关闭</Button>]} width={500}>
        {selectedTrade && (
          <div>
            <Row gutter={[2, 2]}>
              <Col span={12}>
                <p><strong>交易时间:</strong> {selectedTrade.time}</p>
                <p><strong>股票代码:</strong> {selectedTrade.code}</p>
                <p><strong>股票名称:</strong> {selectedTrade.name}</p>
                <p><strong>交易类型:</strong> <Badge status={selectedTrade.type === 'buy' ? 'success' : 'error'} text={selectedTrade.type === 'buy' ? '买入' : '卖出'} /></p>
              </Col>
              <Col span={12}>
                <p><strong>交易价格:</strong> ¥{selectedTrade.price.toFixed(2)}</p>
                <p><strong>交易数量:</strong> {selectedTrade.volume}股</p>
                <p><strong>交易金额:</strong> ¥{selectedTrade.amount.toFixed(2)}</p>
                <p><strong>交易状态:</strong> <Badge status="success" text="已完成" /></p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Trade
