// 综合事务模块：建表 + 种子数据
const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

// ===== 建表 =====
db.exec(`
  CREATE TABLE IF NOT EXISTS doc_folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    parentId TEXT DEFAULT '',
    accessLevel TEXT DEFAULT 'all',
    createdBy TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    folderId TEXT DEFAULT '',
    title TEXT NOT NULL,
    fileName TEXT DEFAULT '',
    fileType TEXT DEFAULT '',
    fileSize INTEGER DEFAULT 0,
    fileData TEXT DEFAULT '',
    accessLevel TEXT DEFAULT 'all',
    downloads INTEGER DEFAULT 0,
    createdBy TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT DEFAULT '',
    category TEXT DEFAULT 'notice',
    isPinned INTEGER DEFAULT 0,
    isTop INTEGER DEFAULT 0,
    readCount INTEGER DEFAULT 0,
    createdBy TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS announcement_reads (
    id TEXT PRIMARY KEY,
    announcementId TEXT NOT NULL,
    employeeId TEXT DEFAULT '',
    employeeName TEXT DEFAULT '',
    readAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS surveys (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    surveyType TEXT DEFAULT 'survey',
    isAnonymous INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    allowChange INTEGER DEFAULT 0,
    createdBy TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now')),
    deadline TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS survey_options (
    id TEXT PRIMARY KEY,
    surveyId TEXT NOT NULL,
    optionText TEXT NOT NULL,
    optionOrder INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS survey_responses (
    id TEXT PRIMARY KEY,
    surveyId TEXT NOT NULL,
    optionId TEXT NOT NULL,
    employeeId TEXT DEFAULT '',
    employeeName TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now'))
  );
`);
console.log('建表完成');

// ===== 清空并重新播种 =====
['doc_folders','documents','announcements','announcement_reads','surveys','survey_options','survey_responses'].forEach(t => {
  try { db.exec('DELETE FROM ' + t); console.log('已清空 ' + t); } catch(e) {}
});

// ===== 1. 文档文件夹 =====
const iFolder = db.prepare('INSERT INTO doc_folders (id, name, parentId, accessLevel, createdBy) VALUES (?,?,?,?,?)');
[
  ['f_root',  '公共文档',    '', 'all',     'admin'],
  ['f_hr',   '人力资源',    '', 'hr',      'admin'],
  ['f_fin',  '财务管理',    '', 'finance', 'admin'],
  ['f_pub',  '行政公告',    '', 'all',     'admin'],
].forEach(d => iFolder.run(...d));
console.log('文件夹: 4条');

// ===== 2. 文档记录（存文件内容URL模拟，真实系统用对象存储）====
// 真实系统中 fileData 存对象存储路径或 base64；这里模拟几个文档元数据
const iDoc = db.prepare('INSERT INTO documents (id, folderId, title, fileName, fileType, fileSize, accessLevel, downloads, createdBy) VALUES (?,?,?,?,?,?,?,?,?)');
[
  ['doc_001', 'f_root', '员工手册2026版',        '员工手册2026.pdf',  'pdf',  2048000, 'all',     42, 'admin'],
  ['doc_002', 'f_root', '公司组织架构图',         '组织架构.pdf',       'pdf',  512000,  'all',     38, 'admin'],
  ['doc_003', 'f_hr',   '入职培训资料',           '入职培训.docx',      'docx', 1024000, 'hr',      15, 'admin'],
  ['doc_004', 'f_hr',   '绩效考核方案',           '绩效考核方案.pdf',   'pdf',  768000,  'hr',      22, 'admin'],
  ['doc_005', 'f_fin',  '2026年财务管理制度',     '财务制度.pdf',       'pdf',  1536000, 'finance', 10, 'admin'],
  ['doc_006', 'f_pub',  '考勤管理办法',           '考勤办法.pdf',       'pdf',  256000,  'all',     56, 'admin'],
  ['doc_007', 'f_pub',  '会议室使用规范',         '会议室规范.pdf',     'pdf',  128000,  'all',     33, 'admin'],
].forEach(d => iDoc.run(...d));
console.log('文档: 7条');

