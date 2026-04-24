import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Tag, Space, message, Row, Col, Statistic,
  Drawer, Descriptions, Badge, Divider, Select, Input, DatePicker,
  Timeline, Tooltip
} from 'antd';
import {
  ReloadOutlined, EyeOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ClockCircleOutlined, FileSearchOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const TABLE = 'approval_requests';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: '待审批', color: 'gold' },
  approved: { label: '已通过', color: 'green' },
  rejected: { label: '已拒绝', color: 'red' },
  cancelled: { label: '已撤销', color: 'default' },
};

const TYPE_MAP: Record<string, string> = {
  leave: '请假', overtime: '加班', resignation: '离职',
  transfer: '调岗', promotion: '晋升', expense: '报销',
  purchase: '采购', other: '其他',
};

interface IRecord {
  id: string;
  employeeId: string;
  employeeName?: string;
  type?: string;
  title?: string;
  content?: string;
  status?: string;
  createdAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectReason?: string;
  currentNode?: string;
  [k: string]: any;
}

export default function RecordPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<IRecord | null>(null);

  const stats = {
    total: data.length,
    pending: data.filter(r => r.status === 'pending').length,
    approved: data.filter(r => r.status === 'approved').length,
    rejected: data.filter(r => r.status === 'rejected').length,
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pagination.current > 1) params.set('page', String(pagination.current));
      if (pagination.pageSize !== 20) params.set('pageSize', String(pagination.pageSize));
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      setData(rows);
      setPagination(p => ({ ...p, total: json.total || rows.length }));
    } catch {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, search, statusFilter, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const viewDetail = (r: IRecord) => { setViewing(r); setDrawerOpen(true); };

  const columns = [
    {
      title: '申请人', dataIndex: 'employeeName', key: 'employeeName', width: 100,
      render: (v: string, r: IRecord) => <Space><UserOutlined style={{ color: '#1890ff' }} />{v || r.employeeId}</Space>,
    },
    {
      title: '审批类型', dataIndex: 'type', key: 'type', width: 100,
      render: (v: string) => <Tag color="blue">{TYPE_MAP[v] || v || '-'}</Tag>,
    },
    {
      title: '标题', dataIndex: 'title', key: 'title', width: 180, ellipsis: true,
      render: (v: string) => <Tooltip title={v}>{v || '-'}</Tooltip>,
    },
    {
      title: '当前节点', dataIndex: 'currentNode', key: 'currentNode', width: 120,
      render: (v: string) => v ? <Tag color="processing">{v}</Tag> : '-',
    },
    {
      title: '提交时间', dataIndex: 'createdAt', key: 'createdAt', width: 160,
      render: (v: string) => v ? String(v).slice(0, 19).replace('T', ' ') : '-',
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (v: string) => {
        const s = STATUS_MAP[v];
        return s ? <Badge status={s.color === 'green' ? 'success' : s.color === 'red' ? 'error' : s.color === 'gold' ? 'warning' : 'default' as any} text={s.label} /> : <Tag>{v || '-'}</Tag>;
      },
    },
    {
      title: '操作', key: 'action', fixed: 'right' as const, width: 80,
      render: (_: any, r: IRecord) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => viewDetail(r)}>详情</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" hoverable><Statistic title="全部审批" value={stats.total} prefix={<FileSearchOutlined />} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="待审批" value={stats.pending} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="已通过" value={stats.approved} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="已拒绝" value={stats.rejected} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} /></Card></Col>
      </Row>

      <Card
        title={<span style={{ fontSize: 18, fontWeight: 600 }}>审批记录</span>}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: '16px 16px 0' }}>
          <Space wrap>
            <Input.Search placeholder="搜索申请人..." value={search} onChange={e => setSearch(e.target.value)}
              onSearch={() => setPagination(p => ({ ...p, current: 1 }))} style={{ width: 220 }} allowClear />
            <Select placeholder="审批类型" value={typeFilter || undefined}
              onChange={v => { setTypeFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}
              options={Object.entries(TYPE_MAP).map(([k, v]) => ({ value: k, label: v }))} allowClear style={{ width: 140 }} />
            <Select placeholder="审批状态" value={statusFilter || undefined}
              onChange={v => { setStatusFilter(v || ''); setPagination(p => ({ ...p, current: 1 })); }}
              options={Object.entries(STATUS_MAP).map(([k, v]) => ({ value: k, label: v.label }))} allowClear style={{ width: 140 }} />
            <Button icon={<ReloadOutlined />} onClick={() => { setPagination(p => ({ ...p, current: 1 })); fetchData(); }}>刷新</Button>
          </Space>
        </div>
        <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
          pagination={{ ...pagination, showSizeChanger: true, showQuickJumper: true, showTotal: (t: number) => `共 ${t} 条` }}
          onChange={pag => setPagination(p => ({ ...p, current: pag.current || 1, pageSize: pag.pageSize || 20 }))}
          scroll={{ x: 'max-content' }} size="middle" style={{ marginTop: 8 }} />
      </Card>

      <Drawer title="审批详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={520}>
        {viewing && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="申请人">{viewing.employeeName || viewing.employeeId}</Descriptions.Item>
              <Descriptions.Item label="审批类型"><Tag color="blue">{TYPE_MAP[viewing.type || ''] || viewing.type || '-'}</Tag></Descriptions.Item>
              <Descriptions.Item label="标题">{viewing.title || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {(() => { const s = STATUS_MAP[viewing.status || '']; return s ? <Badge status={s.color === 'green' ? 'success' : s.color === 'red' ? 'error' : s.color === 'gold' ? 'warning' : 'default' as any} text={s.label} /> : <Tag>{viewing.status || '-'}</Tag>; })()}
              </Descriptions.Item>
              <Descriptions.Item label="提交时间">{viewing.createdAt ? String(viewing.createdAt).slice(0, 19).replace('T', ' ') : '-'}</Descriptions.Item>
              {viewing.content && <Descriptions.Item label="审批内容">{viewing.content}</Descriptions.Item>}
            </Descriptions>

            <Divider>审批流程</Divider>
            <Timeline
              items={[
                { color: 'green', children: <div><strong>提交申请</strong><br /><span style={{ color: '#999' }}>{viewing.createdAt ? String(viewing.createdAt).slice(0, 19).replace('T', ' ') : '-'}</span></div> },
                ...(viewing.status === 'pending' ? [{
                  color: 'gold' as const,
                  children: <div><strong>等待审批</strong>{viewing.currentNode ? <><br />当前节点: {viewing.currentNode}</> : ''}</div>
                }] : []),
                ...(viewing.status === 'approved' ? [{
                  color: 'green' as const,
                  children: <div><strong>审批通过</strong><br />{viewing.approvedBy ? `审批人: ${viewing.approvedBy}` : ''}<br /><span style={{ color: '#999' }}>{viewing.approvedAt ? String(viewing.approvedAt).slice(0, 19).replace('T', ' ') : ''}</span></div>
                }] : []),
                ...(viewing.status === 'rejected' ? [{
                  color: 'red' as const,
                  children: <div><strong>审批拒绝</strong><br />{viewing.approvedBy ? `审批人: ${viewing.approvedBy}` : ''}{viewing.rejectReason ? <><br />拒绝原因: <span style={{ color: '#ff4d4f' }}>{viewing.rejectReason}</span></> : ''}<br /><span style={{ color: '#999' }}>{viewing.approvedAt ? String(viewing.approvedAt).slice(0, 19).replace('T', ' ') : ''}</span></div>
                }] : []),
              ]}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
