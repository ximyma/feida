/**
 * 知识库搜索工具 — 让 Agent 可以查询知识库
 */
import { BaseTool, ToolResult } from '../base-tool';

export class KnowledgeSearchTool extends BaseTool {
  name = 'kb_search';
  description = '搜索飞达HR知识库中与查询相关的文档内容。用于获取系统规则、政策制度、操作手册等内部知识。';
  parameters = {
    type: 'object' as const,
    properties: {
      query: { type: 'string' as const, description: '搜索查询语句，用中文描述你想查找的内容' },
      kbIds: { type: 'string' as const, description: '知识库ID列表，逗号分隔。留空则搜索所有知识库' },
      topK: { type: 'number' as const, description: '返回结果数量，默认5' },
    },
    required: ['query'],
  };

  async execute(params: Record<string, any>): Promise<ToolResult> {
    const query = params.query || '';
    const kbIds = params.kbIds ? params.kbIds.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    const topK = params.topK || 5;

    try {
      const betterSqlite3 = require('better-sqlite3');
      const db = betterSqlite3('data/ehr.db', { readonly: true });

      let rows: any[];
      if (kbIds.length > 0) {
        const placeholders = kbIds.map(() => '?').join(',');
        rows = db.prepare(
          `SELECT id, title, category, content, tags, source_file, created_at
           FROM ai_knowledge
           WHERE kb_id IN (${placeholders})
           ORDER BY created_at DESC
           LIMIT 100`
        ).all(...kbIds);
      } else {
        rows = db.prepare(
          `SELECT id, title, category, content, tags, source_file, created_at
           FROM ai_knowledge
           ORDER BY created_at DESC
           LIMIT 100`
        ).all();
      }

      db.close();

      if (rows.length === 0) {
        return { success: true, data: '知识库为空，没有找到相关内容。' };
      }

      // 混合搜索
      const aiService = require('../../../ai-service.js');
      const results = aiService.hybridSearch(query, rows, aiService.runtimeConfig?.retrieval);

      if (!results || results.length === 0) {
        return { success: true, data: '未找到与查询相关的知识库内容。' };
      }

      const formatted = results.slice(0, topK).map((r: any, i: number) => {
        const title = r.item?.title || r.title || `条目 ${i + 1}`;
        const category = r.item?.category || r.category || '';
        const content = r.item?.content || r.content || '';
        const score = r._score != null ? ` (相关度: ${(r._score * 100).toFixed(0)}%)` : '';
        return `## ${title}${score}\n${category ? `分类: ${category}\n` : ''}${content}`;
      });

      return { success: true, data: formatted.join('\n\n---\n\n') };
    } catch (e: any) {
      return { success: false, error: `知识库搜索失败: ${e.message}` };
    }
  }
}
