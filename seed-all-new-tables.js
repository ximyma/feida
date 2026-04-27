const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

console.log('=== Seeding new tables ===\n');

// 1. workflow_templates
const workflowTemplates = [
  { id: 'wt_leave', name: '请假审批流程', type: 'leave', description: '员工请假申请审批流程', steps: JSON.stringify([{name:'主管审批'},{name:'HR审批'}]), isActive: 1, createdBy: '系统管理员' },
  { id: 'wt_overtime', name: '加班审批流程', type: 'overtime', description: '员工加班申请审批流程', steps: JSON.stringify([{name:'主管审批'},{name:'HR审批'}]), isActive: 1, createdBy: '系统管理员' },
  { id: 'wt_expense', name: '报销审批流程', type: 'expense', description: '费用报销审批流程', steps: JSON.stringify([{name:'主管审批'},{name:'财务审批'},{name:'总经理审批'}]), isActive: 1, createdBy: '系统管理员' },
  { id: 'wt_transfer', name: '调岗审批流程', type: 'transfer', description: '员工调岗审批流程', steps: JSON.stringify([{name:'原部门主管'},{name:'新部门主管'},{name:'HR审批'}]), isActive: 1, createdBy: '系统管理员' },
  { id: 'wt_resignation', name: '离职审批流程', type: 'resignation', description: '员工离职审批流程', steps: JSON.stringify([{name:'主管审批'},{name:'HR审批'},{name:'总经理审批'}]), isActive: 1, createdBy: '系统管理员' },
];

db.prepare("DELETE FROM workflow_templates").run();
const insWT = db.prepare(`INSERT OR REPLACE INTO workflow_templates (id, name, type, description, steps, isActive, createdBy) VALUES (?,?,?,?,?,?,?)`);
workflowTemplates.forEach(t => insWT.run(t.id, t.name, t.type, t.description, t.steps, t.isActive, t.createdBy));
console.log('workflow_templates:', db.prepare("SELECT COUNT(*) as c FROM workflow_templates").get().c, 'rows');

// 2. meeting_rooms
const meetingRooms = [
  { id: 'mr_1', name: '大会议室A', capacity: 50, location: '3楼301', equipment: JSON.stringify(['投影仪','麦克风','白板','视频会议系统']), status: 'available' },
  { id: 'mr_2', name: '中会议室B', capacity: 20, location: '2楼202', equipment: JSON.stringify(['投影仪','白板']), status: 'available' },
  { id: 'mr_3', name: '小会议室C', capacity: 8, location: '2楼208', equipment: JSON.stringify(['投影仪']), status: 'available' },
  { id: 'mr_4', name: '视频会议室D', capacity: 15, location: '4楼401', equipment: JSON.stringify(['视频会议系统','麦克风','投影仪']), status: 'available' },
  { id: 'mr_5', name: '培训室E', capacity: 30, location: '1楼102', equipment: JSON.stringify(['投影仪','白板','音响系统']), status: 'available' },
];

db.prepare("DELETE FROM meeting_rooms").run();
const insMR = db.prepare(`INSERT OR REPLACE INTO meeting_rooms (id, name, capacity, location, equipment, status) VALUES (?,?,?,?,?,?)`);
meetingRooms.forEach(r => insMR.run(r.id, r.name, r.capacity, r.location, r.equipment, r.status));
console.log('meeting_rooms:', db.prepare("SELECT COUNT(*) as c FROM meeting_rooms").get().c, 'rows');

