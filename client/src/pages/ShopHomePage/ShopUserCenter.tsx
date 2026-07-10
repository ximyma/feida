import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Table, Tabs, Tag, Empty, Modal, Form, Input, Select, message, Divider, Descriptions, Badge, Pagination, Statistic } from 'antd';
import RegionCascader from '../../components/RegionCascader';
import { User, MapPin, Heart, ShoppingCart, Package, Clock, CreditCard, LogOut, Edit2, Plus, Delete, ChevronRight, Share2 } from 'lucide-react';
import { useShop } from './ShopContext';

interface Address {
  id: string;
  contact_name: string;
  contact_phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  is_default: number;
  created_at: string;
}

interface Order {
  id: string;
  order_no: string;
  total_amount: number;
  pay_amount: number;
  pay_status: string;
  order_status: string;
  created_at: string;
  items?: any[];
}

const { TabPane } = Tabs;

export default function ShopUserCenter() {
  const navigate = useNavigate();
  const { user, setUser, favorites } = useShop();
  const [activeTab, setActiveTab] = useState('orders');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotal, setOrderTotal] = useState(0);
  const [balance, setBalance] = useState(0);
  const [balanceLogs, setBalanceLogs] = useState<any[]>([]);
  const [balanceModalOpen, setBalanceModalOpen] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form] = Form.useForm();
  const [groupBuys, setGroupBuys] = useState<any[]>([]);
  const [bargains, setBargains] = useState<any[]>([]);
  const [myGroupRecords, setMyGroupRecords] = useState<any[]>([]);
  const [myBargainRecords, setMyBargainRecords] = useState<any[]>([]);
  const [myLevel, setMyLevel] = useState<any>(null);
  const [distConfig, setDistConfig] = useState<any>({ is_open: 1, level_mode: 2 });
  const [distMember, setDistMember] = useState<any>(null);
  const [distTeam, setDistTeam] = useState<any>({ direct: [], team: [], directCount: 0, teamCount: 0 });
  const [distOrders, setDistOrders] = useState<any[]>([]);
  const [distWithdraws, setDistWithdraws] = useState<any[]>([]);

  useEffect(() => {
    loadAddresses();
    loadOrders();
    loadBalance();
    loadMarketing();
    loadDistribution();
  }, [orderPage]);

  const loadMarketing = async () => {
    try {
      const gb = await (await fetch('/api/shop-group-buy')).json();
      const bg = await (await fetch('/api/shop-bargain')).json();
      setGroupBuys(Array.isArray(gb) ? gb : []);
      setBargains(Array.isArray(bg) ? bg : []);
      if (user?.id) {
        const mgr = await (await fetch(`/api/shop-group-buy-records?user_id=${user.id}`)).json();
        const mbr = await (await fetch(`/api/shop-bargain-records?user_id=${user.id}`)).json();
        setMyGroupRecords(Array.isArray(mgr) ? mgr : []);
        setMyBargainRecords(Array.isArray(mbr) ? mbr : []);
        const lv = await (await fetch(`/api/shop-member-levels/current?user_id=${user.id}`)).json();
        setMyLevel(lv.level || null);
      }
    } catch (e) { console.error('加载营销活动失败', e); }
  };

  const loadDistribution = async () => {
    if (!user?.id) return;
    try {
      const cfg = await (await fetch('/api/shop-distribution-config')).json();
      setDistConfig(cfg || { is_open: 1, level_mode: 2 });
      const me = await (await fetch(`/api/shop-distribution-members?user_id=${user.id}`)).json();
      const myArr = Array.isArray(me) ? me : [];
      setDistMember(myArr[0] || null);
      if (myArr[0]) {
        const [team, od, wd] = await Promise.all([
          fetch(`/api/shop-distribution/team?user_id=${user.id}`).then(r => r.json()),
          fetch(`/api/shop-distribution-orders?distributor_id=${user.id}`).then(r => r.json()),
          fetch(`/api/shop-distribution-withdraw?user_id=${user.id}`).then(r => r.json())
        ]);
        setDistTeam(team || { direct: [], team: [], directCount: 0, teamCount: 0 });
        setDistOrders(Array.isArray(od) ? od : []);
        setDistWithdraws(Array.isArray(wd) ? wd : []);
      }
    } catch (e) { console.error('加载分销数据失败', e); }
  };

  const loadBalance = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/shop-balance?user_id=${user.id}`);
      const data = await res.json();
      setBalance(data.balance || 0);
      setBalanceLogs(data.logs || []);
    } catch (e) { console.error('加载余额失败', e); }
  };

  const loadAddresses = async () => {
    try {
      const res = await fetch('/api/shop-addresses');
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('加载地址失败', e);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch(`/api/shop-orders?page=${orderPage}&pageSize=10`);
      const data = await res.json();
      if (data.list) {
        setOrders(data.list);
        setOrderTotal(data.total);
      } else {
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('加载订单失败', e);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    form.resetFields();
    setAddressModalOpen(true);
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    form.setFieldsValue({ ...addr, region: [addr.province, addr.city, addr.district].filter(Boolean) });
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async () => {
    try {
      const values = await form.validateFields();
      const { region, ...rest } = values;
      const payload = {
        ...rest,
        province: region?.[0] || '',
        city: region?.[1] || '',
        district: region?.[2] || '',
      };
      const url = editingAddress ? `/api/shop-addresses/${editingAddress.id}` : '/api/shop-addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        message.success(editingAddress ? '修改成功' : '添加成功');
        setAddressModalOpen(false);
        loadAddresses();
      }
    } catch (e) {
      console.error('保存地址失败', e);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      onOk: async () => {
        await fetch(`/api/shop-addresses/${id}`, { method: 'DELETE' });
        message.success('删除成功');
        loadAddresses();
      }
    });
  };

  const handleSetDefault = async (id: string) => {
    await fetch(`/api/shop-addresses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_default: 1 })
    });
    message.success('设置成功');
    loadAddresses();
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

  const getPayStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      unpaid: { color: 'orange', text: '未付款' },
      paid: { color: 'green', text: '已付款' },
      refunded: { color: 'red', text: '已退款' }
    };
    const item = map[status] || { color: 'default', text: status };
    return <Tag color={item.color}>{item.text}</Tag>;
  };

  return (
    <div className="user-center">
      {/* 顶部导航 */}
      <div className="user-header">
        <div className="header-content">
          <Link to="/shop" className="back-link">
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
            返回商城
          </Link>
          <h2>用户中心</h2>
          <Button type="text" icon={<LogOut size={16} />} onClick={() => setUser(null)}>退出</Button>
        </div>
      </div>

      <div className="user-container">
        <Row gutter={[24, 24]}>
          {/* 侧边菜单 */}
          <Col xs={24} md={6}>
            <Card className="user-sidebar">
              <div className="user-info">
                <div className="avatar">
                  <User size={40} />
                </div>
                <div className="info">
                  <h3>{user?.name || '游客'}</h3>
                  <p>{user?.phone || '请登录'}</p>
                </div>
              </div>
              <Divider />
              <div className="menu-list">
                <div className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                  <Package size={18} /> 我的订单
                </div>
                <div className={`menu-item ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>
                  <Heart size={18} /> 我的收藏
                </div>
                <div className={`menu-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
                  <MapPin size={18} /> 收货地址
                </div>
                <div className={`menu-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
                  <User size={18} /> 账户信息
                </div>
                <div className={`menu-item ${activeTab === 'balance' ? 'active' : ''}`} onClick={() => setActiveTab('balance')}>
                  <CreditCard size={18} /> 我的钱包
                </div>
                <div className={`menu-item ${activeTab === 'marketing' ? 'active' : ''}`} onClick={() => setActiveTab('marketing')}>
                  <ShoppingCart size={18} /> 营销中心
                </div>
                <div className={`menu-item ${activeTab === 'distribution' ? 'active' : ''}`} onClick={() => setActiveTab('distribution')}>
                  <Share2 size={18} /> 分销中心
                </div>
              </div>
            </Card>
          </Col>

          {/* 主内容区 */}
          <Col xs={24} md={18}>
            {/* 我的订单 */}
            {activeTab === 'orders' && (
              <Card
                title="我的订单"
                extra={<Link to="/shop/orders">查看全部</Link>}
              >
                <Tabs defaultActiveKey="all">
                  <Tabs.TabPane tab="全部" key="all">
                    {orders.length > 0 ? (
                      <>
                        {orders.map(order => (
                          <div key={order.id} className="order-item">
                            <div className="order-header">
                              <span>订单号: {order.order_no}</span>
                              <span>{new Date(order.created_at).toLocaleString()}</span>
                              {getOrderStatusTag(order.order_status)}
                              {getPayStatusTag(order.pay_status)}
                            </div>
                            <div className="order-content">
                              <span className="order-amount">¥{order.pay_amount}</span>
                              <Button type="link" onClick={() => navigate(`/shop/order/${order.id}`)}>查看详情</Button>
                            </div>
                          </div>
                        ))}
                        <Pagination
                          current={orderPage}
                          pageSize={10}
                          total={orderTotal}
                          onChange={setOrderPage}
                          style={{ marginTop: 16, textAlign: 'right' }}
                        />
                      </>
                    ) : (
                      <Empty description="暂无订单">
                        <Button type="primary" onClick={() => navigate('/shop')}>去购物</Button>
                      </Empty>
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="待付款" key="pending">
                    {orders.filter(o => o.pay_status === 'unpaid').length > 0 ? (
                      orders.filter(o => o.pay_status === 'unpaid').map(order => (
                        <div key={order.id} className="order-item">
                          <div className="order-header">
                            <span>订单号: {order.order_no}</span>
                            <span>{new Date(order.created_at).toLocaleString()}</span>
                            {getOrderStatusTag(order.order_status)}
                          </div>
                          <div className="order-content">
                            <span className="order-amount">¥{order.pay_amount}</span>
                            <Button type="primary" size="small">去支付</Button>
                          </div>
                        </div>
                      ))
                    ) : <Empty description="暂无待付款订单" />}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="待收货" key="shipped">
                    {orders.filter(o => o.order_status === 'shipped').length > 0 ? (
                      orders.filter(o => o.order_status === 'shipped').map(order => (
                        <div key={order.id} className="order-item">
                          <div className="order-header">
                            <span>订单号: {order.order_no}</span>
                            <span>{new Date(order.created_at).toLocaleString()}</span>
                            {getOrderStatusTag(order.order_status)}
                          </div>
                          <div className="order-content">
                            <span className="order-amount">¥{order.pay_amount}</span>
                            <Button type="primary" size="small">确认收货</Button>
                          </div>
                        </div>
                      ))
                    ) : <Empty description="暂无待收货订单" />}
                  </Tabs.TabPane>
                </Tabs>
              </Card>
            )}

            {/* 我的收藏 */}
            {activeTab === 'favorites' && (
              <Card title="我的收藏">
                {favorites.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {favorites.map(id => (
                      <Col xs={12} sm={8} md={6} key={id}>
                        <FavoriteItem goodsId={id} />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="暂无收藏">
                    <Button type="primary" onClick={() => navigate('/shop')}>去购物</Button>
                  </Empty>
                )}
              </Card>
            )}

            {/* 收货地址 */}
            {activeTab === 'addresses' && (
              <Card
                title="收货地址"
                extra={<Button type="primary" icon={<Plus size={14} />} onClick={handleAddAddress}>添加地址</Button>}
              >
                {addresses.length > 0 ? (
                  <Row gutter={[16, 16]}>
                    {addresses.map(addr => (
                      <Col xs={24} sm={12} md={8} key={addr.id}>
                        <Card className={`address-card ${addr.is_default ? 'default' : ''}`}>
                          {addr.is_default === 1 && <Badge status="success" text="默认" className="default-badge" />}
                          <div className="address-content">
                            <p><strong>{addr.contact_name}</strong> {addr.contact_phone}</p>
                            <p>{addr.province} {addr.city} {addr.district} {addr.address}</p>
                          </div>
                          <div className="address-actions">
                            <Button type="text" size="small" icon={<Edit2 size={14} />} onClick={() => handleEditAddress(addr)}>编辑</Button>
                            <Button type="text" size="small" icon={<Delete size={14} />} onClick={() => handleDeleteAddress(addr.id)}>删除</Button>
                            {addr.is_default !== 1 && (
                              <Button type="text" size="small" onClick={() => handleSetDefault(addr.id)}>设为默认</Button>
                            )}
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="暂无收货地址">
                    <Button type="primary" onClick={handleAddAddress}>添加地址</Button>
                  </Empty>
                )}
              </Card>
            )}

            {/* 账户信息 */}
            {activeTab === 'account' && (
              <Card title="账户信息">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="用户名">{user?.name || '-'}</Descriptions.Item>
                  <Descriptions.Item label="手机号">{user?.phone || '-'}</Descriptions.Item>
                  <Descriptions.Item label="邮箱">{user?.email || '-'}</Descriptions.Item>
                  <Descriptions.Item label="积分">{user?.integral || 0}</Descriptions.Item>
                  <Descriptions.Item label="会员等级">{myLevel ? `${myLevel.icon||''} ${myLevel.name}（${(myLevel.discount*10).toFixed(1)}折）` : '-'}</Descriptions.Item>
                  <Descriptions.Item label="余额"><span style={{color:'#f5222d',fontWeight:'bold'}}>¥{balance.toFixed(2)}</span></Descriptions.Item>
                </Descriptions>
                <Divider />
                <Button type="primary">修改密码</Button>
              </Card>
            )}

            {/* 钱包/余额 */}
            {activeTab === 'balance' && (
              <Card title={<span><CreditCard size={18} style={{marginRight:8}}/>我的钱包</span>}>
                <div style={{textAlign:'center',padding:'40px 0',background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',borderRadius:12,color:'#fff',marginBottom:20}}>
                  <div style={{fontSize:14,opacity:0.8,marginBottom:8}}>可用余额</div>
                  <div style={{fontSize:48,fontWeight:'bold'}}>¥{balance.toFixed(2)}</div>
                </div>
                <div style={{display:'flex',gap:12,marginBottom:16}}>
                  <Button type="primary" size="large" onClick={()=>{
                    const amt=parseFloat(prompt('充值金额:')||'0');
                    if(amt&&user?.id){fetch('/api/shop-balance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id,amount:amt,type:'recharge',remark:'在线充值'})}).then(r=>r.json()).then(()=>{message.success('充值成功');loadBalance();});}
                  }}>充值</Button>
                  <Button size="large" onClick={()=>{
                    const amt=parseFloat(prompt('提现金额:')||'0');
                    if(amt&&amt<=balance&&user?.id){fetch('/api/shop-balance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id,amount:-amt,type:'withdraw',remark:'提现'})}).then(r=>r.json()).then(()=>{message.success('提现申请已提交');loadBalance();});}
                  }}>提现</Button>
                </div>
                <Divider>交易记录</Divider>
                {balanceLogs.length > 0 ? (
                  <Table dataSource={balanceLogs} rowKey="id" size="small" pagination={{pageSize:10}} columns={[
                    {title:'类型',dataIndex:'type',width:80,render:(v:string)=><Tag color={v==='recharge'?'green':v==='withdraw'?'red':'blue'}>{v==='recharge'?'充值':v==='withdraw'?'提现':'其他'}</Tag>},
                    {title:'金额',dataIndex:'amount',width:100,render:(v:number)=><span style={{color:v>=0?'#52c41a':'#f5222d',fontWeight:'bold'}}>{v>=0?'+':''}{v.toFixed(2)}</span>},
                    {title:'备注',dataIndex:'remark'},
                    {title:'时间',dataIndex:'created_at',render:(v:string)=>new Date(v).toLocaleString()}
                  ]} />
                ) : <Empty description="暂无交易记录" />}
              </Card>
            )}

            {/* 营销中心 */}
            {activeTab === 'marketing' && (
              <div>
                <Card title={<span><ShoppingCart size={18} style={{marginRight:8}}/>拼团活动</span>} style={{marginBottom:16}}>
                  {groupBuys.length > 0 ? (
                    <Row gutter={[12,12]}>
                      {groupBuys.filter((g:any)=>g.status==='ongoing').map((g:any)=>(
                        <Col xs={24} sm={12} md={8} key={g.id}>
                          <Card size="small" hoverable
                            cover={g.goods?.main_image ? <img src={g.goods.main_image} style={{height:140,objectFit:'cover'}} alt=""/> : <div style={{height:140,background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center'}}>🛒</div>}>
                            <Card.Meta title={g.goods?.name || g.goods_id}
                              description={<div>
                                <div><span style={{color:'#f5222d',fontWeight:'bold',fontSize:16}}>¥{g.group_price}</span> <s style={{color:'#999'}}>¥{g.goods?.price}</s></div>
                                <div style={{fontSize:12,color:'#666'}}>需 {g.group_size} 人成团 · 库存 {g.group_stock}</div>
                              </div>} />
                            <Button type="primary" block style={{marginTop:8}} onClick={async()=>{
                              if(!user?.id){message.warning('请先登录');return;}
                              const r=await fetch('/api/shop-group-buy/'+g.id+'/open',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id})});
                              const d=await r.json();
                              if(d.success){message.success('开团成功，快邀请好友参团！');loadMarketing();}
                            }}>发起拼团</Button>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : <Empty description="暂无拼团活动" />}
                  {myGroupRecords.length > 0 && (
                    <>
                      <Divider>我的拼团</Divider>
                      <Table dataSource={myGroupRecords} rowKey="id" size="small" pagination={false} columns={[
                        {title:'商品',render:(_:any,r:any)=>r.goods?.name||r.goods_id},
                        {title:'进度',render:(_:any,r:any)=><span>{r.current_count}/{r.target_count}</span>},
                        {title:'状态',dataIndex:'status',render:(v:string)=><Tag color={v==='success'?'green':v==='ongoing'?'orange':'default'}>{v==='success'?'已成团':v==='ongoing'?'进行中':'已失效'}</Tag>},
                        {title:'操作',render:(_:any,r:any)=><Button size="small" onClick={async()=>{
                          const fid=prompt('好友用户ID参团:');
                          if(fid){const res=await fetch('/api/shop-group-buy-records/'+r.id+'/join',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:fid})});const d=await res.json();if(d.success){message.success('参团成功');loadMarketing();}else message.error(d.error||'参团失败');}
                        }}>邀人参团</Button>}
                      ]} />
                    </>
                  )}
                </Card>

                <Card title={<span>🪓 砍价活动</span>}>
                  {bargains.length > 0 ? (
                    <Row gutter={[12,12]}>
                      {bargains.filter((b:any)=>b.status==='ongoing').map((b:any)=>(
                        <Col xs={24} sm={12} md={8} key={b.id}>
                          <Card size="small" hoverable
                            cover={b.goods?.main_image ? <img src={b.goods.main_image} style={{height:140,objectFit:'cover'}} alt=""/> : <div style={{height:140,background:'#f5f5f5',display:'flex',alignItems:'center',justifyContent:'center'}}>🪓</div>}>
                            <Card.Meta title={b.goods?.name || b.goods_id}
                              description={<div>
                                <div style={{fontSize:12,color:'#666'}}>底价 <span style={{color:'#f5222d',fontWeight:'bold'}}>¥{b.floor_price}</span> · 原价 ¥{b.goods?.price||b.start_price}</div>
                                <div style={{fontSize:12,color:'#666'}}>库存 {b.bargain_stock}</div>
                              </div>} />
                            <Button type="primary" block style={{marginTop:8}} onClick={async()=>{
                              if(!user?.id){message.warning('请先登录');return;}
                              const r=await fetch('/api/shop-bargain/'+b.id+'/start',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id})});
                              const d=await r.json();
                              if(d.success){message.success('砍价发起成功，喊好友帮忙砍价！');loadMarketing();}
                            }}>发起砍价</Button>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  ) : <Empty description="暂无砍价活动" />}
                  {myBargainRecords.length > 0 && (
                    <>
                      <Divider>我的砍价</Divider>
                      <Table dataSource={myBargainRecords} rowKey="id" size="small" pagination={false} columns={[
                        {title:'商品',render:(_:any,r:any)=>r.goods?.name||r.goods_id},
                        {title:'当前价',dataIndex:'current_price',render:(v:any)=><span style={{color:'#f5222d',fontWeight:'bold'}}>¥{v}</span>},
                        {title:'底价',dataIndex:'floor_price',render:(v:any)=><span>¥{v}</span>},
                        {title:'帮砍人数',dataIndex:'help_count',width:90},
                        {title:'状态',dataIndex:'status',render:(v:string)=><Tag color={v==='success'?'green':'orange'}>{v==='success'?'已到底价':'砍价中'}</Tag>},
                        {title:'操作',render:(_:any,r:any)=><Button size="small" onClick={async()=>{
                          const fid=prompt('好友用户ID帮忙砍价:');
                          if(fid){const res=await fetch('/api/shop-bargain-records/'+r.id+'/help',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:fid,user_name:'好友'})});const d=await res.json();if(d.success){message.success('帮砍 ¥'+d.amount+'，当前价 ¥'+d.record.current_price);loadMarketing();}else message.error(d.error||'砍价失败');}
                        }}>邀人帮砍</Button>}
                      ]} />
                    </>
                  )}
                </Card>
              </div>
            )}

            {/* 分销中心 */}
            {activeTab === 'distribution' && (
              <div>
                {distConfig.is_open !== 1 ? (
                  <Empty description="分销功能未开启" />
                ) : !distMember ? (
                  <Card title="成为分销员">
                    <p>邀请好友下单，赚取佣金返利！</p>
                    <Input placeholder="选填：填写邀请人的邀请码绑定上级" id="dist-invite" style={{marginBottom:12}} />
                    <Button type="primary" onClick={async()=>{
                      if(!user?.id){message.warning('请先登录');return;}
                      const code=(document.getElementById('dist-invite') as HTMLInputElement)?.value || '';
                      const r=await fetch('/api/shop-distribution/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id,user_name:user.name||user.nickname||'',invite_code:code||undefined})});
                      const d=await r.json();
                      if(d.success){message.success('已开通分销中心！');loadDistribution();}else message.error(d.error||'开通失败');
                    }}>申请成为分销员</Button>
                  </Card>
                ) : (
                  <>
                    <Card title="我的分销" style={{marginBottom:16}}>
                      <Row gutter={16}>
                        <Col span={6}><Statistic title="邀请码" value={distMember.invite_code} /></Col>
                        <Col span={6}><Statistic title="佣金总额" prefix="¥" value={distMember.total_commission||0} /></Col>
                        <Col span={6}><Statistic title="可提现" prefix="¥" value={distMember.withdrawable||0} valueStyle={{color:'#f5222d'}} /></Col>
                        <Col span={6}><Statistic title="已提现" prefix="¥" value={distMember.withdrawn||0} /></Col>
                      </Row>
                      <div style={{marginTop:12}}>
                        <Input id="dist-withdraw" placeholder="提现金额" type="number" style={{width:160,marginRight:8}} />
                        <Button onClick={async()=>{
                          const amt=parseFloat((document.getElementById('dist-withdraw') as HTMLInputElement)?.value||'0');
                          if(!amt||amt<=0){message.warning('请输入金额');return;}
                          const r=await fetch('/api/shop-distribution-withdraw',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:user.id,user_name:user.name||user.nickname||'',amount:amt,account:''})});
                          const d=await r.json();
                          if(d.success){message.success('提现申请已提交');loadDistribution();}else message.error(d.error||'提现失败');
                        }}>申请提现</Button>
                        <Button style={{marginLeft:8}} onClick={()=>{const url=location.origin+'/?inviter='+distMember.invite_code;navigator.clipboard?.writeText(url);message.success('邀请链接已复制');}}>复制邀请链接</Button>
                      </div>
                    </Card>

                    <Card title={<span>我的团队（直推 {distTeam.directCount} / 团队 {distTeam.teamCount}）</span>} style={{marginBottom:16}}>
                      {distTeam.team.length > 0 ? (
                        <Table dataSource={distTeam.team} rowKey="id" size="small" pagination={false} columns={[
                          {title:'成员',render:(_:any,r:any)=>r.user?.name||r.user_name||r.user_id},
                          {title:'关系',render:(_:any,r:any)=>r.parent_id===user.id?'直推':'间推'},
                          {title:'等级',render:(_:any,r:any)=>r.level?.name||'-'},
                          {title:'佣金总额',dataIndex:'total_commission',render:(v:any)=>'¥'+(v||0)},
                          {title:'状态',dataIndex:'status',render:(v:string)=><Tag color={v==='approved'?'green':'orange'}>{v==='approved'?'正常':'待审'}</Tag>}
                        ]} />
                      ) : <Empty description="暂无团队成员，快去邀请好友吧" />}
                    </Card>

                    <Card title="我的佣金明细" style={{marginBottom:16}}>
                      {distOrders.length > 0 ? (
                        <Table dataSource={distOrders} rowKey="id" size="small" pagination={false} columns={[
                          {title:'订单',render:(_:any,r:any)=>r.order?.order_no||r.order_id},
                          {title:'层级',dataIndex:'distribute_level',render:(v:any)=>v+'级'},
                          {title:'佣金',dataIndex:'commission',render:(v:any)=><span style={{color:'#f5222d'}}>¥{v}</span>},
                          {title:'状态',dataIndex:'status',render:(v:string)=><Tag color={v==='settled'?'green':'orange'}>{v==='settled'?'已结算':'待结算'}</Tag>}
                        ]} />
                      ) : <Empty description="暂无佣金记录" />}
                    </Card>

                    <Card title="我的提现记录">
                      {distWithdraws.length > 0 ? (
                        <Table dataSource={distWithdraws} rowKey="id" size="small" pagination={false} columns={[
                          {title:'金额',dataIndex:'amount',render:(v:any)=>'¥'+v},
                          {title:'状态',dataIndex:'status',render:(v:string)=><Tag color={v==='done'?'green':v==='rejected'?'red':'orange'}>{v==='done'?'已打款':v==='rejected'?'已拒绝':'待处理'}</Tag>}
                        ]} />
                      ) : <Empty description="暂无提现记录" />}
                    </Card>
                  </>
                )}
              </div>
            )}
          </Col>
        </Row>
      </div>

      {/* 地址编辑弹窗 */}
      <Modal
        title={editingAddress ? '编辑地址' : '添加地址'}
        open={addressModalOpen}
        onOk={handleSaveAddress}
        onCancel={() => setAddressModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contact_name" label="收货人" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contact_phone" label="联系电话" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="region" label="所在地区" rules={[{ required: true, type: 'array', message: '请选择省 / 市 / 区' }]}>
            <RegionCascader />
          </Form.Item>
          <Form.Item name="address" label="详细地址" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="is_default" valuePropName="checked">
            <label><Input type="checkbox" />设为默认地址</label>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .user-center { background: #f5f5f5; min-height: 100vh; }
        .user-header { background: #001529; color: #fff; padding: 16px 20px; }
        .header-content { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
        .header-content h2 { margin: 0; }
        .back-link { color: #fff; display: flex; align-items: center; gap: 4px; opacity: 0.8; }
        .back-link:hover { opacity: 1; }
        .user-container { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
        .user-sidebar { position: sticky; top: 20px; }
        .user-info { display: flex; align-items: center; gap: 16px; padding: 8px 0; }
        .avatar { width: 64px; height: 64px; background: #1890ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; }
        .info h3 { margin: 0; font-size: 18px; }
        .info p { margin: 4px 0 0; color: #666; font-size: 14px; }
        .menu-list { }
        .menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; border-radius: 8px; color: #666; transition: all 0.3s; }
        .menu-item:hover { background: #f0f0f0; }
        .menu-item.active { background: #e6f7ff; color: #1890ff; }
        .order-item { border: 1px solid #eee; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
        .order-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
        .order-content { display: flex; justify-content: flex-end; align-items: center; gap: 16px; padding-top: 12px; }
        .order-amount { font-size: 18px; color: #f5222d; font-weight: bold; }
        .address-card { position: relative; }
        .address-card.default { border-color: #1890ff; }
        .default-badge { position: absolute; top: 8px; right: 8px; }
        .address-content p { margin: 0 0 8px; font-size: 14px; }
        .address-actions { display: flex; gap: 8px; border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px; }
      `}</style>
    </div>
  );
}

