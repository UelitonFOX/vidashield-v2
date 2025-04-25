import api from '../api';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  role: 'admin' | 'manager' | 'user';
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  pages: number;
}

interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
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
    
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },
  
  // Criar um novo usuário
  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await api.post('/users', userData);
    return response.data.user;
  },
  
  // Atualizar um usuário existente
  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data.user;
  },
  
  // Resetar a senha de um usuário
  resetPassword: async (userId: number): Promise<void> => {
    await api.post(`/users/${userId}/reset-password`);
  },
  
  // Promover um usuário para administrador
  promoteUser: async (userId: number): Promise<User> => {
    const response = await api.put(`/users/${userId}/promote`);
    return response.data.user;
  },
  
  // Atualizar o status de um usuário (ativar/desativar)
  updateUserStatus: async (userId: number, status: 'active' | 'inactive'): Promise<User> => {
    const response = await api.put(`/users/${userId}/status`, { status });
    return response.data.user;
  }
};

export default usersService;
export type { User, UsersResponse, UserFilters }; 