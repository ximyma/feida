import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Card, Button, Tag, Modal, Form, Input, Select, Switch, message, Space, Popconfirm, Tabs, Divider, Row, Col, InputNumber, Checkbox, Upload, Empty } from 'antd';
import { Plus, Edit, Delete, FolderOpen, FileText, MessageSquare, Settings, Sparkles, SpellCheck, Upload as UploadIcon } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';
import usePermission from '../../hooks/usePermission';
import { useI18n } from '../../i18n';

const { TextArea } = Input;

interface Channel {
  id: string;
  name: string;
  code?: string;
  parent_id?: string;
  sort_order: number;
  is_show: number;
  type?: string;
  children?: Channel[];
}

interface Article {
  id: string;
  title: string;
  channel_id: string;
  channel_name?: string;
  author?: string;
  status: string;
  is_top: number;
  is_recommend: number;
  view_count: number;
  publish_time?: string;
  created_at: string;
}

interface Comment {
  id: string;
  article_id: string;
  article_title?: string;
  user_name: string;
  content: string;
  status: string;
  created_at: string;
}

const { TabPane } = Tabs;

export default function CMSAdminPage() {
  const { can: _can } = usePermission();
  // 临时：确保所有操作按钮可见（后端API有权限校验兜底），后续稳定后可恢复 can() 控制
  const can = (point: string) => true;
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'channels';
  const validTabs = ['channels', 'articles', 'comments', 'banners', 'media', 'groups', 'config', 'sensitive'];
  const [activeTab, setActiveTab] = useState(validTabs.includes(tabFromUrl) ? tabFromUrl : 'channels');
  const [articleFilter, setArticleFilter] = useState('all'); // all | review | deleted
  const [channels, setChannels] = useState<Channel[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [contentGroups, setContentGroups] = useState<any[]>([]);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [channelForm] = Form.useForm();
  const [articleForm] = Form.useForm();
  const [allTags, setAllTags] = useState<string[]>([]);
  const [suggesting, setSuggesting] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copyArticle, setCopyArticle] = useState<Article | null>(null);
  const [copyChannel, setCopyChannel] = useState<string>('');
  const [batchReplaceOpen, setBatchReplaceOpen] = useState(false);
  const [batchField, setBatchField] = useState<string>('status');
  const [batchValue, setBatchValue] = useState<string>('published');
  const [batchSearch, setBatchSearch] = useState<string>('');
  const [batchReplacement, setBatchReplacement] = useState<string>('');
  const [dragChannelId, setDragChannelId] = useState<string>('');
  const [channelDragOver, setChannelDragOver] = useState<string>('');
  // 图片裁剪
  const [cropOpen, setCropOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<any>(null);
  const [cropRect, setCropRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [cropResult, setCropResult] = useState<string>('');
  const [cropping, setCropping] = useState(false);
  // 敏感词
  const [sensitiveWords, setSensitiveWords] = useState<any[]>([]);
  const [sensitiveBlockOn, setSensitiveBlockOn] = useState(false);
  const [sensitiveInput, setSensitiveInput] = useState('');
  // 文章附件
  const [articleAttachments, setArticleAttachments] = useState<any[]>([]);
  // 拼写检查
  const [spellOpen, setSpellOpen] = useState(false);
  const [spellHits, setSpellHits] = useState<any[]>([]);
  const [spelling, setSpelling] = useState(false);
  const cropImgRef = useRef<any>(null);
  const cropStartRef = useRef<any>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, articleFilter]);

  useEffect(() => {
    fetch('/api/cms-tags').then(r => r.json()).then((d: any[]) => setAllTags(Array.isArray(d) ? d.map(x => x.name) : [])).catch(() => setAllTags([]));
    if (activeTab === 'sensitive') {
      fetch('/api/sensitive-words').then(r => r.json()).then((d: any[]) => setSensitiveWords(Array.isArray(d) ? d : [])).catch(() => setSensitiveWords([]));
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'channels') {
        const res = await fetch('/api/cms-channels');
        const data = await res.json();
        setChannels(Array.isArray(data) ? data : []);
      } else if (activeTab === 'articles') {
        let url = '/api/cms-articles?pageSize=100';
        if (articleFilter === 'review') url += '&status=review';
        else if (articleFilter === 'deleted') url += '&status=deleted';
        const res = await fetch(url);
        const data = await res.json();
        setArticles(data.list || data || []);
      } else if (activeTab === 'banners') {
        const r = await fetch('/api/web-banners');
        setBanners(await r.json());
      } else if (activeTab === 'media') {
        const r = await fetch('/api/file-storage');
        setMediaItems(await r.json());
      } else if (activeTab === 'comments') {
        const res = await fetch('/api/cms-comments');
        const data = await res.json();
        setComments(Array.isArray(data) ? data : data.list || []);
      } else if (activeTab === 'groups') {
        const r = await fetch('/api/cms-content-groups');
        setContentGroups(await r.json());
        const ra = await fetch('/api/cms-articles?pageSize=500');
        const da = await ra.json();
        setAllArticles(da.list || da || []);
      }
    } catch (e) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChannel = () => {
    setEditingChannel(null);
    channelForm.resetFields();
    setChannelModalOpen(true);
  };

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel);
    channelForm.setFieldsValue(channel);
    setChannelModalOpen(true);
  };

  const handleSaveChannel = async () => {
    try {
      const values = await channelForm.validateFields();
      if (editingChannel) {
        await fetch(`/api/cms-channels/${editingChannel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        message.success('修改成功');
      } else {
        await fetch('/api/cms-channels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values)
        });
        message.success('添加成功');
      }
      setChannelModalOpen(false);
      loadData();
    } catch (e) {
      message.error('保存失败');
    }
  };

  const handleDeleteChannel = async (id: string) => {
    try {
      await fetch(`/api/cms-channels/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      loadData();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handleChannelDrop = async (targetId: string) => {
    if (!dragChannelId || dragChannelId === targetId) { setDragChannelId(''); setChannelDragOver(''); return; }
    const ordered = [...channels];
    const from = ordered.findIndex(c => c.id === dragChannelId);
    const to = ordered.findIndex(c => c.id === targetId);
    if (from < 0 || to < 0) { setDragChannelId(''); setChannelDragOver(''); return; }
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    try {
      await fetch('/api/cms-channels/reorder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ordered.map(c => c.id) })
      });
      message.success('已调整顺序');
      setChannels(ordered);
    } catch (e) { message.error('排序失败'); }
    setDragChannelId('');
    setChannelDragOver('');
  };

  // 图片裁剪
  const openCrop = (m: any) => {
    setCropTarget(m);
    setCropRect(null);
    setCropResult('');
    setCropOpen(true);
  };
  const cropMouseDown = (e: any) => {
    if (!cropImgRef.current) return;
    const rect = cropImgRef.current.getBoundingClientRect();
    cropStartRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setCropping(true);
    setCropRect({ x: cropStartRef.current.x, y: cropStartRef.current.y, w: 0, h: 0 });
  };
  const cropMouseMove = (e: any) => {
    if (!cropping || !cropStartRef.current || !cropImgRef.current) return;
    const rect = cropImgRef.current.getBoundingClientRect();
    const cx = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const cy = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
    const s = cropStartRef.current;
    setCropRect({ x: Math.min(s.x, cx), y: Math.min(s.y, cy), w: Math.abs(cx - s.x), h: Math.abs(cy - s.y) });
  };
  const cropMouseUp = () => { setCropping(false); };
  const handleCrop = async () => {
    if (!cropTarget || !cropRect || cropRect.w < 4 || cropRect.h < 4) { message.warning('请框选裁剪区域'); return; }
    const img = cropImgRef.current;
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    setCropLoading(true);
    try {
      const fd = new FormData();
      fd.append('source', cropTarget.file_path);
      fd.append('x', String(Math.round(cropRect.x * scaleX)));
      fd.append('y', String(Math.round(cropRect.y * scaleY)));
      fd.append('width', String(Math.round(cropRect.w * scaleX)));
      fd.append('height', String(Math.round(cropRect.h * scaleY)));
      const res = await fetch('/api/image/crop', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) { setCropResult(data.url); message.success('裁剪完成'); }
      else message.error('裁剪失败: ' + (data.error || ''));
    } catch (e) { message.error('裁剪失败'); }
    finally { setCropLoading(false); }
  };

  const handleAddArticle = () => {
    setEditingArticle(null);
    articleForm.resetFields();
    setArticleModalOpen(true);
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    let tagArr: string[] = [];
    try { tagArr = article.tags ? JSON.parse(article.tags as any) : (article.tags_list || []); } catch { tagArr = []; }
    articleForm.setFieldsValue({
      ...article,
      tags: Array.isArray(tagArr) ? tagArr : [],
      tags_list: article.tags_list || []
    });
    // 载入已有附件
    if (article.id) {
      fetch('/api/cms-articles/' + article.id + '/attachments').then(r => r.json()).then((d: any[]) => setArticleAttachments(Array.isArray(d) ? d : [])).catch(() => setArticleAttachments([]));
    } else {
      setArticleAttachments([]);
    }
    setArticleModalOpen(true);
  };

  const handleSuggestTags = async () => {
    const title = articleForm.getFieldValue('title') || '';
    const content = articleForm.getFieldValue('content') || '';
    if (!title && !content) {
      message.warning('请先填写标题或正文再智能提取');
      return;
    }
    setSuggesting(true);
    try {
      const res = await fetch('/api/cms-articles/suggest-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      const cur: string[] = articleForm.getFieldValue('tags') || [];
      const merged = Array.from(new Set([...cur, ...(data.suggestions || [])]));
      articleForm.setFieldsValue({ tags: merged });
      message.success(`已智能提取 ${data.suggestions?.length || 0} 个候选标签`);
    } catch (e) {
      message.error('智能提取失败');
    } finally {
      setSuggesting(false);
    }
  };

  const handleSpellCheck = async () => {
    const title = articleForm.getFieldValue('title') || '';
    const summary = articleForm.getFieldValue('summary') || '';
    const content = articleForm.getFieldValue('content') || '';
    if (!title && !summary && !content) {
      message.warning('请先填写标题、摘要或正文再检查');
      return;
    }
    setSpelling(true);
    try {
      const res = await fetch('/api/cms-articles/check-spell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary, content })
      });
      const data = await res.json();
      setSpellHits(Array.isArray(data.hits) ? data.hits : []);
      setSpellOpen(true);
    } catch (e) {
      message.error('拼写检查失败');
    } finally {
      setSpelling(false);
    }
  };

  const handleSaveArticle = async () => {    try {
      const values = await articleForm.validateFields();
      const method = editingArticle ? 'PUT' : 'POST';
      const url = editingArticle ? `/api/cms-articles/${editingArticle.id}` : '/api/cms-articles';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      message.success(editingArticle ? '修改成功' : '添加成功');
      setArticleModalOpen(false);
      loadData();
    } catch (e) {
      message.error('保存失败');
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      await fetch(`/api/cms-articles/${id}`, { method: 'DELETE' });
      message.success('删除成功');
      loadData();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const handleMoveArticle = async (article: Article) => {
    const chId = prompt('移动到栏目ID:');
    if (chId) {
      await fetch('/api/cms-articles-batch', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids: [article.id], action: 'move', channel_id: chId }) });
      loadData(); message.success('已移动');
    }
  };

  const handleCopyArticle = (article: Article) => {
    setCopyArticle(article);
    setCopyChannel(article.channel_id || '');
    setCopyModalOpen(true);
  };

  const handleCopyOk = async () => {
    if (!copyArticle) return;
    try {
      await fetch(`/api/cms-articles/${copyArticle.id}/copy`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel_id: copyChannel })
      });
      message.success('已跨栏目复制为草稿');
      setCopyModalOpen(false);
      loadData();
    } catch (e) { message.error('复制失败'); }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) { message.warning('请先勾选文章'); return; }
    try {
      for (const id of selectedRowKeys) { await fetch(`/api/cms-articles/${id}`, { method: 'DELETE' }); }
      message.success(`已删除 ${selectedRowKeys.length} 篇`);
      setSelectedRowKeys([]);
      loadData();
    } catch (e) { message.error('批量删除失败'); }
  };

  const handleBatchReplace = async () => {
    if (selectedRowKeys.length === 0) { message.warning('请先勾选文章'); return; }
    if (!batchField && !batchSearch) { message.warning('请选择替换字段或填写查找文本'); return; }
    try {
      const res = await fetch('/api/cms-articles/batch-replace', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedRowKeys,
          field: batchField || undefined,
          value: batchField ? batchValue : undefined,
          search: batchSearch || undefined,
          replacement: batchReplacement
        })
      });
      const data = await res.json();
      message.success(`已更新 ${data.done} 篇`);
      setBatchReplaceOpen(false);
      setSelectedRowKeys([]);
      loadData();
    } catch (e) { message.error('批量替换失败'); }
  };

  const handleExportSelected = () => {
    const rows = articles.filter(a => selectedRowKeys.includes(a.id));
    const data = rows.length > 0 ? rows : articles;
    const blob = new Blob([JSON.stringify({ count: data.length, articles: data }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'cms-articles-export.json'; a.click();
    URL.revokeObjectURL(url);
    message.success(`已导出 ${data.length} 篇`);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const articlesArr = Array.isArray(parsed) ? parsed : parsed.articles;
      const res = await fetch('/api/cms-import', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles: articlesArr })
      });
      const data = await res.json();
      message.success(`已导入 ${data.imported} 篇`);
      loadData();
    } catch (err) { message.error('导入失败：文件格式错误'); }
    e.target.value = '';
  };

  const handleAuditComment = async (comment: Comment, status: string) => {
    try {
      await fetch(`/api/cms-comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      message.success('审核成功');
      loadData();
    } catch (e) {
      message.error('操作失败');
    }
  };

  const channelColumns = [
    { title: '栏目名称', dataIndex: 'name', key: 'name' },
    { title: '编码', dataIndex: 'code', key: 'code' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v: string) => <Tag>{v || 'article'}</Tag> },
    { title: '图片', dataIndex: 'image_url', key: 'image_url', width: 70, render: (v: string) => v ? <img src={v} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 4 }} /> : <span style={{ color: '#bbb' }}>—</span> },
    { title: '模板', key: 'tpl', render: (_: any, r: Channel) => <span style={{ fontSize: 12 }}>{r.template_list || '默认'}{r.template_detail ? ` / ${r.template_detail}` : ''}</span> },
    {
      title: '排序',
      key: 'sort_op',
      width: 90,
      render: (_: any, record: Channel) => (
        <Space size={2}>
          <Button size="small" type="text" onClick={async()=>{const prev=channels.find(c=>c.sort_order===record.sort_order-1);if(prev){await fetch('/api/cms-channels/'+record.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({sort_order:record.sort_order-1})});await fetch('/api/cms-channels/'+prev.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({sort_order:record.sort_order})});loadData();}}}>↑</Button>
          <Button size="small" type="text" onClick={async()=>{const next=channels.find(c=>c.sort_order===record.sort_order+1);if(next){await fetch('/api/cms-channels/'+record.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({sort_order:record.sort_order+1})});await fetch('/api/cms-channels/'+next.id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({sort_order:record.sort_order})});loadData();}}}>↓</Button>
          <span style={{fontSize:11,marginLeft:4}}>{record.sort_order}</span>
        </Space>
      )
    },
    { title: '显示', dataIndex: 'is_show', key: 'is_show', render: (v: number) => <Switch checked={v === 1} disabled /> },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Channel) => (
        <Space>
          {can('cms:channel:manage') && <Button size="small" type="link" icon={<Edit size={14} />} onClick={() => handleEditChannel(record)}>{t('编辑')}</Button>}
          {can('cms:channel:manage') && (
            <Popconfirm title="确认删除？" onConfirm={() => handleDeleteChannel(record.id)}>
              <Button size="small" type="link" danger icon={<Delete size={14} />}>{t('删除')}</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  const articleColumns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '栏目', dataIndex: 'channel_name', key: 'channel_name', render: (v: string) => v || '-' },
    { title: '作者', dataIndex: 'author', key: 'author' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => (
      <Tag color={v === 'published' ? 'green' : v === 'draft' ? 'orange' : 'default'}>{v}</Tag>
    )},
    { title: '浏览', dataIndex: 'view_count', key: 'view_count' },
    {
      title: '属性',
      key: 'tags',
      render: (_: any, record: Article) => (
        <Space>
          {record.is_top === 1 && <Tag color="red">置顶</Tag>}
          {record.is_recommend === 1 && <Tag color="gold">推荐</Tag>}
          {record.is_hot === 1 && <Tag color="volcano">热点</Tag>}
          {record.is_bold === 1 && <Tag color="purple">醒目</Tag>}
        </Space>
      )
    },
    { title: '发布时间', dataIndex: 'publish_time', key: 'publish_time', render: (v: string) => v ? new Date(v).toLocaleDateString() : '-' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Article) => (
        <Space>
          {record.status === 'review' && (
            <>
              <Button size="small" type="link" style={{color:'#52c41a'}}
                onClick={async()=>{await fetch(`/api/cms-articles/${record.id}/review`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'approve'})});loadData();message.success('已发布')}}>
                通过</Button>
              <Button size="small" type="link" danger
                onClick={async()=>{const reason=prompt('拒绝原因(可选):');await fetch(`/api/cms-articles/${record.id}/review`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'reject',reason:reason||''})});loadData();message.warning('已驳回')}}>
                驳回</Button>
            </>
          )}
          {record.status === 'deleted' ? (
            <Button size="small" type="link" style={{color:'#1677ff'}}
              onClick={async()=>{await fetch(`/api/cms-articles/${record.id}/restore`,{method:'PUT'});loadData();message.success('已恢复')}}>
              恢复</Button>
          ) : (
            <>
              {can('cms:article:edit') && <Button size="small" type="link" icon={<Edit size={14} />} onClick={() => handleEditArticle(record)}>{t('编辑')}</Button>}
              {can('cms:article:edit') && <Button size="small" type="link" onClick={() => handleMoveArticle(record)}>{t('移动')}</Button>}
              {can('cms:article:create') && <Button size="small" type="link" onClick={() => handleCopyArticle(record)}>{t('复制')}</Button>}
              {can('cms:article:delete') && (
                <Popconfirm title="确认删除？" onConfirm={() => handleDeleteArticle(record.id)}>
                  <Button size="small" type="link" danger icon={<Delete size={14} />}>{t('删除')}</Button>
                </Popconfirm>
              )}
            </>
          )}
        </Space>
      )
    }
  ];

  const commentColumns = [
    { title: '文章', dataIndex: 'article_title', key: 'article_title', ellipsis: true, render: (v: string) => v || '-' },
    { title: '评论者', dataIndex: 'user_name', key: 'user_name' },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => (
      <Tag color={v === 'approved' ? 'green' : v === 'pending' ? 'orange' : 'rejected'}>{v}</Tag>
    )},
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: (v: string) => new Date(v).toLocaleString() },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Comment) => (
        <Space>
          {record.status === 'pending' && can('cms:comment:moderate') && (
            <>
              <Button size="small" type="link" onClick={() => handleAuditComment(record, 'approved')}>{t('通过')}</Button>
              <Button size="small" type="link" danger onClick={() => handleAuditComment(record, 'rejected')}>{t('拒绝')}</Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="cms-admin">
      <Tabs activeKey={activeTab} onChange={(key) => { setActiveTab(key); setSearchParams(key === 'channels' ? {} : { tab: key }); }}>
        <TabPane tab={<span><FolderOpen size={14} /> {t('栏目管理')}</span>} key="channels">
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space>
              {can('cms:channel:manage') && <Button type="primary" icon={<Plus size={14} />} onClick={handleAddChannel}>添加栏目</Button>}
            </Space>
            <span style={{ color: '#999', fontSize: 12 }}>共 {channels.length} 个栏目 · 拖拽行可排序</span>
          </div>
          <Table
            dataSource={channels} columns={channelColumns} rowKey="id" loading={loading} pagination={false}
            rowClassName={(r: any) => channelDragOver === r.id ? 'drag-over-row' : ''}
            onRow={(record: any) => ({
              draggable: true,
              onDragStart: () => setDragChannelId(record.id),
              onDragOver: (e) => { e.preventDefault(); setChannelDragOver(record.id); },
              onDrop: () => handleChannelDrop(record.id),
              onDragEnd: () => { setDragChannelId(''); setChannelDragOver(''); }
            })}
            locale={{ emptyText: <Empty description="暂无栏目">{can('cms:channel:manage') && <Button type="primary" icon={<Plus size={14} />} onClick={handleAddChannel}>添加第一个栏目</Button>}</Empty> }}
          />
        </TabPane>

        <TabPane tab={<span><FileText size={14} /> {t('文章管理')}</span>} key="articles">
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={12}>
              {can('cms:article:create') && <Button type="primary" icon={<Plus size={14} />} onClick={handleAddArticle}>{t('添加文章')}</Button>}
              {can('cms:article:edit') && <Button size="small" style={{ marginLeft: 8 }} icon={<Edit size={14} />} disabled={selectedRowKeys.length === 0} onClick={() => setBatchReplaceOpen(true)}>{t('批量替换')}</Button>}
              {can('cms:article:delete') && <Button size="small" style={{ marginLeft: 4 }} danger disabled={selectedRowKeys.length === 0} onClick={handleBatchDelete}>{t('批量删除')}</Button>}
              <Button size="small" style={{ marginLeft: 4 }} onClick={handleExportSelected}>{t('导出')}{selectedRowKeys.length > 0 ? `选中(${selectedRowKeys.length})` : t('全部')}</Button>
              {can('cms:article:create') && <Button size="small" style={{ marginLeft: 4 }} onClick={() => (document.getElementById('cms-import-input') as HTMLInputElement)?.click()}>{t('导入')}</Button>}
              <input id="cms-import-input" type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
              {can('cms:article:create') && <Button size="small" style={{ marginLeft: 4 }} icon={<FileText size={14} />} onClick={() => (document.getElementById('cms-word-input') as HTMLInputElement)?.click()}>{t('Word导入')}</Button>}
              <input id="cms-word-input" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{ display: 'none' }} onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fm = new FormData(); fm.append('file', file);
                const r = await fetch('/api/cms-articles/import-word', { method: 'POST', body: fm });
                const d = await r.json();
                if (d.success) { message.success('Word 已导入为草稿，可编辑后发布'); const art = await (await fetch('/api/cms-articles/' + d.id)).json(); handleEditArticle(art); }
                else message.error(d.error || '导入失败');
                e.target.value = '';
              }} />
            </Col>
            <Col span={12} style={{ textAlign: 'right' }}>
              <Button size="small" type="link" href="/api/cms-export" target="_blank">导出JSON(全部)</Button>
              <Button size="small" type={articleFilter==='all'?'primary':'default'} onClick={()=>setArticleFilter('all')}>全部</Button>
              <Button size="small" type={articleFilter==='review'?'primary':'default'} onClick={()=>setArticleFilter('review')} style={{marginLeft:4}}>待审核</Button>
              <Button size="small" type={articleFilter==='deleted'?'primary':'default'} onClick={()=>setArticleFilter('deleted')} style={{marginLeft:4}}>回收站</Button>
            </Col>
          </Row>
          {!loading && articles.length === 0 ? (
            <Empty description={articleFilter === 'all' ? '暂无文章，点击下方按钮开始创作' : (articleFilter === 'review' ? '暂无待审核文章' : '回收站为空')} style={{ marginTop: 40 }}>
              {articleFilter === 'all' && can('cms:article:create') && (
                <Space>
                  <Button type="primary" icon={<Plus size={14} />} onClick={handleAddArticle}>写第一篇文章</Button>
                  <Button icon={<FileText size={14} />} onClick={() => (document.getElementById('cms-word-input') as HTMLInputElement)?.click()}>从Word导入</Button>
                </Space>
              )}
            </Empty>
          ) : (
            <Table
              dataSource={articles} columns={articleColumns} rowKey="id" loading={loading}
              rowSelection={{ selectedRowKeys, onChange: (keys: any) => setSelectedRowKeys(keys as string[]) }}
              pagination={{ pageSize: 10 }}
            />
          )}
        </TabPane>

        <TabPane tab={<span><MessageSquare size={14} /> {t('评论管理')}</span>} key="comments">
          <Table dataSource={comments} columns={commentColumns} rowKey="id" loading={loading} />
        </TabPane>

                <TabPane tab={<span>🖼️ Banner管理</span>} key="banners">
          <div style={{marginBottom:12}}><Button type="primary" icon={<Plus size={14}/>} onClick={() => {}}>新增Banner</Button></div>
          <Table dataSource={banners} rowKey="id" size="small"
            columns={[
              {title:'标题',dataIndex:'title'},
              {title:'图片',dataIndex:'image_url',render:(v:any)=><img src={v} style={{height:40,borderRadius:4}} alt=""/>},
              {title:'链接',dataIndex:'link_url',render:(v:any)=><a href={v} target="_blank">{v}</a>},
              {title:'状态',dataIndex:'is_show',width:80,render:(v:any)=><Tag color={v?'green':'default'}>{v?'显示':'隐藏'}</Tag>},
              {title:'排序',dataIndex:'sort_order',width:80},
            ]} />
        </TabPane>
        <TabPane tab={<span>🖼️ {t('素材库')}</span>} key="media">
          <div style={{marginBottom:12,display:'flex',gap:8,alignItems:'center'}}>
            <Select size="small" style={{width:100}} defaultValue="all"
              onChange={(v) => { /* filter by mime_type */ }}>
              <Select.Option value="all">全部</Select.Option>
              <Select.Option value="image">图片</Select.Option>
              <Select.Option value="video">视频</Select.Option>
              <Select.Option value="file">文件</Select.Option>
            </Select>
            <Input size="small" style={{width:120}} placeholder="分组名称" id="media-group-name" />
            <Upload accept="image/*" showUploadList={false}
              customRequest={async ({file}:any)=>{
                setMediaUploading(true);
                const group = (document.getElementById('media-group-name') as HTMLInputElement)?.value || '';
                const fm=new FormData();fm.append('file',file);
                const r=await fetch('/api/upload',{method:'POST',body:fm});
                const d=await r.json();
                if(d.success) {
                  await fetch('/api/file-storage',{method:'POST',headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({file_name:file.name,file_path:d.url,file_size:file.size,mime_type:file.type,entity_type:group||'default'})});
                  message.success('上传成功');loadData();
                }
                setMediaUploading(false);
              }}>
              <Button type="primary" icon={<Plus size={14}/>} loading={mediaUploading} size="small">上传</Button>
            </Upload>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:8}}>
            {mediaItems.map((m:any)=>(
              <div key={m.id} style={{border:'1px solid #eee',borderRadius:6,padding:6,textAlign:'center',background:'#fff'}}>
                {m.mime_type?.startsWith('image') ? <img src={m.file_path} style={{width:'100%',height:100,objectFit:'cover',borderRadius:4,marginBottom:4}} alt=""/> :
                <div style={{height:100,display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f5',borderRadius:4,fontSize:24,color:'#bbb',marginBottom:4}}>📄</div>}
                <div style={{fontSize:11,color:'#666',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={m.file_name}>{m.file_name}</div>
                <div style={{fontSize:10,color:'#999',marginTop:2}}>{m.entity_type||'未分组'}</div>
                <Space size={0} style={{marginTop:4}}>
                  <Button size="small" type="link" style={{fontSize:11,padding:0}} onClick={()=>{navigator.clipboard.writeText(m.file_path);message.success('已复制URL');}}>复制</Button>
                  {m.mime_type?.startsWith('image') && <Button size="small" type="link" style={{fontSize:11,padding:0,marginLeft:8}} onClick={()=>openCrop(m)}>裁剪</Button>}
                  <Button size="small" type="link" danger style={{fontSize:11,padding:0,marginLeft:8}}
                    onClick={async()=>{await fetch('/api/file-storage/'+m.id,{method:'DELETE'});loadData();}}>删除</Button>
                </Space>
              </div>
            ))}
          </div>
        </TabPane>
        <TabPane tab={<span><FolderOpen size={14} /> {t('内容分组')}</span>} key="groups">
          <div style={{marginBottom:12}}><Button type="primary" icon={<Plus size={14}/>} onClick={()=>{
            const name=prompt('分组名称:');
            if(!name)return;
            const type=prompt('分组类型(topic/column/subject):','topic')||'topic';
            const desc=prompt('分组描述:','')||'';
            fetch('/api/cms-content-groups',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,type,description:desc})}).then(()=>{message.success('创建成功');loadData();});
          }}>新增分组</Button></div>
          <Table dataSource={contentGroups} rowKey="id" size="small"
            columns={[
              {title:'名称',dataIndex:'name'},
              {title:'类型',dataIndex:'type',width:90,render:(v:any)=><Tag>{v}</Tag>},
              {title:'文章数',dataIndex:'article_count',width:80},
              {title:'描述',dataIndex:'description',ellipsis:true},
              {title:'操作',width:240,render:(_:any,r:any)=><Space>
                <Button size="small" onClick={async()=>{
                  const aid=prompt('添加文章ID (当前: '+(r.article_ids?JSON.parse(r.article_ids).join(','):'无')+'):');
                  if(aid){await fetch('/api/cms-content-groups/'+r.id+'/articles',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({article_id:aid})});message.success('已添加');loadData();}
                }}>加文章</Button>
                <Button size="small" onClick={async()=>{
                  const aid=prompt('移除文章ID:');
                  if(aid){await fetch('/api/cms-content-groups/'+r.id+'/articles/'+aid,{method:'DELETE'});message.success('已移除');loadData();}
                }}>减文章</Button>
                <Popconfirm title="删除?" onConfirm={async()=>{await fetch('/api/cms-content-groups/'+r.id,{method:'DELETE'});loadData();}}>
                  <Button size="small" danger icon={<Delete size={14}/>}/>
                </Popconfirm>
              </Space>}
            ]} />
          <div style={{marginTop:12,fontSize:12,color:'#999'}}>
            可选文章ID（部分）：{allArticles.slice(0,12).map((a:any)=>a.id+'='+a.title).join('、')}
          </div>
        </TabPane>

        <TabPane tab={<span><Settings size={14} /> 网站配置</span>} key="config">
          <Card title="网站基本设置">
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="网站名称">
                    <Input defaultValue="飞达信息管理系统" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="网站Logo">
                    <Input addonAfter={<Button size="small">上传</Button>} defaultValue="/logo.png" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="网站描述">
                    <TextArea rows={3} defaultValue="飞达信息管理系统官方平台" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item label="版权信息">
                    <Input defaultValue="© 2024 飞达信息管理系统" />
                  </Form.Item>
                </Col>
              </Row>
              <Button type="primary">保存设置</Button>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab={<span>🚫 {t('敏感词')}</span>} key="sensitive">
          <Card title="敏感词过滤">
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Switch checked={sensitiveBlockOn} onChange={async (v) => { await fetch('/api/sensitive-words/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ block: v }) }); setSensitiveBlockOn(v); message.success(v ? '已开启命中拦截' : '已关闭命中拦截'); }} />
              <span>开启后：文章保存/发布命中敏感词将被拦截（默认仅标记）</span>
            </div>
            <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
              <Input placeholder="新增敏感词" value={sensitiveInput} onChange={(e) => setSensitiveInput(e.target.value)} onPressEnter={async () => { const w = sensitiveInput.trim(); if (!w) return; const r = await fetch('/api/sensitive-words', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word: w }) }); const d = await r.json(); if (d.success) { setSensitiveInput(''); const sw = await (await fetch('/api/sensitive-words')).json(); setSensitiveWords(Array.isArray(sw) ? sw : []); message.success('已添加'); } else message.error(d.error || '添加失败'); }} />
              <Button type="primary" onClick={async () => { const w = sensitiveInput.trim(); if (!w) return; const r = await fetch('/api/sensitive-words', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ word: w }) }); const d = await r.json(); if (d.success) { setSensitiveInput(''); const sw = await (await fetch('/api/sensitive-words')).json(); setSensitiveWords(Array.isArray(sw) ? sw : []); message.success('已添加'); } else message.error(d.error || '添加失败'); }}>添加</Button>
            </div>
            <Table dataSource={sensitiveWords} rowKey="id" size="small" pagination={false}
              columns={[
                { title: '敏感词', dataIndex: 'word', render: (v: string) => <Tag color="red">{v}</Tag> },
                { title: '级别', dataIndex: 'level', width: 80, render: (v: any) => v || 1 },
                { title: '操作', width: 100, render: (_: any, r: any) => <Button size="small" danger type="link" onClick={async () => { await fetch('/api/sensitive-words/' + r.id, { method: 'DELETE' }); setSensitiveWords(sensitiveWords.filter((x: any) => x.id !== r.id)); }}>删除</Button> },
              ]} />
          </Card>
        </TabPane>
      </Tabs>

      {/* 栏目弹窗 */}
      <Modal
        title={editingChannel ? '编辑栏目' : '添加栏目'}
        open={channelModalOpen}
        onOk={handleSaveChannel}
        onCancel={() => setChannelModalOpen(false)}
      >
        <Form form={channelForm} layout="vertical">
          <Form.Item name="name" label="栏目名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="栏目编码">
            <Input />
          </Form.Item>
          <Form.Item name="parent_id" label="上级栏目">
            <Select allowClear placeholder="顶级栏目">
              {channels.map(c => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="type" label="内容类型">
            <Select>
              <Select.Option value="article">文章</Select.Option>
              <Select.Option value="page">单页</Select.Option>
              <Select.Option value="link">链接</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="image_url" label="栏目图片URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="template_list" label="列表模板">
            <Select placeholder="默认" allowClear>
              <Select.Option value="default">默认列表</Select.Option>
              <Select.Option value="card">卡片</Select.Option>
              <Select.Option value="grid">网格</Select.Option>
              <Select.Option value="waterfall">瀑布流</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="template_detail" label="详情模板">
            <Select placeholder="默认" allowClear>
              <Select.Option value="default">默认详情</Select.Option>
              <Select.Option value="full">通栏大图</Select.Option>
              <Select.Option value="split">左右分栏</Select.Option>
              <Select.Option value="magazine">杂志风</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="栏目描述">
            <Input.TextArea rows={3} placeholder="栏目简介..." />
          </Form.Item>
          <Form.Item name="link_url" label="外链地址（type=链接时有效）">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <InputNumber min={0} defaultValue={0} />
          </Form.Item>
          <Form.Item name="is_show" label="显示" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </Form>
      </Modal>

      {/* 文章弹窗 */}
      <Modal
        title={editingArticle ? '编辑文章' : '添加文章'}
        open={articleModalOpen}
        onOk={handleSaveArticle}
        onCancel={() => setArticleModalOpen(false)}
        width={800}
      >
        <Form form={articleForm} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="channel_id" label="栏目">
                <Select>
                  {channels.map(c => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="secondary_channels" label="副栏目">
                <Select mode="multiple" allowClear placeholder="可选多个栏目">
                  {channels.map(c => (
                    <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="author" label="作者">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select>
                  <Select.Option value="draft">草稿</Select.Option>
                  <Select.Option value="published">已发布</Select.Option>
                  <Select.Option value="archived">归档</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="publish_time" label="发布时间">
                <Input type="datetime-local" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="is_top" label="置顶" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="is_recommend" label="推荐" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="is_hot" label="热点" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="is_bold" label="醒目" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="status" label="发布状态" initialValue="draft">
            <Select options={[{label:'草稿',value:'draft'},{label:'审核中',value:'review'},{label:'已发布',value:'published'},{label:'已下线',value:'offline'},{label:'定时发布',value:'scheduled'}]} />
          </Form.Item>
          <Form.Item name="publish_time" label="定时发布时间">
            <Input placeholder="2026-07-10 08:00" />
          </Form.Item>
          <Form.Item name="tags" label={<span>标签（可输入新建 / 多选）{' '}
            <Button size="small" type="link" loading={suggesting} onClick={handleSuggestTags}
              icon={<Sparkles size={13} />} style={{ paddingLeft: 4 }} disabled={suggesting}>
              智能提取
            </Button></span>}>
            <Select mode="tags" placeholder="选择或输入标签，回车确认" tokenSeparators={[',']}
              options={allTags.map((t: string) => ({ label: t, value: t }))} />
          </Form.Item>
          <Form.Item name="custom_fields" label="自定义字段（JSON格式）">
            <Input.TextArea rows={3} placeholder='{"field1":"值1","field2":"值2"}' />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <TextArea rows={2} />
          </Form.Item>
          <Form.Item name="content" label={<span>正文{' '}
            <Button size="small" type="link" loading={spelling} onClick={handleSpellCheck}
              icon={<SpellCheck size={13} />} style={{ paddingLeft: 4 }} disabled={spelling}>
              拼写检查
            </Button></span>} rules={[{ required: true }]}>
            <RichTextEditor placeholder="输入文章正文..." height={500} />
          </Form.Item>
          <Form.Item label="附件">
            {editingArticle?.id ? (
              <div>
                <Upload accept="*" showUploadList={false} beforeUpload={async (file: any) => {
                  const fm = new FormData(); fm.append('file', file);
                  const r = await fetch('/api/cms-articles/' + editingArticle!.id + '/attachments', { method: 'POST', body: fm });
                  const d = await r.json();
                  if (d.success) { setArticleAttachments([...articleAttachments, d.attachment]); message.success('上传成功'); }
                  else message.error('上传失败');
                  return false;
                }}>
                  <Button size="small" icon={<UploadIcon size={14} />}>上传附件</Button>
                </Upload>
                <div style={{ marginTop: 8 }}>
                  {articleAttachments.length === 0 && <span style={{ color: '#999', fontSize: 12 }}>暂无附件</span>}
                  {articleAttachments.map((a: any) => (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}>
                      <a href={a.file_path} target="_blank" rel="noreferrer" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.file_name}</a>
                      <Button size="small" type="link" danger onClick={async () => { await fetch('/api/cms-article-attachments/' + a.id, { method: 'DELETE' }); setArticleAttachments(articleAttachments.filter((x: any) => x.id !== a.id)); }}>删除</Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : <span style={{ color: '#999', fontSize: 12 }}>保存文章后可上传附件</span>}
          </Form.Item>
        </Form>
      </Modal>

      {/* 跨栏目复制弹窗 */}
      <Modal
        title="跨栏目复制"
        open={copyModalOpen}
        onOk={handleCopyOk}
        onCancel={() => setCopyModalOpen(false)}
        okText="复制为草稿"
      >
        <p>将文章《{copyArticle?.title}》复制为草稿到目标栏目：</p>
        <Select style={{ width: '100%' }} placeholder="选择目标栏目" value={copyChannel} onChange={setCopyChannel}>
          {channels.map(c => (
            <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
          ))}
        </Select>
      </Modal>

      {/* 批量替换弹窗 */}
      <Modal
        title={`批量替换（已选 ${selectedRowKeys.length} 篇）`}
        open={batchReplaceOpen}
        onOk={handleBatchReplace}
        onCancel={() => setBatchReplaceOpen(false)}
        okText="应用"
      >
        <Form layout="vertical">
          <Form.Item label="替换字段（留空则仅做文本查找替换）">
            <Select value={batchField} onChange={setBatchField}>
              <Select.Option value="">不替换字段（仅文本替换）</Select.Option>
              <Select.Option value="status">发布状态</Select.Option>
              <Select.Option value="channel_id">所属栏目</Select.Option>
              <Select.Option value="is_top">置顶</Select.Option>
              <Select.Option value="is_hot">热点</Select.Option>
              <Select.Option value="is_recommend">推荐</Select.Option>
            </Select>
          </Form.Item>
          {batchField === 'status' && (
            <Form.Item label="目标状态">
              <Select value={batchValue} onChange={setBatchValue}>
                <Select.Option value="draft">草稿</Select.Option>
                <Select.Option value="published">已发布</Select.Option>
                <Select.Option value="review">审核中</Select.Option>
                <Select.Option value="offline">已下线</Select.Option>
              </Select>
            </Form.Item>
          )}
          {batchField === 'channel_id' && (
            <Form.Item label="目标栏目">
              <Select value={batchValue} onChange={setBatchValue}>
                {channels.map(c => (
                  <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          {(batchField === 'is_top' || batchField === 'is_hot' || batchField === 'is_recommend') && (
            <Form.Item label="是否开启">
              <Select value={batchValue} onChange={setBatchValue}>
                <Select.Option value="1">开启</Select.Option>
                <Select.Option value="0">关闭</Select.Option>
              </Select>
            </Form.Item>
          )}
          <Divider>文本查找替换（应用于 标题/摘要/正文）</Divider>
          <Form.Item label="查找">
            <Input value={batchSearch} onChange={e => setBatchSearch(e.target.value)} placeholder="要替换的文本" />
          </Form.Item>
          <Form.Item label="替换为">
            <Input value={batchReplacement} onChange={e => setBatchReplacement(e.target.value)} placeholder="替换后的文本（可空=删除）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 图片裁剪 */}
      <Modal
        title="图片裁剪"
        open={cropOpen}
        onCancel={() => setCropOpen(false)}
        onOk={handleCrop}
        okText="裁剪"
        confirmLoading={cropLoading}
        width={680}
      >
        {cropTarget && (
          <div>
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', userSelect: 'none', lineHeight: 0, border: '1px solid #eee' }}>
              <img
                ref={cropImgRef}
                src={cropTarget.file_path}
                alt=""
                style={{ maxWidth: '100%', maxHeight: 440, display: 'block', cursor: 'crosshair' }}
                onMouseDown={cropMouseDown}
                onMouseMove={cropMouseMove}
                onMouseUp={cropMouseUp}
                onMouseLeave={cropMouseUp}
              />
              {cropRect && cropRect.w > 0 && cropRect.h > 0 && (
                <div style={{
                  position: 'absolute', left: cropRect.x, top: cropRect.y, width: cropRect.w, height: cropRect.h,
                  border: '1px dashed #1677ff', background: 'rgba(22,119,255,0.15)', pointerEvents: 'none'
                }} />
              )}
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>在图片上按住鼠标拖拽框选裁剪区域，松开后点击「裁剪」。</div>
            {cropResult && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>裁剪结果：</div>
                <img src={cropResult} alt="" style={{ maxWidth: 240, border: '1px solid #eee', borderRadius: 4 }} />
                <div style={{ marginTop: 4 }}>
                  <Button size="small" type="link" onClick={() => { navigator.clipboard.writeText(cropResult); message.success('已复制裁剪图URL'); }}>复制URL</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        title="拼写检查结果"
        open={spellOpen}
        onCancel={() => setSpellOpen(false)}
        footer={<Button onClick={() => setSpellOpen(false)}>关闭</Button>}
        width={640}
      >
        {spellHits.length === 0 ? (
          <p style={{ color: '#52c41a' }}>未检测到明显的拼写问题 ✅</p>
        ) : (
          <div>
            <p style={{ color: '#fa8c16' }}>共发现 {spellHits.length} 处疑似拼写问题，请核对（非阻断，可忽略）：</p>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {spellHits.map((h: any, i: number) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <div>
                    <Tag color={h.type === 'cn' ? 'blue' : 'orange'}>{h.type === 'cn' ? '中文' : '英文'}</Tag>
                    <b style={{ color: '#cf1322' }}>{h.word}</b>
                    {h.suggestion ? <span> → 建议：<b style={{ color: '#389e0d' }}>{h.suggestion}</b></span> : <span>（词典未收录，请自行核对）</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>上下文：…{h.context}…</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}