// 收藏商品组件
function FavoriteItem({ goodsId }: { goodsId: string }) {
  const [goods, setGoods] = useState<any>(null);
  const { removeFavorite } = useShop();

  useEffect(() => {
    fetch(`/api/shop-goods/${goodsId}`)
      .then(r => r.json())
      .then(data => {
        if (!data.error) setGoods(data);
      })
      .catch(() => {});
  }, [goodsId]);

  if (!goods) return null;

  return (
    <Card
      hoverable
      cover={<img src={goods.main_image || '/placeholder.png'} alt={goods.name} style={{ height: 150, objectFit: 'cover' }} />}
      actions={[
        <Button type="text" key="cart" onClick={() => {
          const cart = JSON.parse(localStorage.getItem('shop_cart') || '{}');
          cart[goodsId] = (cart[goodsId] || 0) + 1;
          localStorage.setItem('shop_cart', JSON.stringify(cart));
          window.dispatchEvent(new Event('cartUpdated'));
        }}><ShoppingCart size={14} /></Button>,
        <Button type="text" key="remove" onClick={() => removeFavorite(goodsId)}><Delete size={14} /></Button>
      ]}
    >
      <Card.Meta
        title={<Link to={`/shop/goods/${goodsId}`}>{goods.name}</Link>}
        description={<span style={{ color: '#f5222d' }}>¥{goods.price}</span>}
      />
    </Card>
  );
}