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
  accepted: "green", expired: "default", pending: "gold",
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
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vals)
      });
      if (res.ok) {
        message.success(editing ? "修改成功" : "新增成功");
        setModalOpen(false);
        fetchData();
      } else { message.error("保存失败"); }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/${TABLE}/${id}`, { method: "DELETE" });
    message.success("删除成功");
    fetchData();
  };

  const columns = [
      { title: "文档名称", dataIndex: "name", key: "name", ellipsis: true },
      { title: "文件夹ID", dataIndex: "folderId", key: "folderId", ellipsis: true },
      { title: "类型", dataIndex: "type", key: "type", ellipsis: true },
      { title: "大小", dataIndex: "size", key: "size", ellipsis: true },
      { title: "上传人", dataIndex: "uploaderName", key: "uploaderName", ellipsis: true },
      { title: "链接", dataIndex: "url", key: "url", ellipsis: true },
      { title: "上传时间", dataIndex: "createdAt", key: "createdAt", ellipsis: true },
    {
      title: "操作", key: "action", fixed: "right", width: 120,
      render: (_: any, r: IRecord) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={<span style={{ fontSize: 18, fontWeight: 600 }}>文档管理</span>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={openAdd}>新增</Button>}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: "16px 16px 0" }}>
          <Space>
            <Input.Search
              placeholder="搜索..." value={search}
              onChange={e => setSearch(e.target.value)}
              onSearch={() => setPagination(p => ({ ...p, current: 1 }))}
              style={{ width: 240 }} allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={() => { setPagination(p => ({ ...p, current: 1 })); fetchData(); }}>
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns} dataSource={data} rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t: number) => `共 ${t} 条`
          }}
          onChange={pag => setPagination(p => ({ ...p, current: pag.current || 1, pageSize: pag.pageSize || 20 }))}
          scroll={{ x: "max-content" }}
          size="middle"
          style={{ marginTop: 8 }}
        />
      </Card>

      <Modal
        title={(editing ? "编辑" : "新增") + "文档管理"}
        open={modalOpen} onOk={handleSave} onCancel={() => setModalOpen(false)}
        width={720} okText="保存" cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="文档名称" name="name"><Input placeholder="请输入文档名称" /></Form.Item>
          <Form.Item label="文件夹ID" name="folderId"><Input placeholder="请输入文件夹ID" /></Form.Item>
          <Form.Item label="类型" name="type"><Input placeholder="请输入类型" /></Form.Item>
          <Form.Item label="大小" name="size"><Input placeholder="请输入大小" /></Form.Item>
          <Form.Item label="上传人" name="uploaderName"><Input placeholder="请输入上传人" /></Form.Item>
          <Form.Item label="链接" name="url"><Input placeholder="请输入链接" /></Form.Item>
          <Form.Item label="上传时间" name="createdAt"><Input placeholder="请输入上传时间" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
