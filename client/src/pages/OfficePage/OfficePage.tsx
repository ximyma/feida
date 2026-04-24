import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Upload,
  Tabs,
  Row,
  Col,
  message,
  Tree,
  Dropdown,
  Menu,
  Statistic,
  Progress,
  Radio,
  InputNumber,
  Checkbox,
  Divider,
  Tooltip,
  Badge,
  Timeline,
  List,
  Avatar,
  Popconfirm,
  Switch,
  Alert,
} from 'antd';
import {
  FolderOutlined,
  FileOutlined,
  FolderAddOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  BellOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  CalendarOutlined,
  DashboardOutlined,
  SettingOutlined,
  MoreOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  AppstoreOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import dayjs from 'dayjs';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// ==================== 类型定义 ====================

// 文档管理类型
interface DocumentFolder {
  id: string;
  name: string;
  parentId: string | null;
  permission: 'all' | 'department' | 'role';
  permissionValue?: string[];
  createdAt: string;
  createdBy: string;
}

interface Document {
  id: string;
  name: string;
  folderId: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'xlsx' | 'xls' | 'png' | 'jpg' | 'jpeg' | 'other';
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  downloads: number;
  description?: string;
}

// 公告类型
interface Announcement {
  id: string;
  title: string;
  content: string;
  publisher: string;
  publishDate: string;
  status: 'draft' | 'published' | 'archived';
  isTop: boolean;
  category: 'company' | 'hr' | 'admin' | 'other';
  viewCount: number;
  readRecords: ReadRecord[];
}

interface ReadRecord {
  employeeId: string;
  employeeName: string;
  readAt: string;
}

// 问卷投票类型
interface Survey {
  id: string;
  title: string;
  description: string;
  creator: string;
  createdAt: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'active' | 'paused' | 'closed';
  isAnonymous: boolean;
  maxVotes: number;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
}

interface SurveyQuestion {
  id: string;
  type: 'single' | 'multiple' | 'rating';
  title: string;
  options?: string[];
  required: boolean;
}

interface SurveyResponse {
  respondentId: string;
  respondentName: string;
  submittedAt: string;
  answers: Record<string, string | string[] | number>;
}

// 会议管理类型
interface MeetingRoom {
  id: string;
  name: string;
  capacity: number;
  location: string;
  equipment: string[];
  status: 'available' | 'occupied' | 'maintenance';
}

interface Meeting {
  id: string;
  title: string;
  roomId: string;
  organizer: string;
  startTime: string;
  endTime: string;
  participants: string[];
  description?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

// 用品领用类型
interface Supply {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  price: number;
  safetyStock: number;
  supplier?: string;
}

interface SupplyRequest {
  id: string;
  supplyId: string;
  supplyName: string;
  quantity: number;
  requester: string;
  requesterName: string;
  purpose: string;
  pickupTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approver?: string;
  approvedAt?: string;
  createdAt: string;
}

export default function OfficePage() {
  // ==================== 状态管理 ====================
  const [activeTab, setActiveTab] = useState('documents');
  const [loading, setLoading] = useState(false);

  // 文档管理状态
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DocumentFolder | null>(null);
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [documentSearchText, setDocumentSearchText] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState<string>('all');
  const [documentSortBy, setDocumentSortBy] = useState<'name' | 'date' | 'size'>('date');

  // 公告管理状态
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] = useState<Announcement | null>(null);
  const [readRecordModalVisible, setReadRecordModalVisible] = useState(false);

  // 问卷投票状态
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyModalVisible, setSurveyModalVisible] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);
  const [surveyResultVisible, setSurveyResultVisible] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [voteModalVisible, setVoteModalVisible] = useState(false);

  // 会议管理状态
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [roomModalVisible, setRoomModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<MeetingRoom | null>(null);
  const [meetingModalVisible, setMeetingModalVisible] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [meetingViewMode, setMeetingViewMode] = useState<'list' | 'calendar'>('list');

  // 用品领用状态
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [supplyRequests, setSupplyRequests] = useState<SupplyRequest[]>([]);
  const [supplyModalVisible, setSupplyModalVisible] = useState(false);
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [supplyViewTab, setSupplyViewTab] = useState<'inventory' | 'requests' | 'statistics'>('inventory');

  // ==================== 初始化数据 ====================
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 模拟API调用
      await Promise.all([
        loadFolders(),
        loadDocuments(),
        loadAnnouncements(),
        loadSurveys(),
        loadMeetingRooms(),
        loadMeetings(),
        loadSupplies(),
        loadSupplyRequests(),
      ]);
    } catch (error) {
      message.error('加载数据失败');
    }
    setLoading(false);
  };

  // 模拟加载函数
  const loadFolders = async () => {
    const mockFolders: DocumentFolder[] = [
      { id: '1', name: '公司制度', parentId: null, permission: 'all', createdAt: '2024-01-01', createdBy: '管理员' },
      { id: '2', name: '人事档案', parentId: null, permission: 'department', permissionValue: ['人事部'], createdAt: '2024-01-01', createdBy: '管理员' },
      { id: '3', name: '财务报表', parentId: null, permission: 'role', permissionValue: ['财务经理', '总经理'], createdAt: '2024-01-01', createdBy: '管理员' },
      { id: '4', name: '员工手册', parentId: '1', permission: 'all', createdAt: '2024-01-05', createdBy: '人事部' },
      { id: '5', name: '考勤制度', parentId: '1', permission: 'all', createdAt: '2024-01-05', createdBy: '人事部' },
    ];
    setFolders(mockFolders);
  };

  const loadDocuments = async () => {
    const mockDocuments: Document[] = [
      { id: '1', name: '员工手册2024版.pdf', folderId: '4', fileType: 'pdf', fileSize: 2048000, uploadedBy: '人事部', uploadedAt: '2024-01-10', downloads: 156 },
      { id: '2', name: '考勤管理制度.docx', folderId: '5', fileType: 'docx', fileSize: 1024000, uploadedBy: '人事部', uploadedAt: '2024-01-15', downloads: 89 },
      { id: '3', name: '组织架构图.xlsx', folderId: '1', fileType: 'xlsx', fileSize: 512000, uploadedBy: '管理员', uploadedAt: '2024-02-01', downloads: 234 },
      { id: '4', name: '财务报表Q1.xlsx', folderId: '3', fileType: 'xlsx', fileSize: 3072000, uploadedBy: '财务部', uploadedAt: '2024-04-05', downloads: 12 },
      { id: '5', name: '员工入职表.doc', folderId: '2', fileType: 'doc', fileSize: 256000, uploadedBy: '人事部', uploadedAt: '2024-03-20', downloads: 45 },
    ];
    setDocuments(mockDocuments);
  };

  const loadAnnouncements = async () => {
    const mockAnnouncements: Announcement[] = [
      {
        id: '1',
        title: '关于五一劳动节放假安排的通知',
        content: '<p>各位同事：</p><p>根据国务院办公厅通知，现将2024年五一劳动节放假安排通知如下：</p><p>5月1日至5月5日放假调休，共5天。</p><p>请各部门做好工作安排。</p>',
        publisher: '行政部',
        publishDate: '2024-04-20',
        status: 'published',
        isTop: true,
        category: 'admin',
        viewCount: 234,
        readRecords: [
          { employeeId: '1', employeeName: '张三', readAt: '2024-04-21 09:30:00' },
          { employeeId: '2', employeeName: '李四', readAt: '2024-04-21 10:15:00' },
        ],
      },
      {
        id: '2',
        title: '公司年度体检通知',
        content: '<p>为关爱员工健康，公司将于5月10日-15日组织年度体检。</p><p>请各位同事按时参加。</p>',
        publisher: '人事部',
        publishDate: '2024-04-18',
        status: 'published',
        isTop: false,
        category: 'hr',
        viewCount: 189,
        readRecords: [
          { employeeId: '1', employeeName: '张三', readAt: '2024-04-19 14:20:00' },
        ],
      },
      {
        id: '3',
        title: '新版OA系统上线公告',
        content: '<p>新版OA系统将于5月1日正式上线，请各位同事及时登录体验。</p>',
        publisher: 'IT部',
        publishDate: '2024-04-25',
        status: 'published',
        isTop: false,
        category: 'company',
        viewCount: 56,
        readRecords: [],
      },
    ];
    setAnnouncements(mockAnnouncements);
  };

  const loadSurveys = async () => {
    const mockSurveys: Survey[] = [
      {
        id: '1',
        title: '2024年度员工满意度调查',
        description: '请如实填写，您的意见对我们很重要',
        creator: '人事部',
        createdAt: '2024-04-01',
        startTime: '2024-04-05',
        endTime: '2024-04-30',
        status: 'active',
        isAnonymous: true,
        maxVotes: 1,
        questions: [
          { id: 'q1', type: 'single', title: '您对公司的整体满意度如何？', options: ['非常满意', '满意', '一般', '不满意'], required: true },
          { id: 'q2', type: 'multiple', title: '您认为公司哪些方面需要改进？', options: ['薪资福利', '工作环境', '晋升机制', '团队氛围'], required: true },
          { id: 'q3', type: 'rating', title: '请为公司的培训体系打分', required: true },
        ],
        responses: [
          { respondentId: '1', respondentName: '张三', submittedAt: '2024-04-10', answers: { q1: '满意', q2: ['薪资福利', '晋升机制'], q3: 4 } },
          { respondentId: '2', respondentName: '李四', submittedAt: '2024-04-12', answers: { q1: '非常满意', q2: ['工作环境'], q3: 5 } },
        ],
      },
      {
        id: '2',
        title: '团建活动投票',
        description: '请选择您想参加的团建活动',
        creator: '行政部',
        createdAt: '2024-04-15',
        startTime: '2024-04-16',
        endTime: '2024-04-25',
        status: 'active',
        isAnonymous: false,
        maxVotes: 1,
        questions: [
          { id: 'q1', type: 'single', title: '您希望参加哪种团建活动？', options: ['户外拓展', '聚餐K歌', '周边旅游', '运动会'], required: true },
        ],
        responses: [
          { respondentId: '1', respondentName: '张三', submittedAt: '2024-04-17', answers: { q1: '周边旅游' } },
          { respondentId: '2', respondentName: '李四', submittedAt: '2024-04-18', answers: { q1: '户外拓展' } },
          { respondentId: '3', respondentName: '王五', submittedAt: '2024-04-19', answers: { q1: '户外拓展' } },
        ],
      },
    ];
    setSurveys(mockSurveys);
  };

  const loadMeetingRooms = async () => {
    const mockRooms: MeetingRoom[] = [
      { id: '1', name: '大会议室A', capacity: 50, location: '3楼301', equipment: ['投影仪', '麦克风', '白板', '视频会议系统'], status: 'available' },
      { id: '2', name: '中型会议室B', capacity: 20, location: '3楼302', equipment: ['投影仪', '白板'], status: 'available' },
      { id: '3', name: '小型会议室C', capacity: 8, location: '3楼303', equipment: ['电视屏幕'], status: 'occupied' },
      { id: '4', name: '会议室D', capacity: 15, location: '2楼201', equipment: ['投影仪', '白板'], status: 'maintenance' },
    ];
    setMeetingRooms(mockRooms);
  };

  const loadMeetings = async () => {
    const mockMeetings: Meeting[] = [
      { id: '1', title: '季度工作总结会', roomId: '1', organizer: '总经理', startTime: '2024-04-25 14:00:00', endTime: '2024-04-25 16:00:00', participants: ['张三', '李四', '王五'], description: '第一季度工作总结', status: 'scheduled' },
      { id: '2', title: '产品评审会', roomId: '2', organizer: '产品部', startTime: '2024-04-26 10:00:00', endTime: '2024-04-26 11:30:00', participants: ['张三', '赵六'], status: 'scheduled' },
      { id: '3', title: '面试-前端开发', roomId: '3', organizer: '人事部', startTime: '2024-04-25 09:00:00', endTime: '2024-04-25 10:00:00', participants: ['人事专员'], status: 'ongoing' },
    ];
    setMeetings(mockMeetings);
  };

  const loadSupplies = async () => {
    const mockSupplies: Supply[] = [
      { id: '1', name: 'A4打印纸', category: '办公用品', stock: 500, unit: '包', price: 25, safetyStock: 100, supplier: '得力' },
      { id: '2', name: '黑色签字笔', category: '办公用品', stock: 200, unit: '支', price: 2, safetyStock: 50, supplier: '晨光' },
      { id: '3', name: '文件夹', category: '办公用品', stock: 150, unit: '个', price: 5, safetyStock: 30, supplier: '得力' },
      { id: '4', name: '订书机', category: '办公用品', stock: 30, unit: '个', price: 15, safetyStock: 10, supplier: '得力' },
      { id: '5', name: '便利贴', category: '办公用品', stock: 80, unit: '本', price: 8, safetyStock: 20, supplier: '3M' },
      { id: '6', name: '洗手液', category: '清洁用品', stock: 45, unit: '瓶', price: 12, safetyStock: 20, supplier: '蓝月亮' },
    ];
    setSupplies(mockSupplies);
  };

  const loadSupplyRequests = async () => {
    const mockRequests: SupplyRequest[] = [
      { id: '1', supplyId: '1', supplyName: 'A4打印纸', quantity: 10, requester: '001', requesterName: '张三', purpose: '日常办公', pickupTime: '2024-04-26', status: 'approved', approver: '行政主管', approvedAt: '2024-04-25', createdAt: '2024-04-25' },
      { id: '2', supplyId: '2', supplyName: '黑色签字笔', quantity: 20, requester: '002', requesterName: '李四', purpose: '部门培训', pickupTime: '2024-04-27', status: 'pending', createdAt: '2024-04-25' },
      { id: '3', supplyId: '3', supplyName: '文件夹', quantity: 15, requester: '003', requesterName: '王五', purpose: '资料整理', pickupTime: '2024-04-28', status: 'completed', approver: '行政主管', approvedAt: '2024-04-24', createdAt: '2024-04-24' },
    ];
    setSupplyRequests(mockRequests);
  };

  // ==================== 文档管理功能 ====================

  // 构建文件夹树
  const buildFolderTree = (): DataNode[] => {
    const buildNode = (parentId: string | null): DataNode[] => {
      return folders
        .filter(f => f.parentId === parentId)
        .map(f => ({
          key: f.id,
          title: (
            <div className="flex items-center justify-between group">
              <span>{f.name}</span>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item key="edit" icon={<EditOutlined />} onClick={() => handleEditFolder(f)}>重命名</Menu.Item>
                    <Menu.Item key="add" icon={<FolderAddOutlined />} onClick={() => handleAddSubFolder(f)}>新建子文件夹</Menu.Item>
                    <Menu.Item key="delete" icon={<DeleteOutlined />} danger onClick={() => handleDeleteFolder(f)}>删除</Menu.Item>
                  </Menu>
                }
                trigger={['click']}
              >
                <MoreOutlined className="opacity-0 group-hover:opacity-100" onClick={e => e.stopPropagation()} />
              </Dropdown>
            </div>
          ),
          icon: <FolderOutlined />,
          children: buildNode(f.id),
        }));
    };
    return [{
      key: 'root',
      title: '全部文档',
      icon: <FolderOutlined />,
      children: buildNode(null),
    }];
  };

  const handleAddFolder = () => {
    setEditingFolder(null);
    setFolderModalVisible(true);
  };

  const handleAddSubFolder = (parentFolder: DocumentFolder) => {
    setEditingFolder({ ...editingFolder, parentId: parentFolder.id } as any);
    setFolderModalVisible(true);
  };

  const handleEditFolder = (folder: DocumentFolder) => {
    setEditingFolder(folder);
    setFolderModalVisible(true);
  };

  const handleDeleteFolder = (folder: DocumentFolder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除文件夹"${folder.name}"吗？文件夹内的所有文档也会被删除。`,
      onOk: () => {
        setFolders(folders.filter(f => f.id !== folder.id));
        setDocuments(documents.filter(d => d.folderId !== folder.id));
        message.success('删除成功');
      },
    });
  };

  const handleSaveFolder = (values: any) => {
    if (editingFolder?.id) {
      setFolders(folders.map(f => f.id === editingFolder.id ? { ...f, ...values } : f));
      message.success('修改成功');
    } else {
      const newFolder: DocumentFolder = {
        id: Date.now().toString(),
        ...values,
        createdAt: dayjs().format('YYYY-MM-DD'),
        createdBy: '当前用户',
      };
      setFolders([...folders, newFolder]);
      message.success('创建成功');
    }
    setFolderModalVisible(false);
  };

  const handleUploadDocument = () => {
    setDocumentModalVisible(true);
  };

  const handleSaveDocument = (values: any) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: values.file?.file?.name || '未知文件',
      folderId: selectedFolderId || 'root',
      fileType: values.file?.file?.name?.split('.').pop() || 'other',
      fileSize: values.file?.file?.size || 0,
      uploadedBy: '当前用户',
      uploadedAt: dayjs().format('YYYY-MM-DD'),
      downloads: 0,
      description: values.description,
    };
    setDocuments([...documents, newDoc]);
    message.success('上传成功');
    setDocumentModalVisible(false);
  };

  const handleDeleteDocument = (doc: Document) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除文档"${doc.name}"吗？`,
      onOk: () => {
        setDocuments(documents.filter(d => d.id !== doc.id));
        message.success('删除成功');
      },
    });
  };

  const handlePreviewDocument = (doc: Document) => {
    setPreviewDocument(doc);
  };

  const getFileTypeIcon = (fileType: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      pdf: <FileTextOutlined className="text-red-500" />,
      doc: <FileTextOutlined className="text-blue-500" />,
      docx: <FileTextOutlined className="text-blue-500" />,
      xlsx: <FileTextOutlined className="text-green-500" />,
      xls: <FileTextOutlined className="text-green-500" />,
      png: <FileOutlined className="text-purple-500" />,
      jpg: <FileOutlined className="text-purple-500" />,
      jpeg: <FileOutlined className="text-purple-500" />,
    };
    return iconMap[fileType] || <FileOutlined />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 过滤和排序文档
  const filteredDocuments = useMemo(() => {
    let result = [...documents];
    
    // 文件夹过滤
    if (selectedFolderId && selectedFolderId !== 'root') {
      result = result.filter(d => d.folderId === selectedFolderId);
    }
    
    // 搜索过滤
    if (documentSearchText) {
      result = result.filter(d => d.name.toLowerCase().includes(documentSearchText.toLowerCase()));
    }
    
    // 类型过滤
    if (documentTypeFilter !== 'all') {
      result = result.filter(d => d.fileType === documentTypeFilter);
    }
    
    // 排序
    result.sort((a, b) => {
      if (documentSortBy === 'name') return a.name.localeCompare(b.name);
      if (documentSortBy === 'size') return b.fileSize - a.fileSize;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
    
    return result;
  }, [documents, selectedFolderId, documentSearchText, documentTypeFilter, documentSortBy]);

  // ==================== 公告管理功能 ====================

  const handlePublishAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementModalVisible(true);
  };

  const handleEditAnnouncement = (ann: Announcement) => {
    setEditingAnnouncement(ann);
    setAnnouncementModalVisible(true);
  };

  const handleSaveAnnouncement = (values: any) => {
    if (editingAnnouncement?.id) {
      setAnnouncements(announcements.map(a => a.id === editingAnnouncement.id ? { ...a, ...values } : a));
      message.success('修改成功');
    } else {
      const newAnn: Announcement = {
        id: Date.now().toString(),
        ...values,
        publishDate: dayjs().format('YYYY-MM-DD'),
        viewCount: 0,
        readRecords: [],
      };
      setAnnouncements([newAnn, ...announcements]);
      message.success('发布成功');
    }
    setAnnouncementModalVisible(false);
  };

  const handleDeleteAnnouncement = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该公告吗？',
      onOk: () => {
        setAnnouncements(announcements.filter(a => a.id !== id));
        message.success('删除成功');
      },
    });
  };

  const handleToggleTop = (id: string) => {
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, isTop: !a.isTop } : a));
    message.success('操作成功');
  };

  const handleWithdrawAnnouncement = (id: string) => {
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, status: 'archived' } : a));
    message.success('已撤回公告');
  };

  const handleViewAnnouncement = (ann: Announcement) => {
    setViewingAnnouncement(ann);
    setAnnouncements(announcements.map(a => a.id === ann.id ? { ...a, viewCount: a.viewCount + 1 } : a));
  };

  const getCategoryTag = (category: string) => {
    const map: Record<string, { color: string; text: string }> = {
      company: { color: 'blue', text: '公司公告' },
      hr: { color: 'purple', text: '人事公告' },
      admin: { color: 'orange', text: '行政公告' },
      other: { color: 'default', text: '其他' },
    };
    const config = map[category] || map.other;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      published: { color: 'green', text: '已发布' },
      draft: { color: 'default', text: '草稿' },
      archived: { color: 'gold', text: '已撤回' },
    };
    const config = map[status] || map.draft;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // ==================== 问卷投票功能 ====================

  const handleCreateSurvey = () => {
    setEditingSurvey(null);
    setSurveyModalVisible(true);
  };

  const handleEditSurvey = (survey: Survey) => {
    if (survey.status !== 'draft') {
      message.warning('只有草稿状态的问卷可以编辑');
      return;
    }
    setEditingSurvey(survey);
    setSurveyModalVisible(true);
  };

  const handleSaveSurvey = (values: any) => {
    if (editingSurvey?.id) {
      setSurveys(surveys.map(s => s.id === editingSurvey.id ? { ...s, ...values } : s));
      message.success('修改成功');
    } else {
      const newSurvey: Survey = {
        id: Date.now().toString(),
        ...values,
        creator: '当前用户',
        createdAt: dayjs().format('YYYY-MM-DD'),
        responses: [],
      };
      setSurveys([newSurvey, ...surveys]);
      message.success('创建成功');
    }
    setSurveyModalVisible(false);
  };

  const handleChangeSurveyStatus = (id: string, status: Survey['status']) => {
    setSurveys(surveys.map(s => s.id === id ? { ...s, status } : s));
    const statusText = { active: '发布', paused: '暂停', closed: '结束', draft: '恢复为草稿' };
    message.success(`已${statusText[status]}`);
  };

  const handleDeleteSurvey = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该问卷吗？',
      onOk: () => {
        setSurveys(surveys.filter(s => s.id !== id));
        message.success('删除成功');
      },
    });
  };

  const handleViewSurveyResult = (survey: Survey) => {
    setSelectedSurvey(survey);
    setSurveyResultVisible(true);
  };

  const handleVote = (survey: Survey) => {
    setSelectedSurvey(survey);
    setVoteModalVisible(true);
  };

  // ==================== 会议管理功能 ====================

  const handleAddMeetingRoom = () => {
    setEditingRoom(null);
    setRoomModalVisible(true);
  };

  const handleEditMeetingRoom = (room: MeetingRoom) => {
    setEditingRoom(room);
    setRoomModalVisible(true);
  };

  const handleSaveMeetingRoom = (values: any) => {
    if (editingRoom?.id) {
      setMeetingRooms(meetingRooms.map(r => r.id === editingRoom.id ? { ...r, ...values } : r));
      message.success('修改成功');
    } else {
      const newRoom: MeetingRoom = {
        id: Date.now().toString(),
        ...values,
        status: 'available',
      };
      setMeetingRooms([...meetingRooms, newRoom]);
      message.success('添加成功');
    }
    setRoomModalVisible(false);
  };

  const handleDeleteMeetingRoom = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该会议室吗？',
      onOk: () => {
        setMeetingRooms(meetingRooms.filter(r => r.id !== id));
        message.success('删除成功');
      },
    });
  };

  const handleBookMeeting = () => {
    setEditingMeeting(null);
    setMeetingModalVisible(true);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setMeetingModalVisible(true);
  };

  const handleSaveMeeting = (values: any) => {
    // 检查时间冲突
    const roomMeetings = meetings.filter(m => 
      m.roomId === values.roomId && 
      m.id !== editingMeeting?.id &&
      m.status !== 'cancelled'
    );
    
    const newStart = dayjs(values.startTime);
    const newEnd = dayjs(values.endTime);
    
    const hasConflict = roomMeetings.some(m => {
      const existStart = dayjs(m.startTime);
      const existEnd = dayjs(m.endTime);
      return newStart.isBefore(existEnd) && newEnd.isAfter(existStart);
    });
    
    if (hasConflict) {
      Modal.confirm({
        title: '时间冲突警告',
        content: '该会议室在选定时间段已被预约，是否继续？',
        onOk: () => saveMeeting(values),
      });
    } else {
      saveMeeting(values);
    }
  };

  const saveMeeting = (values: any) => {
    if (editingMeeting?.id) {
      setMeetings(meetings.map(m => m.id === editingMeeting.id ? { ...m, ...values } : m));
      message.success('修改成功');
    } else {
      const newMeeting: Meeting = {
        id: Date.now().toString(),
        ...values,
        organizer: '当前用户',
        status: 'scheduled',
      };
      setMeetings([...meetings, newMeeting]);
      message.success('预约成功');
    }
    setMeetingModalVisible(false);
  };

  const handleCancelMeeting = (id: string) => {
    Modal.confirm({
      title: '确认取消',
      content: '确定要取消该会议吗？',
      onOk: () => {
        setMeetings(meetings.map(m => m.id === id ? { ...m, status: 'cancelled' } : m));
        message.success('已取消会议');
      },
    });
  };

  const getRoomStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      available: { color: 'green', text: '可用' },
      occupied: { color: 'red', text: '占用中' },
      maintenance: { color: 'orange', text: '维护中' },
    };
    const config = map[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getMeetingStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      scheduled: { color: 'blue', text: '已安排' },
      ongoing: { color: 'green', text: '进行中' },
      completed: { color: 'default', text: '已结束' },
      cancelled: { color: 'red', text: '已取消' },
    };
    const config = map[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // ==================== 用品领用功能 ====================

  const handleAddSupply = () => {
    setEditingSupply(null);
    setSupplyModalVisible(true);
  };

  const handleEditSupply = (supply: Supply) => {
    setEditingSupply(supply);
    setSupplyModalVisible(true);
  };

  const handleSaveSupply = (values: any) => {
    if (editingSupply?.id) {
      setSupplies(supplies.map(s => s.id === editingSupply.id ? { ...s, ...values } : s));
      message.success('修改成功');
    } else {
      const newSupply: Supply = {
        id: Date.now().toString(),
        ...values,
      };
      setSupplies([...supplies, newSupply]);
      message.success('添加成功');
    }
    setSupplyModalVisible(false);
  };

  const handleDeleteSupply = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用品吗？',
      onOk: () => {
        setSupplies(supplies.filter(s => s.id !== id));
        message.success('删除成功');
      },
    });
  };

  const handleCreateSupplyRequest = () => {
    setRequestModalVisible(true);
  };

  const handleSaveSupplyRequest = (values: any) => {
    const supply = supplies.find(s => s.id === values.supplyId);
    if (!supply) return;
    
    if (values.quantity > supply.stock) {
      message.error('申请数量超过库存数量');
      return;
    }
    
    const newRequest: SupplyRequest = {
      id: Date.now().toString(),
      supplyId: values.supplyId,
      supplyName: supply.name,
      quantity: values.quantity,
      requester: '001',
      requesterName: '当前用户',
      purpose: values.purpose,
      pickupTime: values.pickupTime,
      status: 'pending',
      createdAt: dayjs().format('YYYY-MM-DD'),
    };
    
    setSupplyRequests([newRequest, ...supplyRequests]);
    message.success('申请已提交');
    setRequestModalVisible(false);
  };

  const handleApproveRequest = (id: string, approved: boolean) => {
    setSupplyRequests(supplyRequests.map(r => 
      r.id === id ? { 
        ...r, 
        status: approved ? 'approved' : 'rejected',
        approver: '行政主管',
        approvedAt: dayjs().format('YYYY-MM-DD'),
      } : r
    ));
    if (approved) {
      const request = supplyRequests.find(r => r.id === id);
      if (request) {
        setSupplies(supplies.map(s => 
          s.id === request.supplyId ? { ...s, stock: s.stock - request.quantity } : s
        ));
      }
    }
    message.success(approved ? '已批准' : '已拒绝');
  };

  const getRequestStatusTag = (status: string) => {
    const map: Record<string, { color: string; text: string }> = {
      pending: { color: 'blue', text: '待审批' },
      approved: { color: 'green', text: '已批准' },
      rejected: { color: 'red', text: '已拒绝' },
      completed: { color: 'default', text: '已完成' },
    };
    const config = map[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // ==================== 统计数据 ====================

  const stats = useMemo(() => ({
    documents: {
      total: documents.length,
      totalSize: documents.reduce((sum, d) => sum + d.fileSize, 0),
      totalDownloads: documents.reduce((sum, d) => sum + d.downloads, 0),
    },
    announcements: {
      total: announcements.length,
      published: announcements.filter(a => a.status === 'published').length,
      totalViews: announcements.reduce((sum, a) => sum + a.viewCount, 0),
    },
    surveys: {
      total: surveys.length,
      active: surveys.filter(s => s.status === 'active').length,
      totalResponses: surveys.reduce((sum, s) => sum + s.responses.length, 0),
    },
    meetings: {
      rooms: meetingRooms.length,
      todayMeetings: meetings.filter(m => dayjs(m.startTime).isSame(dayjs(), 'day')).length,
      upcomingMeetings: meetings.filter(m => m.status === 'scheduled' && dayjs(m.startTime).isAfter(dayjs())).length,
    },
    supplies: {
      total: supplies.length,
      lowStock: supplies.filter(s => s.stock < s.safetyStock).length,
      pendingRequests: supplyRequests.filter(r => r.status === 'pending').length,
    },
  }), [documents, announcements, surveys, meetingRooms, meetings, supplies, supplyRequests]);

  // ==================== 渲染 ====================

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">综合事务管理</h1>
        <p className="text-gray-500 mt-1">管理文档、公告、问卷、会议、用品等综合事务</p>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">共享文档</span>}
              value={stats.documents.total}
              suffix="份"
              prefix={<FolderOutlined className="text-blue-500" />}
            />
            <div className="text-xs text-gray-400 mt-2">总下载 {stats.documents.totalDownloads} 次</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">已发布公告</span>}
              value={stats.announcements.published}
              suffix="条"
              prefix={<BellOutlined className="text-green-500" />}
            />
            <div className="text-xs text-gray-400 mt-2">总浏览 {stats.announcements.totalViews} 次</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">进行中问卷</span>}
              value={stats.surveys.active}
              suffix="份"
              prefix={<PieChartOutlined className="text-orange-500" />}
            />
            <div className="text-xs text-gray-400 mt-2">总参与 {stats.surveys.totalResponses} 人</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title={<span className="text-gray-600">今日会议</span>}
              value={stats.meetings.todayMeetings}
              suffix="场"
              prefix={<CalendarOutlined className="text-purple-500" />}
            />
            <div className="text-xs text-gray-400 mt-2">待开会议 {stats.meetings.upcomingMeetings} 场</div>
          </Card>
        </Col>
      </Row>

      {/* 主内容区 */}
      <Card className="shadow-sm">
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          {/* Tab 1: 文档管理 */}
          <TabPane 
            tab={<span><FolderOutlined /> 文档管理</span>} 
            key="documents"
          >
            <div className="flex gap-4">
              {/* 左侧文件夹树 */}
              <div className="w-64 border-r pr-4">
                <div className="mb-4 flex justify-between items-center">
                  <span className="font-medium text-gray-700">文件夹</span>
                  <Button type="primary" size="small" icon={<FolderAddOutlined />} onClick={handleAddFolder}>
                    新建
                  </Button>
                </div>
                <Tree
                  showIcon
                  defaultExpandAll
                  selectedKeys={selectedFolderId ? [selectedFolderId] : ['root']}
                  treeData={buildFolderTree()}
                  onSelect={(keys) => setSelectedFolderId(keys[0] as string || null)}
                />
              </div>
              
              {/* 右侧文档列表 */}
              <div className="flex-1">
                <div className="mb-4 flex justify-between items-center gap-4">
                  <Space>
                    <Input
                      placeholder="搜索文档..."
                      prefix={<SearchOutlined />}
                      value={documentSearchText}
                      onChange={e => setDocumentSearchText(e.target.value)}
                      className="w-64"
                    />
                    <Select value={documentTypeFilter} onChange={setDocumentTypeFilter} className="w-32">
                      <Option value="all">全部类型</Option>
                      <Option value="pdf">PDF</Option>
                      <Option value="doc">DOC</Option>
                      <Option value="docx">DOCX</Option>
                      <Option value="xlsx">XLSX</Option>
                      <Option value="xls">XLS</Option>
                    </Select>
                    <Select value={documentSortBy} onChange={setDocumentSortBy} className="w-32">
                      <Option value="date">按时间排序</Option>
                      <Option value="name">按名称排序</Option>
                      <Option value="size">按大小排序</Option>
                    </Select>
                  </Space>
                  <Button type="primary" icon={<UploadOutlined />} onClick={handleUploadDocument}>
                    上传文档
                  </Button>
                </div>

                <Table
                  dataSource={filteredDocuments}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: '文件名',
                      dataIndex: 'name',
                      key: 'name',
                      render: (text, record) => (
                        <Space>
                          {getFileTypeIcon(record.fileType)}
                          <span className="font-medium">{text}</span>
                        </Space>
                      ),
                    },
                    {
                      title: '类型',
                      dataIndex: 'fileType',
                      key: 'fileType',
                      width: 80,
                      render: (text) => <Tag>{text.toUpperCase()}</Tag>,
                    },
                    {
                      title: '大小',
                      dataIndex: 'fileSize',
                      key: 'fileSize',
                      width: 100,
                      render: (size) => formatFileSize(size),
                    },
                    {
                      title: '上传人',
                      dataIndex: 'uploadedBy',
                      key: 'uploadedBy',
                      width: 100,
                    },
                    {
                      title: '上传时间',
                      dataIndex: 'uploadedAt',
                      key: 'uploadedAt',
                      width: 120,
                    },
                    {
                      title: '下载',
                      dataIndex: 'downloads',
                      key: 'downloads',
                      width: 80,
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 150,
                      render: (_, record) => (
                        <Space>
                          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handlePreviewDocument(record)}>
                            预览
                          </Button>
                          <Button type="link" size="small" icon={<DownloadOutlined />}>
                            下载
                          </Button>
                          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteDocument(record)} />
                        </Space>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </TabPane>

          {/* Tab 2: 通知公告 */}
          <TabPane 
            tab={<span><BellOutlined /> 通知公告</span>} 
            key="announcements"
          >
            <div className="mb-4 flex justify-end">
              <Button type="primary" icon={<PlusOutlined />} onClick={handlePublishAnnouncement}>
                发布公告
              </Button>
            </div>

            <Table
              dataSource={announcements}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: '置顶',
                  dataIndex: 'isTop',
                  key: 'isTop',
                  width: 60,
                  render: (isTop) => isTop ? <Tag color="red">置顶</Tag> : null,
                },
                {
                  title: '标题',
                  dataIndex: 'title',
                  key: 'title',
                  render: (text, record) => (
                    <a onClick={() => handleViewAnnouncement(record)} className="text-blue-600 hover:text-blue-800">
                      {text}
                    </a>
                  ),
                },
                {
                  title: '分类',
                  dataIndex: 'category',
                  key: 'category',
                  width: 100,
                  render: (category) => getCategoryTag(category),
                },
                {
                  title: '发布人',
                  dataIndex: 'publisher',
                  key: 'publisher',
                  width: 100,
                },
                {
                  title: '发布时间',
                  dataIndex: 'publishDate',
                  key: 'publishDate',
                  width: 120,
                },
                {
                  title: '阅读数',
                  dataIndex: 'viewCount',
                  key: 'viewCount',
                  width: 80,
                  render: (count) => <span className="text-gray-500">{count}</span>,
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 80,
                  render: (status) => getStatusTag(status),
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 200,
                  render: (_, record) => (
                    <Space>
                      <Button type="link" size="small" onClick={() => handleToggleTop(record.id)}>
                        {record.isTop ? '取消置顶' : '置顶'}
                      </Button>
                      <Button type="link" size="small" onClick={() => handleEditAnnouncement(record)}>
                        编辑
                      </Button>
                      <Button type="link" size="small" onClick={() => { setSelectedSurvey(null as any); setReadRecordModalVisible(true); }}>
                        阅读情况
                      </Button>
                      {record.status === 'published' && (
                        <Button type="link" size="small" onClick={() => handleWithdrawAnnouncement(record.id)}>
                          撤回
                        </Button>
                      )}
                      <Button type="link" size="small" danger onClick={() => handleDeleteAnnouncement(record.id)}>
                        删除
                      </Button>
                    </Space>
                  ),
                },
              ]}
            />
          </TabPane>

          {/* Tab 3: 问卷投票 */}
          <TabPane 
            tab={<span><PieChartOutlined /> 问卷投票</span>} 
            key="surveys"
          >
            <div className="mb-4 flex justify-end">
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSurvey}>
                创建问卷
              </Button>
            </div>

            <Row gutter={[16, 16]}>
              {surveys.map(survey => (
                <Col xs={24} sm={12} lg={8} xl={6} key={survey.id}>
                  <Card
                    className="h-full hover:shadow-lg transition-shadow"
                    title={<div className="text-base font-medium truncate">{survey.title}</div>}
                    extra={(() => {
                      const statusMap: Record<string, { color: string; text: string }> = {
                        draft: { color: 'default', text: '草稿' },
                        active: { color: 'green', text: '进行中' },
                        paused: { color: 'orange', text: '已暂停' },
                        closed: { color: 'default', text: '已结束' },
                      };
                      const config = statusMap[survey.status];
                      return <Tag color={config.color}>{config.text}</Tag>;
                    })()}
                  >
                    <div className="space-y-3">
                      <p className="text-gray-500 text-sm line-clamp-2">{survey.description}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">题目数量</span>
                          <span>{survey.questions.length} 题</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">参与人数</span>
                          <span>{survey.responses.length} 人</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">截止时间</span>
                          <span>{survey.endTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">投票方式</span>
                          <span>{survey.isAnonymous ? '匿名' : '实名'}</span>
                        </div>
                      </div>
                      <Divider className="my-3" />
                      <Space wrap>
                        {survey.status === 'draft' && (
                          <Button type="primary" size="small" onClick={() => handleChangeSurveyStatus(survey.id, 'active')}>
                            发布
                          </Button>
                        )}
                        {survey.status === 'active' && (
                          <>
                            <Button size="small" onClick={() => handleVote(survey)}>投票</Button>
                            <Button size="small" onClick={() => handleViewSurveyResult(survey)}>统计</Button>
                            <Button size="small" onClick={() => handleChangeSurveyStatus(survey.id, 'paused')}>暂停</Button>
                          </>
                        )}
                        {survey.status === 'paused' && (
                          <>
                            <Button size="small" onClick={() => handleChangeSurveyStatus(survey.id, 'active')}>恢复</Button>
                            <Button size="small" onClick={() => handleChangeSurveyStatus(survey.id, 'closed')}>结束</Button>
                          </>
                        )}
                        {survey.status === 'draft' && (
                          <Button size="small" onClick={() => handleEditSurvey(survey)}>编辑</Button>
                        )}
                        <Button size="small" danger onClick={() => handleDeleteSurvey(survey.id)}>删除</Button>
                      </Space>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </TabPane>

          {/* Tab 4: 会议管理 */}
          <TabPane 
            tab={<span><CalendarOutlined /> 会议管理</span>} 
            key="meetings"
          >
            <Tabs defaultActiveKey="book" size="small">
              <TabPane tab="会议预约" key="book">
                <div className="mb-4 flex justify-between items-center">
                  <Space>
                    <Radio.Group value={meetingViewMode} onChange={e => setMeetingViewMode(e.target.value)}>
                      <Radio.Button value="list">列表视图</Radio.Button>
                      <Radio.Button value="calendar">日历视图</Radio.Button>
                    </Radio.Group>
                  </Space>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleBookMeeting}>
                    预约会议
                  </Button>
                </div>

                <Table
                  dataSource={meetings}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: '会议主题',
                      dataIndex: 'title',
                      key: 'title',
                      render: (text, record) => (
                        <Space>
                          <span className="font-medium">{text}</span>
                          {record.status === 'cancelled' && <Tag color="red">已取消</Tag>}
                        </Space>
                      ),
                    },
                    {
                      title: '会议室',
                      dataIndex: 'roomId',
                      key: 'roomId',
                      width: 120,
                      render: (roomId) => meetingRooms.find(r => r.id === roomId)?.name || '-',
                    },
                    {
                      title: '时间',
                      key: 'time',
                      width: 180,
                      render: (_, record) => (
                        <span>{dayjs(record.startTime).format('MM-DD HH:mm')} - {dayjs(record.endTime).format('HH:mm')}</span>
                      ),
                    },
                    {
                      title: '组织者',
                      dataIndex: 'organizer',
                      key: 'organizer',
                      width: 100,
                    },
                    {
                      title: '参会人数',
                      key: 'participants',
                      width: 100,
                      render: (_, record) => <span>{record.participants.length} 人</span>,
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      width: 80,
                      render: (status) => getMeetingStatusTag(status),
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 120,
                      render: (_, record) => (
                        <Space>
                          {record.status === 'scheduled' && (
                            <>
                              <Button type="link" size="small" onClick={() => handleEditMeeting(record)}>编辑</Button>
                              <Button type="link" size="small" danger onClick={() => handleCancelMeeting(record.id)}>取消</Button>
                            </>
                          )}
                        </Space>
                      ),
                    },
                  ]}
                />
              </TabPane>

              <TabPane tab="会议室管理" key="rooms">
                <div className="mb-4 flex justify-end">
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddMeetingRoom}>
                    添加会议室
                  </Button>
                </div>

                <Table
                  dataSource={meetingRooms}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: '会议室名称',
                      dataIndex: 'name',
                      key: 'name',
                      render: (text, record) => (
                        <Space>
                          <Avatar className="bg-blue-500" icon={<TeamOutlined />} />
                          <span className="font-medium">{text}</span>
                        </Space>
                      ),
                    },
                    {
                      title: '容量',
                      dataIndex: 'capacity',
                      key: 'capacity',
                      width: 80,
                      render: (capacity) => `${capacity} 人`,
                    },
                    {
                      title: '位置',
                      dataIndex: 'location',
                      key: 'location',
                      width: 120,
                    },
                    {
                      title: '设备',
                      dataIndex: 'equipment',
                      key: 'equipment',
                      width: 200,
                      render: (equipment: string[]) => (
                        <Space wrap>
                          {equipment.map((eq, i) => <Tag key={i}>{eq}</Tag>)}
                        </Space>
                      ),
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      width: 80,
                      render: (status) => getRoomStatusTag(status),
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 120,
                      render: (_, record) => (
                        <Space>
                          <Button type="link" size="small" onClick={() => handleEditMeetingRoom(record)}>编辑</Button>
                          <Button type="link" size="small" danger onClick={() => handleDeleteMeetingRoom(record.id)}>删除</Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </TabPane>
            </Tabs>
          </TabPane>

          {/* Tab 5: 用品领用 */}
          <TabPane 
            tab={<span><ShoppingCartOutlined /> 用品领用</span>} 
            key="supplies"
          >
            {stats.supplies.lowStock > 0 && (
              <Alert
                message={`有 ${stats.supplies.lowStock} 种用品库存不足，请及时补充`}
                type="warning"
                showIcon
                className="mb-4"
              />
            )}

            <Tabs activeKey={supplyViewTab} onChange={setSupplyViewTab}>
              <TabPane tab="库存管理" key="inventory">
                <div className="mb-4 flex justify-end">
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSupply}>
                    添加用品
                  </Button>
                </div>

                <Table
                  dataSource={supplies}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  rowClassName={(record) => record.stock < record.safetyStock ? 'bg-red-50' : ''}
                  columns={[
                    {
                      title: '用品名称',
                      dataIndex: 'name',
                      key: 'name',
                      render: (text) => <span className="font-medium">{text}</span>,
                    },
                    {
                      title: '分类',
                      dataIndex: 'category',
                      key: 'category',
                      width: 100,
                    },
                    {
                      title: '库存数量',
                      dataIndex: 'stock',
                      key: 'stock',
                      width: 100,
                      render: (stock, record) => (
                        <Space>
                          <span className={stock < record.safetyStock ? 'text-red-500 font-bold' : ''}>
                            {stock} {record.unit}
                          </span>
                          {stock < record.safetyStock && <Tag color="red">库存不足</Tag>}
                        </Space>
                      ),
                    },
                    {
                      title: '单价',
                      dataIndex: 'price',
                      key: 'price',
                      width: 80,
                      render: (price) => `¥${price}`,
                    },
                    {
                      title: '安全库存',
                      dataIndex: 'safetyStock',
                      key: 'safetyStock',
                      width: 100,
                      render: (safetyStock, record) => `${safetyStock} ${record.unit}`,
                    },
                    {
                      title: '供应商',
                      dataIndex: 'supplier',
                      key: 'supplier',
                      width: 100,
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 150,
                      render: (_, record) => (
                        <Space>
                          <Button type="link" size="small" onClick={() => handleEditSupply(record)}>编辑</Button>
                          <Button type="link" size="small" danger onClick={() => handleDeleteSupply(record.id)}>删除</Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </TabPane>

              <TabPane tab="领用申请" key="requests">
                <div className="mb-4 flex justify-between items-center">
                  <div className="text-gray-500">
                    待审批: <Tag color="blue">{stats.supplies.pendingRequests} 条</Tag>
                  </div>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateSupplyRequest}>
                    申请领用
                  </Button>
                </div>

                <Table
                  dataSource={supplyRequests}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  columns={[
                    {
                      title: '用品名称',
                      dataIndex: 'supplyName',
                      key: 'supplyName',
                    },
                    {
                      title: '数量',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      width: 80,
                    },
                    {
                      title: '申请人',
                      dataIndex: 'requesterName',
                      key: 'requesterName',
                      width: 100,
                    },
                    {
                      title: '用途',
                      dataIndex: 'purpose',
                      key: 'purpose',
                      width: 150,
                    },
                    {
                      title: '领取时间',
                      dataIndex: 'pickupTime',
                      key: 'pickupTime',
                      width: 120,
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      width: 80,
                      render: (status) => getRequestStatusTag(status),
                    },
                    {
                      title: '申请时间',
                      dataIndex: 'createdAt',
                      key: 'createdAt',
                      width: 120,
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 120,
                      render: (_, record) => (
                        record.status === 'pending' ? (
                          <Space>
                            <Button type="link" size="small" onClick={() => handleApproveRequest(record.id, true)}>
                              批准
                            </Button>
                            <Button type="link" size="small" danger onClick={() => handleApproveRequest(record.id, false)}>
                              拒绝
                            </Button>
                          </Space>
                        ) : null
                      ),
                    },
                  ]}
                />
              </TabPane>

              <TabPane tab="统计图表" key="statistics">
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="领用趋势（最近7天）" className="h-full">
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                        <div className="text-center text-gray-400">
                          <LineChartOutlined className="text-4xl mb-2" />
                          <p>图表数据加载中...</p>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="分类占比" className="h-full">
                      <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
                        <div className="text-center text-gray-400">
                          <PieChartOutlined className="text-4xl mb-2" />
                          <p>图表数据加载中...</p>
                        </div>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card title="领用排行TOP 10">
                      <Table
                        dataSource={supplies.slice(0, 10).map((s, i) => ({
                          ...s,
                          rank: i + 1,
                          usageCount: Math.floor(Math.random() * 100),
                        }))}
                        rowKey="id"
                        pagination={false}
                        size="small"
                        columns={[
                          { title: '排名', dataIndex: 'rank', key: 'rank', width: 60 },
                          { title: '用品名称', dataIndex: 'name', key: 'name' },
                          { title: '分类', dataIndex: 'category', key: 'category', width: 100 },
                          { title: '领用次数', dataIndex: 'usageCount', key: 'usageCount', width: 100 },
                        ]}
                      />
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </TabPane>
        </Tabs>
      </Card>

      {/* ==================== 弹窗组件 ==================== */}

      {/* 文件夹表单弹窗 */}
      <Modal
        title={editingFolder ? '编辑文件夹' : '新建文件夹'}
        open={folderModalVisible}
        onCancel={() => setFolderModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          initialValues={editingFolder || { permission: 'all' }}
          onFinish={handleSaveFolder}
        >
          <Form.Item name="name" label="文件夹名称" rules={[{ required: true }]}>
            <Input placeholder="请输入文件夹名称" />
          </Form.Item>
          <Form.Item name="permission" label="访问权限">
            <Select>
              <Option value="all">全员可见</Option>
              <Option value="department">指定部门</Option>
              <Option value="role">指定角色</Option>
            </Select>
          </Form.Item>
          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => 
              getFieldValue('permission') !== 'all' && (
                <Form.Item name="permissionValue" label={getFieldValue('permission') === 'department' ? '选择部门' : '选择角色'}>
                  <Select mode="multiple" placeholder="请选择">
                    {getFieldValue('permission') === 'department' ? (
                      <>
                        <Option value="人事部">人事部</Option>
                        <Option value="财务部">财务部</Option>
                        <Option value="技术部">技术部</Option>
                      </>
                    ) : (
                      <>
                        <Option value="总经理">总经理</Option>
                        <Option value="部门经理">部门经理</Option>
                        <Option value="财务经理">财务经理</Option>
                      </>
                    )}
                  </Select>
                </Form.Item>
              )
            }
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setFolderModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 上传文档弹窗 */}
      <Modal
        title="上传文档"
        open={documentModalVisible}
        onCancel={() => setDocumentModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form layout="vertical" onFinish={handleSaveDocument}>
          <Form.Item name="file" label="选择文件" rules={[{ required: true }]}>
            <Upload.Dragger beforeUpload={() => false} maxCount={1}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域</p>
              <p className="ant-upload-hint">支持 PDF、DOC、DOCX、XLSX、图片等格式</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入文档描述" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setDocumentModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">上传</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 文档预览弹窗 */}
      <Modal
        title={previewDocument?.name}
        open={!!previewDocument}
        onCancel={() => setPreviewDocument(null)}
        footer={null}
        width={900}
        centered
      >
        {previewDocument && (
          <div className="h-96 flex items-center justify-center bg-gray-50 rounded">
            {previewDocument.fileType === 'pdf' ? (
              <div className="text-center text-gray-400">
                <FileTextOutlined className="text-5xl text-red-400 mb-4" />
                <p>PDF 预览区域</p>
                <p className="text-sm">实际项目中可使用 iframe 嵌入 PDF 预览</p>
              </div>
            ) : previewDocument.fileType === 'doc' || previewDocument.fileType === 'docx' ? (
              <div className="text-center text-gray-400">
                <FileTextOutlined className="text-5xl text-blue-400 mb-4" />
                <p>Word 文档预览</p>
                <p className="text-sm">可使用微软在线预览服务</p>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <FileOutlined className="text-5xl mb-4" />
                <p>文件预览</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 公告表单弹窗 */}
      <Modal
        title={editingAnnouncement ? '编辑公告' : '发布公告'}
        open={announcementModalVisible}
        onCancel={() => setAnnouncementModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          layout="vertical"
          initialValues={editingAnnouncement || { category: 'company', status: 'published' }}
          onFinish={handleSaveAnnouncement}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="title" label="标题" rules={[{ required: true }]}>
                <Input placeholder="请输入公告标题" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="category" label="分类">
                <Select>
                  <Option value="company">公司公告</Option>
                  <Option value="hr">人事公告</Option>
                  <Option value="admin">行政公告</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <TextArea rows={8} placeholder="请输入公告内容（支持HTML格式）" />
          </Form.Item>
          <Form.Item name="publisher" label="发布人">
            <Input placeholder="请输入发布人" defaultValue="当前用户" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Radio.Group>
              <Radio value="draft">保存为草稿</Radio>
              <Radio value="published">立即发布</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setAnnouncementModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingAnnouncement ? '保存' : '发布'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 公告详情弹窗 */}
      <Modal
        title={null}
        open={!!viewingAnnouncement}
        onCancel={() => setViewingAnnouncement(null)}
        footer={null}
        width={700}
      >
        {viewingAnnouncement && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              {getCategoryTag(viewingAnnouncement.category)}
              {viewingAnnouncement.isTop && <Tag color="red">置顶</Tag>}
            </div>
            <h2 className="text-xl font-bold mb-4">{viewingAnnouncement.title}</h2>
            <div className="text-gray-500 text-sm mb-4 flex items-center gap-4">
              <span><UserOutlined /> {viewingAnnouncement.publisher}</span>
              <span><ClockCircleOutlined /> {viewingAnnouncement.publishDate}</span>
              <span><EyeOutlined /> {viewingAnnouncement.viewCount} 次阅读</span>
            </div>
            <Divider />
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: viewingAnnouncement.content }}
            />
          </div>
        )}
      </Modal>

      {/* 阅读情况弹窗 */}
      <Modal
        title="阅读情况统计"
        open={readRecordModalVisible}
        onCancel={() => setReadRecordModalVisible(false)}
        footer={null}
        width={600}
      >
        <Tabs>
          <TabPane tab="已读" key="read">
            <List
              dataSource={viewingAnnouncement?.readRecords || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.employeeName}
                    description={`阅读时间: ${item.readAt}`}
                  />
                </List.Item>
              )}
            />
          </TabPane>
          <TabPane tab="未读" key="unread">
            <List
              dataSource={[
                { id: '3', name: '王五' },
                { id: '4', name: '赵六' },
              ]}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.name}
                    description="尚未阅读"
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Modal>

      {/* 问卷表单弹窗 */}
      <Modal
        title={editingSurvey ? '编辑问卷' : '创建问卷'}
        open={surveyModalVisible}
        onCancel={() => setSurveyModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          layout="vertical"
          initialValues={editingSurvey || { isAnonymous: true, maxVotes: 1 }}
          onFinish={handleSaveSurvey}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="title" label="问卷标题" rules={[{ required: true }]}>
                <Input placeholder="请输入问卷标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endTime" label="截止时间">
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="问卷描述">
            <TextArea rows={3} placeholder="请输入问卷描述" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="isAnonymous" label="投票方式" valuePropName="checked">
                <Switch checkedChildren="匿名" unCheckedChildren="实名" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="maxVotes" label="每人投票次数">
                <InputNumber min={1} max={10} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Divider>题目设置</Divider>
          <Alert
            message="提示：创建问卷后可在草稿状态继续编辑题目"
            type="info"
            showIcon
            className="mb-4"
          />
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setSurveyModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingSurvey ? '保存' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 投票弹窗 */}
      <Modal
        title={selectedSurvey?.title}
        open={voteModalVisible}
        onCancel={() => setVoteModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedSurvey && (
          <Form layout="vertical">
            {selectedSurvey.questions.map((q, i) => (
              <Form.Item 
                key={q.id} 
                label={`${i + 1}. ${q.title}`}
                required={q.required}
              >
                {q.type === 'single' && (
                  <Radio.Group>
                    {q.options?.map((opt, j) => (
                      <Radio key={j} value={opt} className="block mb-2">{opt}</Radio>
                    ))}
                  </Radio.Group>
                )}
                {q.type === 'multiple' && (
                  <Checkbox.Group>
                    {q.options?.map((opt, j) => (
                      <Checkbox key={j} value={opt} className="block mb-2">{opt}</Checkbox>
                    ))}
                  </Checkbox.Group>
                )}
                {q.type === 'rating' && (
                  <Rate />
                )}
              </Form.Item>
            ))}
            <Form.Item className="mb-0 text-right">
              <Space>
                <Button onClick={() => setVoteModalVisible(false)}>取消</Button>
                <Button type="primary">提交投票</Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* 问卷结果弹窗 */}
      <Modal
        title={`统计结果 - ${selectedSurvey?.title}`}
        open={surveyResultVisible}
        onCancel={() => setSurveyResultVisible(false)}
        footer={null}
        width={800}
      >
        {selectedSurvey && (
          <div>
            <div className="mb-6">
              <Statistic title="参与人数" value={selectedSurvey.responses.length} />
            </div>
            {selectedSurvey.questions.map((q, i) => (
              <Card key={q.id} title={`${i + 1}. ${q.title}`} className="mb-4" size="small">
                {q.type === 'single' && q.options?.map((opt, j) => {
                  const count = selectedSurvey.responses.filter(r => r.answers[q.id] === opt).length;
                  const percent = selectedSurvey.responses.length > 0 
                    ? Math.round((count / selectedSurvey.responses.length) * 100) 
                    : 0;
                  return (
                    <div key={j} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span>{opt}</span>
                        <span>{count} 票 ({percent}%)</span>
                      </div>
                      <Progress percent={percent} showInfo={false} />
                    </div>
                  );
                })}
                {q.type === 'rating' && (
                  <Statistic 
                    title="平均评分" 
                    value={selectedSurvey.responses.length > 0 
                      ? (selectedSurvey.responses.reduce((sum, r) => sum + (r.answers[q.id] as number || 0), 0) / selectedSurvey.responses.length).toFixed(1)
                      : 0
                    } 
                    suffix="/ 5"
                  />
                )}
              </Card>
            ))}
          </div>
        )}
      </Modal>

      {/* 会议室表单弹窗 */}
      <Modal
        title={editingRoom ? '编辑会议室' : '添加会议室'}
        open={roomModalVisible}
        onCancel={() => setRoomModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          initialValues={editingRoom || { capacity: 10 }}
          onFinish={handleSaveMeetingRoom}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="会议室名称" rules={[{ required: true }]}>
                <Input placeholder="请输入会议室名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="capacity" label="容纳人数">
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="location" label="位置">
            <Input placeholder="如：3楼301室" />
          </Form.Item>
          <Form.Item name="equipment" label="设备">
            <Select mode="multiple" placeholder="请选择设备">
              <Option value="投影仪">投影仪</Option>
              <Option value="白板">白板</Option>
              <Option value="麦克风">麦克风</Option>
              <Option value="视频会议系统">视频会议系统</Option>
              <Option value="电视屏幕">电视屏幕</Option>
              <Option value="音响系统">音响系统</Option>
            </Select>
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setRoomModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 会议预约弹窗 */}
      <Modal
        title={editingMeeting ? '编辑会议' : '预约会议'}
        open={meetingModalVisible}
        onCancel={() => setMeetingModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          initialValues={editingMeeting || {}}
          onFinish={handleSaveMeeting}
        >
          <Form.Item name="title" label="会议主题" rules={[{ required: true }]}>
            <Input placeholder="请输入会议主题" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="roomId" label="会议室" rules={[{ required: true }]}>
                <Select placeholder="请选择会议室">
                  {meetingRooms.filter(r => r.status === 'available').map(r => (
                    <Option key={r.id} value={r.id}>{r.name} ({r.capacity}人)</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="participants" label="参会人">
                <Select mode="multiple" placeholder="请选择参会人">
                  <Option value="张三">张三</Option>
                  <Option value="李四">李四</Option>
                  <Option value="王五">王五</Option>
                  <Option value="赵六">赵六</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startTime" label="开始时间" rules={[{ required: true }]}>
                <DatePicker showTime className="w-full" format="YYYY-MM-DD HH:mm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endTime" label="结束时间" rules={[{ required: true }]}>
                <DatePicker showTime className="w-full" format="YYYY-MM-DD HH:mm" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="会议描述">
            <TextArea rows={3} placeholder="请输入会议描述" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setMeetingModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 用品表单弹窗 */}
      <Modal
        title={editingSupply ? '编辑用品' : '添加用品'}
        open={supplyModalVisible}
        onCancel={() => setSupplyModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          initialValues={editingSupply || { category: '办公用品' }}
          onFinish={handleSaveSupply}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="用品名称" rules={[{ required: true }]}>
                <Input placeholder="请输入用品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="category" label="分类">
                <Select>
                  <Option value="办公用品">办公用品</Option>
                  <Option value="清洁用品">清洁用品</Option>
                  <Option value="电子产品">电子产品</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="stock" label="库存数量">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="unit" label="单位">
                <Input placeholder="如：个、包" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="price" label="单价（元）">
                <InputNumber min={0} precision={2} className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="safetyStock" label="安全库存">
                <InputNumber min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="supplier" label="供应商">
                <Input placeholder="请输入供应商名称" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setSupplyModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 领用申请弹窗 */}
      <Modal
        title="申请领用"
        open={requestModalVisible}
        onCancel={() => setRequestModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form layout="vertical" onFinish={handleSaveSupplyRequest}>
          <Form.Item name="supplyId" label="选择用品" rules={[{ required: true }]}>
            <Select placeholder="请选择用品">
              {supplies.map(s => (
                <Option key={s.id} value={s.id}>
                  {s.name} (库存: {s.stock} {s.unit})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="pickupTime" label="领取时间" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="purpose" label="用途" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="请输入用途说明" />
          </Form.Item>
          <Form.Item className="mb-0 text-right">
            <Space>
              <Button onClick={() => setRequestModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">提交申请</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
