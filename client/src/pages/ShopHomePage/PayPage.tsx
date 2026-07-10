import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Steps, Result, Spin, Divider, message, Radio, Row, Col } from 'antd';
import { ArrowLeft, CheckCircle, CreditCard, Smartphone, Wallet } from 'lucide-react';

interface Order {
  id: string;
  order_no: string;
  pay_amount: number;
  total_amount: number;
  order_status: string;
  pay_status: string;
  created_at: string;
  items?: any[];
}

const PAY_METHODS = [
  { key: 'alipay', label: '支付宝', icon: '💙', desc: '推荐安装支付宝的客户使用' },
  { key: 'wechat', label: '微信支付', icon: '💚', desc: '推荐安装微信的客户使用' },
  { key: 'wallet', label: '余额支付', icon: '🟡', desc: '使用账户余额支付' },
];

export default function PayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState('alipay');
  const [showQr, setShowQr] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (id) {
      fetch(`/api/shop-orders/${id}`)
        .then(r => r.json())
        .then(data => setOrder(data))
        .catch(() => message.error('加载订单失败'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleShowQr = () => {
    setShowQr(true);
    setCountdown(120);
    message.info('请使用手机扫码支付，模拟支付将自动完成');
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const res = await fetch(`/api/shop-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pay_status: 'paid', order_status: 'paid',
          payment_method: payMethod, payment_time: new Date().toISOString()
        })
      });
      if (res.ok) {
        message.success('支付成功！');
        navigate('/shop/orders');
      } else {
        message.error('支付失败');
      }
    } catch {
      message.error('支付失败');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}><Spin size="large" /></div>;
  }

  if (!order) {
    return <Result status="404" title="订单不存在" extra={<Button type="primary" onClick={() => navigate('/shop/orders')}>返回订单列表</Button>} />;
  }

  if (order.pay_status === 'paid') {
    return (
      <Result status="success" title="支付成功" subTitle={`订单号: ${order.order_no}`}
        extra={[<Button key="order" type="primary" onClick={() => navigate('/shop/orders')}>查看订单</Button>,
                <Button key="shop" onClick={() => navigate('/shop')}>继续购物</Button>]} />
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '0 16px' }}>
      <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>返回</Button>

      <Card>
        <Steps current={1} items={[
          { title: '提交订单', status: 'finish' },
          { title: '支付订单', status: 'process' },
          { title: '确认收货', status: 'wait' },
        ]} style={{ marginBottom: 32 }} />

        {!showQr ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <CreditCard size={48} color="#1677ff" />
              <h2 style={{ marginTop: 16 }}>选择支付方式</h2>
              <p style={{ color: '#999' }}>订单号: {order.order_no}</p>
            </div>

            <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#666' }}>订单金额</span>
                <span>¥{(order.pay_amount || order.total_amount).toFixed(2)}</span>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', fontSize: 16 }}>应付金额</span>
                <span style={{ color: '#f5222d', fontSize: 28, fontWeight: 'bold' }}>¥{(order.pay_amount || order.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Radio.Group value={payMethod} onChange={e => setPayMethod(e.target.value)} style={{ width: '100%' }}>
                {PAY_METHODS.map(m => (
                  <div key={m.key} style={{ border: `1px solid ${payMethod === m.key ? '#1677ff' : '#e8e8e8'}`, borderRadius: 8, padding: 12, marginBottom: 8, cursor: 'pointer' }}
                    onClick={() => setPayMethod(m.key)}>
                    <Radio value={m.key}>
                      <span style={{ fontSize: 16 }}>{m.icon} {m.label}</span>
                      <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>{m.desc}</span>
                    </Radio>
                  </div>
                ))}
              </Radio.Group>
            </div>

            <Button type="primary" size="large" block onClick={handleShowQr}>
              确认支付 ¥{(order.pay_amount || order.total_amount).toFixed(2)}
            </Button>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2>请使用{PAY_METHODS.find(m => m.key === payMethod)?.label}扫码支付</h2>
              <p style={{ color: '#999' }}>请在 {Math.floor(countdown / 60)}分{countdown % 60}秒 内完成支付</p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 200, height: 200, margin: '0 auto', background: `linear-gradient(135deg, ${payMethod === 'alipay' ? '#1677ff' : '#07c160'}22, ${payMethod === 'alipay' ? '#1677ff' : '#07c160'}44)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px dashed ${payMethod === 'alipay' ? '#1677ff' : '#07c160'}` }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 60 }}>{PAY_METHODS.find(m => m.key === payMethod)?.icon}</div>
                  <div style={{ fontSize: 14, color: '#666' }}>模拟支付二维码</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{payMethod === 'alipay' ? 'Alipay' : 'WeChat Pay'}</div>
                </div>
              </div>
              <p style={{ marginTop: 12, color: '#1677ff', cursor: 'pointer' }} onClick={handlePay}>
                {paying ? <Spin size="small" /> : '模拟支付 → 点击立即完成支付'}
              </p>
            </div>

            <div style={{ background: '#fffbe6', borderRadius: 8, padding: 12, marginBottom: 16 }}>
              <span style={{ color: '#faad14', fontSize: 12 }}>💡 提示：这是模拟支付环境。真实部署时需配置支付宝/微信商户信息。</span>
            </div>

            <Button block onClick={() => setShowQr(false)}>返回选择支付方式</Button>
          </>
        )}
      </Card>
    </div>
  );
}
