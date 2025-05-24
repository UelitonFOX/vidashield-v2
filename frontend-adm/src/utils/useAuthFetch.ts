import { useState, useCallback, useEffect } from 'react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

// Cache para armazenar respostas
const responseCache: Record<string, { data: unknown, timestamp: number }> = {};
// Tempo de validade do cache em milissegundos (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;
// Controle de requisições em andamento para evitar chamadas duplicadas simultâneas
const pendingRequests: Record<string, Promise<unknown>> = {};

// API base URL do .env
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Hook personalizado para fazer fetch autenticado com controle de estados (Supabase)
 */
export const useAuthFetch = <T = unknown>(
  path: string,
  options: RequestInit = {},
  skipCache: boolean = false
) => {
  const { session, isAuthenticated } = useSupabaseAuth();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Normaliza o endpoint completo
  const endpoint = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  /**
   * Função para realizar requisições autenticadas com controle de estado
   */
  const authFetch = useCallback(async <R = T>(
    customEndpoint?: string,
    customOptions?: RequestInit,
    mockResponse?: unknown,
    customSkipCache?: boolean
  ): Promise<R> => {
    const fetchEndpoint = customEndpoint || endpoint;
    const fetchOptions = { ...options, ...(customOptions || {}) };
    const shouldSkipCache = customSkipCache ?? skipCache;

    // Se não estiver autenticado, não fazer a requisição
    if (!isAuthenticated || !session) {
      const authError = new Error('Não autenticado. Faça login para continuar.');
      console.error(`Tentativa de acessar ${fetchEndpoint} sem autenticação`);
      throw authError;
    }

    // Se já buscou este endpoint, usar cache
    if (!shouldSkipCache) {
      // Verificar se há cache válido
      const now = Date.now();
      if (responseCache[fetchEndpoint] && (now - responseCache[fetchEndpoint].timestamp) < CACHE_TTL) {
        console.log(`CACHE: Usando dados em cache para ${fetchEndpoint}`);
        return responseCache[fetchEndpoint].data as R;
      }
    }

    // Em desenvolvimento, usar dados mockados se disponíveis
    if ((import.meta.env.DEV || import.meta.env.MODE === 'development') && mockResponse) {
      console.log(`DEV: Usando dados mockados para ${fetchEndpoint}`);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Armazenar no cache
      responseCache[fetchEndpoint] = { data: mockResponse, timestamp: Date.now() };
      return mockResponse as R;
    }

    // Verificar se já existe uma requisição pendente para este endpoint
    if (fetchEndpoint in pendingRequests) {
      console.log(`Reutilizando requisição pendente para ${fetchEndpoint}`);
      return await pendingRequests[fetchEndpoint] as R;
    }

    // Criar nova promise
    const fetchPromise = (async () => {
      const token = session.access_token;
      
      if (!token) {
        throw new Error('Não foi possível obter o token de autenticação do Supabase');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        ...fetchOptions.headers
      };

      const response = await fetch(fetchEndpoint, {
        ...fetchOptions,
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
        responseCache[fetchEndpoint] = { data, timestamp: Date.now() };
        console.log(`Dados recebidos com sucesso de ${fetchEndpoint}`);
        return data;
      } catch (jsonError) {
        console.warn(`Erro ao processar JSON de ${fetchEndpoint}:`, jsonError);
        throw new Error('Erro ao processar resposta do servidor');
      }
    })();
    
    // Armazenar promise para reuso
    pendingRequests[fetchEndpoint] = fetchPromise;
    
    try {
      const result = await fetchPromise;
      return result as R;
    } catch (err) {
      console.error(`Erro ao acessar ${fetchEndpoint}:`, err);
      
      // Em dev, usar mockResponse como fallback em caso de erro
      if ((import.meta.env.DEV || import.meta.env.MODE === 'development') && mockResponse) {
        console.warn(`DEV: Usando fallback mockado para ${fetchEndpoint} após erro`);
        responseCache[fetchEndpoint] = { data: mockResponse, timestamp: Date.now() };
        return mockResponse as R;
      }
      
      throw err;
    } finally {
      // Limpar requisição pendente
      delete pendingRequests[fetchEndpoint];
    }
  }, [endpoint, options, skipCache, session, isAuthenticated]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    delete responseCache[endpoint];
    
    authFetch<T>()
      .then((responseData) => {
        setData(responseData);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [authFetch, endpoint]);
  
  useEffect(() => {
    if (isAuthenticated && session) {
      refetch();
    } else {
      setIsLoading(false);
      setError(new Error('Não autenticado. Faça login para continuar.'));
    }
  }, [isAuthenticated, session, refetch]);

  return {
    data,
    isLoading,
    error,
    refetch,
    authFetch
  };
}; 