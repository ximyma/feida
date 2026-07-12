/**
 * 前端模块路由注册器
 * 从 modules/*/routes.tsx 自动加载前端路由
 *
 * 每个模块导出:
 *   { path: string; element: JSX.Element; label: string; icon?: string }[]
 */
import React from 'react';

interface ModuleRoute {
  path: string;
  element: React.ReactNode;
  label: string;
  icon?: string;
  category?: string;
  order?: number;
}

const moduleRoutes: ModuleRoute[] = [];

/** 注册模块路由 */
export function registerModuleRoute(route: ModuleRoute) {
  moduleRoutes.push(route);
}

/** 获取所有已注册模块路由 */
export function getModuleRoutes(): ModuleRoute[] {
  return moduleRoutes.sort((a, b) => (a.order || 100) - (b.order || 100));
}

/** 按分类分组 */
export function getModuleRoutesByCategory(): Record<string, ModuleRoute[]> {
  const groups: Record<string, ModuleRoute[]> = {};
  for (const r of getModuleRoutes()) {
    const cat = r.category || '其他';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  }
  return groups;
}

/**
 * 自动发现: 扫描 modules/ 目录下的 routes.tsx
 * 在客户端构建时由 Vite 处理
 */
export function autoDiscoverModules(modules: Record<string, any>) {
  for (const [name, mod] of Object.entries(modules)) {
    if (mod?.routes && Array.isArray(mod.routes)) {
      for (const route of mod.routes) {
        moduleRoutes.push({ ...route, category: name });
      }
    }
  }
}

// 示例: 从 blog 模块注册路由
// 在实际使用时，由 Vite 的动态 import 自动处理:
// import.meta.glob('/modules/*/routes.tsx', { eager: true })
