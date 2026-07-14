/**
 * ORM 字段类型系统 — 参照 Odoo fields.py
 *
 * 支持类型: Char, Integer, Float, Boolean, Text, Date, Selection, Many2one, One2many
 * 每个字段类型负责: SQL列定义、输入校验、默认值
 */

export type FieldType = 'char' | 'integer' | 'float' | 'boolean' | 'text' | 'date' | 'datetime' | 'selection' | 'many2one' | 'one2many';

export interface FieldDefinition {
  /** 字段类型 */
  type: FieldType;
  /** 字段标签(人类可读) */
  label?: string;
  /** 是否必填 */
  required?: boolean;
  /** 默认值 */
  default?: any;
  /** 最大长度 (char/text) */
  maxLength?: number;
  /** Selection选项 [{label,value}] */
  selection?: Array<{ label: string; value: string }>;
  /** 关联模型 (many2one) */
  relation?: string;
  /** 索引 */
  index?: boolean;
  /** 读写权限: 角色名数组(空=无限制) */
  groups?: string[];
  /** 帮助文本 */
  help?: string;
}

/** 字段类型 → SQL列类型映射 */
const SQL_TYPE_MAP: Record<FieldType, string> = {
  char: 'TEXT',
  text: 'TEXT',
  integer: 'INTEGER',
  float: 'REAL',
  boolean: 'INTEGER DEFAULT 0',
  date: 'TEXT',
  datetime: 'TEXT',
  selection: 'TEXT',
  many2one: 'TEXT',
  one2many: 'TEXT',
};

/** 字段类型 → 默认值 */
const DEFAULT_MAP: Record<FieldType, any> = {
  char: '', text: '', integer: 0, float: 0, boolean: false,
  date: null, datetime: null, selection: null,
  many2one: null, one2many: null,
};

/** 生成 CREATE TABLE 列定义 */
export function fieldToColumnDDL(name: string, field: FieldDefinition): string {
  const sqlType = SQL_TYPE_MAP[field.type];
  let ddl = `${name} ${sqlType}`;
  if (field.required && field.default !== undefined) {
    const dv = typeof field.default === 'string' ? `'${field.default}'` : field.default;
    ddl += ` DEFAULT ${dv}`;
  }
  if (field.required && field.default === undefined && field.type !== 'boolean') {
    ddl += ' NOT NULL';
  }
  return ddl;
}

/** 校验输入值是否符合字段定义 */
export function validateField(name: string, field: FieldDefinition, value: any): string | null {
  if (value === undefined || value === null) {
    if (field.required && field.default === undefined) return `${field.label || name} 为必填`;
    return null;
  }
  switch (field.type) {
    case 'char': case 'text':
      if (typeof value !== 'string') return `${field.label || name} 必须是字符串`;
      if (field.maxLength && value.length > field.maxLength) return `${field.label || name} 不能超过${field.maxLength}字`;
      break;
    case 'integer':
      if (typeof value !== 'number' || !Number.isInteger(Number(value))) return `${field.label || name} 必须是整数`;
      break;
    case 'float':
      if (typeof value !== 'number') return `${field.label || name} 必须是数字`;
      break;
    case 'boolean':
      if (typeof value !== 'boolean' && value !== 0 && value !== 1) return `${field.label || name} 必须是布尔值`;
      break;
    case 'selection':
      if (field.selection && !field.selection.some(s => s.value === value)) return `${field.label || name} 值无效`;
      break;
  }
  return null;
}

/** 类型转换 (输入 → 存储值) */
export function coerceField(field: FieldDefinition, value: any): any {
  if (value === undefined || value === null) return field.default !== undefined ? field.default : DEFAULT_MAP[field.type];
  if (field.type === 'integer') return parseInt(String(value), 10) || 0;
  if (field.type === 'float') return parseFloat(String(value)) || 0;
  if (field.type === 'boolean') return value ? 1 : 0;
  return value;
}
