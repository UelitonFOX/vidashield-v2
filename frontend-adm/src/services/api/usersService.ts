import api from '../api';
import { User, UsersResponse, UserResponse, PendingUsersResponse, ApiBaseResponse } from './types';

interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
}

interface MessageResponse extends ApiBaseResponse {
  success: boolean;
}

const usersService = {
  // Obter lista de usuários com paginação e filtros
  getUsers: async (filters: UserFilters = {}): Promise<UsersResponse> => {
    const { page = 1, limit = 10, search = '', status = '', role = '' } = filters;
    const params = new URLSearchParams();
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (role) params.append('role', role);
    
    const response = await api.get<UsersResponse>(`/users?${params.toString()}`);
    return response.data;
  },
  
  // Obter lista de usuários pendentes
  getPendingUsers: async (): Promise<PendingUsersResponse> => {
    const response = await api.get<PendingUsersResponse>('/users/pending');
    return response.data;
  },
  
  // Criar um novo usuário
  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post<UserResponse>('/users', userData);
    return response.data.user;
  },
  
  // Atualizar um usuário existente
  updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
    const response = await api.put<UserResponse>(`/users/${userId}`, userData);
    return response.data.user;
  },
  
  // Aprovar um usuário pendente
  approveUser: async (userId: string): Promise<User> => {
    const response = await api.patch<UserResponse>(`/users/${userId}/approve`);
    return response.data.user;
  },
  
  // Rejeitar um usuário pendente
  rejectUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}/reject`);
  },
  
  // Resetar a senha de um usuário
  resetPassword: async (userId: string): Promise<void> => {
    await api.post(`/users/${userId}/reset-password`);
  },
  
  // Promover um usuário para administrador
  promoteUser: async (userId: string): Promise<User> => {
    const response = await api.put<UserResponse>(`/users/${userId}/promote`);
    return response.data.user;
  },
  
  // Atualizar o status de um usuário (ativar/desativar)
  updateUserStatus: async (userId: string, status: 'active' | 'inactive' | 'ativo' | 'pendente' | 'recusado'): Promise<User> => {
    const response = await api.put<UserResponse>(`/users/${userId}/status`, { status });
    return response.data.user;
  }
};

export default usersService;
export type { User, UsersResponse, UserFilters, MessageResponse }; 