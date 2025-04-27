import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: 'admin' | 'manager' | 'user';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      console.log("Inicializando autenticação, token salvo:", savedToken ? "presente" : "ausente");
      
      if (savedToken) {
        try {
          await validateAndSetToken(savedToken);
          console.log("Autenticação inicializada com sucesso");
        } catch (error) {
          console.error('Token inválido durante inicialização:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
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
      
      // Tente diretamente com Axios para detectar problemas de CORS ou conectividade
      try {
        console.log("Testando conexão direta com axios...");
        const testResponse = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        console.log("Teste axios direto bem-sucedido:", testResponse.data);
      } catch (axiosError: any) {
        console.error("Erro na chamada direta com axios:", axiosError.message);
        console.error("Detalhes do erro axios:", axiosError.response?.data || 'Sem dados de resposta');
      }
      
      // Continue com a API normal
      const response = await api.get('/auth/me');
      
      if (!response.data) {
        throw new Error("Resposta da API não contém dados do usuário");
      }
      
      console.log("Dados de usuário obtidos com sucesso:", response.data.email, "Papel:", response.data.role);
      setUser(response.data);
      setToken(newToken);
      localStorage.setItem('token', newToken);
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
      throw error;
    }
  };

  const login = async (newToken: string) => {
    console.log("Realizando login com novo token:", newToken.substring(0, 15) + "...");
    await validateAndSetToken(newToken);
    console.log("Login realizado com sucesso");
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
    isAuthenticated: !!token,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 