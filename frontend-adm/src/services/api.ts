import axios from 'axios';

// Criando uma instância do axios com configurações padronizadas
const api = axios.create({
  baseURL: '/api',  // Já configurado para usar o proxy definido no vite.config.ts
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,  // Importante para enviar cookies entre origens
});

// Interceptor para adicionar token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Função para obter token CSRF do servidor
export const fetchCSRFToken = async (): Promise<string | null> => {
  try {
    const response = await api.get('/auth/csrf-token');
    
    // O endpoint retorna o token no formato { csrf_token: 'token-value' }
    const token = response.data?.csrf_token;
    
    if (token) {
      // Configurar o token CSRF como header padrão para todas as requisições
      api.defaults.headers.common['X-CSRF-TOKEN'] = token;
      console.log('Token CSRF obtido e configurado nos headers');
      return token;
    }
    
    console.warn('Token CSRF não encontrado na resposta');
    return null;
  } catch (error) {
    console.error('Erro ao obter token CSRF:', error);
    return null;
  }
};

// Função para verificar status do servidor
export const checkServerStatus = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Erro ao verificar status do servidor:', error);
    return false;
  }
};

export default api; 