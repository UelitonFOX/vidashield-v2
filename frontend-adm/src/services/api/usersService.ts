import { User, UsersResponse, UserResponse, PendingUsersResponse, ApiBaseResponse } from './types';
import { useAuthFetch } from '../../utils/useAuthFetch';

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

// Dados mockados para evitar requisições em desenvolvimento
const mockData = {
  users: {
    users: [
      { id: '1', name: 'João Silva', email: 'joao@vidashield.com', role: 'admin', status: 'ativo', created_at: '2025-01-15T08:30:00' },
      { id: '2', name: 'Maria Souza', email: 'maria@vidashield.com', role: 'manager', status: 'ativo', created_at: '2025-01-20T14:15:00' },
      { id: '3', name: 'Pedro Santos', email: 'pedro@vidashield.com', role: 'usuario', status: 'ativo', created_at: '2025-02-05T11:20:00' },
      { id: '4', name: 'Ana Oliveira', email: 'ana@vidashield.com', role: 'usuario', status: 'ativo', created_at: '2025-02-10T09:45:00' },
      { id: '5', name: 'Carlos Pereira', email: 'carlos@vidashield.com', role: 'usuario', status: 'inativo', created_at: '2025-03-01T16:30:00' },
      { id: '6', name: 'Juliana Lima', email: 'juliana@vidashield.com', role: 'usuario', status: 'ativo', created_at: '2025-03-15T13:10:00' },
      { id: '7', name: 'Roberto Alves', email: 'roberto@vidashield.com', role: 'usuario', status: 'ativo', created_at: '2025-04-02T10:25:00' },
      { id: '8', name: 'Fernanda Costa', email: 'fernanda@vidashield.com', role: 'usuario', status: 'pendente', created_at: '2025-04-08T15:50:00' },
      { id: '9', name: 'Marcelo Dias', email: 'marcelo@vidashield.com', role: 'usuario', status: 'pendente', created_at: '2025-04-12T09:15:00' },
      { id: '10', name: 'Luciana Martins', email: 'luciana@vidashield.com', role: 'usuario', status: 'recusado', created_at: '2025-04-18T11:40:00' }
    ],
    total: 10,
    page: 1,
    limit: 10,
    total_pages: 1
  },
  pending_users: {
    users: [
      { id: '8', name: 'Fernanda Costa', email: 'fernanda@vidashield.com', role: 'usuario', status: 'pendente', created_at: '2025-04-08T15:50:00' },
      { id: '9', name: 'Marcelo Dias', email: 'marcelo@vidashield.com', role: 'usuario', status: 'pendente', created_at: '2025-04-12T09:15:00' }
    ],
    total: 2
  },
  user_response: {
    user: { 
      id: '1', 
      name: 'João Silva', 
      email: 'joao@vidashield.com', 
      role: 'admin', 
      status: 'ativo', 
      created_at: '2025-01-15T08:30:00'
    },
    message: 'Operação realizada com sucesso'
  }
};

// Hook para serviço de usuários com Auth0
export const useUsersService = () => {
  const { authFetch, hasFetched, isLoading, error } = useAuthFetch();

  // Filtragem dos dados mockados
  const filterMockUsers = (params: UserFilters): UsersResponse => {
    const { page = 1, limit = 10, search = '', status = '', role = '' } = params;
    
    let filteredUsers = [...mockData.users.users];
    
    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) || 
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (status) {
      filteredUsers = filteredUsers.filter(user => user.status === status);
    }
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    // Paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      total: filteredUsers.length,
      page,
      limit,
      total_pages: Math.ceil(filteredUsers.length / limit)
    };
  };

  return {
    // Obter lista de usuários com paginação e filtros
    getUsers: async (filters: UserFilters = {}): Promise<UsersResponse> => {
      const { page = 1, limit = 10, search = '', status = '', role = '' } = filters;
      const params = new URLSearchParams();
      
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (role) params.append('role', role);
      
      // Criar mock de resposta baseado nos filtros
      const mockResponse = filterMockUsers(filters);
      
      return await authFetch<UsersResponse>(`/api/users?${params.toString()}`, {}, mockResponse);
    },
    
    // Obter lista de usuários pendentes
    getPendingUsers: async (): Promise<PendingUsersResponse> => {
      return await authFetch<PendingUsersResponse>('/api/users/pending', {}, mockData.pending_users);
    },
    
    // Criar um novo usuário
    createUser: async (userData: Partial<User>): Promise<User> => {
      const response = await authFetch<UserResponse>('/api/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      }, mockData.user_response);
      return response.user;
    },
    
    // Atualizar um usuário existente
    updateUser: async (userId: string, userData: Partial<User>): Promise<User> => {
      const response = await authFetch<UserResponse>(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      }, mockData.user_response);
      return response.user;
    },
    
    // Aprovar um usuário pendente
    approveUser: async (userId: string): Promise<User> => {
      const response = await authFetch<UserResponse>(`/api/users/${userId}/approve`, {
        method: 'PATCH'
      }, mockData.user_response);
      return response.user;
    },
    
    // Rejeitar um usuário pendente
    rejectUser: async (userId: string): Promise<void> => {
      await authFetch<void>(`/api/users/${userId}/reject`, {
        method: 'DELETE'
      }, {});
    },
    
    // Resetar a senha de um usuário
    resetPassword: async (userId: string): Promise<void> => {
      await authFetch<void>(`/api/users/${userId}/reset-password`, {
        method: 'POST'
      }, {});
    },
    
    // Promover um usuário para administrador
    promoteUser: async (userId: string): Promise<User> => {
      const response = await authFetch<UserResponse>(`/api/users/${userId}/promote`, {
        method: 'PUT'
      }, mockData.user_response);
      return response.user;
    },
    
    // Atualizar o status de um usuário (ativar/desativar)
    updateUserStatus: async (userId: string, status: 'active' | 'inactive' | 'ativo' | 'pendente' | 'recusado'): Promise<User> => {
      const response = await authFetch<UserResponse>(`/api/users/${userId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      }, mockData.user_response);
      return response.user;
    },
    
    // Exportando estados do useAuthFetch
    hasFetched,
    isLoading,
    error
  };
};

// Versão antiga do serviço para compatibilidade
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