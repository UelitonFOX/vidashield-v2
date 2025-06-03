import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { NotificationService } from './services/notificationService'
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
import PremiumLayout from './components/ui/PremiumLayout'
import PremiumHeader from './components/ui/PremiumHeader'
import SolicitarAcesso from './pages/SolicitarAcesso'

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

// Inicializar EmailJS para notificações por email
React.useEffect(() => {
  NotificationService.initializeEmailJS()
  console.log('🔧 Sistema de notificações por email inicializado')
}, [])

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
        
        {/* Páginas protegidas com controle de acesso - TODAS usando PremiumLayout */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <PremiumDashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Rota para solicitar acesso - SEM requiresApproval */}
        <Route 
          path="/solicitar-acesso" 
          element={
            <ProtectedRoute requiresApproval={false}>
              <SolicitarAcesso />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard-classic" 
          element={
            <ProtectedRoute>
              <PremiumLayout header={<PremiumHeader title="Dashboard Clássico" />}>
                <Dashboard />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/alertas" 
          element={
            <ProtectedRoute>
              <PremiumLayout header={<PremiumHeader title="Alertas" />}>
                <Alertas />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/monitoramento" 
          element={
            <ProtectedRoute>
              <PremiumLayout header={<PremiumHeader title="Monitoramento" />}>
                <Monitoramento />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/security" 
          element={
            <ProtectedRoute requiredRole="moderator">
              <PremiumLayout header={<PremiumHeader title="Painel de Segurança" />}>
                <SecurityDashboard />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/logs" 
          element={
            <ProtectedRoute requiredRole="moderator">
              <PremiumLayout header={<PremiumHeader title="Logs de Autenticação" />}>
                <LogsAutenticacao />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/threats" 
          element={
            <ProtectedRoute>
              <PremiumLayout header={<PremiumHeader title="Ameaças Detectadas" />}>
                <AmeacasDetectadas />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/blocked-ips" 
          element={
            <ProtectedRoute>
              <PremiumLayout header={<PremiumHeader title="IPs Bloqueados" />}>
                <IpsBloqueados />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PremiumLayout header={<PremiumHeader title="Gerenciamento de Usuários" />}>
                <GerenciamentoUsuarios />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/aprovacao-usuarios" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PremiumLayout header={<PremiumHeader title="Aprovação de Usuários" />}>
                <AprovacaoUsuarios />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/backups" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PremiumLayout header={<PremiumHeader title="Backups" />}>
                <Backups />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/access-control" 
          element={
            <ProtectedRoute requiredRole="admin">
              <PremiumLayout header={<PremiumHeader title="Controle de Acesso" />}>
                <AccessControl />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <PremiumLayout header={<PremiumHeader title="Relatórios" />}>
                <Reports />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/configuracoes" 
          element={
            <ProtectedRoute>
              <PremiumLayout header={<PremiumHeader title="Configurações" />}>
                <Settings />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <PremiumLayout header={<PremiumHeader title="Analytics" />}>
                <Analytics />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <PremiumLayout header={<PremiumHeader title="Perfil" />}>
                <Profile />
              </PremiumLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/help" 
          element={
            <ProtectedRoute>
              <PremiumLayout header={<PremiumHeader title="Ajuda" />}>
                <Help />
              </PremiumLayout>
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

        {/* Rotas temporárias para teste */}
        <Route path="/network" element={
          <ProtectedRoute>
            <PremiumLayout header={<PremiumHeader title="Monitoramento de Rede" />}>
              <TemporaryPage title="Monitoramento de Rede" />
            </PremiumLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/vulnerability" element={
          <ProtectedRoute>
            <PremiumLayout header={<PremiumHeader title="Análise de Vulnerabilidades" />}>
              <TemporaryPage title="Análise de Vulnerabilidades" />
            </PremiumLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/compliance" element={
          <ProtectedRoute>
            <PremiumLayout header={<PremiumHeader title="Compliance" />}>
              <TemporaryPage title="Compliance" />
            </PremiumLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </NotificationProvider>
  )
}

export default App 