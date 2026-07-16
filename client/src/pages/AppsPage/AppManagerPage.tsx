/**
 * AppManagerPage — 应用管理中心
 *
 * 参照 KFlower MyApps.vue:
 *   - 卡片式应用列表
 *   - 搜索/过滤
 *   - 状态标签(已发布/草稿/归档)
 *   - 操作: 进入应用/编辑/发布/卸载
 *   - 统计信息(模型数/菜单数/版本)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Row, Col, Tag, Button, Space, Input, Dropdown, Empty, Spin, Statistic, Typography, Popconfirm, message, Tooltip, Badge } from 'antd';
import { AppstoreOutlined, SearchOutlined, PlusOutlined, EllipsisOutlined, RocketOutlined, ReloadOutlined, DeleteOutlined, EditOutlined, EyeOutlined, StopOutlined, SettingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const BASE = '/api';

interface AppInfo {
  id: string; name: string; description: string; icon: string; color: string;
  version: string; models: number; menu: number; status: string; author: string;
}

const statusMap: Record<string, { color: string; label: string }> = {
  published: { color: 'green', label: '已发布' },
  draft: { color: 'orange', label: '草稿' },
  archived: { color: 'default', label: '已归档' },
};

const AppManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE}/apps/list`);
      const data = await r.json();
      setApps(Array.isArray(data) ? data : []);
    } catch { message.error('加载应用列表失败'); }
    setLoading(false);
  }, []);

  useEffect(() => { loadApps(); }, [loadApps]);

  const handleAction = async (key: string, app: AppInfo) => {
    if (key === 'enter') { navigate(`/app/${app.id}`); return; }
    if (key === 'design') { navigate(`/lowcode?edit=${app.id}`); return; }
    if (key === 'publish') {
      await fetch(`${BASE}/apps/publish`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: app.id, status: 'published' }),
      });
      message.success('发布成功');
      loadApps();
      return;
    }
    if (key === 'unpublish') {
      await fetch(`${BASE}/apps/publish`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName: app.id, status: 'draft' }),
      });
      message.success('已下架');
      loadApps();
      return;
    }
    if (key === 'delete') {
      const r = await fetch(`${BASE}/apps/unlink/${app.id}`, { method: 'DELETE' });
      const j = await r.json();
      if (j.error) { message.error(j.error); return; }
      message.success('已删除');
      loadApps();
      return;
    }
  };

  const filtered = apps
    .filter(a => !filterStatus || a.status === filterStatus)
    .filter(a => !search || a.name.includes(search) || a.description.includes(search) || a.id.includes(search));

  const published = apps.filter(a => a.status === 'published').length;
  const drafts = apps.filter(a => a.status === 'draft').length;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}><AppstoreOutlined /> 应用管理</Title>
          <Text type="secondary">管理已创建的应用模块</Text>
        </div>
        <Space size="middle">
          <Input.Search placeholder="搜索应用..." allowClear onSearch={setSearch} prefix={<SearchOutlined />} style={{ width: 220 }} />
          <Button icon={<ReloadOutlined />} onClick={loadApps}>刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/lowcode')}>新建应用</Button>
        </Space>
      </div>

      {/* 统计栏 */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}><Card size="small"><Statistic title="全部应用" value={apps.length} prefix={<AppstoreOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已发布" value={published} valueStyle={{ color: '#52c41a' }} prefix={<RocketOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="草稿" value={drafts} valueStyle={{ color: '#faad14' }} prefix={<EditOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="模型总数" value={apps.reduce((s,a) => s + a.models, 0)} prefix={<SettingOutlined />} /></Card></Col>
      </Row>

      {/* 状态过滤 */}
      <Space style={{ marginBottom: 16 }}>
        {['', 'published', 'draft', 'archived'].map(s => (
          <Tag.CheckableTag key={s} checked={filterStatus === s} onChange={() => setFilterStatus(s)}
            style={{ padding: '2px 10px' }}>
            {s ? statusMap[s]?.label + ' ' + apps.filter(a => a.status === s).length : '全部 ' + apps.length}
          </Tag.CheckableTag>
        ))}
      </Space>

      {/* 应用列表 */}
      {loading ? <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div> : filtered.length === 0 ? (
        <Empty description="暂无应用" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/lowcode')}>新建第一个应用</Button>
        </Empty>
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map(app => {
            const st = statusMap[app.status] || statusMap.published;
            return (
              <Col key={app.id} xs={24} sm={12} lg={8}>
                <Card hoverable size="small" style={{ borderTop: `3px solid ${app.color || '#1677ff'}`, height: '100%' }}
                  actions={[
                    <Tooltip title="进入应用"><Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/app/${app.id}`)}>进入</Button></Tooltip>,
                    app.status === 'draft' && (
                      <Tooltip title="发布"><Button type="link" icon={<RocketOutlined />} onClick={() => handleAction('publish', app)}>发布</Button></Tooltip>
                    ),
                    app.status === 'published' && (
                      <Tooltip title="下架"><Button type="link" icon={<StopOutlined />} onClick={() => handleAction('unpublish', app)}>下架</Button></Tooltip>
                    ),
                    <Popconfirm title="确认删除此应用?" description="删除后不可恢复" onConfirm={() => handleAction('delete', app)} okText="确认" cancelText="取消">
                      <Tooltip title="删除"><Button type="link" danger icon={<DeleteOutlined />}>删除</Button></Tooltip>
                    </Popconfirm>,
                  ].filter(Boolean)}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 28 }}>{app.icon}</span>
                      <div>
                        <Text strong style={{ fontSize: 15 }}>{app.name}</Text>
                        <div><Text code style={{ fontSize: 11 }}>{app.id}</Text></div>
                      </div>
                    </div>
                    <Space size={4}>
                      <Tag color={st.color} style={{ fontSize: 10 }}>{st.label}</Tag>
                      <Tag style={{ fontSize: 10 }}>v{app.version}</Tag>
                    </Space>
                  </div>
                  {/* Description */}
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ marginBottom: 12, fontSize: 13, minHeight: 36 }}>
                    {app.description || '暂无描述'}
                  </Paragraph>
                  {/* Stats */}
                  <Row gutter={8}>
                    <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>📊 模型</Text><div><Text strong>{app.models}</Text></div></Col>
                    <Col span={8}><Text type="secondary" style={{ fontSize: 11 }}>📋 菜单</Text><div><Text strong>{app.menu}</Text></div></Col>
                    <Col span={8}>{app.author && <><Text type="secondary" style={{ fontSize: 11 }}>👤 作者</Text><div><Text strong style={{ fontSize: 12 }}>{app.author}</Text></div></>}</Col>
                  </Row>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </div>
  );
};

export default AppManagerPage;
