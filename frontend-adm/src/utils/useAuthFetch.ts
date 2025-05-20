import { useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// Cache para armazenar respostas
const responseCache: Record<string, { data: any, timestamp: number }> = {};
// Tempo de validade do cache em milissegundos (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;
// Controle de requisições em andamento para evitar chamadas duplicadas simultâneas
const pendingRequests: Record<string, Promise<any>> = {};

/**
 * Hook personalizado para fazer fetch autenticado com controle de estados
 */
export const useAuthFetch = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [hasFetched, setHasFetched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, any>>({});

  /**
   * Função para realizar requisições autenticadas com controle de estado
   */
  const authFetch = useCallback(async <T>(
    endpoint: string, 
    options: RequestInit = {},
    mockResponse?: any,
    skipCache: boolean = false
  ): Promise<T> => {
    // Se não estiver autenticado, não fazer a requisição
    if (!isAuthenticated) {
      console.warn(`Tentativa de acessar ${endpoint} sem autenticação`);
      throw new Error('Não autenticado');
    }

    // Se já buscou este endpoint, usar cache
    if (hasFetched[endpoint] && !skipCache) {
      // Verificar se há cache válido
      const now = Date.now();
      if (responseCache[endpoint] && (now - responseCache[endpoint].timestamp) < CACHE_TTL) {
        console.log(`CACHE: Usando dados em cache para ${endpoint}`);
        return responseCache[endpoint].data as T;
      }
    }

    // Em desenvolvimento, usar dados mockados se disponíveis
    if ((import.meta.env.DEV || import.meta.env.MODE === 'development') && mockResponse) {
      console.log(`DEV: Usando dados mockados para ${endpoint}`);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Marcar como buscado
      setHasFetched(prev => ({ ...prev, [endpoint]: true }));
      
      // Armazenar no cache
      responseCache[endpoint] = { data: mockResponse, timestamp: Date.now() };
      return mockResponse as T;
    }

    // Verificar se já existe uma requisição pendente para este endpoint
    if (endpoint in pendingRequests) {
      console.log(`Reutilizando requisição pendente para ${endpoint}`);
      try {
        const result = await pendingRequests[endpoint];
        // Marcar como buscado após concluir
        setHasFetched(prev => ({ ...prev, [endpoint]: true }));
        return result;
      } catch (err) {
        setError(prev => ({ ...prev, [endpoint]: err }));
        throw err;
      }
    }

    // Iniciar carregamento
    setIsLoading(prev => ({ ...prev, [endpoint]: true }));
    
    // Criar nova promise
    const fetchPromise = (async () => {
      try {
        const token = await getAccessTokenSilently();
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        };

        const response = await fetch(endpoint, {
          ...options,
          headers,
          credentials: 'include'
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Não autorizado. Faça login novamente.');
          } else {
            throw new Error(`Erro: ${response.status} ${response.statusText}`);
          }
        }

        try {
          const data = await response.json();
          // Atualizar cache
          responseCache[endpoint] = { data, timestamp: Date.now() };
          console.log(`Dados recebidos com sucesso de ${endpoint}`);
          return data;
        } catch (jsonError) {
          console.warn(`Erro ao processar JSON de ${endpoint}:`, jsonError);
          throw new Error('Erro ao processar resposta do servidor');
        }
      } catch (err) {
        console.error(`Erro ao acessar ${endpoint}:`, err);
        
        // Em dev, usar mockResponse como fallback em caso de erro
        if ((import.meta.env.DEV || import.meta.env.MODE === 'development') && mockResponse) {
          console.warn(`DEV: Usando fallback mockado para ${endpoint} após erro`);
          responseCache[endpoint] = { data: mockResponse, timestamp: Date.now() };
          return mockResponse as T;
        }
        
        throw err;
      } finally {
        // Limpar estado de loading e requisição pendente
        setIsLoading(prev => ({ ...prev, [endpoint]: false }));
        delete pendingRequests[endpoint];
      }
    })();
    
    // Armazenar promise para reuso
    pendingRequests[endpoint] = fetchPromise;
    
    try {
      const result = await fetchPromise;
      // Marcar como buscado apenas após o sucesso
      setHasFetched(prev => ({ ...prev, [endpoint]: true }));
      return result;
    } catch (err) {
      setError(prev => ({ ...prev, [endpoint]: err }));
      throw err;
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  const resetFetchState = useCallback((endpoint: string) => {
    setHasFetched(prev => ({ ...prev, [endpoint]: false }));
    setIsLoading(prev => ({ ...prev, [endpoint]: false }));
    setError(prev => ({ ...prev, [endpoint]: null }));
    delete responseCache[endpoint];
  }, []);

  return {
    authFetch,
    hasFetched,
    isLoading,
    error,
    resetFetchState
  };
}; 