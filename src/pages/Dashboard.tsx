import React from 'react'
import { Shield, Users, AlertTriangle, Activity, TrendingUp, TrendingDown } from 'lucide-react'
import StatisticsWidget from '../components/StatisticsWidget'

const Dashboard: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-zinc-400">Visão geral do sistema de segurança</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Usuários Ativos */}
        <div className="card-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Usuários Ativos</p>
              <p className="text-2xl font-bold text-white">1,234</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">+12%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Alertas Críticos */}
        <div className="card-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Alertas Críticos</p>
              <p className="text-2xl font-bold text-white">23</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm">-5%</span>
              </div>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        {/* Sistemas Protegidos */}
        <div className="card-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Sistemas Protegidos</p>
              <p className="text-2xl font-bold text-white">45</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">+3</span>
              </div>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        {/* Status Geral */}
        <div className="card-dark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Status Geral</p>
              <p className="text-2xl font-bold text-green-400">Ativo</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-sm">Operacional</span>
              </div>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatisticsWidget />
        
        {/* Últimos Eventos */}
        <div className="card-dark">
          <h3 className="text-lg font-semibold text-white mb-4">Últimos Eventos</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-zinc-700/50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Tentativa de login suspeita</p>
                <p className="text-zinc-400 text-xs">IP: 192.168.1.100 - há 5 min</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-zinc-700/50 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Backup concluído com sucesso</p>
                <p className="text-zinc-400 text-xs">Sistema principal - há 15 min</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-zinc-700/50 rounded-lg">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-white text-sm">Firewall bloqueou conexão</p>
                <p className="text-zinc-400 text-xs">IP: 45.123.87.210 - há 1h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 