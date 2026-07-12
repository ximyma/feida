/**
 * send_file 工具 — Agent执行完成后自动发送文件给用户
 * 参照 CowAgent agent/tools/send/send.py
 */
import { BaseTool, ToolStage, ToolParameters, ToolResult } from '../base-tool';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

export class SendFileTool extends BaseTool {
  name = "send_file";
  description = "send_file tool";
  stage = ToolStage.PRE_PROCESS;
  parameters: ToolParameters = {
    type: 'object',
    properties: {
      file_path: { type: 'string', description: '要发送的文件路径' },
    },
    required: ['file_path'],
  };

  async execute(params: Record<string, any>): Promise<ToolResult> {
    const fp = path.resolve(PROJECT_ROOT, params.file_path || '');
    if (!fs.existsSync(fp)) return this.fail(`文件不存在: ${params.file_path}`);
    const stat = fs.statSync(fp);
    if (stat.size > 50 * 1024 * 1024) return this.fail('文件过大 (超过50MB)');

    const ext = path.extname(fp).toLowerCase();
    let mimeType: string;
    if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(ext)) mimeType = 'image';
    else if (/\.(mp4|webm|mov|avi)$/i.test(ext)) mimeType = 'video';
    else if (/\.(mp3|wav|ogg)$/i.test(ext)) mimeType = 'audio';
    else if (/\.(pdf|docx?|xlsx?|pptx?|txt|md|csv|json|html)$/i.test(ext)) mimeType = 'document';
    else mimeType = 'other';

    return this.ok({
      type: 'file_to_send',
      mime_type: mimeType,
      file_path: fp,
      file_name: path.basename(fp),
      file_size: stat.size,
    });
  }
}
