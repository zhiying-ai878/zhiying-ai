import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout as AntLayout, Menu, Button, Drawer, Select, Avatar } from 'antd';
import { DashboardOutlined, StockOutlined, TransactionOutlined, NotificationOutlined, ThunderboltOutlined, LineChartOutlined, MessageOutlined, RiseOutlined, PieChartOutlined, DatabaseOutlined, SettingOutlined, LogoutOutlined, MenuOutlined, BellOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const { Header, Sider, Content } = AntLayout;

interface User {
  id: string;
  username: string;
  avatar: string;
  isAuthorized: boolean;
  authorizedBy?: string;
  authorizedAt?: number;
}

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  currentUser: User;
  onUserSwitch: () => void;
  onManageAuthorization?: () => void;
}

const Layout: React.FC<LayoutProps> = React.memo(({ children, onLogout, language, onLanguageChange, currentUser, onUserSwitch, onManageAuthorization }) => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  // 响应式断点
  const [isTablet, setIsTablet] = useState(false);

  const checkTablet = useCallback(() => {
    setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
  }, []);

  useEffect(() => {
    checkMobile();
    checkTablet();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('resize', checkTablet);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('resize', checkTablet);
    };
  }, [checkMobile, checkTablet]);

  const menuItems = useMemo(() => [
    { key: '/', icon: <DashboardOutlined />, label: t('navigation.dashboard') },
    { key: '/stock', icon: <StockOutlined />, label: t('navigation.stock') },
    { key: '/trade', icon: <TransactionOutlined />, label: t('navigation.trade') },
    { key: '/signal', icon: <NotificationOutlined />, label: t('navigation.signal') },
    { key: '/mainforce', icon: <ThunderboltOutlined />, label: t('navigation.mainforce') },
    { key: '/chippeak', icon: <LineChartOutlined />, label: t('navigation.chippeak') },
    { key: '/prediction', icon: <RiseOutlined />, label: t('navigation.prediction') },
    { key: '/aiassistant', icon: <MessageOutlined />, label: t('navigation.aiassistant') },
    { key: '/aistrategy', icon: <RiseOutlined />, label: t('navigation.aistrategy') },
    { key: '/portfolio', icon: <PieChartOutlined />, label: t('navigation.portfolio') },
    { key: '/datasource', icon: <DatabaseOutlined />, label: t('navigation.datasource') },
    { key: '/settings', icon: <SettingOutlined />, label: t('navigation.settings') },
  ], [t]);

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) setMobileMenuOpen(false);
  }, [navigate, isMobile]);

  const menu = useMemo(() => (
    <Menu
      mode={isMobile ? 'vertical' : 'inline'}
      selectedKeys={[location.pathname]}
      onClick={handleMenuClick}
      items={menuItems}
      theme="light"
    />
  ), [isMobile, location.pathname, handleMenuClick, menuItems]);

  const headerLeft = useMemo(() => {
    return !isMobile ? (collapsed ? 80 : (isTablet ? 120 : 150)) : 0;
  }, [isMobile, collapsed, isTablet]);

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          width={isTablet ? 120 : 150}
          collapsed={collapsed}
          style={{
            background: '#fff',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 10,
            scrollbarWidth: 'none' as any,
            msOverflowStyle: 'none' as any,
            WebkitOverflowScrolling: 'touch' as any
          }}
          trigger={null}
        >
          {/* 顶格行 - 固定显示 */}
          <div
            style={{
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
              color: 'white',
              position: 'sticky',
              top: 0,
              zIndex: 100,
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
              {!collapsed && (
                <Button
                  type="text"
                  icon={<LeftOutlined style={{ color: 'white' }} />}
                  onClick={() => setCollapsed(true)}
                  style={{ padding: '4px', position: 'absolute', left: '8px' }}
                />
              )}
              <RiseOutlined style={{ fontSize: '32px', marginBottom: collapsed ? '0' : '6px' }} />
              {collapsed && (
                <Button
                  type="text"
                  icon={<RightOutlined style={{ color: 'white' }} />}
                  onClick={() => setCollapsed(false)}
                  style={{ padding: '4px', position: 'absolute', right: '8px' }}
                />
              )}
            </div>
            {!collapsed && <h1 style={{ margin: '6px 0 0 0', fontSize: isTablet ? '16px' : '18px', fontWeight: 'bold' }}>智盈AI</h1>}
          </div>
          
          {/* 菜单区域 - 可滚动 */}
          <div style={{
            padding: '8px 0',
            minHeight: 'calc(100% - 160px)'
          }}>
            {menu}
          </div>
          
          {/* 底部区域 - 固定显示 */}
          <div style={{ 
            padding: '12px', 
            position: 'sticky', 
            bottom: 0, 
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            width: '100%'
          }}>
            <Button type="primary" danger block icon={<LogoutOutlined />} onClick={onLogout} size="small">
              {!collapsed && t('navigation.logout')}
            </Button>
          </div>
        </Sider>
      )}

      {isMobile && (
        <Drawer 
          title={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <RiseOutlined style={{ color: '#ff0000', fontSize: '20px', marginRight: '8px' }} />
              <span>智盈AI</span>
            </div>
          } 
          placement="left" 
          onClose={() => setMobileMenuOpen(false)} 
          open={mobileMenuOpen} 
          width={240}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ padding: '16px 0' }}>
            {menu}
          </div>
          <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
            <Button type="primary" danger block icon={<LogoutOutlined />} onClick={onLogout}>
              {t('navigation.logout')}
            </Button>
          </div>
        </Drawer>
      )}

      <AntLayout style={{ marginLeft: headerLeft, transition: 'margin-left 0.3s', minHeight: '100vh', position: 'relative' }}>
        <Header
          style={{
            background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            height: isMobile ? '56px' : '48px',
            lineHeight: isMobile ? '56px' : '48px',
            margin: 0,
            position: 'fixed',
            top: 0,
            right: 0,
            left: headerLeft,
            zIndex: 100,
            transition: 'left 0.3s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined style={{ color: 'white', fontSize: '20px' }} />}
                onClick={() => setMobileMenuOpen(true)}
                style={{ marginRight: '12px', padding: '4px' }}
              />
            )}
            <h1 style={{ margin: 0, color: 'white', fontSize: isMobile ? '18px' : isTablet ? '16px' : '20px', fontWeight: 'bold' }}>
              智能投资决策平台
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <Select
              value={language}
              onChange={onLanguageChange}
              style={{ width: 100, marginRight: '12px', color: 'white' }}
              options={[
                { value: 'zh-CN', label: '中文' },
                { value: 'en-US', label: 'English' },
              ]}
              dropdownStyle={{ minWidth: 100 }}
              size={isMobile ? 'small' : 'middle'}
            />
            <BellOutlined style={{ color: 'white', fontSize: isMobile ? '16px' : '18px', marginRight: '12px' }} />
            {currentUser.username === 'admin' && onManageAuthorization && (
              <Button 
                type="text" 
                style={{ marginRight: '12px', color: 'white' }}
                onClick={onManageAuthorization}
                size={isMobile ? 'small' : 'middle'}
              >
                {isMobile ? '授权' : '授权管理'}
              </Button>
            )}
            <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px', cursor: 'pointer' }} onClick={onUserSwitch}>
              <Avatar src={currentUser.avatar} style={{ marginRight: '8px', backgroundColor: currentUser.isAuthorized ? '#52c41a' : '#d9d9d9' }} size={isMobile ? 'small' : 'default'} />
              {!isMobile && <span style={{ color: 'white', fontSize: '14px' }}>{currentUser.username}</span>}
            </div>
          </div>
        </Header>
        <Content
          style={{
            margin: '0',
            padding: isMobile ? '8px' : '10px',
            background: '#f5f5f5',
            minHeight: '100vh',
            paddingTop: isMobile ? '76px' : '68px',
            overflow: 'auto',
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
});

Layout.displayName = 'Layout';

export default Layout;