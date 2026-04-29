/**
 * 课程评价组件
 * 评分、评论、评价管理
 */
import React, { useState } from 'react';
import {
  Card, Rate, Button, Input, Tag, Avatar, Space, Typography,
  Empty, Spin, List, Modal, Form, message, Divider
} from 'antd';
import {
  UserOutlined, EditOutlined, DeleteOutlined, LikeOutlined, StarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

// API 请求封装
const api = {
  get: (url: string) => fetch(`/api${url}`).then(r => r.json()),
  post: (url: string, data: any) => fetch(`/api${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  put: (url: string, data: any) => fetch(`/api${url}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: (url: string) => fetch(`/api${url}`, { method: 'DELETE' }).then(r => r.json()),
};

export interface Review {
  id: string;
  courseId: string;
  courseName?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userDept?: string;
  rating: number; // 1-5
  content: string;
  likeCount: number;
  isLiked?: boolean;
  status: 'pending' | 'published' | 'hidden';
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewFormData {
  courseId: string;
  rating: number;
  content: string;
}

interface CourseReviewModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  currentUserId: string;
  currentUserName: string;
  isAdmin?: boolean;
}

export default function CourseReviewModal({
  visible, onClose, courseId, courseName, currentUserId, currentUserName, isAdmin = false
}: CourseReviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      loadReviews();
    }
  }, [visible, courseId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/training/v2/reviews?courseId=${courseId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
        // 检查是否有我的评价
        const mine = data.data?.find((r: Review) => r.userId === currentUserId);
        setMyReview(mine || null);
      }
    } catch (error) {
      console.error('加载评价失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (values: { rating: number; content: string }) => {
    if (!values.content.trim()) {
      message.warning('请输入评价内容');
      return;
    }
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/training/v2/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          rating: values.rating,
          content: values.content,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews(prev => [data.data, ...prev]);
        setMyReview(data.data);
        message.success('评价提交成功');
        form.resetFields();
      } else {
        message.error(data.message || '提交失败');
      }
    } catch (error) {
      message.error('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (review: Review) => {
    const updatedReviews = reviews.map(r => {
      if (r.id === review.id) {
        return {
          ...r,
          likeCount: r.isLiked ? r.likeCount - 1 : r.likeCount + 1,
          isLiked: !r.isLiked
        };
      }
      return r;
    });
    setReviews(updatedReviews);
  };

  const handleDeleteReview = async (reviewId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条评价吗？',
      onOk: async () => {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        if (myReview?.id === reviewId) {
          setMyReview(null);
        }
        message.success('评价已删除');
      }
    });
  };

  const handleHideReview = async (reviewId: string) => {
    setReviews(prev => prev.map(r => 
      r.id === reviewId ? { ...r, status: 'hidden' as const } : r
    ));
    message.success('评价已隐藏');
  };

  // 统计信息
  const stats = {
    total: reviews.length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0',
    distribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }
  };

  return (
    <Modal
      title={
        <Space>
          <StarOutlined />
          <span>课程评价 - {courseName}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <div style={{ maxHeight: 600, overflow: 'auto' }}>
        {/* 统计概览 */}
        <Card size="small" style={{ marginBottom: 16, background: '#fafafa' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 'bold', color: '#faad14' }}>{stats.avgRating}</div>
              <Rate disabled allowHalf defaultValue={Number(stats.avgRating)} style={{ fontSize: 14 }} />
              <div style={{ color: '#999', fontSize: 12 }}>{stats.total} 条评价</div>
            </div>
            <div style={{ flex: 1 }}>
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 16 }}>{star}星</span>
                  <div style={{ flex: 1, height: 8, background: '#e8e8e8', borderRadius: 4 }}>
                    <div 
                      style={{ 
                        width: `${stats.total > 0 ? (stats.distribution[star as keyof typeof stats.distribution] / stats.total * 100) : 0}%`,
                        height: '100%',
                        background: '#faad14',
                        borderRadius: 4,
                        transition: 'width 0.3s'
                      }} 
                    />
                  </div>
                  <span style={{ width: 24, textAlign: 'right', color: '#999' }}>
                    {stats.distribution[star as keyof typeof stats.distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 写评价表单 */}
        {!myReview && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Form form={form} onFinish={handleSubmitReview}>
              <Form.Item 
                name="rating" 
                label="课程评分"
                rules={[{ required: true, message: '请选择评分' }]}
              >
                <Rate />
              </Form.Item>
              <Form.Item 
                name="content"
                rules={[{ required: true, message: '请输入评价内容' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="分享你的学习心得，帮助其他人更好地了解这门课程..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                <Button type="primary" htmlType="submit" loading={submitting} icon={<EditOutlined />}>
                  提交评价
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* 我的评价 */}
        {myReview && (
          <Card 
            size="small" 
            style={{ marginBottom: 16, borderColor: '#1890ff' }}
            title={<Tag color="blue">我的评价</Tag>}
            extra={
              <Button 
                type="text" 
                danger 
                size="small" 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteReview(myReview.id)}
              >
                删除
              </Button>
            }
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <Avatar icon={<UserOutlined />} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Text strong>{myReview.userName}</Text>
                  <Rate disabled value={myReview.rating} style={{ fontSize: 12 }} />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(myReview.createdAt).fromNow()}
                  </Text>
                </div>
                <Paragraph style={{ margin: 0 }}>{myReview.content}</Paragraph>
              </div>
            </div>
          </Card>
        )}

        <Divider style={{ margin: '16px 0' }}>学员评价</Divider>

        {/* 评价列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <Spin />
          </div>
        ) : reviews.filter(r => r.userId !== currentUserId).length === 0 ? (
          <Empty description="暂无其他评价" />
        ) : (
          <List
            dataSource={reviews.filter(r => r.userId !== currentUserId)}
            renderItem={review => (
              <List.Item
                key={review.id}
                actions={[
                  <Button 
                    key="like" 
                    type={review.isLiked ? 'primary' : 'text'} 
                    size="small"
                    icon={<LikeOutlined />}
                    onClick={() => handleLike(review)}
                  >
                    {review.likeCount}
                  </Button>,
                  isAdmin && review.status === 'published' && (
                    <Button 
                      key="hide" 
                      type="text" 
                      size="small"
                      onClick={() => handleHideReview(review.id)}
                    >
                      隐藏
                    </Button>
                  )
                ].filter(Boolean)}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Space>
                      <Text strong>{review.userName}</Text>
                      {review.userDept && <Tag color="default">{review.userDept}</Tag>}
                      <Rate disabled value={review.rating} style={{ fontSize: 12 }} />
                    </Space>
                  }
                  description={
                    <>
                      <Paragraph style={{ margin: '8px 0 0' }}>{review.content}</Paragraph>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(review.createdAt).fromNow()}
                      </Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  );
}
