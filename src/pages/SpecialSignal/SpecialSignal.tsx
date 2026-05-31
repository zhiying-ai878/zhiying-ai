import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Tabs, List, Tag, Button, Space, Statistic, Row, Col, Progress, Switch, Form, Select, InputNumber, message, Alert, Badge, Modal, Drawer, Descriptions, Tooltip, Skeleton, Spin, Divider } from 'antd';
import { NotificationOutlined, BellOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, SettingOutlined, FilterOutlined, ReloadOutlined, DeleteOutlined, LineChartOutlined, BarChartOutlined, AreaChartOutlined, EyeOutlined, ArrowUpOutlined, ArrowDownOutlined, DollarOutlined, StarOutlined, LoadingOutlined, FireOutlined } from '@ant-design/icons';
import * as SignalManager from '../../utils/optimizedSignalManager';
import { getStockDataSource, getTechnicalIndicators } from '../../utils/stockData';
import { getMarketMonitor } from '../../utils/marketMonitorManager';
import * as echarts from 'echarts';
import './SpecialSignal.css';

// 动画效果工具函数 - 已禁用
const useAnimation = () => {
  return { isAnimating: false, triggerAnimation: () => {} };
};

// MainForceData接口定义
interface MainForceData {
  stockCode: string;
  stockName: string;
  currentPrice: number;
  mainForceNetFlow: number;
  totalNetFlow: number;
  superLargeOrder: {
    netFlow: number;
    volume: number;
    amount: number;
  };
  largeOrder: {
    netFlow: number;
    volume: number;
    amount: number;
  };
  mediumOrder: {
    netFlow: number;
    volume: number;
    amount: number;
  };
  smallOrder: {
    netFlow: number;
    volume: number;
    amount: number;
  };
  volumeAmplification: number;
  turnoverRate?: number;
  timestamp?: number;
  mainForceRatio?: number;
  mainForceType?: 'nationalTeam' | 'institution' | 'publicFund' | 'privateFund' | 'retail' | 'foreignFund' | 'socialSecurity' | 'insurance' | 'bank' | 'hotMoney' | 'unknown';
  flowStrength?: 'weak' | 'moderate' | 'strong' | 'veryStrong';
  continuousFlowPeriods?: number;
  industryRank?: number;
  conceptRank?: number;
  trend?: string;
}

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

