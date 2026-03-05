import React from 'react';
import { Card, Tabs, Empty } from 'antd';
import { UserOutlined, BellOutlined, SettingOutlined, InfoCircleOutlined } from '@ant-design/icons';

const Settings = () => {
  const tabItems = [
    {
      key: '1',
      label: <span><UserOutlined />账户设置</span>,
      children: <Card style={{ margin: '2px' }}><Empty description="账户设置页面" /></Card>
    },
    {
      key: '2',
      label: <span><BellOutlined />通知设置</span>,
      children: <Card style={{ margin: '2px' }}><Empty description="通知设置页面" /></Card>
    },
    {
      key: '3',
      label: <span><SettingOutlined />系统设置</span>,
      children: <Card style={{ margin: '2px' }}><Empty description="系统设置页面" /></Card>
    },
    {
      key: '4',
      label: <span><InfoCircleOutlined />关于</span>,
      children: (
        <Card title="关于智盈AI" style={{ margin: '2px' }}>
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ color: '#999' }}>
              版本：1.0.0<br />
              基于AI的股票投资分析工具
            </p>
          </div>
        </Card>
      )
    }
  ];

  return <div className="settings-page"><Tabs defaultActiveKey="1" size="small" items={tabItems} /></div>;
};

export default Settings;
