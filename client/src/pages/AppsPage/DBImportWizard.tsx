/**
 * DBImportWizard — 外部数据库导入向导
 * 连接外部数据库，浏览表，一键导入为低代码应用
 */
import React, { useState } from 'react';
import { Card, Form, Input, Select, Button, Space, Typography, Table, Tag, Steps, Empty, Spin, message, Checkbox, Divider } from 'antd';
import { DatabaseOutlined, SearchOutlined, ImportOutlined, LinkOutlined, FileAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const BASE = '/api';

const DB_TYPE_OPTIONS = [
  { label: 'SQLite', value: 'sqlite' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'PostgreSQL', value: 'pg' },
];

interface ScannedTable {
  name: string; columns: number;
  fields: Array<{ name: string; type: string; pk: boolean }>;
}

const DBImportWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dbType, setDbType] = useState('sqlite');
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('');
  const [dbName, setDbName] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPass, setDbPass] = useState('');
  const [scanning, setScanning] = useState(false);
  const [tables, setTables] = useState<ScannedTable[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);

  const scanDatabase = async () => {
    if (dbType === 'sqlite' && !dbName) { message.error('请输入SQLite文件路径'); return; }
    if (dbType !== 'sqlite' && (!dbHost || !dbName)) { message.error('填写连接信息'); return; }
    setScanning(true);
    try {
      const body: any = { type: dbType };
      if (dbType === 'sqlite') body.filepath = dbName;
      else { body.host = dbHost; body.port = parseInt(dbPort) || undefined; body.database = dbName; body.user = dbUser; body.password = dbPass; }
      
      const r = await fetch(`${BASE}/db/scan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const j = await r.json();
      if (j.error) { message.error(j.error); setScanning(false); return; }
      setTables(j.tables || []);
      setStep(1);
      message.success(`扫描到 ${j.tables.length} 个表`);
    } catch (e: any) { message.error(e.message); }
    setScanning(false);
  };

  const importTables = async () => {
    if (selectedKeys.length === 0) { message.error('至少选择一个表'); return; }
    setImporting(true);
    try {
      let imported = 0;
      for (const tableName of selectedKeys) {
        const table = tables.find(t => t.name === tableName);
        if (!table) continue;

        // 为每个表创建独立应用
        const moduleName = 'app_db_' + tableName.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
        const fields: Record<string, any> = {};
        for (const f of table.fields) {
          if (f.name === 'id') continue;
          let type = 'char';
          const ft = (f.type || '').toLowerCase();
          if (ft.includes('int')) type = 'integer';
          else if (ft.includes('real') || ft.includes('float') || ft.includes('double') || ft.includes('decimal') || ft.includes('numeric')) type = 'float';
          else if (ft.includes('bool')) type = 'boolean';
          else if (ft.includes('date') || ft.includes('time')) type = 'date';
          else if (ft.includes('text') || ft.includes('clob') || ft.includes('blob')) type = 'text';
          fields[f.name] = { type, label: f.name, required: !!f.pk };
        }

        const models = [{ _name: tableName, _description: tableName, _fields: fields }];
        await fetch(`${BASE}/lowcode/create-module`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleName, models }),
        });
        await fetch(`${BASE}/lowcode/save-app-config`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleName, config: { name: tableName, description: '从数据库导入', icon: '🗄️', color: '#1677ff',
            menu: [{ label: tableName, table: tableName, icon: '📋', desc: '' }] } }),
        });
        await fetch(`${BASE}/lowcode/deploy`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ moduleName }),
        });
        imported++;
      }
      message.success({ content: `已导入 ${imported}/${selectedKeys.length} 个表为应用。按 F5 刷新后在应用管理查看`, duration: 6 });
      setStep(2);
    } catch (e: any) { message.error(e.message); }
    setImporting(false);
  };

  const colDefs = [
    { title: '表名', dataIndex: 'name', render: (v:string) => <Text code strong>{v}</Text> },
    { title: '列数', dataIndex: 'columns', width: 80, align: 'center' as const, render: (v:number) => <Tag color="blue">{v}</Tag> },
    { title: '字段预览', dataIndex: 'fields', ellipsis: true, render: (fields: any[]) => fields?.slice(0, 8).map(f => f.name + ' (' + f.type + ')').join(', ') + (fields?.length > 8 ? '...' : '') },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Title level={3}><DatabaseOutlined /> 外部数据库导入</Title>
      <Text type="secondary">连接外部数据库，浏览和选择数据表，一键生成低代码应用</Text>

      <Steps current={step} size="small" style={{ margin: '24px 0 16px' }}
        items={[{ title: '连接数据库' }, { title: '选择数据表' }, { title: '完成' }]} />

      {step === 0 && (
        <Card>
          <Form layout="vertical" style={{ maxWidth: 600 }}>
            <Form.Item label="数据库类型">
              <Select value={dbType} onChange={v => { setDbType(v); setDbPort(v === 'sqlite' ? '' : v === 'mysql' ? '3306' : '5432'); }}
                options={DB_TYPE_OPTIONS} />
            </Form.Item>
            {dbType === 'sqlite' ? (
              <Form.Item label="数据库文件路径" help="如: D:/data/mydb.sqlite 或 data/ehr.db">
                <Input value={dbName} onChange={e => setDbName(e.target.value)} placeholder="D:/data/mydb.sqlite" />
              </Form.Item>
            ) : (
              <>
                <Form.Item label="主机"><Input value={dbHost} onChange={e => setDbHost(e.target.value)} /></Form.Item>
                <Form.Item label="端口"><Input value={dbPort} onChange={e => setDbPort(e.target.value)} /></Form.Item>
                <Form.Item label="数据库名"><Input value={dbName} onChange={e => setDbName(e.target.value)} /></Form.Item>
                <Form.Item label="用户名"><Input value={dbUser} onChange={e => setDbUser(e.target.value)} /></Form.Item>
                <Form.Item label="密码"><Input.Password value={dbPass} onChange={e => setDbPass(e.target.value)} /></Form.Item>
              </>
            )}
            <Button type="primary" icon={<SearchOutlined />} loading={scanning} onClick={scanDatabase}>
              扫描数据表
            </Button>
          </Form>
        </Card>
      )}

      {step === 1 && tables.length > 0 && (
        <>
          <div style={{ marginBottom: 12 }}>
            <Checkbox checked={selectedKeys.length === tables.length}
              indeterminate={selectedKeys.length > 0 && selectedKeys.length < tables.length}
              onChange={e => setSelectedKeys(e.target.checked ? tables.map(t => t.name) : [])}>
              全选 ({selectedKeys.length}/{tables.length})
            </Checkbox>
          </div>
          <Card>
            <Table dataSource={tables} rowKey="name" columns={colDefs} size="small" pagination={{ pageSize: 15 }}
              rowSelection={{ selectedRowKeys: selectedKeys, onChange: keys => setSelectedKeys(keys as string[]) }} />
            <Divider />
            <Space>
              <Button type="primary" icon={<ImportOutlined />} loading={importing} disabled={selectedKeys.length === 0}
                onClick={importTables}>导入 {selectedKeys.length} 个表为应用</Button>
              <Button onClick={() => { setStep(0); setTables([]); }}>返回修改</Button>
            </Space>
          </Card>
        </>
      )}

      {step === 2 && (
        <Card>
          <Empty description="导入完成" image={Empty.PRESENTED_IMAGE_SIMPLE}>
            <Space direction="vertical">
              <Text>已成功导入 {selectedKeys.length} 个数据表为应用</Text>
              <Text type="secondary">请按 F5 刷新页面，然后在应用管理中查看新建的应用</Text>
              <Button type="primary" onClick={() => navigate('/apps-manager')}>前往应用管理</Button>
            </Space>
          </Empty>
        </Card>
      )}
    </div>
  );
};

export default DBImportWizard;
