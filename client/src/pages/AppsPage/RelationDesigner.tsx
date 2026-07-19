/**
 * RelationDesigner — 表单关联关系设计器
 *
 * 参照 KFlower RelationDesigner.vue 设计:
 *   管理应用内表单间的关联关系 (belongs_to / has_many / many_to_many)
 *   支持: 显示字段配置、删除策略、自动填充字段
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Table, Tag, Modal, Form, Input, Select, Space, message, Empty, Typography, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';

const { Text } = Typography;
const BASE = '/api';

interface FormRelation {
  id: string;
  from_template_id: string;
  from_template_name: string;
  from_field_name: string;
  relation_type: 'belongs_to' | 'has_many' | 'many_to_many';
  to_template_id: string;
  to_template_name: string;
  display_field: string;
  auto_fill_fields?: Array<{ from: string; to: string }>;
  on_delete: 'cascade' | 'set_null';
}

interface Template {
  id: string; name: string; fields?: Array<{ name: string; label: string }>;
}

const RELATION_TYPE_LABELS: Record<string, string> = {
  belongs_to: '属于 (多对一)',
  has_many: '拥有 (一对多)',
  many_to_many: '多对多',
};

const RELATION_TYPE_TAG_COLORS: Record<string, string> = {
  belongs_to: 'blue',
  has_many: 'green',
  many_to_many: 'purple',
};

interface Props {
  appId: string;
  models?: Array<{ _name: string; label?: string; fields?: any[] }>;
}

const RelationDesigner: React.FC<Props> = ({ appId, models = [] }) => {
  const [relations, setRelations] = useState<FormRelation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingRelation, setEditingRelation] = useState<FormRelation | null>(null);
  const [form] = Form.useForm();
  const [selectedFromTemplate, setSelectedFromTemplate] = useState<Template | null>(null);
  const [selectedToTemplate, setSelectedToTemplate] = useState<Template | null>(null);

  const loadRelations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/apps/${appId}/relations`);
      const data = await res.json();
      if (data.success) setRelations(data.data || []);
    } catch { message.error('加载关系失败'); }
    finally { setLoading(false); }
  }, [appId]);

  useEffect(() => { loadRelations(); }, [loadRelations]);

  const getTemplates = (): Template[] => {
    if (models.length > 0) {
      return models.map(m => ({
        id: m._name,
        name: m.label || m._name,
        fields: (m._fields ? Object.entries(m._fields).map(([k,v]:[string,any]) => ({
          name: k, label: v.label || k
        })) : []),
      }));
    }
    return [];
  };

  const templates = getTemplates();

  const openCreateDialog = () => {
    setEditingRelation(null);
    form.resetFields();
    form.setFieldsValue({ relation_type: 'belongs_to', on_delete: 'set_null' });
    setSelectedFromTemplate(null);
    setSelectedToTemplate(null);
    setDialogVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const method = editingRelation ? 'PUT' : 'POST';
      const url = editingRelation
        ? `${BASE}/apps/${appId}/relations/${editingRelation.id}`
        : `${BASE}/apps/${appId}/relations`;
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (data.success) {
        message.success(editingRelation ? '已更新' : '已创建');
        setDialogVisible(false);
        loadRelations();
      } else {
        message.error(data.error || '操作失败');
      }
    } catch {}
  };

  const deleteRelation = async (id: string) => {
    try {
      const res = await fetch(`${BASE}/apps/${appId}/relations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { message.success('已删除'); loadRelations(); }
      else message.error(data.error || '删除失败');
    } catch { message.error('删除失败'); }
  };

  const columns = [
    { title: '源表单', dataIndex: 'from_template_name', width: 160 },
    { title: '关联字段', dataIndex: 'from_field_name', width: 130 },
    {
      title: '关系类型', dataIndex: 'relation_type', width: 130,
      render: (v: string) => <Tag color={RELATION_TYPE_TAG_COLORS[v] || 'default'}>{RELATION_TYPE_LABELS[v] || v}</Tag>,
    },
    { title: '目标表单', dataIndex: 'to_template_name', width: 160 },
    { title: '显示字段', dataIndex: 'display_field', width: 120 },
    {
      title: '删除策略', dataIndex: 'on_delete', width: 100,
      render: (v: string) => v === 'cascade' ? <Tag color="red">级联删除</Tag> : <Tag>置空</Tag>,
    },
    {
      title: '操作', width: 80, fixed: 'right' as const,
      render: (_: any, record: FormRelation) => (
        <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => deleteRelation(record.id)} />
      ),
    },
  ];

  return (
    <Card
      title="表单关联关系"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadRelations} size="small">刷新</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateDialog} size="small">新建关系</Button>
        </Space>
      }
    >
      <Alert
        type="info" showIcon
        message="关联关系用于建立表单之间的数据关联：客户-订单（一对多）、订单-产品（多对多）、订单-客户（多对一）"
        style={{ marginBottom: 16 }}
      />

      {relations.length === 0 ? (
        <Empty description="暂无关联关系，点击「新建关系」创建" />
      ) : (
        <Table
          dataSource={relations} columns={columns} rowKey="id" loading={loading}
          scroll={{ x: 900 }} size="small" bordered
        />
      )}

      <Modal
        title={editingRelation ? '编辑关系' : '新建关联关系'}
        open={dialogVisible}
        onCancel={() => setDialogVisible(false)}
        onOk={handleSave}
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="源表单" name="from_template_id" rules={[{ required: true, message: '请选择' }]}>
            <Select
              placeholder="选择源表单"
              options={templates.map(t => ({ label: t.name, value: t.id }))}
              onChange={(id: string) => {
                const t = templates.find(t => t.id === id);
                setSelectedFromTemplate(t || null);
              }}
            />
          </Form.Item>
          <Form.Item label="关联字段" name="from_field_name" rules={[{ required: true, message: '请输入' }]}
            tooltip="在源表单中存储目标表单ID的字段名, 如 customer_id">
            <Input placeholder="如: customer_id" />
          </Form.Item>
          <Form.Item label="关系类型" name="relation_type" rules={[{ required: true }]}>
            <Select options={Object.entries(RELATION_TYPE_LABELS).map(([k, v]) => ({ label: v, value: k }))} />
          </Form.Item>
          <Form.Item label="目标表单" name="to_template_id" rules={[{ required: true, message: '请选择' }]}>
            <Select
              placeholder="选择目标表单"
              options={templates.map(t => ({ label: t.name, value: t.id }))}
              onChange={(id: string) => {
                const t = templates.find(t => t.id === id);
                setSelectedToTemplate(t || null);
              }}
            />
          </Form.Item>
          <Form.Item label="显示字段" name="display_field"
            tooltip="关联后在列表/下拉中显示的字段, 如 name">
            <Input placeholder="如: name" />
          </Form.Item>
          <Form.Item label="删除策略" name="on_delete" initialValue="set_null">
            <Select options={[
              { label: '置空 (SET NULL)', value: 'set_null' },
              { label: '级联删除 (CASCADE)', value: 'cascade' },
            ]} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default RelationDesigner;
