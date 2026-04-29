import React, { useState, useEffect } from 'react';
import {
  Modal, Form, Input, Select, InputNumber, Switch, Button, Row, Col, 
  Divider, Tag, Space, message, Tabs
} from 'antd';
import {
  PlusOutlined, VideoCameraOutlined, FileTextOutlined, FormOutlined,
  PlayCircleOutlined, DeleteOutlined, SaveOutlined, UploadOutlined
} from '@ant-design/icons';
import VideoUploader from './VideoUploader';

const { TextArea } = Input;
const { Option } = Select;

export interface ChapterV2 {
  id?: string;
  courseId?: string;
  title: string;
  description?: string;
  chapterType: 'text' | 'video' | 'live' | 'exam';
  sortOrder?: number;
  required?: number;
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

interface ChapterEditorProps {
  visible: boolean;
  chapter: ChapterV2 | null;
  courseId?: string;
  onClose: () => void;
  onSave: (data: ChapterV2) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const chapterTypeMap = [
  { value: 'text', label: '图文', icon: <FileTextOutlined />, color: 'green' },
  { value: 'video', label: '视频', icon: <VideoCameraOutlined />, color: 'blue' },
  { value: 'live', label: '直播', icon: <PlayCircleOutlined />, color: 'purple' },
  { value: 'exam', label: '考试', icon: <FormOutlined />, color: 'orange' },
];

const ChapterEditor: React.FC<ChapterEditorProps> = ({
  visible,
  chapter,
  courseId,
  onClose,
  onSave,
  onDelete,
  isAdmin = false,
}) => {
  const [form] = Form.useForm();
  const [chapterType, setChapterType] = useState<string>('video');
  const [saving, setSaving] = useState(false);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  useEffect(() => {
    if (visible) {
      if (chapter) {
        form.setFieldsValue(chapter);
        setChapterType(chapter.chapterType);
        setVideoDuration(chapter.videoDuration || 0);
      } else {
        form.resetFields();
        form.setFieldsValue({
          chapterType: 'video',
          required: 1,
          sortOrder: 0,
          examDuration: 60,
          passingScore: 60,
        });
        setChapterType('video');
        setVideoDuration(0);
      }
    }
  }, [visible, chapter]);

  const handleSubmit = async (values: any) => {
    if (!courseId && !chapter?.courseId) {
      message.error('缺少课程ID');
      return;
    }
    
    setSaving(true);
    try {
      const data: ChapterV2 = {
        ...values,
        courseId: courseId || chapter?.courseId,
        videoDuration: chapterType === 'video' ? videoDuration : undefined,
      };
      onSave(data);
      onClose();
    } catch (e: any) {
      message.error(e.message || '保存失败');
    }
    setSaving(false);
  };

  const handleVideoChange = (url: string, duration?: number) => {
    if (url) {
      form.setFieldValue('videoUrl', url);
      if (duration) {
        setVideoDuration(duration);
      }
    } else {
      form.setFieldValue('videoUrl', '');
      setVideoDuration(0);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      title={chapter ? '编辑章节' : '添加章节'}
      width={700}
      footer={
        <Space>
          {chapter && onDelete && (
            <Button danger onClick={() => onDelete(chapter.id!)}>
              删除
            </Button>
          )}
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => form.submit()}>
            保存
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name="title" label="章节标题" rules={[{ required: true, message: '请输入章节标题' }]}>
              <Input placeholder="例如：第一章 课程介绍" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="chapterType" label="章节类型" rules={[{ required: true }]}>
              <Select onChange={(v) => setChapterType(v)}>
                {chapterTypeMap.map(t => (
                  <Option key={t.value} value={t.value}>
                    <span className={`text-${t.color}`}>{t.icon} {t.label}</span>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="章节描述">
          <TextArea rows={2} placeholder="章节简介（可选）" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="sortOrder" label="排序">
              <InputNumber min={0} max={999} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="required" label="是否必学" valuePropName="checked">
              <Switch checkedChildren="必学" unCheckedChildren="选学" />
            </Form.Item>
          </Col>
        </Row>

        <Divider>章节内容</Divider>

        {/* 图文内容 */}
        {chapterType === 'text' && (
          <Form.Item name="content" label="图文内容">
            <TextArea 
              rows={12} 
              placeholder="请输入章节内容，支持 Markdown 格式"
            />
          </Form.Item>
        )}

        {/* 视频内容 */}
        {chapterType === 'video' && (
          <div className="space-y-4">
            <Form.Item name="videoUrl" label="视频">
              <VideoUploader
                value={form.getFieldValue('videoUrl')}
                onChange={handleVideoChange}
                courseId={courseId || chapter?.courseId}
                chapterId={chapter?.id}
              />
            </Form.Item>
            
            {videoDuration > 0 && (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                视频时长：{Math.floor(videoDuration / 60)}分{videoDuration % 60}秒
              </div>
            )}

            <Form.Item name="thumbnailUrl" label="视频封面">
              <Input placeholder="视频封面图 URL（可选）" />
            </Form.Item>

            <Form.Item name="hlsUrl" label="HLS 地址">
              <Input placeholder="HLS 流媒体地址（可选，用于多清晰度切换）" />
            </Form.Item>
          </div>
        )}

        {/* 直播内容 */}
        {chapterType === 'live' && (
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="liveStartTime" label="直播开始时间">
                  <Input type="datetime-local" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="liveEndTime" label="直播结束时间">
                  <Input type="datetime-local" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="liveStatus" label="直播状态">
              <Select placeholder="选择直播状态">
                <Option value="pending">未开始</Option>
                <Option value="live">直播中</Option>
                <Option value="ended">已结束</Option>
              </Select>
            </Form.Item>

            <div className="bg-purple-50 p-3 rounded text-sm">
              <Tag color="purple">提示</Tag>
              <span className="text-gray-600">
                直播功能需要配合直播推流服务使用，请联系管理员配置直播推流地址。
              </span>
            </div>
          </div>
        )}

        {/* 考试内容 */}
        {chapterType === 'exam' && (
          <div className="space-y-4">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="examDuration" label="考试时长（分钟）">
                  <InputNumber min={1} max={300} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="passingScore" label="及格分数">
                  <InputNumber min={1} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="examId" label="关联考试">
              <Input placeholder="考试 ID（可选，用于关联考试系统）" />
            </Form.Item>

            <div className="bg-orange-50 p-3 rounded text-sm">
              <Tag color="orange">提示</Tag>
              <span className="text-gray-600">
                考试功能需要配合考试系统使用，完成考试后自动记录成绩。
              </span>
            </div>
          </div>
        )}
      </Form>
    </Modal>
  );
};

export default ChapterEditor;
