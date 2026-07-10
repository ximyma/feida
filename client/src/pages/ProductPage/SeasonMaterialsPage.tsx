import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Search, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface SeasonMaterial {
  id: string;
  season: string;
  material_id: string;
  season_year: number;
  remark: string;
  material_name?: string;
}

interface Material {
  id: string;
  name: string;
  code: string;
}

export default function SeasonMaterialsPage() {
  const [items, setItems] = useState<SeasonMaterial[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ season: '', material_id: '', season_year: new Date().getFullYear(), remark: '' });
  const [searchText, setSearchText] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      // 获取季节物料（目前API未实现完整查询，暂时显示空）
      setItems([]);
      const data = await fetch('/api/materials').then(r => r.json());
      setMaterials(Array.isArray(data) ? data : []);
    } catch (e) { message.error('获取数据失败'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!formData.season || !formData.material_id) { message.warning('请选择季节和物料'); return; }
    message.info('季节物料库功能开发中...');
    setModalOpen(false);
  };

  const getMaterialName = (id: string) => materials.find(m => m.id === id)?.name || '-';

  const SEASONS = ['春季', '夏季', '秋季', '冬季', '春夏', '秋冬', '全年'];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/plm" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">季节物料库</h1><p className="text-sm text-gray-500">按季节分类管理物料</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" placeholder="搜索..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"><Plus className="w-4 h-4" /> 添加关联</button>
        </div>
        <div className="p-4">
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>暂无季节物料关联数据</p>
            <p className="text-sm text-gray-400 mt-1">该功能允许将物料与季节关联，便于按季节筛选</p>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">添加季节物料关联</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">季节 *</label><select value={formData.season} onChange={(e) => setFormData({ ...formData, season: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">{SEASONS.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">年份</label><input type="number" value={formData.season_year} onChange={(e) => setFormData({ ...formData, season_year: parseInt(e.target.value) || 2026 })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">物料 *</label><select value={formData.material_id} onChange={(e) => setFormData({ ...formData, material_id: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"><option value="">请选择物料</option>{materials.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6"><button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button><button onClick={handleSave} className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">保存</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
