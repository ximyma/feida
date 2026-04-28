import React, { useState, useEffect, useCallback } from "react";
import {
  Card, Table, Button, Modal, Form, Input, Select, Switch,
  Tag, Space, Popconfirm, message, Badge, Drawer, Descriptions, Statistic,
  Row, Col, Tooltip, Alert, Tabs, Divider, Avatar, List, Empty
} from "antd";
const { Option } = Select;
const { TextArea } = Input;
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  PrinterOutlined, EyeOutlined, FileTextOutlined, UserOutlined,
  IdcardOutlined, FilePdfOutlined, FileExcelOutlined, DownloadOutlined,
  PlayCircleOutlined
} from "@ant-design/icons";

const TABLE = "print_templates";

const TEMPLATE_TYPES = [
  { value: "contract", label: "劳动合同" },
  { value: "onboarding", label: "入职登记表" },
  { value: "resignation", label: "离职申请表" },
  { value: "certificate", label: "在职证明" },
  { value: "salary", label: "工资条" },
  { value: "attendance", label: "考勤表" },
  { value: "leave", label: "请假单" },
  { value: "other", label: "其他" },
];

const PAPER_SIZES = [
  { value: "A4", label: "A4" },
  { value: "A5", label: "A5" },
  { value: "Letter", label: "信纸" },
  { value: "Legal", label: "法律纸" },
];

interface IRecord {
  id: number;
  name: string;
  type: string;
  content: string | null;
  paperSize: string;
  orientation: string;
  isDefault: number;
  createdAt: string;
}

// 员工数据接口
interface IEmployee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  gender: string;
  phone: string;
  email: string;
  idCard: string;
  entryDate: string;
  photoUrl?: string;
}

// 可用变量列表
const VARIABLE_LIST = [
  { key: '${employeeName}', label: '员工姓名', category: '基本信息' },
  { key: '${employeeId}', label: '工号', category: '基本信息' },
  { key: '${department}', label: '部门', category: '基本信息' },
  { key: '${position}', label: '岗位', category: '基本信息' },
  { key: '${gender}', label: '性别', category: '基本信息' },
  { key: '${phone}', label: '手机号', category: '基本信息' },
  { key: '${email}', label: '邮箱', category: '基本信息' },
  { key: '${idCard}', label: '身份证号', category: '基本信息' },
  { key: '${entryDate}', label: '入职日期', category: '基本信息' },
  { key: '${companyName}', label: '公司名称', category: '系统信息' },
  { key: '${printDate}', label: '打印日期', category: '系统信息' },
  { key: '${photo}', label: '员工照片占位符', category: '其他' },
];

