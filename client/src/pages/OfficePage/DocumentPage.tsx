import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Tag, Space, Popconfirm, message, InputNumber, Switch, Badge
} from "antd";
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined
} from "@ant-design/icons";

const TABLE = "documents";

const STATUS_COLORS: Record<string, string> = {
  pending: "gold", approved: "green", rejected: "red", open: "blue",
  closed: "default", active: "green", draft: "default", paused: "orange",
  S: "purple", A: "blue", B: "cyan", C: "geekblue", D: "red",
  new: "gold", viewed: "cyan", interviewed: "blue", offered: "green",
  passed: "green", male: "blue", female: "pink", available: "green",
  in_use: "blue", maintenance: "orange", retired: "default",
  正常: "green", 调班: "blue", 请假: "gold", 旷工: "red",
  营业中: "green", 休息: "orange", 停用: "default",
  planned: "blue", in_progress: "processing", completed: "green", cancelled: "red",
  full: "red", submitted: "processing", reviewed: "success",
  accepted: "green", expired: "default",
};

interface IRecord { id: string; [k: string]: any }

export default function 文档管理Page() {
  const [data, setData] = useState<IRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pagination.current > 1) params.set("page", String(pagination.current));
      if (pagination.pageSize !== 20) params.set("pageSize", String(pagination.pageSize));
      if (search) params.set("search", search);
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      setData(rows);
      setPagination(p => ({ ...p, total: json.total || rows.length }));
    } catch { message.error("加载数据失败"); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (r: IRecord) => { setEditing(r); form.setFieldsValue({ ...r }); setModalOpen(true); };

  const handleSave = async () => {
    try {
      const vals = await form.validateFields();
      const url = editing ? `/api/${TABLE}/${editing.id}` : `/api/${TABLE}`;
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(vals) });
      if (!res.ok) throw new Error("请求失败");
      message.success(editing ? "更新成功" : "新增成功");
      setModalOpen(false);
      fetchData();
    } catch { message.error("保存失败"); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/${TABLE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      message.success("删除成功");
      fetchData();
    } catch { message.error("删除失败"); }
  };

  const columns = [
    { title: "文档名称", dataIndex: "name", width: 200 },
    { title: "文档编号", dataIndex: "code", width: 120 },
    { title: "文档类型", dataIndex: "type", width: 100, render: (v: string) => <Tag color={STATUS_COLORS[v] || "default"}>{v}</Tag> },
    { title: "版本", dataIndex: "version", width: 70 },
    { title: "状态", dataIndex: "status", width: 80, render: (v: string) => <Tag color={STATUS_COLORS[v] || "default"}>{v}</Tag> },
    { title: "所属部门", dataIndex: "department", width: 120 },
    { title: "创建人", dataIndex: "createdBy", width: 80 },
    { title: "创建时间", dataIndex: "createdAt", width: 160 },
    { title: "操作", width: 150, render: (_: any, r: IRecord) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}><Button size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
      </Space>
    )}
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="文档管理" extra={<Space><Input placeholder="搜索文档名称" allowClear style={{width:200}} onChange={e=>setSearch(e.target.value)} onPressEnter={fetchData}/><Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button><Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增文档</Button></Space>}>
        <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true, showTotal: t => `共 ${t} 条`, onChange: (p, ps) => setPagination(x => ({ ...x, current: p, pageSize: ps || 20 })) }} />
      </Card>
      <Modal title={editing ? "编辑文档" : "新增文档"} open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="文档名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="code" label="文档编号"><Input /></Form.Item>
          <Form.Item name="type" label="文档类型"><Input /></Form.Item>
          <Form.Item name="version" label="版本"><Input /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="draft"><Select><Select.Option value="draft">草稿</Select.Option><Select.Option value="active">启用</Select.Option><Select.Option value="paused">停用</Select.Option></Select></Form.Item>
          <Form.Item name="department" label="所属部门"><Input /></Form.Item>
          <Form.Item name="description" label="文档描述"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
