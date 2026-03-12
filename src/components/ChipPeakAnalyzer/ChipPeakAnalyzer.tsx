import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Button, Statistic, Progress, Tag, Space, Table, Alert, Tooltip } from 'antd';
import { ReloadOutlined, BarChartOutlined, RiseOutlined, FallOutlined, InfoCircleOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { getChipPeakAnalyzer, type ChipDistribution } from '../../utils/chipPeakAnalyzer';
import { getStockList } from '../../utils/stockData';

const { Option } = Select;

const ChipPeakAnalyzerComponent: React.FC = () => {
  const [selectedStock, setSelectedStock] = useState('600519');
  const [stockList, setStockList] = useState<{ code: string; name: string }[]>([]);
  const [chipDistribution, setChipDistribution] = useState<ChipDistribution | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ signal: 'bullish' | 'bearish' | 'neutral'; score: number; reasons: string[] } | null>(null);

  const analyzer = getChipPeakAnalyzer();

  useEffect(() => {
    loadStockList();
  }, []);

  useEffect(() => {
    if (stockList.length > 0) {
      loadChipDistribution();
    }
  }, [selectedStock, stockList]);

  const loadStockList = async () => {
    try {
      const list = await getStockList();
      setStockList(list.map(item => ({ code: item.code, name: item.name })));
    } catch (error) {
      console.error('加载股票列表失败:', error);
      setStockList([
        { code: '600519', name: '贵州茅台' },
        { code: '000001', name: '平安银行' },
        { code: '002594', name: '比亚迪' },
        { code: '000977', name: '浪潮信息' },
        { code: '300418', name: '昆仑万维' }
      ]);
    }
  };

  const loadChipDistribution = () => {
    setLoading(true);
    setTimeout(() => {
      const stock = stockList.find(s => s.code === selectedStock);
      const currentPrice = selectedStock === '600519' ? 1856.00 : 
                          selectedStock === '000001' ? 12.56 : 
                          selectedStock === '002594' ? 256.80 : 
                          selectedStock === '000977' ? 45.80 : 38.50;
      
      const distribution = analyzer.generateChipDistribution(
        selectedStock,
        stock?.name || '未知股票',
        currentPrice
      );
      
      setChipDistribution(distribution);
      
      const result = analyzer.analyzeChipDistribution(distribution);
      setAnalysisResult(result);
      
      setLoading(false);
    }, 500);
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'bullish': return <RiseOutlined style={{ color: '#ff4d4f' }} />;
      case 'bearish': return <FallOutlined style={{ color: '#52c41a' }} />;
      default: return <BarChartOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getSignalText = (signal: string) => {
    switch (signal) {
      case 'bullish': return '看涨';
      case 'bearish': return '看跌';
      default: return '中性';
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish': return 'red';
      case 'bearish': return 'green';
      default: return 'blue';
    }
  };

  const getChipChartOption = () => {
    if (!chipDistribution) return {};

    const maxVolume = Math.max(...chipDistribution.peaks.map(p => p.volume));
    
    return {
      title: { 
        text: '筹码分布', 
        left: 'center',
        textStyle: { fontSize: 16, fontWeight: 'bold' }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          if (!data) return '';
          return `
            <div>价格: ${data.value[0].toFixed(2)}</div>
            <div>成交量: ${(data.value[1] / 10000).toFixed(2)}万</div>
            <div>占比: ${data.value[2].toFixed(2)}%</div>
          `;
        }
      },
      grid: { left: '10%', right: '10%', bottom: '15%', top: '15%' },
      xAxis: {
        type: 'value',
        name: '成交量',
        axisLabel: {
          formatter: (value: number) => (value / 10000).toFixed(0) + '万'
        }
      },
      yAxis: {
        type: 'value',
        name: '价格',
        position: 'right'
      },
      series: [{
        type: 'bar',
        layout: 'horizontal',
        data: chipDistribution.peaks.map(p => [p.price, p.volume, p.percentage]),
        itemStyle: {
          color: (params: any) => {
            return chipDistribution.peaks[params.dataIndex].color;
          }
        },
        markLine: {
          data: [
            { 
              yAxis: chipDistribution.currentPrice, 
              name: '当前价格',
              lineStyle: { color: '#ff4d4f', width: 2, type: 'dashed' },
              label: { formatter: '当前价格: {c}' }
            }
          ]
        }
      }]
    };
  };

  const getPeakTableColumns = () => [
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => price.toFixed(2),
      sorter: (a: any, b: any) => a.price - b.price
    },
    {
      title: '成交量',
      dataIndex: 'volume',
      key: 'volume',
      render: (vol: number) => (vol / 10000).toFixed(2) + '万',
      sorter: (a: any, b: any) => a.volume - b.volume
    },
    {
      title: '占比',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percent: number) => (
        <Progress percent={percent} size="small" strokeColor="#1890ff" />
      ),
      sorter: (a: any, b: any) => a.percentage - b.percentage
    },
    {
      title: '类型',
      dataIndex: 'isPeak',
      key: 'isPeak',
      render: (isPeak: boolean) => (
        isPeak ? <Tag color="orange">筹码峰</Tag> : <Tag color="default">普通</Tag>
      )
    }
  ];

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>筹码峰分析</h2>
        <Space>
          <Select
            value={selectedStock}
            onChange={setSelectedStock}
            style={{ width: 200 }}
            loading={stockList.length === 0}
          >
            {stockList.map(stock => (
              <Option key={stock.code} value={stock.code}>
                {stock.name} ({stock.code})
              </Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={loadChipDistribution}
            loading={loading}
          >
            刷新分析
          </Button>
        </Space>
      </div>

      {chipDistribution && analysisResult && (
        <>
          <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small" bordered={false} style={{ margin: '2px' }}>
                <Statistic
                  title="当前价格"
                  value={chipDistribution.currentPrice}
                  precision={2}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small" bordered={false} style={{ margin: '2px' }}>
                <Statistic
                  title="平均成本"
                  value={chipDistribution.avgCost}
                  precision={2}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small" bordered={false} style={{ margin: '2px' }}>
                <Statistic
                  title="获利盘比例"
                  value={chipDistribution.profitPercentage}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small" bordered={false} style={{ margin: '2px' }}>
                <Statistic
                  title="筹码集中度"
                  value={chipDistribution.concentration}
                  precision={2}
                  suffix="%"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small" bordered={false} style={{ margin: '2px' }}>
                <Statistic
                  title="支撑位"
                  value={chipDistribution.supportLevel}
                  precision={2}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6} xl={4}>
              <Card size="small" bordered={false} style={{ margin: '2px' }}>
                <Statistic
                  title="阻力位"
                  value={chipDistribution.resistanceLevel}
                  precision={2}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
            <Col xs={24} lg={8}>
              <Card size="small" bordered={false} title="综合分析" style={{ margin: '2px' }}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                    {getSignalIcon(analysisResult.signal)}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                    <Tag color={getSignalColor(analysisResult.signal)} style={{ fontSize: '18px', padding: '8px 16px' }}>
                      {getSignalText(analysisResult.signal)}
                    </Tag>
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <Progress 
                      percent={analysisResult.score} 
                      strokeColor={{
                        '0%': '#52c41a',
                        '50%': '#faad14',
                        '100%': '#ff4d4f'
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    评分: {analysisResult.score}/100
                  </div>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={16}>
              <Card size="small" bordered={false} title="分析依据" style={{ margin: '2px' }}>
                {analysisResult.reasons.map((reason, index) => (
                  <Alert
                    key={index}
                    message={reason}
                    type="info"
                    showIcon
                    style={{ marginBottom: index < analysisResult.reasons.length - 1 ? '2px' : 0 }}
                  />
                ))}
              </Card>
            </Col>
          </Row>

          <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
            <Col xs={24} lg={16}>
              <Card size="small" bordered={false} title="筹码分布图" style={{ margin: '2px' }}>
                <ReactECharts option={getChipChartOption()} style={{ height: '400px' }} />
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px' }}>
                  <span><Tag color="green">获利盘</Tag></span>
                  <span><Tag color="gold">当前价格附近</Tag></span>
                  <span><Tag color="red">套牢盘</Tag></span>
                  <span><Tag color="blue">其他</Tag></span>
                </div>
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card size="small" bordered={false} title="筹码详情" style={{ margin: '2px' }}>
                <Table
                  columns={getPeakTableColumns()}
                  dataSource={chipDistribution.peaks}
                  rowKey="price"
                  pagination={{ pageSize: 10, size: 'small' }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          <Card size="small" bordered={false} style={{ margin: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <span style={{ fontWeight: 'bold' }}>使用说明</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '13px' }}>
              <li>筹码分布图显示了不同价格区间的成交量分布情况</li>
              <li>绿色表示获利盘（低于当前价格的筹码），红色表示套牢盘（高于当前价格的筹码）</li>
              <li>筹码集中度越高，说明主力控盘程度越高</li>
              <li>支撑位和阻力位是基于筹码峰计算得出的重要价格位置</li>
              <li>综合分析结果仅供参考，不构成投资建议</li>
            </ul>
          </Card>
        </>
      )}
    </div>
  );
};

export default ChipPeakAnalyzerComponent;
