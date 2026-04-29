import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, DatePicker, Select, Switch, Button, Space, message, Statistic, Row, Col, Alert } from 'antd';
import { VideoCameraOutlined, PlayCircleOutlined, StopOutlined, UserOutlined, ClockCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

interface LiveSession {
  id: string;
  chapterId: string;
  title: string;
  description?: string;
  streamKey: string;
  streamUrl: string;
  pullUrl: string;
  status: 'pending' | 'live' | 'ended';
  viewerCount: number;
  maxViewerCount: number;
  totalDuration: number;
  recordUrl?: string;
  startedAt?: string;
  endedAt?: string;
}

interface LiveControlModalProps {
  /** 是否可见 */
  visible: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 直播会话数据 */
  session?: LiveSession | null;
  /** 操作类型 */
  mode: 'create' | 'control';
  /** 创建/更新回调 */
  onSave?: (data: Partial<LiveSession>) => Promise<void>;
  /** 开始直播回调 */
  onStart?: (sessionId: string) => Promise<void>;
  /** 结束直播回调 */
  onStop?: (sessionId: string) => Promise<void>;
  /** 删除直播回调 */
  onDelete?: (sessionId: string) => Promise<void>;
  /** 章节列表（用于创建直播时选择） */
  chapters?: Array<{ id: string; title: string; courseId: string }>;
}

const LiveControlModal: React.FC<LiveControlModalProps> = ({
  visible,
  onClose,
  session,
  mode,
  onSave,
  onStart,
  onStop,
  onDelete,
  chapters = [],
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 初始化表单数据
  useEffect(() => {
    if (session && mode === 'control') {
      form.setFieldsValue({
        title: session.title,
        description: session.description,
        streamKey: session.streamKey,
        status: session.status,
      });
    } else {
      form.resetFields();
    }
  }, [session, mode, form]);

  // 保存直播配置
  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const data: Partial<LiveSession> = {
        ...values,
        // 生成推流密钥
        streamKey: values.streamKey || `live_${Date.now()}`,
        streamUrl: `rtmp://your-stream-server.com/live/${values.streamKey || `live_${Date.now()}`}`,
        pullUrl: `http://your-cdn.com/live/${values.streamKey || `live_${Date.now()}`}.m3u8`,
      };
      
      await onSave?.(data);
      message.success('保存成功');
      onClose();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  }, [form, onSave, onClose]);

  // 开始直播
  const handleStart = useCallback(async () => {
    if (!session) return;
    
    try {
      setActionLoading('start');
      await onStart?.(session.id);
      message.success('直播已开始');
    } catch (err) {
      message.error('启动直播失败');
    } finally {
      setActionLoading(null);
    }
  }, [session, onStart]);

  // 结束直播
  const handleStop = useCallback(async () => {
    if (!session) return;
    
    Modal.confirm({
      title: '确认结束直播？',
      content: '结束直播后，观众将无法继续观看，是否确认结束？',
      onOk: async () => {
        try {
          setActionLoading('stop');
          await onStop?.(session.id);
          message.success('直播已结束');
        } catch (err) {
          message.error('结束直播失败');
        } finally {
          setActionLoading(null);
        }
      },
    });
  }, [session, onStop]);

  // 删除直播
  const handleDelete = useCallback(async () => {
    if (!session) return;
    
    Modal.confirm({
      title: '确认删除直播？',
      content: '删除后无法恢复，是否确认删除？',
      onOk: async () => {
        try {
          setActionLoading('delete');
          await onDelete?.(session.id);
          message.success('删除成功');
          onClose();
        } catch (err) {
          message.error('删除失败');
        } finally {
          setActionLoading(null);
        }
      },
    });
  }, [session, onDelete, onClose]);

  // 复制推流地址
  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    message.success(`${label}已复制`);
  }, []);

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 创建模式
  if (mode === 'create') {
    return (
      <Modal
        title="创建直播"
        open={visible}
        onCancel={onClose}
        footer={[
          <Button key="cancel" onClick={onClose}>取消</Button>,
          <Button key="save" type="primary" loading={loading} onClick={handleSave}>
            创建
          </Button>,
        ]}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'pending',
          }}
        >
          <Form.Item
            name="chapterId"
            label="关联章节"
            rules={[{ required: true, message: '请选择关联章节' }]}
          >
            <Select placeholder="请选择直播关联的章节">
              {chapters.map(ch => (
                <Select.Option key={ch.id} value={ch.id}>
                  {ch.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="直播标题"
            rules={[{ required: true, message: '请输入直播标题' }]}
          >
            <Input placeholder="请输入直播标题" maxLength={100} showCount />
          </Form.Item>

          <Form.Item
            name="description"
            label="直播描述"
          >
            <Input.TextArea 
              placeholder="请输入直播描述（可选）" 
              rows={3} 
              maxLength={500} 
              showCount 
            />
          </Form.Item>

          <Form.Item
            name="streamKey"
            label="推流密钥"
            extra="自定义推流密钥，或留空自动生成"
          >
            <Input placeholder="留空将自动生成" />
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  // 控制模式
  return (
    <Modal
      title={
        <span className="flex items-center gap-2">
          <VideoCameraOutlined />
          直播控制
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      {session && (
        <>
          {/* 直播状态提示 */}
          {session.status === 'pending' && (
            <Alert
              message="直播未开始"
              description="请使用 OBS 等推流软件开始推流，推流地址如下"
              type="info"
              showIcon
              className="mb-4"
            />
          )}
          {session.status === 'live' && (
            <Alert
              message="正在直播中"
              description={`直播时长：${formatDuration(session.totalDuration)}`}
              type="success"
              showIcon
              className="mb-4"
            />
          )}
          {session.status === 'ended' && (
            <Alert
              message="直播已结束"
              description="本次直播已结束，可查看回放或创建新的直播"
              type="info"
              showIcon
              className="mb-4"
            />
          )}

          {/* 直播信息 */}
          <Form
            form={form}
            layout="vertical"
            className="mb-4"
          >
            <Form.Item name="title" label="直播标题">
              <Input disabled />
            </Form.Item>
          </Form>

          {/* 统计卡片 */}
          <Row gutter={16} className="mb-4">
            <Col span={8}>
              <Statistic
                title="当前观看"
                value={session.viewerCount}
                prefix={<UserOutlined className="text-blue-500" />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="最高在线"
                value={session.maxViewerCount}
                prefix={<UserOutlined className="text-green-500" />}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="直播时长"
                value={formatDuration(session.totalDuration)}
                prefix={<ClockCircleOutlined className="text-orange-500" />}
              />
            </Col>
          </Row>

          {/* 推流/拉流地址 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-3">直播地址</h4>
            <Space direction="vertical" className="w-full">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm w-16">推流地址：</span>
                <Input
                  value={session.streamUrl}
                  disabled
                  style={{ flex: 1 }}
                />
                <Button 
                  size="small" 
                  onClick={() => copyToClipboard(session.streamUrl, '推流地址')}
                >
                  复制
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm w-16">拉流地址：</span>
                <Input
                  value={session.pullUrl}
                  disabled
                  style={{ flex: 1 }}
                />
                <Button 
                  size="small" 
                  onClick={() => copyToClipboard(session.pullUrl, '拉流地址')}
                >
                  复制
                </Button>
              </div>
              {session.recordUrl && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm w-16">回放地址：</span>
                  <Input
                    value={session.recordUrl}
                    disabled
                    style={{ flex: 1 }}
                  />
                  <Button size="small">查看</Button>
                </div>
              )}
            </Space>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between">
            <Space>
              {session.status !== 'ended' && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={actionLoading === 'delete'}
                  onClick={handleDelete}
                >
                  删除
                </Button>
              )}
            </Space>
            <Space>
              {session.status === 'pending' && (
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  loading={actionLoading === 'start'}
                  onClick={handleStart}
                >
                  开始直播
                </Button>
              )}
              {session.status === 'live' && (
                <Button
                  danger
                  icon={<StopOutlined />}
                  loading={actionLoading === 'stop'}
                  onClick={handleStop}
                >
                  结束直播
                </Button>
              )}
              <Button onClick={onClose}>关闭</Button>
            </Space>
          </div>
        </>
      )}
    </Modal>
  );
};

export default LiveControlModal;
export type { LiveSession, LiveControlModalProps };
