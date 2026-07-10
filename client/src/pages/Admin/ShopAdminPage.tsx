import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Card, Button, Tag, Modal, Form, Input, Select, InputNumber, Switch, message, Space, Popconfirm, Tabs, Badge, Row, Col, Statistic, Divider, ColorPicker, Popover, Timeline } from 'antd';
import { Plus, Edit, Delete, Eye, Truck, Check, X } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';

interface Order {
  id: string;
  order_no: string;
  user_name: string;
  user_phone: string;
  shipping_address: string;
  total_amount: number;
  pay_amount: number;
  pay_status: string;
  order_status: string;
  payment_method?: string;
  created_at: string;
  items?: any[];
}

interface Goods {
  id: string;
  name: string;
  category_id: string;
  brand_id: string;
  price: number;
  stock: number;
  sales_count: number;
  status: string;
  is_hot: number;
  is_new: number;
  is_recommend: number;
}

interface Review {
  id: string;
  goods_name?: string;
  user_name: string;
  rating: number;
  content: string;
  status: string;
  created_at: string;
}

const { TabPane } = Tabs;

const AFTERSALE_STATUS: Record<string, { color: string; text: string }> = {
  pending: { color: 'orange', text: '待审核' },
  approved: { color: 'blue', text: '已同意' },
  return_shipped: { color: 'cyan', text: '已寄回' },
  return_received: { color: 'geekblue', text: '已收货' },
  refunded: { color: 'green', text: '退款完成' },
  rejected: { color: 'red', text: '已拒绝' },
  completed: { color: 'green', text: '已完成' },
};
const aftersaleStatusTag = (s: string) => { const m = AFTERSALE_STATUS[s] || { color: 'default', text: s }; return <Tag color={m.color}>{m.text}</Tag>; };

const ORDER_LOG_LABEL: Record<string, string> = {
  create: '创建订单', paid: '支付成功', pay_offline_pending: '提交线下支付',
  shipped: '商家发货', received: '确认收货', cancelled: '订单取消',
  aftersale_approved: '售后通过', aftersale_rejected: '售后拒绝',
  aftersale_received: '售后收货', aftersale_refunded: '退款完成',
};

