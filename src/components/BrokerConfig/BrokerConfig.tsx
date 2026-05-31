import React, { useState, useEffect } from 'react';
import { Card, Form, Input, InputNumber, Switch, Button, Alert, message, Select, Space, Tag } from 'antd';
import { SettingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getStockDataSource, TradingPlatformType, DataSourceType } from '../../utils/stockData';

const { Option } = Select;

const BrokerConfig: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [brokerStatus, setBrokerStatus] = useState<Record<TradingPlatformType, { enabled: boolean; tradingEnabled: boolean }>>({    huatai: { enabled: false, tradingEnabled: false },
    gtja: { enabled: false, tradingEnabled: false },
    haitong: { enabled: false, tradingEnabled: false },
    cicc: { enabled: false, tradingEnabled: false },
    cmbc: { enabled: false, tradingEnabled: false },
    eastmoney: { enabled: false, tradingEnabled: false }
  });
  
  const dataSource = getStockDataSource();

  useEffect(() => {
    loadBrokerStatus();
  }, []);

  const loadBrokerStatus = () => {
    const brokers: TradingPlatformType[] = ['huatai', 'gtja', 'haitong', 'cicc', 'cmbc', 'eastmoney'];
    const status: Record<TradingPlatformType, { enabled: boolean; tradingEnabled: boolean }> = {} as any;
    
    brokers.forEach(broker => {
      const config = dataSource.getAPIConfig(broker) as any;
      if (config) {
        status[broker] = {
          enabled: config.enabled || false,
          tradingEnabled: config.tradingEnabled || false
        };
      } else {
        status[broker] = { enabled: false, tradingEnabled: false };
      }
    });
    
    setBrokerStatus(status);
  };

  const getBrokerName = (broker: TradingPlatformType) => {
    const map: Record<TradingPlatformType, string> = {
      huatai: '华泰证券',
      gtja: '国泰君安',
      haitong: '海通证券',
      cicc: '中金公司',
      cmbc: '民生证券',
      eastmoney: '东方财富'
    };
    return map[broker];
  };

  const handleBrokerToggle = (broker: TradingPlatformType, field: 'enabled' | 'tradingEnabled', checked: boolean) => {
    setBrokerStatus(prev => ({
      ...prev,
      [broker]: {
        ...prev[broker],
        [field]: checked
      }
    }));
  };

  const handleSaveConfig = async (broker: TradingPlatformType, values: any) => {
    setLoading(true);
    try {
      const config = {
        enabled: brokerStatus[broker].enabled,
        tradingEnabled: brokerStatus[broker].tradingEnabled,
        apiKey: values.apiKey,
        secretKey: values.secretKey,
        accountId: values.accountId,
        password: values.password,
        rateLimit: values.rateLimit || 1,
        timeout: values.timeout || 10000
      };
      
      dataSource.setAPIConfig(broker, config);
      message.success(`${getBrokerName(broker)}配置保存成功`);
    } catch (error) {
      message.error('配置保存失败');
    } finally {
      setLoading(false);
    }
  };

  const brokers: TradingPlatformType[] = ['huatai', 'gtja', 'haitong', 'cicc', 'cmbc', 'eastmoney'];

  return (
    <div style={{ padding: '0px' }}>
      <div style={{ marginBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>券商配置</h2>
      </div>

      <Alert
        message="券商API配置说明"
        description="配置券商API需要获取对应的API密钥和认证信息。请在各券商官网申请API权限后填写以下配置。"
        type="info"
        style={{ marginBottom: '16px' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {brokers.map(broker => (
          <Card key={broker} size="small" title={getBrokerName(broker)}>
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => handleSaveConfig(broker, values)}
              initialValues={{
                apiKey: '',
                secretKey: '',
                accountId: '',
                password: '',
                rateLimit: 1,
                timeout: 10000
              }}
            >
              <Form.Item label="启用状态">
                <Space>
                  <Switch
                    checked={brokerStatus[broker].enabled}
                    onChange={(checked) => handleBrokerToggle(broker, 'enabled', checked)}
                  />
                  <Tag color={brokerStatus[broker].enabled ? 'green' : 'red'}>
                    {brokerStatus[broker].enabled ? '已启用' : '未启用'}
                  </Tag>
                </Space>
              </Form.Item>

              <Form.Item label="交易功能">
                <Space>
                  <Switch
                    checked={brokerStatus[broker].tradingEnabled}
                    onChange={(checked) => handleBrokerToggle(broker, 'tradingEnabled', checked)}
                    disabled={!brokerStatus[broker].enabled}
                  />
                  <Tag color={brokerStatus[broker].tradingEnabled ? 'green' : 'red'}>
                    {brokerStatus[broker].tradingEnabled ? '已开启' : '已关闭'}
                  </Tag>
                </Space>
              </Form.Item>

              <Form.Item name="apiKey" label="API Key">
                <Input size="small" placeholder="请输入API Key" />
              </Form.Item>

              <Form.Item name="secretKey" label="Secret Key">
                <Input.Password size="small" placeholder="请输入Secret Key" />
              </Form.Item>

              <Form.Item name="accountId" label="账户ID">
                <Input size="small" placeholder="请输入账户ID" />
              </Form.Item>

              <Form.Item name="password" label="交易密码">
                <Input.Password size="small" placeholder="请输入交易密码" />
              </Form.Item>

              <Form.Item name="rateLimit" label="请求速率限制 (秒)">
                <InputNumber min={1} max={60} size="small" />
              </Form.Item>

              <Form.Item name="timeout" label="超时时间 (毫秒)">
                <InputNumber min={1000} max={30000} size="small" />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SettingOutlined />}
                  loading={loading}
                  block
                >
                  保存配置
                </Button>
              </Form.Item>
            </Form>
          </Card>
        ))}
      </div>

      <Alert
        message="安全提示"
        description="请妥善保管您的API密钥和账户信息，不要在公共场合展示或分享这些信息。"
        type="warning"
        style={{ marginTop: '16px' }}
      />
    </div>
  );
};

export default BrokerConfig;