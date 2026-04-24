import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber,
  Tag, Space, Popconfirm, message, Badge, Drawer, Descriptions, Statistic,
  Row, Col, Tooltip, Avatar
} from "antd";
const { Option } = Select;
const { TextArea } = Input;
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  UserOutlined, EyeOutlined, MailOutlined, PhoneOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const TABLE = "candidates";

const STATUS_OPTIONS = [
  { value: "new", label: "新入库", color: "gold" },
  { value: "screening", label: "筛选中", color: "blue" },
  { value: "interviewed", label: "面试中", color: "purple" },
  { value: "offered", label: "已发Offer", color: "cyan" },
  { value: "hired", label: "已入职", color: "green" },
  { value: "rejected", label: "已淘汰", color: "default" },
  { value: "blacklisted", label: "黑名单", color: "red" },
];

const SOURCE_OPTIONS = [
  { value: "zhaopin", label: "智联招聘" },
  { value: "51job", label: "前程无忧" },
  { value: "liepin", label: "猎聘" },
  { value: "boss", label: "BOSS直聘" },
  { value: "referral", label: "内部推荐" },
  { value: "campus", label: "校园招聘" },
  { value: "other", label: "其他" },
];

interface IRecord {
  id: number;
  name: string;
  phone: string;
  email: string;
  gender: string;
  age: number;
  education: string;
  major: string | null;
  positionId: number | null;
  positionTitle: string | null;
  source: string;
  status: string;
  resumeUrl: string | null;
  currentCompany: string | null;
  currentPosition: string | null;
  expectedSalary: number | null;
  interviewDate: string | null;
  interviewResult: string | null;
  offerStatus: string | null;
  testScore: number | null;
  interviewFeedback: string | null;
  tags: string | null;
  talentPoolId: number | null;
  blacklisted: number;
  remark: string | null;
  createdAt: string;
}

