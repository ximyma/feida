import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Tag, Space, Progress, Empty, Row, Col,
  Statistic, Select, message, Modal, Tabs, Badge, Avatar, Tooltip
} from 'antd';
import {
  PlayCircleOutlined, CheckCircleOutlined, ClockCircleOutlined,
  BookOutlined, VideoCameraOutlined, FileTextOutlined, 
  StarOutlined, TeamOutlined, EyeOutlined, DeleteOutlined,
  EditOutlined, ReadOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import type { TabsProps } from 'antd';

const { Option } = Select;

// ============ 类型定义 ============
interface LearningRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  courseId: string;
  courseName: string;
  coverUrl?: string;
  categoryName?: string;
  courseType?: string;
  teacherName?: string;
  credit?: number;
  durationMinutes?: number;
  chapterCount?: number;
  videoPosition: number;
  videoDuration: number;
  progressPercent: number;
  status: 'not_started' | 'in_progress' | 'completed';
  totalWatchTime: number;
  watchCount: number;
  lastAccessAt?: string;
  completedAt?: string;
}

interface Note {
  id: string;
  courseId: string;
  chapterId: string;
  noteType: 'note' | 'highlight' | 'question';
  content: string;
  highlightText?: string;
  createdAt: string;
}

interface Stats {
  enrolledCourses: number;
  completedCourses: number;
  totalLearningTime: number;
  pendingCourses: number;
  totalCredits: number;
}

// ============ 常量 ============
const courseTypeMap: Record<string, { label: string; icon: React.ReactNode }> = {
  text: { label: '图文', icon: <FileTextOutlined /> },
  video: { label: '视频', icon: <VideoCameraOutlined /> },
  live: { label: '直播', icon: <PlayCircleOutlined /> },
  mixed: { label: '混合', icon: <BookOutlined /> },
};

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  not_started: { label: '未开始', color: 'default', icon: <ClockCircleOutlined /> },
  in_progress: { label: '进行中', color: 'processing', icon: <PlayCircleOutlined /> },
  completed: { label: '已完成', color: 'success', icon: <CheckCircleOutlined /> },
};

const noteTypeMap: Record<string, { label: string; color: string }> = {
  note: { label: '笔记', color: 'blue' },
  highlight: { label: '划重点', color: 'green' },
  question: { label: '提问', color: 'orange' },
};

