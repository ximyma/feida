import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Layers, Eye, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface BOM {
  id: string;
  name: string;
  bom_type: string;
  product_style_id: string;
  version: string;
  status: string;
  style_name?: string;
}

interface Style {
  id: string;
  name: string;
  code: string;
}

export default function BOMsPage() {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [styles, setStyles] = useState<Style[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editing, setEditing] = useState<BOM | null>(null);
  const [viewing, setViewing] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', bom_type: 'technical', product_style_id: '', version: 'V1.0' });
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [bomsData, stylesData] = await Promise.all([
        fetch('/api/boms').then(r => r.json()),
        fetch('/api/product_styles').then(r => r.json()),
      ]);
      setBoms(Array.isArray(bomsData) ? bomsData : []);
      setStyles(Array.isArray(stylesData) ? stylesData : []);
    } catch (e) { message.error('获取数据失败'); }
    finally { setLoading(false); }
  };

  const handleView = async (bom: BOM) => {
    try {
      const data = await fetch(`/api/boms/${bom.id}`).then(r => r.json());
      setViewing(data);
      setViewModalOpen(true);
    } catch (e) { message.error('获取详情失败'); }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/boms/${id}/approve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ approved_by: 'admin' }) });
      message.success('审核成功');
      fetchData();
    } catch (e) { message.error('审核失败'); }
  };

  const handleDelete = async (id: string) => { if (!confirm('确定删除？')) return; try { await fetch(`/api/boms/${id}`, { method: 'DELETE' }); message.success('删除成功'); fetchData(); } catch (e) { message.error('删除失败'); } };

  const getStyleName = (id: string) => styles.find(s => s.id === id)?.name || '-';

  const filtered = boms.filter(b => {
    const matchSearch = !searchText || b.name.toLowerCase().includes(searchText.toLowerCase());
    const matchType = !filterType || b.bom_type === filterType;
    return matchSearch && matchType;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
      draft: { label: '草稿', class: 'bg-gray-100 text-gray-700' },
      approved: { label: '已审核', class: 'bg-green-100 text-green-700' },
      obsolete: { label: '已作废', class: 'bg-red-100 text-red-700' },
    };
    return map[status] || { label: status, class: 'bg-gray-100 text-gray-700' };
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/plm" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center"><Layers className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">BOM物料清单</h1><p className="text-sm text-gray-500">管理产品物料清单（开发BOM/技术BOM）</p></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="搜索BOM..." value={searchText} onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">全部类型</option>
            <option value="development">开发BOM</option>
            <option value="technical">技术BOM</option>
          </select>
          <button onClick={() => { setEditing(null); setFormData({ name: '', bom_type: 'technical', product_style_id: '', version: 'V1.0' }); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Plus className="w-4 h-4" /> 添加BOM</button>
        </div>

        <div className="p-4">
          <table className="w-full">
            <thead><tr className="text-left text-sm text-gray-500 border-b"><th className="pb-3 font-medium">BOM名称</th><th className="pb-3 font-medium">产品款号</th><th className="pb-3 font-medium">类型</th><th className="pb-3 font-medium">版本</th><th className="pb-3 font-medium">状态</th><th className="pb-3 font-medium">操作</th></tr></thead>
            <tbody>
              {filtered.map((b) => {
                const badge = getStatusBadge(b.status);
                return (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 font-medium">{b.name}</td>
                    <td className="py-3 text-gray-500">{getStyleName(b.product_style_id)}</td>
                    <td className="py-3"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{b.bom_type === 'development' ? '开发BOM' : '技术BOM'}</span></td>
                    <td className="py-3 text-gray-500">{b.version}</td>
                    <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs ${badge.class}`}>{badge.label}</span></td>
                    <td className="py-3"><div className="flex items-center gap-2">
                      <button onClick={() => handleView(b)} className="text-gray-600 hover:bg-gray-100 p-1 rounded"><Eye className="w-4 h-4" /></button>
                      {b.status === 'draft' && <button onClick={() => handleApprove(b.id)} className="text-green-600 hover:bg-green-50 p-1 rounded" title="审核"><CheckCircle className="w-4 h-4" /></button>}
                      <button onClick={() => handleDelete(b.id)} className="text-red-600 hover:bg-red-50 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && <div className="p-12 text-center text-gray-500"><Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" /><p>暂无BOM数据</p></div>}
        </div>
      </div>

      {viewModalOpen && viewing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">BOM详情 - {viewing.name}</h2>
            <div className="mb-4 text-sm text-gray-500">
              <p>类型：{viewing.bom_type === 'development' ? '开发BOM' : '技术BOM'} | 版本：{viewing.version} | 状态：{getStatusBadge(viewing.status).label}</p>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50"><tr><th className="px-4 py-2 text-left text-sm font-medium text-gray-500">序号</th><th className="px-4 py-2 text-left text-sm font-medium text-gray-500">物料名称</th><th className="px-4 py-2 text-left text-sm font-medium text-gray-500">用量</th><th className="px-4 py-2 text-left text-sm font-medium text-gray-500">损耗率</th><th className="px-4 py-2 text-left text-sm font-medium text-gray-500">供应类型</th></tr></thead>
                <tbody>
                  {viewing.items?.map((item: any, index: number) => (
                    <tr key={item.id} className="border-t"><td className="px-4 py-2 text-sm">{index + 1}</td><td className="px-4 py-2 text-sm">{item.material_id || '-'}</td><td className="px-4 py-2 text-sm">{item.qty}</td><td className="px-4 py-2 text-sm">{item.scrap_rate}%</td><td className="px-4 py-2 text-sm">{item.supply_type}</td></tr>
                  ))}
                  {(!viewing.items || viewing.items.length === 0) && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">暂无物料明细</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-6"><button onClick={() => setViewModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">关闭</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
