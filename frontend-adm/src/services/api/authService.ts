import api from '../api';
import { User } from './types';

/**
 * Serviço de autenticação para API
 */
const authService = {
  /**
   * Verificar token usando o endpoint /verify_token
   * Esta função será usada para validar se o token do Auth0 está sendo aceito pelo backend
   */
  verifyToken: async (): Promise<boolean> => {
    try {
      const response = await api.get('/auth/verify_token');
      return response.data?.valid === true;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  },
  
  /**
   * Obter dados do usuário atual
   * Usa o token Auth0 enviado no header
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
  
  /**
   * Verificar permissões do usuário
   * Usa o token Auth0 enviado no header
   */
  checkPermissions: async (role: string): Promise<{has_role: boolean, user_permissions: string[]}> => {
    const response = await api.get(`/auth/check-role?role=${role}`);
    return response.data;
  },
  
  /**
   * Obter token CSRF para requisições que exigem proteção CSRF
   */
  getCsrfToken: async (): Promise<string | null> => {
    try {
      const response = await api.get('/auth/csrf-token');
      return response.data?.csrf_token || null;
    } catch (error) {
      console.error('Erro ao obter token CSRF:', error);
      return null;
    }
  }
};

// Exportar o serviço completo como padrão
export default authService; 