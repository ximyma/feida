import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Form, Input, Button, Select, message } from 'antd';
import { Send, Phone, Mail, MapPin } from 'lucide-react';

const { TextArea } = Input;

export default function ShopContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await fetch('/api/site_messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          contact: values.contact,
          type: 'shop_inquiry',
          subject: values.type,
          content: values.content,
          created_at: new Date().toISOString()
        })
      });
      message.success('提交成功，我们会尽快回复您！');
      form.resetFields();
    } catch { message.error('提交失败，请稍后重试'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ background: '#001529', color: '#fff', padding: '0 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <Link to="/shop" style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>飞达商城</Link>
          <div style={{ display: 'flex', gap: 32 }}>
            <Link to="/shop" style={{ color: '#fff' }}>首页</Link>
            <Link to="/shop/contact" style={{ color: '#1890ff', fontWeight: 'bold' }}>咨询投诉</Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ marginBottom: 8 }}>📞 咨询与投诉</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>有任何问题或建议，请填写以下表单，我们会在24小时内回复。</p>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px' }}>
            <Card>
              <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item name="type" label="类型" rules={[{ required: true }]} initialValue="consultation">
                  <Select options={[
                    { label: '💬 商品咨询', value: 'consultation' },
                    { label: '⚠️ 投诉建议', value: 'complaint' },
                    { label: '💡 其他建议', value: 'suggestion' },
                    { label: '🤝 商务合作', value: 'business' },
                  ]} />
                </Form.Item>
                <Form.Item name="name" label="联系人" rules={[{ required: true, message: '请输入姓名' }]}>
                  <Input placeholder="您的姓名" maxLength={20} />
                </Form.Item>
                <Form.Item name="contact" label="联系方式" rules={[{ required: true, message: '请输入联系方式' }]}>
                  <Input placeholder="手机号或邮箱" maxLength={50} />
                </Form.Item>
                <Form.Item name="content" label="详细描述" rules={[{ required: true, message: '请描述您的问题' }]}>
                  <TextArea rows={5} placeholder="请详细描述您的问题或建议..." maxLength={1000} showCount />
                </Form.Item>
                <Button type="primary" htmlType="submit" icon={<Send size={14} />} loading={submitting} size="large">提交</Button>
              </Form>
            </Card>
          </div>

          <div style={{ flex: '0 1 300px' }}>
            <Card title="联系方式" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div><Phone size={16} style={{ marginRight: 8 }} /> 400-888-8888</div>
                <div><Mail size={16} style={{ marginRight: 8 }} /> support@feida.com</div>
                <div><MapPin size={16} style={{ marginRight: 8 }} /> 深圳市南山区科技园</div>
              </div>
            </Card>
            <Card title="常见问题">
              <ul style={{ paddingLeft: 18, fontSize: 13, color: '#666', lineHeight: 2 }}>
                <li>如何修改订单？</li>
                <li>退换货流程</li>
                <li>发票申请</li>
                <li>企业团购优惠</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      <div style={{ background: '#001529', color: '#fff', padding: '40px 0', textAlign: 'center', marginTop: 40 }}>
        <p style={{ margin: 0 }}>© 2026 飞达智能科技 · 飞达商城</p>
      </div>
    </div>
  );
}
