import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Tag, Spin, Empty, Button, Input, Form, message, Divider, Breadcrumb, Avatar } from 'antd';
import { ArrowLeft, ArrowRight, Calendar, Eye, MessageSquare, Heart, Share2, Clock, Printer, User } from 'lucide-react';

const { TextArea } = Input;

interface Article {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  source?: string;
  summary?: string;
  content?: string;
  image_url?: string;
  images_list?: string[];
  video_url?: string;
  tags_list?: string[];
  attachments_list?: any[];
  keywords?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_top: number;
  is_hot: number;
  is_recommend: number;
  channel?: any;
  channel_id?: string;
  channel_name?: string;
  publish_time?: string;
  created_at: string;
  comments?: Comment[];
  prev_article?: any;
  next_article?: any;
}

interface Comment {
  id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  reply_count: number;
  like_count: number;
  replies?: Comment[];
}

export default function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [tagCloud, setTagCloud] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    if (id) {
      loadArticle();
    }
  }, [id]);

  useEffect(() => {
    fetch('/api/cms-tags')
      .then(r => r.json())
      .then(d => setTagCloud(Array.isArray(d) ? d : []))
      .catch(() => setTagCloud([]));
  }, []);

  const loadArticle = async () => {
    try {
      const res = await fetch(`/api/cms-articles/${id}`);
      const data = await res.json();
      if (data.error) {
        message.error('文章不存在');
        navigate('/site/articles');
        return;
      }
      setArticle(data);
    } catch (e) {
      message.error('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    setLikeLoading(true);
    // 模拟点赞
    setTimeout(() => {
      if (article) {
        setArticle({ ...article, like_count: (article.like_count || 0) + 1 });
        message.success('点赞成功');
      }
      setLikeLoading(false);
    }, 500);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      message.success('链接已复制到剪贴板');
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleComment = async () => {
    if (!comment.trim()) {
      message.warning('请输入评论内容');
      return;
    }
    setSubmitting(true);
    try {
      await fetch('/api/cms-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: id,
          user_name: '游客',
          content: comment
        })
      });
      message.success('评论提交成功，等待审核');
      setComment('');
      loadArticle();
    } catch (e) {
      message.error('评论提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="article-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-detail-not-found">
        <Empty description="文章不存在" />
        <Button type="primary" onClick={() => navigate('/site/articles')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      {/* 顶部导航 */}
      <header className="article-header">
        <div className="header-content">
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>返回</Button>
          <Link to="/site" className="logo">
            <span>飞达资讯</span>
          </Link>
        </div>
      </header>

      {/* 面包屑 */}
      <div className="breadcrumb-bar">
        <div className="breadcrumb-content">
          <Breadcrumb
            items={[
              { title: <Link to="/site">首页</Link> },
              { title: <Link to="/site/articles">资讯中心</Link> },
              article.channel_name ? { title: <Link to={`/site/articles?channel=${article.channel_id}`}>{article.channel_name}</Link> } : null,
              { title: article.title }
            ].filter(Boolean)}
          />
        </div>
      </div>

      {/* 文章主体 */}
      <main className="article-main">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className="article-card">
              <div className="article-header-section">
                {article.is_top === 1 && <Tag color="red">置顶</Tag>}
                {article.is_hot === 1 && <Tag color="orange">热门</Tag>}
                {article.is_recommend === 1 && <Tag color="gold">推荐</Tag>}
                <h1 className="article-title">{article.title}</h1>
                {article.subtitle && <p className="article-subtitle">{article.subtitle}</p>}

                <div className="article-meta">
                  <span><User size={14} /> {article.author || 'admin'}</span>
                  {article.source && <span>来源: {article.source}</span>}
                  <span><Calendar size={14} /> {new Date(article.publish_time || article.created_at).toLocaleDateString()}</span>
                  <span><Eye size={14} /> {article.view_count || 0} 阅读</span>
                  <span><MessageSquare size={14} /> {article.comment_count || 0} 评论</span>
                </div>

                <div className="article-actions">
                  <Button icon={<Heart size={14} />} onClick={handleLike} loading={likeLoading}>
                    {article.like_count || 0}
                  </Button>
                  <Button icon={<Share2 size={14} />} onClick={handleShare}>分享</Button>
                  <Button icon={<Printer size={14} />} onClick={handlePrint}>打印</Button>
                </div>
              </div>

              <Divider />

              {/* 摘要 */}
              {article.summary && (
                <div className="article-summary">
                  <strong>摘要：</strong>{article.summary}
                </div>
              )}

              {/* 正文 */}
              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: article.content || '<p>暂无正文内容</p>' }}
              />

              {/* 图片集 */}
              {article.images_list?.length > 0 && (
                <div className="article-images">
                  <h4>图片集</h4>
                  <Row gutter={[8, 8]}>
                    {article.images_list.map((img, idx) => (
                      <Col xs={12} sm={8} key={idx}>
                        <img src={img} alt={`图片${idx + 1}`} />
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* 标签 */}
              {article.tags_list?.length > 0 && (
                <div className="article-tags">
                  <strong>标签：</strong>
                  {article.tags_list.map(tag => (
                    <Link key={tag} to={`/site/articles?tag=${encodeURIComponent(tag)}`}>
                      <Tag color="blue" style={{ cursor: 'pointer' }}>{tag}</Tag>
                    </Link>
                  ))}
                </div>
              )}

              {/* 附件下载 */}
              {article.attachments_list && article.attachments_list.length > 0 && (
                <div className="article-attachments" style={{ marginTop: 16 }}>
                  <strong>附件下载：</strong>
                  <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {article.attachments_list.map((att: any) => (
                      <a key={att.id} href={att.file_path} target="_blank" rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1677ff' }}>
                        📎 {att.file_name}
                        {att.file_size ? <span style={{ color: '#999', fontSize: 12 }}>（{(att.file_size / 1024).toFixed(1)} KB）</span> : null}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 上下篇 */}
              <Divider />
              <div className="article-nav">
                {article.prev_article ? (
                  <Link to={`/site/article/${article.prev_article.id}`} className="prev-article">
                    <ArrowLeft size={14} />
                    <span>上一篇：{article.prev_article.title}</span>
                  </Link>
                ) : <span className="no-article">没有了</span>}
                {article.next_article ? (
                  <Link to={`/site/article/${article.next_article.id}`} className="next-article">
                    <span>下一篇：{article.next_article.title}</span>
                    <ArrowRight size={14} />
                  </Link>
                ) : <span className="no-article">没有了</span>}
              </div>
            </Card>

            {/* 评论 */}
            <Card title={`评论 (${article.comment_count || 0})`} className="comments-card">
              <Form layout="vertical">
                <Form.Item>
                  <TextArea
                    rows={3}
                    placeholder="写下你的评论..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    maxLength={500}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={handleComment} loading={submitting}>
                    发表评论
                  </Button>
                </Form.Item>
              </Form>

              <Divider />

              <div className="comments-list">
                {article.comments?.map(c => (
                  <div key={c.id} className="comment-item">
                    <Avatar>{c.user_name?.charAt(0) || '游'}</Avatar>
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="user-name">{c.user_name || '游客'}</span>
                        <span className="comment-time">
                          <Clock size={12} />
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="comment-content">{c.content}</div>
                      <div className="comment-actions">
                        <Button type="text" size="small" icon={<Heart size={12} />}>{c.like_count || 0}</Button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!article.comments || article.comments.length === 0) && (
                  <Empty description="暂无评论，来说两句吧" />
                )}
              </div>
            </Card>
          </Col>

          {/* 侧边栏 */}
          <Col xs={24} lg={8}>
            {/* 相关推荐 */}
            <Card title="相关推荐" className="sidebar-card">
              <div className="related-list">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="related-item">
                    <span className="num">{i}</span>
                    <span className="title">相关文章标题示例 {i}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* 热门文章 */}
            <Card title="热门文章" className="sidebar-card">
              <div className="hot-list">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="hot-item">
                    <span className={`rank ${i <= 3 ? 'top' : ''}`}>{i}</span>
                    <span className="title">热门文章标题示例 {i}</span>
                    <span className="views"><Eye size={12} /> {Math.floor(Math.random() * 1000)}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* 标签云 */}
            <Card title="标签云" className="sidebar-card">
              <div className="tags-cloud">
                {(tagCloud.length > 0
                  ? tagCloud
                  : ['行业动态', '技术分享', '产品评测', '经验心得', '政策法规', '企业文化', '人才招聘', '培训发展'].map(name => ({ name, count: 0 }))
                ).map(t => (
                  <Link key={t.name} to={`/site/articles?tag=${encodeURIComponent(t.name)}`}>
                    <Tag size="large" color="blue" style={{ cursor: 'pointer' }}>
                      {t.name}{t.count ? ` (${t.count})` : ''}
                    </Tag>
                  </Link>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </main>

      {/* 页脚 */}
      <footer className="article-footer">
        <div className="footer-content">
          <p>© 2024 飞达信息管理系统</p>
        </div>
      </footer>

      <style>{`
        .article-detail-page { background: #f5f5f5; min-height: 100vh; }
        .article-header { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
        .header-content { max-width: 1200px; margin: 0 auto; padding: 12px 20px; display: flex; align-items: center; gap: 16px; }
        .logo { font-size: 18px; font-weight: bold; color: #1890ff; }
        .breadcrumb-bar { background: #fff; border-bottom: 1px solid #eee; }
        .breadcrumb-content { max-width: 1200px; margin: 0 auto; padding: 12px 20px; }
        .article-main { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
        .article-card { }
        .article-header-section { }
        .article-header-section h1 { font-size: 28px; font-weight: bold; margin: 12px 0; line-height: 1.4; }
        .article-subtitle { font-size: 16px; color: #666; margin-bottom: 16px; }
        .article-meta { display: flex; gap: 16px; color: #999; font-size: 14px; flex-wrap: wrap; }
        .article-meta span { display: flex; align-items: center; gap: 4px; }
        .article-actions { display: flex; gap: 8px; margin-top: 16px; }
        .article-summary { background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 20px; color: #666; line-height: 1.6; }
        .article-content { font-size: 16px; line-height: 1.8; color: #333; }
        .article-content img { max-width: 100%; height: auto; margin: 16px 0; }
        .article-content p { margin-bottom: 16px; }
        .article-images { margin-top: 24px; }
        .article-images h4 { margin-bottom: 12px; }
        .article-images img { width: 100%; border-radius: 4px; cursor: pointer; }
        .article-tags { margin-top: 20px; }
        .article-tags .ant-tag { margin: 4px; }
        .article-nav { display: flex; justify-content: space-between; align-items: center; }
        .article-nav a, .article-nav .no-article { display: flex; align-items: center; gap: 8px; color: #666; }
        .article-nav .title { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .prev-article { flex: 1; }
        .next-article { flex: 1; justify-content: flex-end; }
        .comments-card { margin-top: 20px; }
        .comment-item { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid #eee; }
        .comment-body { flex: 1; }
        .comment-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .user-name { font-weight: 500; }
        .comment-time { color: #999; font-size: 12px; display: flex; align-items: center; gap: 4px; }
        .comment-content { color: #333; line-height: 1.6; }
        .comment-actions { margin-top: 8px; }
        .sidebar-card { margin-bottom: 20px; }
        .related-list .related-item { padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 12px; }
        .related-list .num { width: 20px; height: 20px; background: #1890ff; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .related-list .title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }
        .hot-list .hot-item { padding: 10px 0; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 12px; }
        .hot-list .rank { width: 20px; height: 20px; background: #ddd; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }
        .hot-list .rank.top { background: #ff4d4f; }
        .hot-list .title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }
        .hot-list .views { color: #999; font-size: 12px; display: flex; align-items: center; gap: 4px; }
        .tags-cloud { display: flex; flex-wrap: wrap; gap: 8px; }
        .tags-cloud .ant-tag { cursor: pointer; }
        .tags-cloud .ant-tag:hover { background: #1890ff; color: #fff; }
        .article-footer { background: #001529; color: #fff; padding: 20px; margin-top: 40px; text-align: center; }
        .article-detail-loading, .article-detail-not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; }
        @media print { .article-header, .breadcrumb-bar, .sidebar-card, .comments-card, .article-footer { display: none; } }
      `}</style>
    </div>
  );
}