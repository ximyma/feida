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
  BellOutlined, EyeOutlined, ClockCircleOutlined
} from "@ant-design/icons";

const TABLE = "reminders";

const REMINDER_TYPES = [
  { value: "contract_expire", label: "合同到期" },
  { value: "birthday", label: "员工生日" },
  { value: "probation", label: "试用期转正" },
  { value: "training", label: "培训提醒" },
  { value: "certificate", label: "证书到期" },
  { value: "attendance", label: "考勤异常" },
  { value: "leave", label: "请假到期" },
  { value: "custom", label: "自定义" },
];

const MODULE_OPTIONS = [
  { value: "personnel", label: "人事管理" },
  { value: "contract", label: "合同管理" },
  { value: "attendance", label: "考勤管理" },
  { value: "training", label: "培训管理" },
  { value: "salary", label: "薪资管理" },
  { value: "system", label: "系统管理" },
];

interface IRecord {
  id: number;
  name: string;
  type: string;
  module: string;
  targetModule: string | null;
  advanceDays: number;
  isActive: number;
  targetRoles: string | null;
  targetUsers: string | null;
  template: string | null;
  createdAt: string;
}

export default function ReminderManagementPage() {
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
    form.setFieldsValue({ advanceDays: 7, isActive: true });
    setModalVisible(true);
  };

  const handleEdit = (record: IRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
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

  const handleToggle = async (record: IRecord) => {
    try {
      await fetch(`/api/${TABLE}/${record.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: record.isActive ? 0 : 1 }),
      });
      message.success(record.isActive ? "已停用" : "已启用");
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
        isActive: values.isActive ? 1 : 0,
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
      title: "提醒名称", 
      dataIndex: "name",
      render: (v: string) => <Tag color="blue">{v}</Tag>
    },
    {
      title: "提醒类型",
      dataIndex: "type",
      render: (v: string) => {
        const type = REMINDER_TYPES.find(t => t.value === v);
        return <Tag color="purple">{type?.label || v}</Tag>;
      },
    },
    {
      title: "所属模块",
      dataIndex: "module",
      render: (v: string) => {
        const mod = MODULE_OPTIONS.find(m => m.value === v);
        return mod?.label || v;
      },
    },
    {
      title: "提前天数",
      dataIndex: "advanceDays",
      width: 100,
      render: (v: number) => (
        <Space>
          <ClockCircleOutlined style={{ color: "#fa8c16" }} />
          <span>{v} 天</span>
        </Space>
      ),
    },
    {
      title: "状态",
      dataIndex: "isActive",
      width: 80,
      render: (v: number) => (
        <Badge status={v ? "success" : "default"} text={v ? "启用" : "停用"} />
      ),
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
    },
    {
      title: "操作",
      width: 180,
      render: (_: any, record: IRecord) => (
        <Space>
          <Tooltip title="查看">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title={record.isActive ? "停用" : "启用"}>
            <Button 
              icon={<BellOutlined />} 
              size="small" 
              type={record.isActive ? "default" : "primary"}
              onClick={() => handleToggle(record)} 
            />
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
    contract: data.filter(d => d.type === "contract_expire").length,
    training: data.filter(d => d.type === "training").length,
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="提醒总数" value={stats.total} prefix={<BellOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="启用中" value={stats.active} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col span={6}>
            <Statistic title="合同提醒" value={stats.contract} valueStyle={{ color: "#722ed1" }} />
          </Col>
          <Col span={6}>
            <Statistic title="培训提醒" value={stats.training} valueStyle={{ color: "#1890ff" }} />
          </Col>
        </Row>
      </Card>

      <Card
        title="提醒规则列表"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索提醒名"
              allowClear
              style={{ width: 150 }}
              onSearch={setSearchText}
            />
            <Select
              placeholder="提醒类型"
              allowClear
              style={{ width: 130 }}
              onChange={setTypeFilter}
            >
              {REMINDER_TYPES.map(t => (
                <Option key={t.value} value={t.value}>{t.label}</Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增提醒</Button>
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
        title={editingRecord ? "编辑提醒" : "新增提醒"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={650}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="提醒名称" rules={[{ required: true }]}>
                <Input placeholder="如: 合同到期提醒" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="提醒类型" rules={[{ required: true }]}>
                <Select placeholder="选择类型">
                  {REMINDER_TYPES.map(t => (
                    <Option key={t.value} value={t.value}>{t.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="module" label="所属模块" rules={[{ required: true }]}>
                <Select placeholder="选择模块">
                  {MODULE_OPTIONS.map(m => (
                    <Option key={m.value} value={m.value}>{m.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="targetModule" label="目标模块">
                <Input placeholder="关联的目标模块" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="advanceDays" label="提前天数">
                <InputNumber min={0} max={365} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="targetRoles" label="目标角色">
                <Input placeholder="如: HR,经理" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isActive" label="是否启用" valuePropName="checked">
                <Switch checkedChildren="启" unCheckedChildren="停" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="targetUsers" label="目标用户ID">
            <Input placeholder="指定用户ID，逗号分隔" />
          </Form.Item>
          <Form.Item name="template" label="提醒模板">
            <TextArea rows={4} placeholder="如: ${employeeName}的合同将于${expireDate}到期，请及时处理" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="提醒详情"
        placement="right"
        width={500}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{viewingRecord.id}</Descriptions.Item>
            <Descriptions.Item label="提醒名称">
              <Tag color="blue">{viewingRecord.name}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="提醒类型">
              <Tag color="purple">
                {REMINDER_TYPES.find(t => t.value === viewingRecord.type)?.label || viewingRecord.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="所属模块">
              {MODULE_OPTIONS.find(m => m.value === viewingRecord.module)?.label || viewingRecord.module}
            </Descriptions.Item>
            <Descriptions.Item label="目标模块">{viewingRecord.targetModule || "-"}</Descriptions.Item>
            <Descriptions.Item label="提前天数">{viewingRecord.advanceDays} 天</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge status={viewingRecord.isActive ? "success" : "default"} text={viewingRecord.isActive ? "启用" : "停用"} />
            </Descriptions.Item>
            <Descriptions.Item label="目标角色">{viewingRecord.targetRoles || "-"}</Descriptions.Item>
            <Descriptions.Item label="目标用户">{viewingRecord.targetUsers || "-"}</Descriptions.Item>
            <Descriptions.Item label="提醒模板">
              <div style={{ background: '#f5f5f5', padding: 8, borderRadius: 4 }}>
                {viewingRecord.template || "(无模板)"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
