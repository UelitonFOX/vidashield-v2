import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api, { fetchCSRFToken } from '../services/api';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  photo?: string;
  avatar?: string;
  status?: string;
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Obter token CSRF ao iniciar a aplicação
        await fetchCSRFToken();

        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          try {
            await validateAndSetToken(storedToken);
          } catch (error) {
            console.error('Erro ao validar token armazenado:', error);
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const validateAndSetToken = async (newToken: string) => {
    console.log("Validando token...");
    
    if (!newToken) {
      console.error("Token vazio fornecido para validação");
      throw new Error("Token inválido");
    }
    
    try {
      // Configura o token no axios para todas as requisições
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Faz uma requisição para obter os dados do usuário
      console.log("Obtendo dados do usuário...");
      
      // Usar diretamente a instância API configurada
      const response = await api.get('/auth/me');
      
      // Log completo para depuração
      console.log("Resposta completa da API:", response.data);
      
      if (!response.data) {
        throw new Error("Resposta da API não contém dados do usuário");
      }
      
      // Verificar a estrutura da resposta e extrair os dados do usuário
      const userData: User = {
        id: response.data.id,
        name: response.data.name || 'Usuário',
        email: response.data.email || 'sem.email@exemplo.com',
        role: response.data.role || 'user',
        photo: response.data.photo || response.data.avatar,  // Verificar ambos os campos
        avatar: response.data.avatar || response.data.photo,  // Verificar ambos os campos
        status: response.data.status,
        is_active: response.data.is_active
      };
      
      console.log("Dados de usuário tratados:", userData);
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      return userData;
    } catch (error: any) {
      console.error('Erro detalhado ao validar token:', error.response?.status, error.response?.data || error.message);
      
      if (error.response?.status === 0 || error.message.includes('Network Error')) {
        console.error('ERRO DE REDE: Verifique se o servidor backend está rodando em http://localhost:5000');
      }
      
      // Limpar o token em caso de erro
      setUser(null);
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      throw error;
    }
  };

  const login = async (newToken: string) => {
    console.log("Realizando login com novo token:", newToken.substring(0, 15) + "...");
    const userData = await validateAndSetToken(newToken);
    console.log("Login realizado com sucesso:", userData);
  };

  const logout = () => {
    console.log("Realizando logout");
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,  // Só está autenticado se tiver token E dados do usuário
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 