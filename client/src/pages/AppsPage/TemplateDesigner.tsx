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
import { Card, Button, Input, Select, Switch, InputNumber, Row, Col, Tag, Empty, Tooltip, Divider, Typography, Space, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, DragOutlined, SettingOutlined, HolderOutlined } from '@ant-design/icons';

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
    ],
  },
  {
    label: '关联',
    types: [
      { type: 'many2one', label: '关联表', icon: '🔗', desc: '外键关联另一张表' },
      { type: 'one2many', label: '子表', icon: '📋', desc: '一对多明细' },
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
    label: '高级',
    types: [
      { type: 'formula', label: '公式计算', icon: '𝑓', desc: '表达式计算字段' },
      { type: 'sequence', label: '自动编号', icon: '#', desc: '自增编号' },
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

  return (
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
        <Card size="small" title={`表单画布 (${fields.length}个字段)`} style={{ height: '100%' }}>
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
