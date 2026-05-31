import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, List, Typography, Empty, Space, Button, Tag, Switch, Divider, message } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined, EyeOutlined, SoundOutlined, DesktopOutlined } from '@ant-design/icons';
import { useAutoEngine } from '../../contexts/AutoEngineContext';
const { Title, Text } = Typography;
const NotificationList = () => {
    const { state, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications, toggleSound, toggleDesktopNotifications, addNotification } = useAutoEngine();
    const unreadCount = state.notifications.filter(n => !n.read).length;
    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return _jsx(CheckOutlined, { style: { color: '#52c41a', fontSize: '20px' } });
            case 'warning': return _jsx(EyeOutlined, { style: { color: '#faad14', fontSize: '20px' } });
            case 'error': return _jsx(DeleteOutlined, { style: { color: '#ff4d4f', fontSize: '20px' } });
            default: return _jsx(BellOutlined, { style: { color: '#1890ff', fontSize: '20px' } });
        }
    };
    const getNotificationTypeText = (type) => {
        switch (type) {
            case 'success': return '成功';
            case 'warning': return '警告';
            case 'error': return '错误';
            default: return '信息';
        }
    };
    const getNotificationTypeColor = (type) => {
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
    return (_jsx("div", { style: { padding: '24px' }, children: _jsxs(Card, { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }, children: [_jsxs(Title, { level: 3, style: { margin: 0 }, children: [_jsx(BellOutlined, { style: { marginRight: '8px' } }), "\u901A\u77E5\u4E2D\u5FC3"] }), _jsxs(Space, { children: [unreadCount > 0 && (_jsx(Button, { type: "primary", onClick: markAllNotificationsAsRead, icon: _jsx(CheckOutlined, {}), children: "\u5168\u90E8\u6807\u8BB0\u5DF2\u8BFB" })), _jsx(Button, { danger: true, onClick: clearNotifications, icon: _jsx(DeleteOutlined, {}), children: "\u6E05\u7A7A\u901A\u77E5" }), _jsx(Button, { onClick: handleTestNotification, type: "default", children: "\u53D1\u9001\u6D4B\u8BD5\u901A\u77E5" })] })] }), _jsxs(Card, { size: "small", style: { marginBottom: '24px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Space, { children: [_jsx(SoundOutlined, {}), _jsx(Text, { children: "\u58F0\u97F3\u63D0\u9192" })] }), _jsx(Switch, { checked: state.soundEnabled, onChange: toggleSound })] }), _jsx(Divider, { style: { margin: '12px 0' } }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs(Space, { children: [_jsx(DesktopOutlined, {}), _jsx(Text, { children: "\u684C\u9762\u901A\u77E5" })] }), _jsx(Switch, { checked: state.desktopNotificationsEnabled, onChange: toggleDesktopNotifications })] })] }), _jsx("div", { style: { marginBottom: '16px' }, children: _jsxs(Text, { type: "secondary", children: ["\u5171 ", state.notifications.length, " \u6761\u901A\u77E5", unreadCount > 0 && (_jsxs(Tag, { color: "red", style: { marginLeft: '8px' }, children: [unreadCount, " \u6761\u672A\u8BFB"] }))] }) }), state.notifications.length === 0 ? (_jsx(Empty, { description: "\u6682\u65E0\u901A\u77E5", image: Empty.PRESENTED_IMAGE_SIMPLE })) : (_jsx(List, { dataSource: state.notifications, renderItem: (item) => (_jsx(List.Item, { style: {
                            background: item.read ? 'transparent' : '#f0f5ff',
                            borderRadius: '8px',
                            marginBottom: '8px',
                            padding: '16px'
                        }, actions: [
                            !item.read && (_jsx(Button, { type: "text", size: "small", onClick: () => markNotificationAsRead(item.id), children: "\u6807\u8BB0\u5DF2\u8BFB" }))
                        ].filter(Boolean), children: _jsx(List.Item.Meta, { avatar: _jsx("div", { style: {
                                    background: '#f5f5f5',
                                    borderRadius: '50%',
                                    width: '48px',
                                    height: '48px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }, children: getNotificationIcon(item.type) }), title: _jsxs(Space, { children: [_jsx(Text, { strong: true, style: { fontSize: '16px' }, children: item.title }), _jsx(Tag, { color: getNotificationTypeColor(item.type), children: getNotificationTypeText(item.type) }), !item.read && _jsx(Tag, { color: "red", children: "\u672A\u8BFB" })] }), description: _jsxs(Space, { direction: "vertical", size: 4, style: { width: '100%' }, children: [_jsx(Text, { style: { fontSize: '14px' }, children: item.message }), _jsx(Text, { type: "secondary", style: { fontSize: '12px' }, children: item.timestamp.toLocaleString('zh-CN') })] }) }) })) }))] }) }));
};
export default NotificationList;
