/**
 * OdooModelBrowser — 模型集成中心
 * 
 * 三个Tab:
 *   Tab1 - Odoo模块浏览器: 浏览/搜索已有模块, 导入.py源文件, 一键转为应用
 *   Tab2 - 数据库表导入: 连接外部数据库, 导入表为应用
 */
import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Tag, Empty, Spin, message, Modal, Input, Collapse, Table, Upload, Tabs, Tooltip, Steps, Form, Select } from 'antd';
import { AppstoreOutlined, EyeOutlined, ReloadOutlined, UploadOutlined, FolderOpenOutlined, InboxOutlined, ImportOutlined, RocketOutlined, DatabaseOutlined, LinkOutlined, FileAddOutlined, TableOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const BASE = '/api';

interface OdooModule {
  name: string; label: string;
  models: Array<{ name: string; description: string; fields: number }>;
}

const DB_TYPE_OPTIONS = [
  { label: 'SQLite', value: 'sqlite' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'PostgreSQL', value: 'pg' },
];

const OdooModelBrowser: React.FC = () => {
  const navigate = useNavigate();
  const [modules, setModules] = useState<OdooModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string[]>([]);

  // Odoo import
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPath, setImportPath] = useState('');
  const [importFiles, setImportFiles] = useState<File[]>([]);
  const [importingOdoo, setImportingOdoo] = useState(false);

  // DB import
  const [dbType, setDbType] = useState('sqlite');
  const [dbHost, setDbHost] = useState('localhost');
  const [dbPort, setDbPort] = useState('');
  const [dbName, setDbName] = useState('');
  const [dbUser, setDbUser] = useState('');
  const [dbPass, setDbPass] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedTables, setScannedTables] = useState<any[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [importingTables, setImportingTables] = useState(false);

  // 一键导入 model as app
  const [quickImportModel, setQuickImportModel] = useState<string | null>(null);

  const loadModules = async () => {
    setLoading(true);
    try { const r = await fetch(`${BASE}/odoo/modules`); setModules(await r.json()); } 
    catch { message.error('加载失败'); }
    setLoading(false);
  };

  useEffect(() => { loadModules(); }, []);

  const filtered = modules.filter(m => !search || m.label.includes(search) || m.models.some(md => md.name.includes(search)));

  // Odoo .py 导入
  const handleOdooImport = async () => {
    setImportingOdoo(true);
    try {
      const fd = new FormData();
      if (importPath) fd.append('folderPath', importPath);
      else if (importFiles.length > 0) importFiles.forEach(f => fd.append('files', f));
      else { message.error('请填路径或上传文件'); setImportingOdoo(false); return; }
      const r = await fetch(`${BASE}/odoo/import`, { method: 'POST', body: fd });
      const j = await r.json();
      if (j.error) { message.error(j.error); } else {
        message.success({ content: `已导入 "${j.module}" (${j.models}模型 ${j.fields}字段)`, duration: 5 });
        setImportModalOpen(false); setImportPath(''); setImportFiles([]); loadModules();
      }
    } catch (e: any) { message.error(e.message); }
    setImportingOdoo(false);
  };

  // 一键: Odoo model → 低代码应用
  const quickAsApp = async (modelName: string) => {
    setQuickImportModel(modelName);
    try {
      const r1 = await fetch(`${BASE}/odoo/model/${modelName}`);
      const def = await r1.json();
      if (def.error) { message.error(def.error); setQuickImportModel(null); return; }

      const fields = def.fields || {};
      const flds: Record<string,any> = {};
      for (const [k,v] of Object.entries(fields)) { if (k!=='id') flds[k] = v; }

      const moduleName = 'app_odoo_' + modelName.replace(/\./g,'_');
      await fetch(`${BASE}/lowcode/create-module`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ moduleName, models:[{ _name:modelName, _description:def.description||modelName, _fields:flds }] }) });
      await fetch(`${BASE}/lowcode/save-app-config`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ moduleName, config:{ name:def.description||modelName, description:'Odoo导入: '+modelName, icon:'📦', menu:[{label:def.description||modelName, table:modelName, icon:'📋'}] } }) });
      await fetch(`${BASE}/lowcode/deploy`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ moduleName }) });

      message.success({ content: `🎉 应用创建成功！按 F5 刷新后在「应用管理」查看`, duration: 6 });
    } catch (e: any) { message.error(e.message); }
    setQuickImportModel(null);
  };

  // DB 扫描
  const scanDatabase = async () => {
    if (dbType==='sqlite' && !dbName) { message.error('输入文件路径'); return; }
    setScanning(true);
    try {
      const body: any = { type: dbType };
      if (dbType==='sqlite') body.filepath = dbName;
      else { body.host=dbHost; body.port=parseInt(dbPort)||undefined; body.database=dbName; body.user=dbUser; body.password=dbPass; }
      const r = await fetch(`${BASE}/db/scan`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const j = await r.json();
      if (j.error) { message.error(j.error); } else { setScannedTables(j.tables||[]); message.success(`扫描到 ${j.tables.length} 个表`); }
    } catch (e: any) { message.error(e.message); }
    setScanning(false);
  };

  // DB 导入为应用
  const importTablesAsApps = async () => {
    if (selectedTables.length===0) { message.error('选择至少一个表'); return; }
    setImportingTables(true);
    let imported = 0;
    for (const tn of selectedTables) {
      const t = scannedTables.find((x:any)=>x.name===tn); if (!t) continue;
      const mn = 'app_db_'+tn.replace(/[^a-zA-Z0-9_]/g,'_').toLowerCase();
      const flds: Record<string,any> = {};
      for (const f of t.fields) {
        if (f.name==='id') continue;
        let type='char'; const ft=(f.type||'').toLowerCase();
        if (ft.includes('int')) type='integer'; else if (ft.includes('real')||ft.includes('float')||ft.includes('double')||ft.includes('numeric')) type='float';
        else if (ft.includes('bool')) type='boolean'; else if (ft.includes('date')||ft.includes('time')) type='date';
        else if (ft.includes('text')||ft.includes('clob')) type='text';
        flds[f.name]={type,label:f.name};
      }
      await fetch(`${BASE}/lowcode/create-module`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({moduleName:mn,models:[{_name:tn,_description:tn,_fields:flds}]})});
      await fetch(`${BASE}/lowcode/save-app-config`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({moduleName:mn,config:{name:tn,description:'DB导入',icon:'🗄️',menu:[{label:tn,table:tn,icon:'📋'}]}})});
      await fetch(`${BASE}/lowcode/deploy`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({moduleName:mn})});
      imported++;
    }
    message.success({ content: `已导入 ${imported}/${selectedTables.length} 表为应用。按 F5 刷新后查看`, duration: 6 });
    setScannedTables([]); setSelectedTables([]);
    setImportingTables(false);
  };

  const totalModels = modules.reduce((s,m)=>s+m.models.length,0);
  const totalFields = modules.reduce((s,m)=>s+m.models.reduce((ss,md)=>ss+md.fields,0),0);

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <Title level={3}><AppstoreOutlined /> 模型集成中心</Title>
          <Text type="secondary">{modules.length} 模块 / {totalModels} 模型 / {totalFields} 字段</Text>
        </div>
        <Space>
          <Button type="primary" onClick={() => setImportModalOpen(true)} icon={<UploadOutlined />}>导入 Odoo 模块 (.py)</Button>
          <Button onClick={() => navigate('/apps-manager')}>应用管理</Button>
        </Space>
      </div>

      <Tabs defaultActiveKey="odoo" size="large" items={[
        {
          key: 'odoo', label: <span><AppstoreOutlined /> Odoo 模块浏览器</span>,
          children: (
            <>
              <Input.Search placeholder="搜索模块或模型..." allowClear onSearch={setSearch} style={{ marginBottom: 16, maxWidth: 400 }} />
              {loading ? <Spin size="large" style={{ display:'block', margin:'60px auto' }} /> :
               filtered.length===0 ? <Empty description="无匹配" /> : (
                <Collapse activeKey={expanded} onChange={keys => setExpanded(keys as string[])}>
                  {filtered.map(mod => (
                    <Collapse.Panel key={mod.name} header={
                      <Space><strong>{mod.label}</strong><Tag>{mod.models.length}模型</Tag><Tag color="blue">{mod.models.reduce((s,m)=>s+m.fields,0)}字段</Tag></Space>
                    }>
                      <Table dataSource={mod.models} rowKey="name" size="small" pagination={false}
                        columns={[
                          { title:'模型名',dataIndex:'name',render:(v:string)=><Text code>{v}</Text> },
                          { title:'描述',dataIndex:'description',ellipsis:true },
                          { title:'字段',dataIndex:'fields',width:70,align:'center' as const,render:(v:number)=><Tag color="green">{v}</Tag> },
                          { title:'操作',width:200,render:(_:any,r:any)=>(
                            <Space size={4}>
                              <Button size="small" icon={<EyeOutlined/>} onClick={async()=>{
                                const re=await fetch(`${BASE}/odoo/model/${r.name}`); const d=await re.json();
                                Modal.info({title:d.model||r.name,content:<div>{Object.entries(d.fields||{}).map(([k,v]:any)=><Tag key={k}>{k}:{v.type}</Tag>)}</div>,width:600});
                              }}>字段</Button>
                              <Button size="small" type="primary" icon={<RocketOutlined/>} loading={quickImportModel===r.name} onClick={()=>quickAsApp(r.name)}>创建应用</Button>
                            </Space>
                          )},
                        ]} />
                    </Collapse.Panel>
                  ))}
                </Collapse>
              )}
            </>
          )
        },
        {
          key: 'db', label: <span><DatabaseOutlined /> 数据库表导入</span>,
          children: (
            <div>
              <Card style={{ maxWidth: 600 }}>
                <Form layout="vertical">
                  <Form.Item label="数据库类型">
                    <Select value={dbType} onChange={v=>{setDbType(v);setDbPort(v==='sqlite'?'':v==='mysql'?'3306':'5432')}} options={DB_TYPE_OPTIONS}/>
                  </Form.Item>
                  {dbType==='sqlite' ? (
                    <Form.Item label="数据库文件路径" help="如: D:/data/mydb.sqlite">
                      <Input value={dbName} onChange={e=>setDbName(e.target.value)} placeholder="D:/data/mydb.sqlite"/>
                    </Form.Item>
                  ) : (<>
                    <Form.Item label="主机"><Input value={dbHost} onChange={e=>setDbHost(e.target.value)}/></Form.Item>
                    <Form.Item label="端口"><Input value={dbPort} onChange={e=>setDbPort(e.target.value)}/></Form.Item>
                    <Form.Item label="数据库名"><Input value={dbName} onChange={e=>setDbName(e.target.value)}/></Form.Item>
                    <Form.Item label="用户名"><Input value={dbUser} onChange={e=>setDbUser(e.target.value)}/></Form.Item>
                    <Form.Item label="密码"><Input.Password value={dbPass} onChange={e=>setDbPass(e.target.value)}/></Form.Item>
                  </>)}
                  <Button type="primary" icon={<LinkOutlined/>} loading={scanning} onClick={scanDatabase}>扫描数据表</Button>
                </Form>
              </Card>
              {scannedTables.length > 0 && <Card style={{ marginTop: 16 }}>
                <div style={{ marginBottom: 12 }}><Text strong>{scannedTables.length} 个表</Text></div>
                <Table dataSource={scannedTables} rowKey="name" size="small" pagination={{ pageSize: 15 }}
                  rowSelection={{ selectedRowKeys: selectedTables, onChange: keys => setSelectedTables(keys as string[]) }}
                  columns={[
                    { title:'表名',dataIndex:'name',render:(v:string)=><Text code strong>{v}</Text> },
                    { title:'列',dataIndex:'columns',width:60,align:'center' as const,render:(v:number)=><Tag color="blue">{v}</Tag> },
                    { title:'字段预览',dataIndex:'fields',ellipsis:true,render:(fs:any[])=>fs?.slice(0,6).map(f=>f.name+'('+f.type+')').join(', ')+(fs?.length>6?'...':'') },
                  ]} />
                <div style={{ marginTop: 12 }}>
                  <Button type="primary" icon={<FileAddOutlined/>} loading={importingTables} disabled={selectedTables.length===0}
                    onClick={importTablesAsApps}>导入 {selectedTables.length} 个表为应用</Button>
                  <Button onClick={()=>{setScannedTables([]);setSelectedTables([]);}} style={{ marginLeft: 8 }}>清除</Button>
                </div>
              </Card>}
            </div>
          )
        },
      ]} />

      {/* Odoo .py import modal */}
      <Modal title="导入 Odoo Python 模型" open={importModalOpen} onCancel={()=>setImportModalOpen(false)} footer={null} width={600}>
        <Tabs items={[
          { key:'path', label:'服务器路径', children:(
            <Space direction="vertical" style={{width:'100%'}}>
              <Text type="secondary">指定 Odoo 模块目录（含 models/*.py）</Text>
              <Input placeholder="D:\odoo\addons\crm" value={importPath} onChange={e=>setImportPath(e.target.value)} prefix={<FolderOpenOutlined/>}/>
            </Space>
          )},
          { key:'upload', label:'上传 .py 文件', children:(
            <Upload.Dragger accept=".py" multiple maxCount={50} beforeUpload={f=>{setImportFiles(p=>[...p,f]);return false}}
              fileList={importFiles.map((f,i)=>({uid:String(i),name:f.name,status:'done' as const}))}
              onRemove={f=>setImportFiles(importFiles.filter((_,i)=>String(i)!==f.uid))}>
              <p className="ant-upload-drag-icon"><InboxOutlined/></p>
              <p className="ant-upload-text">拖拽 .py 模型文件</p>
            </Upload.Dragger>
          )},
        ]}/>
        <div style={{marginTop:16,textAlign:'right'}}>
          <Button type="primary" icon={<ImportOutlined/>} loading={importingOdoo}
            disabled={!importPath && importFiles.length===0} onClick={handleOdooImport}>开始导入</Button>
        </div>
      </Modal>
    </div>
  );
};

export default OdooModelBrowser;
