import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Select, Input, InputNumber,
  Tag, Space, Popconfirm, message, Drawer, Descriptions,
  Row, Col, Statistic, Tooltip
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  EyeOutlined, BankOutlined
} from "@ant-design/icons";

const TABLE = "company_contributions";

interface IRecord {
  id: string;
  employeeId: string;
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
  // 前端补充字段（不在DB中）
  employeeName?: string;
  department?: string;
}

interface IEmployee {
  id: string;
  name: string;
  department?: string;
  position?: string;
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
  const [messageApi, contextHolder] = message.useMessage();

  // 姓名/部门查找
  const getEmpName = (empId: string) => employees.find(e => e.id === empId)?.name || empId;
  const getEmpDept = (empId: string) => employees.find(e => e.id === empId)?.department || '-';

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/employees");
      const json = await res.json();
      const list = Array.isArray(json) ? json : (json.data || []);
      setEmployees(list);
    } catch { /* ignore */ }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchText) params.append("search", searchText);
      if (monthFilter) params.append("month", monthFilter);

      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const json = await res.json();
      const raw = Array.isArray(json) ? json : (json.data || []);
      // 前端 join：给每条记录补充 employeeName 和 department
      const enriched = raw.map((r: IRecord) => ({
        ...r,
        employeeName: getEmpName(r.employeeId),
        department: getEmpDept(r.employeeId),
      }));
      setData(enriched);
    } catch {
      messageApi.error("加载失败");
    }
    setLoading(false);
  }, [searchText, monthFilter, employees, messageApi]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    fetchEmployees().then(() => {
      fetchData();
    });
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      // 当 employees 加载完成后，重新 enrich 数据
      setData(prev => prev.map(r => ({
        ...r,
        employeeName: getEmpName(r.employeeId),
        department: getEmpDept(r.employeeId),
      })));
    }
  }, [employees]);

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    const currentMonth = new Date().toISOString().slice(0, 7);
    form.setFieldsValue({ month: currentMonth });
    setModalVisible(true);
  };

  const handleEdit = (record: IRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      // InputNumber 需要 number 类型
      pension: record.pension,
      medical: record.medical,
      unemployment: record.unemployment,
      injury: record.injury,
      maternity: record.maternity,
      housingFund: record.housingFund,
      enterpriseAnnuity: record.enterpriseAnnuity,
    });
    setModalVisible(true);
  };

  const handleView = (record: IRecord) => {
    setViewingRecord(record);
    setDrawerVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/${TABLE}/${id}`, { method: "DELETE" });
      messageApi.success("删除成功");
      fetchData();
    } catch {
      messageApi.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const pension = Number(values.pension) || 0;
      const medical = Number(values.medical) || 0;
      const unemployment = Number(values.unemployment) || 0;
      const injury = Number(values.injury) || 0;
      const maternity = Number(values.maternity) || 0;
      const housingFund = Number(values.housingFund) || 0;
      const enterpriseAnnuity = Number(values.enterpriseAnnuity) || 0;
      const payload = {
        employeeId: values.employeeId,
        month: values.month,
        pension,
        medical,
        unemployment,
        injury,
        maternity,
        housingFund,
        enterpriseAnnuity,
        total: pension + medical + unemployment + injury + maternity + housingFund + enterpriseAnnuity,
      };

      if (editingRecord) {
        const res = await fetch(`/api/${TABLE}/${editingRecord.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) { messageApi.success("更新成功"); }
        else { const e = await res.json(); messageApi.error("更新失败: " + (e.error || '')); }
      } else {
        const res = await fetch(`/api/${TABLE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) { messageApi.success("创建成功"); }
        else { const e = await res.json(); messageApi.error("创建失败: " + (e.error || '')); }
      }
      setModalVisible(false);
      fetchData();
    } catch {
      messageApi.error("操作失败，请检查输入");
    }
  };

  // 统计
  const stats = {
    total: data.length,
    totalAmount: data.reduce((sum, d) => sum + (d.total || 0), 0),
    pensionTotal: data.reduce((sum, d) => sum + (d.pension || 0), 0),
    housingFundTotal: data.reduce((sum, d) => sum + (d.housingFund || 0), 0),
    personalTotal: data.reduce((sum, d) => sum + (d.pension || 0) + (d.medical || 0) + (d.housingFund || 0), 0),
  };

  const columns = [
    {
      title: "员工",
      key: "emp",
      width: 150,
      render: (_: any, r: IRecord) => (
        <div>
          <div className="font-medium">{r.employeeName || r.employeeId}</div>
          <div className="text-xs text-muted-foreground">{r.department || '-'}</div>
        </div>
      ),
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
      align: "right" as const,
      render: (v: number) => <span className="text-green-600">¥{(v || 0).toLocaleString()}</span>,
    },
    {
      title: "医疗保险",
      dataIndex: "medical",
      width: 100,
      align: "right" as const,
      render: (v: number) => <span className="text-green-600">¥{(v || 0).toLocaleString()}</span>,
    },
    {
      title: "失业保险",
      dataIndex: "unemployment",
      width: 100,
      align: "right" as const,
      render: (v: number) => <span className="text-green-600">¥{(v || 0).toLocaleString()}</span>,
    },
    {
      title: "工伤保险",
      dataIndex: "injury",
      width: 100,
      align: "right" as const,
      render: (v: number) => <span className="text-green-600">¥{(v || 0).toLocaleString()}</span>,
    },
    {
      title: "生育保险",
      dataIndex: "maternity",
      width: 100,
      align: "right" as const,
      render: (v: number) => <span className="text-green-600">¥{(v || 0).toLocaleString()}</span>,
    },
    {
      title: "住房公积金",
      dataIndex: "housingFund",
      width: 110,
      align: "right" as const,
      render: (v: number) => <span className="text-blue-600">¥{(v || 0).toLocaleString()}</span>,
    },
    {
      title: "企业年金",
      dataIndex: "enterpriseAnnuity",
      width: 100,
      align: "right" as const,
      render: (v: number) => <span className="text-orange-600">¥{(v || 0).toLocaleString()}</span>,
    },
    {
      title: "合计",
      dataIndex: "total",
      width: 110,
      align: "right" as const,
      render: (v: number) => <span style={{ color: "#fa8c16", fontWeight: 600 }}>¥{(v || 0).toLocaleString()}</span>,
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      fixed: "right" as const,
      render: (_: any, record: IRecord) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleView(record)} />
          </Tooltip>
          <Tooltip title="编辑">
            <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm title="确定删除该缴费记录？" onConfirm={() => handleDelete(record.id)}>
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {contextHolder}

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col span={5}>
          <Card size="small">
            <Statistic title="缴费记录" value={stats.total} prefix={<BankOutlined />} />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Statistic
              title="企业缴费合计"
              value={stats.totalAmount}
              precision={0}
              prefix="¥"
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Statistic
              title="养老保险合计"
              value={stats.pensionTotal}
              precision={0}
              prefix="¥"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col span={5}>
          <Card size="small">
            <Statistic
              title="公积金合计"
              value={stats.housingFundTotal}
              precision={0}
              prefix="¥"
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card size="small">
            <Statistic
              title="个人部分合计"
              value={stats.personalTotal}
              precision={0}
              prefix="¥"
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="🏦 企业社保公积金缴费记录"
        extra={
          <Space wrap>
            <Input.Search
              placeholder="搜索员工姓名"
              allowClear
              style={{ width: 160 }}
              onSearch={setSearchText}
            />
            <Input
              placeholder="月份如: 2026-03"
              allowClear
              style={{ width: 130 }}
              onChange={e => setMonthFilter(e.target.value)}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增缴费
            </Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingRecord ? "编辑缴费记录" : "新增缴费记录"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="employeeId"
                label="员工"
                rules={[{ required: true, message: "请选择员工" }]}
              >
                <Select
                  placeholder="搜索选择员工"
                  showSearch
                  optionFilterProp="label"
                  options={employees.map(e => ({
                    value: e.id,
                    label: `${e.name} — ${e.department || '无部门'}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="month"
                label="缴费月份"
                rules={[{ required: true, message: "请输入月份" }]}
              >
                <Input placeholder="如: 2026-04" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="pension" label="养老保险">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="medical" label="医疗保险">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unemployment" label="失业保险">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="injury" label="工伤保险">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maternity" label="生育保险">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" placeholder="0" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="housingFund" label="住房公积金">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="enterpriseAnnuity" label="企业年金">
                <InputNumber min={0} style={{ width: "100%" }} prefix="¥" placeholder="0" />
              </Form.Item>
            </Col>
          </Row>
          <div className="text-xs text-muted-foreground mt-2">
            💡 合计将自动计算 = 养老 + 医疗 + 失业 + 工伤 + 生育 + 公积金 + 年金
          </div>
        </Form>
      </Modal>

      {/* 详情抽屉 */}
      <Drawer
        title="缴费详情"
        placement="right"
        width={480}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="员工">
              <Tag color="blue">{viewingRecord.employeeName || viewingRecord.employeeId}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="部门">
              {viewingRecord.department || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="月份">
              <Tag color="purple">{viewingRecord.month}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="养老保险（企业）">
              <span className="text-green-600 font-medium">¥{(viewingRecord.pension || 0).toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="医疗保险（企业）">
              <span className="text-green-600 font-medium">¥{(viewingRecord.medical || 0).toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="失业保险（企业）">
              <span className="text-green-600 font-medium">¥{(viewingRecord.unemployment || 0).toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="工伤保险（企业）">
              <span className="text-green-600 font-medium">¥{(viewingRecord.injury || 0).toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="生育保险（企业）">
              <span className="text-green-600 font-medium">¥{(viewingRecord.maternity || 0).toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="住房公积金（企业）">
              <span className="text-blue-600 font-medium">¥{(viewingRecord.housingFund || 0).toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="企业年金（企业）">
              <span className="text-orange-600 font-medium">¥{(viewingRecord.enterpriseAnnuity || 0).toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="企业缴费合计">
              <span style={{ color: "#fa8c16", fontWeight: 700, fontSize: 18 }}>
                ¥{(viewingRecord.total || 0).toLocaleString()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="记录创建时间">
              {viewingRecord.createdAt ? new Date(viewingRecord.createdAt).toLocaleString('zh-CN') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
