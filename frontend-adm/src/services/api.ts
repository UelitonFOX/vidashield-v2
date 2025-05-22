import axios from 'axios';

// Supabase URL e API Key - configuráveis por variáveis de ambiente no Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anon';

// URL da API do backend (Flask)
const API_URL = import.meta.env.VITE_API_URL || 'https://vidashield.onrender.com';

// Definindo a base URL da API
// Se estamos com o proxy do Vite em desenvolvimento, usamos /api
// Em produção, usamos o URL da API configurado no .env
const API_BASE_URL = import.meta.env.DEV ? '/api' : API_URL;

// Imprime para debug
console.log('API_BASE_URL configurada:', API_BASE_URL);
console.log('Modo de ambiente:', import.meta.env.MODE);

// Criando uma instância do axios com configurações padronizadas
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Chave do Supabase para requisições não autenticadas
    ...(import.meta.env.PROD && SUPABASE_KEY ? { 'apikey': SUPABASE_KEY } : {})
  },
  withCredentials: true,  // Importante para enviar cookies entre origens
  timeout: 30000, // 30 segundos de timeout
});

// Interceptor para adicionar token de autenticação em todas as requisições
// O token será obtido através do nosso AuthContext
api.interceptors.request.use(
  async (config) => {
    try {
      // Debug da requisição
      console.log(`Enviando requisição para: ${config.baseURL}${config.url}`);
      
      // O token será passado diretamente pelas funções que usam o API
      // ou através do contexto de autenticação nos componentes
      const token = await getAuthToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token adicionado à requisição');
      } else {
        console.log('Sem token disponível para esta requisição');
      }
      
      return config;
    } catch (error) {
      console.error('Erro ao obter token para requisição:', error);
      return config;
    }
  },
  (error) => {
    console.error('Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Função que será substituída para obter o token de auth (injetada pela AuthContext)
let getAuthToken = async (): Promise<string | null> => {
  // Implementação inicial - será substituída pelo AuthContext
  return null;
};

// Função para configurar o provedor de token
export const setTokenProvider = (tokenProvider: () => Promise<string | null>) => {
  getAuthToken = tokenProvider;
  console.log('Provedor de token configurado');
};

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => {
    console.log(`Resposta recebida de ${response.config.url}:`, response.status);
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
        data: error.response.data
      });
      
      // Se receber 401 (não autorizado), podemos disparar um evento ou chamar uma função
      // para lidar com a renovação do token ou redirecionar para login
      if (error.response.status === 401 || error.response.status === 403) {
        // Será tratado pelo AuthContext
        console.warn('Não autorizado - o token pode ter expirado');
      }
    } else if (error.request) {
      // A requisição foi feita mas nenhuma resposta foi recebida
      console.error('Erro de requisição sem resposta:', {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        request: error.request,
        message: error.message
      });
    } else {
      // Algo aconteceu na configuração da requisição que disparou um erro
      console.error('Erro ao configurar requisição:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Função para verificar status do servidor
export const checkServerStatus = async (): Promise<boolean> => {
  try {
    console.log('Verificando status do servidor...');
    const response = await api.get('/ping');
    console.log('Status do servidor:', response.status, response.data);
    return response.status === 200;
  } catch (error) {
    console.error('Erro ao verificar status do servidor:', error);
    return false;
  }
};

// Função para testar a conexão com a API raiz
export const testApiConnection = async (): Promise<boolean> => {
  try {
    // Teste simples para a raiz da API (sem path adicional)
    console.log('Testando conexão com a API raiz...');
    const response = await axios.get('/api');
    console.log('Resposta da API raiz:', response.status, response.data);
    return response.status === 200;
  } catch (error) {
    console.error('Erro ao conectar com a API raiz:', error);
    return false;
  }
};

// Função para obter token CSRF do servidor
export const fetchCSRFToken = async (): Promise<string | null> => {
  try {
    const response = await api.get('/auth/csrf-token');
    
    // O endpoint retorna o token no formato { csrf_token: 'token-value' }
    const token = response.data?.csrf_token;
    
    if (token) {
      // Configurar o token CSRF como header padrão para todas as requisições
      api.defaults.headers.common['X-CSRF-TOKEN'] = token;
      return token;
    }
    
    console.warn('Token CSRF não encontrado na resposta');
    return null;
  } catch (error) {
    console.error('Erro ao obter token CSRF:', error);
    return null;
  }
};

// Exporta a instância de API
export default api; 