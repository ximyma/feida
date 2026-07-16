/**
 * ModuleHome — 模块主页
 *
 * 显示模块所有数据表的卡片, 点击进入列表页
 */
import React from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Card, Row, Col, Statistic, Typography, Spin, Tag } from 'antd';
import { useEffect, useState } from 'react';

const { Title, Text } = Typography;

interface MenuItem { label: string; table: string; icon: string; desc: string; }
interface AppConfig { name: string; menu: MenuItem[]; color: string; }

const ModuleHome: React.FC = () => {
  const { module: moduleName = '' } = useParams<{ module: string }>();
  const navigate = useNavigate();
  const { appConfig } = useOutletContext<{ appConfig: AppConfig }>();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appConfig?.menu) { setLoading(false); return; }
    Promise.all(appConfig.menu.map(async m => {
      try {
        const r = await fetch(`/api/model/${m.table}/count`);
        const j = await r.json();
        return { table: m.table, count: j.count || 0 };
      } catch { return { table: m.table, count: 0 }; }
    })).then(results => {
      const map: Record<string, number> = {};
      results.forEach(r => map[r.table] = r.count);
      setCounts(map);
      setLoading(false);
    });
  }, [appConfig]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;

  const menu = appConfig?.menu || [];

  return (
    <div>
      <Title level={3} style={{ color: appConfig?.color }}>{appConfig?.name || moduleName}</Title>
      <Text type="secondary">{appConfig?.description || ''}</Text>
      <Row gutter={16} style={{ marginTop: 24 }}>
        {menu.map(m => (
          <Col key={m.table} xs={24} sm={12} lg={8} style={{ marginBottom: 16 }}>
            <Card hoverable onClick={() => navigate(`/app/${moduleName}/${m.table}`)}
              style={{ borderTop: `3px solid ${appConfig?.color || '#1677ff'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{getIcon(m.icon)}</span>
                <div>
                  <Text strong style={{ fontSize: 16 }}>{m.label}</Text>
                  <Tag style={{ marginLeft: 8, fontSize: 10 }}>{m.table}</Tag>
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>{m.desc}</Text>
              <div style={{ marginTop: 12 }}>
                <Statistic title="记录数" value={counts[m.table] || 0} valueStyle={{ fontSize: 20, color: appConfig?.color }} suffix="条" />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

function getIcon(name: string) { const m: Record<string, string> = { user: '👤', environment: '📍', inbox: '📦', file: '📄', bars: '📊', shop: '🏪' }; return m[name] || '📋'; }

export default ModuleHome;
