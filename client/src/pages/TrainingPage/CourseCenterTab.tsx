import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, Tag, Space,
  Row, Col, Progress, Rate, Empty, Tabs, message, Divider, Descriptions,
  InputNumber, Switch, DatePicker, Tooltip, Avatar, Badge, Statistic,
  Modal as AntdModal
} from 'antd';
import {
  PlusOutlined, SearchOutlined, VideoCameraOutlined, FileTextOutlined,
  PlayCircleOutlined, BookOutlined, StarOutlined, TeamOutlined,
  EyeOutlined, LockOutlined, CheckCircleOutlined, ClockCircleOutlined,
  EditOutlined, DeleteOutlined, EyeInvisibleOutlined, ReadOutlined,
  PictureOutlined, FormOutlined, SendOutlined,
  ForwardOutlined, LikeOutlined, MessageOutlined, LockFilled,
  BookFilled, LoadingOutlined
} from '@ant-design/icons';

// 动态导入 VideoPlayer
const VideoPlayer = React.lazy(() => import('./components/VideoPlayer'));
// 动态导入 TextReader
const TextReader = React.lazy(() => import('./components/TextReader'));
import type { TabsProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ============ 类型定义 ============
interface CourseV2 {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
  categoryId: string;
  categoryName: string;
  courseType: 'text' | 'video' | 'live' | 'mixed';
  teacherId: string;
  teacherName: string;
  description: string;
  targetType: 'all' | 'department' | 'position';
  targetValues: string;
  completionType: 'duration' | 'complete' | 'exam';
  completionValue: number;
  credit: number;
  durationMinutes: number;
  chapterCount: number;
  enrollmentCount: number;
  completionCount: number;
  rating: number;
  reviewCount: number;
  isMandatory: number;
  isPublic: number;
  status: 'draft' | 'published' | 'offline';
  tags: string;
  chapters?: ChapterV2[];
  reviewStats?: any;
}

interface ChapterV2 {
  id: string;
  courseId: string;
  title: string;
  description: string;
  chapterType: 'text' | 'video' | 'live' | 'exam';
  sortOrder: number;
  required: number;
  content?: string;
  contentLength?: number;
  videoUrl?: string;
  videoDuration?: number;
  videoQuality?: string;
  hlsUrl?: string;
  thumbnailUrl?: string;
  liveStartTime?: string;
  liveEndTime?: string;
  liveStatus?: string;
  examId?: string;
  examDuration?: number;
  passingScore?: number;
}

interface CategoryV2 {
  id: string;
  name: string;
  parentId: string | null;
  icon: string;
  sortOrder: number;
  description: string;
}

interface LearningProgress {
  id: string;
  employeeId: string;
  courseId: string;
  chapterId: string;
  progressPercent: number;
  videoPosition: number;
  videoDuration: number;
  status: 'not_started' | 'in_progress' | 'completed';
  lastAccessAt: string;
}

interface ReviewV2 {
  id: string;
  courseId: string;
  employeeId: string;
  employeeName: string;
  rating: number;
  content: string;
  createdAt: string;
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

// ============ 常量映射 ============
const courseTypeMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  text: { label: '图文', color: 'green', icon: <FileTextOutlined /> },
  video: { label: '视频', color: 'blue', icon: <VideoCameraOutlined /> },
  live: { label: '直播', color: 'purple', icon: <PlayCircleOutlined /> },
  mixed: { label: '混合', color: 'orange', icon: <BookOutlined /> },
};

const chapterTypeMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  text: { label: '图文', color: 'green', icon: <FileTextOutlined /> },
  video: { label: '视频', color: 'blue', icon: <VideoCameraOutlined /> },
  live: { label: '直播', color: 'purple', icon: <PlayCircleOutlined /> },
  exam: { label: '考试', color: 'orange', icon: <FormOutlined /> },
};

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  published: { label: '已发布', color: 'green' },
  offline: { label: '已下线', color: 'red' },
};

