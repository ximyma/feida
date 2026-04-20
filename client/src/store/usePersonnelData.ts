import { useState, useCallback, useEffect } from 'react';

// ==================== 人事管理数据层 ====================
// 支持：自定义字段、子集管理、异动管理、合同管理、人才管理

const KEYS = {
  fieldDefinitions: '__hr_field_definitions',
  employeeSubsets: '__hr_employee_subsets',
  changeRecords: '__hr_change_records',
  employmentContracts: '__hr_employment_contracts',
  reminderRules: '__hr_reminder_rules',
  printTemplates: '__hr_print_templates',
  assessmentTools: '__hr_assessment_tools',
  competencyModels: '__hr_competency_models',
  competencyDict: '__hr_competency_dict',
  talentProfiles: '__hr_talent_profiles',
  talentReports: '__hr_talent_reports',
};

function load<T>(key: string, fallback: T): T {
  try {
    const s = sessionStorage.getItem(key);
    if (s) return JSON.parse(s);
  } catch { /* ignore */ }
  return fallback;
}

function save<T>(key: string, data: T) {
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch { /* ignore */ }
}

// ==================== 类型定义 ====================

/** 字段类型 */
export type FieldType = 'text' | 'number' | 'date' | 'select' | 'textarea' | 'phone' | 'email' | 'file';

/** 字段可见性 */
export type FieldVisibility = 'visible' | 'hidden' | 'required' | 'readonly';

/** 子集类型 */
export type SubsetType =
  | 'education'      // 学历信息
  | 'workExperience' // 工作经历
  | 'family'        // 家庭成员
  | 'emergency'      // 紧急联系人
  | 'certificate'   // 证书资质
  | 'training'      // 培训记录
  | 'political'      // 政治面貌
  | 'custom';       // 自定义子集

/** 异动类型 */
export type ChangeType =
  | 'positive'      // 转正
  | 'transfer'       // 调岗
  | 'secondment'     // 借调
  | 'resignation'   // 离职
  | 'retire'         // 退休
  | 'reinstatement'; // 复职

/** 合同状态 */
export type ContractStatus = 'active' | 'expiring' | 'expired' | 'terminated' | 'renewed';

/** 合同类型 */
export type ContractType = 'first' | 'fixed' | 'open';

/** 申请状态 */
export type RequestStatus = 'pending' | 'approved' | 'rejected';

/** 测评工具类型 */
export type AssessmentToolType = 'enneagram' | 'mbti' | 'pdp' | 'custom';

/** 胜任力冰山层面 */
export type IcebergLayer = 'knowledge' | 'skill' | 'selfConcept' | 'traits' | 'motivation' | 'other';

/** 人才盘点维度 */
export type TalentDimension = 'performance' | 'competency' | 'potential' | 'loyalty';

// ---- 字段定义 ----
export interface IFieldDefinition {
  id: string;
  group: 'basic' | 'contact' | 'education' | 'work' | 'salary' | 'contract' | 'custom';
  name: string;
  fieldKey: string;
  type: FieldType;
  visibility: FieldVisibility;
  required: boolean;
  options?: string[];      // select类型的选项
  placeholder?: string;
  order: number;
  isSystem: boolean;      // 系统字段不可删除
  remark?: string;
}

// ---- 员工子集记录 ----
export interface IEmployeeSubset {
  id: string;
  employeeId: string;
  type: SubsetType;
  data: Record<string, any>;
  updatedAt: string;
}

// ---- 异动记录 ----
export interface IChangeRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  changeType: ChangeType;
  changeDate: string;
  reason: string;
  beforeData: Record<string, any>;  // 异动前数据
  afterData: Record<string, any>;   // 异动后数据
  status: RequestStatus;
  applicant: string;
  approver?: string;
  approveTime?: string;
  rejectReason?: string;
  remark?: string;
}

// ---- 劳动合同 ----
export interface IEmploymentContract {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  contractType: ContractType;
  contractNo: string;
  startDate: string;
  endDate: string;
  signingDate?: string;
  renewalCount: number;     // 续签次数
  status: ContractStatus;
  contractFile?: string;    // 文件URL
  salary?: number;          // 合同工资
  isElectronic: boolean;    // 是否电子合同
  remark?: string;
}

// ---- 提醒规则 ----
export interface IReminderRule {
  id: string;
  name: string;
  type: 'probation' | 'retire' | 'workYears' | 'contract' | 'birthday' | 'custom';
  triggerDays: number[];    // 提前N天提醒
  targets: string[];        // 提醒对象: ['employee', 'manager', 'hr']
  content: string;
  isActive: boolean;
  remark?: string;
}

// ---- 打印模板 ----
export interface IPrintTemplate {
  id: string;
  name: string;
  type: 'idcard' | 'contract' | 'certificate' | 'custom';
  content: string;           // HTML模板，支持 {{field}} 占位符
  fields: string[];         // 使用的字段列表
  isDefault: boolean;
  remark?: string;
}

// ---- 测评工具 ----
export interface IAssessmentTool {
  id: string;
  name: string;
  type: AssessmentToolType;
  description: string;
  questions: IAssessmentQuestion[];
  scoringRules: Record<string, any>;
  isActive: boolean;
  remark?: string;
}

