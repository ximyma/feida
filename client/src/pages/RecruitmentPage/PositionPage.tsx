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
  TeamOutlined, EyeOutlined, EnvironmentOutlined
} from "@ant-design/icons";

const TABLE = "recruitment_positions";

const STATUS_OPTIONS = [
  { value: "open", label: "招聘中", color: "green" },
  { value: "paused", label: "暂停", color: "orange" },
  { value: "closed", label: "已关闭", color: "default" },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "高", color: "red" },
  { value: "medium", label: "中", color: "orange" },
  { value: "low", label: "低", color: "default" },
];

const TYPE_OPTIONS = [
  { value: "full-time", label: "全职" },
  { value: "part-time", label: "兼职" },
  { value: "intern", label: "实习" },
  { value: "outsourcing", label: "外包" },
];

interface IRecord {
  id: number;
  title: string;
  department: string;
  headcount: number;
  filledCount: number;
  salaryRange: string;
  status: string;
  priority: string;
  description: string | null;
  requirements: string | null;
  workLocation: string | null;
  employmentType: string;
  recruiterId: number | null;
  createdAt: string;
}

export default function PositionPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<IRecord | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);
      if (statusFilter) params.append("status", statusFilter);
      
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const result = await res.json();
      setData(result.data || []);
    } catch (err) {
      message.error("加载失败");
    } finally {
      setLoading(false);
    }
  }, [searchText, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ headcount: 1, employmentType: "full-time", priority: "medium", status: "open" });
    setModalVisible(true);
  };

  const handleEdit = (record: IRecord) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
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
      
      if (editingRecord) {
        await fetch(`/api/${TABLE}/${editingRecord.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        message.success("更新成功");
      } else {
        await fetch(`/api/${TABLE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
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
      title: "岗位名称", 
      dataIndex: "title",
      render: (v: string) => <Tag color="blue">{v}</Tag>
    },
    {
      title: "部门",
      dataIndex: "department",
      width: 120,
    },
    {
      title: "招聘进度",
      width: 150,
      render: (_: any, r: IRecord) => {
        const percent = r.headcount > 0 ? Math.round((r.filledCount / r.headcount) * 100) : 0;
        return (
          <Tooltip title={`${r.filledCount}/${r.headcount}`}>
            <Progress percent={percent} size="small" status={percent >= 100 ? "success" : "active"} />
          </Tooltip>
        );
      },
    },
    {
      title: "薪资范围",
      dataIndex: "salaryRange",
      width: 140,
      render: (v: string) => <span style={{ color: "#52c41a" }}>{v}</span>,
    },
    {
      title: "优先级",
      dataIndex: "priority",
      width: 80,
      render: (v: string) => {
        const p = PRIORITY_OPTIONS.find(o => o.value === v);
        return <Tag color={p?.color || "default"}>{p?.label || v}</Tag>;
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (v: string) => {
        const s = STATUS_OPTIONS.find(o => o.value === v);
        return <Badge status={s?.color as any || "default"} text={s?.label || v} />;
      },
    },
    {
      title: "工作地点",
      dataIndex: "workLocation",
      width: 120,
      ellipsis: true,
      render: (v: string | null) => v ? <Space><EnvironmentOutlined />{v}</Space> : "-",
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
    open: data.filter(d => d.status === "open").length,
    totalHeadcount: data.reduce((sum, d) => sum + d.headcount, 0),
    totalFilled: data.reduce((sum, d) => sum + d.filledCount, 0),
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="职位总数" value={stats.total} prefix={<TeamOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="招聘中" value={stats.open} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col span={6}>
            <Statistic title="总需求人数" value={stats.totalHeadcount} />
          </Col>
          <Col span={6}>
            <Statistic title="已入职人数" value={stats.totalFilled} valueStyle={{ color: "#1890ff" }} />
          </Col>
        </Row>
      </Card>

      <Card
        title="招聘职位列表"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索岗位"
              allowClear
              style={{ width: 150 }}
              onSearch={setSearchText}
            />
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 100 }}
              onChange={setStatusFilter}
            >
              {STATUS_OPTIONS.map(s => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>发布职位</Button>
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
        title={editingRecord ? "编辑职位" : "发布新职位"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={750}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="岗位名称" rules={[{ required: true }]}>
                <Input placeholder="如: 高级前端工程师" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="所属部门" rules={[{ required: true }]}>
                <Input placeholder="如: 研发部" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="headcount" label="招聘人数" rules={[{ required: true }]}>
                <InputNumber min={1} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="salaryRange" label="薪资范围">
                <Input placeholder="如: 15-25K" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="employmentType" label="用工类型">
                <Select>
                  {TYPE_OPTIONS.map(t => (
                    <Option key={t.value} value={t.value}>{t.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="priority" label="优先级">
                <Select>
                  {PRIORITY_OPTIONS.map(p => (
                    <Option key={p.value} value={p.value}>{p.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select>
                  {STATUS_OPTIONS.map(s => (
                    <Option key={s.value} value={s.value}>{s.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="workLocation" label="工作地点">
                <Input placeholder="如: 北京市海淀区" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="岗位描述">
            <TextArea rows={4} placeholder="岗位职责描述" />
          </Form.Item>
          <Form.Item name="requirements" label="任职要求">
            <TextArea rows={4} placeholder="技能、经验、学历等要求" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="职位详情"
        placement="right"
        width={550}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{viewingRecord.id}</Descriptions.Item>
            <Descriptions.Item label="岗位名称">
              <Tag color="blue">{viewingRecord.title}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="所属部门">{viewingRecord.department}</Descriptions.Item>
            <Descriptions.Item label="招聘进度">
              <Progress 
                percent={viewingRecord.headcount > 0 ? Math.round((viewingRecord.filledCount / viewingRecord.headcount) * 100) : 0}
                format={() => `${viewingRecord.filledCount}/${viewingRecord.headcount}`}
              />
            </Descriptions.Item>
            <Descriptions.Item label="薪资范围">{viewingRecord.salaryRange || "-"}</Descriptions.Item>
            <Descriptions.Item label="用工类型">
              {TYPE_OPTIONS.find(t => t.value === viewingRecord.employmentType)?.label || viewingRecord.employmentType}
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={PRIORITY_OPTIONS.find(p => p.value === viewingRecord.priority)?.color || "default"}>
                {PRIORITY_OPTIONS.find(p => p.value === viewingRecord.priority)?.label || viewingRecord.priority}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge 
                status={STATUS_OPTIONS.find(s => s.value === viewingRecord.status)?.color as any || "default"} 
                text={STATUS_OPTIONS.find(s => s.value === viewingRecord.status)?.label || viewingRecord.status} 
              />
            </Descriptions.Item>
            <Descriptions.Item label="工作地点">
              <Space><EnvironmentOutlined />{viewingRecord.workLocation || "-"}</Space>
            </Descriptions.Item>
            <Descriptions.Item label="岗位描述">
              <div style={{ whiteSpace: "pre-wrap" }}>{viewingRecord.description || "-"}</div>
            </Descriptions.Item>
            <Descriptions.Item label="任职要求">
              <div style={{ whiteSpace: "pre-wrap" }}>{viewingRecord.requirements || "-"}</div>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