const progressStatusMap: Record<string, { label: string; color: string }> = {
  not_started: { label: '未开始', color: 'default' },
  in_progress: { label: '进行中', color: 'processing' },
  completed: { label: '已完成', color: 'success' },
};

// ============ 工具函数 ============
const safeParse = <T,>(str: string | null | undefined, fallback: T): T => {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch { return fallback; }
};

const genId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const formatDuration = (minutes: number): string => {
  if (!minutes) return '-';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}分钟`;
};

const formatDate = (date: string | null | undefined): string => {
  if (!date) return '-';
  return date.slice(0, 16);
};

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
  put: async (url: string, data: any) => {
    const r = await fetch(url, {
      method: 'PUT',
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

// ============ 课程卡片组件 ============
const CourseCard: React.FC<{
  course: CourseV2;
  onClick: (course: CourseV2) => void;
  showActions?: boolean;
  onEdit?: (course: CourseV2) => void;
  onDelete?: (id: string) => void;
}> = ({ course, onClick, showActions, onEdit, onDelete }) => {
  const typeInfo = courseTypeMap[course.courseType] || courseTypeMap.video;
  const tags = safeParse<string[]>(course.tags, []);
  const targetValues = safeParse<string[]>(course.targetValues, []);

  return (
    <Card
      hoverable
      className="course-card"
      cover={
        <div className="relative">
          <img 
            src={course.coverUrl || `https://picsum.photos/seed/${course.id}/400/225`} 
            alt={course.title}
            className="h-36 object-cover"
          />
          {course.isMandatory === 1 && (
            <Tag color="red" className="absolute top-2 right-2">必修</Tag>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <div className="flex items-center gap-2 text-white text-xs">
              <span className="flex items-center gap-1">
                <TeamOutlined /> {course.enrollmentCount}人学习
              </span>
              <span className="flex items-center gap-1">
                <CheckCircleOutlined /> {course.completionCount}人完成
              </span>
            </div>
          </div>
        </div>
      }
      onClick={() => onClick(course)}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
          <Tag color="blue">{course.categoryName || '未分类'}</Tag>
        </div>
        <h3 className="font-semibold text-base line-clamp-2" title={course.title}>{course.title}</h3>
        {course.subtitle && (
          <p className="text-xs text-gray-500 line-clamp-1">{course.subtitle}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Avatar size="small" className="bg-blue-500">{course.teacherName?.charAt(0) || '讲'}</Avatar>
            {course.teacherName || '未知讲师'}
          </span>
          <span className="flex items-center gap-1">
            <StarOutlined className="text-yellow-500" /> {course.rating > 0 ? course.rating.toFixed(1) : '暂无'}
            <span className="text-gray-400">({course.reviewCount})</span>
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {course.chapterCount}章节 | {formatDuration(course.durationMinutes)}
          </span>
          {course.credit > 0 && <Tag color="purple">{course.credit}学分</Tag>}
        </div>
        {tags.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {tags.slice(0, 3).map((tag, i) => (
              <Tag key={i} className="text-xs">{tag}</Tag>
            ))}
          </div>
        )}
        {showActions && (
          <div className="flex justify-end gap-2 pt-2 border-t">
            {onEdit && <Button size="small" type="link" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); onEdit(course); }}>编辑</Button>}
            {onDelete && <Button size="small" danger type="link" icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); onDelete(course.id); }}>删除</Button>}
          </div>
        )}
      </div>
    </Card>
  );
};