// 3. meetings
const meetings = [
  { id: 'mt_1', title: '季度工作总结会', roomId: 'mr_1', organizer: '张总', organizerId: 'emp-1', startTime: '2026-04-28 14:00:00', endTime: '2026-04-28 16:00:00', participants: JSON.stringify(['张明辉','李婷','王强']), description: '第一季度工作总结', status: 'scheduled' },
  { id: 'mt_2', title: '项目评审会', roomId: 'mr_2', organizer: '李经理', organizerId: 'emp-2', startTime: '2026-04-29 10:00:00', endTime: '2026-04-29 12:00:00', participants: JSON.stringify(['研发部全员']), description: '新产品上线评审', status: 'scheduled' },
  { id: 'mt_3', title: '部门周会', roomId: 'mr_3', organizer: '王主任', organizerId: 'emp-3', startTime: '2026-04-28 09:00:00', endTime: '2026-04-28 10:00:00', participants: JSON.stringify(['市场部员工']), description: '市场部周例会', status: 'completed' },
];

db.prepare("DELETE FROM meetings").run();
const insMT = db.prepare(`INSERT OR REPLACE INTO meetings (id, title, roomId, organizer, organizerId, startTime, endTime, participants, description, status) VALUES (?,?,?,?,?,?,?,?,?,?)`);
meetings.forEach(m => insMT.run(m.id, m.title, m.roomId, m.organizer, m.organizerId, m.startTime, m.endTime, m.participants, m.description, m.status));
console.log('meetings:', db.prepare("SELECT COUNT(*) as c FROM meetings").get().c, 'rows');

// 4. office_supplies
const officeSupplies = [
  { id: 'os_1', name: 'A4打印纸', category: '纸张', stock: 500, unit: '包', price: 25, safetyStock: 100, supplier: '得力', location: '仓库A区' },
  { id: 'os_2', name: '签字笔（黑色）', category: '笔类', stock: 1000, unit: '支', price: 2, safetyStock: 200, supplier: '晨光', location: '仓库B区' },
  { id: 'os_3', name: '文件夹', category: '文具', stock: 300, unit: '个', price: 5, safetyStock: 50, supplier: '得力', location: '仓库A区' },
  { id: 'os_4', name: '订书机', category: '文具', stock: 50, unit: '个', price: 25, safetyStock: 10, supplier: '得力', location: '仓库B区' },
  { id: 'os_5', name: '便利贴', category: '文具', stock: 200, unit: '本', price: 8, safetyStock: 50, supplier: '晨光', location: '仓库A区' },
  { id: 'os_6', name: '回形针', category: '文具', stock: 100, unit: '盒', price: 3, safetyStock: 20, supplier: '晨光', location: '仓库B区' },
];

db.prepare("DELETE FROM office_supplies").run();
const insOS = db.prepare(`INSERT OR REPLACE INTO office_supplies (id, name, category, stock, unit, price, safetyStock, supplier, location) VALUES (?,?,?,?,?,?,?,?,?)`);
officeSupplies.forEach(s => insOS.run(s.id, s.name, s.category, s.stock, s.unit, s.price, s.safetyStock, s.supplier, s.location));
console.log('office_supplies:', db.prepare("SELECT COUNT(*) as c FROM office_supplies").get().c, 'rows');

// 5. supply_requests
const supplyRequests = [
  { id: 'sr_1', supplyId: 'os_1', supplyName: 'A4打印纸', quantity: 10, requesterId: 'emp-2', requesterName: '李婷', purpose: '日常办公', pickupTime: '2026-04-28', status: 'approved', approver: '行政主管', approvedAt: '2026-04-27' },
  { id: 'sr_2', supplyId: 'os_2', supplyName: '签字笔（黑色）', quantity: 50, requesterId: 'emp-3', requesterName: '王强', purpose: '部门需求', pickupTime: '2026-04-29', status: 'pending' },
];

db.prepare("DELETE FROM supply_requests").run();
const insSR = db.prepare(`INSERT OR REPLACE INTO supply_requests (id, supplyId, supplyName, quantity, requesterId, requesterName, purpose, pickupTime, status, approver, approvedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)`);
supplyRequests.forEach(r => insSR.run(r.id, r.supplyId, r.supplyName, r.quantity, r.requesterId, r.requesterName, r.purpose, r.pickupTime, r.status, r.approver || null, r.approvedAt || null));
console.log('supply_requests:', db.prepare("SELECT COUNT(*) as c FROM supply_requests").get().c, 'rows');

