import React, { useState, useEffect } from 'react';
import { Card, Badge, Tag, Button, Divider, Progress, Tooltip, Spin, Alert } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  FireOutlined, 
  AlertOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  BarChartOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { getOptimizedSignalManager } from '../../utils/optimizedSignalManager';
import { superDataSourceManager } from '../../utils/superDataSourceManager';
import { dataSourceMonitor } from '../../utils/dataSourceMonitor';
import { SuperSignal } from '../../utils/superSignalGenerator';

interface EnhancedSignalDisplayProps {
  className?: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const EnhancedSignalDisplay: React.FC<EnhancedSignalDisplayProps> = ({
  className = '',
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataSourceStatus, setDataSourceStatus] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  // 获取信号管理器实例
  const signalManager = getOptimizedSignalManager();

  // 加载信号
  const loadSignals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 从信号管理器获取信号（这是正确的信号存储位置）
      const allSignals = signalManager.getSignalHistory();
      setSignals(allSignals);
      
      // 获取数据源状态
      const status = dataSourceMonitor.getDataSourceStatus();
      setDataSourceStatus(status);
    } catch (err) {
      setError('加载信号失败');
      console.error('加载信号失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadSignals();
  }, []);

  // 自动刷新
  useEffect(() => {
    if (autoRefresh) {
      const timer = setInterval(loadSignals, refreshInterval);
      return () => clearInterval(timer);
    }
  }, [autoRefresh, refreshInterval]);

  // 获取信号类型的样式
  const getSignalTypeStyle = (type: SuperSignal['type']) => {
    switch (type) {
      case 'strong_buy':
        return { color: '#52c41a', background: '#f6ffed', borderColor: '#b7eb8f' };
      case 'buy':
        return { color: '#1890ff', background: '#e6f7ff', borderColor: '#91d5ff' };
      case 'sell':
        return { color: '#faad14', background: '#fffbe6', borderColor: '#ffd591' };
      case 'strong_sell':
        return { color: '#ff4d4f', background: '#fff2f0', borderColor: '#ffccc7' };
      default:
        return { color: '#595959', background: '#f5f5f5', borderColor: '#d9d9d9' };
    }
  };

  // 获取信号类型的图标
  const getSignalTypeIcon = (type: SuperSignal['type']) => {
    switch (type) {
      case 'strong_buy':
        return <FireOutlined />;
      case 'buy':
        return <ArrowUpOutlined />;
      case 'sell':
        return <ArrowDownOutlined />;
      case 'strong_sell':
        return <CloseCircleOutlined />;
      default:
        return <AlertOutlined />;
    }
  };

