import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Form, Input, Button, message, List, Divider, Empty, Spin } from 'antd';
import { Send, User, Clock } from 'lucide-react';

const { TextArea } = Input;

interface Message {
  id: string;
  name: string;
  content: string;
  reply?: string;
  created_at: string;
}

export default function GuestbookPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { loadMessages(); }, []);

  const loadMessages = async () => {
    try {
      const res = await fetch('/api/site_messages?sort=created_at&order=desc&limit=50');
      const data = await res.json();
      setMessages(Array.isArray(data) ? data.filter((m: any) => m.type === 'guestbook') : []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await fetch('/api/site_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name, content: values.content, type: 'guestbook', created_at: new Date().toISOString() })
      });
      message.success('留言成功！');
      form.resetFields();
      loadMessages();
    } catch { message.error('留言失败'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ background: '#001529', color: '#fff', padding: '0 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <Link to="/site" style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>飞达信息</Link>
          <div style={{ display: 'flex', gap: 32 }}>
            <Link to="/site" style={{ color: '#fff' }}>首页</Link>
            <Link to="/site/articles" style={{ color: '#fff' }}>文章</Link>
            <Link to="/site/guestbook" style={{ color: '#1890ff', fontWeight: 'bold' }}>留言板</Link>
            <Link to="/shop" style={{ color: '#fff' }}>商城</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ marginBottom: 24 }}>💬 留言板</h1>

        <Card title="我要留言" style={{ marginBottom: 32 }}>
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item name="name" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
              <Input placeholder="如何称呼您？" maxLength={20} />
            </Form.Item>
            <Form.Item name="content" label="留言内容" rules={[{ required: true, message: '请输入留言内容' }]}>
              <TextArea rows={4} placeholder="说点什么吧..." maxLength={500} showCount />
            </Form.Item>
            <Button type="primary" htmlType="submit" icon={<Send size={14} />} loading={submitting}>发表留言</Button>
          </Form>
        </Card>

        <Card title={`全部留言 (${messages.length})`}>
          {loading ? <Spin /> : messages.length > 0 ? (
            <List dataSource={messages} renderItem={m => (
              <div style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>
                    <User size={14} style={{ marginRight: 6 }} />{m.name || '匿名'}
                  </span>
                  <span style={{ color: '#999', fontSize: 12 }}>
                    <Clock size={12} style={{ marginRight: 4 }} />{new Date(m.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ margin: 0, lineHeight: 1.6, color: '#333' }}>{m.content}</p>
                {m.reply && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#fffbe6', borderRadius: 4, border: '1px solid #ffe58f' }}>
                    <span style={{ color: '#fa8c16', fontWeight: 500 }}>管理员回复：</span>{m.reply}
                  </div>
                )}
              </div>
            )} />
          ) : <Empty description="暂无留言，快来发表第一条吧" />}
        </Card>
      </div>

      <div style={{ background: '#001529', color: '#fff', padding: '40px 0', textAlign: 'center', marginTop: 40 }}>
        <p style={{ margin: 0 }}>© 2026 飞达智能科技</p>
      </div>
    </div>
  );
}
