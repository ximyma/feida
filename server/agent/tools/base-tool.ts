/**
 * 飞达 Agent 工具系统 — BaseTool 基类
 * 参照 CowAgent agent/tools/base_tool.py (v2.1.0)
 *
 * v2 新增: ToolStage / Progress回调 / 失败追踪 / 资源清理
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

/** 工具执行阶段 (参考 CowAgent ToolStage) */
export enum ToolStage {
  /** LLM 主动调用的工具 (默认) */
  PRE_PROCESS = 'pre_process',
  /** Agent 执行完后自动运行的后处理工具 (如文件发送) */
  POST_PROCESS = 'post_process',
}

export interface ProgressCallback {
  (message: string): void;
}

export abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract parameters: ToolParameters;

  /** 工具执行阶段 */
  stage: ToolStage = ToolStage.PRE_PROCESS;

  /** 进度回调 (由 Agent 设置) */
  progressCallback?: ProgressCallback;

  /** 失败计数 (防止无限重试) */
  failureCount = 0;

  /** 返回标准工具定义 (OpenAI function calling 格式) */
  getSchema(): ToolSchema {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameters,
    };
  }

  /** 报告执行进度 */
  reportProgress(message: string): void {
    if (this.progressCallback) {
      try { this.progressCallback(message); } catch { /* ignore */ }
    }
  }

  /** 子类实现工具执行逻辑 */
  abstract execute(params: Record<string, any>): Promise<ToolResult>;

  /** 安全包装执行，统一错误处理 + 失败计数 */
  async executeTool(params: Record<string, any>): Promise<ToolResult> {
    try {
      return await this.execute(params);
    } catch (e: any) {
      this.failureCount++;
      return { success: false, error: e.message || String(e) };
    }
  }

  /** 重置失败计数 */
  resetFailureCount(): void {
    this.failureCount = 0;
  }

  /** 资源清理 (子类可重写) */
  async close(): Promise<void> {
    // 默认空实现
  }

  /** 快速创建错误结果 */
  protected fail(error: string): ToolResult {
    this.failureCount++;
    return { success: false, error };
  }

  /** 快速创建成功结果 */
  protected ok(data?: any): ToolResult {
    return { success: true, data };
  }
}