// ===== 3. 通知公告 =====
const iAnn = db.prepare('INSERT INTO announcements (id, title, content, category, isPinned, isTop, readCount, createdBy) VALUES (?,?,?,?,?,?,?,?)');
const today = new Date().toISOString().slice(0, 10);
const iAnnRead = db.prepare('INSERT INTO announcement_reads (id, announcementId, employeeId, employeeName) VALUES (?,?,?,?)');

const annData = [
  ['ann_001', '关于2026年五一劳动节放假安排的通知', '各部门：根据国家规定，现将2026年五一劳动节放假安排通知如下：5月1日至5月5日放假调休，共5天。4月27日（周日）、5月10日（周六）上班。请各部门做好值班安排。', 'notice', 1, 1, 45, 'admin'],
  ['ann_002', '关于开展2026年度员工体检的通知', '公司定于5月15日至6月30日组织年度员工体检，请各部门于4月30日前将体检名单报至人力资源部。体检地点：市中心医院体检中心。', 'notice', 0, 1, 38, 'admin'],
  ['ann_003', '关于启用新版OA系统的通知', '各部门：我司新版OA系统已完成测试，定于5月6日正式上线。原系统将于5月10日停止使用。请各部门尽快完成迁移工作。', 'notice', 0, 0, 52, 'admin'],
  ['ann_004', '关于举办2026年春季运动会的通知', '为丰富员工文化生活，增强团队凝聚力，公司决定举办2026年春季运动会。时间：5月20日，地点：市体育中心。报名截止：5月10日。', 'activity', 0, 0, 30, 'admin'],
  ['ann_005', '关于公司班车路线调整的通知', '自5月1日起，公司班车线路调整如下：新增地铁接驳线（早7:30、晚18:30），原东线取消。具体时刻表见附件。', 'notice', 0, 0, 41, 'admin'],
];
annData.forEach(d => iAnn.run(...d));

// 阅读记录
const reads = [
  ['ar_001','ann_001','emp-1','张明辉'],['ar_002','ann_001','emp-2','李雪梅'],['ar_003','ann_001','emp-3','王建国'],
  ['ar_004','ann_002','emp-1','张明辉'],['ar_005','ann_002','emp-4','赵小燕'],
  ['ar_006','ann_003','emp-1','张明辉'],['ar_007','ann_003','emp-2','李雪梅'],['ar_008','ann_003','emp-3','王建国'],
  ['ar_009','ann_004','emp-2','李雪梅'],
  ['ar_010','ann_005','emp-1','张明辉'],['ar_011','ann_005','emp-2','李雪梅'],['ar_012','ann_005','emp-3','王建国'],['ar_013','ann_005','emp-4','赵小燕'],['ar_014','ann_005','emp-5','陈大伟'],
];
reads.forEach(d => iAnnRead.run(...d));
console.log('公告: ' + annData.length + '条, 阅读记录: ' + reads.length + '条');

// ===== 4. 问卷投票 =====
const iSurvey = db.prepare('INSERT INTO surveys (id, title, description, surveyType, isAnonymous, isActive, createdBy, deadline) VALUES (?,?,?,?,?,?,?,?)');
const iOption = db.prepare('INSERT INTO survey_options (id, surveyId, optionText, optionOrder) VALUES (?,?,?,?)');
const iResp = db.prepare('INSERT INTO survey_responses (id, surveyId, optionId, employeeId, employeeName) VALUES (?,?,?,?,?)');

const surveys = [
  // 投票
  ['sv_001', '2026年度优秀员工评选', '请从以下候选人中选出您心目中的优秀员工（可多选）', 'vote', 0, 1, 'admin', ''],
  // 问卷
  ['sv_002', '员工满意度调查问卷', '感谢您参与本次满意度调查，请根据实际情况选择最合适的选项。', 'survey', 0, 1, 'admin', new Date(today.getTime() + 7*86400000).toISOString().slice(0,10)],
  // 投票
  ['sv_003', '春季运动会项目投票', '请选择您希望参加的运动项目（可多选）', 'vote', 0, 1, 'admin', ''],
];

