import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber, Switch,
  Tag, Space, Popconfirm, message, Badge, Drawer, Descriptions, Statistic,
  Row, Col, Tooltip, Progress
} from "antd";
const { Option } = Select;
const { TextArea } = Input;
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  BookOutlined, EyeOutlined, PlayCircleOutlined, EyeFilled
} from "@ant-design/icons";

const TABLE = "training_courses";

const CATEGORY_OPTIONS = [
  { value: "induction", label: "入职培训" },
  { value: "skill", label: "技能培训" },
  { value: "management", label: "管理培训" },
  { value: "safety", label: "安全培训" },
  { value: "compliance", label: "合规培训" },
  { value: "professional", label: "专业培训" },
  { value: "other", label: "其他" },
];

const TYPE_OPTIONS = [
  { value: "video", label: "视频课程" },
  { value: "document", label: "文档资料" },
  { value: "live", label: "直播课程" },
  { value: "offline", label: "线下培训" },
  { value: "exam", label: "考试测验" },
];

interface IRecord {
  id: number;
  title: string;
  category: string;
  type: string;
  url: string | null;
  duration: number | null;
  description: string | null;
  isRequired: number;
  isActive: number;
  viewCount: number;
  createdAt: string;
}

export default function CoursePage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<IRecord | null>(null);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);
      if (categoryFilter) params.append("category", categoryFilter);
      
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const result = await res.json();
      setData(result.data || []);
    } catch (err) {
      message.error("加载失败");
    } finally {
      setLoading(false);
    }
  }, [searchText, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ isRequired: false, isActive: true, duration: 30 });
    setModalVisible(true);
  };

  const handleEdit = (record: IRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      isRequired: Boolean(record.isRequired),
      isActive: Boolean(record.isActive),
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
        isRequired: values.isRequired ? 1 : 0,
        isActive: values.isActive ? 1 : 0,
        duration: Number(values.duration) || 0,
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
      title: "课程名称", 
      dataIndex: "title",
      ellipsis: true,
      render: (v: string) => <Tag color="blue">{v}</Tag>
    },
    {
      title: "分类",
      dataIndex: "category",
      width: 100,
      render: (v: string) => {
        const cat = CATEGORY_OPTIONS.find(c => c.value === v);
        return <Tag color="purple">{cat?.label || v}</Tag>;
      },
    },
    {
      title: "类型",
      dataIndex: "type",
      width: 100,
      render: (v: string) => {
        const type = TYPE_OPTIONS.find(t => t.value === v);
        return type?.label || v;
      },
    },
    {
      title: "时长(分钟)",
      dataIndex: "duration",
      width: 100,
      render: (v: number | null) => v ? `${v}分钟` : "-",
    },
    {
      title: "必修",
      dataIndex: "isRequired",
      width: 70,
      render: (v: number) => (
        <Badge status={v ? "error" : "default"} text={v ? "是" : "否"} />
      ),
    },
    {
      title: "状态",
      dataIndex: "isActive",
      width: 80,
      render: (v: number) => (
        <Badge status={v ? "success" : "default"} text={v ? "上架" : "下架"} />
      ),
    },
    {
      title: "观看次数",
      dataIndex: "viewCount",
      width: 90,
      sorter: (a: IRecord, b: IRecord) => a.viewCount - b.viewCount,
      render: (v: number) => (
        <Space>
          <PlayCircleOutlined style={{ color: "#1890ff" }} />
          <span>{v || 0}</span>
        </Space>
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
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
    active: data.filter(d => d.isActive).length,
    required: data.filter(d => d.isRequired).length,
    totalViews: data.reduce((sum, d) => sum + (d.viewCount || 0), 0),
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="课程总数" value={stats.total} prefix={<BookOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="上架课程" value={stats.active} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col span={6}>
            <Statistic title="必修课程" value={stats.required} valueStyle={{ color: "#fa8c16" }} />
          </Col>
          <Col span={6}>
            <Statistic title="总观看次数" value={stats.totalViews} valueStyle={{ color: "#1890ff" }} />
          </Col>
        </Row>
      </Card>

      <Card
        title="培训课程列表"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索课程名"
              allowClear
              style={{ width: 150 }}
              onSearch={setSearchText}
            />
            <Select
              placeholder="分类"
              allowClear
              style={{ width: 120 }}
              onChange={setCategoryFilter}
            >
              {CATEGORY_OPTIONS.map(c => (
                <Option key={c.value} value={c.value}>{c.label}</Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增课程</Button>
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
        title={editingRecord ? "编辑课程" : "新增课程"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={650}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="课程名称" rules={[{ required: true }]}>
                <Input placeholder="如: 新员工入职培训" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="课程分类" rules={[{ required: true }]}>
                <Select placeholder="选择分类">
                  {CATEGORY_OPTIONS.map(c => (
                    <Option key={c.value} value={c.value}>{c.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="课程类型" rules={[{ required: true }]}>
                <Select placeholder="选择类型">
                  {TYPE_OPTIONS.map(t => (
                    <Option key={t.value} value={t.value}>{t.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="duration" label="时长(分钟)">
                <InputNumber min={1} max={9999} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isRequired" label="必修课程" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="url" label="课程链接">
            <Input placeholder="视频链接或文档地址" />
          </Form.Item>
          <Form.Item name="description" label="课程描述">
            <TextArea rows={3} placeholder="课程内容简介" />
          </Form.Item>
          <Form.Item name="isActive" label="上架状态" valuePropName="checked">
            <Switch checkedChildren="上架" unCheckedChildren="下架" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="课程详情"
        placement="right"
        width={500}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{viewingRecord.id}</Descriptions.Item>
            <Descriptions.Item label="课程名称">
              <Tag color="blue">{viewingRecord.title}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="课程分类">
              <Tag color="purple">
                {CATEGORY_OPTIONS.find(c => c.value === viewingRecord.category)?.label || viewingRecord.category}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="课程类型">
              {TYPE_OPTIONS.find(t => t.value === viewingRecord.type)?.label || viewingRecord.type}
            </Descriptions.Item>
            <Descriptions.Item label="时长">{viewingRecord.duration ? `${viewingRecord.duration}分钟` : "-"}</Descriptions.Item>
            <Descriptions.Item label="必修">
              <Badge status={viewingRecord.isRequired ? "error" : "default"} text={viewingRecord.isRequired ? "是" : "否"} />
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge status={viewingRecord.isActive ? "success" : "default"} text={viewingRecord.isActive ? "上架" : "下架"} />
            </Descriptions.Item>
            <Descriptions.Item label="观看次数">{viewingRecord.viewCount || 0}</Descriptions.Item>
            <Descriptions.Item label="课程链接">
              {viewingRecord.url 
                ? <a href={viewingRecord.url} target="_blank" rel="noopener noreferrer">{viewingRecord.url}</a>
                : "-"
              }
            </Descriptions.Item>
            <Descriptions.Item label="课程描述">
              <div style={{ whiteSpace: "pre-wrap" }}>{viewingRecord.description || "-"}</div>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
