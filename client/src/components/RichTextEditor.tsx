import React, { useCallback, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import Youtube from '@tiptap/extension-youtube';
import { Node, mergeAttributes } from '@tiptap/core';
import { Button, Space, Tooltip, Upload, message, Modal, Input } from 'antd';
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Quote, Code,
  Image as ImageIcon, Link as LinkIcon, Video,
  Undo2, Redo2, Heading1, Heading2, Heading3,
  Highlighter, Palette, Minus,
  Upload as UploadIcon, Table, Columns, Rows, Trash2, FileCode, FileText,
} from 'lucide-react';

// 自定义视频节点：支持 mp4/webm 等通用视频 URL 的插入与源码往返
const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      controls: { default: true },
    };
  },
  parseHTML() {
    return [{ tag: 'video' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: 'controls', style: 'max-width:100%;border-radius:4px;margin:8px 0;' })];
  },
});

interface RichTextEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  height?: number;
}

export default function RichTextEditor({ value, onChange, placeholder = '输入内容...', height = 400 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: true, inline: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder }),
      // 表格套件：表格 + 行/列/表头/单元格编辑
      TableKit.configure({ table: { resizable: false } }),
      // YouTube 视频嵌入
      Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: 'embed-youtube' } }),
      // 通用视频节点（mp4/webm）
      VideoNode,
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  const addImage = useCallback(() => {
    const url = window.prompt('输入图片URL:');
    if (url) editor?.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const addVideo = useCallback(() => {
    const url = window.prompt('输入视频URL (mp4/webm):');
    if (url) editor?.chain().focus().insertContent({ type: 'video', attrs: { src: url } }).run();
  }, [editor]);

  const addYoutube = useCallback(() => {
    const url = window.prompt('输入YouTube视频URL:');
    if (url) editor?.chain().focus().setYoutubeVideo({ src: url }).run();
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt('输入链接URL:');
    if (url) editor?.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  const insertTable = useCallback(() => {
    editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const addColumn = useCallback(() => {
    editor?.chain().focus().addColumnAfter().run();
  }, [editor]);

  const addRow = useCallback(() => {
    editor?.chain().focus().addRowAfter().run();
  }, [editor]);

  const deleteTable = useCallback(() => {
    editor?.chain().focus().deleteTable().run();
  }, [editor]);

  const setColor = useCallback(() => {
    const color = window.prompt('颜色代码 (#f5222d):', '#f5222d');
    if (color) editor?.chain().focus().setColor(color).run();
  }, [editor]);

  const handleUpload = useCallback(async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (data.success) {
      editor?.chain().focus().setImage({ src: data.url }).run();
      message.success('图片已上传');
    } else {
      message.error('上传失败');
    }
    return false;
  }, [editor]);

  // 源码 / HTML 编辑
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceHtml, setSourceHtml] = useState('');
  const openSource = useCallback(() => {
    if (!editor) return;
    setSourceHtml(editor.getHTML());
    setSourceOpen(true);
  }, [editor]);
  const applySource = useCallback(() => {
    editor?.commands.setContent(sourceHtml);
    setSourceOpen(false);
  }, [editor, sourceHtml]);

  // 插入站内文章链接
  const [articleLinkOpen, setArticleLinkOpen] = useState(false);
  const [articleKeyword, setArticleKeyword] = useState('');
  const [articleResults, setArticleResults] = useState<{ id: string; title: string }[]>([]);
  const [articleLoading, setArticleLoading] = useState(false);
  const openArticleLink = useCallback(async () => {
    setArticleLinkOpen(true);
    setArticleLoading(true);
    try {
      const res = await fetch('/api/cms-articles?pageSize=50&keyword=' + encodeURIComponent(articleKeyword));
      const data = await res.json();
      const list = (data.list || []).filter((a: any) => (a.status || '') !== 'deleted');
      setArticleResults(list.map((a: any) => ({ id: a.id, title: a.title })));
    } catch { setArticleResults([]); }
    finally { setArticleLoading(false); }
  }, [articleKeyword]);
  const insertArticleLink = useCallback((id: string, title: string) => {
    const href = '/site/articles/' + id;
    editor?.chain().focus().insertContent(`<a href="${href}">${title}</a>`).run();
    setArticleLinkOpen(false);
  }, [editor]);

  if (!editor) return null;

  const btn = (icon: React.ReactNode, action: () => unknown, active: boolean | object, title: string) => (
    <Tooltip title={title}>
      <Button size="small" type={typeof active === 'boolean' ? (active ? 'primary' : 'text') : (editor.isActive(active as Record<string, unknown>) ? 'primary' : 'text')}
        onClick={action} style={{ padding: '0 6px', height: 30, minWidth: 30 }}>{icon}</Button>
    </Tooltip>
  );

  return (
    <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: '4px 8px', borderBottom: '1px solid #f0f0f0', background: '#fafafa' }}>
        <Space size={0} wrap>
          {btn(<Bold size={14} />, () => editor.chain().focus().toggleBold().run(), 'bold', '加粗')}
          {btn(<Italic size={14} />, () => editor.chain().focus().toggleItalic().run(), 'italic', '斜体')}
          {btn(<UnderlineIcon size={14} />, () => editor.chain().focus().toggleUnderline().run(), 'underline', '下划线')}
          {btn(<Strikethrough size={14} />, () => editor.chain().focus().toggleStrike().run(), 'strike', '删除线')}
          <span style={{ width: 1, height: 22, background: '#d9d9d9', margin: '4px 6px', alignSelf: 'center', display: 'inline-block' }} />
          {btn(<Heading1 size={14} />, () => editor.chain().focus().toggleHeading({ level: 1 }).run(), { level: 1 }, '标题1')}
          {btn(<Heading2 size={14} />, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), { level: 2 }, '标题2')}
          {btn(<Heading3 size={14} />, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), { level: 3 }, '标题3')}
          <span style={{ width: 1, height: 22, background: '#d9d9d9', margin: '4px 6px', alignSelf: 'center', display: 'inline-block' }} />
          {btn(<AlignLeft size={14} />, () => editor.chain().focus().setTextAlign('left').run(), { textAlign: 'left' }, '左对齐')}
          {btn(<AlignCenter size={14} />, () => editor.chain().focus().setTextAlign('center').run(), { textAlign: 'center' }, '居中')}
          {btn(<AlignRight size={14} />, () => editor.chain().focus().setTextAlign('right').run(), { textAlign: 'right' }, '右对齐')}
          <span style={{ width: 1, height: 22, background: '#d9d9d9', margin: '4px 6px', alignSelf: 'center', display: 'inline-block' }} />
          {btn(<List size={14} />, () => editor.chain().focus().toggleBulletList().run(), 'bulletList', '无序列表')}
          {btn(<ListOrdered size={14} />, () => editor.chain().focus().toggleOrderedList().run(), 'orderedList', '有序列表')}
          {btn(<Quote size={14} />, () => editor.chain().focus().toggleBlockquote().run(), 'blockquote', '引用')}
          {btn(<Code size={14} />, () => editor.chain().focus().toggleCodeBlock().run(), 'codeBlock', '代码块')}
          {btn(<Minus size={14} />, () => editor.chain().focus().setHorizontalRule().run(), false, '分割线')}
          <span style={{ width: 1, height: 22, background: '#d9d9d9', margin: '4px 6px', alignSelf: 'center', display: 'inline-block' }} />
          {/* 表格 */}
          {btn(<Table size={14} />, insertTable, false, '插入表格(3x3)')}
          {btn(<Columns size={14} />, addColumn, false, '右侧插入列')}
          {btn(<Rows size={14} />, addRow, false, '下方插入行')}
          {btn(<Trash2 size={14} />, deleteTable, false, '删除表格')}
          <span style={{ width: 1, height: 22, background: '#d9d9d9', margin: '4px 6px', alignSelf: 'center', display: 'inline-block' }} />
          {btn(<Highlighter size={14} />, () => editor.chain().focus().toggleHighlight().run(), 'highlight', '高亮')}
          {btn(<Palette size={14} />, setColor, false, '文字颜色')}
          {btn(<ImageIcon size={14} />, addImage, false, '插入图片URL')}
          {btn(<Video size={14} />, addVideo, false, '插入视频(mp4/webm)')}
          {btn(<Video size={14} />, addYoutube, false, '插入YouTube视频')}
          {btn(<LinkIcon size={14} />, addLink, 'link', '插入链接')}
          {btn(<FileText size={14} />, openArticleLink, false, '插入站内文章链接')}
          {btn(<FileCode size={14} />, openSource, false, '查看/编辑源码(HTML)')}
          <Upload accept="image/*" showUploadList={false} beforeUpload={handleUpload}>
            <Tooltip title="上传图片"><Button size="small" type="text" style={{ padding: '0 6px', height: 30, minWidth: 30 }}><UploadIcon size={14} /></Button></Tooltip>
          </Upload>
          <span style={{ width: 1, height: 22, background: '#d9d9d9', margin: '4px 6px', alignSelf: 'center', display: 'inline-block' }} />
          {btn(<Undo2 size={13} />, () => editor.chain().focus().undo().run(), false, '撤销')}
          {btn(<Redo2 size={13} />, () => editor.chain().focus().redo().run(), false, '重做')}
        </Space>
      </div>

      <div style={{ minHeight: height, maxHeight: 600, overflowY: 'auto' }}>
        <EditorContent editor={editor}
          style={{ padding: '12px 16px', outline: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: 15, lineHeight: 1.7, color: '#333' }} />
      </div>

      <Modal
        title="源码编辑 (HTML)"
        open={sourceOpen}
        onOk={applySource}
        onCancel={() => setSourceOpen(false)}
        width={760}
        okText="应用"
        cancelText="取消"
      >
        <Input.TextArea
          value={sourceHtml}
          onChange={(e) => setSourceHtml(e.target.value)}
          rows={18}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
          placeholder="在此编辑 HTML 源码，点击“应用”同步到编辑器"
        />
      </Modal>

      <Modal
        title="插入站内文章链接"
        open={articleLinkOpen}
        onCancel={() => setArticleLinkOpen(false)}
        footer={null}
        width={560}
      >
        <Input.Search
          placeholder="搜索文章标题"
          value={articleKeyword}
          onChange={(e) => setArticleKeyword(e.target.value)}
          onSearch={openArticleLink}
          enterButton
          style={{ marginBottom: 12 }}
        />
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {articleLoading ? <div style={{ padding: 16, color: '#999' }}>加载中...</div> :
            articleResults.length === 0 ? <div style={{ padding: 16, color: '#999' }}>无匹配文章</div> :
              articleResults.map((a) => (
                <div key={a.id}
                  onClick={() => insertArticleLink(a.id, a.title)}
                  style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <FileText size={14} style={{ verticalAlign: 'middle', marginRight: 8, color: '#1677ff' }} />
                  {a.title}
                  <span style={{ color: '#bbb', fontSize: 12, marginLeft: 8 }}>/site/articles/{a.id}</span>
                </div>
              ))}
        </div>
      </Modal>

      <style>{`
        .ProseMirror { outline: none; min-height: ${height - 60}px; }
        .ProseMirror p.is-editor-empty:first-child::before { color: #adb5bd; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
        .ProseMirror h1 { font-size: 28px; font-weight: 700; margin: 16px 0 8px; line-height: 1.3; }
        .ProseMirror h2 { font-size: 22px; font-weight: 600; margin: 14px 0 6px; line-height: 1.4; }
        .ProseMirror h3 { font-size: 18px; font-weight: 600; margin: 12px 0 4px; }
        .ProseMirror p { margin: 4px 0; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 4px 0; }
        .ProseMirror li { margin: 2px 0; }
        .ProseMirror blockquote { border-left: 3px solid #1677ff; padding-left: 16px; margin: 8px 0; color: #666; background: #f0f5ff; padding: 8px 16px; border-radius: 4px; }
        .ProseMirror code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 13px; color: #d4380d; }
        .ProseMirror pre { background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 6px; font-size: 13px; overflow-x: auto; }
        .ProseMirror pre code { background: none; color: inherit; padding: 0; }
        .ProseMirror img { max-width: 100%; border-radius: 4px; margin: 8px 0; }
        .ProseMirror mark { background: #ffd666; padding: 0 3px; border-radius: 2px; }
        .ProseMirror a { color: #1677ff; text-decoration: underline; }
        .ProseMirror hr { border: none; border-top: 2px solid #e8e8e8; margin: 16px 0; }
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: 8px 0; table-layout: fixed; overflow: hidden; }
        .ProseMirror table td, .ProseMirror table th { border: 1px solid #e8e8e8; padding: 6px 12px; min-width: 60px; vertical-align: top; position: relative; }
        .ProseMirror table th { background: #fafafa; font-weight: 600; }
        .ProseMirror .selectedCell { background: #e6f4ff; }
        .ProseMirror .selectedCell::after { content: ''; position: absolute; inset: 0; border: 2px solid #1677ff; pointer-events: none; }
        .ProseMirror .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: 0; width: 4px; background: #1677ff; pointer-events: none; }
        .ProseMirror video { max-width: 100%; border-radius: 4px; }
        video { max-width: 100%; border-radius: 4px; }
      `}</style>
    </div>
  );
}
