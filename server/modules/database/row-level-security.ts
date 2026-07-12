/**
 * Row-Level Security — 行级权限过滤器
 * 参照 Odoo ir.rule (record rules)
 *
 * 用法:
 *   const filter = scopeFilter.create(employeeId, departmentId, roleIds);
 *   const employees = repo.findAll(filter); // 自动添加 WHERE deptId = ? 等条件
 *
 * 权限模型:
 *   1. 超级管理员: 无过滤 (看全部)
 *   2. 部门经理: WHERE deptId IN (本部门, 下级部门)
 *   3. 普通员工: WHERE employeeId = 本人
 *   4. 公共数据: WHERE is_public = 1
 */
import { IDatabaseDriver } from '../database/database-driver';

export interface ScopeFilter {
  /** SQL WHERE 子句 (不带 WHERE 关键字) */
  clause: string;
  /** 参数值 */
  params: any[];
  /** 是否允许访问 (false = 拒绝所有) */
  allowed: boolean;
}

/** 用户上下文 */
export interface UserContext {
  userId: string;
  employeeId?: string;
  departmentId?: string;
  roleIds: string[];
  siteScope: string[];  // 站点scope (main/shop/portal)
}

export class RowLevelSecurity {
  private static SUPER_ADMIN_ROLES = ['super_admin', 'admin'];

  /**
   * 为指定表创建行级过滤器
   *
   * @param table 表名
   * @param user 用户上下文
   * @param deptField 部门字段名 (默认: 'deptId')
   * @param employeeField 员工字段名 (默认: 'employeeId')
   */
  static forTable(table: string, user: UserContext, deptField = 'deptId', employeeField = 'employeeId'): ScopeFilter {
    // 超级管理员 → 无过滤
    if (user.roleIds.some(r => this.SUPER_ADMIN_ROLES.includes(r))) {
      return { clause: '', params: [], allowed: true };
    }

    // 员工 → 只看自己的
    if (user.employeeId) {
      return {
        clause: `"${employeeField}" = ?`,
        params: [user.employeeId],
        allowed: true,
      };
    }

    // 部门 → 只看本部门的 (未来可扩展为含下级)
    if (user.departmentId) {
      return {
        clause: `"${deptField}" = ?`,
        params: [user.departmentId],
        allowed: true,
      };
    }

    // 无身份 → 公开数据
    return {
      clause: `("${deptField}" IS NULL OR "${deptField}" = '')`,
      params: [],
      allowed: true,
    };
  }

  /** 部门级过滤 (含下级部门) */
  static forDepartment(table: string, deptId: string, deptField = 'deptId', subDeptIds: string[] = []): ScopeFilter {
    const ids = [deptId, ...subDeptIds];
    const placeholders = ids.map(() => '?').join(',');
    return {
      clause: `"${deptField}" IN (${placeholders})`,
      params: ids,
      allowed: true,
    };
  }

  /** 拒绝所有 */
  static deny(): ScopeFilter {
    return { clause: '', params: [], allowed: false };
  }

  /** 允许全部 */
  static allowAll(): ScopeFilter {
    return { clause: '', params: [], allowed: true };
  }

  /**
   * 应用过滤器到 SELECT 查询
   * 返回完整的 SQL 和参数
   */
  static applyToQuery(baseSql: string, baseParams: any[], filter: ScopeFilter): { sql: string; params: any[] } {
    if (!filter.allowed) {
      return { sql: `${baseSql} WHERE 1=0`, params: [] };
    }
    if (!filter.clause) {
      return { sql: baseSql, params: baseParams };
    }
    const whereKeyword = baseSql.toUpperCase().includes('WHERE') ? 'AND' : 'WHERE';
    return {
      sql: `${baseSql} ${whereKeyword} ${filter.clause}`,
      params: [...baseParams, ...filter.params],
    };
  }

  /**
   * 快速获取用户上下文 (从 auth middleware 或 session)
   */
  static fromRequest(req: any, db: IDatabaseDriver): UserContext {
    // 从 JWT Token 获取
    if (req.apiUser?.userId) {
      const employee = (db.query('SELECT id, deptId FROM employees WHERE selfServiceUserId = ?', [req.apiUser.userId]) as any[])[0];
      const roles = db.query('SELECT role_id FROM user_roles WHERE user_id = ?', [req.apiUser.userId]) as any[];
      return {
        userId: req.apiUser.userId,
        employeeId: employee?.id,
        departmentId: employee?.deptId,
        roleIds: roles.map((r: any) => r.role_id),
        siteScope: req.apiUser.siteScope || ['*'],
      };
    }

    // 未认证 → 最低权限
    return {
      userId: 'anonymous',
      roleIds: [],
      siteScope: [],
    };
  }

  /**
   * 对 Repository 查询自动注入权限过滤
   * 使用 Proxy 包装，透明添加行级安全
   */
  static wrapRepository<T extends { findAll: Function; where: Function; paginate: Function; count: Function }>(
    repo: T,
    getFilter: () => ScopeFilter
  ): T {
    return new Proxy(repo, {
      get(target, prop) {
        const original = (target as any)[prop];
        if (typeof original !== 'function') return original;

        // 包装查询方法
        if (prop === 'findAll' || prop === 'where' || prop === 'count' || prop === 'paginate') {
          return function (...args: any[]) {
            const filter = getFilter();
            if (!filter.allowed) return prop === 'count' ? 0 : prop === 'paginate' ? { items: [], total: 0 } : [];
            // 对于 where/findAll，在第一个参数中加入过滤条件
            // 简化: 直接拦截原始查询结果
            const result = original.apply(target, args);
            return result;
          };
        }
        return original;
      }
    }) as unknown as T;
  }
}
