import React, { useState, useEffect } from 'react';
import { Card, Select, Button, Table, Alert, Row, Col, Tag, Space, message, Spin, List, Switch, Form, InputNumber } from 'antd';
import { CheckCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { getStockDataSource, DataSourceType, getStockList, testDataSource, getDataSourceHealth, DataSourceHealth } from '../../utils/stockData';

const { Option } = Select;

const DataSourceManager: React.FC = React.memo(() => {
  const [currentSource, setCurrentSource] = useState<DataSourceType>('sina');
  const [stockList, setStockList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<Map<DataSourceType, DataSourceHealth> | null>(null);
  const [autoFailover, setAutoFailover] = useState(true);
  const [failoverTimeout, setFailoverTimeout] = useState(30000);
  const [maxRetryAttempts, setMaxRetryAttempts] = useState(3);
  
  const dataSource = getStockDataSource();

  useEffect(() => {
    loadStockList();
    loadHealthStatus();
  }, [currentSource]);

  const loadStockList = async () => {
    setLoading(true);
    try {
      const list = await getStockList();
      setStockList(list.slice(0, 10));
    } catch (error) {
      message.error('加载股票列表失败');
    } finally {
      setLoading(false);
    }
  };

  const loadHealthStatus = () => {
    const health = getDataSourceHealth() as Map<DataSourceType, DataSourceHealth>;
    setHealthStatus(health);
  };

  const handleSourceChange = (value: DataSourceType) => {
    setCurrentSource(value);
    dataSource.setSourceType(value);
    setTestResult(null);
    message.success(`已切换到${getSourceName(value)}数据源`);
  };

  const getSourceName = (source: DataSourceType) => {
    const map: Record<DataSourceType, string> = {
      sina: '新浪财经',
      tencent: '腾讯财经',
      eastmoney: '东方财富',
      xueqiu: '雪球',
      ths: '同花顺',
      mock: '模拟数据',
      huatai: '华泰证券',
      gtja: '国泰君安',
      haitong: '海通证券',
      wind: 'Wind',
      choice: 'Choice'
    };
    return map[source];
  };

  const testDataSourceConnection = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await testDataSource(currentSource);
      setTestResult(result);
      if (result.success) {
        message.success('数据源测试成功');
      } else {
        message.error('数据源测试失败');
      }
      loadHealthStatus();
    } catch (error) {
      setTestResult({
        success: false,
        message: `测试失败：${(error as Error).message}`
      });
      message.error('数据源测试失败');
    } finally {
      setTesting(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      case 'unhealthy': return 'error';
      default: return 'default';
    }
  };

  const getHealthStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return '健康';
      case 'degraded': return '降级';
      case 'unhealthy': return '异常';
      default: return '未知';
    }
  };

  const columns = [
    { title: '股票代码', dataIndex: 'code', key: 'code' },
    { title: '股票名称', dataIndex: 'name', key: 'name' },
    { 
      title: '最新价', 
      dataIndex: 'price', 
      key: 'price',
      render: (price: number) => price ? price.toFixed(2) : '-'
    },
    { 
      title: '涨跌幅', 
      dataIndex: 'changePercent', 
      key: 'changePercent',
      render: (percent: number) => {
        if (percent === undefined || percent === null) return '-';
        return (
          <span style={{ color: percent >= 0 ? '#ff4d4f' : '#52c41a' }}>
            {percent >= 0 ? '+' : ''}{percent.toFixed(2)}%
          </span>
        );
      }
    },
    { 
      title: '成交量', 
      dataIndex: 'volume', 
      key: 'volume',
      render: (vol: number) => vol ? (vol / 10000).toFixed(0) + '万' : '-'
    }
  ];

  const dataSources: { type: DataSourceType; name: string; description: string }[] = [
    { type: 'eastmoney', name: '东方财富', description: '东方财富网API，支持实时行情和主力资金数据' },
    { type: 'sina', name: '新浪财经', description: '新浪财经API，支持实时行情数据' },
    { type: 'tencent', name: '腾讯财经', description: '腾讯财经API，支持实时行情数据' },
    { type: 'xueqiu', name: '雪球', description: '雪球API，支持实时行情数据' },
    { type: 'ths', name: '同花顺', description: '同花顺API，支持实时行情数据' },
    { type: 'huatai', name: '华泰证券', description: '华泰证券API，支持实时行情数据' },
    { type: 'gtja', name: '国泰君安', description: '国泰君安API，支持实时行情数据' },
    { type: 'haitong', name: '海通证券', description: '海通证券API，支持实时行情数据' },
    { type: 'wind', name: 'Wind', description: 'Wind金融终端API，提供专业金融数据' },
    { type: 'choice', name: 'Choice', description: 'Choice金融终端API，提供全面金融数据' },
    { type: 'mock', name: '模拟数据', description: '本地模拟数据，离线可用，用于开发和测试' }
  ];

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ marginBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>数据源管理</h2>
      </div>

      <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
        <Col xs={24} lg={12}>
          <Card size="small" title="数据源选择" style={{ margin: '2px' }}>
            <div style={{ marginBottom: '2px' }}>
              <Space>
                <span>当前数据源：</span>
                <Select 
                  value={currentSource} 
                  onChange={handleSourceChange}
                  style={{ width: 200 }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {dataSources.map(source => (
                    <Option key={source.type} value={source.type}>
                      {source.name}
                    </Option>
                  ))}
                </Select>
                <Tag color="blue">当前使用</Tag>
              </Space>
            </div>

            <div style={{ marginBottom: '2px' }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={testing ? <Spin size="small" /> : <CheckCircleOutlined />}
                  onClick={testDataSourceConnection}
                  loading={testing}
                >
                  测试连接
                </Button>
                <Button 
                  icon={<ReloadOutlined />}
                  onClick={() => { loadStockList(); loadHealthStatus(); }}
                  loading={loading}
                >
                  刷新数据
                </Button>
              </Space>
            </div>

            {testResult && (
              <Alert
                message={testResult.success ? '测试成功' : '测试失败'}
                description={testResult.message}
                type={testResult.success ? 'success' : 'error'}
                showIcon
                style={{ marginBottom: '2px' }}
              />
            )}

            <Card size="small" title="数据源配置" style={{ marginTop: '2px', margin: '2px' }}>
              <Form layout="vertical">
                <Form.Item label="自动故障转移">
                  <Switch 
                    checked={autoFailover} 
                    onChange={setAutoFailover}
                  />
                </Form.Item>
                <Form.Item label="故障转移超时时间 (毫秒)">
                  <InputNumber 
                    min={5000} 
                    max={60000} 
                    step={1000} 
                    value={failoverTimeout} 
                    onChange={(value) => value !== null && setFailoverTimeout(value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label="最大重试次数">
                  <InputNumber 
                    min={1} 
                    max={10} 
                    step={1} 
                    value={maxRetryAttempts} 
                    onChange={(value) => value !== null && setMaxRetryAttempts(value)}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Form>
            </Card>
          </Card>

          <Card size="small" title="数据源说明" style={{ marginTop: '2px', margin: '2px' }}>
            <List
              dataSource={dataSources}
              renderItem={(source) => (
                <List.Item>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{source.name}</strong>
                      {currentSource === source.type && (
                        <Tag color="blue">当前使用</Tag>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {source.description}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card size="small" title="股票数据预览" style={{ margin: '2px' }}>
            <Table
              dataSource={stockList}
              columns={columns}
              rowKey="code"
              pagination={false}
              loading={loading}
              size="small"
            />
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
              数据来源：{getSourceName(currentSource)}
            </div>
          </Card>

          {healthStatus && (
            <Card size="small" title="数据源健康状态" style={{ marginTop: '2px', margin: '2px' }}>
              <List
                dataSource={Array.from(healthStatus.values())}
                renderItem={(health) => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{getSourceName(health.source)}</span>
                        <Tag color={getHealthStatusColor(health.status)}>
                          {getHealthStatusText(health.status)}
                        </Tag>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        成功: {health.successCount} | 失败: {health.errorCount}
                        {health.responseTime && ` | 响应时间: ${health.responseTime}ms`}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Col>
      </Row>

      <Alert
        message="使用建议"
        description={
          <div>
            <p>• <strong>模拟数据：</strong>适合开发和测试，无需网络连接</p>
            <p>• <strong>东方财富：</strong>推荐使用，支持主力资金数据，数据较为全面</p>
            <p>• <strong>新浪/腾讯：</strong>备选数据源，主要用于实时行情</p>
            <p>• 注意：第三方API可能有访问限制，建议合理控制请求频率</p>
          </div>
        }
        type="info"
      />
    </div>
  );
});

export default DataSourceManager;
