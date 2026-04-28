import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber,
  Tag, Space, Popconfirm, message, Statistic, Row, Col, Badge, Descriptions, Drawer,
  Upload, Alert, Divider, Tabs, DatePicker, Tree
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined,
  HomeOutlined, UserOutlined, DollarOutlined, InboxOutlined,
  ApartmentOutlined, SwapOutlined, CalculatorOutlined, DownloadOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Dragger } = Upload;

const TABLE = 'dormitories';
const BED_TABLE = 'dormitory_beds';
const BILL_TABLE = 'dormitory_bills';
const OCCUPY_TABLE = 'dormitory_occupancy';

const STATUS_OPTIONS = ['available', 'in_use', 'maintenance', 'retired'];
const STATUS_LABELS: Record<string, string> = { 'available': '空闲', 'in_use': '已入住', 'maintenance': '维修中', 'retired': '已停用' };
const STATUS_COLORS: Record<string, string> = { 'available': 'green', 'in_use': 'blue', 'maintenance': 'orange', 'retired': 'default' };
const TYPE_OPTIONS = ['男生宿舍', '女生宿舍', '夫妻房', '管理人员房'];

// 宿舍类型定义
interface IDormitory {
  id: string;
  name: string;
  building: string;
  floor: number;
  roomNumber: string;
  type: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
  monthlyRent: number;
  facilities: string;
  area?: number;
  createdAt: string;
}

// 床位类型定义
interface IBed {
  id: string;
  dormitoryId: string;
  bedNumber: string;
  status: 'available' | 'occupied' | 'reserved' | 'broken';
  employeeId?: string;
  employeeName?: string;
  checkInDate?: string;
  checkOutDate?: string;
  monthlyRent: number;
}

// 水电费账单类型
interface IBill {
  id: string;
  dormitoryId: string;
  dormitoryName: string;
  month: string;
  waterUsage: number;
  waterFee: number;
  electricityUsage: number;
  electricityFee: number;
  totalFee: number;
  status: 'pending' | 'distributed' | 'paid';
  createdAt: string;
}

// 入住记录类型
interface IOccupancy {
  id: string;
  bedId: string;
  dormitoryId: string;
  dormitoryName: string;
  bedNumber: string;
  employeeId: string;
  employeeName: string;
  checkInDate: string;
  checkOutDate?: string;
  monthlyRent: number;
  waterShare: number;
  electricityShare: number;
  status: 'checked_in' | 'checked_out';
}

