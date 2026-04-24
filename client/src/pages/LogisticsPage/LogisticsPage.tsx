import React, { useState, useEffect } from 'react';

interface IDormitory {
  id: string;
  building: string;
  room: string;
  capacity: number;
  occupied: number;
  manager: string;
  phone: string;
  status: 'available' | 'full' | 'maintenance';
}

interface IVehicle {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  seats: number;
  status: 'available' | 'in_use' | 'maintenance';
  driver: string;
  driverPhone: string;
  lastMaintenance: string;
}

interface ICanteen {
  id: string;
  name: string;
  location: string;
  capacity: number;
  mealsPerDay: number;
  manager: string;
  phone: string;
  rating: number;
}

interface IVisitor {
  id: string;
  name: string;
  phone: string;
  company: string;
  purpose: string;
  visitDate: string;
  visitTime: string;
  hostName: string;
  hostDepartment: string;
  status: 'pending' | 'approved' | 'visited' | 'left';
  inTime?: string;
  outTime?: string;
}

const dormitoryStatusMap: Record<string, { label: string; className: string }> = {
  available: { label: '可用', className: 'bg-success/10 text-success' },
  full: { label: '已满', className: 'bg-yellow-100 text-yellow-700' },
  maintenance: { label: '维护中', className: 'bg-destructive/10 text-destructive' },
};

const vehicleStatusMap: Record<string, { label: string; className: string }> = {
  available: { label: '空闲', className: 'bg-success/10 text-success' },
  in_use: { label: '使用中', className: 'bg-blue-100 text-blue-700' },
  maintenance: { label: '维护中', className: 'bg-destructive/10 text-destructive' },
};

