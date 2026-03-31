import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Select, Button, Table, Tabs, Switch, message, Modal, Space, Badge, Row, Col, Statistic } from 'antd'
import { ShoppingCartOutlined, ShoppingOutlined, SyncOutlined, SaveOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons'
import './Trade.css'
import { getStockDataSource, TradingPlatformType } from '../../utils/stockData'
import { getStorageItem, setStorageItem } from '../../utils/storage'

const { Option } = Select

interface PortfolioItem {
  code: string;
  name: string;
  price: number;
  volume: number;
  totalAmount: number;
  currentPrice?: number;
  profit?: number;
  profitPercent?: number;
}

const Trade: React.FC = () => {
  // 从本地存储读取持仓数据
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(() => {
    const savedPortfolio = getStorageItem<PortfolioItem[]>('portfolio')
    return savedPortfolio || []
  })
  const [showAddPortfolioModal, setShowAddPortfolioModal] = useState(false)
  const [addPortfolioForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  
  // 初始化股票数据源
  const stockDataSource = getStockDataSource('eastmoney')
  
  // 处理股票代码变化，自动获取股票名称
  const handleStockCodeChange = async (value: string) => {
    if (value && value.length >= 6) {
      setLoading(true)
      try {
        const quote = await stockDataSource.getRealtimeQuote([value])
        if (quote && quote.length > 0) {
          addPortfolioForm.setFieldsValue({
            stockName: quote[0].name
          })
        }
      } catch (error) {
        console.error('获取股票名称失败:', error)
        message.error('获取股票名称失败，请手动输入')
      } finally {
        setLoading(false)
      }
    }
  }

  // 添加股票到持仓列表
  const addToPortfolio = (code: string, name: string, price: number, volume: number) => {
    const totalAmount = price * volume
    const existingItem = portfolio.find(item => item.code === code)
    
    if (existingItem) {
      // 更新已有持仓
      setPortfolio(prev => {
        const updatedPortfolio = prev.map(item => 
          item.code === code 
            ? { 
                ...item, 
                volume: item.volume + volume,
                totalAmount: item.totalAmount + totalAmount
              }
            : item
        )
        // 保存到本地存储
        setStorageItem('portfolio', updatedPortfolio)
        return updatedPortfolio
      })
      message.success(`${name}(${code})持仓已更新`)
    } else {
      // 添加新持仓
      setPortfolio(prev => {
        const updatedPortfolio = [...prev, {
          code,
          name,
          price,
          volume,
          totalAmount
        }]
        // 保存到本地存储
        setStorageItem('portfolio', updatedPortfolio)
        return updatedPortfolio
      })
      message.success(`${name}(${code})已添加到持仓列表，开始监控卖出信号`)
    }
  }

  // 手动添加持仓
  const handleManualAddPortfolio = (values: any) => {
    try {
      const price = parseFloat(values.price)
      const volume = parseInt(values.volume)
      if (isNaN(price) || isNaN(volume)) {
        message.error('请输入有效的价格和数量')
        return
      }
      addToPortfolio(values.stockCode, values.stockName, price, volume)
      setShowAddPortfolioModal(false)
      addPortfolioForm.resetFields()
    } catch (error) {
      console.error('添加持仓失败:', error)
      message.error('添加持仓失败，请重试')
    }
  }

  // 卖出持仓
  const handleSellPortfolio = (item: PortfolioItem) => {
    setPortfolio(prev => {
      const updatedPortfolio = prev.filter(p => p.code !== item.code)
      // 保存到本地存储
      setStorageItem('portfolio', updatedPortfolio)
      return updatedPortfolio
    })
    message.success(`${item.name}(${item.code})已从持仓列表移除`)
  }

  // 更新持仓价格
  const updatePortfolioPrices = async () => {
    const codes = portfolio.map(item => item.code)
    if (codes.length === 0) return
    
    try {
      const quotes = await stockDataSource.getRealtimeQuote(codes)
      setPortfolio(prev => prev.map(item => {
        const quote = quotes.find(q => q.code === item.code)
        if (quote) {
          const currentPrice = quote.price
          const profit = (currentPrice - item.price) * item.volume
          const profitPercent = ((currentPrice - item.price) / item.price) * 100
          return {
            ...item,
            currentPrice,
            profit,
            profitPercent
          }
        }
        return item
      }))
    } catch (error) {
      console.error('更新持仓价格失败:', error)
    }
  }

  // 定期更新持仓价格
  useEffect(() => {
    const timer = setInterval(() => {
      updatePortfolioPrices()
    }, 5000)
    
    return () => clearInterval(timer)
  }, [portfolio])

  // 持仓列表列定义
  const portfolioColumns = [
    { title: '股票代码', dataIndex: 'code', key: 'code' },
    { title: '股票名称', dataIndex: 'name', key: 'name' },
    { title: '持仓价格', dataIndex: 'price', key: 'price', render: (price: number) => price.toFixed(2) },
    { title: '当前价格', dataIndex: 'currentPrice', key: 'currentPrice', render: (price: number) => price ? price.toFixed(2) : '--' },
    { title: '持仓数量', dataIndex: 'volume', key: 'volume' },
    { title: '持仓金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (amount: number) => amount.toFixed(2) },
    { 
      title: '盈亏', 
      dataIndex: 'profit', 
      key: 'profit',
      render: (profit: number) => (
        <span style={{ color: profit >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
          {profit ? (profit >= 0 ? '+' : '') + profit.toFixed(2) : '--'}
        </span>
      )
    },
    { 
      title: '盈亏比例', 
      dataIndex: 'profitPercent', 
      key: 'profitPercent',
      render: (percent: number) => (
        <span style={{ color: percent >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
          {percent ? (percent >= 0 ? '+' : '') + percent.toFixed(2) + '%' : '--'}
        </span>
      )
    },
    { 
      title: '操作', 
      key: 'action',
      render: (_: any, record: PortfolioItem) => (
        <Button type="text" danger onClick={() => handleSellPortfolio(record)} size="small">
          移除
        </Button>
      )
    }
  ]

  return (
    <div className="trade" style={{ padding: '0' }}>
      <div className="trade-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>持仓管理</h2>
      </div>

      <Card size="small" style={{ margin: '2px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Button type="primary" size="small" onClick={() => setShowAddPortfolioModal(true)}>
            手动添加持仓
          </Button>
        </div>
        <Table 
          columns={portfolioColumns} 
          dataSource={portfolio} 
          rowKey="code" 
          pagination={{ pageSize: 10 }} 
          size="small"
          locale={{ emptyText: '暂无持仓，请添加已买入的股票' }}
        />
      </Card>

      {/* 手动添加持仓模态框 */}
      <Modal 
        title="手动添加持仓" 
        open={showAddPortfolioModal} 
        onCancel={() => setShowAddPortfolioModal(false)} 
        footer={[
          <Button key="cancel" onClick={() => setShowAddPortfolioModal(false)} size="small">取消</Button>
        ]} 
        width={500}
      >
        <Form 
          form={addPortfolioForm} 
          layout="vertical" 
          onFinish={handleManualAddPortfolio}
          initialValues={{
            stockCode: '',
            stockName: '',
            price: '',
            volume: ''
          }}
        >
          <Form.Item name="stockCode" label="股票代码" rules={[{ required: true, message: '请输入股票代码' }]}>
            <Input 
              placeholder="请输入股票代码" 
              size="small" 
              onChange={(e) => handleStockCodeChange(e.target.value)}
              disabled={loading}
            />
          </Form.Item>
          <Form.Item name="stockName" label="股票名称" rules={[{ required: true, message: '请输入股票名称' }]}>
            <Input placeholder="输入股票代码后自动填充" size="small" disabled={loading} />
          </Form.Item>
          <Form.Item name="price" label="持仓价格" rules={[{ required: true, message: '请输入持仓价格' }]}>
            <Input type="number" placeholder="请输入持仓价格" size="small" />
          </Form.Item>
          <Form.Item name="volume" label="持仓数量" rules={[{ required: true, message: '请输入持仓数量' }]}>
            <Input type="number" placeholder="请输入持仓数量" size="small" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button type="primary" htmlType="submit" size="small">添加持仓</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Trade
