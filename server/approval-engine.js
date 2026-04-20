/**
 * 审批流程引擎
 * 支持多级审批、条件分支
 */

const Database = require('better-sqlite3');
const path = require('path');

// 数据库实例
let db = null;

function initDb() {
  if (!db) {
    db = new Database(path.join(process.cwd(), 'data', 'ehr.db'));
  }
  return db;
}

/**
 * 创建审批流程
 * @param flowData 流程定义数据
 */
function createApprovalFlow(flowData) {
  const database = initDb();
  const flow = {
    id: `af_${Date.now()}`,
    name: flowData.name,
    module: flowData.module,
    steps: JSON.stringify(flowData.steps),
    isActive: flowData.isActive !== false ? 1 : 0,
    createdAt: new Date().toISOString()
  };
  
  database.prepare(`
    INSERT INTO approval_flows (id, name, module, steps, isActive, createdAt)
    VALUES (@id, @name, @module, @steps, @isActive, @createdAt)
  `).run(flow);
  
  return flow;
}

/**
 * 发起审批请求
 * @param requestData 请求数据
 */
function createApprovalRequest(requestData) {
  const database = initDb();
  
  // 获取对应的审批流程
  const flow = database.prepare(`
    SELECT * FROM approval_flows 
    WHERE module = ? AND isActive = 1 
    LIMIT 1
  `).get(requestData.module);
  
  if (!flow) {
    throw new Error('未找到对应的审批流程');
  }
  
  const steps = JSON.parse(flow.steps);
  const firstStep = steps[0];
  
  const request = {
    id: `arq_${Date.now()}`,
    flowId: flow.id,
    module: requestData.module,
    title: requestData.title,
    applicantId: requestData.applicantId,
    applicantName: requestData.applicantName,
    status: 'pending',
    currentStep: 1,
    formData: JSON.stringify(requestData.formData || {}),
    attachmentUrl: requestData.attachmentUrl || null,
    submittedAt: new Date().toISOString(),
    completedAt: null,
    createdAt: new Date().toISOString()
  };
  
  database.prepare(`
    INSERT INTO approval_requests 
    (id, flowId, module, title, applicantId, applicantName, status, currentStep, formData, attachmentUrl, submittedAt, completedAt, createdAt)
    VALUES (@id, @flowId, @module, @title, @applicantId, @applicantName, @status, @currentStep, @formData, @attachmentUrl, @submittedAt, @completedAt, @createdAt)
  `).run(request);
  
  // 创建第一步审批记录
  const approvalRecord = {
    id: `aprec_${request.id}_1`,
    requestId: request.id,
    stepIndex: 1,
    approverId: null,
    approverName: null,
    action: 'pending',
    comment: null,
    handledAt: null,
    nextApprover: null,
    createdAt: new Date().toISOString()
  };
  
  database.prepare(`
    INSERT INTO approval_records 
    (id, requestId, stepIndex, approverId, approverName, action, comment, handledAt, nextApprover, createdAt)
    VALUES (@id, @requestId, @stepIndex, @approverId, @approverName, @action, @comment, @handledAt, @nextApprover, @createdAt)
  `).run(approvalRecord);
  
  return request;
}

/**
 * 处理审批（批准/拒绝）
 * @param requestId 请求ID
 * @param approverId 审批人ID
 * @param approverName 审批人姓名
 * @param action 操作：approve/reject
 * @param comment 审批意见
 */
