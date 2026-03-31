import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Table, Tag, Progress, Spin, message, Space, Alert, Statistic, Row, Col, Tooltip } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined, RocketOutlined, LineChartOutlined, EyeOutlined } from '@ant-design/icons';
import { scanAllStocks, generateMarketSignals } from '../../utils/stockData';
import { useTranslation } from 'react-i18next';

interface MarketScanState {
  status: 'idle' | 'scanning' | 'analyzing' | 'completed' | 'error';
  progress: number;
  totalStocks: number;
  processedStocks: number;
  foundSignals: number;
  scanResults: any[];
  signals: any[];
  loading: boolean;
  error: string | null;
}

const MarketScan: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const [state, setState] = useState<MarketScanState>({
    status: 'idle',
    progress: 0,
    totalStocks: 0,
    processedStocks: 0,
    foundSignals: 0,
    scanResults: [],
    signals: [],
    loading: false,
    error: null
  });
  
  const [autoScan, setAutoScan] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 开始全市场扫描
  const startScan = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        status: 'scanning',
        progress: 0,
        loading: true,
        error: null
      }));

      message.info('开始全市场扫描，请稍候...');
      
      // 获取全市场股票数据
      const results = await scanAllStocks(50);
      
      setState(prev => ({
        ...prev,
        status: 'completed',
        scanResults: results,
        totalStocks: results.length,
        processedStocks: results.length,
        progress: 100,
        loading: false
      }));

      message.success(`全市场扫描完成！共获取 ${results.length} 只股票数据`);
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        loading: false,
        error: error instanceof Error ? error.message : '扫描失败'
      }));
      message.error('全市场扫描失败，请稍后重试');
    }
  }, []);

  // 生成市场信号
  const generateSignals = useCallback(async () => {
    if (state.scanResults.length === 0) {
      message.warning('请先进行全市场扫描');
      return;
    }

    try {
      setState(prev => ({
        ...prev,
        status: 'analyzing',
        progress: 0,
        loading: true,
        error: null
      }));

      message.info('开始分析市场信号，请稍候...');
      
      // 生成市场信号
      const signals = await generateMarketSignals(50);
      
      setState(prev => ({
        ...prev,
        status: 'completed',
        signals,
        foundSignals: signals.length,
        progress: 100,
        loading: false
      }));

      message.success(`信号分析完成！发现 ${signals.length} 个潜在买入信号`);
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        loading: false,
        error: error instanceof Error ? error.message : '信号生成失败'
      }));
      message.error('信号生成失败，请稍后重试');
    }
  }, [state.scanResults.length]);

  // 切换自动扫描
  const toggleAutoScan = useCallback(() => {
    if (autoScan) {
      // 停止自动扫描
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setAutoScan(false);
      message.success('自动扫描已关闭');
    } else {
      // 开始自动扫描
      startScan();
      intervalRef.current = setInterval(() => {
        startScan();
      }, 300000); // 每5分钟扫描一次
      setAutoScan(true);
      message.success('自动扫描已开启，每5分钟扫描一次');
    }
  }, [autoScan, startScan]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // 表格列定义
  const columns = [
    {
      title: '股票代码',
      dataIndex: 'stockCode',
      key: 'stockCode',
      width: 80,
      render: (code: string) => <span style={{ fontWeight: 'bold' }}>{code}</span>
    },
    {
      title: '股票名称',
      dataIndex: 'stockName',
      key: 'stockName',
      width: 100
    },
    {
      title: '当前价格',
      dataIndex: 'price',
      key: 'price',
      width: 80,
      render: (price: number) => (
        <span style={{ fontWeight: 'bold' }}>{price.toFixed(2)}</span>
      )
    },
    {
      title: '涨跌幅',
      dataIndex: 'changePercent',
      key: 'changePercent',
      width: 80,
      render: (changePercent: number) => (
        <Tag color={changePercent >= 0 ? 'red' : 'green'}>
          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
        </Tag>
      )
    },
    {
      title: '信心度',
      dataIndex: 'confidence',
      key: 'confidence',
      width: 80,
      render: (confidence: number) => (
        <Progress 
          percent={confidence} 
          size="small" 
          status={confidence >= 80 ? 'success' : confidence >= 60 ? 'normal' : 'exception'}
        />
      )
    },
    {
      title: '信号类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => (
        <Tag color={type === 'buy' ? 'red' : 'green'}>
          {type === 'buy' ? '买入' : '卖出'}
        </Tag>
      )
    },
    {
      title: '技术指标',
      dataIndex: 'technicalData',
      key: 'technicalData',
      render: (data: any) => (
        <Tooltip title={
          <div>
            {data.rsi && <div>RSI: {data.rsi.toFixed(2)}</div>}
            {data.macd && <div>MACD: {data.macd.diff.toFixed(4)}</div>}
            {data.kdj && <div>KDJ: K={data.kdj.k.toFixed(2)}, D={data.kdj.d.toFixed(2)}</div>}
          </div>
        }>
          <EyeOutlined style={{ cursor: 'pointer', color: '#1890ff' }} />
        </Tooltip>
      )
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 120,
      render: (timestamp: number) => (
        <span>{new Date(timestamp).toLocaleTimeString()}</span>
      )
    }
  ];

  return (
    <div className="market-scan" style={{ padding: '10px' }}>
      <Card 
        title="全市场监控" 
        extra={
          <Space>
            <Button 
              type={autoScan ? 'primary' : 'default'}
              icon={autoScan ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={toggleAutoScan}
            >
              {autoScan ? '停止自动扫描' : '开启自动扫描'}
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={startScan}
              loading={state.loading && state.status === 'scanning'}
            >
              开始扫描
            </Button>
            <Button 
              icon={<RocketOutlined />} 
              onClick={generateSignals}
              loading={state.loading && state.status === 'analyzing'}
              disabled={state.scanResults.length === 0}
            >
              生成信号
            </Button>
          </Space>
        }
      >
        {state.error && (
          <Alert
            message="错误"
            description={state.error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="扫描状态"
                value={state.status === 'scanning' ? '扫描中' : 
                       state.status === 'analyzing' ? '分析中' : 
                       state.status === 'completed' ? '完成' : 
                       state.status === 'error' ? '错误' : '就绪'}
                valueStyle={{ color: state.status === 'completed' ? '#3f8600' : 
                              state.status === 'error' ? '#cf1322' : '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="总股票数"
                value={state.totalStocks}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="处理股票数"
                value={state.processedStocks}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic
                title="发现信号数"
                value={state.foundSignals}
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
        </Row>

        {(state.status === 'scanning' || state.status === 'analyzing') && (
          <div style={{ marginBottom: '16px' }}>
            <Progress
              percent={state.progress}
              status="active"
              format={() => `${state.status === 'scanning' ? '扫描中' : '分析中'} ${state.progress}%`}
            />
          </div>
        )}

        <Table
          columns={columns}
          dataSource={state.signals}
          rowKey="id"
          loading={state.loading}
          pagination={{ pageSize: 20 }}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: '暂无信号数据' }}
        />
      </Card>
    </div>
  );
});

export default MarketScan;