// 6. talent_tags
const talentTags = [
  { id: 'tt_1', name: '技术人才', color: 'blue', type: 'talent', description: '具备技术专长的人才' },
  { id: 'tt_2', name: '管理人才', color: 'green', type: 'talent', description: '具备管理能力的人才' },
  { id: 'tt_3', name: '销售精英', color: 'orange', type: 'talent', description: '销售业绩突出的人才' },
  { id: 'tt_4', name: '核心骨干', color: 'purple', type: 'talent', description: '公司核心骨干员工' },
  { id: 'tt_5', name: '待跟进', color: 'yellow', type: 'status', description: '需要持续跟进的候选人' },
];

db.prepare("DELETE FROM talent_tags").run();
const insTT = db.prepare(`INSERT OR REPLACE INTO talent_tags (id, name, color, type, description) VALUES (?,?,?,?,?)`);
talentTags.forEach(t => insTT.run(t.id, t.name, t.color, t.type, t.description));
console.log('talent_tags:', db.prepare("SELECT COUNT(*) as c FROM talent_tags").get().c, 'rows');

// 7. email_templates
const emailTemplates = [
  { id: 'et_1', name: '技术岗面试邀请', type: 'interview_invite', subject: '【飞达科技】前端工程师面试邀请', content: '<p>尊敬的 {{candidate_name}}，您好！感谢您投递我司前端工程师岗位。</p><p>面试时间：{{interview_time}}</p><p>面试地点：{{interview_location}}</p>', variables: JSON.stringify(['candidate_name','interview_time','interview_location']), isActive: 1 },
  { id: 'et_2', name: 'Offer通知', type: 'offer', subject: '【飞达科技】录用通知书', content: '<p>尊敬的 {{candidate_name}}，恭喜您通过我司面试！</p><p>薪资：{{salary}}</p><p>入职日期：{{start_date}}</p>', variables: JSON.stringify(['candidate_name','salary','start_date']), isActive: 1 },
  { id: 'et_3', name: '面试结果通知', type: 'result', subject: '【飞达科技】面试结果通知', content: '<p>尊敬的 {{candidate_name}}，感谢您参加我司面试。</p><p>结果：{{result}}</p>', variables: JSON.stringify(['candidate_name','result']), isActive: 1 },
];

db.prepare("DELETE FROM email_templates").run();
const insET = db.prepare(`INSERT OR REPLACE INTO email_templates (id, name, type, subject, content, variables, isActive) VALUES (?,?,?,?,?,?,?)`);
emailTemplates.forEach(t => insET.run(t.id, t.name, t.type, t.subject, t.content, t.variables, t.isActive));
console.log('email_templates:', db.prepare("SELECT COUNT(*) as c FROM email_templates").get().c, 'rows');

// 8. email_logs
const emailLogs = [
  { id: 'el_1', templateId: 'et_1', templateName: '技术岗面试邀请', recipientName: '张三', recipientEmail: 'zhangsan@example.com', subject: '【飞达科技】前端工程师面试邀请', status: 'sent', sentAt: '2026-04-20T10:30:00' },
  { id: 'el_2', templateId: 'et_1', templateName: '技术岗面试邀请', recipientName: '李四', recipientEmail: 'lisi@example.com', subject: '【飞达科技】前端工程师面试邀请', status: 'sent', sentAt: '2026-04-21T14:00:00' },
  { id: 'el_3', templateId: 'et_2', templateName: 'Offer通知', recipientName: '张三', recipientEmail: 'zhangsan@example.com', subject: '【飞达科技】录用通知书', status: 'sent', sentAt: '2026-04-25T09:00:00' },
];

