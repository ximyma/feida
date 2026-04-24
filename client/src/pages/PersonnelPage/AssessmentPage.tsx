import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, InputNumber, Switch, Badge,
  Drawer, Descriptions, Statistic, Row, Col, Tooltip, Progress
} from "antd";
import {
  PlusOutlined, SearchOutlined, ReloadOutlined, EyeOutlined,
  EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined,
  FileTextOutlined, ClockCircleOutlined, TeamOutlined, BarChartOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useAPI } from "../../hooks/useAPI";

const TABLE = "assessment_tools";

const STATUS_COLORS: Record<string, string> = {
  active: "green",
  inactive: "default",
};

const TYPE_COLORS: Record<string, string> = {
  personality: "blue",
  skill: "purple",
  cognitive: "cyan",
  behavioral: "orange",
};

const TYPE_NAMES: Record<string, string> = {
  personality: "性格测评",
  skill: "技能测评",
  cognitive: "认知测评",
  behavioral: "行为测评",
};

interface IRecord {
  id: number;
  name: string;
  type: string;
  description: string;
  questionCount: number;
  duration: number;
  isActive: boolean;
  createdAt: string;
}

const AssessmentPage: React.FC = () => {
  const { data, loading, create, update, remove, refresh } = useAPI<IRecord>(TABLE);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<IRecord | null>(null);
  const [form] = Form.useForm();

  const filteredData = data.filter(item => {
    const matchSearch = !searchText || 
      item.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchType = !typeFilter || item.type === typeFilter;
    const matchStatus = !statusFilter || 
      (statusFilter === "active" && item.isActive) ||
      (statusFilter === "inactive" && !item.isActive);
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: data.length,
    active: data.filter(i => i.isActive).length,
    totalQuestions: data.reduce((sum, i) => sum + (i.questionCount || 0), 0),
    avgDuration: data.length ? Math.round(data.reduce((sum, i) => sum + (i.duration || 0), 0) / data.length) : 0,
  };

  const handleCreate = () => {
    setCurrentRecord(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, questionCount: 20, duration: 30 });
    setModalVisible(true);
  };

  const handleEdit = (record: IRecord) => {
    setCurrentRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleView = (record: IRecord) => {
    setCurrentRecord(record);
    setDrawerVisible(true);
  };

  const handleDelete = async (id: number) => {
    await remove(id);
    message.success("删除成功");
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (currentRecord) {
        await update(currentRecord.id, values);
        message.success("更新成功");
      } else {
        await create(values);
        message.success("创建成功");
      }
      setModalVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  const columns: ColumnsType<IRecord> = [
    {
      title: "ID",
      dataIndex: "id",
      width: 60,
      align: "center",
    },
    {
      title: "测评名称",
      dataIndex: "name",
      width: 180,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "类型",
      dataIndex: "type",
      width: 100,
      render: (type: string) => (
        <Tag color={TYPE_COLORS[type] || "default"}>{TYPE_NAMES[type] || type}</Tag>
      ),
    },
    {
      title: "题目数",
      dataIndex: "questionCount",
      width: 80,
      align: "center",
      render: (count: number) => <Badge count={count} showZero style={{ backgroundColor: "#1890ff" }} />,
    },
    {
      title: "时长(分钟)",
      dataIndex: "duration",
      width: 90,
      align: "center",
      render: (duration: number) => (
        <Space><ClockCircleOutlined />{duration}</Space>
      ),
    },
    {
      title: "描述",
      dataIndex: "description",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>{text || "-"}</Tooltip>
      ),
    },
    {
      title: "状态",
      dataIndex: "isActive",
      width: 80,
      align: "center",
      render: (active: boolean) => (
        <Badge status={active ? "success" : "default"} text={active ? "启用" : "停用"} />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
      render: (date: string) => date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "-",
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card><Statistic title="测评总数" value={stats.total} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="启用中" value={stats.active} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#52c41a" }} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="题目总数" value={stats.totalQuestions} prefix={<BarChartOutlined />} /></Card>
        </Col>
        <Col span={6}>
          <Card><Statistic title="平均时长" value={stats.avgDuration} suffix="分钟" prefix={<ClockCircleOutlined />} /></Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <Space wrap>
            <Input.Search
              placeholder="搜索测评名称/描述"
              allowClear
              style={{ width: 220 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="类型筛选"
              allowClear
              style={{ width: 120 }}
              value={typeFilter || undefined}
              onChange={setTypeFilter}
              options={Object.entries(TYPE_NAMES).map(([k, v]) => ({ label: v, value: k }))}
            />
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 100 }}
              value={statusFilter || undefined}
              onChange={setStatusFilter}
              options={[{ label: "启用", value: "active" }, { label: "停用", value: "inactive" }]}
            />
            <Button icon={<ReloadOutlined />} onClick={refresh}>刷新</Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建测评</Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <Modal
        title={currentRecord ? "编辑测评" : "新建测评"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="测评名称" rules={[{ required: true, message: "请输入测评名称" }]}>
                <Input placeholder="请输入测评名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="测评类型" rules={[{ required: true, message: "请选择类型" }]}>
                <Select placeholder="请选择类型" options={Object.entries(TYPE_NAMES).map(([k, v]) => ({ label: v, value: k }))} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="questionCount" label="题目数量" rules={[{ required: true, message: "请输入题目数量" }]}>
                <InputNumber min={1} max={500} style={{ width: "100%" }} placeholder="请输入题目数量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration" label="时长(分钟)" rules={[{ required: true, message: "请输入时长" }]}>
                <InputNumber min={1} max={180} style={{ width: "100%" }} placeholder="请输入时长" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="描述说明">
            <Input.TextArea rows={3} placeholder="请输入描述说明" />
          </Form.Item>
          <Form.Item name="isActive" label="是否启用" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="停用" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="测评详情"
        placement="right"
        width={500}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {currentRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="测评ID">{currentRecord.id}</Descriptions.Item>
            <Descriptions.Item label="测评名称"><strong>{currentRecord.name}</strong></Descriptions.Item>
            <Descriptions.Item label="类型">
              <Tag color={TYPE_COLORS[currentRecord.type]}>{TYPE_NAMES[currentRecord.type] || currentRecord.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="题目数量">{currentRecord.questionCount} 题</Descriptions.Item>
            <Descriptions.Item label="时长">{currentRecord.duration} 分钟</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge status={currentRecord.isActive ? "success" : "default"} text={currentRecord.isActive ? "启用" : "停用"} />
            </Descriptions.Item>
            <Descriptions.Item label="描述">{currentRecord.description || "-"}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{currentRecord.createdAt ? dayjs(currentRecord.createdAt).format("YYYY-MM-DD HH:mm:ss") : "-"}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default AssessmentPage;
