import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Table, Button, InputNumber, message, Empty, Row, Col, Divider } from 'antd';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  main_image: string;
  stock: number;
}

interface CartItem extends Product {
  quantity: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    const savedCart = localStorage.getItem('shop_cart');
    if (savedCart) {
      const cart = JSON.parse(savedCart);
      const productIds = Object.keys(cart);
      if (productIds.length > 0) {
        try {
          const products = await Promise.all(
            productIds.map(id => fetch(`/api/shop-goods/${id}`).then(r => r.json()))
          );
          const items = products.map((p: Product) => ({
            ...p,
            quantity: cart[p.id] || 1
          })).filter(item => item.id);
          setCartItems(items);
        } catch (e) {
          message.error('加载购物车失败');
        }
      }
    }
    setLoading(false);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    const newCart = { ...JSON.parse(localStorage.getItem('shop_cart') || '{}') };
    newCart[id] = quantity;
    localStorage.setItem('shop_cart', JSON.stringify(newCart));
    setCartItems(items => items.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const removeItem = (id: string) => {
    const newCart = { ...JSON.parse(localStorage.getItem('shop_cart') || '{}') };
    delete newCart[id];
    localStorage.setItem('shop_cart', JSON.stringify(newCart));
    setCartItems(items => items.filter(item => item.id !== id));
    message.success('已移除商品');
  };

  const getTotal = () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 顶部导航 */}
      <div style={{ background: '#001529', color: '#fff', padding: '0 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <div style={{ fontSize: 20, fontWeight: 'bold' }}>飞达商城</div>
          <div style={{ display: 'flex', gap: 32 }}>
            <Link to="/site" style={{ color: '#fff' }}>首页</Link>
            <Link to="/shop" style={{ color: '#fff' }}>商城</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <h1 style={{ marginBottom: 24 }}>购物车</h1>

        {cartItems.length > 0 ? (
          <Row gutter={24}>
            <Col xs={24} lg={16}>
              <Card>
                <Table
                  dataSource={cartItems}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    {
                      title: '商品',
                      render: (_, record) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 80, height: 80, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {record.main_image ? (
                              <img src={record.main_image} alt={record.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            ) : '🛍️'}
                          </div>
                          <Link to={`/shop/goods/${record.id}`}>{record.name}</Link>
                        </div>
                      )
                    },
                    {
                      title: '单价',
                      render: (_, record) => `¥${record.price}`
                    },
                    {
                      title: '数量',
                      render: (_, record) => (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Button size="small" icon={<Minus size={12} />} onClick={() => updateQuantity(record.id, record.quantity - 1)} disabled={record.quantity <= 1} />
                          <InputNumber size="small" min={1} max={record.stock} value={record.quantity} onChange={v => updateQuantity(record.id, v || 1)} style={{ width: 60 }} />
                          <Button size="small" icon={<Plus size={12} />} onClick={() => updateQuantity(record.id, record.quantity + 1)} disabled={record.quantity >= record.stock} />
                        </div>
                      )
                    },
                    {
                      title: '小计',
                      render: (_, record) => <span style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{record.price * record.quantity}</span>
                    },
                    {
                      title: '操作',
                      render: (_, record) => (
                        <Button type="text" danger icon={<Trash2 size={14} />} onClick={() => removeItem(record.id)} />
                      )
                    }
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card>
                <h3>费用汇总</h3>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span>商品总数</span>
                  <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)} 件</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span>商品总价</span>
                  <span style={{ fontSize: 24, color: '#f5222d', fontWeight: 'bold' }}>¥{getTotal()}</span>
                </div>
                <Link to="/shop/checkout"><Button type="primary" block size="large">去结算</Button></Link>
                <Link to="/shop">
                  <Button block style={{ marginTop: 8 }}>继续购物</Button>
                </Link>
              </Card>
            </Col>
          </Row>
        ) : (
          <Card>
            <Empty description="购物车是空的" image={Empty.PRESENTED_IMAGE_SIMPLE}>
              <Link to="/shop">
                <Button type="primary">去商城逛逛</Button>
              </Link>
            </Empty>
          </Card>
        )}
      </div>
    </div>
  );
}
