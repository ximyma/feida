/**
 * web_search 工具 — 网页搜索
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';

export class WebSearchTool extends BaseTool {
  name = 'web_search';
  description = '搜索网页获取最新信息。参数: query(搜索关键词), count(结果数量,可选,默认5)';
  parameters: ToolParameters = {
    type: 'object',
    properties: {
      query: { type: 'string', description: '搜索关键词' },
      count: { type: 'number', description: '返回结果数，默认5' },
    },
    required: ['query'],
  };

  async execute(params: any): Promise<ToolResult> {
    const query = encodeURIComponent(params.query);
    const count = params.count || 5;
    try {
      // 使用 DuckDuckGo HTML (无需 API key)
      const html = await this.fetch(`https://html.duckduckgo.com/html/?q=${query}`);
      const results: Array<{title: string, url: string, snippet: string}> = [];
      const snippetRe = /<a rel="nofollow" class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]*?<a class="result__snippet"[^>]*>([^<]+)<\/a>/gi;
      let match;
      while ((match = snippetRe.exec(html)) !== null && results.length < count) {
        results.push({
          title: this.cleanHtml(match[2]),
          url: match[1],
          snippet: this.cleanHtml(match[3]),
        });
      }
      return this.ok({ query: params.query, results });
    } catch (e: any) {
      return this.fail(`搜索失败: ${e.message}`);
    }
  }

  private cleanHtml(str: string): string {
    return str.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
  }

  private fetch(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proto = url.startsWith('https') ? require('https') : require('http');
      proto.get(url, { headers: { 'User-Agent': 'FeidaHR/1.0' } }, (res: any) => {
        let d = '';
        res.on('data', (c: string) => d += c);
        res.on('end', () => resolve(d));
      }).on('error', reject);
    });
  }
}
