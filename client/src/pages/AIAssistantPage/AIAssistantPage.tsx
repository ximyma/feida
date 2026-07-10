import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, Button, Input, Select, Tag, message, Space, Divider, Tooltip, Empty, Dropdown, Menu, Modal, Badge, Popconfirm, Avatar } from 'antd';
import {
  Send, Bot, User, Sparkles, BarChart3, FileSearch, Languages, BookOpen,
  Trash2, Copy, RefreshCw, Settings, Plus, MessageSquare, ChevronLeft,
  ChevronRight, MoreHorizontal, Edit, Brain, Wrench, Zap, Terminal,
  FileText, Calculator, Search, Globe, Code, Database, FolderOpen,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

const QUICK_ACTIONS = [
  { label: '数据分析', icon: BarChart3, prompt: '请帮我分析最近一个月的员工出勤数据，找出趋势和建议。' },
  { label: '招聘建议', icon: FileSearch, prompt: '请给我一些提升招聘效率的建议，包括简历筛选技巧和面试问题设计。' },
  { label: '制度查询', icon: BookOpen, prompt: '请帮我查询公司关于年假的最新政策规定。' },
  { label: '翻译辅助', icon: Languages, prompt: '请帮我把以下内容翻译成英文：(请粘贴文本)' },
  { label: '薪酬分析', icon: BarChart3, prompt: '请帮我分析一下当前的薪酬结构是否合理，有什么优化建议？' },
  { label: '培训规划', icon: Sparkles, prompt: '请帮我设计一个为期3个月的新员工入职培训计划。' },
];

const CODE_QUICK_ACTIONS = [
  { label: '查看表结构', icon: Database, prompt: '帮我查看数据库中所有表的名称和结构。' },
  { label: '搜索代码', icon: Search, prompt: '帮我搜索项目中所有与"权限"或"Permission"相关的代码。' },
  { label: '查看路由', icon: FolderOpen, prompt: '帮我列出 server/standalone.ts 中所有注册的 API 路由。' },
  { label: '修改文件', icon: Code, prompt: '帮我创建一个新的前端页面：一个简单的数据统计仪表盘。' },
  { label: '数据库查询', icon: Database, prompt: '帮我查询当前系统有多少用户和角色。' },
  { label: '运行构建', icon: Terminal, prompt: '帮我运行 npm run build:server 检查有无编译错误。' },
];

const AGENT_TOOLS = [
  { key: 'search_knowledge', label: '搜索知识库', icon: Search, desc: '检索HR知识库中的相关信息' },
  { key: 'analyze_data', label: '数据分析', icon: Calculator, desc: '分析HR数据并生成洞察' },
  { key: 'translate', label: '翻译转换', icon: Globe, desc: '多语言翻译' },
  { key: 'extract_doc', label: '提取文档', icon: FileText, desc: '从文档中提取关键信息' },
];

export default function AIAssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [useKnowledge, setUseKnowledge] = useState(false);
  const [kbList, setKbList] = useState<{id:string, name:string}[]>([]);
  const [selectedKbIds, setSelectedKbIds] = useState<string[]>([]);
  const [modelList, setModelList] = useState<{id:string, name:string, model:string}[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<'general' | 'code'>('general');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const welcomeMsg: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: `你好！👋 我是飞达智能AI助手

我可以帮你：
📊 **数据分析** - 分析考勤、薪酬、绩效等HR数据
📝 **招聘辅助** - 简历分析、面试建议
📚 **制度查询** - 查询HR政策和规章制度
🌍 **多语言翻译** - 中英日越等10+语言翻译
💡 **管理建议** - 提供专业的HR管理咨询

你可以点击左侧的快捷操作开始，或直接输入问题。`,
    timestamp: Date.now(),
  };

  // 加载对话列表和知识库列表
  useEffect(() => { loadConversations(); loadKBs(); loadModels(); }, []);

  // 滚动到底部
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, streamingContent]);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/ai/conversations');
      const data = await res.json();
      if (data.success) setConversations(data.data || []);
    } catch {}
  };

  const loadKBs = async () => {
    try {
      const res = await fetch('/api/ai/kb');
      const data = await res.json();
      setKbList((data.data || []).map((kb:any) => ({ id: kb.id, name: kb.name })));
    } catch {}
  };

  const loadModels = async () => {
    try {
      const res = await fetch('/api/ai/models');
      const data = await res.json();
      const list = (data.data || []).filter((m:any) => m.is_active === 1);
      setModelList(list.map((m:any) => ({ id: m.id, name: m.name, model: m.model })));
      if (list.length > 0) setSelectedModelId(list[0].id);
    } catch {}
  };

  const selectConversation = async (id: string) => {
    setActiveConversationId(id);
    try {
      const res = await fetch(`/api/ai/conversations/${id}`);
      const data = await res.json();
      if (data.success && data.data?.messages) {
        setMessages(data.data.messages.map((m: any) => ({
          id: m.id, role: m.role, content: m.content, timestamp: new Date(m.timestamp).getTime(),
        })));
      }
    } catch {
      setMessages([]);
    }
  };

  const newConversation = async () => {
    setMessages([welcomeMsg]);
    setActiveConversationId(null);
    setStreamingContent('');
    try {
      const res = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '新对话' }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveConversationId(data.data.id);
        loadConversations();
      }
    } catch {}
  };

  const deleteConversation = async (id: string) => {
    try {
      await fetch(`/api/ai/conversations/${id}`, { method: 'DELETE' });
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([welcomeMsg]);
      }
      loadConversations();
      message.success('对话已删除');
    } catch { message.error('删除失败'); }
  };

  const saveMessage = async (role: string, content: string) => {
    if (!activeConversationId) return;
    try {
      await fetch(`/api/ai/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content }),
      });
      loadConversations();
    } catch {}
  };

  // 构建工具增强的系统提示
  const buildToolSystemPrompt = () => {
    if (!activeTool) return '';
    const toolMap: Record<string, string> = {
      search_knowledge: '\n【当前模式：知识库搜索】请优先从系统知识库中检索相关信息回答问题。',
      analyze_data: '\n【当前模式：数据分析】请以数据分析师的身份进行深度分析。',
      translate: '\n【当前模式：翻译模式】请专注于翻译任务，保持原文格式。',
      extract_doc: '\n【当前模式：文档处理】请从文本中提取结构化信息。',
    };
    return toolMap[activeTool] || '';
  };

  const sendMessage = useCallback(async (content?: string) => {
    const text = content || inputValue.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { id: 'u_' + Date.now(), role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);
    setStreamingContent('');

    if (!activeConversationId) {
      try {
        const res = await fetch('/api/ai/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: text.substring(0, 30) }),
        });
        const data = await res.json();
        if (data.success) setActiveConversationId(data.data.id);
      } catch {}
    }

    await saveMessage('user', text);

    // 收集对话上下文（必须在代码助手模式之前声明，避免 TDZ 错误）
    const allMessages = [...messages, userMsg].filter(m => m.id !== 'welcome' && m.role !== 'system');

    // ===== 代码助手模式 =====
    if (agentMode === 'code') {
      try {
        // 显示加载提示
        setMessages(prev => [...prev, { id: 'a_loading', role: 'assistant', content: '🔄 代码助手正在工作中...\n如果是本地 Ollama 模型，首次加载可能需要 3-5 分钟，请耐心等待。', timestamp: Date.now() }]);
        const codeMessages = [
          { role: 'system', content: `你是飞达项目的代码助手。项目路径: D:\\feida。你可以使用以下工具：read_file(读文件)、write_file(写文件)、patch(修改文件)、grep(搜索代码)、glob(查找文件)、bash(执行命令)、sql_query(查询数据库)。当用户要求修改代码、查询数据、执行操作时，直接调用工具。操作完成后用中文回复结果。` },
          ...allMessages.map(m => ({ role: m.role, content: m.content })),
        ];
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600000); // 10分钟超时（ollama 首次加载慢）
        const res = await fetch('/api/ai/code-agent/run', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: codeMessages, options: { maxIterations: 10, temperature: 0.3 } }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const data = await res.json();
        // 移除加载提示
        setMessages(prev => prev.filter(m => m.id !== 'a_loading'));
        if (data.success && data.data) {
          const { content, steps } = data.data;
          // 显示工具执行过程
          if (steps && steps.length > 0) {
            steps.forEach((s: any) => {
              setMessages(prev => [...prev, {
                id: 's_' + Date.now() + Math.random(),
                role: 'tool' as const,
                content: `🔧 执行工具: **${s.tool}**\n\n参数: \`${JSON.stringify(s.params)}\`\n\n结果: ${typeof s.result === 'string' ? s.result : '```\n' + JSON.stringify(s.result, null, 2).slice(0, 1500) + '\n```'}`,
                timestamp: Date.now()
              }]);
            });
          }
          setMessages(prev => [...prev, { id: 'a_' + Date.now(), role: 'assistant', content: content || '代码助手无响应', timestamp: Date.now() }]);
        } else {
          setMessages(prev => [...prev, { id: 'a_' + Date.now(), role: 'assistant', content: '代码助手调用失败：' + (data.error || '未知错误'), timestamp: Date.now() }]);
        }
      } catch (e: any) {
        setMessages(prev => prev.filter(m => m.id !== 'a_loading'));
        const errMsg = e.name === 'AbortError' ? '请求超时（10分钟）。本地 Ollama 模型加载可能过长，请确认模型已加载后重试。' : ('网络异常：' + e.message);
        setMessages(prev => [...prev, { id: 'a_' + Date.now(), role: 'assistant', content: errMsg, timestamp: Date.now() }]);
      }
      setLoading(false);
      return;
    }
    // =========================

    try {
      const toolPrompt = buildToolSystemPrompt();
      const systemMsg = toolPrompt ? `你是飞达智能HR系统的AI助手。${toolPrompt}请用中文回答。` : undefined;

      const apiMessages = [
        ...(systemMsg ? [{ role: 'system', content: systemMsg }] : []),
        ...allMessages.map(m => ({ role: m.role, content: m.content })),
      ];

      const endpoint = useKnowledge ? '/api/ai/rag-chat' : '/api/ai/stream-chat';
      const body = useKnowledge
        ? JSON.stringify({ query: text, messages: apiMessages, kbIds: selectedKbIds.length > 0 ? selectedKbIds : undefined })
        : JSON.stringify({ messages: apiMessages, options: { modelId: selectedModelId } });

      // 流式响应
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (useKnowledge) {
        // RAG模式非流式
        const data = await res.json();
        if (data.success) {
          const aiContent = data.data?.content || '';
          setMessages(prev => [...prev, { id: 'a_' + Date.now(), role: 'assistant', content: aiContent, timestamp: Date.now() }]);
          await saveMessage('assistant', aiContent);
        }
      } else {
        // 流式模式: 读取 SSE
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.type === 'content' && parsed.content) {
                  fullContent = parsed.content;
                  setStreamingContent(fullContent);
                } else if (parsed.type === 'done') {
                  // 完成
                } else if (parsed.type === 'error') {
                  throw new Error(parsed.error);
                }
              } catch {}
            }
          }
        }

        if (fullContent) {
          setMessages(prev => [...prev, { id: 'a_' + Date.now(), role: 'assistant', content: fullContent, timestamp: Date.now() }]);
          await saveMessage('assistant', fullContent);
        }
        setStreamingContent('');
      }
    } catch (e: any) {
      setMessages(prev => [...prev, {
        id: 'err_' + Date.now(), role: 'assistant',
        content: `⚠️ AI服务暂时不可用\n\n${e.message}\n\n请检查AI配置和网络连接。`,
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [inputValue, loading, messages, activeConversationId, useKnowledge, selectedKbIds, selectedModelId, activeTool]);

  const clearChat = () => {
    setMessages([welcomeMsg]);
    message.success('对话已清空');
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('已复制');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/### (.+)/g, '<h4 style="margin:12px 0 4px">$1</h4>')
      .replace(/\n/g, '<br/>')
      .replace(/^- (.+)/gm, '• $1')
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background:#f5f5f5;padding:8px;border-radius:4px;overflow:auto"><code>$2</code></pre>');
  };

  const activeConv = conversations.find(c => c.id === activeConversationId);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', gap: 12 }}>
      {/* 左侧对话列表 */}
      <div style={{
        width: sidebarOpen ? 260 : 0, overflow: 'hidden',
        transition: 'width 0.3s', flexShrink: 0,
      }}>
        <Card size="small" style={{ height: '100%' }}
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 'bold' }}>对话历史</span>
              <Button type="text" size="small" icon={<ChevronLeft size={14} />} onClick={() => setSidebarOpen(false)} />
            </div>
          }
        >
          <Button type="primary" block icon={<Plus size={14} />} onClick={newConversation} style={{ marginBottom: 8 }}>
            新对话
          </Button>

          <div style={{ overflow: 'auto', maxHeight: 'calc(100% - 60px)' }}>
            {conversations.length === 0 ? (
              <Empty description="暂无对话" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  style={{
                    padding: '8px 8px', borderRadius: 6, cursor: 'pointer',
                    marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8,
                    backgroundColor: activeConversationId === conv.id ? '#e6f7ff' : 'transparent',
                    border: activeConversationId === conv.id ? '1px solid #91d5ff' : '1px solid transparent',
                  }}
                >
                  <MessageSquare size={14} color={activeConversationId === conv.id ? '#1890ff' : '#999'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: activeConversationId === conv.id ? 'bold' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.title}
                    </div>
                    <div style={{ fontSize: 10, color: '#999' }}>
                      {conv.messageCount}条 · {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Popconfirm title="删除此对话？" onConfirm={(e) => { e?.stopPropagation(); deleteConversation(conv.id); }}>
                    <Button type="text" size="small" icon={<Trash2 size={12} />} danger onClick={e => e.stopPropagation()} />
                  </Popconfirm>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* 右侧对话区 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* 工具栏 */}
        <Card size="small" style={{ marginBottom: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Space>
              {!sidebarOpen && (
                <Button type="text" icon={<ChevronRight size={16} />} onClick={() => setSidebarOpen(true)} />
              )}
              <Sparkles size={18} color="#1890ff" />
              <span style={{ fontWeight: 'bold', fontSize: 14 }}>
                {activeConv?.title || '新对话'}
              </span>
              <Tag color="blue">AI</Tag>
            </Space>

            <Space wrap>              {/* 工具选择 */}
              <Dropdown menu={{ items: [
                ...AGENT_TOOLS.map(tool => ({
                  key: tool.key,
                  icon: <tool.icon size={14} />,
                  label: (
                    <div>
                      <div style={{ fontWeight: activeTool === tool.key ? 'bold' : 'normal' }}>{tool.label}</div>
                      <div style={{ fontSize: 11, color: '#999' }}>{tool.desc}</div>
                    </div>
                  ),
                })),
                ...(activeTool ? [{ key: '_clear', icon: <Zap size={14} />, label: '清除模式' }] : []),
              ], onClick: ({ key }) => setActiveTool(key === activeTool ? null : key) }}>
                <Button size="small" icon={<Wrench size={14} />} type={activeTool ? 'primary' : 'default'}>
                  {activeTool ? AGENT_TOOLS.find(t => t.key === activeTool)?.label : '工具'}
                </Button>
              </Dropdown>

              {modelList.length > 0 && (
                <Select
                  value={selectedModelId}
                  onChange={setSelectedModelId}
                  size="small"
                  style={{ width: 170 }}
                  options={modelList.map(m => ({ value: m.id, label: m.name }))}
                />
              )}

              <Tooltip title={useKnowledge ? '知识库增强ON' : '知识库增强OFF'}>
                <Button size="small" type={useKnowledge ? 'primary' : 'default'} onClick={() => setUseKnowledge(!useKnowledge)} icon={<BookOpen size={14} />}>
                  知识库{useKnowledge ? ' ON' : ''}
                </Button>
              </Tooltip>

              {useKnowledge && kbList.length > 0 && (
                <Select
                  mode="multiple"
                  size="small"
                  placeholder="选择知识库（默认全部）"
                  value={selectedKbIds}
                  onChange={setSelectedKbIds}
                  style={{ minWidth: 160, maxWidth: 260 }}
                  maxTagCount={2}
                  options={kbList.map(kb => ({ value: kb.id, label: kb.name }))}
                  allowClear
                />
              )}

              <Tooltip title="清空当前对话">
                <Button size="small" icon={<Trash2 size={14} />} onClick={clearChat} danger />
              </Tooltip>
            </Space>
          </div>
        </Card>

        {/* 消息列表 */}
        <div style={{
          flex: 1, overflow: 'auto', padding: '8px 4px',
          backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 8,
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              display: 'flex', gap: 12, padding: '12px 16px',
              backgroundColor: msg.role === 'assistant' ? '#fff' : msg.role === 'tool' ? '#f6ffed' : '#e6f7ff',
              borderBottom: '1px solid #f0f0f0',
            }}>
              <Avatar
                size={32}
                icon={msg.role === 'assistant' ? <Bot size={16} /> : msg.role === 'tool' ? <Wrench size={16} /> : <User size={16} />}
                style={{ backgroundColor: msg.role === 'assistant' ? '#f0f5ff' : msg.role === 'tool' ? '#52c41a' : '#1890ff', color: msg.role === 'assistant' ? '#1890ff' : '#fff', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4, color: '#1f1f1f' }}>
                  {msg.role === 'assistant' ? 'AI助手' : msg.role === 'tool' ? '工具执行' : '我'}
                  <span style={{ fontWeight: 'normal', color: '#999', fontSize: 10, marginLeft: 8 }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div style={{ lineHeight: 1.8, wordBreak: 'break-word', fontSize: 14 }}
                  dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                />
                {msg.role === 'assistant' && msg.id !== 'welcome' && (
                  <Button type="text" size="small" icon={<Copy size={12} />} onClick={() => copyMessage(msg.content)} style={{ marginTop: 4, color: '#999' }}>复制</Button>
                )}
              </div>
            </div>
          ))}

          {/* 流式输出中 */}
          {streamingContent && (
            <div style={{ display: 'flex', gap: 12, padding: '12px 16px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
              <Avatar size={32} icon={<Bot size={16} />} style={{ backgroundColor: '#f0f5ff', color: '#1890ff', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>AI助手 <Tag color="processing" style={{ fontSize: 10 }}>输出中...</Tag></div>
                <div style={{ lineHeight: 1.8, fontSize: 14 }} dangerouslySetInnerHTML={{ __html: formatContent(streamingContent) }} />
              </div>
            </div>
          )}

          {/* 加载中(非流式) */}
          {loading && !streamingContent && (
            <div style={{ display: 'flex', gap: 12, padding: '12px 16px', backgroundColor: '#fff' }}>
              <Avatar size={32} icon={<Bot size={16} />} style={{ backgroundColor: '#f0f5ff', color: '#1890ff' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#999' }}>
                <RefreshCw size={14} className="animate-spin" /> 思考中...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Agent 模式选择器 */}
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#999' }}>模式：</span>
          <Button size="small" type={agentMode === 'general' ? 'primary' : 'default'}
            onClick={() => { setAgentMode('general'); setActiveTool(null); }}
            icon={<Bot size={12} />}>通用助手</Button>
          <Button size="small" type={agentMode === 'code' ? 'primary' : 'default'}
            onClick={() => { setAgentMode('code'); setActiveTool(null); }}
            icon={<Terminal size={12} />}>代码助手</Button>
          {agentMode === 'code' && <Tag color="orange" style={{ marginLeft: 4, fontSize: 11 }}>可读写文件·执行命令·操作数据库</Tag>}
        </div>

        {/* 快捷操作 */}
        {messages.length <= 1 && !loading && (
          <Card size="small" style={{ marginBottom: 8, flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
              {agentMode === 'code' ? '代码助手快捷操作：' : '试试这些：'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(agentMode === 'code' ? CODE_QUICK_ACTIONS : QUICK_ACTIONS).map((action, idx) => (
                <Button key={idx} size="small" icon={<action.icon size={12} />} onClick={() => sendMessage(action.prompt)}>
                  {action.label}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* 输入区域 */}
        <div style={{ flexShrink: 0 }}>
          <Input.TextArea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={agentMode === 'code' ? '代码助手模式：输入指令，如"帮我查看表结构"或"搜索权限相关代码"...' : (activeTool ? `【${AGENT_TOOLS.find(t => t.key === activeTool)?.label}模式】输入内容...` : '输入HR问题，Enter发送 / Shift+Enter换行...')}
            autoSize={{ minRows: 2, maxRows: 4 }}
            disabled={loading}
            style={{ borderRadius: 8, fontSize: 14 }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: '#999' }}>
              {activeConversationId ? '对话已保存' : '新对话·未保存'} | 模型: 系统配置中管理
            </span>
            <Button type="primary" icon={<Send size={14} />} onClick={() => sendMessage()} loading={loading} disabled={!inputValue.trim()} size="large">
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
