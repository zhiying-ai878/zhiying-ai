import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List, message, Spin, Typography, Avatar, Badge } from 'antd';
import { MessageOutlined, SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import * as SignalManager from '../../utils/optimizedSignalManager';
import { getMarketStatus } from '../../utils/marketMonitor';
import { getAIAssistant } from '../../utils/advancedAIAnalysis';
import './AIAssistant.css';

const { Text, Title } = Typography;

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好！我是智盈AI助手，很高兴为您服务。请问有什么可以帮助您的吗？',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const signalManager = SignalManager.getOptimizedSignalManager();
  const aiAssistant = getAIAssistant();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputValue.trim()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // 使用AI助手解析命令并生成响应
      const command = aiAssistant.parseCommand(inputValue);
      const response = aiAssistant.generateResponse(inputValue, command, signalManager);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // 如果需要执行命令
      if (response.requiresExecution) {
        const executionResult = await aiAssistant.executeCommand(command, signalManager);
        if (executionResult.success) {
          message.success(executionResult.message);
        } else {
          message.error(executionResult.message);
        }
      }
    } catch (error) {
      message.error('AI助手处理请求时发生错误');
      console.error('AI助手错误:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSend();
    }
  };

  return (<div className="ai-assistant-container"><Card title={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><RobotOutlined />智盈AI助手</div>}
      style={{ marginBottom: '16px' }}
    ><div className="chat-container" style={{ height: '500px', overflowY: 'auto', marginBottom: '16px' }}><List
          dataSource={messages}
          renderItem={(item) =>(<List.Item><div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}><Avatar
                icon={item.sender === 'ai' ?<RobotOutlined />:<UserOutlined />}
                style={{
                  backgroundColor: item.sender === 'ai' ? '#1890ff' : '#52c41a'
                }}
              /><div style={{ flex: 1 }}><div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>{item.sender === 'ai' ? 'AI助手' : '您'} · {item.timestamp.toLocaleString()}</div><div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: item.sender === 'ai' ? '#f0f2f5' : '#e6f7ff',
                  maxWidth: '80%'
                }}
              >{item.content}</div></div></div></List.Item>)}
        /><div ref={messageEndRef} /></div><div style={{ display: 'flex', gap: '8px' }}><Input
          placeholder="请输入您的问题，例如：有买入信号吗？"
          value={inputValue}
          onChange={(e) =>setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        /><Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
        >发送</Button></div><div style={{ marginTop: '16px', fontSize: '12px', color: '#999' }}><Text type="secondary">
          示例问题：
          <br />• 系统是否在监控市场？
          <br />• 有买入信号吗？
          <br />• 有卖出信号吗？
          <br />• 分析股票600000
          <br />• 当前市场状态如何？
        </Text></div></Card></div>);
};

export default AIAssistant;