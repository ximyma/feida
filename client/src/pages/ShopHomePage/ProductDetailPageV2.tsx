import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Image, Button, InputNumber, message, Tabs, Rate, Spin, Breadcrumb, Tag, Card, Empty, Avatar, Divider } from 'antd';
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, Clock, Minus, Plus, ChevronRight, ArrowLeft } from 'lucide-react';
import { useShop } from './ShopContext';

interface Goods {
  id: string;
  name: string;
  category_id: string;
  category?: any;
  brand_id: string;
  brand?: any;
  sku?: string;
  price: number;
  original_price?: number;
  cost_price?: number;
  stock: number;
  sales_count: number;
  view_count: number;
  favorite_count: number;
  comment_count: number;
  avg_rating?: number;
  images: string[];
  main_image?: string;
  video_url?: string;
  description?: string;
  spec_data?: any;
  param_data?: any;
  skus?: SKU[];
  is_hot?: number;
  is_new?: number;
  is_recommend?: number;
  is_promotion?: number;
  promotion_price?: number;
  promotion_start?: string;
  promotion_end?: string;
  weight?: number;
  unit?: string;
}

interface SKU {
  id: string;
  goods_id: string;
  sku_code: string;
  barcode?: string;
  spec_values: any;
  price: number;
  original_price?: number;
  cost_price?: number;
  stock: number;
  sales_count: number;
  image_url?: string;
  weight: number;
  status: string;
}

