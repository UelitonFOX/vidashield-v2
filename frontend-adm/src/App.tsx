import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'

// Contextos
import { ModalProvider } from './contexts/ModalContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Componente de Layout
import { MainLayout } from './layout/MainLayout'

// Importando todas as páginas do arquivo de índice
import {
  Dashboard,
  Login,
  AuthCallback,
  Alertas,
  Usuarios,
  LogsAcesso,
  Configuracoes,
  Ajuda,
  Estatisticas,
  Relatorios,
  Exportacoes,
  Documentacao
} from './pages';

// Componente de Layout que utiliza MainLayout com children
const LayoutWithOutlet = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

// Componente para proteger rotas que necessitam de autenticação
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Se estiver carregando, mostra uma mensagem ou spinner
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-900">
        <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-zinc-300">Carregando...</p>
      </div>
    );
  }
  
  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Se estiver autenticado, permite o acesso à rota protegida
  return <LayoutWithOutlet />;
};

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rota para callback de OAuth */}
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Rota raiz redireciona para o login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Rotas protegidas que requerem autenticação */}
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="alertas" element={<Alertas />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="logs" element={<LogsAcesso />} />
            <Route path="estatisticas" element={<Estatisticas />} />
            <Route path="relatorios" element={<Relatorios />} />
            <Route path="exportacoes" element={<Exportacoes />} />
            <Route path="documentacao" element={<Documentacao />} />
            <Route path="configuracoes" element={<Configuracoes />} />
            <Route path="ajuda" element={<Ajuda />} />
          </Route>
          
          {/* Rota curinga para capturar rotas desconhecidas e redirecionar para o Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ModalProvider>
    </AuthProvider>
  )
}

export default App
