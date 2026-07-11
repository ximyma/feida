/**
 * web_fetch 工具 — 获取网页内容
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';

export class WebFetchTool extends BaseTool {
  name = 'web_fetch';
  description = '获取网页内容并提取文本。参数: url(网址), maxChars(最大字符数,可选,默认5000)';
  parameters: ToolParameters = {
    type: 'object',
    properties: {
      url: { type: 'string', description: '要获取的网址' },
      maxChars: { type: 'number', description: '最大返回字符数，默认5000' },
    },
    required: ['url'],
  };

  async execute(params: any): Promise<ToolResult> {
    const url = params.url;
    const maxChars = params.maxChars || 5000;
    try {
      const html = await this.fetch(url);
      // 简单文本提取
      let text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxChars);
      return this.ok({ url, text, truncated: html.length > maxChars });
    } catch (e: any) {
      return this.fail(`获取失败: ${e.message}`);
    }
  }

  private fetch(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proto = url.startsWith('https') ? require('https') : require('http');
      const req = proto.get(url, { headers: { 'User-Agent': 'FeidaHR/1.0' }, timeout: 15000 }, (res: any) => {
        if (res.statusCode >= 400) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
        let d = '';
        res.on('data', (c: string) => d += c);
        res.on('end', () => resolve(d));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
  }
}
