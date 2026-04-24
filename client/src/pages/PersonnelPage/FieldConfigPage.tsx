import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select, Switch, InputNumber,
  Tag, Space, Popconfirm, message, Badge, Drawer, Descriptions, Statistic,
  Row, Col, Tooltip
} from "antd";
const { Option } = Select;
const { TextArea } = Input;
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  SettingOutlined, EyeOutlined
} from "@ant-design/icons";

const TABLE = "field_definitions";

const FIELD_TYPES = [
  { value: "text", label: "文本" },
  { value: "number", label: "数字" },
  { value: "date", label: "日期" },
  { value: "select", label: "下拉选择" },
  { value: "textarea", label: "多行文本" },
  { value: "checkbox", label: "复选框" },
  { value: "radio", label: "单选框" },
  { value: "file", label: "文件上传" },
];

const GROUP_OPTIONS = [
  { value: "basic", label: "基本信息" },
  { value: "work", label: "工作信息" },
  { value: "contact", label: "联系方式" },
  { value: "education", label: "教育背景" },
  { value: "family", label: "家庭信息" },
  { value: "bank", label: "银行账户" },
  { value: "contract", label: "合同信息" },
  { value: "custom", label: "自定义" },
];

interface IRecord {
  id: number;
  name: string;
  fieldKey: string;
  type: string;
  groupName: string;
  visibility: number;
  required: number;
  displayOrder: number;
  isSystem: number;
  options: string | null;
  defaultValue: string | null;
  validation: string | null;
  createdAt: string;
}

