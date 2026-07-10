import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Tooltip, Badge } from 'antd';
import { Sparkles, MessageSquare, X } from 'lucide-react';

export default function AIFloatingButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const [minimized, setMinimized] = useState(false);

  // 在AI页面或登录页时不显示
  if (location.pathname === '/ai-assistant' || location.pathname === '/login') {
    return null;
  }

  if (minimized) {
    return (
      <Tooltip title="打开AI助手">
        <Button
          type="primary"
          shape="circle"
          icon={<Sparkles size={20} />}
          onClick={() => setMinimized(false)}
          style={{
            position: 'fixed', bottom: 80, right: 24, zIndex: 1000,
            width: 48, height: 48, boxShadow: '0 4px 12px rgba(24,144,255,0.4)',
            animation: 'pulse 2s infinite',
          }}
        />
      </Tooltip>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 80, right: 24, zIndex: 1000,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
    }}>
      {/* 浮动卡片 */}
      <div style={{
        backgroundColor: '#fff', borderRadius: 12, padding: '16px 20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)', width: 240,
        marginBottom: 4,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontWeight: 'bold', fontSize: 14 }}>
            <Sparkles size={16} color="#1890ff" style={{ marginRight: 4 }} />
            AI助手
          </span>
          <Button type="text" size="small" icon={<X size={14} />} onClick={() => setMinimized(true)} />
        </div>
        <p style={{ color: '#666', fontSize: 12, marginBottom: 12 }}>
          有什么HR相关问题可以问我！
        </p>
        <Button
          type="primary"
          block
          icon={<MessageSquare size={14} />}
          onClick={() => navigate('/ai-assistant')}
          size="small"
        >
          开始对话
        </Button>
      </div>

      {/* 角标按钮 */}
      <Button
        type="primary"
        shape="circle"
        icon={<Sparkles size={20} />}
        onClick={() => navigate('/ai-assistant')}
        style={{
          width: 48, height: 48, boxShadow: '0 4px 12px rgba(24,144,255,0.4)',
        }}
      />
    </div>
  );
}
