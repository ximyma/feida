import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function simpleHash(pwd: string): string {
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    hash = ((hash << 5) - hash) + pwd.charCodeAt(i);
    hash = hash & hash;
  }
  return String(hash);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'admin' | 'employee'>('admin');
  const [adminUsername, setAdminUsername] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !password) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: adminUsername, password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || '登录失败'); setLoading(false); return; }
      sessionStorage.setItem('__current_user', JSON.stringify(data.user));
      navigate('/');
    } catch {
      setError('网络错误，请检查服务器是否启动');
      setLoading(false);
    }
  };

  const handleEmployeeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeePhone.trim() || !password) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: employeePhone, password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message || '登录失败'); setLoading(false); return; }
      sessionStorage.setItem('__current_user', JSON.stringify(data.user));
      navigate('/');
    } catch {
      setError('网络错误，请检查服务器是否启动');
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box', padding: '12px 14px',
    border: '1.5px solid #e0e0e0', borderRadius: 10, fontSize: 15, outline: 'none',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%', padding: '12px',
    background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: loading ? 'none' : '0 4px 15px rgba(102,126,234,0.4)',
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', padding: '40px 36px', width: 440, maxWidth: '92vw' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontSize: 28, fontWeight: 700 }}>飞</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '0 0 4px' }}>飞达智能HR系统</h1>
          <p style={{ color: '#666', fontSize: 13, margin: 0 }}>请选择登录方式</p>
        </div>

        <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {[{ key: 'admin', label: '管理员登录' }, { key: 'employee', label: '员工登录' }].map(tab => (
            <button key={tab.key} onClick={() => { setMode(tab.key as any); setError(''); setPassword(''); }}
              style={{ flex: 1, padding: '9px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
                background: mode === tab.key ? '#fff' : 'transparent', color: mode === tab.key ? '#667eea' : '#999',
                boxShadow: mode === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {mode === 'admin' ? (
          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>用户名</label>
              <input type="text" value={adminUsername} onChange={e => setAdminUsername(e.target.value)} placeholder="请输入管理员用户名"
                autoFocus style={{ ...inputStyle, paddingLeft: 42 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>密码</label>
              <div style={{ position: 'relative' }}>
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码"
                  style={{ ...inputStyle, paddingRight: 42 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 4 }}>
                  {showPwd ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            {error && <div style={{ background: '#fff2f2', border: '1px solid #ffcdd2', borderRadius: 8, padding: '9px 12px', marginBottom: 14, color: '#c62828', fontSize: 13 }}>{error}</div>}
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? '登录中...' : '登录'}</button>
            <div style={{ marginTop: 20, padding: '12px 14px', background: '#f8f9ff', borderRadius: 10, fontSize: 12, color: '#888' }}>
              <strong>管理员账户：</strong> admin / admin123
            </div>
          </form>
        ) : (
          <form onSubmit={handleEmployeeLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>手机号</label>
              <input type="tel" value={employeePhone} onChange={e => setEmployeePhone(e.target.value)} placeholder="请输入绑定的手机号"
                maxLength={11} style={{ ...inputStyle }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#555', marginBottom: 6, fontWeight: 500 }}>密码</label>
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入密码"
                style={{ ...inputStyle }} />
            </div>
            {error && <div style={{ background: '#fff2f2', border: '1px solid #ffcdd2', borderRadius: 8, padding: '9px 12px', marginBottom: 14, color: '#c62828', fontSize: 13 }}>{error}</div>}
            <button type="submit" disabled={loading} style={btnStyle}>{loading ? '登录中...' : '登录'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
