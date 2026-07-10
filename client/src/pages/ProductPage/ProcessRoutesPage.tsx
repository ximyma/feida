import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Cpu, GripVertical, Eye, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Process {
  id: string;
  name: string;
  code: string;
}

interface RouteItem {
  id: string;
  process_id: string;
  sort_order: number;
  standard_time: number;
  piece_rate: number;
  description: string;
  process?: Process;
}

interface ProcessRoute {
  id: string;
  name: string;
  code: string;
  description: string;
  is_default: number;
  status: string;
  items?: RouteItem[];
}

export default function ProcessRoutesPage() {
  const [routes, setRoutes] = useState<ProcessRoute[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProcessRoute | null>(null);
  const [viewing, setViewing] = useState<ProcessRoute | null>(null);
  const [formData, setFormData] = useState({
    name: '', code: '', description: '', is_default: 0
  });
  const [items, setItems] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [routesData, processesData] = await Promise.all([
        fetch('/api/process-routes').then(r => r.json()),
        fetch('/api/processes').then(r => r.json()),
      ]);
      setRoutes(Array.isArray(routesData) ? routesData : []);
      setProcesses(Array.isArray(processesData) ? processesData : []);
    } catch (e) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      message.warning('请输入工艺路线名称');
      return;
    }
    if (items.length === 0) {
      message.warning('请至少添加一个工序');
      return;
    }
    try {
      const payload = { ...formData, items };
      if (editing) {
        await fetch(`/api/process-routes/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        message.success('更新成功');
      } else {
        await fetch('/api/process-routes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        message.success('添加成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (e) {
      message.error('保存失败');
    }
  };

  const handleView = async (route: ProcessRoute) => {
    try {
      const data = await fetch(`/api/process-routes/${route.id}`).then(r => r.json());
      setViewing(data);
      setViewModalOpen(true);
    } catch (e) {
      message.error('获取详情失败');
    }
  };

  const handleEdit = async (route: ProcessRoute) => {
    try {
      const data = await fetch(`/api/process-routes/${route.id}`).then(r => r.json());
      setEditing(route);
      setFormData({
        name: data.name,
        code: data.code || '',
        description: data.description || '',
        is_default: data.is_default || 0,
      });
      setItems(data.items?.map((item: any) => ({
        process_id: item.process_id,
        sort_order: item.sort_order,
        standard_time: item.standard_time,
        piece_rate: item.piece_rate,
        description: item.description,
      })) || []);
      setModalOpen(true);
    } catch (e) {
      message.error('获取详情失败');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该工艺路线？')) return;
    try {
      await fetch(`/api/process-routes/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const addItem = () => {
    if (processes.length === 0) {
      message.warning('请先添加工序');
      return;
    }
    setItems([...items, {
      process_id: processes[0]?.id || '',
      sort_order: items.length + 1,
      standard_time: 0,
      piece_rate: 0,
      description: '',
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const getProcessName = (processId: string) => {
    return processes.find(p => p.id === processId)?.name || '-';
  };

  const filteredRoutes = routes.filter(r =>
    r.name.toLowerCase().includes(searchText.toLowerCase()) ||
    r.code?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/plm" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">工艺路线</h1>
          <p className="text-sm text-gray-500">管理产品生产工艺路线和工序组合</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索工艺路线..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setFormData({ name: '', code: '', description: '', is_default: 0 });
              setItems([]);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加工艺路线
          </button>
        </div>

        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">编码</th>
                <th className="pb-3 font-medium">工艺路线名称</th>
                <th className="pb-3 font-medium">工序数</th>
                <th className="pb-3 font-medium">默认路线</th>
                <th className="pb-3 font-medium">状态</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoutes.map((route) => (
                <tr key={route.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-mono text-sm">{route.code || '-'}</td>
                  <td className="py-3 font-medium">{route.name}</td>
                  <td className="py-3 text-gray-500">{route.items?.length || 0} 道工序</td>
                  <td className="py-3">
                    {route.is_default ? (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" /> 默认
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${route.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {route.status === 'active' ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleView(route)} className="text-gray-600 hover:bg-gray-100 p-1 rounded transition-colors" title="查看">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(route)} className="text-green-600 hover:bg-green-50 p-1 rounded transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(route.id)} className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRoutes.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              <Cpu className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无工艺路线</p>
              <button onClick={() => setModalOpen(true)} className="mt-4 text-green-600 hover:underline">
                添加第一条工艺路线
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 添加/编辑弹窗 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? '编辑工艺路线' : '添加工艺路线'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">路线编码</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">路线名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="如：跑鞋标准工艺路线"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_default === 1}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">设为默认工艺路线</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={2}
                />
              </div>

              {/* 工序列表 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">工序列表 *</label>
                  <button onClick={addItem} className="text-sm text-green-600 hover:underline">
                    + 添加工序
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                      <select
                        value={item.process_id}
                        onChange={(e) => updateItem(index, 'process_id', e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        {processes.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.standard_time}
                        onChange={(e) => updateItem(index, 'standard_time', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                        placeholder="工时"
                      />
                      <input
                        type="number"
                        value={item.piece_rate}
                        onChange={(e) => updateItem(index, 'piece_rate', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                        placeholder="单价"
                      />
                      <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      暂无工序，请点击"添加工序"按钮
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                取消
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 查看弹窗 */}
      {viewModalOpen && viewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">工艺路线详情</h2>
            <div className="mb-4">
              <h3 className="font-medium text-lg">{viewing.name}</h3>
              <p className="text-sm text-gray-500">{viewing.description || '暂无描述'}</p>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">序号</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">工序</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">标准工时(分钟)</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">计件单价(元)</th>
                  </tr>
                </thead>
                <tbody>
                  {viewing.items?.map((item: any, index: number) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-2 text-sm">{index + 1}</td>
                      <td className="px-4 py-2 text-sm font-medium">{getProcessName(item.process_id)}</td>
                      <td className="px-4 py-2 text-sm">{item.standard_time || 0}</td>
                      <td className="px-4 py-2 text-sm">¥{item.piece_rate || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
