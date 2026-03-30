import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Row, Col, Card, Button, Input, Statistic, List, Tag, Space, message, Spin, Skeleton, Badge, Switch, Progress, Tooltip, Modal } from 'antd';
import { ReloadOutlined, SearchOutlined, StarOutlined, ShareAltOutlined, AppstoreOutlined, RiseOutlined, FallOutlined, ArrowUpOutlined, ArrowDownOutlined, FireOutlined, BellOutlined, CloseCircleOutlined, PlayCircleOutlined, PauseCircleOutlined, SyncOutlined, LineChartOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { getRealtimeQuote, getStockDataSource } from '../../utils/stockData';
import { getRealTimeManager } from '../../utils/realtimeData';
import { debounce } from '../../utils/performance';
import * as SignalManager from '../../utils/optimizedSignalManager';
import { getWatchlist, saveWatchlist, removeFromWatchlist } from '../../utils/storage';
import { startMarketMonitoring, stopMarketMonitoring, scanMarketNow, getMarketMonitor } from '../../utils/marketMonitorManager';
import { PredictionVisualization } from '../../components/PredictionVisualization/PredictionVisualization';
import './Dashboard.css';

interface Stock {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const Dashboard = React.memo(() => {
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [unreadSignalCount, setUnreadSignalCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 全市场监控状态
  const [marketMonitoring, setMarketMonitoring] = useState(false);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState('就绪');
  const marketMonitor = getMarketMonitor();
  
  // 从本地存储读取自选股
  const [stocks, setStocks] = useState<Stock[]>(() => {
    const savedStocks = getWatchlist();
    if (savedStocks && savedStocks.length > 0) {
      // 使用类型断言确保类型安全
      return savedStocks.map(stock => ({
        code: stock.code,
        name: stock.name,
        price: 0,
        change: 0,
        changePercent: 0
      }));
    }
    // 如果本地存储没有数据，使用默认股票数据
    const defaultStocks = [
      { code: 'sh600519', name: '贵州茅台', price: 0, change: 0, changePercent: 0 },
      { code: 'sz000858', name: '五粮液', price: 0, change: 0, changePercent: 0 },
      { code: 'sz300750', name: '宁德时代', price: 0, change: 0, changePercent: 0 },
      { code: 'sh601318', name: '中国平安', price: 0, change: 0, changePercent: 0 },
      { code: 'sh600276', name: '恒瑞医药', price: 0, change: 0, changePercent: 0 }
    ];
    // 保存默认股票到本地存储
    saveWatchlist(defaultStocks);
    return defaultStocks;
  });

  const [marketData, setMarketData] = useState([
      { name: '上证指数', value: 0, change: 0, changePercent: 0 },
      { name: '深证成指', value: 0, change: 0, changePercent: 0 },
      { name: '创业板指', value: 0, change: 0, changePercent: 0 },
      { name: '科创50', value: 0, change: 0, changePercent: 0 },
    ]);

  const [latestSignals, setLatestSignals] = useState<any[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // 预测模态框状态
  const [predictionModalVisible, setPredictionModalVisible] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ code: string; name: string } | null>(null);
  
  const signalManager = SignalManager.getOptimizedSignalManager();
  const stockDataSource = getStockDataSource();

  // 实时更新数据
  const updateRealtimeData = useCallback(async () => {
    try {
      console.log('=== 开始更新实时数据 ===');
      
      // 更新自选股数据
      if (stocks.length > 0) {
        const codes = stocks.map(stock => stock.code);
        console.log('自选股代码:', codes);
        
        const results = await getRealtimeQuote(codes);
        console.log('获取到的自选股数据:', JSON.stringify(results, null, 2));
        
        if (results && results.length > 0) {
          console.log('成功获取到', results.length, '个自选股数据');
          // 创建代码到数据的映射，确保数据匹配（支持带前缀和不带前缀的代码）
          const resultMap = new Map();
          results.forEach(r => {
            // 同时保存带前缀和不带前缀的代码映射
            resultMap.set(r.code, r);
            if (r.code.startsWith('sh') || r.code.startsWith('sz')) {
              resultMap.set(r.code.substring(2), r);
            } else {
              const prefixedCode = r.code.startsWith('6') ? `sh${r.code}` : `sz${r.code}`;
              resultMap.set(prefixedCode, r);
            }
          });
          const updatedStocks = stocks.map(stock => {
            // 尝试匹配多种代码格式
            let result = resultMap.get(stock.code);
            // 如果没找到，尝试带前缀的格式
            if (!result && !stock.code.startsWith('sh') && !stock.code.startsWith('sz')) {
              const prefixedCode = stock.code.startsWith('6') ? `sh${stock.code}` : `sz${stock.code}`;
              result = resultMap.get(prefixedCode);
            }
            console.log(`匹配代码: ${stock.code}, 找到数据: ${!!result}`);
            return result ? {
              code: result.code,
              name: result.name,
              price: result.price,
              change: result.change,
              changePercent: result.changePercent
            } : stock;
          });
          console.log('准备更新自选股数据:', JSON.stringify(updatedStocks, null, 2));
          // 使用批量更新，减少渲染次数
          setStocks(updatedStocks);
          // 保存到本地存储
          saveWatchlist(updatedStocks);
          console.log('自选股数据已更新');
        } else {
          console.warn('未获取到自选股数据，继续使用当前数据');
        }
      }
      
      // 更新市场指数数据
      const indexCodes = ['sh000001', 'sz399001', 'sz399006', 'sh000688'];
      console.log('开始获取指数数据，代码:', indexCodes);
      console.log('时间戳:', Date.now());
      try {
        const indexResults = await getRealtimeQuote(indexCodes);
        console.log('获取到的指数数据:', JSON.stringify(indexResults, null, 2));
        
        if (indexResults && indexResults.length > 0) {
          console.log('成功获取到', indexResults.length, '个指数数据');
          console.log('指数数据详情:', JSON.stringify(indexResults, null, 2));
          // 详细检查每个指数的数据
          indexResults.forEach(quote => {
            console.log(`详细检查 ${quote.name}: 代码=${quote.code}, 价格=${quote.price}, 涨跌幅=${quote.changePercent}%`);
            if (quote.price < 100 && (quote.code === 'sh000001' || quote.code === 'sh000688')) {
              console.log(`⚠️  ${quote.name} 数据异常: 价格 ${quote.price} 过低`);
            }
          });
          // 创建代码到数据的映射（支持带前缀和不带前缀的代码）
          const indexMap = new Map();
          indexResults.forEach(r => {
            // 同时保存带前缀和不带前缀的代码映射
            indexMap.set(r.code, r);
            if (r.code.startsWith('sh') || r.code.startsWith('sz')) {
              indexMap.set(r.code.substring(2), r);
            } else {
              const prefixedCode = r.code.startsWith('6') || r.code.startsWith('000') ? `sh${r.code}` : `sz${r.code}`;
              indexMap.set(prefixedCode, r);
            }
          });
          console.log('指数映射:', Array.from(indexMap.keys()));
          const updatedMarketData = [
            { name: '上证指数', value: indexMap.get('sh000001')?.price || indexMap.get('000001')?.price || 0, change: indexMap.get('sh000001')?.change || indexMap.get('000001')?.change || 0, changePercent: indexMap.get('sh000001')?.changePercent || indexMap.get('000001')?.changePercent || 0 },
            { name: '深证成指', value: indexMap.get('sz399001')?.price || indexMap.get('399001')?.price || 0, change: indexMap.get('sz399001')?.change || indexMap.get('399001')?.change || 0, changePercent: indexMap.get('sz399001')?.changePercent || indexMap.get('399001')?.changePercent || 0 },
            { name: '创业板指', value: indexMap.get('sz399006')?.price || indexMap.get('399006')?.price || 0, change: indexMap.get('sz399006')?.change || indexMap.get('399006')?.change || 0, changePercent: indexMap.get('sz399006')?.changePercent || indexMap.get('399006')?.changePercent || 0 },
            { name: '科创综指', value: indexMap.get('sh000688')?.price || indexMap.get('000688')?.price || 0, change: indexMap.get('sh000688')?.change || indexMap.get('000688')?.change || 0, changePercent: indexMap.get('sh000688')?.changePercent || indexMap.get('000688')?.changePercent || 0 },
          ];
          console.log('准备更新市场数据:', JSON.stringify(updatedMarketData, null, 2));
          setMarketData(updatedMarketData);
          console.log('市场数据已更新为真实数据');
        } else {
          console.warn('未获取到指数数据，继续使用当前数据');
        }
      } catch (error) {
        console.error('获取指数数据失败:', error);
        console.error('错误详情:', JSON.stringify(error, null, 2));
      }
      
      setLastUpdateTime(new Date());
      setLoadingStocks(false);
      console.log('=== 实时数据更新完成 ===');
    } catch (error) {
      console.error('更新实时数据失败:', error);
      console.error('错误详情:', JSON.stringify(error, null, 2));
      setLoadingStocks(false);
      message.error('数据更新失败，请稍后重试');
    }
  }, [stocks]);

  // 集成实时数据监听 - 已移除模拟数据，只使用真实API数据

  // 自动更新
  useEffect(() => {
    console.log('autoUpdate状态:', autoUpdate);
    if (autoUpdate) {
      console.log('启动自动更新定时器，每5秒更新一次');
      intervalRef.current = setInterval(() => {
        console.log('定时器触发，调用updateRealtimeData()');
        updateRealtimeData();
      }, 5000); // 每5秒更新一次
    } else {
      console.log('关闭自动更新定时器');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        console.log('清理定时器');
        clearInterval(intervalRef.current);
      }
    };
  }, [autoUpdate, updateRealtimeData]);

  // 加载最新信号
  const loadLatestSignals = useCallback(() => {
    try {
      const signalHistory = signalManager.getSignalHistory();
      const latest = signalHistory.slice(0, 5);
      setLatestSignals(latest);
    } catch (error) {
      console.error('加载信号失败:', error);
    }
  }, [signalManager]);

  // 初始加载数据
  useEffect(() => {
    console.log('开始初始加载数据...');
    const loadAllData = async () => {
      try {
        console.log('正在调用updateRealtimeData()...');
        // 并行加载数据，提升加载速度
        await Promise.all([
          updateRealtimeData(),
          loadLatestSignals()
        ]);
        console.log('初始数据加载完成');
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        // 所有数据加载完成后设置初始加载为false
        setInitialLoading(false);
      }
    };
    
    loadAllData();
  }, [updateRealtimeData, loadLatestSignals]);

  // 定期更新信号
  useEffect(() => {
    // 每10秒更新一次信号
    const signalTimer = setInterval(() => {
      loadLatestSignals();
    }, 10000);

    return () => {
      if (signalTimer) {
        clearInterval(signalTimer);
      }
    };
  }, [loadLatestSignals]);

  const handleToggleAutoUpdate = useCallback(() => {
    setAutoUpdate(!autoUpdate);
    message.success(autoUpdate ? '自动更新已关闭' : '自动更新已开启');
  }, [autoUpdate]);

  const handleManualUpdate = useCallback(() => {
    setLoadingStocks(true);
    updateRealtimeData();
    message.success('数据已更新');
  }, [updateRealtimeData]);

  // 全市场监控控制函数
  const handleToggleMarketMonitoring = useCallback(() => {
    if (marketMonitoring) {
      stopMarketMonitoring();
      setMarketMonitoring(false);
      message.success('全市场监控已停止');
    } else {
      startMarketMonitoring();
      setMarketMonitoring(true);
      message.success('全市场监控已启动');
    }
  }, [marketMonitoring]);

  const handleScanMarketNow = useCallback(async () => {
    if (monitoringLoading) return;
    
    setMonitoringLoading(true);
    setScanStatus('正在扫描全市场...');
    setScanProgress(10);
    
    try {
      await scanMarketNow();
      setScanProgress(100);
      setScanStatus('扫描完成');
      message.success('全市场扫描已完成');
      
      // 延迟重置进度条
      setTimeout(() => {
        setScanProgress(0);
        setScanStatus('就绪');
      }, 2000);
    } catch (error) {
      message.error('扫描失败，请稍后重试');
      setScanStatus('扫描失败');
      setScanProgress(0);
    } finally {
      setMonitoringLoading(false);
    }
  }, [monitoringLoading]);

  // 监听监控状态变化
  useEffect(() => {
    const checkMonitoringStatus = () => {
      const isMonitoring = marketMonitor.isMonitoring();
      if (isMonitoring !== marketMonitoring) {
        setMarketMonitoring(isMonitoring);
      }
    };

    // 初始检查
    checkMonitoringStatus();

    // 定期检查状态
    const statusCheckInterval = setInterval(checkMonitoringStatus, 5000);

    return () => clearInterval(statusCheckInterval);
  }, [marketMonitoring, marketMonitor]);

  // 删除自选股
  const handleRemoveStock = useCallback((code: string, name: string) => {
    setStocks(prevStocks => {
      const updatedStocks = prevStocks.filter(stock => stock.code !== code);
      saveWatchlist(updatedStocks);
      return updatedStocks;
    });
    message.success(`已删除股票：${name}(${code})`);
  }, []);

  // 查看预测分析
  const handleViewPrediction = useCallback((stock: Stock) => {
    setSelectedStock({ code: stock.code, name: stock.name });
    setPredictionModalVisible(true);
  }, []);

  // 关闭预测模态框
  const handleClosePrediction = useCallback(() => {
    setPredictionModalVisible(false);
    setSelectedStock(null);
  }, []);

  // 防抖搜索
  const debouncedSearch = useMemo(() => {
    return debounce(async () => {
      if (!searchCode) {
        message.error('请输入股票代码');
        return;
      }
      
      // 自动添加市场前缀
      let formattedCode = searchCode;
      if (!searchCode.startsWith('sh') && !searchCode.startsWith('sz')) {
        if (searchCode.startsWith('6')) {
          formattedCode = `sh${searchCode}`;
        } else {
          formattedCode = `sz${searchCode}`;
        }
      }
      
      setLoading(true);
      try {
        const results = await getRealtimeQuote([formattedCode]);
        if (results && results.length > 0) {
          const stock = results[0];
          // 检查是否已在列表中
          const existingIndex = stocks.findIndex(s => s.code === stock.code);
          if (existingIndex >= 0) {
            // 更新现有股票
            const updatedStocks = [...stocks];
            updatedStocks[existingIndex] = {
              code: stock.code,
              name: stock.name,
              price: stock.price,
              change: stock.change,
              changePercent: stock.changePercent
            };
            setStocks(updatedStocks);
            message.success(`已更新股票：${stock.name}(${stock.code})`);
          } else {
            // 添加新股票
            const newStock = {
              code: stock.code,
              name: stock.name,
              price: stock.price,
              change: stock.change,
              changePercent: stock.changePercent
            };
            setStocks(prevStocks => {
              const updatedStocks = [...prevStocks, newStock];
              // 保存到本地存储
              saveWatchlist(updatedStocks);
              return updatedStocks;
            });
            message.success(`已添加股票：${stock.name}(${stock.code})`);
          }
        } else {
          message.error('未找到该股票');
        }
      } catch (error) {
        message.error('搜索失败，请稍后重试');
        console.error('搜索失败:', error);
      } finally {
        setLoading(false);
      }
    }, 300); // 减少防抖时间，提升响应速度
  }, [searchCode, stocks]);

  const handleSearch = useCallback(() => {
    debouncedSearch();
  }, [debouncedSearch]);

  const formatLastUpdate = useCallback(() => {
    if (!lastUpdateTime) return '尚未更新';
    return lastUpdateTime.toLocaleTimeString('zh-CN');
  }, [lastUpdateTime]);

  // 计算市场数据的样式
  const marketDataItems = useMemo(() => {
    if (loadingStocks) {
      return Array(4).fill(0).map((_, index) => (
        <Col xs={24} sm={12} md={8} key={index}>
          <Card size="small" style={{ margin: '2px' }}>
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          </Card>
        </Col>
      ));
    }
    return marketData.map((market, index) => (
      <Col xs={24} sm={12} md={8} key={index}>
        <Card size="small" style={{ margin: '2px' }}>
          <Statistic
            title={market.name}
            value={market.value}
            precision={2}
            valueStyle={{ color: market.change >= 0 ? '#cf1322' : '#3f8600', fontSize: '16px' }}
            prefix={market.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            suffix={
              <span style={{ fontSize: '10px' }}>
                ({market.change >= 0 ? '+' : ''}{market.change.toFixed(2)}, {market.changePercent >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%)
              </span>
            }
          />
        </Card>
      </Col>
    ));
  }, [marketData, loadingStocks]);

  return (
    <div className="dashboard" style={{ padding: 0, margin: 0 }}>
      {initialLoading ? (
        <div style={{ padding: '20px' }}>
          <Skeleton active paragraph={{ rows: 10 }} />
        </div>
      ) : (
        <>
          <Card style={{ marginBottom: '2px', borderRadius: '4px', margin: '2px' }} size="small">
            <Row gutter={[2, 2]} align="middle">
              <Col xs={20} sm={8} md={6}>
                <Input
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="输入股票代码"
                  size="small"
                  prefix={<SearchOutlined />}
                  suffix={<ReloadOutlined style={{ cursor: 'pointer' }} onClick={handleManualUpdate} />}
                />
              </Col>
              <Col xs={4} sm={2} md={2}>
                <Button type="primary" size="small" icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
                  搜索
                </Button>
              </Col>
              <Col xs={24} sm={12} md={14} style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                </div>
              </Col>
              <Col xs={24} sm={8} md={8} style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#666' }}>自动更新: {autoUpdate ? '开启' : '关闭'}</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>最后更新: {formatLastUpdate()}</span>
                </div>
              </Col>
            </Row>
          </Card>

          {/* 全市场监控控制面板 */}
          <Card style={{ marginBottom: '2px', borderRadius: '4px', margin: '2px' }} size="small">
            <Row gutter={[2, 2]} align="middle">
              <Col xs={24} sm={12} md={6}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#666' }}>全市场监控:</span>
                  <Switch 
                    checked={marketMonitoring} 
                    onChange={handleToggleMarketMonitoring}
                    checkedChildren={<PlayCircleOutlined />}
                    unCheckedChildren={<PauseCircleOutlined />}
                  />
                </div>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Button 
                  type="primary" 
                  size="small" 
                  icon={<SyncOutlined />} 
                  onClick={handleScanMarketNow}
                  loading={monitoringLoading}
                  disabled={monitoringLoading}
                >
                  立即扫描
                </Button>
              </Col>
              <Col xs={24} sm={24} md={12} style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                  <span style={{ color: '#666' }}>状态: {scanStatus}</span>
                  <Progress 
                    percent={scanProgress} 
                    size="small" 
                    style={{ flex: 1 }}
                    status={scanStatus === '扫描失败' ? 'exception' : scanStatus === '扫描完成' ? 'success' : 'active'}
                  />
                </div>
              </Col>
            </Row>
          </Card>

      <Row gutter={[2, 2]} style={{ marginBottom: '2px' }}>
        {marketDataItems}
      </Row>

      <Card size="small" title="自选股" style={{ margin: '2px' }}>
        {loadingStocks ? (
          <div>
            {Array(5).fill(0).map((_, index) => (
              <List.Item key={index}>
                <Skeleton active paragraph={{ rows: 1 }} title={false} />
              </List.Item>
            ))}
          </div>
        ) : (
          <List
            dataSource={stocks}
            renderItem={(stock) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    size="small"
                    icon={<LineChartOutlined />}
                    onClick={() =>handleViewPrediction(stock)}
                    style={{ color: '#1890ff' }}
                  >
                    预测
                  </Button>,
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<CloseCircleOutlined />}
                    onClick={() =>handleRemoveStock(stock.code, stock.name)}
                  >
                    删除
                  </Button>
                ]}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <div>
                    <Space>
                      <span style={{ fontWeight: 'bold' }}>{stock.name}</span>
                      <span style={{ color: '#666' }}>{stock.code}</span>
                    </Space>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: stock.change >= 0 ? '#cf1322' : '#3f8600' }}>
                      {stock.price.toFixed(2)}
                    </div>
                    <Tag color={stock.change >= 0 ? 'red' : 'green'}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </Tag>
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Card size="small" title="最新信号分析" style={{ margin: '2px' }}>
        <List
          dataSource={latestSignals}
          renderItem={(signal, index) => (
            <List.Item key={index} style={{ padding: '6px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                  <Tag color={signal.type === 'buy' ? 'red' : 'green'} style={{ fontSize: '12px', padding: '2px 8px' }}>
                    {signal.type === 'buy' ? <RiseOutlined /> : <FallOutlined />}
                    {signal.type === 'buy' ? '买入' : '卖出'}
                  </Tag>
                  <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{signal.stockName}</span>
                  <span style={{ color: '#666', fontSize: '12px' }}>{signal.stockCode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666', marginTop: '2px' }}>
                  <div style={{ flex: 1, marginRight: '8px' }}>
                    {signal.reason}
                  </div>
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                      信心 {signal.confidence}%
                    </div>
                    <div style={{ marginTop: '2px' }}>
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
          locale={{ emptyText: '暂无信号' }}
        />
      </Card>
        {/* 预测分析模态框 */}<Modal
          title="AI智能预测分析"
          open={predictionModalVisible}
          onCancel={handleClosePrediction}
          footer={null}
          width={1200}
          destroyOnClose
        >
          {selectedStock && (<PredictionVisualization
              stockCode={selectedStock.code}
              stockName={selectedStock.name}
            />)}
        </Modal>
        </>
      )}
    </div>
  );
});

export default Dashboard;
