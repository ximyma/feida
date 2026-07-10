import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Package, Warehouse, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Inventory {
  id: string;
  warehouse_id: string;
  location_id: string;
  sku_id: string;
  material_id: string;
  qty: number;
  locked_qty: number;
  unit: string;
  batch_no: string;
  expiry_date: string;
  cost_price: number;
}

interface WarehouseData {
  id: string;
  code: string;
  name: string;
}

interface LocationData {
  id: string;
  code: string;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/inventory').then(r => r.json()),
      fetch('/api/warehouses').then(r => r.json()),
      fetch('/api/locations').then(r => r.json())
    ]).then(([invData, whData, locData]) => {
      setInventory(Array.isArray(invData) ? invData : []);
      setWarehouses(Array.isArray(whData) ? whData.filter((w: any) => w.status === 'active') : []);
      setLocations(Array.isArray(locData) ? locData.filter((l: any) => l.status !== 'deleted') : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const getWarehouseInfo = (id: string) => warehouses.find(w => w.id === id) || { code: '-', name: '-' };
  const getLocationCode = (id: string) => locations.find(l => l.id === id)?.code || '-';

  const filtered = inventory.filter(item => {
    if (selectedWarehouse && item.warehouse_id !== selectedWarehouse) return false;
    if (selectedLocation && item.location_id !== selectedLocation) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return item.batch_no?.toLowerCase().includes(kw) || item.sku_id?.toLowerCase().includes(kw);
    }
    return true;
  });

  const totalQty = filtered.reduce((sum, i) => sum + (i.qty || 0), 0);
  const totalValue = filtered.reduce((sum, i) => sum + ((i.qty || 0) * (i.cost_price || 0)), 0);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/warehouse" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">库存查询</h1><p className="text-sm text-gray-500">实时库存数量查询</p></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-blue-600">{filtered.length}</div>
          <div className="text-sm text-gray-600">库存种类</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-green-600">{totalQty}</div>
          <div className="text-sm text-gray-600">库存总量</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-orange-600">¥{totalValue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">库存金额</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="text-2xl font-bold text-purple-600">{warehouses.length}</div>
          <div className="text-sm text-gray-600">仓库数量</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="搜索批次/编码..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
          <div className="relative w-48">
            <select value={selectedWarehouse} onChange={(e) => { setSelectedWarehouse(e.target.value); setSelectedLocation(''); }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white">
              <option value="">全部仓库</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.code} - {w.name}</option>)}
            </select>
          </div>
          {selectedWarehouse && (
            <div className="relative w-48">
              <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none bg-white">
                <option value="">全部货位</option>
                {locations.filter(l => !l.warehouse_id || l.warehouse_id === selectedWarehouse).map(l => <option key={l.id} value={l.id}>{l.code}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">仓库</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">货位</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">SKU/物料</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">批次号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">数量</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">锁定</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">成本价</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">到期日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => {
                const wh = getWarehouseInfo(item.warehouse_id);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1"><Warehouse className="w-3 h-3 text-gray-400" />{wh.code}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-700"><span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" />{getLocationCode(item.location_id)}</span></td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.sku_id || item.material_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.batch_no || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700"><span className={item.qty > 0 ? 'text-green-600' : 'text-red-600'}>{item.qty} {item.unit}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.locked_qty} {item.unit}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">¥{item.cost_price}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.expiry_date || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无库存数据</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
