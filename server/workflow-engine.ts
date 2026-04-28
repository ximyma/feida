/**
 * 增强版审批流程引擎 v2.0
 * 支持多步骤、条件分支、并行网关、会签、自定义表单
 *
 * 核心概念：
 * - Node（节点）: start | task | gateway | end
 * - Gateway（网关）: exclusive(XOR) 条件选择 | parallel(AND) 并行执行 | inclusive(OR) 包容条件
 * - Edge（连接线）: from -> to，可带条件表达式
 * - FormConfig（表单配置）: 自定义表单字段定义
 */

import { DatabaseService } from './modules/database/database.service';

let db: DatabaseService;

// 注入数据库实例
export function initWorkflowEngine(database: DatabaseService) {
  db = database;
  ensureTables();
  seedDefaultWorkflows();
}

// ============================================================
// 数据库表初始化
// ============================================================
function ensureTables() {
  const sql = db.query(`
    SELECT name FROM sqlite_master WHERE type='table' AND name='workflow_definitions'
  `);
  if (sql.length > 0) return; // 已存在

  const statements = [
    `CREATE TABLE IF NOT EXISTS workflow_definitions (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT UNIQUE,
      description TEXT, version INTEGER DEFAULT 1,
      status TEXT DEFAULT 'draft', isDefault INTEGER DEFAULT 0,
      formConfigId TEXT, nodes TEXT DEFAULT '[]',
      edges TEXT DEFAULT '[]', variables TEXT DEFAULT '{}',
      createdBy TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP, updatedAt TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS workflow_form_configs (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, code TEXT UNIQUE,
      module TEXT, fields TEXT DEFAULT '[]',
      layout TEXT DEFAULT 'default', createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS workflow_instances (
      id TEXT PRIMARY KEY, definitionId TEXT NOT NULL,
      businessId TEXT NOT NULL, businessType TEXT NOT NULL,
      title TEXT NOT NULL, applicantId TEXT NOT NULL, applicantName TEXT,
      department TEXT, status TEXT DEFAULT 'running',
      currentNodeId TEXT, formData TEXT DEFAULT '{}',
      variables TEXT DEFAULT '{}', businessData TEXT DEFAULT '{}',
      startedAt TEXT, completedAt TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS workflow_instance_nodes (
      id TEXT PRIMARY KEY, instanceId TEXT NOT NULL,
      nodeId TEXT NOT NULL, nodeName TEXT,
      nodeType TEXT,
      status TEXT DEFAULT 'pending',
      assigneeId TEXT, assigneeName TEXT,
      assigneeType TEXT,
      actions TEXT DEFAULT '[]',
      formSnapshot TEXT, comment TEXT,
      startedAt TEXT, completedAt TEXT,
      dueDate TEXT, createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS workflow_node_assignees (
      id TEXT PRIMARY KEY, instanceId TEXT NOT NULL,
      nodeId TEXT NOT NULL,
      assigneeType TEXT NOT NULL,
      assigneeId TEXT, assigneeName TEXT,
      assigneeMode TEXT DEFAULT 'single',
      signType TEXT DEFAULT 'all',
      signPercent INTEGER DEFAULT 100,
      required INTEGER DEFAULT 1
    )`,

    `CREATE TABLE IF NOT EXISTS workflow_comments (
      id TEXT PRIMARY KEY, instanceId TEXT NOT NULL,
      nodeId TEXT, userId TEXT, userName TEXT,
      content TEXT, type TEXT DEFAULT 'normal',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE INDEX IF NOT EXISTS idx_wf_instances_status ON workflow_instances(status)`,
    `CREATE INDEX IF NOT EXISTS idx_wf_instances_biztype ON workflow_instances(businessType)`,
    `CREATE INDEX IF NOT EXISTS idx_wf_instancenode_instance ON workflow_instance_nodes(instanceId)`,
    `CREATE INDEX IF NOT EXISTS idx_wf_assignees_instance ON workflow_node_assignees(instanceId)`,
  ];

  for (const s of statements) {
    try { db.query(s); } catch {}
  }
}