export default function FieldConfigPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<IRecord | null>(null);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [groupFilter, setGroupFilter] = useState<string>("");
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);
      if (typeFilter) params.append("type", typeFilter);
      if (groupFilter) params.append("groupName", groupFilter);
      
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const result = await res.json();
      setData(result.data || []);
    } catch (err) {
      message.error("加载失败");
    } finally {
      setLoading(false);
    }
  }, [searchText, typeFilter, groupFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: IRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      visibility: Boolean(record.visibility),
      required: Boolean(record.required),
      isSystem: Boolean(record.isSystem),
    });
    setModalVisible(true);
  };

  const handleView = (record: IRecord) => {
    setViewingRecord(record);
    setDrawerVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, { method: "DELETE" });
      message.success("删除成功");
      fetchData();
    } catch {
      message.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        visibility: values.visibility ? 1 : 0,
        required: values.required ? 1 : 0,
        isSystem: values.isSystem ? 1 : 0,
      };
      
      if (editingRecord) {
        await fetch(`/api/${TABLE}/${editingRecord.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        message.success("更新成功");
      } else {
        await fetch(`/api/${TABLE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        message.success("创建成功");
      }
      setModalVisible(false);
      fetchData();
    } catch {
      message.error("操作失败");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { 
      title: "字段名称", 
      dataIndex: "name",
      render: (v: string) => <Tag color="blue">{v}</Tag>
    },
    { 
      title: "字段标识", 
      dataIndex: "fieldKey",
      render: (v: string) => <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 3 }}>{v}</code>
    },
    {
      title: "字段类型",
      dataIndex: "type",
      render: (v: string) => {
        const type = FIELD_TYPES.find(t => t.value === v);
        return <Tag color="purple">{type?.label || v}</Tag>;
      },
    },
    {
      title: "分组",
      dataIndex: "groupName",
      render: (v: string) => {
        const group = GROUP_OPTIONS.find(g => g.value === v);
        return group?.label || v;
      },
    },
    {
      title: "显示顺序",
      dataIndex: "displayOrder",
      width: 100,
      sorter: (a: IRecord, b: IRecord) => a.displayOrder - b.displayOrder,
    },
    {
      title: "可见",
      dataIndex: "visibility",
      width: 80,
      render: (v: number) => (
        <Badge status={v ? "success" : "default"} text={v ? "是" : "否"} />
      ),
    },
    {
      title: "必填",
      dataIndex: "required",
      width: 80,
      render: (v: number) => (
        <Badge status={v ? "error" : "default"} text={v ? "是" : "否"} />
      ),
    },
    {
      title: "系统字段",
      dataIndex: "isSystem",
      width: 90,
      render: (v: number) => (
        <Tag color={v ? "orange" : "default"}>{v ? "系统" : "自定义"}</Tag>
      ),
    },
    {
      title: "操作",
      width: 160,
      render: (_: any, record: IRecord) => (
        <Space>
          <Tooltip title="查看">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: data.length,
    visible: data.filter(d => d.visibility).length,
    required: data.filter(d => d.required).length,
    system: data.filter(d => d.isSystem).length,
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="总字段数" value={stats.total} prefix={<SettingOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="可见字段" value={stats.visible} valueStyle={{ color: "#3f8600" }} />
          </Col>
          <Col span={6}>
            <Statistic title="必填字段" value={stats.required} valueStyle={{ color: "#cf1322" }} />
          </Col>
          <Col span={6}>
            <Statistic title="系统字段" value={stats.system} valueStyle={{ color: "#fa8c16" }} />
          </Col>
        </Row>
      </Card>

      <Card
        title="字段配置列表"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索字段名"
              allowClear
              style={{ width: 150 }}
              onSearch={setSearchText}
            />
            <Select
              placeholder="字段类型"
              allowClear
              style={{ width: 120 }}
              onChange={setTypeFilter}
            >
              {FIELD_TYPES.map(t => (
                <Option key={t.value} value={t.value}>{t.label}</Option>
              ))}
            </Select>
            <Select
              placeholder="分组"
              allowClear
              style={{ width: 120 }}
              onChange={setGroupFilter}
            >
              {GROUP_OPTIONS.map(g => (
                <Option key={g.value} value={g.value}>{g.label}</Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增字段</Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title={editingRecord ? "编辑字段" : "新增字段"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="字段名称" rules={[{ required: true }]}>
                <Input placeholder="请输入字段名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fieldKey" label="字段标识" rules={[{ required: true }]}>
                <Input placeholder="如: employeeNo" disabled={!!editingRecord} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="type" label="字段类型" rules={[{ required: true }]}>
                <Select placeholder="选择字段类型">
                  {FIELD_TYPES.map(t => (
                    <Option key={t.value} value={t.value}>{t.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="groupName" label="所属分组" rules={[{ required: true }]}>
                <Select placeholder="选择分组">
                  {GROUP_OPTIONS.map(g => (
                    <Option key={g.value} value={g.value}>{g.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="displayOrder" label="显示顺序" initialValue={0}>
                <InputNumber min={0} max={999} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="visibility" label="是否可见" valuePropName="checked" initialValue={true}>
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="required" label="是否必填" valuePropName="checked" initialValue={false}>
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="options" label="选项值">
            <TextArea rows={3} placeholder="下拉选项，每行一个" />
          </Form.Item>
          <Form.Item name="defaultValue" label="默认值">
            <Input placeholder="字段的默认值" />
          </Form.Item>
          <Form.Item name="validation" label="校验规则">
            <Input placeholder="如: email, phone, idcard" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="字段详情"
        placement="right"
        width={500}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{viewingRecord.id}</Descriptions.Item>
            <Descriptions.Item label="字段名称">
              <Tag color="blue">{viewingRecord.name}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="字段标识">
              <code>{viewingRecord.fieldKey}</code>
            </Descriptions.Item>
            <Descriptions.Item label="字段类型">
              <Tag color="purple">
                {FIELD_TYPES.find(t => t.value === viewingRecord.type)?.label || viewingRecord.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="所属分组">
              {GROUP_OPTIONS.find(g => g.value === viewingRecord.groupName)?.label || viewingRecord.groupName}
            </Descriptions.Item>
            <Descriptions.Item label="显示顺序">{viewingRecord.displayOrder}</Descriptions.Item>
            <Descriptions.Item label="是否可见">
              <Badge status={viewingRecord.visibility ? "success" : "default"} text={viewingRecord.visibility ? "是" : "否"} />
            </Descriptions.Item>
            <Descriptions.Item label="是否必填">
              <Badge status={viewingRecord.required ? "error" : "default"} text={viewingRecord.required ? "是" : "否"} />
            </Descriptions.Item>
            <Descriptions.Item label="系统字段">
              <Tag color={viewingRecord.isSystem ? "orange" : "default"}>
                {viewingRecord.isSystem ? "系统字段" : "自定义字段"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="选项值">{viewingRecord.options || "-"}</Descriptions.Item>
            <Descriptions.Item label="默认值">{viewingRecord.defaultValue || "-"}</Descriptions.Item>
            <Descriptions.Item label="校验规则">{viewingRecord.validation || "-"}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
