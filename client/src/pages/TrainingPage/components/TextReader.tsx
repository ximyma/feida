import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Button, Progress, Tooltip, message, Space, Tag, Modal, Input, Card, Typography, Select
} from 'antd';
import {
  EditOutlined, HighlightOutlined, QuestionOutlined, CheckOutlined, 
  SaveOutlined, FileTextOutlined, QuestionCircleOutlined, BulbOutlined,
  MenuOutlined, DeleteOutlined
} from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

interface Note {
  id: string;
  courseId: string;
  chapterId: string;
  noteType: 'note' | 'highlight' | 'question';
  content: string;
  highlightText?: string;
  position?: number;
  createdAt: string;
}

interface TextReaderProps {
  content: string;
  title?: string;
  courseId?: string;
  chapterId?: string;
  employeeId?: string;
  initialPosition?: number;
  onPositionChange?: (position: number) => void;
  onSaveNote?: (note: Partial<Note>) => Promise<void>;
  onDeleteNote?: (id: string) => Promise<void>;
  onMarkComplete?: () => void;
  onProgress?: (percent: number) => void;
}

const TextReader: React.FC<TextReaderProps> = ({
  content,
  title,
  courseId,
  chapterId,
  employeeId,
  initialPosition = 0,
  onPositionChange,
  onSaveNote,
  onDeleteNote,
  onMarkComplete,
  onProgress,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<number | null>(null);
  
  const [readProgress, setReadProgress] = useState(initialPosition);
  const [noteModal, setNoteModal] = useState(false);
  const [noteType, setNoteType] = useState<'note' | 'highlight' | 'question'>('note');
  const [noteContent, setNoteContent] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNotes, setShowNotes] = useState(true);
  const [saving, setSaving] = useState(false);

  // 计算阅读进度
  useEffect(() => {
    const updateProgress = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      
      if (scrollHeight > 0) {
        const percent = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
        setReadProgress(percent);
        onProgress?.(percent);
        
        // 防抖保存位置
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = window.setTimeout(() => {
          onPositionChange?.(percent);
        }, 1000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateProgress);
      
      // 初始化滚动位置
      if (initialPosition > 0) {
        setTimeout(() => {
          const targetScroll = ((initialPosition / 100) * (container.scrollHeight - container.clientHeight));
          container.scrollTop = targetScroll;
          setReadProgress(initialPosition);
        }, 100);
      }
      
      return () => {
        container.removeEventListener('scroll', updateProgress);
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      };
    }
  }, [initialPosition, onPositionChange, onProgress]);

  // 文本选择处理
  const handleTextSelect = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    }
  }, []);

  // 添加笔记
  const handleAddNote = useCallback(async () => {
    if (!noteContent.trim()) {
      message.warning('请输入笔记内容');
      return;
    }
    
    if (!courseId || !chapterId || !employeeId) {
      message.warning('缺少必要参数');
      return;
    }
    
    setSaving(true);
    try {
      const note: Partial<Note> = {
        courseId,
        chapterId,
        noteType,
        content: noteContent,
        highlightText: selectedText || highlightText,
        position: readProgress,
      };
      
      await onSaveNote?.(note);
      
      // 更新本地笔记列表
      const newNote: Note = {
        id: `temp_${Date.now()}`,
        courseId,
        chapterId,
        noteType,
        content: noteContent,
        highlightText: selectedText || highlightText,
        position: readProgress,
        createdAt: new Date().toISOString(),
      };
      setNotes(prev => [newNote, ...prev]);
      
      message.success('笔记已保存');
      setNoteModal(false);
      setNoteContent('');
      setHighlightText('');
      setSelectedText('');
    } catch (e) {
      message.error('保存失败');
    }
    setSaving(false);
  }, [noteContent, noteType, selectedText, highlightText, readProgress, courseId, chapterId, employeeId, onSaveNote]);

  // 删除笔记
  const handleDeleteNote = async (id: string) => {
    try {
      await onDeleteNote?.(id);
      setNotes(prev => prev.filter(n => n.id !== id));
      message.success('笔记已删除');
    } catch (e) {
      message.error('删除失败');
    }
  };

  // 打开笔记弹窗
  const openNoteModal = (type: 'note' | 'highlight' | 'question') => {
    setNoteType(type);
    if (type === 'highlight' && selectedText) {
      setHighlightText(selectedText);
    }
    setNoteModal(true);
  };

  // 标记完成
  const handleMarkComplete = () => {
    onMarkComplete?.();
    message.success('恭喜！本章已完成');
  };

  // 格式化时间
  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  // 滚动到指定位置
  const scrollToPosition = (position: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const targetScroll = ((position / 100) * (container.scrollHeight - container.clientHeight));
    container.scrollTo({ top: targetScroll, behavior: 'smooth' });
  };

  return (
    <div className="flex h-full relative">
      {/* 主阅读区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <Text strong className="text-lg truncate">{title || '课程内容'}</Text>
            <div className="flex items-center gap-2 shrink-0">
              <Text type="secondary" className="text-sm">阅读进度</Text>
              <Progress 
                percent={readProgress} 
                size="small" 
                style={{ width: 100 }}
                format={(p) => `${p}%`}
              />
            </div>
          </div>
          
          <Space className="shrink-0">
            <Tooltip title="记笔记">
              <Button icon={<EditOutlined />} onClick={() => openNoteModal('note')} />
            </Tooltip>
            <Tooltip title="划重点">
              <Button icon={<HighlightOutlined />} onClick={() => openNoteModal('highlight')} />
            </Tooltip>
            <Tooltip title="提问">
              <Button icon={<QuestionOutlined />} onClick={() => openNoteModal('question')} />
            </Tooltip>
            <Tooltip title={showNotes ? '隐藏笔记' : '显示笔记'}>
              <Button 
                icon={<MenuOutlined />} 
                onClick={() => setShowNotes(!showNotes)}
                type={showNotes ? 'primary' : 'default'}
              />
            </Tooltip>
            {readProgress >= 80 && (
              <Button 
                type="primary" 
                icon={<CheckOutlined />} 
                onClick={handleMarkComplete}
              >
                完成本章
              </Button>
            )}
          </Space>
        </div>

        {/* 阅读容器 */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-8 py-6 bg-white"
          onMouseUp={handleTextSelect}
        >
          <div className="max-w-3xl mx-auto">
            {/* 章节内容 - 直接渲染 HTML */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
              style={{
                lineHeight: '1.8',
                fontSize: '16px',
              }}
            />
            
            {/* 阅读完成提示 */}
            {readProgress >= 95 && (
              <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200 text-center">
                <CheckOutlined className="text-3xl text-green-500 mb-2" />
                <h3 className="text-lg font-medium text-green-700 mb-2">恭喜！您已完成本章阅读</h3>
                <p className="text-green-600 mb-4">继续下一章或完成本章学习</p>
                <Space>
                  <Button onClick={() => scrollToPosition(0)}>
                    重新阅读
                  </Button>
                  <Button type="primary" icon={<CheckOutlined />} onClick={handleMarkComplete}>
                    标记完成
                  </Button>
                </Space>
              </div>
            )}
          </div>
        </div>

        {/* 底部进度条 */}
        <div className="px-4 py-2 border-t bg-gray-50 shrink-0">
          <div className="flex items-center justify-between">
            <Text type="secondary" className="text-sm">
              预计阅读时间：约 10 分钟
            </Text>
            <Text type="secondary" className="text-sm">
              已阅读 {readProgress}%
            </Text>
          </div>
          <Progress 
            percent={readProgress} 
            showInfo={false}
            strokeColor="#1677ff"
            trailColor="#e5e7eb"
            className="mt-1"
          />
        </div>
      </div>

      {/* 右侧笔记面板 */}
      {showNotes && (
        <div className="w-80 border-l bg-gray-50 flex flex-col shrink-0">
          <div className="px-4 py-3 border-b bg-white flex items-center justify-between">
            <Text strong>学习笔记 ({notes.length})</Text>
            <Button 
              type="text" 
              size="small"
              icon={<MenuOutlined />}
              onClick={() => setShowNotes(false)}
            />
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {notes.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <FileTextOutlined className="text-3xl mb-2" />
                <p>暂无笔记</p>
                <p className="text-xs mt-1">选择文本后可添加笔记</p>
              </div>
            ) : (
              notes.map(note => (
                <Card 
                  key={note.id} 
                  size="small"
                  className={`note-card ${
                    note.noteType === 'highlight' ? 'border-yellow-300 bg-yellow-50' :
                    note.noteType === 'question' ? 'border-blue-300 bg-blue-50' :
                    'border-gray-300'
                  }`}
                  extra={
                    <Button 
                      type="text" 
                      size="small" 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteNote(note.id)}
                    />
                  }
                >
                  <div className="flex items-start gap-2">
                    {note.noteType === 'highlight' && <HighlightOutlined className="text-yellow-500 mt-0.5 shrink-0" />}
                    {note.noteType === 'question' && <QuestionCircleOutlined className="text-blue-500 mt-0.5 shrink-0" />}
                    {note.noteType === 'note' && <EditOutlined className="text-gray-500 mt-0.5 shrink-0" />}
                    
                    <div className="flex-1 min-w-0">
                      {note.highlightText && (
                        <div className="text-xs text-gray-500 mb-1 p-1 bg-yellow-100 rounded truncate">
                          "{note.highlightText.substring(0, 40)}..."
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <Text type="secondary" className="text-xs">
                          {formatDate(note.createdAt)}
                        </Text>
                        {note.position !== undefined && (
                          <Button 
                            type="link" 
                            size="small"
                            className="text-xs p-0 h-auto"
                            onClick={() => scrollToPosition(note.position!)}
                          >
                            跳转
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
          
          <div className="p-3 border-t bg-white">
            <Button 
              block 
              icon={<EditOutlined />}
              onClick={() => openNoteModal('note')}
            >
              添加笔记
            </Button>
          </div>
        </div>
      )}

      {/* 笔记弹窗 */}
      <Modal
        open={noteModal}
        onCancel={() => {
          setNoteModal(false);
          setNoteContent('');
          setHighlightText('');
          setSelectedText('');
        }}
        onOk={handleAddNote}
        title={
          <div className="flex items-center gap-2">
            {noteType === 'note' && <><EditOutlined /> 普通笔记</>}
            {noteType === 'highlight' && <><HighlightOutlined className="text-yellow-500" /> 划重点</>}
            {noteType === 'question' && <><QuestionOutlined className="text-blue-500" /> 提问</>}
          </div>
        }
        confirmLoading={saving}
        okText="保存笔记"
      >
        <div className="space-y-4">
          {/* 高亮原文 */}
          {(noteType === 'highlight') && (highlightText || selectedText) && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
              <Text type="secondary" className="text-xs">高亮内容：</Text>
              <p className="mt-1 text-yellow-700 font-medium">
                "{highlightText || selectedText}"
              </p>
            </div>
          )}
          
          {/* 笔记类型选择 */}
          <div className="flex gap-2">
            <Tag 
              color={noteType === 'note' ? 'blue' : 'default'}
              onClick={() => setNoteType('note')}
              className="cursor-pointer"
            >
              <EditOutlined /> 笔记
            </Tag>
            <Tag 
              color={noteType === 'highlight' ? 'gold' : 'default'}
              onClick={() => setNoteType('highlight')}
              className="cursor-pointer"
            >
              <HighlightOutlined /> 重点
            </Tag>
            <Tag 
              color={noteType === 'question' ? 'cyan' : 'default'}
              onClick={() => setNoteType('question')}
              className="cursor-pointer"
            >
              <QuestionOutlined /> 疑问
            </Tag>
          </div>
          
          {/* 笔记内容 */}
          <TextArea
            rows={4}
            placeholder={
              noteType === 'question' 
                ? '写下你的疑问...' 
                : '记录你的学习心得...'
            }
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
          />
          
          {/* 阅读位置 */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BulbOutlined />
            <span>当前阅读位置: {readProgress}%</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TextReader;
