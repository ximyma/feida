/**
 * 审批流程引擎
 * 处理审批流程创建、审批请求、审批处理等功能
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../data/ehr.db');
const db = new Database(dbPath);

/**
 * 创建审批流程
 */
export function createApprovalFlow(data: {
  name: string;
  module: string;
  steps: Array<{ stepIndex: number; stepName: string; approverRole: string; approverIds?: string[] }>;
}) {
  const id = `af_${Date.now()}`;
  const now = new Date().toISOString();
  
  const flow = {
    id,
    name: data.name,
    module: data.module,
    steps: JSON.stringify(data.steps),
    isActive: 1,
    createdAt: now
  };
  
  db.prepare(`INSERT INTO approval_flows (id, name, module, steps, isActive, createdAt) VALUES (@id, @name, @module, @steps, @isActive, @createdAt)`).run(flow);
  
  return flow;
}

/**
 * 创建审批请求
 */
export function createApprovalRequest(data: {
  flowId: string;
  module: string;
  title: string;
  applicantId: string;
  applicantName: string;
  formData?: any;
  attachmentUrl?: string;
}) {
  const id = `arq_${Date.now()}`;
  const now = new Date().toISOString();
  
  // 获取流程信息
  const flow = db.prepare('SELECT * FROM approval_flows WHERE id = ?').get(data.flowId) as any;
  if (!flow) throw new Error('审批流程不存在');
  
  const request = {
    id,
    flowId: data.flowId,
    module: data.module,
    title: data.title,
    applicantId: data.applicantId,
    applicantName: data.applicantName,
    status: 'pending',
    currentStep: 1,
    formData: JSON.stringify(data.formData || {}),
    attachmentUrl: data.attachmentUrl || '',
    submittedAt: now,
    completedAt: null,
    createdAt: now
  };
  
  db.prepare(`INSERT INTO approval_requests (id, flowId, module, title, applicantId, applicantName, status, currentStep, formData, attachmentUrl, submittedAt, completedAt, createdAt) 
    VALUES (@id, @flowId, @module, @title, @applicantId, @applicantName, @status, @currentStep, @formData, @attachmentUrl, @submittedAt, @completedAt, @createdAt)`).run(request);
  
  // 创建第一步待审批记录
  const steps = JSON.parse(flow.steps);
  if (steps.length > 0) {
    const firstStep = steps[0];
    createApprovalRecord({
      requestId: id,
      stepIndex: 1,
      approverId: firstStep.approverIds?.[0] || 'pending',
      approverName: firstStep.stepName
    });
  }
  
  return request;
}

/**
 * 创建审批记录
 */
function createApprovalRecord(data: {
  requestId: string;
  stepIndex: number;
  approverId: string;
  approverName: string;
}) {
  const id = `ar_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  
  const record = {
    id,
    requestId: data.requestId,
    stepIndex: data.stepIndex,
    approverId: data.approverId,
    approverName: data.approverName,
    action: 'pending',
    comment: '',
    handledAt: null,  // 注意：使用 handledAt，不是 approvedAt
    nextApprover: '',
    createdAt: now
  };
  
  db.prepare(`INSERT INTO approval_records (id, requestId, stepIndex, approverId, approverName, action, comment, handledAt, nextApprover, createdAt) 
    VALUES (@id, @requestId, @stepIndex, @approverId, @approverName, @action, @comment, @handledAt, @nextApprover, @createdAt)`).run(record);
  
  return record;
}

/**
 * 处理审批
 */
export function processApproval(
  requestId: string,
  approverId: string,
  approverName: string,
  action: 'approve' | 'reject',
  comment: string
) {
  const now = new Date().toISOString();
  
  // 获取审批请求
  const request = db.prepare('SELECT * FROM approval_requests WHERE id = ?').get(requestId) as any;
  if (!request) throw new Error('审批请求不存在');
  if (request.status !== 'pending') throw new Error('该请求已处理完成');
  
  // 获取流程信息
  const flow = db.prepare('SELECT * FROM approval_flows WHERE id = ?').get(request.flowId) as any;
  const steps = JSON.parse(flow.steps);
  
  // 更新当前步骤的审批记录
  const currentRecord = db.prepare('SELECT * FROM approval_records WHERE requestId = ? AND stepIndex = ? AND action = ?').get(requestId, request.currentStep, 'pending') as any;
  
  if (currentRecord) {
    db.prepare(`UPDATE approval_records SET action = ?, comment = ?, approverId = ?, approverName = ?, handledAt = ? WHERE id = ?`)
      .run(action, comment || '', approverId, approverName, now, currentRecord.id);
  }
  
  // 如果拒绝，直接结束
  if (action === 'reject') {
    db.prepare(`UPDATE approval_requests SET status = ?, completedAt = ? WHERE id = ?`).run('rejected', now, requestId);
    return { success: true, status: 'rejected', message: '审批已拒绝' };
  }
  
  // 如果是最后一步，审批完成
  if (request.currentStep >= steps.length) {
    db.prepare(`UPDATE approval_requests SET status = ?, completedAt = ? WHERE id = ?`).run('approved', now, requestId);
    return { success: true, status: 'approved', message: '审批已通过' };
  }
  
  // 进入下一步
  const nextStepIndex = request.currentStep + 1;
  const nextStep = steps[nextStepIndex - 1];
  
  db.prepare(`UPDATE approval_requests SET currentStep = ? WHERE id = ?`).run(nextStepIndex, requestId);
  
  // 创建下一步审批记录
  createApprovalRecord({
    requestId,
    stepIndex: nextStepIndex,
    approverId: nextStep.approverIds?.[0] || 'pending',
    approverName: nextStep.stepName
  });
  
  return { success: true, status: 'pending', message: `进入第${nextStepIndex}步审批` };
}

/**
 * 获取待审批列表
 */
export function getPendingApprovals(approverId: string) {
  const records = db.prepare(`
    SELECT ar.*, req.title, req.module, req.applicantName, req.submittedAt, req.formData
    FROM approval_records ar
    JOIN approval_requests req ON ar.requestId = req.id
    WHERE ar.approverId = ? AND ar.action = 'pending' AND req.status = 'pending'
    ORDER BY req.submittedAt DESC
  `).all(approverId);
  
  return records;
}

/**
 * 获取审批历史
 */
export function getApprovalHistory(requestId: string) {
  const records = db.prepare(`
    SELECT * FROM approval_records 
    WHERE requestId = ? 
    ORDER BY stepIndex ASC
  `).all(requestId);
  
  return records;
}

/**
 * 添加审计日志
 */
export function addAuditLog(data: {
  userId: string;
  username: string;
  realName: string;
  action: string;
  module: string;
  detail: string;
  ip?: string;
}) {
  const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const now = new Date().toISOString();
  
  const log = {
    id,
    userId: data.userId,
    username: data.username,
    realName: data.realName,
    action: data.action,
    module: data.module,
    targetType: '',
    targetId: '',
    detail: data.detail,
    ip: data.ip || '',
    userAgent: '',
    timestamp: now  // 注意：使用 timestamp，不是 createdAt
  };
  
  db.prepare(`INSERT INTO audit_logs (id, userId, username, realName, action, module, targetType, targetId, detail, ip, userAgent, timestamp) 
    VALUES (@id, @userId, @username, @realName, @action, @module, @targetType, @targetId, @detail, @ip, @userAgent, @timestamp)`).run(log);
  
  return log;
}
