import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select, Upload,
  Tag, Space, Popconfirm, message, Badge, Drawer, Descriptions, Statistic,
  Row, Col, Tooltip
} from "antd";
const { Option } = Select;
const { TextArea } = Input;
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  FileTextOutlined, EyeOutlined, UploadOutlined, DownloadOutlined
} from "@ant-design/icons";

const TABLE = "resumes";

const STATUS_OPTIONS = [
  { value: "pending", label: "待解析", color: "gold" },
  { value: "parsed", label: "已解析", color: "green" },
  { value: "failed", label: "解析失败", color: "red" },
];

interface IRecord {
  id: number;
  candidateId: number | null;
  fileName: string;
  fileUrl: string;
  parseResult: string | null;
  rawText: string | null;
  createdAt: string;
}

interface ICandidate {
  id: number;
  name: string;
}

export default function ResumePage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [candidates, setCandidates] = useState<ICandidate[]>([]);
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
      const res = await fetch("/api/candidates");
      const result = await res.json();
      setCandidates(result.data || []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchCandidates();
  }, [fetchData, fetchCandidates]);

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

  const handleParse = async (id: number) => {
    try {
      const res = await fetch(`/api/${TABLE}/${id}/parse`, { method: "POST" });
      const result = await res.json();
      message.success("解析完成");
      fetchData();
    } catch {
      message.error("解析失败");
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
        message.success("上传成功");
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
      title: "文件名", 
      dataIndex: "fileName",
      ellipsis: true,
      render: (v: string) => (
        <Space>
          <FileTextOutlined style={{ color: "#1890ff" }} />
          <span>{v}</span>
        </Space>
      )
    },
    {
      title: "关联候选人",
      dataIndex: "candidateId",
      width: 120,
      render: (v: number | null) => {
        if (!v) return <Tag>未关联</Tag>;
        const c = candidates.find(c => c.id === v);
        return <Tag color="blue">{c?.name || `#${v}`}</Tag>;
      },
    },
    {
      title: "解析结果",
      dataIndex: "parseResult",
      width: 120,
      ellipsis: true,
      render: (v: string | null) => v ? <Tooltip title={v.substring(0, 100)}><span>{v.substring(0, 30)}...</span></Tooltip> : "-",
    },
    {
      title: "原始文本",
      dataIndex: "rawText",
      width: 100,
      render: (v: string | null) => v ? <Tag color="green">已提取</Tag> : <Tag>未提取</Tag>,
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      width: 160,
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
          <Tooltip title="解析">
            <Button icon={<DownloadOutlined />} size="small" onClick={() => handleParse(record.id)} />
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
    parsed: data.filter(d => d.parseResult).length,
    linked: data.filter(d => d.candidateId).length,
    withText: data.filter(d => d.rawText).length,
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="简历总数" value={stats.total} prefix={<FileTextOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="已解析" value={stats.parsed} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col span={6}>
            <Statistic title="已关联候选人" value={stats.linked} valueStyle={{ color: "#1890ff" }} />
          </Col>
          <Col span={6}>
            <Statistic title="已提取文本" value={stats.withText} valueStyle={{ color: "#722ed1" }} />
          </Col>
        </Row>
      </Card>

      <Card
        title="简历管理列表"
        extra={
          <Space>
            <Input.Search
              placeholder="搜索文件名"
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
            <Button type="primary" icon={<UploadOutlined />} onClick={handleAdd}>上传简历</Button>
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
        title={editingRecord ? "编辑简历" : "上传简历"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fileName" label="文件名" rules={[{ required: true }]}>
                <Input placeholder="简历文件名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fileUrl" label="文件路径" rules={[{ required: true }]}>
                <Input placeholder="文件存储路径或URL" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="candidateId" label="关联候选人">
            <Select placeholder="选择候选人" allowClear showSearch optionFilterProp="children">
              {candidates.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="parseResult" label="解析结果">
            <TextArea rows={3} placeholder="JSON格式的解析结果" />
          </Form.Item>
          <Form.Item name="rawText" label="原始文本">
            <TextArea rows={5} placeholder="从简历提取的纯文本内容" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="简历详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{viewingRecord.id}</Descriptions.Item>
            <Descriptions.Item label="文件名">
              <Space>
                <FileTextOutlined style={{ color: "#1890ff" }} />
                <span>{viewingRecord.fileName}</span>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="文件路径">
              <a href={viewingRecord.fileUrl} target="_blank" rel="noopener noreferrer">
                {viewingRecord.fileUrl}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="关联候选人">
              {viewingRecord.candidateId 
                ? <Tag color="blue">{candidates.find(c => c.id === viewingRecord.candidateId)?.name || `#${viewingRecord.candidateId}`}</Tag>
                : <Tag>未关联</Tag>
              }
            </Descriptions.Item>
            <Descriptions.Item label="解析结果">
              <div style={{ 
                background: "#f5f5f5", 
                padding: 8, 
                borderRadius: 4, 
                maxHeight: 200, 
                overflow: "auto",
                whiteSpace: "pre-wrap",
                fontFamily: "monospace",
                fontSize: 12
              }}>
                {viewingRecord.parseResult || "(无解析结果)"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="原始文本">
              <div style={{ 
                background: "#f6ffed", 
                padding: 8, 
                borderRadius: 4, 
                maxHeight: 300, 
                overflow: "auto",
                whiteSpace: "pre-wrap"
              }}>
                {viewingRecord.rawText || "(无文本内容)"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
}
