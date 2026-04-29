import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SendOutlined, MessageOutlined, QuestionOutlined, CloseCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Input, Button, Tabs, List, Avatar, Badge, Empty, Checkbox } from 'antd';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'chat' | 'danmu' | 'question' | 'answer' | 'system';
  content: string;
  createdAt: string;
  isHidden?: boolean;
  isMyself?: boolean;
}

interface LiveChatProps {
  /** 消息列表 */
  messages: ChatMessage[];
  /** 当前用户ID */
  currentUserId: string;
  /** 当前用户名 */
  currentUserName: string;
  /** 发送消息回调 */
  onSendMessage: (content: string, type: 'chat' | 'danmu' | 'question') => void;
  /** 隐藏消息回调（管理员用） */
  onHideMessage?: (messageId: string) => void;
  /** 是否显示弹幕开关 */
  showDanmakuToggle?: boolean;
  /** 弹幕是否开启 */
  danmakuEnabled?: boolean;
  /** 弹幕开关回调 */
  onDanmakuToggle?: (enabled: boolean) => void;
  /** 是否禁用输入（直播已结束等） */
  disabled?: boolean;
  /** 最大消息数 */
  maxMessages?: number;
  /** 是否显示提问列表 */
  showQuestions?: boolean;
  /** 是否管理员模式 */
  isAdmin?: boolean;
}

const LiveChat: React.FC<LiveChatProps> = ({
  messages,
  currentUserId,
  currentUserName,
  onSendMessage,
  onHideMessage,
  showDanmakuToggle = true,
  danmakuEnabled = true,
  onDanmakuToggle,
  disabled = false,
  maxMessages = 200,
  showQuestions = true,
  isAdmin = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 发送消息
  const handleSend = useCallback(() => {
    if (!inputValue.trim() || disabled) return;

    const type = activeTab === 'question' ? 'question' : 
                 activeTab === 'danmu' ? 'danmu' : 'chat';
    
    onSendMessage(inputValue.trim(), type);
    setInputValue('');
    inputRef.current?.focus();
  }, [inputValue, activeTab, disabled, onSendMessage]);

  // 键盘发送
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // 过滤消息
  const filteredMessages = messages.filter(msg => {
    if (msg.isHidden && !isAdmin) return false;
    if (msg.type === 'question' || msg.type === 'answer') {
      return activeTab === 'question';
    }
    return activeTab !== 'question';
  });

  // 渲染消息内容
  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.type === 'system') {
      return (
        <div className="text-center text-gray-500 text-sm py-2">
          {msg.content}
        </div>
      );
    }

    return (
      <div className={`flex gap-2 ${msg.isMyself ? 'flex-row-reverse' : ''}`}>
        <Avatar 
          size="small" 
          icon={<UserOutlined />}
          src={msg.userAvatar}
          className="flex-shrink-0"
        />
        <div className={`max-w-[80%] ${msg.isMyself ? 'items-end' : ''}`}>
          <div className={`flex items-center gap-2 text-xs text-gray-500 ${msg.isMyself ? 'flex-row-reverse' : ''}`}>
            <span className={msg.isMyself ? 'text-blue-500' : ''}>{msg.userName}</span>
            <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
          </div>
          <div 
            className={`mt-1 px-3 py-2 rounded-lg text-sm ${
              msg.isMyself 
                ? 'bg-blue-500 text-white' 
                : msg.type === 'danmu'
                ? 'bg-gray-100'
                : 'bg-gray-100'
            }`}
          >
            {msg.content}
          </div>
          {isAdmin && msg.isHidden && (
            <div className="text-xs text-red-500 mt-1">已隐藏</div>
          )}
        </div>
      </div>
    );
  };

  // 提问数量
  const questionCount = messages.filter(m => m.type === 'question').length;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg">
      {/* 标签页 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        size="small"
        className="live-chat-tabs"
        items={[
          {
            key: 'chat',
            label: (
              <span className="flex items-center gap-1">
                <MessageOutlined />
                聊天
              </span>
            ),
          },
          {
            key: 'danmu',
            label: '弹幕',
          },
          ...(showQuestions ? [{
            key: 'question',
            label: (
              <Badge count={questionCount} size="small" offset={[8, 0]}>
                <span className="flex items-center gap-1 px-2">
                  <QuestionOutlined />
                  提问
                </span>
              </Badge>
            ),
          }] : []),
        ]}
      />

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {filteredMessages.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description={activeTab === 'question' ? '暂无提问' : '暂无消息'}
            className="py-8"
          />
        ) : (
          filteredMessages.map(msg => (
            <div key={msg.id} className="relative group">
              {renderMessageContent(msg)}
              {/* 管理员操作按钮 */}
              {isAdmin && msg.type !== 'system' && (
                <Button
                  type="text"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 text-red-500"
                  onClick={() => onHideMessage?.(msg.id)}
                />
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      {!disabled && (
        <div className="p-2 border-t border-gray-200">
          {/* 弹幕开关 */}
          {showDanmakuToggle && activeTab === 'danmu' && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">开启弹幕：</span>
              <Checkbox 
                checked={danmakuEnabled}
                onChange={(e) => onDanmakuToggle?.(e.target.checked)}
              />
            </div>
          )}
          
          {/* 输入框和发送按钮 */}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                activeTab === 'question' 
                  ? '输入你的问题...' 
                  : activeTab === 'danmu'
                  ? '输入弹幕内容...'
                  : '输入聊天内容...'
              }
              disabled={disabled}
              maxLength={100}
              className="flex-1"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              disabled={!inputValue.trim() || disabled}
            >
              发送
            </Button>
          </div>
          
          {/* 提示信息 */}
          {activeTab === 'question' && (
            <p className="text-xs text-gray-400 mt-1">
              提问会被主播看到，主播可以选择回答
            </p>
          )}
        </div>
      )}

      {/* 禁用状态 */}
      {disabled && (
        <div className="p-4 text-center text-gray-500 text-sm border-t border-gray-200">
          直播已结束，聊天已关闭
        </div>
      )}
    </div>
  );
};

export default LiveChat;
export type { LiveChatProps };