surveys.forEach(d => iSurvey.run(...d));

// sv_001 选项（优秀员工评选）
[
  ['opt_001','sv_001','张明辉 - 技术部', 1],
  ['opt_002','sv_001','李雪梅 - 财务部', 2],
  ['opt_003','sv_001','王建国 - 市场部', 3],
  ['opt_004','sv_001','赵小燕 - 人力资源', 4],
  ['opt_005','sv_001','陈大伟 - 行政部', 5],
].forEach(d => iOption.run(...d));

// sv_002 选项（满意度）
[
  ['opt_006','sv_002','非常满意', 1],
  ['opt_007','sv_002','满意', 2],
  ['opt_008','sv_002','一般', 3],
  ['opt_009','sv_002','不满意', 4],
  ['opt_010','sv_002','非常不满意', 5],
].forEach(d => iOption.run(...d));

// sv_003 选项（运动会项目）
[
  ['opt_011','sv_003','篮球赛', 1],
  ['opt_012','sv_003','乒乓球赛', 2],
  ['opt_013','sv_003','羽毛球赛', 3],
  ['opt_014','sv_003','接力赛', 4],
  ['opt_015','sv_003','拔河比赛', 5],
].forEach(d => iOption.run(...d));

// 已有投票数据（模拟已有人投票）
const responses = [
  // sv_001 优秀员工
  ['resp_001','sv_001','opt_001','emp-2','李雪梅'],['resp_002','sv_001','opt_001','emp-3','王建国'],['resp_003','sv_001','opt_001','emp-4','赵小燕'],
  ['resp_004','sv_001','opt_002','emp-1','张明辉'],['resp_005','sv_001','opt_002','emp-3','王建国'],
  ['resp_006','sv_001','opt_003','emp-1','张明辉'],['resp_007','sv_001','opt_003','emp-2','李雪梅'],['resp_008','sv_001','opt_003','emp-4','赵小燕'],
  ['resp_009','sv_001','opt_004','emp-1','张明辉'],['resp_010','sv_001','opt_004','emp-5','陈大伟'],
  // sv_002 满意度
  ['resp_011','sv_002','opt_006','emp-1','张明辉'],['resp_012','sv_002','opt_006','emp-2','李雪梅'],['resp_013','sv_002','opt_006','emp-3','王建国'],
  ['resp_014','sv_002','opt_007','emp-4','赵小燕'],['resp_015','sv_002','opt_007','emp-5','陈大伟'],
  ['resp_016','sv_002','opt_008','emp-6','刘美华'],
  // sv_003 运动会
  ['resp_017','sv_003','opt_011','emp-1','张明辉'],['resp_018','sv_003','opt_011','emp-2','李雪梅'],['resp_019','sv_003','opt_012','emp-3','王建国'],
  ['resp_020','sv_003','opt_013','emp-4','赵小燕'],['resp_021','sv_003','opt_014','emp-5','陈大伟'],
  ['resp_022','sv_003','opt_015','emp-1','张明辉'],['resp_023','sv_003','opt_015','emp-2','李雪梅'],['resp_024','sv_003','opt_015','emp-3','王建国'],
];
responses.forEach(d => iResp.run(...d));
console.log('问卷: 3条, 选项: 14条, 投票: ' + responses.length + '条');

// ===== 验证 =====
console.log('\n=== 验证 ===');
['doc_folders','documents','announcements','announcement_reads','surveys','survey_options','survey_responses'].forEach(t => {
  const cnt = db.prepare('SELECT COUNT(*) as c FROM '+t).get();
  console.log(t + ': ' + cnt.c + '条');
});

db.close();
console.log('\n✅ 综合事务模块初始化完成');
