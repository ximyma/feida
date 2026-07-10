import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, ClipboardCheck, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { message } from 'antd';

interface Inspection {
  id: string;
  code: string;
  type: string;
  reference_code: string;
  inspector: string;
  inspection_date: string;
  total_items: number;
  passed_items: number;
  failed_items: number;
  result: string;
  created_at: string;
  items?: any[];
}

const TYPE_MAP: Record<string, string> = { incoming: '来料检验', in_process: '过程检验', final: '成品检验' };
const RESULT_MAP: Record<string, string> = { pending: '待检', passed: '合格', failed: '不合格', partial: '部分合格' };

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedResult, setSelectedResult] = useState('');
  const [detailModal, setDetailModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  
  const [formData, setFormData] = useState({ 
    type: 'incoming', reference_type: '', reference_id: '', reference_code: '',
    inspector: '', inspection_date: '', remark: '',
    items: [{ item_name: '', standard_value: '', actual_value: '', result: 'pending', remark: '' }]
  });

  useEffect(() => {
    fetch('/api/quality-inspections').then(r => r.json()).then(data => {
      setInspections(Array.isArray(data) ? data : []);
    }).catch(() => message.error('获取数据失败')).finally(() => setLoading(false));
  }, []);

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { item_name: '', standard_value: '', actual_value: '', result: 'pending', remark: '' }] });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    }
  };

  const handleSubmit = async () => {
    if (!formData.inspector) {
      message.warning('请填写检验员');
      return;
    }
    try {
      await fetch('/api/quality-inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      message.success('检验单创建成功');
      setModalOpen(false);
      setFormData({ type: 'incoming', reference_type: '', reference_id: '', reference_code: '', inspector: '', inspection_date: '', remark: '', items: [{ item_name: '', standard_value: '', actual_value: '', result: 'pending', remark: '' }] });
      fetch('/api/quality-inspections').then(r => r.json()).then(data => setInspections(Array.isArray(data) ? data : []));
    } catch (e) { message.error('创建失败'); }
  };

  const filtered = inspections.filter(i => {
    if (selectedType && i.type !== selectedType) return false;
    if (selectedResult && i.result !== selectedResult) return false;
    if (searchText) {
      const kw = searchText.toLowerCase();
      return i.code.toLowerCase().includes(kw) || i.reference_code?.toLowerCase().includes(kw);
    }
    return true;
  });

  const pendingCount = inspections.filter(i => i.result === 'pending').length;
  const passRate = inspections.length > 0 ? Math.round(inspections.filter(i => i.result === 'passed').length / inspections.length * 100) : 0;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/quality" className="text-gray-400 hover:text-gray-600"><ArrowLeft className="w-5 h-5" /></Link>
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center"><ClipboardCheck className="w-5 h-5 text-white" /></div>
        <div><h1 className="text-xl font-semibold text-gray-900">质量检验</h1><p className="text-sm text-gray-500">来料、过程、成品检验管理</p></div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-600">待检验</p>
          <p className="text-2xl font-bold text-yellow-700">{pendingCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-600">合格率</p>
          <p className="text-2xl font-bold text-green-700">{passRate}%</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-600">检验总数</p>
          <p className="text-2xl font-bold text-blue-700">{inspections.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="搜索检验单..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">全部类型</option>
              {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={selectedResult} onChange={(e) => setSelectedResult(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
              <option value="">全部结果</option>
              {Object.entries(RESULT_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"><Plus className="w-4 h-4" /> 新增检验</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">检验单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">关联单号</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">检验员</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">检验项</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">合格/不合格</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">结果</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{TYPE_MAP[item.type as keyof typeof TYPE_MAP] || item.type}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.reference_code || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.inspector || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{item.total_items}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="text-green-600">{item.passed_items}</span> / <span className="text-red-600">{item.failed_items}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.result === 'passed' ? 'bg-green-100 text-green-700' :
                      item.result === 'failed' ? 'bg-red-100 text-red-700' :
                      item.result === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {RESULT_MAP[item.result as keyof typeof RESULT_MAP] || item.result}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => { setSelectedInspection(item); setDetailModal(true); }} className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700">详情</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无检验记录</p>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-semibold mb-4">新增检验单</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">检验类型</label><select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                  {Object.entries(TYPE_MAP).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">关联单号</label><input type="text" value={formData.reference_code} onChange={(e) => setFormData({ ...formData, reference_code: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">检验员 *</label><input type="text" value={formData.inspector} onChange={(e) => setFormData({ ...formData, inspector: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">检验日期</label><input type="date" value={formData.inspection_date} onChange={(e) => setFormData({ ...formData, inspection_date: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">检验项目</label></div>
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-5 gap-3 items-end">
                  <input type="text" value={item.item_name} onChange={(e) => { const newItems = [...formData.items]; newItems[index].item_name = e.target.value; setFormData({ ...formData, items: newItems }); }} placeholder="项目名称" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <input type="text" value={item.standard_value} onChange={(e) => { const newItems = [...formData.items]; newItems[index].standard_value = e.target.value; setFormData({ ...formData, items: newItems }); }} placeholder="标准值" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <input type="text" value={item.actual_value} onChange={(e) => { const newItems = [...formData.items]; newItems[index].actual_value = e.target.value; setFormData({ ...formData, items: newItems }); }} placeholder="实际值" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  <select value={item.result} onChange={(e) => { const newItems = [...formData.items]; newItems[index].result = e.target.value; setFormData({ ...formData, items: newItems }); }} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="pending">待检</option>
                    <option value="passed">合格</option>
                    <option value="failed">不合格</option>
                  </select>
                  <div className="flex gap-2">
                    <input type="text" value={item.remark} onChange={(e) => { const newItems = [...formData.items]; newItems[index].remark = e.target.value; setFormData({ ...formData, items: newItems }); }} placeholder="备注" className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                    {formData.items.length > 1 && <button onClick={() => removeItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded">×</button>}
                  </div>
                </div>
              ))}
              <button onClick={addItem} className="text-green-600 text-sm">+ 添加检验项</button>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">备注</label><textarea value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" rows={2} /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setModalOpen(false); setFormData({ type: 'incoming', reference_type: '', reference_id: '', reference_code: '', inspector: '', inspection_date: '', remark: '', items: [{ item_name: '', standard_value: '', actual_value: '', result: 'pending', remark: '' }] }); }} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">创建</button>
            </div>
          </div>
        </div>
      )}

      {detailModal && selectedInspection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold mb-4">检验详情 - {selectedInspection.code}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">类型:</span> {TYPE_MAP[selectedInspection.type]}</div>
                <div><span className="text-gray-500">检验员:</span> {selectedInspection.inspector}</div>
                <div><span className="text-gray-500">结果:</span> {RESULT_MAP[selectedInspection.result]}</div>
                <div><span className="text-gray-500">日期:</span> {selectedInspection.inspection_date?.split('T')[0]}</div>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-medium text-gray-700 mb-2">检验项目明细</p>
                {selectedInspection.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-2 text-sm border-b border-gray-100">
                    <span>{item.item_name}</span>
                    <span className="text-gray-500">{item.standard_value} → {item.actual_value}</span>
                    <span className={item.result === 'passed' ? 'text-green-600' : 'text-red-600'}>
                      {item.result === 'passed' ? '合格' : item.result === 'failed' ? '不合格' : '待检'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => { setDetailModal(false); setSelectedInspection(null); }} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">关闭</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}