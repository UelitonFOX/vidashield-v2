import api from '../api';
import { User } from '../../contexts/AuthContext';

export type Role = 'admin' | 'manager' | 'user';

export interface Permission {
  id: number;
  name: string;
  description: string;
  roles: Role[];
}

// Lista de permissões do sistema
export const SystemPermissions = {
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
  VIEW_LOGS: 'view_logs',
  VIEW_ALERTS: 'view_alerts',
  MANAGE_ALERTS: 'manage_alerts',
  MANAGE_SECURITY: 'manage_security',
};

// Mapeamento de permissões por função
export const RolePermissions: Record<Role, string[]> = {
  admin: Object.values(SystemPermissions),
  manager: [
    SystemPermissions.VIEW_USERS,
    SystemPermissions.VIEW_SETTINGS,
    SystemPermissions.VIEW_REPORTS,
    SystemPermissions.EXPORT_REPORTS,
    SystemPermissions.VIEW_LOGS,
    SystemPermissions.VIEW_ALERTS,
    SystemPermissions.MANAGE_ALERTS
  ],
  user: [
    SystemPermissions.VIEW_REPORTS,
    SystemPermissions.VIEW_LOGS,
    SystemPermissions.VIEW_ALERTS
  ]
};

// Verificar se o usuário tem determinada permissão
export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;
  
  const role = user.role || 'user';
  return RolePermissions[role].includes(permission);
};

// Verificar se o usuário é administrador
export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

// Verificar se o usuário é gerente ou superior
export const isManagerOrAdmin = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'manager';
};

// Serviço para gerenciar permissões e funções de usuário
const permissionService = {
  // Obter todas as permissões disponíveis
  getPermissions: async (): Promise<Permission[]> => {
    const response = await api.get('/permissions');
    return response.data.permissions;
  },
  
  // Atualizar a função de um usuário
  updateUserRole: async (userId: number, role: Role): Promise<User> => {
    const response = await api.put(`/users/${userId}`, { role });
    return response.data.user;
  },
  
  // Promover um usuário para administrador
  promoteToAdmin: async (userId: number): Promise<User> => {
    const response = await api.put(`/users/${userId}/promote`);
    return response.data.user;
  },
  
  // Verificar se o usuário tem permissão para acessar determinada rota
  checkRouteAccess: (user: User | null, requiredPermission: string): boolean => {
    return hasPermission(user, requiredPermission);
  },
  
  // Criar o administrador padrão do sistema (apenas para ambiente de desenvolvimento)
  createDefaultAdmin: async (): Promise<User> => {
    try {
      const response = await api.post('/auth/create-admin', {
        email: 'admin@vidashield.com',
        name: 'Administrador do Sistema',
        password: 'vidashield@admin'
      });
      return response.data.user;
    } catch (error) {
      // Se o administrador já existir, apenas retornamos um objeto genérico
      console.warn("Não foi possível criar o admin padrão, provavelmente já existe.");
      return {
        id: 1,
        name: 'Administrador do Sistema',
        email: 'admin@vidashield.com',
        role: 'admin'
      };
    }
  }
};

export default permissionService; 