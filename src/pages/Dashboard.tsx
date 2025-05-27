import React from 'react'
import { Shield, Loader2, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import UserProfileCard from '../components/UserProfileCard'
import StatsCards from '../components/StatsCards'
import AccessChart from '../components/dashboard/AccessChart'
import AlertsWidget from '../components/AlertsWidget'
import AdvancedInsightsWidget from '../components/AdvancedInsightsWidget'
import SystemStatusCards from '../components/SystemStatusCards'
import NetworkMonitorWidget from '../components/NetworkMonitorWidget'
import ServerPerformance from '../components/ServerPerformance'
import SystemLogs from '../components/SystemLogs'
import { VidaWidget, VidaInnerCard, VidaScrollContainer, VidaEmptyState, VidaStatus } from '../components/ui/VidaShieldComponents'
import { useBlockedUsers } from '../hooks/useBlockedUsers'
import { useChartData } from '../hooks/useChartData'

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const { blockedIPs, totalBlocked, loading: loadingBlocked, error: errorBlocked } = useBlockedUsers()
  const { statsData, chartPeriod, onPeriodChange, loading: loadingChart } = useChartData()

  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-6 bg-green-400 rounded-full"></div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      {/* Seção Principal - Informações do Usuário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Perfil do Usuário */}
        <UserProfileCard />
        
        {/* Cards de Estatísticas Principais - 2 colunas */}
        <div className="lg:col-span-2">
          <StatsCards />
        </div>
      </div>

      {/* Grid principal - Alertas e Atividade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Acessos */}
        <div className="lg:col-span-2 h-80">
          {loadingChart ? (
            <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6 h-full flex items-center justify-center">
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

        {/* Alertas Recentes */}
        <AlertsWidget limit={5} />
      </div>

      {/* Segurança - IPs Bloqueados */}
      <VidaWidget
        title="Segurança - IPs Bloqueados"
        loading={loadingBlocked}
        error={errorBlocked ? 'Erro ao carregar dados de segurança' : null}
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
          <VidaScrollContainer maxHeight="max-h-64">
            {blockedIPs.map((blocked) => (
              <VidaInnerCard key={blocked.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono text-zinc-200">{blocked.ip_address}</span>
                  <span className={`text-xs ${blocked.expires_at ? 'text-yellow-400' : 'text-red-400'}`}>
                    {blocked.expires_at ? 'Bloqueio Temporário' : 'Bloqueio Permanente'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 truncate">{blocked.reason}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-zinc-500">
                    Bloqueado em: {new Date(blocked.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <span className="text-xs text-zinc-500">
                    {blocked.attempts} tentativas
                  </span>
                </div>
              </VidaInnerCard>
            ))}
          </VidaScrollContainer>
        )}
      </VidaWidget>

      {/* Insights Avançados */}
      <AdvancedInsightsWidget />

      {/* Card de Acesso Rápido - Segurança Avançada */}
      <div 
        onClick={() => navigate('/security')}
        className="p-6 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-green-400/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Target className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-green-300 mb-1">Segurança Avançada</h3>
              <p className="text-zinc-400 text-sm">
                Acesse logs de autenticação, detecção de ameaças e firewall dinâmico
              </p>
            </div>
          </div>
          <div className="text-green-400 opacity-60">
            <Target className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Seção Técnica - Informações do Sistema */}
      <div className="pt-6 border-t border-zinc-600/50">
        <h3 className="text-sm font-medium text-zinc-500 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>
          Informações Técnicas do Sistema
        </h3>
        
        <div className="space-y-4">
          {/* Status dos Serviços */}
          <div>
            <h4 className="text-xs font-medium text-zinc-600 mb-3">Status dos Serviços</h4>
            <SystemStatusCards />
          </div>
          
          {/* Monitoramento de Rede */}
          <div>
            <h4 className="text-xs font-medium text-zinc-600 mb-3">Rede</h4>
            <NetworkMonitorWidget />
          </div>
          
          {/* Métricas Técnicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ServerPerformance />
            <SystemLogs />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 