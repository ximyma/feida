import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, InputNumber,
  Tag, Space, Popconfirm, message, Tabs, Statistic,
  Row, Col, Divider, Alert, Descriptions, Checkbox
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined,
  SafetyCertificateOutlined, TeamOutlined, BankOutlined,
  SyncOutlined, CheckCircleOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;
const { Text } = { Text: (props: any) => <span {...props} /> };

// ============ 与 DB 表字段完全对应 ============
interface InsuranceScheme {
  id: string;
  name: string;
  city: string;
  pensionRate: number;
  medicalRate: number;
  unemploymentRate: number;
  injuryRate: number;
  maternityRate: number;
  housingRateCompany: number;
  housingRatePersonal: number;
  baseMin: number;
  baseMax: number;
  isActive: number;
  remark?: string;
}

interface InsuredEmployee {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  idCard?: string;
  schemeId: string;
  schemeName: string;
  baseAmount: number;
  pensionBase: number;
  medicalBase: number;
  housingBase: number;
  startDate: string;
  endDate?: string;
  status: 'insured' | 'suspended' | 'cancelled';
  personalPension: number;
  personalMedical: number;
  personalUnemployment: number;
  personalInjury: number;
  personalMaternity: number;
  personalHousing: number;
  companyPension: number;
  companyMedical: number;
  companyUnemployment: number;
  companyInjury: number;
  companyMaternity: number;
  companyHousing: number;
  remark?: string;
}

interface ChangeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  changeType: 'add' | 'reduce';
  changeReason: string;
  schemeId: string;
  schemeName: string;
  baseAmount: number;
  effectiveDate: string;
  handledBy?: string;
  handledAt?: string;
  status: 'pending' | 'approved' | 'rejected';
  remark?: string;
}

interface LedgerEntry {
  id: string;
  month: string;
  department: string;
  employeeCount: number;
  pensionTotal: number;
  medicalTotal: number;
  unemploymentTotal: number;
  injuryTotal: number;
  maternityTotal: number;
  housingTotal: number;
  totalPersonal: number;
  totalCompany: number;
  grandTotal: number;
}

const statusMap: Record<string, { label: string; color: string }> = {
  insured: { label: '参保中', color: 'green' },
  suspended: { label: '已暂停', color: 'orange' },
  cancelled: { label: '已停保', color: 'red' },
};

const changeTypeMap: Record<string, { label: string; color: string }> = {
  add: { label: '增员', color: 'blue' },
  reduce: { label: '减员', color: 'red' },
};

const changeReasonOptions = [
  '新入职参保', '转正参保', '实习转正', '跨部门调动',
  '离职减员', '退休减员', '试用期内离职', '停薪留职', '其他'
];

const changeStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'orange' },
  approved: { label: '已办理', color: 'green' },
  rejected: { label: '已驳回', color: 'red' },
};

