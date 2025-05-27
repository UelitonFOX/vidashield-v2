import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Monitor, 
  Smartphone,
  Globe,
  Shield,
  Eye,
  Calendar,
  FileText,
  TrendingUp,
  User
} from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AuthLog {
  id: string
  email: string
  action: string
  ip_address: string
  user_agent: string
  country: string
  city: string
  device_type: string
  browser: string
  risk_score: number
  success: boolean
  created_at: string
  session_duration?: number
  failure_reason?: string
  metadata?: any
}

interface FilterState {
  search: string
  action: string
  dateFrom: string
  dateTo: string
  riskLevel: string
  success: string | null
}

const LogsAutenticacao: React.FC = () => {
  const [logs, setLogs] = useState<AuthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<AuthLog | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    action: '',
    dateFrom: '',
    dateTo: '',
    riskLevel: '',
    success: null
  })

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = logs.length
    const successful = logs.filter(log => log.success).length
    const failed = logs.filter(log => !log.success).length
    const suspicious = logs.filter(log => log.risk_score > 70).length
    const uniqueUsers = new Set(logs.map(log => log.email)).size
    const avgRiskScore = logs.length > 0 ? 
      Math.round(logs.reduce((acc, log) => acc + log.risk_score, 0) / logs.length) : 0

    return {
      total,
      successful,
      failed,
      suspicious,
      uniqueUsers,
      avgRiskScore,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0
    }
  }, [logs])

  // Buscar logs
  const fetchLogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('auth_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      const { data, error } = await query

      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Filtrar logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = 
        (log.email || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (log.ip_address || '').includes(filters.search) ||
        (log.city || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (log.country || '').toLowerCase().includes(filters.search.toLowerCase())

      const matchesAction = !filters.action || log.action === filters.action

      const logDate = new Date(log.created_at)
      const matchesDateFrom = !filters.dateFrom || logDate >= new Date(filters.dateFrom)
      const matchesDateTo = !filters.dateTo || logDate <= new Date(filters.dateTo)

      const matchesRiskLevel = !filters.riskLevel || (
        (filters.riskLevel === 'low' && log.risk_score <= 30) ||
        (filters.riskLevel === 'medium' && log.risk_score > 30 && log.risk_score <= 70) ||
        (filters.riskLevel === 'high' && log.risk_score > 70)
      )

      const matchesSuccess = filters.success === null || 
        (filters.success === 'true' && log.success) ||
        (filters.success === 'false' && !log.success)

      return matchesSearch && matchesAction && matchesDateFrom && 
             matchesDateTo && matchesRiskLevel && matchesSuccess
    })
  }, [logs, filters])

  // Ícones por ação
  const getActionIcon = (action: string, success: boolean) => {
    if (!success) return <XCircle className="w-4 h-4 text-red-400" />
    
    switch (action) {
      case 'login':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'logout':
        return <Clock className="w-4 h-4 text-blue-400" />
      case 'password_reset':
        return <Shield className="w-4 h-4 text-yellow-400" />
      default:
        return <User className="w-4 h-4 text-zinc-400" />
    }
  }

  // Cor por nível de risco
  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 30) return 'text-green-400 bg-green-500/20'
    if (riskScore <= 70) return 'text-yellow-400 bg-yellow-500/20'
    return 'text-red-400 bg-red-500/20'
  }

  // Exportar para CSV
  const exportToCSV = () => {
    if (filteredLogs.length === 0) {
      alert('Nenhum log para exportar')
      return
    }

    const csvData = filteredLogs.map(log => ({
      'Data/Hora': format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      'Email': log.email || '',
      'Ação': log.action || '',
      'Status': log.success ? 'Sucesso' : 'Falha',
      'IP': log.ip_address || '',
      'Localização': `${log.city || ''}, ${log.country || ''}`,
      'Dispositivo': log.device_type || '',
      'Navegador': log.browser || '',
      'Score de Risco': log.risk_score || 0
    }))

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n')

    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-autenticacao-${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Logs de Autenticação</h1>
          <p className="text-zinc-400">Monitore e analise todas as atividades de login do sistema</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-400">Total</span>
          </div>
          <p className="text-xl font-bold text-white">{stats.total}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-400">Sucessos</span>
          </div>
          <p className="text-xl font-bold text-green-400">{stats.successful}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-zinc-400">Falhas</span>
          </div>
          <p className="text-xl font-bold text-red-400">{stats.failed}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-zinc-400">Suspeitos</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{stats.suspicious}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-400">Usuários</span>
          </div>
          <p className="text-xl font-bold text-purple-400">{stats.uniqueUsers}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-zinc-400">Taxa Sucesso</span>
          </div>
          <p className="text-xl font-bold text-cyan-400">{stats.successRate}%</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-zinc-400">Risco Médio</span>
          </div>
          <p className="text-xl font-bold text-orange-400">{stats.avgRiskScore}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Busca */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Email, IP, localização..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
              />
            </div>
          </div>

          {/* Ação */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Ação
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              title="Filtrar por tipo de ação"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
            >
              <option value="">Todas</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="failed_login">Login Falhado</option>
              <option value="password_reset">Reset Senha</option>
            </select>
          </div>

          {/* Data From */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              title="Selecionar data inicial para filtro"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
            />
          </div>

          {/* Data To */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              title="Selecionar data final para filtro"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
            />
          </div>

          {/* Nível de Risco */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Nível de Risco
            </label>
            <select
              value={filters.riskLevel}
              onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}
              title="Filtrar por nível de risco"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
            >
              <option value="">Todos</option>
                             <option value="low">Baixo (≤30)</option>
               <option value="medium">Médio (31-70)</option>
               <option value="high">Alto (&gt;70)</option>
            </select>
          </div>
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-zinc-400">Filtros rápidos:</span>
          <button
            onClick={() => setFilters({ ...filters, success: 'false' })}
            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Apenas Falhas
          </button>
          <button
            onClick={() => setFilters({ ...filters, riskLevel: 'high' })}
            className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
          >
            Alto Risco
          </button>
          <button
            onClick={() => setFilters({
              search: '',
              action: '',
              dateFrom: '',
              dateTo: '',
              riskLevel: '',
              success: null
            })}
            className="px-3 py-1 text-xs bg-zinc-600 text-zinc-300 rounded-lg hover:bg-zinc-500 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-700/50 border-b border-zinc-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Ação
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  IP / Localização
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Risco
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 text-green-400 animate-spin" />
                      <span className="text-zinc-400">Carregando logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-zinc-400">
                    Nenhum log encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-700/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action, log.success)}
                        {log.risk_score > 70 && (
                          <AlertTriangle className="w-3 h-3 text-yellow-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {format(new Date(log.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                      <br />
                      <span className="text-xs text-zinc-500">
                        {format(new Date(log.created_at), 'HH:mm:ss', { locale: ptBR })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-white font-medium">{log.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        log.action === 'login' ? 'bg-green-500/20 text-green-400' :
                        log.action === 'logout' ? 'bg-blue-500/20 text-blue-400' :
                        log.action === 'failed_login' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {log.action === 'login' ? 'Login' :
                         log.action === 'logout' ? 'Logout' :
                         log.action === 'failed_login' ? 'Login Falhado' :
                         log.action === 'password_reset' ? 'Reset Senha' : log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-zinc-300">{log.ip_address}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {log.city}, {log.country}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1 text-zinc-300">
                        {log.device_type === 'Mobile' ? (
                          <Smartphone className="w-3 h-3" />
                        ) : (
                          <Monitor className="w-3 h-3" />
                        )}
                        {log.device_type}
                      </div>
                      <div className="text-xs text-zinc-500">{log.browser}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(log.risk_score)}`}>
                        {log.risk_score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedLog(log)
                        }}
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <div>
          Mostrando {filteredLogs.length} de {logs.length} logs
        </div>
        <div className="text-xs">
          Última atualização: {format(new Date(), 'HH:mm:ss', { locale: ptBR })}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-xl border border-zinc-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Detalhes do Log</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Status
                    </label>
                    <div className="flex items-center gap-2">
                      {getActionIcon(selectedLog.action, selectedLog.success)}
                      <span className={selectedLog.success ? 'text-green-400' : 'text-red-400'}>
                        {selectedLog.success ? 'Sucesso' : 'Falha'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Score de Risco
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(selectedLog.risk_score)}`}>
                      {selectedLog.risk_score}/100
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Email do Usuário
                  </label>
                  <p className="text-white">{selectedLog.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Data e Hora
                  </label>
                  <p className="text-white">
                    {format(new Date(selectedLog.created_at), 'dd/MM/yyyy às HH:mm:ss', { locale: ptBR })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Endereço IP
                    </label>
                    <p className="text-white font-mono">{selectedLog.ip_address}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Localização
                    </label>
                    <p className="text-white">{selectedLog.city}, {selectedLog.country}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Tipo de Dispositivo
                    </label>
                    <div className="flex items-center gap-2 text-white">
                      {selectedLog.device_type === 'Mobile' ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Monitor className="w-4 h-4" />
                      )}
                      {selectedLog.device_type}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Navegador
                    </label>
                    <p className="text-white">{selectedLog.browser}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    User Agent
                  </label>
                  <p className="text-white text-xs font-mono bg-zinc-700 p-2 rounded">
                    {selectedLog.user_agent}
                  </p>
                </div>

                {selectedLog.failure_reason && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Motivo da Falha
                    </label>
                    <p className="text-red-400">{selectedLog.failure_reason}</p>
                  </div>
                )}

                {selectedLog.session_duration && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Duração da Sessão
                    </label>
                    <p className="text-white">{Math.round(selectedLog.session_duration / 60)} minutos</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-zinc-700">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LogsAutenticacao 