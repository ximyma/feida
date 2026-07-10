import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Settings, Eye } from 'lucide-react';
import { message } from 'antd';

interface CodingRule {
  id: string;
  name: string;
  code: string;
  target_type: string;
  prefix: string;
  sequence_digits: number;
  current_sequence: number;
  date_format: string;
  rule_template: string;
  is_active: number;
  created_at: string;
}

export default function CodingRulesPage() {
  const [rules, setRules] = useState<CodingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CodingRule | null>(null);
  const [selectedRule, setSelectedRule] = useState<CodingRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    target_type: 'sku',
    prefix: '',
    sequence_digits: 4,
    current_sequence: 0,
    date_format: '',
    rule_template: '',
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coding_rules');
      const data = await res.json();
      setRules(Array.isArray(data) ? data : []);
    } catch (e) {
      message.error('获取编码规则数据失败');
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      message.warning('请输入规则名称和编码');
      return;
    }
    try {
      const url = editingRule ? `/api/coding_rules/${editingRule.id}` : '/api/coding_rules';
      const method = editingRule ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        message.success(editingRule ? '修改成功' : '添加成功');
        setModalOpen(false);
        setEditingRule(null);
        setFormData({ name: '', code: '', target_type: 'sku', prefix: '', sequence_digits: 4, current_sequence: 0, date_format: '', rule_template: '' });
        fetchData();
      }
    } catch (e) {
      message.error('操作失败');
    }
  };

  const handleEdit = (rule: CodingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      code: rule.code,
      target_type: rule.target_type || 'sku',
      prefix: rule.prefix || '',
      sequence_digits: rule.sequence_digits || 4,
      current_sequence: rule.current_sequence || 0,
      date_format: rule.date_format || '',
      rule_template: rule.rule_template || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除该编码规则？')) return;
    try {
      const res = await fetch(`/api/coding_rules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        message.success('删除成功');
        fetchData();
      }
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handlePreview = (rule: CodingRule) => {
    setSelectedRule(rule);
    setPreviewModalOpen(true);
  };

  const getTargetTypeName = (type: string) => {
    const names: Record<string, string> = {
      sku: 'SKU编码',
      barcode: '条码',
      style: '款号',
      color: '颜色编码',
    };
    return names[type] || type;
  };

  const generatePreview = (rule: CodingRule) => {
    const prefix = rule.prefix || '';
    const seq = String(rule.current_sequence + 1 || 1).padStart(rule.sequence_digits || 4, '0');
    const date = rule.date_format ? new Date().toISOString().slice(0, 10).replace(/-/g, '') : '';
    let result = prefix + (date ? date + prefix : '') + seq;
    return result;
  };

  const filteredRules = rules.filter(r =>
    r.name.includes(searchText) || r.code.includes(searchText)
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">编码规则</h1>
        <p className="text-gray-500 mt-1">管理产品编码规则，包括SKU编码、条码等自动生成规则</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索编码规则..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              setEditingRule(null);
              setFormData({ name: '', code: '', target_type: 'sku', prefix: '', sequence_digits: 4, current_sequence: 0, date_format: '', rule_template: '' });
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加规则
          </button>
        </div>

        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">规则名称</th>
                <th className="pb-3 font-medium">规则编码</th>
                <th className="pb-3 font-medium">应用对象</th>
                <th className="pb-3 font-medium">前缀</th>
                <th className="pb-3 font-medium">序号位数</th>
                <th className="pb-3 font-medium">当前序号</th>
                <th className="pb-3 font-medium">状态</th>
                <th className="pb-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 font-medium">{rule.name}</td>
                  <td className="py-3 font-mono text-sm">{rule.code}</td>
                  <td className="py-3 text-gray-500">{getTargetTypeName(rule.target_type)}</td>
                  <td className="py-3 font-mono">{rule.prefix || '-'}</td>
                  <td className="py-3 text-gray-500">{rule.sequence_digits || 4}</td>
                  <td className="py-3 text-gray-500">{rule.current_sequence || 0}</td>
                  <td className="py-3">
                    <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                      rule.is_active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rule.is_active === 1 ? '启用' : '停用'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePreview(rule)}
                        className="text-teal-600 hover:bg-teal-50 p-1 rounded transition-colors"
                        title="预览"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(rule)}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRules.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-500">
              <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无编码规则</p>
              <button onClick={() => setModalOpen(true)} className="mt-4 text-blue-600 hover:underline">
                添加第一个编码规则
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{editingRule ? '编辑编码规则' : '添加编码规则'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">规则名称 *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：SKU标准编码"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">规则编码 *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="例如：SKU_CODE"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">应用对象 *</label>
                <select
                  value={formData.target_type}
                  onChange={(e) => setFormData({ ...formData, target_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sku">SKU编码</option>
                  <option value="barcode">条码</option>
                  <option value="style">款号</option>
                  <option value="color">颜色编码</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">前缀</label>
                <input
                  type="text"
                  value={formData.prefix}
                  onChange={(e) => setFormData({ ...formData, prefix: e.target.value })}
                  placeholder="编码前缀，例如：FD"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">序号位数</label>
                  <input
                    type="number"
                    value={formData.sequence_digits}
                    onChange={(e) => setFormData({ ...formData, sequence_digits: parseInt(e.target.value) || 4 })}
                    min={1}
                    max={10}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">当前序号</label>
                  <input
                    type="number"
                    value={formData.current_sequence}
                    onChange={(e) => setFormData({ ...formData, current_sequence: parseInt(e.target.value) || 0 })}
                    min={0}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日期格式</label>
                <input
                  type="text"
                  value={formData.date_format}
                  onChange={(e) => setFormData({ ...formData, date_format: e.target.value })}
                  placeholder="例如：YYYYMMDD，留空表示不使用日期"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                取消
              </button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewModalOpen && selectedRule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold mb-4">编码预览 - {selectedRule.name}</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-500 mb-2">生成示例：</p>
              <p className="text-xl font-mono font-bold text-blue-600">
                {generatePreview(selectedRule)}
              </p>
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              <p>前缀：{selectedRule.prefix || '(无)'}</p>
              <p>序号位数：{selectedRule.sequence_digits || 4}</p>
              <p>当前序号：{selectedRule.current_sequence || 0} → 下个序号：{(selectedRule.current_sequence || 0) + 1}</p>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => { setPreviewModalOpen(false); setSelectedRule(null); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}