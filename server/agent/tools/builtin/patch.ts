/**
 * patch 工具 — 精确文本替换 (参照 CowAgent Edit 工具)
 */
import { BaseTool, ToolParameters, ToolResult } from '../base-tool';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

export class PatcherTool extends BaseTool {
  name = "patch";
  description = "patch tool";
  parameters: ToolParameters = {type:"object",properties:{file_path:{type:"string",description:"文件路径"},old_str:{type:"string",description:"旧文本"},new_str:{type:"string",description:"新文本"}},required:["file_path","old_str","new_str"]};

  async execute(params: any): Promise<ToolResult> {
    const fp = path.resolve(PROJECT_ROOT, params.file_path);
    if (!fs.existsSync(fp)) return this.fail(`文件不存在: ${params.file_path}`);
    const content = fs.readFileSync(fp, 'utf-8');
    if (!content.includes(params.old_string)) return this.fail(`未找到匹配文本，请检查 old_string`);
    const count = content.split(params.old_string).length - 1;
    if (count > 1) return this.fail(`找到 ${count} 处匹配，请提供更精确的 old_string`);
    const newContent = content.replace(params.old_string, params.new_string);
    fs.writeFileSync(fp, newContent, 'utf-8');
    return this.ok({ file_path: params.file_path, replaced: true, occurrences: 1 });
  }
}
