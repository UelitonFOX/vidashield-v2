import React, { useState, useEffect } from 'react'
import { Shield, Users, FileText, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react'
import { LGPDService, LGPDStats } from '../../services/lgpdService'

const LGPDComplianceWidget: React.FC = () => {
  const [stats, setStats] = useState<LGPDStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLGPDStats()
  }, [])

  const loadLGPDStats = async () => {
    setLoading(true)
    try {
      const data = await LGPDService.getLGPDStats()
      setStats(data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas LGPD:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card-dark p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Compliance LGPD</h3>
            <p className="text-sm text-zinc-400">Carregando dados...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="card-dark p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Compliance LGPD</h3>
            <p className="text-sm text-red-400">Erro ao carregar dados</p>
          </div>
        </div>
      </div>
    )
  }

  const compliancePercentage = Math.round(stats.consent_rate * 100)

  return (
    <div className="card-dark p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Compliance LGPD</h3>
          <p className="text-sm text-zinc-400">Monitoramento de conformidade</p>
        </div>
      </div>

      {/* Compliance Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Taxa de Consentimento</span>
          <span className="text-lg font-bold text-green-400">{compliancePercentage}%</span>
        </div>
        <div className="w-full bg-zinc-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${compliancePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-400">Usuários</span>
          </div>
          <p className="text-lg font-semibold text-blue-400">{stats.total_users_with_consent}</p>
          <p className="text-xs text-zinc-500">com consentimento</p>
        </div>

        <div className="p-3 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-400">Solicitações</span>
          </div>
          <p className="text-lg font-semibold text-purple-400">{stats.total_data_requests}</p>
          <p className="text-xs text-zinc-500">total</p>
        </div>

        <div className="p-3 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-zinc-400">Pendentes</span>
          </div>
          <p className="text-lg font-semibold text-yellow-400">{stats.pending_requests}</p>
          <p className="text-xs text-zinc-500">aguardando</p>
        </div>

        <div className="p-3 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-zinc-400">Em Atraso</span>
          </div>
          <p className="text-lg font-semibold text-red-400">{stats.overdue_requests}</p>
          <p className="text-xs text-zinc-500">vencidas</p>
        </div>
      </div>

      {/* Request Types Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-300">Tipos de Solicitação</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Acesso aos Dados</span>
            <span className="text-xs font-medium text-blue-400">{stats.access_requests}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Portabilidade</span>
            <span className="text-xs font-medium text-green-400">{stats.portability_requests}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Correções</span>
            <span className="text-xs font-medium text-yellow-400">{stats.correction_requests}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Exclusões</span>
            <span className="text-xs font-medium text-red-400">{stats.deletion_requests}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-zinc-700">
        <div className="flex gap-2">
          <button 
            onClick={() => window.open('/meus-dados', '_blank')}
            className="flex-1 px-3 py-2 text-xs bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-green-300 transition-colors"
          >
            Portal LGPD
          </button>
          
          <button 
            onClick={loadLGPDStats}
            className="flex-1 px-3 py-2 text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-300 transition-colors"
          >
            Atualizar
          </button>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-4 flex items-center gap-2">
        {stats.overdue_requests > 0 ? (
          <>
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
            <span className="text-xs text-red-400">Atenção requerida</span>
          </>
        ) : stats.pending_requests > 0 ? (
          <>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <span className="text-xs text-yellow-400">Solicitações pendentes</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-xs text-green-400">Em conformidade</span>
          </>
        )}
      </div>
    </div>
  )
}

export default LGPDComplianceWidget 