/**
 * OdooModelBrowser — 模型集成中心
 * 
 * 三个Tab:
 *   Tab1 - Odoo模块浏览器: 浏览/搜索已有模块, 导入.py源文件, 一键转为应用
 *   Tab2 - 数据库表导入: 连接外部数据库, 导入表为应用
 */
import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Tag, Empty, Spin, message, Modal, Input, Collapse, Table, Upload, Tabs, Tooltip, Steps, Form, Select } from 'antd';
import { AppstoreOutlined, EyeOutlined, ReloadOutlined, UploadOutlined, FolderOpenOutlined, InboxOutlined, ImportOutlined, RocketOutlined, DatabaseOutlined, LinkOutlined, FileAddOutlined, TableOutlined, SearchOutlined } from '@ant-design/icons';
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

  // 批量扫描 Odoo 模块目录
  const [batchDirPath, setBatchDirPath] = useState('D:\\myapps\\odoo\\addons');
  const [batchModules, setBatchModules] = useState<Array<{ name: string; pyCount: number; selected: boolean }>>([]);
  const [batchScanning, setBatchScanning] = useState(false);
  const [batchImporting, setBatchImporting] = useState(false);

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

  // 一键: 整个模块 → 低代码应用（多表）
  const [appBuilderOpen, setAppBuilderOpen] = useState(false);
  const [appBuilderModule, setAppBuilderModule] = useState<OdooModule | null>(null);
  const [appBuilderModels, setAppBuilderModels] = useState<Array<{ name: string; description: string; fields: Record<string,any>; selected: boolean; relations: string[] }>>([]);
  const [appBuilderSelectAll, setAppBuilderSelectAll] = useState(true);

  const openAppBuilder = async (mod: OdooModule) => {
    setAppBuilderModule(mod);
    setAppBuilderOpen(true);
    setQuickImportModel('loading');
    const allModelNames = mod.models.map(m => m.name);
    const loaded: Array<{ name: string; description: string; fields: Record<string,any>; selected: boolean; relations: string[] }> = [];
    for (const m of mod.models) {
      try {
        const r = await fetch(`${BASE}/odoo/model/${m.name}`);
        const def = await r.json();
        if (!def.error) {
          const relations: string[] = [];
          const fs = def.fields || {};
          // 检测显式关联 (relation属性)
          for (const [k, v] of Object.entries(fs)) {
            const fv = v as any;
            if (fv.relation) relations.push(fv.relation);
          }
          // 自动推断关联: 同模块内的 _id 后缀字段 → many2one
          for (const [k, v] of Object.entries(fs)) {
            if (k.endsWith('_id') && !(v as any).relation) {
              const targetName = k.replace(/_id$/, '');
              if (allModelNames.includes(targetName)) {
                relations.push(targetName);
                (v as any).relation = targetName;
              }
            }
          }
          loaded.push({ name: m.name, description: def.description || m.name, fields: fs, selected: true, relations });
        }
      } catch {}
    }
    setAppBuilderModels(loaded);
    setAppBuilderSelectAll(true);
    setQuickImportModel(null);
  };

  const createAppFromModule = async () => {
    const selected = appBuilderModels.filter(m => m.selected);
    if (selected.length === 0) { message.error('至少选择一个表'); return; }
    if (!appBuilderModule) return;
    setQuickImportModel('creating');

    const moduleName = 'app_odoo_' + appBuilderModule.name.replace(/[^a-zA-Z0-9_]/g, '_');
    const models = selected.map(m => {
      const flds: Record<string,any> = {};
      for (const [k, v] of Object.entries(m.fields)) { if (k !== 'id') flds[k] = v; }
      return { _name: m.name, _description: m.description, _fields: flds };
    });

    try {
      await fetch(`${BASE}/lowcode/create-module`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ moduleName, models }) });
      await fetch(`${BASE}/lowcode/save-app-config`, { method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ moduleName, config: {
          name: appBuilderModule.label, description: 'Odoo导入: ' + appBuilderModule.label, icon: '📦',
          menu: selected.map(m => ({ label: m.description || m.name, table: m.name, icon: m.name.includes('categ') ? '📁' : m.name.includes('comment') ? '💬' : '📋' }))
        }})
      });
      await fetch(`${BASE}/lowcode/deploy`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ moduleName }) });
      message.success({ content: `🎉 应用「${appBuilderModule.label}」创建成功！${selected.length}个表。按 F5 刷新后在「应用管理」查看`, duration: 6 });
      setAppBuilderOpen(false);
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

  // 批量扫描 Odoo addons 目录
  const scanAddonsDir = async () => {
    if (!batchDirPath) { message.error('输入目录路径'); return; }
    setBatchScanning(true);
    try {
      const r = await fetch(`${BASE}/odoo/scan-addons`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ dirPath: batchDirPath }) });
      const j = await r.json();
      if (j.error) { message.error(j.error); } else {
        setBatchModules(j.modules.map((m: string) => { const [name, cnt] = m.split('|'); return { name, pyCount: parseInt(cnt), selected: false }; }));
        message.success(`扫描到 ${j.count} 个模块`);
      }
    } catch (e: any) { message.error(e.message); }
    setBatchScanning(false);
  };

  // 批量导入选中模块
  const batchImport = async () => {
    const selected = batchModules.filter(m => m.selected).map(m => m.name);
    if (selected.length === 0) { message.error('至少选择一个模块'); return; }
    setBatchImporting(true);
    try {
      const r = await fetch(`${BASE}/odoo/batch-import`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ dirPath: batchDirPath, selected }) });
      const j = await r.json();
      message.success({ content: `导入完成: ${j.imported}成功 ${j.failed}失败 (${j.totalModels}模型 ${j.totalFields}字段)`, duration: 8 });
      setBatchModules([]); loadModules();
    } catch (e: any) { message.error(e.message); }
    setBatchImporting(false);
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
                    } extra={
                      <Button size="small" type="primary" icon={<RocketOutlined/>} loading={quickImportModel==='loading'} onClick={e => { e.stopPropagation(); openAppBuilder(mod); }}>组合创建应用</Button>
                    }>
                      <Table dataSource={mod.models} rowKey="name" size="small" pagination={false}
                        columns={[
                          { title:'模型名',dataIndex:'name',render:(v:string)=><Text code>{v}</Text> },
                          { title:'描述',dataIndex:'description',ellipsis:true },
                          { title:'字段',dataIndex:'fields',width:70,align:'center' as const,render:(v:number)=><Tag color="green">{v}</Tag> },
                          { title:'操作',width:100,render:(_:any,r:any)=>(
                            <Button size="small" icon={<EyeOutlined/>} onClick={async()=>{
                              const re=await fetch(`${BASE}/odoo/model/${r.name}`); const d=await re.json();
                              Modal.info({title:d.model||r.name,content:<div>{Object.entries(d.fields||{}).map(([k,v]:any)=><Tag key={k} color={v.relation?'orange':'default'}>{v.relation?k+'→'+v.relation:k}</Tag>)}</div>,width:600});
                            }}>字段</Button>
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
        {
          key: 'batch', label: <span><FolderOpenOutlined /> 批量导入模块目录</span>,
          children: (
            <div>
              <Card style={{ maxWidth: 800 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>指定 Odoo addons 目录，批量扫描并选择导入</Text>
                  <Input.Search placeholder="D:\myapps\odoo\addons" value={batchDirPath}
                    onChange={e => setBatchDirPath(e.target.value)}
                    onSearch={scanAddonsDir} enterButton={<><SearchOutlined /> 扫描</>} loading={batchScanning}
                    style={{ maxWidth: 500 }} />
                  {batchModules.length > 0 && (
                    <>
                      <div style={{ marginBottom: 8 }}>
                        <Space>
                          <Button size="small" onClick={() => setBatchModules(batchModules.map(m => ({ ...m, selected: true })))}>全选</Button>
                          <Button size="small" onClick={() => setBatchModules(batchModules.map(m => ({ ...m, selected: false })))}>全不选</Button>
                          <Tag>{batchModules.filter(m => m.selected).length}/{batchModules.length} 选中</Tag>
                        </Space>
                      </div>
                      <div style={{ maxHeight: 400, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
                        <Row gutter={[8, 4]}>
                          {batchModules.map((m, i) => (
                            <Col key={m.name} span={8}>
                              <Tag.CheckableTag key={m.name} checked={m.selected}
                                onChange={v => setBatchModules(batchModules.map((x, j) => j === i ? { ...x, selected: v } : x))}
                                style={{ fontSize: 12, marginBottom: 2 }}>
                                {m.name} <Tag color="blue" style={{ fontSize: 10 }}>{m.pyCount}py</Tag>
                              </Tag.CheckableTag>
                            </Col>
                          ))}
                        </Row>
                      </div>
                      <Button type="primary" size="large" icon={<ImportOutlined />} loading={batchImporting}
                        disabled={batchModules.filter(m => m.selected).length === 0}
                        onClick={batchImport}>
                        导入 {batchModules.filter(m => m.selected).length} 个选中模块
                      </Button>
                    </>
                  )}
                </Space>
              </Card>
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

      {/* 应用构建器 — 选择模块内模型组合创建多表应用 */}
      <Modal title={<><RocketOutlined /> 构建应用: {appBuilderModule?.label}</>} open={appBuilderOpen}
        onCancel={() => setAppBuilderOpen(false)} width={700} onOk={createAppFromModule}
        okText={`创建应用 (${appBuilderModels.filter(m=>m.selected).length}个表)`} confirmLoading={quickImportModel==='creating'}>
        <Text type="secondary">选择要包含的数据表。模块内所有相关表自动检测关联关系。</Text>
        <Table dataSource={appBuilderModels} rowKey="name" size="small" style={{ marginTop: 12 }}
          rowSelection={{ selectedRowKeys: appBuilderModels.filter(m=>m.selected).map(m=>m.name),
            onChange: (keys) => setAppBuilderModels(appBuilderModels.map(m => ({ ...m, selected: keys.includes(m.name) }))) }}
          columns={[
            { title:'表名', dataIndex:'name', render:(v:string)=><Text code strong>{v}</Text> },
            { title:'描述', dataIndex:'description', ellipsis:true },
            { title:'字段', render:(_:any,r:any)=><Tag color="green">{Object.keys(r.fields||{}).length-1}</Tag>, width:70, align:'center' as const },
            { title:'关联表', dataIndex:'relations', render:(rels:string[])=>rels.length===0?<Text type="secondary">独立</Text>:
              rels.map(r=><Tag key={r} color="orange" style={{fontSize:11}}>{r}</Tag>) },
          ]} />
        <div style={{ marginTop: 8, background: '#fff7e6', padding: '8px 12px', borderRadius: 6, fontSize: 12 }}>
          <Text type="secondary">💡 取消勾选不需要的表。关联关系(many2one/one2many)会自动保留。</Text>
        </div>
      </Modal>
    </div>
  );
};

export default OdooModelBrowser;