interface Comment {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  content: string;
  images: string[];
  is_anonymous: number;
  reply_count: number;
  like_count: number;
  created_at: string;
  admin_reply?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, addFavorite, removeFavorite } = useShop();

  const [goods, setGoods] = useState<Goods | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [specImagesMap, setSpecImagesMap] = useState<Record<string, string>>({});
  const [selectedSku, setSelectedSku] = useState<SKU | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentTotal, setCommentTotal] = useState(0);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentTab, setCommentTab] = useState('all');

  useEffect(() => {
    if (id) {
      loadGoods();
      loadComments();
    }
  }, [id]);

  const loadGoods = async () => {
    try {
      const res = await fetch(`/api/shop-goods/${id}`);
      const data = await res.json();
      if (data.error) {
        message.error('商品不存在');
        navigate('/shop');
        return;
      }
      setGoods(data);
      const images = JSON.parse(data.images || '[]');
      setSelectedImage(data.main_image || images[0] || '');
      try { setSpecImagesMap(data.spec_images ? JSON.parse(data.spec_images) : {}); } catch { setSpecImagesMap({}); }
    } catch (e) {
      message.error('加载商品失败');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (type = 'all') => {
    if (!id) return;
    setCommentLoading(true);
    try {
      let url = `/api/shop-goods-comments?goods_id=${id}&pageSize=10`;
      if (type !== 'all') {
        url += `&rating=${type}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setComments(data.list || []);
      setCommentTotal(data.total || 0);
    } catch (e) {
      console.error('加载评论失败', e);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleFavorite = () => {
    if (!goods) return;
    if (isFavorite(goods.id)) {
      removeFavorite(goods.id);
      message.success('已取消收藏');
    } else {
      addFavorite(goods.id);
      message.success('已添加收藏');
    }
  };

  const addToCart = () => {
    if (!goods) return;
    if (goods.stock <= 0) {
      message.warning('商品库存不足');
      return;
    }
    const cart = JSON.parse(localStorage.getItem('shop_cart') || '{}');
    const key = selectedSku ? selectedSku.id : goods.id;
    cart[key] = (cart[key] || 0) + quantity;
    localStorage.setItem('shop_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    message.success('已加入购物车');
  };

  const buyNow = () => {
    if (!goods) return;
    if (goods.stock <= 0) {
      message.warning('商品库存不足');
      return;
    }
    // 保存到本地存储，立即购买
    const buyNowData = {
      goods_id: goods.id,
      sku_id: selectedSku?.id,
      quantity,
      goods: {
        ...goods,
        selected_image: selectedImage,
        selected_sku: selectedSku
      }
    };
    localStorage.setItem('buy_now', JSON.stringify(buyNowData));
    navigate('/shop/checkout');
  };

  const handleSpecSelect = (specName: string, value: string) => {
    const newSpecs = { ...selectedSpecs, [specName]: value };
    setSelectedSpecs(newSpecs);
    // 规格图片绑定：选中的规格值有绑定图片时切换主图
    const bound = Object.values(newSpecs).map(v => specImagesMap[v]).find(Boolean);
    if (bound) setSelectedImage(bound);
    // 查找匹配的SKU
    if (goods?.skus) {
      const matched = goods.skus.find(sku => {
        const skuSpecs = JSON.parse(sku.spec_values || '{}');
        return Object.entries(newSpecs).every(([k, v]) => skuSpecs[k] === v);
      });
      setSelectedSku(matched || null);
    }
  };

  const getSpecOptions = (specName: string) => {
    if (!goods?.skus) return [];
    const values = new Set<string>();
    goods.skus.forEach(sku => {
      const specs = JSON.parse(sku.spec_values || '{}');
      if (specs[specName]) values.add(specs[specName]);
    });
    return Array.from(values);
  };

  const isSpecSelected = (specName: string, value: string) => {
    return selectedSpecs[specName] === value;
  };

  const isSpecDisabled = (specName: string, value: string) => {
    if (!goods?.skus) return false;
    const testSpecs = { ...selectedSpecs, [specName]: value };
    return !goods.skus.some(sku => {
      const skuSpecs = JSON.parse(sku.spec_values || '{}');
      return Object.entries(testSpecs).every(([k, v]) => skuSpecs[k] === v);
    });
  };

  if (loading) {
    return (
      <div className="detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!goods) {
    return (
      <div className="detail-not-found">
        <Empty description="商品不存在" />
        <Button type="primary" onClick={() => navigate('/shop')}>返回商城</Button>
      </div>
    );
  }

  const images = JSON.parse(goods.images || '[]');
  const allImages = [goods.main_image, ...images].filter(Boolean);
  const displayPrice = selectedSku ? selectedSku.price : (goods.is_promotion && goods.promotion_price ? goods.promotion_price : goods.price);
  const displayOriginalPrice = selectedSku?.original_price || goods.original_price;
  const displayStock = selectedSku ? selectedSku.stock : goods.stock;

  const commentTabs = [
    { key: 'all', label: `全部 (${commentTotal})` },
    { key: '5', label: `5星` },
    { key: '4', label: `4星` },
    { key: '3', label: `3星` },
    { key: '2', label: `2星` },
    { key: '1', label: `1星` },
  ];

  return (
    <div className="product-detail">
      {/* 导航 */}
      <div className="detail-nav">
        <div className="nav-container">
          <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>返回</Button>
          <Breadcrumb
            items={[
              { title: <Link to="/shop">商城首页</Link> },
              goods.category ? { title: <Link to={`/shop?category=${goods.category_id}`}>{goods.category.name}</Link> } : null,
              { title: goods.name }
            ].filter(Boolean)}
          />
        </div>
      </div>

      <div className="detail-container">
        {/* 商品图片 */}
        <Row gutter={[24, 24]}>
          <Col xs={24} md={10}>
            <div className="image-section">
              <div className="main-image">
                <Image src={selectedImage || goods.main_image} alt={goods.name} />
                {goods.is_promotion && <Tag color="red" className="promo-tag">促销</Tag>}
                {goods.is_new && <Tag color="blue" className="new-tag">新品</Tag>}
                {goods.is_hot && <Tag color="orange" className="hot-tag">热销</Tag>}
              </div>
              <div className="thumbnail-list">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`${goods.name} ${idx + 1}`} />
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* 商品信息 */}
          <Col xs={24} md={14}>
            <div className="info-section">
              <h1 className="goods-name">{goods.name}</h1>

              <div className="goods-tags">
                {goods.brand && <Tag color="blue">{goods.brand.name}</Tag>}
                {goods.is_hot === 1 && <Tag color="red">热销</Tag>}
                {goods.is_new === 1 && <Tag color="cyan">新品</Tag>}
                {goods.is_recommend === 1 && <Tag color="gold">推荐</Tag>}
              </div>

              <div className="goods-desc">{goods.description}</div>

              {/* 价格 */}
              <Card className="price-card">
                <div className="price-row">
                  <span className="label">价 格</span>
                  <span className="price">¥{displayPrice.toFixed(2)}</span>
                  {displayOriginalPrice && displayOriginalPrice > displayPrice && (
                    <span className="original">¥{displayOriginalPrice.toFixed(2)}</span>
                  )}
                  {goods.is_promotion && (
                    <Tag color="red" className="discount-tag">
                      节省 ¥{(displayOriginalPrice - displayPrice).toFixed(2)}
                    </Tag>
                  )}
                </div>
                <div className="stats-row">
                  <span><Star size={14} /> 评分 {goods.avg_rating?.toFixed(1) || '5.0'}</span>
                  <span><ShoppingCart size={14} /> 销量 {goods.sales_count || 0}</span>
                  <span><Eye size={14} /> 浏览 {goods.view_count || 0}</span>
                </div>
              </Card>

              {/* SKU选择 */}
              {goods.spec_data && Object.keys(goods.spec_data).length > 0 && (
                <div className="spec-section">
                  {Object.entries(goods.spec_data).map(([specName, values]) => (
                    <div key={specName} className="spec-row">
                      <span className="spec-label">{specName}</span>
                      <div className="spec-options">
                        {(values as string[]).map(value => (
                          <Button
                            key={value}
                            type={isSpecSelected(specName, value) ? 'primary' : 'default'}
                            disabled={isSpecDisabled(specName, value)}
                            onClick={() => handleSpecSelect(specName, value)}
                            className={isSpecSelected(specName, value) ? 'selected' : ''}
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 数量 */}
              <div className="quantity-section">
                <span className="label">数 量</span>
                <div className="quantity-control">
                  <Button icon={<Minus size={14} />} onClick={() => setQuantity(Math.max(1, quantity - 1))} />
                  <InputNumber
                    min={1}
                    max={displayStock}
                    value={quantity}
                    onChange={v => setQuantity(v || 1)}
                  />
                  <Button icon={<Plus size={14} />} onClick={() => setQuantity(Math.min(displayStock, quantity + 1))} />
                </div>
                <span className="stock-info">库存 {displayStock} {goods.unit || '件'}</span>
              </div>

              {/* 操作按钮 */}
              <div className="action-buttons">
                <Button type="primary" size="large" icon={<ShoppingCart size={16} />} onClick={addToCart} disabled={displayStock <= 0}>
                  加入购物车
                </Button>
                <Button size="large" type="default" icon={<ShoppingCart size={16} />} onClick={buyNow} disabled={displayStock <= 0}>
                  立即购买
                </Button>
                <Button size="large" icon={<Heart size={16} />} onClick={handleFavorite}>
                  {isFavorite(goods.id) ? '已收藏' : '收藏'}
                </Button>
              </div>

              {/* 服务承诺 */}
              <div className="service-promises">
                <div className="promise-item"><Truck size={16} /> 全国包邮</div>
                <div className="promise-item"><Shield size={16} /> 品质保障</div>
                <div className="promise-item"><RotateCcw size={16} /> 7天无理由退换</div>
                <div className="promise-item"><Clock size={16} /> 48小时发货</div>
              </div>
            </div>
          </Col>
        </Row>

        {/* 商品详情和评论 */}
        <Tabs
          className="detail-tabs"
          items={[
            {
              key: 'detail',
              label: '商品详情',
              children: (
                <div className="goods-detail-content" dangerouslySetInnerHTML={{ __html: goods.description || '<p>暂无商品详情</p>' }} />
              )
            },
            {
              key: 'params',
              label: '规格参数',
              children: goods.param_data ? (
                <table className="params-table">
                  <tbody>
                    {Object.entries(goods.param_data).map(([key, value]) => (
                      <tr key={key}>
                        <td className="param-name">{key}</td>
                        <td>{value as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <Empty description="暂无规格参数" />
            },
            {
              key: 'extend',
              label: '扩展信息',
              children: (() => {
                let ex: { key: string; value: string }[] = [];
                try { ex = goods.extend_data ? JSON.parse(goods.extend_data) : []; } catch { ex = []; }
                if (!Array.isArray(ex) || ex.length === 0) return <Empty description="暂无扩展信息" />;
                return (
                  <table className="params-table">
                    <tbody>
                      {ex.filter(e => e.key).map((e, i) => (
                        <tr key={i}>
                          <td className="param-name">{e.key}</td>
                          <td>{e.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()
            },
            {
              key: 'comments',
              label: `商品评价 (${commentTotal})`,
              children: (
                <div className="comments-section">
                  <Tabs
                    activeKey={commentTab}
                    onChange={(key) => { setCommentTab(key); loadComments(key); }}
                    items={commentTabs}
                  />
                  {commentLoading ? (
                    <div className="loading-center"><Spin /></div>
                  ) : comments.length > 0 ? (
                    <div className="comment-list">
                      {comments.map(comment => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-header">
                            <Avatar src={comment.user_avatar} />
                            <span className="user-name">{comment.is_anonymous ? '匿名用户' : comment.user_name}</span>
                            <Rate disabled defaultValue={comment.rating} allowHalf />
                          </div>
                          <div className="comment-content">{comment.content}</div>
                          {comment.images?.length > 0 && (
                            <div className="comment-images">
                              {comment.images.map((img, idx) => (
                                <img key={idx} src={img} alt="" />
                              ))}
                            </div>
                          )}
                          <div className="comment-time">{new Date(comment.created_at).toLocaleString()}</div>
                          {comment.admin_reply && (
                            <div className="admin-reply">
                              <span>商家回复：</span>{comment.admin_reply}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Empty description="暂无评价" />
                  )}
                </div>
              )
            }
          ]}
        />
      </div>

      <style>{`
        .product-detail { background: #f5f5f5; min-height: 100vh; padding-bottom: 40px; }
        .detail-nav { background: #fff; padding: 12px 0; border-bottom: 1px solid #eee; }
        .nav-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; align-items: center; gap: 16px; }
        .detail-container { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
        .image-section { background: #fff; padding: 20px; border-radius: 8px; }
        .main-image { position: relative; width: 100%; aspect-ratio: 1; background: #f9f9f9; border-radius: 8px; overflow: hidden; margin-bottom: 16px; }
        .main-image .ant-image { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .main-image img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .promo-tag, .new-tag, .hot-tag { position: absolute; top: 12px; left: 12px; }
        .thumbnail-list { display: flex; gap: 8px; overflow-x: auto; }
        .thumbnail { width: 60px; height: 60px; border: 2px solid transparent; border-radius: 4px; cursor: pointer; overflow: hidden; }
        .thumbnail.active { border-color: #1890ff; }
        .thumbnail img { width: 100%; height: 100%; object-fit: cover; }
        .info-section { background: #fff; padding: 24px; border-radius: 8px; }
        .goods-name { font-size: 24px; font-weight: 600; margin-bottom: 12px; color: #333; }
        .goods-tags { margin-bottom: 12px; }
        .goods-desc { color: #666; margin-bottom: 16px; line-height: 1.6; }
        .price-card { background: #fff8f6; border-color: #ffccc7; margin-bottom: 16px; }
        .price-card .ant-card-body { padding: 16px; }
        .price-row { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; }
        .price-row .label { color: #999; font-size: 14px; }
        .price-row .price { color: #f5222d; font-size: 28px; font-weight: bold; }
        .price-row .original { color: #999; font-size: 14px; text-decoration: line-through; }
        .discount-tag { margin-left: 8px; }
        .stats-row { display: flex; gap: 24px; color: #666; font-size: 14px; }
        .stats-row span { display: flex; align-items: center; gap: 6px; }
        .spec-section { margin-bottom: 16px; }
        .spec-row { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
        .spec-label { min-width: 80px; color: #666; }
        .spec-options { display: flex; flex-wrap: wrap; gap: 8px; }
        .spec-options .ant-btn { min-width: 60px; }
        .spec-options .ant-btn.selected { background: #1890ff; border-color: #1890ff; color: #fff; }
        .quantity-section { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .quantity-section .label { color: #666; }
        .quantity-control { display: flex; align-items: center; gap: 8px; }
        .quantity-control .ant-input-number { width: 80px; }
        .stock-info { color: #666; font-size: 14px; }
        .action-buttons { display: flex; gap: 16px; margin-bottom: 24px; }
        .action-buttons .ant-btn-lg { height: 48px; padding: 0 32px; font-size: 16px; }
        .service-promises { display: flex; gap: 24px; padding-top: 16px; border-top: 1px solid #eee; }
        .promise-item { display: flex; align-items: center; gap: 6px; color: #666; font-size: 14px; }
        .detail-tabs { background: #fff; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .goods-detail-content { line-height: 1.8; }
        .goods-detail-content img { max-width: 100%; height: auto; }
        .params-table { width: 100%; border-collapse: collapse; }
        .params-table td { padding: 12px; border: 1px solid #eee; }
        .params-table .param-name { width: 150px; background: #fafafa; color: #666; }
        .comment-list { }
        .comment-item { padding: 16px 0; border-bottom: 1px solid #eee; }
        .comment-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
        .user-name { font-weight: 500; }
        .comment-content { color: #333; line-height: 1.6; margin-bottom: 8px; }
        .comment-images { display: flex; gap: 8px; margin-bottom: 8px; }
        .comment-images img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; cursor: pointer; }
        .comment-time { color: #999; font-size: 12px; }
        .admin-reply { background: #f5f5f5; padding: 12px; border-radius: 4px; margin-top: 8px; color: #666; font-size: 14px; }
        .admin-reply span { color: #1890ff; }
        .detail-loading, .detail-not-found { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; }
      `}</style>
    </div>
  );
}

// 补充Eye图标组件
function Eye({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}