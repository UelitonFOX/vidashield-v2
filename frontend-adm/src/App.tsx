import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'
import { useAuth0 } from '@auth0/auth0-react';

// Contextos
import { ModalProvider } from './contexts/ModalContext'
import { AuthProvider } from './contexts/AuthContext.jsx'

// Componente de Layout
import { MainLayout } from './layout/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Callback from './pages/Callback'

// Componente simples para logout
const LogoutHandler = () => {
  const { logout } = useAuth0();
  
  useEffect(() => {
    console.log("Executando LogoutHandler");
    // Limpar estados básicos
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_in_progress');
    sessionStorage.removeItem('auth_token');
    
    // Limpar cookie de autenticação do Auth0
    document.cookie = 'auth0.is.authenticated=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Definir flag para indicar que acabamos de fazer logout
    sessionStorage.setItem('just_logged_out', 'true');
    
    // Fazer logout no Auth0 com redirecionamento correto
    logout({
      logoutParams: {
        returnTo: window.location.origin + '/login'
      }
    });
  }, [logout]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-zinc-300">Finalizando sessão...</p>
      </div>
    </div>
  );
};

// Carregamento lazy para todas as páginas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Alertas = lazy(() => import('./pages/Alertas'));
const Usuarios = lazy(() => import('./pages/Usuarios'));
const LogsAcesso = lazy(() => import('./pages/LogsAcesso'));
const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const Ajuda = lazy(() => import('./pages/Ajuda'));
const Estatisticas = lazy(() => import('./pages/Estatisticas'));
const Relatorios = lazy(() => import('./pages/Relatorios'));
const Exportacoes = lazy(() => import('./pages/Exportacoes'));
const Documentacao = lazy(() => import('./pages/Documentacao'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Componente de fallback para carregamento
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-zinc-300">Carregando...</p>
    </div>
  </div>
);

function App() {
  const { isLoading } = useAuth0();
  
  // Callback URL padrão configurado no Auth0
  const callbackUrl = import.meta.env.VITE_AUTH0_CALLBACK_URL || 
                      window.location.origin + '/auth-callback';
  
  // Extrair o caminho do callback para configurar as rotas
  const callbackPath = new URL(callbackUrl).pathname || '/auth-callback';
  
  // Log para debug
  console.log(`App inicializado, usando callback URL: ${callbackUrl}, path: ${callbackPath}`);

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <>
      <AuthProvider>
        <ModalProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            {/* Configurar todas as possíveis rotas de callback */}
            <Route path="/callback" element={<Callback />} />
            <Route path={callbackPath} element={<Callback />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/logout" element={<LogoutHandler />} />
            
            {/* Rota raiz - agora mostra a página de login em vez de redirecionar */}
            <Route path="/" element={<Login />} />
            
            {/* Rotas protegidas - usando MainLayout para garantir a sidebar */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            
            <Route path="/usuarios" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <Usuarios />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />

            <Route path="/user-profile" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <UserProfile />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />

            <Route path="/alertas" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <Alertas />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />

            <Route path="/logs" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <LogsAcesso />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />

            <Route path="/estatisticas" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <Estatisticas />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />

            <Route path="/relatorios" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <Relatorios />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />

            <Route path="/exportacoes" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <Exportacoes />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />

            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <Configuracoes />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />

            <Route path="/ajuda" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <Ajuda />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />

            <Route path="/documentacao" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout>
                    <Documentacao />
                  </MainLayout>
                </Suspense>
              </ProtectedRoute>
            } />
            
            {/* Página não encontrada */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ModalProvider>
      </AuthProvider>
    </>
  )
}

export default App
