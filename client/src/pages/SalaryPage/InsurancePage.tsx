import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  InputNumber, Tag, Space, Popconfirm, message, Tabs, Statistic,
  Row, Col, Divider, Upload, Checkbox, Descriptions, Alert, Typography
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined,
  DownloadOutlined, SearchOutlined, ExclamationCircleOutlined,
  SafetyCertificateOutlined, TeamOutlined, BankOutlined, FileTextOutlined,
  BarChartOutlined, SyncOutlined, CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

// ============ 类型定义 ============
interface InsuranceScheme {
  id: string;
  name: string;
  city: string;
  socialRatePersonal: number;
  socialRateCompany: number;
  housingRatePersonal: number;
  housingRateCompany: number;
  pensionRate: number;
  medicalRate: number;
  unemploymentRate: number;
  injuryRate: number;
  maternityRate: number;
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
  idCard: string;
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
  handledBy: string;
  handledAt: string;
  status: 'pending' | 'approved' | 'rejected';
  remark?: string;
}

interface LedgerEntry {
  id: string;
  month: string;
  department: string;
  employeeCount: number;
  totalPersonal: number;
  totalCompany: number;
  pensionTotal: number;
  medicalTotal: number;
  unemploymentTotal: number;
  injuryTotal: number;
  maternityTotal: number;
  housingTotal: number;
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
  '离职减员', '退休减员', '试用期内离职', '停薪留职',
  '住院生育', '其他'
];

const changeStatusMap: Record<string, { label: string; color: string }> = {
  pending: { label: '待处理', color: 'orange' },
  approved: { label: '已办理', color: 'green' },
  rejected: { label: '已驳回', color: 'red' },
};

// ============ 模拟数据 ============
const generateMockSchemes = (): InsuranceScheme[] => [
  { id: '1', name: '上海市标准社保方案', city: '上海市', socialRatePersonal: 10.5, socialRateCompany: 26.0, housingRatePersonal: 7.0, housingRateCompany: 7.0, pensionRate: 16, medicalRate: 10, unemploymentRate: 0.5, injuryRate: 0.5, maternityRate: 0.8, baseMin: 5975, baseMax: 31014, isActive: 1, remark: '上海市城镇职工社保标准' },
  { id: '2', name: '深圳市标准社保方案', city: '深圳市', socialRatePersonal: 9.64, socialRateCompany: 21.36, housingRatePersonal: 5.0, housingRateCompany: 5.0, pensionRate: 14, medicalRate: 5.5, unemploymentRate: 0.5, injuryRate: 0.56, maternityRate: 0.0, baseMin: 2360, baseMax: 26421, isActive: 1, remark: '深圳市五险一金标准' },
  { id: '3', name: '广州市标准社保方案', city: '广州市', socialRatePersonal: 9.45, socialRateCompany: 23.85, housingRatePersonal: 8.0, housingRateCompany: 8.0, pensionRate: 14, medicalRate: 5.5, unemploymentRate: 0.2, injuryRate: 0.2, maternityRate: 0.85, baseMin: 2300, baseMax: 26421, isActive: 0, remark: '广州市城镇职工社保标准' },
];

const generateMockInsured = (): InsuredEmployee[] => {
  const names = ['张伟', '李娜', '王芳', '刘洋', '陈明', '杨丽', '赵强', '黄敏', '周杰', '吴婷', '徐磊', '孙燕', '马超', '朱琳', '胡鹏', '郭倩', '林峰', '何雪', '高建', '罗颖'];
  const depts = ['研发部', '市场部', '财务部', '人力资源部', '行政部', '产品部'];
  const schemes = generateMockSchemes();
  const statuses: InsuredEmployee['status'][] = ['insured', 'insured', 'insured', 'suspended', 'cancelled'];
  return names.map((name, i) => {
    const scheme = schemes[i % 3];
    const base = 8000 + Math.floor(Math.random() * 15000);
    const companyRates = { pension: scheme.pensionRate, medical: scheme.medicalRate, unemployment: scheme.unemploymentRate, injury: scheme.injuryRate, maternity: scheme.maternityRate, housing: scheme.housingRateCompany };
    const personalRates = { pension: scheme.pensionRate, medical: scheme.medicalRate, unemployment: scheme.unemploymentRate, injury: 0, maternity: 0, housing: scheme.housingRatePersonal };
    const toFixed2 = (v: number) => +(v).toFixed(2);
    return {
      id: String(i + 1), employeeId: `EMP${String(1001 + i).padStart(4, '0')}`, employeeName: name,
      department: depts[i % depts.length], idCard: `310101199${String(80 + i % 20)}XXXX${String(1000 + i).padStart(4, '0')}`,
      schemeId: scheme.id, schemeName: scheme.name, baseAmount: base, pensionBase: base, medicalBase: base, housingBase: base,
      startDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().slice(0, 10),
      status: statuses[i % statuses.length],
      personalPension: toFixed2(base * personalRates.pension / 100), personalMedical: toFixed2(base * personalRates.medical / 100),
      personalUnemployment: toFixed2(base * personalRates.unemployment / 100), personalInjury: 0, personalMaternity: 0,
      personalHousing: toFixed2(base * personalRates.housing / 100),
      companyPension: toFixed2(base * companyRates.pension / 100), companyMedical: toFixed2(base * companyRates.medical / 100),
      companyUnemployment: toFixed2(base * companyRates.unemployment / 100), companyInjury: toFixed2(base * companyRates.injury / 100),
      companyMaternity: toFixed2(base * companyRates.maternity / 100), companyHousing: toFixed2(base * companyRates.housing / 100),
    };
  });
};

