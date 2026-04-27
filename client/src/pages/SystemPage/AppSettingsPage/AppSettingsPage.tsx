import React, { useState, useEffect } from 'react';
import { useAppConfig } from '../../../contexts/AppConfigContext';

const TITLE = 'APP设置';

const DEFAULT_SETTINGS: any = {
  appName: '飞达智能HR',
  appVersion: '1.0.0',
  logo: '',
  theme: 'light',
  primaryColor: '#3b82f6',
  loginBg: '',
  enableMobile: true,
  enableWechat: false,
  enableDingtalk: false,
  enableFeishu: false,
  sessionTimeout: 30,
  maxLoginAttempts: 5,
  passwordExpireDays: 90,
  enableTwoFactor: false,
  allowSelfRegister: false,
  watermarkEnabled: true,
  watermarkText: '飞达智能HR',
  // 企业微信配置
  wechatCorpId: '',
  wechatAgentId: '',
  wechatSecret: '',
  wechatToken: '',
  wechatEncodingAesKey: '',
  wechatCallbackUrl: '',
  // 钉钉配置
  dingtalkCorpId: '',
  dingtalkAppKey: '',
  dingtalkAppSecret: '',
  dingtalkAgentId: '',
  dingtalkCallbackUrl: '',
  // 飞书配置
  feishuAppId: '',
  feishuAppSecret: '',
  feishuEncryptKey: '',
  feishuVerificationToken: '',
  feishuCallbackUrl: '',
};

/* ── 通用输入组件 ── */
function Field({ label, hint, value, onChange, type = 'text', placeholder = '' }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
      )}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/* ── 开关组件 ── */
function Toggle({ label, desc, checked, onChange }: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">{desc}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );
}

/* ── 折叠配置面板 ── */
function ConfigPanel({ icon, iconBg, iconColor, title, enabled, children }: {
  icon: string; iconBg: string; iconColor: string; title: string; enabled: boolean; children: React.ReactNode;
}) {
  if (!enabled) return null;
  return (
    <div className="mt-4 border-t border-dashed border-gray-200 pt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-5 h-5 rounded ${iconBg} ${iconColor} flex items-center justify-center text-xs`}>{icon}</span>
        <span className="text-sm font-semibold text-gray-700">{title}接口配置</span>
        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">已启用</span>
      </div>
      <div className="space-y-3 pl-7">{children}</div>
    </div>
  );
}

