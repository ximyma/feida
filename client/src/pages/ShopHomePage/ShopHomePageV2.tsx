import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Row, Col, Card, Carousel, Input, Select, Tag, Spin, Empty, Pagination, Drawer, Badge, Rate, Dropdown, Menu, message, Button } from 'antd';
import { ShoppingCart, Heart, Search, Filter, Menu as MenuIcon, User, ChevronRight, Star, Flame, Package, Clock, Truck, Tag as TagIcon } from 'lucide-react';
import { useShop } from './ShopContext';
import LoginModal from './LoginModal';

interface Goods {
  id: string;
  name: string;
  category_id: string;
  brand_id: string;
  price: number;
  original_price?: number;
  stock: number;
  sales_count: number;
  view_count: number;
  favorite_count: number;
  main_image?: string;
  images?: string[];
  description?: string;
  is_hot?: number;
  is_new?: number;
  is_recommend?: number;
  is_promotion?: number;
  promotion_price?: number;
  promotion_start?: string;
  promotion_end?: string;
}

export default function ShopHomePageV2() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { cartCount, categories, brands, isFavorite, addFavorite, removeFavorite } = useShop();

  const [loginOpen, setLoginOpen] = useState(false);
  const [shopUser, setShopUser] = useState<any>(null);
  const [goods, setGoods] = useState<Goods[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [brandId, setBrandId] = useState(searchParams.get('brand') || '');
  const [sortField, setSortField] = useState(searchParams.get('sort') || 'sort_order');
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const [banners, setBanners] = useState<any[]>([]);
  const [hotGoods, setHotGoods] = useState<Goods[]>([]);
  const [newGoods, setNewGoods] = useState<Goods[]>([]);
  const [recommendGoods, setRecommendGoods] = useState<Goods[]>([]);
  const [decorationBlocks, setDecorationBlocks] = useState<any[]>([]);

  useEffect(() => {
    // 加载Banner
    fetch('/api/web-banners').then(r => r.json()).then(data => {
      setBanners(Array.isArray(data) ? data.sort((a, b) => a.sort_order - b.sort_order) : []);
    }).catch(() => {});

    // 加载热门商品
    fetch('/api/shop-goods?is_hot=1&pageSize=8').then(r => r.json()).then(data => {
      setHotGoods(Array.isArray(data?.list) ? data.list : Array.isArray(data) ? data : []);
    }).catch(() => {});

    // 加载新品
    fetch('/api/shop-goods?is_new=1&pageSize=8').then(r => r.json()).then(data => {
      setNewGoods(Array.isArray(data?.list) ? data.list : Array.isArray(data) ? data : []);
    }).catch(() => {});

    // 加载推荐商品
    fetch('/api/shop-goods?is_recommend=1&pageSize=8').then(r => r.json()).then(data => {
      setRecommendGoods(Array.isArray(data?.list) ? data.list : Array.isArray(data) ? data : []);
    }).catch(() => {});

    // 加载DIY装修区块 (shop_page_design?page_key=home)
    fetch('/api/shop-page-design?page_key=home').then(r => r.json()).then(async (list) => {
      if (!Array.isArray(list) || list.length === 0) return;
      const page = list.find((p: any) => p.status !== 0) || list[0];
      let blocks: any[] = [];
      try { blocks = typeof page.blocks === 'string' ? JSON.parse(page.blocks) : (page.blocks || []); } catch { blocks = []; }
      const resolved = await Promise.all(blocks.map(async (b: any) => {
        if (b.type === 'goods' && Array.isArray(b.goods_ids)) {
          const items = await Promise.all(b.goods_ids.map((gid: string) =>
            fetch(`/api/shop-goods/${gid}`).then(r => r.ok ? r.json() : null).catch(() => null)
          ));
          b.goods = items.filter(Boolean);
        }
        return b;
      }));
      setDecorationBlocks(resolved);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadGoods();
  }, [page, pageSize, keyword, categoryId, brandId, sortField, sortOrder]);

  const loadGoods = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('keyword', keyword);
      if (categoryId) params.set('category', categoryId);
      if (brandId) params.set('brand', brandId);
      params.set('sort', sortField);
      params.set('order', sortOrder);
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));

      const res = await fetch(`/api/shop-goods?${params.toString()}`);
      const data = await res.json();
      if (data.list) {
        setGoods(data.list);
        setTotal(data.total || data.list.length);
      } else {
        setGoods(Array.isArray(data) ? data : []);
        setTotal(Array.isArray(data) ? data.length : 0);
      }
    } catch (e) {
      message.error('加载商品失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (categoryId) params.set('category', categoryId);
    if (brandId) params.set('brand', brandId);
    setSearchParams(params);
    loadGoods();
  };

  const handleFavorite = (goodsId: string) => {
    if (isFavorite(goodsId)) {
      removeFavorite(goodsId);
      message.success('已取消收藏');
    } else {
      addFavorite(goodsId);
      message.success('已添加收藏');
    }
  };

  const addToCart = (goods: Goods) => {
    const cart = JSON.parse(localStorage.getItem('shop_cart') || '{}');
    cart[goods.id] = (cart[goods.id] || 0) + 1;
    localStorage.setItem('shop_cart', JSON.stringify(cart));
    message.success('已加入购物车');
    // 更新购物车数量
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const renderGoodsCard = (item: Goods) => (
    <Col xs={12} sm={8} md={6} lg={4} xl={3} key={item.id}>
      <Card
        hoverable
        className="goods-card"
        cover={
          <div className="goods-image-wrapper">
            {item.is_promotion && (
              <Tag color="red" className="promotion-tag">促销</Tag>
            )}
            {item.is_new && (
              <Tag color="blue" className="new-tag">新品</Tag>
            )}
            <img
              src={item.main_image || '/placeholder.png'}
              alt={item.name}
              className="goods-image"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=商品'; }}
            />
            <div className="goods-actions">
              <Button
                type="text"
                icon={<Heart size={16} fill={isFavorite(item.id) ? '#f5222d' : 'none'} color={isFavorite(item.id) ? '#f5222d' : '#fff'} />}
                onClick={() => handleFavorite(item.id)}
                className="action-btn"
              />
              <Button
                type="text"
                icon={<ShoppingCart size={16} color="#fff" />}
                onClick={() => addToCart(item)}
                className="action-btn"
                disabled={item.stock <= 0}
              />
            </div>
          </div>
        }
      >
        <Card.Meta
          title={<Link to={`/shop/goods/${item.id}`} className="goods-title">{item.name}</Link>}
          description={
            <div className="goods-info">
              <div className="price-row">
                <span className="price">¥{item.is_promotion && item.promotion_price ? item.promotion_price : item.price}</span>
                {item.original_price && item.original_price > item.price && (
                  <span className="original-price">¥{item.original_price}</span>
                )}
              </div>
              <div className="stats-row">
                <span><Star size={12} /> {item.sales_count || 0}已售</span>
                <span><Heart size={12} /> {item.favorite_count || 0}</span>
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  );

  const categoryMenu = (
    <Menu>
      <Menu.Item key="all" onClick={() => setCategoryId('')}>
        全部分类
      </Menu.Item>
      {categories.map(cat => (
        <Menu.Item key={cat.id} onClick={() => setCategoryId(cat.id)}>
          {cat.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  const brandMenu = (
    <Menu>
      <Menu.Item key="all" onClick={() => setBrandId('')}>
        全部品牌
      </Menu.Item>
      {brands.map(b => (
        <Menu.Item key={b.id} onClick={() => setBrandId(b.id)}>
          {b.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className="shop-home">
      {/* 顶部导航 */}
      <header className="shop-header">
        <div className="header-top">
          <div className="welcome">欢迎来到飞达商城！</div>
          <div className="user-links">
            {shopUser ? (
              <span style={{cursor:'default'}}><User size={16} /> {shopUser.name}</span>
            ) : (
              <span onClick={() => setLoginOpen(true)} style={{cursor:'pointer'}}><User size={16} /> 登录/注册</span>
            )}
            <Link to="/shop/favorites"><Heart size={16} /> 我的收藏</Link>
            <Link to="/shop/orders"><Clock size={16} /> 我的订单</Link>
          </div>
        </div>
        <div className="header-main">
          <Link to="/shop" className="logo">
            <Package size={32} />
            <span>飞达商城</span>
          </Link>
          <div className="search-bar">
            <Dropdown overlay={categoryMenu} trigger={['hover']}>
              <Button className="category-btn">
                <MenuIcon size={16} /> 全部分类 <ChevronRight size={14} />
              </Button>
            </Dropdown>
            <Input
              placeholder="搜索商品"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              className="search-input"
            />
            <Button type="primary" icon={<Search size={16} />} onClick={handleSearch}>搜索</Button>
          </div>
          <div className="header-right">
            <Link to="/shop/cart" className="cart-link">
              <Badge count={cartCount} size="small">
                <ShoppingCart size={24} />
              </Badge>
              <span>购物车</span>
            </Link>
          </div>
        </div>
        {/* 筛选排序栏 */}
        <div style={{background:'#fff',borderTop:'1px solid #f0f0f0',padding:'6px 0'}}>
          <div className="nav-container" style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
            {['综合','销量','价格↑','价格↓','新品'].map((label,i) => {
              const vals = ['sort_order','sales_count','price','price','created_at'];
              const dirs = ['desc','desc','asc','desc','desc'];
              const active = sortField===vals[i] && sortOrder===dirs[i];
              return <Button key={label} size="small" type={active?'primary':'default'} style={{borderRadius:14}}
                onClick={()=>{setSortField(vals[i]);setSortOrder(dirs[i]);setPage(1);}}>{label}</Button>;
            })}
            <span style={{color:'#999',marginLeft:8}}>|</span>
            <Select size="small" style={{width:100}} placeholder="品牌" allowClear value={brandId||undefined}
              onChange={(v)=>{setBrandId(v||'');setPage(1);}}
              options={(brands||[]).map((b:any)=>({label:b.name,value:b.id}))} />
            <Select size="small" style={{width:100}} placeholder="分类" allowClear value={categoryId||undefined}
              onChange={(v)=>{setCategoryId(v||'');setPage(1);}}
              options={(categories||[]).map((c:any)=>({label:c.name,value:c.id}))} />
            {(keyword||brandId||categoryId) && <Button size="small" type="link" onClick={()=>{setKeyword('');setBrandId('');setCategoryId('');setPage(1);}}>清除筛选</Button>}
            <span style={{marginLeft:'auto',color:'#999',fontSize:12}}>共{total}件商品</span>
          </div>
        </div>
        {/* 分类导航 */}
        <nav className="category-nav">
          <div className="nav-container">
            {categories.slice(0, 10).map(cat => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className={`nav-item ${categoryId === cat.id ? 'active' : ''}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Banner轮播 */}
      {banners.length > 0 && (
        <Carousel autoplay className="banner-carousel">
          {banners.map(banner => (
            <div key={banner.id}>
              <a href={banner.link_url || '/shop'} target="_blank" rel="noopener noreferrer">
                <img src={banner.image_url} alt={banner.title} className="banner-image" />
              </a>
            </div>
          ))}
        </Carousel>
      )}

      {/* 主内容区 */}
      <main className="shop-main">

        {/* DIY可视化装修区块 */}
        {decorationBlocks.length > 0 && decorationBlocks.map(block => (
          <section className="goods-section" key={block.id}>
            {block.title && (
              <div className="section-header"><h2>{block.title}</h2></div>
            )}
            {block.type === 'banner' && (
              <div className="decoration-banner">
                {block.url
                  ? <a href={block.url} target="_blank" rel="noopener noreferrer"><img src={block.image} alt={block.title} style={{ width: '100%', borderRadius: 8, display: 'block' }} /></a>
                  : <img src={block.image} alt={block.title} style={{ width: '100%', borderRadius: 8, display: 'block' }} />}
              </div>
            )}
            {block.type === 'text' && (
              <div className="decoration-text" dangerouslySetInnerHTML={{ __html: block.content || '' }} style={{ background: '#fff', padding: 16, borderRadius: 8 }} />
            )}
            {block.type === 'goods' && (
              <Row gutter={[16, 16]}>
                {(block.goods || []).map((g: any) => renderGoodsCard(g))}
              </Row>
            )}
          </section>
        ))}

        {/* 热门商品 */}
        {hotGoods.length > 0 && (
          <section className="goods-section">
            <div className="section-header">
              <h2><Flame size={20} color="#f5222d" /> 热销商品</h2>
              <Link to="/shop?is_hot=1">查看更多 <ChevronRight size={14} /></Link>
            </div>
            <Row gutter={[16, 16]}>
              {hotGoods.map(renderGoodsCard)}
            </Row>
          </section>
        )}

        {/* 新品推荐 */}
        {newGoods.length > 0 && (
          <section className="goods-section">
            <div className="section-header">
              <h2><TagIcon size={20} color="#1890ff" /> 新品上架</h2>
              <Link to="/shop?is_new=1">查看更多 <ChevronRight size={14} /></Link>
            </div>
            <Row gutter={[16, 16]}>
              {newGoods.map(renderGoodsCard)}
            </Row>
          </section>
        )}

        {/* 精选推荐 */}
        {recommendGoods.length > 0 && (
          <section className="goods-section">
            <div className="section-header">
              <h2><Star size={20} color="#faad14" /> 精选推荐</h2>
              <Link to="/shop?is_recommend=1">查看更多 <ChevronRight size={14} /></Link>
            </div>
            <Row gutter={[16, 16]}>
              {recommendGoods.map(renderGoodsCard)}
            </Row>
          </section>
        )}

        {/* 全部商品 */}
        <section className="goods-section all-goods">
          <div className="section-header">
            <h2>全部商品</h2>
            <div className="filter-bar">
              <Dropdown overlay={categoryMenu} trigger={['hover']}>
                <Button type="text">
                  {categoryId ? categories.find(c => c.id === categoryId)?.name || '分类' : '全部分类'} <ChevronRight size={14} />
                </Button>
              </Dropdown>
              <Dropdown overlay={brandMenu} trigger={['hover']}>
                <Button type="text">
                  {brandId ? brands.find(b => b.id === brandId)?.name || '品牌' : '全部品牌'} <ChevronRight size={14} />
                </Button>
              </Dropdown>
              <Select
                value={sortField}
                onChange={(v) => { setSortField(v); setPage(1); }}
                style={{ width: 120 }}
                options={[
                  { value: 'sort_order', label: '默认排序' },
                  { value: 'sales_count', label: '销量优先' },
                  { value: 'price', label: '价格排序' },
                  { value: 'view_count', label: '浏览量' },
                  { value: 'created_at', label: '最新上架' },
                ]}
              />
              <Button
                type="text"
                icon={<Filter size={16} />}
                onClick={() => setFilterDrawerOpen(true)}
              >
                筛选
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="loading-center"><Spin size="large" /></div>
          ) : goods.length > 0 ? (
            <>
              <Row gutter={[16, 16]}>
                {goods.map(renderGoodsCard)}
              </Row>
              <div className="pagination-wrapper">
                <Pagination
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  onChange={(p, ps) => { setPage(p); setPageSize(ps); }}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(t) => `共 ${t} 件商品`}
                />
              </div>
            </>
          ) : (
            <Empty description="暂无商品" />
          )}
        </section>
      </main>

      {/* 筛选抽屉 */}
      <Drawer
        title="筛选条件"
        placement="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        width={300}
      >
        <div className="filter-drawer">
          <div className="filter-group">
            <h4>价格区间</h4>
            <div className="price-range">
              <Input placeholder="最低价" style={{ width: 100 }} />
              <span>-</span>
              <Input placeholder="最高价" style={{ width: 100 }} />
            </div>
          </div>
          <div className="filter-group">
            <h4>商品分类</h4>
            <div className="filter-options">
              {categories.map(cat => (
                <Tag
                  key={cat.id}
                  color={categoryId === cat.id ? 'blue' : 'default'}
                  onClick={() => setCategoryId(cat.id)}
                >
                  {cat.name}
                </Tag>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h4>商品品牌</h4>
            <div className="filter-options">
              {brands.map(b => (
                <Tag
                  key={b.id}
                  color={brandId === b.id ? 'blue' : 'default'}
                  onClick={() => setBrandId(b.id)}
                >
                  {b.name}
                </Tag>
              ))}
            </div>
          </div>
          <div className="filter-actions">
            <Button onClick={() => { setCategoryId(''); setBrandId(''); }}>重置</Button>
            <Button type="primary" onClick={() => { setFilterDrawerOpen(false); loadGoods(); }}>确定</Button>
          </div>
        </div>
      </Drawer>

      {/* 页脚 */}
      <footer className="shop-footer">
        <div className="footer-links">
          <Link to="/site">网站首页</Link>
          <Link to="/shop">商城首页</Link>
          <Link to="/shop/user">用户中心</Link>
          <Link to="/shop/orders">我的订单</Link>
        </div>
        <div className="footer-info">
          <p>© 2024 飞达信息管理系统 - 网上商城</p>
          <p><Truck size={14} /> 全国包邮 | <Clock size={14} /> 7天无理由退换 | <Star size={14} /> 正品保障</p>
        </div>
      </footer>

      <style>{`
        .shop-home { background: #f5f5f5; min-height: 100vh; }
        .shop-header { background: #fff; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header-top { display: flex; justify-content: space-between; padding: 8px 20px; background: #f0f0f0; font-size: 12px; }
        .user-links { display: flex; gap: 16px; }
        .user-links a { color: #666; display: flex; align-items: center; gap: 4px; }
        .header-main { display: flex; align-items: center; padding: 16px 20px; gap: 20px; }
        .logo { display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: bold; color: #1890ff; }
        .search-bar { display: flex; flex: 1; max-width: 600px; gap: 8px; }
        .category-btn { border-radius: 4px 0 0 4px; }
        .search-input { flex: 1; border-radius: 0; }
        .header-right { display: flex; gap: 20px; }
        .cart-link { display: flex; align-items: center; gap: 8px; color: #333; }
        .category-nav { background: #1890ff; padding: 0 20px; }
        .nav-container { display: flex; gap: 24px; }
        .nav-item { color: #fff; padding: 12px 0; font-size: 14px; }
        .nav-item:hover, .nav-item.active { color: #fff; border-bottom: 2px solid #fff; }
        .banner-carousel .banner-image { width: 100%; height: 400px; object-fit: cover; }
        .shop-main { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .goods-section { margin-bottom: 32px; background: #fff; padding: 20px; border-radius: 8px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .section-header h2 { margin: 0; display: flex; align-items: center; gap: 8px; }
        .section-header a { color: #1890ff; display: flex; align-items: center; gap: 4px; }
        .filter-bar { display: flex; gap: 8px; align-items: center; }
        .goods-card { height: 100%; }
        .goods-image-wrapper { position: relative; height: 200px; background: #f5f5f5; overflow: hidden; }
        .goods-image { width: 100%; height: 100%; object-fit: contain; transition: transform 0.3s; }
        .goods-card:hover .goods-image { transform: scale(1.05); }
        .promotion-tag, .new-tag { position: absolute; top: 8px; left: 8px; z-index: 1; }
        .goods-actions { position: absolute; bottom: 8px; right: 8px; display: flex; gap: 8px; opacity: 0; transition: opacity 0.3s; }
        .goods-card:hover .goods-actions { opacity: 1; }
        .action-btn { background: rgba(0,0,0,0.5); color: #fff; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; }
        .goods-title { font-size: 14px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .goods-info { }
        .price-row { display: flex; align-items: baseline; gap: 8px; }
        .price { color: #f5222d; font-size: 18px; font-weight: bold; }
        .original-price { color: #999; font-size: 12px; text-decoration: line-through; }
        .stats-row { display: flex; gap: 16px; color: #999; font-size: 12px; margin-top: 4px; }
        .stats-row span { display: flex; align-items: center; gap: 4px; }
        .loading-center { display: flex; justify-content: center; padding: 50px; }
        .pagination-wrapper { display: flex; justify-content: center; margin-top: 24px; }
        .filter-drawer { }
        .filter-group { margin-bottom: 24px; }
        .filter-group h4 { margin-bottom: 12px; }
        .price-range { display: flex; align-items: center; gap: 8px; }
        .filter-options { display: flex; flex-wrap: wrap; gap: 8px; }
        .filter-options .ant-tag { cursor: pointer; }
        .filter-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 24px; }
        .shop-footer { background: #001529; color: #fff; padding: 40px 20px; margin-top: 40px; }
        .footer-links { display: flex; justify-content: center; gap: 32px; margin-bottom: 20px; }
        .footer-links a { color: #fff; }
        .footer-info { text-align: center; color: #999; }
        .footer-info p { margin: 8px 0; display: flex; align-items: center; justify-content: center; gap: 16px; }
      `}</style>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={(u) => setShopUser(u)} />
    </div>
  );
}