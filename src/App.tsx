import { useState, lazy, Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin, Modal, Button, List, Avatar, Typography, Divider, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import Layout from './components/Layout/Layout';
import './i18n';
import i18n from './i18n';
import { startMarketMonitoring, getMarketMonitor } from './utils/marketMonitorManager';
import { getStockDataSource } from './utils/stockData';
import { getOptimizedSignalManager } from './utils/optimizedSignalManager';
import { getStorageItem } from './utils/storage';

// 懒加载组件 - 带预加载策略
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Signal = lazy(() => import('./pages/Signal/Signal'));
const SpecialSignal = lazy(() => import('./pages/SpecialSignal/SpecialSignal'));
const Trade = lazy(() => import('./pages/Trade/Trade'));
const Login = lazy(() => import('./pages/Login/Login'));
const PredictionTestPage = lazy(() => import('./pages/PredictionTest/PredictionTestPage'));
const Test = lazy(() => import('./pages/Test/Test'));

// 预加载策略
const preloadComponents = () => {
  // 预加载核心组件
  setTimeout(() => {
    import('./pages/Dashboard/Dashboard');
    import('./pages/Signal/Signal');
  }, 1000);
  
  // 预加载常用组件
  setTimeout(() => {
    import('./pages/Trade/Trade');
  }, 3000);
};

// 代码分割配置
const withErrorBoundary = (Component: React.ComponentType) => {
  return (props: any) => {
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error('Component error:', error);
      return <div style={{ padding: '20px', textAlign: 'center' }}>组件加载失败，请刷新页面重试</div>;
    }
  };
};

const { Text, Title } = Typography;

