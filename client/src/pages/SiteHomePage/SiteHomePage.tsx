import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Carousel, Spin, Tag } from 'antd';
import { ArrowRight, Clock, Eye, ShoppingCart } from 'lucide-react';

interface Banner { id: string; title: string; image_url: string; link_url: string; sort_order: number; }
interface Article { id: string; title: string; summary?: string; image_url?: string; channel_name?: string; channel_id?: string; author?: string; view_count: number; publish_time?: string; is_top?: number; tags_list?: string[]; }
interface Channel { id: string; name: string; code?: string; }
interface Good { id: string; name: string; price: number; original_price?: number; images?: string; main_image?: string; }

export default function SiteHomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [articlesByChannel, setArticlesByChannel] = useState<Record<string, Article[]>>({});
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [products, setProducts] = useState<Good[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/web-banners').then(r => r.json()),
      fetch('/api/cms-channels?is_show=true').then(r => r.json()),
      fetch('/api/cms-articles?status=published&pageSize=50').then(r => r.json()),
      fetch('/api/shop-goods?limit=8').then(r => r.json()),
    ]).then(([bd, cd, ad, pd]) => {
      const bannerData: Banner[] = Array.isArray(bd) ? bd.sort((a: Banner, b: Banner) => a.sort_order - b.sort_order) : [];
      setBanners(bannerData);

      const channelData: Channel[] = Array.isArray(cd) ? cd : [];
      setChannels(channelData);

      const articleList: Article[] = ad?.list || (Array.isArray(ad) ? ad : []);
      setLatestArticles(articleList.slice(0, 6));

      // 按栏目分组
      const grouped: Record<string, Article[]> = {};
      articleList.forEach((a: Article) => {
        if (a.channel_id) {
          if (!grouped[a.channel_id]) grouped[a.channel_id] = [];
          grouped[a.channel_id].push(a);
        }
      });
      setArticlesByChannel(grouped);

      const productList: Good[] = pd?.list || (Array.isArray(pd) ? pd : []);
      setProducts(productList.slice(0, 8));

    }).catch(err => console.error(err)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><Spin size="large" /></div>;

  const getImageUrl = (g: Good) => {
    if (g.main_image) return g.main_image;
    if (g.images) { try { const arr = JSON.parse(g.images); if (arr.length) return arr[0]; } catch {} }
    return null;
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 顶部导航 */}
      <div style={{ background: '#001529', color: '#fff', padding: '0 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <div style={{ fontSize: 20, fontWeight: 'bold' }}>
            <Link to="/site" style={{ color: '#fff' }}>飞达信息</Link>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            <Link to="/site" style={{ color: '#1890ff', fontWeight: 'bold' }}>首页</Link>
            <Link to="/site/articles" style={{ color: '#fff' }}>文章</Link>
            <Link to="/shop" style={{ color: '#fff' }}>商城</Link>
          </div>
        </div>
      </div>

      {/* Banner 轮播 */}
      {banners.length > 0 && (
        <Carousel autoplay style={{ maxHeight: 400, overflow: 'hidden' }}>
          {banners.map(b => (
            <div key={b.id}>
              <a href={b.link_url || '/site'}>
                <img src={b.image_url} alt={b.title} style={{ width: '100%', height: 400, objectFit: 'cover' }} />
              </a>
            </div>
          ))}
        </Carousel>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>

        {/* 按栏目分组展示文章 */}
        {channels.length > 0 && channels.map(ch => {
          const chArticles = (articlesByChannel[ch.id] || []).slice(0, 4);
          if (chArticles.length === 0) return null;
          return (
            <div key={ch.id} style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 22 }}>{ch.name}</h2>
                <Link to={`/site/articles?channel=${ch.id}`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                  更多 <ArrowRight size={14} />
                </Link>
              </div>
              <Row gutter={[16, 16]}>
                {chArticles.map(a => (
                  <Col xs={24} sm={12} md={6} key={a.id}>
                    <Card hoverable size="small" style={{ height: '100%' }}>
                      <Link to={`/site/article/${a.id}`} style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.5, display: 'block', marginBottom: 8 }}>
                        {a.is_top === 1 && <Tag color="red" style={{ marginRight: 4, fontSize: 10 }}>置顶</Tag>}
                        {a.title}
                      </Link>
                      {a.summary && <p style={{ color: '#999', fontSize: 12, marginBottom: 8, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as any}>{a.summary}</p>}
                      <div style={{ color: '#bbb', fontSize: 11, display: 'flex', gap: 12 }}>
                        <span><Clock size={11} /> {a.publish_time ? new Date(a.publish_time).toLocaleDateString() : '-'}</span>
                        <span><Eye size={11} /> {a.view_count || 0}</span>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          );
        })}

        {/* 如果没有栏目分组数据，展示最新文章 */}
        {channels.length === 0 && latestArticles.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ marginBottom: 16 }}>最新文章</h2>
            <Row gutter={[16, 16]}>
              {latestArticles.map(a => (
                <Col xs={24} sm={12} md={8} key={a.id}>
                  <Card hoverable>
                    <Card.Meta
                      title={<Link to={`/site/article/${a.id}`}>{a.title}</Link>}
                      description={a.summary?.slice(0, 80) || ''}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* 商城商品推荐 */}
        {products.length > 0 && (
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 22 }}>
                <ShoppingCart size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                商城推荐
              </h2>
              <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 14 }}>
                去商城 <ArrowRight size={14} />
              </Link>
            </div>
            <Row gutter={[16, 16]}>
              {products.slice(0, 8).map(g => {
                const img = getImageUrl(g);
                return (
                  <Col xs={12} sm={8} md={6} key={g.id}>
                    <Link to={`/shop/goods/${g.id}`} style={{ textDecoration: 'none' }}>
                      <Card
                        hoverable size="small"
                        cover={img ? <img src={img} alt={g.name} style={{ height: 140, objectFit: 'cover' }} /> : <div style={{ height: 140, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>📦</div>}
                      >
                        <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</div>
                        <div>
                          <span style={{ color: '#ff4d4f', fontSize: 16, fontWeight: 'bold' }}>¥{g.price}</span>
                          {g.original_price && g.original_price > g.price && (
                            <span style={{ color: '#999', fontSize: 12, textDecoration: 'line-through', marginLeft: 8 }}>¥{g.original_price}</span>
                          )}
                        </div>
                      </Card>
                    </Link>
                  </Col>
                );
              })}
            </Row>
          </div>
        )}
      </div>

      {/* 页脚 */}
      <div style={{ background: '#001529', color: '#fff', padding: '40px 0', textAlign: 'center' }}>
        <p style={{ margin: 0 }}>© 2026 飞达智能科技 · 网站前台</p>
      </div>
    </div>
  );
}
