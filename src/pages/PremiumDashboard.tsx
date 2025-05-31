import React from 'react'
import { Shield, Loader2, Target, TrendingUp, Users, AlertTriangle, Activity, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import PremiumLayout from '../components/ui/PremiumLayout'
import PremiumHeader from '../components/ui/PremiumHeader'
import PremiumSidebar from '../components/ui/PremiumSidebar'
import UserProfileCard from '../components/UserProfileCard'
import StatsCards from '../components/StatsCards'
import AccessChart from '../components/dashboard/AccessChart'
import AlertsWidget from '../components/AlertsWidget'
import AdvancedInsightsWidget from '../components/AdvancedInsightsWidget'
import SystemStatusCards from '../components/SystemStatusCards'
import NetworkMonitorWidget from '../components/NetworkMonitorWidget'
import ServerPerformance from '../components/ServerPerformance'
import SystemLogs from '../components/SystemLogs'
import LGPDComplianceWidget from '../components/dashboard/LGPDComplianceWidget'
import { LGPDConsentModal } from '../components/modals/LGPDConsentModal'
import { useLGPDConsent } from '../hooks/useLGPDConsent'
import { VidaWidget, VidaInnerCard, VidaScrollContainer, VidaEmptyState, VidaStatus } from '../components/ui/VidaShieldComponents'
import PremiumCircularChart from '../components/PremiumCircularChart'
import RealTimeMetrics from '../components/dashboard/charts/RealTimeMetrics'
import { useBlockedUsers } from '../hooks/useBlockedUsers'
import { useChartData } from '../hooks/useChartData'
import { useNotifications } from '../context/NotificationContext'

const PremiumDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { blockedIPs, totalBlocked, loading: loadingBlocked, error: errorBlocked } = useBlockedUsers()
  const { statsData, chartPeriod, onPeriodChange, loading: loadingChart } = useChartData()
  const { stats: notificationStats } = useNotifications()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = React.useState(false)
  const { needsConsent, markConsentGiven } = useLGPDConsent()

  // Dados Premium para Gráficos Circulares - Cores Vibrantes
  const threatDistribution = [
    { label: 'Malware', value: 156, color: '#ff4757', gradient: '#ff3838' },
    { label: 'Phishing', value: 89, color: '#ff7f50', gradient: '#ff6b35' },
    { label: 'Brute Force', value: 67, color: '#ffa502', gradient: '#ff9500' },
    { label: 'Scanner', value: 43, color: '#2ed573', gradient: '#1dd1a1' }
  ]

  const securityMetrics = [
    { label: 'Protegido', value: 847, color: '#00d2d3', gradient: '#01a3a4' },
    { label: 'Monitorando', value: 123, color: '#5352ed', gradient: '#3742fa' },
    { label: 'Alertas', value: 34, color: '#ff9ff3', gradient: '#f368e0' },
    { label: 'Crítico', value: 8, color: '#ff4757', gradient: '#ff3838' }
  ]

  const userAnalytics = [
    { label: 'Ativos', value: 234, color: '#a55eea', gradient: '#8854d0' },
    { label: 'Admins', value: 12, color: '#26de81', gradient: '#20bf6b' },
    { label: 'Moderadores', value: 28, color: '#fd79a8', gradient: '#e84393' },
    { label: 'Pendentes', value: 15, color: '#fdcb6e', gradient: '#e17055' }
  ]

  // Fechar resultados ao clicar em qualquer lugar
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showSearchResults) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showSearchResults])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Simulando busca em diferentes categorias
    const results: any[] = []
    
    // Buscar em IPs bloqueados
    const matchingIPs = blockedIPs.filter(ip => 
      ip.ip_address.includes(query) || 
      ip.reason.toLowerCase().includes(query.toLowerCase())
    )
    
    matchingIPs.forEach(ip => {
      results.push({
        type: 'blocked_ip',
        title: `IP Bloqueado: ${ip.ip_address}`,
        description: ip.reason,
        action: () => navigate('/security'),
        icon: Shield
      })
    })

    // Buscar em ações rápidas
    const matchingActions = quickActionCards.filter(card =>
      card.title.toLowerCase().includes(query.toLowerCase()) ||
      card.description.toLowerCase().includes(query.toLowerCase())
    )
    
    matchingActions.forEach(action => {
      results.push({
        type: 'quick_action',
        title: action.title,
        description: action.description,
        action: () => navigate(action.href),
        icon: action.icon
      })
    })

    // Buscar termos relacionados ao sistema
    const systemTerms = [
      { term: 'usuários', title: 'Gerenciamento de Usuários', description: 'Administrar usuários do sistema', href: '/usuarios' },
      { term: 'alertas', title: 'Central de Alertas', description: 'Monitorar alertas críticos', href: '/alertas' },
      { term: 'logs', title: 'Logs do Sistema', description: 'Visualizar logs de atividade', href: '/logs' },
      { term: 'configurações', title: 'Configurações', description: 'Ajustar configurações do sistema', href: '/configuracoes' },
      { term: 'perfil', title: 'Meu Perfil', description: 'Gerenciar perfil de usuário', href: '/perfil' },
      { term: 'dashboard', title: 'Dashboard', description: 'Painel principal', href: '/dashboard' },
      { term: 'segurança', title: 'Segurança Avançada', description: 'Monitoramento de segurança', href: '/security' }
    ]
    
    const matchingTerms = systemTerms.filter(term =>
      term.term.includes(query.toLowerCase()) ||
      term.title.toLowerCase().includes(query.toLowerCase())
    )
    
    matchingTerms.forEach(term => {
      results.push({
        type: 'system_feature',
        title: term.title,
        description: term.description,
        action: () => navigate(term.href),
        icon: Target
      })
    })

    setSearchResults(results.slice(0, 8)) // Limitar a 8 resultados
    setShowSearchResults(true)
  }

  const quickActionCards = [
    {
      title: 'Segurança Avançada',
      description: 'Monitoramento em tempo real e detecção de ameaças',
      icon: Target,
      color: 'from-green-500/10 to-green-600/10',
      href: '/security',
      badge: 'PRO'
    },
    {
      title: 'Alertas Críticos',
      description: `${notificationStats.critical} alertas críticos pendentes`,
      icon: AlertTriangle,
      color: 'from-red-500/10 to-red-600/10',
      href: '/alertas',
      badge: notificationStats.critical > 0 ? `${notificationStats.critical}` : undefined
    },
    {
      title: 'Atividade Recente',
      description: 'Logs de autenticação e eventos do sistema',
      icon: Activity,
      color: 'from-blue-500/10 to-blue-600/10',
      href: '/logs'
    },
    {
      title: 'Usuários Ativos',
      description: 'Gerenciamento de usuários e permissões',
      icon: Users,
      color: 'from-purple-500/10 to-purple-600/10',
      href: '/usuarios'
    }
  ]

  const systemMetrics = [
    {
      label: 'Sistema Online',
      value: '99.9%',
      icon: Zap,
      color: 'text-green-400',
      trend: '+0.1%'
    },
    {
      label: 'Ameaças Bloqueadas',
      value: totalBlocked.toString(),
      icon: Shield,
      color: 'text-red-400',
      trend: totalBlocked > 0 ? `+${totalBlocked}` : '0'
    },
    {
      label: 'Notificações',
      value: notificationStats.unread.toString(),
      icon: AlertTriangle,
      color: 'text-yellow-400',
      trend: notificationStats.unread > 0 ? `${notificationStats.unread} não lidas` : 'Todas lidas'
    }
  ]

  return (
    <PremiumLayout
      header={<PremiumHeader title="Dashboard Premium" onSearch={handleSearch} />}
      sidebar={<PremiumSidebar />}
    >
      {/* Search Results */}
      {showSearchResults && searchResults.length > 0 && (
        <div className="mb-6 bg-zinc-900/50 backdrop-blur-sm rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Resultados da busca: "{searchQuery}"
            </h3>
            <button
              onClick={() => setShowSearchResults(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={result.action}
                className="p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-700/50 transition-all duration-200 group"
              >
                <div className="flex items-start gap-3">
                  <result.icon className="w-5 h-5 text-green-400 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-white truncate">
                      {result.title}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {result.description}
                    </p>
                    <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded">
                      {result.type === 'blocked_ip' ? 'Segurança' : 
                       result.type === 'quick_action' ? 'Ação Rápida' : 'Sistema'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {searchQuery && searchResults.length === 0 && (
            <div className="text-center py-8 text-zinc-400">
              <p>Nenhum resultado encontrado para "{searchQuery}"</p>
              <p className="text-sm mt-2">Tente buscar por: usuários, alertas, logs, segurança</p>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-blue-500/5 rounded-2xl blur-xl" />
          
          <div className="relative p-8 bg-zinc-900/50 backdrop-blur-sm rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Bem-vindo ao VidaShield
                </h1>
                <p className="text-zinc-400">
                  Painel de controle avançado para segurança médica
                </p>
              </div>
              <div className="flex items-center gap-4">
                {systemMetrics.map((metric) => (
                  <div key={metric.label} className="text-center">
                    <div className="flex items-center gap-2 mb-1">
                      <metric.icon className={`w-5 h-5 ${metric.color}`} />
                      <span className="text-2xl font-bold text-white">{metric.value}</span>
                    </div>
                    <p className="text-xs text-zinc-400">{metric.label}</p>
                    <p className={`text-xs ${metric.color} flex items-center gap-1`}>
                      <TrendingUp className="w-3 h-3" />
                      {metric.trend}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActionCards.map((card) => (
                <div
                  key={card.title}
                  onClick={() => navigate(card.href)}
                  className={`relative p-4 bg-gradient-to-br ${card.color} rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <card.icon className="w-8 h-8 text-white drop-shadow-lg" />
                    {card.badge && (
                      <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-white font-semibold mb-1">{card.title}</h3>
                  <p className="text-white/80 text-sm">{card.description}</p>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile & Stats */}
          <div className="space-y-6">
            <UserProfileCard />
            <StatsCards />
          </div>
          
          {/* Chart & Alerts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Chart */}
            <div className="h-80">
              {loadingChart ? (
                <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6 h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-green-400 mx-auto mb-2" />
                    <p className="text-zinc-400 text-sm">Carregando atividade...</p>
                  </div>
                </div>
              ) : (
                <AccessChart 
                  statsData={statsData}
                  chartPeriod={chartPeriod}
                  onPeriodChange={onPeriodChange}
                />
              )}
            </div>

            {/* Alerts */}
            <AlertsWidget limit={5} />
          </div>
        </div>

        {/* Premium Analytics Section */}
        <div className="relative">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-green-500/5 rounded-2xl blur-xl" />
          
          <div className="relative bg-zinc-900/20 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  Analytics Premium
                </h2>
                <p className="text-sm text-zinc-400">Análise avançada em tempo real do sistema</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-400">Live</span>
              </div>
            </div>

            {/* Premium Charts Grid - Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Distribuição de Ameaças */}
              <PremiumCircularChart
                title="Distribuição de Ameaças"
                subtitle="Últimas 24 horas"
                data={threatDistribution}
                centerValue="355"
                centerText="TOTAL"
                trend="down"
                trendValue="-12.3%"
                size={180}
                strokeWidth={12}
              />

              {/* Status de Segurança */}
              <PremiumCircularChart
                title="Status de Segurança"
                subtitle="Score do sistema"
                data={securityMetrics}
                centerValue="84%"
                centerText="SCORE"
                trend="up"
                trendValue="+5.7%"
                size={180}
                strokeWidth={12}
              />

              {/* Analytics de Usuários */}
              <PremiumCircularChart
                title="Analytics de Usuários"
                subtitle="Distribuição por tipo"
                data={userAnalytics}
                centerValue="289"
                centerText="USUÁRIOS"
                trend="up"
                trendValue="+18"
                size={180}
                strokeWidth={12}
              />
            </div>

            {/* Live Stats Bar - Compacto */}
            <div className="mt-6 p-3 bg-gradient-to-r from-zinc-900/50 to-zinc-800/30 backdrop-blur-sm rounded-lg">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400 mb-0.5">99.7%</div>
                  <div className="text-xs text-zinc-400">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400 mb-0.5">2.3ms</div>
                  <div className="text-xs text-zinc-400">Latência</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400 mb-0.5">1.2K</div>
                  <div className="text-xs text-zinc-400">Online</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400 mb-0.5">45TB</div>
                  <div className="text-xs text-zinc-400">Dados</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400 mb-0.5">0</div>
                  <div className="text-xs text-zinc-400">Incidentes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-cyan-400 mb-0.5">24/7</div>
                  <div className="text-xs text-zinc-400">Monitor</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-zinc-900/30 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold text-white">Segurança do Sistema</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Blocked IPs */}
            <VidaWidget
              title="IPs Bloqueados"
              loading={loadingBlocked}
              error={errorBlocked ? 'Erro ao carregar dados de segurança' : null}
              fullHeight={true}
              actions={
                <VidaStatus 
                  status={totalBlocked > 0 ? 'warning' : 'online'}
                  text={`${totalBlocked} ${totalBlocked === 1 ? 'IP' : 'IPs'}`}
                />
              }
            >
              {totalBlocked === 0 ? (
                <VidaEmptyState
                  icon={<Shield />}
                  title="Sistema Protegido"
                  description="Nenhuma ameaça detectada. Seu sistema está seguro."
                />
              ) : (
                <div className="space-y-3 h-[480px] overflow-y-auto custom-scrollbar">
                  {blockedIPs.map((blocked) => (
                    <VidaInnerCard key={blocked.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-mono text-zinc-200">{blocked.ip_address}</span>
                        <span className={`text-xs ${blocked.ativo ? 'text-red-400' : 'text-yellow-400'}`}>
                          {blocked.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate">{blocked.reason}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-zinc-500">
                          {new Date(blocked.created_at).toLocaleDateString('pt-BR')}
                        </p>
                        <span className="text-xs text-zinc-500">
                          {blocked.attempts} tentativas
                        </span>
                      </div>
                    </VidaInnerCard>
                  ))}
                </div>
              )}
            </VidaWidget>

            {/* Advanced Insights */}
            <AdvancedInsightsWidget />

            {/* LGPD Compliance */}
            <LGPDComplianceWidget />
          </div>
        </div>

        {/* Real Time Metrics */}
        <RealTimeMetrics />

        {/* System Information */}
        <div className="bg-zinc-900/30 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Status do Sistema</h2>
          </div>

          <div className="space-y-6">
            <SystemStatusCards />
            <NetworkMonitorWidget />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ServerPerformance />
              <SystemLogs />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Consentimento LGPD */}
      <LGPDConsentModal
        isOpen={needsConsent}
        onClose={() => markConsentGiven()}
        onConsent={(accepted) => {
          markConsentGiven()
          if (accepted) {
            console.log('Usuário aceitou termos LGPD')
          }
        }}
        forced={true}
      />
    </PremiumLayout>
  )
}

export default PremiumDashboard 