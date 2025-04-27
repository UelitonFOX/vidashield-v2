import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import { RecoverPassword } from './pages/RecoverPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Register } from './pages/Register';
import { OAuthCallback } from './pages/OAuthCallback';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import PermissionGuard from './components/PermissionGuard';
import AcessoNegado from './pages/AcessoNegado';
import { SystemPermissions } from './services/api/permissionService';

// Importação das novas páginas
import Users from './pages/Users';
import Logs from './pages/Logs';
import Alerts from './pages/Alerts';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';

// Componente para decidir se redireciona para dashboard ou home na rota raiz
const RootRedirect: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/recover" element={<RecoverPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth-callback" element={<OAuthCallback />} />
            
            {/* Rota raiz que decide para onde redirecionar */}
            <Route path="/" element={<RootRedirect />} />
            
            {/* Página de acesso negado */}
            <Route path="/acesso-negado" element={
              <PrivateRoute>
                <AcessoNegado />
              </PrivateRoute>
            } />
            
            {/* Rotas protegidas */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            {/* Rotas que requerem permissões específicas */}
            <Route path="/users" element={
              <PrivateRoute>
                <PermissionGuard requiredPermission={SystemPermissions.VIEW_USERS}>
                  <Users />
                </PermissionGuard>
              </PrivateRoute>
            } />
            
            <Route path="/logs" element={
              <PrivateRoute>
                <PermissionGuard requiredPermission={SystemPermissions.VIEW_LOGS}>
                  <Logs />
                </PermissionGuard>
              </PrivateRoute>
            } />
            
            <Route path="/alerts" element={
              <PrivateRoute>
                <PermissionGuard requiredPermission={SystemPermissions.VIEW_ALERTS}>
                  <Alerts />
                </PermissionGuard>
              </PrivateRoute>
            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            <Route path="/settings" element={
              <PrivateRoute>
                <PermissionGuard requiredPermission={SystemPermissions.VIEW_SETTINGS}>
                  <Settings />
                </PermissionGuard>
              </PrivateRoute>
            } />
            
            <Route path="/help" element={
              <PrivateRoute>
                <Help />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 