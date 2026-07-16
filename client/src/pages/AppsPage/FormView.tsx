/**
 * FormView — 新建/编辑表单页
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Card, Form, Input, Select, Button, Space, message, InputNumber, Switch, Spin, Typography, Breadcrumb } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title } = Typography;
const BASE = '/api';

interface FieldDef { name: string; type: string; label: string; required: boolean; selection?: Array<{ label: string; value: string }>; }
interface AppConfig { name: string; menu: Array<{ label: string; table: string }>; color: string; }

const FormView: React.FC = () => {
  const { module: moduleName = '', table: tableName = '', id } = useParams<{ module: string; table: string; id?: string }>();
  const navigate = useNavigate();
  const { appConfig } = useOutletContext<{ appConfig: AppConfig }>();
  const [fieldDefs, setFieldDefs] = useState<FieldDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const isEdit = id && id !== 'new';

  const menuLabel = appConfig?.menu?.find(m => m.table === tableName)?.label || tableName;

  useEffect(() => {
    setLoading(true);
    fetch(`${BASE}/model/${tableName}/fields`)
      .then(r => r.json())
      .then(j => {
        const fields = Array.isArray(j.fields) ? j.fields : [];
        setFieldDefs(fields);
        if (fields.length === 0) { setLoading(false); return; }
        // 编辑模式: 加载已有数据
        if (isEdit) {
          fetch(`${BASE}/model/${tableName}/browse/${id}`)
            .then(r => r.json())
            .then(j => {
              if (j.data) form.setFieldsValue(j.data);
              setLoading(false);
            });
        } else {
          // 设置默认值
          const defaults: Record<string, any> = {};
          fields.forEach(f => { if (f.default !== undefined && f.default !== null) defaults[f.name] = f.default; });
          form.setFieldsValue(defaults);
          setLoading(false);
        }
      });
  }, [tableName, id]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const url = isEdit
        ? `${BASE}/model/${tableName}/write/${id}`
        : `${BASE}/model/${tableName}/create`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const json = await res.json();
      if (json.error) { message.error(typeof json.error === 'string' ? json.error : '操作失败'); setSubmitting(false); return; }
      message.success(isEdit ? '更新成功' : '创建成功');
      navigate(`/app/${moduleName}/${tableName}`);
    } catch {}
    setSubmitting(false);
  };

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }} items={[
        { title: <a onClick={() => navigate(`/app/${moduleName}`)}>{appConfig?.name}</a> },
        { title: <a onClick={() => navigate(`/app/${moduleName}/${tableName}`)}>{menuLabel}</a> },
        { title: isEdit ? '编辑' : '新建' },
      ]} />
      <Card title={<Space><ArrowLeftOutlined onClick={() => navigate(-1)} style={{ cursor: 'pointer' }} /> <Title level={4} style={{ margin: 0, color: appConfig?.color }}>{isEdit ? '编辑' : '新建'} — {menuLabel}</Title></Space>}>
        {loading ? <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div> : (
          <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ maxWidth: 600 }}>
            {fieldDefs.filter(f => f.name !== 'id' && f.name !== 'created_at' && f.name !== 'updated_at').map(f => (
              <Form.Item key={f.name} name={f.name} label={f.label || f.name}
                rules={f.required ? [{ required: true, message: `${f.label || f.name} 为必填` }] : []}
                valuePropName={f.type === 'boolean' ? 'checked' : undefined}>
                {f.type === 'selection' && f.selection ? (
                  <Select allowClear options={f.selection.map(s => ({ label: s.label, value: s.value }))} placeholder={`选择${f.label}`} />
                ) : f.type === 'boolean' ? (
                  <Switch />
                ) : f.type === 'integer' ? (
                  <InputNumber style={{ width: '100%' }} />
                ) : f.type === 'float' ? (
                  <InputNumber style={{ width: '100%' }} step={0.01} />
                ) : f.type === 'text' ? (
                  <Input.TextArea rows={3} />
                ) : f.type === 'date' ? (
                  <Input type="date" />
                ) : (
                  <Input />
                )}
              </Form.Item>
            ))}
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={submitting}>{isEdit ? '保存' : '创建'}</Button>
                <Button onClick={() => navigate(-1)}>取消</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default FormView;
