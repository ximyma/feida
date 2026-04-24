import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber,
  Tag, Space, Popconfirm, message, Badge, Drawer, Descriptions, Statistic,
  Row, Col, Tooltip, Timeline
} from "antd";
const { Option } = Select;
const { TextArea } = Input;
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  FileTextOutlined, EyeOutlined, MailOutlined, CheckCircleOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const TABLE = "offers";

const STATUS_OPTIONS = [
  { value: "pending", label: "待发送", color: "gold" },
  { value: "sent", label: "已发送", color: "blue" },
  { value: "accepted", label: "已接受", color: "green" },
  { value: "rejected", label: "已拒绝", color: "red" },
  { value: "expired", label: "已过期", color: "default" },
];

interface IRecord {
  id: number;
  candidateId: number;
  candidateName: string;
  positionId: number;
  positionTitle: string;
  salary: number;
  startDate: string;
  status: string;
  sentAt: string | null;
  acceptedAt: string | null;
  rejectedAt: string | null;
  signedContractUrl: string | null;
  remark: string | null;
  createdAt: string;
}

interface ICandidate {
  id: number;
  name: string;
  positionTitle?: string;
}

interface IPosition {
  id: number;
  title: string;
  department: string;
  salaryRange: string;
}

export default function OfferPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [candidates, setCandidates] = useState<ICandidate[]>([]);
  const [positions, setPositions] = useState<IPosition[]>([]);
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

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch("/api/candidates?status=interviewed,passed");
      const result = await res.json();
      setCandidates(result.data || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch("/api/recruitment_positions?status=open");
      const result = await res.json();
      setPositions(result.data || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchCandidates();
    fetchPositions();
  }, [fetchData, fetchCandidates, fetchPositions]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: IRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
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

  const handleSendOffer = async (id: number) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sent", sentAt: new Date().toISOString() }),
      });
      message.success("Offer已发送");
      fetchData();
    } catch {
      message.error("发送失败");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        startDate: values.startDate?.format("YYYY-MM-DD"),
        salary: Number(values.salary),
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
      title: "候选人", 
      dataIndex: "candidateName",
      render: (v: string) => <Tag color="blue">{v}</Tag>
    },
    {
      title: "应聘岗位",
      dataIndex: "positionTitle",
      render: (v: string) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: "Offer薪资",
      dataIndex: "salary",
      render: (v: number) => <span style={{ color: "#52c41a", fontWeight: 600 }}>¥{v?.toLocaleString()}/月</span>,
    },
    {
      title: "入职日期",
      dataIndex: "startDate",
      width: 110,
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (v: string) => {
        const status = STATUS_OPTIONS.find(s => s.value === v);
        return <Badge status={status?.color as any || "default"} text={status?.label || v} />;
      },
    },
    {
      title: "发送时间",
      dataIndex: "sentAt",
      width: 160,
      render: (v: string | null) => v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-",
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
          {record.status === "pending" && (
            <Tooltip title="发送Offer">
              <Button icon={<MailOutlined />} size="small" type="primary" onClick={() => handleSendOffer(record.id)} />
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
    pending: data.filter(d => d.status === "pending").length,
    accepted: data.filter(d => d.status === "accepted").length,
    totalSalary: data.filter(d => d.status === "accepted").reduce((sum, d) => sum + (d.salary || 0), 0),
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="Offer总数" value={stats.total} prefix={<FileTextOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="待发送" value={stats.pending} valueStyle={{ color: "#fa8c16" }} />
          </Col>
          <Col span={6}>
            <Statistic title="已接受" value={stats.accepted} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="接受薪资合计" 
              value={stats.totalSalary} 
              prefix="¥"
              formatter={(v) => `${Number(v).toLocaleString()}/月`}
            />
          </Col>
        </Row>
      </Card>

      <Card
        title="Offer管理列表"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索候选人"
              allowClear
              style={{ width: 150 }}
              onSearch={setSearchText}
            />
            <Select
              placeholder="状态"
              allowClear
              style={{ width: 110 }}
              onChange={setStatusFilter}
            >
              {STATUS_OPTIONS.map(s => (
                <Option key={s.value} value={s.value}>{s.label}</Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新建Offer</Button>
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
        title={editingRecord ? "编辑Offer" : "新建Offer"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={650}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="candidateId" label="候选人" rules={[{ required: true }]}>
                <Select placeholder="选择候选人" showSearch optionFilterProp="children">
                  {candidates.map(c => (
                    <Option key={c.id} value={c.id}>{c.name} - {c.positionTitle}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="positionId" label="应聘岗位" rules={[{ required: true }]}>
                <Select placeholder="选择岗位">
                  {positions.map(p => (
                    <Option key={p.id} value={p.id}>{p.title} ({p.department})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="salary" label="Offer薪资(元/月)" rules={[{ required: true }]}>
                <InputNumber min={1000} max={1000000} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="startDate" label="入职日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} placeholder="Offer相关说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="Offer详情"
        placement="right"
        width={550}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="ID">{viewingRecord.id}</Descriptions.Item>
              <Descriptions.Item label="候选人">
                <Tag color="blue">{viewingRecord.candidateName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="应聘岗位">
                <Tag color="purple">{viewingRecord.positionTitle}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Offer薪资">
                <span style={{ color: "#52c41a", fontWeight: 600 }}>¥{viewingRecord.salary?.toLocaleString()}/月</span>
              </Descriptions.Item>
              <Descriptions.Item label="入职日期">{viewingRecord.startDate}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge 
                  status={STATUS_OPTIONS.find(s => s.value === viewingRecord.status)?.color as any || "default"} 
                  text={STATUS_OPTIONS.find(s => s.value === viewingRecord.status)?.label || viewingRecord.status} 
                />
              </Descriptions.Item>
              <Descriptions.Item label="备注">{viewingRecord.remark || "-"}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}>
              <h4>状态流转</h4>
              <Timeline>
                <Timeline.Item color="blue">
                  创建时间: {viewingRecord.createdAt}
                </Timeline.Item>
                {viewingRecord.sentAt && (
                  <Timeline.Item color="blue" dot={<MailOutlined />}>
                    发送时间: {dayjs(viewingRecord.sentAt).format("YYYY-MM-DD HH:mm")}
                  </Timeline.Item>
                )}
                {viewingRecord.acceptedAt && (
                  <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                    接受时间: {dayjs(viewingRecord.acceptedAt).format("YYYY-MM-DD HH:mm")}
                  </Timeline.Item>
                )}
                {viewingRecord.rejectedAt && (
                  <Timeline.Item color="red">
                    拒绝时间: {dayjs(viewingRecord.rejectedAt).format("YYYY-MM-DD HH:mm")}
                  </Timeline.Item>
                )}
              </Timeline>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
