import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api, { setTokenProvider } from '../services/api';

export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  photo?: string;
  avatar?: string;
  status?: string;
  is_active?: boolean;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (redirectPath?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: (options?: any) => void;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  getToken: () => Promise<string | null>;
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
  const { 
    isAuthenticated, 
    isLoading, 
    user: auth0User, 
    logout: auth0Logout, 
    loginWithRedirect, 
    getAccessTokenSilently 
  } = useAuth0();
  
  const [token, setToken] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Configurar o provedor de token para o API
  useEffect(() => {
    // Configurar o serviço de API para usar nosso método getToken
    setTokenProvider(async () => {
      // Se já temos o token em cache, usar ele
      if (token) return token;
      
      // Caso contrário, obter o token fresco
      try {
        const newToken = await getAccessTokenSilently();
        setToken(newToken);
        return newToken;
      } catch (error) {
        console.error('Erro ao obter token para API:', error);
        return null;
      }
    });
  }, [token, getAccessTokenSilently]);

  // Obter token quando autenticado
  useEffect(() => {
    const fetchToken = async () => {
      if (isAuthenticated && auth0User) {
        try {
          console.log("Obtendo token para usuário autenticado");
          const accessToken = await getAccessTokenSilently();
          setToken(accessToken);
          setAuthInitialized(true);
        } catch (error) {
          console.error('Erro ao obter token:', error);
          setAuthInitialized(true);
        }
      } else if (!isLoading) {
        setAuthInitialized(true);
      }
    };

    fetchToken();
  }, [isAuthenticated, auth0User, getAccessTokenSilently, isLoading]);

  // Mapear usuário do Auth0 para o formato do nosso contexto
  const mapUser = (): User | null => {
    if (!auth0User) return null;

    // Log para depuração
    console.log('Auth0 user data:', auth0User);
    
    // Extrair permissões do token
    const permissions = auth0User['https://vidashield.app/permissions'] || [];
    
    console.log('Permissões detectadas:', permissions);
    
    // Verificar possíveis fontes de imagem do perfil
    let profileImage = auth0User.picture;
    // Tenta encontrar a imagem em várias propriedades possíveis
    if (!profileImage) {
      if (auth0User.avatar) profileImage = auth0User.avatar;
      else if (auth0User.photo) profileImage = auth0User.photo;
      else if (auth0User['https://vidashield.app/picture']) profileImage = auth0User['https://vidashield.app/picture'];
    }
    console.log('Imagem de perfil detectada:', profileImage);
    
    // Determinar role com base nas permissões
    let role = 'usuario';
    
    // Verificar se há qualquer permissão administrativa para atribuir o papel de admin
    if (Array.isArray(permissions)) {
      if (permissions.includes('super_admin') || 
          permissions.includes('admin:all') || 
          permissions.includes('read:users') || 
          permissions.includes('manage:users') ||
          permissions.includes('manage:settings')) {
        role = 'admin';
      } else if (permissions.includes('manager') || permissions.includes('manage:own')) {
        role = 'manager';
      }
    }

    // Verificar claims específicos do token que podem indicar papel de admin
    if (auth0User['https://vidashield.app/role'] === 'admin' || 
        auth0User.role === 'admin' ||
        auth0User.roles?.includes('admin')) {
      role = 'admin';
    }
    
    // Em ambiente de desenvolvimento, forçar o papel de administrador para testes
    if (import.meta.env.DEV) {
      role = 'admin';
      console.log('Ambiente de desenvolvimento: forçando role de administrador para testes');
    }
    
    console.log('Role determinada:', role);

    return {
      id: auth0User.sub || '',
      name: auth0User.name || '',
      email: auth0User.email || '',
      photo: profileImage,
      avatar: profileImage,
      role,
      status: 'ativo',
      is_active: true,
      permissions: Array.isArray(permissions) ? permissions : []
    };
  };

  // Obter token do Auth0
  const getToken = async (): Promise<string | null> => {
    if (token) return token;
    
    try {
      const newToken = await getAccessTokenSilently();
      setToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  };

  // Login - redirecionar para Auth0
  const login = async (redirectPath?: string): Promise<void> => {
    try {
      // Obter o URL de callback das variáveis de ambiente ou usar o padrão
      const callbackUrl = import.meta.env.VITE_AUTH0_CALLBACK_URL || 
                          window.location.origin + '/callback';
                          
      console.log("Redirecionando para Auth0 com callback:", callbackUrl);
      
      await loginWithRedirect({
        appState: { returnTo: redirectPath || '/dashboard' },
        authorizationParams: {
          redirect_uri: callbackUrl,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  // Login específico com Google
  const loginWithGoogle = async (): Promise<void> => {
    try {
      // Obter o URL de callback das variáveis de ambiente ou usar o padrão
      const callbackUrl = import.meta.env.VITE_AUTH0_CALLBACK_URL || 
                          window.location.origin + '/callback';
                          
      console.log("Tentando login com Google usando callback:", callbackUrl);
      
      await loginWithRedirect({
        appState: { returnTo: '/dashboard' },
        authorizationParams: {
          connection: 'google-oauth2',
          redirect_uri: callbackUrl,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE
        }
      });
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      throw error;
    }
  };

  // Logout - abordagem de duas etapas sem redirecionamento do Auth0
  const handleLogout = (options?: any) => {
    // Limpar todos os tokens e dados de sessão
    setToken(null);
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    
    // Limpar cookies do Auth0
    document.cookie = 'auth0.is.authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Definir flag para indicar que acabamos de fazer logout
    sessionStorage.setItem('just_logged_out', 'true');
    
    // Registrar que estamos fazendo logout local
    console.log('Realizando logout local e redirecionando para página de login personalizada');
    
    // Fazer logout no Auth0 (importante para eliminar a sessão no Auth0)
    // Usando as opções fornecidas ou as padrões
    auth0Logout(options || {
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  };

  // Atualizar dados do usuário - aqui poderíamos buscar dados adicionais da API
  const refreshUserData = async (): Promise<void> => {
    try {
      // Atualizar o token
      const newToken = await getAccessTokenSilently({ cacheMode: 'off' });
      setToken(newToken);

      // Opcionalmente, buscar dados adicionais do usuário da nossa API
      try {
        const response = await api.get('/auth/me');
        // Podemos fazer algo com os dados adicionais retornados, se necessário
        console.log('Dados atualizados do usuário:', response.data);
      } catch (error) {
        console.warn('Não foi possível obter dados adicionais do usuário da API');
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    }
  };

  // Valores para o contexto
  const value = {
    user: mapUser(),
    token,
    isAuthenticated,
    login,
    loginWithGoogle,
    logout: handleLogout,
    loading: isLoading || !authInitialized,
    refreshUserData,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
