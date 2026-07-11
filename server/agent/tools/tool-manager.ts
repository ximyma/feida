/**
 * 飞达 Agent 工具系统 — ToolManager 单例
 * 参照 CowAgent agent/tools/tool_manager.py
 */
import { BaseTool, ToolSchema } from './base-tool';

class ToolManager {
  private static _instance: ToolManager;
  private registry: Map<string, BaseTool> = new Map();

  static getInstance(): ToolManager {
    if (!ToolManager._instance) {
      ToolManager._instance = new ToolManager();
    }
    return ToolManager._instance;
  }

  /** 注册工具 */
  register(tool: BaseTool): void {
    this.registry.set(tool.name, tool);
  }

  /** 批量注册 */
  registerAll(tools: BaseTool[]): void {
    for (const t of tools) this.register(t);
  }

  /** 获取单个工具实例 */
  get(name: string): BaseTool | undefined {
    return this.registry.get(name);
  }

  /** 获取所有工具 */
  list(): BaseTool[] {
    return Array.from(this.registry.values());
  }

  /** 获取所有工具的 schema (用于 LLM function calling) */
  getToolSchemas(): ToolSchema[] {
    return this.list().map(t => t.getSchema());
  }

  /** 获取工具数量 */
  get size(): number {
    return this.registry.size;
  }

  /** 执行工具 */
  async execute(name: string, params: Record<string, any>): Promise<any> {
    const tool = this.registry.get(name);
    if (!tool) return { error: `未知工具: ${name}` };
    const result = await tool.executeTool(params);
    if (!result.success) return { error: result.error, tool: name };
    return result.data ?? result;
  }

  /** 清理注册表 (测试用) */
  clear(): void {
    this.registry.clear();
  }
}

export const toolManager = ToolManager.getInstance();
export { ToolManager };
