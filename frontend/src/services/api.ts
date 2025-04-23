import axios from 'axios';

// Configuração base da API
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 15000, // Timeout de 15 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(
  (config) => {
    console.log(`Requisição: ${config.method?.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token encontrado, adicionando ao cabeçalho');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('Nenhum token encontrado para a requisição');
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
      alert('O servidor não respondeu a tempo. Verifique sua conexão com a internet.');
      return Promise.reject(error);
    }
    
    if (!error.response) {
      console.error('Erro de rede, verifique se o servidor está rodando');
      return Promise.reject(error);
    }
    
    console.error(`Erro ${error.response.status}: ${error.response.data?.msg || 'Erro desconhecido'}`);
    
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