export default function DormitoryPage() {
  const [activeTab, setActiveTab] = useState('dormitories');
  const [data, setData] = useState<IDormitory[]>([]);
  const [beds, setBeds] = useState<IBed[]>([]);
  const [bills, setBills] = useState<IBill[]>([]);
  const [occupancy, setOccupancy] = useState<IOccupancy[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IDormitory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewing, setViewing] = useState<IDormitory | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [search, setSearch] = useState('');

  // 床位管理状态
  const [bedModalOpen, setBedModalOpen] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState<IDormitory | null>(null);
  const [bedForm] = Form.useForm();
  const [dormBeds, setDormBeds] = useState<IBed[]>([]);

  // 水电费管理状态
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billForm] = Form.useForm();
  const [distributeModalOpen, setDistributeModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<IBill | null>(null);

  // 批量入住状态
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  // 加载宿舍数据
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pagination.current > 1) params.set('page', String(pagination.current));
      if (pagination.pageSize !== 20) params.set('pageSize', String(pagination.pageSize));
      if (search) params.set('search', search);
      const res = await fetch(`/api/${TABLE}?${params.toString()}`);
      const json = await res.json();
      const rows = Array.isArray(json) ? json : (json.data || []);
      setData(rows);
      setPagination(p => ({ ...p, total: json.total || rows.length }));
    } catch { message.error('加载数据失败'); }
    finally { setLoading(false); }
  }, [pagination.current, pagination.pageSize, search]);

  // 加载床位数据
  const fetchBeds = useCallback(async () => {
    try {
      const res = await fetch(`/api/${BED_TABLE}`);
      const json = await res.json();
      setBeds(Array.isArray(json) ? json : (json.data || []));
    } catch {}
  }, []);

  // 加载水电费账单
  const fetchBills = useCallback(async () => {
    try {
      const res = await fetch(`/api/${BILL_TABLE}`);
      const json = await res.json();
      setBills(Array.isArray(json) ? json : (json.data || []));
    } catch {}
  }, []);

  // 加载入住记录
  const fetchOccupancy = useCallback(async () => {
    try {
      const res = await fetch(`/api/${OCCUPY_TABLE}`);
      const json = await res.json();
      setOccupancy(Array.isArray(json) ? json : (json.data || []));
    } catch {}
  }, []);

  useEffect(() => { fetchData(); fetchBeds(); fetchBills(); fetchOccupancy(); }, [fetchData, fetchBeds, fetchBills, fetchOccupancy]);

  // 统计
  const stats = {
    total: data.length,
    available: data.filter(r => r.status === 'available').length,
    inUse: data.filter(r => r.status === 'in_use').length,
    totalBeds: beds.length,
    occupiedBeds: beds.filter(b => b.status === 'occupied').length,
    pendingBills: bills.filter(b => b.status === 'pending').length,
  };

  // 宿舍CRUD
  const handleAdd = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const handleEdit = (r: IDormitory) => { setEditing(r); form.setFieldsValue(r); setModalOpen(true); };
  const handleView = (r: IDormitory) => {
    setViewing(r);
    // 加载该宿舍的床位
    const dBeds = beds.filter(b => b.dormitoryId === r.id);
    setDormBeds(dBeds);
    setDrawerOpen(true);
  };
  const handleDelete = async (id: string) => {
    try { await fetch(`/api/${TABLE}/${id}`, { method: 'DELETE' }); message.success('删除成功'); fetchData(); }
    catch { message.error('删除失败'); }
  };
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const body = editing ? { ...editing, ...values } : { id: `dorm_${Date.now()}`, ...values, createdAt: new Date().toISOString() };
    const method = editing ? 'PUT' : 'POST';
    try {
      await fetch(`/api/${TABLE}${editing ? '/' + editing.id : ''}`, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      message.success(editing ? '修改成功' : '添加成功'); setModalOpen(false);
      // 如果是新建宿舍，自动创建床位
      if (!editing) {
        const bedCount = values.capacity || 4;
        for (let i = 1; i <= bedCount; i++) {
          await fetch(`/api/${BED_TABLE}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: `bed_${Date.now()}_${i}`,
              dormitoryId: body.id,
              bedNumber: `${i}号床`,
              status: 'available',
              monthlyRent: values.monthlyRent || 0,
            })
          });
        }
        message.success(`已自动创建${bedCount}个床位`);
      }
      fetchData(); fetchBeds();
    } catch { message.error('操作失败'); }
  };

  // 床位CRUD
  const handleBedAssign = (dorm: IDormitory) => {
    setSelectedDorm(dorm);
    setDormBeds(beds.filter(b => b.dormitoryId === dorm.id));
    setBedModalOpen(true);
  };
  const handleBedStatusChange = async (bed: IBed, newStatus: string) => {
    try {
      await fetch(`/api/${BED_TABLE}/${bed.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      message.success('床位状态已更新');
      setDormBeds(dormBeds.map(b => b.id === bed.id ? { ...b, status: newStatus as IBed['status'] } : b));
      fetchBeds(); fetchOccupancy();
    } catch { message.error('操作失败'); }
  };
  const handleBedCheckIn = async (bed: IBed, employeeName: string, employeeId: string) => {
    try {
      await fetch(`/api/${BED_TABLE}/${bed.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'occupied',
          employeeId,
          employeeName,
          checkInDate: new Date().toISOString().slice(0, 10)
        })
      });
      // 创建入住记录
      await fetch(`/api/${OCCUPY_TABLE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `occ_${Date.now()}`,
          bedId: bed.id,
          dormitoryId: bed.dormitoryId,
          dormitoryName: data.find(d => d.id === bed.dormitoryId)?.name || '',
          bedNumber: bed.bedNumber,
          employeeId,
          employeeName,
          checkInDate: new Date().toISOString().slice(0, 10),
          monthlyRent: bed.monthlyRent,
          status: 'checked_in',
        })
      });
      message.success(`${employeeName} 已入住 ${bed.bedNumber}`);
      setDormBeds(dormBeds.map(b => b.id === bed.id ? { ...b, status: 'occupied' as const, employeeName, employeeId } : b));
      fetchBeds(); fetchOccupancy();
    } catch { message.error('操作失败'); }
  };

  // 水电费管理
  const handleAddBill = () => {
    billForm.resetFields();
    setBillModalOpen(true);
  };
  const handleBillSubmit = async () => {
    const values = await billForm.getFieldsValue();
    const dormName = data.find(d => d.id === values.dormitoryId)?.name || '';
    try {
      await fetch(`/api/${BILL_TABLE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `bill_${Date.now()}`,
          ...values,
          dormitoryName: dormName,
          totalFee: (values.waterFee || 0) + (values.electricityFee || 0),
          status: 'pending',
        })
      });
      message.success('账单已添加');
      setBillModalOpen(false);
      fetchBills();
    } catch { message.error('操作失败'); }
  };
  const handleDistribute = (bill: IBill) => {
    setSelectedBill(bill);
    setDistributeModalOpen(true);
  };
  const handleDistributeSubmit = async () => {
    if (!selectedBill) return;
    // 获取该宿舍的入住人员
    const occRecords = occupancy.filter(o => o.dormitoryId === selectedBill.dormitoryId && o.status === 'checked_in');
    if (occRecords.length === 0) {
      message.warning('该宿舍暂无入住人员');
      return;
    }
    const perWater = (selectedBill.waterFee || 0) / occRecords.length;
    const perElectric = (selectedBill.electricityFee || 0) / occRecords.length;
    try {
      // 更新每条入住记录的水电分摊
      for (const rec of occRecords) {
        await fetch(`/api/${OCCUPY_TABLE}/${rec.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            waterShare: perWater,
            electricityShare: perElectric,
          })
        });
      }
      // 更新账单状态
      await fetch(`/api/${BILL_TABLE}/${selectedBill.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'distributed' })
      });
      message.success(`已分摊给${occRecords.length}人，水费${perWater.toFixed(2)}元/人，电费${perElectric.toFixed(2)}元/人`);
      setDistributeModalOpen(false);
      fetchBills(); fetchOccupancy();
    } catch { message.error('分摊失败'); }
  };

  // 批量导入入住
  const handleBatchImport: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    // 模拟批量导入
    setTimeout(() => {
      message.success('批量导入成功（模拟）');
      setBatchModalOpen(false);
      fetchBeds(); fetchOccupancy();
      onSuccess?.({});
    }, 1000);
  };

  // 宿舍表格列
  const columns = [
    { title: '宿舍名称', dataIndex: 'name', width: 140, render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '楼栋', dataIndex: 'building', width: 80 },
    { title: '楼层', dataIndex: 'floor', width: 60 },
    { title: '房间号', dataIndex: 'roomNumber', width: 80 },
    { title: '类型', dataIndex: 'type', width: 100, render: (v: string) => <Tag>{v}</Tag> },
    { title: '容量', dataIndex: 'capacity', width: 70, align: 'center' as const },
    { title: '已入住', dataIndex: 'currentOccupancy', width: 80, align: 'center' as const,
      render: (v: number, r: IDormitory) => (
        <Tag color={v >= r.capacity ? 'red' : v > 0 ? 'green' : 'default'}>{v}/{r.capacity}</Tag>
      )
    },
    { title: '月租', dataIndex: 'monthlyRent', width: 90, align: 'right' as const, render: (v: number) => v ? `¥${v}` : '-' },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Badge status={STATUS_COLORS[v] === 'green' ? 'success' : STATUS_COLORS[v] === 'blue' ? 'processing' : 'warning'} text={STATUS_LABELS[v]} /> },
    { title: '操作', width: 220, render: (_: any, r: IDormitory) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => handleView(r)}>详情</Button>
        <Button type="link" size="small" icon={<ApartmentOutlined />} onClick={() => handleBedAssign(r)}>床位</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )}
  ];

  // 床位表格列
  const bedColumns = [
    { title: '床位号', dataIndex: 'bedNumber', width: 100 },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => {
      const map: Record<string, { color: string; text: string }> = {
        available: { color: 'green', text: '空闲' },
        occupied: { color: 'blue', text: '已入住' },
        reserved: { color: 'orange', text: '预留' },
        broken: { color: 'red', text: '损坏' }
      };
      return <Badge status={map[v]?.color as any} text={map[v]?.text || v} />;
    }},
    { title: '入住人', dataIndex: 'employeeName', width: 100, render: (v: string) => v || '-' },
    { title: '入住日期', dataIndex: 'checkInDate', width: 110, render: (v: string) => v || '-' },
    { title: '床位费', dataIndex: 'monthlyRent', width: 90, render: (v: number) => v ? `¥${v}` : '-' },
    { title: '操作', width: 150, render: (_: any, r: IBed) => (
      <Space size="small">
        {r.status === 'available' && (
          <Button size="small" type="primary" onClick={() => {
            const name = prompt('请输入入住人姓名:');
            const empId = prompt('请输入员工工号:');
            if (name && empId) handleBedCheckIn(r, name, empId);
          }}>入住</Button>
        )}
        {r.status === 'occupied' && (
          <Button size="small" danger onClick={() => handleBedStatusChange(r, 'available')}>退宿</Button>
        )}
        {r.status !== 'broken' && (
          <Button size="small" onClick={() => handleBedStatusChange(r, 'broken')}>报修</Button>
        )}
      </Space>
    )}
  ];

  // 账单表格列
  const billColumns = [
    { title: '宿舍', dataIndex: 'dormitoryName', width: 120 },
    { title: '月份', dataIndex: 'month', width: 100 },
    { title: '水费(吨/元)', width: 120, render: (_: any, r: IBill) => `${r.waterUsage || 0} / ¥${r.waterFee || 0}` },
    { title: '电费(度/元)', width: 120, render: (_: any, r: IBill) => `${r.electricityUsage || 0} / ¥${r.electricityFee || 0}` },
    { title: '合计', dataIndex: 'totalFee', width: 90, render: (v: number) => <Tag color="purple">¥{v}</Tag> },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => {
      const map: Record<string, { color: string; text: string }> = {
        pending: { color: 'orange', text: '待分摊' },
        distributed: { color: 'green', text: '已分摊' },
        paid: { color: 'blue', text: '已支付' }
      };
      return <Badge status={map[v]?.color as any} text={map[v]?.text || v} />;
    }},
    { title: '操作', width: 150, render: (_: any, r: IBill) => (
      <Space size="small">
        {r.status === 'pending' && (
          <Button size="small" type="primary" icon={<CalculatorOutlined />} onClick={() => handleDistribute(r)}>分摊</Button>
        )}
        <Button size="small" icon={<EditOutlined />} onClick={() => { setSelectedBill(r); billForm.setFieldsValue(r); setBillModalOpen(true); }} />
      </Space>
    )}
  ];

  // 入住记录表格列
  const occupancyColumns = [
    { title: '宿舍', dataIndex: 'dormitoryName', width: 120 },
    { title: '床位', dataIndex: 'bedNumber', width: 80 },
    { title: '员工姓名', dataIndex: 'employeeName', width: 100 },
    { title: '员工工号', dataIndex: 'employeeId', width: 100 },
    { title: '入住日期', dataIndex: 'checkInDate', width: 110 },
    { title: '退宿日期', dataIndex: 'checkOutDate', width: 110, render: (v: string) => v || '-' },
    { title: '床位费', dataIndex: 'monthlyRent', width: 80, render: (v: number) => `¥${v}` },
    { title: '水费分摊', dataIndex: 'waterShare', width: 90, render: (v: number) => v ? `¥${v.toFixed(2)}` : '-' },
    { title: '电费分摊', dataIndex: 'electricityShare', width: 90, render: (v: number) => v ? `¥${v.toFixed(2)}` : '-' },
    { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => v === 'checked_in' ? <Tag color="green">在住</Tag> : <Tag>已退宿</Tag> },
  ];

  // Tab配置
  const tabs = [
    { key: 'dormitories', label: '🏠 宿舍管理', icon: <HomeOutlined /> },
    { key: 'beds', label: '🛏️ 床位分配', icon: <ApartmentOutlined /> },
    { key: 'bills', label: '💰 水电费管理', icon: <DollarOutlined /> },
    { key: 'occupancy', label: '📋 入住记录', icon: <InboxOutlined /> },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}><Card><Statistic title="宿舍总数" value={stats.total} prefix={<HomeOutlined />} /></Card></Col>
        <Col span={4}><Card><Statistic title="空闲宿舍" value={stats.available} valueStyle={{ color: '#3f8600' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="已入住" value={stats.inUse} valueStyle={{ color: '#1890ff' }} prefix={<UserOutlined />} /></Card></Col>
        <Col span={4}><Card><Statistic title="床位总数" value={stats.totalBeds} /></Card></Col>
        <Col span={4}><Card><Statistic title="已占用床位" value={stats.occupiedBeds} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col span={4}><Card><Statistic title="待分摊账单" value={stats.pendingBills} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 16 }} items={tabs} />

        {/* 宿舍管理 Tab */}
        {activeTab === 'dormitories' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <Space>
                <Input.Search placeholder="搜索宿舍" allowClear style={{ width: 200 }} onSearch={v => { setSearch(v); setPagination(p => ({ ...p, current: 1 })); }} />
                <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
              </Space>
              <Space>
                <Button icon={<SwapOutlined />} onClick={() => setBatchModalOpen(true)}>批量导入入住</Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增宿舍</Button>
              </Space>
            </div>
            <Alert message="💡 新增宿舍时会自动创建对应数量的床位，点击「床位」按钮可进行床位分配管理" type="info" showIcon className="mb-4" />
            <Table rowKey="id" columns={columns} dataSource={data} loading={loading} pagination={pagination} onChange={(p) => setPagination(p)} scroll={{ x: 1200 }} />
          </div>
        )}

        {/* 床位分配 Tab */}
        {activeTab === 'beds' && (
          <div>
            <Alert message="💡 选择宿舍后可查看和分配床位，管理入住和退宿操作" type="info" showIcon className="mb-4" />
            <Row gutter={16}>
              <Col span={8}>
                <Card title="宿舍列表" size="small">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {data.map(dorm => (
                      <div 
                        key={dorm.id}
                        className={`p-3 border rounded cursor-pointer hover:bg-blue-50 ${selectedDorm?.id === dorm.id ? 'bg-blue-100 border-blue-300' : ''}`}
                        onClick={() => { setSelectedDorm(dorm); setDormBeds(beds.filter(b => b.dormitoryId === dorm.id)); }}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{dorm.name}</span>
                          <Tag>{dorm.capacity - dorm.currentOccupancy}/{dorm.capacity}</Tag>
                        </div>
                        <div className="text-xs text-gray-500">{dorm.building} - {dorm.roomNumber}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
              <Col span={16}>
                <Card title={selectedDorm ? `床位管理 - ${selectedDorm.name}` : '请选择左侧宿舍'} size="small">
                  {selectedDorm ? (
                    <Table rowKey="id" columns={bedColumns} dataSource={dormBeds} pagination={false} size="small" />
                  ) : (
                    <div className="text-center text-gray-400 py-12">请从左侧选择宿舍</div>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        )}

        {/* 水电费管理 Tab */}
        {activeTab === 'bills' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <Space>
                <Select placeholder="选择宿舍" allowClear style={{ width: 150 }} onChange={() => {}}>
                  {data.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}
                </Select>
                <DatePicker picker="month" placeholder="选择月份" />
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBill}>添加账单</Button>
            </div>
            <Alert message="💡 导入水电费账单后，点击「分摊」按钮可按入住人数自动分摊水电费" type="info" showIcon className="mb-4" />
            <Table rowKey="id" columns={billColumns} dataSource={bills} pagination={{ pageSize: 10 }} />
          </div>
        )}

        {/* 入住记录 Tab */}
        {activeTab === 'occupancy' && (
          <div>
            <div className="flex justify-end mb-4">
              <Button icon={<DownloadOutlined />}>导出记录</Button>
            </div>
            <Alert message="💡 入住记录包含员工住宿信息和水电费分摊明细" type="info" showIcon className="mb-4" />
            <Table rowKey="id" columns={occupancyColumns} dataSource={occupancy} pagination={{ pageSize: 10 }} scroll={{ x: 1400 }} />
          </div>
        )}
      </Card>

      {/* 宿舍表单 */}
      <Modal title={editing ? '编辑宿舍' : '新增宿舍'} open={modalOpen} onOk={handleSubmit} onCancel={() => setModalOpen(false)} width={600}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="宿舍名称" rules={[{ required: true }]}><Input placeholder="如：A栋101" /></Form.Item></Col>
            <Col span={12}><Form.Item name="type" label="宿舍类型" rules={[{ required: true }]}><Select placeholder="选择类型">{TYPE_OPTIONS.map(t => <Option key={t} value={t}>{t}</Option>)}</Select></Form.Item></Col>
            <Col span={8}><Form.Item name="building" label="楼栋"><Input placeholder="A栋" /></Form.Item></Col>
            <Col span={8}><Form.Item name="floor" label="楼层"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="roomNumber" label="房间号"><Input placeholder="101" /></Form.Item></Col>
            <Col span={8}><Form.Item name="capacity" label="床位数量" rules={[{ required: true }]}><InputNumber min={1} max={20} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="currentOccupancy" label="已入住"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="monthlyRent" label="月租(元)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态"><Select>{STATUS_OPTIONS.map(s => <Option key={s} value={s}>{STATUS_LABELS[s]}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="area" label="面积(㎡)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={24}><Form.Item name="facilities" label="设施"><Input placeholder="空调、热水器、独立卫浴" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* 宿舍详情抽屉 */}
      <Drawer title="宿舍详情" open={drawerOpen} onClose={() => setDrawerOpen(false)} width={600}>
        {viewing && (
          <div className="space-y-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="名称">{viewing.name}</Descriptions.Item>
              <Descriptions.Item label="类型">{viewing.type}</Descriptions.Item>
              <Descriptions.Item label="楼栋/楼层/房间">{viewing.building}/{viewing.floor}层/{viewing.roomNumber}</Descriptions.Item>
              <Descriptions.Item label="容量/已入住">{viewing.capacity}/{viewing.currentOccupancy}</Descriptions.Item>
              <Descriptions.Item label="月租">¥{viewing.monthlyRent}</Descriptions.Item>
              <Descriptions.Item label="面积">{viewing.area || '-'}㎡</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={STATUS_COLORS[viewing.status]}>{STATUS_LABELS[viewing.status]}</Tag></Descriptions.Item>
              <Descriptions.Item label="设施">{viewing.facilities || '-'}</Descriptions.Item>
            </Descriptions>
            <Divider>床位情况</Divider>
            <Table rowKey="id" columns={bedColumns} dataSource={dormBeds} pagination={false} size="small" />
          </div>
        )}
      </Drawer>

      {/* 床位管理弹窗 */}
      <Modal title={selectedDorm ? `床位管理 - ${selectedDorm.name}` : '床位管理'} open={bedModalOpen} onCancel={() => setBedModalOpen(false)} footer={null} width={700}>
        {selectedDorm && (
          <Table rowKey="id" columns={bedColumns} dataSource={dormBeds} pagination={false} />
        )}
      </Modal>

      {/* 添加账单弹窗 */}
      <Modal title="添加水电费账单" open={billModalOpen} onOk={handleBillSubmit} onCancel={() => setBillModalOpen(false)} width={500}>
        <Form form={billForm} layout="vertical">
          <Form.Item name="dormitoryId" label="宿舍" rules={[{ required: true }]}>
            <Select placeholder="选择宿舍">{data.map(d => <Option key={d.id} value={d.id}>{d.name}</Option>)}</Select>
          </Form.Item>
          <Form.Item name="month" label="月份" rules={[{ required: true }]}>
            <Input placeholder="2026-01" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="waterUsage" label="用水量(吨)" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="waterFee" label="水费(元)" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="electricityUsage" label="用电量(度)" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="electricityFee" label="电费(元)" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 分摊确认弹窗 */}
      <Modal title="确认水电费分摊" open={distributeModalOpen} onOk={handleDistributeSubmit} onCancel={() => setDistributeModalOpen(false)}>
        {selectedBill && (
          <div className="space-y-4">
            <Alert message={`将为 "${selectedBill.dormitoryName}" 的入住人员分摊水电费`} type="info" showIcon />
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="月份">{selectedBill.month}</Descriptions.Item>
              <Descriptions.Item label="水费">¥{selectedBill.waterFee} ({selectedBill.waterUsage}吨)</Descriptions.Item>
              <Descriptions.Item label="电费">¥{selectedBill.electricityFee} ({selectedBill.electricityUsage}度)</Descriptions.Item>
              <Descriptions.Item label="入住人数">{occupancy.filter(o => o.dormitoryId === selectedBill.dormitoryId && o.status === 'checked_in').length}人</Descriptions.Item>
            </Descriptions>
            <Alert message={`分摊后：每人水费约 ¥{selectedBill.waterFee / Math.max(occupancy.filter(o => o.dormitoryId === selectedBill.dormitoryId && o.status === 'checked_in').length, 1)}，电费约 ¥${(selectedBill.electricityFee / Math.max(occupancy.filter(o => o.dormitoryId === selectedBill.dormitoryId && o.status === 'checked_in').length, 1)).toFixed(2)}`} type="warning" showIcon />
          </div>
        )}
      </Modal>

      {/* 批量导入弹窗 */}
      <Modal title="批量导入入住信息" open={batchModalOpen} onCancel={() => setBatchModalOpen(false)} footer={null} width={500}>
        <Dragger accept=".xlsx,.xls,.csv" customRequest={handleBatchImport} showUploadList={false}>
          <p className="ant-upload-drag-icon"><InboxOutlined /></p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">支持 Excel 或 CSV 格式，文件应包含：宿舍、姓名、工号、入住日期、床位号</p>
        </Dragger>
        <Button type="link" icon={<DownloadOutlined />} className="mt-4">下载导入模板</Button>
      </Modal>
    </div>
  );
}
