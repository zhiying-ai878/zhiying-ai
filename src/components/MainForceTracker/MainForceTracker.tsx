import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, Row, Col, Table, Statistic, Tag, Progress, Button, Space, message, Select, Tooltip, Tabs, DatePicker, List, Badge, Empty, Modal } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, SyncOutlined, BarChartOutlined, LineChartOutlined, ClockCircleOutlined, AreaChartOutlined, FilterOutlined, HistoryOutlined, AlertOutlined, DownloadOutlined } from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import type { Dayjs } from 'dayjs'
import { getMainForceTracker, type AlertEvent } from '../../utils/mainForceTracker'

const { Option } = Select
const { RangePicker } = DatePicker

interface MainForceData {
  code: string
  name: string
  superLarge: { inflow: number; outflow: number; net: number }
  large: { inflow: number; outflow: number; net: number }
  medium: { inflow: number; outflow: number; net: number }
  small: { inflow: number; outflow: number; net: number }
  totalNet: number
  trend: 'up' | 'down' | 'neutral'
  lastUpdate: string
  timestamp: number
}

interface HistoricalDataPoint {
  date: string
  superLargeNet: number
  largeNet: number
  mediumNet: number
  smallNet: number
  totalNet: number
}

const MainForceTrackerComponent: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState('000001')
  const [mainForceDataList, setMainForceDataList] = useState<MainForceData[]>([])
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([])
  const [alerts, setAlerts] = useState<AlertEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [activeTab, setActiveTab] = useState('realtime')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null])
  const [showSectorData, setShowSectorData] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const tracker = getMainForceTracker()

  useEffect(() => {
    loadMainForceData()
    loadHistoricalData()
    loadAlerts()
  }, [])

  useEffect(() => {
    if (autoUpdate) {
      intervalRef.current = setInterval(() => {
        updateMainForceData()
      }, 5000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoUpdate])

  const formatMoney = (amount: number): string => {
    if (amount >= 100000000) {
      return (amount / 100000000).toFixed(2) + '亿'
    } else if (amount >= 10000) {
      return (amount / 10000).toFixed(2) + '万'
    }
    return amount.toLocaleString()
  }

  const calculatePercent = (inflow: number, outflow: number): number => {
    const total = inflow + outflow
    if (total === 0) return 0
    return Math.min(100, (inflow / total) * 100)
  }

  const generateSampleData = (): MainForceData[] => {
    const stocks = [
      { code: '000001', name: '平安银行' },
      { code: '600519', name: '贵州茅台' },
      { code: '000858', name: '五粮液' },
      { code: '601318', name: '中国平安' },
      { code: '000333', name: '美的集团' }
    ]

    return stocks.map(stock => {
      const superLargeInflow = 280000000 + (Math.random() - 0.5) * 100000000
      const superLargeOutflow = 150000000 + (Math.random() - 0.5) * 80000000
      const largeInflow = 320000000 + (Math.random() - 0.5) * 120000000
      const largeOutflow = 280000000 + (Math.random() - 0.5) * 100000000
      const mediumInflow = 180000000 + (Math.random() - 0.5) * 80000000
      const mediumOutflow = 200000000 + (Math.random() - 0.5) * 70000000
      const smallInflow = 120000000 + (Math.random() - 0.5) * 60000000
      const smallOutflow = 150000000 + (Math.random() - 0.5) * 50000000

      const superLargeNet = superLargeInflow - superLargeOutflow
      const largeNet = largeInflow - largeOutflow
      const mediumNet = mediumInflow - mediumOutflow
      const smallNet = smallInflow - smallOutflow
      const totalNet = superLargeNet + largeNet + mediumNet + smallNet

      let trend: 'up' | 'down' | 'neutral' = 'neutral'
      if (totalNet > 50000000) {
        trend = 'up'
      } else if (totalNet < -50000000) {
        trend = 'down'
      }

      return {
        code: stock.code,
        name: stock.name,
        superLarge: { inflow: superLargeInflow, outflow: superLargeOutflow, net: superLargeNet },
        large: { inflow: largeInflow, outflow: largeOutflow, net: largeNet },
        medium: { inflow: mediumInflow, outflow: mediumOutflow, net: mediumNet },
        small: { inflow: smallInflow, outflow: smallOutflow, net: smallNet },
        totalNet,
        trend,
        lastUpdate: new Date().toLocaleTimeString('zh-CN'),
        timestamp: Date.now()
      }
    })
  }

  const generateHistoricalData = (): HistoricalDataPoint[] => {
    const data: HistoricalDataPoint[] = []
    const now = new Date()
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString('zh-CN'),
        superLargeNet: (Math.random() - 0.5) * 200000000,
        largeNet: (Math.random() - 0.5) * 150000000,
        mediumNet: (Math.random() - 0.5) * 100000000,
        smallNet: (Math.random() - 0.5) * 80000000,
        totalNet: (Math.random() - 0.5) * 530000000
      })
    }
    return data
  }

  const loadMainForceData = () => {
    setLoading(true)
    setTimeout(() => {
      const sampleData = generateSampleData()
      setMainForceDataList(sampleData)
      setLastUpdateTime(new Date())
      setLoading(false)
      message.success('数据加载成功')
    }, 500)
  }

  const loadHistoricalData = () => {
    const data = generateHistoricalData()
    setHistoricalData(data)
  }

  const loadAlerts = () => {
    setAlerts(tracker.getAlertHistory().slice(0, 20))
  }

  const updateMainForceData = useCallback(() => {
    setMainForceDataList(prev => prev.map(item => {
      const superLargeInflow = item.superLarge.inflow + (Math.random() - 0.3) * 20000000
      const superLargeOutflow = item.superLarge.outflow + (Math.random() - 0.3) * 18000000
      const largeInflow = item.large.inflow + (Math.random() - 0.3) * 25000000
      const largeOutflow = item.large.outflow + (Math.random() - 0.3) * 22000000
      const mediumInflow = item.medium.inflow + (Math.random() - 0.3) * 15000000
      const mediumOutflow = item.medium.outflow + (Math.random() - 0.3) * 12000000
      const smallInflow = item.small.inflow + (Math.random() - 0.3) * 10000000
      const smallOutflow = item.small.outflow + (Math.random() - 0.3) * 8000000

      const superLargeNet = superLargeInflow - superLargeOutflow
      const largeNet = largeInflow - largeOutflow
      const mediumNet = mediumInflow - mediumOutflow
      const smallNet = smallInflow - smallOutflow
      const totalNet = superLargeNet + largeNet + mediumNet + smallNet

      let trend: 'up' | 'down' | 'neutral' = 'neutral'
      if (totalNet > 50000000) {
        trend = 'up'
      } else if (totalNet < -50000000) {
        trend = 'down'
      }

      return {
        ...item,
        superLarge: { inflow: superLargeInflow, outflow: superLargeOutflow, net: superLargeNet },
        large: { inflow: largeInflow, outflow: largeOutflow, net: largeNet },
        medium: { inflow: mediumInflow, outflow: mediumOutflow, net: mediumNet },
        small: { inflow: smallInflow, outflow: smallOutflow, net: smallNet },
        totalNet,
        trend,
        lastUpdate: new Date().toLocaleTimeString('zh-CN'),
        timestamp: Date.now()
      }
    }))
    setLastUpdateTime(new Date())
  }, [])

  const handleRefresh = () => {
    loadMainForceData()
  }

  const handleToggleAutoUpdate = () => {
    setAutoUpdate(!autoUpdate)
    message.success(autoUpdate ? '自动更新已关闭' : '自动更新已开启')
  }

  const handleFilter = () => {
    message.info('筛选功能开发中...')
  }

  const handleViewDetail = (record: MainForceData) => {
    setSelectedStock(record.code)
    setActiveTab('chart')
  }

  const getCurrentStockData = () => {
    return mainForceDataList.find(item => item.code === selectedStock) || mainForceDataList[0]
  }

  const getTrendChartOption = () => {
    const dates = historicalData.map(d => d.date)
    return {
      title: { text: '主力资金流向趋势', left: 'center' },
      tooltip: { trigger: 'axis' },
      legend: { data: ['超大单', '大单', '中单', '小单', '合计'], bottom: 10 },
      grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: dates },
      yAxis: { type: 'value' },
      series: [
        {
          name: '超大单',
          type: 'line',
          smooth: true,
          data: historicalData.map(d => d.superLargeNet / 100000000),
          itemStyle: { color: '#ff4d4f' }
        },
        {
          name: '大单',
          type: 'line',
          smooth: true,
          data: historicalData.map(d => d.largeNet / 100000000),
          itemStyle: { color: '#fa8c16' }
        },
        {
          name: '中单',
          type: 'line',
          smooth: true,
          data: historicalData.map(d => d.mediumNet / 100000000),
          itemStyle: { color: '#1890ff' }
        },
        {
          name: '小单',
          type: 'line',
          smooth: true,
          data: historicalData.map(d => d.smallNet / 100000000),
          itemStyle: { color: '#52c41a' }
        },
        {
          name: '合计',
          type: 'line',
          smooth: true,
          data: historicalData.map(d => d.totalNet / 100000000),
          itemStyle: { color: '#722ed1' },
          lineStyle: { width: 3 }
        }
      ]
    }
  }

  const getCompositionChartOption = () => {
    const currentData = getCurrentStockData()
    if (!currentData) return {}
    return {
      title: { text: '资金构成分析', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left', top: 'middle' },
      series: [
        {
          name: '资金构成',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: true, formatter: '{b}: {c} ({d}%)' },
          emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
          labelLine: { show: true },
          data: [
            { value: Math.abs(currentData.superLarge.net), name: '超大单', itemStyle: { color: '#ff4d4f' } },
            { value: Math.abs(currentData.large.net), name: '大单', itemStyle: { color: '#fa8c16' } },
            { value: Math.abs(currentData.medium.net), name: '中单', itemStyle: { color: '#1890ff' } },
            { value: Math.abs(currentData.small.net), name: '小单', itemStyle: { color: '#52c41a' } }
          ]
        }
      ]
    }
  }

  const columns = [
    {
      title: '股票代码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '股票名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MainForceData) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      )
    },
    {
      title: '超大单',
      key: 'superLarge',
      render: (_: any, record: MainForceData) => (
        <span style={{ color: record.superLarge.net >= 0 ? '#ff4d4f' : '#52c41a' }}>
          {record.superLarge.net >= 0 ? '+' : ''}{formatMoney(record.superLarge.net)}
        </span>
      ),
    },
    {
      title: '大单',
      key: 'large',
      render: (_: any, record: MainForceData) => (
        <span style={{ color: record.large.net >= 0 ? '#ff4d4f' : '#52c41a' }}>
          {record.large.net >= 0 ? '+' : ''}{formatMoney(record.large.net)}
        </span>
      ),
    },
    {
      title: '中单',
      key: 'medium',
      render: (_: any, record: MainForceData) => (
        <span style={{ color: record.medium.net >= 0 ? '#ff4d4f' : '#52c41a' }}>
          {record.medium.net >= 0 ? '+' : ''}{formatMoney(record.medium.net)}
        </span>
      ),
    },
    {
      title: '小单',
      key: 'small',
      render: (_: any, record: MainForceData) => (
        <span style={{ color: record.small.net >= 0 ? '#ff4d4f' : '#52c41a' }}>
          {record.small.net >= 0 ? '+' : ''}{formatMoney(record.small.net)}
        </span>
      ),
    },
    {
      title: '净流入',
      key: 'totalNet',
      render: (_: any, record: MainForceData) => (
        <span style={{ color: record.totalNet >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
          {record.totalNet >= 0 ? '+' : ''}{formatMoney(record.totalNet)}
        </span>
      ),
    },
    {
      title: '趋势',
      key: 'trend',
      render: (_: any, record: MainForceData) => {
        const trendMap: Record<string, { icon: React.ReactNode; color: string; text: string }> = {
          up: { icon: <ArrowUpOutlined />, color: 'red', text: '上涨' },
          down: { icon: <ArrowDownOutlined />, color: 'green', text: '下跌' },
          neutral: { icon: <BarChartOutlined />, color: 'blue', text: '震荡' }
        }
        const trend = trendMap[record.trend]
        return (
          <Tag color={trend.color}>
            {trend.icon} {trend.text}
          </Tag>
        )
      },
    },
    {
      title: '更新时间',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
    },
  ]

  const formatLastUpdate = () => {
    if (!lastUpdateTime) return '尚未更新'
    return lastUpdateTime.toLocaleTimeString('zh-CN')
  }

  const currentData = getCurrentStockData()
  const unreadAlertCount = alerts.filter(a => !a.read).length

  const renderAlertItem = (alert: AlertEvent) => {
    const urgencyColor = {
      emergency: 'red',
      high: 'orange',
      medium: 'gold',
      low: 'blue'
    }[alert.urgency]

    const urgencyText = {
      emergency: '紧急',
      high: '高',
      medium: '中',
      low: '低'
    }[alert.urgency]

    return (
      <List.Item
        key={alert.id}
        className={`signal-item ${alert.read ? 'read' : 'unread'}`}
        actions={[
          !alert.read && (
            <Button 
              type="text" 
              size="small"
              onClick={() => {
                tracker.markAlertAsRead(alert.id)
                loadAlerts()
              }}
            >
              标为已读
            </Button>
          )
        ].filter(Boolean)}
      >
        <List.Item.Meta
          avatar={<AlertOutlined style={{ color: urgencyColor }} />}
          title={
            <Space>
              <span>{alert.stockName}</span>
              <Tag color={urgencyColor}>{urgencyText}</Tag>
            </Space>
          }
          description={
            <div>
              <div>{alert.message}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {new Date(alert.timestamp).toLocaleString('zh-CN')}
              </div>
            </div>
          }
        />
      </List.Item>
    )
  }

  return (
    <div className="main-force-tracker" style={{ padding: '0px' }}>
      <div className="dashboard-header" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ margin: 0 }}>主力资金追踪系统</h2>
          <Space>
            <Tooltip title={`自动更新: ${autoUpdate ? '开启' : '关闭'}`}>
              <Space size="small">
                <ClockCircleOutlined style={{ color: autoUpdate ? '#52c41a' : '#8c8c8c' }} />
                <span style={{ fontSize: '14px' }}>自动更新: {autoUpdate ? '开启' : '关闭'}</span>
              </Space>
            </Tooltip>
            <Tooltip title="最后更新时间">
              <Space size="small">
                <SyncOutlined spin={autoUpdate} />
                <span style={{ fontSize: '14px', color: '#666' }}>
                  最后更新: {formatLastUpdate()}
                </span>
              </Space>
            </Tooltip>
          </Space>
        </div>
        <Space>
          <Button 
            type="default" 
            icon={<FilterOutlined />} 
            onClick={handleFilter}
            size="small"
          >
            筛选
          </Button>
          <Button 
            type="default" 
            icon={<HistoryOutlined />} 
            onClick={() => setShowSectorData(!showSectorData)}
            size="small"
          >
            {showSectorData ? '隐藏板块' : '板块分析'}
          </Button>
          <Button 
            type={autoUpdate ? 'default' : 'primary'} 
            onClick={handleToggleAutoUpdate}
            size="small"
          >
            {autoUpdate ? '暂停更新' : '开启更新'}
          </Button>
          <Button 
            type="primary" 
            icon={<SyncOutlined />} 
            onClick={handleRefresh}
            size="small"
            loading={loading}
          >
            立即更新
          </Button>
        </Space>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        size="small"
        items={[
          {
            key: 'realtime',
            label: '实时追踪',
            children: (
              <>
                {currentData && (
                  <>
                    <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
                      <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                        <Card size="small" bordered={false} style={{ height: '100%', margin: '2px' }}>
                          <Statistic
                            title={currentData.name}
                            value={currentData.totalNet}
                            precision={0}
                            valueStyle={{ color: currentData.totalNet >= 0 ? '#ff4d4f' : '#52c41a', fontSize: '24px' }}
                            formatter={(value) => {
                              const num = value as number
                              return `${num >= 0 ? '+' : ''}${formatMoney(num)}`
                            }}
                          />
                          <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                            净流入
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                        <Card size="small" bordered={false} style={{ height: '100%', margin: '2px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#722ed1', fontSize: '16px', fontWeight: 'bold' }}>超大单</div>
                            <div style={{ marginTop: '8px' }}>
                              <Tag color="red">流入: {formatMoney(currentData.superLarge.inflow)}</Tag>
                            </div>
                            <div style={{ marginTop: '4px' }}>
                              <Tag color="green">流出: {formatMoney(currentData.superLarge.outflow)}</Tag>
                            </div>
                            <div style={{ marginTop: '4px', color: currentData.superLarge.net >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
                              净{currentData.superLarge.net >= 0 ? '流入' : '流出'}: {formatMoney(Math.abs(currentData.superLarge.net))}
                            </div>
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                        <Card size="small" bordered={false} style={{ height: '100%', margin: '2px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#1890ff', fontSize: '16px', fontWeight: 'bold' }}>大单</div>
                            <div style={{ marginTop: '8px' }}>
                              <Tag color="red">流入: {formatMoney(currentData.large.inflow)}</Tag>
                            </div>
                            <div style={{ marginTop: '4px' }}>
                              <Tag color="green">流出: {formatMoney(currentData.large.outflow)}</Tag>
                            </div>
                            <div style={{ marginTop: '4px', color: currentData.large.net >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
                              净{currentData.large.net >= 0 ? '流入' : '流出'}: {formatMoney(Math.abs(currentData.large.net))}
                            </div>
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} md={12} lg={6} xl={6}>
                        <Card size="small" bordered={false} style={{ height: '100%', margin: '2px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#faad14', fontSize: '16px', fontWeight: 'bold' }}>中单</div>
                            <div style={{ marginTop: '8px' }}>
                              <Tag color="red">流入: {formatMoney(currentData.medium.inflow)}</Tag>
                            </div>
                            <div style={{ marginTop: '4px' }}>
                              <Tag color="green">流出: {formatMoney(currentData.medium.outflow)}</Tag>
                            </div>
                            <div style={{ marginTop: '4px', color: currentData.medium.net >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
                              净{currentData.medium.net >= 0 ? '流入' : '流出'}: {formatMoney(Math.abs(currentData.medium.net))}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    </Row>

                    <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
                      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Card 
                          size="small" 
                          bordered={false} 
                          title={
                            <Space>
                              <LineChartOutlined />
                              <span>资金流入详情</span>
                            </Space>
                          }
                          style={{ margin: '2px' }}
                        >
                          <div style={{ marginBottom: '2px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>超大单流入</span>
                              <span style={{ color: '#ff4d4f' }}>{formatMoney(currentData.superLarge.inflow)}</span>
                            </div>
                            <Progress 
                              percent={calculatePercent(currentData.superLarge.inflow, currentData.superLarge.outflow)} 
                              strokeColor="#ff4d4f" 
                              size="small" 
                            />
                          </div>
                          <div style={{ marginBottom: '2px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>超大单流出</span>
                              <span style={{ color: '#52c41a' }}>{formatMoney(currentData.superLarge.outflow)}</span>
                            </div>
                            <Progress 
                              percent={calculatePercent(currentData.superLarge.outflow, currentData.superLarge.inflow)} 
                              strokeColor="#52c41a" 
                              size="small" 
                            />
                          </div>
                          <div style={{ marginBottom: '2px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>大单流入</span>
                              <span style={{ color: '#ff4d4f' }}>{formatMoney(currentData.large.inflow)}</span>
                            </div>
                            <Progress 
                              percent={calculatePercent(currentData.large.inflow, currentData.large.outflow)} 
                              strokeColor="#ff4d4f" 
                              size="small" 
                            />
                          </div>
                          <div style={{ marginBottom: '2px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>大单流出</span>
                              <span style={{ color: '#52c41a' }}>{formatMoney(currentData.large.outflow)}</span>
                            </div>
                            <Progress 
                              percent={calculatePercent(currentData.large.outflow, currentData.large.inflow)} 
                              strokeColor="#52c41a" 
                              size="small" 
                            />
                          </div>
                          <div style={{ marginBottom: '2px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>中单流入</span>
                              <span style={{ color: '#ff4d4f' }}>{formatMoney(currentData.medium.inflow)}</span>
                            </div>
                            <Progress 
                              percent={calculatePercent(currentData.medium.inflow, currentData.medium.outflow)} 
                              strokeColor="#ff4d4f" 
                              size="small" 
                            />
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span>中单流出</span>
                              <span style={{ color: '#52c41a' }}>{formatMoney(currentData.medium.outflow)}</span>
                            </div>
                            <Progress 
                              percent={calculatePercent(currentData.medium.outflow, currentData.medium.inflow)} 
                              strokeColor="#52c41a" 
                              size="small" 
                            />
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                        <Card size="small" bordered={false} title="资金分析" style={{ margin: '2px' }}>
                          <div style={{ textAlign: 'center', padding: '20px' }}>
                            {currentData.totalNet >= 0 ? (
                              <div>
                                <ArrowUpOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
                                <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '12px' }}>主力资金流入</div>
                                <Progress percent={75} status="active" style={{ marginTop: '16px' }} />
                                <div style={{ color: '#666', marginTop: '8px' }}>建议关注</div>
                              </div>
                            ) : (
                              <div>
                                <ArrowDownOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                                <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '12px' }}>主力资金流出</div>
                                <Progress percent={35} status="exception" style={{ marginTop: '16px' }} />
                                <div style={{ color: '#666', marginTop: '8px' }}>建议观望</div>
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '12px' }}>
                            最后更新: {currentData.lastUpdate}
                          </div>
                        </Card>
                      </Col>
                    </Row>

                    <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
                      <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Card size="small" bordered={false} style={{ margin: '2px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ color: '#52c41a', fontSize: '16px', fontWeight: 'bold' }}>小单</div>
                            <div style={{ marginTop: '8px' }}>
                              <Tag color="red">流入: {formatMoney(currentData.small.inflow)}</Tag>
                            </div>
                            <div style={{ marginTop: '4px' }}>
                              <Tag color="green">流出: {formatMoney(currentData.small.outflow)}</Tag>
                            </div>
                            <div style={{ marginTop: '4px', color: currentData.small.net >= 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>
                              净{currentData.small.net >= 0 ? '流入' : '流出'}: {formatMoney(Math.abs(currentData.small.net))}
                            </div>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </>
                )}

                <Row gutter={[2, 2]}>
                  <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Card 
                      size="small" 
                      bordered={false} 
                      title={
                        <Space>
                          <BarChartOutlined />
                          <span>主力资金流向股票列表</span>
                        </Space>
                      }
                      extra={
                        <Space>
                          <Select
                            value={selectedStock}
                            onChange={setSelectedStock}
                            style={{ width: 200 }}
                            size="small"
                          >
                            {mainForceDataList.map(item => (
                              <Option key={item.code} value={item.code}>
                                {item.name} ({item.code})
                              </Option>
                            ))}
                          </Select>
                        </Space>
                      }
                      style={{ margin: '2px' }}
                    >
                      <Table 
                        columns={columns} 
                        dataSource={mainForceDataList} 
                        pagination={false}
                        rowKey="code"
                        size="small"
                        loading={loading}
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            )
          },
          {
            key: 'chart',
            label: '图表分析',
            children: (
              <Row gutter={[2, 2]}>
                <Col xs={24} lg={12}>
                  <Card size="small" bordered={false} title="资金流向趋势" style={{ margin: '2px' }}>
                    <ReactECharts option={getTrendChartOption()} style={{ height: '400px' }} />
                  </Card>
                </Col>
                <Col xs={24} lg={12}>
                  <Card size="small" bordered={false} title="资金构成分析" style={{ margin: '2px' }}>
                    <ReactECharts option={getCompositionChartOption()} style={{ height: '400px' }} />
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'history',
            label: '历史数据',
            children: (
              <Card size="small" bordered={false} style={{ margin: '2px' }}>
                <div style={{ marginBottom: 2 }}>
                  <Space>
                    <RangePicker 
                      value={dateRange}
                      onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null])}
                      size="small"
                    />
                    <Button size="small" type="primary">
                      查询
                    </Button>
                    <Button size="small" icon={<DownloadOutlined />}>
                      导出
                    </Button>
                  </Space>
                </div>
                <Empty description="历史数据功能开发中..." />
              </Card>
            )
          },
          {
            key: 'alerts',
            label: (
              <Badge count={unreadAlertCount} showZero={false}>
                警报
              </Badge>
            ),
            children: (
              <Card size="small" bordered={false} title="主力资金异动警报" style={{ margin: '2px' }}>
                {alerts.length > 0 ? (
                  <List
                    dataSource={alerts}
                    renderItem={renderAlertItem}
                  />
                ) : (
                  <Empty description="暂无异动警报" />
                )}
              </Card>
            )
          }
        ]}
      />

      {showSectorData && (
        <Modal
          title="板块资金分析"
          open={showSectorData}
          onCancel={() => setShowSectorData(false)}
          footer={null}
          width={800}
        >
          <Empty description="板块资金分析功能开发中..." />
        </Modal>
      )}
    </div>
  )
}

export default MainForceTrackerComponent