export interface IAssessmentQuestion {
  id: string;
  no: number;
  type: 'single' | 'multiple' | 'scale';
  content: string;
  options: { label: string; value: string; score: number }[];
  dimension?: string;
}

// ---- 能力素质字典 ----
export interface ICompetencyItem {
  id: string;
  name: string;
  icebergLayer: IcebergLayer;
  description: string;
  levels: ICompetencyLevel[];
  weight: number;            // 权重
  assessMethod: 'test' | 'interview' | '360' | 'performance';
  isActive: boolean;
}

export interface ICompetencyLevel {
  level: number;            // 1-5级
  name: string;             // 如"初级/中级/高级/资深/专家"
  description: string;
  behaviors: string[];       // 行为指标
}

// ---- 胜任力模型 ----
export interface ICompetencyModel {
  id: string;
  name: string;
  position?: string;         // 适用岗位
  description: string;
  competencies: IModelCompetency[];
  isActive: boolean;
  createdAt: string;
}

export interface IModelCompetency {
  competencyId: string;
  competencyName: string;
  weight: number;
  requiredLevel: number;     // 要求等级
}

// ---- 人才档案 ----
export interface ITalentProfile {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  assessmentResults: IAssessmentResult[];
  competencyScores: ICompetencyScore[];
  performanceData: string[];  // 绩效记录ID
  overallScore: number;        // 综合评价分
  talentGrid: [number, number]; // 九宫格坐标 [绩效, 潜力]
  label: 'star' | 'core' | 'growth' | 'risk';
  remark?: string;
  lastUpdated: string;
}

export interface IAssessmentResult {
  toolId: string;
  toolName: string;
  completedAt: string;
  score: number;
  result: Record<string, any>;
}

export interface ICompetencyScore {
  competencyId: string;
  competencyName: string;
  score: number;
  level: number;
  assessMethod: string;
}

// ---- 人才盘点报告 ----
export interface ITalentReport {
  id: string;
  name: string;
  period: string;
  createdAt: string;
  summary: ITalentSummary;
  gridData: ITalentGridItem[];
  recommendations: string;
}

export interface ITalentSummary {
  total: number;
  star: number;
  core: number;
  growth: number;
  risk: number;
  avgPerformance: number;
  avgPotential: number;
}

export interface ITalentGridItem {
  employeeId: string;
  employeeName: string;
  department: string;
  performance: number;    // 1-5
  potential: number;       // 1-5
  position: [number, number]; // 九宫格坐标
}

// ==================== 默认数据 ====================

