import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Card, Row, Col, List, Button, Tag, Space, Tabs, Badge, Empty, 
  Modal, Form, Input, DatePicker, Select, message, Statistic, 
  Avatar, Typography, Drawer, Descriptions, Segmented, Popconfirm, Tooltip
} from 'antd';
import { 
  VideoCameraOutlined, PlayCircleOutlined, CalendarOutlined, 
  UserOutlined, ClockCircleOutlined, HeartOutlined, EyeOutlined,
  SettingOutlined, PlusOutlined, TeamOutlined, DeleteOutlined, EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import LivePlayer from './LivePlayer';
import LiveChat, { ChatMessage } from './LiveChat';
import LiveDanmu from './LiveDanmu';
import LiveControlModal, { LiveSession } from './LiveControlModal';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

interface LiveCenterTabProps {
  /** 当前登录用户ID */
  currentUserId: string;
  /** 当前登录用户名 */
  currentUserName: string;
  /** 是否为管理员 */
  isAdmin?: boolean;
}

interface LiveRoom {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  teacherName: string;
  teacherAvatar?: string;
  status: 'pending' | 'live' | 'ended';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  viewerCount: number;
  maxViewerCount: number;
  duration: number;
  recordUrl?: string;
  pullUrl?: string;
  streamKey?: string;
  streamUrl?: string;
  chapterId?: string;
  courseId?: string;
}

const LiveCenterTab: React.FC<LiveCenterTabProps> = ({
  currentUserId,
  currentUserName,
  isAdmin = false,
}) => {
  // 状态
  const [loading, setLoading] = useState(false);
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<LiveRoom | null>(null);
  const [isInRoom, setIsInRoom] = useState(false);
  const [danmakuEnabled, setDanmakuEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [controlModalVisible, setControlModalVisible] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [chapters, setChapters] = useState<Array<{ id: string; title: string; courseId: string }>>([]);
  
  const messagePollingRef = useRef<NodeJS.Timeout | null>(null);

  // API调用 - 获取直播列表
  const fetchLiveRooms = async () => {
    const res = await fetch('/api/training/live');
    return res.json();
  };
  
  // 获取章节列表
  const fetchChapters = async () => {
    const res = await fetch('/api/training/v2/chapters');
    return res.json();
  };

  // 加载直播列表
  const loadLiveRooms = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/training/live');
      const data = await res.json();
      if (data.success) {
        setLiveRooms(data.data || []);
      } else {
        message.error(data.message || '加载直播列表失败');
      }
    } catch (err) {
      console.error('Load live rooms error:', err);
      message.error('加载直播列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 加载章节列表（用于创建直播时选择）
  const loadChapters = useCallback(async () => {
    try {
      const data = await fetchChapters();
      if (data.success) {
        setChapters((data.data || []).map((ch: any) => ({
          id: ch.id,
          title: ch.title,
          courseId: ch.courseId,
        })));
      }
    } catch (err) {
      console.error('Load chapters error:', err);
    }
  }, []);

  // 加载直播消息
  const loadMessages = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`/api/training/live/${roomId}/messages`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error('Load messages error:', err);
    }
  }, []);

  // 进入直播间
  const enterRoom = useCallback(async (room: LiveRoom) => {
    setSelectedRoom(room);
    setIsInRoom(true);
    loadMessages(room.id);
    
    // 开启轮询获取新消息
    messagePollingRef.current = setInterval(() => {
      loadMessages(room.id);
    }, 5000);
  }, [loadMessages]);

  // 离开直播间
  const leaveRoom = useCallback(() => {
    setIsInRoom(false);
    setSelectedRoom(null);
    setMessages([]);
    
    if (messagePollingRef.current) {
      clearInterval(messagePollingRef.current);
      messagePollingRef.current = null;
    }
  }, []);

  // 发送消息
  const handleSendMessage = useCallback((content: string, type: 'chat' | 'danmu' | 'question') => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: currentUserId,
      userName: currentUserName,
      type,
      content,
      createdAt: new Date().toISOString(),
      isMyself: true,
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // 实际项目中这里调用API
    // await fetch(`/api/training/live/${selectedRoom?.id}/messages`, {
    //   method: 'POST',
    //   body: JSON.stringify({ content, type }),
    // });
  }, [currentUserId, currentUserName]);

  // 隐藏消息（管理员）
  const handleHideMessage = useCallback(async (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isHidden: true } : msg
    ));
    
    // 实际项目中这里调用API
    // await fetch(`/api/training/live/${selectedRoom?.id}/messages/${messageId}/hide`, {
    //   method: 'PUT',
    // });
  }, []);

  // 创建直播
  const handleCreateLive = useCallback(async (data: Partial<LiveSession>) => {
    try {
      // 实际项目中这里调用API
      // await fetch('/api/training/live', {
      //   method: 'POST',
      //   body: JSON.stringify(data),
      // });
      
      message.success('直播创建成功');
      loadLiveRooms();
    } catch (err) {
      message.error('创建直播失败');
    }
  }, [loadLiveRooms]);

  // 开始直播
  const handleStartLive = useCallback(async (sessionId: string) => {
    try {
      // 实际项目中这里调用API
      // await fetch(`/api/training/live/${sessionId}/start`, { method: 'PUT' });
      
      message.success('直播已开始');
      loadLiveRooms();
    } catch (err) {
      message.error('启动直播失败');
    }
  }, [loadLiveRooms]);

  // 结束直播
  const handleStopLive = useCallback(async (sessionId: string) => {
    try {
      // 实际项目中这里调用API
      // await fetch(`/api/training/live/${sessionId}/stop`, { method: 'PUT' });
      
      message.success('直播已结束');
      loadLiveRooms();
    } catch (err) {
      message.error('结束直播失败');
    }
  }, [loadLiveRooms]);

  // 删除直播
  const handleDeleteLive = useCallback(async (sessionId: string) => {
    try {
      // 实际项目中这里调用API
      // await fetch(`/api/training/live/${sessionId}`, { method: 'DELETE' });
      
      message.success('直播已删除');
      loadLiveRooms();
    } catch (err) {
      message.error('删除直播失败');
    }
  }, [loadLiveRooms]);

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 过滤直播列表
  const filteredRooms = liveRooms.filter(room => {
    if (activeTab === 'all') return true;
    if (activeTab === 'live') return room.status === 'live';
    if (activeTab === 'pending') return room.status === 'pending';
    if (activeTab === 'ended') return room.status === 'ended';
    return true;
  });

  // 初始化
  useEffect(() => {
    loadLiveRooms();
    loadChapters();
    
    return () => {
      if (messagePollingRef.current) {
        clearInterval(messagePollingRef.current);
      }
    };
  }, [loadLiveRooms, loadChapters]);

  // 渲染直播卡片
  const renderLiveCard = (room: LiveRoom) => {
    const isLive = room.status === 'live';
    const isEnded = room.status === 'ended';
    const isPending = room.status === 'pending';

    return (
      <Card
        key={room.id}
        className="live-card hover:shadow-lg transition-shadow cursor-pointer"
        cover={
          <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600">
            {room.coverUrl ? (
              <img src={room.coverUrl} alt={room.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <VideoCameraOutlined style={{ fontSize: 48, color: 'white' }} />
              </div>
            )}
            
            {/* 状态标签 */}
            <div className="absolute top-3 left-3">
              {isLive && (
                <Tag color="error" className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  直播中
                </Tag>
              )}
              {isPending && (
                <Tag color="blue">
                  <CalendarOutlined className="mr-1" />
                  预告
                </Tag>
              )}
              {isEnded && (
                <Tag color="default">已结束</Tag>
              )}
            </div>

            {/* 观看人数 */}
            {isLive && (
              <div className="absolute bottom-3 right-3">
                <Tag color="rgba(0,0,0,0.6)" className="text-white border-0">
                  <EyeOutlined className="mr-1" />
                  {room.viewerCount}
                </Tag>
              </div>
            )}
          </div>
        }
        actions={[
          <Button 
            key="enter" 
            type="primary"
            icon={isEnded ? <PlayCircleOutlined /> : <VideoCameraOutlined />}
            onClick={() => enterRoom(room)}
          >
            {isEnded ? '观看回放' : isLive ? '进入直播' : isPending ? '预约' : '进入'}
          </Button>,
          ...(isAdmin ? [
            <Tooltip title="管理直播" key="admin">
              <Button 
                icon={<SettingOutlined />} 
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSession(room as unknown as LiveSession);
                  setControlModalVisible(true);
                }}
              />
            </Tooltip>
          ] : []),
        ]}
      >
        <Card.Meta
          title={<Text strong ellipsis={{ tooltip: room.title }}>{room.title}</Text>}
          description={
            <Space direction="vertical" size={4} className="w-full">
              <Space>
                <Avatar size="small" icon={<UserOutlined />} src={room.teacherAvatar} />
                <Text type="secondary" className="text-sm">{room.teacherName}</Text>
              </Space>
              
              {room.description && (
                <Text type="secondary" className="text-xs line-clamp-2">
                  {room.description}
                </Text>
              )}
              
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {isLive && (
                  <>
                    <span><ClockCircleOutlined /> {formatDuration(room.duration)}</span>
                    <span><TeamOutlined /> 最高 {room.maxViewerCount}</span>
                  </>
                )}
                {isPending && room.scheduledAt && (
                  <span><CalendarOutlined /> {dayjs(room.scheduledAt).format('MM-DD HH:mm')}</span>
                )}
                {isEnded && (
                  <span>观看 {room.viewerCount} 次</span>
                )}
              </div>
            </Space>
          }
        />
      </Card>
    );
  };

  // 渲染直播间
  const renderLiveRoom = () => {
    if (!selectedRoom) return null;

    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
        {/* 顶部导航 */}
        <div className="h-14 bg-gray-800 flex items-center justify-between px-4">
          <Space>
            <Button 
              type="text" 
              icon={<VideoCameraOutlined />} 
              className="text-white"
              onClick={leaveRoom}
            >
              返回直播中心
            </Button>
            <Title level={4} className="!mb-0 text-white !text-lg">
              {selectedRoom.title}
            </Title>
          </Space>
          
          <Space>
            <Badge 
              status={selectedRoom.status === 'live' ? 'error' : 'default'} 
              text={
                <span className="text-white">
                  {selectedRoom.status === 'live' ? '直播中' : 
                   selectedRoom.status === 'ended' ? '已结束' : '未开始'}
                </span>
              }
            />
            {selectedRoom.status === 'live' && (
              <Tag color="error" className="animate-pulse">
                {formatDuration(selectedRoom.duration)}
              </Tag>
            )}
          </Space>
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 视频区域 */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative bg-black">
              <LivePlayer
                src={selectedRoom.status === 'live' ? selectedRoom.pullUrl : undefined}
                playbackUrl={selectedRoom.status === 'ended' ? selectedRoom.recordUrl : undefined}
                isLive={selectedRoom.status === 'live'}
                title={selectedRoom.title}
              />
              <LiveDanmu
                danmus={messages.filter(m => m.type === 'danmu').map(m => ({
                  id: m.id,
                  content: m.content,
                  color: undefined,
                }))}
                enabled={danmakuEnabled && selectedRoom.status === 'live'}
              />
            </div>
            
            {/* 直播信息栏 */}
            <div className="h-12 bg-gray-800 flex items-center px-4">
              <Space split={<span className="text-gray-600">|</span>}>
                <Text className="text-gray-300">
                  <Avatar size="small" icon={<UserOutlined />} className="mr-2" />
                  {selectedRoom.teacherName}
                </Text>
                <Text className="text-gray-400">
                  <EyeOutlined className="mr-1" />
                  {selectedRoom.viewerCount} 人观看
                </Text>
                {selectedRoom.status === 'ended' && (
                  <Text className="text-gray-400">
                    回放时长：{formatDuration(selectedRoom.duration)}
                  </Text>
                )}
              </Space>
            </div>
          </div>

          {/* 聊天区域 */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <LiveChat
              messages={messages}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onSendMessage={handleSendMessage}
              onHideMessage={isAdmin ? handleHideMessage : undefined}
              showDanmakuToggle={true}
              danmakuEnabled={danmakuEnabled}
              onDanmakuToggle={setDanmakuEnabled}
              disabled={selectedRoom.status === 'ended'}
              showQuestions={true}
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>
    );
  };

  // 直播列表
  const renderLiveList = () => (
    <div className="p-4">
      {/* 标签页和操作栏 */}
      <div className="flex items-center justify-between mb-4">
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'all', label: `全部 (${liveRooms.length})` },
            { key: 'live', label: (
              <Badge status="error" text={`直播中 (${liveRooms.filter(r => r.status === 'live').length})`} />
            )},
            { key: 'pending', label: `预告 (${liveRooms.filter(r => r.status === 'pending').length})` },
            { key: 'ended', label: `回放 (${liveRooms.filter(r => r.status === 'ended').length})` },
          ]}
        />
        
        {isAdmin && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingSession(null);
              setModalVisible(true);
            }}
          >
            创建直播
          </Button>
        )}
      </div>

      {/* 直播卡片网格 */}
      {filteredRooms.length === 0 ? (
        <Empty description="暂无直播" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredRooms.map(room => (
            <Col key={room.id} xs={24} sm={12} md={8} lg={6}>
              {renderLiveCard(room)}
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  return (
    <div className="live-center-tab">
      {/* 直播间 */}
      {isInRoom && renderLiveRoom()}

      {/* 直播列表 */}
      {!isInRoom && renderLiveList()}

      {/* 创建直播弹窗 */}
      <LiveControlModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        mode="create"
        chapters={chapters}
        onSave={handleCreateLive}
      />

      {/* 直播控制弹窗 */}
      <LiveControlModal
        visible={controlModalVisible}
        onClose={() => {
          setControlModalVisible(false);
          setEditingSession(null);
        }}
        mode="control"
        session={editingSession}
        onStart={handleStartLive}
        onStop={handleStopLive}
        onDelete={handleDeleteLive}
      />
    </div>
  );
};

export default LiveCenterTab;
