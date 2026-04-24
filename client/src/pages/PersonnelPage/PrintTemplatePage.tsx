import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select, Switch,
  Tag, Space, Popconfirm, message, Badge, Drawer, Descriptions, Statistic,
  Row, Col, Tooltip
} from "antd";
const { Option } = Select;
const { TextArea } = Input;
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  PrinterOutlined, EyeOutlined, FileTextOutlined
} from "@ant-design/icons";

const TABLE = "print_templates";

const TEMPLATE_TYPES = [
  { value: "contract", label: "劳动合同" },
  { value: "onboarding", label: "入职登记表" },
  { value: "resignation", label: "离职申请表" },
  { value: "certificate", label: "在职证明" },
  { value: "salary", label: "工资条" },
  { value: "attendance", label: "考勤表" },
  { value: "leave", label: "请假单" },
  { value: "other", label: "其他" },
];

const PAPER_SIZES = [
  { value: "A4", label: "A4" },
  { value: "A5", label: "A5" },
  { value: "Letter", label: "信纸" },
  { value: "Legal", label: "法律纸" },
];

interface IRecord {
  id: number;
  name: string;
  type: string;
  content: string | null;
  paperSize: string;
  orientation: string;
  isDefault: number;
  createdAt: string;
}

export default function PrintTemplatePage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<IRecord | null>(null);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);
      if (typeFilter) params.append("type", typeFilter);
      
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const result = await res.json();
      setData(result.data || []);
    } catch (err) {
      message.error("加载失败");
    } finally {
      setLoading(false);
    }
  }, [searchText, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ paperSize: "A4", orientation: "portrait", isDefault: false });
    setModalVisible(true);
  };

  const handleEdit = (record: IRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      isDefault: Boolean(record.isDefault),
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

  const handleSetDefault = async (id: number) => {
    try {
      // 先取消所有默认
      const defaults = data.filter(d => d.isDefault);
      for (const d of defaults) {
        await fetch(`/api/${TABLE}/${d.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...d, isDefault: 0 }),
        });
      }
      // 设置新的默认
      await fetch(`/api/${TABLE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: 1 }),
      });
      message.success("已设为默认模板");
      fetchData();
    } catch {
      message.error("操作失败");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        isDefault: values.isDefault ? 1 : 0,
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
      title: "模板名称", 
      dataIndex: "name",
      render: (v: string, r: IRecord) => (
        <Space>
          <Tag color="blue">{v}</Tag>
          {r.isDefault ? <Tag color="green">默认</Tag> : null}
        </Space>
      )
    },
    {
      title: "模板类型",
      dataIndex: "type",
      render: (v: string) => {
        const type = TEMPLATE_TYPES.find(t => t.value === v);
        return <Tag color="purple">{type?.label || v}</Tag>;
      },
    },
    {
      title: "纸张大小",
      dataIndex: "paperSize",
      width: 100,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: "打印方向",
      dataIndex: "orientation",
      width: 100,
      render: (v: string) => v === "landscape" ? "横向" : "纵向",
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
    },
    {
      title: "操作",
      width: 200,
      render: (_: any, record: IRecord) => (
        <Space>
          <Tooltip title="查看">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          </Tooltip>
          {!record.isDefault && (
            <Tooltip title="设为默认">
              <Button icon={<PrinterOutlined />} size="small" onClick={() => handleSetDefault(record.id)} />
            </Tooltip>
          )}
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: data.length,
    contracts: data.filter(d => d.type === "contract").length,
    defaults: data.filter(d => d.isDefault).length,
    a4: data.filter(d => d.paperSize === "A4").length,
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="模板总数" value={stats.total} prefix={<FileTextOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="合同模板" value={stats.contracts} valueStyle={{ color: "#722ed1" }} />
          </Col>
          <Col span={6}>
            <Statistic title="默认模板" value={stats.defaults} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col span={6}>
            <Statistic title="A4纸张" value={stats.a4} valueStyle={{ color: "#1890ff" }} />
          </Col>
        </Row>
      </Card>

      <Card
        title="打印模板列表"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索模板名"
              allowClear
              style={{ width: 150 }}
              onSearch={setSearchText}
            />
            <Select
              placeholder="模板类型"
              allowClear
              style={{ width: 130 }}
              onChange={setTypeFilter}
            >
              {TEMPLATE_TYPES.map(t => (
                <Option key={t.value} value={t.value}>{t.label}</Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增模板</Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingRecord ? "编辑模板" : "新增模板"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="模板名称" rules={[{ required: true }]}>
                <Input placeholder="请输入模板名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="模板类型" rules={[{ required: true }]}>
                <Select placeholder="选择模板类型">
                  {TEMPLATE_TYPES.map(t => (
                    <Option key={t.value} value={t.value}>{t.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="paperSize" label="纸张大小">
                <Select>
                  {PAPER_SIZES.map(p => (
                    <Option key={p.value} value={p.value}>{p.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="orientation" label="打印方向">
                <Select>
                  <Option value="portrait">纵向</Option>
                  <Option value="landscape">横向</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isDefault" label="设为默认" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="模板内容">
            <TextArea rows={10} placeholder="HTML模板内容，支持变量替换如 ${employeeName}" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="模板详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{viewingRecord.id}</Descriptions.Item>
            <Descriptions.Item label="模板名称">
              <Space>
                <Tag color="blue">{viewingRecord.name}</Tag>
                {viewingRecord.isDefault ? <Tag color="green">默认</Tag> : null}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="模板类型">
              <Tag color="purple">
                {TEMPLATE_TYPES.find(t => t.value === viewingRecord.type)?.label || viewingRecord.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="纸张大小">{viewingRecord.paperSize}</Descriptions.Item>
            <Descriptions.Item label="打印方向">
              {viewingRecord.orientation === "landscape" ? "横向" : "纵向"}
            </Descriptions.Item>
            <Descriptions.Item label="模板内容">
              <div style={{ 
                background: '#f5f5f5', 
                padding: 12, 
                borderRadius: 4, 
                maxHeight: 400, 
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: 12,
                whiteSpace: 'pre-wrap'
              }}>
                {viewingRecord.content || "(无内容)"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
