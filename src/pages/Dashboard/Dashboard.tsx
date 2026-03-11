import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Row, Col, Card, Button, Input, Statistic, List, Tag, Space, message, Spin, Skeleton, Badge, Alert, Progress, Tooltip } from 'antd';
import { ReloadOutlined, SearchOutlined, StarOutlined, ShareAltOutlined, AppstoreOutlined, RiseOutlined, FallOutlined, ArrowUpOutlined, ArrowDownOutlined, FireOutlined, LikeOutlined, WarningOutlined, LineChartOutlined, BellOutlined, TeamOutlined, BarChartOutlined, DollarOutlined, EyeOutlined } from '@ant-design/icons';
import * as echarts from 'echarts';
import { getRealtimeQuote, getStockDataSource, getMainForceData } from '../../utils/stockData';
import { getPersonalizedRecommendation, StockRecommendation } from '../../utils/personalizedRecommendation';
import { startMockRealTimeData } from '../../utils/realtimeData';
import { debounce } from '../../utils/performance';
import * as SignalManager from '../../utils/optimizedSignalManager';
import { getMainForceTracker, type MainForceData } from '../../utils/mainForceTracker';
import { getRiskManager } from '../../utils/riskManagement';
import './Dashboard.css';

interface Stock {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const Dashboard = React.memo(() => {
  const [searchCode, setSearchCode] = useState('002594');
  const [loading, setLoading] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [loadingStocks, setLoadingStocks] = useState(true);
  const [loadingMainForce, setLoadingMainForce] = useState(false);
  const [mainForceData, setMainForceData] = useState<MainForceData[]>([]);
  const [unreadSignalCount, setUnreadSignalCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mainForceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [stocks, setStocks] = useState<Stock[]>([
    { code: '002594', name: '比亚迪', price: 185.6, change: 3.2, changePercent: 1.75 },
    { code: '300750', name: '宁德时代', price: 210.8, change: -1.5, changePercent: -0.71 },
    { code: '600519', name: '贵州茅台', price: 1856.0, change: 0.8, changePercent: 0.04 },
    { code: '000001', name: '平安银行', price: 17.5, change: 0.3, changePercent: 1.74 },
    { code: '601318', name: '中国平安', price: 48.2, change: -0.8, changePercent: -1.63 },
  ]);

  const [marketData, setMarketData] = useState([
    { name: '上证指数', value: 3152.67, change: 12.34, changePercent: 0.39 },
    { name: '深证成指', value: 10567.89, change: -23.45, changePercent: -0.22 },
    { name: '创业板指', value: 2189.56, change: 8.76, changePercent: 0.40 },
  ]);

  const [recommendations, setRecommendations] = useState<StockRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [hotspotData, setHotspotData] = useState<any[]>([]);
  const [loadingHotspot, setLoadingHotspot] = useState(true);
  const [latestSignals, setLatestSignals] = useState<any[]>([]);
  const [mainForceFlow, setMainForceFlow] = useState({ total: 0, buy: 0, sell: 0 });
  const [dataSourceHealth, setDataSourceHealth] = useState<any[]>([]);
  const [loadingDataSource, setLoadingDataSource] = useState(true);
  const [riskAssessments, setRiskAssessments] = useState<any[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<any[]>([]);
  const [portfolioRisk, setPortfolioRisk] = useState<any>(null);
  const [loadingRisk, setLoadingRisk] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // 图表引用
  const mainForceChartRef = useRef<HTMLDivElement>(null);
  const hotspotChartRef = useRef<HTMLDivElement>(null);
  
  // 图表实例
  const mainForceChart = useRef<echarts.ECharts | null>(null);
  const hotspotChart = useRef<echarts.ECharts | null>(null);
  
  const signalManager = SignalManager.getOptimizedSignalManager();
  const mainForceTracker = getMainForceTracker();
  const stockDataSource = getStockDataSource();
  const riskManager = getRiskManager();

  // 实时更新数据
  const updateRealtimeData = useCallback(async () => {
    try {
      // 更新自选股数据
      if (stocks.length > 0) {
        const codes = stocks.map(stock => stock.code);
        const results = await getRealtimeQuote(codes);
        if (results && results.length > 0) {
          const updatedStocks = results.map(result => ({
            code: result.code,
            name: result.name,
            price: result.price,
            change: result.change,
            changePercent: result.changePercent
          }));
          // 使用批量更新，减少渲染次数
          setStocks(updatedStocks);
        }
      }
      
      // 从真实数据源获取市场数据
      const marketCodes = ['sh000001', 'sz399001', 'sz399006']; // 上证指数、深证成指、创业板指
      const marketResults = await getRealtimeQuote(marketCodes);
      if (marketResults && marketResults.length > 0) {
        const updatedMarketData = [
          {
            name: '上证指数',
            value: marketResults.find(r => r.code === 'sh000001')?.price || 3187.82,
            change: marketResults.find(r => r.code === 'sh000001')?.change || 1.14,
            changePercent: marketResults.find(r => r.code === 'sh000001')?.changePercent || 0.04
          },
          {
            name: '深证成指',
            value: marketResults.find(r => r.code === 'sz399001')?.price || 10559.63,
            change: marketResults.find(r => r.code === 'sz399001')?.change || -9.91,
            changePercent: marketResults.find(r => r.code === 'sz399001')?.changePercent || -0.09
          },
          {
            name: '创业板指',
            value: marketResults.find(r => r.code === 'sz399006')?.price || 2203.92,
            change: marketResults.find(r => r.code === 'sz399006')?.change || -0.28,
            changePercent: marketResults.find(r => r.code === 'sz399006')?.changePercent || -0.01
          }
        ];
        setMarketData(updatedMarketData);
      }
      
      setLastUpdateTime(new Date());
      setLoadingStocks(false);
    } catch (error) {
      console.error('更新实时数据失败:', error);
      setLoadingStocks(false);
      message.error('数据更新失败，请稍后重试');
    }
  }, [stocks.length]);

  // 获取主力资金数据并处理信号
  const updateMainForceData = useCallback(async () => {
    try {
      setLoadingMainForce(true);
      const codes = stocks.map(stock => stock.code);
      if (codes.length > 0) {
        // 使用同花顺数据源获取主力资金数据
        const source = getStockDataSource('ths');
        const mainForceResults = await source.getMainForceData(codes);
        
        if (mainForceResults && mainForceResults.length > 0) {
          setMainForceData(mainForceResults);
          
          // 处理主力资金数据，生成信号
          for (const data of mainForceResults) {
            // 确保数据格式正确
            if (data && data.stockCode) {
              signalManager.processMainForceData(data);
              mainForceTracker.updateMainForceData(data);
            }
          }
          
          // 更新未读信号计数
          const signalHistory = signalManager.getSignalHistory();
          const unreadCount = signalHistory.filter(s => !s.isRead).length;
          setUnreadSignalCount(unreadCount);
        }
      }
    } catch (error) {
      console.error('获取主力资金数据失败:', error);
    } finally {
      setLoadingMainForce(false);
    }
  }, [stocks, signalManager, mainForceTracker]);

  // 集成实时数据监听
  useEffect(() => {
    let mockTimer: number | null = null;
    
    // 检查市场是否开盘
    const isMarketOpen = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // 周一到周五
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // 上午：9:30-11:30
        const morningOpen = (hours === 9 && minutes >= 30) || (hours > 9 && hours < 11) || (hours === 11 && minutes < 30);
        // 下午：13:00-15:00
        const afternoonOpen = (hours === 13 && minutes >= 0) || (hours > 13 && hours < 15) || (hours === 15 && minutes === 0);
        
        return morningOpen || afternoonOpen;
      }
      return false;
    };
    
    // 只有在市场开盘时才启动模拟实时数据
    if (isMarketOpen()) {
      // 启动模拟实时数据（实际项目中会使用真实的WebSocket连接）
      mockTimer = startMockRealTimeData((data: any) => {
        // 处理实时数据更新
        setStocks(prevStocks => {
          const updatedStocks = [...prevStocks];
          const index = updatedStocks.findIndex(stock => stock.code === data.stockCode);
          if (index >= 0) {
            updatedStocks[index] = {
              code: data.stockCode,
              name: updatedStocks[index].name,
              price: data.price,
              change: data.change,
              changePercent: data.changePercent
            };
          }
          return updatedStocks;
        });
      }, 3000); // 每3秒更新一次
    }

    // 启动主力资金监控（仅在开盘时）
    const mainForceTimer = setInterval(() => {
      if (isMarketOpen()) {
        updateMainForceData();
      }
    }, 5000); // 每5秒更新一次主力资金数据

    return () => {
      if (mockTimer) {
        clearInterval(mockTimer);
      }
      if (mainForceTimer) {
        clearInterval(mainForceTimer);
      }
    };
  }, [updateMainForceData]);

  // 自动更新
  useEffect(() => {
    // 检查市场是否开盘
    const isMarketOpen = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // 周一到周五
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // 上午：9:30-11:30
        const morningOpen = (hours === 9 && minutes >= 30) || (hours > 9 && hours < 11) || (hours === 11 && minutes < 30);
        // 下午：13:00-15:00
        const afternoonOpen = (hours === 13 && minutes >= 0) || (hours > 13 && hours < 15) || (hours === 15 && minutes === 0);
        
        return morningOpen || afternoonOpen;
      }
      return false;
    };
    
    if (autoUpdate && isMarketOpen()) {
      intervalRef.current = setInterval(() => {
        updateRealtimeData();
      }, 5000); // 每5秒更新一次
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoUpdate, updateRealtimeData]);

  // 加载个性化推荐
  const loadRecommendations = useCallback(async () => {
    setLoadingRecommendations(true);
    try {
      const recommendationService = getPersonalizedRecommendation();
      const recs = recommendationService.generateRecommendations();
      setRecommendations(recs);
    } catch (error) {
      console.error('加载推荐失败:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  }, []);

  // 加载市场热点数据
  const loadHotspotData = useCallback(async () => {
    setLoadingHotspot(true);
    try {
      // 模拟市场热点数据
      const mockHotspotData = [
        { industry: '人工智能', rank: 1, change: 5.2, stocks: 156, popularity: 95 },
        { industry: '半导体', rank: 2, change: 4.8, stocks: 124, popularity: 90 },
        { industry: '新能源', rank: 3, change: 3.5, stocks: 187, popularity: 85 },
        { industry: '医药', rank: 4, change: 2.1, stocks: 213, popularity: 75 },
        { industry: '金融', rank: 5, change: 1.8, stocks: 145, popularity: 70 },
      ];
      setHotspotData(mockHotspotData);
    } catch (error) {
      console.error('加载热点数据失败:', error);
    } finally {
      setLoadingHotspot(false);
    }
  }, []);

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

  // 计算主力资金流向
  const calculateMainForceFlow = useCallback(() => {
    try {
      const totalFlow = mainForceData.reduce((sum, data) => sum + data.mainForceNetFlow, 0);
      const buyFlow = mainForceData.filter(data => data.mainForceNetFlow > 0).reduce((sum, data) => sum + data.mainForceNetFlow, 0);
      const sellFlow = mainForceData.filter(data => data.mainForceNetFlow < 0).reduce((sum, data) => sum + Math.abs(data.mainForceNetFlow), 0);
      setMainForceFlow({ total: totalFlow, buy: buyFlow, sell: sellFlow });
    } catch (error) {
      console.error('计算主力资金流向失败:', error);
    }
  }, [mainForceData]);

  // 加载数据源健康状态
  const loadDataSourceHealth = useCallback(() => {
    setLoadingDataSource(true);
    try {
      const healthStatus = stockDataSource.getHealthStatus();
      let healthArray: any[] = [];
      
      // 检查 healthStatus 是否为 Map
      if (healthStatus instanceof Map) {
        healthArray = Array.from(healthStatus.entries()).map(([source, health]) => ({
          source,
          status: health.status,
          successRate: health.successCount / (health.successCount + health.errorCount || 1),
          responseTime: health.responseTime,
          lastCheck: health.lastCheck
        }));
      } else {
        // 如果是单个对象，转换为数组
        healthArray = [{
          source: healthStatus.source,
          status: healthStatus.status,
          successRate: healthStatus.successCount / (healthStatus.successCount + healthStatus.errorCount || 1),
          responseTime: healthStatus.responseTime,
          lastCheck: healthStatus.lastCheck
        }];
      }
      
      setDataSourceHealth(healthArray);
    } catch (error) {
      console.error('加载数据源健康状态失败:', error);
    } finally {
      setLoadingDataSource(false);
    }
  }, [stockDataSource]);

  // 加载风险评估
  const loadRiskAssessments = useCallback(() => {
    setLoadingRisk(true);
    try {
      const assessments = riskManager.getRiskAssessments();
      if (assessments.length === 0) {
        // 为当前股票生成风险评估
        stocks.forEach(stock => {
          riskManager.assessStockRisk(stock.code, stock.name);
        });
      }
      const updatedAssessments = riskManager.getRiskAssessments();
      setRiskAssessments(updatedAssessments);
    } catch (error) {
      console.error('加载风险评估失败:', error);
    } finally {
      setLoadingRisk(false);
    }
  }, [stocks, riskManager]);

  // 加载风险预警
  const loadRiskAlerts = useCallback(() => {
    try {
      const alerts = riskManager.generateRiskAlerts(
        stocks.map(stock => ({ code: stock.code, name: stock.name, price: stock.price }))
      );
      setRiskAlerts(riskManager.getRiskAlerts());
    } catch (error) {
      console.error('加载风险预警失败:', error);
    }
  }, [stocks, riskManager]);

  // 分析投资组合风险
  const analyzePortfolioRisk = useCallback(() => {
    try {
      const portfolio = riskManager.analyzePortfolio(
        stocks.map((stock, index) => ({
          code: stock.code,
          name: stock.name,
          weight: 1 / stocks.length,
          price: stock.price
        }))
      );
      setPortfolioRisk(portfolio);
    } catch (error) {
      console.error('分析投资组合风险失败:', error);
    }
  }, [stocks, riskManager]);

  // 初始化主力资金流向图表
  const initMainForceChart = useCallback(() => {
    if (mainForceChartRef.current) {
      mainForceChart.current = echarts.init(mainForceChartRef.current);
      updateMainForceChart();
    }
  }, []);

  // 更新主力资金流向图表
  const updateMainForceChart = useCallback(() => {
    if (mainForceChart.current) {
      const option = {
        title: {
          text: '主力资金流向',
          left: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['资金流入', '资金流出'],
          axisLabel: {
            fontSize: 12
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: 12,
            formatter: (value: number) => (value / 100000000).toFixed(2) + '亿'
          }
        },
        series: [
          {
            name: '资金流向',
            type: 'bar',
            data: [
              { value: mainForceFlow.buy, itemStyle: { color: '#cf1322' } },
              { value: mainForceFlow.sell, itemStyle: { color: '#3f8600' } }
            ],
            label: {
              show: true,
              position: 'top',
              formatter: (params: any) => (params.value / 100000000).toFixed(2) + '亿'
            }
          }
        ]
      };
      mainForceChart.current.setOption(option);
    }
  }, [mainForceFlow]);

  // 初始化市场热点图表
  const initHotspotChart = useCallback(() => {
    if (hotspotChartRef.current) {
      hotspotChart.current = echarts.init(hotspotChartRef.current);
      updateHotspotChart();
    }
  }, []);

  // 更新市场热点图表
  const updateHotspotChart = useCallback(() => {
    if (hotspotChart.current && hotspotData.length > 0) {
      const industries = hotspotData.map(item => item.industry);
      const changes = hotspotData.map(item => item.change);
      const popularities = hotspotData.map(item => item.popularity);

      const option = {
        title: {
          text: '市场热点分析',
          left: 'center',
          textStyle: {
            fontSize: 14
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['涨跌幅', '人气'],
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
          data: industries,
          axisLabel: {
            fontSize: 11,
            rotate: 30
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '涨跌幅(%)',
            position: 'left',
            axisLabel: {
              formatter: '{value}%'
            }
          },
          {
            type: 'value',
            name: '人气',
            position: 'right',
            max: 100,
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: [
          {
            name: '涨跌幅',
            type: 'bar',
            data: changes,
            itemStyle: {
              color: (params: any) => params.value >= 0 ? '#cf1322' : '#3f8600'
            }
          },
          {
            name: '人气',
            type: 'line',
            yAxisIndex: 1,
            data: popularities,
            itemStyle: {
              color: '#1890ff'
            },
            lineStyle: {
              width: 2
            }
          }
        ]
      };
      hotspotChart.current.setOption(option);
    }
  }, [hotspotData]);

  // 监控全市场股票的主力资金数据
  const monitorMarketMainForceData = useCallback(async () => {
    try {
      // 获取全市场股票列表（这里使用模拟数据，实际项目中需要从API获取）
      const marketStocks = [
        '000001', '600519', '002594', '300750', '601318',
        '000858', '000333', '601888', '600036', '601988'
      ];
      
      // 使用同花顺数据源获取主力资金数据
      const source = getStockDataSource('ths');
      const mainForceResults = await source.getMainForceData(marketStocks);
      
      if (mainForceResults && mainForceResults.length > 0) {
        // 处理主力资金数据，生成信号
        for (const data of mainForceResults) {
          // 确保数据格式正确
          if (data && data.stockCode) {
            signalManager.processMainForceData(data);
            mainForceTracker.updateMainForceData(data);
          }
        }
        
        // 更新未读信号计数
        const signalHistory = signalManager.getSignalHistory();
        const unreadCount = signalHistory.filter(s => !s.isRead).length;
        setUnreadSignalCount(unreadCount);
      }
    } catch (error) {
      console.error('监控全市场主力资金数据失败:', error);
    }
  }, [signalManager, mainForceTracker]);

  // 初始加载数据
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 并行加载数据，提升加载速度
        await Promise.all([
          updateRealtimeData(),
          loadRecommendations(),
          loadHotspotData(),
          loadLatestSignals(),
          loadDataSourceHealth(),
          loadRiskAssessments(),
          loadRiskAlerts(),
          analyzePortfolioRisk(),
          updateMainForceData(),
          monitorMarketMainForceData()
        ]);
      } catch (error) {
        console.error('加载数据失败:', error);
      } finally {
        // 所有数据加载完成后设置初始加载为false
        setInitialLoading(false);
      }
    };
    
    loadAllData();
  }, [updateRealtimeData, loadRecommendations, loadHotspotData, loadLatestSignals, loadDataSourceHealth, loadRiskAssessments, loadRiskAlerts, analyzePortfolioRisk, updateMainForceData, monitorMarketMainForceData]);

  // 当主力资金数据更新时，计算资金流向
  useEffect(() => {
    calculateMainForceFlow();
  }, [mainForceData, calculateMainForceFlow]);

  // 初始化图表
  useEffect(() => {
    initMainForceChart();
    initHotspotChart();

    // 监听窗口大小变化，调整图表大小
    const handleResize = () => {
      mainForceChart.current?.resize();
      hotspotChart.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mainForceChart.current?.dispose();
      hotspotChart.current?.dispose();
    };
  }, [initMainForceChart, initHotspotChart]);

  // 当主力资金流向数据更新时，更新图表
  useEffect(() => {
    updateMainForceChart();
  }, [mainForceFlow, updateMainForceChart]);

  // 当市场热点数据更新时，更新图表
  useEffect(() => {
    updateHotspotChart();
  }, [hotspotData, updateHotspotChart]);

  // 当股票列表更新时，重新计算风险评估
  useEffect(() => {
    if (stocks.length > 0) {
      loadRiskAssessments();
      loadRiskAlerts();
      analyzePortfolioRisk();
    }
  }, [stocks, loadRiskAssessments, loadRiskAlerts, analyzePortfolioRisk]);

  // 定期监控全市场
  useEffect(() => {
    // 检查市场是否开盘
    const isMarketOpen = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // 周一到周五
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // 上午：9:30-11:30
        const morningOpen = (hours === 9 && minutes >= 30) || (hours > 9 && hours < 11) || (hours === 11 && minutes < 30);
        // 下午：13:00-15:00
        const afternoonOpen = (hours === 13 && minutes >= 0) || (hours > 13 && hours < 15) || (hours === 15 && minutes === 0);
        
        return morningOpen || afternoonOpen;
      }
      return false;
    };

    // 每10秒监控一次全市场（仅在开盘时）
    const marketMonitorTimer = setInterval(() => {
      if (isMarketOpen()) {
        monitorMarketMainForceData();
        loadLatestSignals();
      }
    }, 10000);

    // 每30秒更新一次热点数据和数据源健康状态（仅在开盘时）
    const hotspotTimer = setInterval(() => {
      if (isMarketOpen()) {
        loadHotspotData();
        loadDataSourceHealth();
      }
    }, 30000);

    return () => {
      if (marketMonitorTimer) {
        clearInterval(marketMonitorTimer);
      }
      if (hotspotTimer) {
        clearInterval(hotspotTimer);
      }
    };
  }, [monitorMarketMainForceData, loadLatestSignals, loadHotspotData, loadDataSourceHealth]);

  const handleToggleAutoUpdate = useCallback(() => {
    setAutoUpdate(!autoUpdate);
    message.success(autoUpdate ? '自动更新已关闭' : '自动更新已开启');
  }, [autoUpdate]);

  const handleManualUpdate = useCallback(() => {
    setLoadingStocks(true);
    updateRealtimeData();
    message.success('数据已更新');
  }, [updateRealtimeData]);

  // 防抖搜索
  const debouncedSearch = useMemo(() => {
    return debounce(async () => {
      if (!searchCode) {
        message.error('请输入股票代码');
        return;
      }
      
      setLoading(true);
      try {
        const results = await getRealtimeQuote([searchCode]);
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
            setStocks(prevStocks => [...prevStocks, {
              code: stock.code,
              name: stock.name,
              price: stock.price,
              change: stock.change,
              changePercent: stock.changePercent
            }]);
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

  const handleRecommendationClick = useCallback((recommendation: StockRecommendation) => {
    const recommendationService = getPersonalizedRecommendation();
    recommendationService.recordRecommendationInteraction(recommendation.stockCode, recommendation.stockName, 'analyze');
    setSearchCode(recommendation.stockCode);
    debouncedSearch();
  }, [debouncedSearch]);

  // 计算市场数据的样式
  const marketDataItems = useMemo(() => {
    if (loadingStocks) {
      return Array(3).fill(0).map((_, index) => (
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

  // 计算推荐股票的样式
  const recommendationItems = useMemo(() => {
    if (loadingRecommendations) {
      return Array(5).fill(0).map((_, index) => (
        <List.Item key={index}>
          <Skeleton active paragraph={{ rows: 2 }} />
        </List.Item>
      ));
    }

    return recommendations.map((recommendation) => (
      <List.Item key={recommendation.stockCode} onClick={() => handleRecommendationClick(recommendation)} style={{ cursor: 'pointer', borderRadius: '4px', padding: '8px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{recommendation.stockName}</span>
              <span style={{ color: '#666', fontSize: '12px' }}>{recommendation.stockCode}</span>
              <Tag color={recommendation.category === 'trending' ? 'red' : recommendation.category === 'similar' ? 'blue' : recommendation.category === 'technical' ? 'green' : 'purple'} style={{ fontSize: '12px', padding: '2px 8px' }}>
                {recommendation.category === 'trending' ? <FireOutlined /> : recommendation.category === 'similar' ? <LikeOutlined /> : recommendation.category === 'technical' ? <LineChartOutlined /> : <WarningOutlined />}
                {recommendation.category === 'trending' ? '热门' : recommendation.category === 'similar' ? '相似' : recommendation.category === 'technical' ? '技术' : '历史'}
              </Tag>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1890ff' }}>
                匹配度 {Math.round(recommendation.score * 100)}%
              </div>
            </div>
          </div>
          <div style={{ marginTop: '4px', fontSize: '11px', color: '#666', lineHeight: '1.4' }}>
            {recommendation.reasons.map((reason, index) => (
              <span key={index} style={{ marginRight: '8px' }}>• {reason}</span>
            ))}
          </div>
        </div>
      </List.Item>
    ));
  }, [recommendations, loadingRecommendations, handleRecommendationClick]);

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
                  <Button size="small" icon={<StarOutlined />} onClick={() => message.info('收藏功能开发中')} />
                  <Button size="small" icon={<AppstoreOutlined />} onClick={() => message.info('应用商店功能开发中')} />
                  <Button size="small" icon={<ShareAltOutlined />} onClick={() => message.info('分享功能开发中')} />
                  <Button 
                    size="small" 
                    icon={
                      <Badge count={unreadSignalCount} showZero={false}>
                        <BellOutlined />
                      </Badge>
                    } 
                    onClick={() => {
                      // 跳转到信号页面
                      window.location.href = '/signal';
                    }}
                  />
                  <Button 
                    size="small" 
                    type={autoUpdate ? 'default' : 'primary'}
                    onClick={handleToggleAutoUpdate}
                  >
                    {autoUpdate ? '关闭' : '开启'}
                  </Button>
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
              <List.Item>
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

      <Card size="small" title="个性化推荐" style={{ margin: '2px' }}>
        <List
          dataSource={recommendations}
          renderItem={() => null}
          locale={{ emptyText: '暂无推荐股票' }}
        >
          {recommendationItems}
        </List>
      </Card>

      <Row gutter={[2, 2]} style={{ marginTop: '2px' }}>
        <Col xs={24} md={12}>
          <Card size="small" title="市场热点分析" style={{ margin: '2px' }}>
            {loadingHotspot ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              <>
                <div ref={hotspotChartRef} style={{ width: '100%', height: '200px', marginBottom: '16px' }}></div>
                <List
                  dataSource={hotspotData}
                  renderItem={(item, index) => (
                    <List.Item key={index} style={{ padding: '6px 0' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                            <Tag color="orange" style={{ fontSize: '12px', padding: '2px 8px' }}>{item.rank}</Tag>
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.industry}</span>
                            <Tag color={item.change >= 0 ? 'red' : 'green'} style={{ fontSize: '12px', padding: '2px 8px' }}>
                              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                            </Tag>
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666' }}>
                          <span>{item.stocks}只股票</span>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <FireOutlined style={{ color: '#ff4d4f', fontSize: '12px', marginRight: '2px' }} />
                            <span>人气 {item.popularity}</span>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                  locale={{ emptyText: '暂无热点数据' }}
                />
              </>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
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
        </Col>
      </Row>

      <Row gutter={[2, 2]} style={{ marginTop: '2px' }}>
        <Col xs={24} md={12}>
          <Card size="small" title="主力资金流向" style={{ margin: '2px' }}>
            <div style={{ marginBottom: '16px' }}>
              <Statistic
                title="总体资金流向"
                value={mainForceFlow.total / 100000000}
                precision={2}
                suffix="亿元"
                valueStyle={{ color: mainForceFlow.total >= 0 ? '#cf1322' : '#3f8600' }}
                prefix={mainForceFlow.total >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              />
            </div>
            <div ref={mainForceChartRef} style={{ width: '100%', height: '200px', marginBottom: '16px' }}></div>
            <Row gutter={[2, 2]}>
              <Col span={12}>
                <Card size="small" style={{ margin: '2px' }}>
                  <Statistic
                    title="资金流入"
                    value={mainForceFlow.buy / 100000000}
                    precision={2}
                    suffix="亿元"
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<ArrowUpOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" style={{ margin: '2px' }}>
                  <Statistic
                    title="资金流出"
                    value={mainForceFlow.sell / 100000000}
                    precision={2}
                    suffix="亿元"
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<ArrowDownOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" title="数据源健康状态" style={{ margin: '2px' }}>
            <List
              dataSource={dataSourceHealth}
              renderItem={(item, index) => (
                <List.Item key={index} style={{ padding: '6px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.source}</span>
                        <Tag color={item.status === 'healthy' ? 'green' : item.status === 'degraded' ? 'orange' : 'red'} style={{ fontSize: '12px', padding: '2px 8px' }}>
                          {item.status === 'healthy' ? '健康' : item.status === 'degraded' ? '降级' : '不健康'}
                        </Tag>
                      </div>
                      {item.responseTime && (
                        <span style={{ fontSize: '11px', color: '#666' }}>
                          {item.responseTime}ms
                        </span>
                      )}
                    </div>
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666', marginBottom: '2px' }}>
                        <span>成功率</span>
                        <span>{Math.round(item.successRate * 100)}%</span>
                      </div>
                      <Progress percent={Math.round(item.successRate * 100)} size="small" />
                    </div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: '暂无数据源健康状态' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[2, 2]} style={{ marginTop: '2px' }}>
        <Col xs={24} md={12}>
          <Card size="small" title="股票风险评估" style={{ margin: '2px' }}>
            {loadingRisk ? (
              <Skeleton active paragraph={{ rows: 5 }} />
            ) : (
              <List
                dataSource={riskAssessments}
                renderItem={(assessment, index) => (
                  <List.Item key={index} style={{ padding: '6px 0' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{assessment.stockName}</span>
                        <span style={{ color: '#666', fontSize: '12px' }}>{assessment.stockCode}</span>
                        <Tag color={
                          assessment.riskLevel === 'low' ? 'green' :
                          assessment.riskLevel === 'medium' ? 'blue' :
                          assessment.riskLevel === 'high' ? 'orange' : 'red'
                        } style={{ fontSize: '12px', padding: '2px 8px' }}>
                          {assessment.riskLevel === 'low' ? '低风险' :
                           assessment.riskLevel === 'medium' ? '中风险' :
                           assessment.riskLevel === 'high' ? '高风险' : '极高风险'}
                        </Tag>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666' }}>
                        <div>
                          风险评分: {assessment.riskScore}/100 | 波动率: {(assessment.volatility * 100).toFixed(2)}%
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                            夏普: {assessment.sharpeRatio.toFixed(2)}
                          </div>
                          <div style={{ marginTop: '2px' }}>
                            最大回撤: {(assessment.maxDrawdown * 100).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
                locale={{ emptyText: '暂无风险评估数据' }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" title="风险预警" style={{ margin: '2px' }}>
            <List
              dataSource={riskAlerts}
              renderItem={(alert, index) => (
                <List.Item key={index} style={{ padding: '6px 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                      <Tag color={
                        alert.severity === 'low' ? 'green' :
                        alert.severity === 'medium' ? 'orange' : 'red'
                      } style={{ fontSize: '12px', padding: '2px 8px' }}>
                        {alert.severity === 'low' ? '低' :
                         alert.severity === 'medium' ? '中' : '高'}风险
                      </Tag>
                      <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{alert.stockName}</span>
                      <span style={{ color: '#666', fontSize: '12px' }}>{alert.stockCode}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#666' }}>
                      <div style={{ flex: 1, marginRight: '8px' }}>
                        {alert.message}
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '80px' }}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
              locale={{ emptyText: '暂无风险预警' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[2, 2]} style={{ marginTop: '2px' }}>
        <Col xs={24}>
          <Card size="small" title="投资组合风险分析" style={{ margin: '2px' }}>
            {portfolioRisk ? (
              <div>
                <Row gutter={[2, 2]}>
                  <Col xs={24} sm={8}>
                    <Card size="small" style={{ margin: '2px' }}>
                      <Statistic
                        title="总体风险评分"
                        value={portfolioRisk.totalRiskScore}
                        precision={0}
                        suffix="/100"
                        valueStyle={{ color: 
                          portfolioRisk.riskLevel === 'low' ? '#52c41a' :
                          portfolioRisk.riskLevel === 'medium' ? '#1890ff' :
                          portfolioRisk.riskLevel === 'high' ? '#faad14' : '#ff4d4f'
                        }}
                      />
                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <Tag color={
                          portfolioRisk.riskLevel === 'low' ? 'green' :
                          portfolioRisk.riskLevel === 'medium' ? 'blue' :
                          portfolioRisk.riskLevel === 'high' ? 'orange' : 'red'
                        }>
                          {portfolioRisk.riskLevel === 'low' ? '低风险' :
                           portfolioRisk.riskLevel === 'medium' ? '中风险' :
                           portfolioRisk.riskLevel === 'high' ? '高风险' : '极高风险'}
                        </Tag>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8} style={{ marginTop: '2px' }}>
                    <Card size="small" style={{ margin: '2px' }}>
                      <Statistic
                        title="投资组合价值"
                        value={portfolioRisk.totalValue}
                        precision={2}
                        suffix="元"
                        valueStyle={{ color: '#1890ff' }}
                      />
                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          夏普比率: {portfolioRisk.sharpeRatio.toFixed(2)}
                        </span>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} sm={8} style={{ marginTop: '2px' }}>
                    <Card size="small" style={{ margin: '2px' }}>
                      <Statistic
                        title="风险价值 (VaR)"
                        value={portfolioRisk.VaR}
                        precision={2}
                        suffix="元"
                        valueStyle={{ color: '#faad14' }}
                      />
                      <div style={{ marginTop: '8px', textAlign: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          最大回撤: {(portfolioRisk.maxDrawdown * 100).toFixed(2)}%
                        </span>
                      </div>
                    </Card>
                  </Col>
                </Row>
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>行业分布</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Object.entries(portfolioRisk.sectorDistribution).map(([sector, percentage]) => (
                      <Tag key={sector} color="blue" style={{ margin: '2px 0', fontSize: '12px', padding: '2px 8px' }}>
                        {sector}: {String(percentage)}%
                      </Tag>
                    ))}
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ marginBottom: '8px', fontSize: '14px' }}>风险建议</h4>
                  <List
                    dataSource={portfolioRisk.recommendations}
                    renderItem={(recommendation, index) => (
                      <List.Item key={index} style={{ padding: '4px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                          <WarningOutlined style={{ color: '#faad14', marginRight: '6px', fontSize: '14px' }} />
                          <span>{String(recommendation)}</span>
                        </div>
                      </List.Item>
                    )}
                    locale={{ emptyText: '暂无风险建议' }}
                  />
                </div>
              </div>
            ) : (
              <Skeleton active paragraph={{ rows: 8 }} />
            )}
          </Card>
        </Col>
      </Row>
        </>
      )}
    </div>
  );
});

export default Dashboard;
