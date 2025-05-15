import axios from 'axios';

// Definindo a base URL da API
const API_BASE_URL = 'http://localhost:5000/api';

// Criando uma instância do axios com configurações padronizadas
const api = axios.create({
  baseURL: API_BASE_URL,  // URL absoluta do backend
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
    
    // Log para debug (remover em produção)
    console.log(`Requisição para: ${config.url}`, {
      headers: config.headers,
      withCredentials: config.withCredentials
    });
    
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    // Log para debug (remover em produção)
    console.log(`Resposta de ${response.config.url}:`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log detalhado de erros para facilitar debug
    if (error.response) {
      // A requisição foi feita e o servidor respondeu com um código de status
      // que não está na faixa 2xx
      console.error('Erro de resposta:', {
        url: error.config?.url,
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      // Se receber 401 (não autorizado), limpar o token
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        // Redirecionar para login após limpeza do token, se necessário
        if (window.location.pathname !== '/login' && window.location.pathname !== '/auth/callback') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // A requisição foi feita mas nenhuma resposta foi recebida
      console.error('Erro de requisição sem resposta:', {
        url: error.config?.url,
        request: error.request
      });
    } else {
      // Algo aconteceu na configuração da requisição que disparou um erro
      console.error('Erro ao configurar requisição:', error.message);
    }
    
    return Promise.reject(error);
  }
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
    const response = await api.get('/ping');
    return response.status === 200;
  } catch (error) {
    console.error('Erro ao verificar status do servidor:', error);
    return false;
  }
};

export default api; 