export default function ShopAdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'orders';
  const validTabs = ['orders', 'goods', 'reviews', 'brands', 'coupons', 'seckill', 'groupbuy', 'bargain', 'member', 'navigation', 'express', 'distribution', 'warehouse', 'decoration', 'system', 'aftersale'];
  const [activeTab, setActiveTab] = useState(validTabs.includes(tabFromUrl) ? tabFromUrl : 'orders');
  const [aftersaleList, setAftersaleList] = useState<any[]>([]);
  const [aftersaleCur, setAftersaleCur] = useState<any>(null);
  const [aftersaleModalOpen, setAftersaleModalOpen] = useState(false);
  const [rejectAftersaleOpen, setRejectAftersaleOpen] = useState(false);
  const [rejectAftersaleReason, setRejectAftersaleReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('original');
  const openAftersale = (r: any) => { setAftersaleCur(r); setRefundMethod(r.refund_method || 'original'); setAftersaleModalOpen(true); };
  const doAftersale = async (status: string, extra: any = {}) => {
    if (!aftersaleCur) return;
    await fetch('/api/shop-order-aftersale/' + aftersaleCur.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, reviewer: 'admin', ...extra }) });
    message.success('操作成功'); setAftersaleModalOpen(false); loadData();
  };
  const confirmRejectAftersale = async () => {
    if (!aftersaleCur) return;
    await fetch('/api/shop-order-aftersale/' + aftersaleCur.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected', reviewer: 'admin', reject_reason: rejectAftersaleReason }) });
    message.success('已拒绝'); setRejectAftersaleOpen(false); setAftersaleModalOpen(false); setRejectAftersaleReason(''); loadData();
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [goods, setGoods] = useState<Goods[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [seckills, setSeckills] = useState<any[]>([]);
  const [groupBuys, setGroupBuys] = useState<any[]>([]);
  const [bargains, setBargains] = useState<any[]>([]);
  const [memberLevels, setMemberLevels] = useState<any[]>([]);
  const [navItems, setNavItems] = useState<any[]>([]);
  const [expressList, setExpressList] = useState<any[]>([]);
  const [distConfig, setDistConfig] = useState<any>({ is_open: 1, level_mode: 2, settle_type: 'paid', commission_base: 'pay' });
  const [distLevels, setDistLevels] = useState<any[]>([]);
  const [distMembers, setDistMembers] = useState<any[]>([]);
  const [distOrders, setDistOrders] = useState<any[]>([]);
  const [distWithdraws, setDistWithdraws] = useState<any[]>([]);
  const [newLevel, setNewLevel] = useState<any>({ name: '', rate1: 0, rate2: 0, rate3: 0 });
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouseGoods, setWarehouseGoods] = useState<any[]>([]);
  const [stockLogs, setStockLogs] = useState<any[]>([]);
  const [newWh, setNewWh] = useState<any>({ name: '', code: '', address: '', contact: '', remark: '', is_default: false });
  const [adjustForm, setAdjustForm] = useState<any>({ warehouse_id: '', goods_id: '', sku_code: '', num: 0, type: 'in', remark: '', operator: '' });
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [seckillModalOpen, setSeckillModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderLogs, setOrderLogs] = useState<any[]>([]);
  const [confirmingPay, setConfirmingPay] = useState(false);
  const [skuRows, setSkuRows] = useState<any[]>([]);
  const [sysConfig, setSysConfig] = useState<any>({});
  const [pages, setPages] = useState<any[]>([]);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [pageModalOpen, setPageModalOpen] = useState(false);
  const [pageBlocks, setPageBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [goodsModalOpen, setGoodsModalOpen] = useState(false);
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingGoods, setEditingGoods] = useState<Goods | null>(null);
  const [catMode, setCatMode] = useState<'single' | 'multi'>('single');
  const [goodsImages, setGoodsImages] = useState<string[]>([]);
  const [dragImgIndex, setDragImgIndex] = useState<number>(-1);

  const syncImages = (arr: string[]) => { setGoodsImages(arr); goodsForm.setFieldValue('images', arr); };
  const reorderImages = (from: number, to: number) => {
    if (from < 0 || from === to || from >= goodsImages.length) return;
    const arr = [...goodsImages];
    const [m] = arr.splice(from, 1);
    arr.splice(to, 0, m);
    syncImages(arr);
  };
  const removeImage = (i: number) => { syncImages(goodsImages.filter((_, j) => j !== i)); };
  const setMainImage = (img: string) => { goodsForm.setFieldValue('main_image', img); message.success('已设为主图'); };
  const [specImages, setSpecImages] = useState<Record<string, string>>({});
  const syncSpecImages = (map: Record<string, string>) => { setSpecImages(map); goodsForm.setFieldValue('spec_images', JSON.stringify(map)); };
  const [extendData, setExtendData] = useState<{ key: string; value: string }[]>([]);
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const syncExtend = (arr: { key: string; value: string }[]) => { setExtendData(arr); goodsForm.setFieldValue('extend_data', JSON.stringify(arr)); };
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [goodsForm] = Form.useForm();
  const [brandForm] = Form.useForm();
  const [orderForm] = Form.useForm();

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Always load category tree
  useEffect(() => {
    fetch('/api/shop-categories/tree').then(r=>r.json()).then(d=>setCategoryTree(d||[])).catch(()=>{});
    fetch('/api/shop-goods?pageSize=200').then(r=>r.json()).then(d=>setAllGoods(d.list || d || [])).catch(()=>{});
  }, []);

  const [allGoods, setAllGoods] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'brands') { const r = await fetch('/api/shop-brands'); setBrands(await r.json()); setLoading(false); return; } if (activeTab === 'coupons') { const r = await fetch('/api/shop-coupons'); setCoupons(await r.json()); setLoading(false); return; } if (activeTab === 'seckill') { const r = await fetch('/api/shop-seckill'); setSeckills(await r.json()); setLoading(false); return; } if (activeTab === 'groupbuy') { const r = await fetch('/api/shop-group-buy'); setGroupBuys(await r.json()); setLoading(false); return; } if (activeTab === 'bargain') { const r = await fetch('/api/shop-bargain'); setBargains(await r.json()); setLoading(false); return; } if (activeTab === 'member') { const r = await fetch('/api/shop-member-levels'); setMemberLevels(await r.json()); setLoading(false); return; } if (activeTab === 'navigation') { const r = await fetch('/api/shop-navigation'); setNavItems(await r.json()); setLoading(false); return; } if (activeTab === 'express') { const r = await fetch('/api/shop-express'); setExpressList(await r.json()); setLoading(false); return; } if (activeTab === 'distribution') { const cfg = await (await fetch('/api/shop-distribution-config')).json(); setDistConfig(cfg); const [lv, mb, od, wd] = await Promise.all([fetch('/api/shop-distribution-levels').then(r=>r.json()), fetch('/api/shop-distribution-members').then(r=>r.json()), fetch('/api/shop-distribution-orders').then(r=>r.json()), fetch('/api/shop-distribution-withdraw').then(r=>r.json())]); setDistLevels(lv); setDistMembers(mb); setDistOrders(od); setDistWithdraws(wd); setLoading(false); return; } if (activeTab === 'warehouse') { const whs = await (await fetch('/api/shop-warehouses')).json(); setWarehouses(whs); const def = whs.find((w:any)=>w.is_default) || whs[0]; const wid = def ? def.id : ''; const [wg, logs] = await Promise.all([fetch('/api/shop-warehouse-goods' + (wid ? '?warehouse_id=' + wid : '')).then(r=>r.json()), fetch('/api/shop-stock-logs').then(r=>r.json())]); setWarehouseGoods(wg); setStockLogs(logs); setAdjustForm((f:any)=>({ ...f, warehouse_id: wid })); setLoading(false); return; }
      if (activeTab === 'system') { const cfg = await (await fetch('/api/sys-config')).json(); setSysConfig(cfg || {}); setLoading(false); return; }
      if (activeTab === 'decoration') { const r = await fetch('/api/shop-page-design'); setPages(await r.json()); setLoading(false); return; }
      if (activeTab === 'aftersale') { const r = await (await fetch('/api/shop-order-aftersale')).json(); setAftersaleList(Array.isArray(r) ? r : []); setLoading(false); return; }
      if (activeTab === 'orders') {
        const res = await fetch('/api/shop-orders');
        const data = await res.json();
        setOrders(data.list || data || []);
      } else if (activeTab === 'goods') {
        const res = await fetch('/api/shop-goods?pageSize=100');
        const data = await res.json();
        setGoods(data.list || data || []);
      } else if (activeTab === 'reviews') {
        const res = await fetch('/api/shop-reviews');
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : data.list || []);
      }
    } catch (e) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const viewOrder = (order: Order) => {
    setSelectedOrder(order);
    orderForm.setFieldsValue(order);
    fetch('/api/shop-order-logs?order_id=' + order.id).then(r => r.json()).then(d => setOrderLogs(Array.isArray(d) ? d : [])).catch(() => setOrderLogs([]));
    setOrderModalOpen(true);
  };

  const handleShip = async (order: Order) => {
    Modal.confirm({
      title: '确认发货',
      content: (
        <Form form={orderForm} layout="vertical">
          <Form.Item name="tracking_company" label="物流公司">
            <Select options={[
              { value: '顺丰速运', label: '顺丰速运' },
              { value: '圆通快递', label: '圆通快递' },
              { value: '中通快递', label: '中通快递' },
              { value: '韵达快递', label: '韵达快递' },
              { value: '申通快递', label: '申通快递' },
            ]} />
          </Form.Item>
          <Form.Item name="tracking_no" label="运单号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        const values = orderForm.getFieldsValue();
        await fetch(`/api/shop-orders/${order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_status: 'shipped',
            tracking_company: values.tracking_company,
            tracking_no: values.tracking_no
          })
        });
        message.success('发货成功');
        orderForm.resetFields();
        loadData();
      }
    });
  };

  const handleOrderAction = async (order: Order, action: string) => {
    try {
      if (action === 'shipped') {
        handleShip(order);
        return;
      }
      await fetch(`/api/shop-orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: action })
      });
      message.success('操作成功');
      loadData();
    } catch (e) {
      message.error('操作失败');
    }
  };

  // 确认线下支付收款
  const handleConfirmPay = async () => {
    if (!selectedOrder) return;
    try {
      setConfirmingPay(true);
      const res = await fetch(`/api/shop-orders/${selectedOrder.id}/confirm-pay`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        message.success('已确认收款，订单已生效');
        setSelectedOrder({ ...selectedOrder, pay_status: 'paid', order_status: 'paid', paid_at: new Date().toISOString() });
        loadData();
      } else {
        message.error(data.message || data.error || '确认失败');
      }
    } catch (e) {
      message.error('确认失败');
    } finally {
      setConfirmingPay(false);
    }
  };

  const handleEditGoods = (good: Goods) => {
    setEditingGoods(good);
    const mode: 'single' | 'multi' = (good.category_mode === 'multi' ? 'multi' : 'single');
    setCatMode(mode);
    let catIds: string[] = [];
    try { catIds = good.category_ids ? JSON.parse(good.category_ids as any) : []; } catch { catIds = []; }
    goodsForm.setFieldsValue({
      ...good,
      category_mode: mode,
      category_ids: mode === 'multi' ? catIds : [],
      images: good.images ? JSON.parse(good.images as any) : []
    });
    setGoodsImages(good.images ? JSON.parse(good.images as any) : []);
    let spMap: Record<string, string> = {};
    try { spMap = good.spec_images ? JSON.parse(good.spec_images as any) : {}; } catch { spMap = {}; }
    setSpecImages(spMap);
    let exArr: { key: string; value: string }[] = [];
    try { exArr = good.extend_data ? JSON.parse(good.extend_data as any) : []; } catch { exArr = []; }
    setExtendData(Array.isArray(exArr) ? exArr : []);
    // Load SKUs
    fetch(`/api/shop-goods-skus?goods_id=${good.id}`)
      .then(r => r.json())
      .then(skus => setSkuRows(Array.isArray(skus) ? skus : skus.list || []))
      .catch(() => setSkuRows([]));
    setGoodsModalOpen(true);
  };

  const handleSaveGoods = async () => {
    try {
      const values = await goodsForm.validateFields();
      if (values.category_mode === 'multi') {
        const ids: string[] = Array.isArray(values.category_ids) ? values.category_ids : [];
        values.category_id = ids[0] || '';
      }
      let goodsId = editingGoods?.id;
      if (editingGoods) {
        await fetch(`/api/shop-goods/${editingGoods.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values)
        });
        message.success('修改成功');
      } else {
        const res = await fetch('/api/shop-goods', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values)
        });
        const data = await res.json();
        goodsId = data.id || data.success ? 'g_' + Date.now() : undefined;
        message.success('添加成功');
      }
      // Save SKUs
      if (goodsId && skuRows.length > 0) {
        for (const row of skuRows) {
          const skuId = row.id || 'sk_' + Date.now() + '_' + Math.random().toString(36).slice(2,6);
          if (row.id) {
            await fetch(`/api/shop-goods-skus/${row.id}`, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...row, goods_id: goodsId, id: undefined })
            });
          } else {
            await fetch('/api/shop-goods-skus', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...row, id: skuId, goods_id: goodsId })
            });
          }
        }
      }
      setGoodsModalOpen(false);
      goodsForm.resetFields();
      setSkuRows([]);
      loadData();
    } catch (e) {
      message.error('保存失败');
    }
  };

  const handleDeleteGoods = async (id: string) => {
    try {
      await fetch(`/api/shop-goods/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      loadData();
    } catch (e) {
      message.error('删除失败');
    }
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

  const orderColumns = [
    { title: '订单号', dataIndex: 'order_no', key: 'order_no' },
    { title: '客户', dataIndex: 'user_name', key: 'user_name' },
    { title: '电话', dataIndex: 'user_phone', key: 'user_phone' },
    { title: '金额', dataIndex: 'pay_amount', key: 'pay_amount', render: (v: number) => `¥${v}` },
    { title: '订单状态', dataIndex: 'order_status', key: 'order_status', render: (v: string) => getOrderStatusTag(v) },
    { title: '下单时间', dataIndex: 'created_at', key: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <Space>
          <Button size="small" type="link" icon={<Eye size={14} />} onClick={() => viewOrder(record)}>详情</Button>
          {record.order_status === 'paid' && (
            <Button size="small" type="link" icon={<Truck size={14} />} onClick={() => handleShip(record)}>发货</Button>
          )}
          {record.order_status === 'shipped' && (
            <Button size="small" type="link" icon={<Check size={14} />} onClick={() => handleOrderAction(record, 'completed')}>完成</Button>
          )}
          {record.order_status === 'pending' && (
            <Popconfirm title="确认取消？" onConfirm={() => handleOrderAction(record, 'cancelled')}>
              <Button size="small" type="link" danger icon={<X size={14} />}>取消</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  const goodsColumns = [
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '价格', dataIndex: 'price', key: 'price', render: (v: number) => `¥${v}` },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    { title: '销量', dataIndex: 'sales_count', key: 'sales_count' },
    {
      title: '标签',
      key: 'tags',
      render: (_: any, record: Goods) => (
        <Space>
          {record.is_hot === 1 && <Tag color="red">热销</Tag>}
          {record.is_new === 1 && <Tag color="blue">新品</Tag>}
          {record.is_recommend === 1 && <Tag color="gold">推荐</Tag>}
        </Space>
      )
    },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={v === 'active' ? 'green' : 'default'}>{v === 'active' ? '上架' : '下架'}</Tag> },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Goods) => (
        <Space>
          <Button size="small" type="link" icon={<Edit size={14} />} onClick={() => handleEditGoods(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDeleteGoods(record.id)}>
            <Button size="small" type="link" danger icon={<Delete size={14} />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const reviewColumns = [
    { title: '商品', dataIndex: 'goods_name', key: 'goods_name', ellipsis: true, render: (v: string) => v || '-' },
    { title: '用户', dataIndex: 'user_name', key: 'user_name' },
    { title: '评分', dataIndex: 'rating', key: 'rating', render: (v: number) => <Tag color={v >= 4 ? 'green' : v >= 3 ? 'orange' : 'red'}>{v}分</Tag> },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true, width: 300 },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => (
      <Tag color={v === 'approved' ? 'green' : v === 'pending' ? 'orange' : 'default'}>{v === 'approved' ? '已审核' : v === 'pending' ? '待审核' : '已拒绝'}</Tag>
    )},
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Review) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button size="small" type="link" onClick={async () => {
                await fetch(`/api/shop-reviews/${record.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) });
                message.success('审核通过');
                loadData();
              }}>通过</Button>
              <Button size="small" type="link" danger onClick={async () => {
                await fetch(`/api/shop-reviews/${record.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) });
                message.success('已拒绝');
                loadData();
              }}>拒绝</Button>
            </>
          )}
        </Space>
      )
    }
  ];

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.order_status === 'pending').length,
    shippedOrders: orders.filter(o => o.order_status === 'shipped').length,
    completedOrders: orders.filter(o => o.order_status === 'completed').length,
    totalGoods: goods.length,
    lowStock: goods.filter(g => g.stock < 10).length
  };

  return (
    <div className="shop-admin">
      <Tabs activeKey={activeTab} onChange={(key) => { setActiveTab(key); setSearchParams(key === 'orders' ? {} : { tab: key }); }}>
        <TabPane tab={<span>订单管理 <Badge count={stats.pendingOrders} /></span>} key="orders">
          <Row gutter={16} className="stats-row">
            <Col span={6}><Statistic title="总订单" value={stats.totalOrders} /></Col>
            <Col span={6}><Statistic title="待付款" value={stats.pendingOrders} valueStyle={{ color: '#faad14' }} /></Col>
            <Col span={6}><Statistic title="已发货" value={stats.shippedOrders} valueStyle={{ color: '#1890ff' }} /></Col>
            <Col span={6}><Statistic title="已完成" value={stats.completedOrders} valueStyle={{ color: '#52c41a' }} /></Col>
          </Row>
          <Divider />
          <Table dataSource={orders} columns={orderColumns} rowKey="id" loading={loading} />
        </TabPane>

        <TabPane tab={<span>商品管理 <Badge count={stats.totalGoods} /></span>} key="goods">
          <Row gutter={16} className="stats-row">
            <Col span={6}><Statistic title="商品总数" value={stats.totalGoods} /></Col>
            <Col span={6}><Statistic title="低库存" value={stats.lowStock} valueStyle={{ color: '#f5222d' }} /></Col>
            <Col span={12}>
              <Button type="primary" icon={<Plus size={14} />} onClick={() => { setEditingGoods(null); goodsForm.resetFields(); setCatMode('single'); setGoodsImages([]); setSpecImages({}); setExtendData([]); setGoodsModalOpen(true); }}>
                添加商品
              </Button>
            </Col>
          </Row>
          <Divider />
          <Table dataSource={goods} columns={goodsColumns} rowKey="id" loading={loading} />
        </TabPane>

        <TabPane tab={<span>评价管理 <Badge count={reviews.length} /></span>} key="reviews">
          <Table dataSource={reviews} columns={reviewColumns} rowKey="id" loading={loading} />
        </TabPane>
        <TabPane tab="品牌管理" key="brands">
          <div style={{marginBottom:12}}>
            <Button type="primary" icon={<Plus size={14}/>} onClick={()=>{setEditingBrand(null);brandForm.resetFields();setBrandModalOpen(true)}}>新增品牌</Button>
          </div>
          <Table dataSource={brands} rowKey="id" size="small"
            columns={[
              {title:'品牌名称',dataIndex:'name',render:(t,r)=>t},
              {title:'描述',dataIndex:'description'},
              {title:'排序',dataIndex:'sort_order',width:80},
              {title:'状态',dataIndex:'is_active',width:80,render:(v)=><Tag color={v?'green':'default'}>{v?'启用':'停用'}</Tag>},
              {title:'操作',width:140,render:(_,r)=><Space>
                <Button size="small" type="link" icon={<Edit size={14}/>} onClick={()=>{setEditingBrand(r);brandForm.setFieldsValue(r);setBrandModalOpen(true)}}/>
                <Popconfirm title="确认删除?" onConfirm={async()=>{await fetch('/api/shop-brands/'+r.id,{method:'DELETE'});loadData();}}>
                  <Button size="small" type="link" danger icon={<Delete size={14}/>}/>
                </Popconfirm>
              </Space>}
            ]} />
          <Modal title={editingBrand?'编辑品牌':'新增品牌'} open={brandModalOpen}
            onOk={async()=>{
              const v=await brandForm.validateFields();
              const url=editingBrand?'/api/shop-brands/'+editingBrand.id:'/api/shop-brands';
              await fetch(url,{method:editingBrand?'PUT':'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(v)});
              message.success(editingBrand?'更新成功':'添加成功');
              setBrandModalOpen(false);loadData();
            }}
            onCancel={()=>setBrandModalOpen(false)}>
            <Form form={brandForm} layout="vertical">
              <Form.Item name="name" label="品牌名称" rules={[{required:true}]}><Input/></Form.Item>
              <Form.Item name="description" label="描述"><Input.TextArea rows={2}/></Form.Item>
              <Form.Item name="logo" label="Logo URL"><Input placeholder="https://..."/></Form.Item>
              <Form.Item name="sort_order" label="排序"><InputNumber min={0}/></Form.Item>
              <Form.Item name="is_active" label="启用" valuePropName="checked"><Switch/></Form.Item>
            </Form>
          </Modal>
        </TabPane>

        <TabPane tab="优惠券管理" key="coupons">
          <div style={{marginBottom:12}}><Button type="primary" icon={<Plus size={14}/>} onClick={()=>{setEditingCoupon(null);setCouponModalOpen(true)}}>新增优惠券</Button></div>
          <Table dataSource={coupons} rowKey="id" size="small"
            columns={[
              {title:'名称',dataIndex:'name'},{title:'类型',dataIndex:'type',width:80,render:(v:any)=><Tag color={v==='discount'?'blue':'green'}>{v==='discount'?'折扣':'满减'}</Tag>},
              {title:'面值',dataIndex:'value',width:80,render:(v:any,r:any)=>r.type==='discount'?v+'%':'¥'+v},
              {title:'门槛',dataIndex:'min_amount',width:80,render:(v:any)=>'¥'+v},
              {title:'已领/总量',width:100,render:(_:any,r:any)=><span>{r.received}/{r.total}</span>},
              {title:'状态',dataIndex:'status',width:80,render:(v:any)=><Tag>{v}</Tag>},
              {title:'操作',width:120,render:(_:any,r:any)=><Space>
                <Popconfirm title="删除?" onConfirm={async()=>{await fetch('/api/shop-coupons/'+r.id,{method:'DELETE'});loadData();}}>
                  <Button size="small" type="link" danger icon={<Delete size={14}/>}/>
                </Popconfirm>
              </Space>}
            ]} />
          <Modal title="新增优惠券" open={couponModalOpen}
            onOk={async()=>{
              const name=(document.getElementById('cp-name') as HTMLInputElement)?.value;
              const type=(document.getElementById('cp-type') as HTMLSelectElement)?.value;
              const value=parseFloat((document.getElementById('cp-value') as HTMLInputElement)?.value||'0');
              const min=parseFloat((document.getElementById('cp-min') as HTMLInputElement)?.value||'0');
              const total=parseInt((document.getElementById('cp-total') as HTMLInputElement)?.value||'0');
              if(!name) return message.warning('请输入名称');
              await fetch('/api/shop-coupons',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,type,value,min_amount:min,total,start_time:new Date().toISOString(),end_time:new Date(Date.now()+30*86400000).toISOString()})});
              message.success('创建成功');setCouponModalOpen(false);loadData();
            }}
            onCancel={()=>setCouponModalOpen(false)}>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label>名称</label><input id="cp-name" style={{width:'100%',padding:'4px 8px',border:'1px solid #d9d9d9',borderRadius:4,marginTop:4}} placeholder="优惠券名称"/></div>
              <div><label>类型</label><select id="cp-type" style={{width:'100%',padding:'4px 8px',border:'1px solid #d9d9d9',borderRadius:4,marginTop:4}}><option value="discount">折扣券</option><option value="reduction">满减券</option></select></div>
              <div><label>面值</label><input id="cp-value" type="number" style={{width:'100%',padding:'4px 8px',border:'1px solid #d9d9d9',borderRadius:4,marginTop:4}} defaultValue="10"/></div>
              <div><label>最低消费(元)</label><input id="cp-min" type="number" style={{width:'100%',padding:'4px 8px',border:'1px solid #d9d9d9',borderRadius:4,marginTop:4}} defaultValue="0"/></div>
              <div><label>发行总量</label><input id="cp-total" type="number" style={{width:'100%',padding:'4px 8px',border:'1px solid #d9d9d9',borderRadius:4,marginTop:4}} defaultValue="100"/></div>
            </div>
          </Modal>
        </TabPane>
        <TabPane tab="秒杀管理" key="seckill">
          <div style={{marginBottom:12}}><Button type="primary" icon={<Plus size={14}/>} onClick={()=>setSeckillModalOpen(true)}>新增秒杀</Button></div>
          <Table dataSource={seckills} rowKey="id" size="small"
            columns={[
              {title:'商品',render:(_:any,r:any)=><span>{r.goods?.name||r.goods_id}</span>},
              {title:'秒杀价',dataIndex:'seckill_price',width:100,render:(v:any)=><span style={{color:'#f5222d',fontWeight:'bold'}}>¥{v}</span>},
              {title:'库存',dataIndex:'seckill_stock',width:80},{title:'已售',dataIndex:'sold_count',width:80},
              {title:'时间',width:200,render:(_:any,r:any)=><span style={{fontSize:12}}>{(r.start_time||'').substring(0,16)}~{(r.end_time||'').substring(0,16)}</span>},
              {title:'操作',width:80,render:(_:any,r:any)=><Popconfirm title="删除?" onConfirm={async()=>{await fetch('/api/shop-seckill/'+r.id,{method:'DELETE'});loadData();}}><Button size="small" type="link" danger icon={<Delete size={14}/>}/></Popconfirm>}
            ]} />
          <Modal title="新增秒杀" open={seckillModalOpen}
            onOk={async()=>{
              const gid=(document.getElementById('sk-goods') as HTMLInputElement)?.value;
              const price=parseFloat((document.getElementById('sk-price') as HTMLInputElement)?.value||'0');
              const stock=parseInt((document.getElementById('sk-stock') as HTMLInputElement)?.value||'0');
              const start=(document.getElementById('sk-start') as HTMLInputElement)?.value;
              const endt=(document.getElementById('sk-end') as HTMLInputElement)?.value;
              if(!gid||!price) return message.warning('请填写商品ID和价格');
              await fetch('/api/shop-seckill',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goods_id:gid,seckill_price:price,seckill_stock:stock,start_time:new Date(start).toISOString(),end_time:new Date(endt).toISOString()})});
              message.success('创建成功');setSeckillModalOpen(false);loadData();
            }}
            onCancel={()=>setSeckillModalOpen(false)}>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div><label>商品ID</label><input id="sk-goods" style={{width:'100%',padding:'4px 8px',border:'1px solid #d9d9d9',borderRadius:4,marginTop:4}} placeholder="g_001"/></div>
              <div><label>秒杀价格 ¥</label><input id="sk-price" type="number" style={{width:'100%',padding:'4px 8px',border:'1px solid #d9d9d9',borderRadius:4,marginTop:4}}/></div>
              <div><label>秒杀库存</label><input id="sk-stock" type="number" style={{width:'100%',padding:'4px 8px',border:'1px solid #d9d9d9',borderRadius:4,marginTop:4}} defaultValue="50"/></div>
              <div><label>开始时间</label><input id="sk-start" type="datetime-local" style={{width:'100%',padding:'4px 8px',border:'1px solid #d9d9d9',borderRadius:4,marginTop:4}}/></div>
              <div><label>结束时间</label><input id="sk-end" type="datetime-local" style={{width:'100%',padding:'4px 8px',border:'1px solid #d9d9d9',borderRadius:4,marginTop:4}}/></div>
            </div>
          </Modal>
        </TabPane>

        <TabPane tab="拼团管理" key="groupbuy">
          <div style={{marginBottom:12}}><Button type="primary" icon={<Plus size={14}/>} onClick={()=>{
            const gid=(document.getElementById('gb-goods') as HTMLSelectElement)?.value;
            const price=parseFloat((document.getElementById('gb-price') as HTMLInputElement)?.value||'0');
            const size=parseInt((document.getElementById('gb-size') as HTMLInputElement)?.value||'2');
            const stock=parseInt((document.getElementById('gb-stock') as HTMLInputElement)?.value||'0');
            if(!gid||!price) return message.warning('请选择商品并填写拼团价');
            fetch('/api/shop-group-buy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goods_id:gid,group_price:price,group_size:size,group_stock:stock,start_time:new Date().toISOString(),end_time:new Date(Date.now()+15*86400000).toISOString()})}).then(()=>{message.success('创建成功');loadData();});
          }}>新增拼团</Button></div>
          <Table dataSource={groupBuys} rowKey="id" size="small"
            columns={[
              {title:'商品',render:(_:any,r:any)=><span>{r.goods?.name||r.goods_id}</span>},
              {title:'拼团价',dataIndex:'group_price',width:100,render:(v:any)=><span style={{color:'#f5222d',fontWeight:'bold'}}>¥{v}</span>},
              {title:'原价',render:(_:any,r:any)=><span>¥{r.goods?.price||'-'}</span>},
              {title:'成团人数',dataIndex:'group_size',width:90},
              {title:'库存',dataIndex:'group_stock',width:70},{title:'已售',dataIndex:'sold_count',width:70},
              {title:'状态',dataIndex:'status',width:90,render:(v:any)=><Tag color={v==='ongoing'?'green':v==='upcoming'?'orange':'default'}>{v==='ongoing'?'进行中':v==='upcoming'?'未开始':'已结束'}</Tag>},
              {title:'操作',width:160,render:(_:any,r:any)=><Space>
                <Button size="small" onClick={async()=>{
                  const uid=prompt('开团用户ID(留空用 u_test):','u_test');
                  await fetch('/api/shop-group-buy/'+r.id+'/open',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:uid||'u_test'})});
                  message.success('已开团');loadData();
                }}>开团</Button>
                <Popconfirm title="删除?" onConfirm={async()=>{await fetch('/api/shop-group-buy/'+r.id,{method:'DELETE'});loadData();}}>
                  <Button size="small" danger icon={<Delete size={14}/>}/>
                </Popconfirm>
              </Space>}
            ]} />
          <div style={{display:'none'}}>
            <select id="gb-goods">{allGoods.map((g:any)=><option key={g.id} value={g.id}>{g.name} (¥{g.price})</option>)}</select>
            <input id="gb-price" type="number"/><input id="gb-size" type="number" defaultValue="2"/><input id="gb-stock" type="number" defaultValue="50"/>
          </div>
        </TabPane>

        <TabPane tab="砍价管理" key="bargain">
          <div style={{marginBottom:12}}><Button type="primary" icon={<Plus size={14}/>} onClick={()=>{
            const gid=(document.getElementById('bg-goods') as HTMLSelectElement)?.value;
            const floor=parseFloat((document.getElementById('bg-floor') as HTMLInputElement)?.value||'0');
            const stock=parseInt((document.getElementById('bg-stock') as HTMLInputElement)?.value||'0');
            if(!gid||!floor) return message.warning('请选择商品并填写底价');
            fetch('/api/shop-bargain',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({goods_id:gid,floor_price:floor,bargain_stock:stock,start_time:new Date().toISOString(),end_time:new Date(Date.now()+15*86400000).toISOString()})}).then(()=>{message.success('创建成功');loadData();});
          }}>新增砍价</Button></div>
          <Table dataSource={bargains} rowKey="id" size="small"
            columns={[
              {title:'商品',render:(_:any,r:any)=><span>{r.goods?.name||r.goods_id}</span>},
              {title:'起始价',render:(_:any,r:any)=><span>¥{r.start_price||r.goods?.price||'-'}</span>},
              {title:'底价',dataIndex:'floor_price',width:100,render:(v:any)=><span style={{color:'#f5222d',fontWeight:'bold'}}>¥{v}</span>},
              {title:'库存',dataIndex:'bargain_stock',width:70},{title:'已售',dataIndex:'sold_count',width:70},
              {title:'操作',width:80,render:(_:any,r:any)=><Popconfirm title="删除?" onConfirm={async()=>{await fetch('/api/shop-bargain/'+r.id,{method:'DELETE'});loadData();}}><Button size="small" danger icon={<Delete size={14}/>}/></Popconfirm>}
            ]} />
          <div style={{display:'none'}}>
            <select id="bg-goods">{allGoods.map((g:any)=><option key={g.id} value={g.id}>{g.name} (¥{g.price})</option>)}</select>
            <input id="bg-floor" type="number" placeholder="底价"/><input id="bg-stock" type="number" defaultValue="50"/>
          </div>
        </TabPane>

        <TabPane tab="会员等级" key="member">
          <div style={{marginBottom:12}}><Button type="primary" icon={<Plus size={14}/>} onClick={()=>{
            const name=prompt('等级名称:');
            if(!name)return;
            const min=parseInt(prompt('升级所需积分:','500')||'500');
            const disc=parseFloat(prompt('折扣(0.85表示85折):','0.95')||'0.95');
            fetch('/api/shop-member-levels',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,min_points:min,discount:disc,level:memberLevels.length+1})}).then(()=>{message.success('添加成功');loadData();});
          }}>新增等级</Button></div>
          <Table dataSource={memberLevels} rowKey="id" size="small"
            columns={[
              {title:'等级',dataIndex:'level',width:70},
              {title:'名称',render:(_:any,r:any)=><span>{(r.icon||'')+' '+r.name}</span>},
              {title:'所需积分',dataIndex:'min_points',width:100},
              {title:'折扣',dataIndex:'discount',width:90,render:(v:any)=><Tag color="blue">{(v*10).toFixed(1)}折</Tag>},
              {title:'描述',dataIndex:'description',ellipsis:true},
              {title:'操作',width:80,render:(_:any,r:any)=><Popconfirm title="删除?" onConfirm={async()=>{await fetch('/api/shop-member-levels/'+r.id,{method:'DELETE'});loadData();}}><Button size="small" danger icon={<Delete size={14}/>}/></Popconfirm>}
            ]} />
        </TabPane>

        <TabPane tab="导航管理" key="navigation">
          <div style={{marginBottom:12}}><Button type="primary" size="small" onClick={async()=>{
            const name=prompt('导航名称:');
            if(name){await fetch('/api/shop-navigation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,type:'header',link_type:'page',sort_order:0})});loadData();}
          }}>添加导航</Button></div>
          <Table dataSource={navItems} rowKey="id" size="small" columns={[
            {title:'名称',dataIndex:'name'},
            {title:'类型',dataIndex:'type',width:80},
            {title:'链接类型',dataIndex:'link_type',width:80},
            {title:'链接地址',dataIndex:'link_url',ellipsis:true},
            {title:'排序',dataIndex:'sort_order',width:60},
            {title:'操作',width:80,render:(_:any,r:any)=><Button size="small" danger onClick={async()=>{await fetch('/api/shop-navigation/'+r.id,{method:'DELETE'});loadData();}}>删除</Button>}
          ]} />
        </TabPane>

        <TabPane tab="快递管理" key="express">
          <div style={{marginBottom:12}}><Button type="primary" size="small" onClick={async()=>{
            const name=prompt('快递公司:');
            const code=prompt('编码(如 sf):');
            if(name){await fetch('/api/shop-express',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,code})});loadData();}
          }}>添加快递</Button></div>
          <Table dataSource={expressList} rowKey="id" size="small" columns={[
            {title:'名称',dataIndex:'name'},{title:'编码',dataIndex:'code',width:80},{title:'网址',dataIndex:'website',ellipsis:true},{title:'电话',dataIndex:'phone',width:120},
              {title:'操作',width:80,render:(_:any,r:any)=><Button size="small" danger onClick={async()=>{await fetch('/api/shop-express/'+r.id,{method:'DELETE'});loadData();}}>删除</Button>}
          ]} />
        </TabPane>

        <TabPane tab="分销管理" key="distribution">
          <Card size="small" title="分销配置" style={{marginBottom:12}}>
            <Space wrap>
              <span>分销开关:</span>
              <Switch checked={distConfig.is_open===1} onChange={async(v:any)=>{await fetch('/api/shop-distribution-config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...distConfig,is_open:v?1:0})});setDistConfig({...distConfig,is_open:v?1:0});message.success('已保存');}} />
              <span>分销层级:</span>
              <Select value={distConfig.level_mode} style={{width:120}} onChange={async(v:any)=>{await fetch('/api/shop-distribution-config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...distConfig,level_mode:v})});setDistConfig({...distConfig,level_mode:v});}} options={[{value:1,label:'一级'},{value:2,label:'二级'},{value:3,label:'三级'}]} />
              <span>佣金基数:</span>
              <Select value={distConfig.commission_base} style={{width:140}} onChange={async(v:any)=>{await fetch('/api/shop-distribution-config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...distConfig,commission_base:v})});setDistConfig({...distConfig,commission_base:v});}} options={[{value:'pay',label:'实付金额'},{value:'goods',label:'商品金额'}]} />
            </Space>
          </Card>

          <Card size="small" title="分销等级" style={{marginBottom:12}}>
            <Space style={{marginBottom:8}} wrap>
              <Input placeholder="等级名称" value={newLevel.name} onChange={e=>setNewLevel({...newLevel,name:e.target.value})} />
              <Input placeholder="一级比例" type="number" style={{width:90}} value={newLevel.rate1} onChange={e=>setNewLevel({...newLevel,rate1:parseFloat(e.target.value)||0})} />
              <Input placeholder="二级比例" type="number" style={{width:90}} value={newLevel.rate2} onChange={e=>setNewLevel({...newLevel,rate2:parseFloat(e.target.value)||0})} />
              <Input placeholder="三级比例" type="number" style={{width:90}} value={newLevel.rate3} onChange={e=>setNewLevel({...newLevel,rate3:parseFloat(e.target.value)||0})} />
              <Button type="primary" size="small" onClick={async()=>{if(!newLevel.name){message.warning('请输入名称');return;}await fetch('/api/shop-distribution-levels',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...newLevel,level:distLevels.length+1})});setNewLevel({name:'',rate1:0,rate2:0,rate3:0});loadData();}}>添加等级</Button>
            </Space>
            <Table dataSource={distLevels} rowKey="id" size="small" pagination={false} columns={[
              {title:'名称',dataIndex:'name'},{title:'等级',dataIndex:'level',width:60},{title:'一级',dataIndex:'rate1',render:(v:any)=>v?Math.round(v*100)+'%':'-'},{title:'二级',dataIndex:'rate2',render:(v:any)=>v?Math.round(v*100)+'%':'-'},{title:'三级',dataIndex:'rate3',render:(v:any)=>v?Math.round(v*100)+'%':'-'},
              {title:'操作',width:70,render:(_:any,r:any)=><Popconfirm title="删除?" onConfirm={async()=>{await fetch('/api/shop-distribution-levels/'+r.id,{method:'DELETE'});loadData();}}><Button size="small" type="link" danger>删除</Button></Popconfirm>}
            ]} />
          </Card>

          <Card size="small" title="分销商" style={{marginBottom:12}}>
            <Table dataSource={distMembers} rowKey="id" size="small" pagination={false} columns={[
              {title:'用户',render:(_:any,r:any)=>r.user?.name||r.user_name||r.user_id},
              {title:'邀请码',dataIndex:'invite_code',width:100},
              {title:'上级',render:(_:any,r:any)=>r.parent?r.parent.name||r.parent_id:'-'},
              {title:'等级',render:(_:any,r:any)=>r.level?.name||'-'},
              {title:'佣金总额',dataIndex:'total_commission',render:(v:any)=>'¥'+(v||0)},
              {title:'可提现',dataIndex:'withdrawable',render:(v:any)=>'¥'+(v||0)},
              {title:'团队',dataIndex:'team_count',width:60},
              {title:'状态',dataIndex:'status',render:(v:string)=><Tag color={v==='approved'?'green':v==='rejected'?'red':'orange'}>{v==='approved'?'已通过':v==='rejected'?'已拒绝':'待审核'}</Tag>},
              {title:'操作',width:150,render:(_:any,r:any)=><Space><Popconfirm title="通过?" onConfirm={async()=>{await fetch('/api/shop-distribution-members/'+r.id+'/approve',{method:'POST'});loadData();}}><Button size="small" type="link">通过</Button></Popconfirm><Popconfirm title="拒绝?" onConfirm={async()=>{await fetch('/api/shop-distribution-members/'+r.id+'/reject',{method:'POST'});loadData();}}><Button size="small" type="link" danger>拒绝</Button></Popconfirm><Popconfirm title="删除?" onConfirm={async()=>{await fetch('/api/shop-distribution-members/'+r.id,{method:'DELETE'});loadData();}}><Button size="small" type="link" danger>删</Button></Popconfirm></Space>}
            ]} />
          </Card>

          <Card size="small" title="佣金订单" style={{marginBottom:12}}>
            <Table dataSource={distOrders} rowKey="id" size="small" pagination={false} columns={[
              {title:'订单',render:(_:any,r:any)=>r.order?.order_no||r.order_id},
              {title:'分销商',render:(_:any,r:any)=>r.distributor?.name||r.distributor_id},
              {title:'买家',render:(_:any,r:any)=>r.buyer?.name||r.buyer_id||'-'},
              {title:'层级',dataIndex:'distribute_level',width:60,render:(v:any)=>v+'级'},
              {title:'佣金',dataIndex:'commission',render:(v:any)=><span style={{color:'#f5222d'}}>¥{v}</span>},
              {title:'状态',dataIndex:'status',render:(v:string)=><Tag color={v==='settled'?'green':'orange'}>{v==='settled'?'已结算':'待结算'}</Tag>},
            ]} />
          </Card>

          <Card size="small" title="提现审核">
            <Table dataSource={distWithdraws} rowKey="id" size="small" pagination={false} columns={[
              {title:'用户',render:(_:any,r:any)=>r.user_name||r.user_id},
              {title:'金额',dataIndex:'amount',render:(v:any)=>'¥'+v},
              {title:'账户',dataIndex:'account'},
              {title:'状态',dataIndex:'status',render:(v:string)=><Tag color={v==='done'?'green':v==='rejected'?'red':'orange'}>{v==='done'?'已打款':v==='rejected'?'已拒绝':'待处理'}</Tag>},
              {title:'操作',width:140,render:(_:any,r:any)=><Space><Popconfirm title="打款?" onConfirm={async()=>{await fetch('/api/shop-distribution-withdraw/'+r.id+'/done',{method:'POST'});loadData();}}><Button size="small" type="link">打款</Button></Popconfirm><Popconfirm title="拒绝?" onConfirm={async()=>{await fetch('/api/shop-distribution-withdraw/'+r.id+'/reject',{method:'POST'});loadData();}}><Button size="small" type="link" danger>拒绝</Button></Popconfirm></Space>}
            ]} />
          </Card>
        </TabPane>

        <TabPane tab="仓库管理" key="warehouse">
          <Card size="small" title="仓库列表" style={{marginBottom:12}}>
            <Space style={{marginBottom:8}} wrap>
              <Input placeholder="仓库名称" value={newWh.name} onChange={e=>setNewWh({...newWh,name:e.target.value})} />
              <Input placeholder="编码" style={{width:100}} value={newWh.code} onChange={e=>setNewWh({...newWh,code:e.target.value})} />
              <Input placeholder="联系人" style={{width:100}} value={newWh.contact} onChange={e=>setNewWh({...newWh,contact:e.target.value})} />
              <Button type="primary" size="small" onClick={async()=>{if(!newWh.name){message.warning('请输入仓库名称');return;}await fetch('/api/shop-warehouses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(newWh)});setNewWh({name:'',code:'',address:'',contact:'',remark:'',is_default:false});loadData();}}>添加仓库</Button>
            </Space>
            <Table dataSource={warehouses} rowKey="id" size="small" pagination={false} columns={[
              {title:'名称',dataIndex:'name'},
              {title:'编码',dataIndex:'code',width:80},
              {title:'联系人',dataIndex:'contact',width:90},
              {title:'默认',dataIndex:'is_default',width:70,render:(v:any)=>v? <Tag color="blue">默认</Tag> : '-'},
              {title:'状态',dataIndex:'status',width:70,render:(v:any)=>v? <Tag color="green">启用</Tag> : <Tag color="red">停用</Tag>},
              {title:'操作',width:150,render:(_:any,r:any)=><Space>
                {!r.is_default && <Popconfirm title="设为默认?" onConfirm={async()=>{await fetch('/api/shop-warehouses/'+r.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({is_default:1})});loadData();}}><Button size="small" type="link">默认</Button></Popconfirm>}
                <Popconfirm title="删除?" onConfirm={async()=>{await fetch('/api/shop-warehouses/'+r.id,{method:'DELETE'});loadData();}}><Button size="small" type="link" danger>删除</Button></Popconfirm>
              </Space>}
            ]} />
          </Card>

          <Card size="small" title="库存调整（正数入库 / 负数出库）" style={{marginBottom:12}}>
            <Row gutter={8}>
              <Col><Select style={{width:140}} placeholder="仓库" value={adjustForm.warehouse_id} onChange={v=>setAdjustForm({...adjustForm,warehouse_id:v})} options={warehouses.map((w:any)=>({value:w.id,label:w.name}))} /></Col>
              <Col><Select style={{width:220}} showSearch optionFilterProp="label" placeholder="商品" value={adjustForm.goods_id} onChange={v=>setAdjustForm({...adjustForm,goods_id:v})} options={allGoods.map((g:any)=>({value:g.id,label:g.name}))} /></Col>
              <Col><Input style={{width:120}} placeholder="SKU" value={adjustForm.sku_code} onChange={e=>setAdjustForm({...adjustForm,sku_code:e.target.value})} /></Col>
              <Col><Input style={{width:90}} type="number" placeholder="数量" value={adjustForm.num} onChange={e=>setAdjustForm({...adjustForm,num:parseInt(e.target.value)||0})} /></Col>
              <Col><Select style={{width:110}} value={adjustForm.type} onChange={v=>setAdjustForm({...adjustForm,type:v})} options={[{value:'in',label:'入库'},{value:'out',label:'出库'},{value:'adjust',label:'盘点'},{value:'return',label:'退货'}]} /></Col>
              <Col><Input style={{width:140}} placeholder="备注" value={adjustForm.remark} onChange={e=>setAdjustForm({...adjustForm,remark:e.target.value})} /></Col>
              <Col><Button type="primary" size="small" onClick={async()=>{if(!adjustForm.warehouse_id||!adjustForm.goods_id||!adjustForm.num){message.warning('请选择仓库/商品并填写数量');return;}await fetch('/api/shop-warehouse/adjust',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(adjustForm)});message.success('已调整');loadData();}}>提交</Button></Col>
            </Row>
          </Card>

          <Card size="small" title="仓库库存" style={{marginBottom:12}}>
            <Table dataSource={warehouseGoods} rowKey="id" size="small" pagination={false} columns={[
              {title:'商品',render:(_:any,r:any)=>r.goods?r.goods.name:r.goods_id},
              {title:'SKU',dataIndex:'sku_code',width:100},
              {title:'库存',dataIndex:'stock',width:80},
              {title:'冻结',dataIndex:'freeze_stock',width:70}
            ]} />
          </Card>

          <Card size="small" title="库存变动日志">
            <Table dataSource={stockLogs} rowKey="id" size="small" pagination={{pageSize:8}} columns={[
              {title:'时间',dataIndex:'created_at',width:160,render:(v:any)=>v?new Date(v).toLocaleString():''},
              {title:'仓库',render:(_:any,r:any)=>{const w=warehouses.find((x:any)=>x.id===r.warehouse_id);return w?w.name:'-';}},
              {title:'商品',render:(_:any,r:any)=>{const g=allGoods.find((x:any)=>x.id===r.goods_id);return g?g.name:r.goods_id;}},
              {title:'类型',dataIndex:'type',width:80,render:(v:any)=>{const m:any={in:['green','入库'],out:['red','出库'],adjust:['blue','盘点'],order:['orange','订单'],return:['purple','退货']};const c=m[v]||['default',v];return <Tag color={c[0]}>{c[1]}</Tag>;}},
              {title:'数量',dataIndex:'num',width:70,render:(v:any)=><span style={{color:v<0?'#f5222d':'#52c41a'}}>{v>0?('+'+v):v}</span>},
              {title:'结余',dataIndex:'after_stock',width:70},
              {title:'备注',dataIndex:'remark'}
            ]} />
          </Card>
        </TabPane>

        <TabPane tab="售后管理" key="aftersale">
          <Card size="small">
            <Table
              dataSource={aftersaleList}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              columns={[
                { title: '售后单号', dataIndex: 'id', width: 170, render: (v:any)=><span style={{fontSize:12}}>{v}</span> },
                { title: '订单号', width: 150, render: (_:any,r:any)=> r.order?.order_no || r.order_id },
                { title: '用户', width: 110, render: (_:any,r:any)=> r.order?.user_name || r.user_id },
                { title: '类型', dataIndex: 'type', width: 90, render: (v:any)=> v==='return'?<Tag color="purple">退货退款</Tag>:<Tag color="orange">仅退款</Tag> },
                { title: '退款金额', dataIndex: 'refund_amount', width: 90, render: (v:any)=> '¥'+(v||0) },
                { title: '状态', dataIndex: 'status', width: 110, render: (v:any)=> aftersaleStatusTag(v) },
                { title: '申请时间', dataIndex: 'created_at', width: 160, render: (v:any)=> v?new Date(v).toLocaleString():'' },
                { title: '操作', width: 120, render: (_:any,r:any)=> <Button size="small" type="link" onClick={()=>openAftersale(r)}>处理</Button> }
              ]}
            />
          </Card>
        </TabPane>

      </Tabs>

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={orderModalOpen}
        onCancel={() => setOrderModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <Form layout="vertical">
            <Row gutter={16}>
              <Col span={12}><Form.Item label="订单号">{selectedOrder.order_no}</Form.Item></Col>
              <Col span={12}><Form.Item label="订单状态">{getOrderStatusTag(selectedOrder.order_status)}</Form.Item></Col>
              <Col span={12}><Form.Item label="客户姓名">{selectedOrder.user_name}</Form.Item></Col>
              <Col span={12}><Form.Item label="联系电话">{selectedOrder.user_phone}</Form.Item></Col>
              <Col span={24}><Form.Item label="收货地址">{selectedOrder.shipping_address}</Form.Item></Col>
              <Col span={12}><Form.Item label="商品总额">¥{selectedOrder.total_amount}</Form.Item></Col>
              <Col span={12}><Form.Item label="实付金额" style={{ color: '#f5222d', fontWeight: 'bold' }}>¥{selectedOrder.pay_amount}</Form.Item></Col>
            </Row>
            <Divider>商品清单</Divider>
            {selectedOrder.items?.map((item: any, idx: number) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span>{item.goods_name || item.product_name} x {item.quantity}</span>
                <span>¥{item.amount || item.price * item.quantity}</span>
              </div>
            ))}
            {selectedOrder.pay_status === 'offline_pending' && (
              <div style={{ marginTop: 16, padding: 12, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 6 }}>
                <p style={{ margin: '0 0 8px' }}>该订单采用<strong>线下支付</strong>，等待管理员确认收款后订单方可生效。</p>
                <Button type="primary" loading={confirmingPay} onClick={handleConfirmPay}>确认已收款</Button>
              </div>
            )}
            <Divider>订单追溯</Divider>
            {orderLogs.length === 0 ? (
              <div style={{ color: '#999', fontSize: 12 }}>暂无追溯记录</div>
            ) : (
              <Timeline
                items={orderLogs.map((l: any) => ({
                  color: l.action.startsWith('aftersale') ? 'orange' : 'blue',
                  children: (
                    <div style={{ fontSize: 13 }}>
                      <div><strong>{ORDER_LOG_LABEL[l.action] || l.action}</strong> <span style={{ color: '#999' }}>· {l.operator}</span></div>
                      {l.remark ? <div style={{ color: '#666' }}>{l.remark}</div> : null}
                      <div style={{ color: '#bbb', fontSize: 12 }}>{l.created_at}</div>
                    </div>
                  )
                }))}
              />
            )}
          </Form>
        )}
      </Modal>

      {/* 商品编辑弹窗 - 10 Tab */}
      <Modal
        title={editingGoods ? '编辑商品' : '添加商品'}
        open={goodsModalOpen}
        onOk={handleSaveGoods}
        onCancel={() => setGoodsModalOpen(false)}
        width={900}
      >
        <Form form={goodsForm} layout="vertical">
          <Tabs defaultActiveKey="base" tabBarStyle={{ marginBottom: 12 }}>
            <TabPane tab="基础" key="base">
              <Row gutter={16}>
                <Col span={16}><Form.Item name="name" label="商品名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="sku" label="商品编码"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="price" label="价格" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}><Form.Item name="original_price" label="原价"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}><Form.Item name="stock" label="库存" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}>
                  <Form.Item name="category_mode" label="分类模式" initialValue="single">
                    <Select
                      onChange={(v: 'single' | 'multi') => {
                        setCatMode(v);
                        if (v === 'multi') { goodsForm.setFieldValue('category_id', ''); }
                        else { goodsForm.setFieldValue('category_ids', []); }
                      }}
                      options={[{label:'单分类', value:'single'}, {label:'多分类', value:'multi'}]}
                    />
                  </Form.Item>
                </Col>
                {catMode === 'single' ? (
                  <Col span={8}><Form.Item name="category_id" label="主分类">
                    <Select allowClear placeholder="选择分类" showSearch optionFilterProp="label"
                      onChange={(v) => { goodsForm.setFieldValue('category_id', v); }}
                      options={categoryTree.flatMap((cat:any) => [
                        {label: cat.name, value: cat.id},
                        ...(cat.children||[]).map((sub:any) => ({label: '  '+sub.name, value: sub.id}))
                      ])} />
                  </Form.Item></Col>
                ) : (
                  <Col span={16}><Form.Item name="category_ids" label="所属分类（可多选）">
                    <Select mode="multiple" allowClear placeholder="选择多个分类" showSearch optionFilterProp="label"
                      onChange={(v: string[]) => { goodsForm.setFieldValue('category_ids', v); }}
                      options={categoryTree.flatMap((cat:any) => [
                        {label: cat.name, value: cat.id},
                        ...(cat.children||[]).map((sub:any) => ({label: '  '+sub.name, value: sub.id}))
                      ])} />
                  </Form.Item></Col>
                )}
                <Col span={8}><Form.Item name="brand_id" label="品牌">
                  <Select allowClear placeholder="选择品牌">
                    {brands.map((b:any) => <Select.Option key={b.id} value={b.id}>{b.name}</Select.Option>)}
                  </Select>
                </Form.Item></Col>
                <Col span={12}><Form.Item name="sub_title" label="副标题"><Input placeholder="商品卖点副标题" /></Form.Item></Col>
                <Col span={6}><Form.Item name="title_color" label="标题颜色"><ColorPicker showText /></Form.Item></Col>
                <Col span={6}><Form.Item name="sort_order" label="排序"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}><Form.Item name="is_hot" label="热销" valuePropName="checked"><Switch /></Form.Item></Col>
                <Col span={8}><Form.Item name="is_new" label="新品" valuePropName="checked"><Switch /></Form.Item></Col>
                <Col span={8}><Form.Item name="is_recommend" label="推荐" valuePropName="checked"><Switch /></Form.Item></Col>
              </Row>
            </TabPane>
            <TabPane tab="规格" key="spec">
              <Divider>SKU规格管理</Divider>
              <div style={{marginBottom:8,display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <Button size="small" onClick={()=>setSkuRows([...skuRows,{spec_values:'',price:0,original_price:0,stock:0,sku_code:''}])}>添加规格</Button>
                <Button size="small" type="dashed" onClick={()=>{
                  const spec1=prompt('规格组1 (如 颜色:红,蓝,白)','颜色:红,蓝,白');
                  const spec2=prompt('规格组2 (如 尺寸:S,M,L 或留空)','尺寸:S,M,L');
                  if(!spec1)return;
                  const parseSpec=(s:string)=>{const [name,vals]=s.split(':');return vals?vals.split(',').map(v=>({name,v:v.trim()})):[];};
                  const g1=parseSpec(spec1),g2=parseSpec(spec2||'');
                  let combos:string[][]=g1.map(v=>[v.v.trim()]);
                  if(g2.length>0){
                    const result:string[][]=[];
                    combos.forEach(c=>g2.forEach(v=>result.push([...c,v.v.trim()])));
                    combos=result;
                  }
                  const newRows=combos.map(c=>({spec_values:c.join('/'),price:0,original_price:0,stock:0,sku_code:''}));
                  const existing=skuRows.filter(r=>r.spec_values).map(r=>r.spec_values);
                  const filtered=newRows.filter(r=>!existing.includes(r.spec_values));
                  setSkuRows([...skuRows,...filtered]);
                  if(filtered.length>0)message.success(`生成${filtered.length}个规格组合`);
                }}>笛卡尔积生成</Button>
                {skuRows.length > 0 && <Button size="small" danger type="text" onClick={()=>{setSkuRows([]);message.info('已清空');}}>清空全部</Button>}
                {skuRows.length > 0 && (
                  <Popover title="批量填充到所有规格" content={
                    <div style={{ width: 220 }}>
                      <div style={{ marginBottom: 6 }}><InputNumber size="small" style={{ width: '100%' }} placeholder="统一价格" id="batch-price" /></div>
                      <div style={{ marginBottom: 6 }}><InputNumber size="small" style={{ width: '100%' }} placeholder="统一库存" id="batch-stock" /></div>
                      <div style={{ marginBottom: 6 }}><Input size="small" style={{ width: '100%' }} placeholder="编码前缀" id="batch-code" /></div>
                      <Button size="small" type="primary" block onClick={() => {
                        const p = parseFloat((document.getElementById('batch-price') as HTMLInputElement)?.value || '') || 0;
                        const s = parseInt((document.getElementById('batch-stock') as HTMLInputElement)?.value || '') || 0;
                        const code = (document.getElementById('batch-code') as HTMLInputElement)?.value || '';
                        const arr = skuRows.map((r: any, i: number) => ({
                          ...r,
                          price: p || r.price, stock: s || r.stock,
                          sku_code: code ? `${code}${String(i + 1).padStart(3, '0')}` : r.sku_code
                        }));
                        setSkuRows(arr);
                        message.success('已批量填充 ' + arr.length + ' 个规格');
                      }}>应用到全部</Button>
                    </div>
                  }>
                    <Button size="small">批量填充</Button>
                  </Popover>
                )}
              </div>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr style={{background:'#fafafa'}}>
                  <th style={{border:'1px solid #eee',padding:4}}>规格值</th>
                  <th style={{border:'1px solid #eee',padding:4,width:80}}>价格</th>
                  <th style={{border:'1px solid #eee',padding:4,width:80}}>原价</th>
                  <th style={{border:'1px solid #eee',padding:4,width:60}}>库存</th>
                  <th style={{border:'1px solid #eee',padding:4,width:90}}>编码</th>
                  <th style={{border:'1px solid #eee',padding:4,width:40}}></th>
                </tr></thead>
                <tbody>
                  {skuRows.map((row:any,i:number)=>(
                    <tr key={i}>
                      <td style={{border:'1px solid #eee',padding:2}}><input style={{width:'100%',border:'none',padding:4}} value={row.spec_values}
                        onChange={e=>{const r=[...skuRows];r[i].spec_values=e.target.value;setSkuRows(r)}} placeholder="如: 红色/S"/></td>
                      <td style={{border:'1px solid #eee',padding:2}}><input type="number" style={{width:'100%',border:'none',padding:4}} value={row.price}
                        onChange={e=>{const r=[...skuRows];r[i].price=parseFloat(e.target.value)||0;setSkuRows(r)}}/></td>
                      <td style={{border:'1px solid #eee',padding:2}}><input type="number" style={{width:'100%',border:'none',padding:4}} value={row.original_price}
                        onChange={e=>{const r=[...skuRows];r[i].original_price=parseFloat(e.target.value)||0;setSkuRows(r)}}/></td>
                      <td style={{border:'1px solid #eee',padding:2}}><input type="number" style={{width:'100%',border:'none',padding:4}} value={row.stock}
                        onChange={e=>{const r=[...skuRows];r[i].stock=parseInt(e.target.value)||0;setSkuRows(r)}}/></td>
                      <td style={{border:'1px solid #eee',padding:2}}><input style={{width:'100%',border:'none',padding:4}} value={row.sku_code}
                        onChange={e=>{const r=[...skuRows];r[i].sku_code=e.target.value;setSkuRows(r)}}/></td>
                      <td style={{border:'1px solid #eee',padding:2,textAlign:'center'}}>
                        <Button size="small" type="link" danger onClick={()=>{const r=[...skuRows];r.splice(i,1);setSkuRows(r)}}>X</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Divider>规格图片绑定（选择规格值时切换对应主图）</Divider>
              {(() => {
                const vals: string[] = Array.from(new Set(skuRows.flatMap((r: any) => (r.spec_values || '').split('/').map((v: string) => v.trim()).filter(Boolean))));
                if (vals.length === 0) return <div style={{ color: '#999', fontSize: 12 }}>先生成规格组合，再为每个规格值绑定图片</div>;
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {vals.map((v: string) => (
                      <div key={v} style={{ width: 120, border: '1px solid #eee', borderRadius: 4, padding: 6 }}>
                        <div style={{ fontSize: 12, marginBottom: 4, fontWeight: 500 }}>{v}</div>
                        <div style={{ width: '100%', height: 80, border: '1px dashed #ccc', borderRadius: 4, overflow: 'hidden', marginBottom: 4, background: '#fafafa' }}>
                          {specImages[v] ? <img src={specImages[v]} alt={v} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                        </div>
                        <input style={{ width: '100%', fontSize: 11, border: '1px solid #ddd', borderRadius: 3, padding: 3 }}
                          placeholder="图片URL" value={specImages[v] || ''}
                          onChange={(e) => syncSpecImages({ ...specImages, [v]: e.target.value })} />
                      </div>
                    ))}
                  </div>
                );
              })()}
            </TabPane>
            <TabPane tab="参数" key="param">
              <Form.Item name="param_data" label="商品参数(JSON)">
                <Input.TextArea rows={6} placeholder='{"材质":"金属","产地":"深圳"}' />
              </Form.Item>
            </TabPane>
            <TabPane tab="相册" key="album">
              <Row gutter={16}>
                <Col span={12}><Form.Item name="main_image" label="主图URL"><Input placeholder="https://..." /></Form.Item></Col>
                <Col span={12}><Form.Item name="video_url" label="视频URL"><Input placeholder="商品视频地址" /></Form.Item></Col>
                <Col span={24}>
                  <div style={{marginBottom:6,color:'#888',fontSize:12}}>商品相册（拖拽缩略图可排序，顺序即展示顺序；点「主」设为主图）</div>
                  <Form.Item name="images" hidden><Input /></Form.Item>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                    {goodsImages.map((img, idx) => (
                      <div key={idx} draggable
                        onDragStart={() => setDragImgIndex(idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); reorderImages(dragImgIndex, idx); setDragImgIndex(-1); }}
                        style={{ position:'relative', width:92, height:92, border:'1px solid #ddd', borderRadius:4, overflow:'hidden', cursor:'grab', background:'#fafafa' }}>
                        <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        <div style={{ position:'absolute', top:0, left:0, right:0, background:'rgba(0,0,0,.5)', color:'#fff', fontSize:11, padding:'2px 4px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span>#{idx + 1}</span>
                          <span style={{ cursor:'pointer' }} onClick={() => setMainImage(img)}>设主图</span>
                        </div>
                        <span style={{ position:'absolute', bottom:0, right:0, background:'rgba(255,0,0,.75)', color:'#fff', fontSize:12, padding:'0 6px', cursor:'pointer' }} onClick={() => removeImage(idx)}>×</span>
                      </div>
                    ))}
                    <label style={{ width:92, height:92, border:'1px dashed #999', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#999', fontSize:12 }}>
                      + 上传图片
                      <input type="file" accept="image/*" multiple style={{ display:'none' }}
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files) return;
                          const urls: string[] = [];
                          for (let i = 0; i < files.length; i++) {
                            const fd = new FormData(); fd.append('file', files[i]);
                            const r = await fetch('/api/upload', { method:'POST', body: fd });
                            const d = await r.json();
                            if (d.url) urls.push(d.url);
                          }
                          if (urls.length) { syncImages([...goodsImages, ...urls]); message.success(`上传${urls.length}张`); }
                          e.target.value = '';
                        }} />
                    </label>
                  </div>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="APP" key="app">
              <Form.Item name="mobile_content" label="手机端详情(H5)">
                <RichTextEditor placeholder="手机端专属详情..." height={280} />
              </Form.Item>
            </TabPane>
            <TabPane tab="WEB" key="web">
              <Form.Item name="description" label="电脑端详情">
                <RichTextEditor placeholder="输入商品详细介绍..." height={350} />
              </Form.Item>
            </TabPane>
            <TabPane tab="虚拟" key="virtual">
              <Row gutter={16}>
                <Col span={12}><Form.Item name="virtual_stock" label="虚拟库存"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={12}><Form.Item name="status" label="状态"><Select options={[{label:'上架',value:'on'},{label:'下架',value:'off'}]} /></Form.Item></Col>
              </Row>
            </TabPane>
            <TabPane tab="扩展" key="ext">
              <div style={{ marginBottom: 10 }}>
                <Button size="small" onClick={() => setExtendModalOpen(true)}>管理扩展数据（{extendData.length} 项）</Button>
                <span style={{ marginLeft: 8, color: '#999', fontSize: 12 }}>自定义键值对，随商品保存并在详情页展示</span>
              </div>
              <Row gutter={16}>
                <Col span={8}><Form.Item name="cost_price" label="成本价"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}><Form.Item name="gift_points" label="赠送积分"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}><Form.Item name="barcode" label="条形码"><Input /></Form.Item></Col>
                <Col span={8}><Form.Item name="unit" label="单位"><Input placeholder="件/个/箱" /></Form.Item></Col>
                <Col span={8}><Form.Item name="weight" label="重量(g)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
                <Col span={8}><Form.Item name="volume" label="体积(cm³)"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
              </Row>
            </TabPane>
            <TabPane tab="指南" key="guide">
              <Form.Item name="usage_guide" label="使用指南">
                <RichTextEditor placeholder="商品使用指南/注意事项..." height={200} />
              </Form.Item>
            </TabPane>
            <TabPane tab="SEO" key="seo">
              <Row gutter={16}>
                <Col span={12}><Form.Item name="seo_title" label="SEO标题"><Input /></Form.Item></Col>
                <Col span={12}><Form.Item name="seo_keywords" label="SEO关键词"><Input placeholder="逗号分隔" /></Form.Item></Col>
                <Col span={24}><Form.Item name="seo_description" label="SEO描述"><Input.TextArea rows={2} /></Form.Item></Col>
              </Row>
            </TabPane>
            <TabPane tab="页面装修" key="decoration">
          <Card size="small" title="装修页面" style={{marginBottom:12}}>
            <Space wrap>
              <Button type="primary" size="small" onClick={()=>{setEditingPage(null);setPageBlocks([]);setPageModalOpen(true);}}>新建页面</Button>
            </Space>
            <Table dataSource={pages} rowKey="id" size="small" style={{marginTop:8}} pagination={false} columns={[
              {title:'页面KEY',dataIndex:'page_key',width:120},
              {title:'标题',dataIndex:'title'},
              {title:'区块数',render:(_:any,r:any)=>(Array.isArray(JSON.parse(r.blocks||'[]'))?JSON.parse(r.blocks||'[]').length:0)},
              {title:'状态',dataIndex:'status',width:80,render:(v:any)=>v?<Tag color="green">启用</Tag>:<Tag color="red">停用</Tag>},
              {title:'操作',width:180,render:(_:any,r:any)=><Space>
                <Button size="small" type="link" onClick={()=>{setEditingPage(r);try{setPageBlocks(JSON.parse(r.blocks||'[]'));}catch(e){setPageBlocks([]);}setPageModalOpen(true);}}>编辑</Button>
                <Popconfirm title="删除?" onConfirm={async()=>{await fetch('/api/shop-page-design/'+r.id,{method:'DELETE'});loadData();}}><Button size="small" type="link" danger>删除</Button></Popconfirm>
              </Space>}
            ]} />
          </Card>

          <Modal title={editingPage ? '编辑页面' : '新建页面'} open={pageModalOpen} width={760}
            onOk={async()=>{
              const payload = { title:(editingPage&&editingPage.title)||(pageBlocks.find((b:any)=>b.type==='text')?.title)|| '自定义页面', blocks: pageBlocks };
              if(editingPage){ await fetch('/api/shop-page-design/'+editingPage.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); }
              else { const key=(prompt('页面KEY（如 home/activity）','custom')||'custom').trim(); await fetch('/api/shop-page-design',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,page_key:key})}); }
              setPageModalOpen(false); loadData(); message.success('已保存');
            }}
            onCancel={()=>setPageModalOpen(false)}>
            <Space style={{marginBottom:8}} wrap>
              <Button size="small" onClick={()=>setPageBlocks([...pageBlocks,{id:'b'+Date.now(),type:'banner',title:'横幅',image:'',url:''}])}>加横幅</Button>
              <Button size="small" onClick={()=>setPageBlocks([...pageBlocks,{id:'b'+Date.now(),type:'goods',title:'商品',goods_ids:[]}])}>加商品</Button>
              <Button size="small" onClick={()=>setPageBlocks([...pageBlocks,{id:'b'+Date.now(),type:'text',title:'文本',content:''}])}>加文本</Button>
            </Space>
            {pageBlocks.map((b:any,i:number)=>(
              <Card key={b.id} size="small" style={{marginBottom:8}} title={`${b.type} #${i+1}`} extra={<Space>
                <Button size="small" onClick={()=>{if(i>0){const arr=[...pageBlocks];[arr[i-1],arr[i]]=[arr[i],arr[i-1]];setPageBlocks(arr);}}}>↑</Button>
                <Button size="small" onClick={()=>{if(i<pageBlocks.length-1){const arr=[...pageBlocks];[arr[i+1],arr[i]]=[arr[i],arr[i+1]];setPageBlocks(arr);}}}>↓</Button>
                <Button size="small" danger type="link" onClick={()=>setPageBlocks(pageBlocks.filter((_:any,j:number)=>j!==i))}>删</Button>
              </Space>}>
                <Input style={{marginBottom:4}} placeholder="标题" value={b.title} onChange={e=>{const arr=[...pageBlocks];arr[i].title=e.target.value;setPageBlocks(arr);}} />
                {b.type==='banner' && <Input placeholder="图片URL" value={b.image} onChange={e=>{const arr=[...pageBlocks];arr[i].image=e.target.value;setPageBlocks(arr);}} />}
                {b.type==='banner' && <Input style={{marginTop:4}} placeholder="跳转链接" value={b.url} onChange={e=>{const arr=[...pageBlocks];arr[i].url=e.target.value;setPageBlocks(arr);}} />}
                {b.type==='goods' && <Select mode="multiple" style={{width:'100%',marginTop:4}} placeholder="选择商品" value={b.goods_ids||[]} onChange={v=>{const arr=[...pageBlocks];arr[i].goods_ids=v;setPageBlocks(arr);}} options={allGoods.map((g:any)=>({value:g.id,label:g.name}))} />}
                {b.type==='text' && <Input.TextArea rows={3} placeholder="文本内容(支持HTML)" value={b.content} onChange={e=>{const arr=[...pageBlocks];arr[i].content=e.target.value;setPageBlocks(arr);}} />}
              </Card>
            ))}
          </Modal>
        </TabPane>

        <TabPane tab="系统设置" key="system">
          <Card size="small" title="站点与主题">
            <Row gutter={16}>
              <Col span={12}><Form.Item label="站点名称"><Input value={sysConfig.site_name} onChange={e=>setSysConfig({...sysConfig,site_name:e.target.value})} /></Form.Item></Col>
              <Col span={12}><Form.Item label="备案号"><Input value={sysConfig.icp_no} onChange={e=>setSysConfig({...sysConfig,icp_no:e.target.value})} /></Form.Item></Col>
              <Col span={12}><Form.Item label="前台主题">
                <Select value={sysConfig.site_theme||'default'} onChange={v=>setSysConfig({...sysConfig,site_theme:v})} options={[{value:'default',label:'默认(蓝)'},{value:'dark',label:'暗色'},{value:'green',label:'清新绿'},{value:'red',label:'中国红'}]} />
              </Form.Item></Col>
            </Row>
          </Card>
          <Card size="small" title="短信配置(网关JSON)" style={{marginTop:12}}>
            <Input.TextArea rows={4} placeholder='{"gateway":"aliyun","access_key":"","secret":"","sign":"飞达"}'
              defaultValue={typeof sysConfig.sms_gateway==='string'?sysConfig.sms_gateway:JSON.stringify(sysConfig.sms_gateway||{})}
              onChange={e=>setSysConfig({...sysConfig,sms_gateway:e.target.value})} />
          </Card>
          <Card size="small" title="邮件配置(SMTP JSON)" style={{marginTop:12}}>
            <Input.TextArea rows={4} placeholder='{"host":"smtp.exmail.qq.com","port":465,"user":"","pass":"","from":"noreply@feida.com"}'
              defaultValue={typeof sysConfig.email_config==='string'?sysConfig.email_config:JSON.stringify(sysConfig.email_config||{})}
              onChange={e=>setSysConfig({...sysConfig,email_config:e.target.value})} />
          </Card>
          <Card size="small" title="缓存管理" style={{marginTop:12}}>
            <p style={{ color:'#888', marginBottom: 8 }}>清理系统缓存（模板/缩略图等），数据已持久化于数据库，清理安全无副作用。</p>
            <Button onClick={async()=>{const r=await fetch('/api/sys-cache-clear',{method:'POST'});const d=await r.json();message.success(d.message||'缓存已清空');}}>清空缓存</Button>
          </Card>
          <Button type="primary" style={{marginTop:12}} onClick={async()=>{await fetch('/api/sys-config',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(sysConfig)});message.success('系统配置已保存');}}>保存配置</Button>
        </TabPane>

      </Tabs>
        </Form>
      </Modal>

      {/* 商品扩展数据弹窗 */}
      <Modal title="商品扩展数据（自定义键值对）" open={extendModalOpen} width={640}
        onOk={() => setExtendModalOpen(false)} onCancel={() => setExtendModalOpen(false)}>
        <div style={{ marginBottom: 8 }}>
          <Button size="small" type="primary" onClick={() => syncExtend([...extendData, { key: '', value: '' }])}>添加一项</Button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#fafafa' }}>
            <th style={{ border: '1px solid #eee', padding: 4 }}>键 (key)</th>
            <th style={{ border: '1px solid #eee', padding: 4 }}>值 (value)</th>
            <th style={{ border: '1px solid #eee', padding: 4, width: 40 }}></th>
          </tr></thead>
          <tbody>
            {extendData.map((row, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #eee', padding: 2 }}>
                  <input style={{ width: '100%', border: 'none', padding: 4 }} value={row.key}
                    placeholder="如: 材质" onChange={e => { const arr = [...extendData]; arr[i].key = e.target.value; syncExtend(arr); }} />
                </td>
                <td style={{ border: '1px solid #eee', padding: 2 }}>
                  <input style={{ width: '100%', border: 'none', padding: 4 }} value={row.value}
                    placeholder="如: 金属" onChange={e => { const arr = [...extendData]; arr[i].value = e.target.value; syncExtend(arr); }} />
                </td>
                <td style={{ border: '1px solid #eee', padding: 2, textAlign: 'center' }}>
                  <Button size="small" type="link" danger onClick={() => syncExtend(extendData.filter((_, j) => j !== i))}>×</Button>
                </td>
              </tr>
            ))}
            {extendData.length === 0 && (
              <tr><td colSpan={3} style={{ border: '1px solid #eee', padding: 8, color: '#999', textAlign: 'center' }}>暂无扩展数据，点击「添加一项」</td></tr>
            )}
          </tbody>
        </table>
      </Modal>

      {/* 售后处理弹窗 */}
      <Modal title="售后处理" open={aftersaleModalOpen} width={640} footer={null} onCancel={()=>setAftersaleModalOpen(false)}>
        {aftersaleCur && (
          <div>
            <p><b>类型：</b>{aftersaleCur.type==='return'?'退货退款':'仅退款'}　<b>状态：</b>{aftersaleStatusTag(aftersaleCur.status)}</p>
            <p><b>订单号：</b>{aftersaleCur.order?.order_no || aftersaleCur.order_id}</p>
            <p><b>申请理由：</b>{aftersaleCur.reason}</p>
            <p><b>退款金额：</b>¥{aftersaleCur.refund_amount||0}</p>
            {aftersaleCur.return_tracking_no && <p><b>退货物流：</b>{aftersaleCur.return_tracking_company} {aftersaleCur.return_tracking_no}</p>}
            {aftersaleCur.reject_reason && <p><b>拒绝理由：</b>{aftersaleCur.reject_reason}</p>}
            {aftersaleCur.admin_remark && <p><b>处理备注：</b>{aftersaleCur.admin_remark}</p>}
            {aftersaleCur.type==='return' && ['approved','return_shipped','return_received'].includes(aftersaleCur.status) && (
              <div style={{margin:'12px 0'}}>
                <span style={{marginRight:8}}>退款方式:</span>
                <Select value={refundMethod} style={{width:160}} onChange={v=>setRefundMethod(v)} options={[{value:'original',label:'原路退回'},{value:'balance',label:'退到余额'}]} />
              </div>
            )}
            <Divider />
            <Space>
              {aftersaleCur.status==='pending' && <Button type="primary" onClick={()=>doAftersale('approved')}>同意</Button>}
              {aftersaleCur.status==='approved' && aftersaleCur.type==='return' && <Button onClick={()=>doAftersale('return_received')}>标记收货</Button>}
              {['approved','return_shipped','return_received'].includes(aftersaleCur.status) && <Button type="primary" danger onClick={()=>doAftersale('refunded',{refund_method:refundMethod})}>确认退款</Button>}
              {['pending','approved'].includes(aftersaleCur.status) && <Button danger onClick={()=>setRejectAftersaleOpen(true)}>拒绝</Button>}
            </Space>
          </div>
        )}
      </Modal>

      {/* 拒绝售后弹窗 */}
      <Modal title="拒绝售后" open={rejectAftersaleOpen} onOk={confirmRejectAftersale} onCancel={()=>setRejectAftersaleOpen(false)}>
        <Input.TextArea rows={3} placeholder="请填写拒绝理由" value={rejectAftersaleReason} onChange={e=>setRejectAftersaleReason(e.target.value)} />
      </Modal>

    </div>
  );
}