function processApproval(requestId, approverId, approverName, action, comment) {
  const database = initDb();
  
  // 获取请求
  const request = database.prepare('SELECT * FROM approval_requests WHERE id = ?').get(requestId);
  if (!request) {
    throw new Error('审批请求不存在');
  }
  
  if (request.status !== 'pending') {
    throw new Error('该请求已完成审批');
  }
  
  // 获取流程步骤
  const flow = database.prepare('SELECT * FROM approval_flows WHERE id = ?').get(request.flowId);
  const steps = JSON.parse(flow.steps);
  const currentStepIndex = request.currentStep;
  const currentStep = steps[currentStepIndex - 1];
  
  // 更新审批记录
  database.prepare(`
    UPDATE approval_records 
    SET approverId = ?, approverName = ?, action = ?, comment = ?, handledAt = ?
    WHERE requestId = ? AND stepIndex = ?
  `).run(approverId, approverName, action, comment, new Date().toISOString(), requestId, currentStepIndex);
  
  if (action === 'reject') {
    // 拒绝：直接结束流程
    database.prepare(`
      UPDATE approval_requests 
      SET status = 'rejected', completedAt = ?
      WHERE id = ?
    `).run(new Date().toISOString(), requestId);
    
    return { status: 'rejected', message: '已拒绝' };
  }
  
  // 批准：进入下一步或完成
  const nextStepIndex = currentStepIndex + 1;
  
  if (nextStepIndex > steps.length) {
    // 所有步骤完成
    database.prepare(`
      UPDATE approval_requests 
      SET status = 'approved', completedAt = ?
      WHERE id = ?
    `).run(new Date().toISOString(), requestId);
    
    // 执行审批通过后的操作
    executeApprovalAction(request);
    
    return { status: 'approved', message: '审批通过' };
  }
  
  // 进入下一步
  database.prepare(`
    UPDATE approval_requests 
    SET currentStep = ?
    WHERE id = ?
  `).run(nextStepIndex, requestId);
  
  // 创建下一步审批记录
  const nextRecord = {
    id: `aprec_${requestId}_${nextStepIndex}`,
    requestId: requestId,
    stepIndex: nextStepIndex,
    approverId: null,
    approverName: null,
    action: 'pending',
    comment: null,
    handledAt: null,
    nextApprover: null,
    createdAt: new Date().toISOString()
  };
  
  database.prepare(`
    INSERT INTO approval_records 
    (id, requestId, stepIndex, approverId, approverName, action, comment, handledAt, nextApprover, createdAt)
    VALUES (@id, @requestId, @stepIndex, @approverId, @approverName, @action, @comment, @handledAt, @nextApprover, @createdAt)
  `).run(nextRecord);
  
  return { status: 'pending', message: `进入第${nextStepIndex}步审批` };
}

/**
 * 执行审批通过后的操作
 */
function executeApprovalAction(request) {
  const database = initDb();
  const formData = JSON.parse(request.formData);
  
  switch (request.module) {
    case 'leave':
      // 请假审批通过：更新请假记录状态
      if (formData.leaveRecordId) {
        database.prepare(`
          UPDATE leave_records SET status = 'approved', approveTime = ?
          WHERE id = ?
        `).run(new Date().toISOString(), formData.leaveRecordId);
      }
      break;
      
    case 'overtime':
      // 加班审批通过：更新加班记录状态
      if (formData.overtimeRecordId) {
        database.prepare(`
          UPDATE overtime_records SET status = 'approved', approveTime = ?
          WHERE id = ?
        `).run(new Date().toISOString(), formData.overtimeRecordId);
      }
      break;
      
    case 'salary':
      // 调薪审批通过：更新员工薪资
      if (formData.employeeId && formData.newSalary) {
        // 实际应用中应该添加薪资调整记录
        console.log(`员工 ${formData.employeeId} 薪资调整为 ${formData.newSalary}`);
      }
      break;
  }
  
  // 添加审计日志
  database.prepare(`
    INSERT INTO audit_logs (id, userId, username, action, module, detail, ip, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `log_${Date.now()}`,
    request.applicantId,
    request.applicantName,
    'approval_completed',
    request.module,
    `审批通过: ${request.title}`,
    '127.0.0.1',
    new Date().toISOString()
  );
}

/**
 * 获取待审批列表
 * @param approverId 审批人ID（可选，不传则返回所有待审批）
 */
function getPendingApprovals(approverId) {
  const database = initDb();
  
  let query = `
    SELECT ar.*, arq.title, arq.applicantName, arq.module, arq.submittedAt
    FROM approval_records ar
    JOIN approval_requests arq ON ar.requestId = arq.id
    WHERE ar.action = 'pending' AND arq.status = 'pending'
  `;
  
  const params = [];
  if (approverId) {
    query += ' AND (ar.approverId IS NULL OR ar.approverId = ?)';
    params.push(approverId);
  }
  
  query += ' ORDER BY arq.submittedAt DESC';
  
  return database.prepare(query).all(...params);
}

/**
 * 获取审批历史
 * @param requestId 请求ID
 */
function getApprovalHistory(requestId) {
  const database = initDb();
  
  return database.prepare(`
    SELECT * FROM approval_records
    WHERE requestId = ?
    ORDER BY stepIndex ASC
  `).all(requestId);
}

module.exports = {
  createApprovalFlow,
  createApprovalRequest,
  processApproval,
  getPendingApprovals,
  getApprovalHistory,
  executeApprovalAction
};
