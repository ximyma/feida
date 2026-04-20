import { useState, useCallback, useEffect } from 'react';

const API_BASE = '/api';

// 通用 API 请求函数
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  return response.json();
}

// 通用 CRUD Hook
export function useAPI<T extends { id: string }>(table: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiRequest<T[]>(`/${table}`);
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [table]);

  const fetchWhere = useCallback(async (where: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(where as any);
      const result = await apiRequest<T[]>(`/${table}?${params}`);
      setData(result);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [table]);

  const findById = useCallback(async (id: string): Promise<T | null> => {
    try {
      return await apiRequest<T>(`/${table}/${id}`);
    } catch {
      return null;
    }
  }, [table]);

  const create = useCallback(async (item: Omit<T, 'id'>): Promise<T | null> => {
    try {
      const result = await apiRequest<T>(`/${table}`, {
        method: 'POST',
        body: JSON.stringify({ ...item, id: `${table.slice(0, 2)}_${Date.now()}` }),
      });
      setData(prev => [...prev, result]);
      return result;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, [table]);

  const update = useCallback(async (id: string, patch: Partial<T>): Promise<T | null> => {
    try {
      const result = await apiRequest<T>(`/${table}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patch),
      });
      setData(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
      return result;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, [table]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`/${table}/${id}`, { method: 'DELETE' });
      setData(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  }, [table]);

  const batchCreate = useCallback(async (items: Partial<T>[]): Promise<boolean> => {
    try {
      await apiRequest(`/${table}/batch/create`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      });
      await fetchAll();
      return true;
    } catch (e: any) {
      setError(e.message);
      return false;
    }
  }, [table, fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    data,
    loading,
    error,
    fetchAll,
    fetchWhere,
    findById,
    create,
    update,
    remove,
    batchCreate,
    setData,
  };
}

// 特定表的类型导出
export type { IEmployee } from './types';

// 便捷 Hook 工厂函数
export function createAPIHooks() {
  return {
    useEmployees: () => useAPI<any>('employees'),
    useRanks: () => useAPI<any>('ranks'),
    useSalaries: () => useAPI<any>('salaries'),
    useUsers: () => useAPI<any>('users'),
    useRoles: () => useAPI<any>('roles'),
    usePermissions: () => useAPI<any>('permissions'),
    useAuditLogs: () => useAPI<any>('audit_logs'),
    useSystemConfig: () => useAPI<any>('system_config'),
    useAttendanceRecords: () => useAPI<any>('attendance_records'),
    useContracts: () => useAPI<any>('contracts'),
    useLeaveRecords: () => useAPI<any>('leave_records'),
    usePerformanceRecords: () => useAPI<any>('performance_records'),
    useShiftTypes: () => useAPI<any>('shift_types'),
    useSchedules: () => useAPI<any>('schedules'),
    useOvertimeRecords: () => useAPI<any>('overtime_records'),
    useAttendanceRules: () => useAPI<any>('attendance_rules'),
    useCheckLocations: () => useAPI<any>('check_locations'),
    useRecruitmentPositions: () => useAPI<any>('recruitment_positions'),
    useCandidates: () => useAPI<any>('candidates'),
    useDormitories: () => useAPI<any>('dormitories'),
    useVehicles: () => useAPI<any>('vehicles'),
    useVisitors: () => useAPI<any>('visitors'),
    useKpis: () => useAPI<any>('kpis'),
    usePerformanceCycles: () => useAPI<any>('performance_cycles'),
    useSalaryAdjustments: () => useAPI<any>('salary_adjustments'),
    useFieldDefinitions: () => useAPI<any>('field_definitions'),
    useReminders: () => useAPI<any>('reminders'),
    useEmployeeChanges: () => useAPI<any>('employee_changes'),
  };
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, body: any) => apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: any) => apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Auth API
export const authAPI = {
  login: (username: string, password: string) => 
    api.post('/auth/login', { username, password }),
  register: (data: any) => 
    api.post('/auth/register', data),
  changePassword: (userId: string, oldPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { userId, oldPassword, newPassword }),
};
