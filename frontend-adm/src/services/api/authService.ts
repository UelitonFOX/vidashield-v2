import api from '../api';
import { AuthResponse, User } from './types';

// Interface para a resposta do login
interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

// Interface para manutenção de estado entre requisições
interface VerificationState {
  csrf_token?: string;
  attempts?: number;
}

/**
 * Serviço de autenticação para API
 */
const authService = {
  /**
   * Realiza login com email e senha
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Primeiro obter o token CSRF
    const csrfResponse = await api.get('/auth/csrf-token');
    const csrf_token = csrfResponse.data.csrf_token;
    
    // Enviar credenciais com o token CSRF
    const response = await api.post('/auth/login', {
      email,
      password,
      csrf_token
    });
    
    return response.data;
  },
  
  /**
   * Realiza logout do usuário
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  },
  
  /**
   * Obtém token JWT a partir de um código de autorização OAuth
   * Este método está disponível para compatibilidade, mas não é mais usado
   * pois o token agora vem diretamente do backend via redirecionamento
   */
  oauthLogin: async (authorizationCode: string): Promise<LoginResponse> => {
    console.log(`Método legado: oauthLogin chamado com código: ${authorizationCode.substring(0, 10)}...`);
    
    // Retorna uma Promise rejeitada, pois este método não deve mais ser usado
    return Promise.reject(new Error('Método obsoleto: o token deve vir diretamente do backend'));
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
  }
};

// Exportar o serviço completo como padrão
export default authService;

// Também exportar funções individuais para import nomeado
export const { login, logout, oauthLogin } = authService; 