const SpecialSignal = () => {
  const [signals, setSignals] = useState<OptimizedSignal[]>([]);
  const [signalConfig, setSignalConfig] = useState(() => {
    const savedConfig = localStorage.getItem('signalConfig');
    return savedConfig ? JSON.parse(savedConfig) : { buyEnabled: true, sellEnabled: true, holdEnabled: false, minConfidence: 60, scanInterval: 5 };
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [marketMonitorStatus, setMarketMonitorStatus] = useState<any>(null);
  const [dataSourceStatus, setDataSourceStatus] = useState<{
    isConnected: boolean;
    lastCheckTime: number;
    responseTime: number;
    statusMessage: string;
    connectedSource: string;
  }>({
    isConnected: false,
    lastCheckTime: 0,
    responseTime: 0,
    statusMessage: '等待连接...',
    connectedSource: ''
  });
  const [limitUpPotentialCount, setLimitUpPotentialCount] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  
  const signalManager = getOptimizedSignalManager();
  const signalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const marketStatusTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { isAnimating, triggerAnimation } = useAnimation();

  useEffect(() => {
    console.log('SpecialSignal组件初始化');
    try {
      console.log('signalManager.signalHistory.length:', signalManager.getSignalHistory().length);
      loadSignals();
      startSignalGeneration();
      startMarketStatusMonitor().catch(console.error);
      
      const signalListener = () => {
        console.log('特殊信号变化监听器被触发，重新加载信号');
        loadSignals();
      };
      
      signalManager.addListener(signalListener);
      
      return () => {
        if (signalTimerRef.current) clearInterval(signalTimerRef.current);
        if (marketStatusTimerRef.current) clearInterval(marketStatusTimerRef.current);
        signalManager.removeListener(signalListener);
      };
    } catch (error) {
      console.error('SpecialSignal组件初始化失败:', error);
    }
  }, []);

  useEffect(() => {
    console.log('SpecialSignal组件已挂载，准备渲染...');
  }, []);

  const loadSignals = () => {
    const history = signalManager.getSignalHistory();
    
    // 调试：打印所有信号
    console.log('====== 特殊信号页面加载 ======');
    console.log('总信号数量:', history.length);
    console.log('所有信号详情:', history);
    
    // 应用筛选 - 只显示特殊信号和卖出信号
    let filteredHistory = history.filter(signal => {
      // ====== 统一显示条件为35/61，置信度100分 ======
      const TOTAL_CONDITIONS = 61;
      const REQUIRED_CONDITIONS = 35; // 统一要求
      
      const hasEnoughConditions = signal.satisfiedConditions && signal.satisfiedConditions >= REQUIRED_CONDITIONS;
      
      const signalType = signal.type as string;
      const isBuySignal = signalType === 'buy' || signalType === 'strong_buy';
      
      // 特殊信号：涨停潜力股票、龙头股票、翻倍潜力的股票、潜在多倍股票
      const isSpecialSignal = isBuySignal && (signal.isLimitUpPotential || signal.isLeadingStock || signal.isPotentialDouble || signal.isPotentialMultiBagger);
      
      // 卖出信号：所有卖出信号
      const isSellSignal = signalType === 'sell';
      
      if (filterType === 'special') {
        // 只显示特殊信号：35/61，置信度100分
        return isSpecialSignal && signal.confidence >= 100 && hasEnoughConditions;
      } else if (filterType === 'sell') {
        // 卖出信号：不限制条件
        return isSellSignal;
      } else {
        // all - 显示特殊信号和卖出信号
        return (isSpecialSignal && signal.confidence >= 100 && hasEnoughConditions) || isSellSignal;
      }
    });
    
    // 调试：打印过滤后的信号数量
    console.log('过滤后显示数量:', filteredHistory.length);
    console.log('筛选类型:', filterType);
    console.log('过滤前总数:', history.length);
    console.log('被过滤掉的信号数:', history.length - filteredHistory.length);
    
    // 应用排序
    filteredHistory.sort((a, b) => {
      if (sortBy === 'timestamp') {
        return b.timestamp - a.timestamp;
      } else if (sortBy === 'confidence') {
        return b.confidence - a.confidence;
      } else if (sortBy === 'score') {
        return b.score - a.score;
      } else if (sortBy === 'price') {
        return (b.price || 0) - (a.price || 0);
      }
      return 0;
    });
    
    // 计算特殊信号股票数量（统一条件为35/61，置信度100分）
    const specialSignalCount = history.filter(signal => {
      const signalType = signal.type as string;
      const isBuySignal = signalType === 'buy' || signalType === 'strong_buy';
      // 特殊信号包括：涨停潜力股票、龙头股票、翻倍潜力的股票、潜在多倍股票
      const isLimitUpPotential = Boolean(signal.isLimitUpPotential);
      const isLeadingStock = Boolean(signal.isLeadingStock);
      const isPotentialDouble = Boolean(signal.isPotentialDouble);
      const isPotentialMultiBagger = Boolean(signal.isPotentialMultiBagger);
      const isSpecialSignal = isBuySignal && (isLimitUpPotential || isLeadingStock || isPotentialDouble || isPotentialMultiBagger);
      
      // 统一特殊信号显示条件：35/61，置信度100分
      if (isSpecialSignal) {
        const SPECIAL_REQUIRED_CONDITIONS = 35;
        const hasEnoughConditions = signal.satisfiedConditions && signal.satisfiedConditions >= SPECIAL_REQUIRED_CONDITIONS;
        const hasEnoughConfidence = signal.confidence >= 100;
        return hasEnoughConditions && hasEnoughConfidence;
      }
      return false;
    }).length;
    setLimitUpPotentialCount(specialSignalCount);
    
    // 调试日志
    console.log('====== 特殊信号页面加载完成 ======', {
      totalSignals: history.length,
      filteredSignals: filteredHistory.length,
      specialSignalCount: specialSignalCount,
      hasSpecialSignals: specialSignalCount > 0
    });
    
    // 触发动画效果
    triggerAnimation();
    setAnimationKey(prev => prev + 1);
    
    setSignals(filteredHistory);
    const unread = filteredHistory.filter((s: OptimizedSignal) => !s.isRead).length;
    setUnreadCount(unread);
  };

  const startSignalGeneration = () => {
    generateRealTimeSignals();
    signalTimerRef.current = setInterval(() => {
      generateRealTimeSignals();
    }, 3000); // 优化刷新间隔为3秒，与市场监控保持一致
  };

  const generateRealTimeSignals = async () => {
    try {
      // 使用市场监控管理器获取全市场数据，而不是固定的股票列表
      const marketMonitor = getMarketMonitor();
      const marketStatus = await marketMonitor.getStatus();
      
      // 如果市场监控正在运行，等待其完成扫描
      if (marketStatus.isScanning) {
        console.log('市场监控正在扫描中...');
        loadSignals();
        return;
      }
      
      // 如果市场监控未运行，手动触发一次扫描
      await marketMonitor.performScan();
      
      // 重新加载信号
      loadSignals();
    } catch (error) {
      console.error('获取实时数据失败:', error);
    }
  };

  const getMarketMonitorStatus = async () => {
    const marketMonitor = getMarketMonitor();
    const status = await marketMonitor.getStatus();
    setMarketMonitorStatus(status);
  };

  // 新增函数：检查数据源连接状态
  const checkDataSourceStatus = async () => {
    try {
      const startTime = Date.now();
      const stockDataSource = getStockDataSource();
      const sourceName = stockDataSource.constructor.name;
      
      // 将英文类名转换为中文显示
      const getChineseSourceName = (name: string): string => {
        const nameMap: Record<string, string> = {
          'StockDataSource': 'A股数据源',
          'TencentDataSource': '腾讯数据源',
          'SinaDataSource': '新浪数据源',
          'EastMoneyDataSource': '东方财富数据源',
          'AkShareDataSource': 'AkShare数据源'
        };
        return nameMap[name] || '数据服务';
      };
      
      const connectedSource = getChineseSourceName(sourceName);
      
      // 尝试获取一只股票的实时数据来测试连接
      try {
        await stockDataSource.getRealtimeQuote(['600000']);
        const responseTime = Date.now() - startTime;
        
        setDataSourceStatus({
          isConnected: true,
          lastCheckTime: Date.now(),
          responseTime: responseTime,
          statusMessage: '数据源连接成功',
          connectedSource: connectedSource
        });
      } catch (error) {
        // 如果直接获取数据失败，尝试获取K线数据
        try {
          await stockDataSource.getKLineData('600000', 'day', 1);
          const responseTime = Date.now() - startTime;
          setDataSourceStatus({
            isConnected: true,
            lastCheckTime: Date.now(),
            responseTime: responseTime,
            statusMessage: '数据源连接成功（K线模式）',
            connectedSource: connectedSource
          });
        } catch (klineError) {
          throw new Error('数据获取测试失败');
        }
      }
    } catch (error) {
      setDataSourceStatus({
        isConnected: false,
        lastCheckTime: Date.now(),
        responseTime: 0,
        statusMessage: '数据源连接失败: ' + (error as Error).message,
        connectedSource: ''
      });
    }
  };

  const startMarketStatusMonitor = async () => {
    // 启动市场监控器
    const marketMonitor = getMarketMonitor();
    marketMonitor.startMonitoring();
    
    // 立即检查数据源连接状态
    await checkDataSourceStatus();
    await getMarketMonitorStatus();
    
    // 每3秒更新一次市场监控状态，每10秒检查一次数据源连接
    marketStatusTimerRef.current = setInterval(async () => {
      await getMarketMonitorStatus();
      // 每3次市场状态更新后检查一次数据源
      if (Date.now() % 30000 < 3000) {
        await checkDataSourceStatus();
      }
    }, 3000);
  };

  const handleSignalAction = (signal: OptimizedSignal, action: 'execute' | 'ignore') => {
    signalManager.markSignalAsRead(signal.id);
    if (action === 'execute') {
      if (signal.type === 'buy') {
        // 【关键修复】执行买入时，同时添加到持仓记录
        signalManager.addPosition({
          stockCode: signal.stockCode,
          stockName: signal.stockName,
          entryPrice: signal.price || 0,
          volume: 100, // 默认买入100股
          entryTime: Date.now()
        });
        message.success(`已执行买入操作并添加到持仓：${signal.stockName}`);
      } else if (signal.type === 'sell') {
        message.success(`已执行卖出操作：${signal.stockName}`);
      }
    } else {
      message.info('已忽略该信号');
    }
    setUnreadCount(prev => Math.max(0, prev - 1));
    loadSignals();
  };

  const handleDeleteSignal = async (signal: OptimizedSignal) => {
    try {
      await signalManager.deleteSignal(signal.id);
      message.success(`已删除信号：${signal.stockName}`);
      loadSignals();
    } catch (error) {
      message.error('删除信号失败：' + (error as Error).message);
    }
  };

  const getSignalTag = (type: string) => {
    const tagMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      buy: { color: 'green', text: '买入', icon: <CheckCircleOutlined /> },
      sell: { color: 'red', text: '卖出', icon: <CloseCircleOutlined /> },
      hold: { color: 'gold', text: '持有', icon: <ExclamationCircleOutlined /> },
      strong_buy: { color: 'lime', text: '特殊买入', icon: <StarOutlined /> }
    };
    return tagMap[type] || tagMap.hold;
  };

  // 添加删除历史信号的方法
  const handleClearHistory = () => {
    setModalVisible(true);
  };

  const confirmClearHistory = async () => {
    await signalManager.clearSignalHistory();
    setModalVisible(false);
    loadSignals();
    message.success('历史信号已清空');
  };
  
  const realtimeSignalsTab = {
    key: '1',
    label: <span><Badge count={unreadCount}><FireOutlined />特殊信号</Badge></span>,
    children: (
      <div>
        <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="特殊信号" value={signals.filter(s => s.type !== 'sell').length} valueStyle={{ color: '#cf1322' }} prefix={<FireOutlined />} /></Card></Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ margin: '2px' }}>
              <Statistic 
                title="卖出信号" 
                value={signals.filter(s => s.type === 'sell').length} 
                valueStyle={{ 
                  color: '#cf1322',
                  animation: signals.filter(s => s.type === 'sell').length > 0 ? 'pulse 1s infinite' : 'none',
                  fontWeight: 'bold',
                  fontSize: '28px'
                }} 
                prefix={<CloseCircleOutlined />} 
              />
              {signals.filter(s => s.type === 'sell').length > 0 && (
                <div style={{ fontSize: '11px', color: '#cf1322', marginTop: '4px', textAlign: 'center' }}>
                  ⚠️ 有股票需要卖出
                </div>
              )}
            </Card>
          </Col>
          <Col xs={12} sm={6}><Card size="small" style={{ margin: '2px' }}><Statistic title="未读信号" value={unreadCount} valueStyle={{ color: '#1890ff' }} prefix={<BellOutlined />} /></Card></Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ margin: '2px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="primary" 
                  icon={<ReloadOutlined />} 
                  onClick={async () => { 
                    setLoading(true); 
                    await generateRealTimeSignals(); 
                    setLoading(false); 
                  }}
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

        {/* 筛选和排序控件 */}
        <Card size="small" style={{ margin: '2px 2px 8px 2px' }}>
          <Row gutter={[8, 8]} align="middle">
            <Col xs={12} sm={8}>
              <Space size="small">
                <span style={{ fontSize: '12px', color: '#666' }}>筛选:</span>
                <Select 
                  size="small" 
                  value={filterType} 
                  onChange={setFilterType} 
                  style={{ width: '120px' }}
                >
                  <Select.Option value="all">全部</Select.Option>
                  <Select.Option value="special">特殊信号</Select.Option>
                  <Select.Option value="sell">卖出信号</Select.Option>
                </Select>
              </Space>
            </Col>
            <Col xs={12} sm={8}>
              <Space size="small">
                <span style={{ fontSize: '12px', color: '#666' }}>排序:</span>
                <Select 
                  size="small" 
                  value={sortBy} 
                  onChange={setSortBy} 
                  style={{ width: '120px' }}
                >
                  <Select.Option value="timestamp">时间</Select.Option>
                  <Select.Option value="confidence">置信度</Select.Option>
                  <Select.Option value="score">评分</Select.Option>
                  <Select.Option value="price">价格</Select.Option>
                </Select>
              </Space>
            </Col>
            <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
              <Button 
                size="small" 
                icon={<FilterOutlined />} 
                onClick={loadSignals}
              >
                应用筛选
              </Button>
            </Col>
          </Row>
        </Card>

        {/* A股全市场监控状态提示 */}
        {marketMonitorStatus && (
          <Card size="small" style={{ margin: '2px 2px 8px 2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#666', fontSize: '12px' }}>市场状态:</span>
                <Tag color={marketMonitorStatus.marketStatus === 'open' ? 'green' : marketMonitorStatus.marketStatus === 'auction' ? 'orange' : 'default'}>
                  {marketMonitorStatus.marketStatus === 'open' ? '开盘' : marketMonitorStatus.marketStatus === 'auction' ? '集合竞价' : '收盘'}
                </Tag>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#666', fontSize: '12px' }}>监控股票:</span>
                <span style={{ fontWeight: 'bold' }}>{marketMonitorStatus.stockCount}</span>
                <span style={{ color: '#666', fontSize: '12px' }}>只</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#666', fontSize: '12px' }}>扫描状态:</span>
                <Tag color={marketMonitorStatus.isScanning ? 'blue' : 'default'}>
                  {marketMonitorStatus.isScanning ? '扫描中' : '空闲'}
                </Tag>
              </div>
              {marketMonitorStatus.lastScanTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#666', fontSize: '12px' }}>最后扫描:</span>
                  <span style={{ fontSize: '11px', color: '#999' }}>
                    {new Date(marketMonitorStatus.lastScanTime).toLocaleTimeString('zh-CN')}
                  </span>
                </div>
              )}
              {marketMonitorStatus.activeScans > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#666', fontSize: '12px' }}>活跃扫描:</span>
                  <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{marketMonitorStatus.activeScans}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* 数据源连接状态显示栏 */}
        <Card size="small" style={{ margin: '2px 2px 8px 2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#666', fontSize: '12px' }}>数据源:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div 
                  style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: dataSourceStatus.isConnected ? '#52c41a' : '#ff4d4f',
                    boxShadow: dataSourceStatus.isConnected ? '0 0 6px #52c41a' : '0 0 6px #ff4d4f'
                  }} 
                />
                <Tag color={dataSourceStatus.isConnected ? 'green' : 'red'}>
                  {dataSourceStatus.isConnected ? '连接正常' : '连接失败'}
                </Tag>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#666', fontSize: '12px' }}>响应时间:</span>
              <span 
                style={{ 
                  fontWeight: 'bold',
                  color: dataSourceStatus.responseTime < 500 ? '#52c41a' : dataSourceStatus.responseTime < 2000 ? '#faad14' : '#ff4d4f',
                  fontSize: '14px'
                }}
              >
                {dataSourceStatus.responseTime}ms
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
              <span style={{ color: '#666', fontSize: '12px' }}>状态信息:</span>
              <span 
                style={{ 
                  fontSize: '12px',
                  color: dataSourceStatus.isConnected ? '#52c41a' : '#ff4d4f'
                }}
              >
                {dataSourceStatus.statusMessage}
                {dataSourceStatus.connectedSource && ` (${dataSourceStatus.connectedSource})`}
              </span>
            </div>
            
            <Button 
              size="small" 
              type="default"
              icon={<ReloadOutlined />}
              onClick={async () => {
                setLoading(true);
                await checkDataSourceStatus();
                setLoading(false);
              }}
              loading={loading}
            >
              检查连接
            </Button>
          </div>
        </Card>



        {signals.length === 0 ? (
          <Alert
            message="正在监控市场..."
            description="AI正在实时监控市场，一旦发现特殊机会将立即发出信号。请稍候..."
            type="info"
            showIcon
          />
        ) : (
          <List 
            key={animationKey}
            dataSource={signals} 
            renderItem={(item) => {
              const tagInfo = getSignalTag(item.type);
              return (
                <List.Item key={item.id}>
                  <Card 
                    size="small" 
                    style={{ 
                      width: '100%', 
                      margin: '2px',
                      animation: isAnimating ? 'fadeIn 0.5s ease-in-out' : 'none',
                      border: (item.isLimitUpPotential || item.isLeadingStock || item.isPotentialDouble || item.isPotentialMultiBagger) ? '2px solid #cf1322' : '1px solid #e8e8e8',
                      boxShadow: (item.isLimitUpPotential || item.isLeadingStock || item.isPotentialDouble || item.isPotentialMultiBagger) ? '0 0 8px rgba(207, 19, 34, 0.3)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          {(item.isLimitUpPotential || item.isLeadingStock || item.isPotentialDouble || item.isPotentialMultiBagger) && <span style={{ fontSize: '16px' }}>🔥</span>}
                          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.stockName}</span>
                          <span style={{ color: '#666' }}>{item.stockCode}</span>
                          <Tag color={tagInfo.color} icon={tagInfo.icon}>{tagInfo.text}</Tag>
                          {item.isLimitUpPotential && <Tag color="red" style={{ border: '2px solid #cf1322', fontWeight: 'bold' }}>🔥 涨停潜力</Tag>}
                          {item.isLeadingStock && <Tag color="blue" style={{ border: '2px solid #1890ff', fontWeight: 'bold' }}>🏆 龙头股票</Tag>}
                          {item.isPotentialDouble && <Tag color="green" style={{ border: '2px solid #52c41a', fontWeight: 'bold' }}>🚀 翻倍潜力</Tag>}
                          {item.isPotentialMultiBagger && <Tag color="purple" style={{ border: '2px solid #722ed1', fontWeight: 'bold' }}>⭐ 多倍潜力</Tag>}
                          {!item.isRead && <Tag color="blue">新</Tag>}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          {item.price !== undefined && (
                            <Tooltip title="当前价格">
                              <span><DollarOutlined style={{ fontSize: '12px' }} /> 价格：<strong>{item.price.toFixed(2)}</strong></span>
                            </Tooltip>
                          )}
                          {item.targetPrice !== undefined && (
                            <Tooltip title="目标价格">
                              <span><ArrowUpOutlined style={{ fontSize: '12px' }} /> 目标：<strong>{item.targetPrice.toFixed(2)}</strong></span>
                            </Tooltip>
                          )}
                          {item.buyPriceRange && (
                            <Tooltip title="建议买入价格区间">
                              <span><ArrowUpOutlined style={{ fontSize: '12px' }} /> 买入区间：<strong style={{ color: '#3f8600' }}>{item.buyPriceRange.lower.toFixed(2)}-{item.buyPriceRange.upper.toFixed(2)}</strong></span>
                            </Tooltip>
                          )}
                          {item.sellPriceRange && (
                            <Tooltip title="建议卖出价格区间">
                              <span><ArrowDownOutlined style={{ fontSize: '12px' }} /> 卖出区间：<strong style={{ color: '#cf1322' }}>{item.sellPriceRange.lower.toFixed(2)}-{item.sellPriceRange.upper.toFixed(2)}</strong></span>
                            </Tooltip>
                          )}
                          <Tooltip title="信号置信度">
                            <span>置信度：</span><Progress percent={item.confidence} size="small" style={{ width: '80px' }} />
                          </Tooltip>
                          <Tooltip title="综合评分">
                            <span><StarOutlined style={{ fontSize: '12px' }} /> 评分：<strong>{item.score.toFixed(2)}</strong></span>
                          </Tooltip>
                          {item.mainForceFlow && (
                            <Tooltip title="主力资金净流入">
                              <span><LineChartOutlined style={{ fontSize: '12px' }} /> 主力资金：<strong style={{ color: item.mainForceFlow >= 0 ? '#3f8600' : '#cf1322' }}>
                                {(item.mainForceFlow / 100000000).toFixed(2)}亿
                              </strong></span>
                            </Tooltip>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          {item.reason}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          <ClockCircleOutlined /> {new Date(item.timestamp).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <Space direction="vertical">
                        {!item.isRead && (
                          <>
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
                          </>
                        )}
                        <Button 
                          size="small"
                          style={{ color: '#cf1322', borderColor: '#cf1322' }}
                          onClick={() => handleDeleteSignal(item)}
                        >
                          删除
                        </Button>
                      </Space>
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

                      </Space>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        <ClockCircleOutlined /> {new Date(item.timestamp).toLocaleString('zh-CN')} | {item.reason}
                      </div>
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                        置信度: {item.confidence.toFixed(2)}% | 评分: {item.score.toFixed(2)}
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
            <Col xs={24} sm={8}><Form.Item label="买入信号"><Switch checked={signalConfig.buyEnabled} checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked) => setSignalConfig((prev: typeof signalConfig) => ({ ...prev, buyEnabled: checked }))} /></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item label="卖出信号"><Switch checked={signalConfig.sellEnabled} checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked) => setSignalConfig((prev: typeof signalConfig) => ({ ...prev, sellEnabled: checked }))} /></Form.Item></Col>
            <Col xs={24} sm={8}><Form.Item label="持有信号"><Switch checked={signalConfig.holdEnabled} checkedChildren="开启" unCheckedChildren="关闭" onChange={(checked) => setSignalConfig((prev: typeof signalConfig) => ({ ...prev, holdEnabled: checked }))} /></Form.Item></Col>
          </Row>
          <Row gutter={[2, 2]}>
            <Col xs={24} sm={12}><Form.Item label="最低置信度"><InputNumber min={50} max={95} value={signalConfig.minConfidence} addonAfter="%" style={{ width: '100%' }} onChange={(value) => setSignalConfig((prev: typeof signalConfig) => ({ ...prev, minConfidence: value || 60 }))} /></Form.Item></Col>
            <Col xs={24} sm={12}><Form.Item label="扫描间隔"><Select value={signalConfig.scanInterval} style={{ width: '100%' }} onChange={(value) => setSignalConfig((prev: typeof signalConfig) => ({ ...prev, scanInterval: value as number }))}><Option value={1}>1秒</Option><Option value={5}>5秒</Option><Option value={10}>10秒</Option><Option value={30}>30秒</Option><Option value={60}>1分钟</Option></Select></Form.Item></Col>
          </Row>
          <Form.Item><Space><Button type="primary" icon={<FilterOutlined />} onClick={() => {
              // 保存配置到localStorage
              localStorage.setItem('signalConfig', JSON.stringify(signalConfig));
              message.success('配置已保存');
            }}>应用配置</Button><Button onClick={() => {
              const defaultConfig = { buyEnabled: true, sellEnabled: true, holdEnabled: false, minConfidence: 60, scanInterval: 5 };
              setSignalConfig(defaultConfig);
              localStorage.setItem('signalConfig', JSON.stringify(defaultConfig));
              message.success('已重置为默认配置');
            }}>重置默认</Button></Space></Form.Item>
        </Form>
      </Card>
    )
  };

  return (
    <div className="special-signal-page">
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

export default SpecialSignal;
