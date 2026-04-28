// 综合事务模块：迁移列 + 种子数据（修复版）
const Database = require('better-sqlite3');
const db = new Database('D:/feida/data/ehr.db');

console.log('=== 列迁移 ===');
if (!db.prepare("PRAGMA table_info('announcements')").all().map(c=>c.name).includes('category')) {
  try { db.exec("ALTER TABLE announcements ADD COLUMN category TEXT DEFAULT 'notice'"); console.log('+ announcements.category'); } catch(e) {}
}
const svCols = db.prepare("PRAGMA table_info('surveys')").all().map(c=>c.name);
[['surveyType','TEXT DEFAULT survey'],['isAnonymous','INTEGER DEFAULT 0'],['isActive','INTEGER DEFAULT 1'],['allowChange','INTEGER DEFAULT 0'],['createdBy','TEXT DEFAULT admin'],['deadline','TEXT DEFAULT']].forEach(([col,def]) => {
  if (!svCols.includes(col)) { try { db.exec("ALTER TABLE surveys ADD COLUMN "+col+" "+def); console.log('+ surveys.'+col); } catch(e){} }
});
if (!db.prepare("PRAGMA table_info('survey_options')").all().map(c=>c.name).includes('optionType')) {
  try { db.exec("ALTER TABLE survey_options ADD COLUMN optionType TEXT DEFAULT 'text'"); console.log('+ survey_options.optionType'); } catch(e) {}
}
const srCols = db.prepare("PRAGMA table_info('survey_responses')").all().map(c=>c.name);
if (!srCols.includes('optionId') || !srCols.includes('optionText') || !srCols.includes('employeeName')) {
  db.exec("CREATE TABLE IF NOT EXISTS survey_responses_new (id TEXT PRIMARY KEY,surveyId TEXT NOT NULL,userId TEXT,answers TEXT DEFAULT '{}',submittedAt TEXT,optionId TEXT DEFAULT '',optionText TEXT DEFAULT '',employeeName TEXT DEFAULT '')");
  db.exec("INSERT INTO survey_responses_new(id,surveyId,userId,answers,submittedAt) SELECT id,surveyId,userId,answers,submittedAt FROM survey_responses");
  db.exec("DROP TABLE survey_responses");
  db.exec("ALTER TABLE survey_responses_new RENAME TO survey_responses");
  console.log('survey_responses 已重建，新增 optionId/optionText/employeeName');
}

// 清空
['doc_folders','documents','announcements','announcement_reads','surveys','survey_options','survey_responses'].forEach(t => { try { db.exec('DELETE FROM '+t); } catch(e){} });
const today = new Date();
const fmtDate = d => d.toISOString().slice(0,10);

console.log('\n=== 种子数据 ===');

// 1. 文档文件夹
const fi = db.prepare('INSERT INTO doc_folders (id,name,parentId,accessLevel,createdBy) VALUES (?,?,?,?,?)');
fi.run('f_root','公共文档','','all','admin');
fi.run('f_hr','人力资源','','hr','admin');
fi.run('f_fin','财务管理','','finance','admin');
fi.run('f_pub','行政公告','','all','admin');
console.log('文件夹: 4条');

