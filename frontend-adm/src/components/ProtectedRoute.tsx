import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
}

const ProtectedRoute = ({ children, requiredPermission }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, getAccessTokenSilently, user } = useAuth0();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isCheckingPermissions, setIsCheckingPermissions] = useState(requiredPermission ? true : false);
  const location = useLocation();

  useEffect(() => {
    // Log para depuração
    console.log("ProtectedRoute - isAuthenticated:", isAuthenticated, "isLoading:", isLoading);
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!requiredPermission || !isAuthenticated) {
        setIsCheckingPermissions(false);
        return;
      }

      try {
        // Obter token de acesso para verificar permissões
        const token = await getAccessTokenSilently();
        
        // Verificar permissões do usuário (no token)
        const permissions = user?.['https://vidashield.app/permissions'] || [];
        
        // Verificar se o usuário tem a permissão necessária
        const hasPermission = Array.isArray(permissions) && permissions.includes(requiredPermission);
        
        setIsAuthorized(hasPermission);
        setIsCheckingPermissions(false);
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        setIsAuthorized(false);
        setIsCheckingPermissions(false);
      }
    };

    if (isAuthenticated && requiredPermission) {
      checkPermissions();
    } else if (!requiredPermission) {
      setIsAuthorized(true);
      setIsCheckingPermissions(false);
    }
  }, [isAuthenticated, requiredPermission, getAccessTokenSilently, user]);

  // Mostrar componente de carregamento enquanto verifica a autenticação
  if (isLoading || isCheckingPermissions) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-zinc-300">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    console.log("ProtectedRoute - Usuário não autenticado, redirecionando para página de login local");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Autenticado mas sem permissão
  if (requiredPermission && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-900 p-8">
        <div className="text-center max-w-lg">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Acesso negado</h1>
          <p className="text-zinc-300 mb-6">
            Você não tem permissão para acessar esta página. 
            Entre em contato com o administrador se acredita que isso é um erro.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Se o usuário está autenticado e tem permissão, retorna o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute; 