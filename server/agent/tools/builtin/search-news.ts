/**
 * search_news 工具 — 搜索中文新闻资讯
 * 支持 百度/新浪/腾讯 等新闻源
 * 使用 DuckDuckGo + 各站 site: 限定搜索
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';

export class SearchNewsTool extends BaseTool {
  name = 'search_news';
  description = '搜索最新中文新闻资讯。参数: query(搜索关键词), source(新闻源,可选:baidu/sina/tencent/all,默认all), count(结果数,默认8)。支持搜索百度新闻、新浪新闻、腾讯新闻。';
  parameters: ToolParameters = {
    type: 'object',
    properties: {
      query: { type: 'string', description: '搜索关键词' },
      source: { type: 'string', description: '新闻源: baidu, sina, tencent, all。默认all' },
      count: { type: 'number', description: '返回结果数，默认8' },
    },
    required: ['query'],
  };

  private readonly sources: Record<string, { name: string; site: string }> = {
    baidu:   { name: '百度新闻', site: 'news.baidu.com' },
    sina:    { name: '新浪新闻', site: 'news.sina.com.cn' },
    tencent: { name: '腾讯新闻', site: 'news.qq.com' },
  };

  async execute(params: any): Promise<ToolResult> {
    const query = params.query || '';
    const source = (params.source || 'all').toLowerCase();
    const count = params.count || 8;

    const sourcesToSearch = source === 'all'
      ? Object.keys(this.sources)
      : Object.keys(this.sources).filter(s => source.includes(s));

    if (sourcesToSearch.length === 0) {
      return this.fail(`无效新闻源: ${source}。可用: baidu, sina, tencent, all`);
    }

    try {
      const allResults: Array<{ source: string; title: string; url: string; snippet: string }> = [];

      for (const src of sourcesToSearch) {
        const info = this.sources[src];
        const searchQuery = `${encodeURIComponent(query)} site:${info.site}`;
        try {
          const html = await this.fetchPage(`https://html.duckduckgo.com/html/?q=${searchQuery}`);
          const results = this.parseResults(html, info.name, Math.ceil(count / sourcesToSearch.length));
          allResults.push(...results);
        } catch {
          // 某个源失败不影响其他
        }
      }

      if (allResults.length === 0) {
        // 回退：不带 site: 限定
        try {
          const html = await this.fetchPage(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query + ' 新闻')}`);
          const results = this.parseResults(html, '综合新闻', count);
          allResults.push(...results);
        } catch (e: any) {
          return this.fail(`搜索失败: ${e.message}`);
        }
      }

      return this.ok({
        query,
        source,
        count: allResults.length,
        results: allResults,
      });
    } catch (e: any) {
      return this.fail(`新闻搜索失败: ${e.message}`);
    }
  }

  private parseResults(html: string, source: string, maxCount: number): Array<{ source: string; title: string; url: string; snippet: string }> {
    const results: Array<{ source: string; title: string; url: string; snippet: string }> = [];

    // DuckDuckGo HTML 结果提取
    const blockRegex = /<div class="result__body">([\s\S]*?)<\/div>\s*<\/div>/gi;
    let match;
    while ((match = blockRegex.exec(html)) !== null && results.length < maxCount) {
      const block = match[1];
      const titleMatch = /class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)</i.exec(block);
      const snippetMatch = /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i.exec(block);

      if (titleMatch) {
        results.push({
          source,
          title: this.clean(titleMatch[2]),
          url: titleMatch[1],
          snippet: snippetMatch ? this.clean(snippetMatch[1]) : '',
        });
      }
    }

    // 备选：更宽松的匹配
    if (results.length === 0) {
      const linkRegex = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
      let m;
      while ((m = linkRegex.exec(html)) !== null && results.length < maxCount) {
        results.push({
          source,
          title: this.clean(m[2]),
          url: m[1],
          snippet: '',
        });
      }
    }

    return results;
  }

  private clean(str: string): string {
    return str.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").trim();
  }

  private fetchPage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const proto = url.startsWith('https') ? require('https') : require('http');
      const req = proto.get(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 15000,
      }, (res: any) => {
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
