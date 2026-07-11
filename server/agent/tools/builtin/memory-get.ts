/**
 * memory_get 工具 — 获取长期记忆全文
 * 参照 CowAgent agent/tools/memory/memory_get.py
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';
import { getLongTermMemory, readDailyMemory } from '../../memory/memory-manager';

export class MemoryGetTool extends BaseTool {
  name = 'memory_get';
  description = '获取Agent长期记忆全文或今日记忆。参数: type("long_term"或"today")';
  parameters: ToolParameters = {
    type: 'object',
    properties: {
      type: { type: 'string', description: 'long_term(MEMORY.md) 或 today(今日日志)', enum: ['long_term', 'today'] },
    },
    required: ['type'],
  };

  async execute(params: Record<string, any>): Promise<ToolResult> {
    if (params.type === 'long_term') {
      const content = getLongTermMemory().slice(0, 5000);
      return this.ok({ type: 'long_term', length: content.length, content });
    }
    const content = readDailyMemory().slice(0, 5000);
    if (!content) return this.ok({ type: 'today', message: '今日无记忆' });
    return this.ok({ type: 'today', length: content.length, content });
  }
}