// ============ 工具函数 ============
const formatDuration = (seconds: number): string => {
  if (!seconds) return '-';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}小时${m}分钟`;
  if (m > 0) return `${m}分钟`;
  return `${s}秒`;
};

const formatDate = (date: string | null | undefined): string => {
  if (!date) return '-';
  return date.slice(0, 16);
};

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ============ API ============
const API = {
  get: async (url: string) => {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`${url} failed: ${r.status}`);
    return r.json();
  },
  post: async (url: string, data: any) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`${url} failed: ${r.status}`);
    return r.json();
  },
  delete: async (url: string) => {
    const r = await fetch(url, { method: 'DELETE' });
    if (!r.ok) throw new Error(`${url} failed: ${r.status}`);
    return r.json();
  },
};

// ============ 学习记录卡片 ============
const LearningCard: React.FC<{
  record: LearningRecord;
  onResume: (record: LearningRecord) => void;
  onViewNotes: (record: LearningRecord) => void;
}> = ({ record, onResume, onViewNotes }) => {
  const statusInfo = statusMap[record.status] || statusMap.not_started;
  const typeInfo = courseTypeMap[record.courseType || 'video'] || courseTypeMap.video;
  
  return (
    <Card size="small" className="hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <img 
          src={record.coverUrl || `https://picsum.photos/seed/${record.courseId}/120/68`}
          alt={record.courseName}
          className="w-28 h-16 object-cover rounded"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Tag color={typeInfo.icon ? 'blue' : 'default'}>{typeInfo.icon}{typeInfo.label}</Tag>
                {record.status === 'completed' && <Tag color="green">已完成</Tag>}
                {record.credit && record.credit > 0 && <Tag color="purple">{record.credit}学分</Tag>}
              </div>
              <h4 className="font-medium text-sm truncate" title={record.courseName}>
                {record.courseName || '未知课程'}
              </h4>
              <div className="text-xs text-gray-500 mt-1">
                {record.teacherName && <span>讲师: {record.teacherName}</span>}
                {record.durationMinutes && <span className="ml-2">时长: {Math.floor(record.durationMinutes / 60)}h{record.durationMinutes % 60}m</span>}
              </div>
            </div>
          </div>
          
          {/* 进度条 */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">
                {record.status === 'completed' ? '已完成' : 
                  record.status === 'in_progress' ? '继续学习' : '未开始'}
              </span>
              <span className="font-medium">{Math.round(record.progressPercent || 0)}%</span>
            </div>
            <Progress 
              percent={Math.round(record.progressPercent || 0)} 
              size="small"
              status={record.status === 'completed' ? 'success' : 'active'}
              showInfo={false}
            />
            {record.status === 'in_progress' && record.videoPosition > 0 && record.videoDuration > 0 && (
              <div className="text-xs text-gray-400 mt-1">
                已观看: {formatDuration(record.videoPosition)} / {formatDuration(record.videoDuration)}
              </div>
            )}
          </div>
          
          {/* 操作 */}
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
            <Button size="small" type="link" icon={<EyeOutlined />} onClick={() => onViewNotes(record)}>
              笔记
            </Button>
            <Button 
              size="small" 
              type="primary" 
              icon={record.status === 'completed' ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => onResume(record)}
            >
              {record.status === 'completed' ? '复习' : record.status === 'in_progress' ? '继续' : '开始'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

// ============ 笔记弹窗 ============
const NotesModal: React.FC<{
  visible: boolean;
  courseId: string;
  onClose: () => void;
}> = ({ visible, courseId, onClose }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (visible && courseId) {
      loadNotes();
    }
  }, [visible, courseId]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/api/training/v2/notes?employeeId=emp-1&courseId=${courseId}`);
      if (res.success) {
        setNotes(res.data || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await API.delete(`/api/training/v2/notes/${id}`);
      messageApi.success('笔记已删除');
      loadNotes();
    } catch (e) { messageApi.error('删除失败'); }
  };

  return (
    <Modal open={visible} onCancel={onClose} width={700} title="我的笔记" footer={null}>
      {contextHolder}
      {notes.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notes.map(note => (
            <Card key={note.id} size="small">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag color={noteTypeMap[note.noteType]?.color}>{noteTypeMap[note.noteType]?.label}</Tag>
                    <span className="text-xs text-gray-400">{formatDate(note.createdAt)}</span>
                  </div>
                  {note.highlightText && (
                    <div className="text-sm text-gray-600 italic border-l-2 border-yellow-400 pl-2 mb-2">
                      "{note.highlightText}"
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                </div>
                <Button 
                  size="small" 
                  danger 
                  type="link" 
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(note.id)}
                />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="暂无笔记" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Modal>
  );
};

// ============ 主组件：我的学习 ============
interface MyLearningTabProps {
  employeeId?: string;
  employeeName?: string;
}

export default function MyLearningTab({ employeeId = 'emp-1', employeeName = '' }: MyLearningTabProps) {
  const [records, setRecords] = useState<LearningRecord[]>([]);
  const [stats, setStats] = useState<Stats>({
    enrolledCourses: 0,
    completedCourses: 0,
    totalLearningTime: 0,
    pendingCourses: 0,
    totalCredits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('learning');
  const [notesModal, setNotesModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [messageApi, contextHolder] = message.useMessage();

  // 加载学习记录
  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ employeeId });
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await API.get(`/api/training/v2/my/learning?${params.toString()}`);
      if (res.success) {
        setRecords(res.data || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [employeeId, statusFilter]);

  // 加载统计
  const loadStats = async () => {
    try {
      const res = await API.get(`/api/training/v2/stats?employeeId=${employeeId}`);
      if (res.success && res.data?.myStats) {
        setStats(res.data.myStats);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    loadRecords();
    loadStats();
  }, [loadRecords]);

  // 继续学习
  const handleResume = (record: LearningRecord) => {
    messageApi.info(`继续学习: ${record.courseName || '课程'}`);
    // 实际场景中，这里应该跳转到学习页面
    window.open(`/training/player/${record.courseId}`, '_blank');
  };

  // 查看笔记
  const handleViewNotes = (record: LearningRecord) => {
    setSelectedCourseId(record.courseId);
    setNotesModal(true);
  };

  // 统计卡片
  const statCards = [
    { label: '学习中', value: stats.enrolledCourses - stats.completedCourses, icon: <PlayCircleOutlined />, color: '#1677ff' },
    { label: '已完成', value: stats.completedCourses, icon: <CheckCircleOutlined />, color: '#52c41a' },
    { label: '学习时长', value: formatDuration(stats.totalLearningTime), icon: <ClockCircleOutlined />, color: '#722ed1' },
    { label: '获得学分', value: stats.totalCredits, icon: <StarOutlined />, color: '#faad14' },
  ];

  // 按状态分组
  const notStarted = records.filter(r => r.status === 'not_started');
  const inProgress = records.filter(r => r.status === 'in_progress');
  const completed = records.filter(r => r.status === 'completed');

  const tabItems: TabsProps['items'] = [
    {
      key: 'learning',
      label: (
        <span>
          进行中 
          <Badge count={inProgress.length} size="small" style={{ marginLeft: 4 }} />
        </span>
      ),
      children: (
        <div className="space-y-3">
          {inProgress.length > 0 ? (
            inProgress.map(record => (
              <LearningCard 
                key={record.id} 
                record={record} 
                onResume={handleResume}
                onViewNotes={handleViewNotes}
              />
            ))
          ) : (
            <Empty description="暂无正在进行的学习" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      ),
    },
    {
      key: 'pending',
      label: (
        <span>
          待学习 
          <Badge count={notStarted.length} size="small" style={{ marginLeft: 4 }} />
        </span>
      ),
      children: (
        <div className="space-y-3">
          {notStarted.length > 0 ? (
            notStarted.map(record => (
              <LearningCard 
                key={record.id} 
                record={record} 
                onResume={handleResume}
                onViewNotes={handleViewNotes}
              />
            ))
          ) : (
            <Empty description="暂无待学习的课程" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      ),
    },
    {
      key: 'completed',
      label: (
        <span>
          已完成 
          <Badge count={completed.length} size="small" style={{ marginLeft: 4 }} />
        </span>
      ),
      children: (
        <div className="space-y-3">
          {completed.length > 0 ? (
            completed.map(record => (
              <LearningCard 
                key={record.id} 
                record={record} 
                onResume={handleResume}
                onViewNotes={handleViewNotes}
              />
            ))
          ) : (
            <Empty description="暂无已完成的课程" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {contextHolder}
      
      {/* 统计卡片 */}
      <Row gutter={16}>
        {statCards.map((stat, index) => (
          <Col span={6} key={index}>
            <Card size="small">
              <Statistic 
                title={stat.label} 
                value={stat.value} 
                valueStyle={{ color: stat.color }}
                prefix={stat.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 筛选 */}
      <Card size="small">
        <Space>
          <Select 
            placeholder="按状态筛选" 
            allowClear 
            style={{ width: 120 }}
            value={statusFilter || undefined}
            onChange={v => setStatusFilter(v || '')}
          >
            <Option value="not_started">未开始</Option>
            <Option value="in_progress">进行中</Option>
            <Option value="completed">已完成</Option>
          </Select>
          <Button onClick={() => loadRecords()}>刷新</Button>
        </Space>
      </Card>

      {/* 学习列表 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
      />

      {/* 笔记弹窗 */}
      <NotesModal
        visible={notesModal}
        courseId={selectedCourseId}
        onClose={() => setNotesModal(false)}
      />
    </div>
  );
}