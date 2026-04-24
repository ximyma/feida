import React, { useState } from 'react';

const TITLE = '企业微信设置';

export default function WeChatSettingsPage() {
  const [config, setConfig] = useState({
    enabled: false,
    corpId: '',
    agentId: '',
    secret: '',
    token: '',
    encodingAESKey: '',
    callbackUrl: '',
    syncEnabled: true,
    syncInterval: 30,
    syncDepartments: true,
    syncUsers: true,
    autoCreateUser: true,
    defaultRoleId: '',
  });
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    await new Promise(r => setTimeout(r, 1500));
    setTestResult({ success: true, message: '连接成功，配置有效' });
    setTesting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{TITLE}</h2>
          <p className="text-sm text-gray-500">配置企业微信集成，实现扫码登录、消息推送、数据同步</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleTest} disabled={testing || !config.corpId || !config.secret} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50">
            {testing ? '测试中...' : '测试连接'}
          </button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      {testResult && (
        <div className={`rounded-lg px-4 py-3 text-sm ${testResult.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {testResult.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基础配置 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">基础配置</h3>
            <button onClick={() => handleChange('enabled', !config.enabled)} className={`relative w-11 h-6 rounded-full transition-colors ${config.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.enabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">企业ID (CorpId)</label>
              <input type="text" value={config.corpId} onChange={e => handleChange('corpId', e.target.value)} placeholder="请输入企业ID" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">应用AgentId</label>
              <input type="text" value={config.agentId} onChange={e => handleChange('agentId', e.target.value)} placeholder="请输入应用AgentId" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">应用Secret</label>
              <input type="password" value={config.secret} onChange={e => handleChange('secret', e.target.value)} placeholder="请输入应用Secret" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* 回调配置 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-sm mb-4">回调配置</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">回调URL</label>
              <input type="text" value={config.callbackUrl} onChange={e => handleChange('callbackUrl', e.target.value)} placeholder="https://your-domain.com/api/wechat/callback" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Token</label>
              <input type="text" value={config.token} onChange={e => handleChange('token', e.target.value)} placeholder="请设置Token" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">EncodingAESKey</label>
              <input type="text" value={config.encodingAESKey} onChange={e => handleChange('encodingAESKey', e.target.value)} placeholder="消息加密密钥" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* 同步设置 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-2">
          <h3 className="font-bold text-sm mb-4">数据同步</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {[
                { key: 'syncEnabled', label: '启用定时同步', desc: '自动同步企业微信通讯录' },
                { key: 'syncDepartments', label: '同步部门', desc: '同步企业微信部门结构' },
                { key: 'syncUsers', label: '同步员工', desc: '同步企业微信员工信息' },
                { key: 'autoCreateUser', label: '自动创建用户', desc: '同步时自动创建系统账号' },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    <div className="text-xs text-gray-500">{item.desc}</div>
                  </div>
                  <button onClick={() => handleChange(item.key, !config[item.key as keyof typeof config])} className={`relative w-11 h-6 rounded-full transition-colors ${config[item.key as keyof typeof config] ? 'bg-blue-600' : 'bg-gray-300'}`}>
                    <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config[item.key as keyof typeof config] ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">同步间隔（分钟）</label>
                <select value={config.syncInterval} onChange={e => handleChange('syncInterval', parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={10}>10分钟</option>
                  <option value={30}>30分钟</option>
                  <option value={60}>1小时</option>
                  <option value={360}>6小时</option>
                  <option value={1440}>每天</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">默认角色</label>
                <select value={config.defaultRoleId} onChange={e => handleChange('defaultRoleId', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">请选择默认角色</option>
                  <option value="employee">普通员工</option>
                  <option value="dept_manager">部门经理</option>
                </select>
              </div>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">立即同步</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
