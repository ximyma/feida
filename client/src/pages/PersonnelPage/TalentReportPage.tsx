import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select,
  Tag, Space, Popconfirm, message, Badge, Drawer, Descriptions, Statistic,
  Row, Col, Tooltip, Progress
} from "antd";
const { Option } = Select;
const { TextArea } = Input;
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  BarChartOutlined, EyeOutlined, TeamOutlined
} from "@ant-design/icons";

const TABLE = "talent_reports";

interface IRecord {
  id: number;
  name: string;
  cycleId: number | null;
  talentSummary: string | null;
  nineBoxGrid: string | null;
  successionPlans: string | null;
  createdBy: string | null;
  createdAt: string;
}

interface ICycle {
  id: number;
  name: string;
}

export default function TalentReportPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [cycles, setCycles] = useState<ICycle[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<IRecord | null>(null);
  const [searchText, setSearchText] = useState("");
  const [cycleFilter, setCycleFilter] = useState<number | "">("");
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);
      if (cycleFilter) params.append("cycleId", String(cycleFilter));
      
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const result = await res.json();
      setData(result.data || []);
    } catch (err) {
      message.error("加载失败");
    } finally {
      setLoading(false);
    }
  }, [searchText, cycleFilter]);

  const fetchCycles = useCallback(async () => {
    try {
      const res = await fetch("/api/performance_cycles");
      const result = await res.json();
      setCycles(result.data || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchCycles();
  }, [fetchData, fetchCycles]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
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

  const parseJsonSafe = (jsonStr: string | null) => {
    if (!jsonStr) return null;
    try {
      return JSON.parse(jsonStr);
    } catch {
      return jsonStr;
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", width: 60 },
    { 
      title: "报告名称", 
      dataIndex: "name",
      render: (v: string) => <Tag color="blue">{v}</Tag>
    },
    {
      title: "考核周期",
      dataIndex: "cycleId",
      render: (v: number) => {
        const cycle = cycles.find(c => c.id === v);
        return cycle?.name || v || "-";
      },
    },
    {
      title: "人才盘点",
      dataIndex: "talentSummary",
      ellipsis: true,
      render: (v: string | null) => v ? `${v.substring(0, 30)}...` : "-",
    },
    {
      title: "九宫格",
      dataIndex: "nineBoxGrid",
      width: 120,
      render: (v: string | null) => v ? <Tag color="purple">已配置</Tag> : <Tag>未配置</Tag>,
    },
    {
      title: "继任计划",
      dataIndex: "successionPlans",
      width: 120,
      render: (v: string | null) => v ? <Tag color="green">已制定</Tag> : <Tag>未制定</Tag>,
    },
    {
      title: "创建人",
      dataIndex: "createdBy",
      width: 100,
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
    withNineBox: data.filter(d => d.nineBoxGrid).length,
    withSuccession: data.filter(d => d.successionPlans).length,
    coverage: data.length > 0 ? Math.round((data.filter(d => d.nineBoxGrid && d.successionPlans).length / data.length) * 100) : 0,
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="报告总数" value={stats.total} prefix={<BarChartOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="已配置九宫格" value={stats.withNineBox} valueStyle={{ color: "#722ed1" }} />
          </Col>
          <Col span={6}>
            <Statistic title="已制定继任计划" value={stats.withSuccession} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col span={6}>
            <div>
              <div style={{ marginBottom: 4, color: "#666" }}>完整度</div>
              <Progress percent={stats.coverage} strokeColor="#1890ff" />
            </div>
          </Col>
        </Row>
      </Card>

      <Card
        title="人才报告列表"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索报告名"
              allowClear
              style={{ width: 150 }}
              onSearch={setSearchText}
            />
            <Select
              placeholder="考核周期"
              allowClear
              style={{ width: 150 }}
              onChange={setCycleFilter}
            >
              {cycles.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增报告</Button>
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
        title={editingRecord ? "编辑报告" : "新增报告"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="报告名称" rules={[{ required: true }]}>
                <Input placeholder="如: 2026年Q1人才盘点报告" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="cycleId" label="考核周期">
                <Select placeholder="选择考核周期">
                  {cycles.map(c => (
                    <Option key={c.id} value={c.id}>{c.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="createdBy" label="创建人">
            <Input placeholder="报告创建人" />
          </Form.Item>
          <Form.Item name="talentSummary" label="人才盘点总结">
            <TextArea rows={4} placeholder="对整体人才状况的总结分析" />
          </Form.Item>
          <Form.Item name="nineBoxGrid" label="九宫格配置">
            <TextArea rows={4} placeholder='JSON格式: {"高潜高绩效": ["张三", "李四"], "高潜中绩效": [...], ...}' />
          </Form.Item>
          <Form.Item name="successionPlans" label="继任计划">
            <TextArea rows={4} placeholder="关键岗位继任者名单及培养计划" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="报告详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{viewingRecord.id}</Descriptions.Item>
            <Descriptions.Item label="报告名称">
              <Tag color="blue">{viewingRecord.name}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="考核周期">
              {cycles.find(c => c.id === viewingRecord.cycleId)?.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="创建人">{viewingRecord.createdBy || "-"}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="人才盘点总结">
              <div style={{ whiteSpace: "pre-wrap", background: "#f5f5f5", padding: 8, borderRadius: 4 }}>
                {viewingRecord.talentSummary || "(无)"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="九宫格配置">
              <div style={{ whiteSpace: "pre-wrap", background: "#f0f5ff", padding: 8, borderRadius: 4 }}>
                {viewingRecord.nineBoxGrid || "(无)"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="继任计划">
              <div style={{ whiteSpace: "pre-wrap", background: "#f6ffed", padding: 8, borderRadius: 4 }}>
                {viewingRecord.successionPlans || "(无)"}
              </div>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
