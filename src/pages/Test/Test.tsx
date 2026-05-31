import React, { useState } from 'react';
import { Card, Button } from 'antd';

const Test = () => {
  const [loading, setLoading] = useState(false);
  const [limitUpPotentialCount, setLimitUpPotentialCount] = useState(5);

  return (
    <div>
      {/* 测试卡片 */}
      <Card size="small" style={{ margin: '2px 2px 8px 2px', border: '2px solid #1890ff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px', color: '#1890ff' }}>📢</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1890ff' }}>测试卡片</div>
              <div style={{ fontSize: '14px', color: '#666' }}>这是一个测试卡片，用于验证部署是否成功</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 涨停潜力股票提示卡片 */}
      <Card size="small" style={{ margin: '2px 2px 8px 2px', border: '2px solid #ff4d4f' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px', color: '#ff4d4f' }}>🔥</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#ff4d4f' }}>涨停潜力股票提示</div>
              <div style={{ fontSize: '14px', color: '#666' }}>当前监控到 {limitUpPotentialCount} 只可能涨停的股票</div>
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Button 
              type="primary" 
              danger
              size="small"
              onClick={async () => {
                setLoading(true);
                // 模拟加载
                setTimeout(() => {
                  setLoading(false);
                }, 1000);
              }}
              loading={loading}
            >
              立即查看
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Test;