export default function AppSettingsPage() {
  const { updateAppName } = useAppConfig();
  const [settings, setSettings] = useState<any>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState<string | null>(null); // 'wechat' | 'dingtalk' | 'feishu'
  const [testResult, setTestResult] = useState<any>(null);

  // 加载已保存的配置
  useEffect(() => {
    fetch('/api/system_config/app_settings')
      .then(r => r.json())
      .then(data => {
        if (data && !data.error && data.value) {
          try {
            const saved = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            setSettings(prev => ({ ...prev, ...saved }));
          } catch (e) { console.error('Parse app_settings failed:', e); }
        }
      })
      .catch(e => console.error('Load app_settings failed:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const checkRes = await fetch('/api/system_config/app_settings');
      const existing = await checkRes.json();
      const payload = {
        id: 'app_settings',
        key: 'app_settings',
        label: 'APP设置',
        value: JSON.stringify(settings),
        type: 'json',
        category: 'app',
        description: '移动端APP与系统全局设置',
        visible: 0,
        editable: 1,
      };

      if (existing && !existing.error) {
        await fetch('/api/system_config/app_settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/system_config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setSaved(true);
      // 同步全局应用名称
      if (settings.appName) updateAppName(settings.appName);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  // 测试连接
  const handleTestConnection = async (platform: string) => {
    setTesting(platform);
    setTestResult(null);
    try {
      const res = await fetch('/api/integration_test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, config: getPlatformConfig(platform) }),
      });
      const data = await res.json();
      setTestResult({ platform, ...data });
    } catch (e: any) {
      setTestResult({ platform, success: false, message: e.message || '连接失败' });
    }
    setTesting(null);
  };

  const getPlatformConfig = (platform: string) => {
    if (platform === 'wechat') return {
      corpId: settings.wechatCorpId, agentId: settings.wechatAgentId,
      secret: settings.wechatSecret, token: settings.wechatToken,
      encodingAesKey: settings.wechatEncodingAesKey, callbackUrl: settings.wechatCallbackUrl,
    };
    if (platform === 'dingtalk') return {
      corpId: settings.dingtalkCorpId, appKey: settings.dingtalkAppKey,
      appSecret: settings.dingtalkAppSecret, agentId: settings.dingtalkAgentId,
      callbackUrl: settings.dingtalkCallbackUrl,
    };
    return {
      appId: settings.feishuAppId, appSecret: settings.feishuAppSecret,
      encryptKey: settings.feishuEncryptKey, verificationToken: settings.feishuVerificationToken,
      callbackUrl: settings.feishuCallbackUrl,
    };
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{TITLE}</h2>
          <p className="text-sm text-gray-500">配置移动端APP与系统全局设置</p>
        </div>
        <button onClick={handleSave} disabled={saving || loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50">
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>

      {saved && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">✅ 设置已保存</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ━━ 基础设置 ━━ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
            基础设置
          </h3>
          <div className="space-y-4">
            <Field label="应用名称" value={settings.appName} onChange={v => handleChange('appName', v)} />
            <Field label="版本号" value={settings.appVersion} onChange={v => handleChange('appVersion', v)} />
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

        {/* ━━ 登录设置 ━━ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-green-100 text-green-600 flex items-center justify-center text-xs">2</span>
            登录设置
          </h3>
          <div className="space-y-4">
            <Field label="会话超时（分钟）" value={String(settings.sessionTimeout)} onChange={v => handleChange('sessionTimeout', parseInt(v) || 30)} type="number" />
            <Field label="最大登录尝试次数" value={String(settings.maxLoginAttempts)} onChange={v => handleChange('maxLoginAttempts', parseInt(v) || 5)} type="number" />
            <Field label="密码过期天数（0=永不过期）" value={String(settings.passwordExpireDays)} onChange={v => handleChange('passwordExpireDays', parseInt(v) || 0)} type="number" />
          </div>
        </div>

        {/* ━━ 功能开关 ━━ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-xs">3</span>
            功能开关
          </h3>
          <div className="space-y-3">
            <Toggle label="启用移动端APP" desc="允许用户通过手机APP访问系统" checked={settings.enableMobile} onChange={v => handleChange('enableMobile', v)} />
            <Toggle label="启用双因素认证" desc="登录时需要验证码" checked={settings.enableTwoFactor} onChange={v => handleChange('enableTwoFactor', v)} />
            <Toggle label="允许自助注册" desc="允许用户自行注册账号" checked={settings.allowSelfRegister} onChange={v => handleChange('allowSelfRegister', v)} />
            <Toggle label="启用水印" desc="页面显示用户水印" checked={settings.watermarkEnabled} onChange={v => handleChange('watermarkEnabled', v)} />
          </div>
        </div>

        {/* ━━ 水印设置 ━━ */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-orange-100 text-orange-600 flex items-center justify-center text-xs">4</span>
            水印设置
          </h3>
          <div className="space-y-4">
            <Field label="水印文字" value={settings.watermarkText} onChange={v => handleChange('watermarkText', v)} />
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

      {/* ━━ 第三方平台对接 ━━ */}
      <div className="mt-2">
        <h3 className="text-lg font-bold mb-1">第三方平台对接</h3>
        <p className="text-sm text-gray-500 mb-4">配置企业微信、钉钉、飞书等第三方平台的接口对接参数，启用后用户可通过对应平台扫码登录</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ━━ 企业微信 ━━ */}
        <div className={`bg-white rounded-xl border-2 p-6 transition-colors ${settings.enableWechat ? 'border-green-400' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white text-lg font-bold">企</div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">企业微信</h4>
              <p className="text-xs text-gray-500">WeChat Work</p>
            </div>
            <button
              onClick={() => handleChange('enableWechat', !settings.enableWechat)}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.enableWechat ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.enableWechat ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <ConfigPanel icon="⚙" iconBg="bg-green-100" iconColor="text-green-600" title="企业微信" enabled={settings.enableWechat}>
            <Field label="CorpID（企业ID）" hint="在企业微信管理后台 → 我的企业 → 企业信息中获取" value={settings.wechatCorpId} onChange={v => handleChange('wechatCorpId', v)} placeholder="ww1234567890abcdef" />
            <Field label="AgentId（应用ID）" hint="自建应用的 AgentId" value={settings.wechatAgentId} onChange={v => handleChange('wechatAgentId', v)} placeholder="1000002" />
            <Field label="Secret（应用密钥）" hint="自建应用的 Secret，需妥善保管" value={settings.wechatSecret} onChange={v => handleChange('wechatSecret', v)} type="password" placeholder="••••••••" />
            <Field label="Token（回调Token）" hint="接收消息时的验证 Token，可自定义" value={settings.wechatToken} onChange={v => handleChange('wechatToken', v)} placeholder="自定义Token" />
            <Field label="EncodingAESKey" hint="消息加解密密钥，43位字符串" value={settings.wechatEncodingAesKey} onChange={v => handleChange('wechatEncodingAesKey', v)} placeholder="43位AESKey" />
            <Field label="回调URL" hint="企业微信推送消息的回调地址" value={settings.wechatCallbackUrl} onChange={v => handleChange('wechatCallbackUrl', v)} placeholder="https://your-domain.com/api/wechat/callback" />
            <button
              onClick={() => handleTestConnection('wechat')}
              disabled={testing === 'wechat' || !settings.wechatCorpId}
              className="w-full mt-2 px-3 py-2 border border-green-300 text-green-700 rounded-lg text-sm hover:bg-green-50 transition-colors disabled:opacity-40"
            >
              {testing === 'wechat' ? '测试中...' : '🔍 测试连接'}
            </button>
            {testResult?.platform === 'wechat' && (
              <div className={`mt-2 px-3 py-2 rounded-lg text-xs ${testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {testResult.success ? '✅ 连接成功' : `❌ ${testResult.message}`}
              </div>
            )}
          </ConfigPanel>

          {!settings.enableWechat && (
            <div className="mt-4 text-center text-xs text-gray-400 py-6 border-t border-dashed border-gray-100">
              开启后可配置企业微信接口参数
            </div>
          )}
        </div>

        {/* ━━ 钉钉 ━━ */}
        <div className={`bg-white rounded-xl border-2 p-6 transition-colors ${settings.enableDingtalk ? 'border-blue-400' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white text-lg font-bold">钉</div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">钉钉</h4>
              <p className="text-xs text-gray-500">DingTalk</p>
            </div>
            <button
              onClick={() => handleChange('enableDingtalk', !settings.enableDingtalk)}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.enableDingtalk ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.enableDingtalk ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <ConfigPanel icon="⚙" iconBg="bg-blue-100" iconColor="text-blue-600" title="钉钉" enabled={settings.enableDingtalk}>
            <Field label="CorpId（企业ID）" hint="在钉钉开放平台 → 组织信息中获取" value={settings.dingtalkCorpId} onChange={v => handleChange('dingtalkCorpId', v)} placeholder="ding1234567890abcdef" />
            <Field label="AppKey" hint="应用的 AppKey（或 SuiteKey）" value={settings.dingtalkAppKey} onChange={v => handleChange('dingtalkAppKey', v)} placeholder="dingxxxxxx" />
            <Field label="AppSecret" hint="应用的 AppSecret，需妥善保管" value={settings.dingtalkAppSecret} onChange={v => handleChange('dingtalkAppSecret', v)} type="password" placeholder="••••••••" />
            <Field label="AgentId（应用ID）" hint="企业内部应用的 AgentId" value={settings.dingtalkAgentId} onChange={v => handleChange('dingtalkAgentId', v)} placeholder="123456789" />
            <Field label="回调URL" hint="钉钉推送事件的回调地址" value={settings.dingtalkCallbackUrl} onChange={v => handleChange('dingtalkCallbackUrl', v)} placeholder="https://your-domain.com/api/dingtalk/callback" />
            <button
              onClick={() => handleTestConnection('dingtalk')}
              disabled={testing === 'dingtalk' || !settings.dingtalkAppKey}
              className="w-full mt-2 px-3 py-2 border border-blue-300 text-blue-700 rounded-lg text-sm hover:bg-blue-50 transition-colors disabled:opacity-40"
            >
              {testing === 'dingtalk' ? '测试中...' : '🔍 测试连接'}
            </button>
            {testResult?.platform === 'dingtalk' && (
              <div className={`mt-2 px-3 py-2 rounded-lg text-xs ${testResult.success ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                {testResult.success ? '✅ 连接成功' : `❌ ${testResult.message}`}
              </div>
            )}
          </ConfigPanel>

          {!settings.enableDingtalk && (
            <div className="mt-4 text-center text-xs text-gray-400 py-6 border-t border-dashed border-gray-100">
              开启后可配置钉钉接口参数
            </div>
          )}
        </div>

        {/* ━━ 飞书 ━━ */}
        <div className={`bg-white rounded-xl border-2 p-6 transition-colors ${settings.enableFeishu ? 'border-purple-400' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white text-lg font-bold">飞</div>
            <div className="flex-1">
              <h4 className="font-bold text-sm">飞书</h4>
              <p className="text-xs text-gray-500">Feishu / Lark</p>
            </div>
            <button
              onClick={() => handleChange('enableFeishu', !settings.enableFeishu)}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.enableFeishu ? 'bg-purple-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.enableFeishu ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <ConfigPanel icon="⚙" iconBg="bg-purple-100" iconColor="text-purple-600" title="飞书" enabled={settings.enableFeishu}>
            <Field label="App ID" hint="在飞书开放平台 → 应用凭证中获取" value={settings.feishuAppId} onChange={v => handleChange('feishuAppId', v)} placeholder="cli_a5xxxxxxxxxxxxx" />
            <Field label="App Secret" hint="应用密钥，需妥善保管" value={settings.feishuAppSecret} onChange={v => handleChange('feishuAppSecret', v)} type="password" placeholder="••••••••" />
            <Field label="Encrypt Key" hint="事件订阅的加密密钥（可选）" value={settings.feishuEncryptKey} onChange={v => handleChange('feishuEncryptKey', v)} placeholder="加密密钥" />
            <Field label="Verification Token" hint="事件订阅的验证 Token（可选）" value={settings.feishuVerificationToken} onChange={v => handleChange('feishuVerificationToken', v)} placeholder="验证Token" />
            <Field label="回调URL" hint="飞书推送事件的回调地址" value={settings.feishuCallbackUrl} onChange={v => handleChange('feishuCallbackUrl', v)} placeholder="https://your-domain.com/api/feishu/callback" />
            <button
              onClick={() => handleTestConnection('feishu')}
              disabled={testing === 'feishu' || !settings.feishuAppId}
              className="w-full mt-2 px-3 py-2 border border-purple-300 text-purple-700 rounded-lg text-sm hover:bg-purple-50 transition-colors disabled:opacity-40"
            >
              {testing === 'feishu' ? '测试中...' : '🔍 测试连接'}
            </button>
            {testResult?.platform === 'feishu' && (
              <div className={`mt-2 px-3 py-2 rounded-lg text-xs ${testResult.success ? 'bg-purple-50 text-purple-700' : 'bg-red-50 text-red-700'}`}>
                {testResult.success ? '✅ 连接成功' : `❌ ${testResult.message}`}
              </div>
            )}
          </ConfigPanel>

          {!settings.enableFeishu && (
            <div className="mt-4 text-center text-xs text-gray-400 py-6 border-t border-dashed border-gray-100">
              开启后可配置飞书接口参数
            </div>
          )}
        </div>
      </div>

      {/* ━━ 配置说明 ━━ */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
          <span className="text-gray-500">💡</span> 对接配置说明
        </h4>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs text-gray-600">
          <div>
            <p className="font-semibold text-green-700 mb-1">企业微信对接步骤</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>登录企业微信管理后台</li>
              <li>创建自建应用，获取 AgentId 和 Secret</li>
              <li>在"我的企业"获取 CorpID</li>
              <li>配置接收消息服务器（填写回调URL、Token、EncodingAESKey）</li>
              <li>设置OAuth2.0网页授权域名</li>
              <li>填写以上信息并保存，点击测试连接</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold text-blue-700 mb-1">钉钉对接步骤</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>登录钉钉开放平台</li>
              <li>创建企业内部应用，获取 AppKey 和 AppSecret</li>
              <li>在组织信息中获取 CorpId</li>
              <li>配置事件订阅回调地址</li>
              <li>开通登录接口权限（auth.userInfo）</li>
              <li>填写以上信息并保存，点击测试连接</li>
            </ol>
          </div>
          <div>
            <p className="font-semibold text-purple-700 mb-1">飞书对接步骤</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>登录飞书开放平台</li>
              <li>创建企业自建应用，获取 App ID 和 App Secret</li>
              <li>配置事件订阅（填写回调URL、Encrypt Key、Verification Token）</li>
              <li>开通"获取用户基本信息"权限</li>
              <li>配置网页应用（设置重定向URL）</li>
              <li>填写以上信息并保存，点击测试连接</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