const visitorStatusMap: Record<string, { label: string; className: string }> = {
  pending: { label: '待审批', className: 'bg-yellow-100 text-yellow-700' },
  approved: { label: '已批准', className: 'bg-blue-100 text-blue-700' },
  visited: { label: '已到访', className: 'bg-purple-100 text-purple-700' },
  left: { label: '已离开', className: 'bg-muted text-muted-foreground' },
};

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dormitories, setDormitories] = useState<IDormitory[]>([]);
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [canteens, setCanteens] = useState<ICanteen[]>([]);
  const [visitors, setVisitors] = useState<IVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDormitoryForm, setShowDormitoryForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [editingDormitory, setEditingDormitory] = useState<IDormitory | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<IVehicle | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/dormitories').then(r => r.json()),
      fetch('/api/vehicles').then(r => r.json()),
      fetch('/api/canteens').then(r => r.json()),
      fetch('/api/visitors').then(r => r.json()),
    ]).then(([dormData, vehicleData, canteenData, visitorData]) => {
      setDormitories(Array.isArray(dormData) ? dormData : []);
      setVehicles(Array.isArray(vehicleData) ? vehicleData : []);
      setCanteens(Array.isArray(canteenData) ? canteenData : []);
      setVisitors(Array.isArray(visitorData) ? visitorData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // 统计数据
  const stats = {
    dormitories: {
      total: dormitories.length,
      available: dormitories.filter(d => d.status === 'available').length,
      totalCapacity: dormitories.reduce((sum, d) => sum + d.capacity, 0),
      totalOccupied: dormitories.reduce((sum, d) => sum + d.occupied, 0),
    },
    vehicles: {
      total: vehicles.length,
      available: vehicles.filter(v => v.status === 'available').length,
      inUse: vehicles.filter(v => v.status === 'in_use').length,
    },
    canteens: {
      total: canteens.length,
      totalCapacity: canteens.reduce((sum, c) => sum + c.capacity, 0),
      totalMeals: canteens.reduce((sum, c) => sum + c.mealsPerDay, 0),
      avgRating: canteens.length > 0 ? (canteens.reduce((sum, c) => sum + c.rating, 0) / canteens.length).toFixed(1) : 0,
    },
    visitors: {
      today: visitors.filter(v => v.visitDate === new Date().toISOString().slice(0, 10)).length,
      pending: visitors.filter(v => v.status === 'pending').length,
      visited: visitors.filter(v => v.status === 'visited').length,
    },
  };

  // 保存宿舍
  const saveDormitory = (dorm: Partial<IDormitory>) => {
    const method = editingDormitory ? 'PUT' : 'POST';
    const url = editingDormitory ? `/api/dormitories/${editingDormitory.id}` : '/api/dormitories';
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dorm),
    }).then(() => {
      setShowDormitoryForm(false);
      setEditingDormitory(null);
      fetch('/api/dormitories').then(r => r.json()).then(data => setDormitories(Array.isArray(data) ? data : []));
    });
  };

  // 保存车辆
  const saveVehicle = (vehicle: Partial<IVehicle>) => {
    const method = editingVehicle ? 'PUT' : 'POST';
    const url = editingVehicle ? `/api/vehicles/${editingVehicle.id}` : '/api/vehicles';
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vehicle),
    }).then(() => {
      setShowVehicleForm(false);
      setEditingVehicle(null);
      fetch('/api/vehicles').then(r => r.json()).then(data => setVehicles(Array.isArray(data) ? data : []));
    });
  };

  // 更新访客状态
  const updateVisitorStatus = (id: string, status: IVisitor['status']) => {
    fetch(`/api/visitors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).then(() => fetch('/api/visitors').then(r => r.json()).then(data => setVisitors(Array.isArray(data) ? data : [])));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">🏠 后勤管理</h1>
        <p className="text-sm text-muted-foreground mt-1">管理宿舍、车辆、食堂、访客等后勤资源</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-blue-500/10 rounded-xl p-4 text-blue-600">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏠</span>
            <div>
              <div className="text-2xl font-bold">{stats.dormitories.totalOccupied}/{stats.dormitories.totalCapacity}</div>
              <div className="text-xs opacity-80">宿舍入住</div>
            </div>
          </div>
        </div>
        <div className="bg-emerald-500/10 rounded-xl p-4 text-emerald-600">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚗</span>
            <div>
              <div className="text-2xl font-bold">{stats.vehicles.available}/{stats.vehicles.total}</div>
              <div className="text-xs opacity-80">车辆空闲</div>
            </div>
          </div>
        </div>
        <div className="bg-purple-500/10 rounded-xl p-4 text-purple-600">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <div className="text-2xl font-bold">{stats.canteens.avgRating}</div>
              <div className="text-xs opacity-80">食堂评分</div>
            </div>
          </div>
        </div>
        <div className="bg-orange-500/10 rounded-xl p-4 text-orange-600">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👥</span>
            <div>
              <div className="text-2xl font-bold">{stats.visitors.today}</div>
              <div className="text-xs opacity-80">今日访客</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="border-b">
        {[
          { key: 'overview', icon: '📊', label: '后勤总览' },
          { key: 'dormitories', icon: '🏠', label: '宿舍管理' },
          { key: 'vehicles', icon: '🚗', label: '车辆管理' },
          { key: 'canteens', icon: '🍽️', label: '食堂管理' },
          { key: 'visitors', icon: '👥', label: '访客管理' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab内容 */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : (
        <>
          {/* 后勤总览Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 宿舍概览 */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4">🏠 宿舍概览</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.dormitories.total}</div>
                    <div className="text-xs text-muted-foreground">宿舍总数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{stats.dormitories.available}</div>
                    <div className="text-xs text-muted-foreground">可用宿舍</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{Math.round((stats.dormitories.totalOccupied / stats.dormitories.totalCapacity) * 100)}%</div>
                    <div className="text-xs text-muted-foreground">入住率</div>
                  </div>
                </div>
              </div>

              {/* 车辆概览 */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4">🚗 车辆概览</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.vehicles.total}</div>
                    <div className="text-xs text-muted-foreground">车辆总数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{stats.vehicles.available}</div>
                    <div className="text-xs text-muted-foreground">空闲车辆</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.vehicles.inUse}</div>
                    <div className="text-xs text-muted-foreground">使用中</div>
                  </div>
                </div>
              </div>

              {/* 食堂概览 */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4">🍽️ 食堂概览</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.canteens.total}</div>
                    <div className="text-xs text-muted-foreground">食堂数量</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.canteens.totalMeals}</div>
                    <div className="text-xs text-muted-foreground">日均供餐</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.canteens.avgRating}⭐</div>
                    <div className="text-xs text-muted-foreground">平均评分</div>
                  </div>
                </div>
              </div>

              {/* 访客概览 */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4">👥 访客概览</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.visitors.today}</div>
                    <div className="text-xs text-muted-foreground">今日访客</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.visitors.pending}</div>
                    <div className="text-xs text-muted-foreground">待审批</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.visitors.visited}</div>
                    <div className="text-xs text-muted-foreground">已到访</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 宿舍管理Tab */}
          {activeTab === 'dormitories' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => { setEditingDormitory(null); setShowDormitoryForm(true); }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  + 新增宿舍
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dormitories.map(dorm => (
                  <div key={dorm.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{dorm.building} - {dorm.room}</h3>
                        <p className="text-sm text-muted-foreground">{dorm.manager}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${dormitoryStatusMap[dorm.status]?.className}`}>
                        {dormitoryStatusMap[dorm.status]?.label}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">入住情况</span>
                        <span>{dorm.occupied}/{dorm.capacity}人</span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(dorm.occupied / dorm.capacity) * 100}%` }} />
                      </div>
                      <div className="text-muted-foreground">📞 {dorm.phone}</div>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t">
                      <button onClick={() => { setEditingDormitory(dorm); setShowDormitoryForm(true); }} className="flex-1 py-1.5 border border-input rounded-lg text-sm hover:bg-muted">编辑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 车辆管理Tab */}
          {activeTab === 'vehicles' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => { setEditingVehicle(null); setShowVehicleForm(true); }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  + 新增车辆
                </button>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">车牌号</th>
                      <th className="text-left p-3 font-medium">品牌型号</th>
                      <th className="text-left p-3 font-medium">座位数</th>
                      <th className="text-left p-3 font-medium">司机</th>
                      <th className="text-left p-3 font-medium">状态</th>
                      <th className="text-left p-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((vehicle, i) => (
                      <tr key={vehicle.id} className={`border-b hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                        <td className="p-3 font-mono font-medium">{vehicle.plateNumber}</td>
                        <td className="p-3">{vehicle.brand} {vehicle.model}</td>
                        <td className="p-3">{vehicle.seats}座</td>
                        <td className="p-3">
                          <div>{vehicle.driver}</div>
                          <div className="text-xs text-muted-foreground">{vehicle.driverPhone}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${vehicleStatusMap[vehicle.status]?.className}`}>
                            {vehicleStatusMap[vehicle.status]?.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <button onClick={() => { setEditingVehicle(vehicle); setShowVehicleForm(true); }} className="text-primary hover:underline text-xs">编辑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 食堂管理Tab */}
          {activeTab === 'canteens' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canteens.map(canteen => (
                <div key={canteen.id} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{canteen.name}</h3>
                      <p className="text-sm text-muted-foreground">{canteen.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600">{canteen.rating}⭐</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">容纳人数</span>
                      <div className="font-medium">{canteen.capacity}人</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">日均供餐</span>
                      <div className="font-medium">{canteen.mealsPerDay}份</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">负责人</span>
                      <div className="font-medium">{canteen.manager}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">联系电话</span>
                      <div className="font-medium">{canteen.phone}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 访客管理Tab */}
          {activeTab === 'visitors' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowVisitorForm(true)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  + 登记访客
                </button>
              </div>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 font-medium">访客姓名</th>
                      <th className="text-left p-3 font-medium">所属公司</th>
                      <th className="text-left p-3 font-medium">来访目的</th>
                      <th className="text-left p-3 font-medium">受访人</th>
                      <th className="text-left p-3 font-medium">来访时间</th>
                      <th className="text-left p-3 font-medium">状态</th>
                      <th className="text-left p-3 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((visitor, i) => (
                      <tr key={visitor.id} className={`border-b hover:bg-muted/30 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                        <td className="p-3 font-medium">{visitor.name}</td>
                        <td className="p-3">{visitor.company}</td>
                        <td className="p-3">{visitor.purpose}</td>
                        <td className="p-3">{visitor.hostName}</td>
                        <td className="p-3">{visitor.visitDate} {visitor.visitTime}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${visitorStatusMap[visitor.status]?.className}`}>
                            {visitorStatusMap[visitor.status]?.label}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            {visitor.status === 'pending' && (
                              <button onClick={() => updateVisitorStatus(visitor.id, 'approved')} className="text-success hover:underline text-xs">批准</button>
                            )}
                            {visitor.status === 'approved' && (
                              <button onClick={() => updateVisitorStatus(visitor.id, 'visited')} className="text-primary hover:underline text-xs">登记到访</button>
                            )}
                            {visitor.status === 'visited' && (
                              <button onClick={() => updateVisitorStatus(visitor.id, 'left')} className="text-muted-foreground hover:underline text-xs">登记离开</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* 宿舍表单弹窗 */}
      {showDormitoryForm && (
        <FormModal title={editingDormitory ? '编辑宿舍' : '新增宿舍'} onClose={() => { setShowDormitoryForm(false); setEditingDormitory(null); }}>
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            saveDormitory({
              building: formData.get('building') as string,
              room: formData.get('room') as string,
              capacity: Number(formData.get('capacity')),
              occupied: Number(formData.get('occupied')),
              manager: formData.get('manager') as string,
              phone: formData.get('phone') as string,
              status: formData.get('status') as any,
            });
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">楼栋</label>
                <input name="building" required defaultValue={editingDormitory?.building} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">房间号</label>
                <input name="room" required defaultValue={editingDormitory?.room} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">容纳人数</label>
                <input name="capacity" type="number" required defaultValue={editingDormitory?.capacity || 4} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">已住人数</label>
                <input name="occupied" type="number" defaultValue={editingDormitory?.occupied || 0} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">管理员</label>
                <input name="manager" defaultValue={editingDormitory?.manager} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">联系电话</label>
                <input name="phone" defaultValue={editingDormitory?.phone} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">状态</label>
                <select name="status" defaultValue={editingDormitory?.status || 'available'} className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                  <option value="available">可用</option>
                  <option value="full">已满</option>
                  <option value="maintenance">维护中</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={() => { setShowDormitoryForm(false); setEditingDormitory(null); }} className="px-4 py-2 border border-input rounded-lg hover:bg-muted">取消</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">保存</button>
            </div>
          </form>
        </FormModal>
      )}

      {/* 车辆表单弹窗 */}
      {showVehicleForm && (
        <FormModal title={editingVehicle ? '编辑车辆' : '新增车辆'} onClose={() => { setShowVehicleForm(false); setEditingVehicle(null); }}>
          <form onSubmit={e => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const formData = new FormData(form);
            saveVehicle({
              plateNumber: formData.get('plateNumber') as string,
              brand: formData.get('brand') as string,
              model: formData.get('model') as string,
              seats: Number(formData.get('seats')),
              status: formData.get('status') as any,
              driver: formData.get('driver') as string,
              driverPhone: formData.get('driverPhone') as string,
            });
          }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">车牌号 *</label>
                <input name="plateNumber" required defaultValue={editingVehicle?.plateNumber} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">品牌</label>
                <input name="brand" defaultValue={editingVehicle?.brand} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">型号</label>
                <input name="model" defaultValue={editingVehicle?.model} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">座位数</label>
                <input name="seats" type="number" defaultValue={editingVehicle?.seats || 5} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">司机</label>
                <input name="driver" defaultValue={editingVehicle?.driver} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">司机电话</label>
                <input name="driverPhone" defaultValue={editingVehicle?.driverPhone} className="w-full px-3 py-2 border border-input rounded-lg bg-background" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1">状态</label>
                <select name="status" defaultValue={editingVehicle?.status || 'available'} className="w-full px-3 py-2 border border-input rounded-lg bg-background">
                  <option value="available">空闲</option>
                  <option value="in_use">使用中</option>
                  <option value="maintenance">维护中</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={() => { setShowVehicleForm(false); setEditingVehicle(null); }} className="px-4 py-2 border border-input rounded-lg hover:bg-muted">取消</button>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">保存</button>
            </div>
          </form>
        </FormModal>
      )}
    </div>
  );
}

// 表单弹窗组件
function FormModal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
