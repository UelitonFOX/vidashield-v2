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
  Shield, 
  Eye,
  FileText,
  TrendingUp,
  Zap,
  Bug,
  Lock,
  Wifi,
  Database,
  Activity,
  AlertCircle,
  Play,
  Pause,
  CheckSquare
} from 'lucide-react'
import { supabase } from '../services/supabaseClient'
import { format, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Threat {
  id: string
  threat_type: string // Era 'tipo'
  status: 'detectado' | 'resolvido' | 'bloqueado' | 'investigando'
  severity: 'baixa' | 'media' | 'alta' | 'critica' // Era 'severidade'
  source_ip: string // Era 'ip_origem'
  description: string // Era 'descricao'
  created_at: string
  updated_at: string
  user_agent?: string
  metadata?: any
}

interface FilterState {
  search: string
  tipo: string
  severidade: string
  status: string
  dateFrom: string
  dateTo: string
}

const AmeacasDetectadas: React.FC = () => {
  const [threats, setThreats] = useState<Threat[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tipo: '',
    severidade: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  })

  // Função helper para formatar datas com segurança
  const formatSafeDate = (dateString?: string, formatStr: string = 'dd/MM/yyyy HH:mm:ss') => {
    if (!dateString) return 'Data inválida'
    
    const date = new Date(dateString)
    if (!isValid(date)) return 'Data inválida'
    
    try {
      return format(date, formatStr, { locale: ptBR })
    } catch (error) {
      return 'Data inválida'
    }
  }

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = threats.length
    const ativas = threats.filter(threat => threat.status === 'detectado').length
    const resolvidas = threats.filter(threat => threat.status === 'resolvido').length
    const criticas = threats.filter(threat => threat.severity === 'critica').length
    const investigando = threats.filter(threat => threat.status === 'investigando').length
    const altas = threats.filter(threat => threat.severity === 'alta').length
    const ipsUnicos = new Set(threats.map(threat => threat.source_ip)).size

    return {
      total,
      ativas,
      resolvidas,
      criticas,
      investigando,
      altas,
      ipsUnicos
    }
  }, [threats])

  // Buscar ameaças
  const fetchThreats = async () => {
    setLoading(true)
    try {
      console.log('🔍 Buscando ameaças na tabela threats...')
      const { data, error } = await supabase
        .from('threats')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) {
        console.error('❌ Erro na consulta threats:', error)
        throw error
      }
      
      console.log('✅ Ameaças encontradas:', data?.length || 0)
      console.log('📊 Dados retornados:', data)
      setThreats(data || [])
    } catch (error) {
      console.error('❌ Erro ao buscar ameaças:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThreats()
    
    // Debug: Testar se Supabase está configurado corretamente
    console.log('🔧 Debug Supabase cliente configurado:', !!supabase)
  }, [])

  // Filtrar ameaças
  const filteredThreats = useMemo(() => {
    return threats.filter(threat => {
      const matchesSearch = 
        (threat.threat_type || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (threat.description || '').toLowerCase().includes(filters.search.toLowerCase()) ||
        (threat.source_ip || '').includes(filters.search)

      const matchesTipo = !filters.tipo || threat.threat_type === filters.tipo
      const matchesSeveridade = !filters.severidade || threat.severity === filters.severidade
      const matchesStatus = !filters.status || threat.status === filters.status

      const threatDate = new Date(threat.created_at)
      const isValidThreatDate = isValid(threatDate)
      const matchesDateFrom = !filters.dateFrom || !isValidThreatDate || threatDate >= new Date(filters.dateFrom)
      const matchesDateTo = !filters.dateTo || !isValidThreatDate || threatDate <= new Date(filters.dateTo)

      return matchesSearch && matchesTipo && matchesSeveridade && 
             matchesStatus && matchesDateFrom && matchesDateTo
    })
  }, [threats, filters])

  // Ícones por tipo de ameaça
  const getThreatIcon = (threat_type?: string) => {
    if (!threat_type) return <Shield className="w-4 h-4" />
    
    switch (threat_type.toLowerCase()) {
      case 'sql injection':
        return <Database className="w-4 h-4" />
      case 'brute force attack':
        return <Lock className="w-4 h-4" />
      case 'ddos attack':
        return <Wifi className="w-4 h-4" />
      case 'port scanning':
        return <Activity className="w-4 h-4" />
      case 'malware':
        return <Bug className="w-4 h-4" />
      case 'phishing':
        return <AlertCircle className="w-4 h-4" />
      case 'xss attack':
        return <Bug className="w-4 h-4" />
      case 'data breach':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  // Cor por severidade
  const getSeverityColor = (severity?: string) => {
    if (!severity) return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30'
    
    switch (severity.toLowerCase()) {
      case 'critica':
        return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'alta':
        return 'text-orange-400 bg-orange-500/20 border-orange-500/30'
      case 'media':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'baixa':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      default:
        return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30'
    }
  }

  // Cor por status
  const getStatusColor = (status?: string) => {
    if (!status) return 'text-zinc-400 bg-zinc-500/20'
    
    switch (status.toLowerCase()) {
      case 'ativo':
        return 'text-red-400 bg-red-500/20'
      case 'investigando':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'resolvido':
        return 'text-green-400 bg-green-500/20'
      default:
        return 'text-zinc-400 bg-zinc-500/20'
    }
  }

  // Ações da ameaça
  const handleThreatAction = async (threatId: string, action: 'resolve' | 'investigate' | 'activate') => {
    setActionLoading(threatId)
    try {
      let updateData: Partial<Threat> = {}
      
      switch (action) {
        case 'resolve':
          updateData = { status: 'resolvido', updated_at: new Date().toISOString() }
          break
        case 'investigate':
          updateData = { status: 'investigando', updated_at: new Date().toISOString() }
          break
        case 'activate':
          updateData = { status: 'detectado', updated_at: new Date().toISOString() }
          break
      }

      const { error } = await supabase
        .from('threats')
        .update(updateData)
        .eq('id', threatId)

      if (error) throw error

      // Atualizar estado local
      setThreats(prev => prev.map(threat => 
        threat.id === threatId 
          ? { ...threat, ...updateData }
          : threat
      ))

      // Fechar modal se estiver aberto
      if (selectedThreat?.id === threatId) {
        setSelectedThreat(prev => prev ? { ...prev, ...updateData } : null)
      }

    } catch (error) {
      console.error('Erro ao atualizar ameaça:', error)
    } finally {
      setActionLoading(null)
    }
  }

  // Exportar para CSV
  const exportToCSV = () => {
    if (filteredThreats.length === 0) {
      alert('Nenhuma ameaça para exportar')
      return
    }

    const csvData = filteredThreats.map(threat => ({
      'Data/Hora': formatSafeDate(threat.created_at, 'dd/MM/yyyy HH:mm:ss'),
      'Tipo': threat.threat_type || '',
      'Severidade': threat.severity || '',
      'Status': threat.status || '',
      'IP Origem': threat.source_ip || '',
      'Descrição': threat.description || '',
      'Resolvido': threat.status === 'resolvido' ? 'Sim' : 'Não'
    }))

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n')

    const blob = new Blob([csvString], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ameacas-detectadas-${format(new Date(), 'yyyy-MM-dd')}.csv`
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
          <h1 className="text-2xl font-bold text-white mb-2">Ameaças Detectadas</h1>
          <p className="text-zinc-400">Monitore e gerencie todas as ameaças de segurança identificadas</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchThreats}
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
            <Zap className="w-4 h-4 text-red-400" />
            <span className="text-xs text-zinc-400">Ativas</span>
          </div>
          <p className="text-xl font-bold text-red-400">{stats.ativas}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-zinc-400">Resolvidas</span>
          </div>
          <p className="text-xl font-bold text-green-400">{stats.resolvidas}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-zinc-400">Críticas</span>
          </div>
          <p className="text-xl font-bold text-red-400">{stats.criticas}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-zinc-400">Investigando</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{stats.investigando}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-zinc-400">Alta Severidade</span>
          </div>
          <p className="text-xl font-bold text-orange-400">{stats.altas}</p>
        </div>

        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-400">IPs Únicos</span>
          </div>
          <p className="text-xl font-bold text-purple-400">{stats.ipsUnicos}</p>
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
                placeholder="Tipo, descrição, IP..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
              />
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Tipo
            </label>
            <select
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
              title="Filtrar por tipo de ameaça"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
            >
              <option value="">Todos</option>
              <option value="SQL Injection">SQL Injection</option>
              <option value="Brute Force Attack">Brute Force</option>
              <option value="DDoS Attempt">DDoS</option>
              <option value="Port Scanning">Port Scanning</option>
              <option value="Malware Upload">Malware</option>
            </select>
          </div>

          {/* Severidade */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Severidade
            </label>
            <select
              value={filters.severidade}
              onChange={(e) => setFilters({ ...filters, severidade: e.target.value })}
              title="Filtrar por nível de severidade"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
            >
              <option value="">Todas</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              title="Filtrar por status da ameaça"
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:border-green-400 focus:ring-1 focus:ring-green-400 transition-all"
            >
              <option value="">Todos</option>
              <option value="ativo">Ativo</option>
              <option value="investigando">Investigando</option>
              <option value="resolvido">Resolvido</option>
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
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-zinc-400">Filtros rápidos:</span>
          <button
            onClick={() => setFilters({ ...filters, status: 'ativo' })}
            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Apenas Ativas
          </button>
          <button
            onClick={() => setFilters({ ...filters, severidade: 'critica' })}
            className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Críticas
          </button>
          <button
            onClick={() => setFilters({ ...filters, status: 'investigando' })}
            className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/30 transition-colors"
          >
            Investigando
          </button>
          <button
            onClick={() => setFilters({
              search: '',
              tipo: '',
              severidade: '',
              status: '',
              dateFrom: '',
              dateTo: ''
            })}
            className="px-3 py-1 text-xs bg-zinc-600 text-zinc-300 rounded-lg hover:bg-zinc-500 transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* Tabela de Ameaças */}
      <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-700/50 border-b border-zinc-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Severidade
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  IP Origem
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 text-green-400 animate-spin" />
                      <span className="text-zinc-400">Carregando ameaças...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredThreats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-zinc-400">
                    Nenhuma ameaça encontrada com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredThreats.map((threat) => (
                  <tr
                    key={threat.id}
                    className="hover:bg-zinc-700/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedThreat(threat)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="text-green-400">
                          {getThreatIcon(threat.tipo)}
                        </div>
                        <span className="text-sm text-white font-medium">{threat.tipo || 'Desconhecido'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(threat.severidade)}`}>
                        {threat.severidade ? threat.severidade.charAt(0).toUpperCase() + threat.severidade.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(threat.status)}`}>
                        {threat.status ? threat.status.charAt(0).toUpperCase() + threat.status.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300">
                      {formatSafeDate(threat.data_detectada, 'dd/MM/yyyy')}
                      <br />
                      <span className="text-xs text-zinc-500">
                        {formatSafeDate(threat.data_detectada, 'HH:mm:ss')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-zinc-300 font-mono">{threat.ip_origem || 'N/A'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-300 max-w-xs truncate">
                      {threat.descricao || 'Sem descrição'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedThreat(threat)
                          }}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {threat.status !== 'resolvido' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleThreatAction(threat.id, 'resolve')
                            }}
                            disabled={actionLoading === threat.id}
                            className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                            title="Resolver ameaça"
                          >
                            <CheckSquare className="w-4 h-4" />
                          </button>
                        )}
                        
                        {threat.status === 'ativo' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleThreatAction(threat.id, 'investigate')
                            }}
                            disabled={actionLoading === threat.id}
                            className="text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
                            title="Investigar"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
          Mostrando {filteredThreats.length} de {threats.length} ameaças
        </div>
        <div className="text-xs">
          Última atualização: {format(new Date(), 'HH:mm:ss', { locale: ptBR })}
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-xl border border-zinc-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Detalhes da Ameaça</h3>
                <button
                  onClick={() => setSelectedThreat(null)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Tipo de Ameaça
                    </label>
                    <div className="flex items-center gap-2 text-white">
                      <div className="text-green-400">
                        {getThreatIcon(selectedThreat.tipo)}
                      </div>
                      {selectedThreat.tipo || 'Desconhecido'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Severidade
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedThreat.severidade)}`}>
                      {selectedThreat.severidade ? selectedThreat.severidade.charAt(0).toUpperCase() + selectedThreat.severidade.slice(1) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedThreat.status)}`}>
                      {selectedThreat.status ? selectedThreat.status.charAt(0).toUpperCase() + selectedThreat.status.slice(1) : 'N/A'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      Resolvido
                    </label>
                    <span className={selectedThreat.resolvido ? 'text-green-400' : 'text-red-400'}>
                      {selectedThreat.resolvido ? 'Sim' : 'Não'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Data de Detecção
                  </label>
                  <p className="text-white">
                    {formatSafeDate(selectedThreat.data_detectada, 'dd/MM/yyyy \'às\' HH:mm:ss')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    IP de Origem
                  </label>
                  <p className="text-white font-mono">{selectedThreat.ip_origem || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">
                    Descrição
                  </label>
                  <p className="text-white">{selectedThreat.descricao || 'Sem descrição'}</p>
                </div>

                {selectedThreat.user_agent && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">
                      User Agent
                    </label>
                    <p className="text-white text-xs font-mono bg-zinc-700 p-2 rounded">
                      {selectedThreat.user_agent}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-zinc-700">
                <div className="flex gap-2">
                  {selectedThreat.status !== 'resolvido' && (
                    <button
                      onClick={() => handleThreatAction(selectedThreat.id, 'resolve')}
                      disabled={actionLoading === selectedThreat.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Resolver
                    </button>
                  )}
                  
                  {selectedThreat.status === 'ativo' && (
                    <button
                      onClick={() => handleThreatAction(selectedThreat.id, 'investigate')}
                      disabled={actionLoading === selectedThreat.id}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      Investigar
                    </button>
                  )}
                  
                  {selectedThreat.status === 'resolvido' && (
                    <button
                      onClick={() => handleThreatAction(selectedThreat.id, 'activate')}
                      disabled={actionLoading === selectedThreat.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Reativar
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setSelectedThreat(null)}
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

export default AmeacasDetectadas 