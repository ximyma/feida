/**
 * 工具注册表 — 自动加载所有内置工具
 * 参照 CowAgent agent/tools/__init__.py
 */
import { ReadFileTool } from './builtin/read-file';
import { WriteFileTool } from './builtin/write-file';
import { PatchTool } from './builtin/patch';
import { BashTool } from './builtin/bash';
import { GrepTool } from './builtin/grep';
import { GlobTool } from './builtin/glob';
import { SqlQueryTool } from './builtin/sql-query';
import { WebSearchTool } from './builtin/web-search';
import { WebFetchTool } from './builtin/web-fetch';
import { toolManager } from './tool-manager';

export function registerAllTools(): void {
  toolManager.registerAll([
    new ReadFileTool(),
    new WriteFileTool(),
    new PatchTool(),
    new BashTool(),
    new GrepTool(),
    new GlobTool(),
    new SqlQueryTool(),
    new WebSearchTool(),
    new WebFetchTool(),
  ]);
}

export { toolManager };
