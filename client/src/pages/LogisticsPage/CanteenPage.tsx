import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Table, Button, Modal, Form, Select, Tag, Space, Row, Col,
  Statistic, Checkbox, Divider, message, DatePicker, Alert, Popconfirm, Tabs, Input
} from 'antd';
import {
  CoffeeOutlined, ShoppingCartOutlined, CalendarOutlined, TeamOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const DISH_CATEGORIES = ['荤菜', '素菜', '主食', '汤类', '饮品', '凉菜', '蛋类'];
const MEAL_TYPES = [
  { value: 'breakfast', label: '早餐' },
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
];
const MEAL_TYPE_MAP: Record<string, string> = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };
const DISH_PRICE_ESTIMATE = ['8', '6', '5', '5', '5', '6', '6'];

function getCategory(dish: string): string {
  for (const cat of DISH_CATEGORIES) { if (dish.includes(cat)) return cat; }
  return '其他';
}
function groupDishes(dishesJson: string): Record<string, string[]> {
  try {
    const list: string[] = JSON.parse(dishesJson);
    const groups: Record<string, string[]> = {};
    for (const d of list) { const cat = getCategory(d); (groups[cat] = groups[cat] || []).push(d); }
    return groups;
  } catch { return {}; }
}

interface Canteen { id?: string; name: string; location: string; capacity: number; isActive?: number; status?: string; }
interface MealMenu {
  id?: string; canteenId: string; canteenName?: string; date: string;
  mealType: string; dishes: string; totalPrice: number; status: string;
}
interface MealOrder {
  id?: string; canteenId: string; canteenName?: string; employeeId: string;
  employeeName: string; date: string; mealType: string;
  dishes: string; totalPrice: number; status: string;
}
interface MealRecord {
  id?: string; employeeId: string; employeeName: string; date: string;
  mealType: string; cost: number; canteenName: string;
}

