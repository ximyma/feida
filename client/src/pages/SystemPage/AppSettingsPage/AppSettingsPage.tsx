import React, { useState, useEffect } from 'react';

const TITLE = 'APP设置';

export default function AppSettingsPage() {
  const [settings, setSettings] = useState<any>({
    appName: '飞达智能HR',
    appVersion: '1.0.0',
    logo: '',
    theme: 'light',
    primaryColor: '#3b82f6',
    loginBg: '',
    enableMobile: true,
    enableWechat: false,
    enableDingtalk: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpireDays: 90,
    enableTwoFactor: false,
    allowSelfRegister: false,
    watermarkEnabled: true,
    watermarkText: '飞达智能HR',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await fetch('/api/system_config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'app_settings', category: 'app', ...settings, updatedAt: new Date().toISOString() }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{TITLE}</h2>
          <p className="text-sm text-gray-500">配置移动端APP与系统全局设置</p>
        </div>
        <button onClick={handleSave} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
          {loading ? '保存中...' : '保存设置'}
        </button>
      </div>

      {saved && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">设置已保存</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 基础设置 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
            基础设置
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">应用名称</label>
              <input type="text" value={settings.appName} onChange={e => handleChange('appName', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">版本号</label>
              <input type="text" value={settings.appVersion} onChange={e => handleChange('appVersion', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">主题色</label>
              <div className="flex gap-2">
                <input type="color" value={settings.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} className="w-10 h-10 rounded border border-gray-300 cursor-pointer" />
                <input type="text" value={settings.primaryColor} onChange={e => handleChange('primaryColor', e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">主题模式</label>
              <select value={settings.theme} onChange={e => handleChange('theme', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="light">浅色模式</option>
                <option value="dark">深色模式</option>
                <option value="auto">跟随系统</option>
              </select>
            </div>
          </div>
        </div>

        {/* 登录设置 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center text-xs">2</span>
            登录设置
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">会话超时（分钟）</label>
              <input type="number" value={settings.sessionTimeout} onChange={e => handleChange('sessionTimeout', parseInt(e.target.value) || 30)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">最大登录尝试次数</label>
              <input type="number" value={settings.maxLoginAttempts} onChange={e => handleChange('maxLoginAttempts', parseInt(e.target.value) || 5)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">密码过期天数（0表示永不过期）</label>
              <input type="number" value={settings.passwordExpireDays} onChange={e => handleChange('passwordExpireDays', parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* 功能开关 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-xs">3</span>
            功能开关
          </h3>
          <div className="space-y-3">
            {[
              { key: 'enableMobile', label: '启用移动端APP', desc: '允许用户通过手机APP访问系统' },
              { key: 'enableWechat', label: '启用企业微信登录', desc: '支持企业微信扫码登录' },
              { key: 'enableDingtalk', label: '启用钉钉登录', desc: '支持钉钉扫码登录' },
              { key: 'enableTwoFactor', label: '启用双因素认证', desc: '登录时需要验证码' },
              { key: 'allowSelfRegister', label: '允许自助注册', desc: '允许用户自行注册账号' },
              { key: 'watermarkEnabled', label: '启用水印', desc: '页面显示用户水印' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
                <button
                  onClick={() => handleChange(item.key, !settings[item.key])}
                  className={`relative w-11 h-6 rounded-full transition-colors ${settings[item.key] ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings[item.key] ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 水印设置 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center text-xs">4</span>
            水印设置
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">水印文字</label>
              <input type="text" value={settings.watermarkText} onChange={e => handleChange('watermarkText', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center relative overflow-hidden">
              <div className="text-gray-400">预览区域</div>
              {settings.watermarkEnabled && (
                <div className="absolute inset-0 pointer-events-none flex flex-wrap items-center justify-center gap-8 opacity-20 text-gray-400 text-sm rotate-[-20deg]">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <span key={i}>{settings.watermarkText}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
