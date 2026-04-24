import React, { useState, useEffect, useMemo } from 'react';
import { fieldToLabel } from '@/utils/fieldLabels';

// ============================================================
// 类型定义
// ============================================================

type DemandStatus = 'draft' | 'pending' | 'published' | 'paused' | 'completed';
type CandidateStatus = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
type InterviewStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
type TalentTagType = 'talent' | 'blacklist';

interface RecruitmentDemand {
  id: string;
  title: string;
  department: string;
  count: number;
  urgency: 'low' | 'medium' | 'high';
  salaryMin?: number;
  salaryMax?: number;
  deadline?: string;
  description?: string;
  requirements?: string;
  manager?: string;
  status: DemandStatus;
  createdAt: string;
  publishedAt?: string;
}

interface Candidate {
  id: string;
  name: string;
  phone: string;
  email: string;
  positionId?: string;
  positionName: string;
  source: string;
  status: CandidateStatus;
  resumeUrl?: string;
  interviewDate?: string;
  education?: string;
  workYears?: number;
  currentCompany?: string;
  currentPosition?: string;
  skills?: string;
  createdAt: string;
}

interface Talent {
  id: string;
  name: string;
  phone: string;
  email: string;
  education?: string;
  workYears?: number;
  currentPosition?: string;
  currentCompany?: string;
  tags: string[];
  isBlacklist: boolean;
  source?: string;
  createdAt: string;
}

interface TalentTag {
  id: string;
  name: string;
  color: string;
  type: TalentTagType;
}

interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  positionName: string;
  interviewer?: string;
  scheduledAt?: string;
  method: 'onsite' | 'video';
  location?: string;
  videoLink?: string;
  status: InterviewStatus;
  evaluation?: string;
  score?: number;
  createdAt: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: 'interview_invite' | 'offer' | 'onboarding';
  subject: string;
  content: string;
  createdAt: string;
}

interface EmailLog {
  id: string;
  templateId: string;
  templateName: string;
  recipientName: string;
  recipientEmail: string;
  status: 'sent' | 'failed' | 'pending';
  sentAt: string;
}

interface Analytics {
  publishedPositions: number;
  totalResumes: number;
  interviewCount: number;
  hiredCount: number;
  avgRecruitDays: number;
  sourceDistribution: Record<string, number>;
  positionRanking: Record<string, number>;
  monthlyTrend: Record<string, { resumes: number; interviews: number; hired: number }>;
}

// ============================================================
// 工具函数
// ============================================================

const DEMAND_STATUS_MAP: Record<DemandStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: '草稿',     color: 'text-gray-600',   bg: 'bg-gray-100' },
  pending:   { label: '审批中',   color: 'text-yellow-700',  bg: 'bg-yellow-100' },
  published: { label: '已发布',   color: 'text-green-700',   bg: 'bg-green-100' },
  paused:    { label: '已暂停',   color: 'text-orange-700',  bg: 'bg-orange-100' },
  completed: { label: '已完成',   color: 'text-blue-700',   bg: 'bg-blue-100' },
};

const CANDIDATE_STATUS_MAP: Record<CandidateStatus, { label: string; color: string; bg: string }> = {
  new:       { label: '初筛',      color: 'text-blue-700',    bg: 'bg-blue-100' },
  screening: { label: '筛选中',    color: 'text-yellow-700', bg: 'bg-yellow-100' },
  interview: { label: '面试中',    color: 'text-purple-700',  bg: 'bg-purple-100' },
  offer:     { label: '已发Offer', color: 'text-orange-700', bg: 'bg-orange-100' },
  hired:     { label: '已入职',    color: 'text-green-700',   bg: 'bg-green-100' },
  rejected:  { label: '已拒绝',    color: 'text-red-700',     bg: 'bg-red-100' },
};

const INTERVIEW_STATUS_MAP: Record<InterviewStatus, { label: string; color: string; bg: string }> = {
  pending:    { label: '待安排',   color: 'text-gray-600',   bg: 'bg-gray-100' },
  scheduled:  { label: '已安排',   color: 'text-blue-700',  bg: 'bg-blue-100' },
  in_progress:{ label: '进行中',   color: 'text-purple-700',bg: 'bg-purple-100' },
  completed:  { label: '已完成',   color: 'text-green-700', bg: 'bg-green-100' },
  cancelled:  { label: '已取消',   color: 'text-red-700',    bg: 'bg-red-100' },
};

const URGENCY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  low:    { label: '普通', color: 'text-gray-600', bg: 'bg-gray-100' },
  medium: { label: '紧急', color: 'text-orange-700', bg: 'bg-orange-100' },
  high:   { label: '紧急', color: 'text-red-700', bg: 'bg-red-100' },
};

const SOURCE_OPTIONS = ['BOSS直聘', '智联招聘', '前程无忧', '猎聘', '邮箱解析', '官网', '内推', '其他'];
const EMAIL_TEMPLATE_TYPES = [
  { value: 'interview_invite', label: '面试邀请' },
  { value: 'offer', label: '录用Offer' },
  { value: 'onboarding', label: '入职通知' },
];

const TAG_COLORS = ['blue', 'green', 'purple', 'orange', 'red', 'cyan', 'pink', 'yellow'];
const getTagBg = (color: string) => {
  const map: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700', green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700', orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700', cyan: 'bg-cyan-100 text-cyan-700',
    pink: 'bg-pink-100 text-pink-700', yellow: 'bg-yellow-100 text-yellow-700',
  };
  return map[color] || 'bg-gray-100 text-gray-700';
};

// ============================================================
// 通用组件
// ============================================================

function Tag({ label, color = 'blue', onClose, onClick }: { label: string; color?: string; onClose?: () => void; onClick?: () => void }) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium cursor-default ${getTagBg(color)} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      {label}
      {onClose && (
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="hover:font-bold leading-none ml-0.5">×</button>
      )}
    </span>
  );
}

function Badge({ label, color = 'blue' }: { label: string; color?: string }) {
  const map: Record<string, string> = {
    blue: 'bg-blue-500', green: 'bg-green-500', red: 'bg-red-500',
    yellow: 'bg-yellow-500', purple: 'bg-purple-500', orange: 'bg-orange-500',
    gray: 'bg-gray-400', cyan: 'bg-cyan-500', pink: 'bg-pink-500',
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${map[color] || map.blue} mr-1`} />
  );
}

function LoadingSpinner({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3" />
      <span>{text}</span>
    </div>
  );
}

function EmptyState({ message = '暂无数据', action }: { message?: string; action?: React.ReactNode }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <div className="text-4xl mb-3 opacity-40">📭</div>
      <p>{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Modal 基础组件
function Modal({ title, children, onClose, width = 'max-w-2xl' }: {
  title: string; children: React.ReactNode; onClose: () => void; width?: string;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className={`bg-card rounded-2xl border border-border w-full ${width} max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-xl leading-none">×</button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

// 确认弹窗
function ConfirmModal({ title, message, onConfirm, onCancel }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel} width="max-w-md">
      <p className="text-muted-foreground mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 border border-input rounded-lg hover:bg-muted">取消</button>
        <button onClick={onConfirm} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">确定</button>
      </div>
    </Modal>
  );
}

// 二维码模拟组件
function QRCodeMock({ value }: { value: string }) {
  const size = 120;
  const cell = Math.floor(size / 11);
  return (
    <div className="inline-flex items-center justify-center bg-white p-3 rounded-lg border border-border">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="white" />
        {Array.from({ length: 11 }).map((_, r) =>
          Array.from({ length: 11 }).map((_, c) => {
            const hash = (r * 7 + c * 13 + value.charCodeAt((r + c) % value.length)) % 3;
            if (hash === 0) return null;
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cell + 1}
                y={r * cell + 1}
                width={cell - 1}
                height={cell - 1}
                fill={hash === 1 ? '#000' : '#666'}
                rx={1}
              />
            );
          })
        )}
      </svg>
    </div>
  );
}

