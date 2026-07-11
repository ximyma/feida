/**
 * write_file 工具 — 写入文件
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

export class WriteFileTool extends BaseTool {
  name = 'write_file';
  description = '写入或覆盖文件内容。参数: file_path(路径), content(内容)';
  parameters: ToolParameters = {
    type: 'object',
    properties: {
      file_path: { type: 'string', description: '文件路径' },
      content: { type: 'string', description: '文件内容' },
    },
    required: ['file_path', 'content'],
  };

  async execute(params: any): Promise<ToolResult> {
    const fp = path.resolve(PROJECT_ROOT, params.file_path);
    if (!fp.startsWith(PROJECT_ROOT)) return this.fail('路径不允许');
    fs.mkdirSync(path.dirname(fp), { recursive: true });
    fs.writeFileSync(fp, params.content, 'utf-8');
    return this.ok({ file_path: params.file_path, written: true });
  }
}
