/**
 * 更多应用 — 新功能入口
 * 集中管理: 博客/论坛/在线学习/财务管理/鞋服行业
 */
import React, { useState, useEffect } from 'react';
import { Table, Tabs, Card, Button, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const BASE = '/api';

const tabConfig: Record<string, { title: string; table: string; columns: Array<{ title: string; dataIndex: string; key?: string; render?: (v: any) => React.ReactNode }> }> = {
  blog: {
    title: '博客文章',
    table: 'blog_posts',
    columns: [
      { title: '标题', dataIndex: 'title' },
      { title: '作者', dataIndex: 'author_name' },
      { title: '分类', dataIndex: 'category_id' },
      { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v === 'published' ? 'green' : 'default'}>{v}</Tag> },
      { title: '发布时间', dataIndex: 'published_at' },
    ],
  },
  forum: {
    title: '论坛帖子',
    table: 'forum_threads',
    columns: [
      { title: '标题', dataIndex: 'title' },
      { title: '版块', dataIndex: 'board_id' },
      { title: '作者', dataIndex: 'author_name' },
      { title: '回复', dataIndex: 'reply_count' },
      { title: '状态', dataIndex: 'status', render: (v: string) => <Tag>{v}</Tag> },
    ],
  },
  elearning: {
    title: '在线课程',
    table: 'elearning_courses',
    columns: [
      { title: '课程名', dataIndex: 'title' },
      { title: '讲师', dataIndex: 'instructor_name' },
      { title: '难度', dataIndex: 'difficulty' },
      { title: '时长(分)', dataIndex: 'duration_minutes' },
      { title: '报名', dataIndex: 'enrollment_count' },
    ],
  },
  finance: {
    title: '会计科目表',
    table: 'account_chart',
    columns: [
      { title: '编码', dataIndex: 'code' },
      { title: '名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', render: (v: string) => {
        const map: Record<string, string> = { asset: '资产', liability: '负债', equity: '权益', cost: '成本', revenue: '收入', expense: '费用' };
        return <Tag>{map[v] || v}</Tag>;
      }},
      { title: '级次', dataIndex: 'level' },
    ],
  },
  shoe: {
    title: '款号列表',
    table: 'product_styles',
    columns: [
      { title: '款号', dataIndex: 'style_no' },
      { title: '名称', dataIndex: 'name' },
      { title: '性别', dataIndex: 'gender' },
      { title: '季节', dataIndex: 'season' },
      { title: '年份', dataIndex: 'year' },
    ],
  },
};

export default function AppsPage() {
  const [activeTab, setActiveTab] = useState('blog');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async (tab: string) => {
    if (!tabConfig[tab]) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/${tabConfig[tab].table}?pageSize=200`);
      const json = await res.json();
      const items = json.list || json.data || json || [];
      setData(Array.isArray(items) ? items : []);
    } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { loadData(activeTab); }, [activeTab]);

  const tabs = Object.entries(tabConfig).map(([key, cfg]) => ({
    key, label: cfg.title,
  }));

  return (
    <Card title="更多应用" extra={<Button icon={<PlusOutlined />} onClick={() => message.info('功能开发中')} size="small">新增</Button>}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />
      <Table
        dataSource={data}
        columns={tabConfig[activeTab]?.columns || []}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{ pageSize: 20 }}
      />
    </Card>
  );
}
