import React from 'react';
import { Card, List, Typography, Empty, Space, Button, Tag, Switch, Divider, message } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, EyeOutlined, SoundOutlined, DesktopOutlined } from '@ant-design/icons';
import { useAutoEngine, Notification } from '../../contexts/AutoEngineContext';

const { Title, Text } = Typography;

const NotificationList: React.FC = () => {
  const { 
    state, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    clearNotifications,
    toggleSound,
    toggleDesktopNotifications,
    addNotification
  } = useAutoEngine();

  const unreadCount = state.notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckOutlined style={{ color: '#52c41a', fontSize: '20px' }} />;
      case 'warning': return <EyeOutlined style={{ color: '#faad14', fontSize: '20px' }} />;
      case 'error': return <DeleteOutlined style={{ color: '#ff4d4f', fontSize: '20px' }} />;
      default: return <BellOutlined style={{ color: '#1890ff', fontSize: '20px' }} />;
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'success': return '成功';
      case 'warning': return '警告';
      case 'error': return '错误';
      default: return '信息';
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'processing';
    }
  };

  const handleTestNotification = () => {
    message.info('测试通知功能已禁用');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={3} style={{ margin: 0 }}>
            <BellOutlined style={{ marginRight: '8px' }} />
            通知中心
          </Title>
          <Space>
            {unreadCount > 0 && (
              <Button 
                type="primary" 
                onClick={markAllNotificationsAsRead}
                icon={<CheckOutlined />}
              >
                全部标记已读
              </Button>
            )}
            <Button 
              danger 
              onClick={clearNotifications}
              icon={<DeleteOutlined />}
            >
              清空通知
            </Button>
            <Button 
              onClick={handleTestNotification}
              type="default"
            >
              发送测试通知
            </Button>
          </Space>
        </div>

        <Card size="small" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <SoundOutlined />
              <Text>声音提醒</Text>
            </Space>
            <Switch 
              checked={state.soundEnabled} 
              onChange={toggleSound}
            />
          </div>
          <Divider style={{ margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              <DesktopOutlined />
              <Text>桌面通知</Text>
            </Space>
            <Switch 
              checked={state.desktopNotificationsEnabled} 
              onChange={toggleDesktopNotifications}
            />
          </div>
        </Card>

        <div style={{ marginBottom: '16px' }}>
          <Text type="secondary">
            共 {state.notifications.length} 条通知
            {unreadCount > 0 && (
              <Tag color="red" style={{ marginLeft: '8px' }}>
                {unreadCount} 条未读
              </Tag>
            )}
          </Text>
        </div>

        {state.notifications.length === 0 ? (
          <Empty 
            description="暂无通知" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            dataSource={state.notifications}
            renderItem={(item: Notification) => (
              <List.Item
                style={{ 
                  background: item.read ? 'transparent' : '#f0f5ff',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  padding: '16px'
                }}
                actions={[
                  !item.read && (
                    <Button 
                      type="text" 
                      size="small" 
                      onClick={() => markNotificationAsRead(item.id)}
                    >
                      标记已读
                    </Button>
                  )
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ 
                      background: '#f5f5f5', 
                      borderRadius: '50%', 
                      width: '48px', 
                      height: '48px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {getNotificationIcon(item.type)}
                    </div>
                  }
                  title={
                    <Space>
                      <Text strong style={{ fontSize: '16px' }}>{item.title}</Text>
                      <Tag color={getNotificationTypeColor(item.type)}>
                        {getNotificationTypeText(item.type)}
                      </Tag>
                      {!item.read && <Tag color="red">未读</Tag>}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text style={{ fontSize: '14px' }}>{item.message}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {item.timestamp.toLocaleString('zh-CN')}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default NotificationList;