const generateMockLedger = (): LedgerEntry[] => {
  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];
  return months.map((month, mi) => {
    const count = 35 + Math.floor(Math.random() * 20);
    const pension = Math.round(count * 8000 * 0.16);
    const medical = Math.round(count * 8000 * 0.10);
    const unemployment = Math.round(count * 8000 * 0.005);
    const injury = Math.round(count * 8000 * 0.005);
    const maternity = Math.round(count * 8000 * 0.008);
    const housing = Math.round(count * 8000 * 0.12);
    const total = pension + medical + unemployment + injury + maternity + housing;
    return { id: String(mi + 1), month, department: '全公司汇总', employeeCount: count, totalPersonal: Math.round(total * 0.4), totalCompany: Math.round(total * 0.6), pensionTotal: pension, medicalTotal: medical, unemploymentTotal: unemployment, injuryTotal: injury, maternityTotal: maternity, housingTotal: housing, grandTotal: total };
  });
};

const generateMockChanges = (): ChangeRecord[] => [
  { id: '1', employeeId: 'EMP1012', employeeName: '周新', department: '研发部', changeType: 'add', changeReason: '新入职参保', schemeId: '1', schemeName: '上海市标准社保方案', baseAmount: 12000, effectiveDate: '2025-01-15', handledBy: '李婷', handledAt: '2025-01-14', status: 'approved' },
  { id: '2', employeeId: 'EMP1013', employeeName: '吴晓', department: '市场部', changeType: 'add', changeReason: '转正参保', schemeId: '1', schemeName: '上海市标准社保方案', baseAmount: 10000, effectiveDate: '2025-02-01', handledBy: '李婷', handledAt: '2025-01-30', status: 'approved' },
  { id: '3', employeeId: 'EMP1001', employeeName: '张伟', department: '研发部', changeType: 'reduce', changeReason: '离职减员', schemeId: '1', schemeName: '上海市标准社保方案', baseAmount: 15000, effectiveDate: '2025-03-01', handledBy: '李婷', handledAt: '2025-02-28', status: 'pending' },
  { id: '4', employeeId: 'EMP1014', employeeName: '孙静', department: '财务部', changeType: 'add', changeReason: '新入职参保', schemeId: '2', schemeName: '深圳市标准社保方案', baseAmount: 11000, effectiveDate: '2025-03-15', handledBy: '王芳', handledAt: '2025-03-12', status: 'approved' },
  { id: '5', employeeId: 'EMP1015', employeeName: '刘强', department: '行政部', changeType: 'reduce', changeReason: '退休减员', schemeId: '1', schemeName: '上海市标准社保方案', baseAmount: 20000, effectiveDate: '2025-02-15', handledBy: '李婷', handledAt: '2025-02-14', status: 'approved' },
  { id: '6', employeeId: 'EMP1016', employeeName: '王磊', department: '产品部', changeType: 'add', changeReason: '跨部门调动', schemeId: '1', schemeName: '上海市标准社保方案', baseAmount: 9000, effectiveDate: '2025-03-20', handledBy: '王芳', handledAt: '2025-03-18', status: 'pending' },
];

