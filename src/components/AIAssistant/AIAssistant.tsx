import React, { useState, useCallback, useEffect } from 'react';
import { Card, Button, Input, Divider, List, Typography, Spin, Space, Popconfirm, message } from 'antd';
import { RobotOutlined, SendOutlined, RiseOutlined, FallOutlined, BarChartOutlined, FundOutlined, ThunderboltOutlined, DollarOutlined, SaveOutlined, ClearOutlined } from '@ant-design/icons';
import { getLLM } from '../../utils/llmIntegration';

const { Text, Paragraph } = Typography;

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
}

interface QuickQuestion {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const quickQuestions: QuickQuestion[] = [
  { key: 'market', label: '市场分析', icon: <BarChartOutlined />, color: 'blue' },
  { key: 'hot', label: '热点板块', icon: <ThunderboltOutlined />, color: 'orange' },
  { key: 'strategy', label: '投资策略', icon: <FundOutlined />, color: 'green' },
  { key: 'risk', label: '风险控制', icon: <DollarOutlined />, color: 'red' },
  { key: 'tech', label: '技术分析', icon: <BarChartOutlined />, color: 'purple' },
  { key: 'recommend', label: '股票推荐', icon: <RiseOutlined />, color: 'cyan' },
];

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好！我是智盈AI投资助手，有什么可以帮助您的吗？\n\n📊 我可以为您提供：\n• 实时市场分析\n• 热点板块追踪\n• 投资策略建议\n• 技术指标解读\n• 风险评估提示\n\n点击下方快捷问题或直接输入您的问题！',
      type: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('ai_assistant_history', JSON.stringify(messages));
  }, [messages]);

  const llm = getLLM();

  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // 添加用户消息到LLM
      llm.addUserMessage(inputValue);
      // 获取LLM响应
      const response = await llm.getResponse();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        type: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('LLM响应失败:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，AI助手暂时无法响应，请稍后再试。',
        type: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [inputValue]);

  const handleClearHistory = useCallback(() => {
    setMessages([
      {
        id: '1',
        content: '您好！我是智盈AI投资助手，有什么可以帮助您的吗？\n\n📊 我可以为您提供：\n• 实时市场分析\n• 热点板块追踪\n• 投资策略建议\n• 技术指标解读\n• 风险评估提示\n\n点击下方快捷问题或直接输入您的问题！',
        type: 'ai',
        timestamp: new Date()
      }
    ]);
    message.success('对话历史已清空');
  }, []);

  const handleSaveHistory = useCallback(() => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai_assistant_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    message.success('对话历史已保存');
  }, [messages]);

  const handleQuickQuestion = useCallback((question: string) => {
    setInputValue(question);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{ padding: '0' }}>
      <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>智盈AI投资助手</h2>
        <Space size="small">
          <Button 
            type="default" 
            size="small" 
            icon={<SaveOutlined />} 
            onClick={handleSaveHistory}
          >
            保存对话
          </Button>
          <Popconfirm
            title="确定要清空对话历史吗？"
            onConfirm={handleClearHistory}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="default" 
              size="small" 
              danger
              icon={<ClearOutlined />} 
            >
              清空历史
            </Button>
          </Popconfirm>
        </Space>
      </div>
      
      <Card size="small" bordered={false} style={{ height: '650px', display: 'flex', flexDirection: 'column', margin: '2px' }}>
        <div style={{ marginBottom: '12px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>快捷问题：</Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
            {quickQuestions.map(q => (
              <Button
                key={q.key}
                type="dashed"
                size="small"
                icon={q.icon}
                onClick={() => handleQuickQuestion(q.label)}
                style={{ borderColor: q.color, color: q.color }}
              >
                {q.label}
              </Button>
            ))}
          </div>
        </div>

        <Divider style={{ margin: '8px 0' }} />
        
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
          <List
            dataSource={messages}
            renderItem={(item) => (
              <List.Item style={{ padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ fontSize: '20px', marginTop: '2px' }}>
                    {item.type === 'ai' ? (
                      <RobotOutlined style={{ color: '#1890ff' }} />
                    ) : (
                      <span style={{ color: '#52c41a' }}>👤</span>
                    )}
                  </div>
                  <div style={{ flex: 1, maxWidth: '100%' }}>
                    <Paragraph
                      style={{
                        margin: 0,
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: item.type === 'ai' ? '#f0f5ff' : '#f6ffed',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.8',
                        fontSize: '14px'
                      }}
                    >
                      {item.content}
                    </Paragraph>
                    <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '6px', marginLeft: '4px' }}>
                      {item.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </div>
                </div>
              </List.Item>
            )}
          />
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <Spin size="small" tip="AI正在分析中..." />
            </div>
          )}
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <Input
            placeholder="输入您的问题，例如：分析当前市场走势、今日热点板块..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            size="small"
            onPressEnter={handleSend}
          />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} size="small">
            发送
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;
