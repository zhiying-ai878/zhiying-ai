import React, { useState } from 'react';
import { Card, Form, Input, Button, Checkbox, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons';
import './Login.css';

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [form] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const [resetConfirmPasswordVisible, setResetConfirmPasswordVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLoginFinish = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = savedUsers.find((u: any) => u.username === values.username && u.password === values.password);
      
      // 优先使用localStorage中的用户数据
      if (user) {
        message.success('登录成功！');
        onLogin(values.username, values.password);
      } 
      // 其次检查硬编码的特殊账号
      else if (values.username === '15983768460' && values.password === 'admin123') {
        message.success('登录成功！');
        onLogin(values.username, values.password);
      } 
      else {
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
        createdAt: new Date().toISOString(),
        isAuthorized: false
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

  const handleResetPasswordFinish = async (values: any) => {
    setResetPasswordLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = savedUsers.findIndex((u: any) => u.username === values.username);
      
      // 特殊处理15983768460账号
      if (values.username === '15983768460') {
        // 验证原密码
        if (values.oldPassword !== 'admin123') {
          message.error('原密码错误');
          return;
        }
        
        // 验证新密码
        if (values.newPassword !== values.confirmPassword) {
          message.error('两次输入的新密码不一致');
          return;
        }
        
        if (values.newPassword === values.oldPassword) {
          message.error('新密码不能与原密码相同');
          return;
        }
        
        // 将15983768460账号添加到localStorage中
        const existingSpecialUserIndex = savedUsers.findIndex((u: any) => u.username === '15983768460');
        if (existingSpecialUserIndex === -1) {
          savedUsers.push({
            username: '15983768460',
            password: values.newPassword,
            email: '15983768460@example.com',
            createdAt: new Date().toISOString(),
            isAuthorized: true
          });
        } else {
          savedUsers[existingSpecialUserIndex].password = values.newPassword;
        }
        
        localStorage.setItem('users', JSON.stringify(savedUsers));
        
        message.success('密码修改成功！正在跳转到登录页面...');
        
        resetPasswordForm.resetFields();
        
        setTimeout(() => {
          setActiveTab('login');
        }, 1000);
      } else if (userIndex === -1) {
        message.error('该用户名不存在');
        return;
      } else {
        // 处理普通用户的密码修改
        const user = savedUsers[userIndex];
        if (user.password !== values.oldPassword) {
          message.error('原密码错误');
          return;
        }
        
        if (values.newPassword !== values.confirmPassword) {
          message.error('两次输入的新密码不一致');
          return;
        }
        
        if (values.newPassword === values.oldPassword) {
          message.error('新密码不能与原密码相同');
          return;
        }
        
        // 更新密码
        savedUsers[userIndex].password = values.newPassword;
        localStorage.setItem('users', JSON.stringify(savedUsers));
        
        message.success('密码修改成功！正在跳转到登录页面...');
        
        resetPasswordForm.resetFields();
        
        setTimeout(() => {
          setActiveTab('login');
        }, 1000);
      }
    } catch (error) {
      message.error('密码修改失败，请重试');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" title="智盈AI">
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered items={[
          {
            key: 'login',
            label: '登录',
            children: (
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
            ),
          },
          {
            key: 'register',
            label: '注册',
            children: (
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
                    { min: 6, message: '密码至少6个字符' },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]/,
                      message: '密码必须包含大小写字母和数字'
                    }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="请输入密码（至少6个字符，包含大小写字母和数字）"
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
            ),
          },
          {
            key: 'resetPassword',
            label: '修改密码',
            children: (
              <Form
                form={resetPasswordForm}
                onFinish={handleResetPasswordFinish}
                layout="vertical"
              >
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input
                    prefix={<UserOutlined className="site-form-item-icon" />}
                    placeholder="请输入用户名"
                    size="large"
                  />
                </Form.Item>
                
                <Form.Item
                  name="oldPassword"
                  label="原密码"
                  rules={[{ required: true, message: '请输入原密码' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="请输入原密码"
                    size="large"
                    visibilityToggle={{
                      visible: resetPasswordVisible,
                      onVisibleChange: setResetPasswordVisible
                    }}
                    iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
                
                <Form.Item
                  name="newPassword"
                  label="新密码"
                  rules={[
                    { required: true, message: '请输入新密码' },
                    { min: 6, message: '密码至少6个字符' },
                    {
                      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]/,
                      message: '密码必须包含大小写字母和数字'
                    }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="请输入新密码（至少6个字符，包含大小写字母和数字）"
                    size="large"
                    visibilityToggle={{
                      visible: resetPasswordVisible,
                      onVisibleChange: setResetPasswordVisible
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
                        return Promise.reject(new Error('两次输入的新密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined className="site-form-item-icon" />}
                    placeholder="请再次输入新密码"
                    size="large"
                    visibilityToggle={{
                      visible: resetConfirmPasswordVisible,
                      onVisibleChange: setResetConfirmPasswordVisible
                    }}
                    iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="login-btn"
                    size="large"
                    loading={resetPasswordLoading}
                    block
                  >
                    修改密码
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
        ]} />
      </Card>
    </div>
  );
};

export default Login;