// ============================================================
// 默认工作流模板
// ============================================================
function seedDefaultWorkflows() {
  const existing = db.query("SELECT COUNT(*) as c FROM workflow_definitions");
  if (existing[0]?.c > 0) return;

  // 1. 请假申请流程（3步：直属主管 → HR → 完成）
  createWorkflow({
    id: 'wf_leave',
    name: '请假申请流程',
    code: 'leave_approval',
    description: '员工请假申请，经直属主管审批后由HR复核',
    status: 'published',
    isDefault: 1,
    nodes: [
      { id: 'start', name: '开始', type: 'start', x: 100, y: 200 },
      { id: 'task_dept', name: '直属主管审批', type: 'task', x: 280, y: 200,
        assigneeType: 'role', assigneeExpr: 'dept_manager', timeoutHours: 72,
        actions: ['approve', 'reject', 'delegate'] },
      { id: 'task_hr', name: 'HR复核', type: 'task', x: 460, y: 200,
        assigneeType: 'role', assigneeExpr: 'hr_admin', timeoutHours: 48,
        actions: ['approve', 'reject'] },
      { id: 'end', name: '结束', type: 'end', x: 640, y: 200 },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'task_dept' },
      { id: 'e2', source: 'task_dept', target: 'task_hr', label: '同意' },
      { id: 'e3', source: 'task_dept', target: 'end', label: '拒绝', isDefault: false },
      { id: 'e4', source: 'task_hr', target: 'end' },
    ]
  });

  // 2. 离职申请流程（4步：主管 → HR → 部门负责人 → 结束）
  createWorkflow({
    id: 'wf_resignation',
    name: '离职申请流程',
    code: 'resignation_approval',
    description: '员工离职申请，需经直属主管、HR、部门负责人多级审批',
    status: 'published',
    isDefault: 1,
    nodes: [
      { id: 'start', name: '开始', type: 'start', x: 80, y: 200 },
      { id: 'task_mgr', name: '直属主管审批', type: 'task', x: 230, y: 200,
        assigneeType: 'role', assigneeExpr: 'dept_manager', timeoutHours: 72,
        actions: ['approve', 'reject'] },
      { id: 'task_hr', name: 'HR审批', type: 'task', x: 380, y: 200,
        assigneeType: 'role', assigneeExpr: 'hr_admin', timeoutHours: 48,
        actions: ['approve', 'reject'] },
      { id: 'task_director', name: '部门负责人审批', type: 'task', x: 530, y: 200,
        assigneeType: 'role', assigneeExpr: 'dept_director', timeoutHours: 72,
        actions: ['approve', 'reject'] },
      { id: 'end', name: '结束', type: 'end', x: 680, y: 200 },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'task_mgr' },
      { id: 'e2', source: 'task_mgr', target: 'task_hr' },
      { id: 'e3', source: 'task_mgr', target: 'end', label: '拒绝' },
      { id: 'e4', source: 'task_hr', target: 'task_director' },
      { id: 'e5', source: 'task_hr', target: 'end', label: '拒绝' },
      { id: 'e6', source: 'task_director', target: 'end' },
    ]
  });

  // 3. 加班申请流程（2步：主管审批 → 完成）
  createWorkflow({
    id: 'wf_overtime',
    name: '加班申请流程',
    code: 'overtime_approval',
    description: '员工加班申请，由直属主管审批',
    status: 'published',
    isDefault: 1,
    nodes: [
      { id: 'start', name: '开始', type: 'start', x: 100, y: 200 },
      { id: 'task_dept', name: '直属主管审批', type: 'task', x: 300, y: 200,
        assigneeType: 'role', assigneeExpr: 'dept_manager', timeoutHours: 48,
        actions: ['approve', 'reject'] },
      { id: 'end', name: '结束', type: 'end', x: 500, y: 200 },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'task_dept' },
      { id: 'e2', source: 'task_dept', target: 'end' },
      { id: 'e3', source: 'task_dept', target: 'end', label: '拒绝' },
    ]
  });

  // 4. 采购申请流程（带条件分支）
  createWorkflow({
    id: 'wf_purchase',
    name: '采购申请流程',
    code: 'purchase_approval',
    description: '采购申请，金额<5000主管审批，≥5000需加财务审批',
    status: 'published',
    isDefault: 0,
    nodes: [
      { id: 'start', name: '开始', type: 'start', x: 100, y: 200 },
      { id: 'task_apply', name: '申请人提交', type: 'task', x: 250, y: 200,
        assigneeType: 'initiator', timeoutHours: 0, actions: ['submit'] },
      { id: 'gw_amount', name: '金额判断', type: 'gateway', gatewayType: 'exclusive', x: 400, y: 200 },
      { id: 'task_small', name: '主管审批(小额)', type: 'task', x: 550, y: 120,
        assigneeType: 'role', assigneeExpr: 'dept_manager', timeoutHours: 48,
        actions: ['approve', 'reject'] },
      { id: 'task_large', name: '主管+财务审批', type: 'gateway', gatewayType: 'parallel', x: 550, y: 300 },
      { id: 'task_mgr', name: '部门主管', type: 'task', x: 700, y: 280,
        assigneeType: 'role', assigneeExpr: 'dept_manager', timeoutHours: 48,
        actions: ['approve', 'reject'] },
      { id: 'task_fin', name: '财务审批', type: 'task', x: 700, y: 340,
        assigneeType: 'role', assigneeExpr: 'finance', timeoutHours: 48,
        actions: ['approve', 'reject'] },
      { id: 'gw_merge', name: '合并节点', type: 'gateway', gatewayType: 'parallel', x: 850, y: 300 },
      { id: 'end', name: '结束', type: 'end', x: 1000, y: 200 },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'task_apply' },
      { id: 'e2', source: 'task_apply', target: 'gw_amount' },
      { id: 'e3', source: 'gw_amount', target: 'task_small',
        conditionExpr: 'formData.amount < 5000', label: '< 5000' },
      { id: 'e4', source: 'gw_amount', target: 'task_large',
        conditionExpr: 'formData.amount >= 5000', label: '≥ 5000' },
      { id: 'e5', source: 'task_small', target: 'end' },
      { id: 'e6', source: 'task_large', target: 'task_mgr' },
      { id: 'e7', source: 'task_large', target: 'task_fin' },
      { id: 'e8', source: 'task_mgr', target: 'gw_merge' },
      { id: 'e9', source: 'task_fin', target: 'gw_merge' },
      { id: 'e10', source: 'gw_merge', target: 'end' },
    ]
  });

  // 5. 转正申请流程
  createWorkflow({
    id: 'wf_regular',
    name: '转正申请流程',
    code: 'regular_approval',
    description: '试用期员工转正申请',
    status: 'published',
    isDefault: 1,
    nodes: [
      { id: 'start', name: '开始', type: 'start', x: 80, y: 200 },
      { id: 'task_self', name: '员工自评', type: 'task', x: 220, y: 200,
        assigneeType: 'initiator', timeoutHours: 168, actions: ['submit'] },
      { id: 'task_mgr', name: '直属主管评价', type: 'task', x: 360, y: 200,
        assigneeType: 'role', assigneeExpr: 'dept_manager', timeoutHours: 72,
        actions: ['approve', 'reject'] },
      { id: 'task_hr', name: 'HR复核', type: 'task', x: 500, y: 200,
        assigneeType: 'role', assigneeExpr: 'hr_admin', timeoutHours: 48,
        actions: ['approve', 'reject'] },
      { id: 'end', name: '结束', type: 'end', x: 640, y: 200 },
    ],
    edges: [
      { id: 'e1', source: 'start', target: 'task_self' },
      { id: 'e2', source: 'task_self', target: 'task_mgr' },
      { id: 'e3', source: 'task_mgr', target: 'task_hr' },
      { id: 'e4', source: 'task_mgr', target: 'end', label: '拒绝转正' },
      { id: 'e5', source: 'task_hr', target: 'end' },
    ]
  });

  console.log('[WorkflowEngine] 默认工作流模板已初始化');
}

