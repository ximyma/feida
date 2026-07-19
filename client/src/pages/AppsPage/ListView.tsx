/**
 * ListView — 数据列表页
 *
 * 支持搜索、过滤、分页、批量删除，点击行进入详情
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Table, Button, Input, Space, Tag, Popconfirm, Tooltip, message, Row, Col, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';

const { Title } = Typography;
const BASE = '/api';

interface FieldDef { name: string; type: string; label: string; required: boolean; selection?: Array<{ label: string; value: string }>; }
interface AppConfig { name: string; menu: Array<{ label: string; table: string; icon: string; desc: string }>; color: string; }

const ListView: React.FC = () => {
  const { module: moduleName = '', table: tableName = '' } = useParams<{ module: string; table: string }>();
  const navigate = useNavigate();
  const { appConfig } = useOutletContext<{ appConfig: AppConfig }>();
  const [fieldDefs, setFieldDefs] = useState<FieldDef[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const menuLabel = appConfig?.menu?.find(m => m.table === tableName)?.label || tableName;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fRes, dRes] = await Promise.all([
        fetch(`${BASE}/model/${tableName}/fields`),
        fetch(`${BASE}/model/${tableName}/search?limit=200`),
      ]);
      const fJson = await fRes.json();
      const dJson = await dRes.json();
      setFieldDefs(Array.isArray(fJson.fields) ? fJson.fields : []);
      setData(Array.isArray(dJson.data) ? dJson.data : []);
    } catch { message.error('加载失败'); }
    setLoading(false);
  }, [tableName]);

  useEffect(() => { loadData(); }, [loadData]);

  // 加载 many2one 关联数据缓存(显示名称)
  useEffect(() => {
    const many2oneFields = fieldDefs.filter(f => f.type === 'many2one');
    for (const f of many2oneFields) {
      const relTable = (f as any).relation || f.name.replace(/_id$/, '');
      fetch(`${BASE}/model/${relTable}?limit=500`)
        .then(r => r.json())
        .then(j => {
          if (Array.isArray(j)) {
            const cache: Record<string, string> = {};
            j.forEach((r: any) => {
              cache[r.id] = r.name || r.title || r.label || r[Object.keys(r)[0]];
            });
            (f as any)._relatedCache = cache;
            setFieldDefs(prev => [...prev]); // 触发重新渲染
          }
        }).catch(() => {});
    }
  }, [fieldDefs.length, tableName]);

  const handleDelete = async (id: string) => {
    await fetch(`${BASE}/model/${tableName}/unlink/${id}`, { method: 'DELETE' });
    message.success('已删除');
    loadData();
  };

  const handleBatchDelete = async () => {
    for (const id of selectedRowKeys) {
      await fetch(`${BASE}/model/${tableName}/unlink/${id}`, { method: 'DELETE' });
    }
    message.success(`已删除 ${selectedRowKeys.length} 条`);
    setSelectedRowKeys([]);
    loadData();
  };

  const filtered = search
    ? data.filter(row => {
        const str = JSON.stringify(row).toLowerCase();
        return str.includes(search.toLowerCase());
      })
    : data;

  const columns = [
    ...fieldDefs.slice(0, 6).map(f => ({
      title: f.label || f.name, dataIndex: f.name, key: f.name, ellipsis: true,
      render: f.type === 'boolean' ? (v: any) => <Tag color={v ? 'green' : 'default'}>{v ? '是' : '否'}</Tag>
        : f.type === 'selection' ? (v: string) => {
            const opt = f.selection?.find(s => s.value === v);
            return <Tag>{opt?.label || v}</Tag>;
          }
        : f.type === 'many2one' ? (v: string) => {
            // 通过关系数据表缓存显示名称
            const relName = (f as any)._relatedCache?.[v];
            return relName || v || '';
          }
        : f.type === 'date' || f.type === 'datetime' ? (v: string) => {
            if (!v) return '';
            return new Date(v).toLocaleDateString('zh-CN', { year:'numeric',month:'2-digit',day:'2-digit' });
          }
        : f.type === 'monetary' ? (v: number) => {
            if (v == null) return '';
            return `¥${Number(v).toLocaleString('zh-CN', {minimumFractionDigits:2})}`;
          }
        : undefined,
      sorter: (a: any, b: any) => {
        const va = a[f.name]; const vb = b[f.name];
        if (va == null) return 1; if (vb == null) return -1;
        return String(va).localeCompare(String(vb));
      },
    })),
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', width: 160, ellipsis: true, sorter: (a: any, b: any) => (a.updated_at || '').localeCompare(b.updated_at || '') },
    { title: '操作', key: 'actions', width: 140, render: (_: any, rec: any) => (
      <Space size="small">
        <Tooltip title="查看"><Button type="link" size="small" icon={<EyeOutlined />} onClick={() => navigate(`/app/${moduleName}/${tableName}/${rec.id}`)} /></Tooltip>
        <Tooltip title="编辑"><Button type="link" size="small" icon={<EditOutlined />} onClick={() => navigate(`/app/${moduleName}/${tableName}/${rec.id}/edit`)} /></Tooltip>
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(rec.id)}>
          <Tooltip title="删除"><Button type="link" size="small" danger icon={<DeleteOutlined />} /></Tooltip>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0, color: appConfig?.color }}>{menuLabel}</Title>
          <span style={{ color: '#999', fontSize: 12 }}>{tableName} — {filtered.length} 条记录</span>
        </Col>
        <Col>
          <Space>
            {selectedRowKeys.length > 0 && (
              <Popconfirm title={`删除 ${selectedRowKeys.length} 条?`} onConfirm={handleBatchDelete}>
                <Button danger icon={<DeleteOutlined />}>批量删除({selectedRowKeys.length})</Button>
              </Popconfirm>
            )}
            <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/app/${moduleName}/${tableName}/new`)}>新建</Button>
          </Space>
        </Col>
      </Row>
      <Input.Search placeholder="搜索..." allowClear onSearch={setSearch} onChange={e => setSearch(e.target.value)}
        prefix={<SearchOutlined />} style={{ marginBottom: 16, maxWidth: 400 }} />
      <Table dataSource={filtered} columns={columns} rowKey="id" size="middle" loading={loading}
        scroll={{ x: 900 }}
        rowSelection={{ selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys) }}
        onRow={(rec) => ({ onClick: () => navigate(`/app/${moduleName}/${tableName}/${rec.id}`), style: { cursor: 'pointer' } })}
        pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (t, r) => `${r[0]}-${r[1]} / ${t} 条` }} />
    </div>
  );
};

export default ListView;