export const DEFAULT_FIELD_DEFINITIONS: IFieldDefinition[] = [
  // 基本信息
  { id: 'f_name', group: 'basic', name: '姓名', fieldKey: 'name', type: 'text', visibility: 'required', required: true, order: 1, isSystem: true },
  { id: 'f_gender', group: 'basic', name: '性别', fieldKey: 'gender', type: 'select', visibility: 'required', required: true, order: 2, isSystem: true, options: ['男', '女'] },
  { id: 'f_idcard', group: 'basic', name: '身份证号', fieldKey: 'idCard', type: 'text', visibility: 'required', required: true, order: 3, isSystem: true },
  { id: 'f_birthday', group: 'basic', name: '出生日期', fieldKey: 'birthday', type: 'date', visibility: 'visible', required: false, order: 4, isSystem: true },
  { id: 'f_nation', group: 'basic', name: '民族', fieldKey: 'nation', type: 'text', visibility: 'visible', required: false, order: 5, isSystem: false },
  { id: 'f_political', group: 'basic', name: '政治面貌', fieldKey: 'politicalStatus', type: 'select', visibility: 'visible', required: false, order: 6, isSystem: false, options: ['群众', '共青团员', '中共党员', '中共预备党员', '其他'] },
  { id: 'f_marital', group: 'basic', name: '婚姻状况', fieldKey: 'maritalStatus', type: 'select', visibility: 'visible', required: false, order: 7, isSystem: false, options: ['未婚', '已婚', '离异', '丧偶'] },
  { id: 'f_native', group: 'basic', name: '籍贯', fieldKey: 'nativePlace', type: 'text', visibility: 'visible', required: false, order: 8, isSystem: false },
  { id: 'f_domicile', group: 'basic', name: '户籍所在地', fieldKey: 'domicile', type: 'text', visibility: 'visible', required: false, order: 9, isSystem: false },
  { id: 'f_height', group: 'basic', name: '身高(cm)', fieldKey: 'height', type: 'number', visibility: 'hidden', required: false, order: 10, isSystem: false },
  { id: 'f_blood', group: 'basic', name: '血型', fieldKey: 'bloodType', type: 'select', visibility: 'hidden', required: false, order: 11, isSystem: false, options: ['A', 'B', 'O', 'AB'] },
  // 联系方式
  { id: 'f_phone', group: 'contact', name: '手机号', fieldKey: 'phone', type: 'phone', visibility: 'required', required: true, order: 20, isSystem: true },
  { id: 'f_email', group: 'contact', name: '邮箱', fieldKey: 'email', type: 'email', visibility: 'visible', required: false, order: 21, isSystem: true },
  { id: 'f_wechat', group: 'contact', name: '微信', fieldKey: 'wechat', type: 'text', visibility: 'visible', required: false, order: 22, isSystem: false },
  { id: 'f_emergency', group: 'contact', name: '紧急联系人', fieldKey: 'emergencyContact', type: 'text', visibility: 'visible', required: false, order: 23, isSystem: false },
  { id: 'f_emergency_phone', group: 'contact', name: '紧急联系电话', fieldKey: 'emergencyPhone', type: 'phone', visibility: 'visible', required: false, order: 24, isSystem: false },
  { id: 'f_address', group: 'contact', name: '现居住地址', fieldKey: 'address', type: 'textarea', visibility: 'visible', required: false, order: 25, isSystem: false },
  // 教育信息
  { id: 'f_education', group: 'education', name: '最高学历', fieldKey: 'education', type: 'select', visibility: 'visible', required: false, order: 30, isSystem: true, options: ['初中', '高中', '中专', '大专', '本科', '硕士', '博士'] },
  { id: 'f_school', group: 'education', name: '毕业院校', fieldKey: 'school', type: 'text', visibility: 'visible', required: false, order: 31, isSystem: false },
  { id: 'f_major', group: 'education', name: '所学专业', fieldKey: 'major', type: 'text', visibility: 'visible', required: false, order: 32, isSystem: false },
  { id: 'f_graduation', group: 'education', name: '毕业时间', fieldKey: 'graduationDate', type: 'date', visibility: 'visible', required: false, order: 33, isSystem: false },
  // 工作信息
  { id: 'f_empid', group: 'work', name: '工号', fieldKey: 'employeeId', type: 'text', visibility: 'readonly', required: true, order: 40, isSystem: true },
  { id: 'f_dept', group: 'work', name: '部门', fieldKey: 'department', type: 'text', visibility: 'readonly', required: true, order: 41, isSystem: true },
  { id: 'f_position', group: 'work', name: '岗位', fieldKey: 'position', type: 'text', visibility: 'readonly', required: true, order: 42, isSystem: true },
  { id: 'f_rank', group: 'work', name: '职级', fieldKey: 'rank', type: 'text', visibility: 'readonly', required: false, order: 43, isSystem: true },
  { id: 'f_hiredate', group: 'work', name: '入职日期', fieldKey: 'hireDate', type: 'date', visibility: 'required', required: true, order: 44, isSystem: true },
  { id: 'f_probation', group: 'work', name: '试用期(月)', fieldKey: 'probationMonths', type: 'number', visibility: 'visible', required: false, order: 45, isSystem: false },
  { id: 'f_worktype', group: 'work', name: '用工性质', fieldKey: 'workType', type: 'select', visibility: 'visible', required: false, order: 46, isSystem: false, options: ['劳动合同', '劳务派遣', '实习生', '外包', '兼职'] },
  { id: 'f_location', group: 'work', name: '工作地点', fieldKey: 'workLocation', type: 'text', visibility: 'visible', required: false, order: 47, isSystem: false },
  { id: 'f_bank', group: 'salary', name: '开户银行', fieldKey: 'bankName', type: 'text', visibility: 'visible', required: false, order: 50, isSystem: false },
  { id: 'f_bankno', group: 'salary', name: '银行卡号', fieldKey: 'bankAccount', type: 'text', visibility: 'hidden', required: false, order: 51, isSystem: false },
  { id: 'f_salary_loc', group: 'salary', name: '薪资地区', fieldKey: 'salaryLocation', type: 'select', visibility: 'visible', required: false, order: 52, isSystem: true, options: ['深圳', '南京', '江西'] },
];

export const DEFAULT_REMINDER_RULES: IReminderRule[] = [
  { id: 'rr_probation', name: '转正提醒', type: 'probation', triggerDays: [-3, 0], targets: ['employee', 'hr'], content: '您好，您的试用期即将结束，请关注转正流程。', isActive: true },
  { id: 'rr_contract', name: '合同到期提醒', type: 'contract', triggerDays: [-30, -7, 0], targets: ['hr'], content: '劳动合同将于{{days}}天后到期，请及时处理。', isActive: true },
  { id: 'rr_birthday', name: '生日提醒', type: 'birthday', triggerDays: [0], targets: ['manager'], content: '明天是{{name}}的生日🎂', isActive: true },
];

export const DEFAULT_PRINT_TEMPLATES: IPrintTemplate[] = [
  {
    id: 'tpl_idcard', name: '员工工卡', type: 'idcard', isDefault: true,
    content: `<div class="idcard">
  <div class="photo">照片</div>
  <div class="info">
    <h2>{{name}}</h2>
    <p>工号：{{employeeId}}</p>
    <p>部门：{{department}}</p>
    <p>岗位：{{position}}</p>
  </div>
</div>`,
    fields: ['name', 'employeeId', 'department', 'position', 'hireDate'],
    remark: '默认工卡模板',
  },
  {
    id: 'tpl_contract', name: '劳动合同模板', type: 'contract', isDefault: false,
    content: `<h1>劳动合同</h1>
<p>甲方（用人单位）：飞达智能科技有限公司</p>
<p>乙方（劳动者）：{{name}}</p>
<p>身份证号：{{idCard}}</p>
<p>合同期限：{{startDate}} 至 {{endDate}}</p>`,
    fields: ['name', 'idCard', 'department', 'position', 'startDate', 'endDate'],
    remark: '标准劳动合同模板',
  },
];

