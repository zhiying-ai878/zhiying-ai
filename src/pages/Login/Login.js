import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, Form, Input, Button, Checkbox, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined } from '@ant-design/icons';
import './Login.css';
const Login = ({ onLogin }) => {
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
    const handleLoginFinish = async (values) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const user = savedUsers.find((u) => u.username === values.username && u.password === values.password);
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
        }
        catch (error) {
            message.error('登录失败，请检查账号密码');
        }
        finally {
            setLoading(false);
        }
    };
    const handleRegisterFinish = async (values) => {
        setRegisterLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const userExists = savedUsers.some((u) => u.username === values.username);
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
        }
        catch (error) {
            message.error('注册失败，请重试');
        }
        finally {
            setRegisterLoading(false);
        }
    };
    const handleResetPasswordFinish = async (values) => {
        setResetPasswordLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
            const userIndex = savedUsers.findIndex((u) => u.username === values.username);
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
                const existingSpecialUserIndex = savedUsers.findIndex((u) => u.username === '15983768460');
                if (existingSpecialUserIndex === -1) {
                    savedUsers.push({
                        username: '15983768460',
                        password: values.newPassword,
                        email: '15983768460@example.com',
                        createdAt: new Date().toISOString(),
                        isAuthorized: true
                    });
                }
                else {
                    savedUsers[existingSpecialUserIndex].password = values.newPassword;
                }
                localStorage.setItem('users', JSON.stringify(savedUsers));
                message.success('密码修改成功！正在跳转到登录页面...');
                resetPasswordForm.resetFields();
                setTimeout(() => {
                    setActiveTab('login');
                }, 1000);
            }
            else if (userIndex === -1) {
                message.error('该用户名不存在');
                return;
            }
            else {
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
        }
        catch (error) {
            message.error('密码修改失败，请重试');
        }
        finally {
            setResetPasswordLoading(false);
        }
    };
    return (_jsx("div", { className: "login-container", children: _jsx(Card, { className: "login-card", title: "\u667A\u76C8AI", children: _jsx(Tabs, { activeKey: activeTab, onChange: setActiveTab, centered: true, items: [
                    {
                        key: 'login',
                        label: '登录',
                        children: (_jsxs(Form, { form: form, onFinish: handleLoginFinish, layout: "vertical", children: [_jsx(Form.Item, { name: "username", label: "\u8D26\u53F7", rules: [{ required: true, message: '请输入账号' }], children: _jsx(Input, { prefix: _jsx(UserOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u8D26\u53F7\uFF08\u6D4B\u8BD5\u8D26\u53F7\uFF1Aadmin\uFF09", size: "large" }) }), _jsx(Form.Item, { name: "password", label: "\u5BC6\u7801", rules: [{ required: true, message: '请输入密码' }], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u5BC6\u7801\uFF08\u6D4B\u8BD5\u5BC6\u7801\uFF1Aadmin123\uFF09", size: "large", visibilityToggle: {
                                            visible: passwordVisible,
                                            onVisibleChange: setPasswordVisible
                                        }, iconRender: visible => (visible ? _jsx(EyeTwoTone, {}) : _jsx(EyeInvisibleOutlined, {})) }) }), _jsx(Form.Item, { name: "remember", valuePropName: "checked", noStyle: true, children: _jsx(Checkbox, { children: "\u8BB0\u4F4F\u6211" }) }), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", className: "login-btn", size: "large", loading: loading, block: true, children: "\u767B\u5F55" }) })] })),
                    },
                    {
                        key: 'register',
                        label: '注册',
                        children: (_jsxs(Form, { form: registerForm, onFinish: handleRegisterFinish, layout: "vertical", children: [_jsx(Form.Item, { name: "username", label: "\u7528\u6237\u540D", rules: [
                                        { required: true, message: '请输入用户名' },
                                        { min: 3, message: '用户名至少3个字符' }
                                    ], children: _jsx(Input, { prefix: _jsx(UserOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u7528\u6237\u540D", size: "large" }) }), _jsx(Form.Item, { name: "email", label: "\u90AE\u7BB1", rules: [
                                        { required: true, message: '请输入邮箱' },
                                        { type: 'email', message: '请输入有效的邮箱地址' }
                                    ], children: _jsx(Input, { prefix: _jsx(MailOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u90AE\u7BB1", size: "large" }) }), _jsx(Form.Item, { name: "password", label: "\u5BC6\u7801", rules: [
                                        { required: true, message: '请输入密码' },
                                        { min: 6, message: '密码至少6个字符' },
                                        {
                                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]/,
                                            message: '密码必须包含大小写字母和数字'
                                        }
                                    ], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u5BC6\u7801\uFF08\u81F3\u5C116\u4E2A\u5B57\u7B26\uFF0C\u5305\u542B\u5927\u5C0F\u5199\u5B57\u6BCD\u548C\u6570\u5B57\uFF09", size: "large", visibilityToggle: {
                                            visible: registerPasswordVisible,
                                            onVisibleChange: setRegisterPasswordVisible
                                        }, iconRender: visible => (visible ? _jsx(EyeTwoTone, {}) : _jsx(EyeInvisibleOutlined, {})) }) }), _jsx(Form.Item, { name: "confirmPassword", label: "\u786E\u8BA4\u5BC6\u7801", dependencies: ['password'], rules: [
                                        { required: true, message: '请确认密码' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('两次输入的密码不一致'));
                                            },
                                        }),
                                    ], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u518D\u6B21\u8F93\u5165\u5BC6\u7801", size: "large" }) }), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", className: "login-btn", size: "large", loading: registerLoading, block: true, children: "\u6CE8\u518C" }) })] })),
                    },
                    {
                        key: 'resetPassword',
                        label: '修改密码',
                        children: (_jsxs(Form, { form: resetPasswordForm, onFinish: handleResetPasswordFinish, layout: "vertical", children: [_jsx(Form.Item, { name: "username", label: "\u7528\u6237\u540D", rules: [{ required: true, message: '请输入用户名' }], children: _jsx(Input, { prefix: _jsx(UserOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u7528\u6237\u540D", size: "large" }) }), _jsx(Form.Item, { name: "oldPassword", label: "\u539F\u5BC6\u7801", rules: [{ required: true, message: '请输入原密码' }], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u539F\u5BC6\u7801", size: "large", visibilityToggle: {
                                            visible: resetPasswordVisible,
                                            onVisibleChange: setResetPasswordVisible
                                        }, iconRender: visible => (visible ? _jsx(EyeTwoTone, {}) : _jsx(EyeInvisibleOutlined, {})) }) }), _jsx(Form.Item, { name: "newPassword", label: "\u65B0\u5BC6\u7801", rules: [
                                        { required: true, message: '请输入新密码' },
                                        { min: 6, message: '密码至少6个字符' },
                                        {
                                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]/,
                                            message: '密码必须包含大小写字母和数字'
                                        }
                                    ], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u8F93\u5165\u65B0\u5BC6\u7801\uFF08\u81F3\u5C116\u4E2A\u5B57\u7B26\uFF0C\u5305\u542B\u5927\u5C0F\u5199\u5B57\u6BCD\u548C\u6570\u5B57\uFF09", size: "large", visibilityToggle: {
                                            visible: resetPasswordVisible,
                                            onVisibleChange: setResetPasswordVisible
                                        }, iconRender: visible => (visible ? _jsx(EyeTwoTone, {}) : _jsx(EyeInvisibleOutlined, {})) }) }), _jsx(Form.Item, { name: "confirmPassword", label: "\u786E\u8BA4\u65B0\u5BC6\u7801", dependencies: ['newPassword'], rules: [
                                        { required: true, message: '请确认新密码' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('newPassword') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('两次输入的新密码不一致'));
                                            },
                                        }),
                                    ], children: _jsx(Input.Password, { prefix: _jsx(LockOutlined, { className: "site-form-item-icon" }), placeholder: "\u8BF7\u518D\u6B21\u8F93\u5165\u65B0\u5BC6\u7801", size: "large", visibilityToggle: {
                                            visible: resetConfirmPasswordVisible,
                                            onVisibleChange: setResetConfirmPasswordVisible
                                        }, iconRender: visible => (visible ? _jsx(EyeTwoTone, {}) : _jsx(EyeInvisibleOutlined, {})) }) }), _jsx(Form.Item, { children: _jsx(Button, { type: "primary", htmlType: "submit", className: "login-btn", size: "large", loading: resetPasswordLoading, block: true, children: "\u4FEE\u6539\u5BC6\u7801" }) })] })),
                    },
                ] }) }) }));
};
export default Login;
