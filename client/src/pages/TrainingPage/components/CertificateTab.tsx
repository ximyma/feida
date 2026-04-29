/**
 * 证书管理组件
 * 证书列表、证书预览、证书生成
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  Card, Table, Tag, Button, Space, Typography, Empty, Spin, 
  Modal, Descriptions, Badge, Tooltip, message, Tabs, Row, Col,
  Select, DatePicker, QRCode, Divider, Statistic
} from 'antd';
import {
  TrophyOutlined, DownloadOutlined, PrinterOutlined, EyeOutlined,
  ClockCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined,
  SafetyCertificateOutlined, UploadOutlined, CameraOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// 导出为图片的库
import html2canvas from 'html2canvas';

const { Text, Title, Paragraph } = Typography;
const { TabPane } = Tabs;

// API 请求封装
const api = {
  get: (url: string) => fetch(`/api${url}`).then(r => r.json()),
  post: (url: string, data: any) => fetch(`/api${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
};

// 证书模板类型
type CertificateTemplate = 'standard' | 'honor' | 'completion' | 'skill';

interface Certificate {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeDept?: string;
  courseId: string;
  courseName: string;
  courseType?: string; // text/video/live
  credit?: number;
  template: CertificateTemplate;
  issueDate: string;
  expiryDate?: string; // 可选，有效期
  certificateNo: string; // 证书编号
  status: 'active' | 'expired' | 'revoked';
  qrCode?: string; // 验证二维码
  issuedBy: string; // 签发人
  createdAt: string;
}

interface CertificateTabProps {
  currentUserId: string;
  currentUserName: string;
  isAdmin?: boolean;
}

export default function CertificateTab({ currentUserId, currentUserName, isAdmin = false }: CertificateTabProps) {
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('my');
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCertificates();
  }, [activeTab]);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/training/certificates');
      const data = await res.json();
      if (data.success) {
        setCertificates(data.data || []);
      } else {
        console.error('加载证书失败:', data.message);
      }
    } catch (error) {
      console.error('加载证书失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setPreviewVisible(true);
  };

  const handleDownload = async (certificate: Certificate) => {
    if (!certificateRef.current) return;
    
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // 高清
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `certificate_${certificate.certificateNo}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      message.success('证书下载成功');
    } catch (error) {
      message.error('下载失败，请重试');
    }
  };

  const handlePrint = (certificate: Certificate) => {
    if (!certificateRef.current) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('请允许弹出窗口');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>证书打印 - ${certificate.certificateNo}</title>
          <style>
            body { margin: 0; padding: 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${certificateRef.current.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // 证书模板渲染
  const renderCertificateTemplate = (cert: Certificate) => {
    const templateStyles: Record<CertificateTemplate, React.CSSProperties> = {
      standard: {
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        border: '3px solid #4a90e2'
      },
      honor: {
        background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
        border: '4px solid #d4af37'
      },
      completion: {
        background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
        border: '3px solid #667eea'
      },
      skill: {
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        border: '3px solid #fa709a'
      }
    };

    const templateColors: Record<CertificateTemplate, string> = {
      standard: '#4a90e2',
      honor: '#d4af37',
      completion: '#667eea',
      skill: '#fa709a'
    };

    return (
      <div 
        ref={certificateRef}
        style={{ 
          width: 800, 
          height: 600, 
          padding: 40, 
          boxSizing: 'border-box',
          fontFamily: '"Microsoft YaHei", "SimSun", serif',
          textAlign: 'center',
          position: 'relative',
          ...templateStyles[cert.template]
        }}
      >
        {/* 顶部装饰 */}
        <div style={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          right: 20,
          height: 4,
          background: templateColors[cert.template],
          borderRadius: 2
        }} />
        
        {/* 标题区域 */}
        <div style={{ marginTop: 30 }}>
          <SafetyCertificateOutlined style={{ fontSize: 48, color: templateColors[cert.template] }} />
          <Title level={2} style={{ margin: '16px 0 8px', color: templateColors[cert.template] }}>
            {cert.template === 'honor' ? '荣 誉 证 书' : '完 成 证 书'}
          </Title>
          <Text type="secondary">Certificate of Completion</Text>
        </div>
        
        <Divider style={{ margin: '24px 60px', borderColor: templateColors[cert.template] }} />
        
        {/* 证书内容 */}
        <div style={{ margin: '0 60px', textAlign: 'center' }}>
          <Paragraph style={{ fontSize: 16, marginBottom: 16 }}>
            兹证明
          </Paragraph>
          
          <Title level={3} style={{ color: '#333', margin: '16px 0' }}>
            {cert.employeeName}
          </Title>
          
          <Paragraph style={{ fontSize: 16 }}>
            已完成 <strong style={{ color: templateColors[cert.template] }}>{cert.courseName}</strong> 培训课程
          </Paragraph>
          
          <Descriptions 
            layout="horizontal" 
            size="small"
            colon={false}
            style={{ marginTop: 24 }}
            labelStyle={{ width: 120, fontWeight: 'bold' }}
          >
            <Descriptions.Item label="培训日期">{dayjs(cert.issueDate).format('YYYY年MM月DD日')}</Descriptions.Item>
            <Descriptions.Item label="获得学分">{cert.credit} 学分</Descriptions.Item>
            {cert.expiryDate && <Descriptions.Item label="有效期至">{dayjs(cert.expiryDate).format('YYYY年MM月DD日')}</Descriptions.Item>}
          </Descriptions>
        </div>
        
        {/* 底部信息 */}
        <div style={{ 
          position: 'absolute', 
          bottom: 40, 
          left: 60, 
          right: 60,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}>
          <div style={{ textAlign: 'left' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>签发机构: 飞达培训学院</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>签发人: {cert.issuedBy}</Text>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <QRCode 
              value={`https://feida.com/verify/${cert.certificateNo}`}
              size={80}
              style={{ marginBottom: 4 }}
            />
            <Text type="secondary" style={{ fontSize: 10 }}>扫码验证</Text>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 12 }}>{cert.certificateNo}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>有效期至: {dayjs(cert.issueDate).add(2, 'year').format('YYYY-MM-DD')}</Text>
          </div>
        </div>
        
        {/* 底部装饰线 */}
        <div style={{ 
          position: 'absolute', 
          bottom: 20, 
          left: 20, 
          right: 20,
          height: 4,
          background: templateColors[cert.template],
          borderRadius: 2
        }} />
      </div>
    );
  };

  // 表格列定义
  const columns = [
    {
      title: '证书编号',
      dataIndex: 'certificateNo',
      width: 200,
      render: (no: string) => <Text code>{no}</Text>
    },
    {
      title: '姓名',
      dataIndex: 'employeeName',
      width: 100,
      render: (name: string, record: Certificate) => (
        <Space>
          {name}
          {record.employeeId === currentUserId && <Tag color="blue">本人</Tag>}
        </Space>
      )
    },
    {
      title: '课程',
      dataIndex: 'courseName',
      width: 200,
      ellipsis: true
    },
    {
      title: '学分',
      dataIndex: 'credit',
      width: 80,
      render: (c: number) => <Tag color="gold">{c}学分</Tag>
    },
    {
      title: '签发日期',
      dataIndex: 'issueDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => {
        const map: Record<string, { color: string; text: string }> = {
          active: { color: 'green', text: '有效' },
          expired: { color: 'orange', text: '已过期' },
          revoked: { color: 'red', text: '已撤销' }
        };
        const config = map[status] || { color: 'default', text: status };
        return <Badge status="default" text={<Tag color={config.color}>{config.text}</Tag>} />;
      }
    },
    {
      title: '操作',
      width: 180,
      render: (_: any, record: Certificate) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          {record.status === 'active' && (
            <>
              <Button 
                type="link" 
                size="small" 
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(record)}
              >
                下载
              </Button>
              <Tooltip title="打印需要浏览器允许弹出窗口">
                <Button 
                  type="link" 
                  size="small" 
                  icon={<PrinterOutlined />}
                  onClick={() => handlePrint(record)}
                >
                  打印
                </Button>
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ];

  const filteredCertificates = activeTab === 'my' 
    ? certificates.filter(c => c.employeeId === currentUserId)
    : certificates;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载证书数据中...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 统计概览 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="我的证书" 
              value={certificates.filter(c => c.employeeId === currentUserId).length}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="有效证书" 
              value={certificates.filter(c => c.employeeId === currentUserId && c.status === 'active').length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="累计学分" 
              value={certificates.filter(c => c.employeeId === currentUserId && c.status === 'active').reduce((s, c) => s + (c.credit || 0), 0)}
              suffix="分"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic 
              title="本月新增" 
              value={certificates.filter(c => c.employeeId === currentUserId && dayjs(c.issueDate).isSame(dayjs(), 'month')).length}
              prefix={<UploadOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 证书标签页 */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarExtraContent={
            isAdmin && (
              <Button type="primary" icon={<UploadOutlined />}>
                批量颁发
              </Button>
            )
          }
        >
          <TabPane tab="我的证书" key="my">
            {filteredCertificates.length === 0 ? (
              <Empty description="暂未获得任何证书" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button type="primary" onClick={() => setActiveTab('course')}>
                  去学习
                </Button>
              </Empty>
            ) : (
              <Table 
                dataSource={filteredCertificates}
                rowKey="id"
                columns={columns}
                pagination={{ pageSize: 10 }}
              />
            )}
          </TabPane>
          {isAdmin && (
            <TabPane tab="全部证书" key="all">
              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Select placeholder="筛选状态" style={{ width: 120 }} allowClear>
                    <Select.Option value="active">有效</Select.Option>
                    <Select.Option value="expired">已过期</Select.Option>
                    <Select.Option value="revoked">已撤销</Select.Option>
                  </Select>
                  <DatePicker.RangePicker />
                </Space>
              </div>
              <Table 
                dataSource={filteredCertificates}
                rowKey="id"
                columns={columns}
                pagination={{ pageSize: 10 }}
              />
            </TabPane>
          )}
        </Tabs>
      </Card>

      {/* 证书预览弹窗 */}
      <Modal
        title="证书预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={() => selectedCertificate && handlePrint(selectedCertificate)}>
            打印
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={() => selectedCertificate && handleDownload(selectedCertificate)}>
            下载
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>关闭</Button>
        ]}
        width={900}
        destroyOnClose
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          background: '#f0f0f0', 
          padding: 24,
          borderRadius: 8
        }}>
          {selectedCertificate && renderCertificateTemplate(selectedCertificate)}
        </div>
      </Modal>
    </div>
  );
}