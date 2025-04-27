import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { hasPermission, isAdmin } from '../services/api/permissionService';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

/**
 * Componente que protege o acesso a rotas ou componentes baseado nas permissões do usuário
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  requireAdmin = false,
  fallbackPath = '/acesso-negado'
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Se ainda está carregando, não mostrar nada
  if (loading) {
    return <div className="loading-container">
      <div className="spinner"></div>
      <p>Verificando permissões...</p>
    </div>;
  }
  
  // Se o usuário não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Se o usuário for admin, permitir acesso a tudo
  if (isAdmin(user)) {
    return <>{children}</>;
  }
  
  // Se precisar ser admin e não for, redirecionar
  if (requireAdmin) {
    return <Navigate to={fallbackPath} />;
  }
  
  // Se requer uma permissão específica e não tiver, redirecionar
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return <Navigate to={fallbackPath} />;
  }
  
  // Se passou por todas as verificações, renderizar o conteúdo
  return <>{children}</>;
};

export default PermissionGuard; 