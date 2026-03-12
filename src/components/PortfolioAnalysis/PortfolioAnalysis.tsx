import React, { useState, useEffect, useCallback } from 'react'
import { Card, Table, Statistic, Row, Col, Progress, Tag, Button, Space, message, Tabs, Alert, Modal, Divider, Select, Tooltip, Spin } from 'antd'
import { WalletOutlined, RiseOutlined, BarChartOutlined, BulbOutlined, ThunderboltOutlined, SafetyOutlined, ExperimentOutlined, LineChartOutlined, ArrowUpOutlined, ArrowDownOutlined, ReloadOutlined, DownloadOutlined, FilterOutlined, PieChartOutlined, LineChartOutlined as RadarOutlined, AreaChartOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { optimizeChartData } from '../../utils/performance'

const PortfolioAnalysis: React.FC = () => {
  const navigate = useNavigate()
  const [equityChartOption, setEquityChartOption] = useState<any>(null)
  const [assetAllocationOption, setAssetAllocationOption] = useState<any>(null)
  const [sectorAllocationOption, setSectorAllocationOption] = useState<any>(null)
  const [riskReturnOption, setRiskReturnOption] = useState<any>(null)
  
  const [portfolioData] = useState({
    totalValue: 1285000,
    todayProfit: 28500,
    totalProfit: 125000,
    profitPercent: 10.8,
    sharpeRatio: 1.2,
    maxDrawdown: 15.2,
    volatility: 18.5,
    alpha: 0.08,
    beta: 0.95
  })

  const [holdings] = useState([
    { key: '1', code: '600519', name: '贵州茅台', quantity: 100, price: 1892.00, costPrice: 1850.00, marketValue: 189200, profit: 4200, profitPercent: 2.27, sector: '消费', industry: '白酒', weight: 59.6 },
    { key: '2', code: '000858', name: '五粮液', quantity: 200, price: 168.50, costPrice: 165.20, marketValue: 33700, profit: 660, profitPercent: 2.00, sector: '消费', industry: '白酒', weight: 10.6 },
    { key: '3', code: '002594', name: '比亚迪', quantity: 500, price: 256.80, costPrice: 245.00, marketValue: 128400, profit: 5900, profitPercent: 4.80, sector: '新能源', industry: '汽车', weight: 20.4 },
    { key: '4', code: '600036', name: '招商银行', quantity: 1000, price: 35.20, costPrice: 32.50, marketValue: 35200, profit: 2700, profitPercent: 8.31, sector: '金融', industry: '银行', weight: 5.6 },
    { key: '5', code: '000063', name: '中兴通讯', quantity: 800, price: 28.50, costPrice: 30.00, marketValue: 22800, profit: -1200, profitPercent: -4.00, sector: '科技', industry: '通信', weight: 3.8 }
  ])

  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const [timePeriod, setTimePeriod] = useState('90d')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateCharts()
  }, [timePeriod])

  const generateCharts = useCallback(() => {
    setLoading(true)
    try {
      generateEquityChart()
      generateAssetAllocationChart()
      generateSectorAllocationChart()
      generateRiskReturnChart()
    } finally {
      setLoading(false)
    }
  }, [timePeriod])

  const generateEquityChart = useCallback(() => {
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '180d': 180,
      '1y': 365,
      '3y': 1095
    }
    
    const days = daysMap[timePeriod] || 90
    const dates: string[] = []
    const equityValues: number[] = []
    const benchmarkValues: number[] = []
    
    const initialEquity = 1160000
    const initialBenchmark = 1000000
    
    let currentEquity = initialEquity
    let currentBenchmark = initialBenchmark
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }))
      
      const equityChange = (Math.random() - 0.45) * 0.025
      const benchmarkChange = (Math.random() - 0.48) * 0.02
      
      currentEquity *= (1 + equityChange)
      currentBenchmark *= (1 + benchmarkChange)
      
      equityValues.push(currentEquity)
      benchmarkValues.push(currentBenchmark)
    }

    // 优化图表数据点
    const optimizedEquityValues = optimizeChartData(equityValues, 100)
    const optimizedBenchmarkValues = optimizeChartData(benchmarkValues, 100)
    const optimizedDates = optimizeChartData(dates.map((_, i) => i), 100).map(i => dates[i])

    const option = {
      title: {
        text: '资产净值走势',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          let result = params[0].axisValue + '<br/>'
          params.forEach((param: any) => {
            result += `${param.seriesName}: ¥${param.data.toLocaleString()}<br/>`
          })
          return result
        }
      },
      legend: {
        data: ['组合净值', '基准指数'],
        bottom: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: optimizedDates,
        axisLabel: { interval: Math.floor(optimizedDates.length / 10) }
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: {
          formatter: (value: number) => '¥' + (value / 10000).toFixed(0) + '万'
        }
      },
      series: [
        {
          name: '组合净值',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          sampling: 'lttb',
          lineStyle: { color: '#1890ff', width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
                { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
              ]
            }
          },
          data: optimizedEquityValues,
          markPoint: {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          },
          markLine: {
            data: [
              { type: 'average', name: '平均值' }
            ]
          }
        },
        {
          name: '基准指数',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          sampling: 'lttb',
          lineStyle: { color: '#faad14', width: 2, type: 'dashed' },
          data: optimizedBenchmarkValues,
          markPoint: {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          }
        }
      ],
      toolbox: {
        feature: {
          saveAsImage: {},
          dataZoom: {},
          restore: {}
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 50,
          end: 100
        },
        {
          start: 50,
          end: 100
        }
      ]
    }
    
    setEquityChartOption(option)
  }, [timePeriod])

  const generateAssetAllocationChart = useCallback(() => {
    const data = holdings.map(item => ({
      name: item.name,
      value: item.weight,
      itemStyle: {
        color: item.profitPercent >= 0 ? '#52c41a' : '#ff4d4f'
      }
    }))

    const option = {
      title: {
        text: '资产配置',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}% ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: holdings.map(item => item.name),
        textStyle: { fontSize: 12 }
      },
      series: [
        {
          name: '资产配置',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '14',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: data
        }
      ]
    }
    
    setAssetAllocationOption(option)
  }, [holdings])

  const generateSectorAllocationChart = useCallback(() => {
    // 按行业分组
    const sectorData = holdings.reduce((acc, item) => {
      if (!acc[item.sector]) {
        acc[item.sector] = 0
      }
      acc[item.sector] += item.weight
      return acc
    }, {} as Record<string, number>)

    const data = Object.entries(sectorData).map(([name, value]) => ({
      name,
      value
    }))

    const option = {
      title: {
        text: '行业配置',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}% ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: 0,
        data: Object.keys(sectorData),
        textStyle: { fontSize: 12 }
      },
      series: [
        {
          name: '行业配置',
          type: 'pie',
          radius: '60%',
          center: ['50%', '40%'],
          data: data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          animationType: 'scale',
          animationEasing: 'elasticOut'
        }
      ]
    }
    
    setSectorAllocationOption(option)
  }, [holdings])

  const generateRiskReturnChart = useCallback(() => {
    const option = {
      title: {
        text: '风险收益分析',
        left: 'center',
        textStyle: { fontSize: 14 }
      },
      tooltip: {
        trigger: 'item'
      },
      radar: {
        indicator: [
          { name: '年化收益', max: 30 },
          { name: '夏普比率', max: 3 },
          { name: '最大回撤', max: 50 },
          { name: '波动率', max: 50 },
          { name: 'Alpha', max: 1 },
          { name: 'Beta', max: 2 }
        ],
        radius: '65%'
      },
      series: [
        {
          name: '风险收益指标',
          type: 'radar',
          data: [
            {
              value: [10.8, portfolioData.sharpeRatio, portfolioData.maxDrawdown, portfolioData.volatility, portfolioData.alpha * 100, portfolioData.beta],
              name: '当前组合',
              areaStyle: {
                color: 'rgba(24, 144, 255, 0.2)'
              },
              lineStyle: {
                color: '#1890ff'
              },
              itemStyle: {
                color: '#1890ff'
              }
            },
            {
              value: [8, 0.8, 20, 22, 5, 1],
              name: '基准组合',
              areaStyle: {
                color: 'rgba(250, 173, 20, 0.2)'
              },
              lineStyle: {
                color: '#faad14'
              },
              itemStyle: {
                color: '#faad14'
              }
            }
          ]
        }
      ]
    }
    
    setRiskReturnOption(option)
  }, [portfolioData])

  const handleTimePeriodChange = useCallback((value: string) => {
    setTimePeriod(value)
  }, [])

  const handleExportReport = useCallback(() => {
    message.success('报表导出功能开发中')
  }, [])

  const handleRefreshData = useCallback(() => {
    generateCharts()
    message.success('数据已更新')
  }, [generateCharts])

  const columns = [
    { title: '股票代码', dataIndex: 'code', key: 'code', width: 100 },
    { title: '股票名称', dataIndex: 'name', key: 'name', width: 120 },
    { title: '行业', dataIndex: 'sector', key: 'sector', width: 100 },
    { title: '持有数量', dataIndex: 'quantity', key: 'quantity', width: 100 },
    { title: '当前价格', dataIndex: 'price', key: 'price', width: 100, render: (price: number) => `¥${price.toFixed(2)}` },
    { title: '成本价格', dataIndex: 'costPrice', key: 'costPrice', width: 100, render: (price: number) => `¥${price.toFixed(2)}` },
    { title: '市值', dataIndex: 'marketValue', key: 'marketValue', width: 120, render: (value: number) => `¥${value.toLocaleString()}` },
    { title: '权重', dataIndex: 'weight', key: 'weight', width: 80, render: (weight: number) => `${weight}%` },
    { 
      title: '盈亏', 
      dataIndex: 'profit', 
      key: 'profit', 
      width: 120,
      render: (profit: number) => (
        <span style={{ color: profit >= 0 ? '#ff4d4f' : '#52c41a' }}>
          {profit >= 0 ? '+' : ''}¥{profit.toLocaleString()}
        </span>
      )
    },
    { 
      title: '盈亏比例', 
      dataIndex: 'profitPercent', 
      key: 'profitPercent', 
      width: 120,
      render: (percent: number) => (
        <span style={{ color: percent >= 0 ? '#ff4d4f' : '#52c41a' }}>
          {percent >= 0 ? '+' : ''}{percent.toFixed(2)}%
        </span>
      )
    }
  ]

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ margin: 0 }}>
          <Space>
            <WalletOutlined />
            <span>投资组合分析</span>
          </Space>
        </h2>
        <Space style={{ flexWrap: 'wrap' }}>
          <Select
            value={timePeriod}
            onChange={handleTimePeriodChange}
            style={{ width: 120 }}
            size="small"
            options={[
              { value: '7d', label: '7天' },
              { value: '30d', label: '30天' },
              { value: '90d', label: '90天' },
              { value: '180d', label: '半年' },
              { value: '1y', label: '1年' },
              { value: '3y', label: '3年' }
            ]}
          />
          <Tooltip title="刷新数据">
            <Button icon={<ReloadOutlined />} onClick={handleRefreshData} size="small" loading={loading} />
          </Tooltip>
          <Tooltip title="导出报表">
            <Button icon={<DownloadOutlined />} onClick={handleExportReport} size="small" />
          </Tooltip>
          <Button type="primary" icon={<BulbOutlined />} onClick={() => setShowSuggestionModal(true)} size="small">
            AI智能建议
          </Button>
          <Button onClick={() => message.info('添加持仓功能开发中')} size="small">添加持仓</Button>
        </Space>
      </div>

      <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ margin: '2px' }}>
            <Statistic 
              title="总资产" 
              value={portfolioData.totalValue} 
              precision={0} 
              valueStyle={{ fontSize: '24px' }}
              prefix={<WalletOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ margin: '2px' }}>
            <Statistic 
              title="今日收益" 
              value={portfolioData.todayProfit} 
              precision={0}
              valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ margin: '2px' }}>
            <Statistic 
              title="总收益" 
              value={portfolioData.totalProfit} 
              precision={0}
              valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ margin: '2px' }}>
            <Statistic 
              title="收益率" 
              value={portfolioData.profitPercent} 
              precision={1}
              suffix="%"
              valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ margin: '2px' }}>
            <Statistic 
              title="夏普比率" 
              value={portfolioData.sharpeRatio} 
              precision={2}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              prefix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ margin: '2px' }}>
            <Statistic 
              title="最大回撤" 
              value={portfolioData.maxDrawdown} 
              precision={1}
              suffix="%"
              valueStyle={{ color: '#faad14', fontSize: '24px' }}
              prefix={<ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ margin: '2px' }}>
            <Statistic 
              title="波动率" 
              value={portfolioData.volatility} 
              precision={1}
              suffix="%"
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
              prefix={<AreaChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" bordered={false} style={{ margin: '2px' }}>
            <Statistic 
              title="Alpha" 
              value={portfolioData.alpha} 
              precision={2}
              valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              prefix={<RadarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="holdings" size="small" style={{ marginBottom: '10px' }}>
        <Tabs.TabPane tab={<span><ThunderboltOutlined />持仓明细</span>} key="holdings">
          <Card size="small" bordered={false} title="持仓明细" style={{ margin: '2px' }}>
            <Table 
              columns={columns} 
              dataSource={holdings} 
              pagination={{ pageSize: 10, size: 'small' }}
              rowKey="key"
              size="small"
            />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><LineChartOutlined />收益走势</span>} key="equity">
          {loading ? (
            <Card size="small" bordered={false} title="资产净值走势" style={{ margin: '2px', minHeight: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Spin size="large" tip="加载中..." />
            </Card>
          ) : equityChartOption ? (
            <Card size="small" bordered={false} title="资产净值走势" style={{ margin: '2px' }}>
              <ReactECharts option={equityChartOption} style={{ height: '400px' }} />
            </Card>
          ) : null}
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><PieChartOutlined />资产配置</span>} key="allocation">
          <Row gutter={[2, 2]}>
            <Col xs={24} md={12}>
              {loading ? (
                <Card size="small" bordered={false} title="资产配置" style={{ margin: '2px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Spin size="large" tip="加载中..." />
                </Card>
              ) : assetAllocationOption ? (
                <Card size="small" bordered={false} title="资产配置" style={{ margin: '2px' }}>
                  <ReactECharts option={assetAllocationOption} style={{ height: '400px' }} />
                </Card>
              ) : null}
            </Col>
            <Col xs={24} md={12}>
              {loading ? (
                <Card size="small" bordered={false} title="行业配置" style={{ margin: '2px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Spin size="large" tip="加载中..." />
                </Card>
              ) : sectorAllocationOption ? (
                <Card size="small" bordered={false} title="行业配置" style={{ margin: '2px' }}>
                  <ReactECharts option={sectorAllocationOption} style={{ height: '400px' }} />
                </Card>
              ) : null}
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><SafetyOutlined />风险分析</span>} key="risk">
          <Row gutter={[2, 2]}>
            <Col xs={24} lg={12}>
              <Card size="small" bordered={false} title="资产配置" style={{ margin: '2px' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>贵州茅台</span>
                      <span>59.6%</span>
                    </div>
                    <Progress percent={59.6} status="active" strokeColor="#1890ff" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>比亚迪</span>
                      <span>20.4%</span>
                    </div>
                    <Progress percent={20.4} status="active" strokeColor="#52c41a" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>招商银行</span>
                      <span>10.6%</span>
                    </div>
                    <Progress percent={10.6} status="active" strokeColor="#faad14" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>其他</span>
                      <span>9.4%</span>
                    </div>
                    <Progress percent={9.4} status="active" strokeColor="#722ed1" />
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" bordered={false} title="收益分析" style={{ margin: '2px' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>盈利股票</span>
                    <Tag color="green">4只</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>亏损股票</span>
                    <Tag color="red">1只</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>最大盈利</span>
                    <span style={{ color: '#ff4d4f' }}>+¥5,900</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>最大亏损</span>
                    <span style={{ color: '#52c41a' }}>-¥1,200</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>盈亏比</span>
                    <Tag color="blue">4.9:1</Tag>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24}>
              {loading ? (
                <Card size="small" bordered={false} title="风险收益分析" style={{ margin: '2px', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Spin size="large" tip="加载中..." />
                </Card>
              ) : riskReturnOption ? (
                <Card size="small" bordered={false} title="风险收益分析" style={{ margin: '2px' }}>
                  <ReactECharts option={riskReturnOption} style={{ height: '400px' }} />
                </Card>
              ) : null}
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane tab={<span><ExperimentOutlined />AI分析</span>} key="ai">
          <Row gutter={[2, 2]}>
            <Col xs={24} lg={12}>
              <Card size="small" bordered={false} title="风险评估" style={{ margin: '2px' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Alert message="资产集中度风险" description="贵州茅台仓位过高(59.6%)，建议降低至30%以下" type="warning" showIcon />
                  <Alert message="行业分布" description="当前持仓集中在消费和新能源，建议增加科技和金融配置" type="info" showIcon />
                  <Alert message="整体风险等级" description="中等风险，整体组合稳健" type="success" showIcon />
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card size="small" bordered={false} title="优化建议" style={{ margin: '2px' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Alert message="减仓贵州茅台" description="建议减仓50%贵州茅台，分散风险" type="info" showIcon />
                  <Alert message="增持中兴通讯" description="中兴通讯短期调整到位，建议适度增持" type="success" showIcon />
                  <Alert message="设置止损" description="为所有持仓设置8-10%的止损位" type="warning" showIcon />
                </Space>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>

      <Modal
        title={
          <Space>
            <BulbOutlined />
            <span>AI智能资产配置建议</span>
          </Space>
        }
        open={showSuggestionModal}
        onCancel={() => setShowSuggestionModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowSuggestionModal(false)} size="small">关闭</Button>,
          <Button key="apply" type="primary" onClick={() => { message.success('建议已应用！'); setShowSuggestionModal(false); }} size="small">
            应用建议
          </Button>
        ]}
        width={800}
      >
        <div>
          <Alert
            message="AI分析结果"
            description="基于您的当前持仓和市场情况，AI为您生成以下资产配置建议"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Divider>建议资产配置</Divider>
          
          <Row gutter={[2, 2]} style={{ marginBottom: 16 }}>
            <Col xs={12}>
              <Card size="small" title="当前配置" style={{ textAlign: 'center', margin: '2px' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div><Tag color="blue">贵州茅台 59.6%</Tag></div>
                  <div><Tag color="green">比亚迪 20.4%</Tag></div>
                  <div><Tag color="orange">招商银行 10.6%</Tag></div>
                  <div><Tag color="purple">其他 9.4%</Tag></div>
                </Space>
              </Card>
            </Col>
            <Col xs={12}>
              <Card size="small" title="建议配置" style={{ textAlign: 'center', margin: '2px' }}>
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <div><Tag color="blue">贵州茅台 30%</Tag></div>
                  <div><Tag color="green">比亚迪 25%</Tag></div>
                  <div><Tag color="orange">招商银行 20%</Tag></div>
                  <div><Tag color="purple">中兴通讯 15%</Tag></div>
                  <div><Tag color="cyan">现金 10%</Tag></div>
                </Space>
              </Card>
            </Col>
          </Row>

          <Divider>操作建议</Divider>
          
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            <Alert message="1. 减仓贵州茅台" description="卖出50股贵州茅台，释放约95万资金" type="warning" showIcon />
            <Alert message="2. 增持比亚迪" description="增持100股比亚迪，增加新能源配置" type="info" showIcon />
            <Alert message="3. 增持招商银行" description="增持500股招商银行，增加金融配置" type="info" showIcon />
            <Alert message="4. 增持中兴通讯" description="增持200股中兴通讯，增加科技配置" type="success" showIcon />
            <Alert message="5. 保留现金" description="保留10%现金，等待更好的投资机会" type="info" showIcon />
          </Space>

          <Divider>预期效果</Divider>

          <Row gutter={[2, 2]}>
            <Col xs={8}>
              <Card size="small" style={{ textAlign: 'center', margin: '2px' }}>
                <Statistic title="风险降低" value={35} suffix="%" valueStyle={{ color: '#52c41a' }} />
              </Card>
            </Col>
            <Col xs={8}>
              <Card size="small" style={{ textAlign: 'center', margin: '2px' }}>
                <Statistic title="分散度提升" value={60} suffix="%" valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col xs={8}>
              <Card size="small" style={{ textAlign: 'center', margin: '2px' }}>
                <Statistic title="预期收益" value={12} suffix="%" valueStyle={{ color: '#ff4d4f' }} />
              </Card>
            </Col>
          </Row>
        </div>
      </Modal>
    </div>
  )
}

export default PortfolioAnalysis