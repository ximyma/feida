import React, { useState } from 'react';
import { Modal, Tabs, Form, Input, Button, message } from 'antd';
import { User, Phone, Lock } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

export default function LoginModal({ open, onClose, onLogin }: Props) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm] = Form.useForm();
  const [regForm] = Form.useForm();

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/shop-login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('shop_token', data.token);
        localStorage.setItem('shop_user', JSON.stringify(data.user));
        message.success('登录成功');
        onLogin(data.user);
        onClose();
        loginForm.resetFields();
      } else {
        message.error(data.error || '登录失败');
      }
    } catch { message.error('网络错误'); }
    setLoading(false);
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/shop-register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      const data = await res.json();
      if (data.success) {
        message.success('注册成功，请登录');
        setActiveTab('login');
        regForm.resetFields();
      } else {
        message.error(data.error || '注册失败');
      }
    } catch { message.error('网络错误'); }
    setLoading(false);
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={400} centered>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🛒</div>
        <h2 style={{ margin: 0 }}>飞达商城</h2>
      </div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} centered
        items={[
          {
            key: 'login',
            label: '登录',
            children: (
              <Form form={loginForm} onFinish={handleLogin} layout="vertical" size="large">
                <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
                  <Input prefix={<Phone size={16} />} placeholder="手机号" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                  <Input.Password prefix={<Lock size={16} />} placeholder="密码" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>登录</Button>
              </Form>
            )
          },
          {
            key: 'register',
            label: '注册',
            children: (
              <Form form={regForm} onFinish={handleRegister} layout="vertical" size="large">
                <Form.Item name="name" rules={[{ required: true, message: '请输入昵称' }]}>
                  <Input prefix={<User size={16} />} placeholder="昵称" />
                </Form.Item>
                <Form.Item name="phone" rules={[{ required: true, message: '请输入手机号' }]}>
                  <Input prefix={<Phone size={16} />} placeholder="手机号" />
                </Form.Item>
                <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                  <Input.Password prefix={<Lock size={16} />} placeholder="密码" />
                </Form.Item>
                <Button type="primary" htmlType="submit" block loading={loading}>注册</Button>
              </Form>
            )
          }
        ]}
      />
    </Modal>
  );
}
