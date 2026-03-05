import React, { useState } from 'react';
import { Card, Form, Input, Button, Checkbox, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons';
import './Login.css';

const { TabPane } = Tabs;

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLoginFinish = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = savedUsers.find((u: any) => u.username === values.username && u.password === values.password);
      
      if (user || (values.username === 'admin' && values.password === 'admin123')) {
        message.success('登录成功！');
        onLogin(values.username, values.password);
      } else {
        message.error('账号或密码错误');
      }
    } catch (error) {
      message.error('登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFinish = async (values: any) => {
    setRegisterLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = savedUsers.some((u: any) => u.username === values.username);
      
      if (userExists) {
        message.error('该用户名已被注册');
        return;
      }
      
      if (values.password !== values.confirmPassword) {
        message.error('两次输入的密码不一致');
        return;
      }
      
      const newUser = {
        username: values.username,
        password: values.password,
        email: values.email,
        createdAt: new Date().toISOString()
      };
      
      savedUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(savedUsers));
      
      message.success('注册成功！正在跳转到登录页面...');
      
      registerForm.resetFields();
      
      setTimeout(() => {
        setActiveTab('login');
      }, 1000);
    } catch (error) {
      message.error('注册失败，请重试');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="智盈AI">
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <TabPane tab="登录" key="login">
            <Form
              form={form}
              onFinish={handleLoginFinish}
              layout="vertical"
            >
              <Form.Item
                name="username"
                label="账号"
                rules={[{ required: true, message: '请输入账号' }]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="请输入账号（测试账号：admin）"
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="请输入密码（测试密码：admin123）"
                  size="large"
                  visibilityToggle={{
                    visible: passwordVisible,
                    onVisibleChange: setPasswordVisible
                  }}
                  iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>
              
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-btn"
                  size="large"
                  loading={loading}
                  block
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="注册" key="register">
            <Form
              form={registerForm}
              onFinish={handleRegisterFinish}
              layout="vertical"
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' }
                ]}
              >
                <Input
                  prefix={<UserOutlined className="site-form-item-icon" />}
                  placeholder="请输入用户名"
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input
                  prefix={<MailOutlined className="site-form-item-icon" />}
                  placeholder="请输入邮箱"
                  size="large"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="请输入密码（至少6个字符）"
                  size="large"
                  visibilityToggle={{
                    visible: registerPasswordVisible,
                    onVisibleChange: setRegisterPasswordVisible
                  }}
                  iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>
              
              <Form.Item
                name="confirmPassword"
                label="确认密码"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  placeholder="请再次输入密码"
                  size="large"
                />
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="login-btn"
                  size="large"
                  loading={registerLoading}
                  block
                >
                  注册
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
