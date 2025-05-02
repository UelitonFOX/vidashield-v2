import axios from 'axios';

// URL base da API (com fallback para localhost)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Configuração base da API
const api = axios.create({
  baseURL: API_URL,
  timeout: 20000, // Timeout aumentado para 20 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Habilita o envio de cookies cross-origin
});

// Variável para armazenar o token CSRF
let csrfToken: string | null = null;

// Função para verificar se o servidor está online
export const checkServerStatus = async (): Promise<boolean> => {
  try {
    // Usando o axios global para evitar recursão
    const response = await axios.get(API_URL.replace('/api', '') + '/ping', {
      timeout: 10000,
      withCredentials: true
    });
    console.log('Servidor verificado com sucesso:', response.data);
    return true;
  } catch (error: any) {
    console.error('Erro ao verificar status do servidor:', error.message);
    // Se recebermos qualquer resposta, o servidor está funcionando
    if (error.response) {
      console.log('Recebemos resposta do servidor mesmo com erro:', error.response.status);
      return true;
    }
    return false;
  }
};

// Função para obter o token CSRF
export const fetchCSRFToken = async () => {
  try {
    // Verifica primeiro se o servidor está online
    const isOnline = await checkServerStatus();
    if (!isOnline) {
      throw new Error('Servidor não está acessível');
    }
    
    // Agora tenta obter o token CSRF
    const response = await api.get('/auth/csrf-token');
    csrfToken = response.data.csrf_token;
    console.log('Token CSRF obtido com sucesso:', csrfToken);
    return csrfToken;
  } catch (error) {
    console.error('Erro ao obter token CSRF:', error);
    throw error;
  }
};

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  async (config) => {
    console.log(`Requisição: ${config.method?.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token JWT encontrado, adicionando ao cabeçalho');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('Nenhum token JWT encontrado para a requisição');
    }
    
    // Adiciona o token CSRF para métodos não seguros (POST, PUT, DELETE, PATCH)
    const nonSafeMethods = ['post', 'put', 'delete', 'patch'];
    if (nonSafeMethods.includes(config.method?.toLowerCase() || '')) {
      // Se não temos um token CSRF, tenta obtê-lo
      if (!csrfToken) {
        try {
          console.log('Obtendo token CSRF para requisição não segura');
          await fetchCSRFToken();
        } catch (error) {
          console.error('Falha ao obter token CSRF:', error);
        }
      }
      
      // Adiciona o token CSRF ao cabeçalho se disponível
      if (csrfToken) {
        console.log('Adicionando token CSRF ao cabeçalho');
        config.headers['X-CSRF-TOKEN'] = csrfToken;
      } else {
        console.warn('Requisição sem token CSRF!');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => {
    console.log(`Resposta (${response.status}): ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Erro na resposta da API:', error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.error('Tempo limite da requisição excedido');
      return Promise.reject(error);
    }
    
    if (!error.response) {
      console.error('Erro de rede, verifique se o servidor está rodando');
      return Promise.reject(error);
    }
    
    console.error(`Erro ${error.response.status}: ${error.response.data?.msg || 'Erro desconhecido'}`);
    
    // Se for erro de CSRF, tenta obter um novo token
    if (error.response?.status === 400 && 
        (error.response?.data?.msg?.includes('CSRF') || 
         error.response?.data?.message?.includes('CSRF') ||
         error.response?.data?.error?.includes('CSRF'))) {
      console.error('Erro de CSRF detectado, obtendo novo token');
      // Invalida o token atual
      csrfToken = null;
      // Não redirecionamos aqui, apenas invalidamos o token para a próxima requisição
    }
    
    if (error.response?.status === 401) {
      console.log('Erro 401: Não autorizado');
      // Apenas redireciona para login se não estiver já na página de login
      // ou em rotas relacionadas a autenticação
      const excludedPaths = ['/login', '/register', '/recover', '/reset-password', '/oauth-callback'];
      const currentPath = window.location.pathname;
      
      if (!excludedPaths.some(path => currentPath.includes(path))) {
        console.log('Redirecionando para página de login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        console.log('Já na página de autenticação, não redirecionando');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 