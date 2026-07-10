import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Input, Form, Select, Radio, Steps, message, Divider, Modal, InputNumber } from 'antd';
import { ArrowLeft, Check, MapPin, Plus, ShoppingCart } from 'lucide-react';
import RegionCascader from '../../components/RegionCascader';

interface CartItem {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  main_image?: string;
  stock: number;
  quantity: number;
}

interface Address {
  id: string;
  contact_name: string;
  contact_phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  is_default: number;
}

const { TextArea } = Input;

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [remark, setRemark] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [currentStep, setCurrentStep] = useState(0);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [buyNowData, setBuyNowData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // 检查是否是立即购买
    const buyNow = localStorage.getItem('buy_now');
    if (buyNow) {
      const data = JSON.parse(buyNow);
      setBuyNowData(data);
      setCartItems([{
        id: data.goods_id,
        name: data.goods.name,
        price: data.goods.is_promotion && data.goods.promotion_price ? data.goods.promotion_price : data.goods.price,
        main_image: data.goods.main_image || data.goods.selected_image,
        stock: data.goods.stock,
        quantity: data.quantity
      }]);
      localStorage.removeItem('buy_now');
    } else {
      // 从购物车加载
      loadCartItems();
    }
    loadAddresses();
  };

  const loadCartItems = async () => {
    const savedCart = localStorage.getItem('shop_cart');
    if (!savedCart) {
      message.error('购物车为空');
      navigate('/shop/cart');
      return;
    }
    const cart = JSON.parse(savedCart);
    const productIds = Object.keys(cart);
    if (productIds.length === 0) {
      message.error('购物车为空');
      navigate('/shop/cart');
      return;
    }

    try {
      const products = await Promise.all(
        productIds.map(id => fetch(`/api/shop-goods/${id}`).then(r => r.json()).catch(() => null))
      );
      const items = products.filter(Boolean).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.is_promotion && p.promotion_price ? p.promotion_price : p.price,
        original_price: p.original_price,
        main_image: p.main_image,
        stock: p.stock,
        quantity: cart[p.id] || 1
      })).filter((item: any) => item.id && item.stock > 0);

      if (items.length === 0) {
        message.error('购物车商品已售罄');
        navigate('/shop/cart');
        return;
      }
      setCartItems(items);
    } catch (e) {
      message.error('加载商品失败');
    }
  };

  const loadAddresses = async () => {
    try {
      const res = await fetch('/api/shop-addresses');
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
      const defaultAddr = data.find((a: Address) => a.is_default === 1);
      if (defaultAddr) setSelectedAddress(defaultAddr);
      else if (data.length > 0) setSelectedAddress(data[0]);
    } catch (e) {
      console.error('加载地址失败', e);
    }
  };

  const handleAddAddress = async () => {
    try {
      const values = await addressForm.validateFields();
      const { region, ...rest } = values;
      const payload = {
        ...rest,
        province: region?.[0] || '',
        city: region?.[1] || '',
        district: region?.[2] || '',
      };
      const res = await fetch('/api/shop-addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        message.success('添加成功');
        setAddressModalOpen(false);
        addressForm.resetFields();
        loadAddresses();
      }
    } catch (e) {
      console.error('添加地址失败', e);
    }
  };

  const calculateTotal = () => {
    const goodsAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return {
      goodsAmount,
      freight: goodsAmount >= 99 ? 0 : 10, // 满99包邮
      discount: 0,
      total: goodsAmount + (goodsAmount >= 99 ? 0 : 10)
    };
  };

  const handleSubmit = async () => {
    if (!selectedAddress) {
      message.error('请选择收货地址');
      return;
    }
    if (cartItems.length === 0) {
      message.error('购物车为空');
      return;
    }

    setSubmitting(true);
    try {
      const addressStr = `${selectedAddress.province} ${selectedAddress.city} ${selectedAddress.district} ${selectedAddress.address}`;

      const res = await fetch('/api/shop-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'guest',
          user_name: selectedAddress.contact_name,
          user_phone: selectedAddress.contact_phone,
          shipping_address: addressStr,
          remark,
          payment_method: paymentMethod,
          items: cartItems.map(item => ({
            goods_id: item.id,
            goods_name: item.name,
            quantity: item.quantity,
            price: item.price,
            image_url: item.main_image
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        // 清除购物车
        if (!buyNowData) {
          const newCart: Record<string, number> = {};
          cartItems.forEach(item => {
            // 保留未购买的商品（如果有多个相同商品）
          });
          localStorage.removeItem('shop_cart');
          window.dispatchEvent(new Event('cartUpdated'));
        }

        if (paymentMethod === 'online') {
          // 模拟支付
          Modal.confirm({
            title: '模拟支付',
            content: `订单金额：¥${calculateTotal().total}\n\n点击确认完成支付`,
            onOk: async () => {
              await fetch(`/api/shop-orders/${data.id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_method: 'online' })
              });
              message.success('支付成功');
              navigate('/shop/orders');
            }
          });
        } else {
          message.success('订单提交成功');
          navigate('/shop/orders');
        }
      } else {
        message.error('订单提交失败');
      }
    } catch (e) {
      message.error('提交订单失败');
    } finally {
      setSubmitting(false);
    }
  };

  const { goodsAmount, freight, discount, total } = calculateTotal();

  return (
    <div className="checkout-page">
      <div className="page-header">
        <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>返回</Button>
        <h2>确认订单</h2>
      </div>

      <div className="checkout-container">
        <Steps current={currentStep} className="checkout-steps" items={[
          { title: '确认订单' },
          { title: '选择支付' },
          { title: '完成' },
        ]} />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            {/* 收货地址 */}
            <Card title="收货地址" className="address-card">
              {addresses.length > 0 ? (
                <div className="address-list">
                  {addresses.map(addr => (
                    <div
                      key={addr.id}
                      className={`address-item ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddress(addr)}
                    >
                      <div className="address-info">
                        <p className="name">{addr.contact_name} {addr.contact_phone}</p>
                        <p className="detail">{addr.province} {addr.city} {addr.district} {addr.address}</p>
                      </div>
                      {addr.is_default === 1 && <span className="default-tag">默认</span>}
                    </div>
                  ))}
                  <div className="address-item add-new" onClick={() => setAddressModalOpen(true)}>
                    <Plus size={24} />
                    <span>添加新地址</span>
                  </div>
                </div>
              ) : (
                <div className="no-address" onClick={() => setAddressModalOpen(true)}>
                  <Plus size={24} />
                  <span>添加收货地址</span>
                </div>
              )}
            </Card>

            {/* 商品清单 */}
            <Card title="商品清单" className="goods-card">
              {cartItems.map(item => (
                <div key={item.id} className="goods-item">
                  <img src={item.main_image || '/placeholder.png'} alt={item.name} />
                  <div className="goods-info">
                    <p className="name">{item.name}</p>
                    <p className="stock">库存: {item.stock}</p>
                  </div>
                  <div className="goods-price">¥{item.price.toFixed(2)}</div>
                  <div className="goods-qty">x{item.quantity}</div>
                  <div className="goods-amount">¥{(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </Card>

            {/* 订单备注 */}
            <Card title="订单备注">
              <TextArea
                placeholder="选填，可备注特殊需求"
                value={remark}
                onChange={e => setRemark(e.target.value)}
                rows={2}
                maxLength={200}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="订单金额" className="summary-card">
              <div className="summary-row">
                <span>商品金额</span>
                <span>¥{goodsAmount.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>运费</span>
                <span>{freight === 0 ? '免运费' : `¥${freight.toFixed(2)}`}</span>
              </div>
              {freight > 0 && (
                <p className="freight-tip">满99元免运费，还差¥{(99 - goodsAmount).toFixed(2)}</p>
              )}
              <Divider />
              <div className="summary-row total">
                <span>应付金额</span>
                <span className="amount">¥{total.toFixed(2)}</span>
              </div>

              <Divider />

              <div className="payment-section">
                <h4>支付方式</h4>
                <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <Radio value="online">
                    <span>在线支付</span>
                    <span className="payment-desc">微信/支付宝/银行卡</span>
                  </Radio>
                  <Radio value="cod">
                    <span>货到付款</span>
                    <span className="payment-desc">送货上门后付款</span>
                  </Radio>
                </Radio.Group>
              </div>

              <Button
                type="primary"
                size="large"
                block
                onClick={handleSubmit}
                loading={submitting}
                disabled={!selectedAddress || cartItems.length === 0}
              >
                提交订单
              </Button>
            </Card>
          </Col>
        </Row>
      </div>

      {/* 添加地址弹窗 */}
      <Modal
        title="添加收货地址"
        open={addressModalOpen}
        onOk={handleAddAddress}
        onCancel={() => setAddressModalOpen(false)}
      >
        <Form form={addressForm} layout="vertical">
          <Form.Item name="contact_name" label="收货人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contact_phone" label="联系电话" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="region" label="所在地区" rules={[{ required: true, type: 'array', message: '请选择省 / 市 / 区' }]}>
            <RegionCascader />
          </Form.Item>
          <Form.Item name="address" label="详细地址" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .checkout-page { background: #f5f5f5; min-height: 100vh; }
        .page-header { background: #001529; color: #fff; padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
        .page-header h2 { margin: 0; }
        .checkout-container { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
        .checkout-steps { margin-bottom: 24px; background: #fff; padding: 20px; border-radius: 8px; }
        .address-card .address-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .address-item { border: 2px solid #eee; border-radius: 8px; padding: 16px; cursor: pointer; position: relative; transition: all 0.3s; }
        .address-item:hover { border-color: #1890ff; }
        .address-item.selected { border-color: #1890ff; background: #f0f7ff; }
        .address-item.add-new { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #999; min-height: 100px; }
        .address-item.add-new:hover { color: #1890ff; border-color: #1890ff; }
        .address-info .name { font-weight: 500; margin-bottom: 8px; }
        .address-info .detail { color: #666; font-size: 14px; margin: 0; }
        .default-tag { position: absolute; top: 8px; right: 8px; background: #ff4d4f; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .no-address { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 32px; border: 2px dashed #ddd; border-radius: 8px; cursor: pointer; color: #999; }
        .goods-item { display: flex; align-items: center; padding: 16px 0; border-bottom: 1px solid #eee; }
        .goods-item img { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-right: 16px; }
        .goods-item .goods-info { flex: 1; }
        .goods-item .goods-info .name { margin: 0 0 4px; font-size: 14px; }
        .goods-item .goods-info .stock { color: #999; font-size: 12px; margin: 0; }
        .goods-item .goods-price { width: 80px; color: #666; }
        .goods-item .goods-qty { width: 40px; color: #999; text-align: center; }
        .goods-item .goods-amount { width: 100px; text-align: right; font-weight: bold; color: #f5222d; }
        .summary-card .summary-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .summary-card .summary-row.total { font-size: 18px; }
        .summary-card .amount { color: #f5222d; font-size: 24px; font-weight: bold; }
        .freight-tip { font-size: 12px; color: #1890ff; margin: 4px 0; }
        .payment-section h4 { margin-bottom: 12px; }
        .payment-section .ant-radio-wrapper { display: block; margin-bottom: 12px; padding: 12px; border: 1px solid #eee; border-radius: 4px; }
        .payment-desc { display: block; color: #999; font-size: 12px; }
      `}</style>
    </div>
  );
}