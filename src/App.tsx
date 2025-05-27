import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PremiumDashboard from './pages/PremiumDashboard'
import Alertas from './pages/Alertas'
import Monitoramento from './pages/Monitoramento'
import SecurityDashboard from './pages/SecurityDashboard'
import LogsAutenticacao from './pages/LogsAutenticacao'
import AmeacasDetectadas from './pages/AmeacasDetectadas'
import IpsBloqueados from './pages/IpsBloqueados'
import GerenciamentoUsuarios from './pages/GerenciamentoUsuarios'
import AprovacaoUsuarios from './pages/AprovacaoUsuarios'
import Backups from './pages/Backups'
import AccessControl from './pages/AccessControl'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import Analytics from './pages/Analytics'
import Reports from './pages/Reports'
import Help from './pages/Help'
import MyDataPage from './pages/MyDataPage'
import Layout from './components/Layout'

import ProtectedRoute from './components/ProtectedRoute'
import { NotificationProvider } from './context/NotificationContext'
import { Shield } from 'lucide-react'

// Componentes temporários para as páginas que ainda não existem
const TemporaryPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <div className="bg-zinc-800 rounded-xl p-8 text-center border border-zinc-700">
      <h1 className="text-2xl font-bold text-green-300 mb-4">{title}</h1>
      <p className="text-zinc-400 mb-6">Esta página está em desenvolvimento e será implementada em breve.</p>
      <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
        <Shield className="w-4 h-4" />
        <span className="text-sm font-medium">Em construção</span>
      </div>
    </div>
  </div>
)

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Shield className="w-12 h-12 text-green-400 mx-auto" />
          </div>
          <p className="text-zinc-400">Carregando VidaShield...</p>
        </div>
      </div>
    )
  }

  return (
    <NotificationProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        
        {/* Páginas protegidas com controle de acesso */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PremiumDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard-classic" 
          element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/alertas" 
          element={
            <ProtectedRoute>
              <Layout><Alertas /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/monitoramento" 
          element={
            <ProtectedRoute>
              <Layout><Monitoramento /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/security" 
          element={
            <ProtectedRoute requiredRole="moderator">
              <Layout><SecurityDashboard /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/logs" 
          element={
            <ProtectedRoute requiredRole="moderator">
              <Layout><LogsAutenticacao /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/threats" 
          element={
            <ProtectedRoute>
              <Layout><AmeacasDetectadas /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/blocked-ips" 
          element={
            <ProtectedRoute>
              <Layout><IpsBloqueados /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout><GerenciamentoUsuarios /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/aprovacao-usuarios" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout><AprovacaoUsuarios /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/backups" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout><Backups /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/access-control" 
          element={
            <ProtectedRoute requiredRole="admin">
              <Layout><AccessControl /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/configuracoes" 
          element={
            <ProtectedRoute>
              <Layout><Settings /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Layout><Analytics /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <Layout><Profile /></Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/meus-dados" 
          element={
            <ProtectedRoute>
              <MyDataPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ajuda" 
          element={
            <ProtectedRoute>
              <Layout><Help /></Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/" 
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
    </NotificationProvider>
  )
}

export default App 