db.prepare("DELETE FROM email_logs").run();
const insEL = db.prepare(`INSERT OR REPLACE INTO email_logs (id, templateId, templateName, recipientName, recipientEmail, subject, status, sentAt) VALUES (?,?,?,?,?,?,?,?)`);
emailLogs.forEach(l => insEL.run(l.id, l.templateId, l.templateName, l.recipientName, l.recipientEmail, l.subject, l.status, l.sentAt));
console.log('email_logs:', db.prepare("SELECT COUNT(*) as c FROM email_logs").get().c, 'rows');

// 9. training_classes
const trainingClasses = [
  { id: 'tc_1', name: 'React进阶实战班', planId: '1', instructor: '张工', startDate: '2026-05-01', endDate: '2026-05-15', location: 'A栋302会议室', capacity: 30, enrolledCount: 25, status: 'upcoming', qrCode: 'tc-001-qr', description: 'React高级进阶线下实战培训' },
  { id: 'tc_2', name: '管理技能提升班', planId: '1', instructor: '李老师', startDate: '2026-05-10', endDate: '2026-05-20', location: 'B栋201培训室', capacity: 20, enrolledCount: 18, status: 'upcoming', qrCode: 'tc-002-qr', description: '中层管理者技能提升培训' },
  { id: 'tc_3', name: '新员工入职培训', planId: '2', instructor: '王主任', startDate: '2026-04-15', endDate: '2026-04-20', location: '1楼培训室', capacity: 50, enrolledCount: 45, status: 'completed', qrCode: 'tc-003-qr', description: '新员工入职培训' },
];

db.prepare("DELETE FROM training_classes").run();
const insTC = db.prepare(`INSERT OR REPLACE INTO training_classes (id, name, planId, instructor, startDate, endDate, location, capacity, enrolledCount, status, qrCode, description) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
trainingClasses.forEach(c => insTC.run(c.id, c.name, c.planId, c.instructor, c.startDate, c.endDate, c.location, c.capacity, c.enrolledCount, c.status, c.qrCode, c.description));
console.log('training_classes:', db.prepare("SELECT COUNT(*) as c FROM training_classes").get().c, 'rows');

// 10. assessment_templates
const assessmentTemplates = [
  { id: 'at_1', name: '技术课程评估表', applicableCourse: 'React高级进阶', questionTypes: JSON.stringify(['single','multiple','short']), totalScore: 100, passingScore: 60, isActive: 1, questions: JSON.stringify([
    {type:'single',question:'课程内容是否清晰易懂？',options:['非常清晰','比较清晰','一般','不太清晰'],score:20},
    {type:'single',question:'讲师讲解是否专业？',options:['非常专业','比较专业','一般','不太专业'],score:20},
    {type:'multiple',question:'您认为课程哪些方面需要改进？',options:['课程内容','讲师水平','培训环境','培训时间'],score:30},
    {type:'short',question:'请提出您的建议',score:30}
  ])},
  { id: 'at_2', name: '管理培训评估表', applicableCourse: '管理技能提升', questionTypes: JSON.stringify(['single','multiple','short']), totalScore: 100, passingScore: 60, isActive: 1, questions: JSON.stringify([
    {type:'single',question:'培训内容是否实用？',options:['非常实用','比较实用','一般','不太实用'],score:25},
    {type:'single',question:'培训方式是否有效？',options:['非常有效','比较有效','一般','不太有效'],score:25},
    {type:'short',question:'您希望增加哪些培训内容？',score:50}
  ])},
];

db.prepare("DELETE FROM assessment_templates").run();
const insAT = db.prepare(`INSERT OR REPLACE INTO assessment_templates (id, name, applicableCourse, questionTypes, totalScore, passingScore, isActive, questions) VALUES (?,?,?,?,?,?,?,?)`);
assessmentTemplates.forEach(t => insAT.run(t.id, t.name, t.applicableCourse, t.questionTypes, t.totalScore, t.passingScore, t.isActive, t.questions));
console.log('assessment_templates:', db.prepare("SELECT COUNT(*) as c FROM assessment_templates").get().c, 'rows');

console.log('\n=== ALL 10 NEW TABLES SEEDED ===');
db.close();
