import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Form, Input, Button, Select, message } from 'antd';
import { Send, Phone, Mail, MapPin, Clock } from 'lucide-react';

const { TextArea } = Input;

export default function SiteContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await fetch('/api/site_messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: values.name, contact: values.contact, type: 'contact', subject: values.subject, content: values.content, created_at: new Date().toISOString() })
      });
      message.success('留言已提交，我们会尽快回复！');
      form.resetFields();
    } catch { message.error('提交失败'); }
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
            <Link to="/site/guestbook" style={{ color: '#fff' }}>留言板</Link>
            <Link to="/site/contact" style={{ color: '#1890ff', fontWeight: 'bold' }}>联系我们</Link>
            <Link to="/shop" style={{ color: '#fff' }}>商城</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ marginBottom: 24 }}>📬 联系我们</h1>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 550px' }}>
            <Card title="在线留言">
              <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item name="subject" label="主题" rules={[{ required: true }]} initialValue="general">
                  <Select options={[
                    { label: '💬 一般咨询', value: 'general' },
                    { label: '🤝 商务合作', value: 'business' },
                    { label: '🔧 技术支持', value: 'tech' },
                    { label: '💼 人才招聘', value: 'hr' },
                  ]} />
                </Form.Item>
                <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
                  <Input placeholder="您的姓名" maxLength={20} />
                </Form.Item>
                <Form.Item name="contact" label="联系方式" rules={[{ required: true }]}>
                  <Input placeholder="手机号或邮箱" maxLength={50} />
                </Form.Item>
                <Form.Item name="content" label="留言内容" rules={[{ required: true }]}>
                  <TextArea rows={4} placeholder="请描述您想了解的内容..." maxLength={500} showCount />
                </Form.Item>
                <Button type="primary" htmlType="submit" icon={<Send size={14} />} loading={submitting}>提交留言</Button>
              </Form>
            </Card>
          </div>

          <div style={{ flex: '0 1 320px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card title="联系方式">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
                <div><Phone size={16} style={{ marginRight: 8, color: '#1890ff' }} /> 400-888-8888</div>
                <div><Mail size={16} style={{ marginRight: 8, color: '#1890ff' }} /> contact@feida.com</div>
                <div><MapPin size={16} style={{ marginRight: 8, color: '#1890ff' }} /> 深圳市南山区科技园飞达大厦</div>
                <div><Clock size={16} style={{ marginRight: 8, color: '#1890ff' }} /> 周一至周五 9:00-18:00</div>
              </div>
            </Card>
            <Card title="关于飞达" size="small">
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.8, margin: 0 }}>
                飞达智能科技成立于2020年，专注于AI驱动的企业管理软件。核心产品包括飞达eHR、飞达ERP、飞达CMS、飞达商城，已服务超过500家企业客户。
              </p>
            </Card>
          </div>
        </div>
      </div>

      <div style={{ background: '#001529', color: '#fff', padding: '40px 0', textAlign: 'center', marginTop: 40 }}>
        <p style={{ margin: 0 }}>© 2026 飞达智能科技</p>
      </div>
    </div>
  );
}
