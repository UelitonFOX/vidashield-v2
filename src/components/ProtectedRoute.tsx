import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { Shield, AlertTriangle, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'moderator' | 'user' | 'viewer';
  requiresApproval?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  requiresApproval = true 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const location = useLocation();
  const [authorizationStatus, setAuthorizationStatus] = useState<'loading' | 'authorized' | 'unauthorized' | 'pending' | 'blocked'>('loading');

  useEffect(() => {
    const checkAuthorization = async () => {
      // Se ainda está carregando
      if (authLoading || profileLoading) {
        setAuthorizationStatus('loading');
        return;
      }

      // Se não está autenticado
      if (!user) {
        setAuthorizationStatus('unauthorized');
        return;
      }

      // Se requer aprovação e não tem profile (usuário novo)
      if (requiresApproval && !profile) {
        setAuthorizationStatus('pending');
        return;
      }

      // Se tem profile mas está bloqueado
      if (profile && (profile.status === 'suspended' || profile.status === 'pending')) {
        setAuthorizationStatus('blocked');
        return;
      }

      // Se tem role requerido
      if (requiredRole && profile) {
        const roleHierarchy = {
          'viewer': 0,
          'user': 1,
          'moderator': 2,
          'admin': 3
        };

        const userLevel = roleHierarchy[profile.role as keyof typeof roleHierarchy] || 0;
        const requiredLevel = roleHierarchy[requiredRole];

        if (userLevel < requiredLevel) {
          setAuthorizationStatus('unauthorized');
          return;
        }
      }

      // Se passou por todas as verificações
      setAuthorizationStatus('authorized');
    };

    checkAuthorization();
  }, [user, profile, authLoading, profileLoading, requiredRole, requiresApproval]);

  // Loading
  if (authorizationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-300 text-lg">Verificando acesso...</p>
          <p className="text-zinc-500 text-sm mt-2">Aguarde enquanto validamos suas credenciais</p>
        </div>
      </div>
    );
  }

  // Não autorizado - redireciona para login
  if (authorizationStatus === 'unauthorized' && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Conta pendente de aprovação
  if (authorizationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-800 rounded-2xl p-8 text-center border border-zinc-700">
          <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Aguardando Aprovação</h2>
          
          <p className="text-zinc-300 mb-6 leading-relaxed">
            Sua conta foi criada com sucesso, mas precisa ser aprovada por um administrador antes de acessar o sistema.
          </p>
          
          <div className="bg-zinc-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-zinc-400 mb-2">Conta identificada:</p>
            <p className="text-green-400 font-semibold">{user?.email}</p>
          </div>
          
          <p className="text-zinc-400 text-sm mb-6">
            Você receberá um email quando sua conta for aprovada. Entre em contato com o administrador se necessário.
          </p>
          
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  // Conta bloqueada/suspensa
  if (authorizationStatus === 'blocked') {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-800 rounded-2xl p-8 text-center border border-red-500/30">
          <div className="w-16 h-16 bg-red-400/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-red-400 mb-4">Acesso Bloqueado</h2>
          
          <p className="text-zinc-300 mb-6 leading-relaxed">
            {profile?.status === 'suspended' 
              ? 'Sua conta foi suspensa. Entre em contato com o administrador.'
              : 'Sua conta está pendente de ativação.'
            }
          </p>
          
          <div className="bg-zinc-700/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-zinc-400 mb-2">Conta:</p>
            <p className="text-red-400 font-semibold">{profile?.email}</p>
            <p className="text-sm text-zinc-500 mt-1">Status: {profile?.status}</p>
          </div>
          
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  // Acesso negado por role insuficiente
  if (authorizationStatus === 'unauthorized') {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-800 rounded-2xl p-8 text-center border border-zinc-700">
          <div className="w-16 h-16 bg-zinc-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-zinc-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-zinc-400 mb-4">Acesso Negado</h2>
          
          <p className="text-zinc-300 mb-6">
            Você não possui permissão suficiente para acessar esta área do sistema.
          </p>
          
          {profile && (
            <div className="bg-zinc-700/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-zinc-400 mb-2">Seu nível de acesso:</p>
              <p className="text-blue-400 font-semibold">
                {profile.role === 'admin' ? 'Administrador' : 
                 profile.role === 'moderator' ? 'Moderador' : 
                 profile.role === 'user' ? 'Usuário' : 'Visualizador'}
              </p>
              {requiredRole && (
                <p className="text-sm text-zinc-500 mt-1">
                  Requerido: {requiredRole === 'admin' ? 'Administrador' : 
                            requiredRole === 'moderator' ? 'Moderador' : 
                            requiredRole === 'user' ? 'Usuário' : 'Visualizador'}
                </p>
              )}
            </div>
          )}
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Autorizado - renderizar conteúdo
  return <>{children}</>;
};

export default ProtectedRoute; 