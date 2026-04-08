import { useState, lazy, Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin, Modal, Button, List, Avatar, Typography, Divider, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import Layout from './components/Layout/Layout';
import './i18n';
import i18n from './i18n';
import { startMarketMonitoring } from './utils/marketMonitor';

// 懒加载组件 - 带预加载策略
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Signal = lazy(() => import('./pages/Signal/Signal'));
const Trade = lazy(() => import('./pages/Trade/Trade'));
const AIAssistant = lazy(() => import('./pages/AIAssistant/AIAssistant'));
const Login = lazy(() => import('./pages/Login/Login'));
const PredictionTestPage = lazy(() => import('./pages/PredictionTest/PredictionTestPage'));

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
    import('./pages/AIAssistant/AIAssistant');
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
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
  const [selectedUserForAuth, setSelectedUserForAuth] = useState<User | null>(null);
  const [showAuthorizationManagement, setShowAuthorizationManagement] = useState(false);

  // 模拟用户列表
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: '15983768460', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=15983768460', isAuthorized: true, authorizedBy: 'system', authorizedAt: Date.now() },
    { id: '2', username: 'user1', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=User1', isAuthorized: false },
    { id: '3', username: 'user2', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=User2', isAuthorized: false },
  ]);

  // 组件挂载时预加载和自动登录
  useEffect(() => {
    preloadComponents();
    
    // 直接设置登录状态，避免异步问题
    setIsLoggedIn(true);
    setCurrentUser(users[0]);
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    // 清除本地存储中的当前用户信息
    localStorage.removeItem('currentUser');
  };

  const handleLogin = (username: string, password: string) => {
    // 从本地存储读取用户信息
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const savedUser = savedUsers.find((u: any) => u.username === username);
    
    // 找到对应的用户
    let user = users.find(u => u.username === username) || users[0];
    
    // 如果用户在本地存储中，更新用户信息
    if (savedUser) {
      user = {
        ...user,
        isAuthorized: savedUser.isAuthorized || false
      };
    }
    
    if (!user.isAuthorized && user.username !== '15983768460') {
      // 如果用户未授权且不是15983768460，显示授权提示
      setSelectedUserForAuth(user);
      setShowAuthorizationModal(true);
      return;
    }
    
    setIsLoggedIn(true);
    setCurrentUser(user);
    
    // 启动全市场监控
    startMarketMonitoring();
    
    // 将当前用户信息存储到本地存储
    localStorage.setItem('currentUser', JSON.stringify({
      username: user.username,
      id: user.id
    }));
  };

  const handleUserSwitch = (user: User) => {
    if (!user.isAuthorized) {
      // 如果用户未授权，显示授权提示
      setSelectedUserForAuth(user);
      setShowAuthorizationModal(true);
    } else {
      setCurrentUser(user);
      setShowUserSwitcher(false);
    }
  };

  const handleAuthorizeUser = (user: User) => {
    if (!currentUser || currentUser.username !== '15983768460') {
      message.error('只有管理员才能授权用户');
      return;
    }
    
    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { ...u, isAuthorized: true, authorizedBy: currentUser.username, authorizedAt: Date.now() }
        : u
    );
    setUsers(updatedUsers);
    
    // 更新本地存储中的用户授权状态
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedSavedUsers = savedUsers.map((u: any) => 
      u.username === user.username 
        ? { ...u, isAuthorized: true, authorizedBy: currentUser.username, authorizedAt: Date.now() }
        : u
    );
    localStorage.setItem('users', JSON.stringify(updatedSavedUsers));
    
    message.success(`用户 ${user.username} 授权成功`);
    setShowAuthorizationModal(false);
    setSelectedUserForAuth(null);
  };

  const handleCancelAuthorization = () => {
    setShowAuthorizationModal(false);
    setSelectedUserForAuth(null);
  };

  const handleManageAuthorization = () => {
    setShowAuthorizationManagement(true);
  };

  const handleCancelAuthorizationManagement = () => {
    setShowAuthorizationManagement(false);
  };

  const handleToggleAuthorization = (user: User) => {
    if (!currentUser || currentUser.username !== '15983768460') {
      message.error('只有管理员才能管理用户授权');
      return;
    }
    
    const newAuthorizedState = !user.isAuthorized;
    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { 
            ...u, 
            isAuthorized: newAuthorizedState, 
            authorizedBy: newAuthorizedState ? currentUser.username : undefined,
            authorizedAt: newAuthorizedState ? Date.now() : undefined
          }
        : u
    );
    setUsers(updatedUsers);
    
    // 更新本地存储中的用户授权状态
    const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedSavedUsers = savedUsers.map((u: any) => 
      u.username === user.username 
        ? { 
            ...u, 
            isAuthorized: newAuthorizedState, 
            authorizedBy: newAuthorizedState ? currentUser.username : undefined,
            authorizedAt: newAuthorizedState ? Date.now() : undefined
          }
        : u
    );
    localStorage.setItem('users', JSON.stringify(updatedSavedUsers));
    
    message.success(newAuthorizedState ? `用户 ${user.username} 授权成功` : `用户 ${user.username} 取消授权成功`);
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
        <Layout 
          onLogout={handleLogout} 
          language={language} 
          onLanguageChange={handleLanguageChange}
          currentUser={users[0]}
          onUserSwitch={() => setShowUserSwitcher(true)}
          onManageAuthorization={handleManageAuthorization}
        >
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ConfigProvider>
  );
};

export default App;