export default function CandidatePage() {
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
    form.setFieldsValue({ gender: "male", status: "new", source: "other", blacklisted: 0 });
    setModalVisible(true);
  };

  const handleEdit = (record: IRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      interviewDate: record.interviewDate ? dayjs(record.interviewDate) : null,
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
        interviewDate: values.interviewDate?.format("YYYY-MM-DD"),
        blacklisted: values.blacklisted ? 1 : 0,
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
      title: "姓名",
      dataIndex: "name",
      render: (v: string, r: IRecord) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          <Tag color="blue">{v}</Tag>
          {r.blacklisted === 1 && <Tag color="red">黑名单</Tag>}
        </Space>
      ),
    },
    {
      title: "联系方式",
      width: 150,
      render: (_: any, r: IRecord) => (
        <div>
          <div><PhoneOutlined /> {r.phone}</div>
          <div style={{ fontSize: 12, color: "#999" }}><MailOutlined /> {r.email}</div>
        </div>
      ),
    },
    {
      title: "基本信息",
      width: 130,
      render: (_: any, r: IRecord) => (
        <div>
          <Tag>{r.gender === "male" ? "男" : "女"} · {r.age}岁</Tag>
          <div style={{ fontSize: 12 }}>{r.education}</div>
        </div>
      ),
    },
    {
      title: "应聘岗位",
      dataIndex: "positionTitle",
      render: (v: string | null) => v ? <Tag color="purple">{v}</Tag> : "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (v: string) => {
        const s = STATUS_OPTIONS.find(o => o.value === v);
        return <Badge status={s?.color as any || "default"} text={s?.label || v} />;
      },
    },
    {
      title: "来源",
      dataIndex: "source",
      width: 100,
      render: (v: string) => {
        const src = SOURCE_OPTIONS.find(s => s.value === v);
        return src?.label || v;
      },
    },
    {
      title: "面试日期",
      dataIndex: "interviewDate",
      width: 110,
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
    interviewed: data.filter(d => d.status === "interviewed").length,
    offered: data.filter(d => d.status === "offered" || d.status === "hired").length,
    blacklisted: data.filter(d => d.blacklisted === 1).length,
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="候选人总数" value={stats.total} prefix={<UserOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="面试中" value={stats.interviewed} valueStyle={{ color: "#722ed1" }} />
          </Col>
          <Col span={6}>
            <Statistic title="已发Offer" value={stats.offered} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col span={6}>
            <Statistic title="黑名单" value={stats.blacklisted} valueStyle={{ color: "#cf1322" }} />
          </Col>
        </Row>
      </Card>

      <Card
        title="候选人列表"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索姓名/手机"
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
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增候选人</Button>
          </Space>
        }
      >
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Modal
        title={editingRecord ? "编辑候选人" : "新增候选人"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                <Input placeholder="候选人姓名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="phone" label="手机号" rules={[{ required: true }]}>
                <Input placeholder="手机号码" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="email" label="邮箱">
                <Input placeholder="电子邮箱" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="gender" label="性别">
                <Select>
                  <Option value="male">男</Option>
                  <Option value="female">女</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="age" label="年龄">
                <InputNumber min={18} max={65} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="education" label="学历">
                <Select>
                  <Option value="大专">大专</Option>
                  <Option value="本科">本科</Option>
                  <Option value="硕士">硕士</Option>
                  <Option value="博士">博士</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="major" label="专业">
                <Input placeholder="所学专业" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="positionTitle" label="应聘岗位">
                <Input placeholder="应聘岗位名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="source" label="来源渠道">
                <Select>
                  {SOURCE_OPTIONS.map(s => (
                    <Option key={s.value} value={s.value}>{s.label}</Option>
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
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="currentCompany" label="当前公司">
                <Input placeholder="目前就职公司" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currentPosition" label="当前职位">
                <Input placeholder="目前职位" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="expectedSalary" label="期望薪资(K)">
                <InputNumber min={1} max={500} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="interviewDate" label="面试日期">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="testScore" label="测试分数">
                <InputNumber min={0} max={100} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="interviewFeedback" label="面试反馈">
            <TextArea rows={3} placeholder="面试官反馈意见" />
          </Form.Item>
          <Form.Item name="tags" label="标签">
            <Input placeholder="标签，逗号分隔，如：高潜,技术强" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={2} placeholder="其他备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="候选人详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{viewingRecord.id}</Descriptions.Item>
            <Descriptions.Item label="姓名">
              <Space>
                <Avatar icon={<UserOutlined />} />
                <Tag color="blue">{viewingRecord.name}</Tag>
                {viewingRecord.blacklisted === 1 && <Tag color="red">黑名单</Tag>}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="联系方式">
              <div><PhoneOutlined /> {viewingRecord.phone}</div>
              <div><MailOutlined /> {viewingRecord.email}</div>
            </Descriptions.Item>
            <Descriptions.Item label="性别">{viewingRecord.gender === "male" ? "男" : "女"}</Descriptions.Item>
            <Descriptions.Item label="年龄">{viewingRecord.age}岁</Descriptions.Item>
            <Descriptions.Item label="学历">{viewingRecord.education}</Descriptions.Item>
            <Descriptions.Item label="专业">{viewingRecord.major || "-"}</Descriptions.Item>
            <Descriptions.Item label="应聘岗位">
              {viewingRecord.positionTitle ? <Tag color="purple">{viewingRecord.positionTitle}</Tag> : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Badge 
                status={STATUS_OPTIONS.find(s => s.value === viewingRecord.status)?.color as any || "default"} 
                text={STATUS_OPTIONS.find(s => s.value === viewingRecord.status)?.label || viewingRecord.status} 
              />
            </Descriptions.Item>
            <Descriptions.Item label="来源">
              {SOURCE_OPTIONS.find(s => s.value === viewingRecord.source)?.label || viewingRecord.source}
            </Descriptions.Item>
            <Descriptions.Item label="当前公司">{viewingRecord.currentCompany || "-"}</Descriptions.Item>
            <Descriptions.Item label="当前职位">{viewingRecord.currentPosition || "-"}</Descriptions.Item>
            <Descriptions.Item label="期望薪资">
              {viewingRecord.expectedSalary ? `${viewingRecord.expectedSalary}K` : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="面试日期">{viewingRecord.interviewDate || "-"}</Descriptions.Item>
            <Descriptions.Item label="测试分数">{viewingRecord.testScore ?? "-"}</Descriptions.Item>
            <Descriptions.Item label="面试反馈">{viewingRecord.interviewFeedback || "-"}</Descriptions.Item>
            <Descriptions.Item label="标签">{viewingRecord.tags || "-"}</Descriptions.Item>
            <Descriptions.Item label="备注">{viewingRecord.remark || "-"}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
