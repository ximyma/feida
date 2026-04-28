/**
 * 可视化工作流设计器组件
 * 支持拖拽添加节点、连接线、条件分支、并行网关
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, Modal, Form, Input, Select, Tabs, Table, Tag, Space, message, Drawer, Descriptions, Steps, Tooltip, Divider, Popconfirm, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SaveOutlined, SettingOutlined, NodeExpandOutlined, PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, UserOutlined, SwapOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// 节点类型定义
interface WFNode {
  id: string;
  name: string;
  type: 'start' | 'task' | 'gateway' | 'end';
  gatewayType?: 'exclusive' | 'parallel' | 'inclusive';
  x: number;
  y: number;
  assigneeType?: 'role' | 'user' | 'initiator';
  assigneeExpr?: string;
  assigneeId?: string;
  assigneeName?: string;
  timeoutHours?: number;
  actions?: string[];
  [key: string]: any;
}

interface WFEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  conditionExpr?: string;
  isDefault?: boolean;
}

interface Workflow {
  id?: string;
  name: string;
  code: string;
  description?: string;
  nodes: WFNode[];
  edges: WFEdge[];
}

const NODE_TYPES = [
  { type: 'start', label: '开始节点', color: '#52c41a', icon: '▶' },
  { type: 'end', label: '结束节点', color: '#ff4d4f', icon: '■' },
  { type: 'task', label: '审批任务', color: '#1890ff', icon: '□' },
  { type: 'gateway', label: '条件网关', color: '#722ed1', icon: '◇' },
];

const ASSIGNEE_OPTIONS = [
  { value: 'initiator', label: '发起人本人' },
  { value: 'role:dept_manager', label: '直属主管' },
  { value: 'role:hr_admin', label: 'HR管理员' },
  { value: 'role:hr_staff', label: 'HR专员' },
  { value: 'role:finance', label: '财务人员' },
  { value: 'user', label: '指定人员' },
];

export default function WorkflowDesigner() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [editModal, setEditModal] = useState(false);
  const [editingNode, setEditingNode] = useState<WFNode | null>(null);
  const [nodeModal, setNodeModal] = useState(false);
  const [edgeModal, setEdgeModal] = useState(false);
  const [editingEdge, setEditingEdge] = useState<WFEdge | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [nodeForm] = Form.useForm();
  const [edgeForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('designer');
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<WFNode | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{ from: string; mouseX: number; mouseY: number } | null>(null);

  // 加载工作流列表
  const loadWorkflows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/workflows');
      const json = await res.json();
      if (json.success) {
        setWorkflows(json.data.map((w: any) => ({
          ...w,
          nodes: JSON.parse(w.nodes || '[]'),
          edges: JSON.parse(w.edges || '[]'),
        })));
      }
    } catch {}
    setLoading(false);
  }, []);

  const loadUsersAndRoles = useCallback(async () => {
    try {
      const [uRes, rRes] = await Promise.all([
        fetch('/api/workflow/users'),
        fetch('/api/workflow/roles'),
      ]);
      const uJson = await uRes.json();
      const rJson = await rRes.json();
      if (uJson.success) setUsers(uJson.data);
      if (rJson.success) setRoles(rJson.data);
    } catch {}
  }, []);

  useEffect(() => {
    loadWorkflows();
    loadUsersAndRoles();
  }, [loadWorkflows, loadUsersAndRoles]);

  // 创建新工作流
  const handleCreate = () => {
    const newWorkflow: Workflow = {
      name: '新工作流',
      code: `wf_${Date.now()}`,
      description: '',
      nodes: [
        { id: 'start', name: '开始', type: 'start', x: 100, y: 200 },
        { id: 'end', name: '结束', type: 'end', x: 600, y: 200 },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'end' },
      ],
    };
    setSelectedWorkflow(newWorkflow);
    setEditModal(true);
    form.setFieldsValue({ name: newWorkflow.name, code: newWorkflow.code, description: newWorkflow.description });
  };

  // 保存工作流
  const handleSave = async () => {
    if (!selectedWorkflow) return;
    try {
      const values = await form.validateFields();
      const workflow = { ...selectedWorkflow, ...values };

      const res = await fetch(`/api/${workflow.id ? `workflows/${workflow.id}` : 'workflows'}`, {
        method: workflow.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...workflow,
          nodes: JSON.stringify(workflow.nodes),
          edges: JSON.stringify(workflow.edges),
          status: 'published',
        }),
      });
      const json = await res.json();
      if (json.success) {
        message.success('保存成功');
        setEditModal(false);
        loadWorkflows();
        setSelectedWorkflow({ ...workflow, id: json.data?.id || workflow.id });
      } else {
        message.error(json.message || '保存失败');
      }
    } catch {}
  };

  // 添加节点
  const addNode = (type: string) => {
    if (!selectedWorkflow) return;
    const nodeMap: Record<string, Partial<WFNode>> = {
      task: { type: 'task', name: '审批任务', assigneeType: 'role', assigneeExpr: 'dept_manager', timeoutHours: 48, actions: ['approve', 'reject'] },
      gateway: { type: 'gateway', gatewayType: 'exclusive', name: '条件判断' },
    };
    const newNode: WFNode = {
      id: `node_${Date.now()}`,
      x: 300,
      y: 200,
      ...nodeMap[type],
    } as WFNode;

    setSelectedWorkflow({ ...selectedWorkflow, nodes: [...selectedWorkflow.nodes, newNode] });
    setEditingNode(newNode);
    setNodeForm.setFieldsValue({ name: newNode.name, assigneeType: newNode.assigneeType, assigneeExpr: newNode.assigneeExpr, timeoutHours: newNode.timeoutHours, gatewayType: newNode.gatewayType });
    setNodeModal(true);
  };

  // 打开节点编辑
  const openNodeEditor = (node: WFNode) => {
    setEditingNode(node);
    setNodeForm.setFieldsValue({
      name: node.name,
      type: node.type,
      gatewayType: node.gatewayType,
      assigneeType: node.assigneeType,
      assigneeExpr: node.assigneeExpr,
      assigneeId: node.assigneeId,
      assigneeName: node.assigneeName,
      timeoutHours: node.timeoutHours,
      actions: node.actions,
    });
    setNodeModal(true);
  };

  // 保存节点
  const handleSaveNode = () => {
    if (!selectedWorkflow || !editingNode) return;
    const values = nodeForm.getFieldsValue();
    const updatedNode = { ...editingNode, ...values };

    // 处理 assigneeType
    if (values.assigneeType?.startsWith('role:')) {
      updatedNode.assigneeExpr = values.assigneeType.replace('role:', '');
      updatedNode.assigneeType = 'role';
    }

    const nodes = selectedWorkflow.nodes.map(n => n.id === editingNode.id ? updatedNode : n);
    setSelectedWorkflow({ ...selectedWorkflow, nodes });
    setNodeModal(false);
    setEditingNode(null);
  };

  // 删除节点
  const deleteNode = (nodeId: string) => {
    if (!selectedWorkflow) return;
    const nodes = selectedWorkflow.nodes.filter(n => n.id !== nodeId);
    const edges = selectedWorkflow.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    setSelectedWorkflow({ ...selectedWorkflow, nodes, edges });
  };

  // 删除连线
  const deleteEdge = (edgeId: string) => {
    if (!selectedWorkflow) return;
    setSelectedWorkflow({ ...selectedWorkflow, edges: selectedWorkflow.edges.filter(e => e.id !== edgeId) });
  };

  // 打开连线编辑
  const openEdgeEditor = (edge: WFEdge) => {
    setEditingEdge(edge);
    setEdgeForm.setFieldsValue({ label: edge.label, conditionExpr: edge.conditionExpr, isDefault: edge.isDefault });
    setEdgeModal(true);
  };

  // 保存连线
  const handleSaveEdge = () => {
    if (!selectedWorkflow || !editingEdge) return;
    const values = edgeForm.getFieldsValue();
    const updatedEdge = { ...editingEdge, ...values };
    const edges = selectedWorkflow.edges.map(e => e.id === editingEdge.id ? updatedEdge : e);
    setSelectedWorkflow({ ...selectedWorkflow, edges });
    setEdgeModal(false);
    setEditingEdge(null);
  };

  // 节点拖拽
  const handleMouseDown = (e: React.MouseEvent, node: WFNode) => {
    if (node.type === 'start' || node.type === 'end') return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragging(node);
    setDragOffset({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current || !selectedWorkflow) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    const nodes = selectedWorkflow.nodes.map(n => n.id === dragging.id ? { ...n, x, y } : n);
    setSelectedWorkflow({ ...selectedWorkflow, nodes });
  };

  const handleMouseUp = () => { setDragging(null); };

  // 开始连线
  const handleNodeClick = (nodeId: string, e: React.MouseEvent) => {
    if (e.detail === 2) { // 双击
      const node = selectedWorkflow?.nodes.find(n => n.id === nodeId);
      if (node) openNodeEditor(node);
      return;
    }
    if (e.shiftKey && selectedWorkflow) {
      // 开始连线
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      setConnecting({ from: nodeId, mouseX: e.clientX - rect.left, mouseY: e.clientY - rect.top });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (connecting && selectedWorkflow) {
      // 取消连线
      setConnecting(null);
    }
  };

  const handleConnectEnd = (targetNodeId: string) => {
    if (!connecting || !selectedWorkflow || connecting.from === targetNodeId) {
      setConnecting(null);
      return;
    }
    // 检查是否已存在这条连线
    const exists = selectedWorkflow.edges.some(e => e.source === connecting.from && e.target === targetNodeId);
    if (exists) {
      setConnecting(null);
      return;
    }
    const newEdge: WFEdge = {
      id: `e_${Date.now()}`,
      source: connecting.from,
      target: targetNodeId,
    };
    setSelectedWorkflow({ ...selectedWorkflow, edges: [...selectedWorkflow.edges, newEdge] });
    setConnecting(null);
  };

  // 渲染节点
  const renderNode = (node: WFNode) => {
    const nodeType = NODE_TYPES.find(t => t.type === node.type);
    const isSelected = dragging?.id === node.id;
    const nodeStyle: React.CSSProperties = {
      position: 'absolute',
      left: node.x,
      top: node.y,
      width: node.type === 'gateway' ? 80 : 120,
      height: node.type === 'gateway' ? 60 : 44,
      borderRadius: node.type === 'gateway' ? '50%' : 8,
      background: nodeType?.color,
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: node.type === 'start' || node.type === 'end' ? 'default' : 'move',
      fontSize: 12,
      fontWeight: 500,
      boxShadow: isSelected ? '0 0 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
      border: isSelected ? '2px solid #fff' : '2px solid transparent',
      userSelect: 'none',
      zIndex: isSelected ? 10 : 1,
      transition: 'box-shadow 0.2s',
      padding: node.type === 'gateway' ? 0 : '0 8px',
    };

    return (
      <div
        key={node.id}
        style={nodeStyle}
        onMouseDown={(e) => handleMouseDown(e as any, node)}
        onClick={(e) => handleNodeClick(node.id, e as any)}
        onMouseUp={() => node.type === 'gateway' ? null : handleConnectEnd(node.id)}
        title={node.name + (node.assigneeExpr ? `\n审批人: ${node.assigneeExpr}` : '')}
      >
        <span style={{ fontSize: 16 }}>{nodeType?.icon}</span>
        <span style={{ fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: node.type === 'gateway' ? 60 : 100 }}>{node.name}</span>
        {node.gatewayType && <span style={{ fontSize: 9, opacity: 0.8 }}>{node.gatewayType === 'exclusive' ? 'XOR' : 'AND'}</span>}
      </div>
    );
  };

  // 渲染连线
  const renderEdge = (edge: WFEdge) => {
    const source = selectedWorkflow?.nodes.find(n => n.id === edge.source);
    const target = selectedWorkflow?.nodes.find(n => n.id === edge.target);
    if (!source || !target) return null;

    const sx = source.x + (source.type === 'gateway' ? 40 : 60);
    const sy = source.y + (source.type === 'gateway' ? 30 : 22);
    const tx = target.x + (target.type === 'gateway' ? 40 : 60);
    const ty = target.y + (target.type === 'gateway' ? 30 : 22);

    const midX = (sx + tx) / 2;
    const midY = (sy + ty) / 2;
    const path = `M ${sx} ${sy} Q ${midX} ${sy} ${midX} ${midY} T ${tx} ${ty}`;

    return (
      <g key={edge.id}>
        <path
          d={path}
          stroke="#1890ff"
          strokeWidth={2}
          fill="none"
          markerEnd="url(#arrowhead)"
          style={{ cursor: 'pointer' }}
          onClick={() => openEdgeEditor(edge)}
        />
        {edge.label && (
          <text
            x={midX}
            y={midY - 8}
            textAnchor="middle"
            fill="#666"
            fontSize={11}
            style={{ pointerEvents: 'none' }}
          >
            {edge.label}
          </text>
        )}
      </g>
    );
  };

  if (!selectedWorkflow) {
    // 列表视图
    return (
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2>🛠️ 工作流设计器</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建工作流</Button>
        </div>
        <Table
          dataSource={workflows}
          loading={loading}
          rowKey="id"
          columns={[
            { title: '工作流名称', dataIndex: 'name', key: 'name' },
            { title: '编码', dataIndex: 'code', key: 'code' },
            { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
            { title: '状态', dataIndex: 'status', key: 'status',
              render: (s: string) => <Tag color={s === 'published' ? 'green' : 'default'}>{s === 'published' ? '已发布' : '草稿'}</Tag> },
            { title: '节点数', key: 'nodeCount', render: (_: any, r: any) => JSON.parse(r.nodes || '[]').length },
            { title: '默认', dataIndex: 'isDefault', key: 'isDefault', render: (v: number) => v ? <Tag color="blue">默认</Tag> : null },
            {
              title: '操作', key: 'action', render: (_: any, r: any) => (
                <Space>
                  <Button size="small" icon={<EditOutlined />} onClick={() => {
                    setSelectedWorkflow({ ...r });
                    setEditModal(true);
                    form.setFieldsValue({ name: r.name, code: r.code, description: r.description });
                  }}>编辑</Button>
                  <Button size="small" icon={<SettingOutlined />} type="link" onClick={() => {
                    setSelectedWorkflow(r);
                    setActiveTab('designer');
                  }}>设计</Button>
                </Space>
              )
            },
          ]}
        />
        <Modal title="编辑工作流" open={editModal} onOk={handleSave} onCancel={() => setEditModal(false)} width={500}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="工作流名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="code" label="编码" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    );
  }

  // 设计器视图
  return (
    <div style={{ padding: 0, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 8, alignItems: 'center', background: '#fafafa' }}>
        <Button size="small" onClick={() => setSelectedWorkflow(null)}>← 返回列表</Button>
        <Divider type="vertical" />
        <span style={{ fontWeight: 600 }}>{selectedWorkflow.name}</span>
        <Divider type="vertical" />
        <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('task')}>审批任务</Button>
        <Button size="small" icon={<PlusOutlined />} onClick={() => addNode('gateway')}>条件网关</Button>
        <Divider type="vertical" />
        <Tooltip title="按住Shift双击节点开始连线">
          <span style={{ fontSize: 11, color: '#999' }}>💡 Shift+双击连线</span>
        </Tooltip>
        <div style={{ flex: 1 }} />
        <Button type="primary" size="small" icon={<SaveOutlined />} onClick={() => {
          form.setFieldsValue({ name: selectedWorkflow.name, code: selectedWorkflow.code, description: selectedWorkflow.description });
          setEditModal(true);
        }}>保存</Button>
      </div>

      {/* 画布 */}
      <div
        ref={canvasRef}
        style={{
          flex: 1, position: 'relative', overflow: 'auto',
          background: '#f5f5f5',
          backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
        onMouseMove={handleMouseMove as any}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {/* SVG 连线层 */}
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#1890ff" />
            </marker>
          </defs>
          <g style={{ pointerEvents: 'auto' }}>
            {selectedWorkflow.edges.map(renderEdge)}
          </g>
          {/* 正在连线的预览 */}
          {connecting && (
            <line
              x1={selectedWorkflow.nodes.find(n => n.id === connecting.from)!?.x + 60}
              y1={selectedWorkflow.nodes.find(n => n.id === connecting.from)!?.y + 22}
              x2={connecting.mouseX}
              y2={connecting.mouseY}
              stroke="#1890ff"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
          )}
        </svg>

        {/* 节点层 */}
        {selectedWorkflow.nodes.map(renderNode)}

        {/* 节点右键菜单（简单实现） */}
        {editingNode && (
          <div style={{
            position: 'absolute', right: 16, top: 16, width: 300,
            background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>节点: {editingNode.name}</div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button block size="small" icon={<EditOutlined />} onClick={() => {
                setNodeForm.setFieldsValue({
                  name: editingNode.name,
                  type: editingNode.type,
                  gatewayType: editingNode.gatewayType,
                  assigneeType: editingNode.assigneeType === 'role' ? `role:${editingNode.assigneeExpr}` : editingNode.assigneeType,
                  assigneeExpr: editingNode.assigneeExpr,
                  timeoutHours: editingNode.timeoutHours,
                });
                setNodeModal(true);
              }}>编辑属性</Button>
              {editingNode.type !== 'start' && editingNode.type !== 'end' && (
                <Popconfirm title="删除此节点？" onConfirm={() => { deleteNode(editingNode.id); setEditingNode(null); }}>
                  <Button block size="small" danger icon={<DeleteOutlined />}>删除节点</Button>
                </Popconfirm>
              )}
              <Button block size="small" onClick={() => setEditingNode(null)}>关闭</Button>
            </Space>
          </div>
        )}
      </div>

      {/* 节点编辑弹窗 */}
      <Modal title="编辑节点属性" open={nodeModal} onOk={handleSaveNode} onCancel={() => setNodeModal(false)} width={500}>
        <Form form={nodeForm} layout="vertical">
          <Form.Item name="name" label="节点名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {editingNode?.type === 'gateway' && (
            <Form.Item name="gatewayType" label="网关类型">
              <Select>
                <Select.Option value="exclusive">排他网关（XOR）- 满足条件走一条</Select.Option>
                <Select.Option value="parallel">并行网关（AND）- 多条同时执行</Select.Option>
              </Select>
            </Form.Item>
          )}
          {editingNode?.type === 'task' && (
            <>
              <Form.Item name="assigneeType" label="审批人类型">
                <Select>
                  {ASSIGNEE_OPTIONS.map(o => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
                </Select>
              </Form.Item>
              <Form.Item name="timeoutHours" label="审批时限（小时）">
                <Input type="number" placeholder="0 表示不限制" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>

      {/* 连线编辑弹窗 */}
      <Modal title="编辑连线" open={edgeModal} onOk={handleSaveEdge} onCancel={() => setEdgeModal(false)} width={500}>
        <Form form={edgeForm} layout="vertical">
          <Form.Item name="label" label="连线标签（如：同意/拒绝）">
            <Input placeholder="填写后显示在连线上" />
          </Form.Item>
          <Form.Item name="conditionExpr" label="条件表达式" extra="示例：formData.amount >= 5000">
            <Input placeholder="满足此条件时走此路径，如：formData.days > 3" />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <label><input type="checkbox" /> 默认路径（无匹配时走此路径）</label>
          </Form.Item>
          <Button danger block icon={<DeleteOutlined />}
            onClick={() => { deleteEdge(editingEdge!.id); setEdgeModal(false); }}>
            删除此连线
          </Button>
        </Form>
      </Modal>

      {/* 工作流基本信息弹窗 */}
      <Modal title="工作流属性" open={editModal} onOk={handleSave} onCancel={() => setEditModal(false)} width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="工作流名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
