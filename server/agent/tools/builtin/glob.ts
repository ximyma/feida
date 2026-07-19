/**
 * glob 工具 — 文件查找
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const PROJECT_ROOT = (() => {
  const cwd = process.cwd().replace(/\\/g, '/');
  // 保持 Git Bash 路径格式 (/d/feida) — find 命令需要此格式
  return cwd;
})();

export class GlobTool extends BaseTool {
  name = "glob";
  description = "glob tool";
  parameters: ToolParameters = {type:"object",properties:{pattern:{type:"string",description:"glob模式如**/*.ts"}},required:["pattern"]};

  async execute(params: any): Promise<ToolResult> {
    const pattern = params.pattern;
    try {
      const root = PROJECT_ROOT;
      const cmd = `find "${root}" -path "${root}/${pattern}" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/.workbuddy/*" -not -path "*/cms/*" -not -path "*/shopxo/*" 2>/dev/null`;
      const opts: any = { timeout: 15000, maxBuffer: 1024 * 1024, encoding: 'utf-8', shell: true };
      const output = execSync(cmd, opts);
      const files = output.trim().split('\n').filter(Boolean)
        .map(f => {
          const rel = f.replace(root.replace(/\\/g, '/') + '/', '');
          return rel.startsWith('/') ? rel.slice(1) : rel;
        })
        .slice(0, 100);
      return this.ok({ pattern, count: files.length, files });
    } catch {
      return this.ok({ pattern, count: 0, files: [] });
    }
  }
}
