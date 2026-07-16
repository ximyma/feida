/**
 * DetailView — 记录详情页 (只读)
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Spin, Tag, Typography, Breadcrumb, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const BASE = '/api';

interface AppConfig { name: string; menu: Array<{ label: string; table: string }>; color: string; }

const DetailView: React.FC = () => {
  const { module: moduleName = '', table: tableName = '', id = '' } = useParams<{ module: string; table: string; id: string }>();
  const navigate = useNavigate();
  const { appConfig } = useOutletContext<{ appConfig: AppConfig }>();
  const [record, setRecord] = useState<any>(null);
  const [fieldDefs, setFieldDefs] = useState<Array<{ name: string; type: string; label: string; selection?: Array<{ label: string; value: string }> }>>([]);
  const [loading, setLoading] = useState(true);

  const menuLabel = appConfig?.menu?.find(m => m.table === tableName)?.label || tableName;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${BASE}/model/${tableName}/fields`).then(r => r.json()),
      fetch(`${BASE}/model/${tableName}/browse/${id}`).then(r => r.json()),
    ]).then(([fJson, dJson]) => {
      setFieldDefs(Array.isArray(fJson.fields) ? fJson.fields : []);
      setRecord(dJson.data || null);
      setLoading(false);
    });
  }, [tableName, id]);

  const handleDelete = async () => {
    await fetch(`${BASE}/model/${tableName}/unlink/${id}`, { method: 'DELETE' });
    message.success('已删除');
    navigate(`/app/${moduleName}/${tableName}`);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>;
  if (!record) return <div style={{ textAlign: 'center', padding: 60 }}><Text type="secondary">记录不存在</Text></div>;

  const renderValue = (field: any, value: any) => {
    if (value === null || value === undefined) return <Text type="secondary">—</Text>;
    if (field.type === 'boolean') return <Tag color={value ? 'green' : 'red'}>{value ? '是' : '否'}</Tag>;
    if (field.type === 'selection' && field.selection) {
      const opt = field.selection.find((s: any) => s.value === String(value));
      return <Tag>{opt?.label || value}</Tag>;
    }
    if (field.type === 'many2one' && field.relation) {
      return (
        <Button type="link" size="small" onClick={async () => {
          try {
            const r = await fetch(`${BASE}/model/${field.relation}/browse/${value}`);
            const j = await r.json();
            if (j.data) message.info(`${field.relation}: ${j.data.name || j.data.id}`);
          } catch {}
        }}>{value}</Button>
      );
    }
    return <Text copyable={typeof value === 'string' && value.length < 20}>{String(value)}</Text>;
  };

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <a onClick={() => navigate(`/app/${moduleName}`)}>{appConfig?.name}</a> },
        { title: <a onClick={() => navigate(`/app/${moduleName}/${tableName}`)}>{menuLabel}</a> },
        { title: `#${id}` },
      ]} />
      <Card
        title={<Space><ArrowLeftOutlined onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} /> <Title level={4} style={{ margin: 0, color: appConfig?.color }}>{menuLabel} — #{id}</Title></Space>}
        extra={
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate(`/app/${moduleName}/${tableName}/${id}/edit`)}>编辑</Button>
            <Popconfirm title="确认删除?" onConfirm={handleDelete}>
              <Button danger icon={<DeleteOutlined />}>删除</Button>
            </Popconfirm>
          </Space>
        }>
        <Descriptions column={2} bordered size="small">
          {fieldDefs.map(f => (
            <Descriptions.Item key={f.name} label={f.label || f.name} span={f.type === 'text' ? 2 : 1}>
              {renderValue(f, record[f.name])}
            </Descriptions.Item>
          ))}
          <Descriptions.Item label="ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{record.created_at || '—'}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{record.updated_at || '—'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default DetailView;
