import api from '../api';
import { User } from './types';
import axios from 'axios';

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
      const response = await api.get('/api/auth/verify_token');
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
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  /**
   * Verificar permissões do usuário
   * Usa o token Auth0 enviado no header
   */
  checkPermissions: async (role: string): Promise<{ has_role: boolean; user_permissions: string[] }> => {
    const response = await api.get(`/api/auth/check-role?role=${role}`);
    return response.data;
  },

  /**
   * Verificar token do hCaptcha
   * @param token Token gerado pelo componente hCaptcha
   */
  verifyCaptcha: async (token: string): Promise<boolean> => {
    try {
      console.log('Enviando token hCaptcha para verificação:', token);
      
      // Usar axios diretamente ao invés da instância api configurada com interceptor
      // Isso evita que o token JWT seja adicionado automaticamente pelo interceptor
      const API_BASE_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL || 'https://vidashield.onrender.com';
      const response = await axios.post(`${API_BASE_URL}/auth/verify-captcha`, { token }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Resposta da verificação do captcha:', response.data);
      return response.data?.success === true;
    } catch (error) {
      console.error('Erro ao verificar captcha:', error);
      return false;
    }
  },

  /**
   * Obter token CSRF para requisições que exigem proteção CSRF
   */
  getCsrfToken: async (): Promise<string | null> => {
    try {
      const response = await api.get('/api/auth/csrf-token');
      return response.data?.csrf_token || null;
    } catch (error) {
      console.error('Erro ao obter token CSRF:', error);
      return null;
    }
  }
};

// Exportar o serviço completo como padrão
export default authService;
