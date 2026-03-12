﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿import { useState, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin, Modal, Button, List, Avatar, Typography, Divider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import Layout from './components/Layout/Layout';
import './i18n';
import i18n from './i18n';

// 懒加载组件 - 带预加载策略
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const StockDetail = lazy(() => import('./pages/StockDetail/StockDetail'));
const Trade = lazy(() => import('./pages/Trade/Trade'));
const AIAssistant = lazy(() => import('./pages/AIAssistant/AIAssistant'));
const Portfolio = lazy(() => import('./pages/Portfolio/Portfolio'));
const DataSource = lazy(() => import('./pages/DataSource/DataSource'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const MainForce = lazy(() => import('./pages/MainForce/MainForce'));
const ChipPeak = lazy(() => import('./pages/ChipPeak/ChipPeak'));
const Signal = lazy(() => import('./pages/Signal/Signal'));
const Prediction = lazy(() => import('./pages/Prediction/Prediction'));
const AIStrategy = lazy(() => import('./pages/AIStrategy/AIStrategy'));
const Login = lazy(() => import('./pages/Login/Login'));

// 预加载策略
const preloadComponents = () => {
  // 预加载核心组件
  setTimeout(() => {
    import('./pages/Dashboard/Dashboard');
    import('./pages/AIAssistant/AIAssistant');
  }, 1000);
  
  // 预加载常用组件
  setTimeout(() => {
    import('./pages/StockDetail/StockDetail');
    import('./pages/Trade/Trade');
    import('./pages/Signal/Signal');
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as 'light' | 'dark') || 'light';
  });

  // 组件挂载时预加载
  useEffect(() => {
    preloadComponents();
  }, []);

  // 模拟用户列表
  const [users, setUsers] = useState<User[]>([
    { id: '1', username: 'admin', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin', isAuthorized: true, authorizedBy: 'system', authorizedAt: Date.now() },
    { id: '2', username: 'user1', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=User1', isAuthorized: false },
    { id: '3', username: 'user2', avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=User2', isAuthorized: false },
  ]);

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
    
    if (!user.isAuthorized && user.username !== 'admin') {
      // 如果用户未授权且不是admin，显示授权提示
      setSelectedUserForAuth(user);
      setShowAuthorizationModal(true);
      return;
    }
    
    setIsLoggedIn(true);
    setCurrentUser(user);
    
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
    if (!currentUser) return;
    
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
    if (!currentUser) return;
    
    const updatedUsers = users.map(u => 
      u.id === user.id 
        ? { 
            ...u, 
            isAuthorized: !u.isAuthorized, 
            authorizedBy: !u.isAuthorized ? currentUser.username : undefined,
            authorizedAt: !u.isAuthorized ? Date.now() : undefined
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
            isAuthorized: !user.isAuthorized, 
            authorizedBy: !user.isAuthorized ? currentUser.username : undefined,
            authorizedAt: !user.isAuthorized ? Date.now() : undefined
          }
        : u
    );
    localStorage.setItem('users', JSON.stringify(updatedSavedUsers));
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
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
        {isLoggedIn && currentUser ? (
          <>
            <Layout 
              onLogout={handleLogout} 
              language={language} 
              onLanguageChange={handleLanguageChange}
              currentUser={currentUser}
              onUserSwitch={() => setShowUserSwitcher(true)}
              onManageAuthorization={handleManageAuthorization}
              theme={theme}
              onThemeChange={handleThemeChange}
            >
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" /></div>}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/stock" element={<StockDetail />} />
                  <Route path="/trade" element={<Trade />} />
                  <Route path="/signal" element={<Signal />} />
                  <Route path="/mainforce" element={<MainForce />} />
                  <Route path="/chippeak" element={<ChipPeak />} />
                  <Route path="/prediction" element={<Prediction />} />
                  <Route path="/aiassistant" element={<AIAssistant />} />
                  <Route path="/aistrategy" element={<AIStrategy />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/datasource" element={<DataSource />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Layout>

            {/* 用户切换弹窗 */}
            <Modal
              title="切换用户"
              open={showUserSwitcher}
              onCancel={() => setShowUserSwitcher(false)}
              footer={[
                <Button key="cancel" onClick={() => setShowUserSwitcher(false)}>
                  取消
                </Button>
              ]}
              width={400}
            >
              <List
                itemLayout="horizontal"
                dataSource={users}
                renderItem={(user) => (
                  <List.Item 
                    key={user.id}
                    actions={[
                      <Button 
                        type={user.id === currentUser.id ? 'primary' : 'default'}
                        onClick={() => handleUserSwitch(user)}
                        disabled={!user.isAuthorized && user.id !== currentUser.id}
                      >
                        {user.id === currentUser.id ? '当前用户' : user.isAuthorized ? '切换' : '未授权'}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={user.avatar} style={{ backgroundColor: user.isAuthorized ? '#52c41a' : '#d9d9d9' }} />}
                      title={<Text strong>{user.username}</Text>}
                      description={
                        user.id === currentUser.id 
                          ? '当前登录用户'
                          : user.isAuthorized
                            ? `已授权 (${new Date(user.authorizedAt || 0).toLocaleString()})`
                            : '未授权 - 需要管理员授权'
                      }
                    />
                  </List.Item>
                )}
              />
              <Divider />
              <Button type="dashed" block onClick={handleLogout}>
                退出登录
              </Button>
            </Modal>

            {/* 授权模态框 */}
            <Modal
              title="用户授权"
              open={showAuthorizationModal}
              onCancel={handleCancelAuthorization}
              footer={[
                <Button key="cancel" onClick={handleCancelAuthorization}>
                  取消
                </Button>,
                <Button key="authorize" type="primary" onClick={() => selectedUserForAuth && handleAuthorizeUser(selectedUserForAuth)}>
                  授权
                </Button>
              ]}
              width={400}
            >
              {selectedUserForAuth && (
                <div>
                  <p>用户 <Text strong>{selectedUserForAuth.username}</Text> 尚未获得授权，无法使用智盈AI软件。</p>
                  <p style={{ marginTop: '16px' }}>作为管理员，您可以授权此用户使用本软件。</p>
                  <p style={{ marginTop: '16px', color: '#666' }}>授权后，该用户将能够访问所有功能。</p>
                </div>
              )}
            </Modal>

            {/* 授权管理模态框 */}
            <Modal
              title="授权管理"
              open={showAuthorizationManagement}
              onCancel={handleCancelAuthorizationManagement}
              footer={[
                <Button key="cancel" onClick={handleCancelAuthorizationManagement}>
                  关闭
                </Button>
              ]}
              width={600}
            >
              <List
                itemLayout="horizontal"
                dataSource={users}
                renderItem={(user) => (
                  <List.Item 
                    key={user.id}
                    actions={[
                      <Button 
                        type={user.isAuthorized ? 'default' : 'primary'}
                        onClick={() => handleToggleAuthorization(user)}
                        disabled={user.username === 'admin'}
                      >
                        {user.isAuthorized ? '取消授权' : '授权'}
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={user.avatar} style={{ backgroundColor: user.isAuthorized ? '#52c41a' : '#d9d9d9' }} />}
                      title={<Text strong>{user.username}</Text>}
                      description={
                        user.username === 'admin'
                          ? '系统管理员 (默认授权)'
                          : user.isAuthorized
                            ? `已授权 - 授权人: ${user.authorizedBy} (${new Date(user.authorizedAt || 0).toLocaleString()})`
                            : '未授权'
                      }
                    />
                  </List.Item>
                )}
              />
              <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <p style={{ margin: 0, color: '#666' }}>管理员可以授权或取消授权用户使用智盈AI软件。</p>
                <p style={{ margin: '8px 0 0 0', color: '#666' }}>未授权的用户将无法登录和使用本软件。</p>
              </div>
            </Modal>
          </>
        ) : (
          <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>}>
            <Login onLogin={handleLogin} />
          </Suspense>
        )}
      </Router>
    </ConfigProvider>
  );
};

export default App;