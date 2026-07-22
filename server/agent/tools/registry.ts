/**
 * 工具注册表 — 自动加载所有内置工具
 * 参照 CowAgent agent/tools/__init__.py
 */
import { ReadFileTool } from './builtin/read-file';
import { WriteFileTool } from './builtin/write-file';
import { PatcherTool } from './builtin/patch';
import { BashTool } from './builtin/bash';
import { GrepperTool } from './builtin/grep';
import { GlobTool } from './builtin/glob';
import { SqlQueryTool } from './builtin/sql-query';
import { WebSearchTool } from './builtin/web-search';
import { WebFetchTool } from './builtin/web-fetch';
import { SearchNewsTool } from './builtin/search-news';
import { SendFileTool } from './builtin/send-file';
import { MemorySearchTool } from './builtin/memory-search';
import { MemoryGetTool } from './builtin/memory-get';
import { KnowledgeSearchTool } from './builtin/kb-search';
import { toolManager } from './tool-manager';

export function registerAllTools(): void {
  toolManager.registerAll([
    new ReadFileTool(), new WriteFileTool(), new PatcherTool(),
    new BashTool(), new GrepperTool(), new GlobTool(),
    new SqlQueryTool(), new WebSearchTool(), new WebFetchTool(), new SearchNewsTool(),
    new SendFileTool(),
    new MemorySearchTool(), new MemoryGetTool(),
    new KnowledgeSearchTool(),
  ]);
}

export { toolManager };
