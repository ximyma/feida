/**
 * TemplateDesigner — 模板设计器
 *
 * 借鉴 KFlower Templates.vue 设计:
 *   左侧: 字段类型画廊(40+类型,分组)
 *   中间: 表单画布(拖拽排序字段)
 *   右侧: 属性面板(配置字段属性)
 *
 * 暂用HTML5原生拖拽(后续可引入dnd-kit)
 */
import React, { useState, useCallback } from 'react';
import { Card, Button, Input, Select, Switch, InputNumber, Row, Col, Tag, Empty, Tooltip, Divider, Typography, Space, Tabs, Modal, Upload, message } from 'antd';
import { PlusOutlined, DeleteOutlined, DragOutlined, SettingOutlined, HolderOutlined, FileTextOutlined, FileExcelOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// ===== 40+ 字段类型 =====
const FIELD_GROUPS = [
  {
    label: '文本',
    types: [
      { type: 'char', label: '单行文本', icon: 'Aa', desc: '短文本,用于标题、名称' },
      { type: 'text', label: '多行文本', icon: '≡', desc: '长文本,用于描述、备注' },
      { type: 'password', label: '密码', icon: '🔒', desc: '加密显示' },
    ],
  },
  {
    label: '数字',
    types: [
      { type: 'integer', label: '整数', icon: '123', desc: '计数、库存' },
      { type: 'float', label: '小数', icon: '1.2', desc: '金额、比率' },
    ],
  },
  {
    label: '日期时间',
    types: [
      { type: 'date', label: '日期', icon: '📅', desc: '年月日' },
      { type: 'datetime', label: '日期时间', icon: '🕐', desc: '年月日时分秒' },
    ],
  },
  {
    label: '选择',
    types: [
      { type: 'boolean', label: '开关', icon: '☑', desc: '是/否,启用/禁用' },
      { type: 'selection', label: '下拉选择', icon: '▼', desc: '预定义选项' },
      { type: 'color', label: '颜色', icon: '🎨', desc: '颜色选择器' },
    ],
  },
  {
    label: '关联',
    types: [
      { type: 'many2one', label: '关联表', icon: '🔗', desc: '外键关联另一张表' },
      { type: 'one2many', label: '子表', icon: '📋', desc: '一对多明细' },
      { type: 'many2many', label: '多对多', icon: '🔀', desc: '多对多关联' },
    ],
  },
  {
    label: '媒体',
    types: [
      { type: 'image', label: '图片', icon: '🖼', desc: '图片上传' },
      { type: 'file', label: '文件', icon: '📎', desc: '文件附件' },
    ],
  },
  {
    label: '联系方式',
    types: [
      { type: 'email', label: '邮箱', icon: '✉️', desc: '邮箱地址,自动验证' },
      { type: 'url', label: '网址', icon: '🌐', desc: 'URL链接' },
      { type: 'phone', label: '电话', icon: '📞', desc: '电话号码' },
    ],
  },
  {
    label: '金额',
    types: [
      { type: 'monetary', label: '货币', icon: '💰', desc: '金额,带货币符号' },
    ],
  },
  {
    label: '高级',
    types: [
      { type: 'formula', label: '公式计算', icon: '𝑓', desc: '表达式计算字段' },
      { type: 'sequence', label: '自动编号', icon: '#', desc: '自增编号' },
      { type: 'html', label: '富文本', icon: '📝', desc: 'HTML富文本编辑器' },
      { type: 'rating', label: '评分', icon: '⭐', desc: '星级评分' },
    ],
  },
];

interface FieldDef {
  key: string;
  name: string;
  type: string;
  label: string;
  required: boolean;
  default?: any;
  placeholder?: string;
  tooltip?: string;
  // selection
  options?: Array<{ label: string; value: string }>;
  // many2one
  relation?: string;
  // formula
  formula?: string;
  // group
  group?: string;
}

interface TemplateDesignerProps {
  fields: FieldDef[];
  onChange: (fields: FieldDef[]) => void;
  tables?: string[]; // 可选关联表列表
}

export const TemplateDesigner: React.FC<TemplateDesignerProps> = ({ fields, onChange, tables = [] }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [optionsText, setOptionsText] = useState('');
  const [dragHover, setDragHover] = useState<number | null>(null);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [excelUploading, setExcelUploading] = useState(false);

  const selectedField = selectedIdx !== null ? fields[selectedIdx] : null;

  const addField = useCallback((type: string, label: string) => {
    const newField: FieldDef = {
      key: `f${Date.now()}`, name: '', type, label, required: false,
    };
    const newFields = [...fields, newField];
    onChange(newFields);
    setSelectedIdx(newFields.length - 1);
  }, [fields, onChange]);

  const removeField = useCallback((idx: number) => {
    const newFields = fields.filter((_, i) => i !== idx);
    onChange(newFields);
    if (selectedIdx === idx) setSelectedIdx(null);
    else if (selectedIdx !== null && selectedIdx > idx) setSelectedIdx(selectedIdx - 1);
  }, [fields, selectedIdx, onChange]);

  const updateField = useCallback((key: string, value: any) => {
    if (selectedIdx === null) return;
    const newFields = [...fields];
    (newFields[selectedIdx] as any)[key] = value;
    if (key === 'label' && !newFields[selectedIdx].name) {
      newFields[selectedIdx].name = value;
    }
    onChange(newFields);
  }, [fields, selectedIdx, onChange]);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragHover(idx);
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    setDragHover(null);
    const srcIdx = parseInt(e.dataTransfer.getData('text/plain'));
    if (srcIdx === targetIdx) return;
    const newFields = [...fields];
    const [moved] = newFields.splice(srcIdx, 1);
    newFields.splice(targetIdx, 0, moved);
    onChange(newFields);
    if (selectedIdx === srcIdx) setSelectedIdx(targetIdx);
  };

  // ─── JSON 导入 ───
  const handleJsonImport = () => {
    try {
      let data = JSON.parse(jsonText);
      // 支持 [{"name":"xx","type":"char"},...] 或 {fields:[...]}
      if (!Array.isArray(data)) {
        if (data.fields && Array.isArray(data.fields)) data = data.fields;
        else if (data.columns && Array.isArray(data.columns)) data = data.columns;
        else { message.error('JSON 格式不支持，需要数组或 {fields:[...]} 格式'); return; }
      }
      const newFields: FieldDef[] = data.map((item: any, i: number) => ({
        key: `j${Date.now()}_${i}`,
        name: item.name || item.field || '',
        type: item.type || 'char',
        label: item.label || item.title || item.name || item.field || '',
        required: !!item.required,
        default: item.default,
        placeholder: item.placeholder,
        tooltip: item.description || item.desc,
        selection: item.options || item.selection || item.choices,
        relation: item.relation || item.related_model,
      }));
      onChange([...fields, ...newFields]);
      setJsonModalOpen(false);
      setJsonText('');
      message.success(`已导入 ${newFields.length} 个字段`);
    } catch { message.error('JSON 解析失败'); }
  };

  // ─── Excel 导入 ───
  const handleExcelUpload = async (info: any) => {
    const file = info.file;
    if (!file) return;
    setExcelUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/ai/parse-excel', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success && result.data?.fields) {
        const newFields: FieldDef[] = result.data.fields.map((item: any, i: number) => ({
          key: `e${Date.now()}_${i}`,
          name: item.name || `field_${i}`,
          type: item.type || 'char',
          label: item.label || item.title || item.name || '',
          required: false,
          selection: item.options || undefined,
        }));
        onChange([...fields, ...newFields]);
        message.success(`从 Excel 导入 ${newFields.length} 个字段`);
      } else {
        message.error(result.error || '解析失败');
      }
    } catch { message.error('上传失败'); }
    setExcelUploading(false);
  };

  return (
    <>
    <Row gutter={16} style={{ minHeight: 500 }}>
      {/* 左侧: 字段类型画廊 */}
      <Col span={6}>
        <Card size="small" title="字段类型" style={{ height: '100%', overflow: 'auto' }}>
          {FIELD_GROUPS.map(g => (
            <div key={g.label} style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase' }}>{g.label}</Text>
              {g.types.map(t => (
                <Tooltip key={t.type} title={t.desc}>
                  <Button block size="small" style={{ margin: '2px 0', textAlign: 'left' }}
                    onClick={() => addField(t.type, t.label)}>
                    <span style={{ marginRight: 6, fontSize: 14 }}>{t.icon}</span>
                    {t.label}
                  </Button>
                </Tooltip>
              ))}
            </div>
          ))}
        </Card>
      </Col>

      {/* 中间: 表单画布 */}
      <Col span={10}>
        <Card size="small"
          title={`表单画布 (${fields.length}个字段)`}
          extra={
            <Space size={4}>
              <Tooltip title="从 JSON 导入字段"><Button size="small" type="text" icon={<FileTextOutlined />} onClick={() => setJsonModalOpen(true)}>JSON</Button></Tooltip>
              <Upload accept=".xlsx,.xls,.csv" showUploadList={false} beforeUpload={(file) => { handleExcelUpload({ file }); return false; }}>
                <Tooltip title="从 Excel 导入字段"><Button size="small" type="text" icon={<FileExcelOutlined />} loading={excelUploading}>Excel</Button></Tooltip>
              </Upload>
            </Space>
          } style={{ height: '100%' }}>
          {fields.length === 0 ? (
            <Empty description="从左侧点击字段类型添加到画布" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <div>
              {fields.map((f, idx) => {
                const ftInfo = FIELD_GROUPS.flatMap(g => g.types).find(t => t.type === f.type);
                return (
                  <div key={f.key}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragLeave={() => setDragHover(null)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onClick={() => setSelectedIdx(idx)}
                    style={{
                      padding: '6px 10px', margin: '2px 0', borderRadius: 6, cursor: 'pointer',
                      border: selectedIdx === idx ? '2px solid #1677ff' : dragHover === idx ? '2px dashed #52c41a' : '1px solid #e8e8e8',
                      background: selectedIdx === idx ? '#e6f4ff' : dragHover === idx ? '#f6ffed' : '#fff',
                      display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s',
                    }}>
                    <HolderOutlined style={{ color: '#bbb', cursor: 'grab', fontSize: 12 }} />
                    <span style={{ fontSize: 16 }}>{ftInfo?.icon || '📋'}</span>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 13 }}>{f.label || '(未命名)'}</Text>
                      <Tag style={{ marginLeft: 6, fontSize: 10 }}>{f.type}</Tag>
                      {f.required && <Tag color="red" style={{ fontSize: 10 }}>必填</Tag>}
                      {f.formula && <Tag color="purple" style={{ fontSize: 10 }}>𝑓</Tag>}
                    </div>
                    <Tooltip title="删除"><Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={e => { e.stopPropagation(); removeField(idx); }} /></Tooltip>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </Col>

      {/* 右侧: 属性面板 */}
      <Col span={8}>
        <Card size="small" title={selectedField ? `属性: ${selectedField.label || '(未命名)'}` : '属性面板'} style={{ height: '100%', overflow: 'auto' }}>
          {!selectedField ? (
            <Empty description="← 点击画布中的字段编辑属性" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <div>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>字段名 (英文)</Text>
                <Input size="small" value={selectedField.name} onChange={e => updateField('name', e.target.value.replace(/[^a-z0-9_]/g, ''))}
                  placeholder="field_name" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>标签 (中文显示)</Text>
                <Input size="small" value={selectedField.label} onChange={e => updateField('label', e.target.value)} placeholder="字段标签" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>占位提示</Text>
                <Input size="small" value={selectedField.placeholder || ''} onChange={e => updateField('placeholder', e.target.value)} placeholder="输入提示文字" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>帮助提示</Text>
                <Input size="small" value={selectedField.tooltip || ''} onChange={e => updateField('tooltip', e.target.value)} placeholder="悬停提示" />
              </div>
              <div style={{ marginBottom: 12 }}>
                <Switch size="small" checked={selectedField.required} onChange={v => updateField('required', v)} />{' '}
                <Text style={{ fontSize: 12 }}>必填字段</Text>
              </div>
              {!['boolean', 'selection', 'formula'].includes(selectedField.type) && (
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>默认值</Text>
                  <Input size="small" value={selectedField.default || ''} onChange={e => updateField('default', e.target.value)}
                    placeholder={selectedField.type === 'integer' || selectedField.type === 'float' ? '0' : ''} />
                </div>
              )}

              {/* selection 选项配置 */}
              {selectedField.type === 'selection' && (
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>选项 (每行一个: 标签=值)</Text>
                  <Input.TextArea size="small" rows={3}
                    value={selectedField.options?.map(o => `${o.label}=${o.value}`).join('\n') || ''}
                    onChange={e => {
                      const opts = e.target.value.split('\n').filter(Boolean).map(line => {
                        const [label, value] = line.split('=');
                        return { label: label?.trim() || '', value: value?.trim() || label?.trim() || '' };
                      });
                      updateField('options', opts);
                    }}
                    placeholder="高=high&#10;中=mid&#10;低=low" />
                </div>
              )}

              {/* many2one 关联配置 */}
              {selectedField.type === 'many2one' && (
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>关联表</Text>
                  <Select size="small" style={{ width: '100%' }} value={selectedField.relation}
                    onChange={v => updateField('relation', v)}
                    options={tables.map(t => ({ label: t, value: t }))} placeholder="选择关联表" />
                </div>
              )}

              {/* formula 公式配置 */}
              {selectedField.type === 'formula' && (
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                    计算公式 <Tag color="purple" style={{ fontSize: 9 }}>表达式</Tag>
                  </Text>
                  <Input.TextArea size="small" rows={2}
                    value={selectedField.formula || ''}
                    onChange={e => updateField('formula', e.target.value)}
                    placeholder="price * qty&#10;len(name)&#10;amount * 1.13" />
                  <Text type="secondary" style={{ fontSize: 10 }}>
                    支持: + - * / , 函数: len/upper/lower/round/if
                  </Text>
                </div>
              )}
            </div>
          )}
        </Card>
      </Col>
    </Row>

    {/* JSON 导入弹窗 */}
    <Modal title="从 JSON 导入字段" open={jsonModalOpen} onCancel={() => { setJsonModalOpen(false); setJsonText(''); }}
      onOk={handleJsonImport} okText="导入" width={600}>
      <p style={{ color: '#666', marginBottom: 8 }}>
        支持格式: <code>{'[{"name":"field1","type":"char","label":"字段名"}]'}</code> 或 <code>{'{"fields":[...]}'}</code>
      </p>
      <Input.TextArea value={jsonText} onChange={e => setJsonText(e.target.value)}
        rows={12} placeholder={`[
  {"name": "title", "type": "char", "label": "\\u6807\\u9898", "required": true},
  {"name": "amount", "type": "monetary", "label": "\\u91d1\\u989d"},
  {"name": "status", "type": "selection", "label": "\\u72b6\\u6001", "options": [{"label":"\\u5f85\\u5ba1\\u6838","value":"pending"}]}
]`}
      />
      <div style={{ marginTop: 8, fontSize: 11, color: '#999' }}>
        支持字段: name/type/label/required/default/placeholder/description/options/relation
      </div>
    </Modal>
    </>
  );
};

/** 将 FieldDef 转换为 ORM 模型格式 */
export function toModelFields(fields: FieldDef[]) {
  const map: Record<string, any> = {};
  fields.forEach(f => {
    if (!f.name) return;
    const fd: any = { type: f.type, label: f.label || f.name, required: f.required };
    if (f.default !== undefined && f.default !== null && f.default !== '') fd.default = f.default;
    if (f.type === 'selection' && f.options) fd.selection = f.options;
    if (f.type === 'many2one' && f.relation) fd.relation = f.relation;
    if (f.type === 'formula' && f.formula) { fd.formula = f.formula; fd.type = 'formula'; }
    map[f.name] = fd;
  });
  return map;
}
