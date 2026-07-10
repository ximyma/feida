import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Space, Typography, Tag, Spin } from 'antd';
import { MessageCircle, Send, X, Bot, User } from 'lucide-react';

const { Text } = Typography;

interface ChatMsg { role: 'user' | 'assistant'; content: string; }

const QUICK_QUESTIONS = ['飞达有哪些产品？', '如何购买商品？', '退换货流程', '企业定制服务', '技术支持联系方式'];

export default function AICustomerService() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: '您好！我是飞达AI智能客服 🤖\n有什么可以帮助您的？您也可以点击下方快捷问题直接提问。' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMsg = { role: 'user', content: text };
    const msgs = [...messages, userMsg];
    setMessages(msgs);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: '你是飞达智能科技的AI客服助手。飞达主要产品有：飞达eHR(人力资源管理)、飞达ERP(企业资源管理)、飞达CMS(内容管理)、飞达商城(电商平台)。回答简洁友好，不超过150字。' },
            ...msgs.map(m => ({ role: m.role, content: m.content }))
          ]
        })
      });
      const data = await res.json();
      const reply = data.success && data.data ? (data.data.content || data.data) : '抱歉，AI服务暂不可用，请稍后重试或拨打 400-888-8888 咨询人工客服。';
      setMessages(prev => [...prev, { role: 'assistant', content: typeof reply === 'string' ? reply : JSON.stringify(reply) }]);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: '网络连接异常，请稍后重试或拨打 400-888-8888。' }]); }
    finally { setLoading(false); }
  };

  return (
    <>
      {!open && (
        <div onClick={() => setOpen(true)} style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999, cursor: 'pointer',
          width: 56, height: 56, borderRadius: '50%', background: '#1890ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(24,144,255,0.4)'
        }}>
          <MessageCircle size={28} color="#fff" />
        </div>
      )}

      {open && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999, width: 360, maxHeight: 520,
          background: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ background: '#1890ff', color: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space><Bot size={20} /><Text style={{ color: '#fff', fontWeight: 500 }}>飞达AI客服</Text></Space>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setOpen(false)} />
          </div>

          <div ref={listRef} style={{ flex: 1, overflow: 'auto', padding: '12px 16px', maxHeight: 320, background: '#f5f5f5' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                {m.role === 'assistant' && <Bot size={18} style={{ marginTop: 4, color: '#1890ff', flexShrink: 0 }} />}
                <div style={{
                  maxWidth: '75%', padding: '8px 12px', borderRadius: 8, fontSize: 13, lineHeight: 1.6,
                  background: m.role === 'user' ? '#1890ff' : '#fff', color: m.role === 'user' ? '#fff' : '#333',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                }}>{m.content}</div>
                {m.role === 'user' && <User size={18} style={{ marginTop: 4, color: '#888', flexShrink: 0 }} />}
              </div>
            ))}
            {loading && <Spin size="small" style={{ marginLeft: 8 }} />}
          </div>

          {messages.length <= 1 && (
            <div style={{ padding: '0 16px 8px', background: '#f5f5f5' }}>
              {QUICK_QUESTIONS.map(q => (
                <Tag key={q} color="blue" style={{ cursor: 'pointer', marginBottom: 4 }} onClick={() => send(q)}>{q}</Tag>
              ))}
            </div>
          )}

          <div style={{ padding: '8px 12px', borderTop: '1px solid #eee', display: 'flex', gap: 8 }}>
            <Input value={input} onChange={e => setInput(e.target.value)} onPressEnter={() => send(input)}
              placeholder="输入问题..." size="small" style={{ flex: 1 }} maxLength={200} />
            <Button type="primary" size="small" icon={<Send size={14} />} onClick={() => send(input)} loading={loading} />
          </div>
        </div>
      )}
    </>
  );
}
