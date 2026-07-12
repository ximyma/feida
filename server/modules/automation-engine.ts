/**
 * 自动化动作引擎 — 参照 Odoo Automated Actions (ir.actions.server)
 *
 * 在状态变更时自动触发:
 *   - 发送通知 (站内信/邮件)
 *   - 更新关联记录 (下推订单状态)
 *   - 执行 SQL/脚本
 *   - 触发工作流
 *
 * 与工作流引擎集成: 节点通过时执行 onEnter/onLeave 动作
 */
import { IDatabaseDriver } from './database/database-driver';

export interface AutomateAction {
  id: string;
  name: string;
  model: string;           // 触发模型
  trigger: 'on_create' | 'on_write' | 'on_state_change' | 'on_schedule';
  condition?: string;       // 条件表达式 (JSON)
  action_type: 'notify' | 'update_record' | 'execute_sql' | 'trigger_workflow' | 'call_hook';
  action_config: Record<string, any>;
  is_active: number;
  sequence: number;
}

let db: IDatabaseDriver;

export function initAutomationEngine(database: IDatabaseDriver) {
  db = database;
  const raw = (db as any).db || db;
  try {
    raw.exec(`CREATE TABLE IF NOT EXISTS automation_actions (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, model TEXT NOT NULL,
      trigger TEXT NOT NULL, condition TEXT, action_type TEXT NOT NULL,
      action_config TEXT DEFAULT '{}', is_active INTEGER DEFAULT 1,
      sequence INTEGER DEFAULT 10, created_at TEXT DEFAULT (datetime('now'))
    )`);
  } catch {}
}

/**
 * 触发自动化动作
 * @param model 模型名 (如 'shop_orders')
 * @param trigger 触发类型
 * @param recordId 记录ID
 * @param oldValues 变更前字段值
 * @param newValues 变更后字段值
 */
export async function fireAutomations(
  model: string, trigger: string, recordId: string,
  oldValues?: Record<string, any>, newValues?: Record<string, any>
): Promise<void> {
  const actions = (db.query(
    `SELECT * FROM automation_actions WHERE model = ? AND trigger = ? AND is_active = 1 ORDER BY sequence`,
    [model, trigger]
  ) as any[]);

  for (const action of actions) {
    try {
      // 条件检查
      if (action.condition) {
        if (!checkCondition(action.condition, { old: oldValues, new: newValues })) continue;
      }
      await executeAction(action, recordId, newValues);
    } catch (e) { console.warn(`[Automation] 动作失败: ${action.name}`, (e as Error).message); }
  }
}

function checkCondition(condStr: string, context: any): boolean {
  try {
    const cond = JSON.parse(condStr);
    // 简单的相等检查: {"field": "status", "op": "eq", "value": "pending"}
    const fieldVal = context.new?.[cond.field] || context.old?.[cond.field];
    switch (cond.op) {
      case 'eq': return fieldVal === cond.value;
      case 'neq': return fieldVal !== cond.value;
      case 'in': return cond.values?.includes(fieldVal);
      case 'changed': return context.old?.[cond.field] !== context.new?.[cond.field];
      default: return true;
    }
  } catch { return true; }
}

async function executeAction(action: AutomateAction, recordId: string, values?: Record<string, any>): Promise<void> {
  const cfg = typeof action.action_config === 'string' ? JSON.parse(action.action_config) : action.action_config;

  switch (action.action_type) {
    case 'notify':
      // 发送系统通知
      const notifyUserId = cfg.user_id || cfg.role || 'system';
      db.insert('announcement_reads', {
        id: `ar_${Date.now()}`,
        announcementId: `automate_${action.id}`,
        employeeId: notifyUserId,
        readAt: new Date().toISOString(),
      });
      break;

    case 'update_record':
      // 更新关联记录
      if (cfg.update_model && cfg.update_id && cfg.fields) {
        db.update(cfg.update_model, cfg.update_id, {
          ...cfg.fields,
          updated_at: new Date().toISOString(),
        });
      }
      break;

    case 'execute_sql':
      // 执行自定义SQL
      if (cfg.sql) {
        (db as any).query(cfg.sql, cfg.params || []);
      }
      break;

    case 'trigger_workflow':
      // 触发另一个工作流
      if (cfg.workflow_definition_id) {
        // 通过 workflow/start API 启动
        await fetch('/api/workflow/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ definitionId: cfg.workflow_definition_id, businessId: recordId, businessType: action.model, title: cfg.title || action.name }),
        }).catch(() => {});
      }
      break;

    case 'call_hook':
      // 调用自定义钩子
      if (cfg.hook_path) {
        try {
          const hook = require(cfg.hook_path);
          if (typeof hook === 'function') hook(db, recordId, values);
        } catch {}
      }
      break;
  }
}

/**
 * 记录状态机 — 参照 Odoo 状态管理
 * 用于订单/售后等审批流转
 */
export class RecordStateMachine {
  private transitions: Map<string, Array<{ to: string; label: string; guard?: () => boolean }>> = new Map();

  addTransition(from: string, to: string, label: string, guard?: () => boolean) {
    if (!this.transitions.has(from)) this.transitions.set(from, []);
    this.transitions.get(from)!.push({ to, label, guard });
    return this;
  }

  getAvailableTransitions(state: string): string[] {
    return (this.transitions.get(state) || [])
      .filter(t => !t.guard || t.guard())
      .map(t => t.to);
  }

  canTransition(from: string, to: string): boolean {
    return this.getAvailableTransitions(from).includes(to);
  }

  static shopOrderMachine() {
    return new RecordStateMachine()
      .addTransition('draft', 'confirmed', '确认订单')
      .addTransition('confirmed', 'paid', '支付完成')
      .addTransition('paid', 'shipped', '已发货')
      .addTransition('shipped', 'delivered', '已签收')
      .addTransition('delivered', 'completed', '完成')
      .addTransition('draft', 'cancelled', '取消')
      .addTransition('confirmed', 'cancelled', '取消')
      .addTransition('completed', 'refunding', '申请退款')
      .addTransition('refunding', 'refunded', '退款完成');
  }
}
