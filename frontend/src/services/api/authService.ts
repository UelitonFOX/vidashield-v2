import api from '../api';
import { AuthResponse, User } from './types';

const authService = {
  // Login com email e senha
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    return response.data;
  },
  
  // Login com OAuth (Google, etc)
  oauthLogin: async (code: string, provider: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(`/auth/oauth/${provider}`, { code });
    return response.data;
  },
  
  // Registro de novo usuário
  register: async (userData: { name: string, email: string, password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },
  
  // Recuperação de senha
  recoverPassword: async (email: string): Promise<{msg: string}> => {
    const response = await api.post<{msg: string}>('/auth/recover', { email });
    return response.data;
  },
  
  // Redefinição de senha
  resetPassword: async (token: string, password: string): Promise<{msg: string}> => {
    const response = await api.post<{msg: string}>('/auth/reset-password', { token, password });
    return response.data;
  },
  
  // Verificar permissões do usuário
  checkPermissions: async (): Promise<{isAdmin: boolean}> => {
    const response = await api.get<{isAdmin: boolean}>('/auth/check-role');
    return response.data;
  },
  
  // Obter dados do usuário atual
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{user: User}>('/auth/me');
    return response.data.user;
  },
  
  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  }
};

export default authService; 