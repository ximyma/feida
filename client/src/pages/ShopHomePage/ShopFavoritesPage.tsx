import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Empty, message, Modal } from 'antd';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useShop } from './ShopContext';

interface Goods {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  main_image?: string;
  sales_count: number;
  is_promotion?: number;
  promotion_price?: number;
}

export default function ShopFavoritesPage() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useShop();
  const [goodsList, setGoodsList] = useState<Goods[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [favorites]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const promises = favorites.map(id =>
        fetch(`/api/shop-goods/${id}`)
          .then(r => r.json())
          .then(data => !data.error ? data : null)
          .catch(() => null)
      );
      const results = await Promise.all(promises);
      setGoodsList(results.filter(Boolean));
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    Modal.confirm({
      title: '确认取消收藏',
      content: '确定要取消收藏这个商品吗？',
      onOk: () => {
        removeFavorite(id);
        message.success('已取消收藏');
      }
    });
  };

  const addToCart = (goods: Goods) => {
    const cart = JSON.parse(localStorage.getItem('shop_cart') || '{}');
    cart[goods.id] = (cart[goods.id] || 0) + 1;
    localStorage.setItem('shop_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    message.success('已加入购物车');
  };

  return (
    <div className="favorites-page">
      <div className="page-header">
        <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>返回</Button>
        <h2>我的收藏 ({favorites.length})</h2>
      </div>

      <div className="page-content">
        {goodsList.length > 0 ? (
          <Row gutter={[16, 16]}>
            {goodsList.map(goods => (
              <Col xs={12} sm={8} md={6} lg={4} key={goods.id}>
                <Card
                  hoverable
                  cover={
                    <div className="goods-image">
                      <Link to={`/shop/goods/${goods.id}`}>
                        <img src={goods.main_image || '/placeholder.png'} alt={goods.name} />
                      </Link>
                      <div className="quick-actions">
                        <Button
                          type="text"
                          icon={<ShoppingCart size={16} />}
                          onClick={() => addToCart(goods)}
                        />
                        <Button
                          type="text"
                          icon={<Trash2 size={16} />}
                          onClick={() => handleRemove(goods.id)}
                        />
                      </div>
                    </div>
                  }
                >
                  <Card.Meta
                    title={<Link to={`/shop/goods/${goods.id}`} className="goods-name">{goods.name}</Link>}
                    description={
                      <div className="goods-price">
                        <span className="price">¥{goods.is_promotion && goods.promotion_price ? goods.promotion_price : goods.price}</span>
                        {goods.original_price && goods.original_price > goods.price && (
                          <span className="original">¥{goods.original_price}</span>
                        )}
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无收藏商品">
            <Button type="primary" onClick={() => navigate('/shop')}>去商城逛逛</Button>
          </Empty>
        )}
      </div>

      <style>{`
        .favorites-page { background: #f5f5f5; min-height: 100vh; }
        .page-header { background: #fff; padding: 16px 20px; display: flex; align-items: center; gap: 16px; border-bottom: 1px solid #eee; }
        .page-header h2 { margin: 0; }
        .page-content { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
        .goods-image { position: relative; height: 180px; background: #f9f9f9; }
        .goods-image img { width: 100%; height: 100%; object-fit: cover; }
        .quick-actions { position: absolute; bottom: 8px; right: 8px; display: flex; gap: 8px; opacity: 0; transition: opacity 0.3s; }
        .goods-image:hover .quick-actions { opacity: 1; }
        .quick-actions .ant-btn { background: rgba(255,255,255,0.9); border-radius: 50%; }
        .goods-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }
        .goods-price { display: flex; align-items: baseline; gap: 8px; }
        .goods-price .price { color: #f5222d; font-size: 16px; font-weight: bold; }
        .goods-price .original { color: #999; font-size: 12px; text-decoration: line-through; }
      `}</style>
    </div>
  );
}