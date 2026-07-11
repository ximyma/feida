/**
 * read_file 工具 — 读取文件内容
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const BINARY_EXTS = ['.db','.db-shm','.db-wal','.exe','.dll','.bin','.so','.dylib','.zip','.7z','.gz','.jpg','.png','.gif','.ico','.woff','.ttf'];

export class ReadFileTool extends BaseTool {
  name = 'read_file';
  description = '读取文件内容。参数: file_path(文件路径), offset(起始行,可选), limit(显示行数,可选,默认500)';
  parameters: ToolParameters = {
    type: 'object',
    properties: {
      file_path: { type: 'string', description: '文件相对于项目根目录的路径' },
      offset: { type: 'number', description: '起始行号，默认1' },
      limit: { type: 'number', description: '显示行数，默认500' },
    },
    required: ['file_path'],
  };

  async execute(params: any): Promise<ToolResult> {
    const fp = path.resolve(PROJECT_ROOT, params.file_path);
    if (!fs.existsSync(fp)) return this.fail(`文件不存在: ${params.file_path}`);
    const stat = fs.statSync(fp);
    if (stat.isDirectory()) return this.fail(`${params.file_path} 是目录，请用 glob 工具`);
    if (stat.size > MAX_FILE_SIZE) return this.fail(`文件过大 (${(stat.size/1024/1024).toFixed(1)}MB)`);

    const ext = path.extname(fp).toLowerCase();
    if (BINARY_EXTS.includes(ext)) return this.fail(`${params.file_path} 是二进制文件，无法读取。查询数据库请用 sql_query 工具`);

    const content = fs.readFileSync(fp, 'utf-8');
    const lines = content.split('\n');
    const offset = params.offset || 1;
    const limit = params.limit || 500;
    let result = '';
    for (let i = Math.max(0, offset - 1); i < Math.min(lines.length, offset - 1 + limit); i++) {
      result += `${offset + (i - offset + 1)}: ${lines[i]}\n`;
    }
    return this.ok({
      file_path: params.file_path,
      total_lines: lines.length,
      shown_lines: `${offset}-${Math.min(lines.length, offset - 1 + limit)}`,
      content: result,
    });
  }
}
