import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Carousel, Spin, Empty, Tag } from 'antd';
import { ArrowRight, Clock, Eye } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  sort_order: number;
}

interface Article {
  id: string;
  title: string;
  summary: string;
  category: string;
  author: string;
  view_count: number;
  publish_date: string;
}

export default function SiteHomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/web-banners').then(r => r.json()),
      fetch('/api/web-articles?status=published').then(r => r.json())
    ]).then(([bannerData, articleData]) => {
      setBanners(Array.isArray(bannerData) ? bannerData.sort((a, b) => a.sort_order - b.sort_order) : []);
      setArticles(Array.isArray(articleData) ? articleData : []);
    }).catch(err => console.error('获取数据失败:', err)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 顶部导航 */}
      <div style={{ background: '#001529', color: '#fff', padding: '0 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <div style={{ fontSize: 20, fontWeight: 'bold' }}>飞达信息</div>
          <div style={{ display: 'flex', gap: 32 }}>
            <Link to="/site" style={{ color: '#fff' }}>首页</Link>
            <Link to="/shop" style={{ color: '#fff' }}>商城</Link>
            <Link to="/site/articles" style={{ color: '#fff' }}>文章</Link>
          </div>
        </div>
      </div>

      {/* 轮播图 */}
      {banners.length > 0 ? (
        <Carousel autoplay style={{ maxHeight: 400, overflow: 'hidden' }}>
          {banners.map(banner => (
            <div key={banner.id}>
              <a href={banner.link_url || '/site'} target="_blank" rel="noopener noreferrer">
                <img src={banner.image_url} alt={banner.title} style={{ width: '100%', height: 400, objectFit: 'cover' }} />
              </a>
            </div>
          ))}
        </Carousel>
      ) : (
        <div style={{ height: 400, background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Empty description="暂无Banner" />
        </div>
      )}

      {/* 文章列表 */}
      <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0 }}>最新文章</h2>
          <Link to="/site/articles" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            查看更多 <ArrowRight size={16} />
          </Link>
        </div>

        {articles.length > 0 ? (
          <Row gutter={[24, 24]}>
            {articles.slice(0, 6).map(article => (
              <Col xs={24} sm={12} md={8} key={article.id}>
                <Card
                  hoverable
                  cover={
                    <div style={{ height: 160, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 48 }}>📄</span>
                    </div>
                  }
                >
                  <Card.Meta
                    title={<Link to={`/site/article/${article.id}`}>{article.title}</Link>}
                    description={
                      <div>
                        <p style={{ color: '#666', fontSize: 14 }}>{article.summary || '暂无摘要'}</p>
                        <div style={{ display: 'flex', gap: 16, color: '#999', fontSize: 12, marginTop: 8 }}>
                          <span><Clock size={12} style={{ marginRight: 4 }} />{article.publish_date?.slice(0, 10) || '-'}</span>
                          <span><Eye size={12} style={{ marginRight: 4 }} />{article.view_count || 0}</span>
                        </div>
                      </div>
                    }
                  />
                  {article.category && <Tag color="blue" style={{ marginTop: 8 }}>{article.category}</Tag>}
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无文章" />
        )}
      </div>

      {/* 页脚 */}
      <div style={{ background: '#001529', color: '#fff', padding: '40px 0', marginTop: 40, textAlign: 'center' }}>
        <p>© 2024 飞达信息管理系统 - 网站前台</p>
      </div>
    </div>
  );
}
