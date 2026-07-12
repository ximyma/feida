/**
 * grep 工具 — 代码搜索
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const PROJECT_ROOT = process.cwd();

export class GrepperTool extends BaseTool {
  name = "grep";
  description = "grep tool";
  parameters: ToolParameters = {type:"object",properties:{pattern:{type:"string",description:"正则表达式"},path:{type:"string",description:"搜索路径"}},required:["pattern"]};

  async execute(params: any): Promise<ToolResult> {
    const pattern = params.pattern;
    const dir = path.resolve(PROJECT_ROOT, params.path || '.');
    try {
      const opts: any = { timeout: 15000, maxBuffer: 5 * 1024 * 1024, encoding: 'utf-8', shell: true };
      const output = execSync(`rg -n --max-count=50 "${pattern.replace(/"/g, '\\"')}" "${dir}" --glob '!node_modules' --glob '!.git' --glob '!dist' --glob '!data'`, opts);
      const lines = output.trim().split('\n').slice(0, 50);
      return this.ok({ pattern, matches: lines.length, lines });
    } catch (e: any) {
      if (e.status === 1) return this.ok({ pattern, matches: 0, lines: [] });
      // rg 不可用时用 findstr
      try {
        const out = execSync(`findstr /s /n /i "${pattern}" "${dir}\\*.ts" "${dir}\\*.tsx" "${dir}\\*.js" 2>nul`, {
          timeout: 15000, maxBuffer: 5 * 1024 * 1024, encoding: 'utf-8',
        });
        const lines = out.trim().split('\n').slice(0, 50);
        return this.ok({ pattern, matches: lines.length, lines });
      } catch {
        return this.fail(`搜索失败: ${e.message}`);
      }
    }
  }
}