// 饼图模拟（CSS）
function PieChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  return (
    <div className="flex items-center gap-6">
      <div className="relative" style={{ width: 120, height: 120 }}>
        <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%' }}>
          <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#e5e7eb" strokeWidth="7" />
          {data.map((d, i) => {
            const pct = total > 0 ? (d.value / total) * 100 : 0;
            const dash = (pct / 100) * 100;
            const offset = 100 - cumulative;
            cumulative += pct;
            return (
              <circle
                key={i}
                cx="21" cy="21" r="15.9"
                fill="transparent"
                stroke={d.color}
                strokeWidth="7"
                strokeDasharray={`${dash} ${100 - dash}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
              />
            );
          })}
          <text x="21" y="21" textAnchor="middle" dominantBaseline="central" fontSize="5" fontWeight="bold" fill="currentColor" className="text-foreground">
            {total}
          </text>
        </svg>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-medium ml-auto pl-4">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 条形图模拟
function BarChart({ data, maxValue }: { data: { label: string; value: number; color?: string }[]; maxValue?: number }) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground truncate mr-2" style={{ maxWidth: 120 }}>{d.label}</span>
              <span className="font-medium shrink-0">{d.value}</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: d.color || 'var(--color-primary, #3b82f6)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 漏斗图
function FunnelChart({ data }: { data: { label: string; count: number; rate?: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="space-y-4">
      {data.map((d, i) => {
        const width = (d.count / max) * 100;
        return (
          <div key={i} className="flex items-center gap-4">
            <div className="w-20 text-sm text-muted-foreground text-right shrink-0">{d.label}</div>
            <div className="flex-1 relative">
              <div className="h-9 bg-muted rounded-r-lg overflow-hidden">
                <div
                  className="h-full bg-primary/80 rounded-r-lg flex items-center justify-end pr-3 transition-all"
                  style={{ width: `${width}%` }}
                >
                  <span className="text-xs font-medium text-white/90">{d.count}</span>
                </div>
              </div>
            </div>
            {d.rate !== undefined && (
              <div className="w-14 text-sm font-medium text-muted-foreground text-right shrink-0">{d.rate}%</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// Tab1: 招聘需求
// ============================================================
function TabDemand({
  data, loading, onSave, onDelete, onPublish, onRefresh,
}: {
  data: RecruitmentDemand[]; loading: boolean; onSave: (d: Partial<RecruitmentDemand>) => void;
  onDelete: (id: string) => void; onPublish: (d: RecruitmentDemand) => void; onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<RecruitmentDemand | null>(null);
  const [filters, setFilters] = useState({ status: '', urgency: '', search: '' });
  const [qrDemand, setQrDemand] = useState<RecruitmentDemand | null>(null);

  const filtered = data.filter(d => {
    if (filters.status && d.status !== filters.status) return false;
    if (filters.urgency && d.urgency !== filters.urgency) return false;
    if (filters.search && !d.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleSave = (form: Partial<RecruitmentDemand>) => {
    onSave(form);
    setShowForm(false);
    setEditing(null);
  };

  const urgencyColors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-orange-100 text-orange-700',
    high: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text" placeholder="搜索职位名称..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm w-48"
          />
          <select
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm"
          >
            <option value="">全部状态</option>
            {Object.entries(DEMAND_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            value={filters.urgency}
            onChange={e => setFilters(f => ({ ...f, urgency: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm"
          >
            <option value="">紧急程度</option>
            <option value="low">普通</option>
            <option value="medium">紧急</option>
            <option value="high">非常紧急</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="px-3 py-2 border border-input rounded-lg hover:bg-muted text-sm">🔄 刷新</button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
          >
            + 新增需求
          </button>
        </div>
      </div>

      {/* 列表 */}
      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState message="暂无招聘需求" action={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">
            发布第一个需求
          </button>
        } />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-3 font-medium">职位名称</th>
                <th className="text-left p-3 font-medium">部门</th>
                <th className="text-left p-3 font-medium">人数</th>
                <th className="text-left p-3 font-medium">紧急程度</th>
                <th className="text-left p-3 font-medium">薪资范围</th>
                <th className="text-left p-3 font-medium">负责人</th>
                <th className="text-left p-3 font-medium">截止日期</th>
                <th className="text-left p-3 font-medium">状态</th>
                <th className="text-left p-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d, i) => (
                <tr key={d.id} className={`border-b last:border-0 hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="p-3 font-medium">{d.title}</td>
                  <td className="p-3 text-muted-foreground">{d.department || '-'}</td>
                  <td className="p-3">{d.count}人</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${urgencyColors[d.urgency] || 'bg-gray-100 text-gray-600'}`}>
                      {d.urgency === 'low' ? '普通' : d.urgency === 'medium' ? '紧急' : '非常紧急'}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {d.salaryMin && d.salaryMax ? `${d.salaryMin}k-${d.salaryMax}k` : '-'}
                  </td>
                  <td className="p-3 text-muted-foreground">{d.manager || '-'}</td>
                  <td className="p-3 text-muted-foreground">{d.deadline || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${DEMAND_STATUS_MAP[d.status]?.bg} ${DEMAND_STATUS_MAP[d.status]?.color}`}>
                      {DEMAND_STATUS_MAP[d.status]?.label}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <button onClick={() => { setEditing(d); setShowForm(true); }} className="text-primary hover:underline text-xs">编辑</button>
                      <button onClick={() => onDelete(d.id)} className="text-red-500 hover:underline text-xs">删除</button>
                      {(d.status === 'draft' || d.status === 'pending') && (
                        <button onClick={() => onPublish(d)} className="text-green-600 hover:underline text-xs">发布</button>
                      )}
                      {d.status === 'published' && (
                        <button onClick={() => setQrDemand(d)} className="text-blue-600 hover:underline text-xs">招聘二维码</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 表单弹窗 */}
      {showForm && (
        <Modal title={editing ? '编辑招聘需求' : '新增招聘需求'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <DemandForm
            demand={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}

      {/* 招聘二维码弹窗 */}
      {qrDemand && (
        <Modal title={`招聘二维码 - ${qrDemand.title}`} onClose={() => setQrDemand(null)} width="max-w-sm">
          <div className="flex flex-col items-center gap-4">
            <QRCodeMock value={`feida-hr://apply?position=${qrDemand.id}`} />
            <p className="text-sm text-muted-foreground text-center">
              求职者扫码即可填写个人简历，<br />自动进入简历库
            </p>
            <p className="text-xs text-muted-foreground bg-muted rounded px-3 py-2 w-full text-center break-all">
              feida-hr://apply?position={qrDemand.id}
            </p>
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">职位</span>
                <span className="font-medium">{qrDemand.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">部门</span>
                <span>{qrDemand.department || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">招聘人数</span>
                <span>{qrDemand.count}人</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function DemandForm({ demand, onSave, onCancel }: {
  demand: RecruitmentDemand | null;
  onSave: (d: Partial<RecruitmentDemand>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<RecruitmentDemand>>({
    title: '', department: '', count: 1, urgency: 'medium',
    salaryMin: undefined, salaryMax: undefined,
    deadline: '', description: '', requirements: '', manager: '', status: 'draft',
    ...(demand || {}),
  });

  const set = (key: keyof RecruitmentDemand, val: any) => setForm(f => ({ ...f, [key]: val }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">职位名称 <span className="text-red-500">*</span></label>
          <input required value={form.title || ''} onChange={e => set('title', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" placeholder="如：前端工程师" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">所属部门</label>
          <input value={form.department || ''} onChange={e => set('department', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" placeholder="如：技术部" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">需求人数</label>
          <input type="number" min={1} value={form.count || 1} onChange={e => set('count', parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">紧急程度</label>
          <select value={form.urgency || 'medium'} onChange={e => set('urgency', e.target.value as any)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="low">普通</option>
            <option value="medium">紧急</option>
            <option value="high">非常紧急</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">最低薪资(k)</label>
          <input type="number" min={0} value={form.salaryMin || ''} onChange={e => set('salaryMin', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" placeholder="如：15" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">最高薪资(k)</label>
          <input type="number" min={0} value={form.salaryMax || ''} onChange={e => set('salaryMax', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" placeholder="如：25" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">截止日期</label>
          <input type="date" value={form.deadline || ''} onChange={e => set('deadline', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">负责人</label>
          <input value={form.manager || ''} onChange={e => set('manager', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" placeholder="如：张三" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">状态</label>
          <select value={form.status || 'draft'} onChange={e => set('status', e.target.value as any)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
            {Object.entries(DEMAND_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">职位描述</label>
          <textarea value={form.description || ''} onChange={e => set('description', e.target.value)}
            rows={3} className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm resize-none"
            placeholder="描述岗位职责、工作内容..." />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">任职要求</label>
          <textarea value={form.requirements || ''} onChange={e => set('requirements', e.target.value)}
            rows={3} className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm resize-none"
            placeholder="描述岗位所需技能、经验、学历..." />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm">取消</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">保存</button>
      </div>
    </form>
  );
}

// ============================================================
// Tab2: 简历管理
// ============================================================
function TabResume({
  data, loading, onSave, onDelete, onStatusChange, onBatchAction, onRefresh,
}: {
  data: Candidate[]; loading: boolean;
  onSave: (c: Partial<Candidate>) => void; onDelete: (id: string) => void;
  onStatusChange: (id: string, status: CandidateStatus) => void;
  onBatchAction: (ids: string[], action: string) => void; onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    position: '', source: '', status: '', search: '',
    dateFrom: '', dateTo: '',
  });
  const [viewResume, setViewResume] = useState<Candidate | null>(null);
  const [importModal, setImportModal] = useState(false);

  const filtered = data.filter(c => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.source && c.source !== filters.source) return false;
    if (filters.position && !c.positionName.toLowerCase().includes(filters.position.toLowerCase())) return false;
    if (filters.search && !`${c.name}${c.phone}${c.email}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.dateFrom && c.createdAt < filters.dateFrom) return false;
    if (filters.dateTo && c.createdAt > filters.dateTo + 'T23:59:59') return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    setSelectedIds(prev => prev.length === filtered.length ? [] : filtered.map(c => c.id));
  };

  const handleSave = (form: Partial<Candidate>) => {
    onSave(form);
    setShowForm(false);
    setEditing(null);
  };

  const nextStatusMap: Partial<Record<CandidateStatus, CandidateStatus[]>> = {
    new: ['screening'],
    screening: ['interview', 'rejected'],
    interview: ['offer', 'rejected'],
    offer: ['hired', 'rejected'],
  };

  const sources = [...new Set(data.map(c => c.source).filter(Boolean))];
  const positions = [...new Set(data.map(c => c.positionName).filter(Boolean))];

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <input type="text" placeholder="姓名/电话/邮箱搜索..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm w-44" />
          <select value={filters.position} onChange={e => setFilters(f => ({ ...f, position: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="">全部职位</option>
            {positions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filters.source} onChange={e => setFilters(f => ({ ...f, source: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="">全部来源</option>
            {sources.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="">全部状态</option>
            {Object.entries(CANDIDATE_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm" title="开始日期" />
          <span className="text-muted-foreground">至</span>
          <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm" title="结束日期" />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="px-3 py-2 border border-input rounded-lg hover:bg-muted text-sm">🔄 刷新</button>
          <button onClick={() => setImportModal(true)} className="px-3 py-2 border border-input rounded-lg hover:bg-muted text-sm">
            📥 邮箱解析导入
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">
            + 添加简历
          </button>
        </div>
      </div>

      {/* 批量操作栏 */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <span className="text-sm text-blue-700">已选择 {selectedIds.length} 项</span>
          <button onClick={() => { onBatchAction(selectedIds, 'screening'); setSelectedIds([]); }}
            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">批量标记筛选</button>
          <button onClick={() => { onBatchAction(selectedIds, 'interview'); setSelectedIds([]); }}
            className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700">批量安排面试</button>
          <button onClick={() => { onBatchAction(selectedIds, 'rejected'); setSelectedIds([]); }}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600">批量拒绝</button>
          <button onClick={() => setSelectedIds([])} className="ml-auto text-sm text-blue-600 hover:underline">取消选择</button>
        </div>
      )}

      {/* 状态筛选标签 */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CANDIDATE_STATUS_MAP).map(([k, v]) => {
          const count = data.filter(c => c.status === k).length;
          return (
            <button key={k}
              onClick={() => setFilters(f => ({ ...f, status: f.status === k ? '' : k }))}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filters.status === k ? `${v.bg} ${v.color} ring-2 ring-primary/40` : `${v.bg} ${v.color} opacity-60 hover:opacity-100`}`}
            >
              {v.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 列表 */}
      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState message="暂无简历记录" action={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">
            添加简历
          </button>
        } />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-3 font-medium w-8">
                  <input type="checkbox" checked={selectedIds.length === filtered.length} onChange={toggleAll} className="rounded" />
                </th>
                <th className="text-left p-3 font-medium">姓名</th>
                <th className="text-left p-3 font-medium">电话</th>
                <th className="text-left p-3 font-medium">邮箱</th>
                <th className="text-left p-3 font-medium">应聘职位</th>
                <th className="text-left p-3 font-medium">来源</th>
                <th className="text-left p-3 font-medium">投递时间</th>
                <th className="text-left p-3 font-medium">状态</th>
                <th className="text-left p-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} className={`border-b last:border-0 hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="p-3">
                    <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} className="rounded" />
                  </td>
                  <td className="p-3 font-medium cursor-pointer" onClick={() => setViewResume(c)}>
                    <span className="hover:text-primary hover:underline">{c.name}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{c.phone}</td>
                  <td className="p-3 text-muted-foreground">{c.email || '-'}</td>
                  <td className="p-3">{c.positionName || '-'}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{c.source || '-'}</span>
                  </td>
                  <td className="p-3 text-muted-foreground">{c.createdAt ? c.createdAt.slice(0, 10) : '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CANDIDATE_STATUS_MAP[c.status]?.bg} ${CANDIDATE_STATUS_MAP[c.status]?.color}`}>
                      {CANDIDATE_STATUS_MAP[c.status]?.label}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <button onClick={() => setViewResume(c)} className="text-blue-600 hover:underline text-xs">查看</button>
                      <button onClick={() => { setEditing(c); setShowForm(true); }} className="text-primary hover:underline text-xs">编辑</button>
                      {(nextStatusMap[c.status] || []).map(nextS => (
                        <button key={nextS} onClick={() => onStatusChange(c.id, nextS)}
                          className={`hover:underline text-xs ${nextS === 'rejected' ? 'text-red-500' : nextS === 'offer' ? 'text-orange-600' : 'text-green-600'}`}>
                          →{CANDIDATE_STATUS_MAP[nextS]?.label}
                        </button>
                      ))}
                      <button onClick={() => onDelete(c.id)} className="text-red-400 hover:underline text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 表单弹窗 */}
      {showForm && (
        <Modal title={editing ? '编辑简历' : '添加简历'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <CandidateForm
            candidate={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}

      {/* 简历详情弹窗 */}
      {viewResume && (
        <Modal title={`简历详情 - ${viewResume.name}`} onClose={() => setViewResume(null)} width="max-w-2xl">
          <ResumeDetail candidate={viewResume} />
        </Modal>
      )}

      {/* 邮箱解析导入弹窗 */}
      {importModal && (
        <Modal title="邮箱解析批量导入" onClose={() => setImportModal(false)} width="max-w-md">
          <EmailImportPanel onClose={() => setImportModal(false)} />
        </Modal>
      )}
    </div>
  );
}

function CandidateForm({ candidate, onSave, onCancel }: {
  candidate: Candidate | null; onSave: (c: Partial<Candidate>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Candidate>>({
    name: '', phone: '', email: '', positionId: '', positionName: '',
    source: '', status: 'new', education: '', workYears: undefined,
    currentCompany: '', currentPosition: '', skills: '', resumeUrl: '', ...(candidate || {}),
  });
  const set = (key: keyof Candidate, val: any) => setForm(f => ({ ...f, [key]: val }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">姓名 <span className="text-red-500">*</span></label>
          <input required value={form.name || ''} onChange={e => set('name', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">手机号 <span className="text-red-500">*</span></label>
          <input required value={form.phone || ''} onChange={e => set('phone', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">应聘职位</label>
          <input value={form.positionName || ''} onChange={e => set('positionName', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" placeholder="如：前端工程师" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">来源</label>
          <select value={form.source || ''} onChange={e => set('source', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="">请选择</option>
            {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">状态</label>
          <select value={form.status || 'new'} onChange={e => set('status', e.target.value as any)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
            {Object.entries(CANDIDATE_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">学历</label>
          <input value={form.education || ''} onChange={e => set('education', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" placeholder="如：本科" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">工作年限</label>
          <input type="number" min={0} value={form.workYears || ''} onChange={e => set('workYears', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">最近公司</label>
          <input value={form.currentCompany || ''} onChange={e => set('currentCompany', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">最近职位</label>
          <input value={form.currentPosition || ''} onChange={e => set('currentPosition', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">技能标签</label>
          <input value={form.skills || ''} onChange={e => set('skills', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
            placeholder="用逗号分隔，如：React, TypeScript, Node.js" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">简历链接</label>
          <input value={form.resumeUrl || ''} onChange={e => set('resumeUrl', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" placeholder="https://..." />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm">取消</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">保存</button>
      </div>
    </form>
  );
}

function ResumeDetail({ candidate }: { candidate: Candidate }) {
  const sections = [
    { title: '基本信息', fields: [
      { label: '姓名', value: candidate.name },
      { label: '手机', value: candidate.phone },
      { label: '邮箱', value: candidate.email },
      { label: '应聘职位', value: candidate.positionName },
      { label: '简历来源', value: candidate.source },
      { label: '当前状态', value: CANDIDATE_STATUS_MAP[candidate.status]?.label || candidate.status },
    ]},
    { title: '工作经历', fields: [
      { label: '最近公司', value: candidate.currentCompany || '-' },
      { label: '最近职位', value: candidate.currentPosition || '-' },
      { label: '工作年限', value: candidate.workYears ? `${candidate.workYears}年` : '-' },
    ]},
    { title: '教育背景', fields: [
      { label: '学历', value: candidate.education || '-' },
    ]},
    { title: '技能标签', fields: [
      { label: '技能', value: candidate.skills ? null : '-' },
    ]},
  ];

  return (
    <div className="space-y-6">
      {sections.map((section, si) => (
        <div key={si}>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide mb-3 pb-1 border-b border-border">{section.title}</h3>
          <div className="grid grid-cols-2 gap-3">
            {section.fields.map((f, fi) => (
              <div key={fi}>
                <span className="text-xs text-muted-foreground">{f.label}</span>
                {f.value === null ? (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(candidate.skills || '').split(/[,，]/).filter(Boolean).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{skill.trim()}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium mt-0.5">{f.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {candidate.resumeUrl && (
        <div className="pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">简历附件</span>
          <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer"
            className="block text-sm text-primary hover:underline mt-1">
            {candidate.resumeUrl}
          </a>
        </div>
      )}
    </div>
  );
}

function EmailImportPanel({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'paste' | 'csv'>('paste');
  const [pasteContent, setPasteContent] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string[]>([]);

  const handleImport = () => {
    setImporting(true);
    const lines = mode === 'paste'
      ? pasteContent.split('\n').filter(l => l.trim())
      : csvContent.split('\n').filter(l => l.trim() && !l.startsWith('#'));
    setTimeout(() => {
      setResult(lines.slice(0, 5).map(l => `已解析: ${l.split(/[\t,]/)[0] || l.slice(0, 20)}...`));
      setImporting(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        支持从主流招聘网站（BOSS直聘、智联招聘、前程无忧）导出的简历邮件文本，一键解析并存入简历库。
      </p>
      <div className="flex gap-2">
        <button onClick={() => setMode('paste')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium ${mode === 'paste' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
          粘贴文本
        </button>
        <button onClick={() => setMode('csv')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium ${mode === 'csv' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
          CSV导入
        </button>
      </div>
      {mode === 'paste' ? (
        <textarea value={pasteContent} onChange={e => setPasteContent(e.target.value)}
          rows={8} className="w-full border border-input rounded-lg p-3 text-sm resize-none bg-background font-mono"
          placeholder="粘贴简历邮件原文（支持BOSS直聘、智联招聘等格式）..." />
      ) : (
        <textarea value={csvContent} onChange={e => setCsvContent(e.target.value)}
          rows={8} className="w-full border border-input rounded-lg p-3 text-sm resize-none bg-background font-mono"
          placeholder="# 姓名,手机,邮箱,职位,来源&#10;张三,13800138000,zhangsan@example.com,前端工程师,BOSS直聘" />
      )}
      {result.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm space-y-1">
          <p className="font-medium text-green-700">✅ 解析成功 ({result.length} 条)</p>
          {result.map((r, i) => <p key={i} className="text-green-600">{r}</p>)}
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2 border-t border-border">
        <button onClick={onClose} className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm">关闭</button>
        <button onClick={handleImport} disabled={importing}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm disabled:opacity-50">
          {importing ? '解析中...' : '开始解析导入'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Tab3: 人才库
// ============================================================
function TabTalentPool({
  talentData, tagData, loading, onSave, onDelete, onTagSave, onTagDelete, onMoveBlacklist,
}: {
  talentData: Talent[]; tagData: TalentTag[]; loading: boolean;
  onSave: (t: Partial<Talent>) => void; onDelete: (id: string) => void;
  onTagSave: (t: Partial<TalentTag>) => void; onTagDelete: (id: string) => void;
  onMoveBlacklist: (t: Talent) => void;
}) {
  const [tab, setTab] = useState<'talent' | 'blacklist'>('talent');
  const [showForm, setShowForm] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [editing, setEditing] = useState<Talent | null>(null);
  const [editingTag, setEditingTag] = useState<TalentTag | null>(null);
  const [filters, setFilters] = useState({ tag: '', search: '' });
  const [viewTalent, setViewTalent] = useState<Talent | null>(null);

  const filtered = talentData.filter(t => {
    if (tab === 'blacklist' && !t.isBlacklist) return false;
    if (tab === 'talent' && t.isBlacklist) return false;
    if (filters.tag && !t.tags.includes(filters.tag)) return false;
    if (filters.search && !t.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const talentTags = tagData.filter(t => t.type === 'talent');

  const handleSave = (form: Partial<Talent>) => {
    onSave(form);
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      {/* 标签管理入口 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setTab('talent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'talent' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
            人才库 ({talentData.filter(t => !t.isBlacklist).length})
          </button>
          <button onClick={() => setTab('blacklist')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'blacklist' ? 'bg-red-600 text-white' : 'bg-muted hover:bg-muted/80'}`}>
            黑名单 ({talentData.filter(t => t.isBlacklist).length})
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTagModal(true)}
            className="px-3 py-2 border border-input rounded-lg hover:bg-muted text-sm">
            🏷️ 管理类别
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">
            + 添加人才
          </button>
        </div>
      </div>

      {/* 筛选 */}
      {tab === 'talent' && talentTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground py-1">类别:</span>
          <button onClick={() => setFilters(f => ({ ...f, tag: '' }))}
            className={`px-3 py-1 rounded-full text-xs font-medium ${filters.tag === '' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
            全部
          </button>
          {talentTags.map(tag => (
            <button key={tag.id}
              onClick={() => setFilters(f => ({ ...f, tag: tag.name }))}
              className={`px-3 py-1 rounded-full text-xs font-medium ${filters.tag === tag.name ? `${getTagBg(tag.color)} ring-2 ring-primary/40` : `${getTagBg(tag.color)} opacity-60 hover:opacity-100`}`}>
              {tag.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input type="text" placeholder="搜索姓名..."
          value={filters.search}
          onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          className="px-3 py-2 border border-input rounded-lg bg-background text-sm w-48" />
      </div>

      {/* 列表 */}
      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState message={tab === 'blacklist' ? '暂无黑名单人员' : '暂无人才'} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <div key={t.id} className={`bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow ${t.isBlacklist ? 'border-red-200' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="text-xs text-muted-foreground">{t.phone}</p>
                </div>
                {t.isBlacklist && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">黑名单</span>}
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>📍 {t.currentCompany || '-'} / {t.currentPosition || '-'}</p>
                <p>🎓 {t.education || '-'} · {t.workYears ? `${t.workYears}年经验` : '-'}</p>
              </div>
              {t.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {t.tags.map((tag, i) => {
                    const tagDef = tagData.find(td => td.name === tag);
                    return <Tag key={i} label={tag} color={tagDef?.color || 'blue'} />;
                  })}
                </div>
              )}
              <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                <button onClick={() => setViewTalent(t)} className="flex-1 py-1.5 border border-input rounded-lg text-xs hover:bg-muted">查看</button>
                <button onClick={() => { setEditing(t); setShowForm(true); }} className="flex-1 py-1.5 border border-input rounded-lg text-xs hover:bg-muted">编辑</button>
                <button onClick={() => onDelete(t.id)} className="flex-1 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50">删除</button>
              </div>
              {!t.isBlacklist && (
                <button onClick={() => onMoveBlacklist(t)}
                  className="w-full mt-2 py-1.5 text-red-400 hover:text-red-600 text-xs hover:underline">
                  移入黑名单
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 表单弹窗 */}
      {showForm && (
        <Modal title={editing ? '编辑人才' : '添加人才'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <TalentForm
            talent={editing}
            tags={talentTags}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}

      {/* 人才详情 */}
      {viewTalent && (
        <Modal title={`人才详情 - ${viewTalent.name}`} onClose={() => setViewTalent(null)} width="max-w-lg">
          <ResumeDetail candidate={{
            id: viewTalent.id, name: viewTalent.name, phone: viewTalent.phone,
            email: viewTalent.email, positionName: viewTalent.currentPosition || '',
            source: viewTalent.source || '', status: 'new' as CandidateStatus,
            education: viewTalent.education, workYears: viewTalent.workYears,
            currentCompany: viewTalent.currentCompany, currentPosition: viewTalent.currentPosition,
            skills: '', createdAt: viewTalent.createdAt,
          }} />
        </Modal>
      )}

      {/* 标签管理弹窗 */}
      {showTagModal && (
        <Modal title="人才库类别管理" onClose={() => setShowTagModal(false)}>
          <TagManagement
            tags={tagData}
            onSave={(tag) => { onTagSave(tag); }}
            onDelete={onTagDelete}
          />
        </Modal>
      )}
    </div>
  );
}

function TalentForm({ talent, tags, onSave, onCancel }: {
  talent: Talent | null; tags: TalentTag[];
  onSave: (t: Partial<Talent>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Talent>>({
    name: '', phone: '', email: '', education: '', workYears: undefined,
    currentCompany: '', currentPosition: '', tags: [], isBlacklist: false, source: '', ...(talent || {}),
  });
  const set = (key: keyof Talent, val: any) => setForm(f => ({ ...f, [key]: val }));

  const toggleTag = (tagName: string) => {
    setForm(f => ({
      ...f,
      tags: f.tags?.includes(tagName) ? f.tags.filter(t => t !== tagName) : [...(f.tags || []), tagName],
    }));
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">姓名 <span className="text-red-500">*</span></label>
          <input required value={form.name || ''} onChange={e => set('name', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">手机号</label>
          <input value={form.phone || ''} onChange={e => set('phone', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">邮箱</label>
          <input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">学历</label>
          <input value={form.education || ''} onChange={e => set('education', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">工作年限</label>
          <input type="number" min={0} value={form.workYears || ''} onChange={e => set('workYears', parseInt(e.target.value) || undefined)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">最近公司</label>
          <input value={form.currentCompany || ''} onChange={e => set('currentCompany', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">最近职位</label>
          <input value={form.currentPosition || ''} onChange={e => set('currentPosition', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">人才类别</label>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <button key={tag.id} type="button"
                onClick={() => toggleTag(tag.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.tags?.includes(tag.name) ? `${getTagBg(tag.color)} ring-2 ring-primary/40` : 'bg-muted text-muted-foreground'}`}>
                {tag.name}
              </button>
            ))}
            {tags.length === 0 && <span className="text-xs text-muted-foreground">暂无类别，请先在"管理类别"中添加</span>}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm">取消</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">保存</button>
      </div>
    </form>
  );
}

function TagManagement({ tags, onSave, onDelete }: {
  tags: TalentTag[]; onSave: (t: Partial<TalentTag>) => void; onDelete: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('blue');
  const [type, setType] = useState<TalentTagType>('talent');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ id: editingId || undefined, name: name.trim(), color, type });
    setName('');
    setColor('blue');
    setEditingId(null);
  };

  const startEdit = (tag: TalentTag) => {
    setName(tag.name);
    setColor(tag.color);
    setType(tag.type);
    setEditingId(tag.id);
  };

  const talentTags = tags.filter(t => t.type === 'talent');
  const blacklistTags = tags.filter(t => t.type === 'blacklist');

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium">新增/编辑类别</h4>
        <div className="flex gap-2 items-center">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="类别名称"
            className="flex-1 px-3 py-2 border border-input rounded-lg bg-background text-sm"
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          <select value={type} onChange={e => setType(e.target.value as TalentTagType)}
            className="px-2 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="talent">人才库</option>
            <option value="blacklist">黑名单</option>
          </select>
          <div className="flex gap-1">
            {TAG_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${getTagBg(c)} ${color === c ? 'scale-125 border-primary' : 'border-transparent'}`}
              />
            ))}
          </div>
          <button onClick={handleSubmit}
            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm shrink-0">
            {editingId ? '更新' : '添加'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">人才库类别</h4>
          {talentTags.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">暂无类别</p>
          ) : (
            <div className="space-y-2">
              {talentTags.map(tag => (
                <div key={tag.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getTagBg(tag.color)}`} />
                    <span className="text-sm">{tag.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(tag)} className="text-xs text-primary hover:underline">编辑</button>
                    <button onClick={() => onDelete(tag.id)} className="text-xs text-red-500 hover:underline">删除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">黑名单类型</h4>
          {blacklistTags.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">暂无类型</p>
          ) : (
            <div className="space-y-2">
              {blacklistTags.map(tag => (
                <div key={tag.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getTagBg(tag.color)}`} />
                    <span className="text-sm">{tag.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(tag)} className="text-xs text-primary hover:underline">编辑</button>
                    <button onClick={() => onDelete(tag.id)} className="text-xs text-red-500 hover:underline">删除</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab4: 面试管理
// ============================================================
function TabInterview({
  data, candidateData, loading, onSave, onDelete, onEvaluation, onStatusChange, onRefresh,
}: {
  data: Interview[]; candidateData: Candidate[]; loading: boolean;
  onSave: (i: Partial<Interview>) => void; onDelete: (id: string) => void;
  onEvaluation: (id: string, score: number, evaluation: string) => void;
  onStatusChange: (id: string, status: InterviewStatus) => void; onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [showEval, setShowEval] = useState<Interview | null>(null);
  const [editing, setEditing] = useState<Interview | null>(null);
  const [filters, setFilters] = useState({ status: '', search: '', method: '' });

  const filtered = data.filter(i => {
    if (filters.status && i.status !== filters.status) return false;
    if (filters.method && i.method !== filters.method) return false;
    if (filters.search && !`${i.candidateName}${i.positionName}`.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleSave = (form: Partial<Interview>) => {
    onSave(form);
    setShowForm(false);
    setEditing(null);
  };

  const nextStatusMap: Partial<Record<InterviewStatus, InterviewStatus[]>> = {
    pending: ['scheduled'],
    scheduled: ['in_progress'],
    in_progress: ['completed'],
  };

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <input type="text" placeholder="搜索候选人/职位..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm w-48" />
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="">全部状态</option>
            {Object.entries(INTERVIEW_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select value={filters.method} onChange={e => setFilters(f => ({ ...f, method: e.target.value }))}
            className="px-3 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="">全部方式</option>
            <option value="onsite">现场面试</option>
            <option value="video">视频面试</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="px-3 py-2 border border-input rounded-lg hover:bg-muted text-sm">🔄 刷新</button>
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">
            + 新增面试安排
          </button>
        </div>
      </div>

      {/* 列表 */}
      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState message="暂无面试安排" action={
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">
            安排第一个面试
          </button>
        } />
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-3 font-medium">候选人</th>
                <th className="text-left p-3 font-medium">应聘职位</th>
                <th className="text-left p-3 font-medium">面试时间</th>
                <th className="text-left p-3 font-medium">面试官</th>
                <th className="text-left p-3 font-medium">方式</th>
                <th className="text-left p-3 font-medium">地点/链接</th>
                <th className="text-left p-3 font-medium">状态</th>
                <th className="text-left p-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((interview, i) => (
                <tr key={interview.id} className={`border-b last:border-0 hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="p-3 font-medium">{interview.candidateName}</td>
                  <td className="p-3 text-muted-foreground">{interview.positionName}</td>
                  <td className="p-3 text-muted-foreground">{interview.scheduledAt ? interview.scheduledAt.replace('T', ' ').slice(0, 16) : '-'}</td>
                  <td className="p-3 text-muted-foreground">{interview.interviewer || '-'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${interview.method === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {interview.method === 'video' ? '📹 视频' : '🏢 现场'}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground max-w-32 truncate">
                    {interview.videoLink ? (
                      <a href={interview.videoLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">视频链接</a>
                    ) : interview.location || '-'}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${INTERVIEW_STATUS_MAP[interview.status]?.bg} ${INTERVIEW_STATUS_MAP[interview.status]?.color}`}>
                      {INTERVIEW_STATUS_MAP[interview.status]?.label}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">
                      <button onClick={() => { setEditing(interview); setShowForm(true); }} className="text-primary hover:underline text-xs">编辑</button>
                      <button onClick={() => setShowEval(interview)} className="text-blue-600 hover:underline text-xs">评价</button>
                      {(nextStatusMap[interview.status] || []).map(nextS => (
                        <button key={nextS} onClick={() => onStatusChange(interview.id, nextS)}
                          className="text-green-600 hover:underline text-xs">
                          →{INTERVIEW_STATUS_MAP[nextS]?.label}
                        </button>
                      ))}
                      {interview.status !== 'completed' && interview.status !== 'cancelled' && (
                        <button onClick={() => onStatusChange(interview.id, 'cancelled')}
                          className="text-red-400 hover:underline text-xs">取消</button>
                      )}
                      <button onClick={() => onDelete(interview.id)} className="text-red-400 hover:underline text-xs">删除</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 表单弹窗 */}
      {showForm && (
        <Modal title={editing ? '编辑面试安排' : '新增面试安排'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <InterviewForm
            interview={editing}
            candidates={candidateData}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}

      {/* 评价弹窗 */}
      {showEval && (
        <Modal title={`面试评价 - ${showEval.candidateName}`} onClose={() => setShowEval(null)}>
          <EvaluationForm
            interview={showEval}
            onSave={(score, evaluation) => {
              onEvaluation(showEval.id, score, evaluation);
              setShowEval(null);
            }}
            onCancel={() => setShowEval(null)}
          />
        </Modal>
      )}
    </div>
  );
}

function InterviewForm({ interview, candidates, onSave, onCancel }: {
  interview: Interview | null; candidates: Candidate[];
  onSave: (i: Partial<Interview>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<Interview>>({
    candidateId: '', candidateName: '', positionName: '',
    interviewer: '', scheduledAt: '', method: 'onsite',
    location: '', videoLink: '', status: 'pending', ...(interview || {}),
  });
  const set = (key: keyof Interview, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleCandidateChange = (id: string) => {
    const c = candidates.find(c => c.id === id);
    setForm(f => ({ ...f, candidateId: id, candidateName: c?.name || '', positionName: c?.positionName || '' }));
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">选择候选人 <span className="text-red-500">*</span></label>
          <select required value={form.candidateId || ''} onChange={e => handleCandidateChange(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="">请选择候选人</option>
            {candidates.map(c => (
              <option key={c.id} value={c.id}>{c.name} - {c.positionName || '未指定职位'}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">面试官</label>
          <input value={form.interviewer || ''} onChange={e => set('interviewer', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" placeholder="如：李经理" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">面试时间</label>
          <input type="datetime-local" value={form.scheduledAt || ''} onChange={e => set('scheduledAt', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">面试方式</label>
          <select value={form.method || 'onsite'} onChange={e => set('method', e.target.value as any)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
            <option value="onsite">🏢 现场面试</option>
            <option value="video">📹 视频面试</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">状态</label>
          <select value={form.status || 'pending'} onChange={e => set('status', e.target.value as any)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
            {Object.entries(INTERVIEW_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        {form.method === 'onsite' ? (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">面试地点</label>
            <input value={form.location || ''} onChange={e => set('location', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" placeholder="如：会议室A / 北京市朝阳区xxx" />
          </div>
        ) : (
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">视频会议链接</label>
            <input value={form.videoLink || ''} onChange={e => set('videoLink', e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm" placeholder="https://meeting.example.com/..." />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm">取消</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">保存</button>
      </div>
    </form>
  );
}

function EvaluationForm({ interview, onSave, onCancel }: {
  interview: Interview; onSave: (score: number, evaluation: string) => void; onCancel: () => void;
}) {
  const [score, setScore] = useState(interview.score || 5);
  const [evaluation, setEvaluation] = useState(interview.evaluation || '');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">综合评分</span>
          <span className="text-2xl font-bold text-primary">{score} / 10</span>
        </div>
        <input type="range" min={1} max={10} value={score} onChange={e => setScore(parseInt(e.target.value))}
          className="w-full accent-primary" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 - 不合格</span><span>5 - 一般</span><span>10 - 优秀</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">优势</label>
        <textarea value={strengths} onChange={e => setStrengths(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm resize-none"
          placeholder="候选人的主要优势..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">不足</label>
        <textarea value={weaknesses} onChange={e => setWeaknesses(e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm resize-none"
          placeholder="候选人的不足之处..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">综合评价</label>
        <textarea value={evaluation} onChange={e => setEvaluation(e.target.value)} rows={3}
          className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm resize-none"
          placeholder="面试官综合评价，建议录用/待定/不录用..." />
      </div>
      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm">取消</button>
        <button onClick={() => onSave(score, evaluation + (strengths ? `\n优势：${strengths}` : '') + (weaknesses ? `\n不足：${weaknesses}` : ''))}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">提交评价</button>
      </div>
    </div>
  );
}

// ============================================================
// Tab5: 邮件模板
// ============================================================
function TabEmailTemplate({
  templateData, logData, loading, onSave, onDelete, onLogRefresh,
}: {
  templateData: EmailTemplate[]; logData: EmailLog[]; loading: boolean;
  onSave: (t: Partial<EmailTemplate>) => void; onDelete: (id: string) => void;
  onLogRefresh: () => void;
}) {
  const [tab, setTab] = useState<'templates' | 'logs'>('templates');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

  const handleSave = (form: Partial<EmailTemplate>) => {
    onSave(form);
    setShowForm(false);
    setEditing(null);
  };

  const typeLabels: Record<string, string> = {
    interview_invite: '面试邀请', offer: '录用Offer', onboarding: '入职通知',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          <button onClick={() => setTab('templates')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'templates' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
            📄 模板列表 ({templateData.length})
          </button>
          <button onClick={() => setTab('logs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'logs' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
            📬 发送记录 ({logData.length})
          </button>
        </div>
        {tab === 'templates' && (
          <button onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">
            + 新建模板
          </button>
        )}
      </div>

      {/* 模板列表 */}
      {tab === 'templates' && (
        loading ? <LoadingSpinner /> : templateData.length === 0 ? (
          <EmptyState message="暂无邮件模板" action={
            <button onClick={() => { setEditing(null); setShowForm(true); }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">
              创建第一个模板
            </button>
          } />
        ) : (
          <div className="space-y-3">
            {templateData.map(t => (
              <div key={t.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{t.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium mt-1 inline-block ${
                      t.type === 'offer' ? 'bg-orange-100 text-orange-700' :
                      t.type === 'onboarding' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {typeLabels[t.type] || t.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setPreviewTemplate(t)} className="text-blue-600 hover:underline text-xs">预览</button>
                    <button onClick={() => { setEditing(t); setShowForm(true); }} className="text-primary hover:underline text-xs">编辑</button>
                    <button onClick={() => onDelete(t.id)} className="text-red-400 hover:underline text-xs">删除</button>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium text-foreground">主题：</span>{t.subject}
                </div>
                <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2 max-h-24 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: t.content.replace(/<[^>]+>/g, ' ').slice(0, 120) + '...' }} />
              </div>
            ))}
          </div>
        )
      )}

      {/* 发送记录 */}
      {tab === 'logs' && (
        loading ? <LoadingSpinner /> : logData.length === 0 ? (
          <EmptyState message="暂无发送记录" />
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left p-3 font-medium">收件人</th>
                  <th className="text-left p-3 font-medium">模板</th>
                  <th className="text-left p-3 font-medium">发送时间</th>
                  <th className="text-left p-3 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {logData.map((log, i) => (
                  <tr key={log.id} className={`border-b last:border-0 hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="p-3">
                      <div className="font-medium">{log.recipientName}</div>
                      <div className="text-xs text-muted-foreground">{log.recipientEmail}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{log.templateName}</td>
                    <td className="p-3 text-muted-foreground">{log.sentAt ? log.sentAt.slice(0, 16).replace('T', ' ') : '-'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.status === 'sent' ? 'bg-green-100 text-green-700' :
                        log.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {log.status === 'sent' ? '✅ 已发送' : log.status === 'failed' ? '❌ 失败' : '⏳ 发送中'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* 模板表单 */}
      {showForm && (
        <Modal title={editing ? '编辑邮件模板' : '新建邮件模板'} onClose={() => { setShowForm(false); setEditing(null); }} width="max-w-3xl">
          <EmailTemplateForm
            template={editing}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}

      {/* 预览弹窗 */}
      {previewTemplate && (
        <Modal title={`预览 - ${previewTemplate.name}`} onClose={() => setPreviewTemplate(null)} width="max-w-2xl">
          <div className="space-y-3">
            <div className="bg-muted/30 rounded-lg p-3">
              <span className="text-xs text-muted-foreground">主题</span>
              <p className="text-sm font-medium">{previewTemplate.subject.replace(/\{\{(\w+)\}\}/g, '【$1】')}</p>
            </div>
            <div className="bg-white border border-border rounded-lg p-4 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: previewTemplate.content.replace(/\{\{(\w+)\}\}/g, '<mark class="bg-yellow-100 px-1 rounded">【$1】</mark>') }} />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              💡 变量说明：&#123;&#123;candidate_name&#125;&#125; = 候选人姓名，&#123;&#123;position&#125;&#125; = 职位名称，&#123;&#123;company_name&#125;&#125; = 公司名称，&#123;&#123;interview_time&#125;&#125; = 面试时间，&#123;&#123;interview_location&#125;&#125; = 面试地点
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function EmailTemplateForm({ template, onSave, onCancel }: {
  template: EmailTemplate | null;
  onSave: (t: Partial<EmailTemplate>) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<Partial<EmailTemplate>>({
    name: '', type: 'interview_invite', subject: '', content: '', ...(template || {}),
  });
  const set = (key: keyof EmailTemplate, val: any) => setForm(f => ({ ...f, [key]: val }));

  const insertVar = (v: string) => {
    setForm(f => ({ ...f, content: (f.content || '') + `{{${v}}}` }));
  };

  const VARS = [
    { key: 'candidate_name', label: '候选人姓名' },
    { key: 'position', label: '职位名称' },
    { key: 'company_name', label: '公司名称' },
    { key: 'interview_time', label: '面试时间' },
    { key: 'interview_location', label: '面试地点' },
    { key: 'salary', label: '薪资待遇' },
    { key: 'start_date', label: '入职日期' },
  ];

  const defaultContent: Record<string, string> = {
    interview_invite: `<p>尊敬的 <strong>{{candidate_name}}</strong>，您好！</p>
<p>感谢您投递 <strong>{{company_name}}</strong> 的 <strong>{{position}}</strong> 岗位，经过简历筛选，我们诚邀您参加面试。</p>
<p><strong>面试时间：</strong>{{interview_time}}</p>
<p><strong>面试地点：</strong>{{interview_location}}</p>
<p>请提前10分钟到达，如有疑问请回复此邮件或致电联系我们。</p>
<p>期待与您见面！</p>
<p><strong>{{company_name}}</strong> 人力资源部</p>`,
    offer: `<p>尊敬的 <strong>{{candidate_name}}</strong>，您好！</p>
<p>经过多轮面试，我们非常荣幸地向您宣布，您已被 <strong>{{company_name}}</strong> 录用！</p>
<p><strong>录用职位：</strong>{{position}}</p>
<p><strong>薪资待遇：</strong>{{salary}}</p>
<p><strong>入职日期：</strong>{{start_date}}</p>
<p>请在收到Offer后3个工作日内确认是否接受。如有任何问题，请随时联系我们。</p>
<p>再次恭喜您！</p>
<p><strong>{{company_name}}</strong></p>`,
    onboarding: `<p>尊敬的 <strong>{{candidate_name}}</strong>，您好！</p>
<p>欢迎加入 <strong>{{company_name}}</strong>！以下是入职须知：</p>
<ul>
<li><strong>入职日期：</strong>{{start_date}}</li>
<li><strong>入职地点：</strong>{{interview_location}}</li>
<li><strong>入职时间：</strong>上午 9:00</li>
</ul>
<p>请携带以下材料：身份证、学历证书、离职证明、一寸照片2张。</p>
<p>期待与您一起共创未来！</p>
<p><strong>{{company_name}}</strong> 人力资源部</p>`,
  };

  const handleTypeChange = (type: string) => {
    setForm(f => ({ ...f, type: type as any, content: defaultContent[type] || '' }));
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">模板名称 <span className="text-red-500">*</span></label>
          <input required value={form.name || ''} onChange={e => set('name', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
            placeholder="如：面试邀请模板-技术岗" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">模板类型</label>
          <select value={form.type || 'interview_invite'} onChange={e => handleTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm">
            {EMAIL_TEMPLATE_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">邮件主题 <span className="text-red-500">*</span></label>
          <input required value={form.subject || ''} onChange={e => set('subject', e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm"
            placeholder='如：{{company_name}} - {{position}}面试邀请函'
            onFocus={() => { if (!form.subject) setForm(f => ({ ...f, subject: `【{{company_name}}】{{position}}面试邀请` })); }} />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">插入变量</label>
          <div className="flex flex-wrap gap-2">
            {VARS.map(v => (
              <button key={v.key} type="button" onClick={() => insertVar(v.key)}
                className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs hover:bg-blue-100 transition-colors">
                {`{{${v.key}}}`} - {v.label}
              </button>
            ))}
          </div>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-1">模板内容 (HTML)</label>
          <textarea required value={form.content || ''} onChange={e => set('content', e.target.value)}
            rows={14} className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm font-mono resize-none"
            placeholder="支持HTML标签..." />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-input rounded-lg hover:bg-muted text-sm">取消</button>
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm">保存</button>
      </div>
    </form>
  );
}

// ============================================================
// Tab6: 数据分析
// ============================================================
function TabAnalytics({
  demandData, candidateData, interviewData, loading,
}: {
  demandData: RecruitmentDemand[]; candidateData: Candidate[]; interviewData: Interview[]; loading: boolean;
}) {
  const publishedPositions = demandData.filter(d => d.status === 'published').length;
  const totalResumes = candidateData.length;
  const interviewCount = interviewData.filter(i => ['scheduled', 'in_progress', 'completed'].includes(i.status)).length;
  const hiredCount = candidateData.filter(c => c.status === 'hired').length;
  const interviewCandidates = candidateData.filter(c => ['interview', 'offer', 'hired'].includes(c.status));
  const avgRecruitDays = interviewCandidates.length > 0 ? 14 : 0;

  // 简历来源分布
  const sourceDist: Record<string, number> = {};
  candidateData.forEach(c => { if (c.source) sourceDist[c.source] = (sourceDist[c.source] || 0) + 1; });
  const sourceColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
  const sourceChartData = Object.entries(sourceDist).map(([label, value], i) => ({
    label, value, color: sourceColors[i % sourceColors.length],
  }));

  // 各职位投递量
  const positionRank: Record<string, number> = {};
  candidateData.forEach(c => { if (c.positionName) positionRank[c.positionName] = (positionRank[c.positionName] || 0) + 1; });
  const topPositions = Object.entries(positionRank).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxRank = topPositions[0]?.[1] || 1;

  // 月度趋势（模拟）
  const months = ['1月', '2月', '3月', '4月', '5月', '6月'];
  const monthlyTrendData = months.map((month, i) => ({
    month,
    resumes: Math.max(1, Math.floor(totalResumes / 6 * (0.5 + Math.random()))),
    interviews: Math.max(1, Math.floor(interviewCount / 6 * (0.5 + Math.random()))),
    hired: Math.max(1, Math.floor(hiredCount / 6 * (0.5 + Math.random()))),
  }));
  const maxMonthly = Math.max(...monthlyTrendData.map(d => d.resumes), 1);

  // 招聘漏斗
  const funnelStages = [
    { label: '发布需求', count: publishedPositions },
    { label: '收到简历', count: totalResumes },
    { label: '安排面试', count: interviewCount },
    { label: '发放Offer', count: candidateData.filter(c => ['offer', 'hired'].includes(c.status)).length },
    { label: '入职', count: hiredCount },
  ];
  const funnelWithRate = funnelStages.map((s, i) => ({
    ...s,
    rate: funnelStages[0].count > 0 ? Math.round((s.count / funnelStages[0].count) * 100) : 0,
  }));

  const funnelColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-emerald-500'];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: '发布职位', value: publishedPositions, icon: '📋', color: 'blue' },
          { label: '收到简历', value: totalResumes, icon: '📩', color: 'green' },
          { label: '面试人次', value: interviewCount, icon: '🎤', color: 'purple' },
          { label: '录用人数', value: hiredCount, icon: '✅', color: 'orange' },
          { label: '招聘周期', value: avgRecruitDays ? `${avgRecruitDays}天` : '-', icon: '⏱️', color: 'cyan' },
        ].map((stat, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <div className={`text-3xl font-bold ${stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'purple' ? 'text-purple-600' : stat.color === 'orange' ? 'text-orange-600' : 'text-cyan-600'}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 招聘漏斗 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>🔻</span> 招聘漏斗
          </h3>
          <FunnelChart data={funnelWithRate} />
          <div className="mt-4 grid grid-cols-5 gap-2">
            {funnelWithRate.map((stage, i) => (
              <div key={i} className="text-center">
                <div className={`w-full h-10 rounded-lg mb-1 flex items-center justify-center text-white text-xs font-medium ${funnelColors[i]}`}>
                  {stage.rate}%
                </div>
                <p className="text-xs text-muted-foreground">{stage.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 简历来源分布 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>🥧</span> 简历来源分布
          </h3>
          {sourceChartData.length > 0 ? (
            <PieChart data={sourceChartData} />
          ) : (
            <EmptyState message="暂无来源数据" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 各职位投递量排名 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> 各职位投递量排名
          </h3>
          {topPositions.length > 0 ? (
            <BarChart data={topPositions.map(([label, value], i) => ({
              label,
              value,
              color: sourceColors[i % sourceColors.length],
            }))} maxValue={maxRank} />
          ) : (
            <EmptyState message="暂无投递数据" />
          )}
        </div>

        {/* 月度招聘趋势 */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>📈</span> 月度招聘趋势
          </h3>
          <BarChart
            data={monthlyTrendData.map(d => ({ label: d.month, value: d.resumes }))}
            maxValue={maxMonthly}
          />
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
            {[
              { label: '简历数', color: 'bg-blue-500' },
              { label: '面试数', color: 'bg-green-500' },
              { label: '入职数', color: 'bg-emerald-500' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`w-3 h-3 rounded ${item.color}`} />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 详细数据表格 */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4">📋 各状态候选人明细</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-3 font-medium">状态</th>
                <th className="text-left p-3 font-medium">人数</th>
                <th className="text-left p-3 font-medium">占比</th>
                <th className="text-left p-3 font-medium">趋势</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(CANDIDATE_STATUS_MAP).map(([k, v]) => {
                const count = candidateData.filter(c => c.status === k).length;
                const pct = totalResumes > 0 ? Math.round((count / totalResumes) * 100) : 0;
                return (
                  <tr key={k} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.bg} ${v.color}`}>{v.label}</span>
                    </td>
                    <td className="p-3 font-medium">{count}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-32">
                          <div className={`h-full ${v.bg} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {count > 0 ? (
                        <span className={count > totalResumes * 0.3 ? 'text-green-600' : 'text-muted-foreground'}>
                          {count > 5 ? '📈' : count > 0 ? '➡️' : '📉'}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 主组件
// ============================================================
const TABS = [
  { key: 'demand',   label: '招聘需求', icon: '📋' },
  { key: 'resume',   label: '简历管理', icon: '📄' },
  { key: 'talent',   label: '人才库',   icon: '👥' },
  { key: 'interview',label: '面试管理', icon: '🎤' },
  { key: 'email',    label: '邮件模板', icon: '📧' },
  { key: 'analytics',label: '数据分析', icon: '📊' },
];

const MOCK_DEMANDS: RecruitmentDemand[] = [
  { id: 'd1', title: '前端工程师', department: '技术部', count: 2, urgency: 'high', salaryMin: 20, salaryMax: 35, deadline: '2026-05-01', manager: '张明', status: 'published', description: '负责公司前端开发', requirements: '3年以上经验，熟练React/Vue', createdAt: '2026-04-01' },
  { id: 'd2', title: '后端工程师', department: '技术部', count: 1, urgency: 'medium', salaryMin: 18, salaryMax: 30, deadline: '2026-05-15', manager: '李华', status: 'published', description: '负责公司后端服务开发', requirements: '熟悉Node.js/Python', createdAt: '2026-04-05' },
  { id: 'd3', title: '产品经理', department: '产品部', count: 1, urgency: 'low', salaryMin: 15, salaryMax: 25, deadline: '2026-06-01', manager: '王芳', status: 'draft', description: '负责产品规划与设计', requirements: '3年以上产品经验', createdAt: '2026-04-10' },
];

const MOCK_CANDIDATES: Candidate[] = [
  { id: 'c1', name: '张三', phone: '13800138001', email: 'zhangsan@example.com', positionName: '前端工程师', source: 'BOSS直聘', status: 'interview', education: '本科', workYears: 4, currentCompany: '字节跳动', currentPosition: '前端开发', skills: 'React,TypeScript,Vite', createdAt: '2026-04-10' },
  { id: 'c2', name: '李四', phone: '13800138002', email: 'lisi@example.com', positionName: '前端工程师', source: '智联招聘', status: 'new', education: '硕士', workYears: 2, currentCompany: '腾讯', currentPosition: '前端开发', skills: 'Vue,JavaScript', createdAt: '2026-04-12' },
  { id: 'c3', name: '王五', phone: '13800138003', email: 'wangwu@example.com', positionName: '后端工程师', source: '前程无忧', status: 'offer', education: '本科', workYears: 5, currentCompany: '阿里巴巴', currentPosition: '后端架构师', skills: 'Node.js,Python,Go', createdAt: '2026-04-08' },
  { id: 'c4', name: '赵六', phone: '13800138004', email: 'zhaoliu@example.com', positionName: '产品经理', source: '内推', status: 'screening', education: '本科', workYears: 3, currentCompany: '美团', currentPosition: '产品经理', skills: 'PRD,Axure,数据分析', createdAt: '2026-04-14' },
  { id: 'c5', name: '钱七', phone: '13800138005', email: 'qianqi@example.com', positionName: '前端工程师', source: '邮箱解析', status: 'hired', education: '本科', workYears: 6, currentCompany: '百度', currentPosition: '前端leader', skills: 'React,Vue,Angular', createdAt: '2026-04-01' },
  { id: 'c6', name: '孙八', phone: '13800138006', email: 'sunba@example.com', positionName: '前端工程师', source: 'BOSS直聘', status: 'rejected', education: '大专', workYears: 1, currentCompany: '创业公司', currentPosition: '前端实习', skills: 'HTML,CSS', createdAt: '2026-04-15' },
];

const MOCK_TALENTS: Talent[] = [
  { id: 't1', name: '陈九', phone: '13900139001', email: 'chenjiu@example.com', education: '硕士', workYears: 8, currentPosition: '技术总监', currentCompany: '华为', tags: ['技术人才', '管理人才'], isBlacklist: false, source: '猎聘', createdAt: '2026-03-01' },
  { id: 't2', name: '周十', phone: '13900139002', email: 'zhoushi@example.com', education: '本科', workYears: 5, currentPosition: '资深前端', currentCompany: '京东', tags: ['技术人才'], isBlacklist: false, source: 'BOSS直聘', createdAt: '2026-03-10' },
  { id: 't3', name: '吴十一', phone: '13900139003', email: 'wushiyi@example.com', education: '本科', workYears: 2, currentPosition: '全栈工程师', currentCompany: '创业公司', tags: ['储备干部'], isBlacklist: false, source: '内推', createdAt: '2026-04-01' },
  { id: 't4', name: '郑十二', phone: '13900139004', email: 'zhengshier@example.com', education: '本科', workYears: 3, currentPosition: '前端开发', currentCompany: '小型公司', tags: ['不诚信'], isBlacklist: true, source: '其他', createdAt: '2026-03-15' },
];

const MOCK_TAGS: TalentTag[] = [
  { id: 'tag1', name: '技术人才', color: 'blue', type: 'talent' },
  { id: 'tag2', name: '管理人才', color: 'purple', type: 'talent' },
  { id: 'tag3', name: '储备干部', color: 'green', type: 'talent' },
  { id: 'tag4', name: '不诚信', color: 'red', type: 'blacklist' },
  { id: 'tag5', name: '重复投递', color: 'orange', type: 'blacklist' },
];

const MOCK_INTERVIEWS: Interview[] = [
  { id: 'i1', candidateId: 'c1', candidateName: '张三', positionName: '前端工程师', interviewer: '张经理', scheduledAt: '2026-04-25T10:00:00', method: 'video', videoLink: 'https://meeting.example.com/abc', status: 'scheduled', createdAt: '2026-04-20' },
  { id: 'i2', candidateId: 'c2', candidateName: '李四', positionName: '前端工程师', interviewer: '李工', scheduledAt: '2026-04-26T14:00:00', method: 'onsite', location: '会议室A', status: 'scheduled', createdAt: '2026-04-21' },
];

const MOCK_TEMPLATES: EmailTemplate[] = [
  { id: 'et1', name: '技术岗面试邀请', type: 'interview_invite', subject: '【飞达科技】前端工程师面试邀请', content: `<p>尊敬的 <strong>{{candidate_name}}</strong>，您好！</p><p>感谢您投递 <strong>{{company_name}}</strong> 的 <strong>{{position}}</strong> 岗位。</p><p><strong>面试时间：</strong>{{interview_time}}</p><p><strong>面试地点/链接：</strong>{{interview_location}}</p><p>请准时参加！</p>`, createdAt: '2026-04-01' },
  { id: 'et2', name: '录用Offer模板', type: 'offer', subject: '【飞达科技】录用通知 - {{position}}', content: `<p>尊敬的 <strong>{{candidate_name}}</strong>：</p><p>恭喜您通过面试！</p><p><strong>职位：</strong>{{position}}</p><p><strong>薪资：</strong>{{salary}}</p><p><strong>入职日期：</strong>{{start_date}}</p>`, createdAt: '2026-04-05' },
];

const MOCK_LOGS: EmailLog[] = [
  { id: 'log1', templateId: 'et1', templateName: '技术岗面试邀请', recipientName: '张三', recipientEmail: 'zhangsan@example.com', status: 'sent', sentAt: '2026-04-20T10:30:00' },
  { id: 'log2', templateId: 'et1', templateName: '技术岗面试邀请', recipientName: '李四', recipientEmail: 'lisi@example.com', status: 'sent', sentAt: '2026-04-21T09:15:00' },
  { id: 'log3', templateId: 'et2', templateName: '录用Offer模板', recipientName: '王五', recipientEmail: 'wangwu@example.com', status: 'sent', sentAt: '2026-04-22T11:00:00' },
];

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState('demand');
  const [loading, setLoading] = useState(true);
  const [demands, setDemands] = useState<RecruitmentDemand[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [tags, setTags] = useState<TalentTag[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: string } | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [dRes, cRes, tRes, tagRes, iRes, tmplRes, logRes] = await Promise.allSettled([
        fetch('/api/recruitment_demands').then(r => r.json()).catch(() => []),
        fetch('/api/candidates').then(r => r.json()).catch(() => []),
        fetch('/api/talent_pool').then(r => r.json()).catch(() => []),
        fetch('/api/talent_tags').then(r => r.json()).catch(() => []),
        fetch('/api/interviews').then(r => r.json()).catch(() => []),
        fetch('/api/email_templates').then(r => r.json()).catch(() => []),
        fetch('/api/email_logs').then(r => r.json()).catch(() => []),
      ]);
      setDemands(Array.isArray(dRes.value) && dRes.value.length > 0 ? dRes.value : MOCK_DEMANDS);
      setCandidates(Array.isArray(cRes.value) && cRes.value.length > 0 ? cRes.value : MOCK_CANDIDATES);
      setTalents(Array.isArray(tRes.value) && tRes.value.length > 0 ? tRes.value : MOCK_TALENTS);
      setTags(Array.isArray(tagRes.value) && tagRes.value.length > 0 ? tagRes.value : MOCK_TAGS);
      setInterviews(Array.isArray(iRes.value) && iRes.value.length > 0 ? iRes.value : MOCK_INTERVIEWS);
      setTemplates(Array.isArray(tmplRes.value) && tmplRes.value.length > 0 ? tmplRes.value : MOCK_TEMPLATES);
      setEmailLogs(Array.isArray(logRes.value) && logRes.value.length > 0 ? logRes.value : MOCK_LOGS);
    } catch {
      setDemands(MOCK_DEMANDS);
      setCandidates(MOCK_CANDIDATES);
      setTalents(MOCK_TALENTS);
      setTags(MOCK_TAGS);
      setInterviews(MOCK_INTERVIEWS);
      setTemplates(MOCK_TEMPLATES);
      setEmailLogs(MOCK_LOGS);
    } finally {
      setLoading(false);
    }
  };

  // API helpers
  const apiSave = async (table: string, data: any, id?: string) => {
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/${table}/${id}` : `/api/${table}`;
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    loadAllData();
  };

  const apiDelete = async (table: string, id: string) => {
    await fetch(`/api/${table}/${id}`, { method: 'DELETE' });
    loadAllData();
  };

  const handlePublishDemand = async (d: RecruitmentDemand) => {
    await apiSave('recruitment_demands', { ...d, status: 'published', publishedAt: new Date().toISOString() }, d.id);
  };

  const handleBatchStatus = async (ids: string[], status: CandidateStatus) => {
    await Promise.all(ids.map(id => apiSave('candidates', { status }, id)));
  };

  const handleInterviewEval = async (id: string, score: number, evaluation: string) => {
    await apiSave('interviews', { score, evaluation }, id);
  };

  const handleInterviewStatus = async (id: string, status: InterviewStatus) => {
    await apiSave('interviews', { status }, id);
  };

  const handleMoveBlacklist = async (t: Talent) => {
    await apiSave('talent_pool', { ...t, isBlacklist: true }, t.id);
  };

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">💼 招聘管理</h1>
          <p className="text-sm text-muted-foreground mt-1">覆盖招聘全流程，从需求发布到数据分析</p>
        </div>
      </div>

      {/* ⚡ 快捷操作入口 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { title: '职位管理', desc: '管理招聘岗位', icon: '📋', path: '/recruitment/position', bg: 'bg-blue-50' },
          { title: '简历库', desc: '候选人简历管理', icon: '📄', path: '/recruitment/resume', bg: 'bg-green-50' },
          { title: '候选人', desc: '候选人状态跟踪', icon: '👥', path: '/recruitment/candidate', bg: 'bg-purple-50' },
          { title: 'Offer管理', desc: '录用通知管理', icon: '✉️', path: '/recruitment/offer', bg: 'bg-orange-50' },
        ].map(action => (
          <div
            key={action.path}
            className={`${action.bg} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-primary/20`}
            onClick={() => window.location.href = action.path}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{action.icon}</span>
              <div>
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 顶部 Tab 切换 */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 内容 */}
      <div>
        {activeTab === 'demand' && (
          <TabDemand
            data={demands} loading={loading}
            onSave={d => apiSave('recruitment_demands', d, (d as any).id)}
            onDelete={id => apiDelete('recruitment_demands', id)}
            onPublish={handlePublishDemand}
            onRefresh={loadAllData}
          />
        )}
        {activeTab === 'resume' && (
          <TabResume
            data={candidates} loading={loading}
            onSave={c => apiSave('candidates', c, (c as any).id)}
            onDelete={id => apiDelete('candidates', id)}
            onStatusChange={(id, status) => apiSave('candidates', { status }, id)}
            onBatchAction={handleBatchStatus}
            onRefresh={loadAllData}
          />
        )}
        {activeTab === 'talent' && (
          <TabTalentPool
            talentData={talents} tagData={tags} loading={loading}
            onSave={t => apiSave('talent_pool', t, (t as any).id)}
            onDelete={id => apiDelete('talent_pool', id)}
            onTagSave={tag => apiSave('talent_tags', tag, (tag as any).id)}
            onTagDelete={id => apiDelete('talent_tags', id)}
            onMoveBlacklist={handleMoveBlacklist}
          />
        )}
        {activeTab === 'interview' && (
          <TabInterview
            data={interviews} candidateData={candidates} loading={loading}
            onSave={i => apiSave('interviews', i, (i as any).id)}
            onDelete={id => apiDelete('interviews', id)}
            onEvaluation={handleInterviewEval}
            onStatusChange={handleInterviewStatus}
            onRefresh={loadAllData}
          />
        )}
        {activeTab === 'email' && (
          <TabEmailTemplate
            templateData={templates} logData={emailLogs} loading={loading}
            onSave={t => apiSave('email_templates', t, (t as any).id)}
            onDelete={id => apiDelete('email_templates', id)}
            onLogRefresh={loadAllData}
          />
        )}
        {activeTab === 'analytics' && (
          <TabAnalytics
            demandData={demands} candidateData={candidates} interviewData={interviews} loading={loading}
          />
        )}
      </div>

      {/* 确认删除 */}
      {confirmDelete && (
        <ConfirmModal
          title="确认删除"
          message="确定要删除这条记录吗？此操作不可撤销。"
          onConfirm={() => {
            const [type, id] = confirmDelete.type.split(':');
            const tableMap: Record<string, string> = {
              demand: 'recruitment_demands', candidate: 'candidates', talent: 'talent_pool',
              tag: 'talent_tags', interview: 'interviews', template: 'email_templates',
            };
            apiDelete(tableMap[type] || type, id);
            setConfirmDelete(null);
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