export default function PrintTemplatePage() {
  const [data, setData] = useState<IRecord[]>([]);
  const [employees, setEmployees] = useState<IEmployee[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<IRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<IRecord | null>(null);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [form] = Form.useForm();

  // 员工卡片打印状态
  const [cardPrintModal, setCardPrintModal] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<IEmployee[]>([]);
  const [previewEmployee, setPreviewEmployee] = useState<IEmployee | null>(null);
  const [activeTab, setActiveTab] = useState<string>("templates");

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
    fetchEmployees();
  }, [fetchData]);

  // 加载员工数据
  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      const result = await res.json();
      const emps = Array.isArray(result) ? result : (result.data || []);
      setEmployees(emps.map((e: any) => ({
        id: e.id,
        name: e.name || '',
        employeeId: e.employeeId || e.id,
        department: e.department || e.departmentName || '',
        position: e.position || e.positionTitle || '',
        gender: e.gender === 'male' ? '男' : '女',
        phone: e.phone || '',
        email: e.email || '',
        idCard: e.idCard || '',
        entryDate: e.entryDate || e.hireDate || '',
        photoUrl: e.photoUrl || e.avatar,
      })));
    } catch {}
  };

  // 模板变量替换
  const applyTemplate = (template: string, employee: IEmployee): string => {
    const vars: Record<string, string> = {
      '${employeeName}': employee.name,
      '${employeeId}': employee.employeeId,
      '${department}': employee.department,
      '${position}': employee.position,
      '${gender}': employee.gender,
      '${phone}': employee.phone,
      '${email}': employee.email,
      '${idCard}': employee.idCard,
      '${entryDate}': employee.entryDate,
      '${companyName}': '飞达科技有限公司',
      '${printDate}': new Date().toISOString().slice(0, 10),
      '${photo}': `<div class="photo-placeholder">照片</div>`,
    };
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
      result = result.replace(new RegExp(key.replace('$', '\\$'), 'g'), value);
    }
    return result;
  };

  // 生成员工卡片
  const generateEmployeeCard = (employee: IEmployee): string => {
    return `
      <div style="width: 85mm; height: 54mm; border: 1px solid #333; border-radius: 8px; padding: 8px; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 20px; background: rgba(255,255,255,0.2);"></div>
        <div style="display: flex; align-items: center; margin-bottom: 8px; margin-top: 8px;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 8px;">👤</div>
          <div>
            <div style="font-size: 14px; font-weight: bold;">${employee.name}</div>
            <div style="font-size: 10px; opacity: 0.9;">${employee.position}</div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px; font-size: 9px; margin-top: 4px;">
          <div>工号: ${employee.employeeId}</div>
          <div>部门: ${employee.department}</div>
          <div>入职: ${employee.entryDate}</div>
        </div>
        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 16px; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; font-size: 8px;">
          飞达科技有限公司
        </div>
      </div>
    `;
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ paperSize: "A4", orientation: "portrait", isDefault: false });
    setModalVisible(true);
  };

  const handleEdit = (record: IRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      isDefault: Boolean(record.isDefault),
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

  const handleSetDefault = async (id: number) => {
    try {
      // 先取消所有默认
      const defaults = data.filter(d => d.isDefault);
      for (const d of defaults) {
        await fetch(`/api/${TABLE}/${d.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...d, isDefault: 0 }),
        });
      }
      // 设置新的默认
      await fetch(`/api/${TABLE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: 1 }),
      });
      message.success("已设为默认模板");
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
        isDefault: values.isDefault ? 1 : 0,
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
      title: "模板名称", 
      dataIndex: "name",
      render: (v: string, r: IRecord) => (
        <Space>
          <Tag color="blue">{v}</Tag>
          {r.isDefault ? <Tag color="green">默认</Tag> : null}
        </Space>
      )
    },
    {
      title: "模板类型",
      dataIndex: "type",
      render: (v: string) => {
        const type = TEMPLATE_TYPES.find(t => t.value === v);
        return <Tag color="purple">{type?.label || v}</Tag>;
      },
    },
    {
      title: "纸张大小",
      dataIndex: "paperSize",
      width: 100,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: "打印方向",
      dataIndex: "orientation",
      width: 100,
      render: (v: string) => v === "landscape" ? "横向" : "纵向",
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
          {!record.isDefault && (
            <Tooltip title="设为默认">
              <Button icon={<PrinterOutlined />} size="small" onClick={() => handleSetDefault(record.id)} />
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
    contracts: data.filter(d => d.type === "contract").length,
    defaults: data.filter(d => d.isDefault).length,
    a4: data.filter(d => d.paperSize === "A4").length,
  };

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="模板总数" value={stats.total} prefix={<FileTextOutlined />} />
          </Col>
          <Col span={6}>
            <Statistic title="合同模板" value={stats.contracts} valueStyle={{ color: "#722ed1" }} />
          </Col>
          <Col span={6}>
            <Statistic title="默认模板" value={stats.defaults} valueStyle={{ color: "#52c41a" }} />
          </Col>
          <Col span={6}>
            <Statistic title="A4纸张" value={stats.a4} valueStyle={{ color: "#1890ff" }} />
          </Col>
        </Row>
      </Card>

      <Card
        title="打印模板列表"
        extra={
          <Space>
            <Button type="primary" icon={<IdcardOutlined />} onClick={() => setCardPrintModal(true)}>员工工卡打印</Button>
            <Input.Search
              placeholder="搜索模板名"
              allowClear
              style={{ width: 150 }}
              onSearch={setSearchText}
            />
            <Select
              placeholder="模板类型"
              allowClear
              style={{ width: 130 }}
              onChange={setTypeFilter}
            >
              {TEMPLATE_TYPES.map(t => (
                <Option key={t.value} value={t.value}>{t.label}</Option>
              ))}
            </Select>
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增模板</Button>
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
        title={editingRecord ? "编辑模板" : "新增模板"}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="模板名称" rules={[{ required: true }]}>
                <Input placeholder="请输入模板名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="模板类型" rules={[{ required: true }]}>
                <Select placeholder="选择模板类型">
                  {TEMPLATE_TYPES.map(t => (
                    <Option key={t.value} value={t.value}>{t.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="paperSize" label="纸张大小">
                <Select>
                  {PAPER_SIZES.map(p => (
                    <Option key={p.value} value={p.value}>{p.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="orientation" label="打印方向">
                <Select>
                  <Option value="portrait">纵向</Option>
                  <Option value="landscape">横向</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isDefault" label="设为默认" valuePropName="checked">
                <Switch checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="模板内容">
            <TextArea rows={10} placeholder="HTML模板内容，支持变量替换如 ${employeeName}" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="模板详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {viewingRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID">{viewingRecord.id}</Descriptions.Item>
            <Descriptions.Item label="模板名称">
              <Space>
                <Tag color="blue">{viewingRecord.name}</Tag>
                {viewingRecord.isDefault ? <Tag color="green">默认</Tag> : null}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="模板类型">
              <Tag color="purple">
                {TEMPLATE_TYPES.find(t => t.value === viewingRecord.type)?.label || viewingRecord.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="纸张大小">{viewingRecord.paperSize}</Descriptions.Item>
            <Descriptions.Item label="打印方向">
              {viewingRecord.orientation === "landscape" ? "横向" : "纵向"}
            </Descriptions.Item>
            <Descriptions.Item label="模板内容">
              <div style={{ 
                background: '#f5f5f5', 
                padding: 12, 
                borderRadius: 4, 
                maxHeight: 400, 
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: 12,
                whiteSpace: 'pre-wrap'
              }}>
                {viewingRecord.content || "(无内容)"}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{viewingRecord.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* 员工卡片打印 Modal */}
      <Modal
        title={<><IdcardOutlined /> 员工卡片打印</>}
        open={cardPrintModal}
        onCancel={() => { setCardPrintModal(false); setSelectedEmployees([]); setPreviewEmployee(null); }}
        footer={null}
        width={900}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'templates', label: '选择模板' },
          { key: 'employees', label: '选择员工' },
          { key: 'preview', label: '预览打印' },
        ]} />

        {activeTab === 'templates' && (
          <div className="py-4">
            <Alert message="💡 选择一个模板，或直接使用默认员工卡片格式进行打印" type="info" showIcon />
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={data}
              renderItem={(item) => (
                <List.Item>
                  <Card 
                    hoverable
                    style={{ border: previewEmployee ? undefined : '2px solid #1890ff' }}
                    onClick={() => {
                      setSelectedEmployees(prev => prev.length > 0 ? prev : []);
                      message.info(`已选择模板: ${item.name}`);
                    }}
                    actions={[
                      <Tooltip title="预览"><Button type="text" icon={<EyeOutlined />} onClick={() => setPreviewEmployee(employees[0] || null)} /></Tooltip>,
                    ]}
                  >
                    <Card.Meta 
                      title={<Space><Tag color="blue">{item.name}</Tag>{item.isDefault ? <Tag color="green">默认</Tag> : null}</Space>}
                      description={
                        <div className="text-xs text-gray-500">
                          <div>类型: {TEMPLATE_TYPES.find(t => t.value === item.type)?.label || item.type}</div>
                          <div>纸张: {item.paperSize} | {item.orientation === 'landscape' ? '横向' : '纵向'}</div>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
            <Divider>快速生成员工卡片</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="工卡样式 1" extra={<Button type="primary" icon={<PlayCircleOutlined />} onClick={() => { setActiveTab('employees'); }}>使用此样式</Button>}>
                  <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: 16, borderRadius: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>👤</div>
                    <div style={{ fontSize: 14, fontWeight: 'bold' }}>员工姓名</div>
                    <div style={{ fontSize: 11 }}>技术部 - 工程师</div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="工卡样式 2" extra={<Button type="primary" icon={<PlayCircleOutlined />} onClick={() => { setActiveTab('employees'); }}>使用此样式</Button>}>
                  <div style={{ border: '2px solid #1890ff', padding: 16, borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 50, height: 60, background: '#f0f0f0', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>照片</div>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>员工姓名</div>
                        <div style={{ fontSize: 12, color: '#666' }}>EMP001</div>
                        <div style={{ fontSize: 11, color: '#999' }}>技术部</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="py-4">
            <Alert message={`已选择 ${selectedEmployees.length} 名员工`} type="success" showIcon className="mb-4" />
            <Input.Search placeholder="搜索员工" allowClear onSearch={(v) => {
              // 模拟搜索
              message.info(`搜索: ${v}`);
            }} className="mb-4" />
            <List
              grid={{ gutter: 8, xs: 2, sm: 4, md: 6, lg: 8 }}
              dataSource={employees.slice(0, 24)}
              renderItem={(emp) => (
                <List.Item>
                  <Card
                    hoverable
                    size="small"
                    style={{ 
                      textAlign: 'center',
                      border: selectedEmployees.find(e => e.id === emp.id) ? '2px solid #1890ff' : '1px solid #e8e8e8'
                    }}
                    onClick={() => {
                      if (selectedEmployees.find(e => e.id === emp.id)) {
                        setSelectedEmployees(selectedEmployees.filter(e => e.id !== emp.id));
                      } else {
                        setSelectedEmployees([...selectedEmployees, emp]);
                      }
                    }}
                    cover={<div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}><Avatar size={40} icon={<UserOutlined />} /></div>}
                  >
                    <div style={{ fontSize: 12, fontWeight: 'bold' }}>{emp.name}</div>
                    <div style={{ fontSize: 10, color: '#999' }}>{emp.employeeId}</div>
                  </Card>
                </List.Item>
              )}
              locale={{ emptyText: <Empty description="暂无员工数据" /> }}
            />
            <Divider />
            <Space>
              <Button type="primary" icon={<EyeOutlined />} onClick={() => { if (selectedEmployees.length > 0) { setPreviewEmployee(selectedEmployees[0]); setActiveTab('preview'); } else { message.warning('请先选择员工'); } }}>预览</Button>
              <Button icon={<ReloadOutlined />} onClick={() => setSelectedEmployees([])}>清空选择</Button>
            </Space>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="py-4">
            <Row gutter={16}>
              <Col span={16}>
                <Alert message="卡片预览（实际打印尺寸: 85mm × 54mm）" type="info" showIcon className="mb-4" />
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 16, 
                  padding: 24, 
                  background: '#f5f5f5', 
                  borderRadius: 8,
                  justifyContent: 'center'
                }}>
                  {selectedEmployees.map(emp => (
                    <div key={emp.id} dangerouslySetInnerHTML={{ __html: generateEmployeeCard(emp) }} />
                  ))}
                </div>
              </Col>
              <Col span={8}>
                <Alert message="可用变量" type="info" showIcon className="mb-4" />
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                  {VARIABLE_LIST.map(v => (
                    <div key={v.key} className="mb-2">
                      <Tag color="blue">{v.key}</Tag>
                      <span className="text-xs text-gray-500 ml-2">{v.label}</span>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
            <Divider />
            <Space>
              <Button type="primary" icon={<PrinterOutlined />} onClick={() => {
                window.print();
                message.success('请在浏览器打印设置中选择正确的纸张尺寸');
              }}>打印全部 ({selectedEmployees.length}张)</Button>
              <Button icon={<DownloadOutlined />} onClick={() => {
                message.info('导出为PDF功能开发中');
              }}>导出PDF</Button>
              <Button onClick={() => setActiveTab('employees')}>返回选择员工</Button>
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
}