export const DEFAULT_ASSESSMENT_TOOLS: IAssessmentTool[] = [
  {
    id: 'tool_enneagram', name: '九型人格测试', type: 'enneagram', isActive: true,
    description: '识别员工性格类型，帮助团队建设和岗位匹配',
    questions: [
      { id: 'q1', no: 1, type: 'single', content: '在社交场合，你通常倾向于：', dimension: 'social', options: [
        { label: '主动与人交谈', value: 'A', score: 3 },
        { label: '等待别人来搭话', value: 'B', score: 1 },
        { label: '观察形势再决定', value: 'C', score: 2 },
      ]},
      { id: 'q2', no: 2, type: 'single', content: '面对压力时，你的反应通常是：', dimension: 'stress', options: [
        { label: '向他人倾诉', value: 'A', score: 3 },
        { label: '独自思考解决', value: 'B', score: 2 },
        { label: '暂时逃避', value: 'C', score: 1 },
      ]},
      { id: 'q3', no: 3, type: 'single', content: '你更看重工作中的：', dimension: 'value', options: [
        { label: '成就感与结果', value: 'A', score: 3 },
        { label: '人际关系', value: 'B', score: 2 },
        { label: '稳定与安全', value: 'C', score: 1 },
      ]},
    ],
    scoringRules: { type: 'profile', thresholds: [] },
  },
  {
    id: 'tool_mbti', name: 'MBTI职业性格测试', type: 'mbti', isActive: true,
    description: '基于MBTI理论的性格评估工具，识别16种性格类型',
    questions: [
      { id: 'm1', no: 1, type: 'single', content: '你更愿意从哪种方式获取能量？', dimension: 'EI', options: [
        { label: '与他人相处（E）', value: 'E', score: 1 },
        { label: '独处思考（I）', value: 'I', score: 1 },
      ]},
      { id: 'm2', no: 2, type: 'single', content: '你更关注事物的：', dimension: 'SN', options: [
        { label: '具体事实（S）', value: 'S', score: 1 },
        { label: '可能性和想象（N）', value: 'N', score: 1 },
      ]},
      { id: 'm3', no: 3, type: 'single', content: '做决策时你更依赖：', dimension: 'TF', options: [
        { label: '逻辑分析（T）', value: 'T', score: 1 },
        { label: '情感和价值（F）', value: 'F', score: 1 },
      ]},
      { id: 'm4', no: 4, type: 'single', content: '你更喜欢的生活方式：', dimension: 'JP', options: [
        { label: '有计划有安排（J）', value: 'J', score: 1 },
        { label: '灵活随性（P）', value: 'P', score: 1 },
      ]},
    ],
    scoringRules: { type: 'mbti', dimensions: ['EI', 'SN', 'TF', 'JP'] },
  },
  {
    id: 'tool_pdp', name: 'PDP性格测试', type: 'pdp', isActive: true,
    description: '识别员工的行为特质和沟通风格',
    questions: [
      { id: 'p1', no: 1, type: 'scale', content: '在工作中我更喜欢快速决策', options: [
        { label: '完全同意', value: '5', score: 5 },
        { label: '比较同意', value: '4', score: 4 },
        { label: '中立', value: '3', score: 3 },
        { label: '不太同意', value: '2', score: 2 },
        { label: '完全不同意', value: '1', score: 1 },
      ], dimension: 'decisiveness' },
      { id: 'p2', no: 2, type: 'scale', content: '我擅长在团队中推动项目进展', options: [
        { label: '完全同意', value: '5', score: 5 },
        { label: '比较同意', value: '4', score: 4 },
        { label: '中立', value: '3', score: 3 },
        { label: '不太同意', value: '2', score: 2 },
        { label: '完全不同意', value: '1', score: 1 },
      ], dimension: 'influence' },
    ],
    scoringRules: { type: 'pdp', profiles: ['老虎', '孔雀', '考拉', '猫头鹰', '变色龙'] },
  },
];

