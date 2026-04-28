import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { fieldToLabel } from '@/utils/fieldLabels';
import { Card, Table, Tag, Row, Col, Statistic, Button, Modal, Form, Input, Select, message, Tabs, Popconfirm, Dropdown, Menu } from 'antd';
import { TeamOutlined, ApartmentOutlined, UserOutlined, BankOutlined, ArrowRightOutlined, SwapOutlined, MergeOutlined, SortAscendingOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons';

// ==================== 类型定义 ====================
interface Department {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  code?: string;
  headcountPlan?: number;
  headcountActual?: number;
  managerId?: string;
  sortOrder?: number;
  isActive?: number;
}

interface Position {
  id: string;
  name: string;
  departmentId: string;
  level?: string;
  rankId?: string;
  headcountPlan?: number;
  headcountActual?: number;
  sortOrder?: number;
  isActive?: number;
}

interface Rank {
  id: string;
  name: string;
  level: number;
  baseSalary?: number;
  positionSalary?: number;
  salaryRange?: string;
  description?: string;
  isActive?: number;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  deptId?: string;
  positionId?: string;
  status: string;
}

type TabType = 'orgchart' | 'departments' | 'positions' | 'ranks' | 'headcount';
type DrillView = 'department' | 'position' | null;

export default function OrganizationPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('orgchart');
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  
  // 数据状态
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [ranks, setRanks] = useState<Rank[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // 组织架构树状态
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['company']));
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [drillView, setDrillView] = useState<DrillView>(null);
  
  // 编辑状态
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogForm, setDialogForm] = useState<Record<string, any>>({});
  const [dialogType, setDialogType] = useState<'department' | 'position' | 'rank'>('department');

  // 部门划转/合并/调序状态
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [transferTarget, setTransferTarget] = useState<Department | null>(null);
  const [mergeModalVisible, setMergeModalVisible] = useState(false);
  const [mergeSource, setMergeSource] = useState<Department[]>([]);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [siblingDepts, setSiblingDepts] = useState<Department[]>([]);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, posRes, rankRes, empRes] = await Promise.all([
        fetch('/api/departments'),
        fetch('/api/positions'),
        fetch('/api/ranks'),
        fetch('/api/employees')
      ]);
      const [depts, posis, rks, emps] = await Promise.all([
        deptRes.json(),
        posRes.json(),
        rankRes.json(),
        empRes.json()
      ]);
      setDepartments(Array.isArray(depts) ? depts : []);
      setPositions(Array.isArray(posis) ? posis : []);
      setRanks(Array.isArray(rks) ? rks : []);
      setEmployees(Array.isArray(emps) ? emps : []);
    } catch (e) {
      console.error('加载数据失败:', e);
    }
    setLoading(false);
  };

  // ==================== 组织架构树 ====================
  const treeData = useMemo(() => {
    const buildTree = (parentId: string | null, level: number): any[] => {
      return departments
        .filter(d => d.parentId === parentId)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(d => ({
          ...d,
          level,
          children: buildTree(d.id, level + 1)
        }));
    };
    
    return [{
      id: 'company',
      name: '飞达科技',
      level: 0,
      parentId: null,
      headcountPlan: departments.reduce((sum, d) => sum + (d.headcountPlan || 0), 0),
      headcountActual: employees.filter(e => e.status === 'active').length,
      children: buildTree(null, 1)
    }];
  }, [departments, employees]);

  // ==================== 组织架构统计 ====================
  const orgStats = useMemo(() => {
    const activeEmps = employees.filter(e => e.status === 'active');
    const deptStats = departments.map(d => ({
      name: d.name,
      value: activeEmps.filter(e => e.deptId === d.id).length,
    }));
    return {
      totalDepts: departments.length,
      totalPositions: positions.length,
      totalEmployees: activeEmps.length,
      deptDistribution: deptStats.slice(0, 10),
    };
  }, [departments, positions, employees]);

  // 获取部门面包屑路径
  const getDeptPath = (deptId: string | null): Department[] => {
    if (!deptId) return [];
    const path: Department[] = [];
    let current = departments.find(d => d.id === deptId);
    while (current) {
      path.unshift(current);
      current = departments.find(d => d.id === current.parentId);
    }
    return path;
  };

  // 穿透查询：点击岗位
  const handlePositionClick = (pos: Position) => {
    setSelectedPosition(pos);
    setDrillView('position');
  };

  // 返回部门视图
  const handleBackToDept = () => {
    setDrillView(null);
    setSelectedPosition(null);
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (node: any, depth: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedDept?.id === node.id;
    
    return (
      <div key={node.id}>
        <div 
          className={`flex items-center gap-2 py-2 px-3 cursor-pointer hover:bg-accent/50 rounded ${isSelected ? 'bg-primary/10 border-l-2 border-primary' : ''}`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => {
            setSelectedDept(node);
            if (hasChildren) toggleNode(node.id);
          }}
        >
          {hasChildren && (
            <span className="text-muted-foreground w-4">{isExpanded ? '▼' : '▶'}</span>
          )}
          {!hasChildren && <span className="w-4" />}
          <span className="font-medium">{node.name}</span>
          {node.headcountPlan !== undefined && (
            <span className="text-xs text-muted-foreground ml-auto">
              编制: {node.headcountActual || 0}/{node.headcountPlan}
            </span>
          )}
          {node.id !== 'company' && (
            <Dropdown menu={{
              items: [
                { key: 'transfer', icon: <SwapOutlined />, label: '部门划转', onClick: () => handleTransfer(node) },
                { key: 'merge', icon: <MergeOutlined />, label: '合并到本部门', onClick: () => handleMergeInit(node) },
                { key: 'sort', icon: <SortAscendingOutlined />, label: '同级调序', onClick: () => handleSort(node) },
                { type: 'divider' },
                { key: 'edit', icon: null, label: '编辑部门', onClick: () => handleEdit(node, 'department') },
              ]
            }} trigger={['click']}>
              <MoreOutlined className="ml-2 text-gray-400 hover:text-gray-600" onClick={(e) => e.stopPropagation()} />
            </Dropdown>
          )}
        </div>
        {hasChildren && isExpanded && node.children.map((child: any) => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  // ==================== 通用CRUD操作 ====================
  const handleAdd = (type: 'department' | 'position' | 'rank') => {
    setDialogType(type);
    setEditingItem(null);
    if (type === 'department') {
      setDialogForm({ name: '', code: '', parentId: selectedDept?.id === 'company' ? null : selectedDept?.id || null, headcountPlan: 0, isActive: 1, sortOrder: 0 });
    } else if (type === 'position') {
      setDialogForm({ name: '', departmentId: selectedDept?.id || '', level: '', headcountPlan: 0, isActive: 1, sortOrder: 0 });
    } else {
      setDialogForm({ name: '', level: 1, baseSalary: 0, positionSalary: 0, isActive: 1 });
    }
    setShowDialog(true);
  };

  const handleEdit = (item: any, type: 'department' | 'position' | 'rank') => {
    setDialogType(type);
    setEditingItem(item);
    setDialogForm({ ...item });
    setShowDialog(true);
  };

  const handleDelete = async (id: string, table: string) => {
    if (!confirm('确定要删除吗？')) return;
    try {
      await fetch(`/api/${table}/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error('删除失败:', e);
    }
  };

  const handleSave = async () => {
    const table = dialogType === 'department' ? 'departments' : dialogType === 'position' ? 'positions' : 'ranks';
    const idPrefix = dialogType === 'department' ? 'dept' : dialogType === 'position' ? 'pos' : 'rank';
    
    try {
      if (editingItem) {
        await fetch(`/api/${table}/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dialogForm)
        });
      } else {
        const body: Record<string, any> = { ...dialogForm, id: `${idPrefix}_${Date.now()}` };
        await fetch(`/api/${table}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      }
      setShowDialog(false);
      loadData();
    } catch (e) {
      console.error('保存失败:', e);
    }
  };

  // ==================== 部门划转 ====================
  const handleTransfer = (dept: Department) => {
    setTransferTarget(dept);
    setTransferModalVisible(true);
  };

  const handleTransferSubmit = async (newParentId: string | null) => {
    if (!transferTarget) return;
    try {
      await fetch(`/api/departments/${transferTarget.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: newParentId, level: newParentId ? (departments.find(d => d.id === newParentId)?.level || 0) + 1 : 1 })
      });
      messageApi.success('部门划转成功');
      setTransferModalVisible(false);
      loadData();
    } catch {
      messageApi.error('划转失败');
    }
  };

  // ==================== 部门合并 ====================
  const handleMergeInit = (dept: Department) => {
    setMergeSource([dept]);
    setMergeModalVisible(true);
  };

  const handleMergeAddDept = (dept: Department) => {
    if (!mergeSource.find(d => d.id === dept.id)) {
      setMergeSource([...mergeSource, dept]);
    }
  };

  const handleMergeRemove = (deptId: string) => {
    setMergeSource(mergeSource.filter(d => d.id !== deptId));
  };

  const handleMergeSubmit = async (targetDeptId: string, mergedName?: string) => {
    if (mergeSource.length < 2) {
      messageApi.warning('请至少选择2个部门进行合并');
      return;
    }
    const sourceIds = mergeSource.filter(d => d.id !== targetDeptId).map(d => d.id);
    try {
      // 1. 更新所有子部门到目标部门
      for (const child of departments.filter(d => d.parentId && sourceIds.includes(d.parentId))) {
        await fetch(`/api/departments/${child.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ parentId: targetDeptId })
        });
      }
      // 2. 更新合并后部门名称
      if (mergedName) {
        await fetch(`/api/departments/${targetDeptId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: mergedName })
        });
      }
      // 3. 删除被合并的部门
      for (const id of sourceIds) {
        await fetch(`/api/departments/${id}`, { method: 'DELETE' });
      }
      messageApi.success(`成功合并${sourceIds.length + 1}个部门`);
      setMergeModalVisible(false);
      setMergeSource([]);
      loadData();
    } catch {
      messageApi.error('合并失败');
    }
  };

  // ==================== 部门调序 ====================
  const handleSort = (dept: Department) => {
    const siblings = departments
      .filter(d => d.parentId === dept.parentId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    setSiblingDepts(siblings);
    setSortModalVisible(true);
  };

  const handleSortSubmit = async (sortedDepts: Department[]) => {
    try {
      for (let i = 0; i < sortedDepts.length; i++) {
        await fetch(`/api/departments/${sortedDepts[i].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: i + 1 })
        });
      }
      messageApi.success('排序已更新');
      setSortModalVisible(false);
      loadData();
    } catch {
      messageApi.error('排序失败');
    }
  };

  // ==================== 渲染函数 ====================
  const renderOrgChart = () => (
    <div className="flex h-[calc(100vh-180px)]">
      {contextHolder}
      {/* 左侧树形导航 */}
      <div className="w-80 border-r bg-card overflow-y-auto">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="font-semibold flex items-center gap-2"><ApartmentOutlined /> 组织架构</h3>
          <p className="text-xs text-muted-foreground mt-1">点击展开/收起，选择部门查看详情</p>
        </div>
        
        {/* 组织统计卡片 */}
        <div className="p-3 border-b bg-blue-50">
          <Row gutter={8}>
            <Col span={8}>
              <Statistic title="部门" value={orgStats.totalDepts} valueStyle={{ fontSize: 18 }} />
            </Col>
            <Col span={8}>
              <Statistic title="岗位" value={orgStats.totalPositions} valueStyle={{ fontSize: 18 }} />
            </Col>
            <Col span={8}>
              <Statistic title="员工" value={orgStats.totalEmployees} valueStyle={{ fontSize: 18, color: '#52c41a' }} />
            </Col>
          </Row>
        </div>
        
        <div className="py-2">
          {treeData.map(node => renderTreeNode(node))}
        </div>
      </div>
      
      {/* 右侧详情 */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* 穿透视图：岗位详情 */}
        {drillView === 'position' && selectedPosition ? (
          <div>
            {/* 面包屑 */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              <Button type="link" onClick={handleBackToDept} icon={<ArrowRightOutlined style={{ transform: 'rotate(180deg)' }} />}>
                返回
              </Button>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{selectedDept?.name}</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{selectedPosition.name}</span>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <UserOutlined /> {selectedPosition.name}
                  <Tag color="blue">岗位</Tag>
                </h2>
                <p className="text-muted-foreground">职级: {selectedPosition.level || '-'} | 编制: {selectedPosition.headcountActual || 0}/{selectedPosition.headcountPlan || 0}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setEditingItem(selectedPosition); setDialogType('position'); setDialogForm(selectedPosition); setShowDialog(true); }}>
                  编辑岗位
                </Button>
                <Button type="primary" onClick={() => navigate(`/personnel?dept=${selectedDept?.id}&position=${selectedPosition.id}`)}>
                  查看员工
                </Button>
              </div>
            </div>
            
            {/* 岗位员工列表 */}
            <Card title={`岗位员工 (${employees.filter(e => e.positionId === selectedPosition.id).length}人)`}>
              <Table
                dataSource={employees.filter(e => e.positionId === selectedPosition.id)}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                columns={[
                  { title: '姓名', dataIndex: 'name', key: 'name', render: (v, r) => <span className="font-medium">{v}</span> },
                  { title: '工号', dataIndex: 'employeeId', key: 'empNo' },
                  { title: '部门', dataIndex: 'department', key: 'dept' },
                  { title: '状态', dataIndex: 'status', key: 'status', render: (v) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '在职' : '离职'}</Tag> },
                  { title: '操作', key: 'action', render: (_, r) => (
                    <Button type="link" size="small" onClick={() => navigate(`/personnel?id=${r.id}`)}>查看详情</Button>
                  )},
                ]}
              />
            </Card>
          </div>
        ) : selectedDept ? (
          <div>
            {/* 面包屑 */}
            <div className="flex items-center gap-2 mb-4 text-sm">
              {getDeptPath(selectedDept.id).map((d, i) => (
                <React.Fragment key={d.id}>
                  {i > 0 && <span className="text-muted-foreground">/</span>}
                  <Button type="link" size="small" onClick={() => setSelectedDept(d)} className="p-0">
                    {d.name}
                  </Button>
                </React.Fragment>
              ))}
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  {selectedDept.id === 'company' ? <BankOutlined /> : <ApartmentOutlined />}
                  {selectedDept.name}
                </h2>
                {selectedDept.code && <p className="text-muted-foreground">编码: {selectedDept.code}</p>}
              </div>
              {selectedDept.id !== 'company' && (
                <Button onClick={() => handleEdit(selectedDept, 'department')}>
                  编辑部门
                </Button>
              )}
            </div>
            
            {/* 编制卡片 */}
            <Row gutter={16} className="mb-6">
              <Col span={8}>
                <Card size="small">
                  <Statistic title="计划编制" value={selectedDept.headcountPlan || 0} prefix={<TeamOutlined />} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="实际人数" value={selectedDept.headcountActual || 0} valueStyle={{ color: '#52c41a' }} />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small">
                  <Statistic title="编制差异" value={(selectedDept.headcountPlan || 0) - (selectedDept.headcountActual || 0)} 
                    valueStyle={{ color: (selectedDept.headcountPlan || 0) >= (selectedDept.headcountActual || 0) ? '#52c41a' : '#ff4d4f' }} />
                </Card>
              </Col>
            </Row>
            
            {/* 部门岗位 */}
            <Card title="岗位列表" extra={
              <Button type="primary" size="small" onClick={() => handleAdd('position')}>添加岗位</Button>
            } className="mb-4">
              <Table
                dataSource={positions.filter(p => p.departmentId === selectedDept.id)}
                rowKey="id"
                pagination={false}
                size="small"
                onRow={(record) => ({
                  onClick: () => handlePositionClick(record),
                  style: { cursor: 'pointer' },
                })}
                columns={[
                  { title: '岗位名称', dataIndex: 'name', key: 'name', render: (v) => <span className="font-medium flex items-center gap-2"><UserOutlined />{v}</span> },
                  { title: '职级', dataIndex: 'level', key: 'level' },
                  { title: '编制', key: 'headcount', render: (_, r) => `${r.headcountActual || 0}/${r.headcountPlan || 0}人` },
                  { title: '状态', dataIndex: 'isActive', key: 'active', render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '停用'}</Tag> },
                  { title: '操作', key: 'action', render: (_, r) => (
                    <Space>
                      <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); handleEdit(r, 'position'); }}>编辑</Button>
                      <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); handleDelete(r.id, 'positions'); }}>删除</Button>
                    </Space>
                  )},
                ]}
              />
              <Alert message="💡 点击岗位名称可穿透查看该岗位下的员工明细" type="info" showIcon className="mt-2" />
            </Card>
            
            {/* 部门员工 */}
            <Card title={`部门员工 (${employees.filter(e => e.deptId === selectedDept.id).length}人)`} extra={
              <Button type="link" onClick={() => navigate(`/personnel?dept=${selectedDept.id}`)}>查看全部</Button>
            }>
              <Table
                dataSource={employees.filter(e => e.deptId === selectedDept.id).slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: '姓名', dataIndex: 'name', key: 'name', render: (v) => <span className="font-medium">{v}</span> },
                  { title: '工号', dataIndex: 'employeeId', key: 'empNo' },
                  { title: '职位', dataIndex: 'position', key: 'position' },
                  { title: '状态', dataIndex: 'status', key: 'status', render: (v) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '在职' : '离职'}</Tag> },
                  { title: '操作', key: 'action', render: (_, r) => (
                    <Button type="link" size="small" onClick={() => navigate(`/personnel?id=${r.id}`)}>详情</Button>
                  )},
                ]}
              />
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <p className="text-4xl mb-4">🏢</p>
              <p>请在左侧选择部门查看详情</p>
              <p className="text-sm mt-2">点击岗位名称可穿透查看员工明细</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDepartmentsTable = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">部门管理</h2>
        <button onClick={() => handleAdd('department')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          新增部门
        </button>
      </div>
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">部门名称</th>
              <th className="p-3 text-left">编码</th>
              <th className="p-3 text-left">上级部门</th>
              <th className="p-3 text-center">层级</th>
              <th className="p-3 text-center">计划编制</th>
              <th className="p-3 text-center">实际人数</th>
              <th className="p-3 text-center">状态</th>
              <th className="p-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {departments.sort((a, b) => (a.level || 0) - (b.level || 0)).map(dept => (
              <tr key={dept.id} className="hover:bg-accent/30">
                <td className="p-3 font-medium" style={{ paddingLeft: `${(dept.level || 1) * 16}px` }}>
                  {dept.name}
                </td>
                <td className="p-3 text-sm">{dept.code || '-'}</td>
                <td className="p-3 text-sm">
                  {departments.find(d => d.id === dept.parentId)?.name || '-'}
                </td>
                <td className="p-3 text-center">{dept.level}</td>
                <td className="p-3 text-center">{dept.headcountPlan || 0}</td>
                <td className="p-3 text-center">{dept.headcountActual || 0}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${dept.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {dept.isActive ? '启用' : '停用'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleEdit(dept, 'department')} className="text-primary hover:underline mr-1">编辑</button>
                    <button onClick={() => handleTransfer(dept)} className="text-blue-600 hover:underline mr-1" title="划转到其他部门">划转</button>
                    <button onClick={() => handleMergeInit(dept)} className="text-purple-600 hover:underline mr-1" title="合并到本部门">合并</button>
                    <button onClick={() => handleSort(dept)} className="text-orange-600 hover:underline mr-1" title="调整显示顺序">调序</button>
                    <button onClick={() => handleDelete(dept.id, 'departments')} className="text-destructive hover:underline">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPositionsTable = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">岗位管理</h2>
        <button onClick={() => handleAdd('position')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          新增岗位
        </button>
      </div>
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">岗位名称</th>
              <th className="p-3 text-left">所属部门</th>
              <th className="p-3 text-center">职级等级</th>
              <th className="p-3 text-center">计划编制</th>
              <th className="p-3 text-center">实际人数</th>
              <th className="p-3 text-center">状态</th>
              <th className="p-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {positions.map(pos => (
              <tr key={pos.id} className="hover:bg-accent/30">
                <td className="p-3 font-medium">{pos.name}</td>
                <td className="p-3 text-sm">
                  {departments.find(d => d.id === pos.departmentId)?.name || '-'}
                </td>
                <td className="p-3 text-center">{pos.level || '-'}</td>
                <td className="p-3 text-center">{pos.headcountPlan || 0}</td>
                <td className="p-3 text-center">{pos.headcountActual || 0}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${pos.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {pos.isActive ? '启用' : '停用'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => handleEdit(pos, 'position')} className="text-primary hover:underline mr-2">编辑</button>
                  <button onClick={() => handleDelete(pos.id, 'positions')} className="text-destructive hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRanksTable = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">职级体系</h2>
        <button onClick={() => handleAdd('rank')} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          新增职级
        </button>
      </div>
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">职级名称</th>
              <th className="p-3 text-center">等级</th>
              <th className="p-3 text-right">基本工资</th>
              <th className="p-3 text-right">岗位工资</th>
              <th className="p-3 text-left">薪资范围</th>
              <th className="p-3 text-center">状态</th>
              <th className="p-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ranks.sort((a, b) => (a.level || 0) - (b.level || 0)).map(rank => (
              <tr key={rank.id} className="hover:bg-accent/30">
                <td className="p-3 font-medium">{rank.name}</td>
                <td className="p-3 text-center">{rank.level}</td>
                <td className="p-3 text-right">{(rank.baseSalary || 0).toLocaleString()}</td>
                <td className="p-3 text-right">{(rank.positionSalary || 0).toLocaleString()}</td>
                <td className="p-3 text-sm">{rank.salaryRange || '-'}</td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${rank.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {rank.isActive ? '启用' : '停用'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => handleEdit(rank, 'rank')} className="text-primary hover:underline mr-2">编辑</button>
                  <button onClick={() => handleDelete(rank.id, 'ranks')} className="text-destructive hover:underline">删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHeadcountReport = () => {
    // 计算编制汇总
    const deptStats = departments.map(dept => {
      const actualCount = employees.filter(e => e.deptId === dept.id && e.status === 'active').length;
      const posCount = positions.filter(p => p.departmentId === dept.id).length;
      return {
        ...dept,
        actualCount,
        posCount,
        variance: (dept.headcountPlan || 0) - actualCount,
        fillRate: dept.headcountPlan ? Math.round(actualCount / dept.headcountPlan * 100) : 0
      };
    });

    // 快速更新编制
    const handleQuickUpdateHeadcount = async (type: 'department' | 'position', id: string, value: number) => {
      const table = type === 'department' ? 'departments' : 'positions';
      try {
        await fetch(`/api/${table}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ headcountPlan: value })
        });
        loadData();
      } catch (e) {
        console.error('更新编制失败:', e);
      }
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">编制管理</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleAdd('department')}
              className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              新增部门编制
            </button>
            <button
              onClick={() => handleAdd('position')}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-accent"
            >
              新增岗位编制
            </button>
          </div>
        </div>
        
        {/* 汇总卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">总计划编制</p>
            <p className="text-3xl font-bold">{departments.reduce((s, d) => s + (d.headcountPlan || 0), 0)}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">总实际人数</p>
            <p className="text-3xl font-bold text-green-600">{employees.filter(e => e.status === 'active').length}</p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">编制缺口</p>
            <p className="text-3xl font-bold text-orange-600">
              {departments.reduce((s, d) => s + (d.headcountPlan || 0), 0) - employees.filter(e => e.status === 'active').length}
            </p>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">平均满编率</p>
            <p className="text-3xl font-bold">
              {Math.round(employees.filter(e => e.status === 'active').length / departments.reduce((s, d) => s + (d.headcountPlan || 0), 0) * 100)}%
            </p>
          </div>
        </div>
        
        {/* 部门编制对比表 */}
        <div className="bg-card border rounded-lg overflow-hidden mb-6">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">部门编制对比</h3>
            <p className="text-xs text-muted-foreground">点击计划编制数字可快速修改</p>
          </div>
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">部门</th>
                <th className="p-3 text-center">岗位数</th>
                <th className="p-3 text-center">计划编制</th>
                <th className="p-3 text-center">实际人数</th>
                <th className="p-3 text-center">差异</th>
                <th className="p-3 text-center">满编率</th>
                <th className="p-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deptStats.sort((a, b) => (a.level || 0) - (b.level || 0)).map(stat => (
                <tr key={stat.id} className="hover:bg-accent/30">
                  <td className="p-3 font-medium" style={{ paddingLeft: `${(stat.level || 1) * 12}px` }}>
                    {stat.name}
                  </td>
                  <td className="p-3 text-center">{stat.posCount}</td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      value={stat.headcountPlan || 0}
                      onChange={(e) => handleQuickUpdateHeadcount('department', stat.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 text-center border rounded hover:border-primary focus:border-primary focus:outline-none"
                      title="直接修改计划编制"
                    />
                  </td>
                  <td className="p-3 text-center">{stat.actualCount}</td>
                  <td className={`p-3 text-center ${stat.variance > 0 ? 'text-orange-600' : stat.variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stat.variance > 0 ? `+${stat.variance}` : stat.variance}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${stat.fillRate >= 100 ? 'bg-green-500' : stat.fillRate >= 80 ? 'bg-blue-500' : 'bg-orange-500'}`}
                          style={{ width: `${Math.min(stat.fillRate, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm">{stat.fillRate}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleEdit(departments.find(d => d.id === stat.id)!, 'department')} 
                      className="text-primary hover:underline text-sm mr-2"
                    >
                      编辑
                    </button>
                    <button 
                      onClick={() => handleDelete(stat.id, 'departments')} 
                      className="text-destructive hover:underline text-sm"
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 岗位编制对比表 */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">岗位编制对比</h3>
            <p className="text-xs text-muted-foreground">点击计划编制数字可快速修改</p>
          </div>
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left">岗位</th>
                <th className="p-3 text-left">所属部门</th>
                <th className="p-3 text-center">计划编制</th>
                <th className="p-3 text-center">实际人数</th>
                <th className="p-3 text-center">差异</th>
                <th className="p-3 text-center">满编率</th>
                <th className="p-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {positions.map(pos => {
                const actualCount = employees.filter(e => e.positionId === pos.id && e.status === 'active').length;
                const variance = (pos.headcountPlan || 0) - actualCount;
                const fillRate = pos.headcountPlan ? Math.round(actualCount / pos.headcountPlan * 100) : 0;
                return (
                  <tr key={pos.id} className="hover:bg-accent/30">
                    <td className="p-3 font-medium">{pos.name}</td>
                    <td className="p-3 text-sm">{departments.find(d => d.id === pos.departmentId)?.name || '-'}</td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        value={pos.headcountPlan || 0}
                        onChange={(e) => handleQuickUpdateHeadcount('position', pos.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center border rounded hover:border-primary focus:border-primary focus:outline-none"
                        title="直接修改计划编制"
                      />
                    </td>
                    <td className="p-3 text-center">{actualCount}</td>
                    <td className={`p-3 text-center ${variance > 0 ? 'text-orange-600' : variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {variance > 0 ? `+${variance}` : variance}
                    </td>
                    <td className="p-3 text-center">{fillRate}%</td>
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => handleEdit(pos, 'position')} 
                        className="text-primary hover:underline text-sm mr-2"
                      >
                        编辑
                      </button>
                      <button 
                        onClick={() => handleDelete(pos.id, 'positions')} 
                        className="text-destructive hover:underline text-sm"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDialog = () => {
    const title = dialogType === 'department' ? '部门' : dialogType === 'position' ? '岗位' : '职级';
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">{editingItem ? `编辑${title}` : `新增${title}`}</h3>
            <button onClick={() => setShowDialog(false)} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>
          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {dialogType === 'department' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">部门名称 *</label>
                  <input
                    type="text"
                    value={dialogForm.name || ''}
                    onChange={e => setDialogForm({ ...dialogForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">部门编码</label>
                  <input
                    type="text"
                    value={dialogForm.code || ''}
                    onChange={e => setDialogForm({ ...dialogForm, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">上级部门</label>
                  <select
                    value={dialogForm.parentId || ''}
                    onChange={e => setDialogForm({ ...dialogForm, parentId: e.target.value || null })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">无（顶级部门）</option>
                    {departments.filter(d => d.id !== editingItem?.id).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">计划编制</label>
                    <input
                      type="number"
                      value={dialogForm.headcountPlan || 0}
                      onChange={e => setDialogForm({ ...dialogForm, headcountPlan: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">排序</label>
                    <input
                      type="number"
                      value={dialogForm.sortOrder || 0}
                      onChange={e => setDialogForm({ ...dialogForm, sortOrder: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dialogForm.isActive !== 0}
                    onChange={e => setDialogForm({ ...dialogForm, isActive: e.target.checked ? 1 : 0 })}
                    id="deptActive"
                  />
                  <label htmlFor="deptActive" className="text-sm">启用</label>
                </div>
              </>
            )}
            
            {dialogType === 'position' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">岗位名称 *</label>
                  <input
                    type="text"
                    value={dialogForm.name || ''}
                    onChange={e => setDialogForm({ ...dialogForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">所属部门 *</label>
                  <select
                    value={dialogForm.departmentId || ''}
                    onChange={e => setDialogForm({ ...dialogForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">请选择部门</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">职级等级</label>
                    <input
                      type="text"
                      value={dialogForm.level || ''}
                      onChange={e => setDialogForm({ ...dialogForm, level: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="如: P1-P3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">计划编制</label>
                    <input
                      type="number"
                      value={dialogForm.headcountPlan || 0}
                      onChange={e => setDialogForm({ ...dialogForm, headcountPlan: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dialogForm.isActive !== 0}
                    onChange={e => setDialogForm({ ...dialogForm, isActive: e.target.checked ? 1 : 0 })}
                    id="posActive"
                  />
                  <label htmlFor="posActive" className="text-sm">启用</label>
                </div>
              </>
            )}
            
            {dialogType === 'rank' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">职级名称 *</label>
                  <input
                    type="text"
                    value={dialogForm.name || ''}
                    onChange={e => setDialogForm({ ...dialogForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="如: P1-初级"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">等级 *</label>
                    <input
                      type="number"
                      value={dialogForm.level || 1}
                      onChange={e => setDialogForm({ ...dialogForm, level: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">薪资范围</label>
                    <input
                      type="text"
                      value={dialogForm.salaryRange || ''}
                      onChange={e => setDialogForm({ ...dialogForm, salaryRange: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="如: 8K-12K"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">基本工资</label>
                    <input
                      type="number"
                      value={dialogForm.baseSalary || 0}
                      onChange={e => setDialogForm({ ...dialogForm, baseSalary: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">岗位工资</label>
                    <input
                      type="number"
                      value={dialogForm.positionSalary || 0}
                      onChange={e => setDialogForm({ ...dialogForm, positionSalary: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">描述</label>
                  <textarea
                    value={dialogForm.description || ''}
                    onChange={e => setDialogForm({ ...dialogForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dialogForm.isActive !== 0}
                    onChange={e => setDialogForm({ ...dialogForm, isActive: e.target.checked ? 1 : 0 })}
                    id="rankActive"
                  />
                  <label htmlFor="rankActive" className="text-sm">启用</label>
                </div>
              </>
            )}
          </div>
          <div className="p-4 border-t flex justify-end gap-2">
            <button onClick={() => setShowDialog(false)} className="px-4 py-2 border rounded-lg hover:bg-accent">
              取消
            </button>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              保存
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== 部门划转Modal ====================
  const renderTransferModal = () => (
    <Modal
      title={<><SwapOutlined /> 部门划转 - {transferTarget?.name}</>}
      open={transferModalVisible}
      onCancel={() => setTransferModalVisible(false)}
      footer={null}
      width={500}
    >
      <div className="py-4">
        <Alert message={`将 "${transferTarget?.name}" 划转到其他上级部门`} type="info" showIcon className="mb-4" />
        
        <Form layout="vertical">
          <Form.Item label="选择目标上级部门" required>
            <Select
              placeholder="请选择目标上级部门"
              onChange={(value) => handleTransferSubmit(value)}
              size="large"
            >
              <Select.Option value={null}>设为顶级部门</Select.Option>
              {departments
                .filter(d => d.id !== transferTarget?.id && !departments.find(p => p.id === d.parentId))
                .map(d => (
                  <Select.Option key={d.id} value={d.id}>{d.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
        
        <Alert 
          message="划转说明" 
          description={
            <ul className="text-sm text-gray-600 list-disc ml-4">
              <li>划转后，该部门及其所有子部门将归属于新的上级部门</li>
              <li>该部门下的员工将自动跟随部门划转</li>
              <li>该部门的岗位将保持不变</li>
            </ul>
          } 
          type="warning" 
          showIcon 
          className="mt-4"
        />
      </div>
    </Modal>
  );

  // ==================== 部门合并Modal ====================
  const renderMergeModal = () => (
    <Modal
      title={<><MergeOutlined /> 部门合并</>}
      open={mergeModalVisible}
      onCancel={() => { setMergeModalVisible(false); setMergeSource([]); }}
      footer={null}
      width={600}
    >
      <div className="py-4">
        <Alert message="选择一个目标部门，然后将其他部门合并到该部门" type="info" showIcon className="mb-4" />
        
        <Row gutter={16}>
          <Col span={12}>
            <h4 className="font-medium mb-2">选择合并来源部门</h4>
            <div className="border rounded p-2 max-h-60 overflow-y-auto">
              {departments.filter(d => !mergeSource.find(s => s.id === d.id)).map(d => (
                <div 
                  key={d.id} 
                  className="p-2 hover:bg-blue-50 cursor-pointer rounded flex justify-between items-center"
                  onClick={() => handleMergeAddDept(d)}
                >
                  <span>{d.name}</span>
                  <Tag>{employees.filter(e => e.deptId === d.id).length}人</Tag>
                </div>
              ))}
            </div>
          </Col>
          <Col span={12}>
            <h4 className="font-medium mb-2">已选择的合并部门</h4>
            <div className="border rounded p-2 max-h-60 overflow-y-auto">
              {mergeSource.length === 0 ? (
                <div className="text-gray-400 text-center py-4">请从左侧选择部门</div>
              ) : mergeSource.map(d => (
                <Tag 
                  key={d.id} 
                  closable 
                  onClose={() => handleMergeRemove(d.id)}
                  color="purple"
                  className="m-1"
                >
                  {d.name} ({employees.filter(e => e.deptId === d.id).length}人)
                </Tag>
              ))}
            </div>
          </Col>
        </Row>
        
        <Divider>合并设置</Divider>
        
        <Form layout="vertical">
          <Form.Item label="合并后目标部门" required>
            <Select
              placeholder="选择保留的目标部门"
              onChange={(value) => setMergeSource([mergeSource.find(s => s.id === value) || mergeSource[0]])}
              size="large"
            >
              {mergeSource.map(d => (
                <Select.Option key={d.id} value={d.id}>
                  {d.name} (将作为合并后部门)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="合并后部门名称（可选）">
            <Input 
              placeholder="留空则使用目标部门原名称" 
              onChange={(e) => {}} 
            />
          </Form.Item>
        </Form>
        
        <Alert 
          message="合并说明" 
          description={
            <ul className="text-sm text-gray-600 list-disc ml-4">
              <li>被合并部门的员工将转移到目标部门</li>
              <li>被合并部门的子部门将变为目标部门的子部门</li>
              <li>被合并部门将被删除</li>
              <li>建议先备份数据</li>
            </ul>
          } 
          type="warning" 
          showIcon 
        />
        
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => { setMergeModalVisible(false); setMergeSource([]); }}>取消</Button>
          <Button 
            type="primary" 
            icon={<MergeOutlined />}
            disabled={mergeSource.length < 2}
            onClick={() => handleMergeSubmit(mergeSource[0]?.id, '')}
          >
            确认合并
          </Button>
        </div>
      </div>
    </Modal>
  );

  // ==================== 部门调序Modal ====================
  const renderSortModal = () => (
    <Modal
      title={<><SortAscendingOutlined /> 部门排序</>}
      open={sortModalVisible}
      onCancel={() => setSortModalVisible(false)}
      footer={null}
      width={500}
    >
      <div className="py-4">
        <Alert message="拖动部门卡片调整同级部门的显示顺序" type="info" showIcon className="mb-4" />
        
        <div className="space-y-2">
          {siblingDepts.map((dept, index) => (
            <div 
              key={dept.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-white hover:bg-blue-50 cursor-move"
            >
              <SortAscendingOutlined className="text-gray-400" />
              <span className="w-8 text-center bg-blue-100 text-blue-600 rounded font-bold">{index + 1}</span>
              <span className="flex-1 font-medium">{dept.name}</span>
              <Tag>{employees.filter(e => e.deptId === dept.id).length}人</Tag>
            </div>
          ))}
        </div>
        
        <Alert 
          message="排序说明" 
          description="序号将作为部门在同级中的显示顺序，数字越小显示越靠前" 
          type="warning" 
          showIcon 
          className="mt-4"
        />
        
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setSortModalVisible(false)}>取消</Button>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleSortSubmit(siblingDepts)}>
            保存排序
          </Button>
        </div>
      </div>
    </Modal>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'orgchart', label: '组织架构图', icon: '🏢' },
    { key: 'departments', label: '部门管理', icon: '📁' },
    { key: 'positions', label: '岗位管理', icon: '👤' },
    { key: 'ranks', label: '职级体系', icon: '📊' },
    { key: 'headcount', label: '编制管理', icon: '📈' }
  ];

  return (
    <div className="p-6">
      {/* Tab导航 */}
      <div className="border-b mb-6">
        <div className="flex gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab内容 */}
      {activeTab === 'orgchart' && renderOrgChart()}
      {activeTab === 'departments' && renderDepartmentsTable()}
      {activeTab === 'positions' && renderPositionsTable()}
      {activeTab === 'ranks' && renderRanksTable()}
      {activeTab === 'headcount' && renderHeadcountReport()}
      
      {/* 弹窗 */}
      {showDialog && renderDialog()}
      
      {/* 部门划转Modal */}
      {renderTransferModal()}
      
      {/* 部门合并Modal */}
      {renderMergeModal()}
      
      {/* 部门排序Modal */}
      {renderSortModal()}
    </div>
  );
}
