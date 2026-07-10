import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Row, Col, Card, Button, Table, Tabs, Tag, Empty, Modal, message, Steps, Form, Input, Select, Divider, Badge } from 'antd';
import { ArrowLeft, Check, Clock, Truck, Package, CreditCard, XCircle } from 'lucide-react';

interface Order {
  id: string;
  order_no: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  shipping_address: string;
  total_amount: number;
  discount_amount: number;
  pay_amount: number;
  pay_status: string;
  order_status: string;
  payment_method?: string;
  payment_time?: string;
  ship_time?: string;
  receive_time?: string;
  remark?: string;
  items?: OrderItem[];
  created_at: string;
}

interface OrderItem {
  id: string;
  goods_id: string;
  goods_name: string;
  sku?: string;
  quantity: number;
  price: number;
  amount: number;
  image_url?: string;
}

const { TabPane } = Tabs;

export default function ShopOrdersPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundType, setRefundType] = useState("refund");
  const [refundReason, setRefundReason] = useState("");
  const [refunding, setRefunding] = useState(false);
  const [aftersale, setAftersale] = useState<any>(null);
  const [returnShipOpen, setReturnShipOpen] = useState(false);
  const [returnCompany, setReturnCompany] = useState('');
  const [returnNo, setReturnNo] = useState('');
  const [expressList, setExpressList] = useState<any[]>([]);
  const [submittingShip, setSubmittingShip] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [activeTab, page]);

  useEffect(() => {
    fetch('/api/shop-express').then(r=>r.json()).then(d=>setExpressList(Array.isArray(d)?d:[])).catch(()=>{});
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let url = `/api/shop-orders?page=${page}&pageSize=10`;
      if (activeTab !== 'all') {
        const statusMap: Record<string, string> = {
          pending: 'pending',
          paid: 'paid',
          shipped: 'shipped',
          completed: 'completed',
          cancelled: 'cancelled'
        };
        url += `&order_status=${statusMap[activeTab] || activeTab}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.list) {
        setOrders(data.list);
        setTotal(data.total);
      } else {
        setOrders(Array.isArray(data) ? data : []);
        setTotal(Array.isArray(data) ? data.length : 0);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAftersale = async (orderId: string) => {
    if (!orderId) return;
    try {
      const res = await fetch('/api/shop-order-aftersale?order_id=' + orderId);
      const list = await res.json();
      setAftersale(list && list.length ? list[0] : null);
    } catch { /* ignore */ }
  };

  const aftersaleSteps = (as: any) => {
    const isReturn = as.type === 'return';
    const items = isReturn
      ? [{ title: '申请' }, { title: '审核' }, { title: '寄回' }, { title: '收货' }, { title: '退款' }]
      : [{ title: '申请' }, { title: '审核' }, { title: '退款' }];
    const idx: any = { pending: 0, approved: 1, return_shipped: isReturn ? 2 : 1, return_received: isReturn ? 3 : 1, refunded: isReturn ? 4 : 2, completed: isReturn ? 4 : 2, rejected: 1 };
    return { current: idx[as.status] ?? 0, items };
  };

  const aftersaleTag = (s: string) => {
    const m: any = { pending: ['orange', '待审核'], approved: ['blue', '已同意'], return_shipped: ['cyan', '已寄回'], return_received: ['geekblue', '已收货'], refunded: ['green', '退款完成'], rejected: ['red', '已拒绝'], completed: ['green', '已完成'] };
    const c = m[s] || ['default', s];
    return <Tag color={c[0]}>{c[1]}</Tag>;
  };

  const submitReturnShip = async () => {
    if (!aftersale || !returnNo) { message.warning('请填写退货物流单号'); return; }
    setSubmittingShip(true);
    try {
      const res = await fetch('/api/shop-order-aftersale/' + aftersale.id, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'return_shipped', return_tracking_company: returnCompany, return_tracking_no: returnNo })
      });
      if (res.ok) { message.success('退货物流已提交'); setReturnShipOpen(false); loadAftersale(aftersale.order_id); }
    } catch { message.error('提交失败'); }
    setSubmittingShip(false);
  };

  const viewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
    loadAftersale(order.id);
  };

  const confirmReceive = async (orderId: string) => {
    Modal.confirm({
      title: '确认收货',
      content: '确定已收到商品吗？',
      onOk: async () => {
        await fetch(`/api/shop-orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_status: 'completed', receive_time: new Date().toISOString() })
        });
        message.success('收货成功');
        loadOrders();
      }
    });
  };

  const requestRefund = async (order: Order) => {
    setSelectedOrder(order);
    setRefundModalOpen(true);
    setRefundType('refund');
    setRefundReason('');
  };

  const submitRefund = async () => {
    if (!selectedOrder || !refundReason) { message.warning('请填写退款原因'); return; }
    setRefunding(true);
    try {
      const res = await fetch('/api/shop-order-aftersale', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ order_id: selectedOrder.id, type: refundType, reason: refundReason, amount: selectedOrder.pay_amount || selectedOrder.total_amount })
      });
      if (res.ok) { message.success('退款申请已提交'); setRefundModalOpen(false); loadOrders(); if (selectedOrder) loadAftersale(selectedOrder.id); }
    } catch { message.error('提交失败'); }
    setRefunding(false);
  };

  const cancelOrder = async (orderId: string) => {
    Modal.confirm({
      title: '取消订单',
      content: '确定要取消这个订单吗？',
      onOk: async () => {
        await fetch(`/api/shop-orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_status: 'cancelled' })
        });
        message.success('订单已取消');
        loadOrders();
      }
    });
  };

  const getOrderStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      pending: { color: 'orange', text: '待付款' },
      paid: { color: 'blue', text: '已付款' },
      shipped: { color: 'cyan', text: '已发货' },
      completed: { color: 'green', text: '已完成' },
      cancelled: { color: 'default', text: '已取消' }
    };
    const item = map[status] || { color: 'default', text: status };
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  const columns = [
    {
      title: '商品',
      dataIndex: 'items',
      key: 'items',
      render: (items: OrderItem[]) => (
        <div className="order-items-preview">
          {items?.slice(0, 2).map(item => (
            <div key={item.id} className="item-row">
              <span className="item-name">{item.goods_name}</span>
              <span className="item-qty">x{item.quantity}</span>
            </div>
          ))}
          {items?.length > 2 && <span className="more">共{items.length}件商品</span>}
        </div>
      )
    },
    {
      title: '订单金额',
      dataIndex: 'pay_amount',
      key: 'pay_amount',
      render: (amount: number) => <span className="amount">¥{amount}</span>
    },
    {
      title: '订单状态',
      dataIndex: 'order_status',
      key: 'order_status',
      render: (status: string) => getOrderStatusTag(status)
    },
    {
      title: '下单时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <div className="action-btns">
          <Button type="link" size="small" onClick={() => viewDetail(record)}>详情</Button>
          {record.order_status === 'pending' && (
            <Button type="primary" size="small" onClick={() => navigate(`/shop/pay/${record.id}`)}>去支付</Button>
          )}
          {record.order_status === 'shipped' && (
            <Button type="primary" size="small" onClick={() => confirmReceive(record.id)}>确认收货</Button>
          )}
          {record.order_status === 'pending' && (
            <Button type="text" size="small" danger onClick={() => cancelOrder(record.id)}>取消</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="orders-page">
      <div className="page-header">
        <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>返回</Button>
        <h2>我的订单</h2>
      </div>

      <div className="page-content">
        <Card>
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="全部" key="all" />
            <TabPane tab="待付款" key="pending" />
            <TabPane tab="待发货" key="paid" />
            <TabPane tab="待收货" key="shipped" />
            <TabPane tab="已完成" key="completed" />
            <TabPane tab="已取消" key="cancelled" />
          </Tabs>

          <Table
            dataSource={orders}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              current: page,
              pageSize: 10,
              total,
              onChange: setPage,
              showSizeChanger: false
            }}
            locale={{ emptyText: <Empty description="暂无订单" /> }}
          />
        </Card>
      </div>

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div className="order-detail">
            <Steps current={
              selectedOrder.order_status === 'pending' ? 0 :
              selectedOrder.order_status === 'paid' ? 1 :
              selectedOrder.order_status === 'shipped' ? 2 :
              selectedOrder.order_status === 'completed' ? 3 : 0
            } className="order-steps" items={[
              { title: '提交订单', icon: <Clock size={14} /> },
              { title: '付款成功', icon: <CreditCard size={14} /> },
              { title: '商家发货', icon: <Truck size={14} /> },
              { title: '确认收货', icon: <Package size={14} /> },
            ]} />

            <Divider />

            <div className="detail-section">
              <h4>订单信息</h4>
              <Row gutter={[16, 12]}>
                <Col span={12}>订单编号: {selectedOrder.order_no}</Col>
                <Col span={12}>订单状态: {getOrderStatusTag(selectedOrder.order_status)}</Col>
                <Col span={12}>下单时间: {new Date(selectedOrder.created_at).toLocaleString()}</Col>
                {selectedOrder.payment_time && <Col span={12}>付款时间: {new Date(selectedOrder.payment_time).toLocaleString()}</Col>}
                {selectedOrder.ship_time && <Col span={12}>发货时间: {new Date(selectedOrder.ship_time).toLocaleString()}</Col>}
                {selectedOrder.receive_time && <Col span={12}>收货时间: {new Date(selectedOrder.receive_time).toLocaleString()}</Col>}
              </Row>
            </div>

            <Divider />

            <div className="detail-section">
              <h4>收货信息</h4>
              <p>收货人: {selectedOrder.user_name} {selectedOrder.user_phone}</p>
              <p>收货地址: {selectedOrder.shipping_address}</p>
            </div>

            <Divider />

            <div className="detail-section">
              <h4>商品清单</h4>
              {selectedOrder.items?.map(item => (
                <div key={item.id} className="order-item-row">
                  <img src={item.image_url || '/placeholder.png'} alt={item.goods_name} />
                  <div className="item-info">
                    <p className="name">{item.goods_name}</p>
                    <p className="sku">{item.sku || ''}</p>
                  </div>
                  <div className="item-price">
                    <p>¥{item.price}</p>
                    <p>x{item.quantity}</p>
                  </div>
                  <div className="item-amount">¥{item.amount}</div>
                </div>
              ))}
            </div>

            <Divider />

            <div className="order-summary">
              <div className="summary-row">
                <span>商品总额:</span>
                <span>¥{selectedOrder.total_amount}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="summary-row">
                  <span>优惠金额:</span>
                  <span>-¥{selectedOrder.discount_amount}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>实付金额:</span>
                <span>¥{selectedOrder.pay_amount}</span>
              </div>
            </div>

            {aftersale && (
              <div className="aftersale-box">
                <Divider />
                <h4>售后进度</h4>
                <div style={{ marginBottom: 8 }}>
                  类型: <Tag color={aftersale.type === 'return' ? 'purple' : 'orange'}>{aftersale.type === 'return' ? '退货退款' : '仅退款'}</Tag>
                  状态: {aftersaleTag(aftersale.status)}
                </div>
                <Steps current={aftersaleSteps(aftersale).current} size="small" items={aftersaleSteps(aftersale).items} />
                {aftersale.type === 'return' && aftersale.status === 'approved' && (
                  <Button type="primary" style={{ marginTop: 12 }} onClick={() => setReturnShipOpen(true)}>填写退货物流</Button>
                )}
                {aftersale.return_tracking_no && (
                  <div style={{ marginTop: 8, color: '#666' }}>退货物流: {aftersale.return_tracking_company} {aftersale.return_tracking_no}</div>
                )}
                {aftersale.reject_reason && (
                  <div style={{ marginTop: 8, color: '#f5222d' }}>拒绝理由: {aftersale.reject_reason}</div>
                )}
              </div>
            )}

            <div className="detail-footer">
              {!aftersale && selectedOrder.order_status === 'pending' && (
                <>
                  <Button danger onClick={() => cancelOrder(selectedOrder.id)}>取消订单</Button>
                  <Button type="primary" onClick={() => navigate(`/shop/pay/${selectedOrder.id}`)}>去支付</Button>
                </>
              )}
              {!aftersale && selectedOrder.order_status === 'paid' && (
                <Button type="primary" danger onClick={() => requestRefund(selectedOrder)}>申请退款</Button>
              )}
              {!aftersale && selectedOrder.order_status === 'shipped' && (
                <Button type="primary" onClick={() => confirmReceive(selectedOrder.id)}>确认收货</Button>
              )}
              {aftersale && <span style={{ color: '#999' }}>该订单售后处理中，进度见上方「售后进度」</span>}
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .orders-page { background: #f5f5f5; min-height: 100vh; }
        .page-header { background: #001529; color: #fff; padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
        .page-header h2 { margin: 0; }
        .page-content { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
        .order-items-preview .item-row { display: flex; justify-content: space-between; padding: 4px 0; }
        .item-name { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .item-qty { color: #999; }
        .more { color: #1890ff; font-size: 12px; }
        .amount { color: #f5222d; font-weight: bold; }
        .action-btns { display: flex; gap: 8px; }
        .order-detail { }
        .order-steps { margin-bottom: 24px; }
        .detail-section h4 { margin-bottom: 12px; color: #333; }
        .order-item-row { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
        .order-item-row img { width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 12px; }
        .order-item-row .item-info { flex: 1; }
        .order-item-row .item-info .name { margin: 0; font-size: 14px; }
        .order-item-row .item-info .sku { margin: 4px 0 0; color: #999; font-size: 12px; }
        .order-item-row .item-price { text-align: right; margin-right: 24px; }
        .order-item-row .item-price p { margin: 0; }
        .order-item-row .item-price p:last-child { color: #999; font-size: 12px; }
        .order-item-row .item-amount { font-weight: bold; color: #f5222d; width: 80px; text-align: right; }
        .order-summary { text-align: right; }
        .summary-row { display: flex; justify-content: flex-end; gap: 24px; padding: 4px 0; }
        .summary-row.total { font-size: 18px; font-weight: bold; color: #f5222d; margin-top: 8px; }
        .detail-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
      `}</style>

      <Modal title="申请售后" open={refundModalOpen} onOk={submitRefund} onCancel={()=>setRefundModalOpen(false)} confirmLoading={refunding}>
        <div style={{marginBottom:12}}>
          <div style={{fontWeight:'bold',marginBottom:4}}>订单号: {selectedOrder?.order_no}</div>
          <div>金额: ¥{selectedOrder?.pay_amount || selectedOrder?.total_amount}</div>
        </div>
        <div style={{marginBottom:12}}>
          <span style={{marginRight:8}}>售后类型:</span>
          <Button size="small" type={refundType==='refund'?'primary':'default'} onClick={()=>setRefundType('refund')}>仅退款</Button>
          <Button size="small" type={refundType==='return'?'primary':'default'} onClick={()=>setRefundType('return')} style={{marginLeft:8}}>退货退款</Button>
        </div>
        <div><span>退款原因:</span><Input.TextArea value={refundReason} onChange={e=>setRefundReason(e.target.value)} rows={3} placeholder="请描述退款原因..."/></div>
      </Modal>

      <Modal title="填写退货物流" open={returnShipOpen} onOk={submitReturnShip} onCancel={()=>setReturnShipOpen(false)} confirmLoading={submittingShip}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ marginBottom: 6 }}>快递公司:</div>
          <Select style={{ width: '100%' }} placeholder="选择快递公司" value={returnCompany} onChange={setReturnCompany}
            options={expressList.map((e:any)=>({ value: e.name, label: e.name }))} />
        </div>
        <div>
          <div style={{ marginBottom: 6 }}>退货单号:</div>
          <Input placeholder="请输入退货物流单号" value={returnNo} onChange={e=>setReturnNo(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}