interface User {
  id: string;
  username: string;
  avatar: string;
  isAuthorized: boolean; // 是否已授权
  authorizedBy?: string; // 授权人
  authorizedAt?: number; // 授权时间
}

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [language, setLanguage] = useState(i18n.language);
  const [isInitializing, setIsInitializing] = useState(true);

  // 组件挂载时预加载并检查登录状态
  useEffect(() => {
    console.log('App组件挂载，开始初始化...');
    preloadComponents();
    
    // 检查是否已登录，如果已登录则自动初始化系统
    const savedUser = localStorage.getItem('currentUser');
    console.log('localStorage currentUser:', savedUser);
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('检测到已登录用户，自动初始化系统:', userData);
        
        // 验证数据完整性
        if (!userData.username || !userData.id) {
          throw new Error('用户数据不完整');
        }
        
        // 设置登录状态
        const user: User = {
          id: userData.id,
          username: userData.username,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.username}`,
          isAuthorized: true,
          authorizedBy: 'system',
          authorizedAt: Date.now()
        };
        
        setIsLoggedIn(true);
        setCurrentUser(user);
        console.log('用户状态设置完成');
        
        // 自动初始化系统
        setTimeout(() => {
          initializeSystem();
        }, 500);
      } catch (error) {
        console.error('自动登录失败:', error);
        localStorage.removeItem('currentUser');
        console.log('已清除损坏的用户数据');
      }
    } else {
      console.log('未检测到已登录用户，请先登录');
    }
    
    // 初始化完成
    setTimeout(() => {
      setIsInitializing(false);
    }, 100);
  }, []);

  const handleLogout = () => {
    console.log('用户正在登出，停止所有系统服务...');
    
    // 先移除所有事件监听器，防止干扰
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('focus', handleWindowFocus);
    window.removeEventListener('online', handleNetworkOnline);
    window.removeEventListener('offline', handleNetworkOffline);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    
    // 停止全局数据源监控
    stopGlobalDataSourceMonitor();
    
    // 停止市场监控
    const monitor = getMarketMonitor();
    monitor.stopMonitoring();
    
    // 清除本地存储中的当前用户信息
    localStorage.removeItem('currentUser');
    
    // 更新状态
    setIsLoggedIn(false);
    setCurrentUser(null);
    
    console.log('用户已登出，系统服务已全部停止');
    message.success('已安全退出');
  };

  const initializeSystem = async () => {
    try {
      console.log('初始化系统...');
      
      // 同步持仓数据到信号管理器
      syncPortfolioToSignalManager();
      
      // 初始化并测试数据源连接
      const dataSource = getStockDataSource();
      console.log('数据源已初始化:', dataSource.constructor.name);
      
      // 测试数据源连接
      await testDataSourceConnection();
      
      // 启动市场监控
      startMarketMonitoring();
      console.log('市场监控已启动');
      
      // 启用后台运行支持
      enableBackgroundMode();
      console.log('后台运行模式已启用');
      
      // 启动全局数据源健康监控
      startGlobalDataSourceMonitor();
      console.log('全局数据源健康监控已启动');
      
      message.success('系统初始化完成！');
    } catch (error) {
      console.error('系统初始化失败:', error);
      message.error('系统初始化失败，请刷新页面重试');
    }
  };

  // 同步持仓数据到信号管理器
  const syncPortfolioToSignalManager = () => {
    try {
      const signalManager = getOptimizedSignalManager();
      const portfolio = getStorageItem('portfolio');
      
      if (portfolio && Array.isArray(portfolio) && portfolio.length > 0) {
        console.log('开始同步持仓数据到信号管理器:', portfolio);
        
        portfolio.forEach((item: any) => {
          if (item.code && item.name && item.price && item.volume) {
            // 添加持仓到信号管理器
            signalManager.addPosition({
              stockCode: item.code,
              stockName: item.name,
              entryPrice: item.price,
              volume: item.volume,
              entryTime: Date.now()
            });
            console.log(`持仓 ${item.name}(${item.code}) 已同步到信号管理器`);
          }
        });
        
        message.success('持仓数据已同步到监控系统');
      } else {
        console.log('暂无持仓数据需要同步');
      }
    } catch (error) {
      console.error('同步持仓数据失败:', error);
    }
  };

  // 测试数据源连接
  const testDataSourceConnection = async () => {
    try {
      const dataSource = getStockDataSource();
      // 尝试获取一只股票的实时数据来测试连接
      await dataSource.getRealtimeQuote(['600000']);
      console.log('数据源连接测试成功');
    } catch (error) {
      console.warn('数据源连接测试失败，尝试备用数据源:', error);
      // 测试失败不阻止系统启动，让系统继续运行并自动切换数据源
    }
  };

  // 全局数据源健康监控
  let dataSourceMonitorTimer: NodeJS.Timeout | null = null;
  
  const startGlobalDataSourceMonitor = () => {
    if (dataSourceMonitorTimer) {
      clearInterval(dataSourceMonitorTimer);
    }
    
    // 每10秒检查一次数据源健康状态
    dataSourceMonitorTimer = setInterval(async () => {
      try {
        const dataSource = getStockDataSource();
        await dataSource.getRealtimeQuote(['600000']);
        console.log('数据源健康检查通过');
      } catch (error) {
        console.warn('数据源健康检查失败，正在尝试切换:', error);
        // 触发数据源切换逻辑
        try {
          // 可以在这里添加数据源切换逻辑
        } catch (switchError) {
          console.error('数据源切换失败:', switchError);
        }
      }
    }, 10000);
  };

  const stopGlobalDataSourceMonitor = () => {
    if (dataSourceMonitorTimer) {
      clearInterval(dataSourceMonitorTimer);
      dataSourceMonitorTimer = null;
      console.log('全局数据源健康监控已停止');
    }
  };

  const enableBackgroundMode = () => {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // 监听页面焦点变化 - 优化：失去焦点时保持全速度运行
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    
    // 监听网络状态变化
    window.addEventListener('online', handleNetworkOnline);
    window.addEventListener('offline', handleNetworkOffline);
    
    // 添加页面卸载事件监听器，确保登出时清理
    window.addEventListener('beforeunload', handleBeforeUnload);
  };

  const handleVisibilityChange = () => {
    console.log('页面可见性变化:', document.hidden);
    if (isLoggedIn) {
      try {
        const monitor = getMarketMonitor();
        if (document.hidden) {
          console.log('页面已隐藏，保持后台模式全速度运行');
          // 优化：后台模式仍然保持全速度，不减速
          monitor.setBackgroundMode(true);
        } else {
          console.log('页面已显示，继续全速度运行');
          monitor.setBackgroundMode(false);
        }
      } catch (error) {
        console.error('切换后台模式时出错:', error);
      }
    }
  };

  const handleWindowBlur = () => {
    console.log('窗口失去焦点，继续后台模式全速度运行');
    if (isLoggedIn) {
      try {
        const monitor = getMarketMonitor();
        // 优化：失去焦点时保持全速度运行
        monitor.setBackgroundMode(true);
      } catch (error) {
        console.error('进入后台模式时出错:', error);
      }
    }
  };

  const handleWindowFocus = () => {
    console.log('窗口获得焦点，继续全速度运行');
    if (isLoggedIn) {
      try {
        const monitor = getMarketMonitor();
        monitor.setBackgroundMode(false);
      } catch (error) {
        console.error('退出后台模式时出错:', error);
      }
    }
  };

  const handleNetworkOnline = () => {
    console.log('网络已连接');
    message.success('网络已恢复连接');
    if (isLoggedIn) {
      const monitor = getMarketMonitor();
      // 重新启动监控
      monitor.startMonitoring();
    }
  };

  const handleNetworkOffline = () => {
    console.log('网络已断开');
    message.warning('网络连接已断开，将在网络恢复后自动重新连接');
  };

  const handleBeforeUnload = () => {
    console.log('页面准备卸载');
    // 用户手动关闭页面或刷新，不主动登出，保持状态
    // 只有用户明确点击登出时才停止服务
  };

  const handleLogin = (username: string, password: string) => {
    console.log('Login called with:', username, password);
    
    // 所有用户都能直接登录成功！
    const isAdmin = username === '15983768460';
    
    const loginUser = {
      id: isAdmin ? '1' : Date.now().toString(),
      username,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}`,
      isAuthorized: true,
      authorizedBy: 'system',
      authorizedAt: Date.now()
    };
    
    console.log('User login:', loginUser);
    
    message.success('登录成功！');
    
    setIsLoggedIn(true);
    setCurrentUser(loginUser);
    
    // 初始化系统（自动连接数据源并启动监控）
    initializeSystem();
    
    // 将当前用户信息存储到本地存储
    localStorage.setItem('currentUser', JSON.stringify({
      username: loginUser.username,
      id: loginUser.id
    }));
  };



  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguage(i18n.language);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const getAntdLocale = () => {
    return language === 'zh-CN' ? zhCN : enUS;
  };

  return (
    <ConfigProvider locale={getAntdLocale()}>
      <Router>
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>}>
          <Routes>
            <Route 
              path="/login" 
              element={
                currentUser ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              } 
            />
            <Route 
              path="/" 
              element={
                isInitializing ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                    <Spin size="large" tip="初始化中..." />
                  </div>
                ) : currentUser ? (
                  <Layout 
                    onLogout={handleLogout} 
                    language={language} 
                    onLanguageChange={handleLanguageChange}
                    currentUser={currentUser}
                  >
                    <Dashboard />
                  </Layout>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/signal" 
              element={
                currentUser ? (
                  <Layout 
                    onLogout={handleLogout} 
                    language={language} 
                    onLanguageChange={handleLanguageChange}
                    currentUser={currentUser}
                  >
                    <Signal />
                  </Layout>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/special-signal" 
              element={
                currentUser ? (
                  <Layout 
                    onLogout={handleLogout} 
                    language={language} 
                    onLanguageChange={handleLanguageChange}
                    currentUser={currentUser}
                  >
                    <SpecialSignal />
                  </Layout>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/trade" 
              element={
                currentUser ? (
                  <Layout 
                    onLogout={handleLogout} 
                    language={language} 
                    onLanguageChange={handleLanguageChange}
                    currentUser={currentUser}
                  >
                    <Trade />
                  </Layout>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            <Route 
              path="/prediction-test" 
              element={
                currentUser ? (
                  <Layout 
                    onLogout={handleLogout} 
                    language={language} 
                    onLanguageChange={handleLanguageChange}
                    currentUser={currentUser}
                  >
                    <PredictionTestPage />
                  </Layout>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/test" 
              element={
                currentUser ? (
                  <Layout 
                    onLogout={handleLogout} 
                    language={language} 
                    onLanguageChange={handleLanguageChange}
                    currentUser={currentUser}
                  >
                    <Test />
                  </Layout>
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="*" 
              element={
                currentUser ? (
                  <Navigate to="/" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
          </Routes>
        </Suspense>
      </Router>
    </ConfigProvider>
  );
};

export default App;