// ============================================================
// 工作流定义 CRUD
// ============================================================
function createWorkflow(data: any) {
  const now = new Date().toISOString();
  const workflow = {
    id: data.id,
    name: data.name,
    code: data.code,
    description: data.description || '',
    version: 1,
    status: data.status || 'draft',
    isDefault: data.isDefault || 0,
    formConfigId: data.formConfigId || null,
    nodes: JSON.stringify(data.nodes || []),
    edges: JSON.stringify(data.edges || []),
    variables: JSON.stringify(data.variables || {}),
    createdBy: data.createdBy || 'system',
    createdAt: now,
    updatedAt: now,
  };

  db.query(`INSERT INTO workflow_definitions
    (id,name,code,description,version,status,isDefault,formConfigId,nodes,edges,variables,createdBy,createdAt,updatedAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
    workflow.id, workflow.name, workflow.code, workflow.description,
    workflow.version, workflow.status, workflow.isDefault, workflow.formConfigId,
    workflow.nodes, workflow.edges, workflow.variables, workflow.createdBy,
    workflow.createdAt, workflow.updatedAt
  ]);
  return workflow;
}

// ============================================================
// 启动工作流实例
// ============================================================
export function startWorkflow(params: {
  definitionId: string;
  businessId: string;
  businessType: string;
  title: string;
  applicantId: string;
  applicantName: string;
  department?: string;
  formData?: any;
  businessData?: any;
}): any {
  const def = db.query('SELECT * FROM workflow_definitions WHERE id = ?', [params.definitionId]);
  if (!def || def.length === 0) throw new Error('工作流定义不存在');
  const definition = def[0];

  const now = new Date().toISOString();
  const instanceId = `wfi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  // 解析节点和连接线
  const nodes = JSON.parse(definition.nodes || '[]');
  const edges = JSON.parse(definition.edges || '[]');

  // 找到开始节点
  const startNode = nodes.find((n: any) => n.type === 'start');
  if (!startNode) throw new Error('工作流定义缺少开始节点');

  // 找到开始节点的下一个节点（业务节点）
  const firstEdge = edges.find((e: any) => e.source === startNode.id);
  if (!firstEdge) throw new Error('工作流定义缺少连接线');

  const firstNodeId = firstEdge.target;
  const firstNode = nodes.find((n: any) => n.id === firstNodeId);
  if (!firstNode) throw new Error('工作流定义节点不存在');

  // 创建实例
  const instance = {
    id: instanceId,
    definitionId: params.definitionId,
    businessId: params.businessId,
    businessType: params.businessType,
    title: params.title,
    applicantId: params.applicantId,
    applicantName: params.applicantName,
    department: params.department || '',
    status: 'running',
    currentNodeId: firstNodeId,
    formData: JSON.stringify(params.formData || {}),
    variables: JSON.stringify(params.businessData || {}),
    businessData: JSON.stringify(params.businessData || {}),
    startedAt: now,
    completedAt: null,
    createdAt: now,
  };

  db.query(`INSERT INTO workflow_instances
    (id,definitionId,businessId,businessType,title,applicantId,applicantName,department,
     status,currentNodeId,formData,variables,businessData,startedAt,completedAt,createdAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
    instance.id, instance.definitionId, instance.businessId, instance.businessType,
    instance.title, instance.applicantId, instance.applicantName, instance.department,
    instance.status, instance.currentNodeId, instance.formData, instance.variables,
    instance.businessData, instance.startedAt, instance.completedAt, instance.createdAt
  ]);

  // 激活第一个业务节点
  activateNode(instanceId, firstNodeId, params.formData);

  return instance;
}

function activateNode(instanceId: string, nodeId: string, formData?: any) {
  const def = db.query('SELECT * FROM workflow_definitions WHERE id = (SELECT definitionId FROM workflow_instances WHERE id = ?)', [instanceId]);
  if (!def || def.length === 0) return;
  const definition = def[0];
  const nodes = JSON.parse(definition.nodes || '[]');
  const node = nodes.find((n: any) => n.id === nodeId);
  if (!node) return;

  const now = new Date().toISOString();
  const instanceNodeId = `win_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  // 计算审批人
  const assignees = resolveAssignees(instanceId, node, formData);

  // 计算截止日期
  const dueDate = node.timeoutHours
    ? new Date(Date.now() + node.timeoutHours * 3600000).toISOString()
    : null;

  // 创建节点实例
  db.query(`INSERT INTO workflow_instance_nodes
    (id,instanceId,nodeId,nodeName,nodeType,status,assigneeId,assigneeName,assigneeType,
     actions,formSnapshot,comment,startedAt,dueDate,createdAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
    instanceNodeId, instanceId, nodeId, node.name, node.type,
    node.type === 'task' ? 'pending' : 'approved',
    assignees[0]?.id || '', assignees[0]?.name || '',
    node.assigneeType || '',
    JSON.stringify(node.actions || ['approve', 'reject']),
    JSON.stringify(formData || {}), '', now, dueDate, now
  ]);

  // 保存多个审批人
  for (const a of assignees) {
    db.query(`INSERT INTO workflow_node_assignees
      (id,instanceId,nodeId,assigneeType,assigneeId,assigneeName,assigneeMode,required)
      VALUES (?,?,?,?,?,?,?,?)`, [
      `wfa_${Date.now()}_${Math.random().toString(36).slice(2, 4)}`,
      instanceId, nodeId, node.assigneeType || 'user',
      a.id, a.name, node.assigneeMode || 'single', 1
    ]);
  }

  // 更新实例当前节点
  db.query('UPDATE workflow_instances SET currentNodeId = ? WHERE id = ?', [nodeId, instanceId]);
}

function resolveAssignees(instanceId: string, node: any, formData?: any): Array<{id: string; name: string}> {
  if (!node.assigneeType || node.assigneeType === 'initiator') {
    const inst = db.query('SELECT applicantId, applicantName FROM workflow_instances WHERE id = ?', [instanceId]);
    if (inst && inst.length > 0) {
      return [{ id: inst[0].applicantId, name: inst[0].applicantName }];
    }
  }

  if (node.assigneeType === 'role') {
    // 通过角色查找用户
    const expr = node.assigneeExpr;
    const roleMap: Record<string, string> = {
      'dept_manager': 'role_dept_manager',
      'hr_admin': 'role_hr_admin',
      'hr_staff': 'role_hr_staff',
      'finance': 'role_finance',
      'dept_director': 'role_dept_manager',
    };
    const roleId = roleMap[expr] || expr;

    const users = db.query(`
      SELECT u.id, u.realName FROM users u,
      json_each(u.roleIds) as r WHERE json_extract(r.value, '$') = ?
      AND u.status = 'active' LIMIT 5
    `, [roleId]);
    if (users && users.length > 0) {
      return users.map((u: any) => ({ id: u.id, name: u.realName }));
    }
  }

  if (node.assigneeType === 'user' && node.assigneeId) {
    return [{ id: node.assigneeId, name: node.assigneeName || '' }];
  }

  // 默认返回系统管理员
  return [{ id: 'user_admin', name: '系统管理员' }];
}

// ============================================================
// 处理审批动作
// ============================================================
export function processNodeAction(params: {
  instanceId: string;
  nodeId: string;
  userId: string;
  userName: string;
  action: 'approve' | 'reject' | 'delegate' | 'addApprover';
  comment?: string;
  delegateUserId?: string;
  delegateUserName?: string;
}): any {
  const { instanceId, nodeId, userId, userName, action, comment, delegateUserId, delegateUserName } = params;

  const now = new Date().toISOString();

  // 更新节点实例状态
  let newStatus = 'approved';
  if (action === 'reject') newStatus = 'rejected';
  if (action === 'delegate') newStatus = 'delegated';

  db.query(`UPDATE workflow_instance_nodes
    SET status = ?, comment = ?, assigneeId = ?, assigneeName = ?, completedAt = ?
    WHERE instanceId = ? AND nodeId = ? AND status = 'pending'`,
    [newStatus, comment || '', userId, userName, now, instanceId, nodeId]);

  // 获取实例信息
  const instances = db.query('SELECT * FROM workflow_instances WHERE id = ?', [instanceId]);
  if (!instances || instances.length === 0) throw new Error('流程实例不存在');
  const instance = instances[0];

  if (instance.status !== 'running') throw new Error('流程已结束');

  if (action === 'reject') {
    // 拒绝 → 流程结束
    db.query(`UPDATE workflow_instances SET status = 'rejected', completedAt = ? WHERE id = ?`, [now, instanceId]);
    return { success: true, status: 'rejected', message: '审批已拒绝，流程结束' };
  }

  if (action === 'delegate') {
    // 委托 → 重新激活同一节点
    if (!delegateUserId) throw new Error('请选择委托人');
    db.query(`UPDATE workflow_instance_nodes
      SET status = 'pending', assigneeId = ?, assigneeName = ?, comment = ''
      WHERE instanceId = ? AND nodeId = ?`,
      [delegateUserId, delegateUserName, instanceId, nodeId]);
    return { success: true, status: 'pending', message: `已委托给 ${delegateUserName}` };
  }

  // 同意 → 找下一个节点
  const def = db.query('SELECT * FROM workflow_definitions WHERE id = ?', [instance.definitionId]);
  if (!def || def.length === 0) throw new Error('工作流定义不存在');
  const definition = def[0];
  const nodes = JSON.parse(definition.nodes || '[]');
  const edges = JSON.parse(definition.edges || '[]');
  const formData = JSON.parse(instance.formData || '{}');
  const businessData = JSON.parse(instance.businessData || '{}');

  // 查找从当前节点出发的连接线
  const outgoingEdges = edges.filter((e: any) => e.source === nodeId);

  if (outgoingEdges.length === 0) {
    // 无后续节点 → 流程结束
    db.query(`UPDATE workflow_instances SET status = 'completed', completedAt = ? WHERE id = ?`, [now, instanceId]);
    return { success: true, status: 'completed', message: '审批已通过，流程结束' };
  }

  // 判断网关类型，找下一个节点
  const currentNode = nodes.find((n: any) => n.id === nodeId);

  if (currentNode?.gatewayType === 'exclusive') {
    // 排他网关：按条件选一条
    const nextEdge = evaluateConditions(outgoingEdges, formData, businessData);
    if (nextEdge) {
      advanceToNode(instanceId, nextEdge.target, nodes, edges, formData, businessData);
    } else {
      db.query(`UPDATE workflow_instances SET status = 'completed', completedAt = ? WHERE id = ?`, [now, instanceId]);
    }
  } else if (currentNode?.gatewayType === 'parallel') {
    // 并行网关：检查是否所有并行路径都完成
    const parallelTargets = outgoingEdges.map((e: any) => e.target);
    const completedParallel = db.query(`
      SELECT COUNT(*) as c FROM workflow_instance_nodes
      WHERE instanceId = ? AND nodeId IN (${parallelTargets.map(() => '?').join(',')})
      AND status IN ('approved','skipped')
    `, [instanceId, ...parallelTargets]);

    if (completedParallel[0]?.c >= parallelTargets.length) {
      // 所有并行节点完成 → 找汇聚边
      const mergeEdges = edges.filter((e: any) => parallelTargets.includes(e.source));
      const mergeEdge = mergeEdges[0];
      if (mergeEdge) {
        advanceToNode(instanceId, mergeEdge.target, nodes, edges, formData, businessData);
      } else {
        db.query(`UPDATE workflow_instances SET status = 'completed', completedAt = ? WHERE id = ?`, [now, instanceId]);
      }
    }
  } else {
    // 普通顺序节点：走第一条边
    const nextEdge = outgoingEdges.find((e: any) => !e.label || e.label === '同意') || outgoingEdges[0];
    advanceToNode(instanceId, nextEdge.target, nodes, edges, formData, businessData);
  }

  return { success: true, status: 'running', message: '审批已提交' };
}

function evaluateConditions(edges: any[], formData: any, businessData: any): any | null {
  for (const edge of edges) {
    if (edge.isDefault || !edge.conditionExpr) continue;
    try {
      // 安全地评估条件表达式
      const expr = edge.conditionExpr
        .replace(/formData\./g, 'formDataProxy.')
        .replace(/businessData\./g, 'businessDataProxy.');
      const formDataProxy = { ...formData };
      const businessDataProxy = { ...businessData };
      if (new Function('formDataProxy', 'businessDataProxy', `return !!(${expr})`)(formDataProxy, businessDataProxy)) {
        return edge;
      }
    } catch {}
  }
  // 返回默认边
  return edges.find((e: any) => e.isDefault) || null;
}

function advanceToNode(instanceId: string, targetNodeId: string, nodes: any[], edges: any[], formData: any, businessData: any) {
  const targetNode = nodes.find((n: any) => n.id === targetNodeId);
  if (!targetNode) return;

  if (targetNode.type === 'end') {
    // 结束节点
    db.query(`UPDATE workflow_instances SET status = 'completed', currentNodeId = ?, completedAt = ? WHERE id = ?`,
      [targetNodeId, new Date().toISOString(), instanceId]);
    return;
  }

  if (targetNode.type === 'gateway') {
    // 网关节点：自动计算下一个
    const outgoing = edges.filter((e: any) => e.source === targetNodeId);
    if (targetNode.gatewayType === 'exclusive') {
      const nextEdge = evaluateConditions(outgoing, formData, businessData);
      if (nextEdge) {
        advanceToNode(instanceId, nextEdge.target, nodes, edges, formData, businessData);
      }
    } else if (targetNode.gatewayType === 'parallel') {
      // 并行网关：同时激活所有后续节点
      for (const edge of outgoing) {
        activateNode(instanceId, edge.target, formData);
      }
    }
    return;
  }

  // 普通任务节点：激活
  activateNode(instanceId, targetNodeId, formData);
}

// ============================================================
// 查询接口
// ============================================================
export function getWorkflowDefinitions(params?: { status?: string; module?: string }) {
  let sql = 'SELECT * FROM workflow_definitions WHERE 1=1';
  const args: any[] = [];
  if (params?.status) { sql += ' AND status = ?'; args.push(params.status); }
  if (params?.module) { sql += ' AND code LIKE ?'; args.push(`%${params.module}%`); }
  sql += ' ORDER BY isDefault DESC, createdAt DESC';
  return db.query(sql, args);
}

export function getWorkflowInstances(params: {
  applicantId?: string;
  assigneeId?: string;
  status?: string;
  businessType?: string;
}) {
  let sql = `SELECT DISTINCT wi.*, wd.name as definitionName, wd.code as definitionCode
    FROM workflow_instances wi
    LEFT JOIN workflow_definitions wd ON wi.definitionId = wd.id
    WHERE 1=1`;
  const args: any[] = [];

  if (params.applicantId) { sql += ' AND wi.applicantId = ?'; args.push(params.applicantId); }
  if (params.status) { sql += ' AND wi.status = ?'; args.push(params.status); }
  if (params.businessType) { sql += ' AND wi.businessType = ?'; args.push(params.businessType); }

  sql += ' ORDER BY wi.createdAt DESC LIMIT 100';

  const instances = db.query(sql, args);

  // 附加节点信息
  for (const inst of instances) {
    const nodes = db.query(`
      SELECT win.*, wna.assigneeType as configAssigneeType, wna.assigneeMode
      FROM workflow_instance_nodes win
      LEFT JOIN workflow_node_assignees wna ON win.instanceId = wna.instanceId AND win.nodeId = wna.nodeId
      WHERE win.instanceId = ?
      ORDER BY win.createdAt ASC
    `, [inst.id]);
    (inst as any).nodeHistory = nodes;
  }

  return instances;
}

export function getPendingApprovalsForUser(userId: string) {
  // 查找该用户作为审批人的待审批节点
  const rows = db.query(`
    SELECT win.*, wi.title, wi.businessType, wi.applicantName, wi.department,
           wi.formData, wi.businessData, wi.createdAt as instanceCreatedAt,
           wd.name as definitionName, wd.code as definitionCode
    FROM workflow_instance_nodes win
    JOIN workflow_instances wi ON win.instanceId = wi.id
    JOIN workflow_definitions wd ON wi.definitionId = wd.id
    JOIN workflow_node_assignees wna ON win.instanceId = wna.instanceId AND win.nodeId = wna.nodeId
    WHERE wna.assigneeId = ?
      AND win.status = 'pending'
      AND wi.status = 'running'
    ORDER BY win.createdAt DESC
  `, [userId]);
  return rows;
}

export function getWorkflowHistory(instanceId: string) {
  return db.query(`
    SELECT win.*, u.realName as handlerRealName
    FROM workflow_instance_nodes win
    LEFT JOIN users u ON win.assigneeId = u.id
    WHERE win.instanceId = ?
    ORDER BY win.createdAt ASC
  `, [instanceId]);
}

export function getAllUsers() {
  return db.query("SELECT id, username, realName, userType, status FROM users WHERE status = 'active'");
}

export function getRoles() {
  return db.query("SELECT id, name, code FROM roles WHERE isActive = 1");
}

// ============================================================
// 表单配置
// ============================================================
export function createFormConfig(data: { name: string; code: string; module?: string; fields: any[] }) {
  const id = `wfc_${Date.now()}`;
  const now = new Date().toISOString();
  db.query(`INSERT INTO workflow_form_configs (id, name, code, module, fields, layout, createdAt)
    VALUES (?,?,?,?,?,?,?)`, [
    id, data.name, data.code, data.module || '',
    JSON.stringify(data.fields), 'default', now
  ]);
  return { id, ...data, createdAt: now };
}

export function getFormConfigs(module?: string) {
  let sql = 'SELECT * FROM workflow_form_configs WHERE 1=1';
  const args: any[] = [];
  if (module) { sql += ' AND module = ?'; args.push(module); }
  sql += ' ORDER BY createdAt DESC';
  return db.query(sql, args).map((r: any) => ({
    ...r, fields: JSON.parse(r.fields || '[]')
  }));
}

// ============================================================
// 撤回流程
// ============================================================
export function cancelWorkflow(instanceId: string, userId: string) {
  const now = new Date().toISOString();
  const instances = db.query('SELECT * FROM workflow_instances WHERE id = ?', [instanceId]);
  if (!instances || instances.length === 0) throw new Error('流程实例不存在');
  const inst = instances[0];

  if (inst.applicantId !== userId) throw new Error('只有申请人可以撤回');
  if (inst.status !== 'running') throw new Error('流程已结束，无法撤回');

  db.query(`UPDATE workflow_instances SET status = 'cancelled', completedAt = ? WHERE id = ?`, [now, instanceId]);
  db.query(`UPDATE workflow_instance_nodes SET status = 'cancelled', completedAt = ? WHERE instanceId = ? AND status = 'pending'`, [now, instanceId]);

  return { success: true };
}

// ============================================================
// 添加审批意见
// ============================================================
export function addWorkflowComment(instanceId: string, userId: string, userName: string, content: string, nodeId?: string) {
  const id = `wfc_${Date.now()}_${Math.random().toString(36).slice(2, 4)}`;
  const now = new Date().toISOString();
  db.query(`INSERT INTO workflow_comments (id,instanceId,nodeId,userId,userName,content,type,createdAt)
    VALUES (?,?,?,?,?,?,?,?)`, [id, instanceId, nodeId || '', userId, userName, content, 'normal', now]);
  return { success: true };
}

export function getWorkflowComments(instanceId: string) {
  return db.query('SELECT * FROM workflow_comments WHERE instanceId = ? ORDER BY createdAt ASC', [instanceId]);
}