export const DEFAULT_COMPETENCY_DICT: ICompetencyItem[] = [
  {
    id: 'comp_1', name: '专业知识', icebergLayer: 'knowledge', weight: 15,
    description: '掌握本岗位所需的专业知识',
    assessMethod: 'test',
    isActive: true,
    levels: [
      { level: 1, name: '了解', description: '对专业知识有基本了解', behaviors: ['能说出基本概念', '能在指导下完成工作'] },
      { level: 2, name: '掌握', description: '掌握专业知识并能独立应用', behaviors: ['能独立处理常见问题', '能为他人提供专业建议'] },
      { level: 3, name: '精通', description: '深入理解专业知识', behaviors: ['能解决复杂专业问题', '能培训和指导他人'] },
    ],
  },
  {
    id: 'comp_2', name: '沟通能力', icebergLayer: 'skill', weight: 20,
    description: '有效表达和传递信息的能力',
    assessMethod: 'interview',
    isActive: true,
    levels: [
      { level: 1, name: '基础', description: '能进行基本沟通', behaviors: ['表达基本清晰', '能理解简单指令'] },
      { level: 2, name: '良好', description: '沟通表达流畅有效', behaviors: ['表达逻辑清晰', '能进行跨部门沟通'] },
      { level: 3, name: '优秀', description: '沟通影响力强', behaviors: ['演讲能力强', '能处理复杂谈判'] },
    ],
  },
  {
    id: 'comp_3', name: '团队协作', icebergLayer: 'skill', weight: 15,
    description: '与团队成员有效合作的能力',
    assessMethod: '360',
    isActive: true,
    levels: [
      { level: 1, name: '参与', description: '能参与团队协作', behaviors: ['配合团队安排', '能完成分配任务'] },
      { level: 2, name: '贡献', description: '主动为团队贡献', behaviors: ['主动承担更多', '帮助团队成员'] },
      { level: 3, name: '引领', description: '能引领团队协作', behaviors: ['协调团队冲突', '提升团队整体效能'] },
    ],
  },
  {
    id: 'comp_4', name: '问题解决', icebergLayer: 'traits', weight: 20,
    description: '分析和解决问题的能力',
    assessMethod: 'performance',
    isActive: true,
    levels: [
      { level: 1, name: '执行', description: '能按流程解决问题', behaviors: ['理解问题准确', '按流程处理'] },
      { level: 2, name: '分析', description: '能分析问题根源', behaviors: ['分析问题全面', '能找到根本原因'] },
      { level: 3, name: '创新', description: '能创新解决问题', behaviors: ['提出创新方案', '优化现有流程'] },
    ],
  },
  {
    id: 'comp_5', name: '学习成长', icebergLayer: 'motivation', weight: 15,
    description: '主动学习和自我提升的意愿',
    assessMethod: 'test',
    isActive: true,
    levels: [
      { level: 1, name: '被动', description: '需要推动才学习', behaviors: ['能完成培训', '愿意接受新知识'] },
      { level: 2, name: '主动', description: '主动学习提升', behaviors: ['制定学习计划', '主动应用新知识'] },
      { level: 3, name: '引领', description: '引领团队学习', behaviors: ['建立学习机制', '推动团队成长'] },
    ],
  },
  {
    id: 'comp_6', name: '责任心', icebergLayer: 'motivation', weight: 15,
    description: '对工作认真负责的态度',
    assessMethod: '360',
    isActive: true,
    levels: [
      { level: 1, name: '尽职', description: '做好本职工作', behaviors: ['按时完成任务', '对结果负责'] },
      { level: 2, name: '担当', description: '主动承担责任', behaviors: ['主动承担额外任务', '不推卸责任'] },
      { level: 3, name: '卓越', description: '追求卓越结果', behaviors: ['超出预期完成', '持续改进'] },
    ],
  },
];

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  positive: '转正',
  transfer: '调岗',
  secondment: '借调',
  resignation: '离职',
  retire: '退休',
  reinstatement: '复职',
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  active: '生效中',
  expiring: '即将到期',
  expired: '已到期',
  terminated: '已终止',
  renewed: '已续签',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  first: '第一次合同',
  fixed: '定期合同',
  open: '无固定期限合同',
};

export const SUBSET_TYPE_LABELS: Record<SubsetType, string> = {
  education: '学历信息',
  workExperience: '工作经历',
  family: '家庭成员',
  emergency: '紧急联系人',
  certificate: '证书资质',
  training: '培训记录',
  political: '政治面貌',
  custom: '自定义',
};

export const ICEBERG_LABELS: Record<IcebergLayer, string> = {
  knowledge: '知识',
  skill: '技能',
  selfConcept: '自我认知',
  traits: '特质',
  motivation: '动机',
  other: '其他',
};

export const TALENT_GRID_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  star: { label: '明星人才', color: 'text-green-600 bg-green-50 border-green-200', desc: '高绩效 × 高潜力' },
  core: { label: '核心骨干', color: 'text-blue-600 bg-blue-50 border-blue-200', desc: '高绩效 × 中潜力' },
  growth: { label: '成长人才', color: 'text-amber-600 bg-amber-50 border-amber-200', desc: '中绩效 × 高潜力' },
  risk: { label: '风险人才', color: 'text-red-600 bg-red-50 border-red-200', desc: '需关注提升' },
};

// ==================== 工具函数 ====================

/** 根据生日计算年龄 */
export function calculateAge(birthday: string): number {
  if (!birthday) return 0;
  const birth = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

/** 计算工龄 */
export function calculateWorkYears(hireDate: string): number {
  if (!hireDate) return 0;
  const hire = new Date(hireDate);
  const today = new Date();
  const years = (today.getTime() - hire.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.round(years * 10) / 10;
}

/** 判断合同是否即将到期（30天内） */
export function isContractExpiring(endDate: string): boolean {
  if (!endDate) return false;
  const end = new Date(endDate);
  const today = new Date();
  const diff = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= 30;
}

/** 判断合同是否已到期 */
export function isContractExpired(endDate: string): boolean {
  if (!endDate) return false;
  return new Date(endDate) < new Date();
}

/** 判断是否快到转正日期 */
export function isProbationEnding(hireDate: string, probationMonths: number): boolean {
  if (!hireDate || !probationMonths) return false;
  const end = new Date(hireDate);
  end.setMonth(end.getMonth() + probationMonths);
  const today = new Date();
  const diff = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}

/** 判断是否快到退休年龄（男60岁，女55岁） */
export function isNearRetire(birthday: string, gender: string): boolean {
  const age = calculateAge(birthday);
  const retireAge = gender === '女' ? 55 : 60;
  return age >= retireAge - 1 && age < retireAge;
}

/** 生成工号 */
export function generateEmployeeId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `${year}${random}`;
}

/** 替换模板变量 */
export function renderTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
}

