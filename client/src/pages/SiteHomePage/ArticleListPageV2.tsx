import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Row, Col, Card, List, Tag, Pagination, Spin, Empty, Input, Select, Breadcrumb, Button } from 'antd';
import { Search, Calendar, Eye, MessageSquare, ArrowRight, FileText } from 'lucide-react';

const { Search: AntSearch } = Input;

interface Article {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  image_url?: string;
  author?: string;
  view_count: number;
  comment_count: number;
  is_top: number;
  is_hot: number;
  is_recommend: number;
  tags_list?: string[];
  channel_name?: string;
  channel_id?: string;
  publish_time?: string;
  created_at: string;
}

interface Channel {
  id: string;
  name: string;
  code?: string;
  children?: Channel[];
}

export default function ArticleListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [tagCloud, setTagCloud] = useState<{ name: string; count: number }[]>([]);

  const keyword = searchParams.get('keyword') || '';
  const channelId = searchParams.get('channel') || '';
  const tag = searchParams.get('tag') || '';

  useEffect(() => {
    loadChannels();
    fetch('/api/cms-tags').then(r => r.json()).then((d: any[]) => setTagCloud(Array.isArray(d) ? d : [])).catch(() => setTagCloud([]));
  }, []);

  useEffect(() => {
    loadArticles();
  }, [page, keyword, channelId, tag]);

  const loadChannels = async () => {
    try {
      const res = await fetch('/api/cms-channels?is_show=true');
      const data = await res.json();
      setChannels(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('加载栏目失败', e);
    }
  };

  const loadArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      params.set('status', 'published');
      if (keyword) params.set('keyword', keyword);
      if (channelId) params.set('channel_id', channelId);
      if (tag) params.set('tag', tag);

      const res = await fetch(`/api/cms-articles?${params.toString()}`);
      const data = await res.json();
      if (data.list) {
        setArticles(data.list);
        setTotal(data.total);
      } else {
        setArticles(Array.isArray(data) ? data : []);
        setTotal(Array.isArray(data) ? data.length : 0);
      }
    } catch (e) {
      console.error('加载文章失败', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set('keyword', value);
    if (channelId) params.set('channel', channelId);
    setSearchParams(params);
    setPage(1);
  };

  const handleChannelChange = (id: string) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (id) params.set('channel', id);
    setSearchParams(params);
    setPage(1);
  };

  return (
    <div className="article-list-page">
      {/* 顶部导航 */}
      <header className="article-header">
        <div className="header-content">
          <Link to="/site" className="logo">
            <FileText size={28} />
            <span>飞达资讯</span>
          </Link>
          <nav className="nav-menu">
            <Link to="/site" className={!channelId ? 'active' : ''}>首页</Link>
            {channels.map(channel => (
              <Link
                key={channel.id}
                to={`/site/articles?channel=${channel.id}`}
                className={channelId === channel.id ? 'active' : ''}
              >
                {channel.name}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <AntSearch
              placeholder="搜索文章"
              onSearch={handleSearch}
              style={{ width: 200 }}
              allowClear
            />
          </div>
        </div>
      </header>

      {/* 面包屑 */}
      <div className="breadcrumb-bar">
        <div className="breadcrumb-content">
          <Breadcrumb
            items={[
              { title: <Link to="/site">首页</Link> },
              channelId && channels.find(c => c.id === channelId) ? { title: channels.find(c => c.id === channelId)?.name } : null,
              keyword ? { title: `搜索: ${keyword}` } : null,
              tag ? { title: `标签: ${tag}` } : null
            ].filter(Boolean)}
          />
        </div>
      </div>

      {/* 主内容 */}
      <main className="article-main">
        <Row gutter={[24, 24]}>
          {/* 侧边栏 */}
          <Col xs={24} md={6}>
            <Card title="文章分类" className="sidebar-card">
              <div className="channel-list">
                <div
                  className={`channel-item ${!channelId ? 'active' : ''}`}
                  onClick={() => handleChannelChange('')}
                >
                  全部文章
                </div>
                {channels.map(channel => (
                  <div
                    key={channel.id}
                    className={`channel-item ${channelId === channel.id ? 'active' : ''}`}
                    onClick={() => handleChannelChange(channel.id)}
                  >
                    {channel.name}
                    {channel.children?.length > 0 && <ArrowRight size={14} />}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="热门标签" className="sidebar-card tags-card">
              <div className="tags-list">
                {tagCloud.length === 0 ? <span style={{ color: '#999', fontSize: 13 }}>暂无标签</span> :
                  tagCloud.slice(0, 30).map((t: any) => (
                    <Tag
                      key={t.name}
                      color={tag === t.name ? 'blue' : 'default'}
                      style={{ cursor: 'pointer', marginBottom: 6 }}
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (keyword) params.set('keyword', keyword);
                        if (channelId) params.set('channel', channelId);
                        params.set('tag', tag === t.name ? '' : t.name);
                        setSearchParams(params);
                        setPage(1);
                      }}
                    >
                      {t.name} ({t.count})
                    </Tag>
                  ))}
              </div>
            </Card>
          </Col>

          {/* 文章列表 */}
          <Col xs={24} md={18}>
            <div className="article-list">
              {loading ? (
                <div className="loading-center"><Spin size="large" /></div>
              ) : articles.length > 0 ? (
                <>
                  <Row gutter={[16, 16]}>
                    {articles.map(article => (
                      <Col xs={24} sm={12} key={article.id}>
                        <Card
                          hoverable
                          className={`article-card ${article.is_top ? 'top' : ''}`}
                          cover={
                            article.image_url && (
                              <div className="article-cover">
                                <img src={article.image_url} alt={article.title} />
                                {article.is_top === 1 && <Tag color="red" className="top-tag">置顶</Tag>}
                                {article.is_recommend === 1 && <Tag color="gold" className="rec-tag">推荐</Tag>}
                              </div>
                            )
                          }
                        >
                          <Card.Meta
                            title={
                              <Link to={`/site/article/${article.id}`} className="article-title">
                                {article.is_top === 1 && <span className="top-badge">置顶</span>}
                                {article.title}
                              </Link>
                            }
                            description={
                              <div className="article-info">
                                {article.channel_name && (
                                  <Tag color="blue">{article.channel_name}</Tag>
                                )}
                                <span className="author">{article.author || 'admin'}</span>
                                <span className="date">
                                  <Calendar size={12} />
                                  {new Date(article.publish_time || article.created_at).toLocaleDateString()}
                                </span>
                                <span className="views">
                                  <Eye size={12} />
                                  {article.view_count || 0}
                                </span>
                                <span className="comments">
                                  <MessageSquare size={12} />
                                  {article.comment_count || 0}
                                </span>
                              </div>
                            }
                          />
                          {article.summary && (
                            <p className="article-summary">{article.summary}</p>
                          )}
                          <div className="article-tags">
                            {(article.tags_list || []).slice(0, 3).map(t => (
                              <Tag key={t} size="small">{t}</Tag>
                            ))}
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                  <div className="pagination-wrapper">
                    <Pagination
                      current={page}
                      pageSize={pageSize}
                      total={total}
                      onChange={(p) => setPage(p)}
                      showSizeChanger={false}
                      showTotal={(t) => `共 ${t} 篇文章`}
                    />
                  </div>
                </>
              ) : (
                <Empty description="暂无文章" />
              )}
            </div>
          </Col>
        </Row>
      </main>

      {/* 页脚 */}
      <footer className="article-footer">
        <div className="footer-content">
          <div className="footer-links">
            <Link to="/site">网站首页</Link>
            <Link to="/shop">商城首页</Link>
            <Link to="/site/articles">资讯中心</Link>
            <Link to="/site/contact">联系我们</Link>
          </div>
          <p>© 2024 飞达信息管理系统</p>
        </div>
      </footer>

      <style>{`
        .article-list-page { background: #f5f5f5; min-height: 100vh; }
        .article-header { background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); position: sticky; top: 0; z-index: 100; }
        .header-content { max-width: 1200px; margin: 0 auto; padding: 16px 20px; display: flex; align-items: center; gap: 32px; }
        .logo { display: flex; align-items: center; gap: 8px; font-size: 22px; font-weight: bold; color: #1890ff; }
        .nav-menu { display: flex; gap: 24px; flex: 1; }
        .nav-menu a { color: #333; padding: 8px 0; border-bottom: 2px solid transparent; }
        .nav-menu a:hover, .nav-menu a.active { color: #1890ff; border-bottom-color: #1890ff; }
        .header-actions { }
        .breadcrumb-bar { background: #fff; border-bottom: 1px solid #eee; }
        .breadcrumb-content { max-width: 1200px; margin: 0 auto; padding: 12px 20px; }
        .article-main { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
        .sidebar-card { margin-bottom: 20px; }
        .channel-list { }
        .channel-item { padding: 10px 12px; cursor: pointer; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
        .channel-item:hover { background: #f0f0f0; }
        .channel-item.active { background: #e6f7ff; color: #1890ff; }
        .tags-list { display: flex; flex-wrap: wrap; gap: 8px; }
        .tags-list .ant-tag { cursor: pointer; }
        .article-card { height: 100%; }
        .article-card.top { border-color: #ff4d4f; }
        .article-cover { position: relative; height: 180px; overflow: hidden; }
        .article-cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .article-card:hover .article-cover img { transform: scale(1.05); }
        .top-tag { position: absolute; top: 8px; left: 8px; }
        .rec-tag { position: absolute; top: 8px; right: 8px; }
        .article-title { font-size: 16px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .top-badge { background: #ff4d4f; color: #fff; padding: 2px 6px; border-radius: 2px; font-size: 12px; margin-right: 8px; }
        .article-info { display: flex; align-items: center; gap: 12px; font-size: 12px; color: #999; flex-wrap: wrap; }
        .article-info span { display: flex; align-items: center; gap: 4px; }
        .article-summary { color: #666; font-size: 14px; margin-top: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .article-tags { margin-top: 8px; }
        .pagination-wrapper { display: flex; justify-content: center; margin-top: 32px; }
        .article-footer { background: #001529; color: #fff; padding: 40px 20px; margin-top: 40px; }
        .footer-content { max-width: 1200px; margin: 0 auto; text-align: center; }
        .footer-links { display: flex; justify-content: center; gap: 32px; margin-bottom: 20px; }
        .footer-links a { color: #fff; }
        .loading-center { display: flex; justify-content: center; padding: 50px; }
      `}</style>
    </div>
  );
}