export default function InsurancePage() {
  const [activeTab, setActiveTab] = useState<string>('scheme');
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
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [schemeFilterCity, setSchemeFilterCity] = useState('');
  const [changeFilterType, setChangeFilterType] = useState<string>('');
  const [changeFilterStatus, setChangeFilterStatus] = useState<string>('');
  const [form] = Form.useForm();
  const [insuredForm] = Form.useForm();
  const [changeForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          fetch('/api/insurance_schemes'), fetch('/api/insured_employees'),
          fetch('/api/insurance_changes'), fetch('/api/insurance_ledger'),
        ]);
        let [s, i, c, l] = [[], [], [], []];
        if (results[0].status === 'fulfilled' && results[0].value.ok) { const j = await results[0].value.json(); if (Array.isArray(j)) s = j; }
        if (results[1].status === 'fulfilled' && results[1].value.ok) { const j = await results[1].value.json(); if (Array.isArray(j)) i = j; }
        if (results[2].status === 'fulfilled' && results[2].value.ok) { const j = await results[2].value.json(); if (Array.isArray(j)) c = j; }
        if (results[3].status === 'fulfilled' && results[3].value.ok) { const j = await results[3].value.json(); if (Array.isArray(j)) l = j; }
        if (s.length === 0) s = generateMockSchemes();
        if (i.length === 0) i = generateMockInsured();
        if (c.length === 0) c = generateMockChanges();
        if (l.length === 0) l = generateMockLedger();
        setSchemes(s); setInsuredList(i); setChangeList(c); setLedgerList(l);
      } catch {
        setSchemes(generateMockSchemes()); setInsuredList(generateMockInsured());
        setChangeList(generateMockChanges()); setLedgerList(generateMockLedger());
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const stats = {
    schemeCount: schemes.filter(s => s.isActive).length,
    insuredCount: insuredList.filter(e => e.status === 'insured').length,
    suspendedCount: insuredList.filter(e => e.status === 'suspended').length,
    pendingChanges: changeList.filter(c => c.status === 'pending').length,
    monthTotal: ledgerList.length > 0 ? ledgerList[ledgerList.length - 1].grandTotal : 0,
  };

  // 方案管理
  const openSchemeModal = (scheme?: InsuranceScheme) => {
    setEditingScheme(scheme || null);
    if (scheme) form.setFieldsValue(scheme); else form.resetFields();
    setSchemeModal(true);
  };

  const saveScheme = async () => {
    try {
      const values = await form.validateFields();
      if (editingScheme) {
        setSchemes(prev => prev.map(s => s.id === editingScheme.id ? { ...s, ...values } : s));
        messageApi.success('方案更新成功');
      } else {
        setSchemes(prev => [...prev, { ...values, id: String(Date.now()), isActive: 1 } as InsuranceScheme]);
        messageApi.success('方案创建成功');
      }
      setSchemeModal(false);
    } catch { /* 验证失败 */ }
  };

  const deleteScheme = (id: string) => {
    setSchemes(prev => prev.filter(s => s.id !== id));
    messageApi.success('方案已删除');
  };

  // 参保人员
  const openInsuredModal = (emp?: InsuredEmployee) => {
    setEditingInsured(emp || null);
    if (emp) insuredForm.setFieldsValue(emp); else insuredForm.resetFields();
    setInsuredModal(true);
  };

  const saveInsured = async () => {
    try {
      const values = await insuredForm.validateFields();
      const scheme = schemes.find(s => s.id === values.schemeId);
      if (!scheme) { messageApi.error('请先选择参保方案'); return; }
      const base = values.baseAmount || 8000;
      const toFixed2 = (v: number) => +(v).toFixed(2);
      const record: InsuredEmployee = {
        ...values, id: editingInsured?.id || String(Date.now()),
        personalPension: toFixed2(base * scheme.pensionRate / 100),
        personalMedical: toFixed2(base * scheme.medicalRate / 100),
        personalUnemployment: toFixed2(base * scheme.unemploymentRate / 100),
        personalInjury: 0, personalMaternity: 0,
        personalHousing: toFixed2(base * scheme.housingRatePersonal / 100),
        companyPension: toFixed2(base * scheme.pensionRate / 100),
        companyMedical: toFixed2(base * scheme.medicalRate / 100),
        companyUnemployment: toFixed2(base * scheme.unemploymentRate / 100),
        companyInjury: toFixed2(base * scheme.injuryRate / 100),
        companyMaternity: toFixed2(base * scheme.maternityRate / 100),
        companyHousing: toFixed2(base * scheme.housingRateCompany / 100),
        status: 'insured', schemeName: scheme.name,
      };
      if (editingInsured) setInsuredList(prev => prev.map(e => e.id === editingInsured.id ? record : e));
      else setInsuredList(prev => [...prev, record]);
      messageApi.success(editingInsured ? '参保信息已更新' : '参保登记成功');
      setInsuredModal(false);
    } catch { /* 验证失败 */ }
  };

  const handleSuspend = (emp: InsuredEmployee) => {
    setInsuredList(prev => prev.map(e => e.id === emp.id ? { ...e, status: 'suspended' as const, endDate: new Date().toISOString().slice(0, 10) } : e));
    messageApi.success(`已暂停 ${emp.employeeName} 的社保`);
  };

  const handleCancel = (emp: InsuredEmployee) => {
    confirm({ title: '确认停保', icon: <ExclamationCircleOutlined />, content: `确定要为 ${emp.employeeName} 办理停保吗？`,
      onOk() {
        setInsuredList(prev => prev.map(e => e.id === emp.id ? { ...e, status: 'cancelled' as const, endDate: new Date().toISOString().slice(0, 10) } : e));
        messageApi.success(`已办理 ${emp.employeeName} 停保`);
      },
    });
  };

  // 增减员
  const openChangeModal = (type: 'add' | 'reduce') => {
    changeForm.setFieldsValue({ changeType: type, handledBy: '当前用户', effectiveDate: new Date().toISOString().slice(0, 10) });
    setChangeModal(true);
  };

  const saveChange = async () => {
    try {
      const values = await changeForm.validateFields();
      const scheme = schemes.find(s => s.id === values.schemeId);
      setChangeList(prev => [...prev, { ...values, id: String(Date.now()), schemeName: scheme?.name || '', handledAt: new Date().toISOString().slice(0, 10), handledBy: '当前用户', status: 'pending' as const }]);
      messageApi.success('增减员申请已提交');
      setChangeModal(false);
    } catch { /* 验证失败 */ }
  };

  const approveChange = (record: ChangeRecord) => {
    setChangeList(prev => prev.map(c => c.id === record.id ? { ...c, status: 'approved' as const } : c));
    if (record.changeType === 'add') {
      const scheme = schemes.find(s => s.id === record.schemeId);
      if (scheme) {
        const base = record.baseAmount;
        const toFixed2 = (v: number) => +(v).toFixed(2);
        setInsuredList(prev => [...prev, {
          id: String(Date.now()), employeeId: record.employeeId, employeeName: record.employeeName, department: record.department,
          idCard: '', schemeId: record.schemeId, schemeName: record.schemeName, baseAmount: base,
          pensionBase: base, medicalBase: base, housingBase: base, startDate: record.effectiveDate,
          personalPension: toFixed2(base * scheme.pensionRate / 100), personalMedical: toFixed2(base * scheme.medicalRate / 100),
          personalUnemployment: toFixed2(base * scheme.unemploymentRate / 100), personalInjury: 0, personalMaternity: 0,
          personalHousing: toFixed2(base * scheme.housingRatePersonal / 100),
          companyPension: toFixed2(base * scheme.pensionRate / 100), companyMedical: toFixed2(base * scheme.medicalRate / 100),
          companyUnemployment: toFixed2(base * scheme.unemploymentRate / 100), companyInjury: toFixed2(base * scheme.injuryRate / 100),
          companyMaternity: toFixed2(base * scheme.maternityRate / 100), companyHousing: toFixed2(base * scheme.housingRateCompany / 100),
          status: 'insured' as const,
        }]);
      }
    } else {
      setInsuredList(prev => prev.map(e => e.employeeId === record.employeeId ? { ...e, status: 'cancelled' as const, endDate: record.effectiveDate } : e));
    }
    messageApi.success('增减员申请已批准');
  };

  const rejectChange = (id: string) => {
    setChangeList(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' as const } : c));
    messageApi.info('已驳回该申请');
  };

  const handleBatchAdd = () => {
    if (selectedRowKeys.length === 0) { messageApi.warning('请先选择参保人员'); return; }
    const selected = insuredList.filter(e => selectedRowKeys.includes(e.id) && e.status === 'suspended');
    if (selected.length === 0) { messageApi.warning('选中的记录无可恢复参保'); return; }
    setInsuredList(prev => prev.map(e => selectedRowKeys.includes(e.id) ? { ...e, status: 'insured' as const } : e));
    messageApi.success(`已批量恢复 ${selected.length} 人参保`);
    setSelectedRowKeys([]);
  };

  const handleBatchReduce = () => {
    if (selectedRowKeys.length === 0) { messageApi.warning('请先选择参保人员'); return; }
    confirm({ title: '批量减员确认', icon: <ExclamationCircleOutlined />, content: `确定要为选中的 ${selectedRowKeys.length} 人办理减员吗？`,
      onOk() {
        setInsuredList(prev => prev.map(e => selectedRowKeys.includes(e.id) ? { ...e, status: 'cancelled' as const, endDate: new Date().toISOString().slice(0, 10) } : e));
        messageApi.success(`已批量减员 ${selectedRowKeys.length} 人`);
        setSelectedRowKeys([]);
      },
    });
  };

  const exportLedger = () => {
    const csv = [
      ['月份', '部门', '参保人数', '个人合计', '单位合计', '养老保险', '医疗保险', '失业保险', '工伤保险', '生育保险', '公积金', '总金额'].join(','),
      ...ledgerList.map(r => [r.month, r.department, r.employeeCount, r.totalPersonal, r.totalCompany, r.pensionTotal, r.medicalTotal, r.unemploymentTotal, r.injuryTotal, r.maternityTotal, r.housingTotal, r.grandTotal].join(',')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `社保公积金台账_${new Date().toISOString().slice(0, 7)}.csv`; a.click();
    URL.revokeObjectURL(url); messageApi.success('台账已导出');
  };

  const exportChangeDetail = () => {
    const filtered = changeList.filter(c => (!changeFilterType || c.changeType === changeFilterType) && (!changeFilterStatus || c.status === changeFilterStatus));
    const csv = [
      ['姓名', '工号', '部门', '类型', '原因', '方案', '基数', '生效日期', '办理人', '办理日期', '状态'].join(','),
      ...filtered.map(c => [c.employeeName, c.employeeId, c.department, c.changeType === 'add' ? '增员' : '减员', c.changeReason, c.schemeName, c.baseAmount, c.effectiveDate, c.handledBy || '', c.handledAt || '', c.status].join(',')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `增减员明细_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url); messageApi.success('增减员明细已导出');
  };

  const filteredInsured = insuredList.filter(e => {
    if (!searchText) return true;
    const t = searchText.toLowerCase();
    return e.employeeName.toLowerCase().includes(t) || e.employeeId.toLowerCase().includes(t) || e.department.toLowerCase().includes(t);
  });

  const filteredChanges = changeList.filter(c => {
    if (changeFilterType && c.changeType !== changeFilterType) return false;
    if (changeFilterStatus && c.status !== changeFilterStatus) return false;
    return true;
  });

  const tabs = [
    { key: 'scheme', label: '社保公积金方案', icon: <SafetyCertificateOutlined /> },
    { key: 'insured', label: '参保人员管理', icon: <TeamOutlined /> },
    { key: 'changes', label: '增减员明细', icon: <SyncOutlined /> },
    { key: 'ledger', label: '缴纳台账', icon: <BankOutlined /> },
    { key: 'analysis', label: '数据分析', icon: <BarChartOutlined /> },
  ];

  const schemeColumns = [
    { title: '方案名称', dataIndex: 'name', key: 'name', width: 180 },
    { title: '城市', dataIndex: 'city', key: 'city', width: 100 },
    { title: '养老(公司)', dataIndex: 'pensionRate', key: 'pension', width: 90, render: (v: number) => `${v}%` },
    { title: '医疗(公司)', dataIndex: 'medicalRate', key: 'medical', width: 90, render: (v: number) => `${v}%` },
    { title: '失业(公司)', dataIndex: 'unemploymentRate', key: 'unemp', width: 90, render: (v: number) => `${v}%` },
    { title: '公积金个人/公司', key: 'housing', width: 160, render: (_: any, r: InsuranceScheme) => `${r.housingRatePersonal}% / ${r.housingRateCompany}%` },
    { title: '基数范围', key: 'base', width: 160, render: (_: any, r: InsuranceScheme) => `${r.baseMin.toLocaleString()} ~ ${r.baseMax.toLocaleString()}` },
    { title: '状态', dataIndex: 'isActive', key: 'isActive', width: 70, render: (v: number) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
    { title: '操作', key: 'action', width: 120, render: (_: any, r: InsuranceScheme) => (
      <Space size="small">
        <Button size="small" type="link" onClick={() => openSchemeModal(r)}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => deleteScheme(r.id)}>
          <Button size="small" danger type="link">删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const insuredColumns = [
    { title: '姓名', dataIndex: 'employeeName', key: 'name', width: 90 },
    { title: '工号', dataIndex: 'employeeId', key: 'id', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'dept', width: 110 },
    { title: '参保方案', dataIndex: 'schemeName', key: 'scheme', width: 180 },
    { title: '基数', dataIndex: 'baseAmount', key: 'base', width: 90, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: '个人合计', key: 'personal', width: 90, render: (_: any, r: InsuredEmployee) => {
      const t = r.personalPension + r.personalMedical + r.personalUnemployment + r.personalInjury + r.personalMaternity + r.personalHousing;
      return <Text strong>¥{t.toFixed(2)}</Text>;
    }},
    { title: '单位合计', key: 'company', width: 90, render: (_: any, r: InsuredEmployee) => {
      const t = r.companyPension + r.companyMedical + r.companyUnemployment + r.companyInjury + r.companyMaternity + r.companyHousing;
      return <Text strong type="primary">¥{t.toFixed(2)}</Text>;
    }},
    { title: '参保日期', dataIndex: 'startDate', key: 'start', width: 110, render: (v: string) => v?.slice(0, 10) },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={statusMap[v]?.color || 'default'}>{statusMap[v]?.label || v}</Tag> },
    { title: '操作', key: 'action', width: 180, render: (_: any, r: InsuredEmployee) => (
      <Space size="small">
        <Button size="small" type="link" onClick={() => { setSelectedEmployee(r); setDetailModal(true); }}>详情</Button>
        <Button size="small" type="link" onClick={() => openInsuredModal(r)}>编辑</Button>
        {r.status === 'insured' && <Button size="small" type="link" onClick={() => handleSuspend(r)}>暂停</Button>}
        {(r.status === 'insured' || r.status === 'suspended') && <Button size="small" danger type="link" onClick={() => handleCancel(r)}>停保</Button>}
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
    { title: '基数', dataIndex: 'baseAmount', key: 'base', width: 90, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: '生效日期', dataIndex: 'effectiveDate', key: 'date', width: 110 },
    { title: '办理人', dataIndex: 'handledBy', key: 'handler', width: 90 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (v: string) => <Tag color={changeStatusMap[v]?.color || 'default'}>{changeStatusMap[v]?.label || v}</Tag> },
    { title: '操作', key: 'action', width: 120, render: (_: any, r: ChangeRecord) => (
      r.status === 'pending' ? (
        <Space size="small">
          <Button size="small" type="link" className="text-green-600" onClick={() => approveChange(r)}>批准</Button>
          <Button size="small" danger type="link" onClick={() => rejectChange(r.id)}>驳回</Button>
        </Space>
      ) : <Text type="secondary" className="text-xs">已处理</Text>
    )},
  ];

  const ledgerColumns = [
    { title: '月份', dataIndex: 'month', key: 'month', width: 100 },
    { title: '部门', dataIndex: 'department', key: 'dept', width: 120 },
    { title: '人数', dataIndex: 'employeeCount', key: 'count', width: 70 },
    { title: '个人合计', dataIndex: 'totalPersonal', key: 'personal', width: 100, render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: '单位合计', dataIndex: 'totalCompany', key: 'company', width: 100, render: (v: number) => <Text type="warning">¥{v?.toLocaleString()}</Text> },
    { title: '养老保险', dataIndex: 'pensionTotal', key: 'pension', width: 100, render: (v: number) => <Text type="secondary">¥{v?.toLocaleString()}</Text> },
    { title: '医疗保险', dataIndex: 'medicalTotal', key: 'medical', width: 100, render: (v: number) => <Text type="secondary">¥{v?.toLocaleString()}</Text> },
    { title: '失业保险', dataIndex: 'unemploymentTotal', key: 'unemp', width: 90, render: (v: number) => <Text type="secondary">¥{v?.toLocaleString()}</Text> },
    { title: '工伤保险', dataIndex: 'injuryTotal', key: 'injury', width: 90, render: (v: number) => <Text type="secondary">¥{v?.toLocaleString()}</Text> },
    { title: '生育保险', dataIndex: 'maternityTotal', key: 'mater', width: 90, render: (v: number) => <Text type="secondary">¥{v?.toLocaleString()}</Text> },
    { title: '公积金', dataIndex: 'housingTotal', key: 'housing', width: 90, render: (v: number) => <Text type="secondary">¥{v?.toLocaleString()}</Text> },
    { title: '总金额', dataIndex: 'grandTotal', key: 'total', width: 110, render: (v: number) => <Text strong type="danger">¥{v?.toLocaleString()}</Text> },
  ];

  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys) };

  return (
    <div className="p-6 space-y-4">
      {contextHolder}
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold">保险福利管理</h2><p className="text-sm text-muted-foreground">社保公积金方案配置 · 增减员管理 · 缴纳台账</p></div>
      </div>

      <Row gutter={16}>
        <Col span={4}><Card size="small"><Statistic title="启用方案" value={stats.schemeCount} suffix="个" /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="参保人数" value={stats.insuredCount} suffix="人" valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="已暂停" value={stats.suspendedCount} suffix="人" valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={4}><Card size="small"><Statistic title="待处理" value={stats.pendingChanges} suffix="条" valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={8}><Card size="small"><Statistic title="本月社保公积金总额" value={stats.monthTotal} precision={2} prefix="¥" valueStyle={{ color: '#f5222d', fontSize: 20 }} /></Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarStyle={{ marginBottom: 16 }} items={tabs} />

        {activeTab === 'scheme' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Space>
                <Input placeholder="搜索方案名称" prefix={<SearchOutlined />} allowClear style={{ width: 200 }} onChange={e => setSearchText(e.target.value)} />
                <Select placeholder="按城市筛选" allowClear style={{ width: 140 }} value={schemeFilterCity || undefined} onChange={v => setSchemeFilterCity(v)}>
                  {[...new Set(schemes.map(s => s.city))].map(city => <Option key={city} value={city}>{city}</Option>)}
                </Select>
              </Space>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => openSchemeModal()}>新建方案</Button>
            </div>
            <Table columns={schemeColumns} dataSource={schemes.filter(s => (!schemeFilterCity || s.city === schemeFilterCity) && (!searchText || s.name.includes(searchText)))} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
          </div>
        )}

        {activeTab === 'insured' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Space wrap>
                <Input placeholder="搜索姓名/工号/部门" prefix={<SearchOutlined />} allowClear style={{ width: 220 }} value={searchText} onChange={e => setSearchText(e.target.value)} />
                <Button onClick={() => openChangeModal('add')} icon={<PlusOutlined />} type="primary">增员</Button>
                <Button onClick={() => openChangeModal('reduce')} danger icon={<SyncOutlined />}>减员</Button>
              </Space>
              <Space>
                <Button size="small" onClick={handleBatchAdd} disabled={selectedRowKeys.length === 0}>批量恢复</Button>
                <Button size="small" danger onClick={handleBatchReduce} disabled={selectedRowKeys.length === 0}>批量减员 ({selectedRowKeys.length})</Button>
              </Space>
            </div>
            <Alert message="缴费说明：个人缴纳 = 基数 × 各险种比例之和；单位缴纳 = 基数 × 各险种公司比例之和。公积金个人与单位同比例。" type="info" showIcon style={{ marginBottom: 8 }} />
            <Table columns={insuredColumns} dataSource={filteredInsured} rowKey="id" loading={loading} rowSelection={rowSelection} pagination={{ pageSize: 10, showSizeChanger: true, showTotal: t => `共 ${t} 条` }} size="small" scroll={{ x: 1200 }} />
          </div>
        )}

        {activeTab === 'changes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Space wrap>
                <Select placeholder="变更类型" allowClear style={{ width: 120 }} value={changeFilterType || undefined} onChange={v => setChangeFilterType(v)}>
                  <Option value="add">增员</Option> <Option value="reduce">减员</Option>
                </Select>
                <Select placeholder="处理状态" allowClear style={{ width: 120 }} value={changeFilterStatus || undefined} onChange={v => setChangeFilterStatus(v)}>
                  <Option value="pending">待处理</Option> <Option value="approved">已办理</Option> <Option value="rejected">已驳回</Option>
                </Select>
                <Button icon={<DownloadOutlined />} onClick={exportChangeDetail}>导出明细</Button>
              </Space>
              <Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openChangeModal('add')}>新增增员</Button>
                <Button danger icon={<SyncOutlined />} onClick={() => openChangeModal('reduce')}>新增减员</Button>
              </Space>
            </div>
            <Table columns={changeColumns} dataSource={filteredChanges} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} size="small" scroll={{ x: 1200 }} />
          </div>
        )}

        {activeTab === 'ledger' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Text type="secondary">每月自动汇总各单位社保公积金缴纳明细</Text>
              <Button icon={<DownloadOutlined />} onClick={exportLedger}>导出台账</Button>
            </div>
            <Table columns={ledgerColumns} dataSource={ledgerList} rowKey="id" loading={loading} pagination={{ pageSize: 6 }} size="small" scroll={{ x: 1300 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}><Text strong>合计</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={1}><Text strong>{ledgerList.reduce((s, r) => s + r.employeeCount, 0)}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={2}><Text strong>¥{ledgerList.reduce((s, r) => s + r.totalPersonal, 0).toLocaleString()}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={3}><Text strong type="warning">¥{ledgerList.reduce((s, r) => s + r.totalCompany, 0).toLocaleString()}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={4}><Text strong>¥{ledgerList.reduce((s, r) => s + r.pensionTotal, 0).toLocaleString()}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={5}><Text strong>¥{ledgerList.reduce((s, r) => s + r.medicalTotal, 0).toLocaleString()}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={6}><Text strong>¥{ledgerList.reduce((s, r) => s + r.unemploymentTotal, 0).toLocaleString()}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={7}><Text strong>¥{ledgerList.reduce((s, r) => s + r.injuryTotal, 0).toLocaleString()}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={8}><Text strong>¥{ledgerList.reduce((s, r) => s + r.maternityTotal, 0).toLocaleString()}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={9}><Text strong>¥{ledgerList.reduce((s, r) => s + r.housingTotal, 0).toLocaleString()}</Text></Table.Summary.Cell>
                    <Table.Summary.Cell index={10}><Text strong type="danger">¥{ledgerList.reduce((s, r) => s + r.grandTotal, 0).toLocaleString()}</Text></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
            <Alert message="增减员明细表：点击上方「增减员明细」Tab查看每月增员减员详细记录，并可导出Excel。" type="info" showIcon />
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <Row gutter={16}>
              <Col span={12}>
                <Card title="各险种月度缴纳占比（最近月份）">
                  {(() => {
                    const last = ledgerList[ledgerList.length - 1];
                    if (!last) return <Text>暂无数据</Text>;
                    const items = [
                      { name: '养老保险', value: last.pensionTotal, color: '#1677ff' },
                      { name: '医疗保险', value: last.medicalTotal, color: '#52c41a' },
                      { name: '失业保险', value: last.unemploymentTotal, color: '#faad14' },
                      { name: '工伤保险', value: last.injuryTotal, color: '#f5222d' },
                      { name: '生育保险', value: last.maternityTotal, color: '#722ed1' },
                      { name: '住房公积金', value: last.housingTotal, color: '#13c2c2' },
                    ];
                    const total = last.grandTotal;
                    return (
                      <div className="space-y-3">
                        {items.map(item => (
                          <div key={item.name} className="flex items-center gap-3">
                            <Text style={{ width: 80 }}>{item.name}</Text>
                            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${(item.value / total * 100).toFixed(1)}%`, backgroundColor: item.color }} />
                            </div>
                            <Text style={{ width: 70, textAlign: 'right' }}>¥{item.value.toLocaleString()}</Text>
                            <Text type="secondary" style={{ width: 50 }}>{(item.value / total * 100).toFixed(1)}%</Text>
                          </div>
                        ))}
                        <Divider style={{ margin: '8px 0' }} />
                        <div className="flex items-center justify-between"><Text strong>合计</Text><Text strong type="danger">¥{total.toLocaleString()}</Text></div>
                      </div>
                    );
                  })()}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="参保人员状态分布">
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
                            <Text type="secondary" style={{ width: 50 }}>人 ({(item.value / total * 100).toFixed(1)}%)</Text>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </Card>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Card title="月度社保公积金缴纳趋势">
                  <Table
                    dataSource={ledgerList.map(r => ({ ...r, key: r.id }))}
                    columns={[
                      { title: '月份', dataIndex: 'month', key: 'month', width: 100 },
                      { title: '参保人数', dataIndex: 'employeeCount', key: 'count', width: 100 },
                      { title: '个人缴纳', dataIndex: 'totalPersonal', key: 'personal', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
                      { title: '单位缴纳', dataIndex: 'totalCompany', key: 'company', width: 120, render: (v: number) => `¥${v.toLocaleString()}` },
                      { title: '总金额', dataIndex: 'grandTotal', key: 'total', width: 130, render: (v: number) => `¥${v.toLocaleString()}` },
                      { title: '趋势', key: 'bar', width: 200, render: (_: any, r: any) => {
                        const max = Math.max(...ledgerList.map(l => l.totalCompany));
                        return (
                          <div className="flex items-center gap-1">
                            <div className="bg-blue-100 rounded-sm" style={{ height: 12, width: Math.max(4, r.totalCompany / max * 180) }} />
                            <Text type="secondary" className="text-xs">{r.totalCompany.toLocaleString()}</Text>
                          </div>
                        );
                      }},
                    ]}
                    pagination={false} size="small"
                  />
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Card>

      {/* 方案编辑弹窗 */}
      <Modal title={editingScheme ? '编辑社保公积金方案' : '新建社保公积金方案'} open={schemeModal} onOk={saveScheme} onCancel={() => setSchemeModal(false)} width={680} okText="保存" cancelText="取消">
        <Form form={form} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="方案名称" rules={[{ required: true }]}><Input placeholder="如：上海市标准社保方案" /></Form.Item></Col>
            <Col span={12}><Form.Item name="city" label="适用城市" rules={[{ required: true }]}><Input placeholder="如：上海市" /></Form.Item></Col>
          </Row>
          <Divider orientation="left">各险种缴纳比例（单位：%）</Divider>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="pensionRate" label="养老保险（公司）" initialValue={16}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
            <Col span={8}><Form.Item name="medicalRate" label="医疗保险（公司）" initialValue={10}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
            <Col span={8}><Form.Item name="unemploymentRate" label="失业保险（公司）" initialValue={0.5}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
            <Col span={8}><Form.Item name="injuryRate" label="工伤保险（公司）" initialValue={0.5}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
            <Col span={8}><Form.Item name="maternityRate" label="生育保险（公司）" initialValue={0.8}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
            <Col span={8}><Form.Item name="housingRateCompany" label="公积金（公司）" initialValue={12}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
          </Row>
          <Divider orientation="left">个人缴纳比例（单位：%）</Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="housingRatePersonal" label="公积金个人比例" initialValue={7}><InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" /></Form.Item></Col>
          </Row>
          <Divider orientation="left">基数设置</Divider>
          <Row gutter={16}>
            <Col span={12}><Form.Item label="缴费基数下限" name="baseMin" rules={[{ required: true }]} initialValue={5975}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item label="缴费基数上限" name="baseMax" rules={[{ required: true }]} initialValue={31014}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="可选备注信息" /></Form.Item></Col>
            <Col span={12}><Form.Item name="isActive" label="状态" valuePropName="checked" initialValue={true}><Checkbox>启用此方案</Checkbox></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* 参保人员编辑弹窗 */}
      <Modal title={editingInsured ? '编辑参保信息' : '新增参保人员'} open={insuredModal} onOk={saveInsured} onCancel={() => setInsuredModal(false)} width={560} okText="保存" cancelText="取消">
        <Form form={insuredForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="employeeId" label="工号" rules={[{ required: true }]}><Input placeholder="如：EMP1001" /></Form.Item></Col>
            <Col span={12}><Form.Item name="employeeName" label="姓名" rules={[{ required: true }]}><Input placeholder="员工姓名" /></Form.Item></Col>
            <Col span={12}><Form.Item name="department" label="部门" rules={[{ required: true }]}><Input placeholder="所属部门" /></Form.Item></Col>
            <Col span={12}><Form.Item name="schemeId" label="参保方案" rules={[{ required: true }]}><Select placeholder="选择参保方案">{schemes.filter(s => s.isActive).map(s => <Option key={s.id} value={s.id}>{s.name}（{s.city}）</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="baseAmount" label="缴费基数" rules={[{ required: true }]} initialValue={8000}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="startDate" label="参保日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
          </Row>
          <Alert message="系统将根据选择的参保方案和缴费基数，自动核算个人和单位各险种缴纳金额。" type="info" showIcon />
        </Form>
      </Modal>

      {/* 增减员弹窗 */}
      <Modal title={changeForm.getFieldValue('changeType') === 'reduce' ? '新增减员' : '新增增员'} open={changeModal} onOk={saveChange} onCancel={() => setChangeModal(false)} width={560} okText="提交" cancelText="取消">
        <Form form={changeForm} layout="vertical" size="small">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="changeType" label="变更类型" rules={[{ required: true }]}><Select><Option value="add">增员</Option><Option value="reduce">减员</Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item name="changeReason" label="变更原因" rules={[{ required: true }]}><Select placeholder="选择变更原因">{changeReasonOptions.map(r => <Option key={r} value={r}>{r}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="employeeId" label="工号" rules={[{ required: true }]}><Input placeholder="员工工号" /></Form.Item></Col>
            <Col span={12}><Form.Item name="employeeName" label="姓名" rules={[{ required: true }]}><Input placeholder="员工姓名" /></Form.Item></Col>
            <Col span={12}><Form.Item name="department" label="部门" rules={[{ required: true }]}><Input placeholder="所属部门" /></Form.Item></Col>
            <Col span={12}><Form.Item name="schemeId" label="参保方案" rules={[{ required: true }]}><Select placeholder="选择参保方案">{schemes.filter(s => s.isActive).map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="baseAmount" label="缴费基数" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true }]}><Input type="date" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* 参保详情弹窗 */}
      <Modal title={selectedEmployee ? `参保详情 - ${selectedEmployee.employeeName}` : ''} open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={680}>
        {selectedEmployee && (
          <div className="space-y-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="工号">{selectedEmployee.employeeId}</Descriptions.Item>
              <Descriptions.Item label="部门">{selectedEmployee.department}</Descriptions.Item>
              <Descriptions.Item label="参保方案">{selectedEmployee.schemeName}</Descriptions.Item>
              <Descriptions.Item label="缴费基数">¥{selectedEmployee.baseAmount?.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="参保日期">{selectedEmployee.startDate?.slice(0, 10)}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusMap[selectedEmployee.status]?.color}>{statusMap[selectedEmployee.status]?.label}</Tag></Descriptions.Item>
            </Descriptions>
            <Divider>缴纳明细（月度）</Divider>
            <Row gutter={16}>
              <Col span={12}>
                <Card title="个人缴纳" size="small">
                  <div className="space-y-2">
                    {[{ label: '养老保险', v: selectedEmployee.personalPension }, { label: '医疗保险', v: selectedEmployee.personalMedical }, { label: '失业保险', v: selectedEmployee.personalUnemployment }, { label: '工伤保险', v: selectedEmployee.personalInjury }, { label: '生育保险', v: selectedEmployee.personalMaternity }, { label: '住房公积金', v: selectedEmployee.personalHousing }].map(item => (
                      <div key={item.label} className="flex justify-between text-sm"><Text type="secondary">{item.label}</Text><Text>¥{item.v?.toFixed(2)}</Text></div>
                    ))}
                    <Divider style={{ margin: '8px 0' }} />
                    <div className="flex justify-between font-medium"><Text strong>个人合计</Text><Text strong type="danger">¥{(selectedEmployee.personalPension + selectedEmployee.personalMedical + selectedEmployee.personalUnemployment + selectedEmployee.personalInjury + selectedEmployee.personalMaternity + selectedEmployee.personalHousing).toFixed(2)}</Text></div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="单位缴纳" size="small">
                  <div className="space-y-2">
                    {[{ label: '养老保险', v: selectedEmployee.companyPension }, { label: '医疗保险', v: selectedEmployee.companyMedical }, { label: '失业保险', v: selectedEmployee.companyUnemployment }, { label: '工伤保险', v: selectedEmployee.companyInjury }, { label: '生育保险', v: selectedEmployee.companyMaternity }, { label: '住房公积金', v: selectedEmployee.companyHousing }].map(item => (
                      <div key={item.label} className="flex justify-between text-sm"><Text type="secondary">{item.label}</Text><Text type="warning">¥{item.v?.toFixed(2)}</Text></div>
                    ))}
                    <Divider style={{ margin: '8px 0' }} />
                    <div className="flex justify-between font-medium"><Text strong>单位合计</Text><Text strong type="danger">¥{(selectedEmployee.companyPension + selectedEmployee.companyMedical + selectedEmployee.companyUnemployment + selectedEmployee.companyInjury + selectedEmployee.companyMaternity + selectedEmployee.companyHousing).toFixed(2)}</Text></div>
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