// ==================== 数据 Hook ====================

export function usePersonnelData() {
  const [fieldDefinitions, setFieldDefinitions] = useState<IFieldDefinition[]>(
    () => load(KEYS.fieldDefinitions, DEFAULT_FIELD_DEFINITIONS)
  );
  const [employeeSubsets, setEmployeeSubsets] = useState<IEmployeeSubset[]>(() =>
    load(KEYS.employeeSubsets, [])
  );
  const [changeRecords, setChangeRecords] = useState<IChangeRecord[]>(() =>
    load(KEYS.changeRecords, [])
  );
  const [contracts, setContracts] = useState<IEmploymentContract[]>(() =>
    load(KEYS.employmentContracts, [])
  );
  const [reminderRules, setReminderRules] = useState<IReminderRule[]>(
    () => load(KEYS.reminderRules, DEFAULT_REMINDER_RULES)
  );
  const [printTemplates, setPrintTemplates] = useState<IPrintTemplate[]>(
    () => load(KEYS.printTemplates, DEFAULT_PRINT_TEMPLATES)
  );
  const [assessmentTools, setAssessmentTools] = useState<IAssessmentTool[]>(
    () => load(KEYS.assessmentTools, DEFAULT_ASSESSMENT_TOOLS)
  );
  const [competencyDict, setCompetencyDict] = useState<ICompetencyItem[]>(
    () => load(KEYS.competencyDict, DEFAULT_COMPETENCY_DICT)
  );
  const [competencyModels, setCompetencyModels] = useState<ICompetencyModel[]>(() =>
    load(KEYS.competencyModels, [])
  );
  const [talentProfiles, setTalentProfiles] = useState<ITalentProfile[]>(() =>
    load(KEYS.talentProfiles, [])
  );
  const [talentReports, setTalentReports] = useState<ITalentReport[]>(() =>
    load(KEYS.talentReports, [])
  );

  // 持久化
  useEffect(() => { save(KEYS.fieldDefinitions, fieldDefinitions); }, [fieldDefinitions]);
  useEffect(() => { save(KEYS.employeeSubsets, employeeSubsets); }, [employeeSubsets]);
  useEffect(() => { save(KEYS.changeRecords, changeRecords); }, [changeRecords]);
  useEffect(() => { save(KEYS.employmentContracts, contracts); }, [contracts]);
  useEffect(() => { save(KEYS.reminderRules, reminderRules); }, [reminderRules]);
  useEffect(() => { save(KEYS.printTemplates, printTemplates); }, [printTemplates]);
  useEffect(() => { save(KEYS.assessmentTools, assessmentTools); }, [assessmentTools]);
  useEffect(() => { save(KEYS.competencyDict, competencyDict); }, [competencyDict]);
  useEffect(() => { save(KEYS.competencyModels, competencyModels); }, [competencyModels]);
  useEffect(() => { save(KEYS.talentProfiles, talentProfiles); }, [talentProfiles]);
  useEffect(() => { save(KEYS.talentReports, talentReports); }, [talentReports]);

  // ---- 字段定义操作 ----
  const addFieldDefinition = useCallback((field: IFieldDefinition) => {
    setFieldDefinitions(prev => [...prev, { ...field, id: `f_${Date.now()}` }]);
  }, []);
  const updateFieldDefinition = useCallback((id: string, data: Partial<IFieldDefinition>) => {
    setFieldDefinitions(prev => prev.map(f => f.id === id ? { ...f, ...data } : f));
  }, []);
  const removeFieldDefinition = useCallback((id: string) => {
    setFieldDefinitions(prev => prev.filter(f => f.id !== id && f.fieldKey !== id));
  }, []);
  const resetFieldDefinitions = useCallback(() => {
    setFieldDefinitions([...DEFAULT_FIELD_DEFINITIONS]);
  }, []);

  // ---- 员工子集操作 ----
  const getSubsetsByEmployee = useCallback((employeeId: string) =>
    employeeSubsets.filter(s => s.employeeId === employeeId), [employeeSubsets]);
  const getSubsetsByType = useCallback((type: SubsetType) =>
    employeeSubsets.filter(s => s.type === type), [employeeSubsets]);
  const addEmployeeSubset = useCallback((subset: IEmployeeSubset) => {
    setEmployeeSubsets(prev => {
      const idx = prev.findIndex(s => s.employeeId === subset.employeeId && s.type === subset.type);
      if (idx >= 0) return prev.map((s, i) => i === idx ? { ...s, ...subset } : s);
      return [...prev, { ...subset, id: `sub_${Date.now()}` }];
    });
  }, []);
  const updateEmployeeSubset = useCallback((id: string, data: Partial<IEmployeeSubset>) => {
    setEmployeeSubsets(prev => prev.map(s => s.id === id ? { ...s, ...data, updatedAt: new Date().toISOString() } : s));
  }, []);
  const removeEmployeeSubset = useCallback((id: string) => {
    setEmployeeSubsets(prev => prev.filter(s => s.id !== id));
  }, []);

  // ---- 异动记录操作 ----
  const getChangesByEmployee = useCallback((employeeId: string) =>
    changeRecords.filter(c => c.employeeId === employeeId), [changeRecords]);
  const getChangesByType = useCallback((type: ChangeType) =>
    changeRecords.filter(c => c.changeType === type), [changeRecords]);
  const getPendingChanges = useCallback(() =>
    changeRecords.filter(c => c.status === 'pending'), [changeRecords]);
  const addChangeRecord = useCallback((record: IChangeRecord) => {
    setChangeRecords(prev => [...prev, { ...record, id: `chg_${Date.now()}` }]);
  }, []);
  const approveChange = useCallback((id: string, approver: string) => {
    setChangeRecords(prev => prev.map(c => c.id === id ? { ...c, status: 'approved', approver, approveTime: new Date().toISOString() } : c));
  }, []);
  const rejectChange = useCallback((id: string, approver: string, reason: string) => {
    setChangeRecords(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected', approver, approveTime: new Date().toISOString(), rejectReason: reason } : c));
  }, []);

  // ---- 合同操作 ----
  const getContractsByEmployee = useCallback((employeeId: string) =>
    contracts.filter(c => c.employeeId === employeeId), [contracts]);
  const getExpiringContracts = useCallback((days = 30) => {
    const today = new Date();
    return contracts.filter(c => {
      if (c.status === 'expired' || c.status === 'terminated') return false;
      const end = new Date(c.endDate);
      const diff = (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= days;
    });
  }, [contracts]);
  const getExpiredContracts = useCallback(() =>
    contracts.filter(c => c.status === 'expired' || (new Date(c.endDate) < new Date() && c.status !== 'terminated')), [contracts]);
  const addContract = useCallback((contract: IEmploymentContract) => {
    setContracts(prev => [...prev, { ...contract, id: `con_${Date.now()}` }]);
  }, []);
  const updateContract = useCallback((id: string, data: Partial<IEmploymentContract>) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);
  const renewContract = useCallback((id: string, newEndDate: string) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, endDate: newEndDate, renewalCount: c.renewalCount + 1, status: 'renewed' } : c));
  }, []);
  const terminateContract = useCallback((id: string, reason: string) => {
    setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'terminated', remark: (c.remark || '') + ` [终止原因:${reason}]` } : c));
  }, []);
  const batchImportContracts = useCallback((newContracts: IEmploymentContract[]) => {
    setContracts(prev => {
      const result = [...prev];
      for (const c of newContracts) {
        const idx = result.findIndex(r => r.employeeId === c.employeeId);
        if (idx >= 0) result[idx] = c;
        else result.push({ ...c, id: `con_${Date.now()}_${Math.random().toString(36).slice(2)}` });
      }
      return result;
    });
  }, []);

  // ---- 提醒规则操作 ----
  const addReminderRule = useCallback((rule: IReminderRule) => {
    setReminderRules(prev => [...prev, { ...rule, id: `rr_${Date.now()}` }]);
  }, []);
  const updateReminderRule = useCallback((id: string, data: Partial<IReminderRule>) => {
    setReminderRules(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  }, []);
  const removeReminderRule = useCallback((id: string) => {
    setReminderRules(prev => prev.filter(r => r.id !== id));
  }, []);

  // ---- 打印模板操作 ----
  const addPrintTemplate = useCallback((tpl: IPrintTemplate) => {
    setPrintTemplates(prev => [...prev, { ...tpl, id: `tpl_${Date.now()}` }]);
  }, []);
  const updatePrintTemplate = useCallback((id: string, data: Partial<IPrintTemplate>) => {
    setPrintTemplates(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);
  const removePrintTemplate = useCallback((id: string) => {
    setPrintTemplates(prev => prev.filter(t => t.id !== id));
  }, []);
  const setDefaultTemplate = useCallback((id: string) => {
    setPrintTemplates(prev => prev.map(t => ({ ...t, isDefault: t.id === id })));
  }, []);

  // ---- 测评工具操作 ----
  const addAssessmentTool = useCallback((tool: IAssessmentTool) => {
    setAssessmentTools(prev => [...prev, { ...tool, id: `tool_${Date.now()}` }]);
  }, []);
  const updateAssessmentTool = useCallback((id: string, data: Partial<IAssessmentTool>) => {
    setAssessmentTools(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  }, []);
  const removeAssessmentTool = useCallback((id: string) => {
    setAssessmentTools(prev => prev.filter(t => t.id !== id));
  }, []);

  // ---- 能力素质字典操作 ----
  const addCompetencyItem = useCallback((item: ICompetencyItem) => {
    setCompetencyDict(prev => [...prev, { ...item, id: `comp_${Date.now()}` }]);
  }, []);
  const updateCompetencyItem = useCallback((id: string, data: Partial<ICompetencyItem>) => {
    setCompetencyDict(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  }, []);
  const removeCompetencyItem = useCallback((id: string) => {
    setCompetencyDict(prev => prev.filter(c => c.id !== id));
  }, []);

  // ---- 胜任力模型操作 ----
  const addCompetencyModel = useCallback((model: ICompetencyModel) => {
    setCompetencyModels(prev => [...prev, { ...model, id: `model_${Date.now()}`, createdAt: new Date().toISOString() }]);
  }, []);
  const updateCompetencyModel = useCallback((id: string, data: Partial<ICompetencyModel>) => {
    setCompetencyModels(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  }, []);
  const removeCompetencyModel = useCallback((id: string) => {
    setCompetencyModels(prev => prev.filter(m => m.id !== id));
  }, []);

  // ---- 人才档案操作 ----
  const addOrUpdateTalentProfile = useCallback((profile: ITalentProfile) => {
    setTalentProfiles(prev => {
      const idx = prev.findIndex(p => p.employeeId === profile.employeeId);
      if (idx >= 0) return prev.map((p, i) => i === idx ? { ...profile, id: p.id, lastUpdated: new Date().toISOString() } : p);
      return [...prev, { ...profile, id: `tp_${Date.now()}`, lastUpdated: new Date().toISOString() }];
    });
  }, []);
  const updateTalentProfile = useCallback((id: string, data: Partial<ITalentProfile>) => {
    setTalentProfiles(prev => prev.map(p => p.id === id ? { ...p, ...data, lastUpdated: new Date().toISOString() } : p));
  }, []);

  // ---- 人才盘点报告操作 ----
  const addTalentReport = useCallback((report: ITalentReport) => {
    setTalentReports(prev => [...prev, { ...report, id: `rpt_${Date.now()}` }]);
  }, []);

  // ---- 提醒生成 ----
  const generateReminders = useCallback((employees: { employeeId: string; name: string; hireDate: string; birthday: string; gender?: string; probationMonths?: number }[]) => {
    const today = new Date();
    const reminders: { employeeId: string; name: string; type: string; message: string; urgency: 'high' | 'normal' | 'low' }[] = [];
    for (const emp of employees) {
      const activeRules = reminderRules.filter(r => r.isActive);
      for (const rule of activeRules) {
        if (rule.type === 'birthday' && emp.birthday) {
          const bd = new Date(emp.birthday);
          const thisBd = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
          const diff = (thisBd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
          if (Math.abs(diff) <= 7) {
            reminders.push({
              employeeId: emp.employeeId,
              name: emp.name,
              type: 'birthday',
              message: `生日提醒：${emp.name}的生日${diff === 0 ? '是今天🎂' : diff > 0 ? `还有${Math.ceil(diff)}天` : `已过${Math.floor(-diff)}天`}`,
              urgency: diff === 0 ? 'high' : 'normal',
            });
          }
        }
        if (rule.type === 'probation' && emp.probationMonths) {
          const probEnd = new Date(emp.hireDate);
          probEnd.setMonth(probEnd.getMonth() + emp.probationMonths);
          const diff = (probEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
          if (diff >= -7 && diff <= 7) {
            reminders.push({
              employeeId: emp.employeeId,
              name: emp.name,
              type: 'probation',
              message: `转正提醒：${emp.name}试用期${diff <= 0 ? '已到期' : `还有${Math.ceil(diff)}天`}`,
              urgency: diff <= 0 ? 'high' : 'normal',
            });
          }
        }
        if (rule.type === 'contract') {
          // 合同到期提醒由 getExpiringContracts() 提供
        }
      }
    }
    return reminders;
  }, [reminderRules]);

  return {
    // 数据
    fieldDefinitions, employeeSubsets, changeRecords, contracts,
    reminderRules, printTemplates, assessmentTools, competencyDict,
    competencyModels, talentProfiles, talentReports,
    // 字段定义
    addFieldDefinition, updateFieldDefinition, removeFieldDefinition, resetFieldDefinitions,
    // 员工子集
    getSubsetsByEmployee, getSubsetsByType,
    addEmployeeSubset, updateEmployeeSubset, removeEmployeeSubset,
    // 异动记录
    getChangesByEmployee, getChangesByType, getPendingChanges,
    addChangeRecord, approveChange, rejectChange,
    // 合同
    getContractsByEmployee, getExpiringContracts, getExpiredContracts,
    addContract, updateContract, renewContract, terminateContract, batchImportContracts,
    // 提醒规则
    addReminderRule, updateReminderRule, removeReminderRule,
    // 打印模板
    addPrintTemplate, updatePrintTemplate, removePrintTemplate, setDefaultTemplate,
    // 测评工具
    addAssessmentTool, updateAssessmentTool, removeAssessmentTool,
    // 能力素质
    addCompetencyItem, updateCompetencyItem, removeCompetencyItem,
    // 胜任力模型
    addCompetencyModel, updateCompetencyModel, removeCompetencyModel,
    // 人才档案
    addOrUpdateTalentProfile, updateTalentProfile,
    // 人才报告
    addTalentReport,
    // 提醒生成
    generateReminders,
    // 工具函数
    calculateAge, calculateWorkYears, isContractExpiring, isContractExpired,
    isProbationEnding, isNearRetire, generateEmployeeId, renderTemplate,
  };
}