// 2. 文档
const di = db.prepare('INSERT INTO documents (id,folderId,name,type,size,mimeType,url,content,accessLevel,uploaderId,uploaderName,downloads) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
const docs = [
  ['doc_001','f_root','员工手册2026版','pdf',2048000,'application/pdf','','','all','admin','管理员',42],
  ['doc_002','f_root','公司组织架构图','pdf',512000,'application/pdf','','','all','admin','管理员',38],
  ['doc_003','f_hr','入职培训资料','docx',1024000,'application/vnd.openxmlformats-officedocument.wordprocessingml.document','','','hr','admin','管理员',15],
  ['doc_004','f_hr','绩效考核方案','pdf',768000,'application/pdf','','','hr','admin','管理员',22],
  ['doc_005','f_fin','2026年财务管理制度','pdf',1536000,'application/pdf','','','finance','admin','管理员',10],
  ['doc_006','f_pub','考勤管理办法','pdf',256000,'application/pdf','','','all','admin','管理员',56],
  ['doc_007','f_pub','会议室使用规范','pdf',128000,'application/pdf','','','all','admin','管理员',33],
];
docs.forEach(d => di.run(...d));
console.log('文档: ' + docs.length + '条');

// 3. 通知公告
const ai = db.prepare('INSERT INTO announcements (id,title,content,category,isPinned,isTop,type,priority,authorId,authorName,readCount,status,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)');
const anns = [
  ['ann_001','关于2026年五一劳动节放假安排的通知','各部门：根据国家规定，现将2026年五一劳动节放假安排通知如下：5月1日至5月5日放假调休，共5天。4月27日（周日）、5月10日（周六）上班。请各部门做好值班安排。','notice',1,1,'notice','high','admin','管理员',45,'published',fmtDate(today)],
  ['ann_002','关于开展2026年度员工体检的通知','公司定于5月15日至6月30日组织年度员工体检，请各部门于4月30日前将体检名单报至人力资源部。体检地点：市中心医院体检中心。','notice',0,1,'notice','medium','admin','管理员',38,'published',fmtDate(today)],
  ['ann_003','关于启用新版OA系统的通知','各部门：我司新版OA系统已完成测试，定于5月6日正式上线。原系统将于5月10日停止使用。请各部门尽快完成迁移工作。','notice',0,0,'notice','high','admin','管理员',52,'published',fmtDate(today)],
  ['ann_004','关于举办2026年春季运动会的通知','为丰富员工文化生活，增强团队凝聚力，公司决定举办2026年春季运动会。时间：5月20日，地点：市体育中心。报名截止：5月10日。','activity',0,0,'activity','medium','admin','管理员',30,'published',fmtDate(today)],
  ['ann_005','关于公司班车路线调整的通知','自5月1日起，公司班车线路调整如下：新增地铁接驳线（早7:30、晚18:30），原东线取消。具体时刻表见附件。','notice',0,0,'notice','low','admin','管理员',41,'published',fmtDate(today)],
];
anns.forEach(d => ai.run(...d));

const ari = db.prepare('INSERT INTO announcement_reads (id,announcementId,userId,employeeId,employeeName,readAt) VALUES (?,?,?,?,?,?)');
const reads = [
  ['ar_001','ann_001','emp-1','emp-1','张明辉',fmtDate(today)],
  ['ar_002','ann_001','emp-2','emp-2','李雪梅',fmtDate(today)],
  ['ar_003','ann_001','emp-3','emp-3','王建国',fmtDate(today)],
  ['ar_004','ann_002','emp-1','emp-1','张明辉',fmtDate(today)],
  ['ar_005','ann-002','emp-4','emp-4','赵小燕',fmtDate(today)],
  ['ar_006','ann_003','emp-1','emp-1','张明辉',fmtDate(today)],
  ['ar_007','ann_003','emp-2','emp-2','李雪梅',fmtDate(today)],
  ['ar_008','ann_003','emp-3','emp-3','王建国',fmtDate(today)],
  ['ar_009','ann_004','emp-2','emp-2','李雪梅',fmtDate(today)],
  ['ar_010','ann_005','emp-1','emp-1','张明辉',fmtDate(today)],
  ['ar_011','ann_005','emp-2','emp-2','李雪梅',fmtDate(today)],
  ['ar_012','ann_005','emp-3','emp-3','王建国',fmtDate(today)],
  ['ar_013','ann_005','emp-4','emp-4','赵小燕',fmtDate(today)],
  ['ar_014','ann_005','emp-5','emp-5','陈大伟',fmtDate(today)],
];
reads.forEach(d => { try { ari.run(...d); } catch(e){} });
console.log('公告: ' + anns.length + '条, 阅读记录: ' + reads.length + '条');

// 4. 问卷投票
const svi = db.prepare('INSERT INTO surveys (id,title,description,surveyType,isAnonymous,isActive,createdBy,deadline,status,type,responseCount,multipleResponses) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
svi.run('sv_001','2026年度优秀员工评选','请从候选人中选出您心目中的优秀员工（可多选）','vote',0,1,'admin','','active','vote',5,1);
svi.run('sv_002','员工满意度调查问卷','感谢您参与本次满意度调查','survey',0,1,'admin',fmtDate(new Date(today.getTime()+7*86400000)),'active','survey',6,0);
svi.run('sv_003','春季运动会项目投票','请选择您希望参加的运动项目（可多选）','vote',0,1,'admin','','active','vote',6,1);
console.log('问卷: 3条');

const oi = db.prepare('INSERT INTO survey_options (id,surveyId,optionText,optionOrder,optionType) VALUES (?,?,?,?,?)');
[
  ['opt_001','sv_001','张明辉 - 技术部',1,'vote'],['opt_002','sv_001','李雪梅 - 财务部',2,'vote'],
  ['opt_003','sv_001','王建国 - 市场部',3,'vote'],['opt-004','sv_001','赵小燕 - 人力资源',4,'vote'],
  ['opt_005','sv_001','陈大伟 - 行政部',5,'vote'],
  ['opt_006','sv_002','非常满意',1,'radio'],['opt_007','sv_002','满意',2,'radio'],
  ['opt_008','sv_002','一般',3,'radio'],['opt_009','sv_002','不满意',4,'radio'],['opt_010','sv_002','非常不满意',5,'radio'],
  ['opt_011','sv_003','篮球赛',1,'vote'],['opt_012','sv_003','乒乓球赛',2,'vote'],
  ['opt_013','sv_003','羽毛球赛',3,'vote'],['opt_014','sv_003','接力赛',4,'vote'],['opt_015','sv_003','拔河比赛',5,'vote'],
].forEach(d => { try { oi.run(...d); } catch(e){} });
console.log('选项: 15条');

// 投票（多选用 answers JSON 存 optionId 数组；每用户每问卷一条）
const ri = db.prepare('INSERT INTO survey_responses (id,surveyId,userId,answers,employeeName) VALUES (?,?,?,?,?)');
const votes = [
  // sv_001 优秀员工投票
  ['resp_001','sv_001','emp-2','["opt_001"]','李雪梅'],['resp_002','sv_001','emp-3','["opt_003"]','王建国'],
  ['resp_003','sv_001','emp-4','["opt_001"]','赵小燕'],['resp_004','sv_001','emp-5','["opt_005"]','陈大伟'],
  ['resp_005','sv_001','emp-6','["opt_002"]','刘美华'],
  // sv_002 满意度
  ['resp_006','sv_002','emp-1','["opt_006"]','张明辉'],['resp_007','sv_002','emp-2','["opt_006"]','李雪梅'],
  ['resp_008','sv_002','emp-3','["opt_006"]','王建国'],['resp_009','sv_002','emp-4','["opt_007"]','赵小燕'],
  ['resp_010','sv_002','emp-5','["opt_007"]','陈大伟'],['resp_011','sv_002','emp-6','["opt_008"]','刘美华'],
  // sv_003 运动会
  ['resp_012','sv_003','emp-1','["opt_011","opt_015"]','张明辉'],['resp_013','sv_003','emp-2','["opt_012"]','李雪梅'],
  ['resp_014','sv_003','emp-3','["opt_013"]','王建国'],['resp_015','sv_003','emp-4','["opt_014"]','赵小燕'],
  ['resp_016','sv_003','emp-5','["opt_015"]','陈大伟'],['resp_017','sv_003','emp-6','["opt_011"]','刘美华'],
];
votes.forEach(d => { try { ri.run(...d); } catch(e){} });
console.log('投票: ' + votes.length + '条');

db.prepare("UPDATE surveys SET responseCount = (SELECT COUNT(*) FROM survey_responses WHERE surveyId = surveys.id)").run();

console.log('\n=== 验证 ===');
['doc_folders','documents','announcements','announcement_reads','surveys','survey_options','survey_responses'].forEach(t => {
  try { const c = db.prepare('SELECT COUNT(*) as c FROM '+t).get(); console.log(t + ': ' + c.c + '条'); } catch(e) { console.log(t + ': ' + e.message); }
});
db.close();
console.log('\n✅ 综合事务模块初始化完成');
