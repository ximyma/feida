import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Modal, Form, Select, InputNumber,
  Tag, Space, Popconfirm, message, DatePicker, Descriptions, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface SalaryAdjustment {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  itemType: 'allowance' | 'deduction' | 'earnings';
  itemName: string;
  amount: number;
  reason: string;
  isRecurring: number;
  startMonth: string;
  endMonth: string | null;
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
}

const ITEM_TYPE_MAP: Record<string, { label: string; color: string }> = {
  allowance: { label: '补贴', color: 'blue' },
  deduction: { label: '扣款', color: 'red' },
  earnings: { label: '收入', color: 'green' },
};

const ITEM_OPTIONS = [
  { label: '住房补贴', value: '住房补贴' },
  { label: '交通补贴', value: '交通补贴' },
  { label: '餐补', value: '餐补' },
  { label: '通讯补贴', value: '通讯补贴' },
  { label: '高温补贴', value: '高温补贴' },
  { label: '岗位津贴', value: '岗位津贴' },
  { label: '绩效奖金', value: '绩效奖金' },
  { label: '年终奖金', value: '年终奖金' },
  { label: '其他补贴', value: '其他补贴' },
];

export default function SalaryAdjustmentPage() {
  const [data, setData] = useState<SalaryAdjustment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SalaryAdjustment | null>(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adjRes, empRes] = await Promise.all([
        fetch('/api/salary_adjustments'),
        fetch('/api/employees'),
      ]);
      const adjJson = await adjRes.json();
      const empJson = await empRes.json();
      setData(Array.isArray(adjJson) ? adjJson : []);
      setEmployees(Array.isArray(empJson) ? empJson : []);
    } catch (e) {
      console.error('获取数据失败', e);
    }
    setLoading(false);
  };

  const getEmployeeInfo = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? `${emp.name} / ${emp.department}` : empId;
  };

  const openAddDialog = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      month: dayjs().format('YYYY-MM-DD'),
      isRecurring: 1,
      itemType: 'allowance',
      itemName: '住房补贴',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (record: SalaryAdjustment) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      month: record.month ? dayjs(record.month) : undefined,
      startMonth: record.startMonth ? dayjs(record.startMonth) : undefined,
      endMonth: record.endMonth ? dayjs(record.endMonth) : undefined,
      isRecurring: record.isRecurring,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        id: editing?.id || `sadj_${values.employeeId}_${Date.now()}`,
        employeeId: values.employeeId,
        itemType: values.itemType,
        itemName: values.itemName,
        amount: values.amount,
        reason: values.reason || '',
        isRecurring: values.isRecurring ? 1 : 0,
        month: values.month ? dayjs(values.month).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        startMonth: values.startMonth ? dayjs(values.startMonth).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        endMonth: values.endMonth ? dayjs(values.endMonth).format('YYYY-MM-DD') : null,
      };

      const emp = employees.find(e => e.id === values.employeeId);
      if (emp) payload.employeeName = emp.name;

      const url = editing ? `/api/salary_adjustments/${editing.id}` : '/api/salary_adjustments';
      const method = editing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 200) {
        messageApi.success(editing ? '已更新' : '已添加');
        setDialogOpen(false);
        fetchData();
      } else {
        const err = await res.json();
        messageApi.error('保存失败: ' + (err.error || '未知错误'));
      }
    } catch (e: any) {
      console.error('Save error:', e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/salary_adjustments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        messageApi.success('已删除');
        fetchData();
      }
    } catch (e) {
      messageApi.error('删除失败');
    }
  };

  const columns = [
    {
      title: '员工',
      dataIndex: 'employeeId',
      key: 'emp',
      width: 180,
      render: (id: string) => getEmployeeInfo(id),
    },
    {
      title: '类型',
      dataIndex: 'itemType',
      key: 'type',
      width: 80,
      render: (v: string) => <Tag color={ITEM_TYPE_MAP[v]?.color}>{ITEM_TYPE_MAP[v]?.label || v}</Tag>,
    },
    {
      title: '项目名称',
      dataIndex: 'itemName',
      key: 'name',
      width: 100,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 100,
      align: 'right' as const,
      render: (v: number) => (
        <span className={v > 0 ? 'text-green-600' : 'text-red-500'}>
          {v > 0 ? '+' : ''}{v?.toLocaleString()}
        </span>
      ),
    },
    {
      title: '生效日期',
      dataIndex: 'startMonth',
      key: 'start',
      width: 120,
      render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD') : '-',
    },
    {
      title: '截止日期',
      dataIndex: 'endMonth',
      key: 'end',
      width: 120,
      render: (v: string | null) => v ? dayjs(v).format('YYYY-MM-DD') : '长期有效',
    },
    {
      title: '说明',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, r: SalaryAdjustment) => (
        <Space size="small">
          <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openEditDialog(r)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id)}>
            <Button size="small" type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 统计
  const stats = {
    total: data.length,
    totalAmount: data.reduce((sum, d) => sum + d.amount, 0),
    recurringCount: data.filter(d => d.isRecurring).length,
    oneTimeCount: data.filter(d => !d.isRecurring).length,
  };

  return (
    <div className="space-y-6">
      {contextHolder}

      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📊 薪资调整</h1>
          <p className="text-sm text-muted-foreground mt-1">管理员工各项薪资补贴、扣款调整</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddDialog}>
          新增调整
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card size="small">
            <div className="text-sm text-muted-foreground">调整总数</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div className="text-sm text-muted-foreground">调整总金额/月</div>
            <div className="text-2xl font-bold text-blue-600">{stats.totalAmount.toLocaleString()}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div className="text-sm text-muted-foreground">定期调整</div>
            <div className="text-2xl font-bold">{stats.recurringCount}</div>
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <div className="text-sm text-muted-foreground">一次性调整</div>
            <div className="text-2xl font-bold">{stats.oneTimeCount}</div>
          </Card>
        </Col>
      </Row>

      {/* 调整记录列表 */}
      <Card>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editing ? '编辑薪资调整' : '新增薪资调整'}
        open={dialogOpen}
        onOk={handleSave}
        onCancel={() => setDialogOpen(false)}
        width={560}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="employeeId" label="选择员工" rules={[{ required: true, message: '请选择员工' }]}>
                <Select
                  showSearch
                  placeholder="搜索员工姓名"
                  optionFilterProp="label"
                  options={employees.map(e => ({
                    value: e.id,
                    label: `${e.name} — ${e.department}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="itemType" label="调整类型" rules={[{ required: true }]}>
                <Select options={[
                  { value: 'allowance', label: '💰 补贴' },
                  { value: 'deduction', label: '➖ 扣款' },
                  { value: 'earnings', label: '📈 收入' },
                ]} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="itemName" label="调整项目" rules={[{ required: true, message: '请选择项目' }]}>
                <Select
                  showSearch
                  placeholder="选择或输入"
                  options={ITEM_OPTIONS}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="amount" label="金额（元/月）" rules={[{ required: true, message: '请输入金额' }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  min={-999999}
                  precision={2}
                  placeholder="正数为增加，负数为扣除"
                  formatter={v => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startMonth" label="生效日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} picker="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endMonth" label="截止日期（留空=长期）">
                <DatePicker style={{ width: '100%' }} picker="date" placeholder="长期有效" allowClear />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="isRecurring" label="是否定期生效" valuePropName="checked">
                <span className="text-sm text-muted-foreground">每月自动计入薪资（勾选=定期，不勾=一次性）</span>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="reason" label="调整原因">
            <Input.TextArea rows={2} placeholder="请输入调整原因，便于后续追溯" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
