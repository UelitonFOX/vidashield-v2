import React from 'react'
import { Shield, Users, AlertTriangle, Activity, TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react'
import StatisticsWidget from '../components/StatisticsWidget'
import SystemStatusCards from '../components/SystemStatusCards'
import StatsCards from '../components/StatsCards'

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Título da página */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-6 bg-green-400 rounded-full"></div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      </div>

      {/* Status do Sistema */}
      <div>
        <h2 className="text-lg font-semibold text-green-300 mb-4">Status do Sistema</h2>
        <SystemStatusCards />
      </div>

      {/* Cards de Estatísticas */}
      <div>
        <StatsCards />
      </div>

      {/* Grid inferior com gráficos e widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Acessos */}
        <div className="lg:col-span-2 bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Acessos - Últimos 7 dias
            </h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg border border-green-500/30">
                7D
              </button>
              <button className="px-3 py-1 bg-zinc-700 text-zinc-400 text-xs rounded-lg border border-zinc-600 hover:bg-zinc-600">
                15D
              </button>
              <button className="px-3 py-1 bg-zinc-700 text-zinc-400 text-xs rounded-lg border border-zinc-600 hover:bg-zinc-600">
                30D
              </button>
              <div className="flex items-center gap-1 ml-4">
                <BarChart3 className="w-4 h-4 text-zinc-400" />
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                <Calendar className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>
          
          {/* Placeholder para gráfico */}
          <div className="h-64 flex items-center justify-center bg-zinc-900/50 rounded-lg border border-zinc-700">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <p className="text-zinc-400 text-sm">Sem dados registrados neste período</p>
            </div>
          </div>
        </div>

        {/* Usuários Bloqueados */}
        <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Usuários Bloqueados
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-red-400 text-sm font-medium">0</span>
            </div>
          </div>
          
          <div className="text-center py-16">
            <p className="text-zinc-400 text-sm">Nenhum usuário bloqueado</p>
          </div>
        </div>
      </div>

      {/* Insights de Segurança */}
      <div className="bg-zinc-800/50 rounded-lg border border-zinc-700 p-6">
        <h3 className="text-lg font-semibold text-green-300 mb-4">Insights de Segurança</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium text-zinc-200">Sistema Seguro</span>
            </div>
            <p className="text-xs text-zinc-400">Nenhuma ameaça detectada nas últimas 24h</p>
          </div>

          <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm font-medium text-zinc-200">Backup Atualizado</span>
            </div>
            <p className="text-xs text-zinc-400">Último backup realizado hoje às 06:00</p>
          </div>

          <div className="p-4 bg-zinc-900/50 rounded-lg border border-zinc-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm font-medium text-zinc-200">Monitoramento Ativo</span>
            </div>
            <p className="text-xs text-zinc-400">Todos os endpoints estão sendo monitorados</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 