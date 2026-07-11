/**
 * bash 工具 — 执行系统命令 (参照 CowAgent Bash 工具)
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';
import { execSync } from 'child_process';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const BASH_TIMEOUT = 30000;
const DANGEROUS = ['rm -rf', 'dd if=', 'shutdown', 'reboot', 'mkfs', ':(){:', '> /dev/sda'];

export class BashTool extends BaseTool {
  name = 'bash';
  description = '执行 shell 命令并返回输出。参数: command(命令), timeout(超时秒数,可选,默认30)';
  parameters: ToolParameters = {
    type: 'object',
    properties: {
      command: { type: 'string', description: '要执行的命令' },
      timeout: { type: 'number', description: '超时秒数，默认30' },
    },
    required: ['command'],
  };

  async execute(params: any): Promise<ToolResult> {
    const cmd = params.command?.trim();
    if (!cmd) return this.fail('命令为空');

    // 安全检查
    if (DANGEROUS.some(d => cmd.toLowerCase().includes(d))) {
      return this.fail('命令包含危险操作，已拒绝');
    }

    try {
      const opts: any = { cwd: PROJECT_ROOT, timeout: (params.timeout || 30) * 1000, maxBuffer: 10 * 1024 * 1024, encoding: 'utf-8', shell: true };
      const output = execSync(cmd, opts);
      return this.ok({ stdout: output.slice(0, 8000), exit_code: 0 });
    } catch (e: any) {
      return this.ok({
        stdout: (e.stdout || '').toString().slice(0, 2000),
        stderr: (e.stderr || e.message || '').toString().slice(0, 2000),
        exit_code: e.status || 1,
      });
    }
  }
}
