/**
 * 飞达 Agent 工具系统 — BaseTool 基类
 * 参照 CowAgent agent/tools/base_tool.py
 */

export interface ToolParamSchema {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolParameters {
  type: 'object';
  properties: Record<string, ToolParamSchema>;
  required: string[];
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: ToolParameters;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract parameters: ToolParameters;

  /** 返回标准工具定义 (OpenAI function calling 格式) */
  getSchema(): ToolSchema {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
    };
  }

  /** 子类实现工具执行逻辑 */
  abstract execute(params: Record<string, any>): Promise<ToolResult>;

  /** 安全包装执行，统一错误处理 */
  async executeTool(params: Record<string, any>): Promise<ToolResult> {
    try {
      return await this.execute(params);
    } catch (e: any) {
      return { success: false, error: e.message || String(e) };
    }
  }

  /** 快速创建错误结果 */
  protected fail(error: string): ToolResult {
    return { success: false, error };
  }

  /** 快速创建成功结果 */
  protected ok(data?: any): ToolResult {
    return { success: true, data };
  }
}
