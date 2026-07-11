/**
 * memory_search 工具 — Agent搜索长期记忆
 * 参照 CowAgent agent/tools/memory/memory_search.py
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';
import { searchMemory } from '../../memory/memory-manager';

export class MemorySearchTool extends BaseTool {
  name = 'memory_search';
  description = '搜索Agent长期记忆和项目知识。参数: query(搜索关键词), maxResults(可选,默认5)';
  parameters: ToolParameters = {
    type: 'object',
    properties: {
      query: { type: 'string', description: '搜索关键词' },
      maxResults: { type: 'number', description: '最大结果数，默认5' },
    },
    required: ['query'],
  };

  async execute(params: Record<string, any>): Promise<ToolResult> {
    const results = searchMemory(params.query, params.maxResults || 5);
    if (results.length === 0) return this.ok({ query: params.query, message: '未找到相关记忆', results: [] });
    return this.ok({ query: params.query, count: results.length, results });
  }
}
