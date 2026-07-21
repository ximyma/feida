/**
 * AppShell — 模块应用外壳
 *
 * 路由: /app/:module
 * 提供侧栏导航 + 内容区, 包裹 ListView/FormView/DetailView/ModuleHome
 */
import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Spin, Typography, Tag, Button, Tooltip, message } from 'antd';
import { HomeOutlined, ArrowLeftOutlined, SyncOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

const BASE = '/api';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

interface MenuItem { label: string; table: string; icon: string; desc: string; }

const AppShell: React.FC = () => {
  const { module: moduleName = '' } = useParams<{ module: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [appConfig, setAppConfig] = useState<{ name: string; menu: MenuItem[]; color: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/addons/${moduleName}/app.json?t=${Date.now()}`)
      .then(r => r.json())
      .then(cfg => setAppConfig(cfg))
      .catch(() => setAppConfig({ name: moduleName, menu: [], color: '#1677ff' }))
      .finally(() => setLoading(false));
  }, [moduleName]);

  const selectedKey = (() => {
    const parts = location.pathname.split('/');
    const idx = parts.indexOf('app');
    if (idx >= 0 && parts.length > idx + 2) return parts[idx + 2];
    return '';
  })();

  const menuItems: MenuProps['items'] = [
    { key: '_home', icon: <HomeOutlined />, label: '模块首页' },
    ...(appConfig?.menu || []).map(m => ({
      key: m.table,
      icon: <span>{getIcon(m.icon)}</span>,
      label: <span>{m.label} <Tag style={{ fontSize: 10, marginLeft: 4 }}>{m.table}</Tag></span>,
    })),
  ];

  const handleMenuClick: MenuProps['onClick'] = (info) => {
    if (info.key === '_home') navigate(`/app/${moduleName}`);
    else navigate(`/app/${moduleName}/${info.key}`);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="light" style={{ borderRight: '1px solid #f0f0f0' }}>
        <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid #f0f0f0' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/apps-manager')} size="small" style={{ marginBottom: 4 }}>
            返回应用列表
          </Button>
          <Title level={4} style={{ margin: 0, color: appConfig?.color || '#1677ff' }}>
            {appConfig?.name || moduleName}
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>模块: {moduleName}</Text>
          <div style={{ marginTop: 4 }}>
            <Tooltip title="如果编辑后未更新，点击此按钮强制重新加载模型">
              <Button type="link" size="small" icon={<SyncOutlined />} onClick={async () => {
                message.loading('刷新中...', 0.5);
                await fetch(`${BASE}/lowcode/deploy`, { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({moduleName}) });
                window.location.reload();
              }}>刷新应用数据</Button>
            </Tooltip>
          </div>
        </div>
        <Menu mode="inline" selectedKeys={[selectedKey || '_home']} onClick={handleMenuClick} items={menuItems}
          style={{ borderRight: 0, marginTop: 8 }} />
      </Sider>
      <Content style={{ padding: 16, background: '#f5f5f5', minHeight: '100vh' }}>
        <Outlet context={{ moduleName, appConfig }} />
      </Content>
    </Layout>
  );
};

function getIcon(name: string) {
  const map: Record<string, string> = { user: '👤', environment: '📍', inbox: '📦', file: '📄', bars: '📊', shop: '🏪' };
  return map[name] || '📋';
}

export default AppShell;