const fmt = (n: number) => (n || 0).toLocaleString('zh-CN', { maximumFractionDigits: 0 });

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState('scheme');
  const [schemes, setSchemes] = useState<InsuranceScheme[]>([]);
  const [insuredList, setInsuredList] = useState<InsuredEmployee[]>([]);
  const [changeList, setChangeList] = useState<ChangeRecord[]>([]);
  const [ledgerList, setLedgerList] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const [schemeModal, setSchemeModal] = useState(false);
  const [insuredModal, setInsuredModal] = useState(false);
  const [changeModal, setChangeModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<InsuredEmployee | null>(null);
  const [editingScheme, setEditingScheme] = useState<InsuranceScheme | null>(null);
  const [editingInsured, setEditingInsured] = useState<InsuredEmployee | null>(null);
  const [changeType, setChangeType] = useState<'add' | 'reduce'>('add');

  const [searchText, setSearchText] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [changeFilterType, setChangeFilterType] = useState('');
  const [changeFilterStatus, setChangeFilterStatus] = useState('');

  const [form] = Form.useForm();
  const [insuredForm] = Form.useForm();
  const [changeForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // ===== 数据加载 =====
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, i, c, l] = await Promise.all([
        fetch('/api/insurance_schemes').then(r => r.json()).catch(() => []),
        fetch('/api/insured_employees').then(r => r.json()).catch(() => []),
        fetch('/api/insurance_changes').then(r => r.json()).catch(() => []),
        fetch('/api/insurance_ledger').then(r => r.json()).catch(() => []),
      ]);
      setSchemes(Array.isArray(s) ? s : []);
      setInsuredList(Array.isArray(i) ? i : []);
      setChangeList(Array.isArray(c) ? c : []);
      setLedgerList(Array.isArray(l) ? l : []);
    } catch {
      messageApi.error('加载保险数据失败');
    }
    setLoading(false);
  }, [messageApi]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ===== 统计 =====
  const stats = {
    schemeCount: schemes.filter(s => s.isActive).length,
    insuredCount: insuredList.filter(e => e.status === 'insured').length,
    suspendedCount: insuredList.filter(e => e.status === 'suspended').length,
    pendingChanges: changeList.filter(c => c.status === 'pending').length,
    monthTotal: ledgerList.length > 0 ? ledgerList[ledgerList.length - 1].grandTotal : 0,
  };

  // ===== 方案管理 =====
  const openSchemeModal = (scheme?: InsuranceScheme) => {
    setEditingScheme(scheme || null);
    if (scheme) {
      form.setFieldsValue({ ...scheme, isActive: scheme.isActive === 1 });
    } else {
      form.resetFields();
      form.setFieldsValue({ pensionRate: 8, medicalRate: 2, unemploymentRate: 0.5, injuryRate: 0.26, maternityRate: 0.8, housingRateCompany: 7, housingRatePersonal: 7, baseMin: 5975, baseMax: 31014, isActive: true });
    }
    setSchemeModal(true);
  };

  const saveScheme = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        isActive: values.isActive ? 1 : 0,
        id: editingScheme?.id || `sch_${Date.now()}`,
      };
      const url = editingScheme ? `/api/insurance_schemes/${editingScheme.id}` : '/api/insurance_schemes';
      const method = editingScheme ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok || res.status === 200) {
        messageApi.success(editingScheme ? '方案已更新' : '方案已创建');
        setSchemeModal(false);
        loadAll();
      } else {
        const e = await res.json();
        messageApi.error('保存失败: ' + (e.error || ''));
      }
    } catch {}
  };

  const deleteScheme = async (id: string) => {
    await fetch(`/api/insurance_schemes/${id}`, { method: 'DELETE' });
    messageApi.success('方案已删除');
    loadAll();
  };

  // ===== 参保人员 =====
  const openInsuredModal = (emp?: InsuredEmployee) => {
    setEditingInsured(emp || null);
    if (emp) {
      insuredForm.setFieldsValue(emp);
    } else {
      insuredForm.resetFields();
      insuredForm.setFieldsValue({ startDate: new Date().toISOString().slice(0, 10), baseAmount: 10000 });
    }
    setInsuredModal(true);
  };

  const saveInsured = async () => {
    try {
      const values = await insuredForm.validateFields();
      const scheme = schemes.find(s => s.id === values.schemeId);
      if (!scheme) { messageApi.error('请先选择参保方案'); return; }

      const base = Number(values.baseAmount) || 10000;
      const t2 = (v: number) => +(v).toFixed(2);

      const payload = {
        id: editingInsured?.id || `ie_${Date.now()}`,
        employeeId: values.employeeId,
        employeeName: values.employeeName,
        department: values.department || '',
        idCard: values.idCard || '',
        schemeId: values.schemeId,
        schemeName: scheme.name,
        baseAmount: base,
        pensionBase: Number(values.pensionBase) || base,
        medicalBase: Number(values.medicalBase) || base,
        housingBase: Number(values.housingBase) || base,
        startDate: values.startDate,
        endDate: values.endDate || '',
        personalPension: t2(base * scheme.pensionRate / 100),
        personalMedical: t2(base * scheme.medicalRate / 100),
        personalUnemployment: t2(base * scheme.unemploymentRate / 100),
        personalInjury: 0,
        personalMaternity: 0,
        personalHousing: t2(base * scheme.housingRatePersonal / 100),
        companyPension: t2(base * scheme.pensionRate / 100),
        companyMedical: t2(base * scheme.medicalRate / 100),
        companyUnemployment: t2(base * scheme.unemploymentRate / 100),
        companyInjury: t2(base * scheme.injuryRate / 100),
        companyMaternity: t2(base * scheme.maternityRate / 100),
        companyHousing: t2(base * scheme.housingRateCompany / 100),
        status: 'insured',
        remark: values.remark || '',
      };

      const url = editingInsured ? `/api/insured_employees/${editingInsured.id}` : '/api/insured_employees';
      const method = editingInsured ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok || res.status === 200) {
        messageApi.success(editingInsured ? '参保信息已更新' : '参保登记成功');
        setInsuredModal(false);
        loadAll();
      } else {
        const e = await res.json();
        messageApi.error('保存失败: ' + (e.error || ''));
      }
    } catch {}
  };

  const handleSuspend = async (emp: InsuredEmployee) => {
    const res = await fetch(`/api/insured_employees/${emp.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'suspended', endDate: new Date().toISOString().slice(0, 10) }),
    });
    if (res.ok) { messageApi.success(`已暂停 ${emp.employeeName} 的社保`); loadAll(); }
    else { const e = await res.json(); messageApi.error('操作失败: ' + (e.error || '')); }
  };

  const handleCancel = (emp: InsuredEmployee) => {
    confirm({
      title: '确认停保', icon: <ExclamationCircleOutlined />,
      content: `确定要为 ${emp.employeeName} 办理停保吗？`,
      onOk: async () => {
        const res = await fetch(`/api/insured_employees/${emp.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled', endDate: new Date().toISOString().slice(0, 10) }),
        });
        if (res.ok) { messageApi.success(`已办理 ${emp.employeeName} 停保`); loadAll(); }
        else { const e = await res.json(); messageApi.error('操作失败: ' + (e.error || '')); }
      },
    });
  };

  // ===== 增减员 =====
  const openChangeModal = (type: 'add' | 'reduce') => {
    setChangeType(type);
    changeForm.resetFields();
    changeForm.setFieldsValue({
      changeType: type,
      handledBy: '系统管理员',
      effectiveDate: new Date().toISOString().slice(0, 10),
    });
    setChangeModal(true);
  };

  const saveChange = async () => {
    try {
      const values = await changeForm.validateFields();
      const scheme = schemes.find(s => s.id === values.schemeId);
      const payload = {
        id: `ic_${Date.now()}`,
        employeeId: values.employeeId,
        employeeName: values.employeeName,
        department: values.department || '',
        changeType: values.changeType,
        changeReason: values.changeReason,
        schemeId: values.schemeId,
        schemeName: scheme?.name || '',
        baseAmount: Number(values.baseAmount) || 0,
        effectiveDate: values.effectiveDate,
        handledBy: values.handledBy || '系统管理员',
        handledAt: new Date().toISOString().slice(0, 10),
        status: 'pending',
        remark: values.remark || '',
      };
      const res = await fetch('/api/insurance_changes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok || res.status === 200) {
        messageApi.success('增减员申请已提交');
        setChangeModal(false);
        loadAll();
      } else {
        const e = await res.json();
        messageApi.error('提交失败: ' + (e.error || ''));
      }
    } catch {}
  };

  const approveChange = async (record: ChangeRecord) => {
    const res = await fetch(`/api/insurance_changes/${record.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    if (res.ok) { messageApi.success('增减员申请已批准'); loadAll(); }
    else { const e = await res.json(); messageApi.error('操作失败: ' + (e.error || '')); }
  };

  const rejectChange = async (id: string) => {
    const res = await fetch(`/api/insurance_changes/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    });
    if (res.ok) { messageApi.info('已驳回该申请'); loadAll(); }
    else { const e = await res.json(); messageApi.error('操作失败: ' + (e.error || '')); }
  };

  // ===== 导出 =====
  const exportLedger = () => {
    const csv = ['月份,部门,人数,个人合计,单位合计,养老,医疗,失业,工伤,生育,公积金,总金额',
      ...ledgerList.map(r => `${r.month},${r.department},${r.employeeCount},${r.totalPersonal},${r.totalCompany},${r.pensionTotal},${r.medicalTotal},${r.unemploymentTotal},${r.injuryTotal},${r.maternityTotal},${r.housingTotal},${r.grandTotal}`)
    ].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `社保公积金台账_${new Date().toISOString().slice(0, 7)}.csv`; a.click();
    messageApi.success('台账已导出');
  };

  const exportChanges = () => {
    const filtered = changeList.filter(c =>
      (!changeFilterType || c.changeType === changeFilterType) &&
      (!changeFilterStatus || c.status === changeFilterStatus)
    );
    const csv = ['姓名,工号,部门,类型,原因,方案,基数,生效日期,办理人,办理日期,状态',
      ...filtered.map(c => `${c.employeeName},${c.employeeId},${c.department},${c.changeType==='add'?'增员':'减员'},${c.changeReason},${c.schemeName},${c.baseAmount},${c.effectiveDate},${c.handledBy||''},${c.handledAt||''},${changeStatusMap[c.status]?.label}`)
    ].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `增减员明细_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    messageApi.success('增减员明细已导出');
  };

  // ===== 筛选 =====
  const filteredInsured = insuredList.filter(e => {
    if (!searchText) return true;
    const t = searchText.toLowerCase();
    return (e.employeeName || '').toLowerCase().includes(t) ||
      (e.employeeId || '').toLowerCase().includes(t) ||
      (e.department || '').toLowerCase().includes(t);
  });

  const filteredChanges = changeList.filter(c => {
    if (changeFilterType && c.changeType !== changeFilterType) return false;
    if (changeFilterStatus && c.status !== changeFilterStatus) return false;
    return true;
  });

  const filteredSchemes = schemes.filter(s =>
    (!cityFilter || s.city === cityFilter) &&
    (!searchText || s.name.includes(searchText))
  );

  // ===== 列定义 =====
  const schemeColumns = [
    { title: '方案名称', dataIndex: 'name', key: 'name', width: 200 },
    { title: '城市', dataIndex: 'city', key: 'city', width: 100 },
    { title: '养老(个人)', dataIndex: 'pensionRate', key: 'p', width: 100, render: (v: number) => `${v}%` },
    { title: '医疗(个人)', dataIndex: 'medicalRate', key: 'm', width: 100, render: (v: number) => `${v}%` },
    { title: '公积金个人/公司', key: 'housing', width: 150, render: (_: any, r: InsuranceScheme) => `${r.housingRatePersonal}% / ${r.housingRateCompany}%` },
    { title: '基数范围', key: 'base', width: 180, render: (_: any, r: InsuranceScheme) => `${r.baseMin?.toLocaleString()} ~ ${r.baseMax?.toLocaleString()}` },
    { title: '状态', dataIndex: 'isActive', key: 'isActive', width: 80, render: (v: number) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
    { title: '操作', key: 'action', width: 130, render: (_: any, r: InsuranceScheme) => (
      <Space size="small">
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openSchemeModal(r)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => deleteScheme(r.id)}>
          <Button size="small" danger type="link" icon={<DeleteOutlined />} />
        </Popconfirm>
      </Space>
    )},
  ];

  const insuredColumns = [
    { title: '姓名', dataIndex: 'employeeName', key: 'name', width: 90 },
    { title: '工号', dataIndex: 'employeeId', key: 'id', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'dept', width: 110 },
    { title: '参保方案', dataIndex: 'schemeName', key: 'scheme', width: 180 },
    { title: '基数', dataIndex: 'baseAmount', key: 'base', width: 90, render: (v: number) => `¥${fmt(v)}` },
    { title: '个人合计', key: 'personal', width: 95, render: (_: any, r: InsuredEmployee) => {
      const t = (r.personalPension||0)+(r.personalMedical||0)+(r.personalUnemployment||0)+(r.personalInjury||0)+(r.personalMaternity||0)+(r.personalHousing||0);
      return <Text strong>¥{t.toFixed(2)}</Text>;
    }},
    { title: '单位合计', key: 'company', width: 95, render: (_: any, r: InsuredEmployee) => {
      const t = (r.companyPension||0)+(r.companyMedical||0)+(r.companyUnemployment||0)+(r.companyInjury||0)+(r.companyMaternity||0)+(r.companyHousing||0);
      return <Text strong style={{color:'#1677ff'}}>¥{t.toFixed(2)}</Text>;
    }},
    { title: '参保日期', dataIndex: 'startDate', key: 'start', width: 110, render: (v: string) => v?.slice(0, 10) || '-' },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label || v}</Tag> },
    { title: '操作', key: 'action', width: 200, render: (_: any, r: InsuredEmployee) => (
      <Space size="small" wrap>
        <Button size="small" type="link" onClick={() => { setSelectedEmployee(r); setDetailModal(true); }}>详情</Button>
        <Button size="small" type="link" icon={<EditOutlined />} onClick={() => openInsuredModal(r)} />
        {r.status === 'insured' && <Button size="small" type="link" onClick={() => handleSuspend(r)}>暂停</Button>}
        {(r.status === 'insured' || r.status === 'suspended') && (
          <Button size="small" danger type="link" onClick={() => handleCancel(r)}>停保</Button>
        )}
      </Space>
    )},
  ];

  const changeColumns = [
    { title: '姓名', dataIndex: 'employeeName', key: 'name', width: 90 },
    { title: '工号', dataIndex: 'employeeId', key: 'id', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'dept', width: 110 },
    { title: '类型', dataIndex: 'changeType', key: 'type', width: 70, render: (v: string) => <Tag color={changeTypeMap[v]?.color}>{changeTypeMap[v]?.label}</Tag> },
    { title: '变更原因', dataIndex: 'changeReason', key: 'reason', width: 130 },
    { title: '参保方案', dataIndex: 'schemeName', key: 'scheme', width: 180 },
    { title: '基数', dataIndex: 'baseAmount', key: 'base', width: 90, render: (v: number) => `¥${fmt(v)}` },
    { title: '生效日期', dataIndex: 'effectiveDate', key: 'date', width: 110 },
    { title: '办理人', dataIndex: 'handledBy', key: 'handler', width: 100 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={changeStatusMap[v]?.color}>{changeStatusMap[v]?.label}</Tag> },
    { title: '操作', key: 'action', width: 130, render: (_: any, r: ChangeRecord) => (
      r.status === 'pending' ? (
        <Space size="small">
          <Button size="small" type="link" style={{color:'#52c41a'}} icon={<CheckCircleOutlined />} onClick={() => approveChange(r)}>批准</Button>
          <Button size="small" danger type="link" onClick={() => rejectChange(r.id)}>驳回</Button>
        </Space>
      ) : <Text type="secondary" style={{fontSize:12}}>已处理</Text>
    )},
  ];

  const ledgerColumns = [
    { title: '月份', dataIndex: 'month', key: 'month', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'dept', width: 130 },
    { title: '人数', dataIndex: 'employeeCount', key: 'cnt', width: 70 },
    { title: '个人合计', dataIndex: 'totalPersonal', key: 'per', width: 110, render: (v: number) => `¥${fmt(v)}` },
    { title: '单位合计', dataIndex: 'totalCompany', key: 'com', width: 110, render: (v: number) => <Text style={{color:'#fa8c16'}}>¥{fmt(v)}</Text> },
    { title: '养老', dataIndex: 'pensionTotal', key: 'pen', width: 100, render: (v: number) => <Text type="secondary">¥{fmt(v)}</Text> },
    { title: '医疗', dataIndex: 'medicalTotal', key: 'med', width: 100, render: (v: number) => <Text type="secondary">¥{fmt(v)}</Text> },
    { title: '失业', dataIndex: 'unemploymentTotal', key: 'unemp', width: 90, render: (v: number) => <Text type="secondary">¥{fmt(v)}</Text> },
    { title: '工伤', dataIndex: 'injuryTotal', key: 'inj', width: 90, render: (v: number) => <Text type="secondary">¥{fmt(v)}</Text> },
    { title: '生育', dataIndex: 'maternityTotal', key: 'mater', width: 90, render: (v: number) => <Text type="secondary">¥{fmt(v)}</Text> },
    { title: '公积金', dataIndex: 'housingTotal', key: 'hous', width: 90, render: (v: number) => <Text type="secondary">¥{fmt(v)}</Text> },
    { title: '总金额', dataIndex: 'grandTotal', key: 'total', width: 110, render: (v: number) => <Text strong style={{color:'#cf1322'}}>¥{fmt(v)}</Text> },
  ];

  const cities = [...new Set(schemes.map(s => s.city).filter(Boolean))];

  const tabs = [
    { key: 'scheme', label: '📋 社保公积金方案' },
    { key: 'insured', label: '👥 参保人员管理' },
    { key: 'changes', label: '🔄 增减员明细' },
    { key: 'ledger', label: '🏦 缴纳台账' },
    { key: 'analysis', label: '📊 数据分析' },
  ];

  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">🏥 保险福利管理</h2>
          <p className="text-sm text-muted-foreground mt-1">社保公积金方案配置 · 增减员管理 · 缴纳台账</p>
        </div>
      </div>

      <Row gutter={16}>
        <Col span={4}><Card size="small"><Statistic title="启用方案" value={stats.schemeCount} suffix="个" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="参保人数" value={stats.insuredCount} suffix="人" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="已暂停" value={stats.suspendedCount} suffix="人" valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="待处理" value={stats.pendingChanges} suffix="条" valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={8}><Card size="small"><Statistic title="最近月份社保公积金总额" value={stats.monthTotal} precision={0} prefix="¥" valueStyle={{ color: '#f5222d', fontSize: 20 }} /></Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs} />

        {/* 方案 */}
        {activeTab === 'scheme' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Space>
                <Input placeholder="搜索方案名称" prefix={<SearchOutlined />} allowClear style={{ width: 200 }} onChange={e => setSearchText(e.target.value)} />
                <Select placeholder="按城市筛选" allowClear style={{ width: 140 }} value={cityFilter || undefined} onChange={v => setCityFilter(v || '')}>
                  {cities.map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openSchemeModal()}>新建方案</Button>
            </div>
            <Table columns={schemeColumns} dataSource={filteredSchemes} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </div>
        )}

        {/* 参保人员 */}
        {activeTab === 'insured' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Space wrap>
                <Input placeholder="搜索姓名/工号/部门" prefix={<SearchOutlined />} allowClear style={{ width: 220 }} value={searchText} onChange={e => setSearchText(e.target.value)} />
                <Button onClick={() => openChangeModal('add')} icon={<PlusOutlined />} type="primary">增员</Button>
                <Button onClick={() => openChangeModal('reduce')} danger icon={<SyncOutlined />}>减员</Button>
              </Space>
              <Button icon={<PlusOutlined />} onClick={() => openInsuredModal()}>新增参保人</Button>
            </div>
            <Alert message="缴费说明：个人缴纳 = 基数 × 各险种比例；单位缴纳 = 基数 × 各险种公司比例。" type="info" showIcon style={{ marginBottom: 8 }} />
            <Table columns={insuredColumns} dataSource={filteredInsured} rowKey="id" loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }} size="small" scroll={{ x: 1400 }} />
          </div>
        )}

        {/* 增减员 */}
        {activeTab === 'changes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Space wrap>
                <Select placeholder="变更类型" allowClear style={{ width: 120 }} value={changeFilterType || undefined} onChange={v => setChangeFilterType(v || '')}>
                  <Option value="add">增员</Option> <Option value="reduce">减员</Option>
                </Select>
                <Select placeholder="处理状态" allowClear style={{ width: 120 }} value={changeFilterStatus || undefined} onChange={v => setChangeFilterStatus(v || '')}>
                  <Option value="pending">待处理</Option> <Option value="approved">已办理</Option> <Option value="rejected">已驳回</Option>
                </Select>
                <Button icon={<span>📥</span>} onClick={exportChanges}>导出明细</Button>
              </Space>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openChangeModal('add')}>新增增员</Button>
                <Button danger icon={<SyncOutlined />} onClick={() => openChangeModal('reduce')}>新增减员</Button>
              </Space>
            </div>
            <Table columns={changeColumns} dataSource={filteredChanges} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small" scroll={{ x: 1300 }} />
          </div>
        )}

        {/* 台账 */}
        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text type="secondary">每月自动汇总各单位社保公积金缴纳明细</Text>
              <Button icon={<span>📥</span>} onClick={exportLedger}>导出台账</Button>
            </div>
            <Table columns={ledgerColumns} dataSource={ledgerList} rowKey="id" loading={loading} pagination={{ pageSize: 6 }} size="small" scroll={{ x: 1300 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}><Text strong>合计</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}><Text strong>{ledgerList.reduce((s, r) => s + r.employeeCount, 0)}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}><Text strong>¥{fmt(ledgerList.reduce((s, r) => s + r.totalPersonal, 0))}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}><Text strong style={{color:'#fa8c16'}}>¥{fmt(ledgerList.reduce((s, r) => s + r.totalCompany, 0))}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={4}><Text strong>¥{fmt(ledgerList.reduce((s, r) => s + r.pensionTotal, 0))}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={5}><Text strong>¥{fmt(ledgerList.reduce((s, r) => s + r.medicalTotal, 0))}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={6}><Text strong>¥{fmt(ledgerList.reduce((s, r) => s + r.unemploymentTotal, 0))}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={7}><Text strong>¥{fmt(ledgerList.reduce((s, r) => s + r.injuryTotal, 0))}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={8}><Text strong>¥{fmt(ledgerList.reduce((s, r) => s + r.maternityTotal, 0))}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={9}><Text strong>¥{fmt(ledgerList.reduce((s, r) => s + r.housingTotal, 0))}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={10}><Text strong style={{color:'#cf1322'}}>¥{fmt(ledgerList.reduce((s, r) => s + r.grandTotal, 0))}</Text></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </div>
        )}

        {/* 分析 */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="参保状态分布" size="small">
                  {(() => {
                    const counts = { insured: insuredList.filter(e => e.status === 'insured').length, suspended: insuredList.filter(e => e.status === 'suspended').length, cancelled: insuredList.filter(e => e.status === 'cancelled').length };
                    const total = insuredList.length || 1;
                    const items = [
                      { name: '参保中', value: counts.insured, color: '#52c41a' },
                      { name: '已暂停', value: counts.suspended, color: '#faad14' },
                      { name: '已停保', value: counts.cancelled, color: '#f5222d' },
                    ];
                    return (
                      <div className="space-y-3">
                        {items.map(item => (
                          <div key={item.name} className="flex items-center gap-3">
                            <Text style={{ width: 80 }}>{item.name}</Text>
                            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${(item.value / total * 100).toFixed(1)}%`, backgroundColor: item.color }} />
                            </div>
                            <Text style={{ width: 40, textAlign: 'right' }}>{item.value}</Text>
                            <Text type="secondary" style={{ width: 50 }}>人</Text>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="各方案参保人数" size="small">
                  {(() => {
                    const schemeCounts = schemes.map(s => ({ name: s.name, count: insuredList.filter(e => e.schemeId === s.id).length }));
                    const maxCount = Math.max(...schemeCounts.map(s => s.count), 1);
                    return (
                      <div className="space-y-3">
                        {schemeCounts.map(item => (
                          <div key={item.name} className="flex items-center gap-3">
                            <Text style={{ width: 120 }} ellipsis>{item.name}</Text>
                            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                              <div className="h-full rounded-full bg-blue-500" style={{ width: `${(item.count / maxCount * 100).toFixed(1)}%` }} />
                            </div>
                            <Text style={{ width: 40, textAlign: 'right' }}>{item.count}</Text>
                            <Text type="secondary">人</Text>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* 方案弹窗 */}
      <Modal title={editingScheme ? '编辑社保公积金方案' : '新建社保公积金方案'} open={schemeModal} onOk={saveScheme} onCancel={() => setSchemeModal(false)} width={680} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="方案名称" rules={[{ required: true }]}><Input placeholder="如：上海市标准社保方案" /></Form.Item></Col>
            <Col span={12}><Form.Item name="city" label="适用城市" rules={[{ required: true }]}><Input placeholder="如：上海市" /></Form.Item></Col>
          </Row>
          <Divider orientation="left">个人缴纳比例（%）</Divider>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="pensionRate" label="养老保险"><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
            <Col span={8}><Form.Item name="medicalRate" label="医疗保险"><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
            <Col span={8}><Form.Item name="unemploymentRate" label="失业保险"><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
          </Row>
          <Divider orientation="left">公积金比例（%）</Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="housingRatePersonal" label="公积金（个人）"><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
            <Col span={12}><Form.Item name="housingRateCompany" label="公积金（公司）"><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
          </Row>
          <Divider orientation="left">基数范围</Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="baseMin" label="基数下限"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="baseMax" label="基数上限"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="可选备注信息" /></Form.Item></Col>
            <Col span={12}><Form.Item name="isActive" label="状态" valuePropName="checked"><Checkbox>启用此方案</Checkbox></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* 参保人员弹窗 */}
      <Modal title={editingInsured ? '编辑参保信息' : '新增参保人员'} open={insuredModal} onOk={saveInsured} onCancel={() => setInsuredModal(false)} width={560} okText="保存" cancelText="取消">
        <Form form={insuredForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="employeeId" label="工号" rules={[{ required: true }]}><Input placeholder="如：EMP1001" /></Form.Item></Col>
            <Col span={12}><Form.Item name="employeeName" label="姓名" rules={[{ required: true }]}><Input placeholder="员工姓名" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="department" label="部门"><Input placeholder="所属部门" /></Form.Item></Col>
            <Col span={12}><Form.Item name="idCard" label="身份证号"><Input placeholder="18位身份证号" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="schemeId" label="参保方案" rules={[{ required: true }]}><Select placeholder="选择参保方案">{schemes.filter(s => s.isActive).map(s => <Option key={s.id} value={s.id}>{s.name}（{s.city}）</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="baseAmount" label="缴费基数" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="startDate" label="参保日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* 增减员弹窗 */}
      <Modal title={changeType === 'reduce' ? '新增减员' : '新增增员'} open={changeModal} onOk={saveChange} onCancel={() => setChangeModal(false)} width={560} okText="提交" cancelText="取消">
        <Form form={changeForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="changeType" label="变更类型"><Select disabled><Option value="add">增员</Option><Option value="reduce">减员</Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item name="changeReason" label="变更原因" rules={[{ required: true }]}><Select placeholder="选择变更原因">{changeReasonOptions.map(r => <Option key={r} value={r}>{r}</Option>)}</Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="employeeId" label="工号" rules={[{ required: true }]}><Input placeholder="员工工号" /></Form.Item></Col>
            <Col span={12}><Form.Item name="employeeName" label="姓名" rules={[{ required: true }]}><Input placeholder="员工姓名" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="department" label="部门"><Input placeholder="所属部门" /></Form.Item></Col>
            <Col span={12}><Form.Item name="schemeId" label="参保方案" rules={[{ required: true }]}><Select placeholder="选择参保方案">{schemes.filter(s => s.isActive).map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="baseAmount" label="缴费基数"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal title={selectedEmployee ? `参保详情 - ${selectedEmployee.employeeName}` : ''} open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={680}>
        {selectedEmployee && (
          <div className="space-y-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="工号">{selectedEmployee.employeeId}</Descriptions.Item>
              <Descriptions.Item label="部门">{selectedEmployee.department}</Descriptions.Item>
              <Descriptions.Item label="参保方案">{selectedEmployee.schemeName}</Descriptions.Item>
              <Descriptions.Item label="缴费基数">¥{fmt(selectedEmployee.baseAmount)}</Descriptions.Item>
              <Descriptions.Item label="参保日期">{selectedEmployee.startDate?.slice(0, 10)}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusMap[selectedEmployee.status]?.color}>{statusMap[selectedEmployee.status]?.label}</Tag></Descriptions.Item>
            </Descriptions>
            <Divider>缴纳明细（月度）</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="个人缴纳" size="small">
                  <div className="space-y-2">
                    {[{ label: '养老保险', v: selectedEmployee.personalPension }, { label: '医疗保险', v: selectedEmployee.personalMedical }, { label: '失业保险', v: selectedEmployee.personalUnemployment }, { label: '工伤保险', v: selectedEmployee.personalInjury }, { label: '生育保险', v: selectedEmployee.personalMaternity }, { label: '住房公积金', v: selectedEmployee.personalHousing }].map(item => (
                      <div key={item.label} className="flex justify-between text-sm"><Text type="secondary">{item.label}</Text><Text>¥{(item.v || 0).toFixed(2)}</Text></div>
                    ))}
                    <Divider style={{ margin: '8px 0' }} />
                    <div className="flex justify-between font-medium"><Text strong>个人合计</Text><Text strong style={{color:'#cf1322'}}>¥{((selectedEmployee.personalPension||0)+(selectedEmployee.personalMedical||0)+(selectedEmployee.personalUnemployment||0)+(selectedEmployee.personalInjury||0)+(selectedEmployee.personalMaternity||0)+(selectedEmployee.personalHousing||0)).toFixed(2)}</Text></div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="单位缴纳" size="small">
                  <div className="space-y-2">
                    {[{ label: '养老保险', v: selectedEmployee.companyPension }, { label: '医疗保险', v: selectedEmployee.companyMedical }, { label: '失业保险', v: selectedEmployee.companyUnemployment }, { label: '工伤保险', v: selectedEmployee.companyInjury }, { label: '生育保险', v: selectedEmployee.companyMaternity }, { label: '住房公积金', v: selectedEmployee.companyHousing }].map(item => (
                      <div key={item.label} className="flex justify-between text-sm"><Text type="secondary">{item.label}</Text><Text style={{color:'#fa8c16'}}>¥{(item.v || 0).toFixed(2)}</Text></div>
                    ))}
                    <Divider style={{ margin: '8px 0' }} />
                    <div className="flex justify-between font-medium"><Text strong>单位合计</Text><Text strong style={{color:'#cf1322'}}>¥{((selectedEmployee.companyPension||0)+(selectedEmployee.companyMedical||0)+(selectedEmployee.companyUnemployment||0)+(selectedEmployee.companyInjury||0)+(selectedEmployee.companyMaternity||0)+(selectedEmployee.companyHousing||0)).toFixed(2)}</Text></div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
}