  // 获取信号类型的文本
  const getSignalTypeText = (type: SuperSignal['type']) => {
    switch (type) {
      case 'strong_buy':
        return '强烈买入';
      case 'buy':
        return '买入';
      case 'sell':
        return '卖出';
      case 'strong_sell':
        return '强烈卖出';
      default:
        return '未知';
    }
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // 渲染信号详情
  const renderSignalDetails = (signal: SuperSignal) => {
    if (!showDetails) return null;

    return (
      <div style={{ marginTop: 12 }}>
        <Divider style={{ margin: '8px 0' }} />
        <div style={{ fontSize: '12px', color: '#666' }}>
          <div style={{ marginBottom: 4 }}>
            <strong>详细理由:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              {signal.detailedReasons.map((reason, index) => (
                <li key={index} style={{ marginBottom: 2 }}>{reason}</li>
              ))}
            </ul>
          </div>
          {signal.technicalAnalysis && (
            <div style={{ marginBottom: 4 }}>
              <strong>技术分析:</strong>
              <div style={{ marginLeft: 8 }}>
                <div>RSI: {signal.technicalAnalysis.rsi.toFixed(2)}</div>
                <div>MACD: {signal.technicalAnalysis.macd}</div>
                <div>KDJ: {signal.technicalAnalysis.kdj}</div>
              </div>
            </div>
          )}
          {signal.chipPeakAnalysis && (
            <div>
              <strong>筹码分析:</strong>
              <div style={{ marginLeft: 8 }}>
                <div>筹码集中度: {signal.chipPeakAnalysis.chipConcentration.toFixed(2)}%</div>
                <div>主要筹码区域: {signal.chipPeakAnalysis.mainChipArea.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染数据源状态
  const renderDataSourceStatus = () => {
    const statusArray = Object.entries(dataSourceStatus) as [string, { status: string }][];
    const healthyCount = statusArray.filter(([_, status]) => status.status === 'healthy').length;
    const totalCount = statusArray.length;

    return (
      <Card 
        title="数据源状态" 
        size="small" 
        style={{ marginBottom: 16 }}
        extra={
          <Tooltip title="刷新数据源状态">
            <Button 
              type="text" 
              icon={<ReloadOutlined />} 
              size="small"
              onClick={loadSignals}
            />
          </Tooltip>
        }
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <span>健康数据源: </span>
            <Badge 
              count={healthyCount} 
              style={{ backgroundColor: '#52c41a' }} 
            />
            <span style={{ marginLeft: 8 }}>/ {totalCount}</span>
          </div>
          <Progress 
            percent={(healthyCount / totalCount) * 100} 
            size="small" 
            width={100}
            status={healthyCount === totalCount ? 'success' : healthyCount > 0 ? 'active' : 'exception'}
          />
        </div>
        <div style={{ maxHeight: 200, overflow: 'auto' }}>
          {statusArray.slice(0, 10).map(([source, status]) => (
            <div key={source} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '12px' }}>
              <span>{source}</span>
              <Badge 
                status={status.status === 'healthy' ? 'success' : status.status === 'degraded' ? 'warning' : 'error'} 
                text={status.status}
              />
            </div>
          ))}
          {statusArray.length > 10 && (
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: '12px', color: '#666' }}>
              还有 {statusArray.length - 10} 个数据源...
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className={className}>
      {renderDataSourceStatus()}
      
      {error && (
        <Alert 
          message="错误" 
          description={error} 
          type="error" 
          showIcon 
          style={{ marginBottom: 16 }}
          action={
            <Button size="small" onClick={loadSignals}>
              重试
            </Button>
          }
        />
      )}

      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>买卖提示信号</span>
            <div>
              <Badge 
                count={signals.length} 
                style={{ backgroundColor: '#1890ff' }} 
              />
              <Button 
                type="text" 
                icon={<ReloadOutlined />} 
                size="small" 
                style={{ marginLeft: 8 }}
                loading={loading}
                onClick={loadSignals}
              />
            </div>
          </div>
        }
        size="small"
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : signals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            <AlertOutlined style={{ fontSize: 24, marginBottom: 8 }} />
            <div>暂无信号</div>
          </div>
        ) : (
          <div>
            {signals.map((signal) => (
              <Card
                key={signal.id}
                style={{
                  marginBottom: 12,
                  borderColor: getSignalTypeStyle(signal.type).borderColor,
                  background: getSignalTypeStyle(signal.type).background
                }}
                bodyStyle={{ padding: 12 }}
                extra={
                  <Tooltip title="查看详情">
                    <Button type="text" icon={<EyeOutlined />} size="small" />
                  </Tooltip>
                }
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                      <Tag 
                        icon={getSignalTypeIcon(signal.type)}
                        style={getSignalTypeStyle(signal.type)}
                      >
                        {getSignalTypeText(signal.type)}
                      </Tag>
                      <span style={{ marginLeft: 8, fontSize: '14px', fontWeight: 'bold' }}>
                        {signal.stockName} ({signal.stockCode})
                      </span>
                      <Badge 
                        count={`${signal.confidence.toFixed(0)}%`} 
                        style={{ 
                          marginLeft: 8, 
                          backgroundColor: signal.confidence > 80 ? '#52c41a' : '#1890ff' 
                        }} 
                      />
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: 4 }}>
                      {signal.price.toFixed(2)}元
                      <span 
                        style={{
                          marginLeft: 8,
                          color: signal.priceChangePercent > 0 ? '#52c41a' : '#ff4d4f'
                        }}
                      >
                        {signal.priceChangePercent > 0 ? '+' : ''}{signal.priceChangePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                      成交量: {signal.volumeChangePercent > 0 ? '+' : ''}{signal.volumeChangePercent.toFixed(2)}%
                      <span style={{ marginLeft: 16 }}>
                        时间: {formatTime(signal.timestamp)}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      理由: {signal.reason}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Progress 
                      percent={signal.confidence} 
                      size="small" 
                      width={80}
                      status={signal.confidence > 80 ? 'success' : signal.confidence > 60 ? 'active' : 'normal'}
                    />
                    <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                      置信度
                    </div>
                  </div>
                </div>
                {renderSignalDetails(signal)}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default EnhancedSignalDisplay;