// ============ 课程详情弹窗 ============
const CourseDetailModal: React.FC<{
  visible: boolean;
  course: CourseV2 | null;
  onClose: () => void;
  onStartLearning?: (course: CourseV2) => void;
  onChapterClick?: (course: CourseV2, chapter: ChapterV2) => void;
}> = ({ visible, course, onClose, onStartLearning, onChapterClick }) => {
  const [reviews, setReviews] = useState<ReviewV2[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (course && visible) {
      loadReviews();
    }
  }, [course, visible]);

  const loadReviews = async () => {
    if (!course) return;
    setLoading(true);
    try {
      const res = await API.get(`/api/training/v2/reviews?courseId=${course.id}`);
      if (res.success) {
        setReviews(res.data || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (!course) return null;

  const typeInfo = courseTypeMap[course.courseType] || courseTypeMap.video;
  const chapters = course.chapters || [];
  const reviewStats = course.reviewStats;
  const tags = safeParse<string[]>(course.tags, []);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={900}
      footer={null}
      title={
        <div className="flex items-center gap-2">
          <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
          <span>{course.title}</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 封面和基本信息 */}
        <div className="flex gap-4">
          <img 
            src={course.coverUrl || `https://picsum.photos/seed/${course.id}/400/225`} 
            alt={course.title}
            className="w-48 h-28 object-cover rounded"
          />
          <div className="flex-1 space-y-2">
            <Descriptions size="small" column={2}>
              <Descriptions.Item label="讲师">{course.teacherName || '-'}</Descriptions.Item>
              <Descriptions.Item label="分类">{course.categoryName || '-'}</Descriptions.Item>
              <Descriptions.Item label="时长">{formatDuration(course.durationMinutes)}</Descriptions.Item>
              <Descriptions.Item label="章节">{course.chapterCount}个</Descriptions.Item>
              <Descriptions.Item label="学分">{course.credit > 0 ? `${course.credit}分` : '无'}</Descriptions.Item>
              <Descriptions.Item label="学习人数">{course.enrollmentCount}人</Descriptions.Item>
            </Descriptions>
          </div>
        </div>

        {/* 课程简介 */}
        {course.description && (
          <div>
            <h4 className="font-semibold mb-2">课程介绍</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{course.description}</p>
          </div>
        )}

        {/* 评价统计 */}
        {reviewStats && (
          <div className="flex items-center gap-6 p-4 bg-gray-50 rounded">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500">{Number(reviewStats.avgRating || 0).toFixed(1)}</div>
              <Rate disabled defaultValue={Math.round(reviewStats.avgRating || 0)} allowHalf />
              <div className="text-sm text-gray-500">{reviewStats.total}条评价</div>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map(star => {
                const key = `${star}Star` as keyof typeof reviewStats;
                const count = reviewStats[key] || 0;
                const percent = reviewStats.total > 0 ? (count / reviewStats.total * 100).toFixed(0) : '0';
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span>{star}星</span>
                    <Progress percent={Number(percent)} size="small" showInfo={false} className="flex-1" />
                    <span className="text-gray-500 w-8">{count}人</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 章节列表 */}
        <div>
          <h4 className="font-semibold mb-2">课程目录 ({chapters.length}章节)</h4>
          <div className="space-y-2">
            {chapters.map((ch, index) => {
              const chType = chapterTypeMap[ch.chapterType] || chapterTypeMap.text;
              return (
                <div 
                  key={ch.id}
                  className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => onChapterClick?.(course, ch)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{ch.title}</span>
                      <Tag color={chType.color} className="text-xs">{chType.label}</Tag>
                      {ch.required === 1 && <Tag className="text-xs">必学</Tag>}
                    </div>
                    <div className="text-xs text-gray-500">
                      {ch.chapterType === 'video' && `${Math.floor((ch.videoDuration || 0) / 60)}分`}
                      {ch.chapterType === 'text' && `${ch.contentLength || 0}字`}
                      {ch.chapterType === 'exam' && `考试 ${ch.examDuration || 0}分钟`}
                      {ch.chapterType === 'live' && (ch.liveStartTime ? `直播时间: ${ch.liveStartTime}` : '待定')}
                    </div>
                  </div>
                  {ch.chapterType === 'live' && ch.liveStatus === 'live' && (
                    <Tag color="red" className="animate-pulse">直播中</Tag>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 最新评价 */}
        <div>
          <h4 className="font-semibold mb-2">学员评价</h4>
          {reviews.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {reviews.slice(0, 5).map(rev => (
                <div key={rev.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{rev.employeeName}</span>
                    <Rate disabled defaultValue={rev.rating} size="small" />
                  </div>
                  <p className="text-sm text-gray-600">{rev.content}</p>
                  <div className="text-xs text-gray-400 mt-1">{formatDate(rev.createdAt)}</div>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="暂无评价" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={onClose}>关闭</Button>
          {onStartLearning && (
            <Button type="primary" icon={<PlayCircleOutlined />} onClick={() => onStartLearning(course)}>
              {course.completionCount > 0 ? '继续学习' : '开始学习'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

// ============ 课程学习器 ============
const CourseViewer: React.FC<{
  visible: boolean;
  course: CourseV2 | null;
  chapter: ChapterV2 | null;
  employeeId: string;
  onClose: () => void;
}> = ({ visible, course, chapter, employeeId, onClose }) => {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [readingPosition, setReadingPosition] = useState(0);
  const [noteModal, setNoteModal] = useState(false);
  const [noteForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const saveTimerRef = useRef<number | null>(null);

  // 加载进度
  useEffect(() => {
    if (course && visible) {
      loadProgress();
    }
  }, [course, visible]);

  const loadProgress = async () => {
    if (!course || !employeeId) return;
    try {
      const res = await API.get(`/api/training/v2/progress/${course.id}?employeeId=${employeeId}`);
      if (res.success) {
        setProgress(res.data.progress);
      }
    } catch (e) { console.error(e); }
  };

  // 保存视频播放位置（断点续看）
  const saveVideoPosition = useCallback(async (position: number, duration: number) => {
    if (!course || !employeeId || !chapter) return;
    
    // 防抖：每10秒最多保存一次
    if (saveTimerRef.current) return;
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
    }, 10000);

    try {
      const percent = duration > 0 ? (position / duration) * 100 : 0;
      await API.post('/api/training/v2/progress', {
        employeeId,
        employeeName: '',
        courseId: course.id,
        courseName: course.title,
        chapterId: chapter.id,
        chapterType: chapter.chapterType,
        position,
        duration,
        totalLength: chapter.videoDuration || 0,
        progressPercent: percent,
      });
    } catch (e) { console.error(e); }
  }, [course, employeeId, chapter]);

  // 保存其他类型进度
  const saveProgress = async (position: number, type: string, duration: number) => {
    if (!course || !employeeId) return;
    try {
      const percent = duration > 0 ? (position / duration) * 100 : 0;
      await API.post('/api/training/v2/progress', {
        employeeId,
        employeeName: '',
        courseId: course.id,
        courseName: course.title,
        chapterId: chapter?.id || '',
        chapterType: type,
        position,
        duration,
        totalLength: chapter?.contentLength || 0,
        progressPercent: percent,
      });
      messageApi.success('进度已保存');
    } catch (e) { console.error(e); }
  };

  const handleSaveNote = async (values: any) => {
    if (!course || !chapter || !employeeId) return;
    try {
      await API.post('/api/training/v2/notes', {
        employeeId,
        employeeName: '',
        courseId: course.id,
        chapterId: chapter.id,
        noteType: values.noteType,
        content: values.content,
        highlightText: values.highlightText,
      });
      messageApi.success('笔记已保存');
      setNoteModal(false);
      noteForm.resetFields();
    } catch (e) { messageApi.error('保存失败'); }
  };

  // 视频播放完成回调
  const handleVideoEnded = async () => {
    if (!course || !chapter || !employeeId) return;
    try {
      await API.post('/api/training/v2/progress', {
        employeeId,
        employeeName: '',
        courseId: course.id,
        courseName: course.title,
        chapterId: chapter.id,
        chapterType: chapter.chapterType,
        position: chapter.videoDuration || 0,
        duration: chapter.videoDuration || 0,
        totalLength: chapter.videoDuration || 0,
        progressPercent: 100,
        status: 'completed',
      });
      messageApi.success('恭喜！本章已完成');
      loadProgress(); // 刷新进度
    } catch (e) { console.error(e); }
  };

  if (!course || !chapter) return null;

  const chapterType = chapterTypeMap[chapter.chapterType] || chapterTypeMap.text;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={1000}
      footer={null}
      title={
        <div className="flex items-center gap-2">
          <Tag color={chapterType.color}>{chapterType.label}</Tag>
          <span>{chapter.title}</span>
          <span className="text-gray-400 text-sm">- {course.title}</span>
        </div>
      }
    >
      <div className="space-y-4">
        {contextHolder}
        
        {/* 章节内容区域 */}
        <div className="border rounded overflow-hidden">
          {/* 图文内容 - 使用 TextReader */}
          {chapter.chapterType === 'text' && chapter.content && (
            <div className="h-[70vh]">
              <React.Suspense fallback={
                <div className="flex items-center justify-center h-full">
                  <LoadingOutlined className="text-3xl animate-spin" />
                </div>
              }>
                <TextReader
                  content={chapter.content}
                  title={chapter.title}
                  courseId={course.id}
                  chapterId={chapter.id}
                  employeeId={employeeId}
                  initialPosition={progress?.videoPosition || 0}
                  onPositionChange={(pos) => saveProgress(pos, 'text', chapter.contentLength || 0)}
                  onSaveNote={async (note) => {
                    await API.post('/api/training/v2/notes', {
                      employeeId,
                      employeeName: '',
                      courseId: course.id,
                      chapterId: chapter.id,
                      noteType: note.noteType,
                      content: note.content,
                      highlightText: note.highlightText,
                    });
                  }}
                  onDeleteNote={async (id) => {
                    await API.delete(`/api/training/v2/notes/${id}`);
                  }}
                  onMarkComplete={async () => {
                    await saveProgress(100, 'text', chapter.contentLength || 0);
                    setProgress(prev => prev ? { ...prev, progressPercent: 100, status: 'completed' } : null);
                  }}
                  onProgress={(percent) => {
                    if (percent > (progress?.progressPercent || 0)) {
                      setProgress(prev => prev ? { ...prev, progressPercent: percent } : null);
                    }
                  }}
                />
              </React.Suspense>
            </div>
          )}
          
          {/* 视频内容 */}
          {chapter.chapterType === 'video' && (
            <div className="bg-black">
              {chapter.videoUrl || chapter.hlsUrl ? (
                <React.Suspense fallback={
                  <div className="flex items-center justify-center h-64">
                    <LoadingOutlined className="text-white text-3xl animate-spin" />
                  </div>
                }>
                  <VideoPlayer
                    src={chapter.videoUrl}
                    hlsUrl={chapter.hlsUrl}
                    poster={chapter.thumbnailUrl}
                    title={chapter.title}
                    initialPosition={progress?.videoPosition || 0}
                    autoSavePosition={true}
                    onPositionChange={saveVideoPosition}
                    onEnded={handleVideoEnded}
                    onProgress={(percent) => {
                      if (percent > (progress?.progressPercent || 0)) {
                        // 进度增加时更新本地状态
                        setProgress(prev => prev ? { ...prev, progressPercent: percent } : null);
                      }
                    }}
                    playbackRates={[0.5, 0.75, 1, 1.25, 1.5, 2]}
                  />
                </React.Suspense>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <VideoCameraOutlined style={{ fontSize: 48 }} className="text-gray-400 mb-2" />
                    <p className="text-gray-500">暂无视频内容</p>
                    <p className="text-xs text-gray-400 mt-2">请联系管理员上传视频</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* 考试内容 */}
          {chapter.chapterType === 'exam' && (
            <div className="text-center py-12 px-4">
              <FormOutlined style={{ fontSize: 48 }} className="text-orange-400 mb-2" />
              <h3 className="text-lg font-medium mb-2">章节测验</h3>
              <p className="text-gray-500">测验时长: {chapter.examDuration || 60}分钟</p>
              <p className="text-gray-500">及格分数: {chapter.passingScore || 60}分</p>
              <Button type="primary" className="mt-4" icon={<FormOutlined />}>开始测验</Button>
            </div>
          )}
          
          {/* 直播内容 */}
          {chapter.chapterType === 'live' && (
            <div className="text-center py-12">
              {chapter.liveStatus === 'live' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <PlayCircleOutlined style={{ fontSize: 32, color: 'white' }} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">直播进行中</h3>
                  <Button type="primary" size="large" icon={<VideoCameraOutlined />}>进入直播间</Button>
                </>
              ) : (
                <>
                  <ClockCircleOutlined style={{ fontSize: 48 }} className="text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium mb-2">直播预告</h3>
                  <p className="text-gray-500">直播时间: {chapter.liveStartTime || '待定'}</p>
                  {chapter.liveStartTime && (
                    <Button className="mt-4" icon={<ClockCircleOutlined />}>预约提醒</Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* 学习操作栏 */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div className="flex gap-2">
            <Button icon={<EditOutlined />} onClick={() => setNoteModal(true)}>记笔记</Button>
            {chapter.chapterType === 'text' && (
              <Button icon={<ReadOutlined />} onClick={() => {
                setReadingPosition(prev => prev + 500);
                saveProgress(readingPosition + 500, 'text', chapter.contentLength || 0);
              }}>
                已阅读
              </Button>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {progress && (
              <span className="flex items-center gap-2">
                <span>学习进度: {Math.round(progress.progressPercent || 0)}%</span>
                {progress.status === 'completed' && (
                  <Tag color="green" className="text-xs">已完成</Tag>
                )}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button icon={<LeftOutlined />} disabled>上一章</Button>
            <Button type="primary" icon={<RightOutlined />}>下一章</Button>
          </div>
        </div>

        {/* 学习提示 */}
        {chapter.chapterType === 'video' && progress?.videoPosition && progress.videoPosition > 0 && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded text-sm">
            <VideoCameraOutlined className="text-blue-500" />
            <span className="text-blue-700">
              断点续看：上次学习到 {Math.floor(progress.videoPosition / 60)}分{progress.videoPosition % 60}秒
            </span>
          </div>
        )}
      </div>

      {/* 笔记弹窗 */}
      <Modal
        open={noteModal}
        onCancel={() => setNoteModal(false)}
        onOk={() => noteForm.submit()}
        title="添加笔记"
      >
        <Form form={noteForm} layout="vertical" onFinish={handleSaveNote}>
          <Form.Item name="noteType" label="笔记类型" initialValue="note">
            <Select>
              <Option value="note">普通笔记</Option>
              <Option value="highlight">划重点</Option>
              <Option value="question">提问</Option>
            </Select>
          </Form.Item>
          <Form.Item name="content" label="笔记内容" rules={[{ required: true, message: '请输入笔记内容' }]}>
            <TextArea rows={4} placeholder="记录你的学习心得..." />
          </Form.Item>
          <Form.Item name="highlightText" label="高亮原文（可选）">
            <Input placeholder="如果有高亮的原文，请输入" />
          </Form.Item>
        </Form>
      </Modal>
    </Modal>
  );
};

// 补充缺失的图标
import {
  LeftOutlined, RightOutlined
} from '@ant-design/icons';

// ============ 创建/编辑课程弹窗 ============
const CourseFormModal: React.FC<{
  visible: boolean;
  course: CourseV2 | null;
  categories: CategoryV2[];
  onClose: () => void;
  onSave: (data: any) => void;
}> = ({ visible, course, categories, onClose, onSave }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (course) {
        form.setFieldsValue({
          title: course.title,
          subtitle: course.subtitle,
          categoryId: course.categoryId,
          courseType: course.courseType,
          teacherName: course.teacherName,
          description: course.description,
          credit: course.credit,
          durationMinutes: course.durationMinutes,
          isMandatory: course.isMandatory === 1,
          isPublic: course.isPublic === 1,
          tags: safeParse<string[]>(course.tags, []).join(', '),
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          courseType: 'video',
          isPublic: true,
          isMandatory: false,
          credit: 0,
          durationMinutes: 60,
        });
      }
    }
  }, [visible, course]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      };
      if (course) {
        await API.put(`/api/training/v2/courses/${course.id}`, data);
      } else {
        await API.post('/api/training/v2/courses', data);
      }
      onSave(data);
      onClose();
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      title={course ? '编辑课程' : '创建课程'}
      width={600}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item name="title" label="课程标题" rules={[{ required: true, message: '请输入课程标题' }]}>
          <Input placeholder="例如：React 核心原理与实战" />
        </Form.Item>
        
        <Form.Item name="subtitle" label="副标题">
          <Input placeholder="课程的简短描述" />
        </Form.Item>
        
        <Form.Item name="courseType" label="课程类型" rules={[{ required: true }]}>
          <Select>
            <Option value="text">图文课程</Option>
            <Option value="video">视频课程</Option>
            <Option value="live">直播课程</Option>
            <Option value="mixed">混合课程</Option>
          </Select>
        </Form.Item>
        
        <Form.Item name="categoryId" label="课程分类">
          <Select placeholder="选择分类">
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id}>{cat.name}</Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item name="teacherName" label="讲师姓名">
          <Input placeholder="输入讲师姓名" />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="credit" label="学分">
              <InputNumber min={0} max={20} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="durationMinutes" label="预计时长(分钟)">
              <InputNumber min={0} step={10} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item name="description" label="课程介绍">
          <TextArea rows={4} placeholder="详细介绍课程的背景、目标、内容大纲..." />
        </Form.Item>
        
        <Form.Item name="tags" label="标签（逗号分隔）">
          <Input placeholder="例如：React, 前端, Hooks" />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="isMandatory" label="是否必修" valuePropName="checked">
              <Switch checkedChildren="必修" unCheckedChildren="选修" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="isPublic" label="是否公开" valuePropName="checked">
              <Switch checkedChildren="公开" unCheckedChildren="内部" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

// ============ 主组件：课程中心 ============
interface CourseCenterProps {
  employeeId?: string;
  isAdmin?: boolean;
}

export default function CourseCenter({ employeeId = 'emp-1', isAdmin = false }: CourseCenterProps) {
  const [categories, setCategories] = useState<CategoryV2[]>([]);
  const [courses, setCourses] = useState<CourseV2[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  
  // 筛选
  const [categoryId, setCategoryId] = useState<string>('');
  const [courseType, setCourseType] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  
  // 弹窗
  const [detailModal, setDetailModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseV2 | null>(null);
  const [formModal, setFormModal] = useState(false);
  const [viewerModal, setViewerModal] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<ChapterV2 | null>(null);
  
  const [messageApi, contextHolder] = message.useMessage();

  // 加载分类
  const loadCategories = async () => {
    try {
      const res = await API.get('/api/training/categories');
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (e) { console.error(e); }
  };

  // 加载课程
  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (categoryId) params.append('categoryId', categoryId);
      if (courseType) params.append('courseType', courseType);
      if (keyword) params.append('keyword', keyword);
      
      const res = await API.get(`/api/training/v2/courses?${params.toString()}`);
      if (res.success) {
        setCourses(res.data || []);
        setTotal(res.total || 0);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, pageSize, categoryId, courseType, keyword]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // 查看课程详情
  const handleCourseClick = async (course: CourseV2) => {
    try {
      const res = await API.get(`/api/training/v2/courses/${course.id}`);
      if (res.success) {
        setSelectedCourse(res.data);
        setDetailModal(true);
      }
    } catch (e) { console.error(e); }
  };

  // 开始学习
  const handleStartLearning = (course: CourseV2) => {
    setDetailModal(false);
    if (course.chapters && course.chapters.length > 0) {
      setSelectedChapter(course.chapters[0]);
      setViewerModal(true);
    }
  };

  // 点击章节
  const handleChapterClick = (course: CourseV2, chapter: ChapterV2) => {
    setSelectedCourse(course);
    setSelectedChapter(chapter);
    setDetailModal(false);
    setViewerModal(true);
  };

  // 保存课程
  const handleSaveCourse = async () => {
    loadCourses();
  };

  // 删除课程
  const handleDeleteCourse = async (id: string) => {
    try {
      await API.delete(`/api/training/v2/courses/${id}`);
      messageApi.success('课程已删除');
      loadCourses();
    } catch (e) { messageApi.error('删除失败'); }
  };

  // 发布课程
  const handlePublishCourse = async (id: string) => {
    try {
      await API.post(`/api/training/v2/courses/${id}/publish`);
      messageApi.success('课程已发布');
      loadCourses();
    } catch (e) { messageApi.error('发布失败'); }
  };

  // 统计数据
  const stats = {
    total: courses.length,
    enrolled: courses.reduce((sum, c) => sum + c.enrollmentCount, 0),
    completed: courses.reduce((sum, c) => sum + c.completionCount, 0),
    avgRating: courses.length > 0 ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1) : '0',
  };

  return (
    <div className="space-y-4">
      {contextHolder}
      
      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="课程总数" value={total} suffix="门" valueStyle={{ color: '#1677ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="学习人次" value={stats.enrolled} suffix="人" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="完成人次" value={stats.completed} suffix="人" valueStyle={{ color: '#722ed1' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="平均评分" value={stats.avgRating} suffix={<StarOutlined className="text-yellow-500" />} />
          </Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <Card size="small">
        <Space wrap>
          <Input 
            placeholder="搜索课程" 
            prefix={<SearchOutlined />} 
            allowClear 
            style={{ width: 200 }}
            value={keyword}
            onChange={e => { setKeyword(e.target.value); setPage(1); }}
          />
          <Select 
            placeholder="课程类型" 
            allowClear 
            style={{ width: 120 }}
            value={courseType || undefined}
            onChange={v => { setCourseType(v || ''); setPage(1); }}
          >
            <Option value="text">图文</Option>
            <Option value="video">视频</Option>
            <Option value="live">直播</Option>
            <Option value="mixed">混合</Option>
          </Select>
          <Select 
            placeholder="课程分类" 
            allowClear 
            style={{ width: 140 }}
            value={categoryId || undefined}
            onChange={v => { setCategoryId(v || ''); setPage(1); }}
          >
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id}>{cat.name}</Option>
            ))}
          </Select>
          {isAdmin && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedCourse(null); setFormModal(true); }}>
              创建课程
            </Button>
          )}
        </Space>
      </Card>

      {/* 课程网格 */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">加载中...</div>
      ) : courses.length > 0 ? (
        <Row gutter={[16, 16]}>
          {courses.map(course => (
            <Col span={6} key={course.id}>
              <CourseCard 
                course={course}
                onClick={handleCourseClick}
                showActions={isAdmin}
                onEdit={(c) => { setSelectedCourse(c); setFormModal(true); }}
                onDelete={handleDeleteCourse}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="暂无课程" />
      )}

      {/* 分页 */}
      {total > pageSize && (
        <div className="flex justify-center">
          <Row gutter={16}>
            <Col>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={(p, ps) => { setPage(p); setPageSize(ps || 12); }}
                showSizeChanger
                showTotal={(t) => `共 ${t} 门课程`}
              />
            </Col>
          </Row>
        </div>
      )}

      {/* 课程详情弹窗 */}
      <CourseDetailModal
        visible={detailModal}
        course={selectedCourse}
        onClose={() => setDetailModal(false)}
        onStartLearning={handleStartLearning}
        onChapterClick={handleChapterClick}
      />

      {/* 创建/编辑课程弹窗 */}
      <CourseFormModal
        visible={formModal}
        course={selectedCourse}
        categories={categories}
        onClose={() => setFormModal(false)}
        onSave={handleSaveCourse}
      />

      {/* 课程学习器 */}
      <CourseViewer
        visible={viewerModal}
        course={selectedCourse}
        chapter={selectedChapter}
        employeeId={employeeId}
        onClose={() => setViewerModal(false)}
      />
    </div>
  );
}

// 导入 Pagination
import { Pagination } from 'antd';