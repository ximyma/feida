/**
 * glob 工具 — 文件查找
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const PROJECT_ROOT = process.cwd();

export class GlobTool extends BaseTool {
  name = "glob";
  description = "glob tool";
  parameters: ToolParameters = {type:"object",properties:{pattern:{type:"string",description:"glob模式如**/*.ts"}},required:["pattern"]};

  async execute(params: any): Promise<ToolResult> {
    const pattern = params.pattern;
    try {
      // 使用 git ls-files 或 dir 命令
      const cmd = process.platform === 'win32'
        ? `dir /s /b "${PROJECT_ROOT}\\${pattern}" 2>nul`
        : `find "${PROJECT_ROOT}" -name "${pattern}" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*"`;
      const opts: any = { timeout: 10000, maxBuffer: 1024 * 1024, encoding: 'utf-8', shell: true };
      const output = execSync(cmd, opts);
      const files = output.trim().split('\n').filter(Boolean).map(f => f.replace(PROJECT_ROOT + path.sep, '')).slice(0, 100);
      return this.ok({ pattern, count: files.length, files });
    } catch {
      return this.ok({ pattern, count: 0, files: [] });
    }
  }
}
