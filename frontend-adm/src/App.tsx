import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useSupabaseAuth } from './contexts/SupabaseAuthContext'

// Importações diretas (sem lazy) para componentes críticos
import SupabaseLogin from './pages/SupabaseLogin'
import SupabaseProtectedRoute from './components/SupabaseProtectedRoute'
import { MainLayout } from './layout/MainLayout'
import { ModalProvider } from './contexts/ModalContext'

// Componente de logout
const LogoutHandler = () => {
  const { signOut } = useSupabaseAuth()
  
  React.useEffect(() => {
    signOut().then(() => {
      window.location.href = '/login'
    })
  }, [signOut])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-zinc-300">Finalizando sessão...</p>
      </div>
    </div>
  )
}

// Carregamento lazy para todas as páginas
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Alertas = lazy(() => import('./pages/Alertas'))
const Usuarios = lazy(() => import('./pages/Usuarios'))
const LogsAcesso = lazy(() => import('./pages/LogsAcesso'))
const Configuracoes = lazy(() => import('./pages/Configuracoes'))
const Ajuda = lazy(() => import('./pages/Ajuda'))
const Estatisticas = lazy(() => import('./pages/Estatisticas'))
const Relatorios = lazy(() => import('./pages/Relatorios'))
const Exportacoes = lazy(() => import('./pages/Exportacoes'))
const Documentacao = lazy(() => import('./pages/Documentacao'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const NotFound = lazy(() => import('./pages/NotFound'))

// Componente de fallback para carregamento
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-zinc-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 text-zinc-300">Carregando...</p>
    </div>
  </div>
)

function App() {
  const { isLoading } = useSupabaseAuth()

  if (isLoading) {
    return <LoadingFallback />
  }

  return (
    <>
      <ModalProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<SupabaseLogin />} />
          <Route path="/logout" element={<LogoutHandler />} />
          
          {/* Rota raiz - agora mostra a página de login */}
          <Route path="/" element={<SupabaseLogin />} />
          
          {/* Rotas protegidas - usando MainLayout para garantir a sidebar */}
          <Route path="/dashboard" element={
            <SupabaseProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </Suspense>
            </SupabaseProtectedRoute>
          } />
          
          <Route path="/usuarios" element={
            <SupabaseProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout>
                  <Usuarios />
                </MainLayout>
              </Suspense>
            </SupabaseProtectedRoute>
          } />

          <Route path="/user-profile" element={
            <SupabaseProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout>
                  <UserProfile />
                </MainLayout>
              </Suspense>
            </SupabaseProtectedRoute>
          } />

          <Route path="/alertas" element={
            <SupabaseProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout>
                  <Alertas />
                </MainLayout>
              </Suspense>
            </SupabaseProtectedRoute>
          } />

          <Route path="/logs" element={
            <SupabaseProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout>
                  <LogsAcesso />
                </MainLayout>
              </Suspense>
            </SupabaseProtectedRoute>
          } />

          <Route path="/estatisticas" element={
            <SupabaseProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout>
                  <Estatisticas />
                </MainLayout>
              </Suspense>
            </SupabaseProtectedRoute>
          } />

          <Route path="/relatorios" element={
            <SupabaseProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout>
                  <Relatorios />
                </MainLayout>
              </Suspense>
            </SupabaseProtectedRoute>
          } />

          <Route path="/exportacoes" element={
            <SupabaseProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout>
                  <Exportacoes />
                </MainLayout>
              </Suspense>
            </SupabaseProtectedRoute>
          } />

          <Route path="/configuracoes" element={
            <SupabaseProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout>
                  <Configuracoes />
                </MainLayout>
              </Suspense>
            </SupabaseProtectedRoute>
          } />

          <Route path="/ajuda" element={
            <SupabaseProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout>
                  <Ajuda />
                </MainLayout>
              </Suspense>
            </SupabaseProtectedRoute>
          } />

          <Route path="/documentacao" element={
            <SupabaseProtectedRoute>
              <Suspense fallback={<LoadingFallback />}>
                <MainLayout>
                  <Documentacao />
                </MainLayout>
              </Suspense>
            </SupabaseProtectedRoute>
          } />
          
          {/* Página não encontrada */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ModalProvider>
    </>
  )
}

export default App
