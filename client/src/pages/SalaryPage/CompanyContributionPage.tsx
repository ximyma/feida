import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber,
  Tag, Space, Popconfirm, message, Badge, Drawer, Descriptions, Statistic,
  Row, Col, Tooltip
} from "antd";
const { Option } = Select;
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  DollarOutlined, EyeOutlined, BankOutlined
} from "@ant-design/icons";

const TABLE = "company_contributions";

interface IRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  month: string;
  pension: number;
  medical: number;
  unemployment: number;
  injury: number;
  maternity: number;
  housingFund: number;
  enterpriseAnnuity: number;
  total: number;
  createdAt: string;
}

interface IEmployee {
  id: number;
  name: string;
  department?: string;
}

export default function CompanyContributionPage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<IRecord | null>(null);
  const [searchText, setSearchText] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [form] = Form.useForm();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);
      if (monthFilter) params.append("month", monthFilter);
      
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const result = await res.json();
      setData(result.data || []);
    } catch (err) {
      message.error("加载失败");
    } finally {
      setLoading(false);
    }
  }, [searchText, monthFilter]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/employees");
      const result = await res.json();
      setEmployees(result.data || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchEmployees();
  }, [fetchData, fetchEmployees]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    const currentMonth = new Date().toISOString().slice(0, 7);
    form.setFieldsValue({ month: currentMonth });
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
      const payload = {
        ...values,
        pension: Number(values.pension) || 0,
        medical: Number(values.medical) || 0,
        unemployment: Number(values.unemployment) || 0,
        injury: Number(values.injury) || 0,
        maternity: Number(values.maternity) || 0,
        housingFund: Number(values.housingFund) || 0,
        enterpriseAnnuity: Number(values.enterpriseAnnuity) || 0,
        total: (Number(values.pension) || 0) + (Number(values.medical) || 0) + 
               (Number(values.unemployment) || 0) + (Number(values.injury) || 0) + 
               (Number(values.maternity) || 0) + (Number(values.housingFund) || 0) + 
               (Number(values.enterpriseAnnuity) || 0),
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
      title: "员工",
      dataIndex: "employeeName",
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "月份",
      dataIndex: "month",
      width: 100,
      render: (v: string) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: "养老保险",
      dataIndex: "pension",
      width: 100,
      render: (v: number) => <span style={{ color: "#52c41a" }}>¥{v?.toLocaleString()}</span>,
    },
    {
      title: "医疗保险",
      dataIndex: "medical",
      width: 100,
      render: (v: number) => <span style={{ color: "#52c41a" }}>¥{v?.toLocaleString()}</span>,
    },
    {
      title: "失业保险",
      dataIndex: "unemployment",
      width: 100,
      render: (v: number) => <span style={{ color: "#52c41a" }}>¥{v?.toLocaleString()}</span>,
    },
    {
      title: "工伤保险",
      dataIndex: "injury",
      width: 100,
      render: (v: number) => <span style={{ color: "#52c41a" }}>¥{v?.toLocaleString()}</span>,
    },
    {
      title: "生育保险",
      dataIndex: "maternity",
      width: 100,
      render: (v: number) => <span style={{ color: "#52c41a" }}>¥{v?.toLocaleString()}</span>,
    },
    {
      title: "住房公积金",
      dataIndex: "housingFund",
      width: 110,
      render: (v: number) => <span style={{ color: "#52c41a" }}>¥{v?.toLocaleString()}</span>,
    },
    {
      title: "企业年金",
      dataIndex: "enterpriseAnnuity",
      width: 100,
      render: (v: number) => <span style={{ color: "#52c41a" }}>¥{v?.toLocaleString()}</span>,
    },
    {
      title: "合计",
      dataIndex: "total",
      width: 110,
      render: (v: number) => <span style={{ color: "#fa8c16", fontWeight: 600 }}>¥{v?.toLocaleString()}</span>,
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
    totalAmount: data.reduce((sum, d) => sum + (d.total || 0), 0),
    pensionTotal: data.reduce((sum, d) => sum + (d.pension || 0), 0),
    housingFundTotal: data.reduce((sum, d) => sum + (d.housingFund || 0), 0),
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="记录总数" value={stats.total} prefix={<BankOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic 
              title="缴费合计" 
              value={stats.totalAmount} 
              prefix="¥"
              formatter={(v) => `${Number(v).toLocaleString()}`}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="养老险合计" 
              value={stats.pensionTotal} 
              prefix="¥"
              valueStyle={{ color: "#722ed1" }}
              formatter={(v) => `${Number(v).toLocaleString()}`}
            />
          </Col>
          <Col span={6}>
            <Statistic 
              title="公积金合计" 
              value={stats.housingFundTotal} 
              prefix="¥"
              valueStyle={{ color: "#1890ff" }}
              formatter={(v) => `${Number(v).toLocaleString()}`}
            />
          </Col>
        </Row>
      </Card>

      <Card
        title="企业缴费列表"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索员工"
              allowClear
              style={{ width: 150 }}
              onSearch={setSearchText}
            />
            <Input
              placeholder="月份(YYYY-MM)"
              allowClear
              style={{ width: 120 }}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增缴费</Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Modal
        title={editingRecord ? "编辑缴费记录" : "新增缴费记录"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employeeId" label="员工" rules={[{ required: true }]}>
                <Select placeholder="选择员工" showSearch optionFilterProp="children">
                  {employees.map(e => (
                    <Option key={e.id} value={e.id}>{e.name} ({e.department || ""})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="month" label="缴费月份" rules={[{ required: true }]}>
                <Input placeholder="如: 2026-04" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="pension" label="养老保险">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="medical" label="医疗保险">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unemployment" label="失业保险">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="injury" label="工伤保险">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maternity" label="生育保险">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="housingFund" label="住房公积金">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="enterpriseAnnuity" label="企业年金">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Drawer
        title="缴费详情"
        placement="right"
        width={500}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{viewingRecord.id}</Descriptions.Item>
            <Descriptions.Item label="员工">
              <Tag color="blue">{viewingRecord.employeeName}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="月份">
              <Tag color="purple">{viewingRecord.month}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="养老保险">
              <span style={{ color: "#52c41a" }}>¥{viewingRecord.pension?.toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="医疗保险">
              <span style={{ color: "#52c41a" }}>¥{viewingRecord.medical?.toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="失业保险">
              <span style={{ color: "#52c41a" }}>¥{viewingRecord.unemployment?.toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="工伤保险">
              <span style={{ color: "#52c41a" }}>¥{viewingRecord.injury?.toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="生育保险">
              <span style={{ color: "#52c41a" }}>¥{viewingRecord.maternity?.toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="住房公积金">
              <span style={{ color: "#52c41a" }}>¥{viewingRecord.housingFund?.toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="企业年金">
              <span style={{ color: "#52c41a" }}>¥{viewingRecord.enterpriseAnnuity?.toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="合计">
              <span style={{ color: "#fa8c16", fontWeight: 600, fontSize: 16 }}>
                ¥{viewingRecord.total?.toLocaleString()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
