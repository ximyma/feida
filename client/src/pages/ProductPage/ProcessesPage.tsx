import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Process {
  id: string;
  name: string;
  code: string;
  process_type: string;
  standard_time: number;
  piece_rate: number;
  unit: string;
  department: string;
  description: string;
}

const PROCESS_TYPES = ['裁断', '针车', '成型', '包装', '组装', '质检', '其他'];
const DEPARTMENTS = ['裁断车间', '针车车间', '成型车间', '包装车间', '质检车间'];

export default function ProcessesPage() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Process | null>(null);
  const [formData, setFormData] = useState({
    name: '', code: '', process_type: '', standard_time: 0,
    piece_rate: 0, unit: '双', department: '', description: ''
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await fetch('/api/processes').then(r => r.json());
      setProcesses(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error('获取工序数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      message.warning('请输入工序名称');
      return;
    }
    try {
      if (editing) {
        await fetch(`/api/processes/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        message.success('更新成功');
      } else {
        await fetch('/api/processes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        message.success('添加成功');
      }
      setModalOpen(false);
      fetchData();
    } catch (e) {
      message.error('保存失败');
    }
  };

  const handleEdit = (item: Process) => {
    setEditing(item);
    setFormData({
      name: item.name,
      code: item.code || '',
      process_type: item.process_type || '',
      standard_time: item.standard_time || 0,
      piece_rate: item.piece_rate || 0,
      unit: item.unit || '双',
      department: item.department || '',
      description: item.description || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该工序？')) return;
    try {
      await fetch(`/api/processes/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      fetchData();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const filteredProcesses = processes.filter(p =>
    p.name.toLowerCase().includes(searchText.toLowerCase()) ||
    p.code?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/plm" className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">工序库</h1>
          <p className="text-sm text-gray-500">管理裁断、针车、成型、包装等生产工序</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索工序..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setFormData({ name: '', code: '', process_type: '', standard_time: 0, piece_rate: 0, unit: '双', department: '', description: '' });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加工序
          </button>
        </div>

        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">编码</th>
                <th className="pb-3 font-medium">工序名称</th>
                <th className="pb-3 font-medium">类型</th>
                <th className="pb-3 font-medium">所属车间</th>
                <th className="pb-3 font-medium">标准工时(分钟/双)</th>
                <th className="pb-3 font-medium">计件单价(元/双)</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map((process) => (
                <tr key={process.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-mono text-sm">{process.code || '-'}</td>
                  <td className="py-3 font-medium">{process.name}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                      {process.process_type || '-'}
                    </span>
                  </td>
                  <td className="py-3 text-gray-500">{process.department || '-'}</td>
                  <td className="py-3 text-gray-500">{process.standard_time || 0}</td>
                  <td className="py-3 text-gray-500">¥{process.piece_rate || 0}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(process)} className="text-purple-600 hover:bg-purple-50 p-1 rounded transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(process.id)} className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProcesses.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无工序数据</p>
              <button onClick={() => setModalOpen(true)} className="mt-4 text-purple-600 hover:underline">
                添加第一个工序
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 弹窗 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{editing ? '编辑工序' : '添加工序'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工序编码</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="自动生成"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工序名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="如：裁断、针车"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">工序类型</label>
                  <select
                    value={formData.process_type}
                    onChange={(e) => setFormData({ ...formData, process_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">请选择</option>
                    {PROCESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">所属车间</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">请选择</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标准工时(分钟)</label>
                  <input
                    type="number"
                    value={formData.standard_time}
                    onChange={(e) => setFormData({ ...formData, standard_time: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">计件单价(元)</label>
                  <input
                    type="number"
                    value={formData.piece_rate}
                    onChange={(e) => setFormData({ ...formData, piece_rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">单位</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                取消
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
