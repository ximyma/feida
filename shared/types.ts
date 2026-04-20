// 共享类型定义
export interface IEmployee {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  position: string;
  rank: string;
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  hireDate: string;
  phone: string;
  email: string;
  salaryLocation: 'shenzhen' | 'nanjing' | 'jiangxi';
  birthday?: string;
  gender?: 'male' | 'female';
  idCard?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  education?: string;
  major?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUser {
  id: string;
  username: string;
  realName: string;
  phone: string;
  email: string;
  password: string;
  userType: 'super_admin' | 'tech_admin' | 'employee';
  roleIds: string;
  status: 'active' | 'inactive' | 'locked' | 'pending';
  employeeId?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
}

export interface IAuditLog {
  id: string;
  userId: string;
  username: string;
  realName: string;
  action: string;
  module: string;
  targetType?: string;
  targetId?: string;
  detail?: string;
  ip?: string;
  timestamp: string;
}