// ==================== 食堂管理 Tab ====================
function CanteenTab({ canteens, loadCanteens, messageApi }: {
  canteens: Canteen[]; loadCanteens: () => void; messageApi: ReturnType<typeof message.useMessage>[0];
}) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Canteen | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const openAdd = () => { setEditing(null); form.resetFields(); setModal(true); };
  const openEdit = (r: Canteen) => { setEditing(r); form.setFieldsValue({ ...r }); setModal(true); };

  const handleSave = async () => {
    try {
      const vals = await form.validateFields();
      setSubmitting(true);
      const payload = { ...vals, isActive: vals.isActive === undefined ? 1 : vals.isActive };
      const res = await fetch('/api/canteens' + (editing?.id ? '/' + editing.id : ''), {
        method: editing?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing?.id ? payload : { id: 'c_' + Date.now(), ...payload }),
      });
      if (res.ok) {
        messageApi.success(editing?.id ? '食堂已更新' : '食堂已创建');
        setModal(false); loadCanteens();
      } else { messageApi.error('保存失败'); }
    } catch { messageApi.error('请检查表单'); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/canteens/' + id, { method: 'DELETE' });
    messageApi.success('已删除'); loadCanteens();
  };

  const columns = [
    { title: '食堂名称', dataIndex: 'name', render: (v: string) => <b>{v}</b> },
    { title: '位置', dataIndex: 'location' },
    { title: '容纳人数', dataIndex: 'capacity', render: (v: number) => v + '人' },
    { title: '状态', dataIndex: 'isActive', render: (v: number) => v === 1 ? <Tag color='green'>营业中</Tag> : <Tag color='red'>已歇业</Tag> },
    {
      title: '操作',
      render: (_: unknown, r: Canteen) => (
        <Space>
          <Button size='small' icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          <Popconfirm title='确认删除该食堂？' onConfirm={() => handleDelete(r.id!)} okText='删除' cancelText='取消' okButtonProps={{ danger: true }}>
            <Button size='small' danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<><CoffeeOutlined /> 食堂列表</>}
        extra={<Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>新建食堂</Button>}
      >
        <Table dataSource={canteens} columns={columns} rowKey='id' size='small'
          pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        open={modal} title={editing ? '编辑食堂' : '新建食堂'}
        onOk={handleSave} onCancel={() => setModal(false)} confirmLoading={submitting} width={480}
        okText='保存'
      >
        <Form form={form} layout='vertical'>
          <Form.Item name='name' label='食堂名称' rules={[{ required: true, message: '请输入食堂名称' }]}>
            <Input placeholder='如：一号食堂' maxLength={50} showCount />
          </Form.Item>
          <Form.Item name='location' label='位置' rules={[{ required: true, message: '请输入位置' }]}>
            <Input placeholder='如：总部大楼一楼' maxLength={100} showCount />
          </Form.Item>
          <Form.Item name='capacity' label='容纳人数' rules={[{ required: true, message: '请输入容纳人数' }]}>
            <Input type='number' placeholder='如：200' min={1} />
          </Form.Item>
          <Form.Item name='isActive' label='状态' initialValue={1} valuePropName='value' getValueProps={v => ({ value: v === undefined ? 1 : v })}>
            <Select>
              <Option value={1}><Tag color='green'>营业中</Tag></Option>
              <Option value={0}><Tag color='red'>已歇业</Tag></Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ==================== 菜谱管理 Tab ====================
function MenuTab({ canteens, messageApi }: {
  canteens: Canteen[]; messageApi: ReturnType<typeof message.useMessage>[0];
}) {
  const [menus, setMenus] = useState<MealMenu[]>([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<MealMenu | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [filterDate, setFilterDate] = useState<string>('');
  const [filterCanteen, setFilterCanteen] = useState<string>('');
  const [dishInput, setDishInput] = useState('');

  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/meal_menus');
      setMenus(res.data || []);
    } catch { messageApi.error('加载菜谱失败'); }
    setLoading(false);
  }, [messageApi]);

  useEffect(() => { loadMenus(); }, [loadMenus]);

  const openAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({ status: 'draft', mealType: 'lunch' }); setModal(true); };
  const openEdit = (r: MealMenu) => {
    setEditing(r);
    let dishes: string[] = [];
    try { dishes = JSON.parse(r.dishes); } catch {}
    form.setFieldsValue({ ...r, dishes });
    setModal(true);
  };

  const handleSave = async () => {
    try {
      const vals = await form.validateFields();
      setSubmitting(true);
      const dishes: string[] = vals.dishes || [];
      const totalPrice = dishes.reduce((sum: number, d: string) => {
        const m = d.match(/¥([\d.]+)/); return sum + (m ? parseFloat(m[1]) : 0);
      }, 0);
      const payload = {
        ...vals,
        dishes: JSON.stringify(dishes),
        totalPrice,
      };
      const res = await fetch('/api/meal_menus' + (editing?.id ? '/' + editing.id : ''), {
        method: editing?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing?.id ? payload : { id: 'mm_' + Date.now(), ...payload }),
      });
      if (res.ok) {
        messageApi.success(editing?.id ? '菜谱已更新' : '菜谱已创建');
        setModal(false); loadMenus();
      } else { messageApi.error('保存失败'); }
    } catch { messageApi.error('请检查表单'); }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/meal_menus/' + id, { method: 'DELETE' });
    messageApi.success('已删除'); loadMenus();
  };

  const handlePublish = async (id: string) => {
    await fetch('/api/meal_menus/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'published' }),
    });
    messageApi.success('已发布'); loadMenus();
  };

  const handleUnpublish = async (id: string) => {
    await fetch('/api/meal_menus/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'draft' }),
    });
    messageApi.success('已撤销发布'); loadMenus();
  };

  const addDish = () => {
    const v = dishInput.trim();
    if (!v) return;
    const current = form.getFieldValue('dishes') || [];
    form.setFieldValue('dishes', [...current, v]);
    setDishInput('');
  };

  const columns = [
    { title: '日期', dataIndex: 'date', width: 110 },
    {
      title: '食堂', dataIndex: 'canteenId',
      render: (v: string) => canteens.find(c => c.id === v)?.name || v,
      width: 120,
    },
    { title: '餐次', dataIndex: 'mealType', render: (v: string) => MEAL_TYPE_MAP[v] || v, width: 80 },
    {
      title: '菜品数', dataIndex: 'dishes',
      render: (v: string) => { try { return JSON.parse(v).length + '道'; } catch { return '0道'; } },
      width: 80,
    },
    { title: '人均', dataIndex: 'totalPrice', render: (v: number) => '¥' + (v || 0).toFixed(2), width: 80 },
    {
      title: '状态', dataIndex: 'status',
      render: (v: string) => v === 'published'
        ? <Tag color='green'>已发布</Tag>
        : v === 'closed' ? <Tag color='red'>已关闭</Tag>
        : <Tag color='orange'>草稿</Tag>,
      width: 90,
    },
    {
      title: '操作', width: 200,
      render: (_: unknown, r: MealMenu) => (
        <Space size={4} wrap>
          <Button size='small' icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
          {r.status === 'published'
            ? <Button size='small' onClick={() => handleUnpublish(r.id!)}>撤销</Button>
            : <Button size='small' type='primary' icon={<CheckCircleOutlined />} onClick={() => handlePublish(r.id!)}>发布</Button>
          }
          <Popconfirm title='确认删除？' onConfirm={() => handleDelete(r.id!)} okText='删除' cancelText='取消' okButtonProps={{ danger: true }}>
            <Button size='small' danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredMenus = menus.filter(m => {
    if (filterDate && m.date !== filterDate) return false;
    if (filterCanteen && m.canteenId !== filterCanteen) return false;
    return true;
  });

  return (
    <div>
      <Card
        title={<><CoffeeOutlined /> 菜谱列表</>}
        extra={<Button type='primary' icon={<PlusOutlined />} onClick={openAdd}>新建菜谱</Button>}
      >
        {/* 筛选栏 */}
        <div className='flex gap-2 mb-3 flex-wrap'>
          <DatePicker onChange={(_, ds) => setFilterDate(ds)} placeholder='筛选日期' allowClear />
          <Select placeholder='筛选食堂' allowClear style={{ width: 160 }}
            onChange={v => setFilterCanteen(v || '')} value={filterCanteen || undefined}>
            {canteens.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
          </Select>
          <Button onClick={() => { setFilterDate(''); setFilterCanteen(''); }}>重置</Button>
        </div>
        <Table dataSource={filteredMenus} columns={columns} rowKey='id' size='small'
          pagination={{ pageSize: 10 }} loading={loading} />
      </Card>

      <Modal
        open={modal} title={editing ? '编辑菜谱' : '新建菜谱'}
        onOk={handleSave} onCancel={() => setModal(false)} confirmLoading={submitting}
        width={640} okText='保存'
      >
        <Form form={form} layout='vertical'>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='canteenId' label='食堂' rules={[{ required: true }]}>
                <Select placeholder='选择食堂' showSearch
                  filterOption={(input, opt) => (opt?.children as unknown as string)?.includes(input)}>
                  {canteens.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='date' label='日期' rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name='mealType' label='餐次' rules={[{ required: true }]}>
                <Select>
                  {MEAL_TYPES.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='status' label='状态' initialValue='draft'>
                <Select>
                  <Option value='draft'><Tag color='orange'>草稿</Tag></Option>
                  <Option value='published'><Tag color='green'>发布</Tag></Option>
                  <Option value='closed'><Tag color='red'>关闭</Tag></Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label='菜品列表（每行一道，支持格式如：宫保鸡丁¥12）'>
            <Form.Item noStyle>
              <Input.Search placeholder='输入菜品名称和价格，如：红烧肉¥15' value={dishInput}
                onChange={e => setDishInput(e.target.value)}
                onSearch={addDish} enterButton='添加' />
            </Form.Item>
            <Form.Item name='dishes' noStyle>
              {(() => {
                const dishes = Form.useWatch('dishes', form) || [];
                return dishes.length > 0 ? (
                  <div className='mt-2 max-h-60 overflow-y-auto border rounded p-2'>
                    {DISH_CATEGORIES.map(cat => {
                      const catDishes = dishes.filter((d: string) => d.includes(cat));
                      if (!catDishes.length) return null;
                      return (
                        <div key={cat} className='mb-2'>
                          <div className='text-xs font-bold text-gray-500 mb-1'>{cat}</div>
                          <Space wrap size={4}>
                            {catDishes.map((d: string, i: number) => {
                              const dishIndex = dishes.indexOf(d);
                              return (
                                <Tag
                                  key={i} closable color='blue'
                                  onClose={() => {
                                    const updated = [...dishes]; updated.splice(dishIndex, 1); form.setFieldValue('dishes', updated);
                                  }}
                                >{d}</Tag>
                              );
                            })}
                          </Space>
                        </div>
                      );
                    })}
                    <Divider className='my-2' />
                    <div className='text-right text-orange-500 font-bold'>
                      合计约 ¥{dishes.reduce((s: number, d: string) => { const m = d.match(/¥([\d.]+)/); return s + (m ? parseFloat(m[1]) : 0); }, 0).toFixed(2)} / 人
                    </div>
                  </div>
                ) : (
                  <div className='mt-2 text-gray-400 text-sm'>暂未添加菜品</div>
                );
              })()}
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ==================== 订餐管理 Tab ====================
function OrderTab({ canteens, messageApi }: {
  canteens: Canteen[]; messageApi: ReturnType<typeof message.useMessage>[0];
}) {
  const [orders, setOrders] = useState<MealOrder[]>([]);
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderModal, setOrderModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [selectedDishes, setSelectedDishes] = useState<string[]>([]);
  const [menus, setMenus] = useState<MealMenu[]>([]);

  const today = new Date().toISOString().slice(0, 10);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try { const r = await axios.get('/api/meal_orders'); setOrders(Array.isArray(r.data) ? r.data : []); } catch {}
    try { const r = await axios.get('/api/meal_records'); setRecords(Array.isArray(r.data) ? r.data : []); } catch {}
    try { const r = await axios.get('/api/meal_menus'); setMenus(Array.isArray(r.data) ? r.data : []); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openOrder = () => {
    form.resetFields();
    form.setFieldsValue({ date: today, mealType: 'lunch' });
    setSelectedDishes([]);
    setOrderModal(true);
  };

  const selectedMenu = useCallback(() => {
    const canteenId = form.getFieldValue('canteenId');
    const date = form.getFieldValue('date');
    const mealType = form.getFieldValue('mealType');
    if (!canteenId || !date || !mealType) return null;
    return menus.find(m => m.canteenId === canteenId && m.date === date && m.mealType === mealType);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.getFieldValue('canteenId'), form.getFieldValue('date'), form.getFieldValue('mealType'), menus]);

  const selectedTotal = useCallback(() => {
    const menu = selectedMenu();
    if (!menu) return 0;
    try {
      const all: string[] = JSON.parse(menu.dishes);
      return all.filter(d => selectedDishes.includes(d)).reduce((sum, d) => {
        const m = d.match(/¥([\d.]+)/); return sum + (m ? parseFloat(m[1]) : 0);
      }, 0);
    } catch { return 0; }
  }, [selectedMenu, selectedDishes]);

  const handleSubmitOrder = async () => {
    try {
      const vals = await form.validateFields();
      if (selectedDishes.length === 0) { messageApi.warning('请至少选择一道菜'); return; }
      setSubmitting(true);
      const menu = selectedMenu();
      const res = await fetch('/api/meal_orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'mo_' + Date.now(),
          menuId: menu?.id || '',
          canteenId: vals.canteenId,
          employeeId: 'emp-1',
          employeeName: '当前用户',
          date: vals.date || today,
          mealType: vals.mealType,
          dishes: JSON.stringify(selectedDishes),
          totalPrice: selectedTotal(),
          status: 'ordered',
          remark: vals.remark || '',
        }),
      });
      if (res.ok) { messageApi.success('订餐成功'); setOrderModal(false); loadAll(); }
      else { messageApi.error('订餐失败'); }
    } catch { messageApi.error('请检查表单'); }
    setSubmitting(false);
  };

  const handleCancelOrder = async (id: string) => {
    await fetch('/api/meal_orders/' + id, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    messageApi.success('已取消'); loadAll();
  };

  const statusTag = (s: string) => {
    const map: Record<string, { color: string; text: string }> = {
      ordered: { color: 'blue', text: '待就餐' },
      completed: { color: 'green', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' },
    };
    const m = map[s] || { color: 'default', text: s };
    return <Tag color={m.color}>{m.text}</Tag>;
  };

  const orderColumns = [
    { title: '日期', dataIndex: 'date', width: 110 },
    { title: '食堂', dataIndex: 'canteenId', render: (v: string) => canteens.find(c => c.id === v)?.name || v, width: 100 },
    { title: '餐次', dataIndex: 'mealType', render: (v: string) => MEAL_TYPE_MAP[v] || v, width: 80 },
    { title: '菜品', dataIndex: 'dishes', render: (v: string) => { try { const a = JSON.parse(v); return a.slice(0, 2).join('、') + (a.length > 2 ? '...' : ''); } catch { return v; } } },
    { title: '金额', dataIndex: 'totalPrice', render: (v: number) => '¥' + (v || 0).toFixed(2), width: 80 },
    { title: '状态', dataIndex: 'status', render: statusTag, width: 90 },
    { title: '操作', width: 80, render: (_: unknown, r: MealOrder) => r.status === 'ordered' ? (
      <Popconfirm title='确认取消？' onConfirm={() => handleCancelOrder(r.id!)} okText='取消' cancelText='保留' okButtonProps={{ danger: true }}>
        <Button size='small' danger>取消</Button>
      </Popconfirm>
    ) : null },
  ];

  const recordColumns = [
    { title: '姓名', dataIndex: 'employeeName' },
    { title: '食堂', dataIndex: 'canteenName' },
    { title: '日期', dataIndex: 'date' },
    { title: '餐次', dataIndex: 'mealType', render: (v: string) => MEAL_TYPE_MAP[v] || v },
    { title: '金额', dataIndex: 'cost', render: (v: number) => '¥' + (v || 0).toFixed(2) },
  ];

  return (
    <div>
      <Row gutter={16} className='mb-4'>
        <Col span={12}>
          <Card size='small' title={<><ShoppingCartOutlined /> 订餐记录</>}
            extra={<Button type='primary' icon={<PlusOutlined />} size='small' onClick={openOrder}>我要订餐</Button>}>
            <Table dataSource={orders} columns={orderColumns} rowKey='id' size='small'
              pagination={{ pageSize: 8 }} loading={loading} />
          </Card>
        </Col>
        <Col span={12}>
          <Card size='small' title={<><TeamOutlined /> 今日就餐记录</>}>
            <Table dataSource={records.filter(r => r.date === today)} columns={recordColumns} rowKey='id' size='small'
              pagination={{ pageSize: 8 }} loading={loading} />
          </Card>
        </Col>
      </Row>

      <Modal
        open={orderModal} title='我要订餐' onOk={handleSubmitOrder}
        onCancel={() => setOrderModal(false)} confirmLoading={submitting} width={620} okText='提交订单'
      >
        <Form form={form} layout='vertical'>
          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name='canteenId' label='选择食堂' rules={[{ required: true }]}>
                <Select placeholder='选择食堂' showSearch
                  filterOption={(input, opt) => (opt?.children as unknown as string)?.includes(input)}
                  onChange={() => setSelectedDishes([])}>
                  {canteens.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name='date' label='日期' rules={[{ required: true }]} initialValue={today}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name='mealType' label='餐次' rules={[{ required: true }]} initialValue='lunch'>
                <Select onChange={() => setSelectedDishes([])}>
                  {MEAL_TYPES.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name='remark' label='备注'>
            <TextArea rows={1} placeholder='如有特殊需求请备注' maxLength={200} showCount />
          </Form.Item>

          {(() => {
            const canteenId = form.getFieldValue('canteenId');
            const date = form.getFieldValue('date');
            const mealType = form.getFieldValue('mealType');
            const menu = canteenId && date && mealType
              ? menus.find(m => m.canteenId === canteenId && m.date === date && m.mealType === mealType)
              : null;

            if (canteenId && date && mealType && !menu) {
              return <Alert message='该食堂当天此餐次暂无菜谱，请先在"菜谱管理"中添加' type='warning' showIcon />;
            }
            if (!canteenId || !date || !mealType) {
              return <Alert message='请先选择食堂、日期和餐次' type='info' showIcon />;
            }
            if (menu) {
              const groups = groupDishes(menu.dishes);
              return (
                <div>
                  <Divider orientation='left'>可选菜品（勾选你要的菜）</Divider>
                  {Object.entries(groups).map(([cat, dishes]) => (
                    <div key={cat} className='mb-2'>
                      <div className='text-sm font-bold text-gray-600 mb-1'>{cat}</div>
                      <Checkbox.Group value={selectedDishes} onChange={vals => setSelectedDishes(vals as string[])}>
                        <Row gutter={[8, 4]}>
                          {dishes.map((d: string) => {
                            const price = d.match(/¥([\d.]+)/)?.[1] || '0';
                            return (
                              <Col key={d} span={12}>
                                <Checkbox value={d}>{d} <span className='text-orange-500'>¥{price}</span></Checkbox>
                              </Col>
                            );
                          })}
                        </Row>
                      </Checkbox.Group>
                    </div>
                  ))}
                  <Divider />
                  <div className='text-right'>
                    已选 <strong>{selectedDishes.length}</strong> 道，合计
                    <span className='text-orange-500 text-lg font-bold ml-2'>
                      ¥{selectedTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </Form>
      </Modal>
    </div>
  );
}

// ==================== 统计 Tab ====================
function StatsTab({ canteens, messageApi }: {
  canteens: Canteen[]; messageApi: ReturnType<typeof message.useMessage>[0];
}) {
  const [orders, setOrders] = useState<MealOrder[]>([]);
  const [records, setRecords] = useState<MealRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try { const r = await axios.get('/api/meal_orders'); setOrders(Array.isArray(r.data) ? r.data : []); } catch {}
    try { const r = await axios.get('/api/meal_records'); setRecords(Array.isArray(r.data) ? r.data : []); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter(o => o.date === today && o.status === 'ordered');
  const todayRecords = records.filter(r => r.date === today);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);

  return (
    <Row gutter={[16, 16]}>
      {canteens.map(c => {
        const ordered = todayOrders.filter(o => o.canteenId === c.id).length;
        const usage = c.capacity > 0 ? (ordered / c.capacity * 100).toFixed(0) : 0;
        return (
          <Col span={12} key={c.id}>
            <Card size='small' hoverable>
              <Statistic
                title={<><CoffeeOutlined style={{ marginRight: 6 }} />{c.name} <span className='text-gray-400 text-xs font-normal ml-2'>{c.location}</span></>}
                value={ordered}
                suffix={`/ ${c.capacity}人`}
                valueStyle={{ color: ordered > c.capacity * 0.8 ? '#faad14' : '#3f8600' }}
              />
              <div className='mt-1'>
                <div className='text-xs text-gray-500'>
                  就餐人次：{todayRecords.filter(r => r.canteenName === c.name).length} |
                  今日订餐：{ordered} |
                  <span className={ordered >= c.capacity ? ' text-red-500' : ''}> 上座率 {usage}%</span>
                </div>
              </div>
            </Card>
          </Col>
        );
      })}
      <Col span={8}>
        <Card size='small' hoverable>
          <Statistic title='今日就餐人次' value={todayRecords.length} prefix={<TeamOutlined />} />
        </Card>
      </Col>
      <Col span={8}>
        <Card size='small' hoverable>
          <Statistic title='总订餐数' value={totalOrders} prefix={<ShoppingCartOutlined />} />
        </Card>
      </Col>
      <Col span={8}>
        <Card size='small' hoverable>
          <Statistic title='累计收入' value={totalRevenue} prefix='¥' precision={2} suffix='元' valueStyle={{ color: '#cf1322' }} />
        </Card>
      </Col>
    </Row>
  );
}

// ==================== 主页面 ====================
export default function CanteenPage() {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [messageApi, ctxHolder] = message.useMessage();

  const loadCanteens = useCallback(async () => {
    const res = await axios.get('/api/canteens');
    const list: Canteen[] = (res.data || []).map((c: Canteen) => ({
      ...c,
      status: c.isActive === 1 ? 'active' : 'inactive',
    }));
    setCanteens(list);
  }, []);

  useEffect(() => { loadCanteens(); }, [loadCanteens]);

  const tabItems = [
    { key: 'canteen', label: <><CoffeeOutlined /> 食堂管理</>, children: <CanteenTab canteens={canteens} loadCanteens={loadCanteens} messageApi={messageApi} /> },
    { key: 'menu', label: <><CoffeeOutlined /> 菜谱管理</>, children: <MenuTab canteens={canteens} messageApi={messageApi} /> },
    { key: 'order', label: <><ShoppingCartOutlined /> 订餐管理</>, children: <OrderTab canteens={canteens} messageApi={messageApi} /> },
    { key: 'stats', label: <><TeamOutlined /> 统计概览</>, children: <StatsTab canteens={canteens} messageApi={messageApi} /> },
  ];

  return (
    <div className='p-4'>
      {ctxHolder}
      <Card title={<><CoffeeOutlined /> 食堂管理系统</>} className='mb-4'>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
}
