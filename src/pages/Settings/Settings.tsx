import React, { useState } from 'react';
import { Card, Tabs, Empty, Form, Input, Button, message } from 'antd';
import { UserOutlined, BellOutlined, SettingOutlined, InfoCircleOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handlePasswordChange = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // 验证旧密码
      const user = savedUsers.find((u: any) => u.username === currentUser.username && u.password === values.oldPassword);
      
      if (!user) {
        message.error('旧密码错误');
        return;
      }
      
      // 更新密码
      const updatedUsers = savedUsers.map((u: any) => 
        u.username === currentUser.username 
          ? { ...u, password: values.newPassword }
          : u
      );
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      message.success('密码修改成功！');
      form.resetFields();
    } catch (error) {
      message.error('密码修改失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: '1',
      label: <span><UserOutlined />账户设置</span>,
      children: (
        <Card title="修改密码" style={{ margin: '2px' }}>
          <Form
            form={form}
            onFinish={handlePasswordChange}
            layout="vertical"
            style={{ maxWidth: 400 }}
          >
            <Form.Item
              name="oldPassword"
              label="旧密码"
              rules={[{ required: true, message: '请输入旧密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="请输入旧密码"
                size="large"
                visibilityToggle={{
                  visible: passwordVisible,
                  onVisibleChange: setPasswordVisible
                }}
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
            
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 8, message: '密码至少8个字符' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                  message: '密码必须包含大小写字母、数字和特殊字符'
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="请输入新密码（至少8个字符，包含大小写字母、数字和特殊字符）"
                size="large"
                visibilityToggle={{
                  visible: passwordVisible,
                  onVisibleChange: setPasswordVisible
                }}
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="请再次输入新密码"
                size="large"
                visibilityToggle={{
                  visible: passwordVisible,
                  onVisibleChange: setPasswordVisible
                }}
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
                block
              >
                确认修改
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
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
